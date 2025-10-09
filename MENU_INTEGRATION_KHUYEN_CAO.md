# Menu Integration - Khuyến Cáo Khoa BQBA

## ✅ Đã thêm menu item

### Location

**File**: `src/menu-items/hethong.js`

### Menu Item Added

```javascript
{
  id: "KhuyenCaoKhoaBQBA",
  title: "Khuyến cáo khoa BQBA",
  type: "item",
  url: "/khuyen-cao-khoa-bqba",
}
```

### Menu Structure

```
Hệ thống
└── Cấu hình danh mục
    ├── Nhóm hình thức cập nhật
    ├── Hình thức cập nhật
    ├── ...
    ├── Danh mục khoa
    ├── Khoa bình quân bệnh án          ← Existing
    ├── Khuyến cáo khoa BQBA            ← NEW ✨
    ├── Nhóm các khoa
    └── Loại chuyên môn
```

## Access

### Via Menu

1. Đăng nhập hệ thống
2. Sidebar → **Hệ thống**
3. Expand → **Cấu hình danh mục**
4. Click → **Khuyến cáo khoa BQBA**
5. Redirect to `/khuyen-cao-khoa-bqba`

### Direct URL

```
http://localhost:3000/khuyen-cao-khoa-bqba
```

### Permission

- **Required**: Admin role (AdminRequire wrapper in routes)
- Non-admin users: Menu visible nhưng access bị chặn

## Related Components

- **Route**: `src/routes/index.js` (line 240-248)
- **Page**: `src/features/DashBoard/BinhQuanBenhAn/KhuyenCaoKhoaBQBATable.js`
- **Menu**: `src/menu-items/hethong.js` (line 160-165)

## Testing

### Test Menu Display

- [x] Menu item hiển thị trong sidebar
- [x] Title đúng: "Khuyến cáo khoa BQBA"
- [x] Position đúng: Sau "Khoa bình quân bệnh án"

### Test Navigation

- [x] Click menu → Navigate to correct URL
- [x] URL matches: `/khuyen-cao-khoa-bqba`
- [x] Page loads correctly
- [x] AdminRequire works (redirect if not admin)

### Test Permission

```javascript
// Admin user
- Menu visible ✅
- Can access page ✅
- CRUD functions work ✅

// Non-admin user
- Menu visible ✅
- Access blocked ❌ (redirect or error)
```

## Styling

Menu item sử dụng default styling:

- No custom icon (inherits from parent group)
- Standard text color
- Hover effect: Material-UI default
- Active state: Highlighted khi đang trên trang này

## Future Enhancements

### Optional Icon

Có thể thêm icon riêng cho menu item:

```javascript
import { ChartSquare } from "iconsax-react";

{
  id: "KhuyenCaoKhoaBQBA",
  title: "Khuyến cáo khoa BQBA",
  type: "item",
  url: "/khuyen-cao-khoa-bqba",
  icon: ChartSquare, // ← Custom icon
}
```

### Breadcrumbs

Nếu cần breadcrumb navigation:

```javascript
// Add to route config
{
  path: "/khuyen-cao-khoa-bqba",
  breadcrumb: "Khuyến cáo khoa BQBA"
}
```

## Relationship with Other Features

```
Menu Flow:
Khoa bình quân bệnh án (Master Data)
   ↓ (provides KhoaID + LoaiKhoa)
Khuyến cáo khoa BQBA (Benchmark Data)
   ↓ (provides benchmarks by year)
Dashboard Bình Quân Bệnh Án (Display Integration)
   ↓ (shows actual vs benchmark comparison)
```

## Summary

✅ **Menu item đã được thêm thành công**

- Location: Hệ thống → Cấu hình danh mục → Khuyến cáo khoa BQBA
- URL: `/khuyen-cao-khoa-bqba`
- Permission: Admin only
- Position: Giữa "Khoa bình quân bệnh án" và "Nhóm các khoa"

**Status**: Ready to use! 🚀

---

**Last Updated**: October 9, 2025
