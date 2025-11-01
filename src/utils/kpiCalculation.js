/**
 * ✅ KPI CALCULATION UTILITIES - V2
 *
 * Công thức tính điểm GIỐNG HỆT backend method duyet()
 * Dùng cho preview real-time khi chưa duyệt
 *
 * Formula:
 * - Nếu IsMucDoHoanThanh: (DiemQuanLy × 2 + DiemTuDanhGia) / 3
 * - Nếu không: DiemQuanLy
 * - Scale về 0-1, phân loại TANG_DIEM/GIAM_DIEM
 * - DiemNhiemVu = MucDoKho × (diemTang - diemGiam)
 * - TongDiemKPI = SUM(DiemNhiemVu)
 */

/**
 * ✅ TÍNH TỔNG ĐIỂM KPI - PREVIEW
 *
 * @param {Array} nhiemVuList - Danh sách DanhGiaNhiemVuThuongQuy
 * @param {Object} diemTuDanhGiaMap - Map { NhiemVuThuongQuyID: DiemTuDanhGia }
 * @returns {Object} { tongDiem, chiTiet }
 */
export const calculateTotalScore = (nhiemVuList, diemTuDanhGiaMap) => {
  if (!nhiemVuList || nhiemVuList.length === 0) {
    return { tongDiem: 0, chiTiet: [] };
  }

  let tongDiemKPI = 0;
  const chiTiet = [];

  nhiemVuList.forEach((nv) => {
    // Get NhiemVuThuongQuyID (có thể là object hoặc string)
    const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
    const nvIdStr = nvId?.toString() || "";

    // Get DiemTuDanhGia từ map (default 0 nếu null)
    const diemTuDanhGia = diemTuDanhGiaMap[nvIdStr] || 0;

    let diemTang = 0; // Tổng điểm tăng (0-N)
    let diemGiam = 0; // Tổng điểm giảm (0-N)

    // Tính điểm từng tiêu chí
    if (nv.ChiTietDiem && nv.ChiTietDiem.length > 0) {
      nv.ChiTietDiem.forEach((tc) => {
        let diemCuoiCung = 0;

        // ✅ CÔNG THỨC DUY NHẤT
        if (tc.IsMucDoHoanThanh) {
          // Tiêu chí "Mức độ hoàn thành" - Kết hợp 2 điểm
          const diemQuanLy = tc.DiemDat || 0;
          diemCuoiCung = (diemQuanLy * 2 + diemTuDanhGia) / 3;
        } else {
          // Tiêu chí khác - Lấy trực tiếp điểm Manager
          diemCuoiCung = tc.DiemDat || 0;
        }

        // Scale về 0-1
        const diemScaled = diemCuoiCung / 100;

        // Phân loại tăng/giảm
        if (tc.LoaiTieuChi === "TANG_DIEM") {
          diemTang += diemScaled;
        } else {
          diemGiam += diemScaled;
        }
      });
    }

    // TongDiemTieuChi = DiemTang - DiemGiam (có thể > 1.0)
    const tongDiemTieuChi = diemTang - diemGiam;

    // DiemNhiemVu = MucDoKho × TongDiemTieuChi
    const diemNhiemVu = (nv.MucDoKho || 5) * tongDiemTieuChi;

    // Cộng dồn
    tongDiemKPI += diemNhiemVu;

    // Lưu chi tiết cho debugging
    chiTiet.push({
      tenNhiemVu: nv.NhiemVuThuongQuyID?.TenNhiemVu || "N/A",
      mucDoKho: nv.MucDoKho || 5,
      diemTuDanhGia,
      diemTang,
      diemGiam,
      tongDiemTieuChi,
      diemNhiemVu,
    });
  });

  return { tongDiem: tongDiemKPI, chiTiet };
};

/**
 * ✅ TÍNH ĐIỂM NHIỆM VỤ ĐƠN LẺ
 *
 * Dùng cho hiển thị điểm từng nhiệm vụ trong table
 *
 * @param {Object} nhiemVu - DanhGiaNhiemVuThuongQuy object
 * @param {Number} diemTuDanhGia - Điểm tự đánh giá của nhân viên (0-100)
 * @returns {Object} { diemTang, diemGiam, tongDiemTieuChi, diemNhiemVu }
 */
export const calculateNhiemVuScore = (nhiemVu, diemTuDanhGia = 0) => {
  if (!nhiemVu) {
    return {
      diemTang: 0,
      diemGiam: 0,
      tongDiemTieuChi: 0,
      diemNhiemVu: 0,
    };
  }

  let diemTang = 0;
  let diemGiam = 0;

  // Tính điểm từng tiêu chí
  if (nhiemVu.ChiTietDiem && nhiemVu.ChiTietDiem.length > 0) {
    nhiemVu.ChiTietDiem.forEach((tc) => {
      let diemCuoiCung = 0;

      // ✅ CÔNG THỨC DUY NHẤT
      if (tc.IsMucDoHoanThanh) {
        // Tiêu chí "Mức độ hoàn thành"
        const diemQL = tc.DiemDat || 0;
        diemCuoiCung = (diemQL * 2 + diemTuDanhGia) / 3;
      } else {
        // Tiêu chí khác
        diemCuoiCung = tc.DiemDat || 0;
      }

      // Scale về 0-1
      const diemScaled = diemCuoiCung / 100;

      // Phân loại
      if (tc.LoaiTieuChi === "TANG_DIEM") {
        diemTang += diemScaled;
      } else {
        diemGiam += diemScaled;
      }
    });
  }

  const tongDiemTieuChi = diemTang - diemGiam;
  const diemNhiemVu = (nhiemVu.MucDoKho || 5) * tongDiemTieuChi;

  return {
    diemTang,
    diemGiam,
    tongDiemTieuChi,
    diemNhiemVu,
  };
};

/**
 * ✅ VALIDATE ĐIỂM INPUT
 *
 * @param {Number} diem - Điểm cần validate
 * @param {Number} min - Giá trị min (default 0)
 * @param {Number} max - Giá trị max (default 100)
 * @returns {Boolean}
 */
export const validateScore = (diem, min = 0, max = 100) => {
  if (diem === null || diem === undefined || diem === "") {
    return false;
  }

  const numDiem = parseFloat(diem);
  if (Number.isNaN(numDiem)) {
    return false;
  }

  return numDiem >= min && numDiem <= max;
};

/**
 * ✅ FORMAT ĐIỂM HIỂN THỊ
 *
 * @param {Number} diem - Điểm cần format
 * @param {Number} decimals - Số chữ số thập phân (default 2)
 * @returns {String}
 */
export const formatScore = (diem, decimals = 2) => {
  if (diem === null || diem === undefined) {
    return "--";
  }

  return Number(diem).toFixed(decimals);
};
