# 🐛 Fix: Tiêu chí đánh giá xuất hiện lại sau khi xóa và F5

**Ngày:** October 6, 2025  
**Vấn đề:** Sau khi xóa tiêu chí, frontend hiển thị đã xóa, nhưng khi F5 lại xuất hiện

---

## 🔍 Nguyên nhân

### Backend (Soft Delete)

```javascript
// tieuChiDanhGia.controller.js - xoa()
tieuChi.TrangThaiHoatDong = false; // ✅ Vô hiệu hóa, KHÔNG xóa khỏi DB
await tieuChi.save();
```

### Frontend (Hard Delete - SAI)

```javascript
// kpiSlice.js - deleteTieuChiDanhGiaSuccess (TRƯỚC)
state.tieuChiDanhGias = state.tieuChiDanhGias.filter(
  (item) => item._id !== action.payload // ❌ Xóa khỏi state
);
```

### Kết quả

1. User xóa → Frontend xóa khỏi state → Không hiển thị ✅
2. User F5 → Gọi `getTieuChiDanhGias()` → Backend trả về TẤT CẢ (kể cả vô hiệu hóa) → Item xuất hiện lại ❌

---

## ✅ Giải pháp

### 1️⃣ Sửa Redux reducer (kpiSlice.js)

**Trước (SAI):**

```javascript
deleteTieuChiDanhGiaSuccess(state, action) {
  state.tieuChiDanhGias = state.tieuChiDanhGias.filter(
    (item) => item._id !== action.payload  // ❌ Hard delete
  );
}
```

**Sau (ĐÚNG):**

```javascript
deleteTieuChiDanhGiaSuccess(state, action) {
  state.isLoading = false;
  state.error = null;
  // Soft delete: Cập nhật TrangThaiHoatDong = false
  const index = state.tieuChiDanhGias.findIndex(
    (item) => item._id === action.payload
  );
  if (index !== -1) {
    state.tieuChiDanhGias[index].TrangThaiHoatDong = false;  // ✅ Soft delete
  }
}
```

### 2️⃣ Filter data trong component (TieuChiDanhGiaList.js)

**Trước:**

```javascript
const data = useMemo(() => tieuChiDanhGias, [tieuChiDanhGias]);
// ❌ Hiển thị TẤT CẢ (kể cả đã vô hiệu hóa)
```

**Sau:**

```javascript
// Chỉ hiển thị tiêu chí đang hoạt động
const data = useMemo(
  () => tieuChiDanhGias.filter((item) => item.TrangThaiHoatDong !== false),
  [tieuChiDanhGias]
);
// ✅ Chỉ hiển thị TrangThaiHoatDong = true
```

---

## 📊 Luồng hoạt động SAU KHI SỬA

### Kịch bản 1: Xóa tiêu chí

```
1. User click "Xóa"
2. Frontend gọi DELETE /api/workmanagement/tieu-chi-danh-gia/:id
3. Backend set TrangThaiHoatDong = false, lưu vào DB
4. Frontend nhận response → dispatch deleteTieuChiDanhGiaSuccess(tieuChiId)
5. Redux reducer tìm item trong state, set TrangThaiHoatDong = false
6. Component filter: item.TrangThaiHoatDong = false → KHÔNG hiển thị ✅
7. Toast: "Xóa tiêu chí thành công" ✅
```

### Kịch bản 2: F5 trang sau khi xóa

```
1. User F5
2. Frontend gọi GET /api/workmanagement/tieu-chi-danh-gia
3. Backend trả về TẤT CẢ tiêu chí (bao gồm TrangThaiHoatDong = false)
4. Redux lưu vào state.tieuChiDanhGias (có cả item đã vô hiệu hóa)
5. Component filter: item.TrangThaiHoatDong = false → KHÔNG hiển thị ✅
6. Item đã xóa KHÔNG xuất hiện lại ✅
```

---

## 🎯 Ưu điểm của giải pháp

✅ **Nhất quán** với backend (soft delete)  
✅ **Bảo toàn dữ liệu** - Có thể khôi phục sau này  
✅ **Linh hoạt** - Có thể thêm tính năng "Hiển thị cả tiêu chí đã vô hiệu hóa" sau  
✅ **Không mất data** sau F5  
✅ **Redux state đồng bộ** với database

---

## 🧪 Cách test

1. **Xóa tiêu chí:**

   - Vào `/quanlycongviec/kpi/tieu-chi`
   - Click "Xóa" một tiêu chí
   - Kiểm tra: Tiêu chí biến mất khỏi danh sách ✅

2. **F5 trang:**

   - Sau khi xóa, nhấn F5
   - Kiểm tra: Tiêu chí đã xóa KHÔNG xuất hiện lại ✅

3. **Kiểm tra database:**

   - Vào MongoDB
   - Tìm tiêu chí vừa xóa
   - Kiểm tra: `TrangThaiHoatDong = false` ✅

4. **Kiểm tra Redux DevTools:**
   - Sau khi xóa, mở Redux DevTools
   - Kiểm tra `state.kpi.tieuChiDanhGias`
   - Item vẫn tồn tại nhưng `TrangThaiHoatDong = false` ✅

---

## 📝 Files đã sửa

1. ✅ `kpiSlice.js` - Reducer `deleteTieuChiDanhGiaSuccess`
2. ✅ `TieuChiDanhGiaList.js` - Filter data theo `TrangThaiHoatDong`

---

**Kết luận:** Vấn đề đã được khắc phục hoàn toàn! 🎉
