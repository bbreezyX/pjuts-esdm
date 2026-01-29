"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import { MapPoint } from "@/types";

interface MapContainerProps {
  points: MapPoint[];
  onPointClick?: (point: MapPoint) => void;
  selectedStatus?: string | null;
  center?: [number, number];
  zoom?: number;
}

// Status colors
const STATUS_COLORS = {
  OPERATIONAL: "#10b981",
  MAINTENANCE_NEEDED: "#f59e0b",
  OFFLINE: "#ef4444",
  UNVERIFIED: "#94a3b8",
} as const;

// Leaflet types for CDN-loaded library
interface LeafletDivIcon {
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}

interface LeafletMarker {
  on: (event: string, handler: () => void) => void;
}

interface LeafletLayerGroup {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => void;
  addLayer: (marker: LeafletMarker) => void;
}

interface LeafletMap {
  remove: () => void;
  invalidateSize: () => void;
  fitBounds: (
    bounds: LeafletLatLngBounds,
    options?: { padding?: [number, number]; maxZoom?: number }
  ) => void;
}

// Leaflet bounds object - opaque type from CDN library
type LeafletLatLngBounds = unknown;

interface LeafletLibrary {
  map: (
    container: HTMLElement,
    options?: Record<string, unknown>
  ) => LeafletMap;
  tileLayer: (
    url: string,
    options?: Record<string, unknown>
  ) => { addTo: (map: LeafletMap) => void };
  control: {
    zoom: (options?: { position?: string }) => {
      addTo: (map: LeafletMap) => void;
    };
  };
  layerGroup: () => LeafletLayerGroup;
  divIcon: (options: LeafletDivIcon) => LeafletDivIcon;
  marker: (
    coords: [number, number],
    options?: { icon?: LeafletDivIcon }
  ) => LeafletMarker;
  latLngBounds: (coords: [number, number][]) => LeafletLatLngBounds;
}

// Extend Window interface for Leaflet
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
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapContainerProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletLayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leafletRef = useRef<LeafletLibrary | null>(null);
  const initializedRef = useRef(false);
  
  // Store initial center and zoom in refs to avoid re-initialization
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);

  // Filtered points
  const filteredPoints = useMemo(() => {
    if (!selectedStatus) return points;
    return points.filter((p) => p.lastStatus === selectedStatus);
  }, [points, selectedStatus]);

  // Create marker icon
  const createIcon = useCallback((status: string) => {
    if (!leafletRef.current) return null;
    const L = leafletRef.current;
    const color =
      STATUS_COLORS[status as keyof typeof STATUS_COLORS] ||
      STATUS_COLORS.UNVERIFIED;

    return L.divIcon({
      className: "custom-marker",
      html: `
        <div style="width:40px;height:40px;display:flex;align-items:center;justify-content:center;position:relative;filter:drop-shadow(0 4px 6px rgba(0,0,0,0.1));">
          <svg viewBox="0 0 24 24" width="40" height="40">
            <defs>
              <linearGradient id="grad-${status}" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:${color};stop-opacity:1" />
                <stop offset="100%" style="stop-color:${color};stop-opacity:0.8" />
              </linearGradient>
            </defs>
            <path fill="url(#grad-${status})" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="3.5" fill="white"/>
          </svg>
          <div style="position:absolute;bottom:0px;left:50%;transform:translateX(-50%);width:10px;height:10px;background:${color};border-radius:50%;border:2px solid white;box-shadow:0 0 10px ${color};"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  }, []);

  // Load Leaflet via script tag (more reliable than dynamic import in production)
  useEffect(() => {
    // Check if Leaflet is already loaded
    if (window.L) {
      leafletRef.current = window.L;
      setIsLoaded(true);
      return;
    }

    // Load Leaflet from CDN
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

    return () => {
      // Don't remove script on cleanup as it might be used by other components
    };
  }, []);

  // Initialize map - only runs once when Leaflet is loaded
  useEffect(() => {
    if (!isLoaded || !containerRef.current || initializedRef.current) return;

    const L = leafletRef.current;
    if (!L) return;

    try {
      initializedRef.current = true;
      
      // Create map with initial values from refs
      const map = L.map(containerRef.current, {
        center: initialCenterRef.current,
        zoom: initialZoomRef.current,
        zoomControl: false,
        preferCanvas: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18,
      }).addTo(map);

      // Add zoom control
      L.control.zoom({ position: "topright" }).addTo(map);

      // Create markers layer
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Force resize after a short delay
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
        initializedRef.current = false;
      }
    };
  }, [isLoaded]); // Only depend on isLoaded - center/zoom are read from refs

  // Update markers
  useEffect(() => {
    if (!isReady || !markersRef.current || !leafletRef.current || !initializedRef.current) return;

    const L = leafletRef.current;
    const markers = markersRef.current;
    
    try {
      markers.clearLayers();

      filteredPoints.forEach((point) => {
        const icon = createIcon(point.lastStatus);
        if (!icon) return;

        const marker = L.marker([point.latitude, point.longitude], { icon });
        marker.on("click", () => onPointClick?.(point));
        markers.addLayer(marker);
      });
    } catch (err) {
      console.error("Error updating markers:", err);
    }
  }, [filteredPoints, isReady, createIcon, onPointClick]);

  // Fit bounds
  useEffect(() => {
    if (
      !isReady ||
      !mapRef.current ||
      !leafletRef.current ||
      !initializedRef.current ||
      filteredPoints.length === 0
    )
      return;

    try {
      const L = leafletRef.current;
      const map = mapRef.current;
      const bounds = L.latLngBounds(
        filteredPoints.map((p) => [p.latitude, p.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
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
