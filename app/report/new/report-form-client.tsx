"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  MapPin,
  Camera,
  Zap,
  Lightbulb,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  type CachedUnit,
} from "@/lib/offline";
import {
  useConnectionStatus,
  OfflineBanner,
} from "@/components/ui/connection-status";
import { BATTERY_THRESHOLDS, getStatusVariant } from "@/lib/constants";

// --- HELPER KOMPRESI GAMBAR ---
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1600;
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
        canvas.toBlob((blob) => {
          if (blob) {
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const newFile = new File([blob], newFileName, { type: "image/jpeg", lastModified: Date.now() });
            resolve(newFile);
          } else {
            reject(new Error("Gagal kompresi gambar"));
          }
        }, "image/jpeg", 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

const addGeotagOverlay = async (file: File, latitude: number, longitude: number, userName: string): Promise<File> => {
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
        if (!ctx) { reject(new Error("Gagal membuat canvas context")); return; }
        ctx.drawImage(img, 0, 0);
        const fontSize = Math.max(20, Math.min(img.width * 0.028, 36));
        const padding = fontSize * 0.8;
        const lineHeight = fontSize * 1.4;
        const now = new Date();
        const dateStr = now.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
        const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
        const lines = [`GPS: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`, `${dateStr}, ${timeStr} WIB`, `Pelapor: ${userName}`];
        const bgHeight = lines.length * lineHeight + padding * 2;
        ctx.font = `bold ${fontSize}px Arial, sans-serif`;
        let maxTextWidth = 0;
        lines.forEach((line) => { const textWidth = ctx.measureText(line).width; if (textWidth > maxTextWidth) maxTextWidth = textWidth; });
        const bgWidth = Math.min(maxTextWidth + padding * 2, img.width * 0.7);
        ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
        ctx.fillRect(0, img.height - bgHeight, bgWidth, bgHeight);
        ctx.fillStyle = "#FFFFFF";
        lines.forEach((line, i) => { const yPos = img.height - bgHeight + padding + i * lineHeight; ctx.fillText(line, padding, yPos); });
        canvas.toBlob((blob) => {
          if (blob) {
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + "_geotag.jpg";
            const newFile = new File([blob], newFileName, { type: "image/jpeg", lastModified: Date.now() });
            resolve(newFile);
          } else {
            reject(new Error("Gagal membuat file gambar dengan geotag"));
          }
        }, "image/jpeg", 0.92);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

interface ReportFormClientProps {
  units: PjutsUnitData[];
  preselectedUnitId?: string;
  userName: string;
}

type Step = 1 | 2 | 3 | 4;

interface FormData {
  unitId: string;
  latitude: number | null;
  longitude: number | null;
  images: File[];
  imagePreviews: string[];
  batteryVoltage: string;
  notes: string;
}

const steps = [
  { id: 1, title: "Pilih Unit", icon: Lightbulb },
  { id: 2, title: "Ambil Foto", icon: Camera },
  { id: 3, title: "Data Teknis", icon: Zap },
  { id: 4, title: "Konfirmasi", icon: Check },
];

export function ReportFormClient({ units, preselectedUnitId, userName }: ReportFormClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isOnline = useConnectionStatus();
  const [currentStep, setCurrentStep] = useState<Step>(preselectedUnitId ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [draftSaved, setDraftSaved] = useState(false);
  const [imageProcessing, setImageProcessing] = useState(false);
  const [formData, setFormData] = useState<FormData>({ unitId: preselectedUnitId || "", latitude: null, longitude: null, images: [], imagePreviews: [], batteryVoltage: "", notes: "" });

  useEffect(() => {
    if (units.length > 0) cacheUnits(units.map(u => ({ id: u.id, serialNumber: u.serialNumber, province: u.province, regency: u.regency, latitude: u.latitude, longitude: u.longitude })));
  }, [units]);

  useEffect(() => {
    const draft = getReportDraft();
    if (draft && !preselectedUnitId) setFormData(prev => ({ ...prev, unitId: draft.unitId || prev.unitId, batteryVoltage: draft.batteryVoltage || prev.batteryVoltage, notes: draft.notes || prev.notes }));
  }, [preselectedUnitId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.unitId || formData.batteryVoltage || formData.notes) {
        saveReportDraft({ unitId: formData.unitId, batteryVoltage: formData.batteryVoltage, notes: formData.notes });
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [formData.unitId, formData.batteryVoltage, formData.notes]);

  const selectedUnit = units.find(u => u.id === formData.unitId);

  const canProceed = useCallback(() => {
    switch (currentStep) {
      case 1: return !!formData.unitId;
      case 2: return formData.images.length > 0 && formData.latitude !== null;
      case 3: return true; // Technical data is optional
      default: return true;
    }
  }, [currentStep, formData.unitId, formData.images.length, formData.latitude]);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) { setGeoError("Geolokasi tidak didukung"); return; }
    setGeoLoading(true); setGeoError(null);
    navigator.geolocation.getCurrentPosition((pos) => { setFormData(prev => ({ ...prev, latitude: pos.coords.latitude, longitude: pos.coords.longitude })); setGeoLoading(false); }, (err) => { setGeoError("Gagal mendapatkan lokasi"); setGeoLoading(false); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 });
  }, []);

  useEffect(() => { if (currentStep === 2 && !formData.latitude) getLocation(); }, [currentStep, formData.latitude, getLocation]);

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (formData.images.length >= 3) { alert("Maksimal 3 foto."); return; }
    if (formData.latitude === null) { alert("GPS diperlukan."); return; }
    setImageProcessing(true);
    try {
      const geotagged = await addGeotagOverlay(file, formData.latitude, formData.longitude!, userName);
      const preview = URL.createObjectURL(geotagged);
      setFormData(prev => ({ ...prev, images: [...prev.images, geotagged], imagePreviews: [...prev.imagePreviews, preview] }));
    } catch {
      const preview = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, images: [...prev.images, file], imagePreviews: [...prev.imagePreviews, preview] }));
    } finally {
      setImageProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!selectedUnit || formData.images.length === 0 || formData.latitude === null) return;
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("unitId", formData.unitId);
      fd.append("latitude", formData.latitude.toString());
      fd.append("longitude", formData.longitude!.toString());
      fd.append("batteryVoltage", formData.batteryVoltage);
      fd.append("notes", formData.notes);
      for (const file of formData.images) {
        let toUpload = file;
        if (toUpload.size > 1024 * 1024) toUpload = await compressImage(toUpload);
        fd.append("images", toUpload);
      }
      const res = await submitReport(fd);
      if (res.success) { clearReportDraft(); setSubmitResult({ success: true, message: "Laporan terkirim!" }); setTimeout(() => router.push("/dashboard"), 2000); }
      else setSubmitResult({ success: false, message: res.error || "Gagal kirim" });
    } catch { setSubmitResult({ success: false, message: "Terjadi kesalahan" }); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <OfflineBanner />
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 p-4 flex items-center justify-between">
        <Link href="/dashboard"><Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button></Link>
        <div className="text-center"><h1 className="font-bold">Buat Laporan</h1><p className="text-xs text-slate-500">Langkah {currentStep}/4</p></div>
        <div>{draftSaved && <Save className="h-4 w-4 text-emerald-600" />}</div>
      </header>
      <Progress value={(currentStep / 4) * 100} className="h-1 rounded-none" />
      <div className="max-w-lg mx-auto p-4 flex-grow w-full space-y-6">
        {currentStep === 1 && (
          <Card className="p-4 space-y-4">
            <h2 className="font-bold">Pilih Unit</h2>
            <Select value={formData.unitId} onValueChange={v => setFormData(prev => ({ ...prev, unitId: v }))}>
              <SelectTrigger><SelectValue placeholder="Pilih unit..." /></SelectTrigger>
              <SelectContent>{units.map(u => <SelectItem key={u.id} value={u.id}>{u.serialNumber}</SelectItem>)}</SelectContent>
            </Select>
          </Card>
        )}
        {currentStep === 2 && (
          <Card className="p-4 space-y-4">
            <div className="flex justify-between items-center"><h2 className="font-bold">Ambil Foto</h2><Badge>{formData.images.length}/3</Badge></div>
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageCapture} className="hidden" />
            <div className="grid grid-cols-2 gap-2">
              {formData.imagePreviews.map((p, i) => (
                <div key={i} className="relative aspect-video rounded-lg overflow-hidden border">
                  <Image src={p} alt="Preview" fill className="object-cover" />
                  <button onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i), imagePreviews: prev.imagePreviews.filter((_, idx) => idx !== i) }))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"><X className="h-3 w-3" /></button>
                </div>
              ))}
              {formData.images.length < 3 && (
                <button onClick={() => fileInputRef.current?.click()} disabled={imageProcessing || !formData.latitude} className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center bg-slate-50">
                  {imageProcessing ? <Loader2 className="animate-spin" /> : <Camera className="h-6 w-6" />}
                  <span className="text-xs mt-1">Tambah Foto</span>
                </button>
              )}
            </div>
            <div className="p-3 bg-slate-50 rounded-lg flex items-center justify-between">
              <span className="text-sm">GPS: {formData.latitude ? `${formData.latitude.toFixed(4)}, ${formData.longitude?.toFixed(4)}` : "Belum ada"}</span>
              <Button size="sm" variant="ghost" onClick={getLocation}><RefreshCw className={cn("h-4 w-4", geoLoading && "animate-spin")} /></Button>
            </div>
          </Card>
        )}
        {currentStep === 3 && (
          <Card className="p-4 space-y-4">
            <h2 className="font-bold">Data Teknis</h2>
            <Input type="number" label="Tegangan (V)" value={formData.batteryVoltage} onChange={e => setFormData(prev => ({ ...prev, batteryVoltage: e.target.value }))} />
            <Textarea label="Catatan" value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} />
          </Card>
        )}
        {currentStep === 4 && (
          <Card className="p-4 space-y-4">
            <h2 className="font-bold">Konfirmasi</h2>
            <div className="text-sm space-y-2">
              <div className="flex justify-between"><span>Unit:</span><span className="font-bold">{selectedUnit?.serialNumber}</span></div>
              <div className="flex justify-between"><span>Tegangan:</span><span className="font-bold">{formData.batteryVoltage}V</span></div>
            </div>
            {submitResult && <p className={cn("text-center font-bold", submitResult.success ? "text-emerald-600" : "text-red-600")}>{submitResult.message}</p>}
          </Card>
        )}
      </div>
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex gap-2">
        {currentStep > 1 && <Button variant="outline" className="flex-1" onClick={() => setCurrentStep(s => (s-1) as Step)}>Kembali</Button>}
        {currentStep < 4 ? <Button className="flex-1" onClick={() => setCurrentStep(s => (s+1) as Step)} disabled={!canProceed()}>Lanjut</Button> : <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting || !isOnline}>{isOnline ? "Kirim" : "Offline"}</Button>}
      </div>
    </div>
  );
}
