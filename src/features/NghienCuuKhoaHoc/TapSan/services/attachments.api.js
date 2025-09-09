import api from "app/apiService";

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
  // Use relative path; axios baseURL points to /api
  const url = `attachments/${ownerType}/${ownerId}/${field}/files`;
  const res = await api.post(url, form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: extra.onUploadProgress,
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
  return file?.inlineUrl || `attachments/files/${file?._id}/inline`;
}

export function downloadUrl(file) {
  return file?.downloadUrl || `attachments/files/${file?._id}/download`;
}
