/**
 * FAQ section with frequently asked questions.
 * Supports ID/EN language switching.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";

export const Features = () => {
  const { t } = useLanguage();

  const questions = [
    {
      image: "/illustrations/faq-1.png",
      titleKey: "faq.q1",
      descKey: "faq.a1",
    },
    {
      image: "/illustrations/faq-2.png",
      titleKey: "faq.q2",
      descKey: "faq.a2",
    },
    {
      image: "/illustrations/faq-3.png",
      titleKey: "faq.q3",
      descKey: "faq.a3",
    },
    {
      image: "/illustrations/faq-4.png",
      titleKey: "faq.q4",
      descKey: "faq.a4",
    },
  ];

  return (
    <section
      id="bantuan"
      className="relative pt-40 pb-32 px-6 bg-white overflow-hidden"
    >
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


      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 gap-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-px bg-primary/30"></span>
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/60">
                {t("faq.badge")}
              </span>
            </div>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
              {t("faq.title_1")} <br />
              <span className="text-primary">{t("faq.title_2")}</span>
            </h2>
          </div>
          <button className="relative overflow-hidden bg-primary text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-3 group shadow-[0_0_30px_-10px_rgba(0,51,102,0.5)]">
            <span className="relative z-10 flex items-center gap-2">
              {t("faq.cta")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {questions.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 bg-white/60 backdrop-blur-md rounded-[32px] border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex gap-8 items-start"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-border p-2 group-hover:bg-primary/5 transition-colors relative">
                <Image
                  src={item.image}
                  fill
                  className="object-contain p-2 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 mix-blend-multiply"
                  alt={t(item.titleKey)}
                />
              </div>

              <div className="grow pt-2">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors tracking-tight leading-tight">
                  {t(item.titleKey)}
                </h3>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium opacity-70 group-hover:opacity-100">
                  {t(item.descKey)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
