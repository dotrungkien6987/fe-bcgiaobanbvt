/**
 * useMobileLayout Hook
 *
 * Centralized hook for detecting mobile devices and determining layout behavior
 *
 * Features:
 * - Mobile device detection via useMediaQuery
 * - Theme-aware breakpoint logic
 * - PWA feature flag awareness
 * - Bottom navigation visibility logic
 * - Drawer behavior control
 *
 * Usage:
 * ```javascript
 * const { isMobile, showBottomNav, showDrawer } = useMobileLayout();
 * ```
 *
 * @returns {Object} Layout configuration
 * @returns {boolean} isMobile - Device is mobile (< md breakpoint)
 * @returns {boolean} isTablet - Device is tablet (md to lg)
 * @returns {boolean} isDesktop - Device is desktop (>= lg)
 * @returns {boolean} showBottomNav - Should show mobile bottom navigation
 * @returns {boolean} showDrawer - Should show sidebar drawer
 * @returns {string} deviceType - 'mobile' | 'tablet' | 'desktop'
 */

import { useMediaQuery, useTheme } from "@mui/material";
import { useFeatureFlags } from "contexts/FeatureFlagContext";

/**
 * Mobile layout detection hook
 */
function useMobileLayout() {
  const theme = useTheme();
  const { enablePWA, enableMobileBottomNav } = useFeatureFlags();

  // Breakpoint detection
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // < 900px
  const isTablet = useMediaQuery(theme.breakpoints.between("md", "lg")); // 900-1200px
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg")); // >= 1200px

  // Device type classification
  const deviceType = isMobile ? "mobile" : isTablet ? "tablet" : "desktop";

  // Bottom navigation visibility logic
  // Show when:
  // 1. PWA feature is enabled
  // 2. Mobile bottom nav feature is enabled
  // 3. Device is mobile
  const showBottomNav = enablePWA && enableMobileBottomNav && isMobile;

  // Drawer visibility logic
  // Show sidebar drawer when:
  // 1. NOT on mobile (tablet/desktop always show drawer)
  // 2. OR mobile but bottom nav is disabled (fallback to drawer)
  const showDrawer = !isMobile || !showBottomNav;

  return {
    // Device detection
    isMobile,
    isTablet,
    isDesktop,
    deviceType,

    // Layout behavior
    showBottomNav,
    showDrawer,

    // Breakpoint helpers (direct theme access)
    downSM: useMediaQuery(theme.breakpoints.down("sm")), // < 600px
    downMD: useMediaQuery(theme.breakpoints.down("md")), // < 900px
    downLG: useMediaQuery(theme.breakpoints.down("lg")), // < 1200px
    upMD: useMediaQuery(theme.breakpoints.up("md")), // >= 900px
    upLG: useMediaQuery(theme.breakpoints.up("lg")), // >= 1200px
  };
}

export default useMobileLayout;
