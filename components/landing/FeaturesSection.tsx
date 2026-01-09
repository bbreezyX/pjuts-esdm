"use client";

import {
  MapPin,
  Smartphone,
  BarChart3,
  Wifi,
  Shield,
  Lightbulb,
} from "lucide-react";
import { FadeIn, StaggerContainer, FadeInItem } from "@/components/ui/motion";

export default function FeaturesSection() {
  return (
    <section id="features" className="pt-24 pb-24 lg:pt-32 lg:pb-32 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <FadeIn direction="up">
            <h3 className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-3">Fitur Utama</h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Teknologi Monitoring Terdepan
            </h2>
          </FadeIn>
          <FadeIn direction="up" delay={0.1}>
            <p className="text-lg text-slate-600 leading-relaxed">
              Dikembangkan khusus untuk kebutuhan Kementerian ESDM dalam mengelola
              infrastruktur penerangan jalan tenaga surya secara efisien dan transparan.
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FadeInItem>
            <FeatureCard
              icon={MapPin}
              title="Peta Interaktif Nasional"
              description="Visualisasi sebaran unit PJUTS di seluruh Indonesia dengan clustering cerdas dan status operasional real-time."
              variant="blue"
            />
            </FadeInItem>
            <FadeInItem>
            <FeatureCard
              icon={Smartphone}
              title="Aplikasi Lapangan Mobile"
              description="Antarmuka responsif yang memudahkan petugas lapangan melakukan pelaporan dan update status dari lokasi."
              variant="amber"
            />
            </FadeInItem>
            <FadeInItem>
            <FeatureCard
              icon={BarChart3}
              title="Analitik & Pelaporan"
              description="Dashboard eksekutif dengan KPI, grafik tren, dan statistik per wilayah untuk dukungan pengambilan keputusan."
              variant="blue"
            />
            </FadeInItem>
            <FadeInItem>
            <FeatureCard
              icon={Wifi}
              title="Mode Offline Cerdas"
              description="Kemampuan operasional penuh di area tanpa sinyal dengan sinkronisasi otomatis saat koneksi tersedia kembali."
              variant="slate"
            />
            </FadeInItem>
            <FadeInItem>
            <FeatureCard
              icon={Shield}
              title="Keamanan Tingkat Lanjut"
              description="Sistem autentikasi berlapis dan enkripsi data untuk menjamin keamanan informasi infrastruktur vital."
              variant="slate"
            />
            </FadeInItem>
            <FadeInItem>
            <FeatureCard
              icon={Lightbulb}
              title="Manajemen Aset Terpadu"
              description="Siklus hidup lengkap unit PJUTS mulai dari instalasi, perawatan berkala, hingga penggantian komponen."
              variant="amber"
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
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  variant?: "blue" | "amber" | "slate";
}) {
  const variants = {
    blue: "bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-500 group-hover:text-white",
    slate: "bg-slate-100 text-slate-600 group-hover:bg-slate-800 group-hover:text-white",
  };

  return (
    <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 h-full">
      <div
        className={`w-14 h-14 rounded-2xl ${variants[variant]} flex items-center justify-center mb-6 transition-colors duration-300`}
      >
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary-700 transition-colors">{title}</h4>
      <p className="text-slate-600 leading-relaxed">{description}</p>
    </div>
  );
}
