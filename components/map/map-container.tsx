"use client";

import { memo } from "react";
import { MapPoint } from "@/types";
import { useLeaflet, useMapLayers, useMapMarkers, useMapBounds } from "@/hooks";
import { type BaseLayerType, type OverlayType } from "./layer-switcher";
import { DEFAULT_CENTER, DEFAULT_ZOOM } from "@/types/leaflet";

// ============================================
// TYPES
// ============================================

interface MapContainerProps {
  points: MapPoint[];
  onPointClick?: (point: MapPoint) => void;
  selectedStatus?: string | null;
  center?: [number, number];
  zoom?: number;
  activeLayer?: BaseLayerType;
  activeOverlays?: OverlayType[];
  selectedUnitId?: string | null;
  bufferConfig?: {
    center: [number, number];
    radiusKm: number;
  } | null;
}

// ============================================
// SUB-COMPONENTS
// ============================================

function MapError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div
      className="w-full h-full rounded-xl bg-red-50 flex items-center justify-center"
      style={{ minHeight: "500px" }}
      role="alert"
      aria-live="assertive"
    >
      <div className="text-center">
        <svg
          className="w-12 h-12 mx-auto text-red-500 mb-2"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="text-sm text-red-600 font-medium">{message}</p>
        <button
          onClick={onRetry}
          className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Coba Lagi
        </button>
      </div>
    </div>
  );
}

function MapLoading() {
  return (
    <div
      className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"
      style={{ minHeight: "500px" }}
      role="status"
      aria-label="Memuat peta"
    >
      <div className="text-center">
        <div
          className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin mx-auto mb-2"
          aria-hidden="true"
        />
        <p className="text-sm text-slate-500">Memuat peta...</p>
      </div>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

function MapContainerComponent({
  points,
  onPointClick,
  selectedStatus,
  selectedUnitId,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  activeLayer = "openstreetmap",
  activeOverlays = [],
  bufferConfig = null,
}: MapContainerProps) {
  // Initialize Leaflet and map
  const {
    leafletRef,
    mapRef,
    markersRef,
    containerRef,
    tileLayerRef,
    overlayLayersRef,
    bufferCircleRef,
    isLoaded,
    isReady,
    error,
  } = useLeaflet({ center, zoom, activeLayer });

  // Manage map layers (base layer, overlays, buffer)
  useMapLayers({
    leafletRef,
    mapRef,
    tileLayerRef,
    overlayLayersRef,
    bufferCircleRef,
    isReady,
    activeLayer,
    activeOverlays,
    bufferConfig,
  });

  // Manage markers
  const { filteredPoints } = useMapMarkers({
    leafletRef,
    mapRef,
    markersRef,
    isReady,
    points,
    selectedStatus,
    selectedUnitId,
    onPointClick,
  });

  // Manage map bounds
  useMapBounds({
    leafletRef,
    mapRef,
    isReady,
    points: filteredPoints,
    selectedUnitId,
  });

  // Error state
  if (error) {
    return <MapError message={error} onRetry={() => window.location.reload()} />;
  }

  // Loading state
  if (!isLoaded) {
    return <MapLoading />;
  }

  // Map container
  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-bento overflow-hidden shadow-2xl shadow-primary/5 border border-border/50"
      style={{ minHeight: "600px", height: "100%", background: "#f8fafc" }}
      role="application"
      aria-label="Peta interaktif PJUTS"
      aria-describedby="map-description"
    >
      <span id="map-description" className="sr-only">
        Peta interaktif yang menampilkan lokasi unit PJUTS di Provinsi Jambi.
        Gunakan mouse atau sentuhan untuk menjelajahi peta.
      </span>
    </div>
  );
}

export const MapContainer = memo(MapContainerComponent);
