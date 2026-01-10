"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Mail, Check } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestPasswordReset } from "@/app/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-[55%] bg-esdm-gradient relative overflow-hidden">
        <div
          className="absolute inset-0 bg-fixed opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='49' viewBox='0 0 28 49'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='hexagons' fill='%23cbd5e1' fill-opacity='0.4' fill-rule='nonzero'%3E%3Cpath d='M13.99 9.25l13 7.5v15l-13 7.5L1 31.75v-15l12.99-7.5zM3 17.9v12.7l10.99 6.34 11-6.35V17.9l-11-6.34L3 17.9zM0 15l12.98-7.5V0h-2v6.35L0 12.69v2.3zm0 18.5L12.98 41v8h-2v-6.85L0 35.81v-2.3zM15 0v7.5L27.99 15H28v-2.31h-.01L17 6.35V0h-2zm0 49v-8l12.99-7.5H28v2.31h-.01L17 42.15V49h-2z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/50 to-primary-950/90" />

        {/* Animated Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link
            href="/"
            className="flex items-center gap-4 group animate-fade-in"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={56}
                height={56}
                className="relative w-12 h-12 lg:w-14 lg:h-14 object-contain drop-shadow-2xl"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight leading-none">
                PJUTS <span className="text-amber-400">ESDM</span>
              </h1>
              <p className="text-xs text-primary-100 font-medium tracking-wide uppercase opacity-90">
                Kementerian ESDM RI
              </p>
            </div>
          </Link>

          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white leading-tight mb-6">
              Lupa Password? <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Kami Bantu Reset
              </span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed opacity-90 max-w-lg">
              Masukkan email terdaftar Anda dan kami akan mengirimkan link untuk
              mengatur ulang password akun Anda.
            </p>
          </div>

          <div className="text-xs text-primary-300/60 font-medium">
            © 2026 Kementerian Energi dan Sumber Daya Mineral Republik Indonesia
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <div className="absolute top-6 left-6 lg:hidden">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-primary-600/10 blur-xl rounded-full" />
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={40}
                height={40}
                className="relative w-10 h-10 object-contain drop-shadow-md group-hover:scale-105 transition-transform"
              />
            </div>
            <div>
              <span className="font-bold text-slate-900 text-lg block leading-none">
                PJUTS <span className="text-amber-500">ESDM</span>
              </span>
            </div>
          </Link>
        </div>

        <div className="absolute top-6 right-6">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          {!submitted ? (
            <>
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
                  <Mail className="w-8 h-8 text-primary-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
                  Lupa Password
                </h2>
                <p className="text-slate-500 text-sm">
                  Masukkan alamat email yang terdaftar pada akun Anda.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Input
                    type="email"
                    label="Email Kedinasan"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@esdm.go.id"
                    required
                    className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 transition-all"
                  loading={loading}
                >
                  Kirim Link Reset
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center space-y-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
                <Check className="w-10 h-10 text-green-600" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
                  Email Terkirim!
                </h2>
                <p className="text-slate-500 text-sm">
                  Jika email{" "}
                  <span className="font-medium text-slate-700">{email}</span>{" "}
                  terdaftar di sistem kami, Anda akan menerima link untuk reset
                  password dalam beberapa menit.
                </p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
                <p className="font-medium mb-1">Tidak menerima email?</p>
                <p>Cek folder spam atau coba lagi dengan email yang berbeda.</p>
              </div>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke halaman login
              </Link>
            </div>
          )}

          {!submitted && (
            <p className="text-center text-sm text-slate-500">
              Ingat password Anda?{" "}
              <Link
                href="/login"
                className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4"
              >
                Masuk di sini
              </Link>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
