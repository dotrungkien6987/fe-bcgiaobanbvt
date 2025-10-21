# 🗂️ MENU NAVIGATION - Cycle-Based Assignment

## ✅ Menu Item Added

### **Location**: Quản lý công việc > 📅 Phân công theo chu kỳ

### **Menu Hierarchy**:

```
📋 Quản lý công việc và KPI
  └─ 📋 Quản lý công việc
      ├─ Nhóm việc theo dõi
      ├─ Công việc của tôi
      ├─ Sơ đồ Cây Công việc
      ├─ Sơ đồ Cây Công việc enhance
      ├─ Cán bộ tôi quản lý
      ├─ Phân công cho nhân viên của tôi       ← Old version
      ├─ 📅 Phân công theo chu kỳ               ← NEW! ✨
      └─ Nhiệm vụ thường quy
```

---

## 📝 Menu Configuration

### **File**: `src/menu-items/quanlycongviec.js`

```javascript
{
  id: "giaonhiemvu-theo-chuky",
  title: "📅 Phân công theo chu kỳ",
  type: "item",
  // Dynamic URL: :NhanVienID replaced by user.NhanVienID at runtime
  url: "/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID",
}
```

### **Key Features**:

- ✅ **Dynamic URL**: `:NhanVienID` automatically replaced with logged-in user's ID
- ✅ **Auto-hide**: Menu item hidden if user has no `NhanVienID`
- ✅ **Access Control**: Only users with `NhanVienID` can access
- ✅ **Icon**: 📅 Calendar emoji for visual distinction

---

## 🔄 URL Transformation

### **Menu Definition**:

```
/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID
```

### **Runtime Replacement** (by Navigation component):

```javascript
// Example: User with NhanVienID = "66b1dba74f79822a4752d8f8"

// Before (menu config):
url: "/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID";

// After (rendered in UI):
url: "/quanlycongviec/giao-nhiem-vu-chu-ky/66b1dba74f79822a4752d8f8";
```

### **Implementation** (`src/layout/MainLayout/Drawer/DrawerContent/Navigation/index.js`):

```javascript
const replaceNhanVienID = (node) => {
  if (!node) return null;

  // Hide node if requires NhanVienID but user doesn't have it
  if (node.url && node.url.includes(":NhanVienID") && !user?.NhanVienID) {
    return null;
  }

  const newNode = { ...node };

  // Replace :NhanVienID with actual user ID
  if (newNode.url && user?.NhanVienID && newNode.url.includes(":NhanVienID")) {
    newNode.url = newNode.url.replace(":NhanVienID", user.NhanVienID);
  }

  // Recursively process children
  if (Array.isArray(newNode.children)) {
    newNode.children = newNode.children.map(replaceNhanVienID).filter(Boolean);
  }

  return newNode;
};
```

---

## 🛣️ Route Matching

### **Route Definition** (`src/routes/index.js`):

```javascript
<Route
  path="/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID"
  element={<CycleAssignmentPage />}
/>
```

### **Component Parameter Extraction**:

```javascript
// CycleAssignmentPage.js
const { NhanVienID } = useParams();
const employeeId = NhanVienID; // Alias for backend API calls
```

---

## 🎯 User Flow

### **Step-by-Step Navigation**:

1. **User logs in** → System stores `user.NhanVienID` in auth context

2. **Menu renders** → Navigation component calls `replaceNhanVienID()`

3. **URL transformation**:

   ```
   /quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID
                              ↓
   /quanlycongviec/giao-nhiem-vu-chu-ky/66b1dba74f79822a4752d8f8
   ```

4. **User clicks menu** → React Router navigates to transformed URL

5. **Component loads** → `useParams()` extracts `NhanVienID` from URL

6. **Data fetches** → Redux thunks use `employeeId` to call backend APIs

---

## 🔒 Access Control

### **Visibility Logic**:

| Scenario                  | Menu Visibility  | Behavior                          |
| ------------------------- | ---------------- | --------------------------------- |
| User has `NhanVienID`     | ✅ Visible       | URL replaced, navigation works    |
| User has no `NhanVienID`  | ❌ Hidden        | Menu item not rendered            |
| Direct URL access (no ID) | ⚠️ Route matches | Component shows error/empty state |

### **Security Note**:

Frontend visibility ≠ backend authorization. Backend APIs still validate:

- User must be logged in
- User must have manager permission for target employee
- Assignments must belong to user's managed employees

---

## 🆚 Comparison with Old Menu

### **Old Menu** (Phân công cho nhân viên của tôi):

- **URL**: `/quanlycongviec/giao-nhiem-vu/:NhanVienID`
- **Component**: `GiaoNhiemVuPageNew`
- **Features**:
  - Table-based overview of all managed employees
  - Bulk assignment with checkboxes
  - No cycle support

### **New Menu** (📅 Phân công theo chu kỳ):

- **URL**: `/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID`
- **Component**: `CycleAssignmentPage`
- **Features**:
  - Two-column layout (available vs assigned)
  - Cycle-based assignment
  - Inline difficulty editing
  - Copy from previous cycle

### **Both Use Same Placeholder**:

```javascript
:NhanVienID  // Consistent convention across all management pages
```

---

## 🧪 Testing Menu Navigation

### **Manual Test Steps**:

1. **Login** with account that has `NhanVienID`

   - Admin or manager account
   - Check: `user.NhanVienID` exists in Redux store

2. **Open Sidebar** → Expand "Quản lý công việc"

3. **Verify Menu Item**:

   - [ ] "📅 Phân công theo chu kỳ" is visible
   - [ ] Located after "Phân công cho nhân viên của tôi"
   - [ ] Has calendar emoji icon

4. **Click Menu Item**:

   - [ ] URL changes to `/quanlycongviec/giao-nhiem-vu-chu-ky/{actualID}`
   - [ ] `CycleAssignmentPage` component loads
   - [ ] No console errors

5. **Check URL Parameter**:

   ```javascript
   // Browser console:
   window.location.pathname;
   // Should output: /quanlycongviec/giao-nhiem-vu-chu-ky/66b1dba74f79822a4752d8f8
   ```

6. **Test Different Users**:
   - User A (has NhanVienID) → Menu visible
   - User B (no NhanVienID) → Menu hidden

---

## 🐛 Troubleshooting

### **Q: Menu item không hiển thị?**

**A**: Kiểm tra:

- User đã đăng nhập chưa?
- `user.NhanVienID` có tồn tại không? (Kiểm tra Redux DevTools)
- Clear cache và refresh (Ctrl+Shift+R)

### **Q: Click menu nhưng trang không load?**

**A**: Kiểm tra:

- Route đã được đăng ký trong `routes/index.js` chưa?
- Component `CycleAssignmentPage` đã được import đúng chưa?
- Console có error gì không?

### **Q: URL vẫn chứa `:NhanVienID` chứ không phải ID thực?**

**A**: Bug ở Navigation component:

- Kiểm tra `replaceNhanVienID` function
- Verify `user.NhanVienID` có giá trị
- Check `useLayoutEffect` dependencies

### **Q: 404 Not Found khi truy cập trực tiếp URL?**

**A**:

- Route parameter phải match: `:NhanVienID` (uppercase D)
- Component phải extract đúng: `const { NhanVienID } = useParams()`
- Backend API endpoint phải chấp nhận `employeeId`

---

## 📊 Menu Analytics

### **Expected User Behavior**:

```
Users with NhanVienID (Managers/Admins)
  ↓
Click "Phân công theo chu kỳ"
  ↓
Select employee (current user by default)
  ↓
Select cycle
  ↓
Assign tasks
  ↓
Save changes
```

### **Tracking Metrics** (Optional):

- Click-through rate on new menu item
- Time spent on cycle assignment page
- Number of assignments per cycle
- Copy feature usage frequency

---

## 🚀 Future Enhancements

### **Potential Menu Improvements**:

1. **Submenu Structure**:

   ```
   Phân công
     ├─ Phân công vĩnh viễn (old version)
     └─ 📅 Phân công theo chu kỳ (new version)
   ```

2. **Badge Counter**:

   ```javascript
   {
     title: "📅 Phân công theo chu kỳ",
     badge: { count: 5, color: "warning" } // 5 employees pending
   }
   ```

3. **Breadcrumb Trail**:

   ```
   Home > Quản lý công việc > Phân công theo chu kỳ > Nguyễn Văn A
   ```

4. **Quick Actions**:
   - Right-click menu → "Copy from last cycle"
   - Keyboard shortcut: `Ctrl+Shift+P` → Open assignment page

---

## ✅ Completion Checklist

- [x] Menu item added to `quanlycongviec.js`
- [x] Menu positioned after old assignment page
- [x] Dynamic URL with `:NhanVienID` placeholder
- [x] Route registered in `routes/index.js`
- [x] Component handles URL parameter correctly
- [x] Navigation component replaces placeholder
- [x] Access control (hide if no NhanVienID)
- [x] Icon/emoji added for visual distinction
- [ ] Manual testing completed
- [ ] User documentation updated

---

## 📚 Related Files

```
Menu Configuration:
├─ src/menu-items/quanlycongviec.js          ← Menu definition

Navigation Logic:
├─ src/layout/MainLayout/Drawer/DrawerContent/Navigation/index.js  ← URL replacement

Routing:
├─ src/routes/index.js                        ← Route registration

Component:
└─ src/features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentPage.js  ← Page component
```

---

**✨ Menu ready to use! Users can now navigate to the cycle assignment page from the sidebar!**
