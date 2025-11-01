# ✅ Soft Delete với field isDeleted riêng biệt

**Ngày:** October 6, 2025  
**Yêu cầu:** Tách biệt "xóa mềm" (`isDeleted`) và "trạng thái hoạt động" (`TrangThaiHoatDong`)

---

## 🎯 Mục tiêu

**Trước:**

- `TrangThaiHoatDong = false` vừa là "vô hiệu hóa" vừa là "đã xóa" → Nhầm lẫn logic

**Sau:**

- `is Deleted = true` → Đã xóa (soft delete)
- `TrangThaiHoatDong = true/false` → Trạng thái hoạt động độc lập

---

## 📝 Thay đổi Backend

### 1. Model (TieuChiDanhGia.js)

**Thêm field `isDeleted`:**

```javascript
{
  TenTieuChi: String,
  MoTa: String,
  LoaiTieuChi: Enum,
  GiaTriMin: Number,
  GiaTriMax: Number,
  TrongSoMacDinh: Number,
  TrangThaiHoatDong: Boolean,  // ✅ Độc lập - bật/tắt hoạt động
  isDeleted: Boolean,           // ✅ MỚI - đánh dấu đã xóa
}
```

**Thêm index:**

```javascript
tieuChiDanhGiaSchema.index({ isDeleted: 1 });
```

**Cập nhật static methods:**

```javascript
// Chỉ lấy tiêu chí chưa xóa và đang hoạt động
tieuChiDanhGiaSchema.statics.layDanhSachHoatDong = function () {
  return this.find({ TrangThaiHoatDong: true, isDeleted: false }).sort({
    TenTieuChi: 1,
  });
};

tieuChiDanhGiaSchema.statics.timTheoLoai = function (loai) {
  return this.find({
    LoaiTieuChi: loai,
    TrangThaiHoatDong: true,
    isDeleted: false,
  }).sort({ TenTieuChi: 1 });
};

tieuChiDanhGiaSchema.statics.layTieuChiMacDinh = function () {
  return this.find({ TrangThaiHoatDong: true, isDeleted: false }).select(
    "TenTieuChi TrongSoMacDinh LoaiTieuChi GiaTriMin GiaTriMax"
  );
};
```

### 2. Controller (tieuChiDanhGia.controller.js)

**layDanhSach - Chỉ lấy item chưa xóa:**

```javascript
tieuChiDanhGiaController.layDanhSach = catchAsync(async (req, res, next) => {
  const { loaiTieuChi, trangThaiHoatDong } = req.query;

  // ✅ Luôn filter isDeleted: false
  const query = { isDeleted: false };

  if (loaiTieuChi) query.LoaiTieuChi = loaiTieuChi;
  if (trangThaiHoatDong !== undefined) {
    query.TrangThaiHoatDong = trangThaiHoatDong === "true";
  }

  const tieuChis = await TieuChiDanhGia.find(query).sort({ TenTieuChi: 1 });
  // ...
});
```

**layChiTiet - Check isDeleted:**

```javascript
const tieuChi = await TieuChiDanhGia.findOne({ _id: id, isDeleted: false });
```

**capNhat - Check isDeleted:**

```javascript
const tieuChi = await TieuChiDanhGia.findOne({ _id: id, isDeleted: false });
```

**xoa - Đánh dấu isDeleted = true:**

```javascript
tieuChiDanhGiaController.xoa = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const tieuChi = await TieuChiDanhGia.findOne({ _id: id, isDeleted: false });

  if (!tieuChi) {
    throw new AppError(404, "Không tìm thấy tiêu chí đánh giá", "Not Found");
  }

  // ✅ Soft delete: chỉ đánh dấu isDeleted
  tieuChi.isDeleted = true;
  await tieuChi.save();

  return sendResponse(
    res,
    200,
    true,
    { tieuChiId: id },
    null,
    "Xóa tiêu chí đánh giá thành công"
  );
});
```

---

## 📝 Thay đổi Frontend

### 1. Redux Slice (kpiSlice.js)

**Reducer deleteTieuChiDanhGiaSuccess:**

```javascript
deleteTieuChiDanhGiaSuccess(state, action) {
  state.isLoading = false;
  state.error = null;

  // ✅ Cập nhật isDeleted = true (không xóa khỏi array)
  const index = state.tieuChiDanhGias.findIndex(
    (item) => item._id === action.payload
  );
  if (index !== -1) {
    state.tieuChiDanhGias[index].isDeleted = true;
  }
}
```

### 2. Component (TieuChiDanhGiaList.js)

**Filter data theo isDeleted:**

```javascript
const { tieuChiDanhGias } = useSelector((state) => state.kpi);

// ✅ Chỉ hiển thị tiêu chí chưa bị xóa
const data = useMemo(
  () => tieuChiDanhGias.filter((item) => !item.isDeleted),
  [tieuChiDanhGias]
);
```

---

## 🔄 Luồng hoạt động

### Kịch bản 1: Xóa tiêu chí

```
1. User click "Xóa" → Confirmation dialog
2. Frontend gọi DELETE /api/workmanagement/tieu-chi-danh-gia/:id
3. Backend:
   - Tìm tieuChi với { _id: id, isDeleted: false }
   - Set tieuChi.isDeleted = true
   - Lưu vào DB
4. Frontend:
   - Nhận response success
   - dispatch deleteTieuChiDanhGiaSuccess(tieuChiId)
   - Redux tìm item, set isDeleted = true
5. Component filter: item.isDeleted = true → Không hiển thị
6. Toast: "Xóa tiêu chí thành công" ✅
```

### Kịch bản 2: F5 trang sau khi xóa

```
1. User F5
2. Frontend gọi GET /api/workmanagement/tieu-chi-danh-gia
3. Backend:
   - Query: { isDeleted: false }
   - Chỉ trả về tiêu chí chưa bị xóa ✅
4. Frontend:
   - Nhận danh sách (không có item đã xóa)
   - Lưu vào Redux state
5. Component hiển thị → Item đã xóa KHÔNG xuất hiện ✅
```

### Kịch bản 3: Vô hiệu hóa (không phải xóa)

```
1. User toggle "Trạng thái hoạt động" → OFF
2. Frontend gọi PUT /api/workmanagement/tieu-chi-danh-gia/:id
   Body: { TrangThaiHoatDong: false }
3. Backend:
   - Tìm tieuChi với { _id: id, isDeleted: false }
   - Set TrangThaiHoatDong = false
   - isDeleted vẫn = false ✅
4. Frontend cập nhật state
5. Item vẫn hiển thị nhưng có badge "Tạm dừng" ✅
```

---

## 📊 So sánh 2 field

| Tình huống           | `isDeleted` | `TrangThaiHoatDong` | Hiển thị                       | Có thể sử dụng |
| -------------------- | ----------- | ------------------- | ------------------------------ | -------------- |
| Mới tạo              | false       | true                | ✅ Hiển thị                    | ✅ Có          |
| Vô hiệu hóa tạm thời | false       | false               | ✅ Hiển thị (badge "Tạm dừng") | ❌ Không       |
| Đã xóa               | true        | true/false          | ❌ KHÔNG hiển thị              | ❌ Không       |

---

## ✅ Ưu điểm

1. **Tách biệt logic rõ ràng:**

   - `isDeleted` → Quản lý vòng đời dữ liệu (xóa/khôi phục)
   - `TrangThaiHoatDong` → Quản lý trạng thái nghiệp vụ (bật/tắt)

2. **Linh hoạt:**

   - Có thể thêm tính năng "Khôi phục tiêu chí đã xóa" sau
   - Có thể lọc riêng "đã xóa" và "đã vô hiệu hóa"

3. **An toàn dữ liệu:**

   - Không mất data khi xóa
   - Có thể audit log sau này

4. **Query hiệu quả:**
   - Index trên `isDeleted` → Query nhanh
   - Filter ở database level → Giảm tải client

---

## 🧪 Cách test

1. **Test xóa:**

   - Xóa 1 tiêu chí → Biến mất
   - F5 trang → Vẫn không thấy ✅

2. **Test vô hiệu hóa:**

   - Toggle "Trạng thái hoạt động" → OFF
   - Item vẫn hiển thị với badge "Tạm dừng" ✅
   - F5 trang → Vẫn hiển thị ✅

3. **Test database:**

   ```javascript
   // Item đã xóa
   { isDeleted: true, TrangThaiHoatDong: true }

   // Item vô hiệu hóa
   { isDeleted: false, TrangThaiHoatDong: false }

   // Item bình thường
   { isDeleted: false, TrangThaiHoatDong: true }
   ```

---

## 📝 Files đã sửa

### Backend:

1. ✅ `TieuChiDanhGia.js` - Thêm field `isDeleted`, index, cập nhật static methods
2. ✅ `tieuChiDanhGia.controller.js` - Filter `isDeleted: false` trong tất cả queries

### Frontend:

1. ✅ `kpiSlice.js` - Reducer set `isDeleted = true` thay vì xóa khỏi array
2. ✅ `TieuChiDanhGiaList.js` - Filter `!item.isDeleted`

---

**Kết luận:** Soft delete với `isDeleted` riêng biệt đã hoàn thành! 🎉
