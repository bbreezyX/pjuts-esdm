"use client";

import { CheckCircle2, AlertTriangle, XCircle, HelpCircle } from "lucide-react";
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
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={selectedStatus === null ? "default" : "outline"}
        size="sm"
        onClick={() => onStatusChange(null)}
        className={cn(
          "transition-all",
          selectedStatus === null && "shadow-md"
        )}
      >
        Semua
        <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-white/20">
          {counts.operational + counts.maintenanceNeeded + counts.offline + counts.unverified}
        </span>
      </Button>

      {statusFilters.map((filter) => {
        const Icon = filter.icon;
        const isActive = selectedStatus === filter.value;
        const count = counts[filter.countKey];

        return (
          <Button
            key={filter.value}
            variant="outline"
            size="sm"
            onClick={() => onStatusChange(isActive ? null : filter.value)}
            className={cn(
              "transition-all border",
              isActive ? filter.activeColor : filter.bgColor
            )}
          >
            <Icon className={cn("h-4 w-4 mr-1", !isActive && filter.color)} />
            <span className="hidden sm:inline">{filter.label}</span>
            <span className="sm:hidden">{count}</span>
            <span
              className={cn(
                "ml-2 px-1.5 py-0.5 text-xs rounded-full hidden sm:inline",
                isActive ? "bg-white/20" : "bg-slate-100"
              )}
            >
              {count}
            </span>
          </Button>
        );
      })}
    </div>
  );
}

// Legend component for the map
export function MapLegend() {
  return (
    <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
      <p className="text-xs font-semibold text-slate-700 mb-2">Legenda</p>
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#10b981" }}
          />
          <span className="text-slate-600">Operasional</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#f59e0b" }}
          />
          <span className="text-slate-600">Perlu Perawatan</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#ef4444" }}
          />
          <span className="text-slate-600">Offline</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: "#94a3b8" }}
          />
          <span className="text-slate-600">Belum Verifikasi</span>
        </div>
      </div>
    </div>
  );
}

