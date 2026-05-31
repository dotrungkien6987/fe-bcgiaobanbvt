import api from "app/apiService";

export async function uploadFiles(
  ownerType,
  ownerId,
  field,
  files,
  extra = {},
) {
  const { onUploadProgress, ...formExtra } = extra || {};
  const form = new FormData();
  [...files].forEach((f) => form.append("files", f));
  Object.entries(formExtra).forEach(([k, v]) => form.append(k, v));
  // Use relative path; axios baseURL points to /api
  const url = `attachments/${ownerType}/${ownerId}/${field}/files`;
  const res = await api.post(url, form, {
    onUploadProgress,
  });
  return res.data?.data;
}

export async function listFiles(ownerType, ownerId, field, params = {}) {
  const url = `attachments/${ownerType}/${ownerId}/${field}/files`;
  const res = await api.get(url, { params });
  return res.data?.data;
}

export async function countFiles(ownerType, ownerId, field) {
  const url = `attachments/${ownerType}/${ownerId}/${field}/files/count`;
  const res = await api.get(url);
  return res.data?.data?.total ?? 0;
}

export async function deleteFile(fileId) {
  const res = await api.delete(`attachments/files/${fileId}`);
  return res.data?.data;
}

export function inlineUrl(file) {
  if (!file?._id) return "#";
  return (
    file?.inlineUrl || buildAbsoluteUrl(`attachments/files/${file._id}/inline`)
  );
}

export function downloadUrl(file) {
  if (!file?._id) return "#";
  return (
    file?.downloadUrl ||
    buildAbsoluteUrl(`attachments/files/${file._id}/download`)
  );
}

// Build absolute URL from axios baseURL and provided path
function buildAbsoluteUrl(path) {
  const base = api?.defaults?.baseURL || "/api";
  const normalized = [
    String(base).replace(/\/+$/, ""),
    String(path).replace(/^\/+/, ""),
  ].join("/");

  console.log(
    "Building URL - base:",
    base,
    "path:",
    path,
    "normalized:",
    normalized,
  );

  try {
    // If base is relative (e.g., "/api"), resolve against current origin
    const fullUrl = new URL(normalized, window.location.origin).href;
    console.log("Final URL:", fullUrl);
    return fullUrl;
  } catch (e) {
    console.error("URL build error:", e);
    return normalized;
  }
}
