"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Copy,
  Check,
  LogIn,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { MapPoint, UnitStatus } from "@/types";
import {
  type BaseLayerType,
  type OverlayType,
} from "@/components/map/layer-switcher";
import { LayerSwitcher } from "@/components/map/layer-switcher";
import { MapLegend } from "@/components/map/map-filters";
import { PublicUnitDetailDrawer } from "./public-unit-detail-drawer";

// ============================================
// TYPES
// ============================================

/** Public API response shape */
interface PublicMapPoint {
  id: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  province: string;
  regency: string;
  lastStatus: UnitStatus;
}

// ============================================
// DYNAMIC IMPORTS
// ============================================

const MapContainer = dynamic(
  () =>
    import("@/components/map/map-container").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
          <Skeleton className="w-32 h-4 mx-auto" />
          <p className="text-xs text-slate-400 mt-2">Memuat peta...</p>
        </div>
      </div>
    ),
  },
);

// ============================================
// STATUS FILTER CONFIG
// ============================================

const statusFilters = [
  {
    value: "OPERATIONAL",
    label: "Operasional",
    icon: CheckCircle2,
    bgColor: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    activeColor: "bg-emerald-600 text-white hover:bg-emerald-700",
    dotColor: "bg-emerald-500",
  },
  {
    value: "MAINTENANCE_NEEDED",
    label: "Perlu Perawatan",
    icon: AlertTriangle,
    bgColor: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    activeColor: "bg-amber-600 text-white hover:bg-amber-700",
    dotColor: "bg-amber-500",
  },
  {
    value: "OFFLINE",
    label: "Offline",
    icon: XCircle,
    bgColor: "bg-red-50 hover:bg-red-100 border-red-200",
    activeColor: "bg-red-600 text-white hover:bg-red-700",
    dotColor: "bg-red-500",
  },
  {
    value: "UNVERIFIED",
    label: "Belum Verifikasi",
    icon: HelpCircle,
    bgColor: "bg-slate-50 hover:bg-slate-100 border-slate-200",
    activeColor: "bg-slate-600 text-white hover:bg-slate-700",
    dotColor: "bg-slate-400",
  },
];

// ============================================
// SHARE MAP CLIENT COMPONENT
// ============================================

export function ShareableMapClient() {
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [activeLayer, setActiveLayer] =
    useState<BaseLayerType>("openstreetmap");
  const [activeOverlays, setActiveOverlays] = useState<OverlayType[]>([]);
  const [copied, setCopied] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Fetch public map data
  useEffect(() => {
    async function fetchPoints() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/public/map", {
          next: { revalidate: 300 },
        });

        // If access is denied, reload to show the gate page
        if (res.status === 401) {
          window.location.reload();
          return;
        }

        if (!res.ok) throw new Error("Gagal memuat data peta");
        const json = await res.json();
        if (!json.success)
          throw new Error(json.error || "Gagal memuat data peta");

        // Map public points to MapPoint shape (no lastReport for public)
        const mapped: MapPoint[] = (json.data as PublicMapPoint[]).map((p) => ({
          id: p.id,
          serialNumber: p.serialNumber,
          latitude: p.latitude,
          longitude: p.longitude,
          province: p.province,
          regency: p.regency,
          lastStatus: p.lastStatus,
        }));
        setPoints(mapped);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    }
    fetchPoints();
  }, []);

  // Status counts
  const counts = useMemo(() => {
    const c = {
      operational: 0,
      maintenanceNeeded: 0,
      offline: 0,
      unverified: 0,
    };
    for (const p of points) {
      switch (p.lastStatus) {
        case "OPERATIONAL":
          c.operational++;
          break;
        case "MAINTENANCE_NEEDED":
          c.maintenanceNeeded++;
          break;
        case "OFFLINE":
          c.offline++;
          break;
        case "UNVERIFIED":
          c.unverified++;
          break;
      }
    }
    return c;
  }, [points]);

  const totalCount =
    counts.operational +
    counts.maintenanceNeeded +
    counts.offline +
    counts.unverified;

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  }, []);

  // Handle marker clicks (both from onPointClick and custom event)
  const handlePointClick = useCallback((point: MapPoint) => {
    setSelectedUnitId(point.id);
  }, []);

  useEffect(() => {
    const handleMapPointClick = (event: CustomEvent<string>) => {
      setSelectedUnitId(event.detail);
    };
    window.addEventListener(
      "map-point-click",
      handleMapPointClick as EventListener,
    );
    return () => {
      window.removeEventListener(
        "map-point-click",
        handleMapPointClick as EventListener,
      );
    };
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedUnitId(null);
  }, []);

  const handleLayerChange = useCallback((layer: BaseLayerType) => {
    setActiveLayer(layer);
  }, []);

  const handleOverlayToggle = useCallback((overlay: OverlayType) => {
    setActiveOverlays((prev) =>
      prev.includes(overlay)
        ? prev.filter((o) => o !== overlay)
        : [...prev, overlay],
    );
  }, []);

  return (
    <div className="min-h-screen bg-[#F8F9FB] relative selection:bg-primary/10 selection:text-primary">
      {/* Floating Island Header */}
      <div className="sticky top-6 z-50 px-4 w-full pointer-events-none flex justify-center pb-4">
        <header className="pointer-events-auto bg-white/70 backdrop-blur-xl border border-white/40 shadow-xl shadow-slate-200/40 ring-1 ring-black/5 rounded-full py-2 pl-2 pr-2 sm:pl-3 flex items-center gap-3 sm:gap-6 max-w-screen-md w-full sm:w-auto transition-all duration-500 hover:bg-white/80 hover:scale-[1.01] hover:shadow-2xl hover:shadow-blue-900/5 group">
          {/* Brand Identity */}
          <div className="flex items-center gap-3 pl-1">
            <div className="relative shrink-0 group-hover:scale-110 transition-transform duration-500">
              <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full animate-pulse group-hover:bg-yellow-400/30 transition-colors" />
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={40}
                height={40}
                className="w-10 h-10 object-contain drop-shadow-md relative z-10"
              />
            </div>

            <div className="flex flex-col justify-center min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 leading-none tracking-tight group-hover:text-primary transition-colors truncate">
                  PJUTS <span className="text-primary">ESDM</span>
                </h1>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-[9px] font-black text-blue-600 uppercase tracking-wider shadow-sm">
                  Public Cloud
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5 truncate max-w-[120px] sm:max-w-none">
                Monitoring System
              </p>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-px h-8 bg-gradient-to-b from-transparent via-slate-200 to-transparent mx-auto" />

          {/* Action Hub */}
          <div className="flex items-center gap-1.5 ml-auto sm:ml-0 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyLink}
              className="rounded-full h-9 px-3 sm:px-4 text-xs font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-100/80 transition-all hover:scale-105 active:scale-95"
            >
              {copied ? (
                <span className="flex items-center gap-1.5 text-emerald-600 animate-in fade-in zoom-in duration-300">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </div>
                  <span className="hidden sm:inline">Tersalin</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Share</span>
                </span>
              )}
            </Button>

            <Button
              size="sm"
              asChild
              className="rounded-full h-9 px-4 sm:px-5 bg-slate-900 text-white hover:bg-slate-800 hover:ring-4 hover:ring-slate-100 transition-all shadow-lg shadow-slate-900/20 active:scale-95"
            >
              <a href="/login" className="flex items-center gap-2">
                <span className="text-xs font-bold">Masuk</span>
                <LogIn className="w-3.5 h-3.5 text-white/90" />
              </a>
            </Button>
          </div>
        </header>
      </div>

      <main className="container mx-auto px-4 py-4 sm:py-6">
        {/* Mobile Status Filter (Horizontal Scroll) */}
        <div className="sm:hidden mb-4 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2 snap-x">
          {statusFilters.map((filter) => {
            const countKey =
              filter.value === "OPERATIONAL"
                ? "operational"
                : filter.value === "MAINTENANCE_NEEDED"
                  ? "maintenanceNeeded"
                  : filter.value === "OFFLINE"
                    ? "offline"
                    : "unverified";
            const count = counts[countKey];
            const isActive = selectedStatus === filter.value;

            return (
              <button
                key={filter.value}
                onClick={() =>
                  setSelectedStatus(isActive ? null : filter.value)
                }
                className={cn(
                  "snap-start shrink-0 flex items-center gap-2 px-3 py-2 rounded-full border transition-all text-sm font-medium whitespace-nowrap shadow-sm active:scale-95",
                  isActive
                    ? cn(
                        filter.activeColor,
                        "border-transparent ring-2 ring-offset-1 ring-offset-[#F8F9FB]",
                        filter.value === "OPERATIONAL"
                          ? "ring-emerald-500"
                          : filter.value === "MAINTENANCE_NEEDED"
                            ? "ring-amber-500"
                            : filter.value === "OFFLINE"
                              ? "ring-red-500"
                              : "ring-slate-400",
                      )
                    : "bg-white border-slate-200 text-slate-600",
                )}
              >
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    isActive ? "bg-white" : filter.dotColor,
                  )}
                />
                <span>{filter.label}</span>
                <span
                  className={cn(
                    "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {loading ? "-" : count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Status summary - Creative Pill Design */}
        <div className="hidden sm:grid grid-cols-4 gap-3 mb-6 relative z-10 w-full max-w-4xl mx-auto">
          {statusFilters.map((filter) => {
            const countKey =
              filter.value === "OPERATIONAL"
                ? "operational"
                : filter.value === "MAINTENANCE_NEEDED"
                  ? "maintenanceNeeded"
                  : filter.value === "OFFLINE"
                    ? "offline"
                    : "unverified";
            const count = counts[countKey];
            const isActive = selectedStatus === filter.value;
            const Icon = filter.icon;

            return (
              <button
                key={filter.value}
                onClick={() =>
                  setSelectedStatus(isActive ? null : filter.value)
                }
                className={cn(
                  "group relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 w-full text-left",
                  isActive
                    ? cn(
                        filter.activeColor,
                        "ring-2 ring-offset-2 ring-offset-[#F8F9FB]",
                        filter.value === "OPERATIONAL"
                          ? "ring-emerald-500"
                          : filter.value === "MAINTENANCE_NEEDED"
                            ? "ring-amber-500"
                            : filter.value === "OFFLINE"
                              ? "ring-red-500"
                              : "ring-slate-400",
                      )
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300",
                )}
              >
                <div
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%]",
                  )}
                />

                <div
                  className={cn(
                    "w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                    isActive ? "bg-white/20" : filter.bgColor,
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive
                        ? "text-white"
                        : filter.value === "OPERATIONAL"
                          ? "text-emerald-600"
                          : filter.value === "MAINTENANCE_NEEDED"
                            ? "text-amber-600"
                            : filter.value === "OFFLINE"
                              ? "text-red-600"
                              : "text-slate-500",
                    )}
                  />
                </div>

                <div className="flex flex-col items-start min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 leading-none mb-1 truncate w-full">
                    {filter.label}
                  </span>
                  <span className="text-lg font-black leading-none">
                    {loading ? "..." : count}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Total counter */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="px-3 py-1 bg-white border border-slate-200 rounded-full shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              {loading
                ? "Memuat data sistem..."
                : `${selectedStatus ? points.filter((p) => p.lastStatus === selectedStatus).length : totalCount} Unit Terpantau`}
            </p>
          </div>

          {selectedStatus && (
            <button
              onClick={() => setSelectedStatus(null)}
              className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-full hover:bg-slate-800 transition-colors shadow-sm"
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Error state */}
        {error && (
          <Card className="p-8 text-center mb-4">
            <XCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <p className="text-sm text-red-600 font-medium mb-3">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Coba Lagi
            </Button>
          </Card>
        )}

        {/* Map */}
        {!error && (
          <Card className="relative overflow-hidden border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] ring-1 ring-slate-100">
            <div className="h-[65vh] sm:h-[75vh] lg:h-[80vh] bg-slate-50">
              {loading ? (
                <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
                  <div className="relative z-10 text-center space-y-6">
                    <div className="relative mx-auto w-20 h-20">
                      <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                      <div className="relative bg-white p-4 rounded-full shadow-xl">
                        <Image
                          src="/logo-esdm.png"
                          alt="Loading"
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain animate-pulse"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg font-black text-slate-800">
                        Memuat Peta Digital
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">
                        Menghubungkan ke satelit PJUTS cloud...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <MapContainer
                    points={points}
                    selectedStatus={selectedStatus}
                    selectedUnitId={selectedUnitId}
                    onPointClick={handlePointClick}
                    activeLayer={activeLayer}
                    activeOverlays={activeOverlays}
                  />
                  <LayerSwitcher
                    activeLayer={activeLayer}
                    activeOverlays={activeOverlays}
                    onLayerChange={handleLayerChange}
                    onOverlayToggle={handleOverlayToggle}
                    hideOnMobile={!!selectedUnitId}
                  />
                </>
              )}
              <MapLegend hideOnMobile={!!selectedUnitId} />
            </div>
          </Card>
        )}

        {/* Footer */}
        <footer className="mt-8 mb-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full border border-slate-100 shadow-sm transition-all hover:bg-white/80">
            <Image
              src="/logo-esdm.png"
              alt="ESDM"
              width={16}
              height={16}
              className="w-4 h-4 opacity-70"
            />
            <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
              © {new Date().getFullYear()} Dinas ESDM Provinsi Jambi &bull;
              Cloud Monitoring System
            </p>
          </div>
        </footer>
      </main>

      {/* Public Unit Detail Drawer */}
      <PublicUnitDetailDrawer
        unitId={selectedUnitId}
        onClose={handleCloseDrawer}
      />
    </div>
  );
}
