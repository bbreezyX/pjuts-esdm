"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Map as MapIcon,
  ClipboardList,
  Lightbulb,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/map", label: "Peta", icon: MapIcon },
  { href: "/report/new", label: "Lapor", icon: Plus, isMain: true },
  { href: "/units", label: "Unit", icon: Lightbulb },
  { href: "/reports", label: "Laporan", icon: ClipboardList },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-4 px-4 bg-gradient-to-t from-background via-background/90 to-transparent pt-12 pointer-events-none">
      <div className="relative pointer-events-auto max-w-md mx-auto">
        {/* Floating center button - Tactical Action Button */}
        <div className="absolute left-1/2 -translate-x-1/2 -top-12 z-50">
          <Link
            href="/report/new"
            className="relative flex flex-col items-center group active:scale-95 transition-transform duration-200"
          >
            {/* Outer Glow & Pulse - Using Primary Blue */}
            <motion.div
              animate={{
                scale: [1, 1.15, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-primary/30 rounded-full blur-2xl"
            />

            {/* Tactical Button Frame */}
            <div className="relative">
              {/* Spinning border effect on hover - Using Accent Gold */}
              <div className="absolute -inset-1.5 bg-gradient-to-tr from-accent via-accent/20 to-accent rounded-[1.4rem] opacity-0 group-hover:opacity-100 blur-[2px] transition-opacity duration-500" />

              <div className="relative w-16 h-16 rounded-[1.25rem] bg-primary flex items-center justify-center overflow-hidden border-2 border-white shadow-xl shadow-primary/20 group-hover:border-accent transition-colors">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
                <div className="absolute inset-0 opacity-[0.05] bg-[grid-size:8px_8px] bg-[radial-gradient(circle_at_center,_#fff_1px,transparent_0)]" />

                {/* Gradient Fill */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

                {/* Gradient Fill */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />

                {/* Icon Wrapper */}
                <motion.div
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  className="relative z-10"
                >
                  <Plus className="w-8 h-8 text-white drop-shadow-sm" />
                </motion.div>

                {/* Tactical Scanners - Gold */}
                <div className="absolute inset-0 pointer-events-none">
                  <motion.div
                    animate={{ translateY: ["-100%", "100%"] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="h-[2px] w-full bg-accent/30 blur-[1px]"
                  />
                </div>
              </div>
            </div>

            {/* Label with brand styling */}
            <div className="mt-1 flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary">
                Lapor
              </span>
            </div>
          </Link>
        </div>

        {/* Main Nav Glass Container - Light Theme Compatible */}
        <div className="bg-white/80 backdrop-blur-xl border border-primary/10 rounded-[2.25rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="relative flex items-center justify-around px-3 py-3">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" &&
                  pathname.startsWith(`${item.href}`));
              const Icon = item.icon;

              if (item.isMain) {
                return <div key={item.href} className="w-20 flex-shrink-0" />;
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative flex flex-col items-center justify-center gap-1.5 py-2.5 px-1 rounded-2xl transition-all duration-500 group flex-1 min-w-0 z-10",
                    isActive
                      ? "text-primary"
                      : "text-slate-400 hover:text-slate-600",
                  )}
                >
                  {/* Shared Layout Active Indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="nav-glow"
                      className="absolute inset-0 bg-primary/5 rounded-2xl"
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6,
                      }}
                    >
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-primary/40 blur-[0.5px]" />
                    </motion.div>
                  )}

                  {/* Icon with motion */}
                  <div className="relative">
                    <motion.div
                      animate={
                        isActive ? { scale: [1, 1.15, 1], y: [0, -1, 0] } : {}
                      }
                      transition={{ duration: 0.4 }}
                    >
                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors duration-300",
                          isActive
                            ? "text-primary stroke-[2.5px]"
                            : "group-hover:text-primary/70 stroke-[2px]",
                        )}
                      />
                    </motion.div>
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-wider transition-all duration-300 truncate max-w-full",
                      isActive
                        ? "text-primary scale-105"
                        : "text-slate-500 font-medium",
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Safe area spacer for devices with home indicator */}
          <div className="h-safe-area-inset-bottom" />
        </div>
      </div>
    </nav>
  );
}
