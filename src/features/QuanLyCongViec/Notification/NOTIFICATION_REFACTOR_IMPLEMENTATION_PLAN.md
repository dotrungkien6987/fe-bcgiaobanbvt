# 🚀 NOTIFICATION SYSTEM REFACTOR - IMPLEMENTATION PLAN

**Date:** 2025-12-19 (Updated)  
**Status:** Ready to Implement  
**Timeline:** 5-6 ngày  
**Approach:** Admin-Configurable Notification System

---

## 📌 QUYẾT ĐỊNH THIẾT KẾ (Finalized)

| Quyết Định                   | Giá Trị                         | Lý Do                                         |
| ---------------------------- | ------------------------------- | --------------------------------------------- |
| **Template Engine**          | Simple regex (không Handlebars) | Không cần dependency, flatten variables trước |
| **Variable Naming**          | Dùng tên trường model           | Consistency, dễ map                           |
| **UserNotificationSettings** | Giữ nguyên (đã có per-type)     | Không cần sửa gì                              |
| **Migration Strategy**       | Xóa thẳng code cũ               | Hệ thống chưa production                      |
| **Nested Object Access**     | Flatten trước khi gọi           | VD: `TenKhoaGui` thay vì `KhoaGui.TenKhoa`    |

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Layer Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       🎨 ADMIN UI (Frontend)                    │
│  NotificationTypeForm | NotificationTemplateForm | VariablePicker │
└────────────────────────────┬────────────────────────────────────┘
                             │ HTTP REST API
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    📡 API Controllers (Backend)                  │
│   NotificationType CRUD | NotificationTemplate CRUD | Cache Mgmt  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    🗄️  Database Models (MongoDB)                │
│   NotificationType | NotificationTemplate | Notification         │
└────────────────────────────┬────────────────────────────────────┘
                             │ Read Config
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               🔔 NotificationService (Core Engine)               │
│  • send({ type, data })                                         │
│  • processTemplate(template, data)                              │
│  • buildRecipients(config, data)                                │
│  • renderTemplate(template, data) - Simple regex                │
│  • sendToUser(userId, notification)                             │
│  • Cache: TypeCache + TemplateCache (5 min TTL)                │
└────────────────────────────┬────────────────────────────────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ 👥 NhanVien  │ │ 🔐 User      │ │ 🏥 Khoa      │
    │   Resolver   │ │  Settings    │ │  Config      │
    └──────┬───────┘ └──────┬───────┘ └──────┬───────┘
           │                │                │
           └────────────────┼────────────────┘
                            ▼
            ┌──────────────────────────────┐
            │  📬 Notification Delivery    │
            │  • Create DB record          │
            │  • Socket emit (real-time)   │
            │  • Check user settings       │
            └──────────────────────────────┘
```

### Data Flow - Send Notification

```
1️⃣  Business Logic (yeuCau.service.js)
    ↓
    await notificationService.send({
      type: 'yeucau-tao-moi',
      data: { _id, MaYeuCau, TieuDe, arrNguoiDieuPhoiID, ... }
    })

2️⃣  NotificationService.send()
    ↓
    getNotificationType('yeucau-tao-moi')  ← Cache/DB
    ↓
    getTemplates('yeucau-tao-moi')         ← Cache/DB
    ↓
    [Template 1] [Template 2] [Template 3]
         ↓            ↓            ↓
      processTemplate() (parallel)

3️⃣  ProcessTemplate() - For each template
    ↓
    buildRecipients(template.recipientConfig, data)
      • recipientConfig.variables = ['arrNguoiDieuPhoiID']
      • Extract: data.arrNguoiDieuPhoiID = [NhanVienID1, NhanVienID2]
      • Deduplicate
    ↓
    resolveNhanVienListToUserIds([NhanVienID1, NhanVienID2])
      ← notificationHelper
      → [UserID1, UserID2]
    ↓
    renderTemplate('{{MaYeuCau}} - {{TieuDe}}', data)
      • Regex replace: {{MaYeuCau}} → 'YC-001'
      → 'YC-001 - Yêu cầu hỗ trợ'
    ↓
    [UserID1] [UserID2]
         ↓        ↓
      sendToUser() (parallel)

4️⃣  SendToUser(userId, ...)
    ↓
    UserNotificationSettings.shouldSend(typeCode, 'inapp')
      • Check global toggle
      • Check per-type preference
      → true/false
    ↓
    Notification.create({ recipientId: userId, title, body, ... })
    ↓
    socketService.emitToUser(userId, 'notification:new', payload)
      → Real-time push to client
    ↓
    ✅ Done
```

---

## 📂 FILE STRUCTURE - Thay Đổi Dự Kiến

### Backend Structure

```
giaobanbv-be/
├── 🗑️  services/
│   └── ❌ triggerService.js                     (DELETE - 810 lines)
│
├── 🗑️  config/
│   └── ❌ notificationTriggers.js               (DELETE - 470 lines)
│
├── ✅ helpers/
│   └── ✅ notificationHelper.js                 (KEEP - reuse 100%)
│
├── modules/workmanagement/
│   ├── 🆕 models/
│   │   ├── ✅ Notification.js                   (MINOR EDIT - add templateId)
│   │   ├── 🆕 NotificationType.js              (NEW)
│   │   └── 🆕 NotificationTemplate.js          (NEW)
│   │
│   ├── ⚠️  services/
│   │   ├── 🔄 notificationService.js           (COMPLETE REWRITE)
│   │   ├── 🔄 yeuCau.service.js                (REFACTOR - 4 calls)
│   │   ├── 🔄 congViec.service.js              (REFACTOR - 18 calls)
│   │   ├── 🔄 file.service.js                  (REFACTOR - 3 calls)
│   │   ├── 🔄 yeuCauStateMachine.js            (REFACTOR - 1 call)
│   │   └── 🔄 danhGiaKPI.service.js            (REFACTOR - 6 calls)
│   │
│   ├── 🆕 controllers/
│   │   └── 🆕 notification.controller.js       (NEW)
│   │
│   └── 🆕 routes/
│       └── 🆕 notification.api.js              (NEW)
│
├── 🆕 seeds/
│   ├── 🆕 notificationTypes.seed.js            (NEW - 45 types)
│   └── 🆕 notificationTemplates.seed.js        (NEW - 45+ templates)
│
└── 🗑️  (Remove imports)
    ├── ❌ const triggerService = require(...)   (30+ files)
    └── ✅ const notificationService = require(...) (30+ files)
```

### Frontend Structure

```
fe-bcgiaobanbvt/src/
├── 🆕 features/Notification/Admin/
│   ├── 🆕 NotificationTypeList.js              (NEW - Table + CRUD)
│   ├── 🆕 NotificationTypeForm.js              (NEW - Create/Edit Type)
│   ├── 🆕 NotificationTemplateList.js          (NEW - Table + CRUD)
│   ├── 🆕 NotificationTemplateForm.js          (NEW - Create/Edit Template)
│   │   ├── VariablePicker.js                   (Component - Insert {{var}})
│   │   ├── TemplateEditor.js                   (Component - Title/Body)
│   │   └── RecipientSelector.js                (Component - Checkboxes)
│   ├── 🆕 TemplatePreview.js                   (NEW - Sample data test)
│   └── 🆕 notificationAdminSlice.js            (NEW - Redux state)
│
└── routes/
    └── 🔄 index.js                              (ADD routes)
```

### Migration Impact Summary

| Category     | Action        | Count                 | Effort   |
| ------------ | ------------- | --------------------- | -------- |
| **DELETE**   | Xóa hoàn toàn | 2 files (1,280 LOC)   | 5 min    |
| **NEW**      | Tạo mới       | 10 files              | 2-3 days |
| **REFACTOR** | Migrate calls | 30+ locations         | 1-2 days |
| **KEEP**     | Không đổi     | notificationHelper.js | 0 min    |

---

## ✅ PHASE 0: ERROR FIX SESSION - COMPLETED (2025-12-19)

**Status:** ✅ Server Running Successfully  
**Duration:** ~2 hours (9 test cycles)  
**Goal:** Fix MODULE_NOT_FOUND errors to enable Day 3 development

### Problems Encountered

**Primary Issue:**

- `triggerService.js` was deleted in Phase 1 but still imported in 9+ files
- Server failed to start with MODULE_NOT_FOUND error

**Secondary Issues:**

1. **Syntax Errors:** Incomplete multi-line comments (missing `*/` closures)
2. **Invalid Comment Patterns:** Single-line `//` spanning multiple lines
3. **Non-existent Method:** `notificationService.loadTemplates()` called in bin/www
4. **Port Conflict:** Previous node processes occupying port 8000

### Solution Implemented

**Strategy:** Comment out ALL triggerService code (preserved for Day 4-5 migration)

**Comment Pattern:**

```javascript
// TODO DAY 4-5: Migrate to notificationService
/* await triggerService.fire("Type.action", {
  ...data
}); */
```

**Files Modified (9 files, ~30+ trigger calls):**

| File                       | Lines | Calls     | Status       |
| -------------------------- | ----- | --------- | ------------ |
| `congViec.service.js`      | 3745  | 9 calls   | ✅ Commented |
| `yeuCau.service.js`        | 1860  | 4 calls   | ✅ Commented |
| `yeuCauStateMachine.js`    | 838   | 1 call    | ✅ Commented |
| `file.service.js`          | 617   | 3 calls   | ✅ Commented |
| `kpi.controller.js`        | 3140  | 6 calls   | ✅ Commented |
| `assignment.controller.js` | -     | 2 calls   | ✅ Commented |
| `task.controller.js`       | -     | Multiple  | ✅ Commented |
| `deadlineJobs.js`          | 176   | 2 calls   | ✅ Commented |
| `bin/www`                  | 147   | 1 removal | ✅ Fixed     |

**Detailed Changes:**

**A. congViec.service.js** - 9 trigger calls:

- Line 15: Commented import
- Line 445: `capNhatTienDo` (progress update)
- Line 1716: `giaoViec` (task assignment)
- Line 2104: Dynamic transition actions
- Line 3018: `capNhatDeadline`
- Line 3037: `thayDoiUuTien`
- Line 3057: `thayDoiNguoiChinh`
- Line 3073: `ganNguoiThamGia`
- Line 3091: `xoaNguoiThamGia`
- Line 3212: `comment`

**B. yeuCau.service.js** - 4 trigger calls:

- Line 26: Commented import
- Line 168: `TAO_MOI`
- Line 303: `SUA`
- Line 817: `BINH_LUAN`
- Line 1690: `comment`

**C. kpi.controller.js** - 6 trigger calls:

- Line 11: Commented import
- Line 136: `taoDanhGia`
- Line 491: `capNhatDiemQL`
- Line 667: `duyetDanhGia`
- Line 783: `phanHoi`
- Line 1843: `duyetTieuChi`
- Line 2214: `huyDuyet`

**D. deadlineJobs.js** - 2 deadline triggers:

- Line 8: Commented import
- Line 106: `DEADLINE_APPROACHING`
- Line 159: `DEADLINE_OVERDUE`

**E. bin/www** - Removed incompatible call:

- Line 35: Removed `notificationService.loadTemplates()`
- Reason: New v2 service uses lazy-loading (no pre-load needed)

### Testing Results

**9 Test Cycles (npm start iterations):**

1. ❌ MODULE_NOT_FOUND triggerService
2. ❌ Syntax error: Unexpected token (incomplete comment)
3. ❌ Syntax error: Multiple files
4. ❌ Syntax error: Missing `*/` closures
5. ❌ Syntax error: file.service.js
6. ❌ Syntax error: deadlineJobs.js
7. ❌ loadTemplates is not a function
8. ⚠️ Port 8000 already in use
9. ✅ **SUCCESS** - Only deprecation warning

**Final Server Status:**

```bash
✅ Express HTTP server running on port 8000
✅ MongoDB connected
✅ Socket.IO initialized
✅ Agenda.js scheduler running
✅ All route modules loaded
⚠️ Non-blocking: punycode module deprecation warning
```

**Terminal ID:** `330c4da9-582a-45dc-9cab-7fdd5ff44835` (background)

### Commands Used

**PowerShell Regex Replacement:**

```powershell
# Convert single-line to multi-line comments
(Get-Content file.js -Raw) -replace '// (await triggerService\.fire.*?\n.*?\n.*?\n.*?\}\);)', '/* $1 */' | Set-Content file.js
```

**Process Management:**

```powershell
Get-Process -Name node | Stop-Process -Force
npm start
```

### Migration Notes Preserved

All commented code includes:

- `// TODO DAY 4-5: Migrate to notificationService`
- Original trigger type (e.g., "YeuCau.TAO_MOI")
- Full context object for reference during migration

### Success Criteria ✅

- [x] All triggerService imports commented
- [x] All triggerService.fire() calls commented (~30+ calls)
- [x] Syntax errors fixed (incomplete comments)
- [x] bin/www loadTemplates() call removed
- [x] Server starts without blocking errors
- [x] All services initialized properly
- [x] Ready for Day 3 development

### Key Learnings

1. **Multi-line Comments:** PowerShell regex requires careful pattern matching
2. **Syntax Validation:** Each fix requires test cycle to reveal next error
3. **Iterative Debugging:** 9 cycles needed due to cascading syntax errors
4. **Port Management:** Kill previous node processes before restart
5. **Service Architecture:** New NotificationService v2 uses lazy-loading (no pre-load)

### Files Preserved for Migration

All commented code preserved with TODO markers for Day 4-5:

- **Pattern:** Direct mapping from `triggerService.fire("Type.action", data)` → `notificationService.send({ type: "type-action", data })`
- **Total Calls:** ~30+ across 9 files
- **Reference:** All original context objects kept in comments

---

## 📋 TÓM TẮT NGỮ CẢNH

### Vấn Đề Hiện Tại

**Hệ thống cũ (Hardcoded):**

- 46 notification triggers hardcoded trong `services/triggerService.js` (810 dòng)
- Config trong code (`TRIGGER_CONFIG_MAP`)
- 30+ chỗ gọi `triggerService.fire()` với context object phức tạp
- Template messages hardcoded
- Recipients logic hardcoded trong handler functions
- Khó debug, khó maintain, không linh hoạt

**Example code cũ:**

```javascript
// ❌ Developer phải build context object phức tạp
await triggerService.fire("YeuCau.TAO_MOI", {
  yeuCau: populated,
  performerId: nguoiYeuCauId,
  requestCode: yeuCau.MaYeuCau,
  requestTitle: yeuCau.TieuDe || "Yêu cầu mới",
  requestId: yeuCau._id.toString(),
  requesterName: nguoiYeuCau.Ten || nguoiYeuCau.HoTen || "Người yêu cầu",
  sourceDept: populated.KhoaNguonID?.TenKhoa || "Khoa",
  targetDept: populated.KhoaDichID?.TenKhoa || "Khoa",
  requestType: snapshotDanhMuc.TenLoaiYeuCau || "Yêu cầu",
  deadline: yeuCau.ThoiGianHen ? dayjs(...).format(...) : "Chưa có",
  content: yeuCau.MoTa || "Không có mô tả",
});
```

### Giải Pháp Mới

**Hệ thống mới (Admin-Configurable):**

- Config trong database (NotificationType + NotificationTemplate)
- Admin quản lý qua UI (CRUD types, templates, recipients)
- Developer chỉ truyền data thô
- Notification engine tự động xử lý
- Linh hoạt, dễ debug, dễ maintain

**Example code mới:**

```javascript
// ✅ Developer flatten variables và truyền data đơn giản
await notificationService.send({
  type: "yeucau-tao-moi",
  data: {
    _id: yeuCau._id,
    MaYeuCau: yeuCau.MaYeuCau,
    TieuDe: yeuCau.TieuDe,
    TenKhoaGui: yeuCau.KhoaNguonID?.TenKhoa, // ← Flatten
    TenKhoaNhan: yeuCau.KhoaDichID?.TenKhoa, // ← Flatten
    NguoiYeuCauID: yeuCau.NguoiYeuCauID,
    arrNguoiDieuPhoiID: dieuPhoiViên,
  },
});
```

### Lợi Ích

| Aspect                  | Hiện Tại           | Sau Refactor       | Improvement |
| ----------------------- | ------------------ | ------------------ | ----------- |
| **Debug Time**          | 30-60 phút         | 1-2 phút           | 95% faster  |
| **Code LOC**            | ~600 dòng          | ~210 dòng          | -65%        |
| **Change Notification** | 2 giờ (cần deploy) | 30 giây (admin UI) | 240x faster |
| **Add New Type**        | 1 giờ code + test  | 5 phút UI config   | 12x faster  |
| **Maintainability**     | Khó (30+ files)    | Dễ (1 service)     | ⭐⭐⭐⭐⭐  |

---

## 📊 TRIGGER MAPPING TABLE (43 Triggers → NotificationType)

### A. CÔNG VIỆC (CongViec) - 19 triggers

| #   | Old Trigger Key               | New Type Code                   | Template                 | Recipients         | Description                                   |
| --- | ----------------------------- | ------------------------------- | ------------------------ | ------------------ | --------------------------------------------- |
| 1   | `CongViec.giaoViec`           | `congviec-giao-viec`            | TASK_ASSIGNED            | assignee           | Thông báo khi được giao việc mới (legacy)     |
| 2   | `CongViec.GIAO_VIEC`          | `congviec-giao-viec`            | TASK_ASSIGNED            | assignee           | Thông báo khi được giao việc mới (transition) |
| 3   | `CongViec.HUY_GIAO`           | `congviec-huy-giao`             | TASK_CANCELLED           | assignee           | Thông báo khi hủy giao việc                   |
| 4   | `CongViec.HUY_HOAN_THANH_TAM` | `congviec-huy-hoan-thanh-tam`   | TASK_REVISION_REQUESTED  | assignee           | Thông báo khi yêu cầu làm lại                 |
| 5   | `CongViec.TIEP_NHAN`          | `congviec-tiep-nhan`            | TASK_ACCEPTED            | assigner           | Thông báo khi nhân viên tiếp nhận             |
| 6   | `CongViec.HOAN_THANH`         | `congviec-hoan-thanh`           | TASK_COMPLETED           | assigner           | Thông báo khi báo hoàn thành                  |
| 7   | `CongViec.HOAN_THANH_TAM`     | `congviec-hoan-thanh-tam`       | TASK_PENDING_APPROVAL    | assigner           | Thông báo chờ duyệt hoàn thành                |
| 8   | `CongViec.DUYET_HOAN_THANH`   | `congviec-duyet-hoan-thanh`     | TASK_APPROVED            | assignee           | Thông báo được duyệt hoàn thành               |
| 9   | `CongViec.TU_CHOI`            | `congviec-tu-choi`              | TASK_REJECTED            | assignee           | Thông báo bị từ chối (disabled)               |
| 10  | `CongViec.MO_LAI_HOAN_THANH`  | `congviec-mo-lai`               | TASK_REOPENED            | assignee           | Thông báo mở lại công việc                    |
| 11  | `CongViec.comment`            | `congviec-comment`              | COMMENT_ADDED            | all                | Thông báo có bình luận mới                    |
| 12  | `CongViec.capNhatDeadline`    | `congviec-cap-nhat-deadline`    | TASK_DEADLINE_UPDATED    | all                | Deadline thay đổi                             |
| 13  | `CongViec.ganNguoiThamGia`    | `congviec-them-nguoi-tham-gia`  | TASK_PARTICIPANT_ADDED   | newParticipant     | Thêm người tham gia                           |
| 14  | `CongViec.xoaNguoiThamGia`    | `congviec-xoa-nguoi-tham-gia`   | TASK_PARTICIPANT_REMOVED | removedParticipant | Xóa người tham gia                            |
| 15  | `CongViec.thayDoiNguoiChinh`  | `congviec-thay-doi-nguoi-chinh` | TASK_ASSIGNEE_CHANGED    | newAssignee        | Thay đổi người chính                          |
| 16  | `CongViec.thayDoiUuTien`      | `congviec-thay-doi-uu-tien`     | TASK_PRIORITY_CHANGED    | all                | Thay đổi độ ưu tiên                           |
| 17  | `CongViec.capNhatTienDo`      | `congviec-cap-nhat-tien-do`     | TASK_PROGRESS_UPDATED    | assigner           | Cập nhật tiến độ                              |
| 18  | `CongViec.uploadFile`         | `congviec-upload-file`          | TASK_FILE_UPLOADED       | all                | Upload tài liệu                               |
| 19  | `CongViec.xoaFile`            | `congviec-xoa-file`             | TASK_FILE_DELETED        | all                | Xóa tài liệu                                  |

### B. YÊU CẦU (YeuCau) - 17 triggers

| #   | Old Trigger Key             | New Type Code              | Template                | Recipients | Description                |
| --- | --------------------------- | -------------------------- | ----------------------- | ---------- | -------------------------- |
| 20  | `YeuCau.TAO_MOI`            | `yeucau-tao-moi`           | YEUCAU_CREATED          | targetDept | Có yêu cầu hỗ trợ mới      |
| 21  | `YeuCau.TIEP_NHAN`          | `yeucau-tiep-nhan`         | YEUCAU_ACCEPTED         | requester  | Yêu cầu được tiếp nhận     |
| 22  | `YeuCau.TU_CHOI`            | `yeucau-tu-choi`           | YEUCAU_REJECTED         | requester  | Yêu cầu bị từ chối         |
| 23  | `YeuCau.DIEU_PHOI`          | `yeucau-dieu-phoi`         | YEUCAU_DISPATCHED       | all        | Điều phối cho người xử lý  |
| 24  | `YeuCau.GUI_VE_KHOA`        | `yeucau-gui-ve-khoa`       | YEUCAU_RETURNED_TO_DEPT | sourceDept | Gửi về khoa yêu cầu        |
| 25  | `YeuCau.HOAN_THANH`         | `yeucau-hoan-thanh`        | YEUCAU_COMPLETED        | all        | Yêu cầu hoàn thành         |
| 26  | `YeuCau.HUY_TIEP_NHAN`      | `yeucau-huy-tiep-nhan`     | YEUCAU_CANCELLED        | requester  | Hủy tiếp nhận yêu cầu      |
| 27  | `YeuCau.DOI_THOI_GIAN_HEN`  | `yeucau-doi-thoi-gian-hen` | YEUCAU_DEADLINE_CHANGED | all        | Thời gian hẹn thay đổi     |
| 28  | `YeuCau.DANH_GIA`           | `yeucau-danh-gia`          | YEUCAU_RATED            | performer  | Đánh giá chất lượng        |
| 29  | `YeuCau.DONG`               | `yeucau-dong`              | YEUCAU_CLOSED           | all        | Yêu cầu được đóng          |
| 30  | `YeuCau.MO_LAI`             | `yeucau-mo-lai`            | YEUCAU_REOPENED         | all        | Yêu cầu được mở lại        |
| 31  | `YeuCau.YEU_CAU_XU_LY_TIEP` | `yeucau-xu-ly-tiep`        | YEUCAU_REOPENED         | performer  | Yêu cầu xử lý tiếp         |
| 32  | `YeuCau.NHAC_LAI`           | `yeucau-nhac-lai`          | YEUCAU_REMINDER         | performer  | Nhắc lại yêu cầu           |
| 33  | `YeuCau.BAO_QUAN_LY`        | `yeucau-bao-quan-ly`       | YEUCAU_ESCALATED        | manager    | Báo cáo quản lý            |
| 34  | `YeuCau.XOA`                | `yeucau-xoa`               | YEUCAU_DELETED          | all        | Yêu cầu bị xóa             |
| 35  | `YeuCau.SUA`                | `yeucau-sua`               | YEUCAU_UPDATED          | all        | Thông tin được cập nhật    |
| 36  | `YeuCau.comment`            | `yeucau-comment`           | COMMENT_ADDED           | all        | Bình luận mới trên yêu cầu |

### C. KPI - 7 triggers

| #   | Old Trigger Key     | New Type Code          | Template             | Recipients | Description                      |
| --- | ------------------- | ---------------------- | -------------------- | ---------- | -------------------------------- |
| 37  | `KPI.taoDanhGia`    | `kpi-tao-danh-gia`     | KPI_CYCLE_STARTED    | employee   | Tạo đánh giá KPI mới             |
| 38  | `KPI.duyetDanhGia`  | `kpi-duyet-danh-gia`   | KPI_EVALUATED        | employee   | KPI được duyệt                   |
| 39  | `KPI.duyetTieuChi`  | `kpi-duyet-tieu-chi`   | KPI_EVALUATED        | employee   | KPI duyệt theo tiêu chí          |
| 40  | `KPI.huyDuyet`      | `kpi-huy-duyet`        | KPI_APPROVAL_REVOKED | employee   | KPI bị hủy duyệt                 |
| 41  | `KPI.capNhatDiemQL` | `kpi-cap-nhat-diem-ql` | KPI_SCORE_UPDATED    | employee   | Điểm QL được cập nhật            |
| 42  | `KPI.tuDanhGia`     | `kpi-tu-danh-gia`      | KPI_SELF_EVALUATED   | manager    | Nhân viên hoàn thành tự đánh giá |
| 43  | `KPI.phanHoi`       | `kpi-phan-hoi`         | KPI_FEEDBACK_ADDED   | employee   | Phản hồi về đánh giá KPI         |

### D. DEADLINE (Auto by Agenda.js) - 2 triggers

| #   | Old Trigger Key                 | New Type Code               | Template             | Recipients | Description           |
| --- | ------------------------------- | --------------------------- | -------------------- | ---------- | --------------------- |
| 44  | `CongViec.DEADLINE_APPROACHING` | `congviec-deadline-sap-den` | DEADLINE_APPROACHING | all        | Công việc sắp đến hạn |
| 45  | `CongViec.DEADLINE_OVERDUE`     | `congviec-deadline-qua-han` | DEADLINE_OVERDUE     | all        | Công việc quá hạn     |

---

## 📦 VARIABLES BY TYPE (Chi tiết biến cho từng loại)

### CongViec Variables (Dùng cho triggers 1-19, 44-45)

```javascript
// NotificationType: congviec-*
variables: [
  // === IDs (Recipient Candidates) ===
  {
    name: "NguoiChinhID",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người được giao việc chính",
  },
  {
    name: "NguoiGiaoViecID",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người giao việc",
  },
  {
    name: "NguoiThamGia",
    type: "Array",
    itemType: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Danh sách người tham gia",
  },
  {
    name: "NguoiThamGiaMoi",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người tham gia mới được thêm",
  },
  {
    name: "NguoiThamGiaBiXoa",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người tham gia bị xóa",
  },
  {
    name: "NguoiChinhMoi",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người chính mới",
  },

  // === Display Fields (Flatten) ===
  { name: "_id", type: "ObjectId", description: "ID công việc" },
  { name: "MaCongViec", type: "String", description: "Mã công việc" },
  { name: "TieuDe", type: "String", description: "Tiêu đề công việc" },
  { name: "MoTa", type: "String", description: "Mô tả công việc" },
  {
    name: "TenNguoiChinh",
    type: "String",
    description: "Tên người được giao (flatten)",
  },
  {
    name: "TenNguoiGiao",
    type: "String",
    description: "Tên người giao việc (flatten)",
  },
  {
    name: "DoUuTien",
    type: "String",
    description: "Độ ưu tiên: cao/trung bình/thấp",
  },
  {
    name: "DoUuTienCu",
    type: "String",
    description: "Độ ưu tiên cũ (khi thay đổi)",
  },
  { name: "TrangThai", type: "String", description: "Trạng thái hiện tại" },
  { name: "TienDo", type: "Number", description: "Tiến độ %" },
  {
    name: "Deadline",
    type: "String",
    description: "Hạn hoàn thành (formatted)",
  },
  {
    name: "DeadlineCu",
    type: "String",
    description: "Deadline cũ (khi thay đổi)",
  },
  { name: "TenFile", type: "String", description: "Tên file (upload/xóa)" },
  { name: "NoiDungComment", type: "String", description: "Nội dung bình luận" },
  { name: "TenNguoiComment", type: "String", description: "Người bình luận" },
];
```

### YeuCau Variables (Dùng cho triggers 20-36)

```javascript
// NotificationType: yeucau-*
variables: [
  // === IDs (Recipient Candidates) ===
  {
    name: "NguoiYeuCauID",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người tạo yêu cầu",
  },
  {
    name: "NguoiXuLyID",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người được giao xử lý",
  },
  {
    name: "arrNguoiDieuPhoiID",
    type: "Array",
    itemType: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description:
      "Điều phối viên khoa (từ CauHinhThongBaoKhoa.DanhSachNguoiDieuPhoi)",
  },
  {
    name: "arrQuanLyKhoaID",
    type: "Array",
    itemType: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description:
      "Danh sách quản lý/trưởng khoa (từ CauHinhThongBaoKhoa.DanhSachQuanLyKhoa)",
  },

  // === Display Fields (Flatten) ===
  { name: "_id", type: "ObjectId", description: "ID yêu cầu" },
  { name: "MaYeuCau", type: "String", description: "Mã yêu cầu" },
  { name: "TieuDe", type: "String", description: "Tiêu đề yêu cầu" },
  { name: "MoTa", type: "String", description: "Mô tả chi tiết" },
  {
    name: "TenKhoaGui",
    type: "String",
    description: "Tên khoa gửi yêu cầu (flatten)",
  },
  {
    name: "TenKhoaNhan",
    type: "String",
    description: "Tên khoa nhận yêu cầu (flatten)",
  },
  {
    name: "TenLoaiYeuCau",
    type: "String",
    description: "Loại yêu cầu (flatten)",
  },
  {
    name: "TenNguoiYeuCau",
    type: "String",
    description: "Tên người yêu cầu (flatten)",
  },
  {
    name: "TenNguoiXuLy",
    type: "String",
    description: "Tên người xử lý (flatten)",
  },
  {
    name: "ThoiGianHen",
    type: "String",
    description: "Thời gian hẹn (formatted)",
  },
  { name: "ThoiGianHenCu", type: "String", description: "Thời gian hẹn cũ" },
  { name: "TrangThai", type: "String", description: "Trạng thái yêu cầu" },
  { name: "LyDoTuChoi", type: "String", description: "Lý do từ chối" },
  { name: "DiemDanhGia", type: "Number", description: "Điểm đánh giá (1-5)" },
  { name: "NoiDungDanhGia", type: "String", description: "Nội dung đánh giá" },
  { name: "NoiDungComment", type: "String", description: "Nội dung bình luận" },
  { name: "TenNguoiComment", type: "String", description: "Người bình luận" },
];
```

### KPI Variables (Dùng cho triggers 37-43)

```javascript
// NotificationType: kpi-*
variables: [
  // === IDs (Recipient Candidates) ===
  {
    name: "NhanVienID",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Nhân viên được đánh giá",
  },
  {
    name: "NguoiDanhGiaID",
    type: "ObjectId",
    ref: "NhanVien",
    isRecipientCandidate: true,
    description: "Người đánh giá (quản lý)",
  },

  // === Display Fields (Flatten) ===
  { name: "_id", type: "ObjectId", description: "ID đánh giá KPI" },
  {
    name: "TenNhanVien",
    type: "String",
    description: "Tên nhân viên (flatten)",
  },
  {
    name: "TenNguoiDanhGia",
    type: "String",
    description: "Tên người đánh giá (flatten)",
  },
  { name: "TenChuKy", type: "String", description: "Tên chu kỳ đánh giá" },
  {
    name: "TenTieuChi",
    type: "String",
    description: "Tên tiêu chí (nếu duyệt theo tiêu chí)",
  },
  { name: "TongDiemKPI", type: "Number", description: "Tổng điểm KPI" },
  { name: "DiemTuDanhGia", type: "Number", description: "Điểm tự đánh giá" },
  { name: "DiemQL", type: "Number", description: "Điểm quản lý đánh giá" },
  { name: "NoiDungPhanHoi", type: "String", description: "Nội dung phản hồi" },
  { name: "LyDoHuyDuyet", type: "String", description: "Lý do hủy duyệt" },
];
```

---

## 🗑️ PHASE 1: XÓA CODE CŨ

### 1.1 Files Cần Xóa Hoàn Toàn

```bash
❌ DELETE:
giaobanbv-be/services/triggerService.js (810 lines)
giaobanbv-be/config/notificationTriggers.js (nếu có)
```

### 1.2 Files Cần Giữ Lại (Reuse)

```bash
✅ KEEP:
giaobanbv-be/helpers/notificationHelper.js
  - resolveNhanVienToUserId()
  - resolveNhanVienListToUserIds()
  - getDisplayName()
  - getDisplayNames()
  → Không thay đổi gì, dùng lại 100%
```

### 1.3 Files Cần Refactor

**A. Backend Services (30+ chỗ gọi trigger)**

```bash
⚠️ REFACTOR:
giaobanbv-be/modules/workmanagement/services/
├── yeuCau.service.js (4 calls)
├── congViec.service.js (18 calls)
├── file.service.js (3 calls)
├── yeuCauStateMachine.js (1 call)
└── danhGiaKPI.service.js (6 calls trong controller)

giaobanbv-be/modules/workmanagement/controllers/
├── kpi.controller.js (6 calls)
└── assignment.controller.js (1 call)
```

**Pattern tìm kiếm:**

```bash
# Tìm tất cả trigger calls
grep -rn "triggerService.fire" giaobanbv-be/modules/workmanagement/

# Tìm imports
grep -rn "require.*triggerService" giaobanbv-be/modules/workmanagement/
```

**B. NotificationService.js - Viết Lại Hoàn Toàn**

```bash
⚠️ COMPLETE REWRITE:
giaobanbv-be/modules/workmanagement/services/notificationService.js

❌ XÓA:
- Old send() method
- Template cache cũ
- Auto-create template logic

✅ VIẾT MỚI:
- NotificationService class
  - send({ type, data })
  - processTemplate()
  - buildRecipients()
  - renderTemplate()
  - sendToUser()
  - Cache logic (NotificationType + NotificationTemplate)
```

### 1.4 Migration Checklist - Xóa Code Cũ

```bash
Step 1: Backup
[ ] git checkout -b feature/notification-refactor
[ ] cp services/triggerService.js _backups/
[ ] cp config/notificationTriggers.js _backups/ (nếu có)

Step 2: Tìm Tất Cả Trigger Calls
[ ] grep -rn "triggerService.fire" > TRIGGER_CALLS_MAP.txt
[ ] Review 30+ calls → Document từng action

Step 3: Document Old Triggers
[ ] Extract 46 trigger configs → OLD_TRIGGERS.json
[ ] Map trigger type → new type name
    VD: "YeuCau.TAO_MOI" → "yeucau-tao-moi"

Step 4: Xóa Imports
[ ] Tìm: const triggerService = require
[ ] Xóa tất cả imports trong 30+ files
```

---

## 🏗️ PHASE 2: TRIỂN KHAI HỆ THỐNG MỚI

### 2.1 Database Schema

**A. NotificationType Model**

```javascript
// giaobanbv-be/modules/workmanagement/models/NotificationType.js

const notificationTypeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    }, // 'yeucau-tao-moi'

    name: {
      type: String,
      required: true,
    }, // 'Thông báo tạo yêu cầu mới'

    description: String,

    // Định nghĩa biến
    variables: [
      {
        name: { type: String, required: true }, // 'NguoiGuiYeuCauID'
        type: {
          type: String,
          enum: [
            "String",
            "Number",
            "Boolean",
            "Date",
            "ObjectId",
            "Array",
            "Object",
          ],
          required: true,
        },
        itemType: String, // For Array type: 'ObjectId'
        ref: String, // Model reference: 'NhanVien'
        description: String,
        isRecipientCandidate: { type: Boolean, default: false }, // Có thể chọn làm người nhận
      },
    ],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

notificationTypeSchema.index({ code: 1 });
```

**B. NotificationTemplate Model**

```javascript
// giaobanbv-be/modules/workmanagement/models/NotificationTemplate.js

const notificationTemplateSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    }, // 'Thông báo cho điều phối viên'

    typeCode: {
      type: String,
      required: true,
    }, // Reference to NotificationType.code

    // Cấu hình người nhận
    recipientConfig: {
      variables: [{ type: String }], // ['arrNguoiDieuPhoiID', 'NguoiGuiYeuCauID']
    },

    // Template content (Simple {{variable}} syntax - flatten)
    titleTemplate: {
      type: String,
      required: true,
    }, // '{{MaYeuCau}} - Yêu cầu từ {{TenKhoaGui}}'

    bodyTemplate: {
      type: String,
      required: true,
    }, // 'Khoa {{TenKhoaGui}} yêu cầu: {{TieuDe}}'

    actionUrl: String, // '/yeucau/{{_id}}'

    icon: {
      type: String,
      default: "notification",
    },

    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },

    isEnabled: { type: Boolean, default: true },

    // Audit
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

notificationTemplateSchema.index({ typeCode: 1, isEnabled: 1 });
```

**C. Update Notification Model (Minor)**

```javascript
// giaobanbv-be/modules/workmanagement/models/Notification.js
// Thêm field:

templateId: {
  type: Schema.Types.ObjectId,
  ref: 'NotificationTemplate'
}, // Optional: Track which template generated this
```

### 2.2 Backend Service - NotificationService Mới

**File:** `giaobanbv-be/modules/workmanagement/services/notificationService.js`

```javascript
const mongoose = require("mongoose");
const NotificationType = require("../models/NotificationType");
const NotificationTemplate = require("../models/NotificationTemplate");
const Notification = require("../models/Notification");
const UserNotificationSettings = require("../models/UserNotificationSettings");
const notificationHelper = require("../../../helpers/notificationHelper");
const socketService = require("../../../services/socketService");

class NotificationService {
  constructor() {
    this.typeCache = new Map();
    this.templateCache = new Map();
    this.CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Main entry point
   */
  async send({ type, data }) {
    console.log(`[Notification] Type: ${type}, Data keys:`, Object.keys(data));

    // 1. Load type config (with cache)
    const notifType = await this.getNotificationType(type);
    if (!notifType || !notifType.isActive) {
      console.warn(`[Notification] Type ${type} not found or inactive`);
      return { success: false, reason: "type_not_found" };
    }

    // 2. Load enabled templates (with cache)
    const templates = await this.getTemplates(type);
    if (templates.length === 0) {
      console.warn(`[Notification] No enabled templates for ${type}`);
      return { success: false, reason: "no_templates" };
    }

    console.log(`[Notification] Found ${templates.length} template(s)`);

    // 3. Process each template (parallel)
    const results = await Promise.allSettled(
      templates.map((template) => this.processTemplate(template, data))
    );

    const sent = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    ).length;
    const failed = results.length - sent;

    console.log(`[Notification] Sent: ${sent}, Failed: ${failed}`);
    return { success: sent > 0, sent, failed };
  }

  /**
   * Process single template
   */
  async processTemplate(template, data) {
    try {
      // 1. Build recipients
      const recipientNhanVienIds = this.buildRecipients(
        template.recipientConfig,
        data
      );

      if (recipientNhanVienIds.length === 0) {
        console.warn(`[Template ${template.name}] No recipients found`);
        return { success: false, reason: "no_recipients" };
      }

      console.log(
        `[Template ${template.name}] Recipients:`,
        recipientNhanVienIds.length
      );

      // 2. Convert NhanVienID → UserID
      const userIds = await notificationHelper.resolveNhanVienListToUserIds(
        recipientNhanVienIds
      );

      if (userIds.length === 0) {
        console.warn(`[Template ${template.name}] No users found`);
        return { success: false, reason: "no_users" };
      }

      // 3. Render templates
      const title = this.renderTemplate(template.titleTemplate, data);
      const body = this.renderTemplate(template.bodyTemplate, data);
      const actionUrl = template.actionUrl
        ? this.renderTemplate(template.actionUrl, data)
        : null;

      console.log(`[Template ${template.name}] Rendered title:`, title);

      // 4. Send to each user (parallel)
      const sendResults = await Promise.allSettled(
        userIds.map((userId) =>
          this.sendToUser({
            userId,
            templateId: template._id,
            typeCode: template.typeCode,
            title,
            body,
            actionUrl,
            icon: template.icon,
            priority: template.priority,
            metadata: data,
          })
        )
      );

      const sentCount = sendResults.filter(
        (r) => r.status === "fulfilled"
      ).length;
      console.log(
        `[Template ${template.name}] Sent to ${sentCount}/${userIds.length} users`
      );

      return {
        success: sentCount > 0,
        sent: sentCount,
        failed: userIds.length - sentCount,
      };
    } catch (error) {
      console.error(`[Template ${template.name}] Error:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Build recipients from config and data
   */
  buildRecipients(recipientConfig, data) {
    const recipients = [];

    if (!recipientConfig || !recipientConfig.variables) {
      return recipients;
    }

    for (const varName of recipientConfig.variables) {
      const value = data[varName];

      if (!value) {
        console.warn(`Variable ${varName} not found in data`);
        continue;
      }

      // Handle different data types
      if (typeof value === "string") {
        recipients.push(value);
      } else if (value instanceof mongoose.Types.ObjectId) {
        recipients.push(value.toString());
      } else if (Array.isArray(value)) {
        const ids = value
          .map((item) => {
            if (typeof item === "string") return item;
            if (item instanceof mongoose.Types.ObjectId) return item.toString();
            if (item._id) return item._id.toString();
            return null;
          })
          .filter(Boolean);
        recipients.push(...ids);
      } else if (value._id) {
        recipients.push(value._id.toString());
      } else {
        console.warn(`Unknown value type for ${varName}:`, typeof value);
      }
    }

    // Deduplicate
    return [...new Set(recipients)];
  }

  /**
   * Render template with simple regex (flatten variables)
   * Supports: {{variableName}} - NO nested access (flatten trước)
   */
  renderTemplate(templateString, data) {
    try {
      return templateString.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        const value = data[key];
        if (value === undefined || value === null) return "";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      });
    } catch (error) {
      console.error("Template render error:", error);
      return templateString; // Fallback
    }
  }

  /**
   * Send to single user
   */
  async sendToUser({
    userId,
    templateId,
    typeCode,
    title,
    body,
    actionUrl,
    icon,
    priority,
    metadata,
  }) {
    // Check user settings (per-type support)
    const settings = await UserNotificationSettings.getOrCreate(userId);
    if (!settings.shouldSend(typeCode, "inapp")) {
      console.log(`User ${userId} disabled ${typeCode} notifications`);
      return null;
    }

    // Create notification document
    const notification = await Notification.create({
      recipientId: userId,
      templateId: templateId,
      type: typeCode,
      title: title,
      body: body,
      actionUrl: actionUrl,
      icon: icon || "notification",
      priority: priority || "normal",
      metadata: metadata,
      isRead: false,
      deliveredVia: ["inapp"],
    });

    console.log(`Notification created: ${notification._id} for user ${userId}`);

    // Emit socket event using existing socketService
    try {
      socketService.emitToUser(userId, "notification:new", {
        _id: notification._id,
        title: title,
        body: body,
        actionUrl: actionUrl,
        icon: icon,
        priority: priority,
        createdAt: notification.createdAt,
      });

      console.log(`Socket event emitted to user:${userId}`);
    } catch (socketError) {
      console.error("Socket emit error:", socketError);
    }

    return notification;
  }

  /**
   * Get notification type (with cache)
   */
  async getNotificationType(code) {
    const cacheKey = `type:${code}`;

    if (this.typeCache.has(cacheKey)) {
      const cached = this.typeCache.get(cacheKey);
      if (Date.now() < cached.expires) {
        return cached.data;
      }
    }

    const type = await NotificationType.findOne({ code }).lean();

    this.typeCache.set(cacheKey, {
      data: type,
      expires: Date.now() + this.CACHE_TTL,
    });

    return type;
  }

  /**
   * Get templates (with cache)
   */
  async getTemplates(typeCode) {
    const cacheKey = `templates:${typeCode}`;

    if (this.templateCache.has(cacheKey)) {
      const cached = this.templateCache.get(cacheKey);
      if (Date.now() < cached.expires) {
        return cached.data;
      }
    }

    const templates = await NotificationTemplate.find({
      typeCode,
      isEnabled: true,
    }).lean();

    this.templateCache.set(cacheKey, {
      data: templates,
      expires: Date.now() + this.CACHE_TTL,
    });

    return templates;
  }

  /**
   * Clear cache (called when admin updates config)
   */
  clearCache() {
    this.typeCache.clear();
    this.templateCache.clear();
    console.log("[Notification] Cache cleared");
  }
}

// Export singleton
module.exports = new NotificationService();
```

### 2.3 Backend APIs

**File:** `giaobanbv-be/modules/workmanagement/routes/notification.api.js`

```javascript
const router = require("express").Router();
const controller = require("../controllers/notification.controller");
const authentication = require("../../../middlewares/authentication");

// Notification Type CRUD
router.get("/types", authentication.loginRequired, controller.getAllTypes);
router.get("/types/:id", authentication.loginRequired, controller.getTypeById);
router.post("/types", authentication.loginRequired, controller.createType);
router.put("/types/:id", authentication.loginRequired, controller.updateType);
router.delete(
  "/types/:id",
  authentication.loginRequired,
  controller.deleteType
);

// Notification Template CRUD
router.get(
  "/templates",
  authentication.loginRequired,
  controller.getAllTemplates
);
router.get(
  "/templates/:id",
  authentication.loginRequired,
  controller.getTemplateById
);
router.post(
  "/templates",
  authentication.loginRequired,
  controller.createTemplate
);
router.put(
  "/templates/:id",
  authentication.loginRequired,
  controller.updateTemplate
);
router.delete(
  "/templates/:id",
  authentication.loginRequired,
  controller.deleteTemplate
);

// Admin tools
router.post(
  "/clear-cache",
  authentication.loginRequired,
  controller.clearCache
);
router.post(
  "/test-template",
  authentication.loginRequired,
  controller.testTemplate
);

module.exports = router;
```

### 2.4 Seed Data

**File:** `giaobanbv-be/seeds/notificationTypes.js`

```javascript
// Migrate 46 triggers cũ → NotificationType documents
// Example:

const types = [
  {
    code: "yeucau-tao-moi",
    name: "Thông báo tạo yêu cầu mới",
    description: "Gửi khi có yêu cầu mới từ khoa khác",
    variables: [
      // Recipient Candidates
      {
        name: "NguoiYeuCauID",
        type: "ObjectId",
        ref: "NhanVien",
        isRecipientCandidate: true,
        description: "Người tạo yêu cầu",
      },
      {
        name: "arrNguoiDieuPhoiID",
        type: "Array",
        itemType: "ObjectId",
        ref: "NhanVien",
        isRecipientCandidate: true,
        description: "Điều phối viên",
      },
      // Display Fields (flatten)
      { name: "_id", type: "ObjectId", description: "ID yêu cầu" },
      { name: "MaYeuCau", type: "String", description: "Mã yêu cầu" },
      { name: "TieuDe", type: "String", description: "Tiêu đề yêu cầu" },
      {
        name: "TenKhoaGui",
        type: "String",
        description: "Tên khoa gửi (flatten)",
      },
      {
        name: "TenKhoaNhan",
        type: "String",
        description: "Tên khoa nhận (flatten)",
      },
      {
        name: "TenNguoiYeuCau",
        type: "String",
        description: "Tên người yêu cầu (flatten)",
      },
    ],
    isActive: true,
  },
  // ... 44 more types (xem TRIGGER MAPPING TABLE)
];

// Run seed
async function seedNotificationTypes() {
  for (const type of types) {
    await NotificationType.findOneAndUpdate({ code: type.code }, type, {
      upsert: true,
      new: true,
    });
  }
  console.log(`✅ Seeded ${types.length} notification types`);
}
```

### 2.5 Migration Example - yeuCau.service.js

**BEFORE (Line 169-187):**

```javascript
await triggerService.fire("YeuCau.TAO_MOI", {
  yeuCau: populated,
  performerId: nguoiYeuCauId,
  requestCode: yeuCau.MaYeuCau,
  requestTitle: yeuCau.TieuDe || "Yêu cầu mới",
  requestId: yeuCau._id.toString(),
  requesterName: nguoiYeuCau.Ten || nguoiYeuCau.HoTen || "Người yêu cầu",
  sourceDept: populated.KhoaNguonID?.TenKhoa || "Khoa",
  targetDept: populated.KhoaDichID?.TenKhoa || "Khoa",
  requestType: snapshotDanhMuc.TenLoaiYeuCau || "Yêu cầu",
  deadline: yeuCau.ThoiGianHen
    ? dayjs(yeuCau.ThoiGianHen).format("DD/MM/YYYY HH:mm")
    : "Chưa có",
  content: yeuCau.MoTa || "Không có mô tả",
});
```

**AFTER:**

```javascript
// Lấy điều phối viên
const cauHinh = await CauHinhThongBaoKhoa.findOne({
  KhoaID: yeuCau.KhoaDichID,
});
const arrNguoiDieuPhoiID =
  cauHinh?.DanhSachNguoiDieuPhoi.map((x) => x.NhanVienID) || [];

await notificationService.send({
  type: "yeucau-tao-moi",
  data: {
    // Recipient Candidates (IDs)
    _id: yeuCau._id,
    NguoiYeuCauID: yeuCau.NguoiYeuCauID,
    arrNguoiDieuPhoiID: arrNguoiDieuPhoiID,
    // Display Fields (flatten nested objects)
    MaYeuCau: yeuCau.MaYeuCau,
    TieuDe: yeuCau.TieuDe,
    TenKhoaGui: yeuCau.KhoaNguonID?.TenKhoa || "",
    TenKhoaNhan: yeuCau.KhoaDichID?.TenKhoa || "",
    TenNguoiYeuCau: populated.NguoiYeuCauID?.HoTen || "",
  },
});
```

**Example 2: YeuCau.BAO_QUAN_LY - Escalate to Department Managers**

```javascript
// BEFORE
await triggerService.fire("YeuCau.BAO_QUAN_LY", {
  yeuCau: populated,
  requestCode: yeuCau.MaYeuCau,
  // ... complex context
});

// AFTER - Get quản lý khoa from CauHinhThongBaoKhoa
const cauHinh = await CauHinhThongBaoKhoa.layTheoKhoa(yeuCau.KhoaDichID);
const arrQuanLyKhoaID = cauHinh?.layDanhSachQuanLyKhoaIDs() || [];

if (arrQuanLyKhoaID.length === 0) {
  console.warn(`Khoa ${yeuCau.KhoaDichID} chưa cấu hình quản lý`);
  // Optionally skip notification or use fallback
}

await notificationService.send({
  type: "yeucau-bao-quan-ly",
  data: {
    _id: yeuCau._id,
    arrQuanLyKhoaID: arrQuanLyKhoaID, // ← Danh sách quản lý khoa
    NguoiYeuCauID: yeuCau.NguoiYeuCauID,
    MaYeuCau: yeuCau.MaYeuCau,
    TieuDe: yeuCau.TieuDe,
    TenKhoaNhan: yeuCau.KhoaDichID?.TenKhoa || "",
    TenNguoiYeuCau: populated.NguoiYeuCauID?.HoTen || "",
    TrangThai: yeuCau.TrangThai,
  },
});
```

---

## 🎨 PHASE 3: ADMIN UI

### 3.1 Frontend Structure

```
fe-bcgiaobanbvt/src/features/Notification/Admin/
├── NotificationTypeList.js
├── NotificationTypeForm.js
├── NotificationTemplateList.js
├── NotificationTemplateForm.js
├── VariablePicker.js
├── TemplateBuilder.js
├── TemplatePreview.js
└── notificationAdminSlice.js
```

### 3.2 Key Components

**A. NotificationTypeForm.js**

- CRUD notification types
- Variable list editor
- Mark variables as recipient candidates

**B. NotificationTemplateForm.js**

- Select type (dropdown)
- Recipient configuration (checkboxes for variables marked as candidates)
- Template editor (title, body, actionUrl)
- Variable picker (insert {{variableName}})
- Preview với sample data
- Enable/disable toggle

**C. VariablePicker.js**

- Dropdown/modal chọn biến
- Insert vào cursor position
- Show variable type and description

**D. TemplatePreview.js**

- Sample data input
- Render preview
- Show final output

---

## 📋 IMPLEMENTATION TIMELINE

### ✅ Phase 0: Error Fix Session (COMPLETED - 2025-12-19)

**Goal:** Fix server startup errors blocking Day 3 development

```bash
✅ Session Completed
[x] Identified 9 files with triggerService imports
[x] Commented all imports with TODO DAY 4-5 markers
[x] Commented ~30+ triggerService.fire() calls
[x] Fixed syntax errors (incomplete multi-line comments)
[x] Removed bin/www loadTemplates() call
[x] Killed port conflicts (previous node processes)
[x] Verified server startup (9 test cycles)
[x] Server running successfully on port 8000
[x] All services initialized (Socket.IO, Agenda.js, MongoDB)
```

**Result:** ✅ Server ready for Day 3 development  
**Duration:** ~2 hours (iterative debugging)  
**Files Modified:** 9 files, ~30+ trigger calls preserved for migration

---

### Day 1: Backend Models & Service

```bash
✅ Morning
[ ] Create NotificationType model
[ ] Create NotificationTemplate model
[ ] Update Notification model (add templateId)
[ ] Create indexes

✅ Afternoon
[ ] Implement NotificationService class
[ ] Test với 1 action (yeucau-tao-moi)
[ ] Verify end-to-end flow
```

### Day 2: Migration Script & Seed Data

```bash
✅ Morning
[ ] Extract 46 triggers từ code cũ
[ ] Create notificationTypes seed
[ ] Create notificationTemplates seed
[ ] Run seed script

✅ Afternoon
[ ] Test 5 actions với seed data
[ ] Fix bugs if any
[ ] Document variable mappings
```

### Day 3: Backend APIs

```bash
✅ Morning
[ ] Create notification.controller.js
[ ] CRUD endpoints cho Type
[ ] CRUD endpoints cho Template
[ ] Clear cache endpoint

✅ Afternoon
[ ] Test APIs với Postman
[ ] Add validation
[ ] Add error handling
```

### Day 4-5: Migrate All Service Calls

```bash
✅ Day 4 Morning
[ ] Migrate yeuCau.service.js (4 calls)
[ ] Migrate congViec.service.js (18 calls)
[ ] Test each migration

✅ Day 4 Afternoon
[ ] Migrate file.service.js (3 calls)
[ ] Migrate yeuCauStateMachine.js (1 call)
[ ] Migrate kpi.controller.js (6 calls)

✅ Day 5 Morning
[ ] Migrate remaining controllers
[ ] Remove all triggerService imports
[ ] Remove triggerService.js file

✅ Day 5 Afternoon
[ ] Full integration test
[ ] Test 10+ scenarios
[ ] Fix bugs
```

### Day 6-7: Admin UI

```bash
✅ Day 6
[ ] Redux slice
[ ] Type CRUD pages
[ ] Template CRUD pages
[ ] Basic forms

✅ Day 7
[ ] Variable picker component
[ ] Template builder
[ ] Preview functionality
[ ] Polish UI/UX
```

---

## ✅ TESTING CHECKLIST

### Unit Tests

```bash
[ ] NotificationService.buildRecipients()
[ ] NotificationService.renderTemplate()
[ ] NotificationService.send()
[ ] Cache hit/miss scenarios
```

### Integration Tests

```bash
[ ] Create yêu cầu → Notification gửi đúng người
[ ] Update KPI → Notification gửi đúng template
[ ] Multiple templates → Gửi song song
[ ] User disabled notifications → Không gửi
[ ] Template disabled → Không gửi
```

### E2E Tests

```bash
[ ] Admin tạo type → Success
[ ] Admin tạo template → Success
[ ] Admin enable/disable template → Reflect ngay
[ ] Developer tạo yêu cầu → User nhận notification
[ ] Template render đúng variables
[ ] Socket event emit đúng
```

---

## 🚨 ROLLBACK PLAN

Nếu có vấn đề nghiêm trọng:

```bash
Step 1: Revert code
git revert <commit-hash>

Step 2: Keep old triggerService.js backup
Restore từ _backups/

Step 3: Database rollback
DROP TABLE notificationtypes
DROP TABLE notificationtemplates
(Notifications collection giữ nguyên - vẫn dùng được)
```

---

## 📊 SUCCESS METRICS

**✅ Phase 0 (COMPLETED - 2025-12-19):**

- [x] Server startup error fixed (MODULE_NOT_FOUND)
- [x] 9 files with triggerService imports identified and commented
- [x] ~30+ trigger calls preserved with TODO markers
- [x] Syntax errors fixed (incomplete multi-line comments)
- [x] bin/www incompatible call removed
- [x] Server running successfully (port 8000)
- [x] All services initialized (Socket.IO, Agenda.js, MongoDB)
- [x] Ready for Day 3 development

**Sau 1 tuần:**

- [ ] 46 notification types seeded
- [ ] 46+ templates seeded
- [ ] 30+ service calls migrated
- [ ] 0 regression bugs
- [ ] Admin UI functional
- [ ] Documentation complete

**Sau 1 tháng:**

- [ ] Admin đã tạo thêm 5+ templates mới
- [ ] Notification đúng 100%
- [ ] Debug time giảm 90%
- [ ] User satisfaction tăng

---

## 📝 NOTES

### Critical Reminders

1. **User vs NhanVien:**

   - Service nhận NhanVienID
   - Convert sang UserID qua `notificationHelper.resolveNhanVienListToUserIds()`
   - Notification gửi cho UserID

2. **Flatten Data Pattern:**

   - **KHÔNG dùng nested access** - flatten trước khi gọi send()
   - ❌ `{{KhoaGui.TenKhoa}}` - KHÔNG HỖ TRỢ
   - ✅ `{{TenKhoaGui}}` - flatten ra variable riêng
   - Populate data trước, rồi extract ra flat fields

3. **Template Engine:**

   - Simple regex: `{{variableName}}` only
   - Không cần Handlebars dependency
   - Không hỗ trợ conditionals, loops - chỉ variable substitution

4. **UserNotificationSettings (Per-Type):**

   - Đã hỗ trợ sẵn per-type toggle
   - Dùng `settings.shouldSend(typeCode, 'inapp')` để check
   - UI settings đã có tại `/cai-dat/thong-bao`

5. **Socket Service:**

   - Dùng `socketService.emitToUser()` (có sẵn)
   - KHÔNG dùng `getIO()` trực tiếp

6. **CauHinhThongBaoKhoa - Recipient Resolution:**

   - Model quản lý điều phối viên và quản lý theo khoa
   - **Methods sẵn có:**
     - `cauHinh.layDanhSachNguoiDieuPhoiIDs()` → Array of NhanVienID
     - `cauHinh.layDanhSachQuanLyKhoaIDs()` → Array of NhanVienID
   - **Pattern usage:**
     ```javascript
     const cauHinh = await CauHinhThongBaoKhoa.layTheoKhoa(khoaId);
     if (!cauHinh) {
       console.warn(`Khoa ${khoaId} chưa được cấu hình`);
       return; // Or use fallback
     }
     const arrNguoiDieuPhoiID = cauHinh.layDanhSachNguoiDieuPhoiIDs();
     const arrQuanLyKhoaID = cauHinh.layDanhSachQuanLyKhoaIDs();
     ```
   - **Variables to pass:**
     - `arrNguoiDieuPhoiID` (Array) - For dispatchers
     - `arrQuanLyKhoaID` (Array) - For managers/escalation

7. **Error Handling:**

   - Notification fail KHÔNG ảnh hưởng business logic
   - Wrap trong try-catch
   - Log error nhưng không throw

8. **Cache Invalidation:**

   - Admin update template → Clear cache
   - TTL 5 phút backup
   - Manual clear cache button

9. **Testing:**

   - Test từng action sau khi migrate
   - Verify DB có notification documents
   - Check socket events

10. **Phase 0 Migration Pattern (2025-12-19):**

- All commented code includes: `// TODO DAY 4-5: Migrate to notificationService`
- Original trigger types preserved for reference
- Full context objects kept in comments
- Direct mapping: `triggerService.fire("Type.action", data)` → `notificationService.send({ type: "type-action", data })`
- Total: ~30+ calls across 9 files awaiting migration

---

## 🔗 REFERENCES

- REFACTOR_CONTEXT_SUMMARY.md - Chi tiết ngữ cảnh và brainstorming
- SCHEMA_QUICK_REFERENCE.md - Schema models reference
- QUICK_AUDIT_CHECKLIST.md - Audit checklist cho old system

---

## 📝 CHANGE LOG

### 2025-12-19 (Phase 0 Completed)

**Error Fix Session:**

- Fixed MODULE_NOT_FOUND errors (triggerService deleted but still imported)
- Commented all triggerService imports and calls in 9 files (~30+ calls)
- Fixed syntax errors from incomplete multi-line comments
- Removed bin/www loadTemplates() call (incompatible with v2 architecture)
- Resolved port conflicts and verified server startup
- All services initialized successfully (Socket.IO, Agenda.js, MongoDB)
- Server running on port 8000 with only deprecation warning (non-blocking)

**Files Modified:**

- `congViec.service.js` - 9 trigger calls commented
- `yeuCau.service.js` - 4 trigger calls commented
- `yeuCauStateMachine.js` - 1 trigger call commented
- `file.service.js` - 3 trigger calls commented
- `kpi.controller.js` - 6 trigger calls commented
- `assignment.controller.js` - 2 trigger calls commented
- `task.controller.js` - Multiple trigger calls commented
- `deadlineJobs.js` - 2 deadline trigger calls commented
- `bin/www` - Removed loadTemplates() call

**Status:** ✅ Ready for Day 3 development (Backend APIs)

---

## 📊 TIMELINE & PROGRESS - TRỰC QUAN

### Overall Progress: Day 0-7 COMPLETE ✅ | Day 8-10 PENDING ⏳

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION REFACTOR TIMELINE                        │
└─────────────────────────────────────────────────────────────────────────────┘

WEEK 1: BACKEND CORE & MIGRATION
════════════════════════════════════════════════════════════════════════════

Day 0-1: Preparation & Cleanup                                    ████████ 100%
├─ Backup old triggerService.js                                   ✅ DONE
├─ Comment out all trigger calls (~30 calls)                      ✅ DONE
├─ Fix MODULE_NOT_FOUND errors (9 cycles)                         ✅ DONE
└─ Server running successfully                                    ✅ DONE

Day 2-3: Backend Models & Service                                 ████████ 100%
├─ Create NotificationType model                                  ✅ DONE
├─ Create NotificationTemplate model                              ✅ DONE
├─ Rewrite notificationService.js v2                              ✅ DONE
│  ├─ send({ type, data }) pattern                                ✅ DONE
│  ├─ Template rendering (regex-based)                            ✅ DONE
│  ├─ Recipient resolution                                        ✅ DONE
│  └─ Cache management (5 min TTL)                                ✅ DONE
└─ Backend API routes (notificationTemplateRoutes.js)             ✅ DONE

Day 4-5: Migration of Trigger Calls                               ████████ 100%
├─ YeuCau Service (4 calls)                                       ✅ DONE
│  └─ taoYeuCau() → send({ type: 'yeucau-tao-moi', data })       ✅ DONE
├─ CongViec Service (18 calls)                                    ✅ DONE
│  ├─ giaoViec() → send({ type: 'congviec-giao-viec', data })    ✅ DONE
│  ├─ capNhatTienDo() → ...                                       ✅ DONE
│  └─ Other transitions...                                        ✅ DONE
├─ KPI Controller (6 calls)                                       ✅ DONE
│  ├─ taoDanhGia() → send({ type: 'kpi-tao-danh-gia', data })    ✅ DONE
│  └─ duyetDanhGia() → ...                                        ✅ DONE
├─ File Service (3 calls)                                         ✅ DONE
├─ YeuCauStateMachine (1 call)                                    ✅ DONE
├─ DeadlineJobs (2 calls)                                         ✅ DONE
└─ Assignment Controller (2 calls)                                ✅ DONE
    Total Migrated: ~29 trigger calls                             ✅ DONE

Day 6: Seed Data Creation                                         ████████ 100%
├─ notificationTypes.seed.js                                      ✅ DONE
│  ├─ 44 notification types created                               ✅ DONE
│  │  ├─ congviec-* (19 types)                                    ✅ DONE
│  │  ├─ yeucau-* (17 types)                                      ✅ DONE
│  │  ├─ kpi-* (7 types)                                          ✅ DONE
│  │  └─ deadline-* (2 types)                                     ✅ DONE
│  └─ Variables definition (recipient candidates + display)       ✅ DONE
└─ notificationTemplates.seed.js                                  ✅ DONE
   ├─ 53 templates created (multiple per type)                    ✅ DONE
   └─ Vietnamese content with {{variable}} syntax                 ✅ DONE

Day 7: Integration Testing                                        ████████ 100%
├─ Verify yeuCau.service.js taoYeuCau()                           ✅ DONE
│  └─ Calls notificationService.send() correctly                  ✅ DONE
├─ Verify template variables matching                             ✅ DONE
├─ Server logs comprehensive                                      ✅ DONE
└─ Ready for production testing                                   ✅ DONE

═══════════════════════════════════════════════════════════════════════════════

WEEK 2: ADMIN UI & FRONTEND
════════════════════════════════════════════════════════════════════════════

Day 8: Backend API + NotificationType UI                          ░░░░░░░░ 0%
├─ Create notificationTypeController.js                           ⏳ TODO
├─ Create notificationTypeRoutes.js                               ⏳ TODO
├─ Update notificationAdminSlice.js                               ⏳ TODO
└─ Create NotificationTypePage.js                                 ⏳ TODO

Day 9: Update Template UI + Recipient Config                      ░░░░░░░░ 0%
├─ Update NotificationTemplateForm.js                             ⏳ TODO
│  ├─ Add typeCode dropdown (from types)                          ⏳ TODO
│  ├─ Add recipient config section                                ⏳ TODO
│  └─ Add variable picker                                         ⏳ TODO
├─ Create RecipientSelector component                             ⏳ TODO
└─ Create VariablePicker component                                ⏳ TODO

Day 10: Integration + Cleanup + Testing                           ░░░░░░░░ 0%
├─ Update routes + menu                                           ⏳ TODO
├─ Cache clear UI                                                 ⏳ TODO
├─ Code cleanup (remove old patterns)                             ⏳ TODO
└─ Full integration testing                                       ⏳ TODO

═══════════════════════════════════════════════════════════════════════════════

SUMMARY
═══════
✅ Backend Core:        100% (Models, Service, Migration, Seeds)
✅ Integration Test:    100% (Verified working)
⏳ Admin UI:            0% (Pending - 3 days)
⏳ Code Cleanup:        0% (Pending - included in Day 10)

Estimated Time Remaining: 3 days (24 hours)
Current Status: READY FOR ADMIN UI DEVELOPMENT
```

---

## 📋 PHÂN TÍCH CODE HIỆN CÓ - CHI TIẾT

### 🎯 Discovery: Admin UI Đã Có Sẵn 60%!

Khi phân tích frontend code, phát hiện hệ thống **đã có Admin UI cho NotificationTemplate** nhưng với schema cũ (old triggerService format). Đây là tin tốt - có thể tái sử dụng thay vì viết mới hoàn toàn!

---

### 📂 File Inventory - Existing Notification Code

```
fe-bcgiaobanbvt/src/features/Notification/
│
├─ 👤 USER-FACING COMPONENTS (100% Compatible - Giữ nguyên)
│  ├─ NotificationBell.js            (~150 LOC)    ✅ KEEP
│  ├─ NotificationDropdown.js        (~200 LOC)    ✅ KEEP
│  ├─ NotificationDrawer.js          (~180 LOC)    ✅ KEEP
│  ├─ NotificationItem.js            (~120 LOC)    ✅ KEEP
│  └─ notificationSlice.js           (~271 LOC)    ✅ KEEP
│     └─ State: notifications, unreadCount, settings, availableTypes
│
├─ ⚙️ USER SETTINGS (95% Compatible - Cần update nhỏ)
│  └─ NotificationSettings.js        (~278 LOC)    ✅ REUSE 95%
│     ├─ Global toggles (enableNotifications, enablePush)      ✅ OK
│     ├─ Quiet hours configuration                             ✅ OK
│     ├─ Per-type settings (inapp/push toggles)                ✅ OK
│     └─ API: /api/notifications/settings                      ✅ OK
│        └─ availableTypes array → Compatible với new typeCode! ✅
│
└─ 🔧 ADMIN TEMPLATE MANAGEMENT (60% Compatible - Cần chỉnh sửa)
   ├─ Admin/
   │  ├─ NotificationTemplateTable.js    (~329 LOC)    ⚠️ MODIFY 20%
   │  │  ├─ Material-UI Table với filters              ✅ Reuse
   │  │  ├─ Pagination                                  ✅ Reuse
   │  │  ├─ Edit/Test/Delete actions                   ✅ Reuse
   │  │  └─ ⚠️ Column "Type" → Cần đổi thành "Type Code"
   │  │
   │  ├─ NotificationTemplateForm.js     (~373 LOC)    ⚠️ MODIFY 40%
   │  │  ├─ React Hook Form + Yup validation           ✅ Reuse
   │  │  ├─ FormProvider pattern                       ✅ Reuse
   │  │  ├─ Variable detection (regex extract)         ✅ Reuse
   │  │  ├─ Icon selector                              ✅ Reuse
   │  │  ├─ Category/Priority dropdowns                ✅ Reuse
   │  │  ├─ ⚠️ Field "type" (UPPERCASE) → Đổi thành "typeCode" (kebab-case)
   │  │  ├─ ❌ THIẾU: Recipient configuration section
   │  │  └─ ❌ THIẾU: Variable picker (click to insert)
   │  │
   │  ├─ NotificationTemplateTest.js     (~150 LOC)    ✅ REUSE 90%
   │  │  ├─ Test dialog với sample data                ✅ Reuse
   │  │  ├─ Preview rendered result                    ✅ Reuse
   │  │  └─ ⚠️ API endpoint minor adjustment
   │  │
   │  ├─ notificationTemplateSlice.js    (~275 LOC)    ⚠️ MODIFY 30%
   │  │  ├─ CRUD actions cho templates                 ✅ Reuse
   │  │  ├─ Pagination + filters                       ✅ Reuse
   │  │  ├─ Stats aggregation                          ✅ Reuse
   │  │  └─ ❌ THIẾU: Actions cho NotificationType
   │  │
   │  └─ index.js                        (~20 LOC)     ✅ KEEP
   │
   └─ ❌ THIẾU HOÀN TOÀN: NotificationType Management
      ├─ NotificationTypePage.js         (CHƯA CÓ)     🆕 CREATE NEW
      ├─ NotificationTypeForm.js         (CHƯA CÓ)     🆕 CREATE NEW
      └─ Variable management UI          (CHƯA CÓ)     🆕 CREATE NEW
```

---

### 🔍 Schema Mismatch Analysis

#### ⚠️ CRITICAL: Old vs New Schema Differences

**Old Schema (triggerService era):**

```javascript
// NotificationTemplate model (OLD)
{
  type: "TASK_ASSIGNED",           // ❌ UPPERCASE format
  name: "Thông báo giao việc",
  category: "task",
  titleTemplate: "{{taskName}}",
  bodyTemplate: "...",
  requiredVariables: ["taskName", "assignerName"],  // ❌ Flat array
  // ❌ NO recipient configuration
}
```

**New Schema (NotificationType + NotificationTemplate):**

```javascript
// NotificationType model (NEW)
{
  code: "congviec-giao-viec",      // ✅ kebab-case
  name: "Thông báo giao việc",
  variables: [                      // ✅ Detailed variable definitions
    {
      name: "NguoiChinhID",
      type: "ObjectId",
      ref: "NhanVien",
      isRecipientCandidate: true,   // ✅ NEW: Recipient flag
      description: "Người được giao"
    },
    {
      name: "MaCongViec",
      type: "String",
      description: "Mã công việc"
    }
  ]
}

// NotificationTemplate model (NEW)
{
  typeCode: "congviec-giao-viec",   // ✅ References NotificationType
  name: "Thông báo cho người chính",
  recipientConfig: {                // ✅ NEW: Recipient configuration
    variables: ["NguoiChinhID"]
  },
  titleTemplate: "{{MaCongViec}}",
  bodyTemplate: "..."
}
```

#### Migration Strategy

| Component            | Old Pattern         | New Pattern                | Action  |
| -------------------- | ------------------- | -------------------------- | ------- |
| **Form Field**       | `type` (FTextField) | `typeCode` (FAutocomplete) | UPDATE  |
| **Validation**       | `/^[A-Z_]+$/`       | `/^[a-z-]+$/`              | UPDATE  |
| **Variable Source**  | Flat array          | NotificationType.variables | UPDATE  |
| **Recipient Config** | N/A                 | Multi-checkbox             | ADD NEW |
| **Variable Picker**  | Manual typing       | Click-to-insert buttons    | ADD NEW |

---

### 🗄️ Backend API Analysis

#### Existing Backend (Unified - Current)

```
giaobanbv-be/modules/workmanagement/
│
├─ routes/
│  └─ notification.api.js                         ✅ Unified router
│     └─ Mounted tại /api/workmanagement/notifications
│
├─ controllers/
│  └─ notification.controller.js                  ✅ Unified controller
│     ├─ Templates CRUD: /templates, /templates/:id
│     ├─ Preview: POST /templates/:id/preview
│     ├─ Types CRUD: /types, /types/:id
│     ├─ Tools: POST /test-send, POST /clear-cache
│
├─ services/
│  └─ notificationService.js                      ✅ v2 service
│     ├─ send({ type, data })
│     ├─ Cache management
│     ├─ Template rendering ({{var}})
│     └─ Recipient resolution
│
└─ models/
  ├─ NotificationType.js
  ├─ NotificationTemplate.js
  └─ Notification.js
```

#### Legacy Backend (Deprecated)

- `modules/workmanagement/controllers/notificationTemplateController.js` và `modules/workmanagement/routes/notificationTemplateRoutes.js`
  đã bị **deprecate** (trả về **410 Gone**) để tránh gọi nhầm `/api/notification-templates/*`.

---

## 🎨 PHASE 3: ADMIN UI - KẾ HOẠCH CHI TIẾT

### 📅 Timeline: Day 8-10 (3 ngày làm việc)

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                         DAY 8 - NOTIFICATION TYPES                        ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Morning (4h):                                                            ║
║  ├─ [BE] Create notificationTypeController.js                             ║
║  │        Methods: getTypes, getType, createType, updateType, deleteType  ║
║  ├─ [BE] Create notificationTypeRoutes.js với adminRequired               ║
║  └─ [BE] Test API với Postman/Thunder Client                              ║
║                                                                            ║
║  Afternoon (4h):                                                          ║
║  ├─ [FE] Update notificationAdminSlice.js (add type actions)              ║
║  ├─ [FE] Create NotificationTypePage.js (table + inline form)             ║
║  │        Pattern: QuanLyCauHinhPage.js (single-page CRUD)                ║
║  └─ [FE] Test create/update/delete types từ UI                            ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║                   DAY 9 - TEMPLATE UI ENHANCEMENT                         ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Morning (4h):                                                            ║
║  ├─ [FE] Create RecipientSelector.js component                            ║
║  │        Multi-checkbox từ type.variables có isRecipientCandidate        ║
║  ├─ [FE] Create VariablePicker.js component                               ║
║  │        Chip buttons → click to insert {{variable}}                     ║
║  └─ [FE] Test components standalone                                       ║
║                                                                            ║
║  Afternoon (4h):                                                          ║
║  ├─ [FE] Update NotificationTemplateForm.js                               ║
║  │   ├─ Change "type" field → "typeCode" (Autocomplete từ types)         ║
║  │   ├─ Add Recipient Config section                                      ║
║  │   ├─ Integrate VariablePicker                                          ║
║  │   └─ Add validation: warn if template var not in type                  ║
║  └─ [FE] Update NotificationTemplateTable.js (column rename)              ║
╚═══════════════════════════════════════════════════════════════════════════╝

╔═══════════════════════════════════════════════════════════════════════════╗
║               DAY 10 - INTEGRATION + CLEANUP + TESTING                    ║
╠═══════════════════════════════════════════════════════════════════════════╣
║  Morning (4h):                                                            ║
║  ├─ [FE] Add route /admin/notification-types                              ║
║  ├─ [FE] Add menu item trong admin sidebar                                ║
║  ├─ [FE] Add cache clear button + status indicator                        ║
║  ├─ [BE] Delete config/notificationTriggers.js (if exists)                ║
║  └─ [BE] Review model field: type vs typeCode consistency                 ║
║                                                                            ║
║  Afternoon (4h):                                                          ║
║  ├─ [TEST] Create NotificationType từ UI → Verify DB                      ║
║  ├─ [TEST] Create Template với typeCode mới → Test recipient config       ║
║  ├─ [TEST] Trigger notification → Verify full flow                        ║
║  ├─ [TEST] User Settings vẫn hoạt động với new typeCode                   ║
║  └─ [DOC] Update API documentation                                        ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---

### 🎨 UI/UX WIREFRAMES - DETAILED

#### Wireframe 1: Notification Admin Dashboard (Main Tab View)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  🔔 Quản lý Notification System                    [🔄 Clear Cache]  [Admin]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ NAVIGATION TABS ───────────────────────────────────────────────────────┐
│  │                                                                          │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐  │
│  │  │ 📋 Types     │ │ 📝 Templates │ │ 🧪 Test      │ │ 📊 Stats     │  │
│  │  │              │ │              │ │              │ │              │  │
│  │  │   (44)       │ │   (53)       │ │              │ │              │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘  │
│  │        ▼ ACTIVE                                                         │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ╔═══════════════════════════════════════════════════════════════════════╗ │
│  ║                      📋 NOTIFICATION TYPES TAB                        ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║                                                                       ║ │
│  ║  Filters & Search:                                                    ║ │
│  ║  ┌─────────────────┐ ┌───────────────┐ ┌─────────────┐             ║ │
│  ║  │ 🔍 Search...    │ │ Category ▼    │ │ Status ▼    │             ║ │
│  ║  └─────────────────┘ └───────────────┘ └─────────────┘             ║ │
│  ║                                                                       ║ │
│  ║                                          ┌─────────────────────────┐ ║ │
│  ║                                          │  + Tạo Notification Type │ ║ │
│  ║                                          └─────────────────────────┘ ║ │
│  ╠═══════════════════════════════════════════════════════════════════════╣ │
│  ║  Code              │ Name               │ Variables │ Templates │ ⚡   ║ │
│  ╟────────────────────┼────────────────────┼───────────┼───────────┼──────╢ │
│  ║  yeucau-tao-moi    │ Tạo yêu cầu mới    │ 8 vars    │ 2 tmpl    │ ✏️🗑️ ║ │
│  ║  [🎫 Yêu cầu]      │                    │ 2 recip   │           │      ║ │
│  ╟────────────────────┼────────────────────┼───────────┼───────────┼──────╢ │
│  ║  yeucau-tiep-nhan  │ Tiếp nhận YC       │ 10 vars   │ 1 tmpl    │ ✏️🗑️ ║ │
│  ║  [🎫 Yêu cầu]      │                    │ 3 recip   │           │      ║ │
│  ╟────────────────────┼────────────────────┼───────────┼───────────┼──────╢ │
│  ║  congviec-giao     │ Giao công việc     │ 12 vars   │ 2 tmpl    │ ✏️🗑️ ║ │
│  ║  [📋 Công việc]    │                    │ 3 recip   │           │      ║ │
│  ╟────────────────────┼────────────────────┼───────────┼───────────┼──────╢ │
│  ║  kpi-tao-danh-gia  │ Tạo đánh giá KPI   │ 6 vars    │ 1 tmpl    │ ✏️🗑️ ║ │
│  ║  [📊 KPI]          │                    │ 2 recip   │           │      ║ │
│  ╟────────────────────┴────────────────────┴───────────┴───────────┴──────╢ │
│  ║  Statistics:                                                          ║ │
│  ║  • Total Types: 44  • Active: 44  • Categories: 4                     ║ │
│  ║  • Avg Variables per Type: 8.5  • Avg Recipients: 2.3                 ║ │
│  ╟───────────────────────────────────────────────────────────────────────╢ │
│  ║  « Prev  [1] 2 3 4 5  Next »                     Showing 1-10 of 44  ║ │
│  ╚═══════════════════════════════════════════════════════════════════════╝ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Wireframe 2: NotificationType Form Dialog (Detailed)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ✏️ Chỉnh sửa Notification Type: yeucau-tao-moi                   [X]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ SECTION 1: THÔNG TIN CƠ BẢN ──────────────────────────────────────────┐
│  │                                                                          │
│  │  Type Code * (Unique)    ┌─────────────────────────────────────────────┐
│  │                          │ yeucau-tao-moi                    (readonly) │
│  │                          └─────────────────────────────────────────────┘
│  │                          ℹ️ Format: category-action (kebab-case)        │
│  │                                                                          │
│  │  Tên hiển thị *          ┌─────────────────────────────────────────────┐
│  │                          │ Thông báo tạo yêu cầu mới                   │
│  │                          └─────────────────────────────────────────────┘
│  │                                                                          │
│  │  Mô tả                   ┌─────────────────────────────────────────────┐
│  │                          │ Gửi khi có yêu cầu mới từ khoa khác         │
│  │                          │                                              │
│  │                          └─────────────────────────────────────────────┘
│  │                                                                          │
│  │  Trạng thái              ◉ Hoạt động      ○ Tạm dừng                    │
│  │                                                                          │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌─ SECTION 2: DANH SÁCH BIẾN (Variables) ────────────────── [+ Thêm biến]│
│  │                                                                          │
│  │  ╔══════════════════════════════════════════════════════════════════╗  │
│  │  ║ 📌 Variable #1                                             [🔼🔽🗑️]║  │
│  │  ╠══════════════════════════════════════════════════════════════════╣  │
│  │  ║  Tên biến *          ┌───────────────────────────────────────────┐║  │
│  │  ║                      │ NguoiYeuCauID                             │║  │
│  │  ║                      └───────────────────────────────────────────┘║  │
│  │  ║                                                                   ║  │
│  │  ║  Type *              ┌─────────────┐  Ref Model  ┌──────────────┐║  │
│  │  ║                      │ ObjectId  ▼ │             │ NhanVien   ▼ │║  │
│  │  ║                      └─────────────┘             └──────────────┘║  │
│  │  ║                                                                   ║  │
│  │  ║  ☑️ Recipient Candidate (Có thể dùng làm người nhận)             ║  │
│  │  ║                                                                   ║  │
│  │  ║  Mô tả               ┌───────────────────────────────────────────┐║  │
│  │  ║                      │ Người tạo yêu cầu                         │║  │
│  │  ║                      └───────────────────────────────────────────┘║  │
│  │  ╚══════════════════════════════════════════════════════════════════╝  │
│  │                                                                          │
│  │  ╔══════════════════════════════════════════════════════════════════╗  │
│  │  ║ 📌 Variable #2                                             [🔼🔽🗑️]║  │
│  │  ╠══════════════════════════════════════════════════════════════════╣  │
│  │  ║  Tên biến *          ┌───────────────────────────────────────────┐║  │
│  │  ║                      │ arrNguoiDieuPhoiID                        │║  │
│  │  ║                      └───────────────────────────────────────────┘║  │
│  │  ║                                                                   ║  │
│  │  ║  Type *              ┌─────────────┐  Item Type  ┌──────────────┐║  │
│  │  ║                      │ Array     ▼ │             │ ObjectId   ▼ │║  │
│  │  ║                      └─────────────┘             └──────────────┘║  │
│  │  ║                                                                   ║  │
│  │  ║  Ref Model           ┌───────────────────────────────────────────┐║  │
│  │  ║                      │ NhanVien                                ▼ │║  │
│  │  ║                      └───────────────────────────────────────────┘║  │
│  │  ║                                                                   ║  │
│  │  ║  ☑️ Recipient Candidate (Có thể dùng làm người nhận)             ║  │
│  │  ║                                                                   ║  │
│  │  ║  Mô tả               ┌───────────────────────────────────────────┐║  │
│  │  ║                      │ Điều phối viên khoa (từ CauHinhThongBao)  │║  │
│  │  ║                      └───────────────────────────────────────────┘║  │
│  │  ╚══════════════════════════════════════════════════════════════════╝  │
│  │                                                                          │
│  │  ╔══════════════════════════════════════════════════════════════════╗  │
│  │  ║ 📋 Variable #3 (Display Field)                             [🔼🔽🗑️]║  │
│  │  ╠══════════════════════════════════════════════════════════════════╣  │
│  │  ║  Tên biến *          ┌───────────────────────────────────────────┐║  │
│  │  ║                      │ MaYeuCau                                  │║  │
│  │  ║                      └───────────────────────────────────────────┘║  │
│  │  ║                                                                   ║  │
│  │  ║  Type *              ┌─────────────┐                              ║  │
│  │  ║                      │ String    ▼ │                              ║  │
│  │  ║                      └─────────────┘                              ║  │
│  │  ║                                                                   ║  │
│  │  ║  ☐ Recipient Candidate                                           ║  │
│  │  ║                                                                   ║  │
│  │  ║  Mô tả               ┌───────────────────────────────────────────┐║  │
│  │  ║                      │ Mã yêu cầu                                │║  │
│  │  ║                      └───────────────────────────────────────────┘║  │
│  │  ╚══════════════════════════════════════════════════════════════════╝  │
│  │                                                                          │
│  │  ... (5 more display field variables: TieuDe, TenKhoaGui, etc.)         │
│  │                                                                          │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌─ SUMMARY ────────────────────────────────────────────────────────────────┐
│  │  📊 Total Variables: 8  |  🎯 Recipient Candidates: 2  |  📋 Display: 6  │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐
│  │                                        [Hủy]  [💾 Lưu thay đổi]          │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Wireframe 3: NotificationTemplate Form (Enhanced Version)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  📝 Chỉnh sửa Template: Thông báo cho điều phối viên               [X]      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─ SECTION 1: BASIC INFO ──────────────────────────────────────────────────┐
│  │                                                                          │
│  │  Type Code *             ┌─────────────────────────────────────────────┐
│  │  (Autocomplete)          │ yeucau-tao-moi                          [▼] │
│  │                          └─────────────────────────────────────────────┘
│  │                          ℹ️ 8 variables  •  2 recipients  •  2 templates│
│  │                                                                          │
│  │  Tên template *          ┌─────────────────────────────────────────────┐
│  │                          │ Thông báo cho điều phối viên                │
│  │                          └─────────────────────────────────────────────┘
│  │                                                                          │
│  │  Priority   ◉ Normal  ○ Urgent     Icon  [🔔 Notification ▼]           │
│  │                                                                          │
│  │  Enabled    ☑️ Gửi thông báo (bật/tắt template này)                     │
│  │                                                                          │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌─ SECTION 2: RECIPIENT CONFIGURATION ─────────────────────────────────────┐
│  │                                                                          │
│  │  Chọn biến làm người nhận (từ NotificationType variables):              │
│  │                                                                          │
│  │  ┌────────────────────────────────────────────────────────────────────┐ │
│  │  │ Available Recipient Variables from "yeucau-tao-moi":               │ │
│  │  │                                                                    │ │
│  │  │  ☐  NguoiYeuCauID                                                  │ │
│  │  │      └─ Người tạo yêu cầu (ObjectId → NhanVien)                   │ │
│  │  │                                                                    │ │
│  │  │  ☑️  arrNguoiDieuPhoiID                                     ✅ SELECTED│
│  │  │      └─ Điều phối viên khoa (Array<ObjectId> → NhanVien)          │ │
│  │  │                                                                    │ │
│  │  │  ☐  arrQuanLyKhoaID                                                │ │
│  │  │      └─ Quản lý khoa (Array<ObjectId> → NhanVien)                 │ │
│  │  │                                                                    │ │
│  │  └────────────────────────────────────────────────────────────────────┘ │
│  │                                                                          │
│  │  ⚡ Selected: 1 recipient variable → Will send to all users in array    │
│  │                                                                          │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌─ SECTION 3: TEMPLATE CONTENT ────────────────────────────────────────────┐
│  │                                                                          │
│  │  Title Template *        ┌─────────────────────────────────────────────┐
│  │                          │ {{MaYeuCau}} - Yêu cầu từ {{TenKhoaGui}}    │
│  │                          └─────────────────────────────────────────────┘
│  │                                                                          │
│  │  Body Template *         ┌─────────────────────────────────────────────┐
│  │  (Multiline)             │ Khoa {{TenKhoaGui}} gửi yêu cầu:            │
│  │                          │ {{TieuDe}}                                   │
│  │                          │                                              │
│  │                          │ Loại: {{TenLoaiYeuCau}}                      │
│  │                          │ Thời gian hẹn: {{ThoiGianHen}}               │
│  │                          └─────────────────────────────────────────────┘
│  │                                                                          │
│  │  Action URL              ┌─────────────────────────────────────────────┐
│  │  (Optional)              │ /yeucau/{{_id}}                             │
│  │                          └─────────────────────────────────────────────┘
│  │                                                                          │
│  │  ┌─ VARIABLE PICKER ─────────────────────────────────────────────────┐ │
│  │  │  💡 Click để chèn biến vào template:                              │ │
│  │  │                                                                   │ │
│  │  │  🎯 RECIPIENT VARIABLES:                                          │ │
│  │  │  [NguoiYeuCauID] [arrNguoiDieuPhoiID] [arrQuanLyKhoaID]          │ │
│  │  │                                                                   │ │
│  │  │  📋 DISPLAY VARIABLES:                                            │ │
│  │  │  [_id] [MaYeuCau] [TieuDe] [MoTa] [TenKhoaGui]                   │ │
│  │  │  [TenKhoaNhan] [TenLoaiYeuCau] [TenNguoiYeuCau] [ThoiGianHen]    │ │
│  │  │                                                                   │ │
│  │  └───────────────────────────────────────────────────────────────────┘ │
│  │                                                                          │
│  │  ┌─ VALIDATION STATUS ───────────────────────────────────────────────┐ │
│  │  │  📊 Detected Variables:                                           │ │
│  │  │     [MaYeuCau] [TenKhoaGui] [TieuDe] [TenLoaiYeuCau]             │ │
│  │  │     [ThoiGianHen] [_id]                                           │ │
│  │  │                                                                   │ │
│  │  │  ✅ All variables exist in NotificationType                       │ │
│  │  │  ⚠️ Warning: Variable 'XYZ' not defined (if any)                  │ │
│  │  └───────────────────────────────────────────────────────────────────┘ │
│  │                                                                          │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────────┐
│  │  [🧪 Test Template]                        [Hủy]  [💾 Lưu thay đổi]    │
│  └──────────────────────────────────────────────────────────────────────────┘
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 🔧 Technical Implementation Details

#### A. RecipientSelector Component (New)

**File:** `features/Notification/Admin/components/RecipientSelector.js`

**Props:**

```javascript
{
  typeCode: "yeucau-tao-moi",           // Selected NotificationType
  selectedVariables: ["arrNguoiDieuPhoiID"],  // Current selection
  onChange: (variables) => {}            // Callback with new selection
}
```

**Features:**

- Load NotificationType by code → extract variables với `isRecipientCandidate: true`
- Display FormControlLabel với Checkbox cho mỗi variable
- Show variable description + type info (ObjectId, Array<ObjectId>, etc.)
- Return array of variable names on change

**Pattern:** Similar to DanhSachNguoiDieuPhoi in CauHinhThongBaoKhoaForm.js

---

#### B. VariablePicker Component (New)

**File:** `features/Notification/Admin/components/VariablePicker.js`

**Props:**

```javascript
{
  variables: [...],              // Array from NotificationType.variables
  targetField: "titleTemplate",  // Which field to insert into
  onInsert: (varName) => {}      // Callback with {{varName}}
}
```

**Features:**

- Categorize variables: Recipients vs Display fields
- Render Chip buttons with onClick
- Click → `onInsert("{{MaYeuCau}}")` callback
- Parent handles inserting at cursor position (use TextFieldRef)

**Implementation Note:**

```javascript
// Parent component (NotificationTemplateForm)
const titleRef = useRef();

const handleInsertVariable = (varName) => {
  const input = titleRef.current;
  const cursorPos = input.selectionStart;
  const currentValue = watch("titleTemplate");
  const newValue =
    currentValue.slice(0, cursorPos) +
    `{{${varName}}}` +
    currentValue.slice(cursorPos);

  setValue("titleTemplate", newValue);
};
```

---

### 🗑️ CODE CLEANUP - DETAILED PLAN

#### Phase 1: Dead Code Removal

| File                      | Location       | Lines         | Action                          |
| ------------------------- | -------------- | ------------- | ------------------------------- |
| `notificationTriggers.js` | `config/`      | ~470          | DELETE entire file              |
| Comments with TODO        | Multiple files | ~30 locations | REMOVE after migration verified |

**Command:**

```powershell
# Find all TODO DAY 4-5 comments
cd d:\project\webBV\giaobanbv-be
Select-String -Path "**\*.js" -Pattern "TODO DAY 4-5" | Format-Table -AutoSize

# After verification, remove commented blocks
```

#### Phase 2: Schema Migration (OLD → NEW)

**Frontend Changes:**

| File                           | Change        | Old Pattern   | New Pattern     |
| ------------------------------ | ------------- | ------------- | --------------- |
| `NotificationTemplateForm.js`  | Field name    | `type`        | `typeCode`      |
| `NotificationTemplateForm.js`  | Validation    | `/^[A-Z_]+$/` | `/^[a-z-]+$/`   |
| `NotificationTemplateForm.js`  | Input         | `FTextField`  | `FAutocomplete` |
| `NotificationTemplateTable.js` | Column header | "Type"        | "Type Code"     |
| `notificationTemplateSlice.js` | API params    | `type`        | `typeCode`      |

**Backend Changes:**

Check if NotificationTemplate model uses `type` or `typeCode`:

```javascript
// If model uses "type" field:
// Option 1: Add alias/virtual field
NotificationTemplateSchema.virtual("typeCode").get(function () {
  return this.type?.toLowerCase().replace(/_/g, "-");
});

// Option 2: Add migration script to convert existing data
// Option 3: Accept both fields temporarily (backward compatible)
```

#### Phase 3: Import Cleanup

**Remove old imports (if any lingering):**

```bash
# Search for old triggerService imports
grep -rn "triggerService" --include="*.js" modules/

# Remove any commented import lines
```

---

### ✅ SUCCESS CRITERIA - CHECKLIST

#### Backend Completeness

- [ ] NotificationType CRUD API working (5 endpoints)
- [ ] NotificationTemplate API working (7 endpoints)
- [ ] Cache clear endpoint functional
- [ ] Admin authentication enforced
- [ ] Seed data populated (44 types + 53 templates)
- [ ] No triggerService references remain
- [ ] All ~29 service calls using new send() method

#### Frontend Completeness

- [ ] NotificationTypePage với full CRUD
- [ ] NotificationTemplatePage updated với recipient config
- [ ] RecipientSelector component working
- [ ] VariablePicker component working
- [ ] Routes mounted: `/admin/notification-types`, `/admin/notification-templates`
- [ ] Menu items added trong admin sidebar
- [ ] Cache clear button functional
- [ ] No console errors on all admin pages

#### Integration Testing

- [ ] Create NotificationType từ UI → Verify in MongoDB
- [ ] Create Template với typeCode → Verify recipient config saved
- [ ] Test template với sample data → Preview correct
- [ ] Trigger real notification (tạo yêu cầu) → Notification received
- [ ] Check UserNotificationSettings → Still working với new typeCode
- [ ] Cache clear → New templates loaded immediately
- [ ] Full flow: Type → Template → Trigger → UserNotification → Display

#### Documentation & Cleanup

- [ ] API documentation updated
- [ ] README updated với new architecture
- [ ] Old code deleted (triggerService, notificationTriggers)
- [ ] TODO comments removed
- [ ] Migration guide documented (if needed for existing data)

---

**Status:** Phase 0-7 Complete ✅ | Ready for Day 8 Implementation  
**Next Step:** Day 8 - Create NotificationType Backend API + Frontend UI  
**Contact:** Proceed with backend controller creation

---

**Last Updated:** 2025-12-20 (Phase 3 detailed plan + wireframes added)
