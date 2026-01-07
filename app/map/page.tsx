import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMapPoints } from "@/app/actions/map";
import { getDashboardStats } from "@/app/actions/dashboard";
import { AppShell } from "@/components/layout";
import { MapPageClient } from "./map-client";

export default async function MapPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Fetch map points and stats in parallel
  const [pointsResult, statsResult] = await Promise.all([
    getMapPoints(),
    getDashboardStats(),
  ]);

  const points = pointsResult.data || [];
  const stats = statsResult.data;

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <MapPageClient
        initialPoints={points}
        counts={{
          operational: stats?.operationalUnits || 0,
          maintenanceNeeded: stats?.maintenanceNeeded || 0,
          offline: stats?.offlineUnits || 0,
          unverified: stats?.unverifiedUnits || 0,
        }}
      />
    </AppShell>
  );
}
