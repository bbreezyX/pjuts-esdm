"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Dashboard,
  Map,
  ClipboardCheck,
  LightBulb,
  PlusCircle,
} from "iconoir-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Dashboard },
  { href: "/map", label: "Peta", icon: Map },
  { href: "/report/new", label: "Lapor", icon: PlusCircle, isMain: true },
  { href: "/units", label: "Unit", icon: LightBulb },
  { href: "/reports", label: "Laporan", icon: ClipboardCheck },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-slate-200 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          if (item.isMain) {
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center justify-center -mt-6 group active:scale-95 transition-transform duration-200"
              >
                <div className="w-14 h-14 rounded-full bg-esdm-gradient shadow-lg shadow-primary-500/25 flex items-center justify-center ring-4 ring-white group-hover:shadow-primary-500/40 transition-shadow duration-200">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-[10px] font-medium text-primary-600 mt-1">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-200 group flex-1",
                isActive 
                  ? "text-primary-600" 
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              )}
            >
              <div className={cn(
                "relative p-1.5 rounded-xl transition-all duration-200",
                isActive && "bg-primary-50"
              )}>
                <Icon className={cn(
                  "w-5 h-5 transition-transform duration-200",
                  isActive && "scale-110",
                  "group-active:scale-95"
                )} />
              </div>
              <span className={cn(
                "text-[10px] font-medium transition-colors duration-200",
                isActive ? "text-primary-600" : "text-slate-500"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

