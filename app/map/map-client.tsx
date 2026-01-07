"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { PageHeader } from "@/components/layout";
import { MapFilters, MapLegend, UnitDetailDrawer } from "@/components/map";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPoint } from "@/types";

// Dynamic import for Leaflet (client-side only)
const MapContainer = dynamic(
  () => import("@/components/map/map-container").then((mod) => mod.MapContainer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] bg-slate-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-3" />
          <Skeleton className="w-32 h-4" />
        </div>
      </div>
    ),
  }
);

interface MapPageClientProps {
  initialPoints: MapPoint[];
  counts: {
    operational: number;
    maintenanceNeeded: number;
    offline: number;
    unverified: number;
  };
}

export function MapPageClient({ initialPoints, counts }: MapPageClientProps) {
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

      {/* Filters */}
      <div className="mb-4">
        <MapFilters
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          counts={counts}
        />
      </div>

      {/* Map Container */}
      <Card className="relative overflow-hidden">
        <div className="h-[600px]">
          <MapContainer
            points={initialPoints}
            selectedStatus={selectedStatus}
            onPointClick={(point) => setSelectedUnitId(point.id)}
          />
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

