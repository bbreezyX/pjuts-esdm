/**
 * Offline utilities for PWA support
 * - localStorage caching with expiration
 * - Connection status detection
 * - Form draft persistence
 */

// ============================================
// STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  UNITS_CACHE: "pjuts_units_cache",
  UNITS_CACHE_TIME: "pjuts_units_cache_time",
  REPORT_DRAFT: "pjuts_report_draft",
} as const;

// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// ============================================
// GENERIC STORAGE HELPERS
// ============================================

/**
 * Safely get item from localStorage (handles SSR)
 */
export function getStorageItem<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return null;
  }
}

/**
 * Safely set item in localStorage (handles SSR)
 */
export function setStorageItem<T>(key: string, value: T): boolean {
  if (typeof window === "undefined") return false;
  
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing ${key} from localStorage:`, error);
  }
}

// ============================================
// UNITS CACHE
// ============================================

export interface CachedUnit {
  id: string;
  serialNumber: string;
  province: string;
  regency: string;
  latitude: number;
  longitude: number;
}

/**
 * Cache units list to localStorage
 */
export function cacheUnits(units: CachedUnit[]): void {
  setStorageItem(STORAGE_KEYS.UNITS_CACHE, units);
  setStorageItem(STORAGE_KEYS.UNITS_CACHE_TIME, Date.now());
}

/**
 * Get cached units if not expired
 */
export function getCachedUnits(): CachedUnit[] | null {
  const cacheTime = getStorageItem<number>(STORAGE_KEYS.UNITS_CACHE_TIME);
  
  // Check if cache is expired
  if (!cacheTime || Date.now() - cacheTime > CACHE_EXPIRATION) {
    return null;
  }
  
  return getStorageItem<CachedUnit[]>(STORAGE_KEYS.UNITS_CACHE);
}

/**
 * Check if units cache is valid
 */
export function isUnitsCacheValid(): boolean {
  const cacheTime = getStorageItem<number>(STORAGE_KEYS.UNITS_CACHE_TIME);
  return !!cacheTime && Date.now() - cacheTime <= CACHE_EXPIRATION;
}

// ============================================
// REPORT DRAFT
// ============================================

export interface ReportDraft {
  unitId: string;
  batteryVoltage: string;
  notes: string;
  savedAt: number;
}

/**
 * Save report draft to localStorage
 */
export function saveReportDraft(draft: Omit<ReportDraft, "savedAt">): void {
  setStorageItem(STORAGE_KEYS.REPORT_DRAFT, {
    ...draft,
    savedAt: Date.now(),
  });
}

/**
 * Get saved report draft
 */
export function getReportDraft(): ReportDraft | null {
  return getStorageItem<ReportDraft>(STORAGE_KEYS.REPORT_DRAFT);
}

/**
 * Clear report draft
 */
export function clearReportDraft(): void {
  removeStorageItem(STORAGE_KEYS.REPORT_DRAFT);
}

// ============================================
// CONNECTION STATUS
// ============================================

/**
 * Check if currently online
 */
export function isOnline(): boolean {
  if (typeof window === "undefined") return true;
  return navigator.onLine;
}
