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
  MoreHorizontal,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PjutsUnitData } from "@/app/actions/units";
import { getStatusLabel, formatDate, cn } from "@/lib/utils";
import { UnitStatus } from "@prisma/client";
import { UnitDialog } from "@/components/units/unit-dialog";
import { DeleteUnitDialog } from "@/components/units/delete-unit-dialog";
import { ImportUnitDialog } from "@/components/units/import-unit-dialog";
import { utils, writeFile } from "xlsx";
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

  const getStatusBadgeVariant = (status: UnitStatus) => {
    switch (status) {
      case "OPERATIONAL":
        return "operational";
      case "MAINTENANCE_NEEDED":
        return "maintenance";
      case "OFFLINE":
        return "offline";
      default:
        return "unverified";
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

      const wb = utils.book_new();
      const ws = utils.json_to_sheet(dataToExport);
      utils.book_append_sheet(wb, ws, "Units");
      writeFile(
        wb,
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
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
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
            <div className="flex p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl border border-slate-200/40">
              <Button
                variant="ghost"
                onClick={() => setIsImportDialogOpen(true)}
                className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-wider hover:bg-white hover:text-emerald-600 transition-all"
              >
                <Upload className="h-3.5 w-3.5 mr-2" />
                Import
              </Button>
              <Button
                variant="ghost"
                onClick={handleExport}
                disabled={isExporting}
                className="rounded-xl h-10 px-4 font-black text-[10px] uppercase tracking-wider hover:bg-white hover:text-emerald-600 transition-all"
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

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors z-10" />
            <input
              type="text"
              placeholder="Cari Serial Number atau Lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="relative w-full h-14 pl-14 pr-12 rounded-[2rem] border-2 border-transparent bg-white/60 backdrop-blur-xl text-base font-bold shadow-xl shadow-slate-200/10 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white transition-all placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  updateURL({ search: undefined });
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors bg-slate-100 rounded-full p-1 z-10"
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
                "h-14 px-8 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shrink-0 border-2",
                showFilters
                  ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200"
                  : "bg-white border-slate-100 hover:border-primary text-slate-600 shadow-sm shadow-slate-200/5",
              )}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter Lanjutan
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
                className="h-14 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-50 shrink-0 transition-all border-2 border-transparent hover:border-red-100"
              >
                <X className="h-4 w-4 mr-2" />
                Reset
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
              <div className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-50 shadow-2xl shadow-slate-200/40 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider leading-none mb-1">
                        Penyaringan Aset
                      </h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Sesuaikan tampilan data unit
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

      <div
        className={cn(
          "transition-opacity duration-300",
          isPending ? "opacity-50 pointer-events-none" : "opacity-100",
        )}
      >
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {initialUnits.length === 0 ? (
            <Card className="p-12 text-center">
              <Lightbulb className="h-12 w-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Tidak ada unit ditemukan</p>
              <p className="text-slate-400 text-sm mt-1">Coba ubah filter pencarian</p>
          </Card>
          ) : (
            initialUnits.map((unit, index) => (
              <Card
                key={unit.id}
                onClick={() => router.push(`/map?unitId=${unit.id}`)}
                className="p-5 animate-fade-in border-2 border-slate-50 shadow-xl shadow-slate-200/20 rounded-[2rem] bg-white group cursor-pointer hover:border-primary/50 transition-all"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-inner group-hover:scale-110 transition-transform">
                    <Lightbulb className="h-7 w-7" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-black text-lg text-slate-900 tracking-tight leading-none mb-1">
                          {unit.serialNumber}
                        </p>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                          {unit.regency}
                        </p>
                      </div>
                      <Badge
                        variant={getStatusBadgeVariant(unit.lastStatus)}
                        className="shrink-0 text-[10px] font-black uppercase tracking-wider h-6 rounded-lg px-2"
                      >
                        {getStatusLabel(unit.lastStatus)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-wider">
                        <FileText size={12} className="text-emerald-500/60" />
                        {unit._count.reports} Laporan
                      </div>
                      {unit.latitude === 0 && unit.longitude === 0 ? (
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                          Lokasi Belum Tersedia
                        </span>
                      ) : (
                        <code className="text-[10px] font-black bg-emerald-50/50 px-2 py-1 rounded-lg text-emerald-600 tracking-tight">
                          {unit.latitude.toFixed(4)},{" "}
                          {unit.longitude.toFixed(4)}
                        </code>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-50">
                      <Button
                        variant="secondary"
                        size="sm"
                        disabled={unit.latitude === 0 && unit.longitude === 0}
                        className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-30"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(
                            `https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`,
                            "_blank",
                          );
                        }}
                      >
                        <MapPin className="h-3.5 w-3.5 mr-2" />
                        Maps
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 transition-all border-none"
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/report/new?unitId=${unit.id}`}>
                          <FileText className="h-3.5 w-3.5 mr-2" />
                          Lapor
                        </Link>
                      </Button>
                    </div>
                    {isAdmin && (
                      <div className="mt-2 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-full rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="h-4 w-4 mr-2" /> Kelola
                              Unit
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-2xl border-slate-100 shadow-2xl p-2 min-w-[160px]"
                          >
                            <DropdownMenuItem
                              className="rounded-xl py-3 font-black text-[10px] uppercase tracking-wider cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(unit);
                              }}
                            >
                              <Pencil className="h-3.5 w-3.5 mr-3 text-amber-500" />
                              Edit Unit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="rounded-xl py-3 font-black text-[10px] uppercase tracking-wider cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(unit);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5 mr-3" />
                              Hapus Unit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Desktop Table */}
        <div className="hidden lg:block overflow-x-auto pb-4">
          <table className="w-full text-left border-separate border-spacing-y-4">
            <thead>
              <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                <th className="px-8 py-4">Serial Number & Verifikasi</th>
                <th className="px-8 py-4">Wilayah Operasional</th>
                <th className="px-8 py-4 text-center">Status</th>
                <th className="px-8 py-4 text-center">Intensitas Laporan</th>
                <th className="px-8 py-4">Koordinat GPS</th>
                <th className="px-8 py-4 text-center">Opsi</th>
              </tr>
            </thead>
            <tbody>
              {initialUnits.map((unit, index) => (
                <tr
                  key={unit.id}
                  onClick={() => router.push(`/map?unitId=${unit.id}`)}
                  className="group animate-in fade-in slide-in-from-bottom-2 duration-500 cursor-pointer"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="px-8 py-6 bg-white group-hover:bg-slate-50/50 rounded-l-[2.5rem] border-y-2 border-l-2 border-slate-50 transition-all duration-300">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-[1.25rem] bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                        <Lightbulb className="h-7 w-7" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-2">
                          {unit.serialNumber}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                            Asset ID
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            {unit.installDate
                              ? formatDate(unit.installDate)
                              : "PENDING VERIF"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300">
                    <p className="text-sm font-black text-slate-900 tracking-tight mb-1 uppercase">
                      {unit.regency}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                      <MapPin className="h-3 w-3 text-emerald-500" />
                      {unit.province}
                    </p>
                  </td>
                  <td className="px-8 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300 text-center">
                    <Badge
                      variant={getStatusBadgeVariant(unit.lastStatus)}
                      className="rounded-xl px-4 py-2 text-[10px] font-black border-none shadow-sm uppercase tracking-[0.1em]"
                    >
                      {getStatusLabel(unit.lastStatus)}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300 text-center">
                    <div className="inline-flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl font-black text-[10px] uppercase tracking-[0.1em] text-slate-500">
                      <FileText size={14} className="text-emerald-500/60" />
                      {unit._count.reports} REPORTS
                    </div>
                  </td>
                  <td className="px-8 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300">
                    {unit.latitude === 0 && unit.longitude === 0 ? (
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
                        Belum Tersedia
                      </span>
                    ) : (
                      <code className="text-[11px] font-black bg-slate-100/80 px-3 py-1.5 rounded-xl text-emerald-700 tracking-tight shadow-sm">
                        {unit.latitude.toFixed(6)}, {unit.longitude.toFixed(6)}
                      </code>
                    )}
                  </td>
                  <td className="px-8 py-6 bg-white group-hover:bg-slate-50/50 rounded-r-[2.5rem] border-y-2 border-r-2 border-slate-50 transition-all duration-300 text-center">
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-white hover:shadow-xl transition-all"
                          >
                            <MoreHorizontal className="h-6 w-6 text-slate-400" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="rounded-[2rem] border-slate-100 shadow-2xl p-3 min-w-[200px]"
                        >
                          <DropdownMenuItem
                            className="rounded-xl py-4 px-4 font-black text-[10px] uppercase tracking-wider cursor-pointer"
                            disabled={
                              unit.latitude === 0 && unit.longitude === 0
                            }
                            onClick={() =>
                              window.open(
                                `https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`,
                                "_blank",
                              )
                            }
                          >
                            <MapPin className="h-4 w-4 mr-3 text-emerald-500" />
                            Buka di Google Maps
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            asChild
                            className="rounded-xl py-4 px-4 font-black text-[10px] uppercase tracking-wider cursor-pointer"
                          >
                            <Link href={`/report/new?unitId=${unit.id}`}>
                              <Zap className="h-4 w-4 mr-3 text-amber-500" />
                              Buat Laporan Baru
                            </Link>
                          </DropdownMenuItem>
                          {isAdmin && (
                            <>
                              <div className="h-px bg-slate-100 my-2 mx-2" />
                              <DropdownMenuItem
                                className="rounded-xl py-4 px-4 font-black text-[10px] uppercase tracking-wider cursor-pointer"
                                onClick={() => handleEdit(unit)}
                              >
                                <Pencil className="h-4 w-4 mr-3 text-slate-400" />
                                Edit Informasi Unit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="rounded-xl py-4 px-4 font-black text-[10px] uppercase tracking-wider cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                                onClick={() => handleDelete(unit)}
                              >
                                <Trash2 className="h-4 w-4 mr-3" />
                                Hapus dari Sistem
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination Info */}
      {initialUnits.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 py-6 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Showing{" "}
            <span className="text-slate-900">{initialUnits.length}</span> of{" "}
            <span className="text-slate-900">{total}</span> assets
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateURL({ page: String(page - 1) })}
              className="h-12 px-6 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <div className="bg-slate-100 px-4 py-3 rounded-xl font-black text-xs text-slate-600">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateURL({ page: String(page + 1) })}
              className="h-12 px-6 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

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
