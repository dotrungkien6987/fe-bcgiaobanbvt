# Chu Kỳ Đánh Giá - Cycle Management Module

**Version:** 1.1  
**Last Updated:** 26/11/2025  
**Status:** ✅ Production Ready

## Tổng quan

Module quản lý chu kỳ đánh giá KPI theo tháng. Đơn giản hóa từ thiết kế 4-state workflow phức tạp thành chỉ 2 trạng thái: **Đang mở** và **Đã đóng**.

## Cấu trúc thư mục

```
ChuKyDanhGia/
├── index.js                      # Exports
├── ChuKyDanhGiaList.js           # Danh sách chu kỳ (Table + filter)
├── ChuKyDanhGiaView.js           # Chi tiết chu kỳ + actions
├── ThongTinChuKyDanhGia.js       # Form tạo/sửa
├── TieuChiConfigSection.js       # Component cấu hình tiêu chí đánh giá
├── AddChuKyDanhGiaButton.js      # Button thêm mới
├── UpdateChuKyDanhGiaButton.js   # Button chỉnh sửa
├── DeleteChuKyDanhGiaButton.js   # Button xóa (soft delete)
└── CYCLE_GUIDE.md                # Tài liệu này
```

## Schema

```javascript
{
  TenChuKy: String,          // "Tháng 1/2024" (auto-gen nếu để trống)
  Thang: Number,             // 1-12
  Nam: Number,               // >= 2020
  NgayBatDau: Date,          // required
  NgayKetThuc: Date,         // required, must > NgayBatDau
  isDong: Boolean,           // false = Đang mở, true = Đã đóng
  MoTa: String,              // maxlength 1000
  NguoiTaoID: ObjectId,      // ref NhanVien

  // ✅ Tiêu chí đánh giá được lưu trực tiếp trong chu kỳ
  TieuChiCauHinh: [{
    TenTieuChi: String,        // required, trim
    LoaiTieuChi: String,       // enum: "TANG_DIEM" | "GIAM_DIEM"
    GiaTriMin: Number,         // default: 0
    GiaTriMax: Number,         // default: 100
    DonVi: String,             // default: "%"
    ThuTu: Number,             // thứ tự hiển thị
    GhiChu: String,            // maxlength 500
    IsMucDoHoanThanh: Boolean  // true = FIXED tiêu chí tự đánh giá
  }],

  isDeleted: Boolean,        // Soft delete
  createdAt: Date,
  updatedAt: Date
}

// Indexes: (Thang, Nam), (isDong)
// Note: Unique index (Thang, Nam) - Không cho tạo 2 chu kỳ cùng tháng/năm
```

### TieuChiCauHinh - Tiêu chí đánh giá

Mỗi chu kỳ có bộ tiêu chí riêng, được lưu trong array `TieuChiCauHinh`:

- **IsMucDoHoanThanh = true**: Tiêu chí FIXED "Mức độ hoàn thành công việc"
  - Nhân viên được phép tự đánh giá
  - Chỉ có 1 tiêu chí FIXED trong mỗi chu kỳ
  - Hiển thị read-only trong UI (không cho xóa/sửa tên)
- **IsMucDoHoanThanh = false**: Tiêu chí user-defined
  - Admin tự tạo theo nhu cầu
  - Có thể thêm/sửa/xóa

## Luồng hoạt động

### 1. Tạo chu kỳ mới

- Admin mở form → Nhập Tháng/Năm/NgayBatDau/NgayKetThuc/MoTa
- Validate:
  - Check duplicate (Thang, Nam)
  - NgayKetThuc > NgayBatDau
- Tạo mới với `isDong = false` (Đang mở)

### 2. Đóng chu kỳ

- Click button "Đóng chu kỳ" → `isDong = true`
- Lúc này có thể mở chu kỳ mới hoặc mở lại chu kỳ đã đóng

### 3. Mở lại chu kỳ

- Click button "Mở lại chu kỳ" → `isDong = false`
- Validate: Không cho phép mở nếu đã có chu kỳ khác đang mở

### 4. Xóa chu kỳ

**Business Rules (Simplified Cascade Validation):**

1. **Không cho xóa chu kỳ đã hoàn thành** (`isDong = true`)

   - Lý do: Cần giữ lại lịch sử để kiểm toán và báo cáo
   - UI: Nút xóa bị disabled với tooltip giải thích

2. **Kiểm tra dữ liệu liên quan** (DanhGiaKPI)

   - Backend đếm số bản đánh giá KPI liên quan
   - Nếu `soDanhGia > 0` → Reject với message chi tiết
   - Error message: "Không thể xóa chu kỳ đánh giá vì đã có X bản đánh giá liên quan..."

3. **Auto-đóng trước khi xóa**
   - Nếu chu kỳ đang mở (`isDong = false`) NHƯNG không có đánh giá
   - Backend tự động set `isDong = true` trước khi soft delete

**Flow:**

```
User click "Xóa"
  ↓
Backend validate:
  ├─ isDong = true? → Reject (giữ audit trail)
  ├─ Có DanhGiaKPI? → Reject (có dữ liệu liên quan)
  └─ isDong = false & không có DanhGiaKPI? → Auto đóng → Cho phép xóa
  ↓
Soft delete: isDeleted = true
  ↓
Frontend: Hiển thị success/error message rõ ràng
```

**Ưu điểm so với design cũ:**

- ✅ Đơn giản: Không cần thêm trạng thái "DA_XOA", "HUY"
- ✅ An toàn: Backend validate cascade trước khi xóa
- ✅ User-friendly: Error message chi tiết từ backend
- ✅ Phù hợp pattern hiện tại của hệ thống

## API Endpoints

```
GET    /api/workmanagement/chu-ky-danh-gia              # Danh sách (filter: isDong, thang, nam)
GET    /api/workmanagement/chu-ky-danh-gia/list         # Danh sách đơn giản (cho dropdown)
GET    /api/workmanagement/chu-ky-danh-gia/auto-select  # Tự động chọn chu kỳ phù hợp (ngày hiện tại + 5 ngày)
GET    /api/workmanagement/chu-ky-danh-gia/previous-criteria  # Lấy tiêu chí từ chu kỳ trước (adminRequired)
GET    /api/workmanagement/chu-ky-danh-gia/dang-mo      # Lấy chu kỳ đang mở
GET    /api/workmanagement/chu-ky-danh-gia/:id          # Chi tiết
POST   /api/workmanagement/chu-ky-danh-gia              # Tạo mới (adminRequired)
PUT    /api/workmanagement/chu-ky-danh-gia/:id          # Cập nhật (adminRequired)
PUT    /api/workmanagement/chu-ky-danh-gia/:id/dong     # Đóng chu kỳ (adminRequired)
PUT    /api/workmanagement/chu-ky-danh-gia/:id/mo       # Mở lại chu kỳ (adminRequired)
DELETE /api/workmanagement/chu-ky-danh-gia/:id          # Xóa (soft delete, adminRequired)
```

## Redux Actions

```javascript
// Trong kpiSlice.js
getChuKyDanhGias(filters); // Lấy danh sách
getChuKyDanhGiaById(id); // Lấy chi tiết
createChuKyDanhGia(data); // Tạo mới
updateChuKyDanhGia({ id, data }); // Cập nhật
deleteChuKyDanhGia(id); // Xóa
dongChuKy(id); // Đóng chu kỳ
moChuKy(id); // Mở lại chu kỳ
```

## State Management

```javascript
state.kpi = {
  chuKyDanhGias: [],           // Danh sách tất cả chu kỳ
  selectedChuKyDanhGia: null,  // Chu kỳ đang xem chi tiết
  isLoading: false,
  error: null,
  ...
}
```

## Components

### ChuKyDanhGiaList

- **Mục đích**: Hiển thị danh sách chu kỳ với filter và search
- **Features**:
  - CommonTable với columns: STT, TenChuKy, NgayBatDau, NgayKetThuc, Trạng thái, MoTa, Actions
  - Filter chips: Tất cả / Đang mở / Đã đóng
  - Search by TenChuKy, MoTa
  - Toggle status button (Đóng/Mở chu kỳ)
  - CRUD buttons: View, Update, Delete

### ChuKyDanhGiaView

- **Mục đích**: Xem chi tiết và thao tác với chu kỳ
- **Features**:
  - Display all fields with InfoRow component
  - Toggle status button (primary action)
  - Update button
  - Delete button
  - Navigate back to list

### ThongTinChuKyDanhGia

- **Mục đích**: Form tạo/sửa chu kỳ
- **Validation**:
  - TenChuKy: maxlength 255 (optional, auto-gen)
  - Thang: required, 1-12, select native dropdown
  - Nam: required, >= 2020, number input
  - NgayBatDau: required, DatePicker
  - NgayKetThuc: required, DatePicker, must > NgayBatDau
  - MoTa: maxlength 1000, multiline

### TieuChiConfigSection

- **Mục đích**: Component cấu hình tiêu chí đánh giá cho chu kỳ
- **Props**:
  - `tieuChiList`: Array of criteria objects
  - `onChange`: (newList) => void
  - `onCopyFromPrevious`: () => void (optional)
  - `readOnly`: boolean (default: false)
- **Features**:
  - Tự động hiển thị FIXED criterion (IsMucDoHoanThanh) dạng read-only
  - Phân tách tiêu chí cố định và tiêu chí user-defined
  - Thêm/sửa/xóa tiêu chí
  - Copy tiêu chí từ chu kỳ trước (gọi API `/previous-criteria`)
  - Validate: TenTieuChi, LoaiTieuChi, GiaTriMin/Max, DonVi

## So sánh với design cũ

| Feature       | Design cũ                                                 | Design mới                                   |
| ------------- | --------------------------------------------------------- | -------------------------------------------- |
| Trạng thái    | 4 states (CHUAN_BI, DANG_HOAT_DONG, DANH_GIA, HOAN_THANH) | 2 states (isDong: true/false)                |
| Loại chu kỳ   | 4 types (HANG_THANG, QUY, NAM, TUY_CHINH)                 | Fixed: Monthly (Thang/Nam)                   |
| Workflow      | batDau() → ketThuc()                                      | dongChuKy() ↔ moChuKy()                      |
| API endpoints | 9 endpoints                                               | 8 endpoints (simplified)                     |
| Frontend      | 3 files (Table, FormDialog, Page)                         | 7 files (List, View, Form, 3 Buttons, index) |
| State methods | 7 instance/static methods                                 | 1 static method (layChuKyDangMo)             |

## Benefits

1. **Đơn giản hơn**: Chỉ quan tâm đến đóng/mở thay vì 4 trạng thái phức tạp
2. **Consistent**: Follow pattern TieuChiDanhGia (7 files, soft delete, AdminRequired)
3. **Validate tốt hơn**: Unique index (Thang, Nam), không cho mở 2 chu kỳ cùng lúc
4. **Maintainable**: Code rõ ràng, dễ hiểu, ít bug
5. **Flexible**: Dễ mở rộng nếu cần thêm tính năng sau này

## Usage Example

```javascript
// Lấy danh sách chu kỳ đang mở
dispatch(getChuKyDanhGias({ isDong: false }));

// Tạo chu kỳ mới
dispatch(
  createChuKyDanhGia({
    Thang: 1,
    Nam: 2024,
    NgayBatDau: "2024-01-01",
    NgayKetThuc: "2024-01-31",
    MoTa: "Chu kỳ đánh giá tháng 1",
  })
);

// Đóng chu kỳ
dispatch(dongChuKy(chuKyId));

// Mở lại chu kỳ (validate: không có chu kỳ nào đang mở)
dispatch(moChuKy(chuKyId));
```

## Routes

```javascript
/quanlycongviec/kpi/chu-ky        → ChuKyDanhGiaList
/quanlycongviec/kpi/chu-ky/:id    → ChuKyDanhGiaView
```

## Menu Integration

Menu item đã tồn tại tại:

```
Quản lý công việc → KPI → Chu kỳ đánh giá
```

## Notes

- **Soft delete**: Xóa logic không xóa database, chỉ set `isDeleted = true`
- **Admin only**: Tất cả mutation operations yêu cầu admin role
- **Unique constraint**: Không cho tạo 2 chu kỳ cùng Tháng/Năm
- **Single open cycle**: Chỉ cho phép 1 chu kỳ mở tại 1 thời điểm
- **Auto-generate TenChuKy**: Nếu để trống, tự động tạo từ `Tháng ${Thang}/${Nam}`
- **Delete validation**: Cascade check trước khi xóa - kiểm tra DanhGiaKPI liên quan

## Related Documentation

- [../KPI/docs/WORKFLOW.md](../KPI/docs/WORKFLOW.md) - Quy trình nghiệp vụ đầy đủ của hệ thống KPI
- [../KPI/docs/ARCHITECTURE.md](../KPI/docs/ARCHITECTURE.md) - Kiến trúc tổng quan KPI module
- [../KPI/docs/FORMULA_CALCULATION.md](../KPI/docs/FORMULA_CALCULATION.md) - Công thức tính điểm KPI
