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
import { formatDateTime, getRelativeTime, cn } from "@/lib/utils";
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
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-4">
      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-muted/50 flex items-center justify-center mb-6">
        <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground/40" />
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
        Tidak Ada Laporan
      </h3>
      <p className="text-sm text-muted-foreground text-center max-w-sm">
        Belum ada laporan yang sesuai dengan kriteria filter. Coba ubah filter
        atau buat laporan baru.
      </p>
    </div>
  );

  return (
    <>
      {/* Desktop Table - Enhanced */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <th className="px-6 py-4">Unit PJUTS</th>
              <th className="px-6 py-4">Dokumentasi</th>
              <th className="px-6 py-4 text-center">Tegangan</th>
              <th className="px-6 py-4">Wilayah</th>
              <th className="px-6 py-4">Pelapor</th>
              <th className="px-6 py-4">Waktu Lapor</th>
              <th className="px-6 py-4 text-center">Opsi</th>
            </tr>
          </thead>
          <tbody>
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4">
                  <Card className="border-border/50 shadow-sm">
                    <EmptyState />
                  </Card>
                </td>
              </tr>
            ) : (
              reports.map((report, index) => (
                <tr
                  key={report.id}
                  className="group animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 rounded-l-[2rem] border-y border-l border-border/50 transition-all duration-300">
                    <div>
                      <p className="font-black text-foreground text-sm tracking-tight leading-none mb-1.5">
                        {report.unit.serialNumber}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        {report.unit.regency}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                    <div
                      className="relative w-14 h-14 rounded-2xl overflow-hidden cursor-pointer hover:ring-4 hover:ring-primary/10 transition-all duration-300 shadow-sm group/img"
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
                        className="object-cover transition-transform duration-500 group-hover/img:scale-110"
                      />
                      {report.images && report.images.length > 1 && (
                        <div className="absolute inset-0 bg-primary/60 backdrop-blur-[2px] opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all duration-300">
                          <span className="text-white text-[10px] font-black">
                            +{report.images.length - 1}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300 text-center">
                    <Badge
                      variant={getStatusVariant(report.batteryVoltage)}
                      className="rounded-xl px-3 py-1.5 text-[11px] font-black border-none shadow-sm"
                    >
                      {report.batteryVoltage}V
                    </Badge>
                  </td>
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground tracking-tight">
                      <div className="w-7 h-7 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                        <MapPin className="h-3.5 w-3.5" />
                      </div>
                      {report.unit.province}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm overflow-hidden relative">
                        <Image
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${report.user.name}`}
                          alt={`Avatar of ${report.user.name}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                      <span className="text-sm font-bold text-foreground tracking-tight">
                        {report.user.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                    <div>
                      <p className="text-xs font-bold text-foreground tracking-tight">
                        {formatDateTime(report.createdAt)}
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                        {getRelativeTime(report.createdAt)}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 rounded-r-[2rem] border-y border-r border-border/50 transition-all duration-300 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-all"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all dark:bg-red-950/50 dark:hover:bg-red-950"
                          onClick={() => setDeleteConfirm(report)}
                        >
                          <Trash2 className="h-4 w-4" />
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
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {reports.length === 0 ? (
          <Card className="border-border/50">
            <EmptyState />
          </Card>
        ) : (
          reports.map((report, index) => (
            <Card
              key={report.id}
              className={cn(
                "p-4 sm:p-5 animate-fade-in border-border/50",
                "hover:border-border transition-all duration-200",
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex gap-3 sm:gap-4">
                {/* Image Thumbnail */}
                <div
                  className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 cursor-pointer group/img shadow-sm"
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
                    className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {report.images && report.images.length > 1 && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center pb-1.5">
                      <span className="text-white text-[10px] font-bold">
                        +{report.images.length - 1} foto
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {/* Header Row */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-foreground truncate">
                        {report.unit.serialNumber}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {report.unit.province}, {report.unit.regency}
                      </p>
                    </div>
                    <Badge
                      className="shrink-0 rounded-lg sm:rounded-xl px-2 sm:px-2.5 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-black"
                      variant={getStatusVariant(report.batteryVoltage)}
                    >
                      {report.batteryVoltage}V
                    </Badge>
                  </div>

                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] sm:text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {report.user.name}
                    </span>
                    <span className="hidden sm:inline text-muted-foreground/40">
                      •
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getRelativeTime(report.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-bold bg-primary/5 hover:bg-primary/10 text-primary"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      Detail
                    </Button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50"
                        onClick={() => setDeleteConfirm(report)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Images Preview */}
              {report.images && report.images.length > 1 && (
                <div className="mt-3 pt-3 border-t border-border/50">
                  <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    {report.images.slice(1, 4).map((img, idx) => (
                      <div
                        key={img.id}
                        className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all border border-border/50"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Image
                          src={img.url}
                          alt={`Additional ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {report.images.length > 4 && (
                      <div
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg sm:rounded-xl bg-muted flex items-center justify-center shrink-0 cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={() => setSelectedReport(report)}
                      >
                        <span className="text-xs font-bold text-muted-foreground">
                          +{report.images.length - 4}
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
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 sm:mt-8 pt-4 border-t border-border/50">
          {/* Info Text */}
          <p className="text-xs sm:text-sm text-muted-foreground font-medium order-2 sm:order-1">
            Menampilkan{" "}
            <span className="font-bold text-foreground">
              {(page - 1) * 20 + 1}
            </span>
            {" - "}
            <span className="font-bold text-foreground">
              {Math.min(page * 20, total)}
            </span>
            {" dari "}
            <span className="font-bold text-foreground">{total}</span>
            {" laporan"}
          </p>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 order-1 sm:order-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl font-bold border-border/60 hover:bg-muted disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Sebelumnya</span>
            </Button>

            {/* Page Numbers - Desktop */}
            <div className="hidden sm:flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                    variant={page === pageNum ? "default" : "ghost"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={cn(
                      "h-10 w-10 rounded-xl font-bold",
                      page === pageNum
                        ? "bg-primary shadow-lg shadow-primary/25"
                        : "hover:bg-muted",
                    )}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {/* Page Indicator - Mobile */}
            <div className="sm:hidden flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-xl">
              <span className="text-sm font-bold text-foreground">{page}</span>
              <span className="text-sm text-muted-foreground">/</span>
              <span className="text-sm font-bold text-muted-foreground">
                {totalPages}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="h-9 sm:h-10 px-3 sm:px-4 rounded-xl font-bold border-border/60 hover:bg-muted disabled:opacity-40"
            >
              <span className="hidden sm:inline">Selanjutnya</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
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
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1 h-3 bg-primary rounded-full" />
                  <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                    Detail Laporan
                  </span>
                </div>
                <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight text-left">
                  {selectedReport.unit.serialNumber}
                </DialogTitle>
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

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Tegangan
                      </span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                      {selectedReport.batteryVoltage}
                      <span className="text-lg text-muted-foreground">V</span>
                    </p>
                  </div>
                  <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Koordinat
                      </span>
                    </div>
                    <p className="text-sm font-mono text-foreground break-all leading-relaxed">
                      {selectedReport.latitude.toFixed(6)},
                      <br className="sm:hidden" />
                      {selectedReport.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* Notes */}
                {selectedReport.notes && (
                  <div className="bg-muted/50 rounded-xl sm:rounded-2xl p-4 border border-border/50">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                      Catatan
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">
                      {selectedReport.notes}
                    </p>
                  </div>
                )}
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
    </>
  );
}
