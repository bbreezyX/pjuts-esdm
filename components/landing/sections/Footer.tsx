/**
 * Footer updated with ESDM contact info and branding.
 */
"use client";

import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import Image from 'next/image';

export const Footer = () => {
  return (
    <footer id="kontak" className="py-32 px-6 bg-white border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-24 mb-32">
          <div>
            <div className="flex items-center gap-4 mb-10">
              <Image 
                src="/logo-esdm.png" 
                width={48}
                height={48}
                className="w-12 h-12 object-contain" 
                alt="ESDM Logo" 
              />
              <div className="flex flex-col -space-y-1">
                <span className="font-black tracking-tight text-foreground text-3xl">PJUTS<span className="text-primary">ESDM</span></span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Kementerian ESDM RI</span>
              </div>
            </div>
            <p className="text-muted-foreground text-lg max-w-md leading-relaxed font-medium mb-12">
              Sistem informasi monitoring terpadu untuk efisiensi energi nasional yang berkelanjutan dan akuntabel.
            </p>
            <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
               <p>© {new Date().getFullYear()} Kementerian ESDM</p>
               <a href="#" className="hover:text-primary transition-colors underline underline-offset-4 decoration-border">Kebijakan Privasi</a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 w-full">
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">Navigasi</p>
               {['Sistem', 'GIS Map', 'Laporan', 'Regulasi', 'Unduhan'].map(item => (
                 <a key={item} href="#" className="block text-sm font-bold hover:text-primary transition-colors tracking-tight">{item}</a>
               ))}
            </div>
            <div className="space-y-6">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">Informasi</p>
               {['Berita', 'Publikasi', 'Profil', 'FAQ'].map(item => (
                 <a key={item} href="#" className="block text-sm font-bold hover:text-primary transition-colors tracking-tight">{item}</a>
               ))}
            </div>
            <div className="space-y-6 col-span-2 sm:col-span-1">
               <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-8">Sosial Media</p>
               {['Instagram', 'Twitter', 'Facebook', 'YouTube'].map(item => (
                 <a key={item} href="#" className="flex items-center justify-between text-sm font-bold border-b border-border pb-3 hover:text-primary transition-all group tracking-tight">
                   {item}
                   <ArrowUpRight className="w-3.5 h-3.5 opacity-20 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                 </a>
               ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pt-16 border-t border-border">
          <div className="flex flex-wrap justify-center gap-12">
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full"/> +62 21 3507950</span>
            <span className="flex items-center gap-2"><div className="w-1 h-1 bg-primary rounded-full"/> info@esdm.go.id</span>
          </div>
          <p className="text-center md:text-right">Jl. Medan Merdeka Selatan No. 18, Jakarta Pusat</p>
        </div>
      </div>
    </footer>
  );
};
