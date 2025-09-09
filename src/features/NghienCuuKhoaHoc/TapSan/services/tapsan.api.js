import api from "app/apiService";

// Use relative path; axios baseURL should already point to /api
const base = "tapsan";

export async function createTapSan(payload) {
  const res = await api.post(base, payload);
  return res.data?.data;
}

export async function listTapSan(params = {}) {
  const res = await api.get(base, { params });
  return res.data?.data;
}

export async function getTapSanById(id) {
  const res = await api.get(`${base}/${id}`);
  return res.data?.data;
}

export async function updateTapSan(id, payload) {
  const res = await api.patch(`${base}/${id}`, payload);
  return res.data?.data;
}

export async function deleteTapSan(id) {
  const res = await api.delete(`${base}/${id}`);
  return res.data?.data;
}

export async function restoreTapSan(id) {
  const res = await api.patch(`${base}/${id}/restore`);
  return res.data?.data;
}
