"use server";

import { auth } from "@/lib/auth";
import prisma from "@/lib/db";
import { mapBoundsSchema, type MapBounds } from "@/lib/validations";
import { Prisma, UnitStatus } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { CacheTags, CacheDurations } from "@/lib/cache";
import { type ActionResult } from "@/types";

// ============================================
// TYPES
// ============================================

export interface MapPoint {
  id: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  province: string;
  regency: string;
  lastStatus: UnitStatus;
  lastReport?: {
    id: string;
    imageUrl: string;
    batteryVoltage: number;
    createdAt: Date;
    user: string;
  };
}

// ============================================
// GET MAP POINTS
// ============================================

/**
 * Internal function to fetch all map points (for caching)
 */
async function fetchAllMapPoints(): Promise<MapPoint[]> {
  const units = await prisma.pjutsUnit.findMany({
    where: {
      NOT: {
        AND: [{ latitude: 0 }, { longitude: 0 }],
      },
    },
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
          images: {
            take: 1,
            select: { url: true },
          },
          batteryVoltage: true,
          createdAt: true,
          user: {
            select: { name: true },
          },
        },
      },
    },
  });

  return units.map((unit) => ({
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
          imageUrl: unit.reports[0].images[0]?.url || "",
          batteryVoltage: unit.reports[0].batteryVoltage,
          createdAt: unit.reports[0].createdAt,
          user: unit.reports[0].user.name,
        }
      : undefined,
  }));
}

// Cached version - refreshes every 5 minutes
const getCachedMapPoints = unstable_cache(
  fetchAllMapPoints,
  ["map-points-full"],
  {
    revalidate: CacheDurations.MEDIUM,
    tags: [CacheTags.MAP_POINTS],
  },
);

/**
 * Get all PJUTS units as map points (CACHED)
 * Uses caching for better performance on initial load
 */
export async function getMapPointsCached(): Promise<ActionResult<MapPoint[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const data = await getCachedMapPoints();
    return { success: true, data };
  } catch (error) {
    console.error("Get cached map points error:", error);
    return {
      success: false,
      error: "Failed to fetch map points",
    };
  }
}

/**
 * Get all PJUTS units as map points (FRESH - no cache)
 * Always fetches fresh data from the database
 */
export async function getMapPointsFresh(): Promise<ActionResult<MapPoint[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const data = await fetchAllMapPoints();
    return { success: true, data };
  } catch (error) {
    console.error("Get fresh map points error:", error);
    return {
      success: false,
      error: "Failed to fetch map points",
    };
  }
}

/**
 * Get all PJUTS units as map points with optional bounds filtering
 *
 * @param bounds - Optional map bounds to filter visible units
 */
export async function getMapPoints(
  bounds?: MapBounds,
): Promise<ActionResult<MapPoint[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Always fetch fresh data to ensure accuracy
    if (!bounds) {
      return getMapPointsFresh();
    }

    // Build where clause for bounds filtering
    const where: Prisma.PjutsUnitWhereInput = {};

    // Validate bounds
    const validationResult = mapBoundsSchema.safeParse(bounds);
    if (!validationResult.success) {
      return {
        success: false,
        error: "Invalid map bounds",
      };
    }

    const { north, south, east, west } = validationResult.data;

    where.latitude = {
      gte: south,
      lte: north,
    };
    where.longitude = {
      gte: west,
      lte: east,
    };
    where.NOT = {
      AND: [{ latitude: 0 }, { longitude: 0 }],
    };

    // Fetch units with their latest report
    const units = await prisma.pjutsUnit.findMany({
      where,
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
            images: {
              take: 1,
              select: { url: true },
            },
            batteryVoltage: true,
            createdAt: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    // Transform to MapPoint format
    const mapPoints: MapPoint[] = units.map((unit) => ({
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
            imageUrl: unit.reports[0].images[0]?.url || "",
            batteryVoltage: unit.reports[0].batteryVoltage,
            createdAt: unit.reports[0].createdAt,
            user: unit.reports[0].user.name,
          }
        : undefined,
    }));

    return {
      success: true,
      data: mapPoints,
    };
  } catch (error) {
    console.error("Get map points error:", error);
    return {
      success: false,
      error: "Failed to fetch map points",
    };
  }
}

// ============================================
// GET UNITS BY STATUS
// ============================================

/**
 * Get map points filtered by status
 */
export async function getMapPointsByStatus(
  status: UnitStatus,
): Promise<ActionResult<MapPoint[]>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    const units = await prisma.pjutsUnit.findMany({
      where: {
        lastStatus: status,
        NOT: {
          AND: [{ latitude: 0 }, { longitude: 0 }],
        },
      },
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
            images: {
              take: 1,
              select: { url: true },
            },
            batteryVoltage: true,
            createdAt: true,
            user: {
              select: { name: true },
            },
          },
        },
      },
    });

    const mapPoints: MapPoint[] = units.map((unit) => ({
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
            imageUrl: unit.reports[0].images[0]?.url || "",
            batteryVoltage: unit.reports[0].batteryVoltage,
            createdAt: unit.reports[0].createdAt,
            user: unit.reports[0].user.name,
          }
        : undefined,
    }));

    return {
      success: true,
      data: mapPoints,
    };
  } catch (error) {
    console.error("Get map points by status error:", error);
    return {
      success: false,
      error: "Failed to fetch map points",
    };
  }
}

// ============================================
// GET UNIT DETAIL
// ============================================

/**
 * Get detailed information about a specific unit for the map popup
 */
export async function getUnitDetail(unitId: string): Promise<
  ActionResult<{
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
  }>
> {
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
            images: {
              take: 1,
              select: { url: true },
            },
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
          imageUrl: r.images[0]?.url || "",
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

// ============================================
// GET CLUSTER DATA
// ============================================

/**
 * Get clustered data for large scale map views
 */
export async function getClusterData(): Promise<
  ActionResult<{
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
  }>
> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return {
        success: false,
        error: "Authentication required",
      };
    }

    // Get aggregated data by province
    const provinceData = await prisma.pjutsUnit.groupBy({
      by: ["province", "lastStatus"],
      where: {
        NOT: {
          AND: [{ latitude: 0 }, { longitude: 0 }],
        },
      },
      _count: { id: true },
      _avg: {
        latitude: true,
        longitude: true,
      },
    });

    // Group by province and calculate center points
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

    const clusters = Array.from(provinceMap.entries()).map(
      ([province, data]) => ({
        province,
        latitude: data.latSum / data.count,
        longitude: data.lngSum / data.count,
        count: data.count,
        statusBreakdown: data.statusBreakdown,
      }),
    );

    return {
      success: true,
      data: { clusters },
    };
  } catch (error) {
    console.error("Get cluster data error:", error);
    return {
      success: false,
      error: "Failed to fetch cluster data",
    };
  }
}
