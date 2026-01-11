"use client";

import { useEffect, useState, useRef, useMemo, memo, useCallback } from "react";
import type { Map as LeafletMap, LayerGroup } from "leaflet";
import { MapPoint } from "@/types";
import { getStatusLabel } from "@/lib/utils";

interface MapContainerProps {
  points: MapPoint[];
  onPointClick?: (point: MapPoint) => void;
  selectedStatus?: string | null;
  center?: [number, number];
  zoom?: number;
}

// Status colors - defined outside component for performance
const STATUS_COLORS = {
  OPERATIONAL: "#10b981",
  MAINTENANCE_NEEDED: "#f59e0b",
  OFFLINE: "#ef4444",
  UNVERIFIED: "#94a3b8",
} as const;

// Icon cache to avoid recreating icons
const iconCache = new Map<string, any>();

function MapContainerComponent({
  points,
  onPointClick,
  selectedStatus,
  center = [-2.5, 118],
  zoom = 5,
}: MapContainerProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize filtered points
  const filteredPoints = useMemo(() => {
    if (!selectedStatus) return points;
    return points.filter((p) => p.lastStatus === selectedStatus);
  }, [points, selectedStatus]);

  // Create icon function - memoized
  const createIcon = useCallback((status: string, leaflet: typeof import("leaflet")) => {
    // Check cache first
    const cacheKey = `icon-${status}`;
    if (iconCache.has(cacheKey)) {
      return iconCache.get(cacheKey);
    }

    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.UNVERIFIED;

    const icon = leaflet.divIcon({
      className: "custom-marker",
      html: `
        <div style="
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        ">
          <svg viewBox="0 0 24 24" width="32" height="32">
            <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            <circle cx="12" cy="9" r="3" fill="white"/>
          </svg>
          <div style="
            position: absolute;
            bottom: -2px;
            left: 50%;
            transform: translateX(-50%);
            width: 8px;
            height: 8px;
            background: ${color};
            border-radius: 50%;
            box-shadow: 0 0 0 2px white, 0 0 8px ${color};
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

    iconCache.set(cacheKey, icon);
    return icon;
  }, []);

  // Create popup content - memoized factory
  const createPopupContent = useCallback((point: MapPoint) => {
    const statusColor = STATUS_COLORS[point.lastStatus] || STATUS_COLORS.UNVERIFIED;
    
    return `
      <div style="min-width: 200px; padding: 8px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #0f172a;">
          ${point.serialNumber}
        </div>
        <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #64748b;">
          <div style="display: flex; justify-content: space-between;">
            <span>Status:</span>
            <span style="font-weight: 500; color: ${statusColor};">
              ${getStatusLabel(point.lastStatus)}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Provinsi:</span>
            <span style="font-weight: 500; color: #0f172a;">${point.province}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Kabupaten:</span>
            <span style="font-weight: 500; color: #0f172a;">${point.regency}</span>
          </div>
          ${point.lastReport ? `
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 8px 0;">
            <div style="font-size: 11px; color: #94a3b8;">Laporan Terakhir</div>
            <div style="display: flex; justify-content: space-between;">
              <span>Tegangan:</span>
              <span style="font-weight: 500; color: #0f172a;">${point.lastReport.batteryVoltage}V</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Pelapor:</span>
              <span style="font-weight: 500; color: #0f172a;">${point.lastReport.user}</span>
            </div>
          ` : ""}
        </div>
        <button 
          onclick="window.dispatchEvent(new CustomEvent('map-point-click', { detail: '${point.id}' }))"
          style="
            width: 100%;
            margin-top: 12px;
            padding: 8px 12px;
            background: #003366;
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
          "
        >
          Lihat Detail
        </button>
      </div>
    `;
  }, []);

  // Dynamically load Leaflet (CSS is in globals.css for production compatibility)
  useEffect(() => {
    let mounted = true;
    
    async function loadLeaflet() {
      try {
        // Dynamic import of leaflet
        const leafletModule = await import("leaflet");
        
        if (mounted && leafletModule.default) {
          setL(leafletModule.default as any);
        }
      } catch (err) {
        console.error("Failed to load Leaflet:", err);
        if (mounted) {
          setError("Gagal memuat library peta");
        }
      }
    }
    
    loadLeaflet();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Initialize map - with proper cleanup and re-initialization
  useEffect(() => {
    if (!L || !containerRef.current) return;
    
    // Skip if map already exists
    if (mapRef.current) return;

    // Small delay to ensure container is properly rendered with dimensions
    const initTimer = setTimeout(() => {
      if (!containerRef.current || mapRef.current) return;
      
      try {
        // Initialize map with performance options
        const map = L.map(containerRef.current, {
          center,
          zoom,
          zoomControl: false,
          preferCanvas: true,
        });

        // Add tile layer
        const tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 18,
          subdomains: ['a', 'b', 'c'],
        });
        
        tileLayer.addTo(map);
        
        // Handle tile errors
        tileLayer.on('tileerror', (e: any) => {
          console.warn('Tile load error:', e);
        });

        // Add zoom control on the right
        L.control.zoom({ position: "topright" }).addTo(map);

        // Create markers layer group
        markersRef.current = L.layerGroup().addTo(map);
        mapRef.current = map;
        
        // Force a resize after initialization
        setTimeout(() => {
          map.invalidateSize();
          setIsMapReady(true);
        }, 100);
        
      } catch (err) {
        console.error("Failed to initialize map:", err);
        setError("Gagal menginisialisasi peta");
      }
    }, 50);

    return () => {
      clearTimeout(initTimer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        setIsMapReady(false);
      }
    };
  }, [L, center, zoom]);

  // Update markers when points change - optimized with batching
  useEffect(() => {
    if (!markersRef.current || !L || !isMapReady) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add markers in batches to prevent UI blocking
    const BATCH_SIZE = 50;
    let currentIndex = 0;

    const processBatch = () => {
      if (!markersRef.current) return;
      
      const endIndex = Math.min(currentIndex + BATCH_SIZE, filteredPoints.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        const point = filteredPoints[i];
        const marker = L.marker([point.latitude, point.longitude], {
          icon: createIcon(point.lastStatus, L),
        });

        marker.bindPopup(createPopupContent(point), {
          maxWidth: 280,
          autoPan: true,
        });

        marker.on("click", () => {
          if (onPointClick) {
            onPointClick(point);
          }
        });

        markersRef.current?.addLayer(marker);
      }

      currentIndex = endIndex;

      if (currentIndex < filteredPoints.length) {
        requestAnimationFrame(processBatch);
      }
    };

    if (filteredPoints.length > 0) {
      processBatch();
    }
  }, [filteredPoints, onPointClick, L, isMapReady, createIcon, createPopupContent]);

  // Fit bounds when points change
  useEffect(() => {
    if (!mapRef.current || filteredPoints.length === 0 || !L || !isMapReady) return;

    // Debounce the fitBounds call
    const timeoutId = setTimeout(() => {
      if (!mapRef.current) return;
      
      const bounds = L.latLngBounds(
        filteredPoints.map((p) => [p.latitude, p.longitude])
      );
      mapRef.current.fitBounds(bounds, { 
        padding: [50, 50], 
        maxZoom: 10,
        animate: false,
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filteredPoints, L, isMapReady]);

  // Error state
  if (error) {
    return (
      <div 
        className="w-full h-full rounded-xl overflow-hidden bg-red-50 flex items-center justify-center"
        style={{ minHeight: "500px", height: "100%" }}
      >
        <div className="text-center">
          <div className="text-red-500 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-sm text-red-600 font-medium">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  // Loading state while Leaflet is loading
  if (!L) {
    return (
      <div 
        className="w-full h-full rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center"
        style={{ minHeight: "500px", height: "100%" }}
      >
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-300 border-t-primary rounded-full animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500">Memuat library peta...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden leaflet-container"
      style={{ 
        minHeight: "500px", 
        height: "100%", 
        width: "100%",
        position: "relative",
        background: "#e5e7eb" 
      }}
    />
  );
}

// Memoize the component to prevent unnecessary re-renders
export const MapContainer = memo(MapContainerComponent);
