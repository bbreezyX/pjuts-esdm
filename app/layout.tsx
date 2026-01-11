import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers/providers";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://esdm.cloud"),
  title: {
    default: "PJUTS ESDM - Sistem Monitoring Penerangan Jalan Umum Tenaga Surya",
    template: "%s | PJUTS ESDM",
  },
  description:
    "Sistem monitoring dan pelaporan PJUTS (Penerangan Jalan Umum Tenaga Surya) Kementerian ESDM Republik Indonesia. Pantau kondisi lampu jalan tenaga surya secara real-time.",
  keywords: [
    "PJUTS",
    "ESDM",
    "Solar Street Light",
    "Monitoring",
    "Indonesia",
    "Penerangan Jalan",
    "Energi Terbarukan",
    "Lampu Jalan Tenaga Surya",
    "Kementerian ESDM",
  ],
  authors: [{ name: "Kementerian ESDM RI" }],
  creator: "Kementerian ESDM Republik Indonesia",
  publisher: "Kementerian ESDM Republik Indonesia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PJUTS ESDM",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://esdm.cloud",
    siteName: "PJUTS ESDM",
    title: "PJUTS ESDM - Sistem Monitoring Penerangan Jalan Umum Tenaga Surya",
    description:
      "Sistem monitoring dan pelaporan PJUTS (Penerangan Jalan Umum Tenaga Surya) Kementerian ESDM Republik Indonesia",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "PJUTS ESDM - Monitoring Lampu Jalan Tenaga Surya",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PJUTS ESDM - Sistem Monitoring Penerangan Jalan Umum Tenaga Surya",
    description:
      "Sistem monitoring dan pelaporan PJUTS Kementerian ESDM Republik Indonesia",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your Google Search Console verification code here
    // google: "your-google-verification-code",
  },
};

export const viewport: Viewport = {
  themeColor: "#003366",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakarta.variable}>
      <head>
        {/* Preconnect to external resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://tile.openstreetmap.org" />
        
        {/* Preconnect to R2 storage */}
        <link rel="preconnect" href="https://pub-placeholder.r2.dev" />
        
        {/* Prefetch critical resources */}
        <link rel="prefetch" href="/manifest.json" />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
