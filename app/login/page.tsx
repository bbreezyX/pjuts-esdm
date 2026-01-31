"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Globe,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [idleMessage, setIdleMessage] = useState(false);

  useEffect(() => {
    if (searchParams.get("reason") === "idle") {
      setIdleMessage(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("login.error_credentials"));
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError(t("login.error_general"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AnimatePresence>
        {(idleMessage || error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-3 shadow-sm ${
              error
                ? "bg-red-50 text-red-900 border border-red-100"
                : "bg-amber-50 text-amber-900 border border-amber-100"
            }`}
          >
            <div
              className={`p-1.5 rounded-md ${
                error ? "bg-red-100" : "bg-amber-100"
              }`}
            >
              <ShieldCheck
                className={`w-4 h-4 ${error ? "text-red-600" : "text-amber-600"}`}
              />
            </div>
            {error || t("login.idle_message")}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">
            {t("login.email_label")}
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@esdm.go.id"
            required
            className="h-12 rounded-lg bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm font-medium text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 ml-1">
            {t("login.password_label")}
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="h-12 rounded-lg bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all shadow-sm pr-12 font-medium text-slate-900 placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer group">
          <div className="relative flex items-center">
            <input
              type="checkbox"
              className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded transition-colors checked:bg-primary checked:border-primary group-hover:border-primary/60"
            />
            <svg
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="font-medium">{t("login.remember")}</span>
        </label>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors hover:underline underline-offset-4"
        >
          {t("login.forgot")}
        </Link>
      </div>

      <Button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <span className="flex items-center gap-2">
            {t("login.submit")}
            <ArrowLeft className="w-4 h-4 rotate-180" />
          </span>
        )}
      </Button>
    </form>
  );
}

function LoginFormFallback() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
      </div>
      <div className="space-y-2">
        <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
        <div className="h-12 bg-slate-100 rounded-lg animate-pulse" />
      </div>
      <div className="h-12 bg-slate-200 rounded-lg animate-pulse" />
    </div>
  );
}

export default function LoginPage() {
  const { t, language, toggleLanguage } = useLanguage();

  return (
    <main className="min-h-screen flex bg-slate-50">
      {/* Left Panel - Official Visuals */}
      <div className="hidden lg:flex w-[45%] relative bg-primary overflow-hidden flex-col justify-between p-12 lg:p-16">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-[url('/illustrations/hero-command.png')] bg-cover bg-center mix-blend-overlay opacity-20 grayscale" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-900/90" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-[length:30px_30px]" />
        
        {/* Top Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-4 group">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl border border-white/10 group-hover:bg-white/20 transition-colors">
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={48}
                height={48}
                className="w-12 h-12 object-contain drop-shadow-md"
              />
            </div>
            <div className="flex flex-col text-white">
              <span className="font-bold text-lg leading-none tracking-tight">Dinas ESDM</span>
              <span className="text-xs text-white/70 font-medium uppercase tracking-widest mt-1">Provinsi Jambi</span>
            </div>
          </Link>
        </div>

        {/* Center Content - Mission/Quote */}
        <div className="relative z-10 max-w-md">
          <div className="w-12 h-1 bg-accent mb-8" />
          <h2 className="text-3xl font-serif text-white leading-tight mb-6">
            "Mewujudkan Jambi Terang, Hemat Energi, dan Berkelanjutan."
          </h2>
          <p className="text-white/70 font-medium leading-relaxed">
            Sistem Pemantauan Penerangan Jalan Umum Tenaga Surya (PJUTS) Provinsi Jambi untuk pengelolaan energi daerah yang efisien.
          </p>
        </div>

        {/* Bottom Content - Footer */}
        <div className="relative z-10 flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-widest">
          <Building2 className="w-4 h-4" />
          <span>Official Government Portal</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-24 relative">
        {/* Top Left Action - Back to Home */}
        <div className="absolute top-6 left-6 lg:top-12 lg:left-12">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t("nav.beranda")}</span>
          </Link>
        </div>

        {/* Top Right Actions */}
        <div className="absolute top-6 right-6 lg:top-12 lg:right-12 flex items-center gap-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>

        <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-slate-100 p-8 md:p-10">
          {/* Mobile Logo (Visible only on mobile) */}
          <div className="lg:hidden flex justify-center mb-8">
             <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
              />
          </div>

          <div className="text-center lg:text-left mb-10">
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-2">
              {t("login.welcome")}
            </h1>
            <p className="text-slate-500 font-medium">
              {t("login.welcome_sub")}
            </p>
          </div>

          <Suspense fallback={<LoginFormFallback />}>
            <LoginFormContent />
          </Suspense>

          {/* Footer Links */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
             <p className="text-xs text-slate-400 font-medium">
                Protected by reCAPTCHA and subject to the 
                <a href="#" className="text-primary hover:underline ml-1">Privacy Policy</a> and 
                <a href="#" className="text-primary hover:underline ml-1">Terms of Service</a>.
             </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Dinas ESDM Provinsi Jambi. All rights reserved.
        </div>
      </div>
    </main>
  );
}
