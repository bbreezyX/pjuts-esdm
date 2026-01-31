"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Map as MapIcon,
  ChevronDown,
  Filter,
  X,
} from "lucide-react";
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
    dotColor: "bg-emerald-500",
  },
  {
    value: "MAINTENANCE_NEEDED",
    label: "Perlu Perawatan",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 hover:bg-amber-100 border-amber-200",
    activeColor: "bg-amber-600 text-white hover:bg-amber-700",
    countKey: "maintenanceNeeded" as const,
    dotColor: "bg-amber-500",
  },
  {
    value: "OFFLINE",
    label: "Offline",
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-50 hover:bg-red-100 border-red-200",
    activeColor: "bg-red-600 text-white hover:bg-red-700",
    countKey: "offline" as const,
    dotColor: "bg-red-500",
  },
  {
    value: "UNVERIFIED",
    label: "Belum Verifikasi",
    icon: HelpCircle,
    color: "text-slate-500",
    bgColor: "bg-slate-50 hover:bg-slate-100 border-slate-200",
    activeColor: "bg-slate-600 text-white hover:bg-slate-700",
    countKey: "unverified" as const,
    dotColor: "bg-slate-400",
  },
];

export function MapFilters({
  selectedStatus,
  onStatusChange,
  counts,
}: MapFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // For portal - need to wait for client mount
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const totalCount =
    counts.operational +
    counts.maintenanceNeeded +
    counts.offline +
    counts.unverified;

  const activeFilter = statusFilters.find((f) => f.value === selectedStatus);

  // Bottom sheet content (will be portaled)
  const bottomSheet = isOpen && mounted ? createPortal(
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={() => setIsOpen(false)}
      />
      
      {/* Sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl animate-in slide-in-from-bottom duration-300 ease-out">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-800">Filter Status</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        
        {/* Options */}
        <div className="p-3 space-y-1.5 max-h-[60vh] overflow-y-auto">
          {/* All option */}
          <button
            onClick={() => {
              onStatusChange(null);
              setIsOpen(false);
            }}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
              selectedStatus === null
                ? "bg-slate-900 text-white"
                : "bg-slate-50 hover:bg-slate-100 text-slate-700"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center",
              selectedStatus === null ? "bg-white/20" : "bg-slate-200"
            )}>
              <MapIcon className="w-4 h-4" />
            </div>
            <div className="flex-1 text-left">
              <div className="text-sm font-semibold">Semua Wilayah</div>
              <div className={cn(
                "text-xs",
                selectedStatus === null ? "text-white/70" : "text-slate-500"
              )}>
                Tampilkan semua unit
              </div>
            </div>
            <span className={cn(
              "px-2.5 py-1 text-xs font-bold rounded-full",
              selectedStatus === null ? "bg-white/20" : "bg-slate-200 text-slate-600"
            )}>
              {totalCount}
            </span>
          </button>

          {/* Status options */}
          {statusFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedStatus === filter.value;
            const count = counts[filter.countKey];
            
            return (
              <button
                key={filter.value}
                onClick={() => {
                  onStatusChange(isActive ? null : filter.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all",
                  isActive
                    ? filter.activeColor
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  isActive ? "bg-white/20" : filter.bgColor.split(" ")[0]
                )}>
                  <Icon className={cn("w-4 h-4", !isActive && filter.color)} />
                </div>
                <div className="flex-1 text-left">
                  <div className="text-sm font-semibold">{filter.label}</div>
                  <div className={cn(
                    "text-xs",
                    isActive ? "text-white/70" : "text-slate-500"
                  )}>
                    {count} unit
                  </div>
                </div>
                <span className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-full",
                  isActive ? "bg-white/20" : `${filter.dotColor} text-white`
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        
        {/* Safe area padding for iOS */}
        <div className="h-6" />
      </div>
    </div>,
    document.body
  ) : null;

  // Mobile: Compact trigger button + bottom sheet
  // Desktop: Original pill bar
  return (
    <>
      {/* Mobile: Compact Filter Button */}
      <div className="sm:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            "flex items-center gap-2 px-3 py-2 bg-white/90 backdrop-blur-md border border-slate-200/50 rounded-full shadow-lg transition-all active:scale-95",
            selectedStatus && "ring-2 ring-offset-1",
            selectedStatus === "OPERATIONAL" && "ring-emerald-500",
            selectedStatus === "MAINTENANCE_NEEDED" && "ring-amber-500",
            selectedStatus === "OFFLINE" && "ring-red-500",
            selectedStatus === "UNVERIFIED" && "ring-slate-400",
          )}
        >
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">
            {activeFilter ? activeFilter.label : "Semua"}
          </span>
          <span className={cn(
            "px-1.5 py-0.5 text-[10px] font-bold rounded-full",
            activeFilter ? `${activeFilter.dotColor} text-white` : "bg-slate-100 text-slate-600"
          )}>
            {activeFilter ? counts[activeFilter.countKey] : totalCount}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>

      {/* Mobile: Bottom Sheet (portaled to body) */}
      {bottomSheet}

      {/* Desktop: Original Pill Bar */}
      <div className="hidden sm:block">
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-full shadow-lg shadow-slate-200/20 transition-all">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onStatusChange(null)}
            className={cn(
              "rounded-full px-4 py-2 h-9 transition-all duration-200 shrink-0",
              selectedStatus === null
                ? "bg-slate-900 shadow-md shadow-slate-900/10 hover:bg-slate-800"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
            )}
          >
            <span
              className={cn(
                "font-semibold text-xs uppercase tracking-wider mr-2 transition-colors",
                selectedStatus === null ? "text-white" : "text-inherit",
              )}
            >
              Semua Wilayah
            </span>
            <span
              className={cn(
                "px-2 py-0.5 text-[10px] font-bold rounded-full transition-colors",
                selectedStatus === null
                  ? "bg-white/20 text-white"
                  : "bg-slate-100 text-slate-500",
              )}
            >
              {totalCount}
            </span>
          </Button>
          <div className="w-px h-6 bg-slate-200/50 mx-1 shrink-0" />
          {statusFilters.map((filter) => {
            const Icon = filter.icon;
            const isActive = selectedStatus === filter.value;
            const count = counts[filter.countKey];
            const activeStyles = {
              OPERATIONAL:
                "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm shadow-emerald-500/10",
              MAINTENANCE_NEEDED:
                "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-500/10",
              OFFLINE:
                "bg-red-500 text-white hover:bg-red-600 shadow-sm shadow-red-500/10",
              UNVERIFIED:
                "bg-slate-500 text-white hover:bg-slate-600 shadow-sm shadow-slate-500/10",
            };
            const activeStyle =
              activeStyles[filter.value as keyof typeof activeStyles] ||
              "bg-slate-900 text-white shadow-sm";
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
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700 hover:border-slate-100",
                )}
              >
                <Icon
                  className={cn(
                    "h-4 w-4 mr-2 transition-transform duration-200",
                    isActive ? "scale-100" : filter.color,
                  )}
                />
                <span
                  className={cn(
                    "inline font-semibold text-xs uppercase tracking-tight",
                    isActive && "text-white",
                  )}
                >
                  {filter.label}
                </span>
                <span
                  className={cn(
                    "ml-2 px-1.5 py-0.5 text-[10px] font-bold rounded-full inline transition-colors",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-500",
                  )}
                >
                  {count}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </>
  );
}

interface MapLegendProps {
  hideOnMobile?: boolean;
}

export function MapLegend({ hideOnMobile = false }: MapLegendProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Collapsed state button
  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          "absolute bottom-[35px] left-[10px] bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg rounded-lg p-2 z-[999] transition-all hover:shadow-xl hover:scale-105 active:scale-95 text-slate-600 flex items-center gap-1.5",
          hideOnMobile && "sm:flex hidden", // Hide on mobile when drawer is open
        )}
        aria-label="Lihat Legenda"
        title="Legenda Status"
      >
        <MapIcon className="w-4 h-4" />
        <span className="text-[10px] font-semibold hidden sm:inline">
          Legenda
        </span>
      </button>
    );
  }

  // Expanded state
  return (
    <div 
      className={cn(
        "absolute bottom-[35px] left-[10px] bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-lg rounded-lg p-2.5 z-[999] transition-all animate-in slide-in-from-bottom-2 fade-in duration-300",
        hideOnMobile && "sm:block hidden", // Hide on mobile when drawer is open
      )}
    >
      <div className="flex items-center justify-between gap-4 mb-2">
        <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
          Legenda
        </h3>
        <button
          onClick={() => setIsExpanded(false)}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
          title="Tutup legenda"
        >
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
      <div className="space-y-1.5">
        {[
          { color: "#10b981", label: "Operasional" },
          { color: "#f59e0b", label: "Perawatan" },
          { color: "#ef4444", label: "Offline" },
          { color: "#94a3b8", label: "Belum Verif" },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-2 text-[10px] cursor-default"
          >
            <span
              className="block w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-slate-600 font-medium whitespace-nowrap">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
