"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { createPjutsUnitSchema, type CreatePjutsUnitInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Prisma, UnitStatus, Role } from "@prisma/client";
import { sendUnitNotificationToFieldStaff } from "@/lib/email";
import { type ActionResult } from "@/types";

// ============================================
// TYPES
// ============================================

export interface PjutsUnitData {
  id: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  province: string;
  regency: string;
  district: string | null;
  village: string | null;
  address: string | null;
  lastStatus: UnitStatus;
  installDate: Date | null;
  createdAt: Date;
  _count: {
    reports: number;
  };
}

// ============================================
// CREATE PJUTS UNIT
// ============================================

/**
 * Create a new PJUTS unit (Admin only)
 */
export async function createPjutsUnit(
  input: CreatePjutsUnitInput
): Promise<ActionResult<PjutsUnitData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Only admins can create units
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can create PJUTS units",
      };
    }

    // Validate input
    const validationResult = createPjutsUnitSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const validatedData = validationResult.data;

    // Check for duplicate serial number
    const existing = await prisma.pjutsUnit.findUnique({
      where: { serialNumber: validatedData.serialNumber },
    });

    if (existing) {
      return {
        success: false,
        error: `Unit with serial number ${validatedData.serialNumber} already exists`,
      };
    }

    // Create the unit
    const unit = await prisma.pjutsUnit.create({
      data: {
        serialNumber: validatedData.serialNumber,
        latitude: validatedData.latitude ?? 0,
        longitude: validatedData.longitude ?? 0,
        province: validatedData.province,
        regency: validatedData.regency,
        district: validatedData.district,
        village: validatedData.village,
        address: validatedData.address,
        lastStatus: UnitStatus.UNVERIFIED,
      },
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/units");
    revalidatePath("/map");

    // Send email notification to field staff
    // Note: We await this to ensure email is sent before serverless function terminates
    try {
      const fieldStaff = await prisma.user.findMany({
        where: { 
          role: Role.FIELD_STAFF,
          isActive: true,  // Only send to active users
        },
        select: { email: true, name: true },
      });
      
      const recipients = fieldStaff.map((f) => ({
        email: f.email,
        name: f.name || "Petugas Lapangan"
      }));
      
      if (recipients.length > 0) {
        const emailResult = await sendUnitNotificationToFieldStaff(recipients, {
          unitSerial: unit.serialNumber,
          unitProvince: unit.province,
          unitRegency: unit.regency,
          createdByName: session.user.name || "Admin",
        });
        
        if (!emailResult.success) {
          console.error("Failed to send unit notification email:", emailResult.error);
        }
      }
    } catch (emailError) {
      // Don't fail the unit creation if email fails
      console.error("Error preparing unit notification:", emailError);
    }

    return {
      success: true,
      data: unit as PjutsUnitData,
    };
  } catch (error) {
    console.error("Create unit error:", error);
    return {
      success: false,
      error: "Failed to create PJUTS unit",
    };
  }
}

// ============================================
// GET PJUTS UNITS
// ============================================

interface GetUnitsOptions {
  page?: number;
  limit?: number;
  province?: string;
  status?: UnitStatus;
  search?: string;
}

export async function getPjutsUnits(options: GetUnitsOptions = {}): Promise<ActionResult<{
  units: PjutsUnitData[];
  total: number;
  page: number;
  totalPages: number;
}>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const { page = 1, limit = 20, province, status, search } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PjutsUnitWhereInput = {};

    if (province) {
      where.province = province;
    }

    if (status) {
      where.lastStatus = status;
    }

    if (search) {
      where.OR = [
        { serialNumber: { contains: search, mode: "insensitive" } },
        { regency: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
        { address: { contains: search, mode: "insensitive" } },
      ];
    }

    const [units, total] = await Promise.all([
      prisma.pjutsUnit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { reports: true },
          },
        },
      }),
      prisma.pjutsUnit.count({ where }),
    ]);

    return {
      success: true,
      data: {
        units: units as PjutsUnitData[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get units error:", error);
    return {
      success: false,
      error: "Failed to fetch PJUTS units",
    };
  }
}

// ============================================
// UPDATE PJUTS UNIT
// ============================================

interface UpdateUnitInput {
  latitude?: number;
  longitude?: number;
  province?: string;
  regency?: string;
  district?: string;
  village?: string;
  address?: string;
  lastStatus?: UnitStatus;
}

export async function updatePjutsUnit(
  unitId: string,
  input: UpdateUnitInput
): Promise<ActionResult<PjutsUnitData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Only admins can update units
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can update PJUTS units",
      };
    }

    // Check if unit exists
    const existing = await prisma.pjutsUnit.findUnique({
      where: { id: unitId },
    });

    if (!existing) {
      return {
        success: false,
        error: "Unit not found",
      };
    }

    // Update the unit
    const unit = await prisma.pjutsUnit.update({
      where: { id: unitId },
      data: input,
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    revalidatePath("/dashboard");
    revalidatePath("/units");
    revalidatePath("/map");

    return {
      success: true,
      data: unit as PjutsUnitData,
    };
  } catch (error) {
    console.error("Update unit error:", error);
    return {
      success: false,
      error: "Failed to update PJUTS unit",
    };
  }
}

// ============================================
// DELETE PJUTS UNIT
// ============================================

export async function deletePjutsUnit(unitId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Only admins can delete units
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can delete PJUTS units",
      };
    }

    // Check if unit exists
    const existing = await prisma.pjutsUnit.findUnique({
      where: { id: unitId },
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    if (!existing) {
      return {
        success: false,
        error: "Unit not found",
      };
    }

    // Warn if unit has reports (cascade will delete them)
    if (existing._count.reports > 0) {
      console.warn(`Deleting unit ${unitId} with ${existing._count.reports} associated reports`);
    }

    // Delete the unit (cascade will handle reports)
    await prisma.pjutsUnit.delete({
      where: { id: unitId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/units");
    revalidatePath("/map");

    return { success: true };
  } catch (error) {
    console.error("Delete unit error:", error);
    return {
      success: false,
      error: "Failed to delete PJUTS unit",
    };
  }
}

// ============================================
// GET PROVINCES LIST
// ============================================

export async function getProvinces(): Promise<ActionResult<string[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const provinces = await prisma.pjutsUnit.findMany({
      select: { province: true },
      distinct: ["province"],
      orderBy: { province: "asc" },
    });

    return {
      success: true,
      data: provinces.map((p) => p.province),
    };
  } catch (error) {
    console.error("Get provinces error:", error);
    return {
      success: false,
      error: "Failed to fetch provinces",
    };
  }
}

