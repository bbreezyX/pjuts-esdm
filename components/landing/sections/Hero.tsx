/**
 * Hero section updated with official ESDM content.
 */
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, MapPin, Database, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const Hero = () => {
  return (
    <section id="beranda" className="relative pt-48 pb-20 px-6 overflow-hidden bg-primary">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-esdm-gold/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-[10px] font-bold uppercase tracking-widest text-accent mb-6"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Sistem Monitoring Real-time
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-8xl font-bold tracking-tight text-white max-w-5xl mx-auto leading-[0.95] mb-8"
          >
            Monitoring <span className="text-accent">PJUTS</span> <br />
            Nasional
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/60 mt-8 max-w-2xl mx-auto font-medium"
          >
            Platform terintegrasi Kementerian ESDM untuk pemantauan, pelaporan, dan analisis kinerja <span className="text-accent/80">Penerangan Jalan Umum Tenaga Surya</span> di seluruh Indonesia.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4 mt-12"
          >
            <Link href="/login" className="bg-accent text-primary px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-accent/90 transition-all shadow-[0_0_20px_rgba(255,245,0,0.3)]">
              Mulai Sekarang
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="#alur-kerja" className="bg-white/5 backdrop-blur-md border border-white/10 text-white px-8 py-4 rounded-full font-bold hover:bg-white/10 transition-all">
              Pelajari Sistem
            </Link>
          </motion.div>
        </div>

        {/* Floating Data Visualization inspired by Reference */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="relative max-w-6xl mx-auto aspect-[16/10] md:aspect-[16/8] rounded-[32px] md:rounded-[48px] overflow-hidden shadow-2xl group border border-white/10 bg-white"
        >
          <img 
            src="/illustrations/hero-command.png" 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 mix-blend-multiply"
            alt="ESDM National Monitoring Hub Illustration"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent pointer-events-none" />
          
          {/* Data Overlay Cards - Positioned contextually to the illustration */}
          
          {/* Main Stat - Aligned to the left monitor */}
          <div className="hidden lg:block absolute top-[12%] left-[5%] p-6 md:p-8 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 text-white max-w-[280px] shadow-2xl z-20 transition-all hover:border-accent/30 group/card">
            <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center mb-6 group-hover/card:scale-110 transition-transform shadow-[0_0_15px_rgba(255,245,0,0.2)]">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <p className="text-4xl font-bold mb-1 tracking-tighter">12,500+</p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-4">Unit Terpasang</p>
            <p className="text-[11px] leading-relaxed text-white/40 font-medium">
              Tersebar di seluruh wilayah NKRI, memastikan kemandirian energi nasional.
            </p>
          </div>

          {/* Bottom Stats - Integrated with the engineer silhouettes */}
          <div className="hidden md:flex absolute bottom-[8%] left-[8%] flex-wrap gap-4 z-20">
             <div className="px-5 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4 text-white hover:border-accent/30 transition-colors shadow-xl">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-base font-bold leading-none">34</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-black mt-1">Provinsi</p>
                </div>
             </div>
             <div className="px-5 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center gap-4 text-white hover:border-accent/30 transition-colors shadow-xl">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <Database className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-base font-bold leading-none">50k+</p>
                  <p className="text-[8px] text-white/40 uppercase tracking-widest font-black mt-1">Laporan</p>
                </div>
             </div>
          </div>

          {/* Live Monitor - Aligned to the right-side dashboard */}
          <div className="hidden lg:block absolute bottom-[15%] right-[5%] p-6 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 text-white min-w-[240px] z-20 shadow-2xl hover:border-accent/30 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-esdm-green animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-white/60">Live Monitoring</span>
              </div>
              <ShieldCheck className="w-4 h-4 text-accent/50" />
            </div>
            <p className="text-3xl font-bold mb-1 tracking-tighter">24/7<span className="text-accent">.</span></p>
            <p className="text-[10px] text-white/30 font-bold leading-tight">Uptime 99.9% Sistem Monitoring Aktif Nasional</p>
          </div>
        </motion.div>

        {/* Mobile-Only Stats Grid (Visible only on small screens) */}
        <div className="grid grid-cols-2 gap-4 mt-8 md:hidden px-2">
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                <p className="text-3xl font-bold text-white mb-1">12,5k+</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-accent">Unit Terpasang</p>
            </div>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10 text-center">
                <p className="text-3xl font-bold text-white mb-1">24/7</p>
                <p className="text-[8px] font-black uppercase tracking-widest text-accent">Monitoring</p>
            </div>
        </div>
      </div>
    </section>
  );
};
