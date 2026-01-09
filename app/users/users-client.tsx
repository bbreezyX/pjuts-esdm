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
  DropdownMenuSeparator,
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
  Shield,
  User,
  UserX,
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

interface UsersClientProps {
  users: UserData[];
}

export function UsersClient({ users }: UsersClientProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDisableUser, setConfirmDisableUser] = useState<UserData | null>(null);
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
    } catch (error) {
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
        toast({
          title: "Berhasil",
          description: "Pengguna berhasil dihapus",
        });
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.error || "Gagal menghapus pengguna",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Terjadi kesalahan sistem",
      });
    }
  };

  const handleToggleStatus = async (user: UserData) => {
    // If enabling, just do it. If disabling, show confirmation first
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
    } catch (error) {
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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Manajemen Pengguna
        </h2>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) setEditingUser(null);
          }}
        >
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Pengguna
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[425px] bg-white text-slate-900 border-slate-200 shadow-xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight">
                {editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5 py-2">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-slate-700"
                >
                  Nama Lengkap
                </Label>
                <Input
                  id="name"
                  name="name"
                  defaultValue={editingUser?.name}
                  required
                  minLength={3}
                  className="bg-white text-slate-900 border-slate-300 focus:border-primary-500 focus-visible:ring-0 focus:ring-0 placeholder:text-slate-400 outline-none"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-slate-700"
                >
                  Alamat Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  defaultValue={editingUser?.email}
                  required
                  className="bg-white text-slate-900 border-slate-300 focus:border-primary-500 focus-visible:ring-0 focus:ring-0 placeholder:text-slate-400 outline-none"
                  placeholder="nama@esdm.go.id"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-700"
                >
                  {editingUser ? "Password Baru" : "Password"}
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required={!editingUser}
                  minLength={6}
                  className="bg-white text-slate-900 border-slate-300 focus:border-primary-500 focus-visible:ring-0 focus:ring-0 placeholder:text-slate-400 outline-none"
                  placeholder={
                    editingUser
                      ? "Kosongkan jika tidak ingin mengubah"
                      : "Minimal 6 karakter"
                  }
                />
                {editingUser ? (
                  <p className="text-[11px] text-slate-500 font-medium">
                    *Biarkan kosong jika password tidak ingin diubah
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-500 font-medium">
                    *Pastikan menggunakan password yang kuat dan aman
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="role"
                  className="text-sm font-medium text-slate-700"
                >
                  Peran (Role)
                </Label>
                <Select
                  name="role"
                  defaultValue={editingUser?.role || "FIELD_STAFF"}
                >
                  <SelectTrigger className="bg-white text-slate-900 border-slate-300 focus:border-primary-500 focus:ring-0 outline-none">
                    <SelectValue placeholder="Pilih role pengguna" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-200">
                    <SelectItem
                      value="FIELD_STAFF"
                      className="text-slate-900 focus:bg-slate-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-500" />
                        <span>Petugas Lapangan</span>
                      </div>
                    </SelectItem>
                    <SelectItem
                      value="ADMIN"
                      className="text-slate-900 focus:bg-slate-100 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-500" />
                        <span>Administrator</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-primary-600 hover:bg-primary-700 text-white shadow-sm"
                >
                  {isLoading
                    ? "Menyimpan..."
                    : editingUser
                    ? "Simpan Perubahan"
                    : "Tambah Pengguna"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Nama</th>
                <th>Email</th>
                <th className="text-center">Role</th>
                <th className="text-center">Status</th>
                <th>Terdaftar</th>
                <th className="text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        !user.isActive ? "bg-slate-200" : "bg-slate-100"
                      }`}>
                        <span className={`text-xs font-semibold ${
                          !user.isActive ? "text-slate-400" : "text-slate-600"
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex flex-col">
                        <span className={`font-medium ${
                          !user.isActive ? "text-slate-500" : "text-slate-900"
                        }`}>
                          {user.name}
                        </span>
                        {!user.isActive && (
                          <span className="text-xs text-red-500 font-medium">
                            Dinonaktifkan
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className={!user.isActive ? "text-slate-400" : "text-slate-600"}>
                    {user.email}
                  </td>
                  <td className="text-center">
                    <Badge
                      variant={user.role === "ADMIN" ? "default" : "secondary"}
                      className={!user.isActive ? "opacity-50" : ""}
                    >
                      <div className="flex items-center gap-1">
                        {user.role === "ADMIN" ? (
                          <Shield className="w-3 h-3" />
                        ) : (
                          <User className="w-3 h-3" />
                        )}
                        {user.role === "ADMIN" ? "Admin" : "Petugas"}
                      </div>
                    </Badge>
                  </td>
                  <td className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Switch
                        checked={user.isActive}
                        onCheckedChange={() => handleToggleStatus(user)}
                        disabled={togglingUserId === user.id}
                        className="data-[state=checked]:bg-emerald-500"
                      />
                      <Badge
                        variant={user.isActive ? "default" : "destructive"}
                        className={`text-[10px] px-1.5 py-0 ${
                          user.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                            : "bg-red-100 text-red-700 hover:bg-red-100"
                        }`}
                      >
                        {user.isActive ? "Aktif" : "Nonaktif"}
                      </Badge>
                    </div>
                  </td>
                  <td className={!user.isActive ? "text-slate-400" : "text-slate-600"}>
                    {new Date(user.createdAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon-sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => {
                            setEditingUser(user);
                            setIsDialogOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleToggleStatus(user)}
                          disabled={togglingUserId === user.id}
                        >
                          {user.isActive ? (
                            <>
                              <UserX className="mr-2 h-4 w-4 text-orange-500" />
                              <span className="text-orange-600">Nonaktifkan</span>
                            </>
                          ) : (
                            <>
                              <UserCheck className="mr-2 h-4 w-4 text-emerald-500" />
                              <span className="text-emerald-600">Aktifkan</span>
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Confirmation Dialog for Disabling User */}
      <Dialog open={!!confirmDisableUser} onOpenChange={() => setConfirmDisableUser(null)}>
        <DialogContent className="w-[95vw] max-w-[425px] bg-white text-slate-900 border-slate-200 shadow-xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Nonaktifkan Pengguna?
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Pengguna yang dinonaktifkan tidak akan dapat masuk ke sistem.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                Anda akan menonaktifkan akun:
              </p>
              <p className="font-semibold text-amber-900 mt-1">
                {confirmDisableUser?.name} ({confirmDisableUser?.email})
              </p>
              <p className="text-xs text-amber-700 mt-2">
                Pengguna akan menerima notifikasi email tentang perubahan status akun mereka.
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDisableUser(null)}
              className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={() => confirmDisableUser && performToggle(confirmDisableUser.id)}
              disabled={togglingUserId !== null}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {togglingUserId ? "Memproses..." : "Ya, Nonaktifkan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
