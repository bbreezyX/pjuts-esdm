import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { FileText, Plus } from "lucide-react";
import {
    StatsGridSkeleton,
    ReportStatsSkeleton,
    ChartsGridSkeleton,
    ActivityGridSkeleton,
    TableSkeleton
} from "@/components/dashboard/skeletons";

export default function DashboardLoading() {
    return (
        <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8 animate-pulse">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-2">
                <div className="space-y-3">
                    <div className="h-10 w-64 bg-muted rounded-xl" />
                    <div className="h-4 w-96 bg-muted rounded-lg" />
                </div>
                <div className="flex gap-3">
                    <div className="h-12 w-32 bg-muted rounded-2xl" />
                    <div className="h-12 w-40 bg-muted rounded-2xl" />
                </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12 lg:col-span-8 h-64 bg-muted rounded-bento" />
                <div className="col-span-12 lg:col-span-4 h-64 bg-muted rounded-bento" />
                <div className="col-span-12 lg:col-span-4 h-96 bg-muted rounded-bento" />
                <div className="col-span-12 lg:col-span-8 h-96 bg-muted rounded-bento" />
            </div>
        </div>
    );
}
