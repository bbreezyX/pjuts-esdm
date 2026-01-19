/**
 * Landing page for the PJUTS ESDM Monitoring Platform.
 */
"use client";

import React from 'react';
import { Navbar } from './sections/Navbar';
import { Hero } from './sections/Hero';
import { Stats } from './sections/Stats';
import { Challenges } from './sections/Challenges';
import { Solutions } from './sections/Solutions';
import { Features } from './sections/Features';
import { Workflow } from './sections/Workflow';
import { CTA } from './sections/CTA';
import { Footer } from './sections/Footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-accent/30 selection:text-primary overflow-x-hidden">
      <Navbar />
      <main>
        <Hero />
        <Stats />
        <Challenges />
        <Solutions />
        <Workflow />
        <Features />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
