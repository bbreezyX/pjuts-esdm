"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { utils, read } from "xlsx-js-style";
import { downloadStyledExcel } from "@/lib/excel-style";
import { bulkCreateUnits } from "@/app/actions/units";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface ImportUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportUnitDialog({
  open,
  onOpenChange,
}: ImportUnitDialogProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{
    created: number;
    skipped: number;
    errors: {
      serialNumber?: string;
      error: string;
      details?: Record<string, string[] | undefined>;
    }[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const templateData = [
    {
      serialNumber: "PJUTS-JAMBI-001",
      latitude: -1.6101,
      longitude: 103.6131,
      province: "Jambi",
      regency: "Kota Jambi",
      district: "Telanaipura",
      village: "Pematang Sulur",
      address: "Jl. Sri Rejeki No. 10",
    },
  ];

  const downloadTemplate = () => {
    downloadStyledExcel(
      [{ name: "Template_Import_Unit", data: templateData }],
      "Template_Import_PJUTS.xlsx",
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setResult(null);

      const data = await file.arrayBuffer();
      const workbook = read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = utils.sheet_to_json(worksheet) as Record<
        string,
        unknown
      >[];

      if (jsonData.length === 0) {
        throw new Error("File Excel kosong atau format tidak sesuai.");
      }

      // Basic mapping and cleaning
      const unitsToImport = jsonData.map((row) => {
        const lat = row.latitude || row["Latitude"];
        const lng = row.longitude || row["Longitude"];

        return {
          serialNumber: String(
            row.serialNumber || row["Serial Number"] || "",
          ).toUpperCase(), // Auto-convert to uppercase
          latitude:
            lat !== undefined && lat !== ""
              ? parseFloat(String(lat))
              : undefined,
          longitude:
            lng !== undefined && lng !== ""
              ? parseFloat(String(lng))
              : undefined,
          province: String(row.province || row["Provinsi"] || "Jambi"),
          regency: String(
            row.regency || row["Kabupaten/Kota"] || row["Kabupaten"] || "",
          ),
          district:
            row.district || row["Kecamatan"]
              ? String(row.district || row["Kecamatan"])
              : undefined,
          village:
            row.village || row["Kelurahan/Desa"]
              ? String(row.village || row["Kelurahan/Desa"])
              : undefined,
          address:
            row.address || row["Alamat"]
              ? String(row.address || row["Alamat"])
              : undefined,
        };
      });

      const response = await bulkCreateUnits(unitsToImport);

      if (response.success && response.data) {
        setResult(response.data);
        toast({
          title: "Import Selesai",
          description: `Berhasil mengimpor ${response.data.created} unit.`,
          variant: "success",
        });
      } else {
        throw new Error(response.error || "Gagal mengimpor unit");
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Terjadi kesalahan saat memproses file.";
      toast({
        title: "Gagal Import",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] max-h-[90vh] overflow-y-auto rounded-[2rem] p-5 sm:p-8 border-none shadow-2xl flex flex-col custom-scrollbar">
        <DialogHeader className="space-y-3 sm:space-y-4 shrink-0">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] sm:rounded-[1.5rem] bg-primary/5 flex items-center justify-center text-primary mb-1 sm:mb-2 transition-all">
            <Upload className="h-6 w-6 sm:h-8 sm:h-8" />
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
            Import Unit PJUTS
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium text-sm sm:text-base leading-relaxed">
            Gunakan file Excel (.xlsx atau .xls) untuk menambahkan unit dalam
            jumlah banyak sekaligus. Kolom koordinat (Lat/Lng) dapat dikosongkan
            jika belum tersedia.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 sm:space-y-6 py-2 sm:py-4 flex-1">
          {!result ? (
            <div className="space-y-5 sm:space-y-6">
              <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-6 border border-slate-100 flex flex-col items-center gap-3 sm:gap-4 text-center group active:scale-[0.98] transition-all">
                <div className="space-y-1.5">
                  <p className="text-sm font-bold text-slate-700">
                    Belum punya template?
                  </p>
                  <p className="text-[11px] sm:text-xs text-slate-500 font-medium leading-relaxed max-w-[200px] sm:max-w-none">
                    Download template Excel dengan format yang benar di sini.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={downloadTemplate}
                  className="bg-white border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 h-10 px-6 transition-all shadow-sm"
                >
                  <Download className="h-4 w-4 mr-2 text-primary" />
                  Download Template
                </Button>
              </div>

              <div className="relative group/upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx, .xls"
                  className="hidden"
                  disabled={isUploading}
                />
                <Button
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "w-full h-32 sm:h-40 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 active:scale-[0.98]",
                    isUploading
                      ? "bg-slate-50 border-slate-200 cursor-not-allowed"
                      : "bg-primary/5 border-primary/20 hover:border-primary/40 hover:bg-primary/10 cursor-pointer",
                  )}
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                      <span className="text-sm font-black text-primary/80 uppercase tracking-widest">
                        Memproses...
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-transform duration-300">
                        <Upload className="h-5 w-5 sm:h-6 sm:h-6 text-primary" />
                      </div>
                      <div className="text-center px-4">
                        <span className="block text-sm font-black text-slate-900 uppercase tracking-widest leading-none">
                          Pilih File Excel
                        </span>
                        <span className="block text-[10px] font-bold text-slate-400 mt-2 tracking-wider">
                          DRAG & DROP ATAU KLIK
                        </span>
                      </div>
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 transition-all hover:bg-primary/10">
                  <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-black text-primary leading-none mb-1 shadow-primary/10">
                      Berhasil
                    </p>
                    <p className="text-xs font-bold text-primary/80">
                      {result.created} unit ditambahkan.
                    </p>
                  </div>
                </div>

                {result.skipped > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-100 transition-all hover:bg-amber-100/50">
                    <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-sm font-black text-amber-900 leading-none mb-1">
                        Dilewati
                      </p>
                      <p className="text-xs font-bold text-amber-700">
                        {result.skipped} unit diduplikasi/invalid.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {result.errors.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Detail Kesalahan:
                  </p>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {result.errors.map((err, i) => (
                      <div
                        key={i}
                        className="p-3 bg-red-50/50 rounded-xl border border-red-100"
                      >
                        <p className="text-[10px] font-black text-red-700">
                          {err.serialNumber || "Tanpa SN"}: {err.error}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  setResult(null);
                  onOpenChange(false);
                }}
                className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200"
              >
                Selesai
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
