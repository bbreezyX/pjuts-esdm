"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
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
  Loader2,
  ArrowRight,
  MapPin,
} from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPjutsUnits, type PjutsUnitData } from "@/app/actions/units";

const Notifications = dynamic(
  () => import("./notifications").then((mod) => mod.Notifications),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="ghost"
        size="icon"
        className="relative text-muted-foreground h-10 w-10 rounded-xl"
      >
        <Bell className="h-5 w-5" />
      </Button>
    ),
  },
);

const UserNav = dynamic(() => import("./user-nav").then((mod) => mod.UserNav), {
  ssr: false,
  loading: () => (
    <div className="flex items-center gap-2 px-2">
      <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
      <div className="hidden lg:block space-y-1">
        <div className="w-20 h-4 bg-muted rounded animate-pulse" />
      </div>
    </div>
  ),
});

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
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PjutsUnitData[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Search Logic with Debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await getPjutsUnits({ search: searchQuery, limit: 6 });
        if (result.success && result.data) {
          setSearchResults(result.data.units);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    window.location.href = "/login";
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-6 xl:px-8 pt-4 lg:pt-6 pb-2 bg-background/0 backdrop-blur-none">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex h-16 lg:h-20 items-center justify-between bg-card/80 backdrop-blur-xl px-4 lg:px-6 xl:px-8 rounded-2xl lg:rounded-bento border border-border/50 shadow-xl shadow-primary/5">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 lg:gap-6 flex-shrink-0">
              <Link href="/dashboard" className="flex items-center gap-2 lg:gap-4 group">
                <div className="relative">
                  <div className="absolute -inset-2 bg-primary/10 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <Image
                    src="/logo-esdm.png"
                    alt="Logo ESDM"
                    width={42}
                    height={42}
                    className="w-8 h-8 lg:w-10 lg:h-10 object-contain drop-shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
                    priority
                  />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 lg:w-3.5 lg:h-3.5 bg-emerald-500 rounded-full border-2 lg:border-[3px] border-card animate-pulse" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-base lg:text-lg font-black text-foreground tracking-tighter leading-none">
                    PJUTS <span className="text-primary">ESDM</span>
                  </h1>
                  <p className="text-[9px] lg:text-[10px] text-muted-foreground font-black uppercase tracking-[0.15em] lg:tracking-[0.2em] mt-0.5 lg:mt-1">
                    Cloud System
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Refined Bento Style Tabs */}
            <nav className="hidden lg:flex items-center bg-muted/30 p-1 lg:p-1.5 rounded-xl lg:rounded-2xl border border-border/40 backdrop-blur-sm">
              {navItems.map((item) => {
                if (item.adminOnly && user.role !== "ADMIN") return null;

                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-1.5 lg:gap-2 xl:gap-2.5 px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[11px] lg:text-xs font-bold transition-all duration-300",
                      isActive
                        ? "bg-card text-foreground shadow-lg shadow-primary/5 ring-1 ring-border/50 translate-y-[-1px]"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-3.5 h-3.5 lg:w-4 lg:h-4 transition-colors duration-300",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
              {/* Search Bar (Premium Bento) */}
              <div
                className="hidden xl:flex items-center gap-3 xl:gap-4 bg-muted/40 px-3 xl:px-5 py-2 xl:py-2.5 rounded-xl xl:rounded-2xl border border-border/40 w-48 xl:w-64 2xl:w-72 group hover:bg-muted/60 hover:border-border/80 transition-all duration-300 cursor-pointer mr-2 xl:mr-3"
                onClick={() => setSearchOpen(true)}
              >
                <Search
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                />
                <span className="text-[11px] xl:text-xs font-bold text-muted-foreground group-hover:text-foreground/80 truncate">
                  Cari unit...
                </span>
                <kbd className="ml-auto text-[9px] xl:text-[10px] bg-card/80 px-1.5 xl:px-2 py-0.5 xl:py-1 rounded-md xl:rounded-lg border border-border/60 font-black text-muted-foreground shadow-sm flex-shrink-0">
                  ⌘K
                </kbd>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 lg:gap-2">
                <div className="flex items-center gap-1 lg:gap-1.5 bg-muted/30 p-1 rounded-xl lg:rounded-2xl border border-border/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="xl:hidden h-9 w-9 lg:h-10 lg:w-10 rounded-lg lg:rounded-xl hover:bg-card transition-all"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground" />
                  </Button>

                  <Notifications />
                </div>

                <div className="w-px h-6 lg:h-8 bg-border/40 mx-1 lg:mx-2 hidden sm:block" />

                <div className="bg-muted/30 p-1 rounded-xl lg:rounded-2xl border border-border/30">
                  <UserNav user={user} />
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 lg:h-11 lg:w-11 rounded-lg lg:rounded-xl bg-primary/5 hover:bg-primary/10 transition-all ml-1"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5 lg:h-6 lg:w-6 text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Matching Bento Style */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden p-4">
          <div
            className="fixed inset-0 bg-background/60 backdrop-blur-md"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-full max-w-sm ml-auto bg-card shadow-2xl rounded-3xl border border-border overflow-hidden animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo-esdm.png"
                  alt="Logo"
                  width={32}
                  height={32}
                  priority
                />
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
                        : "text-muted-foreground hover:bg-muted",
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
            onClick={() => {
              setSearchOpen(false);
              setSearchQuery("");
            }}
          />
          <div className="relative w-full max-w-2xl bg-card rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-4 p-6 border-b border-border bg-muted/30">
              {isSearching ? (
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              ) : (
                <Search className="w-6 h-6 text-primary" />
              )}
              <input
                type="text"
                placeholder="Cari Pole ID, Wilayah, atau ID Unit..."
                className="flex-1 bg-transparent outline-none text-lg font-bold text-foreground placeholder:text-muted-foreground"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <kbd className="hidden sm:flex items-center gap-1 bg-card px-2 py-1 rounded-lg border border-border font-mono text-[10px] font-bold text-muted-foreground shadow-sm">
                ESC
              </kbd>
            </div>

            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
              {searchQuery ? (
                <div className="p-4 space-y-2">
                  {searchResults.length > 0 ? (
                    searchResults.map((unit) => (
                      <button
                        key={unit.id}
                        onClick={() => {
                          setSearchOpen(false);
                          setSearchQuery("");
                          router.push(`/map?unitId=${unit.id}`);
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-muted transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                            <Lightbulb className="w-6 h-6 text-primary" />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-foreground tracking-tight">
                              {unit.serialNumber}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <MapPin size={12} className="text-emerald-500" />
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {unit.regency}, {unit.province}
                              </p>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))
                  ) : !isSearching ? (
                    <div className="py-20 text-center">
                      <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                        <Search
                          size={32}
                          className="text-muted-foreground/40"
                        />
                      </div>
                      <p className="text-sm font-bold text-foreground uppercase tracking-wider">
                        Hasil tidak ditemukan
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Coba gunakan kata kunci atau ID unit yang berbeda.
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid
                      size={32}
                      className="text-muted-foreground/40"
                    />
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Pencarian Terpadu PJUTS
                  </p>
                  <p className="text-xs text-muted-foreground mt-1 px-10">
                    Cari unit secara cepat berdasarkan serial number, wilayah
                    regency, district, atau alamat spesifik.
                  </p>

                  <div className="mt-8 flex flex-wrap justify-center gap-2">
                    {["POLE-", "JAMBI", "BATANGHARI"].map((tag) => (
                      <button
                        key={tag}
                        onClick={() => setSearchQuery(tag)}
                        className="px-3 py-1.5 rounded-lg bg-muted text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary transition-all"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-8">
              <div className="flex gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="bg-card px-1.5 py-0.5 rounded border border-border shadow-sm">
                    ↵
                  </span>{" "}
                  Pilih
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="bg-card px-1.5 py-0.5 rounded border border-border shadow-sm">
                    ↑↓
                  </span>{" "}
                  Navigasi
                </span>
              </div>
              <span>System Cloud Monitor v1.0</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
