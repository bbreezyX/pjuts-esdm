"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Map as MapIcon,
  Satellite,
  Building2,
  ChevronDown,
  Eye,
  EyeOff,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

export type BaseLayerType = "openstreetmap" | "satellite" | "toner";

export type OverlayType =
  | "none"
  | "labels"
  | "boundaries"
  | "transport"
  | "cycling";

export interface LayerConfig {
  id: BaseLayerType;
  name: string;
  description: string;
  icon: typeof MapIcon;
  url: string;
  attribution: string;
  maxZoom?: number;
  opacity?: number;
}

export interface OverlayConfig {
  id: OverlayType;
  name: string;
  icon: typeof MapIcon;
  url: string;
  attribution: string;
  isEnabled: boolean;
}

interface LayerSwitcherProps {
  activeLayer: BaseLayerType;
  activeOverlays: OverlayType[];
  onLayerChange: (layer: BaseLayerType) => void;
  onOverlayToggle: (overlay: OverlayType) => void;
  className?: string;
}

// ============================================
// LAYER CONFIGURATIONS
// ============================================

export const BASE_LAYERS: LayerConfig[] = [
  {
    id: "openstreetmap",
    name: "Peta Jalan",
    description: "OpenStreetMap standar",
    icon: MapIcon,
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  {
    id: "satellite",
    name: "Satelit",
    description: "Citra satelit resolusi tinggi",
    icon: Satellite,
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: '&copy; <a href="https://www.esri.com">Esri</a>',
    maxZoom: 19,
  },
  {
    id: "toner",
    name: "Monokrom",
    description: "Hitam putih high contrast",
    icon: Building2,
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
];

export const OVERLAY_LAYERS: OverlayConfig[] = [
  {
    id: "labels",
    name: "Label Nama",
    icon: MapIcon,
    url: "https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    isEnabled: false,
  },
];

// ============================================
// LAYER PREVIEW THUMBNAIL COMPONENT
// ============================================

function LayerPreview({
  layer,
  isActive,
}: {
  layer: LayerConfig;
  isActive: boolean;
}) {
  const Icon = layer.icon;

  // Color gradients based on layer type
  const gradients: Record<BaseLayerType, string> = {
    openstreetmap: "from-blue-50 via-white to-orange-50/30",
    satellite: "from-slate-900 via-slate-800 to-slate-700",
    toner: "from-slate-100 via-gray-50 to-white",
  };

  return (
    <div
      className={cn(
        "relative w-full aspect-[4/3] rounded-xl overflow-hidden",
        "bg-gradient-to-br",
        gradients[layer.id],
        "transition-all duration-300 group-hover:shadow-md",
        isActive && "ring-2 ring-[#D4AF37] ring-offset-2 shadow-lg",
      )}
    >
      {/* Pattern overlay for visual interest */}
      <div className="absolute inset-0 opacity-20">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <pattern
            id={`pattern-${layer.id}`}
            x="0"
            y="0"
            width="20"
            height="20"
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="currentColor" opacity="0.3" />
          </pattern>
          <rect width="100%" height="100%" fill={`url(#pattern-${layer.id})`} />
        </svg>
      </div>

      {/* Center icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon
          className={cn(
            "w-8 h-8 transition-all duration-200",
            layer.id === "satellite" ? "text-white/60" : "text-slate-700/40",
            isActive && "scale-110",
          )}
        />
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-md z-10"
        >
          <Check className="w-3 h-3 text-white stroke-[3px]" />
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function LayerSwitcher({
  activeLayer,
  activeOverlays,
  onLayerChange,
  onOverlayToggle,
  className,
}: LayerSwitcherProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showOverlays, setShowOverlays] = useState(false);

  // Find active layer config
  const activeLayerConfig =
    BASE_LAYERS.find((l) => l.id === activeLayer) || BASE_LAYERS[0];

  // Close on outside click
  useEffect(() => {
    if (!isExpanded) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-layer-switcher]")) {
        setIsExpanded(false);
        setShowOverlays(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isExpanded]);

  return (
    <div
      className={cn("absolute top-4 left-4 z-[1000]", className)}
      data-layer-switcher
    >
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          // Collapsed state - compact elegant button
          <motion.button
            key="collapsed"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            onClick={() => setIsExpanded(true)}
            className={cn(
              "group flex items-center gap-2.5 px-3 py-2.5",
              "bg-white/95 backdrop-blur-md border border-slate-200/60",
              "shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-2xl",
              "transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.16)] hover:scale-[1.02] active:scale-[0.98]",
              "text-slate-700",
            )}
            title="Ganti Peta Dasar"
          >
            <div className="w-7 h-7 rounded-lg overflow-hidden shadow-sm border border-slate-100">
              <LayerPreview layer={activeLayerConfig} isActive={false} />
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-slate-700">
                {activeLayerConfig.name}
              </div>
              <div className="text-[9px] text-slate-400">Ubah peta</div>
            </div>
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-[#D4AF37] transition-colors" />
          </motion.button>
        ) : (
          // Expanded state - full panel
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "bg-white/95 backdrop-blur-xl border border-slate-200/50",
              "shadow-2xl rounded-3xl overflow-hidden",
              "w-[320px] sm:w-[360px]",
            )}
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#335f87] flex items-center justify-center shadow-lg shadow-blue-900/20">
                    <Layers className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Peta Dasar
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      Pilih gaya peta
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsExpanded(false);
                    setShowOverlays(false);
                  }}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Base Layers Grid */}
            <div className="p-4">
              <div className="grid grid-cols-3 gap-3">
                {BASE_LAYERS.map((layer) => {
                  const isActive = activeLayer === layer.id;

                  return (
                    <button
                      key={layer.id}
                      onClick={() => onLayerChange(layer.id)}
                      className={cn(
                        "text-left group transition-all duration-200",
                        "rounded-xl p-2",
                        isActive ? "bg-[#003366]/5" : "hover:bg-slate-50",
                      )}
                    >
                      <LayerPreview layer={layer} isActive={isActive} />
                      <div className="mt-2 text-center">
                        <div
                          className={cn(
                            "text-[11px] font-semibold truncate",
                            isActive ? "text-[#003366]" : "text-slate-600",
                          )}
                        >
                          {layer.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Overlay Layers Section */}
            <div className="border-t border-slate-100">
              <button
                onClick={() => setShowOverlays(!showOverlays)}
                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700">
                    Lapisan Overlay
                  </span>
                  {activeOverlays.length > 0 && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#D4AF37]/10 text-[#B8962E] rounded-full border border-[#D4AF37]/20">
                      {activeOverlays.length}
                    </span>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-slate-400 transition-transform duration-200",
                    showOverlays && "rotate-180",
                  )}
                />
              </button>

              <AnimatePresence>
                {showOverlays && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-2">
                      {OVERLAY_LAYERS.map((overlay) => {
                        const isEnabled = activeOverlays.includes(overlay.id);
                        const Icon = overlay.icon;

                        return (
                          <button
                            key={overlay.id}
                            onClick={() => onOverlayToggle(overlay.id)}
                            className={cn(
                              "w-full flex items-center justify-between p-3 rounded-xl",
                              "border transition-all duration-200",
                              isEnabled
                                ? "bg-[#003366]/5 border-[#003366]/20 shadow-sm"
                                : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50",
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                  isEnabled
                                    ? "bg-[#003366] text-white"
                                    : "bg-slate-100 text-slate-500",
                                )}
                              >
                                <Icon className="w-4 h-4" />
                              </div>
                              <span
                                className={cn(
                                  "text-xs font-semibold",
                                  isEnabled
                                    ? "text-[#003366]"
                                    : "text-slate-700",
                                )}
                              >
                                {overlay.name}
                              </span>
                            </div>
                            {isEnabled ? (
                              <Eye className="w-4 h-4 text-[#003366]" />
                            ) : (
                              <EyeOff className="w-4 h-4 text-slate-400" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer info */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-500 text-center">
                Peta: {activeLayerConfig.name} • {activeOverlays.length} overlay
                aktif
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
