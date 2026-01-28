"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type Language = "id" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// All translations for the landing page
const translations: Record<Language, Record<string, string>> = {
  id: {
    // Navbar
    "nav.beranda": "Beranda",
    "nav.statistik": "Statistik",
    "nav.sistem": "Sistem",
    "nav.alur_kerja": "Alur Kerja",
    "nav.bantuan": "Bantuan",
    "nav.kontak": "Kontak",
    "nav.masuk": "Masuk Sistem",
    "nav.ministry": "Dinas ESDM Prov. Jambi",

    // Hero Section
    "hero.badge": "Sistem Monitoring Real-time",
    "hero.title_1": "Monitoring",
    "hero.title_2": "PJUTS",
    "hero.title_3": "Provinsi Jambi",
    "hero.description":
      "Platform terintegrasi Dinas ESDM untuk pemantauan, pelaporan, dan analisis kinerja",
    "hero.description_highlight": "Penerangan Jalan Umum Tenaga Surya",
    "hero.description_end": "di Provinsi Jambi.",
    "hero.cta_primary": "Mulai Sekarang",
    "hero.cta_secondary": "Pelajari Sistem",
    "hero.units_installed": "Unit Terpasang",
    "hero.units_desc":
      "Tersebar di seluruh wilayah Provinsi Jambi, memastikan kemandirian energi daerah.",
    "hero.provinces": "Kab/Kota",
    "hero.reports": "Laporan",
    "hero.live_monitoring": "Live Monitoring",
    "hero.uptime": "Uptime 99.9% Sistem Monitoring Aktif Provinsi",

    // Stats Section
    "stats.badge": "Fitur Utama",
    "stats.title_1": "Teknologi",
    "stats.title_2": "Monitoring",
    "stats.title_3": "Terdepan",
    "stats.description":
      "Kami menghadirkan standar baru dalam pengelolaan infrastruktur publik berbasis energi terbarukan.",
    "stats.accuracy": "Akurasi Data",
    "stats.accuracy_desc":
      "Data pemantauan lampu yang akurat dan terverifikasi secara digital.",
    "stats.response": "Respon Cepat",
    "stats.response_desc":
      "Sistem pelaporan kendala yang ditangani secara sigap oleh tim teknis.",
    "stats.transparency": "Transparansi",
    "stats.transparency_desc":
      "Seluruh progres pemasangan dan kondisi unit dapat dipantau publik.",

    // Challenges (System) Section
    "system.badge": "Modul Sistem",
    "system.title_1": "Arsitektur",
    "system.title_2": "Ecosystem",
    "system.title_3": "Monitoring",
    "system.description":
      "Ekosistem monitoring PJUTS dirancang untuk menangani kompleksitas data dari ribuan unit di seluruh wilayah provinsi.",
    "system.dashboard": "Dashboard Terpadu",
    "system.dashboard_desc":
      "Visualisasi data real-time untuk memudahkan pengambilan keputusan strategis oleh pimpinan.",
    "system.security": "Keamanan Data",
    "system.security_desc":
      "Protokol keamanan tingkat tinggi untuk melindungi aset data strategis kementerian.",
    "system.reporting": "Pelaporan Digital",
    "system.reporting_desc":
      "Otomasi dokumen laporan untuk efisiensi birokrasi dan akuntabilitas kerja.",
    "system.analysis": "Analisis Kinerja",
    "system.analysis_desc":
      "Algoritma cerdas untuk menganalisis efisiensi penggunaan energi setiap unit lampu.",

    // Solutions Section
    "solutions.title_1": "Alur Kerja",
    "solutions.title_2": "Monitoring",
    "solutions.title_3": "Terpadu",
    "solutions.description":
      "Sistem kami memastikan setiap rupiah investasi daerah dalam PJUTS terpantau manfaatnya secara maksimal bagi masyarakat.",
    "solutions.census": "Sensus Data Digital",
    "solutions.census_desc":
      "Perekaman identitas setiap unit PJUTS menggunakan QR Code dan koordinat GPS yang akurat untuk pemetaan aset nasional.",
    "solutions.iot": "Transmisi IoT",
    "solutions.iot_desc":
      "Pengiriman data kondisi lampu dan baterai secara berkala melalui jaringan seluler atau satelit ke pusat data Kementerian ESDM.",
    "solutions.verification": "Verifikasi & Tindak Lanjut",
    "solutions.verification_desc":
      "Validasi laporan otomatis oleh sistem, diteruskan kepada penyedia jasa untuk perbaikan segera guna menjaga standar pelayanan.",

    // Workflow Section
    "workflow.badge": "Alur Kerja",
    "workflow.title_1": "Mekanisme Pelaporan",
    "workflow.title_2": "Terpadu",
    "workflow.description":
      "Alur kerja digital yang menyederhanakan proses monitoring lapangan menjadi langkah-langkah efisien dan terstruktur bagi seluruh petugas.",
    "workflow.step1": "Identifikasi Aset",
    "workflow.step1_desc":
      "Pemindaian QR Code dan verifikasi koordinat GPS untuk memastikan akurasi lokasi.",
    "workflow.step2": "Dokumentasi",
    "workflow.step2_desc":
      "Foto fisik dengan watermark timestamp & geotag otomatis dari aplikasi.",
    "workflow.step3": "Sinkronisasi",
    "workflow.step3_desc":
      "Sinkronisasi data otomatis ke server pusat dashboard nasional.",
    "workflow.monitor_live": "System Monitor Live",

    // Features (FAQ) Section
    "faq.badge": "Pusat Informasi",
    "faq.title_1": "Dukungan",
    "faq.title_2": "& Layanan Publik",
    "faq.cta": "Hubungi Helpdesk",
    "faq.q1": "Bagaimana cara melaporkan lampu mati?",
    "faq.a1":
      "Masyarakat dapat menggunakan fitur pengaduan di aplikasi atau website dengan melampirkan foto unit dan QR Code yang tertera pada tiang lampu.",
    "faq.q2": "Siapa yang bertanggung jawab atas pemeliharaan?",
    "faq.a2":
      "Pemeliharaan dilakukan oleh penyedia jasa dalam masa garansi, dan selanjutnya akan diserahterimakan kepada Pemerintah Daerah setempat.",
    "faq.q3": "Apa keunggulan PJUTS dibandingkan PJU biasa?",
    "faq.a3":
      "PJUTS mandiri energi, tidak memerlukan kabel instalasi listrik PLN, dan lebih hemat biaya operasional jangka panjang bagi daerah.",
    "faq.q4": "Dimana saya bisa melihat data sebaran PJUTS?",
    "faq.a4":
      "Peta sebaran nasional dapat diakses melalui modul GIS di dashboard monitoring untuk transparansi aset negara.",

    // CTA Section
    "cta.title_1": "Siap Monitoring",
    "cta.title_2": "PJUTS",
    "cta.title_3": "Lebih Efisien?",
    "cta.description":
      "Bergabunglah dengan petugas di seluruh Provinsi Jambi untuk membangun infrastruktur energi yang lebih baik.",
    "cta.button": "Masuk ke Dashboard",

    // Footer Section
    "footer.description":
      "Sistem informasi monitoring terpadu untuk efisiensi energi daerah yang berkelanjutan dan akuntabel.",
    "footer.navigation": "Navigasi",
    "footer.system": "Sistem",
    "footer.gis_map": "GIS Map",
    "footer.reports": "Laporan",
    "footer.regulations": "Regulasi",
    "footer.downloads": "Unduhan",
    "footer.information": "Informasi",
    "footer.news": "Berita",
    "footer.publications": "Publikasi",
    "footer.profile": "Profil",
    "footer.faq": "FAQ",
    "footer.social": "Sosial Media",
    "footer.privacy": "Kebijakan Privasi",
    "footer.address":
      "Jl. Arif Rahman Hakim No.30 A, Simpang IV Sipin, Kec. Telanaipura, Kota Jambi 36361",
  },
  en: {
    // Navbar
    "nav.beranda": "Home",
    "nav.statistik": "Statistics",
    "nav.sistem": "System",
    "nav.alur_kerja": "Workflow",
    "nav.bantuan": "Help",
    "nav.kontak": "Contact",
    "nav.masuk": "Login",
    "nav.ministry": "EMR Office Jambi Province",

    // Hero Section
    "hero.badge": "Real-time Monitoring System",
    "hero.title_1": "Jambi Province",
    "hero.title_2": "PJUTS",
    "hero.title_3": "Monitoring",
    "hero.description":
      "Integrated platform of the EMR Office for monitoring, reporting, and performance analysis of",
    "hero.description_highlight": "Solar-Powered Public Street Lighting",
    "hero.description_end": "across Jambi Province.",
    "hero.cta_primary": "Get Started",
    "hero.cta_secondary": "Learn More",
    "hero.units_installed": "Units Installed",
    "hero.units_desc":
      "Spread across the entire Jambi Province, ensuring regional energy independence.",
    "hero.provinces": "Districts",
    "hero.reports": "Reports",
    "hero.live_monitoring": "Live Monitoring",
    "hero.uptime": "99.9% Uptime Provincial Active Monitoring System",

    // Stats Section
    "stats.badge": "Key Features",
    "stats.title_1": "Leading",
    "stats.title_2": "Monitoring",
    "stats.title_3": "Technology",
    "stats.description":
      "We bring a new standard in managing renewable energy-based public infrastructure.",
    "stats.accuracy": "Data Accuracy",
    "stats.accuracy_desc":
      "Accurate and digitally verified lamp monitoring data.",
    "stats.response": "Fast Response",
    "stats.response_desc":
      "Issue reporting system handled promptly by the technical team.",
    "stats.transparency": "Transparency",
    "stats.transparency_desc":
      "All installation progress and unit conditions can be monitored publicly.",

    // Challenges (System) Section
    "system.badge": "System Modules",
    "system.title_1": "Monitoring",
    "system.title_2": "Ecosystem",
    "system.title_3": "Architecture",
    "system.description":
      "The PJUTS monitoring ecosystem is designed to handle data complexity from thousands of units across the province.",
    "system.dashboard": "Integrated Dashboard",
    "system.dashboard_desc":
      "Real-time data visualization for strategic decision-making by leadership.",
    "system.security": "Data Security",
    "system.security_desc":
      "High-level security protocols to protect strategic ministry data assets.",
    "system.reporting": "Digital Reporting",
    "system.reporting_desc":
      "Report document automation for bureaucratic efficiency and work accountability.",
    "system.analysis": "Performance Analysis",
    "system.analysis_desc":
      "Smart algorithms to analyze energy usage efficiency of each lamp unit.",

    // Solutions Section
    "solutions.title_1": "Integrated",
    "solutions.title_2": "Monitoring",
    "solutions.title_3": "Workflow",
    "solutions.description":
      "Our system ensures every rupiah of regional investment in PJUTS is maximally monitored for public benefit.",
    "solutions.census": "Digital Data Census",
    "solutions.census_desc":
      "Recording identity of each PJUTS unit using QR Code and accurate GPS coordinates for national asset mapping.",
    "solutions.iot": "IoT Transmission",
    "solutions.iot_desc":
      "Periodic transmission of lamp and battery condition data via cellular or satellite network to the Ministry of EMR data center.",
    "solutions.verification": "Verification & Follow-up",
    "solutions.verification_desc":
      "Automatic report validation by the system, forwarded to service providers for immediate repair to maintain service standards.",

    // Workflow Section
    "workflow.badge": "Workflow",
    "workflow.title_1": "Integrated Reporting",
    "workflow.title_2": "Mechanism",
    "workflow.description":
      "Digital workflow that simplifies field monitoring processes into efficient and structured steps for all officers.",
    "workflow.step1": "Asset Identification",
    "workflow.step1_desc":
      "QR Code scanning and GPS coordinate verification to ensure location accuracy.",
    "workflow.step2": "Documentation",
    "workflow.step2_desc":
      "Physical photos with automatic timestamp watermark & geotag from the app.",
    "workflow.step3": "Synchronization",
    "workflow.step3_desc":
      "Automatic data synchronization to the national dashboard central server.",
    "workflow.monitor_live": "System Monitor Live",

    // Features (FAQ) Section
    "faq.badge": "Information Center",
    "faq.title_1": "Support",
    "faq.title_2": "& Public Services",
    "faq.cta": "Contact Helpdesk",
    "faq.q1": "How do I report a broken lamp?",
    "faq.a1":
      "The public can use the complaint feature in the app or website by attaching a photo of the unit and QR Code on the lamp post.",
    "faq.q2": "Who is responsible for maintenance?",
    "faq.a2":
      "Maintenance is done by service providers during the warranty period, and will then be handed over to the local Government.",
    "faq.q3": "What are the advantages of PJUTS compared to regular PJU?",
    "faq.a3":
      "PJUTS is energy independent, does not require PLN electricity installation cables, and is more cost-effective in long-term operations for regions.",
    "faq.q4": "Where can I see PJUTS distribution data?",
    "faq.a4":
      "The national distribution map can be accessed through the GIS module in the monitoring dashboard for state asset transparency.",

    // CTA Section
    "cta.title_1": "Ready for",
    "cta.title_2": "PJUTS",
    "cta.title_3": "More Efficient Monitoring?",
    "cta.description":
      "Join officers across Jambi Province to build better energy infrastructure.",
    "cta.button": "Go to Dashboard",

    // Footer Section
    "footer.description":
      "Integrated monitoring information system for sustainable and accountable regional energy efficiency.",
    "footer.navigation": "Navigation",
    "footer.system": "System",
    "footer.gis_map": "GIS Map",
    "footer.reports": "Reports",
    "footer.regulations": "Regulations",
    "footer.downloads": "Downloads",
    "footer.information": "Information",
    "footer.news": "News",
    "footer.publications": "Publications",
    "footer.profile": "Profile",
    "footer.faq": "FAQ",
    "footer.social": "Social Media",
    "footer.privacy": "Privacy Policy",
    "footer.address":
      "Jl. Arif Rahman Hakim No.30 A, Simpang IV Sipin, Kec. Telanaipura, Jambi City 36361",
  },
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("id");

  // Load saved language preference on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("pjuts-language") as Language | null;
    if (savedLang && (savedLang === "id" || savedLang === "en")) {
      setLanguageState(savedLang);
    }
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("pjuts-language", lang);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguageState((prev) => {
      const newLang = prev === "id" ? "en" : "id";
      localStorage.setItem("pjuts-language", newLang);
      return newLang;
    });
  }, []);

  const t = useCallback(
    (key: string): string => {
      return translations[language][key] || key;
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, toggleLanguage, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
