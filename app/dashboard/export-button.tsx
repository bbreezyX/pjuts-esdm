"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, RefreshCw } from "lucide-react";
import { utils, writeFile } from "xlsx";
import { format } from "date-fns";
import { ProvinceStats, DashboardStats } from "@/app/actions/dashboard";
import { useToast } from "@/components/ui/use-toast";

interface ExportDashboardButtonProps {
    stats: DashboardStats | undefined;
    provinces: ProvinceStats[];
}

export function ExportDashboardButton({
    stats,
    provinces,
}: ExportDashboardButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        try {
            setLoading(true);

            // 1. Prepare Summary Data
            const summaryData = [
                { "Metrik": "Total Unit", "Nilai": stats?.totalUnits || 0 },
                { "Metrik": "Operasional", "Nilai": stats?.operationalUnits || 0 },
                { "Metrik": "Perlu Perawatan", "Nilai": stats?.maintenanceNeeded || 0 },
                { "Metrik": "Offline", "Nilai": stats?.offlineUnits || 0 },
                { "Metrik": "Total Laporan", "Nilai": stats?.totalReports || 0 },
                { "Metrik": "Laporan Bulan Ini", "Nilai": stats?.reportsThisMonth || 0 },
                { "Metrik": "Laporan Hari Ini", "Nilai": stats?.reportsToday || 0 },
            ];

            // 2. Prepare Province Data
            const provinceData = provinces.map((prov) => ({
                "Provinsi": prov.province,
                "Total Unit": prov.totalUnits,
                "Operasional": prov.operational,
                "Perlu Perawatan": prov.maintenanceNeeded,
                "Offline": prov.offline,
                "Total Laporan": prov.totalReports,
            }));

            // Create workbook
            const wb = utils.book_new();

            // Create Summary Sheet
            const wsSummary = utils.json_to_sheet(summaryData);
            wsSummary["!cols"] = [{ wch: 25 }, { wch: 15 }];
            utils.book_append_sheet(wb, wsSummary, "Ringkasan");

            // Create Province Sheet
            const wsProvinces = utils.json_to_sheet(provinceData);
            wsProvinces["!cols"] = [
                { wch: 25 }, // Provinsi
                { wch: 12 }, // Total Unit
                { wch: 12 }, // Operasional
                { wch: 15 }, // Perlu Perawatan
                { wch: 12 }, // Offline
                { wch: 15 }, // Total Laporan
            ];
            utils.book_append_sheet(wb, wsProvinces, "Statistik Provinsi");

            // Generate filename with timestamp
            const filename = `Dashboard_PJUTS_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;

            // Download file
            writeFile(wb, filename);

            toast({
                title: "Ekspor Berhasil",
                description: "Statistik dashboard berhasil diepor.",
                variant: "success",
            });
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Ekspor Gagal",
                description: "Gagal mengekspor data dashboard.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" size="lg" onClick={handleExport} disabled={loading} className="rounded-2xl border-border hover:bg-muted h-12 font-bold transition-all px-6">
            {loading ? (
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
            ) : (
                <Download className="h-5 w-5 mr-2" />
            )}
            Ekspor Excel
        </Button>
    );
}
