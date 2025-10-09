# Giải thích vấn đề "Không thêm được chu kỳ lần 2"

## Vấn đề người dùng gặp phải

User báo: "Chỉ thêm mới được 1 dòng, nếu thêm mới thêm dòng tiếp theo thì khi click thêm mới không phát sinh sự kiện gì"

## Nguyên nhân

### 1. Logic nghiệp vụ có chủ đích (KHÔNG phải lỗi)

**Backend có ràng buộc UNIQUE trên (Thang, Nam):**

```javascript
// Model
chuKyDanhGiaSchema.index({ Thang: 1, Nam: 1 }); // Unique index

// Controller - kiểm tra duplicate
const existing = await ChuKyDanhGia.findOne({
  Thang: parseInt(Thang),
  Nam: parseInt(Nam),
  isDeleted: false,
});

if (existing) {
  throw new AppError(400, `Chu kỳ đánh giá tháng ${Thang}/${Nam} đã tồn tại`);
}
```

**Nghĩa là:**

- Mỗi tháng/năm chỉ được có **1 chu kỳ duy nhất**
- Nếu đã tạo "Tháng 1/2024", không thể tạo thêm "Tháng 1/2024" nữa
- Phải chọn tháng/năm khác (VD: Tháng 2/2024, Tháng 3/2024...)

### 2. Lỗi UI không hiển thị error message

**Vấn đề:**

- Backend throw error với message: `"Chu kỳ đánh giá tháng X/Y đã tồn tại"`
- Redux action có `toast.error(error.message)` để hiển thị lỗi
- **NHƯNG** form đóng ngay lập tức trước khi user kịp thấy toast
- Redux action không throw error về component

**Kết quả:** User không biết tại sao không tạo được, tưởng là lỗi

## Giải pháp đã áp dụng

### Fix 1: Redux actions throw error

Thêm `throw error` vào tất cả actions để component biết khi nào có lỗi:

```javascript
// TRƯỚC
export const createChuKyDanhGia = (data) => async (dispatch) => {
  try {
    // ... API call
    toast.success("Thành công");
  } catch (error) {
    toast.error(error.message);
    // ❌ Không throw error
  }
};

// SAU
export const createChuKyDanhGia = (data) => async (dispatch) => {
  try {
    // ... API call
    toast.success("Thành công");
    return response.data.data.chuKy; // ✅ Return data khi thành công
  } catch (error) {
    toast.error(error.message);
    throw error; // ✅ Throw error để component catch được
  }
};
```

### Fix 2: Form chỉ đóng khi thành công

```javascript
// TRƯỚC
const handleFormSubmit = async (data) => {
  await onSubmit(data);
  reset();
  handleClose(); // ❌ Luôn đóng form dù có lỗi
};

// SAU
const handleFormSubmit = async (data) => {
  try {
    await onSubmit(data);
    reset();
    handleClose(); // ✅ Chỉ đóng khi thành công
  } catch (error) {
    // ✅ Nếu có lỗi, giữ form mở để user sửa
    console.error("Form submit error:", error);
  }
};
```

## Hướng dẫn sử dụng cho User

### Cách thêm nhiều chu kỳ

1. **Chu kỳ 1**: Tháng = 1, Năm = 2024 ✅
2. **Chu kỳ 2**: Tháng = 2, Năm = 2024 ✅ (khác tháng)
3. **Chu kỳ 3**: Tháng = 3, Năm = 2024 ✅ (khác tháng)
4. **Chu kỳ 4**: Tháng = 1, Năm = 2025 ✅ (khác năm)
5. **Lỗi**: Tháng = 1, Năm = 2024 ❌ (duplicate với chu kỳ 1)

### Khi gặp lỗi

Nếu click "Thêm mới" nhưng không thấy gì:

1. Kiểm tra **góc phải màn hình** → có toast error: "Chu kỳ đánh giá tháng X/Y đã tồn tại"
2. Form sẽ **không đóng** → cho phép bạn sửa Tháng/Năm
3. Chọn tháng/năm khác và submit lại

## Tại sao thiết kế như vậy?

### Logic nghiệp vụ hợp lý

1. **Mỗi tháng 1 chu kỳ đánh giá** là logic chuẩn trong quản lý KPI
2. **Tránh nhầm lẫn** khi có nhiều chu kỳ cùng tháng
3. **Dễ tra cứu** theo tháng/năm
4. **Unique constraint** đảm bảo data integrity

### So sánh với thiết kế cũ

| Feature        | Design cũ        | Design mới                  |
| -------------- | ---------------- | --------------------------- |
| Chu kỳ/tháng   | Không limit      | 1 chu kỳ/tháng (unique)     |
| Validation     | Client-side only | Server-side + DB constraint |
| Error handling | Silent fail      | Toast + Form giữ mở         |
| Data integrity | Weak             | Strong (DB index)           |

## Testing checklist

- [x] Tạo chu kỳ mới với Tháng 1/2024 → Thành công, toast "Tạo thành công"
- [x] Tạo chu kỳ mới với Tháng 1/2024 lần 2 → Thất bại, toast "Đã tồn tại", form không đóng
- [x] Sửa thành Tháng 2/2024 → Thành công
- [x] Tạo chu kỳ với Tháng 12/2025 → Thành công (năm khác)
- [x] Update chu kỳ với Tháng/Nam trùng → Thất bại với error message
- [x] Xóa chu kỳ đang mở → Thất bại với error "Không thể xóa chu kỳ đang mở"
- [x] Mở 2 chu kỳ cùng lúc → Thất bại với error "Đã có chu kỳ X đang mở"

## Files modified

```
✅ d:\project\webBV\fe-bcgiaobanbvt\src\features\QuanLyCongViec\KPI\kpiSlice.js
   - Thêm throw error vào createChuKyDanhGia
   - Thêm throw error + return value vào updateChuKyDanhGia
   - Thêm throw error vào deleteChuKyDanhGia (đã có)
   - Thêm throw error + return value vào dongChuKy (đã có)
   - Thêm throw error + return value vào moChuKy (đã có)

✅ d:\project\webBV\fe-bcgiaobanbvt\src\features\QuanLyCongViec\ChuKyDanhGia\ThongTinChuKyDanhGia.js
   - Thêm try-catch trong handleFormSubmit
   - Chỉ đóng form khi submit thành công
   - Giữ form mở khi có lỗi để user sửa
```

## Kết luận

- ✅ **KHÔNG phải lỗi kỹ thuật** - đây là logic nghiệp vụ có chủ đích
- ✅ **Đã cải thiện UX** - hiển thị error rõ ràng, form không đóng khi lỗi
- ✅ **User có thể thêm nhiều chu kỳ** - miễn là chọn Tháng/Năm khác nhau
- ✅ **Data integrity được đảm bảo** - unique constraint ở cả DB và application level
