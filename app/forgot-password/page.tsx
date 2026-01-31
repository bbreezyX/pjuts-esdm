"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Check, ShieldCheck, Globe, Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/app/actions/auth";
import { useLanguage } from "@/lib/language-context";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t, language, toggleLanguage } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

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
            "Keamanan akun Anda adalah prioritas kami."
          </h2>
          <p className="text-white/70 font-medium leading-relaxed">
            {t("forgot.description")}
          </p>
        </div>

        {/* Bottom Content - Footer */}
        <div className="relative z-10 flex items-center gap-2 text-white/40 text-xs font-medium uppercase tracking-widest">
          <Building2 className="w-4 h-4" />
          <span>Official Government Portal</span>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12 xl:p-24 relative">
        {/* Top Left Action - Back to Login */}
        <div className="absolute top-6 left-6 lg:top-12 lg:left-12">
          <Link
            href="/login"
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span>{t("forgot.back_login")}</span>
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

          {!submitted ? (
            <>
              <div className="text-center lg:text-left mb-10">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-4">
                  <Mail className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  {t("forgot.desktop_title")}
                </h1>
                <p className="text-slate-500 font-medium">
                  {t("forgot.desktop_sub")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 ml-1">
                    {t("forgot.email_label")}
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("forgot.email_placeholder")}
                    required
                    className="h-12 rounded-lg bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-sm font-medium text-slate-900 placeholder:text-slate-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    t("forgot.submit")
                  )}
                </Button>

                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 pt-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <span>{t("forgot.encrypted")}</span>
                  </div>
                </div>
              </form>

              {/* Help Text */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm text-slate-500 font-medium">
                  {t("forgot.remember")}{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary hover:text-primary/80 hover:underline underline-offset-4 transition-colors"
                  >
                    {t("forgot.login_here")}
                  </Link>
                </p>
              </div>
            </>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full">
                <Check className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  {t("forgot.success_title")} ✉️
                </h2>
                <p className="text-slate-500 text-sm">
                  {t("forgot.success_desc").replace("{email}", email)}
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                <p className="font-semibold mb-1">{t("forgot.check_spam")}</p>
                <p className="text-amber-600">{t("forgot.spam_hint")}</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                {t("forgot.back_to_login")}
              </Link>
            </motion.div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} Dinas ESDM Provinsi Jambi. All rights reserved.
        </div>
      </div>
    </main>
  );
}
