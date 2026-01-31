"use client";

import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
}

export function BentoCard({
  children,
  className,
  padding = "p-8",
}: BentoCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-bento border border-border shadow-sm overflow-hidden",
        padding,
        className,
      )}
    >
      {children}
    </div>
  );
}
