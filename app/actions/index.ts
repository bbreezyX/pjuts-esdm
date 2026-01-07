// Export all server actions from a single entry point

// Report Actions
export {
  submitReport,
  getReports,
  deleteReport,
  type ReportData,
} from "./reports";

// Dashboard Actions
export {
  getDashboardStats,
  getStatsByProvince,
  getRecentActivity,
  getMonthlyReportTrend,
  type DashboardStats,
  type ProvinceStats,
  type RecentActivity,
} from "./dashboard";

// Map Actions
export {
  getMapPoints,
  getMapPointsByStatus,
  getUnitDetail,
  getClusterData,
  type MapPoint,
} from "./map";

// Unit Actions
export {
  createPjutsUnit,
  getPjutsUnits,
  updatePjutsUnit,
  deletePjutsUnit,
  getProvinces,
  type PjutsUnitData,
} from "./units";

