/**
 * Stats section displaying key platform metrics.
 */
"use client";

import React from 'react';
import { motion } from 'framer-motion';

const benefits = [
  {
    value: "92",
    unit: "%",
    label: "Akurasi Data",
    desc: "Data pemantauan lampu yang akurat dan terverifikasi secara digital.",
    image: "/illustrations/magnifying.png"
  },
  {
    value: "24",
    unit: "H",
    label: "Respon Cepat",
    desc: "Sistem pelaporan kendala yang ditangani secara sigap oleh tim teknis.",
    image: "/illustrations/tech.png"
  },
  {
    value: "100",
    unit: "%",
    label: "Transparansi",
    desc: "Seluruh progres pemasangan dan kondisi unit dapat dipantau publik.",
    image: "/illustrations/solar.png"
  }
];

export const Stats = () => {
  return (
    <section id="statistik" className="pt-32 pb-24 px-6 bg-white border-y border-border">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-20 items-start">
          <div className="lg:w-1/3">
             <span className="inline-block px-3 py-1 bg-accent/10 text-primary text-[10px] font-bold uppercase tracking-widest rounded-md mb-6 border border-accent/20">
              Fitur Utama
            </span>
            <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-foreground leading-[0.95]">
              Teknologi <br />
              Monitoring <br />
              <span className="text-primary">Terdepan</span>
            </h2>
            <p className="mt-8 text-muted-foreground leading-relaxed max-w-sm">
              Kami menghadirkan standar baru dalam pengelolaan infrastruktur publik berbasis energi terbarukan.
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
                  <span className="text-7xl font-bold tracking-tighter group-hover:text-primary transition-colors">{stat.value}</span>
                  <span className="text-xl font-bold mt-3 text-primary">{stat.unit}</span>
                </div>
                <div className="border-l-2 border-primary pl-6">
                  <p className="text-sm font-bold uppercase tracking-widest mb-3">{stat.label}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stat.desc}</p>
                </div>
                
                {/* Illustration with Overlay */}
                <div className="mt-10 aspect-square rounded-[40px] border border-border/60 relative overflow-hidden group-hover:border-primary/30 transition-all duration-500 shadow-inner bg-transparent">
                   <img 
                     src={stat.image} 
                     className="w-full h-full object-contain p-4 transition-all duration-700 group-hover:scale-110 mix-blend-multiply"
                     alt={stat.label}
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
