"use client";

import {
  MapPin,
  SmartphoneDevice,
  StatsReport,
  Wifi,
  Shield,
  LightBulb,
  ArrowRight,
} from "iconoir-react";
import { FadeIn, StaggerContainer, FadeInItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export default function FeaturesSection() {
  return (
    <section
      id="features"
      className="pt-8 pb-24 lg:pt-12 lg:pb-32 relative overflow-hidden bg-slate-50/50"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 bg-fixed"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          maskImage: "linear-gradient(to bottom, transparent 0%, black 400px)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 400px)",
        }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto -mt-8 lg:-mt-12">
          <FadeIn direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 border border-amber-200 text-amber-700 text-xs font-medium uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Fitur Utama
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Teknologi Monitoring{" "}
              <span className="text-amber-600">Terdepan</span>
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-lg text-slate-700 leading-relaxed">
              Dikembangkan khusus untuk kebutuhan Kementerian ESDM dalam
              mengelola infrastruktur penerangan jalan tenaga surya secara
              efisien dan transparan.
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 auto-rows-[minmax(220px,auto)] md:auto-rows-[minmax(280px,auto)]">
          <FadeInItem className="col-span-1 md:col-span-2 lg:col-span-2">
            <FeatureCard
              icon={MapPin}
              title="Peta Interaktif Nasional"
              description="Visualisasi sebaran unit PJUTS di seluruh Indonesia dengan clustering cerdas dan status operasional real-time."
              variant="blue"
              className="h-full"
              highlight
            />
          </FadeInItem>
          <FadeInItem className="col-span-1">
            <FeatureCard
              icon={SmartphoneDevice}
              title="Aplikasi Lapangan"
              description="Antarmuka responsif untuk pelaporan petugas dari lokasi."
              variant="amber"
              className="h-full"
            />
          </FadeInItem>
          <FadeInItem className="col-span-1">
            <FeatureCard
              icon={StatsReport}
              title="Analitik Data"
              description="Dashboard eksekutif dengan KPI dan statistik cerdas."
              variant="blue"
              className="h-full"
            />
          </FadeInItem>

          <FadeInItem className="col-span-1">
            <FeatureCard
              icon={Wifi}
              title="Mode Offline"
              description="Operasional penuh tanpa sinyal dengan auto-sync."
              variant="slate"
              className="h-full"
            />
          </FadeInItem>
          <FadeInItem className="col-span-1">
            <FeatureCard
              icon={Shield}
              title="Keamanan Data"
              description="Enkripsi berlapis untuk menjamin keamanan informasi vital."
              variant="slate"
              className="h-full"
            />
          </FadeInItem>
          <FadeInItem className="col-span-1 md:col-span-2 lg:col-span-2">
            <FeatureCard
              icon={LightBulb}
              title="Manajemen Aset Terpadu"
              description="Siklus hidup lengkap unit PJUTS mulai dari instalasi, perawatan berkala, hingga penggantian komponen secara terintegrasi."
              variant="amber"
              className="h-full"
              highlight
            />
          </FadeInItem>
        </StaggerContainer>
      </div>
    </section>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  variant = "blue",
  className,
  highlight = false,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: "blue" | "amber" | "slate";
  className?: string;
  highlight?: boolean;
}) {
  const styles = {
    blue: {
      bg: "bg-blue-50/50",
      icon: "text-blue-600 bg-blue-100",
      border: "hover:border-blue-200",
      glow: "group-hover:shadow-blue-500/10",
    },
    amber: {
      bg: "bg-amber-50/50",
      icon: "text-amber-600 bg-amber-100",
      border: "hover:border-amber-200",
      glow: "group-hover:shadow-amber-500/10",
    },
    slate: {
      bg: "bg-slate-50/50",
      icon: "text-slate-600 bg-slate-100",
      border: "hover:border-slate-200",
      glow: "group-hover:shadow-slate-500/10",
    },
  };

  const style = styles[variant];

  return (
    <div
      className={cn(
        "group relative bg-white rounded-3xl p-8 border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden",
        style.border,
        style.glow,
        className
      )}
    >
      {/* Background Glow */}
      <div
        className={cn(
          "absolute -right-20 -top-20 w-64 h-64 rounded-full blur-[80px] transition-all duration-500 opacity-0 group-hover:opacity-70 pointer-events-none",
          variant === "blue" && "bg-blue-100/50",
          variant === "amber" && "bg-amber-100/50",
          variant === "slate" && "bg-slate-100/50"
        )}
      />

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110",
              style.icon
            )}
          >
            <Icon className="w-6 h-6" />
          </div>
          {highlight && (
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-x-2 group-hover:translate-x-0">
              <ArrowRight className="w-5 h-5 text-slate-300" />
            </div>
          )}
        </div>

        <div className="mt-auto">
          <h3
            className={cn(
              "font-bold text-slate-900 mb-3 tracking-tight group-hover:text-primary-600 transition-colors",
              highlight ? "text-2xl" : "text-xl"
            )}
          >
            {title}
          </h3>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
