"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendAccountDisabledEmail, sendAccountEnabledEmail } from "@/lib/email";

// ============================================
// TYPES & SCHEMAS
// ============================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface UserData {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
}

// Strong password requirements:
// - Minimum 8 characters
// - At least one uppercase letter
// - At least one lowercase letter
// - At least one number
const passwordSchema = z
  .string()
  .min(8, "Password minimal 8 karakter")
  .regex(/[a-z]/, "Password harus mengandung huruf kecil")
  .regex(/[A-Z]/, "Password harus mengandung huruf besar")
  .regex(/[0-9]/, "Password harus mengandung angka");

const createUserSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: passwordSchema,
  role: z.nativeEnum(Role),
});

const updateUserSchema = z.object({
  name: z.string().min(3, "Nama minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  password: passwordSchema.optional().or(z.literal("")),
  role: z.nativeEnum(Role),
});


// ============================================
// GET USERS
// ============================================

export async function getUsers(): Promise<ActionResult<UserData[]>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return { success: true, data: users };
  } catch (error) {
    console.error("Get users error:", error);
    return { success: false, error: "Gagal mengambil data pengguna" };
  }
}

// ============================================
// CREATE USER
// ============================================

export async function createUser(formData: FormData): Promise<ActionResult<UserData>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    const validation = createUserSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: "Validasi gagal",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { name, email, password, role } = validation.data;

    // Check duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: "Email sudah digunakan" };
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Create user error:", error);
    return { success: false, error: "Gagal membuat pengguna" };
  }
}

// ============================================
// UPDATE USER
// ============================================

export async function updateUser(userId: string, formData: FormData): Promise<ActionResult<UserData>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      role: formData.get("role"),
    };

    const validation = updateUserSchema.safeParse(rawData);
    if (!validation.success) {
      return {
        success: false,
        error: "Validasi gagal",
        errors: validation.error.flatten().fieldErrors,
      };
    }

    const { name, email, password, role } = validation.data;

    const dataToUpdate: any = { name, email, role };
    if (password && password.length >= 8) {
      dataToUpdate.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Update user error:", error);
    return { success: false, error: "Gagal mengupdate pengguna" };
  }
}

// ============================================
// DELETE USER
// ============================================

export async function deleteUser(userId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.id === userId) {
      return { success: false, error: "Tidak dapat menghapus akun sendiri" };
    }

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/users");
    return { success: true };
  } catch (error) {
    console.error("Delete user error:", error);
    return { success: false, error: "Gagal menghapus pengguna" };
  }
}

// ============================================
// TOGGLE USER STATUS (Enable/Disable)
// ============================================

export async function toggleUserStatus(userId: string): Promise<ActionResult<UserData>> {
  try {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") {
      return { success: false, error: "Unauthorized" };
    }

    // Prevent admin from disabling themselves
    if (session.user.id === userId) {
      return { success: false, error: "Tidak dapat menonaktifkan akun sendiri" };
    }

    // Get current user status
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { isActive: true, name: true, email: true },
    });

    if (!currentUser) {
      return { success: false, error: "Pengguna tidak ditemukan" };
    }

    // Toggle the status
    const newStatus = !currentUser.isActive;

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: newStatus },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Send email notification
    if (newStatus) {
      // Account enabled
      await sendAccountEnabledEmail({
        email: currentUser.email,
        name: currentUser.name,
      });
    } else {
      // Account disabled
      await sendAccountDisabledEmail({
        email: currentUser.email,
        name: currentUser.name,
      });
    }

    revalidatePath("/users");
    return { success: true, data: user };
  } catch (error) {
    console.error("Toggle user status error:", error);
    return { success: false, error: "Gagal mengubah status pengguna" };
  }
}
