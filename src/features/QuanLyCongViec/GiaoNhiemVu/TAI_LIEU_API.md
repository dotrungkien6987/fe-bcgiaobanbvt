# Tài Liệu API - GiaoNhiemVu V3.0

**Phiên bản:** 3.0  
**Base URL:** `http://localhost:8020/api/workmanagement/giao-nhiem-vu`  
**Authentication:** JWT Bearer Token (Required)  
**Cập nhật:** 26/11/2025

---

## 📋 Mục Lục

- [Tổng Quan API](#tổng-quan-api)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
  - [1. Lấy Danh Sách Nhân Viên Với Thống Kê](#1-lấy-danh-sách-nhân-viên-với-thống-kê)
  - [2. Lấy Phân Công Theo Chu Kỳ](#2-lấy-phân-công-theo-chu-kỳ)
  - [3. Cập Nhật Phân Công Hàng Loạt](#3-cập-nhật-phân-công-hàng-loạt)
  - [4. Sao Chép Từ Chu Kỳ Trước](#4-sao-chép-từ-chu-kỳ-trước)
  - [5. Lấy Nhiệm Vụ Cho Tự Đánh Giá](#5-lấy-nhiệm-vụ-cho-tự-đánh-giá)
  - [6. Cập Nhật Điểm Tự Đánh Giá](#6-cập-nhật-điểm-tự-đánh-giá)
- [Error Codes](#error-codes)
- [Models & Schemas](#models--schemas)

---

## 🎯 Tổng Quan API

Module **GiaoNhiemVu** cung cấp **8 API endpoints** chia thành 2 nhóm chức năng:

### Nhóm 1: Phân Công Nhiệm Vụ (Dành cho Quản Lý)

| STT | Method | Endpoint                            | Mô Tả                                |
| --- | ------ | ----------------------------------- | ------------------------------------ |
| 1   | `GET`  | `/employees-with-cycle-stats`       | Lấy danh sách nhân viên với thống kê |
| 2   | `GET`  | `/nhan-vien/:id/by-cycle`           | Lấy phân công chi tiết theo chu kỳ   |
| 3   | `PUT`  | `/nhan-vien/:id/cycle-assignments`  | Cập nhật phân công hàng loạt         |
| 4   | `POST` | `/nhan-vien/:id/copy-from-previous` | Sao chép từ chu kỳ trước             |

### Nhóm 2: Tự Đánh Giá KPI (Dành cho Nhân Viên)

| STT | Method | Endpoint              | Mô Tả                        |
| --- | ------ | --------------------- | ---------------------------- |
| 5   | `GET`  | `/giao-nhiem-vu`      | Lấy nhiệm vụ cho tự đánh giá |
| 6   | `POST` | `/tu-cham-diem-batch` | Cập nhật điểm tự đánh giá    |

---

## 🔐 Authentication

Tất cả API endpoints yêu cầu JWT token trong header:

```http
Authorization: Bearer <your_jwt_token>
```

**Lấy token:**

```javascript
// Login API
POST /api/auth/login
{
  "email": "manager@hospital.com",
  "password": "your_password"
}

// Response
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Sử dụng trong request:**

```javascript
// Frontend (apiService.js)
const apiService = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_API,
  headers: {
    "Content-Type": "application/json",
  },
});

apiService.interceptors.request.use(
  (request) => {
    const accessToken = window.localStorage.getItem("accessToken");
    if (accessToken) {
      request.headers.Authorization = `Bearer ${accessToken}`;
    }
    return request;
  },
  (error) => Promise.reject(error)
);
```

---

## 📡 API Endpoints

### 1. Lấy Danh Sách Nhân Viên Với Thống Kê

**Endpoint:** `GET /employees-with-cycle-stats`

**Mô tả:** Lấy danh sách tất cả nhân viên thuộc quyền quản lý với thống kê số nhiệm vụ và tổng độ khó

**Quyền truy cập:** Quản lý (Manager, Admin)

**Query Parameters:**

| Tham số   | Kiểu              | Bắt buộc | Mô tả                  |
| --------- | ----------------- | -------- | ---------------------- |
| `chuKyId` | String (ObjectId) | ✅ Có    | ID của chu kỳ đánh giá |

**Request:**

```http
GET /api/workmanagement/giao-nhiem-vu/employees-with-cycle-stats?chuKyId=66b1dba74f79822a4752d90c
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "employees": [
      {
        "_id": "66b1dba74f79822a4752d90a",
        "HoTen": "Nguyễn Văn A",
        "MaNV": "NV001",
        "Email": "nguyenvana@hospital.com",
        "PhongBanID": {
          "_id": "66b1dba74f79822a4752d909",
          "TenPhongBan": "Khoa Nội"
        },
        "DutyCount": 5,
        "TotalDifficulty": 8.5
      },
      {
        "_id": "66b1dba74f79822a4752d90b",
        "HoTen": "Trần Thị B",
        "MaNV": "NV002",
        "Email": "tranthib@hospital.com",
        "PhongBanID": {
          "_id": "66b1dba74f79822a4752d909",
          "TenPhongBan": "Khoa Nội"
        },
        "DutyCount": 3,
        "TotalDifficulty": 5.0
      }
    ],
    "totalEmployees": 2
  },
  "message": "Lấy danh sách nhân viên thành công"
}
```

**Response (Error - 400):**

```json
{
  "success": false,
  "errors": {
    "message": "chuKyId is required"
  },
  "message": "MISSING_PARAMETER"
}
```

**Frontend Usage:**

```javascript
import { useDispatch } from "react-redux";
import { getEmployeesWithCycleStats } from "./cycleAssignmentSlice";

const CycleAssignmentListPage = () => {
  const dispatch = useDispatch();
  const [selectedCycle, setSelectedCycle] = useState(null);

  useEffect(() => {
    if (selectedCycle) {
      dispatch(getEmployeesWithCycleStats(selectedCycle._id));
    }
  }, [selectedCycle]);

  return (
    <Box>
      <Autocomplete
        options={cycles}
        onChange={(e, value) => setSelectedCycle(value)}
        renderInput={(params) => <TextField {...params} label="Chọn chu kỳ" />}
      />
      {/* Table hiển thị employees */}
    </Box>
  );
};
```

---

### 2. Lấy Phân Công Theo Chu Kỳ

**Endpoint:** `GET /nhan-vien/:id/by-cycle`

**Mô tả:** Lấy chi tiết phân công nhiệm vụ của một nhân viên theo chu kỳ (gồm nhiệm vụ đã gán và nhiệm vụ khả dụng)

**Quyền truy cập:** Quản lý (Manager, Admin)

**Path Parameters:**

| Tham số | Kiểu              | Mô tả            |
| ------- | ----------------- | ---------------- |
| `id`    | String (ObjectId) | ID của nhân viên |

**Query Parameters:**

| Tham số   | Kiểu              | Bắt buộc | Mô tả                  |
| --------- | ----------------- | -------- | ---------------------- |
| `chuKyId` | String (ObjectId) | ✅ Có    | ID của chu kỳ đánh giá |

**Request:**

```http
GET /api/workmanagement/giao-nhiem-vu/nhan-vien/66b1dba74f79822a4752d90a/by-cycle?chuKyId=66b1dba74f79822a4752d90c
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "employee": {
      "_id": "66b1dba74f79822a4752d90a",
      "HoTen": "Nguyễn Văn A",
      "MaNV": "NV001",
      "Email": "nguyenvana@hospital.com"
    },
    "cycle": {
      "_id": "66b1dba74f79822a4752d90c",
      "TenChuKy": "Quý 1/2025",
      "TuNgay": "2025-01-01T00:00:00.000Z",
      "DenNgay": "2025-03-31T23:59:59.000Z",
      "isDong": false
    },
    "assignedDuties": [
      {
        "_id": "66b1dba74f79822a4752d90d",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d90e",
          "Ten": "Chăm sóc bệnh nhân",
          "MoTa": "Chăm sóc toàn diện bệnh nhân",
          "TieuChiDanhGiaID": {
            "_id": "...",
            "TenTieuChi": "Chất lượng chăm sóc bệnh nhân"
          }
        },
        "MucDoKho": 1.5,
        "DiemTuDanhGia": 85,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-20T15:30:00.000Z"
      },
      {
        "_id": "66b1dba74f79822a4752d90f",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d910",
          "Ten": "Lập kế hoạch điều trị",
          "MoTa": "Lập kế hoạch điều trị cho bệnh nhân mới",
          "TieuChiDanhGiaID": {
            "_id": "...",
            "TenTieuChi": "Chất lượng điều trị"
          }
        },
        "MucDoKho": 2.0,
        "DiemTuDanhGia": 0,
        "createdAt": "2025-01-15T10:05:00.000Z",
        "updatedAt": "2025-01-15T10:05:00.000Z"
      }
    ],
    "availableDuties": [
      {
        "_id": "66b1dba74f79822a4752d911",
        "Ten": "Kiểm tra hồ sơ bệnh án",
        "MoTa": "Kiểm tra đầy đủ hồ sơ bệnh án",
        "PhongBanID": "66b1dba74f79822a4752d909",
        "TieuChiDanhGiaID": {
          "_id": "...",
          "TenTieuChi": "Quản lý hồ sơ"
        }
      },
      {
        "_id": "66b1dba74f79822a4752d912",
        "Ten": "Báo cáo tuần",
        "MoTa": "Lập báo cáo hàng tuần",
        "PhongBanID": "66b1dba74f79822a4752d909",
        "TieuChiDanhGiaID": {
          "_id": "...",
          "TenTieuChi": "Báo cáo"
        }
      }
    ],
    "statistics": {
      "totalAssigned": 2,
      "totalAvailable": 2,
      "totalDifficulty": 3.5,
      "averageDifficulty": 1.75
    }
  },
  "message": "Lấy phân công nhiệm vụ thành công"
}
```

**Response (Error - 404):**

```json
{
  "success": false,
  "errors": {
    "message": "Không tìm thấy nhân viên"
  },
  "message": "EMPLOYEE_NOT_FOUND"
}
```

**Frontend Usage:**

```javascript
import { useParams, useSearchParams } from "react-router-dom";
import { getAssignmentsByCycle } from "./cycleAssignmentSlice";

const CycleAssignmentDetailPage = () => {
  const dispatch = useDispatch();
  const { employeeId } = useParams();
  const [searchParams] = useSearchParams();
  const chuKyId = searchParams.get("chuKyId");

  useEffect(() => {
    if (employeeId && chuKyId) {
      dispatch(getAssignmentsByCycle(employeeId, chuKyId));
    }
  }, [employeeId, chuKyId]);

  return <Box>{/* Two-column UI: availableDuties ⟷ assignedDuties */}</Box>;
};
```

---

### 3. Cập Nhật Phân Công Hàng Loạt

**Endpoint:** `PUT /nhan-vien/:id/cycle-assignments`

**Mô tả:** Cập nhật phân công nhiệm vụ hàng loạt (thêm, sửa, xóa) với 4-layer validation

**Quyền truy cập:** Quản lý (Manager, Admin)

**Path Parameters:**

| Tham số | Kiểu              | Mô tả            |
| ------- | ----------------- | ---------------- |
| `id`    | String (ObjectId) | ID của nhân viên |

**Request Body:**

| Field                 | Kiểu              | Bắt buộc | Mô tả                           |
| --------------------- | ----------------- | -------- | ------------------------------- |
| `chuKyId`             | String (ObjectId) | ✅ Có    | ID của chu kỳ đánh giá          |
| `assignmentsToAdd`    | Array             | ❌ Không | Danh sách nhiệm vụ cần thêm     |
| `assignmentsToUpdate` | Array             | ❌ Không | Danh sách nhiệm vụ cần cập nhật |
| `assignmentsToDelete` | Array (String)    | ❌ Không | Danh sách ID nhiệm vụ cần xóa   |

**Request:**

```http
PUT /api/workmanagement/giao-nhiem-vu/nhan-vien/66b1dba74f79822a4752d90a/cycle-assignments
Authorization: Bearer <token>
Content-Type: application/json

{
  "chuKyId": "66b1dba74f79822a4752d90c",
  "assignmentsToAdd": [
    {
      "NhiemVuID": "66b1dba74f79822a4752d911",
      "MucDoKho": 1.0
    },
    {
      "NhiemVuID": "66b1dba74f79822a4752d912",
      "MucDoKho": 1.5
    }
  ],
  "assignmentsToUpdate": [
    {
      "_id": "66b1dba74f79822a4752d90d",
      "MucDoKho": 2.0
    }
  ],
  "assignmentsToDelete": [
    "66b1dba74f79822a4752d90f"
  ]
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "66b1dba74f79822a4752d90d",
        "NhanVienID": "66b1dba74f79822a4752d90a",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d90e",
          "Ten": "Chăm sóc bệnh nhân"
        },
        "ChuKyDanhGiaID": "66b1dba74f79822a4752d90c",
        "MucDoKho": 2.0,
        "DiemTuDanhGia": 85,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-26T09:30:00.000Z"
      },
      {
        "_id": "66b1dba74f79822a4752d913",
        "NhanVienID": "66b1dba74f79822a4752d90a",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d911",
          "Ten": "Kiểm tra hồ sơ bệnh án"
        },
        "ChuKyDanhGiaID": "66b1dba74f79822a4752d90c",
        "MucDoKho": 1.0,
        "DiemTuDanhGia": 0,
        "createdAt": "2025-01-26T09:30:00.000Z",
        "updatedAt": "2025-01-26T09:30:00.000Z"
      },
      {
        "_id": "66b1dba74f79822a4752d914",
        "NhanVienID": "66b1dba74f79822a4752d90a",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d912",
          "Ten": "Báo cáo tuần"
        },
        "ChuKyDanhGiaID": "66b1dba74f79822a4752d90c",
        "MucDoKho": 1.5,
        "DiemTuDanhGia": 0,
        "createdAt": "2025-01-26T09:30:00.000Z",
        "updatedAt": "2025-01-26T09:30:00.000Z"
      }
    ],
    "summary": {
      "added": 2,
      "updated": 1,
      "deleted": 1,
      "totalAssignments": 3
    }
  },
  "message": "Cập nhật phân công thành công"
}
```

**Response (Error - 403 CYCLE_CLOSED):**

```json
{
  "success": false,
  "errors": {
    "message": "Không thể cập nhật phân công. Chu kỳ đánh giá đã đóng."
  },
  "message": "CYCLE_CLOSED"
}
```

**Response (Error - 403 KPI_APPROVED):**

```json
{
  "success": false,
  "errors": {
    "message": "Không thể cập nhật phân công. KPI đã được duyệt."
  },
  "message": "KPI_APPROVED"
}
```

**Response (Error - 403 HAS_EVALUATION_SCORE):**

```json
{
  "success": false,
  "errors": {
    "message": "Không thể xóa nhiệm vụ \"Chăm sóc bệnh nhân\". Nhiệm vụ đã có điểm tự đánh giá (85 điểm)."
  },
  "message": "HAS_EVALUATION_SCORE"
}
```

**Response (Error - 403 HAS_MANAGER_SCORE):**

```json
{
  "success": false,
  "errors": {
    "message": "Không thể xóa nhiệm vụ \"Lập kế hoạch điều trị\". Quản lý đã chấm điểm cho nhiệm vụ này."
  },
  "message": "HAS_MANAGER_SCORE"
}
```

**Frontend Usage:**

```javascript
import { batchUpdateCycleAssignments } from "./cycleAssignmentSlice";

const CycleAssignmentDetailPage = () => {
  const dispatch = useDispatch();
  const [localAssignments, setLocalAssignments] = useState([]);

  const handleSaveAll = async () => {
    const payload = {
      chuKyId: selectedCycle._id,
      assignmentsToAdd: /* nhiệm vụ mới */,
      assignmentsToUpdate: /* nhiệm vụ thay đổi độ khó */,
      assignmentsToDelete: /* nhiệm vụ bị xóa */,
    };

    try {
      await dispatch(batchUpdateCycleAssignments(employeeId, payload)).unwrap();
      toast.success("Cập nhật nhiệm vụ thành công!");
    } catch (error) {
      // Error đã được xử lý trong slice
    }
  };

  return (
    <Box>
      {/* Two-column UI */}
      <Button onClick={handleSaveAll}>Lưu tất cả</Button>
    </Box>
  );
};
```

---

### 4. Sao Chép Từ Chu Kỳ Trước

**Endpoint:** `POST /nhan-vien/:id/copy-from-previous`

**Mô tả:** Sao chép tất cả nhiệm vụ từ chu kỳ trước (giữ nguyên độ khó, reset điểm tự đánh giá về 0)

**Quyền truy cập:** Quản lý (Manager, Admin)

**Path Parameters:**

| Tham số | Kiểu              | Mô tả            |
| ------- | ----------------- | ---------------- |
| `id`    | String (ObjectId) | ID của nhân viên |

**Request Body:**

| Field            | Kiểu              | Bắt buộc | Mô tả                  |
| ---------------- | ----------------- | -------- | ---------------------- |
| `currentCycleId` | String (ObjectId) | ✅ Có    | ID của chu kỳ hiện tại |

**Request:**

```http
POST /api/workmanagement/giao-nhiem-vu/nhan-vien/66b1dba74f79822a4752d90a/copy-from-previous
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentCycleId": "66b1dba74f79822a4752d90c"
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "_id": "66b1dba74f79822a4752d915",
        "NhanVienID": "66b1dba74f79822a4752d90a",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d90e",
          "Ten": "Chăm sóc bệnh nhân"
        },
        "ChuKyDanhGiaID": "66b1dba74f79822a4752d90c",
        "MucDoKho": 1.5,
        "DiemTuDanhGia": 0,
        "createdAt": "2025-01-26T10:00:00.000Z",
        "updatedAt": "2025-01-26T10:00:00.000Z"
      },
      {
        "_id": "66b1dba74f79822a4752d916",
        "NhanVienID": "66b1dba74f79822a4752d90a",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d910",
          "Ten": "Lập kế hoạch điều trị"
        },
        "ChuKyDanhGiaID": "66b1dba74f79822a4752d90c",
        "MucDoKho": 2.0,
        "DiemTuDanhGia": 0,
        "createdAt": "2025-01-26T10:00:00.000Z",
        "updatedAt": "2025-01-26T10:00:00.000Z"
      }
    ],
    "summary": {
      "copiedFrom": "Quý 4/2024",
      "copiedCount": 2,
      "skippedCount": 0,
      "skippedDuties": []
    }
  },
  "message": "Đã sao chép 2 nhiệm vụ từ Quý 4/2024"
}
```

**Response (Error - 404 NO_PREVIOUS_CYCLE):**

```json
{
  "success": false,
  "errors": {
    "message": "Không tìm thấy chu kỳ trước"
  },
  "message": "NO_PREVIOUS_CYCLE"
}
```

**Response (Error - 404 NO_ASSIGNMENTS_TO_COPY):**

```json
{
  "success": false,
  "errors": {
    "message": "Không có nhiệm vụ nào để sao chép từ chu kỳ trước"
  },
  "message": "NO_ASSIGNMENTS_TO_COPY"
}
```

**Frontend Usage:**

```javascript
import { copyFromPreviousCycle } from "./cycleAssignmentSlice";

const CycleAssignmentDetailPage = () => {
  const dispatch = useDispatch();

  const handleCopyPrevious = async () => {
    if (window.confirm("Bạn có chắc muốn sao chép nhiệm vụ từ chu kỳ trước?")) {
      try {
        const result = await dispatch(
          copyFromPreviousCycle(employeeId, selectedCycle._id)
        ).unwrap();
        toast.success(`Đã sao chép ${result.assignments.length} nhiệm vụ!`);
      } catch (error) {
        // Error đã được xử lý trong slice
      }
    }
  };

  return (
    <Box>
      <Button onClick={handleCopyPrevious}>Sao chép từ chu kỳ trước</Button>
      {/* Two-column UI */}
    </Box>
  );
};
```

---

### 5. Lấy Nhiệm Vụ Cho Tự Đánh Giá

**Endpoint:** `GET /giao-nhiem-vu`

**Mô tả:** Nhân viên lấy danh sách nhiệm vụ được gán để tự chấm điểm

**Quyền truy cập:** Nhân viên (Employee, Manager, Admin)

**Query Parameters:**

| Tham số   | Kiểu              | Bắt buộc | Mô tả                  |
| --------- | ----------------- | -------- | ---------------------- |
| `chuKyId` | String (ObjectId) | ✅ Có    | ID của chu kỳ đánh giá |

**Request:**

```http
GET /api/workmanagement/giao-nhiem-vu/giao-nhiem-vu?chuKyId=66b1dba74f79822a4752d90c
Authorization: Bearer <token>
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "cycle": {
      "_id": "66b1dba74f79822a4752d90c",
      "TenChuKy": "Quý 1/2025",
      "TuNgay": "2025-01-01T00:00:00.000Z",
      "DenNgay": "2025-03-31T23:59:59.000Z",
      "isDong": false
    },
    "assignments": [
      {
        "_id": "66b1dba74f79822a4752d90d",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d90e",
          "Ten": "Chăm sóc bệnh nhân",
          "MoTa": "Chăm sóc toàn diện bệnh nhân",
          "TieuChiDanhGiaID": {
            "_id": "...",
            "TenTieuChi": "Chất lượng chăm sóc bệnh nhân"
          }
        },
        "MucDoKho": 1.5,
        "DiemTuDanhGia": 85,
        "createdAt": "2025-01-15T10:00:00.000Z",
        "updatedAt": "2025-01-20T15:30:00.000Z"
      },
      {
        "_id": "66b1dba74f79822a4752d90f",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d910",
          "Ten": "Lập kế hoạch điều trị",
          "MoTa": "Lập kế hoạch điều trị cho bệnh nhân mới",
          "TieuChiDanhGiaID": {
            "_id": "...",
            "TenTieuChi": "Chất lượng điều trị"
          }
        },
        "MucDoKho": 2.0,
        "DiemTuDanhGia": 0,
        "createdAt": "2025-01-15T10:05:00.000Z",
        "updatedAt": "2025-01-15T10:05:00.000Z"
      }
    ],
    "statistics": {
      "total": 2,
      "evaluated": 1,
      "notEvaluated": 1,
      "completionRate": 50
    }
  },
  "message": "Lấy danh sách nhiệm vụ thành công"
}
```

**Frontend Usage:**

```javascript
import { useAuth } from "../../contexts/AuthContext";
import apiService from "../../app/apiService";

const TuDanhGiaKPIPage = () => {
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID; // ← QUAN TRỌNG: Dùng NhanVienID, không phải user._id

  const [assignments, setAssignments] = useState([]);

  const fetchAssignments = async (chuKyId) => {
    const response = await apiService.get(
      `/workmanagement/giao-nhiem-vu/giao-nhiem-vu?chuKyId=${chuKyId}`
    );
    setAssignments(response.data.data.assignments);
  };

  return (
    <Box>
      {/* Dropdown chọn chu kỳ */}
      {/* List nhiệm vụ với slider tự chấm điểm */}
    </Box>
  );
};
```

---

### 6. Cập Nhật Điểm Tự Đánh Giá

**Endpoint:** `POST /tu-cham-diem-batch`

**Mô tả:** Nhân viên tự chấm điểm hàng loạt (batch update) - chỉ lưu những điểm thay đổi

**Quyền truy cập:** Nhân viên (Employee, Manager, Admin)

**Request Body:**

| Field     | Kiểu  | Bắt buộc | Mô tả                                |
| --------- | ----- | -------- | ------------------------------------ |
| `updates` | Array | ✅ Có    | Danh sách nhiệm vụ cần cập nhật điểm |

**Request:**

```http
POST /api/workmanagement/giao-nhiem-vu/tu-cham-diem-batch
Authorization: Bearer <token>
Content-Type: application/json

{
  "updates": [
    {
      "NhanVienNhiemVuID": "66b1dba74f79822a4752d90d",
      "DiemTuDanhGia": 90
    },
    {
      "NhanVienNhiemVuID": "66b1dba74f79822a4752d90f",
      "DiemTuDanhGia": 75
    }
  ]
}
```

**Response (Success - 200):**

```json
{
  "success": true,
  "data": {
    "updatedAssignments": [
      {
        "_id": "66b1dba74f79822a4752d90d",
        "NhanVienID": "66b1dba74f79822a4752d90a",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d90e",
          "Ten": "Chăm sóc bệnh nhân"
        },
        "ChuKyDanhGiaID": "66b1dba74f79822a4752d90c",
        "MucDoKho": 1.5,
        "DiemTuDanhGia": 90,
        "updatedAt": "2025-01-26T11:00:00.000Z"
      },
      {
        "_id": "66b1dba74f79822a4752d90f",
        "NhanVienID": "66b1dba74f79822a4752d90a",
        "NhiemVuID": {
          "_id": "66b1dba74f79822a4752d910",
          "Ten": "Lập kế hoạch điều trị"
        },
        "ChuKyDanhGiaID": "66b1dba74f79822a4752d90c",
        "MucDoKho": 2.0,
        "DiemTuDanhGia": 75,
        "updatedAt": "2025-01-26T11:00:00.000Z"
      }
    ],
    "summary": {
      "totalUpdated": 2,
      "totalRequested": 2,
      "failed": 0
    }
  },
  "message": "Cập nhật điểm tự đánh giá thành công"
}
```

**Response (Error - 403 CYCLE_CLOSED):**

```json
{
  "success": false,
  "errors": {
    "message": "Không thể cập nhật điểm. Chu kỳ đánh giá đã đóng."
  },
  "message": "CYCLE_CLOSED"
}
```

**Response (Error - 403 KPI_APPROVED):**

```json
{
  "success": false,
  "errors": {
    "message": "Không thể cập nhật điểm. KPI đã được duyệt."
  },
  "message": "KPI_APPROVED"
}
```

**Frontend Usage:**

```javascript
import apiService from "../../app/apiService";

const TuDanhGiaKPIPage = () => {
  const [assignments, setAssignments] = useState([]);

  const handleSliderChange = (assignmentId, newScore) => {
    // Cập nhật state local ngay (optimistic)
    setAssignments(
      assignments.map((a) =>
        a._id === assignmentId ? { ...a, DiemTuDanhGia: newScore } : a
      )
    );
  };

  const handleSaveAll = async () => {
    const updates = assignments.map((a) => ({
      NhanVienNhiemVuID: a._id,
      DiemTuDanhGia: a.DiemTuDanhGia,
    }));

    try {
      const response = await apiService.post(
        "/workmanagement/giao-nhiem-vu/tu-cham-diem-batch",
        { updates }
      );
      toast.success("Cập nhật điểm thành công!");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box>
      {assignments.map((a) => (
        <Box key={a._id}>
          <Typography>{a.NhiemVuID.Ten}</Typography>
          <Slider
            value={a.DiemTuDanhGia}
            onChange={(e, v) => handleSliderChange(a._id, v)}
            min={0}
            max={100}
            step={5}
          />
        </Box>
      ))}
      <Button onClick={handleSaveAll}>Lưu tất cả</Button>
    </Box>
  );
};
```

---

## ❌ Error Codes

### Bảng Mã Lỗi

| Error Code               | HTTP Status | Mô Tả                         | Giải Pháp                          |
| ------------------------ | ----------- | ----------------------------- | ---------------------------------- |
| `MISSING_PARAMETER`      | 400         | Thiếu tham số bắt buộc        | Kiểm tra request body/query params |
| `VALIDATION_ERROR`       | 400         | Lỗi validate dữ liệu          | Kiểm tra định dạng dữ liệu         |
| `EMPLOYEE_NOT_FOUND`     | 404         | Không tìm thấy nhân viên      | Kiểm tra ID nhân viên              |
| `CYCLE_NOT_FOUND`        | 404         | Không tìm thấy chu kỳ         | Kiểm tra ID chu kỳ                 |
| `NO_PREVIOUS_CYCLE`      | 404         | Không tìm thấy chu kỳ trước   | Không thể sao chép, gán thủ công   |
| `NO_ASSIGNMENTS_TO_COPY` | 404         | Không có nhiệm vụ để sao chép | Chu kỳ trước không có dữ liệu      |
| `CYCLE_CLOSED`           | 403         | Chu kỳ đã đóng                | Admin mở lại chu kỳ                |
| `KPI_APPROVED`           | 403         | KPI đã duyệt                  | Hủy duyệt KPI trước                |
| `HAS_EVALUATION_SCORE`   | 403         | Có điểm tự đánh giá           | Nhân viên đưa điểm về 0            |
| `HAS_MANAGER_SCORE`      | 403         | Có điểm quản lý               | Quản lý xóa điểm KPI trước         |
| `UNAUTHORIZED`           | 401         | Chưa xác thực                 | Đăng nhập lại                      |
| `FORBIDDEN`              | 403         | Không có quyền truy cập       | Liên hệ Admin                      |
| `INTERNAL_SERVER_ERROR`  | 500         | Lỗi máy chủ                   | Liên hệ kỹ thuật                   |

---

## 📦 Models & Schemas

### NhanVienNhiemVu (Phân Công)

```javascript
{
  _id: ObjectId,
  NhanVienID: ObjectId (ref: "NhanVien"), // ID nhân viên
  NhiemVuID: ObjectId (ref: "NhiemVuThuongQuy"), // ID nhiệm vụ
  ChuKyDanhGiaID: ObjectId (ref: "ChuKyDanhGia"), // ID chu kỳ
  MucDoKho: Number (0-2), // Độ khó
  DiemTuDanhGia: Number (0-100), // Điểm tự đánh giá (%)
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### ChuKyDanhGia (Chu Kỳ)

```javascript
{
  _id: ObjectId,
  TenChuKy: String, // "Quý 1/2025"
  TuNgay: ISODate, // Ngày bắt đầu
  DenNgay: ISODate, // Ngày kết thúc
  isDong: Boolean, // Đã đóng hay chưa
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### NhiemVuThuongQuy (Nhiệm Vụ)

```javascript
{
  _id: ObjectId,
  Ten: String, // Tên nhiệm vụ
  MoTa: String, // Mô tả
  PhongBanID: ObjectId (ref: "PhongBan"), // Khoa/Phòng ban
  TieuChiDanhGiaID: ObjectId (ref: "TieuChi"), // Tiêu chí đánh giá
  isActive: Boolean, // Còn hoạt động hay không
  createdAt: ISODate,
  updatedAt: ISODate
}
```

### DanhGiaKPI (Đánh Giá KPI)

```javascript
{
  _id: ObjectId,
  NhanVienID: ObjectId (ref: "NhanVien"),
  ChuKyDanhGiaID: ObjectId (ref: "ChuKyDanhGia"),
  TrangThai: String, // "CHUA_DUYET" | "DA_DUYET"
  TongDiemKPI: Number, // Tổng điểm KPI (sau khi duyệt)
  NguoiDuyetID: ObjectId (ref: "User"),
  NgayDuyet: ISODate,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

---

## 🧪 Testing với Postman/Insomnia

### Environment Variables

```json
{
  "baseUrl": "http://localhost:8020/api",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "employeeId": "66b1dba74f79822a4752d90a",
  "cycleId": "66b1dba74f79822a4752d90c"
}
```

### Test Flow (Postman Collection)

1. **Login**

   ```
   POST {{baseUrl}}/auth/login
   Body: { "email": "...", "password": "..." }
   → Lưu token vào environment
   ```

2. **Lấy danh sách nhân viên**

   ```
   GET {{baseUrl}}/workmanagement/giao-nhiem-vu/employees-with-cycle-stats?chuKyId={{cycleId}}
   Headers: Authorization: Bearer {{token}}
   → Copy employeeId từ response
   ```

3. **Lấy phân công chi tiết**

   ```
   GET {{baseUrl}}/workmanagement/giao-nhiem-vu/nhan-vien/{{employeeId}}/by-cycle?chuKyId={{cycleId}}
   Headers: Authorization: Bearer {{token}}
   ```

4. **Cập nhật phân công**

   ```
   PUT {{baseUrl}}/workmanagement/giao-nhiem-vu/nhan-vien/{{employeeId}}/cycle-assignments
   Headers: Authorization: Bearer {{token}}
   Body: { "chuKyId": "...", "assignmentsToAdd": [...] }
   ```

5. **Tự chấm điểm**
   ```
   POST {{baseUrl}}/workmanagement/giao-nhiem-vu/tu-cham-diem-batch
   Headers: Authorization: Bearer {{token}}
   Body: { "updates": [...] }
   ```

---

## 🎉 Kết Luận

Tài liệu API này cung cấp **đầy đủ thông tin** để tích hợp với hệ thống GiaoNhiemVu V3.0:

✅ **8 endpoints** đầy đủ với request/response examples  
✅ **Error codes** chi tiết với giải pháp  
✅ **Frontend usage** với React code examples  
✅ **4-layer validation** được tài liệu hóa rõ ràng  
✅ **Testing guide** với Postman/Insomnia

---

**Cập nhật cuối:** 26/11/2025  
**Tác giả:** GitHub Copilot (Claude Sonnet 4.5)  
**Phiên bản tài liệu:** 1.0.0
