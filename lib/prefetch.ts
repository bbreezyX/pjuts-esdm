"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useTransition } from "react";
import { prefetchDashboard, prefetchMap } from "./swr";

/**
 * Smart prefetching utility
 * Prefetches route data when user hovers over navigation links
 */

// Track prefetched routes to avoid duplicate prefetching
const prefetchedRoutes = new Set<string>();

/**
 * Hook for prefetching route data on hover
 */
export function usePrefetch(route: string) {
  const router = useRouter();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const prefetch = useCallback(() => {
    // Don't prefetch if already done
    if (prefetchedRoutes.has(route)) return;

    // Start a delay to avoid prefetching on quick hover
    timeoutRef.current = setTimeout(() => {
      // Prefetch the route
      router.prefetch(route);
      
      // Also prefetch data for known routes
      switch (route) {
        case "/dashboard":
          prefetchDashboard();
          break;
        case "/map":
          prefetchMap();
          break;
      }
      
      prefetchedRoutes.add(route);
    }, 100);
  }, [route, router]);

  const cancelPrefetch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
    onMouseLeave: cancelPrefetch,
    onBlur: cancelPrefetch,
  };
}

/**
 * Hook for optimistic navigation with loading state
 */
export function useOptimisticNavigation() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const navigate = useCallback((href: string) => {
    startTransition(() => {
      router.push(href);
    });
  }, [router]);

  return { navigate, isPending };
}

/**
 * Prefetch multiple routes on mount
 */
export function usePrefetchRoutes(routes: string[]) {
  const router = useRouter();

  useEffect(() => {
    // Prefetch after a short delay to not block initial render
    const timeoutId = setTimeout(() => {
      routes.forEach((route) => {
        if (!prefetchedRoutes.has(route)) {
          router.prefetch(route);
          prefetchedRoutes.add(route);
        }
      });
    }, 2000);

    return () => clearTimeout(timeoutId);
  }, [routes, router]);
}

/**
 * Component that prefetches critical routes on mount
 */
export function PrefetchCriticalRoutes() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch after initial page load
    const timeoutId = setTimeout(() => {
      const criticalRoutes = ["/dashboard", "/map", "/units", "/reports"];
      
      criticalRoutes.forEach((route) => {
        if (!prefetchedRoutes.has(route)) {
          router.prefetch(route);
          prefetchedRoutes.add(route);
        }
      });

      // Also prefetch data
      prefetchDashboard().catch(() => {});
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [router]);

  return null;
}

/**
 * Clear prefetch cache (useful for logout)
 */
export function clearPrefetchCache() {
  prefetchedRoutes.clear();
}
