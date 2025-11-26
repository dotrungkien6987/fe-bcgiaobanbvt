# ✅ Verification Checklist - GiaoNhiemVu V2.0

## 🔧 Steps to Verify

### 1. Clear Browser Cache

```bash
# Press in browser:
Ctrl + Shift + Delete (Windows/Linux)
Cmd + Shift + Delete (Mac)

# OR Hard refresh:
Ctrl + F5 (Windows/Linux)
Cmd + Shift + R (Mac)
```

### 2. Check Dev Server

```bash
# Make sure dev server is running
cd g:\bvt-giaobanbv\fe-giaobanbv\fe-bcgiaobanbvt
npm start

# You should see:
# "Compiled successfully!"
# "webpack compiled with X warnings"
```

### 3. Check Console

```javascript
// Open browser console (F12)
// You should see:
"🎉 GiaoNhiemVuPageNew V2.0 is loaded!";
```

### 4. Visual Checks

#### ✅ Page Title

- Should see: **"🆕 Quản lý gán nhiệm vụ (Version 2.0)"**
- Old version was: "Quản lý gán nhiệm vụ"

#### ✅ Layout

- **OLD**: Sidebar (employee list) + Detail panel
- **NEW**: Full-width table với stats cards ở trên

#### ✅ Stats Cards (Top of page)

```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ Tổng NV     │ │ Tổng điểm   │ │ TB/người    │
│ đã gán      │ │ mức độ khó  │ │             │
└─────────────┘ └─────────────┘ └─────────────┘
```

#### ✅ Main Table Columns

```
STT | Mã NV | Tên nhân viên | Khoa | Số nhiệm vụ | Tổng điểm | Thao tác
```

#### ✅ Action Buttons (mỗi row)

- 👁️ **Xem chi tiết** (View icon)
- ✏️ **Gán nhiệm vụ** (Edit icon)
- 🗑️ **Gỡ tất cả** (Delete icon)

### 5. Functional Checks

#### Test 1: Click "Gán nhiệm vụ"

1. Click nút ✏️ trên bất kỳ nhân viên nào
2. Dialog mở với checkbox list
3. Các nhiệm vụ đã gán sẽ **checked sẵn**
4. Tick/untick → Thấy Alert banner: "Thay đổi: +X | -Y | =Z"

#### Test 2: Submit với Confirm

1. Trong dialog, thay đổi một số checkbox
2. Click "Cập nhật"
3. Confirm dialog mở với:
   - ➕ Thêm mới (X)
   - ➖ Gỡ bỏ (Y)
   - ✅ Giữ nguyên (Z)
   - Tổng điểm: A → B (+C)
4. Click "Xác nhận"
5. Toast hiển thị: "Thêm: X, Khôi phục: Y, Xóa: Z, Giữ nguyên: W"
6. Table auto refresh

#### Test 3: View chi tiết

1. Click nút 👁️
2. Dialog readonly hiển thị:
   - Tổng số nhiệm vụ
   - Tổng điểm
   - Danh sách chi tiết với ngày gán

### 6. Network Tab Check

#### API Calls

```bash
# Initial load:
GET /api/workmanagement/giao-nhiem-vu/:NhanVienID/nhan-vien
GET /api/workmanagement/giao-nhiem-vu/assignments/totals

# Click "Gán":
GET /api/workmanagement/giao-nhiem-vu/nhan-vien/:employeeId/nhiem-vu
GET /api/workmanagement/giao-nhiem-vu/assignments?NhanVienID=xxx

# Submit:
PUT /api/workmanagement/giao-nhiem-vu/nhan-vien/:employeeId/assignments
Body: { "dutyIds": ["id1", "id2", ...] }

# Response:
{
  "success": true,
  "data": {
    "added": 2,
    "removed": 1,
    "restored": 0,
    "unchanged": 3,
    "message": "..."
  }
}
```

### 7. Redux DevTools Check

```javascript
// Open Redux DevTools
// Check state:
state.giaoNhiemVu = {
  employees: [...],         // Should have data
  totalsByEmployeeId: {...}, // Should have stats
  isLoading: false,
  managerInfo: {...}
}
```

---

## 🚨 Troubleshooting

### Issue: Vẫn thấy old version

#### Solution 1: Hard Refresh

```bash
Ctrl + F5 (Windows)
Cmd + Shift + R (Mac)
```

#### Solution 2: Clear Cache

```bash
# Browser DevTools (F12)
# Right-click refresh button → "Empty Cache and Hard Reload"
```

#### Solution 3: Restart Dev Server

```bash
# Stop server: Ctrl + C
npm start
```

#### Solution 4: Check imports

```javascript
// In routes/index.js, should be:
import GiaoNhiemVuPageNew from "features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuPageNew";

// Route should be:
<Route
  path="/quanlycongviec/giao-nhiem-vu/:NhanVienID"
  element={<GiaoNhiemVuPageNew />}
/>;
```

### Issue: Console error "Cannot find module"

#### Check files exist:

```bash
# Verify these files exist:
fe-bcgiaobanbvt/src/features/QuanLyCongViec/GiaoNhiemVu/
├── GiaoNhiemVuPageNew.js ✅
├── components/
│   ├── EmployeeOverviewTable.js ✅
│   ├── AssignDutiesDialog.js ✅
│   └── ViewAssignmentsDialog.js ✅
```

### Issue: Table không hiển thị data

#### Check:

1. Redux state có `employees` array không?
2. API `/nhan-vien` trả về data chưa?
3. Console có error không?

### Issue: Dialog không mở

#### Check:

1. onClick handler có được gọi không? (console.log)
2. State `assignDialogOpen` có update không?
3. Component `AssignDutiesDialog` có import đúng không?

---

## 📋 Expected Behavior

### ✅ What You SHOULD See

1. **Page Title**: "🆕 Quản lý gán nhiệm vụ (Version 2.0)"
2. **3 Stats Cards** at top
3. **Table** với search bar
4. **Action buttons** mỗi row: 👁️ ✏️ 🗑️
5. **Console log**: "🎉 GiaoNhiemVuPageNew V2.0 is loaded!"

### ❌ What You Should NOT See

1. ~~Sidebar với employee list~~ (old version)
2. ~~Detail panel phía bên phải~~ (old version)
3. ~~Title: "Quản lý gán nhiệm vụ"~~ (without 🆕 and version)

---

## 🔗 URLs

```bash
# New version (default):
http://localhost:3000/quanlycongviec/giao-nhiem-vu/:NhanVienID

# Old version (backup):
http://localhost:3000/quanlycongviec/giao-nhiem-vu-old/:NhanVienID
```

Replace `:NhanVienID` with actual ID, e.g.:

```
http://localhost:3000/quanlycongviec/giao-nhiem-vu/65f1234567890abcdef12345
```

---

## 📞 Final Checklist

Before reporting issue, verify:

- [ ] Cleared browser cache
- [ ] Hard refreshed page (Ctrl+F5)
- [ ] Dev server restarted
- [ ] Console shows "GiaoNhiemVuPageNew V2.0 is loaded!"
- [ ] No console errors
- [ ] Correct URL with actual NhanVienID
- [ ] Network tab shows API calls
- [ ] Redux state has data

---

**If all checks pass and still not working, please provide:**

1. Screenshot of current page
2. Console errors (if any)
3. Network tab showing API calls
4. Redux state snapshot

---

**Last Updated**: 2025-10-02  
**Status**: ✅ Ready to test
