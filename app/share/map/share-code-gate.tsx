"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Shield, Lock, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================
// SHARE CODE GATE COMPONENT
// ============================================

export function ShareCodeGate() {
  const router = useRouter();
  const [segments, setSegments] = useState(["", "", "", ""]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  }, []);

  // Handle input change for each segment
  const handleSegmentChange = (index: number, value: string) => {
    // Only allow alphanumeric characters
    const cleaned = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 1);
    const newSegments = [...segments];
    newSegments[index] = cleaned;
    setSegments(newSegments);
    setError(null);

    // Auto-advance to next input
    if (cleaned && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle key events (backspace, enter, paste)
  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !segments[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  // Handle paste — supports pasting "ESDM-XXXX" or just "XXXX"
  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").toUpperCase().trim();

    // Strip "ESDM-" prefix if present
    const code = pasted.replace(/^ESDM-?/, "");
    const chars = code
      .replace(/[^A-Z0-9]/g, "")
      .split("")
      .slice(0, 4);

    const newSegments = ["", "", "", ""];
    chars.forEach((char, i) => {
      if (i < 4) newSegments[i] = char;
    });
    setSegments(newSegments);
    setError(null);

    // Focus the input after the last filled character
    const nextIndex = Math.min(chars.length, 3);
    setTimeout(() => inputRefs.current[nextIndex]?.focus(), 50);
  };

  const handleSubmit = async () => {
    const code = `ESDM-${segments.join("")}`;

    if (segments.some((s) => !s)) {
      setError("Lengkapi 4 digit kode akses");
      triggerShake();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/public/verify-share-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const json = await res.json();

      if (json.success) {
        // Cookie is set by the API, refresh the page to get the server-rendered map
        router.refresh();
      } else {
        setError(json.error || "Kode akses tidak valid");
        triggerShake();
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#F8F9FB] flex items-center justify-center p-4">
      {/* Background Dashboard Mockup */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
        {/* Abstract Dashboard Layout */}
        <div className="absolute inset-0 flex opacity-40">
          {/* Sidebar */}
          <div className="hidden lg:flex flex-col w-72 border-r border-slate-200 bg-white p-6 gap-6">
            <div className="w-8 h-8 rounded-lg bg-slate-100" />
            <div className="space-y-4 pt-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 rounded-full bg-slate-50 w-3/4" />
              ))}
            </div>
          </div>

          {/* Main Area */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="h-20 border-b border-slate-200 bg-white/50 flex items-center px-8 justify-between">
              <div className="h-5 w-32 rounded-full bg-slate-200" />
              <div className="flex gap-4">
                <div className="h-10 w-10 rounded-full bg-slate-100" />
                <div className="h-10 w-10 rounded-full bg-slate-100" />
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-8 flex-1">
              {/* Grid Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl border border-slate-200 bg-white"
                  />
                ))}
              </div>

              {/* Map Area */}
              <div className="flex-1 rounded-3xl border border-slate-200 bg-white relative overflow-hidden">
                {/* Grid Lines */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
                {/* Random "Units" */}
                {[
                  { top: "25%", left: "30%" },
                  { top: "50%", right: "25%" },
                  { bottom: "30%", left: "25%" },
                  { top: "40%", right: "40%" },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 rounded-full bg-slate-200"
                    style={pos}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Overlay Gradient for Fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F9FB] via-[#F8F9FB]/80 to-[#F8F9FB]/60 backdrop-blur-[2px]" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Shield badge */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150" />
            <div className="relative bg-white backdrop-blur-xl border border-slate-200 rounded-2xl p-4 shadow-xl shadow-slate-200">
              <div className="relative">
                <Shield className="w-10 h-10 text-primary" />
                <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white">
                  <Lock className="w-2.5 h-2.5 text-amber-900" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                <Image
                  src="/logo-esdm.png"
                  alt="Logo ESDM"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain relative z-10"
                />
              </div>
              <div className="text-left">
                <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">
                  PJUTS <span className="text-primary">ESDM</span>
                </h1>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mt-0.5">
                  Monitoring System
                </p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Akses Peta Interaktif
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed max-w-xs mx-auto font-medium">
              Masukkan kode akses yang diberikan oleh administrator untuk
              melihat peta monitoring PJUTS.
            </p>
          </div>

          {/* Code Input Section */}
          <div className="px-8 pb-8 pt-2">
            {/* ESDM prefix + code inputs */}
            <div className="mb-8 bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 text-center">
                Kode Akses
              </label>

              <div
                className={cn(
                  "flex items-center justify-center gap-2 transition-all",
                  shake && "animate-shake",
                )}
              >
                {/* ESDM prefix badge */}
                <div className="bg-white border border-slate-200 rounded-xl px-3 py-3 shrink-0 shadow-sm">
                  <span className="text-sm font-black text-slate-600 tracking-wider">
                    ESDM
                  </span>
                </div>

                <span className="text-slate-300 text-xl font-light">—</span>

                {/* 4 character inputs */}
                {segments.map((seg, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="text"
                    maxLength={1}
                    value={seg}
                    onChange={(e) => handleSegmentChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className={cn(
                      "w-12 h-14 text-center text-xl font-black rounded-xl border outline-none transition-all duration-200 shadow-sm",
                      "focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 focus:scale-105",
                      "placeholder:text-slate-300",
                      error
                        ? "border-red-200 bg-red-50 text-red-600 focus:border-red-500 focus:ring-red-100"
                        : seg
                          ? "border-primary/30 bg-white text-primary ring-2 ring-primary/5"
                          : "bg-white border-slate-200 text-slate-900",
                    )}
                    placeholder="•"
                    aria-label={`Digit ${i + 1}`}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 justify-center text-red-600 text-sm mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300 bg-red-50 p-3 rounded-lg border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit button */}
            <button
              onClick={handleSubmit}
              disabled={loading || segments.some((s) => !s)}
              className={cn(
                "w-full h-12 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300",
                "bg-slate-900 text-white shadow-lg shadow-slate-900/20",
                "hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-900/30 hover:scale-[1.02]",
                "active:scale-[0.98]",
                "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-lg disabled:bg-slate-300",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <span>Buka Peta</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="px-8 pb-8">
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="shrink-0 w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                  <AlertCircle className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 mb-0.5">
                    Butuh Akses?
                  </h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Kode akses diberikan oleh administrator. Hubungi admin jika
                    Anda belum memiliki kode.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom credits */}
        <div className="mt-8 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Dinas ESDM Provinsi Jambi
          </p>
        </div>
      </div>

      {/* Custom shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          50%,
          90% {
            transform: translateX(-6px);
          }
          30%,
          70% {
            transform: translateX(6px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
