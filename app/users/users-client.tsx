"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  ShieldCheck,
  User,
  UserMinus,
  UserCheck,
  AlertTriangle,
} from "lucide-react";
import {
  UserData,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
} from "@/app/actions/users";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

interface UsersClientProps {
  users: UserData[];
}

export function UsersClient({ users }: UsersClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDisableUser, setConfirmDisableUser] = useState<UserData | null>(
    null,
  );
  const [togglingUserId, setTogglingUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      let result;
      if (editingUser) {
        result = await updateUser(editingUser.id, formData);
      } else {
        result = await createUser(formData);
      }
      if (result.success) {
        toast({
          title: "Berhasil",
          description: editingUser
            ? "Data pengguna berhasil diperbarui"
            : "Pengguna baru berhasil ditambahkan",
        });
        setIsDialogOpen(false);
        setEditingUser(null);
        router.refresh();
      } else {
        if (result.errors) {
          toast({
            variant: "destructive",
            title: "Gagal Validasi",
            description: (
              <div className="mt-2 text-sm">
                <p className="mb-2 font-medium">
                  Mohon perbaiki kesalahan berikut:
                </p>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  {Object.entries(result.errors).map(([field, messages]) => (
                    <li key={field}>
                      <span className="capitalize font-semibold">{field}:</span>{" "}
                      {messages[0]}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          });
        } else {
          toast({
            variant: "destructive",
            title: "Gagal",
            description: result.error || "Terjadi kesalahan",
          });
        }
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan sistem",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pengguna ini?")) return;
    try {
      const result = await deleteUser(userId);
      if (result.success) {
        toast({ title: "Berhasil", description: "Pengguna berhasil dihapus" });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.error || "Gagal menghapus pengguna",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan sistem",
      });
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    if (user.isActive) {
      setConfirmDisableUser(user);
      return;
    }
    await performToggle(user.id);
  };

  const performToggle = async (userId: string) => {
    setTogglingUserId(userId);
    setConfirmDisableUser(null);
    try {
      const result = await toggleUserStatus(userId);
      if (result.success) {
        toast({
          title: "Berhasil",
          description: result.data?.isActive
            ? "Pengguna berhasil diaktifkan"
            : "Pengguna berhasil dinonaktifkan",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.error || "Gagal mengubah status pengguna",
        });
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan sistem",
      });
    } finally {
      setTogglingUserId(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <h3 className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.3em]">
              Administrasi Sistem
            </h3>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
            Manajemen Pengguna
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">
            Kelola hak akses dan akun personil operasional PJUTS.
          </p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingUser(null);
          }}
        >
          <DialogTrigger asChild>
            <Button
              size="lg"
              className="bg-foreground text-background hover:opacity-90 rounded-xl sm:rounded-2xl px-4 sm:px-8 h-10 sm:h-12 font-bold transition-all shadow-lg shadow-foreground/5 hover:scale-105 active:scale-95 text-xs sm:text-sm w-fit sm:w-auto"
            >
              <Plus className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[450px] bg-card/95 backdrop-blur-xl border-border shadow-2xl rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8">
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
                {editingUser ? "Edit Profil" : "Pengguna Baru"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground font-medium text-xs sm:text-sm">
                {editingUser
                  ? "Perbarui informasi akun dan hak akses pengguna."
                  : "Daftarkan personil baru ke dalam sistem monitoring."}
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-6 mt-3 sm:mt-4"
            >
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="name"
                  className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1"
                >
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingUser?.name}
                  required
                  minLength={3}
                  className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 focus:border-primary/30 focus:ring-primary/10 font-medium text-sm"
                  placeholder="Nama lengkap personil"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="email"
                  className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1"
                >
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email}
                  required
                  className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 focus:border-primary/30 focus:ring-primary/10 font-medium text-sm"
                  placeholder="personil@esdm.go.id"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="password"
                  className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1"
                >
                  {editingUser ? "Password Baru" : "Password"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!editingUser}
                  minLength={6}
                  className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 focus:border-primary/30 focus:ring-primary/10 font-medium text-sm"
                  placeholder={
                    editingUser
                      ? "Biarkan kosong jika tidak berubah"
                      : "Minimal 6 karakter unik"
                  }
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label
                  htmlFor="role"
                  className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1"
                >
                  Hak Akses (Role)
                </Label>
                <Select
                  name="role"
                  defaultValue={editingUser?.role || "FIELD_STAFF"}
                >
                  <SelectTrigger className="h-10 sm:h-12 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 focus:border-primary/30 font-bold text-sm">
                    <SelectValue placeholder="Pilih hak akses" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-border shadow-2xl">
                    <SelectItem
                      value="FIELD_STAFF"
                      className="font-bold py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/5 flex items-center justify-center">
                          <User className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">Petugas Lapangan</span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            Akses operasional & laporan
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="ADMIN"
                      className="font-bold py-3 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">Administrator</span>
                          <span className="text-[10px] text-muted-foreground font-medium">
                            Kendali penuh sistem
                          </span>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-lg sm:rounded-xl font-bold h-10 sm:h-auto"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-lg sm:rounded-xl font-bold px-6 sm:px-8 shadow-lg shadow-primary/20 h-10 sm:h-auto text-sm"
                >
                  {isLoading
                    ? "Memproses..."
                    : editingUser
                      ? "Simpan Perubahan"
                      : "Daftarkan"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-3">
        {users.length === 0 ? (
          <Card className="p-6 text-center text-slate-500 text-sm">
            Tidak ada pengguna ditemukan
          </Card>
        ) : (
          users.map((user, index) => (
            <Card
              key={user.id}
              className={cn(
                "p-3 sm:p-4 animate-fade-in border-border/50",
                !user.isActive && "opacity-60 grayscale-[0.5]",
              )}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0",
                    user.isActive
                      ? "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <span className="text-sm sm:text-base font-black">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-foreground truncate">
                        {user.name}
                      </p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                      className={cn(
                        "shrink-0 text-[9px] sm:text-[10px] h-5 sm:h-6 rounded-lg px-2",
                        user.role === "ADMIN"
                          ? "bg-amber-500/10 text-amber-600"
                          : "bg-primary/5 text-primary",
                      )}
                    >
                      {user.role === "ADMIN" ? (
                        <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      ) : (
                        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
                      )}
                      {user.role === "ADMIN" ? "Admin" : "Petugas"}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <div className="flex items-center gap-1.5">
                      {user.isActive ? (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase">
                            Aktif
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                          <span className="text-[9px] sm:text-[10px] font-bold text-red-500 uppercase">
                            Nonaktif
                          </span>
                        </>
                      )}
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-[9px] sm:text-[10px] text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-[10px] sm:text-xs font-bold flex-1"
                      onClick={() => {
                        setEditingUser(user);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 px-3 rounded-lg text-[10px] sm:text-xs font-bold flex-1",
                        user.isActive ? "text-orange-600" : "text-emerald-600",
                      )}
                      onClick={() => handleToggleStatus(user)}
                      disabled={togglingUserId === user.id}
                    >
                      {user.isActive ? (
                        <>
                          <UserMinus className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />{" "}
                          Nonaktifkan
                        </>
                      ) : (
                        <>
                          <UserCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />{" "}
                          Aktifkan
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(user.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto pb-4">
        <table className="w-full text-left border-separate border-spacing-y-4">
          <thead>
            <tr className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <th className="px-8 py-4">Informasi Pengguna</th>
              <th className="px-8 py-4">Kontak Email</th>
              <th className="px-8 py-4 text-center">Hak Akses</th>
              <th className="px-8 py-4 text-center">Status Akun</th>
              <th className="px-8 py-4">Tanggal Gabung</th>
              <th className="px-8 py-4 text-center">Opsi</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, index) => (
              <tr
                key={user.id}
                className={cn(
                  "group animate-in fade-in slide-in-from-bottom-2 duration-500",
                  !user.isActive && "opacity-60 grayscale-[0.5]",
                )}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <td className="px-8 py-6 bg-card group-hover:bg-muted/30 rounded-l-[2.5rem] border-y border-l border-border/50 transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110",
                        user.isActive
                          ? "bg-gradient-to-br from-primary/10 to-primary/5 text-primary"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <span className="text-lg font-black">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-black text-foreground tracking-tight leading-none mb-1.5">
                        {user.name}
                      </p>
                      <div className="flex items-center gap-2">
                        {user.isActive ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                              Aktif Sekarang
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest">
                              Nonaktif
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                  <span className="text-sm font-bold text-foreground/80 tracking-tight">
                    {user.email}
                  </span>
                </td>
                <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300 text-center">
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-[10px] font-black border-none shadow-sm uppercase tracking-wider",
                      user.role === "ADMIN"
                        ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20"
                        : "bg-primary/5 text-primary ring-1 ring-primary/20",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {user.role === "ADMIN" ? (
                        <ShieldCheck className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                      {user.role === "ADMIN" ? "Administrator" : "Petugas"}
                    </div>
                  </Badge>
                </td>
                <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300 text-center">
                  <div className="flex items-center justify-center gap-4">
                    <Switch
                      checked={user.isActive}
                      onCheckedChange={() => handleToggleStatus(user)}
                      disabled={togglingUserId === user.id}
                      className="data-[state=checked]:bg-emerald-500 shadow-sm"
                    />
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest w-16 text-left",
                        user.isActive
                          ? "text-emerald-600"
                          : "text-muted-foreground",
                      )}
                    >
                      {user.isActive ? "Aktif" : "Mati"}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 bg-card group-hover:bg-muted/30 border-y border-border/50 transition-all duration-300">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-foreground tracking-tight">
                      {new Date(user.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                      Registrasi Sistem
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 bg-card group-hover:bg-muted/30 rounded-r-[2.5rem] border-y border-r border-border/50 transition-all duration-300 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 rounded-2xl bg-muted/30 hover:bg-card transition-all"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="rounded-[1.5rem] border-border shadow-2xl p-2 min-w-[200px] backdrop-blur-xl"
                    >
                      <DropdownMenuLabel className="px-4 py-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Opsi Pengguna
                      </DropdownMenuLabel>
                      <DropdownMenuItem
                        className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer"
                        onClick={() => {
                          setEditingUser(user);
                          setIsDialogOpen(true);
                        }}
                      >
                        <Pencil className="mr-3 h-4 w-4 text-primary" /> Edit
                        Profil
                      </DropdownMenuItem>
                      <div className="h-px bg-border my-2 mx-1" />
                      <DropdownMenuItem
                        className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer"
                        onClick={() => handleToggleStatus(user)}
                        disabled={togglingUserId === user.id}
                      >
                        {user.isActive ? (
                          <div className="flex items-center text-orange-600">
                            <UserMinus className="mr-3 h-4 w-4" /> Nonaktifkan
                            Akun
                          </div>
                        ) : (
                          <div className="flex items-center text-emerald-600">
                            <UserCheck className="mr-3 h-4 w-4" /> Aktifkan Akun
                          </div>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="rounded-xl py-3 px-4 font-bold text-xs cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="mr-3 h-4 w-4" /> Hapus Permanen
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog
        open={!!confirmDisableUser}
        onOpenChange={() => setConfirmDisableUser(null)}
      >
        <DialogContent className="w-[95vw] max-w-[425px] bg-card/95 backdrop-blur-xl border-border shadow-2xl rounded-2xl sm:rounded-[2rem] p-4 sm:p-8">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-orange-500/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
              </div>
              Nonaktifkan?
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-medium pt-2 text-xs sm:text-sm">
              Pengguna yang dinonaktifkan akan kehilangan akses ke seluruh
              sistem monitoring secara instan.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 sm:py-6">
            <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl sm:rounded-[1.25rem] p-4 sm:p-6">
              <p className="text-[9px] sm:text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">
                Akun Terpilih
              </p>
              <p className="font-bold text-foreground text-base sm:text-lg tracking-tight leading-snug">
                {confirmDisableUser?.name}
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                {confirmDisableUser?.email}
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setConfirmDisableUser(null)}
              className="rounded-lg sm:rounded-xl font-bold flex-1 h-10 sm:h-auto"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() =>
                confirmDisableUser && performToggle(confirmDisableUser.id)
              }
              disabled={togglingUserId !== null}
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-lg sm:rounded-xl font-bold flex-1 shadow-lg shadow-orange-600/20 h-10 sm:h-auto text-sm"
            >
              {togglingUserId ? "Memproses..." : "Ya, Nonaktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
