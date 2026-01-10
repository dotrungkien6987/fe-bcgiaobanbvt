/**
 * Feature Flag Context
 *
 * Provides feature flag access throughout the application via React Context
 *
 * Usage:
 * ```javascript
 * import { useFeatureFlags } from 'contexts/FeatureFlagContext';
 *
 * function MyComponent() {
 *   const { enablePWA, enableMobileBottomNav } = useFeatureFlags();
 *
 *   return enableMobileBottomNav ? <MobileNav /> : <DesktopNav />;
 * }
 * ```
 */

import React, { createContext, useContext } from "react";
import { FEATURE_FLAGS } from "config/featureFlags";

// Create context
const FeatureFlagContext = createContext(FEATURE_FLAGS);

/**
 * Feature Flag Provider Component
 * Wraps app to provide feature flag access
 */
export function FeatureFlagProvider({ children }) {
  return (
    <FeatureFlagContext.Provider value={FEATURE_FLAGS}>
      {children}
    </FeatureFlagContext.Provider>
  );
}

/**
 * Hook to access feature flags
 * @returns {Object} Feature flags object
 */
export function useFeatureFlags() {
  const context = useContext(FeatureFlagContext);
  if (context === undefined) {
    throw new Error("useFeatureFlags must be used within FeatureFlagProvider");
  }
  return context;
}

export default FeatureFlagContext;
