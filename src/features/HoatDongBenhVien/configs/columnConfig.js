/**
 * Cấu hình hiển thị cột mặc định cho các loại hoạt động bệnh viện
 * File này quản lý việc hiển thị mặc định các cột trong bảng dữ liệu hoạt động bệnh viện
 */

// Tên khóa được sử dụng để lưu trữ cấu hình cột trong localStorage
const COLUMN_VISIBILITY_STORAGE_KEY = 'hoatdongbenhvien_column_visibility';

// Cấu hình cột hiển thị mặc định cho phòng nội trú (Type 3)
const DEFAULT_NOI_TRU_COLUMNS = [
  'departmentname',      // Tên khoa phòng
  'DieuDuong',         // Điều dưỡng
  'BacSi',            // Bác sĩ
  'GhiChu',           // Ghi chú
  'total_count',         // Tổng số bệnh nhân
  'bhyt_count',          // Số bệnh nhân BHYT
  'vienphi_count',       // Số bệnh nhân viện phí
  'yeucau_count',        // Số bệnh nhân yêu cầu
  'dang_dieu_tri',       // Số bệnh nhân đang điều trị
  'dieu_tri_ket_hop',    // Số bệnh nhân điều trị kết hợp
  'benh_nhan_ra_vien'    // Số bệnh nhân ra viện
];

// Cấu hình cột hiển thị mặc định cho phòng khám (Type 2)
const DEFAULT_NGOAI_TRU_COLUMNS = [
  'departmentname',            // Tên khoa phòng
  'DieuDuong',         // Điều dưỡng
  'BacSi',            // Bác sĩ
  'GhiChu',           // Ghi chú
  'tong_benh_nhan',            // Tổng số bệnh nhân
  'so_benh_nhan_chua_kham',    // Số bệnh nhân chưa khám
  'so_benh_nhan_da_kham',      // Số bệnh nhân đã khám
  'so_benh_nhan_kham_xong',    // Số bệnh nhân khám xong
  'max_sothutunumber',         // STT lớn nhất
  'max_sothutunumber_da_kham', // STT lớn nhất đã khám
  'latest_benh_nhan_da_kham'   // STT bệnh nhân đã khám gần nhất
];

// Cấu hình cột hiển thị mặc định cho phòng thực hiện (Type 7)
const DEFAULT_THUC_HIEN_COLUMNS = [
  'departmentname',                  // Tên khoa phòng
  'DieuDuong',         // Điều dưỡng
  'BacSi',            // Bác sĩ
  'GhiChu',           // Ghi chú
  'tong_mau_benh_pham',              // Tổng số CLS
  'tong_benh_nhan',                  // Tổng số bệnh nhân
  'so_ca_chua_thuc_hien',            // Số ca chưa thực hiện
  'so_ca_da_thuc_hien_cho_ket_qua',  // Số ca đợi kết quả
  'so_ca_da_tra_ket_qua',            // Số ca đã trả kết quả
  'max_sothutunumber',               // STT lớn nhất
  'max_sothutunumber_da_thuc_hien'   // STT lớn nhất đã thực hiện
];

// Cấu hình cột hiển thị mặc định cho phòng lấy mẫu (Type 38)
const DEFAULT_LAY_MAU_COLUMNS = [
  'departmentname',                // Tên khoa phòng
  'DieuDuong',         // Điều dưỡng
  'BacSi',            // Bác sĩ
  'GhiChu',           // Ghi chú
  'tong_mau_benh_pham',            // Tổng số CLS
  'tong_benh_nhan',                // Tổng số bệnh nhân
  'so_ca_chua_lay_mau',            // Số ca chưa lấy mẫu
  'so_ca_da_lay_mau',              // Số ca đã lấy mẫu
  'so_ca_da_tra_ket_qua',          // Số ca đã trả kết quả
  'max_sothutunumber',             // STT lớn nhất
  'max_sothutunumber_da_lay_mau'   // STT lớn nhất đã lấy mẫu
];

/**
 * Hàm khởi tạo trạng thái hiển thị cột ban đầu
 * @param {string} type - Loại hoạt động: 'noiTru', 'ngoaiTru', 'thucHien', 'layMau'
 * @param {Array} allColumns - Danh sách tất cả các cột có thể có
 * @returns {Object} Đối tượng chứa trạng thái hiển thị của các cột
 */
const generateInitialColumnVisibility = (type, allColumns) => {
  let defaultColumns;
  
  // Chọn danh sách cột mặc định dựa trên loại hoạt động
  switch(type) {
    case 'noiTru':
      defaultColumns = DEFAULT_NOI_TRU_COLUMNS;
      break;
    case 'ngoaiTru':
      defaultColumns = DEFAULT_NGOAI_TRU_COLUMNS;
      break;
    case 'thucHien':
      defaultColumns = DEFAULT_THUC_HIEN_COLUMNS;
      break;
    case 'layMau':
      defaultColumns = DEFAULT_LAY_MAU_COLUMNS;
      break;
    default:
      defaultColumns = DEFAULT_NOI_TRU_COLUMNS; // Fallback to nội trú columns
      break;
  }
  
  // Tạo đối tượng visibility với tất cả các cột được ẩn ban đầu
  const visibility = {};
  
  allColumns.forEach(column => {
    // Kiểm tra xem cột có nằm trong danh sách cột mặc định không
    visibility[column.id] = defaultColumns.includes(column.id);
  });
  
  return visibility;
};

/**
 * Hàm lưu trạng thái hiển thị cột vào localStorage
 * @param {string} type - Loại hoạt động: 'chung', 'noiTru', 'ngoaiTru'
 * @param {Object} visibility - Đối tượng chứa trạng thái hiển thị của các cột
 */
const saveColumnVisibility = (type, visibility) => {
  try {
    // Lấy cấu hình cũ từ localStorage (nếu có)
    const storedConfig = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    const config = storedConfig ? JSON.parse(storedConfig) : {};
    
    // Cập nhật cấu hình cho loại phòng cụ thể
    config[type] = visibility;
    
    // Lưu lại vào localStorage
    localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(config));
  } catch (error) {
    console.error('Lỗi khi lưu cấu hình cột:', error);
  }
};

/**
 * Hàm đọc trạng thái hiển thị cột từ localStorage
 * @param {string} type - Loại hoạt động: 'chung', 'noiTru', 'ngoaiTru'
 * @param {Array} allColumns - Danh sách tất cả các cột có thể có
 * @returns {Object} Đối tượng chứa trạng thái hiển thị của các cột
 */
const loadColumnVisibility = (type, allColumns) => {
  try {
    // Lấy cấu hình từ localStorage
    const storedConfig = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    
    if (!storedConfig) {
      // Nếu chưa có cấu hình, tạo cấu hình mặc định
      return generateInitialColumnVisibility(type, allColumns);
    }
    
    const config = JSON.parse(storedConfig);
    
    // Nếu không có cấu hình cho loại phòng cụ thể, tạo cấu hình mặc định
    if (!config[type]) {
      return generateInitialColumnVisibility(type, allColumns);
    }
    
    return config[type];
  } catch (error) {
    console.error('Lỗi khi đọc cấu hình cột:', error);
    return generateInitialColumnVisibility(type, allColumns);
  }
};

/**
 * Hàm reset trạng thái hiển thị cột về mặc định
 * @param {string} type - Loại hoạt động: 'chung', 'noiTru', 'ngoaiTru'
 * @param {Array} allColumns - Danh sách tất cả các cột có thể có
 * @returns {Object} Đối tượng chứa trạng thái hiển thị mặc định của các cột
 */
const resetColumnVisibility = (type, allColumns) => {
  // Tạo cấu hình mặc định
  const defaultVisibility = generateInitialColumnVisibility(type, allColumns);
  
  // Lưu cấu hình mặc định vào localStorage
  saveColumnVisibility(type, defaultVisibility);
  
  return defaultVisibility;
};

export {
  generateInitialColumnVisibility,
  saveColumnVisibility,
  loadColumnVisibility,
  resetColumnVisibility
};
