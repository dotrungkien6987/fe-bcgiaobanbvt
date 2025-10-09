# API Specification - Hệ thống Đánh giá KPI

**Phiên bản:** 2.0  
**Base URL:** `/api/workmanagement/kpi`  
**Authentication:** Required (Bearer Token)

---

## 📋 Mục lục

1. [Endpoints Overview](#endpoints-overview)
2. [Authentication](#authentication)
3. [Common Responses](#common-responses)
4. [API Details](#api-details)
5. [Error Codes](#error-codes)

---

## Endpoints Overview

| Method | Endpoint                      | Description                    | Auth | Role          |
| ------ | ----------------------------- | ------------------------------ | ---- | ------------- |
| POST   | `/`                           | Tạo đánh giá KPI mới           | ✅   | Manager/Admin |
| GET    | `/chu-ky/:chuKyId`            | Danh sách đánh giá theo chu kỳ | ✅   | All           |
| GET    | `/:danhGiaKPIId`              | Chi tiết đánh giá              | ✅   | All           |
| PUT    | `/nhiem-vu/:danhGiaNhiemVuId` | Chấm điểm nhiệm vụ             | ✅   | Owner         |
| PUT    | `/:danhGiaKPIId/duyet`        | Duyệt đánh giá                 | ✅   | Owner         |
| PUT    | `/:danhGiaKPIId/huy-duyet`    | Hủy duyệt                      | ✅   | Owner/Admin   |
| DELETE | `/:danhGiaKPIId`              | Xóa đánh giá                   | ✅   | Owner/Admin   |
| GET    | `/chu-ky/:chuKyId/top`        | Top nhân viên                  | ✅   | All           |
| GET    | `/nhan-vien/:nhanVienId`      | Lịch sử KPI nhân viên          | ✅   | Owner/Manager |

---

## Authentication

### Header Required

```http
Authorization: Bearer <JWT_TOKEN>
```

### Permission Check

```javascript
// Người đánh giá phải có trong QuanLyNhanVien
QuanLyNhanVien {
  NhanVienQuanLy: req.user.NhanVienID,
  NhanVienDuocQuanLy: targetNhanVienID,
  LoaiQuanLy: "KPI",
  isDeleted: false
}

// Exception: Admin có full quyền
```

---

## Common Responses

### Success Response

```javascript
{
  "success": true,
  "data": {
    // Response data
  },
  "errors": null,
  "message": "Success message"
}
```

### Error Response

```javascript
{
  "success": false,
  "data": null,
  "errors": "Error message",
  "message": "Operation failed"
}
```

### Pagination Response

```javascript
{
  "success": true,
  "data": {
    "danhSach": [...],
    "totalPages": 5,
    "count": 100
  },
  "message": "..."
}
```

---

## API Details

### 1. Tạo đánh giá KPI mới

**Endpoint:** `POST /api/workmanagement/kpi`

**Request Body:**

```javascript
{
  "ChuKyID": "507f1f77bcf86cd799439011",
  "NhanVienID": "507f1f77bcf86cd799439012"
}
```

**Response:** `201 Created`

```javascript
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "507f1f77bcf86cd799439013",
      "ChuKyID": {
        "_id": "507f1f77bcf86cd799439011",
        "TenChuKy": "KPI Tháng 10/2025",
        "NgayBatDau": "2025-10-01",
        "NgayKetThuc": "2025-10-31"
      },
      "NhanVienID": {
        "_id": "507f1f77bcf86cd799439012",
        "HoTen": "Nguyễn Văn A",
        "MaNhanVien": "NV001"
      },
      "NguoiDanhGiaID": {
        "_id": "507f1f77bcf86cd799439014",
        "HoTen": "Trần Thị B",
        "UserName": "tranthib"
      },
      "TongDiemKPI": 0,
      "TrangThai": "CHUA_DUYET",
      "createdAt": "2025-10-06T10:00:00Z"
    },
    "danhGiaNhiemVu": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "DanhGiaKPIID": "507f1f77bcf86cd799439013",
        "NhiemVuThuongQuyID": {
          "_id": "507f1f77bcf86cd799439016",
          "TenNhiemVu": "Quản lý hạ tầng mạng",
          "MucDoKho": 5
        },
        "MucDoKho": 5,
        "ChiTietDiem": [],
        "TongDiemTieuChi": 0,
        "DiemNhiemVu": 0,
        "SoCongViecLienQuan": 12
      },
      {
        "_id": "507f1f77bcf86cd799439017",
        "NhiemVuThuongQuyID": {
          "TenNhiemVu": "Bảo mật hệ thống",
          "MucDoKho": 3
        },
        "MucDoKho": 3,
        "SoCongViecLienQuan": 8
      }
    ]
  },
  "message": "Tạo đánh giá KPI thành công"
}
```

**Error Cases:**

- `400` - Chu kỳ không tồn tại hoặc đã đóng
- `400` - Nhân viên đã có đánh giá trong chu kỳ này
- `400` - Nhân viên chưa có nhiệm vụ thường quy
- `403` - Không có quyền đánh giá nhân viên này

---

### 2. Lấy danh sách đánh giá theo chu kỳ

**Endpoint:** `GET /api/workmanagement/kpi/chu-ky/:chuKyId`

**Query Parameters:**

```javascript
{
  "page": 1,          // Trang hiện tại (default: 1)
  "limit": 20,        // Số items/trang (default: 20)
  "trangThai": "DA_DUYET" // Filter: CHUA_DUYET | DA_DUYET
}
```

**Example:** `GET /api/workmanagement/kpi/chu-ky/507f1f77bcf86cd799439011?page=1&limit=20&trangThai=DA_DUYET`

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": {
    "danhSach": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "NhanVienID": {
          "HoTen": "Nguyễn Văn A",
          "MaNhanVien": "NV001"
        },
        "NguoiDanhGiaID": {
          "HoTen": "Trần Thị B",
          "UserName": "tranthib"
        },
        "ChuKyID": {
          "TenChuKy": "KPI Tháng 10/2025"
        },
        "TongDiemKPI": 9.045,
        "TrangThai": "DA_DUYET",
        "NgayDuyet": "2025-10-06T15:00:00Z",
        "createdAt": "2025-10-06T10:00:00Z"
      }
    ],
    "totalPages": 5,
    "count": 100
  },
  "message": "Lấy danh sách đánh giá KPI thành công"
}
```

---

### 3. Lấy chi tiết đánh giá KPI

**Endpoint:** `GET /api/workmanagement/kpi/:danhGiaKPIId`

**Example:** `GET /api/workmanagement/kpi/507f1f77bcf86cd799439013`

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "507f1f77bcf86cd799439013",
      "ChuKyID": {
        "TenChuKy": "KPI Tháng 10/2025",
        "NgayBatDau": "2025-10-01",
        "NgayKetThuc": "2025-10-31"
      },
      "NhanVienID": {
        "HoTen": "Nguyễn Văn A",
        "MaNhanVien": "NV001"
      },
      "NguoiDanhGiaID": {
        "HoTen": "Trần Thị B"
      },
      "TongDiemKPI": 9.045,
      "TrangThai": "DA_DUYET",
      "NhanXetNguoiDanhGia": "Nhân viên làm việc rất tốt, hoàn thành tốt nhiệm vụ",
      "PhanHoiNhanVien": null,
      "NgayDuyet": "2025-10-06T15:00:00Z"
    },
    "danhGiaNhiemVu": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "NhiemVuThuongQuyID": {
          "TenNhiemVu": "Quản lý hạ tầng mạng",
          "MoTa": "...",
          "MucDoKho": 5
        },
        "MucDoKho": 5,
        "ChiTietDiem": [
          {
            "TieuChiID": {
              "TenTieuChi": "Mức độ hoàn thành",
              "LoaiTieuChi": "TANG_DIEM",
              "GiaTriMin": 0,
              "GiaTriMax": 100
            },
            "DiemDat": 85,
            "TrongSo": 1.0,
            "LoaiTieuChi": "TANG_DIEM"
          },
          {
            "TieuChiID": {
              "TenTieuChi": "Điểm tích cực"
            },
            "DiemDat": 3,
            "TrongSo": 1.0,
            "LoaiTieuChi": "TANG_DIEM"
          },
          {
            "TieuChiID": {
              "TenTieuChi": "Điểm trừ quá hạn"
            },
            "DiemDat": 2,
            "TrongSo": 1.0,
            "LoaiTieuChi": "GIAM_DIEM"
          }
        ],
        "TongDiemTieuChi": 86,
        "DiemNhiemVu": 4.3,
        "SoCongViecLienQuan": 12,
        "GhiChu": "Hoàn thành tốt"
      },
      {
        "_id": "507f1f77bcf86cd799439017",
        "NhiemVuThuongQuyID": {
          "TenNhiemVu": "Bảo mật hệ thống"
        },
        "MucDoKho": 3,
        "TongDiemTieuChi": 95,
        "DiemNhiemVu": 2.85,
        "SoCongViecLienQuan": 8
      }
    ]
  },
  "message": "Lấy chi tiết đánh giá KPI thành công"
}
```

**Error Cases:**

- `404` - Không tìm thấy đánh giá KPI

---

### 4. Chấm điểm nhiệm vụ thường quy

**Endpoint:** `PUT /api/workmanagement/kpi/nhiem-vu/:danhGiaNhiemVuId`

**Request Body:**

```javascript
{
  "ChiTietDiem": [
    {
      "TieuChiID": "507f1f77bcf86cd799439020",
      "DiemDat": 85,
      "TrongSo": 1.0
    },
    {
      "TieuChiID": "507f1f77bcf86cd799439021",
      "DiemDat": 3,
      "TrongSo": 1.0
    },
    {
      "TieuChiID": "507f1f77bcf86cd799439022",
      "DiemDat": 2,
      "TrongSo": 1.0
    }
  ],
  "MucDoKho": 5,  // Optional: Điều chỉnh mức độ khó
  "GhiChu": "Nhân viên hoàn thành tốt nhiệm vụ"
}
```

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": {
    "danhGiaNhiemVu": {
      "_id": "507f1f77bcf86cd799439015",
      "ChiTietDiem": [
        {
          "TieuChiID": "507f1f77bcf86cd799439020",
          "TenTieuChi": "Mức độ hoàn thành",
          "LoaiTieuChi": "TANG_DIEM",
          "DiemDat": 85,
          "TrongSo": 1.0
        },
        {
          "TieuChiID": "507f1f77bcf86cd799439021",
          "TenTieuChi": "Điểm tích cực",
          "LoaiTieuChi": "TANG_DIEM",
          "DiemDat": 3,
          "TrongSo": 1.0
        },
        {
          "TieuChiID": "507f1f77bcf86cd799439022",
          "TenTieuChi": "Điểm trừ quá hạn",
          "LoaiTieuChi": "GIAM_DIEM",
          "DiemDat": 2,
          "TrongSo": 1.0
        }
      ],
      "MucDoKho": 5,
      "TongDiemTieuChi": 86,   // Auto-calculated
      "DiemNhiemVu": 4.3,       // Auto-calculated
      "GhiChu": "Nhân viên hoàn thành tốt nhiệm vụ"
    },
    "tongDiemKPI": 9.045        // Tổng KPI đã update
  },
  "message": "Chấm điểm nhiệm vụ thành công"
}
```

**Validation:**

- `DiemDat` phải nằm trong `[TieuChiDanhGia.GiaTriMin, TieuChiDanhGia.GiaTriMax]`
- `MucDoKho` phải từ 1-10
- `TrongSo` phải >= 0

**Error Cases:**

- `400` - Điểm không hợp lệ (vượt quá giới hạn)
- `400` - Không thể sửa đánh giá đã duyệt
- `403` - Không có quyền chấm điểm
- `404` - Không tìm thấy đánh giá nhiệm vụ

---

### 5. Duyệt đánh giá KPI

**Endpoint:** `PUT /api/workmanagement/kpi/:danhGiaKPIId/duyet`

**Request Body:**

```javascript
{
  "NhanXetNguoiDanhGia": "Nhân viên làm việc rất tốt, hoàn thành xuất sắc nhiệm vụ. Cần phát huy hơn nữa."
}
```

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "507f1f77bcf86cd799439013",
      "TrangThai": "DA_DUYET",
      "NhanXetNguoiDanhGia": "Nhân viên làm việc rất tốt...",
      "NgayDuyet": "2025-10-06T15:30:00Z",
      "TongDiemKPI": 9.045
    }
  },
  "message": "Duyệt đánh giá KPI thành công"
}
```

**Business Rules:**

- Chỉ người tạo (`NguoiDanhGiaID`) mới duyệt được
- Chỉ duyệt được khi `TrangThai = "CHUA_DUYET"`
- Sau khi duyệt, không thể sửa điểm

**Error Cases:**

- `400` - Đánh giá đã được duyệt
- `403` - Không có quyền duyệt
- `404` - Không tìm thấy đánh giá

---

### 6. Hủy duyệt đánh giá

**Endpoint:** `PUT /api/workmanagement/kpi/:danhGiaKPIId/huy-duyet`

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": {
    "danhGiaKPI": {
      "_id": "507f1f77bcf86cd799439013",
      "TrangThai": "CHUA_DUYET",
      "NgayDuyet": null
    }
  },
  "message": "Hủy duyệt đánh giá KPI thành công"
}
```

**Business Rules:**

- Người tạo hoặc Admin có quyền hủy duyệt
- Sau khi hủy, có thể sửa điểm lại

**Error Cases:**

- `403` - Không có quyền hủy duyệt
- `404` - Không tìm thấy đánh giá

---

### 7. Xóa đánh giá KPI

**Endpoint:** `DELETE /api/workmanagement/kpi/:danhGiaKPIId`

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": null,
  "message": "Xóa đánh giá KPI thành công"
}
```

**Business Rules:**

- Soft delete (set `isDeleted = true`)
- Chỉ xóa được khi `TrangThai = "CHUA_DUYET"`
- Cascade delete các `DanhGiaNhiemVuThuongQuy` con

**Error Cases:**

- `400` - Không thể xóa đánh giá đã duyệt
- `403` - Không có quyền xóa
- `404` - Không tìm thấy đánh giá

---

### 8. Top nhân viên xuất sắc

**Endpoint:** `GET /api/workmanagement/kpi/chu-ky/:chuKyId/top`

**Query Parameters:**

```javascript
{
  "limit": 10  // Số lượng top (default: 10)
}
```

**Example:** `GET /api/workmanagement/kpi/chu-ky/507f1f77bcf86cd799439011/top?limit=10`

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": {
    "topNhanVien": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "NhanVienID": {
          "HoTen": "Nguyễn Văn A",
          "MaNhanVien": "NV001"
        },
        "TongDiemKPI": 9.5,
        "TrangThai": "DA_DUYET"
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "NhanVienID": {
          "HoTen": "Trần Thị B",
          "MaNhanVien": "NV002"
        },
        "TongDiemKPI": 9.2,
        "TrangThai": "DA_DUYET"
      }
    ]
  },
  "message": "Lấy top nhân viên thành công"
}
```

**Business Rules:**

- Chỉ lấy đánh giá `TrangThai = "DA_DUYET"`
- Sort theo `TongDiemKPI` giảm dần

---

### 9. Lịch sử KPI của nhân viên

**Endpoint:** `GET /api/workmanagement/kpi/nhan-vien/:nhanVienId`

**Example:** `GET /api/workmanagement/kpi/nhan-vien/507f1f77bcf86cd799439012`

**Response:** `200 OK`

```javascript
{
  "success": true,
  "data": {
    "danhSach": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "ChuKyID": {
          "TenChuKy": "KPI Tháng 10/2025",
          "NgayBatDau": "2025-10-01",
          "NgayKetThuc": "2025-10-31"
        },
        "TongDiemKPI": 9.045,
        "TrangThai": "DA_DUYET",
        "NgayDuyet": "2025-10-06T15:00:00Z"
      },
      {
        "_id": "507f1f77bcf86cd799439014",
        "ChuKyID": {
          "TenChuKy": "KPI Tháng 9/2025"
        },
        "TongDiemKPI": 8.5,
        "TrangThai": "DA_DUYET"
      }
    ],
    "count": 2
  },
  "message": "Lấy lịch sử KPI thành công"
}
```

**Permission:**

- Nhân viên chỉ xem được KPI của mình
- Manager xem được KPI của nhân viên dưới quyền
- Admin xem được tất cả

---

## Error Codes

| Code    | Message               | Description             |
| ------- | --------------------- | ----------------------- |
| **400** | Bad Request           | Dữ liệu không hợp lệ    |
| **401** | Unauthorized          | Chưa đăng nhập          |
| **403** | Forbidden             | Không có quyền          |
| **404** | Not Found             | Không tìm thấy resource |
| **409** | Conflict              | Dữ liệu bị trùng lặp    |
| **500** | Internal Server Error | Lỗi server              |

### Specific Error Messages

```javascript
// 400 Errors
{
  "CYCLE_NOT_FOUND": "Chu kỳ đánh giá không tồn tại",
  "CYCLE_CLOSED": "Chu kỳ đã đóng, không thể chấm KPI",
  "ALREADY_EXISTS": "Nhân viên đã có đánh giá KPI trong chu kỳ này",
  "NO_NVTQ": "Nhân viên chưa được gán nhiệm vụ thường quy nào",
  "ALREADY_APPROVED": "Đánh giá đã được duyệt",
  "CANNOT_DELETE_APPROVED": "Không thể xóa đánh giá đã duyệt",
  "INVALID_SCORE": "Điểm {tieuChi} phải từ {min} đến {max}",
  "INVALID_MUC_DO_KHO": "Mức độ khó phải từ 1-10"
}

// 403 Errors
{
  "PERMISSION_DENIED": "Bạn không có quyền thực hiện thao tác này",
  "NOT_OWNER": "Chỉ người tạo đánh giá mới có quyền duyệt",
  "NOT_MANAGER": "Bạn không phải là người quản lý KPI của nhân viên này"
}

// 404 Errors
{
  "KPI_NOT_FOUND": "Không tìm thấy đánh giá KPI",
  "NVTQ_NOT_FOUND": "Không tìm thấy đánh giá nhiệm vụ"
}
```

---

## Webhooks (Future)

### Sự kiện KPI

```javascript
// POST to webhook URL
{
  "event": "kpi.created",
  "data": {
    "danhGiaKPIId": "...",
    "nhanVienId": "...",
    "chuKyId": "..."
  },
  "timestamp": "2025-10-06T10:00:00Z"
}

// Events:
"kpi.created"      // Tạo mới đánh giá
"kpi.approved"     // Đã duyệt
"kpi.unapproved"   // Hủy duyệt
"kpi.deleted"      // Đã xóa
"kpi.scored"       // Đã chấm điểm nhiệm vụ
```

---

## Rate Limiting

```javascript
// Per endpoint
{
  "GET": 100 requests/minute,
  "POST/PUT/DELETE": 30 requests/minute
}
```

---

## Versioning

```
Current: v1 (default)
Base URL: /api/workmanagement/kpi (= /api/v1/workmanagement/kpi)

Future: /api/v2/workmanagement/kpi
```

---

**Tài liệu liên quan:**

- [`KPI_BUSINESS_LOGIC.md`](./KPI_BUSINESS_LOGIC.md) - Business rules
- [`KPI_FORMULA.md`](./KPI_FORMULA.md) - Công thức tính điểm

**Last Updated:** October 6, 2025
