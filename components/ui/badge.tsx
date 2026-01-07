import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary-100 text-primary-800",
        secondary:
          "border-transparent bg-slate-100 text-slate-700",
        success:
          "border-transparent bg-emerald-100 text-emerald-800",
        warning:
          "border-transparent bg-amber-100 text-amber-800",
        destructive:
          "border-transparent bg-red-100 text-red-800",
        outline:
          "border-slate-200 text-slate-700",
        // Status badges for PJUTS
        operational:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        maintenance:
          "border-amber-200 bg-amber-50 text-amber-700",
        offline:
          "border-red-200 bg-red-50 text-red-700",
        unverified:
          "border-slate-200 bg-slate-50 text-slate-600",
        // Report status badges
        draft:
          "border-slate-300 bg-slate-100 text-slate-600",
        pending:
          "border-amber-300 bg-amber-100 text-amber-700",
        verified:
          "border-emerald-300 bg-emerald-100 text-emerald-700",
        rejected:
          "border-red-300 bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

