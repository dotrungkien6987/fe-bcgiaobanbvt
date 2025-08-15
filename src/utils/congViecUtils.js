import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

// Format date time for display
export const formatDateTime = (dateString) => {
  if (!dateString) return 'Chưa xác định';
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

// Format date only
export const formatDate = (dateString) => {
  if (!dateString) return 'Chưa xác định';
  return dayjs(dateString).format('DD/MM/YYYY');
};

// Format relative time
export const formatRelativeTime = (dateString) => {
  if (!dateString) return 'Chưa xác định';
  return dayjs(dateString).fromNow();
};

// Check if date is overdue
export const isOverdue = (dueDateString) => {
  if (!dueDateString) return false;
  return dayjs().isAfter(dayjs(dueDateString));
};

// Get status color for MUI components
export const getStatusColor = (status) => {
  switch (status) {
    case 'Mới':
      return 'default';
    case 'Đang thực hiện':
      return 'primary';
    case 'Tạm dừng':
      return 'warning';
    case 'Hoàn thành':
      return 'success';
    case 'Hủy':
      return 'error';
    default:
      return 'default';
  }
};

// Get priority color for MUI components
export const getPriorityColor = (priority) => {
  switch (priority) {
    case 'Thấp':
      return 'success';
    case 'Bình thường':
      return 'default';
    case 'Cao':
      return 'warning';
    case 'Rất cao':
      return 'error';
    default:
      return 'default';
  }
};

// Get progress color based on percentage and due date
export const getProgressColor = (progress, dueDate) => {
  const isTaskOverdue = isOverdue(dueDate);
  
  if (progress >= 100) return 'success';
  if (isTaskOverdue) return 'error';
  if (progress >= 75) return 'success';
  if (progress >= 50) return 'warning';
  if (progress >= 25) return 'info';
  return 'error';
};

// Calculate days until due date
export const getDaysUntilDue = (dueDateString) => {
  if (!dueDateString) return null;
  const dueDate = dayjs(dueDateString);
  const now = dayjs();
  return dueDate.diff(now, 'day');
};

// Get status text for display
export const getStatusText = (status) => {
  const statusMap = {
    'Mới': 'Mới tạo',
    'Đang thực hiện': 'Đang thực hiện',
    'Tạm dừng': 'Tạm dừng',
    'Hoàn thành': 'Hoàn thành',
    'Hủy': 'Đã hủy'
  };
  return statusMap[status] || status;
};

// Get priority text for display
export const getPriorityText = (priority) => {
  const priorityMap = {
    'Thấp': 'Ưu tiên thấp',
    'Bình thường': 'Ưu tiên bình thường',
    'Cao': 'Ưu tiên cao',
    'Rất cao': 'Ưu tiên rất cao'
  };
  return priorityMap[priority] || priority;
};

// Validate work data
export const validateCongViec = (data) => {
  const errors = {};
  
  if (!data.TieuDe?.trim()) {
    errors.TieuDe = 'Tiêu đề là bắt buộc';
  } else if (data.TieuDe.length > 200) {
    errors.TieuDe = 'Tiêu đề không được quá 200 ký tự';
  }
  
  if (data.MoTa && data.MoTa.length > 2000) {
    errors.MoTa = 'Mô tả không được quá 2000 ký tự';
  }
  
  if (!data.NgayBatDau) {
    errors.NgayBatDau = 'Ngày bắt đầu là bắt buộc';
  }
  
  if (!data.NgayHetHan) {
    errors.NgayHetHan = 'Ngày hết hạn là bắt buộc';
  } else if (data.NgayBatDau && dayjs(data.NgayHetHan).isBefore(dayjs(data.NgayBatDau))) {
    errors.NgayHetHan = 'Ngày hết hạn phải sau ngày bắt đầu';
  }
  
  if (!data.NguoiChinh) {
    errors.NguoiChinh = 'Người thực hiện chính là bắt buộc';
  }
  
  if (!data.MucDoUuTien) {
    errors.MucDoUuTien = 'Mức độ ưu tiên là bắt buộc';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Sort work items by priority and due date
export const sortCongViecs = (congViecs, sortBy = 'NgayHetHan', sortOrder = 'asc') => {
  return [...congViecs].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'NgayHetHan':
        aValue = dayjs(a.NgayHetHan);
        bValue = dayjs(b.NgayHetHan);
        break;
      case 'NgayTao':
        aValue = dayjs(a.NgayTao);
        bValue = dayjs(b.NgayTao);
        break;
      case 'MucDoUuTien':
        const priorityOrder = { 'Rất cao': 4, 'Cao': 3, 'Bình thường': 2, 'Thấp': 1 };
        aValue = priorityOrder[a.MucDoUuTien] || 0;
        bValue = priorityOrder[b.MucDoUuTien] || 0;
        break;
      case 'TienDo':
        aValue = a.TienDo || 0;
        bValue = b.TienDo || 0;
        break;
      default:
        aValue = a[sortBy] || '';
        bValue = b[sortBy] || '';
    }
    
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
};

// Filter work items
export const filterCongViecs = (congViecs, filters) => {
  return congViecs.filter(item => {
    // Status filter
    if (filters.trangThai && item.TrangThai !== filters.trangThai) {
      return false;
    }
    
    // Priority filter
    if (filters.mucDoUuTien && item.MucDoUuTien !== filters.mucDoUuTien) {
      return false;
    }
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const searchFields = [
        item.TieuDe,
        item.MoTa,
        item.NguoiGiaoViec?.HoTen,
        item.NguoiChinh?.HoTen,
        ...(item.Tags || [])
      ].filter(Boolean);
      
      const hasMatch = searchFields.some(field => 
        field.toLowerCase().includes(searchLower)
      );
      
      if (!hasMatch) return false;
    }
    
    // Date range filter
    if (filters.tuNgay) {
      const tuNgay = dayjs(filters.tuNgay).startOf('day');
      const ngayBatDau = dayjs(item.NgayBatDau);
      if (ngayBatDau.isBefore(tuNgay)) return false;
    }
    
    if (filters.denNgay) {
      const denNgay = dayjs(filters.denNgay).endOf('day');
      const ngayHetHan = dayjs(item.NgayHetHan);
      if (ngayHetHan.isAfter(denNgay)) return false;
    }
    
    // Overdue filter
    if (filters.quaHan === true && !isOverdue(item.NgayHetHan)) {
      return false;
    }
    if (filters.quaHan === false && isOverdue(item.NgayHetHan)) {
      return false;
    }
    
    return true;
  });
};

// Get work statistics
export const getCongViecStats = (congViecs) => {
  const stats = {
    total: congViecs.length,
    new: 0,
    inProgress: 0,
    paused: 0,
    completed: 0,
    cancelled: 0,
    overdue: 0,
    highPriority: 0
  };
  
  congViecs.forEach(item => {
    switch (item.TrangThai) {
      case 'Mới':
        stats.new++;
        break;
      case 'Đang thực hiện':
        stats.inProgress++;
        break;
      case 'Tạm dừng':
        stats.paused++;
        break;
      case 'Hoàn thành':
        stats.completed++;
        break;
      case 'Hủy':
        stats.cancelled++;
        break;
      default:
        // Không làm gì cho trạng thái không xác định
        break;
    }
    
    if (isOverdue(item.NgayHetHan) && item.TrangThai !== 'Hoàn thành') {
      stats.overdue++;
    }
    
    if (['Cao', 'Rất cao'].includes(item.MucDoUuTien)) {
      stats.highPriority++;
    }
  });
  
  return stats;
};
