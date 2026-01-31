"use client";

import { useEffect } from "react";
import type {
  LeafletLibrary,
  LeafletMap,
  LeafletTileLayer,
  LeafletCircle,
} from "@/types/leaflet";
import {
  BASE_LAYERS,
  OVERLAY_LAYERS,
  type BaseLayerType,
  type OverlayType,
} from "@/components/map/layer-switcher";

// ============================================
// TYPES
// ============================================

export interface UseMapLayersOptions {
  /** Leaflet library reference */
  leafletRef: React.MutableRefObject<LeafletLibrary | null>;
  /** Map instance reference */
  mapRef: React.MutableRefObject<LeafletMap | null>;
  /** Current tile layer reference */
  tileLayerRef: React.MutableRefObject<LeafletTileLayer | null>;
  /** Overlay layers reference */
  overlayLayersRef: React.MutableRefObject<Map<string, LeafletTileLayer>>;
  /** Buffer circle reference */
  bufferCircleRef: React.MutableRefObject<LeafletCircle | null>;
  /** Whether map is ready */
  isReady: boolean;
  /** Active base layer */
  activeLayer: BaseLayerType;
  /** Active overlay layers */
  activeOverlays: OverlayType[];
  /** Buffer configuration */
  bufferConfig: {
    center: [number, number];
    radiusKm: number;
  } | null;
}

// ============================================
// HOOK: useMapLayers
// ============================================

/**
 * Hook to manage map layers (base layer, overlays, buffer circle)
 * 
 * Handles:
 * - Switching base tile layers
 * - Adding/removing overlay layers
 * - Managing buffer circle visualization
 * 
 * @example
 * ```tsx
 * useMapLayers({
 *   leafletRef,
 *   mapRef,
 *   tileLayerRef,
 *   overlayLayersRef,
 *   bufferCircleRef,
 *   isReady,
 *   activeLayer: "openstreetmap",
 *   activeOverlays: ["labels"],
 *   bufferConfig: null,
 * });
 * ```
 */
export function useMapLayers({
  leafletRef,
  mapRef,
  tileLayerRef,
  overlayLayersRef,
  bufferCircleRef,
  isReady,
  activeLayer,
  activeOverlays,
  bufferConfig,
}: UseMapLayersOptions): void {
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
      if (layerConfig.subdomains) {
        tileLayerOptions.subdomains = layerConfig.subdomains;
      }
      const newTileLayer = L.tileLayer(layerConfig.url, tileLayerOptions);
      newTileLayer.addTo(map);
      tileLayerRef.current = newTileLayer;
    } catch (err) {
      console.error("Error switching layer:", err);
    }
  }, [activeLayer, isReady, leafletRef, mapRef, tileLayerRef]);

  // Update overlay layers
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
  }, [activeOverlays, isReady, leafletRef, mapRef, overlayLayersRef]);

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
  }, [bufferConfig, isReady, leafletRef, mapRef, bufferCircleRef]);
}
