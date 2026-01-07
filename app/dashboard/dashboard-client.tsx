"use client";

import Link from "next/link";
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileBarChart,
  Calendar,
  Clock,
  TrendingUp,
  MapPin,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProvinceChart, StatusDonutChart } from "@/components/dashboard/charts-lazy";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardStats, ProvinceStats } from "@/app/actions/dashboard";
import { ExportDashboardButton } from "./export-button";

interface DashboardClientProps {
  stats: DashboardStats | undefined;
  provinces: ProvinceStats[];
  activities: Array<{
    id: string;
    type: "report" | "unit_added" | "status_change";
    description: string;
    timestamp: string;
    user: string;
    province?: string;
  }>;
}

export function DashboardClient({
  stats,
  provinces,
  activities,
}: DashboardClientProps) {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Pantau status PJUTS secara real-time di seluruh Indonesia"
      >
        <ExportDashboardButton stats={stats} provinces={provinces} />
        <Link href="/report/new">
          <Button size="sm">
            <FileBarChart className="h-4 w-4 mr-2" />
            Buat Laporan
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Unit"
          value={stats?.totalUnits || 0}
          icon={Lightbulb}
          color="blue"
          description="Unit PJUTS terpasang"
        />
        <StatCard
          title="Operasional"
          value={stats?.operationalUnits || 0}
          icon={CheckCircle2}
          color="green"
          trend={{ value: 98, isPositive: true }}
          description="Unit berfungsi normal"
        />
        <StatCard
          title="Perlu Perawatan"
          value={stats?.maintenanceNeeded || 0}
          icon={AlertTriangle}
          color="yellow"
          description="Membutuhkan tindakan"
        />
        <StatCard
          title="Offline"
          value={stats?.offlineUnits || 0}
          icon={XCircle}
          color="red"
          description="Tidak terhubung ke sistem"
        />
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-slate-200/60 shadow-sm bg-white/90 backdrop-blur-md hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Total Laporan
                </p>
                <p className="text-3xl font-bold text-primary-600 mt-1">
                  {stats?.totalReports?.toLocaleString("id-ID") || 0}
                </p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg shadow-sm">
                <FileBarChart className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span>Sejak sistem diluncurkan</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-white/90 backdrop-blur-md hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Laporan Bulan Ini
                </p>
                <p className="text-3xl font-bold text-slate-900 mt-1">
                  {stats?.reportsThisMonth?.toLocaleString("id-ID") || 0}
                </p>
              </div>
              <div className="p-2 bg-primary-100 rounded-lg shadow-sm">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                +24% dari bulan lalu
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/60 shadow-sm bg-white/90 backdrop-blur-md hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">
                  Laporan Hari Ini
                </p>
                <p className="text-3xl font-bold text-emerald-600 mt-1">
                  {stats?.reportsToday?.toLocaleString("id-ID") || 0}
                </p>
              </div>
              <div className="p-2 bg-emerald-100 rounded-lg shadow-sm">
                <Clock className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
              <span>Update terakhir: baru saja</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts & Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Province Chart - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ProvinceChart data={provinces} />
        </div>

        {/* Status Distribution */}
        <StatusDonutChart
          data={{
            operational: stats?.operationalUnits || 0,
            maintenanceNeeded: stats?.maintenanceNeeded || 0,
            offline: stats?.offlineUnits || 0,
            unverified: stats?.unverifiedUnits || 0,
          }}
        />
      </div>

      {/* Activity Feed & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActivityFeed
            activities={activities.map((a) => ({
              ...a,
              timestamp: new Date(a.timestamp),
            }))}
            maxHeight="400px"
          />
        </div>

        {/* Quick Actions */}
        <Card className="border-slate-200/60 shadow-sm bg-white/90 backdrop-blur-md h-full">
          <CardHeader className="pb-3 bg-slate-50/50 border-b border-slate-100">
            <CardTitle className="text-base font-semibold text-slate-800">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 pt-6">
            <Link href="/report/new" className="block">
              <div className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-primary-100 hover:bg-primary-50/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600 group-hover:bg-primary-100 group-hover:scale-105 transition-all">
                    <FileBarChart className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-primary-700 transition-colors">Buat Laporan Baru</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            <Link href="/map" className="block">
              <div className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-emerald-100 hover:bg-emerald-50/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 group-hover:scale-105 transition-all">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-emerald-700 transition-colors">Lihat Peta PJUTS</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            <Link href="/units" className="block">
              <div className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-amber-100 hover:bg-amber-50/30 hover:shadow-sm transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 group-hover:scale-105 transition-all">
                    <Lightbulb className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-amber-700 transition-colors">Kelola Unit</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
            <Link href="/reports" className="block">
              <div className="group flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm transition-all duration-200 cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:scale-105 transition-all">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">Riwayat Laporan</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Province Table */}
      <Card className="mt-6 border-slate-200/60 shadow-sm bg-white/90 backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-4 bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-lg">Statistik per Provinsi</CardTitle>
          <Link href="/analytics">
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 font-semibold">Provinsi</th>
                  <th className="px-6 py-4 text-center font-semibold">Total Unit</th>
                  <th className="px-6 py-4 text-center font-semibold text-emerald-600">Operasional</th>
                  <th className="px-6 py-4 text-center font-semibold text-amber-600">Perawatan</th>
                  <th className="px-6 py-4 text-center font-semibold text-red-600">Offline</th>
                  <th className="px-6 py-4 text-center font-semibold">Laporan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {provinces.slice(0, 10).map((prov, index) => (
                  <tr
                    key={prov.province}
                    className="group hover:bg-slate-50/50 transition-colors animate-in fade-in duration-500"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-6 py-4 font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                      {prov.province}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200">
                        {prov.totalUnits}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                        {prov.operational}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {prov.maintenanceNeeded > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          {prov.maintenanceNeeded}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {prov.offline > 0 ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20">
                          {prov.offline}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-slate-600">
                      {prov.totalReports > 0 ? prov.totalReports : <span className="text-slate-300">0</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

