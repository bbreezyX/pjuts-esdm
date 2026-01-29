import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReports } from "@/app/actions/reports";
import { getRegencies } from "@/app/actions/units";
import { AppShell, PageHeader } from "@/components/layout";
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
      <PageHeader
        title="Laporan Monitoring"
        description="Kelola dan pantau semua laporan inspeksi petugas lapangan"
        badge="Data Laporan"
      >
        <ExportReportsButton
          regency={regency}
          startDate={startDate}
          endDate={endDate}
        />
        <Link href="/report/new">
          <Button
            size="sm"
            className="rounded-xl sm:rounded-2xl font-bold h-10 sm:h-11 px-4 sm:px-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-1.5 sm:mr-2" />
            <span className="hidden sm:inline">Buat Laporan</span>
            <span className="sm:hidden">Buat</span>
          </Button>
        </Link>
      </PageHeader>

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
