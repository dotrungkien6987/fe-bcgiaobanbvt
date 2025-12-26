# Audit Report: `congviec-giao-viec` (Thông báo giao việc mới)

**Type**: Direct Service Call (Non-State Machine)  
**Date**: 2024-12-25  
**Status**: ⚠️ **CRITICAL BUGS FOUND** - Implementation exists but has multiple issues

---

## Phase 1: Type & Template Definition

### Notification Type

**Location**: [seeds/notificationTypes.seed.js](d:\project\webBV\giaobanbv-be\seeds\notificationTypes.seed.js#L290-L295)

```javascript
{
  code: "congviec-giao-viec",
  name: "Thông báo giao việc mới",
  description: "Được giao công việc mới",
  Nhom: "Công việc",
  variables: congViecVariables, // 29 fields (6 recipient + 23 display)
}
```

✅ **PASS**: Type properly defined with comprehensive variable list (29 fields).

---

### Notification Templates

**Location**: [seeds/notificationTemplates.seed.js](d:\project\webBV\giaobanbv-be\seeds\notificationTemplates.seed.js#L17-L35)

#### Template 1: Người được giao (Main assignee)

```javascript
{
  name: "Thông báo cho người được giao",
  typeCode: "congviec-giao-viec",
  recipientConfig: { variables: ["NguoiChinhID"] },
  titleTemplate: "{{MaCongViec}} - {{TieuDe}}",
  bodyTemplate: "Bạn được giao công việc mới từ {{TenNguoiThucHien}}",
  actionUrl: "/congviec/{{_id}}",
  icon: "assignment",
  priority: "normal",
}
```

#### Template 2: Người tham gia (Participants)

```javascript
{
  name: "Thông báo cho người tham gia",
  typeCode: "congviec-giao-viec",
  recipientConfig: { variables: ["arrNguoiLienQuanID"] },
  titleTemplate: "{{MaCongViec}} - {{TieuDe}}",
  bodyTemplate: "Bạn được thêm vào công việc từ {{TenNguoiThucHien}}",
  actionUrl: "/congviec/{{_id}}",
  icon: "group_add",
  priority: "normal",
}
```

✅ **PASS**: 2 templates found (as expected for multiple recipient groups).

---

## Phase 2: Builder Integration

### Builder Definition

**Location**: [modules/workmanagement/helpers/notificationDataBuilders.js](d:\project\webBV\giaobanbv-be\modules\workmanagement\helpers\notificationDataBuilders.js#L110-L191)

**Function**: `buildCongViecNotificationData(congViec, context)`

**Provides**: 29 fields

#### Recipient Candidates (6 fields):

- `_id` (ObjectId)
- `NguoiChinhID` (ObjectId)
- `NguoiGiaoViecID` (ObjectId)
- `NguoiThamGia` (Array of ObjectId) ⚠️
- `NguoiThamGiaMoi` (ObjectId)
- `NguoiThamGiaBiXoa` (ObjectId)
- `NguoiChinhMoi` (ObjectId)

#### Display Fields (23 fields):

- `MaCongViec`, `TieuDe`, `MoTa`, `TenNguoiChinh`, `TenNguoiGiao`, `TenNguoiCapNhat`, `TenNguoiChinhMoi`, `TenNguoiThucHien`, `MucDoUuTienMoi`, `MucDoUuTienCu`, `TrangThai`, `TienDoMoi`, `NgayHetHan`, `NgayHetHanCu`, `NgayHetHanMoi`, `TenFile`, `NoiDungComment`, `TenNguoiComment`

✅ **PASS**: Builder properly structured and documented.

---

### Service Integration

**Location**: [modules/workmanagement/services/congViec.service.js](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L1724-L1750)

**Method**: `service.giaoViec()` (line 1671)

**Trigger**: When task transitions from `TAO_MOI` → `DA_GIAO` status

#### Implementation Code Snippet:

```javascript
// Line 1724-1750
try {
  const nguoiGiao = await NhanVien.findById(req.user?.NhanVienID)
    .select("Ten")
    .lean();

  // Danh sách người nhận: NguoiChinh + NguoiThamGia (trừ NguoiGiao nếu trùng)
  const arrNguoiNhanViecID = [
    congviec.NguoiChinhID?.toString(),
    ...(congviec.NguoiThamGia || []).map((p) => p.NhanVienID?.toString()),
  ].filter((id) => id && id !== req.user?.NhanVienID?.toString());

  const {
    buildCongViecNotificationData,
  } = require("../helpers/notificationDataBuilders");
  const notificationData = await buildCongViecNotificationData(congviec, {
    arrNguoiNhanViecID: [...new Set(arrNguoiNhanViecID)], // ❌ UNUSED!
    nguoiGiao, // ❌ WRONG TYPE!
  });

  await notificationService.send({
    type: "congviec-giao-viec",
    data: notificationData,
  });
  console.log("[CongViecService] ✅ Sent notification: congviec-giao-viec");
} catch (notifyErr) {
  console.error(
    "[CongViecService] ❌ giaoViec notification failed:",
    notifyErr.message
  );
}
```

#### Issues Found:

❌ **BUG #1**: Context field `arrNguoiNhanViecID` is passed but **NOT USED** by builder

- Service passes: `arrNguoiNhanViecID`
- Builder expects: `nguoiThamGiaIds` (array) or reads from `congViec.NguoiThamGia`
- Impact: Field is computed but ignored

❌ **BUG #2**: Context field `nguoiGiao` is **WRONG TYPE**

- Service passes: `nguoiGiao` (NhanVien document with `{ Ten }`)
- Builder expects: `tenNguoiGiao` (string) OR `nguoiGiaoViecId` (ObjectId string)
- Impact: `TenNguoiGiao` display field may be incorrect

✅ **PASS**: Builder function is called correctly with try-catch.  
✅ **PASS**: Error handling present (logs error, doesn't throw).

---

## Phase 3: Recipients Logic

### Template 1 - Người được giao

**Recipient Config**: `{ variables: ["NguoiChinhID"] }`

**Builder Field**: ✅ `NguoiChinhID` provided (ObjectId string)

**Type Check**: ✅ Correct type (NhanVienID → converts to UserID in notification service)

**Availability**: ✅ Always present (required field in CongViec model)

---

### Template 2 - Người tham gia

**Recipient Config**: `{ variables: ["arrNguoiLienQuanID"] }`

**Builder Field**: ❌ **MISMATCH!**

#### Issue:

- Template expects: `arrNguoiLienQuanID`
- Builder provides: `NguoiThamGia` (array)
- Result: **Template 2 WILL NOT SEND** - recipient variable not found!

#### Root Cause Analysis:

1. Service calculates `arrNguoiNhanViecID` but passes as unused context
2. Builder doesn't expose any field named `arrNguoiLienQuanID`
3. Builder exposes `NguoiThamGia` (from model) but template doesn't use it

#### Expected Behavior:

- Participants (PHOI_HOP role) should receive notification
- Currently: **ONLY main assignee (NguoiChinhID) receives notification**

❌ **CRITICAL BUG #3**: Template 2 recipient variable name mismatch prevents participant notifications.

---

## Phase 4: Template Rendering

### Template 1 Variables

**Title**: `{{MaCongViec}} - {{TieuDe}}`

- ✅ `MaCongViec`: Provided by builder
- ✅ `TieuDe`: Provided by builder

**Body**: `Bạn được giao công việc mới từ {{TenNguoiThucHien}}`

- ✅ `TenNguoiThucHien`: Provided by builder (from context)

**Action URL**: `/congviec/{{_id}}`

- ✅ `_id`: Provided by builder

**Result**: ✅ All variables available.

---

### Template 2 Variables

**Title**: `{{MaCongViec}} - {{TieuDe}}`

- ✅ `MaCongViec`: Provided
- ✅ `TieuDe`: Provided

**Body**: `Bạn được thêm vào công việc từ {{TenNguoiThucHien}}`

- ⚠️ `TenNguoiThucHien`: Provided BUT context from `giaoViec` **may be incomplete**

**Action URL**: `/congviec/{{_id}}`

- ✅ `_id`: Provided

**Result**: ⚠️ Variables exist but template won't render due to Phase 3 recipient bug.

---

## Phase 5: E2E Flow

### Frontend → Backend Flow

#### 1. Frontend Action

**Location**: [src/features/QuanLyCongViec/CongViec/congViecSlice.js](d:\project\webBV\fe-bcgiaobanbvt\src\features\QuanLyCongViec\CongViec\congViecSlice.js#L992-L1034)

**Action**: `createCongViec(data)`

```javascript
export const createCongViec = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const sanitized = Object.fromEntries(
      Object.entries({
        ...data,
        CanhBaoMode: data?.CanhBaoMode || "PERCENT",
        CanhBaoSapHetHanPercent: /* ... */
      }).filter(([_, v]) => v !== null && v !== undefined)
    );

    const response = await congViecAPI.create(sanitized);
    // ...
  }
}
```

#### 2. API Call

**Endpoint**: `POST /api/workmanagement/congviec`

#### 3. Backend Controller

**Location**: [modules/workmanagement/controllers/congViec.controller.js](d:\project\webBV\giaobanbv-be\modules\workmanagement\controllers\congViec.controller.js#L231-L244)

```javascript
controller.createCongViec = catchAsync(async (req, res, next) => {
  const congViecData = req.body;
  const newCongViec = await congViecService.createCongViec(congViecData, req);
  return sendResponse(
    res,
    201,
    true,
    { ...newCongViec, updatedAt: newCongViec.updatedAt },
    null,
    "Tạo công việc thành công"
  );
});
```

#### 4. Service Method

**Location**: [modules/workmanagement/services/congViec.service.js](d:\project\webBV\giaobanbv-be\modules\workmanagement\services\congViec.service.js#L2202-L2380)

**Method**: `service.createCongViec()`

**Creates task with status**: `TAO_MOI` (Draft)

**Notification**: ❌ **NOT SENT** (by design)

---

### Actual Notification Trigger

**Method**: `service.giaoViec()` (line 1671-1780)

**Triggered by**: State transition action (separate API call or workflow step)

**Flow**:

1. Task created with `TAO_MOI` status
2. User/system calls "giao việc" action
3. Status changes: `TAO_MOI` → `DA_GIAO`
4. `NgayGiaoViec` set to current date
5. Notification sent: `congviec-giao-viec`

**Verification**: ✅ Notification correctly integrated in workflow, but has bugs in execution.

---

## Summary & Recommendations

### Overall Status: ⚠️ **IMPLEMENTATION EXISTS BUT BROKEN**

| Phase                        | Status     | Issues                                  |
| ---------------------------- | ---------- | --------------------------------------- |
| Phase 1: Type & Templates    | ✅ PASS    | Properly defined                        |
| Phase 2: Builder Integration | ⚠️ PARTIAL | Builder called but context mismatched   |
| Phase 3: Recipients Logic    | ❌ FAIL    | Template 2 recipient variable not found |
| Phase 4: Template Rendering  | ⚠️ PARTIAL | Variables exist but recipients broken   |
| Phase 5: E2E Flow            | ✅ PASS    | Correctly placed in workflow            |

---

### Critical Bugs Summary

#### 🔴 **BUG #1 (CRITICAL)**: Template 2 Recipient Variable Mismatch

- **Template expects**: `arrNguoiLienQuanID`
- **Builder provides**: `NguoiThamGia`
- **Impact**: Participants (PHOI_HOP) **never receive notifications**
- **Fix**: Either:
  - A) Update template to use `NguoiThamGia` in `recipientConfig`, OR
  - B) Add `arrNguoiLienQuanID` field to builder output

#### 🟡 **BUG #2 (MEDIUM)**: Context Field Not Used

- **Service passes**: `arrNguoiNhanViecID` (computed list)
- **Builder ignores it**: Uses `congViec.NguoiThamGia` directly
- **Impact**: Dead code, potential confusion
- **Fix**: Remove `arrNguoiNhanViecID` from context or refactor builder to use it

#### 🟡 **BUG #3 (MEDIUM)**: Wrong Context Type

- **Service passes**: `nguoiGiao` (object with `{ Ten }`)
- **Builder expects**: `tenNguoiGiao` (string) OR `nguoiGiaoViecId` (string)
- **Impact**: `TenNguoiGiao` may fall back to populated field (works but inconsistent)
- **Fix**: Pass `tenNguoiGiao: nguoiGiao?.Ten` in context

---

### Recommendations

#### Priority 1 (Critical - Fix Immediately):

1. **Fix Template 2 recipient variable**:

   ```javascript
   // Option A: Update template seed
   recipientConfig: { variables: ["NguoiThamGia"] }

   // Option B: Add to builder
   arrNguoiLienQuanID: context.nguoiThamGiaIds || (populated.NguoiThamGia || []).map(...)
   ```

#### Priority 2 (Medium - Code Quality):

2. **Clean up unused context field**:

   ```javascript
   // Remove from service.giaoViec():
   // arrNguoiNhanViecID: [...new Set(arrNguoiNhanViecID)], // DELETE THIS
   ```

3. **Fix context field type**:
   ```javascript
   // In service.giaoViec():
   const notificationData = await buildCongViecNotificationData(congviec, {
     tenNguoiGiao: nguoiGiao?.Ten, // CHANGED
     tenNguoiThucHien: nguoiGiao?.Ten, // ADD THIS
   });
   ```

#### Priority 3 (Low - Testing):

4. **Add integration test**:
   - Verify both templates send notifications
   - Verify participants receive notifications
   - Test with multiple participants

---

### Test Checklist

- [ ] Main assignee (NguoiChinhID) receives notification ✅ (Currently works)
- [ ] Participants (NguoiThamGia) receive notification ❌ (Currently broken)
- [ ] Assigner (NguoiGiaoViecID) does NOT receive notification ✅ (Correctly filtered)
- [ ] `TenNguoiThucHien` displays correctly in both templates ⚠️ (Needs verification)
- [ ] Multiple participants all receive notifications ❌ (Blocked by Bug #1)

---

## Conclusion

The `congviec-giao-viec` notification type is **partially implemented** with correct workflow integration but contains **critical bugs** preventing participant notifications. The main assignee notification works, but the second template (for participants) is non-functional due to recipient variable name mismatch.

**Recommended Action**: Fix Bug #1 immediately (update template seed or builder) before deploying to production.

---

**Audit Completed**: 2024-12-25  
**Next Steps**: Implement fixes and re-test notification delivery for all recipient groups.
