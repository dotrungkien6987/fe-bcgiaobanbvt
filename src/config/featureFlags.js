/**
 * Feature Flags Configuration
 *
 * Centralized feature toggle system for progressive rollout and A/B testing
 *
 * Usage:
 * ```javascript
 * import { FEATURE_FLAGS } from 'config/featureFlags';
 *
 * if (FEATURE_FLAGS.enablePWA) {
 *   // PWA-specific code
 * }
 * ```
 *
 * Environment Variables (optional override):
 * - REACT_APP_ENABLE_PWA=true/false
 * - REACT_APP_ENABLE_MOBILE_BOTTOM_NAV=true/false
 * - REACT_APP_ENABLE_OFFLINE_MODE=true/false
 */

/**
 * Parse environment variable as boolean
 * @param {string} envVar - Environment variable name
 * @param {boolean} defaultValue - Default value if not set
 * @returns {boolean}
 */
const parseBooleanEnv = (envVar, defaultValue) => {
  const value = process.env[envVar];
  if (value === undefined) return defaultValue;
  return value === "true" || value === "1";
};

/**
 * Feature flag definitions
 */
export const FEATURE_FLAGS = {
  // ==================== PWA Features ====================

  /**
   * Master PWA toggle
   * Enables Progressive Web App features (install prompt, offline, etc.)
   * Default: true (enabled for gradual rollout)
   */
  enablePWA: parseBooleanEnv("REACT_APP_ENABLE_PWA", true),

  /**
   * Mobile bottom navigation
   * Shows mobile-optimized bottom navigation bar on small screens
   * Requires: enablePWA = true
   * Default: true
   */
  enableMobileBottomNav: parseBooleanEnv(
    "REACT_APP_ENABLE_MOBILE_BOTTOM_NAV",
    true
  ),

  /**
   * Offline mode support
   * Enables service worker caching and offline functionality
   * Requires: enablePWA = true
   * Default: false (not implemented yet)
   */
  enableOfflineMode: parseBooleanEnv("REACT_APP_ENABLE_OFFLINE_MODE", false),

  /**
   * Push notifications
   * Enables browser push notification support
   * Requires: enablePWA = true
   * Default: false (not implemented yet)
   */
  enablePushNotifications: parseBooleanEnv(
    "REACT_APP_ENABLE_PUSH_NOTIFICATIONS",
    false
  ),

  // ==================== UX Features ====================

  /**
   * Compact mode for mobile
   * Reduces padding/spacing on mobile for more content density
   * Default: true
   */
  enableCompactMode: parseBooleanEnv("REACT_APP_ENABLE_COMPACT_MODE", true),

  /**
   * Gesture navigation
   * Swipe gestures for navigation (swipe right to go back, etc.)
   * Default: false (Phase 4 feature)
   */
  enableGestureNavigation: parseBooleanEnv(
    "REACT_APP_ENABLE_GESTURE_NAV",
    false
  ),

  /**
   * Splash screen on app load
   * Shows animated splash screen during initial app load
   * Default: true (Phase 3A feature)
   */
  enableSplashScreen: parseBooleanEnv("REACT_APP_ENABLE_SPLASH_SCREEN", true),

  /**
   * Dark mode toggle
   * Allow users to switch between light/dark themes
   * Default: true
   */
  enableDarkMode: parseBooleanEnv("REACT_APP_ENABLE_DARK_MODE", true),

  // ==================== Performance Features ====================

  /**
   * Virtual scrolling for large lists
   * Use react-window for performance on mobile
   * Default: false (Phase 5 feature)
   */
  enableVirtualScrolling: parseBooleanEnv(
    "REACT_APP_ENABLE_VIRTUAL_SCROLL",
    false
  ),

  /**
   * Image lazy loading
   * Lazy load images for faster initial page load
   * Default: true
   */
  enableLazyLoading: parseBooleanEnv("REACT_APP_ENABLE_LAZY_LOADING", true),

  // ==================== Experimental Features ====================

  /**
   * New dashboard redesign
   * Enable Phase 2 dashboard with mobile-optimized cards
   * Default: false (Phase 2 in progress)
   */
  enableNewDashboard: parseBooleanEnv("REACT_APP_ENABLE_NEW_DASHBOARD", false),

  /**
   * Beta features
   * Enable experimental/unstable features for testing
   * Default: false
   */
  enableBetaFeatures: parseBooleanEnv("REACT_APP_ENABLE_BETA", false),
};

/**
 * Check if feature is enabled
 * @param {string} featureName - Name of feature flag
 * @returns {boolean}
 */
export const isFeatureEnabled = (featureName) => {
  return FEATURE_FLAGS[featureName] === true;
};

/**
 * Get all enabled features
 * @returns {string[]} Array of enabled feature names
 */
export const getEnabledFeatures = () => {
  return Object.keys(FEATURE_FLAGS).filter(
    (key) => FEATURE_FLAGS[key] === true
  );
};

/**
 * Feature flag status for debugging
 */
export const logFeatureFlags = () => {
  if (process.env.NODE_ENV === "development") {
    console.group("🚩 Feature Flags");
    Object.entries(FEATURE_FLAGS).forEach(([key, value]) => {
      console.log(`${value ? "✅" : "❌"} ${key}:`, value);
    });
    console.groupEnd();
  }
};

// Log flags on module load (development only)
if (process.env.NODE_ENV === "development") {
  logFeatureFlags();
}

export default FEATURE_FLAGS;
