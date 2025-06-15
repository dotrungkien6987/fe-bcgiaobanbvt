// Move the matchesSearchTerm function before the filteredDepartments declaration
const matchesSearchTerm = (department, schedule) => {
  if (!searchTerm || !searchTerm.trim()) return true;
  
  const searchTermLower = searchTerm.toLowerCase().trim();
  const deptName = department?.ten?.toLowerCase() || '';
  
  // Tìm trong tên khoa
  if (deptName.includes(searchTermLower)) {
    return true;
  }
  
  // Lấy thông tin lịch trực, ưu tiên sử dụng schedule được truyền vào
  const deptSchedule = schedule || (schedules && schedules[department.maKhoa]) || { dieuDuong: '', bacSi: '', ghiChu: '' };
  
  // Tìm trong danh sách điều dưỡng
  if (deptSchedule.dieuDuong && deptSchedule.dieuDuong.toLowerCase().includes(searchTermLower)) {
    return true;
  }
  
  // Tìm trong danh sách bác sĩ
  if (deptSchedule.bacSi && deptSchedule.bacSi.toLowerCase().includes(searchTermLower)) {
    return true;
  }
  
  // Tìm trong ghi chú
  if (deptSchedule.ghiChu && deptSchedule.ghiChu.toLowerCase().includes(searchTermLower)) {
    return true;
  }
  
  return false;
};

// Now define filteredDepartments
const filteredDepartments = departments.filter(dept => {
  // Kiểm tra lọc theo nhóm khoa
  const groupMatches = !selectedGroup
    ? true
    : (() => {
        const group = departmentGroups.find(g => g.id === selectedGroup);
        // Kiểm tra xem phòng khoa hiện tại có trong danh sách khoa của nhóm
        return group && group.khoaIds.some(khoaId => {
          // Có thể cần chuyển đổi định dạng ID dựa vào API
          // Nếu khoaId là một đối tượng với _id, so sánh với dept.id
          if (typeof khoaId === 'object' && khoaId._id) {
            return khoaId._id === dept.id;
          }
          // Nếu khoaId là một string, so sánh trực tiếp
          return khoaId === dept.id;
        });
      })();
  
  // Kiểm tra lọc theo từ khóa tìm kiếm
  const searchMatches = matchesSearchTerm(dept);
  
  return groupMatches && searchMatches;
});

// Fetch dữ liệu thống kê khi filteredDepartments thay đổi
useEffect(() => {
  if (selectedDate && filteredDepartments.length > 0) {
    // Format ngày theo định dạng API
    const formattedDate = formatDateForAPI(selectedDate);
    
    // Lấy danh sách departmentIds từ danh sách phòng khoa được lọc
    const deptIds = filteredDepartments.map(dept => dept.id);
    
    if (deptIds.length > 0) {
      // Không set loading để tránh hiệu ứng loading liên tục
      // Lưu lại danh sách departmentIds đã chọn
      setSelectedDepartmentIds(deptIds);
      
      // Gọi API lấy toàn bộ dữ liệu thống kê
      dispatch(getAllSoThuTuStats(formattedDate, deptIds))
        .then(() => {
          setStatsDataFetched(true);
          console.log('Đã lấy dữ liệu thống kê thành công');
        })
        .catch(error => {
          console.error('Lỗi khi lấy dữ liệu thống kê:', error);
          setStatsDataFetched(false);
        });
    }
  }
}, [selectedDate, filteredDepartments, dispatch]);
