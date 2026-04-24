const DOMAIN_PREFIXES = {
  congviec: [
    "/quanlycongviec/cong-viec-dashboard",
    "/quanlycongviec/cong-viec-cua-toi",
    "/quanlycongviec/viec-toi-giao",
    "/quanlycongviec/lich-su-hoan-thanh",
    "/quanlycongviec/congviec",
    "/quanlycongviec/nhomviec-user",
  ],
  yeucau: [
    "/yeu-cau-dashboard",
    "/quanlycongviec/yeu-cau-dashboard",
    "/quanlycongviec/yeucau",
  ],
  kpi: [
    "/kpi-dashboard",
    "/quanlycongviec/kpi",
    "/quanlycongviec/chu-ky",
    "/quanlycongviec/tieu-chi",
    "/quanlycongviec/tieu-chi-chu-ky",
    "/quanlycongviec/nhiem-vu-thuong-quy",
    "/quanlycongviec/nhiem-vu-cua-toi",
    "/quanlycongviec/giao-nhiem-vu",
    "/quanlycongviec/nhiemvu-thuongquy",
    "/quanlycongviec/giao-nhiemvu",
    "/quanlycongviec/quan-ly-nhan-vien",
  ],
  notifications: [
    "/quanlycongviec/thong-bao",
    "/quanlycongviec/cai-dat/thong-bao",
    "/quanlycongviec/cai-dat-thong-bao",
    "/admin/notification-templates",
    "/admin/notification-types",
  ],
};

const LEGACY_WORK_HUB_PATHS = ["/quanlycongviec"];

const normalizeDomain = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, "-");

  switch (normalized) {
    case "yeu-cau":
    case "yeucau":
      return "yeucau";
    case "cong-viec":
    case "congviec":
      return "congviec";
    case "kpi":
      return "kpi";
    case "thong-bao":
    case "thongbao":
    case "notification":
    case "notifications":
      return "notifications";
    case "*":
    case "all":
      return "*";
    default:
      return normalized;
  }
};

const getManagedDomains = () => {
  const rawValue = process.env.REACT_APP_V2_OWNED_DOMAINS || "";

  return new Set(rawValue.split(",").map(normalizeDomain).filter(Boolean));
};

export const getLegacyAccessMode = () => {
  const rawMode = String(process.env.REACT_APP_V2_ACCESS_MODE || "readonly")
    .trim()
    .toLowerCase();

  return rawMode === "off" ? "off" : "readonly";
};

export const isV2OwnedDomain = (domain) => {
  const normalizedDomain = normalizeDomain(domain);

  if (!normalizedDomain) {
    return false;
  }

  const managedDomains = getManagedDomains();
  return managedDomains.has("*") || managedDomains.has(normalizedDomain);
};

export const shouldHideLegacyDomain = (domain) => {
  return isV2OwnedDomain(domain) && getLegacyAccessMode() === "off";
};

export const shouldRedirectLegacyDomain = shouldHideLegacyDomain;

export const shouldRedirectLegacyDomains = (domains) => {
  const domainList = (Array.isArray(domains) ? domains : [domains])
    .map(normalizeDomain)
    .filter(Boolean);

  if (domainList.length === 0 || getLegacyAccessMode() !== "off") {
    return false;
  }

  return domainList.every((domain) => isV2OwnedDomain(domain));
};

export const getLegacyDomainForPath = (path) => {
  const normalizedPath = String(path || "").trim();

  if (!normalizedPath) {
    return null;
  }

  return (
    Object.entries(DOMAIN_PREFIXES).find(([, prefixes]) =>
      prefixes.some((prefix) => normalizedPath.startsWith(prefix)),
    )?.[0] || null
  );
};

export const isLegacyPathHidden = (path) => {
  const domain = getLegacyDomainForPath(path);
  return domain ? shouldHideLegacyDomain(domain) : false;
};

export const shouldHideLegacyPath = (path) => {
  const normalizedPath = String(path || "")
    .trim()
    .replace(/\/+$/, "");

  if (!normalizedPath) {
    return false;
  }

  if (LEGACY_WORK_HUB_PATHS.includes(normalizedPath)) {
    return shouldRedirectLegacyDomains([
      "congviec",
      "yeucau",
      "kpi",
      "notifications",
    ]);
  }

  return isLegacyPathHidden(normalizedPath);
};

export const getLegacySafeWorkRootPath = () =>
  shouldHideLegacyPath("/quanlycongviec") ? "/" : "/quanlycongviec";
