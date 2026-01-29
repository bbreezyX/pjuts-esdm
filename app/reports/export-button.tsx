"use strict";
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
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
            const result = await getReports({
                page: 1,
                limit: 10000,
                province,
                startDate,
                endDate,
            });

            if (!result.success || !result.data) throw new Error(result.error || "Failed to fetch");
            const reports = result.data.reports;
            if (reports.length === 0) {
                toast({ title: "Tidak ada data", description: "Tidak ada laporan yang sesuai.", variant: "destructive" });
                return;
            }

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
            }));

            const wb = utils.book_new();
            const ws = utils.json_to_sheet(dataToExport);
            utils.book_append_sheet(wb, ws, "Laporan");
            writeFile(wb, `Laporan_PJUTS_${format(new Date(), "yyyyMMdd_HHmmss")}.xlsx`);
            toast({ title: "Berhasil", description: "Ekspor selesai.", variant: "success" });
        } catch {
            toast({ title: "Gagal", description: "Coba lagi nanti.", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport} disabled={loading} className="rounded-xl">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            Export Excel
        </Button>
    );
}
