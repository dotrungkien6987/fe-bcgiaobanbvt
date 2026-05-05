export const cc115DepartmentCodes = ["CC115", "TT115"];

export function isCC115DepartmentCode(maKhoa) {
  return cc115DepartmentCodes.includes((maKhoa || "").toUpperCase());
}
