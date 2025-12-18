# 🚀 NOTIFICATION SYSTEM REFACTOR - IMPLEMENTATION PLAN

**Date:** 2025-12-18  
**Status:** Ready to Implement  
**Timeline:** 5-6 ngày  
**Approach:** Admin-Configurable Notification System

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
// ✅ Developer chỉ truyền data đơn giản
await notificationService.send({
  type: 'yeucau-tao-moi',
  data: {
    _id: yeuCau._id,
    NguoiGuiYeuCauID: yeuCau.NguoiYeuCauID,
    arrNguoiDieuPhoiID: [...],
    MaYeuCau: yeuCau.MaYeuCau,
    TieuDeYeuCau: yeuCau.TieuDe,
    KhoaGui: yeuCau.KhoaNguonID
  }
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

    // Template content (Handlebars syntax)
    titleTemplate: {
      type: String,
      required: true,
    }, // '{{MaYeuCau}} - Yêu cầu từ {{KhoaGui.TenKhoa}}'

    bodyTemplate: {
      type: String,
      required: true,
    }, // 'Khoa {{KhoaGui.TenKhoa}} yêu cầu: {{TieuDeYeuCau}}'

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
const Handlebars = require("handlebars");
const mongoose = require("mongoose");
const NotificationType = require("../models/NotificationType");
const NotificationTemplate = require("../models/NotificationTemplate");
const Notification = require("../models/Notification");
const User = require("../../../models/User");
const notificationHelper = require("../../../helpers/notificationHelper");

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
   * Render template with Handlebars
   */
  renderTemplate(templateString, data) {
    try {
      const template = Handlebars.compile(templateString);
      return template(data);
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
    // Check user settings
    const user = await User.findById(userId)
      .select("notificationSettings")
      .lean();
    if (!user) {
      console.warn(`User ${userId} not found`);
      return;
    }

    if (user.notificationSettings?.disabled) {
      console.log(`User ${userId} has notifications disabled`);
      return;
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

    // Emit socket event
    try {
      const io = require("../../../socket").getIO();
      io.to(`user:${userId}`).emit("notification", {
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
      {
        name: "NguoiGuiYeuCauID",
        type: "ObjectId",
        ref: "NhanVien",
        description: "Người gửi yêu cầu",
        isRecipientCandidate: true,
      },
      {
        name: "arrNguoiDieuPhoiID",
        type: "Array",
        itemType: "ObjectId",
        ref: "NhanVien",
        description: "Danh sách điều phối viên",
        isRecipientCandidate: true,
      },
      {
        name: "MaYeuCau",
        type: "String",
        description: "Mã yêu cầu",
      },
      {
        name: "TieuDeYeuCau",
        type: "String",
        description: "Tiêu đề yêu cầu",
      },
      {
        name: "KhoaGui",
        type: "Object",
        description: "Khoa gửi yêu cầu",
      },
    ],
    isActive: true,
  },
  // ... 45 more types
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
    _id: yeuCau._id,
    NguoiGuiYeuCauID: yeuCau.NguoiYeuCauID,
    arrNguoiDieuPhoiID: arrNguoiDieuPhoiID,
    MaYeuCau: yeuCau.MaYeuCau,
    TieuDeYeuCau: yeuCau.TieuDe,
    KhoaGui: yeuCau.KhoaNguonID,
    KhoaNhan: yeuCau.KhoaDichID,
    ThoiGianTao: yeuCau.createdAt,
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
   - Convert sang UserID qua helper
   - Notification gửi cho UserID

2. **Populate Data:**

   - Luôn populate trước khi pass vào send()
   - Template có thể access nested fields (KhoaGui.TenKhoa)

3. **Error Handling:**

   - Notification fail KHÔNG ảnh hưởng business logic
   - Wrap trong try-catch
   - Log error nhưng không throw

4. **Cache Invalidation:**

   - Admin update template → Clear cache
   - TTL 5 phút backup
   - Manual clear cache button

5. **Testing:**
   - Test từng action sau khi migrate
   - Verify DB có notification documents
   - Check socket events

---

## 🔗 REFERENCES

- REFACTOR_CONTEXT_SUMMARY.md - Chi tiết ngữ cảnh và brainstorming
- SCHEMA_QUICK_REFERENCE.md - Schema models reference
- QUICK_AUDIT_CHECKLIST.md - Audit checklist cho old system

---

**Status:** Ready to implement  
**Next Step:** Bắt đầu Day 1 - Create models & service  
**Contact:** Continue với implementation questions

---

**Last Updated:** 2025-12-18
