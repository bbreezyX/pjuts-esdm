"use client";

import { useEffect, useState } from "react";
import {
  X,
  MapPin,
  Zap,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  BatteryFull,
  ExternalLink,
  Copy,
  ChevronRight,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusLabel, formatDateTime } from "@/lib/utils";
import { BATTERY_THRESHOLDS } from "@/lib/constants";
import { UnitStatus } from "@prisma/client";
import { Separator } from "@/components/ui/separator";

// ============================================
// TYPES
// ============================================

interface PublicUnitDetail {
  unit: {
    id: string;
    serialNumber: string;
    latitude: number;
    longitude: number;
    province: string;
    regency: string;
    district: string | null;
    village: string | null;
    lastStatus: UnitStatus;
    installDate: string | null;
  };
  recentReports: Array<{
    id: string;
    batteryVoltage: number;
    notes: string | null;
    createdAt: string;
  }>;
  reportCount: number;
}

interface PublicUnitDetailDrawerProps {
  unitId: string | null;
  onClose: () => void;
}

// ============================================
// COMPONENT
// ============================================

export function PublicUnitDetailDrawer({
  unitId,
  onClose,
}: PublicUnitDetailDrawerProps) {
  const [detail, setDetail] = useState<PublicUnitDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [coordsCopied, setCoordsCopied] = useState(false);

  useEffect(() => {
    if (!unitId) {
      setDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/public/map/${unitId}`);
        if (!res.ok) {
          // Unit may be unverified or not found — close the drawer silently
          onClose();
          return;
        }
        const json = await res.json();
        if (json.success && json.data) {
          setDetail(json.data);
        } else {
          onClose();
        }
      } catch (error) {
        console.error("Failed to fetch public unit detail:", error);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [unitId]);

  if (!unitId) return null;

  const handleCopyCoords = async () => {
    if (!detail) return;
    try {
      await navigator.clipboard.writeText(
        `${detail.unit.latitude}, ${detail.unit.longitude}`,
      );
      setCoordsCopied(true);
      setTimeout(() => setCoordsCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[55] sm:hidden animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-x-0 bottom-0 z-[60] flex flex-col bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] rounded-t-[2rem] border-t border-slate-100 max-h-[85vh] sm:top-[250px] sm:bottom-4 sm:right-4 sm:left-4 sm:left-auto sm:w-[500px] sm:max-h-[calc(100vh-270px)] sm:rounded-3xl sm:border sm:border-white/20 sm:shadow-2xl animate-in slide-in-from-bottom duration-500 sm:slide-in-from-right">
        {/* Header - Mobile Handle */}
        <div className="sm:hidden w-full flex justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* content header */}
        <div className="flex items-center justify-between px-5 py-3 sm:p-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight">
              Detail Unit
            </h3>
            {detail && (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-medium text-slate-500">
                  {detail.unit.serialNumber}
                </p>
                {detail.unit.installDate && (
                  <>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-xs text-slate-400">
                      Dipasang{" "}
                      {formatDateTime(detail.unit.installDate).split(",")[0]}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100"
          >
            <X className="h-5 w-5 text-slate-500" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-white">
          {loading ? (
            <div className="p-6">
              <DrawerSkeleton />
            </div>
          ) : detail ? (
            <div className="p-6 space-y-6 pb-8 sm:pb-6">
              {/* Status Card */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5 overflow-hidden relative">
                <div
                  className={cn(
                    "absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 blur-xl",
                    detail.unit.lastStatus === "OPERATIONAL"
                      ? "bg-green-500"
                      : detail.unit.lastStatus === "MAINTENANCE_NEEDED"
                        ? "bg-amber-500"
                        : detail.unit.lastStatus === "OFFLINE"
                          ? "bg-red-500"
                          : "bg-slate-400",
                  )}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-slate-500">
                      Status Terkini
                    </span>
                    {detail.recentReports[0] && (
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(detail.recentReports[0].createdAt)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        detail.unit.lastStatus === "OPERATIONAL"
                          ? "bg-green-100 text-green-600"
                          : detail.unit.lastStatus === "MAINTENANCE_NEEDED"
                            ? "bg-amber-100 text-amber-600"
                            : detail.unit.lastStatus === "OFFLINE"
                              ? "bg-red-100 text-red-600"
                              : "bg-slate-100 text-slate-500",
                      )}
                    >
                      {detail.unit.lastStatus === "OPERATIONAL" ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : detail.unit.lastStatus === "MAINTENANCE_NEEDED" ? (
                        <AlertTriangle className="h-6 w-6" />
                      ) : detail.unit.lastStatus === "OFFLINE" ? (
                        <XCircle className="h-6 w-6" />
                      ) : (
                        <HelpCircle className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-900 leading-tight">
                        {getStatusLabel(detail.unit.lastStatus)}
                      </h4>
                      <p className="text-sm text-slate-500">
                        Unit beroperasi normal
                      </p>
                    </div>
                  </div>

                  {/* Battery voltage from latest report */}
                  {detail.recentReports[0] && (
                    <div className="mt-4 pt-4 border-t flex items-center gap-4">
                      <div className="flex-1">
                        <span className="text-xs text-slate-500 block mb-1">
                          Tegangan Baterai
                        </span>
                        <div className="flex items-end gap-1.5">
                          <BatteryFull
                            className={cn(
                              "h-5 w-5 mb-0.5",
                              detail.recentReports[0].batteryVoltage >=
                                BATTERY_THRESHOLDS.OPERATIONAL_MIN
                                ? "text-green-500"
                                : detail.recentReports[0].batteryVoltage >=
                                    BATTERY_THRESHOLDS.MAINTENANCE_MIN
                                  ? "text-amber-500"
                                  : "text-red-500",
                            )}
                          />
                          <span className="text-2xl font-bold tracking-tight text-slate-900">
                            {detail.recentReports[0].batteryVoltage}
                          </span>
                          <span className="text-sm font-medium text-slate-500 mb-1">
                            Volts
                          </span>
                        </div>
                      </div>
                      {detail.recentReports[0].notes && (
                        <>
                          <div className="w-px h-10 bg-slate-100" />
                          <div className="flex-1">
                            <span className="text-xs text-slate-500 block mb-1">
                              Catatan
                            </span>
                            <p className="text-sm font-medium text-slate-900 line-clamp-2">
                              {detail.recentReports[0].notes}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Location Card */}
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 pl-2">
                  Lokasi & Koordinat
                </h4>
                <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 border border-slate-100">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 mb-0.5">
                        {detail.unit.province}
                      </p>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {[
                          detail.unit.village,
                          detail.unit.district,
                          detail.unit.regency,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>

                  <Separator className="bg-slate-200" />

                  {/* Coordinates */}
                  <div className="flex items-center gap-2">
                    <div
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-colors"
                      onClick={handleCopyCoords}
                    >
                      <div className="flex items-center gap-2">
                        <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                        <code className="text-xs text-slate-700 font-medium">
                          {detail.unit.latitude.toFixed(6)},{" "}
                          {detail.unit.longitude.toFixed(6)}
                        </code>
                      </div>
                      {coordsCopied ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary" />
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0 hover:bg-primary/5 hover:text-primary hover:border-primary/20"
                      onClick={() => {
                        window.open(
                          `https://www.google.com/maps?q=${detail.unit.latitude},${detail.unit.longitude}`,
                          "_blank",
                        );
                      }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Report history summary */}
              {detail.recentReports.length > 1 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900 pl-2">
                    Riwayat Laporan Terbaru
                  </h4>
                  <div className="space-y-2">
                    {detail.recentReports.slice(1).map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-slate-100 hover:border-primary/20 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-2 flex-1">
                          <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="text-xs text-slate-500">
                            {formatDateTime(report.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                          <span className="text-sm font-bold text-slate-900">
                            {report.batteryVoltage}V
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400 text-center pt-1">
                    Total {detail.reportCount} laporan tercatat
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}

// ============================================
// SKELETON
// ============================================

function DrawerSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="h-32 w-full rounded-3xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-3xl" />
      </div>
    </div>
  );
}
