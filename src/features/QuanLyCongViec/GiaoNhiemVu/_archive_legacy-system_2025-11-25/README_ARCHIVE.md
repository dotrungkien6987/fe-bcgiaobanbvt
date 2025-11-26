# Legacy System Archived - November 25, 2025

## Overview

This folder contains the **LEGACY permanent assignment system** that was replaced by the **cycle-based assignment system** (V3.0).

## What Was Archived

### ❌ ORPHANED - Not used by any active routes

1. **giaoNhiemVuSlice.js** (542 lines)
   - Redux slice for permanent assignments (non-cycle)
   - Used by deprecated components only
   - Replaced by: \cycleAssignmentSlice.js\ (260 lines)

2. **GiaoNhiemVuRoutes.js** (21 lines)
   - Route definitions for legacy system
   - **BROKEN**: Imports \GiaoNhiemVuPageNew.js\ which doesn't exist
   - Not imported in main \src/routes/index.js\
   - Replaced by: Direct routes in \src/routes/index.js\:
     - \/quanlycongviec/giao-nhiem-vu-chu-ky\ → CycleAssignmentListPage
     - \/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID\ → CycleAssignmentDetailPage

3. **ASSIGNMENT_GUIDE.md** (326 lines)
   - Documentation for legacy system
   - **INCORRECT**: Documents deprecated routes and components
   - Should be replaced with cycle-based system docs

### 🗑️ Components (All use giaoNhiemVuSlice - Legacy)

**components/ folder (5 files, ~1,621 lines total):**

1. **AssignDutiesDialog.js** (348 lines)
   - Batch assign/update dialog for permanent assignments
   - Uses: \etchDutiesByEmployee\, \atchUpdateAssignments\ from giaoNhiemVuSlice
   - Replaced by: Built-in UI in CycleAssignmentDetailPage (1,298 lines)

2. **ViewAssignmentsDialog.js** (225 lines)
   - Read-only view of assignments
   - Uses: \etchAssignmentsByEmployee\ from giaoNhiemVuSlice
   - Not used by cycle pages

3. **EmployeeOverviewTable.js** (561 lines)
   - Main table for employee list (legacy system)
   - Uses: \emoveAllAssignments\ from giaoNhiemVuSlice
   - Replaced by: Built-in table in CycleAssignmentListPage (745 lines)

4. **AssignSingleDutyButton.js** (200 lines)
   - Single duty assignment button
   - Uses: \ssignDuty\, \etchDutiesByEmployee\ from giaoNhiemVuSlice
   - Not used by cycle pages

5. **CopyAssignmentsDialog.js** (287 lines)
   - Copy assignments between employees
   - Likely uses giaoNhiemVuSlice
   - Copy functionality rebuilt in cycle system

**Total Archived:** 2,184 lines of unused legacy code

---

## Current Active System (V3.0 - Cycle-Based)

### ✅ ACTIVE Routes (in production)

**Main Routes File:** \src/routes/index.js:320-329\

\\\javascript
// List view: All employees with cycle stats
<Route
  path="/quanlycongviec/giao-nhiem-vu-chu-ky"
  element={<CycleAssignmentListPage />}
/>

// Detail view: Assign tasks to one employee for selected cycle
<Route
  path="/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID"
  element={<CycleAssignmentDetailPage />}
/>
\\\

### ✅ ACTIVE Files (still in use)

1. **cycleAssignmentSlice.js** (260 lines)
   - Redux slice for cycle-based assignments
   - Thunks: \getAssignmentsByCycle\, \atchUpdateCycleAssignments\, \copyFromPreviousCycle\
   - Used by: CycleAssignmentListPage, CycleAssignmentDetailPage

2. **CycleAssignmentListPage.js** (745 lines)
   - Employee list view with cycle selection
   - Directly fetches data via apiService (no legacy slice)
   - Full UI implementation (no legacy components)

3. **CycleAssignmentDetailPage.js** (1,298 lines)
   - Two-column assignment UI
   - Uses cycleAssignmentSlice only
   - Full UI implementation (no legacy components)

---

## Why Archived?

### 1. Legacy System Not Used
- Routes \/quanlycongviec/giao-nhiem-vu/:NhanVienID\ **NOT in \src/routes/index.js\**
- \GiaoNhiemVuRoutes.js\ **NOT imported** anywhere
- Components depend on \giaoNhiemVuSlice\ which is orphaned

### 2. Cycle System is Complete
- CycleAssignmentListPage (745 lines) has own table implementation
- CycleAssignmentDetailPage (1,298 lines) has own assignment UI
- No imports of legacy components found in cycle pages

### 3. Documentation Mismatch
- \ASSIGNMENT_GUIDE.md\ documents **wrong system** (legacy)
- Leads developers to use deprecated components
- Should document cycle-based system instead

---

## Migration Notes

### Backend API Status

**Cycle-Based APIs (ACTIVE):**
- \GET /api/workmanagement/giao-nhiem-vu/employees-with-cycle-stats?chuKyId=xxx\
- \GET /api/workmanagement/giao-nhiem-vu/nhan-vien/:id/by-cycle?chuKyId=xxx\
- \PUT /api/workmanagement/giao-nhiem-vu/nhan-vien/:id/cycle-assignments\
- \POST /api/workmanagement/giao-nhiem-vu/nhan-vien/:id/copy-cycle\

**Legacy APIs (May still exist):**
- According to \_archive_old-assignment_2025-10-26/LEGACY_ASSIGNMENT_REMOVED.md\
- Some legacy endpoints were deleted in October 2025
- \giaoNhiemVuSlice\ may still call deleted endpoints

### Data Model

**Active:** \NhanVienNhiemVu\ model with \ChuKyDanhGiaID\ field
- Supports cycle-based assignments (\ChuKyDanhGiaID != null\)
- Supports permanent assignments (\ChuKyDanhGiaID = null\)

---

## Next Steps

### 1. Documentation (HIGH PRIORITY)

Create new docs for cycle-based system:
- README.md (~600 lines) - Entry point, features, quick start
- ARCHITECTURE.md (~700 lines) - Frontend/backend architecture
- WORKFLOW.md (~500 lines) - Assignment lifecycle, validation rules
- API_REFERENCE.md (~800 lines) - 6 cycle endpoints + 2 self-assessment
- UI_COMPONENTS.md (~600 lines) - CycleAssignmentListPage, CycleAssignmentDetailPage
- INTEGRATION.md (~450 lines) - Links to KPI, ChuKyDanhGia, NhiemVuThuongQuy

**Total:** ~4,350 lines (vs current 326 lines legacy docs = 13.3x increase)

### 2. Backend Cleanup (Optional)

Verify if legacy API endpoints still exist:
- Check \giaobanbv-be/modules/workmanagement/routes/giaoNhiemVu.api.js\
- If legacy endpoints remain, mark as deprecated or remove

### 3. Audit Report

See: \AUDIT_REPORT_V2.0.md\ (1,350+ lines)
- Score: 48/100 (needs major work)
- Main issue: 73% of code undocumented (cycle system)

---

## Archive History

### _archive_old-assignment_2025-10-26/
**Created:** October 26, 2025  
**Contents:** Even older assignment system
- GiaoNhiemVuPageNew.js
- GiaoNhiemVuPage.js
- EmployeeList.js, DutyPicker.js, AssignmentTable.js

### _archive_legacy-system_2025-11-25/ (THIS FOLDER)
**Created:** November 25, 2025  
**Contents:** Legacy permanent assignment system
- giaoNhiemVuSlice.js (542 lines)
- GiaoNhiemVuRoutes.js (21 lines)
- components/ (5 files, 1,621 lines)
- ASSIGNMENT_GUIDE.md (326 lines)

**Total Archived:** 2,510 lines

---

## Contact

For questions about archived code:
- Check \AUDIT_REPORT_V2.0.md\ for full analysis
- See cycle system in: \../CycleAssignmentListPage.js\, \../CycleAssignmentDetailPage.js\
- Contact: Development Team

---

**Status:** ✅ Archive Complete  
**Date:** November 25, 2025  
**Reason:** Legacy system not used by production routes
