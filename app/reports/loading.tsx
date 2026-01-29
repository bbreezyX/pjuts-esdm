import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ReportsLoading() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Page Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        <div className="space-y-2">
          {/* Badge */}
          <div className="flex items-center gap-2">
            <Skeleton className="w-1.5 h-4 rounded-full" />
            <Skeleton className="h-3 w-28" />
          </div>
          {/* Title */}
          <Skeleton className="h-9 sm:h-10 w-36 sm:w-44" />
          {/* Description */}
          <Skeleton className="h-4 w-64 sm:w-80" />
        </div>
        <div className="flex gap-2 sm:gap-3 sm:mt-2">
          <Skeleton className="h-10 sm:h-11 w-28 sm:w-32 rounded-xl" />
          <Skeleton className="h-10 sm:h-11 w-32 sm:w-36 rounded-xl" />
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        <Skeleton className="h-11 sm:h-12 flex-1 rounded-xl sm:rounded-2xl" />
        <div className="flex gap-2 sm:gap-3">
          <Skeleton className="h-11 sm:h-12 w-32 sm:w-40 rounded-xl sm:rounded-2xl" />
          <Skeleton className="h-11 sm:h-12 w-24 sm:w-28 rounded-xl sm:rounded-2xl" />
        </div>
      </div>

      {/* Desktop Table Skeleton */}
      <div className="hidden lg:block space-y-3">
        {/* Table Header */}
        <div className="flex gap-6 px-6 py-4">
          {["w-24", "w-20", "w-16", "w-28", "w-24", "w-24", "w-16"].map(
            (width, i) => (
              <Skeleton key={i} className={`h-3 ${width}`} />
            ),
          )}
        </div>

        {/* Table Rows */}
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="p-5 rounded-[2rem] border-border/50"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex items-center gap-6">
              {/* Unit Info */}
              <div className="w-32 space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-20" />
              </div>
              {/* Image */}
              <Skeleton className="w-14 h-14 rounded-2xl" />
              {/* Voltage */}
              <Skeleton className="h-7 w-14 rounded-xl" />
              {/* Location */}
              <div className="flex items-center gap-2">
                <Skeleton className="w-7 h-7 rounded-lg" />
                <Skeleton className="h-4 w-20" />
              </div>
              {/* Reporter */}
              <div className="flex items-center gap-3 flex-1">
                <Skeleton className="w-9 h-9 rounded-2xl" />
                <Skeleton className="h-4 w-24" />
              </div>
              {/* Date */}
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-2.5 w-20" />
              </div>
              {/* Actions */}
              <div className="flex gap-2">
                <Skeleton className="w-9 h-9 rounded-xl" />
                <Skeleton className="w-9 h-9 rounded-xl" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Mobile Cards Skeleton */}
      <div className="lg:hidden space-y-3 sm:space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="p-4 sm:p-5 border-border/50"
            style={{ animationDelay: `${i * 0.1}s` }}
          >
            <div className="flex gap-3 sm:gap-4">
              {/* Image */}
              <Skeleton className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl shrink-0" />

              {/* Content */}
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
                    <Skeleton className="h-3 w-36 sm:w-44" />
                  </div>
                  <Skeleton className="h-6 w-12 rounded-lg" />
                </div>

                {/* Meta */}
                <div className="flex gap-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-20 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-border/50">
        <Skeleton className="h-4 w-48 order-2 sm:order-1" />
        <div className="flex items-center gap-2 order-1 sm:order-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <div className="hidden sm:flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-xl" />
            ))}
          </div>
          <Skeleton className="sm:hidden h-10 w-16 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
