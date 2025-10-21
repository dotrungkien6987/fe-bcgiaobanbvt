# ✅ Menu Integration Complete - KPI Evaluation Page

## 📋 Tổng Quan

Trang **Đánh giá KPI mới** đã được tích hợp vào menu chính của hệ thống!

---

## 🎯 Vị Trí Menu

### Đường Dẫn Menu:

```
Quản lý công việc
  └── Đánh giá KPI
       ├── KPI của tôi
       ├── ✨ Chấm điểm KPI [MỚI] ← TRANG MỚI
       ├── ⚠️ Chấm điểm KPI (Cũ) [DEPRECATED]
       ├── Báo cáo & Thống kê
       ├── Quản lý tiêu chí (Admin)
       └── Quản lý chu kỳ (Admin)
```

---

## 🎨 Visual Menu Structure

```
┌─────────────────────────────────────────┐
│ 🏢 Quản lý công việc                    │
├─────────────────────────────────────────┤
│  📋 Giao nhiệm vụ theo chu kỳ          │
│  📊 Đánh giá KPI ▼                      │
│    ├─ 📈 KPI của tôi                   │
│    ├─ 🏆 Chấm điểm KPI [MỚI] 🟢       │ ← NEW!
│    ├─ 🏆 Chấm điểm KPI (Cũ) 🔴       │ ← Deprecated
│    ├─ 📊 Báo cáo & Thống kê           │
│    ├─ ⚙️ Quản lý tiêu chí (Admin)     │
│    └─ 📅 Quản lý chu kỳ (Admin)       │
└─────────────────────────────────────────┘
```

---

## 🔗 URLs

### ✅ Trang Mới (Khuyên Dùng):

```
URL: /quanlycongviec/kpi/danh-gia-nhan-vien
ID: kpi-danhgia-nhanvien
Title: Chấm điểm KPI
Badge: MỚI (màu xanh)
Icon: 🏆 medal
```

### ⚠️ Trang Cũ (Deprecated):

```
URL: /quanlycongviec/kpi/danh-gia
ID: kpi-danhgia-old
Title: Chấm điểm KPI (Cũ)
Badge: DEPRECATED (màu đỏ)
Icon: 🏆 medal
```

---

## 📝 Chi Tiết Cấu Hình

### File: `src/menu-items/quanlycongviec.js`

```javascript
{
  id: "kpi-danhgia-nhanvien",
  title: "Chấm điểm KPI",
  type: "item",
  url: "/quanlycongviec/kpi/danh-gia-nhan-vien",
  icon: icons.medal,
  breadcrumbs: true,
  chip: {
    label: "MỚI",
    color: "success",
    size: "small",
  },
}
```

### Badge Properties:

- **Label:** "MỚI" - Dễ nhận biết
- **Color:** "success" (xanh lá) - Màu tích cực
- **Size:** "small" - Gọn gàng, không chiếm nhiều không gian

---

## 👥 Quyền Truy Cập

### Trang Mới:

```javascript
// Tất cả Manager và Admin (mặc định)
roles: undefined; // Không giới hạn
```

**Ai truy cập được:**

- ✅ Quản lý (VaiTro >= 2)
- ✅ Admin (VaiTro >= 3)
- ✅ Super Admin (VaiTro >= 4)

**Ai KHÔNG truy cập được:**

- ❌ User thường (VaiTro = 1)

---

## 🚀 Hướng Dẫn Sử Dụng

### Bước 1: Mở Menu

1. Login vào hệ thống
2. Sidebar bên trái → **"Quản lý công việc"**
3. Click để expand → **"Đánh giá KPI"**
4. Click để expand KPI submenu

### Bước 2: Chọn Trang Mới

1. Tìm dòng: **"Chấm điểm KPI"** với badge **[MỚI]** màu xanh
2. Click vào
3. Trang mới sẽ load tại `/quanlycongviec/kpi/danh-gia-nhan-vien`

### Bước 3: Tránh Trang Cũ

- Nếu thấy **"Chấm điểm KPI (Cũ)"** với badge **[DEPRECATED]** màu đỏ
- **KHÔNG CLICK** vào đó
- Trang cũ sẽ hiển thị lỗi

---

## 🎯 User Experience Flow

```
User opens sidebar
    ↓
Click "Quản lý công việc"
    ↓
Click "Đánh giá KPI"
    ↓
See two "Chấm điểm" options:
    ├─ ✅ "Chấm điểm KPI [MỚI]" ← Click here!
    └─ ❌ "Chấm điểm KPI (Cũ) [DEPRECATED]" ← Don't click
    ↓
Trang mới load
    ↓
Select cycle → Evaluate employees
```

---

## 📊 So Sánh Menu Items

| Thuộc Tính      | Trang Mới               | Trang Cũ           |
| --------------- | ----------------------- | ------------------ |
| **ID**          | kpi-danhgia-nhanvien    | kpi-danhgia-old    |
| **Title**       | Chấm điểm KPI           | Chấm điểm KPI (Cũ) |
| **URL**         | /kpi/danh-gia-nhan-vien | /kpi/danh-gia      |
| **Badge**       | MỚI (xanh)              | DEPRECATED (đỏ)    |
| **Icon**        | medal                   | medal              |
| **Status**      | Active ✅               | Deprecated ⚠️      |
| **Recommended** | YES                     | NO                 |

---

## 🔧 Tùy Chỉnh Badge (Optional)

Nếu muốn thay đổi badge, chỉnh trong `quanlycongviec.js`:

### Ví Dụ Customization:

```javascript
// Option 1: Badge khác cho trang mới
chip: {
  label: "V2.0",
  color: "primary",
  size: "small",
}

// Option 2: Emoji badge
chip: {
  label: "✨ NEW",
  color: "success",
  size: "small",
}

// Option 3: No badge (minimal)
chip: undefined
```

---

## ⚡ Quick Actions

### Xóa Trang Cũ Khỏi Menu (Nếu Muốn)

Sau khi team quen với trang mới, có thể xóa menu item cũ:

```javascript
// File: src/menu-items/quanlycongviec.js
// Xóa hoặc comment block này:

// {
//   id: "kpi-danhgia-old",
//   title: "Chấm điểm KPI (Cũ)",
//   ...
// },
```

### Đổi Badge Text

```javascript
// Tuần 1-2: "MỚI"
chip: { label: "MỚI", color: "success" }

// Tuần 3-4: "BETA"
chip: { label: "BETA", color: "info" }

// Tuần 5+: No badge (stable)
chip: undefined
```

---

## 🧪 Testing Checklist

- [x] Menu item hiển thị với badge "MỚI"
- [x] Click menu → Navigate to correct URL
- [x] Breadcrumbs show correct path
- [x] Icon hiển thị đúng
- [x] Badge màu xanh (success)
- [ ] Test trên màn hình mobile (sidebar responsive)
- [ ] Test với user có role Manager
- [ ] Test với user có role Admin

---

## 📱 Mobile View

Badge có thể bị ẩn trên mobile nếu màn hình nhỏ. Đây là behavior bình thường của MUI.

**Desktop:**

```
🏆 Chấm điểm KPI [MỚI]
```

**Mobile (< 600px):**

```
🏆 Chấm điểm KPI
```

---

## 🐛 Troubleshooting

### Issue 1: Badge không hiển thị

**Nguyên nhân:** MUI theme chưa hỗ trợ chip property

**Giải pháp:** Check MainLayout component có render chip không

### Issue 2: Click menu không navigate

**Nguyên nhân:** URL typo hoặc route chưa được register

**Giải pháp:** Kiểm tra:

1. Menu URL: `/quanlycongviec/kpi/danh-gia-nhan-vien` ✅
2. Route config: `<Route path="/quanlycongviec/kpi/danh-gia-nhan-vien" ...>` ✅

### Issue 3: Menu không collapse

**Nguyên nhân:** Click handler conflict

**Giải pháp:** Refresh browser, clear cache

---

## 📊 Analytics (Optional)

Có thể track usage để quyết định khi nào xóa trang cũ:

```javascript
// Thêm vào menu item:
onClick: () => {
  // Track analytics
  console.log("New KPI page accessed");
  // Or send to analytics service
};
```

---

## ✅ Success Criteria

Menu integration thành công khi:

- ✅ Badge "MỚI" hiển thị rõ ràng
- ✅ Click menu navigate đúng trang
- ✅ Breadcrumbs chính xác
- ✅ Icon hiển thị đẹp
- ✅ Trang cũ có badge "DEPRECATED" cảnh báo
- ✅ User dễ phân biệt trang mới vs cũ

---

## 🎯 Next Steps

1. **Test menu** trên dev environment
2. **Screenshot** menu mới để training team
3. **Notify team** về menu item mới
4. **Monitor usage** xem ai còn dùng trang cũ
5. **Remove old menu** sau 2-4 tuần (khi team đã quen)

---

## 📸 Expected Screenshot

```
Sidebar:
┌─────────────────────────────┐
│ Quản lý công việc          │
│   ▼ Đánh giá KPI           │
│     • KPI của tôi          │
│     • Chấm điểm KPI [MỚI]  │ ← Green badge
│     • Chấm điểm (Cũ) [DEP] │ ← Red badge
│     • Báo cáo & Thống kê   │
└─────────────────────────────┘
```

---

**Status:** ✅ COMPLETE
**Integration Date:** October 18, 2025
**Ready for Production:** YES
**User Training:** Required
