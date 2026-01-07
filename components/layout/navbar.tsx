"use client";

import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
                  <div className="w-10 h-10 rounded-xl bg-esdm-gradient flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                    <svg
                      className="w-6 h-6 text-amber-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7zm2.85 11.1l-.85.6V16h-4v-2.3l-.85-.6C7.8 12.16 7 10.63 7 9c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.63-.8 3.16-2.15 4.1z" />
                    </svg>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white" />
                </div>
                <div className="block">
                  <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                    PJUTS <span className="text-primary-600">ESDM</span>
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
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-slate-500" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 px-2 hover:bg-slate-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium text-slate-900">
                        {user.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {user.role === "ADMIN" ? "Administrator" : "Petugas Lapangan"}
                      </p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-slate-400 hidden lg:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user.name}</span>
                      <span className="text-xs font-normal text-slate-500">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    Profil Saya
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
              <div className="flex items-center gap-3 p-4 border-b">
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

