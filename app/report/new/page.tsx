import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getPjutsUnits } from "@/app/actions/units";
import { ReportFormClient } from "./report-form-client";

interface SearchParams {
  unitId?: string;
}

export default async function NewReportPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const params = await searchParams;
  const preselectedUnitId = params.unitId;

  // Get all units for selection
  const unitsResult = await getPjutsUnits({ limit: 1000 });
  const units = unitsResult.data?.units || [];

  return (
    <ReportFormClient
      units={units}
      preselectedUnitId={preselectedUnitId}
      userName={session.user.name}
    />
  );
}

