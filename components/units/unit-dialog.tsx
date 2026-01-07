"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { createPjutsUnitSchema } from "@/lib/validations";
import { createPjutsUnit, updatePjutsUnit, PjutsUnitData } from "@/app/actions/units";
import { UnitStatus } from "@prisma/client";

// Extended schema for the form (including optional fields for UI handling if needed)
// We'll use the create schema as base.
const formSchema = createPjutsUnitSchema.extend({
  lastStatus: z.nativeEnum(UnitStatus).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface UnitDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unit?: PjutsUnitData; // If present, we are in Edit mode
}

export function UnitDialog({ open, onOpenChange, unit }: UnitDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serialNumber: "",
      latitude: 0,
      longitude: 0,
      province: "",
      regency: "",
      district: "",
      village: "",
      address: "",
      lastStatus: "UNVERIFIED",
    },
  });

  // Reset form when unit changes
  useEffect(() => {
    if (unit) {
      form.reset({
        serialNumber: unit.serialNumber,
        latitude: unit.latitude,
        longitude: unit.longitude,
        province: unit.province,
        regency: unit.regency,
        district: unit.district || "",
        village: unit.village || "",
        address: unit.address || "",
        lastStatus: unit.lastStatus,
      });
    } else {
      form.reset({
        serialNumber: "",
        latitude: 0,
        longitude: 0,
        province: "",
        regency: "",
        district: "",
        village: "",
        address: "",
        lastStatus: "UNVERIFIED",
      });
    }
  }, [unit, form, open]);

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      if (unit) {
        // Update mode
        // Filter out serialNumber as it's not updatable
        const { serialNumber, ...updateData } = values;
        
        // Ensure optional strings are undefined if empty strings, if backend expects that
        // But our schema says optional strings. updatePjutsUnit takes string | undefined.
        // We'll pass them as is, empty string is valid if we want to clear it?
        // Actually updatePjutsUnit type definition:
        // district?: string;
        // village?: string;
        
        const result = await updatePjutsUnit(unit.id, updateData);

        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Unit berhasil diperbarui",
            variant: "default",
          });
          onOpenChange(false);
        } else {
          toast({
            title: "Gagal",
            description: result.error || "Gagal memperbarui unit",
            variant: "destructive",
          });
        }
      } else {
        // Create mode
        const result = await createPjutsUnit(values);

        if (result.success) {
          toast({
            title: "Berhasil",
            description: "Unit berhasil ditambahkan",
            variant: "default",
          });
          onOpenChange(false);
        } else {
          toast({
            title: "Gagal",
            description: result.error || "Gagal menambahkan unit",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan sistem",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isEdit = !!unit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Unit PJUTS" : "Tambah Unit PJUTS"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Perbarui informasi unit PJUTS di sini."
              : "Masukkan informasi untuk unit PJUTS baru."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serialNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serial Number</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="PJUTS-XXX-000" 
                        {...field} 
                        disabled={isEdit || isSubmitting} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {isEdit && (
                <FormField
                  control={form.control}
                  name="lastStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="OPERATIONAL">Operasional</SelectItem>
                          <SelectItem value="MAINTENANCE_NEEDED">Perlu Perawatan</SelectItem>
                          <SelectItem value="OFFLINE">Offline</SelectItem>
                          <SelectItem value="UNVERIFIED">Belum Verifikasi</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="latitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any" 
                        placeholder="-6.2088" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="longitude"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="any" 
                        placeholder="106.8456" 
                        {...field}
                        onChange={e => field.onChange(parseFloat(e.target.value))}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provinsi</FormLabel>
                    <FormControl>
                      <Input placeholder="Jawa Barat" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="regency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kabupaten/Kota</FormLabel>
                    <FormControl>
                      <Input placeholder="Bandung" {...field} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kecamatan</FormLabel>
                    <FormControl>
                      <Input placeholder="Cicendo" {...field} value={field.value || ""} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="village"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Desa/Kelurahan</FormLabel>
                    <FormControl>
                      <Input placeholder="Arjuna" {...field} value={field.value || ""} disabled={isSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Alamat Lengkap</FormLabel>
                  <FormControl>
                    <Input placeholder="Jl. Raya No. 123" {...field} value={field.value || ""} disabled={isSubmitting} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Menyimpan..." : (isEdit ? "Simpan Perubahan" : "Tambah Unit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

