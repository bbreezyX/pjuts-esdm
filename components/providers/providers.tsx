"use client";

import { SessionProvider } from "next-auth/react";
import { SWRConfig } from "swr";
import { IdleTimeoutProvider } from "./idle-timeout-provider";
import { defaultSWRConfig } from "@/lib/swr";

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * Root providers wrapper for the application.
 * Includes:
 * - SessionProvider: NextAuth session management
 * - SWRConfig: Client-side data caching with stale-while-revalidate
 * - IdleTimeoutProvider: Role-based idle timeout detection
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <SWRConfig value={defaultSWRConfig}>
                <IdleTimeoutProvider>{children}</IdleTimeoutProvider>
            </SWRConfig>
        </SessionProvider>
    );
}
