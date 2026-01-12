import Link from "next/link";
import { ArrowRight } from "iconoir-react";
import { Button } from "@/components/ui/button";

// Server Component - No Framer Motion, CSS animations only
export default function CTASection() {
  return (
    <section className="pt-8 pb-32 lg:pb-40 bg-slate-50 relative overflow-hidden font-sedan">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 bg-fixed"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Floating Glow - CSS animation */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[400px] bg-[#D4AF37]/20 blur-[100px] rounded-full -z-10 animate-pulse-slow" />

        <div className="animate-on-scroll">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 sm:p-14 lg:p-20 relative overflow-hidden shadow-2xl shadow-slate-900/20 group border border-slate-800 hover:scale-[1.01] transition-transform duration-300">
            {/* Card Background Effects */}
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#D4AF37]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-full text-[#E4C55B] text-xs sm:text-sm font-bold tracking-wide uppercase mb-8 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                Bergabung Sekarang
              </div>

              <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                Siap Berkontribusi untuk <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4C55B] to-[#D4AF37]">
                  Energi Negeri?
                </span>
              </h3>

              <p className="text-lg sm:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Jadilah bagian dari transformasi digital pemantauan
                infrastruktur penerangan jalan yang lebih efisien, transparan,
                dan akuntabel.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login" className="w-full sm:w-auto">
                  <Button
                    size="xl"
                    className="w-full sm:w-auto h-14 px-8 bg-gradient-to-r from-[#D4AF37] to-[#E4C55B] hover:from-[#E4C55B] hover:to-[#D4AF37] text-primary-900 font-bold text-lg rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(212,175,55,0.5)] hover:scale-105 active:scale-95"
                  >
                    Mulai Monitoring
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link
                  href="https://www.esdm.go.id"
                  target="_blank"
                  className="w-full sm:w-auto"
                >
                  <Button
                    size="xl"
                    variant="ghost"
                    className="w-full sm:w-auto h-14 px-8 text-slate-300 hover:text-white hover:bg-white/5 font-medium text-lg rounded-xl border border-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all"
                  >
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
