import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPjutsUnits, getRegencies } from "@/app/actions/units";
import { AppShell } from "@/components/layout";
import { UnitsPageClient } from "./units-client";

interface SearchParams {
  page?: string;
  regency?: string;
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
  const regency = params.regency;
  const status = params.status as
    | "OPERATIONAL"
    | "MAINTENANCE_NEEDED"
    | "OFFLINE"
    | "UNVERIFIED"
    | undefined;
  const search = params.search;

  const [unitsResult, regenciesResult] = await Promise.all([
    getPjutsUnits({ page, regency, status, search }),
    getRegencies(),
  ]);

  const units = unitsResult.data?.units || [];
  const total = unitsResult.data?.total || 0;
  const totalPages = unitsResult.data?.totalPages || 1;
  const regencies = regenciesResult.data || [];

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <UnitsPageClient
        initialUnits={units}
        total={total}
        page={page}
        totalPages={totalPages}
        regencies={regencies}
        initialRegency={regency}
        initialStatus={status}
        initialSearch={search}
        isAdmin={session.user.role === "ADMIN"}
      />
    </AppShell>
  );
}
