"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import {
  createPjutsUnitSchema,
  type CreatePjutsUnitInput,
  isValidCuid,
} from "@/lib/validations";
import { revalidatePath, updateTag } from "next/cache";
import { Prisma, UnitStatus, Role } from "@prisma/client";
import { sendUnitNotificationToFieldStaff } from "@/lib/email";
import { logUnitAudit } from "@/lib/audit";
import { ERROR_MESSAGES } from "@/lib/errors";
import { type ActionResult } from "@/types";
import { CacheTags } from "@/lib/cache";

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
  input: CreatePjutsUnitInput,
): Promise<ActionResult<PjutsUnitData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: ERROR_MESSAGES.AUTH_REQUIRED,
      };
    }

    // Only admins can create units
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: ERROR_MESSAGES.UNIT_ADMIN_ONLY,
      };
    }

    // Validate input
    const validationResult = createPjutsUnitSchema.safeParse(input);
    if (!validationResult.success) {
      return {
        success: false,
        error: ERROR_MESSAGES.VALIDATION_FAILED,
        errors: validationResult.error.flatten().fieldErrors as Record<
          string,
          string[]
        >,
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
        error: ERROR_MESSAGES.UNIT_EXISTS,
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

    // Log audit event
    await logUnitAudit("CREATE_UNIT", unit.id, session.user.id, {
      serialNumber: unit.serialNumber,
      province: unit.province,
      regency: unit.regency,
      latitude: unit.latitude,
      longitude: unit.longitude,
    });

    revalidatePath("/map");
    updateTag(CacheTags.DASHBOARD_STATS);
    updateTag(CacheTags.PROVINCE_STATS);
    updateTag(CacheTags.MAP_POINTS);

    // Send email notification to field staff
    // Note: We await this to ensure email is sent before serverless function terminates
    try {
      const fieldStaff = await prisma.user.findMany({
        where: {
          role: Role.FIELD_STAFF,
          isActive: true, // Only send to active users
        },
        select: { email: true, name: true },
      });

      const recipients = fieldStaff.map((f) => ({
        email: f.email,
        name: f.name || "Petugas Lapangan",
      }));

      if (recipients.length > 0) {
        const emailResult = await sendUnitNotificationToFieldStaff(recipients, {
          unitSerial: unit.serialNumber,
          unitProvince: unit.province,
          unitRegency: unit.regency,
          createdByName: session.user.name || "Admin",
        });

        if (!emailResult.success) {
          console.error(
            "Failed to send unit notification email:",
            emailResult.error,
          );
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
      error: ERROR_MESSAGES.UNIT_CREATE_FAILED,
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
  regency?: string;
  status?: UnitStatus;
  search?: string;
}

export async function getPjutsUnits(options: GetUnitsOptions = {}): Promise<
  ActionResult<{
    units: PjutsUnitData[];
    total: number;
    page: number;
    totalPages: number;
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: ERROR_MESSAGES.AUTH_REQUIRED,
      };
    }

    const { page = 1, limit = 20, province, regency, status, search } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PjutsUnitWhereInput = {};

    if (province) {
      where.province = province;
    }

    if (regency) {
      where.regency = regency;
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
      error: ERROR_MESSAGES.UNIT_FETCH_FAILED,
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
  input: UpdateUnitInput,
): Promise<ActionResult<PjutsUnitData>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: ERROR_MESSAGES.AUTH_REQUIRED,
      };
    }

    // Log the unitId being validated for debugging
    console.log("[UPDATE_UNIT] Attempting to update unit with ID:", unitId);
    console.log("[UPDATE_UNIT] ID length:", unitId?.length);
    console.log("[UPDATE_UNIT] ID type:", typeof unitId);

    // Validate unitId format - but be more lenient
    if (!unitId || typeof unitId !== "string" || unitId.trim() === "") {
      console.error("[UPDATE_UNIT] Invalid unitId: empty or not a string");
      return {
        success: false,
        error: "ID unit tidak valid (kosong atau format salah)",
      };
    }

    // Check CUID format but only warn, don't block
    const isValidCuidFormat = isValidCuid(unitId);
    if (!isValidCuidFormat) {
      console.warn("[UPDATE_UNIT] ID does not match CUID format:", unitId);
      console.warn("[UPDATE_UNIT] Expected format: c[a-z0-9]{24} (25 chars)");
      // Continue anyway - let database query determine if ID exists
    }

    // Only admins can update units
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: ERROR_MESSAGES.UNIT_ADMIN_ONLY,
      };
    }

    // Check if unit exists
    console.log("[UPDATE_UNIT] Querying database for unit:", unitId);
    const existing = await prisma.pjutsUnit.findUnique({
      where: { id: unitId },
    });

    if (!existing) {
      console.error("[UPDATE_UNIT] Unit not found in database:", unitId);
      console.error("[UPDATE_UNIT] This could mean:");
      console.error("  1. The ID doesn't exist in the database");
      console.error("  2. The ID format doesn't match what's stored");
      console.error("  3. Database connection issue");
      return {
        success: false,
        error: `Unit dengan ID ${unitId} tidak ditemukan di database. Pastikan unit masih ada dan ID benar.`,
      };
    }

    console.log("[UPDATE_UNIT] Found existing unit:", {
      id: existing.id,
      serialNumber: existing.serialNumber,
      province: existing.province,
      regency: existing.regency,
    });

    // Update the unit
    console.log("[UPDATE_UNIT] Updating unit with data:", input);
    const unit = await prisma.pjutsUnit.update({
      where: { id: unitId },
      data: input,
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    console.log("[UPDATE_UNIT] Unit updated successfully:", unit.serialNumber);

    // Log audit event
    await logUnitAudit("UPDATE_UNIT", unit.id, session.user.id, {
      serialNumber: unit.serialNumber,
      updatedFields: Object.keys(input),
      newValues: JSON.parse(JSON.stringify(input)),
    });

    revalidatePath("/map");
    revalidatePath("/units");
    updateTag(CacheTags.DASHBOARD_STATS);
    updateTag(CacheTags.PROVINCE_STATS);
    updateTag(CacheTags.MAP_POINTS);

    return {
      success: true,
      data: unit as PjutsUnitData,
    };
  } catch (error) {
    console.error("[UPDATE_UNIT] Error updating unit:", error);
    console.error("[UPDATE_UNIT] Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return {
      success: false,
      error: error instanceof Error 
        ? `Gagal memperbarui unit: ${error.message}` 
        : ERROR_MESSAGES.UNIT_UPDATE_FAILED,
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
        error: ERROR_MESSAGES.AUTH_REQUIRED,
      };
    }

    // Log the unitId being validated for debugging
    console.log("[DELETE_UNIT] Attempting to delete unit with ID:", unitId);
    console.log("[DELETE_UNIT] ID length:", unitId?.length);
    console.log("[DELETE_UNIT] ID type:", typeof unitId);

    // Validate unitId format - but be more lenient
    if (!unitId || typeof unitId !== "string" || unitId.trim() === "") {
      console.error("[DELETE_UNIT] Invalid unitId: empty or not a string");
      return {
        success: false,
        error: "ID unit tidak valid (kosong atau format salah)",
      };
    }

    // Check CUID format but only warn, don't block
    const isValidCuidFormat = isValidCuid(unitId);
    if (!isValidCuidFormat) {
      console.warn("[DELETE_UNIT] ID does not match CUID format:", unitId);
      console.warn("[DELETE_UNIT] Expected format: c[a-z0-9]{24} (25 chars)");
      // Continue anyway - let database query determine if ID exists
    }

    // Only admins can delete units
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: ERROR_MESSAGES.UNIT_ADMIN_ONLY,
      };
    }

    // Check if unit exists
    console.log("[DELETE_UNIT] Querying database for unit:", unitId);
    const existing = await prisma.pjutsUnit.findUnique({
      where: { id: unitId },
      include: {
        _count: {
          select: { reports: true },
        },
      },
    });

    if (!existing) {
      console.error("[DELETE_UNIT] Unit not found in database:", unitId);
      return {
        success: false,
        error: `Unit dengan ID ${unitId} tidak ditemukan di database.`,
      };
    }

    console.log("[DELETE_UNIT] Found unit to delete:", {
      id: existing.id,
      serialNumber: existing.serialNumber,
      reportCount: existing._count.reports,
    });

    // Warn if unit has reports (cascade will delete them)
    if (existing._count.reports > 0) {
      console.warn(
        `Deleting unit ${unitId} with ${existing._count.reports} associated reports`,
      );
    }

    // Delete the unit (cascade will handle reports)
    await prisma.pjutsUnit.delete({
      where: { id: unitId },
    });

    // Log audit event
    await logUnitAudit("DELETE_UNIT", unitId, session.user.id, {
      serialNumber: existing.serialNumber,
      province: existing.province,
      regency: existing.regency,
      reportsDeleted: existing._count.reports,
    });

    revalidatePath("/map");
    updateTag(CacheTags.DASHBOARD_STATS);
    updateTag(CacheTags.PROVINCE_STATS);
    updateTag(CacheTags.MAP_POINTS);

    return { success: true };
  } catch (error) {
    console.error("Delete unit error:", error);
    return {
      success: false,
      error: ERROR_MESSAGES.UNIT_DELETE_FAILED,
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
        error: ERROR_MESSAGES.AUTH_REQUIRED,
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
      error: ERROR_MESSAGES.PROVINCES_FETCH_FAILED,
    };
  }
}

// ============================================
// GET REGENCIES LIST
// ============================================

export async function getRegencies(): Promise<ActionResult<string[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: ERROR_MESSAGES.AUTH_REQUIRED,
      };
    }

    const regencies = await prisma.pjutsUnit.findMany({
      select: { regency: true },
      distinct: ["regency"],
      orderBy: { regency: "asc" },
    });

    return {
      success: true,
      data: regencies.map((r) => r.regency),
    };
  } catch (error) {
    console.error("Get regencies error:", error);
    return {
      success: false,
      error: "Gagal mengambil daftar kabupaten/kota",
    };
  }
}
// ============================================
// BULK CREATE PJUTS UNITS
// ============================================

export async function bulkCreateUnits(units: CreatePjutsUnitInput[]): Promise<
  ActionResult<{
    created: number;
    skipped: number;
    errors: {
      serialNumber?: string;
      error: string;
      details?: Record<string, string[] | undefined>;
    }[];
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return {
        success: false,
        error: ERROR_MESSAGES.UNIT_ADMIN_ONLY,
      };
    }

    let createdCount = 0;
    let skippedCount = 0;
    const errors: {
      serialNumber?: string;
      error: string;
      details?: Record<string, string[] | undefined>;
    }[] = [];

    // Process units in batches to avoid overwhelming the DB
    const BATCH_SIZE = 50;
    for (let i = 0; i < units.length; i += BATCH_SIZE) {
      const batch = units.slice(i, i + BATCH_SIZE);

      await Promise.all(
        batch.map(async (unitData) => {
          try {
            // Validate individual unit
            const validation = createPjutsUnitSchema.safeParse(unitData);
            if (!validation.success) {
              errors.push({
                serialNumber: unitData.serialNumber,
                error: "Validation failed",
                details: validation.error.flatten().fieldErrors,
              });
              skippedCount++;
              return;
            }

            // Check if serial number already exists
            const existing = await prisma.pjutsUnit.findUnique({
              where: { serialNumber: unitData.serialNumber },
            });

            if (existing) {
              skippedCount++;
              return;
            }

            // Create unit
            await prisma.pjutsUnit.create({
              data: {
                serialNumber: unitData.serialNumber,
                latitude: unitData.latitude ?? 0,
                longitude: unitData.longitude ?? 0,
                province: unitData.province,
                regency: unitData.regency,
                district: unitData.district,
                village: unitData.village,
                address: unitData.address,
                lastStatus: UnitStatus.UNVERIFIED,
              },
            });
            createdCount++;
          } catch (err: unknown) {
            const errorMessage =
              err instanceof Error ? err.message : "Unknown error";
            errors.push({
              serialNumber: unitData.serialNumber,
              error: errorMessage,
            });
            skippedCount++;
          }
        }),
      );
    }

    if (createdCount > 0) {
      revalidatePath("/map");
      updateTag(CacheTags.DASHBOARD_STATS);
      updateTag(CacheTags.PROVINCE_STATS);
      updateTag(CacheTags.MAP_POINTS);

      // Log audit
      await logUnitAudit("BULK_CREATE_UNIT", "BULK", session.user.id, {
        count: createdCount,
        skipped: skippedCount,
      });
    }

    return {
      success: true,
      data: {
        created: createdCount,
        skipped: skippedCount,
        errors,
      },
    };
  } catch (error) {
    console.error("Bulk create units error:", error);
    return {
      success: false,
      error: "Gagal memproses impor unit",
    };
  }
}
