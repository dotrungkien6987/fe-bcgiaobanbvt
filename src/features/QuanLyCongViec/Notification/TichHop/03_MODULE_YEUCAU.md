# 🎫 MODULE YÊU CẦU - NGỮ CẢNH CHO AI

> **Mục đích**: Context cho AI khi audit notification module Yêu cầu (Ticket)
> **Notifications**: 17 types
> **Cập nhật**: December 23, 2025

---

## 1. TỔNG QUAN NGHIỆP VỤ

### 1.1. Mô tả

Module Yêu cầu quản lý việc gửi/nhận yêu cầu hỗ trợ giữa các khoa trong bệnh viện. Một khoa có thể gửi yêu cầu đến khoa khác (VD: Khoa Nội → Khoa CNTT để sửa máy tính).

### 1.2. Workflow chính

```
┌───────────┐    ┌───────────┐    ┌───────────┐    ┌───────────┐    ┌─────────┐
│ Tạo yêu cầu│ → │ Tiếp nhận │ → │ Điều phối │ → │ Hoàn thành│ → │ Đánh giá│
│  (Khoa A)  │    │(Điều phối)│    │ (Người XL)│    │           │    │ (Khoa A)│
└───────────┘    └───────────┘    └───────────┘    └───────────┘    └─────────┘
     ↓                ↓                ↓                ↓               ↓
yeucau-tao-moi   yeucau-tiep-nhan  yeucau-dieu-phoi  yeucau-hoan-thanh  yeucau-danh-gia
```

### 1.3. Trạng thái (TrangThai)

| Giá trị         | Mô tả                               |
| --------------- | ----------------------------------- |
| `MOI`           | Mới tạo, chờ tiếp nhận              |
| `DANG_XU_LY`    | Đang xử lý                          |
| `DA_HOAN_THANH` | Đã hoàn thành, chờ đánh giá         |
| `TU_CHOI`       | Bị từ chối                          |
| `DA_DONG`       | Đã đóng (sau đánh giá hoặc timeout) |

---

## 2. ENTITIES

### 2.1. YeuCau

```javascript
{
  _id: ObjectId,
  MaYeuCau: String,               // Auto-generated code
  TieuDe: String,
  MoTa: String,

  // Departments
  KhoaYeuCauID: ObjectId,         // → Khoa (khoa gửi)
  KhoaDichID: ObjectId,           // → Khoa (khoa nhận)

  // People
  NguoiYeuCauID: ObjectId,        // → NhanVien (người tạo)
  NguoiXuLyID: ObjectId,          // → NhanVien (người xử lý)

  // Category
  LoaiYeuCauID: ObjectId,         // → DanhMucYeuCau

  // Status & Time
  TrangThai: String,
  ThoiGianHen: Date,              // Deadline
  ThoiGianHoanThanh: Date,

  // Rating
  DiemDanhGia: Number,            // 1-5
  NoiDungDanhGia: String,

  // History
  LichSu: [{
    HanhDong: String,
    NguoiThucHienID: ObjectId,
    ThoiGian: Date,
    GhiChu: String
  }]
}
```

### 2.2. Khoa

```javascript
{
  _id: ObjectId,
  TenKhoa: String,
  MaKhoa: String
}
```

### 2.3. DanhMucYeuCau (LoaiYeuCau)

```javascript
{
  _id: ObjectId,
  Ten: String,                    // "Sửa chữa", "Hỗ trợ CNTT"
  MoTa: String,
  KhoaDichID: ObjectId            // Khoa mặc định xử lý
}
```

### 2.4. CauHinhThongBaoKhoa

```javascript
{
  _id: ObjectId,
  KhoaID: ObjectId,
  DanhSachNguoiDieuPhoi: [{
    NhanVienID: ObjectId          // Điều phối viên
  }],
  DanhSachQuanLyKhoa: [{
    NhanVienID: ObjectId          // Quản lý khoa
  }]
}
```

---

## 3. NOTIFICATION TYPES

### 3.1. Request Lifecycle (8 types)

| #   | Type Code              | Trigger                | Recipients         |
| --- | ---------------------- | ---------------------- | ------------------ |
| 1   | `yeucau-tao-moi`       | Tạo yêu cầu mới        | arrNguoiDieuPhoiID |
| 2   | `yeucau-tiep-nhan`     | Điều phối tiếp nhận    | NguoiYeuCauID      |
| 3   | `yeucau-tu-choi`       | Từ chối yêu cầu        | NguoiYeuCauID      |
| 4   | `yeucau-dieu-phoi`     | Điều phối cho người XL | NguoiXuLyID        |
| 5   | `yeucau-gui-ve-khoa`   | Gửi về khoa yêu cầu    | NguoiYeuCauID      |
| 6   | `yeucau-hoan-thanh`    | Hoàn thành xử lý       | NguoiYeuCauID      |
| 7   | `yeucau-huy-tiep-nhan` | Hủy tiếp nhận          | NguoiYeuCauID      |
| 8   | `yeucau-dong`          | Đóng yêu cầu           | arrNguoiLienQuan   |

### 3.2. Updates & Actions (6 types)

| #   | Type Code                  | Trigger                 | Recipients       |
| --- | -------------------------- | ----------------------- | ---------------- |
| 9   | `yeucau-doi-thoi-gian-hen` | Đổi deadline            | NguoiYeuCauID    |
| 10  | `yeucau-danh-gia`          | Đánh giá sau hoàn thành | NguoiXuLyID      |
| 11  | `yeucau-mo-lai`            | Mở lại yêu cầu đã đóng  | arrNguoiLienQuan |
| 12  | `yeucau-xu-ly-tiep`        | Yêu cầu xử lý tiếp      | NguoiXuLyID      |
| 13  | `yeucau-sua`               | Cập nhật thông tin      | arrNguoiLienQuan |
| 14  | `yeucau-xoa`               | Xóa yêu cầu             | arrNguoiLienQuan |

### 3.3. Communication & Escalation (3 types)

| #   | Type Code            | Trigger              | Recipients       |
| --- | -------------------- | -------------------- | ---------------- |
| 15  | `yeucau-binh-luan`   | Comment mới          | arrNguoiLienQuan |
| 16  | `yeucau-nhac-lai`    | Nhắc nhở xử lý       | NguoiXuLyID      |
| 17  | `yeucau-bao-quan-ly` | Escalate lên quản lý | arrQuanLyKhoaID  |

---

## 4. VARIABLES

### 4.1. Common Variables

```javascript
{
  // IDs (String)
  _id: String,                    // YeuCau._id.toString()
  MaYeuCau: String,

  // Recipient candidates
  NguoiYeuCauID: String,
  NguoiXuLyID: String,
  arrNguoiDieuPhoiID: [String],   // Từ CauHinhThongBaoKhoa
  arrQuanLyKhoaID: [String],      // Từ CauHinhThongBaoKhoa
  arrNguoiLienQuan: [String],     // Computed

  // Display - Departments
  TenKhoaGui: String,             // KhoaYeuCauID?.TenKhoa || 'Khoa'
  TenKhoaNhan: String,            // KhoaDichID?.TenKhoa || 'Khoa'

  // Display - People
  TenNguoiYeuCau: String,
  TenNguoiXuLy: String,

  // Display - Category
  TenLoaiYeuCau: String,          // LoaiYeuCauID?.Ten || 'Yêu cầu'

  // Content
  TieuDe: String,
  MoTa: String,

  // Time
  ThoiGianHen: String,            // Formatted date
}
```

### 4.2. Type-Specific Variables

| Type                       | Extra Variables                     |
| -------------------------- | ----------------------------------- |
| `yeucau-tu-choi`           | `LyDoTuChoi`                        |
| `yeucau-dieu-phoi`         | `GhiChuDieuPhoi`                    |
| `yeucau-doi-thoi-gian-hen` | `ThoiGianHenCu`, `ThoiGianHenMoi`   |
| `yeucau-hoan-thanh`        | `KetQuaXuLy`                        |
| `yeucau-danh-gia`          | `DiemDanhGia`, `NoiDungDanhGia`     |
| `yeucau-binh-luan`         | `NoiDungComment`, `TenNguoiComment` |
| `yeucau-bao-quan-ly`       | `LyDoEscalate`                      |

---

## 5. BACKEND INTEGRATION

### 5.1. Service File

**Path**: `giaobanbv-be/modules/workmanagement/services/yeuCau.service.js`

| Line | Method           | Notification     |
| ---- | ---------------- | ---------------- |
| ~176 | `taoYeuCau()`    | yeucau-tao-moi   |
| ~315 | `suaYeuCau()`    | yeucau-sua       |
| ~835 | `themBinhLuan()` | yeucau-binh-luan |

### 5.2. State Machine

**Path**: `giaobanbv-be/modules/workmanagement/services/yeuCauStateMachine.js`

State machine tự động generate notification type từ action:

```javascript
// Line ~564
const typeCode = `yeucau-${action.toLowerCase().replace(/_/g, "-")}`;
// VD: "TIEP_NHAN" → "yeucau-tiep-nhan"
```

| Action               | Generated Type           |
| -------------------- | ------------------------ |
| `TIEP_NHAN`          | yeucau-tiep-nhan         |
| `TU_CHOI`            | yeucau-tu-choi           |
| `DIEU_PHOI`          | yeucau-dieu-phoi         |
| `GUI_VE_KHOA`        | yeucau-gui-ve-khoa       |
| `HOAN_THANH`         | yeucau-hoan-thanh        |
| `HUY_TIEP_NHAN`      | yeucau-huy-tiep-nhan     |
| `DOI_THOI_GIAN_HEN`  | yeucau-doi-thoi-gian-hen |
| `DANH_GIA`           | yeucau-danh-gia          |
| `DONG`               | yeucau-dong              |
| `MO_LAI`             | yeucau-mo-lai            |
| `YEU_CAU_XU_LY_TIEP` | yeucau-xu-ly-tiep        |
| `NHAC_LAI`           | yeucau-nhac-lai          |
| `BAO_QUAN_LY`        | yeucau-bao-quan-ly       |
| `XOA`                | yeucau-xoa               |

### 5.3. Service Pattern

```javascript
// Get coordinators from config
const cauHinh = await CauHinhThongBaoKhoa.findOne({
  KhoaID: yeuCau.KhoaDichID,
});
const arrNguoiDieuPhoiID =
  cauHinh?.DanhSachNguoiDieuPhoi.map((x) => x.NhanVienID.toString()) || [];

await notificationService.send({
  type: "yeucau-tao-moi",
  data: {
    _id: yeuCau._id.toString(),
    MaYeuCau: yeuCau.MaYeuCau,
    TieuDe: yeuCau.TieuDe,
    TenKhoaGui: populated.KhoaYeuCauID?.TenKhoa || "Khoa",
    TenKhoaNhan: populated.KhoaDichID?.TenKhoa || "Khoa",
    TenLoaiYeuCau: populated.LoaiYeuCauID?.Ten || "Yêu cầu",
    TenNguoiYeuCau: populated.NguoiYeuCauID?.HoTen || "Người dùng",
    arrNguoiDieuPhoiID,
  },
});
```

### 5.4. Populate Pattern

```javascript
const yeuCau = await YeuCau.findById(id)
  .populate("KhoaYeuCauID", "TenKhoa MaKhoa")
  .populate("KhoaDichID", "TenKhoa MaKhoa")
  .populate("NguoiYeuCauID", "HoTen Email")
  .populate("NguoiXuLyID", "HoTen Email")
  .populate("LoaiYeuCauID", "Ten MoTa");
```

---

## 6. FRONTEND INTEGRATION

### 6.1. Redux Slice

**Path**: `fe-bcgiaobanbvt/src/features/QuanLyCongViec/Ticket/yeuCauSlice.js`

| Thunk              | Endpoint                    | Triggers          |
| ------------------ | --------------------------- | ----------------- |
| `createYeuCau()`   | POST /yeucau                | yeucau-tao-moi    |
| `updateYeuCau()`   | PUT /yeucau/:id             | yeucau-sua        |
| `acceptYeuCau()`   | POST /yeucau/:id/tiep-nhan  | yeucau-tiep-nhan  |
| `rejectYeuCau()`   | POST /yeucau/:id/tu-choi    | yeucau-tu-choi    |
| `dispatchYeuCau()` | POST /yeucau/:id/dieu-phoi  | yeucau-dieu-phoi  |
| `completeYeuCau()` | POST /yeucau/:id/hoan-thanh | yeucau-hoan-thanh |
| `rateYeuCau()`     | POST /yeucau/:id/danh-gia   | yeucau-danh-gia   |
| `addComment()`     | POST /yeucau/:id/binh-luan  | yeucau-binh-luan  |

### 6.2. UI Pages

| Page/Component | User Actions           |
| -------------- | ---------------------- |
| YeuCauForm     | Create new request     |
| YeuCauDetail   | All actions, comments  |
| YeuCauList     | Quick actions          |
| DieuPhoiDialog | Dispatch to handler    |
| DanhGiaDialog  | Rate completed request |

---

## 7. RECIPIENT LOGIC

### 7.1. Coordinators (Điều phối viên)

```javascript
// Từ CauHinhThongBaoKhoa của khoa đích
const cauHinh = await CauHinhThongBaoKhoa.findOne({
  KhoaID: yeuCau.KhoaDichID,
});
const arrNguoiDieuPhoiID =
  cauHinh?.DanhSachNguoiDieuPhoi.map((x) => x.NhanVienID.toString()) || [];

recipientConfig: {
  useVariables: ["arrNguoiDieuPhoiID"];
}
```

### 7.2. Department Managers (Quản lý khoa)

```javascript
// Khi escalate
const arrQuanLyKhoaID =
  cauHinh?.DanhSachQuanLyKhoa.map((x) => x.NhanVienID.toString()) || [];

recipientConfig: {
  useVariables: ["arrQuanLyKhoaID"];
}
```

### 7.3. All Related (Computed)

```javascript
const arrNguoiLienQuan = [
  yeuCau.NguoiYeuCauID,
  yeuCau.NguoiXuLyID,
  ...arrNguoiDieuPhoiID,
]
  .filter(Boolean)
  .map((id) => id.toString());

// Exclude performer
const filtered = arrNguoiLienQuan.filter((id) => id !== performerId);
```

---

## 8. STATE MACHINE TRANSITIONS

### 8.1. Valid Transitions

```
MOI → DANG_XU_LY (TIEP_NHAN)
MOI → TU_CHOI (TU_CHOI)

DANG_XU_LY → DANG_XU_LY (DIEU_PHOI, DOI_THOI_GIAN_HEN, NHAC_LAI)
DANG_XU_LY → DA_HOAN_THANH (HOAN_THANH)
DANG_XU_LY → MOI (HUY_TIEP_NHAN)
DANG_XU_LY → Special (BAO_QUAN_LY - không đổi status)

DA_HOAN_THANH → DA_DONG (DANH_GIA, DONG)
DA_HOAN_THANH → DANG_XU_LY (YEU_CAU_XU_LY_TIEP)

DA_DONG → DANG_XU_LY (MO_LAI - within 7 days)
```

### 8.2. Action → Notification Flow

```javascript
// In yeuCauStateMachine.js
async fireNotificationTrigger(action, context) {
  const typeCode = `yeucau-${action.toLowerCase().replace(/_/g, '-')}`;

  await notificationService.send({
    type: typeCode,
    data: this.buildNotificationData(context)
  });
}
```

---

## 9. COMMON PITFALLS

| Issue              | Wrong                     | Correct                                         |
| ------------------ | ------------------------- | ----------------------------------------------- |
| LoaiYeuCau field   | `DanhMucYeuCauID`         | `LoaiYeuCauID` (alias)                          |
| Empty coordinators | Assume exists             | Check `cauHinh?.DanhSachNguoiDieuPhoi`          |
| Khoa name          | `KhoaYeuCauID` (ObjectId) | `KhoaYeuCauID?.TenKhoa` (populated)             |
| Date format        | `ThoiGianHen` (Date)      | `dayjs(ThoiGianHen).format('DD/MM/YYYY HH:mm')` |

---

## 10. SPECIAL CASES

### 10.1. Reopen within 7 days

```javascript
// MO_LAI only allowed within 7 days after DONG
const daysSinceClosed = dayjs().diff(dayjs(yeuCau.NgayDong), "day");
if (daysSinceClosed > 7) {
  throw new AppError(400, "Không thể mở lại sau 7 ngày");
}
```

### 10.2. No Handler Configured

```javascript
// Khi khoa chưa cấu hình điều phối viên
if (arrNguoiDieuPhoiID.length === 0) {
  console.warn(`Khoa ${yeuCau.KhoaDichID} chưa cấu hình điều phối viên`);
  // Yêu cầu vẫn tạo, nhưng không có ai nhận notification
}
```

### 10.3. Self-Request (Same Department)

```javascript
// Người gửi và nhận cùng khoa
if (yeuCau.KhoaYeuCauID.equals(yeuCau.KhoaDichID)) {
  // Có thể skip một số notifications hoặc handle khác
}
```

---

_Context file cho AI audit. Version 1.0_
