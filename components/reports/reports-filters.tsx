"use client";

import { useState } from "react";
import { Search, X, Calendar, SlidersHorizontal, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter Toggle - Refined Layout */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
          <input
            type="text"
            placeholder="Cari laporan berdasarkan Pole ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="relative w-full h-14 pl-14 pr-12 rounded-[2rem] border-2 border-transparent bg-white/60 backdrop-blur-xl text-base font-bold shadow-xl shadow-slate-200/10 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 border-2 relative",
              showFilters
                ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200"
                : "bg-white border-slate-100 hover:border-primary text-slate-600 shadow-sm shadow-slate-200/5",
            )}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filter Lanjutan
            {activeFilterCount > 0 && (
              <span className="ml-2 bg-primary text-white w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black">
                {activeFilterCount}
              </span>
            )}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              onClick={onResetFilters}
              className="h-14 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 shrink-0 transition-all border-2 border-transparent hover:border-red-100"
            >
              <X className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Expandable Filter Panel - Enhanced */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="overflow-hidden"
          >
            <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-50 shadow-2xl shadow-slate-200/40 space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                    <Zap className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none mb-1">
                      Kriteria Monitoring
                    </h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Sesuaikan tampilan data laporan
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Kabupaten/Kota
                  </label>
                  <Select
                    value={selectedRegency || "all"}
                    onValueChange={(v) =>
                      onRegencyChange(v === "all" ? undefined : v)
                    }
                  >
                    <SelectTrigger className="h-14 rounded-2xl border-2 border-transparent bg-slate-50/50 font-bold text-slate-800 transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white">
                      <SelectValue placeholder="Semua Kab/Kota" />
                    </SelectTrigger>
                    <SelectContent className="rounded-3xl border-slate-100 shadow-2xl">
                      <SelectItem
                        value="all"
                        className="font-black text-[10px] uppercase"
                      >
                        Semua Kab/Kota
                      </SelectItem>
                      {regencies.map((regency) => (
                        <SelectItem
                          key={regency}
                          value={regency}
                          className="font-bold"
                        >
                          {regency}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Rentang Awal
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
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
                      className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-transparent bg-slate-50/50 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                    Rentang Akhir
                  </label>
                  <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none group-focus-within:text-primary transition-colors duration-200" />
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
                      className="w-full h-14 pl-12 pr-6 rounded-2xl border-2 border-transparent bg-slate-50/50 text-sm font-bold transition-all focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Pills - Enhanced */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 sm:gap-3 px-1 animate-in fade-in slide-in-from-left-2 duration-300">
          {selectedRegency && (
            <Badge
              variant="secondary"
              className="gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary border-2 border-primary/10 font-black text-[10px] uppercase tracking-wider hover:bg-primary/10 transition-all shrink-0"
            >
              <span className="opacity-60">Wilayah:</span> {selectedRegency}
              <button
                onClick={() => onRegencyChange(undefined)}
                className="ml-1 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.start && (
            <Badge
              variant="secondary"
              className="gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary border-2 border-primary/10 font-black text-[10px] uppercase tracking-wider hover:bg-primary/10 transition-all shrink-0"
            >
              <span className="opacity-60">Sejak:</span>{" "}
              {dateRange.start.toLocaleDateString("id-ID")}
              <button
                onClick={() =>
                  onDateRangeChange({ ...dateRange, start: undefined })
                }
                className="ml-1 hover:text-red-500 transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.end && (
            <Badge
              variant="secondary"
              className="gap-2 px-4 py-2 rounded-xl bg-primary/5 text-primary border-2 border-primary/10 font-black text-[10px] uppercase tracking-wider hover:bg-primary/10 transition-all shrink-0"
            >
              <span className="opacity-60">Hingga:</span>{" "}
              {dateRange.end.toLocaleDateString("id-ID")}
              <button
                onClick={() =>
                  onDateRangeChange({ ...dateRange, end: undefined })
                }
                className="ml-1 hover:text-red-500 transition-colors"
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
