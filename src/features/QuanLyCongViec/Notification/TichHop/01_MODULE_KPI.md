# 📊 MODULE KPI - NGỮ CẢNH CHO AI

> **Mục đích**: Context cho AI khi audit notification module KPI
> **Notifications**: 7 types
> **Cập nhật**: December 23, 2025

---

## 1. TỔNG QUAN NGHIỆP VỤ

### 1.1. Mô tả

Module KPI quản lý quy trình đánh giá năng lực nhân viên theo chu kỳ (tháng/quý/năm).

### 1.2. Workflow chính

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌──────────┐    ┌──────────┐
│ Tạo đánh giá │ → │ Tự đánh giá  │ → │ Chấm điểm   │ → │  Duyệt   │ → │ Phản hồi │
│  (Manager)   │    │  (Employee)  │    │  (Manager)  │    │(Manager) │    │(Employee)│
└─────────────┘    └──────────────┘    └─────────────┘    └──────────┘    └──────────┘
     ↓                    ↓                   ↓                ↓               ↓
kpi-tao-danh-gia   kpi-tu-danh-gia   kpi-cap-nhat-diem-ql  kpi-duyet-*   kpi-phan-hoi
```

### 1.3. Trạng thái

| Giá trị      | Mô tả                                        |
| ------------ | -------------------------------------------- |
| `CHUA_DUYET` | Chưa duyệt - Cho phép tự đánh giá, chấm điểm |
| `DA_DUYET`   | Đã duyệt - Cho phép hủy duyệt, phản hồi      |

---

## 2. ENTITIES

### 2.1. DanhGiaKPI

```javascript
{
  _id: ObjectId,
  ChuKyDanhGiaID: ObjectId,       // → ChuKyDanhGia
  NhanVienID: ObjectId,           // → NhanVien (người được đánh giá)
  NguoiDanhGiaID: ObjectId,       // → NhanVien (quản lý)
  TrangThai: "CHUA_DUYET" | "DA_DUYET",
  TongDiemKPI: Number,
  NgayDuyet: Date
}
```

### 2.2. ChuKyDanhGia

```javascript
{
  _id: ObjectId,
  TenChuKy: String,               // "Tháng 12/2025"
  TuNgay: Date,
  DenNgay: Date,
  LoaiChuKy: "THANG" | "QUY" | "NAM"
}
```

### 2.3. NhanVien

```javascript
{
  _id: ObjectId,
  HoTen: String,
  Email: String,
  PhongBanID: ObjectId
}
```

---

## 3. NOTIFICATION TYPES

| #   | Type Code              | Trigger                     | Recipients     | Priority |
| --- | ---------------------- | --------------------------- | -------------- | -------- |
| 1   | `kpi-tao-danh-gia`     | Manager tạo đánh giá        | NhanVienID     | HIGH     |
| 2   | `kpi-tu-danh-gia`      | Employee tự đánh giá xong   | NguoiDanhGiaID | MEDIUM   |
| 3   | `kpi-cap-nhat-diem-ql` | Manager cập nhật điểm       | NhanVienID     | MEDIUM   |
| 4   | `kpi-duyet-danh-gia`   | Manager duyệt KPI           | NhanVienID     | HIGH     |
| 5   | `kpi-duyet-tieu-chi`   | Manager duyệt theo tiêu chí | NhanVienID     | MEDIUM   |
| 6   | `kpi-huy-duyet`        | Manager hủy duyệt           | NhanVienID     | HIGH     |
| 7   | `kpi-phan-hoi`         | Employee gửi phản hồi       | NguoiDanhGiaID | LOW      |

---

## 4. VARIABLES

### 4.1. Common Variables

```javascript
{
  // IDs (String, không phải ObjectId)
  _id: String,                    // DanhGiaKPI._id.toString()
  NhanVienID: String,             // Recipient candidate
  NguoiDanhGiaID: String,         // Recipient candidate

  // Display names (có fallback)
  TenNhanVien: String,            // nhanVien?.HoTen || 'Nhân viên'
  TenNguoiDanhGia: String,        // nguoiDanhGia?.HoTen || 'Quản lý'
  TenChuKy: String,               // chuKy?.TenChuKy || 'Chu kỳ đánh giá'

  // Scores
  TongDiemKPI: Number,
  DiemTuDanhGia: Number,
  DiemQL: Number
}
```

### 4.2. Type-Specific Variables

| Type                   | Extra Variables                   |
| ---------------------- | --------------------------------- |
| `kpi-tao-danh-gia`     | `Deadline` (formatted date)       |
| `kpi-duyet-*`          | `TongDiemKPI`, `XepLoai`          |
| `kpi-huy-duyet`        | `LyDoHuyDuyet` (required)         |
| `kpi-cap-nhat-diem-ql` | `TenTieuChi`, `DiemMoi`, `DiemCu` |
| `kpi-tu-danh-gia`      | `DiemTuDanhGia`                   |
| `kpi-phan-hoi`         | `NoiDungPhanHoi`                  |

---

## 5. BACKEND INTEGRATION

### 5.1. Controller File

**Path**: `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`

| Line  | Method            | Notification         |
| ----- | ----------------- | -------------------- |
| ~136  | `taoDanhGia()`    | kpi-tao-danh-gia     |
| ~491  | `capNhatDiemQL()` | kpi-cap-nhat-diem-ql |
| ~667  | `duyetDanhGia()`  | kpi-duyet-danh-gia   |
| ~783  | `phanHoi()`       | kpi-phan-hoi         |
| ~1843 | `duyetTieuChi()`  | kpi-duyet-tieu-chi   |
| ~2214 | `huyDuyet()`      | kpi-huy-duyet        |

### 5.2. Service Pattern

```javascript
// Import
const notificationService = require("../services/notificationService");

// Usage
await notificationService.send({
  type: "kpi-duyet-danh-gia",
  data: {
    _id: danhGia._id.toString(),
    NhanVienID: danhGia.NhanVienID.toString(),
    TenNhanVien: nhanVien?.HoTen || "Nhân viên",
    TenNguoiDanhGia: nguoiDanhGia?.HoTen || "Quản lý",
    TenChuKy: chuKy?.TenChuKy || "Chu kỳ",
    TongDiemKPI: danhGia.TongDiemKPI || 0,
  },
});
```

### 5.3. Populate Pattern

```javascript
const danhGia = await DanhGiaKPI.findById(id)
  .populate("NhanVienID", "HoTen Email")
  .populate("NguoiDanhGiaID", "HoTen Email")
  .populate("ChuKyDanhGiaID", "TenChuKy TuNgay DenNgay");
```

---

## 6. FRONTEND INTEGRATION

### 6.1. Redux Slices

**Path**: `fe-bcgiaobanbvt/src/features/QuanLyCongViec/KPI/`

| Thunk              | Endpoint                           | Triggers           |
| ------------------ | ---------------------------------- | ------------------ |
| `createDanhGia()`  | POST /kpi/danhgia                  | kpi-tao-danh-gia   |
| `approveDanhGia()` | POST /kpi/danhgia/:id/duyet        | kpi-duyet-danh-gia |
| `rejectDanhGia()`  | POST /kpi/danhgia/:id/huy-duyet    | kpi-huy-duyet      |
| `selfEvaluate()`   | POST /kpi/nhanvien/:id/tu-danh-gia | kpi-tu-danh-gia    |
| `addFeedback()`    | POST /kpi/danhgia/:id/phan-hoi     | kpi-phan-hoi       |

### 6.2. UI Pages

| Page           | User Actions            |
| -------------- | ----------------------- |
| DanhGiaKPIPage | Approve, Reject buttons |
| TuDanhGiaPage  | Submit self-evaluation  |
| ChiTietKPIPage | Add feedback form       |

---

## 7. RECIPIENT LOGIC

### 7.1. Pattern

```javascript
// Notification cho Employee (nhân viên nhận)
recipientConfig: {
  useVariables: ["NhanVienID"];
}

// Notification cho Manager (quản lý nhận)
recipientConfig: {
  useVariables: ["NguoiDanhGiaID"];
}
```

### 7.2. Resolution

```
NhanVienID (String)
    ↓
User.findOne({ NhanVienID: nhanVienId })
    ↓
User._id (actual recipient)
```

---

## 8. COMMON PITFALLS

| Issue            | Wrong             | Correct                            |
| ---------------- | ----------------- | ---------------------------------- |
| User vs NhanVien | `userId`          | `NhanVienID`                       |
| ObjectId format  | `ObjectId("...")` | `"..."` (String)                   |
| Missing fallback | `nhanVien.HoTen`  | `nhanVien?.HoTen \|\| 'Nhân viên'` |
| Date format      | `new Date()`      | `dayjs().format('DD/MM/YYYY')`     |

---

## 9. FORMULA

### Điểm Nhiệm Vụ

```javascript
// Có mức độ hoàn thành:
DiemNhiemVu = (DiemQL * 2 + DiemTuDanhGia) / 3;

// Không có:
DiemNhiemVu = DiemQL;
```

### Xếp loại

| Điểm  | Xếp loại |
| ----- | -------- |
| >= 90 | A        |
| >= 75 | B        |
| >= 50 | C        |
| < 50  | D        |

---

_Context file cho AI audit. Version 1.0_
