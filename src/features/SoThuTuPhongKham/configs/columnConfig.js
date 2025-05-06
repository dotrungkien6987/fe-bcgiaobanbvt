/**
 * Cấu hình hiển thị cột mặc định cho các loại phòng
 * File này quản lý việc hiển thị mặc định các cột trong bảng dữ liệu số thứ tự
 */

// Tên khóa được sử dụng để lưu trữ cấu hình cột trong localStorage
const COLUMN_VISIBILITY_STORAGE_KEY = 'sothutu_column_visibility';

// Cấu hình cột hiển thị mặc định cho phòng khám
const DEFAULT_PHONG_KHAM_COLUMNS = [
 'departmentname',   // Tên phòng
  'next_number',      // STT tiếp theo
  'max_number',       // STT lớn nhất
  'total_patients',   // Tổng NB
  'waiting',          // Chưa khám
  'in_progress',      // Đang khám
  'completed',        // Khám xong
//   'max_checked',      // STT lớn nhất đã khám
  'latest_checked'    // STT vừa gọi
];

// Cấu hình cột hiển thị mặc định cho phòng thực hiện
const DEFAULT_PHONG_THUC_HIEN_COLUMNS = [
    'departmentname',   // Tên phòng
    'next_number',      // STT tiếp theo
    'max_number',       // STT lớn nhất
    'total_cls',        // Tổng CLS
    // 'total_patients',   // Tổng NB
    // 'waiting',          // Chưa thực hiện
    'pending_result',   // Đợi kết quả
    'completed',        // Đã trả kết quả
    // 'max_done',         // STT lớn nhất đã thực hiện
    'latest_done'       // STT gần nhất đã thực hiện
];

// Cấu hình cột hiển thị mặc định cho phòng lấy mẫu
const DEFAULT_PHONG_LAY_MAU_COLUMNS = [
    'departmentname',      // Tên phòng
    'next_number',         // STT tiếp theo
    'max_number',          // STT lớn nhất
    'total_cls',           // Tổng CLS
    // 'total_patients',      // Tổng NB
    'cases_not_sampled',   // Số mẫu chưa lấy
    'cases_sampled',       // Số mẫu đã lấy
    'patients_sampled',    // NB đã lấy
    // 'patients_not_sampled', // NB chưa lấy
    // 'waiting',             // Ca chưa thực hiện
    // 'pending_result',      // Đợi kết quả
    'completed',           // Đã trả kết quả
    // 'max_sampled',         // STT max đã lấy
    'latest_sampled'       // STT vừa gọi
];

// Danh sách tất cả các cột có thể có cho mỗi loại phòng
// Sẽ được sử dụng để kiểm tra tính hợp lệ của cấu hình
const ALL_PHONG_KHAM_COLUMNS = [
  'departmentname',   // Tên phòng
  'next_number',      // STT tiếp theo
  'max_number',       // STT lớn nhất
  'total_patients',   // Tổng NB
  'waiting',          // Chưa khám
  'in_progress',      // Đang khám
  'completed',        // Khám xong
  'max_checked',      // STT lớn nhất đã khám
  'latest_checked'    // STT vừa gọi
];

const ALL_PHONG_THUC_HIEN_COLUMNS = [
  'departmentname',   // Tên phòng
  'next_number',      // STT tiếp theo
  'max_number',       // STT lớn nhất
  'total_cls',        // Tổng CLS
  'total_patients',   // Tổng NB
  'waiting',          // Chưa thực hiện
  'pending_result',   // Đợi kết quả
  'completed',        // Đã trả kết quả
  'max_done',         // STT lớn nhất đã thực hiện
  'latest_done'       // STT gần nhất đã thực hiện
];

const ALL_PHONG_LAY_MAU_COLUMNS = [
  'departmentname',      // Tên phòng
  'next_number',         // STT tiếp theo
  'max_number',          // STT lớn nhất
  'total_cls',           // Tổng CLS
  'total_patients',      // Tổng NB
  'cases_not_sampled',   // Số mẫu chưa lấy
  'cases_sampled',       // Số mẫu đã lấy
  'patients_sampled',    // NB đã lấy
  'patients_not_sampled', // NB chưa lấy
  'waiting',             // Ca chưa thực hiện
  'pending_result',      // Đợi kết quả
  'completed',           // Đã trả kết quả
  'max_sampled',         // STT max đã lấy
  'latest_sampled'       // STT vừa gọi
];

// Hàm lấy cấu hình mặc định dựa trên loại phòng
const getDefaultColumns = (type) => {
  switch (type) {
    case 'phongKham':
      return DEFAULT_PHONG_KHAM_COLUMNS;
    case 'phongThucHien':
      return DEFAULT_PHONG_THUC_HIEN_COLUMNS;
    case 'phongLayMau':
      return DEFAULT_PHONG_LAY_MAU_COLUMNS;
    default:
      return [];
  }
};

// Hàm lấy tất cả các cột có thể có dựa trên loại phòng
const getAllPossibleColumns = (type) => {
  switch (type) {
    case 'phongKham':
      return ALL_PHONG_KHAM_COLUMNS;
    case 'phongThucHien':
      return ALL_PHONG_THUC_HIEN_COLUMNS;
    case 'phongLayMau':
      return ALL_PHONG_LAY_MAU_COLUMNS;
    default:
      return [];
  }
};

/**
 * Lưu cấu hình hiển thị cột vào localStorage
 * @param {string} type - Loại phòng ('phongKham', 'phongThucHien', 'phongLayMau')
 * @param {Object} columnVisibility - Object chứa trạng thái hiển thị của các cột
 */
const saveColumnVisibility = (type, columnVisibility) => {
  try {
    // Lấy cấu hình hiện tại từ localStorage (nếu có)
    const storedSettings = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    const settings = storedSettings ? JSON.parse(storedSettings) : {};
    
    // Cập nhật cấu hình cho loại phòng tương ứng
    settings[type] = columnVisibility;
    
    // Lưu lại vào localStorage
    localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(settings));
    console.log(`[${type}] Đã lưu cấu hình hiển thị cột`);
  } catch (error) {
    console.error('Lỗi khi lưu cấu hình hiển thị cột:', error);
  }
};

/**
 * Lấy cấu hình hiển thị cột từ localStorage
 * @param {string} type - Loại phòng ('phongKham', 'phongThucHien', 'phongLayMau')
 * @returns {Object|null} - Object chứa trạng thái hiển thị của các cột hoặc null nếu không có
 */
const loadColumnVisibility = (type) => {
  try {
    const storedSettings = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    if (!storedSettings) return null;
    
    const settings = JSON.parse(storedSettings);
    return settings[type] || null;
  } catch (error) {
    console.error('Lỗi khi đọc cấu hình hiển thị cột:', error);
    return null;
  }
};

// Hàm tạo object biểu thị trạng thái hiển thị ban đầu của các cột
const generateInitialColumnVisibility = (type) => {
  // Thử lấy cấu hình đã lưu
  const savedVisibility = loadColumnVisibility(type);
  if (savedVisibility) {
    console.log(`[${type}] Đã tải cấu hình hiển thị cột từ localStorage`);
    return savedVisibility;
  }
  
  // Sử dụng cấu hình mặc định nếu không có cấu hình đã lưu
  const allColumns = getAllPossibleColumns(type);
  const defaultColumns = getDefaultColumns(type);
  
  // Tạo object với tất cả các cột là false (ẩn)
  const initialVisibility = {};
  
  allColumns.forEach(column => {
    // Nếu cột có trong danh sách mặc định hoặc là departmentname -> hiển thị
    initialVisibility[column] = defaultColumns.includes(column) || column === 'departmentname';
  });
  
  return initialVisibility;
};

/**
 * Xóa cấu hình cột đã lưu và khôi phục về mặc định
 * @param {string} type - Loại phòng cần reset, hoặc null để reset tất cả
 * @returns {boolean} - Kết quả thực hiện
 */
const resetColumnVisibility = (type = null) => {
  try {
    if (type === null) {
      // Xóa toàn bộ cấu hình
      localStorage.removeItem(COLUMN_VISIBILITY_STORAGE_KEY);
      console.log('Đã xóa toàn bộ cấu hình hiển thị cột');
      return true;
    }
    
    // Xóa cấu hình của một loại phòng cụ thể
    const storedSettings = localStorage.getItem(COLUMN_VISIBILITY_STORAGE_KEY);
    if (!storedSettings) return true;
    
    const settings = JSON.parse(storedSettings);
    if (settings[type]) {
      delete settings[type];
      localStorage.setItem(COLUMN_VISIBILITY_STORAGE_KEY, JSON.stringify(settings));
      console.log(`[${type}] Đã xóa cấu hình hiển thị cột`);
    }
    return true;
  } catch (error) {
    console.error('Lỗi khi xóa cấu hình hiển thị cột:', error);
    return false;
  }
};

export {
  getDefaultColumns,
  getAllPossibleColumns,
  generateInitialColumnVisibility,
  saveColumnVisibility,
  resetColumnVisibility
};