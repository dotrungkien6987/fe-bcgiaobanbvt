// Nhóm mã cần hiển thị theo yêu cầu với màu sắc riêng biệt
export const GROUPS = {
  "Nhóm đề tài": {
    codes: ["NCKH011", "NCKH012", "NCKH013", "NCKH014"],
    color: "#1976d2",
    bgColor: "#e3f2fd",
    icon: "🎯",
    // Thêm bảng màu chi tiết cho từng mã - màu khác biệt lớn
    colorPalette: ["#1976d2", "#e91e63", "#9c27b0", "#00bcd4"],
  },
  "Nhóm Sáng kiến": {
    codes: ["NCKH015", "NCKH016", "NCKH017", "NCKH018"],
    color: "#388e3c",
    bgColor: "#e8f5e8",
    icon: "💡",
    colorPalette: ["#388e3c", "#ff9800", "#795548", "#607d8b"],
  },
  "Nhóm Đăng báo": {
    codes: ["NCKH02", "NCKH03"],
    color: "#f57c00",
    bgColor: "#fff3e0",
    icon: "📰",
    colorPalette: ["#f57c00", "#3f51b5"],
  },
  "Nhóm Khác": {
    codes: ["NCKH06", "NCKH07"],
    color: "#7b1fa2",
    bgColor: "#f3e5f5",
    icon: "📊",
    colorPalette: ["#7b1fa2", "#ff5722"],
  },
};

// Tạo bảng màu tổng quan cho tất cả mã
export const createOverviewColorPalette = () => {
  const colorMap = {};
  Object.values(GROUPS).forEach((group) => {
    group.codes.forEach((code, index) => {
      colorMap[code] = group.colorPalette[index] || group.color;
    });
  });
  return colorMap;
};

// pivot but force columns (mas) to include forceMas even if missing in data
export function pivotForce(data, forceMas = []) {
  const years = [...new Set(data.map((d) => d.year))].sort((a, b) => a - b);
  // include any year even if no data? if no years present, try to infer from data (empty)
  const masSet = new Set(data.map((d) => d.MaHinhThucCapNhat));
  (forceMas || []).forEach((m) => masSet.add(m));
  const mas = Array.from(masSet).sort((a, b) => a.localeCompare(b));
  const labels = Object.fromEntries(
    // prefer TenBenhVien, fallback Ten, then code
    data.map((d) => [
      d.MaHinhThucCapNhat,
      d.TenBenhVien || d.Ten || d.MaHinhThucCapNhat,
    ])
  );
  // ensure labels exist for forced mas
  forceMas.forEach((m) => {
    if (!labels[m]) labels[m] = m;
  });

  const rows = years.map((y) => {
    const row = { year: y };
    mas.forEach((m) => {
      row[m] =
        data.find((d) => d.year === y && d.MaHinhThucCapNhat === m)?.count || 0;
    });
    return row;
  });
  return { rows, mas, labels, years };
}
