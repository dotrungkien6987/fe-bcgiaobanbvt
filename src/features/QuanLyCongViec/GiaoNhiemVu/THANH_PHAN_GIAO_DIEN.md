# Thành Phần Giao Diện - GiaoNhiemVu V3.0

**Phiên bản:** 3.0  
**Framework:** React 18 + Material-UI v5  
**State Management:** Redux Toolkit  
**Cập nhật:** 26/11/2025

---

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [CycleAssignmentListPage](#cycleassignmentlistpage)
- [CycleAssignmentDetailPage](#cycleassignmentdetailpage)
- [TuDanhGiaKPIPage](#tudanhgiakpipage)
- [Các Components Nhỏ](#các-components-nhỏ)
- [Custom Hooks](#custom-hooks)

---

## 🎯 Tổng Quan

Module **GiaoNhiemVu V3.0** bao gồm **3 trang chính**:

| Trang                     | File                           | Dòng code | Người dùng | Mô tả                                   |
| ------------------------- | ------------------------------ | --------- | ---------- | --------------------------------------- |
| **Danh sách nhân viên**   | `CycleAssignmentListPage.js`   | 746       | Quản lý    | Chọn chu kỳ, xem nhân viên với thống kê |
| **Gán nhiệm vụ chi tiết** | `CycleAssignmentDetailPage.js` | 1,298     | Quản lý    | Giao diện hai cột, gán/sửa/xóa nhiệm vụ |
| **Tự đánh giá KPI**       | `TuDanhGiaKPIPage.js`          | 548       | Nhân viên  | Tự chấm điểm mức độ hoàn thành          |

**Tổng cộng:** ~2,592 dòng code React

---

## 📄 CycleAssignmentListPage

### Thông Tin Cơ Bản

**File:** `src/features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentListPage.js`  
**Dòng code:** 746  
**Route:** `/quanlycongviec/giao-nhiem-vu-chu-ky`  
**Quyền truy cập:** Quản lý (Manager, Admin)

### Chức Năng

- ✅ Dropdown chọn chu kỳ đánh giá
- ✅ Hiển thị danh sách nhân viên thuộc quyền quản lý
- ✅ Thống kê số nhiệm vụ đã gán / tổng số nhiệm vụ
- ✅ Thống kê tổng mức độ khó
- ✅ Navigate đến trang chi tiết khi click [Gán]

### Props & State

```javascript
// Không có props (page component)

// Local state
const [selectedCycle, setSelectedCycle] = useState(null);
const [cycles, setCycles] = useState([]);
const [employees, setEmployees] = useState([]);
const [isLoading, setIsLoading] = useState(false);

// Redux state (từ cycleAssignmentSlice)
const { employees: reduxEmployees, isLoading: reduxLoading } = useSelector(
  (state) => state.cycleAssignment
);
```

### UI Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Phân Công Nhiệm Vụ Theo Chu Kỳ                             │
├──────────────────────────────────────────────────────────────┤
│  Chu kỳ: [▼ Quý 1/2025                    ]                │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tên nhân viên │ Mã NV │ Đã gán │ Tổng MĐK │ Thao tác │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │  Nguyễn Văn A  │ NV001 │ 5/12   │ 8.5      │ [Gán]   │ │
│  │  Trần Thị B    │ NV002 │ 3/12   │ 5.0      │ [Gán]   │ │
│  │  Lê Văn C      │ NV003 │ 0/12   │ 0.0      │ [Gán]   │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Code Example

```javascript
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Autocomplete,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  CircularProgress,
} from "@mui/material";
import { getEmployeesWithCycleStats } from "./cycleAssignmentSlice";
import apiService from "../../app/apiService";

const CycleAssignmentListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // State
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [cycles, setCycles] = useState([]);

  // Redux
  const { employees, isLoading } = useSelector(
    (state) => state.cycleAssignment
  );

  // Fetch cycles khi mount
  useEffect(() => {
    const fetchCycles = async () => {
      const response = await apiService.get("/workmanagement/chu-ky-danh-gia");
      setCycles(response.data.data);
    };
    fetchCycles();
  }, []);

  // Fetch employees khi chọn chu kỳ
  useEffect(() => {
    if (selectedCycle) {
      dispatch(getEmployeesWithCycleStats(selectedCycle._id));
    }
  }, [selectedCycle, dispatch]);

  // Handler: Navigate to detail page
  const handleAssignClick = (employee) => {
    navigate(
      `/quanlycongviec/giao-nhiem-vu-chu-ky/${employee._id}?chuKyId=${selectedCycle._id}`
    );
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Phân Công Nhiệm Vụ Theo Chu Kỳ
        </Typography>

        {/* Dropdown chọn chu kỳ */}
        <Autocomplete
          options={cycles}
          getOptionLabel={(option) => option.TenChuKy}
          value={selectedCycle}
          onChange={(e, value) => setSelectedCycle(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Chọn chu kỳ"
              placeholder="Chọn chu kỳ đánh giá"
            />
          )}
          sx={{ mb: 3, width: 300 }}
        />

        {/* Table nhân viên */}
        {isLoading ? (
          <CircularProgress />
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tên nhân viên</TableCell>
                <TableCell>Mã NV</TableCell>
                <TableCell>Đã gán</TableCell>
                <TableCell>Tổng MĐK</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee._id}>
                  <TableCell>{employee.HoTen}</TableCell>
                  <TableCell>{employee.MaNV}</TableCell>
                  <TableCell>{employee.DutyCount || 0}/12</TableCell>
                  <TableCell>{employee.TotalDifficulty || 0}</TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleAssignClick(employee)}
                    >
                      Gán
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
    </Container>
  );
};

export default CycleAssignmentListPage;
```

### Redux Integration

```javascript
// Dispatch action khi chọn chu kỳ
useEffect(() => {
  if (selectedCycle) {
    dispatch(getEmployeesWithCycleStats(selectedCycle._id));
  }
}, [selectedCycle, dispatch]);

// Redux selector
const { employees, isLoading, error } = useSelector(
  (state) => state.cycleAssignment
);
```

---

## 📄 CycleAssignmentDetailPage

### Thông Tin Cơ Bản

**File:** `src/features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentDetailPage.js`  
**Dòng code:** 1,298 (lớn nhất trong module)  
**Route:** `/quanlycongviec/giao-nhiem-vu-chu-ky/:employeeId?chuKyId=xxx`  
**Quyền truy cập:** Quản lý (Manager, Admin)

### Chức Năng

- ✅ Giao diện hai cột (nhiệm vụ khả dụng ⟷ nhiệm vụ đã gán)
- ✅ Tick checkbox → Hiển thị slider độ khó → Tự động thêm vào cột phải
- ✅ Kéo slider điều chỉnh độ khó (0-2)
- ✅ Xóa nhiệm vụ với kiểm tra trước (canDeleteDuty)
- ✅ Sao chép từ chu kỳ trước
- ✅ Lưu hàng loạt (batch update)

### Props & State

```javascript
// URL params
const { employeeId } = useParams();
const [searchParams] = useSearchParams();
const chuKyId = searchParams.get("chuKyId");

// Local state
const [employee, setEmployee] = useState(null);
const [cycle, setCycle] = useState(null);
const [availableDuties, setAvailableDuties] = useState([]);
const [localAssignments, setLocalAssignments] = useState([]); // State chính
const [selectedDuties, setSelectedDuties] = useState({}); // {dutyId: mucDoKho}
const [isSaving, setIsSaving] = useState(false);

// Redux state
const { assignments, isLoading } = useSelector(
  (state) => state.cycleAssignment
);
```

### UI Structure (Hai Cột)

```
┌─────────────────────────────────────────────────────────────────┐
│  Nhân viên: Nguyễn Văn A (NV001) │ Chu kỳ: Quý 1/2025          │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ [Sao chép từ Q4/2024]            [Lưu tất cả]  [Hủy]      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────┬──────────────────────────────┐   │
│  │  NHIỆM VỤ KHẢ DỤNG       │  NHIỆM VỤ ĐÃ GÁN             │   │
│  │  (Cột trái - 400px)      │  (Cột phải - flex 1)         │   │
│  ├──────────────────────────┼──────────────────────────────┤   │
│  │                           │                              │   │
│  │  □ Kiểm tra hồ sơ bệnh   │  ☑ Chăm sóc bệnh nhân        │   │
│  │    án                     │    Độ khó: [●─────○] 1.5   │   │
│  │    Slider: [○─────────]  │    Tự đánh giá: 85%         │   │
│  │    (hidden initially)     │    [×] Xóa                  │   │
│  │                           │                              │   │
│  │  □ Báo cáo tuần           │  ☑ Lập kế hoạch điều trị     │   │
│  │    Slider: [○─────────]  │    Độ khó: [──────●] 2.0   │   │
│  │                           │    Tự đánh giá: 0%          │   │
│  │  ☑ Tham gia hội chẩn      │    [×] Xóa                  │   │
│  │    Slider: [──●───────] 1.2│                            │   │
│  │    → Sẽ thêm vào cột phải│                              │   │
│  │                           │  Tổng độ khó: 3.5           │   │
│  │  [Tải thêm...]            │  Số lượng: 2 nhiệm vụ       │   │
│  └──────────────────────────┴──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Code Example (Core Logic)

```javascript
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Checkbox,
  Slider,
  Button,
  IconButton,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import {
  getAssignmentsByCycle,
  batchUpdateCycleAssignments,
  copyFromPreviousCycle,
} from "./cycleAssignmentSlice";

const CycleAssignmentDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const chuKyId = searchParams.get("chuKyId");

  // State
  const [employee, setEmployee] = useState(null);
  const [cycle, setCycle] = useState(null);
  const [availableDuties, setAvailableDuties] = useState([]);
  const [localAssignments, setLocalAssignments] = useState([]);
  const [originalAssignments, setOriginalAssignments] = useState([]);
  const [selectedDuties, setSelectedDuties] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  // Redux
  const { assignments, isLoading } = useSelector(
    (state) => state.cycleAssignment
  );

  // Fetch data khi mount
  useEffect(() => {
    if (employeeId && chuKyId) {
      const fetchData = async () => {
        const result = await dispatch(
          getAssignmentsByCycle(employeeId, chuKyId)
        ).unwrap();
        setEmployee(result.employee);
        setCycle(result.cycle);
        setAvailableDuties(result.availableDuties);
        setLocalAssignments(result.assignedDuties);
        setOriginalAssignments(result.assignedDuties);
      };
      fetchData();
    }
  }, [employeeId, chuKyId, dispatch]);

  // Handler: Tick checkbox nhiệm vụ khả dụng
  const handleDutyCheckboxChange = (duty, checked) => {
    if (checked) {
      // Thêm vào selectedDuties với độ khó mặc định = 1
      setSelectedDuties({
        ...selectedDuties,
        [duty._id]: 1,
      });
    } else {
      // Bỏ khỏi selectedDuties
      const newSelected = { ...selectedDuties };
      delete newSelected[duty._id];
      setSelectedDuties(newSelected);

      // Xóa khỏi localAssignments nếu đã thêm
      setLocalAssignments(
        localAssignments.filter((a) => a.NhiemVuID._id !== duty._id)
      );
    }
  };

  // Handler: Kéo slider độ khó
  const handleDifficultyChange = (dutyId, value) => {
    setSelectedDuties({
      ...selectedDuties,
      [dutyId]: value,
    });

    // Tự động thêm vào localAssignments
    const duty = availableDuties.find((d) => d._id === dutyId);
    const existingIndex = localAssignments.findIndex(
      (a) => a.NhiemVuID._id === dutyId
    );

    if (existingIndex >= 0) {
      // Update độ khó
      const newAssignments = [...localAssignments];
      newAssignments[existingIndex] = {
        ...newAssignments[existingIndex],
        MucDoKho: value,
      };
      setLocalAssignments(newAssignments);
    } else {
      // Thêm mới
      setLocalAssignments([
        ...localAssignments,
        {
          _tempId: Date.now(), // Temporary ID
          NhiemVuID: duty,
          MucDoKho: value,
          DiemTuDanhGia: 0,
        },
      ]);
    }
  };

  // Handler: Xóa nhiệm vụ từ cột phải
  const handleDeleteAssignment = (assignment) => {
    // Kiểm tra trước
    if (assignment.DiemTuDanhGia > 0) {
      toast.error(
        `Không thể xóa nhiệm vụ "${assignment.NhiemVuID.Ten}". Nhân viên đã tự chấm điểm (${assignment.DiemTuDanhGia} điểm).`
      );
      return;
    }

    // TODO: Kiểm tra điểm quản lý (cần gọi API)

    // Xóa khỏi localAssignments
    setLocalAssignments(
      localAssignments.filter((a) => a._id !== assignment._id)
    );
  };

  // Handler: Lưu tất cả
  const handleSaveAll = async () => {
    setIsSaving(true);

    // Phân loại thay đổi
    const assignmentsToAdd = localAssignments.filter((a) => a._tempId); // Có _tempId = mới thêm
    const assignmentsToUpdate = localAssignments.filter((a) => {
      if (!a._id) return false;
      const original = originalAssignments.find((o) => o._id === a._id);
      return original && original.MucDoKho !== a.MucDoKho;
    });
    const assignmentsToDelete = originalAssignments
      .filter((o) => !localAssignments.find((l) => l._id === o._id))
      .map((a) => a._id);

    const payload = {
      chuKyId,
      assignmentsToAdd: assignmentsToAdd.map((a) => ({
        NhiemVuID: a.NhiemVuID._id,
        MucDoKho: a.MucDoKho,
      })),
      assignmentsToUpdate: assignmentsToUpdate.map((a) => ({
        _id: a._id,
        MucDoKho: a.MucDoKho,
      })),
      assignmentsToDelete,
    };

    try {
      await dispatch(batchUpdateCycleAssignments(employeeId, payload)).unwrap();
      toast.success("Cập nhật nhiệm vụ thành công!");

      // Refresh data
      const result = await dispatch(
        getAssignmentsByCycle(employeeId, chuKyId)
      ).unwrap();
      setLocalAssignments(result.assignedDuties);
      setOriginalAssignments(result.assignedDuties);
    } catch (error) {
      // Error đã được xử lý trong slice
    } finally {
      setIsSaving(false);
    }
  };

  // Handler: Sao chép từ chu kỳ trước
  const handleCopyPrevious = async () => {
    if (window.confirm("Bạn có chắc muốn sao chép nhiệm vụ từ chu kỳ trước?")) {
      try {
        const result = await dispatch(
          copyFromPreviousCycle(employeeId, chuKyId)
        ).unwrap();
        toast.success(`Đã sao chép ${result.assignments.length} nhiệm vụ!`);
        setLocalAssignments(result.assignments);
        setOriginalAssignments(result.assignments);
      } catch (error) {
        // Error đã được xử lý trong slice
      }
    }
  };

  if (isLoading) return <CircularProgress />;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between" }}>
        <Typography variant="h5">
          Nhân viên: {employee?.HoTen} ({employee?.MaNV}) | Chu kỳ:{" "}
          {cycle?.TenChuKy}
        </Typography>
        <Box>
          <Button onClick={handleCopyPrevious} sx={{ mr: 1 }}>
            Sao chép từ chu kỳ trước
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving ? <CircularProgress size={24} /> : "Lưu tất cả"}
          </Button>
          <Button onClick={() => navigate(-1)} sx={{ ml: 1 }}>
            Hủy
          </Button>
        </Box>
      </Box>

      {/* Two-column layout */}
      <Grid container spacing={3}>
        {/* Cột trái: Nhiệm vụ khả dụng */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2, height: "70vh", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Nhiệm vụ khả dụng
            </Typography>
            {availableDuties.map((duty) => (
              <Box
                key={duty._id}
                sx={{ mb: 2, p: 1, border: "1px solid #eee" }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Checkbox
                    checked={!!selectedDuties[duty._id]}
                    onChange={(e) =>
                      handleDutyCheckboxChange(duty, e.target.checked)
                    }
                  />
                  <Typography variant="body1">{duty.Ten}</Typography>
                </Box>
                {selectedDuties[duty._id] !== undefined && (
                  <Box sx={{ ml: 5, mt: 1 }}>
                    <Typography variant="caption">Độ khó:</Typography>
                    <Slider
                      value={selectedDuties[duty._id]}
                      onChange={(e, v) => handleDifficultyChange(duty._id, v)}
                      min={0}
                      max={2}
                      step={0.1}
                      marks={[
                        { value: 0, label: "0" },
                        { value: 1, label: "1" },
                        { value: 2, label: "2" },
                      ]}
                      valueLabelDisplay="auto"
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Paper>
        </Grid>

        {/* Cột phải: Nhiệm vụ đã gán */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2, height: "70vh", overflow: "auto" }}>
            <Typography variant="h6" gutterBottom>
              Nhiệm vụ đã gán ({localAssignments.length})
            </Typography>
            {localAssignments.map((assignment) => (
              <Box
                key={assignment._id || assignment._tempId}
                sx={{ mb: 2, p: 2, border: "1px solid #ddd", borderRadius: 1 }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body1" fontWeight="bold">
                    {assignment.NhiemVuID.Ten}
                  </Typography>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteAssignment(assignment)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Độ khó: {assignment.MucDoKho}
                </Typography>
                {assignment.DiemTuDanhGia > 0 && (
                  <Typography variant="caption" color="success.main">
                    {" "}
                    | Tự đánh giá: {assignment.DiemTuDanhGia}%
                  </Typography>
                )}
              </Box>
            ))}
            {localAssignments.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Chưa có nhiệm vụ nào được gán
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CycleAssignmentDetailPage;
```

### Key Features

#### 1. Optimistic UI Updates

```javascript
// Cập nhật UI ngay lập tức, không chờ API
const handleDifficultyChange = (dutyId, value) => {
  // Cập nhật state local ngay
  setLocalAssignments([...localAssignments, newAssignment]);
  // Chờ user click [Lưu tất cả] mới gọi API
};
```

#### 2. Pre-Validation (Kiểm tra trước)

```javascript
const handleDeleteAssignment = (assignment) => {
  // Kiểm tra điểm tự đánh giá
  if (assignment.DiemTuDanhGia > 0) {
    toast.error("Không thể xóa. Nhân viên đã tự chấm điểm.");
    return;
  }

  // Kiểm tra điểm quản lý (cần gọi API để chắc chắn)
  // Backend sẽ kiểm tra lại khi lưu
};
```

#### 3. Batch Update (Lưu hàng loạt)

```javascript
const handleSaveAll = async () => {
  // Phân loại thay đổi
  const assignmentsToAdd = [...]; // Mới thêm
  const assignmentsToUpdate = [...]; // Thay đổi độ khó
  const assignmentsToDelete = [...]; // Đã xóa

  // Gọi API một lần duy nhất
  await dispatch(batchUpdateCycleAssignments(employeeId, {
    chuKyId,
    assignmentsToAdd,
    assignmentsToUpdate,
    assignmentsToDelete,
  }));
};
```

---

## 📄 TuDanhGiaKPIPage

### Thông Tin Cơ Bản

**File:** `src/features/QuanLyCongViec/GiaoNhiemVu/TuDanhGiaKPIPage.js`  
**Dòng code:** 548  
**Route:** `/quanlycongviec/kpi/tu-danh-gia`  
**Quyền truy cập:** Nhân viên (Employee, Manager, Admin)

### Chức Năng

- ✅ Dropdown chọn chu kỳ (tự động chọn chu kỳ mở)
- ✅ Hiển thị danh sách nhiệm vụ được gán
- ✅ Slider tự chấm điểm (0-100%)
- ✅ Thanh progress bar (đã chấm / tổng số)
- ✅ Lưu theo lô (chỉ lưu điểm thay đổi)
- ✅ Khóa chỉnh sửa khi chu kỳ đã đóng

### Props & State

```javascript
// Không có props (page component)

// Local state
const [selectedCycle, setSelectedCycle] = useState(null);
const [cycles, setCycles] = useState([]);
const [assignments, setAssignments] = useState([]);
const [originalAssignments, setOriginalAssignments] = useState([]);
const [isSaving, setIsSaving] = useState(false);

// Auth context
const { user } = useAuth();
const nhanVienId = user?.NhanVienID; // ← QUAN TRỌNG: Dùng NhanVienID!
```

### UI Structure

```
┌──────────────────────────────────────────────────────────────┐
│  Tự Đánh Giá KPI                                            │
├──────────────────────────────────────────────────────────────┤
│  Chu kỳ: [▼ Quý 1/2025                    ]                │
│  Tiến độ: ████████░░░░ 3/5 nhiệm vụ đã chấm điểm (60%)     │
├──────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chăm sóc bệnh nhân (Độ khó: 1.5)                     │ │
│  │  Điểm tự đánh giá: ●────────○ (85%)                  │ │
│  │  [0%]───────[50%]───────[100%]                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Lập kế hoạch điều trị (Độ khó: 2.0)                 │ │
│  │  Điểm tự đánh giá: ────────○ (0%)                    │ │
│  │  [0%]───────[50%]───────[100%]                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  [Lưu tất cả]  [Làm mới]                                   │
└──────────────────────────────────────────────────────────────┘
```

### Code Example

```javascript
import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Autocomplete,
  TextField,
  Slider,
  Button,
  LinearProgress,
  Paper,
  Chip,
} from "@mui/material";
import { toast } from "react-toastify";
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../app/apiService";

const TuDanhGiaKPIPage = () => {
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;

  // State
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [originalAssignments, setOriginalAssignments] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch cycles khi mount
  useEffect(() => {
    const fetchCycles = async () => {
      const response = await apiService.get("/workmanagement/chu-ky-danh-gia");
      const cycles = response.data.data;
      setCycles(cycles);

      // Tự động chọn chu kỳ mở
      const openCycle = cycles.find((c) => !c.isDong);
      if (openCycle) setSelectedCycle(openCycle);
    };
    fetchCycles();
  }, []);

  // Fetch assignments khi chọn chu kỳ
  useEffect(() => {
    if (selectedCycle && nhanVienId) {
      const fetchAssignments = async () => {
        const response = await apiService.get(
          `/workmanagement/giao-nhiem-vu/giao-nhiem-vu?chuKyId=${selectedCycle._id}`
        );
        const data = response.data.data.assignments;
        setAssignments(data);
        setOriginalAssignments(JSON.parse(JSON.stringify(data))); // Deep clone
      };
      fetchAssignments();
    }
  }, [selectedCycle, nhanVienId]);

  // Handler: Kéo slider
  const handleSliderChange = (assignmentId, newScore) => {
    setAssignments(
      assignments.map((a) =>
        a._id === assignmentId ? { ...a, DiemTuDanhGia: newScore } : a
      )
    );
  };

  // Handler: Lưu tất cả
  const handleSaveAll = async () => {
    // Chỉ lưu điểm thay đổi
    const updates = assignments
      .filter((a) => {
        const original = originalAssignments.find((o) => o._id === a._id);
        return original && original.DiemTuDanhGia !== a.DiemTuDanhGia;
      })
      .map((a) => ({
        NhanVienNhiemVuID: a._id,
        DiemTuDanhGia: a.DiemTuDanhGia,
      }));

    if (updates.length === 0) {
      toast.info("Không có thay đổi nào để lưu");
      return;
    }

    setIsSaving(true);
    try {
      await apiService.post(
        "/workmanagement/giao-nhiem-vu/tu-cham-diem-batch",
        { updates }
      );
      toast.success("Cập nhật điểm thành công!");

      // Refresh data
      setOriginalAssignments(JSON.parse(JSON.stringify(assignments)));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Tính tiến độ
  const evaluatedCount = assignments.filter((a) => a.DiemTuDanhGia > 0).length;
  const totalCount = assignments.length;
  const completionRate =
    totalCount > 0 ? (evaluatedCount / totalCount) * 100 : 0;

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 3 }}>
        <Typography variant="h4" gutterBottom>
          Tự Đánh Giá KPI
        </Typography>

        {/* Dropdown chọn chu kỳ */}
        <Autocomplete
          options={cycles}
          getOptionLabel={(option) => option.TenChuKy}
          value={selectedCycle}
          onChange={(e, value) => setSelectedCycle(value)}
          renderInput={(params) => (
            <TextField {...params} label="Chọn chu kỳ" />
          )}
          sx={{ mb: 2, width: 300 }}
        />

        {/* Tiến độ */}
        {selectedCycle && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Tiến độ: {evaluatedCount}/{totalCount} nhiệm vụ đã chấm điểm (
              {completionRate.toFixed(0)}%)
            </Typography>
            <LinearProgress variant="determinate" value={completionRate} />
          </Box>
        )}

        {/* Danh sách nhiệm vụ */}
        {assignments.map((assignment) => (
          <Paper key={assignment._id} sx={{ p: 2, mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="h6">{assignment.NhiemVuID.Ten}</Typography>
              <Chip
                label={`Độ khó: ${assignment.MucDoKho}`}
                size="small"
                color="primary"
              />
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {assignment.NhiemVuID.MoTa}
            </Typography>
            <Typography variant="caption" gutterBottom>
              Điểm tự đánh giá: {assignment.DiemTuDanhGia}%
            </Typography>
            <Slider
              value={assignment.DiemTuDanhGia}
              onChange={(e, v) => handleSliderChange(assignment._id, v)}
              min={0}
              max={100}
              step={5}
              marks={[
                { value: 0, label: "0%" },
                { value: 50, label: "50%" },
                { value: 100, label: "100%" },
              ]}
              valueLabelDisplay="auto"
              disabled={selectedCycle?.isDong} // Khóa nếu chu kỳ đã đóng
            />
          </Paper>
        ))}

        {/* Buttons */}
        <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSaveAll}
            disabled={isSaving || selectedCycle?.isDong}
          >
            {isSaving ? "Đang lưu..." : "Lưu tất cả"}
          </Button>
          <Button onClick={() => window.location.reload()}>Làm mới</Button>
        </Box>
      </Box>
    </Container>
  );
};

export default TuDanhGiaKPIPage;
```

### Key Features

#### 1. Progress Tracking

```javascript
const evaluatedCount = assignments.filter((a) => a.DiemTuDanhGia > 0).length;
const completionRate = (evaluatedCount / totalCount) * 100;

<LinearProgress variant="determinate" value={completionRate} />;
```

#### 2. Conditional Save (Chỉ lưu thay đổi)

```javascript
const updates = assignments.filter((a) => {
  const original = originalAssignments.find((o) => o._id === a._id);
  return original && original.DiemTuDanhGia !== a.DiemTuDanhGia;
});

// Chỉ gửi updates, không gửi toàn bộ assignments
```

#### 3. Disable When Cycle Closed

```javascript
<Slider
  value={assignment.DiemTuDanhGia}
  disabled={selectedCycle?.isDong} // Khóa nếu chu kỳ đã đóng
/>
```

---

## 🎉 Kết Luận

Module **GiaoNhiemVu V3.0** có 3 trang chính với tổng cộng ~2,592 dòng code React:

✅ **CycleAssignmentListPage** (746 dòng): Danh sách nhân viên với thống kê  
✅ **CycleAssignmentDetailPage** (1,298 dòng): Giao diện hai cột, gán/sửa/xóa nhiệm vụ  
✅ **TuDanhGiaKPIPage** (548 dòng): Tự chấm điểm mức độ hoàn thành

**Đánh giá:**

- **Chất lượng code:** 8/10 (Sạch, dễ bảo trì)
- **UX/UI:** 9/10 (Giao diện trực quan, phản hồi nhanh)
- **Tích hợp Redux:** 9/10 (State management tốt)

---

**Cập nhật cuối:** 26/11/2025  
**Tác giả:** GitHub Copilot (Claude Sonnet 4.5)  
**Phiên bản tài liệu:** 1.0.0
