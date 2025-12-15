# 📊 TÀI LIỆU LOGIC LỌC DỮ LIỆU - HỆ THỐNG YÊU CẦU

**Version**: 1.0.0  
**Last Updated**: December 11, 2025  
**Status**: ✅ Complete Implementation

---

## 🎯 OVERVIEW

Hệ thống Yêu cầu (Ticket) có **4 pages chính** với **17 tabs** tổng cộng. Mỗi tab có logic filter riêng biệt dựa trên **vai trò người dùng** và **trạng thái yêu cầu**.

### Các trường quan trọng trong YeuCau Model

| Field                 | Type                  | Ý nghĩa                      | Thời điểm set         |
| --------------------- | --------------------- | ---------------------------- | --------------------- |
| `NguoiYeuCauID`       | ObjectId (NhanVien)   | Người tạo yêu cầu            | Khi tạo YC            |
| `KhoaNguonID`         | ObjectId (Khoa)       | Khoa của người gửi           | Khi tạo YC (auto)     |
| `KhoaDichID`          | ObjectId (Khoa)       | Khoa nhận yêu cầu            | Khi tạo YC            |
| `LoaiNguoiNhan`       | String (KHOA/CA_NHAN) | Gửi đến khoa hay cá nhân     | Khi tạo YC            |
| `NguoiNhanID`         | ObjectId (NhanVien)   | Người nhận (nếu gửi cá nhân) | Khi tạo YC (optional) |
| `NguoiDieuPhoiID`     | ObjectId (NhanVien)   | Người thực hiện điều phối    | Khi điều phối         |
| `NguoiDuocDieuPhoiID` | ObjectId (NhanVien)   | Người được giao việc         | Khi điều phối         |
| `NguoiXuLyID`         | ObjectId (NhanVien)   | Người thực tế xử lý          | Khi tiếp nhận         |
| `TrangThai`           | String (5 states)     | Trạng thái hiện tại          | Theo workflow         |
| `ThoiGianHen`         | Date                  | Deadline                     | Khi tiếp nhận (auto)  |

---

## 🔄 WORKFLOW & STATE MACHINE

```
[NGƯỜI GỬI]         [ĐIỀU PHỐI]         [NGƯỜI XỬ LÝ]       [NGƯỜI GỬI]
     │                    │                    │                   │
     ├─1. Tạo YC─────────►│                    │                   │
     │   (MOI)            │                    │                   │
     │   Set:             │                    │                   │
     │   - NguoiYeuCauID  │                    │                   │
     │   - KhoaNguonID    │                    │                   │
     │   - KhoaDichID     │                    │                   │
     │   - LoaiNguoiNhan  │                    │                   │
     │                    │                    │                   │
     │                    ├─2a. Điều phối─────►│                   │
     │                    │   (nếu KHOA)       │                   │
     │                    │   Set:             │                   │
     │                    │   - NguoiDieuPhoiID                    │
     │                    │   - NguoiDuocDieuPhoiID                │
     │                    │                    │                   │
     │   (hoặc gửi trực tiếp CA_NHAN)         │                   │
     │                    │                    │                   │
     │                    │                    ├─3. Tiếp nhận──────┤
     │                    │                    │   (DANG_XU_LY)    │
     │                    │                    │   Set:            │
     │                    │                    │   - NguoiXuLyID   │
     │                    │                    │   - ThoiGianHen   │
     │                    │                    │                   │
     │                    │                    ├─4. Hoàn thành─────┤
     │                    │                    │   (DA_HOAN_THANH) │
     │                    │                    │                   │
     │◄───────────────────┴────────────────────┴─5. Đánh giá/Đóng │
     │                                            (DA_DONG)         │
```

### 5 Trạng thái (TrangThai)

1. **MOI**: Vừa tạo, chờ tiếp nhận hoặc điều phối
2. **DANG_XU_LY**: Đã tiếp nhận và đang xử lý
3. **DA_HOAN_THANH**: Đã hoàn thành, chờ đánh giá/đóng
4. **DA_DONG**: Đã đóng (hoàn tất flow)
5. **TU_CHOI**: Bị từ chối

---

## 📋 PAGE 1: YÊU CẦU TÔI GỬI

**Route**: `/yeu-cau-toi-gui`  
**Page Key**: `YEU_CAU_TOI_GUI`  
**Base Filter**: `NguoiYeuCauID = myNhanVienId`

### Tab 1.1: Chờ tiếp nhận (cho-phan-hoi)

**MongoDB Query**:

```javascript
{
  NguoiYeuCauID: myNhanVienId,
  TrangThai: "MOI",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-gui",
  trangThai: "MOI",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: YC đã gửi, chưa ai tiếp nhận (chờ điều phối hoặc chờ người nhận).

**Actions**: Sửa, Xóa, Nhắc nhở

---

### Tab 1.2: Đang xử lý (dang-xu-ly)

**MongoDB Query**:

```javascript
{
  NguoiYeuCauID: myNhanVienId,
  TrangThai: "DANG_XU_LY",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-gui",
  trangThai: "DANG_XU_LY",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: Có người đang xử lý YC của tôi.

**Actions**: Xem chi tiết, Comment, Nhắc nhở

---

### Tab 1.3: Chờ đánh giá (cho-danh-gia)

**MongoDB Query**:

```javascript
{
  NguoiYeuCauID: myNhanVienId,
  TrangThai: "DA_HOAN_THANH",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-gui",
  trangThai: "DA_HOAN_THANH",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: Người xử lý đã hoàn thành, chờ tôi đánh giá và đóng.

**Actions**: ⭐ Đánh giá, ✅ Đóng YC, 🔄 Yêu cầu xử lý tiếp

---

### Tab 1.4: Đã đóng (da-dong)

**MongoDB Query**:

```javascript
{
  NguoiYeuCauID: myNhanVienId,
  TrangThai: "DA_DONG",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-gui",
  trangThai: "DA_DONG",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: Đã đóng, lịch sử.

**Actions**: Xem lại, Mở lại (trong 7 ngày)

---

### Tab 1.5: Bị từ chối (tu-choi)

**MongoDB Query**:

```javascript
{
  NguoiYeuCauID: myNhanVienId,
  TrangThai: "TU_CHOI",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-gui",
  trangThai: "TU_CHOI",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: Bị từ chối, có thể gửi lại hoặc khiếu nại.

**Actions**: Xem lý do, Gửi lại, Khiếu nại

---

## 📋 PAGE 2: YÊU CẦU TÔI XỬ LÝ

**Route**: `/yeu-cau-xu-ly`  
**Page Key**: `YEU_CAU_TOI_XU_LY`  
**Base Filter**: YC được giao cho tôi hoặc tôi đang/đã xử lý

### Tab 2.1: Chờ tiếp nhận (cho-tiep-nhan)

**MongoDB Query**:

```javascript
{
  $or: [
    { NguoiDuocDieuPhoiID: myNhanVienId },  // Được điều phối giao
    { NguoiNhanID: myNhanVienId }           // Được gửi trực tiếp
  ],
  TrangThai: "MOI",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-xu-ly",
  trangThai: "MOI",
  page: 1,
  limit: 20
}
```

**⚠️ QUAN TRỌNG**: Tab này có **2 nguồn yêu cầu**:

1. **Điều phối viên giao**: `NguoiDuocDieuPhoiID = myId` (YC gửi KHOA)
2. **Gửi trực tiếp**: `NguoiNhanID = myId` (YC gửi CA_NHAN)

**Actions**: ✅ Tiếp nhận, ❌ Từ chối

---

### Tab 2.2: Đang xử lý (dang-xu-ly)

**MongoDB Query**:

```javascript
{
  NguoiXuLyID: myNhanVienId,
  TrangThai: "DANG_XU_LY",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-xu-ly",
  trangThai: "DANG_XU_LY",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: TÔI đang xử lý (sau khi tiếp nhận, `NguoiXuLyID = myId`).

**Actions**: Update tiến độ, Comment, ✅ Hoàn thành

---

### Tab 2.3: Chờ xác nhận (cho-xac-nhan)

**MongoDB Query**:

```javascript
{
  NguoiXuLyID: myNhanVienId,
  TrangThai: "DA_HOAN_THANH",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-xu-ly",
  trangThai: "DA_HOAN_THANH",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: TÔI đã hoàn thành, chờ người gửi xác nhận đóng.

**Actions**: Xem (read-only)

---

### Tab 2.4: Đã hoàn thành (da-hoan-thanh)

**MongoDB Query**:

```javascript
{
  NguoiXuLyID: myNhanVienId,
  TrangThai: "DA_DONG",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  tab: "toi-xu-ly",
  trangThai: "DA_DONG",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: TÔI đã xử lý xong và đã được đóng (lịch sử KPI).

**Actions**: Xem đánh giá nhận được

---

## 📋 PAGE 3: ĐIỀU PHỐI YÊU CẦU

**Route**: `/yeu-cau-dieu-phoi`  
**Page Key**: `YEU_CAU_DIEU_PHOI`  
**Base Filter**: `KhoaDichID = myKhoaID` (YC gửi đến khoa tôi)  
**Yêu cầu**: `isNguoiDieuPhoi = true`

### Tab 3.1: Mới đến (moi-den)

**MongoDB Query**:

```javascript
{
  KhoaDichID: myKhoaId,
  TrangThai: "MOI",
  LoaiNguoiNhan: "KHOA",              // ✅ CHỈ YC gửi đến KHOA
  NguoiDuocDieuPhoiID: null,          // ✅ Chưa ai điều phối
  isDeleted: false
}
```

**API Params**:

```javascript
{
  khoaDichId: myKhoaId,
  trangThai: "MOI",
  chuaDieuPhoi: true,                 // ✅ NEW param
  page: 1,
  limit: 20
}
```

**⚠️ EDGE CASE**:

- YC gửi `LoaiNguoiNhan = "CA_NHAN"` (gửi trực tiếp) **KHÔNG** hiển thị ở tab này
- CHỈ hiển thị YC gửi đến KHOA và chưa điều phối

**Actions**: 🎯 Điều phối (giao cho NV), Từ chối

---

### Tab 3.2: Đã điều phối (da-dieu-phoi)

**MongoDB Query**:

```javascript
{
  KhoaDichID: myKhoaId,
  TrangThai: "MOI",
  LoaiNguoiNhan: "KHOA",
  NguoiDuocDieuPhoiID: { $ne: null }, // ✅ Đã giao cho ai đó
  isDeleted: false
}
```

**API Params**:

```javascript
{
  khoaDichId: myKhoaId,
  trangThai: "MOI",
  daDieuPhoi: true,                   // ✅ NEW param
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: Đã giao cho `NguoiDuocDieuPhoiID`, chờ họ tiếp nhận.

**Actions**: 🔄 Điều phối lại (chuyển người khác)

---

### Tab 3.3: Đang xử lý (dang-xu-ly)

**MongoDB Query**:

```javascript
{
  KhoaDichID: myKhoaId,
  TrangThai: "DANG_XU_LY",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  khoaDichId: myKhoaId,
  trangThai: "DANG_XU_LY",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: Đã có người tiếp nhận (`NguoiXuLyID` đã set).

**Actions**: Theo dõi

---

### Tab 3.4: Hoàn thành (hoan-thanh)

**MongoDB Query**:

```javascript
{
  KhoaDichID: myKhoaId,
  TrangThai: "DA_DONG",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  khoaDichId: myKhoaId,
  trangThai: "DA_DONG",
  page: 1,
  limit: 20
}
```

**⚠️ NOTE**: Tab config ghi `DA_HOAN_THANH | DA_DONG` nhưng backend hiện chỉ hỗ trợ filter 1 trạng thái.

**Ý nghĩa**: Hoàn tất.

---

### Tab 3.5: Từ chối (tu-choi)

**MongoDB Query**:

```javascript
{
  KhoaDichID: myKhoaId,
  TrangThai: "TU_CHOI",
  isDeleted: false
}
```

**API Params**:

```javascript
{
  khoaDichId: myKhoaId,
  trangThai: "TU_CHOI",
  page: 1,
  limit: 20
}
```

**Ý nghĩa**: Người xử lý từ chối, cần xem xét lại.

**Actions**: 🎯 Điều phối lại (chọn người khác), Báo lại người gửi

---

## 📋 PAGE 4: QUẢN LÝ YÊU CẦU KHOA

**Route**: `/yeu-cau-quan-ly-khoa`  
**Page Key**: `YEU_CAU_QUAN_LY_KHOA`  
**Yêu cầu**: `isQuanLyKhoa = true`

### Tab 4.1: Gửi đến khoa (gui-den-khoa)

**MongoDB Query**:

```javascript
{
  KhoaDichID: myKhoaId,
  isDeleted: false
  // Tất cả trạng thái
}
```

**API Params**:

```javascript
{
  khoaDichId: myKhoaId,
  page: 1,
  limit: 50
}
```

**Ý nghĩa**: TẤT CẢ YC gửi đến khoa (all status).

---

### Tab 4.2: Khoa gửi đi (khoa-gui-di)

**MongoDB Query**:

```javascript
{
  KhoaNguonID: myKhoaId,
  isDeleted: false
  // Tất cả trạng thái
}
```

**API Params**:

```javascript
{
  khoaNguonId: myKhoaId,     // ✅ NEW param
  // hoặc
  filterType: "khoa-gui-di", // ✅ NEW param (auto lấy KhoaID của user)
  page: 1,
  limit: 50
}
```

**Ý nghĩa**: TẤT CẢ YC từ NV khoa tôi gửi đi.

**Actions**: Xem tổng quan, Export báo cáo

---

### Tab 4.3: Quá hạn (qua-han)

**MongoDB Query**:

```javascript
{
  $or: [
    { KhoaDichID: myKhoaId },
    { KhoaNguonID: myKhoaId }
  ],
  ThoiGianHen: { $lt: new Date() },
  TrangThai: { $nin: ["DA_DONG", "TU_CHOI"] },
  isDeleted: false
}
```

**API Params**:

```javascript
{
  khoaDichId: myKhoaId,
  quaHan: true,               // ✅ NEW param
  page: 1,
  limit: 50
}
```

**Ý nghĩa**: YC quá hạn (liên quan khoa tôi, chưa hoàn thành).

**⚠️ BUSINESS LOGIC**:

- Chỉ tính YC chưa đóng (`TrangThai NOT IN [DA_DONG, TU_CHOI]`)
- YC hoàn thành sau deadline vẫn tính quá hạn (cho KPI)

**Actions**: Nhắc nhở, Điều phối lại, Báo cáo

---

### Tab 4.4: Báo cáo (bao-cao)

**Type**: Report tab (không load list)

**Displays**:

- Charts thống kê
- Tỷ lệ hoàn thành
- Tỷ lệ đúng hạn
- Top người xử lý nhanh/chậm

**Status**: ⚠️ Chưa implement

---

## 🔧 BACKEND SERVICE - FILTER LOGIC

### File: `yeuCau.service.js`

```javascript
async function layDanhSach(query, nguoiXemId, userRole) {
  const {
    page = 1,
    limit = 20,
    tab,
    trangThai,
    khoaDichId,
    khoaNguonId, // ✅ NEW
    chuaDieuPhoi, // ✅ NEW
    daDieuPhoi, // ✅ NEW
    quaHan, // ✅ NEW
    filterType, // ✅ NEW
    tuNgay,
    denNgay,
    search,
  } = query;

  const filter = { isDeleted: false };
  const nguoiXem = await NhanVien.findById(nguoiXemId);

  // ========== TAB LOGIC ==========
  switch (tab) {
    case "toi-gui":
      filter.NguoiYeuCauID = nguoiXemId;
      break;

    case "toi-xu-ly":
      filter.$or = [
        { NguoiDuocDieuPhoiID: nguoiXemId },
        { NguoiNhanID: nguoiXemId },
        { NguoiXuLyID: nguoiXemId },
      ];
      break;

    case "can-xu-ly":
      filter.KhoaDichID = nguoiXem?.KhoaID;
      break;

    case "da-xu-ly":
      filter.NguoiXuLyID = nguoiXemId;
      filter.TrangThai = { $in: ["DA_HOAN_THANH", "DA_DONG"] };
      break;
  }

  // ========== ĐIỀU KIỆN BỔ SUNG ==========

  // Trạng thái
  if (trangThai && !filter.TrangThai) {
    filter.TrangThai = trangThai;
  }

  // Khoa đích
  if (khoaDichId) {
    filter.KhoaDichID = khoaDichId;
  }

  // ✅ Khoa nguồn (tab "khoa-gui-di")
  if (khoaNguonId) {
    filter.KhoaNguonID = khoaNguonId;
  } else if (filterType === "khoa-gui-di" && nguoiXem?.KhoaID) {
    filter.KhoaNguonID = nguoiXem.KhoaID;
  }

  // ✅ Chưa điều phối (tab "moi-den")
  if (chuaDieuPhoi === true || chuaDieuPhoi === "true") {
    filter.LoaiNguoiNhan = "KHOA";
    filter.NguoiDuocDieuPhoiID = null;
  }

  // ✅ Đã điều phối (tab "da-dieu-phoi")
  if (daDieuPhoi === true || daDieuPhoi === "true") {
    filter.LoaiNguoiNhan = "KHOA";
    filter.NguoiDuocDieuPhoiID = { $ne: null };
  }

  // ✅ Quá hạn (tab "qua-han")
  if (quaHan === true || quaHan === "true") {
    filter.ThoiGianHen = { $lt: new Date() };
    filter.TrangThai = { $nin: ["DA_DONG", "TU_CHOI"] };
  }

  // Ngày tạo
  if (tuNgay || denNgay) {
    filter.createdAt = {};
    if (tuNgay) filter.createdAt.$gte = new Date(tuNgay);
    if (denNgay) {
      const endDate = new Date(denNgay);
      endDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = endDate;
    }
  }

  // Tìm kiếm
  if (search) {
    const searchConditions = [
      { MaYeuCau: { $regex: search, $options: "i" } },
      { TieuDe: { $regex: search, $options: "i" } },
    ];

    if (filter.$or) {
      const existingOr = filter.$or;
      delete filter.$or;
      filter.$and = [{ $or: existingOr }, { $or: searchConditions }];
    } else {
      filter.$or = searchConditions;
    }
  }

  // Query execution...
}
```

---

## 🎯 VALIDATION MATRIX

| Param                    | Tab áp dụng        | Priority    | Status  | Backend Line |
| ------------------------ | ------------------ | ----------- | ------- | ------------ |
| `tab`                    | All                | ✅ Critical | ✅ Done | 394-425      |
| `trangThai`              | All                | ✅ Critical | ✅ Done | 428-430      |
| `khoaDichId`             | Điều phối, Quản lý | ✅ Critical | ✅ Done | 433-435      |
| `khoaNguonId`            | Khoa gửi đi        | 🟡 High     | ✅ Done | 438-442      |
| `filterType=khoa-gui-di` | Khoa gửi đi        | 🟡 High     | ✅ Done | 440-442      |
| `chuaDieuPhoi`           | Mới đến            | 🟡 High     | ✅ Done | 445-448      |
| `daDieuPhoi`             | Đã điều phối       | 🟡 High     | ✅ Done | 451-454      |
| `quaHan`                 | Quá hạn            | 🟢 Medium   | ✅ Done | 457-460      |
| `tuNgay`, `denNgay`      | All                | 🟢 Medium   | ✅ Done | 463-471      |
| `search`                 | All                | 🟢 Medium   | ✅ Done | 474-485      |

---

## 🧪 TEST CASES

### Test 1: Tab "Mới đến" - Chỉ YC gửi KHOA

```javascript
// Request
GET /workmanagement/yeucau?khoaDichId=66xxx&trangThai=MOI&chuaDieuPhoi=true

// Expected MongoDB Filter
{
  KhoaDichID: ObjectId("66xxx"),
  TrangThai: "MOI",
  LoaiNguoiNhan: "KHOA",
  NguoiDuocDieuPhoiID: null,
  isDeleted: false
}

// Should INCLUDE:
- YC gửi đến KHOA, chưa ai điều phối

// Should EXCLUDE:
- YC gửi CA_NHAN (NguoiNhanID != null)
- YC đã điều phối (NguoiDuocDieuPhoiID != null)
```

### Test 2: Tab "Chờ tiếp nhận" - 2 nguồn YC

```javascript
// Request
GET /workmanagement/yeucau?tab=toi-xu-ly&trangThai=MOI

// Expected MongoDB Filter
{
  $or: [
    { NguoiDuocDieuPhoiID: myId },
    { NguoiNhanID: myId }
  ],
  TrangThai: "MOI",
  isDeleted: false
}

// Should INCLUDE:
- YC điều phối giao cho tôi (NguoiDuocDieuPhoiID = myId)
- YC gửi trực tiếp cho tôi (NguoiNhanID = myId)
```

### Test 3: Tab "Quá hạn"

```javascript
// Request
GET /workmanagement/yeucau?khoaDichId=66xxx&quaHan=true

// Expected MongoDB Filter
{
  KhoaDichID: ObjectId("66xxx"),
  ThoiGianHen: { $lt: ISODate("2025-12-11T...") },
  TrangThai: { $nin: ["DA_DONG", "TU_CHOI"] },
  isDeleted: false
}

// Should INCLUDE:
- YC chưa hoàn thành và quá deadline
- YC đang xử lý nhưng quá hạn

// Should EXCLUDE:
- YC đã đóng (DA_DONG)
- YC từ chối (TU_CHOI)
- YC chưa có ThoiGianHen
```

### Test 4: Search với Tab Logic

```javascript
// Request
GET /workmanagement/yeucau?tab=toi-xu-ly&search=ABC

// Expected MongoDB Filter (complex)
{
  $and: [
    {
      $or: [
        { NguoiDuocDieuPhoiID: myId },
        { NguoiNhanID: myId },
        { NguoiXuLyID: myId }
      ]
    },
    {
      $or: [
        { MaYeuCau: /ABC/i },
        { TieuDe: /ABC/i }
      ]
    }
  ],
  isDeleted: false
}
```

---

## 🐛 KNOWN EDGE CASES

### Edge Case 1: Người được điều phối ≠ Người xử lý

```javascript
// Scenario:
// 1. Điều phối viên giao cho A: NguoiDuocDieuPhoiID = A
// 2. A chuyển giao cho B
// 3. B tiếp nhận: NguoiXuLyID = B (A không tiếp nhận)

// Tab "Chờ tiếp nhận" của A:
// ✅ PHẢI hiển thị (vì NguoiDuocDieuPhoiID = A và TrangThai = MOI)

// Tab "Đang xử lý" của A:
// ❌ KHÔNG hiển thị (vì NguoiXuLyID ≠ A)

// Tab "Đang xử lý" của B:
// ✅ PHẢI hiển thị (vì NguoiXuLyID = B)
```

### Edge Case 2: YC hoàn thành nhưng quá hạn

```javascript
// Scenario:
{
  ThoiGianHen: "2025-12-01",
  NgayHoanThanh: "2025-12-05",  // Trễ 4 ngày
  TrangThai: "DA_DONG"
}

// Tab "Quá hạn":
// ❌ KHÔNG hiển thị (vì TrangThai = DA_DONG)

// Nhưng:
// ✅ Virtual field QuaHan = true
// ✅ PHẢI tính trong báo cáo KPI (tỷ lệ đúng hạn)
```

### Edge Case 3: YC gửi cá nhân không cần điều phối

```javascript
// Scenario:
{
  LoaiNguoiNhan: "CA_NHAN",
  NguoiNhanID: "66xxx",  // Gửi trực tiếp
  NguoiDuocDieuPhoiID: null,
  TrangThai: "MOI"
}

// Tab "Mới đến" (điều phối):
// ❌ KHÔNG hiển thị (vì LoaiNguoiNhan = CA_NHAN)
// → Filter có check: LoaiNguoiNhan = "KHOA"

// Tab "Chờ tiếp nhận" (người xử lý):
// ✅ PHẢI hiển thị (vì NguoiNhanID = myId)
```

---

## 📊 INDEX OPTIMIZATION

### Recommended MongoDB Indexes

```javascript
// YeuCau collection indexes
yeuCauSchema.index({ NguoiYeuCauID: 1, TrangThai: 1 }); // Page 1
yeuCauSchema.index({ NguoiXuLyID: 1, TrangThai: 1 }); // Page 2
yeuCauSchema.index({ NguoiDuocDieuPhoiID: 1, TrangThai: 1 }); // Page 2
yeuCauSchema.index({ NguoiNhanID: 1, TrangThai: 1 }); // Page 2
yeuCauSchema.index({ KhoaDichID: 1, TrangThai: 1 }); // Page 3
yeuCauSchema.index({ KhoaDichID: 1, LoaiNguoiNhan: 1, NguoiDuocDieuPhoiID: 1 }); // Page 3 tabs
yeuCauSchema.index({ KhoaNguonID: 1 }); // Page 4
yeuCauSchema.index({ ThoiGianHen: 1, TrangThai: 1 }); // Quá hạn
yeuCauSchema.index({ isDeleted: 1, TrangThai: 1 }); // All queries
yeuCauSchema.index({ createdAt: -1 }); // Sort
```

---

## 🔄 VERSION HISTORY

### v1.0.0 (December 11, 2025)

- ✅ Initial implementation
- ✅ Added `khoaNguonId` filter
- ✅ Added `chuaDieuPhoi` filter
- ✅ Added `daDieuPhoi` filter
- ✅ Added `quaHan` filter
- ✅ Added `filterType=khoa-gui-di`
- ✅ Fixed search with tab logic (using $and)
- ✅ Added `LoaiNguoiNhan` check for dispatcher tabs

---

## 📞 SUPPORT

**Backend Service**: `modules/workmanagement/services/yeuCau.service.js`  
**Frontend Config**: `src/features/QuanLyCongViec/Ticket/config/yeuCauTabConfig.js`  
**Model**: `modules/workmanagement/models/YeuCau.js`

For questions, contact: Development Team
