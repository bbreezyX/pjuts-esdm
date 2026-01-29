"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReportsTable } from "@/components/reports/reports-table";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { ReportData } from "@/app/actions/reports";

interface ReportsPageClientProps {
  initialReports: ReportData[];
  total: number;
  page: number;
  totalPages: number;
  regencies: string[];
  initialRegency?: string;
  isAdmin?: boolean;
}

export function ReportsPageClient({
  initialReports,
  total,
  page,
  totalPages,
  regencies,
  initialRegency,
  isAdmin = false,
}: ReportsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Track search debounce timer
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [selectedRegency, setSelectedRegency] = useState<string | undefined>(
    initialRegency,
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>(
    () => {
      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");
      return {
        start: startDate ? new Date(startDate) : undefined,
        end: endDate ? new Date(endDate) : undefined,
      };
    },
  );

  const updateURL = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      // Reset to page 1 when filters change
      if (!updates.page) {
        params.set("page", "1");
      }

      startTransition(() => {
        router.push(`/reports?${params.toString()}`);
      });
    },
    [router, searchParams],
  );

  const handleRegencyChange = (regency: string | undefined) => {
    setSelectedRegency(regency);
    updateURL({ regency });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);

    // Clear any existing debounce timer
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Debounce search URL update
    searchTimeoutRef.current = setTimeout(() => {
      updateURL({ search: query || undefined });
    }, 500);
  };

  const handleDateRangeChange = (range: { start?: Date; end?: Date }) => {
    setDateRange(range);
    updateURL({
      startDate: range.start?.toISOString().split("T")[0],
      endDate: range.end?.toISOString().split("T")[0],
    });
  };

  const handleResetFilters = () => {
    // Clear any pending search debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = null;
    }

    // Reset all local state
    setSelectedRegency(undefined);
    setSearchQuery("");
    setDateRange({});

    // Clear all filter params in single URL update
    startTransition(() => {
      router.push("/reports?page=1");
    });
  };

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <ReportsFilters
        regencies={regencies}
        selectedRegency={selectedRegency}
        onRegencyChange={handleRegencyChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        onResetFilters={handleResetFilters}
      />

      <div className={isPending ? "opacity-50 pointer-events-none" : ""}>
        <ReportsTable
          reports={initialReports}
          total={total}
          page={page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}
