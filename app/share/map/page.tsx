import { Metadata } from "next";
import { cookies } from "next/headers";
import prisma from "@/lib/db";
import { ShareableMapClient } from "./shareable-map-client";
import { ShareCodeGate } from "./share-code-gate";

export const metadata: Metadata = {
  title: "Peta PJUTS — Monitoring Penerangan Jalan Umum Tenaga Surya",
  description:
    "Peta interaktif PJUTS (Penerangan Jalan Umum Tenaga Surya) yang menampilkan lokasi dan status unit di seluruh wilayah. Data real-time dari sistem monitoring ESDM.",
  openGraph: {
    title: "Peta PJUTS — Monitoring Penerangan Jalan Umum Tenaga Surya",
    description:
      "Peta interaktif yang menampilkan lokasi dan status unit PJUTS secara real-time.",
    type: "website",
  },
};

export default async function ShareableMapPage() {
  // Check if user already has a valid share code cookie
  const cookieStore = await cookies();
  const shareCode = cookieStore.get("pjuts-share-access")?.value;

  let hasAccess = false;

  if (shareCode) {
    try {
      const codeRecord = await prisma.mapShareCode.findUnique({
        where: { code: shareCode.toUpperCase().trim() },
      });

      hasAccess =
        !!codeRecord &&
        codeRecord.isActive &&
        (!codeRecord.expiresAt || codeRecord.expiresAt >= new Date());
    } catch {
      // If DB fails, fall through to gate
      hasAccess = false;
    }
  }

  if (hasAccess) {
    return <ShareableMapClient />;
  }

  return <ShareCodeGate />;
}
