"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
  Compass,
  Download,
  Target,
  Circle,
  Route,
  Calculator,
  ChevronRight,
  X,
  Map as MapIcon,
  Ruler,
  AreaChart,
  Activity,
  FileJson,
  FileText,
  CheckCircle2,
  Loader2,
  GripVertical,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { MapPoint } from "@/types";

// ============================================
// TYPES
// ============================================

interface GisToolsPanelProps {
  points: MapPoint[];
  onBufferAnalysis?: (radius: number, center: [number, number] | null) => void;
  _onCoverageCalculation?: (data: CoverageData) => void;
  _onProximityAnalysis?: (data: ProximityResult[]) => void;
  selectedPoint?: MapPoint | null;
  hideOnMobile?: boolean;
}

interface CoverageData {
  totalAreaKm2: number;
  coveragePercentage: number;
  unitDensity: number;
  boundingBox: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

interface ProximityResult {
  unit: MapPoint;
  distanceKm: number;
}

interface RegencyStats {
  regency: string;
  count: number;
  operational: number;
  maintenanceNeeded: number;
  offline: number;
  unverified: number;
  density: number;
}

// ============================================
// GIS UTILITY FUNCTIONS
// ============================================

/**
 * Haversine formula for calculating distance between two coordinates
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate bounding box area in km²
 */
function calculateBoundingBoxArea(points: MapPoint[]): {
  areaKm2: number;
  boundingBox: { north: number; south: number; east: number; west: number };
} {
  if (points.length === 0) {
    return {
      areaKm2: 0,
      boundingBox: { north: 0, south: 0, east: 0, west: 0 },
    };
  }

  const lats = points.map((p) => p.latitude);
  const lons = points.map((p) => p.longitude);

  const north = Math.max(...lats);
  const south = Math.min(...lats);
  const east = Math.max(...lons);
  const west = Math.min(...lons);

  // Approximate area calculation using bounding box
  const latDistance = calculateDistance(south, west, north, west);
  const lonDistance = calculateDistance(south, west, south, east);
  const areaKm2 = latDistance * lonDistance;

  return { areaKm2, boundingBox: { north, south, east, west } };
}

/**
 * Calculate centroid of points
 */
function calculateCentroid(points: MapPoint[]): [number, number] {
  if (points.length === 0) return [0, 0];

  const avgLat = points.reduce((sum, p) => sum + p.latitude, 0) / points.length;
  const avgLon =
    points.reduce((sum, p) => sum + p.longitude, 0) / points.length;

  return [avgLat, avgLon];
}

/**
 * Convert data to GeoJSON format
 */
function convertToGeoJSON(points: MapPoint[]): object {
  return {
    type: "FeatureCollection",
    name: "PJUTS_Jambi_Province",
    crs: {
      type: "name",
      properties: {
        name: "urn:ogc:def:crs:OGC:1.3:CRS84",
      },
    },
    features: points.map((point) => ({
      type: "Feature",
      properties: {
        id: point.id,
        serialNumber: point.serialNumber,
        province: point.province,
        regency: point.regency,
        status: point.lastStatus,
        lastReport: point.lastReport
          ? {
              batteryVoltage: point.lastReport.batteryVoltage,
              reportedBy: point.lastReport.user,
              reportDate: point.lastReport.createdAt,
            }
          : null,
      },
      geometry: {
        type: "Point",
        coordinates: [point.longitude, point.latitude],
      },
    })),
  };
}

/**
 * Convert data to CSV format
 */
function convertToCSV(points: MapPoint[]): string {
  const headers = [
    "ID",
    "Serial Number",
    "Latitude",
    "Longitude",
    "Province",
    "Regency",
    "Status",
    "Battery Voltage",
    "Last Report By",
    "Last Report Date",
  ];

  const rows = points.map((p) => [
    p.id,
    p.serialNumber,
    p.latitude,
    p.longitude,
    p.province,
    p.regency,
    p.lastStatus,
    p.lastReport?.batteryVoltage ?? "",
    p.lastReport?.user ?? "",
    p.lastReport?.createdAt
      ? new Date(p.lastReport.createdAt).toISOString()
      : "",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ============================================
// TOOL SECTIONS
// ============================================

const toolSections = [
  {
    id: "analysis",
    label: "Analisis Spasial",
    icon: Calculator,
    description: "Buffer, proximity, dan area coverage",
  },
  {
    id: "export",
    label: "Ekspor Data",
    icon: Download,
    description: "GeoJSON, CSV, dan laporan",
  },
] as const;

type ToolSectionId = (typeof toolSections)[number]["id"];

// ============================================
// MAIN COMPONENT
// ============================================

export function GisToolsPanel({
  points,
  onBufferAnalysis,
  _onCoverageCalculation,
  _onProximityAnalysis,
  selectedPoint,
  hideOnMobile = false,
}: GisToolsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<ToolSectionId | null>(
    null,
  );
  const [bufferRadius, setBufferRadius] = useState(5); // km
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Responsive check
  const isDesktop = useMediaQuery("(min-width: 640px)");

  // Memoized calculations
  const coverageData = useMemo((): CoverageData => {
    const { areaKm2, boundingBox } = calculateBoundingBoxArea(points);
    const JAMBI_TOTAL_AREA = 53435; // Jambi Province area in km²

    return {
      totalAreaKm2: areaKm2,
      coveragePercentage: (areaKm2 / JAMBI_TOTAL_AREA) * 100,
      unitDensity: points.length > 0 ? points.length / areaKm2 : 0,
      boundingBox,
    };
  }, [points]);

  const regencyStats = useMemo((): RegencyStats[] => {
    const statsMap = new Map<string, RegencyStats>();

    points.forEach((point) => {
      const existing = statsMap.get(point.regency) || {
        regency: point.regency,
        count: 0,
        operational: 0,
        maintenanceNeeded: 0,
        offline: 0,
        unverified: 0,
        density: 0,
      };

      existing.count++;
      if (point.lastStatus === "OPERATIONAL") existing.operational++;
      if (point.lastStatus === "MAINTENANCE_NEEDED")
        existing.maintenanceNeeded++;
      if (point.lastStatus === "OFFLINE") existing.offline++;
      if (point.lastStatus === "UNVERIFIED") existing.unverified++;

      statsMap.set(point.regency, existing);
    });

    return Array.from(statsMap.values()).sort((a, b) => b.count - a.count);
  }, [points]);

  const proximityResults = useMemo((): ProximityResult[] => {
    if (!selectedPoint) return [];

    return points
      .filter((p) => p.id !== selectedPoint.id)
      .map((p) => ({
        unit: p,
        distanceKm: calculateDistance(
          selectedPoint.latitude,
          selectedPoint.longitude,
          p.latitude,
          p.longitude,
        ),
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 10);
  }, [points, selectedPoint]);

  const unitsInBuffer = useMemo(() => {
    if (!selectedPoint) return [];

    return points.filter((p) => {
      if (p.id === selectedPoint.id) return false;
      const distance = calculateDistance(
        selectedPoint.latitude,
        selectedPoint.longitude,
        p.latitude,
        p.longitude,
      );
      return distance <= bufferRadius;
    });
  }, [points, selectedPoint, bufferRadius]);

  const centroid = useMemo(() => calculateCentroid(points), [points]);

  // Export handlers
  const handleExportGeoJSON = useCallback(() => {
    setIsExporting(true);
    try {
      const geojson = convertToGeoJSON(points);
      const blob = new Blob([JSON.stringify(geojson, null, 2)], {
        type: "application/geo+json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pjuts_jambi_${new Date().toISOString().split("T")[0]}.geojson`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess("GeoJSON");
      setTimeout(() => setExportSuccess(null), 3000);
    } finally {
      setIsExporting(false);
    }
  }, [points]);

  const handleExportCSV = useCallback(() => {
    setIsExporting(true);
    try {
      const csv = convertToCSV(points);
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pjuts_jambi_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportSuccess("CSV");
      setTimeout(() => setExportSuccess(null), 3000);
    } finally {
      setIsExporting(false);
    }
  }, [points]);

  // Trigger buffer analysis callback
  const handleBufferApply = useCallback(() => {
    if (selectedPoint && onBufferAnalysis) {
      onBufferAnalysis(bufferRadius, [
        selectedPoint.latitude,
        selectedPoint.longitude,
      ]);
    }
  }, [bufferRadius, selectedPoint, onBufferAnalysis]);

  return (
    <>
      {/* Toggle Button - Draggable, positioned bottom-left to avoid overlap with Layer Switcher */}
      <motion.div
        drag
        dragConstraints={{ top: -400, left: -200, right: 200, bottom: 100 }}
        dragElastic={0.05}
        dragMomentum={false}
        dragTransition={{ bounceStiffness: 300, bounceDamping: 20 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setTimeout(() => setIsDragging(false), 50)}
        className={cn(
          "absolute bottom-[80px] left-[10px] z-[1000]",
          isOpen && "opacity-0 pointer-events-none",
          hideOnMobile && "sm:block hidden", // Hide on mobile when drawer is open
        )}
        style={{ touchAction: "none" }}
      >
        <motion.button
          onClick={() => !isDragging && setIsOpen(true)}
          className={cn(
            "bg-white/95 backdrop-blur-xl border border-slate-200/60",
            "shadow-lg rounded-xl",
            "transition-shadow duration-200",
            "text-[#003366] group",
            "cursor-grab active:cursor-grabbing",
            "select-none",
            isDragging ? "shadow-2xl" : "hover:shadow-xl",
          )}
          whileHover={{ scale: isDragging ? 1 : 1.05 }}
          animate={{ scale: isDragging ? 1.1 : 1 }}
          aria-label="Buka GIS Tools (drag untuk pindahkan)"
          title="Analisis Spasial - Drag untuk pindahkan"
        >
          <div className="flex items-center gap-1 p-2.5">
            <GripVertical className={cn(
              "w-3 h-3 transition-colors",
              isDragging ? "text-slate-500" : "text-slate-300 group-hover:text-slate-400"
            )} />
            <Compass className={cn(
              "w-5 h-5 transition-transform duration-300",
              !isDragging && "group-hover:rotate-45"
            )} />
          </div>
        </motion.button>
      </motion.div>

      {/* Panel Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop - absolute within map container */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/10 z-[1001] rounded"
            />

            {/* Panel */}
            <motion.div
              initial={
                isDesktop
                  ? { x: "100%", opacity: 0 }
                  : { y: "100%", opacity: 0 }
              }
              animate={isDesktop ? { x: 0, opacity: 1 } : { y: 0, opacity: 1 }}
              exit={
                isDesktop
                  ? { x: "100%", opacity: 0 }
                  : { y: "100%", opacity: 0 }
              }
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className={cn(
                "absolute z-[1002]",
                "bg-gradient-to-b from-white via-white to-slate-50",
                "shadow-2xl overflow-hidden flex flex-col",
                // Desktop Styles
                "sm:right-4 sm:top-4 sm:bottom-4 sm:w-[400px]",
                "sm:rounded-2xl sm:border border-slate-200/50",
                // Mobile Styles
                "inset-x-4 bottom-4 top-20",
                "rounded-3xl border border-slate-200/50",
              )}
            >
              {/* Mobile Drag Handle */}
              <div
                className="sm:hidden w-full flex justify-center pt-4 pb-2 bg-white"
                onClick={() => setIsOpen(false)}
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-200/80" />
              </div>
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#003366] to-[#335f87] flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Compass className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                      GIS Tools
                    </h2>
                    <p className="text-xs text-slate-500">
                      Analisis & Ekspor Spasial
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stats */}
              <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-2xl font-bold text-slate-900">
                      {points.length}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Unit Total
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-2xl font-bold text-[#D4AF37]">
                      {coverageData.totalAreaKm2.toFixed(0)}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Area (km²)
                    </div>
                  </div>
                  <div className="text-center p-3 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="text-2xl font-bold text-[#003366]">
                      {regencyStats.length}
                    </div>
                    <div className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                      Kabupaten
                    </div>
                  </div>
                </div>
              </div>

              {/* Tool Sections */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {toolSections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <div key={section.id}>
                      <button
                        onClick={() =>
                          setActiveSection(isActive ? null : section.id)
                        }
                        className={cn(
                          "w-full flex items-center justify-between p-4 rounded-2xl",
                          "border transition-all duration-200",
                          isActive
                            ? "bg-[#003366]/5 border-[#003366]/20 shadow-sm ring-1 ring-[#003366]/10"
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                              isActive
                                ? "bg-[#003366] text-white shadow-lg shadow-blue-900/10"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <div className="font-semibold text-slate-900">
                              {section.label}
                            </div>
                            <div className="text-xs text-slate-500">
                              {section.description}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "w-5 h-5 text-slate-400 transition-transform duration-200",
                            isActive && "rotate-90",
                          )}
                        />
                      </button>

                      {/* Section Content */}
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-3 space-y-3">
                              {section.id === "analysis" && (
                                <>
                                  {/* Buffer Analysis */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Circle className="w-4 h-4 text-[#003366]" />
                                      <span className="font-semibold text-sm text-slate-800">
                                        Analisis Buffer
                                      </span>
                                    </div>
                                    {selectedPoint ? (
                                      <>
                                        <div className="mb-3">
                                          <div className="flex justify-between text-xs text-slate-500 mb-2">
                                            <span>Radius Buffer</span>
                                            <span className="font-mono font-bold text-[#003366]">
                                              {bufferRadius} km
                                            </span>
                                          </div>
                                          <Slider
                                            value={[bufferRadius]}
                                            onValueChange={(v) =>
                                              setBufferRadius(v[0])
                                            }
                                            min={1}
                                            max={50}
                                            step={1}
                                            className="w-full"
                                          />
                                        </div>
                                        <div className="p-3 bg-slate-50 rounded-lg mb-3">
                                          <div className="text-xs text-slate-500 mb-1">
                                            Unit dalam radius:
                                          </div>
                                          <div className="text-2xl font-bold text-slate-900">
                                            {unitsInBuffer.length}
                                          </div>
                                        </div>
                                        <Button
                                          onClick={handleBufferApply}
                                          size="sm"
                                          className="w-full bg-[#003366] hover:bg-[#002a52] text-white active:scale-[0.98]"
                                        >
                                          <Target className="w-4 h-4 mr-2" />
                                          Terapkan Buffer
                                        </Button>
                                      </>
                                    ) : (
                                      <div className="p-4 text-center bg-slate-50 rounded-lg">
                                        <Target className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">
                                          Pilih unit pada peta untuk analisis
                                          buffer
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Proximity Analysis */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Route className="w-4 h-4 text-[#D4AF37]" />
                                      <span className="font-semibold text-sm text-slate-800">
                                        Analisis Kedekatan
                                      </span>
                                    </div>
                                    {selectedPoint &&
                                    proximityResults.length > 0 ? (
                                      <div className="space-y-2 max-h-48 overflow-y-auto">
                                        {proximityResults
                                          .slice(0, 5)
                                          .map((result, i) => (
                                            <div
                                              key={result.unit.id}
                                              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                            >
                                              <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold">
                                                  {i + 1}
                                                </span>
                                                <span className="text-xs font-medium text-slate-700 truncate max-w-[140px]">
                                                  {result.unit.serialNumber}
                                                </span>
                                              </div>
                                              <span className="text-xs font-mono font-bold text-[#003366]">
                                                {result.distanceKm.toFixed(2)}{" "}
                                                km
                                              </span>
                                            </div>
                                          ))}
                                      </div>
                                    ) : (
                                      <div className="p-4 text-center bg-slate-50 rounded-lg">
                                        <Route className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs text-slate-500">
                                          Pilih unit untuk melihat jarak
                                          terdekat
                                        </p>
                                      </div>
                                    )}
                                  </div>

                                  {/* Coverage Analysis */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <AreaChart className="w-4 h-4 text-purple-600" />
                                      <span className="font-semibold text-sm text-slate-800">
                                        Analisis Cakupan
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="p-3 bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg">
                                        <div className="text-xs text-purple-600 mb-1">
                                          Area Bounding
                                        </div>
                                        <div className="text-lg font-bold text-purple-900">
                                          {coverageData.totalAreaKm2.toFixed(1)}{" "}
                                          km²
                                        </div>
                                      </div>
                                      <div className="p-3 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
                                        <div className="text-xs text-blue-600 mb-1">
                                          Densitas
                                        </div>
                                        <div className="text-lg font-bold text-blue-900">
                                          {coverageData.unitDensity.toFixed(3)}
                                        </div>
                                        <div className="text-[10px] text-blue-500">
                                          unit/km²
                                        </div>
                                      </div>
                                      <div className="p-3 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                                        <div className="text-xs text-amber-600 mb-1">
                                          Centroid
                                        </div>
                                        <div className="text-xs font-mono font-bold text-amber-900">
                                          {centroid[0].toFixed(4)}°
                                        </div>
                                        <div className="text-xs font-mono font-bold text-amber-900">
                                          {centroid[1].toFixed(4)}°
                                        </div>
                                      </div>
                                      <div className="p-3 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg">
                                        <div className="text-xs text-emerald-600 mb-1">
                                          Cakupan
                                        </div>
                                        <div className="text-lg font-bold text-emerald-900">
                                          {coverageData.coveragePercentage.toFixed(
                                            2,
                                          )}
                                          %
                                        </div>
                                        <div className="text-[10px] text-emerald-500">
                                          dari Jambi
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Regency Statistics */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <Activity className="w-4 h-4 text-orange-600" />
                                      <span className="font-semibold text-sm text-slate-800">
                                        Statistik per Kabupaten
                                      </span>
                                    </div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                      {regencyStats.map((stat) => (
                                        <div
                                          key={stat.regency}
                                          className="p-3 bg-slate-50 rounded-lg"
                                        >
                                          <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-semibold text-slate-700 truncate max-w-[200px]">
                                              {stat.regency}
                                            </span>
                                            <span className="text-xs font-bold text-slate-900">
                                              {stat.count} unit
                                            </span>
                                          </div>
                                          <div className="flex gap-1">
                                            <div
                                              className="h-1.5 rounded-full bg-emerald-500"
                                              style={{
                                                width: `${(stat.operational / stat.count) * 100}%`,
                                              }}
                                              title={`Operasional: ${stat.operational}`}
                                            />
                                            <div
                                              className="h-1.5 rounded-full bg-amber-500"
                                              style={{
                                                width: `${(stat.maintenanceNeeded / stat.count) * 100}%`,
                                              }}
                                              title={`Perawatan: ${stat.maintenanceNeeded}`}
                                            />
                                            <div
                                              className="h-1.5 rounded-full bg-red-500"
                                              style={{
                                                width: `${(stat.offline / stat.count) * 100}%`,
                                              }}
                                              title={`Offline: ${stat.offline}`}
                                            />
                                            <div
                                              className="h-1.5 rounded-full bg-slate-400"
                                              style={{
                                                width: `${(stat.unverified / stat.count) * 100}%`,
                                              }}
                                              title={`Belum Verifikasi: ${stat.unverified}`}
                                            />
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}

                              {section.id === "export" && (
                                <>
                                  {/* GeoJSON Export */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <FileJson className="w-4 h-4 text-[#003366]" />
                                      <span className="font-semibold text-sm text-slate-800">
                                        Ekspor GeoJSON
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">
                                      Format standar GIS untuk digunakan di
                                      QGIS, ArcGIS, atau aplikasi pemetaan
                                      lainnya.
                                    </p>
                                    <Button
                                      onClick={handleExportGeoJSON}
                                      disabled={isExporting}
                                      className="w-full bg-[#003366] hover:bg-[#002a52] active:scale-[0.98]"
                                    >
                                      {isExporting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : exportSuccess === "GeoJSON" ? (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                      ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                      )}
                                      {exportSuccess === "GeoJSON"
                                        ? "Berhasil!"
                                        : "Unduh GeoJSON"}
                                    </Button>
                                  </div>

                                  {/* CSV Export */}
                                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-2 mb-3">
                                      <FileText className="w-4 h-4 text-blue-600" />
                                      <span className="font-semibold text-sm text-slate-800">
                                        Ekspor CSV
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mb-3">
                                      Format spreadsheet untuk analisis di Excel
                                      atau Google Sheets.
                                    </p>
                                    <Button
                                      onClick={handleExportCSV}
                                      disabled={isExporting}
                                      variant="outline"
                                      className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                                    >
                                      {isExporting ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                      ) : exportSuccess === "CSV" ? (
                                        <CheckCircle2 className="w-4 h-4 mr-2" />
                                      ) : (
                                        <Download className="w-4 h-4 mr-2" />
                                      )}
                                      {exportSuccess === "CSV"
                                        ? "Berhasil!"
                                        : "Unduh CSV"}
                                    </Button>
                                  </div>

                                  {/* Export Info */}
                                  <div className="p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                                    <div className="flex items-start gap-3">
                                      <MapIcon className="w-5 h-5 text-slate-400 mt-0.5" />
                                      <div>
                                        <div className="text-xs font-semibold text-slate-700 mb-1">
                                          Info Ekspor
                                        </div>
                                        <div className="text-xs text-slate-500 space-y-1">
                                          <p>
                                            • Total {points.length} unit akan
                                            diekspor
                                          </p>
                                          <p>• CRS: WGS 84 (EPSG:4326)</p>
                                          <p>
                                            • Termasuk data laporan terakhir
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Ruler className="w-3 h-3" />
                    Proyeksi: WGS 84
                  </span>
                  <span>
                    Terakhir diperbarui:{" "}
                    {new Date().toLocaleTimeString("id-ID")}
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
