# 🗺️ PHASE 1: Navigation & Breadcrumb

**Timeline:** Ngày 1-3 (24 giờ)  
**Priority:** 🔴 CRITICAL - BLOCK tất cả phases khác  
**Status:** 📋 Planning

> **📍 RESUME POINT:** Nếu bắt đầu hội thoại mới, đọc [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) để xem checkpoint hiện tại

---

## 🎯 Objectives

1. ✅ Chuẩn hóa tất cả routes về prefix `/quanlycongviec/`
2. ✅ Update tất cả navigation calls trong code (40+ files)
3. ✅ Tạo component `WorkManagementBreadcrumb` reusable
4. ✅ Update menu items để point to unified routes

---

## 📊 Detailed Timeline

```
Day 1: Route Definitions + CongViec Module (8h)
├─ 2h: Planning & route mapping
├─ 2h: Update routes/index.js
└─ 4h: Update CongViec navigation calls

Day 2: Ticket + Other Modules (8h)
├─ 4h: Update Ticket module (nhiều files nhất)
├─ 1h: Update GiaoNhiemVu module
├─ 1h: Update menu items
├─ 1h: Create navigationHelper
└─ 1h: Redux thunks

Day 3: Breadcrumb + Testing (8h)
├─ 3h: Create WorkManagementBreadcrumb component
├─ 4h: Comprehensive testing
└─ 1h: Documentation
```

---

## 🔧 Implementation Details

### 1. Route Definitions (2h)

#### File: `src/routes/index.js`

**Current structure (problematic):**

```javascript
// ❌ Pattern 1: /quanlycongviec/
<Route path="/quanlycongviec/kpi/*" element={<KPIRoutes />} />
<Route path="/quanlycongviec/nhiemvu-thuongquy" element={...} />

// ❌ Pattern 2: /quan-ly-cong-viec/ (với gạch nối)
<Route path="/quan-ly-cong-viec/nhan-vien/:id" element={...} />

// ❌ Pattern 3: Tách biệt /congviec
<Route path="/congviec/:id" element={<CongViecDetailPage />} />

// ❌ Pattern 4: Tách biệt /yeu-cau
<Route path="/yeu-cau/*" element={<YeuCauRoutes />} />
```

**Target structure (unified):**

```javascript
// ✅ TẤT CẢ dưới /quanlycongviec/*

<Route path="/quanlycongviec">
  {/* Dashboard Routes */}
  <Route path="dashboard" element={<UnifiedDashboardPage />} />

  {/* CongViec Routes */}
  <Route path="congviec">
    <Route path="dashboard" element={<CongViecDashboardPage />} />
    <Route path="list/:nhanVienId" element={<CongViecListPage />} />
    <Route path=":id" element={<CongViecDetailPage />} />
  </Route>

  {/* GiaoNhiemVu Routes */}
  <Route path="giao-nhiem-vu">
    <Route index element={<CycleAssignmentListPage />} />
    <Route path=":id" element={<CycleAssignmentDetailPage />} />
  </Route>

  {/* KPI Routes (existing, no change) */}
  <Route path="kpi">
    <Route path="dashboard" element={<KPIDashboardPage />} />
    <Route path="danh-gia-nhan-vien" element={<DanhGiaNhanVienPage />} />
    <Route path="tu-danh-gia" element={<TuDanhGiaPage />} />
    {/* ... existing KPI routes */}
  </Route>

  {/* Ticket/YeuCau Routes (moved from /yeu-cau) */}
  <Route path="yeucau">
    <Route path="dashboard" element={<TicketDashboardPage />} />
    <Route index element={<YeuCauPage />} />
    <Route path="toi-gui" element={<YeuCauToiGuiPage />} />
    <Route path="xu-ly" element={<YeuCauXuLyPage />} />
    <Route path="dieu-phoi" element={<YeuCauDieuPhoiPage />} />
    <Route path="quan-ly-khoa" element={<YeuCauQuanLyKhoaPage />} />
    <Route path=":id" element={<YeuCauDetailPage />} />
  </Route>

  {/* QuanLyNhanVien Routes */}
  <Route path="nhanvien/:id/quanly" element={<QuanLyNhanVienPage />} />

  {/* Other existing routes */}
  <Route path="nhomviec-user" element={<NhomViecUserPage />} />
  <Route path="nhiemvu-thuongquy" element={<NhiemVuThuongQuyPage />} />
</Route>
```

**Action Items:**

- [ ] Backup current routes/index.js
- [ ] Restructure nested routes
- [ ] Remove old route patterns
- [ ] Test all route paths manually

---

### 2. Navigation Helper Utility (1h)

#### File: `src/utils/navigationHelper.js` (NEW)

```javascript
/**
 * Navigation helper utilities for QuanLyCongViec module
 * Provides consistent URL building across the app
 */

const WORK_MANAGEMENT_BASE = "/quanlycongviec";

/**
 * Build URL for work management routes
 * @param {string} module - 'congviec' | 'kpi' | 'yeucau' | 'giao-nhiem-vu'
 * @param {string} path - Relative path within module
 * @param {object} params - URL parameters
 * @returns {string} Complete URL
 */
export const buildWorkManagementUrl = (module, path = "", params = {}) => {
  let url = `${WORK_MANAGEMENT_BASE}/${module}`;

  if (path) {
    url += `/${path}`;
  }

  // Replace params in path (e.g., :id -> 123)
  Object.entries(params).forEach(([key, value]) => {
    url = url.replace(`:${key}`, value);
  });

  return url;
};

/**
 * Common route builders
 */
export const WorkRoutes = {
  // Dashboard
  unifiedDashboard: () => `${WORK_MANAGEMENT_BASE}/dashboard`,

  // CongViec
  congViecDashboard: () => `${WORK_MANAGEMENT_BASE}/congviec/dashboard`,
  congViecList: (nhanVienId) =>
    `${WORK_MANAGEMENT_BASE}/congviec/list/${nhanVienId}`,
  congViecDetail: (id) => `${WORK_MANAGEMENT_BASE}/congviec/${id}`,

  // GiaoNhiemVu
  assignmentList: () => `${WORK_MANAGEMENT_BASE}/giao-nhiem-vu`,
  assignmentDetail: (id) => `${WORK_MANAGEMENT_BASE}/giao-nhiem-vu/${id}`,

  // KPI
  kpiDashboard: () => `${WORK_MANAGEMENT_BASE}/kpi/dashboard`,
  kpiEvaluate: () => `${WORK_MANAGEMENT_BASE}/kpi/danh-gia-nhan-vien`,
  kpiSelfAssess: () => `${WORK_MANAGEMENT_BASE}/kpi/tu-danh-gia`,

  // Ticket/YeuCau
  ticketDashboard: () => `${WORK_MANAGEMENT_BASE}/yeucau/dashboard`,
  ticketSent: () => `${WORK_MANAGEMENT_BASE}/yeucau/toi-gui`,
  ticketHandle: () => `${WORK_MANAGEMENT_BASE}/yeucau/xu-ly`,
  ticketCoordinate: () => `${WORK_MANAGEMENT_BASE}/yeucau/dieu-phoi`,
  ticketDetail: (id) => `${WORK_MANAGEMENT_BASE}/yeucau/${id}`,
};

/**
 * Get breadcrumb items for a module
 */
export const getBreadcrumbs = (module, pageName, params = {}) => {
  const base = [
    { label: "Trang chủ", path: "/", icon: "home" },
    { label: "Quản lý công việc", path: WorkRoutes.unifiedDashboard() },
  ];

  const moduleRoutes = {
    congviec: [
      { label: "Công việc", path: WorkRoutes.congViecDashboard() },
      ...(pageName === "detail" && params.id
        ? [{ label: `#${params.id}`, path: null }]
        : []),
    ],
    yeucau: [
      { label: "Yêu cầu", path: WorkRoutes.ticketDashboard() },
      ...(pageName === "detail" && params.id
        ? [{ label: `#YC-${params.id}`, path: null }]
        : []),
    ],
    // ... thêm các modules khác
  };

  return [...base, ...(moduleRoutes[module] || [])];
};
```

**Usage example:**

```javascript
// Instead of hardcoded strings
navigate("/quanlycongviec/congviec/123");

// Use helper
import { WorkRoutes } from "utils/navigationHelper";
navigate(WorkRoutes.congViecDetail("123"));
```

---

### 3. Update Navigation Calls - CongViec Module (4h)

#### Files to update:

##### A. `CongViecByNhanVienPage.js` (1h)

```javascript
// ❌ BEFORE
import { useNavigate } from "react-router-dom";
const navigate = useNavigate();

const handleViewDetail = (congViecId) => {
  navigate(`/congviec/${congViecId}`);
};

// ✅ AFTER
import { WorkRoutes } from "utils/navigationHelper";
const navigate = useNavigate();

const handleViewDetail = (congViecId) => {
  navigate(WorkRoutes.congViecDetail(congViecId));
};
```

**Locations to update:**

- Line ~350: `handleViewDetail` function
- Line ~400: After create new CongViec
- Line ~450: After update CongViec

##### B. `CongViecTable.js` (30 min)

```javascript
// ❌ BEFORE
<TableRow
  onClick={() => navigate(`/congviec/${row.original._id}`)}
  sx={{ cursor: 'pointer' }}
>

// ✅ AFTER
import { WorkRoutes } from 'utils/navigationHelper';

<TableRow
  onClick={() => navigate(WorkRoutes.congViecDetail(row.original._id))}
  sx={{ cursor: 'pointer' }}
>
```

##### C. `CongViecDetailDialog.js` (30 min)

- Update breadcrumb links
- Update navigation after actions

##### D. `CongViecFormDialog.js` (30 min)

- Update navigation after create/update success

##### E. `TreeView/CongViecTreeDialog.js` (30 min)

- Update tree node click handlers

##### F. `congViecSlice.js` (Redux thunks) (1h)

```javascript
// ❌ BEFORE
export const createCongViec = (data) => async (dispatch) => {
  try {
    const response = await apiService.post("/workmanagement/congviec", data);
    dispatch(slice.actions.createCongViecSuccess(response.data));
    toast.success("Tạo công việc thành công");
    // Hardcoded navigation
    window.location.href = `/congviec/${response.data._id}`;
  } catch (error) {
    // ...
  }
};

// ✅ AFTER
import { WorkRoutes } from "utils/navigationHelper";

export const createCongViec = (data, navigate) => async (dispatch) => {
  try {
    const response = await apiService.post("/workmanagement/congviec", data);
    dispatch(slice.actions.createCongViecSuccess(response.data));
    toast.success("Tạo công việc thành công");
    // Use helper
    navigate(WorkRoutes.congViecDetail(response.data._id));
  } catch (error) {
    // ...
  }
};
```

**Note:** Redux thunks không có direct access to navigate, cần pass từ component:

```javascript
// Component
const dispatch = useDispatch();
const navigate = useNavigate();

const handleSubmit = (data) => {
  dispatch(createCongViec(data, navigate));
};
```

---

### 4. Update Navigation Calls - Ticket Module (4h)

#### Critical files (có nhiều navigation nhất):

##### A. `YeuCauToiGuiPage.js` (1h)

```javascript
// ❌ BEFORE
const handleViewDetail = (yeuCau) => {
  navigate(`/yeu-cau/${yeuCau._id}`);
};

// Breadcrumb
<Link href="/yeu-cau">Yêu cầu</Link>;

// ✅ AFTER
import { WorkRoutes } from "utils/navigationHelper";

const handleViewDetail = (yeuCau) => {
  navigate(WorkRoutes.ticketDetail(yeuCau._id));
};

// Breadcrumb
<Link href={WorkRoutes.ticketDashboard()}>Yêu cầu</Link>;
```

**Lines to update:**

- Line ~130: handleViewDetail
- Line ~150: Breadcrumb links
- Similar for YeuCauXuLyPage, YeuCauDieuPhoiPage, YeuCauQuanLyKhoaPage

##### B. `YeuCauDetailPage.js` (1h)

- Update breadcrumbs (nhiều nơi)
- Update back button navigation
- Update related ticket links

##### C. `components/YeuCauList.js` (30 min)

```javascript
// ❌ BEFORE
<YeuCauCard onClick={() => navigate(`/yeu-cau/${item._id}`)} yeucau={item} />;

// ✅ AFTER
import { WorkRoutes } from "utils/navigationHelper";

<YeuCauCard
  onClick={() => navigate(WorkRoutes.ticketDetail(item._id))}
  yeucau={item}
/>;
```

##### D. `yeuCauSlice.js` (Redux) (1h)

- Update navigation sau create/update
- Pass navigate from component như CongViec module

##### E. `hooks/useYeuCauTabs.js` (30 min)

**Critical:** Hook này generate API params từ config

```javascript
// File: config/yeuCauTabConfig.js
export const YEU_CAU_TOI_GUI_CONFIG = {
  pageKey: "YEU_CAU_TOI_GUI",
  title: "Yêu cầu tôi gửi đi",
  route: "/yeu-cau-toi-gui",  // ❌ OLD

// ✅ UPDATE TO:
  route: "/quanlycongviec/yeucau/toi-gui",
```

---

### 5. Update Navigation Calls - GiaoNhiemVu (1h)

##### A. `CycleAssignmentListPage.js` (30 min)

```javascript
// ❌ BEFORE
navigate(`/quanlycongviec/giao-nhiem-vu-chu-ky/${nhanVienId}`);

// ✅ AFTER
import { WorkRoutes } from "utils/navigationHelper";
navigate(WorkRoutes.assignmentDetail(nhanVienId));
```

##### B. `CycleAssignmentDetailPage.js` (30 min)

- Update breadcrumbs
- Update back button

---

### 6. Update Menu Items (1h)

##### A. `MainLayout/Sidebar/MenuList/items/index.js`

```javascript
// ❌ BEFORE
{
  id: 'congviec',
  title: 'Công việc',
  type: 'collapse',
  icon: icons.IconChecklist,
  children: [
    {
      id: 'congviec-list',
      title: 'Danh sách',
      type: 'item',
      url: '/quan-ly-cong-viec/nhan-vien/me',  // ❌ OLD
    },
    {
      id: 'yeucau',
      title: 'Yêu cầu',
      type: 'item',
      url: '/yeu-cau/toi-gui',  // ❌ OLD
    }
  ]
}

// ✅ AFTER
import { WorkRoutes } from 'utils/navigationHelper';

{
  id: 'congviec',
  title: 'Công việc',
  type: 'collapse',
  icon: icons.IconChecklist,
  children: [
    {
      id: 'congviec-dashboard',
      title: 'Dashboard',
      type: 'item',
      url: WorkRoutes.unifiedDashboard(),  // ✅ NEW
      icon: icons.IconDashboard,
    },
    {
      id: 'congviec-list',
      title: 'Danh sách công việc',
      type: 'item',
      url: WorkRoutes.congViecDashboard(),  // ✅ NEW
    },
    {
      id: 'yeucau',
      title: 'Yêu cầu',
      type: 'item',
      url: WorkRoutes.ticketDashboard(),  // ✅ NEW
    }
  ]
}
```

##### B. `MainLayoutAble/Drawer/DrawerContent/Navigation/index.js`

- Similar updates cho Able theme menu

---

### 7. WorkManagementBreadcrumb Component (3h)

#### File: `src/features/QuanLyCongViec/components/WorkManagementBreadcrumb.js` (NEW)

```javascript
import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Breadcrumbs, Link, Typography, Box } from "@mui/material";
import { Home as HomeIcon, NavigateNext } from "@mui/icons-material";

/**
 * Reusable breadcrumb component for Work Management module
 *
 * @param {Array} items - Breadcrumb items
 *   Example: [
 *     { label: 'Home', path: '/', icon: <HomeIcon /> },
 *     { label: 'Công việc', path: '/quanlycongviec/congviec' },
 *     { label: '#CV-123', path: null } // Current page (no link)
 *   ]
 */
const WorkManagementBreadcrumb = ({ items = [] }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNext fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          "& .MuiBreadcrumbs-ol": {
            flexWrap: { xs: "wrap", sm: "nowrap" },
          },
        }}
      >
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const hasPath = item.path !== null && item.path !== undefined;

          if (isLast || !hasPath) {
            // Current page - no link
            return (
              <Typography
                key={index}
                color="text.primary"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {item.icon && (
                  <Box sx={{ mr: 0.5, display: "flex" }}>{item.icon}</Box>
                )}
                {item.label}
              </Typography>
            );
          }

          // Clickable link
          return (
            <Link
              key={index}
              component={RouterLink}
              to={item.path}
              underline="hover"
              color="inherit"
              sx={{
                display: "flex",
                alignItems: "center",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              {item.icon && (
                <Box sx={{ mr: 0.5, display: "flex" }}>{item.icon}</Box>
              )}
              {item.label}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default WorkManagementBreadcrumb;
```

#### Usage in pages:

```javascript
// CongViecDetailPage.js
import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";
import { WorkRoutes, getBreadcrumbs } from "utils/navigationHelper";
import HomeIcon from "@mui/icons-material/Home";

function CongViecDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/", icon: <HomeIcon fontSize="small" /> },
    { label: "Dashboard", path: WorkRoutes.unifiedDashboard() },
    { label: "Công việc", path: WorkRoutes.congViecList(user.NhanVienID) },
    { label: `#CV-${id}`, path: null }, // Current page
  ];

  return (
    <Box>
      <WorkManagementBreadcrumb items={breadcrumbItems} />
      {/* Page content */}
    </Box>
  );
}
```

---

## ✅ Testing Checklist

### Manual Testing (3h)

#### Navigation Tests

- [ ] Test all menu items navigate correctly
- [ ] Click Dashboard card → Navigate to module list
- [ ] Click table row → Navigate to detail
- [ ] Click breadcrumb links → Navigate back correctly
- [ ] Browser back button works
- [ ] Browser forward button works

#### Deep Link Tests

- [ ] Copy detail page URL → Paste in new tab → Loads correctly
- [ ] Bookmark a page → Close browser → Reopen → Works
- [ ] Share URL with colleague → They can access

#### Error Tests

- [ ] Navigate to non-existent route → 404 page
- [ ] Navigate to detail with invalid ID → Error handling
- [ ] Route with missing params → Graceful error

### Automated Tests (1h)

#### Update existing tests

```bash
# Find all test files with old routes
grep -r "quan-ly-cong-viec" src/**/*.test.js
grep -r '"/congviec/' src/**/*.test.js
grep -r '"/yeu-cau' src/**/*.test.js
```

#### Example test update:

```javascript
// ❌ BEFORE
it("navigates to detail page", () => {
  render(<CongViecTable data={mockData} />);
  fireEvent.click(screen.getByText("CV-123"));
  expect(mockNavigate).toHaveBeenCalledWith("/congviec/123");
});

// ✅ AFTER
import { WorkRoutes } from "utils/navigationHelper";

it("navigates to detail page", () => {
  render(<CongViecTable data={mockData} />);
  fireEvent.click(screen.getByText("CV-123"));
  expect(mockNavigate).toHaveBeenCalledWith(WorkRoutes.congViecDetail("123"));
});
```

---

## 📚 Documentation (1h)

### Create migration guide for team

**File:** `docs/UX_IMPROVEMENT_2026/MIGRATION_GUIDE_PHASE1.md`

```markdown
# Phase 1 Migration Guide - Navigation Update

## For Developers

### Old bookmarks won't work

- Old: `/congviec/123` → 404
- New: `/quanlycongviec/congviec/123`

### Update your bookmarks to:

- Dashboard: /quanlycongviec/dashboard
- Công việc của tôi: /quanlycongviec/congviec/list/[your-id]
- Yêu cầu tôi gửi: /quanlycongviec/yeucau/toi-gui

### For Future Development

Always use `WorkRoutes` helper instead of hardcoded strings:
\`\`\`javascript
// ❌ DON'T
navigate('/quanlycongviec/congviec/123');

// ✅ DO
import { WorkRoutes } from 'utils/navigationHelper';
navigate(WorkRoutes.congViecDetail('123'));
\`\`\`
```

---

## 🚨 Rollout Plan

### Pre-deployment

- [ ] Review all changed files with team
- [ ] Demo navigation flows to stakeholders
- [ ] Send announcement email 2 days before deploy

### Deployment Day

- [ ] Deploy during low-traffic hours (8pm-10pm)
- [ ] Monitor error logs for 2 hours
- [ ] Have rollback script ready

### Post-deployment

- [ ] Send "Migration complete" email with new URLs
- [ ] Update internal wiki/docs
- [ ] Collect feedback for 1 week

---

**Next Phase:** [02_PHASE_2_MOBILE_REDESIGN.md](./02_PHASE_2_MOBILE_REDESIGN.md)
