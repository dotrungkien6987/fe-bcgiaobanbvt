# 📋 SCHEMA QUICK REFERENCE - WorkManagement Entities

> **Mục đích**: Tra cứu nhanh fields của các entity chính khi audit notification templates  
> **Cập nhật**: 18/12/2025 (Sau fix YEUCAU_DISPATCHED)

---

## 1️⃣ YeuCau (Ticket System)

### Schema Path

`giaobanbv-be/modules/workmanagement/models/YeuCau.js`

### Core Fields (thường dùng trong notification)

| Field Name                   | Type     | Ref Model         | Populate Field       | Notes                                     |
| ---------------------------- | -------- | ----------------- | -------------------- | ----------------------------------------- |
| `_id`                        | ObjectId | -                 | -                    | Primary key                               |
| `MaYeuCau`                   | String   | -                 | -                    | Format: YC2025000001                      |
| `TieuDe`                     | String   | -                 | -                    | Tiêu đề yêu cầu                           |
| `MoTa`                       | String   | -                 | -                    | Mô tả chi tiết                            |
| `TrangThai`                  | String   | -                 | -                    | MOI/DANG_XU_LY/TU_CHOI/HOAN_THANH/DA_DONG |
| **`NguoiYeuCauID`** ✅       | ObjectId | **NhanVien**      | `.Ten`               | Người tạo yêu cầu                         |
| **`KhoaNguonID`** ✅         | ObjectId | **Khoa**          | `.TenKhoa`           | Khoa nguồn (người gửi)                    |
| **`KhoaDichID`** ✅          | ObjectId | **Khoa**          | `.TenKhoa`           | Khoa đích (người nhận)                    |
| `LoaiNguoiNhan`              | String   | -                 | -                    | KHOA hoặc CA_NHAN                         |
| `NguoiNhanID`                | ObjectId | NhanVien          | `.Ten`               | Nếu gửi cá nhân                           |
| **`DanhMucYeuCauID`** ✅     | ObjectId | **DanhMucYeuCau** | **`.TenLoaiYeuCau`** | ⚠️ KHÔNG PHẢI `LoaiYeuCauID`!             |
| **`NguoiDieuPhoiID`** ✅     | ObjectId | **NhanVien**      | `.Ten`               | Người điều phối                           |
| **`NguoiDuocDieuPhoiID`** ✅ | ObjectId | **NhanVien**      | `.Ten`               | Người được giao xử lý                     |
| **`NguoiXuLyID`** ✅         | ObjectId | **NhanVien**      | `.Ten`               | Người thực tế xử lý (sau tiếp nhận)       |
| `ThoiGianHen`                | Date     | -                 | -                    | Deadline                                  |
| `NgayTiepNhan`               | Date     | -                 | -                    |                                           |
| `NgayHoanThanh`              | Date     | -                 | -                    |                                           |
| `NgayDong`                   | Date     | -                 | -                    |                                           |
| `LyDoTuChoiID`               | ObjectId | LyDoTuChoi        | `.TenLyDo`           |                                           |
| `DanhGia`                    | Object   | -                 | `.SoSao`, `.NhanXet` | Embedded schema                           |

### ⚠️ COMMON PITFALLS

1. **`LoaiYeuCauID`** ❌ → Sai! Field đúng là **`DanhMucYeuCauID`** ✅
2. **`TenLoai`** ❌ → Sai! Field trong DanhMucYeuCau là **`TenLoaiYeuCau`** ✅
3. **`NguoiNhanID`** có thể null nếu `LoaiNguoiNhan = "KHOA"`
4. **`NguoiDuocDieuPhoiID`** vs **`NguoiXuLyID`**: Khác nhau! DuocDieuPhoi = chờ tiếp nhận, XuLy = đã tiếp nhận

### Standard Populate Pattern

```javascript
const populated = await YeuCau.findById(id)
  .populate("NguoiYeuCauID", "Ten MaNhanVien")
  .populate("KhoaNguonID", "TenKhoa")
  .populate("KhoaDichID", "TenKhoa")
  .populate("NguoiDieuPhoiID", "Ten")
  .populate("NguoiDuocDieuPhoiID", "Ten")
  .populate("NguoiXuLyID", "Ten")
  .populate("DanhMucYeuCauID", "TenLoaiYeuCau") // ⚠️ TenLoaiYeuCau, không phải TenLoai
  .populate("LyDoTuChoiID", "TenLyDo")
  .lean();
```

---

## 2️⃣ CongViec (Task Management)

### Schema Path

`giaobanbv-be/modules/workmanagement/models/CongViec.js`

### Core Fields

| Field Name               | Type       | Ref Model        | Populate Field | Notes                                              |
| ------------------------ | ---------- | ---------------- | -------------- | -------------------------------------------------- |
| `_id`                    | ObjectId   | -                | -              | Primary key                                        |
| `MaCongViec`             | String     | -                | -              | Auto-generated                                     |
| `TenCongViec`            | String     | -                | -              | Task name                                          |
| `MoTa`                   | String     | -                | -              | Description                                        |
| `TrangThai`              | String     | -                | -              | MOI/DANG_THUC_HIEN/CHO_DUYET/HOAN_THANH/BI_TU_CHOI |
| **`NguoiGiaoViecID`** ✅ | ObjectId   | **NhanVien**     | `.Ten`         | Assigner                                           |
| **`NguoiChinhID`** ✅    | ObjectId   | **NhanVien**     | `.Ten`         | Main assignee                                      |
| **`NguoiThamGia`** ✅    | [ObjectId] | **NhanVien**     | `.Ten`         | Participants array                                 |
| `LoaiCongViec`           | String     | -                | -              | THUONG_QUY/DOT_XUAT/YEU_CAU                        |
| `MucDoUuTien`            | String     | -                | -              | THAP/TRUNG_BINH/CAO/KHAN_CAP                       |
| `NgayBatDau`             | Date       | -                | -              |                                                    |
| `NgayHetHan`             | Date       | -                | -              | Deadline                                           |
| `NgayHoanThanh`          | Date       | -                | -              |                                                    |
| **`ChuKyDanhGiaID`** ✅  | ObjectId   | **ChuKyDanhGia** | `.TenChuKy`    | KPI cycle                                          |
| `KetQua`                 | String     | -                | -              | Result text                                        |
| `TienDo`                 | Number     | -                | -              | 0-100%                                             |

### Standard Populate Pattern

```javascript
const populated = await CongViec.findById(id)
  .populate("NguoiGiaoViecID", "Ten MaNhanVien")
  .populate("NguoiChinhID", "Ten MaNhanVien")
  .populate("NguoiThamGia", "Ten MaNhanVien")
  .populate("ChuKyDanhGiaID", "TenChuKy Thang Nam")
  .lean();
```

---

## 3️⃣ DanhGiaKPI (KPI Evaluation)

### Schema Path

`giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js`

### Core Fields

| Field Name              | Type     | Ref Model        | Populate Field                | Notes                                |
| ----------------------- | -------- | ---------------- | ----------------------------- | ------------------------------------ |
| `_id`                   | ObjectId | -                | -                             | Primary key                          |
| **`NhanVienID`** ✅     | ObjectId | **NhanVien**     | `.Ten`                        | Employee being evaluated             |
| **`ChuKyDanhGiaID`** ✅ | ObjectId | **ChuKyDanhGia** | `.TenChuKy`, `.Thang`, `.Nam` | Evaluation cycle                     |
| **`NguoiDanhGiaID`** ✅ | ObjectId | **NhanVien**     | `.Ten`                        | Evaluator (manager)                  |
| `TrangThai`             | String   | -                | -                             | CHUA_DUYET/DA_DUYET                  |
| `TongDiemKPI`           | Number   | -                | -                             | Total score (calculated on approval) |
| `NgayDuyet`             | Date     | -                | -                             | Approval date                        |
| `DanhSachNhiemVu`       | [Object] | -                | -                             | Task list (embedded)                 |

### Standard Populate Pattern

```javascript
const populated = await DanhGiaKPI.findById(id)
  .populate("NhanVienID", "Ten MaNhanVien")
  .populate("ChuKyDanhGiaID", "TenChuKy Thang Nam")
  .populate("NguoiDanhGiaID", "Ten MaNhanVien")
  .lean();
```

---

## 4️⃣ NhanVien (Employee - Referenced by many)

### Schema Path

`giaobanbv-be/models/NhanVien.js`

### Core Fields

| Field Name   | Type     | Notes                     |
| ------------ | -------- | ------------------------- |
| `_id`        | ObjectId | Primary key               |
| `MaNhanVien` | String   | Employee code             |
| `Ten`        | String   | Short name ⭐ (most used) |
| `HoTen`      | String   | Full name                 |
| `Email`      | String   |                           |
| `Images`     | [String] | Avatar URLs               |
| `PhongBanID` | ObjectId | Department ref            |
| `ChucDanh`   | String   | Job title                 |
| `CapBac`     | String   | Level                     |

### ⚠️ User vs NhanVien

**Critical**: NhanVien và User là 2 model khác nhau!

- **NhanVien**: Employee data (HR)
- **User**: Account/login data (Auth)
- **Relationship**: `User.NhanVienID` → `NhanVien._id`

**For notifications**:

- Recipients trong trigger config = **NhanVienID**
- Resolve sang **User.\_id** bằng `User.NhanVienID` mapping
- Nếu không map được → KHÔNG GỬI NOTIFICATION

---

## 5️⃣ Khoa (Department)

### Schema Path

`giaobanbv-be/models/Khoa.js`

### Core Fields

| Field Name | Type     | Notes              |
| ---------- | -------- | ------------------ |
| `_id`      | ObjectId | Primary key        |
| `MaKhoa`   | String   | Department code    |
| `TenKhoa`  | String   | Department name ⭐ |

---

## 6️⃣ ChuKyDanhGia (KPI Cycle)

### Schema Path

`giaobanbv-be/modules/workmanagement/models/ChuKyDanhGia.js`

### Core Fields

| Field Name    | Type     | Notes         |
| ------------- | -------- | ------------- |
| `_id`         | ObjectId | Primary key   |
| `TenChuKy`    | String   | Cycle name ⭐ |
| `Thang`       | Number   | Month (1-12)  |
| `Nam`         | Number   | Year          |
| `NgayBatDau`  | Date     | Start date    |
| `NgayKetThuc` | Date     | End date      |
| `isDong`      | Boolean  | Is closed     |

---

## 7️⃣ DanhMucYeuCau (Request Category)

### Schema Path

`giaobanbv-be/modules/workmanagement/models/DanhMucYeuCau.js`

### Core Fields

| Field Name             | Type     | Notes                                  |
| ---------------------- | -------- | -------------------------------------- |
| `_id`                  | ObjectId | Primary key                            |
| **`TenLoaiYeuCau`** ✅ | String   | Category name ⭐ KHÔNG PHẢI `TenLoai`! |
| `MoTa`                 | String   | Description                            |
| `ThoiGianDuKien`       | Number   | Expected duration                      |
| `DonViThoiGian`        | String   | PHUT/GIO/NGAY                          |
| `KhoaID`               | ObjectId | Owner department                       |

---

## 🎯 QUICK AUDIT TIPS

### 1. Verify Populate Fields

Mỗi khi thấy `.populate("FieldName", "...")`:

- ✅ Check field **TỒN TẠI** trong schema entity chính
- ✅ Check field được select **TỒN TẠI** trong ref model
- ❌ ĐỪNG đoán tên field (VD: `TenLoai` vs `TenLoaiYeuCau`)

### 2. Common Typos to Watch

- `LoaiYeuCauID` ❌ → `DanhMucYeuCauID` ✅
- `TenLoai` ❌ → `TenLoaiYeuCau` ✅
- `NguoiNhanID` ⚠️ → Có thể null nếu gửi cho khoa
- `NguoiDuocDieuPhoiID` vs `NguoiXuLyID` → Khác nhau!

### 3. Recipient Resolution Chain

```
NhanVienID (từ recipients)
  ↓ (query User.NhanVienID)
User._id
  ↓ (check UserNotificationSettings)
Notification record in DB
```

**Drop points**:

- NhanVien không có User → rỗng
- User.isDeleted = true → rỗng
- Settings block → skip (nhưng vẫn return null, không throw)

---

**Version**: 1.0  
**Last Updated**: 18/12/2025  
**Based on**: Live schema files (18/12/2025)
