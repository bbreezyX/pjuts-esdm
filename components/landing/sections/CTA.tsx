/**
 * CTA section for the PJUTS ESDM Landing Page.
 * Supports ID/EN language switching.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const CTA = () => {
  const { t } = useLanguage();

  return (
    <section className="relative pt-40 pb-32 px-6 bg-white overflow-hidden">
      {/* Background Pattern - CSS animation for smooth mobile performance */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute inset-0 animate-dot-drift will-change-transform"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(0, 51, 102, 0.05) 2px, transparent 0)",
            backgroundSize: "40px 40px",
            transform: 'translateZ(0)'
          }}
        />
      </div>


      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto bg-primary text-white rounded-[48px] p-16 md:p-24 text-center relative overflow-hidden shadow-2xl shadow-primary/20 border border-white/10"
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight text-white">
            {t("cta.title_1")} <br />
            {t("cta.title_2")}{" "}
            <span className="text-accent italic font-serif">
              {t("cta.title_3")}
            </span>
          </h2>
          <p className="text-lg text-white/60 mb-12 max-w-lg mx-auto">
            {t("cta.description")}
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/login"
            className="relative overflow-hidden bg-accent text-primary h-16 px-12 inline-flex items-center gap-3 rounded-full font-bold text-xl shadow-[0_0_40px_-10px_rgba(212,175,55,0.5)] hover:shadow-[0_0_60px_-10px_rgba(212,175,55,0.7)] group transition-all duration-300"
          >
            <span className="relative z-10 flex items-center gap-3">
              {t("cta.button")}
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </motion.a>
        </div>

        {/* Decorative SVG Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      </motion.div>
    </section>
  );
};
