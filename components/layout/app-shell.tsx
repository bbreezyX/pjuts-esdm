"use client";

import { ReactNode, Suspense } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { NavigationProgress } from "@/components/ui/navigation-progress";
import { OfflineBanner } from "@/components/ui/connection-status";
import { MobileNavProvider } from "@/hooks/use-mobile-nav";

interface AppShellProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();

  return (
    <MobileNavProvider>
      <div className="min-h-screen bg-background">
        {/* Offline banner for PWA */}
        <OfflineBanner />
        
        {/* Navigation progress bar for visual feedback */}
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>

        <Navbar user={user} />
        <main className="pb-24 md:pb-12 pt-4">
          <div className="mx-auto max-w-[1700px] px-4 sm:px-8 lg:px-12 py-6">
            {/* Page content with refined animation */}
            <div
              key={pathname}
              className="animate-fade-in transition-all duration-500"
            >
              {children}
            </div>
          </div>
        </main>
        <MobileNav />
      </div>
    </MobileNavProvider>
  );
}


