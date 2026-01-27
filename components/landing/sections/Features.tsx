/**
 * FAQ section with frequently asked questions.
 */
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';

const questions = [
  {
    image: "/illustrations/faq-1.png",
    title: "Bagaimana cara melaporkan lampu mati?",
    desc: "Masyarakat dapat menggunakan fitur pengaduan di aplikasi atau website dengan melampirkan foto unit dan QR Code yang tertera pada tiang lampu."
  },
  {
    image: "/illustrations/faq-2.png",
    title: "Siapa yang bertanggung jawab atas pemeliharaan?",
    desc: "Pemeliharaan dilakukan oleh penyedia jasa dalam masa garansi, dan selanjutnya akan diserahterimakan kepada Pemerintah Daerah setempat."
  },
  {
    image: "/illustrations/faq-3.png",
    title: "Apa keunggulan PJUTS dibandingkan PJU biasa?",
    desc: "PJUTS mandiri energi, tidak memerlukan kabel instalasi listrik PLN, dan lebih hemat biaya operasional jangka panjang bagi daerah."
  },
  {
    image: "/illustrations/faq-4.png",
    title: "Dimana saya bisa melihat data sebaran PJUTS?",
    desc: "Peta sebaran nasional dapat diakses melalui modul GIS di dashboard monitoring untuk transparansi aset negara."
  }
];

export const Features = () => {
  return (
    <section id="bantuan" className="pt-40 pb-32 px-6 bg-esdm-gray/10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start mb-24 gap-12">
           <div className="flex flex-col gap-4">
             <div className="flex items-center gap-3">
               <span className="w-8 h-px bg-primary/30"></span>
               <span className="text-[10px] font-black tracking-[0.3em] uppercase text-primary/60">Pusat Informasi</span>
             </div>
             <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground leading-[0.95]">
              Dukungan <br />
              <span className="text-primary">& Layanan Publik</span>
            </h2>
           </div>
           <button className="bg-primary text-white px-10 py-5 rounded-2xl font-bold text-sm hover:bg-primary/90 transition-all flex items-center gap-3 group shadow-xl shadow-primary/20">
             Hubungi Helpdesk
             <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
              className="group p-8 bg-white rounded-[32px] border border-border/50 hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 flex gap-8 items-start"
            >
              <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-border p-2 group-hover:bg-primary/5 transition-colors relative">
                <Image 
                  src={item.image} 
                  fill
                  className="object-contain p-2 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-700 mix-blend-multiply" 
                  alt={item.title} 
                />
              </div>
              
              <div className="grow pt-2">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors tracking-tight leading-tight">{item.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed font-medium opacity-70 group-hover:opacity-100">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
