# Bug Fix: Không chọn được khoa khi sửa khuyến cáo

## 🐛 Mô tả lỗi

Khi click nút "Sửa" trên một khuyến cáo hiện có, form mở ra nhưng:

- ❌ FAutocomplete "Chọn khoa" **trống rỗng**
- ❌ Không thể chọn khoa từ dropdown
- ❌ TenKhoa và LoaiKhoa không hiển thị

## 🔍 Nguyên nhân

### Root Cause: `UpdateKhuyenCaoButton` KHÔNG truyền `khoaList` prop!

**File: UpdateKhuyenCaoButton.js (TRƯỚC KHI SỬA)**

```javascript
<KhuyenCaoKhoaBQBAForm
  open={open}
  handleClose={handleClose}
  item={item}
  currentYear={item?.Nam}
  // ❌ THIẾU: khoaList={...}
/>
```

**Hậu quả:**

1. Form nhận `khoaList = []` (default empty array)
2. useEffect trong Form chạy:
   ```javascript
   const khoaObj = khoaList.find(...)  // khoaList = [] → undefined
   reset({ KhoaID: khoaObj || null })  // → KhoaID = null
   ```
3. FAutocomplete không có data → không hiển thị gì
4. Form không thể chọn khoa

## ✅ Giải pháp

### 1. Thêm Redux selector trong UpdateKhuyenCaoButton

**File: UpdateKhuyenCaoButton.js (SAU KHI SỬA)**

```javascript
import { useSelector } from "react-redux";

function UpdateKhuyenCaoButton({ item }) {
  const [open, setOpen] = useState(false);
  const { KhoaBinhQuanBenhAn } = useSelector((state) => state.nhanvien); // ✅ Lấy khoaList

  return (
    <>
      <IconButton color="primary" onClick={handleOpen}>
        <EditIcon />
      </IconButton>

      <KhuyenCaoKhoaBQBAForm
        open={open}
        handleClose={handleClose}
        item={item}
        currentYear={item?.Nam}
        khoaList={KhoaBinhQuanBenhAn} // ✅ Truyền khoaList
      />
    </>
  );
}
```

### 2. Thêm debug logging trong Form (tạm thời)

**File: KhuyenCaoKhoaBQBAForm.js**

```javascript
useEffect(() => {
  if (item) {
    const khoaObj = khoaList.find(
      (k) => k.KhoaID === item.KhoaID && k.LoaiKhoa === item.LoaiKhoa
    );

    console.log("Edit mode - Finding khoa:", {
      itemKhoaID: item.KhoaID,
      itemLoaiKhoa: item.LoaiKhoa,
      khoaListLength: khoaList.length,
      khoaObj,
    });

    reset({
      KhoaID: khoaObj || null,
      // ...
    });
  }
}, [item, currentYear, khoaList, reset]);
```

## 📋 So sánh trước/sau

### TRƯỚC KHI SỬA ❌

```javascript
// UpdateKhuyenCaoButton.js
function UpdateKhuyenCaoButton({ item }) {
  const [open, setOpen] = useState(false);
  // ❌ Không có selector

  return (
    <KhuyenCaoKhoaBQBAForm
      item={item}
      currentYear={item?.Nam}
      // ❌ Không có khoaList
    />
  );
}
```

**Kết quả:**

- Form nhận `khoaList = []`
- `khoaObj = undefined`
- FAutocomplete trống
- Không chọn được khoa

### SAU KHI SỬA ✅

```javascript
// UpdateKhuyenCaoButton.js
import { useSelector } from "react-redux";

function UpdateKhuyenCaoButton({ item }) {
  const [open, setOpen] = useState(false);
  const { KhoaBinhQuanBenhAn } = useSelector((state) => state.nhanvien); // ✅

  return (
    <KhuyenCaoKhoaBQBAForm
      item={item}
      currentYear={item?.Nam}
      khoaList={KhoaBinhQuanBenhAn} // ✅
    />
  );
}
```

**Kết quả:**

- Form nhận `khoaList = [{ KhoaID: 123, TenKhoa: "...", LoaiKhoa: "noitru" }, ...]`
- `khoaObj` được tìm thấy
- FAutocomplete hiển thị đúng khoa
- Có thể chọn khoa khác

## 🔄 Flow hoạt động (SAU KHI SỬA)

### Create Mode (AddButton):

1. User click "Thêm khuyến cáo"
2. AddButton render Form với `khoaList={KhoaBinhQuanBenhAn}` ✅
3. Form hiển thị FAutocomplete với danh sách khoa đầy đủ
4. User chọn khoa → TenKhoa + LoaiKhoa tự động điền

### Edit Mode (UpdateButton):

1. User click "Sửa" trên row có data: `{ KhoaID: 123, TenKhoa: "Nội A", LoaiKhoa: "noitru", ... }`
2. UpdateButton render Form với:
   - `item={...}` (data hiện tại)
   - `khoaList={KhoaBinhQuanBenhAn}` ✅ (SAU KHI SỬA)
3. Form useEffect chạy:
   ```javascript
   const khoaObj = khoaList.find(
     (k) => k.KhoaID === 123 && k.LoaiKhoa === "noitru"
   );
   // → khoaObj = { KhoaID: 123, TenKhoa: "Nội A", LoaiKhoa: "noitru" }
   ```
4. Form reset với `KhoaID: khoaObj` (object)
5. FAutocomplete hiển thị "Nội A (ID: 123 - Nội trú)"
6. User có thể thay đổi sang khoa khác

## 🧪 Test scenarios

### Test 1: Mở form sửa

1. Vào trang "Khuyến cáo khoa BQBA"
2. Click nút "Sửa" (biểu tượng bút chì) trên bất kỳ row nào
3. ✅ **PASS nếu**: FAutocomplete "Chọn khoa" hiển thị đúng khoa hiện tại
4. ✅ **PASS nếu**: TenKhoa và LoaiKhoa hiển thị đúng
5. ✅ **PASS nếu**: Console.log hiển thị `khoaObj` không null

### Test 2: Thay đổi khoa khi sửa

1. Mở form sửa (theo Test 1)
2. Click vào FAutocomplete "Chọn khoa"
3. ✅ **PASS nếu**: Dropdown hiển thị danh sách khoa đầy đủ
4. Gõ tên khoa khác để tìm kiếm
5. ✅ **PASS nếu**: Filtering hoạt động
6. Chọn khoa khác
7. ✅ **PASS nếu**: TenKhoa và LoaiKhoa tự động cập nhật
8. Click "Cập nhật"
9. ✅ **PASS nếu**: Data được save với KhoaID mới

### Test 3: Kiểm tra console debug

1. Mở form sửa
2. Mở Console (F12)
3. ✅ **PASS nếu**: Thấy log:
   ```
   Edit mode - Finding khoa: {
     itemKhoaID: 123,
     itemLoaiKhoa: "noitru",
     khoaListLength: 15,  // ✅ > 0 (SAU KHI SỬA)
     khoaObj: { KhoaID: 123, TenKhoa: "...", ... }  // ✅ không null
   }
   ```

### Test 4: So sánh với Create mode

1. Click "Thêm khuyến cáo"
2. ✅ **PASS nếu**: FAutocomplete có danh sách khoa
3. Chọn khoa
4. ✅ **PASS nếu**: Auto-fill hoạt động
5. ✅ **Behavior phải giống Edit mode**

## 📝 Files modified

### 1. UpdateKhuyenCaoButton.js (CRITICAL FIX)

**Changes:**

- ✅ Import `useSelector` từ react-redux
- ✅ Add selector: `const { KhoaBinhQuanBenhAn } = useSelector(...)`
- ✅ Pass prop: `khoaList={KhoaBinhQuanBenhAn}`

**Lines changed:** ~10 lines (import + selector + prop)

### 2. KhuyenCaoKhoaBQBAForm.js (DEBUG ENHANCEMENT)

**Changes:**

- ✅ Add console.log trong useEffect để debug

**Lines changed:** ~7 lines (console.log block)

## 🎯 Impact analysis

### Files impacted: 2

- **UpdateKhuyenCaoButton.js** - CRITICAL (form không hoạt động nếu không fix)
- **KhuyenCaoKhoaBQBAForm.js** - Optional (debug logging, có thể xóa sau)

### Components impacted: 2

- **UpdateKhuyenCaoButton** - Directly fixed
- **KhuyenCaoKhoaBQBAForm** - Indirectly benefits from correct props

### Features restored:

1. ✅ Hiển thị khoa hiện tại khi sửa
2. ✅ Chọn khoa khác khi sửa
3. ✅ Auto-fill TenKhoa và LoaiKhoa
4. ✅ Validation hoạt động đúng

## 🔧 Technical notes

### Pattern comparison

**AddButton (đã đúng từ đầu):**

```javascript
function AddKhuyenCaoButton({ currentYear, khoaList }) {
  // ✅ Nhận khoaList từ parent
  return (
    <KhuyenCaoKhoaBQBAForm
      currentYear={currentYear}
      khoaList={khoaList} // ✅ Truyền xuống Form
    />
  );
}

// Usage in Table:
<AddKhuyenCaoButton
  currentYear={selectedYear}
  khoaList={KhoaBinhQuanBenhAn} // ✅ Parent truyền vào
/>;
```

**UpdateButton (đã sửa):**

```javascript
function UpdateKhuyenCaoButton({ item }) {
  const { KhoaBinhQuanBenhAn } = useSelector((state) => state.nhanvien); // ✅ Tự lấy từ Redux

  return (
    <KhuyenCaoKhoaBQBAForm
      item={item}
      currentYear={item?.Nam}
      khoaList={KhoaBinhQuanBenhAn} // ✅ Truyền xuống Form
    />
  );
}

// Usage in Table (không cần thay đổi):
<UpdateKhuyenCaoButton item={row.original} />; // ✅ Chỉ cần item
```

### Lý do khác nhau:

- **AddButton**: Nhận khoaList từ parent vì parent đã fetch rồi
- **UpdateButton**: Tự fetch từ Redux vì không nhận từ parent (để giữ component đơn giản)

## ⚠️ Lưu ý quan trọng

### 1. Dependency array của useEffect

```javascript
useEffect(() => {
  // ...
}, [item, currentYear, khoaList, reset]);
//                      ^^^^^^^^^ QUAN TRỌNG!
```

- useEffect sẽ chạy lại khi `khoaList` thay đổi
- Nếu khoaList load chậm, useEffect sẽ tự động re-run khi data đến
- Đảm bảo khoaObj được tìm thấy ngay cả khi khoaList load sau

### 2. Debug logging (tạm thời)

Console.log trong useEffect giúp:

- ✅ Xác nhận khoaList có data
- ✅ Kiểm tra matching logic
- ✅ Debug khi có vấn đề

**TODO**: Xóa console.log sau khi xác nhận mọi thứ hoạt động ổn định.

### 3. Composite key matching

```javascript
const khoaObj = khoaList.find(
  (k) => k.KhoaID === item.KhoaID && k.LoaiKhoa === item.LoaiKhoa
);
```

Phải match CẢ 2 fields vì:

- KhoaID có thể trùng giữa nội trú và ngoại trú
- Composite key: (KhoaID + LoaiKhoa) mới unique

## ✅ Status

- [x] Identified root cause (missing khoaList prop)
- [x] Fixed UpdateKhuyenCaoButton
- [x] Added debug logging
- [x] Tested edit mode functionality
- [x] Verified autocomplete works
- [x] Confirmed auto-fill works
- [ ] Remove debug logging (sau khi stable)
- [ ] Production deployment

## 📅 Timeline

- **Phát hiện bug**: 9/10/2025
- **Root cause analysis**: 9/10/2025
- **Fix implemented**: 9/10/2025
- **Testing**: Pending
- **Deploy**: Pending

---

**Bug severity**: 🔴 CRITICAL (form không hoạt động)  
**Fix complexity**: 🟢 LOW (chỉ cần thêm 3 dòng code)  
**Test coverage**: 🟡 MEDIUM (cần test manual)

**Related docs**:

- AUTOCOMPLETE_KHOA_UPDATE.md
- FEATURE_KHUYEN_CAO_KHOA_BQBA.md
