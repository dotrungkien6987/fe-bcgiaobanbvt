/**
 * ChamDiemKPIResponsive - Responsive wrapper for KPI scoring views
 *
 * Automatically switches between desktop and mobile layouts based on screen size:
 * - Desktop (>=md breakpoint): Full-featured layout with sidebar
 * - Mobile (<md breakpoint): Tab-based compact layout with sticky elements
 *
 * @component
 * @example
 * // Usage in routes
 * <Route path="/kpi/cham-diem/:nhanVienId" element={<ChamDiemKPIResponsive />} />
 *
 * URL Pattern:
 * /quanlycongviec/kpi/cham-diem/:nhanVienId?chuky=:chuKyId&readonly=:boolean
 *
 * Query Params:
 * - chuky: ChuKyDanhGia ID (required)
 * - readonly: View-only mode (optional, default: false)
 */
import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import ChamDiemKPIPage from "./ChamDiemKPIPage";
import ChamDiemKPIMobile from "./ChamDiemKPIMobile";

function ChamDiemKPIResponsive() {
  const theme = useTheme();
  // Breakpoint: md (900px by default in MUI)
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Switch between mobile and desktop components based on screen size
  return isMobile ? <ChamDiemKPIMobile /> : <ChamDiemKPIPage />;
}

export default ChamDiemKPIResponsive;
