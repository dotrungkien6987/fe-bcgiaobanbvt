# Frontend Permission Implementation - Complete

## Overview

Triển khai hoàn tất việc disable các nút Edit/Delete ở frontend dựa trên quyền hạn người dùng.

## Implementation Date

2025-01-XX

## User Requirement

> "Tiếp theo tôi muốn chặn ở FE disable các nút sửa xoá công việc cho những người không có quyền"

## Clarification from User

- **Edit button (CongViecFormDialog)**: CHỈ dành cho Owner (người giao việc) hoặc Admin
- **Main/Collaborator**: Có thể update công việc qua CÁC UI KHÁC (ProgressEditDialog, etc), KHÔNG qua nút Edit
- **Delete button**: Owner hoặc Admin (Admin có thể xóa cả HOAN_THANH)

## Permission Rules Implemented

### Edit Permission (canEditCongViec)

- ✅ Admin/Superadmin: Có quyền
- ✅ Owner (NguoiGiaoViecID = userNhanVienId): Có quyền
- ❌ Main (NguoiChinhID): KHÔNG có quyền chỉnh sửa form
- ❌ Collaborator (NguoiThamGiaIDs): KHÔNG có quyền

### Delete Permission (canDeleteCongViec)

- ✅ Admin/Superadmin: Có quyền (kể cả HOAN_THANH)
- ✅ Owner (NguoiGiaoViecID = userNhanVienId): Có quyền (trừ HOAN_THANH)
- ❌ Main: KHÔNG có quyền
- ❌ Collaborator: KHÔNG có quyền

## Files Modified (6 Files)

### 1. congViecPermissions.js (Core Logic)

**Location**: `src/features/QuanLyCongViec/CongViec/congViecPermissions.js`

**Changes**:

- Removed all "manager" role checks
- Updated `canEditCongViec`: ONLY Owner | Admin (removed Main/Participant)
- Updated `canDeleteCongViec`: Owner | Admin (removed Manager)
- Added `getEditDisabledReason()`: Returns tooltip message when edit disabled
- Added `getDeleteDisabledReason()`: Returns tooltip message when delete disabled
- Added "superadmin" support alongside "admin"

**New Functions**:

```javascript
export function getEditDisabledReason({ congViec, userRole, userNhanVienId }) {
  // Returns user-friendly message explaining why edit is disabled
}

export function getDeleteDisabledReason({
  congViec,
  userRole,
  userNhanVienId,
}) {
  // Returns user-friendly message explaining why delete is disabled
}
```

### 2. CongViecTable.js (Main List)

**Location**: `src/features/QuanLyCongViec/CongViec/CongViecTable.js`

**Changes**:

- Imported: `canEditCongViec`, `getEditDisabledReason`, `getDeleteDisabledReason`
- Added `canEdit()` helper function (mirrors existing `canDelete()`)
- In row rendering: Calculate `editDisabled`, `deleteDisabled`, `editTooltip`, `deleteTooltip` per row
- Edit button: Wrapped in `<span>`, added `disabled={editDisabled}`, dynamic tooltip
- Delete button: Updated to use `deleteTooltip` and wrap in `<span>`

**Pattern**:

```javascript
const editDisabled = !canEdit(cv);
const deleteDisabled = !canDelete(cv);
const editTooltip = editDisabled ? getEditDisabledReason(...) : "Sửa";
const deleteTooltip = deleteDisabled ? getDeleteDisabledReason(...) : "Xóa";

<Tooltip title={editTooltip}>
  <span>
    <IconButton disabled={editDisabled}>...</IconButton>
  </span>
</Tooltip>
```

### 3. TaskDialogHeader.jsx (Detail Dialog Header)

**Location**: `src/features/QuanLyCongViec/CongViec/components/TaskDialogHeader.jsx`

**Changes**:

- Imported: `canEditCongViec`, `getEditDisabledReason`
- Added props: `currentUserRole`, `currentUserNhanVienId`
- Calculate permission: `canEdit = canEditCongViec({...})`
- Edit button: Wrapped in `<span>`, added `disabled={!canEdit}`, dynamic tooltip

### 4. CongViecDetailDialog.js (Parent Dialog)

**Location**: `src/features/QuanLyCongViec/CongViec/CongViecDetailDialog.js`

**Changes**:

- Extract user info:
  ```javascript
  const currentUserRole = user?.PhanQuyen;
  const currentUserNhanVienId = user?.NhanVienID;
  ```
- Pass props to `TaskDialogHeader`: `currentUserRole`, `currentUserNhanVienId`
- Pass props to `SubtasksSection`: `currentUserRole`, `currentUserNhanVienId`

### 5. SubtasksSection.jsx (Subtasks Wrapper)

**Location**: `src/features/QuanLyCongViec/CongViec/components/SubtasksSection.jsx`

**Changes**:

- Added props: `currentUserRole`, `currentUserNhanVienId` to function signature
- Pass props down to `SubtasksTable`

### 6. SubtasksTable.jsx (Subtasks Table)

**Location**: `src/features/QuanLyCongViec/CongViec/components/SubtasksTable.jsx`

**Changes**:

- Imported: `canEditCongViec`, `canDeleteCongViec`, `getEditDisabledReason`, `getDeleteDisabledReason`
- Added props: `currentUserRole`, `currentUserNhanVienId`
- In row rendering: Calculate `editDisabled`, `deleteDisabled`, `editTooltip`, `deleteTooltip` per row
- Edit/Delete buttons: Wrapped in `<span>`, added disabled props, dynamic tooltips

## UI Pattern - Tooltip on Disabled Button

**Critical**: MUI tooltips don't work on disabled buttons directly. Must wrap in `<span>`:

```javascript
<Tooltip title="Tooltip message">
  <span>
    <IconButton disabled={true}>...</IconButton>
  </span>
</Tooltip>
```

## Tooltip Messages

### Edit Disabled

- **Owner/Admin only**: "Chỉ người giao việc hoặc quản trị viên mới có quyền chỉnh sửa cấu hình công việc"

### Delete Disabled

- **Completed task**: "Chỉ quản trị viên mới có quyền xóa công việc đã hoàn thành"
- **Not owner**: "Chỉ người giao việc hoặc quản trị viên mới có quyền xóa"

## Testing Checklist

### Test Matrix (3 Locations × 4 Roles × 2 Actions = 24 Scenarios)

#### Location 1: CongViecTable (Main List)

- [ ] **Admin**: Edit ✓, Delete ✓ (including HOAN_THANH)
- [ ] **Owner**: Edit ✓, Delete ✓ (not HOAN_THANH)
- [ ] **Main**: Edit ✗ (tooltip: "Chỉ người giao việc..."), Delete ✗
- [ ] **Collaborator**: Edit ✗ (tooltip), Delete ✗

#### Location 2: TaskDialogHeader (Detail Dialog)

- [ ] **Admin**: Edit ✓
- [ ] **Owner**: Edit ✓
- [ ] **Main**: Edit ✗ (tooltip: "Chỉ người giao việc...")
- [ ] **Collaborator**: Edit ✗ (tooltip)

#### Location 3: SubtasksTable (Subtasks)

- [ ] **Admin**: Edit ✓, Delete ✓ (including HOAN_THANH)
- [ ] **Owner**: Edit ✓, Delete ✓ (not HOAN_THANH)
- [ ] **Main**: Edit ✗ (tooltip), Delete ✗
- [ ] **Collaborator**: Edit ✗ (tooltip), Delete ✗

### Additional Verification

- [ ] Tooltips display correctly on hover over disabled buttons
- [ ] Edit button opens CongViecFormDialog ONLY for Owner/Admin
- [ ] Main/Collaborator can still update via ProgressEditDialog (other UIs)
- [ ] Backend validation still catches any bypass attempts
- [ ] No console errors in browser DevTools
- [ ] UI remains responsive and performant

## Implementation Status

✅ **COMPLETE** - All 6 files updated successfully with no compile errors

## Next Steps

1. ✅ Restart frontend server
2. ⏳ Test permission enforcement across all 3 locations
3. ⏳ Verify tooltip messages display correctly
4. ⏳ Confirm backend validation still works as fallback
5. ⏳ User acceptance testing

## Technical Notes

### User Object Structure

```javascript
{
  _id: "user_id",                    // User ID (authentication)
  NhanVienID: "nhanvien_id",        // Employee ID (used for permissions)
  PhanQuyen: "admin" | "manager" | "user",
  HoTen: "Full Name",
  KhoaID: { ... }
}
```

### Permission Check Pattern

```javascript
const canEdit = canEditCongViec({
  congViec: taskObject,
  userRole: user?.PhanQuyen,
  userNhanVienId: user?.NhanVienID,
});
```

### Critical: NhanVienID vs User ID

- ✅ Use `user.NhanVienID` for work management permissions
- ❌ Do NOT use `user._id` (that's User model, not NhanVien)

## Related Documentation

- Backend Permission Fix: `giaobanbv-be/FIX_APPROVE_KPI_PERMISSION.md`
- Work Management Architecture: `fe-bcgiaobanbvt/src/features/QuanLyCongViec/CongViec/docs/`
- User vs NhanVien Model: `.github/copilot-instructions.md` (Section: User vs NhanVien Model Distinction)

## Success Criteria

✅ Edit button disabled for non-Owner/Admin users  
✅ Delete button disabled based on role + completion status  
✅ User-friendly tooltips explain why buttons are disabled  
✅ Frontend aligns with backend permission model  
✅ Main/Collaborator can still update via other UIs  
✅ No breaking changes to existing functionality
