"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Filter,
  X,
  MapPin,
  Lightbulb,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Plus,
  Download,
  Upload,
  Zap,
  Loader2,
  ExternalLink,
  Calendar,
  Hash,
  Navigation,
  Eye,
  ChartPie,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PjutsUnitData } from "@/app/actions/units";
import { getStatusLabel, formatDate, cn } from "@/lib/utils";
import { UnitStatus } from "@prisma/client";
import { UnitDialog } from "@/components/units/unit-dialog";
import { DeleteUnitDialog } from "@/components/units/delete-unit-dialog";
import { ImportUnitDialog } from "@/components/units/import-unit-dialog";
import { downloadStyledExcel } from "@/lib/excel-style";
import { toast } from "@/components/ui/use-toast";
import { getPjutsUnits } from "@/app/actions/units";

interface UnitsPageClientProps {
  initialUnits: PjutsUnitData[];
  total: number;
  page: number;
  totalPages: number;
  regencies: string[];
  initialRegency?: string;
  initialStatus?: string;
  initialSearch?: string;
  isAdmin?: boolean;
}

const statusOptions = [
  {
    value: "OPERATIONAL",
    label: "Operasional",
    icon: CheckCircle2,
    color: "text-emerald-600",
  },
  {
    value: "MAINTENANCE_NEEDED",
    label: "Perlu Perawatan",
    icon: AlertTriangle,
    color: "text-amber-600",
  },
  { value: "OFFLINE", label: "Offline", icon: XCircle, color: "text-red-600" },
  {
    value: "UNVERIFIED",
    label: "Belum Verifikasi",
    icon: HelpCircle,
    color: "text-slate-500",
  },
];

export function UnitsPageClient({
  initialUnits,
  total,
  page,
  totalPages,
  regencies,
  initialRegency,
  initialStatus,
  initialSearch,
  isAdmin = false,
}: UnitsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [selectedRegency, setSelectedRegency] = useState(initialRegency);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PjutsUnitData | undefined>(
    undefined,
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<PjutsUnitData | null>(null);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    if (!updates.page) params.set("page", "1");
    startTransition(() => {
      router.push(`/units?${params.toString()}`);
    });
  };

  const handleSearch = () => {
    updateURL({ search: searchQuery || undefined });
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = searchParams.get("search") || "";
      if (searchQuery !== currentSearch) handleSearch();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchParams]);

  const getStatusStyles = (status: UnitStatus) => {
    switch (status) {
      case "OPERATIONAL":
        return {
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          border: "border-emerald-200",
          shadow: "shadow-emerald-500/20",
          icon: "text-emerald-600",
        };
      case "MAINTENANCE_NEEDED":
        return {
          bg: "bg-amber-100",
          text: "text-amber-700",
          border: "border-amber-200",
          shadow: "shadow-amber-500/20",
          icon: "text-amber-600",
        };
      case "OFFLINE":
        return {
          bg: "bg-rose-100",
          text: "text-rose-700",
          border: "border-rose-200",
          shadow: "shadow-rose-500/20",
          icon: "text-rose-600",
        };
      default:
        return {
          bg: "bg-slate-100",
          text: "text-slate-600",
          border: "border-slate-200",
          shadow: "shadow-slate-500/10",
          icon: "text-slate-500",
        };
    }
  };

  const handleEdit = (unit: PjutsUnitData) => {
    setSelectedUnit(unit);
    setIsUnitDialogOpen(true);
  };

  const handleDelete = (unit: PjutsUnitData) => {
    setUnitToDelete(unit);
    setIsDeleteDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedUnit(undefined);
    setIsUnitDialogOpen(true);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const result = await getPjutsUnits({
        limit: 10000,
        regency: selectedRegency,
        status: selectedStatus as UnitStatus | undefined,
        search: searchQuery,
      });

      if (!result.success || !result.data) {
        throw new Error(result.error || "Gagal mengambil data unit");
      }

      const units = result.data.units;
      if (units.length === 0) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada unit yang sesuai dengan filter saat ini.",
          variant: "destructive",
        });
        return;
      }

      const dataToExport = units.map((u) => ({
        "Serial Number": u.serialNumber,
        Status: getStatusLabel(u.lastStatus),
        Kabupaten: u.regency,
        Provinsi: u.province,
        Kecamatan: u.district || "-",
        "Kelurahan/Desa": u.village || "-",
        Alamat: u.address || "-",
        Latitude: u.latitude,
        Longitude: u.longitude,
        "Jumlah Laporan": u._count.reports,
        "Tanggal Install": u.installDate ? formatDate(u.installDate) : "-",
      }));

      downloadStyledExcel(
        [{ name: "Units", data: dataToExport }],
        `Data_Unit_PJUTS_${formatDate(new Date()).replace(/\//g, "-")}.xlsx`,
      );

      toast({
        title: "Export Berhasil",
        description: `${units.length} unit telah diekspor ke Excel.`,
        variant: "success",
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat mengekspor data.";
      toast({
        title: "Export Gagal",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const hasActiveFilters = selectedRegency || selectedStatus || searchQuery;

  return (
    <div className="space-y-3 sm:space-y-5 lg:space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              Asset Management
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Unit PJUTS
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-md">
            Kelola dan pantau seluruh unit penerangan jalan umum tenaga surya
            Provinsi Jambi secara terpadu.
          </p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl border border-slate-200/40 h-10 sm:h-12 items-center">
              <Button
                variant="ghost"
                onClick={() => setIsImportDialogOpen(true)}
                className="h-8 sm:h-10 px-3 sm:px-4 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-white hover:text-emerald-600 transition-all text-slate-500"
              >
                <Upload className="h-3.5 w-3.5 mr-2" />
                Import
              </Button>
              <div className="w-px h-4 bg-slate-200 mx-1" />
              <Button
                variant="ghost"
                onClick={handleExport}
                disabled={isExporting}
                className="h-8 sm:h-10 px-3 sm:px-4 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-white hover:text-emerald-600 transition-all text-slate-500"
              >
                {isExporting ? (
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-2" />
                )}
                Export
              </Button>
            </div>
            <Button
              size="lg"
              onClick={handleCreate}
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-6 h-12 font-black transition-all shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 text-[10px] uppercase tracking-[0.1em]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Unit
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3 sm:space-y-5">
        <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 h-4 sm:h-5 w-4 sm:w-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <input
              type="text"
              placeholder="Cari Serial Number atau Lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="relative w-full h-11 sm:h-14 pl-11 sm:pl-14 pr-10 sm:pr-12 rounded-2xl sm:rounded-[2rem] border-2 border-transparent bg-white/60 backdrop-blur-xl text-sm sm:text-base font-bold shadow-xl shadow-slate-200/10 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  updateURL({ search: undefined });
                }}
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-1 z-10"
              >
                <X className="h-3.5 sm:h-4 w-3.5 sm:w-4" />
              </button>
            )}
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button
              variant="ghost"
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-11 sm:h-14 px-4 sm:px-8 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 shrink-0 border relative",
                "hover:scale-[1.01] active:scale-[0.98]",
                showFilters
                  ? "bg-primary/5 border-primary/20 text-primary hover:bg-primary/10"
                  : "bg-white border-slate-200 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/[0.02] shadow-sm shadow-slate-200/50 hover:shadow-[0_12px_24px_-10px_rgba(0,51,102,0.25)]",
              )}
            >
              <Filter className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter Lanjutan</span>
              <span className="sm:hidden ml-1.5">Filter</span>
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedRegency(undefined);
                  setSelectedStatus(undefined);
                  updateURL({
                    search: undefined,
                    regency: undefined,
                    status: undefined,
                  });
                }}
                className="h-11 sm:h-14 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 shrink-0 transition-all border-2 border-transparent hover:border-red-100"
              >
                <X className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -20 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -20 }}
              className="overflow-hidden"
            >
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 border-2 border-slate-50 shadow-2xl shadow-slate-200/40 space-y-4 sm:space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider leading-none mb-0.5 sm:mb-1">
                        Penyaringan Aset
                      </h3>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Sesuaikan tampilan data unit
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Wilayah Kabupaten
                    </label>
                    <Select
                      value={selectedRegency || "all"}
                      onValueChange={(v) => {
                        const val = v === "all" ? undefined : v;
                        setSelectedRegency(val);
                        updateURL({ regency: val });
                      }}
                    >
                      <SelectTrigger className="h-14 rounded-2xl border-2 border-transparent bg-slate-50/50 font-bold text-slate-800 transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white">
                        <SelectValue placeholder="Pilih Kabupaten" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl border-slate-100 shadow-2xl">
                        <SelectItem
                          value="all"
                          className="font-black text-[10px] uppercase"
                        >
                          Semua Kabupaten
                        </SelectItem>
                        {regencies.map((reg) => (
                          <SelectItem
                            key={reg}
                            value={reg}
                            className="font-bold"
                          >
                            {reg}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                      Status Operasional
                    </label>
                    <Select
                      value={selectedStatus || "all"}
                      onValueChange={(v) => {
                        const val = v === "all" ? undefined : v;
                        setSelectedStatus(val);
                        updateURL({ status: val });
                      }}
                    >
                      <SelectTrigger className="h-14 rounded-2xl border-2 border-transparent bg-slate-50/50 font-bold text-slate-800 transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white">
                        <SelectValue placeholder="Pilih Status" />
                      </SelectTrigger>
                      <SelectContent className="rounded-3xl border-slate-100 shadow-2xl">
                        <SelectItem
                          value="all"
                          className="font-black text-[10px] uppercase"
                        >
                          Semua Status
                        </SelectItem>
                        {statusOptions.map((opt) => (
                          <SelectItem
                            key={opt.value}
                            value={opt.value}
                            className="font-bold"
                          >
                            <div className="flex items-center gap-3">
                              <opt.icon className={cn("h-4 w-4", opt.color)} />
                              {opt.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Distribution Bar */}
      {initialUnits.length > 0 &&
        (() => {
          const statusCounts = initialUnits.reduce(
            (acc, u) => {
              acc[u.lastStatus] = (acc[u.lastStatus] || 0) + 1;
              return acc;
            },
            {} as Record<string, number>,
          );
          const segments = [
            {
              key: "OPERATIONAL",
              color: "bg-emerald-500",
              label: "Operasional",
            },
            {
              key: "MAINTENANCE_NEEDED",
              color: "bg-amber-500",
              label: "Perlu Perawatan",
            },
            { key: "OFFLINE", color: "bg-rose-500", label: "Offline" },
            {
              key: "UNVERIFIED",
              color: "bg-slate-400",
              label: "Belum Verifikasi",
            },
          ].filter((s) => statusCounts[s.key]);

          return (
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-100/50">
                    <ChartPie className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                      Distribusi Status
                    </h3>
                    <p className="text-[10px] font-medium text-slate-500">
                      Total {initialUnits.length} unit terdaftar
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100/50">
                {segments.map((seg) => {
                  const count = statusCounts[seg.key];
                  const percentage = (
                    (count / initialUnits.length) *
                    100
                  ).toFixed(1);
                  return (
                    <motion.div
                      key={seg.key}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={cn("h-full", seg.color)}
                      title={`${seg.label}: ${count} (${percentage}%)`}
                    />
                  );
                })}
              </div>

              {/* Legend Grid */}
              <div className="grid grid-cols-2 md:flex md:flex-wrap items-center gap-3 md:gap-6 mt-4">
                {segments.map((seg) => {
                  const count = statusCounts[seg.key];
                  const percentage = Math.round(
                    (count / initialUnits.length) * 100,
                  );
                  return (
                    <div
                      key={seg.key}
                      className="flex items-center gap-2 min-w-[120px]"
                    >
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full ring-2 ring-white shadow-sm",
                          seg.color,
                        )}
                      />
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wide leading-none mb-0.5">
                          {seg.label}
                        </span>
                        <div className="flex items-end gap-1.5 leading-none">
                          <span className="text-sm font-bold text-slate-900">
                            {count}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400 mb-0.5">
                            ({percentage}%)
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

      {/* Main Data Section */}
      <div
        className={cn(
          "transition-opacity duration-300 min-h-[50vh]",
          isPending ? "opacity-50 pointer-events-none" : "opacity-100",
        )}
      >
        {initialUnits.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center py-16 sm:py-24 bg-white rounded-2xl sm:rounded-[2.5rem] border-2 border-dashed border-slate-200 text-center overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(148,163,184,0.05)_1px,_transparent_1px)] bg-[length:24px_24px]" />
            <div className="relative">
              <div className="relative mx-auto w-20 h-20 mb-6">
                <div className="absolute inset-0 bg-slate-100 rounded-3xl rotate-6" />
                <div className="absolute inset-0 bg-slate-50 rounded-3xl -rotate-3" />
                <div className="relative w-full h-full bg-white rounded-3xl border-2 border-slate-100 flex items-center justify-center shadow-lg">
                  <Lightbulb className="h-8 w-8 text-slate-300" />
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-700 mb-2">
                Tidak ada unit ditemukan
              </h3>
              <p className="text-slate-400 font-medium text-sm max-w-xs mx-auto mb-8">
                Coba sesuaikan filter pencarian atau kata kunci Anda untuk
                menemukan data.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedRegency(undefined);
                    setSelectedStatus(undefined);
                    updateURL({
                      search: undefined,
                      regency: undefined,
                      status: undefined,
                    });
                  }}
                  className="h-12 px-8 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:border-primary hover:text-primary transition-all"
                >
                  Reset Filter
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-100/60 overflow-hidden">
            {/* Table Header — Desktop only */}
            <div className="hidden md:grid md:grid-cols-[3.5rem_1fr_1fr_9rem_5rem_10rem] lg:grid-cols-[3.5rem_1.2fr_1fr_10rem_5.5rem_12rem] items-center gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-100">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                #
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Serial / Lokasi
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Wilayah
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                Status
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-center">
                Laporan
              </span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] text-right">
                Aksi
              </span>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-slate-50">
              {initialUnits.map((unit, index) => {
                const styles = getStatusStyles(unit.lastStatus);
                const isExpanded = expandedUnitId === unit.id;
                const rowNumber = (page - 1) * initialUnits.length + index + 1;

                return (
                  <motion.div
                    key={unit.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03, duration: 0.3 }}
                  >
                    {/* Desktop Row */}
                    <div
                      onClick={() =>
                        setExpandedUnitId(isExpanded ? null : unit.id)
                      }
                      className={cn(
                        "group relative hidden md:grid md:grid-cols-[3.5rem_1fr_1fr_9rem_5rem_10rem] lg:grid-cols-[3.5rem_1.2fr_1fr_10rem_5.5rem_12rem] items-center gap-4 px-6 py-4 cursor-pointer transition-all duration-200",
                        isExpanded
                          ? "bg-primary/[0.03]"
                          : "hover:bg-slate-50/80",
                      )}
                    >
                      {/* Left status accent */}
                      <div
                        className={cn(
                          "absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all duration-300",
                          isExpanded
                            ? styles.text.replace("text-", "bg-")
                            : "bg-transparent",
                        )}
                      />
                      <div
                        className={cn(
                          "absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-all duration-300 opacity-0 group-hover:opacity-100",
                          !isExpanded && styles.text.replace("text-", "bg-"),
                        )}
                      />

                      {/* Row Number */}
                      <div className="flex items-center justify-center">
                        <span className="w-8 h-8 rounded-xl bg-slate-50 group-hover:bg-white group-hover:shadow-sm text-[11px] font-black text-slate-400 flex items-center justify-center transition-all">
                          {rowNumber}
                        </span>
                      </div>

                      {/* Serial / Location */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={cn(
                            "shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-200",
                            isExpanded
                              ? cn(styles.bg, styles.text)
                              : "bg-slate-100 text-slate-400 group-hover:bg-slate-200/70",
                          )}
                        >
                          <Lightbulb className="w-4.5 h-4.5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-sm font-black text-slate-800 tracking-tight truncate group-hover:text-primary transition-colors leading-tight">
                            {unit.serialNumber}
                          </h3>
                          <p className="text-[11px] font-medium text-slate-400 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {unit.district || unit.address || unit.regency}
                          </p>
                        </div>
                      </div>

                      {/* Regency */}
                      <div>
                        <span className="text-xs font-bold text-slate-600">
                          {unit.regency}
                        </span>
                        <p className="text-[10px] font-medium text-slate-400 mt-0.5">
                          {unit.province}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border",
                            styles.bg,
                            styles.text,
                            styles.border,
                          )}
                        >
                          {(() => {
                            const StatusIcon = statusOptions.find(
                              (opt) => opt.value === unit.lastStatus,
                            )?.icon;
                            return StatusIcon ? (
                              <StatusIcon className="w-3.5 h-3.5" />
                            ) : (
                              <div
                                className={cn(
                                  "w-1.5 h-1.5 rounded-full",
                                  unit.lastStatus === "OPERATIONAL" &&
                                    "animate-pulse",
                                  styles.text.replace("text-", "bg-"),
                                )}
                              />
                            );
                          })()}
                          {getStatusLabel(unit.lastStatus)}
                        </div>
                      </div>

                      {/* Reports Count */}
                      <div className="flex items-center justify-center">
                        <div
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-colors",
                            unit._count.reports > 0
                              ? "bg-amber-50 text-amber-700"
                              : "bg-slate-50 text-slate-400",
                          )}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span className="text-xs font-black">
                            {unit._count.reports}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/map?unitId=${unit.id}`);
                          }}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:bg-primary/10 hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                          title="Lihat di Peta"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(
                              `https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`,
                              "_blank",
                            );
                          }}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all opacity-0 group-hover:opacity-100"
                          title="Google Maps"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          asChild
                          onClick={(e) => e.stopPropagation()}
                          className="w-8 h-8 rounded-lg text-slate-400 hover:bg-amber-50 hover:text-amber-600 transition-all opacity-0 group-hover:opacity-100"
                          title="Buat Laporan"
                        >
                          <Link href={`/report/new?unitId=${unit.id}`}>
                            <Zap className="w-3.5 h-3.5" />
                          </Link>
                        </Button>
                        {isAdmin && (
                          <>
                            <div className="w-px h-4 bg-slate-100 mx-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(unit);
                              }}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all opacity-0 group-hover:opacity-100"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(unit);
                              }}
                              className="w-8 h-8 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all opacity-0 group-hover:opacity-100"
                              title="Hapus"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-slate-300 transition-transform duration-200 ml-1",
                            isExpanded && "rotate-180 text-primary",
                          )}
                        />
                      </div>
                    </div>

                    {/* Mobile Card Row */}
                    <div
                      onClick={() =>
                        setExpandedUnitId(isExpanded ? null : unit.id)
                      }
                      className={cn(
                        "md:hidden relative cursor-pointer transition-all duration-200 active:bg-slate-50 border-b border-slate-50 last:border-0",
                        isExpanded ? "bg-primary/[0.02]" : "",
                      )}
                    >
                      {/* Mobile left accent */}
                      <div
                        className={cn(
                          "absolute left-0 top-0 bottom-0 w-[3px] transition-all duration-300",
                          isExpanded
                            ? styles.text.replace("text-", "bg-")
                            : "bg-transparent",
                        )}
                      />
                      <div className="pl-4 pr-5 py-4">
                        <div className="flex gap-4">
                          {/* Icon Column */}
                          <div
                            className={cn(
                              "shrink-0 w-11 h-11 rounded-2xl flex items-center justify-center transition-all shadow-sm mt-0.5",
                              isExpanded
                                ? cn(styles.bg, styles.text)
                                : "bg-white text-slate-400 border border-slate-100 shadow-slate-100",
                            )}
                          >
                            <Lightbulb className="w-5 h-5" />
                          </div>

                          {/* Content Column */}
                          <div className="flex-1 min-w-0">
                            {/* Header: Serial & Chevron */}
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
                                  {unit.serialNumber}
                                </h3>
                                <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1.5 leading-relaxed">
                                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                                  {unit.district || unit.regency}
                                </p>
                              </div>
                              <ChevronDown
                                className={cn(
                                  "shrink-0 w-5 h-5 text-slate-300 transition-transform duration-200 mt-0.5",
                                  isExpanded && "rotate-180 text-primary",
                                )}
                              />
                            </div>

                            {/* Footer: Status & Reports */}
                            <div className="flex items-center justify-between gap-3 mt-3.5">
                              <div
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border",
                                  styles.bg,
                                  styles.text,
                                  styles.border,
                                )}
                              >
                                {(() => {
                                  const StatusIcon = statusOptions.find(
                                    (opt) => opt.value === unit.lastStatus,
                                  )?.icon;
                                  return StatusIcon ? (
                                    <StatusIcon className="w-3.5 h-3.5" />
                                  ) : (
                                    <div
                                      className={cn(
                                        "w-1.5 h-1.5 rounded-full",
                                        unit.lastStatus === "OPERATIONAL" &&
                                          "animate-pulse",
                                        styles.text.replace("text-", "bg-"),
                                      )}
                                    />
                                  );
                                })()}
                                {getStatusLabel(unit.lastStatus)}
                              </div>

                              {/* Reports Indicator */}
                              {(unit._count.reports > 0 ||
                                unit.installDate) && (
                                <div className="flex items-center gap-3 text-[10px] font-medium text-slate-400">
                                  {unit._count.reports > 0 && (
                                    <div className="flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/50">
                                      <FileText className="w-3 h-3" />
                                      <span>{unit._count.reports}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expanded Detail Panel */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-5 pt-1">
                            <div className="bg-slate-50/70 rounded-2xl p-5 border border-slate-100/80">
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-5">
                                {/* Province */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Provinsi
                                  </span>
                                  <p className="text-sm font-bold text-slate-700">
                                    {unit.province}
                                  </p>
                                </div>
                                {/* District */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <Navigation className="w-3 h-3" /> Kecamatan
                                  </span>
                                  <p className="text-sm font-bold text-slate-700">
                                    {unit.district || "—"}
                                  </p>
                                </div>
                                {/* Village */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <Hash className="w-3 h-3" /> Kelurahan
                                  </span>
                                  <p className="text-sm font-bold text-slate-700">
                                    {unit.village || "—"}
                                  </p>
                                </div>
                                {/* Coordinates */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <MapPin className="w-3 h-3" /> Koordinat
                                  </span>
                                  <p className="text-xs font-mono font-bold text-slate-600">
                                    {Number(unit.latitude).toFixed(5)},{" "}
                                    {Number(unit.longitude).toFixed(5)}
                                  </p>
                                </div>
                                {/* Install Date */}
                                <div className="space-y-1.5">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-1">
                                    <Calendar className="w-3 h-3" /> Tgl Install
                                  </span>
                                  <p className="text-sm font-bold text-slate-700">
                                    {unit.installDate
                                      ? formatDate(unit.installDate)
                                      : "—"}
                                  </p>
                                </div>
                              </div>

                              {/* Address */}
                              {unit.address && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Alamat Lengkap
                                  </span>
                                  <p className="text-sm font-medium text-slate-600 mt-1">
                                    {unit.address}
                                  </p>
                                </div>
                              )}

                              {/* Expanded Actions */}
                              <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-slate-100">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(`/map?unitId=${unit.id}`);
                                  }}
                                  className="h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-slate-200 hover:border-primary hover:text-primary transition-all"
                                >
                                  <Eye className="w-3.5 h-3.5 mr-1.5" />
                                  Lihat di Peta
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    window.open(
                                      `https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`,
                                      "_blank",
                                    );
                                  }}
                                  className="h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-slate-200 hover:border-emerald-400 hover:text-emerald-600 transition-all"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
                                  Google Maps
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  asChild
                                  onClick={(e) => e.stopPropagation()}
                                  className="h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-slate-200 hover:border-amber-400 hover:text-amber-600 transition-all"
                                >
                                  <Link href={`/report/new?unitId=${unit.id}`}>
                                    <Zap className="w-3.5 h-3.5 mr-1.5" />
                                    Buat Laporan
                                  </Link>
                                </Button>
                                <div className="flex-1" />
                                {isAdmin && (
                                  <div className="flex items-center gap-2">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEdit(unit);
                                      }}
                                      className="h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-blue-200 text-blue-600 hover:bg-blue-50 transition-all"
                                    >
                                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                                      Edit
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(unit);
                                      }}
                                      className="h-9 rounded-xl text-[10px] font-black uppercase tracking-wider border-red-200 text-red-600 hover:bg-red-50 transition-all"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                                      Hapus
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>

            {/* Inline Pagination Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50/60 border-t border-slate-100">
              <p className="text-[10px] sm:text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Menampilkan{" "}
                <span className="text-slate-700 bg-white px-1 sm:px-1.5 py-0.5 rounded-md border border-slate-100">
                  {initialUnits.length}
                </span>{" "}
                dari{" "}
                <span className="text-slate-700 bg-white px-1 sm:px-1.5 py-0.5 rounded-md border border-slate-100">
                  {total}
                </span>{" "}
                unit
              </p>

              <div className="flex items-center gap-0.5 sm:gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page <= 1}
                  onClick={() => updateURL({ page: String(page - 1) })}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all text-slate-500"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant="ghost"
                      size="icon"
                      onClick={() => updateURL({ page: String(pageNum) })}
                      className={cn(
                        "h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black transition-all",
                        pageNum === page
                          ? "bg-slate-900 text-white shadow-lg shadow-slate-300/50 hover:bg-slate-800"
                          : "text-slate-400 hover:bg-white hover:text-slate-900 hover:shadow-sm",
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}

                <Button
                  variant="ghost"
                  size="icon"
                  disabled={page >= totalPages}
                  onClick={() => updateURL({ page: String(page + 1) })}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg sm:rounded-xl hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all text-slate-500"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <UnitDialog
        open={isUnitDialogOpen}
        onOpenChange={setIsUnitDialogOpen}
        unit={selectedUnit}
      />
      <DeleteUnitDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        unit={unitToDelete}
      />
      <ImportUnitDialog
        open={isImportDialogOpen}
        onOpenChange={setIsImportDialogOpen}
      />
    </div>
  );
}
