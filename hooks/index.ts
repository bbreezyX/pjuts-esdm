/**
 * Custom Hooks Index
 * 
 * Central export for all custom hooks used in the application.
 */

// Mobile & responsive hooks
export { useMobileNav, MobileNavProvider } from "./use-mobile-nav";
export { useMediaQuery } from "./use-media-query";

// Map-related hooks
export { useLeaflet, type UseLeafletOptions, type UseLeafletReturn } from "./use-leaflet";
export { useMapLayers, type UseMapLayersOptions } from "./use-map-layers";
export { useMapMarkers, type UseMapMarkersOptions } from "./use-map-markers";
export {
  useMapBounds,
  type UseMapBoundsOptions,
  isValidCoordinate,
  filterValidPoints,
} from "./use-map-bounds";
