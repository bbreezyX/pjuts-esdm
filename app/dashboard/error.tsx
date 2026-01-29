"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex items-center justify-center min-h-[60vh] p-4 font-sans">
            <Card className="w-full max-w-md border-red-500/20 bg-card rounded-3xl shadow-2xl overflow-hidden">
                <div className="bg-red-500/10 p-8 flex justify-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-red-500">
                        <AlertCircle size={32} />
                    </div>
                </div>
                <CardHeader className="text-center pt-6">
                    <CardTitle className="text-xl font-bold text-foreground tracking-tight">Gagal Memuat Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-6 px-8 pb-8">
                    <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                        Terjadi kesalahan sistem saat mengambil data dashboard. Silakan coba memuat ulang halaman.
                    </p>
                    <div className="text-[10px] text-red-500/70 font-mono bg-red-500/5 p-3 rounded-xl border border-red-500/10 text-left overflow-auto max-h-24">
                        {error.message || "Unknown system error"}
                    </div>
                    <Button
                        onClick={() => reset()}
                        className="w-full h-12 bg-foreground text-background hover:opacity-90 rounded-2xl font-bold shadow-lg shadow-foreground/5 transition-all active:scale-95"
                    >
                        <RefreshCw className="mr-2 h-5 w-5" />
                        Coba Lagi
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
