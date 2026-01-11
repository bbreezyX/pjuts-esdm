"use client";

import { useState, useEffect } from "react";
import { CheckCircle, WarningTriangle, XmarkCircle, HelpCircle, Map, NavArrowDown } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MapFiltersProps {
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
  counts: {
    operational: number;
    maintenanceNeeded: number;
    offline: number;
    unverified: number;
  };
}

const statusFilters = [
  {
    value: "OPERATIONAL",
    label: "Operasional",
    icon: CheckCircle,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    activeColor: "bg-emerald-600 text-white hover:bg-emerald-700",
    countKey: "operational" as const,
  },
  {
    value: "MAINTENANCE_NEEDED",
    label: "Perlu Perawatan",
    icon: WarningTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    activeColor: "bg-amber-600 text-white hover:bg-amber-700",
    countKey: "maintenanceNeeded" as const,
  },
  {
    value: "OFFLINE",
    label: "Offline",
    icon: XmarkCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100 border-red-200",
    activeColor: "bg-red-600 text-white hover:bg-red-700",
    countKey: "offline" as const,
  },
  {
    value: "UNVERIFIED",
    label: "Belum Verifikasi",
    icon: HelpCircle,
    color: "text-slate-500",
    bgColor: "bg-slate-50 hover:bg-slate-100 border-slate-200",
    activeColor: "bg-slate-600 text-white hover:bg-slate-700",
    countKey: "unverified" as const,
  },
];

export function MapFilters({
  selectedStatus,
  onStatusChange,
  counts,
}: MapFiltersProps) {
  const totalCount = counts.operational + counts.maintenanceNeeded + counts.offline + counts.unverified;

  return (
    <div className="w-full overflow-x-auto pb-2 sm:pb-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-1.5 p-1.5 bg-white/90 backdrop-blur-md border border-slate-200/60 rounded-2xl transition-all min-w-max sm:min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(null)}
          className={cn(
            "rounded-xl px-3 py-1.5 h-auto transition-all duration-300 shrink-0",
            selectedStatus === null
              ? "bg-slate-800 text-white shadow-md hover:bg-slate-900"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <span className="font-medium mr-2">Semua</span>
          <span className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors",
            selectedStatus === null ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
          )}>
            {totalCount}
          </span>
        </Button>

        <div className="w-px h-6 bg-slate-200 mx-1 shrink-0" />

        {statusFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedStatus === filter.value;
          const count = counts[filter.countKey];

          // Custom active colors map to handle the full background fill style
          const activeStyles = {
            OPERATIONAL: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-md ring-2 ring-emerald-200",
            MAINTENANCE_NEEDED: "bg-amber-500 text-white hover:bg-amber-600 shadow-md ring-2 ring-amber-200",
            OFFLINE: "bg-red-500 text-white hover:bg-red-600 shadow-md ring-2 ring-red-200",
            UNVERIFIED: "bg-slate-500 text-white hover:bg-slate-600 shadow-md ring-2 ring-slate-200",
          };

          const activeStyle = activeStyles[filter.value as keyof typeof activeStyles] || "bg-slate-800 text-white";

          return (
            <Button
              key={filter.value}
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(isActive ? null : filter.value)}
              className={cn(
                "rounded-xl px-3 py-1.5 h-auto border border-transparent transition-all duration-300 shrink-0",
                isActive
                  ? activeStyle
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-200"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 mr-1.5 transition-transform duration-300",
                isActive ? "scale-110" : filter.color
              )} />
              <span className={cn("inline font-medium", isActive && "text-white")}>
                {filter.label}
              </span>
              <span
                className={cn(
                  "ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full inline transition-colors",
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}
              >
                {count}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}

// Legend component for the map
export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
      // Auto expand on desktop, collapse on mobile by default
      if (window.innerWidth >= 640) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isExpanded && isMobile) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg rounded-full p-3 z-[1000] transition-all hover:shadow-xl hover:scale-105 active:scale-95 text-slate-700"
        aria-label="Lihat Legenda"
      >
        <Map className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md border border-slate-200/60 shadow-lg rounded-2xl p-4 z-[1000] transition-all hover:shadow-xl min-w-[160px] animate-in slide-in-from-bottom-2 fade-in duration-300">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Status Unit</h3>
        {isMobile && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <NavArrowDown className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2.5 text-xs group">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-emerald-100 group-hover:ring-emerald-200 transition-all"
            style={{ backgroundColor: "#10b981" }}
          />
          <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Operasional</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs group">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-amber-100 group-hover:ring-amber-200 transition-all"
            style={{ backgroundColor: "#f59e0b" }}
          />
          <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Perlu Perawatan</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs group">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-red-100 group-hover:ring-red-200 transition-all"
            style={{ backgroundColor: "#ef4444" }}
          />
          <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Offline</span>
        </div>
        <div className="flex items-center gap-2.5 text-xs group">
          <span
            className="w-2.5 h-2.5 rounded-full ring-2 ring-slate-100 group-hover:ring-slate-200 transition-all"
            style={{ backgroundColor: "#94a3b8" }}
          />
          <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">Belum Verifikasi</span>
        </div>
      </div>
    </div>
  );
}

