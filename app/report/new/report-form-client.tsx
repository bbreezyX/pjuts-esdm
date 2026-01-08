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
  Trash2,
  Plus,
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

// --- HELPER KOMPRESI GAMBAR ---
const compressImage = async (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement('img');
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');

        // REKOMENDASI: Balanced HD (Max 1600px)
        const MAX_WIDTH = 1600;
        const scaleSize = MAX_WIDTH / img.width;

        if (scaleSize >= 1) {
          canvas.width = img.width;
          canvas.height = img.height;
        } else {
          canvas.width = MAX_WIDTH;
          canvas.height = img.height * scaleSize;
        }

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        // REKOMENDASI: JPEG Quality 80% (0.8)
        canvas.toBlob((blob) => {
          if (blob) {
            // Ganti ekstensi ke .jpg
            const newFileName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
            const newFile = new File([blob], newFileName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(newFile);
          } else {
            reject(new Error('Gagal kompresi gambar'));
          }
        }, 'image/jpeg', 0.8);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
// ------------------------------

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

export function ReportFormClient({
  units,
  preselectedUnitId,
  userName,
}: ReportFormClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>(preselectedUnitId ? 2 : 1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    unitId: preselectedUnitId || "",
    latitude: null,
    longitude: null,
    images: [],
    imagePreviews: [],
    batteryVoltage: "",
    notes: "",
  });

  const selectedUnit = units.find((u) => u.id === formData.unitId);

  // Get geolocation
  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolokasi tidak didukung oleh browser ini");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }));
        setGeoLoading(false);
      },
      (error) => {
        let message = "Gagal mendapatkan lokasi";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = "Izin lokasi ditolak. Aktifkan GPS dan izinkan akses lokasi.";
            break;
          case error.POSITION_UNAVAILABLE:
            message = "Informasi lokasi tidak tersedia";
            break;
          case error.TIMEOUT:
            message = "Waktu habis saat mendapatkan lokasi";
            break;
        }
        setGeoError(message);
        setGeoLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Auto-get location on step 2
  useEffect(() => {
    if (currentStep === 2 && !formData.latitude) {
      getLocation();
    }
  }, [currentStep, formData.latitude, getLocation]);

  // Handle image capture
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (formData.images.length >= 3) {
        alert("Maksimal 3 foto per laporan.");
        return;
      }

      const preview = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, file],
        imagePreviews: [...prev.imagePreviews, preview],
      }));

      // Reset input value so same file can be selected again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => {
      const newImages = [...prev.images];
      const newPreviews = [...prev.imagePreviews];

      // Revoke object URL to avoid memory leaks
      URL.revokeObjectURL(newPreviews[index]);

      newImages.splice(index, 1);
      newPreviews.splice(index, 1);

      return {
        ...prev,
        images: newImages,
        imagePreviews: newPreviews,
      };
    });
  };

  // Validate current step
  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!formData.unitId;
      case 2:
        return formData.images.length > 0 && formData.latitude !== null && formData.longitude !== null;
      case 3:
        return !!formData.batteryVoltage && parseFloat(formData.batteryVoltage) > 0;
      default:
        return true;
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedUnit || formData.images.length === 0 || formData.latitude === null || formData.longitude === null) {
      return;
    }

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const fd = new FormData();
      fd.append("unitId", formData.unitId);
      fd.append("latitude", formData.latitude.toString());
      fd.append("longitude", formData.longitude.toString());
      fd.append("batteryVoltage", formData.batteryVoltage);
      fd.append("notes", formData.notes);

      // 1. KOMPRESI GAMBAR SEBELUM UPLOAD
      for (const file of formData.images) {
        let imageToUpload = file;

        // Jika file > 1MB, lakukan kompresi
        if (imageToUpload.size > 1024 * 1024) {
          try {
            imageToUpload = await compressImage(imageToUpload);
          } catch (error) {
            console.error("Gagal mengompresi gambar, menggunakan file asli", error);
          }
        }

        fd.append("images", imageToUpload);
      }

      const result = await submitReport(fd);

      if (result.success) {
        setSubmitResult({
          success: true,
          message: "Laporan berhasil dikirim!",
        });
        // Redirect after 2 seconds
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setSubmitResult({
          success: false,
          message: result.error || "Gagal mengirim laporan",
        });
      }
    } catch {
      setSubmitResult({
        success: false,
        message: "Terjadi kesalahan. Silakan coba lagi.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressValue = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 safe-area-pt">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="font-semibold text-slate-900">Buat Laporan</h1>
            <p className="text-xs text-slate-500">
              Langkah {currentStep} dari 4
            </p>
          </div>
          <div className="w-9" /> {/* Spacer */}
        </div>
        <Progress value={progressValue} className="h-1" />
      </header>

      {/* Step Indicators */}
      <div className="max-w-lg mx-auto px-4 py-4 w-full">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = currentStep > step.id;
            const isCurrent = currentStep === step.id;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                    isCompleted
                      ? "bg-emerald-500 text-white"
                      : isCurrent
                        ? "bg-primary-600 text-white"
                        : "bg-slate-200 text-slate-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={cn(
                      "w-8 sm:w-12 h-1 mx-1",
                      currentStep > step.id ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-lg mx-auto px-4 pb-32 flex-grow w-full">
        {/* Step 1: Select Unit */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Pilih Unit PJUTS
              </h2>
              <Select
                value={formData.unitId}
                onValueChange={(v) =>
                  setFormData((prev) => ({ ...prev, unitId: v }))
                }
              >
                <SelectTrigger label="Unit PJUTS">
                  <SelectValue placeholder="Pilih unit yang akan dilaporkan" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.id} value={unit.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{unit.serialNumber}</span>
                        <span className="text-xs text-slate-500">
                          {unit.province}, {unit.regency}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedUnit && (
                <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center shrink-0">
                      <Lightbulb className="h-5 w-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">
                        {selectedUnit.serialNumber}
                      </p>
                      <p className="text-sm text-slate-600">
                        {selectedUnit.province}, {selectedUnit.regency}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <MapPin className="h-3 w-3 text-slate-400" />
                        <code className="text-xs text-slate-500">
                          {selectedUnit.latitude.toFixed(6)},{" "}
                          {selectedUnit.longitude.toFixed(6)}
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Step 2: Capture Photo */}
        {currentStep === 2 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-slate-900">
                  Ambil Foto Unit
                </h2>
                <Badge variant="outline">
                  {formData.images.length}/3 Foto
                </Badge>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageCapture}
                className="hidden"
              />

              {/* Image Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {formData.imagePreviews.map((preview, idx) => (
                  <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-sm group">
                    <Image
                      src={preview}
                      alt={`Foto ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-80 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1">
                      Foto {idx + 1}
                    </div>
                  </div>
                ))}

                {/* Add Button */}
                {formData.images.length < 3 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-video rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center gap-2 hover:bg-slate-100 hover:border-primary-300 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-primary-600" />
                    </div>
                    <span className="text-xs font-medium text-slate-600">
                      Tambah ({3 - formData.images.length})
                    </span>
                  </button>
                )}
              </div>

              {formData.images.length === 0 && (
                <div className="text-center p-4 bg-slate-50 rounded-lg border border-slate-100 mb-4">
                  <Camera className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Belum ada foto diambil.</p>
                </div>
              )}

              {/* Location */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700">
                    Lokasi GPS
                  </span>
                  {formData.latitude && formData.longitude && (
                    <Badge variant="success">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Terkunci
                    </Badge>
                  )}
                </div>

                {geoLoading ? (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Mendapatkan lokasi...
                  </div>
                ) : geoError ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      {geoError}
                    </div>
                    <Button variant="outline" size="sm" onClick={getLocation}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Coba Lagi
                    </Button>
                  </div>
                ) : formData.latitude && formData.longitude ? (
                  <div className="flex items-center justify-between">
                    <code className="text-sm text-slate-600">
                      {formData.latitude.toFixed(6)}, {formData.longitude.toFixed(6)}
                    </code>
                    <Button variant="ghost" size="sm" onClick={getLocation}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Perbarui
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={getLocation}>
                    <MapPin className="h-4 w-4 mr-2" />
                    Dapatkan Lokasi
                  </Button>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Technical Data */}
        {currentStep === 3 && (
          <div className="space-y-4 animate-fade-in">
            <Card className="p-4">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">
                Data Teknis
              </h2>

              <div className="space-y-4">
                <Input
                  type="number"
                  label="Tegangan Baterai (Volt)"
                  placeholder="Contoh: 24.5"
                  value={formData.batteryVoltage}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      batteryVoltage: e.target.value,
                    }))
                  }
                  required
                  hint="Ukur menggunakan multimeter"
                />

                <Textarea
                  label="Catatan (Opsional)"
                  placeholder="Tambahkan catatan tentang kondisi unit, kerusakan, dll..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  rows={4}
                />
              </div>

              {/* Quick Status Indicators */}
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-sm font-medium text-slate-700 mb-2">
                  Status berdasarkan tegangan:
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div
                    className={cn(
                      "p-2 rounded text-center",
                      parseFloat(formData.batteryVoltage) >= 20
                        ? "bg-emerald-100 text-emerald-700 font-medium"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    ≥20V: Baik
                  </div>
                  <div
                    className={cn(
                      "p-2 rounded text-center",
                      parseFloat(formData.batteryVoltage) >= 10 &&
                        parseFloat(formData.batteryVoltage) < 20
                        ? "bg-amber-100 text-amber-700 font-medium"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    10-20V: Perlu Cek
                  </div>
                  <div
                    className={cn(
                      "p-2 rounded text-center",
                      parseFloat(formData.batteryVoltage) > 0 &&
                        parseFloat(formData.batteryVoltage) < 10
                        ? "bg-red-100 text-red-700 font-medium"
                        : "bg-slate-100 text-slate-500"
                    )}
                  >
                    {"<10V: Offline"}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {currentStep === 4 && (
          <div className="space-y-4 animate-fade-in">
            {submitResult ? (
              <Card className="p-6 text-center">
                {submitResult.success ? (
                  <>
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Berhasil!
                    </h3>
                    <p className="text-slate-600">{submitResult.message}</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Mengalihkan ke dashboard...
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                      <X className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      Gagal
                    </h3>
                    <p className="text-slate-600">{submitResult.message}</p>
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => setSubmitResult(null)}
                    >
                      Coba Lagi
                    </Button>
                  </>
                )}
              </Card>
            ) : (
              <Card className="p-4">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Konfirmasi Laporan
                </h2>

                {/* Preview Images Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {formData.imagePreviews.map((preview, idx) => (
                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <Image
                        src={preview}
                        alt={`Preview ${idx}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Unit</span>
                    <span className="font-medium text-slate-900">
                      {selectedUnit?.serialNumber}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Lokasi</span>
                    <span className="font-medium text-slate-900">
                      {selectedUnit?.province}, {selectedUnit?.regency}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Koordinat GPS</span>
                    <code className="text-sm text-slate-900">
                      {formData.latitude?.toFixed(6)},{" "}
                      {formData.longitude?.toFixed(6)}
                    </code>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-slate-600">Tegangan</span>
                    <Badge
                      variant={
                        parseFloat(formData.batteryVoltage) >= 20
                          ? "success"
                          : parseFloat(formData.batteryVoltage) >= 10
                            ? "warning"
                            : "destructive"
                      }
                    >
                      {formData.batteryVoltage}V
                    </Badge>
                  </div>
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-slate-600">Pelapor</span>
                    <span className="font-medium text-slate-900">{userName}</span>
                  </div>
                  {formData.notes && (
                    <div className="py-2">
                      <span className="text-slate-600 block mb-1">Catatan</span>
                      <p className="text-sm text-slate-900 bg-slate-50 p-2 rounded">
                        {formData.notes}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Fixed Bottom Navigation - Improved UI/UX */}
      {!submitResult && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] safe-area-pb">
          <div className="max-w-lg mx-auto px-4 py-3 flex gap-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all"
                onClick={() => setCurrentStep((s) => (s - 1) as Step)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali
              </Button>
            )}
            {currentStep < 4 ? (
              <Button
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                onClick={() => setCurrentStep((s) => (s + 1) as Step)}
                disabled={!canProceed()}
              >
                Lanjut
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg active:scale-[0.98] transition-all"
                onClick={handleSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Kirim Laporan
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
