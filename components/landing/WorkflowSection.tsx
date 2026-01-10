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
        {/* Grid Overlay masked to Inverted Wave Shape (The Top Chunk) */}
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

      {/* BG Decoration */}
      <div
        className="absolute inset-0 bg-fixed opacity-5"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            Alur Kerja
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6 tracking-tight">
            Mekanisme Pelaporan <span className="text-blue-400">Terpadu</span>
          </h2>
          <p className="text-lg text-slate-400 leading-relaxed">
            Alur kerja digital yang menyederhanakan proses monitoring lapangan
            menjadi langkah-langkah efisien dan terstruktur.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-auto lg:h-[600px]">
          {/* Left Column: Identifikasi */}
          <FadeInItem className="h-full">
            <div className="group relative h-full bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6">
                  <ScanQrCode className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Identifikasi Aset
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pemindaian QR Code dan verifikasi koordinat GPS untuk
                  memastikan akurasi lokasi.
                </p>
              </div>

              {/* Map Visualization - Simplified & Modern (Light) */}
              <div className="relative flex-grow mt-6 w-full min-h-[300px] lg:min-h-0 bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group-hover:border-cyan-500/30 transition-all duration-500 shadow-2xl">
                {/* Abstract Digital Map Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e1_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e1_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />

                {/* Minimalist Radar Overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-[80%] h-[80%] border border-cyan-500/20 rounded-full animate-[spin_20s_linear_infinite]" />
                  <div className="w-[60%] h-[60%] border border-cyan-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse] border-dashed" />
                  <div className="w-[40%] h-[40%] bg-cyan-500/10 rounded-full animate-pulse blur-xl" />
                </div>

                {/* Asset Marker 1 (Online) */}
                <div className="absolute top-[35%] left-[30%] z-10 group/marker cursor-pointer">
                  <div className="relative flex items-center gap-3">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-cyan-500 opacity-20"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)] ring-2 ring-white"></span>
                    </div>
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-cyan-200 text-[10px] font-medium text-cyan-700 shadow-xl translate-x-[-10px] opacity-0 group-hover/marker:opacity-100 group-hover/marker:translate-x-0 transition-all duration-300">
                      PJU-01 <span className="text-slate-400 mx-1">|</span> 98%
                    </div>
                  </div>
                </div>

                {/* Asset Marker 2 (Maintenance) */}
                <div className="absolute bottom-[35%] right-[30%] z-10 group/marker cursor-pointer">
                  <div className="relative flex items-center gap-3 flex-row-reverse">
                    <div className="relative flex items-center justify-center">
                      <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-amber-500 opacity-20 delay-150"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)] ring-2 ring-white"></span>
                    </div>
                    <div className="bg-white/90 backdrop-blur px-3 py-1.5 rounded-full border border-amber-200 text-[10px] font-medium text-amber-700 shadow-xl translate-x-[10px] opacity-0 group-hover/marker:opacity-100 group-hover/marker:translate-x-0 transition-all duration-300">
                      PJU-45 <span className="text-slate-400 mx-1">|</span>{" "}
                      Check
                    </div>
                  </div>
                </div>

                {/* Simple Connecting Curve */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
                  <path
                    d="M 130 120 Q 200 160 270 190"
                    stroke="url(#simple-gradient)"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray="6 6"
                    className="animate-[dash_30s_linear_infinite]"
                  />
                  <defs>
                    <linearGradient
                      id="simple-gradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="1" />
                      <stop
                        offset="100%"
                        stopColor="#f59e0b"
                        stopOpacity="0.1"
                      />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Minimal Coordinates */}
                <div className="absolute bottom-4 left-4 flex flex-col gap-0.5 pointer-events-none opacity-50">
                  <div className="h-0.5 w-8 bg-slate-300 rounded-full"></div>
                  <div className="h-0.5 w-5 bg-slate-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </FadeInItem>

          {/* Middle Column: Stacked */}
          <div className="flex flex-col gap-6 lg:gap-8 h-full">
            {/* Top: Dokumentasi */}
            <FadeInItem className="h-full">
              <div className="group relative h-full bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4">
                      <MediaImage className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Dokumentasi Digital
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Foto fisik dengan watermark timestamp & geotag otomatis.
                    </p>
                  </div>
                </div>
                {/* Decoration */}
                <div className="absolute bottom-6 right-6 flex gap-2">
                  <div className="w-16 h-20 bg-slate-50 rounded-lg border border-slate-200 rotate-6 transform group-hover:rotate-12 transition-transform p-2 flex flex-col gap-1.5 shadow-sm">
                    <div className="w-8 h-1 bg-slate-200 rounded-full" />
                    <div className="w-full h-1 bg-slate-100 rounded-full" />
                    <div className="w-full h-1 bg-slate-100 rounded-full" />
                    <div className="w-3/4 h-1 bg-slate-100 rounded-full" />
                  </div>
                  <div className="w-16 h-20 bg-blue-50 rounded-lg border border-blue-100 -rotate-3 transform group-hover:-rotate-6 transition-transform p-2 flex flex-col gap-1.5 shadow-sm z-10">
                    <div className="w-8 h-1 bg-blue-200 rounded-full" />
                    <div className="w-full h-1 bg-blue-100 rounded-full" />
                    <div className="w-full h-1 bg-blue-100 rounded-full" />
                    <div className="w-3/4 h-1 bg-blue-100 rounded-full" />
                    <div className="mt-auto w-4 h-4 bg-blue-200 rounded-full self-end opacity-50" />
                  </div>
                </div>
              </div>
            </FadeInItem>

            {/* Bottom: Input Data */}
            <FadeInItem className="h-full">
              <div className="group relative h-full bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className="flex items-start justify-between relative z-10">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                      <Activity className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">
                      Input Parameter
                    </h3>
                    <p className="text-slate-500 text-sm">
                      Formulir teknis responsif untuk data komponen.
                    </p>
                  </div>
                </div>
                {/* Graph Line */}
                <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 100 40"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M0 35 Q 20 10, 40 25 T 100 5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className="text-purple-300 group-hover:text-purple-500 transition-colors"
                    />
                    <path
                      d="M0 35 Q 20 10, 40 25 T 100 5 V 40 H 0 Z"
                      fill="currentColor"
                      className="text-purple-50 group-hover:text-purple-100 transition-colors"
                    />
                  </svg>
                </div>
              </div>
            </FadeInItem>
          </div>

          {/* Right Column: Sync */}
          <FadeInItem className="h-full">
            <div className="group relative h-full bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />

              <div className="relative z-10 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mb-6">
                  <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">
                  Real-time Sync
                </h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Sinkronisasi data otomatis ke server pusat dashboard nasional.
                </p>
              </div>

              {/* Network Visual */}
              <div className="relative flex-grow mt-6 flex items-center justify-center min-h-[320px]">
                {/* Background Radar Effect */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="absolute w-[80%] h-[80%] border border-slate-100 rounded-full animate-[spin_20s_linear_infinite]" />
                  <div className="absolute w-[60%] h-[60%] border border-slate-100 rounded-full border-dashed animate-[spin_15s_linear_infinite_reverse]" />
                  <div className="absolute w-[40%] h-[40%] bg-blue-50/50 rounded-full animate-pulse" />
                </div>

                {/* Center Hub */}
                <div className="relative z-20 bg-white p-2 rounded-2xl shadow-xl shadow-blue-100/50 border border-blue-50 ring-4 ring-white">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-3.5 rounded-xl shadow-inner">
                    <Database className="w-8 h-8" />
                  </div>
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 rounded-2xl bg-blue-500/20 animate-ping duration-1000" />
                </div>

                {/* Connecting Lines */}
                <div className="absolute inset-0 z-0">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 200 200"
                    preserveAspectRatio="none"
                  >
                    <defs>
                      <linearGradient
                        id="lineGradient"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop
                          offset="0%"
                          stopColor="#CBD5E1"
                          stopOpacity="0.2"
                        />
                        <stop
                          offset="50%"
                          stopColor="#3B82F6"
                          stopOpacity="0.5"
                        />
                        <stop
                          offset="100%"
                          stopColor="#CBD5E1"
                          stopOpacity="0.2"
                        />
                      </linearGradient>
                      <style>
                        {`
                          @keyframes dashFlow {
                            to { stroke-dashoffset: -24; }
                          }
                          .data-flow {
                            animation: dashFlow 1s linear infinite;
                          }
                        `}
                      </style>
                    </defs>

                    {/* Connection Paths */}
                    {[
                      "M 40 40 L 100 100", // TL
                      "M 160 40 L 100 100", // TR
                      "M 160 160 L 100 100", // BR
                      "M 40 160 L 100 100", // BL
                    ].map((d, i) => (
                      <g key={i}>
                        <path d={d} stroke="#E2E8F0" strokeWidth="1" />
                        <path
                          d={d}
                          stroke="#3B82F6"
                          strokeWidth="2"
                          strokeDasharray="4 8"
                          className="data-flow"
                          strokeLinecap="round"
                        />
                      </g>
                    ))}
                  </svg>
                </div>

                {/* Satellite Nodes */}
                {/* Top Left - Mobile App */}
                <div className="absolute top-[10%] left-[10%] z-10 animate-[bounce_4s_infinite]">
                  <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 text-cyan-600 ring-1 ring-slate-50 group hover:scale-110 transition-transform cursor-default">
                    <div className="bg-cyan-50 p-2 rounded-xl">
                      <SmartphoneDevice className="w-5 h-5" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Mobile App
                    </div>
                  </div>
                </div>

                {/* Top Right - QR Scan */}
                <div className="absolute top-[10%] right-[10%] z-10 animate-[bounce_5s_infinite_0.5s]">
                  <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 text-purple-600 ring-1 ring-slate-50 group hover:scale-110 transition-transform cursor-default">
                    <div className="bg-purple-50 p-2 rounded-xl">
                      <ScanQrCode className="w-5 h-5" />
                    </div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Asset ID
                    </div>
                  </div>
                </div>

                {/* Bottom Right - Web */}
                <div className="absolute bottom-[10%] right-[10%] z-10 animate-[bounce_4.5s_infinite_1s]">
                  <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 text-emerald-600 ring-1 ring-slate-50 group hover:scale-110 transition-transform cursor-default">
                    <div className="bg-emerald-50 p-2 rounded-xl">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Web Portal
                    </div>
                  </div>
                </div>

                {/* Bottom Left - Status */}
                <div className="absolute bottom-[10%] left-[10%] z-10 animate-[bounce_3.5s_infinite_1.5s]">
                  <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-slate-100 text-amber-600 ring-1 ring-slate-50 group hover:scale-110 transition-transform cursor-default">
                    <div className="bg-amber-50 p-2 rounded-xl">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Live Status
                    </div>
                  </div>
                </div>
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
