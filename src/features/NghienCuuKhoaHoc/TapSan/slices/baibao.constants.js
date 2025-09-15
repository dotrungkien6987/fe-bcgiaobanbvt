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

export function getTrangThaiColor(trangThai) {
  const option = TRANG_THAI_OPTIONS.find((opt) => opt.value === trangThai);
  return option?.color || "default";
}

export function getTrangThaiLabel(trangThai) {
  const option = TRANG_THAI_OPTIONS.find((opt) => opt.value === trangThai);
  return option?.label || trangThai;
}
