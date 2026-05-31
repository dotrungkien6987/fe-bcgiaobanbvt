import api from "app/apiService";

export async function fetchTapSanNhanVienOptions(params = {}) {
  const response = await api.get("/tapsan/nhanvien-options", { params });
  return response.data?.data?.items || [];
}
