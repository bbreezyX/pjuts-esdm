/**
 * Centralized Error Messages (Indonesian)
 * 
 * Standardized error messages for consistency across the application.
 * All user-facing error messages should use these constants.
 */

export const ERROR_MESSAGES = {
  // ============================================
  // AUTHENTICATION & AUTHORIZATION
  // ============================================
  AUTH_REQUIRED: "Autentikasi diperlukan. Silakan masuk.",
  UNAUTHORIZED: "Anda tidak memiliki akses untuk melakukan tindakan ini.",
  SESSION_EXPIRED: "Sesi Anda telah berakhir. Silakan masuk kembali.",
  
  // ============================================
  // VALIDATION
  // ============================================
  VALIDATION_FAILED: "Validasi gagal",
  INVALID_INPUT: "Data yang dimasukkan tidak valid",
  
  // ============================================
  // USER MANAGEMENT
  // ============================================
  USER_NOT_FOUND: "Pengguna tidak ditemukan",
  USER_EMAIL_EXISTS: "Email sudah digunakan",
  USER_CREATE_FAILED: "Gagal membuat pengguna",
  USER_UPDATE_FAILED: "Gagal mengupdate pengguna",
  USER_DELETE_FAILED: "Gagal menghapus pengguna",
  USER_DELETE_SELF: "Tidak dapat menghapus akun sendiri",
  USER_DISABLE_SELF: "Tidak dapat menonaktifkan akun sendiri",
  USER_STATUS_FAILED: "Gagal mengubah status pengguna",
  USER_FETCH_FAILED: "Gagal mengambil data pengguna",
  
  // ============================================
  // UNIT MANAGEMENT
  // ============================================
  UNIT_NOT_FOUND: "Unit PJUTS tidak ditemukan",
  UNIT_EXISTS: "Unit dengan serial number tersebut sudah ada",
  UNIT_CREATE_FAILED: "Gagal membuat unit PJUTS",
  UNIT_UPDATE_FAILED: "Gagal mengupdate unit PJUTS",
  UNIT_DELETE_FAILED: "Gagal menghapus unit PJUTS",
  UNIT_FETCH_FAILED: "Gagal mengambil data unit PJUTS",
  UNIT_ADMIN_ONLY: "Hanya administrator yang dapat mengelola unit PJUTS",
  
  // ============================================
  // REPORT MANAGEMENT
  // ============================================
  REPORT_NOT_FOUND: "Laporan tidak ditemukan",
  REPORT_DELETE_FAILED: "Gagal menghapus laporan",
  REPORT_SUBMIT_FAILED: "Gagal mengirim laporan",
  REPORT_FETCH_FAILED: "Gagal mengambil data laporan",
  REPORT_ADMIN_ONLY: "Hanya administrator yang dapat menghapus laporan",
  REPORT_IMAGE_REQUIRED: "Minimal satu foto diperlukan",
  REPORT_IMAGE_MAX: "Maksimal 3 foto per laporan",
  REPORT_IMAGE_INVALID: "Jenis file gambar tidak valid. Gunakan JPEG, PNG, atau WebP.",
  REPORT_IMAGE_TOO_LARGE: "Ukuran gambar terlalu besar. Maksimal 10MB.",
  
  // ============================================
  // PASSWORD RESET
  // ============================================
  TOKEN_INVALID: "Token tidak valid",
  TOKEN_EXPIRED: "Token sudah kadaluarsa. Silakan minta reset password baru.",
  TOKEN_USED: "Token tidak valid atau sudah digunakan",
  PASSWORD_MIN_LENGTH: "Password minimal 8 karakter",
  PASSWORD_REQUIREMENTS: "Password harus mengandung huruf besar, huruf kecil, dan angka",
  
  // ============================================
  // DATA FETCHING
  // ============================================
  PROVINCES_FETCH_FAILED: "Gagal mengambil data provinsi",
  DASHBOARD_FETCH_FAILED: "Gagal mengambil data dashboard",
  MAP_FETCH_FAILED: "Gagal mengambil data peta",
  NOTIFICATIONS_FETCH_FAILED: "Gagal mengambil notifikasi",
  
  // ============================================
  // IMAGE UPLOAD
  // ============================================
  UPLOAD_FAILED: "Gagal mengunggah gambar",
  
  // ============================================
  // GENERIC
  // ============================================
  GENERIC_ERROR: "Terjadi kesalahan. Silakan coba lagi.",
  NETWORK_ERROR: "Kesalahan jaringan. Periksa koneksi internet Anda.",
  SERVER_ERROR: "Terjadi kesalahan pada server. Silakan coba beberapa saat lagi.",
} as const;

// Type for error message keys
export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;

/**
 * Get an error message by key
 * Returns the generic error if key is not found
 */
export function getErrorMessage(key: ErrorMessageKey): string {
  return ERROR_MESSAGES[key] || ERROR_MESSAGES.GENERIC_ERROR;
}

/**
 * Create a formatted error message with dynamic values
 * 
 * @example
 * formatError("UNIT_EXISTS", { serialNumber: "PJUTS-001" })
 * // Returns: "Unit dengan serial number PJUTS-001 sudah ada"
 */
export function formatError(
  template: string,
  values: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}
