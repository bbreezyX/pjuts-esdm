"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// Lazy load the heavy Recharts-based components
export const ProvinceChart = dynamic(
    () => import("./province-chart-impl").then((mod) => mod.ProvinceChartImpl),
    {
        ssr: false,
        loading: () => (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Unit per Provinsi (Top 8)</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[300px] flex items-center justify-center">
                        <div className="text-center">
                            <Skeleton className="w-full h-[280px] rounded-lg" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        ),
    }
);

export const StatusDonutChart = dynamic(
    () => import("./province-chart-impl").then((mod) => mod.StatusDonutChartImpl),
    {
        ssr: false,
        loading: () => (
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Distribusi Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center">
                        <Skeleton className="w-48 h-48 rounded-full" />
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <Skeleton className="h-3 w-3 rounded-full" />
                                <div>
                                    <Skeleton className="h-2 w-16 mb-1" />
                                    <Skeleton className="h-4 w-8" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        ),
    }
);
