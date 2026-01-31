"use client";

import { useState, useEffect, Suspense, useCallback } from "react";
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
  KeyRound,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/ui/pin-input";
import { useLanguage } from "@/lib/language-context";
import { motion, AnimatePresence } from "framer-motion";

type LoginStep = "credentials" | "pin-challenge";

interface PinChallengeData {
  pin: string;
  sessionToken: string;
  expiresAt: number;
}

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [idleMessage, setIdleMessage] = useState(false);
  
  // PIN challenge state
  const [step, setStep] = useState<LoginStep>("credentials");
  const [pinChallenge, setPinChallenge] = useState<PinChallengeData | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (searchParams.get("reason") === "idle") {
      setIdleMessage(true);
    }
  }, [searchParams]);

  // Countdown timer for PIN expiry
  useEffect(() => {
    if (!pinChallenge) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((pinChallenge.expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining === 0) {
        setError(t("login.pin_expired"));
        setStep("credentials");
        setPinChallenge(null);
        setPinInput("");
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [pinChallenge, t]);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[LOGIN] handleCredentialsSubmit called - fetching PIN challenge");
    setError("");
    setLoading(true);

    try {
      console.log("[LOGIN] Calling /api/auth/pin-challenge POST");
      const response = await fetch("/api/auth/pin-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "RATE_LIMITED") {
          setError(t("login.error_rate_limit"));
        } else if (data.error === "ACCOUNT_DISABLED") {
          setError(t("login.error_disabled"));
        } else {
          setError(t("login.error_credentials"));
        }
        return;
      }

      // Move to PIN challenge step - clear input first to prevent auto-submit race
      console.log("[LOGIN] PIN challenge received, transitioning to PIN step");
      setPinInput("");
      setPinError(false);
      setStep("pin-challenge");
      setPinChallenge({
        pin: data.pin,
        sessionToken: data.sessionToken,
        expiresAt: Date.now() + (data.expiresIn * 1000),
      });
      setTimeLeft(data.expiresIn);
    } catch {
      setError(t("login.error_general"));
    } finally {
      setLoading(false);
    }
  };

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput.length !== 6 || !pinChallenge) return;
    
    setLoading(true);
    setPinError(false);

    try {
      // Verify PIN
      const verifyResponse = await fetch("/api/auth/pin-challenge", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pin: pinInput, sessionToken: pinChallenge?.sessionToken }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        setPinError(true);
        setPinInput("");
        if (verifyData.error === "MAX_ATTEMPTS" || verifyData.error === "RATE_LIMITED") {
          setError(t("login.error_max_attempts"));
          setStep("credentials");
          setPinChallenge(null);
        } else if (verifyData.error === "PIN_EXPIRED" || verifyData.error === "INVALID_SESSION") {
          setError(t("login.pin_expired"));
          setStep("credentials");
          setPinChallenge(null);
        }
        // For INVALID_PIN, just show the error but stay on PIN screen
        return;
      }

      // PIN verified - now sign in
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("login.error_credentials"));
        setStep("credentials");
        setPinChallenge(null);
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

  const handleBackToCredentials = useCallback(() => {
    setStep("credentials");
    setPinChallenge(null);
    setPinInput("");
    setPinError(false);
    setError("");
  }, []);

  const handleRefreshPin = async () => {
    setLoading(true);
    setPinError(false);
    setPinInput("");
    
    try {
      const response = await fetch("/api/auth/pin-challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear PIN input first before setting challenge to prevent auto-submit race
        setPinInput("");
        setPinError(false);
        setPinChallenge({
          pin: data.pin,
          sessionToken: data.sessionToken,
          expiresAt: Date.now() + (data.expiresIn * 1000),
        });
        setTimeLeft(data.expiresIn);
        setStep("pin-challenge");
      } else {
        setError(t("login.error_general"));
        setStep("credentials");
      }
    } catch {
      setError(t("login.error_general"));
    } finally {
      setLoading(false);
    }
  };

  // Auto-submit disabled - user must click the button
  // This prevents race conditions with state updates
  // useEffect(() => {
  //   if (pinInput.length === 6 && step === "pin-challenge" && !loading && pinChallenge) {
  //     const timer = setTimeout(() => {
  //       const form = document.getElementById("pin-form") as HTMLFormElement;
  //       form?.requestSubmit();
  //     }, 100);
  //     return () => clearTimeout(timer);
  //   }
  // }, [pinInput, step, loading, pinChallenge]);

  if (step === "pin-challenge" && pinChallenge) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-5"
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="p-2 rounded-lg bg-primary/10">
            <KeyRound className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-slate-900">
              {t("login.pin_title")}
            </h3>
            <p className="text-xs text-slate-500">
              {t("login.pin_instruction")}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${timeLeft > 30 ? "bg-green-500" : timeLeft > 10 ? "bg-amber-500" : "bg-red-500"}`} />
            <span className={`text-xs font-mono font-medium tabular-nums ${timeLeft > 30 ? "text-slate-500" : timeLeft > 10 ? "text-amber-600" : "text-red-600"}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>

        {/* PIN Display - CAPTCHA style */}
        <div className="relative overflow-hidden rounded-xl bg-white border border-slate-200">
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
              {t("login.your_code")}
            </span>
            <button
              type="button"
              onClick={handleRefreshPin}
              disabled={loading}
              className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
              {t("login.new_code")}
            </button>
          </div>
          
          {/* CAPTCHA Canvas */}
          <div className="relative h-24 mx-4 mb-3 select-none" style={{ userSelect: 'none' }}>
            {/* Background noise dots */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {Array.from({ length: 30 }).map((_, i) => {
                const hue = Math.floor(Math.random() * 360);
                return (
                  <circle
                    key={`dot-${i}`}
                    cx={`${5 + Math.random() * 90}%`}
                    cy={`${10 + Math.random() * 80}%`}
                    r={1 + Math.random() * 3}
                    fill={`hsla(${hue}, 70%, 45%, ${0.3 + Math.random() * 0.4})`}
                  />
                );
              })}
            </svg>
            
            {/* Wavy crossing lines */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
              {Array.from({ length: 3 }).map((_, i) => {
                const hue = Math.floor(Math.random() * 360);
                return (
                  <path
                    key={`line-${i}`}
                    d={`M 0 ${30 + i * 20} Q ${50 + Math.random() * 30} ${20 + Math.random() * 40}, ${100 + Math.random() * 30} ${40 + Math.random() * 20} T ${200 + Math.random() * 30} ${30 + Math.random() * 30} T 300 ${40 + Math.random() * 20}`}
                    stroke={`hsla(${hue}, 70%, 40%, ${0.4 + Math.random() * 0.3})`}
                    strokeWidth={1 + Math.random()}
                    fill="none"
                  />
                );
              })}
            </svg>
            
            {/* Distorted digits */}
            <div 
              className="absolute inset-0 flex items-center justify-center"
              style={{ 
                fontFamily: "'Brush Script MT', 'Segoe Script', cursive",
                pointerEvents: 'none',
              }}
            >
              {pinChallenge.pin.split("").map((digit, i) => {
                const rotation = (i % 2 === 0 ? 1 : -1) * (8 + (i * 5) % 15);
                const translateY = Math.sin(i * 1.2) * 12;
                const translateX = (i - 2.5) * 28;
                const scale = 0.9 + Math.random() * 0.3;
                const hue = Math.floor(Math.random() * 360);
                
                return (
                  <span
                    key={i}
                    className="absolute text-4xl font-bold"
                    style={{
                      color: `hsl(${hue}, 70%, 35%)`,
                      transform: `translateX(${translateX}px) translateY(${translateY}px) rotate(${rotation}deg) scale(${scale})`,
                      textShadow: `2px 2px 4px hsla(${hue}, 70%, 35%, 0.3)`,
                      filter: 'url(#captcha-distort)',
                    }}
                  >
                    {digit}
                  </span>
                );
              })}
            </div>
            
            {/* SVG filter for distortion */}
            <svg className="absolute" width="0" height="0">
              <defs>
                <filter id="captcha-distort">
                  <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="2" result="turbulence" />
                  <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="3" xChannelSelector="R" yChannelSelector="G" />
                </filter>
              </defs>
            </svg>
            
            {/* More scattered dots */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {Array.from({ length: 15 }).map((_, i) => {
                const hue = Math.floor(Math.random() * 360);
                return (
                  <circle
                    key={`scatter-${i}`}
                    cx={`${Math.random() * 100}%`}
                    cy={`${Math.random() * 100}%`}
                    r={2 + Math.random() * 4}
                    fill={`hsla(${hue}, 60%, 50%, ${0.2 + Math.random() * 0.3})`}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* PIN Input */}
        <form id="pin-form" onSubmit={handlePinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2 text-center">
              {t("login.enter_code")}
            </label>
            <PinInput
              value={pinInput}
              onChange={setPinInput}
              disabled={loading}
              error={pinError}
            />
            {pinError && (
              <p className="text-xs text-red-600 text-center mt-2">
                {t("login.pin_incorrect")}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={loading || pinInput.length !== 6}
            className="w-full h-11 rounded-lg bg-primary hover:bg-primary/90 text-white font-semibold shadow-md shadow-primary/20 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t("login.verify")}
          </Button>

          <button
            type="button"
            onClick={handleBackToCredentials}
            className="w-full text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            {t("login.back")}
          </button>
        </form>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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
            className="h-12 rounded-lg bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-sm font-medium text-slate-900 placeholder:text-slate-400"
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
              className="h-12 rounded-lg bg-slate-50 border-slate-200 hover:border-slate-300 focus:border-primary focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 transition-all shadow-sm pr-12 font-medium text-slate-900 placeholder:text-slate-400"
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
                {t("login.security_note")}
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
