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
  X,
  ChevronLeft,
  ChevronRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
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
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Unit</th>
                <th>Foto</th>
                <th className="text-center">Tegangan</th>
                <th>Lokasi</th>
                <th>Pelapor</th>
                <th>Tanggal</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    Tidak ada laporan ditemukan
                  </td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr
                    key={report.id}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.03}s` }}
                  >
                    <td>
                      <div>
                        <p className="font-medium text-slate-900">
                          {report.unit.serialNumber}
                        </p>
                        <p className="text-xs text-slate-500">
                          {report.unit.regency}
                        </p>
                      </div>
                    </td>
                    <td>
                      <div
                        className="relative w-12 h-12 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary-500"
                        onClick={() => setSelectedReport(report)}
                      >
                        <Image
                          src={report.imageUrl}
                          alt="Report"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="text-center">
                      <Badge
                        variant={
                          report.batteryVoltage >= 20
                            ? "success"
                            : report.batteryVoltage >= 10
                            ? "warning"
                            : "destructive"
                        }
                      >
                        {report.batteryVoltage}V
                      </Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-1 text-sm text-slate-600">
                        <MapPin className="h-3 w-3" />
                        {report.unit.province}
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-700">
                            {report.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-slate-700">
                          {report.user.name}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm text-slate-900">
                          {formatDateTime(report.createdAt)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {getRelativeTime(report.createdAt)}
                        </p>
                      </div>
                    </td>
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-1">
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

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
                  className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                  onClick={() => setSelectedReport(report)}
                >
                  <Image
                    src={report.imageUrl}
                    alt="Report"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-900">
                        {report.unit.serialNumber}
                      </p>
                      <p className="text-xs text-slate-500">
                        {report.unit.province}, {report.unit.regency}
                      </p>
                    </div>
                    <Badge
                      variant={
                        report.batteryVoltage >= 20
                          ? "success"
                          : report.batteryVoltage >= 10
                          ? "warning"
                          : "destructive"
                      }
                    >
                      {report.batteryVoltage}V
                    </Badge>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {report.user.name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {getRelativeTime(report.createdAt)}
                    </span>
                  </div>
                </div>
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
        <DialogContent className="max-w-2xl">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>
                  Laporan {selectedReport.unit.serialNumber}
                </DialogTitle>
                <DialogDescription>
                  {formatDateTime(selectedReport.createdAt)} oleh{" "}
                  {selectedReport.user.name}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                {/* Image */}
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <Image
                    src={selectedReport.imageUrl}
                    alt="Report Image"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4">
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
                    <p className="text-sm font-mono text-slate-900">
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

              <DialogFooter>
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
                <Button
                  variant="outline"
                  onClick={() => window.open(selectedReport.imageUrl, "_blank")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Foto
                </Button>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Laporan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak
              dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              loading={deleting}
            >
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

