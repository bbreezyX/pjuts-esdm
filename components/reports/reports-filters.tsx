"use client";

import { useState } from "react";
import { Search, X, Calendar, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ReportsFiltersProps {
  regencies: string[];
  selectedRegency: string | undefined;
  onRegencyChange: (regency: string | undefined) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: { start?: Date; end?: Date };
  onDateRangeChange: (range: { start?: Date; end?: Date }) => void;
  onResetFilters: () => void;
}

export function ReportsFilters({
  regencies,
  selectedRegency,
  onRegencyChange,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
  onResetFilters,
}: ReportsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    selectedRegency || searchQuery || dateRange.start || dateRange.end;

  const activeFilterCount =
    (selectedRegency ? 1 : 0) +
    (dateRange.start ? 1 : 0) +
    (dateRange.end ? 1 : 0);

  const clearFilters = () => {
    // Clear all filters with single URL update (also clears local state in parent)
    onResetFilters();
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter Toggle - Refined Layout */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input - Enhanced */}
        <div className="relative flex-1 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
          </div>
          <input
            type="text"
            placeholder="Cari laporan berdasarkan Pole ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cn(
              "relative w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-4 rounded-xl sm:rounded-2xl",
              "border border-border/60 bg-card/80 backdrop-blur-sm",
              "text-sm font-medium shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
              "transition-all duration-200 placeholder:text-muted-foreground/60",
            )}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-11 sm:h-12 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all duration-300 shrink-0",
              showFilters
                ? "bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/35"
                : "hover:bg-muted border-border/60",
            )}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filter Lanjutan</span>
            <span className="sm:hidden">Filter</span>
            {activeFilterCount > 0 && (
              <span
                className={cn(
                  "ml-2 flex h-5 min-w-[20px] px-1.5 items-center justify-center rounded-full text-[10px] font-black",
                  showFilters
                    ? "bg-white/20 text-white"
                    : "bg-primary/10 text-primary",
                )}
              >
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className={cn(
                "h-11 sm:h-12 px-4 sm:px-5 rounded-xl sm:rounded-2xl font-bold shrink-0",
                "text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50",
                "transition-all duration-200",
              )}
            >
              <X className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Reset Filter</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel - Enhanced */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-500 ease-out",
          showFilters ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div
          className={cn(
            "bg-muted/30 backdrop-blur-md rounded-2xl sm:rounded-[1.5rem] p-5 sm:p-8",
            "border border-border/50 space-y-5 sm:space-y-6",
            "animate-in slide-in-from-top-4 fade-in duration-500",
          )}
        >
          {/* Section Header */}
          <div className="flex items-center gap-2">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest">
              Kriteria Filter
            </h3>
          </div>

          {/* Filter Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-8">
            {/* Province Filter */}
            {/* Regency/City Filter */}
            <div className="space-y-2.5">
              <label className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1 block">
                Kabupaten/Kota
              </label>
              <Select
                value={selectedRegency || "all"}
                onValueChange={(v) =>
                  onRegencyChange(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="h-11 sm:h-12 rounded-xl sm:rounded-2xl border-border/60 bg-card/50 font-bold text-sm">
                  <SelectValue placeholder="Semua Kab/Kota" />
                </SelectTrigger>
                <SelectContent className="rounded-xl sm:rounded-2xl border-border shadow-2xl">
                  <SelectItem value="all" className="font-bold py-2.5">
                    Semua Kab/Kota
                  </SelectItem>
                  {regencies.map((regency) => (
                    <SelectItem
                      key={regency}
                      value={regency}
                      className="font-medium py-2.5"
                    >
                      {regency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Start */}
            <div className="space-y-2.5">
              <label className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1 block">
                Rentang Awal
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="date"
                  value={
                    dateRange.start
                      ? dateRange.start.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    onDateRangeChange({
                      ...dateRange,
                      start: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className={cn(
                    "w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-4 rounded-xl sm:rounded-2xl",
                    "border border-border/60 bg-card/50 text-sm font-bold",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                    "transition-all duration-200",
                  )}
                />
              </div>
            </div>

            {/* Date End */}
            <div className="space-y-2.5">
              <label className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1 block">
                Rentang Akhir
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
                <input
                  type="date"
                  value={
                    dateRange.end
                      ? dateRange.end.toISOString().split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    onDateRangeChange({
                      ...dateRange,
                      end: e.target.value
                        ? new Date(e.target.value)
                        : undefined,
                    })
                  }
                  className={cn(
                    "w-full h-11 sm:h-12 pl-11 sm:pl-12 pr-4 rounded-xl sm:rounded-2xl",
                    "border border-border/60 bg-card/50 text-sm font-bold",
                    "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40",
                    "transition-all duration-200",
                  )}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Filters Pills - Enhanced */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 sm:gap-2.5 px-0.5 animate-in fade-in slide-in-from-left-2 duration-300">
          {selectedRegency && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl",
                "bg-primary/5 text-primary border border-primary/10",
                "font-bold text-[9px] sm:text-[10px] uppercase tracking-wider",
                "hover:bg-primary/10 transition-colors duration-200",
              )}
            >
              <span className="opacity-60">Kab/Kota:</span> {selectedRegency}
              <button
                onClick={() => onRegencyChange(undefined)}
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors -mr-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.start && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl",
                "bg-primary/5 text-primary border border-primary/10",
                "font-bold text-[9px] sm:text-[10px] uppercase tracking-wider",
                "hover:bg-primary/10 transition-colors duration-200",
              )}
            >
              <span className="opacity-60">Dari:</span>{" "}
              {dateRange.start.toLocaleDateString("id-ID")}
              <button
                onClick={() =>
                  onDateRangeChange({ ...dateRange, start: undefined })
                }
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors -mr-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.end && (
            <Badge
              variant="secondary"
              className={cn(
                "gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg sm:rounded-xl",
                "bg-primary/5 text-primary border border-primary/10",
                "font-bold text-[9px] sm:text-[10px] uppercase tracking-wider",
                "hover:bg-primary/10 transition-colors duration-200",
              )}
            >
              <span className="opacity-60">Sampai:</span>{" "}
              {dateRange.end.toLocaleDateString("id-ID")}
              <button
                onClick={() =>
                  onDateRangeChange({ ...dateRange, end: undefined })
                }
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors -mr-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
