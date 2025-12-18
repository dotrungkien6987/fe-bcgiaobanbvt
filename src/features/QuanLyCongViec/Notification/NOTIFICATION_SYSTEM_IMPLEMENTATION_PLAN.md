# Notification System Implementation Plan

> **Phiên bản**: v1.0  
> **Ngày tạo**: 17/12/2024  
> **Trạng thái**: Phase 3 - Đang hoàn thiện  
> **Dành cho**: AI Agent tiếp tục implementation

---

## 📋 Tổng quan dự án

### Mục tiêu

Xây dựng hệ thống thông báo real-time cho Hospital Management System với các module:

- **YeuCau (Ticket)**: Quản lý yêu cầu công việc với state machine
- **CongViec (Task)**: Quản lý công việc với workflow
- **KPI**: Đánh giá KPI nhân viên

### Kiến trúc hệ thống

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION FLOW                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Business Logic (Service/Controller)                             │
│         │                                                        │
│         ▼                                                        │
│  triggerService.fire(MODULE, TRIGGER_NAME, context, performerId) │
│         │                                                        │
│         ▼                                                        │
│  notificationTriggers.js (Config: recipients, template mapping)  │
│         │                                                        │
│         ▼                                                        │
│  triggerService._handle*() (Custom handlers extract variables)   │
│         │                                                        │
│         ▼                                                        │
│  notificationService.createNotification()                        │
│         │                                                        │
│         ├──► MongoDB (notifications collection)                  │
│         └──► Socket.IO (real-time push)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure quan trọng

```
giaobanbv-be/
├── config/
│   └── notificationTriggers.js      # 38 trigger configs
├── services/
│   ├── triggerService.js            # Fire triggers, custom handlers
│   └── notificationService.js       # Create notifications, Socket.IO
├── models/
│   ├── NotificationTemplate.js      # Template schema
│   └── Notification.js              # Notification schema
├── modules/workmanagement/
│   ├── services/
│   │   ├── yeuCauStateMachine.js    # 15 state transitions + triggers
│   │   ├── yeuCau.service.js        # TAO_MOI, SUA, BINH_LUAN triggers
│   │   ├── congViec.service.js      # 6 field update triggers
│   │   └── file.service.js          # Upload/delete file triggers
│   └── controllers/
│       ├── kpi.controller.js        # capNhatDiemQL, phanHoi triggers
│       └── assignment.controller.js # tuDanhGia trigger
├── seeds/
│   ├── notificationTemplates.js     # 43 templates (SINGLE SOURCE OF TRUTH)
│   └── cleanupDeprecatedTemplates.js
└── docs/
    └── NOTIFICATION_SYSTEM_IMPLEMENTATION_PLAN.md (this file)
```

---

## ✅ Đã hoàn thành (Phase 3.1-3.6)

### 1. Template Database (43 templates)

- **File**: `seeds/notificationTemplates.js`
- **Categories**:
  - `ticket` (YeuCau): 15 templates
  - `task` (CongViec): 21 templates
  - `kpi`: 6 templates
  - `system`: 1 template

### 2. Trigger Configs (38 configs)

- **File**: `config/notificationTriggers.js`
- **Structure mỗi config**:

```javascript
{
  module: 'yeuCau' | 'congViec' | 'kpi',
  trigger: 'TRIGGER_NAME',
  templateCode: 'TEMPLATE_CODE',
  recipients: {
    roles: [...],        // hoặc function(context)
    custom: (context) => [...userIds]
  },
  enabled: true
}
```

### 3. Service Integration

| Module   | File                     | Triggers đã gọi            |
| -------- | ------------------------ | -------------------------- |
| YeuCau   | yeuCauStateMachine.js    | 15 state transitions       |
| YeuCau   | yeuCau.service.js        | TAO_MOI, SUA, BINH_LUAN    |
| CongViec | congViec.service.js      | 6 field updates            |
| CongViec | file.service.js          | UPLOAD_FILE, XOA_FILE      |
| KPI      | kpi.controller.js        | CAP_NHAT_DIEM_QL, PHAN_HOI |
| KPI      | assignment.controller.js | TU_DANH_GIA                |

---

## ⚠️ Vấn đề cần fix (Audit Results)

### Mức độ ưu tiên: 🔴 CAO | 🟡 TRUNG BÌNH | 🟢 THẤP

---

### 🔴 PHIÊN 1: Fix triggerService handlers (30-45 phút)

**Vấn đề**: Custom handlers chưa extract đủ variables cho templates.

#### Task 1.1: Fix `_handleCongViecTransition()`

**File**: `services/triggerService.js`

**Vấn đề hiện tại**: Handler không extract variables từ `congViec` object.

**Templates bị ảnh hưởng**:

- TASK_CREATED, TASK_ASSIGNED, TASK_STARTED, TASK_COMPLETED
- TASK_IN_PROGRESS, TASK_PAUSED, TASK_RESUMED, TASK_CANCELLED
- TASK_OVERDUE, TASK_REOPENED

**Variables cần thiết cho templates**:

```javascript
// Template example: "{{assignerName}} đã giao công việc [{{taskCode}}] {{taskName}} cho bạn"
// Cần extract: assignerName, taskName, taskCode, performerName
```

**Fix cần làm**:

```javascript
// Tìm method _handleCongViecTransition trong triggerService.js
// Thêm extract variables từ context.congViec:

async _handleCongViecTransition(config, context, performerId) {
  const { congViec, transition, previousStatus, newStatus } = context;

  // Cần populate hoặc extract:
  const performer = await User.findById(performerId).populate('NhanVienID');
  const assignerName = performer?.NhanVienID?.HoTen || performer?.HoTen || 'Hệ thống';

  const enrichedContext = {
    ...context,
    taskName: congViec.TenCongViec,
    taskCode: congViec.MaCongViec || congViec._id.toString().slice(-6).toUpperCase(),
    assignerName,
    performerName: assignerName, // người thực hiện action
    previousStatus,
    newStatus,
    deadline: congViec.NgayHetHan ? dayjs(congViec.NgayHetHan).format('DD/MM/YYYY') : null,
    priority: congViec.MucDoUuTien,
    progress: congViec.TienDo,
  };

  // Gọi notification service với enrichedContext
  await this._createNotificationsForConfig(config, enrichedContext, performerId);
}
```

---

#### Task 1.2: Fix `_handleKPIUpdate()`

**File**: `services/triggerService.js`

**Vấn đề**: Missing variables cho KPI templates.

**Templates bị ảnh hưởng**:

- KPI_MANAGER_SCORED, KPI_SELF_EVALUATED, KPI_FEEDBACK_RECEIVED
- KPI_APPROVED, KPI_APPROVAL_CANCELLED, KPI_CYCLE_STARTED

**Variables cần thiết**:

```javascript
// Template: "Quản lý đã chấm điểm KPI chu kỳ {{cycleName}} cho bạn"
// Cần: cycleName, evaluationId, employeeName, managerName, rating, feedback
```

**Fix cần làm**:

```javascript
async _handleKPIUpdate(config, context, performerId) {
  const { danhGiaKPI, chuKy, nhanVien } = context;

  const performer = await User.findById(performerId).populate('NhanVienID');
  const managerName = performer?.NhanVienID?.HoTen || performer?.HoTen;

  const enrichedContext = {
    ...context,
    cycleName: chuKy?.TenChuKy || 'Không xác định',
    evaluationId: danhGiaKPI?._id,
    employeeName: nhanVien?.HoTen,
    managerName,
    rating: danhGiaKPI?.TongDiemKPI,
    feedback: context.feedback || context.noiDung,
  };

  await this._createNotificationsForConfig(config, enrichedContext, performerId);
}
```

---

#### Task 1.3: Fix `_handleCongViecUpdate()` - Missing deadline

**File**: `services/triggerService.js`

**Templates bị ảnh hưởng**:

- TASK_PARTICIPANT_ADDED: "{{assignerName}} đã thêm bạn vào công việc {{taskName}}, deadline: {{deadline}}"
- TASK_ASSIGNEE_CHANGED: Cũng cần deadline

**Fix**: Thêm deadline vào enrichedContext tương tự Task 1.1

---

### 🔴 PHIÊN 2: Fix context trong services (20-30 phút)

#### Task 2.1: Fix YEUCAU_REMINDER context

**File**: `modules/workmanagement/services/yeuCau.service.js` hoặc nơi gọi NHAC_LAI trigger

**Vấn đề**: Template dùng `{{requesterName}}` nhưng code truyền `performerName`.

**Template hiện tại**:

```
"{{requesterName}} đã nhắc lại yêu cầu {{ticketCode}}: {{ticketTitle}}"
```

**Fix**: Đảm bảo context có `requesterName`:

```javascript
triggerService.fire(
  "yeuCau",
  "NHAC_LAI",
  {
    yeuCau,
    requesterName: yeuCau.NguoiTao?.HoTen || currentUser?.HoTen,
    ticketCode: yeuCau.MaYeuCau,
    ticketTitle: yeuCau.TieuDe,
  },
  performerId
);
```

---

#### Task 2.2: Review tất cả YeuCau triggers

**File chính**: `modules/workmanagement/services/yeuCauStateMachine.js`

**Checklist variables cho mỗi trigger**:

```javascript
// Standard context cho YeuCau:
{
  yeuCau,                    // Full object
  ticketCode,                // yeuCau.MaYeuCau
  ticketTitle,               // yeuCau.TieuDe
  requesterName,             // Người tạo yêu cầu
  assigneeName,              // Người được giao (nếu có)
  departmentName,            // Khoa/phòng
  performerName,             // Người thực hiện action
  reason,                    // Lý do (nếu có: từ chối, hủy...)
  scheduledTime,             // Thời gian hẹn (nếu có)
  rating,                    // Đánh giá (nếu có)
  comment,                   // Nội dung bình luận (nếu có)
}
```

---

### 🟡 PHIÊN 3: Implement missing triggers hoặc remove templates (15-30 phút)

#### Task 3.1: TASK_STATUS_CHANGED

**Quyết định**: Template này có thể không cần nếu đã có các template cụ thể (STARTED, COMPLETED, PAUSED...).

**Option A**: Xóa template TASK_STATUS_CHANGED

```bash
# Thêm vào cleanupDeprecatedTemplates.js
const DEPRECATED = ['TASK_STATUS_CHANGED'];
```

**Option B**: Implement như fallback khi không có template cụ thể

```javascript
// Trong congViec.service.js khi thay đổi trạng thái
if (!hasSpecificTemplate(newStatus)) {
  triggerService.fire("congViec", "THAY_DOI_TRANG_THAI", context, performerId);
}
```

---

#### Task 3.2: TASK_REJECTED

**Vấn đề**: Config có `enabled: false`, template tồn tại nhưng không dùng.

**Quyết định**:

- Nếu workflow có trạng thái "Từ chối" → Enable và implement
- Nếu không → Xóa template

**Check workflow**:

```javascript
// Xem trong TrangThaiCongViec enum có TU_CHOI không
// File: models hoặc constants của CongViec
```

---

#### Task 3.3: TASK_COMMENT_REPLY, TASK_COMMENT_DELETED

**Vấn đề**: Có config nhưng chưa thấy implement trong comment service.

**File cần check**: `modules/workmanagement/services/comment.service.js` hoặc tương tự

**Implement nếu cần**:

```javascript
// Khi reply comment
triggerService.fire('congViec', 'TRA_LOI_BINH_LUAN', {
  congViec,
  taskName: congViec.TenCongViec,
  comment: replyContent,
  parentCommentAuthor: parentComment.NguoiTao?.HoTen,
}, performerId);

// Khi xóa comment
triggerService.fire('congViec', 'XOA_BINH_LUAN', {...}, performerId);
```

---

### 🟢 PHIÊN 4: System features (20-30 phút)

#### Task 4.1: SYSTEM_ANNOUNCEMENT

**Mục đích**: Admin gửi thông báo broadcast cho tất cả users.

**Implement**:

1. **Tạo API endpoint**:

```javascript
// routes/notification.route.js
router.post(
  "/broadcast",
  authMiddleware,
  adminOnly,
  notificationController.broadcast
);
```

2. **Controller**:

```javascript
// controllers/notification.controller.js
exports.broadcast = catchAsync(async (req, res, next) => {
  const { title, message, targetRoles } = req.body;

  triggerService.fire(
    "system",
    "THONG_BAO_HE_THONG",
    {
      title,
      message,
      targetRoles, // ['admin', 'manager', 'user'] hoặc ['all']
    },
    req.user._id
  );

  return sendResponse(res, 200, true, null, null, "Đã gửi thông báo");
});
```

3. **Custom handler trong triggerService**:

```javascript
async _handleSystemBroadcast(config, context, performerId) {
  const { targetRoles, title, message } = context;

  let recipients;
  if (targetRoles.includes('all')) {
    recipients = await User.find({ isActive: true }).select('_id');
  } else {
    recipients = await User.find({
      PhanQuyen: { $in: targetRoles },
      isActive: true
    }).select('_id');
  }

  // Gửi notification cho từng recipient
  for (const recipient of recipients) {
    await notificationService.createNotification({
      userId: recipient._id,
      templateCode: 'SYSTEM_ANNOUNCEMENT',
      variables: { title, message },
      performerId,
    });
  }
}
```

---

### 🟢 PHIÊN 5: Testing (60+ phút)

#### 5.1 Restart Backend

```bash
cd d:\project\webBV\giaobanbv-be
npm run dev
```

#### 5.2 Test Plan - YeuCau Module

| #   | Trigger           | Action để test          | Expected notification              |
| --- | ----------------- | ----------------------- | ---------------------------------- |
| 1   | TAO_MOI           | Tạo yêu cầu mới         | Admin/Manager nhận thông báo       |
| 2   | TIEP_NHAN         | Accept yêu cầu          | Người tạo nhận thông báo           |
| 3   | TU_CHOI           | Reject yêu cầu          | Người tạo nhận thông báo với lý do |
| 4   | DIEU_PHOI         | Chuyển cho người khác   | Người được assign nhận TB          |
| 5   | HOAN_THANH        | Hoàn thành yêu cầu      | Người tạo nhận TB                  |
| 6   | DOI_THOI_GIAN_HEN | Đổi lịch hẹn            | Người liên quan nhận TB            |
| 7   | DANH_GIA          | Đánh giá sau hoàn thành | Người xử lý nhận TB                |
| 8   | BINH_LUAN         | Thêm comment            | Người liên quan nhận TB            |

#### 5.3 Test Plan - CongViec Module

| #   | Trigger             | Action để test           |
| --- | ------------------- | ------------------------ |
| 1   | THAY_DOI_DEADLINE   | Edit deadline của task   |
| 2   | THEM_NGUOI_THAM_GIA | Add participant vào task |
| 3   | DOI_NGUOI_CHINH     | Change main assignee     |
| 4   | CAP_NHAT_TIEN_DO    | Update progress %        |
| 5   | UPLOAD_FILE         | Upload file vào task     |

#### 5.4 Test Plan - KPI Module

| #   | Trigger          | Action để test       |
| --- | ---------------- | -------------------- |
| 1   | CAP_NHAT_DIEM_QL | Manager chấm điểm    |
| 2   | TU_DANH_GIA      | Employee tự đánh giá |
| 3   | PHAN_HOI         | Gửi feedback         |

#### 5.5 Verify Delivery

1. **Check Database**:

```javascript
// MongoDB query
db.notifications.find({ createdAt: { $gte: new Date(Date.now() - 3600000) } });
```

2. **Check API**:

```bash
curl http://localhost:8020/api/notifications -H "Authorization: Bearer TOKEN"
```

3. **Check Socket.IO**:

- Mở browser DevTools > Network > WS
- Xem event `notification:new`

4. **Check Frontend**:

- Bell icon có số đếm
- Click mở dropdown thấy notifications

---

## 📌 Quy tắc quan trọng

### 1. Naming Convention

- Trigger names: UPPERCASE với underscore (TIEP_NHAN, TAO_MOI)
- Template codes: YEUCAU*\*, TASK*_, KPI\__, SYSTEM\_\*
- Module names: lowercase (yeuCau, congViec, kpi, system)

### 2. triggerService.fire() Pattern

```javascript
// ALWAYS use this pattern
triggerService.fire(
  "moduleName", // 'yeuCau' | 'congViec' | 'kpi' | 'system'
  "TRIGGER_NAME", // Match config in notificationTriggers.js
  {
    // Context object - PHẢI có đủ variables cho template
    objectName, // yeuCau | congViec | danhGiaKPI
    ...extractedVariables, // ticketCode, taskName, etc.
  },
  performerId // ObjectId của user thực hiện action
);
```

### 3. Template Variables

- Sử dụng `{{variableName}}` trong template
- Variables được extract từ context trong handlers
- Luôn có fallback value để tránh undefined

### 4. Recipients

- `roles`: Array of role names hoặc function
- `custom`: Function trả về array of userIds
- Có thể combine cả hai

---

## 🔄 Quick Commands

```bash
# Seed templates
cd d:\project\webBV\giaobanbv-be
node seeds/notificationTemplates.js

# Cleanup deprecated
node seeds/cleanupDeprecatedTemplates.js

# Check templates in DB
# Trong MongoDB shell:
use giaoban_bvt
db.notificationtemplates.find().pretty()
db.notificationtemplates.countDocuments()

# Check notifications
db.notifications.find().sort({createdAt: -1}).limit(10)

# Restart server
npm run dev
```

---

## 📊 Current Statistics

| Metric                      | Count |
| --------------------------- | ----- |
| Templates trong DB          | 43    |
| Trigger configs             | 38    |
| triggerService.fire() calls | ~31   |
| Fully implemented           | ~27   |
| Need variable fix           | ~9    |
| Missing implementation      | ~7    |

---

## 🎯 Definition of Done

- [ ] Tất cả 43 templates có trigger tương ứng được gọi trong code
- [ ] Tất cả handlers extract đúng và đủ variables
- [ ] Không có lỗi khi thực hiện business actions
- [ ] Notifications được tạo và lưu vào DB
- [ ] Socket.IO push real-time hoạt động
- [ ] Frontend hiển thị đúng notifications

---

## 📝 Notes cho AI Agent

1. **Đọc file trước khi edit**: Luôn đọc file để hiểu context hiện tại
2. **Tìm patterns tương tự**: Dùng grep_search để tìm cách implement tương tự
3. **Test sau mỗi thay đổi**: Restart server và test trigger
4. **Không tạo file mới nếu không cần**: Chỉ edit files hiện có
5. **User vs NhanVien**: Luôn dùng `user.NhanVienID` để lấy info nhân viên

---

_Document này được tạo để AI agent có thể tiếp tục implementation ở các phiên khác._
