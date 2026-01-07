"use client";

import { useState, useTransition } from "react";
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
  ExternalLink,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
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
import { getStatusLabel, formatDate } from "@/lib/utils";
import { UnitStatus } from "@prisma/client";

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

  const updateURL = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    if (!updates.page) {
      params.set("page", "1");
    }

    startTransition(() => {
      router.push(`/units?${params.toString()}`);
    });
  };

  const handleSearch = () => {
    updateURL({ search: searchQuery || undefined });
  };

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

  const hasActiveFilters = selectedProvince || selectedStatus || searchQuery;

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan Serial Number, Kabupaten..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="w-full h-10 pl-10 pr-4 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSearch}>Cari</Button>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedProvince(undefined);
                  setSelectedStatus(undefined);
                  updateURL({
                    search: undefined,
                    province: undefined,
                    status: undefined,
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="bg-slate-50 rounded-lg p-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                value={selectedProvince || "all"}
                onValueChange={(v) => {
                  const value = v === "all" ? undefined : v;
                  setSelectedProvince(value);
                  updateURL({ province: value });
                }}
              >
                <SelectTrigger label="Provinsi">
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

              <Select
                value={selectedStatus || "all"}
                onValueChange={(v) => {
                  const value = v === "all" ? undefined : v;
                  setSelectedStatus(value);
                  updateURL({ status: value });
                }}
              >
                <SelectTrigger label="Status">
                  <SelectValue placeholder="Semua Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Status</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <opt.icon className={`h-4 w-4 ${opt.color}`} />
                        {opt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Units Grid/Table */}
      <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
        {/* Desktop Table */}
        <Card className="hidden lg:block overflow-hidden">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Serial Number</th>
                  <th>Lokasi</th>
                  <th className="text-center">Status</th>
                  <th className="text-center">Laporan</th>
                  <th>Koordinat</th>
                  <th className="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {initialUnits.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-500">
                      Tidak ada unit ditemukan
                    </td>
                  </tr>
                ) : (
                  initialUnits.map((unit, index) => (
                    <tr
                      key={unit.id}
                      className="animate-fade-in"
                      style={{ animationDelay: `${index * 0.03}s` }}
                    >
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Lightbulb className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">
                              {unit.serialNumber}
                            </p>
                            {unit.installDate && (
                              <p className="text-xs text-slate-500">
                                Dipasang: {formatDate(unit.installDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {unit.province}
                          </p>
                          <p className="text-xs text-slate-500">
                            {unit.regency}
                            {unit.district && `, ${unit.district}`}
                          </p>
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge variant={getStatusBadgeVariant(unit.lastStatus)}>
                          {getStatusLabel(unit.lastStatus)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge variant="secondary">
                          {unit._count.reports} laporan
                        </Badge>
                      </td>
                      <td>
                        <code className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">
                          {unit.latitude.toFixed(4)}, {unit.longitude.toFixed(4)}
                        </code>
                      </td>
                      <td className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon-sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`,
                                  "_blank"
                                )
                              }
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Lihat di Maps
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/report/new?unitId=${unit.id}`}>
                                <FileText className="h-4 w-4 mr-2" />
                                Buat Laporan
                              </Link>
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Unit
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Hapus
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Mobile Cards */}
        <div className="lg:hidden space-y-3">
          {initialUnits.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              Tidak ada unit ditemukan
            </Card>
          ) : (
            initialUnits.map((unit, index) => (
              <Card
                key={unit.id}
                className="p-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                      <Lightbulb className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {unit.serialNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {unit.province}, {unit.regency}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusBadgeVariant(unit.lastStatus)}>
                    {getStatusLabel(unit.lastStatus)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-500">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {unit._count.reports} laporan
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps?q=${unit.latitude},${unit.longitude}`,
                        "_blank"
                      )
                    }
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Maps
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Menampilkan {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} dari{" "}
              {total} unit
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateURL({ page: (page - 1).toString() })}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-600 px-2">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => updateURL({ page: (page + 1).toString() })}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

