/**
 * Challenges section updated with ESDM-specific focus.
 * Supports ID/EN language switching.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { Layout, Shield, FileText, BarChart3 } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Challenges = () => {
  const { t } = useLanguage();

  const coreModules = [
    {
      icon: Layout,
      titleKey: "system.dashboard",
      descKey: "system.dashboard_desc",
    },
    {
      icon: Shield,
      titleKey: "system.security",
      descKey: "system.security_desc",
    },
    {
      icon: FileText,
      titleKey: "system.reporting",
      descKey: "system.reporting_desc",
    },
    {
      icon: BarChart3,
      titleKey: "system.analysis",
      descKey: "system.analysis_desc",
    },
  ];

  return (
    <section id="sistem" className="pt-40 pb-32 px-6 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <span className="inline-block px-3 py-1 bg-accent/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md mb-6 border border-accent/20">
              {t("system.badge")}
            </span>
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
              {t("system.title_1")} <br />
              <span className="text-primary">{t("system.title_2")}</span>{" "}
              {t("system.title_3")}
            </h2>
          </div>
          <p className="text-muted-foreground max-w-sm mb-2 text-sm leading-relaxed font-medium">
            {t("system.description")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {coreModules.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-12 bg-esdm-gray/30 rounded-[48px] border border-border flex flex-col gap-10 group hover:bg-primary text-foreground hover:text-white transition-all duration-700"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-xl flex items-center justify-center border border-border group-hover:border-white/20 transition-all duration-500">
                  <item.icon className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
                <div className="text-xs font-bold opacity-30 group-hover:opacity-100 transition-opacity">
                  MODULE 0{i + 1}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-6 tracking-tight">
                  {t(item.titleKey)}
                </h3>
                <p className="opacity-60 group-hover:opacity-80 leading-relaxed font-medium">
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
