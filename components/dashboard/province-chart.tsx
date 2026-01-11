"use client";

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

export function ProvinceChart({ data }: ProvinceChartProps) {
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
        <div className="bg-white/95 backdrop-blur shadow-xl border border-slate-100 rounded-xl p-3 text-xs z-50">
          <p className="font-semibold text-slate-800 mb-2 border-b border-slate-100 pb-1.5">
            {payload[0]?.payload?.fullName || label}
          </p>
          <div className="space-y-1.5">
            {payload.map((entry, index) => (
              <div key={index} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full shadow-sm"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-slate-500 capitalize">{entry.name === "maintenance" ? "Perawatan" : entry.name}</span>
                </div>
                <span className="font-semibold text-slate-700">{entry.value} Unit</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-slate-200/60 shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-base font-semibold text-slate-800">Unit per Provinsi (Top 8)</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
              barSize={24}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
              <XAxis type="number" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: '#94a3b8' }} />
              <YAxis
                type="category"
                dataKey="name"
                width={100}
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc', opacity: 0.5 }} />
              <Bar
                dataKey="operational"
                name="Operasional"
                stackId="a"
                fill="#10b981"
                radius={[4, 0, 0, 4]} // Start rounded
              />
              <Bar
                dataKey="maintenance"
                name="maintenance"
                stackId="a"
                fill="#f59e0b"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="offline"
                name="Offline"
                stackId="a"
                fill="#ef4444"
                radius={[0, 4, 4, 0]} // End rounded
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm ring-2 ring-emerald-100" />
            <span className="text-xs font-medium text-slate-600">Operasional</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm ring-2 ring-amber-100" />
            <span className="text-xs font-medium text-slate-600">Perlu Perawatan</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm ring-2 ring-red-100" />
            <span className="text-xs font-medium text-slate-600">Offline</span>
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

export function StatusDonutChart({ data }: { data: StatusDistribution }) {
  const chartData = [
    { name: "Operasional", value: data.operational, color: "#10b981", ring: "ring-emerald-100" },
    { name: "Perawatan", value: data.maintenanceNeeded, color: "#f59e0b", ring: "ring-amber-100" },
    { name: "Offline", value: data.offline, color: "#ef4444", ring: "ring-red-100" },
    { name: "Belum Verifikasi", value: data.unverified, color: "#94a3b8", ring: "ring-slate-100" },
  ].filter(item => item.value >= 0); // Include 0 to show empty states if needed, but usually > 0

  const total = chartData.reduce((acc, item) => acc + item.value, 0);

  return (
    <Card className="border-slate-200/60 shadow-sm overflow-hidden h-full">
      <CardHeader className="pb-2 bg-slate-50/50 border-b border-slate-100">
        <CardTitle className="text-base font-semibold text-slate-800">Distribusi Status</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex items-center justify-center relative py-4">
          <div className="relative w-52 h-52 group">
            {/* Decorative background glow */}
            <div className="absolute inset-4 rounded-full bg-slate-50 blur-2xl opacity-50 z-0"></div>

            {/* Simple CSS donut chart */}
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90 relative z-10 drop-shadow-sm">
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
                      className="transition-all duration-700 ease-out hover:opacity-80"
                    />
                  );
                }
                return acc;
              }, [] as React.ReactNode[])}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
              <span className="text-4xl font-bold text-slate-800 tracking-tight">
                {total.toLocaleString("id-ID")}
              </span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wide mt-1">Total Unit</span>
            </div>
          </div>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div
                className={`w-2.5 h-2.5 rounded-full shadow-sm ring-2 ${item.ring}`}
                style={{ backgroundColor: item.color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-slate-500 truncate uppercase tracking-wider">{item.name}</p>
                <p className="text-sm font-bold text-slate-800">
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

