"use client";

import React from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ProvinceData {
    province: string;
    totalUnits: number;
    operational: number;
    maintenanceNeeded: number;
    offline: number;
}

interface ProvinceChartProps {
    data: ProvinceData[];
}

export function ProvinceChartImpl({ data }: ProvinceChartProps) {
    // Take top 8 provinces by total units
    const chartData = data.slice(0, 8).map((item) => ({
        name: item.province.length > 12
            ? item.province.substring(0, 12) + "..."
            : item.province,
        fullName: item.province,
        operational: item.operational,
        maintenance: item.maintenanceNeeded,
        offline: item.offline,
        total: item.totalUnits,
    }));

    const CustomTooltip = ({ active, payload, label }: {
        active?: boolean;
        payload?: Array<{
            name: string;
            value: number;
            color: string;
            payload: { fullName: string };
        }>;
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3">
                    <p className="font-medium text-slate-900 mb-2">
                        {payload[0]?.payload?.fullName || label}
                    </p>
                    {payload.map((entry, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-slate-600">{entry.name}:</span>
                            <span className="font-medium text-slate-900">{entry.value}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Unit per Provinsi (Top 8)</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={chartData}
                            layout="vertical"
                            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                            <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis
                                type="category"
                                dataKey="name"
                                width={100}
                                fontSize={11}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="operational"
                                name="Operasional"
                                stackId="a"
                                fill="#10b981"
                                radius={[0, 0, 0, 0]}
                            />
                            <Bar
                                dataKey="maintenance"
                                name="Perlu Perawatan"
                                stackId="a"
                                fill="#f59e0b"
                                radius={[0, 0, 0, 0]}
                            />
                            <Bar
                                dataKey="offline"
                                name="Offline"
                                stackId="a"
                                fill="#ef4444"
                                radius={[0, 4, 4, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                        <span className="text-xs text-slate-600">Operasional</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-amber-500" />
                        <span className="text-xs text-slate-600">Perlu Perawatan</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm bg-red-500" />
                        <span className="text-xs text-slate-600">Offline</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// Donut chart for status distribution
interface StatusDistribution {
    operational: number;
    maintenanceNeeded: number;
    offline: number;
    unverified: number;
}

export function StatusDonutChartImpl({ data }: { data: StatusDistribution }) {
    const chartData = [
        { name: "Operasional", value: data.operational, color: "#10b981" },
        { name: "Perawatan", value: data.maintenanceNeeded, color: "#f59e0b" },
        { name: "Offline", value: data.offline, color: "#ef4444" },
        { name: "Belum Terverifikasi", value: data.unverified, color: "#94a3b8" },
    ].filter(item => item.value > 0);

    const total = chartData.reduce((acc, item) => acc + item.value, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Distribusi Status</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex items-center justify-center">
                    <div className="relative w-48 h-48">
                        {/* Simple CSS donut chart */}
                        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                            {chartData.reduce((acc, item, index) => {
                                const prevTotal = chartData
                                    .slice(0, index)
                                    .reduce((sum, d) => sum + d.value, 0);
                                const percentage = (item.value / total) * 100;
                                const dashArray = `${percentage} ${100 - percentage}`;
                                const dashOffset = 100 - (prevTotal / total) * 100;

                                acc.push(
                                    <circle
                                        key={item.name}
                                        cx="18"
                                        cy="18"
                                        r="15.915"
                                        fill="transparent"
                                        stroke={item.color}
                                        strokeWidth="3"
                                        strokeDasharray={dashArray}
                                        strokeDashoffset={dashOffset}
                                        className="transition-all duration-500"
                                    />
                                );
                                return acc;
                            }, [] as React.ReactNode[])}
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-900">
                                {total.toLocaleString("id-ID")}
                            </span>
                            <span className="text-xs text-slate-500">Total Unit</span>
                        </div>
                    </div>
                </div>
                {/* Legend */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    {chartData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 truncate">{item.name}</p>
                                <p className="text-sm font-semibold text-slate-900">
                                    {item.value.toLocaleString("id-ID")}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
