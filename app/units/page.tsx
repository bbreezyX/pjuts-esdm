import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPjutsUnits, getProvinces } from "@/app/actions/units";
import { AppShell, PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Plus, Download, Upload } from "lucide-react";
import { UnitsPageClient } from "./units-client";

interface SearchParams {
  page?: string;
  province?: string;
  status?: string;
  search?: string;
}

export default async function UnitsPage({
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
  const status = params.status as
    | "OPERATIONAL"
    | "MAINTENANCE_NEEDED"
    | "OFFLINE"
    | "UNVERIFIED"
    | undefined;
  const search = params.search;

  const [unitsResult, provincesResult] = await Promise.all([
    getPjutsUnits({ page, province, status, search }),
    getProvinces(),
  ]);

  const units = unitsResult.data?.units || [];
  const total = unitsResult.data?.total || 0;
  const totalPages = unitsResult.data?.totalPages || 1;
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
        title="Unit PJUTS"
        description="Kelola unit penerangan jalan umum tenaga surya"
      >
        {session.user.role === "ADMIN" && (
          <>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Tambah Unit
            </Button>
          </>
        )}
      </PageHeader>

      <UnitsPageClient
        initialUnits={units}
        total={total}
        page={page}
        totalPages={totalPages}
        provinces={provinces}
        initialProvince={province}
        initialStatus={status}
        initialSearch={search}
        isAdmin={session.user.role === "ADMIN"}
      />
    </AppShell>
  );
}

