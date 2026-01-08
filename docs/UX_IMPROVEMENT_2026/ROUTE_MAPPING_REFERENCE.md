# 🗺️ Route Mapping Reference

**Mục đích:** Bảng tra cứu nhanh mapping routes CŨ → MỚI

---

## 📋 Bảng Mapping Tổng Hợp

| #                       | Route CŨ                                   | Route MỚI                                | Component                 | Status    |
| ----------------------- | ------------------------------------------ | ---------------------------------------- | ------------------------- | --------- |
| **DASHBOARD**           |
| 1                       | (không có)                                 | `/quanlycongviec/dashboard`              | UnifiedDashboardPage      | 🆕 NEW    |
| **CÔNG VIỆC**           |
| 2                       | `/quan-ly-cong-viec/nhan-vien/:id`         | `/quanlycongviec/congviec/list/:id`      | CongViecListPage          | 🔧 RENAME |
| 3                       | `/congviec/:id`                            | `/quanlycongviec/congviec/:id`           | CongViecDetailPage        | 🔧 MOVE   |
| 4                       | (không có)                                 | `/quanlycongviec/congviec/dashboard`     | CongViecDashboardPage     | 🆕 NEW    |
| **NHÓM VIỆC**           |
| 5                       | `/quanlycongviec/nhomviec-user`            | `/quanlycongviec/nhomviec-user`          | Unchanged                 | ✅ OK     |
| **NHIỆM VỤ THƯỜNG QUY** |
| 6                       | `/quanlycongviec/nhiemvu-thuongquy`        | `/quanlycongviec/nhiemvu-thuongquy`      | Unchanged                 | ✅ OK     |
| **GIAO NHIỆM VỤ**       |
| 7                       | `/quanlycongviec/giao-nhiem-vu-chu-ky`     | `/quanlycongviec/giao-nhiem-vu`          | CycleAssignmentListPage   | 🔧 RENAME |
| 8                       | `/quanlycongviec/giao-nhiem-vu-chu-ky/:id` | `/quanlycongviec/giao-nhiem-vu/:id`      | CycleAssignmentDetailPage | 🔧 RENAME |
| **KPI**                 |
| 9                       | `/quanlycongviec/kpi/danh-gia-nhan-vien`   | `/quanlycongviec/kpi/danh-gia-nhan-vien` | Unchanged                 | ✅ OK     |
| 10                      | `/quanlycongviec/kpi/tu-danh-gia`          | `/quanlycongviec/kpi/tu-danh-gia`        | Unchanged                 | ✅ OK     |
| 11                      | `/quanlycongviec/kpi/xem`                  | `/quanlycongviec/kpi/xem`                | Unchanged                 | ✅ OK     |
| 12                      | `/quanlycongviec/kpi/bao-cao`              | `/quanlycongviec/kpi/bao-cao`            | Unchanged                 | ✅ OK     |
| 13                      | `/quanlycongviec/kpi/chu-ky`               | `/quanlycongviec/kpi/chu-ky`             | Unchanged                 | ✅ OK     |
| 14                      | (không có)                                 | `/quanlycongviec/kpi/dashboard`          | KPIDashboardPage          | 🆕 NEW    |
| **YÊU CẦU / TICKET**    |
| 15                      | `/yeu-cau`                                 | `/quanlycongviec/yeucau`                 | YeuCauPage                | 🔧 MOVE   |
| 16                      | `/yeu-cau/toi-gui`                         | `/quanlycongviec/yeucau/toi-gui`         | YeuCauToiGuiPage          | 🔧 MOVE   |
| 17                      | `/yeu-cau/xu-ly`                           | `/quanlycongviec/yeucau/xu-ly`           | YeuCauXuLyPage            | 🔧 MOVE   |
| 18                      | `/yeu-cau/dieu-phoi`                       | `/quanlycongviec/yeucau/dieu-phoi`       | YeuCauDieuPhoiPage        | 🔧 MOVE   |
| 19                      | `/yeu-cau/quan-ly-khoa`                    | `/quanlycongviec/yeucau/quan-ly-khoa`    | YeuCauQuanLyKhoaPage      | 🔧 MOVE   |
| 20                      | `/yeu-cau/:id`                             | `/quanlycongviec/yeucau/:id`             | YeuCauDetailPage          | 🔧 MOVE   |
| 21                      | (không có)                                 | `/quanlycongviec/yeucau/dashboard`       | TicketDashboardPage       | 🆕 NEW    |
| **QUẢN LÝ NHÂN VIÊN**   |
| 22                      | `/workmanagement/nhanvien/:id/quanly`      | `/quanlycongviec/nhanvien/:id/quanly`    | QuanLyNhanVienPage        | 🔧 MOVE   |

---

## 🔍 Chi Tiết Từng Nhóm

### 1. Dashboard Routes (NEW)

```javascript
// ✅ Unified Dashboard (role-agnostic)
'/quanlycongviec/dashboard'
→ Shows: CongViec summary + KPI summary + Ticket summary

// ✅ Module-specific Dashboards
'/quanlycongviec/congviec/dashboard'   → CongViec module only
'/quanlycongviec/kpi/dashboard'        → KPI module only
'/quanlycongviec/yeucau/dashboard'     → Ticket module only
```

---

### 2. Công Việc (Task) Routes

#### BEFORE:

```javascript
// ❌ Không nhất quán - 2 patterns
"/quan-ly-cong-viec/nhan-vien/:id"; // Có dấu gạch nối trong prefix
"/congviec/:id"; // Tách biệt, không có prefix
```

#### AFTER:

```javascript
// ✅ Nhất quán - 1 prefix duy nhất
"/quanlycongviec/congviec/list/:nhanVienId"; // List view with nested tabs
"/quanlycongviec/congviec/:id"; // Detail view
"/quanlycongviec/congviec/dashboard"; // Dashboard view (NEW)
```

**Files cần update:**

```javascript
// Navigation calls (10-12 files)
src / features / QuanLyCongViec / CongViec / CongViecByNhanVienPage.js;
src / features / QuanLyCongViec / CongViec / CongViecTable.js;
src / features / QuanLyCongViec / CongViec / CongViecDetailDialog.js;
src / features / QuanLyCongViec / CongViec / CongViecFormDialog.js;
src / features / QuanLyCongViec / TreeView / CongViecTreeDialog.js;
// ... và các files khác có navigate() hoặc <Link to="/congviec/...">
```

---

### 3. Giao Nhiệm Vụ Routes

#### BEFORE:

```javascript
"/quanlycongviec/giao-nhiem-vu-chu-ky"; // List
"/quanlycongviec/giao-nhiem-vu-chu-ky/:id"; // Detail
```

#### AFTER:

```javascript
"/quanlycongviec/giao-nhiem-vu"; // List (rút gọn)
"/quanlycongviec/giao-nhiem-vu/:id"; // Detail (rút gọn)
```

**Lý do thay đổi:** Rút gọn `-chu-ky` vì redundant (context đã rõ)

**Files cần update:**

```javascript
src / features / QuanLyCongViec / GiaoNhiemVu / CycleAssignmentListPage.js;
src / features / QuanLyCongViec / GiaoNhiemVu / CycleAssignmentDetailPage.js;
// Menu items
// Breadcrumb components
```

---

### 4. Yêu Cầu (Ticket) Routes - MAJOR CHANGE

#### BEFORE:

```javascript
// ❌ Tách biệt hoàn toàn, không dưới /quanlycongviec
"/yeu-cau";
"/yeu-cau/toi-gui";
"/yeu-cau/xu-ly";
"/yeu-cau/dieu-phoi";
"/yeu-cau/quan-ly-khoa";
"/yeu-cau/:id";
```

#### AFTER:

```javascript
// ✅ Tất cả dưới /quanlycongviec/yeucau
"/quanlycongviec/yeucau"; // Main page
"/quanlycongviec/yeucau/toi-gui"; // Sent by me
"/quanlycongviec/yeucau/xu-ly"; // Assigned to me
"/quanlycongviec/yeucau/dieu-phoi"; // Coordinator view
"/quanlycongviec/yeucau/quan-ly-khoa"; // Department manager
"/quanlycongviec/yeucau/:id"; // Detail
"/quanlycongviec/yeucau/dashboard"; // Dashboard (NEW)
```

**Files cần update (nhiều nhất):**

```javascript
// Page components (6 files)
src / features / QuanLyCongViec / Ticket / YeuCauPage.js;
src / features / QuanLyCongViec / Ticket / YeuCauToiGuiPage.js;
src / features / QuanLyCongViec / Ticket / YeuCauXuLyPage.js;
src / features / QuanLyCongViec / Ticket / YeuCauDieuPhoiPage.js;
src / features / QuanLyCongViec / Ticket / YeuCauQuanLyKhoaPage.js;
src / features / QuanLyCongViec / Ticket / YeuCauDetailPage.js;

// List components (navigation calls)
src / features / QuanLyCongViec / Ticket / components / YeuCauList.js;
src / features / QuanLyCongViec / Ticket / components / YeuCauCard.js;
src / features / QuanLyCongViec / Ticket / components / YeuCauFormDialog.js;

// Hook với config (quan trọng!)
src / features / QuanLyCongViec / Ticket / hooks / useYeuCauTabs.js;
src / features / QuanLyCongViec / Ticket / config / yeuCauTabConfig.js;
```

---

### 5. KPI Routes (Minimal Change)

#### BEFORE & AFTER (giống nhau):

```javascript
// ✅ Đã đúng prefix từ đầu
"/quanlycongviec/kpi/danh-gia-nhan-vien";
"/quanlycongviec/kpi/tu-danh-gia";
"/quanlycongviec/kpi/xem";
"/quanlycongviec/kpi/bao-cao";
"/quanlycongviec/kpi/chu-ky";
```

#### NEW:

```javascript
"/quanlycongviec/kpi/dashboard"; // Dashboard (NEW)
```

**Files cần update (ít):**

- Chỉ thêm dashboard page, không update navigation cũ

---

## 🔧 Implementation Checklist

### Step 1: Route Definitions (routes/index.js)

```javascript
// ❌ XÓA các routes cũ
- <Route path="/quan-ly-cong-viec/nhan-vien/:id" ... />
- <Route path="/congviec/:id" ... />
- <Route path="/yeu-cau/*" ... />

// ✅ THÊM routes mới
+ <Route path="/quanlycongviec/dashboard" element={<UnifiedDashboardPage />} />
+ <Route path="/quanlycongviec/congviec/dashboard" element={<CongViecDashboardPage />} />
+ <Route path="/quanlycongviec/congviec/list/:id" element={<CongViecListPage />} />
+ <Route path="/quanlycongviec/congviec/:id" element={<CongViecDetailPage />} />
+ <Route path="/quanlycongviec/giao-nhiem-vu" element={<CycleAssignmentListPage />} />
+ <Route path="/quanlycongviec/giao-nhiem-vu/:id" element={<CycleAssignmentDetailPage />} />
+ <Route path="/quanlycongviec/yeucau/*" element={<YeuCauRoutes />} />
```

### Step 2: Navigation Calls (tìm và thay thế)

**Search pattern:**

```bash
# Terminal commands để tìm
grep -r "quan-ly-cong-viec" src/features/QuanLyCongViec/
grep -r '"/congviec/' src/features/QuanLyCongViec/
grep -r '"/yeu-cau' src/features/QuanLyCongViec/
grep -r "navigate.*nhan-vien" src/features/QuanLyCongViec/
```

**Replace pattern:**

```javascript
// ❌ BEFORE
navigate(`/quan-ly-cong-viec/nhan-vien/${nhanVienId}`);
navigate(`/congviec/${congViecId}`);
navigate("/yeu-cau/toi-gui");

// ✅ AFTER
navigate(`/quanlycongviec/congviec/list/${nhanVienId}`);
navigate(`/quanlycongviec/congviec/${congViecId}`);
navigate("/quanlycongviec/yeucau/toi-gui");
```

### Step 3: Link Components

```javascript
// ❌ BEFORE
<Link to={`/congviec/${id}`}>Xem chi tiết</Link>
<Link to="/yeu-cau/toi-gui">Yêu cầu tôi gửi</Link>

// ✅ AFTER
<Link to={`/quanlycongviec/congviec/${id}`}>Xem chi tiết</Link>
<Link to="/quanlycongviec/yeucau/toi-gui">Yêu cầu tôi gửi</Link>
```

### Step 4: Menu Items

```javascript
// src/layout/MainLayout/Sidebar/MenuList/items/index.js
{
  id: 'congviec',
  title: 'Công việc',
  type: 'item',
  url: '/quanlycongviec/dashboard',  // ← Update to dashboard
  icon: icons.IconChecklist,
}
```

### Step 5: Breadcrumbs

```javascript
// Mỗi trang detail sẽ dùng WorkManagementBreadcrumb
<WorkManagementBreadcrumb
  items={[
    { label: "Dashboard", path: "/quanlycongviec/dashboard" },
    { label: "Công việc", path: "/quanlycongviec/congviec/list/:id" },
    { label: "#CV-123", path: null }, // Current page
  ]}
/>
```

---

## 📊 Impact Analysis

| Route Change Type          | Số lượng files | Effort  | Risk      |
| -------------------------- | -------------- | ------- | --------- |
| **Route definitions**      | 1 file         | 2h      | 🟢 Low    |
| **CongViec navigation**    | ~10 files      | 4h      | 🟡 Medium |
| **Ticket navigation**      | ~8 files       | 4h      | 🟡 Medium |
| **GiaoNhiemVu navigation** | ~2 files       | 1h      | 🟢 Low    |
| **Menu items**             | 2 files        | 1h      | 🟢 Low    |
| **Breadcrumbs**            | ~6 files       | 3h      | 🟢 Low    |
| **Tests**                  | ~10 files      | 3h      | 🟡 Medium |
| **TOTAL**                  | **~40 files**  | **18h** | 🟡 Medium |

---

## ✅ Validation Checklist

Sau khi update xong, test các scenarios này:

### Navigation từ Dashboard

- [ ] Click card "Công việc" → Navigate đúng sang list page
- [ ] Click card "KPI" → Navigate đúng sang KPI dashboard
- [ ] Click card "Ticket" → Navigate đúng sang ticket list

### Navigation trong module

- [ ] Từ list page click row → Navigate đúng sang detail
- [ ] Từ detail page click breadcrumb → Navigate về đúng
- [ ] Browser back/forward hoạt động đúng

### Deep links

- [ ] Copy URL detail page → Paste vào tab mới → Load đúng
- [ ] Bookmark một trang → Đóng browser → Mở lại → Load đúng

### Menu items

- [ ] Click menu "Công việc" → Navigate đúng
- [ ] Active state highlight đúng menu item

### Error cases

- [ ] URL không tồn tại → 404 page
- [ ] URL thiếu params → Redirect hoặc error graceful

---

**Next:** Xem [01_PHASE_1_NAVIGATION.md](./01_PHASE_1_NAVIGATION.md) để bắt đầu implementation
