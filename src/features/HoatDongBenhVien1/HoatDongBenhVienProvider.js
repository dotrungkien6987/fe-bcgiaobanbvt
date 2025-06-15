import React, { createContext, useState, useContext, useEffect } from 'react';
import { DEPARTMENT_TYPES, VIEW_MODES } from './constants';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';
import { getLichTrucByDate, selectLichTrucList, getKhoas, selectKhoas } from '../Slice/lichtrucSlice';
import { getAllNhomKhoa, selectNhomKhoaList } from '../Slice/nhomkhoasothutuSlice';
import { getAllSoThuTuStats } from '../Slice/soThuTuSlice';

// Tạo Context cho Dashboard Hoạt Động Bệnh Viện
const HoatDongBenhVienContext = createContext();

export const useHoatDongBenhVien = () => useContext(HoatDongBenhVienContext);

export const HoatDongBenhVienProvider = ({ children }) => {
  const dispatch = useDispatch();
  const lichTrucListFromRedux = useSelector(selectLichTrucList);
  const nhomKhoaList = useSelector(selectNhomKhoaList);
  const khoasFromRedux = useSelector(selectKhoas);
  
  // State cho ngày được chọn
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // State cho nhóm khoa được chọn
  const [selectedGroup, setSelectedGroup] = useState('');
  
  // State cho danh sách khoa
  const [departments, setDepartments] = useState([]);
  
  // State cho lịch trực
  const [schedules, setSchedules] = useState({});
  
  // State cho chế độ xem
  const [viewMode, setViewMode] = useState(VIEW_MODES.COMPACT);

  // State cho từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');
  
  // State cho loại hoạt động hiển thị
  const [visibleTypes, setVisibleTypes] = useState([
    DEPARTMENT_TYPES.NGOAI_TRU,
    DEPARTMENT_TYPES.NOI_TRU,
    DEPARTMENT_TYPES.THU_THUAT,
    DEPARTMENT_TYPES.LAY_MAU
  ]);
    // State cho loading
  const [loading, setLoading] = useState(false);
  // State cho loading dữ liệu số thứ tự
  const [loadingSoThuTu, setLoadingSoThuTu] = useState(false);
  // State cho danh sách nhóm khoa
  const [departmentGroups, setDepartmentGroups] = useState([]);// Fetch dữ liệu nhóm khoa và khoa khi component mount
  useEffect(() => {
    setLoading(true);
    
    // Fetch nhóm khoa và khoa từ redux store
    Promise.all([
      dispatch(getAllNhomKhoa()),
      dispatch(getKhoas())
    ])
      .then(() => {
        setLoading(false);
      }).catch((error) => {
        console.log('Không thể tải dữ liệu:', error);
        setDepartments([]);
        setDepartmentGroups([]);
        setLoading(false);
      });
  }, [dispatch]);
    // Cập nhật departmentGroups khi nhomKhoaList thay đổi
  useEffect(() => {
    if (nhomKhoaList && nhomKhoaList.length > 0) {
      // Chuyển đổi format từ API sang format đang sử dụng trong ứng dụng
      const formattedGroups = nhomKhoaList.map(group => ({
        id: group._id,
        ten: group.TenNhom,
        khoaIds: group.DanhSachKhoa.map(khoa => khoa.KhoaID)
      }));
      
      setDepartmentGroups(formattedGroups);
    }
  }, [nhomKhoaList]);
  
  // Cập nhật departments khi khoasFromRedux thay đổi
  useEffect(() => {
    if (khoasFromRedux && khoasFromRedux.length > 0) {
      // Chuyển đổi format từ API sang format đang sử dụng trong ứng dụng
      const formattedDepartments = khoasFromRedux.map(khoa => ({
        id: khoa._id,
        ten: khoa.TenKhoa,
        maKhoa: khoa.MaKhoa,
        hisDepartmentType: khoa.HisDepartmentType || 0
      }));
      
      setDepartments(formattedDepartments);    } else {
      // Trường hợp không có dữ liệu từ API
      setDepartments([]);
    }
  }, [khoasFromRedux]);
  
  // Hàm xử lý định dạng ngày theo múi giờ Việt Nam
  const formatDateForAPI = (date) => {
    if (!date) return null;
    
    // Chuyển ngày sang múi giờ Việt Nam (UTC+7)
    const vietnamDate = new Date(date);
    
    // Format thành chuỗi YYYY-MM-DD
    const year = vietnamDate.getFullYear();
    const month = String(vietnamDate.getMonth() + 1).padStart(2, '0');
    const day = String(vietnamDate.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  };
  // Fetch dữ liệu lịch trực mỗi khi selectedDate thay đổi
  useEffect(() => {
    if (selectedDate) {
      setLoading(true);
      
      // Format ngày theo múi giờ Việt Nam
      const formattedDate = formatDateForAPI(selectedDate);
      
      console.log('Fetching lịch trực for date:', formattedDate);
      
      // Gọi API để lấy lịch trực theo ngày
      dispatch(getLichTrucByDate(formattedDate))
        .then((result) => {
          console.log('Received lichTrucList data:', result);
          
          // Chuyển đổi dữ liệu từ mảng thành object để dễ truy cập theo KhoaID
          const schedulesData = {};
          
          if (Array.isArray(result)) {
            result.forEach(item => {
              // Logging item structure để debug
              console.log('Processing lịch trực item:', item);
              
              // Cần map theo KhoaID từ model LichTruc
              if (item && item.KhoaID) {
                const khoaId = item.KhoaID._id || item.KhoaID; // Kiểm tra xem KhoaID có được populate không
                
                // Tìm mã khoa dựa trên ID của khoa
                let maKhoa = '';
                const matchedDept = khoasFromRedux.find(khoa => khoa._id === khoaId);
                
                if (matchedDept) {
                  maKhoa = matchedDept.MaKhoa;
                  console.log(`Matched department: ${matchedDept.TenKhoa}, MaKhoa: ${maKhoa}`);
                } else {
                  console.log(`No matching department found for KhoaID: ${khoaId}`);
                }
                
                // Nếu có MaKhoa, lưu thông tin lịch trực
                if (maKhoa) {
                  schedulesData[maKhoa] = {
                    dieuDuong: item.DieuDuong || '',
                    bacSi: item.BacSi || '',
                    ghiChu: item.GhiChu || '',
                    khoaId: khoaId // Lưu lại KhoaID để có thể sử dụng sau này
                  };
                } else if (item.MaKhoa) {
                  // Nếu không tìm được bằng KhoaID nhưng có MaKhoa
                  schedulesData[item.MaKhoa] = {
                    dieuDuong: item.DieuDuong || '',
                    bacSi: item.BacSi || '',
                    ghiChu: item.GhiChu || ''
                  };
                }
              } else if (item && item.MaKhoa) {
                // Fallback nếu không có KhoaID nhưng có MaKhoa (backwards compatibility)
                console.log(`Using MaKhoa fallback for: ${item.MaKhoa}`);
                schedulesData[item.MaKhoa] = {
                  dieuDuong: item.DieuDuong || '',
                  bacSi: item.BacSi || '',
                  ghiChu: item.GhiChu || ''
                };
              }
            });
          }
            console.log('Final mapped schedule data:', schedulesData);
          setSchedules(schedulesData);
          setLoading(false);
        }).catch((error) => {
          // Nếu API gặp lỗi
          console.error('Error fetching lịch trực:', error);
          console.log('Không thể tải dữ liệu lịch trực');
          setSchedules({});
          setLoading(false);
        });
    }
  }, [selectedDate, dispatch, khoasFromRedux]);
  
  // Hàm kiểm tra nếu có kết quả phù hợp với từ khóa tìm kiếm
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
  // Lọc khoa theo nhóm khoa được chọn và từ khóa tìm kiếm
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

  // Chuyển đổi chế độ xem
  const toggleViewMode = () => {
    setViewMode(prev => prev === VIEW_MODES.COMPACT ? VIEW_MODES.EXPANDED : VIEW_MODES.COMPACT);
  };

  // Toggle hiển thị loại phòng
  const toggleDepartmentType = (type) => {
    setVisibleTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type) 
        : [...prev, type]
    );
  };
  // Lấy danh sách khoa theo loại
  const getDepartmentsByType = (type) => {
    return filteredDepartments.filter(dept => {
      // Kiểm tra hisDepartmentType của phòng khoa
      // HisDepartmentType: 2 (Ngoại trú - Phòng khám), 
      // 3 (Nội trú - Khoa điều trị), 
      // 7 (Thủ thuật - Phòng thực hiện), 
      // 38 (Phòng lấy mẫu)
      return dept.hisDepartmentType === type;
    });
  };  // Refresh data
  const refreshData = () => {
    setLoading(true);
    
    // Format ngày theo múi giờ Việt Nam
    const formattedDate = formatDateForAPI(selectedDate);
    
    console.log('Refreshing data for date:', formattedDate);
    
    // Thực hiện các promise đồng thời: lấy lịch trực, lấy nhóm khoa và lấy danh sách khoa
    Promise.all([
      dispatch(getLichTrucByDate(formattedDate)),
      dispatch(getAllNhomKhoa()),
      dispatch(getKhoas())
    ])
      .then(([lichTrucResult]) => {
        console.log('Refresh completed, got data:', { 
          lichTrucResult, 
          departments: khoasFromRedux
        });
        
        // Chuyển đổi dữ liệu từ mảng thành object để dễ truy cập theo KhoaID
        const schedulesData = {};
        
        if (Array.isArray(lichTrucResult)) {
          lichTrucResult.forEach(item => {
            // Logging item structure để debug
            console.log('Processing refreshed lịch trực item:', item);
            
            // Cần map theo KhoaID từ model LichTruc
            if (item && item.KhoaID) {
              const khoaId = item.KhoaID._id || item.KhoaID; // Kiểm tra xem KhoaID có được populate không
              
              // Tìm mã khoa dựa trên ID của khoa
              let maKhoa = '';
              const matchedDept = khoasFromRedux.find(khoa => khoa._id === khoaId);
              
              if (matchedDept) {
                maKhoa = matchedDept.MaKhoa;
                console.log(`Matched refreshed department: ${matchedDept.TenKhoa}, MaKhoa: ${maKhoa}`);
              } else {
                console.log(`No matching department found for refreshed KhoaID: ${khoaId}`);
              }
              
              // Nếu có MaKhoa, lưu thông tin lịch trực
              if (maKhoa) {
                schedulesData[maKhoa] = {
                  dieuDuong: item.DieuDuong || '',
                  bacSi: item.BacSi || '',
                  ghiChu: item.GhiChu || '',
                  khoaId: khoaId // Lưu lại KhoaID để có thể sử dụng sau này
                };
              } else if (item.MaKhoa) {
                // Nếu không tìm được bằng KhoaID nhưng có MaKhoa
                console.log(`Using MaKhoa fallback during refresh for: ${item.MaKhoa}`);
                schedulesData[item.MaKhoa] = {
                  dieuDuong: item.DieuDuong || '',
                  bacSi: item.BacSi || '',
                  ghiChu: item.GhiChu || ''
                };
              }
            } else if (item && item.MaKhoa) {
              // Fallback nếu không có KhoaID nhưng có MaKhoa (backwards compatibility)
              console.log(`Using MaKhoa fallback during refresh for: ${item.MaKhoa}`);
              schedulesData[item.MaKhoa] = {
                dieuDuong: item.DieuDuong || '',
                bacSi: item.BacSi || '',
                ghiChu: item.GhiChu || ''
              };
            }
          });
        }
          console.log('Final refreshed schedule data:', schedulesData);
        setSchedules(schedulesData);
        setLoading(false);
        
        // Sau khi hoàn thành việc tải lịch trực, tiếp tục tải số thứ tự
        // Lọc khoa dựa trên nhóm khoa đã chọn
        let filteredKhoas = khoasFromRedux;

        // Nếu có nhóm khoa được chọn, lọc theo nhóm đó
        if (selectedGroup) {
          const selectedGroupData = departmentGroups.find(g => g.id === selectedGroup);
          
          if (selectedGroupData) {
            // Lấy danh sách ID khoa trong nhóm
            const khoaIdsInGroup = selectedGroupData.khoaIds.map(khoaId => {
              // Nếu khoaId là object, lấy _id
              return typeof khoaId === 'object' && khoaId._id ? khoaId._id : khoaId;
            });
            
            // Lọc chỉ những khoa thuộc nhóm đã chọn
            filteredKhoas = khoasFromRedux.filter(khoa => 
              khoaIdsInGroup.includes(khoa._id)
            );
            
            console.log('Filtered khoas by selected group:', filteredKhoas.length);
          }
        }

        // Lấy danh sách HisDepartmentID từ danh sách khoa đã lọc
        const departmentIds = filteredKhoas
          .filter(khoa => khoa.HisDepartmentID) // Lọc những khoa có HisDepartmentID
          .map(khoa => khoa.HisDepartmentID);   // Lấy ra mảng HisDepartmentID
        
        if (departmentIds.length > 0) {
          setLoadingSoThuTu(true);
          console.log('Loading SoThuTu data with departmentIds:', departmentIds);
          
          // Dispatch action để lấy dữ liệu số thứ tự
          dispatch(getAllSoThuTuStats(formattedDate, departmentIds))
            .then(() => {
              console.log('SoThuTu data loaded successfully');
              setLoadingSoThuTu(false);
            })
            .catch(error => {
              console.error('Error loading SoThuTu data:', error);
              setLoadingSoThuTu(false);
            });
        }
      }).catch((error) => {
        // Nếu API gặp lỗi
        console.error('Error refreshing data:', error);
        console.log('Không thể tải dữ liệu - vui lòng thử lại sau');
        setDepartments([]);
        setSchedules({});
        setDepartmentGroups([]);
        setLoading(false);
      });
  };  const value = {
    selectedDate,
    setSelectedDate,
    selectedGroup,
    setSelectedGroup,
    searchTerm,
    setSearchTerm,
    departments: filteredDepartments,
    schedules,
    departmentGroups,
    viewMode,
    toggleViewMode,
    visibleTypes,
    toggleDepartmentType,
    loading,
    loadingSoThuTu,
    refreshData,
    getDepartmentsByType,
    matchesSearchTerm,
  };

  return (
    <HoatDongBenhVienContext.Provider value={value}>
      {children}
    </HoatDongBenhVienContext.Provider>
  );
};
