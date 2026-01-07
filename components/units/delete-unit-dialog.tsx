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
    } catch (error) {
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-red-600">Hapus Unit PJUTS</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus unit ini? Tindakan ini tidak dapat dibatalkan.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
            <p className="font-medium text-slate-900">{unit.serialNumber}</p>
            <p className="text-sm text-slate-500">
              {unit.province}, {unit.regency}
            </p>
            {unit._count.reports > 0 && (
              <p className="text-xs text-red-500 mt-2 font-medium">
                Peringatan: {unit._count.reports} laporan terkait juga akan dihapus.
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Menghapus..." : "Hapus Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

