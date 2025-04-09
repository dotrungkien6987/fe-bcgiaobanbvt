/**
 * Tổng hợp số bệnh nhân theo tỉnh thành dạng {label, value, code}
 * @param {Array} bnNgoaiTinhs - Mảng bệnh nhân ngoại tỉnh
 * @param {number} hinhthucvaovienid - Mã hình thức vào viện để lọc
 * @returns {Array} - Mảng các đối tượng {label, value, code}
 */
export const tongHopBenhNhanTheoTinhLabelValue = (bnNgoaiTinhs = [], hinhthucvaovienid = null) => {
    // Mảng các mã tỉnh cần hiển thị riêng
    const maTinhCanHienThi = ['08', '17', '26', '15'];
    
    // Lọc theo hình thức vào viện nếu có
    const filteredData = hinhthucvaovienid !== null 
      ? bnNgoaiTinhs.filter(bn => bn && bn.hinhthucvaovienid === hinhthucvaovienid)
      : bnNgoaiTinhs;
    
    // Khởi tạo object để tổng hợp số bệnh nhân theo tỉnh
    const provinceMap = {
      'other': { label: 'Khác', value: 0, MaTinh: 'other' },
      'bavi': { label: 'H. Ba Vì', value: 0, MaTinh: 'bavi' } // Thêm Ba Vì
    };
    
    // Khởi tạo các tỉnh cần hiển thị riêng
    maTinhCanHienThi.forEach(maTinh => {
      provinceMap[maTinh] = { label: '', value: 0, MaTinh: maTinh };
    });
  
    // Tổng hợp số bệnh nhân theo tỉnh
    filteredData.forEach(bn => {
      if (!bn) return; // Bỏ qua nếu phần tử không tồn tại
      
      const tinhCode = bn.hc_tinhcode;
      const huyenCode = bn.hc_huyencode;
      const tinhName = bn.hc_tinhname || 'Không xác định';
      const soBN = parseInt(bn.sobenhnhan) || 0;
      
      // Kiểm tra đặc biệt cho Ba Vì (tỉnh code 01, huyện code 17)
      if (tinhCode === '01' && huyenCode === '17') {
        provinceMap['bavi'].value += soBN;
      }
      else if (tinhCode && maTinhCanHienThi.includes(tinhCode)) {
        // Tỉnh thuộc nhóm hiển thị riêng
        if (!provinceMap[tinhCode].label) {
          provinceMap[tinhCode].label = tinhName;
        }
        provinceMap[tinhCode].value += soBN;
      } else if (tinhCode) {
        // Tỉnh thuộc nhóm "Khác"
        provinceMap['other'].value += soBN;
      }
    });
    
    // Chuyển đổi từ object sang array và loại bỏ các tỉnh không có bệnh nhân
    return Object.values(provinceMap)
      .filter(item => item.label && item.value > 0)
      .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần theo số bệnh nhân
  };
 /**
 * Tổng hợp số bệnh nhân theo huyện (trong một tỉnh) thành dạng {label, value, MaTinh, MaHuyen}
 * @param {Array} bnNgoaiTinhs - Mảng bệnh nhân ngoại tỉnh
 * @param {string} maTinh - Mã tỉnh cần lọc (nếu null sẽ không lọc theo tỉnh)
 * @param {number} hinhthucvaovienid - Mã hình thức vào viện để lọc (nếu null sẽ không lọc theo hình thức)
 * @returns {Array} - Mảng các đối tượng {label, value, MaTinh, MaHuyen}
 */
export const tongHopBenhNhanTheoHuyenLabelValue = (bnNgoaiTinhs = [], maTinh = null, hinhthucvaovienid = null) => {
    // Lọc dữ liệu theo maTinh và hinhthucvaovienid
    let filteredData = [...bnNgoaiTinhs];
    
    // Lọc theo tỉnh nếu có yêu cầu
    if (maTinh) {
      filteredData = filteredData.filter(bn => bn && bn.hc_tinhcode === maTinh);
    }
    
    // Lọc theo hình thức vào viện nếu có yêu cầu
    if (hinhthucvaovienid !== null) {
      filteredData = filteredData.filter(bn => bn && bn.hinhthucvaovienid === hinhthucvaovienid);
    }
    
    // Khởi tạo object để tổng hợp số bệnh nhân theo huyện
    const districtMap = {};
  
    // Tổng hợp số bệnh nhân theo huyện
    filteredData.forEach(bn => {
      if (!bn || !bn.hc_huyencode) return; // Bỏ qua nếu phần tử không tồn tại hoặc không có mã huyện
      
      const tinhCode = bn.hc_tinhcode;
      const huyenCode = bn.hc_huyencode;
      const huyenName = bn.hc_huyenname || 'Không xác định';
      const soBN = parseInt(bn.sobenhnhan) || 0;
      
      // Tạo key để map huyện theo cặp tỉnh-huyện
      const key = `${tinhCode}-${huyenCode}`;
      
      // Nếu huyện đã có trong map thì cộng dồn, nếu chưa có thì khởi tạo
      if (districtMap[key]) {
        districtMap[key].value += soBN;
      } else {
        districtMap[key] = {
          label: huyenName,
          value: soBN,
          MaTinh: tinhCode,
          MaHuyen: huyenCode
        };
      }
    });
    
    // Chuyển đổi từ object sang array và lọc ra những huyện không có bệnh nhân
    return Object.values(districtMap)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần theo số bệnh nhân
  };
  /**
 * Tổng hợp số bệnh nhân theo xã thành dạng {label, value, MaTinh, MaHuyen, MaXa}
 * @param {Array} bnNgoaiTinhs - Mảng bệnh nhân ngoại tỉnh
 * @param {string} maTinh - Mã tỉnh cần lọc
 * @param {string} maHuyen - Mã huyện cần lọc
 * @param {number} hinhthucvaovienid - Mã hình thức vào viện để lọc
 * @returns {Array} - Mảng các đối tượng {label, value, MaTinh, MaHuyen, MaXa}
 */
export const tongHopBenhNhanTheoXaLabelValue = (
    bnNgoaiTinhs = [], 
    maTinh = null, 
    maHuyen = null, 
    hinhthucvaovienid = null
  ) => {
    // Lọc dữ liệu theo maTinh, maHuyen và hinhthucvaovienid
    let filteredData = [...bnNgoaiTinhs];
    
    // Lọc theo tỉnh nếu có yêu cầu
    if (maTinh) {
      filteredData = filteredData.filter(bn => bn && bn.hc_tinhcode === maTinh);
    }
    
    // Lọc theo huyện nếu có yêu cầu
    if (maHuyen) {
      filteredData = filteredData.filter(bn => bn && bn.hc_huyencode === maHuyen);
    }
    
    // Lọc theo hình thức vào viện nếu có yêu cầu
    if (hinhthucvaovienid !== null) {
      filteredData = filteredData.filter(bn => bn && bn.hinhthucvaovienid === hinhthucvaovienid);
    }
    
    // Khởi tạo object để tổng hợp số bệnh nhân theo xã
    const wardMap = {};
  
    // Tổng hợp số bệnh nhân theo xã
    filteredData.forEach(bn => {
      if (!bn || !bn.hc_xacode) return; // Bỏ qua nếu phần tử không tồn tại hoặc không có mã xã
      
      const tinhCode = bn.hc_tinhcode;
      const huyenCode = bn.hc_huyencode;
      const xaCode = bn.hc_xacode;
      const xaName = bn.hc_xaname || 'Không xác định';
      const soBN = parseInt(bn.sobenhnhan) || 0;
      
      // Tạo key để map xã theo cặp tỉnh-huyện-xã
      const key = `${tinhCode}-${huyenCode}-${xaCode}`;
      
      // Nếu xã đã có trong map thì cộng dồn, nếu chưa có thì khởi tạo
      if (wardMap[key]) {
        wardMap[key].value += soBN;
      } else {
        wardMap[key] = {
          label: xaName,
          value: soBN,
          MaTinh: tinhCode,
          MaHuyen: huyenCode,
          MaXa: xaCode
        };
      }
    });
    
    // Chuyển đổi từ object sang array và lọc ra những xã không có bệnh nhân
    return Object.values(wardMap)
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value); // Sắp xếp giảm dần theo số bệnh nhân
  };
/**
 * Sử dụng ví dụ:
 * 
 * import { tongHopBenhNhanTheoTinhLabelValue } from 'utils/helpHisSliceFunction';
 * 
 * // Lấy tất cả bệnh nhân theo tỉnh
 * const dataChart = tongHopBenhNhanTheoTinhLabelValue(bnNgoaiTinhs);
 * 
 * // Lọc theo hình thức vào viện cụ thể (ví dụ: hình thức = 1)
 * const dataChartFiltered = tongHopBenhNhanTheoTinhLabelValue(bnNgoaiTinhs, 1);
 */

/**
 * Sử dụng ví dụ:
 * 
 * import { tongHopBenhNhanTheoHuyenLabelValue } from 'features/Slice/helpHisSliceFunction';
 * 
 * // Tổng hợp bệnh nhân theo huyện của một tỉnh cụ thể
 * const dataHuyenChart = tongHopBenhNhanTheoHuyenLabelValue(bnNgoaiTinhs, '26');
 * 
 * // Tổng hợp bệnh nhân theo huyện của một tỉnh và lọc theo hình thức vào viện
 * const dataHuyenChartFiltered = tongHopBenhNhanTheoHuyenLabelValue(bnNgoaiTinhs, '26', 0);
 */

/**
 * Sử dụng ví dụ:
 * 
 * import { tongHopBenhNhanTheoXaLabelValue } from 'features/Slice/helpHisSliceFunction';
 * 
 * // Tổng hợp bệnh nhân theo xã của một huyện cụ thể thuộc tỉnh cụ thể
 * const dataXaChart = tongHopBenhNhanTheoXaLabelValue(bnNgoaiTinhs, '26', '01');
 * 
 * // Tổng hợp bệnh nhân theo xã và lọc theo hình thức vào viện
 * const dataXaChartFiltered = tongHopBenhNhanTheoXaLabelValue(bnNgoaiTinhs, '26', '01', 0);
 * 
 * // Chỉ lọc theo tỉnh và hình thức vào viện (không lọc theo huyện)
 * const dataXaByProvince = tongHopBenhNhanTheoXaLabelValue(bnNgoaiTinhs, '26', null, 0);
 */