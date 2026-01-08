import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { FileBarChart } from "lucide-react";
import {
    StatsGridSkeleton,
    ReportStatsSkeleton,
    ChartsGridSkeleton,
    ActivityGridSkeleton,
    TableSkeleton
} from "@/components/dashboard/skeletons";

export default function DashboardLoading() {
    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Pantau status PJUTS secara real-time di seluruh Indonesia"
            >
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled>
                        Export Data
                    </Button>
                    <Button size="sm" disabled>
                        <FileBarChart className="h-4 w-4 mr-2" />
                        Buat Laporan
                    </Button>
                </div>
            </PageHeader>

            <StatsGridSkeleton />

            <div className="relative my-8">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                    <div className="w-full border-t border-slate-200/60 shadow-sm"></div>
                </div>
                <div className="relative flex justify-center">
                    <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-200/60 shadow-sm text-slate-500">
                        <FileBarChart className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium uppercase tracking-wider">
                            Statistik Laporan
                        </span>
                    </div>
                </div>
            </div>

            <ReportStatsSkeleton />
            <ChartsGridSkeleton />
            <ActivityGridSkeleton />
            <TableSkeleton />
        </>
    );
}
