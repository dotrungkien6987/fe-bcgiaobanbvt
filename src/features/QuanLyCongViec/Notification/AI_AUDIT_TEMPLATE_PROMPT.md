# 🔍 AI PROMPT: KIỂM TRA & SỬA LỖI NOTIFICATION TEMPLATE

> **Phiên bản**: v1.1  
> **Ngày cập nhật**: 17/12/2025  
> **Mục đích**: Audit và fix các template notification hiện có trong hệ thống

---

## 📖 HƯỚNG DẪN SỬ DỤNG

### Bước 1: Copy prompt bên dưới

### Bước 2: Chỉ cần điền **TEMPLATE_TYPE** (VD: `TASK_ASSIGNED`)

### Bước 3: Paste vào AI chat và chờ kết quả

---

## 📋 PROMPT TEMPLATE (COPY TỪ ĐÂY)

```markdown
Bạn là AI Agent chuyên kiểm tra hệ thống notification. Tôi cần bạn kiểm tra ĐẦY ĐỦ một template hiện có và sửa mọi vấn đề phát hiện được.

## ✅ PHẠM VI (BẮT BUỘC)

- Chỉ audit trong **module WorkManagement** (Frontend: `src/features/QuanLyCongViec/**`, Backend: `modules/workmanagement/**`).
- Không mở rộng sang module khác trừ khi cần để giải thích pipeline notification chung (`triggerService`, `notificationService`, `notificationHelper`, `notificationTriggers`).
- Mục tiêu: rà soát **end-to-end từ UI/UX → FE thunk → BE endpoint → trigger → template → Notification record/socket**.

## 🎯 TEMPLATE CẦN KIỂM TRA:

**Template Type**: `[ĐIỀN TYPE VÀO ĐÂY, VD: TASK_ASSIGNED]`

**Mô tả (tùy chọn)**: [VD: "Notification không gửi đúng người" hoặc để trống]

---

## 📚 BỐI CẢNH HỆ THỐNG:

### Vị trí các files quan trọng:
```

giaobanbv-be/
├── seeds/notificationTemplates.js # Định nghĩa templates (43 templates)
├── config/notificationTriggers.js # Cấu hình triggers (38 configs)
├── services/
│ ├── triggerService.js # Service xử lý trigger (8 custom handlers)
│ └── notificationService.js # Service tạo notification + Socket.IO
├── modules/workmanagement/
│ ├── services/
│ │ ├── yeuCauStateMachine.js # 15 state transitions cho YeuCau
│ │ ├── yeuCau.service.js # CRUD YeuCau
│ │ ├── congViec.service.js # CRUD CongViec + 6 field updates
│ │ ├── file.service.js # Upload/delete files
│ │ └── comment.service.js # Comments
│ └── controllers/
│ ├── kpi.controller.js # Đánh giá KPI
│ └── assignment.controller.js # Phân công KPI

````

### Frontend (WorkManagement) — nơi phát sinh event UI/UX (gợi ý vị trí)

```
fe-bcgiaobanbvt/
└── src/features/QuanLyCongViec/
  ├── Ticket/
  │   ├── YeuCauDetailPage.js            # Page chi tiết + điều hướng mở dialog
  │   ├── yeuCauSlice.js                 # Thunks gọi /workmanagement/yeucau/...
  │   └── components/
  │       ├── YeuCauActionButtons.js     # Map action → label button
  │       └── *Dialog.js                 # Payload onSubmit (VD: DieuPhoiDialog)
  ├── CongViec/
  │   ├── CongViecDetailPage.js          # Page chi tiết công việc
  │   ├── CongViecDetailDialog.js        # Dialog chi tiết (nếu dùng)
  │   └── congViecSlice.js               # Thunks gọi /workmanagement/congviec/...
  └── KPI/
    ├── kpiSlice.js                    # Thunks KPI tổng hợp
    ├── kpiEvaluationSlice.js          # Thunks đánh giá KPI
    └── pages/*Page.js                 # Các màn hình KPI (duyệt/tự đánh giá/báo cáo)
```

### Sơ đồ luồng (WorkManagement, bắt buộc rà soát)

```
[UI/UX: Page/Dialog/Button]
  ↓ (onClick / onSubmit)
[Redux thunk / slice action]
  ↓ (apiService axios)
[BE route: /workmanagement/...]
  ↓
[Controller] → [Service/StateMachine]
  ↓
[triggerService.fire(module, trigger, context, performerId)]
  ↓
[trigger handler] → [resolve recipients (NhanVienID→User._id)] → [exclude performer]
  ↓
[notificationService.sendToMany]
  ↓
[MongoDB: Notification collection] + [Socket emit]
  ↓
[FE: Notification UI fetch/subscribe hiển thị]
```

### Các “điểm rơi im lặng” cần check (rất hay gặp)

1. FE **không gọi** đúng endpoint (thunk sai URL / chưa dispatch / UI không mở dialog submit).
2. BE **có gọi trigger** nhưng bị return sớm trong `triggerService` (trigger disabled / handler trả recipients rỗng / context thiếu).
3. Resolve recipients thất bại do nhầm **User vs NhanVien**:
   - WorkManagement dùng **NhanVienID** (không phải `User._id`).
   - Notification recipients thường resolve theo `User.NhanVienID` → `User._id`.
4. `excludePerformer=true` loại hết recipients (đặc biệt khi performer cũng là người nhận).
5. `UserNotificationSettings.shouldSend(type, 'inapp')` chặn in-app.
6. Notification đã tạo trong DB nhưng FE không hiển thị (không fetch, không subscribe socket, filter UI).

### Cú pháp variables:
```javascript
// Templates dùng cú pháp {{variableName}}
// Extract bằng regex: /\{\{(\w+)\}\}/g
````

### Các lỗi thường gặp:

1. **Thiếu variables**: Handler không extract đủ variables cho template
2. **Recipients sai**: Logic recipients sai hoặc không loại trừ performer
3. **Không có trigger**: Template có nhưng không được gọi trong code
4. **Trigger bị tắt**: `enabled: false` trong config
5. **Không khớp**: templateCode khác với template.type

---

## 📋 QUY TRÌNH KIỂM TRA:

### GIAI ĐOẠN 1: TÌM KIẾM THÔNG TIN (5 phút)

#### Nhiệm vụ 1.0: Xác định nguồn phát sinh từ UI/UX (FE → BE)

> Mục tiêu: biết chính xác **UI nào** (page/dialog/button) và **thunk nào** gọi endpoint dẫn tới trigger/template này.

Yêu cầu thực hiện:

1. Từ template type, suy ra trigger key tương ứng trong BE (ở `config/notificationTriggers.js`).

2. Tìm endpoint BE (routes/controllers/services) đã gọi `triggerService.fire(...)` cho trigger đó.

3. Tìm FE thunk gọi endpoint đó (thường trong các slice):

- `src/features/QuanLyCongViec/Ticket/yeuCauSlice.js` (Yêu Cầu)
- `src/features/QuanLyCongViec/CongViec/congViecSlice.js` (Công Việc)
- `src/features/QuanLyCongViec/KPI/kpi.controller` phía BE, FE thường ở `src/features/QuanLyCongViec/KPI/*Slice.js`

4. Tìm UI component gọi thunk (page/dialog/component) và ghi rõ nhãn UI (nếu có).

KẾT QUẢ MONG ĐỢI (báo cáo dạng bảng):

| UI/UX nguồn                    | FE thunk   | BE endpoint      | BE service/state   | Trigger key      | Template type   |
| ------------------------------ | ---------- | ---------------- | ------------------ | ---------------- | --------------- |
| [File#L..] + tên button/dialog | [File#L..] | [Route file#L..] | [Service file#L..] | `Module.TRIGGER` | `TEMPLATE_TYPE` |

#### Nhiệm vụ 1.1: Tìm Template Definition

````javascript
// Tìm trong: seeds/notificationTemplates.js
// Tìm: object có type khớp với input

KẾT QUẢ MONG ĐỢI:
## Tìm thấy Template
```javascript
{
  type: "...",
  name: "...",
  titleTemplate: "...",
  bodyTemplate: "...",
  requiredVariables: [...],
  category: "...",
  icon: "...",
  // ... toàn bộ object
}
````

**Trạng thái**: ✅ Tìm thấy | ❌ KHÔNG TÌM THẤY

````

#### Nhiệm vụ 1.2: Tìm Trigger Config
```javascript
// Tìm trong: config/notificationTriggers.js
// Tìm: config có templateCode === template.type

KẾT QUẢ MONG ĐỢI:
## Tìm thấy Trigger Config
```javascript
{
  module: "...",
  trigger: "...",
  templateCode: "...",
  recipients: { roles: [...], custom: (context) => {...} },
  enabled: true/false
}
````

**Trạng thái**: ✅ Tìm thấy | ❌ KHÔNG TÌM THẤY | ⚠️ BỊ TẮT
**Dòng code**: Line #XX trong notificationTriggers.js

````

#### Nhiệm vụ 1.3: Tìm Service Integration
```javascript
// Tìm trong codebase: triggerService.fire() có gọi trigger này không
// Dùng grep: triggerService.fire\(.*"TRIGGER_NAME"

KẾT QUẢ MONG ĐỢI:
## Các điểm tích hợp trong Service

### Vị trí 1: [Đường dẫn file]
**Dòng**: #XX
**Method**: methodName()
**Code xung quanh**:
```javascript
// 5 dòng trước
triggerService.fire('module', 'TRIGGER_NAME', context, performerId);
// 5 dòng sau
````

**Trạng thái**: ✅ Tìm thấy | ❌ KHÔNG TÌM THẤY (template không được dùng)

````

#### Nhiệm vụ 1.3b (bắt buộc): Tìm FE integration (ai là người bấm để phát event?)

Checklist bắt buộc:

- [ ] FE thunk nào gọi đúng endpoint?
- [ ] UI component nào gọi thunk? (Page/Dialog/Button)
- [ ] Tên action/label hiển thị trên UI là gì?
- [ ] Payload FE gửi có đúng field names không (VD: `NhanVienXuLyID`, `GhiChuDieuPhoi`, ...)?

KẾT QUẢ MONG ĐỢI:

### FE Thunk
- File: ...
- Function/thunk: ...
- Endpoint: ...
- Payload: ...

### UI/UX Source
- File: ...
- Component: ...
- Trigger: onClick/onSubmit nào gọi thunk?
- Label: ...

#### Nhiệm vụ 1.4: Kiểm tra Handler Logic
```javascript
// Tìm trong: services/triggerService.js
// Tìm: custom handler cho trigger này

KẾT QUẢ MONG ĐỢI:
## Phân tích Handler
**Handler Method**: _handleCongViecTransition() | _handleDefault()
**Vị trí**: triggerService.js Dòng #XX
**Trạng thái**: ✅ Custom Handler | ⚠️ Default Handler (có thể cần custom)
````

**DỪNG LẠI Ở ĐÂY**: Báo cáo kết quả Giai đoạn 1, chờ tôi xác nhận "Tiếp tục"

---

### GIAI ĐOẠN 2: KIỂM TRA CHI TIẾT (15 phút)

#### Nhiệm vụ 2.1: Kiểm tra Template

Kiểm tra template object:

```
## Báo cáo Kiểm tra Template

### Thông tin cơ bản:
- [✓/✗] Type đúng format: UPPERCASE_UNDERSCORE
- [✓/✗] Type unique (không trùng trong seed file)
- [✓/✗] Name: Tiếng Việt, rõ ràng
- [✓/✗] Description: Mô tả rõ use case
- [✓/✗] Category: Hợp lệ (task/kpi/ticket/system/other)
- [✓/✗] Icon: Hợp lệ (notification/check/warning/info/error/task/kpi/ticket/system)
- [✓/✗] Priority: Hợp lệ (normal/urgent)
- [✓/✗] isActive: true (đã bật)

### Template Strings:
- [✓/✗] titleTemplate: < 60 ký tự, có emoji
- [✓/✗] bodyTemplate: Chi tiết, rõ ràng
- [✓/✗] actionUrlTemplate: Format path hợp lệ

### Variables:
**Extract từ templates**:
- titleTemplate: [var1, var2]
- bodyTemplate: [var3, var4]
- actionUrlTemplate: [var5]
- **Tổng unique**: [liệt kê tất cả vars unique]

**Khai báo trong requiredVariables**: [liệt kê từ template]

**Vấn đề**:
- [ ] Thiếu trong requiredVariables: [vars có trong template nhưng không có trong array]
- [ ] Thừa trong requiredVariables: [vars có trong array nhưng không dùng]
- [ ] Phát hiện lỗi chính tả: [tên variable đáng ngờ]
```

#### Nhiệm vụ 2.2: Kiểm tra Trigger Config

Kiểm tra trigger config:

````
## Kiểm tra Trigger Config

### Cơ bản:
- [✓/✗] module: Hợp lệ (yeuCau/congViec/kpi/system)
- [✓/✗] trigger: Tên action rõ ràng
- [✓/✗] templateCode: Khớp với template.type
- [✓/✗] enabled: true

### Logic Recipients:
**Loại**: Theo Role | Custom | Cả hai

**Roles**: [liệt kê roles nếu có]

**Custom Function**:
```javascript
[Hiển thị code custom function nếu có]
````

**Vấn đề phát hiện**:

- [ ] ❌ KHÔNG loại trừ performerId
- [ ] ❌ KHÔNG loại bỏ duplicate IDs
- [ ] ❌ Không null-safe (thiếu toán tử ?.)
- [ ] ❌ Return objects thay vì IDs
- [ ] ❌ Trả về populated object thay vì ObjectId (cần normalize `_id`)
- [ ] ❌ Logic không rõ ràng/quá phức tạp
- [ ] ⚠️ Có thể return 0 recipients trong một số trường hợp

**Lưu ý WorkManagement (quan trọng)**:

- Recipients phần lớn là **NhanVienID**; gửi notification cần resolve sang **User.\_id**.
- Nếu `context.*` là populated object, phải xử lý cả 2 trường hợp: `id` là ObjectId hoặc `{ _id, ... }`.

```

#### Nhiệm vụ 2.3: Kiểm tra Service Integration

Kiểm tra integration code:
```

## Kiểm tra Service Integration

### Phân tích Context Object:

**Variables được truyền trong context**:

```javascript
{
  var1: ...,
  var2: ...,
  // ... liệt kê tất cả
}
```

**So sánh với requiredVariables**:

- [✓/✗] Tất cả required variables đều có
- **Thiếu variables**: [liệt kê]
- **Thừa variables**: [liệt kê] (OK, không phải vấn đề)

**Kiểm tra chất lượng Variables**:
Với mỗi required variable:

- `variableName`:
  - [✓/✗] Extract đúng (không phải raw ObjectId/Date)
  - [✓/✗] Có fallback value khi null
  - [✓/✗] Format phù hợp (date đã format, name đã extract, etc.)

**Vấn đề**:

- [ ] ❌ Context thiếu variable: [var]
- [ ] ❌ Variable chưa extract: [var] (đang pass raw object/ObjectId)
- [ ] ❌ Không có fallback cho null: [var]
- [ ] ❌ Date chưa format: [var]

### Phân tích Trigger Call:

- [✓/✗] Được gọi SAU KHI business logic hoàn tất
- [✓/✗] Module name khớp với config
- [✓/✗] Trigger name khớp với config
- [✓/✗] performerId được truyền đúng
- [✓/✗] Context có full object cho recipients (congViec/yeuCau/etc.)

```

#### Nhiệm vụ 2.4: Kiểm tra Handler

```

## Kiểm tra Handler

**Handler được dùng**: [tên method]

**Enrichment Variables**:

```javascript
// Hiển thị handler thêm/sửa gì
```

**Vấn đề**:

- [ ] ❌ Handler không enrich variables (pass raw context)
- [ ] ❌ Thiếu extraction: [variable] cần format
- [ ] ❌ Không có fallback values
- [ ] ⚠️ Handler không cần thiết (service đã cung cấp đủ)

````

**DỪNG LẠI Ở ĐÂY**: Báo cáo kết quả Giai đoạn 2, chờ tôi xác nhận "Tiếp tục sửa lỗi"

---

### GIAI ĐOẠN 3: TẠO CODE SỬA LỖI (20 phút)

Dựa vào các vấn đề tìm thấy ở Giai đoạn 2, tạo code fix:

#### Fix 3.1: Sửa Template (nếu cần)

```markdown
## Sửa Template

### File: `seeds/notificationTemplates.js`

### Vấn đề:
- [Liệt kê vấn đề từ validation]

### Sửa:
```javascript
// TRƯỚC:
{
  type: "...",
  requiredVariables: [...], // Thiếu X, Y
  titleTemplate: "...",
}

// SAU:
{
  type: "...",
  requiredVariables: ["X", "Y", "Z"], // ✅ Fixed: Đã thêm X, Y
  titleTemplate: "...",
}
````

### Tóm tắt thay đổi:

- Thêm variables: [X, Y]
- Xóa không dùng: [Z]
- Sửa lỗi chính tả: varName → varname

````

#### Fix 3.2: Sửa Trigger Config (nếu cần)

```markdown
## Sửa Trigger Config

### File: `config/notificationTriggers.js`

### Vấn đề:
- [Liệt kê vấn đề]

### Sửa:
```javascript
// TRƯỚC:
{
  module: "congViec",
  trigger: "PHAN_CONG",
  recipients: {
    custom: (context) => {
      // ❌ Không loại trừ performer
      return [context.congViec.NguoiChinhID];
    }
  }
}

// SAU:
{
  module: "congViec",
  trigger: "PHAN_CONG",
  recipients: {
    custom: (context) => {
      const { congViec, performerId } = context;
      const recipients = [];

      // ✅ Kiểm tra null và loại trừ performer
      if (congViec?.NguoiChinhID &&
          congViec.NguoiChinhID.toString() !== performerId?.toString()) {
        recipients.push(congViec.NguoiChinhID.toString());
      }

      // ✅ Loại bỏ duplicate
      return [...new Set(recipients)];
    }
  }
}
````

### Giải thích:

- Thêm loại trừ performerId
- Thêm null safety với ?.
- Thêm deduplication
- Convert IDs sang strings để so sánh

````

#### Fix 3.3: Sửa Service Integration (nếu cần)

```markdown
## Sửa Service Integration

### File: `[đường dẫn service file]`

### Vấn đề:
- [Liệt kê vấn đề]

### Sửa:
```javascript
// TRƯỚC: (Dòng #XX)
triggerService.fire('congViec', 'PHAN_CONG', {
  congViec,  // ✅ OK: Full object
  assignerName: performer.HoTen,  // ✅ OK
  taskName: congViec.TenCongViec,  // ✅ OK
  // ❌ Thiếu: taskCode, deadline
}, userId);

// SAU:
triggerService.fire('congViec', 'PHAN_CONG', {
  congViec,  // ✅ Full object cho recipients
  assignerName: performer?.HoTen || 'Người dùng',  // ✅ Fallback
  taskName: congViec?.TenCongViec || 'Công việc',  // ✅ Fallback
  taskCode: congViec?.MaCongViec || congViec?._id.toString().slice(-6).toUpperCase(),  // ✅ Đã thêm
  deadline: congViec?.NgayHetHan
    ? dayjs(congViec.NgayHetHan).format('DD/MM/YYYY')
    : null,  // ✅ Đã thêm + format
}, userId);
````

### Giải thích:

- Thêm variables thiếu: taskCode, deadline
- Thêm fallback values với toán tử ||
- Thêm null safety với toán tử ?.
- Format date với dayjs

````

#### Fix 3.4: Sửa Handler (nếu cần)

```markdown
## Sửa Handler

### File: `services/triggerService.js`

### Quyết định:
- [ ] Thêm custom handler (service chưa đủ variables)
- [ ] Sửa handler hiện có (handler chưa enrich đủ)
- [ ] Xóa handler (không cần, service đã đủ)

### Sửa:
```javascript
// Thêm/sửa trong _callHandler():
async _callHandler(config, context, performerId) {
  const handlerMap = {
    // ... existing
    'congViec.PHAN_CONG': this._handleCongViecAssignment.bind(this),  // ✅ Đã thêm
  };
  // ...
}

// Thêm handler method:
async _handleCongViecAssignment(config, context, performerId) {
  const { congViec, assignerName, taskName } = context;

  // ✅ Extract variables thiếu
  const enrichedContext = {
    ...context,
    taskCode: congViec?.MaCongViec || congViec?._id.toString().slice(-6).toUpperCase(),
    deadline: congViec?.NgayHetHan
      ? dayjs(congViec.NgayHetHan).format('DD/MM/YYYY')
      : 'Không có deadline',
    priority: congViec?.MucDoUuTien || 'normal',
  };

  return enrichedContext;
}
````

### Giải thích:

- Thêm handler cho trigger PHAN_CONG
- Extract taskCode, deadline, priority
- Có fallback values

````

---

### GIAI ĐOẠN 4: TẠO TEST CASES (15 phút)

#### Nhiệm vụ 4.1: Tạo Test Data cho Admin UI

```markdown
## Test Data cho Admin UI

### Template Type: `[TYPE]`

### Test Variables:
```json
{
  "variable1": "Giá trị mẫu 1",
  "variable2": "Giá trị mẫu 2",
  "variable3": "Giá trị mẫu 3"
}
````

### Preview mong đợi:

- **Title**: "Title được render mong đợi"
- **Body**: "Body được render với tất cả variables"
- **ActionUrl**: "/duong/dan/mong/doi/123"

### Các bước test:

1. Vào: Admin → Notification Templates
2. Tìm: [TYPE]
3. Click nút "Test"
4. Bật "Dry Run" mode
5. Nhập test data ở trên
6. Click "Preview"
7. Verify output khớp với preview mong đợi

````

#### Nhiệm vụ 4.2: Tạo Scenarios Test Integration

```markdown
## Scenarios Test Integration

### Scenario 1: Happy Path (Đường đi chính)
**Setup**:
- User A (performer): Tạo/cập nhật entity
- User B: Người được assign/người liên quan
- User C: Người tham gia

**Hành động**: [Hành động cụ thể trigger notification]

**Kỳ vọng**:
- Recipients: [User B, User C] (2 người, KHÔNG gửi cho A)
- Notification được tạo với đúng variables
- Socket.IO broadcast được gửi
- Bell icon tăng số

**Verify**:
```javascript
// MongoDB query
db.notifications.find({
  type: "[TYPE]",
  createdAt: { $gte: new Date(Date.now() - 60000) }
})

// Kỳ vọng count: 2
// Kỳ vọng userIds: [B_id, C_id]
````

### Scenario 2: Performer là Recipient

**Setup**:

- User A: Vừa là performer VỪA là assignee

**Kỳ vọng**:

- Recipients: [] (0 người)
- Không gửi notification cho User A
- Không crash/error

### Scenario 3: Variables Null

**Setup**:

- Entity có giá trị null cho một số fields

**Kỳ vọng**:

- Notification vẫn được gửi
- Dùng fallback values trong template
- Không crash/error

### Scenario 4: Nhiều Recipients

**Setup**:

- Task có 5 participants
- Performer là một trong số đó

**Kỳ vọng**:

- Recipients: 4 người (loại trừ performer)
- Không có duplicate notifications
- Tất cả nhận cùng content

````

---

### GIAI ĐOẠN 5: BÁO CÁO CUỐI CÙNG

```markdown
# 📊 BÁO CÁO KIỂM TRA: [TEMPLATE_TYPE]

## Tóm tắt
- **Trạng thái Template**: ✅ Hoạt động tốt | ⚠️ Cần sửa | ❌ Bị lỗi
- **Vấn đề tìm thấy**: [số lượng]
- **Sửa chữa áp dụng**: [số lượng]
- **Test Cases**: [số lượng]

## Tóm tắt Vấn đề

### Vấn đề Nghiêm trọng (❌):
1. [Mô tả vấn đề]
2. [Mô tả vấn đề]

### Cảnh báo (⚠️):
1. [Mô tả vấn đề]

### Cải thiện (💡):
1. [Đề xuất]

## Các Sửa chữa Đã áp dụng

### Sửa 1: [Tiêu đề]
- File: [đường dẫn]
- Thay đổi: [mô tả]
- Tác động: [mô tả]

### Sửa 2: [Tiêu đề]
...

## Files Đã sửa

1. ✏️ `seeds/notificationTemplates.js`
   - Dòng #XX: Cập nhật requiredVariables

2. ✏️ `config/notificationTriggers.js`
   - Dòng #XX: Sửa recipients logic

3. ✏️ `[service file]`
   - Dòng #XX: Thêm variables thiếu vào context

4. ✏️ `services/triggerService.js`
   - Thêm custom handler

## Lệnh Seed
```bash
cd d:\project\webBV\giaobanbv-be
node seeds/notificationTemplates.js
````

## Checklist Test Thủ công

- [ ] Test trong Admin UI (dry run)
- [ ] Test trigger trong app
- [ ] Verify recipients logic
- [ ] Kiểm tra MongoDB
- [ ] Test edge cases
- [ ] Verify Socket.IO broadcast

## Sẵn sàng để Test ✅

Tất cả fixes đã được tạo và validate. Vui lòng:

1. Review các thay đổi code
2. Áp dụng thay đổi vào files
3. Chạy lệnh seed
4. Làm theo test scenarios
5. Báo cáo kết quả

```

---

## QUY TẮC QUAN TRỌNG:

1. ✅ **Đọc files thật** - Không đoán, phải đọc code thật
2. ✅ **Tìm tất cả integration points** - Có thể có nhiều chỗ gọi trigger
3. ✅ **Kiểm tra null safety** - Mọi field access phải có ?.
4. ✅ **Validate recipients** - Luôn loại trừ performer, loại bỏ duplicate
5. ✅ **Format đúng** - Dates, names, codes phải được extracted
6. ✅ **Cung cấp context** - Show 5 dòng trước/sau mọi code change
7. ✅ **Tạo test cases** - Cả happy path lẫn edge cases
8. ✅ **Giải thích lý do** - Tại sao cần fix, tác động là gì

---

## ĐỊNH DẠNG OUTPUT:

Chia output thành 5 giai đoạn rõ ràng:
- Giai đoạn 1: Tìm kiếm → Hiển thị findings, CHỜ
- Giai đoạn 2: Kiểm tra → Hiển thị issues, CHỜ xác nhận "Tiếp tục sửa lỗi"
- Giai đoạn 3: Sửa lỗi → Hiển thị tất cả code changes
- Giai đoạn 4: Tests → Hiển thị test cases
- Giai đoạn 5: Báo cáo → Báo cáo tổng hợp

Sau mỗi giai đoạn quan trọng (1, 2), hỏi tôi trước khi tiếp tục.

---

Bây giờ hãy bắt đầu **GIAI ĐOẠN 1: TÌM KIẾM THÔNG TIN** cho template `[TYPE]`.
Đọc các files cần thiết và báo cáo findings.
```

---

## 📖 VÍ DỤ SỬ DỤNG

### Input đơn giản:

```markdown
**Template Type**: `TASK_ASSIGNED`
```

### Hoặc có thêm mô tả:

```markdown
**Template Type**: `TASK_ASSIGNED`
**Mô tả**: "Notification không gửi đúng người, và thiếu thông tin deadline"
```

---

## 🎯 KẾT QUẢ MONG ĐỢI

AI sẽ trả về báo cáo theo 5 giai đoạn:

### Giai đoạn 1: Tìm kiếm

```
✅ Template tìm thấy: TASK_ASSIGNED
✅ Trigger config tìm thấy: congViec.PHAN_CONG
✅ Integration: 2 locations trong congViec.service.js
✅ Handler: _handleCongViecTransition()

Tiếp tục Giai đoạn 2? (có/không)
```

### Giai đoạn 2: Kiểm tra

```
Tìm thấy 5 vấn đề:

❌ Nghiêm trọng:
1. Recipients logic KHÔNG loại trừ performer
2. Context thiếu variable: `deadline`
3. Variable `taskCode` chưa extract (đang pass ObjectId)

⚠️ Cảnh báo:
4. Không có fallback value cho `assignerName`
5. Date chưa format trong context

Tiếp tục Giai đoạn 3: Tạo Fix? (có/không)
```

### Giai đoạn 3-5: Fix, Tests, Report

```
[Hiển thị chi tiết code fix cho tất cả 5 issues]
[Hiển thị 4-5 test scenarios]
[Hiển thị báo cáo tổng hợp]
```

---

## 💡 MẸO SỬ DỤNG

1. **Càng chi tiết càng tốt**: Nếu biết vấn đề cụ thể, mô tả rõ
2. **Review Giai đoạn 1 kỹ**: Tìm đúng → Fix đúng
3. **Test theo thứ tự**: Admin UI → App → Database
4. **Backup trước khi fix**: Git commit hoặc copy files

---

## 📞 HỖ TRỢ

Nếu có vấn đề:

1. Kiểm tra lại Template Type đã đúng chưa
2. Đảm bảo đã chạy seed command
3. Check MongoDB có template chưa
4. Xem logs trong terminal

---

**Phiên bản**: 1.0  
**Cập nhật cuối**: 17/12/2024  
**Tác giả**: AI-Generated for Hospital Management System
