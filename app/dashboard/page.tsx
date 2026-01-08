import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getDashboardStats,
  getStatsByProvince,
  getRecentActivity,
} from "@/app/actions/dashboard";
import { AppShell } from "@/components/layout";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Start fetching data - DO NOT AWAIT here to enable streaming
  const statsPromise = getDashboardStats();
  const provincesPromise = getStatsByProvince();
  const activitiesPromise = getRecentActivity(10);

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <DashboardClient
        statsPromise={statsPromise}
        provincesPromise={provincesPromise}
        activitiesPromise={activitiesPromise}
      />
    </AppShell>
  );
}
