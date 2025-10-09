# Feature: Khuyến Cáo Khoa Bình Quân Bệnh Án (KhuyenCaoKhoaBQBA)

## Tổng quan

Tính năng này cho phép quản lý các khuyến cáo (benchmarks) về chi phí bình quân và tỷ lệ thuốc/vật tư cho từng khoa bệnh viện theo năm. Các khuyến cáo được hiển thị trực tiếp trong bảng thống kê "Bình Quân Bệnh Án" để so sánh với số liệu thực tế.

## Kiến trúc

### Backend (Node.js + Express + MongoDB)

#### 1. Model (`models/KhuyenCaoKhoaBQBA.js`)

```javascript
{
  KhoaID: Number,           // Mã khoa (từ datafix)
  TenKhoa: String,          // Tên khoa
  LoaiKhoa: String,         // "noitru" | "ngoaitru"
  Nam: Number,              // Năm áp dụng
  KhuyenCaoBinhQuanHSBA: Number,      // Triệu đồng (ví dụ: 7.5)
  KhuyenCaoTyLeThuocVatTu: Number,    // Phần trăm (ví dụ: 65.5)
  GhiChu: String,
  isDeleted: Boolean
}
```

**Composite Unique Index**: `{KhoaID: 1, LoaiKhoa: 1, Nam: 1}`

- Đảm bảo mỗi khoa chỉ có 1 khuyến cáo duy nhất cho mỗi năm

#### 2. Controller (`controllers/khuyencaokhoa.bqba.controller.js`)

**API Endpoints:**

- `GET /api/khuyen-cao-khoa-bqba?nam=2025` - Lấy tất cả khuyến cáo theo năm
- `GET /api/khuyen-cao-khoa-bqba/by-khoa/:khoaId/:loaiKhoa?nam=2025` - Lấy khuyến cáo của 1 khoa
- `POST /api/khuyen-cao-khoa-bqba` - Tạo mới khuyến cáo
- `PUT /api/khuyen-cao-khoa-bqba/:id` - Cập nhật khuyến cáo
- `DELETE /api/khuyen-cao-khoa-bqba/:id` - Xóa mềm khuyến cáo
- `POST /api/khuyen-cao-khoa-bqba/bulk-create` - Copy hàng loạt từ năm trước

**Features:**

- ✅ Soft delete pattern
- ✅ Duplicate checking (KhoaID + LoaiKhoa + Nam)
- ✅ Bulk copy từ năm trước sang năm mới
- ✅ Error handling với catchAsync wrapper
- ✅ Standardized response với sendResponse helper

#### 3. Routes (`routes/khuyencaokhoa.bqba.api.js`)

- Tất cả routes yêu cầu authentication (`loginRequired`)
- Integrated vào `/routes/index.js` với prefix `/khuyen-cao-khoa-bqba`

### Frontend (React + Redux + Material-UI)

#### 1. Redux Slice (`khuyenCaoKhoaBQBASlice.js`)

**State:**

```javascript
{
  isLoading: false,
  error: null,
  khuyenCaoList: [],           // Danh sách khuyến cáo
  selectedKhuyenCao: null,     // Khuyến cáo đang chọn
  currentYear: 2025            // Năm hiện tại
}
```

**Actions:**

- `getAllKhuyenCao(nam)` - Fetch all benchmarks by year
- `getKhuyenCaoByKhoa(khoaId, loaiKhoa, nam)` - Fetch benchmark for specific department
- `createKhuyenCao(data)` - Create new benchmark
- `updateKhuyenCao(id, data)` - Update benchmark
- `deleteKhuyenCao(id)` - Delete benchmark (soft)
- `bulkCreateKhuyenCao(namGoc, namMoi)` - Bulk copy
- `setCurrentYear(year)` - Set current year and fetch

**Toast Notifications:**

- Success/error toast cho tất cả CRUD operations

#### 2. Management Page (`KhuyenCaoKhoaBQBATable.js`)

**Location:** `/khuyen-cao-khoa-bqba` (Admin only - requires `AdminRequire`)

**Features:**

- ✅ Year selector dropdown (current - 5 đến current + 2)
- ✅ Material-UI DataGrid với sortable columns
- ✅ Color-coded display:
  - Blue (#1939B7) cho "Bình quân HSBA"
  - Red (#bb1515) cho "Tỷ lệ thuốc + VT"
- ✅ Chip badges cho loại khoa (Nội trú/Ngoại trú)
- ✅ Add/Edit/Delete buttons với icons
- ✅ Bulk copy button
- ✅ Auto-load danh mục khoa từ datafix
- ✅ Loading states

#### 3. CRUD Components

**AddKhuyenCaoButton.js**

- Opens form dialog for creating new benchmark
- Passes `currentYear` và `khoaList` to form

**UpdateKhuyenCaoButton.js**

- Icon button (Edit) to open form with existing data
- Passes full `item` object to form

**DeleteKhuyenCaoButton.js**

- Icon button (Delete) with confirmation dialog
- Dispatches `deleteKhuyenCao` action

**BulkCopyButton.js**

- Dialog cho phép chọn năm gốc và năm mới
- Validation: không cho copy cùng năm
- Dispatches `bulkCreateKhuyenCao` action

#### 4. Form Component (`KhuyenCaoKhoaBQBAForm.js`)

**Mode Detection:**

- **Create**: `item` is undefined/null
- **Edit**: `item._id` exists

**Fields:**

```javascript
{
  KhoaID: Number,              // Dropdown (disabled in edit mode)
  TenKhoa: String,             // Auto-filled from selected khoa
  LoaiKhoa: String,            // Select (disabled in edit mode)
  Nam: Number,                 // Number input (disabled in edit mode)
  KhuyenCaoBinhQuanHSBA: Number,      // Editable
  KhuyenCaoTyLeThuocVatTu: Number,    // Editable
  GhiChu: String               // Multiline textarea
}
```

**Validation (Yup):**

- KhoaID: required, number
- TenKhoa: required, string
- LoaiKhoa: required, oneOf(["noitru", "ngoaitru"])
- Nam: required, number, min(2020), max(2050)
- KhuyenCaoBinhQuanHSBA: required, number, min(0)
- KhuyenCaoTyLeThuocVatTu: required, number, min(0), max(100)

**Auto-fill Logic:**

- Khi chọn KhoaID trong create mode → auto-fill TenKhoa từ khoaList
- Edit mode: không cho đổi KhoaID, LoaiKhoa, Nam (composite key)

#### 5. Integration vào BinhQuanBenhAn Table

**BenchmarkCell.jsx** - New component

- Hiển thị giá trị thực tế + khuyến cáo
- Color logic:
  - 🔴 Red background/border: Vượt khuyến cáo (bad)
  - 🟢 Green background/border: Dưới khuyến cáo (good)
- Format: "KC: {value}" (KC = Khuyến Cáo)

**DataTable.jsx Updates:**

1. **Column "Bình quân/ca":**

   - Sử dụng `BenchmarkCell` thay vì `DifferenceCell`
   - So sánh `avg_money_per_case` với `KhuyenCaoBinhQuanHSBA * 1,000,000`
   - Hiển thị benchmark dưới giá trị thực tế

2. **Column "Tổng tỷ lệ (Thuốc + VT)":**
   - Giữ nguyên `PercentageBar` ở trên
   - Thêm benchmark badge dưới progress bar
   - So sánh tổng tỷ lệ với `KhuyenCaoTyLeThuocVatTu`
   - Color-coded badge (red/green)

**BinhQuanBenhAn.js Updates:**

```javascript
// Fetch khuyến cáo khi load trang
useEffect(() => {
  if (nam) {
    dispatch(getAllKhuyenCao(nam));
  }
}, [nam, dispatch]);

// Merge khuyến cáo vào data
const baseRows = useMemo(() => {
  // ... existing logic
  return rowsWithDiff.map((row) => {
    const khuyenCao = khuyenCaoList?.find(
      (kc) =>
        kc.KhoaID === row.KhoaID &&
        kc.LoaiKhoa === row.LoaiKhoa &&
        kc.Nam === nam
    );
    return {
      ...row,
      KhuyenCaoBinhQuanHSBA: khuyenCao?.KhuyenCaoBinhQuanHSBA || null,
      KhuyenCaoTyLeThuocVatTu: khuyenCao?.KhuyenCaoTyLeThuocVatTu || null,
    };
  });
}, [rowsFromStore, rowsChenhLech, ngay, khuyenCaoList, nam]);
```

## Data Flow

### Create/Update Flow

```
User fills form
  → Form validation (Yup)
  → Dispatch action (createKhuyenCao/updateKhuyenCao)
  → API call to backend
  → Backend validation + duplicate check
  → Save to MongoDB
  → Response to frontend
  → Update Redux state
  → Toast notification
  → Close dialog
  → Table auto-refreshes
```

### Display Flow

```
BinhQuanBenhAn page loads
  → useEffect detects `nam` (year)
  → Dispatch getAllKhuyenCao(nam)
  → Fetch benchmarks from API
  → Store in Redux (khuyenCaoList)
  → useMemo merges benchmarks into table rows
    → Match by (KhoaID + LoaiKhoa + Nam)
    → Add KhuyenCaoBinhQuanHSBA & KhuyenCaoTyLeThuocVatTu fields
  → DataTable renders with BenchmarkCell components
  → Color highlighting based on comparison
```

### Bulk Copy Flow

```
User clicks "Copy từ năm trước"
  → BulkCopyButton dialog opens
  → User selects namGoc (source year) & namMoi (target year)
  → Validation: namGoc ≠ namMoi
  → Dispatch bulkCreateKhuyenCao(namGoc, namMoi)
  → Backend:
    → Find all benchmarks from namGoc
    → Create new records with Nam = namMoi
    → insertMany with {ordered: false} (skip duplicates)
  → Response: count of created records
  → Dispatch getAllKhuyenCao(namMoi) to refresh
  → Toast: "Đã copy X khuyến cáo..."
```

## UI/UX Highlights

### Management Page

- **Table với year selector** ở header
- **Chip badges** màu xanh/cam cho nội trú/ngoại trú
- **Number formatting:**
  - Bình quân HSBA: toLocaleString('vi-VN')
  - Tỷ lệ: toFixed(2)%
- **Action column** với Edit/Delete icon buttons
- **Bulk copy button** ở góc phải header

### BinhQuanBenhAn Table Integration

- **Seamless display** - không làm thay đổi layout hiện tại
- **Subtle highlighting** - badge nhỏ dưới giá trị chính
- **Color psychology:**
  - Red = Warning (vượt khuyến cáo)
  - Green = Good (đạt khuyến cáo)
- **Progressive disclosure** - chỉ hiển thị benchmark khi có data
- **Responsive design** - font size scales với breakpoints

## Technical Patterns

### 1. Composite Key Pattern

```javascript
// Backend: Unique index
{ KhoaID: 1, LoaiKhoa: 1, Nam: 1 }

// Frontend: Matching logic
const khuyenCao = khuyenCaoList?.find(
  (kc) => kc.KhoaID === row.KhoaID &&
          kc.LoaiKhoa === row.LoaiKhoa &&
          kc.Nam === nam
);
```

### 2. Edit Mode Restriction

- **Create mode**: User chọn KhoaID, LoaiKhoa, Nam
- **Edit mode**: Các field này bị disabled
- **Lý do**: Composite key không nên thay đổi (tránh duplicate)
- **User có thể**: Delete record cũ, tạo record mới với key khác

### 3. Soft Delete Pattern

```javascript
// Never hard delete
isDeleted: true;

// All queries filter
{
  isDeleted: false;
}
```

### 4. Auto-fill Pattern

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

## Testing Checklist

### Backend API

- [ ] GET all benchmarks (with/without year parameter)
- [ ] GET benchmark by khoa (existing/non-existing)
- [ ] POST create (success/duplicate/validation errors)
- [ ] PUT update (success/not found)
- [ ] DELETE soft delete (success/not found)
- [ ] POST bulk create (success/empty source/duplicate handling)

### Frontend CRUD

- [ ] Load management page (/khuyen-cao-khoa-bqba)
- [ ] Year selector changes data
- [ ] Create new benchmark (all fields)
- [ ] Create duplicate → error toast
- [ ] Edit existing benchmark → fields pre-filled
- [ ] Edit → save → table updates
- [ ] Delete → confirm dialog → success
- [ ] Bulk copy → validation → success → refresh

### Display Integration

- [ ] BinhQuanBenhAn loads → benchmarks fetched
- [ ] Change year → benchmarks re-fetched
- [ ] Rows with benchmark → BenchmarkCell displays
- [ ] Rows without benchmark → normal DifferenceCell
- [ ] Over benchmark → red highlighting
- [ ] Under benchmark → green highlighting
- [ ] "Tổng tỷ lệ" column shows benchmark badge

## Database Queries

### Find all benchmarks for a year

```javascript
db.khuyencaokhoabqbas.find({ Nam: 2025, isDeleted: false });
```

### Find benchmark for specific department

```javascript
db.khuyencaokhoabqbas.findOne({
  KhoaID: 5,
  LoaiKhoa: "noitru",
  Nam: 2025,
  isDeleted: false,
});
```

### Bulk copy from previous year

```javascript
const source = await KhuyenCaoKhoaBQBA.find({ Nam: 2024, isDeleted: false });
const newRecords = source.map((item) => ({
  ...item._doc,
  _id: undefined,
  Nam: 2025,
  GhiChu: "Copy từ năm 2024",
}));
await KhuyenCaoKhoaBQBA.insertMany(newRecords, { ordered: false });
```

## Future Enhancements

### Potential Features

1. **History tracking**: Lưu lại lịch sử thay đổi khuyến cáo
2. **Import/Export**: Excel import cho bulk update
3. **Analytics**: Dashboard so sánh khuyến cáo vs thực tế theo tháng
4. **Notifications**: Cảnh báo khi khoa vượt khuyến cáo liên tục
5. **Versioning**: Cho phép nhiều versions của khuyến cáo trong cùng năm
6. **Permissions**: Phân quyền chi tiết (Manager chỉ xem, Admin mới edit)

### Code Improvements

1. **Unit tests**: Jest/React Testing Library cho components
2. **API tests**: Supertest cho backend endpoints
3. **Caching**: Redis cache cho khuyến cáo (ít thay đổi)
4. **Pagination**: Khi số khoa nhiều (>100)
5. **Search/Filter**: Tìm kiếm khoa trong management page

## Dependencies

### Backend

- `mongoose`: ^6.x - MongoDB ODM
- `express`: ^4.x - Web framework
- No new dependencies added

### Frontend

- `@reduxjs/toolkit`: Redux state management
- `react-hook-form`: Form handling
- `yup`: Validation schema
- `@mui/material`: UI components
- `react-toastify`: Toast notifications
- No new dependencies added

## Files Created/Modified

### Backend

```
giaobanbv-be/
├── models/
│   └── KhuyenCaoKhoaBQBA.js          [NEW]
├── controllers/
│   └── khuyencaokhoa.bqba.controller.js  [NEW]
└── routes/
    ├── khuyencaokhoa.bqba.api.js     [NEW]
    └── index.js                       [MODIFIED]
```

### Frontend

```
fe-bcgiaobanbvt/src/
├── app/
│   └── store.js                       [MODIFIED]
├── routes/
│   └── index.js                       [MODIFIED]
└── features/DashBoard/
    ├── BinhQuanBenhAn.js             [MODIFIED]
    └── BinhQuanBenhAn/
        ├── khuyenCaoKhoaBQBASlice.js  [NEW]
        ├── KhuyenCaoKhoaBQBATable.js  [NEW]
        ├── KhuyenCaoKhoaBQBAForm.js   [NEW]
        ├── AddKhuyenCaoButton.js      [NEW]
        ├── UpdateKhuyenCaoButton.js   [NEW]
        ├── DeleteKhuyenCaoButton.js   [NEW]
        ├── BulkCopyButton.js          [NEW]
        ├── index.js                   [MODIFIED]
        └── components/
            ├── BenchmarkCell.jsx      [NEW]
            └── DataTable.jsx          [MODIFIED]
```

## Summary

Tính năng "Khuyến Cáo Khoa Bình Quân Bệnh Án" đã được triển khai đầy đủ với:

- ✅ Full-stack CRUD operations
- ✅ Admin management interface
- ✅ Seamless integration vào existing table
- ✅ Color-coded visual feedback
- ✅ Bulk copy functionality
- ✅ Comprehensive validation
- ✅ Following project patterns (Redux, React Hook Form, Material-UI)
- ✅ Responsive design
- ✅ Toast notifications
- ✅ Soft delete support

**Status**: Ready for testing and deployment 🚀
