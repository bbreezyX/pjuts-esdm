import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReports } from "@/app/actions/reports";
import { getRegencies } from "@/app/actions/units";
import { AppShell } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ReportsPageClient } from "./reports-client";
import { ExportReportsButton } from "./export-button";

interface SearchParams {
  page?: string;
  regency?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const page = parseInt(params.page || "1", 10);
  const regency = params.regency;
  const startDate = params.startDate ? new Date(params.startDate) : undefined;
  const endDate = params.endDate ? new Date(params.endDate) : undefined;

  const [reportsResult, regenciesResult] = await Promise.all([
    getReports({
      page,
      regency,
      startDate,
      endDate,
    }),
    getRegencies(),
  ]);

  const reports = reportsResult.data?.reports || [];
  const total = reportsResult.data?.total || 0;
  const totalPages = reportsResult.data?.totalPages || 1;
  const regencies = regenciesResult.data || [];

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 lg:mb-12">
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
              Field Operations
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none">
            Monitoring
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-md">
            Kelola dan pantau seluruh laporan inspeksi unit PJUTS dari petugas
            lapangan secara real-time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex p-1 bg-slate-100/50 backdrop-blur-md rounded-2xl border border-slate-200/40">
            <ExportReportsButton
              regency={regency}
              startDate={startDate}
              endDate={endDate}
            />
          </div>
          <Link href="/report/new">
            <Button
              size="lg"
              className="bg-slate-900 text-white hover:bg-slate-800 rounded-2xl px-6 h-12 font-black transition-all shadow-xl shadow-slate-200 hover:scale-[1.02] active:scale-95 text-[10px] uppercase tracking-[0.1em]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Buat Laporan
            </Button>
          </Link>
        </div>
      </div>

      <ReportsPageClient
        initialReports={reports}
        total={total}
        page={page}
        totalPages={totalPages}
        regencies={regencies}
        initialRegency={regency}
        isAdmin={session.user.role === "ADMIN"}
      />
    </AppShell>
  );
}
