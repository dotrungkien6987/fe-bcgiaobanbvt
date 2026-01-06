# 09. KPI API Reference 📡

> **Module**: QuanLyCongViec/KPI - Complete API Catalog  
> **Version**: 2.1.1  
> **Base URL**: `/api/workmanagement/kpi`  
> **Last Updated**: 5/1/2026

---

## 📑 Table of Contents

1. [Overview](#1-overview)
2. [Authentication](#2-authentication)
3. [Common Schemas](#3-common-schemas)
4. [Evaluation Cycle APIs](#4-evaluation-cycle-apis)
5. [Criteria Management APIs](#5-criteria-management-apis)
6. [KPI Evaluation APIs](#6-kpi-evaluation-apis)
7. [Routine Duty APIs](#7-routine-duty-apis)
8. [Approval Workflow APIs](#8-approval-workflow-apis)
9. [Batch Operations APIs](#9-batch-operations-apis)
10. [Report & Export APIs](#10-report--export-apis)
11. [Dashboard & Statistics APIs](#11-dashboard--statistics-apis)
12. [Error Codes Reference](#12-error-codes-reference)

---

## 1. Overview

### 1.1 API Conventions

**Base URL:**

```
http://localhost:8020/api/workmanagement/kpi
```

**Request Format:**

- Content-Type: `application/json`
- Authorization: `Bearer <JWT_TOKEN>`

**Response Format:**

```javascript
{
  "success": true | false,
  "data": { /* response data */ },
  "errors": { /* error details (if failed) */ },
  "message": "Vietnamese message"
}
```

**Pagination:**

```javascript
// Query params
?page=1&limit=20&sort=-createdAt

// Response
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 157,
      "totalPages": 8
    }
  }
}
```

### 1.2 HTTP Status Codes

| Code | Meaning               | Usage                            |
| ---- | --------------------- | -------------------------------- |
| 200  | OK                    | Successful GET/PUT/DELETE        |
| 201  | Created               | Successful POST                  |
| 202  | Accepted              | Background job accepted          |
| 400  | Bad Request           | Invalid input/validation error   |
| 401  | Unauthorized          | Missing/invalid token            |
| 403  | Forbidden             | Insufficient permissions         |
| 404  | Not Found             | Resource doesn't exist           |
| 409  | Conflict              | Version conflict, duplicate data |
| 500  | Internal Server Error | Server error                     |

### 1.3 API Categories

```
📁 KPI APIs (52 endpoints)
├─ 📂 Evaluation Cycle (8 endpoints)
├─ 📂 Criteria Management (12 endpoints)
├─ 📂 KPI Evaluation (15 endpoints)
├─ 📂 Routine Duty (8 endpoints)
├─ 📂 Approval Workflow (5 endpoints)
├─ 📂 Batch Operations (3 endpoints)
└─ 📂 Reports & Statistics (7 endpoints)
```

---

## 2. Authentication

### 2.1 Login

**Endpoint:** `POST /api/auth/login`

**Request:**

```json
{
  "UserName": "kiendt",
  "PassWord": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "64f3cb6035c717ab00d75b8b",
      "UserName": "kiendt",
      "NhanVienID": "66b1dba74f79822a4752d90d",
      "PhanQuyen": "manager",
      "KhoaID": {
        "_id": "66a1234567890abcdef12345",
        "TenKhoa": "Khoa Nội"
      },
      "HoTen": "Đỗ Trung Kiên",
      "Email": "dotrungkien6987@gmail.com"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Đăng nhập thành công"
}
```

### 2.2 Authorization Header

**Format:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Required for:** All KPI endpoints

### 2.3 Permission Levels

| Role         | Access Level                                  |
| ------------ | --------------------------------------------- |
| `user`       | View own KPI, self-assessment                 |
| `manager`    | View department KPIs, approve evaluations     |
| `admin`      | Full access to all KPIs, system configuration |
| `superadmin` | Full access + user management                 |

---

## 3. Common Schemas

### 3.1 ChuKyDanhGia (Evaluation Cycle)

```typescript
interface ChuKyDanhGia {
  _id: ObjectId;
  TenChuKy: string; // "Quý 1/2026", "Tháng 3/2026"
  LoaiChuKy: "THANG" | "QUY" | "NAM" | "TUY_CHINH";
  NgayBatDau: Date;
  NgayKetThuc: Date;
  TrangThai: "CHUA_BAT_DAU" | "DANG_HOAT_DONG" | "DA_HOAN_THANH";
  TieuChiCauHinh: Array<{
    TieuChiDanhGiaID: ObjectId;
    TenTieuChi: string;
    MoTa?: string;
    MucDoKho: number; // Weight/difficulty 1-5
    GiaTriMax: number; // Max score 100
    BatBuoc: boolean;
    ThuTu: number;
  }>;
  GhiChu?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**

```json
{
  "_id": "67895b9a6f7b8c2d4e3f1a0b",
  "TenChuKy": "Quý 1/2026",
  "LoaiChuKy": "QUY",
  "NgayBatDau": "2026-01-01T00:00:00.000Z",
  "NgayKetThuc": "2026-03-31T23:59:59.999Z",
  "TrangThai": "DANG_HOAT_DONG",
  "TieuChiCauHinh": [
    {
      "TieuChiDanhGiaID": "66c1111222333444555666",
      "TenTieuChi": "Hoàn thành nhiệm vụ",
      "MoTa": "Đánh giá mức độ hoàn thành nhiệm vụ được giao",
      "MucDoKho": 5,
      "GiaTriMax": 100,
      "BatBuoc": true,
      "ThuTu": 1
    }
  ],
  "GhiChu": "",
  "isDeleted": false
}
```

### 3.2 TieuChiDanhGia (Criteria)

```typescript
interface TieuChiDanhGia {
  _id: ObjectId;
  TenTieuChi: string;
  MoTa?: string;
  MucDoKho: number; // Default weight 1-5
  GiaTriMax: number; // Max score (usually 100)
  LoaiTieuChi: "NHIEM_VU" | "HANH_VI" | "NANG_LUC" | "KHAC";
  BatBuoc: boolean;
  ThuTu: number; // Display order
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**

```json
{
  "_id": "66c1111222333444555666",
  "TenTieuChi": "Hoàn thành nhiệm vụ",
  "MoTa": "Đánh giá tỷ lệ hoàn thành nhiệm vụ được giao trong chu kỳ",
  "MucDoKho": 5,
  "GiaTriMax": 100,
  "LoaiTieuChi": "NHIEM_VU",
  "BatBuoc": true,
  "ThuTu": 1,
  "isDeleted": false
}
```

### 3.3 DanhGiaKPI (KPI Evaluation)

```typescript
interface DanhGiaKPI {
  _id: ObjectId;
  ChuKyDanhGiaID: ObjectId | ChuKyDanhGia;
  NhanVienID: ObjectId | NhanVien;
  NguoiDanhGiaID?: ObjectId | User;

  // Calculated scores (auto-calculated, not stored)
  TongDiemKPI?: number; // Weighted average of all duties
  DiemTuDanhGia?: number; // Average self-assessment
  DiemQuanLy?: number; // Average manager score

  // Workflow
  TrangThai: "CHUA_DUYET" | "DA_DUYET";
  NgayDuyet?: Date;
  NguoiDuyet?: ObjectId | User;

  // Approval history
  LichSuDuyet: Array<{
    NguoiDuyet: ObjectId | User;
    NgayDuyet: Date;
    GhiChu?: string;
  }>;

  // Undo approval history
  LichSuHuyDuyet: Array<{
    NguoiHuy: ObjectId | User;
    NgayHuy: Date;
    LyDo: string;
    DiemKPILucHuy: number;
  }>;

  // Comments/feedback
  PhanHoi?: string;
  NgayPhanHoi?: Date;
  NguoiPhanHoi?: ObjectId | User;

  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**

```json
{
  "_id": "67890abcdef1234567890abc",
  "ChuKyDanhGiaID": {
    "_id": "67895b9a6f7b8c2d4e3f1a0b",
    "TenChuKy": "Quý 1/2026"
  },
  "NhanVienID": {
    "_id": "66b1dba74f79822a4752d90d",
    "HoTen": "Nguyễn Văn A",
    "MaNhanVien": "NV001"
  },
  "NguoiDanhGiaID": {
    "_id": "66b2222333444555666777",
    "HoTen": "Trần Thị B"
  },
  "TongDiemKPI": 8.5,
  "DiemTuDanhGia": 8.3,
  "DiemQuanLy": 8.6,
  "TrangThai": "DA_DUYET",
  "NgayDuyet": "2026-04-05T10:30:00.000Z",
  "LichSuDuyet": [
    {
      "NguoiDuyet": "66b2222333444555666777",
      "NgayDuyet": "2026-04-05T10:30:00.000Z",
      "GhiChu": "Hoàn thành tốt nhiệm vụ"
    }
  ],
  "isDeleted": false
}
```

### 3.4 NhiemVuThuongQuy (Routine Duty)

```typescript
interface NhiemVuThuongQuy {
  _id: ObjectId;
  TenNhiemVu: string;
  MoTa?: string;
  LoaiNhiemVu: "NGAY" | "TUAN" | "THANG" | "QUY" | "NAM";
  PhongBanID?: ObjectId | PhongBan;
  TrangThai: "HOAT_DONG" | "NGUNG_HOAT_DONG";
  ThuTu: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### 3.5 DanhGiaNhiemVuThuongQuy

```typescript
interface DanhGiaNhiemVuThuongQuy {
  _id: ObjectId;
  DanhGiaKPIID: ObjectId | DanhGiaKPI;
  NhiemVuThuongQuyID: ObjectId | NhiemVuThuongQuy;
  NhanVienID: ObjectId | NhanVien;
  ChuKyDanhGiaID: ObjectId | ChuKyDanhGia;

  // Criteria configuration (from ChuKy.TieuChiCauHinh)
  TieuChiCauHinh: Array<{
    TieuChiDanhGiaID: ObjectId;
    TenTieuChi: string;
    MucDoKho: number;
    GiaTriMax: number;
    BatBuoc: boolean;
    ThuTu: number;
  }>;

  // Scores detail (matched with TieuChiCauHinh)
  ChiTietDiem: Array<{
    TenTieuChi: string;
    DiemQuanLy: number; // Manager score (0-100)
    DiemTuDanhGia?: number; // Self-assessment (0-100)
  }>;

  // Calculated scores (not stored, computed)
  DiemQuanLy?: number; // Weighted average of manager scores
  DiemNhiemVu?: number; // Final score (formula in Section 3)

  GhiChu?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

**Example:**

```json
{
  "_id": "678a1b2c3d4e5f6789012345",
  "DanhGiaKPIID": "67890abcdef1234567890abc",
  "NhiemVuThuongQuyID": "66d9999888777666555444",
  "NhanVienID": "66b1dba74f79822a4752d90d",
  "ChuKyDanhGiaID": "67895b9a6f7b8c2d4e3f1a0b",
  "TieuChiCauHinh": [
    {
      "TieuChiDanhGiaID": "66c1111222333444555666",
      "TenTieuChi": "Mức độ hoàn thành công việc",
      "MucDoKho": 5,
      "GiaTriMax": 100,
      "BatBuoc": true,
      "ThuTu": 1
    },
    {
      "TieuChiDanhGiaID": "66c2222333444555666777",
      "TenTieuChi": "Chất lượng công việc",
      "MucDoKho": 4,
      "GiaTriMax": 100,
      "BatBuoc": true,
      "ThuTu": 2
    }
  ],
  "ChiTietDiem": [
    {
      "TenTieuChi": "Mức độ hoàn thành công việc",
      "DiemQuanLy": 90,
      "DiemTuDanhGia": 85
    },
    {
      "TenTieuChi": "Chất lượng công việc",
      "DiemQuanLy": 85,
      "DiemTuDanhGia": 80
    }
  ],
  "DiemQuanLy": 87.78,
  "DiemNhiemVu": 86.85,
  "isDeleted": false
}
```

---

## 4. Evaluation Cycle APIs

### 4.1 List Cycles

**Endpoint:** `GET /api/workmanagement/chu-ky-danh-gia`

**Description:** Lấy danh sách tất cả chu kỳ đánh giá

**Authentication:** Required

**Query Parameters:**

```typescript
{
  LoaiChuKy?: "THANG" | "QUY" | "NAM" | "TUY_CHINH";
  TrangThai?: "CHUA_BAT_DAU" | "DANG_HOAT_DONG" | "DA_HOAN_THANH";
  page?: number;      // Default: 1
  limit?: number;     // Default: 20
  sort?: string;      // Default: "-createdAt"
}
```

**Request Example:**

```bash
GET /api/workmanagement/chu-ky-danh-gia?LoaiChuKy=QUY&TrangThai=DANG_HOAT_DONG
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "67895b9a6f7b8c2d4e3f1a0b",
        "TenChuKy": "Quý 1/2026",
        "LoaiChuKy": "QUY",
        "NgayBatDau": "2026-01-01T00:00:00.000Z",
        "NgayKetThuc": "2026-03-31T23:59:59.999Z",
        "TrangThai": "DANG_HOAT_DONG",
        "TieuChiCauHinh": [...],
        "createdAt": "2025-12-15T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    }
  },
  "message": "Lấy danh sách chu kỳ đánh giá thành công"
}
```

### 4.2 Get Active Cycle

**Endpoint:** `GET /api/workmanagement/chu-ky-danh-gia/hoat-dong`

**Description:** Lấy chu kỳ đang hoạt động hiện tại

**Authentication:** Required

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "67895b9a6f7b8c2d4e3f1a0b",
    "TenChuKy": "Quý 1/2026",
    "LoaiChuKy": "QUY",
    "NgayBatDau": "2026-01-01T00:00:00.000Z",
    "NgayKetThuc": "2026-03-31T23:59:59.999Z",
    "TrangThai": "DANG_HOAT_DONG",
    "TieuChiCauHinh": [...]
  },
  "message": "Lấy chu kỳ hoạt động thành công"
}
```

**Response (404 Not Found):**

```json
{
  "success": false,
  "errors": { "message": "Không có chu kỳ nào đang hoạt động" },
  "message": "Không có chu kỳ nào đang hoạt động"
}
```

### 4.3 Get Cycle by ID

**Endpoint:** `GET /api/workmanagement/chu-ky-danh-gia/:id`

**Description:** Lấy chi tiết chu kỳ theo ID

**Authentication:** Required

**URL Parameters:**

- `id` (ObjectId) - Chu kỳ ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "67895b9a6f7b8c2d4e3f1a0b",
    "TenChuKy": "Quý 1/2026",
    "LoaiChuKy": "QUY",
    "NgayBatDau": "2026-01-01T00:00:00.000Z",
    "NgayKetThuc": "2026-03-31T23:59:59.999Z",
    "TrangThai": "DANG_HOAT_DONG",
    "TieuChiCauHinh": [...],
    "GhiChu": "",
    "createdAt": "2025-12-15T08:00:00.000Z",
    "updatedAt": "2025-12-15T08:00:00.000Z"
  },
  "message": "Lấy chi tiết chu kỳ thành công"
}
```

### 4.4 Create Cycle

**Endpoint:** `POST /api/workmanagement/chu-ky-danh-gia`

**Description:** Tạo chu kỳ đánh giá mới

**Authentication:** Required (Admin/Manager)

**Request Body:**

```json
{
  "TenChuKy": "Quý 2/2026",
  "LoaiChuKy": "QUY",
  "NgayBatDau": "2026-04-01T00:00:00.000Z",
  "NgayKetThuc": "2026-06-30T23:59:59.999Z",
  "TieuChiCauHinh": [
    {
      "TieuChiDanhGiaID": "66c1111222333444555666",
      "TenTieuChi": "Hoàn thành nhiệm vụ",
      "MoTa": "Đánh giá mức độ hoàn thành",
      "MucDoKho": 5,
      "GiaTriMax": 100,
      "BatBuoc": true,
      "ThuTu": 1
    }
  ],
  "GhiChu": ""
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "_id": "678b5c6d7e8f9012345678ab",
    "TenChuKy": "Quý 2/2026",
    "LoaiChuKy": "QUY",
    "NgayBatDau": "2026-04-01T00:00:00.000Z",
    "NgayKetThuc": "2026-06-30T23:59:59.999Z",
    "TrangThai": "CHUA_BAT_DAU",
    "TieuChiCauHinh": [...],
    "createdAt": "2026-01-05T14:30:00.000Z"
  },
  "message": "Tạo chu kỳ đánh giá thành công"
}
```

### 4.5 Update Cycle

**Endpoint:** `PUT /api/workmanagement/chu-ky-danh-gia/:id`

**Description:** Cập nhật thông tin chu kỳ

**Authentication:** Required (Admin/Manager)

**URL Parameters:**

- `id` (ObjectId) - Chu kỳ ID

**Request Body:**

```json
{
  "TenChuKy": "Quý 2/2026 (Cập nhật)",
  "TieuChiCauHinh": [...],
  "GhiChu": "Đã bổ sung tiêu chí mới"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678b5c6d7e8f9012345678ab",
    "TenChuKy": "Quý 2/2026 (Cập nhật)",
    "updatedAt": "2026-01-05T15:00:00.000Z"
  },
  "message": "Cập nhật chu kỳ thành công"
}
```

### 4.6 Delete Cycle

**Endpoint:** `DELETE /api/workmanagement/chu-ky-danh-gia/:id`

**Description:** Xóa chu kỳ (soft delete)

**Authentication:** Required (Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Xóa chu kỳ thành công"
}
```

### 4.7 Activate Cycle

**Endpoint:** `PUT /api/workmanagement/chu-ky-danh-gia/:id/bat-dau`

**Description:** Kích hoạt chu kỳ đánh giá (chuyển sang trạng thái DANG_HOAT_DONG)

**Authentication:** Required (Admin/Manager)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678b5c6d7e8f9012345678ab",
    "TrangThai": "DANG_HOAT_DONG"
  },
  "message": "Kích hoạt chu kỳ thành công"
}
```

### 4.8 Complete Cycle

**Endpoint:** `PUT /api/workmanagement/chu-ky-danh-gia/:id/hoan-thanh`

**Description:** Hoàn thành chu kỳ đánh giá

**Authentication:** Required (Admin/Manager)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "678b5c6d7e8f9012345678ab",
    "TrangThai": "DA_HOAN_THANH"
  },
  "message": "Hoàn thành chu kỳ thành công"
}
```

---

## 5. Criteria Management APIs

> **Note**: Tiêu chí được cấu hình trong `ChuKyDanhGia.TieuChiCauHinh`, không có API riêng. Xem Section 4 để quản lý tiêu chí thông qua chu kỳ.

**Criteria Configuration Pattern:**

```javascript
// Tiêu chí được định nghĩa trong ChuKyDanhGia
{
  "TieuChiCauHinh": [
    {
      "TieuChiDanhGiaID": "66c1111222333444555666",
      "TenTieuChi": "Hoàn thành nhiệm vụ",
      "MoTa": "Đánh giá mức độ hoàn thành nhiệm vụ",
      "MucDoKho": 5,
      "GiaTriMax": 100,
      "BatBuoc": true,
      "ThuTu": 1
    }
  ]
}
```

**Common Criteria Examples:**

1. **Hoàn thành nhiệm vụ** (MucDoKho: 5) - Task completion rate
2. **Chất lượng công việc** (MucDoKho: 4) - Work quality
3. **Kỹ năng chuyên môn** (MucDoKho: 4) - Professional skills
4. **Tinh thần trách nhiệm** (MucDoKho: 3) - Responsibility
5. **Kỷ luật lao động** (MucDoKho: 2) - Work discipline
6. **Làm việc nhóm** (MucDoKho: 3) - Teamwork

**API Operations:**

- Add/update criteria: Use `PUT /api/workmanagement/chu-ky-danh-gia/:id` with updated `TieuChiCauHinh`
- Sync criteria to existing evaluations: Use `POST /api/workmanagement/kpi/reset-criteria`

---

## 6. KPI Evaluation APIs

### 6.1 List Evaluations

**Endpoint:** `GET /api/workmanagement/kpi`

**Description:** Lấy danh sách tất cả đánh giá KPI (với filter)

**Authentication:** Required

**Query Parameters:**

```typescript
{
  ChuKyDanhGiaID?: ObjectId;
  NhanVienID?: ObjectId;
  TrangThai?: "CHUA_DUYET" | "DA_DUYET";
  page?: number;
  limit?: number;
}
```

**Request Example:**

```bash
GET /api/workmanagement/kpi?ChuKyDanhGiaID=67895b9a6f7b8c2d4e3f1a0b&TrangThai=DA_DUYET
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPIs": [
      {
        "_id": "67890abcdef1234567890abc",
        "ChuKyDanhGiaID": { "_id": "...", "TenChuKy": "Quý 1/2026" },
        "NhanVienID": { "_id": "...", "HoTen": "Nguyễn Văn A" },
        "TongDiemKPI": 8.5,
        "TrangThai": "DA_DUYET"
      }
    ],
    "count": 52
  },
  "message": "Lấy danh sách đánh giá KPI thành công"
}
```

### 6.2 Get Evaluation by ID

**Endpoint:** `GET /api/workmanagement/kpi/:id`

**Description:** Lấy chi tiết đánh giá KPI

**Authentication:** Required

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "67890abcdef1234567890abc",
      "ChuKyDanhGiaID": {...},
      "NhanVienID": {...},
      "TongDiemKPI": 8.5,
      "TrangThai": "DA_DUYET",
      "LichSuDuyet": [...]
    },
    "danhGiaNhiemVu": [
      {
        "_id": "678a1b2c3d4e5f6789012345",
        "NhiemVuThuongQuyID": {...},
        "ChiTietDiem": [...],
        "DiemNhiemVu": 8.83
      }
    ]
  },
  "message": "Lấy chi tiết đánh giá KPI thành công"
}
```

### 6.3 Create Evaluation

**Endpoint:** `POST /api/workmanagement/kpi`

**Description:** Tạo đánh giá KPI mới cho nhân viên

**Authentication:** Required (Manager)

**Request Body:**

```json
{
  "ChuKyDanhGiaID": "67895b9a6f7b8c2d4e3f1a0b",
  "NhanVienID": "66b1dba74f79822a4752d90d",
  "NguoiDanhGiaID": "66b2222333444555666777"
}
```

**Response (201 Created):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "67890abcdef1234567890abc",
      "ChuKyDanhGiaID": "67895b9a6f7b8c2d4e3f1a0b",
      "NhanVienID": "66b1dba74f79822a4752d90d",
      "TrangThai": "CHUA_DUYET",
      "createdAt": "2026-01-05T14:30:00.000Z"
    },
    "danhGiaNhiemVu": []
  },
  "message": "Tạo đánh giá KPI thành công"
}
```

### 6.4 Get Dashboard (Manager)

**Endpoint:** `GET /api/workmanagement/kpi/dashboard/:chuKyId`

**Description:** Lấy danh sách nhân viên được quản lý + điểm KPI (cho manager dashboard)

**Authentication:** Required (Manager)

**URL Parameters:**

- `chuKyId` (ObjectId) - Chu kỳ ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "nhanVienList": [
      {
        "nhanVien": {
          "_id": "66b1dba74f79822a4752d90d",
          "HoTen": "Nguyễn Văn A",
          "MaNhanVien": "NV001"
        },
        "danhGiaKPI": {
          "_id": "67890abcdef1234567890abc",
          "TongDiemKPI": 8.5,
          "TrangThai": "DA_DUYET"
        },
        "progress": {
          "totalTasks": 5,
          "scoredTasks": 5,
          "percentComplete": 100
        }
      }
    ],
    "summary": {
      "totalNhanVien": 25,
      "completed": 20,
      "inProgress": 3,
      "notStarted": 2
    }
  },
  "message": "Lấy dashboard thành công"
}
```

### 6.5 Get Evaluation by Cycle

**Endpoint:** `GET /api/workmanagement/kpi/chu-ky/:chuKyId`

**Description:** Lấy danh sách đánh giá KPI theo chu kỳ (with pagination)

**Authentication:** Required (Manager/Admin)

**Query Parameters:**

```typescript
{
  page?: number;       // Default: 1
  limit?: number;      // Default: 20
  trangThai?: "CHUA_DUYET" | "DA_DUYET";
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhSachKPI": [
      {
        "_id": "67890abcdef1234567890abc",
        "NhanVienID": { "HoTen": "Nguyễn Văn A", "MaNhanVien": "NV001" },
        "TongDiemKPI": 8.5,
        "TrangThai": "DA_DUYET"
      }
    ],
    "totalPages": 3,
    "currentPage": 1,
    "count": 52
  },
  "message": "Lấy danh sách đánh giá KPI thành công"
}
```

### 6.6 Get Employee History

**Endpoint:** `GET /api/workmanagement/kpi/nhan-vien/:nhanVienId`

**Description:** Lấy lịch sử đánh giá KPI của nhân viên qua các chu kỳ

**Authentication:** Required

**URL Parameters:**

- `nhanVienId` (ObjectId) - Nhân viên ID

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "_id": "67890abcdef1234567890abc",
      "ChuKyDanhGiaID": {
        "TenChuKy": "Quý 1/2026",
        "NgayBatDau": "2026-01-01",
        "NgayKetThuc": "2026-03-31"
      },
      "TongDiemKPI": 8.5,
      "TrangThai": "DA_DUYET",
      "NgayDuyet": "2026-04-05T10:30:00.000Z"
    },
    {
      "_id": "678a2b3c4d5e6f7890123456",
      "ChuKyDanhGiaID": { "TenChuKy": "Quý 4/2025" },
      "TongDiemKPI": 8.2,
      "TrangThai": "DA_DUYET"
    }
  ],
  "message": "Lấy lịch sử KPI thành công"
}
```

### 6.7 Get Evaluation Detail (V2 - Criteria-Based)

**Endpoint:** `GET /api/workmanagement/kpi/cham-diem-tieu-chi`

**Description:** Lấy chi tiết đánh giá KPI với tiêu chí (for v2 UI)

**Authentication:** Required (Manager)

**Query Parameters:**

```typescript
{
  chuKyId: ObjectId; // Required
  nhanVienId: ObjectId; // Required
}
```

**Request Example:**

```bash
GET /api/workmanagement/kpi/cham-diem-tieu-chi?chuKyId=67895b9a&nhanVienId=66b1dba7
Authorization: Bearer <token>
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "67890abcdef1234567890abc",
      "NhanVienID": {
        "HoTen": "Nguyễn Văn A",
        "MaNhanVien": "NV001",
        "Email": "nguyenvana@hospital.com"
      },
      "ChuKyDanhGiaID": {
        "TenChuKy": "Quý 1/2026",
        "TieuChiCauHinh": [...]
      },
      "TrangThai": "CHUA_DUYET"
    },
    "danhGiaNhiemVu": [
      {
        "_id": "678a1b2c3d4e5f6789012345",
        "NhiemVuThuongQuyID": {
          "TenNhiemVu": "Chăm sóc bệnh nhân",
          "MoTa": "..."
        },
        "TieuChiCauHinh": [...],
        "ChiTietDiem": [
          {
            "TenTieuChi": "Mức độ hoàn thành công việc",
            "DiemQuanLy": 90,
            "DiemTuDanhGia": 85
          }
        ]
      }
    ],
    "nhanVienNhiemVu": [
      {
        "NhiemVuThuongQuyID": "...",
        "DiemTuDanhGia": 85
      }
    ]
  },
  "message": "Lấy chi tiết đánh giá thành công"
}
```

### 6.8 Submit Manager Scores (V2 - Batch)

**Endpoint:** `POST /api/workmanagement/kpi/duyet-kpi-tieu-chi/:danhGiaKPIId`

**Description:** Chấm điểm và duyệt KPI (batch upsert nhiệm vụ)

**Authentication:** Required (Manager)

**URL Parameters:**

- `danhGiaKPIId` (ObjectId) - DanhGiaKPI ID

**Request Body:**

```json
{
  "nhiemVuList": [
    {
      "NhiemVuThuongQuyID": "66d9999888777666555444",
      "MucDoKho": 5,
      "ChiTietDiem": [
        {
          "TenTieuChi": "Mức độ hoàn thành công việc",
          "DiemQuanLy": 90
        },
        {
          "TenTieuChi": "Chất lượng công việc",
          "DiemQuanLy": 85
        }
      ]
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "67890abcdef1234567890abc",
      "TongDiemKPI": 8.5,
      "TrangThai": "DA_DUYET",
      "NgayDuyet": "2026-01-05T15:00:00.000Z"
    }
  },
  "message": "Duyệt KPI thành công"
}
```

### 6.9 Save Without Approval

**Endpoint:** `POST /api/workmanagement/kpi/luu-tat-ca/:danhGiaKPIId`

**Description:** Lưu điểm nhiệm vụ nhưng không duyệt (batch upsert)

**Authentication:** Required (Manager)

**Request Body:** Same as 6.8

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "67890abcdef1234567890abc",
      "TrangThai": "CHUA_DUYET"
    },
    "upsertedCount": 5
  },
  "message": "Lưu điểm thành công"
}
```

### 6.10 Reset Criteria

**Endpoint:** `POST /api/workmanagement/kpi/reset-criteria`

**Description:** Đồng bộ lại tiêu chí từ ChuKy.TieuChiCauHinh (giữ điểm cũ)

**Authentication:** Required (Manager)

**Request Body:**

```json
{
  "danhGiaKPIId": "67890abcdef1234567890abc"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "mergedCount": 3,
    "addedCount": 1
  },
  "message": "Đồng bộ tiêu chí thành công"
}
```

### 6.11 Get Statistics by Cycle

**Endpoint:** `GET /api/workmanagement/kpi/thong-ke/chu-ky/:chuKyId`

**Description:** Lấy thống kê KPI theo chu kỳ (top performers, distribution)

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "topNhanVien": [
      {
        "NhanVienID": { "HoTen": "Nguyễn Văn A" },
        "TongDiemKPI": 9.2
      }
    ],
    "phanBoXepLoai": {
      "xuatSac": 2,
      "tot": 11,
      "kha": 8,
      "trungBinh": 2,
      "yeu": 0
    },
    "diemTrungBinh": 8.3,
    "tongSoDanhGia": 23
  },
  "message": "Lấy thống kê KPI thành công"
}
```

### 6.12 Add Feedback

**Endpoint:** `PUT /api/workmanagement/kpi/:id/phan-hoi`

**Description:** Thêm phản hồi/nhận xét cho đánh giá KPI

**Authentication:** Required

**Request Body:**

```json
{
  "PhanHoi": "Nhân viên có tinh thần trách nhiệm cao, hoàn thành tốt công việc được giao."
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "_id": "67890abcdef1234567890abc",
    "PhanHoi": "Nhân viên có tinh thần trách nhiệm cao...",
    "NgayPhanHoi": "2026-01-05T16:00:00.000Z"
  },
  "message": "Thêm phản hồi thành công"
}
```

### 6.13 Delete Evaluation

**Endpoint:** `DELETE /api/workmanagement/kpi/:id`

**Description:** Xóa đánh giá KPI (soft delete)

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": null,
  "message": "Xóa đánh giá KPI thành công"
}
```

---

## 7. Routine Duty APIs

### 7.1 Get Employee Duties

**Endpoint:** `GET /api/workmanagement/kpi/nhan-vien/:NhanVienID/nhiem-vu`

**Description:** Lấy danh sách nhiệm vụ để đánh giá (theo chu kỳ)

**Authentication:** Required (Manager)

**Query Parameters:**

```typescript
{
  chuKyId: ObjectId; // Required
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "nhiemVuList": [
      {
        "NhiemVuThuongQuyID": "66d9999888777666555444",
        "TenNhiemVu": "Chăm sóc bệnh nhân",
        "MoTa": "Chăm sóc bệnh nhân nội trú",
        "LoaiNhiemVu": "NGAY"
      }
    ],
    "existingDanhGia": [
      {
        "NhiemVuThuongQuyID": "66d9999888777666555444",
        "ChiTietDiem": [...],
        "hasScore": true
      }
    ]
  },
  "message": "Lấy danh sách nhiệm vụ thành công"
}
```

### 7.2 Update Duty Evaluation

**Endpoint:** `POST /api/workmanagement/kpi/nhan-vien/:NhanVienID/danh-gia`

**Description:** Lưu đánh giá nhiệm vụ (batch upsert)

**Authentication:** Required (Manager)

**Request Body:**

```json
{
  "chuKyId": "67895b9a6f7b8c2d4e3f1a0b",
  "danhGiaList": [
    {
      "NhiemVuThuongQuyID": "66d9999888777666555444",
      "ChiTietDiem": [
        {
          "TenTieuChi": "Mức độ hoàn thành công việc",
          "DiemQuanLy": 90
        }
      ],
      "GhiChu": "Hoàn thành tốt"
    }
  ]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "upsertedCount": 1,
    "danhGiaList": [...]
  },
  "message": "Lưu đánh giá nhiệm vụ thành công"
}
```

### 7.3 Check Score Status

**Endpoint:** `GET /api/workmanagement/kpi/danh-gia-nhiem-vu/has-score`

**Description:** Check nhanh một nhiệm vụ đã có điểm chưa

**Authentication:** Required

**Query Parameters:**

```typescript
{
  nhanVienId: ObjectId;
  nhiemVuId: ObjectId;
  chuKyId: ObjectId;
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "hasScore": true,
    "danhGiaId": "678a1b2c3d4e5f6789012345"
  }
}
```

---

## 8. Approval Workflow APIs

### 8.1 Approve KPI (Criteria-Based)

**Endpoint:** `POST /api/workmanagement/kpi/duyet-kpi-tieu-chi/:danhGiaKPIId`

**Description:** Duyệt đánh giá KPI (đã có ở Section 6.8 - đây là endpoint chính cho approval)

**Authentication:** Required (Manager)

**Request Body:**

```json
{
  "nhiemVuList": [
    {
      "NhiemVuThuongQuyID": "66d9999888777666555444",
      "MucDoKho": 5,
      "ChiTietDiem": [...]
    }
  ],
  "GhiChu": "Hoàn thành tốt nhiệm vụ"
}
```

**Business Logic:**

- Tính toán TongDiemKPI tại thời điểm duyệt
- Lưu snapshot vào LichSuDuyet
- Chuyển TrangThai: CHUA_DUYET → DA_DUYET
- Tạo thông báo cho nhân viên

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "67890abcdef1234567890abc",
      "TongDiemKPI": 8.5,
      "TrangThai": "DA_DUYET",
      "NgayDuyet": "2026-01-05T15:30:00.000Z",
      "LichSuDuyet": [{
        "nguoiDuyet": "66b2222333444555666777",
        "ngayDuyet": "2026-01-05T15:30:00.000Z",
        "tongDiemKPI": 8.5,
        "nhiemVuSnapshot": [...]
      }]
    }
  },
  "message": "Duyệt KPI thành công"
}
```

### 8.2 Undo Approval

**Endpoint:** `POST /api/workmanagement/kpi/:id/huy-duyet`

**Description:** Hủy duyệt đánh giá KPI (with audit trail)

**Authentication:** Required (Manager/Admin)

**Request Body:**

```json
{
  "lyDo": "Cần chỉnh sửa điểm số"
}
```

**Business Logic:**

- Chuyển TrangThai: DA_DUYET → CHUA_DUYET
- Lưu snapshot vào LichSuHuyDuyet
- Giữ nguyên điểm đã nhập (không xóa DanhGiaNhiemVuThuongQuy)
- Tạo thông báo cho người liên quan

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "67890abcdef1234567890abc",
      "TrangThai": "CHUA_DUYET",
      "LichSuHuyDuyet": [
        {
          "nguoiHuy": "66b2222333444555666777",
          "ngayHuy": "2026-01-06T09:00:00.000Z",
          "lyDo": "Cần chỉnh sửa điểm số",
          "diemCu": 8.5
        }
      ]
    }
  },
  "message": "Hủy duyệt KPI thành công"
}
```

### 8.3 Get Approval History

**Endpoint:** `GET /api/workmanagement/kpi/:id/lich-su-duyet`

**Description:** Lấy lịch sử duyệt/hủy duyệt của đánh giá KPI

**Authentication:** Required

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "LichSuDuyet": [
      {
        "nguoiDuyet": { "HoTen": "Nguyễn Văn B" },
        "ngayDuyet": "2026-01-05T15:30:00.000Z",
        "tongDiemKPI": 8.5,
        "nhiemVuSnapshot": [...]
      }
    ],
    "LichSuHuyDuyet": [
      {
        "nguoiHuy": { "HoTen": "Trần Thị C" },
        "ngayHuy": "2026-01-06T09:00:00.000Z",
        "lyDo": "Cần chỉnh sửa điểm số",
        "diemCu": 8.5
      }
    ]
  },
  "message": "Lấy lịch sử duyệt thành công"
}
```

### 8.4 Get Pending Approvals

**Endpoint:** `GET /api/workmanagement/kpi/cho-duyet`

**Description:** Lấy danh sách đánh giá KPI chờ duyệt (for manager dashboard)

**Authentication:** Required (Manager)

**Query Parameters:**

```typescript
{
  chuKyId?: ObjectId;
  page?: number;
  limit?: number;
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "danhSachKPI": [
      {
        "_id": "67890abcdef1234567890abc",
        "NhanVienID": { "HoTen": "Nguyễn Văn A" },
        "ChuKyDanhGiaID": { "TenChuKy": "Quý 1/2026" },
        "TrangThai": "CHUA_DUYET",
        "createdAt": "2026-01-03T10:00:00.000Z"
      }
    ],
    "count": 5
  },
  "message": "Lấy danh sách chờ duyệt thành công"
}
```

### 8.5 Batch Approve

**Endpoint:** `POST /api/workmanagement/kpi/batch-approve`

**Description:** Duyệt hàng loạt đánh giá KPI (see Section 9.1 for details)

**Authentication:** Required (Manager/Admin)

**Request Body:**

```json
{
  "danhGiaKPIIds": ["67890abcdef1234567890abc", "678a1b2c3d4e5f6789012345"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "approved": 2,
    "failed": 0,
    "results": [...]
  },
  "message": "Duyệt hàng loạt thành công"
}
```

---

## 9. Batch Operations APIs

### 9.1 Batch Approve KPI

**Endpoint:** `POST /api/workmanagement/kpi/batch-approve`

**Description:** Duyệt hàng loạt đánh giá KPI đã chấm điểm đầy đủ

**Authentication:** Required (Manager/Admin)

**Request Body:**

```json
{
  "danhGiaKPIIds": [
    "67890abcdef1234567890abc",
    "678a1b2c3d4e5f6789012345",
    "678b2c3d4e5f6789012346"
  ]
}
```

**Business Logic:**

- Validate: Chỉ duyệt nếu TrangThai = CHUA_DUYET
- Validate: Tất cả nhiệm vụ đã có điểm
- Transaction: Duyệt tất cả hoặc rollback nếu lỗi
- Tính TongDiemKPI cho từng evaluation
- Tạo thông báo hàng loạt

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalRequested": 3,
    "approved": 2,
    "failed": 1,
    "results": [
      {
        "_id": "67890abcdef1234567890abc",
        "status": "approved",
        "TongDiemKPI": 8.5
      },
      {
        "_id": "678a1b2c3d4e5f6789012345",
        "status": "approved",
        "TongDiemKPI": 8.8
      },
      {
        "_id": "678b2c3d4e5f6789012346",
        "status": "failed",
        "error": "Chưa chấm điểm đầy đủ"
      }
    ]
  },
  "message": "Duyệt hàng loạt thành công: 2/3 đánh giá"
}
```

### 9.2 Batch Undo Approval

**Endpoint:** `POST /api/workmanagement/kpi/batch-huy-duyet`

**Description:** Hủy duyệt hàng loạt đánh giá KPI

**Authentication:** Required (Manager/Admin)

**Request Body:**

```json
{
  "danhGiaKPIIds": ["67890abcdef1234567890abc", "678a1b2c3d4e5f6789012345"],
  "lyDo": "Cần điều chỉnh lại tiêu chí đánh giá"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "totalRequested": 2,
    "undone": 2,
    "failed": 0,
    "results": [...]
  },
  "message": "Hủy duyệt hàng loạt thành công"
}
```

### 9.3 Batch Calculate Scores

**Endpoint:** `POST /api/workmanagement/kpi/batch-calculate`

**Description:** Tính lại điểm KPI hàng loạt (preview mode)

**Authentication:** Required (Manager/Admin)

**Request Body:**

```json
{
  "chuKyId": "67895b9a6f7b8c2d4e3f1a0b",
  "nhanVienIds": ["66b1dba74f79822a4752d90d", "66b2222333444555666777"]
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "calculations": [
      {
        "NhanVienID": "66b1dba74f79822a4752d90d",
        "HoTen": "Nguyễn Văn A",
        "TongDiemKPI": 8.5,
        "breakdown": [
          {
            "TenNhiemVu": "Chăm sóc bệnh nhân",
            "DiemNhiemVu": 8.83,
            "MucDoKho": 5
          }
        ]
      }
    ]
  },
  "message": "Tính toán điểm thành công"
}
```

---

## 10. Report & Export APIs

### 10.1 Export Excel

**Endpoint:** `GET /api/workmanagement/kpi/export/excel/:chuKyId`

**Description:** Export báo cáo KPI ra Excel (xlsx)

**Authentication:** Required (Manager/Admin)

**Query Parameters:**

```typescript
{
  phongBanId?: ObjectId;    // Filter by department
  includeDetails?: boolean; // Include criteria breakdown
}
```

**Request Example:**

```bash
GET /api/workmanagement/kpi/export/excel/67895b9a?includeDetails=true
Authorization: Bearer <token>
```

**Response (200 OK):**

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="KPI_Quy1_2026.xlsx"

[Binary Excel File]
```

**Excel Structure:**

- Sheet 1: Tổng hợp (Summary table)
- Sheet 2: Chi tiết điểm (Detailed scores per employee)
- Sheet 3: Biểu đồ (Charts - average by department)

### 10.2 Export PDF

**Endpoint:** `GET /api/workmanagement/kpi/export/pdf/:danhGiaKPIId`

**Description:** Export đánh giá KPI cá nhân ra PDF

**Authentication:** Required

**Response (200 OK):**

```
Content-Type: application/pdf
Content-Disposition: attachment; filename="KPI_NguyenVanA_Quy1_2026.pdf"

[Binary PDF File]
```

**PDF Content:**

- Header: Thông tin nhân viên, chu kỳ
- Section 1: Điểm tổng hợp (TongDiemKPI, xếp loại)
- Section 2: Chi tiết nhiệm vụ (breakdown by duty with criteria)
- Section 3: Lịch sử phê duyệt
- Footer: Chữ ký người đánh giá/nhân viên

### 10.3 Get PowerPoint Data

**Endpoint:** `GET /api/workmanagement/kpi/export/powerpoint/:chuKyId`

**Description:** Lấy dữ liệu cho PowerPoint presentation

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "chuKy": {
      "TenChuKy": "Quý 1/2026",
      "NgayBatDau": "2026-01-01",
      "NgayKetThuc": "2026-03-31"
    },
    "summary": {
      "tongSoNhanVien": 52,
      "daHoanThanh": 48,
      "diemTrungBinh": 8.4
    },
    "topPerformers": [{ "HoTen": "Nguyễn Văn A", "TongDiemKPI": 9.5 }],
    "phanBoXepLoai": {
      "xuatSac": 5,
      "tot": 28,
      "kha": 12,
      "trungBinh": 3,
      "yeu": 0
    },
    "chartData": {
      "labels": ["Khoa Nội", "Khoa Ngoại", "Khoa Sản"],
      "scores": [8.5, 8.3, 8.7]
    }
  },
  "message": "Lấy dữ liệu PowerPoint thành công"
}
```

### 10.4 Get Report Statistics

**Endpoint:** `GET /api/workmanagement/kpi/bao-cao/:chuKyId`

**Description:** Báo cáo chi tiết KPI theo chu kỳ (for reports module)

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "tongQuan": {
      "tongSoNhanVien": 52,
      "daDanhGia": 48,
      "choDanhGia": 4,
      "diemTrungBinh": 8.4,
      "diemCaoNhat": 9.5,
      "diemThapNhat": 6.2
    },
    "theoPhongBan": [
      {
        "PhongBan": { "TenPhongBan": "Khoa Nội" },
        "soNhanVien": 15,
        "diemTrungBinh": 8.5,
        "tyLeDat": 93.3
      }
    ],
    "theoXepLoai": {
      "xuatSac": { "soLuong": 5, "tyLe": 9.6 },
      "tot": { "soLuong": 28, "tyLe": 53.8 },
      "kha": { "soLuong": 12, "tyLe": 23.1 },
      "trungBinh": { "soLuong": 3, "tyLe": 5.8 },
      "yeu": { "soLuong": 0, "tyLe": 0 }
    }
  },
  "message": "Lấy báo cáo KPI thành công"
}
```

### 10.5 Get Comparison Data

**Endpoint:** `GET /api/workmanagement/kpi/so-sanh/:nhanVienId`

**Description:** So sánh KPI của nhân viên qua các chu kỳ

**Authentication:** Required

**Query Parameters:**

```typescript
{
  soLuongChuKy?: number; // Default: 4 (last 4 cycles)
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "nhanVien": { "HoTen": "Nguyễn Văn A" },
    "danhSachDiem": [
      {
        "ChuKy": "Quý 1/2026",
        "TongDiemKPI": 8.5,
        "XepLoai": "Tốt"
      },
      {
        "ChuKy": "Quý 4/2025",
        "TongDiemKPI": 8.2,
        "XepLoai": "Tốt"
      }
    ],
    "xuHuong": "TANG", // TANG | GIAM | ON_DINH
    "trungBinh": 8.35
  },
  "message": "Lấy dữ liệu so sánh thành công"
}
```

### 10.6 Estimate Export Size

**Endpoint:** `GET /api/workmanagement/kpi/export/estimate/:chuKyId`

**Description:** Ước tính kích thước file export (tránh timeout)

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "estimatedRows": 52,
    "estimatedSizeKB": 245,
    "estimatedDurationSeconds": 3,
    "recommendation": "safe" // safe | large | very_large
  },
  "message": "Ước tính kích thước thành công"
}
```

### 10.7 Export to CSV

**Endpoint:** `GET /api/workmanagement/kpi/export/csv/:chuKyId`

**Description:** Export báo cáo KPI ra CSV (lighter alternative to Excel)

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```
Content-Type: text/csv; charset=utf-8
Content-Disposition: attachment; filename="KPI_Quy1_2026.csv"

MaNhanVien,HoTen,PhongBan,TongDiemKPI,XepLoai,TrangThai
NV001,Nguyễn Văn A,Khoa Nội,8.5,Tốt,Đã duyệt
NV002,Trần Thị B,Khoa Ngoại,8.8,Tốt,Đã duyệt
```

---

## 11. Dashboard & Statistics APIs

### 11.1 Get Dashboard Metrics

**Endpoint:** `GET /api/workmanagement/kpi/dashboard/:chuKyId`

**Description:** Lấy dashboard metrics cho manager (đã có ở Section 6.4 - main dashboard API)

**Authentication:** Required (Manager)

**Response includes:**

- Danh sách nhân viên quản lý với điểm KPI
- Progress tracking (tasks scored/total)
- Summary statistics

### 11.2 Get Department Statistics

**Endpoint:** `GET /api/workmanagement/kpi/thong-ke/phong-ban/:phongBanId`

**Description:** Thống kê KPI theo phòng ban

**Authentication:** Required (Manager/Admin)

**Query Parameters:**

```typescript
{
  chuKyId?: ObjectId; // Optional - default: active cycle
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "phongBan": {
      "TenPhongBan": "Khoa Nội",
      "_id": "66c1111222333444555666"
    },
    "tongQuan": {
      "tongSoNhanVien": 15,
      "daDanhGia": 14,
      "diemTrungBinh": 8.5,
      "tyLeDat": 93.3
    },
    "phanBoXepLoai": {
      "xuatSac": 2,
      "tot": 8,
      "kha": 3,
      "trungBinh": 1,
      "yeu": 0
    },
    "topPerformers": [
      {
        "NhanVien": { "HoTen": "Nguyễn Văn A" },
        "TongDiemKPI": 9.2
      }
    ]
  },
  "message": "Lấy thống kê phòng ban thành công"
}
```

### 11.3 Get Employee Statistics

**Endpoint:** `GET /api/workmanagement/kpi/thong-ke/nhan-vien/:nhanVienId`

**Description:** Thống kê KPI cá nhân (overview across cycles)

**Authentication:** Required

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "nhanVien": {
      "HoTen": "Nguyễn Văn A",
      "MaNhanVien": "NV001"
    },
    "tongQuan": {
      "soChuKyThamGia": 8,
      "diemTrungBinh": 8.4,
      "diemCaoNhat": 9.2,
      "diemThapNhat": 7.8
    },
    "xuHuong": "TANG",
    "lichSuXepLoai": {
      "xuatSac": 1,
      "tot": 5,
      "kha": 2
    }
  },
  "message": "Lấy thống kê nhân viên thành công"
}
```

### 11.4 Get Trend Data

**Endpoint:** `GET /api/workmanagement/kpi/thong-ke/xu-huong`

**Description:** Dữ liệu xu hướng KPI qua các chu kỳ (for charts)

**Authentication:** Required (Manager/Admin)

**Query Parameters:**

```typescript
{
  soLuongChuKy?: number;   // Default: 6
  phongBanId?: ObjectId;   // Optional filter
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "labels": [
      "Q3/2024",
      "Q4/2024",
      "Q1/2025",
      "Q2/2025",
      "Q3/2025",
      "Q4/2025"
    ],
    "datasets": [
      {
        "label": "Điểm trung bình",
        "data": [8.1, 8.3, 8.2, 8.5, 8.4, 8.6]
      },
      {
        "label": "Tỷ lệ đạt",
        "data": [88, 90, 89, 93, 91, 94]
      }
    ]
  },
  "message": "Lấy dữ liệu xu hướng thành công"
}
```

### 11.5 Get Distribution Data

**Endpoint:** `GET /api/workmanagement/kpi/thong-ke/phan-bo/:chuKyId`

**Description:** Phân bố điểm KPI (histogram data)

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "distribution": [
      { "range": "9.0-10.0", "count": 5, "percentage": 9.6 },
      { "range": "8.0-8.9", "count": 28, "percentage": 53.8 },
      { "range": "7.0-7.9", "count": 12, "percentage": 23.1 },
      { "range": "6.0-6.9", "count": 3, "percentage": 5.8 },
      { "range": "< 6.0", "count": 0, "percentage": 0 }
    ],
    "stats": {
      "mean": 8.4,
      "median": 8.3,
      "mode": 8.5,
      "stdDev": 0.8
    }
  },
  "message": "Lấy phân bố điểm thành công"
}
```

### 11.6 Get Top Performers

**Endpoint:** `GET /api/workmanagement/kpi/thong-ke/top-performers/:chuKyId`

**Description:** Danh sách nhân viên xuất sắc

**Authentication:** Required (Manager/Admin)

**Query Parameters:**

```typescript
{
  limit?: number; // Default: 10
  phongBanId?: ObjectId;
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "NhanVien": {
        "HoTen": "Nguyễn Văn A",
        "MaNhanVien": "NV001",
        "PhongBan": { "TenPhongBan": "Khoa Nội" }
      },
      "TongDiemKPI": 9.5,
      "XepLoai": "Xuất sắc"
    },
    {
      "rank": 2,
      "NhanVien": { "HoTen": "Trần Thị B" },
      "TongDiemKPI": 9.3,
      "XepLoai": "Xuất sắc"
    }
  ],
  "message": "Lấy danh sách top performers thành công"
}
```

### 11.7 Get Improvement Areas

**Endpoint:** `GET /api/workmanagement/kpi/thong-ke/can-cai-thien/:chuKyId`

**Description:** Phân tích tiêu chí cần cải thiện (lowest scoring criteria)

**Authentication:** Required (Manager/Admin)

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "tieuChiThapNhat": [
      {
        "TenTieuChi": "Kỹ năng giao tiếp",
        "DiemTrungBinh": 7.2,
        "SoNhanVien": 15
      },
      {
        "TenTieuChi": "Sáng kiến cải tiến",
        "DiemTrungBinh": 7.5,
        "SoNhanVien": 12
      }
    ],
    "khuVuc": "Khoa Nội",
    "khuyenNghi": [
      "Tổ chức đào tạo kỹ năng giao tiếp",
      "Khuyến khích sáng kiến cải tiến quy trình"
    ]
  },
  "message": "Lấy phân tích cải thiện thành công"
}
```

---

## 12. Error Codes Reference

### HTTP Status Codes

| Code | Name                  | Description                                    |
| ---- | --------------------- | ---------------------------------------------- |
| 200  | OK                    | Request thành công                             |
| 201  | Created               | Tạo resource thành công                        |
| 204  | No Content            | Xóa thành công (no response body)              |
| 400  | Bad Request           | Request không hợp lệ (validation error)        |
| 401  | Unauthorized          | Chưa đăng nhập hoặc token hết hạn              |
| 403  | Forbidden             | Không có quyền truy cập                        |
| 404  | Not Found             | Resource không tồn tại                         |
| 409  | Conflict              | Xung đột dữ liệu (duplicate, version conflict) |
| 422  | Unprocessable Entity  | Business logic validation failed               |
| 500  | Internal Server Error | Lỗi server không xác định                      |
| 503  | Service Unavailable   | Server quá tải hoặc đang bảo trì               |

### Validation Errors (400)

| Error Code                | Message (Vietnamese)                  | Cause                                    |
| ------------------------- | ------------------------------------- | ---------------------------------------- |
| `INVALID_ChuKyDanhGiaID`  | "Chu kỳ đánh giá không hợp lệ"        | ObjectId format sai hoặc không tồn tại   |
| `INVALID_NhanVienID`      | "Nhân viên không hợp lệ"              | NhanVienID không tồn tại                 |
| `MISSING_REQUIRED_FIELDS` | "Thiếu trường bắt buộc: {field}"      | Request body thiếu field required        |
| `INVALID_DATE_RANGE`      | "Ngày kết thúc phải sau ngày bắt dầu" | NgayKetThuc <= NgayBatDau                |
| `INVALID_SCORE_VALUE`     | "Điểm phải từ 0-100"                  | DiemQuanLy or DiemTuDanhGia out of range |
| `MISSING_CRITERIA_SCORES` | "Chưa chấm điểm đầy đủ các tiêu chí"  | ChiTietDiem array thiếu tiêu chí         |
| `INVALID_TRANG_THAI`      | "Trạng thái không hợp lệ"             | TrangThai not in enum                    |
| `EMPTY_TIEU_CHI_CAU_HINH` | "Chu kỳ phải có ít nhất 1 tiêu chí"   | TieuChiCauHinh array rỗng                |
| `INVALID_MUC_DO_KHO`      | "Mức độ khó phải từ 1-5"              | MucDoKho out of range [1,2,3,4,5]        |

### Authentication Errors (401, 403)

| Error Code                    | Message (Vietnamese)                        | Cause                                     |
| ----------------------------- | ------------------------------------------- | ----------------------------------------- |
| `MISSING_TOKEN`               | "Vui lòng đăng nhập"                        | Authorization header missing              |
| `INVALID_TOKEN`               | "Token không hợp lệ"                        | JWT verification failed                   |
| `TOKEN_EXPIRED`               | "Phiên đăng nhập đã hết hạn"                | JWT expired                               |
| `INSUFFICIENT_PERMISSIONS`    | "Bạn không có quyền thực hiện thao tác này" | Role check failed (validateQuanLy)        |
| `NOT_AUTHORIZED_FOR_EMPLOYEE` | "Bạn không có quyền quản lý nhân viên này"  | Manager trying to access other dept staff |

### Resource Errors (404)

| Error Code               | Message (Vietnamese)                      | Cause                                  |
| ------------------------ | ----------------------------------------- | -------------------------------------- |
| `CHU_KY_NOT_FOUND`       | "Không tìm thấy chu kỳ đánh giá"          | ChuKyDanhGia.\_id not found            |
| `DANH_GIA_KPI_NOT_FOUND` | "Không tìm thấy đánh giá KPI"             | DanhGiaKPI.\_id not found              |
| `NHIEM_VU_NOT_FOUND`     | "Không tìm thấy nhiệm vụ thường quy"      | NhiemVuThuongQuy.\_id not found        |
| `NHAN_VIEN_NOT_FOUND`    | "Không tìm thấy nhân viên"                | NhanVienID not found                   |
| `NO_ACTIVE_CYCLE`        | "Không có chu kỳ đánh giá đang hoạt động" | No cycle with TrangThai = DANG_DIEN_RA |

### Business Logic Errors (409, 422)

| Error Code                | Message (Vietnamese)                             | Cause                                 |
| ------------------------- | ------------------------------------------------ | ------------------------------------- |
| `ALREADY_APPROVED`        | "Đánh giá KPI đã được duyệt"                     | Trying to edit DA_DUYET evaluation    |
| `NOT_APPROVED_YET`        | "Đánh giá KPI chưa được duyệt"                   | Trying to undo approval on CHUA_DUYET |
| `DUPLICATE_EVALUATION`    | "Nhân viên đã có đánh giá cho chu kỳ này"        | Unique index violation                |
| `CYCLE_ALREADY_ACTIVE`    | "Đã có chu kỳ đang hoạt động"                    | Multiple DANG_DIEN_RA cycles          |
| `CYCLE_NOT_STARTED`       | "Chu kỳ chưa bắt đầu"                            | TrangThai = CHUA_BAT_DAU              |
| `CYCLE_ALREADY_COMPLETED` | "Chu kỳ đã kết thúc"                             | TrangThai = DA_KET_THUC               |
| `INCOMPLETE_SCORES`       | "Chưa chấm điểm đầy đủ nhiệm vụ"                 | Some NhiemVu missing ChiTietDiem      |
| `VERSION_CONFLICT`        | "Dữ liệu đã được cập nhật bởi người khác"        | Optimistic locking failed (updatedAt) |
| `CANNOT_DELETE_APPROVED`  | "Không thể xóa đánh giá đã duyệt"                | Soft delete protection                |
| `INVALID_APPROVAL_BATCH`  | "Chỉ duyệt được đánh giá ở trạng thái chờ duyệt" | Batch approve with mixed TrangThai    |

### Calculation Errors (422)

| Error Code                  | Message (Vietnamese)                      | Cause                                     |
| --------------------------- | ----------------------------------------- | ----------------------------------------- |
| `MISSING_TIEU_CHI_CAU_HINH` | "Chu kỳ chưa cấu hình tiêu chí"           | ChuKy.TieuChiCauHinh empty                |
| `TIEU_CHI_MISMATCH`         | "Tiêu chí không khớp với cấu hình chu kỳ" | ChiTietDiem has unknown criteria          |
| `INVALID_CALCULATION`       | "Không thể tính điểm KPI"                 | Math error in score calculation           |
| `MISSING_SELF_ASSESSMENT`   | "Nhân viên chưa tự đánh giá"              | NhanVienNhiemVu.DiemTuDanhGia null        |
| `MISSING_MANAGER_SCORE`     | "Chưa có điểm quản lý"                    | DanhGiaNhiemVu.ChiTietDiem missing DiemQL |

### Server Errors (500)

| Error Code              | Message (Vietnamese)          | Cause                        |
| ----------------------- | ----------------------------- | ---------------------------- |
| `DATABASE_ERROR`        | "Lỗi kết nối cơ sở dữ liệu"   | MongoDB connection failed    |
| `TRANSACTION_FAILED`    | "Giao dịch thất bại"          | MongoDB transaction rollback |
| `EXPORT_FAILED`         | "Không thể tạo file export"   | Excel/PDF generation error   |
| `NOTIFICATION_FAILED`   | "Không thể gửi thông báo"     | Notification system error    |
| `INTERNAL_SERVER_ERROR` | "Lỗi hệ thống không xác định" | Unhandled exception          |

### Error Response Format

```json
{
  "success": false,
  "message": "Vietnamese error message",
  "errors": {
    "code": "ERROR_CODE_CONSTANT",
    "field": "fieldName",
    "details": "Additional context"
  }
}
```

**Example Error Responses:**

1. **Validation Error (400):**

```json
{
  "success": false,
  "message": "Điểm phải từ 0-100",
  "errors": {
    "code": "INVALID_SCORE_VALUE",
    "field": "ChiTietDiem[0].DiemQuanLy",
    "value": 120
  }
}
```

2. **Authorization Error (403):**

```json
{
  "success": false,
  "message": "Bạn không có quyền thực hiện thao tác này",
  "errors": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "required": "manager",
    "current": "user"
  }
}
```

3. **Business Logic Error (422):**

```json
{
  "success": false,
  "message": "Đánh giá KPI đã được duyệt",
  "errors": {
    "code": "ALREADY_APPROVED",
    "danhGiaKPIId": "67890abcdef1234567890abc",
    "TrangThai": "DA_DUYET",
    "NgayDuyet": "2026-01-05T15:30:00.000Z"
  }
}
```

---

## Best Practices

### 1. Authentication

- Always include `Authorization: Bearer <token>` header
- Refresh token before expiry (check `exp` claim)
- Handle 401 errors by redirecting to login

### 2. Pagination

- Use `page` and `limit` query params for list endpoints
- Default limit: 20 items
- Check `totalPages` and `count` in response

### 3. Error Handling

- Check `success` field first
- Display `message` to user (Vietnamese)
- Log `errors.code` for debugging

### 4. Optimistic Updates

- Send `If-Unmodified-Since` header for concurrent edit protection
- Handle `VERSION_CONFLICT` (409) by refetching data

### 5. Performance

- Use batch endpoints for bulk operations
- Estimate export size before downloading large files
- Filter by department/cycle to reduce payload

### 6. Caching

- Cache active cycle data (invalidate on cycle change)
- Cache employee list (invalidate on department change)
- Cache criteria configurations per cycle

---

## Changelog

**Version 2.1.1 (Current)**

- ✅ Criteria-based KPI evaluation system
- ✅ Batch approve/undo approval
- ✅ Real-time preview calculation
- ✅ Dashboard metrics with progress tracking
- ✅ Enhanced error codes with Vietnamese messages

**Version 2.0.0**

- Initial criteria-based KPI system
- TieuChiCauHinh in ChuKyDanhGia
- Removed TongDiemTieuChi from DB (calculate on-demand)

**Version 1.x (Legacy)**

- Basic KPI evaluation without criteria
- Fixed scoring formula

---

## 📚 Related Documents

- [00_OVERVIEW.md](./00_OVERVIEW.md) - System architecture
- [01_EVALUATION_CYCLE.md](./01_EVALUATION_CYCLE.md) - Cycle management
- [03_CALCULATION_FORMULAS.md](./03_CALCULATION_FORMULAS.md) - Score calculation
- [04_APPROVAL_WORKFLOW.md](./04_APPROVAL_WORKFLOW.md) - Approval process
- [06_SELF_ASSESSMENT.md](./06_SELF_ASSESSMENT.md) - Self-assessment flow
- [07_BATCH_OPERATIONS.md](./07_BATCH_OPERATIONS.md) - Batch operations
- [08_REPORTS_EXPORT.md](./08_REPORTS_EXPORT.md) - Export functionality

---

**End of KPI API Reference**
