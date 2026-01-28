"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { IdleTimeoutProvider } from "./idle-timeout-provider";
import { defaultSWRConfig } from "@/lib/swr";
import { LanguageProvider } from "@/lib/language-context";

interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * Root providers wrapper for the application.
 * Includes:
 * - SessionProvider: NextAuth session management
 * - SWRConfig: Client-side data caching with stale-while-revalidate
 * - IdleTimeoutProvider: Role-based idle timeout detection
 * - LanguageProvider: Multi-language support (ID/EN)
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <SWRConfig value={defaultSWRConfig}>
        <LanguageProvider>
          <IdleTimeoutProvider>{children}</IdleTimeoutProvider>
        </LanguageProvider>
      </SWRConfig>
    </SessionProvider>
  );
}
