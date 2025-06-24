import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { DEPARTMENT_TYPES, VIEW_MODES } from "./constants";
import { useDispatch, useSelector } from "react-redux";
import {
  getLichTrucByDate,
  getKhoas,
  selectKhoas,
} from "../Slice/lichtrucSlice";
import {
  getAllNhomKhoa,
  selectNhomKhoaList,
} from "../Slice/nhomkhoasothutuSlice";
import { getAllSoThuTuStats } from "../Slice/soThuTuSlice";
import {
  searchVietnamese,
  removeVietnameseTones,
} from "../../utils/vietnameseUtils";

// Tạo Context cho Dashboard Hoạt Động Bệnh Viện
const HoatDongBenhVienContext = createContext();

export const useHoatDongBenhVien = () => useContext(HoatDongBenhVienContext);

export const HoatDongBenhVienProvider = ({ children }) => {
  const dispatch = useDispatch();
  const nhomKhoaList = useSelector(selectNhomKhoaList);
  const khoasFromRedux = useSelector(selectKhoas);

  // State cho ngày được chọn
  const [selectedDate, setSelectedDate] = useState(new Date());

  // State cho nhóm khoa được chọn
  const [selectedGroup, setSelectedGroup] = useState("");

  // State cho danh sách khoa
  const [departments, setDepartments] = useState([]);

  // State cho lịch trực
  const [schedules, setSchedules] = useState({});

  // State cho chế độ xem
  const [viewMode, setViewMode] = useState(VIEW_MODES.COMPACT);

  // State cho từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState("");

  // State cho loại hoạt động hiển thị
  const [visibleTypes, setVisibleTypes] = useState([
    DEPARTMENT_TYPES.NGOAI_TRU,
    DEPARTMENT_TYPES.NOI_TRU,
    DEPARTMENT_TYPES.THU_THUAT,
    DEPARTMENT_TYPES.LAY_MAU,
  ]);
  // State cho loading
  const [loading, setLoading] = useState(false);
  // State cho loading dữ liệu số thứ tự
  const [loadingSoThuTu, setLoadingSoThuTu] = useState(false);
  // State cho danh sách nhóm khoa
  const [departmentGroups, setDepartmentGroups] = useState([]); // Fetch dữ liệu nhóm khoa và khoa khi component mount
  useEffect(() => {
    setLoading(true);

    // Fetch nhóm khoa và khoa từ redux store
    Promise.all([dispatch(getAllNhomKhoa()), dispatch(getKhoas())])
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        console.log("Không thể tải dữ liệu:", error);
        setDepartments([]);
        setDepartmentGroups([]);
        setLoading(false);
      });
  }, [dispatch]);
  // Cập nhật departmentGroups khi nhomKhoaList thay đổi
  useEffect(() => {
    if (nhomKhoaList && nhomKhoaList.length > 0) {
      // Chuyển đổi format từ API sang format đang sử dụng trong ứng dụng
      const formattedGroups = nhomKhoaList.map((group) => ({
        id: group._id,
        ten: group.TenNhom,
        khoaIds: group.DanhSachKhoa.map((khoa) => khoa.KhoaID),
      }));

      setDepartmentGroups(formattedGroups);
    }
  }, [nhomKhoaList]);

  // Cập nhật departments khi khoasFromRedux thay đổi
  useEffect(() => {
    if (khoasFromRedux && khoasFromRedux.length > 0) {
      // Chuyển đổi format từ API sang format đang sử dụng trong ứng dụng
      const formattedDepartments = khoasFromRedux.map((khoa) => ({
        id: khoa._id,
        ten: khoa.TenKhoa,
        maKhoa: khoa.MaKhoa,
        hisDepartmentType: khoa.HisDepartmentType || 0,
      }));

      setDepartments(formattedDepartments);
    } else {
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
    const month = String(vietnamDate.getMonth() + 1).padStart(2, "0");
    const day = String(vietnamDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };
  // Fetch dữ liệu lịch trực mỗi khi selectedDate thay đổi
  useEffect(() => {
    if (selectedDate) {
      setLoading(true);

      // Format ngày theo múi giờ Việt Nam
      const formattedDate = formatDateForAPI(selectedDate);

      console.log("Fetching lịch trực for date:", formattedDate);

      // Gọi API để lấy lịch trực theo ngày
      dispatch(getLichTrucByDate(formattedDate))
        .then((result) => {
          console.log("Received lichTrucList data:", result);

          // Chuyển đổi dữ liệu từ mảng thành object để dễ truy cập theo KhoaID
          const schedulesData = {};

          if (Array.isArray(result)) {
            result.forEach((item) => {
              // Logging item structure để debug
              console.log("Processing lịch trực item:", item);

              // Cần map theo KhoaID từ model LichTruc
              if (item && item.KhoaID) {
                // Kiểm tra an toàn cho KhoaID
                let khoaId = null;

                // Xử lý KhoaID an toàn
                if (
                  item.KhoaID &&
                  typeof item.KhoaID === "object" &&
                  item.KhoaID._id
                ) {
                  khoaId = item.KhoaID._id;
                } else if (item.KhoaID && typeof item.KhoaID === "string") {
                  khoaId = item.KhoaID;
                }

                // Bỏ qua nếu khoaId là null hoặc undefined
                if (!khoaId) {
                  console.log(
                    "Skipping item with null/undefined KhoaID:",
                    item
                  );
                  return;
                }

                // Tìm mã khoa dựa trên ID của khoa
                let maKhoa = "";
                const matchedDept = khoasFromRedux.find(
                  (khoa) => khoa._id === khoaId
                );

                if (matchedDept) {
                  maKhoa = matchedDept.MaKhoa;
                  console.log(
                    `Matched department: ${matchedDept.TenKhoa}, MaKhoa: ${maKhoa}`
                  );
                } else {
                  console.log(
                    `No matching department found for KhoaID: ${khoaId}`
                  );
                }

                // Nếu có MaKhoa, lưu thông tin lịch trực
                if (maKhoa) {
                  schedulesData[maKhoa] = {
                    dieuDuong: item.DieuDuong || "",
                    bacSi: item.BacSi || "",
                    ghiChu: item.GhiChu || "",
                    khoaId: khoaId, // Lưu lại KhoaID để có thể sử dụng sau này
                  };
                } else if (item.MaKhoa) {
                  // Nếu không tìm được bằng KhoaID nhưng có MaKhoa
                  schedulesData[item.MaKhoa] = {
                    dieuDuong: item.DieuDuong || "",
                    bacSi: item.BacSi || "",
                    ghiChu: item.GhiChu || "",
                  };
                }
              } else if (item && item.MaKhoa) {
                // Fallback nếu không có KhoaID nhưng có MaKhoa (backwards compatibility)
                console.log(`Using MaKhoa fallback for: ${item.MaKhoa}`);
                schedulesData[item.MaKhoa] = {
                  dieuDuong: item.DieuDuong || "",
                  bacSi: item.BacSi || "",
                  ghiChu: item.GhiChu || "",
                };
              }
            });
          }
          console.log("Final mapped schedule data:", schedulesData);
          setSchedules(schedulesData);
          setLoading(false);
        })
        .catch((error) => {
          // Nếu API gặp lỗi
          console.error("Error fetching lịch trực:", error);
          console.log("Không thể tải dữ liệu lịch trực");
          setSchedules({});
          setLoading(false);
        });
    }
  }, [selectedDate, dispatch, khoasFromRedux]);

  // Hàm kiểm tra nếu có kết quả phù hợp với từ khóa tìm kiếm
  const matchesSearchTerm = (department, schedule) => {
    if (!searchTerm || !searchTerm.trim()) return true;

    const searchTermLower = searchTerm.toLowerCase().trim();
    const deptName = department?.ten?.toLowerCase() || "";

    // Tìm trong tên khoa
    if (deptName.includes(searchTermLower)) {
      return true;
    }

    // Lấy thông tin lịch trực, ưu tiên sử dụng schedule được truyền vào
    const deptSchedule = schedule ||
      (schedules && schedules[department.maKhoa]) || {
        dieuDuong: "",
        bacSi: "",
        ghiChu: "",
      };

    // Tìm trong danh sách điều dưỡng
    if (
      deptSchedule.dieuDuong &&
      deptSchedule.dieuDuong.toLowerCase().includes(searchTermLower)
    ) {
      return true;
    }

    // Tìm trong danh sách bác sĩ
    if (
      deptSchedule.bacSi &&
      deptSchedule.bacSi.toLowerCase().includes(searchTermLower)
    ) {
      return true;
    }

    // Tìm trong ghi chú
    if (
      deptSchedule.ghiChu &&
      deptSchedule.ghiChu.toLowerCase().includes(searchTermLower)
    ) {
      return true;
    } // Tìm kiếm không dấu
    const deptNameWithoutAccents = removeVietnameseTones(deptName);
    const searchTermWithoutAccents = removeVietnameseTones(searchTermLower);

    // Tìm trong tên khoa không dấu
    if (deptNameWithoutAccents.includes(searchTermWithoutAccents)) {
      return true;
    }

    // Tìm trong danh sách điều dưỡng không dấu
    if (
      deptSchedule.dieuDuong &&
      removeVietnameseTones(deptSchedule.dieuDuong.toLowerCase()).includes(
        searchTermWithoutAccents
      )
    ) {
      return true;
    }

    // Tìm trong danh sách bác sĩ không dấu
    if (
      deptSchedule.bacSi &&
      removeVietnameseTones(deptSchedule.bacSi.toLowerCase()).includes(
        searchTermWithoutAccents
      )
    ) {
      return true;
    }

    // Tìm trong ghi chú không dấu
    if (
      deptSchedule.ghiChu &&
      removeVietnameseTones(deptSchedule.ghiChu.toLowerCase()).includes(
        searchTermWithoutAccents
      )
    ) {
      return true;
    }

    return false;
  };
  // Lọc khoa theo nhóm khoa được chọn và từ khóa tìm kiếm
  const filteredDepartments = departments.filter((dept) => {
    // Kiểm tra lọc theo nhóm khoa
    const groupMatches = !selectedGroup
      ? true
      : (() => {
          const group = departmentGroups.find((g) => g.id === selectedGroup);
          // Kiểm tra xem phòng khoa hiện tại có trong danh sách khoa của nhóm
          return (
            group &&
            group.khoaIds.some((khoaId) => {
              // Kiểm tra an toàn cho khoaId null/undefined
              if (!khoaId) return false;

              // Có thể cần chuyển đổi định dạng ID dựa vào API
              // Nếu khoaId là một đối tượng với _id, so sánh với dept.id
              if (typeof khoaId === "object" && khoaId._id) {
                return khoaId._id === dept.id;
              }
              // Nếu khoaId là một string, so sánh trực tiếp
              return khoaId === dept.id;
            })
          );
        })();

    // Kiểm tra lọc theo từ khóa tìm kiếm
    const searchMatches = matchesSearchTerm(dept);

    return groupMatches && searchMatches;
  });

  // Chuyển đổi chế độ xem
  const toggleViewMode = () => {
    setViewMode((prev) =>
      prev === VIEW_MODES.COMPACT ? VIEW_MODES.EXPANDED : VIEW_MODES.COMPACT
    );
  };

  // Toggle hiển thị loại phòng
  const toggleDepartmentType = (type) => {
    setVisibleTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }; // Lấy danh sách khoa theo loại với tìm kiếm tiếng Việt
  const getDepartmentsByType = useCallback(
    (type) => {
      const typeDepartments = filteredDepartments.filter((dept) => {
        // Kiểm tra hisDepartmentType của phòng khoa
        return dept.hisDepartmentType === type;
      });

      if (!searchTerm) {
        return typeDepartments;
      }

      return typeDepartments.filter((dept) => {
        const schedule = schedules[dept.maKhoa];

        // Tìm kiếm trong tên khoa
        if (searchVietnamese(searchTerm, dept.ten)) return true;

        // Tìm kiếm trong thông tin lịch trực
        if (schedule) {
          if (searchVietnamese(searchTerm, schedule.dieuDuong)) return true;
          if (searchVietnamese(searchTerm, schedule.bacSi)) return true;
          if (searchVietnamese(searchTerm, schedule.ghiChu)) return true;
        }

        return false;
      });
    },
    [filteredDepartments, schedules, searchTerm]
  ); // Refresh data
  const refreshData = () => {
    setLoading(true);

    // Format ngày theo múi giờ Việt Nam
    const formattedDate = formatDateForAPI(selectedDate);

    console.log("Refreshing data for date:", formattedDate);

    // Thực hiện các promise đồng thời: lấy lịch trực, lấy nhóm khoa và lấy danh sách khoa
    Promise.all([
      dispatch(getLichTrucByDate(formattedDate)),
      dispatch(getAllNhomKhoa()),
      dispatch(getKhoas()),
    ])
      .then(([lichTrucResult]) => {
        console.log("Refresh completed, got data:", {
          lichTrucResult,
          departments: khoasFromRedux,
        });

        // Chuyển đổi dữ liệu từ mảng thành object để dễ truy cập theo KhoaID
        const schedulesData = {};

        if (Array.isArray(lichTrucResult)) {
          lichTrucResult.forEach((item) => {
            // Logging item structure để debug
            console.log("Processing refreshed lịch trực item:", item);

            // Cần map theo KhoaID từ model LichTruc
            if (item && item.KhoaID) {
              let khoaId = null;

              // Xử lý KhoaID an toàn
              if (
                item.KhoaID &&
                typeof item.KhoaID === "object" &&
                item.KhoaID._id
              ) {
                khoaId = item.KhoaID._id;
              } else if (item.KhoaID && typeof item.KhoaID === "string") {
                khoaId = item.KhoaID;
              }

              // Bỏ qua nếu khoaId là null hoặc undefined
              if (!khoaId) {
                console.log(
                  "Skipping refresh item with null/undefined KhoaID:",
                  item
                );
                return;
              }

              // Tìm mã khoa dựa trên ID của khoa
              let maKhoa = "";
              const matchedDept = khoasFromRedux.find(
                (khoa) => khoa._id === khoaId
              );

              if (matchedDept) {
                maKhoa = matchedDept.MaKhoa;
                console.log(
                  `Matched refreshed department: ${matchedDept.TenKhoa}, MaKhoa: ${maKhoa}`
                );
              } else {
                console.log(
                  `No matching department found for refreshed KhoaID: ${khoaId}`
                );
              }

              // Nếu có MaKhoa, lưu thông tin lịch trực
              if (maKhoa) {
                schedulesData[maKhoa] = {
                  dieuDuong: item.DieuDuong || "",
                  bacSi: item.BacSi || "",
                  ghiChu: item.GhiChu || "",
                  khoaId: khoaId, // Lưu lại KhoaID để có thể sử dụng sau này
                };
              } else if (item.MaKhoa) {
                // Nếu không tìm được bằng KhoaID nhưng có MaKhoa
                console.log(
                  `Using MaKhoa fallback during refresh for: ${item.MaKhoa}`
                );
                schedulesData[item.MaKhoa] = {
                  dieuDuong: item.DieuDuong || "",
                  bacSi: item.BacSi || "",
                  ghiChu: item.GhiChu || "",
                };
              }
            } else if (item && item.MaKhoa) {
              // Fallback nếu không có KhoaID nhưng có MaKhoa (backwards compatibility)
              console.log(
                `Using MaKhoa fallback during refresh for: ${item.MaKhoa}`
              );
              schedulesData[item.MaKhoa] = {
                dieuDuong: item.DieuDuong || "",
                bacSi: item.BacSi || "",
                ghiChu: item.GhiChu || "",
              };
            }
          });
        }
        console.log("Final refreshed schedule data:", schedulesData);
        setSchedules(schedulesData);
        setLoading(false);

        // Sau khi hoàn thành việc tải lịch trực, tiếp tục tải số thứ tự
        // Lọc khoa dựa trên nhóm khoa đã chọn
        let filteredKhoas = khoasFromRedux;

        // Nếu có nhóm khoa được chọn, lọc theo nhóm đó
        if (selectedGroup) {
          const selectedGroupData = departmentGroups.find(
            (g) => g.id === selectedGroup
          );

          if (selectedGroupData) {
            // Lấy danh sách ID khoa trong nhóm
            const khoaIdsInGroup = selectedGroupData.khoaIds
              .filter((khoaId) => khoaId !== null && khoaId !== undefined) // Lọc bỏ null/undefined
              .map((khoaId) => {
                // Nếu khoaId là object, lấy _id
                return typeof khoaId === "object" && khoaId && khoaId._id
                  ? khoaId._id
                  : khoaId;
              })
              .filter((id) => id !== null && id !== undefined); // Lọc bỏ null/undefined sau khi map

            // Lọc chỉ những khoa thuộc nhóm đã chọn
            filteredKhoas = khoasFromRedux.filter((khoa) =>
              khoaIdsInGroup.includes(khoa._id)
            );

            console.log(
              "Filtered khoas by selected group:",
              filteredKhoas.length
            );
          }
        }

        // Lấy danh sách HisDepartmentID từ danh sách khoa đã lọc
        const departmentIds = filteredKhoas
          .filter((khoa) => khoa.HisDepartmentID) // Lọc những khoa có HisDepartmentID
          .map((khoa) => khoa.HisDepartmentID); // Lấy ra mảng HisDepartmentID

        if (departmentIds.length > 0) {
          setLoadingSoThuTu(true);
          console.log(
            "Loading SoThuTu data with departmentIds:",
            departmentIds
          );

          // Dispatch action để lấy dữ liệu số thứ tự
          dispatch(getAllSoThuTuStats(formattedDate, departmentIds))
            .then(() => {
              console.log("SoThuTu data loaded successfully");
              setLoadingSoThuTu(false);
            })
            .catch((error) => {
              console.error("Error loading SoThuTu data:", error);
              setLoadingSoThuTu(false);
            });
        }
      })
      .catch((error) => {
        // Nếu API gặp lỗi
        console.error("Error refreshing data:", error);
        console.log("Không thể tải dữ liệu - vui lòng thử lại sau");
        setDepartments([]);
        setSchedules({});
        setDepartmentGroups([]);
        setLoading(false);
      });
  };
  const value = {
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
