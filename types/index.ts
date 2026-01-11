import { UnitStatus, Role } from "@prisma/client";

// Re-export Prisma enums for client-side use
export { UnitStatus, Role };

// ============================================
// Action Result Type (Server Actions)
// ============================================

export interface ActionResult<T = void> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

// ============================================
// User Types
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

// ============================================
// PJUTS Unit Types
// ============================================

export interface PjutsUnit {
  id: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  province: string;
  regency: string;
  district?: string | null;
  village?: string | null;
  address?: string | null;
  lastStatus: UnitStatus;
  installDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PjutsUnitWithReportCount extends PjutsUnit {
  _count: {
    reports: number;
  };
}

// ============================================
// Report Types
// ============================================

export interface Report {
  id: string;
  unitId: string;
  imageUrl: string;
  imagePath: string;
  batteryVoltage: number;
  latitude: number;
  longitude: number;
  notes?: string | null;
  submittedBy: string;
  createdAt: Date;
}

export interface ReportWithRelations extends Report {
  unit: {
    serialNumber: string;
    province: string;
    regency: string;
  };
  user: {
    name: string;
    email: string;
  };
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
  totalUnits: number;
  operationalUnits: number;
  maintenanceNeeded: number;
  offlineUnits: number;
  unverifiedUnits: number;
  totalReports: number;
  reportsThisMonth: number;
  reportsToday: number;
}

export interface ProvinceStats {
  province: string;
  totalUnits: number;
  operational: number;
  maintenanceNeeded: number;
  offline: number;
  unverified: number;
  totalReports: number;
}

// ============================================
// Map Types
// ============================================

export interface MapPoint {
  id: string;
  serialNumber: string;
  latitude: number;
  longitude: number;
  province: string;
  regency: string;
  lastStatus: UnitStatus;
  lastReport?: {
    id: string;
    imageUrl: string;
    batteryVoltage: number;
    createdAt: Date;
    user: string;
  };
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapCluster {
  province: string;
  latitude: number;
  longitude: number;
  count: number;
  statusBreakdown: {
    operational: number;
    maintenanceNeeded: number;
    offline: number;
    unverified: number;
  };
}

// ============================================
// Form Input Types
// ============================================

export interface SubmitReportInput {
  unitId: string;
  latitude: number;
  longitude: number;
  batteryVoltage: number;
  notes?: string;
  image: File;
}

export interface CreatePjutsUnitInput {
  serialNumber: string;
  latitude: number;
  longitude: number;
  province: string;
  regency: string;
  district?: string;
  village?: string;
  address?: string;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  role?: Role;
}

// ============================================
// Filter Types
// ============================================

export interface ReportFilters {
  unitId?: string;
  province?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface UnitFilters {
  province?: string;
  status?: UnitStatus;
  search?: string;
  page?: number;
  limit?: number;
}

