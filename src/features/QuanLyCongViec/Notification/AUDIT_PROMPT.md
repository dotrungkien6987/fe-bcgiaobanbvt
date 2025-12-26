# 🔍 NOTIFICATION AUDIT PROMPT

> **Phiên bản**: 3.0 (Centralized Builders Architecture)  
> **Cập nhật**: December 25, 2025  
> **Cách dùng**: Copy prompt → Điền type code → Paste vào AI chat

---

## 📋 HƯỚNG DẪN SỬ DỤNG

### Bước 1: Copy toàn bộ prompt bên dưới (từ dòng "---BẮT ĐẦU---")

### Bước 2: Thay `[TYPE_CODE]` bằng mã notification (VD: `yeucau-tao-moi`)

### Bước 3: Paste vào AI chat và chờ kết quả

---

## 🚀 PROMPT (Copy từ đây)

```
---BẮT ĐẦU PROMPT---

Bạn là AI Agent chuyên audit hệ thống notification. Thực hiện audit cho type sau:

## 🎯 TYPE CẦN AUDIT:
**Type Code**: `[TYPE_CODE]`

---

## 📚 CONTEXT (Bắt buộc đọc):

### Kiến trúc hệ thống hiện tại (Centralized Builders):
```

[UI Action] → [Redux Thunk] → [BE Endpoint] → [Service]
↓
🆕 buildXxxNotificationData(entity, context) ← CENTRALIZED BUILDER
↓ Returns complete data object (29 fields)
notificationService.send({ type, data })
↓
DB lookup (NotificationType + Templates)
↓
Render templates với variables
↓
Resolve recipients (NhanVienID → UserID)
↓
Insert MongoDB + Socket.IO broadcast

````

### 🆕 CENTRALIZED BUILDERS (Single Source of Truth):

**File**: `giaobanbv-be/modules/workmanagement/helpers/notificationDataBuilders.js`

**3 Builder Functions:**
1. `buildYeuCauNotificationData(yeuCau, context)` → 29 fields
   - Recipient candidates: 10 fields
   - Display fields: 19 fields

2. `buildCongViecNotificationData(congViec, context)` → 29 fields
   - Recipient candidates: 10 fields
   - Display fields: 19 fields

3. `buildKPINotificationData(danhGia, context)` → 16 fields
   - Recipient candidates: 6 fields
   - Display fields: 10 fields

**Benefits:**
- ✅ Guaranteed ALL variables available (no missing field bugs)
- ✅ Null safety built-in (`?.` + fallbacks)
- ✅ Single place to maintain variables
- ✅ Consistent formatting (dates, IDs, strings)
- ✅ Auto-populate entities

**Usage Pattern:**
```javascript
// ✅ CORRECT WAY (with builder)
const data = await buildYeuCauNotificationData(yeuCau, {
  tenNguoiThucHien: performer?.Ten,
  arrNguoiDieuPhoiID: [nhanVienId1, nhanVienId2],
  thoiGianHenCu: dayjs(oldDeadline).format('DD/MM/YYYY HH:mm')
});
await notificationService.send({
  type: 'yeucau-tao-moi',
  data  // ← Complete object with 29 fields
});

// ❌ WRONG WAY (manual - OUTDATED, DON'T USE)
await notificationService.send({
  type: 'yeucau-tao-moi',
  data: {
    _id, MaYeuCau, TieuDe, ... // Risk: missing fields
  }
});
````

### Files quan trọng:

**Backend (giaobanbv-be/):**

- `modules/workmanagement/helpers/notificationDataBuilders.js` - 🆕 **CENTRALIZED BUILDERS**
- `seeds/notificationTypes.seed.js` - Type definitions (44 types)
- `seeds/notificationTemplates.seed.js` - Template definitions (54 templates)
- `modules/workmanagement/services/notificationService.js` - Core engine
- `modules/workmanagement/services/yeuCau.service.js` - YeuCau triggers (4 locations)
- `modules/workmanagement/services/yeuCauStateMachine.js` - State machine (15 transitions)
- `modules/workmanagement/services/congViec.service.js` - CongViec triggers (9 locations)
- `modules/workmanagement/controllers/kpi.controller.js` - KPI triggers (6 locations)

**Frontend (fe-bcgiaobanbvt/src/features/QuanLyCongViec/):**

- `Ticket/yeuCauSlice.js` - YeuCau thunks
- `CongViec/congViecSlice.js` - CongViec thunks
- `KPI/*Slice.js` - KPI thunks

---

## 📋 NHIỆM VỤ (Thực hiện tuần tự):

### BƯỚC 1: TÌM KIẾM (5 phút)

#### 1.1. Tìm Type Definition

**File**: `seeds/notificationTypes.seed.js`  
**Tìm**: Object có `code` === `[TYPE_CODE]`

**Output**:

```javascript
// Type Definition:
{
  code: "yeucau-tao-moi",
  name: "Yêu cầu mới được tạo",
  category: "YEUCAU",
  variables: [
    { name: "_id", type: "ObjectId", isRecipientCandidate: false },
    { name: "NguoiYeuCauID", type: "ObjectId", isRecipientCandidate: true },
    { name: "arrNguoiDieuPhoiID", type: "Array", isRecipientCandidate: true },
    // ... list ALL variables
  ]
}
```

**Status**: ✅ Found | ❌ NOT FOUND

#### 1.2. Tìm Template(s)

**File**: `seeds/notificationTemplates.seed.js`  
**Tìm**: Objects có `typeCode` === `[TYPE_CODE]`

**Output**:

```javascript
// Template(s) Found:
[
  {
    type: "THONG_BAO_CAC_NHOM",
    typeCode: "yeucau-tao-moi",
    titleTemplate: "...",
    bodyTemplate: "...",
    actionUrlTemplate: "...",
    recipientConfig: { useVariables: [...] }
  }
  // ... more templates if any
]
```

**Count**: X template(s) found  
**Status**: ✅ Found | ❌ NOT FOUND

#### 1.3. Tìm Builder Call

**Search**: `buildYeuCauNotificationData|buildCongViecNotificationData|buildKPINotificationData` kết hợp với `type.*[TYPE_CODE]`

**Output**:

```
📍 File: [service file path]
📍 Line: [number]
📍 Function: [functionName]()

Code:
const data = await buildYeuCauNotificationData(yeuCau, {
  tenNguoiThucHien: performer?.Ten,
  arrNguoiDieuPhoiID,
  ...
});
await notificationService.send({ type: '[TYPE_CODE]', data });
```

**Status**: ✅ Uses Builder | ⚠️ Manual (needs refactor) | ❌ NOT IMPLEMENTED

#### 1.4. Tìm Frontend Trigger

**Search**: Thunk hoặc API call gọi endpoint liên quan

**Output**:

```
📍 Thunk: [slice file] → [thunkName]()
📍 Endpoint: POST /api/workmanagement/yeucau
📍 UI Component: [ButtonName] trong [ComponentFile]
```

---

### BƯỚC 2: VALIDATE (10 phút)

#### 2.1. Builder Output Check

**Nhiệm vụ**: Verify builder returns đủ variables cho type

```markdown
## Builder Analysis

### Builder Used:

- buildYeuCauNotificationData() | buildCongViecNotificationData() | buildKPINotificationData()

### Builder Output Fields (from code):

[List ALL fields builder returns - read from notificationDataBuilders.js]

Example:

- \_id (ObjectId)
- NguoiYeuCauID (ObjectId)
- MaYeuCau (String)
- TieuDe (String)
- ...

### Type Definition Variables:

[List from notificationTypes.seed.js]

### ✅ Validation:

- [ ] Builder output ⊇ Type variables (builder provides all needed fields)
- [ ] No missing variables
- [ ] All recipient candidates included
```

#### 2.2. Context Parameters Check

**Nhiệm vụ**: Verify service passes correct context to builder

````markdown
## Context Parameters Analysis

### Builder Call in Service:

```javascript
const data = await buildXxxNotificationData(entity, {
  // List context parameters passed
  tenNguoiThucHien: performer?.Ten,
  arrNguoiDieuPhoiID: [...],
  thoiGianHenCu: oldDeadline,
  ...
});
```
````

### Builder Accepts (from notificationDataBuilders.js):

[List accepted context parameters from JSDoc]

Example for YeuCau:

- context.tenNguoiThucHien
- context.arrNguoiDieuPhoiID
- context.arrQuanLyKhoaID
- context.thoiGianHenCu
- context.nguoiSuaId
- context.tenNguoiSua
- ... (see JSDoc for full list)

### ✅ Validation:

- [ ] Service passes required context (check action-specific needs)
- [ ] Context params match builder signature
- [ ] No undefined/null context values (unless optional)

````

#### 2.3. Recipients Logic Check

```markdown
## Recipients Analysis

### Template Config:
```javascript
recipientConfig: {
  useVariables: ["NguoiYeuCauID", "arrNguoiDieuPhoiID"]
}
````

### Type Variables (isRecipientCandidate: true):

[List recipient candidate variables from type definition]

### Builder Provides:

[List recipient fields builder returns]

### Service Context:

[Check how service gets recipient IDs - from config? from entity?]

### ✅ Validation:

- [ ] Template useVariables ⊆ Type recipient candidates
- [ ] Builder returns all recipient fields
- [ ] Service provides correct IDs (NhanVienID, NOT UserID)
- [ ] IDs are Strings (`.toString()`)
- [ ] Performer excluded if needed (filter out nguoiThucHienId)
- [ ] Empty arrays handled gracefully

````

#### 2.4. Template Variables Check

```markdown
## Template Variables Extraction

### Extract from templates:
**titleTemplate**: "{{TenNguoiYeuCau}} tạo yêu cầu {{MaYeuCau}}"
  → Variables: TenNguoiYeuCau, MaYeuCau

**bodyTemplate**: "Tiêu đề: {{TieuDe}}. Khoa: {{TenKhoaGui}}"
  → Variables: TieuDe, TenKhoaGui

**actionUrlTemplate**: "/yeucau/{{_id}}"
  → Variables: _id

**All unique variables**: [_id, TenNguoiYeuCau, MaYeuCau, TieuDe, TenKhoaGui]

### ✅ Validation:
- [ ] All template variables ∈ Builder output
- [ ] All template variables ∈ Type definition
- [ ] No typos (case-sensitive)
- [ ] No undefined variables ({{MissingVar}})
````

#### 2.5. Null Safety Check

**Builder đã có null safety built-in, nhưng check service logic:**

````markdown
## Null Safety Analysis

### Builder Null Safety (built-in):

- ✅ Optional chaining: `yeuCau?.NguoiYeuCauID?.Ten`
- ✅ Fallback values: `|| ""`
- ✅ Date formatting safe: checks before dayjs()

### Service-Level Safety:

**Check service code for:**

- [ ] Entity exists check: `if (!yeuCau) return;`
- [ ] Populate success: `const populated = await ...`
- [ ] Try-catch around builder call
- [ ] Don't throw on notification failure

Example:

```javascript
try {
  const data = await buildYeuCauNotificationData(yeuCau, context);
  await notificationService.send({ type, data });
} catch (error) {
  console.error("Notification failed:", error.message);
  // Don't throw - notification failure shouldn't block workflow
}
```
````

````

#### 2.6. Action URL Check

```markdown
## Action URL Validation

### Template actionUrlTemplate:
"/yeucau/{{_id}}"

### Variables in URL:
[Extract {{...}} patterns]

### ✅ Validation:
- [ ] Starts with `/` (absolute path)
- [ ] Variables exist in builder output
- [ ] URL pattern matches frontend route
- [ ] Entity ID field correct (usually `_id`)

### Frontend Route Check:
**Search in routes config:**
```javascript
// Example route
{
  path: '/yeucau/:id',
  element: <YeuCauDetail />
}
````

- [ ] Route exists
- [ ] Path param matches (`:id` ← `{{_id}}`)
- [ ] Component handles entity display

### Example Rendered URL:

`/yeucau/507f1f77bcf86cd799439011` ✅

### Test Plan:

1. Click notification
2. Browser navigates to URL
3. Page loads with entity data
4. No 404 or errors

````

---

### BƯỚC 3: TẠO FIXES (nếu cần)

**⚠️ Lưu ý**: Với centralized builders, hầu hết bugs đã được fix. Chỉ cần check:

#### Fix 1: Service chưa dùng builder

```markdown
## 🔧 FIX: Migrate to Centralized Builder

**File**: `[service file]`
**Line**: `[number]`

**BEFORE**:
```javascript
await notificationService.send({
  type: 'yeucau-tao-moi',
  data: {
    _id: yeuCau._id.toString(),
    MaYeuCau: yeuCau.MaYeuCau,
    // ... manual fields
  }
});
````

**AFTER**:

```javascript
const {
  buildYeuCauNotificationData,
} = require("../helpers/notificationDataBuilders");

const data = await buildYeuCauNotificationData(yeuCau, {
  tenNguoiThucHien: performer?.Ten,
  arrNguoiDieuPhoiID,
});
await notificationService.send({ type: "yeucau-tao-moi", data });
```

**Benefits**:

- 29 fields guaranteed instead of manual ~10 fields
- Null safety built-in
- Consistent formatting

````

#### Fix 2: Missing context parameter

```markdown
## 🔧 FIX: Add Missing Context

**Problem**: Action-specific field not passed to builder

**Example**: DOI_THOI_GIAN_HEN needs `thoiGianHenCu`

**BEFORE**:
```javascript
const data = await buildYeuCauNotificationData(yeuCau, {
  tenNguoiThucHien: performer?.Ten
});
````

**AFTER**:

```javascript
const data = await buildYeuCauNotificationData(yeuCau, {
  tenNguoiThucHien: performer?.Ten,
  thoiGianHenCu: dayjs(data.oldDeadline).format("DD/MM/YYYY HH:mm"), // ← Add this
});
```

````

#### Fix 3: Wrong recipient IDs

```markdown
## 🔧 FIX: Use NhanVienID not UserID

**BEFORE**:
```javascript
arrNguoiDieuPhoiID: users.map(u => u._id) // ❌ UserID
````

**AFTER**:

```javascript
arrNguoiDieuPhoiID: config.layDanhSachNguoiDieuPhoiIDs(); // ✅ NhanVienID
```

````

---

### BƯỚC 4: TEST PLAN

```markdown
## 🧪 Test Plan

### Prerequisite:
- Backend running with latest code
- Database seeded with types/templates
- Frontend connected

### Test Case 1: Happy Path
**Setup**:
- Existing entity (YeuCau/CongViec/DanhGiaKPI)
- Valid performer
- Recipients exist

**Action**:
[Describe user action - VD: "Tạo yêu cầu mới"]

**Expected**:
- [ ] Notification sent (check logs)
- [ ] Recipients received (check bell icon count)
- [ ] Title rendered correctly
- [ ] Body rendered correctly
- [ ] ActionUrl correct format

**Verify in DB**:
```javascript
db.notifications.find({
  type: "[TYPE_CODE]",
  createdAt: { $gte: new Date(Date.now() - 60000) }
}).pretty()
````

**Check fields**:

- type === "[TYPE_CODE]"
- data object has ~29 fields (for YeuCau/CongViec) or ~16 (for KPI)
- All template variables present
- No null/undefined values
- recipientUserIds array populated

### Test Case 2: Navigate on Click

**Action**: Click notification in bell dropdown

**Expected**:

- [ ] Browser navigates to actionUrl
- [ ] URL matches pattern (e.g., `/yeucau/507f1f77bcf86cd799439011`)
- [ ] Page loads correctly
- [ ] Entity data displays
- [ ] No 404 or console errors

### Test Case 3: Edge Cases

**Scenarios**:

- Empty recipients array → No notification sent, log warning ✅
- Null optional fields → Fallback values show ✅
- Builder throws error → Caught, logged, workflow continues ✅

````

---

### BƯỚC 5: BÁO CÁO

```markdown
# 📊 AUDIT REPORT: [TYPE_CODE]

## Summary

| Item | Status | Notes |
|------|--------|-------|
| Type Definition | ✅/❌ | Found in seed file |
| Template(s) | ✅/❌ | X template(s) found |
| Builder Integration | ✅/⚠️/❌ | Using builder / Manual / Not implemented |
| Builder Output Match | ✅/❌ | All 29 fields provided |
| Context Parameters | ✅/❌ | Correct params passed |
| Recipients Logic | ✅/❌ | NhanVienIDs, not UserIDs |
| Template Variables | ✅/❌ | All vars available |
| Null Safety | ✅/❌ | Builder + service safe |
| Action URL | ✅/❌ | Valid pattern, route exists |
| **Overall** | ✅ PASSED / ⚠️ NEEDS FIX / ❌ NOT IMPLEMENTED | |

## Issues Found

1. [Issue description if any]
2. ...

## Fixes Applied

1. [Fix description if any]
2. ...

## Files Involved

- ✅ seeds/notificationTypes.seed.js
- ✅ seeds/notificationTemplates.seed.js
- ✅ helpers/notificationDataBuilders.js
- ✅/⚠️/❌ [service file]
- ✅ [frontend file]

## Next Steps

- [ ] Apply fixes (if any)
- [ ] Run test plan
- [ ] Verify in dev environment
- [ ] Update documentation (if needed)
````

---

## ⚠️ QUY TẮC QUAN TRỌNG:

### DO's (Làm):

1. ✅ **CHECK BUILDER USAGE** - Service phải dùng `buildXxxNotificationData()`
2. ✅ **VERIFY OUTPUT** - Builder returns 29 fields (YeuCau/CongViec) hoặc 16 (KPI)
3. ✅ **CONTEXT PARAMS** - Pass đúng context cho action-specific fields
4. ✅ **READ ACTUAL CODE** - Grep trong codebase, không đoán
5. ✅ **TEST URL** - Click notification phải navigate đúng

### DON'Ts (Không làm):

1. ❌ **MANUAL DATA BUILDING** - Không accept code build data thủ công
2. ❌ **ASSUME VARIABLES** - Phải verify trong builder code
3. ❌ **SKIP NULL SAFETY** - Builder có sẵn nhưng service cần try-catch
4. ❌ **USE UserID** - Recipients phải là NhanVienID
5. ❌ **IGNORE ERRORS** - Notification fail không được throw error (log only)

### Key Points:

- 🎯 **Single Source of Truth**: `notificationDataBuilders.js`
- 🔒 **Null Safety**: Built-in with `?.` and `|| ""`
- 📝 **29 Fields**: YeuCau/CongViec always return 29 fields
- 🏷️ **16 Fields**: KPI returns 16 fields
- 🔑 **NhanVienID**: Not UserID for recipients

---

**Bây giờ hãy thực hiện audit cho type code: `[TYPE_CODE]`**

---KẾT THÚC PROMPT---

```

---

## 📝 VÍ DỤ SỬ DỤNG

**Input:**
```

Type Code: yeucau-tao-moi

```

**AI sẽ tự động:**
1. Tìm type definition và templates
2. Tìm builder call trong service
3. Verify builder output vs type variables
4. Check context parameters
5. Validate recipients logic
6. Test action URL
7. Generate complete report

---

## 🎯 QUICK AUDIT (Phiên bản rút gọn)

Nếu chỉ cần kiểm tra nhanh:

```

Audit nhanh notification: [TYPE_CODE]

Checklist:

1. [ ] Service dùng buildXxxNotificationData() (không manual)
2. [ ] Builder trả về đủ 29/16 fields
3. [ ] Context params đúng cho action
4. [ ] Recipients = NhanVienID (không phải UserID)
5. [ ] ActionUrl có route trong frontend

Report: ✅ OK | ⚠️ Needs fix | ❌ Not implemented

```

---

## 📚 Related Docs

- **Schema Reference**: [../SCHEMA_QUICK_REFERENCE.md](SCHEMA_QUICK_REFERENCE.md)
- **Builder Source**: `giaobanbv-be/modules/workmanagement/helpers/notificationDataBuilders.js`
- **Seed Files**:
  - `giaobanbv-be/seeds/notificationTypes.seed.js`
  - `giaobanbv-be/seeds/notificationTemplates.seed.js`

---

*Prompt version 3.0 - Optimized for Centralized Builders Architecture*
```
