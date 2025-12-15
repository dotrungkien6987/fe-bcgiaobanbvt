/**
 * useYeuCauTabs - Hook để sử dụng Tab Configuration
 *
 * Cung cấp:
 * - Danh sách tabs cho page hiện tại
 * - Build API params tự động
 * - Tab info (label, icon, description, ...)
 * - Actions available cho tab/item
 */
import { useMemo, useCallback } from "react";
import useAuth from "hooks/useAuth";
import {
  ALL_YEU_CAU_CONFIGS,
  buildTabParams,
  getTabConfig,
  getDefaultTab,
  isValidTab,
} from "../config/yeuCauTabConfig";

/**
 * Main hook để quản lý tabs cho một page
 *
 * @param {string} pageKey - Key của page (YEU_CAU_TOI_GUI, YEU_CAU_TOI_XU_LY, ...)
 * @param {string} urlTab - Tab từ URL search params (có thể null)
 *
 * @example
 * const {
 *   tabs,           // Array các tab config
 *   activeTabInfo,  // Config của tab đang active
 *   apiParams,      // Params để gọi API
 *   pageConfig,     // Config của cả page
 *   needsRedirect,  // Flag để page biết cần redirect
 * } = useYeuCauTabs("YEU_CAU_TOI_GUI", urlTab);
 *
 * // Gọi API:
 * dispatch(getYeuCauList(apiParams));
 */
export function useYeuCauTabs(pageKey, urlTab) {
  const { user } = useAuth();

  // Page config
  const pageConfig = useMemo(() => {
    return ALL_YEU_CAU_CONFIGS[pageKey] || null;
  }, [pageKey]);

  // Default tab cho page này
  const defaultTab = useMemo(() => {
    return getDefaultTab(pageKey);
  }, [pageKey]);

  // Validate tab - nếu urlTab không valid thì dùng default
  const activeTab = useMemo(() => {
    if (!pageConfig) return null;
    if (urlTab && isValidTab(pageKey, urlTab)) {
      return urlTab;
    }
    return defaultTab;
  }, [pageKey, pageConfig, urlTab, defaultTab]);

  // Check nếu cần redirect (urlTab khác với activeTab)
  const needsRedirect = useMemo(() => {
    if (!pageConfig) return false;
    return !urlTab || urlTab !== activeTab;
  }, [pageConfig, urlTab, activeTab]);

  // Tabs array
  const tabs = useMemo(() => {
    return pageConfig?.tabs || [];
  }, [pageConfig]);

  // Active tab info
  const activeTabInfo = useMemo(() => {
    if (!activeTab) return null;
    return getTabConfig(pageKey, activeTab);
  }, [pageKey, activeTab]);

  // API params cho tab hiện tại
  const apiParams = useMemo(() => {
    if (!activeTab || !user?.NhanVienID) return null;
    return buildTabParams(pageKey, activeTab, user);
  }, [pageKey, activeTab, user]);

  // Function to get params for a specific tab (for prefetching, etc.)
  const getParamsForTab = useCallback(
    (tabKey, overrides = {}) => {
      if (!user?.NhanVienID) return null;
      return buildTabParams(pageKey, tabKey, user, overrides);
    },
    [pageKey, user]
  );

  // Check if item can perform action
  const canPerformAction = useCallback(
    (action, item) => {
      if (!pageConfig?.actions?.[action]) return false;

      const actionFn = pageConfig.actions[action];
      if (typeof actionFn === "function") {
        return actionFn(item, user?.NhanVienID);
      }
      return actionFn;
    },
    [pageConfig, user?.NhanVienID]
  );

  return {
    // Page level
    pageConfig,
    pageTitle: pageConfig?.title,
    pageIcon: pageConfig?.icon,
    pageDescription: pageConfig?.description,

    // Tabs
    tabs,
    activeTab,
    activeTabInfo,
    defaultTab,
    needsRedirect,

    // API
    apiParams,
    getParamsForTab,

    // Actions
    canPerformAction,

    // Helpers
    isLoaded: !!pageConfig && !!user?.NhanVienID,
  };
}

/**
 * Hook đơn giản để lấy API params cho một tab
 * Dùng khi chỉ cần params, không cần full tab management
 *
 * @example
 * const params = useYeuCauApiParams("YEU_CAU_TOI_XU_LY", "cho-tiep-nhan");
 * useEffect(() => {
 *   if (params) dispatch(getYeuCauList(params));
 * }, [params]);
 */
export function useYeuCauApiParams(pageKey, tabKey, overrides = {}) {
  const { user } = useAuth();

  return useMemo(() => {
    if (!user?.NhanVienID) return null;
    return buildTabParams(pageKey, tabKey, user, overrides);
  }, [pageKey, tabKey, user, overrides]);
}

/**
 * Hook để lấy tất cả page configs
 * Dùng cho menu navigation, breadcrumbs, etc.
 */
export function useAllYeuCauPages() {
  return useMemo(() => {
    return Object.values(ALL_YEU_CAU_CONFIGS).map((config) => ({
      key: config.pageKey,
      title: config.title,
      icon: config.icon,
      route: config.route,
      description: config.description,
      requireRole: config.requireRole,
    }));
  }, []);
}

export default useYeuCauTabs;
