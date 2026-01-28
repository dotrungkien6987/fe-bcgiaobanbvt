import { useMemo } from "react";
import { BASE_URL } from "../app/config";

/**
 * Hook để detect environment (DEV/STAGING/PROD) dựa vào BASE_URL
 * Tự động nhận diện, không cần config thêm .env
 *
 * @returns {Object} Environment info
 * - env: "DEV" | "STAGING" | "PROD"
 * - label: Display label
 * - color: MUI color ("success" | "warning" | "error")
 * - icon: Emoji icon
 * - isProduction: boolean
 * - isDevelopment: boolean
 * - shouldWarn: boolean - Có nên hiển thị warning không
 * - baseUrl: URL đang sử dụng
 */
export const useEnvironment = () => {
  return useMemo(() => {
    const url = (BASE_URL || "").toLowerCase();

    // DEV Pattern 1: localhost hoặc 127.0.0.1
    if (url.includes("localhost") || url.includes("127.0.0.1")) {
      return {
        env: "DEV",
        label: "DEV Server",
        color: "success",
        icon: "🟢",
        isProduction: false,
        isDevelopment: true,
        shouldWarn: false,
        baseUrl: BASE_URL,
      };
    }

    // DEV Pattern 2: IP nội bộ (Private network)
    // 192.168.x.x, 10.x.x.x, 172.16-31.x.x
    const privateIpPatterns = [
      /192\.168\.\d{1,3}\.\d{1,3}/, // 192.168.0.0 - 192.168.255.255
      /10\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // 10.0.0.0 - 10.255.255.255
      /172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}/, // 172.16.0.0 - 172.31.255.255
    ];
    if (privateIpPatterns.some((pattern) => pattern.test(url))) {
      return {
        env: "DEV",
        label: "DEV Server (Local Network)",
        color: "success",
        icon: "🟢",
        isProduction: false,
        isDevelopment: true,
        shouldWarn: false,
        baseUrl: BASE_URL,
      };
    }

    // DEV Pattern 3: Development ports (3000, 5000, 8000, 8020, 8080, 9000)
    const devPorts = [":3000", ":5000", ":8000", ":8020", ":8080", ":9000"];
    if (devPorts.some((port) => url.includes(port))) {
      return {
        env: "DEV",
        label: "DEV Server",
        color: "success",
        icon: "🟢",
        isProduction: false,
        isDevelopment: true,
        shouldWarn: false,
        baseUrl: BASE_URL,
      };
    }

    // DEV Pattern 4: Có chữ "dev" trong domain
    if (
      url.includes("dev.") ||
      url.includes("-dev.") ||
      url.includes("development")
    ) {
      return {
        env: "DEV",
        label: "DEV Server",
        color: "success",
        icon: "🟢",
        isProduction: false,
        isDevelopment: true,
        shouldWarn: false,
        baseUrl: BASE_URL,
      };
    }

    // STAGING: có chữ "staging" hoặc "stg" hoặc "test"
    if (
      url.includes("staging") ||
      url.includes("stg.") ||
      url.includes("-stg.") ||
      url.includes("test.")
    ) {
      return {
        env: "STAGING",
        label: "STAGING",
        color: "warning",
        icon: "🟡",
        isProduction: false,
        isDevelopment: false,
        shouldWarn: false,
        baseUrl: BASE_URL,
      };
    }

    // PRODUCTION: mặc định (an toàn nhất)
    // Thường là domain chính với HTTPS và không có port đặc biệt
    return {
      env: "PROD",
      label: "PRODUCTION",
      color: "error",
      icon: "🔴",
      isProduction: true,
      isDevelopment: false,
      shouldWarn: true,
      baseUrl: BASE_URL,
    };
  }, []);
};

/**
 * Utility function (không dùng hook) cho các trường hợp cần gọi ngoài component
 */
export const getEnvironment = () => {
  const url = (BASE_URL || "").toLowerCase();

  // DEV: localhost hoặc 127.0.0.1
  if (url.includes("localhost") || url.includes("127.0.0.1")) {
    return {
      env: "DEV",
      label: "DEV Server",
      color: "success",
      icon: "🟢",
      isProduction: false,
      isDevelopment: true,
      shouldWarn: false,
      baseUrl: BASE_URL,
    };
  }

  // DEV: IP nội bộ (Private network)
  const privateIpPatterns = [
    /192\.168\.\d{1,3}\.\d{1,3}/,
    /10\.\d{1,3}\.\d{1,3}\.\d{1,3}/,
    /172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}/,
  ];
  if (privateIpPatterns.some((pattern) => pattern.test(url))) {
    return {
      env: "DEV",
      label: "DEV Server (Local Network)",
      color: "success",
      icon: "🟢",
      isProduction: false,
      isDevelopment: true,
      shouldWarn: false,
      baseUrl: BASE_URL,
    };
  }

  // DEV: Development ports
  const devPorts = [":3000", ":5000", ":8000", ":8020", ":8080", ":9000"];
  if (devPorts.some((port) => url.includes(port))) {
    return {
      env: "DEV",
      label: "DEV Server",
      color: "success",
      icon: "🟢",
      isProduction: false,
      isDevelopment: true,
      shouldWarn: false,
      baseUrl: BASE_URL,
    };
  }

  // DEV: Có chữ "dev" trong domain
  if (url.includes("dev.") || url.includes("-dev.")) {
    return {
      env: "DEV",
      label: "DEV Server",
      color: "success",
      icon: "🟢",
      isProduction: false,
      isDevelopment: true,
      shouldWarn: false,
      baseUrl: BASE_URL,
    };
  }

  // STAGING
  if (
    url.includes("staging") ||
    url.includes("stg.") ||
    url.includes("-stg.")
  ) {
    return {
      env: "STAGING",
      label: "STAGING",
      color: "warning",
      icon: "🟡",
      isProduction: false,
      isDevelopment: false,
      shouldWarn: false,
      baseUrl: BASE_URL,
    };
  }

  // PRODUCTION (mặc định)
  return {
    env: "PROD",
    label: "PRODUCTION",
    color: "error",
    icon: "🔴",
    isProduction: true,
    isDevelopment: false,
    shouldWarn: true,
    baseUrl: BASE_URL,
  };
};

export default useEnvironment;
