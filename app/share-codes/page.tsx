import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ShareCodesManager } from "./share-codes-client";

export const metadata: Metadata = {
  title: "Kelola Kode Akses Peta — PJUTS ESDM",
  description: "Kelola kode akses untuk peta publik PJUTS ESDM.",
};

export default async function ShareCodesPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <ShareCodesManager />;
}
