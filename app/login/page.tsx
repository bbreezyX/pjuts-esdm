"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowLeft, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Separate component that uses useSearchParams (needs Suspense boundary)
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [idleMessage, setIdleMessage] = useState(false);

  // Check if user was logged out due to idle timeout
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
        setError("Email atau password salah");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {idleMessage && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <Clock className="w-5 h-5 shrink-0" />
          <span>Sesi Anda berakhir karena tidak ada aktivitas. Silakan masuk kembali.</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
          </svg>
          {error}
        </div>
      )}

      <div className="space-y-4">
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

        <div className="relative space-y-2">
          <Input
            type={showPassword ? "text" : "password"}
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password anda"
            required
            className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all pr-12"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 transition-colors p-1"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          Ingat saya
        </label>
        <Link href="#" className="font-medium text-primary-600 hover:text-primary-700 hover:underline underline-offset-4">
          Lupa password?
        </Link>
      </div>

      <Button type="submit" className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 transition-all" loading={loading}>
        Masuk ke Dashboard
      </Button>
    </form>
  );
}

// Fallback for Suspense while loading
function LoginFormFallback() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex bg-slate-50">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-[55%] bg-esdm-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary-900/50 to-primary-950/90" />

        {/* Animated Orbs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 -left-24 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-700" />

        <div className="relative z-10 flex flex-col justify-between p-16 w-full">
          <Link href="/" className="flex items-center gap-4 group animate-fade-in">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/10 rounded-full text-amber-300 text-xs font-medium mb-6 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              Portal Monitoring Nasional
            </div>
            <h2 className="text-5xl font-bold text-white leading-tight mb-6">
              Sistem Monitoring <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                Infrastruktur PJUTS
              </span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed mb-12 opacity-90 max-w-lg">
              Platform terintegrasi untuk pemantauan real-time, manajemen aset, dan pelaporan kinerja Penerangan Jalan Umum Tenaga Surya di seluruh Indonesia.
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors group">
                <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">12.5K+</p>
                <p className="text-xs text-primary-200 uppercase tracking-wider font-medium">Unit Terpasang</p>
              </div>
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/10 transition-colors group">
                <p className="text-3xl font-bold text-white mb-1 group-hover:scale-105 transition-transform origin-left">34</p>
                <p className="text-xs text-primary-200 uppercase tracking-wider font-medium">Provinsi</p>
              </div>
              <div className="bg-amber-500/10 backdrop-blur-md rounded-2xl p-5 border border-amber-500/20 hover:bg-amber-500/20 transition-colors group">
                <p className="text-3xl font-bold text-amber-400 mb-1 group-hover:scale-105 transition-transform origin-left">99.9%</p>
                <p className="text-xs text-amber-200 uppercase tracking-wider font-medium">Uptime Server</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-primary-300/60 font-medium">
            © 2026 Kementerian Energi dan Sumber Daya Mineral Republik Indonesia
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
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
              <span className="font-bold text-slate-900 text-lg block leading-none">PJUTS <span className="text-amber-500">ESDM</span></span>
            </div>
          </Link>
        </div>

        <div className="absolute top-6 right-6">
          <Link href="/" className="text-sm font-medium text-slate-500 hover:text-primary-600 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Selamat Datang 👋
            </h2>
            <p className="text-slate-500 text-sm">
              Silakan masuk menggunakan kredensial akun terdaftar Anda.
            </p>
          </div>

          {/* Wrap form in Suspense for useSearchParams */}
          <Suspense fallback={<LoginFormFallback />}>
            <LoginFormContent />
          </Suspense>

          <p className="text-center text-sm text-slate-500">
            Belum punya akun akses? <br className="sm:hidden" />
            <Link href="#" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline underline-offset-4">
              Hubungi Administrator
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
