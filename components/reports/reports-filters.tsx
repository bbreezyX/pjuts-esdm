"use client";

import { useState } from "react";
import { Search, Filter, Xmark, Calendar } from "iconoir-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari berdasarkan Pole ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant={showFilters ? "secondary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
            {hasActiveFilters && (
              <Badge variant="default" className="ml-2 h-5 w-5 p-0 justify-center">
                !
              </Badge>
            )}
          </Button>

          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="shrink-0">
              <Xmark className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-slate-50 rounded-lg p-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Province Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Provinsi
              </label>
              <Select
                value={selectedProvince || "all"}
                onValueChange={(v) =>
                  onProvinceChange(v === "all" ? undefined : v)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua Provinsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Provinsi</SelectItem>
                  {provinces.map((prov) => (
                    <SelectItem key={prov} value={prov}>
                      {prov}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Start */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tanggal Mulai
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
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
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Date End */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Tanggal Akhir
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
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
                  className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {selectedProvince && (
            <Badge variant="secondary" className="gap-1.5">
              Provinsi: {selectedProvince}
              <button onClick={() => onProvinceChange(undefined)}>
                <Xmark className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.start && (
            <Badge variant="secondary" className="gap-1.5">
              Dari: {dateRange.start.toLocaleDateString("id-ID")}
              <button
                onClick={() => onDateRangeChange({ ...dateRange, start: undefined })}
              >
                <Xmark className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {dateRange.end && (
            <Badge variant="secondary" className="gap-1.5">
              Sampai: {dateRange.end.toLocaleDateString("id-ID")}
              <button
                onClick={() => onDateRangeChange({ ...dateRange, end: undefined })}
              >
                <Xmark className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

