// Sorting helpers
export function descendingComparator(a, b, orderBy) {
  const va = a?.[orderBy];
  const vb = b?.[orderBy];
  if (vb < va) return -1;
  if (vb > va) return 1;
  return 0;
}

export function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
  const stabilized = array.map((el, index) => [el, index]);
  stabilized.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilized.map((el) => el[0]);
}

// CSV Export helper
export function exportToCSV(rows, loaiKhoa) {
  const headers = [
    "KhoaID",
    "TenKhoa",
    "LoaiKhoa",
    "vienphi_count",
    "total_money",
    "total_thuoc",
    "total_vattu",
    "avg_money_per_case",
    "ty_le_thuoc",
    "ty_le_vattu",
    "KhuyenCaoBinhQuanHSBA",
    "KhuyenCaoTyLeThuocVatTu",
  ];
  const csv = [headers.join(",")]
    .concat(
      rows.map((r) =>
        [
          r.KhoaID,
          `"${r.TenKhoa}"`,
          r.LoaiKhoa,
          r.vienphi_count,
          r.total_money,
          r.total_thuoc,
          r.total_vattu,
          r.avg_money_per_case,
          r.ty_le_thuoc,
          r.ty_le_vattu,
          r.KhuyenCaoBinhQuanHSBA || "",
          r.KhuyenCaoTyLeThuocVatTu || "",
        ].join(",")
      )
    )
    .join("\n");

  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName =
    loaiKhoa === "noitru"
      ? "binh_quan_benh_an_noi_tru.csv"
      : "binh_quan_benh_an_ngoai_tru.csv";
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Tính chênh lệch giữa 2 mảng dữ liệu theo KhoaID + LoaiKhoa
 * @param {Array} currentData - Dữ liệu ngày hiện tại
 * @param {Array} previousData - Dữ liệu ngày trước
 * @param {number} ngay - Ngày hiện tại (nếu = 1 thì không tính chênh lệch)
 * @returns {Array} Mảng kết hợp với field chênh lệch
 */
export function calculateDifference(currentData, previousData, ngay) {
  if (!Array.isArray(currentData)) return [];

  // Nếu ngày = 1, không tính chênh lệch (chỉ hiển thị giá trị hiện tại)
  if (ngay === 1 || !Array.isArray(previousData)) {
    return currentData.map((item) => ({
      ...item,
      vienphi_count_diff: 0,
      total_money_diff: 0,
      total_thuoc_diff: 0,
      total_vattu_diff: 0,
      avg_money_per_case_diff: 0,
    }));
  }

  // Map previousData theo composite key: KhoaID + LoaiKhoa
  // VD: "5_noitru", "5_ngoaitru" là 2 key khác nhau
  const previousMap = new Map();
  previousData.forEach((item) => {
    if (item.KhoaID && item.LoaiKhoa) {
      const compositeKey = `${item.KhoaID}_${item.LoaiKhoa}`;
      previousMap.set(compositeKey, item);
    }
  });

  // Tính chênh lệch
  return currentData.map((current) => {
    const compositeKey = `${current.KhoaID}_${current.LoaiKhoa}`;
    const previous = previousMap.get(compositeKey);

    if (!previous) {
      // Khoa mới, không có dữ liệu trước → diff = 0 (không có gì để so sánh)
      return {
        ...current,
        vienphi_count_diff: 0,
        total_money_diff: 0,
        total_thuoc_diff: 0,
        total_vattu_diff: 0,
        avg_money_per_case_diff: 0,
      };
    }

    // Tính chênh lệch: current - previous
    return {
      ...current,
      vienphi_count_diff:
        (current.vienphi_count || 0) - (previous.vienphi_count || 0),
      total_money_diff:
        (current.total_money || 0) - (previous.total_money || 0),
      total_thuoc_diff:
        (current.total_thuoc || 0) - (previous.total_thuoc || 0),
      total_vattu_diff:
        (current.total_vattu || 0) - (previous.total_vattu || 0),
      avg_money_per_case_diff:
        (current.avg_money_per_case || 0) - (previous.avg_money_per_case || 0),
    };
  });
}
