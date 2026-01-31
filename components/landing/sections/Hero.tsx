/**
 * Hero section updated with official ESDM content.
 * Supports ID/EN language switching.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight, Zap, MapPin, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="beranda"
      className="relative min-h-screen flex items-center pt-28 md:pt-32 pb-16 md:pb-20 px-4 md:px-6 overflow-hidden bg-primary"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `url('/grid-pattern.svg')`,
            backgroundSize: '40px 40px' 
          }} 
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-[-20%] right-[-10%] w-[1000px] h-[1000px] bg-accent/15 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] mix-blend-screen" />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/50 to-primary" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Text Content */}
          <div className="text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-accent mb-8 backdrop-blur-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shadow-[0_0_10px_rgba(212,175,55,0.5)]" />
              {t("hero.badge")}
            </motion.div>
            
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8, ease: "easeOut" }}
              className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white leading-[0.95] md:leading-[0.9] mb-6 md:mb-8"
            >
              {t("hero.title_1")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/50">
                {t("hero.title_2")}
              </span> <br />
              <span className="text-accent inline-block transform origin-left hover:scale-[1.02] transition-transform duration-500 cursor-default">
                {t("hero.title_3")}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-lg md:text-xl text-white/60 max-w-xl font-medium leading-relaxed mb-10"
            >
              {t("hero.description")}{" "}
              <span className="text-white font-semibold">
                {t("hero.description_highlight")}
              </span>{" "}
              {t("hero.description_end")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row flex-wrap gap-4"
            >
              <Link
                href="/login"
                className="group relative px-8 py-4 bg-accent text-primary rounded-full font-bold text-sm tracking-wide overflow-hidden shadow-[0_0_30px_-10px_rgba(212,175,55,0.6)] hover:shadow-[0_0_50px_-10px_rgba(212,175,55,0.8)] transition-all duration-300 w-full sm:w-auto flex justify-center"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t("hero.cta_primary")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </Link>
              
              <Link
                href="#alur-kerja"
                className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 text-white rounded-full font-bold text-sm tracking-wide hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {t("hero.cta_secondary")}
              </Link>
            </motion.div>
          </div>

          {/* Visual Content - Glass Dashboard Effect */}
          <div className="relative mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              transition={{ delay: 0.4, duration: 1, type: "spring" }}
              className="relative z-10 aspect-[4/3] rounded-[40px] overflow-hidden border border-white/10 shadow-2xl bg-gradient-to-br from-white/10 to-transparent backdrop-blur-sm"
              style={{ perspective: "1000px" }}
            >
              <Image
                src="/illustrations/hero-command.png"
                fill
                className="object-cover opacity-90 mix-blend-normal hover:scale-105 transition-transform duration-700 ease-out"
                alt="ESDM Command Center"
                priority
              />
              
              {/* Glossy Overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 via-transparent to-white/10 pointer-events-none" />
            </motion.div>

            {/* Floating Stats - Left (Desktop) */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0, y: [0, -10, 0] }}
              transition={{ 
                opacity: { delay: 0.6 },
                x: { delay: 0.6 },
                y: { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }}
              className="hidden md:block absolute -left-4 top-[20%] p-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl z-20 max-w-[200px]"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-accent/20 rounded-lg">
                  <Zap className="w-5 h-5 text-accent" />
                </div>
                <span className="text-3xl font-bold text-white">850+</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">
                {t("hero.units_installed")}
              </p>
            </motion.div>

            {/* Floating Stats - Right (Desktop) */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0, y: [0, 10, 0] }}
              transition={{ 
                opacity: { delay: 0.8 },
                x: { delay: 0.8 },
                y: { repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }
              }}
              className="hidden md:block absolute -right-4 bottom-[20%] p-5 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl z-20"
            >
              <div className="flex items-center gap-4 mb-2">
                 <div className="relative">
                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                   <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20" />
                 </div>
                 <span className="text-2xl font-bold text-white">Live</span>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-white/50 font-bold">
                {t("hero.live_monitoring")}
              </p>
            </motion.div>

            {/* Mobile Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6 md:hidden">
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col items-center text-center">
                <div className="p-2 bg-accent/10 rounded-full mb-2">
                  <Zap className="w-4 h-4 text-accent" />
                </div>
                <span className="text-2xl font-bold text-white">850+</span>
                <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-1">
                  {t("hero.units_installed")}
                </p>
              </div>
              <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col items-center text-center">
                <div className="p-2 bg-green-500/10 rounded-full mb-2 relative">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse absolute top-0 right-0" />
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-2xl font-bold text-white">Live</span>
                <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-1">
                  {t("hero.live_monitoring")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
