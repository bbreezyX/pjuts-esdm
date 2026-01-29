"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Eye,
  Trash2,
  MapPin,
  Zap,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  Download,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getStatusVariant } from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { ReportData } from "@/app/actions/reports";
import { formatDateTime, getRelativeTime } from "@/lib/utils";
import { deleteReport } from "@/app/actions/reports";

interface ReportsTableProps {
  reports: ReportData[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isAdmin?: boolean;
}

export function ReportsTable({
  reports,
  total,
  page,
  totalPages,
  onPageChange,
  isAdmin = false,
}: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ReportData | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const result = await deleteReport(deleteConfirm.id);
      if (result.success) {
        setDeleteConfirm(null);
        window.location.reload();
      }
    } finally {
      setDeleting(false);
    }
  };

  // Empty State Component
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center py-20 sm:py-32 px-4">
      <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center mb-8 shadow-inner">
        <FileText className="w-12 h-12 text-slate-200" />
      </div>
      <h3 className="text-xl font-black text-slate-900 mb-2 uppercase tracking-tight">
        Laporan Kosong
      </h3>
      <p className="text-sm font-medium text-slate-400 text-center max-w-sm">
        Belum ada data monitoring yang terekam untuk kriteria ini.
      </p>
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Desktop Table - Enhanced */}
      <div className="hidden lg:block overflow-x-auto pb-8">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">
              <th className="px-10 py-4">Identitas Unit</th>
              <th className="px-10 py-4">Dokumentasi</th>
              <th className="px-10 py-4 text-center">Tegangan</th>
              <th className="px-10 py-4">Wilayah</th>
              <th className="px-10 py-4">Pelapor</th>
              <th className="px-10 py-4">Waktu Lapor</th>
              <th className="px-10 py-4 text-center">Opsi</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <div className="bg-white rounded-[3rem] border-2 border-slate-50 shadow-xl shadow-slate-200/20">
                    <EmptyState />
                  </div>
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr
                  key={report.id}
                  className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="px-10 py-6 bg-white group-hover:bg-slate-50/50 rounded-l-[2.5rem] border-y-2 border-l-2 border-slate-50 transition-all duration-300">
                    <div>
                      <p className="font-black text-slate-900 text-lg tracking-tight leading-none mb-2">
                        {report.unit.serialNumber}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md">
                          Pole ID
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300">
                    <div
                      className="relative w-16 h-16 rounded-2xl overflow-hidden cursor-pointer ring-4 ring-transparent hover:ring-primary/10 transition-all duration-500 shadow-xl group/img"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Image
                        src={
                          (report.images && report.images.length > 0
                            ? report.images[0].url
                            : report.imageUrl) || "/placeholder-image.jpg"
                        }
                        alt="Report"
                        fill
                        className="object-cover transition-transform duration-700 group-hover/img:scale-125"
                      />
                      {report.images && report.images.length > 1 && (
                        <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all duration-300">
                          <span className="text-white text-[10px] font-black">
                            +{report.images.length - 1}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-10 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300 text-center">
                    <div className="inline-flex flex-col items-center">
                      <Badge
                        variant={getStatusVariant(report.batteryVoltage)}
                        className="rounded-xl px-4 py-2 text-[12px] font-black border-none shadow-sm uppercase tracking-tighter"
                      >
                        {report.batteryVoltage}V
                      </Badge>
                    </div>
                  </td>
                  <td className="px-10 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight uppercase">
                          {report.unit.regency}
                        </p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                          {report.unit.province}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center border-2 border-indigo-100/50 shadow-sm overflow-hidden text-indigo-600 font-black text-sm uppercase">
                        {report.user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">
                          {report.user.name}
                        </p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          Petugas Lapangan
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-6 bg-white group-hover:bg-slate-50/50 border-y-2 border-slate-50 transition-all duration-300">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-3 w-3 text-primary" />
                        <p className="text-xs font-black text-slate-900 tracking-tight">
                          {formatDateTime(report.createdAt).split(" ")[0]}
                        </p>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]">
                        {getRelativeTime(report.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td className="px-10 py-6 bg-white group-hover:bg-slate-50/50 rounded-r-[2.5rem] border-y-2 border-r-2 border-slate-50 transition-all duration-300 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-12 w-12 rounded-2xl bg-slate-50 hover:bg-primary hover:text-white transition-all shadow-sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-5 w-5" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-12 w-12 rounded-2xl bg-red-50 hover:bg-red-500 hover:text-white text-red-600 transition-all shadow-sm"
                          onClick={() => setDeleteConfirm(report)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile/Tablet Cards - Enhanced */}
      <div className="lg:hidden space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-xl shadow-slate-200/20">
            <EmptyState />
          </div>
        ) : (
          reports.map((report, index) => (
            <Card
              key={report.id}
              className="p-5 animate-fade-in border-2 border-slate-50 shadow-xl shadow-slate-200/20 rounded-[2.5rem] bg-white group"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex gap-4">
                <div
                  className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 cursor-pointer group/img shadow-xl ring-4 ring-transparent hover:ring-primary/10 transition-all"
                  onClick={() => setSelectedReport(report)}
                >
                  <Image
                    src={
                      (report.images && report.images.length > 0
                        ? report.images[0].url
                        : report.imageUrl) || "/placeholder-image.jpg"
                    }
                    alt="Report"
                    fill
                    className="object-cover transition-transform duration-700 group-hover/img:scale-125"
                  />
                  {report.images && report.images.length > 1 && (
                    <div className="absolute inset-0 bg-primary/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-black">
                        +{report.images.length - 1}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-black text-lg text-slate-900 tracking-tight leading-none mb-1">
                        {report.unit.serialNumber}
                      </p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin size={10} className="text-emerald-500" />
                        {report.unit.regency}
                      </p>
                    </div>
                    <Badge
                      className="shrink-0 rounded-lg px-2 py-1 text-[10px] font-black border-none shadow-sm uppercase tracking-wider"
                      variant={getStatusVariant(report.batteryVoltage)}
                    >
                      {report.batteryVoltage}V
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5">
                      <User size={12} className="text-primary" />
                      {report.user.name}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-primary" />
                      {getRelativeTime(report.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200 transition-all flex-1"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Detail
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-100 transition-all shrink-0"
                        onClick={() => setDeleteConfirm(report)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {report.images && report.images.length > 1 && (
                <div className="mt-4 pt-4 border-t border-slate-50">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
                    {report.images.slice(1, 5).map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 cursor-pointer shadow-lg ring-2 ring-transparent hover:ring-primary/20 transition-all"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Image
                          src={img.url}
                          alt={`Evidence ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {report.images.length > 5 && (
                      <div
                        className="w-16 h-16 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer hover:bg-slate-100 transition-all"
                        onClick={() => setSelectedReport(report)}
                      >
                        <span className="text-[10px] font-black text-slate-400">
                          +{report.images.length - 5}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Enhanced Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-12 py-6 border-t border-slate-100">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Menampilkan{" "}
            <span className="text-slate-900">
              {Math.min((page - 1) * 20 + 1, total)}
            </span>{" "}
            -{" "}
            <span className="text-slate-900">{Math.min(page * 20, total)}</span>{" "}
            dari <span className="text-slate-900">{total}</span> laporan
          </p>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-12 px-6 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>
            <div className="bg-slate-100 px-4 py-3 rounded-xl font-black text-xs text-slate-600">
              {page} / {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-12 px-6 rounded-2xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 disabled:opacity-30 transition-all"
            >
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      )}

      {/* Report Detail Modal - Enhanced */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={() => setSelectedReport(null)}
      >
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-border/50">
          {selectedReport && (
            <>
              <DialogHeader className="space-y-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1.5 h-6 bg-primary rounded-full shadow-lg shadow-primary/20" />
                  <div>
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none mb-1 block">
                      Identitas Monitoring
                    </span>
                    <DialogTitle className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-none">
                      {selectedReport.unit.serialNumber}
                    </DialogTitle>
                  </div>
                </div>
                <DialogDescription className="text-left text-sm">
                  {formatDateTime(selectedReport.createdAt)} oleh{" "}
                  <span className="font-medium text-foreground">
                    {selectedReport.user.name}
                  </span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 sm:gap-5 mt-4">
                {/* Images Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                  {selectedReport.images && selectedReport.images.length > 0 ? (
                    selectedReport.images.map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-muted border border-border/50 group"
                      >
                        <Image
                          src={img.url}
                          alt={`Report Image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="absolute bottom-2 right-2 bg-white/90 hover:bg-white h-8 w-8 rounded-lg shadow-lg"
                            onClick={() => window.open(img.url, "_blank")}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : selectedReport.imageUrl ? (
                    <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-muted border border-border/50 col-span-2 sm:col-span-3">
                      <Image
                        src={selectedReport.imageUrl}
                        alt="Report Image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-xl sm:rounded-2xl overflow-hidden bg-muted border border-border/50 flex items-center justify-center col-span-2 sm:col-span-3">
                      <span className="text-muted-foreground text-sm font-medium">
                        Tidak ada gambar
                      </span>
                    </div>
                  )}
                </div>

                {/* Meta Personnel & Time */}
                <div className="bg-slate-50/80 backdrop-blur-md rounded-3xl p-6 border-2 border-slate-100/50 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white border-2 border-slate-100 flex items-center justify-center text-primary font-black text-lg">
                      {selectedReport.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 tracking-tight">
                        {selectedReport.user.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Petugas Lapangan • Terverifikasi
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                      <Calendar size={12} className="text-primary" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {formatDateTime(selectedReport.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-xl">
                      <Zap size={12} className="text-amber-500" />
                      <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                        {selectedReport.batteryVoltage}V READOUT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center gap-2 mb-4">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Lokasi Geografis
                      </span>
                    </div>
                    <p className="text-xs font-black text-slate-900 font-mono bg-slate-50 p-3 rounded-xl border border-slate-100 break-all leading-relaxed">
                      {selectedReport.latitude.toFixed(6)},{" "}
                      {selectedReport.longitude.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-white rounded-3xl p-6 border-2 border-slate-50 shadow-xl shadow-slate-200/20">
                    <div className="flex items-center gap-2 mb-4">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Catatan Lapangan
                      </span>
                    </div>
                    <p className="text-xs font-bold text-slate-600 leading-relaxed italic">
                      {selectedReport.notes ||
                        "Tidak ada catatan lapangan tambahan."}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-3 mt-4 flex-col-reverse sm:flex-row">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`,
                      "_blank",
                    )
                  }
                  className="rounded-xl font-bold w-full sm:w-auto"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Buka di Maps
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation - Enhanced */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="w-[95vw] max-w-[425px] rounded-2xl sm:rounded-3xl p-5 sm:p-8 border-border/50">
          <DialogHeader>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-red-100 dark:bg-red-950/50 flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 sm:h-8 sm:w-8 text-red-600" />
              </div>
              <div className="space-y-2">
                <DialogTitle className="text-xl sm:text-2xl font-bold text-red-600">
                  Hapus Laporan?
                </DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Tindakan ini akan menghapus laporan secara permanen dan tidak
                  dapat dibatalkan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {deleteConfirm && (
            <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-xl sm:rounded-2xl p-4 my-4">
              <p className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">
                Laporan Terpilih
              </p>
              <p className="font-bold text-foreground">
                {deleteConfirm.unit.serialNumber}
              </p>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(deleteConfirm.createdAt)}
              </p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-3 flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="w-full sm:w-auto h-11 sm:h-12 rounded-xl sm:rounded-2xl font-bold"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
              className="w-full sm:w-auto h-11 sm:h-12 rounded-xl sm:rounded-2xl font-bold shadow-lg shadow-red-500/20"
            >
              Ya, Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
