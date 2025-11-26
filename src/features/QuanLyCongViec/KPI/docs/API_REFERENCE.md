# API Reference - KPI Module

**Base URL:** `/api/workmanagement/kpi`  
**Version:** 2.1  
**Backend File:** `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js` (3040 dòng)

---

## 📋 Tổng quan API

### Categories

| Category      | Endpoints | Description                             |
| ------------- | --------- | --------------------------------------- |
| **CRUD**      | 7         | Create, Read, Update, Delete DanhGiaKPI |
| **Scoring**   | 5         | Chấm điểm nhiệm vụ, tiêu chí            |
| **Approval**  | 4         | Duyệt KPI, hủy duyệt                    |
| **Dashboard** | 3         | Thống kê tổng quan, dashboard           |
| **Reports**   | 3         | Báo cáo chi tiết, export Excel          |
| **Utilities** | 7         | Reset, sync, preview, helpers           |

**Total:** 29 API endpoints

---

## 🔐 Authentication

Tất cả API yêu cầu JWT token trong header:

```bash
Authorization: Bearer <token>
```

**User Object (từ JWT):**

```javascript
{
  _id: "userId",
  NhanVienID: "nhanVienId",  // ← Dùng cho permission checks
  PhanQuyen: "manager",       // admin | manager | user
  KhoaID: "departmentId"
}
```

---

## 📚 Category 1: CRUD Operations

### 1.1 GET /kpi - Lấy danh sách KPI

**Method:** `GET`  
**Permission:** Manager (xem nhân viên được quản lý) hoặc Admin (xem tất cả)

**Query Parameters:**

```javascript
{
  chuKyId?: string,          // Filter theo chu kỳ
  nhanVienId?: string,       // Filter theo nhân viên
  trangThai?: string,        // "CHUA_DUYET" | "DA_DUYET"
  phongBan?: string,         // Filter theo phòng ban
  page?: number,             // Pagination (default: 1)
  limit?: number             // Items per page (default: 10)
}
```

**Example Request:**

```bash
GET /api/workmanagement/kpi?chuKyId=67895b9a6f7b8c2d4e3f1a0b&trangThai=DA_DUYET&page=1&limit=20
Authorization: Bearer <token>
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    danhGiaKPIs: [
      {
        _id: "67890abc...",
        ChuKyDanhGiaID: {
          _id: "67895b9a...",
          TenChuKy: "Quý 4/2025"
        },
        NhanVienID: {
          _id: "66b1dba7...",
          HoTen: "Nguyễn Văn A",
          MaNhanVien: "NV001",
          Email: "nva@example.com"
        },
        TongDiemKPI: 8.75,
        TrangThai: "DA_DUYET",
        NgayDuyet: "2025-12-15T10:30:00Z",
        NguoiDanhGiaID: {
          HoTen: "Manager X"
        },
        createdAt: "2025-11-01T08:00:00Z",
        updatedAt: "2025-12-15T10:30:00Z"
      }
    ],
    pagination: {
      total: 45,
      page: 1,
      limit: 20,
      totalPages: 3
    }
  },
  message: "Lấy danh sách thành công"
}
```

---

### 1.2 GET /kpi/:id - Lấy chi tiết KPI

**Method:** `GET`  
**Permission:** Manager (nhân viên được quản lý) hoặc Admin hoặc Nhân viên (xem KPI của mình)

**Path Parameters:**

- `id`: DanhGiaKPI.\_id

**Example Request:**

```bash
GET /api/workmanagement/kpi/67890abc123def456
Authorization: Bearer <token>
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    danhGiaKPI: {
      _id: "67890abc123def456",
      ChuKyDanhGiaID: { ... },
      NhanVienID: { ... },
      TongDiemKPI: 8.75,
      TrangThai: "DA_DUYET",
      NgayDuyet: "2025-12-15T10:30:00Z",
      LichSuDuyet: [
        {
          NguoiDuyet: { HoTen: "Manager X" },
          NgayDuyet: "2025-12-15T10:30:00Z",
          TongDiemLucDuyet: 8.75,
          GhiChu: "Hoàn thành tốt"
        }
      ],
      LichSuHuyDuyet: []
    },
    nhiemVuList: [
      {
        _id: "678abc...",
        NhiemVuThuongQuyID: {
          _id: "66b0ea40...",
          TenNhiemVu: "Quản lý hạ tầng mạng",
          MoTa: "Đảm bảo hệ thống mạng hoạt động 24/7"
        },
        MucDoKho: 7.5,
        ChiTietDiem: [
          {
            TenTieuChi: "Mức độ hoàn thành",
            LoaiTieuChi: "TANG_DIEM",
            IsMucDoHoanThanh: true,
            DiemDat: 90,
            GiaTriMax: 100,
            DonVi: "%"
          },
          {
            TenTieuChi: "Điểm tích cực",
            LoaiTieuChi: "TANG_DIEM",
            IsMucDoHoanThanh: false,
            DiemDat: 3,
            GiaTriMax: 10,
            DonVi: "điểm"
          }
        ]
      }
    ]
  },
  message: "Lấy chi tiết thành công"
}
```

---

### 1.3 POST /kpi - Tạo KPI mới (Manual)

**Method:** `POST`  
**Permission:** Manager  
**Note:** Thường không dùng API này trực tiếp, vì DanhGiaKPI được auto-create khi vào dialog chấm điểm

**Request Body:**

```javascript
{
  ChuKyDanhGiaID: "67895b9a6f7b8c2d4e3f1a0b",
  NhanVienID: "66b1dba74f79822a4752d90d",
  NguoiDanhGiaID: "currentManagerId"  // Optional, auto-fill từ JWT
}
```

**Response (201 Created):**

```javascript
{
  success: true,
  data: {
    danhGiaKPI: {
      _id: "67890new...",
      ChuKyDanhGiaID: "67895b9a...",
      NhanVienID: "66b1dba7...",
      TongDiemKPI: 0,
      TrangThai: "CHUA_DUYET",
      createdAt: "2025-11-25T14:00:00Z"
    }
  },
  message: "Tạo đánh giá KPI thành công"
}
```

---

### 1.4 PUT /kpi/:id - Cập nhật KPI

**Method:** `PUT`  
**Permission:** Manager (người tạo) hoặc Admin  
**Note:** Chỉ update được khi TrangThai = "CHUA_DUYET"

**Path Parameters:**

- `id`: DanhGiaKPI.\_id

**Request Body:**

```javascript
{
  NguoiDanhGiaID?: "newManagerId",  // Đổi người đánh giá
  GhiChu?: "Cần review lại"
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    danhGiaKPI: { ... }
  },
  message: "Cập nhật thành công"
}
```

**Error (400 Bad Request):**

```javascript
{
  success: false,
  message: "KPI đã được duyệt, không thể chỉnh sửa"
}
```

---

### 1.5 DELETE /kpi/:id - Xóa KPI (Soft Delete)

**Method:** `DELETE`  
**Permission:** Admin only

**Path Parameters:**

- `id`: DanhGiaKPI.\_id

**Example Request:**

```bash
DELETE /api/workmanagement/kpi/67890abc123def456
Authorization: Bearer <admin_token>
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: null,
  message: "Xóa đánh giá KPI thành công"
}
```

**Note:** Soft delete: `isDeleted: true`, không xóa vật lý

---

### 1.6 GET /kpi/nhan-vien/:nhanVienId/nhiem-vu - Lấy nhiệm vụ của nhân viên

**Method:** `GET`  
**Permission:** Nhân viên (xem của mình) hoặc Manager (xem nhân viên quản lý)

**Path Parameters:**

- `nhanVienId`: NhanVien.\_id

**Query Parameters:**

```javascript
{
  chuKyId?: string  // Filter theo chu kỳ
}
```

**Example Request:**

```bash
GET /api/workmanagement/kpi/nhan-vien/66b1dba74f79822a4752d90d/nhiem-vu?chuKyId=67895b9a6f7b8c2d4e3f1a0b
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    assignments: [
      {
        _id: "678assign1...",
        NhiemVuThuongQuyID: {
          TenNhiemVu: "Quản lý hạ tầng mạng",
          MoTa: "..."
        },
        MucDoKho: 7.5,
        DiemTuDanhGia: 85,  // Nhân viên đã tự chấm
        NgayTuCham: "2025-12-10T09:00:00Z"
      },
      {
        _id: "678assign2...",
        NhiemVuThuongQuyID: {
          TenNhiemVu: "Hỗ trợ người dùng",
          MoTa: "..."
        },
        MucDoKho: 5.0,
        DiemTuDanhGia: null,  // Chưa tự chấm
        NgayTuCham: null
      }
    ]
  },
  message: "Lấy danh sách nhiệm vụ thành công"
}
```

---

### ~~1.7 GET /kpi/check-exist - Kiểm tra KPI đã tồn tại~~

> ⚠️ **DEPRECATED/NOT IMPLEMENTED**: Endpoint này được thiết kế nhưng CHƯA được implement trong backend routes. Sử dụng `GET /kpi?nhanVienId=...&chuKyId=...` thay thế để kiểm tra KPI tồn tại.

---

## 🎯 Category 2: Scoring Operations

### 2.1 PUT /danh-gia-nhiem-vu/:id - Cập nhật điểm nhiệm vụ (Manager chấm)

**Method:** `PUT`  
**Permission:** Manager

**Path Parameters:**

- `id`: DanhGiaNhiemVuThuongQuy.\_id

**Request Body:**

```javascript
{
  ChiTietDiem: [
    {
      TenTieuChi: "Mức độ hoàn thành",
      LoaiTieuChi: "TANG_DIEM",
      IsMucDoHoanThanh: true,
      DiemDat: 90, // ← Manager chấm
      GiaTriMax: 100,
      DonVi: "%",
      GhiChu: "Hoàn thành tốt",
    },
    {
      TenTieuChi: "Điểm tích cực",
      LoaiTieuChi: "TANG_DIEM",
      IsMucDoHoanThanh: false,
      DiemDat: 3,
      GiaTriMax: 10,
      DonVi: "điểm",
      GhiChu: "Có sáng kiến",
    },
  ];
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    danhGiaNhiemVu: {
      _id: "678abc...",
      ChiTietDiem: [ ... ],
      updatedAt: "2025-12-15T10:00:00Z"
    }
  },
  message: "Cập nhật điểm thành công"
}
```

---

### 2.2 POST /nhan-vien/:nhanVienId/danh-gia - Nhân viên tự chấm batch

**Method:** `POST`  
**Permission:** Nhân viên (tự chấm) hoặc Manager

**Path Parameters:**

- `nhanVienId`: NhanVien.\_id

**Request Body:**

```javascript
{
  chuKyId: "67895b9a6f7b8c2d4e3f1a0b",
  evaluations: [
    {
      assignmentId: "678assign1...",
      DiemTuDanhGia: 85
    },
    {
      assignmentId: "678assign2...",
      DiemTuDanhGia: 90
    }
  ]
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    updated: [
      {
        _id: "678assign1...",
        DiemTuDanhGia: 85,
        NgayTuCham: "2025-12-15T10:05:00Z"
      },
      {
        _id: "678assign2...",
        DiemTuDanhGia: 90,
        NgayTuCham: "2025-12-15T10:05:00Z"
      }
    ]
  },
  message: "Lưu tự đánh giá thành công"
}
```

---

### 2.3 PUT /danh-gia-nhiem-vu/:assignmentId/nhan-vien-cham-diem - Tự chấm đơn lẻ

**Method:** `PUT`  
**Permission:** Nhân viên (tự chấm)

**Path Parameters:**

- `assignmentId`: NhanVienNhiemVu.\_id

**Request Body:**

```javascript
{
  diemTuDanhGia: 85; // 0-100
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    assignment: {
      _id: "678assign1...",
      DiemTuDanhGia: 85,
      NgayTuCham: "2025-12-15T10:10:00Z"
    }
  },
  message: "Cập nhật điểm tự đánh giá thành công"
}
```

**Validation:**

- DiemTuDanhGia phải từ 0-100
- Chỉ update được khi KPI chưa duyệt

---

### 2.4 POST /luu-tat-ca/:danhGiaKPIId - Lưu tất cả nhiệm vụ (Manager)

**Method:** `POST`  
**Permission:** Manager

**Path Parameters:**

- `danhGiaKPIId`: DanhGiaKPI.\_id

**Request Body:**

```javascript
{
  nhiemVuList: [
    {
      _id: "678nv1...",
      ChiTietDiem: [
        { TenTieuChi: "...", DiemDat: 90, ... },
        { TenTieuChi: "...", DiemDat: 3, ... }
      ]
    },
    {
      _id: "678nv2...",
      ChiTietDiem: [ ... ]
    }
  ]
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: null,
  message: "Lưu tất cả nhiệm vụ thành công"
}
```

**Backend (Batch Update):**

```javascript
luuTatCaNhiemVu = catchAsync(async (req, res, next) => {
  const { danhGiaKPIId } = req.params;
  const { nhiemVuList } = req.body;

  const bulkOps = nhiemVuList.map((nv) => ({
    updateOne: {
      filter: { _id: nv._id },
      update: { $set: { ChiTietDiem: nv.ChiTietDiem } },
    },
  }));

  await DanhGiaNhiemVuThuongQuy.bulkWrite(bulkOps);

  return sendResponse(res, 200, true, null, null, "Lưu thành công");
});
```

---

### 2.5 GET /cham-diem-tieu-chi - Lấy dữ liệu chấm điểm (Auto-create KPI nếu chưa có)

**Method:** `GET`  
**Permission:** Manager

**Query Parameters:**

```javascript
{
  danhGiaKPIId?: string,  // Optional: nếu có thì load từ ID
  nhanVienId?: string,    // Required nếu không có danhGiaKPIId
  chuKyId?: string        // Required nếu không có danhGiaKPIId
}
```

**Example Request:**

```bash
# Case 1: Load từ DanhGiaKPI._id
GET /api/workmanagement/kpi/cham-diem-tieu-chi?danhGiaKPIId=67890abc...

# Case 2: Auto-create nếu chưa có
GET /api/workmanagement/kpi/cham-diem-tieu-chi?nhanVienId=66b1dba7...&chuKyId=67895b9a...
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    danhGiaKPI: {
      _id: "67890abc...",
      TongDiemKPI: 0,
      TrangThai: "CHUA_DUYET"
    },
    nhiemVuList: [
      {
        _id: "678nv1...",
        NhiemVuThuongQuyID: { TenNhiemVu: "...", ... },
        MucDoKho: 7.5,
        ChiTietDiem: [
          {
            TenTieuChi: "Mức độ hoàn thành",
            LoaiTieuChi: "TANG_DIEM",
            IsMucDoHoanThanh: true,
            DiemDat: null,  // ← Chưa chấm
            GiaTriMax: 100,
            DonVi: "%"
          },
          // ... more criteria
        ]
      },
      // ... more nhiemVu
    ]
  },
  message: "Lấy dữ liệu chấm điểm thành công"
}
```

**Backend Logic:**

1. Nếu có `danhGiaKPIId` → Load trực tiếp
2. Nếu không → Tìm DanhGiaKPI với `nhanVienId` + `chuKyId`
3. Nếu chưa tồn tại → **Auto-create DanhGiaKPI + DanhGiaNhiemVuThuongQuy** (copy TieuChiCauHinh từ ChuKy)

---

## ✅ Category 3: Approval Operations

### 3.1 POST /duyet-kpi-tieu-chi/:danhGiaKPIId - Duyệt KPI (Chính thức)

**Method:** `POST`  
**Permission:** Manager

**Path Parameters:**

- `danhGiaKPIId`: DanhGiaKPI.\_id

**Request Body:**

```javascript
{
  nhiemVuList: [
    {
      _id: "678nv1...",
      ChiTietDiem: [
        { TenTieuChi: "...", DiemDat: 90, ... },
        // ... all criteria with scores
      ]
    },
    // ... all nhiemVu
  ],
  nhanXet?: "Hoàn thành tốt công việc trong quý 4"
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    danhGiaKPI: {
      _id: "67890abc...",
      TongDiemKPI: 8.75,        // ← Official score calculated
      TrangThai: "DA_DUYET",
      NgayDuyet: "2025-12-15T10:30:00Z",
      NguoiDuyet: {
        _id: "managerId",
        HoTen: "Manager X"
      },
      LichSuDuyet: [
        {
          NguoiDuyet: "managerId",
          NgayDuyet: "2025-12-15T10:30:00Z",
          TongDiemLucDuyet: 8.75,
          GhiChu: "Hoàn thành tốt công việc trong quý 4"
        }
      ]
    },
    nhiemVuList: [ ... ]  // Updated với TrangThai = "DA_DUYET"
  },
  message: "Duyệt KPI thành công"
}
```

**Backend Flow:**

1. Validate permission (Manager quản lý nhân viên này)
2. Batch update DanhGiaNhiemVuThuongQuy.ChiTietDiem
3. Call `danhGiaKPI.duyet(nhanXet, nguoiDuyetId)` → Tính TongDiemKPI official
4. Update TrangThai = "DA_DUYET"
5. Save audit trail (LichSuDuyet)

**Errors:**

- 400: "KPI đã được duyệt"
- 400: "Chưa chấm điểm đầy đủ" (có DiemDat = null)
- 403: "Không có quyền duyệt KPI này"

---

### 3.2 POST /huy-duyet-kpi/:danhGiaKPIId - Hủy duyệt KPI

**Method:** `POST`  
**Permission:** Admin only

**Path Parameters:**

- `danhGiaKPIId`: DanhGiaKPI.\_id

**Request Body:**

```javascript
{
  lyDo: "Cần điều chỉnh tiêu chí đánh giá"; // Required
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    danhGiaKPI: {
      _id: "67890abc...",
      TongDiemKPI: 0,          // ← Reset về 0
      TrangThai: "CHUA_DUYET",  // ← Reset về chưa duyệt
      NgayDuyet: null,
      NguoiDuyet: null,
      LichSuHuyDuyet: [
        {
          NguoiHuyDuyet: {
            _id: "adminId",
            HoTen: "Admin Y"
          },
          NgayHuyDuyet: "2025-12-16T08:00:00Z",
          LyDoHuyDuyet: "Cần điều chỉnh tiêu chí đánh giá",
          DiemTruocKhiHuy: 8.75,
          NgayDuyetTruocDo: "2025-12-15T10:30:00Z"
        }
      ]
    }
  },
  message: "Đã hủy duyệt KPI"
}
```

**Backend:** Call `danhGiaKPI.huyDuyet(nguoiHuyId, lyDo)`

**Errors:**

- 400: "KPI chưa được duyệt, không thể hủy duyệt"
- 400: "Vui lòng nhập lý do hủy duyệt"
- 403: "Chỉ Admin mới được hủy duyệt KPI"

---

### 3.3 POST /batch-approve - Duyệt KPI hàng loạt

**Method:** `POST`  
**Permission:** Manager hoặc Admin

**Request Body:**

```javascript
{
  danhGiaKPIIds: [
    "67890abc1...",
    "67890abc2...",
    "67890abc3..."
  ],
  nhanXet?: "Duyệt hàng loạt cho quý 4/2025"
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    approved: [
      {
        _id: "67890abc1...",
        NhanVienID: { HoTen: "Nguyễn Văn A" },
        TongDiemKPI: 8.75
      },
      {
        _id: "67890abc2...",
        NhanVienID: { HoTen: "Trần Thị B" },
        TongDiemKPI: 9.20
      }
    ],
    failed: [
      {
        _id: "67890abc3...",
        error: "Chưa chấm điểm đầy đủ"
      }
    ]
  },
  message: "Duyệt 2/3 KPI thành công"
}
```

**Backend:** Loop qua từng ID, gọi `duyet()` method

---

### 3.4 PUT /:id/duyet - Duyệt KPI đơn lẻ (Legacy API)

**Method:** `PUT`  
**Permission:** Manager

**Path Parameters:**

- `id`: DanhGiaKPI.\_id

**Request Body:**

```javascript
{
  nhanXet?: "Tốt"
}
```

**Response:** Tương tự 3.1

**Note:** API cũ, khuyến nghị dùng POST `/duyet-kpi-tieu-chi/:id` thay thế

---

## 📊 Category 4: Dashboard & Statistics

### 4.1 GET /dashboard/:chuKyId - Dashboard tổng quan

**Method:** `GET`  
**Permission:** Manager (xem nhân viên quản lý) hoặc Admin (xem tất cả)

**Path Parameters:**

- `chuKyId`: ChuKyDanhGia.\_id

**Query Parameters:**

```javascript
{
  phongBan?: string  // Filter theo phòng ban
}
```

**Example Request:**

```bash
GET /api/workmanagement/kpi/dashboard/67895b9a6f7b8c2d4e3f1a0b?phongBan=IT
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    nhanVienList: [
      {
        nhanVien: {
          _id: "66b1dba7...",
          HoTen: "Nguyễn Văn A",
          MaNhanVien: "NV001",
          PhongBanID: { TenPhongBan: "IT" }
        },
        assignedCount: 5,  // Tổng nhiệm vụ được gán
        danhGiaKPI: {
          _id: "67890abc...",
          TongDiemKPI: 8.75,
          TrangThai: "DA_DUYET"
        },
        progress: {
          scored: 5,       // Đã chấm điểm
          total: 5,
          percentage: 100  // 100%
        }
      },
      {
        nhanVien: {
          _id: "66b1dba8...",
          HoTen: "Trần Thị B",
          MaNhanVien: "NV002"
        },
        assignedCount: 3,
        danhGiaKPI: {
          _id: "67890def...",
          TongDiemKPI: 0,
          TrangThai: "CHUA_DUYET"
        },
        progress: {
          scored: 1,
          total: 3,
          percentage: 33  // 33%
        }
      }
    ],
    summary: {
      totalNhanVien: 2,
      completed: 1,      // 100% progress
      inProgress: 1,     // 1-99% progress
      notStarted: 0      // 0% progress
    }
  },
  message: "Lấy dashboard thành công"
}
```

**Use Case:** Hiển thị bảng tổng quan cho Manager, biết nhân viên nào đã chấm xong/chưa

---

### 4.2 GET /thong-ke/chu-ky/:chuKyId - Thống kê chi tiết theo chu kỳ

**Method:** `GET`  
**Permission:** Manager hoặc Admin

**Path Parameters:**

- `chuKyId`: ChuKyDanhGia.\_id

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    chuKy: {
      _id: "67895b9a...",
      TenChuKy: "Quý 4/2025",
      NgayBatDau: "2025-10-01",
      NgayKetThuc: "2025-12-31"
    },
    statistics: {
      totalNhanVien: 50,
      totalDanhGia: 48,        // Đã có DanhGiaKPI
      daDuyet: 45,
      chuaDuyet: 3,

      diemTrungBinh: 8.12,
      diemCaoNhat: 9.85,
      diemThapNhat: 6.20,

      phanBoDiem: {
        "0-5": 0,
        "5-7": 5,
        "7-8": 15,
        "8-9": 20,
        "9-10": 5
      },

      topNhanVien: [
        {
          HoTen: "Nguyễn Văn A",
          MaNhanVien: "NV001",
          TongDiemKPI: 9.85
        },
        // ... top 10
      ]
    }
  },
  message: "Thống kê thành công"
}
```

---

### 4.3 GET /thong-ke/nhan-vien/:nhanVienId - Thống kê theo nhân viên

**Method:** `GET`  
**Permission:** Nhân viên (xem của mình) hoặc Manager/Admin

**Path Parameters:**

- `nhanVienId`: NhanVien.\_id

**Query Parameters:**

```javascript
{
  fromDate?: string,  // YYYY-MM-DD
  toDate?: string
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    nhanVien: {
      HoTen: "Nguyễn Văn A",
      MaNhanVien: "NV001"
    },
    lichSuKPI: [
      {
        chuKy: {
          TenChuKy: "Quý 4/2025",
          NgayKetThuc: "2025-12-31"
        },
        TongDiemKPI: 8.75,
        TrangThai: "DA_DUYET",
        NgayDuyet: "2025-12-15"
      },
      {
        chuKy: {
          TenChuKy: "Quý 3/2025",
          NgayKetThuc: "2025-09-30"
        },
        TongDiemKPI: 8.50,
        TrangThai: "DA_DUYET",
        NgayDuyet: "2025-10-05"
      }
    ],
    summary: {
      totalChuKy: 4,
      diemTrungBinh: 8.45,
      diemCaoNhat: 9.00,
      diemThapNhat: 7.80
    }
  },
  message: "Thống kê thành công"
}
```

---

## 📄 Category 5: Reports & Export

### 5.1 GET /bao-cao/chi-tiet - Báo cáo chi tiết

**Method:** `GET`  
**Permission:** Manager hoặc Admin

**Query Parameters:**

```javascript
{
  chuKyId?: string,
  phongBan?: string,
  trangThai?: string,  // "CHUA_DUYET" | "DA_DUYET"
  diemMin?: number,    // Filter điểm KPI >= diemMin
  diemMax?: number,    // Filter điểm KPI <= diemMax
  page?: number,
  limit?: number
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    reports: [
      {
        nhanVien: {
          MaNhanVien: "NV001",
          HoTen: "Nguyễn Văn A",
          Email: "nva@example.com",
          PhongBanID: { TenPhongBan: "IT" }
        },
        chuKy: {
          TenChuKy: "Quý 4/2025"
        },
        TongDiemKPI: 8.75,
        XepLoai: "Khá",  // Computed: Xuất sắc/Giỏi/Khá/Trung bình/Yếu
        TrangThai: "DA_DUYET",
        NgayDuyet: "2025-12-15",
        NguoiDanhGia: { HoTen: "Manager X" },

        chiTiet: [
          {
            nhiemVu: "Quản lý hạ tầng mạng",
            MucDoKho: 7.5,
            DiemNhiemVu: 6.75  // Computed
          }
        ]
      }
    ],
    pagination: { ... }
  },
  message: "Lấy báo cáo thành công"
}
```

---

### 5.2 GET /bao-cao/thong-ke - Báo cáo thống kê (Charts)

**Method:** `GET`  
**Permission:** Manager hoặc Admin

**Query Parameters:**

```javascript
{
  chuKyId?: string,
  phongBan?: string
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    phanBoDiem: [
      { range: "0-5", count: 0 },
      { range: "5-7", count: 5 },
      { range: "7-8", count: 15 },
      { range: "8-9", count: 20 },
      { range: "9-10", count: 5 }
    ],

    tyLeTrangThai: [
      { label: "Đã duyệt", value: 45, percentage: 93.75 },
      { label: "Chưa duyệt", value: 3, percentage: 6.25 }
    ],

    topPhongBan: [
      { TenPhongBan: "IT", DiemTrungBinh: 8.5, SoNhanVien: 20 },
      { TenPhongBan: "Kế toán", DiemTrungBinh: 8.2, SoNhanVien: 10 }
    ],

    xuHuong: [
      { chuKy: "Q1/2025", diemTrungBinh: 8.0 },
      { chuKy: "Q2/2025", diemTrungBinh: 8.1 },
      { chuKy: "Q3/2025", diemTrungBinh: 8.3 },
      { chuKy: "Q4/2025", diemTrungBinh: 8.5 }
    ]
  },
  message: "Thống kê thành công"
}
```

---

### 5.3 GET /bao-cao/export-excel - Xuất Excel

**Method:** `GET`  
**Permission:** Manager hoặc Admin

**Query Parameters:** (Giống 5.1 - `/bao-cao/chi-tiet`)

**Response:** File Excel (`.xlsx`)

**Headers:**

```
Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
Content-Disposition: attachment; filename="BaoCaoKPI_Q4_2025_1701234567890.xlsx"
```

**Excel Structure:**

```
Sheet 1: Tổng quan
┌──────┬────────┬─────────────┬──────────┬──────────┬──────────┬──────────┐
│ STT  │ Mã NV  │ Họ tên      │ Phòng ban│ Điểm KPI │ Xếp loại │ Ngày duyệt│
├──────┼────────┼─────────────┼──────────┼──────────┼──────────┼──────────┤
│ 1    │ NV001  │ Nguyễn VĂn A│ IT       │ 8.75     │ Khá      │ 15/12/2025│
│ 2    │ NV002  │ Trần Thị B  │ IT       │ 9.20     │ Xuất sắc │ 15/12/2025│
└──────┴────────┴─────────────┴──────────┴──────────┴──────────┴──────────┘

Sheet 2: Chi tiết nhiệm vụ
(Nhiệm vụ của từng nhân viên với điểm từng tiêu chí)
```

**Example:**

```bash
curl -o report.xlsx "http://localhost:8020/api/workmanagement/kpi/bao-cao/export-excel?chuKyId=67895b9a..." \
  -H "Authorization: Bearer <token>"
```

---

## 🛠️ Category 6: Utilities

### 6.1 POST /reset-criteria/:danhGiaKPIId - Reset tiêu chí (Re-sync với ChuKy)

**Method:** `POST`  
**Permission:** Admin

**Path Parameters:**

- `danhGiaKPIId`: DanhGiaKPI.\_id

**Use Case:** Khi Admin thay đổi TieuChiCauHinh trong ChuKy, cần re-sync lại DanhGiaNhiemVuThuongQuy.ChiTietDiem

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    updated: 5  // Số lượng nhiemVu đã cập nhật
  },
  message: "Đã reset tiêu chí thành công"
}
```

**Warning:** API này sẽ **xóa tất cả điểm đã chấm** (DiemDat reset về null)

---

### 6.2 POST /preview-score - Preview điểm KPI (trước khi duyệt)

**Method:** `POST`  
**Permission:** Manager

**Request Body:**

```javascript
{
  nhiemVuList: [
    {
      NhanVienNhiemVuID: "678assign1...",
      MucDoKho: 7.5,
      DiemTuDanhGia: 85,
      ChiTietDiem: [
        { LoaiTieuChi: "TANG_DIEM", IsMucDoHoanThanh: true, DiemDat: 90 },
        { LoaiTieuChi: "TANG_DIEM", IsMucDoHoanThanh: false, DiemDat: 3 },
        { LoaiTieuChi: "GIAM_DIEM", IsMucDoHoanThanh: false, DiemDat: 2 },
      ],
    },
    // ... more nhiemVu
  ];
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    tongDiem: 8.75,
    breakdown: [
      {
        NhanVienNhiemVuID: "678assign1...",
        diemNhiemVu: 6.75,
        detail: {
          diemTang: 0.93,
          diemGiam: 0.02,
          tongDiemTieuChi: 0.91,
          MucDoKho: 7.5
        }
      }
    ]
  },
  message: "Preview thành công"
}
```

**Use Case:** Frontend gọi API này để hiển thị real-time preview khi Manager thay đổi điểm

---

### 6.3 GET /validate/:danhGiaKPIId - Validate trước khi duyệt

**Method:** `GET`  
**Permission:** Manager

**Path Parameters:**

- `danhGiaKPIId`: DanhGiaKPI.\_id

**Response (200 OK - Valid):**

```javascript
{
  success: true,
  data: {
    valid: true,
    errors: []
  },
  message: "Dữ liệu hợp lệ, có thể duyệt"
}
```

**Response (200 OK - Invalid):**

```javascript
{
  success: true,
  data: {
    valid: false,
    errors: [
      {
        nhiemVuId: "678nv1...",
        nhiemVu: "Quản lý hạ tầng mạng",
        issues: [
          "Tiêu chí 'Mức độ hoàn thành' chưa chấm điểm (DiemDat = null)"
        ]
      },
      {
        nhiemVuId: "678nv2...",
        nhiemVu: "Hỗ trợ người dùng",
        issues: [
          "Tiêu chí 'Điểm tích cực' vượt GiaTriMax (15 > 10)"
        ]
      }
    ]
  },
  message: "Dữ liệu chưa hợp lệ"
}
```

---

### 6.4 GET /history/:nhanVienId - Lịch sử KPI nhân viên

**Method:** `GET`  
**Permission:** Nhân viên (xem của mình) hoặc Manager/Admin

**Path Parameters:**

- `nhanVienId`: NhanVien.\_id

**Query Parameters:**

```javascript
{
  limit?: number  // Default: 10 (10 chu kỳ gần nhất)
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    history: [
      {
        chuKy: { TenChuKy: "Quý 4/2025", NgayKetThuc: "2025-12-31" },
        TongDiemKPI: 8.75,
        TrangThai: "DA_DUYET",
        NgayDuyet: "2025-12-15",
        NguoiDanhGia: { HoTen: "Manager X" }
      },
      {
        chuKy: { TenChuKy: "Quý 3/2025", NgayKetThuc: "2025-09-30" },
        TongDiemKPI: 8.50,
        TrangThai: "DA_DUYET",
        NgayDuyet: "2025-10-05"
      }
    ]
  },
  message: "Lấy lịch sử thành công"
}
```

---

### 6.5 POST /sync-assignments/:danhGiaKPIId - Đồng bộ assignments mới

**Method:** `POST`  
**Permission:** Manager

**Path Parameters:**

- `danhGiaKPIId`: DanhGiaKPI.\_id

**Use Case:** Khi Manager gán thêm nhiệm vụ cho nhân viên sau khi đã tạo DanhGiaKPI, cần tạo DanhGiaNhiemVuThuongQuy mới

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    created: 2  // Số lượng DanhGiaNhiemVuThuongQuy mới tạo
  },
  message: "Đồng bộ thành công"
}
```

---

### 6.6 GET /compare-cycles - So sánh 2 chu kỳ

**Method:** `GET`  
**Permission:** Admin

**Query Parameters:**

```javascript
{
  chuKyId1: string,  // Required
  chuKyId2: string   // Required
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    chuKy1: {
      TenChuKy: "Quý 3/2025",
      DiemTrungBinh: 8.2,
      TotalNhanVien: 50
    },
    chuKy2: {
      TenChuKy: "Quý 4/2025",
      DiemTrungBinh: 8.5,
      TotalNhanVien: 52
    },
    comparison: {
      diemTangGiam: +0.3,
      phanTramThayDoi: +3.66,
      nhanVienTangGiam: +2
    }
  },
  message: "So sánh thành công"
}
```

---

### 6.7 POST /calculate-undo-simulation/:danhGiaKPIId - Mô phỏng hủy duyệt

**Method:** `POST`  
**Permission:** Admin

**Path Parameters:**

- `danhGiaKPIId`: DanhGiaKPI.\_id

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    currentState: {
      TongDiemKPI: 8.75,
      TrangThai: "DA_DUYET",
      NgayDuyet: "2025-12-15"
    },
    afterUndo: {
      TongDiemKPI: 0,
      TrangThai: "CHUA_DUYET",
      NgayDuyet: null,
      LichSuHuyDuyet: [
        {
          DiemTruocKhiHuy: 8.75,
          NgayDuyetTruocDo: "2025-12-15"
        }
      ]
    },
    warning: "Lịch sử vẫn được giữ, có thể khôi phục"
  },
  message: "Mô phỏng thành công"
}
```

---

## ⚠️ Common Errors

### 400 Bad Request

```javascript
{
  success: false,
  message: "KPI đã được duyệt, không thể chỉnh sửa"
}
```

### 403 Forbidden

```javascript
{
  success: false,
  message: "Chỉ Admin mới được hủy duyệt KPI"
}
```

### 404 Not Found

```javascript
{
  success: false,
  message: "Không tìm thấy đánh giá KPI"
}
```

### 409 Conflict (Version Conflict - Optimistic Concurrency)

```javascript
{
  success: false,
  message: "Dữ liệu đã thay đổi, vui lòng tải lại",
  error: "VERSION_CONFLICT"
}
```

**Frontend handling:**

```javascript
catch (error) {
  if (error.response?.data?.error === "VERSION_CONFLICT") {
    // Auto-refresh
    dispatch(getChamDiemTieuChi(danhGiaKPIId));
    toast.warning("Dữ liệu đã thay đổi, đã tải lại");
  }
}
```

---

## 🔄 API Versioning & Deprecation

### Legacy APIs (V1 - Deprecated)

**❌ Không dùng nữa:**

- `PUT /kpi/:id/duyet` → Thay bằng `POST /duyet-kpi-tieu-chi/:id`
- `GET /kpi/danh-gia-cu` → Không còn hỗ trợ

### Current (V2)

- Sử dụng cycle-based evaluation
- Không lưu calculated fields (TongDiemTieuChi, DiemNhiemVu)
- Có audit trail (LichSuDuyet, LichSuHuyDuyet)

---

**✅ API Reference verified với backend code (25/11/2025)**
