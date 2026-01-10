import {
  MapPin,
  SmartphoneDevice,
  StatsReport,
  Wifi,
  Shield,
  LightBulb,
  ArrowUpRight,
} from "iconoir-react";
import { cn } from "@/lib/utils";

// Server Component - No Framer Motion needed
export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="pt-8 pb-24 lg:pt-12 lg:pb-32 relative overflow-hidden bg-slate-50/50 font-sedan"
    >
      {/* Background Pattern - Static, GPU accelerated */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 400px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 400px)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto -mt-8 lg:-mt-12 animate-on-scroll">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium uppercase tracking-wider mb-4">
            <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
            Fitur Utama
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            Teknologi Monitoring{" "}
            <span className="text-[#D4AF37]">Terdepan</span>
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed">
            Dikembangkan khusus untuk kebutuhan Kementerian ESDM dalam mengelola
            infrastruktur penerangan jalan tenaga surya secara efisien dan
            transparan.
          </p>
        </div>

        {/* Feature Grid - Clean Layout */}
        <div className="space-y-6">
          {/* Top Hero Card */}
          <div className="animate-on-scroll">
            <FeatureCard
              icon={MapPin}
              title="Peta Interaktif Nasional"
              description="Visualisasi sebaran unit PJUTS di seluruh Indonesia dengan clustering cerdas dan status operasional real-time. Lihat kondisi infrastruktur secara langsung dari dashboard."
              variant="hero"
              features={["Clustering Cerdas", "Real-time Status", "Filter Provinsi"]}
            />
          </div>
          
          {/* 4-Column Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <div className="animate-on-scroll">
              <FeatureCard
                icon={SmartphoneDevice}
                title="Aplikasi Lapangan"
                description="Antarmuka responsif untuk pelaporan petugas dari lokasi manapun."
                variant="slate"
                stat={{ value: "PWA", label: "Ready" }}
              />
            </div>
            
            <div className="animate-on-scroll">
              <FeatureCard
                icon={StatsReport}
                title="Analitik Data"
                description="Dashboard eksekutif dengan KPI dan statistik cerdas untuk pengambilan keputusan."
                variant="slate"
                stat={{ value: "50+", label: "Metrik" }}
              />
            </div>
            
            <div className="animate-on-scroll">
              <FeatureCard
                icon={Wifi}
                title="Mode Offline"
                description="Operasional penuh tanpa koneksi internet dengan auto-sync saat online."
                variant="slate"
                stat={{ value: "100%", label: "Uptime" }}
              />
            </div>
            
            <div className="animate-on-scroll">
              <FeatureCard
                icon={Shield}
                title="Keamanan Data"
                description="Enkripsi berlapis AES-256 untuk menjamin keamanan informasi vital."
                variant="slate"
                stat={{ value: "AES", label: "256-bit" }}
              />
            </div>
          </div>
          
          {/* Bottom Hero Card */}
          <div className="animate-on-scroll">
            <FeatureCard
              icon={LightBulb}
              title="Manajemen Aset Terpadu"
              description="Siklus hidup lengkap unit PJUTS mulai dari instalasi, perawatan berkala, hingga penggantian komponen secara terintegrasi dalam satu platform."
              variant="hero-amber"
              features={["Lifecycle Tracking", "Maintenance Alerts", "Component History"]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "blue",
  features,
  stat,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: "blue" | "amber" | "slate" | "hero" | "hero-amber";
  features?: string[];
  stat?: { value: string; label: string };
}) {
  const isHero = variant === "hero" || variant === "hero-amber";
  
  const styles = {
    blue: {
      bg: "bg-gradient-to-br from-white to-primary-50/40",
      border: "border-primary-100 hover:border-primary-300",
      iconBg: "bg-gradient-to-br from-primary-600 to-primary-700 shadow-lg shadow-primary-600/25",
      iconColor: "text-white",
      accent: "bg-primary-600",
      glow: "from-primary-400/20 to-transparent",
      statBg: "bg-primary-50 ring-1 ring-primary-200/50",
      statColor: "text-primary-700",
    },
    amber: {
      bg: "bg-gradient-to-br from-white to-[#D4AF37]/5",
      border: "border-[#D4AF37]/20 hover:border-[#D4AF37]/40",
      iconBg: "bg-gradient-to-br from-[#D4AF37] to-[#E4C55B] shadow-lg shadow-[#D4AF37]/25",
      iconColor: "text-primary-900",
      accent: "bg-[#D4AF37]",
      glow: "from-[#D4AF37]/20 to-transparent",
      statBg: "bg-[#D4AF37]/10 ring-1 ring-[#D4AF37]/30",
      statColor: "text-[#D4AF37]",
    },
    slate: {
      bg: "bg-gradient-to-br from-white to-slate-50/50",
      border: "border-slate-200/80 hover:border-primary-200",
      iconBg: "bg-gradient-to-br from-primary-800 to-primary-900 shadow-lg shadow-primary-900/25",
      iconColor: "text-white",
      accent: "bg-primary-800",
      glow: "from-primary-400/15 to-transparent",
      statBg: "bg-primary-50/50 ring-1 ring-primary-100",
      statColor: "text-primary-700",
    },
    hero: {
      bg: "bg-gradient-to-br from-primary-700 via-primary-800 to-primary-900",
      border: "border-primary-600/50 hover:border-primary-500/70",
      iconBg: "bg-white/15 backdrop-blur-sm ring-2 ring-white/25",
      iconColor: "text-white",
      accent: "bg-[#D4AF37]",
      glow: "from-[#D4AF37]/20 to-transparent",
      statBg: "bg-white/10",
      statColor: "text-white",
    },
    "hero-amber": {
      bg: "bg-gradient-to-br from-[#D4AF37] via-[#E4C55B] to-primary-800",
      border: "border-[#D4AF37]/50 hover:border-[#E4C55B]/70",
      iconBg: "bg-white/15 backdrop-blur-sm ring-2 ring-white/25",
      iconColor: "text-white",
      accent: "bg-white",
      glow: "from-white/20 to-transparent",
      statBg: "bg-white/10",
      statColor: "text-white",
    },
  };

  const s = styles[variant];

  if (isHero) {
    return (
      <div
        className={cn(
          "group relative h-full overflow-hidden rounded-3xl border transition-all duration-500",
          "hover:shadow-2xl hover:shadow-primary-900/20 hover:-translate-y-1",
          s.bg,
          s.border,
          "p-8 lg:p-10"
        )}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-56 h-56 bg-primary-400/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />
        
        {/* Corner Accent - Amber to match Hero */}
        <div className={cn("absolute top-0 left-0 w-32 h-1.5 rounded-r-full", s.accent)} />
        
        {/* Decorative Corner Shapes */}
        <div className="absolute top-6 right-6 flex items-center gap-2 opacity-60">
          <span className="w-2 h-2 rounded-full bg-[#D4AF37]/60 animate-pulse" />
          <span className="w-8 h-1 rounded-full bg-white/30" />
          <span className="w-4 h-1 rounded-full bg-white/20" />
        </div>

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:gap-12 h-full">
          <div className="lg:flex-1">
            {/* Icon */}
            <div
              className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3",
                s.iconBg
              )}
            >
              <Icon className={cn("w-8 h-8", s.iconColor)} />
            </div>

            {/* Title */}
            <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4 tracking-tight">
              {title}
            </h3>
            
            {/* Description */}
            <p className="text-primary-100/90 text-base lg:text-lg leading-relaxed mb-6">
              {description}
            </p>
            
            {/* Features Pills - Amber accent like Hero CTA */}
            {features && (
              <div className="flex flex-wrap gap-2">
                {features.map((feature, i) => (
                  <span
                    key={i}
                    className={cn(
                      "px-4 py-2 text-xs font-semibold rounded-full backdrop-blur-sm border transition-all duration-300",
                      variant === "hero-amber" 
                        ? "bg-white/20 text-white border-white/25 hover:bg-white/30"
                        : "bg-[#D4AF37]/20 text-[#E4C55B] border-[#D4AF37]/30 hover:bg-[#D4AF37]/30 hover:border-[#D4AF37]/50"
                    )}
                  >
                    {feature}
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Decorative Side Element */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Rotating border */}
              <div className={cn(
                "w-36 h-36 rounded-3xl border-2 border-dashed rotate-12 transition-transform duration-700 group-hover:rotate-45",
                variant === "hero-amber" ? "border-white/20" : "border-[#D4AF37]/30"
              )} />
              {/* Inner shape */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={cn(
                  "w-20 h-20 rounded-2xl backdrop-blur-sm flex items-center justify-center",
                  variant === "hero-amber" ? "bg-white/10" : "bg-[#D4AF37]/10"
                )}>
                  <Icon className={cn(
                    "w-10 h-10",
                    variant === "hero-amber" ? "text-white/50" : "text-[#E4C55B]/60"
                  )} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Regular card variant
  return (
    <div
      className={cn(
        "group relative h-full overflow-hidden rounded-2xl border transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary-900/10 hover:-translate-y-1",
        s.bg,
        s.border,
        "p-6 lg:p-7"
      )}
    >
      {/* Gradient Glow on Hover */}
      <div className={cn(
        "absolute -top-16 -right-16 w-32 h-32 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-radial",
        s.glow
      )} />
      
      {/* Subtle top accent line */}
      <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-primary-200/50 to-transparent opacity-60" />

      <div className="relative flex flex-col h-full">
        {/* Icon */}
        <div
          className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3",
            s.iconBg
          )}
        >
          <Icon className={cn("w-6 h-6", s.iconColor)} />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-primary-900 mb-2 tracking-tight group-hover:text-primary-800">
          {title}
        </h3>
        
        {/* Description */}
        <p className="text-primary-600/70 text-sm leading-relaxed flex-grow">
          {description}
        </p>
        
        {/* Stat Badge */}
        {stat && (
          <div className="mt-5 pt-5 border-t border-primary-100/60 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("px-3 py-1.5 rounded-lg", s.statBg)}>
                <span className={cn("text-sm font-bold", s.statColor)}>{stat.value}</span>
              </div>
              <span className="text-xs text-primary-400 uppercase tracking-wider font-medium">{stat.label}</span>
            </div>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center bg-primary-50 border border-primary-100",
              "opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0 -translate-x-2 group-hover:bg-primary-900 group-hover:border-primary-900"
            )}>
              <ArrowUpRight className="w-4 h-4 text-primary-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
