/**
 * CTA section for the PJUTS ESDM Landing Page.
 */
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

export const CTA = () => {
  return (
    <section className="pt-40 pb-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-7xl mx-auto bg-primary text-white rounded-[64px] p-16 md:p-24 text-center relative overflow-hidden"
      >
        <div className="relative z-10 max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tighter mb-8 leading-tight text-white">
            Siap Monitoring <br />
            PJUTS <span className="text-accent italic font-serif">Lebih Efisien?</span>
          </h2>
          <p className="text-lg text-white/60 mb-12 max-w-lg mx-auto">
            Bergabunglah dengan ribuan petugas di seluruh Indonesia untuk membangun infrastruktur energi yang lebih baik.
          </p>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/login"
            className="bg-accent text-primary h-16 px-12 inline-flex items-center gap-3 rounded-2xl font-bold text-xl shadow-2xl shadow-accent/40"
          >
            Masuk ke Dashboard
            <ArrowRight className="w-6 h-6" />
          </motion.a>
        </div>

        {/* Decorative SVG Shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 border border-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
      </motion.div>
    </section>
  );
};
