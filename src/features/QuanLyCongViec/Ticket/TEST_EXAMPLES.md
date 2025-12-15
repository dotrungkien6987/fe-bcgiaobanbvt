# 🧪 TEST EXAMPLES - Filter Logic

**File**: Test examples cho các filter mới được implement  
**Date**: December 11, 2025

---

## 📋 Postman/Thunder Client Collection

### Base URL

```
{{baseUrl}} = http://localhost:8020/api/workmanagement/yeucau
```

### Headers

```
Authorization: Bearer {{token}}
Content-Type: application/json
```

---

## ✅ TEST CASE 1: Tab "Mới đến" - Chỉ YC gửi KHOA

### Request

```http
GET {{baseUrl}}?khoaDichId=66b3f1234567890abcdef123&trangThai=MOI&chuaDieuPhoi=true&page=1&limit=20
```

### Expected Filter (Backend MongoDB)

```javascript
{
  KhoaDichID: ObjectId("66b3f1234567890abcdef123"),
  TrangThai: "MOI",
  LoaiNguoiNhan: "KHOA",           // ✅ CHỈ YC gửi đến KHOA
  NguoiDuocDieuPhoiID: null,       // ✅ Chưa ai điều phối
  isDeleted: false
}
```

### Should Include ✅

- YC gửi đến KHOA với `LoaiNguoiNhan = "KHOA"`
- `NguoiDuocDieuPhoiID = null` (chưa điều phối)
- `TrangThai = "MOI"`

### Should Exclude ❌

- YC gửi CÁ NHÂN (`LoaiNguoiNhan = "CA_NHAN"`, `NguoiNhanID != null`)
- YC đã điều phối (`NguoiDuocDieuPhoiID != null`)
- YC ở trạng thái khác (DANG_XU_LY, DA_HOAN_THANH, ...)

### Expected Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "...",
        "MaYeuCau": "YC2025000123",
        "TieuDe": "Cần hỗ trợ thiết bị y tế",
        "TrangThai": "MOI",
        "LoaiNguoiNhan": "KHOA",
        "KhoaDichID": {
          "_id": "66b3f1234567890abcdef123",
          "TenKhoa": "Khoa Nội"
        },
        "NguoiDuocDieuPhoiID": null, // ← Chưa điều phối
        "NguoiXuLyID": null,
        "NguoiNhanID": null,
        "createdAt": "2025-12-11T08:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 3,
      "totalPages": 1
    }
  }
}
```

---

## ✅ TEST CASE 2: Tab "Đã điều phối" - Chờ tiếp nhận

### Request

```http
GET {{baseUrl}}?khoaDichId=66b3f1234567890abcdef123&trangThai=MOI&daDieuPhoi=true&page=1&limit=20
```

### Expected Filter

```javascript
{
  KhoaDichID: ObjectId("66b3f1234567890abcdef123"),
  TrangThai: "MOI",
  LoaiNguoiNhan: "KHOA",
  NguoiDuocDieuPhoiID: { $ne: null },  // ✅ Đã giao cho ai đó
  isDeleted: false
}
```

### Should Include ✅

- YC đã điều phối (`NguoiDuocDieuPhoiID != null`)
- Vẫn ở trạng thái MOI (chưa tiếp nhận)

### Should Exclude ❌

- YC chưa điều phối (`NguoiDuocDieuPhoiID = null`)
- YC đã tiếp nhận (`TrangThai = "DANG_XU_LY"`, `NguoiXuLyID != null`)

### Expected Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "...",
        "MaYeuCau": "YC2025000124",
        "TrangThai": "MOI",
        "NguoiDuocDieuPhoiID": {          // ← Đã điều phối
          "_id": "66xxx",
          "Ten": "Nguyễn Văn A"
        },
        "NguoiDieuPhoiID": {              // ← Người điều phối
          "_id": "66yyy",
          "Ten": "Trần Thị B"
        },
        "NguoiXuLyID": null,              // ← Chưa tiếp nhận
        "NgayDieuPhoi": "2025-12-11T09:00:00.000Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

## ✅ TEST CASE 3: Tab "Quá hạn" - Chưa hoàn thành

### Request

```http
GET {{baseUrl}}?khoaDichId=66b3f1234567890abcdef123&quaHan=true&page=1&limit=20
```

### Expected Filter

```javascript
{
  KhoaDichID: ObjectId("66b3f1234567890abcdef123"),
  ThoiGianHen: { $lt: new Date("2025-12-11T...") },  // ✅ Quá hạn
  TrangThai: { $nin: ["DA_DONG", "TU_CHOI"] },      // ✅ Chưa đóng
  isDeleted: false
}
```

### Should Include ✅

- YC có `ThoiGianHen` < now (quá deadline)
- `TrangThai` = MOI hoặc DANG_XU_LY hoặc DA_HOAN_THANH
- Chưa đóng (DA_DONG) hoặc từ chối (TU_CHOI)

### Should Exclude ❌

- YC đã đóng (`TrangThai = "DA_DONG"`)
- YC từ chối (`TrangThai = "TU_CHOI"`)
- YC chưa có `ThoiGianHen` (null)
- YC chưa quá hạn (`ThoiGianHen > now`)

### Expected Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "...",
        "MaYeuCau": "YC2025000125",
        "TrangThai": "DANG_XU_LY",
        "ThoiGianHen": "2025-12-10T17:00:00.000Z",  // ← Quá hạn (hôm qua)
        "QuaHan": true,                              // ← Virtual field
        "SoNgayConLai": -1,                          // ← Trễ 1 ngày
        "NguoiXuLyID": {
          "_id": "...",
          "Ten": "Nguyễn Văn C"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

## ✅ TEST CASE 4: Tab "Khoa gửi đi" - Filter KhoaNguonID

### Request (Option 1: Explicit khoaNguonId)

```http
GET {{baseUrl}}?khoaNguonId=66b3f1234567890abcdef456&page=1&limit=50
```

### Request (Option 2: Auto filterType)

```http
GET {{baseUrl}}?filterType=khoa-gui-di&page=1&limit=50
```

### Expected Filter

```javascript
// Option 1
{
  KhoaNguonID: ObjectId("66b3f1234567890abcdef456"),
  isDeleted: false
}

// Option 2 (auto lấy KhoaID của user)
{
  KhoaNguonID: ObjectId("user.KhoaID"),  // ← Tự động từ NhanVien
  isDeleted: false
}
```

### Should Include ✅

- TẤT CẢ YC từ nhân viên khoa này gửi đi (all status)
- `KhoaNguonID` match

### Expected Response

```json
{
  "success": true,
  "data": {
    "data": [
      {
        "_id": "...",
        "MaYeuCau": "YC2025000126",
        "TrangThai": "DA_DONG",
        "KhoaNguonID": {                    // ← Khoa gửi
          "_id": "66b3f1234567890abcdef456",
          "TenKhoa": "Khoa Ngoại"
        },
        "KhoaDichID": {                     // ← Khoa nhận
          "_id": "...",
          "TenKhoa": "Khoa Nội"
        },
        "NguoiYeuCauID": {
          "_id": "...",
          "Ten": "Lê Thị D"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

## ✅ TEST CASE 5: Tab "Chờ tiếp nhận" - 2 nguồn YC

### Request

```http
GET {{baseUrl}}?tab=toi-xu-ly&trangThai=MOI&page=1&limit=20
```

### Expected Filter (Complex $or)

```javascript
{
  $or: [
    { NguoiDuocDieuPhoiID: myNhanVienId },  // ← Được điều phối
    { NguoiNhanID: myNhanVienId }           // ← Gửi trực tiếp
  ],
  TrangThai: "MOI",
  isDeleted: false
}
```

### Should Include ✅

1. **YC từ điều phối**:
   - `LoaiNguoiNhan = "KHOA"`
   - `NguoiDuocDieuPhoiID = myId`
2. **YC gửi trực tiếp**:
   - `LoaiNguoiNhan = "CA_NHAN"`
   - `NguoiNhanID = myId`

### Expected Response

```json
{
  "success": true,
  "data": {
    "data": [
      // YC 1: Được điều phối
      {
        "_id": "...",
        "MaYeuCau": "YC2025000127",
        "LoaiNguoiNhan": "KHOA",
        "NguoiDuocDieuPhoiID": {
          "_id": "myNhanVienId",
          "Ten": "Tôi"
        },
        "NguoiNhanID": null
      },
      // YC 2: Gửi trực tiếp
      {
        "_id": "...",
        "MaYeuCau": "YC2025000128",
        "LoaiNguoiNhan": "CA_NHAN",
        "NguoiNhanID": {
          "_id": "myNhanVienId",
          "Ten": "Tôi"
        },
        "NguoiDuocDieuPhoiID": null
      }
    ],
    "pagination": { ... }
  }
}
```

---

## ✅ TEST CASE 6: Search với Tab Logic

### Request

```http
GET {{baseUrl}}?tab=toi-xu-ly&search=thiết bị&page=1&limit=20
```

### Expected Filter (Complex $and + $or)

```javascript
{
  $and: [
    // Tab logic (toi-xu-ly)
    {
      $or: [
        { NguoiDuocDieuPhoiID: myId },
        { NguoiNhanID: myId },
        { NguoiXuLyID: myId }
      ]
    },
    // Search conditions
    {
      $or: [
        { MaYeuCau: { $regex: "thiết bị", $options: "i" } },
        { TieuDe: { $regex: "thiết bị", $options: "i" } }
      ]
    }
  ],
  isDeleted: false
}
```

### Should Include ✅

- YC thuộc quyền của tôi (tab logic)
- VÀ (AND) có chứa "thiết bị" trong Mã hoặc Tiêu đề

---

## ✅ TEST CASE 7: Pagination & Sorting

### Request

```http
GET {{baseUrl}}?khoaDichId=66xxx&page=2&limit=10&sort=-createdAt
```

### Expected Behavior

- Skip: (2-1) × 10 = 10 records
- Limit: 10 records
- Sort: Mới nhất trước (descending)

### Expected Response

```json
{
  "success": true,
  "data": {
    "data": [
      /* 10 records */
    ],
    "pagination": {
      "page": 2,
      "limit": 10,
      "total": 45, // Tổng số records
      "totalPages": 5 // 45 / 10 = 5 pages
    }
  }
}
```

---

## ✅ TEST CASE 8: Date Range Filter

### Request

```http
GET {{baseUrl}}?khoaDichId=66xxx&tuNgay=2025-12-01&denNgay=2025-12-10&page=1&limit=20
```

### Expected Filter

```javascript
{
  KhoaDichID: ObjectId("66xxx"),
  createdAt: {
    $gte: ISODate("2025-12-01T00:00:00.000Z"),
    $lte: ISODate("2025-12-10T23:59:59.999Z")  // ✅ End of day
  },
  isDeleted: false
}
```

### Should Include ✅

- YC tạo từ 00:00:00 ngày 1/12 đến 23:59:59 ngày 10/12

---

## 🔧 DEBUGGING TIPS

### Enable MongoDB Query Logging

```javascript
// yeuCau.service.js (temporary)
async function layDanhSach(query, nguoiXemId, userRole) {
  // ... build filter

  console.log('📊 MongoDB Filter:', JSON.stringify(filter, null, 2));

  const data = await YeuCau.find(filter)...
}
```

### Check Indexes

```powershell
# MongoDB Shell
use giaoban_bvt
db.yeucau.getIndexes()
```

Expected: 11 indexes including:

- `idx_nguoiduocdieuphoi_trangthai_deleted`
- `idx_khoaDich_loaiNguoiNhan_nguoiDuocDieuPhoi`
- etc.

### Performance Testing

```javascript
// Check query execution time
const startTime = Date.now();
const data = await YeuCau.find(filter)...;
const endTime = Date.now();
console.log(`⏱️ Query took: ${endTime - startTime}ms`);
```

Expected with indexes: < 50ms

---

## 📊 VALIDATION CHECKLIST

### Backend Service (`yeuCau.service.js`)

- [x] Line 368-385: Extract new params (`khoaNguonId`, `chuaDieuPhoi`, ...)
- [x] Line 438-442: Filter `khoaNguonId` / `filterType=khoa-gui-di`
- [x] Line 445-448: Filter `chuaDieuPhoi` với check `LoaiNguoiNhan = "KHOA"`
- [x] Line 451-454: Filter `daDieuPhoi` với check `NguoiDuocDieuPhoiID != null`
- [x] Line 457-460: Filter `quaHan` với exclude DA_DONG và TU_CHOI
- [x] Line 474-485: Search logic với `$and` khi có tab filter

### Frontend Config (`yeuCauTabConfig.js`)

- [x] Line 299-306: Tab "moi-den" params include `chuaDieuPhoi: true`
- [x] Line 308-315: Tab "da-dieu-phoi" params include `daDieuPhoi: true`
- [x] Line 347-352: Tab "qua-han" params include `quaHan: true`
- [x] Line 328-337: Tab "khoa-gui-di" params include `filterType: "khoa-gui-di"`

### Database Indexes

- [x] `{ KhoaDichID: 1, LoaiNguoiNhan: 1, NguoiDuocDieuPhoiID: 1 }` - For dispatcher tabs
- [x] `{ ThoiGianHen: 1, TrangThai: 1 }` - For overdue filter
- [x] `{ KhoaNguonID: 1 }` - For "khoa-gui-di" tab

---

## 🎯 SUCCESS CRITERIA

### All tests pass when:

1. ✅ Tab "Mới đến" KHÔNG hiển thị YC gửi CA_NHAN
2. ✅ Tab "Đã điều phối" CHỈ hiển thị YC có NguoiDuocDieuPhoiID
3. ✅ Tab "Quá hạn" exclude DA_DONG và TU_CHOI
4. ✅ Tab "Khoa gửi đi" lọc theo KhoaNguonID
5. ✅ Tab "Chờ tiếp nhận" hiển thị cả 2 nguồn (điều phối + gửi trực tiếp)
6. ✅ Search không bị conflict với tab filters
7. ✅ Badge counts update mỗi 30s
8. ✅ Query performance < 50ms

---

## 📞 Troubleshooting

### Issue: Tab "Mới đến" hiển thị cả YC gửi CA_NHAN

**Cause**: Backend không check `LoaiNguoiNhan`

**Fix**: Đã thêm line 446 trong `yeuCau.service.js`:

```javascript
filter.LoaiNguoiNhan = LOAI_NGUOI_NHAN.KHOA;
```

### Issue: Search không hoạt động với tab logic

**Cause**: Search ghi đè `filter.$or` của tab

**Fix**: Đã dùng `$and` để kết hợp (line 474-485)

### Issue: Performance chậm (>1s)

**Cause**: Thiếu indexes

**Fix**: Chạy `node scripts/addYeuCauIndexes.js`

---

**Generated**: December 11, 2025  
**Backend File**: `modules/workmanagement/services/yeuCau.service.js`  
**Frontend Config**: `src/features/QuanLyCongViec/Ticket/config/yeuCauTabConfig.js`
