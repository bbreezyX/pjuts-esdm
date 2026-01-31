/**
 * Hero section updated with official ESDM content.
 * Supports ID/EN language switching.
 */
"use client";

import { motion } from "framer-motion";
import { ArrowRight, Zap, MapPin, Database, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";

export const Hero = () => {
  const { t } = useLanguage();

  return (
    <section
      id="beranda"
      className="relative min-h-screen flex flex-col justify-center pt-28 pb-10 px-4 md:pt-32 md:pb-16 md:px-6 overflow-hidden bg-primary"
    >
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `url('/grid-pattern.svg')`,
            backgroundSize: '40px 40px'
          }} 
        />
        <div className="absolute top-[-20%] right-[-10%] w-[300px] h-[300px] md:w-[800px] md:h-[800px] bg-accent/15 rounded-full blur-[50px] md:blur-[100px]" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[250px] h-[250px] md:w-[600px] md:h-[600px] bg-blue-500/10 rounded-full blur-[40px] md:blur-[80px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/50 to-primary" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        {/* Mobile Layout: Stack vertically */}
        <div className="flex flex-col lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
          
          {/* Text Content */}
          <div className="text-center lg:text-left order-1">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-accent mb-4 md:mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {t("hero.badge")}
            </motion.div>
            
            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-white leading-tight mb-4 md:mb-6"
            >
              {t("hero.title_1")}{" "}
              <span className="text-white/80">{t("hero.title_2")}</span>{" "}
              <span className="text-accent">{t("hero.title_3")}</span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-sm sm:text-base md:text-lg text-white/60 max-w-md mx-auto lg:mx-0 leading-relaxed mb-6 md:mb-8"
            >
              {t("hero.description")}{" "}
              <span className="text-white font-semibold">
                {t("hero.description_highlight")}
              </span>{" "}
              {t("hero.description_end")}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8 lg:mb-0"
            >
              <Link
                href="/login"
                className="group relative px-6 py-3 bg-accent text-primary rounded-full font-bold text-sm overflow-hidden shadow-lg shadow-accent/20 hover:shadow-xl transition-all"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {t("hero.cta_primary")}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              
              <Link
                href="#alur-kerja"
                className="px-6 py-3 bg-white/5 border border-white/10 text-white rounded-full font-bold text-sm hover:bg-white/10 transition-all flex items-center justify-center"
              >
                {t("hero.cta_secondary")}
              </Link>
            </motion.div>
          </div>

          {/* Visual Content */}
          <div className="order-2 mt-6 lg:mt-0">
            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
            >
              <Image
                src="/illustrations/hero-command.png"
                fill
                className="object-cover"
                alt="ESDM Command Center"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
            </motion.div>

            {/* Running Text / Marquee */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-3 md:mt-4 overflow-hidden rounded-full bg-white/5 border border-white/10"
            >
              <div className="flex animate-marquee-reverse whitespace-nowrap py-2 md:py-2.5">
                {[...Array(2)].map((_, idx) => (
                  <div key={idx} className="flex items-center gap-4 md:gap-6 px-2 md:px-3">
                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-white/70">
                      <Zap className="w-3 h-3 text-accent" />
                      850+ Unit Terpasang
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-white/70">
                      <MapPin className="w-3 h-3 text-accent" />
                      11 Kabupaten/Kota
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-white/70">
                      <Database className="w-3 h-3 text-accent" />
                      Real-time Monitoring
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                    <span className="flex items-center gap-1.5 text-[10px] md:text-xs font-medium text-white/70">
                      <ShieldCheck className="w-3 h-3 text-accent" />
                      Sistem Terintegrasi
                    </span>
                    <span className="w-1 h-1 rounded-full bg-white/30" />
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};
