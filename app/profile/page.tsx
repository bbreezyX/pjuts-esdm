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
    <div className="space-y-6 sm:space-y-8 animate-fade-in max-w-4xl mx-auto pt-4 sm:pt-6 lg:pt-8 pb-32 sm:pb-12 px-4 sm:px-0">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Link 
          href="/dashboard" 
          className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-all w-fit group"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
            <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
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
      <Card className="p-5 sm:p-8 border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className={cn(
              "w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-center shadow-2xl relative z-10",
              "bg-gradient-to-br from-primary to-primary-600 text-white"
            )}>
              <span className="text-4xl sm:text-5xl font-black">{user.name?.charAt(0).toUpperCase()}</span>
            </div>
            {isAdmin && (
              <div className="absolute -top-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center border-4 border-card shadow-xl z-20">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">{user.name}</h3>
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                  <Badge 
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider",
                      isAdmin ? "bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20" : "bg-primary/5 text-primary ring-1 ring-primary/20"
                    )}
                  >
                    {isAdmin ? <ShieldCheck className="w-3 h-3 mr-1.5" /> : <User className="w-3 h-3 mr-1.5" />}
                    {isAdmin ? "Administrator" : "Petugas Lapangan"}
                  </Badge>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setIsEditing(true)}
                  className="rounded-2xl font-bold text-sm h-12 px-6 w-full sm:w-auto shadow-sm hover:shadow-md transition-all border-border/50"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit Profil
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card className="p-5 sm:p-8 border-border/50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">Edit Informasi Profil</h3>
          </div>
          <form onSubmit={handleUpdateProfile} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Nama Lengkap
                </Label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="name"
                    name="name"
                    defaultValue={user.name || ""}
                    required
                    minLength={3}
                    className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-2xl bg-muted/50 border-border/50 font-bold text-sm focus:ring-primary/10"
                    placeholder="Nama lengkap Anda"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Alamat Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    defaultValue={user.email || ""}
                    required
                    className="h-12 sm:h-14 pl-12 rounded-xl sm:rounded-2xl bg-muted/50 border-border/50 font-bold text-sm focus:ring-primary/10"
                    placeholder="email@domain.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditing(false)}
                className="rounded-xl sm:rounded-2xl font-bold h-12 px-8"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="rounded-xl sm:rounded-2xl font-bold h-12 px-10 shadow-lg shadow-primary/20"
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Security Section */}
        <Card className="p-5 sm:p-8 border-border/50">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-2">
              <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
              <h3 className="text-base sm:text-lg font-bold text-foreground">Keamanan</h3>
            </div>
            {!isChangingPassword && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChangingPassword(true)}
                className="rounded-xl font-bold text-xs h-9 px-4 border-border/50"
              >
                Ubah Password
              </Button>
            )}
          </div>

          {isChangingPassword ? (
            <form onSubmit={handleChangePassword} className="space-y-4 sm:space-y-6 animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Password Saat Ini
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    required
                    className="h-12 pl-12 pr-12 rounded-xl bg-muted/50 border-border/50 font-bold text-sm"
                    placeholder="Password saat ini"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Password Baru
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="h-12 pl-12 pr-12 rounded-xl bg-muted/50 border-border/50 font-bold text-sm"
                    placeholder="Minimal 6 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[10px] sm:text-[11px] font-black text-muted-foreground uppercase tracking-wider ml-1">
                  Konfirmasi Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    minLength={6}
                    className="h-12 pl-12 pr-12 rounded-xl bg-muted/50 border-border/50 font-bold text-sm"
                    placeholder="Ulangi password baru"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsChangingPassword(false)}
                  className="rounded-xl font-bold h-12"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20"
                >
                  {isLoading ? "Memproses..." : "Ubah Password"}
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center gap-5 p-5 bg-muted/30 rounded-2xl border border-border/50">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shadow-inner">
                <Lock className="w-7 h-7 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Password & Keamanan</p>
                <p className="text-xs text-muted-foreground mt-0.5">Terakhir diperbarui: Baru saja</p>
              </div>
            </div>
          )}
        </Card>

        {/* Account Info */}
        <Card className="p-5 sm:p-8 border-border/50 flex flex-col">
          <div className="flex items-center gap-2 mb-6 sm:mb-8">
            <div className="w-1 sm:w-1.5 h-3 sm:h-4 bg-primary rounded-full" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">Status Akun</h3>
          </div>
          <div className="grid grid-cols-1 gap-4 flex-1">
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Tanggal Bergabung</p>
                <p className="text-sm font-bold text-foreground">Januari 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-2xl border border-border/50">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Aksesibilitas</p>
                <p className="text-sm font-bold text-emerald-600">Akun Aktif & Terverifikasi</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
