# Task 0.3: Route Unification - Detailed Execution Plan

**Ngày tạo:** 2026-01-09  
**Trạng thái:** 🔴 READY TO START  
**Thời gian dự kiến:** 2.5 - 3 giờ  
**Phụ thuộc:** ✅ Task 0.1 & 0.2 đã hoàn thành

---

## 📋 Ngữ Cảnh

### Đã Hoàn Thành (Task 0.1 & 0.2)

- ✅ Created `src/utils/navigationHelper.js` - 40+ route builder functions
- ✅ Created `src/features/QuanLyCongViec/components/WorkManagementBreadcrumb.js`
- ✅ Git committed & pushed

### Vấn Đề Hiện Tại

Routes QuanLyCongViec hiện tại **RẤT LỘN XẠO**, phân tán ở nhiều patterns:

```javascript
// Pattern 1: /quanlycongviec/* (most routes)
/quanlycongviec/kpi/xem
/quanlycongviec/nhiemvu-thuongquy
/quanlycongviec/giao-nhiem-vu-chu-ky

// Pattern 2: /quan-ly-cong-viec/* (dash-case)
/quan-ly-cong-viec/nhan-vien/:nhanVienId

// Pattern 3: /workmanagement/*
/workmanagement/nhanvien
/workmanagement/nhanvien/:nhanVienId/quanly

// Pattern 4: /congviec/* (no prefix!)
/congviec/:id

// Pattern 5: /cong-viec-* (mind map routes)
/cong-viec-mind-map
/cong-viec-tree-view
/cong-viec-hierarchical
/cong-viec-hierarchical-dynamic

// Pattern 6: /yeu-cau/* (separate module)
/yeu-cau
/yeu-cau/:id
/yeu-cau/toi-gui
/yeu-cau/xu-ly
/yeu-cau/dieu-phoi
/yeu-cau/quan-ly-khoa
/yeu-cau/admin/cau-hinh-khoa
/yeu-cau/admin/danh-muc
/yeu-cau/admin/ly-do-tu-choi

// Pattern 7: /thong-bao/* (notifications)
/thong-bao
/cai-dat/thong-bao
```

### Mục Tiêu Task 0.3

**Unify TẤT CẢ routes về single pattern: `/quanlycongviec/*`**

**Lý do chọn Option 1 (Immediate Replace, no redirects):**

- App đang dev (chưa có users production)
- Muốn codebase clean từ đầu
- Tránh technical debt
- Không có external links cần preserve

---

## 🗺️ Route Mapping Table (Old → New)

### 1. Công Việc (CongViec)

| Old Route                                  | New Route                                       | Component                          | Notes                                      |
| ------------------------------------------ | ----------------------------------------------- | ---------------------------------- | ------------------------------------------ |
| `/quan-ly-cong-viec/nhan-vien/:nhanVienId` | `/quanlycongviec/congviec/nhanvien/:nhanVienId` | `CongViecByNhanVienPage`           | ⚠️ Rename to `CongViecListPage` in Phase 2 |
| `/congviec/:id`                            | `/quanlycongviec/congviec/:id`                  | `CongViecDetailPage`               | ❌ No prefix currently                     |
| `/cong-viec-mind-map`                      | `/quanlycongviec/congviec/mind-map`             | `TaskMindMapHierarchicalPage`      | Optional feature                           |
| `/cong-viec-tree-view`                     | `/quanlycongviec/congviec/tree-view`            | `TaskMindMapHierarchicalPage`      | Same as mind-map                           |
| `/cong-viec-tree-enhanced`                 | `/quanlycongviec/congviec/tree-enhanced`        | `TaskMindMapTreeEnhancedPage`      | Optional feature                           |
| `/cong-viec-hierarchical`                  | `/quanlycongviec/congviec/hierarchical`         | `TaskMindMapHierarchicalPage`      | Optional feature                           |
| `/cong-viec-hierarchical-dynamic`          | `/quanlycongviec/congviec/hierarchical-dynamic` | `CongViecHierarchyTreeDynamicPage` | Optional feature                           |

### 2. KPI

| Old Route                                | New Route                                | Component           | Notes              |
| ---------------------------------------- | ---------------------------------------- | ------------------- | ------------------ |
| `/quanlycongviec/kpi/danh-gia-nhan-vien` | `/quanlycongviec/kpi/danh-gia-nhan-vien` | `KPIEvaluationPage` | ✅ Already correct |
| `/quanlycongviec/kpi/tu-danh-gia`        | `/quanlycongviec/kpi/tu-danh-gia`        | `TuDanhGiaKPIPage`  | ✅ Already correct |
| `/quanlycongviec/kpi/xem`                | `/quanlycongviec/kpi/xem`                | `XemKPIPage`        | ✅ Already correct |
| `/quanlycongviec/kpi/bao-cao`            | `/quanlycongviec/kpi/bao-cao`            | `BaoCaoKPIPage`     | ✅ Already correct |
| `/quanlycongviec/kpi/chu-ky`             | `/quanlycongviec/kpi/chu-ky`             | `ChuKyDanhGiaList`  | ✅ Already correct |
| `/quanlycongviec/kpi/chu-ky/:id`         | `/quanlycongviec/kpi/chu-ky/:id`         | `ChuKyDanhGiaView`  | ✅ Already correct |

### 3. Nhiệm Vụ Thường Quy

| Old Route                           | New Route                           | Component              | Notes              |
| ----------------------------------- | ----------------------------------- | ---------------------- | ------------------ |
| `/quanlycongviec/nhiemvu-thuongquy` | `/quanlycongviec/nhiemvu-thuongquy` | `NhiemVuThuongQuyList` | ✅ Already correct |

### 4. Giao Nhiệm Vụ

| Old Route                                          | New Route                                  | Component                   | Notes            |
| -------------------------------------------------- | ------------------------------------------ | --------------------------- | ---------------- |
| `/quanlycongviec/giao-nhiem-vu-chu-ky`             | `/quanlycongviec/giao-nhiemvu`             | `CycleAssignmentListPage`   | 📝 Simplify path |
| `/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID` | `/quanlycongviec/giao-nhiemvu/:NhanVienID` | `CycleAssignmentDetailPage` | 📝 Simplify path |

### 5. Yêu Cầu / Tickets

| Old Route                      | New Route                                    | Component                | Notes                  |
| ------------------------------ | -------------------------------------------- | ------------------------ | ---------------------- |
| `/yeu-cau`                     | `/quanlycongviec/yeucau`                     | `YeuCauPage`             | ❌ No prefix currently |
| `/yeu-cau/:id`                 | `/quanlycongviec/yeucau/:id`                 | `YeuCauDetailPage`       | ❌ No prefix currently |
| `/yeu-cau/toi-gui`             | `/quanlycongviec/yeucau/toi-gui`             | `YeuCauToiGuiPage`       | Role-based view        |
| `/yeu-cau/xu-ly`               | `/quanlycongviec/yeucau/xu-ly`               | `YeuCauXuLyPage`         | Role-based view        |
| `/yeu-cau/dieu-phoi`           | `/quanlycongviec/yeucau/dieu-phoi`           | `YeuCauDieuPhoiPage`     | Role-based view        |
| `/yeu-cau/quan-ly-khoa`        | `/quanlycongviec/yeucau/quan-ly-khoa`        | `YeuCauQuanLyKhoaPage`   | Role-based view        |
| `/yeu-cau/admin/cau-hinh-khoa` | `/quanlycongviec/yeucau/admin/cau-hinh-khoa` | `CauHinhKhoaAdminPage`   | Admin route            |
| `/yeu-cau/admin/danh-muc`      | `/quanlycongviec/yeucau/admin/danh-muc`      | `DanhMucYeuCauAdminPage` | Admin route            |
| `/yeu-cau/admin/ly-do-tu-choi` | `/quanlycongviec/yeucau/admin/ly-do-tu-choi` | `LyDoTuChoiAdminPage`    | Admin route            |

### 6. Quản Lý Nhân Viên

| Old Route                                     | New Route                                       | Component            | Notes           |
| --------------------------------------------- | ----------------------------------------------- | -------------------- | --------------- |
| `/workmanagement/nhanvien`                    | `/quanlycongviec/quan-ly-nhan-vien`             | `NhanVienList`       | ❌ Wrong prefix |
| `/workmanagement/nhanvien/:nhanVienId/quanly` | `/quanlycongviec/quan-ly-nhan-vien/:nhanVienId` | `QuanLyNhanVienPage` | ❌ Wrong prefix |

### 7. Nhóm Việc User

| Old Route                       | New Route                       | Component          | Notes              |
| ------------------------------- | ------------------------------- | ------------------ | ------------------ |
| `/quanlycongviec/nhomviec-user` | `/quanlycongviec/nhomviec-user` | `NhomViecUserList` | ✅ Already correct |

### 8. Thông Báo

| Old Route            | New Route                           | Component              | Notes                  |
| -------------------- | ----------------------------------- | ---------------------- | ---------------------- |
| `/thong-bao`         | `/quanlycongviec/thong-bao`         | `NotificationPage`     | ❌ No prefix currently |
| `/cai-dat/thong-bao` | `/quanlycongviec/cai-dat/thong-bao` | `NotificationSettings` | ❌ No prefix currently |

**Admin Notification Routes (keep outside - not part of QuanLyCongViec):**

- `/admin/notification-templates` → Keep as is (admin-only)
- `/admin/notification-types` → Keep as is (admin-only)

---

## 📝 Execution Checklist

### Phase 0.3A: Backup & Analysis (30 min)

- [ ] **Step 1: Create git backup**

  ```bash
  cd d:\project\webBV\fe-bcgiaobanbvt
  git add .
  git commit -m "Checkpoint: Before Phase 0.3 route unification"
  git push
  ```

- [ ] **Step 2: Create backup file**

  ```bash
  cp src/routes/index.js src/routes/index.js.backup.20260109
  ```

- [ ] **Step 3: Audit current routes**

  ```bash
  # Count total QuanLyCongViec routes
  grep -E "path=\".*quanlycongviec|quan-ly-cong-viec|workmanagement|/congviec|/yeu-cau|/thong-bao|cong-viec-" src/routes/index.js | wc -l

  # Expected: ~30 routes to unify
  ```

- [ ] **Step 4: Verify all component imports exist**
  ```bash
  # Check key components
  ls -la src/features/QuanLyCongViec/CongViec/CongViecByNhanVienPage.js
  ls -la src/features/QuanLyCongViec/CongViec/CongViecDetailPage.js
  ls -la src/features/QuanLyCongViec/Ticket/YeuCauPage.js
  ```

---

### Phase 0.3B: Implement New Routes (1.5 hours)

- [ ] **Step 1: Open src/routes/index.js**

- [ ] **Step 2: Find the MainLayoutAble route section** (line ~186)

  ```javascript
  <Route
    element={
      <AuthRequire>
        <ThemeCustomization>
          <MainLayoutAble />
        </ThemeCustomization>
      </AuthRequire>
    }
  >
  ```

- [ ] **Step 3: Add new unified QuanLyCongViec routes**

  Insert BEFORE all existing scattered routes:

  ```javascript
  {
    /* ========================================== */
  }
  {
    /* QuanLyCongViec Module - Unified Routes    */
  }
  {
    /* ========================================== */
  }
  <Route path="/quanlycongviec">
    {/* Root redirect */}
    <Route index element={<Navigate to="dashboard" replace />} />
    <Route path="dashboard" element={<UnifiedDashboardPage />} />

    {/* Công Việc */}
    <Route path="congviec">
      <Route path="dashboard" element={<CongViecDashboardPage />} />
      <Route path="nhanvien/:nhanVienId" element={<CongViecByNhanVienPage />} />
      <Route path=":id" element={<CongViecDetailPage />} />
      <Route path="mind-map" element={<TaskMindMapHierarchicalPage />} />
      <Route path="tree-view" element={<TaskMindMapHierarchicalPage />} />
      <Route path="tree-enhanced" element={<TaskMindMapTreeEnhancedPage />} />
      <Route path="hierarchical" element={<TaskMindMapHierarchicalPage />} />
      <Route
        path="hierarchical-dynamic"
        element={<CongViecHierarchyTreeDynamicPage />}
      />
    </Route>

    {/* KPI */}
    <Route path="kpi">
      <Route index element={<Navigate to="xem" replace />} />
      <Route path="dashboard" element={<KPIDashboard />} />
      <Route path="xem" element={<XemKPIPage />} />
      <Route path="tu-danh-gia" element={<TuDanhGiaKPIPage />} />
      <Route path="danh-gia-nhan-vien" element={<KPIEvaluationPage />} />
      <Route
        path="bao-cao"
        element={
          <AdminRequire>
            <BaoCaoKPIPage />
          </AdminRequire>
        }
      />
      <Route
        path="chu-ky"
        element={
          <AdminRequire>
            <ChuKyDanhGiaList />
          </AdminRequire>
        }
      />
      <Route
        path="chu-ky/:id"
        element={
          <AdminRequire>
            <ChuKyDanhGiaView />
          </AdminRequire>
        }
      />
    </Route>

    {/* Nhiệm vụ thường quy */}
    <Route path="nhiemvu-thuongquy">
      <Route index element={<NhiemVuThuongQuyList />} />
    </Route>

    {/* Giao nhiệm vụ */}
    <Route path="giao-nhiemvu">
      <Route index element={<CycleAssignmentListPage />} />
      <Route path=":NhanVienID" element={<CycleAssignmentDetailPage />} />
    </Route>

    {/* Yêu cầu/Tickets */}
    <Route path="yeucau">
      <Route index element={<YeuCauPage />} />
      <Route path=":id" element={<YeuCauDetailPage />} />
      <Route path="toi-gui" element={<YeuCauToiGuiPage />} />
      <Route path="xu-ly" element={<YeuCauXuLyPage />} />
      <Route path="dieu-phoi" element={<YeuCauDieuPhoiPage />} />
      <Route path="quan-ly-khoa" element={<YeuCauQuanLyKhoaPage />} />
      <Route
        path="admin/cau-hinh-khoa"
        element={
          <QuanLyKhoaOrAdminRequire>
            <CauHinhKhoaAdminPage />
          </QuanLyKhoaOrAdminRequire>
        }
      />
      <Route
        path="admin/danh-muc"
        element={
          <QuanLyKhoaOrAdminRequire>
            <DanhMucYeuCauAdminPage />
          </QuanLyKhoaOrAdminRequire>
        }
      />
      <Route
        path="admin/ly-do-tu-choi"
        element={
          <AdminRequire>
            <LyDoTuChoiAdminPage />
          </AdminRequire>
        }
      />
    </Route>

    {/* Quản lý nhân viên */}
    <Route path="quan-ly-nhan-vien">
      <Route index element={<NhanVienList />} />
      <Route path=":nhanVienId" element={<QuanLyNhanVienPage />} />
    </Route>

    {/* Nhóm việc user */}
    <Route path="nhomviec-user" element={<NhomViecUserList />} />

    {/* Thông báo */}
    <Route path="thong-bao">
      <Route index element={<NotificationPage />} />
    </Route>

    {/* Cài đặt */}
    <Route path="cai-dat">
      <Route path="thong-bao" element={<NotificationSettings />} />
    </Route>
  </Route>;
  ```

- [ ] **Step 4: DELETE all old scattered routes**

  Search and DELETE these lines (around lines 295-375):

  ```javascript
  // ❌ DELETE:
  <Route path="/quanlycongviec/nhomviec-user" element={<NhomViecUserList />} />
  <Route path="/quanlycongviec/nhiemvu-thuongquy" element={<NhiemVuThuongQuyList />} />
  <Route path="/quanlycongviec/kpi/danh-gia-nhan-vien" element={<KPIEvaluationPage />} />
  <Route path="/quanlycongviec/kpi/tu-danh-gia" element={<TuDanhGiaKPIPage />} />
  <Route path="/quanlycongviec/kpi/xem" element={<XemKPIPage />} />
  <Route path="/quanlycongviec/kpi/bao-cao" element={<AdminRequire><BaoCaoKPIPage /></AdminRequire>} />
  <Route path="/quanlycongviec/kpi/chu-ky" element={<AdminRequire><ChuKyDanhGiaList /></AdminRequire>} />
  <Route path="/quanlycongviec/kpi/chu-ky/:id" element={<AdminRequire><ChuKyDanhGiaView /></AdminRequire>} />
  <Route path="/workmanagement/nhanvien" element={<NhanVienList />} />
  <Route path="/workmanagement/nhanvien/:nhanVienId/quanly" element={<QuanLyNhanVienPage />} />
  <Route path="/quanlycongviec/giao-nhiem-vu-chu-ky" element={<CycleAssignmentListPage />} />
  <Route path="/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID" element={<CycleAssignmentDetailPage />} />
  <Route path="/quan-ly-cong-viec/nhan-vien/:nhanVienId" element={<CongViecByNhanVienPage />} />
  <Route path="/congviec/:id" element={<CongViecDetailPage />} />
  <Route path="/cong-viec-mind-map" element={<TaskMindMapHierarchicalPage />} />
  <Route path="/cong-viec-tree-view" element={<TaskMindMapHierarchicalPage />} />
  <Route path="/cong-viec-tree-enhanced" element={<TaskMindMapTreeEnhancedPage />} />
  <Route path="/cong-viec-hierarchical" element={<TaskMindMapHierarchicalPage />} />
  <Route path="/cong-viec-hierarchical-dynamic" element={<CongViecHierarchyTreeDynamicPage />} />
  <Route path="/thong-bao" element={<NotificationPage />} />
  <Route path="/cai-dat/thong-bao" element={<NotificationSettings />} />
  <Route path="/yeu-cau" element={<YeuCauPage />} />
  <Route path="/yeu-cau/:id" element={<YeuCauDetailPage />} />
  <Route path="/yeu-cau/toi-gui" element={<YeuCauToiGuiPage />} />
  <Route path="/yeu-cau/xu-ly" element={<YeuCauXuLyPage />} />
  <Route path="/yeu-cau/dieu-phoi" element={<YeuCauDieuPhoiPage />} />
  <Route path="/yeu-cau/quan-ly-khoa" element={<YeuCauQuanLyKhoaPage />} />
  <Route path="/yeu-cau/admin/cau-hinh-khoa" element={<QuanLyKhoaOrAdminRequire><CauHinhKhoaAdminPage /></QuanLyKhoaOrAdminRequire>} />
  <Route path="/yeu-cau/admin/danh-muc" element={<QuanLyKhoaOrAdminRequire><DanhMucYeuCauAdminPage /></QuanLyKhoaOrAdminRequire>} />
  <Route path="/yeu-cau/admin/ly-do-tu-choi" element={<AdminRequire><LyDoTuChoiAdminPage /></AdminRequire>} />
  ```

- [ ] **Step 5: Add missing imports** (if dashboard pages not exist yet)

  ```javascript
  // At top of file - ONLY if these pages don't exist yet, add placeholders
  // const UnifiedDashboardPage = () => <div>Dashboard (Phase 2)</div>;
  // const CongViecDashboardPage = () => <div>CongViec Dashboard (Phase 2)</div>;
  // const KPIDashboard = () => <div>KPI Dashboard (Phase 2)</div>;
  ```

- [ ] **Step 6: Save file**

- [ ] **Step 7: Check syntax errors**
  ```bash
  npm run build
  # Should compile without errors
  ```

---

### Phase 0.3C: Testing (30 min)

- [ ] **Step 1: Start dev server**

  ```bash
  npm start
  ```

- [ ] **Step 2: Manual route testing**

  Open browser DevTools → Console (check for errors)

  **Test CongViec routes:**

  - [ ] Navigate to `http://localhost:3000/quanlycongviec` → Should redirect to `/quanlycongviec/dashboard`
  - [ ] Navigate to `http://localhost:3000/quanlycongviec/congviec/nhanvien/123` → Should show CongViecByNhanVienPage
  - [ ] Navigate to `http://localhost:3000/quanlycongviec/congviec/456` → Should show CongViecDetailPage
  - [ ] Test old URL `http://localhost:3000/congviec/456` → Should 404 ✅ (expected)
  - [ ] Test old URL `http://localhost:3000/quan-ly-cong-viec/nhan-vien/123` → Should 404 ✅ (expected)

  **Test KPI routes:**

  - [ ] Navigate to `http://localhost:3000/quanlycongviec/kpi/xem` → Should show XemKPIPage
  - [ ] Navigate to `http://localhost:3000/quanlycongviec/kpi/tu-danh-gia` → Should show TuDanhGiaKPIPage

  **Test YeuCau routes:**

  - [ ] Navigate to `http://localhost:3000/quanlycongviec/yeucau` → Should show YeuCauPage
  - [ ] Navigate to `http://localhost:3000/quanlycongviec/yeucau/789` → Should show YeuCauDetailPage
  - [ ] Test old URL `http://localhost:3000/yeu-cau` → Should 404 ✅ (expected)

  **Test NhanVien routes:**

  - [ ] Navigate to `http://localhost:3000/quanlycongviec/quan-ly-nhan-vien` → Should show NhanVienList
  - [ ] Test old URL `http://localhost:3000/workmanagement/nhanvien` → Should 404 ✅ (expected)

  **Test Thong Bao routes:**

  - [ ] Navigate to `http://localhost:3000/quanlycongviec/thong-bao` → Should show NotificationPage
  - [ ] Test old URL `http://localhost:3000/thong-bao` → Should 404 ✅ (expected)

- [ ] **Step 3: Browser navigation testing**

  - [ ] Click browser back button → Should work
  - [ ] Click browser forward button → Should work
  - [ ] Refresh page → Should stay on same route

- [ ] **Step 4: Check console for errors**
  - [ ] No React errors
  - [ ] No 404 errors (except for intentional old URLs)
  - [ ] No "Route not found" warnings

---

### Phase 0.3D: Commit (15 min)

- [ ] **Step 1: Review changes**

  ```bash
  git diff src/routes/index.js
  ```

- [ ] **Step 2: Verify no unintended changes**

  ```bash
  git status
  # Should only show src/routes/index.js modified
  ```

- [ ] **Step 3: Commit with clear message**

  ```bash
  git add src/routes/index.js
  git commit -m "Phase 0.3: Unify all QuanLyCongViec routes under /quanlycongviec/*

  ```

- Consolidated 30+ scattered routes into single nested structure
- Old patterns removed: /quan-ly-cong-viec/_, /workmanagement/_, /congviec/:id, /yeu-cau/\*, /thong-bao
- New pattern: All under /quanlycongviec/\* with nested structure
- Simplified paths: /giao-nhiem-vu-chu-ky → /giao-nhiemvu
- Breaking change: Old URLs will 404 (intentional - app in dev)

Ready for Task 0.4: Update component navigation calls"

````

- [ ] **Step 4: Push to remote**
```bash
git push
````

---

## ✅ Success Criteria

Task 0.3 is COMPLETE when:

- [x] All QuanLyCongViec routes under `/quanlycongviec/*` prefix
- [x] Old scattered routes deleted (no `/quan-ly-cong-viec`, `/workmanagement`, `/congviec/:id`, `/yeu-cau`, `/thong-bao`)
- [x] Nested route structure implemented
- [x] All routes manually tested
- [x] No console errors during navigation
- [x] Browser back/forward works
- [x] Code committed with clear message
- [x] Backup file created (`index.js.backup.20260109`)

---

## 🚨 Rollback Plan (If Something Goes Wrong)

### Quick Rollback

```bash
# If testing fails, immediately rollback:
cp src/routes/index.js.backup.20260109 src/routes/index.js
npm start
# App should work with old routes again
```

### Git Rollback

```bash
# If already committed:
git log --oneline -5  # Find commit hash before Phase 0.3
git revert <commit-hash>
git push
```

---

## 📊 Progress Tracking

**Started:** ******\_******  
**Phase 0.3A Complete:** ******\_******  
**Phase 0.3B Complete:** ******\_******  
**Phase 0.3C Complete:** ******\_******  
**Phase 0.3D Complete:** ******\_******  
**Total Time:** ******\_******

**Issues Encountered:**

- Issue 1: ******\_******
- Issue 2: ******\_******

**Notes:**

---

---

---

## 🔜 Next Steps After Task 0.3

**Task 0.4: Update Navigation Calls (40+ files)**

- Search for hardcoded navigate() strings
- Replace with WorkRoutes helper calls
- Update Link href props
- Test each component

**File to load in new conversation:**

- `docs/UNIFIED_PLAN_2026/CONTEXT_FOR_NEW_CONVERSATION.md` - Full context
- `docs/UNIFIED_PLAN_2026/PHASE_0_NAVIGATION.md` - Phase 0 details
- This file (TASK_0.3_ROUTE_UNIFICATION.md) - Execution results

---

**Bắt đầu khi nào?** 🚀
