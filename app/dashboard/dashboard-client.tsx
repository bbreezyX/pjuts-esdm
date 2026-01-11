"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import {
  LightBulb,
  CheckCircle,
  WarningTriangle,
  XmarkCircle,
  StatsReport,
  ArrowRight,
  Globe
} from "iconoir-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProvinceChart, StatusDonutChart } from "@/components/dashboard/charts-lazy";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DashboardStats, ProvinceStats, ActionResult } from "@/app/actions/dashboard";
import { ExportDashboardButton } from "./export-button";
import {
  StatsGridSkeleton,
  ChartsGridSkeleton,
  TableSkeleton
} from "@/components/dashboard/skeletons";
import { cn } from "@/lib/utils";

// Define Promise Types
type StatsPromise = Promise<ActionResult<DashboardStats>>;
type ProvincesPromise = Promise<ActionResult<ProvinceStats[]>>;
type ActivityPromise = Promise<ActionResult<Array<{
  id: string;
  type: "report" | "unit_added" | "status_change";
  description: string;
  timestamp: Date;
  user: string;
  province?: string;
}>>>;

interface DashboardClientProps {
  statsPromise: StatsPromise;
  provincesPromise: ProvincesPromise;
  activitiesPromise: ActivityPromise;
  user?: {
    name?: string | null;
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 19) return "Selamat Sore";
  return "Selamat Malam";
}

// ==========================================
// CUSTOM COMPONENTS FOR NEW DESIGN
// ==========================================

function ModernStatCard({ 
  title, 
  value, 
  subtext, 
  trend, 
  variant = "white", 
  icon: Icon 
}: { 
  title: string; 
  value: string | number; 
  subtext?: string;
  trend?: { value: number; isPositive: boolean };
  variant?: "primary" | "white" | "dark";
  icon?: React.ElementType;
}) {
  const isPrimary = variant === "primary";
  const isDark = variant === "dark";
  const isColored = isPrimary || isDark;
  
  return (
    <div className={cn(
      "relative flex flex-col justify-between p-7 h-52 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
      "rounded-[2rem] shadow-sm group border",
      isPrimary 
        ? "bg-primary-600 text-white border-primary-500 shadow-primary-900/20" 
        : isDark
          ? "bg-slate-900 text-white border-slate-800 shadow-slate-900/20"
          : "bg-white text-slate-900 border-slate-200/60 shadow-slate-100"
    )}>
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
           <span className={cn("text-base font-medium tracking-wide", isColored ? "text-primary-100" : "text-slate-500")}>
            {title}
          </span>
        </div>
        <div className={cn(
          "p-2.5 rounded-full transition-colors", 
          isColored 
            ? "bg-white/10 text-white group-hover:bg-white/20" 
            : "bg-slate-50 text-slate-600 group-hover:bg-slate-100"
        )}>
          {Icon ? <Icon className="w-5 h-5"/> : <ArrowRight className="w-5 h-5 -rotate-45" />}
        </div>
      </div>
      
      <div className="space-y-3 z-10">
        <div className="text-4xl lg:text-5xl font-bold tracking-tight">
          {value}
        </div>
        
        <div className="flex items-center gap-3">
             {trend && (
                 <Badge className={cn(
                   "rounded-full px-2.5 py-0.5 text-xs font-semibold border-0",
                   isColored 
                    ? "bg-white/20 text-white hover:bg-white/30" 
                    : trend.isPositive ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" : "bg-red-50 text-red-600 hover:bg-red-100"
                 )}>
                     {trend.isPositive ? "+" : ""}{trend.value}%
                 </Badge>
             )}
             {subtext && (
               <span className={cn("text-sm font-medium", isColored ? "text-primary-100/80" : "text-slate-500")}>
                {subtext}
              </span>
             )}
        </div>
      </div>

      {Icon && isColored && (
        <div className={cn("absolute bottom-6 right-6 opacity-0 group-hover:opacity-10 transition-opacity transform scale-150 pointer-events-none")}>
           <Icon className="w-24 h-24" />
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS USING use()
// ==========================================

function StatsGrid({ dataPromise }: { dataPromise: StatsPromise }) {
  const { data: stats } = use(dataPromise);

  const totalUnits = stats?.totalUnits || 0;
  const operationalUnits = stats?.operationalUnits || 0;
  const maintenanceUnits = stats?.maintenanceNeeded || 0;
  const offlineUnits = stats?.offlineUnits || 0;

  const operationalPercentage = totalUnits > 0
    ? Math.round((operationalUnits / totalUnits) * 100)
    : 0;
  
  const maintenancePercentage = totalUnits > 0
    ? Math.round((maintenanceUnits / totalUnits) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      <ModernStatCard
        title="Total Unit"
        value={totalUnits.toLocaleString('id-ID')}
        variant="primary"
        subtext="Terpasang"
        trend={{ value: 12, isPositive: true }} // Mock trend
        icon={LightBulb}
      />
      <ModernStatCard
        title="Operasional"
        value={operationalUnits.toLocaleString('id-ID')}
        variant="white"
        trend={{ value: operationalPercentage, isPositive: true }}
        icon={CheckCircle}
      />
      <ModernStatCard
        title="Perlu Perawatan"
        value={maintenanceUnits.toLocaleString('id-ID')}
        variant="white"
        trend={{ value: maintenancePercentage, isPositive: false }}
        icon={WarningTriangle}
      />
      <ModernStatCard
        title="Offline"
        value={offlineUnits.toLocaleString('id-ID')}
        variant="white"
        subtext="Tidak terhubung"
        icon={XmarkCircle}
      />
    </div>
  );
}

function MainContentGrid({ 
  statsPromise, 
  provincesPromise, 
  activitiesPromise 
}: { 
  statsPromise: StatsPromise, 
  provincesPromise: ProvincesPromise, 
  activitiesPromise: ActivityPromise 
}) {
  const { data: stats } = use(statsPromise);
  const { data: provinces } = use(provincesPromise);
  const { data: activities } = use(activitiesPromise);

  const safeProvinces = provinces || [];
  const safeActivities = activities || [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
      {/* Province Chart - Takes 2 columns */}
      <div className="xl:col-span-2 space-y-8">
        {/* Charts Section */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Sebaran Provinsi</h3>
              <p className="text-slate-500 mt-1">Distribusi unit PJUTS per wilayah</p>
            </div>
            <div className="flex gap-2">
               <span className="px-4 py-2 bg-slate-50 rounded-full text-xs font-semibold uppercase tracking-wider text-slate-500 border border-slate-200">
                  Nasional
               </span>
            </div>
          </div>
          <div className="h-[400px] w-full">
            <ProvinceChart data={safeProvinces} />
          </div>
        </div>

        {/* Status & Reports Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           {/* Status Donut */}
           <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 flex flex-col">
              <div className="mb-6">
                 <h3 className="text-lg font-bold text-slate-900">Status Unit</h3>
                 <p className="text-slate-500 text-sm">Rasio performa keseluruhan</p>
              </div>
              <div className="flex-1 flex items-center justify-center min-h-[250px]">
                 <StatusDonutChart
                  data={{
                    operational: stats?.operationalUnits || 0,
                    maintenanceNeeded: stats?.maintenanceNeeded || 0,
                    offline: stats?.offlineUnits || 0,
                    unverified: stats?.unverifiedUnits || 0,
                  }}
                />
              </div>
           </div>

           {/* Quick Reports Stats */}
           <div className="bg-slate-900 rounded-[2rem] p-8 shadow-sm text-white flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 transition-transform group-hover:scale-110 duration-700">
                 <StatsReport className="w-32 h-32 rotate-12 text-slate-200" />
              </div>
              
              <div className="relative z-10">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-white/10 rounded-xl">
                      <StatsReport className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-300">Laporan Masuk</h3>
                 </div>
                 <p className="text-5xl font-bold mt-4 tracking-tight">{stats?.totalReports || 0}</p>
                 <div className="mt-2 text-slate-400">Total laporan diterima</div>
              </div>

              <div className="space-y-4 mt-8 bg-white/5 rounded-2xl p-5 backdrop-blur-sm border border-white/5 relative z-10 transition-colors hover:bg-white/10">
                 <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Bulan Ini</span>
                    <span className="text-xl font-semibold">{stats?.reportsThisMonth || 0}</span>
                 </div>
                 <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-500 rounded-full" 
                      style={{ width: '75%' }} // Mock width
                    ></div>
                 </div>
                 <div className="flex justify-between items-center pt-1">
                    <span className="text-slate-400 text-sm">Hari Ini</span>
                    <span className="text-white font-medium bg-emerald-500/20 px-2 py-0.5 rounded text-xs text-emerald-400">
                      +{stats?.reportsToday || 0}
                    </span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Right Column: Activity & Hot Lists */}
      <div className="space-y-8">
        {/* Activity Feed */}
        <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60 h-full max-h-[900px] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-900">Aktivitas Terbaru</h3>
            <Link href="/reports">
               <div className="p-2 hover:bg-slate-50 rounded-full transition-colors cursor-pointer border border-slate-100 group">
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-900" />
               </div>
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 custom-scrollbar">
             <ActivityFeed
                activities={safeActivities.map((a) => ({
                  ...a,
                  timestamp: new Date(a.timestamp),
                }))}
                maxHeight="100%"
              />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProvinceTableSection({ provincesPromise }: { provincesPromise: ProvincesPromise }) {
  const { data: provinces } = use(provincesPromise);
  const safeProvinces = provinces || [];

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200/60">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <h3 className="text-xl font-bold text-slate-900">Detail Wilayah</h3>
           <p className="text-slate-500 mt-1">Status performa per provinsi</p>
        </div>
        <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-sm font-medium text-slate-600 border border-slate-200">
               <Globe className="w-4 h-4" />
               <span>Indonesia</span>
            </div>
            <Link href="/analytics">
              <Button variant="outline" className="rounded-full px-6 border-slate-200 hover:bg-slate-50 hover:text-slate-900">
                Lihat Semua
              </Button>
            </Link>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-slate-400 text-sm font-medium">
              <th className="px-6 py-2 font-medium">Provinsi</th>
              <th className="px-6 py-2 font-medium">Total Unit</th>
              <th className="px-6 py-2 font-medium">Status</th>
              <th className="px-6 py-2 text-right font-medium">Performa</th>
            </tr>
          </thead>
          <tbody className="">
            {safeProvinces.slice(0, 8).map((prov) => (
              <tr
                key={prov.province}
                className="group transition-all hover:scale-[1.005]"
              >
                <td className="px-6 py-4 bg-slate-50/50 group-hover:bg-slate-50 rounded-l-2xl border-y border-l border-transparent group-hover:border-slate-200 transition-colors">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 font-bold text-xs shadow-sm border border-slate-200 group-hover:border-primary-200 group-hover:text-primary-600 transition-colors">
                        {prov.province.substring(0, 2).toUpperCase()}
                     </div>
                     <span className="font-semibold text-slate-700 group-hover:text-slate-900">{prov.province}</span>
                  </div>
                </td>
                <td className="px-6 py-4 bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-200 transition-colors">
                  <div className="flex flex-col">
                     <span className="font-bold text-slate-900">{prov.totalUnits}</span>
                     <span className="text-xs text-slate-400">Unit terpasang</span>
                  </div>
                </td>
                <td className="px-6 py-4 bg-slate-50/50 group-hover:bg-slate-50 border-y border-transparent group-hover:border-slate-200 transition-colors">
                   <div className="flex gap-2">
                       {prov.operational > 0 && (
                           <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-0 shadow-none rounded-lg px-3">
                              {prov.operational} OK
                           </Badge>
                       )}
                       {(prov.maintenanceNeeded > 0 || prov.offline > 0) && (
                           <Badge className="bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-none rounded-lg px-3">
                              {prov.maintenanceNeeded + prov.offline} Issue
                           </Badge>
                       )}
                   </div>
                </td>
                <td className="px-6 py-4 bg-slate-50/50 group-hover:bg-slate-50 rounded-r-2xl border-y border-r border-transparent group-hover:border-slate-200 text-right transition-colors">
                   <div className="flex flex-col items-end gap-1">
                      <span className="font-bold text-slate-900">
                        {prov.totalUnits > 0 ? Math.round((prov.operational / prov.totalUnits) * 100) : 0}%
                      </span>
                      <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                         <div 
                           className="h-full bg-primary-500 rounded-full" 
                           style={{ width: `${prov.totalUnits > 0 ? (prov.operational / prov.totalUnits) * 100 : 0}%` }}
                         ></div>
                      </div>
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Wrapper to unwrap stats for export button only - optional or can just pass promise
function ExportButtonWrapper({ statsPromise, provincesPromise }: { statsPromise: StatsPromise, provincesPromise: ProvincesPromise }) {
  const { data: stats } = use(statsPromise);
  const { data: provinces } = use(provincesPromise);
  return <ExportDashboardButton stats={stats} provinces={provinces || []} />;
}


// ==========================================
// MAIN COMPONENT
// ==========================================

export function DashboardClient({
  statsPromise,
  provincesPromise,
  activitiesPromise,
  user,
}: DashboardClientProps) {
  const greeting = getGreeting();
  const displayName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8 font-sans selection:bg-primary-100 selection:text-primary-900">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
           <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                {greeting}, {displayName}
              </h1>
              <p className="text-slate-500 mt-2 text-lg">Pantau status & performa PJUTS Nasional</p>
           </div>
           
           <div className="flex items-center gap-3">
              <Suspense fallback={<Button disabled size="lg" className="rounded-full px-6">Loading...</Button>}>
                <ExportButtonWrapper statsPromise={statsPromise} provincesPromise={provincesPromise} />
              </Suspense>
              
              <Link href="/report/new">
                <Button size="lg" className="bg-primary-600 text-white hover:bg-primary-700 rounded-full px-6 shadow-lg shadow-primary-900/20 h-11">
                  <StatsReport className="h-5 w-5 mr-2" />
                  Buat Laporan
                </Button>
              </Link>
           </div>
        </div>

        {/* Stats Grid - "The Cards" */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Ringkasan Utama</p>
        <Suspense fallback={<StatsGridSkeleton />}>
          <StatsGrid dataPromise={statsPromise} />
        </Suspense>

        {/* Main Content Grid: Charts + Side Content */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest pl-1">Analisis & Aktivitas</p>
        <Suspense fallback={<ChartsGridSkeleton />}>
           <MainContentGrid 
             statsPromise={statsPromise} 
             provincesPromise={provincesPromise} 
             activitiesPromise={activitiesPromise} 
           />
        </Suspense>

        {/* Bottom Section: Table */}
        <Suspense fallback={<TableSkeleton />}>
          <ProvinceTableSection provincesPromise={provincesPromise} />
        </Suspense>
      </div>
    </div>
  );
}

