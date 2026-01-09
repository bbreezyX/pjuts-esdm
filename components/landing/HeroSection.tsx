"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Lightbulb,
  MapPin,
  BarChart3,
  Shield,
  Activity,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer, FadeInItem } from "@/components/ui/motion";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-esdm-gradient min-h-[90vh] flex flex-col">
      {/* Background Pattern */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/50 to-primary-950/90" />

        {/* Animated Gradient Orbs */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
          className="absolute top-1/2 -left-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col pb-28 lg:pb-40">
        {/* Navbar - Animated in */}
        <FadeIn direction="down" delay={0.1} className="w-full">
          <nav className="flex items-center justify-between py-6 lg:py-8">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                <Image
                  src="/logo-esdm.png"
                  alt="Logo ESDM"
                  width={56}
                  height={56}
                  className="relative w-12 h-12 lg:w-14 lg:h-14 object-contain drop-shadow-2xl"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                  PJUTS <span className="text-amber-400">ESDM</span>
                </h1>
                <p className="text-xs text-primary-100 font-medium tracking-wide uppercase opacity-90">
                  Kementerian ESDM RI
                </p>
              </div>
            </div>
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-amber-300 transition-colors font-medium"
              >
                Masuk ke Sistem
              </Button>
            </Link>
          </nav>
        </FadeIn>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center flex-grow py-8 lg:py-0">
          <StaggerContainer
            className="flex flex-col items-start text-left"
            delayChildren={0.2}
          >
            <FadeInItem>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full text-amber-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8 backdrop-blur-sm shadow-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                Sistem Monitoring Real-time
              </div>
            </FadeInItem>

            <FadeInItem>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
                Monitoring <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                  PJUTS
                </span>{" "}
                Nasional
              </h2>
            </FadeInItem>

            <FadeInItem>
              <p className="text-base sm:text-lg lg:text-xl text-primary-100 mb-8 sm:mb-10 max-w-xl leading-relaxed opacity-90">
                Platform terintegrasi Kementerian ESDM untuk pemantauan,
                pelaporan, dan analisis kinerja{" "}
                <span className="text-amber-300 font-semibold">
                  Penerangan Jalan Umum Tenaga Surya
                </span>{" "}
                di seluruh Indonesia.
              </p>
            </FadeInItem>

            <FadeInItem className="w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-primary-950 font-bold shadow-amber-900/20 shadow-lg border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all"
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <Button
                    size="xl"
                    variant="outline"
                    className="w-full sm:w-auto bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:border-white/40 shadow-lg"
                  >
                    Pelajari Sistem
                  </Button>
                </Link>
              </div>
            </FadeInItem>

            {/* Trust Indicators */}
            <FadeInItem className="w-full">
              <div className="mt-10 sm:mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10 w-full">
                <div className="flex items-center gap-3 group">
                  <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-amber-500/50 shadow-lg shadow-black/10">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight mb-0.5 tracking-wide">
                      Data Aman
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-primary-200/80 font-medium uppercase tracking-wider">
                      Enkripsi AES-256
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-amber-500/50 shadow-lg shadow-black/10">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight mb-0.5 tracking-wide">
                      Reliabel
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-primary-200/80 font-medium uppercase tracking-wider">
                      99.9% Uptime SLA
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 group col-span-2 sm:col-span-1">
                  <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-amber-500/50 shadow-lg shadow-black/10">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight mb-0.5 tracking-wide">
                      Real-time
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-primary-200/80 font-medium uppercase tracking-wider">
                      Sync &lt; 1 Detik
                    </span>
                  </div>
                </div>
              </div>
            </FadeInItem>
          </StaggerContainer>

          {/* Stats Visualization */}
          <StaggerContainer
            className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 lg:mt-0"
            delayChildren={0.4}
            staggerChildren={0.15}
          >
            <FadeInItem>
              <StatsCard
                value="12,500+"
                label="Unit Terpasang"
                icon={Lightbulb}
              />
            </FadeInItem>
            <FadeInItem className="lg:translate-y-8">
              <StatsCard value="34" label="Provinsi" icon={MapPin} />
            </FadeInItem>
            <FadeInItem>
              <StatsCard value="50k+" label="Laporan Masuk" icon={BarChart3} />
            </FadeInItem>
            <FadeInItem className="lg:translate-y-8">
              <StatsCard
                value="24/7"
                label="Monitoring Aktif"
                icon={Zap}
                className="bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30"
                valueColor="text-amber-400"
              />
            </FadeInItem>
          </StaggerContainer>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none pointer-events-none">
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

function StatsCard({
  value,
  label,
  icon: Icon,
  className,
  valueColor = "text-white",
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  className?: string;
  valueColor?: string;
}) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/15 transition-colors ${className}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="w-6 h-6 text-amber-400" />
        </div>
      </div>
      <p className={`text-4xl font-bold ${valueColor} mb-1 tracking-tight`}>
        {value}
      </p>
      <p className="text-primary-200 text-sm font-medium uppercase tracking-wide">
        {label}
      </p>
    </div>
  );
}
