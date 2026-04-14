// Quy ước nghiệp vụ của Bệnh viện BVT cho mã CSKCB ban đầu.
export const MACSKCBBD_DUNG_TUYEN = "25001";

export function normalizeMacskcbbd(value) {
  return String(value || "").trim();
}

export function isDungTuyenMacskcbbd(value) {
  return normalizeMacskcbbd(value) === MACSKCBBD_DUNG_TUYEN;
}
