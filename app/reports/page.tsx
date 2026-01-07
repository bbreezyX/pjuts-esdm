import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getReports } from "@/app/actions/reports";
import { getProvinces } from "@/app/actions/units";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Download, Plus } from "lucide-react";
import Link from "next/link";
import { ReportsPageClient } from "./reports-client";

interface SearchParams {
  page?: string;
  province?: string;
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
  const province = params.province;
  const startDate = params.startDate ? new Date(params.startDate) : undefined;
  const endDate = params.endDate ? new Date(params.endDate) : undefined;

  const [reportsResult, provincesResult] = await Promise.all([
    getReports({
      page,
      province,
      startDate,
      endDate,
    }),
    getProvinces(),
  ]);

  const reports = reportsResult.data?.reports || [];
  const total = reportsResult.data?.total || 0;
  const totalPages = reportsResult.data?.totalPages || 1;
  const provinces = provincesResult.data || [];

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <PageHeader
        title="Laporan"
        description="Kelola dan pantau semua laporan petugas lapangan"
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Excel
        </Button>
        <Link href="/report/new">
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Buat Laporan
          </Button>
        </Link>
      </PageHeader>

      <ReportsPageClient
        initialReports={reports}
        total={total}
        page={page}
        totalPages={totalPages}
        provinces={provinces}
        initialProvince={province}
        isAdmin={session.user.role === "ADMIN"}
      />
    </AppShell>
  );
}

