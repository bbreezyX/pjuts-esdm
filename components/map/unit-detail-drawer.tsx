"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { X, MapPin, Zap, Calendar, User, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUnitDetail } from "@/app/actions/map";
import { getStatusLabel, formatDateTime } from "@/lib/utils";
import { UnitStatus } from "@prisma/client";

interface UnitDetailDrawerProps {
  unitId: string | null;
  onClose: () => void;
}

interface UnitDetail {
  unit: {
    id: string;
    serialNumber: string;
    latitude: number;
    longitude: number;
    province: string;
    regency: string;
    district: string | null;
    village: string | null;
    address: string | null;
    lastStatus: UnitStatus;
    installDate: Date | null;
  };
  recentReports: Array<{
    id: string;
    imageUrl: string;
    batteryVoltage: number;
    latitude: number;
    longitude: number;
    notes: string | null;
    createdAt: Date;
    user: string;
  }>;
  reportCount: number;
}

export function UnitDetailDrawer({ unitId, onClose }: UnitDetailDrawerProps) {
  const [detail, setDetail] = useState<UnitDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!unitId) {
      setDetail(null);
      return;
    }

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const result = await getUnitDetail(unitId);
        if (result.success && result.data) {
          setDetail(result.data as UnitDetail);
        }
      } catch (error) {
        console.error("Failed to fetch unit detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [unitId]);

  if (!unitId) return null;

  const getStatusBadgeVariant = (status: UnitStatus) => {
    switch (status) {
      case "OPERATIONAL":
        return "operational";
      case "MAINTENANCE_NEEDED":
        return "maintenance";
      case "OFFLINE":
        return "offline";
      default:
        return "unverified";
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-semibold text-slate-900">Detail Unit</h3>
            {detail && (
              <p className="text-sm text-slate-500">{detail.unit.serialNumber}</p>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-4 space-y-6">
            {loading ? (
              <DrawerSkeleton />
            ) : detail ? (
              <>
                {/* Status & Location */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant={getStatusBadgeVariant(detail.unit.lastStatus)}
                      className="text-sm px-3 py-1"
                    >
                      {getStatusLabel(detail.unit.lastStatus)}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {detail.reportCount} laporan
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {detail.unit.province}
                        </p>
                        <p className="text-sm text-slate-600">
                          {detail.unit.regency}
                          {detail.unit.district && `, ${detail.unit.district}`}
                          {detail.unit.village && `, ${detail.unit.village}`}
                        </p>
                        {detail.unit.address && (
                          <p className="text-xs text-slate-500 mt-1">
                            {detail.unit.address}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-slate-500">Koordinat:</span>
                      <code className="text-xs bg-slate-200 px-2 py-0.5 rounded">
                        {detail.unit.latitude.toFixed(6)},{" "}
                        {detail.unit.longitude.toFixed(6)}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          window.open(
                            `https://www.google.com/maps?q=${detail.unit.latitude},${detail.unit.longitude}`,
                            "_blank"
                          );
                        }}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Recent Reports */}
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Laporan Terbaru
                  </h4>
                  {detail.recentReports.length > 0 ? (
                    <div className="space-y-3">
                      {detail.recentReports.map((report) => (
                        <div
                          key={report.id}
                          className="bg-white border rounded-lg p-3 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex gap-3">
                            {/* Thumbnail */}
                            <div
                              className="relative w-20 h-20 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                              onClick={() => setSelectedImage(report.imageUrl)}
                            >
                              <Image
                                src={report.imageUrl}
                                alt="Report"
                                fill
                                className="object-cover"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Zap className="h-4 w-4 text-amber-500" />
                                <span className="font-medium text-slate-900">
                                  {report.batteryVoltage}V
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                                <User className="h-3 w-3" />
                                <span>{report.user}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-500">
                                <Calendar className="h-3 w-3" />
                                <span>{formatDateTime(report.createdAt)}</span>
                              </div>
                              {report.notes && (
                                <p className="text-xs text-slate-600 mt-2 line-clamp-2">
                                  {report.notes}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-sm text-slate-500">
                      Belum ada laporan untuk unit ini
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </ScrollArea>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={() => setSelectedImage(null)}
          >
            <X className="h-6 w-6" />
          </Button>
          <div className="relative w-full max-w-4xl aspect-video">
            <Image
              src={selectedImage}
              alt="Report Image"
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}

function DrawerSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </div>
  );
}

