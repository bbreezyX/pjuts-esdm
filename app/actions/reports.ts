"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { uploadReportImage, processImage, deleteFromR2 } from "@/lib/r2";
import { submitReportSchema, type SubmitReportInput } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { Prisma, UnitStatus, Role } from "@prisma/client";
import { sendReportNotificationToAdmins } from "@/lib/email";
import { type ActionResult } from "@/types";

// ============================================
// TYPES
// ============================================

export interface ReportData {
  id: string;
  unitId: string;
  imageUrl: string; // Maintain for backward compatibility (points to first image)
  images: {
    id: string;
    url: string;
  }[];
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
 * Submit a new field report with multiple image uploads to R2
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

    // 3. Validate with Zod schema
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
        lastStatus: true,
        installDate: true,
        latitude: true,
        longitude: true,
      },
    });

    if (!unit) {
      return {
        success: false,
        error: "PJUTS unit not found. Please check the unit ID.",
      };
    }

    // 5. Handle image uploads
    // We expect "images" key to have multiple files, but for backward compat also check "image"
    let imageFiles = formData.getAll("images") as File[];
    if (imageFiles.length === 0) {
      const singleImage = formData.get("image") as File | null;
      if (singleImage) imageFiles = [singleImage];
    }

    if (imageFiles.length === 0) {
      return {
        success: false,
        error: "At least one image is required.",
      };
    }

    if (imageFiles.length > 3) {
      return {
        success: false,
        error: "Maximum 3 images allowed per report.",
      };
    }

    // Filter out empty files
    imageFiles = imageFiles.filter(f => f.size > 0);
    if (imageFiles.length === 0) {
      return {
        success: false,
        error: "Invalid image files.",
      };
    }

    // Validate image types and sizes
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    for (const file of imageFiles) {
      if (!validTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid image type for ${file.name}. Please use JPEG, PNG, or WebP.`,
        };
      }
      if (file.size > 10 * 1024 * 1024) {
        return {
          success: false,
          error: `Image ${file.name} too large. Maximum size is 10MB.`,
        };
      }
    }

    // 6. Process and upload images to R2 in parallel
    const uploadPromises = imageFiles.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const processedImage = await processImage(buffer);

      return uploadReportImage(
        processedImage,
        "image/webp",
        unit.province,
        unit.serialNumber
      );
    });

    const uploadResults = await Promise.all(uploadPromises);

    // Check if any failed
    const failedUpload = uploadResults.find(r => !r.success);
    if (failedUpload) {
      // Cleanup any successful uploads
      await Promise.all(
        uploadResults
          .filter(r => r.success && r.path)
          .map(r => deleteFromR2(r.path!))
      );

      return {
        success: false,
        error: failedUpload.error || "Failed to upload one or more images.",
      };
    }

    // 7. Create report in database
    const report = await prisma.report.create({
      data: {
        unitId: validatedData.unitId,
        batteryVoltage: validatedData.batteryVoltage,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        notes: validatedData.notes || null,
        submittedBy: session.user.id,
        images: {
          create: uploadResults.map(r => ({
            url: r.url!,
            path: r.path!
          }))
        }
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
        images: {
          select: {
            id: true,
            url: true
          }
        }
      },
    });

    // 8. Update unit status based on battery voltage
    let newStatus: UnitStatus = UnitStatus.OPERATIONAL;
    if (validatedData.batteryVoltage < 10) {
      newStatus = UnitStatus.OFFLINE;
    } else if (validatedData.batteryVoltage < 20) {
      newStatus = UnitStatus.MAINTENANCE_NEEDED;
    }

    // Check if this is the first verification (unit was UNVERIFIED)
    // On first verification, we update: status, installDate, and coordinates
    const isFirstVerification = unit.lastStatus === UnitStatus.UNVERIFIED;
    
    // Check if unit has default/empty coordinates (0,0)
    const hasDefaultCoordinates = unit.latitude === 0 && unit.longitude === 0;
    
    await prisma.pjutsUnit.update({
      where: { id: validatedData.unitId },
      data: {
        lastStatus: newStatus,
        // Set installDate on first verification (when unit was UNVERIFIED)
        ...(isFirstVerification && !unit.installDate && { installDate: new Date() }),
        // Update coordinates on first verification OR if unit has default coordinates (0,0)
        ...((isFirstVerification || hasDefaultCoordinates) && {
          latitude: validatedData.latitude,
          longitude: validatedData.longitude,
        }),
      },
    });

    // 9. Revalidate cached data
    revalidatePath("/dashboard");
    revalidatePath("/reports");
    revalidatePath("/units");
    revalidatePath("/map");

    // 10. Send email notification to admins (non-blocking)
    try {
      const admins = await prisma.user.findMany({
        where: { role: Role.ADMIN },
        select: { email: true, name: true },
      });
      
      const recipients = admins.map((a) => ({
        email: a.email,
        name: a.name || "Admin"
      }));
      
      // Send notification in background (don't await to avoid slowing down response)
      sendReportNotificationToAdmins(recipients, {
        unitSerial: report.unit.serialNumber,
        unitProvince: report.unit.province,
        unitRegency: report.unit.regency,
        reporterName: report.user.name,
        batteryVoltage: validatedData.batteryVoltage,
        reportId: report.id,
      }).catch((err) => {
        console.error("Failed to send report notification email:", err);
      });
    } catch (emailError) {
      // Don't fail the report submission if email fails
      console.error("Error preparing report notification:", emailError);
    }

    // Format response to match ReportData interface
    const reportData: ReportData = {
      ...report,
      imageUrl: report.images[0]?.url || "",
    };

    return {
      success: true,
      data: reportData,
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
    const where: Prisma.ReportWhereInput = {};

    if (unitId) {
      where.unitId = unitId;
    }

    if (province) {
      where.unit = { province };
    }

    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      };
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
          images: {
            select: {
              id: true,
              url: true
            }
          }
        },
      }),
      prisma.report.count({ where }),
    ]);

    // Map to ReportData
    const mappedReports: ReportData[] = reports.map(r => ({
      ...r,
      imageUrl: r.images[0]?.url || "",
    }));

    return {
      success: true,
      data: {
        reports: mappedReports,
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

    // Get report to find image paths
    const report = await prisma.report.findUnique({
      where: { id: reportId },
      include: { images: true },
    });

    if (!report) {
      return {
        success: false,
        error: "Report not found",
      };
    }

    // Delete all images from R2
    await Promise.all(
      report.images.map(img => deleteFromR2(img.path))
    );

    // Delete report from database (Cascade will delete ReportImage records)
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

