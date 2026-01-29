"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { DashboardStats, ProvinceStats } from "@/app/actions/dashboard";
import { cn } from "@/lib/utils";
import { Lightbulb, CheckCircle2, ClipboardList } from "lucide-react";

interface AnalyticsChartsProps {
  stats: DashboardStats | undefined;
  provinces: ProvinceStats[];
  trend: { labels: string[]; data: number[] };
}

function StatCard({ 
  title, 
  value, 
  variant = "white",
  icon: Icon
}: { 
  title: string; 
  value: string | number; 
  variant?: "primary" | "white";
  icon?: React.ElementType;
}) {
  const isPrimary = variant === "primary";
  
  return (
    <div className={cn(
      "relative flex flex-col justify-between p-6 h-40 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
      "rounded-[2rem] shadow-sm border",
      isPrimary 
        ? "bg-primary-600 text-white border-primary-500 shadow-primary-900/20" 
        : "bg-white text-slate-900 border-slate-200/60 shadow-slate-100"
    )}>
      <div className="flex justify-between items-start">
         <span className={cn("text-base font-medium", isPrimary ? "text-primary-100" : "text-slate-500")}>
            {title}
          </span>
         <div className={cn(
            "p-2 rounded-full",
            isPrimary ? "bg-white/10 text-white" : "bg-slate-50 text-slate-600"
         )}>
           {Icon && <Icon className="w-5 h-5" />}
         </div>
      </div>
      <div className="text-4xl font-bold tracking-tight">
        {value}
      </div>
    </div>
  );
}

export function AnalyticsCharts({ stats, provinces, trend }: AnalyticsChartsProps) {
  // Prepare trend data for chart
  const trendData = trend.labels.map((label, index) => ({
    month: label,
    laporan: trend.data[index],
  }));

  // Prepare status distribution data
  const statusData = [
    { name: "Operasional", value: stats?.operationalUnits || 0, color: "#10b981" },
    { name: "Perlu Perawatan", value: stats?.maintenanceNeeded || 0, color: "#f59e0b" },
    { name: "Offline", value: stats?.offlineUnits || 0, color: "#ef4444" },
    { name: "Belum Verifikasi", value: stats?.unverifiedUnits || 0, color: "#94a3b8" },
  ];

  // Prepare province bar chart data
  const provinceChartData = provinces.slice(0, 10).map((p) => ({
    name: p.province.length > 15 ? p.province.substring(0, 15) + "..." : p.province,
    fullName: p.province,
    total: p.totalUnits,
    operational: p.operational,
    maintenance: p.maintenanceNeeded,
    offline: p.offline,
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      name: string;
      value: number;
      color: string;
      payload: { fullName?: string };
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4">
          <p className="font-bold text-slate-900 mb-2">
            {payload[0]?.payload?.fullName || label}
          </p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1 last:mb-0">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-600">{entry.name}:</span>
              <span className="font-medium text-slate-900 ml-auto pl-4">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 p-1">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Unit"
          value={stats?.totalUnits?.toLocaleString("id-ID") || 0}
          variant="primary"
          icon={Lightbulb}
        />
        <StatCard
          title="Tingkat Operasional"
          value={`${stats?.totalUnits
            ? Math.round((stats.operationalUnits / stats.totalUnits) * 100)
            : 0}%`}
          icon={CheckCircle2}
        />
        <StatCard
          title="Total Laporan"
          value={stats?.totalReports?.toLocaleString("id-ID") || 0}
          icon={ClipboardList}
        />
        <StatCard
          title="Rata-rata/Bulan"
          value={trend.data.length > 0
            ? Math.round(
              trend.data.reduce((a, b) => a + b, 0) / trend.data.length
            ).toLocaleString("id-ID")
            : 0}
            icon={CheckCircle2}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Monthly Trend */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900">Tren Laporan</h3>
            <p className="text-slate-500 mt-1">Aktivitas laporan per bulan</p>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis
                  dataKey="month"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  tick={{ fill: "#64748b" }}
                />
                <YAxis 
                   fontSize={12} 
                   tickLine={false} 
                   axisLine={false} 
                   dx={-10}
                   tick={{ fill: "#64748b" }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e2e8f0', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="laporan"
                  name="Laporan"
                  stroke="#003366" // primary-600
                  strokeWidth={3}
                  dot={{ fill: "#fff", stroke: "#003366", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#003366", stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-slate-900">Distribusi Status</h3>
            <p className="text-slate-500 mt-1">Status unit PJUTS terpasang</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-x-12 gap-y-8 min-h-[300px]">
             {/* Chart Section */}
             <div className="relative w-[220px] h-[220px] md:w-[260px] md:h-[260px] flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65} // Increased slightly
                      outerRadius={90} // Increased slightly
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={6} // More rounded
                      stroke="none"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                
                {/* Center Stats */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {stats?.totalUnits?.toLocaleString("id-ID") || 0}
                  </span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">
                    Total Unit
                  </span>
                </div>
             </div>

             {/* Legend Section */}
             <div className="flex-1 w-full max-w-xs space-y-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between group p-2 rounded-xl hover:bg-slate-50 transition-all duration-200 cursor-default border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="relative flex items-center justify-center w-4 h-4">
                        <div 
                          className="absolute w-full h-full rounded-full opacity-20"
                          style={{ backgroundColor: item.color }}
                        />
                         <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      </div>
                      <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-slate-900 font-mono">
                      {item.value.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Province Bar Chart */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Unit per Kabupaten/Kota</h3>
            <p className="text-slate-500 mt-1">Performa unit per wilayah di Provinsi Jambi</p>
          </div>
          <Badge variant="secondary" className="bg-slate-100 text-slate-600 hover:bg-slate-200">
            {provinces.length} Kabupaten/Kota
          </Badge>
        </div>
        <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={provinceChartData}
                layout="vertical"
                margin={{ left: 0, right: 0, top: 0, bottom: 0 }}
                barSize={24}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" fontSize={12} tickLine={false} axisLine={false} tick={{ fill: "#64748b" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={140}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#475569", fontWeight: 500 }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
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
                  radius={[0, 6, 6, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-emerald-700">Operasional</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-xs font-semibold text-amber-700">Perlu Perawatan</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-100">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-xs font-semibold text-red-700">Offline</span>
            </div>
        </div>
      </div>

      {/* Regency Table */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
        <div className="mb-8">
           <h3 className="text-xl font-bold text-slate-900">Detail Statistik Kabupaten/Kota</h3>
           <p className="text-slate-500 mt-1">Data lengkap per wilayah di Provinsi Jambi</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr className="text-slate-400 text-sm font-medium">
                <th className="px-4 py-2 font-medium">Kabupaten/Kota</th>
                <th className="px-4 py-2 text-center font-medium">Total</th>
                <th className="px-4 py-2 text-center font-medium text-emerald-600">Operasional</th>
                <th className="px-4 py-2 text-center font-medium text-amber-600">Perawatan</th>
                <th className="px-4 py-2 text-center font-medium text-red-600">Offline</th>
                <th className="px-4 py-2 text-center font-medium text-slate-500">Unverified</th>
                <th className="px-4 py-2 text-center font-medium text-primary-600">Laporan</th>
                <th className="px-4 py-2 text-center font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {provinces.map((prov) => {
                const operationalPercent = prov.totalUnits > 0
                  ? Math.round((prov.operational / prov.totalUnits) * 100)
                  : 0;
                return (
                  <tr key={prov.province} className="group hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 rounded-l-xl font-medium text-slate-700 group-hover:text-slate-900 border-y border-l border-transparent group-hover:border-slate-200">
                        {prov.province}
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 text-center border-y border-transparent group-hover:border-slate-200">
                      <Badge variant="outline" className="bg-white border-slate-200 text-slate-600 font-normal">{prov.totalUnits}</Badge>
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 text-center font-bold text-emerald-600 border-y border-transparent group-hover:border-slate-200">
                      {prov.operational}
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 text-center font-semibold text-amber-600 border-y border-transparent group-hover:border-slate-200">
                      {prov.maintenanceNeeded}
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 text-center font-semibold text-red-600 border-y border-transparent group-hover:border-slate-200">
                      {prov.offline}
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 text-center text-slate-400 border-y border-transparent group-hover:border-slate-200">
                      {prov.unverified}
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 text-center font-bold text-primary-600 border-y border-transparent group-hover:border-slate-200">
                      {prov.totalReports}
                    </td>
                    <td className="px-4 py-3 bg-slate-50/50 group-hover:bg-slate-50 rounded-r-xl text-center border-y border-r border-transparent group-hover:border-slate-200">
                      <Badge
                        className={cn(
                             operationalPercent >= 80 ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                             operationalPercent >= 60 ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                             "bg-red-100 text-red-700 hover:bg-red-200",
                             "border-0 shadow-none"
                        )}
                      >
                        {operationalPercent}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

