"use client";

import {
  MapPin,
  SmartphoneDevice,
  Activity,
  CheckCircle,
  ScanQrCode,
  MediaImage,
  Database,
  Globe,
  ArrowRight,
} from "iconoir-react";
import { FadeIn, StaggerContainer, FadeInItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export default function WorkflowSection() {
  return (
    <section className="pt-32 pb-40 lg:pt-48 lg:pb-64 bg-slate-900 text-white relative overflow-hidden font-sedan">
      {/* Wave Overlay (Inverted for Grid Continuity) */}
      <div className="absolute top-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none z-20 pointer-events-none">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-full"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            <mask id="wave-mask" x="0" y="0" width="100%" height="100%">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <path
                d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="#f8fafc"
            mask="url(#wave-mask)"
          />
        </svg>
        {/* Grid Overlay masked to Inverted Wave Shape */}
        <div
          className="absolute inset-0 bg-fixed"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cdefs%3E%3Cmask id='m' x='0' y='0' width='100%25' height='100%25'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white'/%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`,
            maskSize: "100% 100%",
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cdefs%3E%3Cmask id='m' x='0' y='0' width='100%25' height='100%25'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white'/%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`,
            WebkitMaskSize: "100% 100%",
          }}
        />
      </div>

      {/* BG Decoration - Hexagon Pattern */}
      <div
        className="absolute inset-0 bg-fixed opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <FadeIn className="text-center max-w-3xl mx-auto mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#E4C55B] text-xs font-semibold uppercase tracking-wider mb-5">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            Alur Kerja
          </div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6 tracking-tight">
            Mekanisme Pelaporan{" "}
            <span className="text-[#E4C55B]">
              Terpadu
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-slate-400 leading-relaxed">
            Alur kerja digital yang menyederhanakan proses monitoring lapangan
            menjadi langkah-langkah efisien dan terstruktur.
          </p>
        </FadeIn>

        {/* Workflow Steps Indicator */}
        <FadeIn className="hidden lg:flex items-center justify-center gap-0 mb-12">
          {["01", "02", "03"].map((num, idx) => {
            const labels = ["Identifikasi", "Dokumentasi", "Sinkronisasi"];
            return (
            <div key={num} className="flex items-center">
              <div className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-default">
                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600 to-primary-700 text-white text-sm font-bold flex items-center justify-center shadow-md shadow-primary-600/20 group-hover:scale-110 transition-transform">
                  {num}
                </span>
                <span className="text-sm font-semibold text-slate-300 group-hover:text-white transition-colors">
                  {labels[idx]}
                </span>
              </div>
              {idx < 2 && (
                <div className="flex items-center px-3">
                  <div className="w-12 h-0.5 bg-gradient-to-r from-primary-500/30 to-[#D4AF37]/30 rounded-full" />
                  <ArrowRight className="w-4 h-4 text-[#D4AF37]/60 -ml-1" />
                </div>
              )}
            </div>
            );
          })}
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {/* Left Column: Identifikasi */}
          <FadeInItem className="h-full">
            <div className="group relative h-full bg-white rounded-3xl border border-slate-200/80 p-7 lg:p-8 shadow-sm hover:shadow-xl hover:shadow-primary-100/50 hover:border-primary-200 transition-all duration-500 overflow-hidden flex flex-col min-h-[480px]">
              {/* Decorative corner accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-50 to-[#D4AF37]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 opacity-60 group-hover:opacity-100 transition-opacity" />
              
              {/* Step number badge */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:from-primary-100 group-hover:to-primary-50 group-hover:border-primary-200 group-hover:text-primary-600 transition-all">
                01
              </div>

              <div className="relative z-10 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-primary-600/25 group-hover:scale-110 transition-transform">
                  <ScanQrCode className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Identifikasi Aset
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pemindaian QR Code dan verifikasi koordinat GPS untuk
                  memastikan akurasi lokasi.
                </p>
              </div>

              {/* Map Visualization - Modern Light Design */}
              <div className="relative flex-grow mt-auto w-full min-h-[260px] bg-gradient-to-br from-slate-50 to-primary-50/30 rounded-2xl border border-slate-200/60 overflow-hidden group-hover:border-primary-300/50 transition-all duration-500 shadow-inner">
                {/* Subtle Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:32px_32px] opacity-50" />

                {/* Minimalist Radar Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[75%] h-[75%] border border-primary-300/30 rounded-full animate-[spin_25s_linear_infinite]" />
                  <div className="w-[55%] h-[55%] border border-primary-400/40 rounded-full animate-[spin_18s_linear_infinite_reverse] border-dashed" />
                  <div className="w-[35%] h-[35%] bg-primary-400/10 rounded-full animate-pulse" />
                </div>

                {/* Asset Marker 1 (Online) */}
                <div className="absolute top-[32%] left-[28%] z-10 group/marker cursor-pointer">
                  <div className="relative flex items-center gap-2">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-primary-500 opacity-25"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-500/40 ring-2 ring-white"></span>
                    </div>
                    <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg border border-primary-200 text-[10px] font-semibold text-primary-700 shadow-lg translate-x-[-8px] opacity-0 group-hover/marker:opacity-100 group-hover/marker:translate-x-0 transition-all duration-300">
                      PJU-01 • 98%
                    </div>
                  </div>
                </div>

                {/* Asset Marker 2 (Maintenance) */}
                <div className="absolute bottom-[32%] right-[28%] z-10 group/marker cursor-pointer">
                  <div className="relative flex items-center gap-2 flex-row-reverse">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-[#D4AF37] opacity-25 delay-150"></span>
                      <span className="relative inline-flex h-3 w-3 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#E4C55B] shadow-lg shadow-[#D4AF37]/40 ring-2 ring-white"></span>
                    </div>
                    <div className="bg-white/95 backdrop-blur px-2.5 py-1 rounded-lg border border-[#D4AF37]/30 text-[10px] font-semibold text-[#D4AF37] shadow-lg translate-x-[8px] opacity-0 group-hover/marker:opacity-100 group-hover/marker:translate-x-0 transition-all duration-300">
                      PJU-45 • Check
                    </div>
                  </div>
                </div>

                {/* Connecting Curve */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-70">
                  <path
                    d="M 80 85 Q 140 120 200 150"
                    stroke="url(#simple-gradient-new)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="4 6"
                    className="animate-[dash_20s_linear_infinite]"
                  />
                  <defs>
                    <linearGradient id="simple-gradient-new" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#1e5a8a" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#1e5a8a" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Bottom coordinate indicator */}
                <div className="absolute bottom-3 left-3 flex items-center gap-2 opacity-60">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-mono text-slate-400">-6.2088, 106.8456</span>
                </div>
              </div>
            </div>
          </FadeInItem>

          {/* Middle Column: Stacked */}
          <div className="flex flex-col gap-5 lg:gap-6 h-full">
            {/* Top: Dokumentasi */}
            <FadeInItem className="flex-1">
              <div className="group relative h-full bg-white rounded-3xl border border-slate-200/80 p-7 shadow-sm hover:shadow-xl hover:shadow-primary-100/50 hover:border-primary-200 transition-all duration-500 overflow-hidden min-h-[220px]">
                {/* Step number badge */}
                <div className="absolute top-5 right-5 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:from-primary-100 group-hover:to-primary-50 group-hover:border-primary-200 group-hover:text-primary-600 transition-all">
                  02
                </div>
                
                <div className="flex items-start relative z-10">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#E4C55B] text-primary-900 flex items-center justify-center mb-4 shadow-lg shadow-[#D4AF37]/25 group-hover:scale-110 transition-transform">
                      <MediaImage className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Dokumentasi Digital
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Foto fisik dengan watermark timestamp & geotag otomatis.
                    </p>
                  </div>
                </div>
                
                {/* Photo cards decoration */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <div className="w-14 h-18 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 rotate-6 transform group-hover:rotate-12 group-hover:translate-y-[-4px] transition-all p-2 flex flex-col gap-1 shadow-md">
                    <div className="w-6 h-0.5 bg-slate-300 rounded-full" />
                    <div className="flex-1 bg-slate-200/50 rounded-lg" />
                  </div>
                  <div className="w-14 h-18 bg-gradient-to-br from-[#D4AF37]/10 to-primary-50 rounded-xl border border-[#D4AF37]/30 -rotate-3 transform group-hover:-rotate-6 group-hover:translate-y-[-4px] transition-all p-2 flex flex-col gap-1 shadow-md z-10">
                    <div className="w-6 h-0.5 bg-[#D4AF37]/50 rounded-full" />
                    <div className="flex-1 bg-[#D4AF37]/20 rounded-lg flex items-end justify-end p-1">
                      <div className="w-3 h-3 bg-[#D4AF37]/40 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </FadeInItem>

            {/* Bottom: Input Data */}
            <FadeInItem className="flex-1">
              <div className="group relative h-full bg-white rounded-3xl border border-slate-200/80 p-7 shadow-sm hover:shadow-xl hover:shadow-primary-100/50 hover:border-primary-200 transition-all duration-500 overflow-hidden min-h-[220px]">
                <div className="flex items-start relative z-10">
                  <div className="flex-1">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-700 to-primary-800 text-white flex items-center justify-center mb-4 shadow-lg shadow-primary-700/25 group-hover:scale-110 transition-transform">
                      <Activity className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Input Parameter
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed">
                      Formulir teknis responsif untuk data komponen.
                    </p>
                  </div>
                </div>
                
                {/* Form field indicators */}
                <div className="absolute bottom-4 left-6 right-6 flex flex-col gap-2 opacity-60 group-hover:opacity-80 transition-opacity">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary-200 border border-primary-300" />
                    <div className="flex-1 h-2 bg-slate-200 rounded-full" />
                    <div className="w-8 h-2 bg-primary-300 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary-200 border border-primary-300" />
                    <div className="flex-1 h-2 bg-slate-200 rounded-full" />
                    <div className="w-12 h-2 bg-emerald-300 rounded-full" />
                  </div>
                </div>
                
                {/* Graph Line */}
                <div className="absolute bottom-0 left-0 right-0 h-12 opacity-40 group-hover:opacity-60 transition-opacity overflow-hidden rounded-b-3xl">
                  <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                    <path
                      d="M0 35 Q 15 15, 35 22 T 70 12 T 100 8"
                      fill="none"
                      stroke="url(#primary-gradient)"
                      strokeWidth="2"
                    />
                    <path
                      d="M0 35 Q 15 15, 35 22 T 70 12 T 100 8 V 40 H 0 Z"
                      fill="url(#primary-fill)"
                    />
                    <defs>
                      <linearGradient id="primary-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1e5a8a" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#1e5a8a" stopOpacity="0.8" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.3" />
                      </linearGradient>
                      <linearGradient id="primary-fill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#1e5a8a" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#1e5a8a" stopOpacity="0.05" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </FadeInItem>
          </div>

          {/* Right Column: Sync */}
          <FadeInItem className="h-full">
            <div className="group relative h-full bg-white rounded-3xl border border-slate-200/80 p-7 lg:p-8 shadow-xl hover:shadow-2xl hover:shadow-primary-200/30 hover:border-primary-200 transition-all duration-500 overflow-hidden flex flex-col min-h-[480px]">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary-100/60 to-[#D4AF37]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#D4AF37]/20 to-primary-100/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
              
              {/* Step number badge */}
              <div className="absolute top-6 right-6 w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-sm font-bold text-slate-400 group-hover:from-primary-100 group-hover:to-primary-50 group-hover:border-primary-200 group-hover:text-primary-600 transition-all">
                03
              </div>

              <div className="relative z-10 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 text-white flex items-center justify-center mb-5 shadow-lg shadow-primary-600/25 group-hover:scale-110 transition-transform">
                  <Globe className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  Real-time Sync
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Sinkronisasi data otomatis ke server pusat dashboard nasional.
                </p>
              </div>

              {/* Network Visual */}
              <div className="relative flex-grow mt-auto flex items-center justify-center min-h-[280px]">
                {/* Background Radar Effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[80%] h-[80%] border border-slate-200 rounded-full animate-[spin_25s_linear_infinite]" />
                  <div className="absolute w-[60%] h-[60%] border border-primary-200 rounded-full border-dashed animate-[spin_18s_linear_infinite_reverse]" />
                  <div className="absolute w-[40%] h-[40%] bg-primary-100/50 rounded-full animate-pulse" />
                </div>

                {/* Center Hub */}
                <div className="relative z-20 bg-white p-2 rounded-2xl shadow-2xl border border-primary-100 ring-4 ring-primary-50">
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 text-white p-4 rounded-xl shadow-inner">
                    <Database className="w-8 h-8" />
                  </div>
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-primary-500/20 animate-ping" style={{ animationDuration: '2s' }} />
                </div>

                {/* Connecting Lines */}
                <div className="absolute inset-0 z-0">
                  <svg className="w-full h-full" viewBox="0 0 200 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="lineGradientNew" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(226,232,240,0.5)" />
                        <stop offset="50%" stopColor="rgba(30,90,138,0.6)" />
                        <stop offset="100%" stopColor="rgba(226,232,240,0.5)" />
                      </linearGradient>
                      <style>
                        {`
                          @keyframes dashFlowNew { to { stroke-dashoffset: -24; } }
                          .data-flow-new { animation: dashFlowNew 1.5s linear infinite; }
                        `}
                      </style>
                    </defs>

                    {[
                      "M 40 40 L 100 100",
                      "M 160 40 L 100 100",
                      "M 160 160 L 100 100",
                      "M 40 160 L 100 100",
                    ].map((d, i) => (
                      <g key={i}>
                        <path d={d} stroke="rgba(226,232,240,0.8)" strokeWidth="1" />
                        <path
                          d={d}
                          stroke="#1e5a8a"
                          strokeWidth="2"
                          strokeDasharray="4 8"
                          className="data-flow-new"
                          strokeLinecap="round"
                          style={{ animationDelay: `${i * 0.2}s` }}
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Satellite Nodes */}
                {/* Top Left - Mobile App */}
                <div className="absolute top-[8%] left-[8%] z-10 animate-[bounce_4s_infinite]">
                  <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 ring-1 ring-slate-100 group/node hover:scale-110 hover:shadow-xl hover:border-primary-200 transition-all cursor-default">
                    <div className="bg-gradient-to-br from-primary-600 to-primary-700 p-2 rounded-xl text-white">
                      <SmartphoneDevice className="w-5 h-5" />
                    </div>
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      Mobile App
                    </div>
                  </div>
                </div>

                {/* Top Right - QR Scan */}
                <div className="absolute top-[8%] right-[8%] z-10 animate-[bounce_5s_infinite_0.5s]">
                  <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 ring-1 ring-slate-100 group/node hover:scale-110 hover:shadow-xl hover:border-[#D4AF37]/30 transition-all cursor-default">
                    <div className="bg-gradient-to-br from-[#D4AF37] to-[#E4C55B] p-2 rounded-xl text-primary-900">
                      <ScanQrCode className="w-5 h-5" />
                    </div>
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      Asset ID
                    </div>
                  </div>
                </div>

                {/* Bottom Right - Web */}
                <div className="absolute bottom-[8%] right-[8%] z-10 animate-[bounce_4.5s_infinite_1s]">
                  <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 ring-1 ring-slate-100 group/node hover:scale-110 hover:shadow-xl hover:border-emerald-200 transition-all cursor-default">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-2 rounded-xl text-white">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      Web Portal
                    </div>
                  </div>
                </div>

                {/* Bottom Left - Status */}
                <div className="absolute bottom-[8%] left-[8%] z-10 animate-[bounce_3.5s_infinite_1.5s]">
                  <div className="bg-white p-2 rounded-2xl shadow-lg border border-slate-200 ring-1 ring-slate-100 group/node hover:scale-110 hover:shadow-xl hover:border-[#D4AF37]/30 transition-all cursor-default">
                    <div className="bg-gradient-to-br from-[#D4AF37] to-[#E4C55B] p-2 rounded-xl text-primary-900">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-semibold py-1 px-2.5 rounded-lg opacity-0 group-hover/node:opacity-100 transition-opacity whitespace-nowrap shadow-lg">
                      Live Status
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status indicator */}
              <div className="relative z-10 mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Sistem Terhubung • Realtime
              </div>
            </div>
          </FadeInItem>
        </StaggerContainer>
      </div>

      {/* Bottom Wave Transition */}
      <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none z-20 pointer-events-none">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-full"
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            className="fill-slate-50"
          ></path>
        </svg>
        {/* Grid Overlay masked to Wave Shape */}
        <div
          className="absolute inset-0 bg-fixed"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/svg%3E")`,
            maskSize: "100% 100%",
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/svg%3E")`,
            WebkitMaskSize: "100% 100%",
          }}
        />
      </div>
    </section>
  );
}
