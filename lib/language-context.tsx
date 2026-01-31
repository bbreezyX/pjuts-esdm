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
      "Protokol keamanan tingkat tinggi untuk melindungi aset data strategis Dinas ESDM Provinsi Jambi.",
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
      "Perekaman identitas setiap unit PJUTS menggunakan QR Code dan koordinat GPS yang akurat untuk pemetaan aset Provinsi Jambi.",
    "solutions.iot": "Transmisi IoT",
    "solutions.iot_desc":
      "Pengiriman data kondisi lampu dan baterai secara berkala melalui jaringan seluler atau satelit ke pusat data Dinas ESDM Provinsi Jambi.",
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
      "Sinkronisasi data otomatis ke server pusat dashboard Provinsi Jambi.",
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
      "Peta sebaran Provinsi Jambi dapat diakses melalui modul GIS di dashboard monitoring untuk transparansi aset daerah.",

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

    // Login Page
    "login.ministry": "Dinas ESDM Prov. Jambi",
    "login.badge": "Portal Monitoring Provinsi",
    "login.title": "Sistem Monitoring",
    "login.title_highlight": "Infrastruktur PJUTS",
    "login.description":
      "Platform terintegrasi untuk pemantauan real-time, manajemen aset, dan pelaporan kinerja Penerangan Jalan Umum Tenaga Surya di Provinsi Jambi.",
    "login.stat_units": "Unit Terpasang",
    "login.stat_units_value": "1.2K+",
    "login.stat_districts": "Kab/Kota",
    "login.stat_districts_value": "11",
    "login.stat_uptime": "Uptime",
    "login.stat_uptime_value": "99.9%",
    "login.copyright": "© 2026 Dinas ESDM Provinsi Jambi",
    "login.welcome": "Selamat Datang",
    "login.welcome_sub":
      "Silakan masuk menggunakan kredensial akun terdaftar Anda.",
    "login.email_label": "Email Kedinasan",
    "login.email_placeholder": "nama@jambiprov.go.id",
    "login.password_label": "Password",
    "login.password_placeholder": "Masukkan password anda",
    "login.remember": "Ingat saya",
    "login.forgot": "Lupa password?",
    "login.submit": "Masuk ke Dashboard",
    "login.encrypted": "Terenkripsi",
    "login.fast_access": "Akses Cepat",
    "login.no_account": "Belum punya akun akses?",
    "login.contact_admin": "Hubungi Administrator",
    "login.back_home": "Kembali ke Beranda",
    "login.idle_message":
      "Sesi Anda berakhir karena tidak ada aktivitas. Silakan masuk kembali.",
    "login.error_credentials": "Email atau password salah",
    "login.error_general": "Terjadi kesalahan. Silakan coba lagi.",
    "login.error_rate_limit": "Terlalu banyak percobaan. Coba lagi nanti.",
    "login.error_disabled": "Akun Anda telah dinonaktifkan.",
    "login.error_max_attempts": "Terlalu banyak percobaan gagal. Silakan mulai ulang.",
    "login.mobile_welcome": "Masuk ke portal monitoring PJUTS",
    "login.security_note": "Dilindungi verifikasi 2 langkah untuk keamanan Anda.",
    "login.pin_title": "Verifikasi Keamanan",
    "login.pin_instruction": "Ketik kode di bawah untuk melanjutkan",
    "login.your_code": "Kode Anda",
    "login.new_code": "Baru",
    "login.enter_code": "Masukkan Kode",
    "login.pin_incorrect": "Kode salah. Coba lagi.",
    "login.pin_expired": "Kode kedaluwarsa. Silakan coba lagi.",
    "login.verify": "Lanjutkan",
    "login.back": "Kembali",

    // Forgot Password Page
    "forgot.ministry": "Dinas ESDM Prov. Jambi",
    "forgot.badge": "Pemulihan Akun",
    "forgot.title": "Lupa Password?",
    "forgot.title_highlight": "Kami Bantu Reset",
    "forgot.description":
      "Masukkan email terdaftar Anda dan kami akan mengirimkan link untuk mengatur ulang password akun Anda.",
    "forgot.secure": "Aman & Terenkripsi",
    "forgot.secure_desc": "Link reset valid 1 jam",
    "forgot.fast": "Proses Cepat",
    "forgot.fast_desc": "Email dalam 2 menit",
    "forgot.copyright": "© 2026 Dinas ESDM Provinsi Jambi",
    "forgot.email_label": "Email Kedinasan",
    "forgot.email_placeholder": "nama@jambiprov.go.id",
    "forgot.submit": "Kirim Link Reset",
    "forgot.encrypted": "Terenkripsi",
    "forgot.time": "2 Menit",
    "forgot.remember": "Ingat password Anda?",
    "forgot.login_here": "Masuk di sini",
    "forgot.back_login": "Kembali ke Login",
    "forgot.mobile_title": "Lupa Password",
    "forgot.mobile_sub": "Reset password akun Anda dengan mudah",
    "forgot.desktop_title": "Lupa Password",
    "forgot.desktop_sub":
      "Masukkan alamat email yang terdaftar pada akun Anda.",
    "forgot.success_title": "Email Terkirim!",
    "forgot.success_desc":
      "Jika email terdaftar di sistem kami, Anda akan menerima link untuk reset password dalam beberapa menit.",
    "forgot.check_spam": "Tidak menerima email?",
    "forgot.spam_hint":
      "Cek folder spam atau coba lagi dengan email yang berbeda.",
    "forgot.back_to_login": "Kembali ke halaman login",

    // Reset Password Page
    "reset.ministry": "Dinas ESDM Prov. Jambi",
    "reset.title": "Keamanan Akun",
    "reset.title_highlight": "Adalah Prioritas",
    "reset.description":
      "Gunakan password yang kuat dengan kombinasi huruf besar, huruf kecil, dan angka untuk melindungi akun Anda.",
    "reset.copyright": "© 2026 Dinas ESDM Provinsi Jambi",
    "reset.back_login": "Kembali ke Login",
    "reset.validating": "Memvalidasi link reset password...",
    "reset.invalid_title": "Link Tidak Valid",
    "reset.token_missing":
      "Token tidak ditemukan. Silakan minta link reset password baru.",
    "reset.token_invalid": "Token tidak valid",
    "reset.request_new": "Minta Link Reset Baru",
    "reset.back_to_login": "Kembali ke halaman login",
    "reset.success_title": "Password Berhasil Direset!",
    "reset.success_desc":
      "Password Anda telah diperbarui. Anda akan dialihkan ke halaman login dalam beberapa detik...",
    "reset.login_now": "Masuk sekarang",
    "reset.form_title": "Reset Password",
    "reset.form_sub": "Buat password baru untuk akun Anda.",
    "reset.new_password": "Password Baru",
    "reset.new_password_placeholder": "Masukkan password baru",
    "reset.confirm_password": "Konfirmasi Password",
    "reset.confirm_placeholder": "Ulangi password baru",
    "reset.requirements": "Persyaratan password:",
    "reset.min_length": "Minimal 8 karakter",
    "reset.has_uppercase": "Huruf besar",
    "reset.has_lowercase": "Huruf kecil",
    "reset.has_number": "Angka",
    "reset.match": "Password cocok",
    "reset.no_match": "Password tidak cocok",
    "reset.submit": "Reset Password",
    "reset.error_requirements": "Password tidak memenuhi persyaratan",
    "reset.error_mismatch": "Konfirmasi password tidak cocok",
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
      "High-level security protocols to protect strategic provincial data assets.",
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
      "Recording identity of each PJUTS unit using QR Code and accurate GPS coordinates for Jambi Province asset mapping.",
    "solutions.iot": "IoT Transmission",
    "solutions.iot_desc":
      "Periodic transmission of lamp and battery condition data via cellular or satellite network to the Jambi Province EMR Office data center.",
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
      "Automatic data synchronization to the provincial dashboard central server.",
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
      "The Jambi Province distribution map can be accessed through the GIS module in the monitoring dashboard for regional asset transparency.",

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

    // Login Page
    "login.ministry": "EMR Office Jambi Province",
    "login.badge": "Provincial Monitoring Portal",
    "login.title": "Monitoring System",
    "login.title_highlight": "PJUTS Infrastructure",
    "login.description":
      "Integrated platform for real-time monitoring, asset management, and performance reporting of Solar-Powered Public Street Lighting across Jambi Province.",
    "login.stat_units": "Units Installed",
    "login.stat_units_value": "1.2K+",
    "login.stat_districts": "Districts",
    "login.stat_districts_value": "11",
    "login.stat_uptime": "Uptime",
    "login.stat_uptime_value": "99.9%",
    "login.copyright": "© 2026 EMR Office Jambi Province",
    "login.welcome": "Welcome",
    "login.welcome_sub":
      "Please sign in using your registered account credentials.",
    "login.email_label": "Official Email",
    "login.email_placeholder": "name@jambiprov.go.id",
    "login.password_label": "Password",
    "login.password_placeholder": "Enter your password",
    "login.remember": "Remember me",
    "login.forgot": "Forgot password?",
    "login.submit": "Sign in to Dashboard",
    "login.encrypted": "Encrypted",
    "login.fast_access": "Fast Access",
    "login.no_account": "Don't have access?",
    "login.contact_admin": "Contact Administrator",
    "login.back_home": "Back to Home",
    "login.idle_message":
      "Your session expired due to inactivity. Please sign in again.",
    "login.error_credentials": "Invalid email or password",
    "login.error_general": "An error occurred. Please try again.",
    "login.error_rate_limit": "Too many attempts. Please try again later.",
    "login.error_disabled": "Your account has been disabled.",
    "login.error_max_attempts": "Too many failed attempts. Please start over.",
    "login.mobile_welcome": "Sign in to PJUTS monitoring portal",
    "login.security_note": "Protected by 2-step verification for your security.",
    "login.pin_title": "Security Check",
    "login.pin_instruction": "Type the code below to continue",
    "login.your_code": "Your Code",
    "login.new_code": "New",
    "login.enter_code": "Enter Code",
    "login.pin_incorrect": "Wrong code. Try again.",
    "login.pin_expired": "Code expired. Please try again.",
    "login.verify": "Continue",
    "login.back": "Back",

    // Forgot Password Page
    "forgot.ministry": "EMR Office Jambi Province",
    "forgot.badge": "Account Recovery",
    "forgot.title": "Forgot Password?",
    "forgot.title_highlight": "We'll Help Reset",
    "forgot.description":
      "Enter your registered email and we'll send you a link to reset your account password.",
    "forgot.secure": "Safe & Encrypted",
    "forgot.secure_desc": "Reset link valid for 1 hour",
    "forgot.fast": "Fast Process",
    "forgot.fast_desc": "Email in 2 minutes",
    "forgot.copyright": "© 2026 EMR Office Jambi Province",
    "forgot.email_label": "Official Email",
    "forgot.email_placeholder": "name@jambiprov.go.id",
    "forgot.submit": "Send Reset Link",
    "forgot.encrypted": "Encrypted",
    "forgot.time": "2 Minutes",
    "forgot.remember": "Remember your password?",
    "forgot.login_here": "Sign in here",
    "forgot.back_login": "Back to Login",
    "forgot.mobile_title": "Forgot Password",
    "forgot.mobile_sub": "Reset your account password easily",
    "forgot.desktop_title": "Forgot Password",
    "forgot.desktop_sub": "Enter the email address registered to your account.",
    "forgot.success_title": "Email Sent!",
    "forgot.success_desc":
      "If the email is registered in our system, you will receive a password reset link within a few minutes.",
    "forgot.check_spam": "Didn't receive the email?",
    "forgot.spam_hint":
      "Check your spam folder or try again with a different email.",
    "forgot.back_to_login": "Back to login page",

    // Reset Password Page
    "reset.ministry": "EMR Office Jambi Province",
    "reset.title": "Account Security",
    "reset.title_highlight": "Is Our Priority",
    "reset.description":
      "Use a strong password with a combination of uppercase, lowercase letters, and numbers to protect your account.",
    "reset.copyright": "© 2026 EMR Office Jambi Province",
    "reset.back_login": "Back to Login",
    "reset.validating": "Validating reset password link...",
    "reset.invalid_title": "Invalid Link",
    "reset.token_missing":
      "Token not found. Please request a new password reset link.",
    "reset.token_invalid": "Invalid token",
    "reset.request_new": "Request New Reset Link",
    "reset.back_to_login": "Back to login page",
    "reset.success_title": "Password Reset Successfully!",
    "reset.success_desc":
      "Your password has been updated. You will be redirected to the login page in a few seconds...",
    "reset.login_now": "Sign in now",
    "reset.form_title": "Reset Password",
    "reset.form_sub": "Create a new password for your account.",
    "reset.new_password": "New Password",
    "reset.new_password_placeholder": "Enter new password",
    "reset.confirm_password": "Confirm Password",
    "reset.confirm_placeholder": "Repeat new password",
    "reset.requirements": "Password requirements:",
    "reset.min_length": "Minimum 8 characters",
    "reset.has_uppercase": "Uppercase letter",
    "reset.has_lowercase": "Lowercase letter",
    "reset.has_number": "Number",
    "reset.match": "Passwords match",
    "reset.no_match": "Passwords don't match",
    "reset.submit": "Reset Password",
    "reset.error_requirements": "Password does not meet requirements",
    "reset.error_mismatch": "Password confirmation does not match",
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
