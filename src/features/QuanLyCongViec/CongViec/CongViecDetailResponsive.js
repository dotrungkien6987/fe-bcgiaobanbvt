import React from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import CongViecDetailPageNew from "./CongViecDetailPageNew";
import CongViecDetailMobile from "./CongViecDetailMobile";

/**
 * CongViecDetailResponsive - Responsive wrapper for task detail views
 *
 * Automatically switches between desktop and mobile layouts based on screen size:
 * - Desktop (>=md breakpoint): Full-featured layout with sidebar
 * - Mobile (<md breakpoint): Tab-based compact layout with sticky elements
 *
 * @component
 * @example
 * // Usage in routes
 * <Route path="/congviec/:id" element={<CongViecDetailResponsive />} />
 */
function CongViecDetailResponsive() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Switch between mobile and desktop components based on screen size
  // Breakpoint: md (900px by default in MUI)
  return isMobile ? <CongViecDetailMobile /> : <CongViecDetailPageNew />;
}

export default CongViecDetailResponsive;
