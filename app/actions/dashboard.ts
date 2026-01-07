"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { UnitStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface DashboardStats {
  totalUnits: number;
  operationalUnits: number;
  maintenanceNeeded: number;
  offlineUnits: number;
  unverifiedUnits: number;
  totalReports: number;
  reportsThisMonth: number;
  reportsToday: number;
}

export interface ProvinceStats {
  province: string;
  totalUnits: number;
  operational: number;
  maintenanceNeeded: number;
  offline: number;
  unverified: number;
  totalReports: number;
}

export interface RecentActivity {
  id: string;
  type: "report" | "unit_added" | "status_change";
  description: string;
  timestamp: Date;
  user: string;
  province?: string;
}

export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================
// GET DASHBOARD STATS
// ============================================

/**
 * Get aggregated statistics for the dashboard "at a glance" view
 */
export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get current date boundaries
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Execute all queries in parallel for performance
    const [
      totalUnits,
      operationalUnits,
      maintenanceNeeded,
      offlineUnits,
      unverifiedUnits,
      totalReports,
      reportsThisMonth,
      reportsToday,
    ] = await Promise.all([
      prisma.pjutsUnit.count(),
      prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.OPERATIONAL } }),
      prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.MAINTENANCE_NEEDED } }),
      prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.OFFLINE } }),
      prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.UNVERIFIED } }),
      prisma.report.count(),
      prisma.report.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.report.count({ where: { createdAt: { gte: startOfDay } } }),
    ]);

    return {
      success: true,
      data: {
        totalUnits,
        operationalUnits,
        maintenanceNeeded,
        offlineUnits,
        unverifiedUnits,
        totalReports,
        reportsThisMonth,
        reportsToday,
      },
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return {
      success: false,
      error: "Failed to fetch dashboard statistics",
    };
  }
}

// ============================================
// GET STATS BY PROVINCE
// ============================================

/**
 * Get unit and report counts grouped by province
 */
export async function getStatsByProvince(): Promise<ActionResult<ProvinceStats[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get all provinces with unit counts
    const provinceUnits = await prisma.pjutsUnit.groupBy({
      by: ["province", "lastStatus"],
      _count: {
        id: true,
      },
    });

    // Get report counts by province (through unit relation)
    const provinceReports = await prisma.report.groupBy({
      by: ["unitId"],
      _count: {
        id: true,
      },
    });

    // Get unit provinces for report counting
    const unitProvinces = await prisma.pjutsUnit.findMany({
      select: {
        id: true,
        province: true,
      },
    });

    // Create a map of unitId to province
    const unitProvinceMap = new Map(
      unitProvinces.map((u) => [u.id, u.province])
    );

    // Aggregate data by province
    const provinceMap = new Map<string, ProvinceStats>();

    // Initialize from unit data
    for (const row of provinceUnits) {
      const existing = provinceMap.get(row.province) || {
        province: row.province,
        totalUnits: 0,
        operational: 0,
        maintenanceNeeded: 0,
        offline: 0,
        unverified: 0,
        totalReports: 0,
      };

      existing.totalUnits += row._count.id;

      switch (row.lastStatus) {
        case UnitStatus.OPERATIONAL:
          existing.operational += row._count.id;
          break;
        case UnitStatus.MAINTENANCE_NEEDED:
          existing.maintenanceNeeded += row._count.id;
          break;
        case UnitStatus.OFFLINE:
          existing.offline += row._count.id;
          break;
        case UnitStatus.UNVERIFIED:
          existing.unverified += row._count.id;
          break;
      }

      provinceMap.set(row.province, existing);
    }

    // Add report counts
    for (const row of provinceReports) {
      const province = unitProvinceMap.get(row.unitId);
      if (province) {
        const existing = provinceMap.get(province);
        if (existing) {
          existing.totalReports += row._count.id;
        }
      }
    }

    // Sort by total units descending
    const stats = Array.from(provinceMap.values()).sort(
      (a, b) => b.totalUnits - a.totalUnits
    );

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Get stats by province error:", error);
    return {
      success: false,
      error: "Failed to fetch province statistics",
    };
  }
}

// ============================================
// GET RECENT ACTIVITY
// ============================================

/**
 * Get recent activity for the activity feed
 */
export async function getRecentActivity(limit: number = 10): Promise<ActionResult<RecentActivity[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get recent reports
    const recentReports = await prisma.report.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { name: true },
        },
        unit: {
          select: { serialNumber: true, province: true },
        },
      },
    });

    const activities: RecentActivity[] = recentReports.map((report) => ({
      id: report.id,
      type: "report" as const,
      description: `Report submitted for ${report.unit.serialNumber}`,
      timestamp: report.createdAt,
      user: report.user.name,
      province: report.unit.province,
    }));

    return {
      success: true,
      data: activities,
    };
  } catch (error) {
    console.error("Get recent activity error:", error);
    return {
      success: false,
      error: "Failed to fetch recent activity",
    };
  }
}

// ============================================
// GET MONTHLY REPORT TREND
// ============================================

/**
 * Get report counts for the last N months for trend charts
 */
export async function getMonthlyReportTrend(months: number = 6): Promise<ActionResult<{
  labels: string[];
  data: number[];
}>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const now = new Date();
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const startDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const endDate = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);

      const count = await prisma.report.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      labels.push(startDate.toLocaleDateString("id-ID", { month: "short", year: "numeric" }));
      data.push(count);
    }

    return {
      success: true,
      data: { labels, data },
    };
  } catch (error) {
    console.error("Get monthly trend error:", error);
    return {
      success: false,
      error: "Failed to fetch monthly trend",
    };
  }
}

