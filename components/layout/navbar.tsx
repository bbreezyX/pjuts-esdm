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
import { motion, AnimatePresence } from "framer-motion";
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
      <header className="sticky top-0 z-40 w-full px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6 pb-2 bg-background/0 backdrop-blur-none">
        <div className="mx-auto max-w-[1600px]">
          <div className="flex h-16 lg:h-[72px] xl:h-20 items-center justify-between bg-card/80 backdrop-blur-xl px-4 lg:px-8 xl:px-10 rounded-2xl lg:rounded-bento border border-border/50 shadow-xl shadow-primary/5 gap-4 lg:gap-6 xl:gap-8">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3 lg:gap-4 flex-shrink-0">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 lg:gap-3 xl:gap-4 group"
              >
                <div className="relative">
                  <div className="absolute -inset-2 bg-primary/10 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-300" />
                  <Image
                    src="/logo-esdm.png"
                    alt="Logo ESDM"
                    width={42}
                    height={42}
                    className="w-9 h-9 lg:w-10 lg:h-10 xl:w-11 xl:h-11 object-contain drop-shadow-md transition-all duration-300 group-hover:rotate-6 group-hover:scale-110"
                    priority
                  />
                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-emerald-500 rounded-full border-2 lg:border-[3px] border-card animate-pulse" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="text-sm lg:text-base xl:text-lg font-black text-foreground tracking-tighter leading-none">
                    PJUTS <span className="text-primary">ESDM</span>
                  </h1>
                  <p className="text-[8px] lg:text-[9px] xl:text-[10px] text-muted-foreground font-black uppercase tracking-[0.12em] lg:tracking-[0.15em] xl:tracking-[0.2em] mt-0.5">
                    Cloud System
                  </p>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation - Refined Bento Style Tabs */}
            <nav className="hidden lg:flex items-center bg-muted/30 p-1.5 rounded-xl lg:rounded-2xl border border-border/40 backdrop-blur-sm gap-0.5 lg:gap-1">
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
                      "flex items-center gap-2 lg:gap-2.5 px-3.5 lg:px-4 xl:px-5 py-2 lg:py-2.5 rounded-lg lg:rounded-xl text-[11px] lg:text-xs font-bold transition-all duration-300 whitespace-nowrap",
                      isActive
                        ? "bg-card text-foreground shadow-lg shadow-primary/5 ring-1 ring-border/50 translate-y-[-1px]"
                        : "text-muted-foreground hover:text-foreground hover:bg-card/40",
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors duration-300 flex-shrink-0",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-2 lg:gap-3 xl:gap-4 flex-shrink-0">
              {/* Search Bar (Premium Bento) */}
              <div
                className="hidden lg:flex items-center gap-2 lg:gap-2.5 bg-muted/40 px-3 lg:px-4 py-2 lg:py-2.5 rounded-xl border border-border/40 w-36 lg:w-44 xl:w-52 2xl:w-60 group hover:bg-muted/60 hover:border-border/80 transition-all duration-300 cursor-pointer"
                onClick={() => setSearchOpen(true)}
              >
                <Search
                  size={16}
                  className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0"
                />
                <span className="text-[10px] lg:text-[11px] xl:text-xs font-bold text-muted-foreground group-hover:text-foreground/80 truncate">
                  Cari unit...
                </span>
                <kbd className="ml-auto text-[8px] lg:text-[9px] bg-card/80 px-1.5 py-0.5 rounded-md border border-border/60 font-black text-muted-foreground shadow-sm flex-shrink-0">
                  ⌘K
                </kbd>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 lg:gap-2.5">
                <div className="flex items-center gap-1.5 bg-muted/30 p-1 lg:p-1.5 rounded-xl border border-border/30">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden h-9 w-9 rounded-lg hover:bg-card transition-all"
                    onClick={() => setSearchOpen(true)}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                  </Button>

                  <Notifications />
                </div>

                <div className="w-px h-6 lg:h-7 bg-border/40 mx-0.5 lg:mx-1 hidden lg:block" />

                <UserNav user={user} />

                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden h-9 w-9 rounded-lg bg-primary/5 hover:bg-primary/10 transition-all ml-1"
                  onClick={() => setMobileMenuOpen(true)}
                >
                  <Menu className="h-5 w-5 text-primary" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Premium Animated Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-[72px] right-4 z-50 w-[calc(100vw-2rem)] max-w-sm bg-card/95 backdrop-blur-xl border border-border/60 shadow-2xl rounded-3xl lg:hidden flex flex-col overflow-hidden ring-1 ring-border/10"
              style={{ maxHeight: "calc(100vh - 90px)" }}
            >
              {/* Header: User Profile Card (Compact) */}
              <div className="p-4 border-b border-border/50 bg-muted/30 relative">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 p-[1px] shadow-lg shadow-primary/20 shrink-0">
                    <div className="w-full h-full rounded-xl bg-card flex items-center justify-center overflow-hidden">
                      <span className="text-lg font-black text-primary">
                        {user.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm leading-none text-foreground truncate max-w-[120px]">
                        {user.name}
                      </h4>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                          user.role === "ADMIN"
                            ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            : "bg-primary/10 text-primary border-primary/20",
                        )}
                      >
                        {user.role}
                      </span>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 font-medium truncate">
                      {user.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-lg -mr-1 hover:bg-background/50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {navItems.map((item, idx) => {
                  if (item.adminOnly && user.role !== "ADMIN") return null;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(`${item.href}/`)) ||
                    pathname === item.href;

                  const Icon = item.icon;

                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + idx * 0.03 }}
                      key={item.href}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "w-4 h-4 transition-transform duration-300",
                            isActive ? "scale-110" : "group-hover:scale-110",
                          )}
                        />
                        <span className="font-bold text-xs tracking-wide flex-1">
                          {item.label}
                        </span>

                        {isActive && (
                          <motion.div
                            layoutId="activeDot"
                            className="w-1.5 h-1.5 rounded-full bg-white shadow-sm"
                          />
                        )}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer Actions (Minimal) */}
              <div className="p-2 border-t border-border/50 bg-muted/20 flex items-center justify-between gap-2">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-destructive hover:bg-destructive/10 transition-colors font-bold text-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Keluar
                </motion.button>

                <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
                    Online
                  </span>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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

            <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-center sm:justify-between gap-2 sm:gap-0 text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-4 sm:px-8">
              <div className="hidden sm:flex gap-4">
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
              <span className="text-center sm:text-right">
                System Cloud Monitor v1.0
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
