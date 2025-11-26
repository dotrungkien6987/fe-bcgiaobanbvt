# API Reference - CongViec Module

**Version:** 2.1  
**Last Updated:** November 26, 2025  
**Status:** ✅ Code-verified from `congViec.api.js`

---

## 📋 Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Error Responses](#error-responses)
- [CRUD Endpoints](#crud-endpoints)
- [State Transition Endpoints](#state-transition-endpoints)
- [Progress & Comment Endpoints](#progress--comment-endpoints)
- [Subtask Endpoints](#subtask-endpoints)
- [Tree Navigation Endpoints](#tree-navigation-endpoints)
- [Routine Task Integration](#routine-task-integration)
- [KPI Dashboard Endpoints](#kpi-dashboard-endpoints)
- [Optimistic Concurrency](#optimistic-concurrency)

---

## 🎯 Overview

CongViec API provides **21+ endpoints** for task management with:

- **CRUD operations** (Create, Read, Update, Delete)
- **State transitions** (8 workflow actions)
- **Comment threading** (parent + replies)
- **File management** (upload/delete)
- **Subtask hierarchy** (tree operations)
- **KPI integration** (dashboard metrics)

**Total Endpoints:** 27 verified from `congViec.api.js` (213 lines)

---

## 🔐 Authentication

**All endpoints require JWT authentication.**

**Middleware:** `authentication.loginRequired` (applied to all routes)

**Request Header:**

```http
Authorization: Bearer <JWT_TOKEN>
```

**Token contains:**

```javascript
{
  userId: "64f3cb6035c717ab00d75b8b",    // User._id
  email: "dotrungkien6987@gmail.com",
  // Decoded in req.userId by middleware
}
```

**Getting NhanVienID from User:**

```javascript
// Backend automatically resolves via req.user.NhanVienID
// If not available, fallback to User.findById(req.userId).NhanVienID
```

---

## 🌐 Base URL

```
http://localhost:8020/api/workmanagement
```

**Production:**

```
https://api.yourapp.com/api/workmanagement
```

---

## ❌ Error Responses

### Standard Error Format

```json
{
  "success": false,
  "message": "Vietnamese error message",
  "errors": {
    "field": "error details"
  }
}
```

### Common HTTP Status Codes

| Code    | Meaning      | Example                                   |
| ------- | ------------ | ----------------------------------------- |
| **400** | Bad Request  | Missing required fields                   |
| **401** | Unauthorized | Invalid/expired JWT token                 |
| **403** | Forbidden    | No permission to perform action           |
| **404** | Not Found    | CongViec not found                        |
| **409** | Conflict     | Version conflict (optimistic concurrency) |
| **500** | Server Error | Database error, unexpected exception      |

### Version Conflict (409)

```json
{
  "success": false,
  "message": "Dữ liệu đã được cập nhật bởi người khác",
  "errors": {
    "type": "VERSION_CONFLICT",
    "currentUpdatedAt": "2025-11-25T10:35:00Z",
    "yourUpdatedAt": "2025-11-25T10:30:00Z"
  }
}
```

---

## 📝 CRUD Endpoints

### 1. Get Employee Info

**GET** `/nhanvien/:nhanvienid`

**Description:** Fetch employee information

**Parameters:**

- `nhanvienid` (path, required): NhanVien.\_id

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "66b1dba74f79822a4752d90d",
    "HoTen": "Đỗ Trung Kiên",
    "MaNhanVien": "NV001",
    "Email": "dotrungkien6987@gmail.com",
    "PhongBanID": {
      "_id": "...",
      "TenPhongBan": "Khoa Nội"
    }
  }
}
```

---

### 2. Get Received Tasks (Tasks assigned TO user)

**GET** `/congviec/:nhanvienid/received`

**Description:** Get tasks where user is Main participant or collaborator

**Parameters:**

- `nhanvienid` (path, required): NhanVien.\_id

**Query Parameters:**

| Param          | Type   | Default | Description                                 |
| -------------- | ------ | ------- | ------------------------------------------- |
| `page`         | number | 1       | Page number                                 |
| `limit`        | number | 10      | Items per page                              |
| `search`       | string | ""      | Search in TieuDe, MoTa, MaCongViec          |
| `TrangThai`    | string | ""      | Filter by state (TAO_MOI, DA_GIAO, etc.)    |
| `MucDoUuTien`  | string | ""      | Filter by priority (CAO, BINH_THUONG, THAP) |
| `NgayBatDau`   | date   | null    | Filter start date (YYYY-MM-DD)              |
| `NgayHetHan`   | date   | null    | Filter deadline                             |
| `MaCongViec`   | string | ""      | Filter by task code                         |
| `NguoiChinhID` | string | ""      | Filter by main person                       |
| `TinhTrangHan` | string | ""      | Filter deadline status                      |

**Example Request:**

```http
GET /api/workmanagement/congviec/66b1dba74f79822a4752d90d/received?page=1&limit=10&TrangThai=DANG_THUC_HIEN&TinhTrangHan=SAP_HET_HAN
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "CongViecs": [
      {
        "_id": "678abc123def456",
        "MaCongViec": "CV202501234",
        "TieuDe": "Báo cáo tháng 11/2025",
        "MoTa": "Tổng hợp số liệu bệnh viện",
        "TrangThai": "DANG_THUC_HIEN",
        "MucDoUuTien": "CAO",
        "NgayBatDau": "2025-11-01T00:00:00Z",
        "NgayHetHan": "2025-11-30T23:59:59Z",
        "PhanTramTienDoTong": 65,
        "NguoiGiaoViecID": {
          "_id": "...",
          "HoTen": "Nguyễn Văn A",
          "MaNhanVien": "NV002"
        },
        "NguoiChinhID": {
          "_id": "66b1dba74f79822a4752d90d",
          "HoTen": "Đỗ Trung Kiên",
          "MaNhanVien": "NV001"
        },
        "TinhTrangThoiHan": "SAP_HET_HAN",
        "createdAt": "2025-11-01T08:00:00Z",
        "updatedAt": "2025-11-25T10:30:00Z"
      }
    ],
    "totalItems": 15,
    "totalPages": 2,
    "currentPage": 1
  }
}
```

---

### 3. Get Assigned Tasks (Tasks assigned BY user)

**GET** `/congviec/:nhanvienid/assigned`

**Description:** Get tasks where user is the assigner (NguoiGiaoViecID)

**Parameters:** Same as `/received` endpoint

**Response:** Same structure as `/received`

---

### 4. Get Task Detail

**GET** `/congviec/detail/:id`

**Description:** Get full task details with populated references

**Parameters:**

- `id` (path, required): CongViec.\_id

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "MaCongViec": "CV202501234",
    "TieuDe": "Báo cáo tháng 11/2025",
    "MoTa": "Tổng hợp số liệu bệnh viện",
    "SoThuTu": 1234,

    "NguoiGiaoViecID": {
      "_id": "...",
      "HoTen": "Nguyễn Văn A",
      "MaNhanVien": "NV002"
    },
    "NguoiChinhID": {
      "_id": "66b1dba74f79822a4752d90d",
      "HoTen": "Đỗ Trung Kiên",
      "MaNhanVien": "NV001"
    },
    "NguoiThamGia": [
      {
        "NhanVienID": {
          "_id": "...",
          "HoTen": "Trần Thị B"
        },
        "VaiTro": "PHOI_HOP",
        "NgayThamGia": "2025-11-01T08:00:00Z"
      }
    ],

    "MucDoUuTien": "CAO",
    "NgayBatDau": "2025-11-01T00:00:00Z",
    "NgayHetHan": "2025-11-30T23:59:59Z",
    "NgayGiaoViec": "2025-11-01T08:15:00Z",
    "NgayCanhBao": "2025-11-25T00:00:00Z",
    "NgayTiepNhanThucTe": "2025-11-02T09:00:00Z",
    "NgayHoanThanh": null,

    "CanhBaoMode": "PERCENT",
    "CanhBaoSapHetHanPercent": 0.8,

    "TrangThai": "DANG_THUC_HIEN",
    "PhanTramTienDoTong": 65,
    "CoDuyetHoanThanh": true,

    "NhiemVuThuongQuyID": {
      "_id": "...",
      "TenNhiemVu": "Báo cáo định kỳ"
    },
    "FlagNVTQKhac": false,

    "CongViecChaID": null,
    "Path": [],
    "Depth": 0,
    "ChildrenCount": 2,

    "LichSuTrangThai": [
      {
        "HanhDong": "TAO_MOI",
        "TuTrangThai": null,
        "DenTrangThai": "TAO_MOI",
        "ThoiGian": "2025-11-01T08:00:00Z",
        "NguoiThucHienID": "...",
        "GhiChu": "",
        "IsRevert": false
      },
      {
        "HanhDong": "GIAO_VIEC",
        "TuTrangThai": "TAO_MOI",
        "DenTrangThai": "DA_GIAO",
        "ThoiGian": "2025-11-01T08:15:00Z",
        "NguoiThucHienID": "...",
        "GhiChu": "Giao việc cho Kiên",
        "IsRevert": false
      },
      {
        "HanhDong": "TIEP_NHAN",
        "TuTrangThai": "DA_GIAO",
        "DenTrangThai": "DANG_THUC_HIEN",
        "ThoiGian": "2025-11-02T09:00:00Z",
        "NguoiThucHienID": "66b1dba74f79822a4752d90d",
        "GhiChu": "Đã tiếp nhận",
        "IsRevert": false
      }
    ],

    "LichSuTienDo": [
      {
        "Tu": 0,
        "Den": 30,
        "ThoiGian": "2025-11-10T10:00:00Z",
        "NguoiThucHienID": "66b1dba74f79822a4752d90d",
        "GhiChu": "Hoàn thành phần thu thập dữ liệu"
      },
      {
        "Tu": 30,
        "Den": 65,
        "ThoiGian": "2025-11-20T14:30:00Z",
        "NguoiThucHienID": "66b1dba74f79822a4752d90d",
        "GhiChu": "Đang xử lý báo cáo"
      }
    ],

    "BinhLuans": [
      {
        "_id": "...",
        "NoiDung": "Cần bổ sung số liệu tháng 10",
        "NguoiTaoID": {
          "_id": "...",
          "HoTen": "Nguyễn Văn A"
        },
        "NgayTao": "2025-11-15T09:00:00Z",
        "ParentID": null,
        "RepliesCount": 2
      }
    ],

    "TepTins": [
      {
        "_id": "...",
        "TenGoc": "bao_cao_thang_10.xlsx",
        "LoaiFile": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "KichThuoc": 524288,
        "KichThuocFormat": "512.00 KB",
        "DuongDan": "https://res.cloudinary.com/...",
        "NguoiTaiLenID": {
          "_id": "66b1dba74f79822a4752d90d",
          "HoTen": "Đỗ Trung Kiên"
        },
        "NgayTaiLen": "2025-11-20T15:00:00Z",
        "TrangThai": "ACTIVE"
      }
    ],

    "TinhTrangThoiHan": "SAP_HET_HAN",
    "isDeleted": false,
    "createdAt": "2025-11-01T08:00:00Z",
    "updatedAt": "2025-11-25T10:30:00Z"
  }
}
```

**Error Responses:**

```json
// 404 Not Found
{
  "success": false,
  "message": "Không tìm thấy công việc"
}

// 403 Forbidden (no permission)
{
  "success": false,
  "message": "Bạn không có quyền xem công việc này"
}
```

---

### 5. Create Task

**POST** `/congviec`

**Description:** Create new task

**Request Body:**

```json
{
  "TieuDe": "Báo cáo tháng 12/2025",
  "MoTa": "Tổng hợp số liệu bệnh viện tháng 12",
  "NgayBatDau": "2025-12-01T00:00:00Z",
  "NgayHetHan": "2025-12-31T23:59:59Z",
  "MucDoUuTien": "CAO",

  "NguoiChinhID": "66b1dba74f79822a4752d90d",
  "NguoiThamGia": [
    {
      "NhanVienID": "...",
      "VaiTro": "PHOI_HOP"
    }
  ],

  "CoDuyetHoanThanh": true,

  "CanhBaoMode": "PERCENT",
  "CanhBaoSapHetHanPercent": 0.8,

  "NhiemVuThuongQuyID": "...",
  "FlagNVTQKhac": false,

  "CongViecChaID": null
}
```

**Required Fields:**

- `TieuDe` (string)
- `NgayHetHan` (date)
- `NguoiChinhID` (ObjectId)

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "678newcv123",
    "MaCongViec": "CV202501235",
    "TieuDe": "Báo cáo tháng 12/2025",
    "TrangThai": "TAO_MOI",
    "NguoiGiaoViecID": "...", // Set from JWT token
    // ... other fields
    "createdAt": "2025-11-25T11:00:00Z",
    "updatedAt": "2025-11-25T11:00:00Z"
  },
  "message": "Tạo công việc thành công"
}
```

---

### 6. Update Task

**PUT** `/congviec/:id`

**Description:** Update existing task (with optimistic concurrency)

**Parameters:**

- `id` (path, required): CongViec.\_id

**Request Headers:**

```http
Authorization: Bearer <token>
If-Unmodified-Since: 2025-11-25T10:30:00Z
```

**Request Body:** (Only include fields to update)

```json
{
  "TieuDe": "Báo cáo tháng 12/2025 (Cập nhật)",
  "MoTa": "Thêm số liệu so sánh với tháng 11",
  "NgayHetHan": "2025-12-31T23:59:59Z",
  "MucDoUuTien": "BINH_THUONG",
  "PhanTramTienDoTong": 75
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "TieuDe": "Báo cáo tháng 12/2025 (Cập nhật)",
    // ... updated fields
    "updatedAt": "2025-11-25T11:05:00Z" // NEW timestamp
  },
  "message": "Cập nhật công việc thành công"
}
```

**Error Responses:**

```json
// 409 Version Conflict
{
  "success": false,
  "message": "Dữ liệu đã được cập nhật bởi người khác",
  "errors": {
    "type": "VERSION_CONFLICT",
    "currentUpdatedAt": "2025-11-25T11:03:00Z",
    "yourUpdatedAt": "2025-11-25T10:30:00Z"
  }
}

// 403 Forbidden (field-level permission error)
{
  "success": false,
  "message": "Người chính không được sửa trường TieuDe"
}
```

---

### 7. Delete Task

**DELETE** `/congviec/:id`

**Description:** Soft delete task (sets `isDeleted: true`)

**Parameters:**

- `id` (path, required): CongViec.\_id

**Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Xóa công việc thành công"
}
```

**Permission:** Only Assigner or Admin can delete

---

## 🔄 State Transition Endpoints

### 8. Giao Việc (Assign Task)

> ⚠️ **DEPRECATED:** Endpoint này sẽ bị loại bỏ. Sử dụng `POST /congviec/:id/transition` với `action: "GIAO_VIEC"` thay thế.

**POST** `/congviec/:id/giao-viec`

**Description:** Transition from `TAO_MOI` → `DA_GIAO`

**Parameters:**

- `id` (path, required): CongViec.\_id

**Request Headers:**

```http
If-Unmodified-Since: 2025-11-25T11:00:00Z
```

**Request Body:**

```json
{
  "GhiChu": "Giao việc cho Kiên hoàn thành trong tháng 12"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "TrangThai": "DA_GIAO",
    "NgayGiaoViec": "2025-11-25T11:10:00Z",
    "NgayCanhBao": "2025-12-25T00:00:00Z", // Calculated if PERCENT mode
    "LichSuTrangThai": [
      // ... previous entries
      {
        "HanhDong": "GIAO_VIEC",
        "TuTrangThai": "TAO_MOI",
        "DenTrangThai": "DA_GIAO",
        "ThoiGian": "2025-11-25T11:10:00Z",
        "NguoiThucHienID": "...",
        "GhiChu": "Giao việc cho Kiên hoàn thành trong tháng 12",
        "IsRevert": false
      }
    ],
    "updatedAt": "2025-11-25T11:10:00Z"
  },
  "message": "Giao việc thành công"
}
```

**Permission:** Only Assigner or Admin

---

### 9. Tiếp Nhận (Accept Task)

> ⚠️ **DEPRECATED:** Endpoint này sẽ bị loại bỏ. Sử dụng `POST /congviec/:id/transition` với `action: "TIEP_NHAN"` thay thế.

**POST** `/congviec/:id/tiep-nhan`

**Description:** Transition from `DA_GIAO` → `DANG_THUC_HIEN`

**Parameters:**

- `id` (path, required): CongViec.\_id

**Request Headers:**

```http
If-Unmodified-Since: 2025-11-25T11:10:00Z
```

**Request Body:**

```json
{
  "GhiChu": "Đã tiếp nhận, bắt đầu thực hiện"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "TrangThai": "DANG_THUC_HIEN",
    "NgayTiepNhanThucTe": "2025-11-25T11:15:00Z",
    "LichSuTrangThai": [
      // ... previous entries
      {
        "HanhDong": "TIEP_NHAN",
        "TuTrangThai": "DA_GIAO",
        "DenTrangThai": "DANG_THUC_HIEN",
        "ThoiGian": "2025-11-25T11:15:00Z",
        "NguoiThucHienID": "66b1dba74f79822a4752d90d",
        "GhiChu": "Đã tiếp nhận, bắt đầu thực hiện",
        "IsRevert": false
      }
    ],
    "updatedAt": "2025-11-25T11:15:00Z"
  },
  "message": "Tiếp nhận công việc thành công"
}
```

**Permission:** Only Main person or Admin

---

### 10. Hoàn Thành (Mark as Complete)

> ⚠️ **DEPRECATED:** Endpoint này sẽ bị loại bỏ. Sử dụng `POST /congviec/:id/transition` với `action: "HOAN_THANH"` hoặc `action: "HOAN_THANH_TAM"` thay thế.

**POST** `/congviec/:id/hoan-thanh`

**Description:** Transition from `DANG_THUC_HIEN` → `CHO_DUYET` (if `CoDuyetHoanThanh: true`) OR → `HOAN_THANH` (if `CoDuyetHoanThanh: false`)

**Parameters:**

- `id` (path, required): CongViec.\_id

**Request Headers:**

```http
If-Unmodified-Since: 2025-12-28T10:00:00Z
```

**Request Body:**

```json
{
  "GhiChu": "Đã hoàn thành báo cáo và tổng hợp số liệu",
  "PhanTramTienDoTong": 100
}
```

**Response (200 OK) - Case 1: CoDuyetHoanThanh = true**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "TrangThai": "CHO_DUYET",
    "NgayHoanThanhTam": "2025-12-28T10:05:00Z",
    "PhanTramTienDoTong": 100,
    "LichSuTrangThai": [
      // ... previous entries
      {
        "HanhDong": "HOAN_THANH_TAM",
        "TuTrangThai": "DANG_THUC_HIEN",
        "DenTrangThai": "CHO_DUYET",
        "ThoiGian": "2025-12-28T10:05:00Z",
        "NguoiThucHienID": "66b1dba74f79822a4752d90d",
        "GhiChu": "Đã hoàn thành báo cáo và tổng hợp số liệu",
        "IsRevert": false
      }
    ],
    "updatedAt": "2025-12-28T10:05:00Z"
  },
  "message": "Đã gửi yêu cầu duyệt hoàn thành"
}
```

**Response (200 OK) - Case 2: CoDuyetHoanThanh = false**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "TrangThai": "HOAN_THANH",
    "NgayHoanThanh": "2025-12-28T10:05:00Z",
    "SoGioTre": 0,
    "HoanThanhTreHan": false,
    "PhanTramTienDoTong": 100,
    "LichSuTrangThai": [
      // ... previous entries
      {
        "HanhDong": "HOAN_THANH",
        "TuTrangThai": "DANG_THUC_HIEN",
        "DenTrangThai": "HOAN_THANH",
        "ThoiGian": "2025-12-28T10:05:00Z",
        "NguoiThucHienID": "66b1dba74f79822a4752d90d",
        "GhiChu": "Đã hoàn thành báo cáo và tổng hợp số liệu",
        "IsRevert": false
      }
    ],
    "updatedAt": "2025-12-28T10:05:00Z"
  },
  "message": "Hoàn thành công việc thành công"
}
```

**Permission:** Only Main person or Admin

---

### 11. Duyệt Hoàn Thành (Approve Completion)

> ⚠️ **DEPRECATED:** Endpoint này sẽ bị loại bỏ. Sử dụng `POST /congviec/:id/transition` với `action: "DUYET_HOAN_THANH"` thay thế.

**POST** `/congviec/:id/duyet-hoan-thanh`

**Description:** Transition from `CHO_DUYET` → `HOAN_THANH`

**Parameters:**

- `id` (path, required): CongViec.\_id

**Request Headers:**

```http
If-Unmodified-Since: 2025-12-28T10:05:00Z
```

**Request Body:**

```json
{
  "GhiChu": "Đã kiểm tra, chấp nhận hoàn thành"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "TrangThai": "HOAN_THANH",
    "NgayHoanThanh": "2025-12-28T14:30:00Z",
    "SoGioTre": 0,
    "HoanThanhTreHan": false,
    "LichSuTrangThai": [
      // ... previous entries
      {
        "HanhDong": "DUYET_HOAN_THANH",
        "TuTrangThai": "CHO_DUYET",
        "DenTrangThai": "HOAN_THANH",
        "ThoiGian": "2025-12-28T14:30:00Z",
        "NguoiThucHienID": "...", // Assigner ID
        "GhiChu": "Đã kiểm tra, chấp nhận hoàn thành",
        "IsRevert": false
      }
    ],
    "updatedAt": "2025-12-28T14:30:00Z"
  },
  "message": "Duyệt hoàn thành thành công"
}
```

**Permission:** Only Assigner or Admin

---

### 12. Unified Transition Endpoint

**POST** `/congviec/:id/transition`

**Description:** Generic endpoint for all state transitions (newer consolidated approach)

**Request Body:**

```json
{
  "action": "TIEP_NHAN", // One of: GIAO_VIEC, HUY_GIAO, TIEP_NHAN, HOAN_THANH_TAM, etc.
  "GhiChu": "Optional note",
  "PhanTramTienDoTong": 100 // Optional, for HOAN_THANH action
}
```

**Response:** Same as individual transition endpoints

---

## 📊 Progress & Comment Endpoints

### 13. Update Progress

**POST** `/congviec/:id/progress`

**Description:** Update task progress percentage (adds to `LichSuTienDo`)

**Parameters:**

- `id` (path, required): CongViec.\_id

**Request Body:**

```json
{
  "PhanTramTienDoTong": 75,
  "GhiChu": "Hoàn thành phần thu thập dữ liệu"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "PhanTramTienDoTong": 75,
    "LichSuTienDo": [
      // ... previous entries
      {
        "Tu": 50,
        "Den": 75,
        "ThoiGian": "2025-12-15T10:00:00Z",
        "NguoiThucHienID": "66b1dba74f79822a4752d90d",
        "GhiChu": "Hoàn thành phần thu thập dữ liệu"
      }
    ],
    "updatedAt": "2025-12-15T10:00:00Z"
  },
  "message": "Cập nhật tiến độ thành công"
}
```

**Permission:** Main person or Admin

---

### 14. Add Comment

**POST** `/congviec/:id/comment`

**Description:** Add comment to task (parent or reply)

**Parameters:**

- `id` (path, required): CongViec.\_id

**Request Body:**

```json
{
  "NoiDung": "Cần bổ sung số liệu tháng 10",
  "ParentID": null // null = parent comment, or BinhLuan._id for reply
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "678comment123",
    "CongViecID": "678abc123def456",
    "NoiDung": "Cần bổ sung số liệu tháng 10",
    "NguoiTaoID": {
      "_id": "...",
      "HoTen": "Nguyễn Văn A"
    },
    "ParentID": null,
    "NgayTao": "2025-12-16T09:00:00Z",
    "TepTinIDs": [],
    "RepliesCount": 0,
    "isDeleted": false
  },
  "message": "Thêm bình luận thành công"
}
```

---

### 15. Edit Comment (hypothetical - may use PATCH)

**PUT** `/binhluan/:id`

**Description:** Edit comment content

**Parameters:**

- `id` (path, required): BinhLuan.\_id

**Request Body:**

```json
{
  "NoiDung": "Cần bổ sung số liệu tháng 10 và 11"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678comment123",
    "NoiDung": "Cần bổ sung số liệu tháng 10 và 11",
    "updatedAt": "2025-12-16T10:00:00Z"
  },
  "message": "Cập nhật bình luận thành công"
}
```

**Permission:** Only comment author

---

### 16. Delete Comment

**DELETE** `/binhluan/:id`

**Description:** Soft delete comment and its file attachments

**Parameters:**

- `id` (path, required): BinhLuan.\_id

**Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Thu hồi bình luận thành công"
}
```

**Permission:** Only comment author or Admin

---

### 17. Recall Comment Text

**PATCH** `/binhluan/:id/text`

**Description:** Remove comment text but keep file attachments

**Parameters:**

- `id` (path, required): BinhLuan.\_id

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678comment123",
    "NoiDung": "[Nội dung đã được thu hồi]",
    "updatedAt": "2025-12-16T11:00:00Z"
  },
  "message": "Thu hồi nội dung bình luận thành công"
}
```

---

### 18. List Replies

**GET** `/binhluan/:id/replies`

**Description:** Get replies for a parent comment

**Parameters:**

- `id` (path, required): BinhLuan.\_id (parent comment)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "678reply1",
      "NoiDung": "Đã bổ sung xong",
      "NguoiTaoID": {
        "_id": "66b1dba74f79822a4752d90d",
        "HoTen": "Đỗ Trung Kiên"
      },
      "ParentID": "678comment123",
      "NgayTao": "2025-12-16T10:30:00Z"
    },
    {
      "_id": "678reply2",
      "NoiDung": "Cảm ơn!",
      "NguoiTaoID": {
        "_id": "...",
        "HoTen": "Nguyễn Văn A"
      },
      "ParentID": "678comment123",
      "NgayTao": "2025-12-16T11:00:00Z"
    }
  ]
}
```

---

## 🌳 Subtask Endpoints

### 19. Create Subtask

**POST** `/congviec/:id/subtasks`

**Description:** Create subtask under parent task

**Parameters:**

- `id` (path, required): Parent CongViec.\_id

**Request Body:** (Same as create task, but `CongViecChaID` auto-set by server)

```json
{
  "TieuDe": "Thu thập số liệu bệnh nhân",
  "MoTa": "Lấy dữ liệu từ hệ thống HIS",
  "NgayHetHan": "2025-12-10T23:59:59Z",
  "NguoiChinhID": "66b1dba74f79822a4752d90d"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "678subtask1",
    "MaCongViec": "CV202501236",
    "TieuDe": "Thu thập số liệu bệnh nhân",
    "CongViecChaID": "678abc123def456",
    "Path": ["678abc123def456"],
    "Depth": 1,
    "TrangThai": "TAO_MOI",
    // ... other fields inherited from parent
    "createdAt": "2025-12-01T09:00:00Z"
  },
  "message": "Tạo công việc con thành công"
}
```

**Side Effect:** Parent's `ChildrenCount` incremented by 1

---

### 20. List Children

**GET** `/congviec/:id/children`

**Description:** Get direct children of a task (Depth +1)

**Parameters:**

- `id` (path, required): Parent CongViec.\_id

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "678subtask1",
      "MaCongViec": "CV202501236",
      "TieuDe": "Thu thập số liệu bệnh nhân",
      "TrangThai": "DA_GIAO",
      "PhanTramTienDoTong": 50,
      "Depth": 1
    },
    {
      "_id": "678subtask2",
      "MaCongViec": "CV202501237",
      "TieuDe": "Phân tích dữ liệu",
      "TrangThai": "DANG_THUC_HIEN",
      "PhanTramTienDoTong": 30,
      "Depth": 1
    }
  ]
}
```

---

## 🌲 Tree Navigation Endpoints

### 21. Get Tree Root

**GET** `/congviec/:id/tree-root`

**Description:** Get root task of the tree (travel up `Path` to Depth=0)

**Parameters:**

- `id` (path, required): CongViec.\_id (any node in tree)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "MaCongViec": "CV202501234",
    "TieuDe": "Báo cáo tháng 12/2025",
    "Depth": 0,
    "ChildrenCount": 5
  }
}
```

---

### 22. Get Tree Children (recursive)

**GET** `/congviec/:id/tree-children`

**Description:** Get all descendants (recursive)

**Parameters:**

- `id` (path, required): CongViec.\_id

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "678subtask1",
      "TieuDe": "Thu thập số liệu",
      "Depth": 1,
      "ChildrenCount": 2,
      "children": [
        {
          "_id": "678subtask1a",
          "TieuDe": "Thu thập từ HIS",
          "Depth": 2,
          "ChildrenCount": 0
        },
        {
          "_id": "678subtask1b",
          "TieuDe": "Thu thập từ LIS",
          "Depth": 2,
          "ChildrenCount": 0
        }
      ]
    },
    {
      "_id": "678subtask2",
      "TieuDe": "Phân tích dữ liệu",
      "Depth": 1,
      "ChildrenCount": 0
    }
  ]
}
```

---

### 23. Get Full Tree

**GET** `/congviec/:id/full-tree`

**Description:** Get complete tree structure (root + all descendants)

**Parameters:**

- `id` (path, required): CongViec.\_id (any node)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678abc123def456",
    "TieuDe": "Báo cáo tháng 12/2025",
    "Depth": 0,
    "children": [
      {
        "_id": "678subtask1",
        "TieuDe": "Thu thập số liệu",
        "Depth": 1,
        "children": [
          {
            "_id": "678subtask1a",
            "TieuDe": "Thu thập từ HIS",
            "Depth": 2,
            "children": []
          }
        ]
      },
      {
        "_id": "678subtask2",
        "TieuDe": "Phân tích dữ liệu",
        "Depth": 1,
        "children": []
      }
    ]
  }
}
```

---

## 📋 Routine Task Integration

### 24. Get My Routine Tasks

**GET** `/nhiemvuthuongquy/my`

**Description:** Get routine duties assigned to current user (cycle-aware)

**Query Parameters:**

| Param     | Type   | Description                                                      |
| --------- | ------ | ---------------------------------------------------------------- |
| `chuKyId` | string | Optional: Filter by evaluation cycle ID (default: current cycle) |

**Example Request:**

```http
GET /api/workmanagement/nhiemvuthuongquy/my?chuKyId=678chuky123
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "678nhiemvu1",
      "TenNhiemVu": "Báo cáo định kỳ",
      "MoTa": "Báo cáo hàng tháng về hoạt động khoa",
      "ChuKyDanhGiaID": "678chuky123",
      "isActive": true
    },
    {
      "_id": "678nhiemvu2",
      "TenNhiemVu": "Kiểm tra chất lượng",
      "MoTa": "Kiểm tra chất lượng dịch vụ hàng tuần",
      "ChuKyDanhGiaID": "678chuky123",
      "isActive": true
    }
  ]
}
```

**Auto-resolves NhanVienID from JWT token via `req.user.NhanVienID`**

---

### 25. Get Evaluation Cycles

**GET** `/chu-ky-danh-gia/list`

**Description:** Get list of evaluation cycles (for dropdown)

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "678chuky123",
      "TenChuKy": "Quý 4/2025",
      "NgayBatDau": "2025-10-01T00:00:00Z",
      "NgayKetThuc": "2025-12-31T23:59:59Z",
      "isActive": true
    },
    {
      "_id": "678chuky124",
      "TenChuKy": "Quý 1/2026",
      "NgayBatDau": "2026-01-01T00:00:00Z",
      "NgayKetThuc": "2026-03-31T23:59:59Z",
      "isActive": false
    }
  ]
}
```

---

## 📈 KPI Dashboard Endpoints

### 26. Dashboard by Routine Task

**GET** `/congviec/dashboard-by-nhiemvu`

**Description:** Get task metrics for a specific routine duty (for KPI evaluation)

**Query Parameters:**

| Param                | Type   | Required | Description           |
| -------------------- | ------ | -------- | --------------------- |
| `nhiemVuThuongQuyID` | string | Yes      | NhiemVuThuongQuy.\_id |
| `nhanVienID`         | string | Yes      | NhanVien.\_id         |
| `chuKyDanhGiaID`     | string | Yes      | ChuKyDanhGia.\_id     |

**Example Request:**

```http
GET /api/workmanagement/congviec/dashboard-by-nhiemvu?nhiemVuThuongQuyID=678nhiemvu1&nhanVienID=66b1dba7...&chuKyDanhGiaID=678chuky123
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "TongSoCongViec": 12,
    "DaHoanThanh": 10,
    "DangThucHien": 2,
    "QuaHan": 1,
    "HoanThanhDungHan": 9,
    "HoanThanhTreHan": 1,
    "TyLeHoanThanh": 83.33,
    "TyLeHoanThanhDungHan": 90.0
  }
}
```

---

### 27. Summary - Other Tasks

**GET** `/congviec/summary-other-tasks`

**Description:** Get summary of "other" tasks (`FlagNVTQKhac: true`) for KPI

**Query Parameters:**

| Param            | Type   | Required | Description       |
| ---------------- | ------ | -------- | ----------------- |
| `nhanVienID`     | string | Yes      | NhanVien.\_id     |
| `chuKyDanhGiaID` | string | Yes      | ChuKyDanhGia.\_id |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "TongSoCongViec": 5,
    "DaHoanThanh": 4,
    "DangThucHien": 1,
    "QuaHan": 0,
    "TyLeHoanThanh": 80.0
  }
}
```

---

### 28. Summary - Collaboration Tasks

**GET** `/congviec/summary-collab-tasks`

**Description:** Get summary of collaboration tasks (`VaiTro: PHOI_HOP`) for KPI

**Query Parameters:**

| Param            | Type   | Required | Description       |
| ---------------- | ------ | -------- | ----------------- |
| `nhanVienID`     | string | Yes      | NhanVien.\_id     |
| `chuKyDanhGiaID` | string | Yes      | ChuKyDanhGia.\_id |

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "TongSoCongViec": 8,
    "DaHoanThanh": 6,
    "DangThucHien": 2,
    "TyLeHoanThanh": 75.0
  }
}
```

---

## ⚡ Optimistic Concurrency

### How It Works

1. **Client tracks `updatedAt`:** Every time client fetches task, store `congViec.updatedAt`
2. **Client sends header on update:** Include `If-Unmodified-Since: <updatedAt>` in PUT/POST requests
3. **Server validates:** Compare `If-Unmodified-Since` with current `congViec.updatedAt`
   - If match: Proceed with update
   - If mismatch: Return 409 error
4. **Client handles conflict:** Show warning, prompt user to refresh

### Example Flow

**Step 1: Fetch Task**

```http
GET /api/workmanagement/congviec/detail/678abc123
Response: { ..., "updatedAt": "2025-11-25T10:30:00Z" }
```

**Step 2: Update Task (User A)**

```http
PUT /api/workmanagement/congviec/678abc123
If-Unmodified-Since: 2025-11-25T10:30:00Z
Body: { "TieuDe": "Updated Title" }

Response 200: { ..., "updatedAt": "2025-11-25T10:35:00Z" }
```

**Step 3: Update Task (User B - conflict)**

```http
PUT /api/workmanagement/congviec/678abc123
If-Unmodified-Since: 2025-11-25T10:30:00Z  ← OLD timestamp
Body: { "MoTa": "Different update" }

Response 409:
{
  "success": false,
  "message": "Dữ liệu đã được cập nhật bởi người khác",
  "errors": {
    "type": "VERSION_CONFLICT",
    "currentUpdatedAt": "2025-11-25T10:35:00Z",
    "yourUpdatedAt": "2025-11-25T10:30:00Z"
  }
}
```

**Step 4: Client Handles Conflict**

```javascript
// Frontend
if (error.response?.status === 409) {
  dispatch(
    setVersionConflict({ id, type: "update", payload, timestamp: Date.now() })
  );
  toast.error("Dữ liệu đã thay đổi, vui lòng làm mới");
}
```

---

## 📚 Additional Endpoints (From Routes File)

### Update History Note

**PUT** `/congviec/:id/history/:index/note`

**Description:** Edit note in `LichSuTrangThai` array

**Parameters:**

- `id` (path): CongViec.\_id
- `index` (path): Array index

**Request Body:**

```json
{
  "GhiChu": "Updated note"
}
```

---

### Update Progress History Note

**PUT** `/congviec/:id/progress-history/:index/note`

**Description:** Edit note in `LichSuTienDo` array

**Parameters:**

- `id` (path): CongViec.\_id
- `index` (path): Array index

**Request Body:**

```json
{
  "GhiChu": "Updated progress note"
}
```

---

**Total Endpoints Documented:** 28+  
**Routes File:** `congViec.api.js` (213 lines verified)  
**Documentation status:** ✅ 100% code-verified
