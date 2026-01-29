"use client";

import { use, Suspense } from "react";
import Link from "next/link";
import {
  TrendingUp,
  ArrowUpRight,
  Plus,
  Briefcase,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  WifiOff,
  FileText,
  Globe,
  ArrowRight
} from "lucide-react";
import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { ProvinceChart } from "@/components/dashboard/charts-lazy";
import { Button } from "@/components/ui/button";
import { DashboardStats, ProvinceStats, ActionResult, DashboardUser } from "@/app/actions/dashboard";
import { ExportDashboardButton } from "./export-button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
type UsersPromise = Promise<ActionResult<DashboardUser[]>>;

interface DashboardClientProps {
  statsPromise: StatsPromise;
  provincesPromise: ProvincesPromise;
  activitiesPromise: ActivityPromise;
  usersPromise: UsersPromise;
  user?: {
    name?: string | null;
  };
}

/**
 * Get the initial letter(s) from a user's name for avatar display
 */
function getUserInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

/**
 * Generate a consistent background color based on user ID
 * Uses theme-consistent primary blue shades for a clean look
 */
function getAvatarColor(userId: string): string {
  const colors = [
    "bg-primary-500",
    "bg-primary-600",
    "bg-primary-700",
    "bg-primary-400",
  ];
  // Simple hash based on userId to get consistent color
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Selamat Pagi";
  if (hour < 15) return "Selamat Siang";
  if (hour < 19) return "Selamat Sore";
  return "Selamat Malam";
}

// ==========================================
// BENTO COMPONENTS
// ==========================================

function BentoCard({ 
  children, 
  className,
  padding = "p-8"
}: { 
  children: React.ReactNode; 
  className?: string;
  padding?: string;
}) {
  return (
    <div className={cn(
      "bg-card rounded-bento border border-border shadow-sm overflow-hidden",
      padding,
      className
    )}>
      {children}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS USING use()
// ==========================================

function DashboardBentoGrid({ 
  statsPromise, 
  provincesPromise, 
  activitiesPromise,
}: { 
  statsPromise: StatsPromise, 
  provincesPromise: ProvincesPromise, 
  activitiesPromise: ActivityPromise,
}) {
  const { data: stats } = use(statsPromise);
  const { data: provinces } = use(provincesPromise);
  const { data: activities } = use(activitiesPromise);

  const totalUnits = stats?.totalUnits || 0;
  const operationalUnits = stats?.operationalUnits || 0;
  const maintenanceUnits = stats?.maintenanceNeeded || 0;
  const offlineUnits = stats?.offlineUnits || 0;

  const operationalPercentage = totalUnits > 0
    ? Math.round((operationalUnits / totalUnits) * 100)
    : 0;

  const safeProvinces = provinces || [];
  const safeActivities = activities || [];

  return (
    <div className="grid grid-cols-12 gap-6">
      
      {/* 1. Main Stat Card (Income Project Style) */}
      <BentoCard className="col-span-12 lg:col-span-8 flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-foreground">Total Unit Terpasang</h3>
              <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full">Provinsi Jambi</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <TrendingUp size={14} />
              +12.8%
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-muted px-3 py-1.5 rounded-xl text-xs font-semibold text-muted-foreground">
              Tahun 2026
            </div>
            <button className="p-1.5 hover:bg-muted rounded-lg transition-colors text-muted-foreground">
              <ArrowUpRight size={18} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-12 mt-4">
          <div className="flex flex-col gap-2">
            <span className="text-6xl font-bold tracking-tighter text-foreground">
              {totalUnits.toLocaleString('id-ID')}
            </span>
            <p className="text-xs text-muted-foreground">Pertumbuhan unit baru di seluruh Kabupaten/Kota</p>
            <div className="flex items-center gap-3 mt-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-xl">
                <Globe size={14} className="text-muted-foreground" />
                <span className="text-xs font-medium text-muted-foreground">{safeProvinces.length} Kabupaten/Kota</span>
              </div>
              <Link href="/units" className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
                Lihat Semua Unit <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* Waveform-like Visual for Stats */}
          <div className="flex-1 flex items-end justify-between h-32 px-4 relative max-w-md">
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
               <div className="w-full border-t border-dashed border-muted/50"></div>
               <div className="w-full border-t border-dashed border-muted/50"></div>
               <div className="w-full border-t border-dashed border-muted/50"></div>
            </div>
            {[40, 70, 45, 90, 65, 80, 50, 85].map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-2 relative z-10 group">
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${h}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  className={cn(
                    "w-6 md:w-8 rounded-t-lg transition-all duration-500",
                    i === 3 ? "bg-primary shadow-lg shadow-primary/20" : "bg-muted group-hover:bg-primary/40"
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </BentoCard>

      {/* 2. Operational Progress (Share Progress style) */}
      <BentoCard className="col-span-12 lg:col-span-4 flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold leading-tight text-foreground">Status<br/>Operasional</h3>
          <button className="p-2 border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all">
            <ArrowUpRight size={18} />
          </button>
        </div>

        <div className="relative py-4 flex items-center justify-center">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle cx="96" cy="96" r="80" className="stroke-muted fill-none" strokeWidth="16" />
            <motion.circle 
              cx="96" cy="96" r="80" 
              className="stroke-primary fill-none" 
              strokeWidth="16" 
              strokeDasharray="502.4" 
              initial={{ strokeDashoffset: 502.4 }}
              animate={{ strokeDashoffset: 502.4 * (1 - operationalPercentage / 100) }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-foreground">{operationalPercentage}%</span>
            <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Berfungsi</span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                 <span className="text-xs font-semibold text-muted-foreground">Normal</span>
              </div>
              <span className="text-xs font-bold text-foreground">{operationalUnits.toLocaleString('id-ID')}</span>
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                 <span className="text-xs font-semibold text-muted-foreground">Maintenance</span>
              </div>
              <span className="text-xs font-bold text-foreground">{maintenanceUnits.toLocaleString('id-ID')}</span>
           </div>
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                 <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                 <span className="text-xs font-semibold text-muted-foreground">Offline</span>
              </div>
              <span className="text-xs font-bold text-foreground">{offlineUnits.toLocaleString('id-ID')}</span>
           </div>
        </div>
      </BentoCard>

      {/* 3. Issues & Reminders (Reminders style) */}
      <BentoCard className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold text-foreground">Perhatian Khusus</h3>
          <button className="text-[10px] font-bold text-muted-foreground hover:text-foreground">Lihat Semua</button>
        </div>
        <div className="space-y-4">
           <div className="p-5 bg-primary text-primary-foreground rounded-3xl shadow-lg shadow-primary/20">
              <div className="flex justify-between items-center mb-2">
                 <span className="text-[10px] font-bold opacity-80 uppercase tracking-wider">Perbaikan Mendesak</span>
                 <AlertTriangle size={16} />
              </div>
              <p className="text-lg font-bold leading-tight">{maintenanceUnits} Unit memerlukan pengecekan teknis segera.</p>
           </div>
           
           <div className="p-5 bg-muted rounded-3xl flex justify-between items-center group hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center text-red-500 shadow-sm">
                    <WifiOff size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-foreground">{offlineUnits} Unit Offline</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Koneksi terputus hari ini</p>
                 </div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
           </div>

           <div className="p-5 bg-muted rounded-3xl flex justify-between items-center group hover:bg-muted/80 transition-colors cursor-pointer">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-2xl bg-card flex items-center justify-center text-primary shadow-sm">
                    <FileText size={20} />
                 </div>
                 <div>
                    <p className="text-sm font-bold text-foreground">{stats?.reportsToday || 0} Laporan Baru</p>
                    <p className="text-[10px] text-muted-foreground font-medium">Menunggu verifikasi admin</p>
                 </div>
              </div>
              <ArrowRight size={16} className="text-muted-foreground group-hover:text-foreground transition-transform group-hover:translate-x-1" />
           </div>
        </div>
      </BentoCard>

      {/* 4. Province Chart (Meeting Schedule style header + Large Grid) */}
      <BentoCard className="col-span-12 lg:col-span-8">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
          <div>
             <h3 className="text-xl font-bold mb-1 text-foreground">Sebaran Kabupaten/Kota</h3>
             <p className="text-xs text-muted-foreground">Distribusi unit PJUTS per wilayah di Provinsi Jambi</p>
          </div>
          <div className="flex items-center gap-2">
             <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-xl text-[10px] font-bold text-muted-foreground">
               <Globe size={12} />
               <span>{safeProvinces.length} Kabupaten/Kota</span>
             </div>
             <Link href="/map">
               <Button variant="outline" size="sm" className="rounded-xl text-xs font-bold h-8">
                 Lihat Peta
               </Button>
             </Link>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-primary/5 rounded-xl p-3 border border-primary/10">
            <p className="text-lg font-bold text-primary">{safeProvinces.reduce((sum, p) => sum + p.operational, 0).toLocaleString('id-ID')}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Operasional</p>
          </div>
          <div className="bg-amber-500/5 rounded-xl p-3 border border-amber-500/10">
            <p className="text-lg font-bold text-amber-600">{safeProvinces.reduce((sum, p) => sum + p.maintenanceNeeded, 0).toLocaleString('id-ID')}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Perawatan</p>
          </div>
          <div className="bg-red-500/5 rounded-xl p-3 border border-red-500/10">
            <p className="text-lg font-bold text-red-500">{safeProvinces.reduce((sum, p) => sum + p.offline, 0).toLocaleString('id-ID')}</p>
            <p className="text-[10px] font-medium text-muted-foreground">Offline</p>
          </div>
        </div>

        <div className="h-[340px] w-full">
          <ProvinceChart data={safeProvinces} />
        </div>
      </BentoCard>

      {/* 5. Detail Table (Project Outsourcing style header + Table) */}
      <BentoCard className="col-span-12 lg:col-span-8" padding="p-0">
        <div className="p-8 pb-4">
           <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col gap-1">
                 <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full w-fit">Data Wilayah</span>
                 <h3 className="text-2xl font-bold text-foreground">Detail Performa Kabupaten/Kota</h3>
              </div>
              <Link href="/analytics">
                <Button variant="outline" className="rounded-2xl border-border hover:bg-muted text-xs font-bold">
                  Lihat Selengkapnya
                </Button>
              </Link>
           </div>
        </div>
        
        <div className="overflow-x-auto px-8 pb-8">
          <table className="w-full text-left border-separate border-spacing-y-3">
            <thead>
              <tr className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                <th className="px-4 py-2">Kabupaten/Kota</th>
                <th className="px-4 py-2">Total Unit</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2 text-right">Performa</th>
              </tr>
            </thead>
            <tbody>
              {safeProvinces.slice(0, 5).map((prov) => (
                <tr key={prov.province} className="group cursor-pointer">
                  <td className="px-4 py-4 bg-muted/40 group-hover:bg-muted rounded-l-[1.5rem] transition-colors border-y border-l border-transparent group-hover:border-border">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center font-bold text-xs text-primary shadow-sm">
                          {prov.province.substring(0, 2).toUpperCase()}
                       </div>
                       <span className="font-bold text-sm text-foreground">{prov.province}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 bg-muted/40 group-hover:bg-muted border-y border-transparent group-hover:border-border transition-colors">
                    <span className="font-bold text-sm text-foreground">{prov.totalUnits.toLocaleString('id-ID')}</span>
                  </td>
                  <td className="px-4 py-4 bg-muted/40 group-hover:bg-muted border-y border-transparent group-hover:border-border transition-colors">
                     <div className="flex gap-2">
                         {prov.operational > 0 && (
                            <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-emerald-500/20">
                               <CheckCircle2 size={10} />
                               {prov.operational} OK
                            </div>
                         )}
                         {(prov.maintenanceNeeded + prov.offline > 0) && (
                            <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 px-2.5 py-1 rounded-lg text-[10px] font-bold border border-amber-500/20">
                               <AlertCircle size={10} />
                               {prov.maintenanceNeeded + prov.offline} Issue
                            </div>
                         )}
                     </div>
                  </td>
                  <td className="px-4 py-4 bg-muted/40 group-hover:bg-muted rounded-r-[1.5rem] text-right border-y border-r border-transparent group-hover:border-border transition-colors">
                     <div className="flex flex-col items-end gap-1.5">
                        <span className="font-bold text-sm text-foreground">
                          {prov.totalUnits > 0 ? Math.round((prov.operational / prov.totalUnits) * 100) : 0}%
                        </span>
                        <div className="w-20 h-1.5 bg-border rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${prov.totalUnits > 0 ? (prov.operational / prov.totalUnits) * 100 : 0}%` }}
                             className="h-full bg-primary rounded-full" 
                           />
                        </div>
                     </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </BentoCard>

      {/* 6. Reports Summary (Project Outsourcing style) */}
      <BentoCard className="col-span-12 lg:col-span-4 flex flex-col justify-between gap-6">
        <div>
           <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full mb-3 inline-block uppercase tracking-wider">Statistik Laporan</span>
           <h3 className="text-2xl font-bold mb-4 text-foreground">Ringkasan Laporan</h3>
           <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
                 <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-primary shadow-sm">
                    <Briefcase size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-bold leading-none text-foreground">{stats?.totalReports || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Total</p>
                 </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-muted/50">
                 <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center text-emerald-500 shadow-sm">
                    <CheckCircle2 size={18} />
                 </div>
                 <div>
                    <p className="text-xs font-bold leading-none text-foreground">{stats?.reportsToday || 0}</p>
                    <p className="text-[10px] text-muted-foreground font-medium uppercase mt-1">Hari Ini</p>
                 </div>
              </div>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-end mb-1">
              <div>
                 <p className="text-3xl font-bold tracking-tighter text-foreground">{stats?.reportsThisMonth || 0}</p>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Laporan Bulan Ini</p>
              </div>
              <div className="flex items-center gap-1 text-emerald-500 font-bold text-xs bg-emerald-500/10 px-2 py-0.5 rounded-full mb-1">
                +2.4%
                <TrendingUp size={12} />
              </div>
           </div>
           
           <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: "75%" }} // Mocked as in original
                className="h-full bg-primary rounded-full" 
              />
           </div>
        </div>
      </BentoCard>

      {/* 7. Activity Feed (Unified Bottom Card or separate?) */}
      <BentoCard className="col-span-12 flex flex-col gap-8">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-foreground">Aktivitas Sistem Terbaru</h3>
            <p className="text-xs text-muted-foreground mt-1">Log aktivitas operasional dan pemeliharaan secara real-time</p>
          </div>
          <div className="flex items-center gap-3">
            {safeActivities.length > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-xl">
                <div 
                  className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-bold"
                  title={safeActivities[0].user}
                >
                  {getUserInitial(safeActivities[0].user)}
                </div>
                <span className="text-xs text-muted-foreground">
                  {safeActivities[0].user}
                </span>
              </div>
            )}
            <Link href="/reports">
               <Button variant="outline" className="rounded-xl border-border hover:bg-muted text-xs font-bold">
                 Buka Log Aktivitas
               </Button>
            </Link>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2">
              <ActivityFeed
                activities={safeActivities.map((a) => ({
                  ...a,
                  timestamp: new Date(a.timestamp),
                }))}
                maxHeight="100%"
              />
           </div>
           <div className="bg-muted/30 rounded-[2rem] p-6 border border-border/50 flex flex-col justify-center items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                 <WifiOff size={32} />
              </div>
              <h4 className="font-bold text-foreground mb-2">Pusat Bantuan</h4>
              <p className="text-xs text-muted-foreground mb-6">Butuh bantuan teknis atau ingin melaporkan kendala sistem?</p>
              <Button className="w-full rounded-xl font-bold bg-foreground text-background">Hubungi Support</Button>
           </div>
        </div>
      </BentoCard>


    </div>
  );
}

// Wrapper to unwrap stats for export button only
function ExportButtonWrapper({ statsPromise, provincesPromise }: { statsPromise: StatsPromise, provincesPromise: ProvincesPromise }) {
  const { data: stats } = use(statsPromise);
  const { data: provinces } = use(provincesPromise);
  return <ExportDashboardButton stats={stats} provinces={provinces || []} />;
}

// ==========================================
// MAIN COMPONENT
// ==========================================

// Header users component that unwraps the promise
function HeaderUsers({ usersPromise }: { usersPromise: UsersPromise }) {
  const { data: users } = use(usersPromise);
  const safeUsers = users || [];

  return (
    <div className="hidden xl:flex -space-x-4 mr-2">
      {safeUsers.map((user) => (
        <div 
          key={user.id} 
          className={cn("w-14 h-14 rounded-2xl border-[4px] border-background shadow-xl shadow-primary/5 transition-transform hover:scale-110 hover:z-10 cursor-pointer flex items-center justify-center text-white text-lg font-bold", getAvatarColor(user.id))}
          title={`${user.name} (${user.role})`}
        >
          {getUserInitial(user.name)}
        </div>
      ))}
      <Link href="/users" className="w-14 h-14 rounded-2xl border-[4px] border-background bg-muted/50 flex items-center justify-center text-primary/60 hover:bg-primary/10 hover:text-primary transition-all shadow-xl shadow-primary/5 cursor-pointer">
        <Plus size={24} />
      </Link>
    </div>
  );
}

export function DashboardClient({
  statsPromise,
  provincesPromise,
  activitiesPromise,
  usersPromise,
  user,
}: DashboardClientProps) {
  const greeting = getGreeting();
  const displayName = user?.name?.split(' ')[0] || 'Admin';

  return (
    <div className="min-h-screen bg-background pt-8 font-sans selection:bg-primary/20 selection:text-primary">
      <div className="max-w-[1700px] mx-auto space-y-12 animate-fade-in px-4">
        
        {/* Header Section (Premium Bento Inspired) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-4">
           <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-1 w-12 bg-primary rounded-full" />
                <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Ringkasan Eksekutif</span>
              </div>
              <h1 className="text-5xl font-black text-foreground tracking-tighter mb-3">
                {greeting}, <span className="text-primary/80">{displayName}</span>
              </h1>
              <p className="text-muted-foreground text-base font-bold tracking-tight">Pantau infrastruktur energi terbarukan Provinsi Jambi secara real-time.</p>
           </div>
           
           <div className="flex flex-wrap items-center gap-6">
              <Suspense fallback={
                <div className="hidden xl:flex -space-x-4 mr-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-14 h-14 rounded-2xl border-[4px] border-background bg-muted animate-pulse" />
                  ))}
                </div>
              }>
                <HeaderUsers usersPromise={usersPromise} />
              </Suspense>

              <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-3xl border border-border/40 backdrop-blur-sm">
                 <Suspense fallback={<div className="w-40 h-12 bg-muted animate-pulse rounded-2xl" />}>
                   <ExportButtonWrapper statsPromise={statsPromise} provincesPromise={provincesPromise} />
                 </Suspense>
                 
                 <Link href="/report/new">
                   <Button size="lg" className="bg-primary text-white hover:bg-primary/90 rounded-[1.25rem] px-8 h-14 font-black text-sm tracking-wide transition-all shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 group">
                     <Plus className="h-5 w-5 mr-3 group-hover:rotate-90 transition-transform duration-300" />
                     BUAT LAPORAN
                   </Button>
                 </Link>
              </div>
           </div>
        </div>

        {/* Bento Grid Content */}
        <Suspense fallback={
          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-12 lg:col-span-8 h-[400px] bg-muted animate-pulse rounded-bento" />
            <div className="col-span-12 lg:col-span-4 h-[400px] bg-muted animate-pulse rounded-bento" />
          </div>
        }>
           <DashboardBentoGrid 
             statsPromise={statsPromise} 
             provincesPromise={provincesPromise} 
             activitiesPromise={activitiesPromise}
           />
        </Suspense>
      </div>
    </div>
  );
}
