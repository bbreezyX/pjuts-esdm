"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileSpreadsheet } from "lucide-react";
import { getReports } from "@/app/actions/reports";
import { downloadStyledExcel } from "@/lib/excel-style";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ExportReportsButtonProps {
  regency?: string;
  startDate?: Date;
  endDate?: Date;
}

export function ExportReportsButton({
  regency,
  startDate,
  endDate,
}: ExportReportsButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      setLoading(true);
      const result = await getReports({
        page: 1,
        limit: 10000,
        regency,
        startDate,
        endDate,
      });

      if (!result.success || !result.data)
        throw new Error(result.error || "Failed to fetch");
      const reports = result.data.reports;

      if (reports.length === 0) {
        toast({
          title: "Tidak ada data",
          description: "Tidak ada laporan yang sesuai dengan kriteria filter.",
          variant: "destructive",
        });
        return;
      }

      const dataToExport = reports.map((report) => ({
        "ID Laporan": report.id,
        Tanggal: format(new Date(report.createdAt), "dd/MM/yyyy HH:mm"),
        "ID Unit": report.unit.serialNumber,
        Provinsi: report.unit.province,
        "Kabupaten/Kota": report.unit.regency,
        "Status Baterai (V)": report.batteryVoltage,
        Latitude: report.latitude,
        Longitude: report.longitude,
        Catatan: report.notes || "-",
        Pelapor: report.user.name,
        "Email Pelapor": report.user.email,
      }));

      downloadStyledExcel(
        [{ name: "Laporan", data: dataToExport }],
        `Laporan_PJUTS_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`,
      );

      toast({
        title: "Berhasil",
        description: `${reports.length} laporan berhasil diekspor ke Excel.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Gagal Ekspor",
        description: "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleExport}
      disabled={loading}
      className={cn(
        "h-8 sm:h-10 px-3 sm:px-4 rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-white hover:text-emerald-600 transition-all text-slate-500",
      )}
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
      ) : (
        <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-600" />
      )}
      <span className="hidden sm:inline">Export Excel</span>
      <span className="sm:hidden">Export</span>
    </Button>
  );
}
