import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  Lightbulb,
  MapPin,
  BarChart3,
  Shield,
  Smartphone,
  Wifi,
  ArrowRight,
  CheckCircle2,
  Activity,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function HomePage() {
  const session = await auth();

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-400/30">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-esdm-gradient min-h-[90vh] flex flex-col">
        {/* Background Pattern */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/50 to-primary-950/90" />

          {/* Animated Gradient Orbs */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 -left-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-grow flex flex-col pb-28 lg:pb-40">
          {/* Navbar */}
          <nav className="flex items-center justify-between py-6 lg:py-8 animate-fade-in">
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

          {/* Hero Content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center flex-grow py-8 lg:py-0">
            <div className="animate-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/5 border border-white/10 rounded-full text-amber-300 text-xs sm:text-sm font-medium mb-6 sm:mb-8 backdrop-blur-sm shadow-xl">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                Sistem Monitoring Real-time
              </div>

              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-bold text-white leading-tight mb-6 tracking-tight">
                Monitoring <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                  PJUTS
                </span>{" "}
                Nasional
              </h2>

              <p className="text-base sm:text-lg lg:text-xl text-primary-100 mb-8 sm:mb-10 max-w-xl leading-relaxed opacity-90">
                Platform terintegrasi Kementerian ESDM untuk pemantauan, pelaporan, dan analisis kinerja
                Penerangan Jalan Umum Tenaga Surya di seluruh Indonesia.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-primary-950 font-bold shadow-amber-900/20 shadow-lg border-b-4 border-amber-600 active:border-b-0 active:translate-y-1 transition-all">
                    Mulai Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#features" className="w-full sm:w-auto">
                  <Button size="xl" variant="outline" className="w-full sm:w-auto bg-white/5 backdrop-blur-md border-white/20 text-white hover:bg-white/10 hover:border-white/40 shadow-lg">
                    Pelajari Sistem
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="mt-10 sm:mt-12 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 relative z-10">
                <div className="flex items-center gap-3 group">
                  <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-amber-500/50 shadow-lg shadow-black/10">
                    <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight mb-0.5 tracking-wide">Data Aman</span>
                    <span className="text-[10px] sm:text-[11px] text-primary-200/80 font-medium uppercase tracking-wider">Enkripsi AES-256</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 group">
                  <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-amber-500/50 shadow-lg shadow-black/10">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight mb-0.5 tracking-wide">Reliabel</span>
                    <span className="text-[10px] sm:text-[11px] text-primary-200/80 font-medium uppercase tracking-wider">99.9% Uptime SLA</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 group col-span-2 sm:col-span-1">
                  <div className="p-2 sm:p-2.5 bg-white/10 rounded-xl group-hover:bg-amber-500/20 transition-all duration-300 ring-1 ring-white/10 group-hover:scale-110 group-hover:ring-amber-500/50 shadow-lg shadow-black/10">
                    <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 group-hover:text-amber-400" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-white leading-tight mb-0.5 tracking-wide">Real-time</span>
                    <span className="text-[10px] sm:text-[11px] text-primary-200/80 font-medium uppercase tracking-wider">Sync &lt; 1 Detik</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Visualization */}
            <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-slide-up mt-8 lg:mt-0" style={{ animationDelay: "0.3s" }}>
              <StatsCard
                value="12,500+"
                label="Unit Terpasang"
                icon={Lightbulb}
                delay="0.4s"
              />
              <StatsCard
                value="34"
                label="Provinsi"
                icon={MapPin}
                delay="0.5s"
                className="lg:translate-y-8"
              />
              <StatsCard
                value="50k+"
                label="Laporan Masuk"
                icon={BarChart3}
                delay="0.6s"
              />
              <StatsCard
                value="24/7"
                label="Monitoring Aktif"
                icon={Zap}
                delay="0.7s"
                className="lg:translate-y-8 bg-gradient-to-br from-amber-500/20 to-amber-600/20 border-amber-500/30"
                valueColor="text-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none">
          <svg className="relative block w-[calc(100%+1.3px)] h-full" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="pt-24 pb-24 lg:pt-32 lg:pb-32 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h3 className="text-amber-600 font-bold tracking-wider uppercase text-sm mb-3">Fitur Utama</h3>
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
              Teknologi Monitoring Terdepan
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Dikembangkan khusus untuk kebutuhan Kementerian ESDM dalam mengelola
              infrastruktur penerangan jalan tenaga surya secara efisien dan transparan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={MapPin}
              title="Peta Interaktif Nasional"
              description="Visualisasi sebaran unit PJUTS di seluruh Indonesia dengan clustering cerdas dan status operasional real-time."
              variant="blue"
            />
            <FeatureCard
              icon={Smartphone}
              title="Aplikasi Lapangan Mobile"
              description="Antarmuka responsif yang memudahkan petugas lapangan melakukan pelaporan dan update status dari lokasi."
              variant="amber"
            />
            <FeatureCard
              icon={BarChart3}
              title="Analitik & Pelaporan"
              description="Dashboard eksekutif dengan KPI, grafik tren, dan statistik per wilayah untuk dukungan pengambilan keputusan."
              variant="blue"
            />
            <FeatureCard
              icon={Wifi}
              title="Mode Offline Cerdas"
              description="Kemampuan operasional penuh di area tanpa sinyal dengan sinkronisasi otomatis saat koneksi tersedia kembali."
              variant="slate"
            />
            <FeatureCard
              icon={Shield}
              title="Keamanan Tingkat Lanjut"
              description="Sistem autentikasi berlapis dan enkripsi data untuk menjamin keamanan informasi infrastruktur vital."
              variant="slate"
            />
            <FeatureCard
              icon={Lightbulb}
              title="Manajemen Aset Terpadu"
              description="Siklus hidup lengkap unit PJUTS mulai dari instalasi, perawatan berkala, hingga penggantian komponen."
              variant="amber"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      {/* How It Works - Bento Style */}
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
        </div>

        {/* BG Decoration */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-5" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-900/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h3 className="text-amber-400 font-bold tracking-wider uppercase text-sm mb-3">Workflow Sistem</h3>
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">
                Mekanisme Pelaporan Terpadu
              </h2>
              <p className="text-lg text-slate-400">
                Alur kerja digital yang menyederhanakan proses monitoring lapangan menjadi langkah-langkah efisien.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(180px,auto)]">
            {/* Step 1: Identifikasi - Large Card */}
            <div className="md:col-span-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
              <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                <MapPin className="w-32 h-32 sm:w-48 sm:h-48 text-white" />
              </div>
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-6 font-bold text-base sm:text-lg border border-blue-500/30">01</div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">Identifikasi Aset</h3>
                  <p className="text-sm sm:text-base text-slate-400 max-w-md">
                    Temukan unit PJUTS dengan mudah melalui pemindaian QR Code fisik atau pencarian ID digital pada peta interaktif yang terintegrasi dengan GPS.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2: Dokumentasi - Tall Card */}
            <div className="md:row-span-2 bg-slate-800 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
              <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:rotate-12 duration-700">
                <Smartphone className="w-48 h-48 sm:w-64 sm:h-64 text-white" />
              </div>
              <div className="relative z-10 h-full flex flex-col">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-6 font-bold text-base sm:text-lg border border-amber-500/30">02</div>
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-4 group-hover:text-amber-400 transition-colors">Dokumentasi Digital</h3>
                <p className="text-sm sm:text-base text-slate-400 mb-8 flex-grow">
                  Ambil foto kondisi fisik unit secara langsung melalui aplikasi. Sistem otomatis menyematkan metadata lokasi (geotagging) dan waktu pengambilan untuk validitas data yang tak terbantahkan.
                </p>
                <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 backdrop-blur-sm">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs font-mono text-slate-300">GPS: -6.2088, 106.8456</span>
                  </div>
                  <div className="h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 bg-amber-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3: Input Data */}
            <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-base sm:text-lg border border-purple-500/30">03</div>
                  <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 group-hover:text-purple-400 transition-colors" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">Input Parameter</h3>
                <p className="text-slate-400 text-sm">
                  Lengkapi formulir teknis yang responsif: tegangan baterai, daya load, dan status operasional komponen.
                </p>
              </div>
            </div>

            {/* Step 4: Sinkronisasi */}
            <div className="bg-slate-800 rounded-3xl p-6 sm:p-8 border border-white/5 relative overflow-hidden group hover:border-amber-500/30 transition-all duration-500">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-base sm:text-lg border border-emerald-500/30">04</div>
                  <CheckCircle2 className="w-6 h-6 sm:w-8 sm:h-8 text-slate-600 group-hover:text-emerald-400 transition-colors" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">Real-time Sync</h3>
                <p className="text-slate-400 text-sm">
                  Data terkirim instan ke server pusat ESDM. Dashboard analitik langsung diperbarui untuk pemantauan nasional.
                </p>
              </div>
            </div>

          </div>
        </div>
        {/* Bottom Wave Transition */}
        <div className="absolute bottom-0 left-0 right-0 h-24 lg:h-32 w-full overflow-hidden leading-none z-20 pointer-events-none">
          <svg className="relative block w-[calc(100%+1.3px)] h-full" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" className="fill-slate-50"></path>
          </svg>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-8 pb-32 lg:pb-40 bg-slate-50 relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Floating Glow Behind Card */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[400px] bg-amber-400/20 blur-[100px] rounded-full -z-10" />

          <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl shadow-slate-900/20 group border border-slate-800">
            {/* Card Background Pattern */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-amber-400 text-xs sm:text-sm font-bold tracking-wide uppercase mb-8 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Bergabung Sekarang
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Siap Berkontribusi untuk <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">Energi Negeri?</span>
              </h3>

              <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Jadilah bagian dari transformasi digital pemantauan infrastruktur penerangan jalan yang lebih efisien, transparan, dan akuntabel.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button size="xl" className="w-full sm:w-auto h-14 px-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg rounded-xl transition-all hover:scale-105 shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
                    Mulai Monitoring
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="https://www.esdm.go.id" target="_blank" className="w-full sm:w-auto">
                  <Button size="xl" variant="ghost" className="w-full sm:w-auto h-14 px-8 text-slate-300 hover:text-white hover:bg-white/5 font-medium text-lg rounded-xl border border-white/10 hover:border-white/20">
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={48}
                height={48}
                className="w-10 h-10 object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
              />
              <div className="text-left">
                <h4 className="font-bold text-slate-900">PJUTS ESDM</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Kementerian Energi dan Sumber Daya Mineral
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-slate-500 font-medium">
              <span>© {new Date().getFullYear()} ESDM RI</span>
              <Link href="#" className="hover:text-primary-600 transition-colors">Kebijakan Privasi</Link>
              <Link href="#" className="hover:text-primary-600 transition-colors">Bantuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
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
    <div className="group bg-white rounded-2xl p-8 shadow-sm border border-slate-100 hover:shadow-xl hover:border-slate-200 transition-all duration-300 hover:-translate-y-1">
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

function StatsCard({
  value,
  label,
  icon: Icon,
  className,
  delay,
  valueColor = "text-white"
}: {
  value: string,
  label: string,
  icon: React.ElementType;
  className?: string,
  delay?: string,
  valueColor?: string
}) {
  return (
    <div
      className={`bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-lg hover:bg-white/15 transition-colors ${className}`}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-white/10 rounded-lg">
          <Icon className="w-6 h-6 text-amber-400" />
        </div>
        {/* Sparkline decoration could go here */}
      </div>
      <p className={`text-4xl font-bold ${valueColor} mb-1 tracking-tight`}>{value}</p>
      <p className="text-primary-200 text-sm font-medium uppercase tracking-wide">{label}</p>
    </div>
  );
}
