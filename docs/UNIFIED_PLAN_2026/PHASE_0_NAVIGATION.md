# Phase 0: Navigation Refactor

**Thời gian:** 24 giờ  
**Ưu tiên:** 🔴 CRITICAL - BLOCKING ALL OTHER PHASES  
**Trạng thái:** ⏳ Not Started

---

## 🎯 Mục Tiêu

Chuẩn hóa tất cả routes trong module QuanLyCongViec về một prefix duy nhất: `/quanlycongviec/*`

### Vấn Đề Hiện Tại

Routes hiện tại **KHÔNG NHẤT QUÁN**:

```javascript
// Mixed patterns ❌
/quanlycongviec/kpi/dashboard          // ✅ Unified
/quan-ly-cong-viec/nhan-vien/:id       // ❌ Kebab-case variant
/congviec/:id                          // ❌ Standalone
/yeu-cau/dashboard                     // ❌ Standalone
/cycle-assignment/:cycleId             // ❌ Standalone
```

### Mục Tiêu

```javascript
// Target: ALL unified ✅
/quanlycongviec/dashboard
/quanlycongviec/congviec/:id
/quanlycongviec/congviec/nhanvien/:id
/quanlycongviec/yeucau/dashboard
/quanlycongviec/giaonhiemvu/cycle/:cycleId
/quanlycongviec/kpi/dashboard
```

---

## 📦 Deliverables

1. ✅ `src/utils/navigationHelper.js` - Centralized route builder
2. ✅ `src/features/QuanLyCongViec/components/WorkManagementBreadcrumb.js` - Auto breadcrumb
3. ✅ Updated `src/routes/index.js` - All routes unified
4. ✅ 40+ files updated with new navigation calls
5. ✅ Updated menu items (MainLayout + MainLayoutAble)
6. ✅ Documentation

---

## 📋 Task Breakdown (24h)

### Task 0.1: Create navigationHelper.js (4h)

**File:** `src/utils/navigationHelper.js`

**Purpose:** Centralized route building để tránh hardcode routes

**Implementation:**

```javascript
// src/utils/navigationHelper.js

/**
 * Centralized navigation helper for QuanLyCongViec module
 * All routes use prefix: /quanlycongviec/
 */

const BASE_PATH = "/quanlycongviec";

/**
 * WorkRoutes - Tập hợp tất cả route builders
 */
export const WorkRoutes = {
  // Dashboard routes
  dashboard: () => `${BASE_PATH}/dashboard`,

  // CongViec routes
  congViecDashboard: () => `${BASE_PATH}/congviec/dashboard`,
  congViecList: (nhanVienId) => `${BASE_PATH}/congviec/nhanvien/${nhanVienId}`,
  congViecDetail: (id) => `${BASE_PATH}/congviec/${id}`,
  congViecCreate: () => `${BASE_PATH}/congviec/create`,
  congViecEdit: (id) => `${BASE_PATH}/congviec/edit/${id}`,

  // YeuCau/Ticket routes
  yeuCauDashboard: () => `${BASE_PATH}/yeucau/dashboard`,
  yeuCauToiGui: () => `${BASE_PATH}/yeucau/toigui`,
  yeuCauXuLy: () => `${BASE_PATH}/yeucau/xuly`,
  yeuCauQuanLyKhoa: () => `${BASE_PATH}/yeucau/quanlykhoa`,
  yeuCauDetail: (id) => `${BASE_PATH}/yeucau/${id}`,

  // KPI routes
  kpiDashboard: () => `${BASE_PATH}/kpi/dashboard`,
  kpiDanhGia: () => `${BASE_PATH}/kpi/danhgia`,
  kpiTuDanhGia: () => `${BASE_PATH}/kpi/tudanhgia`,
  kpiBaoCao: () => `${BASE_PATH}/kpi/baocao`,
  kpiDanhGiaDetail: (id) => `${BASE_PATH}/kpi/danhgia/${id}`,

  // GiaoNhiemVu routes
  giaoNhiemVuDashboard: () => `${BASE_PATH}/giaonhiemvu/dashboard`,
  giaoNhiemVuList: () => `${BASE_PATH}/giaonhiemvu/list`,
  cycleAssignment: (cycleId) => `${BASE_PATH}/giaonhiemvu/cycle/${cycleId}`,
  cycleAssignmentDetail: (cycleId, employeeId) =>
    `${BASE_PATH}/giaonhiemvu/cycle/${cycleId}/nhanvien/${employeeId}`,

  // NhiemVuThuongQuy routes
  nhiemVuThuongQuyList: () => `${BASE_PATH}/nhiemvuthuongquy`,
  nhiemVuThuongQuyDetail: (id) => `${BASE_PATH}/nhiemvuthuongquy/${id}`,

  // QuanLyNhanVien routes
  quanLyNhanVienList: () => `${BASE_PATH}/quanlynhanvien`,
  quanLyNhanVienDetail: (id) => `${BASE_PATH}/quanlynhanvien/${id}`,
};

/**
 * Build breadcrumbs từ pathname
 * @param {string} pathname - Current location pathname
 * @param {object} params - Route params (id, cycleId, etc.)
 * @param {object} data - Additional data for titles (optional)
 * @returns {Array<{title: string, href: string}>}
 */
export const buildBreadcrumbs = (pathname, params = {}, data = {}) => {
  const breadcrumbs = [{ title: "Trang chủ", href: "/" }];

  // QuanLyCongViec root
  if (pathname.startsWith(BASE_PATH)) {
    breadcrumbs.push({
      title: "Quản lý công việc",
      href: WorkRoutes.dashboard(),
    });
  }

  // CongViec section
  if (pathname.includes("/congviec")) {
    breadcrumbs.push({
      title: "Công việc",
      href: WorkRoutes.congViecDashboard(),
    });

    if (pathname.includes("/nhanvien/")) {
      breadcrumbs.push({
        title: "Công việc của tôi",
        href: WorkRoutes.congViecList(params.nhanVienId),
      });
    }

    if (pathname.match(/\/congviec\/[^/]+$/)) {
      const title = data.tenCongViec || `Chi tiết công việc`;
      breadcrumbs.push({ title, href: "#" });
    }
  }

  // YeuCau section
  if (pathname.includes("/yeucau")) {
    breadcrumbs.push({
      title: "Yêu cầu xử lý",
      href: WorkRoutes.yeuCauDashboard(),
    });

    if (pathname.includes("/toigui")) {
      breadcrumbs.push({
        title: "Yêu cầu tôi gửi",
        href: WorkRoutes.yeuCauToiGui(),
      });
    } else if (pathname.includes("/xuly")) {
      breadcrumbs.push({
        title: "Yêu cầu xử lý",
        href: WorkRoutes.yeuCauXuLy(),
      });
    } else if (pathname.includes("/quanlykhoa")) {
      breadcrumbs.push({
        title: "Quản lý khoa",
        href: WorkRoutes.yeuCauQuanLyKhoa(),
      });
    }

    if (pathname.match(/\/yeucau\/[^/]+$/)) {
      const title = data.tieuDe || `Chi tiết yêu cầu`;
      breadcrumbs.push({ title, href: "#" });
    }
  }

  // KPI section
  if (pathname.includes("/kpi")) {
    breadcrumbs.push({
      title: "Đánh giá KPI",
      href: WorkRoutes.kpiDashboard(),
    });

    if (pathname.includes("/danhgia") && !pathname.includes("/tudanhgia")) {
      breadcrumbs.push({
        title: "Danh sách đánh giá",
        href: WorkRoutes.kpiDanhGia(),
      });
    } else if (pathname.includes("/tudanhgia")) {
      breadcrumbs.push({
        title: "Tự đánh giá",
        href: WorkRoutes.kpiTuDanhGia(),
      });
    } else if (pathname.includes("/baocao")) {
      breadcrumbs.push({ title: "Báo cáo KPI", href: WorkRoutes.kpiBaoCao() });
    }
  }

  // GiaoNhiemVu section
  if (pathname.includes("/giaonhiemvu")) {
    breadcrumbs.push({
      title: "Giao nhiệm vụ",
      href: WorkRoutes.giaoNhiemVuDashboard(),
    });

    if (pathname.includes("/cycle/")) {
      const title = data.tenChuKy || `Chi tiết chu kỳ`;
      breadcrumbs.push({
        title,
        href: WorkRoutes.cycleAssignment(params.cycleId),
      });

      if (params.employeeId) {
        const employeeTitle = data.tenNhanVien || `Nhân viên`;
        breadcrumbs.push({ title: employeeTitle, href: "#" });
      }
    }
  }

  // NhiemVuThuongQuy section
  if (pathname.includes("/nhiemvuthuongquy")) {
    breadcrumbs.push({
      title: "Nhiệm vụ thường quy",
      href: WorkRoutes.nhiemVuThuongQuyList(),
    });

    if (pathname.match(/\/nhiemvuthuongquy\/[^/]+$/)) {
      const title = data.tenNhiemVu || `Chi tiết nhiệm vụ`;
      breadcrumbs.push({ title, href: "#" });
    }
  }

  // QuanLyNhanVien section
  if (pathname.includes("/quanlynhanvien")) {
    breadcrumbs.push({
      title: "Quản lý nhân viên",
      href: WorkRoutes.quanLyNhanVienList(),
    });

    if (pathname.match(/\/quanlynhanvien\/[^/]+$/)) {
      const title = data.hoTen || `Chi tiết nhân viên`;
      breadcrumbs.push({ title, href: "#" });
    }
  }

  return breadcrumbs;
};

/**
 * Get page title từ pathname
 */
export const getPageTitle = (pathname) => {
  if (pathname === WorkRoutes.dashboard()) return "Dashboard";
  if (pathname === WorkRoutes.congViecDashboard()) return "Công việc";
  if (pathname === WorkRoutes.yeuCauDashboard()) return "Yêu cầu xử lý";
  if (pathname === WorkRoutes.kpiDashboard()) return "Đánh giá KPI";
  if (pathname === WorkRoutes.giaoNhiemVuDashboard()) return "Giao nhiệm vụ";
  return "Quản lý công việc";
};
```

**Testing:**

```javascript
// Test cases
console.log(WorkRoutes.congViecDetail("123")); // /quanlycongviec/congviec/123
console.log(WorkRoutes.cycleAssignment("cycle-1")); // /quanlycongviec/giaonhiemvu/cycle/cycle-1

const crumbs = buildBreadcrumbs(
  "/quanlycongviec/congviec/123",
  { id: "123" },
  { tenCongViec: "Task ABC" }
);
// [
//   { title: 'Trang chủ', href: '/' },
//   { title: 'Quản lý công việc', href: '/quanlycongviec/dashboard' },
//   { title: 'Công việc', href: '/quanlycongviec/congviec/dashboard' },
//   { title: 'Task ABC', href: '#' }
// ]
```

---

### Task 0.2: Create WorkManagementBreadcrumb.js (3h)

**File:** `src/features/QuanLyCongViec/components/WorkManagementBreadcrumb.js`

**Implementation:**

```javascript
import React from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Breadcrumbs, Typography, Box } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { buildBreadcrumbs } from "utils/navigationHelper";

/**
 * WorkManagementBreadcrumb - Auto breadcrumb cho QuanLyCongViec
 *
 * Usage:
 * <WorkManagementBreadcrumb data={{ tenCongViec: 'Task ABC' }} />
 */
const WorkManagementBreadcrumb = ({ data = {} }) => {
  const location = useLocation();
  const params = useParams();

  const breadcrumbs = buildBreadcrumbs(location.pathname, params, data);

  // Hide on mobile
  return (
    <Box sx={{ display: { xs: "none", sm: "block" }, mb: 2 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast || crumb.href === "#") {
            return (
              <Typography key={index} color="text.primary" fontSize="0.875rem">
                {crumb.title}
              </Typography>
            );
          }

          return (
            <Link
              key={index}
              to={crumb.href}
              style={{
                textDecoration: "none",
                color: "inherit",
                fontSize: "0.875rem",
              }}
            >
              <Typography
                color="text.secondary"
                fontSize="0.875rem"
                sx={{
                  "&:hover": {
                    textDecoration: "underline",
                    color: "primary.main",
                  },
                }}
              >
                {crumb.title}
              </Typography>
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default WorkManagementBreadcrumb;
```

**Usage Examples:**

```javascript
// In CongViecDetailPage.js
import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";

function CongViecDetailPage() {
  const congViec = useSelector((state) => state.congviec.currentItem);

  return (
    <>
      <WorkManagementBreadcrumb data={{ tenCongViec: congViec?.TieuDe }} />
      {/* Rest of page */}
    </>
  );
}

// In CycleAssignmentDetailPage.js
import WorkManagementBreadcrumb from "../../components/WorkManagementBreadcrumb";

function CycleAssignmentDetailPage() {
  const cycle = useSelector((state) => state.cycle.currentCycle);
  const employee = useSelector((state) => state.nhanvien.currentEmployee);

  return (
    <>
      <WorkManagementBreadcrumb
        data={{
          tenChuKy: cycle?.TenChuKy,
          tenNhanVien: employee?.HoTen,
        }}
      />
      {/* Rest of page */}
    </>
  );
}
```

---

### Task 0.3: Update routes/index.js (4h)

**File:** `src/routes/index.js`

**Changes:**

```javascript
import { lazy } from "react";
import { WorkRoutes } from "utils/navigationHelper";

// QuanLyCongViec routes - ALL under /quanlycongviec prefix
const QuanLyCongViecRoutes = {
  path: "/quanlycongviec",
  element: <MainLayoutAble />, // or MainLayout depending on section
  children: [
    // Dashboard
    {
      path: "dashboard",
      element: lazy(() =>
        import("features/QuanLyCongViec/Dashboard/UnifiedDashboardPage")
      ),
    },

    // CongViec section
    {
      path: "congviec",
      children: [
        {
          path: "dashboard",
          element: lazy(() =>
            import("features/QuanLyCongViec/CongViec/CongViecDashboardPage")
          ),
        },
        {
          path: "nhanvien/:nhanVienId",
          element: lazy(() =>
            import("features/QuanLyCongViec/CongViec/CongViecListPage")
          ),
        },
        {
          path: ":id",
          element: lazy(() =>
            import("features/QuanLyCongViec/CongViec/CongViecDetailPage")
          ),
        },
      ],
    },

    // YeuCau/Ticket section
    {
      path: "yeucau",
      children: [
        {
          path: "dashboard",
          element: lazy(() =>
            import("features/QuanLyCongViec/Ticket/YeuCauDashboardPage")
          ),
        },
        {
          path: "toigui",
          element: lazy(() =>
            import("features/QuanLyCongViec/Ticket/YeuCauToiGuiPage")
          ),
        },
        {
          path: "xuly",
          element: lazy(() =>
            import("features/QuanLyCongViec/Ticket/YeuCauXuLyPage")
          ),
        },
        {
          path: "quanlykhoa",
          element: lazy(() =>
            import("features/QuanLyCongViec/Ticket/YeuCauQuanLyKhoaPage")
          ),
        },
        {
          path: ":id",
          element: lazy(() =>
            import("features/QuanLyCongViec/Ticket/YeuCauDetailPage")
          ),
        },
      ],
    },

    // KPI section
    {
      path: "kpi",
      children: [
        {
          path: "dashboard",
          element: lazy(() =>
            import("features/QuanLyCongViec/KPI/KPIDashboardPage")
          ),
        },
        {
          path: "danhgia",
          element: lazy(() =>
            import("features/QuanLyCongViec/KPI/DanhGiaKPIPage")
          ),
        },
        {
          path: "tudanhgia",
          element: lazy(() =>
            import("features/QuanLyCongViec/KPI/TuDanhGiaKPIPage")
          ),
        },
        {
          path: "baocao",
          element: lazy(() =>
            import("features/QuanLyCongViec/KPI/BaoCaoKPIPage")
          ),
        },
        {
          path: "danhgia/:id",
          element: lazy(() =>
            import("features/QuanLyCongViec/KPI/DanhGiaKPIDetailPage")
          ),
        },
      ],
    },

    // GiaoNhiemVu section
    {
      path: "giaonhiemvu",
      children: [
        {
          path: "dashboard",
          element: lazy(() =>
            import(
              "features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuDashboardPage"
            )
          ),
        },
        {
          path: "list",
          element: lazy(() =>
            import("features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuListPage")
          ),
        },
        {
          path: "cycle/:cycleId",
          element: lazy(() =>
            import("features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentPage")
          ),
        },
        {
          path: "cycle/:cycleId/nhanvien/:employeeId",
          element: lazy(() =>
            import(
              "features/QuanLyCongViec/GiaoNhiemVu/CycleAssignmentDetailPage"
            )
          ),
        },
      ],
    },

    // NhiemVuThuongQuy section
    {
      path: "nhiemvuthuongquy",
      children: [
        {
          index: true,
          element: lazy(() =>
            import(
              "features/QuanLyCongViec/NhiemVuThuongQuy/NhiemVuThuongQuyPage"
            )
          ),
        },
        {
          path: ":id",
          element: lazy(() =>
            import(
              "features/QuanLyCongViec/NhiemVuThuongQuy/NhiemVuThuongQuyDetailPage"
            )
          ),
        },
      ],
    },

    // QuanLyNhanVien section
    {
      path: "quanlynhanvien",
      children: [
        {
          index: true,
          element: lazy(() =>
            import("features/QuanLyCongViec/QuanLyNhanVien/QuanLyNhanVienPage")
          ),
        },
        {
          path: ":id",
          element: lazy(() =>
            import(
              "features/QuanLyCongViec/QuanLyNhanVien/QuanLyNhanVienDetailPage"
            )
          ),
        },
      ],
    },
  ],
};
```

**Remove old routes:**

- Remove `/quan-ly-cong-viec/*`
- Remove `/congviec/*` (standalone)
- Remove `/yeu-cau/*` (standalone)
- Remove `/cycle-assignment/*`

---

### Task 0.4: Update Navigation Calls (8h)

**40+ files cần update** - Replace hardcoded routes với `WorkRoutes.*`

#### **CongViec Module (5 files)**

**1. CongViecDetailPage.js**

```javascript
// OLD ❌
navigate(`/congviec/${id}`);

// NEW ✅
import { WorkRoutes } from "utils/navigationHelper";
navigate(WorkRoutes.congViecDetail(id));
```

**2. CongViecByNhanVienPage.js**

```javascript
// OLD ❌
<Link to={`/congviec/${row.original._id}`}>

// NEW ✅
import { WorkRoutes } from 'utils/navigationHelper';
<Link to={WorkRoutes.congViecDetail(row.original._id)}>
```

**3. CreateCongViecDialog.js**

```javascript
// After create success
// OLD ❌
navigate("/quan-ly-cong-viec/cong-viec-nhan-vien/" + userId);

// NEW ✅
navigate(WorkRoutes.congViecList(userId));
```

**4. CongViecFilterPanel.js**

```javascript
// No navigation changes, but might reference routes for reset
```

**5. CongViecTable.js**

```javascript
// Cell renderer
// OLD ❌
<Link to={`/congviec/${id}`}>

// NEW ✅
<Link to={WorkRoutes.congViecDetail(id)}>
```

#### **Ticket/YeuCau Module (6 files)**

**1. YeuCauToiGuiPage.js**

```javascript
// OLD ❌
navigate("/yeu-cau/dashboard");

// NEW ✅
navigate(WorkRoutes.yeuCauDashboard());
```

**2. YeuCauXuLyPage.js**

```javascript
// OLD ❌
<Link to={`/yeu-cau/${id}`}>

// NEW ✅
<Link to={WorkRoutes.yeuCauDetail(id)}>
```

**3. YeuCauQuanLyKhoaPage.js**

```javascript
// Similar updates
```

**4. YeuCauDetailPage.js**

```javascript
// Breadcrumb data
<WorkManagementBreadcrumb data={{ tieuDe: yeuCau?.TieuDe }} />
```

**5. CreateYeuCauDialog.js**

```javascript
// After create
navigate(WorkRoutes.yeuCauToiGui());
```

**6. YeuCauCard.js (Ticket module)**

```javascript
// Card click
onClick={() => navigate(WorkRoutes.yeuCauDetail(ticket._id))}
```

#### **KPI Module (2 files)**

**1. DanhGiaKPIPage.js**

```javascript
// OLD ❌
navigate("/quanlycongviec/kpi/danhgia/" + id);

// NEW ✅
navigate(WorkRoutes.kpiDanhGiaDetail(id));
```

**2. TuDanhGiaKPIPage.js**

```javascript
// Similar updates
```

#### **GiaoNhiemVu Module (3 files)**

**1. CycleAssignmentPage.js**

```javascript
// OLD ❌
navigate(`/cycle-assignment/${cycleId}/employee/${empId}`);

// NEW ✅
navigate(WorkRoutes.cycleAssignmentDetail(cycleId, empId));
```

**2. CycleAssignmentDetailPage.js**

```javascript
// Breadcrumb
<WorkManagementBreadcrumb
  data={{
    tenChuKy: cycle?.TenChuKy,
    tenNhanVien: employee?.HoTen,
  }}
/>
```

**3. GiaoNhiemVuTable.js**

```javascript
// Cell navigation
onClick={() => navigate(WorkRoutes.cycleAssignment(cycleId))}
```

#### **Menu Items (2 files)**

**1. src/menu-items/quanlycongviec.js**

```javascript
import { WorkRoutes } from "utils/navigationHelper";

const quanlycongviec = {
  id: "quanlycongviec",
  title: "Quản lý công việc",
  type: "group",
  children: [
    {
      id: "dashboard",
      title: "Dashboard",
      type: "item",
      url: WorkRoutes.dashboard(), // /quanlycongviec/dashboard
      icon: icons.IconDashboard,
    },
    {
      id: "congvieccuatoi",
      title: "Công việc của tôi",
      type: "item",
      url: WorkRoutes.congViecDashboard(), // Will change in Phase 2
      icon: icons.IconChecklist,
    },
    {
      id: "yeucau",
      title: "Yêu cầu xử lý",
      type: "collapse",
      icon: icons.IconAlertCircle,
      children: [
        {
          id: "yeucau-toigui",
          title: "Yêu cầu tôi gửi",
          type: "item",
          url: WorkRoutes.yeuCauToiGui(),
        },
        {
          id: "yeucau-xuly",
          title: "Yêu cầu xử lý",
          type: "item",
          url: WorkRoutes.yeuCauXuLy(),
        },
        {
          id: "yeucau-quanlykhoa",
          title: "Quản lý khoa",
          type: "item",
          url: WorkRoutes.yeuCauQuanLyKhoa(),
        },
      ],
    },
    {
      id: "kpi",
      title: "Đánh giá KPI",
      type: "collapse",
      icon: icons.IconChartBar,
      children: [
        {
          id: "kpi-danhgia",
          title: "Danh sách đánh giá",
          type: "item",
          url: WorkRoutes.kpiDanhGia(),
        },
        {
          id: "kpi-tudanhgia",
          title: "Tự đánh giá",
          type: "item",
          url: WorkRoutes.kpiTuDanhGia(),
        },
        {
          id: "kpi-baocao",
          title: "Báo cáo KPI",
          type: "item",
          url: WorkRoutes.kpiBaoCao(),
        },
      ],
    },
    {
      id: "giaonhiemvu",
      title: "Giao nhiệm vụ",
      type: "item",
      url: WorkRoutes.giaoNhiemVuList(),
      icon: icons.IconUserCheck,
    },
  ],
};

export default quanlycongviec;
```

**2. src/layout/MainLayoutAble/Drawer/DrawerContent/Navigation/index.js**

```javascript
// Similar updates if menu items are defined here
```

#### **Redux Thunks (3 files)**

**1. congViecSlice.js**

```javascript
// After delete success
export const deleteCongViec = (id) => async (dispatch) => {
  // ...
  toast.success("Xóa công việc thành công");
  // No navigation in slice - components handle it
};
```

**2. ticketSlice.js**

```javascript
// Similar - no navigation in thunks
```

**3. kpiSlice.js**

```javascript
// Similar
```

#### **Other References (~10 files)**

- Dashboard summary cards (future Phase 2)
- Quick action buttons
- Notification links
- Search result links
- Context menu actions

---

### Task 0.5: Integration & Testing (5h)

**5.1 Integrate Breadcrumbs (2h)**

Add `<WorkManagementBreadcrumb />` to 8+ pages:

```javascript
// Template for each detail page
import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";

function DetailPage() {
  const item = useSelector(selectCurrentItem);

  return (
    <Container>
      <WorkManagementBreadcrumb data={{ title: item?.Title }} />
      {/* Rest of page */}
    </Container>
  );
}
```

**Pages to update:**

1. CongViecDetailPage.js
2. YeuCauDetailPage.js
3. DanhGiaKPIDetailPage.js
4. CycleAssignmentPage.js
5. CycleAssignmentDetailPage.js
6. NhiemVuThuongQuyDetailPage.js
7. QuanLyNhanVienDetailPage.js
8. TuDanhGiaKPIPage.js

**5.2 Test All Navigation (2h)**

Create test checklist:

```markdown
## Navigation Test Checklist

### Basic Navigation

- [ ] Menu "Dashboard" → /quanlycongviec/dashboard
- [ ] Menu "Công việc của tôi" → Works (route will change in Phase 2)
- [ ] Menu "Yêu cầu tôi gửi" → /quanlycongviec/yeucau/toigui
- [ ] Menu "Yêu cầu xử lý" → /quanlycongviec/yeucau/xuly
- [ ] Menu "Danh sách đánh giá" → /quanlycongviec/kpi/danhgia

### Detail Page Navigation

- [ ] Click công việc trong list → Detail page loads
- [ ] Click yêu cầu trong list → Detail page loads
- [ ] Click đánh giá KPI → Detail page loads
- [ ] Click cycle assignment → Detail loads

### Breadcrumb Tests

- [ ] CongViec detail shows: Trang chủ > Quản lý công việc > Công việc > [Task name]
- [ ] YeuCau detail shows: Trang chủ > Quản lý công việc > Yêu cầu > [Request title]
- [ ] KPI detail shows correct breadcrumb
- [ ] Breadcrumb links work (navigate back)

### Browser Tests

- [ ] Browser back button works
- [ ] Browser forward button works
- [ ] Refresh page preserves route
- [ ] Deep links work (paste URL)

### Cross-Browser

- [ ] Chrome: All routes work
- [ ] Firefox: All routes work
- [ ] Safari: All routes work
- [ ] Edge: All routes work

### Error Cases

- [ ] Invalid route → 404 page (future)
- [ ] Missing ID param → Error boundary
- [ ] Unauthorized route → Redirect to login
```

**5.3 Documentation (1h)**

Create ROUTE_MAPPING_REFERENCE.md:

````markdown
# Route Mapping Reference

## Old vs New Routes

| Module           | Old Route                                    | New Route                                    |
| ---------------- | -------------------------------------------- | -------------------------------------------- |
| CongViec Detail  | `/congviec/:id`                              | `/quanlycongviec/congviec/:id`               |
| CongViec List    | `/quan-ly-cong-viec/cong-viec-nhan-vien/:id` | `/quanlycongviec/congviec/nhanvien/:id`      |
| YeuCau Detail    | `/yeu-cau/:id`                               | `/quanlycongviec/yeucau/:id`                 |
| YeuCau Dashboard | `/yeu-cau/dashboard`                         | `/quanlycongviec/yeucau/dashboard`           |
| Cycle Assignment | `/cycle-assignment/:cycleId`                 | `/quanlycongviec/giaonhiemvu/cycle/:cycleId` |
| KPI Dashboard    | `/quanlycongviec/kpi/dashboard`              | ✅ No change                                 |

## Usage Examples

```javascript
import { WorkRoutes } from "utils/navigationHelper";

// Navigate to detail page
navigate(WorkRoutes.congViecDetail("123"));

// Navigate to list
navigate(WorkRoutes.yeuCauToiGui());

// Build breadcrumbs
const crumbs = buildBreadcrumbs(location.pathname, params, data);
```
````

```

---

## ✅ Success Criteria

- [ ] All routes use `/quanlycongviec/*` prefix
- [ ] No hardcoded route strings in code (use `WorkRoutes.*`)
- [ ] Breadcrumbs show on all detail pages
- [ ] Breadcrumbs hide on mobile (< 600px)
- [ ] All menu links work
- [ ] Browser back/forward works
- [ ] Deep linking works (paste URL)
- [ ] No broken links
- [ ] No console errors
- [ ] Cross-browser compatible

---

## 🚧 Dependencies

**NONE** - Phase 0 can start immediately

---

## 🚨 Risks & Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking user bookmarks | - Email users 1 week before<br>- Optional: Add temp redirects<br>- 404 page with guidance |
| Missed hardcoded routes | - Regex search: `navigate\(['"][/](?!quanlycongviec)`<br>- Code review |
| Breadcrumb data missing | - Default fallback titles<br>- Log warnings in dev mode |

---

## 📝 Notes

- **Breaking Change:** Users with bookmarks will see 404
- **Communication:** Send email 1 week before deployment
- **Rollback Plan:** Can revert routes.js if critical issues
- **Feature Flag:** Not needed (one-time migration)

---

**Next Phase:** Phase 1 - Mobile Bottom Navigation (depends on this)
```
