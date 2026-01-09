"use client";

import {
  MapPin,
  Smartphone,
  BarChart3,
  Wifi,
  Shield,
  Lightbulb,
  ArrowRight,
} from "lucide-react";
import { FadeIn, StaggerContainer, FadeInItem } from "@/components/ui/motion";
import { cn } from "@/lib/utils";

export default function FeaturesSection() {
  return (
    <section id="features" className="pt-8 pb-24 lg:pt-12 lg:pb-32 relative overflow-hidden bg-slate-50/50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.4]" />
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 via-transparent to-slate-50/80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <FadeIn direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/50 border border-amber-200 text-amber-700 text-xs font-medium uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              Fitur Utama
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6 tracking-tight">
              Teknologi Monitoring <span className="text-amber-600">Terdepan</span>
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-lg text-slate-600 leading-relaxed">
              Dikembangkan khusus untuk kebutuhan Kementerian ESDM dalam mengelola
              infrastruktur penerangan jalan tenaga surya secara efisien dan transparan.
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 auto-rows-[minmax(280px,auto)]">
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
              icon={Smartphone}
              title="Aplikasi Lapangan"
              description="Antarmuka responsif untuk pelaporan petugas dari lokasi."
              variant="amber"
              className="h-full"
            />
          </FadeInItem>
          <FadeInItem className="col-span-1">
            <FeatureCard
              icon={BarChart3}
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
              icon={Lightbulb}
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
        <div className="flex items-start justify-between mb-6">
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
          <h4 className={cn("font-bold text-slate-900 mb-3 tracking-tight group-hover:text-primary-600 transition-colors", highlight ? "text-2xl" : "text-xl")}>
            {title}
          </h4>
          <p className="text-slate-500 leading-relaxed text-sm lg:text-base">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
