import { cn } from "@/lib/utils";
import { SystemRestart } from "iconoir-react";

interface SpinnerProps {
    size?: "sm" | "md" | "lg";
    className?: string;
}

const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
};

export function Spinner({ size = "md", className }: SpinnerProps) {
    return (
        <SystemRestart
            className={cn("animate-spin text-primary-600", sizeClasses[size], className)}
        />
    );
}

interface PageSpinnerProps {
    message?: string;
}

/**
 * Full page loading spinner
 */
export function PageSpinner({ message = "Memuat..." }: PageSpinnerProps) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Spinner size="lg" />
            <p className="text-sm text-slate-500 animate-pulse">{message}</p>
        </div>
    );
}
