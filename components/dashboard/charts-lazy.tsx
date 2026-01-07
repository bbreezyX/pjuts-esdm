"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Type definitions for the chart components
export interface ProvinceData {
    province: string;
    totalUnits: number;
    operational: number;
    maintenanceNeeded: number;
    offline: number;
    totalReports?: number;
}

export interface ProvinceChartProps {
    data: ProvinceData[];
}

export interface StatusDistribution {
    operational: number;
    maintenanceNeeded: number;
    offline: number;
    unverified: number;
}

export interface StatusDonutChartProps {
    data: StatusDistribution;
}

// Lazy load the heavy Recharts-based components with proper typing
// Using dynamic import with explicit typing to fix TypeScript module resolution
export const ProvinceChart = dynamic<ProvinceChartProps>(
    async () => {
        const mod = await import("./province-chart-impl");
        return mod.ProvinceChartImpl;
    },
    {
        ssr: false,
        loading: () => (
            <Card className="border-slate-200/60 shadow-sm overflow-hidden h-full">
                <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base font-semibold text-slate-800">Unit per Provinsi (Top 8)</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="h-[320px] flex items-center justify-center">
                        <div className="text-center w-full px-4">
                            <div className="flex items-end justify-between h-[280px] gap-2">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} className="w-full rounded-t-lg" style={{ height: `${Math.random() * 80 + 20}%` }} />
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ),
    }
);

export const StatusDonutChart = dynamic<StatusDonutChartProps>(
    async () => {
        const mod = await import("./province-chart-impl");
        return mod.StatusDonutChartImpl;
    },
    {
        ssr: false,
        loading: () => (
            <Card className="border-slate-200/60 shadow-sm overflow-hidden h-full">
                <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
                    <CardTitle className="text-base font-semibold text-slate-800">Distribusi Status</CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-4">
                        <Skeleton className="w-52 h-52 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2.5 p-1.5">
                                <Skeleton className="h-2.5 w-2.5 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-2 w-16" />
                                    <Skeleton className="h-3 w-10" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        ),
    }
);
