"use client";

import useSWR, { SWRConfiguration, mutate } from "swr";
import useSWRImmutable from "swr/immutable";

/**
 * Default SWR configuration optimized for this application
 */
export const defaultSWRConfig: SWRConfiguration = {
  revalidateOnFocus: false, // Don't refetch on window focus (data doesn't change that often)
  revalidateOnReconnect: true, // Refetch when reconnecting
  dedupingInterval: 5000, // Dedupe requests within 5 seconds
  errorRetryCount: 3, // Retry failed requests 3 times
  errorRetryInterval: 1000, // Wait 1 second between retries
  shouldRetryOnError: true,
};

/**
 * SWR configuration for data that rarely changes
 */
export const staticSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

/**
 * SWR configuration for frequently updated data
 */
export const realtimeSWRConfig: SWRConfiguration = {
  ...defaultSWRConfig,
  refreshInterval: 30000, // Refresh every 30 seconds
  revalidateOnFocus: true,
};

/**
 * Generic fetcher for server actions
 * Wraps server actions to work with SWR
 */
export function createServerActionFetcher<TArgs extends unknown[], TResult>(
  action: (...args: TArgs) => Promise<{ success: boolean; data?: TResult; error?: string }>
) {
  return async (...args: TArgs): Promise<TResult> => {
    const result = await action(...args);
    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to fetch data");
    }
    return result.data;
  };
}

/**
 * Hook for dashboard stats with SWR caching
 */
export function useDashboardStats() {
  return useSWR(
    "dashboard-stats",
    async () => {
      const { getDashboardStats } = await import("@/app/actions/dashboard");
      const result = await getDashboardStats();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    {
      ...defaultSWRConfig,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );
}

/**
 * Hook for province stats with SWR caching
 */
export function useProvinceStats() {
  return useSWR(
    "province-stats",
    async () => {
      const { getStatsByProvince } = await import("@/app/actions/dashboard");
      const result = await getStatsByProvince();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    {
      ...defaultSWRConfig,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );
}

/**
 * Hook for map points with SWR caching
 */
export function useMapPoints() {
  return useSWR(
    "map-points",
    async () => {
      const { getMapPointsCached } = await import("@/app/actions/map");
      const result = await getMapPointsCached();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    {
      ...defaultSWRConfig,
      dedupingInterval: 300000, // Cache for 5 minutes
    }
  );
}

/**
 * Hook for monthly trend with immutable caching (data doesn't change frequently)
 */
export function useMonthlyTrend() {
  return useSWRImmutable(
    "monthly-trend",
    async () => {
      const { getMonthlyReportTrend } = await import("@/app/actions/dashboard");
      const result = await getMonthlyReportTrend();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  );
}

/**
 * Hook for recent activity
 */
export function useRecentActivity(limit: number = 10) {
  return useSWR(
    ["recent-activity", limit],
    async () => {
      const { getRecentActivity } = await import("@/app/actions/dashboard");
      const result = await getRecentActivity(limit);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    {
      ...realtimeSWRConfig,
      refreshInterval: 60000, // Refresh every minute
    }
  );
}

/**
 * Hook for provinces list (static data)
 */
export function useProvinces() {
  return useSWRImmutable(
    "provinces",
    async () => {
      const { getProvinces } = await import("@/app/actions/units");
      const result = await getProvinces();
      if (!result.success) throw new Error(result.error);
      return result.data;
    }
  );
}

/**
 * Invalidate dashboard-related caches
 */
export function invalidateDashboardCache() {
  mutate("dashboard-stats");
  mutate("province-stats");
  mutate("monthly-trend");
  mutate("recent-activity");
}

/**
 * Invalidate map-related caches
 */
export function invalidateMapCache() {
  mutate("map-points");
}

/**
 * Invalidate all caches
 */
export function invalidateAllCaches() {
  invalidateDashboardCache();
  invalidateMapCache();
  mutate("provinces");
}

/**
 * Prefetch data for a route
 */
export async function prefetchDashboard() {
  const { getDashboardStats, getStatsByProvince, getMonthlyReportTrend, getRecentActivity } = await import("@/app/actions/dashboard");
  
  await Promise.allSettled([
    mutate("dashboard-stats", getDashboardStats().then(r => r.data)),
    mutate("province-stats", getStatsByProvince().then(r => r.data)),
    mutate("monthly-trend", getMonthlyReportTrend().then(r => r.data)),
    mutate("recent-activity", getRecentActivity(10).then(r => r.data)),
  ]);
}

export async function prefetchMap() {
  const { getMapPointsCached } = await import("@/app/actions/map");
  await mutate("map-points", getMapPointsCached().then(r => r.data));
}
