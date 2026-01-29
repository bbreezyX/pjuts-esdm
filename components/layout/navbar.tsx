"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutGrid,
  Map as MapIcon,
  ClipboardList,
  Lightbulb,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Search,
  Plus
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Notifications = dynamic(
  () => import("./notifications").then((mod) => mod.Notifications),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" className="relative text-muted-foreground h-10 w-10 rounded-xl">
        <Bell className="h-5 w-5" />
      </Button>
    ),
  }
);

const UserNav = dynamic(
  () => import("./user-nav").then((mod) => mod.UserNav),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center gap-2 px-2">
        <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        <div className="hidden lg:block space-y-1">
          <div className="w-20 h-4 bg-muted rounded animate-pulse" />
        </div>
      </div>
    ),
  }
);

interface NavbarProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/map", label: "Peta", icon: MapIcon },
  { href: "/units", label: "Unit", icon: Lightbulb },
  { href: "/reports", label: "Laporan", icon: ClipboardList },
  { href: "/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/users", label: "Pengguna", icon: User, adminOnly: true },
];

export function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-6 pb-2 bg-background/0 backdrop-blur-none">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex h-20 items-center justify-between bg-card/80 backdrop-blur-xl px-8 rounded-bento border border-border/50 shadow-xl shadow-primary/5">
            {/* Logo & Brand */}
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="flex items-center gap-4 group">
                <div className="relative">
                  <div className="absolute -inset-2 bg-primary/10 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <Image
                    src="/logo-esdm.png"
                    alt="Logo ESDM"
                    width={42}
                    height={42}
                    className="w-10 h-10 object-contain drop-shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
                  />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-[3px] border-card animate-pulse" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-lg font-black text-foreground tracking-tighter leading-none">
                    PJUTS <span className="text-primary/70">ESDM</span>
                  </h1>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em] mt-1">
                    Cloud System
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Refined Bento Style Tabs */}
            <nav className="hidden xl:flex items-center bg-muted/30 p-1.5 rounded-2xl border border-border/40 backdrop-blur-sm">
              {navItems.map((item) => {
                if (item.adminOnly && user.role !== "ADMIN") return null;

                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300",
                      isActive
                        ? "bg-card text-foreground shadow-lg shadow-primary/5 ring-1 ring-border/50 translate-y-[-1px]"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40"
                    )}
                  >
                    <Icon className={cn("w-4 h-4 transition-colors duration-300", isActive ? "text-primary" : "text-muted-foreground")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-3">
              {/* Search Bar (Premium Bento) */}
              <div 
                className="hidden lg:flex items-center gap-4 bg-muted/40 px-5 py-2.5 rounded-2xl border border-border/40 w-72 group hover:bg-muted/60 hover:border-border/80 transition-all duration-300 cursor-pointer mr-3"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-xs font-bold text-muted-foreground group-hover:text-foreground/80">Cari unit PJUTS...</span>
                <kbd className="ml-auto text-[10px] bg-card/80 px-2 py-1 rounded-lg border border-border/60 font-black text-muted-foreground shadow-sm">⌘K</kbd>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-muted/30 p-1 rounded-2xl border border-border/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-11 w-11 rounded-xl hover:bg-card transition-all"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-5 w-5 text-muted-foreground" />
                  </Button>

                  <Notifications />
                </div>

                <div className="w-px h-8 bg-border/40 mx-2 hidden sm:block" />

                <div className="bg-muted/30 p-1 rounded-2xl border border-border/30">
                  <UserNav user={user} />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden h-11 w-11 rounded-xl bg-primary/5 hover:bg-primary/10 transition-all ml-1"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-6 w-6 text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Matching Bento Style */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden p-4">
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-full max-w-sm ml-auto bg-card shadow-2xl rounded-3xl border border-border overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                 <Image src="/logo-esdm.png" alt="Logo" width={32} height={32} />
                 <span className="font-bold text-foreground">Menu Navigasi</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-xl bg-muted hover:bg-muted/80"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <nav className="p-4 grid gap-2">
              {navItems.map((item) => {
                if (item.adminOnly && user.role !== "ADMIN") return null;
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 px-4 py-4 rounded-2xl text-sm font-bold transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "text-muted-foreground hover:bg-muted"
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 bg-muted/30">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-4 px-4 py-4 rounded-2xl text-red-500 hover:bg-red-500/10 text-sm font-bold transition-colors"
              >
                <LogOut className="w-5 h-5" />
                Keluar Sesi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal - Matching Bento Style */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 p-4 flex items-start justify-center pt-20">
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 p-6 border-b border-border bg-muted/30">
              <Search className="w-6 h-6 text-primary" />
              <input
                type="text"
                placeholder="Cari unit berdasarkan Pole ID atau Wilayah..."
                className="flex-1 bg-transparent outline-none text-lg font-medium text-foreground placeholder:text-muted-foreground"
                autoFocus
              />
              <kbd className="hidden sm:flex items-center gap-1 bg-card px-2 py-1 rounded-lg border border-border font-mono text-[10px] font-bold text-muted-foreground shadow-sm">
                ESC
              </kbd>
            </div>
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                 <LayoutGrid size={32} className="text-muted-foreground/40" />
              </div>
              <p className="text-sm font-bold text-foreground">Pencarian Terpadu</p>
              <p className="text-xs text-muted-foreground mt-1">Ketikkan Pole ID untuk menemukan unit PJUTS secara spesifik.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
