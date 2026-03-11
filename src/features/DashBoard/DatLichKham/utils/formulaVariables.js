/**
 * @fileoverview Định nghĩa các biến số tính toán từ lịch sử khám
 * Dùng cho công thức lọc bệnh nhân mãn tính
 */

/**
 * Danh sách biến số có thể dùng trong công thức
 * Frontend dùng để render dropdown trong rule builder
 */
export const VARIABLE_DEFINITIONS = [
  // ─── Nhóm: Thống kê chung ────────────────────────────────
  {
    id: "soLanKham",
    label: "Số lần khám trong năm",
    type: "number",
    moTa: "Tổng số lần khám trong 1 năm gần nhất",
    nhom: "chung",
  },
  {
    id: "maBenhTrung_max",
    label: "Số lần mã bệnh chính trùng nhiều nhất",
    type: "number",
    moTa: "Mã ICD chẩn đoán chính xuất hiện nhiều nhất — đếm số lần",
    nhom: "chung",
  },
  {
    id: "soLanLienTuc",
    label: "Số lần liên tục cùng mã bệnh chính (gần nhất)",
    type: "number",
    moTa: "Từ lần khám gần nhất, đếm liên tục cùng 1 mã ICD chẩn đoán chính",
    nhom: "chung",
  },
  // ─── Nhóm: Lần khám hiện tại ─────────────────────────────
  {
    id: "maBenhChinhMoi",
    label: "Mã bệnh chính lần này là MỚI",
    type: "boolean",
    moTa: "Mã CĐ chính lần khám hiện tại chưa từng xuất hiện trong lịch sử (cả CĐ chính + kèm theo)",
    nhom: "hienTai",
  },
  {
    id: "maBenhChinhHienTai_TrongDSManTinh",
    label: "Mã bệnh chính lần này thuộc DS mãn tính",
    type: "boolean",
    moTa: "Mã CĐ chính lần khám hiện tại có nằm trong danh sách mã bệnh mãn tính",
    nhom: "hienTai",
  },
  // ─── Nhóm: CĐ chính + DS mãn tính (lịch sử) ─────────────
  {
    id: "coMaBenhManTinh",
    label: "Có mã bệnh chính thuộc DS mãn tính (lịch sử)",
    type: "boolean",
    moTa: "Bất kỳ lần khám nào có mã ICD chẩn đoán chính thuộc DS mãn tính",
    nhom: "dsMT_chinh",
  },
  {
    id: "soLanMaBenhManTinh",
    label: "Số lần có mã bệnh chính thuộc DS mãn tính",
    type: "number",
    moTa: "Đếm số lần khám mà mã ICD chẩn đoán chính thuộc DS mãn tính",
    nhom: "dsMT_chinh",
  },
  {
    id: "tiLeMaBenhManTinh",
    label: "Tỷ lệ % mã bệnh chính thuộc DS mãn tính",
    type: "number",
    moTa: "(Số lần mã bệnh chính MT / Tổng lần khám) × 100",
    nhom: "dsMT_chinh",
  },
  {
    id: "soLanLienTucMaBenhManTinh",
    label: "Số lần liên tục gần nhất CĐ chính thuộc DS mãn tính",
    type: "number",
    moTa: "Từ lần khám gần nhất, đếm liên tục có mã ICD CĐ chính thuộc DS",
    nhom: "dsMT_chinh",
  },
  {
    id: "soMaBenhManTinhKhacNhau",
    label: "Số mã bệnh chính mãn tính khác nhau",
    type: "number",
    moTa: "Đếm số mã ICD CĐ chính KHÁC NHAU thuộc DS mãn tính (tín hiệu đa bệnh)",
    nhom: "dsMT_chinh",
  },
  // ─── Nhóm: CĐ kèm theo + DS mãn tính (lịch sử) ──────────
  {
    id: "coMaBenhManTinh_KemTheo",
    label: "Có mã bệnh kèm theo thuộc DS mãn tính (lịch sử)",
    type: "boolean",
    moTa: "Bất kỳ lần khám nào có mã ICD chẩn đoán kèm theo thuộc DS mãn tính",
    nhom: "dsMT_kemTheo",
  },
  {
    id: "soLanMaBenhManTinh_KemTheo",
    label: "Số lần có mã bệnh kèm theo thuộc DS mãn tính",
    type: "number",
    moTa: "Đếm số lần khám mà ít nhất 1 mã ICD kèm theo thuộc DS mãn tính",
    nhom: "dsMT_kemTheo",
  },
  // ─── Nhóm: Kết hợp (CĐ chính + kèm theo) + DS mãn tính ──
  {
    id: "coMaBenhManTinh_BatKy",
    label: "Có mã bệnh BẤT KỲ thuộc DS mãn tính (lịch sử)",
    type: "boolean",
    moTa: "Bất kỳ lần khám nào, CĐ chính HOẶC kèm theo có mã thuộc DS mãn tính",
    nhom: "dsMT_ketHop",
  },
  {
    id: "soLanMaBenhManTinh_BatKy",
    label: "Số lần có mã bệnh BẤT KỲ thuộc DS mãn tính",
    type: "number",
    moTa: "Đếm lần khám mà CĐ chính hoặc kèm theo chứa mã thuộc DS mãn tính",
    nhom: "dsMT_ketHop",
  },
  {
    id: "tiLeMaBenhManTinh_BatKy",
    label: "Tỷ lệ % có mã bệnh BẤT KỲ thuộc DS mãn tính",
    type: "number",
    moTa: "(Lần khám CĐ chính hoặc kèm theo thuộc DS MT / Tổng) × 100",
    nhom: "dsMT_ketHop",
  },
];

/**
 * Parse lichsu_kham thành mảng (giống parseLichSu trong ManTinhTable)
 */
function parseLichSu(lichsu_kham) {
  if (!lichsu_kham) return [];
  if (typeof lichsu_kham === "string") {
    try {
      return JSON.parse(lichsu_kham);
    } catch {
      return [];
    }
  }
  return Array.isArray(lichsu_kham) ? lichsu_kham : [];
}

/**
 * Parse chuỗi mã bệnh kèm theo (có thể nhiều mã, phân cách ; hoặc ,)
 * @returns {string[]} Array mã ICD uppercase
 */
function parseKemTheoCodes(kemTheoCode) {
  if (!kemTheoCode || typeof kemTheoCode !== "string") return [];
  return kemTheoCode
    .split(/[;,]/)
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

/**
 * Tính toán tất cả biến số cho 1 bệnh nhân
 *
 * @param {Object} patient - Dữ liệu 1 dòng chiTietDatLich (có lichsu_kham + chandoanravien_code)
 * @param {Set<string>} chronicCodeSet - Set mã ICD mãn tính (uppercase)
 * @returns {Object} Giá trị tất cả biến số + metadata hiển thị
 */
export function computeVariables(patient, chronicCodeSet = new Set()) {
  const lichSu = parseLichSu(patient?.lichsu_kham);
  const soLanKham = lichSu.length;

  // Mã bệnh chính của lần khám hiện tại
  const currentPrimaryCode = (patient?.chandoanravien_code || "")
    .toUpperCase()
    .trim();

  // ─── Đếm tần suất mã ICD chính ───────────────────────────
  const icdCount = {};
  lichSu.forEach((visit) => {
    const code = (visit.chandoanravien_code || "").toUpperCase().trim();
    if (code) {
      icdCount[code] = (icdCount[code] || 0) + 1;
    }
  });

  // Mã ICD chính xuất hiện nhiều nhất
  let maBenhTrung_max = 0;
  let maBenhTrung_maxCode = "";
  Object.entries(icdCount).forEach(([code, count]) => {
    if (count > maBenhTrung_max) {
      maBenhTrung_max = count;
      maBenhTrung_maxCode = code;
    }
  });

  // ─── Đếm liên tục cùng mã bệnh chính từ lần gần nhất ────
  let soLanLienTuc = 0;
  if (lichSu.length > 0) {
    const firstCode = (lichSu[0].chandoanravien_code || "")
      .toUpperCase()
      .trim();
    if (firstCode) {
      soLanLienTuc = 1;
      for (let i = 1; i < lichSu.length; i++) {
        const code = (lichSu[i].chandoanravien_code || "").toUpperCase().trim();
        if (code === firstCode) {
          soLanLienTuc++;
        } else {
          break;
        }
      }
    }
  }

  // ─── Biến lần khám hiện tại ───────────────────────────────
  let maBenhChinhMoi = false;
  let maBenhChinhHienTai_TrongDSManTinh = false;

  if (currentPrimaryCode) {
    // Kiểm tra mã CĐ chính lần này thuộc DS mãn tính
    maBenhChinhHienTai_TrongDSManTinh = chronicCodeSet.has(currentPrimaryCode);

    // Kiểm tra mã CĐ chính lần này "mới" — chưa từng xuất hiện
    // trong lịch sử (cả CĐ chính + kèm theo)
    let foundInHistory = false;
    for (const visit of lichSu) {
      const primaryCode = (visit.chandoanravien_code || "")
        .toUpperCase()
        .trim();
      if (primaryCode === currentPrimaryCode) {
        foundInHistory = true;
        break;
      }
      const kemTheoCodes = parseKemTheoCodes(visit.chandoanravien_kemtheo_code);
      if (kemTheoCodes.includes(currentPrimaryCode)) {
        foundInHistory = true;
        break;
      }
    }
    maBenhChinhMoi = !foundInHistory;
  }

  // ─── Biến DS mãn tính — CĐ chính ─────────────────────────
  let coMaBenhManTinh = false;
  let soLanMaBenhManTinh = 0;
  let soLanLienTucMaBenhManTinh = 0;

  // ─── Biến DS mãn tính — CĐ kèm theo ──────────────────────
  let coMaBenhManTinh_KemTheo = false;
  let soLanMaBenhManTinh_KemTheo = 0;

  // ─── Biến DS mãn tính — kết hợp ───────────────────────────
  let coMaBenhManTinh_BatKy = false;
  let soLanMaBenhManTinh_BatKy = 0;

  // ─── Biến đa bệnh mãn tính ────────────────────────────────
  const distinctChronicPrimaryCodes = new Set();

  if (chronicCodeSet.size > 0) {
    lichSu.forEach((visit) => {
      const primaryCode = (visit.chandoanravien_code || "")
        .toUpperCase()
        .trim();
      const kemTheoCodes = parseKemTheoCodes(visit.chandoanravien_kemtheo_code);

      const primaryMatch = primaryCode && chronicCodeSet.has(primaryCode);
      const kemTheoMatch = kemTheoCodes.some((c) => chronicCodeSet.has(c));

      // CĐ chính
      if (primaryMatch) {
        coMaBenhManTinh = true;
        soLanMaBenhManTinh++;
        distinctChronicPrimaryCodes.add(primaryCode);
      }
      // CĐ kèm theo
      if (kemTheoMatch) {
        coMaBenhManTinh_KemTheo = true;
        soLanMaBenhManTinh_KemTheo++;
      }
      // Kết hợp (bất kỳ)
      if (primaryMatch || kemTheoMatch) {
        coMaBenhManTinh_BatKy = true;
        soLanMaBenhManTinh_BatKy++;
      }
    });

    // Đếm liên tục CĐ chính thuộc DS MT từ lần gần nhất
    for (let i = 0; i < lichSu.length; i++) {
      const code = (lichSu[i].chandoanravien_code || "").toUpperCase().trim();
      if (code && chronicCodeSet.has(code)) {
        soLanLienTucMaBenhManTinh++;
      } else {
        break;
      }
    }
  }

  const tiLeMaBenhManTinh =
    soLanKham > 0 ? Math.round((soLanMaBenhManTinh / soLanKham) * 100) : 0;
  const soMaBenhManTinhKhacNhau = distinctChronicPrimaryCodes.size;
  const tiLeMaBenhManTinh_BatKy =
    soLanKham > 0
      ? Math.round((soLanMaBenhManTinh_BatKy / soLanKham) * 100)
      : 0;

  return {
    soLanKham,
    maBenhTrung_max,
    maBenhTrung_maxCode, // metadata for display
    soLanLienTuc,
    // Lần khám hiện tại
    maBenhChinhMoi,
    maBenhChinhHienTai_TrongDSManTinh,
    // DS mãn tính — CĐ chính
    coMaBenhManTinh,
    soLanMaBenhManTinh,
    tiLeMaBenhManTinh,
    soLanLienTucMaBenhManTinh,
    soMaBenhManTinhKhacNhau,
    // DS mãn tính — CĐ kèm theo
    coMaBenhManTinh_KemTheo,
    soLanMaBenhManTinh_KemTheo,
    // DS mãn tính — kết hợp
    coMaBenhManTinh_BatKy,
    soLanMaBenhManTinh_BatKy,
    tiLeMaBenhManTinh_BatKy,
  };
}
