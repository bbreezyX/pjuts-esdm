"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
    children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const [isVisible, setIsVisible] = useState(false);
    const [displayChildren, setDisplayChildren] = useState(children);

    useEffect(() => {
        // Fade out, update content, fade in
        setIsVisible(false);

        const timer = setTimeout(() => {
            setDisplayChildren(children);
            setIsVisible(true);
        }, 150);

        return () => clearTimeout(timer);
    }, [pathname, children]);

    // Initial mount
    useEffect(() => {
        setIsVisible(true);
    }, []);

    return (
        <div
            className={`transition-all duration-300 ease-out ${isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
        >
            {displayChildren}
        </div>
    );
}
