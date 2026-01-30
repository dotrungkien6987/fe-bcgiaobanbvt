# 📋 PHÂN TÍCH GAP & KẾ HOẠCH TRIỂN KHAI CHI TIẾT

## QUY TRÌNH ISO - SO SÁNH DESIGN vs IMPLEMENTATION

**Version:** 1.0  
**Ngày tạo:** 28/01/2026  
**Mục đích:** Đánh giá tổng thể những gì còn thiếu so với UI_UX_DESIGN.md

---

## 📊 TỔNG QUAN

| Hạng mục          | Đã triển khai  | Còn thiếu                    | % Hoàn thành |
| ----------------- | -------------- | ---------------------------- | ------------ |
| Core CRUD         | ✅ Hoàn chỉnh  | -                            | 100%         |
| Navigation & Menu | ⚠️ Một phần    | Breadcrumb                   | 70%          |
| Dashboard         | ⚠️ Một phần    | Chart, Recent Docs, Gradient | 50%          |
| List Page         | ⚠️ Một phần    | Filter Khoa, Empty State     | 70%          |
| Create/Edit Page  | ✅ Tốt         | -                            | 90%          |
| Detail Page       | ⚠️ Một phần    | Create Version Dialog        | 70%          |
| Responsive        | ❌ Thiếu nhiều | Mobile layout, FAB           | 30%          |
| Error Handling    | ⚠️ Cơ bản      | Skeleton, Retry UI           | 40%          |
| Icons             | ⚠️ Hỗn hợp     | Migration iconsax-react      | 50%          |

**Tổng đánh giá: ~65% hoàn thành so với design spec**

---

## 🔴 PHẦN 1: CRITICAL MISSING (Cần ưu tiên cao)

### 1.1. Tạo Phiên Bản Mới với Dialog (Design Section 3.2)

**Thiết kế:**

```
┌─────────────────────────────┐
│ DIALOG: Tạo phiên bản mới   │
│ ─────────────────────────── │
│ Mã quy trình: QT-001        │
│ Phiên bản mới: [v2.0]       │
│                             │
│ ☑️ Copy biểu mẫu từ v1.0    │
│                             │
│ [Hủy] [Tạo]                 │
└─────────────────────────────┘
```

**Hiện trạng:** KHÔNG CÓ. Chỉ có copy files trong Edit page, không có flow tạo version mới từ Detail page.

**Cần làm:**

- [ ] Tạo component `CreateVersionDialog.js`
- [ ] Thêm button "➕ Tạo phiên bản mới" vào `QuyTrinhISODetailPage.js`
- [ ] Backend: Có thể sử dụng `POST /quytrinhiso` + `POST /:id/copy-files-from/:sourceId` (đã có API)
- [ ] Flow: Create new → optional copy files → redirect to edit

**Files ảnh hưởng:**

- `QuyTrinhISODetailPage.js` - thêm button và dialog
- `quyTrinhISOSlice.js` - có thể cần thêm action `createNewVersion`

---

### 1.2. Recent Documents Widget (Design Section 4.1)

**Thiết kế:**

```
┌─────────────────────────┐
│  📋 Tài Liệu Gần Đây    │
│  ═══════════════════    │
│                         │
│  • QT-042 v1.2         │
│    Cập nhật 2 giờ trước │
│                         │
│  • QT-038 v2.0         │
│    Thêm mới hôm qua     │
│                         │
└─────────────────────────┘
```

**Hiện trạng:** KHÔNG CÓ. Dashboard chỉ hiển thị stat cards và thống kê theo khoa.

**Cần làm:**

- [ ] Backend: Thêm field `recentDocuments` vào `/statistics` response
- [ ] Frontend: Thêm component `RecentDocsList` vào Dashboard
- [ ] Hiển thị 5-10 documents mới nhất với relative time (dayjs)

**Files ảnh hưởng:**

- `giaobanbv-be/controllers/quyTrinhISO.controller.js` - getStatistics
- `QuyTrinhISODashboard.js` - thêm section

---

### 1.3. Bar Chart Visualization (Design Section 4.1)

**Thiết kế:**

```
│  Khoa Nội           12 ████████████
│  Khoa Ngoại         8  ████████
│  Khoa HSTC          6  ██████
│  Khoa Xét nghiệm    5  █████
│  Khác              11  ███████████
```

**Hiện trạng:** Chỉ hiển thị cards với số liệu, KHÔNG có bar chart.

**Cần làm:**

- [ ] Thêm horizontal BarChart từ `@mui/x-charts` hoặc `react-apexcharts` (đã có trong package.json)
- [ ] Hoặc sử dụng custom LinearProgress bars như design

**Files ảnh hưởng:**

- `QuyTrinhISODashboard.js` - thay đổi section "Thống Kê Theo Khoa Xây Dựng"

---

### 1.4. Department Filter Dropdown (Design Section 2.4)

**Thiết kế:**

```
┌─────────────────────────────────────────────────────────┐
│  [🔍 Tìm kiếm...]  [Khoa ▼]  [Sắp xếp ▼]  [+ Thêm mới] │
└─────────────────────────────────────────────────────────┘
```

**Hiện trạng:** Chỉ có search input, KHÔNG có filter dropdown cho Khoa.

**Cần làm:**

- [ ] Thêm `Autocomplete` hoặc `Select` cho filter `KhoaXayDungID`
- [ ] Backend API đã hỗ trợ `?KhoaXayDungID=xxx` (line 36-38 controller)
- [ ] Update URL search params khi filter thay đổi

**Files ảnh hưởng:**

- `QuyTrinhISOPage.js` - thêm filter component
- Cần fetch danh sách Khoa từ `getAllKhoa`

---

### 1.5. Breadcrumb Navigation (Design Section 2.2)

**Thiết kế:**

```
Dashboard:     Trang chủ → Quản Lý Chất Lượng → Tài Liệu ISO → Dashboard
List:          Trang chủ → Quản Lý Chất Lượng → Tài Liệu ISO → Danh Sách
Detail:        ... → Danh Sách → [Tên Quy Trình]
```

**Hiện trạng:** KHÔNG CÓ breadcrumb trong bất kỳ page nào.

**Cần làm:**

- [ ] Sử dụng MUI `Breadcrumbs` component
- [ ] Kiểm tra xem project có sẵn Breadcrumb wrapper component không
- [ ] Thêm vào tất cả 5 pages

**Files ảnh hưởng:**

- `QuyTrinhISOPage.js`
- `QuyTrinhISODashboard.js`
- `QuyTrinhISOCreatePage.js`
- `QuyTrinhISOEditPage.js`
- `QuyTrinhISODetailPage.js`

---

### 1.6. Styled Empty State (Design Section 7.2)

**Thiết kế:**

```
┌─────────────────────────────┐
│                             │
│      📄                     │
│      Chưa có quy trình nào  │
│                             │
│      [+ Thêm mới]           │
│                             │
└─────────────────────────────┘
```

**Hiện trạng:** Table trống chỉ hiển thị "No data", không có styled illustration.

**Cần làm:**

- [ ] Tạo component `EmptyState.js` với icon/illustration
- [ ] Hiển thị khi `items.length === 0`
- [ ] Có CTA button cho QLCL users

**Files ảnh hưởng:**

- `QuyTrinhISOPage.js`

---

## 🟡 PHẦN 2: PARTIAL IMPLEMENTATION (Cần hoàn thiện)

### 2.1. iconsax-react Migration

**Hiện trạng:** Sử dụng MUI icons trong pages, iconsax trong menu.

| Location    | Hiện tại                       | Cần đổi thành                       |
| ----------- | ------------------------------ | ----------------------------------- |
| Dashboard   | `PictureAsPdf`, `Description`  | `DocumentDownload`, `DocumentText1` |
| List Page   | `Edit`, `Delete`, `Visibility` | `Edit`, `Trash`, `Eye`              |
| Detail Page | `PictureAsPdf`, `Download`     | `DocumentDownload`, `ArrowDown`     |

**Package đã có:** `iconsax-react: ^0.0.8` trong package.json ✅

---

### 2.2. Dashboard Statistics Field Mapping

**Backend response:**

```javascript
{
  summary: { totalDocuments, uniqueProcesses, recentDocs },
  byDepartment: [{ _id, TenKhoa, count }]
}
```

**Frontend expecting:**

```javascript
(stats.total, stats.active, stats.totalPDF, stats.totalWord, stats.byKhoa);
```

**Cần làm:**

- [ ] Backend: Thêm count PDF/Word files vào statistics
- [ ] Frontend: Map đúng field names

---

## 🟢 PHẦN 3: UI/UX POLISH

### 3.1. Design System Colors

| Element        | Design Spec        | Hiện tại      |
| -------------- | ------------------ | ------------- |
| PDF chip/icon  | `#2e7d32` (Green)  | MUI "success" |
| Word chip/icon | `#ed6c02` (Orange) | MUI "warning" |
| Primary        | `#1976d2` (Blue)   | MUI default   |

**Đánh giá:** MUI semantic colors khá tương đồng, có thể giữ nguyên hoặc customize theme.

### 3.2. Gradient Stat Cards (Design Section 4.1)

**Design:**

```css
background: linear-gradient(135deg, ${color}.lighter 0%, ${color}.light 100%);
```

**Hiện trạng:** Đã implement gradient trong StatCard component ✅

### 3.3. PDF Viewer Mobile Fullscreen

**Design:** `fullScreen={isMobile}` on Dialog

**Cần làm:**

- [ ] Sử dụng `useMediaQuery` để detect mobile
- [ ] Thêm prop `fullScreen` có điều kiện

---

## 📱 PHẦN 4: RESPONSIVE DESIGN

### 4.1. Mobile Card Layout cho List Page (Design Section 6.3)

**Design:**

```
┌─────────────────────┐
│  📁 Quy Trình ISO   │
│  ═══════════════════│
│  🔍 [Tìm kiếm...]   │
│  ┌─────────────────┐│
│  │ QT-001          ││
│  │ Quy trình tiếp..││
│  │ v2.0 | Khoa Nội ││
│  │ 📄 📑3   [⋮]    ││
│  └─────────────────┘│
│  [+ Thêm mới]  FAB  │
└─────────────────────┘
```

**Hiện trạng:** Table layout cho tất cả breakpoints.

**Cần làm:**

- [ ] Thêm mobile view với Cards + FAB
- [ ] useMediaQuery để switch layouts
- [ ] FAB cho nút "Thêm mới" (QLCL only)

### 4.2. Form Responsive Grid

**Design:** Single column xs-sm, two columns md+

**Hiện trạng:** Có basic Grid nhưng chưa optimize theo design spec.

---

## ⚠️ PHẦN 5: ERROR HANDLING

### 5.1. Skeleton Loaders

**Hiện trạng:** Text "Đang tải..."

**Cần làm:**

- [ ] MUI Skeleton components cho table rows
- [ ] Card skeleton cho Dashboard
- [ ] Form skeleton cho Edit page

### 5.2. Permission Denied Page

**Hiện trạng:** Backend trả 403, frontend hiển thị toast error.

**Cần làm:**

- [ ] Tạo `PermissionDenied.js` component
- [ ] Hiển thị 🔒 icon + message + "Quay lại" button

### 5.3. Network Error Retry

**Hiện trạng:** Toast notification only.

**Cần làm:**

- [ ] Error component với "Thử lại" button
- [ ] Retry logic cho API calls

---

## 🔧 PHẦN 6: BACKEND API GAPS

### 6.1. Statistics API Enhancement

**Hiện tại `getStatistics` trả về:**

```javascript
{
  summary: { totalDocuments, uniqueProcesses, recentDocs },
  byDepartment: [{ _id, TenKhoa, count }]
}
```

**Cần bổ sung:**

```javascript
{
  summary: {
    totalDocuments,     // ✅ Có
    uniqueProcesses,    // ✅ Có
    recentDocs,         // ✅ Có (30 ngày)
    totalPDFFiles,      // ❌ Thiếu
    totalWordFiles,     // ❌ Thiếu
  },
  byDepartment: [...],  // ✅ Có
  recentDocuments: [    // ❌ Thiếu - cần cho Recent Docs widget
    { _id, TenQuyTrinh, MaQuyTrinh, PhienBan, updatedAt }
  ]
}
```

**Cần update:**

- `giaobanbv-be/controllers/quyTrinhISO.controller.js` → `getStatistics`

### 6.2. Create Version API (Optional Enhancement)

**Hiện tại:** Phải gọi 2 API riêng biệt:

1. `POST /quytrinhiso` (tạo mới)
2. `POST /:newId/copy-files-from/:sourceId` (copy files)

**Có thể tạo convenience endpoint:**

```javascript
POST /quytrinhiso/:sourceId/create-version
Body: { PhienBan: "2.0", copyFiles: true }
```

**Đánh giá:** Optional - flow hiện tại vẫn hoạt động, chỉ cần frontend orchestrate 2 calls.

---

## 📋 CHECKLIST TRIỂN KHAI

### Phase 1: Critical Features (2-3 ngày)

- [ ] 1.1 Create Version Dialog trong Detail Page
- [ ] 1.2 Recent Documents Widget
- [ ] 1.3 Bar Chart thay Cards
- [ ] 1.4 Department Filter Dropdown
- [ ] 1.5 Breadcrumb Navigation (5 pages)
- [ ] 1.6 Empty State Component

### Phase 2: Partial Fixes (0.5 ngày)

- [ ] 2.1 Migrate icons sang iconsax-react
- [ ] 2.2 Fix Dashboard stats field mapping

### Phase 3: UI/UX Polish (1 ngày)

- [ ] 3.1 Apply exact design colors (optional)
- [ ] 3.2 PDF Viewer mobile fullscreen
- [ ] 3.3 Table header icons

### Phase 4: Responsive (2 ngày)

- [ ] 4.1 Mobile card layout cho List Page
- [ ] 4.2 FAB button cho mobile
- [ ] 4.3 Form grid optimization

### Phase 5: Error Handling (1 ngày)

- [ ] 5.1 Skeleton loaders
- [ ] 5.2 Permission denied page
- [ ] 5.3 Network error retry UI

### Phase 6: Backend Updates (0.5 ngày)

- [ ] 6.1 Enhance statistics API với file counts + recent docs

---

## 📈 ƯỚC TÍNH THỜI GIAN

| Phase    | Mô tả             | Thời gian        |
| -------- | ----------------- | ---------------- |
| Phase 1  | Critical Features | 2-3 ngày         |
| Phase 2  | Partial Fixes     | 0.5 ngày         |
| Phase 3  | UI/UX Polish      | 1 ngày           |
| Phase 4  | Responsive        | 2 ngày           |
| Phase 5  | Error Handling    | 1 ngày           |
| Phase 6  | Backend           | 0.5 ngày         |
| **Tổng** |                   | **6.5-7.5 ngày** |

---

## 🎯 KHUYẾN NGHỊ

1. **Ưu tiên Phase 1** vì ảnh hưởng trải nghiệm người dùng nhiều nhất
2. **Phase 4 (Responsive)** có thể defer nếu users chủ yếu dùng desktop
3. **iconsax-react** đã có package, migration đơn giản chỉ đổi import

---

**Bạn muốn tôi bắt đầu triển khai phase nào trước?**
