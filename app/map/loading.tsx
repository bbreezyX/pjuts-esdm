import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function MapLoading() {
    return (
        <div className="space-y-4">
            {/* Page Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* Filters Skeleton */}
            <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-10 w-28 rounded-full" />
                <Skeleton className="h-10 w-32 rounded-full" />
                <Skeleton className="h-10 w-24 rounded-full" />
                <Skeleton className="h-10 w-36 rounded-full" />
            </div>

            {/* Map Container Skeleton */}
            <Card className="relative overflow-hidden">
                <div className="h-[600px] bg-slate-100 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <Skeleton className="w-16 h-16 rounded-full mx-auto" />
                        <Skeleton className="h-4 w-32 mx-auto" />
                        <p className="text-sm text-slate-400">Loading map...</p>
                    </div>
                </div>
            </Card>
        </div>
    );
}
