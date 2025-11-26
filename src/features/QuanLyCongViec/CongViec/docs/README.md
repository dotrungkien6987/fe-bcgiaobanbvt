# CongViec (Task Management) Module - Documentation

**Version:** 2.1  
**Last Updated:** November 26, 2025  
**Status:** ✅ Code-verified documentation

---

## 📋 Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Architecture Overview](#architecture-overview)
- [Quick Start](#quick-start)
  - [For Developers](#for-developers)
  - [For Managers](#for-managers)
  - [For Employees](#for-employees)
- [Key Concepts](#key-concepts)
- [Documentation Structure](#documentation-structure)
- [Subtasks Documentation](#subtasks-documentation)
- [Troubleshooting](#troubleshooting)
- [Changelog](#changelog)

---

## 🎯 Overview

**CongViec (Task Management)** là module quản lý công việc toàn diện trong hệ thống Hospital Management, cho phép:

- **Managers:** Giao việc, theo dõi tiến độ, duyệt hoàn thành
- **Employees:** Nhận việc, cập nhật tiến độ, báo cáo hoàn thành
- **Collaboration:** Comment threading, file uploads, người tham gia (CHÍNH/PHỐI HỢP)
- **Hierarchy:** Subtasks với Path/Depth tracking (parent-child relationships)

### Key Stats

- **Frontend:** `congViecSlice.js` (1705 lines), 24 components
- **Backend:** `congViec.controller.js` (693 lines, 21+ endpoints), `congViec.service.js` (3317 lines)
- **Model:** `CongViec.js` (349 lines) với 11 indexes, 5 trạng thái, 8 actions
- **Critical Features:** Optimistic concurrency, state machine, comment threading, file management, deadline warnings

---

## ✨ Core Features

### 1. **Optimistic Concurrency Control**

**Problem:** Multiple users editing same task → data conflicts  
**Solution:** `If-Unmodified-Since` header với `updatedAt` timestamp

```javascript
// Frontend sends header
headers: {
  "If-Unmodified-Since": task.updatedAt
}

// Backend checks conflict
if (currentTask.updatedAt > headerDate) {
  throw new AppError(409, "VERSION_CONFLICT");
}

// Frontend auto-refreshes on conflict
catch (error) {
  if (error.response?.data?.error === "VERSION_CONFLICT") {
    dispatch(getCongViecDetail(id)); // Auto reload
    toast.warning("Dữ liệu đã thay đổi, đã tải lại");
  }
}
```

**Files:**

- Frontend: `congViecSlice.js` (lines 1034, 1106, 1465, 1583)
- Backend: `congViec.service.js` (lines 1096, 1519)

**Documentation:** [./ARCHITECTURE.md#optimistic-concurrency](./ARCHITECTURE.md#optimistic-concurrency)

---

### 2. **State Machine with 5 States**

**States:** `TAO_MOI → DA_GIAO → DANG_THUC_HIEN → CHO_DUYET → HOAN_THANH`

**8 Actions:**

- `GIAO_VIEC`: Giao việc (TAO_MOI → DA_GIAO)
- `HUY_GIAO`: Hủy giao việc (DA_GIAO → TAO_MOI)
- `TIEP_NHAN`: Nhận việc (DA_GIAO → DANG_THUC_HIEN)
- `HOAN_THANH_TAM`: Báo hoàn thành tạm (DANG_THUC_HIEN → CHO_DUYET)
- `HUY_HOAN_THANH_TAM`: Hủy hoàn thành tạm (CHO_DUYET → DANG_THUC_HIEN)
- `DUYET_HOAN_THANH`: Duyệt hoàn thành (CHO_DUYET → HOAN_THANH)
- `HOAN_THANH`: Hoàn thành trực tiếp (DANG_THUC_HIEN → HOAN_THANH, khi không cần duyệt)
- `MO_LAI_HOAN_THANH`: Mở lại công việc (HOAN_THANH → DANG_THUC_HIEN)

**Implementation:**

```javascript
// Frontend: congViecSlice.js:1275
export function getAvailableActions(cv, { isAssigner, isMain }) {
  if (!cv) return [];
  const st = cv.TrangThai;
  const acts = [];

  if (st === "TAO_MOI" && isAssigner) acts.push(WORK_ACTIONS.GIAO_VIEC);
  if (st === "DA_GIAO") {
    if (isMain) acts.push(WORK_ACTIONS.TIEP_NHAN);
    if (isAssigner) acts.push(WORK_ACTIONS.HUY_GIAO);
  }
  // ... more transitions

  return acts;
}
```

**Permission Rules:**

- **isAssigner** (người giao việc): Giao, hủy giao, duyệt, mở lại
- **isMain** (người chính): Tiếp nhận, hoàn thành, hủy hoàn thành tạm

**Documentation:** [./WORKFLOW.md](./WORKFLOW.md)

---

### 3. **Comment Threading with Lazy Loading**

**Architecture:**

- **Parent comments:** Stored in `congViecDetail.BinhLuans[]`
- **Replies:** Cached in `repliesByParent` object (lazy loaded)
- **Cache structure:** `{ [parentId]: { items[], loading, loaded, error } }`

**Example:**

```javascript
// Load parent comments (included in task detail)
dispatch(getCongViecDetail(taskId));

// Lazy load replies when user expands parent
dispatch(
  loadRepliesForComment({
    congViecId: taskId,
    parentId: commentId,
  })
);

// Frontend caches replies to avoid re-fetching
const replies = state.repliesByParent[commentId]?.items || [];
```

**Backend:**

- Parent comments: `GET /api/workmanagement/congviec/:id`
- Replies: `GET /api/workmanagement/congviec/:id/binh-luan/:commentId/replies`

**Documentation:** [./ARCHITECTURE.md#comment-threading](./ARCHITECTURE.md#comment-threading)

---

### 4. **File Management with Soft Delete**

**Key Concepts:**

- **Separation:** Task files (`PhamVi: "CONG_VIEC"`) vs Comment files (`PhamVi: "BINH_LUAN"`)
- **Soft delete:** Files marked `isDeleted: true`, not physically removed
- **References:** Task has `TepTinIDs[]` array (references to TepTin collection)

**Upload Flow:**

```javascript
// 1. Upload file via separate API
const formData = new FormData();
formData.append("file", file);
formData.append("PhamVi", "CONG_VIEC");
formData.append("DoiTuongID", taskId);

const response = await apiService.post("/workmanagement/tep-tin", formData);
const tepTinId = response.data.data._id;

// 2. Update task with TepTinIDs
await apiService.put(`/workmanagement/congviec/${taskId}`, {
  TepTinIDs: [...task.TepTinIDs, tepTinId],
});
```

**Delete Flow:**

```javascript
// Soft delete (không xóa vật lý)
await apiService.delete(`/workmanagement/tep-tin/${tepTinId}`);
// Backend sets isDeleted: true, deletedAt: Date.now()
```

**Documentation:** [./FILE_MANAGEMENT.md](./FILE_MANAGEMENT.md)

---

### 5. **Deadline Warnings with 2 Modes**

**Schema Fields:**

- `NgayHetHan`: Deadline date (required)
- `NgayCanhBao`: Warning date (optional, only for FIXED mode)
- `CanhBaoMode`: "FIXED" | "PERCENT"
- `CanhBaoSapHetHanPercent`: 0-100 (for PERCENT mode)

**Mode 1: FIXED Date**

```javascript
CanhBaoMode: "FIXED";
NgayHetHan: "2025-12-31";
NgayCanhBao: "2025-12-28"; // Warn 3 days before
```

**Mode 2: PERCENT of Duration**

```javascript
CanhBaoMode: "PERCENT";
NgayBatDau: "2025-12-01";
NgayHetHan: "2025-12-31"; // 30 days
CanhBaoSapHetHanPercent: 80; // Warn at 80% (24 days) = Dec 25

// Backend calculates NgayCanhBao = NgayBatDau + (duration * 0.80)
```

**Implementation:**

- Backend validation: `CongViec.js` (lines 230-243)
- Frontend sanitization: `congViecSlice.js` (lines 862-863, 1001-1003)
- Calculation: `congViec.service.js` (`calculateNgayCanhBao` function)

**Documentation:** [./WORKFLOW.md#deadline-warnings](./WORKFLOW.md#deadline-warnings)

---

## 🏗️ Architecture Overview

### Frontend Stack

- **Redux Slice:** `congViecSlice.js` (1705 lines)
  - 30+ thunks (async actions)
  - State: `{ receivedCongViecs[], assignedCongViecs[], congViecDetail, repliesByParent{}, subtasksByParent{} }`
- **Components:** 24 files
  - `CongViecByNhanVienPage.js`: Main page (tabs: Received/Assigned)
  - `CongViecFormDialog.js`: Create/Edit form
  - `CongViecDetailDialog.js`: Task detail view (comments, files, history)
  - `CommentSection.js`, `RepliesList.js`: Comment threading UI
  - `FilesSidebar.js`: File management UI
  - `SubtasksSection.jsx`: Subtask hierarchy
- **Utilities:**
  - `workActions.constants.js`: Action constants, permission checks
  - `congViecPermissions.js`: Permission helper functions

### Backend Stack

- **Controller:** `congViec.controller.js` (693 lines, 21+ endpoints)
  - REST endpoints: GET/POST/PUT/DELETE
  - Individual action endpoints: `giaoViec`, `tiepNhan`, `hoanThanhTam`, etc.
- **Service:** `congViec.service.js` (3317 lines)
  - Business logic: Permission checks (`checkTaskViewPermission`, `checkUpdatePermission`)
  - State machine: `buildActionMap`, `isActionAllowed`
  - Calculation: `calculateNgayCanhBao`, `calculateSoGioTre`
  - Version conflict detection (lines 1096, 1519)
- **Model:** `CongViec.js` (349 lines)
  - 30+ fields (MaCongViec, TieuDe, TrangThai, NguoiGiaoViecID, NguoiChinhID, etc.)
  - Embedded arrays: `NguoiThamGia[]`, `LichSuTrangThai[]`, `LichSuTienDo[]`
  - Virtuals: `NguoiGiaoViec`, `NguoiChinh`, `TinhTrangThoiHan`
  - Indexes: 11 compound indexes for query optimization
  - Pre/Post hooks: Path/Depth calculation for subtasks

### Database Schema

**Key Fields:**

| Field                | Type     | Description                                             |
| -------------------- | -------- | ------------------------------------------------------- | ------------- |
| `MaCongViec`         | String   | Auto-generated (CV00001, CV00002, ...)                  |
| `TieuDe`             | String   | Title (required, max 255 chars)                         |
| `TrangThai`          | Enum     | TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH |
| `MucDoUuTien`        | Enum     | THAP, BINH_THUONG, CAO, KHAN_CAP                        |
| `NguoiGiaoViecID`    | ObjectId | Ref: NhanVien (người giao việc)                         |
| `NguoiChinhID`       | ObjectId | Ref: NhanVien (người xử lý chính)                       |
| `NguoiThamGia[]`     | Array    | `{ NhanVienID, VaiTro: "CHINH"                          | "PHOI_HOP" }` |
| `PhanTramTienDoTong` | Number   | 0-100 (progress percentage)                             |
| `CoDuyetHoanThanh`   | Boolean  | Có yêu cầu duyệt hoàn thành không?                      |
| `NgayBatDau`         | Date     | Start date                                              |
| `NgayHetHan`         | Date     | Deadline (required)                                     |
| `NgayCanhBao`        | Date     | Warning date (calculated or manual)                     |
| `CanhBaoMode`        | Enum     | FIXED, PERCENT                                          |
| `CongViecChaID`      | ObjectId | Parent task (for subtasks)                              |
| `Path`               | String   | Materialized path (e.g., "/parent/\_id/")               |
| `Depth`              | Number   | Hierarchy depth (0 = root)                              |
| `NhiemVuThuongQuyID` | ObjectId | Optional: Link to routine task                          |
| `LichSuTrangThai[]`  | Array    | Status change history with snapshots                    |
| `LichSuTienDo[]`     | Array    | Progress update history                                 |
| `BinhLuans[]`        | Array    | Refs to BinhLuan collection (comments)                  |
| `TepTinIDs[]`        | Array    | Refs to TepTin collection (files)                       |

**Documentation:** [./ARCHITECTURE.md#database-schema](./ARCHITECTURE.md#database-schema)

---

## 🚀 Quick Start

### For Developers

#### 1. **Setup Environment**

```powershell
# Frontend
cd d:\project\webBV\fe-bcgiaobanbvt
npm install
npm start  # http://localhost:3000

# Backend
cd d:\project\webBV\giaobanbv-be
npm install
npm start  # http://localhost:8020
```

#### 2. **Read Core Documentation**

**Must Read (in order):**

1. [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture
2. [WORKFLOW.md](./WORKFLOW.md) - State machine & transitions
3. [API_REFERENCE.md](./API_REFERENCE.md) - Backend endpoints

**Reference:** 4. [UI_COMPONENTS.md](./UI_COMPONENTS.md) - Frontend components 5. [FILE_MANAGEMENT.md](./FILE_MANAGEMENT.md) - File handling 6. [PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md) - Access control

#### 3. **Common Development Tasks**

**Add new action to state machine:**

```javascript
// 1. Add constant (workActions.constants.js)
export const WORK_ACTIONS = {
  // ... existing
  MY_NEW_ACTION: "MY_NEW_ACTION",
};

// 2. Update getAvailableActions (congViecSlice.js:1275)
if (st === "SOME_STATE" && somePermission) {
  acts.push(WORK_ACTIONS.MY_NEW_ACTION);
}

// 3. Backend service (congViec.service.js)
// Add to buildActionMap function
```

**Add new field to task:**

```javascript
// 1. Model (CongViec.js)
MyNewField: { type: String, maxlength: 200 },

// 2. Frontend form (CongViecFormDialog.js)
<FTextField name="MyNewField" label="My Field" />

// 3. Update Yup schema
MyNewField: Yup.string().max(200),
```

---

### For Managers

#### Workflow Overview

1. **Tạo công việc mới** → Status: `TAO_MOI`
2. **Giao việc** (assign to employee) → Status: `DA_GIAO`
3. **Nhân viên tiếp nhận** → Status: `DANG_THUC_HIEN`
4. **Nhân viên cập nhật tiến độ** (0-100%)
5. **Nhân viên báo hoàn thành**:
   - Nếu `CoDuyetHoanThanh = true` → Status: `CHO_DUYET` (chờ manager duyệt)
   - Nếu `CoDuyetHoanThanh = false` → Status: `HOAN_THANH` (hoàn thành luôn)
6. **Manager duyệt** → Status: `HOAN_THANH`

#### Key Actions

- **Giao việc:** Click "Giao việc" button (only visible in TAO_MOI state)
- **Duyệt hoàn thành:** Click "Duyệt" button (only visible in CHO_DUYET state, only for assigner)
- **Mở lại:** Click "Mở lại" button (only visible in HOAN_THANH state, only for assigner)

**Documentation:** [WORKFLOW.md#manager-guide](./WORKFLOW.md#manager-guide)

---

### For Employees

#### Daily Tasks

1. **Xem công việc được giao:**

   - Navigate to Quản lý công việc → Tab "Công việc được giao"
   - Filter by `TrangThai`, `MucDoUuTien`, deadline

2. **Tiếp nhận công việc:**

   - Open task detail → Click "Tiếp nhận" button
   - Status changes: `DA_GIAO` → `DANG_THUC_HIEN`

3. **Cập nhật tiến độ:**

   - Open task detail → Click pencil icon on progress bar
   - Enter percentage (0-100%) + note
   - History saved in `LichSuTienDo[]`

4. **Báo hoàn thành:**

   - **If task requires approval** (`CoDuyetHoanThanh = true`):
     - Click "Hoàn thành tạm" button → Status: `CHO_DUYET`
     - Wait for manager to approve
   - **If no approval required** (`CoDuyetHoanThanh = false`):
     - Click "Hoàn thành" button → Status: `HOAN_THANH` (done immediately)

5. **Comment & Upload Files:**
   - Add comments in "Bình luận" section
   - Reply to comments (threading supported)
   - Upload files in "Tài liệu đính kèm" sidebar

**Documentation:** [WORKFLOW.md#employee-guide](./WORKFLOW.md#employee-guide)

---

## 🔑 Key Concepts

### 1. **Vai Trò (Roles) in Tasks**

| Role                | Field                               | Permissions                                      |
| ------------------- | ----------------------------------- | ------------------------------------------------ |
| **Người giao việc** | `NguoiGiaoViecID`                   | Giao việc, duyệt hoàn thành, mở lại, xóa         |
| **Người chính**     | `NguoiChinhID`                      | Tiếp nhận, cập nhật tiến độ, hoàn thành, comment |
| **Người phối hợp**  | `NguoiThamGia[].VaiTro: "PHOI_HOP"` | View, comment (cannot update status)             |

**Implementation:**

```javascript
// Check permissions
const isAssigner = currentUser.NhanVienID === task.NguoiGiaoViecID;
const isMain = currentUser.NhanVienID === task.NguoiChinhID;
const isParticipant = task.NguoiThamGia.some(
  (p) => p.NhanVienID === currentUser.NhanVienID
);
```

**Documentation:** [PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md)

---

### 2. **CoDuyetHoanThanh Flag**

**Purpose:** Control whether task completion requires manager approval

- **`CoDuyetHoanThanh: true`** (requires approval):

  - Employee clicks "Hoàn thành tạm" → `CHO_DUYET`
  - Manager clicks "Duyệt hoàn thành" → `HOAN_THANH`

- **`CoDuyetHoanThanh: false`** (no approval):
  - Employee clicks "Hoàn thành" → `HOAN_THANH` (directly)

**Set when creating task:**

```javascript
// Frontend form
<FCheckbox name="CoDuyetHoanThanh" label="Yêu cầu duyệt hoàn thành" />

// Default: false
```

---

### 3. **TinhTrangThoiHan Virtual**

**Computed field** (not stored in DB), calculated based on deadline:

```javascript
// Backend virtual (CongViec.js)
congViecSchema.virtual("TinhTrangThoiHan").get(function () {
  if (this.TrangThai === "HOAN_THANH") return "DA_HOAN_THANH";
  if (!this.NgayHetHan) return "KHONG_XAC_DINH";

  const now = Date.now();
  const deadline = this.NgayHetHan.getTime();
  const warning = this.NgayCanhBao?.getTime();

  if (now > deadline) return "QUA_HAN";
  if (warning && now >= warning) return "SAP_HET_HAN";
  return "TRONG_HAN";
});
```

**Use case:** Filter tasks by deadline status

```javascript
// Frontend filter
filters.TinhTrangHan = "QUA_HAN"; // Show overdue tasks
```

---

### 4. **Subtask Hierarchy**

**Schema fields:**

- `CongViecChaID`: Parent task ID (null for root tasks)
- `Path`: Materialized path (e.g., `"/64abc123.../64def456.../"`
- `Depth`: Hierarchy depth (0 = root, 1 = child, 2 = grandchild, ...)
- `ChildrenCount`: Number of direct children (computed)

**Path generation (automatic):**

```javascript
// Pre-save hook (CongViec.js)
if (this.CongViecChaID) {
  const parent = await CongViec.findById(this.CongViecChaID);
  this.Path = parent.Path + this._id + "/";
  this.Depth = parent.Depth + 1;
} else {
  this.Path = "/" + this._id + "/";
  this.Depth = 0;
}
```

**Query all descendants:**

```javascript
// Backend service
const descendants = await CongViec.find({
  Path: new RegExp(`^${parentPath}`),
});
```

**Frontend UI:** `SubtasksSection.jsx` displays nested tree

---

### 5. **Routine Task Integration**

**Concept:** Link ad-hoc tasks to routine duties (nhiệm vụ thường quy)

**Field:** `NhiemVuThuongQuyID` (optional)

**Use case:**

- Manager creates task → Select from routine task list
- Task inherits properties from routine task (TenNhiemVu, MoTa)
- Used for KPI evaluation (link tasks to routine duties)

**Frontend:**

```javascript
// Form selector
<RoutineTaskSelector
  value={nhiemVuThuongQuyId}
  onChange={setNhiemVuThuongQuyId}
  chuKyId={selectedCycleId} // Cycle-aware
/>
```

**Backend:**

- Endpoint: `GET /api/workmanagement/kpi/nhan-vien/:id/nhiem-vu?chuKyId=...`
- Returns routine tasks for current employee + cycle

---

## 📚 Documentation Structure

### Core Documents (Must Read)

1. **README.md** (this file) - Overview, quick start, key concepts
2. **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System architecture, data flows, technical deep dive
3. **[WORKFLOW.md](./WORKFLOW.md)** - State machine, transitions, step-by-step guides
4. **[API_REFERENCE.md](./API_REFERENCE.md)** - Backend endpoints, request/response examples

### Specialized Documents

5. **[UI_COMPONENTS.md](./UI_COMPONENTS.md)** - Frontend components, Redux slices, props
6. **[FILE_MANAGEMENT.md](./FILE_MANAGEMENT.md)** - File upload/delete, soft delete pattern
7. **[PERMISSION_MATRIX.md](./PERMISSION_MATRIX.md)** - Field-level permissions, role checks

### Archived Documents

- **[../\_archive_docs_2025-11-25/](../_archive_docs_2025-11-25/)** - Legacy docs (potentially outdated)
  - TASK_GUIDE.md (396 lines) - Old entry point
  - DOCS_INDEX.md (75 lines) - Old index
  - api-spec.md, domain-models.md, workflow-status-actions.md, etc.

**Note:** Archived docs may contain outdated information (e.g., wrong state names). Always refer to current docs in `docs/` folder.

---

## 🌲 Subtasks Documentation

Tính năng **Subtasks (Cây công việc)** cho phép phân rã công việc lớn thành các công việc con với độ sâu không giới hạn.

### Quick Overview

- **Tạo subtask:** Chỉ NguoiChinhID của cha được tạo subtask
- **Hierarchy:** Dùng `Path` (Materialized Path) + `Depth` để tracking
- **Lock rule:** Không thể hoàn thành cha nếu còn con chưa HOAN_THANH
- **Progress:** Tiến độ node độc lập (không auto roll-up từ con)

### Detailed Documentation

| File                                                                             | Mô tả                                      |
| -------------------------------------------------------------------------------- | ------------------------------------------ |
| **[subtasks-feature-overview.md](./Subtask/subtasks-feature-overview.md)**       | Tổng quan tính năng, business rules, scope |
| **[subtasks-data-model.md](./Subtask/subtasks-data-model.md)**                   | Schema fields, indexes, relationships      |
| **[subtasks-api-design.md](./Subtask/subtasks-api-design.md)**                   | API endpoints cho subtasks                 |
| **[subtasks-frontend-plan.md](./Subtask/subtasks-frontend-plan.md)**             | UI components, Redux integration           |
| **[subtasks-implementation-plan.md](./Subtask/subtasks-implementation-plan.md)** | Implementation steps, milestones           |
| **[subtasks-risk-mitigation.md](./Subtask/subtasks-risk-mitigation.md)**         | Rủi ro và giải pháp                        |
| **[subtasks-user-faq.md](./Subtask/subtasks-user-faq.md)**                       | FAQ cho người dùng                         |

### Key Concepts

```javascript
// CongViec subtask fields
{
  CongViecChaID: ObjectId,    // Parent task (null if root)
  Path: ["parentId1", "parentId2"],  // Ancestor IDs array
  Depth: 2,                   // 0 = root, 1 = first level, etc.
  ChildrenCount: 3,           // Denormalized count
}

// API response includes
{
  ChildrenSummary: { total: 3, done: 1, inProgress: 2, late: 0 },
  AllChildrenDone: false      // true when all children HOAN_THANH
}
```

---

## 🛠️ Troubleshooting

### Issue 1: Version Conflict Error

**Symptom:** Toast message "Dữ liệu đã thay đổi, đã tải lại"

**Cause:** Another user updated task while you were editing (optimistic concurrency)

**Solution:** Data auto-refreshes, no action needed. Re-apply your changes if necessary.

**Prevention:**

- Complete edits quickly
- Communicate with team before bulk updates

---

### Issue 2: "Không có quyền thực hiện thao tác này"

**Symptom:** Action button disabled or error toast

**Cause:** User doesn't have permission for action (not assigner/main/participant)

**Solution:**

- Check task roles: Người giao việc, Người chính, Người phối hợp
- Contact assigner to change roles if needed

**Debug:**

```javascript
// Check permissions in Redux DevTools
state.congViec.congViecDetail.NguoiGiaoViecID === currentUser.NhanVienID; // isAssigner
state.congViec.congViecDetail.NguoiChinhID === currentUser.NhanVienID; // isMain
```

---

### Issue 3: Subtask Actions Greyed Out

**Symptom:** Cannot complete subtask, "Hoàn thành" button disabled

**Cause:** Parent task must be in `DANG_THUC_HIEN` state for subtask actions

**Solution:**

- Ensure parent task is accepted (status: `DANG_THUC_HIEN`)
- Backend validation: `CHILDREN_INCOMPLETE` error if trying to complete parent before all subtasks

---

### Issue 4: Deadline Warning Not Showing

**Symptom:** `TinhTrangThoiHan` shows "TRONG_HAN" but should be "SAP_HET_HAN"

**Cause:**

- `CanhBaoMode: "PERCENT"` but `CanhBaoSapHetHanPercent` not set
- `NgayCanhBao` not calculated correctly

**Solution:**

```javascript
// Frontend: Check form values
CanhBaoMode: "PERCENT";
CanhBaoSapHetHanPercent: 80; // Must be set (0-100)

// Backend recalculates NgayCanhBao on save
```

**Verify:**

```javascript
// Backend service: congViec.service.js
// calculateNgayCanhBao function should set NgayCanhBao automatically
```

---

### Issue 5: Comment Replies Not Loading

**Symptom:** Click "Show replies" but nothing happens

**Cause:** Lazy loading failed, check Redux state

**Debug:**

```javascript
// Redux DevTools
state.congViec.repliesByParent[parentCommentId];
// Should have: { items[], loading: false, loaded: true, error: null }
```

**Solution:**

- Check network tab for API call: `GET /api/workmanagement/congviec/:id/binh-luan/:commentId/replies`
- If 404: Parent comment ID incorrect
- If 403: Permission issue (user not assigned to task)

---

## 📝 Changelog

### V2.0 (November 25, 2025) - Documentation Rewrite

**Changes:**

- ✅ **Archive old docs** to `_archive_docs_2025-11-25/`
- ✅ **New documentation structure** with 8 files (4,000+ lines total)
- ✅ **Code-verified**: All examples from actual code (no AI hallucination)
- ✅ **Fix critical errors**: WORKFLOW.md now uses correct 5 states (TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH)
- ✅ **API verification**: All 21+ endpoints documented with request/response examples
- ✅ **New docs**: FILE_MANAGEMENT.md, PERMISSION_MATRIX.md

**Breaking Changes:** None (documentation only)

**Migration:** No code changes required. Old docs archived for reference.

---

### V1.x (Pre-November 2025) - Legacy

**Features:**

- Initial implementation of task management
- 15+ documentation files in `docs/` folder
- Some documentation had incorrect state names (MOI_TAO, CHO_PHAN_CONG, etc.)

**Issues:**

- Outdated state names (9 states instead of actual 5)
- Missing file management documentation
- API documentation incomplete

---

## 📞 Support

**For technical issues:**

- Check [Troubleshooting](#troubleshooting) section above
- Review [ARCHITECTURE.md](./ARCHITECTURE.md) for system design
- Search code comments in `congViecSlice.js` and `congViec.service.js`

**For feature requests:**

- Contact development team
- Review [../\_archive_docs_2025-11-25/improvement-suggestions.md](../_archive_docs_2025-11-25/improvement-suggestions.md) for planned features

---

**Last verified:** November 25, 2025  
**Code version:** Frontend congViecSlice.js v2 (2025-08-27), Backend CongViec.js stable  
**Documentation status:** ✅ 100% code-verified, no AI hallucination
