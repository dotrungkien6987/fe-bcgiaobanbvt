# 🗄️ Database Schema - Hệ Thống Yêu Cầu

> **Trạng thái**: ✅ Đã thiết kế  
> **Cập nhật**: 30/11/2025  
> **Sync với**: 01_NGHIEP_VU_CHI_TIET.md (Journey #1-#6)

---

## Mục Lục

1. [Tổng Quan Schema](#tổng-quan-schema)
2. [DanhMucYeuCau](#1-danhmucyeucau)
3. [LyDoTuChoi](#2-lydotuchoi)
4. [CauHinhThongBaoKhoa](#3-cauhinhthongbaokhoa)
5. [YeuCau](#4-yeucau)
6. [YeuCauCounter](#5-yeucaucounter)
7. [LichSuYeuCau](#6-lichsuyeucau)
8. [Tái Sử Dụng Components](#7-tái-sử-dụng-components)
9. [Indexes](#8-indexes)

---

## Tổng Quan Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE SCHEMA OVERVIEW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐        ┌─────────────────┐                │
│   │ DanhMucYeuCau   │◄──────┤ YeuCau          │                │
│   │ (Per Khoa)      │        │ (Main Entity)   │                │
│   └─────────────────┘        └────────┬────────┘                │
│                                       │                          │
│   ┌─────────────────┐                 │                          │
│   │ LyDoTuChoi      │◄────────────────┤                          │
│   │ (Global)        │                 │                          │
│   └─────────────────┘                 │                          │
│                                       │                          │
│   ┌─────────────────┐                 │                          │
│   │CauHinhThongBao  │                 │                          │
│   │Khoa (Per Khoa)  │                 │                          │
│   └─────────────────┘                 │                          │
│                                       │                          │
│   ┌─────────────────┐                                            │
│   │ YeuCauCounter   │ ◄── Auto-gen MaYeuCau                     │
│   └─────────────────┘                 │                          │
│                                       │                          │
│   ┌─────────────────┐                 │                          │
│   │ LichSuYeuCau    │◄────────────────┘                          │
│   │ (History Log)   │                                            │
│   └─────────────────┘                                            │
│                                                                  │
│   ┌─────────────────────────────────────────┐                   │
│   │ TÁI SỬ DỤNG TỪ CONGVIEC:               │                   │
│   │ ├── BinhLuan (thêm YeuCauID)            │                   │
│   │ └── TepTin (thêm YeuCauID)              │                   │
│   └─────────────────────────────────────────┘                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

| Model               | Mô tả                               | Status |
| ------------------- | ----------------------------------- | :----: |
| DanhMucYeuCau       | Loại yêu cầu của từng khoa          |   ✅   |
| LyDoTuChoi          | Lý do từ chối (chung)               |   ✅   |
| CauHinhThongBaoKhoa | Ai nhận thông báo                   |   ✅   |
| YeuCau              | Yêu cầu chính                       |   ✅   |
| YeuCauCounter       | Counter cho MaYeuCau                |   ✅   |
| LichSuYeuCau        | Lịch sử thay đổi                    |   ✅   |
| BinhLuan            | Comment (thêm field YeuCauID)       |   🔄   |
| TepTin              | File đính kèm (thêm field YeuCauID) |   🔄   |

---

## 1. DanhMucYeuCau

Quản lý danh mục loại yêu cầu của từng khoa.

```javascript
// Collection: danhmucyeucau
{
  _id: ObjectId,

  // Khoa sở hữu danh mục này
  KhoaID: {
    type: ObjectId,
    ref: "Khoa",
    required: true,
    index: true
  },

  // Tên loại yêu cầu
  TenLoaiYeuCau: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
    // VD: "Sửa lỗi phần mềm", "Mở bệnh án điện tử"
  },

  // Mô tả chi tiết (tùy chọn)
  MoTa: {
    type: String,
    maxlength: 1000
  },

  // Thời gian dự kiến xử lý
  ThoiGianDuKien: {
    type: Number,
    required: true,
    min: 1
    // VD: 60 (phút), 2 (giờ), 1 (ngày)
  },

  DonViThoiGian: {
    type: String,
    enum: ["PHUT", "GIO", "NGAY"],
    default: "PHUT"
  },

  // Trạng thái
  TrangThai: {
    type: String,
    enum: ["HOAT_DONG", "NGUNG_HOAT_DONG"],
    default: "HOAT_DONG"
  },

  // Thứ tự hiển thị
  ThuTu: {
    type: Number,
    default: 0
  },

  // Audit
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ KhoaID: 1, TrangThai: 1 }
{ KhoaID: 1, ThuTu: 1 }
```

### Business Rules - DanhMucYeuCau

| Rule               | Mô tả                                                                                  |
| ------------------ | -------------------------------------------------------------------------------------- |
| **Quyền truy cập** | Chỉ người trong `CauHinhThongBaoKhoa.DanhSachQuanLyKhoa` hoặc Admin                    |
| **Chọn khoa**      | Admin: chọn bất kỳ khoa. Còn lại: auto-fill theo `NhanVien.KhoaID`, không cho chọn     |
| **Xóa danh mục**   | ❌ Block nếu có YeuCau đang tham chiếu. Chỉ cho phép đổi `TrangThai = NGUNG_HOAT_DONG` |
| **Thứ tự (ThuTu)** | Hỗ trợ drag-drop sắp xếp trên UI                                                       |

---

## 2. LyDoTuChoi

Danh mục lý do từ chối - **chung toàn hệ thống**.

```javascript
// Collection: lydotuchoi
{
  _id: ObjectId,

  // Tên lý do
  TenLyDo: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
    // VD: "Không đủ thông tin", "Không thuộc phạm vi xử lý"
  },

  // Mô tả (tùy chọn)
  MoTa: {
    type: String,
    maxlength: 500
  },

  // Trạng thái
  TrangThai: {
    type: String,
    enum: ["HOAT_DONG", "NGUNG_HOAT_DONG"],
    default: "HOAT_DONG"
  },

  // Thứ tự hiển thị
  ThuTu: {
    type: Number,
    default: 0
  },

  // Audit
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ TrangThai: 1, ThuTu: 1 }
```

### Business Rules - LyDoTuChoi

| Rule               | Mô tả                                                                             |
| ------------------ | --------------------------------------------------------------------------------- |
| **Quyền truy cập** | Chỉ Admin/SuperAdmin                                                              |
| **Xóa lý do**      | Soft delete (đổi `TrangThai = NGUNG_HOAT_DONG`), không hard delete vì còn lịch sử |
| **Seed data**      | Tạo sẵn 5 lý do phổ biến khi init DB                                              |

**Seed data mặc định:**

```javascript
[
  { TenLyDo: "Không đủ thông tin", ThuTu: 1 },
  { TenLyDo: "Không thuộc phạm vi xử lý", ThuTu: 2 },
  { TenLyDo: "Yêu cầu trùng lặp", ThuTu: 3 },
  { TenLyDo: "Thiếu tài nguyên/thiết bị", ThuTu: 4 },
  { TenLyDo: "Lý do khác", ThuTu: 5 },
];
```

---

## 3. CauHinhThongBaoKhoa

Cấu hình **phân quyền** và **người nhận thông báo** của từng khoa.

```javascript
// Collection: cauhinhthongbaokhoa
{
  _id: ObjectId,

  // Khoa
  KhoaID: {
    type: ObjectId,
    ref: "Khoa",
    required: true,
    unique: true  // Mỗi khoa chỉ có 1 cấu hình
  },

  // ========== 👑 QUẢN LÝ KHOA ==========
  // Người có quyền:
  // - Cấu hình danh mục yêu cầu (DanhMucYeuCau)
  // - Thay đổi danh sách người điều phối
  // - Thay đổi danh sách quản lý khoa
  // LƯU Ý: Quản lý khoa KHÔNG tự động là người điều phối
  DanhSachQuanLyKhoa: [{
    NhanVienID: {
      type: ObjectId,
      ref: "NhanVien",
      required: true
    }
  }],

  // ========== 📬 NGƯỜI ĐIỀU PHỐI ==========
  // Người nhận thông báo khi có yêu cầu mới gửi đến KHOA
  // + Quyền tiếp nhận / từ chối / điều phối yêu cầu
  DanhSachNguoiDieuPhoi: [{
    NhanVienID: {
      type: ObjectId,
      ref: "NhanVien",
      required: true
    }
  }],

  // Audit
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ KhoaID: 1 }  // Unique đã đảm bảo index
```

### Business Rules - CauHinhThongBaoKhoa

| Rule                | Mô tả                                                               |
| ------------------- | ------------------------------------------------------------------- |
| **Khởi tạo**        | Admin tạo cấu hình ban đầu và chỉ định ít nhất 1 quản lý khoa       |
| **Quản lý khoa**    | Có thể tự bỏ mình ra khỏi danh sách (cho phép orphan)               |
| **Người điều phối** | ⚠️ Warning nếu = 0, vẫn cho lưu (khoa sẽ không nhận thông báo)      |
| **Admin**           | Có toàn quyền: thêm/xóa quản lý khoa, điều phối viên bất kỳ lúc nào |
| **Nguồn nhân viên** | Query `NhanVien` theo `KhoaID` để hiển thị danh sách chọn           |

### Phân Quyền Chi Tiết

```
┌─────────────────────────────────────────────────────────────────┐
│                    PHÂN QUYỀN THEO VAI TRÒ                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   👑 ADMIN (User.PhanQuyen >= 3)                                │
│   ├── Tạo/sửa CauHinhThongBaoKhoa của mọi khoa                 │
│   ├── Thêm/xóa quản lý khoa                                    │
│   ├── Thêm/xóa người điều phối                                 │
│   └── Quản lý LyDoTuChoi (global)                              │
│                                                                  │
│   🏢 QUẢN LÝ KHOA (trong DanhSachQuanLyKhoa)                    │
│   ├── CRUD DanhMucYeuCau của khoa mình                         │
│   ├── Thay đổi DanhSachNguoiDieuPhoi                           │
│   ├── Thay đổi DanhSachQuanLyKhoa (kể cả bỏ mình)             │
│   └── ❌ KHÔNG tự động nhận thông báo yêu cầu                  │
│                                                                  │
│   📬 NGƯỜI ĐIỀU PHỐI (trong DanhSachNguoiDieuPhoi)             │
│   ├── Nhận thông báo khi có yêu cầu gửi đến KHOA               │
│   ├── Tiếp nhận / Từ chối / Điều phối yêu cầu                  │
│   └── ❌ KHÔNG có quyền cấu hình                                │
│                                                                  │
│   👤 NHÂN VIÊN THƯỜNG                                           │
│   ├── Tạo yêu cầu gửi đi                                       │
│   ├── Xem yêu cầu của khoa mình (đến + đi)                     │
│   └── Xử lý yêu cầu nếu được điều phối/chỉ định                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. YeuCau

Schema chính của yêu cầu.

```javascript
// Collection: yeucau
{
  _id: ObjectId,

  // ========== MÃ YÊU CẦU (Auto-generate) ==========
  MaYeuCau: {
    type: String,
    unique: true,
    required: true
    // Format: YC2025000001
  },

  // ========== NGƯỜI GỬI ==========
  NguoiYeuCauID: {
    type: ObjectId,
    ref: "NhanVien",
    required: true,
    index: true
  },

  KhoaNguonID: {
    type: ObjectId,
    ref: "Khoa",
    required: true
    // Khoa của người gửi (tự động lấy từ NguoiYeuCau.PhongBanID)
  },

  // ========== NGƯỜI NHẬN ==========
  KhoaDichID: {
    type: ObjectId,
    ref: "Khoa",
    required: true,
    index: true
    // Khoa nhận yêu cầu
  },

  LoaiNguoiNhan: {
    type: String,
    enum: ["KHOA", "CA_NHAN"],
    required: true
    // KHOA = gửi chung đến khoa
    // CA_NHAN = gửi trực tiếp đến cá nhân
  },

  NguoiNhanID: {
    type: ObjectId,
    ref: "NhanVien",
    default: null
    // null nếu LoaiNguoiNhan = "KHOA"
    // có giá trị nếu LoaiNguoiNhan = "CA_NHAN"
  },

  // ========== LOẠI YÊU CẦU ==========
  DanhMucYeuCauID: {
    type: ObjectId,
    ref: "DanhMucYeuCau",
    required: true
  },

  // 📸 SNAPSHOT tại thời điểm tạo
  // (đảm bảo không bị ảnh hưởng khi danh mục thay đổi)
  SnapshotDanhMuc: {
    TenLoaiYeuCau: { type: String, required: true },
    ThoiGianDuKien: { type: Number, required: true },
    DonViThoiGian: { type: String, required: true }
  },

  // ========== NỘI DUNG ==========
  TieuDe: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },

  MoTa: {
    type: String,
    required: true,
    maxlength: 5000
  },

  // ========== TRẠNG THÁI (5 States) ==========
  // Đã gộp DA_TIEP_NHAN vào DANG_XU_LY, bỏ DA_HUY (dùng hard delete khi MOI)
  TrangThai: {
    type: String,
    enum: [
      "MOI",           // Vừa tạo, chờ tiếp nhận
      "DANG_XU_LY",    // Đã tiếp nhận và đang xử lý
      "DA_HOAN_THANH", // Đã hoàn thành, chờ đánh giá/đóng
      "DA_DONG",       // Đã đóng (hoàn tất flow)
      "TU_CHOI"        // Bị từ chối
    ],
    default: "MOI",
    index: true
  },

  // ========== ĐIỀU PHỐI ==========
  // Người được điều phối hiện tại (chờ tiếp nhận)
  NguoiDuocDieuPhoiID: {
    type: ObjectId,
    ref: "NhanVien",
    default: null
    // Khác với:
    // - NguoiNhanID: người được chỉ định ban đầu (gửi cá nhân)
    // - NguoiXuLyID: người đã tiếp nhận và đang xử lý
  },

  NgayDieuPhoi: {
    type: Date,
    default: null
  },

  // ========== NGƯỜI XỬ LÝ (sau khi tiếp nhận) ==========
  NguoiXuLyID: {
    type: ObjectId,
    ref: "NhanVien",
    default: null
    // Người thực sự xử lý (có thể khác NguoiNhanID nếu được điều phối)
  },

  NgayTiepNhan: {
    type: Date,
    default: null
  },

  // ========== THỜI GIAN ==========
  ThoiGianHen: {
    type: Date,
    default: null
    // Thời gian hẹn hoàn thành
    // Mặc định: NgayTiepNhan + ThoiGianDuKien
    // Cho phép người tiếp nhận chỉnh sửa
  },

  NgayHoanThanh: {
    type: Date,
    default: null
  },

  NgayDong: {
    type: Date,
    default: null
    // Dùng để kiểm tra 7 ngày mở lại từ DA_DONG
  },

  // ========== TỪ CHỐI (nếu có) ==========
  LyDoTuChoiID: {
    type: ObjectId,
    ref: "LyDoTuChoi",
    default: null
  },

  GhiChuTuChoi: {
    type: String,
    maxlength: 1000
  },

  // ========== LIÊN KẾT NHIỆM VỤ THƯỜNG QUY ==========
  // Để tính KPI (tương tự CongViec)
  NhiemVuThuongQuyID: {
    type: ObjectId,
    ref: "NhiemVuThuongQuy",
    default: null
    // Người xử lý tự gán khi tiếp nhận/hoàn thành
  },

  LaNhiemVuKhac: {
    type: Boolean,
    default: false
    // true = không thuộc nhiệm vụ thường quy nào
  },

  // ========== ĐÁNH GIÁ ==========
  // Đánh giá = tự động đóng yêu cầu
  // Bắt buộc NhanXet khi SoSao < 3 (validate ở service layer)
  DanhGia: {
    SoSao: {
      type: Number,
      min: 1,
      max: 5
    },
    NhanXet: {
      type: String,
      maxlength: 500
      // ⚠️ Bắt buộc khi SoSao < 3 (1-2 sao)
    },
    NgayDanhGia: Date
  },

  // ========== AUDIT ==========
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}

// Indexes
{ KhoaDichID: 1, TrangThai: 1 }          // Query yêu cầu theo khoa nhận
{ NguoiYeuCauID: 1, TrangThai: 1 }       // Query yêu cầu đã gửi
{ NguoiXuLyID: 1, TrangThai: 1 }         // Query yêu cầu đang xử lý
{ NguoiDuocDieuPhoiID: 1, TrangThai: 1 } // Query yêu cầu được điều phối
{ MaYeuCau: 1 }                          // Unique index
{ createdAt: -1 }                        // Sort theo thời gian
{ NgayDong: 1 }                          // Check 7 ngày mở lại
```

---

## 5. YeuCauCounter

Model để auto-generate MaYeuCau theo format `YC{YYYY}{NNNNNN}`.

```javascript
// Collection: yeucaucounter
{
  _id: ObjectId,

  // Năm
  Nam: {
    type: Number,
    required: true,
    unique: true
    // VD: 2025
  },

  // Số thứ tự hiện tại
  SoThuTu: {
    type: Number,
    default: 0
  }
}

// Indexes
{ Nam: 1 }  // Unique đã đảm bảo
```

### Helper Function - Generate MaYeuCau

```javascript
/**
 * Tạo mã yêu cầu mới
 * Format: YC2025000001, YC2025000002, ...
 */
async function generateMaYeuCau() {
  const nam = new Date().getFullYear();

  // Atomic increment
  const counter = await YeuCauCounter.findOneAndUpdate(
    { Nam: nam },
    { $inc: { SoThuTu: 1 } },
    { upsert: true, new: true }
  );

  // Pad to 6 digits
  const soThuTu = String(counter.SoThuTu).padStart(6, "0");

  return `YC${nam}${soThuTu}`;
  // Output: YC2025000001
}
```

---

## 6. LichSuYeuCau

Ghi lại toàn bộ lịch sử thay đổi của yêu cầu.

```javascript
// Collection: lichsuyeucau
{
  _id: ObjectId,

  YeuCauID: {
    type: ObjectId,
    ref: "YeuCau",
    required: true,
    index: true
  },

  // Hành động - enum đầy đủ theo nghiệp vụ
  HanhDong: {
    type: String,
    enum: [
      // === LIFECYCLE ===
      "TAO_MOI",            // Tạo yêu cầu mới
      "SUA_YEU_CAU",        // Sửa yêu cầu (khi MOI)
      "XOA",                // Ghi lại trước hard delete

      // === TIẾP NHẬN / TỪ CHỐI ===
      "TIEP_NHAN",          // Tiếp nhận yêu cầu
      "TU_CHOI",            // Từ chối yêu cầu
      "HUY_TIEP_NHAN",      // Hủy tiếp nhận (DANG_XU_LY → MOI)

      // === ĐIỀU PHỐI ===
      "DIEU_PHOI",          // Điều phối cho người khác
      "GUI_VE_KHOA",        // Gửi về khoa (từ cá nhân/điều phối)

      // === XỬ LÝ ===
      "DOI_THOI_GIAN_HEN",  // Đổi thời gian hẹn
      "HOAN_THANH",         // Báo hoàn thành
      "YEU_CAU_XU_LY_TIEP", // DA_HOAN_THANH → DANG_XU_LY

      // === ĐÁNH GIÁ & ĐÓNG ===
      "DANH_GIA",           // Đánh giá (1-5 sao) + tự động đóng
      "DONG",               // Đóng thủ công
      "TU_DONG_DONG",       // Hệ thống tự đóng sau 3 ngày
      "MO_LAI",             // Mở lại từ DA_DONG (trong 7 ngày)

      // === APPEAL ===
      "APPEAL",             // Khiếu nại từ TU_CHOI → MOI

      // === ESCALATE ===
      "NHAC_LAI",           // Người gửi nhắc lại (3/ngày)
      "BAO_QUAN_LY",        // Người gửi báo quản lý (1/ngày)

      // === COMMENT/FILE ===
      "THEM_BINH_LUAN",     // Thêm bình luận
      "THEM_FILE"           // Thêm file đính kèm
    ],
    required: true
  },

  // Ai thực hiện
  NguoiThucHienID: {
    type: ObjectId,
    ref: "NhanVien",
    required: true
  },

  // Chi tiết thay đổi
  TuGiaTri: {
    type: Schema.Types.Mixed
    // VD: { TrangThai: "MOI" }
  },

  DenGiaTri: {
    type: Schema.Types.Mixed
    // VD: { TrangThai: "DA_TIEP_NHAN", NguoiXuLyID: "..." }
  },

  // Ghi chú / Lý do
  GhiChu: {
    type: String,
    maxlength: 1000
  },

  // Thời gian
  ThoiGian: {
    type: Date,
    default: Date.now,
    index: true
  }
}

// Indexes
{ YeuCauID: 1, ThoiGian: -1 }  // Query lịch sử theo yêu cầu, mới nhất trước
```

---

## 7. Tái Sử Dụng Components

### 7.1. BinhLuan (Comments)

Tái sử dụng schema BinhLuan từ CongViec với cách đơn giản: **thêm field `YeuCauID`**.

```javascript
// File: models/BinhLuan.js
// Chỉ cần thêm field YeuCauID, giữ nguyên CongViecID

{
  // ... các field hiện có ...

  CongViecID: {
    type: ObjectId,
    ref: "CongViec"
    // Không required - dùng cho CongViec
  },

  // THÊM MỚI: cho Yêu Cầu
  YeuCauID: {
    type: ObjectId,
    ref: "YeuCau"
    // Không required - dùng cho YeuCau
  }
}

// Validation: Phải có 1 trong 2 (CongViecID hoặc YeuCauID)
binhLuanSchema.pre('validate', function(next) {
  if (!this.CongViecID && !this.YeuCauID) {
    return next(new Error('Phải có CongViecID hoặc YeuCauID'));
  }
  if (this.CongViecID && this.YeuCauID) {
    return next(new Error('Không thể có cả CongViecID và YeuCauID'));
  }
  next();
});

// Index cho query
db.binhluan.createIndex({ YeuCauID: 1, createdAt: -1 });
```

### 7.2. TepTin (File Attachments)

Tương tự BinhLuan, thêm field `YeuCauID`:

```javascript
// File: models/TepTin.js
// Chỉ cần thêm field YeuCauID

{
  // ... các field hiện có ...

  CongViecID: {
    type: ObjectId,
    ref: "CongViec"
    // Không required
  },

  // THÊM MỚI: cho Yêu Cầu
  YeuCauID: {
    type: ObjectId,
    ref: "YeuCau"
    // Không required
  }
}

// Validation tương tự BinhLuan
// Index cho query
db.teptin.createIndex({ YeuCauID: 1, createdAt: -1 });
```

**Lưu ý**: Approach này đơn giản hơn refPath, dễ query và maintain hơn.

---

## 8. Indexes

### Summary Indexes

```javascript
// YeuCauCounter
db.yeucaucounter.createIndex({ year: 1 }, { unique: true });

// DanhMucYeuCau
db.danhmucyeucau.createIndex({ KhoaID: 1, TrangThai: 1 });
db.danhmucyeucau.createIndex({ KhoaID: 1, ThuTu: 1 });

// LyDoTuChoi
db.lydotuchoi.createIndex({ TrangThai: 1, ThuTu: 1 });

// CauHinhThongBaoKhoa
db.cauhinhthongbaokhoa.createIndex({ KhoaID: 1 }, { unique: true });

// YeuCau
db.yeucau.createIndex({ MaYeuCau: 1 }, { unique: true });
db.yeucau.createIndex({ KhoaDichID: 1, TrangThai: 1 });
db.yeucau.createIndex({ NguoiYeuCauID: 1, TrangThai: 1 });
db.yeucau.createIndex({ NguoiXuLyID: 1, TrangThai: 1 });
db.yeucau.createIndex({ NguoiDuocDieuPhoiID: 1, TrangThai: 1 });
db.yeucau.createIndex({ createdAt: -1 });
db.yeucau.createIndex({ NgayDong: 1 }); // Cho check 7-day reopen

// LichSuYeuCau
db.lichsuyeucau.createIndex({ YeuCauID: 1, ThoiGian: -1 });

// BinhLuan (thêm index cho YeuCau)
db.binhluan.createIndex({ YeuCauID: 1, createdAt: -1 });

// TepTin (thêm index cho YeuCau)
db.teptin.createIndex({ YeuCauID: 1, createdAt: -1 });
```

---

## Sơ Đồ Quan Hệ

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENTITY RELATIONSHIPS                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐                                                  │
│   │   Khoa   │──────────────────────────────┐                   │
│   └──────────┘                              │                   │
│        │                                    │                   │
│        │ 1:N                                │ 1:N               │
│        ▼                                    ▼                   │
│   ┌──────────────────┐              ┌────────────────┐         │
│   │ DanhMucYeuCau    │              │CauHinhThongBao │         │
│   └────────┬─────────┘              │     Khoa       │         │
│            │                        └────────────────┘         │
│            │ 1:N                                                │
│            ▼                                                    │
│   ┌──────────────────┐                                          │
│   │     YeuCau       │◄─────────────────────────────┐           │
│   └────────┬─────────┘                              │           │
│            │                                        │           │
│            │ 1:N                         N:1        │           │
│            ▼                              │         │           │
│   ┌──────────────────┐              ┌─────┴────┐    │           │
│   │  LichSuYeuCau    │              │LyDoTuChoi│    │           │
│   └──────────────────┘              └──────────┘    │           │
│                                                      │           │
│   ┌──────────────────┐                              │           │
│   │    NhanVien      │──────────────────────────────┘           │
│   │                  │  (NguoiYeuCau, NguoiNhan,                │
│   │                  │   NguoiXuLy, NguoiDuocDieuPhoi)          │
│   └──────────────────┘                                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tài Liệu Liên Quan

- [01_NGHIEP_VU_CHI_TIET.md](./01_NGHIEP_VU_CHI_TIET.md) - Logic nghiệp vụ
- [03_STATE_MACHINE.md](./03_STATE_MACHINE.md) - State machine
