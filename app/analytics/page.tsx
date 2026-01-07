import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getStatsByProvince, getMonthlyReportTrend } from "@/app/actions/dashboard";
import { AppShell, PageHeader } from "@/components/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { AnalyticsCharts } from "./analytics-client";

export default async function AnalyticsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  const [statsResult, provinceResult, trendResult] = await Promise.all([
    getDashboardStats(),
    getStatsByProvince(),
    getMonthlyReportTrend(12),
  ]);

  const stats = statsResult.data;
  const provinces = provinceResult.data || [];
  const trend = trendResult.data || { labels: [], data: [] };

  return (
    <AppShell
      user={{
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
      }}
    >
      <PageHeader
        title="Analitik"
        description="Visualisasi data dan tren PJUTS di Indonesia"
      >
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
      </PageHeader>

      <AnalyticsCharts
        stats={stats}
        provinces={provinces}
        trend={trend}
      />
    </AppShell>
  );
}

