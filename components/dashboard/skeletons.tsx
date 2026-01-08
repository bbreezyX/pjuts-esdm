import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsGridSkeleton() {
    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="border-slate-200/60 shadow-sm bg-white/50">
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4">
                            <Skeleton className="h-4 w-24 bg-slate-200" />
                            <Skeleton className="h-8 w-8 rounded-lg bg-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <Skeleton className="h-8 w-16 bg-slate-200" />
                            <Skeleton className="h-4 w-32 bg-slate-200" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function ReportStatsSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="border-slate-200/60 shadow-sm bg-white/50">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-24 bg-slate-200" />
                                <Skeleton className="h-8 w-16 bg-slate-200" />
                            </div>
                            <Skeleton className="h-10 w-10 rounded-lg bg-slate-200" />
                        </div>
                        <div className="mt-4">
                            <Skeleton className="h-4 w-32 bg-slate-200" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

export function ChartsGridSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <div className="lg:col-span-2">
                <Card className="border-slate-200/60 shadow-sm bg-white/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-48 bg-slate-200" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full rounded-lg bg-slate-200" />
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card className="border-slate-200/60 shadow-sm bg-white/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 bg-slate-200" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-[300px] w-full rounded-full bg-slate-200" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function ActivityGridSkeleton() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card className="border-slate-200/60 shadow-sm bg-white/50">
                    <CardHeader>
                        <Skeleton className="h-6 w-48 bg-slate-200" />
                        <Skeleton className="h-4 w-64 bg-slate-200 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <Skeleton className="h-10 w-10 rounded-full bg-slate-200" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/4 bg-slate-200" />
                                    <Skeleton className="h-3 w-1/2 bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
            <div>
                <Card className="border-slate-200/60 shadow-sm bg-white/50 h-full">
                    <CardHeader>
                        <Skeleton className="h-6 w-32 bg-slate-200" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full rounded-xl bg-slate-200" />
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export function TableSkeleton() {
    return (
        <Card className="mt-6 border-slate-200/60 shadow-sm bg-white/50">
            <CardHeader>
                <Skeleton className="h-6 w-48 bg-slate-200" />
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div className="grid grid-cols-6 gap-4 border-b pb-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <Skeleton key={i} className="h-4 w-full bg-slate-200" />
                        ))}
                    </div>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="grid grid-cols-6 gap-4">
                            {Array.from({ length: 6 }).map((_, j) => (
                                <Skeleton key={j} className="h-4 w-full bg-slate-200" />
                            ))}
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
