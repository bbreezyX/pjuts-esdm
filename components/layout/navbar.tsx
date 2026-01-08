"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  Lightbulb,
  FileBarChart,
  Menu,
  X,
  LogOut,
  User,
  Bell,
  Search,
  ChevronDown,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Notifications = dynamic(
  () => import("./notifications").then((mod) => mod.Notifications),
  {
    ssr: false,
    loading: () => (
      <Button variant="ghost" size="icon" className="relative text-slate-500">
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
        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
        <div className="hidden lg:block space-y-1">
          <div className="w-20 h-4 bg-slate-200 rounded animate-pulse" />
          <div className="w-16 h-3 bg-slate-200 rounded animate-pulse" />
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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/map", label: "Peta", icon: Map },
  { href: "/units", label: "Unit PJUTS", icon: Lightbulb },
  { href: "/reports", label: "Laporan", icon: ClipboardList },
  { href: "/analytics", label: "Analitik", icon: FileBarChart },
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
      {/* Desktop Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-3 group">
                <div className="relative">
                  <Image
                    src="/logo-esdm.png"
                    alt="Logo ESDM"
                    width={40}
                    height={40}
                    className="w-10 h-10 object-contain drop-shadow-md transition-transform group-hover:scale-105"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="block">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    PJUTS <span className="text-amber-400">ESDM</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 -mt-0.5">
                    Sistem Monitoring Terpadu
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                // Skip admin-only items if user is not admin
                if (item.adminOnly && user.role !== "ADMIN") return null;

                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5 text-slate-500" />
              </Button>

              {/* Notifications */}
              <Notifications />

              {/* User Menu */}
              <UserNav user={user} />

              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed right-4 top-20 w-72 bg-white shadow-2xl rounded-2xl border border-slate-100 overflow-hidden animate-fade-in">
            <div className="flex items-center justify-between p-4 bg-slate-50/50">
              <span className="font-semibold text-slate-900">Menu</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setMobileMenuOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <nav className="p-2 space-y-1">
              {navItems.map((item) => {
                // Skip admin-only items if user is not admin
                if (item.adminOnly && user.role !== "ADMIN") return null;

                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-2 bg-slate-50/50">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSearchOpen(false)}
          />
          <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-xl mx-4">
            <div className="bg-white rounded-xl shadow-2xl overflow-hidden animate-fade-in">
              <div className="flex items-center gap-3 p-4">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari unit berdasarkan Pole ID..."
                  className="flex-1 outline-none text-slate-900 placeholder:text-slate-400"
                  autoFocus
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded"
                >
                  ESC
                </button>
              </div>
              <div className="p-4 text-sm text-slate-500 text-center">
                Ketik untuk mencari unit PJUTS...
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

