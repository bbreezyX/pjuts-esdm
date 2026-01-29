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
import { cn } from "@/lib/utils";

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
        name: item.province.length > 15
            ? item.province.substring(0, 15) + "..."
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
            payload: { fullName: string; total: number };
        }>;
        label?: string;
    }) => {
        if (active && payload && payload.length) {
            const total = payload[0]?.payload?.total || 0;
            return (
                <div className="bg-card/95 backdrop-blur-md shadow-2xl border border-border rounded-xl p-3 text-xs z-50 min-w-[180px]">
                    <p className="font-bold text-foreground mb-2 pb-2 border-b border-border text-sm">
                        {payload[0]?.payload?.fullName || label}
                    </p>
                    <div className="space-y-1.5">
                        {payload.map((entry, index) => (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: entry.color }}
                                    />
                                    <span className="text-muted-foreground">{entry.name}</span>
                                </div>
                                <span className="font-semibold text-foreground">{entry.value.toLocaleString('id-ID')}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 pt-2 border-t border-border flex justify-between">
                        <span className="text-muted-foreground font-medium">Total</span>
                        <span className="font-bold text-foreground">{total.toLocaleString('id-ID')} Unit</span>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        layout="vertical"
                        margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                        barSize={28}
                    >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={true} stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                            type="number" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={false} 
                            tick={{ fill: 'hsl(var(--muted-foreground))', fontWeight: 500 }} 
                            tickFormatter={(value) => value.toLocaleString('id-ID')}
                        />
                        <YAxis
                            type="category"
                            dataKey="name"
                            width={110}
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: 'hsl(var(--foreground))', fontWeight: 600 }}
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3, radius: 8 }} />
                        <Bar
                            dataKey="operational"
                            name="Operasional"
                            stackId="a"
                            fill="#003366"
                            radius={[4, 0, 0, 4]}
                        />
                        <Bar
                            dataKey="maintenance"
                            name="Perawatan"
                            stackId="a"
                            fill="#D4AF37"
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
            {/* Compact Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#003366]" />
                    <span className="text-[10px] font-medium text-muted-foreground">Operasional</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37]" />
                    <span className="text-[10px] font-medium text-muted-foreground">Perawatan</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm bg-[#ef4444]" />
                    <span className="text-[10px] font-medium text-muted-foreground">Offline</span>
                </div>
            </div>
        </div>
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
        { name: "Operasional", value: data.operational, color: "#003366", ring: "ring-primary/10" },
        { name: "Perawatan", value: data.maintenanceNeeded, color: "#D4AF37", ring: "ring-amber-500/10" },
        { name: "Offline", value: data.offline, color: "#ef4444", ring: "ring-red-500/10" },
        { name: "Belum Verifikasi", value: data.unverified, color: "#94a3b8", ring: "ring-slate-500/10" },
    ].filter(item => item.value >= 0);

    const total = chartData.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 group">
                {/* Decorative background glow */}
                <div className="absolute inset-4 rounded-full bg-primary/5 blur-3xl opacity-50 z-0 group-hover:opacity-80 transition-opacity"></div>

                {/* Simple CSS donut chart */}
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 relative z-10 drop-shadow-xl">
                    {chartData.reduce((acc, item, index) => {
                        const prevTotal = chartData
                            .slice(0, index)
                            .reduce((sum, d) => sum + d.value, 0);
                        const percentage = total > 0 ? (item.value / total) * 100 : 0;
                        const dashArray = `${percentage} ${100 - percentage}`;
                        const dashOffset = 100 - (total > 0 ? (prevTotal / total) * 100 : 0);

                        if (item.value > 0) {
                            acc.push(
                                <circle
                                    key={item.name}
                                    cx="18"
                                    cy="18"
                                    r="15.915"
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="3.5"
                                    strokeDasharray={dashArray}
                                    strokeDashoffset={dashOffset.toString()}
                                    strokeLinecap="round"
                                    className="transition-all duration-1000 ease-in-out hover:opacity-80 cursor-pointer"
                                />
                            );
                        }
                        return acc;
                    }, [] as React.ReactNode[])}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
                    <span className="text-5xl font-bold text-foreground tracking-tighter">
                        {total.toLocaleString("id-ID")}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total Unit</span>
                </div>
            </div>
            
            {/* Legend */}
            <div className="grid grid-cols-2 gap-4 mt-8 w-full">
                {chartData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 hover:bg-muted/60 transition-colors border border-transparent hover:border-border">
                        <div
                            className={`w-3 h-3 rounded-full shadow-sm ring-4 ${item.ring}`}
                            style={{ backgroundColor: item.color }}
                        />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-wider">{item.name}</p>
                            <p className="text-base font-bold text-foreground">
                                {item.value.toLocaleString("id-ID")}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
