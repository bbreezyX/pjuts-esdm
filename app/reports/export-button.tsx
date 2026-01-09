"use strict";
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, SystemRestart } from "iconoir-react";
import { getReports } from "@/app/actions/reports";
import { utils, writeFile } from "xlsx";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";

interface ExportReportsButtonProps {
    province?: string;
    startDate?: Date;
    endDate?: Date;
}

export function ExportReportsButton({
    province,
    startDate,
    endDate,
}: ExportReportsButtonProps) {
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const handleExport = async () => {
        try {
            setLoading(true);

            // Fetch all reports matching the filters
            const result = await getReports({
                page: 1,
                limit: 10000, // Large limit to get all records
                province,
                startDate,
                endDate,
            });

            if (!result.success || !result.data) {
                throw new Error(result.error || "Failed to fetch reports");
            }

            const reports = result.data.reports;

            if (reports.length === 0) {
                toast({
                    title: "Tidak ada data",
                    description: "Tidak ada laporan yang sesuai dengan filter saat ini.",
                    variant: "destructive",
                });
                return;
            }

            // Format data for Excel
            const dataToExport = reports.map((report) => ({
                "ID Laporan": report.id,
                "Tanggal": format(new Date(report.createdAt), "dd/MM/yyyy HH:mm"),
                "ID Unit": report.unit.serialNumber,
                "Provinsi": report.unit.province,
                "Kabupaten/Kota": report.unit.regency,
                "Status Baterai (V)": report.batteryVoltage,
                "Latitude": report.latitude,
                "Longitude": report.longitude,
                "Catatan": report.notes || "-",
                "Pelapor": report.user.name,
                "Email Pelapor": report.user.email,
                "Gambar": report.imageUrl || "-",
            }));

            // Create workbook and worksheet
            const wb = utils.book_new();
            const ws = utils.json_to_sheet(dataToExport);

            // Auto-size columns (rudimentary approximation)
            const colWidths = [
                { wch: 25 }, // ID Laporan
                { wch: 18 }, // Tanggal
                { wch: 15 }, // ID Unit
                { wch: 20 }, // Provinsi
                { wch: 20 }, // Kabupaten/Kota
                { wch: 15 }, // Status Baterai
                { wch: 12 }, // Latitude
                { wch: 12 }, // Longitude
                { wch: 30 }, // Catatan
                { wch: 20 }, // Pelapor
                { wch: 25 }, // Email Pelapor
                { wch: 40 }, // Gambar
            ];
            ws["!cols"] = colWidths;

            utils.book_append_sheet(wb, ws, "Laporan");

            // Generate filename with timestamp
            const filename = `Laporan_PJUTS_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`;

            // Download file
            writeFile(wb, filename);

            toast({
                title: "Ekspor Berhasil",
                description: `Berhasil mengekspor ${reports.length} laporan.`,
                variant: "success",
            });
        } catch (error) {
            console.error("Export error:", error);
            toast({
                title: "Ekspor Gagal",
                description: "Gagal mengekspor laporan. Silakan coba lagi.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
            {loading ? (
                <SystemRestart className="h-4 w-4 mr-2 animate-spin" />
            ) : (
                <Download className="h-4 w-4 mr-2" />
            )}
            Export Excel
        </Button>
    );
}
