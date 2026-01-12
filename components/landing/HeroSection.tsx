import Link from "next/link";
import Image from "next/image";
import {
  LightBulb,
  MapPin,
  StatsReport,
  Flash,
  ArrowRight,
  SunLight,
} from "iconoir-react";
import { Button } from "@/components/ui/button";

// Server Component - No "use client" = Zero JS for static content
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 min-h-[90vh] flex flex-col">
      {/* Background Pattern - Hexagon SVG */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-10 bg-fixed"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23ffffff' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.15),transparent)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-800/30 to-primary-950/80" />

        {/* Refined Gradient Orbs - ESDM Gold accent */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/3 -left-32 w-80 h-80 bg-primary-400/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#D4AF37]/8 rounded-full blur-[60px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col pb-28 lg:pb-40">
        {/* Navbar */}
        <nav className="flex items-center justify-between py-6 lg:py-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 blur-xl rounded-full scale-150" />
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={56}
                height={56}
                priority
                className="relative w-12 h-12 lg:w-14 lg:h-14 object-contain drop-shadow-2xl"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                PJUTS <span className="text-[#D4AF37]">ESDM</span>
              </h1>
              <p className="text-xs text-primary-200/80 font-medium tracking-wide uppercase">
                Kementerian ESDM RI
              </p>
            </div>
          </div>
          <Link href="/login">
            <Button
              variant="ghost"
              className="text-white/90 hover:bg-white/10 hover:text-[#E4C55B] transition-all duration-300 font-medium rounded-full px-6"
            >
              Masuk ke Sistem
            </Button>
          </Link>
        </nav>

        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center flex-grow py-8 lg:py-0">
          <div className="flex flex-col items-start text-left">
            {/* Badge - ESDM Gold themed */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded-full text-[#E4C55B] text-sm font-semibold mb-8 backdrop-blur-sm shadow-lg shadow-black/10 animate-fade-in">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E4C55B]"></span>
              </span>
              Sistem Monitoring Real-time
            </div>

            {/* Title - Enhanced typography */}
            <h2 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight animate-fade-in">
              Monitoring{" "}
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#E4C55B] to-[#D4AF37]">
                  PJUTS
                </span>
                <SunLight className="absolute -top-2 -right-6 w-5 h-5 text-[#E4C55B] animate-pulse" />
              </span>
              <br />
              <span className="text-primary-100">Nasional</span>
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-primary-100/90 mb-10 max-w-xl leading-relaxed animate-fade-in">
              Platform terintegrasi Kementerian ESDM untuk pemantauan,
              pelaporan, dan analisis kinerja{" "}
              <span className="text-[#E4C55B] font-semibold">
                Penerangan Jalan Umum Tenaga Surya
              </span>{" "}
              di seluruh Indonesia.
            </p>

            {/* CTA Buttons - Refined with ESDM Gold */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in">
              <Link href="/login" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  className="w-full sm:w-auto bg-gradient-to-r from-[#D4AF37] to-[#E4C55B] hover:from-[#E4C55B] hover:to-[#D4AF37] text-primary-900 font-bold shadow-lg shadow-[#D4AF37]/25 transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/30 hover:-translate-y-0.5 rounded-full px-8"
                >
                  Mulai Sekarang
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button
                  size="xl"
                  variant="outline"
                  className="w-full sm:w-auto bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:border-[#D4AF37]/40 hover:text-[#E4C55B] shadow-lg transition-all duration-300 rounded-full px-8"
                >
                  Pelajari Sistem
                </Button>
              </Link>
            </div>
          </div>

          {/* Stats Grid - Premium Bento Style */}
          <div className="relative mt-8 lg:mt-0">
            {/* Glow Effect Behind Grid */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37]/15 via-transparent to-primary-400/15 blur-3xl -z-10 scale-125" />

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {/* Main Featured Stat */}
              <StatsCard
                value="12,500+"
                label="Unit Terpasang"
                description="Tersebar di seluruh Indonesia"
                icon={LightBulb}
                variant="featured"
                className="col-span-2 animate-fade-in"
              />

              {/* Secondary Stats Row */}
              <StatsCard
                value="34"
                label="Provinsi"
                icon={MapPin}
                variant="default"
                className="animate-fade-in"
              />
              <StatsCard
                value="50k+"
                label="Laporan Masuk"
                icon={StatsReport}
                variant="default"
                className="animate-fade-in"
              />

              {/* Highlight Stat - Full Width */}
              <StatsCard
                value="24/7"
                label="Monitoring Aktif"
                description="Real-time dengan uptime 99.9%"
                icon={Flash}
                variant="highlight"
                className="col-span-2 animate-fade-in"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave - Static SVG */}
      <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none pointer-events-none">
        <svg
          className="relative block w-[calc(100%+1.3px)] h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z"
            className="fill-slate-50"
          />
        </svg>
        {/* Grid Overlay masked to Wave Shape with Fade Out */}
        <div
          className="absolute inset-0"
          style={{
            maskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/svg%3E")`,
            maskSize: "100% 100%",
            WebkitMaskImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 120' preserveAspectRatio='none'%3E%3Cpath d='M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z' fill='black'/%3E%3C/svg%3E")`,
            WebkitMaskSize: "100% 100%",
          }}
        >
          <div
            className="absolute inset-0 bg-fixed"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              maskImage: "linear-gradient(to bottom, black, transparent)",
              WebkitMaskImage: "linear-gradient(to bottom, black, transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

// Simple Trust Badge Component - kept for future use
function _TrustBadge({
  icon: Icon,
  label,
}: {
  icon: React.ElementType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 sm:gap-2.5 text-primary-200/80">
      <div className="p-1.5 sm:p-2 bg-[#D4AF37]/15 rounded-lg">
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#E4C55B]" />
      </div>
      <span className="text-xs sm:text-sm font-medium">{label}</span>
    </div>
  );
}

// Trust Indicator Component - kept for future use
function _TrustIndicator({
  icon: Icon,
  title,
  subtitle,
  className = "",
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-3 group ${className}`}>
      <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-[#D4AF37]/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-[#D4AF37]/50 shadow-lg shadow-black/10">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#E4C55B] group-hover:text-[#D4AF37]" />
      </div>
      <div className="flex flex-col">
        <span className="text-sm font-bold text-white leading-tight mb-0.5 tracking-wide">
          {title}
        </span>
        <span className="text-[10px] sm:text-[11px] text-primary-200/80 font-medium uppercase tracking-wider">
          {subtitle}
        </span>
      </div>
    </div>
  );
}

function StatsCard({
  value,
  label,
  description,
  icon: Icon,
  className = "",
  variant = "default",
}: {
  value: string;
  label: string;
  description?: string;
  icon: React.ElementType;
  className?: string;
  variant?: "default" | "featured" | "highlight";
}) {
  const variants = {
    default: {
      container:
        "bg-white/[0.08] backdrop-blur-xl border-white/10 hover:bg-white/[0.12] hover:border-[#D4AF37]/30",
      icon: "bg-white/10 text-[#E4C55B]",
      value: "text-white text-3xl sm:text-4xl",
      label: "text-primary-200/90",
    },
    featured: {
      container:
        "bg-gradient-to-br from-white/[0.12] to-white/[0.04] backdrop-blur-xl border-white/15 hover:border-[#D4AF37]/40",
      icon: "bg-gradient-to-br from-[#D4AF37] to-[#E4C55B] text-primary-900 shadow-lg shadow-[#D4AF37]/30",
      value: "text-white text-4xl sm:text-5xl lg:text-6xl",
      label: "text-white font-semibold",
    },
    highlight: {
      container:
        "bg-gradient-to-r from-[#D4AF37]/15 via-[#D4AF37]/10 to-[#D4AF37]/15 backdrop-blur-xl border-[#D4AF37]/30 hover:border-[#D4AF37]/50",
      icon: "bg-[#D4AF37]/20 text-[#E4C55B] ring-2 ring-[#D4AF37]/30",
      value: "text-[#E4C55B] text-3xl sm:text-4xl",
      label: "text-[#E4C55B]/80",
    },
  };

  const styles = variants[variant];

  if (variant === "featured") {
    return (
      <div
        className={`group relative overflow-hidden rounded-2xl sm:rounded-3xl p-6 sm:p-8 border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#D4AF37]/10 ${styles.container} ${className}`}
      >
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/10 to-[#D4AF37]/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center gap-6">
          <div
            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${styles.icon} transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
          >
            <Icon className="w-8 h-8 sm:w-10 sm:h-10" />
          </div>
          <div className="flex-1">
            <p className={`font-bold ${styles.value} mb-1 tracking-tight`}>
              {value}
            </p>
            <p
              className={`${styles.label} text-sm sm:text-base uppercase tracking-wider`}
            >
              {label}
            </p>
            {description && (
              <p className="text-primary-300/70 text-xs sm:text-sm mt-1">
                {description}
              </p>
            )}
          </div>

          {/* Progress/Activity Indicator */}
          <div className="hidden sm:flex flex-col items-end gap-1">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#D4AF37]/60 rounded-full animate-pulse"
                  style={{
                    height: `${12 + Math.random() * 16}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
            </div>
            <span className="text-[10px] text-primary-300/50 uppercase tracking-wider">
              Live
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "highlight") {
    return (
      <div
        className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/10 ${styles.container} ${className}`}
      >
        {/* Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D4AF37]/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

        <div className="relative flex items-center gap-4">
          <div
            className={`p-2.5 sm:p-3 rounded-xl ${styles.icon} transition-all duration-300 group-hover:scale-110`}
          >
            <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="flex-1">
            <div className="flex items-baseline gap-2">
              <p className={`font-bold ${styles.value} tracking-tight`}>
                {value}
              </p>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#E4C55B]"></span>
              </span>
            </div>
            <p
              className={`${styles.label} text-sm font-medium uppercase tracking-wide`}
            >
              {label}
            </p>
          </div>
          {description && (
            <p className="hidden sm:block text-[#E4C55B]/60 text-xs max-w-[140px] text-right">
              {description}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl p-5 sm:p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${styles.container} ${className}`}
    >
      {/* Subtle Hover Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <div
            className={`p-2 sm:p-2.5 rounded-xl ${styles.icon} transition-all duration-300 group-hover:scale-110 group-hover:bg-[#D4AF37]/20`}
          >
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          {/* Mini Chart/Trend Indicator */}
          <div className="flex items-end gap-0.5 h-6">
            {[40, 65, 45, 80, 60].map((h, i) => (
              <div
                key={i}
                className="w-1 bg-white/20 rounded-full group-hover:bg-[#D4AF37]/40 transition-all duration-300"
                style={{ height: `${h}%`, transitionDelay: `${i * 50}ms` }}
              />
            ))}
          </div>
        </div>
        <p
          className={`font-bold ${styles.value} mb-1 tracking-tight transition-colors duration-300 group-hover:text-[#E4C55B]`}
        >
          {value}
        </p>
        <p
          className={`${styles.label} text-xs sm:text-sm font-medium uppercase tracking-wide`}
        >
          {label}
        </p>
      </div>
    </div>
  );
}
