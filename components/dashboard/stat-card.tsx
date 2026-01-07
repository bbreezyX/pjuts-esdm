"use client";

import { ReactNode } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "blue" | "green" | "yellow" | "red" | "slate";
  className?: string;
}

const colorVariants = {
  blue: {
    bg: "bg-gradient-to-br from-primary-50 to-primary-100",
    icon: "bg-primary-500 text-white",
    text: "text-primary-700",
    border: "border-primary-200",
  },
  green: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    icon: "bg-emerald-500 text-white",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  yellow: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100",
    icon: "bg-amber-500 text-white",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  red: {
    bg: "bg-gradient-to-br from-red-50 to-red-100",
    icon: "bg-red-500 text-white",
    text: "text-red-700",
    border: "border-red-200",
  },
  slate: {
    bg: "bg-gradient-to-br from-slate-50 to-slate-100",
    icon: "bg-slate-500 text-white",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue",
  className,
}: StatCardProps) {
  const colors = colorVariants[color];

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 transition-all hover:shadow-md",
        colors.bg,
        colors.border,
        className
      )}
    >
      {/* Decorative Pattern */}
      <div className="absolute -right-4 -top-4 h-24 w-24 opacity-10">
        <Icon className="h-full w-full" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg shadow-sm",
              colors.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {trend && (
            <div
              className={cn(
                "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                trend.isPositive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {trend.value}%
            </div>
          )}
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className={cn("mt-1 text-3xl font-bold tracking-tight", colors.text)}>
            {typeof value === "number" ? value.toLocaleString("id-ID") : value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-slate-500">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Mini stat for inline display
interface MiniStatProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  color?: "blue" | "green" | "yellow" | "red";
}

export function MiniStat({ label, value, icon, color = "blue" }: MiniStatProps) {
  const textColors = {
    blue: "text-primary-600",
    green: "text-emerald-600",
    yellow: "text-amber-600",
    red: "text-red-600",
  };

  return (
    <div className="flex items-center gap-2">
      {icon && <span className="text-slate-400">{icon}</span>}
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className={cn("text-sm font-semibold", textColors[color])}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
      </div>
    </div>
  );
}

