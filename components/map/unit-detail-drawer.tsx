"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  Xmark,
  MapPin,
  Flash,
  Calendar,
  User,
  OpenNewWindow,
  CheckCircle,
  WarningTriangle,
  XmarkCircle,
  HelpCircle,
  BatteryFull,
  Copy,
  NavArrowRight,
  Clock,
  InfoCircle,
} from "iconoir-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getUnitDetail } from "@/app/actions/map";
import { getStatusLabel, formatDateTime } from "@/lib/utils";
import { UnitStatus } from "@prisma/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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

  return (
    <>
      {/* Drawer */}
      <div className="fixed inset-2 sm:inset-y-4 sm:right-4 sm:left-auto sm:w-[500px] bg-white shadow-2xl z-50 animate-slide-in-right flex flex-col rounded-3xl overflow-hidden border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/50 sticky top-0 z-10">
          <div>
            <h3 className="font-bold text-lg text-slate-900 tracking-tight">Detail Unit</h3>
            {detail && (
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-medium text-slate-500">{detail.unit.serialNumber}</p>
                {detail.unit.installDate && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-400">
                      Dipasang {formatDateTime(detail.unit.installDate).split(',')[0]}
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-slate-100">
            <Xmark className="h-5 w-5 text-slate-500" />
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <ScrollArea className="flex-1">
            <div className="p-6">
              <DrawerSkeleton />
            </div>
          </ScrollArea>
        ) : detail ? (
          <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 pb-2 bg-slate-50/50">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="overview">Ringkasan</TabsTrigger>
                <TabsTrigger value="history">
                  Riwayat
                  <span className="ml-2 py-0.5 px-2 bg-slate-200 text-slate-600 rounded-full text-[10px] min-w-[20px] text-center">
                    {detail.reportCount}
                  </span>
                </TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-6">
                <TabsContent value="overview" className="mt-0 space-y-6 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                  {/* Status Card */}
                  <div className="bg-white rounded-3xl shadow-sm p-5 overflow-hidden relative">
                    <div className={cn(
                      "absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full opacity-10 blur-xl",
                      detail.unit.lastStatus === "OPERATIONAL" ? "bg-green-500" :
                        detail.unit.lastStatus === "MAINTENANCE_NEEDED" ? "bg-amber-500" :
                          detail.unit.lastStatus === "OFFLINE" ? "bg-red-500" : "bg-slate-500"
                    )} />

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium text-slate-500">Status Terkini</span>
                        {detail.recentReports[0] && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDateTime(detail.recentReports[0].createdAt)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "p-2 rounded-full",
                          detail.unit.lastStatus === "OPERATIONAL" ? "bg-green-100 text-green-600" :
                            detail.unit.lastStatus === "MAINTENANCE_NEEDED" ? "bg-amber-100 text-amber-600" :
                              detail.unit.lastStatus === "OFFLINE" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-600"
                        )}>
                          {detail.unit.lastStatus === "OPERATIONAL" ? <CheckCircle className="h-6 w-6" /> :
                            detail.unit.lastStatus === "MAINTENANCE_NEEDED" ? <WarningTriangle className="h-6 w-6" /> :
                              detail.unit.lastStatus === "OFFLINE" ? <XmarkCircle className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
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

                      {/* Voltage Display if available */}
                      {detail.recentReports[0] && (
                        <div className="mt-4 pt-4 border-t flex items-center gap-4">
                          <div className="flex-1">
                            <span className="text-xs text-slate-500 block mb-1">Tegangan Baterai</span>
                            <div className="flex items-end gap-1.5">
                              <BatteryFull className={cn("h-5 w-5 mb-0.5",
                                detail.recentReports[0].batteryVoltage > 12 ? "text-green-500" :
                                  detail.recentReports[0].batteryVoltage > 11 ? "text-amber-500" : "text-red-500"
                              )} />
                              <span className="text-2xl font-bold tracking-tight text-slate-900">
                                {detail.recentReports[0].batteryVoltage}
                              </span>
                              <span className="text-sm font-medium text-slate-500 mb-1">Volts</span>
                            </div>
                          </div>
                          <div className="w-px h-10 bg-slate-100" />
                          <div className="flex-1">
                            <span className="text-xs text-slate-500 block mb-1">Kondisi Fisik</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-900 line-clamp-2">
                                {detail.recentReports[0].notes || "Tidak ada catatan"}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Card */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-slate-900 pl-2">Lokasi & Koordinat</h4>
                    <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 space-y-4">

                      {/* Address */}
                      <div className="flex items-start gap-3">
                        <div className="bg-white p-2 rounded-lg shadow-sm shrink-0 border border-slate-100">
                          <MapPin className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900 mb-0.5">
                            {detail.unit.province}
                          </p>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {[
                              detail.unit.village,
                              detail.unit.district,
                              detail.unit.regency
                            ].filter(Boolean).join(", ")}
                          </p>
                          {detail.unit.address && (
                            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                              <InfoCircle className="h-3 w-3" />
                              {detail.unit.address}
                            </p>
                          )}
                        </div>
                      </div>

                      <Separator className="bg-slate-200" />

                      {/* Coordinates Action */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 flex items-center justify-between group cursor-pointer hover:border-primary-400 transition-colors"
                          onClick={() => {
                            navigator.clipboard.writeText(`${detail.unit.latitude}, ${detail.unit.longitude}`);
                            toast({
                              description: "Koordinat berhasil disalin",
                            });
                          }}>
                          <div className="flex items-center gap-2">
                            <NavArrowRight className="h-3.5 w-3.5 text-slate-400" />
                            <code className="text-xs text-slate-700 font-medium">
                              {detail.unit.latitude.toFixed(6)}, {detail.unit.longitude.toFixed(6)}
                            </code>
                          </div>
                          <Copy className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary-600" />
                        </div>
                        <Button
                          size="icon"
                          variant="outline"
                          className="shrink-0 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200"
                          onClick={() => {
                            window.open(
                              `https://www.google.com/maps?q=${detail.unit.latitude},${detail.unit.longitude}`,
                              "_blank"
                            );
                          }}
                        >
                          <OpenNewWindow className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="history" className="mt-0 space-y-4 animate-in fade-in-50 slide-in-from-bottom-2 duration-500 delay-75">
                  {detail.recentReports.length > 0 ? (
                    <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-[19px] before:w-[2px] before:bg-slate-100 pl-2">
                      {detail.recentReports.map((report) => (
                        <div key={report.id} className="relative pl-8 group">
                          {/* Timeline Dot */}
                          <div className="absolute left-[13px] top-6 w-3.5 h-3.5 bg-white border-[3px] border-slate-200 rounded-full group-hover:border-primary-500 transition-colors z-10" />

                          <div className="bg-white hover:border-primary-200 rounded-3xl p-4 hover:shadow-sm transition-all group-hover:-translate-y-0.5 duration-300">
                            <div className="flex gap-4">
                              {/* Image Thumbnail */}
                              {report.imageUrl ? (
                                <div
                                  className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-slate-100 group/image"
                                  onClick={() => setSelectedImage(report.imageUrl)}
                                >
                                  <Image
                                    src={report.imageUrl}
                                    alt="Report"
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover/image:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover/image:opacity-100">
                                    <OpenNewWindow className="w-5 h-5 text-white drop-shadow-md" />
                                  </div>
                                </div>
                              ) : (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100 flex items-center justify-center">
                                  <div className="text-center text-slate-400">
                                    <Calendar className="w-6 h-6 mx-auto mb-1" />
                                    <span className="text-[10px]">Tanpa Foto</span>
                                  </div>
                                </div>
                              )}

                              {/* Details */}
                              <div className="flex-1 min-w-0 py-1">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="h-3 w-3" />
                                    {formatDateTime(report.createdAt)}
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mb-3">
                                  <div className="flex items-center gap-2">
                                    <Flash className="h-3.5 w-3.5 text-amber-500" />
                                    <span className="text-sm font-bold text-slate-900">{report.batteryVoltage}V</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <User className="h-3.5 w-3.5 text-blue-500" />
                                    <span className="text-sm font-medium text-slate-700 truncate">{report.user}</span>
                                  </div>
                                </div>

                                {report.notes && (
                                  <div className="bg-slate-50 rounded px-2.5 py-1.5">
                                    <p className="text-xs text-slate-600 line-clamp-2 italic">
                                      "{report.notes}"
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 space-y-3">
                      <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center">
                        <Calendar className="h-8 w-8 text-slate-300" />
                      </div>
                      <p className="text-sm">Belum ada laporan untuk unit ini</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </ScrollArea>
          </Tabs>
        ) : null}
      </div>

      {/* Image Lightbox */}
      {selectedImage && selectedImage.length > 0 && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10 rounded-full w-12 h-12"
            onClick={() => setSelectedImage(null)}
          >
            <Xmark className="h-6 w-6" />
          </Button>
          <div className="relative w-full max-w-5xl aspect-[16/10] sm:aspect-video rounded-lg overflow-hidden shadow-2xl">
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

