import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function UnitsLoading() {
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
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
                        <Skeleton className="h-10 w-64" />
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-40" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </CardContent>
            </Card>

            {/* Table Skeleton */}
            <Card>
                <CardHeader className="bg-slate-50/50 border-b">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="flex items-center gap-4 p-4">
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-32 flex-1" />
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Pagination Skeleton */}
            <div className="flex justify-center gap-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-32" />
                <Skeleton className="h-9 w-24" />
            </div>
        </div>
    );
}
