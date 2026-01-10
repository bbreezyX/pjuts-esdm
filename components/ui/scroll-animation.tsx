"use client";

import { useEffect } from "react";

/**
 * Lightweight client component that initializes scroll animations
 * Uses Intersection Observer - much lighter than Framer Motion (~1KB vs ~50KB)
 */
export function ScrollAnimationInit() {
  useEffect(() => {
    // Skip if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
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

  // This component renders nothing - just initializes the observer
  return null;
}
