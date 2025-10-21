# 🎨 Cycle Assignment UX - Visual Guide

## 🔄 FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    📅 MENU NAVIGATION                        │
│  "Phân công theo chu kỳ" → /giao-nhiem-vu-chu-ky           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         📊 TRANG 1: CycleAssignmentListPage                 │
│─────────────────────────────────────────────────────────────│
│                                                             │
│  🔽 CHU KỲ ĐÁNH GIÁ: [Q1/2025 ▼]                          │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ STT │ Mã NV │ Họ tên    │ Khoa      │ NV   │ Thao tác│ │
│  ├─────┼───────┼───────────┼───────────┼──────┼─────────┤ │
│  │ 1   │ NV001 │ Nguyễn A  │ Khoa Nội  │ 5/12 │ [Gán]  │ │◄─┐
│  │ 2   │ NV002 │ Trần B    │ Khoa Nội  │ 8/12 │ [Gán]  │ │  │
│  │ 3   │ NV003 │ Lê C      │ Khoa Ngoại│ 0/8  │ [Gán]  │ │  │
│  └───────────────────────────────────────────────────────┘ │  │
│                                                             │  │
│  📈 Thống kê: 15 nhân viên | 8 đã gán đủ | 2 chưa gán    │  │
└────────────────────┬────────────────────────────────────────┘  │
                     │ Click [Gán]                               │
                     ▼                                            │
┌─────────────────────────────────────────────────────────────┐  │
│      📝 TRANG 2: CycleAssignmentDetailPage                  │  │
│  URL: /giao-nhiem-vu-chu-ky/:NhanVienID?chuKyId=xxx        │  │
│─────────────────────────────────────────────────────────────│  │
│                                                             │  │
│  👤 Nhân viên: Nguyễn Văn A (NV001) - Khoa Nội             │  │
│  🔽 Chu kỳ: Q1/2025 (auto-selected from URL)              │  │
│                                                             │  │
│  ┌─────────────────────┬─────────────────────────────────┐ │  │
│  │  📚 Nhiệm vụ (7)    │  📝 Đã gán (5)                 │ │  │
│  ├─────────────────────┼─────────────────────────────────┤ │  │
│  │                     │                                 │ │  │
│  │ ☐ Nhiệm vụ 1 [+]   │ 1. Nhiệm vụ A                  │ │  │
│  │ ☐ Nhiệm vụ 2 [+]   │    Độ khó: [5.0] 🟡        [X]│ │  │
│  │ ☐ Nhiệm vụ 3 [+]   │                                 │ │  │
│  │ ☐ Nhiệm vụ 4 [+]   │ 2. Nhiệm vụ B                  │ │  │
│  │ ☐ Nhiệm vụ 5 [+]   │    Độ khó: [7.0] 🔴        [X]│ │  │
│  │ ☐ Nhiệm vụ 6 [+]   │                                 │ │  │
│  │ ☐ Nhiệm vụ 7 [+]   │ ... (3 more)                   │ │  │
│  │                     │                                 │ │  │
│  │                     │ Tổng: 5 nhiệm vụ | Độ khó: 31.5│ │  │
│  └─────────────────────┴─────────────────────────────────┘ │  │
│                                                             │  │
│  [← Quay lại]                           [💾 Lưu thay đổi] │  │
└────────────────────┬────────────────────────────────────────┘  │
                     │ Click [Quay lại]                          │
                     └───────────────────────────────────────────┘
```

---

## 🎯 USER INTERACTION POINTS

### 1️⃣ **Entry Point (Menu)**

```
Menu sidebar
  └─ Quản lý công việc
      └─ 📅 Phân công theo chu kỳ  ← Click here
```

### 2️⃣ **List Page (Overview)**

```
Actions:
1. Select cycle from dropdown
   → Triggers API call
   → Loads employee table

2. View employee stats
   → Color-coded progress chips:
      🔴 0%    = No assignments
      🟡 1-49% = Partially assigned
      🔵 50-99%= In progress
      🟢 100%  = Fully assigned

3. Click [Gán] button
   → Navigate to detail page
   → Passes chuKyId via URL query param
```

### 3️⃣ **Detail Page (Assignment)**

```
Actions:
1. Auto-load cycle from URL
   → No need to re-select cycle

2. Left column: Add tasks
   → Click [+] button
   → Task moves to right column

3. Right column: Edit/Remove
   → Adjust difficulty (1.0-10.0)
   → Click [X] to remove

4. [Lưu thay đổi]
   → Batch save all changes
   → Updates database

5. [Quay lại]
   → Return to list page
   → Stats automatically refresh
```

---

## 📊 DATA FLOW

### API Call Sequence

#### **Page Load: ListPage**

```
1. GET /chu-ky-danh-gia
   → Load cycles dropdown

2. User selects cycle

3. GET /employees-with-cycle-stats?chuKyId=xxx
   ↓
   Response: [
     {
       employee: { _id, Ten, MaNhanVien, KhoaID },
       assignedCount: 5,
       totalDuties: 12,
       LoaiQuanLy: "KPI"
     },
     ...
   ]
   ↓
4. Render table with stats
```

#### **Page Load: DetailPage**

```
1. Read chuKyId from URL: ?chuKyId=xxx

2. GET /chu-ky-danh-gia
   → Load cycles dropdown

3. Auto-dispatch: setSelectedChuKy(chuKyId)

4. GET /nhan-vien/:employeeId/by-cycle?chuKyId=xxx
   ↓
   Response: {
     employee: {...},
     assignedTasks: [...],
     availableDuties: [...]
   }
   ↓
5. Render two-column layout
```

#### **Save Changes**

```
1. User clicks [Lưu thay đổi]

2. PUT /nhan-vien/:employeeId/cycle-assignments
   Body: {
     chuKyId: "xxx",
     tasks: [
       { NhiemVuThuongQuyID: "...", MucDoKho: 5.0 },
       { NhiemVuThuongQuyID: "...", MucDoKho: 7.0 }
     ]
   }
   ↓
3. Backend: Hard delete old + Insert new

4. Success toast: "Đã lưu thành công"

5. Redux state updates
```

---

## 🎨 UI COMPONENTS

### Color Palette

#### Progress Chips

```css
🔴 error   (0%):       background: #f44336
🟡 warning (1-49%):    background: #ff9800
🔵 info    (50-99%):   background: #2196f3
🟢 success (100%):     background: #4caf50
```

#### Management Type Chips

```css
[KPI]        → primary   (blue)
[Giao việc]  → default   (gray)
```

#### Difficulty Chips (Detail Page)

```css
1.0-3.0  → success  (green)   Easy
3.5-7.0  → warning  (orange)  Medium
7.5-10.0 → error    (red)     Hard
```

---

## 📱 RESPONSIVE BEHAVIOR

### Desktop (≥1200px)

```
┌────────────────────────────────────────────┐
│ Full table with all columns                │
│ Two-column layout side-by-side            │
└────────────────────────────────────────────┘
```

### Tablet (768-1199px)

```
┌──────────────────────────┐
│ Table with wrapped cells │
│ Two columns stacked      │
└──────────────────────────┘
```

### Mobile (<768px)

```
┌──────────────┐
│ Card layout  │
│ for table    │
│              │
│ Single column│
│ for tasks    │
└──────────────┘
```

---

## 🔒 PERMISSIONS

### Role-Based Access

```javascript
// Backend checks:
1. User must be logged in
2. User must have NhanVienID
3. For ListPage: Returns only employees where:
   - QuanLyNhanVien.NhanVienQuanLy = current user
   - LoaiQuanLy in ["KPI", "Giao_Viec"]

4. For DetailPage: Validates:
   - Current user manages target employee
   - OR user is admin (bypass)
```

### Admin Override

```javascript
if (user.PhanQuyen === "admin") {
  // Can view/edit all employees
  // Can access any cycle
}
```

---

## ⚡ PERFORMANCE

### Optimization Strategies

1. **Lazy Loading**

   - Cycles loaded once on mount
   - Employees loaded per cycle selection

2. **Memoization** (Future)

   - Cache employee stats per cycle
   - Invalidate on assignment save

3. **Pagination** (Future)

   - If >50 employees, paginate table
   - Keep all on same page for now

4. **Debouncing** (Future)
   - Debounce cycle selector
   - Prevent multiple API calls

---

## 🐛 ERROR HANDLING

### Scenario Matrix

| Scenario               | Behavior                      |
| ---------------------- | ----------------------------- |
| No cycles in DB        | Empty dropdown + info message |
| No managed employees   | Empty table + warning alert   |
| API timeout            | Toast error + retry button    |
| Invalid chuKyId in URL | Ignore + show cycle selector  |
| Missing permissions    | 403 error + redirect to home  |

---

## 🎓 USER GUIDE SUMMARY

### Quick Start (3 Steps)

```
1. Menu → "📅 Phân công theo chu kỳ"
2. Chọn chu kỳ từ dropdown
3. Click [Gán] trên nhân viên cần phân công
```

### Advanced Features

- **Copy từ chu kỳ trước:** Dropdown in detail page
- **Điều chỉnh độ khó:** TextField với bước 0.5
- **Xóa nhiệm vụ:** Click icon [X] bên phải
- **Lưu hàng loạt:** Tất cả thay đổi lưu cùng lúc

---

## 📚 KEYBOARD SHORTCUTS (Future Enhancement)

```
Ctrl + S  → Save changes (detail page)
Escape    → Go back to list
Enter     → Confirm cycle selection
↑/↓       → Navigate table rows
Space     → Toggle task selection
```

---

**Visual Guide Version:** 1.0  
**Last Updated:** October 18, 2025
