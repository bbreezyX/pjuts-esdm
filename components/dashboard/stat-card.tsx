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
    wrapper: "hover:border-primary-200 hover:shadow-primary-100/50",
    iconBg: "bg-primary-50",
    iconColor: "text-primary-600",
    trendPositive: "text-primary-600 bg-primary-50",
    trendNegative: "text-primary-600 bg-primary-50",
  },
  green: {
    wrapper: "hover:border-emerald-200 hover:shadow-emerald-100/50",
    iconBg: "bg-emerald-50",
    iconColor: "text-emerald-600",
    trendPositive: "text-emerald-600 bg-emerald-50",
    trendNegative: "text-emerald-600 bg-emerald-50",
  },
  yellow: {
    wrapper: "hover:border-amber-200 hover:shadow-amber-100/50",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-600",
    trendPositive: "text-amber-600 bg-amber-50",
    trendNegative: "text-amber-600 bg-amber-50",
  },
  red: {
    wrapper: "hover:border-red-200 hover:shadow-red-100/50",
    iconBg: "bg-red-50",
    iconColor: "text-red-600",
    trendPositive: "text-red-600 bg-red-50",
    trendNegative: "text-red-600 bg-red-50",
  },
  slate: {
    wrapper: "hover:border-slate-200 hover:shadow-slate-100/50",
    iconBg: "bg-slate-50",
    iconColor: "text-slate-600",
    trendPositive: "text-slate-600 bg-slate-50",
    trendNegative: "text-slate-600 bg-slate-50",
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
        "group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        colors.wrapper,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold tracking-tight text-slate-900">
              {typeof value === "number" ? value.toLocaleString("id-ID") : value}
            </h3>
          </div>
          
          {(description || trend) && (
             <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                    trend.isPositive
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-red-50 text-red-700"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {trend.value}%
                </span>
              )}
              {description && (
                <p className="text-xs text-slate-400 truncate max-w-[120px]">
                  {description}
                </p>
              )}
             </div>
          )}
        </div>

        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-colors",
            colors.iconBg,
            colors.iconColor
          )}
        >
          <Icon className="h-6 w-6 stroke-[2]" />
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
    <div className="flex items-center gap-3 rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
      {icon && <span className="text-slate-400">{icon}</span>}
      <div>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={cn("text-sm font-bold", textColors[color])}>
          {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        </p>
      </div>
    </div>
  );
}
