"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Map as MapIcon, ChevronDown } from "lucide-react";
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
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 hover:bg-emerald-100 border-emerald-200",
    activeColor: "bg-emerald-600 text-white hover:bg-emerald-700",
    countKey: "operational" as const,
  },
  {
    value: "MAINTENANCE_NEEDED",
    label: "Perlu Perawatan",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    activeColor: "bg-amber-600 text-white hover:bg-amber-700",
    countKey: "maintenanceNeeded" as const,
  },
  {
    value: "OFFLINE",
    label: "Offline",
    icon: XCircle,
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
    <div className="w-full overflow-x-auto pb-4 sm:pb-0 scrollbar-none">
      <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-full shadow-lg shadow-slate-200/20 transition-all min-w-max sm:min-w-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onStatusChange(null)}
          className={cn(
            "rounded-full px-4 py-2 h-9 transition-all duration-200 shrink-0",
            selectedStatus === null
              ? "bg-slate-900 shadow-md shadow-slate-900/10 hover:bg-slate-800"
              : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          )}
        >
          <span className={cn(
            "font-semibold text-xs uppercase tracking-wider mr-2 transition-colors",
            selectedStatus === null ? "text-white" : "text-inherit"
          )}>
            Semua Wilayah
          </span>
          <span className={cn(
            "px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors",
            selectedStatus === null ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
          )}>
            {totalCount}
          </span>
        </Button>
        <div className="w-px h-6 bg-slate-200/50 mx-1 shrink-0" />
        {statusFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = selectedStatus === filter.value;
          const count = counts[filter.countKey];
          const activeStyles = {
            OPERATIONAL: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/10",
            MAINTENANCE_NEEDED: "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/10",
            OFFLINE: "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/10",
            UNVERIFIED: "bg-slate-500 text-white hover:bg-slate-600 shadow-sm shadow-slate-500/10",
          };
          const activeStyle = activeStyles[filter.value as keyof typeof activeStyles] || "bg-slate-900 text-white shadow-sm";
          return (
            <Button
              key={filter.value}
              variant="ghost"
              size="sm"
              onClick={() => onStatusChange(isActive ? null : filter.value)}
              className={cn(
                "rounded-full px-3.5 py-2 h-9 border border-transparent transition-all duration-200 shrink-0",
                isActive
                  ? activeStyle
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-100"
              )}
            >
              <Icon className={cn(
                "h-4 w-4 mr-2 transition-transform duration-200",
                isActive ? "scale-100" : filter.color
              )} />
              <span className={cn("inline font-semibold text-xs uppercase tracking-tight", isActive && "text-white")}>
                {filter.label}
              </span>
              <span
                className={cn(
                  "ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full inline transition-colors",
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
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

export function MapLegend() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);
      setIsExpanded(!mobile);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (!isExpanded && isMobile) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl p-4 z-[1000] transition-all hover:shadow-primary/10 hover:scale-105 active:scale-95 text-slate-800"
        aria-label="Lihat Legenda"
      >
        <MapIcon className="w-6 h-6" />
      </button>
    );
  }
  
  return (
    <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md border border-slate-200/50 shadow-lg rounded-[1.5rem] p-5 z-[1000] transition-all hover:shadow-xl min-w-[200px] animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Legenda Status</h3>
        {isMobile && (
          <button
            onClick={() => setIsExpanded(false)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="space-y-3.5">
        {[
          { color: "#10b981", label: "Operasional", ring: "ring-emerald-500/10" },
          { color: "#f59e0b", label: "Perlu Perawatan", ring: "ring-amber-500/10" },
          { color: "#ef4444", label: "Offline", ring: "ring-red-500/10" },
          { color: "#94a3b8", label: "Belum Verifikasi", ring: "ring-slate-500/10" }
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-3 text-xs group cursor-default">
            <div className="relative">
              <span
                className={cn("block w-2.5 h-2.5 rounded-full ring-4 transition-all duration-300 group-hover:scale-110", item.ring)}
                style={{ backgroundColor: item.color }}
              />
              <span className="absolute inset-0 w-2.5 h-2.5 rounded-full animate-ping opacity-10" style={{ backgroundColor: item.color }} />
            </div>
            <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors tracking-tight">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
