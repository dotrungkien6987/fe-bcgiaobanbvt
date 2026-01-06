/**
 * @fileoverview Utility functions for number formatting
 * @module utils/formatNumber
 */

/**
 * Format number to Vietnamese currency (VND)
 * @param {number} value - Number to format
 * @returns {string} Formatted currency string
 * @example
 * formatCurrency(1000000) // "1.000.000 đ"
 * formatCurrency(0) // "0 đ"
 */
export function formatCurrency(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0 đ";
  }

  const number = Number(value);
  return `${number.toLocaleString("vi-VN")} đ`;
}

/**
 * Format number with thousands separator (Vietnamese style)
 * @param {number} value - Number to format
 * @returns {string} Formatted number string
 * @example
 * formatNumber(1000000) // "1.000.000"
 */
export function formatNumber(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  const number = Number(value);
  return number.toLocaleString("vi-VN");
}

/**
 * Format number to percentage
 * @param {number} value - Number to format (0-100)
 * @param {number} decimals - Number of decimal places (default 2)
 * @returns {string} Formatted percentage string
 * @example
 * formatPercent(85.5678, 2) // "85.57%"
 */
export function formatPercent(value, decimals = 2) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0%";
  }

  const number = Number(value);
  return `${number.toFixed(decimals)}%`;
}

/**
 * Format number to compact notation (K, M, B)
 * @param {number} value - Number to format
 * @returns {string} Formatted compact string
 * @example
 * formatCompact(1500) // "1.5K"
 * formatCompact(1000000) // "1M"
 */
export function formatCompact(value) {
  if (value === null || value === undefined || isNaN(value)) {
    return "0";
  }

  const number = Number(value);

  if (number >= 1e9) {
    return `${(number / 1e9).toFixed(1)}B`;
  }
  if (number >= 1e6) {
    return `${(number / 1e6).toFixed(1)}M`;
  }
  if (number >= 1e3) {
    return `${(number / 1e3).toFixed(1)}K`;
  }

  return number.toString();
}
