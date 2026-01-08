"use client";

import { SessionProvider } from "next-auth/react";
import { IdleTimeoutProvider } from "./idle-timeout-provider";

interface ProvidersProps {
    children: React.ReactNode;
}

/**
 * Root providers wrapper for the application.
 * Includes:
 * - SessionProvider: NextAuth session management
 * - IdleTimeoutProvider: Role-based idle timeout detection
 */
export function Providers({ children }: ProvidersProps) {
    return (
        <SessionProvider>
            <IdleTimeoutProvider>{children}</IdleTimeoutProvider>
        </SessionProvider>
    );
}
