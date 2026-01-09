"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { ScaleIn } from "@/components/ui/motion";

export default function CTASection() {
  return (
    <section className="pt-8 pb-32 lg:pb-40 bg-slate-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#cbd5e140_1px,transparent_1px),linear-gradient(to_bottom,#cbd5e140_1px,transparent_1px)] bg-[size:40px_40px] bg-fixed" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Floating Glow Behind Card */}
          <motion.div 
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full max-h-[400px] bg-amber-400/20 blur-[100px] rounded-full -z-10" 
          />

          <ScaleIn>
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
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="xl" className="w-full sm:w-auto h-14 px-8 bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-lg rounded-xl transition-all shadow-[0_0_40px_-10px_rgba(245,158,11,0.5)]">
                            Mulai Monitoring
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </motion.div>
                    </Link>
                    <Link href="https://www.esdm.go.id" target="_blank" className="w-full sm:w-auto">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button size="xl" variant="ghost" className="w-full sm:w-auto h-14 px-8 text-slate-300 hover:text-white hover:bg-white/5 font-medium text-lg rounded-xl border border-white/10 hover:border-white/20">
                            Pelajari Lebih Lanjut
                        </Button>
                    </motion.div>
                    </Link>
                </div>
                </div>
            </div>
          </ScaleIn>
        </div>
      </section>
  );
}
