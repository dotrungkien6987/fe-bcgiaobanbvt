# Notification System Refactor - Context Summary

**Date:** 2025-12-18  
**Status:** 🧠 Brainstorming Phase  
**Scope:** Work Management Module only (YeuCau, CongViec, KPI, NhiemVu)

---

## 🎯 Vấn Đề Gốc & Hành Trình

### 1. Bug Khởi Đầu: YEUCAU_DISPATCHED

**Hiện tượng:** Điều phối yêu cầu thành công nhưng không có notification trong DB

**Root Cause Found:**

```javascript
// ❌ SAI - File: yeuCauStateMachine.js (line ~416)
.populate("LoaiYeuCauID", "TenLoai")  // Field không tồn tại!

// ✅ ĐÚNG
.populate("DanhMucYeuCauID", "TenLoaiYeuCau")
```

**Schema Truth:**

```javascript
// YeuCau model
DanhMucYeuCauID: { type: Schema.Types.ObjectId, ref: "DanhMucYeuCau" }
// ❌ KHÔNG có field "LoaiYeuCauID"

// DanhMucYeuCau model
TenLoaiYeuCau: String  // ❌ KHÔNG phải "TenLoai"
```

### 2. Debug Journey

**Pipeline traced:**

```
FE Dispatch Action
  ↓
BE Controller (dieuPhoi)
  ↓
yeuCauStateMachine.executeTransition()
  ↓
triggerService.fire("YEUCAU_DISPATCHED", context)
  ↓
notificationHelper.resolveNhanVienListToUserIds()
  ↓
notificationService.send() → DB + Socket
```

**Added Console Logs:**

- ✅ `yeuCauStateMachine.js`: Context + populated data before fire
- ✅ `triggerService.js`: 8 checkpoints (recipientNhanVienIds, userIds, exclude, send)
- ✅ `notificationService.js`: Per-recipient logs (resolve, shouldSend, DB insert)
- ✅ `notificationHelper.js`: Input/output NhanVienID → UserID mapping

### 3. Scale Problem Discovery

- **Current System:** 40+ notification templates hardcoded
- **Issue:** Mỗi template phải audit manually (1 giờ/template)
- **Pain Points:**
  - Developer phải nhớ gọi trigger đúng nơi
  - Build context object đúng cấu trúc
  - Populate schema fields đúng (dễ typo như bug trên)
  - Recipients logic hardcoded trong template config

---

## 🏗️ Kiến Trúc Hiện Tại

### Notification Pipeline Flow

```
┌─────────────────────────────────────────────────────────────┐
│  TRIGGER POINT (Developer Manual Call)                      │
│  ────────────────────────────────────────────────────────   │
│  controllers/workmanagement/*.js                            │
│  └─ triggerService.fire("TEMPLATE_CODE", contextObject)    │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  TRIGGER SERVICE (services/triggerService.js)               │
│  ────────────────────────────────────────────────────────   │
│  1. Get trigger config (TRIGGER_CONFIG_MAP)                 │
│  2. Execute handler(context) → recipientNhanVienIds         │
│  3. Exclude performer từ recipients                         │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION HELPER (helpers/notificationHelper.js)        │
│  ────────────────────────────────────────────────────────   │
│  resolveNhanVienListToUserIds(nhanVienIds)                  │
│  └─ Query User model: { NhanVienID: { $in: nhanVienIds }}  │
│  └─ Return array of User._id                                │
└──────────────────┬──────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  NOTIFICATION SERVICE (modules/.../notificationService.js)  │
│  ────────────────────────────────────────────────────────   │
│  FOR EACH recipientUserId:                                  │
│    1. Check user notification settings (enabled?)           │
│    2. Render template with Handlebars (context variables)   │
│    3. Create Notification document in DB                    │
│    4. Emit socket event (real-time)                         │
└─────────────────────────────────────────────────────────────┘
```

### File Structure

**Backend:**

```
giaobanbv-be/
├── services/
│   └── triggerService.js              # Central trigger dispatcher
├── helpers/
│   └── notificationHelper.js          # NhanVienID → UserID resolver
├── modules/workmanagement/
│   ├── controllers/
│   │   ├── yeuCauController.js        # Gọi triggerService.fire(...)
│   │   ├── congViecController.js      # Gọi triggerService.fire(...)
│   │   └── danhGiaKPIController.js    # Gọi triggerService.fire(...)
│   ├── services/
│   │   ├── notificationService.js     # Render template + DB + Socket
│   │   └── yeuCauStateMachine.js      # State transitions + fire triggers
│   └── models/
│       ├── YeuCau.js                  # DanhMucYeuCauID (ref)
│       ├── CongViec.js                # NguoiGiao, NguoiThucHien
│       └── DanhGiaKPI.js              # NhanVienID, NguoiDuyet
└── models/
    ├── User.js                        # NhanVienID (ref NhanVien)
    └── NhanVien.js                    # Employee data
```

**Frontend:**

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/
├── YeuCau/
│   ├── yeuCauSlice.js                 # Redux thunks call API
│   └── components/                    # UI triggers actions
├── CongViec/
│   ├── congViecSlice.js               # Dispatch actions
│   └── components/
├── KPI/
│   ├── danhGiaKPISlice.js
│   └── components/
└── Notification/
    ├── QUICK_AUDIT_CHECKLIST.md       # Created: Quick audit guide
    ├── SCHEMA_QUICK_REFERENCE.md      # Created: Schema field reference
    └── REFACTOR_CONTEXT_SUMMARY.md    # This file
```

### Trigger Configuration Pattern

```javascript
// triggerService.js - TRIGGER_CONFIG_MAP
{
  "YEUCAU_DISPATCHED": {
    templateCode: "YEUCAU_DISPATCHED",
    handler: (context) => {
      // Logic xác định recipients
      const { yeuCau, nguoiDieuPhoi } = context;
      return [nguoiDieuPhoi.NhanVienID]; // Return NhanVienID array
    },
    excludePerformer: true
  },
  "CONGVIEC_ASSIGNED": { /* ... */ },
  "KPI_APPROVED": { /* ... */ },
  // ... 40+ triggers
}

// Template rendering (notificationService.js)
const template = "Bạn được điều phối yêu cầu: {{yeuCau.TenYeuCau}}";
const rendered = Handlebars.compile(template)(context);
```

### ⚠️ CRITICAL: User vs NhanVien Model

**KHÔNG ĐƯỢC NHẦM LẪN** - Đây là nguồn gốc bug chính:

```javascript
// ✅ ĐÚNG: Authentication & Notification Recipients
const User = {
  _id: ObjectId("user123"), // ← User ID (for login/JWT)
  UserName: "kiendt",
  PassWord: "...",
  NhanVienID: ObjectId("nhanvien456"), // ← Reference to NhanVien
  PhanQuyen: "manager",
  KhoaID: ObjectId("khoa789"),
};

// ✅ ĐÚNG: Employee Data (Work Management)
const NhanVien = {
  _id: ObjectId("nhanvien456"), // ← NhanVien ID (for assignments)
  HoTen: "Đỗ Trung Kiên",
  KhoaID: ObjectId("..."),
  ChucDanh: "Trưởng khoa",
  
};

// Frontend: Get NhanVienID from authenticated user
const { user } = useAuth();
const nhanVienId = user?.NhanVienID; // ✅ Use this for work APIs

// Backend: Notification flow
// 1. Controllers store NhanVienID in entities (YeuCau, CongViec)
// 2. Trigger handlers return NhanVienID arrays
// 3. notificationHelper converts: NhanVienID[] → UserID[]
// 4. notificationService sends to UserID[] (for socket + settings check)
```

**All Work Management Relations Use NhanVienID:**

- `YeuCau.NguoiTao` → NhanVienID
- `CongViec.NguoiGiao` → NhanVienID
- `CongViec.NguoiThucHien` → NhanVienID
- `DanhGiaKPI.NhanVienID` → NhanVienID
- `DanhGiaKPI.NguoiDuyet` → NhanVienID
- `NhanVienNhiemVu.NhanVienID` → NhanVienID

**Notification Flow:**

```
Trigger Handler
  → Returns NhanVienID[]
  → notificationHelper.resolveNhanVienListToUserIds()
  → Query: User.find({ NhanVienID: { $in: [...] }})
  → Returns User._id[]
  → notificationService.send(userId)
```

---

## 🚀 Dự Định Refactor - Kiến Trúc Mới

### Vision: Admin-Configurable Notification System

**Goals:**

1. ✅ Developer chỉ return entities, không quan tâm notification logic
2. ✅ Admin config toàn bộ qua UI (recipients, template, enable/disable)
3. ✅ Auto-intercept actions để trigger notifications
4. ✅ Reduce 40+ hardcoded templates xuống config-driven system

### Proposed Architecture (Hybrid Model 2 + Model 1)

```
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 1: ACTION REGISTRY (Code - Type Safe)                     │
│  ──────────────────────────────────────────────────────────────  │
│  const ActionRegistry = {                                        │
│    "KPI_APPROVED": {                                             │
│      availableRecipients: {                                      │
│        employee: (ctx) => [ctx.danhGiaKPI.NhanVienID],          │
│        approver: (ctx) => [ctx.approver.NhanVienID],            │
│        hr_department: (ctx) => getHRNhanVienIds(),              │
│        khoa_leaders: (ctx) => getKhoaLeaders(ctx.khoa)          │
│      },                                                          │
│      availableVariables: [                                       │
│        "NhanVien.HoTen", "TongDiemKPI", "ChuKy.Ten"             │
│      ],                                                          │
│      scope: "workmanagement"                                     │
│    }                                                             │
│  }                                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 2: VARIABLE EXTRACTORS (Code - Auto Extract)             │
│  ──────────────────────────────────────────────────────────────  │
│  const extractVariables = (actionType, context) => {            │
│    if (actionType === "KPI_APPROVED") {                         │
│      const { danhGiaKPI } = context;                            │
│      await danhGiaKPI.populate("NhanVienID ChuKyDanhGiaID");    │
│      return {                                                    │
│        "NhanVien.HoTen": danhGiaKPI.NhanVienID.HoTen,           │
│        "TongDiemKPI": danhGiaKPI.TongDiemKPI,                   │
│        "ChuKy.Ten": danhGiaKPI.ChuKyDanhGiaID.Ten               │
│      };                                                          │
│    }                                                             │
│  }                                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 3: ADMIN CONFIG (DB + UI)                                │
│  ──────────────────────────────────────────────────────────────  │
│  NotificationActionConfig (MongoDB):                             │
│  {                                                               │
│    actionType: "KPI_APPROVED",                                   │
│    enabled: true,                                                │
│    recipientGroups: {                                            │
│      employee: {                                                 │
│        enabled: true,                                            │
│        template: "Chúc mừng! KPI của bạn đã được duyệt..."      │
│      },                                                          │
│      approver: {                                                 │
│        enabled: true,                                            │
│        template: "Bạn đã duyệt KPI cho {{NhanVien.HoTen}}..."   │
│      },                                                          │
│      hr_department: {                                            │
│        enabled: false,  // ← Admin toggle off                   │
│        template: "Khoa {{Khoa.TenKhoa}} hoàn tất..."            │
│      }                                                           │
│    },                                                            │
│    priority: "high",                                             │
│    createdBy: "admin_user_id"                                   │
│  }                                                               │
│                                                                  │
│  Admin UI Features:                                             │
│  - [x] Enable/Disable action                                    │
│  - [x] Enable/Disable recipient groups independently            │
│  - [x] Template builder with variable autocomplete              │
│  - [x] Preview with sample data                                 │
│  - [x] Audit log (who changed what when)                        │
└────────────────────────┬─────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 4: NOTIFICATION ENGINE (Runtime)                          │
│  ──────────────────────────────────────────────────────────────  │
│  class NotificationEngine {                                      │
│    async fire(actionType, context) {                            │
│      // 1. Load config from cache (5 min expiry)                │
│      const config = await this.getConfig(actionType);           │
│      if (!config.enabled) return;                               │
│                                                                  │
│      // 2. Extract variables                                    │
│      const vars = await extractVariables(actionType, context);  │
│                                                                  │
│      // 3. Loop qua enabled recipient groups                    │
│      for (const [groupName, groupConfig] of config.groups) {    │
│        if (!groupConfig.enabled) continue;                      │
│                                                                  │
│        // 4. Resolve recipients                                 │
│        const nhanVienIds = ActionRegistry[actionType]           │
│          .availableRecipients[groupName](context);              │
│        const userIds = await resolveNhanVienToUser(nhanVienIds);│
│                                                                  │
│        // 5. Render template                                    │
│        const message = Handlebars.compile(                      │
│          groupConfig.template                                   │
│        )(vars);                                                  │
│                                                                  │
│        // 6. Send (parallel for all recipients in group)        │
│        await notificationService.sendToMany(userIds, message);  │
│      }                                                           │
│    }                                                             │
│  }                                                               │
└────────────────────────┬─────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────────────┐
│  LAYER 5: SERVICE INTEGRATION (Developer Experience)            │
│  ──────────────────────────────────────────────────────────────  │
│  // Old way (40+ places):                                       │
│  await triggerService.fire("KPI_APPROVED", {                    │
│    danhGiaKPI,                                                   │
│    approver,                                                     │
│    // ... build context manually                                │
│  });                                                             │
│                                                                  │
│  // New way (same 1 line, but magic inside):                    │
│  await notificationEngine.fire("KPI_APPROVED", {                │
│    danhGiaKPI,  // ← Just pass entities                         │
│    approver     // ← Engine handles rest                        │
│  });                                                             │
└──────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

#### 1. Multi-Notification Support (Model 2: Recipient Groups)

**Use Case:**

```javascript
// 1 Action → Multiple Notifications
await notificationEngine.fire("KPI_APPROVED", { danhGiaKPI, approver });

// → Engine sends 3 notifications (if all enabled):
// 1. To Employee: "Chúc mừng! KPI của bạn đã được duyệt..."
// 2. To Approver: "Bạn đã duyệt KPI cho Nguyễn Văn A..."
// 3. To HR: "Khoa Nhi hoàn tất đánh giá KPI..." (if enabled)
```

**Config Structure:**

```javascript
{
  recipientGroups: {
    group_name: {
      enabled: true/false,
      template: "...",
      priority: "high/medium/low"
    }
  }
}
```

**Rationale:**

- ✅ Compact (1 action = 1 config document)
- ✅ Admin UI gọn (tabs cho mỗi group)
- ✅ Dễ enable/disable từng audience
- ✅ Fit 80% use cases (2-3 recipients/action)

#### 2. Why Not Other Models?

| Model                              | Rejected Reason                                               |
| ---------------------------------- | ------------------------------------------------------------- |
| **Model 1: Multi-Config Registry** | Registry phình to (mỗi action 3-5 configs), Admin UI phức tạp |
| **Model 3: Cascading**             | Debug khó, risk vòng lặp, async order issues                  |
| **Model 4: Rules-Based**           | Condition logic không type-safe, Admin UI cực phức tạp        |

**Future Extension:** Nếu cần >5 recipients/action → extend sang Model 1 (separate configs)

#### 3. Performance Impact

| Metric               | Current         | Proposed      | Impact         |
| -------------------- | --------------- | ------------- | -------------- |
| **Config Load**      | Hardcoded (0ms) | Cache (5 min) | +2ms first hit |
| **Per Notification** | ~50ms           | ~50ms         | No change      |
| **3 Notifications**  | 50ms            | 52ms          | +2% negligible |
| **Memory**           | 0               | ~50KB cache   | Negligible     |

**Conclusion:** Performance không đáng lo ngại

#### 4. Security Considerations

| Risk                        | Mitigation                                                       |
| --------------------------- | ---------------------------------------------------------------- |
| **XSS in templates**        | Handlebars auto-escape, sanitize inputs                          |
| **RCE**                     | No eval(), whitelist Handlebars helpers only                     |
| **Recipients manipulation** | RBAC (only admins), availableRecipients scope controlled by code |
| **Privilege escalation**    | ActionRegistry whitelist, code controls who can receive          |
| **Info disclosure**         | Variable extractors validate sensitive fields                    |

**Conclusion:** Security có thể kiểm soát được

---

## 🧠 Brainstorming Questions (Current Status)

### ❓ Open Questions

1. **Có action nào CẦN gửi >3 notifications khác nhau không?**

   - Current known: KPI_APPROVED (3), YEUCAU_DISPATCHED (2), CONGVIEC_COMPLETED (2-3)
   - If >5 recipients common → cần rethink Model 2

2. **Admin có cần dynamic rules không?**

   - Example: "Nếu điểm KPI >90 thì notify giám đốc"
   - If yes → cần Model 4 hoặc code-based conditions
   - If no → giữ static configs đơn giản

3. **Notifications có phụ thuộc nhau không?**

   - Example: "Chỉ notify HR nếu employee đã nhận được"
   - If yes → cần cascade (Model 3)
   - If no → parallel send (simpler)

4. **Order có quan trọng không?**

   - Sequential: employee first → manager → HR?
   - Parallel: tất cả cùng lúc?
   - Affects latency: sequential = 50ms × 3 = 150ms vs parallel = 50ms

5. **Admin UI complexity tradeoff?**
   - Simple: On/Off toggle only, no template customization
   - Medium: Template editor + variable picker
   - Complex: Rule builder + condition logic

---

## 📋 Implementation Checklist (Not Started)

### Phase 1: Schema & Config

- [ ] Design `NotificationActionConfig` schema
- [ ] Create ActionRegistry với available recipients/variables
- [ ] Seed initial configs từ 40+ templates hiện tại

### Phase 2: Core Engine

- [ ] Implement `NotificationEngine` class
- [ ] Implement config cache (5 min expiry)
- [ ] Implement variable extractors cho YeuCau/CongViec/KPI
- [ ] Migrate `triggerService.fire()` → `notificationEngine.fire()`

### Phase 3: Admin UI

- [ ] Config list page (all actions)
- [ ] Config edit dialog (recipient groups + templates)
- [ ] Template builder với variable autocomplete
- [ ] Preview functionality với sample data
- [ ] Audit log view

### Phase 4: Migration

- [ ] Update all 40+ `triggerService.fire()` calls
- [ ] Remove old `TRIGGER_CONFIG_MAP`
- [ ] Remove hardcoded template strings
- [ ] Test end-to-end với all actions

### Phase 5: Docs & Training

- [ ] Developer guide: "How to add new action"
- [ ] Admin guide: "How to config notifications"
- [ ] Migration notes: "What changed"

---

## 📊 Current Work Management Actions (Scope)

### YeuCau (Requests) - 6 triggers

```
YEUCAU_CREATED          → Notify: Quản lý khoa
YEUCAU_DISPATCHED       → Notify: Người được điều phối + Người tạo
YEUCAU_ACCEPTED         → Notify: Người tạo + Quản lý
YEUCAU_IN_PROGRESS      → Notify: Người tạo
YEUCAU_COMPLETED        → Notify: Người tạo + Quản lý
YEUCAU_REJECTED         → Notify: Người tạo
```

### CongViec (Tasks) - 8 triggers

```
CONGVIEC_ASSIGNED       → Notify: Người thực hiện
CONGVIEC_STARTED        → Notify: Người giao
CONGVIEC_PAUSED         → Notify: Người giao
CONGVIEC_RESUMED        → Notify: Người giao
CONGVIEC_COMPLETED      → Notify: Người giao + Watchers
CONGVIEC_CANCELLED      → Notify: Người thực hiện + Người giao
CONGVIEC_COMMENT_ADDED  → Notify: Người giao + Người thực hiện + Mentioned
CONGVIEC_FILE_UPLOADED  → Notify: Người giao + Người thực hiện
```

### DanhGiaKPI (KPI Evaluation) - 5 triggers

```
KPI_SUBMITTED           → Notify: Quản lý (người duyệt)
KPI_APPROVED            → Notify: Nhân viên + (Optional: HR, Giám đốc)
KPI_REJECTED            → Notify: Nhân viên
KPI_UNDO_APPROVED       → Notify: Nhân viên + HR
KPI_COMMENT_ADDED       → Notify: Nhân viên + Quản lý
```

### GiaoNhiemVu (Task Assignment) - 3 triggers

```
NHIEMVU_ASSIGNED        → Notify: Nhân viên
NHIEMVU_UPDATED         → Notify: Nhân viên (if assignment changed)
NHIEMVU_REMOVED         → Notify: Nhân viên
```

**Total: ~22 action types** (có thể có thêm sub-actions)

---

## 🔧 Tools Created for Quick Audit (Current System)

### 1. QUICK_AUDIT_CHECKLIST.md

- **Purpose:** Audit 1 template trong 5-10 phút
- **Content:**
  - 10-step checklist
  - 5 PITFALLS từ YEUCAU_DISPATCHED experience
  - Batch audit guide
  - Schema field verification

### 2. SCHEMA_QUICK_REFERENCE.md

- **Purpose:** Tra cứu nhanh schema fields
- **Content:**
  - 7 entity schemas (YeuCau, CongViec, DanhGiaKPI, NhanVien, Khoa, ChuKy, DanhMucYeuCau)
  - Common pitfalls highlighted
  - Standard populate patterns
  - Field name corrections

### 3. DEBUG_YEUCAU_DISPATCHED.md (Backend)

- **Purpose:** Debug pipeline với logs
- **Content:**
  - 7 điểm pipeline có thể fail
  - DB queries để verify
  - Console.log locations

---

## 🎬 Next Steps (Awaiting Decision)

### Option A: Continue with Current System

- Use QUICK_AUDIT_CHECKLIST.md to audit 40+ templates
- Fix bugs as found
- Keep hardcoded trigger configs
- **Timeline:** ~2-3 days (audit all)

### Option B: Refactor to New Architecture

- Draft schemas + ActionRegistry
- Implement NotificationEngine
- Create Admin UI
- Migrate all triggers
- **Timeline:** ~1-2 weeks
- **ROI:** Dễ maintain, scalable, no migration cost (new system)

### Recommendation: **Option B** (Refactor)

**Rationale:**

- System mới build → không cần migrate data
- 40+ templates → ROI cao cho config UI
- Current bugs show design flaws
- Future-proof cho thêm actions

---

## 📝 Important Notes

### Database Queries to Check Current State

```javascript
// Count current notification templates
db.getCollection("notifications").distinct("templateCode").length

// Find all triggerService.fire() calls
grep -r "triggerService.fire" giaobanbv-be/modules/workmanagement/

// Check User → NhanVien mapping
db.users.findOne({}, { NhanVienID: 1, UserName: 1 })
db.nhanviens.findOne({}, { HoTen: 1, PhongBanID: 1 })

// Verify YeuCau schema fields
db.yeucaus.findOne({}, { DanhMucYeuCauID: 1, LoaiYeuCauID: 1 })
// Should have DanhMucYeuCauID, NOT LoaiYeuCauID
```

### Key Files to Review for Refactor

**Backend:**

```
giaobanbv-be/
├── services/triggerService.js           # Current trigger logic (replace)
├── helpers/notificationHelper.js        # Keep (NhanVienID→UserID resolver)
├── modules/workmanagement/
│   ├── controllers/                     # Update all fire() calls
│   ├── services/notificationService.js  # Keep core send logic
│   └── models/                          # Reference for extractors
└── models/User.js                       # NhanVienID reference
```

**Frontend:**

```
fe-bcgiaobanbvt/src/features/QuanLyCongViec/
├── */components/                        # Find UI trigger points
├── */*Slice.js                          # Redux thunks calling APIs
└── Notification/
    ├── AdminConfigUI/                   # To be created
    └── TemplateBuilder/                 # To be created
```

---

## 🚨 Critical Reminders

1. **ALWAYS use NhanVienID for work management relationships**

   - Never confuse with User.\_id
   - Trigger handlers return NhanVienID[]
   - notificationHelper converts to User.\_id[]

2. **Schema field names must be EXACT**

   - `DanhMucYeuCauID` NOT `LoaiYeuCauID`
   - `TenLoaiYeuCau` NOT `TenLoai`
   - Use SCHEMA_QUICK_REFERENCE.md

3. **Populate paths must match schema**

   ```javascript
   // ✅ CORRECT
   await YeuCau.findById(id).populate("DanhMucYeuCauID", "TenLoaiYeuCau");

   // ❌ WRONG
   await YeuCau.findById(id).populate("LoaiYeuCauID", "TenLoai");
   ```

4. **Test notification pipeline end-to-end**
   - Check console.logs in 4 files
   - Verify DB inserts: `db.notifications.find().sort({createdAt:-1})`
   - Check socket events in browser DevTools

---

**End of Context Summary**

**Status:** 🧠 Brainstorming complete, awaiting decision on refactor approach  
**Contact:** Continue in new conversation with this context file  
**Last Updated:** 2025-12-18
