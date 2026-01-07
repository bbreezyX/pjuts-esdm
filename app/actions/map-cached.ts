"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { mapBoundsSchema, type MapBounds } from "@/lib/validations";
import { UnitStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDurations } from "@/lib/cache";

// ============================================
// TYPES
// ============================================

export interface MapPointLight {
    id: string;
    serialNumber: string;
    latitude: number;
    longitude: number;
    lastStatus: UnitStatus;
}

export interface MapPoint extends MapPointLight {
    province: string;
    regency: string;
    lastReport?: {
        id: string;
        imageUrl: string;
        batteryVoltage: number;
        createdAt: Date;
        user: string;
    };
}

export interface ActionResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

// ============================================
// OPTIMIZED: GET MAP POINTS (LIGHT VERSION)
// Only loads essential data for map markers
// ============================================

/**
 * Internal function to fetch lightweight map points
 */
async function fetchMapPointsLight(): Promise<MapPointLight[]> {
    // Only select essential fields for map rendering
    const units = await prisma.pjutsUnit.findMany({
        select: {
            id: true,
            serialNumber: true,
            latitude: true,
            longitude: true,
            lastStatus: true,
        },
        // Order by province for better clustering
        orderBy: { province: "asc" },
    });

    return units;
}

// Cached version - refreshes every 5 minutes
const getCachedMapPointsLight = unstable_cache(
    fetchMapPointsLight,
    ["map-points-light"],
    {
        revalidate: CacheDurations.MEDIUM,
        tags: [CacheTags.MAP_POINTS],
    }
);

/**
 * Get lightweight map points for initial render (CACHED)
 * Only includes essential data for markers
 */
export async function getMapPointsLight(): Promise<ActionResult<MapPointLight[]>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "Authentication required",
            };
        }

        const data = await getCachedMapPointsLight();
        return { success: true, data };
    } catch (error) {
        console.error("Get map points light error:", error);
        return {
            success: false,
            error: "Failed to fetch map points",
        };
    }
}

// ============================================
// PAGINATED: GET MAP POINTS WITH DETAILS
// For loading full details on demand
// ============================================

interface GetMapPointsOptions {
    bounds?: MapBounds;
    status?: UnitStatus;
    limit?: number;
    offset?: number;
}

/**
 * Get map points with optional filtering and pagination
 */
export async function getMapPointsPaginated(
    options: GetMapPointsOptions = {}
): Promise<ActionResult<{ points: MapPoint[]; total: number }>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "Authentication required",
            };
        }

        const { bounds, status, limit = 100, offset = 0 } = options;

        // Build where clause
        const where: Record<string, unknown> = {};

        if (bounds) {
            const validationResult = mapBoundsSchema.safeParse(bounds);
            if (!validationResult.success) {
                return {
                    success: false,
                    error: "Invalid map bounds",
                };
            }

            const { north, south, east, west } = validationResult.data;
            where.latitude = { gte: south, lte: north };
            where.longitude = { gte: west, lte: east };
        }

        if (status) {
            where.lastStatus = status;
        }

        // Execute queries in parallel
        const [units, total] = await Promise.all([
            prisma.pjutsUnit.findMany({
                where,
                skip: offset,
                take: limit,
                select: {
                    id: true,
                    serialNumber: true,
                    latitude: true,
                    longitude: true,
                    province: true,
                    regency: true,
                    lastStatus: true,
                    reports: {
                        take: 1,
                        orderBy: { createdAt: "desc" },
                        select: {
                            id: true,
                            imageUrl: true,
                            batteryVoltage: true,
                            createdAt: true,
                            user: {
                                select: { name: true },
                            },
                        },
                    },
                },
            }),
            prisma.pjutsUnit.count({ where }),
        ]);

        const points: MapPoint[] = units.map((unit) => ({
            id: unit.id,
            serialNumber: unit.serialNumber,
            latitude: unit.latitude,
            longitude: unit.longitude,
            province: unit.province,
            regency: unit.regency,
            lastStatus: unit.lastStatus,
            lastReport: unit.reports[0]
                ? {
                    id: unit.reports[0].id,
                    imageUrl: unit.reports[0].imageUrl,
                    batteryVoltage: unit.reports[0].batteryVoltage,
                    createdAt: unit.reports[0].createdAt,
                    user: unit.reports[0].user.name,
                }
                : undefined,
        }));

        return {
            success: true,
            data: { points, total },
        };
    } catch (error) {
        console.error("Get map points paginated error:", error);
        return {
            success: false,
            error: "Failed to fetch map points",
        };
    }
}

// ============================================
// OPTIMIZED: GET CLUSTER DATA
// ============================================

interface ClusterData {
    clusters: Array<{
        province: string;
        latitude: number;
        longitude: number;
        count: number;
        statusBreakdown: {
            operational: number;
            maintenanceNeeded: number;
            offline: number;
            unverified: number;
        };
    }>;
}

/**
 * Internal function to fetch cluster data
 */
async function fetchClusterData(): Promise<ClusterData> {
    // Single optimized query
    const provinceData = await prisma.pjutsUnit.groupBy({
        by: ["province", "lastStatus"],
        _count: { id: true },
        _avg: {
            latitude: true,
            longitude: true,
        },
    });

    // Aggregate by province
    const provinceMap = new Map<
        string,
        {
            count: number;
            latSum: number;
            lngSum: number;
            statusBreakdown: {
                operational: number;
                maintenanceNeeded: number;
                offline: number;
                unverified: number;
            };
        }
    >();

    for (const row of provinceData) {
        const existing = provinceMap.get(row.province) || {
            count: 0,
            latSum: 0,
            lngSum: 0,
            statusBreakdown: {
                operational: 0,
                maintenanceNeeded: 0,
                offline: 0,
                unverified: 0,
            },
        };

        existing.count += row._count.id;
        existing.latSum += (row._avg.latitude || 0) * row._count.id;
        existing.lngSum += (row._avg.longitude || 0) * row._count.id;

        switch (row.lastStatus) {
            case UnitStatus.OPERATIONAL:
                existing.statusBreakdown.operational += row._count.id;
                break;
            case UnitStatus.MAINTENANCE_NEEDED:
                existing.statusBreakdown.maintenanceNeeded += row._count.id;
                break;
            case UnitStatus.OFFLINE:
                existing.statusBreakdown.offline += row._count.id;
                break;
            case UnitStatus.UNVERIFIED:
                existing.statusBreakdown.unverified += row._count.id;
                break;
        }

        provinceMap.set(row.province, existing);
    }

    const clusters = Array.from(provinceMap.entries()).map(([province, data]) => ({
        province,
        latitude: data.latSum / data.count,
        longitude: data.lngSum / data.count,
        count: data.count,
        statusBreakdown: data.statusBreakdown,
    }));

    return { clusters };
}

// Cached version
const getCachedClusterData = unstable_cache(
    fetchClusterData,
    ["cluster-data"],
    {
        revalidate: CacheDurations.MEDIUM,
        tags: [CacheTags.MAP_POINTS],
    }
);

/**
 * Get clustered data for province-level map view (CACHED)
 */
export async function getClusterData(): Promise<ActionResult<ClusterData>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "Authentication required",
            };
        }

        const data = await getCachedClusterData();
        return { success: true, data };
    } catch (error) {
        console.error("Get cluster data error:", error);
        return {
            success: false,
            error: "Failed to fetch cluster data",
        };
    }
}

// ============================================
// ON-DEMAND: GET UNIT DETAIL (no caching needed)
// ============================================

/**
 * Get detailed information about a specific unit
 */
export async function getUnitDetail(unitId: string): Promise<ActionResult<{
    unit: {
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
    };
    recentReports: Array<{
        id: string;
        imageUrl: string;
        batteryVoltage: number;
        latitude: number;
        longitude: number;
        notes: string | null;
        createdAt: Date;
        user: string;
    }>;
    reportCount: number;
}>> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return {
                success: false,
                error: "Authentication required",
            };
        }

        const unit = await prisma.pjutsUnit.findUnique({
            where: { id: unitId },
            include: {
                reports: {
                    take: 5,
                    orderBy: { createdAt: "desc" },
                    include: {
                        user: {
                            select: { name: true },
                        },
                    },
                },
                _count: {
                    select: { reports: true },
                },
            },
        });

        if (!unit) {
            return {
                success: false,
                error: "Unit not found",
            };
        }

        return {
            success: true,
            data: {
                unit: {
                    id: unit.id,
                    serialNumber: unit.serialNumber,
                    latitude: unit.latitude,
                    longitude: unit.longitude,
                    province: unit.province,
                    regency: unit.regency,
                    district: unit.district,
                    village: unit.village,
                    address: unit.address,
                    lastStatus: unit.lastStatus,
                    installDate: unit.installDate,
                },
                recentReports: unit.reports.map((r) => ({
                    id: r.id,
                    imageUrl: r.imageUrl,
                    batteryVoltage: r.batteryVoltage,
                    latitude: r.latitude,
                    longitude: r.longitude,
                    notes: r.notes,
                    createdAt: r.createdAt,
                    user: r.user.name,
                })),
                reportCount: unit._count.reports,
            },
        };
    } catch (error) {
        console.error("Get unit detail error:", error);
        return {
            success: false,
            error: "Failed to fetch unit details",
        };
    }
}
