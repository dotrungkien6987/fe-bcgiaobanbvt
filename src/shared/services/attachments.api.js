import api from "app/apiService";

function withField(ownerType, ownerId, field, tail) {
  const f = field || "file";
  return `attachments/${ownerType}/${ownerId}/${f}/${tail}`;
}

export async function uploadFiles(
  ownerType,
  ownerId,
  field,
  files,
  extra = {}
) {
  const form = new FormData();
  [...files].forEach((f) => form.append("files", f));
  Object.entries(extra || {}).forEach(([k, v]) => form.append(k, v));
  const url = withField(ownerType, ownerId, field, "files");
  const res = await api.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: extra.onUploadProgress,
  });
  return res.data?.data;
}

export async function listFiles(ownerType, ownerId, field, params = {}) {
  const url = withField(ownerType, ownerId, field, "files");
  const res = await api.get(url, { params });
  return res.data?.data;
}

export async function countFiles(ownerType, ownerId, field) {
  const url = withField(ownerType, ownerId, field, "files/count");
  const res = await api.get(url);
  return res.data?.data?.total ?? 0;
}

export async function deleteFile(fileId) {
  const res = await api.delete(`attachments/files/${fileId}`);
  return res.data?.data;
}

// Batch APIs
// body: { ownerType, field, ids: [] }
export async function batchCountAttachments(ownerType, field, ids = []) {
  if (!ids.length) return {};
  const res = await api.post("attachments/batch-count", {
    ownerType,
    field,
    ids,
  });
  return res.data?.data || {};
}

// body: { ownerType, field, ids: [], limit }
export async function batchPreviewAttachments(
  ownerType,
  field,
  ids = [],
  limit = 3
) {
  if (!ids.length) return {};
  const res = await api.post("attachments/batch-preview", {
    ownerType,
    field,
    ids,
    limit,
  });
  return res.data?.data || {};
}

export function inlineUrl(file) {
  if (!file?._id) return "#";
  return buildAbsoluteUrl(`attachments/files/${file._id}/inline`);
}

export function downloadUrl(file) {
  if (!file?._id) return "#";
  return buildAbsoluteUrl(`attachments/files/${file._id}/download`);
}

function buildAbsoluteUrl(path) {
  const base = api?.defaults?.baseURL || "/api";
  const normalized = [
    String(base).replace(/\/+$/, ""),
    String(path).replace(/^\/+/, ""),
  ].join("/");
  try {
    return new URL(normalized, window.location.origin).href;
  } catch (e) {
    return normalized;
  }
}
