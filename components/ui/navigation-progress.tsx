"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Navigation progress bar that shows during page transitions
 * Improves perceived performance by providing visual feedback
 */
export function NavigationProgress() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isNavigating, setIsNavigating] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Reset progress when navigation completes
        setIsNavigating(false);
        setProgress(100);

        const timer = setTimeout(() => {
            setProgress(0);
        }, 200);

        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    // Listen for navigation start via click events on links
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const link = target.closest("a");

            if (link && link.href && !link.href.startsWith("javascript")) {
                const url = new URL(link.href);
                // Only show progress for internal navigation
                if (url.origin === window.location.origin && url.pathname !== pathname) {
                    setIsNavigating(true);
                    setProgress(30);

                    // Simulate progress
                    const interval = setInterval(() => {
                        setProgress((prev) => {
                            if (prev >= 90) {
                                clearInterval(interval);
                                return prev;
                            }
                            return prev + 10;
                        });
                    }, 150);
                }
            }
        };

        document.addEventListener("click", handleClick);
        return () => document.removeEventListener("click", handleClick);
    }, [pathname]);

    if (progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-primary-500 via-amber-400 to-primary-600 transition-all duration-300 ease-out shadow-lg shadow-primary-500/50"
                style={{
                    width: `${progress}%`,
                    opacity: progress === 100 ? 0 : 1,
                }}
            />
        </div>
    );
}
