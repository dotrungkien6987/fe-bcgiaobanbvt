# 🗂️ Menu Navigation Guide - Khuyến Cáo Khoa BQBA

## 📍 Vị trí Menu

```
┌─ Sidebar Menu ────────────────────────────────┐
│                                                │
│  🏠 Dashboard                                  │
│  📊 Báo cáo                                    │
│  👥 Nhân viên                                  │
│  📚 Đào tạo                                    │
│  ⚙️  Hệ thống                    ◄── CLICK    │
│     │                                          │
│     ├─ 📋 Cấu hình danh mục     ◄── EXPAND    │
│     │   ├─ Nhóm hình thức cập nhật            │
│     │   ├─ Hình thức cập nhật                 │
│     │   ├─ Trình độ chuyên môn quy đổi        │
│     │   ├─ ...                                 │
│     │   ├─ Danh mục khoa                       │
│     │   ├─ Khoa bình quân bệnh án             │
│     │   ├─ 🎯 Khuyến cáo khoa BQBA  ◄── NEW   │
│     │   ├─ Nhóm các khoa                       │
│     │   └─ Loại chuyên môn                     │
│     │                                          │
│     └─ ...                                     │
│                                                │
└────────────────────────────────────────────────┘
```

## 🔐 Access Control

### Admin Users ✅

```
Login as Admin
  ↓
Menu visible in sidebar
  ↓
Click "Khuyến cáo khoa BQBA"
  ↓
Navigate to /khuyen-cao-khoa-bqba
  ↓
Page loads successfully
  ↓
Full CRUD functionality
```

### Non-Admin Users ❌

```
Login as Regular User
  ↓
Menu visible in sidebar
  ↓
Click "Khuyến cáo khoa BQBA"
  ↓
Navigate to /khuyen-cao-khoa-bqba
  ↓
AdminRequire blocks access
  ↓
Redirect to login or show error
```

## 🎨 Visual Appearance

### Menu Item States

**Normal State:**

```
├─ Khuyến cáo khoa BQBA
   [Gray text, default font weight]
```

**Hover State:**

```
├─ Khuyến cáo khoa BQBA
   [Background highlight, cursor pointer]
```

**Active State (when on page):**

```
├─ Khuyến cáo khoa BQBA
   [Blue background, white text, highlighted]
```

## 🔗 Navigation Flow

### Method 1: Via Menu (Recommended)

```
1. Login to system
2. Look at left sidebar
3. Click "Hệ thống" (System)
4. Click "Cấu hình danh mục" (Configuration)
5. Scroll to "Khuyến cáo khoa BQBA"
6. Click menu item
7. Page loads
```

### Method 2: Direct URL

```
Browser → http://localhost:3000/khuyen-cao-khoa-bqba
         or
         http://your-domain.com/khuyen-cao-khoa-bqba
```

### Method 3: Breadcrumb (if implemented)

```
Home > Hệ thống > Cấu hình danh mục > Khuyến cáo khoa BQBA
```

## 📱 Responsive Behavior

### Desktop View (>900px)

- Sidebar visible by default
- Menu always expanded
- Full menu text visible

### Tablet View (600px - 900px)

- Sidebar collapsible
- Menu icons + text
- Tap to navigate

### Mobile View (<600px)

- Hamburger menu
- Drawer sidebar
- Full-screen menu overlay

## 🎯 User Journey

### Typical Workflow:

```
Manager logs in
  ↓
Goes to "Hệ thống" menu
  ↓
Finds "Khuyến cáo khoa BQBA"
  ↓
Clicks menu item
  ↓
Arrives at management page
  ↓
Sees table with year selector
  ↓
Clicks "Thêm khuyến cáo"
  ↓
Fills form, saves
  ↓
Returns to table view
  ↓
Checks "Dashboard" to see benchmarks
```

## 🔍 Troubleshooting

### Issue 1: Menu not visible

**Cause**: User not logged in
**Solution**:

```javascript
// Check authentication
if (!localStorage.getItem("accessToken")) {
  // Redirect to login
  window.location.href = "/login";
}
```

### Issue 2: Menu visible but can't access

**Cause**: User not Admin
**Solution**:

- Contact administrator for role upgrade
- Or use different admin account

### Issue 3: Menu shows but page 404

**Cause**: Route not registered
**Solution**:

```javascript
// Verify route exists in src/routes/index.js
<Route path="/khuyen-cao-khoa-bqba" element={...} />
```

## 📊 Menu Analytics (Optional)

Track menu usage:

```javascript
// Google Analytics event
onClick={() => {
  gtag('event', 'menu_click', {
    menu_item: 'KhuyenCaoKhoaBQBA',
    timestamp: new Date().toISOString()
  });
}}
```

## 🎨 Customization Options

### Change Menu Title

```javascript
// hethong.js
{
  id: "KhuyenCaoKhoaBQBA",
  title: "Quản lý khuyến cáo",  // ← Customize here
  type: "item",
  url: "/khuyen-cao-khoa-bqba",
}
```

### Add Icon

```javascript
import { ChartSquare } from "iconsax-react";

{
  id: "KhuyenCaoKhoaBQBA",
  title: "Khuyến cáo khoa BQBA",
  type: "item",
  url: "/khuyen-cao-khoa-bqba",
  icon: ChartSquare,  // ← Add icon
}
```

### Add Badge (notification count)

```javascript
{
  id: "KhuyenCaoKhoaBQBA",
  title: "Khuyến cáo khoa BQBA",
  type: "item",
  url: "/khuyen-cao-khoa-bqba",
  chip: {
    label: '5',
    color: 'error',
    size: 'small'
  }
}
```

## 📝 Related Documentation

- **Route Setup**: `src/routes/index.js` (line 240-248)
- **Menu Config**: `src/menu-items/hethong.js` (line 160-165)
- **Page Component**: `src/features/DashBoard/BinhQuanBenhAn/KhuyenCaoKhoaBQBATable.js`
- **Permission**: `src/routes/AdminRequire.js`

## ✅ Checklist

Setup:

- [x] Menu item added to hethong.js
- [x] Route registered in routes/index.js
- [x] AdminRequire wrapper applied
- [x] Component imported correctly

Testing:

- [ ] Menu displays in sidebar
- [ ] Menu expands on click
- [ ] Navigation works (URL changes)
- [ ] Page loads without errors
- [ ] Admin access works
- [ ] Non-admin blocked correctly

## 🚀 Quick Test

```bash
# 1. Start frontend
cd fe-bcgiaobanbvt
npm start

# 2. Open browser
http://localhost:3000

# 3. Login as admin
Username: admin@example.com
Password: [your password]

# 4. Navigate via menu
Sidebar > Hệ thống > Cấu hình danh mục > Khuyến cáo khoa BQBA

# 5. Verify page loads
Should see: Table with year selector and CRUD buttons
```

---

**Status**: ✅ Menu integration complete!  
**Last Updated**: October 9, 2025
