"use client";

import { useEffect, useCallback, useMemo } from "react";
import type {
  LeafletLibrary,
  LeafletMap,
  LeafletLayerGroup,
  LeafletDivIcon,
} from "@/types/leaflet";
import { STATUS_COLORS } from "@/types/leaflet";
import { MapPoint } from "@/types";

// ============================================
// TYPES
// ============================================

export interface UseMapMarkersOptions {
  /** Leaflet library reference */
  leafletRef: React.MutableRefObject<LeafletLibrary | null>;
  /** Map instance reference */
  mapRef: React.MutableRefObject<LeafletMap | null>;
  /** Markers layer group reference */
  markersRef: React.MutableRefObject<LeafletLayerGroup | null>;
  /** Whether map is ready */
  isReady: boolean;
  /** All map points */
  points: MapPoint[];
  /** Filter by status */
  selectedStatus?: string | null;
  /** Currently selected unit ID */
  selectedUnitId?: string | null;
  /** Callback when a point is clicked */
  onPointClick?: (point: MapPoint) => void;
}

// ============================================
// MARKER ICON CREATOR
// ============================================

/**
 * Creates a custom marker icon with status-based styling
 */
function createMarkerIcon(
  L: LeafletLibrary,
  status: string,
  isSelected: boolean
): LeafletDivIcon | null {
  const baseColor =
    STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
    STATUS_COLORS.UNVERIFIED;

  const size = isSelected ? 60 : 40;
  const iconSize = isSelected ? 48 : 40;
  const pulseAnimation = isSelected
    ? `
      @keyframes pulse-ring {
        0% { transform: scale(0.33); opacity: 1; }
        80%, 100% { transform: scale(1); opacity: 0; }
      }
      .pulse-ring-${status} {
        animation: pulse-ring 2s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      }
    `
    : "";

  return L.divIcon({
    className: `custom-marker ${isSelected ? "selected-marker" : ""}`,
    html: `
      <style>
        ${pulseAnimation}
      </style>
      <div style="width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;position:relative;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
        ${
          isSelected
            ? `
        <div class="pulse-ring-${status}" style="position:absolute; inset:0; border-radius:50%; background:${baseColor}; opacity:0.4;"></div>
        <div class="pulse-ring-${status}" style="position:absolute; inset:-10px; border-radius:50%; border: 4px solid ${baseColor}; opacity:0.4; animation-delay: 0.5s;"></div>
        `
            : ""
        }
        <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" style="transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); ${isSelected ? "transform: scale(1.2);" : ""}" role="img" aria-label="${status} unit marker">
          <defs>
            <linearGradient id="grad-${status}-${isSelected}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:${baseColor};stop-opacity:1" />
              <stop offset="100%" style="stop-color:${baseColor};stop-opacity:0.8" />
            </linearGradient>
          </defs>
          <path fill="url(#grad-${status}-${isSelected})" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="${isSelected ? 4.5 : 3.5}" fill="white"/>
          ${isSelected ? `<circle cx="12" cy="9" r="2" fill="${baseColor}"/>` : ""}
        </svg>
        ${!isSelected ? `<div style="position:absolute;bottom:0px;left:50%;transform:translateX(-50%);width:10px;height:10px;background:${baseColor};border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${baseColor};"></div>` : ""}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

// ============================================
// HOOK: useMapMarkers
// ============================================

/**
 * Hook to manage map markers
 * 
 * Handles:
 * - Filtering points by status
 * - Creating and updating markers
 * - Handling marker selection and click events
 * - Flying to selected marker
 * 
 * @example
 * ```tsx
 * const { filteredPoints } = useMapMarkers({
 *   leafletRef,
 *   mapRef,
 *   markersRef,
 *   isReady,
 *   points,
 *   selectedStatus: "OPERATIONAL",
 *   selectedUnitId: "abc123",
 *   onPointClick: (point) => console.log(point),
 * });
 * ```
 */
export function useMapMarkers({
  leafletRef,
  mapRef,
  markersRef,
  isReady,
  points,
  selectedStatus,
  selectedUnitId,
  onPointClick,
}: UseMapMarkersOptions): { filteredPoints: MapPoint[] } {
  // Filtered points by status
  const filteredPoints = useMemo(() => {
    if (!selectedStatus) return points;
    return points.filter((p) => p.lastStatus === selectedStatus);
  }, [points, selectedStatus]);

  // Create icon callback
  const createIcon = useCallback(
    (status: string, isSelected: boolean) => {
      if (!leafletRef.current) return null;
      return createMarkerIcon(leafletRef.current, status, isSelected);
    },
    [leafletRef]
  );

  // Update markers
  useEffect(() => {
    if (!isReady || !markersRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const markers = markersRef.current;
    const map = mapRef.current;

    try {
      markers.clearLayers();

      filteredPoints.forEach((point) => {
        const isSelected = point.id === selectedUnitId;
        const icon = createIcon(point.lastStatus, isSelected);
        if (!icon) return;

        const marker = L.marker([point.latitude, point.longitude], { icon });

        if (isSelected) {
          marker.setZIndexOffset(1000);
        }

        marker.on("click", () => onPointClick?.(point));
        markers.addLayer(marker);

        // Fly to selected marker
        if (isSelected && map) {
          map.flyTo([point.latitude, point.longitude], 15, {
            animate: true,
            duration: 1.5,
          });
        }
      });
    } catch (err) {
      console.error("Error updating markers:", err);
    }
  }, [
    filteredPoints,
    isReady,
    createIcon,
    onPointClick,
    selectedUnitId,
    leafletRef,
    mapRef,
    markersRef,
  ]);

  return { filteredPoints };
}
