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
        // Trigger refresh
        window.location.reload();
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto pb-4">
        <table className="w-full text-left border-separate border-spacing-y-4">
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
                <td colSpan={7} className="text-center py-20 bg-card rounded-[2rem] border border-border/50 shadow-sm">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center text-muted-foreground/40">
                      <Zap size={32} />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground">Tidak ada laporan yang ditemukan</p>
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
                          <span className="text-white text-[10px] font-black">+{report.images.length - 1}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300 text-center">
                    <Badge 
                      variant={getStatusVariant(report.batteryVoltage)}
                      className="rounded-xl px-3 py-1 text-[11px] font-black border-none shadow-sm"
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
                      <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/10 shadow-sm overflow-hidden">
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${report.user.name}`} alt="avatar" />
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
                        <Eye className="h-4.5 w-4.5" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all"
                          onClick={() => setDeleteConfirm(report)}
                        >
                          <Trash2 className="h-4.5 w-4.5" />
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

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {reports.length === 0 ? (
          <Card className="p-8 text-center text-slate-500">
            Tidak ada laporan ditemukan
          </Card>
        ) : (
          reports.map((report, index) => (
            <Card
              key={report.id}
              className="p-4 animate-fade-in"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex gap-3">
                <div
                  className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all"
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
                    className="object-cover"
                  />
                  {report.images && report.images.length > 1 && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center sm:hidden">
                      <span className="text-white text-xs font-medium">+{report.images.length - 1}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900 truncate pr-2">
                        {report.unit.serialNumber}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {report.unit.province}, {report.unit.regency}
                      </p>
                    </div>
                    <Badge
                      className="shrink-0"
                      variant={getStatusVariant(report.batteryVoltage)}
                    >
                      {report.batteryVoltage}V
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {report.user.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setDeleteConfirm(report)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getRelativeTime(report.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Additional Images for Mobile */}
              {report.images && report.images.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {report.images.slice(1).map((img, idx) => (
                    <div
                      key={img.id}
                      className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all border border-slate-100"
                      onClick={() => setSelectedReport(report)}
                    >
                      <Image
                        src={img.url}
                        alt={`Report Additional ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">
            Menampilkan {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} dari{" "}
            {total} laporan
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
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
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Report Detail Modal */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={() => setSelectedReport(null)}
      >
        <DialogContent className="w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-lg sm:rounded-xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-left">
                  Laporan {selectedReport.unit.serialNumber}
                </DialogTitle>
                <DialogDescription className="text-left">
                  {formatDateTime(selectedReport.createdAt)} oleh{" "}
                  {selectedReport.user.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {selectedReport.images && selectedReport.images.length > 0 ? (
                    selectedReport.images.map((img, idx) => (
                      <div key={img.id} className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                        <Image
                          src={img.url}
                          alt={`Report Image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                        <div className="absolute bottom-1 right-1">
                          <Button
                            size="icon-sm"
                            variant="secondary"
                            className="bg-white/80 hover:bg-white h-6 w-6"
                            onClick={() => window.open(img.url, "_blank")}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : selectedReport.imageUrl ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                      <Image
                        src={selectedReport.imageUrl}
                        alt="Report Image"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center">
                      <span className="text-slate-400 text-sm">Tidak ada gambar</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-slate-500">Tegangan</span>
                    </div>
                    <p className="text-xl font-bold text-slate-900">
                      {selectedReport.batteryVoltage}V
                    </p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="h-4 w-4 text-primary-500" />
                      <span className="text-sm text-slate-500">Koordinat</span>
                    </div>
                    <p className="text-sm font-mono text-slate-900 break-all">
                      {selectedReport.latitude.toFixed(6)},{" "}
                      {selectedReport.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>

                {selectedReport.notes && (
                  <div className="bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-500 mb-1">Catatan</p>
                    <p className="text-slate-900">{selectedReport.notes}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-0">
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`,
                      "_blank"
                    )
                  }
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Buka di Maps
                </Button>
                {/* Download button moved to individual images */}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="w-[95vw] max-w-[425px] rounded-2xl sm:rounded-lg p-4 sm:p-6 gap-6">
          <DialogHeader>
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-red-600 text-lg sm:text-xl">Hapus Laporan</DialogTitle>
                <DialogDescription className="text-sm sm:text-base">
                  Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2 flex-col-reverse sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm(null)}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
              className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md shadow-sm"
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
