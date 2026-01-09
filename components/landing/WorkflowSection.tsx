"use client";

import {
  MapPin,
  Smartphone,
  Activity,
  CheckCircle2,
  ScanLine,
  FileImage,
  Database,
  Globe2,
} from "lucide-react";
import { FadeIn, StaggerContainer, FadeInItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

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
        {/* Grid Overlay masked to Inverted Wave Shape (The Top Chunk) */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)] bg-[size:40px_40px] bg-fixed"
          style={{
            maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cdefs%3E%3Cmask id='m' x='0' y='0' width='100%25' height='100%25'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white'/%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`,
            maskSize: '100% 100%',
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cdefs%3E%3Cmask id='m' x='0' y='0' width='100%25' height='100%25'%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white'/%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/mask%3E%3C/defs%3E%3Crect x='0' y='0' width='100%25' height='100%25' fill='white' mask='url(%23m)'/%3E%3C/svg%3E")`,
            WebkitMaskSize: '100% 100%'
          }}
        />
      </div>

      {/* BG Decoration */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
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
            Alur kerja digital yang menyederhanakan proses monitoring lapangan menjadi langkah-langkah efisien dan terstruktur.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 h-auto lg:h-[600px]">
          
          {/* Left Column: Identifikasi */}
          <FadeInItem className="h-full">
            <div className="group relative h-full bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-6">
                  <ScanLine className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Identifikasi Aset</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Pemindaian QR Code dan verifikasi koordinat GPS untuk memastikan akurasi lokasi.
                </p>
              </div>

              {/* Map Visualization */}
              <div className="relative flex-grow mt-6 w-full min-h-[250px] lg:min-h-0 bg-slate-50/50 rounded-2xl border border-slate-100 overflow-hidden group-hover:border-cyan-200 transition-colors">
                 {/* Map Pattern/Grid */}
                 <div className="absolute inset-0 bg-[linear-gradient(to_right,#0891b212_1px,transparent_1px),linear-gradient(to_bottom,#0891b212_1px,transparent_1px)] bg-[size:24px_24px]" />
                 
                 {/* Radar Scan Effect */}
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 lg:w-96 lg:h-96 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(6,182,212,0.1)_360deg)] rounded-full animate-spin [animation-duration:4s]" />
                 
                 {/* Asset Markers */}
                 <div className="absolute top-1/4 left-1/3 z-10">
                    <div className="relative group/marker">
                       <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2 transition-transform duration-300 group-hover/marker:-translate-y-[120%]">
                          <div className="relative bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 shadow-[0_4px_20px_-4px_rgba(6,182,212,0.15)] border border-slate-100/50 whitespace-nowrap flex items-center gap-1.5 ring-1 ring-slate-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                             Unit JKT-01
                          </div>
                          {/* Arrow */}
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 rotate-45 border-r border-b border-slate-100/50" />
                       </div>
                       
                       <div className="relative flex items-center justify-center cursor-pointer">
                          <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-cyan-400 opacity-20 duration-1000"></span>
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 ring-2 ring-white transition-all duration-300 group-hover/marker:scale-125"></span>
                       </div>
                    </div>
                 </div>

                 <div className="absolute bottom-1/4 right-1/4 z-10">
                    <div className="relative group/marker">
                       <div className="absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2 transition-transform duration-300 group-hover/marker:-translate-y-[120%]">
                          <div className="relative bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[10px] font-bold text-slate-700 shadow-[0_4px_20px_-4px_rgba(6,182,212,0.15)] border border-slate-100/50 whitespace-nowrap flex items-center gap-1.5 ring-1 ring-slate-100">
                             <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                             Unit BDG-45
                          </div>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/90 rotate-45 border-r border-b border-slate-100/50" />
                       </div>

                       <div className="relative flex items-center justify-center cursor-pointer">
                          <span className="absolute inline-flex h-8 w-8 animate-ping rounded-full bg-cyan-400 opacity-20 duration-1000 delay-700"></span>
                          <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-500 shadow-lg shadow-cyan-500/50 ring-2 ring-white transition-all duration-300 group-hover/marker:scale-125"></span>
                       </div>
                    </div>
                 </div>

                 <div className="absolute top-1/2 right-1/6">
                    <div className="relative flex items-center justify-center">
                       <span className="absolute inline-flex h-6 w-6 animate-ping rounded-full bg-slate-400 opacity-20 duration-1000 delay-300"></span>
                       <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-300 ring-2 ring-white"></span>
                    </div>
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
                      <FileImage className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Dokumentasi Digital</h3>
                    <p className="text-slate-500 text-sm">Foto fisik dengan watermark timestamp & geotag otomatis.</p>
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
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Input Parameter</h3>
                    <p className="text-slate-500 text-sm">Formulir teknis responsif untuk data komponen.</p>
                  </div>
                </div>
                 {/* Graph Line */}
                 <div className="absolute bottom-0 left-0 right-0 h-16 opacity-50">
                    <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <path d="M0 35 Q 20 10, 40 25 T 100 5" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-300 group-hover:text-purple-500 transition-colors" />
                        <path d="M0 35 Q 20 10, 40 25 T 100 5 V 40 H 0 Z" fill="currentColor" className="text-purple-50 group-hover:text-purple-100 transition-colors" />
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
                  <Globe2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Real-time Sync</h3>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Sinkronisasi data otomatis ke server pusat dashboard nasional.
                </p>
              </div>

               {/* Network Visual */}
              <div className="relative flex-grow mt-4 flex items-center justify-center">
                 {/* Center */}
                 <div className="relative z-20 bg-blue-600 text-white p-4 rounded-2xl shadow-lg shadow-blue-200">
                    <Database className="w-8 h-8" />
                 </div>
                 
                 {/* Connecting Spokes - Animated Flow */}
                 <div className="absolute inset-0 z-0">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0" />
                          <stop offset="50%" stopColor="#3B82F6" stopOpacity="1" />
                          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
                        </linearGradient>
                        <style>
                          {`
                            @keyframes flowAnimation {
                              0% { stroke-dashoffset: 0; }
                              100% { stroke-dashoffset: 20; }
                            }
                            .flow-path {
                              animation: flowAnimation 1.5s linear infinite;
                            }
                          `}
                        </style>
                      </defs>
                      
                      {/* Top Left Connection */}
                      <path d="M 50 50 C 35 50, 35 25, 15 20" fill="none" stroke="#DBEAFE" strokeWidth="4" />
                      <path d="M 50 50 C 35 50, 35 25, 15 20" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 6" className="flow-path" strokeLinecap="round" />

                      {/* Bottom Right Connection */}
                      <path d="M 50 50 C 65 50, 65 75, 85 80" fill="none" stroke="#DBEAFE" strokeWidth="4" />
                      <path d="M 50 50 C 65 50, 65 75, 85 80" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 6" className="flow-path" strokeLinecap="round" />

                      {/* Top Right Connection */}
                      <path d="M 50 50 C 65 50, 65 25, 85 20" fill="none" stroke="#DBEAFE" strokeWidth="4" />
                      <path d="M 50 50 C 65 50, 65 25, 85 20" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 6" className="flow-path" strokeLinecap="round" />

                      {/* Bottom Left Connection */}
                      <path d="M 50 50 C 35 50, 35 75, 15 80" fill="none" stroke="#DBEAFE" strokeWidth="4" />
                      <path d="M 50 50 C 35 50, 35 75, 15 80" fill="none" stroke="#3B82F6" strokeWidth="2" strokeDasharray="4 6" className="flow-path" strokeLinecap="round" />
                    </svg>
                 </div>

                 {/* Avatars/Nodes - Replaced with Local Icons */}
                 <div className="absolute top-10 left-10 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-blue-500">
                    <div className="w-full h-full rounded-full bg-blue-50 flex items-center justify-center">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                 </div>
                 <div className="absolute bottom-10 right-10 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-green-500">
                    <div className="w-full h-full rounded-full bg-green-50 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                 </div>
                  <div className="absolute top-10 right-10 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-amber-500">
                    <div className="w-full h-full rounded-full bg-amber-50 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                 </div>
                 <div className="absolute bottom-10 left-10 w-10 h-10 bg-white border border-slate-100 rounded-full shadow-sm flex items-center justify-center text-rose-500">
                    <div className="w-full h-full rounded-full bg-rose-50 flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                 </div>
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
          {/* Grid Overlay masked to Wave Shape */}
          <div 
             className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)] bg-[size:40px_40px] bg-fixed"
             style={{
               maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/svg%3E")`,
               maskSize: '100% 100%',
               WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/svg%3E")`,
               WebkitMaskSize: '100% 100%'
             }}
           />
        </div>
    </section>
  );
}
