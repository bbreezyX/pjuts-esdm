"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Eye,
  Trash2,
  MapPin,
  Zap,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  MoreVertical,
  Image as ImageIcon,
  ExternalLink,
  Navigation,
  Battery,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  getStatusVariant,
  getVoltageStatusLabel,
} from "@/lib/constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ReportData } from "@/app/actions/reports";
import { formatDateTime, getRelativeTime, cn } from "@/lib/utils";
import { deleteReport } from "@/app/actions/reports";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ReportsTableProps {
  reports: ReportData[];
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isAdmin?: boolean;
}

export function ReportsTable({
  reports,
  total,
  page,
  totalPages,
  onPageChange,
  isAdmin = false,
}: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ReportData | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Mouse tracking for spotlight effect
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, reportId: string) => {
      const card = cardRefs.current[reportId];
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    },
    [],
  );

  // Status helpers
  const getStatusConfig = (voltage: number) => {
    const v = getStatusVariant(voltage);
    const label = getVoltageStatusLabel(voltage);
    if (v === "success")
      return {
        label,
        color: "text-emerald-700",
        bg: "bg-emerald-50",
        border: "border-emerald-200/60",
        dot: "bg-emerald-500",
        glow: "shadow-emerald-500/20",
        ring: "ring-emerald-500/20",
        gradient: "from-emerald-500 to-emerald-600",
        barColor: "bg-emerald-500",
        barTrack: "bg-emerald-100",
        percent: Math.min(100, (voltage / 30) * 100),
      };
    if (v === "warning")
      return {
        label,
        color: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200/60",
        dot: "bg-amber-500",
        glow: "shadow-amber-500/20",
        ring: "ring-amber-500/20",
        gradient: "from-amber-500 to-orange-500",
        barColor: "bg-amber-500",
        barTrack: "bg-amber-100",
        percent: Math.min(100, (voltage / 30) * 100),
      };
    return {
      label,
      color: "text-rose-700",
      bg: "bg-rose-50",
      border: "border-rose-200/60",
      dot: "bg-rose-500",
      glow: "shadow-rose-500/20",
      ring: "ring-rose-500/20",
      gradient: "from-rose-500 to-red-600",
      barColor: "bg-rose-500",
      barTrack: "bg-rose-100",
      percent: Math.min(100, (voltage / 30) * 100),
    };
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      const result = await deleteReport(deleteConfirm.id);
      if (result.success) {
        setDeleteConfirm(null);
        window.location.reload();
      }
    } finally {
      setDeleting(false);
    }
  };

  const getImageUrl = (report: ReportData, index = 0) => {
    if (report.images && report.images.length > index)
      return report.images[index].url;
    if (index === 0) return report.imageUrl || "/placeholder-image.jpg";
    return "/placeholder-image.jpg";
  };

  // Reset active image when selecting a new report
  const handleSelectReport = (report: ReportData) => {
    setActiveImageIdx(0);
    setSelectedReport(report);
  };

  return (
    <div className="space-y-6">
      {/* Live data ticker */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping opacity-75" />
          </div>
          <span className="text-xs font-semibold text-primary-500 tracking-wide">
            {total} laporan tercatat
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-primary-300">
          <Clock className="w-3 h-3" />
          Halaman {page}/{totalPages}
        </div>
      </div>

      {/* Reports Feed */}
      {reports.length === 0 ? (
        /* ------- Empty State ------- */
        <div className="relative overflow-hidden rounded-[2rem] border border-dashed border-primary-200 bg-gradient-to-br from-white via-primary-50/30 to-accent/5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-100/40 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-100 to-primary-50 border-2 border-white shadow-xl flex items-center justify-center rotate-6">
                <FileText className="w-10 h-10 text-primary-300" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center -rotate-12">
                <Sparkles className="w-5 h-5 text-accent" />
              </div>
            </div>
            <h3 className="text-xl font-black text-primary-800 mb-2 tracking-tight">
              Belum Ada Laporan
            </h3>
            <p className="text-primary-400 font-medium text-sm max-w-xs leading-relaxed">
              Data monitoring PJUTS akan muncul di sini setelah petugas
              melakukan pelaporan di lapangan.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {reports.map((report, index) => {
            const status = getStatusConfig(report.batteryVoltage);
            const isHovered = hoveredCard === report.id;

            return (
              <div
                key={report.id}
                ref={(el) => {
                  cardRefs.current[report.id] = el;
                }}
                onMouseMove={(e) => handleMouseMove(e, report.id)}
                onMouseEnter={() => setHoveredCard(report.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className={cn(
                  "group/card relative rounded-2xl border bg-white transition-all duration-500 overflow-hidden",
                  "hover:shadow-lg hover:shadow-primary-900/[0.04]",
                  isHovered
                    ? "border-primary-200 scale-[1.003]"
                    : "border-primary-100/60",
                )}
                style={{
                  animation: `fade-in-up 0.4s ease-out ${index * 0.04}s both`,
                }}
              >
                {/* Spotlight gradient on hover */}
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500"
                  style={{
                    background: `radial-gradient(320px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(212,175,55,0.04), transparent 60%)`,
                  }}
                />

                <div className="relative flex flex-col sm:flex-row items-stretch gap-0">
                  {/* Image section */}
                  <div
                    className="relative shrink-0 w-full sm:w-[140px] lg:w-[160px] cursor-pointer overflow-hidden bg-primary-950 sm:rounded-l-2xl"
                    onClick={() => handleSelectReport(report)}
                  >
                    <div className="aspect-[16/9] sm:aspect-auto sm:h-full relative">
                      <Image
                        src={getImageUrl(report)}
                        alt="Laporan PJUTS"
                        fill
                        className="object-cover transition-transform duration-700 group-hover/card:scale-105"
                      />
                      {/* Dark gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:bg-gradient-to-r sm:from-transparent sm:to-black/10" />

                      {/* Image count badge */}
                      {report.images && report.images.length > 1 && (
                        <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg flex items-center gap-1.5 border border-white/10">
                          <ImageIcon className="w-3 h-3 text-white/80" />
                          <span className="text-[10px] font-bold text-white">
                            {report.images.length}
                          </span>
                        </div>
                      )}

                      {/* Mobile: overlay serial + voltage on the image */}
                      <div className="sm:hidden absolute bottom-2 right-2 flex items-center gap-1.5">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold backdrop-blur-md border border-white/15",
                            "bg-black/40 text-white",
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              status.dot,
                            )}
                          />
                          {report.batteryVoltage}V
                        </div>
                      </div>

                      {/* Quick view hover indicator (desktop) */}
                      <div className="hidden sm:flex absolute inset-0 items-center justify-center bg-primary-900/0 group-hover/card:bg-primary-900/20 transition-all duration-300">
                        <div className="w-10 h-10 rounded-full bg-white/90 shadow-lg flex items-center justify-center opacity-0 scale-75 group-hover/card:opacity-100 group-hover/card:scale-100 transition-all duration-300 delay-75">
                          <Eye className="w-4 h-4 text-primary-700" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content section */}
                  <div className="flex-1 min-w-0 p-3 sm:py-4 sm:px-5 flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                    {/* Primary info column */}
                    <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-3">
                      {/* Serial number + voltage badge row */}
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h4
                          className="font-mono text-[13px] sm:text-sm font-extrabold text-primary-800 tracking-tight truncate"
                          title={report.unit.serialNumber}
                        >
                          {report.unit.serialNumber}
                        </h4>
                        <div
                          className={cn(
                            "hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ring-1",
                            status.bg,
                            status.color,
                            status.ring,
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              status.dot,
                            )}
                          />
                          {report.batteryVoltage}V
                        </div>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-primary-300 shrink-0" />
                        <span className="text-[11px] sm:text-xs font-medium text-primary-500 truncate">
                          {report.unit.regency}
                          <span className="text-primary-300 mx-1">·</span>
                          {report.unit.province}
                        </span>
                      </div>

                      {/* Voltage micro bar (desktop only) */}
                      <div className="hidden lg:flex items-center gap-2.5 max-w-[200px]">
                        <Battery className="w-3.5 h-3.5 text-primary-300 shrink-0" />
                        <div
                          className={cn(
                            "flex-1 h-1.5 rounded-full overflow-hidden",
                            status.barTrack,
                          )}
                        >
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              status.barColor,
                            )}
                            style={{ width: `${status.percent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono font-semibold text-primary-400 tabular-nums">
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Reporter & time — compact row on mobile, column on desktop */}
                    <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-between gap-2 sm:gap-2 sm:min-w-[140px] shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-100 to-primary-50 border border-primary-200/50 flex items-center justify-center text-[10px] sm:text-xs font-black text-primary-600 shrink-0 order-last sm:order-last">
                          {report.user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col sm:items-end">
                          <span className="text-[11px] sm:text-xs font-bold text-primary-700 truncate max-w-[120px]">
                            {report.user.name}
                          </span>
                          <span className="text-[10px] font-medium text-primary-400 hidden sm:block">
                            Petugas Lapangan
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary-400 bg-primary-50/80 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                        <Clock className="w-3 h-3" />
                        <span className="truncate max-w-[90px] sm:max-w-[100px]">
                          {getRelativeTime(report.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions — inline row on mobile, vertical column on desktop */}
                  <div className="flex sm:flex-col items-center justify-end gap-1 sm:gap-1.5 px-3 pb-2 sm:p-2 sm:pr-3 sm:border-l border-primary-50/80">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-primary-400 hover:text-primary-700 hover:bg-primary-100/60 transition-colors"
                      title="Lihat Detail"
                      onClick={() => handleSelectReport(report)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-xl text-primary-400 hover:text-primary-700 hover:bg-primary-100/60 transition-colors"
                      title="Buka Peta"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${report.latitude},${report.longitude}`,
                          "_blank",
                        )
                      }
                    >
                      <Navigation className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 rounded-xl text-primary-400 hover:text-primary-700 hover:bg-primary-100/60"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-48 rounded-xl p-1.5 shadow-xl shadow-primary-900/5 border-primary-100"
                        >
                          <DropdownMenuItem
                            className="rounded-lg px-3 py-2.5 font-medium text-xs cursor-pointer focus:bg-rose-50 focus:text-rose-700 text-rose-600"
                            onClick={() => setDeleteConfirm(report)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Hapus Laporan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination - Pill style */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center pt-4">
          <div className="inline-flex items-center gap-1 bg-primary-50/80 border border-primary-100 rounded-2xl p-1.5">
            <button
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {(() => {
              const pages: (number | "ellipsis")[] = [];
              if (totalPages <= 7) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (page > 3) pages.push("ellipsis");
                for (
                  let i = Math.max(2, page - 1);
                  i <= Math.min(totalPages - 1, page + 1);
                  i++
                )
                  pages.push(i);
                if (page < totalPages - 2) pages.push("ellipsis");
                pages.push(totalPages);
              }

              return pages.map((p, idx) => {
                if (p === "ellipsis")
                  return (
                    <span
                      key={`e-${idx}`}
                      className="w-9 text-center text-xs text-primary-300 select-none"
                    >
                      ···
                    </span>
                  );
                const isActive = p === page;
                return (
                  <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={cn(
                      "h-9 min-w-[2.25rem] px-2 rounded-xl text-xs font-bold transition-all",
                      isActive
                        ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                        : "text-primary-500 hover:bg-white hover:shadow-sm",
                    )}
                  >
                    {p}
                  </button>
                );
              });
            })()}

            <button
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-9 w-9 rounded-xl flex items-center justify-center text-primary-500 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ==========================================
          Detail Modal — Magazine Layout
          ========================================== */}
      <Dialog
        open={!!selectedReport}
        onOpenChange={() => setSelectedReport(null)}
      >
        <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden bg-white border-none shadow-2xl rounded-2xl sm:rounded-3xl">
          {selectedReport && (() => {
            const modalStatus = getStatusConfig(selectedReport.batteryVoltage);
            const images = selectedReport.images?.length
              ? selectedReport.images
              : [{ id: "legacy", url: selectedReport.imageUrl || "/placeholder-image.jpg" }];

            return (
              <div className="flex flex-col lg:flex-row max-h-[85vh] lg:max-h-[640px] overflow-hidden">
                {/* Left: Immersive Image Gallery */}
                <div className="relative lg:w-[55%] bg-primary-950 shrink-0">
                  {/* Main image */}
                  <div className="relative w-full aspect-[3/2] sm:aspect-[4/3] lg:aspect-auto lg:h-full">
                    <Image
                      src={images[activeImageIdx]?.url || "/placeholder-image.jpg"}
                      alt="Bukti Laporan"
                      fill
                      className="object-cover transition-all duration-500"
                    />
                    {/* Gradient overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-primary-950 via-primary-950/20 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-950/30 to-transparent opacity-0 lg:opacity-100" />

                    {/* Close button (mobile) */}
                    <button
                      onClick={() => setSelectedReport(null)}
                      className="lg:hidden absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white border border-white/10 z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    {/* Image counter */}
                    {images.length > 1 && (
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-black/40 backdrop-blur-md px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] font-bold text-white/80 border border-white/10">
                        {activeImageIdx + 1} / {images.length}
                      </div>
                    )}

                    {/* Bottom overlay content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 space-y-2 sm:space-y-3">
                      {/* Status chip */}
                      <div className="inline-flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-2.5 py-0.5 sm:px-3 sm:py-1">
                        <Zap className={cn("w-3 h-3", modalStatus.color)} />
                        <span className="text-[9px] sm:text-[10px] font-bold text-white tracking-wider uppercase">
                          {selectedReport.batteryVoltage}V · {modalStatus.label}
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-3xl font-black text-white font-mono tracking-tight leading-none">
                        {selectedReport.unit.serialNumber}
                      </h2>

                      <div className="flex items-center gap-1.5 sm:gap-2 text-white/60 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        <span>
                          {selectedReport.unit.regency},{" "}
                          {selectedReport.unit.province}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Thumbnail strip — below image on mobile, overlaid on desktop */}
                  {images.length > 1 && (
                    <div className="relative lg:relative p-2.5 sm:p-3 bg-primary-950/80 lg:bg-primary-950/50 border-t border-white/5">
                      <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                        {images.map((img, idx) => (
                          <button
                            key={img.id}
                            onClick={() => setActiveImageIdx(idx)}
                            className={cn(
                              "relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all duration-200",
                              idx === activeImageIdx
                                ? "border-accent shadow-lg shadow-accent/30 scale-105"
                                : "border-transparent opacity-60 hover:opacity-100",
                            )}
                          >
                            <Image
                              src={img.url}
                              alt=""
                              fill
                              className="object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Data Panel */}
                <div className="flex-1 flex flex-col overflow-y-auto bg-gradient-to-b from-white to-primary-50/30">
                  <DialogHeader className="p-4 sm:p-6 pb-0 shrink-0">
                    <DialogTitle className="sr-only">Detail Laporan</DialogTitle>
                  </DialogHeader>

                  <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5">
                    {/* Reporter card */}
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50/60 border border-primary-100/60">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary-200 to-primary-100 flex items-center justify-center text-xs sm:text-sm font-black text-primary-700 shrink-0">
                        {selectedReport.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-sm text-primary-800 truncate">
                          {selectedReport.user.name}
                        </h4>
                        <p className="text-[11px] text-primary-400 font-medium">
                          {getRelativeTime(selectedReport.createdAt)}
                        </p>
                      </div>
                      <div className="text-right shrink-0 hidden xs:block">
                        <div className="text-[10px] font-semibold text-primary-400 uppercase tracking-wider">
                          Tanggal
                        </div>
                        <div className="text-xs font-bold text-primary-700">
                          {formatDateTime(selectedReport.createdAt)}
                        </div>
                      </div>
                    </div>

                    {/* Voltage meter — visual gauge */}
                    <div className="p-4 rounded-xl bg-white border border-primary-100/60 shadow-sm">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Battery className="w-4 h-4 text-primary-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">
                            Tegangan Baterai
                          </span>
                        </div>
                        <span className={cn("text-lg font-black font-mono tabular-nums", modalStatus.color)}>
                          {selectedReport.batteryVoltage}V
                        </span>
                      </div>
                      <div className={cn("h-2 rounded-full overflow-hidden", modalStatus.barTrack)}>
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-1000 ease-out",
                            modalStatus.barColor,
                          )}
                          style={{ width: `${modalStatus.percent}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1.5">
                        <span className="text-[9px] font-mono text-primary-300">0V</span>
                        <span className={cn("text-[10px] font-bold", modalStatus.color)}>
                          {modalStatus.label}
                        </span>
                        <span className="text-[9px] font-mono text-primary-300">30V</span>
                      </div>
                    </div>

                    {/* Field notes */}
                    <div className="p-4 rounded-xl bg-white border border-primary-100/60 shadow-sm space-y-2">
                      <h5 className="text-[10px] font-black uppercase tracking-widest text-primary-400">
                        Catatan Lapangan
                      </h5>
                      <p className="text-sm font-medium text-primary-700 leading-relaxed">
                        {selectedReport.notes || (
                          <span className="italic text-primary-400">
                            Tidak ada catatan tambahan.
                          </span>
                        )}
                      </p>
                    </div>

                    {/* GPS Coordinates */}
                    <div className="p-4 rounded-xl bg-white border border-primary-100/60 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Navigation className="w-3.5 h-3.5 text-primary-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">
                          Koordinat GPS
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-primary-600 bg-primary-50 px-4 py-2.5 rounded-lg border border-primary-100 text-center break-all select-all">
                        {selectedReport.latitude.toFixed(6)},{" "}
                        {selectedReport.longitude.toFixed(6)}
                      </div>
                    </div>
                  </div>

                  {/* Bottom actions */}
                  <div className="p-4 sm:p-6 pt-3 border-t border-primary-100/60 space-y-2 shrink-0 bg-white/80 backdrop-blur-sm">
                    <Button
                      className="w-full h-11 rounded-xl bg-primary-700 hover:bg-primary-800 text-white font-bold shadow-lg shadow-primary-900/10 transition-all hover:scale-[1.01] active:scale-[0.99] gap-2"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`,
                          "_blank",
                        )
                      }
                    >
                      <MapPin className="w-4 h-4" />
                      Buka di Google Maps
                      <ExternalLink className="w-3 h-3 ml-auto opacity-50" />
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full h-10 rounded-xl text-primary-500 hover:bg-primary-50 font-semibold text-sm"
                      onClick={() => setSelectedReport(null)}
                    >
                      Tutup
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog
        open={!!deleteConfirm}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <DialogContent className="max-w-sm rounded-2xl p-0 border-none shadow-2xl overflow-hidden">
          {/* Red accent header */}
          <div className="bg-gradient-to-br from-rose-500 to-red-600 px-8 pt-8 pb-6 text-center">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Trash2 className="w-7 h-7 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold text-white">
              Hapus Laporan?
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-rose-100 text-sm font-medium">
              Aksi ini tidak bisa dibatalkan.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-5">
            {deleteConfirm && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-primary-100/60">
                <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-primary-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-primary-800 font-mono truncate">
                    {deleteConfirm.unit.serialNumber}
                  </p>
                  <p className="text-[10px] text-primary-400 font-medium">
                    {deleteConfirm.unit.regency}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="h-11 rounded-xl font-bold border-2 border-primary-100 text-primary-600"
              >
                Batal
              </Button>
              <Button
                onClick={handleDelete}
                className="h-11 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-lg shadow-rose-200 transition-all"
                loading={deleting}
              >
                Ya, Hapus
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
