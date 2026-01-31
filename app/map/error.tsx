"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Map page error:", error);
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 mx-auto bg-red-100 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900">
            Gagal Memuat Peta
          </h2>
          <p className="text-slate-500 text-sm">
            Terjadi kesalahan saat memuat data peta. Pastikan koneksi internet stabil dan coba lagi.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 font-mono">
              Error ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={reset}
            className="rounded-xl gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="rounded-xl gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Ke Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
