/**
 * Utility functions for converting relative file URLs to absolute URLs
 */

/**
 * Converts a relative thumbnail URL to an absolute URL
 * @param {string} thumbUrl - Relative URL from backend (e.g., '/api/workmanagement/files/:id/thumb')
 * @returns {string} Absolute URL with backend base URL
 */
export function getThumbUrl(thumbUrl) {
  if (!thumbUrl) return "";

  // If already absolute URL, return as is
  if (thumbUrl.startsWith("http://") || thumbUrl.startsWith("https://")) {
    return thumbUrl;
  }

  // Get base URL from environment variable
  const baseUrl =
    process.env.REACT_APP_BACKEND_API || "http://localhost:8020/api";

  // Remove '/api' suffix from base URL if present
  const baseOrigin = baseUrl.replace(/\/api\/?$/, "");

  // Ensure thumbUrl starts with '/'
  const normalizedUrl = thumbUrl.startsWith("/") ? thumbUrl : `/${thumbUrl}`;

  return `${baseOrigin}${normalizedUrl}`;
}
