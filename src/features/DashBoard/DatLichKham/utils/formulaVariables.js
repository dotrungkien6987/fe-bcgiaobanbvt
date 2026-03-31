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
    moTa: "Tổng số lần khám trong 1 năm gần nhất (đếm từ lịch sử khám)",
    viDu: "BN khám 5 lần → soLanKham = 5",
    nhom: "chung",
  },
  {
    id: "maBenhTrung_max",
    label: "Số lần mã bệnh chính trùng nhiều nhất",
    type: "number",
    moTa: "Đếm số lần xuất hiện (ở CĐ chính) của mã ICD được lặp lại nhiều nhất. Mỗi lần khám chỉ tính 1 cho mỗi mã",
    viDu: "E11×3, K29×1, I10×2 → maBenhTrung_max = 3 (của E11)",
    nhom: "chung",
  },
  {
    id: "soLanLienTuc",
    label: "Số lần liên tục cùng mã CĐ chính (từ gần nhất)",
    type: "number",
    moTa: "Từ lần khám gần nhất, đếm số lần liên tiếp có cùng mã ICD CĐ chính. Gặp mã khác → dừng đếm",
    viDu: "Lần 1:E11, Lần 2:E11, Lần 3:E11, Lần 4:K29 → soLanLienTuc = 3",
    nhom: "chung",
  },
  // ─── Nhóm: Lần khám hiện tại ─────────────────────────────
  {
    id: "maBenhChinhMoi",
    label: "Mã CĐ chính lần này là MỚI",
    type: "boolean",
    moTa: "Mã CĐ chính của lần khám hiện tại CHƯA TỪNG xuất hiện ở bất kỳ lần khám nào trong lịch sử (cả CĐ chính lẫn CĐ kèm theo)",
    viDu: "Lần 5 khám với E11, trước đó chưa từng có E11 → true (E11 là mới)",
    nhom: "hienTai",
  },
  {
    id: "maBenhChinhHienTai_TrongDSManTinh",
    label: "Mã CĐ chính lần này thuộc DS mãn tính",
    type: "boolean",
    moTa: "Mã ICD CĐ chính của lần khám hiện tại có nằm trong danh sách mã bệnh mãn tính đã cấu hình hay không",
    viDu: "E11 (ĐTĐ type 2) ∈ DS mãn tính → true;  J18 (viêm phổi) ∉ DS → false",
    nhom: "hienTai",
  },
  // ─── Nhóm: CĐ chính + DS mãn tính (lịch sử) ─────────────
  {
    id: "coMaBenhManTinh",
    label: "Có mã CĐ chính thuộc DS mãn tính",
    type: "boolean",
    moTa: "Bất kỳ lần khám nào trong lịch sử có mã ICD CĐ chính nằm trong DS mãn tính",
    viDu: "Lần 2 CĐ chính = E11 (∈ DS) → true",
    nhom: "dsMT_chinh",
  },
  {
    id: "soLanMaBenhManTinh",
    label: "Số lần CĐ chính thuộc DS mãn tính",
    type: "number",
    moTa: "Đếm số lần khám mà mã ICD CĐ chính nằm trong DS mãn tính",
    viDu: "Lần 2:E11, Lần 3:E11, Lần 5:E11 ∈ DS → soLanMaBenhManTinh = 3",
    nhom: "dsMT_chinh",
  },
  {
    id: "tiLeMaBenhManTinh",
    label: "Tỷ lệ % CĐ chính thuộc DS mãn tính",
    type: "number",
    moTa: "(Số lần CĐ chính ∈ DS / Tổng lần khám) × 100",
    viDu: "3/5 lần có E11 ∈ DS → tiLeMaBenhManTinh = 60",
    nhom: "dsMT_chinh",
  },
  {
    id: "soLanLienTucMaBenhManTinh",
    label: "Số lần liên tục CĐ chính ∈ DS mãn tính (từ gần nhất)",
    type: "number",
    moTa: "Từ lần khám gần nhất, đếm liên tiếp mã CĐ chính ∈ DS mãn tính. Gặp mã không thuộc DS → dừng",
    viDu: "Lần 4:E11(∈DS), Lần 3:E11(∈DS), Lần 2:E11(∈DS), Lần 1:K29 → = 3",
    nhom: "dsMT_chinh",
  },
  {
    id: "soMaBenhManTinhKhacNhau",
    label: "Số mã CĐ chính mãn tính KHÁC NHAU",
    type: "number",
    moTa: "Đếm số mã ICD CĐ chính distinct thuộc DS mãn tính. Dùng phát hiện BN đa bệnh mãn tính",
    viDu: "E11(∈DS)×3, I10(∈DS)×2, K29×1 → soMaBenhManTinhKhacNhau = 2 (E11, I10)",
    nhom: "dsMT_chinh",
  },
  // ─── Nhóm: Mã bệnh mãn tính TRÙNG NHAU (CĐ chính) ──────
  {
    id: "maxLanTrungMaBenhManTinh_Chinh",
    label: "Mã CĐ chính trùng nhau — max lần xuất hiện",
    type: "number",
    moTa: "Số lần xuất hiện nhiều nhất của MỘT mã ICD ở CĐ chính. Mỗi lần khám chỉ count tối đa 1 cho mỗi mã",
    viDu: "E11×3(ln1,ln3,ln5), K29×1, I10×2(ln2,ln4) ∈ DS → = 3",
    nhom: "dsMT_chinh",
  },
  // ─── Nhóm: Mã bệnh mãn tính TRÙNG NHAU (tất cả CĐ) ─────
  {
    id: "maxLanTrungMaBenhManTinh_BatKy",
    label: "Mã BẤT KỲ (chính/kèm) trùng nhau — max lần xuất hiện",
    type: "number",
    moTa: "Gộp CĐ chính + CĐ kèm theo, mỗi lần khám chỉ count tối đa 1 cho mỗi mã. Đếm xem mã nào xuất hiện ở nhiều lần khám nhất",
    viDu: "E11(ln1chính,ln2kèm,ln3chính), K29(ln4chính), I10(ln2kèm,ln5kèm) ∈ DS → = 3",
    nhom: "dsMT_ketHop",
  },
  // ─── Nhóm: CĐ kèm theo + DS mãn tính (lịch sử) ──────────
  {
    id: "coMaBenhManTinh_KemTheo",
    label: "Có mã CĐ kèm theo thuộc DS mãn tính",
    type: "boolean",
    moTa: "Bất kỳ lần khám nào trong lịch sử có ít nhất 1 mã ICD CĐ kèm theo nằm trong DS mãn tính",
    viDu: "Lần 2 có I10 ở CĐ kèm theo, I10 ∈ DS mãn tính → true",
    nhom: "dsMT_kemTheo",
  },
  {
    id: "soLanMaBenhManTinh_KemTheo",
    label: "Số lần CĐ kèm theo thuộc DS mãn tính",
    type: "number",
    moTa: "Đếm số lần khám mà ít nhất 1 mã ICD CĐ kèm theo nằm trong DS mãn tính",
    viDu: "Ln2(I10), Ln4(I10) ∈ DS → soLanMaBenhManTinh_KemTheo = 2",
    nhom: "dsMT_kemTheo",
  },
  // ─── Nhóm: Kết hợp (CĐ chính + kèm theo) + DS mãn tính ──
  {
    id: "coMaBenhManTinh_BatKy",
    label: "Có mã BẤT KỲ (chính/kèm) thuộc DS mãn tính",
    type: "boolean",
    moTa: "Bất kỳ lần khám nào trong lịch sử, CĐ chính HOẶC CĐ kèm theo chứa mã thuộc DS mãn tính",
    viDu: "Ln2 có E11(chính) ∈ DS → true",
    nhom: "dsMT_ketHop",
  },
  {
    id: "soLanMaBenhManTinh_BatKy",
    label: "Số lần CĐ chính HOẶC kèm theo thuộc DS mãn tính",
    type: "number",
    moTa: "Đếm số lần khám mà CĐ chính hoặc CĐ kèm theo chứa ít nhất 1 mã ∈ DS mãn tính",
    viDu: "Ln1(E11), Ln2(E11+I10), Ln3(E11), Ln4(I10), Ln5(E11+I10) ∈ DS → = 5",
    nhom: "dsMT_ketHop",
  },
  {
    id: "tiLeMaBenhManTinh_BatKy",
    label: "Tỷ lệ % CĐ chính HOẶC kèm theo ∈ DS mãn tính",
    type: "number",
    moTa: "(Số lần khám có mã ∈ DS / Tổng lần khám) × 100. Tính cả CĐ chính và kèm theo",
    viDu: "5/5 lần có E11 hoặc I10 ∈ DS → tiLeMaBenhManTinh_BatKy = 100",
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

  // ─── Biến mã bệnh MT trùng nhau ──────────────────────────
  let maxLanTrungMaBenhManTinh_Chinh = 0;
  let maxLanTrungMaBenhManTinh_BatKy = 0;

  // ─── Biến DS mãn tính — kết hợp ───────────────────────────
  let coMaBenhManTinh_BatKy = false;
  let soLanMaBenhManTinh_BatKy = 0;

  // ─── Biến đa bệnh mãn tính ────────────────────────────────
  const distinctChronicPrimaryCodes = new Set();

  if (chronicCodeSet.size > 0) {
    // Đếm tần suất mã MT theo CĐ chính (mỗi lần khám chỉ count 1 cho mỗi mã)
    const chinhMtCount = {};
    // Đếm tần suất mã MT gộp (CĐ chính + kèm theo, mỗi lần khám chỉ count 1 cho mỗi mã)
    const batKyMtCount = {};

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
        chinhMtCount[primaryCode] = (chinhMtCount[primaryCode] || 0) + 1;
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
        // Đếm: gộp CĐ chính + kèm theo, mỗi mã chỉ count 1 mỗi lần khám
        const allCodesInVisit = new Set();
        if (primaryMatch) allCodesInVisit.add(primaryCode);
        kemTheoCodes
          .filter((c) => chronicCodeSet.has(c))
          .forEach((c) => allCodesInVisit.add(c));
        allCodesInVisit.forEach((c) => {
          batKyMtCount[c] = (batKyMtCount[c] || 0) + 1;
        });
      }
    });

    // maxLanTrungMaBenhManTinh_Chinh: mã MT theo CĐ chính xuất hiện nhiều nhất
    Object.values(chinhMtCount).forEach((count) => {
      if (count > maxLanTrungMaBenhManTinh_Chinh) {
        maxLanTrungMaBenhManTinh_Chinh = count;
      }
    });

    // maxLanTrungMaBenhManTinh_BatKy: mã MT gộp (chính + kèm) xuất hiện nhiều nhất
    Object.values(batKyMtCount).forEach((count) => {
      if (count > maxLanTrungMaBenhManTinh_BatKy) {
        maxLanTrungMaBenhManTinh_BatKy = count;
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
    maxLanTrungMaBenhManTinh_Chinh,
    // DS mãn tính — CĐ kèm theo
    coMaBenhManTinh_KemTheo,
    soLanMaBenhManTinh_KemTheo,
    // DS mãn tính — kết hợp
    coMaBenhManTinh_BatKy,
    soLanMaBenhManTinh_BatKy,
    tiLeMaBenhManTinh_BatKy,
    maxLanTrungMaBenhManTinh_BatKy,
  };
}
