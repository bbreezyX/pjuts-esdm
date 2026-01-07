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
  Download,
} from "lucide-react";
import { PageHeader } from "@/components/layout";
import { StatCard } from "@/components/dashboard/stat-card";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProvinceChart, StatusDonutChart } from "@/components/dashboard/charts-lazy";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DashboardStats, ProvinceStats } from "@/app/actions/dashboard";

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
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Link href="/report/new">
          <Button size="sm">
            <FileBarChart className="h-4 w-4 mr-2" />
            Buat Laporan
          </Button>
        </Link>
      </PageHeader>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Perlu Perawatan"
          value={stats?.maintenanceNeeded || 0}
          icon={AlertTriangle}
          color="yellow"
        />
        <StatCard
          title="Offline"
          value={stats?.offlineUnits || 0}
          icon={XCircle}
          color="red"
        />
      </div>

      {/* Report Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
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
              <div className="p-2 bg-primary-100 rounded-lg">
                <FileBarChart className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-sm text-slate-500">
              <TrendingUp className="h-4 w-4" />
              <span>Sejak sistem diluncurkan</span>
            </div>
          </CardContent>
        </Card>

        <Card>
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
              <div className="p-2 bg-primary-100 rounded-lg">
                <Calendar className="h-6 w-6 text-primary-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-3">
              <Badge variant="success" className="text-xs">
                +24% dari bulan lalu
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
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
              <div className="p-2 bg-emerald-100 rounded-lg">
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
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/report/new" className="block">
              <Button variant="outline" className="w-full justify-start">
                <FileBarChart className="h-4 w-4 mr-3 text-primary-600" />
                Buat Laporan Baru
              </Button>
            </Link>
            <Link href="/map" className="block">
              <Button variant="outline" className="w-full justify-start">
                <MapPin className="h-4 w-4 mr-3 text-emerald-600" />
                Lihat Peta PJUTS
              </Button>
            </Link>
            <Link href="/units" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Lightbulb className="h-4 w-4 mr-3 text-amber-600" />
                Kelola Unit
              </Button>
            </Link>
            <Link href="/reports" className="block">
              <Button variant="outline" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-3 text-slate-600" />
                Riwayat Laporan
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Province Table */}
      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Statistik per Provinsi</CardTitle>
          <Link href="/analytics">
            <Button variant="ghost" size="sm">
              Lihat Semua
            </Button>
          </Link>
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
                  <th className="text-center">Laporan</th>
                </tr>
              </thead>
              <tbody>
                {provinces.slice(0, 10).map((prov, index) => (
                  <tr
                    key={prov.province}
                    className="animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="font-medium text-slate-900">
                      {prov.province}
                    </td>
                    <td className="text-center">
                      <Badge variant="secondary">{prov.totalUnits}</Badge>
                    </td>
                    <td className="text-center">
                      <span className="text-emerald-600 font-medium">
                        {prov.operational}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-amber-600 font-medium">
                        {prov.maintenanceNeeded}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-red-600 font-medium">
                        {prov.offline}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="text-primary-600 font-medium">
                        {prov.totalReports}
                      </span>
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

