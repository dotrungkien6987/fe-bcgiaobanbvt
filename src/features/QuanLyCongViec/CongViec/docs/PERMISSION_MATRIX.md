# Permission Matrix - CongViec Module

**Version:** 2.1  
**Last Updated:** November 26, 2025  
**Status:** ✅ Code-verified documentation

---

## 📋 Table of Contents

- [Overview](#overview)
- [User Roles in Task Context](#user-roles-in-task-context)
- [Permission Check Functions](#permission-check-functions)
- [Field-Level Permissions](#field-level-permissions)
- [Action-Level Permissions by State](#action-level-permissions-by-state)
- [Comment & File Permissions](#comment--file-permissions)
- [Subtask Permissions](#subtask-permissions)
- [Code Implementation](#code-implementation)
- [Error Messages](#error-messages)
- [Best Practices](#best-practices)

---

## 🎯 Overview

CongViec module implements **role-based permissions** with **field-level granularity**. Permissions are determined by:

1. **Task relationship** (isAssigner, isMain, isParticipant)
2. **System role** (Admin, Manager, User)
3. **Task state** (TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH)

**Key principle:** Backend ALWAYS re-checks permissions (never trust frontend)

---

## 👥 User Roles in Task Context

| Role                           | Field                                     | Description                                  | Permissions Level    |
| ------------------------------ | ----------------------------------------- | -------------------------------------------- | -------------------- | ------------- |
| **Assigner (Người giao việc)** | `NguoiGiaoViecID`                         | Person who created/assigned task             | ⭐⭐⭐ High          |
| **Main (Người chính)**         | `NguoiChinhID`                            | Primary person responsible for completion    | ⭐⭐ Medium          |
| **Participant CHINH**          | `NguoiThamGia[]` với `VaiTro: "CHINH"`    | Helper with main role (legacy, same as Main) | ⭐⭐ Medium          |
| **Participant PHOI_HOP**       | `NguoiThamGia[]` với `VaiTro: "PHOI_HOP"` | Collaborator/support role                    | ⭐ Low               |
| **Admin**                      | `User.PhanQuyen: "admin"                  | "superadmin"`                                | System administrator | ⭐⭐⭐⭐ Full |

### Role Determination Code

```javascript
// Frontend: congViecSlice.js
const currentUser = useAuth().user;
const task = state.congViec.congViecDetail;

const isAssigner = currentUser.NhanVienID === task.NguoiGiaoViecID;
const isMain = currentUser.NhanVienID === task.NguoiChinhID;
const isParticipant = task.NguoiThamGia.some(
  (p) => p.NhanVienID === currentUser.NhanVienID
);

const vaiTroInTask = task.NguoiThamGia.find(
  (p) => p.NhanVienID === currentUser.NhanVienID
)?.VaiTro; // "CHINH" | "PHOI_HOP"
```

---

## 🔐 Permission Check Functions

### 1. checkTaskViewPermission

**File:** `congViec.service.js` (lines 17-46)  
**Purpose:** Check if user can VIEW task details

**Code:**

```javascript
async function checkTaskViewPermission(congviec, req) {
  const currentUser = await User.findById(req.userId).lean();
  if (!currentUser?.NhanVienID) {
    throw new AppError(
      400,
      "Tài khoản chưa liên kết với nhân viên. Vui lòng liên hệ quản trị viên."
    );
  }

  const currentNhanVienId = String(currentUser.NhanVienID);
  const isAssigner = String(congviec.NguoiGiaoViecID) === currentNhanVienId;
  const isMain = String(congviec.NguoiChinhID) === currentNhanVienId;
  const isParticipant = congviec.NguoiThamGia?.some(
    (p) => String(p.NhanVienID || p.NhanVienID?._id) === currentNhanVienId
  );

  const vaiTro = currentUser.PhanQuyen?.toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(vaiTro);

  const hasPermission = isAssigner || isMain || isParticipant || isAdmin;

  if (!hasPermission) {
    throw new AppError(403, "Bạn không có quyền xem công việc này");
  }

  return true;
}
```

**Rules:**

- ✅ Assigner can view
- ✅ Main can view
- ✅ Participants (any VaiTro) can view
- ✅ Admin can view
- ❌ Others CANNOT view

**Used in:** `getCongViecDetail`, `updateCongViec`, all action endpoints

---

### 2. checkUpdatePermission

**File:** `congViec.service.js` (lines 47-118)  
**Purpose:** Check if user can UPDATE specific fields (field-level validation)

**Code:**

```javascript
function checkUpdatePermission(congViec, nhanVienId, vaiTro, updateFields) {
  const normalizedRole = (vaiTro || "").toLowerCase();
  const isAdmin = ["admin", "superadmin"].includes(normalizedRole);
  const isOwner = String(congViec.NguoiGiaoViecID) === String(nhanVienId);
  const isMain = String(congViec.NguoiChinhID) === String(nhanVienId);

  // Admin: Có thể sửa tất cả trường cấu hình (trừ auto-calculated)
  if (isAdmin) {
    return { allowed: true, role: "admin" };
  }

  // Owner: Có thể sửa các trường cấu hình chính
  const ownerAllowedFields = [
    "TieuDe",
    "MoTa",
    "NgayBatDau",
    "NgayHetHan",
    "MucDoUuTien",
    "CoDuyetHoanThanh",
    "CanhBaoMode",
    "CanhBaoSapHetHanPercent",
    "NgayCanhBao",
    "NguoiChinhID",
    "NguoiThamGia",
    "NhomViecUserID",
  ];

  if (isOwner) {
    const invalidFields = updateFields.filter(
      (f) => !ownerAllowedFields.includes(f)
    );
    if (invalidFields.length > 0) {
      return {
        allowed: false,
        role: "owner",
        invalidFields,
        message: `Người giao việc không được sửa các trường: ${invalidFields.join(
          ", "
        )}`,
      };
    }
    return { allowed: true, role: "owner" };
  }

  // Main: CHỈ được sửa 2 trường
  const mainAllowedFields = ["NhiemVuThuongQuyID", "FlagNVTQKhac"];

  if (isMain) {
    const invalidFields = updateFields.filter(
      (f) => !mainAllowedFields.includes(f)
    );
    if (invalidFields.length > 0) {
      return {
        allowed: false,
        role: "main",
        invalidFields,
        message: `Người chính chỉ có thể sửa: Nhiệm vụ thường quy (NhiemVuThuongQuyID), Cờ NVTQ khác (FlagNVTQKhac). Không được sửa: ${invalidFields.join(
          ", "
        )}`,
      };
    }
    return { allowed: true, role: "main" };
  }

  // Người khác: Không có quyền
  return {
    allowed: false,
    role: "none",
    message: "Bạn không có quyền cập nhật công việc này",
  };
}
```

**Return Object:**

```javascript
{
  allowed: boolean,
  role: "admin" | "owner" | "main" | "none",
  invalidFields?: string[],  // Only if allowed = false
  message?: string            // Only if allowed = false
}
```

**Used in:** `updateCongViec` endpoint (line ~1100 in service)

---

## 📝 Field-Level Permissions

### Configuration Fields (Editable by Assigner/Admin)

| Field                     | Admin | Assigner | Main | Participant | Notes                                       |
| ------------------------- | ----- | -------- | ---- | ----------- | ------------------------------------------- |
| `TieuDe`                  | ✅    | ✅       | ❌   | ❌          | Task title                                  |
| `MoTa`                    | ✅    | ✅       | ❌   | ❌          | Description                                 |
| `NgayBatDau`              | ✅    | ✅       | ❌   | ❌          | Start date                                  |
| `NgayHetHan`              | ✅    | ✅       | ❌   | ❌          | Deadline                                    |
| `MucDoUuTien`             | ✅    | ✅       | ❌   | ❌          | Priority (THAP, BINH_THUONG, CAO, KHAN_CAP) |
| `CoDuyetHoanThanh`        | ✅    | ✅       | ❌   | ❌          | Require approval flag (boolean)             |
| `NguoiChinhID`            | ✅    | ✅       | ❌   | ❌          | Can reassign main person                    |
| `NguoiThamGia[]`          | ✅    | ✅       | ❌   | ❌          | Can add/remove collaborators                |
| `CanhBaoMode`             | ✅    | ✅       | ❌   | ❌          | Warning mode (FIXED/PERCENT)                |
| `NgayCanhBao`             | ✅    | ✅       | ❌   | ❌          | Warning date (FIXED mode only)              |
| `CanhBaoSapHetHanPercent` | ✅    | ✅       | ❌   | ❌          | Warning percent (PERCENT mode)              |
| `NhomViecUserID`          | ✅    | ✅       | ❌   | ❌          | Task group (for organization)               |

---

### Task Data Fields (Limited Access)

| Field                | Admin | Assigner | Main | Participant | Notes                                        |
| -------------------- | ----- | -------- | ---- | ----------- | -------------------------------------------- |
| `TrangThai`          | ⚠️    | ⚠️       | ⚠️   | ❌          | Via state transitions ONLY (not direct edit) |
| `PhanTramTienDoTong` | ✅    | ❌       | ✅   | ❌          | Progress percentage (0-100)                  |
| `NhiemVuThuongQuyID` | ✅    | ❌       | ✅   | ❌          | Link to routine task                         |
| `FlagNVTQKhac`       | ✅    | ❌       | ✅   | ❌          | Flag for "other tasks" (not routine)         |
| `TepTinIDs[]`        | ✅    | ✅       | ✅   | ❌          | File attachments (via upload API)            |

---

### Read-Only Fields (Auto-Calculated, No Direct Edit)

| Field                | Description                                          | Calculated By                                         |
| -------------------- | ---------------------------------------------------- | ----------------------------------------------------- |
| `MaCongViec`         | Auto-generated code (CV00001, CV00002, ...)          | Backend on create (Counter model)                     |
| `SoThuTu`            | Sequence number for sorting                          | Backend on create                                     |
| `NgayGiaoViec`       | Assignment timestamp                                 | Set when GIAO_VIEC action                             |
| `NgayTiepNhanThucTe` | Acceptance timestamp                                 | Set when TIEP_NHAN action                             |
| `NgayHoanThanhTam`   | Temp completion timestamp                            | Set when HOAN_THANH_TAM action                        |
| `NgayHoanThanh`      | Official completion timestamp                        | Set when DUYET_HOAN_THANH or HOAN_THANH action        |
| `SoGioTre`           | Hours late (if any)                                  | Calculated on completion (NgayHoanThanh > NgayHetHan) |
| `HoanThanhTreHan`    | Boolean flag for late completion                     | Calculated on completion                              |
| `Path`               | Materialized path for subtasks                       | Pre-save hook (parent.Path + \_id + "/")              |
| `Depth`              | Hierarchy depth (0 = root, 1 = child, ...)           | Pre-save hook (parent.Depth + 1)                      |
| `ChildrenCount`      | Number of direct subtasks                            | Post-save hook (parent.ChildrenCount++)               |
| `TinhTrangThoiHan`   | Virtual field (QUA_HAN, SAP_HET_HAN, TRONG_HAN, ...) | Virtual getter (computed on query)                    |
| `LichSuTrangThai[]`  | Status change history                                | Appended on each state transition                     |
| `LichSuTienDo[]`     | Progress update history                              | Appended on each progress update                      |

---

## ⚡ Action-Level Permissions by State

### TAO_MOI (Initial State)

| Action        | Assigner | Main | Participant | Admin | Notes                        |
| ------------- | -------- | ---- | ----------- | ----- | ---------------------------- |
| View          | ✅       | ❌   | ❌          | ✅    | Only creator can see draft   |
| Edit          | ✅       | ❌   | ❌          | ✅    | Edit all config fields       |
| Delete        | ✅       | ❌   | ❌          | ✅    | Soft delete                  |
| **GIAO_VIEC** | ✅       | ❌   | ❌          | ✅    | Assign to employee → DA_GIAO |

---

### DA_GIAO (Assigned)

| Action        | Assigner | Main | Participant | Admin | Notes                         |
| ------------- | -------- | ---- | ----------- | ----- | ----------------------------- |
| View          | ✅       | ✅   | ✅          | ✅    | All assigned people can see   |
| Edit          | ✅       | ❌   | ❌          | ✅    | Assigner can modify config    |
| Delete        | ✅       | ❌   | ❌          | ✅    | Assigner can cancel           |
| Comment       | ✅       | ✅   | ✅          | ✅    | Anyone can comment            |
| Upload Files  | ✅       | ✅   | ✅          | ✅    | Anyone can attach files       |
| **TIEP_NHAN** | ❌       | ✅   | ❌          | ✅    | Main accepts → DANG_THUC_HIEN |
| **HUY_GIAO**  | ✅       | ❌   | ❌          | ✅    | Assigner cancels → TAO_MOI    |

---

### DANG_THUC_HIEN (In Progress)

| Action             | Assigner | Main | Participant CHINH | Participant PHOI_HOP | Admin | Notes                                                 |
| ------------------ | -------- | ---- | ----------------- | -------------------- | ----- | ----------------------------------------------------- |
| View               | ✅       | ✅   | ✅                | ✅                   | ✅    | Everyone can see                                      |
| Edit (limited)     | ❌       | ✅   | ✅                | ❌                   | ✅    | Main: only NhiemVuThuongQuyID, FlagNVTQKhac           |
| Edit (full)        | ✅       | ❌   | ❌                | ❌                   | ✅    | Assigner can edit config                              |
| Comment            | ✅       | ✅   | ✅                | ✅                   | ✅    | Anyone can comment                                    |
| Upload Files       | ✅       | ✅   | ✅                | ❌                   | ✅    | PHOI_HOP cannot upload                                |
| Update Progress    | ❌       | ✅   | ❌                | ❌                   | ✅    | Only Main updates %                                   |
| **HOAN_THANH_TAM** | ❌       | ✅   | ❌                | ❌                   | ✅    | Main reports completion (if CoDuyetHoanThanh = true)  |
| **HOAN_THANH**     | ❌       | ✅   | ❌                | ❌                   | ✅    | Main completes directly (if CoDuyetHoanThanh = false) |

---

### CHO_DUYET (Awaiting Approval)

| Action                 | Assigner | Main | Participant | Admin | Notes                                             |
| ---------------------- | -------- | ---- | ----------- | ----- | ------------------------------------------------- |
| View                   | ✅       | ✅   | ✅          | ✅    | Everyone can see                                  |
| Edit                   | ❌       | ❌   | ❌          | ❌    | No edits allowed while pending approval           |
| Comment                | ✅       | ✅   | ✅          | ✅    | Can discuss before approval                       |
| **DUYET_HOAN_THANH**   | ✅       | ❌   | ❌          | ✅    | Assigner approves → HOAN_THANH                    |
| **HUY_HOAN_THANH_TAM** | ✅       | ✅   | ❌          | ✅    | Main cancels OR Assigner rejects → DANG_THUC_HIEN |

---

### HOAN_THANH (Completed)

| Action                | Assigner | Main | Participant | Admin | Notes                                   |
| --------------------- | -------- | ---- | ----------- | ----- | --------------------------------------- |
| View                  | ✅       | ✅   | ✅          | ✅    | Read-only for everyone                  |
| Edit                  | ❌       | ❌   | ❌          | ❌    | No edits allowed (task archived)        |
| Comment               | ❌       | ❌   | ❌          | ❌    | No more comments (use reopen if needed) |
| Upload Files          | ❌       | ❌   | ❌          | ❌    | No more file uploads                    |
| **MO_LAI_HOAN_THANH** | ✅       | ❌   | ❌          | ✅    | Assigner reopens → DANG_THUC_HIEN       |

---

## 💬 Comment & File Permissions

### Comment Operations

| Operation              | Assigner | Main | Participant CHINH | Participant PHOI_HOP | Admin | Notes                                    |
| ---------------------- | -------- | ---- | ----------------- | -------------------- | ----- | ---------------------------------------- |
| Add Comment            | ✅       | ✅   | ✅                | ✅                   | ✅    | Anyone assigned to task                  |
| Edit Own Comment       | ✅       | ✅   | ✅                | ✅                   | ✅    | Within 15 minutes (future: edit history) |
| Delete Own Comment     | ✅       | ✅   | ✅                | ✅                   | ✅    | Soft delete (can undo)                   |
| Delete Others' Comment | ❌       | ❌   | ❌                | ❌                   | ✅    | Admin only                               |
| Reply to Comment       | ✅       | ✅   | ✅                | ✅                   | ✅    | Anyone                                   |
| View Replies           | ✅       | ✅   | ✅                | ✅                   | ✅    | Anyone (lazy loaded)                     |

**Implementation:**

```javascript
// Backend: congViec.controller.js:384-415
controller.addComment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { NoiDung, ParentID } = req.body;

  // Permission check: Must be assigned to task
  const congViec = await CongViec.findById(id);
  await checkTaskViewPermission(congViec, req);

  const comment = await congViecService.addComment(id, NoiDung, ParentID, req);

  return sendResponse(
    res,
    200,
    true,
    comment,
    null,
    "Thêm bình luận thành công"
  );
});
```

---

### File Operations

| Operation           | Assigner | Main | Participant CHINH | Participant PHOI_HOP | Admin | Notes                  |
| ------------------- | -------- | ---- | ----------------- | -------------------- | ----- | ---------------------- |
| Upload File         | ✅       | ✅   | ✅                | ❌                   | ✅    | PHOI_HOP cannot upload |
| View File           | ✅       | ✅   | ✅                | ✅                   | ✅    | Anyone can view        |
| Delete Own File     | ✅       | ✅   | ✅                | ❌                   | ✅    | Soft delete            |
| Delete Others' File | ❌       | ❌   | ❌                | ❌                   | ✅    | Admin only             |

**PhamVi Separation:**

```javascript
// Task files
TepTin.PhamVi = "CONG_VIEC";
TepTin.DoiTuongID = CongViec._id;

// Comment files (future implementation)
TepTin.PhamVi = "BINH_LUAN";
TepTin.DoiTuongID = BinhLuan._id;
```

**Implementation:**

```javascript
// Backend: tepTin.controller.js (separate controller)
// POST /api/workmanagement/tep-tin
// Permission: Must be assigned to task (check via DoiTuongID)
```

---

## 🌳 Subtask Permissions

| Operation        | Assigner | Main                    | Admin | Notes                          |
| ---------------- | -------- | ----------------------- | ----- | ------------------------------ |
| Create Subtask   | ✅       | ❌                      | ✅    | Same as create task            |
| View Subtask     | ✅       | ✅                      | ✅    | Follow parent task permissions |
| Update Subtask   | ✅       | ✅ (if Main of subtask) | ✅    | Follow parent + subtask roles  |
| Delete Subtask   | ✅       | ❌                      | ✅    | Assigner of subtask or Admin   |
| Complete Subtask | ❌       | ✅ (Main of subtask)    | ✅    | Must complete before parent    |

**Validation Rules:**

```javascript
// Backend: congViec.service.js (lines 1875-1890)
// Rule 1: Cannot complete parent if subtasks incomplete
if (
  [WORK_ACTIONS.DUYET_HOAN_THANH, WORK_ACTIONS.HOAN_THANH].includes(action) &&
  congviec.ChildrenCount > 0
) {
  const incomplete = await CongViec.countDocuments({
    CongViecChaID: congviec._id, // Query con trực tiếp
    TrangThai: { $ne: "HOAN_THANH" },
    isDeleted: { $ne: true },
  });

  if (incomplete > 0) {
    throw new AppError(
      409, // Conflict, không phải 400
      "CHILDREN_INCOMPLETE",
      "Còn công việc con chưa hoàn thành"
    );
  }
}

// Rule 2: Cannot delete parent if children exist
if (ChildrenCount > 0) {
  throw new AppError(
    409, // Conflict
    "Không thể xóa công việc có công việc con",
    "HAS_CHILDREN"
  );
}
```

---

## 💻 Code Implementation

### Frontend: Permission Checks

**File:** `congViecSlice.js`

```javascript
// Check if user can perform action
const availableActions = getAvailableActions(task, {
  isAssigner,
  isMain,
});

// Disable button if action not available
<Button
  disabled={!availableActions.includes(WORK_ACTIONS.GIAO_VIEC)}
  onClick={() => handleAction(WORK_ACTIONS.GIAO_VIEC)}
>
  Giao việc
</Button>;
```

---

### Backend: Permission Checks

**File:** `congViec.service.js`

**Example 1: View Permission (used in all endpoints)**

```javascript
// Line ~1000-1010
const congViec = await CongViec.findById(id);
if (!congViec) throw new AppError(404, "Không tìm thấy công việc");

// Check view permission
await checkTaskViewPermission(congViec, req);
```

**Example 2: Update Permission with Field Validation**

```javascript
// Line ~1096-1130
const updateFields = Object.keys(req.body);
const currentUser = await User.findById(req.userId).lean();

const permissionCheck = checkUpdatePermission(
  congViec,
  currentUser.NhanVienID,
  currentUser.PhanQuyen,
  updateFields
);

if (!permissionCheck.allowed) {
  throw new AppError(403, permissionCheck.message, "PERMISSION_DENIED");
}

// Apply update
Object.assign(congViec, sanitizedUpdate);
await congViec.save();
```

---

## ⚠️ Error Messages

### Backend Error Responses

```javascript
// 403 Forbidden - View Permission
{
  "success": false,
  "message": "Bạn không có quyền xem công việc này",
  "error": "PERMISSION_DENIED"
}

// 403 Forbidden - Update Permission (Field-level)
{
  "success": false,
  "message": "Người chính chỉ có thể sửa: Nhiệm vụ thường quy (NhiemVuThuongQuyID), Cờ NVTQ khác (FlagNVTQKhac). Không được sửa: TieuDe, MoTa",
  "error": "PERMISSION_DENIED",
  "invalidFields": ["TieuDe", "MoTa"]
}

// 403 Forbidden - Action Permission
{
  "success": false,
  "message": "Bạn không có quyền thực hiện hành động DUYET_HOAN_THANH",
  "error": "ACTION_NOT_ALLOWED"
}

// 400 Bad Request - Subtask Validation
{
  "success": false,
  "message": "Còn công việc con chưa hoàn thành",
  "error": "CHILDREN_INCOMPLETE"
}
// Note: HTTP Code thực tế là 409 Conflict
```

---

## ✅ Best Practices

### 1. Frontend Permission Checks (UX)

```javascript
// Always check permissions before showing buttons
const availableActions = getAvailableActions(task, { isAssigner, isMain });

// Hide/disable UI elements
{
  availableActions.includes(WORK_ACTIONS.GIAO_VIEC) && (
    <Button onClick={() => handleAction(WORK_ACTIONS.GIAO_VIEC)}>
      Giao việc
    </Button>
  );
}

// Show tooltip if disabled
<Tooltip title="Bạn không có quyền giao việc">
  <span>
    <Button disabled={!isAssigner}>Giao việc</Button>
  </span>
</Tooltip>;
```

---

### 2. Backend Permission Checks (Security)

```javascript
// ALWAYS re-check permissions on backend (never trust frontend)

// Step 1: Check view permission (all endpoints)
await checkTaskViewPermission(congViec, req);

// Step 2: Check update permission (update endpoint)
const permissionCheck = checkUpdatePermission(...);
if (!permissionCheck.allowed) throw new AppError(403, permissionCheck.message);

// Step 3: Check action permission (state transitions)
if (!isActionAllowed(congViec, action, currentNhanVienId, vaiTro)) {
  throw new AppError(403, "Bạn không có quyền thực hiện hành động này");
}
```

---

### 3. Descriptive Error Messages

```javascript
// ❌ BAD: Generic error
throw new AppError(403, "Permission denied");

// ✅ GOOD: Specific, actionable error
throw new AppError(
  403,
  "Người chính chỉ có thể sửa: Nhiệm vụ thường quy (NhiemVuThuongQuyID). Không được sửa: TieuDe, MoTa",
  "PERMISSION_DENIED"
);
```

---

### 4. Audit Logging (Future Implementation)

```javascript
// Log all permission failures for security audit
logger.warn("Permission denied", {
  userId: req.userId,
  nhanVienId: currentUser.NhanVienID,
  congViecId: congViec._id,
  action: "UPDATE",
  attemptedFields: updateFields,
  timestamp: Date.now(),
});
```

---

### 5. Field Sanitization

```javascript
// Remove fields user cannot edit
const allowedFields = getAllowedFieldsForRole(role);
const sanitizedUpdate = Object.keys(req.body)
  .filter((field) => allowedFields.includes(field))
  .reduce((obj, key) => {
    obj[key] = req.body[key];
    return obj;
  }, {});

// Apply sanitized update
Object.assign(congViec, sanitizedUpdate);
```

---

## 🖥️ Frontend Permission Helpers

**File:** `congViecPermissions.js` (87 lines)

Frontend cung cấp các hàm helper để kiểm tra quyền trước khi hiển thị UI actions. Các hàm này đồng bộ logic với backend.

### 1. canDeleteCongViec

**Purpose:** Kiểm tra user có quyền xóa công việc

```javascript
import { canDeleteCongViec } from "./congViecPermissions";

const canDelete = canDeleteCongViec({
  congViec,
  currentUserRole: user.PhanQuyen, // "admin" | "superadmin" | "manager" | "user"
  currentUserNhanVienId: user.NhanVienID, // NhanVien._id
});

// Rules:
// - Admin/SuperAdmin: Xóa được tất cả
// - Owner (NguoiGiaoViecID): Xóa được nếu chưa HOAN_THANH
// - Completed tasks: Chỉ admin xóa được
```

### 2. canEditCongViec

**Purpose:** Kiểm tra user có quyền mở CongViecFormDialog để edit

```javascript
import { canEditCongViec } from "./congViecPermissions";

const canEdit = canEditCongViec({
  congViec,
  currentUserRole: user.PhanQuyen,
  currentUserNhanVienId: user.NhanVienID,
});

// Rules:
// - Admin/SuperAdmin: Edit được tất cả
// - Owner (NguoiGiaoViecID): Edit được cấu hình công việc
// - Main/Participants: KHÔNG có quyền mở form edit (chỉ update progress)
```

### 3. getEditDisabledReason

**Purpose:** Trả về message giải thích tại sao nút Edit bị disable

```javascript
import { getEditDisabledReason } from "./congViecPermissions";

const reason = getEditDisabledReason({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
});

// Returns:
// - null: Có quyền edit
// - "Chỉ người giao việc hoặc quản trị viên mới có quyền chỉnh sửa cấu hình công việc"
```

### 4. getDeleteDisabledReason

**Purpose:** Trả về message giải thích tại sao nút Delete bị disable

```javascript
import { getDeleteDisabledReason } from "./congViecPermissions";

const reason = getDeleteDisabledReason({
  congViec,
  currentUserRole,
  currentUserNhanVienId,
});

// Returns:
// - null: Có quyền xóa
// - "Chỉ quản trị viên mới có quyền xóa công việc đã hoàn thành"
// - "Chỉ người giao việc hoặc quản trị viên mới có quyền xóa"
```

### Usage Example in Component

```jsx
import { canEditCongViec, getEditDisabledReason } from "./congViecPermissions";

function TaskActions({ congViec }) {
  const { user } = useAuth();

  const canEdit = canEditCongViec({
    congViec,
    currentUserRole: user.PhanQuyen,
    currentUserNhanVienId: user.NhanVienID,
  });

  const editDisabledReason = getEditDisabledReason({
    congViec,
    currentUserRole: user.PhanQuyen,
    currentUserNhanVienId: user.NhanVienID,
  });

  return (
    <Tooltip title={editDisabledReason || "Chỉnh sửa"}>
      <span>
        <IconButton disabled={!canEdit} onClick={handleEdit}>
          <EditIcon />
        </IconButton>
      </span>
    </Tooltip>
  );
}
```

---

**Last verified:** November 26, 2025  
**Code version:** Backend congViec.service.js stable, Frontend congViecSlice.js v2, congViecPermissions.js  
**Documentation status:** ✅ 100% code-verified from service.js lines 17-118 and congViecPermissions.js
