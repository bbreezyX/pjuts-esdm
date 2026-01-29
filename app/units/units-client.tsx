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
} from "lucide-react";
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

interface UnitsPageClientProps {
  initialUnits: PjutsUnitData[];
  total: number;
  page: number;
  totalPages: number;
  provinces: string[];
  initialProvince?: string;
  initialStatus?: string;
  initialSearch?: string;
  isAdmin?: boolean;
}

const statusOptions = [
  { value: "OPERATIONAL", label: "Operasional", icon: CheckCircle2, color: "text-emerald-600" },
  { value: "MAINTENANCE_NEEDED", label: "Perlu Perawatan", icon: AlertTriangle, color: "text-amber-600" },
  { value: "OFFLINE", label: "Offline", icon: XCircle, color: "text-red-600" },
  { value: "UNVERIFIED", label: "Belum Verifikasi", icon: HelpCircle, color: "text-slate-500" },
];

export function UnitsPageClient({
  initialUnits,
  total,
  page,
  totalPages,
  provinces,
  initialProvince,
  initialStatus,
  initialSearch,
  isAdmin = false,
}: UnitsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch || "");
  const [selectedProvince, setSelectedProvince] = useState(initialProvince);
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [isUnitDialogOpen, setIsUnitDialogOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<PjutsUnitData | undefined>(undefined);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<PjutsUnitData | null>(null);

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value); else params.delete(key);
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
      case "OPERATIONAL": return "operational";
      case "MAINTENANCE_NEEDED": return "maintenance";
      case "OFFLINE": return "offline";
      default: return "unverified";
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

  const hasActiveFilters = selectedProvince || selectedStatus || searchQuery;

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      <div className="flex flex-col gap-4 sm:gap-6">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-1 sm:mb-2">Unit PJUTS</h1>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium">Kelola dan pantau seluruh unit penerangan jalan umum tenaga surya secara terpadu.</p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button variant="outline" className="rounded-xl sm:rounded-2xl border-border h-9 sm:h-12 px-3 sm:px-6 font-bold hover:bg-muted text-xs sm:text-sm">
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Import
            </Button>
            <Button variant="outline" className="rounded-xl sm:rounded-2xl border-border h-9 sm:h-12 px-3 sm:px-6 font-bold hover:bg-muted text-xs sm:text-sm">
              <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Export
            </Button>
            <Button size="lg" onClick={handleCreate} className="bg-foreground text-background hover:opacity-90 rounded-xl sm:rounded-2xl px-3 sm:px-6 h-9 sm:h-12 font-bold transition-all shadow-lg shadow-foreground/5 hover:scale-105 text-xs sm:text-sm">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" />
              Tambah Unit
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-slate-600 transition-colors z-10" />
            <input 
              type="text" 
              placeholder="Cari unit..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              onKeyDown={(e) => e.key === "Enter" && handleSearch()} 
              className="relative w-full h-10 sm:h-12 pl-10 sm:pl-12 pr-3 sm:pr-4 rounded-xl sm:rounded-full border border-slate-200/60 bg-white/80 backdrop-blur-md text-xs sm:text-sm font-medium shadow-sm shadow-slate-200/20 focus:outline-none focus:ring-4 focus:ring-slate-900/5 focus:border-slate-300 transition-all placeholder:text-slate-400" 
            />
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant={showFilters ? "default" : "outline"} 
              onClick={() => setShowFilters(!showFilters)}
              className={cn(
                "h-10 sm:h-12 px-3 sm:px-6 rounded-xl sm:rounded-2xl font-bold transition-all shrink-0 text-xs sm:text-sm",
                showFilters ? "bg-primary shadow-lg shadow-primary/20" : "hover:bg-muted"
              )}
            >
              <Filter className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              <span className="hidden xs:inline">Filter </span>Lanjutan
            </Button>
            {hasActiveFilters && (
              <Button 
                variant="ghost" 
                onClick={() => { setSearchQuery(""); setSelectedProvince(undefined); setSelectedStatus(undefined); updateURL({ search: undefined, province: undefined, status: undefined }); }}
                className="h-10 sm:h-12 px-3 sm:px-5 rounded-xl sm:rounded-2xl font-bold text-red-500 hover:bg-red-50 shrink-0 transition-all text-xs sm:text-sm"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>
        
        {showFilters && (
          <div className="bg-muted/30 backdrop-blur-md rounded-2xl sm:rounded-[2rem] p-4 sm:p-8 border border-border/50 space-y-4 sm:space-y-6 animate-in slide-in-from-top-4 fade-in duration-500">
            <div className="flex items-center gap-2 mb-1 sm:mb-2">
              <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
              <h3 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-wider">Kriteria Penyaringan</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1">Provinsi</label>
                <Select value={selectedProvince || "all"} onValueChange={(v) => { const val = v === "all" ? undefined : v; setSelectedProvince(val); updateURL({ province: val }); }}>
                  <SelectTrigger className="h-10 sm:h-12 rounded-xl border-border/60 bg-card/50 font-bold text-xs sm:text-sm">
                    <SelectValue placeholder="Semua Provinsi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border shadow-2xl">
                    <SelectItem value="all" className="font-bold">Semua Provinsi</SelectItem>
                    {provinces.map((prov) => (<SelectItem key={prov} value={prov} className="font-medium">{prov}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-[0.1em] ml-1">Status Unit</label>
                <Select value={selectedStatus || "all"} onValueChange={(v) => { const val = v === "all" ? undefined : v; setSelectedStatus(val); updateURL({ status: val }); }}>
                  <SelectTrigger className="h-10 sm:h-12 rounded-xl border-border/60 bg-card/50 font-bold text-xs sm:text-sm">
                    <SelectValue placeholder="Semua Status" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border shadow-2xl">
                    <SelectItem value="all" className="font-bold">Semua Status</SelectItem>
                    {statusOptions.map((opt) => (<SelectItem key={opt.value} value={opt.value} className="font-medium"><div className="flex items-center gap-2"><opt.icon className={`h-4 w-4 ${opt.color}`} />{opt.label}</div></SelectItem>))}</SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className={cn("transition-opacity duration-300", isPending ? "opacity-50 pointer-events-none" : "opacity-100")}>
        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {initialUnits.length === 0 ? (
            <Card className="p-6 text-center text-slate-500 text-sm">
              Tidak ada unit ditemukan
            </Card>
          ) : (
            initialUnits.map((unit, index) => (
              <Card
                key={unit.id}
                className="p-3 sm:p-4 animate-fade-in border-border/50"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-primary/5 flex items-center justify-center text-primary shrink-0">
                    <Lightbulb className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-bold text-sm sm:text-base text-foreground truncate">{unit.serialNumber}</p>
                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                          {unit.province}, {unit.regency}
                        </p>
                      </div>
                      <Badge variant={getStatusBadgeVariant(unit.lastStatus)} className="shrink-0 text-[9px] sm:text-[10px] h-5 sm:h-6 rounded-lg">
                        {getStatusLabel(unit.lastStatus)}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <div className="inline-flex items-center gap-1 bg-muted/50 px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-bold text-muted-foreground">
                        <FileText size={10} className="text-primary/60" />
                        {unit._count.reports} Laporan
                      </div>
                      <code className="text-[9px] sm:text-[10px] font-medium bg-muted/40 px-1.5 py-0.5 rounded text-primary">
                        {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg text-[10px] sm:text-xs font-bold flex-1"
                        onClick={() => window.open(`https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`, "_blank")}
                      >
                        <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                        Maps
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg text-[10px] sm:text-xs font-bold flex-1"
                        asChild
                      >
                        <Link href={`/report/new?unitId=${unit.id}`}>
                          <FileText className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                          Lapor
                        </Link>
                      </Button>
                      {isAdmin && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl border-border shadow-xl p-1.5 min-w-[140px]">
                            <DropdownMenuItem className="rounded-lg py-2 font-bold text-xs cursor-pointer" onClick={() => handleEdit(unit)}>
                              <Pencil className="h-3.5 w-3.5 mr-2 text-amber-500" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg py-2 font-bold text-xs cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(unit)}>
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
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
                <tr key={unit.id} className="group animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: `${index * 0.05}s` }}>
                  <td className="px-8 py-6 bg-card group-hover:bg-muted/30 rounded-l-[2.5rem] border-y border-l border-border/50 transition-all duration-300">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
                        <Lightbulb className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-black text-foreground tracking-tight leading-none mb-1.5">{unit.serialNumber}</p>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{unit.installDate ? formatDate(unit.installDate) : "Menunggu Verifikasi"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                    <p className="text-sm font-bold text-foreground tracking-tight mb-1">{unit.province}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-primary/40" />
                      {unit.regency}
                    </p>
                  </td>
                  <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300 text-center">
                    <Badge variant={getStatusBadgeVariant(unit.lastStatus)} className="rounded-xl px-3 py-1 text-[10px] font-black border-none shadow-sm uppercase tracking-wider">
                      {getStatusLabel(unit.lastStatus)}
                    </Badge>
                  </td>
                  <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300 text-center">
                    <div className="inline-flex items-center gap-2 bg-muted px-3 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-wider text-muted-foreground border border-border/30">
                      <FileText size={12} className="text-primary/60" />
                      {unit._count.reports} LAPORAN
                    </div>
                  </td>
                  <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                    <code className="text-[11px] font-black bg-muted/40 px-2.5 py-1 rounded-lg text-primary tracking-tight">
                      {unit.latitude.toFixed(6)}, {unit.longitude.toFixed(6)}
                    </code>
                  </td>
                  <td className="px-8 py-6 bg-card group-hover:bg-muted/30 rounded-r-[2.5rem] border-y border-r border-border/50 transition-all duration-300 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-muted/30 hover:bg-card transition-all">
                          <MoreHorizontal className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-2xl border-border shadow-2xl p-2 min-w-[180px]">
                        <DropdownMenuItem className="rounded-xl py-3 font-bold text-xs cursor-pointer" onClick={() => window.open(`https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`, "_blank")}>
                          <MapPin className="h-4 w-4 mr-3 text-primary" /> Lihat di Maps
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl py-3 font-bold text-xs cursor-pointer">
                          <Link href={`/report/new?unitId=${unit.id}`}>
                            <FileText className="h-4 w-4 mr-3 text-emerald-500" /> Buat Laporan
                          </Link>
                        </DropdownMenuItem>
                        {isAdmin && (
                          <>
                            <div className="h-px bg-border my-2 mx-1" />
                            <DropdownMenuItem className="rounded-xl py-3 font-bold text-xs cursor-pointer" onClick={() => handleEdit(unit)}>
                              <Pencil className="h-4 w-4 mr-3 text-amber-500" /> Edit Unit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-xl py-3 font-bold text-xs cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => handleDelete(unit)}>
                              <Trash2 className="h-4 w-4 mr-3" /> Hapus Unit
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination Info */}
      {initialUnits.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <p className="text-xs sm:text-sm text-muted-foreground font-medium">
            Menampilkan <span className="font-bold text-foreground">{initialUnits.length}</span> dari <span className="font-bold text-foreground">{total}</span> unit
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => updateURL({ page: String(page - 1) })}
              className="h-8 sm:h-9 px-3 rounded-lg sm:rounded-xl text-xs font-bold"
            >
              <ChevronLeft className="h-3.5 w-3.5 mr-1" />
              Prev
            </Button>
            <span className="text-xs sm:text-sm font-bold text-muted-foreground px-2">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => updateURL({ page: String(page + 1) })}
              className="h-8 sm:h-9 px-3 rounded-lg sm:rounded-xl text-xs font-bold"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      <UnitDialog open={isUnitDialogOpen} onOpenChange={setIsUnitDialogOpen} unit={selectedUnit} />
      <DeleteUnitDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen} unit={unitToDelete} />
    </div>
  );
}
