"use client";

import {
  use,
  useState,
  useEffect,
  Suspense,
  useMemo,
  useCallback,
} from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import dynamic from "next/dynamic";
import { Share2, Copy, Check } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { MapFilters, MapLegend, UnitDetailDrawer } from "@/components/map";
import { GisToolsPanel } from "@/components/map/gis-tools-panel";
import {
  LayerSwitcher,
  type BaseLayerType,
  type OverlayType,
} from "@/components/map/layer-switcher";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPoint } from "@/types";
import { DashboardStats, ActionResult } from "@/app/actions/dashboard";
import { useMobileNav } from "@/hooks/use-mobile-nav";

// Promise Types
type PointsPromise = Promise<ActionResult<MapPoint[]>>;
type StatsPromise = Promise<ActionResult<DashboardStats>>;

// Buffer configuration type
interface BufferConfig {
  center: [number, number];
  radiusKm: number;
}

// Dynamic import for Leaflet (client-side only)
const MapContainer = dynamic(
  () =>
    import("@/components/map/map-container").then((mod) => mod.MapContainer),
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
  },
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

// Enhanced Map content with state management for layers
function EnhancedMapContent({
  pointsPromise,
  selectedStatus,
  selectedUnitId,
  onPointClick,
}: {
  pointsPromise: PointsPromise;
  selectedStatus: string | null;
  selectedUnitId: string | null;
  onPointClick: (point: MapPoint) => void;
}) {
  const [activeLayer, setActiveLayer] =
    useState<BaseLayerType>("openstreetmap");
  const [activeOverlays, setActiveOverlays] = useState<OverlayType[]>([]);
  const [bufferConfig, setBufferConfig] = useState<BufferConfig | null>(null);

  const { data: points } = use(pointsPromise);
  const safePoints = useMemo(() => points || [], [points]);

  const selectedPoint = useMemo(() => {
    return safePoints.find((p) => p.id === selectedUnitId) || null;
  }, [safePoints, selectedUnitId]);

  // Check if drawer is open (unit is selected)
  const isDrawerOpen = !!selectedUnitId;

  const handlePointClick = useCallback(
    (point: MapPoint) => {
      onPointClick(point);
    },
    [onPointClick],
  );

  const handleBufferAnalysis = useCallback(
    (radius: number, center: [number, number] | null) => {
      if (center) {
        setBufferConfig({ center, radiusKm: radius });
      } else {
        setBufferConfig(null);
      }
    },
    [],
  );

  const handleLayerChange = useCallback((layer: BaseLayerType) => {
    setActiveLayer(layer);
  }, []);

  const handleOverlayToggle = useCallback((overlay: OverlayType) => {
    setActiveOverlays((prev) =>
      prev.includes(overlay)
        ? prev.filter((o) => o !== overlay)
        : [...prev, overlay],
    );
  }, []);

  return (
    <>
      <MapContainer
        points={safePoints}
        selectedStatus={selectedStatus}
        selectedUnitId={selectedUnitId}
        onPointClick={handlePointClick}
        activeLayer={activeLayer}
        activeOverlays={activeOverlays}
        bufferConfig={bufferConfig}
      />
      <GisToolsPanel
        points={safePoints}
        selectedPoint={selectedPoint}
        onBufferAnalysis={handleBufferAnalysis}
        hideOnMobile={isDrawerOpen}
      />
      <LayerSwitcher
        activeLayer={activeLayer}
        activeOverlays={activeOverlays}
        onLayerChange={handleLayerChange}
        onOverlayToggle={handleOverlayToggle}
        hideOnMobile={isDrawerOpen}
      />
    </>
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

  const counts = useMemo(
    () => ({
      operational: stats?.operationalUnits || 0,
      maintenanceNeeded: stats?.maintenanceNeeded || 0,
      offline: stats?.offlineUnits || 0,
      unverified: stats?.unverifiedUnits || 0,
    }),
    [stats],
  );

  return (
    <MapFilters
      selectedStatus={selectedStatus}
      onStatusChange={onStatusChange}
      counts={counts}
    />
  );
}

// URL Syncer component to handle search params without de-optimizing the main component
function MapUrlSyncer({ onUnitId }: { onUnitId: (id: string) => void }) {
  const searchParams = useSearchParams();

  // Handle unitId from URL
  useEffect(() => {
    const unitId = searchParams.get("unitId");
    if (unitId) {
      onUnitId(unitId);
    }
  }, [searchParams, onUnitId]);

  return null;
}

export function MapPageClient({
  pointsPromise,
  statsPromise,
}: MapPageClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { setAutoHide } = useMobileNav();

  // Hide mobile nav on map page for full map visibility
  useEffect(() => {
    setAutoHide(true);
    return () => setAutoHide(false); // Show nav again when leaving map page
  }, [setAutoHide]);

  // Listen for map point clicks from popup buttons
  useEffect(() => {
    const handleMapPointClick = (event: CustomEvent<string>) => {
      setSelectedUnitId(event.detail);
    };

    window.addEventListener(
      "map-point-click",
      handleMapPointClick as EventListener,
    );

    return () => {
      window.removeEventListener(
        "map-point-click",
        handleMapPointClick as EventListener,
      );
    };
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedUnitId(null);
    router.replace(pathname);
  }, [router, pathname]);

  const handleShareMap = useCallback(async () => {
    const shareUrl = `${window.location.origin}/share/map`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch {
      // fallback: open in new tab
      window.open(shareUrl, "_blank");
    }
  }, []);

  return (
    <>
      <Suspense fallback={null}>
        <MapUrlSyncer onUnitId={setSelectedUnitId} />
      </Suspense>

      <PageHeader
        title="Peta PJUTS"
        description="Visualisasi lokasi unit penerangan jalan umum tenaga surya dengan fitur analisis GIS"
      >
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareMap}
            className="gap-1.5"
          >
            {shareCopied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Link Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan Peta</span>
              </>
            )}
          </Button>
        </div>
      </PageHeader>

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

      {/* Map Container with GIS Tools */}
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
            <EnhancedMapContent
              pointsPromise={pointsPromise}
              selectedStatus={selectedStatus}
              selectedUnitId={selectedUnitId}
              onPointClick={(point) => setSelectedUnitId(point.id)}
            />
          </Suspense>
          <MapLegend hideOnMobile={!!selectedUnitId} />
        </div>
      </Card>

      {/* Unit Detail Drawer */}
      <UnitDetailDrawer unitId={selectedUnitId} onClose={handleCloseDrawer} />
    </>
  );
}
