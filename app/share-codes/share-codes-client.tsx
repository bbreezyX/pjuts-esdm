"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Copy,
  Check,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  KeyRound,
  Calendar,
  Eye,
  Clock,
  Shield,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================
// TYPES
// ============================================

interface ShareCode {
  id: string;
  code: string;
  label: string;
  isActive: boolean;
  expiresAt: string | null;
  usageCount: number;
  lastUsedAt: string | null;
  createdBy: string;
  createdAt: string;
}

// ============================================
// SHARE CODES MANAGER
// ============================================

export function ShareCodesManager() {
  const [codes, setCodes] = useState<ShareCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [expiryOption, setExpiryOption] = useState<string>("never");

  const fetchCodes = useCallback(async () => {
    try {
      const res = await fetch("/api/share-codes");
      const json = await res.json();
      if (json.success) {
        setCodes(json.data);
      }
    } catch {
      setError("Gagal memuat data kode akses");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  const handleCreate = async () => {
    if (!newLabel.trim()) return;

    setCreating(true);
    setError(null);

    try {
      let expiresAt: string | null = null;

      if (expiryOption !== "never") {
        const now = new Date();
        switch (expiryOption) {
          case "1d":
            now.setDate(now.getDate() + 1);
            break;
          case "7d":
            now.setDate(now.getDate() + 7);
            break;
          case "30d":
            now.setDate(now.getDate() + 30);
            break;
          case "90d":
            now.setDate(now.getDate() + 90);
            break;
        }
        expiresAt = now.toISOString();
      }

      const res = await fetch("/api/share-codes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel, expiresAt }),
      });

      const json = await res.json();

      if (json.success) {
        await fetchCodes();
        setNewLabel("");
        setExpiryOption("never");
        setShowCreateForm(false);
      } else {
        setError(json.error || "Gagal membuat kode akses");
      }
    } catch {
      setError("Terjadi kesalahan jaringan");
    } finally {
      setCreating(false);
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await fetch(`/api/share-codes/${id}`, {
        method: "PATCH",
      });
      const json = await res.json();
      if (json.success) {
        setCodes((prev) =>
          prev.map((c) =>
            c.id === id ? { ...c, isActive: json.data.isActive } : c,
          ),
        );
      }
    } catch {
      setError("Gagal mengubah status kode akses");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kode akses ini?")) return;

    try {
      const res = await fetch(`/api/share-codes/${id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCodes((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      setError("Gagal menghapus kode akses");
    }
  };

  const handleCopy = async (code: string, id: string) => {
    const shareUrl = `${window.location.origin}/share/map`;
    const text = `Peta PJUTS ESDM\nLink: ${shareUrl}\nKode Akses: ${code}`;

    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Kode Akses Peta
            </h1>
            <p className="text-sm text-slate-500">
              Kelola kode akses untuk peta publik PJUTS
            </p>
          </div>
        </div>

        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="rounded-xl gap-2"
        >
          <Plus className="w-4 h-4" />
          Buat Kode Baru
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-6 p-6 border-primary/20 bg-blue-50/30 animate-in fade-in slide-in-from-top-2 duration-300">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-primary" />
            Buat Kode Akses Baru
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Label / Deskripsi <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder='contoh: "Untuk Kontraktor PT ABC"'
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">
                Masa Berlaku
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "1d", label: "1 Hari" },
                  { value: "7d", label: "7 Hari" },
                  { value: "30d", label: "30 Hari" },
                  { value: "90d", label: "90 Hari" },
                  { value: "never", label: "Permanen" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExpiryOption(opt.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                      expiryOption === opt.value
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-slate-600 border-slate-200 hover:border-primary/50",
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCreateForm(false)}
              >
                Batal
              </Button>
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={creating || !newLabel.trim()}
                className="rounded-xl gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Membuat...
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Buat Kode
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Share link info */}
      <Card className="mb-6 p-4 bg-slate-50 border-slate-200">
        <div className="flex items-center gap-3">
          <ExternalLink className="w-5 h-5 text-slate-400 shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-slate-500 mb-0.5">
              Link Peta Publik
            </p>
            <p className="text-sm font-mono font-bold text-slate-800 truncate">
              {typeof window !== "undefined"
                ? `${window.location.origin}/share/map`
                : "/share/map"}
            </p>
          </div>
        </div>
      </Card>

      {/* Codes List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-4 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="w-24 h-8 bg-slate-200 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : codes.length === 0 ? (
        <Card className="p-12 text-center">
          <KeyRound className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">
            Belum ada kode akses
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Buat kode akses untuk membagikan peta ke pihak luar.
          </p>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="rounded-xl gap-2"
          >
            <Plus className="w-4 h-4" />
            Buat Kode Pertama
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {codes.map((code) => {
            const expired = isExpired(code.expiresAt);
            const active = code.isActive && !expired;

            return (
              <Card
                key={code.id}
                className={cn(
                  "p-4 transition-all hover:shadow-md",
                  !active && "opacity-60",
                )}
              >
                <div className="flex items-start gap-4">
                  {/* Code badge */}
                  <div
                    className={cn(
                      "shrink-0 px-3 py-2 rounded-xl font-mono font-black text-sm tracking-wider",
                      active
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-slate-100 text-slate-400 border border-slate-200",
                    )}
                  >
                    {code.code}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-slate-800 truncate">
                        {code.label}
                      </span>
                      {!code.isActive && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                          NONAKTIF
                        </span>
                      )}
                      {expired && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-600">
                          KEDALUWARSA
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {code.usageCount} kali digunakan
                      </span>
                      {code.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Berlaku s/d {formatDate(code.expiresAt)}
                        </span>
                      )}
                      {!code.expiresAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Permanen
                        </span>
                      )}
                      {code.lastUsedAt && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Terakhir: {formatDate(code.lastUsedAt)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(code.code, code.id)}
                      className="h-8 w-8 p-0 rounded-lg"
                      title="Salin kode & link"
                    >
                      {copiedId === code.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggle(code.id)}
                      className="h-8 w-8 p-0 rounded-lg"
                      title={code.isActive ? "Nonaktifkan" : "Aktifkan"}
                    >
                      {code.isActive ? (
                        <ToggleRight className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-slate-400" />
                      )}
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(code.id)}
                      className="h-8 w-8 p-0 rounded-lg hover:text-red-600 hover:bg-red-50"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
