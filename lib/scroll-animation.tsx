"use client";

import { useEffect } from "react";

/**
 * Lightweight scroll animation hook using Intersection Observer
 * Much lighter than Framer Motion for scroll-triggered animations
 */
export function useScrollAnimation() {
  useEffect(() => {
    // Skip if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Make all elements visible immediately
      document.querySelectorAll(".animate-on-scroll").forEach((el) => {
        el.classList.add("is-visible");
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            // Once animated, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    // Observe all elements with the animation class
    document.querySelectorAll(".animate-on-scroll").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);
}

/**
 * Provider component to initialize scroll animations
 * Add this once in your layout or page
 */
export function ScrollAnimationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useScrollAnimation();
  return <>{children}</>;
}
