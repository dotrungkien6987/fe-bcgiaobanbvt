import api from "app/apiService";

// Lấy danh sách bài báo theo TapSan
export async function getBaiBaoByTapSan(tapSanId, params = {}) {
  const {
    page = 1,
    limit = 20,
    sort = "NgayTao",
    order = "desc",
    search = "",
    trangThai = "",
    tacGia = "",
  } = params;

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sort,
    order,
    ...(search && { search }),
    ...(trangThai && { trangThai }),
    ...(tacGia && { tacGia }),
  });

  const response = await api.get(`/tapsan/${tapSanId}/baibao?${queryParams}`);
  return response.data?.data;
}

// Lấy chi tiết bài báo
export async function getBaiBaoById(id) {
  const response = await api.get(`/tapsan/baibao/${id}`);
  return response.data?.data;
}

// Tạo bài báo mới
export async function createBaiBao(tapSanId, data) {
  const response = await api.post(`/tapsan/${tapSanId}/baibao`, data);
  return response.data?.data;
}

// Cập nhật bài báo
export async function updateBaiBao(id, data) {
  const response = await api.put(`/tapsan/baibao/${id}`, data);
  return response.data?.data;
}

// Xóa bài báo
export async function deleteBaiBao(id) {
  const response = await api.delete(`/tapsan/baibao/${id}`);
  return response.data;
}

// Lấy thống kê bài báo theo trạng thái
export async function getBaiBaoStats(tapSanId) {
  const response = await api.get(`/tapsan/${tapSanId}/baibao/stats`);
  return response.data?.data;
}

// Constants cho trạng thái bài báo
export const TRANG_THAI_BAI_BAO = {
  DU_THAO: "Dự thảo",
  DANG_XEM_XET: "Đang xem xét",
  DUOC_DUYET: "Được duyệt",
  TU_CHOI: "Từ chối",
  DA_XUAT_BAN: "Đã xuất bản",
};

export const TRANG_THAI_OPTIONS = [
  { value: TRANG_THAI_BAI_BAO.DU_THAO, label: "Dự thảo", color: "default" },
  {
    value: TRANG_THAI_BAI_BAO.DANG_XEM_XET,
    label: "Đang xem xét",
    color: "warning",
  },
  {
    value: TRANG_THAI_BAI_BAO.DUOC_DUYET,
    label: "Được duyệt",
    color: "success",
  },
  { value: TRANG_THAI_BAI_BAO.TU_CHOI, label: "Từ chối", color: "error" },
  {
    value: TRANG_THAI_BAI_BAO.DA_XUAT_BAN,
    label: "Đã xuất bản",
    color: "primary",
  },
];

// Helper function để lấy màu của trạng thái
export function getTrangThaiColor(trangThai) {
  const option = TRANG_THAI_OPTIONS.find((opt) => opt.value === trangThai);
  return option?.color || "default";
}

// Helper function để lấy label của trạng thái
export function getTrangThaiLabel(trangThai) {
  const option = TRANG_THAI_OPTIONS.find((opt) => opt.value === trangThai);
  return option?.label || trangThai;
}
