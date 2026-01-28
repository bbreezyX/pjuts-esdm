/**
 * Workflow section for the PJUTS ESDM Landing Page.
 * Explains the mechanism and encourages user action.
 * Supports ID/EN language switching.
 */
"use client";

import React from "react";
import { motion } from "framer-motion";
import { QrCode, Camera, Share2, Terminal } from "lucide-react";
import { useLanguage } from "@/lib/language-context";

export const Workflow = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: QrCode,
      num: "01",
      titleKey: "workflow.step1",
      descKey: "workflow.step1_desc",
    },
    {
      icon: Camera,
      num: "02",
      titleKey: "workflow.step2",
      descKey: "workflow.step2_desc",
    },
    {
      icon: Share2,
      num: "03",
      titleKey: "workflow.step3",
      descKey: "workflow.step3_desc",
    },
  ];

  return (
    <section
      id="workflow"
      className="pt-40 pb-32 bg-background relative overflow-hidden"
    >
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-20 items-center mb-32">
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-6"
            >
              <span className="w-1.5 h-1.5 bg-primary rounded-full" />
              {t("workflow.badge")}
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold tracking-tight mb-8"
            >
              {t("workflow.title_1")} <br />
              <span className="text-primary italic font-serif">
                {t("workflow.title_2")}
              </span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground mb-12"
            >
              {t("workflow.description")}
            </motion.p>

            <div className="space-y-8">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex gap-6 items-start group/step"
                >
                  <div className="flex flex-col items-center flex-shrink-0 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/20 transition-transform group-hover/step:scale-110">
                      <step.icon className="w-5 h-5" />
                    </div>
                    {i < steps.length - 1 && (
                      <div className="w-px h-12 bg-border my-2" />
                    )}
                  </div>
                  <div className="pt-1">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                        Step {step.num}
                      </span>
                      <h3 className="text-lg font-bold leading-none">
                        {t(step.titleKey)}
                      </h3>
                    </div>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="lg:w-1/2 relative"
          >
            <div className="bg-card border border-border rounded-[48px] p-12 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/20" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/20" />
                  <div className="w-3 h-3 rounded-full bg-esdm-green/20" />
                </div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  {t("workflow.monitor_live")}
                </div>
              </div>

              <div className="space-y-4 font-mono text-[10px]">
                <div className="flex gap-3 p-3 rounded-lg bg-esdm-gray/30 border border-border">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span className="text-muted-foreground">
                    Scanning QR: PJU-JKT-001...
                  </span>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-esdm-gray/30 border border-border">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span className="text-foreground">
                    Location verified: -6.2088, 106.8456
                  </span>
                </div>
                <div className="flex gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  <span className="text-primary font-bold">
                    Sync complete: 100% SUCCESS
                  </span>
                </div>
              </div>

              <div className="mt-12 h-40 flex items-end justify-between gap-2">
                {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    viewport={{ once: true }}
                    transition={{
                      delay: 0.5 + i * 0.05,
                      duration: 1,
                      ease: "easeOut",
                    }}
                    className="w-full bg-primary/20 rounded-t-lg group relative"
                  >
                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity rounded-t-lg" />
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl -z-10" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};
