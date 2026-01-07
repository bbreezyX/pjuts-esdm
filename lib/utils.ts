import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { UnitStatus } from "@prisma/client"
import { format, formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getRelativeTime(date: Date | string | null) {
  if (!date) return "-";
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: id });
}

export function getStatusLabel(status: UnitStatus) {
  switch (status) {
    case "OPERATIONAL":
      return "Operasional";
    case "MAINTENANCE_NEEDED":
      return "Perlu Perawatan";
    case "OFFLINE":
      return "Offline";
    case "UNVERIFIED":
      return "Belum Verifikasi";
    default:
      return status;
  }
}

export function formatDate(date: Date | string | null) {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateTime(date: Date | string | null) {
  if (!date) return "-";
  return format(new Date(date), "d MMM yyyy, HH:mm", { locale: id });
}
