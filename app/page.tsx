import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import HeroSection from "@/components/landing/HeroSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import WorkflowSection from "@/components/landing/WorkflowSection";
import CTASection from "@/components/landing/CTASection";

export default async function HomePage() {
  const session = await auth();

  // If user is logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-amber-400/30">
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works */}
      <WorkflowSection />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Image
                src="/logo-esdm.png"
                alt="Logo ESDM"
                width={48}
                height={48}
                className="w-10 h-10 object-contain grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all"
              />
              <div className="text-left">
                <h4 className="font-bold text-slate-900">PJUTS ESDM</h4>
                <p className="text-xs text-slate-500 uppercase tracking-wide">
                  Kementerian Energi dan Sumber Daya Mineral
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm text-slate-500 font-medium">
              <span>© {new Date().getFullYear()} ESDM RI</span>
              <Link href="#" className="hover:text-primary-600 transition-colors">Kebijakan Privasi</Link>
              <Link href="#" className="hover:text-primary-600 transition-colors">Bantuan</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
