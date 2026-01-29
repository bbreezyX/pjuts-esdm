"use client";

import { useState } from "react";
import { Search, Filter, X, Calendar } from "lucide-react";
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
  provinces: string[];
  selectedProvince: string | undefined;
  onProvinceChange: (province: string | undefined) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateRange: { start?: Date; end?: Date };
  onDateRangeChange: (range: { start?: Date; end?: Date }) => void;
}

export function ReportsFilters({
  provinces,
  selectedProvince,
  onProvinceChange,
  searchQuery,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: ReportsFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters =
    selectedProvince || searchQuery || dateRange.start || dateRange.end;

  const clearFilters = () => {
    onProvinceChange(undefined);
    onSearchChange("");
    onDateRangeChange({});
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors z-10" />
          <input
            type="text"
            placeholder="Cari laporan berdasarkan Pole ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="relative w-full h-12 pl-12 pr-4 rounded-full border border-slate-200/60 bg-white/80 backdrop-blur-md text-sm font-medium shadow-sm shadow-slate-200/20 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant={showFilters ? "default" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-12 px-6 rounded-2xl font-bold transition-all shrink-0",
              showFilters ? "bg-primary shadow-lg shadow-primary/20" : "hover:bg-muted"
            )}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter Lanjutan
            {hasActiveFilters && (
              <span className="ml-2 flex h-5 min-w-[20px] px-1 items-center justify-center rounded-lg bg-white/20 text-[10px] font-black">
                {Object.values(dateRange).filter(Boolean).length + (selectedProvince ? 1 : 0)}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              onClick={clearFilters} 
              className="h-12 px-5 rounded-2xl font-bold text-red-500 hover:bg-red-50 hover:text-red-600 shrink-0 transition-all"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-muted/30 backdrop-blur-md rounded-[2rem] p-8 border border-border/50 space-y-6 animate-in slide-in-from-top-4 fade-in duration-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Kriteria Filter</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Province Filter */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1">
                Wilayah Provinsi
              </label>
              <Select
                value={selectedProvince || "all"}
                onValueChange={(v) =>
                  onProvinceChange(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger className="h-12 rounded-xl border-border/60 bg-card/50 font-bold text-sm">
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border shadow-2xl">
                  <SelectItem value="all" className="font-bold">Semua Provinsi</SelectItem>
                  {provinces.map((prov) => (
                    <SelectItem key={prov} value={prov} className="font-medium">
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Start */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1">
                Rentang Awal
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" />
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
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border/60 bg-card/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>

            {/* Date End */}
            <div className="space-y-2">
              <label className="text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1">
                Rentang Akhir
              </label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors" />
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
                      end: e.target.value ? new Date(e.target.value) : undefined,
                    })
                  }
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-border/60 bg-card/50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2.5 px-1 animate-in fade-in slide-in-from-left-2 duration-300">
          {selectedProvince && (
            <Badge variant="secondary" className="gap-2 px-3 py-1.5 rounded-xl bg-primary/5 text-primary border-primary/10 font-bold text-[10px] uppercase tracking-wider">
              Provinsi: {selectedProvince}
              <button 
                onClick={() => onProvinceChange(undefined)}
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.start && (
            <Badge variant="secondary" className="gap-2 px-3 py-1.5 rounded-xl bg-primary/5 text-primary border-primary/10 font-bold text-[10px] uppercase tracking-wider">
              Dari: {dateRange.start.toLocaleDateString("id-ID")}
              <button
                onClick={() => onDateRangeChange({ ...dateRange, start: undefined })}
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.end && (
            <Badge variant="secondary" className="gap-2 px-3 py-1.5 rounded-xl bg-primary/5 text-primary border-primary/10 font-bold text-[10px] uppercase tracking-wider">
              Sampai: {dateRange.end.toLocaleDateString("id-ID")}
              <button
                onClick={() => onDateRangeChange({ ...dateRange, end: undefined })}
                className="hover:bg-primary/10 rounded-full p-0.5 transition-colors"
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
