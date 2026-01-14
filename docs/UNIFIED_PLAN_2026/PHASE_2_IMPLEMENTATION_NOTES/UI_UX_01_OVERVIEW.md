# Phase 2 UI/UX Documentation - Overview & Navigation

**Part 1 of 5**  
**Date:** 12/01/2026  
**Version:** 1.0

---

## 📱 Application Architecture Overview

### Navigation Structure (4-Tab + FAB)

```
┌────────────────────────────────────────────────────────┐
│                    App Header                          │
│  [Logo]  Quản Lý Công Việc         [🔔] [👤 Profile]  │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│                                                        │
│                  Main Content Area                     │
│          (Dashboard/List/Detail Pages)                 │
│                                                        │
│                                                        │
│                                                        │
│                                                        │
└────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────┐
│  [🏠 Trang chủ] [📝 Yêu cầu] [📋 Công việc] [🏆 KPI]  │ ← 4 tabs
│                                              [⊕ Menu]  │ ← FAB
└────────────────────────────────────────────────────────┘
```

---

## 🗺️ Screen Flow Map

```
┌─────────────────┐
│  🏠 Trang Chủ   │ ← Entry point (UnifiedDashboardPage)
│  (Unified)      │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────┐
    │         │          │         │
    ▼         ▼          ▼         ▼
┌────────┐ ┌──────┐ ┌────────┐ ┌──────┐
│CongViec│ │YeuCau│ │  KPI   │ │ Menu │
│Dash    │ │Dash  │ │ Dash   │ │Grid  │
└───┬────┘ └──┬───┘ └───┬────┘ └──┬───┘
    │         │         │         │
    ▼         ▼         ▼         ▼
┌─────────────────────────────────────┐
│     Detail Pages (Existing)         │
│ - MyTasksPage                       │
│ - AssignedTasksPage                 │
│ - YeuCauToiGuiPage, YeuCauXuLyPage  │
│ - TuDanhGiaKPIPage, DanhGiaKPIPage  │
│ - Settings, Reports, etc.           │
└─────────────────────────────────────┘
```

---

## 📊 Screen Inventory & Status

| Screen Name              | Type      | Status      | Effort | File Path                                                       |
| ------------------------ | --------- | ----------- | ------ | --------------------------------------------------------------- |
| **UnifiedDashboardPage** | Refactor  | ✅ Exists   | 2h     | `Dashboard/UnifiedDashboardPage.js`                             |
| **CongViecDashboard**    | New       | ❌ Create   | 8h     | `Dashboard/CongViecDashboardPage.js`                            |
| **YeuCauDashboard**      | New       | ❌ Create   | 3h     | `Dashboard/YeuCauDashboardPage.js`                              |
| **KPIDashboard**         | New       | ❌ Create   | 3h     | `Dashboard/KPIDashboardPage.js`                                 |
| **MenuGridPage**         | New       | ❌ Create   | 2h     | `Menu/MenuGridPage.js`                                          |
| **MobileBottomNav**      | Revise    | ✅ Exists   | 1h     | `components/MobileBottomNav.js`                                 |
| **SummaryCards**         | Extract   | ❌ Create   | 2h     | `components/SummaryCards/[CongViec\|YeuCau\|KPI]SummaryCard.js` |
| **FABMenuButton**        | New       | ❌ Create   | 1h     | `Menu/FABMenuButton.js`                                         |
| MyTasksPage              | Reference | ✅ Complete | 0h     | `CongViec/MyTasksPage.js`                                       |
| AssignedTasksPage        | Reference | ✅ Complete | 0h     | `CongViec/AssignedTasksPage.js`                                 |

**Total New Screens:** 4  
**Total Refactored:** 2  
**Total Effort:** 22h (frontend only)

---

## 🎨 Design System Consistency

### Color Palette (from existing MUI theme)

```javascript
// Module-specific colors
const MODULE_COLORS = {
  congViec: "primary", // Blue
  yeuCau: "warning", // Orange
  kpi: "success", // Green
  menu: "secondary", // Purple
};

// Status colors
const STATUS_COLORS = {
  urgent: "error", // Red
  pending: "warning", // Orange
  inProgress: "info", // Light blue
  completed: "success", // Green
};
```

### Layout Grid

```
Mobile (xs):  12 columns (single column)
Tablet (sm):  6 columns (2-column grid)
Desktop (md): 4 columns (3-column grid)
Desktop (lg): 3 columns (4-column grid)
```

### Spacing System

```
Stack spacing: 2-3 (16-24px)
Card padding: 2-3 (16-24px)
Grid spacing: 2 (16px)
Section margins: 3-4 (24-32px)
```

---

## 🔀 Navigation Paths

### Route Structure (All 8 Modules)

#### **Module 1: Work Management** (`/quanlycongviec`)

```
/quanlycongviec                      → UnifiedDashboardPage (Trang chủ)
├─ /cong-viec                        → CongViecDashboardPage (NEW)
│  ├─ /cong-viec-cua-toi            → MyTasksPage (existing)
│  ├─ /viec-toi-giao                → AssignedTasksPage (existing)
│  └─ /lich-su-hoan-thanh           → CompletedArchivePage (existing)
├─ /yeucau                           → YeuCauDashboardPage (NEW)
│  ├─ /yeucau-toi-gui               → YeuCauToiGuiPage (existing)
│  ├─ /yeucau-xu-ly                 → YeuCauXuLyPage (existing)
│  ├─ /yeucau-dieu-phoi             → YeuCauDieuPhoiPage (existing)
│  └─ /yeucau-quan-ly-khoa          → YeuCauQuanLyKhoaPage (existing)
├─ /kpi                              → KPIDashboardPage (NEW)
│  ├─ /xem                          → XemKPIPage (existing)
│  ├─ /tu-danh-gia                  → TuDanhGiaKPIPage (existing)
│  ├─ /danh-gia-nhan-vien           → DanhGiaKPIPage (existing)
│  ├─ /bao-cao                      → BaoCaoKPIPage (existing)
│  └─ /chu-ky                       → ChuKyDanhGiaList (existing)
├─ /nhiem-vu-thuong-quy             → NhiemVuThuongQuyList (existing)
├─ /giao-nhiemvu                    → CycleAssignmentListPage (existing)
├─ /quan-ly-nhan-vien               → QuanLyNhanVienPage (existing)
├─ /thong-bao                       → NotificationPage (existing)
├─ /cai-dat                         → SettingsPage (existing)
└─ /menu                            → MenuGridPage (NEW)
```

#### **Module 2: Medical Reporting** (Root paths)

```
/                                    → HomePage (Nội dung giao ban)
/baocao                              → BCKhoaPage (Báo cáo ngày)
/tongtruc                            → TongTrucPage (Tổng trực)
/danhsach                            → DanhSachSuCoPage (Danh sách sự cố)
/baocaosuco                          → BaoCaoSuCoPage (Báo cáo sự cố)
/dashboard-toan-vien                 → DashBoardPage (Multi-tab dashboard)
  └─ Tabs: BNNT, CSCL, ĐH, TC, BQBA, DICHVUTRUNG, etc.
```

#### **Module 3: Training Management** (`/nhanvien`, `/lopdaotaos`)

```
/nhanvien                            → NhanVienList (Danh sách cán bộ)
/nhanvien-deleted                    → Deleted staff list
/lopdaotaos                          → LopDaoTaoList (All courses)
├─ /DT01                            → Khóa đào tạo ngắn hạn
├─ /DT02                            → Hội nghị, hội thảo tại viện
├─ /DT08                            → Hội thảo ngoại viện
├─ /DT03                            → Soạn thảo quy trình chuyên môn
├─ /DT05                            → Giảng dạy y khoa
├─ /DT07                            → Đào tạo cấp CC tuyến trên
├─ /DT09                            → Hội chẩn ca bệnh
├─ /[BSCK1, BSCK2, ...]             → 30+ postgraduate courses
└─ /DT20                            → Đào tạo & Chỉ đạo tuyến
/dashboarddaotao                     → DashboardDaoTao (Training overview)
/dashboarddaotaotheokhoa             → Department training dashboard
/tonghopdaotao                       → Tổng hợp tín chỉ tích lũy
/tonghopsoluong                      → Báo cáo số lượng
/soluongtheokhoa                     → Cảnh báo theo khoa
```

#### **Module 4: Research & Science** (`/lopdaotaos/NCKH*`, `/doanvao`, `/tapsan`)

```
/lopdaotaos/NCKH06                   → Sinh hoạt khoa học
/lopdaotaos/NCKH01                   → Đề tài cấp cơ sở
/lopdaotaos/NCKH02                   → Báo quốc tế
/lopdaotaos/NCKH03                   → Báo trong nước
/lopdaotaos/NCKH07                   → Tập huấn/hội nghị/hội thảo
/doanvao                             → Đoàn vào (International cooperation)
/doanvao/members                     → Danh sách thành viên đoàn vào
/doanra                              → Đoàn ra
/doanra/members                      → Danh sách thành viên đoàn ra
/tapsan                              → Tập san TTT/YHTH
```

#### **Module 5: Scheduling** (`/lichtruc`)

```
/lichtruc                            → LichTrucPage (Lịch trực khoa)
```

#### **Module 6: System Configuration** (Admin only)

```
/usersable                           → Users management
/datafix/DonVi                       → Unit conversions
/datafix/VaiTro                      → Roles
/datafix/ChucDanh                    → Positions
/datafix/TrinhDoChuyenMon            → Professional qualifications
/datafix/NguonKinhPhi                → Funding sources
/datafix/HinhThucDaoTao              → Training methods
/admin/files                         → File management
/admin/notification-types            → Notification type config
/admin/notification-templates        → Notification template config
/khuyen-cao-khoa-bqba                → Department recommendations (admin)
```

#### **Module 7: Master Data** (Various paths)

```
/tinh                                → Provinces
/huyen                               → Districts
/xa                                  → Wards
/quocgia                             → Countries
/khoa                                → Departments
/nhomkhoas                           → Department groups
/loaichuyenmon                       → Specialization types
```

#### **Module 8: Notification & Settings** (User-specific)

```
/quanlycongviec/thong-bao            → NotificationPage
/quanlycongviec/cai-dat/thong-bao   → NotificationSettings
/quanlycongviec/ho-so                → User profile
```

### Bottom Nav Tab Mapping

| Tab Label | Icon | Path              | Target Screen             | Badge Source               |
| --------- | ---- | ----------------- | ------------------------- | -------------------------- |
| Trang chủ | 🏠   | `/quanlycongviec` | UnifiedDashboardPage      | None                       |
| Yêu cầu   | 📝   | `/yeucau`         | YeuCauDashboardPage (NEW) | `ticket.badgeCounts`       |
| Công việc | 📋   | `/cong-viec`      | CongViecDashboardPage     | Calculated (urgent tasks)  |
| KPI       | 🏆   | `/kpi`            | KPIDashboardPage (NEW)    | Calculated (pending count) |

**FAB Menu:** Navigates to `/menu` → MenuGridPage

---

## 🔄 User Journey Examples

### Journey 1: Employee checks their tasks

```
1. Open app → Land on Trang chủ (UnifiedDashboardPage)
   ↓
2. See "Công việc" card shows: 12 total, 5 urgent
   ↓
3. Tap "Công việc" card (or bottom nav)
   ↓
4. Navigate to CongViecDashboardPage
   ↓
5. See StatusGrid breakdown: Chờ nhận (3), Đang làm (7), Chờ duyệt (2)
   ↓
6. Tap "Đang làm" card
   ↓
7. Navigate to MyTasksPage with filter: TrangThai=DANG_THUC_HIEN
   ↓
8. View task list, select a task
   ↓
9. Navigate to CongViecDetailPage
```

### Journey 2: Manager reviews team KPI

```
1. Open app → Land on Trang chủ
   ↓
2. Tap KPI tab on bottom nav
   ↓
3. Navigate to KPIDashboardPage (Manager view)
   ↓
4. See "Nhóm tôi quản lý" section: 5 người
   ↓
5. Tap "Xem tất cả" → Navigate to DanhGiaKPIPage
   ↓
6. Select employee → View evaluation details
```

### Journey 3: Access advanced tools

```
1. Open app → Any screen
   ↓
2. Tap FAB button (⊕) on bottom nav
   ↓
3. MenuGridPage drawer opens
   ↓
4. Tap "🌳 Tree View"
   ↓
5. Navigate to TreeViewPage
```

---

## 📱 Responsive Behavior

### Mobile (< 600px)

- Bottom nav: Always visible (sticky)
- Cards: Full width (12 columns)
- StatusGrid: 2 columns
- FAB: Fixed bottom-right

### Tablet (600-960px)

- Bottom nav: Visible on work pages
- Cards: Half width (6 columns)
- StatusGrid: 4 columns
- FAB: Contextual (hide on scroll)

### Desktop (> 960px)

- Bottom nav: Hidden (use sidebar)
- Cards: Third width (4 columns)
- StatusGrid: 4 columns (2 rows)
- FAB: Optional (desktop has full menu)

---

## 🎯 Common UI Patterns

### Pattern 1: Summary Card → Detail Page

```
┌─────────────────────┐
│  📋 Module Name     │
│  ─────────────────  │
│  Total: 12          │ ← Tap card
│  Urgent: 5          │
│  [Xem chi tiết →]   │
└─────────────────────┘
         ↓
┌─────────────────────┐
│  Module Dashboard   │ ← Shows breakdown
│  [StatusGrid 8 cards]│
└─────────────────────┘
         ↓
┌─────────────────────┐
│  List Page          │ ← Filtered list
│  [Table/Cards]      │
└─────────────────────┘
```

### Pattern 2: StatusGrid Navigation

```
┌──────────┬──────────┬──────────┬──────────┐
│ Status 1 │ Status 2 │ Status 3 │ Status 4 │
│  Count   │  Count   │  Count   │  Count   │
└──────────┴──────────┴──────────┴──────────┘
    ↓ Tap any card
┌─────────────────────────────────────────────┐
│  MyTasksPage with URL params:               │
│  ?status=<selected_status>                  │
└─────────────────────────────────────────────┘
```

### Pattern 3: Role-based Sections

```javascript
// Conditional rendering based on PhanQuyen
{
  user.PhanQuyen === "manager" && (
    <Section title="Nhóm tôi quản lý">{/* Manager-only content */}</Section>
  );
}

{
  user.PhanQuyen === "admin" && (
    <Section title="Quản lý khoa">{/* Admin-only content */}</Section>
  );
}
```

---

## 🔧 Technical Implementation Notes

### State Management

```javascript
// Redux slice structure for each module
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    summary: { congViec: {}, yeuCau: {}, kpi: {} },
    isLoading: false,
    error: null,
    lastUpdated: null,
  },
  // ...reducers, thunks
});
```

### API Call Pattern

```javascript
// On page mount
useEffect(() => {
  if (nhanVienId) {
    dispatch(getDashboardSummary(nhanVienId));
  }
}, [dispatch, nhanVienId]);

// On manual refresh
const handleRefresh = () => {
  dispatch(refreshDashboard(nhanVienId));
};
```

### Navigation Pattern

```javascript
// From summary card
const handleCardClick = () => {
  navigate("/quanlycongviec/cong-viec");
};

// From StatusGrid card
const handleStatusClick = (status) => {
  navigate(`/quanlycongviec/cong-viec-cua-toi?status=${status}`);
};
```

---

## 📚 Related Documentation

- **Part 2:** [Trang Chủ (UnifiedDashboardPage)](./UI_UX_02_TRANG_CHU.md)
- **Part 3:** [Công Việc Dashboard](./UI_UX_03_CONGVIEC_DASHBOARD.md)
- **Part 4:** [Yêu Cầu & KPI Dashboards](./UI_UX_04_YEUCAU_KPI_DASHBOARDS.md)
- **Part 5:** [Components & Navigation](./UI_UX_05_COMPONENTS_NAV.md)

---

**Next:** [Part 2 - Trang Chủ UI/UX →](./UI_UX_02_TRANG_CHU.md)
