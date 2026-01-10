import Link from "next/link";
import Image from "next/image";
import {
  LightBulb,
  MapPin,
  StatsReport,
  ShieldCheck,
  Activity,
  Flash,
  ArrowRight,
} from "iconoir-react";
import { Button } from "@/components/ui/button";

// Server Component - No "use client" = Zero JS for static content
export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-esdm-gradient min-h-[90vh] flex flex-col font-sedan">
      {/* Background Pattern - Optimized with will-change */}
      <div className="absolute inset-0">
        <div
          className="absolute inset-0 opacity-10 will-change-transform"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/50 to-primary-950/90" />

        {/* CSS-only Animated Gradient Orbs - No JS needed */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse-slower" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col pb-28 lg:pb-40">
        {/* Navbar - CSS animation */}
        <nav className="flex items-center justify-between py-6 lg:py-8 animate-fade-in-down">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
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

        {/* Hero Content - CSS stagger animations */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center flex-grow py-8 lg:py-0">
          <div className="flex flex-col items-start text-left">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full text-amber-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8 backdrop-blur-sm shadow-xl animate-fade-in-up animation-delay-100">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              Sistem Monitoring Real-time
            </div>

            {/* Title - LCP element, no animation delay */}
            <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight animate-fade-in-up animation-delay-200">
              Monitoring <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                PJUTS
              </span>{" "}
              Nasional
            </h2>

            <p className="text-base sm:text-lg lg:text-xl text-primary-100 mb-8 sm:mb-10 max-w-xl leading-relaxed animate-fade-in-up animation-delay-300">
              Platform terintegrasi Kementerian ESDM untuk pemantauan,
              pelaporan, dan analisis kinerja{" "}
              <span className="text-amber-300 font-semibold">
                Penerangan Jalan Umum Tenaga Surya
              </span>{" "}
              di seluruh Indonesia.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto animate-fade-in-up animation-delay-400">
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

            {/* Trust Indicators */}
            <div className="mt-10 sm:mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10 w-full animate-fade-in-up animation-delay-500">
              <TrustIndicator
                icon={ShieldCheck}
                title="Data Aman"
                subtitle="Enkripsi AES-256"
              />
              <TrustIndicator
                icon={Activity}
                title="Reliabel"
                subtitle="99.9% Uptime SLA"
              />
              <TrustIndicator
                icon={Flash}
                title="Real-time"
                subtitle="Sync < 1 Detik"
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </div>

          {/* Stats Grid - CSS stagger */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-8 lg:mt-0">
            <StatsCard
              value="12,500+"
              label="Unit Terpasang"
              icon={LightBulb}
              className="animate-fade-in-up animation-delay-400"
            />
            <StatsCard
              value="34"
              label="Provinsi"
              icon={MapPin}
              className="lg:translate-y-8 animate-fade-in-up animation-delay-500"
            />
            <StatsCard
              value="50k+"
              label="Laporan Masuk"
              icon={StatsReport}
              className="animate-fade-in-up animation-delay-600"
            />
            <StatsCard
              value="24/7"
              label="Monitoring Aktif"
              icon={Flash}
              className="lg:translate-y-8 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30 animate-fade-in-up animation-delay-700"
              valueColor="text-amber-400"
            />
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
      </div>
    </section>
  );
}

function TrustIndicator({
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
      <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-amber-500/50 shadow-lg shadow-black/10">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-amber-400" />
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
  icon: Icon,
  className = "",
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
