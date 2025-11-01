# Legacy Assignment System Removed - October 26, 2025

## Overview

This folder contains the archived legacy assignment system components that were replaced by the cycle-based assignment system.

## What Was Removed

### Frontend Components (Archived Here)

- `GiaoNhiemVuPageNew.js` - Old assignment page (non-cycle version)
- `old-components/GiaoNhiemVuPage.js` - Even older assignment page
- `old-components/EmployeeList.js` - Employee selection component
- `old-components/DutyPicker.js` - Duty selection component
- `old-components/AssignmentTable.js` - Assignment display table

### Routes Removed

- `/quanlycongviec/giao-nhiem-vu/:NhanVienID` - Old assignment route
- `/quanlycongviec/giao-nhiem-vu-old/:NhanVienID` - Backup old route

### Menu Items Removed

- "Phân công cho nhân viên của tôi" menu item pointing to old route

### Backend API Endpoints Removed (Permanently Deleted)

#### Routes (giaoNhiemVu.api.js)

- `GET /:NhanVienID/nhan-vien` - Get managed employees
- `GET /nhan-vien/:employeeId/nhiem-vu` - Get duties by employee
- `GET /assignments` - Get assignments by employee
- `GET /assignments/totals` - Get assignment totals
- `POST /assignments` - Assign single duty
- `POST /assignments/bulk` - Bulk assign
- `DELETE /assignments/:assignmentId` - Unassign by ID
- `DELETE /assignments` - Unassign by pair
- `PUT /nhan-vien/:employeeId/assignments` - Batch update assignments

#### Controller Methods (giaoNhiemVu.controller.js)

- `getManagedEmployees`
- `getDutiesByEmployee`
- `getAssignmentsByEmployee`
- `getAssignmentTotals`
- `assignOne`
- `bulkAssign`
- `unassignById`
- `unassignByPair`
- `batchUpdateEmployeeAssignments`

#### Service Methods (giaoNhiemVu.service.js)

- `service.getManagedEmployees`
- `service.getDutiesByEmployee`
- `service.getAssignmentsByEmployee`
- `service.getAssignmentTotals`
- `service.assignOne`
- `service.bulkAssign`
- `service.unassignById`
- `service.unassignByPair`
- `service.batchUpdateEmployeeAssignments`
- Helper: `ensureSameKhoa` function

**Total Backend Code Removed: ~600 lines**

## New Cycle-Based System (Active)

### Routes

- `/quanlycongviec/giao-nhiem-vu-chu-ky` - LIST view (all employees)
- `/quanlycongviec/giao-nhiem-vu-chu-ky/:NhanVienID` - DETAIL view (one employee)

### Components

- `CycleAssignmentListPage.js` - List of employees with cycle stats
- `CycleAssignmentDetailPage.js` - Detail assignment page for one employee
- `cycleAssignmentSlice.js` - Redux state management

### Backend Endpoints (Active)

- `GET /employees-with-cycle-stats?chuKyId=xxx` - Get employees with cycle stats
- `GET /nhan-vien/:employeeId/by-cycle?chuKyId=xxx` - Get assignments by cycle
- `PUT /nhan-vien/:employeeId/cycle-assignments` - Batch update cycle assignments
- `POST /nhan-vien/:employeeId/copy-cycle` - Copy from previous cycle

## Key Differences

### Legacy System (Removed)

- No cycle awareness (ChuKyDanhGiaID not required)
- Direct assignment without cycle context
- Totals calculated across all time
- Complex employee-duty pairing logic

### New Cycle-Based System (Active)

- All assignments require ChuKyDanhGiaID
- Cycle-aware filtering and statistics
- Copy assignments between cycles
- Simpler two-column layout (available ↔ assigned)

## Reason for Removal

The legacy assignment system didn't support cycle-based workflow, which is now fundamental to the KPI evaluation system. All assignments must be tied to evaluation cycles (ChuKyDanhGia) for proper KPI scoring.

## Migration Notes

- **No database migration needed** - Product still in development
- **No deprecation marks** - Permanent deletion for clean codebase
- **All legacy code removed from BE** - No backward compatibility needed

## Related Changes

See also:

- Previous cleanup: `_archive_tieu-chi_2025-10-24/` (Master criteria system removed)
- Previous cleanup: `_archive_2025-10-24/` (Old KPI dashboard removed)

This completes the transition to fully cycle-based architecture for both assignment and evaluation systems.
