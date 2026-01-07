import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Loading UI for the map route
 */
export default function MapLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-28 rounded-lg" />
                ))}
            </div>

            {/* Map Skeleton */}
            <Card>
                <CardContent className="p-0">
                    <div className="h-[600px] bg-slate-100 rounded-xl flex items-center justify-center">
                        <div className="text-center">
                            <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
                            <Skeleton className="w-32 h-4 mx-auto" />
                            <p className="text-sm text-slate-500 mt-2">Memuat peta...</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
