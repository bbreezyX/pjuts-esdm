import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

/**
 * Loading UI for the units route
 */
export default function UnitsLoading() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-8 w-32 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-24" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-40" />
                    </div>
                </CardContent>
            </Card>

            {/* Table Skeleton */}
            <Card>
                <CardHeader>
                    <Skeleton className="h-5 w-48" />
                </CardHeader>
                <CardContent className="p-0">
                    <div className="border-t">
                        {/* Table Header */}
                        <div className="flex gap-4 p-4 bg-slate-50 border-b">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Skeleton key={i} className="h-4 flex-1" />
                            ))}
                        </div>
                        {/* Table Rows */}
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex gap-4 p-4 border-b last:border-0">
                                {Array.from({ length: 6 }).map((_, j) => (
                                    <Skeleton key={j} className="h-5 flex-1" />
                                ))}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            <div className="flex justify-between items-center">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <Skeleton key={i} className="h-9 w-9" />
                    ))}
                </div>
            </div>
        </div>
    );
}
