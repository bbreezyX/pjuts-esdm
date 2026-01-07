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
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DashboardStats, ProvinceStats } from "@/app/actions/dashboard";

interface AnalyticsChartsProps {
  stats: DashboardStats | undefined;
  provinces: ProvinceStats[];
  trend: { labels: string[]; data: number[] };
}

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#94a3b8"];

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
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Unit</p>
            <p className="text-2xl font-bold text-slate-900">
              {stats?.totalUnits?.toLocaleString("id-ID") || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Tingkat Operasional</p>
            <p className="text-2xl font-bold text-emerald-600">
              {stats?.totalUnits
                ? Math.round((stats.operationalUnits / stats.totalUnits) * 100)
                : 0}
              %
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Laporan</p>
            <p className="text-2xl font-bold text-primary-600">
              {stats?.totalReports?.toLocaleString("id-ID") || 0}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Rata-rata/Bulan</p>
            <p className="text-2xl font-bold text-slate-900">
              {trend.data.length > 0
                ? Math.round(
                  trend.data.reduce((a, b) => a + b, 0) / trend.data.length
                ).toLocaleString("id-ID")
                : 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tren Laporan Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="month"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="laporan"
                    name="Laporan"
                    stroke="#003366"
                    strokeWidth={2}
                    dot={{ fill: "#003366", strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: "#003366" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribusi Status Unit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <ResponsiveContainer width="50%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {statusData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-slate-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-slate-900">
                      {item.value.toLocaleString("id-ID")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Province Bar Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Unit per Provinsi (Top 10)</CardTitle>
            <Badge variant="secondary">
              {provinces.length} Provinsi
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={provinceChartData}
                layout="vertical"
                margin={{ left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
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
                />
                <Bar
                  dataKey="maintenance"
                  name="Perlu Perawatan"
                  stackId="a"
                  fill="#f59e0b"
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
          <div className="flex items-center justify-center gap-8 mt-4 pt-4 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-sm text-slate-600">Operasional</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-amber-500" />
              <span className="text-sm text-slate-600">Perlu Perawatan</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span className="text-sm text-slate-600">Offline</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Province Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Detail Statistik Provinsi</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Provinsi</th>
                  <th className="text-center">Total</th>
                  <th className="text-center">Operasional</th>
                  <th className="text-center">Perawatan</th>
                  <th className="text-center">Offline</th>
                  <th className="text-center">Belum Verifikasi</th>
                  <th className="text-center">Laporan</th>
                  <th className="text-center">% Operasional</th>
                </tr>
              </thead>
              <tbody>
                {provinces.map((prov) => {
                  const operationalPercent = prov.totalUnits > 0
                    ? Math.round((prov.operational / prov.totalUnits) * 100)
                    : 0;
                  return (
                    <tr key={prov.province}>
                      <td className="font-medium">{prov.province}</td>
                      <td className="text-center">
                        <Badge variant="secondary">{prov.totalUnits}</Badge>
                      </td>
                      <td className="text-center text-emerald-600 font-medium">
                        {prov.operational}
                      </td>
                      <td className="text-center text-amber-600 font-medium">
                        {prov.maintenanceNeeded}
                      </td>
                      <td className="text-center text-red-600 font-medium">
                        {prov.offline}
                      </td>
                      <td className="text-center text-slate-500">
                        {prov.unverified}
                      </td>
                      <td className="text-center text-primary-600 font-medium">
                        {prov.totalReports}
                      </td>
                      <td className="text-center">
                        <Badge
                          variant={
                            operationalPercent >= 80
                              ? "success"
                              : operationalPercent >= 60
                                ? "warning"
                                : "destructive"
                          }
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
        </CardContent>
      </Card>
    </div>
  );
}

