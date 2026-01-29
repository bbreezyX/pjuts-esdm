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
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden pb-3 px-3">
      {/* Floating center button - positioned outside the card */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%-2.25rem)] z-10">
        <Link
          href="/report/new"
          className="relative flex flex-col items-center justify-center group active:scale-90 transition-all duration-200"
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Button */}
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-xl shadow-primary/40 flex items-center justify-center group-hover:shadow-primary/50 group-active:shadow-primary/20 transition-all border-4 border-card">
            <Plus className="w-7 h-7 text-primary-foreground transition-transform group-hover:scale-110 group-hover:rotate-90 group-active:scale-95 duration-300" />
          </div>
          
          {/* Label */}
          <span className="text-[8px] font-black uppercase tracking-wider text-primary mt-1">
            Lapor
          </span>
        </Link>
      </div>
      
      {/* Main nav container */}
      <div className="bg-card/95 backdrop-blur-2xl border border-border/60 shadow-2xl shadow-black/10 rounded-[1.5rem]">
        <div className="flex items-center justify-around px-2 py-2.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            // Skip the main button as it's rendered separately above
            if (item.isMain) {
              return (
                <div key={item.href} className="w-16 flex-shrink-0" />
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex flex-col items-center justify-center gap-0.5 py-2 px-2 rounded-xl transition-all duration-300 group flex-1 min-w-0",
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground active:text-foreground"
                )}
              >
                {/* Active background indicator */}
                <div className={cn(
                  "absolute inset-1 rounded-lg transition-all duration-300",
                  isActive 
                    ? "bg-primary/10 scale-100 opacity-100" 
                    : "bg-transparent scale-90 opacity-0 group-active:bg-muted group-active:scale-100 group-active:opacity-100"
                )} />
                
                {/* Active dot indicator */}
                <div className={cn(
                  "absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary transition-all duration-300",
                  isActive ? "opacity-100 scale-100" : "opacity-0 scale-0"
                )} />
                
                {/* Icon */}
                <div className="relative z-10">
                  <Icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "scale-110" : "group-active:scale-90"
                  )} />
                </div>
                
                {/* Label */}
                <span className={cn(
                  "relative z-10 text-[9px] font-bold uppercase tracking-wide transition-all duration-300 truncate",
                  isActive ? "text-primary" : "text-muted-foreground/70"
                )}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
        
        {/* Safe area spacer for devices with home indicator */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </nav>
  );
}
