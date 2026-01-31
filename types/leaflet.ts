/**
 * Leaflet CDN Library Types
 * 
 * Type definitions for the Leaflet library when loaded from CDN.
 * These types provide type safety for the map component without
 * requiring the full Leaflet package to be bundled.
 */

// ============================================
// LEAFLET CORE TYPES
// ============================================

export interface LeafletDivIcon {
  className: string;
  html: string;
  iconSize: [number, number];
  iconAnchor: [number, number];
  popupAnchor: [number, number];
}

export interface LeafletMarker {
  on: (event: string, handler: () => void) => void;
  setZIndexOffset: (offset: number) => void;
}

export interface LeafletLayerGroup {
  addTo: (map: LeafletMap) => LeafletLayerGroup;
  clearLayers: () => void;
  addLayer: (marker: LeafletMarker | LeafletCircle) => void;
  removeLayer: (layer: LeafletCircle) => void;
}

export interface LeafletCircle {
  addTo: (map: LeafletMap) => LeafletCircle;
  remove: () => void;
  setLatLng: (latlng: [number, number]) => void;
  setRadius: (radius: number) => void;
}

export interface LeafletTileLayer {
  addTo: (map: LeafletMap) => LeafletTileLayer;
  remove: () => void;
}

export interface LeafletMap {
  remove: () => void;
  invalidateSize: () => void;
  fitBounds: (
    bounds: LeafletLatLngBounds,
    options?: { padding?: [number, number]; maxZoom?: number }
  ) => void;
  flyTo: (
    latlng: [number, number],
    zoom?: number,
    options?: { animate?: boolean; duration?: number }
  ) => void;
  removeLayer: (layer: LeafletTileLayer | LeafletCircle) => void;
  addLayer: (layer: LeafletTileLayer) => void;
}

export interface LeafletLatLngBounds {
  isValid: () => boolean;
}

export interface LeafletLibrary {
  map: (
    container: HTMLElement,
    options?: Record<string, unknown>
  ) => LeafletMap;
  tileLayer: (
    url: string,
    options?: Record<string, unknown>
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
    options?: { icon?: LeafletDivIcon }
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
    }
  ) => LeafletCircle;
  latLngBounds: (coords: [number, number][]) => LeafletLatLngBounds;
}

// ============================================
// GLOBAL AUGMENTATION
// ============================================

declare global {
  interface Window {
    L?: LeafletLibrary;
  }
}

// ============================================
// MAP CONSTANTS
// ============================================

/** Status colors for map markers */
export const STATUS_COLORS = {
  OPERATIONAL: "#10b981",
  MAINTENANCE_NEEDED: "#f59e0b",
  OFFLINE: "#ef4444",
  UNVERIFIED: "#94a3b8",
} as const;

/** Default center coordinates for Jambi Province */
export const DEFAULT_CENTER: [number, number] = [-1.6, 103.6];

/** Default zoom level */
export const DEFAULT_ZOOM = 8;

/** Leaflet CDN URL */
export const LEAFLET_CDN_URL = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

/** Leaflet CDN integrity hash */
export const LEAFLET_CDN_INTEGRITY = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
