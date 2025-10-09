# Cập nhật FAutocomplete cho Form Khuyến Cáo Khoa BQBA

## 📋 Tổng quan

Cập nhật `KhuyenCaoKhoaBQBAForm.js` để sử dụng **FAutocomplete** thay vì dropdown select cho việc chọn khoa, mang lại trải nghiệm người dùng tốt hơn với tính năng tìm kiếm và lọc.

## ✨ Các thay đổi chính

### 1. **Component thay đổi: Select → Autocomplete**

**Trước:**

```javascript
<FTextField name="KhoaID" label="Chọn khoa" select disabled={!!item}>
  <MenuItem value={0}>-- Chọn khoa --</MenuItem>
  {khoaList.map((khoa) => (
    <MenuItem key={khoa.KhoaID} value={khoa.KhoaID}>
      {khoa.TenKhoa} (ID: {khoa.KhoaID})
    </MenuItem>
  ))}
</FTextField>
```

**Sau:**

```javascript
<FAutocomplete
  name="KhoaID"
  label="Chọn khoa"
  options={khoaList}
  displayField="TenKhoa"
  getOptionLabel={(option) =>
    option && option.TenKhoa
      ? `${option.TenKhoa} (ID: ${option.KhoaID} - ${
          option.LoaiKhoa === "noitru" ? "Nội trú" : "Ngoại trú"
        })`
      : ""
  }
  isOptionEqualToValue={(option, value) =>
    option?.KhoaID === value?.KhoaID && option?.LoaiKhoa === value?.LoaiKhoa
  }
/>
```

### 2. **Data structure: Number → Object**

**Trước (chỉ lưu ID):**

```javascript
defaultValues: {
  KhoaID: 0,  // chỉ lưu number
}
```

**Sau (lưu toàn bộ object):**

```javascript
defaultValues: {
  KhoaID: null,  // lưu object { KhoaID, TenKhoa, LoaiKhoa }
}
```

### 3. **Validation schema update**

**Trước:**

```javascript
KhoaID: Yup.number()
  .required("Bắt buộc chọn khoa")
  .typeError("Mã khoa phải là số"),
```

**Sau:**

```javascript
KhoaID: Yup.object()
  .nullable()
  .required("Bắt buộc chọn khoa")
  .test("is-valid-khoa", "Bắt buộc chọn khoa", (value) => {
    return value && value.KhoaID;
  }),
```

### 4. **Auto-fill logic enhancement**

**Trước (chỉ fill TenKhoa):**

```javascript
useEffect(() => {
  if (!item && selectedKhoaID && khoaList.length > 0) {
    const khoa = khoaList.find((k) => k.KhoaID === parseInt(selectedKhoaID));
    if (khoa) {
      setValue("TenKhoa", khoa.TenKhoa);
    }
  }
}, [selectedKhoaID, khoaList, item, setValue]);
```

**Sau (fill cả TenKhoa và LoaiKhoa):**

```javascript
useEffect(() => {
  if (selectedKhoa && typeof selectedKhoa === "object") {
    setValue("TenKhoa", selectedKhoa.TenKhoa || "");
    // Auto-fill LoaiKhoa
    if (selectedKhoa.LoaiKhoa) {
      setValue("LoaiKhoa", selectedKhoa.LoaiKhoa);
    }
  } else if (!selectedKhoa) {
    setValue("TenKhoa", "");
  }
}, [selectedKhoa, item, setValue]);
```

### 5. **Submit data extraction**

**Trước:**

```javascript
const onSubmitData = async (data) => {
  await dispatch(createKhuyenCao(data)); // data.KhoaID đã là number
};
```

**Sau:**

```javascript
const onSubmitData = async (data) => {
  const submitData = {
    ...data,
    KhoaID:
      typeof data.KhoaID === "object"
        ? data.KhoaID.KhoaID // extract number từ object
        : data.KhoaID,
  };
  await dispatch(createKhuyenCao(submitData));
};
```

### 6. **Edit mode - find object from list**

**Trước:**

```javascript
reset({
  KhoaID: item.KhoaID, // chỉ set number
  // ...
});
```

**Sau:**

```javascript
const khoaObj = khoaList.find(
  (k) => k.KhoaID === item.KhoaID && k.LoaiKhoa === item.LoaiKhoa
);

reset({
  KhoaID: khoaObj || null, // set object hoặc null
  // ...
});
```

### 7. **LoaiKhoa display với Vietnamese text**

**Trước:**

```javascript
<FTextField name="LoaiKhoa" label="Loại khoa" select disabled={!!item}>
  <MenuItem value="noitru">Nội trú</MenuItem>
  <MenuItem value="ngoaitru">Ngoại trú</MenuItem>
</FTextField>
```

**Sau (sử dụng Controller để format display):**

```javascript
<Controller
  name="LoaiKhoa"
  control={control}
  render={({ field: { value } }) => (
    <TextField
      label="Loại khoa"
      value={
        value === "noitru"
          ? "Nội trú"
          : value === "ngoaitru"
          ? "Ngoại trú"
          : value || ""
      }
      disabled
      variant="standard"
      fullWidth
      margin="normal"
      helperText="Tự động điền khi chọn khoa"
      InputProps={{ readOnly: true }}
    />
  )}
/>
```

## 🎯 Lợi ích

### 1. **Trải nghiệm người dùng tốt hơn**

- ✅ Tìm kiếm khoa bằng cách gõ tên
- ✅ Lọc danh sách tự động khi nhập
- ✅ Hiển thị đầy đủ thông tin: Tên khoa + ID + Loại khoa
- ✅ Tooltip hiển thị toàn bộ nội dung khi hover

### 2. **Có thể cập nhật khoa khi sửa**

- ✅ **Trước:** Khóa field KhoaID khi edit (`disabled={!!item}`)
- ✅ **Sau:** Cho phép thay đổi khoa ngay cả khi đang sửa
- ✅ Hữu ích khi cần sửa lỗi chọn nhầm khoa

### 3. **Tự động điền thông tin**

- ✅ Chọn khoa → TenKhoa tự động điền
- ✅ Chọn khoa → LoaiKhoa tự động điền
- ✅ Giảm lỗi nhập liệu

### 4. **Hiển thị tiếng Việt cho LoaiKhoa**

- ✅ Hiển thị "Nội trú" thay vì "noitru"
- ✅ Hiển thị "Ngoại trú" thay vì "ngoaitru"
- ✅ Dễ đọc hơn cho người dùng

## 📝 Danh sách các file thay đổi

### Modified:

1. **KhuyenCaoKhoaBQBAForm.js** (~260 lines)
   - Import thêm `FAutocomplete`, `Controller`, `TextField`
   - Thay đổi Yup schema cho KhoaID
   - Cập nhật defaultValues
   - Thay đổi auto-fill logic
   - Thêm extraction logic trong onSubmitData
   - Cập nhật reset logic cho edit mode
   - Thay FTextField select → FAutocomplete
   - Thêm Controller cho LoaiKhoa display

## 🧪 Test scenarios

### Test 1: Tạo mới khuyến cáo

1. Click "Thêm khuyến cáo"
2. Click vào Autocomplete "Chọn khoa"
3. Gõ tên khoa để tìm kiếm (VD: "Ngoại")
4. Chọn khoa từ danh sách
5. ✅ Kiểm tra TenKhoa tự động điền
6. ✅ Kiểm tra LoaiKhoa tự động điền với text tiếng Việt
7. Nhập khuyến cáo bình quân và tỷ lệ
8. Click "Tạo mới"
9. ✅ Kiểm tra data gửi lên backend đúng format

### Test 2: Sửa khuyến cáo

1. Click "Sửa" trên một khuyến cáo hiện có
2. ✅ Kiểm tra Autocomplete hiển thị đúng khoa đã chọn
3. ✅ Kiểm tra có thể đổi sang khoa khác (không bị disabled)
4. Thay đổi khoa
5. ✅ Kiểm tra TenKhoa và LoaiKhoa cập nhật theo
6. Click "Cập nhật"
7. ✅ Kiểm tra data gửi lên backend đúng

### Test 3: Validation

1. Mở form tạo mới
2. Để trống "Chọn khoa"
3. Click "Tạo mới"
4. ✅ Kiểm tra hiển thị lỗi "Bắt buộc chọn khoa"

### Test 4: Display tiếng Việt

1. Chọn khoa có LoaiKhoa = "noitru"
2. ✅ Kiểm tra field "Loại khoa" hiển thị "Nội trú"
3. Chọn khoa có LoaiKhoa = "ngoaitru"
4. ✅ Kiểm tra field "Loại khoa" hiển thị "Ngoại trú"

## 🔧 Technical notes

### Composite key matching

```javascript
isOptionEqualToValue={(option, value) =>
  option?.KhoaID === value?.KhoaID &&
  option?.LoaiKhoa === value?.LoaiKhoa
}
```

Đảm bảo matching đúng theo composite key (KhoaID + LoaiKhoa).

### Data format transformation

```javascript
// Form value (object): { KhoaID: 123, TenKhoa: "Nội A", LoaiKhoa: "noitru" }
// Backend expects (number): 123

const submitData = {
  ...data,
  KhoaID: typeof data.KhoaID === "object" ? data.KhoaID.KhoaID : data.KhoaID,
};
```

### Edit mode object reconstruction

```javascript
// Backend returns: { KhoaID: 123, TenKhoa: "Nội A", LoaiKhoa: "noitru" }
// Need to find matching object from khoaList for Autocomplete

const khoaObj = khoaList.find(
  (k) => k.KhoaID === item.KhoaID && k.LoaiKhoa === item.LoaiKhoa
);
```

## 🎨 UI Enhancement

### Autocomplete label format

```
Khoa Nội A (ID: 123 - Nội trú)
Khoa Ngoại B (ID: 456 - Ngoại trú)
```

Mỗi option hiển thị đầy đủ:

- Tên khoa
- Mã khoa (KhoaID)
- Loại khoa (tiếng Việt)

## ✅ Status

- [x] Import FAutocomplete component
- [x] Thay đổi Yup validation schema
- [x] Cập nhật defaultValues
- [x] Thay đổi auto-fill logic
- [x] Thêm data extraction trong submit
- [x] Cập nhật edit mode logic
- [x] Thay thế FTextField select → FAutocomplete
- [x] Thêm Controller cho LoaiKhoa display
- [x] Cho phép sửa khoa trong edit mode
- [x] Hiển thị tiếng Việt cho LoaiKhoa
- [x] Test validation
- [x] Xóa import MenuItem không dùng

## 📌 Lưu ý

1. **Không disabled khi edit**: Khác với version cũ, giờ cho phép thay đổi khoa ngay cả khi đang sửa
2. **Auto-fill luôn hoạt động**: TenKhoa và LoaiKhoa tự động cập nhật mỗi khi chọn khoa mới
3. **Composite key validation**: Backend vẫn validate unique theo (KhoaID + LoaiKhoa + Nam)
4. **Vietnamese display**: LoaiKhoa hiển thị tiếng Việt nhưng vẫn lưu "noitru"/"ngoaitru" vào database

---

**Ngày cập nhật**: 9/10/2025  
**Người thực hiện**: GitHub Copilot  
**Related docs**: FEATURE_KHUYEN_CAO_KHOA_BQBA.md, IMPLEMENTATION_KHUYEN_CAO_SUMMARY.md
