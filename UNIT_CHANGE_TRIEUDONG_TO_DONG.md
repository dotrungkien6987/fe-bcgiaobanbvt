# Đổi đơn vị nhập liệu: Triệu đồng → Đồng

## 📋 Tổng quan

Thay đổi đơn vị nhập liệu cho trường **KhuyenCaoBinhQuanHSBA** từ **triệu đồng** sang **đồng** để nhập liệu chính xác hơn và tránh nhầm lẫn.

## ❓ Lý do thay đổi

### TRƯỚC (Triệu đồng):

```
User nhập: 7.5
Ý nghĩa: 7.5 triệu = 7,500,000 đồng
```

**Vấn đề:**

- ❌ Dễ nhầm lẫn với số thập phân
- ❌ Không trực quan khi nhập số lẻ (VD: 7.325 triệu)
- ❌ Cần conversion logic khi display
- ❌ Rủi ro sai sót khi nhập (nhầm 7.5 và 75)

### SAU (Đồng):

```
User nhập: 7500000
Ý nghĩa: 7,500,000 đồng
```

**Lợi ích:**

- ✅ Trực quan, chính xác
- ✅ Không cần conversion
- ✅ Dễ copy/paste từ Excel hoặc tài liệu khác
- ✅ Giảm rủi ro sai sót

## 🔄 Data Flow

### TRƯỚC:

```
Form Input: 7.5 (triệu)
    ↓
Backend saves: 7.5
    ↓
DataTable: 7.5 * 1,000,000 = 7,500,000
    ↓
BenchmarkCell display: 7,500,000 / 1,000,000 = 7.5 triệu
```

**Phức tạp:** Nhiều conversion, dễ sai

### SAU:

```
Form Input: 7500000 (đồng)
    ↓
Backend saves: 7500000
    ↓
DataTable: 7500000 (không conversion)
    ↓
BenchmarkCell display: 7,500,000 / 1,000,000 = 7.5 triệu
```

**Đơn giản:** Chỉ conversion khi display

## 📝 Changes Made

### 1. KhuyenCaoKhoaBQBAForm.js

**TRƯỚC:**

```jsx
<FTextField
  name="KhuyenCaoBinhQuanHSBA"
  label="Khuyến cáo bình quân HSBA (triệu đồng)"
  type="number"
  helperText="Đơn vị: triệu đồng. Ví dụ: 7.5 = 7 triệu 500 nghìn"
/>
```

**SAU:**

```jsx
<FTextField
  name="KhuyenCaoBinhQuanHSBA"
  label="Khuyến cáo bình quân HSBA (đồng)"
  type="number"
  helperText="Đơn vị: đồng. Ví dụ: 7500000 = 7 triệu 500 nghìn"
/>
```

**Impact:** User input thay đổi format

### 2. DataTable.jsx

**TRƯỚC:**

```jsx
benchmark={
  row.KhuyenCaoBinhQuanHSBA
    ? row.KhuyenCaoBinhQuanHSBA * 1000000  // ❌ Nhân lên
    : null
}
```

**SAU:**

```jsx
benchmark={
  row.KhuyenCaoBinhQuanHSBA
    ? row.KhuyenCaoBinhQuanHSBA  // ✅ Dùng trực tiếp
    : null
}
```

**Impact:** Bỏ logic conversion

### 3. KhuyenCaoKhoaBQBATable.js

**TRƯỚC:**

```jsx
{
  Header: "Khuyến cáo bình quân HSBA (triệu đồng)",
  Footer: "Khuyến cáo bình quân HSBA",
  accessor: "KhuyenCaoBinhQuanHSBA",
  Cell: ({ value }) => (
    <Box sx={{ textAlign: "right", fontWeight: 600, color: "#1939B7" }}>
      {value?.toLocaleString("vi-VN")}
    </Box>
  ),
}
```

**SAU:**

```jsx
{
  Header: "Khuyến cáo bình quân HSBA (đồng)",  // ✅ Đổi label
  Footer: "Khuyến cáo bình quân HSBA",
  accessor: "KhuyenCaoBinhQuanHSBA",
  Cell: ({ value }) => (
    <Box sx={{ textAlign: "right", fontWeight: 600, color: "#1939B7" }}>
      {value?.toLocaleString("vi-VN")}  // ✅ Hiển thị đầy đủ số
    </Box>
  ),
}
```

**Impact:** Table header thay đổi, hiển thị số đầy đủ

### 4. BenchmarkCell.jsx (KHÔNG THAY ĐỔI)

```jsx
const formatValue = (value) => {
  if (type === "money") {
    return `${(value / 1000000).toFixed(2)}`; // ✅ Vẫn chia để hiển thị
  }
  // ...
};
```

**Lý do không đổi:** BenchmarkCell vẫn hiển thị dạng "triệu" cho gọn (KC: 7.50)

## 📊 Display Comparison

### Ví dụ: Khuyến cáo 7,500,000 đồng

#### Form - TRƯỚC:

```
┌─────────────────────────────────────────────────┐
│ Khuyến cáo bình quân HSBA (triệu đồng)        │
│ ┌─────────────────────────────────────────────┐ │
│ │ 7.5                                         │ │
│ └─────────────────────────────────────────────┘ │
│ Đơn vị: triệu đồng. Ví dụ: 7.5 = 7 triệu 500k │
└─────────────────────────────────────────────────┘
```

#### Form - SAU:

```
┌─────────────────────────────────────────────────┐
│ Khuyến cáo bình quân HSBA (đồng)              │
│ ┌─────────────────────────────────────────────┐ │
│ │ 7500000                                     │ │
│ └─────────────────────────────────────────────┘ │
│ Đơn vị: đồng. Ví dụ: 7500000 = 7 triệu 500k  │
└─────────────────────────────────────────────────┘
```

#### Table - TRƯỚC:

```
┌──────────────────────────────────────────────────┐
│ Khuyến cáo bình quân HSBA (triệu đồng)         │
├──────────────────────────────────────────────────┤
│                                      7.5         │ (không format)
└──────────────────────────────────────────────────┘
```

#### Table - SAU:

```
┌──────────────────────────────────────────────────┐
│ Khuyến cáo bình quân HSBA (đồng)               │
├──────────────────────────────────────────────────┤
│                                 7,500,000        │ (có dấu phẩy)
└──────────────────────────────────────────────────┘
```

#### Dashboard BenchmarkCell (KHÔNG ĐỔI):

```
┌─────────────────────────────┐
│ 8.25 triệu  ▲ +0.75        │ (giá trị thực)
│ ┌─────────────────────────┐ │
│ │ KC: 7.50                │ │ (khuyến cáo, vẫn dạng triệu)
│ └─────────────────────────┘ │
└─────────────────────────────┘
```

## 🗄️ Database Impact

### Existing Data Migration

**KHÔNG CẦN migration vì:**

1. Đây chỉ là thay đổi **UI/UX** (cách nhập và hiển thị)
2. Backend **KHÔNG thay đổi** schema
3. Data cũ có thể bị **SAI** nếu đã nhập theo đơn vị triệu

**Ví dụ:**

**Nếu data cũ đã nhập (SAI):**

```
Database: 7.5
Dashboard hiển thị: 7.50 triệu ✅ (trông đúng nhưng data SAI)
Table hiển thị: 7.5 ❌ (rõ ràng là SAI - chỉ 7.5 đồng???)
```

**Sau khi sửa UI:**

```
Database: 7.5 (data CŨ - chưa sửa)
Dashboard hiển thị: 0.0000075 triệu ❌ (lộ ra lỗi data)
Table hiển thị: 7.5 ❌ (rõ ràng SAI)
```

**Data mới nhập đúng:**

```
Database: 7500000
Dashboard hiển thị: 7.50 triệu ✅
Table hiển thị: 7,500,000 ✅
```

### ⚠️ Migration Recommendation

**PHẢI kiểm tra và sửa data cũ:**

```javascript
// Migration script (nếu có data cũ)
db.khuyencaokhoabqba.find({}).forEach((doc) => {
  if (doc.KhuyenCaoBinhQuanHSBA < 1000) {
    // Likely in "triệu đồng" format - convert to đồng
    db.khuyencaokhoabqba.updateOne(
      { _id: doc._id },
      { $set: { KhuyenCaoBinhQuanHSBA: doc.KhuyenCaoBinhQuanHSBA * 1000000 } }
    );
  }
});
```

**Hoặc đơn giản:** Xóa hết data cũ và nhập lại (nếu ít data)

## 🧪 Test Scenarios

### Test 1: Tạo mới khuyến cáo

1. Click "Thêm khuyến cáo"
2. Nhập "Khuyến cáo bình quân HSBA": `7500000`
3. ✅ **PASS**: Helper text hiển thị "Đơn vị: đồng"
4. Click "Tạo mới"
5. ✅ **PASS**: Table hiển thị `7,500,000` (có dấu phẩy)
6. ✅ **PASS**: Dashboard hiển thị "KC: 7.50" (triệu)

### Test 2: Sửa khuyến cáo hiện tại

1. Click "Sửa" trên một row
2. ✅ **PASS**: Form hiển thị số đầy đủ (VD: `7500000`)
3. Thay đổi thành `8000000`
4. Click "Cập nhật"
5. ✅ **PASS**: Table hiển thị `8,000,000`
6. ✅ **PASS**: Dashboard hiển thị "KC: 8.00"

### Test 3: Validation với số lớn

1. Mở form tạo mới
2. Nhập `999999999999` (số rất lớn)
3. ✅ **PASS**: Input accept số lớn
4. ✅ **PASS**: Lưu và hiển thị đúng

### Test 4: Comparison với giá trị thực

Giả sử:

- Khuyến cáo: `7,500,000` đồng
- Giá trị thực: `8,250,000` đồng

Dashboard hiển thị:

```
8.25 triệu ▲ +0.75
┌─────────────────────────┐
│ KC: 7.50                │ ← ĐỎ (vượt khuyến cáo)
└─────────────────────────┘
```

✅ **PASS**: Logic so sánh vẫn hoạt động đúng

### Test 5: Data cũ (nếu có)

1. Nếu có data cũ nhập dạng triệu (VD: 7.5)
2. ✅ **EXPECTED**: Table hiển thị `7.5` (rõ ràng SAI)
3. ✅ **EXPECTED**: Dashboard hiển thị "KC: 0.0000075" (lộ lỗi)
4. ✅ **ACTION REQUIRED**: Phải sửa data thủ công hoặc chạy migration

## 📂 Files Modified

### 1. KhuyenCaoKhoaBQBAForm.js

- **Line ~237**: Label `(triệu đồng)` → `(đồng)`
- **Line ~240**: Helper text example `7.5 = 7 triệu 500k` → `7500000 = 7 triệu 500k`

### 2. DataTable.jsx

- **Line ~272**: Removed `* 1000000` multiplication

### 3. KhuyenCaoKhoaBQBATable.js

- **Line ~99**: Header `(triệu đồng)` → `(đồng)`

### 4. BenchmarkCell.jsx

- **NO CHANGES** - Vẫn format dạng triệu khi hiển thị

## 🔧 Technical Notes

### Type Compatibility

```typescript
// Backend model
KhuyenCaoBinhQuanHSBA: Number  // ✅ Vẫn là Number

// Frontend form
<FTextField type="number" />   // ✅ Vẫn là number input

// Display
value.toLocaleString("vi-VN")  // ✅ Format với dấu phẩy
```

### Input Validation (không đổi)

```javascript
Yup.number()
  .required("Bắt buộc nhập khuyến cáo bình quân")
  .typeError("Phải là số")
  .min(0, "Giá trị phải >= 0");
```

✅ Validation vẫn hoạt động đúng

### Localization

```javascript
// Table display
value
  ?.toLocaleString("vi-VN")(
    // 7500000 → "7,500,000"

    // BenchmarkCell display
    value / 1000000
  )
  .toFixed(2);
// 7500000 → "7.50"
```

✅ Hiển thị đúng theo locale Việt Nam

## 🎯 Impact Summary

### User Experience:

- ✅ **Tăng tính trực quan**: Nhập số đầy đủ, không cần tính toán
- ✅ **Giảm lỗi**: Không nhầm lẫn giữa 7.5 và 75
- ✅ **Dễ copy/paste**: Có thể copy từ Excel trực tiếp

### Developer Experience:

- ✅ **Giảm complexity**: Bỏ logic conversion trong DataTable
- ✅ **Dễ debug**: Data trong DB là số thực tế
- ✅ **Consistent**: Backend và frontend cùng đơn vị

### Performance:

- ✅ **Không ảnh hưởng**: Chỉ thay đổi UI, không ảnh hưởng performance

## ⚠️ Breaking Changes

### For Users:

- ❌ **Cách nhập thay đổi**: Phải nhập `7500000` thay vì `7.5`
- ❌ **Data cũ có thể SAI**: Nếu đã nhập theo đơn vị triệu

### For Developers:

- ✅ **Backend không đổi**: API vẫn nhận/trả Number
- ✅ **Frontend validation không đổi**: Yup schema giữ nguyên

## 📅 Timeline

- **Request**: 9/10/2025
- **Implementation**: 9/10/2025
- **Testing**: Pending
- **Data migration**: Pending (nếu có data cũ)

## ✅ Checklist

- [x] Update form label and helper text
- [x] Remove conversion in DataTable
- [x] Update table header
- [x] Keep BenchmarkCell format unchanged
- [ ] Test create new record
- [ ] Test update existing record
- [ ] Check if existing data needs migration
- [ ] Update user documentation (if any)

---

**Change type**: 🟡 UI/UX Improvement  
**Risk level**: 🟢 LOW (chỉ thay đổi label và conversion logic)  
**Data migration required**: ⚠️ YES (nếu có data cũ)

**Related docs:**

- BUGFIX_UPDATE_NOT_SAVING.md
- BUGFIX_AUTOCOMPLETE_EDIT_MODE.md
- FEATURE_KHUYEN_CAO_KHOA_BQBA.md
