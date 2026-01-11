"use client";

import { use, useState, useEffect, Suspense, useMemo } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout";
import { MapFilters, MapLegend, UnitDetailDrawer } from "@/components/map";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPoint } from "@/types";
import { DashboardStats, ActionResult } from "@/app/actions/dashboard";

// Promise Types
type PointsPromise = Promise<ActionResult<MapPoint[]>>;
type StatsPromise = Promise<ActionResult<DashboardStats>>;

// Dynamic import for optimized Leaflet with clustering (client-side only)
const MapContainer = dynamic(
  () => import("@/components/map/map-container-optimized").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-slate-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
          <Skeleton className="w-32 h-4" />
          <p className="text-xs text-slate-400 mt-2">Memuat peta...</p>
        </div>
      </div>
    ),
  }
);

interface MapPageClientProps {
  pointsPromise: PointsPromise;
  statsPromise: StatsPromise;
}

// Filter skeleton component
function FiltersSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <Skeleton className="h-10 w-28 rounded-full" />
      <Skeleton className="h-10 w-32 rounded-full" />
      <Skeleton className="h-10 w-24 rounded-full" />
      <Skeleton className="h-10 w-36 rounded-full" />
    </div>
  );
}

// Map content component that uses streaming data
function MapContent({
  pointsPromise,
  selectedStatus,
  onPointClick,
}: {
  pointsPromise: PointsPromise;
  selectedStatus: string | null;
  onPointClick: (point: MapPoint) => void;
}) {
  const { data: points } = use(pointsPromise);
  const safePoints = useMemo(() => points || [], [points]);

  return (
    <MapContainer
      points={safePoints}
      selectedStatus={selectedStatus}
      onPointClick={onPointClick}
      enableClustering={safePoints.length > 50} // Only enable clustering for large datasets
    />
  );
}

// Filters component that uses streaming stats data
function FiltersSection({
  statsPromise,
  selectedStatus,
  onStatusChange,
}: {
  statsPromise: StatsPromise;
  selectedStatus: string | null;
  onStatusChange: (status: string | null) => void;
}) {
  const { data: stats } = use(statsPromise);

  const counts = useMemo(() => ({
    operational: stats?.operationalUnits || 0,
    maintenanceNeeded: stats?.maintenanceNeeded || 0,
    offline: stats?.offlineUnits || 0,
    unverified: stats?.unverifiedUnits || 0,
  }), [stats]);

  return (
    <MapFilters
      selectedStatus={selectedStatus}
      onStatusChange={onStatusChange}
      counts={counts}
    />
  );
}

export function MapPageClient({ pointsPromise, statsPromise }: MapPageClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);

  // Listen for map point clicks from popup buttons
  useEffect(() => {
    const handleMapPointClick = (event: CustomEvent<string>) => {
      setSelectedUnitId(event.detail);
    };

    window.addEventListener(
      "map-point-click",
      handleMapPointClick as EventListener
    );

    return () => {
      window.removeEventListener(
        "map-point-click",
        handleMapPointClick as EventListener
      );
    };
  }, []);

  return (
    <>
      <PageHeader
        title="Peta PJUTS"
        description="Visualisasi lokasi unit penerangan jalan umum tenaga surya"
      />

      {/* Filters with Suspense */}
      <div className="mb-4">
        <Suspense fallback={<FiltersSkeleton />}>
          <FiltersSection
            statsPromise={statsPromise}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
          />
        </Suspense>
      </div>

      {/* Map Container with Suspense */}
      <Card className="relative overflow-hidden">
        <div className="h-[600px]">
          <Suspense
            fallback={
              <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <Skeleton className="w-12 h-12 rounded-full mx-auto" />
                  <Skeleton className="w-32 h-4 mx-auto" />
                  <p className="text-sm text-slate-400">Memuat data peta...</p>
                </div>
              </div>
            }
          >
            <MapContent
              pointsPromise={pointsPromise}
              selectedStatus={selectedStatus}
              onPointClick={(point) => setSelectedUnitId(point.id)}
            />
          </Suspense>
          <MapLegend />
        </div>
      </Card>

      {/* Unit Detail Drawer */}
      <UnitDetailDrawer
        unitId={selectedUnitId}
        onClose={() => setSelectedUnitId(null)}
      />
    </>
  );
}
