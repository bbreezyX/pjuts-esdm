"use client";

import {
  MapPin,
  Smartphone,
  Activity,
  CheckCircle2,
} from "lucide-react";
import { FadeIn, StaggerContainer, FadeInItem } from "@/components/ui/motion";

export default function WorkflowSection() {
  return (
    <section className="pt-32 pb-40 lg:pt-48 lg:pb-64 bg-slate-900 text-white relative overflow-hidden">
        {/* Wave Overlay (Inverted for Grid Continuity) */}
        <div className="absolute top-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-[calc(100%+1.3px)] h-full" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <defs>
              <mask id="wave-mask" x="0" y="0" width="100%" height="100%">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill="black" />
              </mask>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="#f8fafc" mask="url(#wave-mask)" />
          </svg>
        </div>

        {/* BG Decoration */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h3 className="text-amber-400 font-bold tracking-wider uppercase text-sm mb-3">Workflow Sistem</h3>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Mekanisme Pelaporan Terpadu
              </h2>
              <p className="text-lg text-slate-400">
                Alur kerja digital yang menyederhanakan proses monitoring lapangan menjadi langkah-langkah efisien.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Step 1: Identifikasi - Large Card */}
            <FadeInItem className="md:col-span-2 h-full">
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 h-full">
                <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                    <MapPin className="w-32 h-32 sm:w-48 sm:h-48 text-white" />
                </div>
                <div className="relative z-10 h-full flex flex-col justify-between">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 font-bold text-base sm:text-lg border border-blue-500/30">01</div>
                    <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Identifikasi Aset</h3>
                    <p className="text-sm sm:text-base text-slate-400 max-w-md">
                        Temukan unit PJUTS dengan mudah melalui pemindaian QR Code fisik atau pencarian ID digital pada peta interaktif yang terintegrasi dengan GPS.
                    </p>
                    </div>
                </div>
                </div>
            </FadeInItem>

            {/* Step 2: Dokumentasi - Tall Card */}
            <FadeInItem className="md:row-span-2 h-full">
                <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 h-full flex flex-col">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
                <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                    <Smartphone className="w-48 h-48 sm:w-64 sm:h-64 text-white" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 font-bold text-base sm:text-lg border border-amber-500/30">02</div>
                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">Dokumentasi Digital</h3>
                    <p className="text-sm sm:text-base text-slate-400 mb-8 flex-grow">
                    Ambil foto kondisi fisik unit secara langsung melalui aplikasi. Sistem otomatis menyematkan metadata lokasi (geotagging) dan waktu pengambilan untuk validitas data yang tak terbantahkan.
                    </p>
                    <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm mt-auto">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-mono text-slate-300">GPS: -6.2088, 106.8456</span>
                    </div>
                    <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div className="h-full w-3/4 bg-amber-500 rounded-full" />
                    </div>
                    </div>
                </div>
                </div>
            </FadeInItem>

            {/* Step 3: Input Data */}
            <FadeInItem className="h-full">
                <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 h-full">
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base sm:text-lg border border-purple-500/30">03</div>
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 group-hover:text-purple-400 transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Input Parameter</h3>
                    <p className="text-slate-400 text-sm">
                    Lengkapi formulir teknis yang responsif: tegangan baterai, daya load, dan status operasional komponen.
                    </p>
                </div>
                </div>
            </FadeInItem>

            {/* Step 4: Sinkronisasi */}
            <FadeInItem className="h-full">
                <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500 h-full">
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base sm:text-lg border border-emerald-500/30">04</div>
                    <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Real-time Sync</h3>
                    <p className="text-slate-400 text-sm">
                    Data terkirim instan ke server pusat ESDM. Dashboard analitik langsung diperbarui untuk pemantauan nasional.
                    </p>
                </div>
                </div>
            </FadeInItem>

          </StaggerContainer>
        </div>
        
        {/* Bottom Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-[calc(100%+1.3px)] h-full" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>
  );
}
