# 📋 MODULE CÔNG VIỆC - NGỮ CẢNH CHO AI

> **Mục đích**: Context cho AI khi audit notification module Công việc
> **Notifications**: 19 types
> **Cập nhật**: December 23, 2025

---

## 1. TỔNG QUAN NGHIỆP VỤ

### 1.1. Mô tả

Module Công việc quản lý việc giao việc, theo dõi tiến độ, deadline và hoàn thành công việc giữa các nhân viên.

### 1.2. Workflow chính

```
┌──────────┐    ┌──────────┐    ┌──────────────┐    ┌───────────┐    ┌──────────┐
│ Giao việc │ → │ Tiếp nhận │ → │ Thực hiện    │ → │ Báo hoàn  │ → │ Duyệt    │
│ (Manager) │    │(Assignee)│    │ + Cập nhật   │    │  thành    │    │(Manager) │
└──────────┘    └──────────┘    └──────────────┘    └───────────┘    └──────────┘
     ↓               ↓                ↓                   ↓              ↓
congviec-giao  congviec-tiep-nhan  congviec-*        congviec-hoan-thanh  congviec-duyet
```

### 1.3. Trạng thái (TrangThai)

| Giá trị          | Mô tả                  |
| ---------------- | ---------------------- |
| `TAO_MOI`        | Mới tạo, chưa giao     |
| `DA_GIAO`        | Đã giao, chờ tiếp nhận |
| `DANG_THUC_HIEN` | Đang thực hiện         |
| `CHO_DUYET`      | Chờ duyệt hoàn thành   |
| `HOAN_THANH`     | Đã hoàn thành          |
| `HUY`            | Đã hủy                 |

---

## 2. ENTITIES

### 2.1. CongViec

```javascript
{
  _id: ObjectId,
  MaCongViec: String,             // Auto-generated code
  TieuDe: String,
  MoTa: String,

  // Assignments
  NguoiGiaoID: ObjectId,          // → NhanVien (người giao)
  NguoiChinhID: ObjectId,         // → NhanVien (người chính)
  NguoiThamGia: [ObjectId],       // → [NhanVien] (người tham gia)

  // Status & Progress
  TrangThai: String,
  TienDo: Number,                 // 0-100%

  // Deadline
  NgayBatDau: Date,
  NgayHetHan: Date,

  // Priority
  DoUuTien: "CAO" | "TRUNG_BINH" | "THAP",

  // Related
  NhiemVuThuongQuyID: ObjectId    // Optional link to routine task
}
```

### 2.2. BinhLuanCongViec

```javascript
{
  _id: ObjectId,
  CongViecID: ObjectId,
  NguoiBinhLuanID: ObjectId,      // → NhanVien
  NoiDung: String,
  ThoiGian: Date
}
```

### 2.3. FileDinhKem

```javascript
{
  _id: ObjectId,
  CongViecID: ObjectId,
  TenFile: String,
  URL: String,
  NguoiUploadID: ObjectId
}
```

---

## 3. NOTIFICATION TYPES

### 3.1. Assignment & Status (9 types)

| #   | Type Code                     | Trigger            | Recipients                 |
| --- | ----------------------------- | ------------------ | -------------------------- |
| 1   | `congviec-giao-viec`          | Giao việc mới      | NguoiChinhID, NguoiThamGia |
| 2   | `congviec-huy-giao`           | Hủy giao việc      | NguoiChinhID               |
| 3   | `congviec-tiep-nhan`          | NV tiếp nhận       | NguoiGiaoID                |
| 4   | `congviec-hoan-thanh`         | NV báo hoàn thành  | NguoiGiaoID                |
| 5   | `congviec-hoan-thanh-tam`     | Chờ duyệt          | NguoiGiaoID                |
| 6   | `congviec-duyet-hoan-thanh`   | QL duyệt xong      | NguoiChinhID               |
| 7   | `congviec-huy-hoan-thanh-tam` | QL yêu cầu làm lại | NguoiChinhID               |
| 8   | `congviec-mo-lai`             | Mở lại công việc   | NguoiChinhID               |
| 9   | `congviec-tu-choi`            | Từ chối (disabled) | NguoiChinhID               |

### 3.2. Updates (6 types)

| #   | Type Code                       | Trigger          | Recipients        |
| --- | ------------------------------- | ---------------- | ----------------- |
| 10  | `congviec-cap-nhat-deadline`    | Đổi deadline     | arrNguoiLienQuan  |
| 11  | `congviec-thay-doi-uu-tien`     | Đổi ưu tiên      | arrNguoiLienQuan  |
| 12  | `congviec-thay-doi-nguoi-chinh` | Đổi người chính  | NguoiChinhMoi     |
| 13  | `congviec-gan-nguoi-tham-gia`   | Thêm người       | NguoiThamGiaMoi   |
| 14  | `congviec-xoa-nguoi-tham-gia`   | Xóa người        | NguoiThamGiaBiXoa |
| 15  | `congviec-cap-nhat-tien-do`     | Cập nhật tiến độ | NguoiGiaoID       |

### 3.3. Comments & Files (4 types)

| #   | Type Code                       | Trigger            | Recipients       |
| --- | ------------------------------- | ------------------ | ---------------- |
| 16  | `congviec-binh-luan`            | Comment mới        | arrNguoiLienQuan |
| 17  | `congviec-upload-file`          | Upload file        | arrNguoiLienQuan |
| 18  | `congviec-xoa-file`             | Xóa file           | arrNguoiLienQuan |
| 19  | `congviec-deadline-approaching` | Sắp hết hạn (auto) | arrNguoiLienQuan |
| 20  | `congviec-deadline-overdue`     | Quá hạn (auto)     | arrNguoiLienQuan |

---

## 4. VARIABLES

### 4.1. Common Variables

```javascript
{
  // IDs (String)
  _id: String,                    // CongViec._id.toString()
  MaCongViec: String,

  // Recipient candidates
  NguoiGiaoID: String,
  NguoiChinhID: String,
  NguoiThamGia: [String],         // Array of NhanVienIDs
  arrNguoiLienQuan: [String],     // Computed: all related people

  // Display
  TieuDe: String,
  TenNguoiGiao: String,           // nguoiGiao?.HoTen || 'Người giao'
  TenNguoiChinh: String,          // nguoiChinh?.HoTen || 'Người thực hiện'

  // Status
  TrangThai: String,
  TienDo: Number,
  DoUuTien: String,

  // Dates (formatted)
  Deadline: String,               // dayjs(NgayHetHan).format('DD/MM/YYYY')
}
```

### 4.2. Type-Specific Variables

| Type                            | Extra Variables                             |
| ------------------------------- | ------------------------------------------- |
| `congviec-cap-nhat-deadline`    | `DeadlineCu`, `DeadlineMoi`                 |
| `congviec-thay-doi-uu-tien`     | `DoUuTienCu`, `DoUuTienMoi`                 |
| `congviec-thay-doi-nguoi-chinh` | `NguoiChinhMoi`, `TenNguoiChinhMoi`         |
| `congviec-gan-nguoi-tham-gia`   | `NguoiThamGiaMoi`, `TenNguoiThamGiaMoi`     |
| `congviec-xoa-nguoi-tham-gia`   | `NguoiThamGiaBiXoa`, `TenNguoiThamGiaBiXoa` |
| `congviec-binh-luan`            | `NoiDungComment`, `TenNguoiComment`         |
| `congviec-upload-file`          | `TenFile`                                   |
| `congviec-xoa-file`             | `TenFile`                                   |

---

## 5. BACKEND INTEGRATION

### 5.1. Service File

**Path**: `giaobanbv-be/modules/workmanagement/services/congViec.service.js`

| Line  | Method                | Notification                  |
| ----- | --------------------- | ----------------------------- |
| ~445  | `capNhatTienDo()`     | congviec-cap-nhat-tien-do     |
| ~1716 | `giaoViec()`          | congviec-giao-viec            |
| ~2104 | `transition()`        | Dynamic based on action       |
| ~3018 | `capNhatDeadline()`   | congviec-cap-nhat-deadline    |
| ~3037 | `thayDoiUuTien()`     | congviec-thay-doi-uu-tien     |
| ~3057 | `thayDoiNguoiChinh()` | congviec-thay-doi-nguoi-chinh |
| ~3073 | `ganNguoiThamGia()`   | congviec-gan-nguoi-tham-gia   |
| ~3091 | `xoaNguoiThamGia()`   | congviec-xoa-nguoi-tham-gia   |
| ~3212 | `themBinhLuan()`      | congviec-binh-luan            |

### 5.2. Deadline Jobs

**Path**: `giaobanbv-be/modules/workmanagement/jobs/deadlineJobs.js`

| Line | Trigger         | Notification                  |
| ---- | --------------- | ----------------------------- |
| ~110 | Scheduled check | congviec-deadline-approaching |
| ~165 | Scheduled check | congviec-deadline-overdue     |

### 5.3. Service Pattern

```javascript
// Compute arrNguoiLienQuan (all related people)
const arrNguoiLienQuan = [
  congViec.NguoiGiaoID?.toString(),
  congViec.NguoiChinhID?.toString(),
  ...(congViec.NguoiThamGia || []).map((id) => id.toString()),
].filter(Boolean);

await notificationService.send({
  type: "congviec-binh-luan",
  data: {
    _id: congViec._id.toString(),
    MaCongViec: congViec.MaCongViec,
    TieuDe: congViec.TieuDe,
    arrNguoiLienQuan,
    NoiDungComment: comment.NoiDung,
    TenNguoiComment: nguoiBinhLuan?.HoTen || "Người dùng",
  },
});
```

### 5.4. Populate Pattern

```javascript
const congViec = await CongViec.findById(id)
  .populate("NguoiGiaoID", "HoTen Email")
  .populate("NguoiChinhID", "HoTen Email")
  .populate("NguoiThamGia", "HoTen Email");
```

---

## 6. FRONTEND INTEGRATION

### 6.1. Redux Slice

**Path**: `fe-bcgiaobanbvt/src/features/QuanLyCongViec/CongViec/congViecSlice.js`

| Thunk              | Endpoint                          | Triggers                    |
| ------------------ | --------------------------------- | --------------------------- |
| `createCongViec()` | POST /congviec                    | congviec-giao-viec          |
| `updateProgress()` | PUT /congviec/:id/tien-do         | congviec-cap-nhat-tien-do   |
| `changeDeadline()` | PUT /congviec/:id/deadline        | congviec-cap-nhat-deadline  |
| `addParticipant()` | POST /congviec/:id/nguoi-tham-gia | congviec-gan-nguoi-tham-gia |
| `addComment()`     | POST /congviec/:id/binh-luan      | congviec-binh-luan          |
| `completeTask()`   | POST /congviec/:id/hoan-thanh     | congviec-hoan-thanh         |
| `approveTask()`    | POST /congviec/:id/duyet          | congviec-duyet-hoan-thanh   |

### 6.2. UI Pages

| Page/Component | User Actions                    |
| -------------- | ------------------------------- |
| CongViecForm   | Create, assign task             |
| CongViecDetail | Update progress, comment, files |
| CongViecList   | Quick actions, status updates   |

---

## 7. RECIPIENT LOGIC

### 7.1. Single Recipient

```javascript
// Gửi cho người chính
recipientConfig: {
  useVariables: ["NguoiChinhID"];
}

// Gửi cho người giao
recipientConfig: {
  useVariables: ["NguoiGiaoID"];
}
```

### 7.2. Multiple Recipients

```javascript
// Gửi cho tất cả người liên quan
recipientConfig: {
  useVariables: ["arrNguoiLienQuan"];
}

// Build arrNguoiLienQuan trong service:
const arrNguoiLienQuan = [
  congViec.NguoiGiaoID,
  congViec.NguoiChinhID,
  ...congViec.NguoiThamGia,
]
  .filter(Boolean)
  .map((id) => id.toString());

// Exclude performer
const finalRecipients = arrNguoiLienQuan.filter((id) => id !== performerId);
```

### 7.3. New/Removed Person

```javascript
// Thêm người tham gia - chỉ gửi cho người mới
recipientConfig: {
  useVariables: ["NguoiThamGiaMoi"];
}

// Xóa người - gửi cho người bị xóa
recipientConfig: {
  useVariables: ["NguoiThamGiaBiXoa"];
}
```

---

## 8. COMMON PITFALLS

| Issue             | Wrong                      | Correct                                  |
| ----------------- | -------------------------- | ---------------------------------------- |
| Array recipients  | `NguoiThamGia: ObjectId[]` | `NguoiThamGia: String[]`                 |
| Missing filter    | `[...ids]`                 | `[...ids].filter(Boolean)`               |
| Self notification | Send to performer          | Exclude performer                        |
| Date format       | `NgayHetHan` (Date)        | `dayjs(NgayHetHan).format('DD/MM/YYYY')` |

---

## 9. STATE TRANSITIONS

### 9.1. Valid Transitions

```
TAO_MOI → DA_GIAO (giaoViec)
DA_GIAO → DANG_THUC_HIEN (tiepNhan)
DA_GIAO → HUY (huyGiao)
DANG_THUC_HIEN → CHO_DUYET (baoHoanThanh)
DANG_THUC_HIEN → HOAN_THANH (hoanThanhTrucTiep - if no approval needed)
CHO_DUYET → HOAN_THANH (duyetHoanThanh)
CHO_DUYET → DANG_THUC_HIEN (huyHoanThanhTam)
HOAN_THANH → DANG_THUC_HIEN (moLai)
```

### 9.2. Transition → Notification Mapping

| Transition        | Notification                |
| ----------------- | --------------------------- |
| giaoViec          | congviec-giao-viec          |
| tiepNhan          | congviec-tiep-nhan          |
| huyGiao           | congviec-huy-giao           |
| baoHoanThanh      | congviec-hoan-thanh-tam     |
| hoanThanhTrucTiep | congviec-hoan-thanh         |
| duyetHoanThanh    | congviec-duyet-hoan-thanh   |
| huyHoanThanhTam   | congviec-huy-hoan-thanh-tam |
| moLai             | congviec-mo-lai             |

---

_Context file cho AI audit. Version 1.0_
