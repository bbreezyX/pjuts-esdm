import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PJUTS ESDM - Sistem Monitoring Penerangan Jalan Umum Tenaga Surya",
  description:
    "Sistem monitoring dan pelaporan PJUTS (Penerangan Jalan Umum Tenaga Surya) Kementerian ESDM Republik Indonesia",
  keywords: [
    "PJUTS",
    "ESDM",
    "Solar Street Light",
    "Monitoring",
    "Indonesia",
    "Penerangan Jalan",
    "Energi Terbarukan",
  ],
  authors: [{ name: "Kementerian ESDM RI" }],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PJUTS ESDM",
  },
};

export const viewport: Viewport = {
  themeColor: "#003366",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
