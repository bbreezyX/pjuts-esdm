"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { uploadReportImage, processImage, deleteFromR2 } from "@/lib/r2";
import { submitReportSchema, type SubmitReportInput } from "@/lib/validations";
import { revalidatePath, revalidateTag } from "next/cache";
import { UnitStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface ReportData {
  id: string;
  unitId: string;
  imageUrl: string;
  batteryVoltage: number;
  latitude: number;
  longitude: number;
  notes: string | null;
  createdAt: Date;
  unit: {
    serialNumber: string;
    province: string;
    regency: string;
  };
  user: {
    name: string;
    email: string;
  };
}

// ============================================
// SUBMIT REPORT ACTION
// ============================================

/**
 * Submit a new field report with image upload to R2
 * 
 * @param formData - Multi-part form data containing:
 *   - unitId: The PJUTS unit being reported
 *   - latitude: GPS latitude from field device
 *   - longitude: GPS longitude from field device
 *   - batteryVoltage: Current battery voltage reading
 *   - notes: Optional notes from field worker
 *   - image: The captured photo file
 */
export async function submitReport(formData: FormData): Promise<ActionResult<ReportData>> {
  try {
    // 1. Authenticate user
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required. Please log in.",
      };
    }

    // 2. Extract form data
    const rawData = {
      unitId: formData.get("unitId") as string,
      latitude: parseFloat(formData.get("latitude") as string),
      longitude: parseFloat(formData.get("longitude") as string),
      batteryVoltage: parseFloat(formData.get("batteryVoltage") as string),
      notes: formData.get("notes") as string | undefined,
    };

    // 3. Validate with Zod schema (including geospatial bounds)
    const validationResult = submitReportSchema.safeParse(rawData);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Validation failed",
        errors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
      };
    }

    const validatedData: SubmitReportInput = validationResult.data;

    // 4. Verify the PJUTS unit exists
    const unit = await prisma.pjutsUnit.findUnique({
      where: { id: validatedData.unitId },
      select: {
        id: true,
        serialNumber: true,
        province: true,
        regency: true,
      },
    });

    if (!unit) {
      return {
        success: false,
        error: "PJUTS unit not found. Please check the unit ID.",
      };
    }

    // 5. Handle image upload
    const imageFile = formData.get("image") as File | null;
    if (!imageFile || imageFile.size === 0) {
      return {
        success: false,
        error: "Image is required. Please capture a photo.",
      };
    }

    // Validate image type and size
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(imageFile.type)) {
      return {
        success: false,
        error: "Invalid image type. Please use JPEG, PNG, or WebP.",
      };
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return {
        success: false,
        error: "Image too large. Maximum size is 10MB.",
      };
    }

    // 6. Process and upload image to R2
    const imageBuffer = Buffer.from(await imageFile.arrayBuffer());
    const processedImage = await processImage(imageBuffer);

    const uploadResult = await uploadReportImage(
      processedImage,
      "image/webp",
      unit.province,
      unit.serialNumber
    );

    if (!uploadResult.success || !uploadResult.url || !uploadResult.path) {
      return {
        success: false,
        error: uploadResult.error || "Failed to upload image. Please try again.",
      };
    }

    // 7. Create report in database
    const report = await prisma.report.create({
      data: {
        unitId: validatedData.unitId,
        imageUrl: uploadResult.url,
        imagePath: uploadResult.path,
        batteryVoltage: validatedData.batteryVoltage,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        notes: validatedData.notes || null,
        submittedBy: session.user.id,
      },
      include: {
        unit: {
          select: {
            serialNumber: true,
            province: true,
            regency: true,
          },
        },
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // 8. Update unit status based on battery voltage
    let newStatus: UnitStatus = UnitStatus.OPERATIONAL;
    if (validatedData.batteryVoltage < 10) {
      newStatus = UnitStatus.OFFLINE;
    } else if (validatedData.batteryVoltage < 20) {
      newStatus = UnitStatus.MAINTENANCE_NEEDED;
    }

    await prisma.pjutsUnit.update({
      where: { id: validatedData.unitId },
      data: { lastStatus: newStatus },
    });

    // 9. Revalidate cached data
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/map");

    // Invalidate cache tags for server-side caching
    revalidateTag("map-points");
    revalidateTag("dashboard-stats");
    revalidateTag("recent-activity");

    return {
      success: true,
      data: report as ReportData,
    };
  } catch (error) {
    console.error("Submit report error:", error);
    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    };
  }
}

// ============================================
// GET REPORTS ACTION
// ============================================

interface GetReportsOptions {
  page?: number;
  limit?: number;
  unitId?: string;
  province?: string;
  startDate?: Date;
  endDate?: Date;
}

export async function getReports(options: GetReportsOptions = {}): Promise<ActionResult<{
  reports: ReportData[];
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

    const { page = 1, limit = 20, unitId, province, startDate, endDate } = options;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (unitId) {
      where.unitId = unitId;
    }

    if (province) {
      where.unit = { province };
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = endDate;
      }
    }

    // If field staff, only show their own reports
    if (session.user.role === "FIELD_STAFF") {
      where.submittedBy = session.user.id;
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          unit: {
            select: {
              serialNumber: true,
              province: true,
              regency: true,
            },
          },
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.report.count({ where }),
    ]);

    return {
      success: true,
      data: {
        reports: reports as ReportData[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error("Get reports error:", error);
    return {
      success: false,
      error: "Failed to fetch reports",
    };
  }
}

// ============================================
// DELETE REPORT ACTION
// ============================================

export async function deleteReport(reportId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Only admins can delete reports
    if (session.user.role !== "ADMIN") {
      return {
        success: false,
        error: "Only administrators can delete reports",
      };
    }

    // Get report to find image path
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      select: { imagePath: true },
    });

    if (!report) {
      return {
        success: false,
        error: "Report not found",
      };
    }

    // Delete image from R2
    await deleteFromR2(report.imagePath);

    // Delete report from database
    await prisma.report.delete({
      where: { id: reportId },
    });

    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return { success: true };
  } catch (error) {
    console.error("Delete report error:", error);
    return {
      success: false,
      error: "Failed to delete report",
    };
  }
}

