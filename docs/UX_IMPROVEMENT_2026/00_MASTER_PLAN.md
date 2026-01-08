# 🎯 Kế Hoạch Cải Tiến UX/UI Module QuanLyCongViec

**Ngày bắt đầu:** 08/01/2026  
**Trạng thái:** 📋 Planning  
**Phiên bản:** 1.1  
**Tổng thời gian ước tính:** ~100 giờ (~13 ngày làm việc)

> **📍 TIẾP TỤC DỰ ÁN:** Nếu bắt đầu hội thoại mới, đọc [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) để xem đang ở phase nào và checkpoint nào

---

## 📊 Executive Summary

### Mục tiêu

Cải thiện trải nghiệm người dùng cho module Quản lý Công việc thông qua:

1. ✅ Thống nhất navigation (1 prefix duy nhất: `/quanlycongviec/`)
2. ✅ Mobile-first redesign cho detail pages
3. ✅ Unified Dashboard tích hợp 3 modules (CongViec + KPI + Ticket)

### Phạm vi KHÔNG bao gồm

- ❌ Refactor CycleAssignmentDetailPage (1,299 dòng) - Chưa quan trọng
- ❌ Refactor CongViecByNhanVienPage (716 dòng) - Chưa quan trọng

### Chiến lược Route Migration

**Breaking Change (Option 2)** - Update trực tiếp, không redirect

- Lý do: Chưa phải product, có thể communicate team dễ dàng
- Code sạch hơn từ đầu, tránh technical debt

---

## 🗺️ Tổng Quan Các Giai Đoạn

```
Timeline: 13 ngày làm việc (100 giờ)

┌──────────────┬──────────────┬──────────────┬──────────────┐
│   Ngày 1-3   │   Ngày 4-6   │   Ngày 7-10  │  Ngày 11-13  │
├──────────────┼──────────────┼──────────────┼──────────────┤
│   PHASE 1    │   PHASE 2    │   PHASE 3    │   PHASE 4    │
│  Navigation  │   Mobile     │  Dashboard   │  Testing &   │
│      +       │  Redesign    │  + CongViec  │   Deploy     │
│  Breadcrumb  │              │   Nested     │              │
│   (24h)      │    (28h)     │    (38h)     │    (10h)     │
└──────────────┴──────────────┴──────────────┴──────────────┘
```

### Dependency Graph

```
                    MASTER_PLAN (file này)
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   ┌─────────┐        ┌─────────┐        ┌─────────┐
   │ PHASE 1 │        │ PHASE 2 │        │ PHASE 3 │
   │Navigation│◀───────│ Mobile  │        │Dashboard│
   │🔴 BLOCK │        │🟡 MEDIUM│◀───────│🟡 MEDIUM│
   └────┬────┘        └─────────┘        └─────────┘
        │                                       │
        └───────────────┬───────────────────────┘
                        ▼
                   ┌─────────┐
                   │ PHASE 4 │
                   │ Testing │
                   │🟢 LOW   │
                   └─────────┘
```

**Giải thích:**

- **Phase 1** BLOCK Phase 2,3 → Phải hoàn thành trước
- **Phase 2** có thể làm song song với Phase 3 sau khi Phase 1 xong
- **Phase 4** phụ thuộc vào tất cả phases trước

---

## 📂 Cấu Trúc Thư Mục Dự Án

### Tài liệu kế hoạch (folder này)

```
docs/UX_IMPROVEMENT_2026/
├── 00_MASTER_PLAN.md                    ← Bạn đang đọc
├── 01_PHASE_1_NAVIGATION.md             ← Chi tiết Phase 1
├── 02_PHASE_2_MOBILE_REDESIGN.md        ← Chi tiết Phase 2
├── 03_PHASE_3_UNIFIED_DASHBOARD.md      ← Chi tiết Phase 3
├── 04_PHASE_4_TESTING_DEPLOY.md         ← Chi tiết Phase 4
├── ROUTE_MAPPING_REFERENCE.md           ← Bảng mapping routes cũ → mới
└── CHECKLIST.md                         ← Checklist tổng hợp
```

### Source code sẽ thay đổi

```
src/
├── features/QuanLyCongViec/
│   ├── Dashboard/                       ← 🆕 NEW - Unified Dashboard
│   │   ├── UnifiedDashboardPage.js
│   │   ├── components/
│   │   │   ├── CongViecSummaryCard.js
│   │   │   ├── KPISummaryCard.js
│   │   │   ├── TicketSummaryCard.js
│   │   │   └── RecentActivityFeed.js
│   │   └── dashboardSlice.js
│   │
│   ├── CongViec/
│   │   ├── CongViecDashboardPage.js     ← 🆕 NEW - Module dashboard
│   │   ├── CongViecListPage.js          ← 🆕 NEW - Nested tabs view
│   │   ├── CongViecDetailPage.js        ← 🔧 REFACTOR - Mobile responsive
│   │   └── ...existing files
│   │
│   ├── KPI/
│   │   ├── KPIDashboardPage.js          ← 🆕 NEW
│   │   └── ...existing files
│   │
│   ├── Ticket/
│   │   ├── TicketDashboardPage.js       ← 🆕 NEW
│   │   └── ...existing files
│   │
│   ├── GiaoNhiemVu/
│   │   └── CycleAssignmentDetailPage.js ← 🔧 REFACTOR - Mobile responsive
│   │
│   └── components/                      ← 🆕 NEW - Shared components
│       ├── WorkManagementBreadcrumb.js
│       ├── MobileDetailLayout.js
│       └── RoleBasedTabs.js
│
├── routes/
│   └── index.js                         ← 🔧 MAJOR UPDATE - All routes
│
├── layout/
│   ├── MainLayout/Sidebar/MenuList/items/
│   │   └── index.js                     ← 🔧 UPDATE - Menu links
│   └── MainLayoutAble/Drawer/DrawerContent/Navigation/
│       └── index.js                     ← 🔧 UPDATE - Menu links
│
└── utils/
    └── navigationHelper.js              ← 🆕 NEW - Route utilities
```

---

## 📋 Tổng Quan Từng Phase

### **Phase 1: Navigation & Breadcrumb (Ngày 1-3, 24h)**

**File chi tiết:** [01_PHASE_1_NAVIGATION.md](./01_PHASE_1_NAVIGATION.md)

**Mục tiêu:**

- ✅ Chuẩn hóa routes về prefix `/quanlycongviec/`
- ✅ Update tất cả navigation calls (15-20 files)
- ✅ Tạo component `WorkManagementBreadcrumb`

**Deliverables:**

- [ ] Route mapping table (cũ → mới)
- [ ] Updated routes/index.js
- [ ] Updated all navigation calls
- [ ] WorkManagementBreadcrumb component
- [ ] Updated menu items

**Critical Path:** BLOCK tất cả phases khác

---

### **Phase 2: Mobile-First Redesign (Ngày 4-6, 28h)**

**File chi tiết:** [02_PHASE_2_MOBILE_REDESIGN.md](./02_PHASE_2_MOBILE_REDESIGN.md)

**Mục tiêu:**

- ✅ Responsive cho CongViecDetailPage
- ✅ Responsive cho CycleAssignmentDetailPage
- ✅ Tạo MobileDetailLayout component

**Deliverables:**

- [ ] MobileDetailLayout component
- [ ] Refactored CongViecDetailPage (responsive)
- [ ] Refactored CycleAssignmentDetailPage (responsive)
- [ ] Mobile test cases

**Dependencies:** Phase 1 phải xong (routes mới)

---

### **Phase 3: Unified Dashboard (Ngày 7-9, 23h)**

**File chi tiết:** [03_PHASE_3_UNIFIED_DASHBOARD.md](./03_PHASE_3_UNIFIED_DASHBOARD.md)

**Mục tiêu:**

- ✅ Tạo UnifiedDashboardPage (tích hợp 3 modules)
- ✅ Backend API cho dashboard summary
- ✅ Module-specific dashboards (CongViec, KPI, Ticket)

**Deliverables:**

- [ ] UnifiedDashboardPage
- [ ] CongViecDashboardPage (module level)
- [ ] Backend APIs (3 endpoints)
- [ ] Redux dashboard slice
- [ ] Summary cards (3 types)

**Dependencies:** Phase 1 phải xong (routes mới)

---

### **Phase 4: Testing & Deploy (Ngày 10-11, 10h)**

**File chi tiết:** [04_PHASE_4_TESTING_DEPLOY.md](./04_PHASE_4_TESTING_DEPLOY.md)

**Mục tiêu:**

- ✅ Test toàn bộ navigation flows
- ✅ Test mobile responsive
- ✅ Cross-browser testing
- ✅ Deploy & rollout

**Deliverables:**

- [ ] Test cases (17 scenarios)
- [ ] Test report
- [ ] Deployment checklist
- [ ] User communication plan

**Dependencies:** Tất cả phases 1-3 phải xong

---

## 📊 Chi Phí Chi Tiết

| Phase       | Frontend | Backend | Testing | Total   |
| ----------- | -------- | ------- | ------- | ------- |
| **Phase 1** | 20h      | 0h      | 4h      | **24h** |
| **Phase 2** | 22h      | 0h      | 6h      | **28h** |
| **Phase 3** | 15h      | 8h      | 0h      | **23h** |
| **Phase 4** | 0h       | 0h      | 10h     | **10h** |
| **TOTAL**   | **57h**  | **8h**  | **20h** | **85h** |

### Phân bổ theo skill:

- **Frontend Developer:** 57 giờ
- **Backend Developer:** 8 giờ (có thể làm song song)
- **QA/Tester:** 20 giờ

---

## 🎯 Success Criteria

### Functional Requirements

- [ ] Tất cả routes dùng prefix `/quanlycongviec/`
- [ ] Breadcrumb hiển thị đúng trên tất cả trang detail
- [ ] Detail pages responsive tốt trên mobile (320px-1920px)
- [ ] Unified dashboard load đủ 3 modules summary
- [ ] Không có broken links trong app

### Non-Functional Requirements

- [ ] Page load time < 2 seconds
- [ ] Mobile performance score > 80 (Lighthouse)
- [ ] Zero errors in production console
- [ ] Cross-browser compatible (Chrome, Safari, Firefox, Edge)
- [ ] Accessibility score > 90

---

## 🚨 Risks & Mitigation

| Risk                                | Probability | Impact    | Mitigation                                                   |
| ----------------------------------- | ----------- | --------- | ------------------------------------------------------------ |
| **Breaking links users bookmarked** | 🟡 Medium   | 🟡 Medium | Communicate 1 tuần trước, có fallback 404 page với hướng dẫn |
| **Mobile layout bugs**              | 🟡 Medium   | 🟢 Low    | Test kỹ trên 3 devices trước deploy                          |
| **Backend API performance**         | 🟢 Low      | 🟡 Medium | Cache dashboard data 5 phút, add DB indexes                  |
| **Redux state conflicts**           | 🟢 Low      | 🔴 High   | Clear state khi unmount, test kỹ transitions                 |

---

## 📞 Communication Plan

### Trước khi bắt đầu (Ngày 0)

- [ ] Thông báo team về route changes
- [ ] Document routes cũ vs mới
- [ ] Gửi email hướng dẫn update bookmarks

### Trong khi dev (Ngày 1-9)

- [ ] Daily standup update progress
- [ ] Demo mỗi phase xong
- [ ] Collect feedback từ stakeholders

### Trước deploy (Ngày 10)

- [ ] UAT với key users (3-5 người)
- [ ] Final walkthrough demo
- [ ] Prepare rollback plan

### Sau deploy (Ngày 11+)

- [ ] Monitor errors 24h đầu
- [ ] Collect user feedback
- [ ] Quick fix session nếu cần

---

## 🔗 Quick Links

- [Phase 1: Navigation & Breadcrumb](./01_PHASE_1_NAVIGATION.md)
- [Phase 2: Mobile Redesign](./02_PHASE_2_MOBILE_REDESIGN.md)
- [Phase 3: Unified Dashboard](./03_PHASE_3_UNIFIED_DASHBOARD.md)
- [Phase 4: Testing & Deploy](./04_PHASE_4_TESTING_DEPLOY.md)
- [Route Mapping Reference](./ROUTE_MAPPING_REFERENCE.md)
- [Checklist](./CHECKLIST.md)

---

## 📝 Change Log

| Date       | Version | Changes              | Author       |
| ---------- | ------- | -------------------- | ------------ |
| 08/01/2026 | 1.0     | Initial plan created | AI Assistant |

---

**Next Action:** Review master plan với team → Bắt đầu Phase 1
