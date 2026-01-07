"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReportsTable } from "@/components/reports/reports-table";
import { ReportsFilters } from "@/components/reports/reports-filters";
import { ReportData } from "@/app/actions/reports";

interface ReportsPageClientProps {
  initialReports: ReportData[];
  total: number;
  page: number;
  totalPages: number;
  provinces: string[];
  initialProvince?: string;
  isAdmin?: boolean;
}

export function ReportsPageClient({
  initialReports,
  total,
  page,
  totalPages,
  provinces,
  initialProvince,
  isAdmin = false,
}: ReportsPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [selectedProvince, setSelectedProvince] = useState<string | undefined>(
    initialProvince
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

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
    [router, searchParams]
  );

  const handleProvinceChange = (province: string | undefined) => {
    setSelectedProvince(province);
    updateURL({ province });
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    // Debounce search
    const timeoutId = setTimeout(() => {
      updateURL({ search: query || undefined });
    }, 500);
    return () => clearTimeout(timeoutId);
  };

  const handleDateRangeChange = (range: { start?: Date; end?: Date }) => {
    setDateRange(range);
    updateURL({
      startDate: range.start?.toISOString().split("T")[0],
      endDate: range.end?.toISOString().split("T")[0],
    });
  };

  const handlePageChange = (newPage: number) => {
    updateURL({ page: newPage.toString() });
  };

  return (
    <div className="space-y-4">
      <ReportsFilters
        provinces={provinces}
        selectedProvince={selectedProvince}
        onProvinceChange={handleProvinceChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
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

