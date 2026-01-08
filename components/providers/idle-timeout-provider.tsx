"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Clock, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Configuration for idle timeout based on role
const IDLE_CONFIG = {
    FIELD_STAFF: {
        idleTimeoutMs: 2 * 60 * 60 * 1000,    // 2 hours idle timeout
        warningBeforeMs: 5 * 60 * 1000,        // Show warning 5 minutes before logout
        enabled: true,
    },
    ADMIN: {
        idleTimeoutMs: 0,                       // No idle timeout for admin
        warningBeforeMs: 0,
        enabled: false,                         // Disabled - admin uses 24h JWT session only
    },
} as const;

// Events that indicate user activity
const ACTIVITY_EVENTS = [
    "mousedown",
    "mousemove",
    "keydown",
    "scroll",
    "touchstart",
    "click",
    "wheel",
] as const;

// Pages where we don't check for idle (public pages)
const EXCLUDED_PATHS = ["/", "/login"];

interface IdleTimeoutProviderProps {
    children: React.ReactNode;
}

export function IdleTimeoutProvider({ children }: IdleTimeoutProviderProps) {
    const { data: session, status } = useSession();
    const pathname = usePathname();

    const [showWarning, setShowWarning] = useState(false);
    const [countdown, setCountdown] = useState(0);

    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);
    const warningTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastActivityRef = useRef<number>(Date.now());

    // Get idle config based on user role
    const getIdleConfig = useCallback(() => {
        const role = session?.user?.role as keyof typeof IDLE_CONFIG;
        return IDLE_CONFIG[role] || IDLE_CONFIG.FIELD_STAFF;
    }, [session?.user?.role]);

    // Clear all timers
    const clearAllTimers = useCallback(() => {
        if (idleTimerRef.current) {
            clearTimeout(idleTimerRef.current);
            idleTimerRef.current = null;
        }
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }
    }, []);

    // Handle logout
    const handleLogout = useCallback(async () => {
        clearAllTimers();
        setShowWarning(false);
        await signOut({ callbackUrl: "/login?reason=idle" });
    }, [clearAllTimers]);

    // Reset idle timer (called on user activity)
    const resetIdleTimer = useCallback(() => {
        const config = getIdleConfig();

        // Don't set timer if idle detection is disabled
        if (!config.enabled) return;

        lastActivityRef.current = Date.now();
        setShowWarning(false);
        clearAllTimers();

        // Set timer to show warning
        const timeUntilWarning = config.idleTimeoutMs - config.warningBeforeMs;

        warningTimerRef.current = setTimeout(() => {
            setShowWarning(true);
            setCountdown(Math.floor(config.warningBeforeMs / 1000));

            // Start countdown
            countdownIntervalRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        handleLogout();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }, timeUntilWarning);

        // Set timer for actual logout (backup)
        idleTimerRef.current = setTimeout(() => {
            handleLogout();
        }, config.idleTimeoutMs);
    }, [getIdleConfig, clearAllTimers, handleLogout]);

    // Extend session (user clicked "Stay logged in")
    const extendSession = useCallback(() => {
        setShowWarning(false);
        resetIdleTimer();
    }, [resetIdleTimer]);

    // Set up activity listeners
    useEffect(() => {
        // Only run for authenticated users on protected pages
        if (status !== "authenticated") return;
        if (EXCLUDED_PATHS.includes(pathname)) return;

        const config = getIdleConfig();
        if (!config.enabled) return;

        // Throttle activity detection to reduce performance impact
        let throttleTimeout: NodeJS.Timeout | null = null;
        const throttleMs = 1000; // Check at most once per second

        const handleActivity = () => {
            if (throttleTimeout) return;

            throttleTimeout = setTimeout(() => {
                throttleTimeout = null;

                // Only reset timer if warning is not showing
                if (!showWarning) {
                    resetIdleTimer();
                }
            }, throttleMs);
        };

        // Add event listeners
        ACTIVITY_EVENTS.forEach((event) => {
            window.addEventListener(event, handleActivity, { passive: true });
        });

        // Also listen for visibility changes (user switches back to tab)
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !showWarning) {
                // Check if we should have logged out while tab was hidden
                const config = getIdleConfig();
                const idleTime = Date.now() - lastActivityRef.current;

                if (idleTime >= config.idleTimeoutMs) {
                    handleLogout();
                } else {
                    resetIdleTimer();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        // Start initial timer
        resetIdleTimer();

        // Cleanup
        return () => {
            ACTIVITY_EVENTS.forEach((event) => {
                window.removeEventListener(event, handleActivity);
            });
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            clearAllTimers();
            if (throttleTimeout) clearTimeout(throttleTimeout);
        };
    }, [status, pathname, getIdleConfig, resetIdleTimer, showWarning, clearAllTimers, handleLogout]);

    // Format countdown for display
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        if (mins > 0) {
            return `${mins} menit ${secs} detik`;
        }
        return `${secs} detik`;
    };

    return (
        <>
            {children}

            <AlertDialog open={showWarning} onOpenChange={setShowWarning}>
                <AlertDialogContent className="sm:max-w-md">
                    <AlertDialogHeader>
                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100">
                            <Clock className="h-7 w-7 text-amber-600" />
                        </div>
                        <AlertDialogTitle className="text-center text-xl">
                            Sesi Akan Berakhir
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-center space-y-2">
                            <p>
                                Anda tidak aktif dalam beberapa waktu. Demi keamanan, Anda akan
                                otomatis keluar dalam:
                            </p>
                            <p className="text-3xl font-bold text-amber-600 py-2">
                                {formatCountdown(countdown)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Klik tombol di bawah untuk tetap masuk.
                            </p>
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                            variant="outline"
                            onClick={handleLogout}
                            className="w-full sm:w-auto"
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            Keluar Sekarang
                        </Button>
                        <AlertDialogAction
                            onClick={extendSession}
                            className="w-full sm:w-auto"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Tetap Masuk
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
