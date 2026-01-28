"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Eye, EyeClosed, Lock, Check, Xmark } from "iconoir-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPassword, validateResetToken } from "@/app/actions/auth";
import { useLanguage } from "@/lib/language-context";

// Password requirements checker
function checkPasswordStrength(password: string) {
  return {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

function ResetPasswordFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const { t } = useLanguage();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenError, setTokenError] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const passwordStrength = checkPasswordStrength(password);
  const allRequirementsMet = Object.values(passwordStrength).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword !== "";

  // Validate token on mount
  useEffect(() => {
    async function validate() {
      if (!token) {
        setTokenError(t("reset.token_missing"));
        setValidating(false);
        return;
      }

      const result = await validateResetToken(token);
      setTokenValid(result.valid);
      if (!result.valid) {
        setTokenError(result.error || t("reset.token_invalid"));
      }
      setValidating(false);
    }
    validate();
  }, [token, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!allRequirementsMet) {
      setError(t("reset.error_requirements"));
      return;
    }

    if (!passwordsMatch) {
      setError(t("reset.error_mismatch"));
      return;
    }

    setLoading(true);

    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        setError(result.error || t("reset.token_invalid"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state while validating token
  if (validating) {
    return (
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-2xl animate-pulse">
          <Lock className="w-8 h-8 text-slate-400" />
        </div>
        <p className="text-slate-500">{t("reset.validating")}</p>
      </div>
    );
  }

  // Invalid or expired token
  if (!tokenValid) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full">
          <Xmark className="w-10 h-10 text-red-600" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {t("reset.invalid_title")}
          </h2>
          <p className="text-slate-500 text-sm">{tokenError}</p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center w-full h-12 rounded-xl text-base font-semibold bg-primary-600 text-white hover:bg-primary-700 transition-colors"
        >
          {t("reset.request_new")}
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 font-medium text-sm justify-center"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("reset.back_to_login")}
        </Link>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
          <Check className="w-10 h-10 text-green-600" strokeWidth={2.5} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {t("reset.success_title")}
          </h2>
          <p className="text-slate-500 text-sm">{t("reset.success_desc")}</p>
        </div>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium"
        >
          {t("reset.login_now")}
        </Link>
      </div>
    );
  }

  // Reset password form
  return (
    <>
      <div className="text-center lg:text-left">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
          <Lock className="w-8 h-8 text-primary-600" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
          {t("reset.form_title")}
        </h2>
        <p className="text-slate-500 text-sm">{t("reset.form_sub")}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-fade-in">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="relative space-y-2">
            <Input
              type={showPassword ? "text" : "password"}
              label={t("reset.new_password")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("reset.new_password_placeholder")}
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
                <EyeClosed className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Password strength indicators */}
          {password && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <p className="text-xs font-medium text-slate-600 mb-2">
                {t("reset.requirements")}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`flex items-center gap-2 ${
                    passwordStrength.minLength
                      ? "text-green-600"
                      : "text-slate-400"
                  }`}
                >
                  {passwordStrength.minLength ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Xmark className="w-3.5 h-3.5" />
                  )}
                  {t("reset.min_length")}
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordStrength.hasUppercase
                      ? "text-green-600"
                      : "text-slate-400"
                  }`}
                >
                  {passwordStrength.hasUppercase ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Xmark className="w-3.5 h-3.5" />
                  )}
                  {t("reset.has_uppercase")}
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordStrength.hasLowercase
                      ? "text-green-600"
                      : "text-slate-400"
                  }`}
                >
                  {passwordStrength.hasLowercase ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Xmark className="w-3.5 h-3.5" />
                  )}
                  {t("reset.has_lowercase")}
                </div>
                <div
                  className={`flex items-center gap-2 ${
                    passwordStrength.hasNumber
                      ? "text-green-600"
                      : "text-slate-400"
                  }`}
                >
                  {passwordStrength.hasNumber ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Xmark className="w-3.5 h-3.5" />
                  )}
                  {t("reset.has_number")}
                </div>
              </div>
            </div>
          )}

          <div className="relative space-y-2">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              label={t("reset.confirm_password")}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("reset.confirm_placeholder")}
              required
              className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:bg-white transition-all pr-12"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-[38px] text-slate-400 hover:text-slate-600 transition-colors p-1"
              tabIndex={-1}
            >
              {showConfirmPassword ? (
                <EyeClosed className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>

          {confirmPassword && (
            <div
              className={`text-xs flex items-center gap-2 ${
                passwordsMatch ? "text-green-600" : "text-red-500"
              }`}
            >
              {passwordsMatch ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Xmark className="w-3.5 h-3.5" />
              )}
              {passwordsMatch ? t("reset.match") : t("reset.no_match")}
            </div>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 rounded-xl text-base font-semibold shadow-lg shadow-primary-900/10 hover:shadow-primary-900/20 transition-all"
          loading={loading}
          disabled={!allRequirementsMet || !passwordsMatch}
        >
          {t("reset.submit")}
        </Button>
      </form>
    </>
  );
}

// Fallback for Suspense while loading
function ResetPasswordFormFallback() {
  return (
    <div className="space-y-5 animate-pulse">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
      <div className="h-8 bg-slate-100 rounded-xl w-3/4" />
      <div className="h-4 bg-slate-100 rounded w-1/2" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
      <div className="h-12 bg-slate-100 rounded-xl" />
    </div>
  );
}

function ResetPasswordPageContent() {
  const { t } = useLanguage();

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
                {t("reset.ministry")}
              </p>
            </div>
          </Link>

          <div className="max-w-xl">
            <h2 className="text-4xl font-bold text-white leading-tight mb-6">
              {t("reset.title")}
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500">
                {t("reset.title_highlight")}
              </span>
            </h2>
            <p className="text-primary-100 text-lg leading-relaxed opacity-90 max-w-lg">
              {t("reset.description")}
            </p>
          </div>

          <div className="text-xs text-primary-300/60 font-medium">
            {t("reset.copyright")}
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
            {t("reset.back_login")}
          </Link>
        </div>

        <div className="w-full max-w-[400px] space-y-8">
          {/* Wrap form in Suspense for useSearchParams */}
          <Suspense fallback={<ResetPasswordFormFallback />}>
            <ResetPasswordFormContent />
          </Suspense>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <ResetPasswordPageContent />;
}
