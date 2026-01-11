"use client";

import { useEffect, useState, useRef, useCallback, useMemo, memo } from "react";
import type { Map as LeafletMap, LayerGroup, MarkerClusterGroup as MarkerClusterGroupType } from "leaflet";
import { MapPoint } from "@/types";
import { getStatusLabel } from "@/lib/utils";

interface MapContainerProps {
  points: MapPoint[];
  onPointClick?: (point: MapPoint) => void;
  selectedStatus?: string | null;
  center?: [number, number];
  zoom?: number;
  enableClustering?: boolean;
}

// Memoized status colors
const STATUS_COLORS = {
  OPERATIONAL: "#10b981",
  MAINTENANCE_NEEDED: "#f59e0b",
  OFFLINE: "#ef4444",
  UNVERIFIED: "#94a3b8",
} as const;

// Create icon once and cache it
const createIcon = (status: string, L: any) => {
  const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.UNVERIFIED;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg viewBox="0 0 24 24" width="28" height="28">
          <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
          <circle cx="12" cy="9" r="2.5" fill="white"/>
        </svg>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
};

// Cache icons to avoid recreating them
const iconCache = new Map<string, any>();
const getIcon = (status: string, L: any) => {
  if (!iconCache.has(status)) {
    iconCache.set(status, createIcon(status, L));
  }
  return iconCache.get(status);
};

// Create popup content - extracted for reuse
const createPopupContent = (point: MapPoint) => `
  <div style="min-width: 180px; padding: 6px;">
    <div style="font-weight: 600; font-size: 13px; margin-bottom: 6px; color: #0f172a;">
      ${point.serialNumber}
    </div>
    <div style="display: flex; flex-direction: column; gap: 3px; font-size: 11px; color: #64748b;">
      <div style="display: flex; justify-content: space-between;">
        <span>Status:</span>
        <span style="font-weight: 500; color: ${STATUS_COLORS[point.lastStatus] || STATUS_COLORS.UNVERIFIED};">
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
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 6px 0;">
        <div style="font-size: 10px; color: #94a3b8;">Laporan Terakhir</div>
        <div style="display: flex; justify-content: space-between;">
          <span>Tegangan:</span>
          <span style="font-weight: 500; color: #0f172a;">${point.lastReport.batteryVoltage}V</span>
        </div>
      ` : ""}
    </div>
    <button 
      onclick="window.dispatchEvent(new CustomEvent('map-point-click', { detail: '${point.id}' }))"
      style="
        width: 100%;
        margin-top: 10px;
        padding: 6px 10px;
        background: #003366;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
        cursor: pointer;
      "
    >
      Lihat Detail
    </button>
  </div>
`;

function MapContainerComponent({
  points,
  onPointClick,
  selectedStatus,
  center = [-2.5, 118],
  zoom = 5,
  enableClustering = true,
}: MapContainerProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | MarkerClusterGroupType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [L, setL] = useState<any>(null);
  const [MarkerClusterGroup, setMarkerClusterGroup] = useState<any>(null);

  // Memoize filtered points
  const filteredPoints = useMemo(() => {
    if (!selectedStatus) return points;
    return points.filter((p) => p.lastStatus === selectedStatus);
  }, [points, selectedStatus]);

  // Load Leaflet and clustering plugin
  useEffect(() => {
    let mounted = true;
    
    async function loadLeaflet() {
      try {
        const [leafletModule] = await Promise.all([
          import("leaflet"),
          import("leaflet/dist/leaflet.css"),
        ]);
        
        if (!mounted) return;
        setL(leafletModule.default);

        // Load clustering plugin if enabled
        if (enableClustering) {
          try {
            const clusterModule = await import("leaflet.markercluster");
            // CSS imports may fail in some environments - that's OK
            try {
              // @ts-ignore - CSS imports
              await import("leaflet.markercluster/dist/MarkerCluster.css");
              // @ts-ignore - CSS imports
              await import("leaflet.markercluster/dist/MarkerCluster.Default.css");
            } catch {}
            if (mounted) {
              setMarkerClusterGroup(() => clusterModule.default || (leafletModule.default as any).MarkerClusterGroup);
            }
          } catch (e) {
            console.warn("Marker clustering not available:", e);
          }
        }
      } catch (e) {
        console.error("Failed to load Leaflet:", e);
      }
    }
    
    loadLeaflet();
    return () => { mounted = false; };
  }, [enableClustering]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current || !L) return;

    const map = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
      preferCanvas: true, // Better performance for many markers
    });

    // Use a faster tile provider with better caching
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
      updateWhenIdle: true, // Only load tiles when map is idle
      updateWhenZooming: false, // Don't load tiles during zoom animation
      keepBuffer: 4, // Keep more tiles in buffer
    }).addTo(map);

    L.control.zoom({ position: "topright" }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L, center, zoom]);

  // Update markers with chunked processing for better performance
  useEffect(() => {
    if (!mapRef.current || !L) return;

    // Clear existing markers
    if (markersRef.current) {
      markersRef.current.clearLayers();
      mapRef.current.removeLayer(markersRef.current);
    }

    // Create marker layer (clustered or regular)
    let markerLayer: LayerGroup | MarkerClusterGroupType;
    
    if (enableClustering && MarkerClusterGroup) {
      markerLayer = new (L.MarkerClusterGroup || MarkerClusterGroup)({
        chunkedLoading: true, // Load markers in chunks
        chunkInterval: 50, // Process every 50ms
        chunkDelay: 10, // Delay between chunks
        maxClusterRadius: 50, // Cluster radius in pixels
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false, // Disable for performance
        zoomToBoundsOnClick: true,
        disableClusteringAtZoom: 16, // Show individual markers at high zoom
        iconCreateFunction: (cluster: any) => {
          const count = cluster.getChildCount();
          let size = "small";
          let radius = 30;
          
          if (count > 100) {
            size = "large";
            radius = 50;
          } else if (count > 10) {
            size = "medium";
            radius = 40;
          }

          return L.divIcon({
            html: `<div style="
              width: ${radius}px;
              height: ${radius}px;
              background: rgba(0, 51, 102, 0.85);
              border: 2px solid white;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: 600;
              font-size: ${size === "large" ? "14px" : size === "medium" ? "12px" : "11px"};
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">${count}</div>`,
            className: `marker-cluster marker-cluster-${size}`,
            iconSize: [radius, radius],
          });
        },
      });
    } else {
      markerLayer = L.layerGroup();
    }

    // Add markers in batches to prevent UI blocking
    const BATCH_SIZE = 100;
    let currentIndex = 0;

    const processBatch = () => {
      const endIndex = Math.min(currentIndex + BATCH_SIZE, filteredPoints.length);
      
      for (let i = currentIndex; i < endIndex; i++) {
        const point = filteredPoints[i];
        const marker = L.marker([point.latitude, point.longitude], {
          icon: getIcon(point.lastStatus, L),
        });

        // Use lazy popup content generation
        marker.bindPopup(() => createPopupContent(point), {
          maxWidth: 250,
          autoPan: true,
          autoPanPadding: [50, 50],
        });

        if (onPointClick) {
          marker.on("click", () => onPointClick(point));
        }

        markerLayer.addLayer(marker);
      }

      currentIndex = endIndex;

      if (currentIndex < filteredPoints.length) {
        requestAnimationFrame(processBatch);
      }
    };

    if (filteredPoints.length > 0) {
      processBatch();
    }

    markerLayer.addTo(mapRef.current);
    markersRef.current = markerLayer;

  }, [filteredPoints, onPointClick, L, MarkerClusterGroup, enableClustering]);

  // Fit bounds when points change (debounced)
  useEffect(() => {
    if (!mapRef.current || filteredPoints.length === 0 || !L) return;

    const timeoutId = setTimeout(() => {
      if (!mapRef.current) return;
      
      const bounds = L.latLngBounds(
        filteredPoints.map((p) => [p.latitude, p.longitude])
      );
      mapRef.current.fitBounds(bounds, { 
        padding: [50, 50], 
        maxZoom: 10,
        animate: false, // Disable animation for better performance
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [filteredPoints, L]);

  return (
    <>
      <style jsx global>{`
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
        .marker-cluster {
          background: transparent !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 8px;
        }
      `}</style>
      <div
        ref={containerRef}
        className="w-full h-full rounded-xl overflow-hidden"
        style={{ minHeight: "500px" }}
      />
    </>
  );
}

// Memoize the entire component to prevent unnecessary re-renders
export const MapContainer = memo(MapContainerComponent);
