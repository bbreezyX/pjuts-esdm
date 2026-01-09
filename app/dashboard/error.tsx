"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WarningCircle, Refresh } from "iconoir-react";

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
        <div className="flex items-center justify-center min-h-[50vh] p-4">
            <Card className="w-full max-w-md border-red-200 bg-red-50/50">
                <CardHeader className="text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                        <WarningCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <CardTitle className="text-red-900">Gagal Memuat Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-red-700">
                        Terjadi kesalahan saat mengambil data dashboard. Silakan coba lagi.
                    </p>
                    <div className="text-xs text-red-500 font-mono bg-white/50 p-2 rounded">
                        {error.message || "Unknown error"}
                    </div>
                    <Button
                        onClick={() => reset()}
                        variant="outline"
                        className="w-full border-red-200 hover:bg-red-100 hover:text-red-900"
                    >
                        <Refresh className="mr-2 h-4 w-4" />
                        Coba Lagi
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
