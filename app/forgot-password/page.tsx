"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Check, ShieldCheck, Flash } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/app/actions/auth";
import { useLanguage } from "@/lib/language-context";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { t } = useLanguage();

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
    <main className="min-h-screen flex bg-gradient-to-br from-slate-50 via-white to-primary-50/30">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-[55%] bg-esdm-gradient relative overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 bg-fixed opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/50 to-primary-950/90" />

        {/* Animated Orbs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-primary-400/20 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 bg-[#D4AF37]/15 rounded-full blur-[80px] animate-pulse delay-700" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary-300/10 rounded-full blur-[60px] animate-pulse delay-1000" />

        <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-4 group animate-fade-in"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full scale-150" />
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={56}
                height={56}
                className="relative w-12 h-12 xl:w-14 xl:h-14 object-contain drop-shadow-2xl group-hover:scale-110 transition-transform"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                PJUTS <span className="text-[#E4C55B]">ESDM</span>
              </h1>
              <p className="text-xs text-primary-100 font-medium tracking-wide uppercase opacity-90">
                {t("forgot.ministry")}
              </p>
            </div>
          </Link>

          {/* Main Content */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-[#E4C55B] text-sm font-medium mb-8 backdrop-blur-md shadow-xl">
              <Mail className="w-4 h-4" />
              {t("forgot.badge")}
            </div>
            <h2 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
              {t("forgot.title")} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E4C55B] via-[#D4AF37] to-[#E4C55B]">
                {t("forgot.title_highlight")}
              </span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed mb-12 opacity-90 max-w-lg">
              {t("forgot.description")}
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white mb-1">
                  {t("forgot.secure")}
                </p>
                <p className="text-xs text-primary-200 font-medium">
                  {t("forgot.secure_desc")}
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-default">
                <div className="flex items-center gap-2 mb-2">
                  <Flash className="w-5 h-5 text-[#E4C55B]" />
                </div>
                <p className="text-lg font-bold text-white mb-1">
                  {t("forgot.fast")}
                </p>
                <p className="text-xs text-primary-200 font-medium">
                  {t("forgot.fast_desc")}
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-primary-300/60 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>{t("forgot.copyright")}</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0 relative">
        {/* Mobile Header with gradient */}
        <div className="lg:hidden bg-esdm-gradient px-6 pt-safe-top pb-8 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 opacity-10">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
          </div>
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-400/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-10 w-32 h-32 bg-[#D4AF37]/10 rounded-full blur-2xl" />

          {/* Mobile Nav */}
          <div className="relative flex items-center justify-between pt-4 mb-6">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={40}
                height={40}
                className="w-9 h-9 object-contain drop-shadow-lg"
              />
              <div>
                <span className="font-bold text-white text-base block leading-none">
                  PJUTS <span className="text-[#E4C55B]">ESDM</span>
                </span>
                <span className="text-[10px] text-primary-200 uppercase tracking-wider">
                  {t("forgot.ministry")}
                </span>
              </div>
            </Link>
            <Link
              href="/login"
              className="text-xs font-medium text-primary-200 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Login
            </Link>
          </div>

          {/* Mobile Welcome */}
          <div className="relative text-center">
            <h2 className="text-2xl font-bold text-white tracking-tight mb-1">
              {t("forgot.mobile_title")} 🔐
            </h2>
            <p className="text-primary-200 text-sm">{t("forgot.mobile_sub")}</p>
          </div>
        </div>

        {/* Desktop background decoration */}
        <div className="hidden lg:block absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-100/40 to-transparent rounded-full blur-3xl -z-10" />
        <div className="hidden lg:block absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#D4AF37]/10 to-transparent rounded-full blur-3xl -z-10" />

        {/* Form Container */}
        <div className="flex-1 flex flex-col items-center justify-center px-5 py-8 sm:p-10 lg:p-16 xl:p-24 bg-gradient-to-b from-white to-slate-50/80 lg:from-transparent lg:to-transparent -mt-4 lg:mt-0 rounded-t-3xl lg:rounded-none relative">
          {/* Desktop Back Button */}
          <div className="hidden lg:block absolute top-6 right-6">
            <Link
              href="/login"
              className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              {t("forgot.back_login")}
            </Link>
          </div>

          <div className="w-full max-w-[400px] space-y-6 lg:space-y-8">
            {!submitted ? (
              <>
                {/* Desktop Welcome Header */}
                <div className="hidden lg:block text-left space-y-3">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl shadow-sm mb-2">
                    <Mail className="w-8 h-8 text-primary-600" />
                  </div>
                  <h2 className="text-3xl xl:text-4xl font-bold text-slate-900 tracking-tight">
                    {t("forgot.desktop_title")}
                  </h2>
                  <p className="text-slate-500 text-base">
                    {t("forgot.desktop_sub")}
                  </p>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl lg:rounded-3xl p-5 sm:p-6 lg:p-8 shadow-lg shadow-slate-200/60 lg:shadow-xl lg:shadow-slate-200/50 border border-slate-100/80">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Input
                        type="email"
                        label={t("forgot.email_label")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={t("forgot.email_placeholder")}
                        required
                        className="h-12 rounded-xl bg-white border-slate-200 hover:border-primary-300 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-primary-600/25 hover:shadow-xl hover:shadow-primary-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 bg-primary-600 hover:bg-primary-700"
                      loading={loading}
                    >
                      {t("forgot.submit")}
                    </Button>

                    {/* Trust indicators */}
                    <div className="flex items-center justify-center gap-6 pt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>{t("forgot.encrypted")}</span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300" />
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Flash className="w-4 h-4 text-[#D4AF37]" />
                        <span>{t("forgot.time")}</span>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Help Text */}
                <p className="text-center text-sm text-slate-500 pb-4 lg:pb-0">
                  {t("forgot.remember")}{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4 transition-colors"
                  >
                    {t("forgot.login_here")}
                  </Link>
                </p>
              </>
            ) : (
              /* Success State */
              <div className="bg-white rounded-2xl lg:rounded-3xl p-6 sm:p-8 shadow-lg shadow-slate-200/60 lg:shadow-xl lg:shadow-slate-200/50 border border-slate-100/80">
                <div className="text-center space-y-6">
                  <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-full shadow-lg shadow-emerald-100">
                    <Check
                      className="w-10 h-10 text-emerald-600"
                      strokeWidth={2.5}
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                      {t("forgot.success_title")} ✉️
                    </h2>
                    <p className="text-slate-500 text-sm">
                      {t("forgot.success_desc").replace("{email}", email)}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-[#D4AF37]/10 to-[#E4C55B]/10 border border-[#D4AF37]/30 rounded-2xl p-4 text-sm text-[#D4AF37]">
                    <p className="font-semibold mb-1">
                      {t("forgot.check_spam")}
                    </p>
                    <p className="text-[#D4AF37]/80">{t("forgot.spam_hint")}</p>
                  </div>
                  <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-semibold transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t("forgot.back_to_login")}
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
