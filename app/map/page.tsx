import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMapPoints } from "@/app/actions/map";
import { getDashboardStats } from "@/app/actions/dashboard";
import { AppShell } from "@/components/layout";
import { MapPageClient } from "./map-client";

// Revalidate data every 60 seconds to ensure fresh map data
export const revalidate = 60;

export default async function MapPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Start fetching data - DO NOT AWAIT to enable streaming
  const pointsPromise = getMapPoints();
  const statsPromise = getDashboardStats();

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <MapPageClient
        pointsPromise={pointsPromise}
        statsPromise={statsPromise}
      />
    </AppShell>
  );
}
