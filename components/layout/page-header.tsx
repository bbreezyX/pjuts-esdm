import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  badge?: string;
}

export function PageHeader({
  title,
  description,
  children,
  badge,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:gap-6 mb-6 sm:mb-8 lg:mb-10">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        <div className="space-y-1.5 sm:space-y-2">
          {/* Badge/Breadcrumb */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              {badge || "PJUTS Monitoring"}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight leading-tight">
            {title}
          </h1>

          {/* Description */}
          {description && (
            <p className="text-muted-foreground text-xs sm:text-sm font-medium max-w-xl">
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        {children && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap sm:mt-2">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
