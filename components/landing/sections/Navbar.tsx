/**
 * Navigation bar updated with official logo and ESDM theme.
 */
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { label: 'Beranda', href: '#beranda' },
  { label: 'Statistik', href: '#statistik' },
  { label: 'Sistem', href: '#sistem' },
  { label: 'Alur Kerja', href: '#alur-kerja' },
  { label: 'Bantuan', href: '#bantuan' },
  { label: 'Kontak', href: '#kontak' },
];

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-40% 0px -40% 0px',
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navItems.forEach((item) => {
      const sectionId = item.href.replace('#', '');
      const section = document.getElementById(sectionId);
      if (section) observer.observe(section);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 px-6 py-6 transition-all duration-300"
    >
      <div className={`max-w-7xl mx-auto flex items-center justify-between transition-all duration-500 border ${
        scrolled 
          ? 'bg-primary/80 backdrop-blur-xl border-white/10 py-3 shadow-2xl' 
          : 'bg-white/5 backdrop-blur-md border-white/10 py-4 shadow-xl'
      } rounded-full px-6 transition-all duration-300`}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-white/10 p-1.5 overflow-hidden shadow-inner">
             <Image 
               src="/logo-esdm.png" 
               width={40}
               height={40}
               className="w-full h-full object-contain" 
               alt="ESDM Logo" 
             />
          </div>
          <div className="flex flex-col -space-y-1">
            <span className="font-black tracking-tight text-white text-base">PJUTS<span className="text-accent">ESDM</span></span>
            <span className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">Kementerian ESDM RI</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-white/5 rounded-full p-1 border border-white/5">
          {navItems.map((item) => {
            const isActive = activeSection === item.href.replace('#', '');
            return (
              <Link 
                key={item.label} 
                href={item.href}
                className={`px-5 py-2 rounded-full text-[11px] font-bold tracking-wide transition-all ${
                  isActive 
                    ? 'bg-accent text-primary shadow-lg shadow-accent/20' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-4">
            <Link href="/login" className="flex items-center gap-2 bg-accent text-primary px-6 py-2.5 rounded-full text-[11px] font-bold hover:bg-white transition-all shadow-lg shadow-accent/10">
              Masuk Sistem
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
            <div className="flex items-center gap-1.5 text-[9px] font-black px-4 py-2.5 bg-white/10 border border-white/10 rounded-full cursor-pointer text-white hover:bg-white/20 transition-all">
              ID
              <div className="w-1 h-1 rounded-full bg-accent" />
            </div>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 left-6 right-6 lg:hidden bg-primary/95 backdrop-blur-2xl border border-white/10 rounded-[32px] p-8 shadow-2xl z-40 overflow-hidden"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => {
                const isActive = activeSection === item.href.replace('#', '');
                return (
                  <Link 
                    key={item.label} 
                    href={item.href}
                    className={`text-xl font-bold tracking-tight transition-colors ${
                      isActive ? 'text-accent' : 'text-white/60'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <div className="h-px bg-white/10 my-2" />
              <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-3 bg-accent text-primary w-full py-4 rounded-2xl font-bold text-lg">
                Masuk Sistem
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Decorative background for mobile menu */}
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl -z-10" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
