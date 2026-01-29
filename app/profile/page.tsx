"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  UserCircle,
  Mail,
  ShieldCheck,
  User,
  Calendar,
  Pencil,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const user = session?.user;

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          email: formData.get("email"),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Profil berhasil diperbarui",
        });
        await update();
        setIsEditing(false);
        router.refresh();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.error || "Gagal memperbarui profil",
        });
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

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.currentTarget);
    
    const newPassword = formData.get("newPassword") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Password baru tidak cocok",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: formData.get("currentPassword"),
          newPassword: newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Password berhasil diubah",
        });
        setIsChangingPassword(false);
        (e.target as HTMLFormElement).reset();
      } else {
        toast({
          variant: "destructive",
          title: "Gagal",
          description: result.error || "Gagal mengubah password",
        });
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

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <UserCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Memuat data profil...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8 animate-fade-in max-w-4xl mx-auto pt-4 sm:pt-6 lg:pt-8 pb-24 sm:pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Dashboard
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <h3 className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.3em]">Pengaturan Akun</h3>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">Profil Saya</h2>
          <p className="text-muted-foreground text-xs sm:text-sm font-medium mt-1">Kelola informasi akun dan keamanan Anda.</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="p-4 sm:p-6 lg:p-8 border-border/50">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Avatar */}
          <div className="relative mx-auto sm:mx-0">
            <div className={cn(
              "w-20 h-20 sm:w-24 sm:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center shadow-lg",
              "bg-gradient-to-br from-primary/20 to-primary/5 text-primary"
            )}>
              <span className="text-3xl sm:text-4xl font-black">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            {isAdmin && (
              <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 sm:border-4 border-card shadow-lg">
                <ShieldCheck className="w-3 h-3 sm:w-4 sm:h-4" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <Badge 
                    className={cn(
                      "text-[10px] sm:text-xs font-bold",
                      isAdmin ? "bg-amber-500/10 text-amber-600" : "bg-primary/10 text-primary"
                    )}
                  >
                    {isAdmin ? <ShieldCheck className="w-3 h-3 mr-1" /> : <User className="w-3 h-3 mr-1" />}
                    {isAdmin ? "Administrator" : "Petugas Lapangan"}
                  </Badge>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="rounded-xl font-bold text-xs h-9 px-4 mx-auto sm:mx-0"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edit Profil
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card className="p-4 sm:p-6 border-border/50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-2 mb-4 sm:mb-6">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">Edit Informasi Profil</h3>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="name" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ""}
                    required
                    minLength={3}
                    className="h-10 sm:h-12 pl-10 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 font-medium text-sm"
                    placeholder="Nama lengkap Anda"
                  />
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ""}
                    required
                    className="h-10 sm:h-12 pl-10 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 font-medium text-sm"
                    placeholder="email@domain.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="rounded-lg sm:rounded-xl font-bold h-10"
              >
                <X className="w-4 h-4 mr-1.5" />
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-lg sm:rounded-xl font-bold h-10 px-6"
              >
                <Save className="w-4 h-4 mr-1.5" />
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Security Section */}
      <Card className="p-4 sm:p-6 border-border/50">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center gap-2">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <h3 className="text-sm sm:text-base font-bold text-foreground">Keamanan Akun</h3>
          </div>
          {!isChangingPassword && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(true)}
              className="rounded-xl font-bold text-xs h-9 px-4"
            >
              <Lock className="w-3.5 h-3.5 mr-1.5" />
              Ubah Password
            </Button>
          )}
        </div>

        {isChangingPassword ? (
          <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="currentPassword" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                Password Saat Ini
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  required
                  className="h-10 sm:h-12 pl-10 pr-10 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 font-medium text-sm"
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="newPassword" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Password Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="h-10 sm:h-12 pl-10 pr-10 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 font-medium text-sm"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="h-10 sm:h-12 pl-10 pr-10 rounded-lg sm:rounded-xl bg-muted/50 border-border/50 font-medium text-sm"
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsChangingPassword(false)}
                className="rounded-lg sm:rounded-xl font-bold h-10"
              >
                <X className="w-4 h-4 mr-1.5" />
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-lg sm:rounded-xl font-bold h-10 px-6"
              >
                <Lock className="w-4 h-4 mr-1.5" />
                {isLoading ? "Memproses..." : "Ubah Password"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl sm:rounded-2xl">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Lock className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Password</p>
              <p className="text-xs text-muted-foreground">Terakhir diubah: Tidak diketahui</p>
            </div>
          </div>
        )}
      </Card>

      {/* Account Info */}
      <Card className="p-4 sm:p-6 border-border/50">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
          <h3 className="text-sm sm:text-base font-bold text-foreground">Informasi Akun</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Tanggal Bergabung</p>
              <p className="text-xs sm:text-sm font-bold text-foreground">-</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 sm:p-4 bg-muted/30 rounded-xl">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <UserCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase">Status Akun</p>
              <p className="text-xs sm:text-sm font-bold text-emerald-600">Aktif</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
