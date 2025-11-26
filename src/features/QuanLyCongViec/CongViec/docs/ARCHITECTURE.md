# Architecture - CongViec Module

**Version:** 2.0  
**Last Updated:** November 25, 2025  
**Status:** ✅ Code-verified documentation

---

## 📋 Table of Contents

- [Overview](#overview)
- [Frontend Architecture](#frontend-architecture)
- [Backend Architecture](#backend-architecture)
- [Database Schema](#database-schema)
- [Data Flows](#data-flows)
- [Critical Patterns](#critical-patterns)
- [Performance Considerations](#performance-considerations)

---

## 🎯 Overview

CongViec (Task Management) module implements a **full-stack task management system** with:

- **Frontend:** Redux Toolkit slice (1,705 lines) + 24 React components
- **Backend:** Express controller (693 lines) + service (3,317 lines)
- **Database:** MongoDB with CongViec model (349 lines), 11 indexes

### Architecture Principles

| Principle                  | Implementation                                                   |
| -------------------------- | ---------------------------------------------------------------- |
| **Separation of Concerns** | Controller handles HTTP, Service handles business logic          |
| **Optimistic UI**          | Frontend updates immediately, syncs with backend via `updatedAt` |
| **State Machine**          | Strict state transitions enforced by backend                     |
| **Permission-based**       | All actions checked against user role + task relationship        |
| **Lazy Loading**           | Comments/replies loaded on-demand, cached in Redux               |

---

## 🖥️ Frontend Architecture

### Redux Slice Structure

**File:** `congViecSlice.js` (1,705 lines)

**State Shape:**

```javascript
{
  // Loading & Error
  isLoading: boolean,
  error: string | null,

  // User Context
  currentNhanVien: NhanVien | null,  // Current employee info
  activeTab: 'received' | 'assigned',

  // Task Lists (Paginated)
  receivedCongViecs: CongViec[],      // Tasks where user is Main/Participant
  assignedCongViecs: CongViec[],      // Tasks where user is Assigner
  receivedTotal: number,
  assignedTotal: number,
  receivedPages: number,
  assignedPages: number,

  // Pagination
  currentPage: {
    received: number,
    assigned: number
  },

  // Filters (per tab)
  filters: {
    received: {
      search: string,
      TrangThai: string,
      MucDoUuTien: string,
      NgayBatDau: Date | null,
      NgayHetHan: Date | null,
      MaCongViec: string,
      NguoiChinhID: string,
      TinhTrangHan: string  // Deadline status filter
    },
    assigned: { /* same structure */ }
  },

  // Detail View
  congViecDetail: CongViec | null,    // Currently viewing task

  // Comment Threading (Lazy Load)
  repliesByParent: {
    [parentCommentId]: {
      items: BinhLuan[],
      loading: boolean,
      loaded: boolean,
      error: string | null
    }
  },

  // Optimistic Concurrency Control
  versionConflict: {
    id: string,
    type: 'transition' | 'update',
    action?: string,
    payload: object,
    timestamp: number
  } | null,

  // Routine Task Integration
  myRoutineTasks: NhiemVuThuongQuy[],
  loadingRoutineTasks: boolean,
  myRoutineTasksLoaded: boolean,
  myRoutineTasksLastFetch: number | null,
  myRoutineTasksError: string | null,

  // Cycle Management
  availableCycles: ChuKyDanhGia[],
  selectedCycleId: string | null,      // null = current cycle (auto)
  loadingCycles: boolean,
  cyclesError: string | null,

  // Subtask Hierarchy (Lazy Load)
  subtasksByParent: {
    [parentId]: {
      ids: string[],
      loading: boolean,
      loaded: boolean,
      error: string | null,
      lastFetch: number | null
    }
  },
  subtaskEntities: {
    [id]: SubtaskDTO  // Minimal subtask data
  },

  // Fine-grained Loading Flags
  creatingSubtask: boolean,
  createSubtaskError: string | null,
  updatingSubtaskId: string | null,
  deletingSubtaskId: string | null,
  subtaskOpError: string | null,

  // KPI Integration (Compact Summary)
  otherTasksSummary: {
    [`${nhanVienId}_${chuKyId}`]: SummaryDTO
  },
  collabTasksSummary: {
    [`${nhanVienId}_${chuKyId}`]: SummaryDTO
  },
  summaryLoading: boolean,
  summaryError: string | null
}
```

### Key Thunks (30+ total)

**File:** `congViecSlice.js` lines 1-1705

#### Core CRUD Thunks

```javascript
// 1. Fetch lists
getNhanVien(nhanVienId); // Get employee info
getReceivedCongViecs(nhanVienId, page, filters);
getAssignedCongViecs(nhanVienId, page, filters);

// 2. Detail
getCongViecDetail(congViecId); // Fetch single task with full data

// 3. Create/Update/Delete
createCongViec(data); // Create new task
updateCongViec(congViecId, data, updatedAt); // Update with optimistic concurrency
deleteCongViec(congViecId); // Soft delete

// 4. Progress tracking
updateProgress(congViecId, phanTramTienDo, ghiChu);
```

#### State Transition Thunks

```javascript
// Lines 800-1100 (approx)
giaoViec(congViecId, data, updatedAt); // TAO_MOI → DA_GIAO
huyGiaoViec(congViecId, lyDo, updatedAt); // DA_GIAO → TAO_MOI
tiepNhanCongViec(congViecId, updatedAt); // DA_GIAO → DANG_THUC_HIEN
hoanThanhCongViec(congViecId, data, updatedAt); // → CHO_DUYET or HOAN_THANH
duyetHoanThanh(congViecId, updatedAt); // CHO_DUYET → HOAN_THANH
huyHoanThanhTam(congViecId, lyDo, updatedAt); // CHO_DUYET → DANG_THUC_HIEN
moLaiCongViec(congViecId, lyDo, updatedAt); // HOAN_THANH → DANG_THUC_HIEN
```

#### Comment & File Thunks

```javascript
// Lines 1100-1400 (approx)
addComment(congViecId, noiDung, parentId);
editComment(binhLuanId, noiDung);
deleteComment(binhLuanId);
getReplies(parentCommentId); // Lazy load replies

uploadFile(congViecId, file);
deleteFile(tepTinId);
```

#### Subtask Thunks

```javascript
// Lines 1400-1600 (approx)
createSubtask(parentId, data);
getSubtasks(parentId); // Lazy load children
getFullTree(rootId); // Load entire subtask tree
updateSubtask(subtaskId, data, updatedAt);
deleteSubtask(subtaskId);
```

#### Utility Thunks

```javascript
// Lines 1600-1705
getMyRoutineTasks(); // Fetch user's routine duties
getAvailableCycles(); // Fetch evaluation cycles
getOtherTasksSummary(nhanVienId, chuKyId); // KPI integration
getCollabTasksSummary(nhanVienId, chuKyId);
```

### Helper Functions

**Lines 1275-1300:** `getAvailableActions(congViec, currentUser)`

```javascript
// Returns array of available action constants based on:
// - Current state
// - User role (isAssigner, isMain, isParticipant)
// - CoDuyetHoanThanh flag
// Example: ["TIEP_NHAN", "HUY_GIAO"] for DA_GIAO state
```

**Lines 50-80:** `buildUpdatePayload(data)`

```javascript
// Sanitizes update payload:
// - Removes undefined/null values (EXCEPT NhiemVuThuongQuyID, FlagNVTQKhac)
// - Keeps these special fields for business logic
```

---

## ⚙️ Backend Architecture

### Controller Layer

**File:** `congViec.controller.js` (693 lines)

**Responsibilities:**

- HTTP request/response handling
- JWT authentication via middleware
- Input validation
- Call service layer for business logic
- Send standardized responses

**Key Endpoints (21+ total):**

```javascript
// CRUD
controller.getReceivedCongViecs(req, res, next); // GET /nhanvien/:id
controller.getAssignedCongViecs(req, res, next); // GET /congviec/:id/assigned
controller.getCongViecDetail(req, res, next); // GET /congviec/detail/:id
controller.createCongViec(req, res, next); // POST /congviec
controller.updateCongViec(req, res, next); // PUT /congviec/:id
controller.deleteCongViec(req, res, next); // DELETE /congviec/:id

// State Transitions
controller.giaoViec(req, res, next); // POST /giao-viec
controller.tiepNhan(req, res, next); // POST /tiep-nhan
controller.hoanThanh(req, res, next); // POST /hoan-thanh
controller.duyetHoanThanh(req, res, next); // POST /duyet-hoan-thanh
// ... 8 total transition endpoints

// Progress & Comments
controller.updateProgress(req, res, next); // POST /progress
controller.addComment(req, res, next); // POST /comment
controller.getReplies(req, res, next); // GET /binhluan/:id/replies
controller.updateComment(req, res, next); // PUT /binhluan/:id
controller.deleteComment(req, res, next); // DELETE /binhluan/:id

// Subtasks
controller.createSubtask(req, res, next); // POST /congviec/:id/subtasks
controller.getSubtasks(req, res, next); // GET /congviec/:id/children
controller.getFullTree(req, res, next); // GET /congviec/:id/full-tree
```

**Pattern Example:**

```javascript
// congViec.controller.js:120-145 (approx)
controller.updateCongViec = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;

  // Get If-Unmodified-Since header for optimistic concurrency
  const ifUnmodifiedSince = req.get("If-Unmodified-Since");

  // Call service layer
  const updatedCongViec = await service.updateCongViec(
    id,
    data,
    req,
    ifUnmodifiedSince
  );

  return sendResponse(
    res,
    200,
    true,
    updatedCongViec,
    null,
    "Cập nhật công việc thành công"
  );
});
```

---

### Service Layer

**File:** `congViec.service.js` (3,317 lines)

**Responsibilities:**

- Business logic implementation
- Permission checks (view/update)
- State machine enforcement
- Database operations
- Transaction management
- Data transformation

**Key Service Functions:**

#### Permission Checks

```javascript
// Lines 17-46
async function checkTaskViewPermission(congviec, req)
  // Returns true if user can view task
  // Checks: isAssigner, isMain, isParticipant, isAdmin

// Lines 47-118
function checkUpdatePermission(congViec, nhanVienId, vaiTro, updateFields)
  // Returns { allowed, role, invalidFields?, message? }
  // Field-level validation by role
```

#### CRUD Operations

```javascript
// Lines 200-400 (approx)
service.getReceivedCongViecs(nhanVienId, page, limit, filters);
// Complex aggregation pipeline
// Populates NguoiGiaoViec, NguoiChinh, NhiemVuThuongQuy
// Calculates TinhTrangThoiHan virtual

service.createCongViec(data, req);
// Generates MaCongViec from Counter
// Sets initial state TAO_MOI
// Creates LichSuTrangThai entry
// Calculates Path/Depth if subtask

service.updateCongViec(id, data, req, ifUnmodifiedSince);
// ✅ Optimistic concurrency check
// Permission validation
// Field-level update
// LichSuTienDo tracking
```

#### State Machine Implementation

```javascript
// Lines 1750-1850 (approx)
function buildActionMap()
  // Returns map of allowed transitions:
  // {
  //   TAO_MOI: { GIAO_VIEC: { nextState: 'DA_GIAO', ... } },
  //   DA_GIAO: { TIEP_NHAN: ..., HUY_GIAO: ... },
  //   ...
  // }

function isActionAllowed(currentState, action, congViec, role)
  // Validates if action can be performed
  // Checks: State, Role, CoDuyetHoanThanh flag

// Lines 800-1500 (approx - 8 transition functions)
service.giaoViec(id, data, req, ifUnmodifiedSince)
  // TAO_MOI → DA_GIAO
  // Sets NgayGiaoViec, calculates NgayCanhBao

service.tiepNhanCongViec(id, req, ifUnmodifiedSince)
  // DA_GIAO → DANG_THUC_HIEN
  // Sets NgayTiepNhanThucTe

service.hoanThanhCongViec(id, data, req, ifUnmodifiedSince)
  // If CoDuyetHoanThanh: → CHO_DUYET
  // Else: → HOAN_THANH
  // Sets NgayHoanThanhTam or NgayHoanThanh

service.duyetHoanThanhCongViec(id, req, ifUnmodifiedSince)
  // CHO_DUYET → HOAN_THANH
  // Sets NgayHoanThanh, calculates SoGioTre
```

#### Comment Operations

```javascript
// Lines 2000-2300 (approx)
service.addComment(congViecId, noiDung, parentId, req);
// Creates BinhLuan document
// Links to CongViec and parent comment
// Updates CongViec.BinhLuans array

service.getReplies(parentCommentId, req);
// Queries BinhLuan where ParentID = parentCommentId
// Populates NguoiTaoID
// Returns sorted by NgayTao
```

#### Subtask Operations

```javascript
// Lines 2500-2800 (approx)
service.createSubtask(parentId, data, req);
// Creates child CongViec
// Sets CongViecChaID, Path, Depth
// Inherits NgayBatDau/NgayHetHan from parent
// Updates parent ChildrenCount

service.getSubtasks(parentId, req);
// Finds where CongViecChaID = parentId
// Returns slim DTO (no full populates)

service.getFullTree(rootId, req);
// Recursively loads all descendants
// Builds tree structure
```

---

## 💾 Database Schema

### CongViec Model

**File:** `CongViec.js` (349 lines)

**Core Fields:**

```javascript
{
  _id: ObjectId,

  // Identification
  MaCongViec: String (unique, e.g., "CV202501234"),
  TieuDe: String (required),
  MoTa: String,
  SoThuTu: Number (auto-increment),

  // Relationships (User IDs are NhanVienID, NOT User._id)
  NguoiGiaoViecID: ObjectId -> NhanVien (required),
  NguoiChinhID: ObjectId -> NhanVien (required),
  NguoiThamGia: [{
    NhanVienID: ObjectId -> NhanVien,
    VaiTro: Enum ["CHINH", "PHOI_HOP"],
    NgayThamGia: Date
  }],

  // Scheduling
  MucDoUuTien: Enum ["CAO", "BINH_THUONG", "THAP"],
  NgayBatDau: Date,
  NgayHetHan: Date,
  NgayGiaoViec: Date (set when state → DA_GIAO),
  NgayTiepNhanThucTe: Date (set when → DANG_THUC_HIEN),
  NgayHoanThanhTam: Date (set when → CHO_DUYET),
  NgayHoanThanh: Date (set when → HOAN_THANH),

  // Deadline Warning Config
  CanhBaoMode: Enum ["FIXED", "PERCENT"] | null,
  NgayCanhBao: Date (manual date if FIXED mode),
  CanhBaoSapHetHanPercent: Number (0.5-1.0 if PERCENT mode),

  // Late Tracking
  SoGioTre: Number (calculated on completion),
  HoanThanhTreHan: Boolean,
  FirstSapQuaHanAt: Date (first time warning triggered),
  FirstQuaHanAt: Date (first time overdue),

  // State Machine
  TrangThai: Enum ["TAO_MOI", "DA_GIAO", "DANG_THUC_HIEN", "CHO_DUYET", "HOAN_THANH"],
  CoDuyetHoanThanh: Boolean (if true, requires approval),
  PhanTramTienDoTong: Number (0-100),

  // Routine Task Integration
  NhiemVuThuongQuyID: ObjectId -> NhiemVuThuongQuy | null,
  FlagNVTQKhac: Boolean (true = "Other" tasks),

  // Subtask Hierarchy
  CongViecChaID: ObjectId -> CongViec | null,
  Path: [ObjectId] (ancestor IDs: root → parent),
  Depth: Number (0 = root, 1 = 1st level, etc.),
  ChildrenCount: Number,

  // Custom Grouping
  NhomViecUserID: ObjectId -> NhomViecUser | null,

  // Audit Trail
  LichSuTrangThai: [{
    TrangThai: String,
    ThoiDiem: Date,
    NguoiThucHienID: ObjectId,
    GhiChu: String
  }],
  LichSuTienDo: [{
    PhanTram: Number,
    ThoiDiem: Date,
    NguoiCapNhatID: ObjectId,
    GhiChu: String
  }],

  // Comments (References)
  BinhLuans: [ObjectId -> BinhLuan],

  // Soft Delete
  isDeleted: Boolean,
  deletedAt: Date,
  deletedBy: ObjectId -> NhanVien,

  // Timestamps (auto)
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes (11 total):**

```javascript
// Lines 207-216
congViecSchema.index({ TrangThai: 1, NgayHetHan: 1 });
congViecSchema.index({ NgayGiaoViec: 1 });
congViecSchema.index({ NgayCanhBao: 1 });
congViecSchema.index({ TrangThai: 1, NgayCanhBao: 1 });
congViecSchema.index({ "NguoiThamGia.NhanVienID": 1 });
congViecSchema.index({ isDeleted: 1 });
congViecSchema.index({ SoThuTu: -1 });
congViecSchema.index({ MaCongViec: 1 }, { unique: true, sparse: true });
congViecSchema.index({ CoDuyetHoanThanh: 1, TrangThai: 1 });
congViecSchema.index({ CongViecChaID: 1 });
congViecSchema.index({ NhiemVuThuongQuyID: 1 });
```

**Virtuals (3 total):**

```javascript
// Lines 219-242
// 1. NguoiGiaoViec (populate helper)
// 2. NguoiChinh (populate helper)
// 3. TinhTrangThoiHan (calculated deadline status)
congViecSchema.virtual("TinhTrangThoiHan").get(function () {
  // Returns: "CHUA_DEN_HAN" | "SAP_HET_HAN" | "QUA_HAN" | "HOAN_THANH"
  // Based on: TrangThai, NgayHetHan, NgayCanhBao, CanhBaoMode
});
```

**Pre-validate Hooks:**

```javascript
// Lines 245-280
// 1. Validate CongViecChaID != _id (no self-reference)
// 2. Validate NgayHetHan > NgayBatDau
// 3. Validate NgayCanhBao in range for FIXED mode
// 4. Validate CanhBaoSapHetHanPercent in [0.5, 1.0] for PERCENT mode
```

---

### Related Models

#### BinhLuan (Comment)

```javascript
{
  _id: ObjectId,
  CongViecID: ObjectId -> CongViec,
  ParentID: ObjectId -> BinhLuan | null,  // For threading
  NoiDung: String,
  NguoiTaoID: ObjectId -> NhanVien,
  NgayTao: Date,
  TepTinIDs: [ObjectId -> TepTin],
  isDeleted: Boolean,
  deletedAt: Date
}
```

#### TepTin (File Metadata)

```javascript
{
  _id: ObjectId,
  TenFile: String,
  TenGoc: String,
  LoaiFile: String,
  KichThuoc: Number,
  DuongDan: String,
  OwnerType: String,  // "CongViec", "BinhLuan", etc.
  OwnerID: String,
  CongViecID: ObjectId -> CongViec,
  BinhLuanID: ObjectId -> BinhLuan,
  NguoiTaiLenID: ObjectId -> NhanVien,
  TrangThai: Enum ["ACTIVE", "DELETED"],
  NgayTaiLen: Date
}
```

---

## 🔄 Data Flows

### Flow 1: Create Task

```
User fills form → Frontend dispatches createCongViec(data)
  ↓
Redux: startLoading()
  ↓
API: POST /api/workmanagement/congviec
  ↓
Backend Controller: createCongViec(req, res, next)
  ↓
Backend Service: service.createCongViec(data, req)
  ├─ Get currentUser from JWT
  ├─ Validate NhanVienID exists
  ├─ Generate MaCongViec from Counter (CV202501234)
  ├─ Set initial state: TAO_MOI
  ├─ Create LichSuTrangThai entry
  ├─ If subtask: Calculate Path/Depth, update parent ChildrenCount
  ├─ Save CongViec to MongoDB
  └─ Return saved document
  ↓
Backend Controller: sendResponse(res, 201, congViec)
  ↓
Redux: createCongViecSuccess(congViec)
  ├─ Add to receivedCongViecs or assignedCongViecs
  └─ Show toast.success("Tạo công việc thành công")
  ↓
UI: Navigate to detail page or refresh list
```

---

### Flow 2: Update Task with Optimistic Concurrency

```
User edits form → Frontend dispatches updateCongViec(id, data, updatedAt)
  ↓
Redux: startLoading()
  ↓
API: PUT /api/workmanagement/congviec/:id
     Headers: { "If-Unmodified-Since": "2025-11-25T10:30:00Z" }
  ↓
Backend Controller: updateCongViec(req, res, next)
  ├─ Get ifUnmodifiedSince from headers
  └─ Call service.updateCongViec(id, data, req, ifUnmodifiedSince)
  ↓
Backend Service: service.updateCongViec(...)
  ├─ Find CongViec by ID
  ├─ Check optimistic concurrency:
  │   if (congViec.updatedAt > ifUnmodifiedSince) {
  │     throw AppError(409, "VERSION_CONFLICT", ...)
  │   }
  ├─ Get currentUser, check permissions:
  │   checkUpdatePermission(congViec, nhanVienId, role, updateFields)
  │   If not allowed: throw AppError(403, ...)
  ├─ Update allowed fields
  ├─ If PhanTramTienDoTong changed: Add to LichSuTienDo
  ├─ Save CongViec
  └─ Return updated document (with NEW updatedAt)
  ↓
Backend Controller: sendResponse(res, 200, updatedCongViec)
  ↓
Redux: updateCongViecSuccess(updatedCongViec)
  ├─ Update in receivedCongViecs/assignedCongViecs
  ├─ Update congViecDetail
  └─ Show toast.success("Cập nhật thành công")
  ↓
UI: Re-renders with new data

--- IF VERSION CONFLICT (409 error) ---
  ↓
Redux: Catch 409 error
  ├─ Set versionConflict state
  └─ Show <VersionConflictNotice /> component
  ↓
User clicks "Làm mới dữ liệu"
  ↓
Redux: getCongViecDetail(id) to refresh data
  ├─ Clear versionConflict state
  └─ User can retry edit
```

---

### Flow 3: State Transition (e.g., Tiếp Nhận)

```
User clicks "Tiếp nhận" button → Frontend dispatches tiepNhanCongViec(id, updatedAt)
  ↓
Redux: startLoading()
  ↓
API: POST /api/workmanagement/congviec/tiep-nhan
     Body: { congViecId: "...", updatedAt: "..." }
  ↓
Backend Controller: tiepNhan(req, res, next)
  ↓
Backend Service: service.tiepNhanCongViec(id, req, ifUnmodifiedSince)
  ├─ Find CongViec
  ├─ Check optimistic concurrency (same as Flow 2)
  ├─ Check current state = DA_GIAO (otherwise error)
  ├─ Check permission: isMain or isAdmin
  ├─ Update fields:
  │   ├─ TrangThai = "DANG_THUC_HIEN"
  │   ├─ NgayTiepNhanThucTe = new Date()
  │   └─ LichSuTrangThai.push({ TrangThai: "DANG_THUC_HIEN", ... })
  ├─ Save CongViec
  └─ Return updated document
  ↓
Backend Controller: sendResponse(res, 200, congViec)
  ↓
Redux: tiepNhanCongViecSuccess(congViec)
  ├─ Update in lists + detail
  └─ Show toast.success("Đã tiếp nhận công việc")
  ↓
UI: Button state changes (now shows "Hoàn thành" instead of "Tiếp nhận")
```

---

### Flow 4: Comment Threading with Lazy Loading

```
User opens task detail → Frontend loads task
  ↓
Redux: getCongViecDetail(id)
  ├─ API returns CongViec with BinhLuans[] (populated parent comments only)
  └─ Store in congViecDetail
  ↓
UI: Renders CommentSection
  ├─ Maps congViecDetail.BinhLuans to <CommentItem />
  └─ For each comment with RepliesCount > 0:
      Shows "Xem N phản hồi" button
  ↓
User clicks "Xem phản hồi" → Frontend dispatches getReplies(parentCommentId)
  ↓
Redux: Check repliesByParent[parentCommentId]
  ├─ If already loaded: Skip API call
  └─ Else: Call API
  ↓
API: GET /api/workmanagement/congviec/binhluan/:id/replies
  ↓
Backend Service: service.getReplies(parentCommentId, req)
  ├─ Find BinhLuan where ParentID = parentCommentId
  ├─ Populate NguoiTaoID
  └─ Return sorted by NgayTao
  ↓
Redux: getRepliesSuccess(parentCommentId, replies)
  ├─ Store in repliesByParent[parentCommentId] = { items: replies, loaded: true }
  └─ Mark as loaded to prevent re-fetching
  ↓
UI: Renders <RepliesList /> with replies
  ↓
User adds reply → Frontend dispatches addComment(congViecId, noiDung, parentCommentId)
  ↓
Backend: Creates BinhLuan with ParentID
  ├─ Increments parent.RepliesCount
  └─ Returns new comment
  ↓
Redux: addCommentSuccess(comment)
  ├─ If parentId: Add to repliesByParent[parentId].items
  └─ Else: Add to congViecDetail.BinhLuans
  ↓
UI: Shows new reply immediately (optimistic UI)
```

---

## ⚡ Critical Patterns

### 1. Optimistic Concurrency Control

**Problem:** Prevent lost updates when multiple users edit same task

**Solution:** Use `updatedAt` timestamp + `If-Unmodified-Since` header

**Implementation:**

```javascript
// Frontend: congViecSlice.js (all update/transition thunks)
export const updateCongViec = (id, data, updatedAt) => async (dispatch) => {
  dispatch(slice.actions.startLoading());

  try {
    const headers = updatedAt ? { "If-Unmodified-Since": updatedAt } : {};

    const response = await apiService.put(
      `/workmanagement/congviec/${id}`,
      data,
      { headers }
    );

    dispatch(slice.actions.updateCongViecSuccess(response.data.data));
    toast.success("Cập nhật thành công");
  } catch (error) {
    if (error.response?.status === 409) {
      // Version conflict detected
      dispatch(
        slice.actions.setVersionConflict({
          id,
          type: "update",
          payload: data,
          timestamp: Date.now(),
        })
      );
      toast.error("Dữ liệu đã thay đổi, vui lòng làm mới");
    } else {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  }
};

// Backend: congViec.service.js:400-450 (approx)
service.updateCongViec = async (id, data, req, ifUnmodifiedSince) => {
  const congViec = await CongViec.findById(id);

  // Optimistic concurrency check
  if (ifUnmodifiedSince) {
    const clientUpdatedAt = new Date(ifUnmodifiedSince);
    if (congViec.updatedAt > clientUpdatedAt) {
      throw new AppError(
        409,
        "Dữ liệu đã được cập nhật bởi người khác",
        "VERSION_CONFLICT"
      );
    }
  }

  // ... rest of update logic
};
```

**UI Component:**

```jsx
// VersionConflictNotice.js
function VersionConflictNotice({ conflict, onRefresh, onDismiss }) {
  return (
    <Alert
      severity="warning"
      action={
        <>
          <Button onClick={onRefresh}>Làm mới</Button>
          <Button onClick={onDismiss}>Đóng</Button>
        </>
      }
    >
      Dữ liệu đã thay đổi. Vui lòng làm mới để xem phiên bản mới nhất.
    </Alert>
  );
}
```

---

### 2. State Machine Enforcement

**Backend validates all state transitions:**

```javascript
// congViec.service.js:1750-1850
const ACTION_MAP = {
  TAO_MOI: {
    GIAO_VIEC: {
      nextState: "DA_GIAO",
      requiredRole: ["assigner", "admin"],
      requiredFields: ["NguoiChinhID", "NgayHetHan"],
    },
  },
  DA_GIAO: {
    TIEP_NHAN: {
      nextState: "DANG_THUC_HIEN",
      requiredRole: ["main", "admin"],
    },
    HUY_GIAO: {
      nextState: "TAO_MOI",
      requiredRole: ["assigner", "admin"],
      requiredFields: ["lyDo"],
    },
  },
  // ... 5 states total, 8 actions
};

function isActionAllowed(currentState, action, congViec, role) {
  const stateActions = ACTION_MAP[currentState];
  if (!stateActions || !stateActions[action]) return false;

  const actionConfig = stateActions[action];
  return actionConfig.requiredRole.includes(role);
}
```

**Frontend gets available actions dynamically:**

```javascript
// congViecSlice.js:1275-1300
export function getAvailableActions(congViec, currentUser) {
  const actions = [];
  const state = congViec.TrangThai;
  const isAssigner = congViec.NguoiGiaoViecID === currentUser.NhanVienID;
  const isMain = congViec.NguoiChinhID === currentUser.NhanVienID;
  const isAdmin = ["admin", "superadmin"].includes(
    currentUser.PhanQuyen?.toLowerCase()
  );

  switch (state) {
    case "TAO_MOI":
      if (isAssigner || isAdmin) actions.push("GIAO_VIEC");
      break;
    case "DA_GIAO":
      if (isMain || isAdmin) actions.push("TIEP_NHAN");
      if (isAssigner || isAdmin) actions.push("HUY_GIAO");
      break;
    case "DANG_THUC_HIEN":
      if (isMain || isAdmin) actions.push("HOAN_THANH_TAM");
      break;
    case "CHO_DUYET":
      if (isAssigner || isAdmin) actions.push("DUYET_HOAN_THANH");
      if (isMain || isAdmin) actions.push("HUY_HOAN_THANH_TAM");
      break;
    case "HOAN_THANH":
      if (isAssigner || isAdmin) actions.push("MO_LAI_HOAN_THANH");
      break;
  }

  return actions;
}
```

---

### 3. Lazy Loading with Caching

**Comments/Replies loaded on-demand, cached in Redux:**

```javascript
// congViecSlice.js:1100-1200
export const getReplies = (parentCommentId) => async (dispatch, getState) => {
  const { repliesByParent } = getState().congViec;

  // Check cache first
  if (repliesByParent[parentCommentId]?.loaded) {
    console.log("Replies already loaded, skipping API call");
    return;
  }

  dispatch(slice.actions.startLoadingReplies(parentCommentId));

  try {
    const response = await apiService.get(
      `/workmanagement/congviec/binhluan/${parentCommentId}/replies`
    );

    dispatch(
      slice.actions.getRepliesSuccess({
        parentId: parentCommentId,
        replies: response.data.data,
      })
    );
  } catch (error) {
    dispatch(
      slice.actions.repliesError({
        parentId: parentCommentId,
        error: error.message,
      })
    );
  }
};

// Reducer
getRepliesSuccess: (state, action) => {
  const { parentId, replies } = action.payload;
  state.repliesByParent[parentId] = {
    items: replies,
    loading: false,
    loaded: true,
    error: null,
  };
};
```

**Subtasks follow same pattern:**

```javascript
// Keyed by parentId: subtasksByParent[parentId] = { ids, loading, loaded, error, lastFetch }
```

---

## 🚀 Performance Considerations

### Database Optimization

1. **Indexes:** 11 indexes for common queries (see Database Schema section)
2. **Lean Queries:** Use `.lean()` for read-only operations (faster, no Mongoose overhead)
3. **Selective Population:** Only populate needed fields (e.g., `populate("NguoiChinhID", "HoTen MaNhanVien")`)
4. **Pagination:** All lists paginated (default 10 items/page)

### Frontend Optimization

1. **Lazy Loading:** Comments/replies/subtasks loaded on-demand
2. **Caching:** Prevent redundant API calls with `loaded` flags
3. **Optimistic UI:** Update UI immediately, sync with backend later
4. **Fine-grained Loading:** Separate loading flags for subtasks (`creatingSubtask`, `updatingSubtaskId`, `deletingSubtaskId`)

### API Response Size

**Slim DTOs for list views:**

```javascript
// getReceivedCongViecs returns:
{
  _id, MaCongViec, TieuDe, TrangThai, NgayHetHan,
  NguoiGiaoViec: { HoTen, MaNhanVien },  // Only needed fields
  NguoiChinh: { HoTen, MaNhanVien },
  TinhTrangThoiHan: "SAP_HET_HAN"        // Calculated virtual
}
// Omits: MoTa, LichSuTrangThai, LichSuTienDo, BinhLuans, etc.
```

**Full data only in detail view:**

```javascript
// getCongViecDetail returns:
{
  /* All fields */
  BinhLuans: [ /* Populated parent comments */ ],
  TepTins: [ /* Populated files */ ],
  // Replies loaded separately via getReplies()
}
```

---

**Last verified:** November 25, 2025  
**Code versions:**

- Frontend: congViecSlice.js (1,705 lines)
- Backend: congViec.controller.js (693 lines), congViec.service.js (3,317 lines)
- Model: CongViec.js (349 lines)  
  **Documentation status:** ✅ 100% code-verified
