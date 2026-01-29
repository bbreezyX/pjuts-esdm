"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { UnitStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDurations } from "@/lib/cache";

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
    reportsLastMonth: number;
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
// OPTIMIZED & CACHED: GET DASHBOARD STATS
// ============================================

/**
 * Internal function that fetches dashboard stats (no auth check - for caching)
 */
async function fetchDashboardStats(): Promise<DashboardStats> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Execute all queries in parallel for performance
    const [
        totalUnits,
        operationalUnits,
        maintenanceNeeded,
        offlineUnits,
        unverifiedUnits,
        totalReports,
        reportsThisMonth,
        reportsLastMonth,
        reportsToday,
    ] = await Promise.all([
        prisma.pjutsUnit.count(),
        prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.OPERATIONAL } }),
        prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.MAINTENANCE_NEEDED } }),
        prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.OFFLINE } }),
        prisma.pjutsUnit.count({ where: { lastStatus: UnitStatus.UNVERIFIED } }),
        prisma.report.count(),
        prisma.report.count({ where: { createdAt: { gte: startOfMonth } } }),
        prisma.report.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lt: startOfMonth
                }
            }
        }),
        prisma.report.count({ where: { createdAt: { gte: startOfDay } } }),
    ]);

    return {
        totalUnits,
        operationalUnits,
        maintenanceNeeded,
        offlineUnits,
        unverifiedUnits,
        totalReports,
        reportsThisMonth,
        reportsLastMonth,
        reportsToday,
    };
}

// Cached version - refreshes every 60 seconds
const getCachedDashboardStats = unstable_cache(
    fetchDashboardStats,
    ["dashboard-stats"],
    {
        revalidate: CacheDurations.SHORT,
        tags: [CacheTags.DASHBOARD_STATS],
    }
);

/**
 * Get aggregated statistics for the dashboard (CACHED)
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

        const data = await getCachedDashboardStats();
        return { success: true, data };
    } catch (error) {
        console.error("Get dashboard stats error:", error);
        return {
            success: false,
            error: "Failed to fetch dashboard statistics",
        };
    }
}

// ============================================
// OPTIMIZED: GET STATS BY PROVINCE
// Uses single aggregated query instead of 3 queries
// ============================================

/**
 * Internal function to fetch province stats with optimized single query
 */
async function fetchStatsByProvince(): Promise<ProvinceStats[]> {
    // Single query with joins instead of 3 separate queries
    const provinceData = await prisma.$queryRaw<Array<{
        province: string;
        lastStatus: string;
        unit_count: bigint;
        report_count: bigint;
    }>>`
    SELECT 
      u."province",
      u."lastStatus",
      COUNT(DISTINCT u."id") as unit_count,
      COUNT(r."id") as report_count
    FROM "PjutsUnit" u
    LEFT JOIN "Report" r ON r."unitId" = u."id"
    GROUP BY u."province", u."lastStatus"
    ORDER BY u."province"
  `;

    // Efficiently aggregate into province stats
    const provinceMap = new Map<string, ProvinceStats>();

    for (const row of provinceData) {
        const existing = provinceMap.get(row.province) || {
            province: row.province,
            totalUnits: 0,
            operational: 0,
            maintenanceNeeded: 0,
            offline: 0,
            unverified: 0,
            totalReports: 0,
        };

        const unitCount = Number(row.unit_count);
        existing.totalUnits += unitCount;

        switch (row.lastStatus) {
            case "OPERATIONAL":
                existing.operational += unitCount;
                break;
            case "MAINTENANCE_NEEDED":
                existing.maintenanceNeeded += unitCount;
                break;
            case "OFFLINE":
                existing.offline += unitCount;
                break;
            case "UNVERIFIED":
                existing.unverified += unitCount;
                break;
        }

        // Only count reports once per province-status combo
        existing.totalReports += Number(row.report_count);
        provinceMap.set(row.province, existing);
    }

    // Sort by total units descending
    return Array.from(provinceMap.values()).sort(
        (a, b) => b.totalUnits - a.totalUnits
    );
}

// Cached version - refreshes every 5 minutes
const getCachedStatsByProvince = unstable_cache(
    fetchStatsByProvince,
    ["province-stats"],
    {
        revalidate: CacheDurations.MEDIUM,
        tags: [CacheTags.PROVINCE_STATS],
    }
);

/**
 * Get unit and report counts grouped by province (CACHED & OPTIMIZED)
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

        const data = await getCachedStatsByProvince();
        return { success: true, data };
    } catch (error) {
        console.error("Get stats by province error:", error);
        return {
            success: false,
            error: "Failed to fetch province statistics",
        };
    }
}

// ============================================
// OPTIMIZED: GET MONTHLY REPORT TREND
// Uses single query instead of 6 sequential queries
// ============================================

/**
 * Internal function to fetch monthly trend with single query
 */
async function fetchMonthlyReportTrend(months: number = 6): Promise<{
    labels: string[];
    data: number[];
}> {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);

    // Single query to get all monthly counts
    const monthlyCounts = await prisma.$queryRaw<Array<{
        month: Date;
        count: bigint;
    }>>`
    SELECT 
      DATE_TRUNC('month', "createdAt") as month,
      COUNT(*) as count
    FROM "Report"
    WHERE "createdAt" >= ${startDate}
    GROUP BY DATE_TRUNC('month', "createdAt")
    ORDER BY month ASC
  `;

    // Create a map for quick lookup
    const countMap = new Map<string, number>();
    for (const row of monthlyCounts) {
        const key = new Date(row.month).toISOString().slice(0, 7); // YYYY-MM format
        countMap.set(key, Number(row.count));
    }

    // Build arrays for the last N months
    const labels: string[] = [];
    const data: number[] = [];

    for (let i = months - 1; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = date.toISOString().slice(0, 7);

        labels.push(date.toLocaleDateString("id-ID", { month: "short", year: "numeric" }));
        data.push(countMap.get(key) || 0);
    }

    return { labels, data };
}

// Cached version - refreshes every 15 minutes
const getCachedMonthlyTrend = unstable_cache(
    () => fetchMonthlyReportTrend(6),
    ["monthly-trend"],
    {
        revalidate: CacheDurations.LONG,
        tags: [CacheTags.MONTHLY_TREND],
    }
);

/**
 * Get report counts for the last N months (CACHED & OPTIMIZED)
 */
export async function getMonthlyReportTrend(): Promise<ActionResult<{
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

        const data = await getCachedMonthlyTrend();
        return { success: true, data };
    } catch (error) {
        console.error("Get monthly trend error:", error);
        return {
            success: false,
            error: "Failed to fetch monthly trend",
        };
    }
}

// ============================================
// OPTIMIZED & CACHED: GET RECENT ACTIVITY
// ============================================

/**
 * Internal function to fetch recent activity (for caching)
 */
async function fetchRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const recentReports = await prisma.report.findMany({
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            createdAt: true,
            user: {
                select: { name: true },
            },
            unit: {
                select: { serialNumber: true, province: true },
            },
        },
    });

    return recentReports.map((report) => ({
        id: report.id,
        type: "report" as const,
        description: `Report submitted for ${report.unit.serialNumber}`,
        timestamp: report.createdAt,
        user: report.user.name,
        province: report.unit.province,
    }));
}

// Cached version - refreshes every 60 seconds
const getCachedRecentActivity = unstable_cache(
    () => fetchRecentActivity(10),
    ["recent-activity"],
    {
        revalidate: CacheDurations.SHORT,
        tags: [CacheTags.RECENT_ACTIVITY],
    }
);

/**
 * Get recent activity for the activity feed (CACHED)
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

        // Use cached version for default limit, otherwise fetch directly
        if (limit === 10) {
            const data = await getCachedRecentActivity();
            return { success: true, data };
        }

        // For custom limits, fetch directly (rare case)
        const data = await fetchRecentActivity(limit);
        return { success: true, data };
    } catch (error) {
        console.error("Get recent activity error:", error);
        return {
            success: false,
            error: "Failed to fetch recent activity",
        };
    }
}

// ============================================
// RECENT USERS FOR DASHBOARD DISPLAY
// ============================================

export interface DashboardUser {
    id: string;
    name: string;
    role: string;
}

/**
 * Internal function to fetch recent active users
 */
async function fetchRecentActiveUsers(limit: number = 5): Promise<DashboardUser[]> {
    const users = await prisma.user.findMany({
        where: { isActive: true },
        orderBy: { updatedAt: "desc" },
        take: limit,
        select: {
            id: true,
            name: true,
            role: true,
        },
    });

    return users;
}

// Cached version - refreshes every 5 minutes
const getCachedRecentUsers = unstable_cache(
    () => fetchRecentActiveUsers(5),
    ["recent-users"],
    {
        revalidate: CacheDurations.MEDIUM,
        tags: [CacheTags.DASHBOARD_STATS],
    }
);

/**
 * Get recent active users for dashboard display (avatars)
 */
export async function getRecentActiveUsers(limit: number = 5): Promise<ActionResult<DashboardUser[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "Authentication required",
            };
        }

        // Use cached version for default limit
        if (limit === 5) {
            const data = await getCachedRecentUsers();
            return { success: true, data };
        }

        const data = await fetchRecentActiveUsers(limit);
        return { success: true, data };
    } catch (error) {
        console.error("Get recent users error:", error);
        return {
            success: false,
            error: "Failed to fetch recent users",
        };
    }
}
