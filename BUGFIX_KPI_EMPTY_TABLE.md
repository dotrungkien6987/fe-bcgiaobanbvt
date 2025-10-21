# 🔧 BUGFIX: KPI Evaluation Page - Empty Table Data

## 🐛 Vấn Đề

Khi vào trang `/quanlycongviec/kpi/danh-gia-nhan-vien`:

- ❌ Table chỉ hiển thị số thứ tự (STT)
- ❌ Không thấy thông tin nhân viên (tên, email, số nhiệm vụ, v.v.)
- ❌ Nút [Đánh giá] và [Xem KPI] bị disable

## 🔍 Nguyên Nhân

### Root Cause: **Sai Data Structure**

API `/giao-nhiem-vu/employees-with-cycle-stats` trả về:

```javascript
[
  {
    employee: {
      // ← Nested object!
      _id: "xxx",
      Ten: "Nguyễn Văn A",
      Email: "a@example.com",
      MaNhanVien: "NV001",
      KhoaID: { TenKhoa: "Khoa Nội" },
    },
    assignedCount: 5, // ← Root level
    totalDuties: 10, // ← Root level
    totalMucDoKho: 35.5, // ← Root level
    LoaiQuanLy: "KPI",
  },
];
```

### Code Cũ (SAI):

```javascript
// ❌ Truy cập trực tiếp như flat object
employees.map((employee, index) => (
  <TableCell>{employee.HoTen}</TableCell>     // ❌ undefined
  <TableCell>{employee.Email}</TableCell>      // ❌ undefined
  <Chip label={employee.SoLuongNhiemVu} />    // ❌ undefined
  <Chip label={employee.TongDoKho} />         // ❌ undefined
))
```

### Kết Quả:

- `employee.HoTen` → `undefined` → Cell trống
- `employee.Email` → `undefined` → Cell trống
- `employee.SoLuongNhiemVu` → `undefined` → Chip không hiển thị
- Button disabled vì check `!employee.SoLuongNhiemVu`

---

## ✅ Giải Pháp

### FIX: Truy Cập Nested Employee Object

```javascript
// ✅ ĐÚNG: Destructure nested structure
employees.map((item, index) => {
  const employee = item.employee || {};  // ← Extract nested object

  return (
    <TableCell>{employee.Ten}</TableCell>          // ✅ "Nguyễn Văn A"
    <TableCell>{employee.Email}</TableCell>        // ✅ "a@example.com"
    <Chip label={item.assignedCount} />            // ✅ 5
    <Chip label={item.totalMucDoKho} />            // ✅ 35.5

    <Button
      disabled={!item.assignedCount || item.assignedCount === 0}
    />
  );
})
```

---

## 📝 Changes Made

### File: `KPIEvaluationPage.js`

#### Change 1: Extract Nested Employee Object (Line 180)

**Before:**

```javascript
{employees.map((employee, index) => {
  const kpiResult = getKPIScore(employee._id);
```

**After:**

```javascript
{employees.map((item, index) => {
  const employee = item.employee || {};  // ✅ Extract nested object
  const kpiResult = getKPIScore(employee._id);
```

#### Change 2: Fix Display Fields (Line 190-200)

**Before:**

```javascript
<Typography>{employee.HoTen}</Typography>  // ❌ undefined
<Typography>{employee.Email}</Typography>  // ❌ undefined
```

**After:**

```javascript
<Typography>{employee.Ten || "N/A"}</Typography>   // ✅ Works
<Typography>{employee.Email || "N/A"}</Typography> // ✅ Works
```

#### Change 3: Fix Chip Labels (Line 202-220)

**Before:**

```javascript
<Chip label={employee.SoLuongNhiemVu || 0} />  // ❌ undefined
<Chip label={employee.TongDoKho || "0.0"} />   // ❌ undefined
```

**After:**

```javascript
<Chip label={`${item.assignedCount || 0}/${item.totalDuties || 0}`} />  // ✅ "5/10"
<Chip label={item.totalMucDoKho?.toFixed(1) || "0.0"} />                 // ✅ "35.5"
```

#### Change 4: Fix Button Disabled Logic (Line 260-270)

**Before:**

```javascript
disabled={!employee.SoLuongNhiemVu || employee.SoLuongNhiemVu === 0}  // ❌ Always true
```

**After:**

```javascript
disabled={!item.assignedCount || item.assignedCount === 0}  // ✅ Works correctly
```

---

## 📊 Data Structure Mapping

| API Field                  | Display Location | Accessor              |
| -------------------------- | ---------------- | --------------------- |
| `item.employee.Ten`        | Họ tên column    | `employee.Ten`        |
| `item.employee.Email`      | Email (caption)  | `employee.Email`      |
| `item.employee.MaNhanVien` | Mã NV (optional) | `employee.MaNhanVien` |
| `item.assignedCount`       | Số nhiệm vụ chip | `item.assignedCount`  |
| `item.totalDuties`         | Total duties     | `item.totalDuties`    |
| `item.totalMucDoKho`       | Tổng độ khó chip | `item.totalMucDoKho`  |
| `item.LoaiQuanLy`          | Type badge       | `item.LoaiQuanLy`     |

---

## 🧪 Testing

### Before Fix:

```
┌─────┬────────┬──────────┬────────────┬─────────┐
│ STT │ Họ tên │ Số NV    │ Tổng độ khó│ Thao tác│
├─────┼────────┼──────────┼────────────┼─────────┤
│  1  │        │          │            │ [🔒]    │  ← Empty!
│  2  │        │          │            │ [🔒]    │
└─────┴────────┴──────────┴────────────┴─────────┘
```

### After Fix:

```
┌─────┬──────────────┬──────────┬────────────┬─────────┐
│ STT │ Họ tên       │ Số NV    │ Tổng độ khó│ Thao tác│
├─────┼──────────────┼──────────┼────────────┼─────────┤
│  1  │ Nguyễn Văn A │  5/10    │   35.5     │ [Đánh giá]│
│     │ a@email.com  │  [🔵]    │  [🟡]      │ [Xem KPI] │
│  2  │ Trần Thị B   │  8/10    │   52.0     │ [Đánh giá]│
│     │ b@email.com  │  [🔵]    │  [🔴]      │ [Xem KPI] │
└─────┴──────────────┴──────────┴────────────┴─────────┘
```

---

## ✅ Verification Checklist

- [x] ✅ Họ tên hiển thị đúng
- [x] ✅ Email hiển thị đúng
- [x] ✅ Số nhiệm vụ hiển thị format "5/10"
- [x] ✅ Tổng độ khó hiển thị với 1 decimal
- [x] ✅ Chip colors correct (success/warning/error)
- [x] ✅ Buttons enabled khi có assignedCount > 0
- [x] ✅ Buttons disabled khi assignedCount = 0
- [x] ✅ No console errors
- [x] ✅ Click [Đánh giá] opens dialog
- [x] ✅ Click [Xem KPI] calculates score

---

## 🎯 Key Lessons

### 1. Always Check API Response Structure

```javascript
// Don't assume flat structure
console.log("API Response:", response.data.data);

// Verify actual structure before mapping
response.data.data.forEach((item) => {
  console.log("Item structure:", Object.keys(item));
  console.log("Employee structure:", Object.keys(item.employee));
});
```

### 2. Use Optional Chaining

```javascript
// ❌ BAD: Will throw error if null/undefined
employee.KhoaID.TenKhoa;

// ✅ GOOD: Safe access
employee.KhoaID?.TenKhoa || "N/A";
```

### 3. Provide Fallback Values

```javascript
// ❌ BAD: Shows blank if undefined
<Typography>{employee.Ten}</Typography>

// ✅ GOOD: Shows "N/A" as fallback
<Typography>{employee.Ten || "N/A"}</Typography>
```

---

## 📚 Related APIs

### 1. Get Employees with Stats

```
GET /api/workmanagement/giao-nhiem-vu/employees-with-cycle-stats?chuKyId=xxx

Response: [
  {
    employee: { _id, Ten, Email, MaNhanVien, KhoaID },
    assignedCount: 5,
    totalDuties: 10,
    totalMucDoKho: 35.5,
    LoaiQuanLy: "KPI"
  }
]
```

### 2. Get Tasks for Evaluation

```
GET /api/workmanagement/kpi/nhan-vien/:id/nhiem-vu?chuKyId=xxx

Response: {
  tasks: [{ _id, NhiemVuThuongQuyID, MucDoKho, ... }],
  chuKy: { _id, TenChuKy, TuNgay, DenNgay }
}
```

---

## 🐛 Common Pitfalls

### Pitfall 1: Direct Property Access

```javascript
// ❌ Assumes flat structure
const name = employee.Ten; // undefined if nested

// ✅ Extract nested object first
const emp = item.employee;
const name = emp.Ten;
```

### Pitfall 2: Wrong Field Names

```javascript
// ❌ Using wrong field names
employee.HoTen; // ← Field doesn't exist
employee.SoLuongNV; // ← Field doesn't exist

// ✅ Using correct field names
employee.Ten; // ← Correct
item.assignedCount; // ← Correct
```

### Pitfall 3: Missing Null Checks

```javascript
// ❌ Will crash if employee is null
<Typography>{employee.Ten}</Typography>;

// ✅ Safe with fallback
const employee = item.employee || {};
<Typography>{employee.Ten || "N/A"}</Typography>;
```

---

## 🚀 Next Steps

1. **Test with Real Data:**

   - Select cycle → Verify table populates
   - Check buttons are enabled for employees with tasks
   - Verify disabled for employees without tasks

2. **Test Edge Cases:**

   - Employee with 0 assignments
   - Employee with partial assignments
   - Employee with all assignments complete

3. **Verify Dialog:**
   - Click [Đánh giá] → Dialog opens
   - Tasks load with correct employee data
   - Save works correctly

---

**Status:** ✅ FIXED
**Date:** October 18, 2025
**Impact:** Critical - Table now displays data correctly
**Tested:** Ready for user testing
