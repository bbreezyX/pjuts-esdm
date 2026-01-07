"use client";

import { useEffect, useState, useRef } from "react";
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

export function MapContainer({
  points,
  onPointClick,
  selectedStatus,
  center = [-2.5, 118],
  zoom = 5,
}: MapContainerProps) {
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [L, setL] = useState<any>(null);

  // Filter points by status
  const filteredPoints = selectedStatus
    ? points.filter((p) => p.lastStatus === selectedStatus)
    : points;

  // Dynamically load Leaflet
  useEffect(() => {
    async function loadLeaflet() {
      const leafletModule = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      setL(leafletModule.default);
    }
    loadLeaflet();
  }, []);

  // Fix for default marker icons in Next.js
  const createIcon = (status: string, leaflet: any) => {
    const colors = {
      OPERATIONAL: "#10b981",
      MAINTENANCE_NEEDED: "#f59e0b",
      OFFLINE: "#ef4444",
      UNVERIFIED: "#94a3b8",
    };

    const color = colors[status as keyof typeof colors] || colors.UNVERIFIED;

    return leaflet.divIcon({
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
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });
  };

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !L) return;

    // Initialize map
    mapRef.current = L.map(containerRef.current, {
      center,
      zoom,
      zoomControl: false,
    });

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    // Add zoom control on the right
    L.control.zoom({ position: "topright" }).addTo(mapRef.current);

    // Create markers layer group
    markersRef.current = L.layerGroup().addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L]); // Depend on L

  // Update markers when points change
  useEffect(() => {
    if (!markersRef.current || !L) return;

    // Clear existing markers
    markersRef.current.clearLayers();

    // Add new markers
    filteredPoints.forEach((point) => {
      const marker = L.marker([point.latitude, point.longitude], {
        icon: createIcon(point.lastStatus, L),
      });

      marker.bindPopup(`
        <div style="min-width: 200px; padding: 8px;">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #0f172a;">
            ${point.serialNumber}
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px; font-size: 12px; color: #64748b;">
            <div style="display: flex; justify-content: space-between;">
              <span>Status:</span>
              <span style="font-weight: 500; color: ${point.lastStatus === "OPERATIONAL"
          ? "#10b981"
          : point.lastStatus === "MAINTENANCE_NEEDED"
            ? "#f59e0b"
            : point.lastStatus === "OFFLINE"
              ? "#ef4444"
              : "#64748b"
        };">
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
            ${point.lastReport
          ? `
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
            `
          : ""
        }
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
      `);

      marker.on("click", () => {
        if (onPointClick) {
          onPointClick(point);
        }
      });

      markersRef.current?.addLayer(marker);
    });
  }, [filteredPoints, onPointClick, L]);

  // Fit bounds when points change
  useEffect(() => {
    if (!mapRef.current || filteredPoints.length === 0 || !L) return;

    const bounds = L.latLngBounds(
      filteredPoints.map((p) => [p.latitude, p.longitude])
    );
    mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
  }, [filteredPoints, L]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full rounded-xl overflow-hidden"
      style={{ minHeight: "500px" }}
    />
  );
}

