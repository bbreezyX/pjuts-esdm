"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import type * as L from "leaflet";
import { MapPoint } from "@/types";
import {
  BASE_LAYERS,
  OVERLAY_LAYERS,
  type BaseLayerType,
  type OverlayType,
} from "./layer-switcher";

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

// Status colors
const STATUS_COLORS = {
  OPERATIONAL: "#10b981",
  MAINTENANCE_NEEDED: "#f59e0b",
  OFFLINE: "#ef4444",
  UNVERIFIED: "#94a3b8",
} as const;

// Types for Leaflet CDN library
interface LeafletDivIcon {
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}

interface LeafletMarker {
  on: (event: string, handler: () => void) => void;
  setZIndexOffset: (offset: number) => void;
}

interface LeafletLayerGroup {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => void;
  addLayer: (marker: LeafletMarker | LeafletCircle) => void;
  removeLayer: (layer: LeafletCircle) => void;
}

interface LeafletCircle {
  addTo: (map: LeafletMap) => LeafletCircle;
  remove: () => void;
  setLatLng: (latlng: [number, number]) => void;
  setRadius: (radius: number) => void;
}

interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer;
  remove: () => void;
}

interface LeafletMap {
  remove: () => void;
  invalidateSize: () => void;
  fitBounds: (
    bounds: LeafletLatLngBounds,
    options?: { padding?: [number, number]; maxZoom?: number },
  ) => void;
  flyTo: (
    latlng: [number, number],
    zoom?: number,
    options?: { animate?: boolean; duration?: number },
  ) => void;
  removeLayer: (layer: LeafletTileLayer | LeafletCircle) => void;
  addLayer: (layer: LeafletTileLayer) => void;
}

type LeafletLatLngBounds = {
  isValid: () => boolean;
};

interface LeafletLibrary {
  map: (
    container: HTMLElement,
    options?: Record<string, unknown>,
  ) => LeafletMap;
  tileLayer: (
    url: string,
    options?: Record<string, unknown>,
  ) => LeafletTileLayer;
  control: {
    zoom: (options?: { position?: string }) => {
      addTo: (map: LeafletMap) => void;
    };
    scale: (options?: { position?: string; imperial?: boolean }) => {
      addTo: (map: LeafletMap) => void;
    };
  };
  layerGroup: () => LeafletLayerGroup;
  divIcon: (options: LeafletDivIcon) => LeafletDivIcon;
  marker: (
    coords: [number, number],
    options?: { icon?: LeafletDivIcon },
  ) => LeafletMarker;
  circle: (
    coords: [number, number],
    options?: {
      radius?: number;
      color?: string;
      fillColor?: string;
      fillOpacity?: number;
      weight?: number;
      dashArray?: string;
    },
  ) => LeafletCircle;
  latLngBounds: (coords: [number, number][]) => LeafletLatLngBounds;
}

declare global {
  interface Window {
    L?: LeafletLibrary;
  }
}

// Default values for Jambi Province
const DEFAULT_CENTER: [number, number] = [-1.6, 103.6];
const DEFAULT_ZOOM = 8;

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
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletLayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leafletRef = useRef<LeafletLibrary | null>(null);
  const initializedRef = useRef(false);
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  const overlayLayersRef = useRef<Map<string, LeafletTileLayer>>(new Map());
  const bufferCircleRef = useRef<LeafletCircle | null>(null);

  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);

  // Filtered points
  const filteredPoints = useMemo(() => {
    if (!selectedStatus) return points;
    return points.filter((p) => p.lastStatus === selectedStatus);
  }, [points, selectedStatus]);

  // Create marker icon
  const createIcon = useCallback((status: string, isSelected: boolean) => {
    if (!leafletRef.current) return null;
    const L = leafletRef.current;

    // If selected, use a distinct color or just making it bigger/glowy
    // Let's use blue or purple for selection if we want to override status color?
    // Or keep status color but make it pulsate heavily.
    const baseColor =
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      STATUS_COLORS.UNVERIFIED;

    // If selected, maybe use a "target" color or just brighter version?
    // Let's stick to status color but enhance the visual.

    const size = isSelected ? 60 : 40;
    const iconSize = isSelected ? 48 : 40; // Inner SVG size
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
          <svg viewBox="0 0 24 24" width="${iconSize}" height="${iconSize}" style="transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); ${isSelected ? "transform: scale(1.2);" : ""}">
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
      iconAnchor: [size / 2, size], // Center bottom anchor roughly
      popupAnchor: [0, -size],
    });
  }, []);

  // Load Leaflet
  useEffect(() => {
    if (window.L) {
      leafletRef.current = window.L;
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin = "";
    script.async = true;

    script.onload = () => {
      if (window.L) {
        leafletRef.current = window.L;
        setIsLoaded(true);
      }
    };

    script.onerror = () => {
      setError("Gagal memuat library peta dari CDN");
    };

    document.head.appendChild(script);
  }, []);

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !containerRef.current || initializedRef.current) return;

    const L = leafletRef.current;
    if (!L) return;

    try {
      initializedRef.current = true;

      const map = L.map(containerRef.current, {
        center: initialCenterRef.current,
        zoom: initialZoomRef.current,
        zoomControl: false,
        preferCanvas: true,
      });

      // Get initial layer config
      const layerConfig =
        BASE_LAYERS.find((l) => l.id === activeLayer) || BASE_LAYERS[0];

      // Add tile layer
      const tileLayerOptions: Record<string, unknown> = {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom || 18,
      };
      // Only add subdomains if the layer config defines them
      if (layerConfig.subdomains) {
        tileLayerOptions.subdomains = layerConfig.subdomains;
      }
      const tileLayer = L.tileLayer(layerConfig.url, tileLayerOptions);
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      // Add zoom control
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add scale control for GIS professionalism
      L.control.scale({ position: "bottomright", imperial: false }).addTo(map);

      // Create markers layer
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      setTimeout(() => {
        if (mapRef.current === map && initializedRef.current) {
          map.invalidateSize();
          setIsReady(true);
        }
      }, 100);
    } catch (err) {
      console.error("Map init error:", err);
      setError("Gagal menginisialisasi peta");
      initializedRef.current = false;
    }

    return () => {
      if (mapRef.current) {
        setIsReady(false);
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        tileLayerRef.current = null;
        bufferCircleRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [isLoaded]);

  // Update tile layer when activeLayer changes
  useEffect(() => {
    if (!isReady || !mapRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapRef.current;
    const layerConfig =
      BASE_LAYERS.find((l) => l.id === activeLayer) || BASE_LAYERS[0];

    try {
      // Remove existing tile layer
      if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
      }

      // Add new tile layer
      const tileLayerOptions: Record<string, unknown> = {
        attribution: layerConfig.attribution,
        maxZoom: layerConfig.maxZoom || 18,
      };
      // Only add subdomains if the layer config defines them
      if (layerConfig.subdomains) {
        tileLayerOptions.subdomains = layerConfig.subdomains;
      }
      const newTileLayer = L.tileLayer(layerConfig.url, tileLayerOptions);
      newTileLayer.addTo(map);
      tileLayerRef.current = newTileLayer;
    } catch (err) {
      console.error("Error switching layer:", err);
    }
  }, [activeLayer, isReady]);

  // Update buffer circle
  useEffect(() => {
    if (!isReady || !mapRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapRef.current;

    try {
      // Remove existing buffer
      if (bufferCircleRef.current) {
        bufferCircleRef.current.remove();
        bufferCircleRef.current = null;
      }

      // Add new buffer if config exists
      if (bufferConfig) {
        const radiusMeters = bufferConfig.radiusKm * 1000;
        const circle = L.circle(bufferConfig.center, {
          radius: radiusMeters,
          color: "#10b981",
          fillColor: "#10b981",
          fillOpacity: 0.15,
          weight: 2,
          dashArray: "5, 10",
        });
        circle.addTo(map);
        bufferCircleRef.current = circle;
      }
    } catch (err) {
      console.error("Error updating buffer:", err);
    }
  }, [bufferConfig, isReady]);

  // Update overlay layers when activeOverlays changes
  useEffect(() => {
    if (!isReady || !mapRef.current || !leafletRef.current) return;

    const L = leafletRef.current;
    const map = mapRef.current;

    try {
      // Get current overlay IDs
      const currentOverlayIds = Array.from(overlayLayersRef.current.keys());

      // Remove overlays that are no longer active
      for (const overlayId of currentOverlayIds) {
        if (!activeOverlays.includes(overlayId as OverlayType)) {
          const layer = overlayLayersRef.current.get(overlayId);
          if (layer) {
            map.removeLayer(layer);
            overlayLayersRef.current.delete(overlayId);
          }
        }
      }

      // Add overlays that are newly active
      for (const overlayId of activeOverlays) {
        if (!overlayLayersRef.current.has(overlayId)) {
          const overlayConfig = OVERLAY_LAYERS.find((o) => o.id === overlayId);
          if (overlayConfig) {
            const overlayOptions: Record<string, unknown> = {
              attribution: overlayConfig.attribution,
            };
            // Only add subdomains if the overlay config defines them
            if (overlayConfig.subdomains) {
              overlayOptions.subdomains = overlayConfig.subdomains;
            }
            const overlayLayer = L.tileLayer(overlayConfig.url, overlayOptions);
            overlayLayer.addTo(map);
            overlayLayersRef.current.set(overlayId, overlayLayer);
          }
        }
      }
    } catch (err) {
      console.error("Error updating overlays:", err);
    }
  }, [activeOverlays, isReady]);

  // Update markers and handle flyTo
  useEffect(() => {
    if (
      !isReady ||
      !markersRef.current ||
      !leafletRef.current ||
      !initializedRef.current
    )
      return;

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
  }, [filteredPoints, isReady, createIcon, onPointClick, selectedUnitId]);

  // Fit bounds (only on initial load or if no specific selection)
  useEffect(() => {
    if (
      !isReady ||
      !mapRef.current ||
      !leafletRef.current ||
      !initializedRef.current ||
      filteredPoints.length === 0 ||
      selectedUnitId // Skip auto-fit if a specific unit is selected to avoid conflict with flyTo
    )
      return;

    try {
      const L = leafletRef.current;
      const map = mapRef.current;

      // Filter out points with invalid coordinates
      const validPoints = filteredPoints.filter(
        (p) =>
          typeof p.latitude === "number" &&
          typeof p.longitude === "number" &&
          !isNaN(p.latitude) &&
          !isNaN(p.longitude) &&
          p.latitude >= -90 &&
          p.latitude <= 90 &&
          p.longitude >= -180 &&
          p.longitude <= 180,
      );

      if (validPoints.length === 0) return;

      const bounds = L.latLngBounds(
        validPoints.map((p) => [p.latitude, p.longitude] as [number, number]),
      ) as L.LatLngBounds;

      // Check if bounds are valid before fitting
      if (
        bounds &&
        bounds &&
        typeof bounds.isValid === "function" &&
        bounds.isValid()
      ) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
      }
    } catch (err) {
      console.error("Error fitting bounds:", err);
    }
  }, [filteredPoints, isReady]);

  // Error state
  if (error) {
    return (
      <div
        className="w-full h-full rounded-xl bg-red-50 flex items-center justify-center"
        style={{ minHeight: "500px" }}
      >
        <div className="text-center">
          <svg
            className="w-12 h-12 mx-auto text-red-500 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Loading state
  if (!isLoaded) {
    return (
      <div
        className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center"
        style={{ minHeight: "500px" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Memuat peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-bento overflow-hidden shadow-2xl shadow-primary/5 border border-border/50"
      style={{ minHeight: "600px", height: "100%", background: "#f8fafc" }}
    />
  );
}

export const MapContainer = memo(MapContainerComponent);
