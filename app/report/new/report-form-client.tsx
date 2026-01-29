"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Loader2,
  RefreshCw,
  X,
  Save,
  ChevronRight,
  Zap,
  MapPin,
  ClipboardCheck,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PjutsUnitData } from "@/app/actions/units";
import { submitReport } from "@/app/actions/reports";
import { cn } from "@/lib/utils";
import {
  cacheUnits,
  saveReportDraft,
  getReportDraft,
  clearReportDraft,
} from "@/lib/offline";
import {
  useConnectionStatus,
  OfflineBanner,
} from "@/components/ui/connection-status";

// --- ANIMATION VARIANTS ---
const pageVariants = {
  initial: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    filter: "blur(4px)",
  }),
  animate: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring", damping: 25, stiffness: 200 } as const,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.2 },
  }),
};

// --- HELPER COMPRESSION ---
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const scaleSize = MAX_WIDTH / img.width;
        if (scaleSize >= 1) {
          canvas.width = img.width;
          canvas.height = img.height;
        } else {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
        }
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
              resolve(new File([blob], newFileName, { type: "image/jpeg" }));
            } else reject(new Error("Compression failed"));
          },
          "image/jpeg",
          0.8,
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

const addGeotagOverlay = async (
  file: File,
  lat: number,
  lng: number,
  user: string,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas context error"));
        ctx.drawImage(img, 0, 0);
        const fontSize = Math.max(24, img.width * 0.03);
        const padding = fontSize;
        const now = new Date();
        const info = [
          `GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          `${now.toLocaleString("id-ID")}`,
          `Petugas: ${user}`,
        ];
        ctx.font = `bold ${fontSize}px Inter, sans-serif`;
        const h = info.length * fontSize * 1.5 + padding * 2;
        ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
        ctx.fillRect(0, img.height - h, img.width, h);
        ctx.fillStyle = "#fff";
        info.forEach((text, i) =>
          ctx.fillText(
            text,
            padding,
            img.height - h + padding + i * fontSize * 1.5 + fontSize,
          ),
        );
        canvas.toBlob(
          (b) => (b ? resolve(new File([b], file.name)) : reject()),
          "image/jpeg",
          0.9,
        );
      };
    };
  });
};

interface ReportFormClientProps {
  units: PjutsUnitData[];
  preselectedUnitId?: string;
  userName: string;
}

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { id: 1, label: "Pilih Unit", icon: Smartphone },
  { id: 2, label: "Foto Lokasi", icon: Camera },
  { id: 3, label: "Data Teknis", icon: Zap },
  { id: 4, label: "Verifikasi", icon: ClipboardCheck },
];

export function ReportFormClient({
  units,
  preselectedUnitId,
  userName,
}: ReportFormClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useConnectionStatus();
  const [[step, direction], setStep] = useState<[Step, number]>([
    preselectedUnitId ? 2 : 1,
    0,
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [formData, setFormData] = useState({
    unitId: preselectedUnitId || "",
    latitude: null as number | null,
    longitude: null as number | null,
    images: [] as File[],
    imagePreviews: [] as string[],
    batteryVoltage: "",
    notes: "",
  });

  const paginate = (newStep: Step) => {
    setStep([newStep, newStep > step ? 1 : -1]);
  };

  useEffect(() => {
    if (units.length > 0)
      cacheUnits(
        units.map((u) => ({
          id: u.id,
          serialNumber: u.serialNumber,
          province: u.province,
          regency: u.regency,
          latitude: u.latitude,
          longitude: u.longitude,
        })),
      );
  }, [units]);

  useEffect(() => {
    const draft = getReportDraft();
    if (draft && !preselectedUnitId)
      setFormData((prev) => ({
        ...prev,
        unitId: draft.unitId || prev.unitId,
        batteryVoltage: draft.batteryVoltage || prev.batteryVoltage,
        notes: draft.notes || prev.notes,
      }));
  }, [preselectedUnitId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.unitId || formData.batteryVoltage || formData.notes) {
        saveReportDraft({
          unitId: formData.unitId,
          batteryVoltage: formData.batteryVoltage,
          notes: formData.notes,
        });
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData.unitId, formData.batteryVoltage, formData.notes]);

  const selectedUnit = units.find((u) => u.id === formData.unitId);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((p) => ({
          ...p,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    if (step === 2 && !formData.latitude) getLocation();
  }, [step, formData.latitude, getLocation]);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || formData.images.length >= 3 || formData.latitude === null)
      return;
    setImageProcessing(true);
    try {
      const geotagged = await addGeotagOverlay(
        file,
        formData.latitude,
        formData.longitude!,
        userName,
      );
      const preview = URL.createObjectURL(geotagged);
      setFormData((p) => ({
        ...p,
        images: [...p.images, geotagged],
        imagePreviews: [...p.imagePreviews, preview],
      }));
    } catch {
      const preview = URL.createObjectURL(file);
      setFormData((p) => ({
        ...p,
        images: [...p.images, file],
        imagePreviews: [...p.imagePreviews, preview],
      }));
    } finally {
      setImageProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (
      !selectedUnit ||
      formData.images.length === 0 ||
      formData.latitude === null
    )
      return;
    setIsSubmitting(true);
    try {
      const fd = new window.FormData();
      fd.append("unitId", formData.unitId);
      fd.append("latitude", formData.latitude.toString());
      fd.append("longitude", formData.longitude?.toString() || "0");
      fd.append("batteryVoltage", formData.batteryVoltage);
      fd.append("notes", formData.notes);
      for (const f of formData.images) {
        const toUpload = f.size > 1024 * 1024 ? await compressImage(f) : f;
        fd.append("images", toUpload);
      }
      const res = await submitReport(fd);
      if (res.success) {
        clearReportDraft();
        setSubmitResult({
          success: true,
          message: "Laporan berhasil terkirim!",
        });
        setTimeout(() => router.push("/dashboard"), 2000);
      } else
        setSubmitResult({
          success: false,
          message: res.error || "Gagal mengirim laporan",
        });
    } catch {
      setSubmitResult({ success: false, message: "Kesalahan jaringan" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-slate-900 pb-32">
      <OfflineBanner />

      {/* Modern Tactical Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="p-2 -ml-2 rounded-xl hover:bg-slate-100/80 transition-all active:scale-95"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-0.5">
              PJUTS Jambi
            </span>
            <h1 className="text-sm font-extrabold text-slate-800">
              Field Maintenance
            </h1>
          </div>
          <div className="w-10 flex justify-end">
            {draftSaved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100 shadow-sm shadow-emerald-50"
              >
                <Save className="h-3.5 w-3.5 text-emerald-600" />
              </motion.div>
            )}
          </div>
        </div>

        {/* Dynamic Step Navigator */}
        <div className="px-4 pb-4 pt-0">
          <div className="flex justify-between items-center bg-slate-100/50 p-1.5 rounded-2xl border border-slate-200/40 relative">
            <div className="absolute inset-y-1.5 left-1.5 right-1.5 flex pointer-events-none">
              <div
                className="h-full bg-white rounded-xl shadow-md transition-all duration-500 ease-out border border-slate-100"
                style={{
                  width: `${100 / STEPS.length}%`,
                  transform: `translateX(${(step - 1) * 100}%)`,
                }}
              />
            </div>
            {STEPS.map((s) => {
              const Icon = s.icon;
              const isActive = step === s.id;
              const isCompleted = step > s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    if (isCompleted) paginate(s.id as Step);
                  }}
                  disabled={!isCompleted && !isActive}
                  className={cn(
                    "relative z-10 flex flex-1 flex-col items-center justify-center py-2 transition-all duration-300",
                    isCompleted || isActive ? "opacity-100" : "opacity-40",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 mb-1 transition-colors",
                      isActive ? "text-emerald-600" : "text-slate-500",
                    )}
                  />
                  <span
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-tighter",
                      isActive ? "text-slate-900" : "text-slate-500",
                    )}
                  >
                    {s.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Viewport for Animated Steps */}
      <main className="max-w-xl mx-auto p-4 md:p-6 overflow-hidden relative min-h-[50vh]">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full"
          >
            {/* Step 1: Unit Identification */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Identifikasi Unit
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Pilih aset yang akan dilakukan pengecekan malam ini.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="bg-emerald-600/5 border border-emerald-600/10 p-4 rounded-3xl flex items-start gap-4">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center flex-shrink-0 text-white shadow-lg shadow-emerald-100">
                      <Smartphone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">
                        Aset Aktif Jambi
                      </h3>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">
                        Data unit telah disinkronkan untuk penggunaan offline di
                        lapangan.
                      </p>
                    </div>
                  </div>

                  <Card className="p-6 border-slate-200/60 shadow-xl shadow-slate-200/20 rounded-3xl">
                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">
                        Pilih Serial Number
                      </label>
                      <Select
                        value={formData.unitId}
                        onValueChange={(v) =>
                          setFormData((p) => ({ ...p, unitId: v }))
                        }
                      >
                        <SelectTrigger className="h-16 rounded-2xl border-slate-200 bg-slate-50/50 text-base font-bold text-slate-800 transition-all focus:ring-emerald-500/20 active:scale-[0.99] hover:bg-slate-50">
                          <SelectValue placeholder="Pilih unit PJUTS..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-72 rounded-2xl border-slate-200 shadow-2xl p-2">
                          {units.map((u) => (
                            <SelectItem
                              key={u.id}
                              value={u.id}
                              className="py-3.5 rounded-xl cursor-pointer focus:bg-emerald-50 focus:text-emerald-900 mb-1"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-bold tracking-tight">
                                  {u.serialNumber}
                                </span>
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {u.regency.toLowerCase()}, Jambi
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 2: Visual Evidence */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      Bukti Foto
                    </h2>
                    <p className="text-sm text-slate-500 font-medium">
                      Ambil foto kondisi lampu & panel.
                    </p>
                  </div>
                  <div className="bg-slate-900 text-white text-[11px] px-3 py-1.5 rounded-full font-black tracking-widest">
                    {formData.images.length} / 3
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <AnimatePresence>
                    {formData.imagePreviews.map((src, i) => (
                      <motion.div
                        layout
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        key={src}
                        className="group relative aspect-square rounded-3xl overflow-hidden border-2 border-white shadow-xl shadow-slate-200/50"
                      >
                        <Image
                          src={src}
                          alt="Evidence"
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <button
                          onClick={() =>
                            setFormData((p) => ({
                              ...p,
                              images: p.images.filter((_, idx) => idx !== i),
                              imagePreviews: p.imagePreviews.filter(
                                (_, idx) => idx !== i,
                              ),
                            }))
                          }
                          className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur text-red-600 rounded-full shadow-lg hover:bg-red-600 hover:text-white transition-all active:scale-90"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {formData.images.length < 3 && (
                    <motion.button
                      whileTap={{ scale: 0.96 }}
                      onClick={() => fileInputRef.current?.click()}
                      disabled={imageProcessing || !formData.latitude}
                      className={cn(
                        "aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all",
                        formData.latitude
                          ? "bg-white border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-300"
                          : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed",
                      )}
                    >
                      <div
                        className={cn(
                          "p-4 rounded-2xl transition-colors",
                          formData.latitude
                            ? "bg-emerald-50"
                            : "bg-slate-200/50",
                        )}
                      >
                        {imageProcessing ? (
                          <Loader2 className="h-7 w-7 animate-spin" />
                        ) : (
                          <Camera className="h-7 w-7" />
                        )}
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        {imageProcessing ? "Memproses..." : "Capture"}
                      </span>
                    </motion.button>
                  )}
                </div>

                {/* Tactical Meta Card */}
                <div className="bg-slate-900 p-5 rounded-3xl text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <MapPin className="h-24 w-24" />
                  </div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div
                      className={cn(
                        "p-3 rounded-2xl backdrop-blur-md",
                        formData.latitude ? "bg-emerald-500/20" : "bg-white/5",
                      )}
                    >
                      <MapPin
                        className={cn(
                          "h-5 w-5",
                          formData.latitude
                            ? "text-emerald-400"
                            : "text-amber-400 animate-pulse",
                        )}
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">
                          Field Geotagging
                        </span>
                        {geoLoading && (
                          <Loader2 className="h-2.5 w-2.5 animate-spin text-emerald-500" />
                        )}
                      </div>
                      <p className="text-sm font-bold tracking-tight mt-1 font-mono">
                        {formData.latitude
                          ? `${formData.latitude.toFixed(6)}, ${formData.longitude?.toFixed(6)}`
                          : "Sinkronisasi GPS..."}
                      </p>
                    </div>
                    <button
                      onClick={getLocation}
                      disabled={geoLoading}
                      className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 active:scale-90 transition-all"
                    >
                      <RefreshCw
                        className={cn("h-4 w-4", geoLoading && "animate-spin")}
                      />
                    </button>
                  </div>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageCapture}
                  className="hidden"
                />
              </div>
            )}

            {/* Step 3: Technical Metrics */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Metrik Teknis
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Input parameter fisik di lapangan.
                  </p>
                </div>

                <div className="grid gap-6">
                  <Card className="p-8 space-y-8 rounded-[32px] border-slate-200/60 shadow-xl shadow-slate-200/20">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                          Tegangan Aki
                        </label>
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-500 border-0 rounded-lg text-[10px] uppercase tracking-wider px-2 py-0.5"
                        >
                          Opsional
                        </Badge>
                      </div>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 p-2 bg-slate-100 rounded-xl transition-colors group-focus-within:bg-emerald-600 group-focus-within:text-white">
                          <Zap className="h-4 w-4" />
                        </div>
                        <Input
                          type="number"
                          placeholder="00.0"
                          className="h-20 pl-16 pr-20 rounded-2xl text-2xl font-black border-slate-100 bg-slate-50/50 transition-all focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white"
                          value={formData.batteryVoltage}
                          onChange={(e) =>
                            setFormData((p) => ({
                              ...p,
                              batteryVoltage: e.target.value,
                            }))
                          }
                        />
                        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-sm font-black text-slate-400 uppercase tracking-widest">
                          Volt DC
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] ml-1">
                        Catatan Deskripsi
                      </label>
                      <Textarea
                        placeholder="Tuliskan detail temuan atau kerusakan (jika ada)..."
                        className="min-h-[160px] rounded-2xl border-slate-100 bg-slate-50/50 p-6 text-base font-medium transition-all focus:ring-emerald-500/10 focus:border-emerald-500 focus:bg-white resize-none"
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData((p) => ({ ...p, notes: e.target.value }))
                        }
                      />
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {/* Step 4: Final Summary */}
            {step === 4 && (
              <div className="space-y-6 pb-4">
                <div className="text-center space-y-2 mb-8">
                  <div className="mx-auto w-20 h-20 bg-emerald-600/10 rounded-[28px] flex items-center justify-center mb-4 border border-emerald-600/20">
                    <ClipboardCheck className="h-10 w-10 text-emerald-600" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    Siap Dikirim
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Tinjau ringkasan data perawatan Anda.
                  </p>
                </div>

                <div className="space-y-4">
                  <Card className="rounded-[32px] overflow-hidden border-slate-200/60 shadow-2xl shadow-emerald-900/5">
                    <div className="bg-slate-900 p-6 flex justify-between items-center text-white">
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 block mb-1">
                          Aset PJUTS
                        </span>
                        <h3 className="text-xl font-black tracking-tight">
                          {selectedUnit?.serialNumber}
                        </h3>
                      </div>
                      <Badge className="bg-emerald-500 hover:bg-emerald-500 text-white rounded-full px-3 py-1 font-black shadow-lg shadow-emerald-500/20 border-0">
                        VAL-2026
                      </Badge>
                    </div>
                    <div className="p-8 bg-white space-y-6">
                      <div className="grid grid-cols-2 gap-8 relative">
                        <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-slate-100" />
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                            Voltase
                          </span>
                          <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-emerald-500" />
                            <span className="text-xl font-black text-slate-800">
                              {formData.batteryVoltage || "0.0"}
                              <span className="text-[10px] font-bold text-slate-400 ml-1">
                                V
                              </span>
                            </span>
                          </div>
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block mb-2">
                            Dokumentasi
                          </span>
                          <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-emerald-500" />
                            <span className="text-xl font-black text-slate-800">
                              {formData.images.length}
                              <span className="text-[10px] font-bold text-slate-400 ml-1">
                                JPG
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                          Analisa Teknis
                        </span>
                        <p className="text-sm text-slate-700 font-medium leading-relaxed">
                          {formData.notes ? (
                            `"${formData.notes}"`
                          ) : (
                            <span className="text-slate-400 italic font-normal">
                              Tidak ada catatan tambahan.
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                          <Smartphone className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Petugas: {userName}
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {submitResult && (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "p-5 rounded-[24px] text-sm font-black text-center border-2",
                      submitResult.success
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                        : "bg-red-50 border-red-100 text-red-700",
                    )}
                  >
                    {submitResult.message}
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Modern Control Deck */}
      <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-xl p-4 z-50">
        <div className="bg-white/80 backdrop-blur-2xl border border-white p-3 rounded-[32px] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.15)] flex gap-3">
          {step > 1 && (
            <Button
              variant="outline"
              className="h-16 px-8 rounded-2xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-xs flex-1 hover:bg-slate-50 active:scale-95 transition-all shadow-sm"
              onClick={() => paginate((step - 1) as Step)}
            >
              Back
            </Button>
          )}
          {step < 4 ? (
            <Button
              className="h-16 px-10 rounded-2xl bg-slate-900 border-0 text-white font-black uppercase tracking-[0.2em] text-xs flex-[2] hover:bg-black active:scale-[0.97] transition-all shadow-xl shadow-slate-900/20"
              onClick={() => {
                if (step === 1 && !formData.unitId) return;
                if (
                  step === 2 &&
                  (formData.images.length === 0 || formData.latitude === null)
                )
                  return;
                paginate((step + 1) as Step);
              }}
              disabled={
                step === 1
                  ? !formData.unitId
                  : step === 2
                    ? formData.images.length === 0 || formData.latitude === null
                    : false
              }
            >
              Continue <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              className="h-16 px-10 rounded-2xl bg-emerald-600 border-0 text-white font-black uppercase tracking-[0.2em] text-xs flex-[2] hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-xl shadow-emerald-500/30"
              onClick={handleSubmit}
              disabled={isSubmitting || !isOnline}
            >
              {isSubmitting ? (
                <Loader2 className="animate-spin h-6 w-6" />
              ) : isOnline ? (
                "Finish Report"
              ) : (
                "Sync Offline"
              )}
            </Button>
          )}
        </div>
      </footer>
    </div>
  );
}
