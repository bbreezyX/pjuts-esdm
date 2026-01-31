"use client";

import { useEffect } from "react";
import type { LeafletLibrary, LeafletMap, LeafletLatLngBounds } from "@/types/leaflet";
import { MapPoint } from "@/types";

// ============================================
// TYPES
// ============================================

export interface UseMapBoundsOptions {
  /** Leaflet library reference */
  leafletRef: React.MutableRefObject<LeafletLibrary | null>;
  /** Map instance reference */
  mapRef: React.MutableRefObject<LeafletMap | null>;
  /** Whether map is ready */
  isReady: boolean;
  /** Points to fit bounds to */
  points: MapPoint[];
  /** Currently selected unit ID (skip auto-fit if selected) */
  selectedUnitId?: string | null;
  /** Padding around bounds */
  padding?: [number, number];
  /** Maximum zoom level when fitting */
  maxZoom?: number;
}

// ============================================
// COORDINATE VALIDATION
// ============================================

/**
 * Validates if a coordinate point is valid
 */
function isValidCoordinate(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Filters points with valid coordinates
 */
function filterValidPoints(points: MapPoint[]): MapPoint[] {
  return points.filter((p) => isValidCoordinate(p.latitude, p.longitude));
}

// ============================================
// HOOK: useMapBounds
// ============================================

/**
 * Hook to manage map bounds fitting
 * 
 * Handles:
 * - Fitting map to bounds of all points
 * - Skipping auto-fit when a unit is selected
 * - Filtering invalid coordinates
 * 
 * @example
 * ```tsx
 * useMapBounds({
 *   leafletRef,
 *   mapRef,
 *   isReady,
 *   points: filteredPoints,
 *   selectedUnitId: null,
 *   padding: [50, 50],
 *   maxZoom: 10,
 * });
 * ```
 */
export function useMapBounds({
  leafletRef,
  mapRef,
  isReady,
  points,
  selectedUnitId,
  padding = [50, 50],
  maxZoom = 10,
}: UseMapBoundsOptions): void {
  useEffect(() => {
    // Skip if not ready, no points, or unit is selected
    if (
      !isReady ||
      !mapRef.current ||
      !leafletRef.current ||
      points.length === 0 ||
      selectedUnitId // Skip auto-fit if a specific unit is selected
    ) {
      return;
    }

    try {
      const L = leafletRef.current;
      const map = mapRef.current;

      // Filter out points with invalid coordinates
      const validPoints = filterValidPoints(points);

      if (validPoints.length === 0) return;

      const bounds = L.latLngBounds(
        validPoints.map((p) => [p.latitude, p.longitude] as [number, number])
      ) as LeafletLatLngBounds;

      // Check if bounds are valid before fitting
      if (bounds && typeof bounds.isValid === "function" && bounds.isValid()) {
        map.fitBounds(bounds, { padding, maxZoom });
      }
    } catch (err) {
      console.error("Error fitting bounds:", err);
    }
  }, [points, isReady, selectedUnitId, padding, maxZoom, leafletRef, mapRef]);
}

// ============================================
// UTILITY EXPORTS
// ============================================

export { isValidCoordinate, filterValidPoints };
