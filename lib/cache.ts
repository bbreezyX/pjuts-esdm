import { unstable_cache } from "next/cache";

/**
 * Cache tags for invalidation
 */
export const CacheTags = {
    DASHBOARD_STATS: "dashboard-stats",
    PROVINCE_STATS: "province-stats",
    MAP_POINTS: "map-points",
    RECENT_ACTIVITY: "recent-activity",
    MONTHLY_TREND: "monthly-trend",
} as const;

/**
 * Cache durations in seconds
 */
export const CacheDurations = {
    SHORT: 60,           // 1 minute - for frequently changing data
    MEDIUM: 300,         // 5 minutes - for dashboard stats
    LONG: 900,           // 15 minutes - for province aggregations
    VERY_LONG: 3600,     // 1 hour - for historical data
} as const;

/**
 * Helper to create cached server action
 */
export function createCachedAction<T>(
    action: () => Promise<T>,
    keyParts: string[],
    options: {
        revalidate?: number;
        tags?: string[];
    } = {}
) {
    return unstable_cache(
        action,
        keyParts,
        {
            revalidate: options.revalidate ?? CacheDurations.MEDIUM,
            tags: options.tags,
        }
    );
}
