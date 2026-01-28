/**
 * Solutions section updated with ESDM-specific information.
 * Supports ID/EN language switching.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/language-context";

export const Solutions = () => {
  const { t } = useLanguage();

  const workflows = [
    {
      num: "01.",
      titleKey: "solutions.census",
      descKey: "solutions.census_desc",
    },
    {
      num: "02.",
      titleKey: "solutions.iot",
      descKey: "solutions.iot_desc",
    },
    {
      num: "03.",
      titleKey: "solutions.verification",
      descKey: "solutions.verification_desc",
    },
  ];

  return (
    <section
      id="alur-kerja"
      className="pt-40 pb-32 px-6 bg-primary text-white overflow-hidden relative"
    >
      {/* Abstract Background Design */}
      <div className="absolute top-0 right-0 w-2/3 h-full opacity-[0.03] pointer-events-none">
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full stroke-white fill-none"
        >
          <path d="M0 50 Q 25 25, 50 50 T 100 50" strokeWidth="0.1" />
          <path d="M0 60 Q 25 35, 50 60 T 100 60" strokeWidth="0.1" />
          <path d="M0 40 Q 25 15, 50 40 T 100 40" strokeWidth="0.1" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-12">
          <h2 className="text-5xl md:text-8xl font-bold tracking-tight max-w-3xl leading-[0.9] text-white">
            {t("solutions.title_1")} <br />
            <span className="text-accent">{t("solutions.title_2")}</span>{" "}
            {t("solutions.title_3")}
          </h2>
          <p className="text-white/40 max-w-xs text-sm leading-relaxed font-medium">
            {t("solutions.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-white/10 border border-white/20 rounded-[56px] overflow-hidden backdrop-blur-sm">
          {workflows.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-16 hover:bg-white/5 transition-all group border-r border-white/10 last:border-0"
            >
              <div className="flex justify-between items-center mb-16">
                <span className="text-3xl font-bold text-accent/40 group-hover:text-accent transition-colors">
                  {item.num}
                </span>
                <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-accent group-hover:border-transparent transition-all duration-500">
                  <div className="w-2 h-2 bg-white rounded-full group-hover:scale-150 transition-transform" />
                </div>
              </div>
              <h3 className="text-3xl font-bold mb-8 leading-tight">
                {t(item.titleKey)}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed group-hover:text-white/60 transition-colors font-medium">
                {t(item.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
