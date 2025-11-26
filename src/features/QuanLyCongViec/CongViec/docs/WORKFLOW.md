# Workflow & State Machine - CongViec Module

**Version:** 2.0  
**Last Updated:** November 25, 2025  
**Status:** ✅ Code-verified (CRITICAL: Fixed wrong state names)

---

## 📋 Table of Contents

- [State Machine Overview](#state-machine-overview)
- [5 States (Correct Names)](#5-states-correct-names)
- [8 Actions](#8-actions)
- [State Transition Diagram](#state-transition-diagram)
- [Detailed Workflow Stages](#detailed-workflow-stages)
- [Permission Matrix by State](#permission-matrix-by-state)
- [Deadline Warning System](#deadline-warning-system)
- [Code Implementation](#code-implementation)
- [Manager Guide](#manager-guide)
- [Employee Guide](#employee-guide)
- [Troubleshooting](#troubleshooting)

---

## 🎯 State Machine Overview

CongViec module uses a **state machine** with **5 states** and **8 actions** to manage task lifecycle.

### ⚠️ CRITICAL CORRECTION

**❌ OLD DOCUMENTATION (WRONG):** Used wrong state names (MOI_TAO, CHO_PHAN_CONG, DA_PHAN_CONG, BAT_DAU_LAM, YEU_CAU_DUYET, TU_CHOI, PHE_DUYET, etc.)

**✅ ACTUAL CODE (CORRECT):** Model uses 5 states only

```javascript
// Backend: CongViec.js:6-12
const TRANG_THAI = [
  "TAO_MOI", // Initial state
  "DA_GIAO", // Assigned
  "DANG_THUC_HIEN", // In Progress
  "CHO_DUYET", // Awaiting Approval
  "HOAN_THANH", // Completed
];
```

---

## 📊 5 States (Correct Names)

### 1. TAO_MOI (Initial State)

**Meaning:** Task created but not yet assigned  
**Who can see:** Creator (NguoiGiaoViecID), Admins  
**Available actions:**

- ✅ Edit task details (TieuDe, MoTa, NgayHetHan, NguoiChinhID, etc.)
- ✅ Delete task (soft delete)
- ✅ **GIAO_VIEC** (assign to employee)

**UI indicators:**

- Badge color: Grey
- Icon: 📝 (draft)

---

### 2. DA_GIAO (Assigned)

**Meaning:** Task assigned to employee, waiting for acceptance  
**Who can see:** NguoiGiaoViecID, NguoiChinhID, NguoiThamGia[], Admins  
**Available actions:**

- **For Assigner (NguoiGiaoViecID):**
  - ✅ **HUY_GIAO** (cancel assignment, back to TAO_MOI)
  - ✅ Edit task details
- **For Main (NguoiChinhID):**
  - ✅ **TIEP_NHAN** (accept task → DANG_THUC_HIEN)
  - ✅ View, comment

**UI indicators:**

- Badge color: Orange
- Icon: 📬 (inbox)
- Notification sent to NguoiChinhID

---

### 3. DANG_THUC_HIEN (In Progress)

**Meaning:** Employee accepted task, working on it  
**Who can see:** All participants  
**Available actions:**

- **For Main (NguoiChinhID):**
  - ✅ Update progress (`PhanTramTienDoTong` 0-100%)
  - ✅ Complete task:
    - If `CoDuyetHoanThanh = true` → **HOAN_THANH_TAM** (requires approval)
    - If `CoDuyetHoanThanh = false` → **HOAN_THANH** (directly complete)
  - ✅ Edit limited fields (`NhiemVuThuongQuyID`, `FlagNVTQKhac`)
  - ✅ Comment, upload files
- **For Assigner:**
  - ✅ View, comment, monitor progress
- **For Participants (PHOI_HOP):**
  - ✅ View, comment

**UI indicators:**

- Badge color: Blue
- Icon: 🔄 (in progress)
- Progress bar showing `PhanTramTienDoTong`

---

### 4. CHO_DUYET (Awaiting Approval)

**Meaning:** Employee reports completion, waiting for manager approval  
**Condition:** Only reached if `CoDuyetHoanThanh = true`  
**Available actions:**

- **For Main (NguoiChinhID):**
  - ✅ **HUY_HOAN_THANH_TAM** (cancel completion report, back to DANG_THUC_HIEN)
  - ✅ View, comment
- **For Assigner (NguoiGiaoViecID):**
  - ✅ **DUYET_HOAN_THANH** (approve completion → HOAN_THANH)
  - ✅ **HUY_HOAN_THANH_TAM** (reject, back to DANG_THUC_HIEN with reason)
  - ✅ View, comment

**UI indicators:**

- Badge color: Purple
- Icon: ⏳ (waiting approval)
- Notification sent to NguoiGiaoViecID

---

### 5. HOAN_THANH (Completed)

**Meaning:** Task completed and approved (or directly completed if no approval required)  
**Who can see:** All participants (read-only)  
**Available actions:**

- **For Assigner (NguoiGiaoViecID):**
  - ✅ **MO_LAI_HOAN_THANH** (reopen task, back to DANG_THUC_HIEN)
  - ✅ View
- **For others:**
  - ✅ View only

**UI indicators:**

- Badge color: Green
- Icon: ✅ (completed)
- `NgayHoanThanh` timestamp recorded
- `SoGioTre` calculated (if late)
- `HoanThanhTreHan` flag set (true/false)

---

## ⚡ 8 Actions

### Action 1: GIAO_VIEC (Assign Task)

**Transition:** `TAO_MOI → DA_GIAO`  
**Permission:** Only `NguoiGiaoViecID` (assigner)  
**Validation:**

- `NguoiChinhID` must be set
- `TieuDe`, `NgayHetHan` required

**Frontend Code:**

```javascript
// congViecSlice.js:1275-1290 (getAvailableActions)
if (st === "TAO_MOI" && isAssigner) {
  acts.push(WORK_ACTIONS.GIAO_VIEC);
}

// Dispatch action
dispatch(
  performAction({
    congViecId: task._id,
    action: WORK_ACTIONS.GIAO_VIEC,
    payload: {},
  })
);
```

**Backend Endpoint:**

```bash
POST /api/workmanagement/congviec/:id/giao-viec
Authorization: Bearer <token>

# Body: {}

# Response:
{
  "success": true,
  "data": {
    "_id": "...",
    "TrangThai": "DA_GIAO",
    "NgayGiaoViec": "2025-11-25T10:00:00Z",
    "LichSuTrangThai": [
      {
        "HanhDong": "GIAO_VIEC",
        "TuTrangThai": "TAO_MOI",
        "DenTrangThai": "DA_GIAO",
        "ThoiGian": "2025-11-25T10:00:00Z",
        "NguoiThucHienID": "..."
      }
    ]
  }
}
```

**Side Effects:**

- `NgayGiaoViec` timestamp set
- `LichSuTrangThai[]` entry added
- Notification sent to `NguoiChinhID`

---

### Action 2: HUY_GIAO (Cancel Assignment)

**Transition:** `DA_GIAO → TAO_MOI`  
**Permission:** Only `NguoiGiaoViecID`  
**Use case:** Manager changes mind before employee accepts

**Frontend:**

```javascript
if (st === "DA_GIAO" && isAssigner) {
  acts.push(WORK_ACTIONS.HUY_GIAO);
}
```

**Backend:**

```bash
POST /api/workmanagement/congviec/:id/transition
Body: { action: "HUY_GIAO", ghiChu: "Thay đổi kế hoạch" }

# Response: TrangThai = "TAO_MOI"
```

**Side Effects:**

- Revert to draft state
- `NgayGiaoViec` cleared
- `LichSuTrangThai[]` entry added with `IsRevert: true`

---

### Action 3: TIEP_NHAN (Accept Task)

**Transition:** `DA_GIAO → DANG_THUC_HIEN`  
**Permission:** Only `NguoiChinhID` (main person)  
**Meaning:** Employee confirms they will work on task

**Frontend:**

```javascript
if (st === "DA_GIAO" && isMain) {
  acts.push(WORK_ACTIONS.TIEP_NHAN);
}
```

**Backend:**

```bash
POST /api/workmanagement/congviec/:id/tiep-nhan
Body: {}

# Response: TrangThai = "DANG_THUC_HIEN", NgayTiepNhanThucTe set
```

**Side Effects:**

- `NgayTiepNhanThucTe` timestamp set (actual acceptance date)
- `PhanTramTienDoTong` defaults to 0 if not set
- Task becomes visible in "Đang thực hiện" tab

---

### Action 4: HOAN_THANH_TAM (Report Completion - Requires Approval)

**Transition:** `DANG_THUC_HIEN → CHO_DUYET`  
**Condition:** `CoDuyetHoanThanh = true`  
**Permission:** Only `NguoiChinhID`  
**Meaning:** Employee reports task is done, waiting for manager review

**Frontend:**

```javascript
if (st === "DANG_THUC_HIEN" && isMain && coDuyet) {
  acts.push(WORK_ACTIONS.HOAN_THANH_TAM);
}
```

**Backend:**

```bash
POST /api/workmanagement/congviec/:id/transition
Body: {
  action: "HOAN_THANH_TAM",
  ghiChu: "Đã hoàn thành tất cả yêu cầu"
}

# Response: TrangThai = "CHO_DUYET"
```

**Side Effects:**

- `NgayHoanThanhTam` timestamp set
- `PhanTramTienDoTong` auto-set to 100%
- Notification sent to `NguoiGiaoViecID`
- Subtask validation: All subtasks must be completed first

---

### Action 5: HUY_HOAN_THANH_TAM (Cancel Completion Report)

**Transition:** `CHO_DUYET → DANG_THUC_HIEN`  
**Permission:** `NguoiChinhID` or `NguoiGiaoViecID`  
**Use cases:**

- Employee found issues, wants to continue working
- Manager rejects completion (needs revisions)

**Frontend:**

```javascript
if (st === "CHO_DUYET") {
  if (isMain) acts.push(WORK_ACTIONS.HUY_HOAN_THANH_TAM);
  if (isAssigner) acts.push(WORK_ACTIONS.HUY_HOAN_THANH_TAM); // Can reject
}
```

**Backend:**

```bash
POST /api/workmanagement/congviec/:id/transition
Body: {
  action: "HUY_HOAN_THANH_TAM",
  ghiChu: "Cần bổ sung báo cáo"
}

# Response: TrangThai = "DANG_THUC_HIEN"
```

**Side Effects:**

- `NgayHoanThanhTam` cleared
- `PhanTramTienDoTong` reverts to previous value (or 90%)
- Notification sent to `NguoiChinhID` (if rejected by assigner)

---

### Action 6: DUYET_HOAN_THANH (Approve Completion)

**Transition:** `CHO_DUYET → HOAN_THANH`  
**Permission:** Only `NguoiGiaoViecID` (assigner)  
**Meaning:** Manager confirms task is completed satisfactorily

**Frontend:**

```javascript
if (st === "CHO_DUYET" && isAssigner) {
  acts.push(WORK_ACTIONS.DUYET_HOAN_THANH);
}
```

**Backend:**

```bash
POST /api/workmanagement/congviec/:id/duyet-hoan-thanh
Body: {
  ghiChu: "Hoàn thành tốt công việc"
}

# Response: TrangThai = "HOAN_THANH"
```

**Side Effects:**

- `NgayHoanThanh` timestamp set (official completion date)
- `SoGioTre` calculated (hours late, if any)
- `HoanThanhTreHan` flag set (true if `NgayHoanThanh > NgayHetHan`)
- Task archived to "Đã hoàn thành" section

---

### Action 7: HOAN_THANH (Direct Completion - No Approval)

**Transition:** `DANG_THUC_HIEN → HOAN_THANH`  
**Condition:** `CoDuyetHoanThanh = false`  
**Permission:** Only `NguoiChinhID`  
**Meaning:** Employee completes task directly (manager trusts them)

**Frontend:**

```javascript
if (st === "DANG_THUC_HIEN" && isMain && !coDuyet) {
  acts.push(WORK_ACTIONS.HOAN_THANH);
}
```

**Backend:**

```bash
POST /api/workmanagement/congviec/:id/hoan-thanh
Body: {}

# Response: TrangThai = "HOAN_THANH"
```

**Side Effects:** Same as DUYET_HOAN_THANH but skips CHO_DUYET state

---

### Action 8: MO_LAI_HOAN_THANH (Reopen Task)

**Transition:** `HOAN_THANH → DANG_THUC_HIEN`  
**Permission:** Only `NguoiGiaoViecID` (assigner)  
**Use case:** Found issues after completion, need to redo work

**Frontend:**

```javascript
if (st === "HOAN_THANH" && isAssigner) {
  acts.push(WORK_ACTIONS.MO_LAI_HOAN_THANH);
}
```

**Backend:**

```bash
POST /api/workmanagement/congviec/:id/transition
Body: {
  action: "MO_LAI_HOAN_THANH",
  ghiChu: "Phát hiện lỗi, cần sửa lại"
}

# Response: TrangThai = "DANG_THUC_HIEN"
```

**Side Effects:**

- `NgayHoanThanh` cleared
- `SoGioTre`, `HoanThanhTreHan` reset
- `PhanTramTienDoTong` set to 90% (not 0%)
- Notification sent to `NguoiChinhID`

---

## 📈 State Transition Diagram

```
┌──────────┐
│ TAO_MOI  │ (Draft)
│          │
└─────┬────┘
      │ GIAO_VIEC (Assigner)
      ▼
┌──────────┐
│ DA_GIAO  │ (Assigned)
│          │ ◄──── HUY_GIAO (Assigner)
└─────┬────┘
      │ TIEP_NHAN (Main)
      ▼
┌────────────────┐
│ DANG_THUC_HIEN │ (In Progress)
│                │ ◄──── HUY_HOAN_THANH_TAM (Main/Assigner)
└───┬────────┬───┘       MO_LAI_HOAN_THANH (Assigner)
    │        │           ▲
    │        │           │
    │        └─────┐     │
    │              ▼     │
    │         ┌──────────┤
    │         │ CHO_DUYET│ (Awaiting Approval)
    │         │          │
    │         └─────┬────┘
    │               │ DUYET_HOAN_THANH (Assigner)
    │               │
    │ HOAN_THANH    │
    │ (No approval) │
    └───────┬───────┘
            ▼
      ┌────────────┐
      │ HOAN_THANH │ (Completed)
      │            │
      └────────────┘
```

---

## 📝 Detailed Workflow Stages

### Stage 1: Create Task (Manager)

**Actions:**

1. Manager clicks "Tạo công việc mới" button
2. Fill form:
   - `TieuDe` (required)
   - `MoTa` (optional)
   - `NguoiChinhID` (required, select from employee list)
   - `NguoiThamGia[]` (optional, add collaborators with VaiTro: CHINH/PHOI_HOP)
   - `NgayBatDau`, `NgayHetHan` (required)
   - `MucDoUuTien` (THAP, BINH_THUONG, CAO, KHAN_CAP)
   - `CoDuyetHoanThanh` (checkbox, default: false)
   - `CanhBaoMode` (FIXED/PERCENT)
   - `NhiemVuThuongQuyID` (optional, link to routine task)
3. Click "Lưu" → Task created with `TrangThai: "TAO_MOI"`

**Code:**

```javascript
// Frontend: CongViecFormDialog.js
const onSubmit = async (data) => {
  const payload = {
    TieuDe: data.TieuDe,
    MoTa: data.MoTa,
    NguoiChinhID: data.NguoiChinh._id,
    NguoiThamGia: data.NguoiThamGia.map((p) => ({
      NhanVienID: p.NhanVienID._id,
      VaiTro: p.VaiTro,
    })),
    NgayBatDau: dayjs(data.NgayBatDau).toISOString(),
    NgayHetHan: dayjs(data.NgayHetHan).toISOString(),
    MucDoUuTien: data.MucDoUuTien,
    CoDuyetHoanThanh: data.CoDuyetHoanThanh,
    CanhBaoMode: data.CanhBaoMode,
    NgayCanhBao: data.CanhBaoMode === "FIXED" ? data.NgayCanhBao : null,
    CanhBaoSapHetHanPercent:
      data.CanhBaoMode === "PERCENT" ? data.CanhBaoSapHetHanPercent : null,
  };

  await dispatch(
    createCongViec({ nhanVienId: currentUser.NhanVienID, data: payload })
  );
};
```

---

### Stage 2: Assign Task (Manager)

**Actions:**

1. Manager finds task in "Công việc đã giao" tab (status: TAO_MOI)
2. Click task row → Detail dialog opens
3. Click "Giao việc" button
4. Confirm action → `TrangThai` changes to DA_GIAO

**Code:**

```javascript
// Frontend: TaskDetailShell.js
const handleAction = (action) => {
  dispatch(
    performAction({
      congViecId: task._id,
      action: action,
      payload: {},
    })
  );
};

// Backend: congViec.controller.js:169-176
controller.giaoViec = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await congViecService.giaoViec(id, req);
  return sendResponse(res, 200, true, result, null, "Giao việc thành công");
});
```

**Notifications:**

- Email sent to `NguoiChinhID`: "Bạn được giao công việc mới: {TieuDe}"
- Browser notification (if user online)

---

### Stage 3: Accept Task (Employee)

**Actions:**

1. Employee receives notification
2. Opens "Công việc được giao" tab → Finds task (status: DA_GIAO)
3. Click task → Detail dialog
4. Click "Tiếp nhận" button → `TrangThai` changes to DANG_THUC_HIEN

**Code:**

```javascript
// Backend: congViec.controller.js:178-185
controller.tiepNhan = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await congViecService.tiepNhan(id, req);
  return sendResponse(
    res,
    200,
    true,
    result,
    null,
    "Tiếp nhận công việc thành công"
  );
});

// Service sets: NgayTiepNhanThucTe = Date.now()
```

---

### Stage 4: Update Progress (Employee)

**Actions:**

1. Employee opens task detail
2. Click pencil icon on progress bar
3. Enter percentage (0-100%) + optional note
4. Click "Lưu" → `PhanTramTienDoTong` updated, history saved

**Code:**

```javascript
// Frontend: ProgressEditDialog.js
const handleSubmit = () => {
  dispatch(updateProgress({
    congViecId: task._id,
    progress: percentage,
    ghiChu: note
  }));
};

// Backend: congViec.controller.js:263-278
controller.updateProgress = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { PhanTramTienDoTong, GhiChu } = req.body;

  const result = await congViecService.updateProgress(id, PhanTramTienDoTong, GhiChu, req);

  return sendResponse(res, 200, true, result, null, "Cập nhật tiến độ thành công");
});

// Service: Adds to LichSuTienDo[] array
{
  Tu: oldProgress,
  Den: newProgress,
  ThoiGian: Date.now(),
  NguoiThucHienID: currentUser.NhanVienID,
  GhiChu: ghiChu
}
```

---

### Stage 5a: Complete Without Approval (Employee)

**Condition:** `CoDuyetHoanThanh = false`

**Actions:**

1. Employee completes work
2. Click "Hoàn thành" button
3. Confirm → `TrangThai` changes directly to HOAN_THANH

**Code:**

```javascript
// Frontend: getAvailableActions
if (st === "DANG_THUC_HIEN" && isMain && !coDuyet) {
  acts.push(WORK_ACTIONS.HOAN_THANH);
}

// Backend: congViec.controller.js:187-194
controller.hoanThanh = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const result = await congViecService.hoanThanh(id, req);
  return sendResponse(
    res,
    200,
    true,
    result,
    null,
    "Hoàn thành công việc thành công"
  );
});
```

---

### Stage 5b: Complete With Approval (Employee)

**Condition:** `CoDuyetHoanThanh = true`

**Actions:**

1. Employee completes work
2. Click "Hoàn thành tạm" button
3. Confirm → `TrangThai` changes to CHO_DUYET
4. Manager receives notification

**Code:**

```javascript
// Frontend
if (st === "DANG_THUC_HIEN" && isMain && coDuyet) {
  acts.push(WORK_ACTIONS.HOAN_THANH_TAM);
}

// Backend: Unified transition endpoint
router.post("/congviec/:id/transition", congViecController.transition);

// Request body
{
  action: "HOAN_THANH_TAM",
  ghiChu: "Đã hoàn thành tất cả yêu cầu"
}
```

---

### Stage 6: Approve Completion (Manager)

**Actions:**

1. Manager receives notification: "{Employee} đã báo hoàn thành công việc: {TieuDe}"
2. Opens task detail → Reviews work
3. Options:
   - **Approve:** Click "Duyệt hoàn thành" → `TrangThai` changes to HOAN_THANH
   - **Reject:** Click "Hủy hoàn thành tạm" → Back to DANG_THUC_HIEN with reason

**Code:**

```javascript
// Approve
controller.duyetHoanThanh = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { GhiChu } = req.body;
  const result = await congViecService.duyetHoanThanh(id, GhiChu, req);
  return sendResponse(res, 200, true, result, null, "Duyệt hoàn thành thành công");
});

// Reject (via transition endpoint)
{
  action: "HUY_HOAN_THANH_TAM",
  ghiChu: "Cần bổ sung báo cáo kết quả"
}
```

---

### Stage 7: Reopen Task (Manager)

**Use case:** Found issues after completion

**Actions:**

1. Manager opens completed task
2. Click "Mở lại" button
3. Enter reason → `TrangThai` changes back to DANG_THUC_HIEN
4. Employee receives notification

**Code:**

```javascript
// Frontend
if (st === "HOAN_THANH" && isAssigner) {
  acts.push(WORK_ACTIONS.MO_LAI_HOAN_THANH);
}

// Backend: congViec.service.js
// - Clears NgayHoanThanh, SoGioTre, HoanThanhTreHan
// - Sets PhanTramTienDoTong = 90% (not 0%, assumes most work done)
// - Adds LichSuTrangThai entry with IsRevert: true
```

---

## 🔐 Permission Matrix by State

| State              | View                                | Edit                            | Delete          | Comment | Upload Files          | Update Progress | Actions                                                         |
| ------------------ | ----------------------------------- | ------------------------------- | --------------- | ------- | --------------------- | --------------- | --------------------------------------------------------------- |
| **TAO_MOI**        | Assigner, Admin                     | Assigner, Admin                 | Assigner, Admin | -       | -                     | -               | GIAO_VIEC                                                       |
| **DA_GIAO**        | Assigner, Main, Participants, Admin | Assigner, Admin                 | Assigner, Admin | All     | All                   | -               | TIEP_NHAN (Main), HUY_GIAO (Assigner)                           |
| **DANG_THUC_HIEN** | All                                 | Main (limited), Assigner, Admin | Admin           | All     | Assigner, Main, CHINH | Main            | HOAN_THANH / HOAN_THANH_TAM (Main)                              |
| **CHO_DUYET**      | All                                 | -                               | -               | All     | -                     | -               | DUYET_HOAN_THANH (Assigner), HUY_HOAN_THANH_TAM (Main/Assigner) |
| **HOAN_THANH**     | All                                 | -                               | -               | -       | -                     | -               | MO_LAI_HOAN_THANH (Assigner)                                    |

**Legend:**

- **Assigner:** `NguoiGiaoViecID` (người giao việc)
- **Main:** `NguoiChinhID` (người chính)
- **Participants:** `NguoiThamGia[]` (all roles)
- **CHINH:** `NguoiThamGia[]` with `VaiTro: "CHINH"`
- **Admin:** `User.PhanQuyen: "admin"|"superadmin"`

---

## ⏰ Deadline Warning System

### 2 Warning Modes

#### Mode 1: FIXED (Manual Warning Date)

**Use case:** Manager wants specific warning date

**Configuration:**

```javascript
CanhBaoMode: "FIXED";
NgayBatDau: "2025-12-01";
NgayHetHan: "2025-12-31";
NgayCanhBao: "2025-12-28"; // Warn on Dec 28 (3 days before deadline)
```

**Frontend Form:**

```javascript
// CongViecFormDialog.js:224-245
{
  CanhBaoMode === "FIXED" && (
    <FDatePicker
      name="NgayCanhBao"
      label="Ngày cảnh báo"
      minDate={dayjs(NgayBatDau)}
      maxDate={dayjs(NgayHetHan)}
    />
  );
}
```

---

#### Mode 2: PERCENT (Auto-calculated)

**Use case:** Warn when task is X% complete (time-wise)

**Configuration:**

```javascript
CanhBaoMode: "PERCENT";
NgayBatDau: "2025-12-01"; // 30 days total
NgayHetHan: "2025-12-31";
CanhBaoSapHetHanPercent: 80; // Warn at 80% time elapsed

// Backend calculates NgayCanhBao automatically:
// NgayCanhBao = NgayBatDau + (30 days * 0.80) = Dec 25
```

**Calculation Formula:**

```javascript
// Backend: congViec.service.js (calculateNgayCanhBao)
function calculateNgayCanhBao(ngayBatDau, ngayHetHan, percent) {
  const duration = ngayHetHan - ngayBatDau; // milliseconds
  const warningOffset = duration * (percent / 100);
  const ngayCanhBao = new Date(ngayBatDau.getTime() + warningOffset);
  return ngayCanhBao;
}

// Example:
// Dec 1 to Dec 31 = 30 days = 2,592,000,000 ms
// 80% = 2,073,600,000 ms
// Dec 1 + 24 days = Dec 25
```

**Frontend Form:**

```javascript
// CongViecFormDialog.js:290-364
{
  CanhBaoMode === "PERCENT" && (
    <FTextField
      name="CanhBaoSapHetHanPercent"
      label="Phần trăm cảnh báo (%)"
      type="number"
      inputProps={{ min: 0, max: 100 }}
    />
  );
}
```

---

### TinhTrangThoiHan Virtual Field

**Computed value** (not stored in DB):

```javascript
// Backend: CongViec.js (virtual)
congViecSchema.virtual("TinhTrangThoiHan").get(function () {
  if (this.TrangThai === "HOAN_THANH") return "DA_HOAN_THANH";
  if (!this.NgayHetHan) return "KHONG_XAC_DINH";

  const now = Date.now();
  const deadline = this.NgayHetHan.getTime();
  const warning = this.NgayCanhBao?.getTime();

  if (now > deadline) return "QUA_HAN"; // Overdue
  if (warning && now >= warning) return "SAP_HET_HAN"; // Near deadline
  return "TRONG_HAN"; // On time
});
```

**UI Usage:**

```javascript
// Badge colors
const colors = {
  QUA_HAN: "error", // Red
  SAP_HET_HAN: "warning", // Orange
  TRONG_HAN: "success", // Green
  DA_HOAN_THANH: "info", // Blue
  KHONG_XAC_DINH: "default", // Grey
};
```

---

## 💻 Code Implementation

### Frontend: getAvailableActions Function

**File:** `congViecSlice.js` (lines 1275-1300)

```javascript
export function getAvailableActions(cv, { isAssigner, isMain }) {
  if (!cv) return [];
  const st = cv.TrangThai;
  const coDuyet = !!cv.CoDuyetHoanThanh;
  const A = WORK_ACTIONS;
  const acts = [];

  // TAO_MOI → GIAO_VIEC
  if (st === "TAO_MOI" && isAssigner) {
    acts.push(A.GIAO_VIEC);
  }

  // DA_GIAO → TIEP_NHAN | HUY_GIAO
  if (st === "DA_GIAO") {
    if (isMain) acts.push(A.TIEP_NHAN);
    if (isAssigner) acts.push(A.HUY_GIAO);
  }

  // DANG_THUC_HIEN → HOAN_THANH_TAM | HOAN_THANH
  if (st === "DANG_THUC_HIEN") {
    if (coDuyet) {
      if (isMain) acts.push(A.HOAN_THANH_TAM);
    } else {
      // No approval required
      if (isMain) acts.push(A.HOAN_THANH);
    }
  }

  // CHO_DUYET → HUY_HOAN_THANH_TAM | DUYET_HOAN_THANH
  if (st === "CHO_DUYET") {
    if (isMain) acts.push(A.HUY_HOAN_THANH_TAM);
    if (isAssigner) acts.push(A.DUYET_HOAN_THANH);
  }

  // HOAN_THANH → MO_LAI_HOAN_THANH
  if (st === "HOAN_THANH" && isAssigner) {
    acts.push(A.MO_LAI_HOAN_THANH);
  }

  return acts;
}
```

---

### Backend: State Machine in Service

**File:** `congViec.service.js` (~line 1769)

```javascript
// buildActionMap function
function buildActionMap(congviec, currentNhanVienId, vaiTro) {
  const st = congviec.TrangThai;
  const isAssigner =
    String(congviec.NguoiGiaoViecID) === String(currentNhanVienId);
  const isMain = String(congviec.NguoiChinhID) === String(currentNhanVienId);
  const isAdmin = ["admin", "superadmin"].includes(vaiTro?.toLowerCase());
  const coDuyet = !!congviec.CoDuyetHoanThanh;

  const allowedActions = [];

  if (st === "TAO_MOI") {
    if (isAssigner || isAdmin) allowedActions.push("GIAO_VIEC");
  }

  if (st === "DA_GIAO") {
    if (isMain || isAdmin) allowedActions.push("TIEP_NHAN");
    if (isAssigner || isAdmin) allowedActions.push("HUY_GIAO");
  }

  if (st === "DANG_THUC_HIEN") {
    if (coDuyet) {
      if (isMain || isAdmin) allowedActions.push("HOAN_THANH_TAM");
    } else {
      if (isMain || isAdmin) allowedActions.push("HOAN_THANH");
    }
  }

  if (st === "CHO_DUYET") {
    if (isMain || isAdmin) allowedActions.push("HUY_HOAN_THANH_TAM");
    if (isAssigner || isAdmin) allowedActions.push("DUYET_HOAN_THANH");
  }

  if (st === "HOAN_THANH") {
    if (isAssigner || isAdmin) allowedActions.push("MO_LAI_HOAN_THANH");
  }

  return allowedActions;
}

// isActionAllowed helper
function isActionAllowed(congviec, action, currentNhanVienId, vaiTro) {
  const allowed = buildActionMap(congviec, currentNhanVienId, vaiTro);
  return allowed.includes(action);
}
```

---

## 👨‍💼 Manager Guide

### Daily Tasks

**1. Create and Assign Tasks:**

- Navigate to "Quản lý công việc" → Tab "Công việc đã giao"
- Click "Tạo công việc mới" button
- Fill form (TieuDe, NguoiChinh, NgayHetHan are required)
- Save → Task created with status TAO_MOI
- Click task → Click "Giao việc" button

**2. Monitor Progress:**

- Tab "Công việc đã giao" shows all tasks you assigned
- Filter by TrangThai, MucDoUuTien, TinhTrangHan
- Check progress bar for each task
- Click task to view detailed progress history

**3. Approve Completions:**

- When employee reports completion (status: CHO_DUYET)
- You receive notification
- Open task → Review work
- Click "Duyệt hoàn thành" (approve) or "Hủy hoàn thành tạm" (reject)

**4. Reopen Completed Tasks:**

- Find task in "Đã hoàn thành" section
- Click task → Click "Mở lại" button
- Enter reason → Task goes back to DANG_THUC_HIEN

---

## 👷 Employee Guide

### Daily Tasks

**1. View Assigned Tasks:**

- Navigate to "Quản lý công việc" → Tab "Công việc được giao"
- Tasks with status DA_GIAO need to be accepted

**2. Accept Task:**

- Click task → Detail dialog opens
- Read requirements
- Click "Tiếp nhận" button

**3. Update Progress:**

- Open task detail
- Click pencil icon on progress bar
- Enter percentage (0-100%) + optional note
- Save → History recorded in "Lịch sử tiến độ" section

**4. Complete Task:**

- **If task requires approval** (CoDuyetHoanThanh = true):
  - Click "Hoàn thành tạm" button
  - Wait for manager to approve
- **If no approval required** (CoDuyetHoanThanh = false):
  - Click "Hoàn thành" button
  - Task completed immediately

**5. Comment and Upload Files:**

- "Bình luận" section: Add comments, reply to others
- "Tài liệu đính kèm" sidebar: Upload files, view attachments

---

## 🐛 Troubleshooting

### Issue 1: "Hoàn thành" button not showing

**Cause:** `CoDuyetHoanThanh = true`, so button is "Hoàn thành tạm" instead

**Solution:** This is correct behavior. Use "Hoàn thành tạm" → wait for manager approval

---

### Issue 2: Cannot accept task (TIEP_NHAN button disabled)

**Cause:** User is not `NguoiChinhID` (not main person)

**Solution:** Contact assigner to change `NguoiChinhID` or add you to `NguoiThamGia[]` with VaiTro: CHINH

---

### Issue 3: Warning date not showing

**Cause:** `CanhBaoMode: "PERCENT"` but `CanhBaoSapHetHanPercent` not set

**Solution:**

- Edit task
- Set "Phần trăm cảnh báo" (e.g., 80)
- Backend auto-calculates `NgayCanhBao`

---

### Issue 4: Task stuck in CHO_DUYET, cannot complete

**Cause:** Waiting for manager approval

**Solution:**

- **For employee:** Click "Hủy hoàn thành tạm" → back to DANG_THUC_HIEN
- **For manager:** Click "Duyệt hoàn thành" to approve

---

### Issue 5: Cannot complete task (subtasks incomplete)

**Symptom:** Error "Chưa hoàn thành tất cả công việc con"

**Cause:** Parent task cannot complete if subtasks are not completed

**Solution:** Complete all subtasks first (check "Công việc con" section)

---

**Last verified:** November 25, 2025  
**Code version:** Frontend congViecSlice.js v2 (2025-08-27), Backend CongViec.js stable  
**Critical fix:** State names corrected (TAO_MOI, DA_GIAO, DANG_THUC_HIEN, CHO_DUYET, HOAN_THANH)
