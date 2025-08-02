# 🎯 Instructions for NhiemVuThuongQuy CRUD Implementation

## 📋 **Schema Information**

```yaml
Schema Information:
  name: "NhiemVuThuongQuy"
  collection: "nhiemvuthuongquy"
  module: "workmanagement"

Fields:
  - TenNhiemVu: String (required, maxlength: 255, trim: true)
  - MoTa: String (maxlength: 2000)
  - KhoaID: ref Khoa (required)
  - MucDoKho: Number (min: 1, max: 10, default: 5)
  - TrangThaiHoatDong: Boolean (default: true)
  - isDeleted: Boolean (default: false)
  - NguoiTaoID: ref NhanVienQuanLy

API_Endpoint: "/api/nhiemvu-thuongquy"
Frontend_Route: "/nhiemvu-thuongquy"
```

## 🏗️ **Implementation Specifications**

### **Backend Requirements**

#### **1. Model (Already Exists)**

- ✅ File: `modules/workmanagement/models/NhiemVuThuongQuy.js`
- ✅ Schema already defined with proper validation
- ✅ Indexes configured
- ✅ Virtual relationships defined
- ✅ Static methods implemented

#### **2. Controller (TO CREATE)**

- 📁 Path: `modules/workmanagement/controllers/nhiemvuThuongQuy.controller.js`
- 🔧 Methods: getAll, insertOne, updateOne, deleteOne
- 🔄 Populate: "KhoaID" with "TenKhoa MaKhoa"
- 🔄 Populate: "NguoiTaoID" with "HoTen UserName"

#### **3. Routes (TO CREATE)**

- 📁 Path: `routes/nhiemvuThuongQuy.js`
- 🌐 Endpoint: `/api/nhiemvu-thuongquy`

#### **4. Routes Registration (TO UPDATE)**

- 📁 Path: `routes/index.js`
- ➕ Add: `router.use("/api/nhiemvu-thuongquy", nhiemvuThuongQuyApi);`

### **Frontend Requirements**

#### **1. Redux Slice (TO CREATE)**

- 📁 Path: `src/features/QuanLyCongViec/NhiemVuThuongQuy/nhiemvuThuongQuySlice.js`
- 🔧 State: `nhiemVuThuongQuys` (plural)
- 🔧 Actions: getAll, insertOne, updateOne, deleteOne

#### **2. Main List Component (TO CREATE)**

- 📁 Path: `src/features/QuanLyCongViec/NhiemVuThuongQuy/NhiemVuThuongQuyList.js`
- 📊 Title: "Quản lý Nhiệm vụ Thường quy"

#### **3. Form Dialog (TO CREATE)**

- 📁 Path: `src/features/QuanLyCongViec/NhiemVuThuongQuy/ThongTinNhiemVuThuongQuy.js`
- 📝 Entity name: "nhiệm vụ thường quy"

#### **4. Action Buttons (TO CREATE)**

- 📁 Add Button: `src/features/QuanLyCongViec/NhiemVuThuongQuy/AddNhiemVuThuongQuyButton.js`
- 📁 Update Button: `src/features/QuanLyCongViec/NhiemVuThuongQuy/UpdateNhiemVuThuongQuyButton.js`
- 📁 Delete Button: `src/features/QuanLyCongViec/NhiemVuThuongQuy/DeleteNhiemVuThuongQuyButton.js`

#### **5. View Component (TO CREATE)**

- 📁 Path: `src/features/QuanLyCongViec/NhiemVuThuongQuy/NhiemVuThuongQuyView.js`

## 🎨 **Field Mappings & UI Specifications**

### **Form Fields Configuration**

```javascript
const formFields = [
  {
    name: "TenNhiemVu",
    label: "Tên nhiệm vụ",
    type: "TextField",
    required: true,
    validation: { maxLength: 255 },
  },
  {
    name: "MoTa",
    label: "Mô tả",
    type: "TextField",
    multiline: true,
    rows: 4,
    validation: { maxLength: 2000 },
  },
  {
    name: "KhoaID",
    label: "Khoa",
    type: "Autocomplete",
    required: true,
    dataSource: "khoas",
    displayField: "TenKhoa",
    valueField: "_id",
  },
  {
    name: "MucDoKho",
    label: "Mức độ khó",
    type: "Slider",
    min: 1,
    max: 10,
    default: 5,
    marks: true,
  },
  {
    name: "TrangThaiHoatDong",
    label: "Trạng thái hoạt động",
    type: "Switch",
    default: true,
  },
];
```

### **Table Columns Configuration**

```javascript
const tableColumns = [
  {
    Header: "Tên nhiệm vụ",
    accessor: "TenNhiemVu",
    width: 200,
  },
  {
    Header: "Khoa",
    accessor: "KhoaID.TenKhoa",
    width: 150,
  },
  {
    Header: "Mức độ khó",
    accessor: "MucDoKho",
    width: 100,
    Cell: ({ value }) => `${value}/10`,
  },
  {
    Header: "Mô tả",
    accessor: "MoTa",
    width: 300,
    Cell: ({ value }) =>
      value?.length > 50 ? `${value.substring(0, 50)}...` : value,
  },
  {
    Header: "Người tạo",
    accessor: "NguoiTaoID.HoTen",
    width: 120,
  },
  {
    Header: "Trạng thái",
    accessor: "TrangThaiHoatDong",
    width: 100,
    Cell: ({ value }) => (
      <Chip
        label={value ? "Hoạt động" : "Tạm dừng"}
        color={value ? "success" : "default"}
        size="small"
      />
    ),
  },
  {
    Header: "Ngày tạo",
    accessor: "createdAt",
    width: 120,
    Cell: ({ value }) => formatDate_getDate(value),
  },
];
```

### **View Component Fields**

```javascript
const viewFields = [
  { label: "Tên nhiệm vụ", field: "TenNhiemVu", type: "text" },
  { label: "Khoa", field: "KhoaID.TenKhoa", type: "text" },
  { label: "Mức độ khó", field: "MucDoKho", type: "rating", max: 10 },
  { label: "Mô tả", field: "MoTa", type: "multiline", fullWidth: true },
  { label: "Người tạo", field: "NguoiTaoID.HoTen", type: "text" },
  {
    label: "Trạng thái",
    field: "TrangThaiHoatDong",
    type: "chip",
    chipProps: (value) => ({
      label: value ? "Hoạt động" : "Tạm dừng",
      color: value ? "success" : "default",
    }),
  },
  { label: "Ngày tạo", field: "createdAt", type: "date" },
  { label: "Ngày cập nhật", field: "updatedAt", type: "date" },
];
```

## 🔗 **Reference Data Requirements**

### **Selectors for Related Data**

```javascript
// Required selectors in form component
const { khoas } = useSelector((state) => state.khoa || { khoas: [] });
const { nhanVienQuanLys } = useSelector(
  (state) => state.nhanVienQuanLy || { nhanVienQuanLys: [] }
);

// Effect to load reference data
useEffect(() => {
  dispatch(getAllKhoa());
  dispatch(getAllNhanVienQuanLy());
}, [dispatch]);
```

## 🎯 **Special Features & Business Logic**

### **1. Mức độ khó Slider**

```javascript
const MucDoKhoSlider = ({ value, onChange }) => (
  <Slider
    value={value}
    onChange={onChange}
    aria-labelledby="muc-do-kho-slider"
    valueLabelDisplay="auto"
    step={1}
    marks={Array.from({ length: 10 }, (_, i) => ({
      value: i + 1,
      label: i + 1,
    }))}
    min={1}
    max={10}
  />
);
```

### **2. Default Values Logic**

```javascript
// In create mode
const defaultFormData = {
  TenNhiemVu: "",
  MoTa: "",
  KhoaID: user?.KhoaID || "",
  MucDoKho: 5,
  TrangThaiHoatDong: true,
  NguoiTaoID: user._id,
};
```

### **3. Validation Rules**

```javascript
const validateForm = (formData) => {
  const errors = {};

  if (!formData.TenNhiemVu.trim()) {
    errors.TenNhiemVu = "Tên nhiệm vụ là bắt buộc";
  } else if (formData.TenNhiemVu.length > 255) {
    errors.TenNhiemVu = "Tên nhiệm vụ không được vượt quá 255 ký tự";
  }

  if (!formData.KhoaID) {
    errors.KhoaID = "Khoa là bắt buộc";
  }

  if (formData.MoTa && formData.MoTa.length > 2000) {
    errors.MoTa = "Mô tả không được vượt quá 2000 ký tự";
  }

  if (formData.MucDoKho < 1 || formData.MucDoKho > 10) {
    errors.MucDoKho = "Mức độ khó phải từ 1 đến 10";
  }

  return errors;
};
```

## 📦 **Integration Requirements**

### **1. Store Registration**

```javascript
// In src/app/store.js
import nhiemvuThuongQuySlice from "../features/QuanLyCongViec/NhiemVuThuongQuy/nhiemvuThuongQuySlice";

const rootReducer = {
  // ...other reducers
  nhiemvuThuongQuy: nhiemvuThuongQuySlice,
};
```

### **2. Route Registration**

```javascript
// In menu-items or routes
{
  id: 'nhiemvu-thuongquy',
  title: 'Nhiệm vụ Thường quy',
  type: 'item',
  url: '/quanlycongviec/nhiemvu-thuongquy',
  icon: icons.Assignment
}
```

### **3. Component Dependencies**

```javascript
// Required imports for all components
import { useAuth } from "hooks/useAuth";
import { formatDate_getDate } from "utils/formatTime";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import ScrollX from "components/ScrollX";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
```

## 🚀 **Implementation Priority**

### **Phase 1: Backend**

1. ✅ Model (Already exists)
2. 🔧 Controller
3. 🔧 Routes
4. 🔧 Routes registration

### **Phase 2: Frontend Core**

1. 🔧 Redux slice
2. 🔧 Main list component
3. 🔧 Form dialog

### **Phase 3: Frontend Actions**

1. 🔧 Add button
2. 🔧 Update button
3. 🔧 Delete button
4. 🔧 View component

### **Phase 4: Integration**

1. 🔧 Store registration
2. 🔧 Route registration
3. 🔧 Menu integration

## 📝 **Notes for AI Implementation**

1. **Variable Naming**: Use `nhiemvuThuongQuy` for single, `nhiemVuThuongQuys` for plural
2. **Entity Display**: Always use "nhiệm vụ thường quy" in Vietnamese UI
3. **Default Khoa**: Auto-set from current user's department
4. **Soft Delete**: Implement proper soft delete with `isDeleted` flag
5. **Populate**: Always populate KhoaID and NguoiTaoID in responses
6. **Validation**: Client and server-side validation for all constraints
7. **Error Handling**: Proper error messages in Vietnamese
8. **Toast Messages**: Success/error notifications for all actions

## 🔍 **Testing Checklist**

- [ ] Create new nhiệm vụ thường quy
- [ ] Update existing nhiệm vụ thường quy
- [ ] Soft delete nhiệm vụ thường quy
- [ ] List with pagination and filtering
- [ ] Form validation works correctly
- [ ] Reference data loads properly
- [ ] Mức độ khó slider functions
- [ ] View component displays all fields
- [ ] Excel export functionality
- [ ] Responsive design on mobile

---

**🎯 Ready for AI Implementation: Use this instruction file as context to generate complete CRUD functionality for NhiemVuThuongQuy schema following the established patterns.**
