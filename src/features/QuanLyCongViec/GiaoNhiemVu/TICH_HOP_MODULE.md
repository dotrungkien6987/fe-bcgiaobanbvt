# Tích Hợp Module - GiaoNhiemVu V3.0

**Phiên bản:** 3.0  
**Dependencies:** ChuKyDanhGia, DanhGiaKPI, NhiemVuThuongQuy, QuanLyNhanVien  
**Cập nhật:** 26/11/2025

---

## 📋 Mục Lục

- [Tổng Quan Tích Hợp](#tổng-quan-tích-hợp)
- [Module ChuKyDanhGia](#module-chukydanhgia)
- [Module DanhGiaKPI](#module-danhgiakpi)
- [Module NhiemVuThuongQuy](#module-nhiemvuthuongquy)
- [Module QuanLyNhanVien](#module-quanlynhanvien)
- [Luồng Dữ Liệu Tích Hợp](#luồng-dữ-liệu-tích-hợp)

---

## 🎯 Tổng Quan Tích Hợp

Module **GiaoNhiemVu** phụ thuộc chặt chẽ vào **4 modules khác**:

```
┌────────────────────────────────────────────────────────┐
│                   GIAONHIEMVU                         │
│           (Phân công nhiệm vụ theo chu kỳ)            │
└───────────────────┬────────────────────────────────────┘
                    │
        ┌───────────┼───────────┬───────────┐
        │           │           │           │
        ▼           ▼           ▼           ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ ChuKy    │ │ DanhGia  │ │ NhiemVu  │ │ QuanLy   │
│ DanhGia  │ │ KPI      │ │ ThuongQuy│ │ NhanVien │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

### Phân Loại Dependencies

| Module               | Quan hệ                               | Mức độ phụ thuộc  |
| -------------------- | ------------------------------------- | ----------------- |
| **ChuKyDanhGia**     | N:1 (Nhiều phân công thuộc 1 chu kỳ)  | ⚠️ **Cao**        |
| **DanhGiaKPI**       | 1:N (1 chu kỳ có nhiều đánh giá)      | ⚠️ **Cao**        |
| **NhiemVuThuongQuy** | N:1 (Nhiều phân công cùng 1 nhiệm vụ) | ⚠️ **Cao**        |
| **QuanLyNhanVien**   | N:1 (Nhiều nhân viên thuộc 1 quản lý) | ✅ **Trung bình** |

---

## 📅 Module ChuKyDanhGia

### Quan Hệ Database

```javascript
// Model: NhanVienNhiemVu
{
  ChuKyDanhGiaID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ChuKyDanhGia",
    required: true, // ← BẮT BUỘC phải có chu kỳ
  }
}
```

### Schema ChuKyDanhGia

```javascript
// Model: ChuKyDanhGia
{
  TenChuKy: String, // "Quý 1/2025"
  TuNgay: Date, // Ngày bắt đầu
  DenNgay: Date, // Ngày kết thúc
  isDong: Boolean, // Đã đóng hay chưa (default: false)
  createdAt: Date,
  updatedAt: Date
}
```

### Cách Sử Dụng

#### Frontend: Lấy Danh Sách Chu Kỳ

```javascript
// CycleAssignmentListPage.js
const [cycles, setCycles] = useState([]);

useEffect(() => {
  const fetchCycles = async () => {
    const response = await apiService.get("/workmanagement/chu-ky-danh-gia");
    setCycles(response.data.data);
  };
  fetchCycles();
}, []);
```

#### Backend: Kiểm Tra Chu Kỳ

```javascript
// giaoNhiemVu.service.js
const chuKy = await ChuKyDanhGia.findById(chuKyId);

if (!chuKy) {
  throw new AppError(404, "Không tìm thấy chu kỳ", "CYCLE_NOT_FOUND");
}

if (chuKy.isDong) {
  throw new AppError(403, "Chu kỳ đã đóng", "CYCLE_CLOSED");
}
```

### Business Rules

1. **Không thể gán nhiệm vụ** nếu chu kỳ đã đóng (`isDong = true`)
2. **Mỗi phân công** phải thuộc về đúng 1 chu kỳ
3. **Sao chép chu kỳ:** Chỉ sao chép từ chu kỳ liền trước (TuNgay < current.TuNgay)

### API Tích Hợp

| Endpoint                              | Method | Mô tả                 |
| ------------------------------------- | ------ | --------------------- |
| `/workmanagement/chu-ky-danh-gia`     | GET    | Lấy danh sách chu kỳ  |
| `/workmanagement/chu-ky-danh-gia/:id` | GET    | Lấy chi tiết 1 chu kỳ |

---

## 📊 Module DanhGiaKPI

### Quan Hệ Database

```javascript
// Model: DanhGiaKPI
{
  NhanVienID: ObjectId (ref: "NhanVien"),
  ChuKyDanhGiaID: ObjectId (ref: "ChuKyDanhGia"),
  TrangThai: String, // "CHUA_DUYET" | "DA_DUYET"
  TongDiemKPI: Number, // Tổng điểm (sau khi duyệt)
  NguoiDuyetID: ObjectId (ref: "User"),
  NgayDuyet: Date,
  LichSuHuyDuyet: [
    {
      NguoiHuy: ObjectId,
      LyDo: String,
      NgayHuy: Date,
      SnapshotDiem: Number,
    },
  ],
}
```

### Schema DanhGiaNhiemVuThuongQuy (Chi Tiết)

```javascript
// Model: DanhGiaNhiemVuThuongQuy
{
  DanhGiaKPIID: ObjectId (ref: "DanhGiaKPI"),
  NhiemVuID: ObjectId (ref: "NhiemVuThuongQuy"),
  ChiTietDiem: [
    {
      TieuChiConID: ObjectId,
      Diem: Number, // Điểm quản lý chấm (0-100)
    },
  ],
}
```

### Cách Sử Dụng

#### Backend: Kiểm Tra KPI Đã Duyệt

```javascript
// giaoNhiemVu.service.js
const danhGiaKPI = await DanhGiaKPI.findOne({
  NhanVienID: nhanVienId,
  ChuKyDanhGiaID: chuKyId,
});

if (danhGiaKPI && danhGiaKPI.TrangThai === "DA_DUYET") {
  throw new AppError(403, "KPI đã được duyệt", "KPI_APPROVED");
}
```

#### Backend: Kiểm Tra Điểm Quản Lý (Layer 4)

```javascript
// giaoNhiemVu.service.js
const danhGia = await DanhGiaNhiemVuThuongQuy.findOne({
  DanhGiaKPIID: danhGiaKPI?._id,
  NhiemVuID: assignment.NhiemVuID._id,
});

if (danhGia && danhGia.ChiTietDiem && danhGia.ChiTietDiem.length > 0) {
  throw new AppError(403, "Quản lý đã chấm điểm", "HAS_MANAGER_SCORE");
}
```

### Business Rules

1. **Không thể thay đổi phân công** nếu KPI đã duyệt
2. **Không thể xóa nhiệm vụ** nếu quản lý đã chấm điểm
3. **Hủy duyệt KPI** sẽ lưu snapshot điểm vào `LichSuHuyDuyet`

### Công Thức Tính Điểm

```javascript
// Với nhiệm vụ có "mức độ hoàn thành"
DiemNhiemVu = (DiemQL × 2 + DiemTuDanhGia) / 3

// Ví dụ:
// DiemQL = 90, DiemTuDanhGia = 85, MucDoKho = 1.5
// → DiemNhiemVu = (90 × 2 + 85) / 3 = 88.33
// → TrongSo = 1.5 / TongMucDoKho
// → DiemCuoi = DiemNhiemVu × TrongSo
```

---

## 📋 Module NhiemVuThuongQuy

### Quan Hệ Database

```javascript
// Model: NhanVienNhiemVu
{
  NhiemVuID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "NhiemVuThuongQuy",
    required: true,
  }
}
```

### Schema NhiemVuThuongQuy

```javascript
// Model: NhiemVuThuongQuy
{
  Ten: String, // Tên nhiệm vụ
  MoTa: String, // Mô tả chi tiết
  PhongBanID: ObjectId (ref: "PhongBan"), // Khoa/Phòng ban
  TieuChiDanhGiaID: ObjectId (ref: "TieuChi"), // Tiêu chí đánh giá
  isActive: Boolean, // Còn hoạt động hay không (default: true)
  createdAt: Date,
  updatedAt: Date
}
```

### Cách Sử Dụng

#### Backend: Lấy Nhiệm Vụ Khả Dụng

```javascript
// giaoNhiemVu.service.js
const nhanVien = await NhanVien.findById(nhanVienId).populate("PhongBanID");

// Lọc nhiệm vụ theo khoa của nhân viên
const availableDuties = await NhiemVuThuongQuy.find({
  PhongBanID: nhanVien.PhongBanID._id,
  isActive: true, // Chỉ lấy nhiệm vụ còn hoạt động
}).populate("TieuChiDanhGiaID");
```

#### Backend: Populate Nhiệm Vụ

```javascript
// Backend response
const assignments = await NhanVienNhiemVu.find({
  NhanVienID: nhanVienId,
  ChuKyDanhGiaID: chuKyId,
})
  .populate({
    path: "NhiemVuID",
    populate: {
      path: "TieuChiDanhGiaID",
      select: "TenTieuChi",
    },
  })
  .lean();
```

### Business Rules

1. **Nhiệm vụ khả dụng** được lọc theo khoa của nhân viên (`PhongBanID`)
2. **Chỉ hiển thị nhiệm vụ** còn hoạt động (`isActive = true`)
3. **Sao chép chu kỳ:** Kiểm tra nhiệm vụ cũ còn tồn tại không

---

## 👥 Module QuanLyNhanVien

### Quan Hệ Database

```javascript
// Model: QuanLyNhanVien
{
  QuanLyID: ObjectId (ref: "NhanVien"), // ID quản lý
  NhanVienID: ObjectId (ref: "NhanVien"), // ID nhân viên
  TuNgay: Date, // Ngày bắt đầu quản lý
  DenNgay: Date, // Ngày kết thúc (null = đang quản lý)
  createdAt: Date,
  updatedAt: Date
}
```

### Cách Sử Dụng

#### Backend: Lấy Nhân Viên Thuộc Quyền Quản Lý

```javascript
// giaoNhiemVu.service.js
const { user } = req; // Từ JWT token

// Lấy danh sách nhân viên quản lý
const managedEmployees = await QuanLyNhanVien.find({
  QuanLyID: user.NhanVienID, // ← QUAN TRỌNG: Dùng NhanVienID, không phải user._id
  DenNgay: null, // Đang quản lý
}).populate({
  path: "NhanVienID",
  select: "HoTen MaNV Email PhongBanID",
  populate: {
    path: "PhongBanID",
    select: "TenPhongBan",
  },
});

const employeeIds = managedEmployees.map((e) => e.NhanVienID._id);
```

#### Backend: Kiểm Tra Quyền Quản Lý

```javascript
// Middleware: checkManagerPermission
const hasPermission = await QuanLyNhanVien.findOne({
  QuanLyID: user.NhanVienID,
  NhanVienID: employeeId,
  DenNgay: null,
});

if (!hasPermission) {
  throw new AppError(
    403,
    "Bạn không có quyền quản lý nhân viên này",
    "FORBIDDEN"
  );
}
```

### Business Rules

1. **Chỉ quản lý mới thấy** nhân viên thuộc quyền quản lý
2. **Admin** có thể thấy tất cả nhân viên
3. **Nhân viên** chỉ thấy dữ liệu của chính mình

---

## 🔄 Luồng Dữ Liệu Tích Hợp

### Use Case: Quản Lý Gán Nhiệm Vụ

```
1. Frontend: Chọn chu kỳ "Q1/2025"
   ↓
2. API: GET /employees-with-cycle-stats?chuKyId=xxx
   ↓
3. Backend xử lý:
   a) Lấy danh sách nhân viên từ QuanLyNhanVien
      → employeeIds = ["id1", "id2", "id3"]

   b) Aggregate NhanVienNhiemVu:
      → Count số nhiệm vụ đã gán
      → Sum tổng độ khó

   c) Join với ChuKyDanhGia:
      → Lấy TenChuKy, TuNgay, DenNgay, isDong

   d) Trả về frontend
   ↓
4. Frontend hiển thị bảng nhân viên với thống kê
   ↓
5. Click [Gán] → Navigate to detail page
   ↓
6. API: GET /nhan-vien/:id/by-cycle?chuKyId=xxx
   ↓
7. Backend xử lý:
   a) Lấy phân công hiện tại (NhanVienNhiemVu):
      → Populate NhiemVuID, TieuChiDanhGiaID

   b) Lấy nhiệm vụ khả dụng (NhiemVuThuongQuy):
      → Filter theo PhongBanID của nhân viên
      → Filter isActive = true

   c) Trả về frontend
   ↓
8. Frontend hiển thị giao diện hai cột
   ↓
9. User thêm/sửa/xóa nhiệm vụ → Click [Lưu tất cả]
   ↓
10. API: PUT /nhan-vien/:id/cycle-assignments
   ↓
11. Backend validate 4-layer:
    a) Check ChuKyDanhGia.isDong ← TÍCH HỢP MODULE
    b) Check DanhGiaKPI.TrangThai ← TÍCH HỢP MODULE
    c) Check NhanVienNhiemVu.DiemTuDanhGia
    d) Check DanhGiaNhiemVuThuongQuy ← TÍCH HỢP MODULE
   ↓
12. Nếu PASS → Transaction update
    a) Delete old assignments
    b) Update changed assignments
    c) Insert new assignments
   ↓
13. Trả về frontend → Toast thành công
```

---

## 🎉 Kết Luận

Module **GiaoNhiemVu V3.0** tích hợp chặt chẽ với **4 modules**:

✅ **ChuKyDanhGia:** Phân công theo chu kỳ, kiểm tra chu kỳ đã đóng  
✅ **DanhGiaKPI:** Kiểm tra KPI đã duyệt, kiểm tra điểm quản lý  
✅ **NhiemVuThuongQuy:** Lấy nhiệm vụ khả dụng, populate thông tin  
✅ **QuanLyNhanVien:** Phân quyền quản lý, lọc nhân viên

**Đánh giá:**

- **Độ phụ thuộc:** Cao (4 modules)
- **Tính nhất quán:** Cao (foreign key đầy đủ)
- **Dễ bảo trì:** Trung bình (cần hiểu rõ 4 modules)

---

**Cập nhật cuối:** 26/11/2025  
**Tác giả:** GitHub Copilot (Claude Sonnet 4.5)  
**Phiên bản tài liệu:** 1.0.0
