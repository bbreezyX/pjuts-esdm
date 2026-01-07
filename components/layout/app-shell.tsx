import { ReactNode, Suspense } from "react";
import { Navbar } from "./navbar";
import { MobileNav } from "./mobile-nav";
import { NavigationProgress } from "@/components/ui/navigation-progress";

interface AppShellProps {
  children: ReactNode;
  user: {
    name: string;
    email: string;
    role: string;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation progress bar for visual feedback */}
      <Suspense fallback={null}>
        <NavigationProgress />
      </Suspense>

      <Navbar user={user} />
      <main className="pb-20 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

