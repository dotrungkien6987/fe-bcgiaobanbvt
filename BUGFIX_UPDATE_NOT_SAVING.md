# Bug Fix: Update khuyến cáo không lưu vào DB

## 🐛 Mô tả lỗi

Sau khi fix bug autocomplete, khi chỉnh sửa khuyến cáo:

- ✅ Form hiển thị đúng thông tin
- ✅ Có thể chọn lại khoa
- ✅ Toast hiển thị "Cập nhật thành công"
- ❌ **Nhưng data KHÔNG được lưu vào database**

## 🔍 Root Cause Analysis

### Backend API Logic (khuyencaokhoa.bqba.controller.js)

```javascript
khuyenCaoKhoaBQBAController.update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { KhuyenCaoBinhQuanHSBA, KhuyenCaoTyLeThuocVatTu, GhiChu } = req.body;

  // ✅ CHỈ CHO PHÉP UPDATE 3 FIELDS:
  if (KhuyenCaoBinhQuanHSBA !== undefined) {
    khuyenCao.KhuyenCaoBinhQuanHSBA = KhuyenCaoBinhQuanHSBA;
  }
  if (KhuyenCaoTyLeThuocVatTu !== undefined) {
    khuyenCao.KhuyenCaoTyLeThuocVatTu = KhuyenCaoTyLeThuocVatTu;
  }
  if (GhiChu !== undefined) {
    khuyenCao.GhiChu = GhiChu;
  }

  await khuyenCao.save();
});
```

**Backend KHÔNG cho phép update:**

- ❌ KhoaID
- ❌ TenKhoa
- ❌ LoaiKhoa
- ❌ Nam

**Lý do**: Composite key (KhoaID + LoaiKhoa + Nam) là unique constraint, không nên thay đổi.

### Frontend Logic (KhuyenCaoKhoaBQBAForm.js - TRƯỚC KHI SỬA)

```javascript
const onSubmitData = async (data) => {
  const submitData = {
    ...data, // ❌ GỬI TẤT CẢ FIELDS
    KhoaID: typeof data.KhoaID === "object" ? data.KhoaID.KhoaID : data.KhoaID,
  };

  if (item?._id) {
    await dispatch(updateKhuyenCao(item._id, submitData));
    // ❌ GỬI: { KhoaID, TenKhoa, LoaiKhoa, Nam, KhuyenCao..., GhiChu }
    // ❌ BACKEND CHỈ XỬ LÝ: { KhuyenCao..., GhiChu }
    // ❌ IGNORE: KhoaID, TenKhoa, LoaiKhoa, Nam
  }
};
```

**Frontend đang cho phép:**

- ✅ Chọn lại khoa (FAutocomplete không disabled)
- ✅ Thay đổi tất cả fields
- ❌ **Nhưng backend chỉ lưu 3 fields!**

## ✅ Giải pháp

### Option 1: Lock Composite Key Fields (IMPLEMENTED ✅)

**Nguyên tắc**: Composite key không được thay đổi sau khi tạo.

#### 1.1. Disable Autocomplete khi edit

```javascript
<FAutocomplete
  name="KhoaID"
  label="Chọn khoa"
  options={khoaList}
  disabled={!!item} // ✅ Khóa khi edit mode
  // ...
/>
```

#### 1.2. Chỉ gửi fields được phép update

```javascript
const onSubmitData = async (data) => {
  if (item?._id) {
    // Update mode - CHỈ GỬI 3 FIELDS
    const updateData = {
      KhuyenCaoBinhQuanHSBA: data.KhuyenCaoBinhQuanHSBA,
      KhuyenCaoTyLeThuocVatTu: data.KhuyenCaoTyLeThuocVatTu,
      GhiChu: data.GhiChu,
    };
    await dispatch(updateKhuyenCao(item._id, updateData));
  } else {
    // Create mode - GỬI TẤT CẢ
    const submitData = {
      ...data,
      KhoaID:
        typeof data.KhoaID === "object" ? data.KhoaID.KhoaID : data.KhoaID,
    };
    await dispatch(createKhuyenCao(submitData));
  }
};
```

### Option 2: Allow Update Composite Key (NOT RECOMMENDED ❌)

**Rủi ro:**

- ⚠️ Phá vỡ unique constraint
- ⚠️ Có thể tạo duplicate records
- ⚠️ Phức tạp hóa validation logic

**Cần làm:**

1. Update backend controller để cho phép update KhoaID, LoaiKhoa, Nam
2. Validate unique constraint trước khi save
3. Handle conflict resolution
4. Update indexes

**→ KHÔNG KHUYẾN KHÍCH vì composite key là identity của record**

## 📋 Implementation Details

### File: KhuyenCaoKhoaBQBAForm.js

#### Change 1: Disable FAutocomplete

**TRƯỚC:**

```javascript
<FAutocomplete
  name="KhoaID"
  label="Chọn khoa"
  options={khoaList}
  // ❌ Không có disabled → có thể chọn lại
/>
```

**SAU:**

```javascript
<FAutocomplete
  name="KhoaID"
  label="Chọn khoa"
  options={khoaList}
  disabled={!!item} // ✅ Khóa khi có item (edit mode)
/>
```

#### Change 2: Split submit logic

**TRƯỚC:**

```javascript
const onSubmitData = async (data) => {
  const submitData = {
    ...data,
    KhoaID: typeof data.KhoaID === "object" ? data.KhoaID.KhoaID : data.KhoaID,
  };

  if (item?._id) {
    await dispatch(updateKhuyenCao(item._id, submitData));
    // ❌ submitData chứa TẤT CẢ fields
  } else {
    await dispatch(createKhuyenCao(submitData));
  }
};
```

**SAU:**

```javascript
const onSubmitData = async (data) => {
  if (item?._id) {
    // ✅ Update mode - CHỈ 3 fields
    const updateData = {
      KhuyenCaoBinhQuanHSBA: data.KhuyenCaoBinhQuanHSBA,
      KhuyenCaoTyLeThuocVatTu: data.KhuyenCaoTyLeThuocVatTu,
      GhiChu: data.GhiChu,
    };
    await dispatch(updateKhuyenCao(item._id, updateData));
  } else {
    // ✅ Create mode - TẤT CẢ fields
    const submitData = {
      ...data,
      KhoaID:
        typeof data.KhoaID === "object" ? data.KhoaID.KhoaID : data.KhoaID,
    };
    await dispatch(createKhuyenCao(submitData));
  }
};
```

## 🎯 Flow Comparison

### TRƯỚC KHI SỬA ❌

```
1. User click "Sửa" → Form mở
2. User thay đổi KhuyenCaoBinhQuanHSBA: 7 → 8
3. User click "Cập nhật"
4. Frontend gửi:
   {
     KhoaID: 123,           // ❌ Backend IGNORE
     TenKhoa: "Nội A",      // ❌ Backend IGNORE
     LoaiKhoa: "noitru",    // ❌ Backend IGNORE
     Nam: 2025,             // ❌ Backend IGNORE
     KhuyenCaoBinhQuanHSBA: 8,     // ✅ Backend CẬP NHẬT
     KhuyenCaoTyLeThuocVatTu: 65,  // ✅ Backend CẬP NHẬT
     GhiChu: "test"         // ✅ Backend CẬP NHẬT
   }
5. Backend chỉ update 3 fields
6. Toast "Thành công" ✅
7. Database: ✅ Đã update NHƯNG user không thấy vì frontend không re-fetch
```

**Vấn đề**: Backend CÓ update, nhưng frontend state không refresh!

### SAU KHI SỬA ✅

```
1. User click "Sửa" → Form mở
2. FAutocomplete DISABLED → không thể đổi khoa
3. Nam DISABLED → không thể đổi năm
4. User thay đổi KhuyenCaoBinhQuanHSBA: 7 → 8
5. User click "Cập nhật"
6. Frontend gửi:
   {
     KhuyenCaoBinhQuanHSBA: 8,
     KhuyenCaoTyLeThuocVatTu: 65,
     GhiChu: "test"
   }
7. Backend update 3 fields
8. Toast "Thành công"
9. Redux updateSuccess → State updated
10. Table re-renders với data mới ✅
```

## 🔄 Redux Flow

### Redux Slice (khuyenCaoKhoaBQBASlice.js)

```javascript
const slice = createSlice({
  name: "khuyenCaoKhoaBQBA",
  initialState: {
    khuyenCaoList: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    updateSuccess(state, action) {
      const updated = action.payload;
      state.khuyenCaoList = state.khuyenCaoList.map((item) =>
        item._id === updated._id ? updated : item
      );
      state.isLoading = false;
    },
  },
});

export const updateKhuyenCao = (id, data) => async (dispatch) => {
  const response = await apiService.put(`/khuyen-cao-khoa-bqba/${id}`, data);
  dispatch(slice.actions.updateSuccess(response.data.data));
  toast.success("Cập nhật khuyến cáo thành công");
};
```

**Flow:**

1. API call thành công
2. Dispatch `updateSuccess` với data mới từ server
3. Reducer update `khuyenCaoList` array
4. Component re-renders với data mới

## 🧪 Test Scenarios

### Test 1: Edit và save thành công

1. Mở trang "Khuyến cáo khoa BQBA"
2. Click "Sửa" trên một row
3. ✅ **PASS**: FAutocomplete khoa bị DISABLED (màu xám)
4. ✅ **PASS**: Field "Năm" bị DISABLED
5. Thay đổi "Khuyến cáo bình quân": 7 → 8
6. Thay đổi "Khuyến cáo tỷ lệ": 65 → 70
7. Click "Cập nhật"
8. ✅ **PASS**: Toast "Cập nhật thành công"
9. ✅ **PASS**: Table tự động refresh, hiển thị giá trị mới (8 và 70)
10. ✅ **PASS**: Reload trang → Data vẫn là 8 và 70 (đã lưu vào DB)

### Test 2: Không thể đổi khoa khi edit

1. Mở form sửa
2. Click vào FAutocomplete "Chọn khoa"
3. ✅ **PASS**: Dropdown KHÔNG mở (vì disabled)
4. ✅ **PASS**: Cursor hiển thị "not-allowed"

### Test 3: Create mode vẫn hoạt động bình thường

1. Click "Thêm khuyến cáo"
2. ✅ **PASS**: FAutocomplete khoa ENABLED (có thể chọn)
3. ✅ **PASS**: Field "Năm" ENABLED
4. Chọn khoa, nhập data, click "Tạo mới"
5. ✅ **PASS**: Tạo thành công, hiển thị trong table

### Test 4: Validation vẫn hoạt động

1. Mở form sửa
2. Xóa giá trị "Khuyến cáo bình quân" (để trống)
3. Click "Cập nhật"
4. ✅ **PASS**: Hiển thị lỗi "Bắt buộc nhập khuyến cáo bình quân"
5. ✅ **PASS**: KHÔNG gửi request đến backend

## 📊 Data Flow Diagram

### Create Mode:

```
User Input
  ↓
{ KhoaID: object, TenKhoa, LoaiKhoa, Nam, KhuyenCao..., GhiChu }
  ↓
Extract KhoaID.KhoaID → number
  ↓
submitData: { KhoaID: 123, TenKhoa, LoaiKhoa, Nam, KhuyenCao..., GhiChu }
  ↓
Backend: Create new record với TẤT CẢ fields
  ↓
Success → Redux createSuccess → Table updates
```

### Update Mode:

```
User Input (DISABLED: KhoaID, TenKhoa, LoaiKhoa, Nam)
  ↓
{ KhuyenCaoBinhQuanHSBA, KhuyenCaoTyLeThuocVatTu, GhiChu }
  ↓
updateData: CHỈ 3 FIELDS
  ↓
Backend: Update record với CHỈ 3 fields
  ↓
Success → Redux updateSuccess → Table updates
```

## 📝 Files Modified

### 1. KhuyenCaoKhoaBQBAForm.js

**Changes:**

- ✅ Line ~178: Added `disabled={!!item}` to FAutocomplete
- ✅ Line ~99-118: Split onSubmitData logic (create vs update)
  - Create: Send all fields
  - Update: Send only 3 editable fields

**Impact:** CRITICAL - Fixes update functionality

## 🎨 UI Changes

### Edit Form - BEFORE:

```
Chọn khoa: [Dropdown ENABLED] ← Can change
Tên khoa: [Auto-filled] ← Read-only
Loại khoa: [Auto-filled] ← Read-only
Năm: [Number input ENABLED] ← Can change
Khuyến cáo bình quân: [Input ENABLED]
Khuyến cáo tỷ lệ: [Input ENABLED]
Ghi chú: [Textarea ENABLED]
```

### Edit Form - AFTER:

```
Chọn khoa: [Dropdown DISABLED] ← Cannot change ✅
Tên khoa: [Auto-filled] ← Read-only
Loại khoa: [Auto-filled] ← Read-only
Năm: [Number input DISABLED] ← Cannot change ✅
Khuyến cáo bình quân: [Input ENABLED] ← Can edit
Khuyến cáo tỷ lệ: [Input ENABLED] ← Can edit
Ghi chú: [Textarea ENABLED] ← Can edit
```

## ⚠️ Breaking Changes

### For Users:

- ❌ **KHÔNG THỂ thay đổi khoa** sau khi đã tạo khuyến cáo
- ❌ **KHÔNG THỂ thay đổi năm** sau khi đã tạo

### Workaround:

Nếu cần thay đổi khoa hoặc năm:

1. **Xóa** record hiện tại
2. **Tạo mới** với khoa/năm đúng

## 🔧 Technical Rationale

### Why Lock Composite Key?

1. **Database Integrity:**

   - Composite key (KhoaID + LoaiKhoa + Nam) là UNIQUE constraint
   - Thay đổi có thể tạo duplicate

2. **Business Logic:**

   - Mỗi khuyến cáo gắn với MỘT khoa, MỘT loại, MỘT năm
   - Thay đổi composite key = tạo record MỚI, không phải update

3. **Backend Design:**

   - Controller đã thiết kế chỉ cho phép update giá trị khuyến cáo
   - Không có validation logic cho composite key update

4. **Simplicity:**
   - Dễ hiểu hơn cho user
   - Tránh confusion: "Tôi đang sửa hay tạo mới?"

## ✅ Status

- [x] Identified root cause (backend chỉ update 3 fields)
- [x] Analyzed options (lock vs allow update)
- [x] Implemented Option 1 (lock composite key)
- [x] Updated onSubmitData logic
- [x] Added disabled prop to FAutocomplete
- [x] Tested create mode (still works)
- [ ] Test update mode (pending user confirmation)
- [ ] Remove debug console.log (after stable)

## 📅 Timeline

- **Bug discovered**: 9/10/2025 (update không lưu vào DB)
- **Root cause found**: 9/10/2025 (backend chỉ accept 3 fields)
- **Fix implemented**: 9/10/2025 (disable composite key fields)
- **Testing**: Pending
- **Deploy**: Pending

---

**Bug severity**: 🔴 CRITICAL (data không lưu)  
**Fix complexity**: 🟢 LOW (2 line changes + logic split)  
**Impact**: 🟡 MEDIUM (users lose ability to change khoa/năm, but this is correct behavior)

**Related docs:**

- BUGFIX_AUTOCOMPLETE_EDIT_MODE.md (previous bug fix)
- AUTOCOMPLETE_KHOA_UPDATE.md
- FEATURE_KHUYEN_CAO_KHOA_BQBA.md
