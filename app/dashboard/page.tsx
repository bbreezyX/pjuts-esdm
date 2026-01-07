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

  // Parallel data fetching with cached actions
  const [statsResult, provinceResult, activityResult] = await Promise.all([
    getDashboardStats(),
    getStatsByProvince(),
    getRecentActivity(10),
  ]);

  const stats = statsResult.data;
  const provinces = provinceResult.data || [];
  const activities = activityResult.data || [];

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <DashboardClient
        stats={stats}
        provinces={provinces}
        activities={activities.map((a) => ({
          id: a.id,
          type: a.type,
          description: a.description,
          // Handle both Date objects and strings (from cache)
          timestamp: typeof a.timestamp === 'string'
            ? a.timestamp
            : a.timestamp.toISOString(),
          user: a.user,
          province: a.province,
        }))}
      />
    </AppShell>
  );
}
