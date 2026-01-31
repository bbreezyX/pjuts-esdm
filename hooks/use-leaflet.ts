"use client";

import { useEffect, useState, useRef } from "react";
import type {
  LeafletLibrary,
  LeafletMap,
  LeafletLayerGroup,
  LeafletTileLayer,
  LeafletCircle,
} from "@/types/leaflet";
import {
  LEAFLET_CDN_URL,
  LEAFLET_CDN_INTEGRITY,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
} from "@/types/leaflet";
import { BASE_LAYERS, type BaseLayerType } from "@/components/map/layer-switcher";

// ============================================
// TYPES
// ============================================

export interface UseLeafletOptions {
  center?: [number, number];
  zoom?: number;
  activeLayer?: BaseLayerType;
}

export interface UseLeafletReturn {
  /** Reference to the Leaflet library */
  leafletRef: React.MutableRefObject<LeafletLibrary | null>;
  /** Reference to the map instance */
  mapRef: React.MutableRefObject<LeafletMap | null>;
  /** Reference to the markers layer group */
  markersRef: React.MutableRefObject<LeafletLayerGroup | null>;
  /** Reference to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Reference to the current tile layer */
  tileLayerRef: React.MutableRefObject<LeafletTileLayer | null>;
  /** Reference to overlay layers */
  overlayLayersRef: React.MutableRefObject<Map<string, LeafletTileLayer>>;
  /** Reference to buffer circle */
  bufferCircleRef: React.MutableRefObject<LeafletCircle | null>;
  /** Whether Leaflet script is loaded */
  isLoaded: boolean;
  /** Whether map is ready for interaction */
  isReady: boolean;
  /** Error message if initialization failed */
  error: string | null;
  /** Whether map has been initialized */
  isInitialized: boolean;
}

// ============================================
// HOOK: useLeaflet
// ============================================

/**
 * Hook to load and initialize Leaflet map
 * 
 * Handles:
 * - Loading Leaflet from CDN
 * - Initializing the map instance
 * - Setting up base layers and controls
 * - Cleanup on unmount
 * 
 * @example
 * ```tsx
 * const {
 *   leafletRef,
 *   mapRef,
 *   containerRef,
 *   isLoaded,
 *   isReady,
 *   error,
 * } = useLeaflet({ center: [-1.6, 103.6], zoom: 8 });
 * ```
 */
export function useLeaflet(options: UseLeafletOptions = {}): UseLeafletReturn {
  const {
    center = DEFAULT_CENTER,
    zoom = DEFAULT_ZOOM,
    activeLayer = "openstreetmap",
  } = options;

  // Refs
  const mapRef = useRef<LeafletMap | null>(null);
  const markersRef = useRef<LeafletLayerGroup | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<LeafletLibrary | null>(null);
  const tileLayerRef = useRef<LeafletTileLayer | null>(null);
  const overlayLayersRef = useRef<Map<string, LeafletTileLayer>>(new Map());
  const bufferCircleRef = useRef<LeafletCircle | null>(null);
  const initializedRef = useRef(false);

  // Store initial values to prevent re-initialization on prop changes
  const initialCenterRef = useRef(center);
  const initialZoomRef = useRef(zoom);

  // State
  const [isLoaded, setIsLoaded] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load Leaflet from CDN
  useEffect(() => {
    if (window.L) {
      leafletRef.current = window.L;
      setIsLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = LEAFLET_CDN_URL;
    script.integrity = LEAFLET_CDN_INTEGRITY;
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
      if (layerConfig.subdomains) {
        tileLayerOptions.subdomains = layerConfig.subdomains;
      }
      const tileLayer = L.tileLayer(layerConfig.url, tileLayerOptions);
      tileLayer.addTo(map);
      tileLayerRef.current = tileLayer;

      // Add zoom control
      L.control.zoom({ position: "topright" }).addTo(map);

      // Add scale control
      L.control.scale({ position: "bottomright", imperial: false }).addTo(map);

      // Create markers layer
      markersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      // Invalidate size after mount
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

    // Cleanup
    return () => {
      if (mapRef.current) {
        setIsReady(false);
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = null;
        tileLayerRef.current = null;
        bufferCircleRef.current = null;
        overlayLayersRef.current.clear();
        initializedRef.current = false;
      }
    };
  }, [isLoaded, activeLayer]);

  return {
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
    isInitialized: initializedRef.current,
  };
}
