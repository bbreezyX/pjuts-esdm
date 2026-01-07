import Link from "next/link";
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
} from "lucide-react";

export default async function HomePage() {
  const session = await auth();

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-esdm-gradient">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <nav className="flex items-center justify-between mb-16">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
                <Lightbulb className="w-7 h-7 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  PJUTS <span className="text-amber-400">ESDM</span>
                </h1>
                <p className="text-xs text-blue-200">Kementerian ESDM RI</p>
              </div>
            </div>
            <Link
              href="/login"
              className="px-5 py-2.5 bg-white text-primary-700 rounded-lg font-semibold text-sm hover:bg-amber-50 transition-colors"
            >
              Masuk
            </Link>
          </nav>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-400/20 rounded-full text-amber-300 text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Sistem Monitoring Real-time
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
                Sistem Monitoring{" "}
                <span className="text-amber-400">Penerangan Jalan</span> Umum
                Tenaga Surya
              </h2>
              <p className="text-lg text-blue-100 mb-8 max-w-xl">
                Platform terpadu untuk monitoring dan pelaporan unit PJUTS di
                seluruh Indonesia. Pantau status, kelola laporan, dan analisis
                data dengan mudah.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-amber-400 text-primary-900 rounded-xl font-semibold hover:bg-amber-300 transition-colors"
                >
                  Mulai Sekarang
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="#features"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 backdrop-blur text-white rounded-xl font-semibold hover:bg-white/20 transition-colors"
                >
                  Pelajari Lebih Lanjut
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-4xl font-bold text-white mb-1">10,000+</p>
                <p className="text-blue-200">Unit PJUTS Terpasang</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-4xl font-bold text-white mb-1">34</p>
                <p className="text-blue-200">Provinsi Terjangkau</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/10">
                <p className="text-4xl font-bold text-white mb-1">50,000+</p>
                <p className="text-blue-200">Laporan Terkirim</p>
              </div>
              <div className="bg-amber-400/20 backdrop-blur rounded-2xl p-6 border border-amber-400/30">
                <p className="text-4xl font-bold text-amber-400 mb-1">24/7</p>
                <p className="text-amber-200">Monitoring Real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="white"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Fitur Unggulan
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Didesain untuk memudahkan petugas lapangan dan manajemen dalam
              monitoring PJUTS
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={MapPin}
              title="Peta Interaktif"
              description="Visualisasi lokasi seluruh unit PJUTS di Indonesia dengan status real-time dan clustering otomatis"
              color="blue"
            />
            <FeatureCard
              icon={Smartphone}
              title="Mobile-First"
              description="Antarmuka responsif yang optimal untuk petugas lapangan dengan form pelaporan bertahap"
              color="green"
            />
            <FeatureCard
              icon={BarChart3}
              title="Dashboard Analitik"
              description="KPI cards, grafik tren, dan statistik per provinsi untuk pengambilan keputusan"
              color="purple"
            />
            <FeatureCard
              icon={Wifi}
              title="PWA Offline-Ready"
              description="Aplikasi dapat diinstal dan menyimpan data saat offline untuk area dengan sinyal terbatas"
              color="amber"
            />
            <FeatureCard
              icon={Shield}
              title="Autentikasi Aman"
              description="Sistem login dengan role-based access control untuk admin dan petugas lapangan"
              color="red"
            />
            <FeatureCard
              icon={Lightbulb}
              title="Monitoring Status"
              description="Pantau status operasional, kebutuhan perawatan, dan unit offline secara real-time"
              color="cyan"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Cara Kerja
            </h3>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Proses pelaporan yang mudah dalam 4 langkah sederhana
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Pilih Unit",
                description: "Pilih unit PJUTS yang akan dilaporkan dari daftar",
              },
              {
                step: "02",
                title: "Ambil Foto",
                description: "Foto kondisi unit dengan GPS lokasi otomatis",
              },
              {
                step: "03",
                title: "Isi Data",
                description: "Masukkan tegangan baterai dan catatan kondisi",
              },
              {
                step: "04",
                title: "Kirim",
                description: "Laporan terkirim dan status unit diperbarui",
              },
            ].map((item, index) => (
              <div key={item.step} className="text-center">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary-600 text-white font-bold text-xl flex items-center justify-center mx-auto">
                    {item.step}
                  </div>
                  {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-primary-200 -translate-y-1/2" />
                  )}
                </div>
                <h4 className="text-lg font-semibold text-slate-900 mb-2">
                  {item.title}
                </h4>
                <p className="text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-esdm-gradient rounded-3xl p-12 lg:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-40" />
            <div className="relative">
              <h3 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Siap Memulai?
              </h3>
              <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto">
                Bergabung dengan sistem monitoring PJUTS ESDM untuk memantau dan
                melaporkan kondisi penerangan jalan tenaga surya di Indonesia.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-amber-400 text-primary-900 rounded-xl font-semibold text-lg hover:bg-amber-300 transition-colors"
              >
                Masuk ke Sistem
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-white">PJUTS ESDM</h4>
                <p className="text-xs text-slate-400">
                  Kementerian Energi dan Sumber Daya Mineral
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400">
              © {new Date().getFullYear()} Kementerian ESDM RI. Hak Cipta
              Dilindungi.
            </p>
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
  color,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: "blue" | "green" | "purple" | "amber" | "red" | "cyan";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-emerald-100 text-emerald-600",
    purple: "bg-purple-100 text-purple-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
    cyan: "bg-cyan-100 text-cyan-600",
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-slate-200 transition-all group">
      <div
        className={`w-12 h-12 rounded-xl ${colors[color]} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-lg font-semibold text-slate-900 mb-2">{title}</h4>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
