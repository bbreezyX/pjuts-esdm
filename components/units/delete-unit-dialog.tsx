"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { deletePjutsUnit, PjutsUnitData } from "@/app/actions/units";
import { AlertTriangle } from "lucide-react";

interface DeleteUnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit: PjutsUnitData | null;
}

export function DeleteUnitDialog({ open, onOpenChange, unit }: DeleteUnitDialogProps) {
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!unit) return;

    setIsDeleting(true);
    try {
      const result = await deletePjutsUnit(unit.id);

      if (result.success) {
        toast({
          title: "Berhasil",
          description: "Unit berhasil dihapus",
          variant: "default",
        });
        onOpenChange(false);
      } else {
        toast({
          title: "Gagal",
          description: result.error || "Gagal menghapus unit",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Terjadi kesalahan sistem",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!unit) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[425px] rounded-2xl sm:rounded-lg p-4 sm:p-6 gap-6">
        <DialogHeader>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="space-y-1">
              <DialogTitle className="text-red-600 text-lg sm:text-xl">Hapus Unit PJUTS</DialogTitle>
              <DialogDescription className="text-sm sm:text-base">
                Apakah Anda yakin ingin menghapus unit ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-2">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center sm:text-left shadow-sm">
            <p className="font-semibold text-slate-900 text-base">{unit.serialNumber}</p>
            <p className="text-sm text-slate-500 mt-1">
              {unit.province}, {unit.regency}
            </p>
            {unit._count.reports > 0 && (
              <div className="mt-3 bg-red-50 p-2.5 rounded-lg border border-red-100">
                <p className="text-xs text-red-600 font-medium flex items-center justify-center sm:justify-start gap-1.5">
                  <AlertTriangle className="h-3 w-3" />
                  Peringatan: {unit._count.reports} laporan terkait juga akan dihapus.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2 flex-col-reverse sm:flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
            className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md"
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full sm:w-auto h-11 sm:h-10 text-base sm:text-sm rounded-xl sm:rounded-md shadow-sm"
          >
            {isDeleting ? "Menghapus..." : "Hapus Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
