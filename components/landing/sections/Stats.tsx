/**
 * Stats section displaying key platform metrics.
 * Supports ID/EN language switching.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/lib/language-context";

export const Stats = () => {
  const { t } = useLanguage();

  const benefits = [
    {
      value: "92",
      unit: "%",
      labelKey: "stats.accuracy",
      descKey: "stats.accuracy_desc",
      image: "/illustrations/magnifying.png",
    },
    {
      value: "24",
      unit: "H",
      labelKey: "stats.response",
      descKey: "stats.response_desc",
      image: "/illustrations/tech.png",
    },
    {
      value: "100",
      unit: "%",
      labelKey: "stats.transparency",
      descKey: "stats.transparency_desc",
      image: "/illustrations/solar.png",
    },
  ];

  return (
    <section
      id="statistik"
      className="relative pt-32 pb-24 px-6 bg-white overflow-hidden"
    >
      {/* Moving Background Pattern */}
      <div className="absolute inset-0 opacity-100 pointer-events-none">
        <motion.div
          animate={{
            backgroundPosition: ["0px 0px", "50px 50px"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, rgba(0, 51, 102, 0.05) 2px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="lg:w-1/3">
            <span className="inline-block px-3 py-1 bg-accent/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md mb-6 border border-accent/20">
              {t("stats.badge")}
            </span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
              {t("stats.title_1")} <br />
              {t("stats.title_2")} <br />
              <span className="text-primary">{t("stats.title_3")}</span>
            </h2>
            <p className="mt-8 text-muted-foreground leading-relaxed max-w-sm">
              {t("stats.description")}
            </p>
          </div>

          <div className="lg:w-2/3 grid md:grid-cols-3 gap-12 w-full">
            {benefits.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group"
              >
                <div className="flex items-start gap-1 mb-6">
                  <span className="text-7xl font-bold tracking-tighter group-hover:text-primary transition-colors">
                    {stat.value}
                  </span>
                  <span className="text-xl font-bold mt-3 text-primary">
                    {stat.unit}
                  </span>
                </div>
                <div className="border-l-2 border-primary pl-6">
                  <p className="text-sm font-bold uppercase tracking-widest mb-3">
                    {t(stat.labelKey)}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(stat.descKey)}
                  </p>
                </div>

                {/* Illustration with Overlay */}
                <div className="mt-10 aspect-square rounded-[40px] border border-border/60 relative overflow-hidden group-hover:border-primary/30 transition-all duration-500 shadow-inner bg-transparent">
                  <Image
                    src={stat.image}
                    fill
                    className="object-contain p-4 transition-all duration-700 group-hover:scale-110 mix-blend-multiply"
                    alt={t(stat.labelKey)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
