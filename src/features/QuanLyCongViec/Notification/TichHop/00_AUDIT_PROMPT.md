# 🔍 NOTIFICATION AUDIT PROMPT

> **Phiên bản**: 2.0 (Sau Refactor)
> **Cập nhật**: December 23, 2025
> **Cách dùng**: Copy prompt → Điền type code → Paste vào AI chat

---

## 📋 HƯỚNG DẪN SỬ DỤNG

### Bước 1: Copy toàn bộ prompt bên dưới (từ dòng "---BẮT ĐẦU---")

### Bước 2: Thay `[TYPE_CODE]` bằng mã notification (VD: `kpi-duyet-danh-gia`)

### Bước 3: Paste vào AI chat và chờ kết quả

---

## 🚀 PROMPT (Copy từ đây)

```
---BẮT ĐẦU PROMPT---

Bạn là AI Agent chuyên audit hệ thống notification. Thực hiện audit cho template sau:

## 🎯 TEMPLATE CẦN AUDIT:
**Type Code**: `[TYPE_CODE]`

---

## 📚 CONTEXT (Bắt buộc đọc):

### Kiến trúc hệ thống:
```

[UI Action] → [Redux Thunk] → [BE Endpoint] → [Service]
→ notificationService.send({ type, data })
→ DB lookup (NotificationType + Template)
→ Render template với variables
→ Resolve recipients (NhanVienID → UserID)
→ Insert MongoDB + Socket.IO broadcast

````

### Files quan trọng:
**Backend (giaobanbv-be/):**
- `seeds/notificationTypes.js` - Type definitions
- `seeds/notificationTemplates.js` - Template definitions
- `modules/workmanagement/services/notificationService.js` - Core engine
- `modules/workmanagement/services/yeuCau.service.js` - YeuCau triggers
- `modules/workmanagement/services/yeuCauStateMachine.js` - State machine
- `modules/workmanagement/services/congViec.service.js` - CongViec triggers
- `modules/workmanagement/controllers/kpi.controller.js` - KPI triggers

**Frontend (fe-bcgiaobanbvt/src/features/QuanLyCongViec/):**
- `Ticket/yeuCauSlice.js` - YeuCau thunks
- `CongViec/congViecSlice.js` - CongViec thunks
- `KPI/*Slice.js` - KPI thunks

### Module Context Files:
- `TichHop/01_MODULE_KPI.md` - Nếu type bắt đầu bằng `kpi-`
- `TichHop/02_MODULE_CONGVIEC.md` - Nếu type bắt đầu bằng `congviec-`
- `TichHop/03_MODULE_YEUCAU.md` - Nếu type bắt đầu bằng `yeucau-`

---

## 📋 NHIỆM VỤ (Thực hiện tuần tự):

### BƯỚC 1: TÌM KIẾM (5 phút)

#### 1.1. Tìm Type Definition
**File**: `seeds/notificationTypes.js`
**Tìm**: Object có `code` === type code

**Output**:
```javascript
// Type Definition:
{
  code: "...",
  name: "...",
  category: "...",
  variables: [
    { name: "...", type: "...", isRecipientCandidate: true/false }
  ]
}
````

**Status**: ✅ Found | ❌ NOT FOUND

#### 1.2. Tìm Template(s)

**File**: `seeds/notificationTemplates.js`
**Tìm**: Objects có `typeCode` === type code

**Output**:

```javascript
// Template(s):
{
  type: "TEMPLATE_TYPE",
  typeCode: "...",
  titleTemplate: "...",
  bodyTemplate: "...",
  actionUrlTemplate: "...",
  recipientConfig: { useVariables: [...] }
}
```

**Count**: X template(s) found

#### 1.3. Tìm Service Integration

**Search**: `notificationService.send.*type.*[type-code]` trong services/controllers
**Output**:

````
📍 File: [path]
📍 Line: [number]
📍 Method: [functionName]()
📍 Code:
```javascript
await notificationService.send({
  type: '[type-code]',
  data: { ... }
});
````

```
**Status**: ✅ Found | ❌ NOT IMPLEMENTED

#### 1.4. Tìm Frontend Trigger
**Search**: Thunk gọi endpoint liên quan
**Output**:
```

📍 Thunk: [file] → [functionName]()
📍 UI: [component] → [button/action label]

````

---

### BƯỚC 2: VALIDATE (10 phút)

#### 2.1. Variables Check
```markdown
## Variables Analysis

### Trong Template (extract từ {{...}}):
- titleTemplate: [var1, var2]
- bodyTemplate: [var3, var4, ...]
- actionUrlTemplate: [var5]
- **Tổng unique**: [...]

### Trong Type Definition:
[list từ type.variables]

### Trong Service data object:
[list từ notificationService.send({ data: {...} })]

### ✅ Kết quả:
- [ ] Template vars ⊆ Type vars (không thiếu)
- [ ] Service data ⊇ Template vars (đủ data)
- [ ] Không có typos
````

#### 2.2. Recipients Check

```markdown
## Recipients Analysis

### Template Config:

recipientConfig: { useVariables: [...] }

### Type Variables (isRecipientCandidate: true):

[list]

### Service Implementation:

[code snippet showing recipient data]

### ✅ Kết quả:

- [ ] Recipient vars đúng
- [ ] IDs là String (không phải Object)
- [ ] Có xử lý empty array
- [ ] Performer được exclude (nếu cần)
```

#### 2.3. Null Safety Check

```markdown
## Null Safety Analysis

### Service code:

[relevant code]

### ✅ Kết quả:

- [ ] Có `?.` optional chaining
- [ ] Có fallback values (|| 'default')
- [ ] Date được format (dayjs)
```

#### 2.4. Action URL Check

```markdown
## Action URL Validation

### Template actionUrlTemplate:

"[template url với {{variables}}]"

### Variables trong URL:

[extract variables từ {{...}}]

### Expected URL pattern:

[mô tả URL pattern dự kiến]

### Frontend Route Match:

- [ ] Route exists trong frontend routes
- [ ] URL params match entity ID pattern
- [ ] Page/component tồn tại

### Example rendered URL:

"/path/to/[actual-id]"

### ✅ Kết quả:

- [ ] actionUrlTemplate có trong template
- [ ] Variables trong URL có trong type definition
- [ ] Service data cung cấp đủ variables cho URL
- [ ] URL pattern hợp lệ (bắt đầu với /)
- [ ] Route tồn tại trong frontend
- [ ] Click notification → navigate đúng page

### ⚠️ Common URL Issues:

- Thiếu leading slash: "ticket/123" → "/ticket/123"
- Sai entity type: "/yeucau/{{CongViecID}}" → "/congviec/{{_id}}"
- Variable không tồn tại: "/path/{{MissingVar}}"
```

---

### BƯỚC 3: TẠO FIXES (nếu cần)

Nếu phát hiện issues, tạo code fix:

````markdown
## 🔧 FIX REQUIRED

### Issue 1: [Mô tả]

**File**: [path]
**Line**: [number]

**BEFORE**:

```javascript
// code cũ
```
````

**AFTER**:

```javascript
// code mới
```

**Common URL Fixes**:

```javascript
// ❌ WRONG: Missing leading slash
actionUrlTemplate: "congviec/{{_id}}";

// ✅ CORRECT: With leading slash
actionUrlTemplate: "/congviec/{{_id}}";

// ❌ WRONG: Variable không match entity
actionUrlTemplate: "/yeucau/{{CongViecID}}";

// ✅ CORRECT: Dùng đúng ID field
actionUrlTemplate: "/yeucau/{{_id}}";

// ❌ WRONG: Variable không được populate
const notification = { YeuCauID: objectId }; // Chỉ có ID, không có data

// ✅ CORRECT: Populate entity to extract fields
const yeuCau = await YeuCau.findById(yeuCauId).populate("KhoaID");
const notification = {
  _id: yeuCau._id.toString(),
  TenYeuCau: yeuCau.TenYeuCau,
};
```

**Giải thích**: [...]

````

---

### BƯỚC 4: TEST PLAN

```markdown
## 🧪 Test Plan

### Test Case 1: Happy Path
**Setup**: [mô tả setup]
**Action**: [user action]
**Expected**:
- [ ] Notification gửi đến [recipients]
- [ ] Title: "[expected title]"
- [ ] ActionUrl: "[expected url]"

**Verify DB**:
```javascript
db.notifications.find({
  type: "[type-code]",
  createdAt: { $gte: new Date(Date.now() - 60000) }
})
```

**URL Navigation Test**:
- [ ] Click notification trong bell dropdown
- [ ] Browser navigates to actionUrl
- [ ] Page hiển thị đúng entity (ID matching)
- [ ] Không có 404 or routing errors
- [ ] Page components render correctly with entity data`

### Test Case 2: Null Values

**Setup**: Entity có null fields
**Expected**: Fallback values hiển thị, không crash

### Test Case 3: No Recipients

**Setup**: Không có người nhận hợp lệ
**Expected**: Không gửi, log warning

````

---

### BƯỚC 5: BÁO CÁO

```markdown
# 📊 AUDIT REPORT: [type-code]

## Summary

| Item                | Status                                        |
| ------------------- | --------------------------------------------- |
| Type Definition     | ✅/❌                                         |
| Template(s)         | ✅/❌ (count)                                 |
| Service Integration | ✅/❌/⚠️                                      |
| Variables Match     | ✅/❌                                         |
| Recipients Logic    | ✅/❌                                         |
| Null Safety         | ✅/❌                                         |
| Action URL          | ✅/❌                                         |
| **Overall**         | ✅ PASSED / ⚠️ NEEDS FIX / ❌ NOT IMPLEMENTED |

## Issues Found

1. [issue if any]

## Fixes Applied

1. [fix if any]

## Files Involved

- ✅/❌ seeds/notificationTypes.js
- ✅/❌ seeds/notificationTemplates.js
- ✅/❌ [service file]
- ✅/❌ [frontend file]

## Next Steps

- [ ] Apply fixes
- [ ] Run tests
- [ ] Update checklist
```

---

## ⚠️ QUY TẮC QUAN TRỌNG:

1. **ĐỌC CODE THẬT** - Không đoán, grep trong codebase
2. **NULL SAFETY** - Mọi field access phải có `?.` và fallback
3. **RECIPIENT = NhanVienID** - Không dùng User.\_id
4. **STRING IDS** - Convert ObjectId → String trước khi gửi
5. **EXCLUDE PERFORMER** - Không gửi notification cho người thực hiện

---

Bây giờ hãy thực hiện audit cho type code: `[TYPE_CODE]`

---KẾT THÚC PROMPT---

```

---

## 📝 VÍ DỤ SỬ DỤNG

**Input đơn giản:**
```

Type Code: kpi-duyet-danh-gia

```

**AI sẽ tự động:**
1. Đọc context từ MODULE_KPI.md
2. Tìm type/template trong seed files
3. Tìm service integration
4. Validate variables
5. Generate test plan
6. Output complete report

---

## 🎯 QUICK AUDIT (Phiên bản rút gọn)

Nếu chỉ cần kiểm tra nhanh:

```

Audit nhanh notification: [TYPE_CODE]

Chỉ cần:

1. Tìm type definition và template
2. Tìm service integration (có/không)
3. List variables cần truyền
4. Báo cáo 1 dòng: ✅ OK | ❌ Missing | ⚠️ Needs fix

```

---

*Prompt này được thiết kế để AI có thể audit bất kỳ notification nào trong 5-10 phút.*
```
