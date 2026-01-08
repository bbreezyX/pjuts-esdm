import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReportsLoading() {
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-8 w-36 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-9 w-32" />
                </div>
            </div>

            {/* Filters Skeleton */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </CardContent>
            </Card>

            {/* Reports Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardContent className="p-4 space-y-3">
                            <Skeleton className="h-5 w-32" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <div className="flex justify-between items-center pt-2">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Pagination Skeleton */}
            <div className="flex justify-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-24" />
            </div>
        </div>
    );
}
