# 🔔 Notification System - Architecture & Design

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Database Schemas](#database-schemas)
4. [API Specification](#api-specification)
5. [Socket.IO Events](#socketio-events)
6. [Service Design](#service-design)
7. [Integration Guide](#integration-guide)

---

## 📌 OVERVIEW

### What is this system?

Hệ thống thông báo **độc lập** cho Hospital Management System với:

- **In-app notifications**: Realtime qua Socket.IO khi user online
- **Push notifications**: Qua Firebase Cloud Messaging khi user offline
- **Flexible templates**: Admin cấu hình nội dung từ Database
- **User preferences**: User tùy chỉnh nhận thông báo theo ý muốn

### Key Features

| Feature       | Description                                  |
| ------------- | -------------------------------------------- |
| Realtime      | Socket.IO đẩy thông báo ngay khi user online |
| Push          | FCM gửi đến điện thoại khi offline           |
| Templates     | Nội dung thông báo cấu hình từ DB            |
| User Settings | Tắt/bật theo loại, giờ yên tĩnh              |
| Auto Cleanup  | Tự xóa sau 30 ngày                           |
| Priority      | 2 mức: normal, urgent                        |

### Prerequisites

- ✅ PWA đã setup (Phase 1)
- ✅ Service Worker hoạt động
- ✅ HTTPS trong production
- ✅ MongoDB database

---

## 🏗️ SYSTEM ARCHITECTURE

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │ Notification │  │ useSocket() │  │    Redux Store          │  │
│  │ Bell + Badge │  │    Hook     │  │  notificationSlice.js   │  │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘  │
│         │                │                      │                │
│         └────────────────┼──────────────────────┘                │
│                          │                                       │
│  ┌───────────────────────▼───────────────────────────────────┐  │
│  │                Service Worker (PWA)                        │  │
│  │  - Receive push notifications (FCM)                        │  │
│  │  - Show system notifications                               │  │
│  │  - Handle notification click                               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Socket.IO + REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND (Node.js)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                  NotificationService                     │    │
│  │  - send(type, recipientId, data)                        │    │
│  │  - Render template                                       │    │
│  │  - Check user settings                                   │    │
│  │  - Route to Socket.IO or FCM                            │    │
│  └─────────────────────────────────────────────────────────┘    │
│         │                                     │                  │
│         ▼                                     ▼                  │
│  ┌─────────────┐                      ┌─────────────┐           │
│  │SocketService│                      │  FCMService │           │
│  │ (realtime)  │                      │   (push)    │           │
│  └─────────────┘                      └─────────────┘           │
│         │                                     │                  │
└─────────┼─────────────────────────────────────┼──────────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────┐                    ┌─────────────────┐
│   User Online   │                    │  User Offline   │
│   (Browser)     │                    │  (Phone/PWA)    │
└─────────────────┘                    └─────────────────┘
```

### Notification Flow

```
1. Feature triggers notification
   │
   ▼
2. NotificationService.send({type, recipientId, data})
   │
   ├─► 3a. Find template from DB
   │       └─► Render message with data
   │
   ├─► 3b. Check UserNotificationSettings
   │       └─► User có bật loại này không?
   │       └─► Đang trong giờ yên tĩnh không?
   │
   ├─► 3c. Save to Notification collection (for history)
   │
   └─► 3d. Deliver
           │
           ├─► User online? → SocketService.emit()
           │                   └─► Realtime to browser
           │
           └─► User offline? → FCMService.send()
                               └─► Push to device
```

### Socket.IO Connection Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User logs in → Frontend gets JWT token                   │
│                                                             │
│ 2. Frontend connects Socket.IO with token:                  │
│    socket = io(SERVER_URL, {                                │
│      auth: { token: accessToken }                           │
│    })                                                       │
│                                                             │
│ 3. Backend middleware verifies JWT:                         │
│    - Valid → socket.userId = decoded._id                    │
│    - Invalid → socket.disconnect()                          │
│                                                             │
│ 4. Backend tracks online users:                             │
│    onlineUsers.set(userId, socketId)                        │
│                                                             │
│ 5. When notification sent:                                  │
│    - Check onlineUsers.has(recipientId)                     │
│    - If yes → io.to(socketId).emit('notification', data)    │
│    - If no → FCMService.send(recipientId, data)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 💾 DATABASE SCHEMAS

### 1. Notification (Thông báo)

**File:** `giaobanbv-be/models/Notification.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = new Schema(
  {
    // Người nhận (User._id, KHÔNG PHẢI NhanVien._id)
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Loại thông báo (match với NotificationTemplate.type)
    type: {
      type: String,
      required: true,
      index: true,
    },

    // Nội dung đã render
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },

    // Icon để hiển thị (task, comment, warning, kpi, ticket, system)
    icon: {
      type: String,
      default: "notification",
    },

    // Độ ưu tiên
    priority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },

    // Trạng thái đọc
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
    },

    // Link khi click vào notification
    actionUrl: {
      type: String,
    },

    // Data gốc (để debug hoặc re-render)
    metadata: {
      type: Schema.Types.Mixed,
    },

    // Kênh đã gửi
    deliveredVia: {
      type: [String],
      enum: ["inapp", "push"],
      default: ["inapp"],
    },

    // Auto delete sau 30 ngày
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      index: { expireAfterSeconds: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for common queries
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
```

#### 📊 Notification Model - Schema Reference

| Field          | Type                 | Required | Default          |  Index   | Description                                                                              |
| -------------- | -------------------- | :------: | ---------------- | :------: | ---------------------------------------------------------------------------------------- |
| `recipientId`  | ObjectId (ref: User) |    ✅    | -                |    ✅    | **User.\_id** của người nhận (⚠️ KHÔNG phải NhanVien.\_id)                               |
| `type`         | String               |    ✅    | -                |    ✅    | Loại thông báo, phải match với `NotificationTemplate.type`                               |
| `title`        | String               |    ✅    | -                |    -     | Tiêu đề đã được render từ template                                                       |
| `body`         | String               |    ✅    | -                |    -     | Nội dung đã được render từ template                                                      |
| `icon`         | String               |    -     | `"notification"` |    -     | Icon hiển thị: `task`, `comment`, `warning`, `check`, `clock`, `kpi`, `ticket`, `system` |
| `priority`     | String (enum)        |    -     | `"normal"`       |    -     | Độ ưu tiên: `normal` hoặc `urgent`                                                       |
| `isRead`       | Boolean              |    -     | `false`          |    ✅    | Trạng thái đã đọc hay chưa                                                               |
| `readAt`       | Date                 |    -     | -                |    -     | Thời điểm user đọc thông báo                                                             |
| `actionUrl`    | String               |    -     | -                |    -     | URL điều hướng khi click vào notification                                                |
| `metadata`     | Mixed                |    -     | -                |    -     | Data gốc dùng để render (để debug hoặc re-render)                                        |
| `deliveredVia` | [String] (enum)      |    -     | `["inapp"]`      |    -     | Kênh đã gửi: `inapp`, `push`                                                             |
| `expiresAt`    | Date                 |    -     | now + 30 days    | ✅ (TTL) | Auto delete sau 30 ngày                                                                  |
| `createdAt`    | Date                 |    -     | auto             |    -     | Thời điểm tạo (từ timestamps)                                                            |
| `updatedAt`    | Date                 |    -     | auto             |    -     | Thời điểm cập nhật (từ timestamps)                                                       |

**Indexes:**

- `{ recipientId: 1, isRead: 1, createdAt: -1 }` - Query notifications theo user và trạng thái đọc
- `{ recipientId: 1, createdAt: -1 }` - Query tất cả notifications của user
- `{ expiresAt: 1 }` - TTL index để auto-delete

---

### 2. NotificationTemplate (Mẫu thông báo)

**File:** `giaobanbv-be/models/NotificationTemplate.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationTemplateSchema = new Schema(
  {
    // Unique type identifier
    type: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // Display name for admin
    name: {
      type: String,
      required: true,
    },

    // Description for admin
    description: {
      type: String,
    },

    // Category for grouping in Admin UI
    category: {
      type: String,
      enum: ["task", "kpi", "ticket", "system", "other"],
      default: "other",
    },

    // Auto-created flag (cần Admin config)
    isAutoCreated: {
      type: Boolean,
      default: false,
    },

    // Usage statistics
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },

    // Audit fields
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // Template với placeholders {{variableName}}
    titleTemplate: {
      type: String,
      required: true,
    },
    bodyTemplate: {
      type: String,
      required: true,
    },

    // Icon name (for frontend)
    icon: {
      type: String,
      default: "notification",
    },

    // Default channels
    defaultChannels: {
      type: [String],
      enum: ["inapp", "push"],
      default: ["inapp", "push"],
    },

    // Default priority
    defaultPriority: {
      type: String,
      enum: ["normal", "urgent"],
      default: "normal",
    },

    // Action URL template
    actionUrlTemplate: {
      type: String,
    },

    // Is this template active?
    isActive: {
      type: Boolean,
      default: true,
    },

    // Required variables for this template
    requiredVariables: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);
```

#### 📊 NotificationTemplate Model - Schema Reference

| Field               | Type          | Required | Default             | Unique | Description                                           |
| ------------------- | ------------- | :------: | ------------------- | :----: | ----------------------------------------------------- |
| `type`              | String        |    ✅    | -                   |   ✅   | Unique identifier, UPPERCASE (e.g., `TASK_ASSIGNED`)  |
| `name`              | String        |    ✅    | -                   |   -    | Tên hiển thị cho admin (e.g., "Được giao việc mới")   |
| `description`       | String        |    -     | -                   |   -    | Mô tả chi tiết cho admin                              |
| `category`          | String (enum) |    -     | `"other"`           |   -    | Phân loại: `task`, `kpi`, `ticket`, `system`, `other` |
| `isAutoCreated`     | Boolean       |    -     | `false`             |   -    | ⚠️ Flag đánh dấu template tự tạo, cần Admin config    |
| `usageCount`        | Number        |    -     | `0`                 |   -    | Số lần template được sử dụng                          |
| `lastUsedAt`        | Date          |    -     | -                   |   -    | Thời điểm sử dụng gần nhất                            |
| `createdBy`         | ObjectId      |    -     | -                   |   -    | User tạo template (audit)                             |
| `updatedBy`         | ObjectId      |    -     | -                   |   -    | User cập nhật cuối (audit)                            |
| `titleTemplate`     | String        |    ✅    | -                   |   -    | Template tiêu đề với `{{placeholder}}` syntax         |
| `bodyTemplate`      | String        |    ✅    | -                   |   -    | Template nội dung với `{{placeholder}}` syntax        |
| `icon`              | String        |    -     | `"notification"`    |   -    | Icon name cho frontend                                |
| `defaultChannels`   | [String]      |    -     | `["inapp", "push"]` |   -    | Kênh gửi mặc định                                     |
| `defaultPriority`   | String (enum) |    -     | `"normal"`          |   -    | Độ ưu tiên mặc định                                   |
| `actionUrlTemplate` | String        |    -     | -                   |   -    | Template URL với `{{placeholder}}`                    |
| `isActive`          | Boolean       |    -     | `true`              |   -    | Template có đang active không                         |
| `requiredVariables` | [String]      |    -     | `[]`                |   -    | Danh sách biến bắt buộc khi gọi send()                |

**Template Placeholder Syntax:**

```
{{variableName}} → Được thay thế bằng data[variableName]
```

**Ví dụ:**

```javascript
// Template
titleTemplate: "Công việc mới"
bodyTemplate: "{{assignerName}} đã giao cho bạn: {{taskName}}"
actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}"

// Data truyền vào
data: {
  assignerName: "Nguyễn Văn A",
  taskName: "Hoàn thành báo cáo",
  taskId: "abc123"
}

// Kết quả render
title: "Công việc mới"
body: "Nguyễn Văn A đã giao cho bạn: Hoàn thành báo cáo"
actionUrl: "/quan-ly-cong-viec/chi-tiet/abc123"
```

---

**Seed Data cho NotificationTemplate:**

```javascript
// File: giaobanbv-be/seeds/notificationTemplates.js

const templates = [
  // ===== TASK NOTIFICATIONS =====
  {
    type: "TASK_ASSIGNED",
    name: "Được giao việc mới",
    description: "Khi user được giao một công việc",
    titleTemplate: "Công việc mới",
    bodyTemplate: "{{assignerName}} đã giao cho bạn: {{taskName}}",
    icon: "task",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}",
    requiredVariables: ["assignerName", "taskName", "taskId"],
  },
  {
    type: "TASK_STATUS_CHANGED",
    name: "Trạng thái công việc thay đổi",
    description: "Khi công việc được cập nhật trạng thái",
    titleTemplate: "Cập nhật công việc",
    bodyTemplate: "{{taskName}} đã chuyển sang: {{newStatus}}",
    icon: "task",
    defaultChannels: ["inapp"],
    defaultPriority: "normal",
    actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}",
    requiredVariables: ["taskName", "newStatus", "taskId"],
  },
  {
    type: "TASK_APPROVED",
    name: "Công việc được duyệt",
    description: "Khi trưởng khoa duyệt hoàn thành công việc",
    titleTemplate: "Đã duyệt hoàn thành ✓",
    bodyTemplate: "{{approverName}} đã duyệt: {{taskName}}",
    icon: "check",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}",
    requiredVariables: ["approverName", "taskName", "taskId"],
  },
  {
    type: "TASK_REJECTED",
    name: "Công việc bị từ chối",
    description: "Khi công việc bị từ chối duyệt",
    titleTemplate: "Công việc bị từ chối",
    bodyTemplate:
      "{{rejecterName}} đã từ chối: {{taskName}}. Lý do: {{reason}}",
    icon: "warning",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "urgent",
    actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}",
    requiredVariables: ["rejecterName", "taskName", "taskId", "reason"],
  },

  // ===== COMMENT NOTIFICATIONS =====
  {
    type: "COMMENT_ADDED",
    name: "Bình luận mới",
    description: "Khi có người bình luận vào công việc",
    titleTemplate: "Bình luận mới",
    bodyTemplate: '{{commenterName}}: "{{commentPreview}}"',
    icon: "comment",
    defaultChannels: ["inapp"],
    defaultPriority: "normal",
    actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}",
    requiredVariables: ["commenterName", "commentPreview", "taskId"],
  },

  // ===== DEADLINE NOTIFICATIONS =====
  {
    type: "DEADLINE_APPROACHING",
    name: "Deadline sắp đến",
    description: "Nhắc nhở công việc sắp đến hạn",
    titleTemplate: "⏰ Deadline sắp đến",
    bodyTemplate: "{{taskName}} còn {{daysLeft}} ngày để hoàn thành",
    icon: "clock",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "urgent",
    actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}",
    requiredVariables: ["taskName", "daysLeft", "taskId"],
  },
  {
    type: "DEADLINE_OVERDUE",
    name: "Quá hạn",
    description: "Công việc đã quá hạn",
    titleTemplate: "⚠️ Công việc quá hạn!",
    bodyTemplate: "{{taskName}} đã quá hạn {{daysOverdue}} ngày",
    icon: "warning",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "urgent",
    actionUrlTemplate: "/quan-ly-cong-viec/chi-tiet/{{taskId}}",
    requiredVariables: ["taskName", "daysOverdue", "taskId"],
  },

  // ===== KPI NOTIFICATIONS =====
  {
    type: "KPI_CYCLE_STARTED",
    name: "Chu kỳ đánh giá bắt đầu",
    description: "Khi chu kỳ đánh giá KPI mới bắt đầu",
    titleTemplate: "Chu kỳ đánh giá mới",
    bodyTemplate:
      "Chu kỳ {{cycleName}} đã bắt đầu. Hạn tự đánh giá: {{deadline}}",
    icon: "kpi",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "/kpi/tu-danh-gia",
    requiredVariables: ["cycleName", "deadline"],
  },
  {
    type: "KPI_EVALUATED",
    name: "Đã có kết quả KPI",
    description: "Khi có kết quả đánh giá KPI",
    titleTemplate: "Kết quả đánh giá KPI",
    bodyTemplate: "Chu kỳ {{cycleName}}: Xếp loại {{rating}}",
    icon: "kpi",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "/kpi/ket-qua/{{evaluationId}}",
    requiredVariables: ["cycleName", "rating", "evaluationId"],
  },

  // ===== TICKET NOTIFICATIONS =====
  {
    type: "TICKET_CREATED",
    name: "Yêu cầu hỗ trợ mới",
    description: "Khi có yêu cầu hỗ trợ mới gửi đến",
    titleTemplate: "Yêu cầu hỗ trợ mới",
    bodyTemplate: "{{requesterName}} gửi yêu cầu: {{ticketTitle}}",
    icon: "ticket",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "/ticket/{{ticketId}}",
    requiredVariables: ["requesterName", "ticketTitle", "ticketId"],
  },
  {
    type: "TICKET_RESOLVED",
    name: "Yêu cầu đã xử lý",
    description: "Khi yêu cầu hỗ trợ được xử lý xong",
    titleTemplate: "Yêu cầu đã xử lý ✓",
    bodyTemplate: "{{resolverName}} đã xử lý: {{ticketTitle}}",
    icon: "check",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "/ticket/{{ticketId}}",
    requiredVariables: ["resolverName", "ticketTitle", "ticketId"],
  },

  // ===== SYSTEM NOTIFICATIONS =====
  {
    type: "SYSTEM_ANNOUNCEMENT",
    name: "Thông báo hệ thống",
    description: "Thông báo chung từ admin",
    titleTemplate: "{{title}}",
    bodyTemplate: "{{message}}",
    icon: "system",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "",
    requiredVariables: ["title", "message"],
  },
];

module.exports = templates;
```

### 3. UserNotificationSettings (Cài đặt user)

**File:** `giaobanbv-be/models/UserNotificationSettings.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const typePreferenceSchema = new Schema(
  {
    inapp: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
  },
  { _id: false }
);

const userNotificationSettingsSchema = new Schema(
  {
    // User reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // Global settings
    enableNotifications: {
      type: Boolean,
      default: true,
    },

    enablePush: {
      type: Boolean,
      default: true,
    },

    // Quiet hours (không gửi push trong khoảng này)
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" }, // HH:mm format
      end: { type: String, default: "07:00" },
    },

    // Per-type preferences (dynamic based on NotificationTemplate.type)
    // Example: { "TASK_ASSIGNED": { inapp: true, push: true }, ... }
    typePreferences: {
      type: Map,
      of: typePreferenceSchema,
      default: new Map(),
    },

    // FCM tokens for push notifications (multiple devices)
    fcmTokens: [
      {
        token: String,
        deviceName: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Method to check if should send notification
userNotificationSettingsSchema.methods.shouldSend = function (type, channel) {
  // Global check
  if (!this.enableNotifications) return false;
  if (channel === "push" && !this.enablePush) return false;

  // Quiet hours check (only for push)
  if (channel === "push" && this.quietHours.enabled) {
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const { start, end } = this.quietHours;

    // Handle overnight quiet hours (e.g., 22:00 - 07:00)
    if (start > end) {
      if (currentTime >= start || currentTime < end) return false;
    } else {
      if (currentTime >= start && currentTime < end) return false;
    }
  }

  // Type-specific check
  const typePref = this.typePreferences.get(type);
  if (typePref) {
    return typePref[channel] !== false;
  }

  // Default: allow
  return true;
};

module.exports = mongoose.model(
  "UserNotificationSettings",
  userNotificationSettingsSchema
);
```

#### 📊 UserNotificationSettings Model - Schema Reference

| Field                 | Type                 | Required | Default   | Unique | Description                                           |
| --------------------- | -------------------- | :------: | --------- | :----: | ----------------------------------------------------- |
| `userId`              | ObjectId (ref: User) |    ✅    | -         |   ✅   | User.\_id - mỗi user chỉ có 1 settings                |
| `enableNotifications` | Boolean              |    -     | `true`    |   -    | Master switch - tắt = không nhận bất kỳ thông báo nào |
| `enablePush`          | Boolean              |    -     | `true`    |   -    | Tắt/bật push notification (FCM)                       |
| `quietHours.enabled`  | Boolean              |    -     | `false`   |   -    | Bật chế độ giờ yên tĩnh                               |
| `quietHours.start`    | String               |    -     | `"22:00"` |   -    | Giờ bắt đầu (HH:mm format)                            |
| `quietHours.end`      | String               |    -     | `"07:00"` |   -    | Giờ kết thúc                                          |
| `typePreferences`     | Map                  |    -     | `{}`      |   -    | Cài đặt theo từng loại notification                   |
| `fcmTokens`           | Array                |    -     | `[]`      |   -    | Danh sách FCM tokens (multi-device)                   |

**typePreferences Structure:**

```javascript
{
  "TASK_ASSIGNED": { inapp: true, push: true },
  "COMMENT_ADDED": { inapp: true, push: false }, // Tắt push cho comments
  "DEADLINE_APPROACHING": { inapp: true, push: true }
}
```

**fcmTokens Structure:**

```javascript
[
  { token: "fcm_token_1...", deviceName: "iPhone 14", createdAt: "2025-01-15" },
  {
    token: "fcm_token_2...",
    deviceName: "Windows PC",
    createdAt: "2025-01-20",
  },
];
```

**shouldSend() Method Logic:**

```
┌─────────────────────────────────────────────────────────────┐
│                    shouldSend(type, channel)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. enableNotifications === false?                           │
│     └─► return FALSE (master switch off)                    │
│                                                              │
│  2. channel === "push" && enablePush === false?             │
│     └─► return FALSE (push disabled)                        │
│                                                              │
│  3. channel === "push" && quietHours.enabled?               │
│     └─► Check current time in quiet range?                  │
│         └─► YES: return FALSE (quiet hours)                 │
│                                                              │
│  4. typePreferences[type][channel] === false?               │
│     └─► return FALSE (type disabled for channel)            │
│                                                              │
│  5. Else: return TRUE (allow notification)                   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

### 📊 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION SYSTEM ERD                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌───────────────┐         ┌────────────────────────┐                       │
│  │     User      │         │  NotificationTemplate  │                       │
│  ├───────────────┤         ├────────────────────────┤                       │
│  │ _id (PK)      │         │ _id (PK)               │                       │
│  │ UserName      │         │ type (UNIQUE)          │◄────────┐             │
│  │ NhanVienID    │         │ titleTemplate          │         │             │
│  │ KhoaID        │         │ bodyTemplate           │         │             │
│  │ ...           │         │ icon                   │         │             │
│  └───────┬───────┘         │ defaultPriority        │         │             │
│          │                 │ requiredVariables[]    │         │ type        │
│          │ 1               └────────────────────────┘         │ matches     │
│          │                                                     │             │
│          │                 ┌────────────────────────┐         │             │
│          │                 │     Notification       │─────────┘             │
│          │ N               ├────────────────────────┤                       │
│          ├────────────────►│ _id (PK)               │                       │
│          │  recipientId    │ recipientId (FK→User)  │                       │
│          │                 │ type                   │                       │
│          │                 │ title (rendered)       │                       │
│          │                 │ body (rendered)        │                       │
│          │                 │ isRead                 │                       │
│          │                 │ actionUrl              │                       │
│          │                 │ expiresAt (TTL 30d)    │                       │
│          │                 └────────────────────────┘                       │
│          │                                                                   │
│          │ 1               ┌────────────────────────────────┐               │
│          │                 │   UserNotificationSettings     │               │
│          └────────────────►├────────────────────────────────┤               │
│              userId        │ _id (PK)                       │               │
│              (1:1)         │ userId (FK→User, UNIQUE)       │               │
│                            │ enableNotifications            │               │
│                            │ enablePush                     │               │
│                            │ quietHours { start, end }      │               │
│                            │ typePreferences (Map)          │               │
│                            │ fcmTokens[]                    │               │
│                            └────────────────────────────────┘               │
│                                                                              │
│  Relationships:                                                              │
│  • User ──(1:N)──► Notification (một user có nhiều notifications)           │
│  • User ──(1:1)──► UserNotificationSettings (mỗi user 1 settings)           │
│  • NotificationTemplate ──(1:N)──► Notification (template tạo nhiều notif)  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 📊 Notification Types Reference

| Type                   |    Icon    |  Priority  |  Channels   | Required Variables                             | Mô tả                         |
| ---------------------- | :--------: | :--------: | :---------: | ---------------------------------------------- | ----------------------------- |
| `TASK_ASSIGNED`        |  📋 task   |   normal   | inapp, push | `assignerName`, `taskName`, `taskId`           | Được giao việc mới            |
| `TASK_STATUS_CHANGED`  |  📋 task   |   normal   |    inapp    | `taskName`, `newStatus`, `taskId`              | Trạng thái công việc thay đổi |
| `TASK_APPROVED`        |  ✅ check  |   normal   | inapp, push | `approverName`, `taskName`, `taskId`           | Công việc được duyệt          |
| `TASK_REJECTED`        | ⚠️ warning | **urgent** | inapp, push | `rejecterName`, `taskName`, `taskId`, `reason` | Công việc bị từ chối          |
| `COMMENT_ADDED`        | 💬 comment |   normal   |    inapp    | `commenterName`, `commentPreview`, `taskId`    | Có bình luận mới              |
| `DEADLINE_APPROACHING` |  ⏰ clock  | **urgent** | inapp, push | `taskName`, `daysLeft`, `taskId`               | Deadline sắp đến              |
| `DEADLINE_OVERDUE`     | ⚠️ warning | **urgent** | inapp, push | `taskName`, `daysOverdue`, `taskId`            | Công việc quá hạn             |
| `KPI_CYCLE_STARTED`    |   📊 kpi   |   normal   | inapp, push | `cycleName`, `deadline`                        | Chu kỳ đánh giá bắt đầu       |
| `KPI_EVALUATED`        |   📊 kpi   |   normal   | inapp, push | `cycleName`, `rating`, `evaluationId`          | Có kết quả KPI                |
| `TICKET_CREATED`       | 🎫 ticket  |   normal   | inapp, push | `requesterName`, `ticketTitle`, `ticketId`     | Yêu cầu hỗ trợ mới            |
| `TICKET_RESOLVED`      |  ✅ check  |   normal   | inapp, push | `resolverName`, `ticketTitle`, `ticketId`      | Yêu cầu đã xử lý              |
| `SYSTEM_ANNOUNCEMENT`  | 🔔 system  |   normal   | inapp, push | `title`, `message`                             | Thông báo hệ thống            |

---

### 📊 Notification Send Sequence Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│                        NOTIFICATION SEND FLOW                                        │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                      │
│   Feature          NotificationService      SocketService       FCMService    User  │
│   Controller                                                                         │
│      │                    │                      │                  │          │    │
│      │  1. send({type,    │                      │                  │          │    │
│      │     recipientId,   │                      │                  │          │    │
│      │     data})         │                      │                  │          │    │
│      │───────────────────►│                      │                  │          │    │
│      │                    │                      │                  │          │    │
│      │                    │ 2. getTemplate(type) │                  │          │    │
│      │                    │◄────────────────────►│                  │          │    │
│      │                    │    (from cache/DB)   │                  │          │    │
│      │                    │                      │                  │          │    │
│      │                    │ 3. renderTemplate()  │                  │          │    │
│      │                    │    title = "..."     │                  │          │    │
│      │                    │    body = "..."      │                  │          │    │
│      │                    │                      │                  │          │    │
│      │                    │ 4. getOrCreate       │                  │          │    │
│      │                    │    UserSettings      │                  │          │    │
│      │                    │                      │                  │          │    │
│      │                    │ 5. shouldSend()?     │                  │          │    │
│      │                    │    Check settings    │                  │          │    │
│      │                    │                      │                  │          │    │
│      │                    │ 6. Save to MongoDB   │                  │          │    │
│      │                    │    (Notification)    │                  │          │    │
│      │                    │                      │                  │          │    │
│      │                    │ 7. isUserOnline?     │                  │          │    │
│      │                    │───────────────────►  │                  │          │    │
│      │                    │     ◄────────────────│                  │          │    │
│      │                    │     true/false       │                  │          │    │
│      │                    │                      │                  │          │    │
│      │                    │         ┌────────────┴────────────┐     │          │    │
│      │                    │         │                         │     │          │    │
│      │                    │    [User Online]            [User Offline]         │    │
│      │                    │         │                         │     │          │    │
│      │                    │ 8a. emitToUser()     │    8b. sendToUser()         │    │
│      │                    │────────►│            │    ────────►│    │          │    │
│      │                    │         │            │             │    │          │    │
│      │                    │         │ Socket.IO  │             │  FCM Push    │    │
│      │                    │         │ Event      │             │  via Google  │    │
│      │                    │         │───────────────────────────────────────►│    │
│      │                    │         │            │             │    │          │    │
│      │                    │         │         ───┴───          │    │          │    │
│      │                    │                                                    │    │
│      │◄───────────────────│ 9. Return notification                            │    │
│      │                    │                                                    │    │
│                                                                                      │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔌 API SPECIFICATION

### REST API Endpoints

**Base URL:** `/api/notifications`

| Method | Endpoint              | Description                      |
| ------ | --------------------- | -------------------------------- |
| GET    | `/`                   | Lấy danh sách thông báo của user |
| GET    | `/unread-count`       | Đếm số thông báo chưa đọc        |
| PUT    | `/:id/read`           | Đánh dấu 1 thông báo đã đọc      |
| PUT    | `/read-all`           | Đánh dấu tất cả đã đọc           |
| DELETE | `/:id`                | Xóa 1 thông báo                  |
| GET    | `/settings`           | Lấy cài đặt của user             |
| PUT    | `/settings`           | Cập nhật cài đặt                 |
| POST   | `/settings/fcm-token` | Lưu FCM token                    |
| DELETE | `/settings/fcm-token` | Xóa FCM token                    |

### API Details

#### 1. GET `/api/notifications`

**Query params:**

```
?page=1&limit=20&isRead=false
```

**Response:**

```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "6541...",
        "type": "TASK_ASSIGNED",
        "title": "Công việc mới",
        "body": "Trần Thị B đã giao cho bạn: Hoàn thành báo cáo",
        "icon": "task",
        "priority": "normal",
        "isRead": false,
        "actionUrl": "/quan-ly-cong-viec/chi-tiet/123",
        "createdAt": "2025-11-26T08:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

#### 2. GET `/api/notifications/unread-count`

**Response:**

```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

#### 3. PUT `/api/notifications/:id/read`

**Response:**

```json
{
  "success": true,
  "message": "Đã đánh dấu đã đọc"
}
```

#### 4. PUT `/api/notifications/read-all`

**Response:**

```json
{
  "success": true,
  "message": "Đã đánh dấu tất cả đã đọc",
  "data": {
    "modifiedCount": 5
  }
}
```

#### 5. GET `/api/notifications/settings`

**Response:**

```json
{
  "success": true,
  "data": {
    "enableNotifications": true,
    "enablePush": true,
    "quietHours": {
      "enabled": true,
      "start": "22:00",
      "end": "07:00"
    },
    "typePreferences": {
      "TASK_ASSIGNED": { "inapp": true, "push": true },
      "COMMENT_ADDED": { "inapp": true, "push": false }
    }
  }
}
```

#### 6. PUT `/api/notifications/settings`

**Request body:**

```json
{
  "enablePush": true,
  "quietHours": {
    "enabled": true,
    "start": "22:00",
    "end": "06:00"
  },
  "typePreferences": {
    "COMMENT_ADDED": { "inapp": true, "push": false }
  }
}
```

#### 7. POST `/api/notifications/settings/fcm-token`

**Request body:**

```json
{
  "token": "fcm_token_string...",
  "deviceName": "iPhone 14 Pro"
}
```

---

### 🔧 Admin API Endpoints (NotificationTemplate Management)

**Base URL:** `/api/workmanagement/notifications/templates`

**⚠️ Required Permission:** Admin role (`PhanQuyen >= 3`)

| Method | Endpoint       | Description                                                   |
| ------ | -------------- | ------------------------------------------------------------- |
| GET    | `/`            | Lấy danh sách templates (filter theo `typeCode`, `isEnabled`) |
| GET    | `/:id`         | Lấy chi tiết 1 template                                       |
| POST   | `/`            | Tạo template mới                                              |
| PUT    | `/:id`         | Cập nhật template                                             |
| DELETE | `/:id`         | Soft delete (isEnabled = false)                               |
| POST   | `/:id/preview` | Preview render template với sample data                       |

**Admin Tools:**

- `POST /api/workmanagement/notifications/test-send` (thực gửi)
- `POST /api/workmanagement/notifications/clear-cache`

#### Admin API Details

##### 1. GET `/api/workmanagement/notifications/templates`

**Query params:**

```
?page=1&limit=20&category=task&isAutoCreated=true&search=công+việc
```

**Response:**

```json
{
  "success": true,
  "data": {
    "templates": [
      {
        "_id": "6541...",
        "type": "TASK_ASSIGNED",
        "name": "Được giao việc mới",
        "category": "task",
        "isAutoCreated": false,
        "isActive": true,
        "usageCount": 150,
        "lastUsedAt": "2025-11-26T08:30:00Z",
        "titleTemplate": "Công việc mới",
        "bodyTemplate": "{{assignerName}} đã giao cho bạn: {{taskName}}",
        "requiredVariables": ["assignerName", "taskName", "taskId"]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 12,
      "totalPages": 1
    },
    "stats": {
      "total": 12,
      "autoCreated": 2,
      "inactive": 0
    }
  }
}
```

##### 2. POST `/api/workmanagement/notifications/templates`

**Request body:**

```json
{
  "type": "CUSTOM_EVENT",
  "name": "Sự kiện tùy chỉnh",
  "description": "Mô tả template",
  "category": "other",
  "titleTemplate": "{{title}}",
  "bodyTemplate": "{{message}}",
  "icon": "notification",
  "defaultChannels": ["inapp", "push"],
  "defaultPriority": "normal",
  "actionUrlTemplate": "/events/{{eventId}}",
  "requiredVariables": ["title", "message", "eventId"]
}
```

##### 3. PUT `/api/workmanagement/notifications/templates/:id`

**Request body:** (Partial update - only fields to change)

```json
{
  "name": "Tên mới",
  "bodyTemplate": "Nội dung mới: {{variable}}",
  "isAutoCreated": false
}
```

**Note:** Khi update một template `isAutoCreated: true`, Admin nên set `isAutoCreated: false` để đánh dấu đã được cấu hình.

##### 4. POST `/api/workmanagement/notifications/templates/:id/preview`

**Request body:** (Optional sample data)

```json
{
  "data": {
    "assignerName": "Nguyễn Văn Test",
    "taskName": "Công việc test",
    "taskId": "test123"
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Preview template thành công",
  "data": {
    "preview": {
      "title": "Công việc mới",
      "body": "Nguyễn Văn Test đã giao cho bạn: Công việc test"
    }
  }
}
```

##### 5. POST `/api/workmanagement/notifications/test-send`

**Response:**

```json
{
  "success": true,
  "data": {
    "result": {
      "success": true,
      "sent": 1,
      "failed": 0
    }
  }
}
```

---

## 📡 SOCKET.IO EVENTS

### Client → Server Events

| Event                   | Payload              | Description      |
| ----------------------- | -------------------- | ---------------- |
| `notification:read`     | `{ notificationId }` | Mark as read     |
| `notification:read-all` | -                    | Mark all as read |

### Server → Client Events

| Event                | Payload            | Description         |
| -------------------- | ------------------ | ------------------- |
| `notification:new`   | `{ notification }` | New notification    |
| `notification:count` | `{ count }`        | Unread count update |

### Event Payloads

**notification:new**

```json
{
  "notification": {
    "_id": "6541...",
    "type": "TASK_ASSIGNED",
    "title": "Công việc mới",
    "body": "Trần Thị B đã giao cho bạn: Hoàn thành báo cáo",
    "icon": "task",
    "priority": "normal",
    "actionUrl": "/quan-ly-cong-viec/chi-tiet/123",
    "createdAt": "2025-11-26T08:30:00Z"
  }
}
```

---

## 🛠️ SERVICE DESIGN

### NotificationService Interface

```javascript
// File: giaobanbv-be/services/notificationService.js

class NotificationService {
  /**
   * Gửi notification đến 1 user
   * @param {Object} options
   * @param {string} options.type - Loại notification (match với template)
   * @param {string} options.recipientId - User._id của người nhận
   * @param {Object} options.data - Data để render template
   * @param {string} [options.priority] - Override priority ('normal' | 'urgent')
   * @returns {Promise<Notification>}
   */
  async send({ type, recipientId, data, priority }) {}

  /**
   * Gửi notification đến nhiều users
   * @param {Object} options
   * @param {string} options.type
   * @param {string[]} options.recipientIds - Array of User._id
   * @param {Object} options.data
   * @returns {Promise<Notification[]>}
   */
  async sendToMany({ type, recipientIds, data }) {}

  /**
   * Gửi notification đến tất cả users trong 1 khoa
   * @param {Object} options
   * @param {string} options.type
   * @param {string} options.khoaId - Khoa._id
   * @param {Object} options.data
   * @param {string[]} [options.excludeUserIds] - Users to exclude
   * @returns {Promise<Notification[]>}
   */
  async sendToKhoa({ type, khoaId, data, excludeUserIds }) {}

  /**
   * 🆕 Auto-create template if not exists
   * Called internally by send() when template not found
   * @private
   */
  async _getOrCreateTemplate(type, dataKeys) {
    let template = await NotificationTemplate.findOne({ type });

    if (!template) {
      // Auto-create with generic content
      const formattedName = type
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

      template = await NotificationTemplate.create({
        type: type.toUpperCase(),
        name: formattedName,
        titleTemplate: "🔔 Thông báo mới",
        bodyTemplate: `Bạn có thông báo: ${formattedName}`,
        isAutoCreated: true, // ⚠️ Flag cần Admin config
        category: "other",
        requiredVariables: dataKeys || [],
      });

      console.warn(`[NotificationService] Auto-created template: ${type}`);
    }

    return template;
  }
}
```

### SocketService Interface

```javascript
// File: giaobanbv-be/services/socketService.js

class SocketService {
  /**
   * Initialize Socket.IO server
   * @param {http.Server} httpServer
   */
  init(httpServer) {}

  /**
   * Emit event to specific user
   * @param {string} userId - User._id
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emitToUser(userId, event, data) {}

  /**
   * Check if user is online
   * @param {string} userId
   * @returns {boolean}
   */
  isUserOnline(userId) {}

  /**
   * Get all online user IDs
   * @returns {string[]}
   */
  getOnlineUsers() {}
}
```

### FCMService Interface

```javascript
// File: giaobanbv-be/services/fcmService.js

class FCMService {
  /**
   * Send push notification to user's devices
   * @param {string} userId
   * @param {Object} notification - { title, body, icon, actionUrl }
   * @returns {Promise<void>}
   */
  async sendToUser(userId, notification) {}

  /**
   * Send push to specific FCM token
   * @param {string} token
   * @param {Object} notification
   * @returns {Promise<void>}
   */
  async sendToToken(token, notification) {}
}
```

---

## 🔗 INTEGRATION GUIDE

### How to send notification from any feature

**Step 1: Import service**

```javascript
const notificationService = require("../../services/notificationService");
```

**Step 2: Call send() with appropriate type and data**

```javascript
// Example: When assigning a task
const assignTask = async (req, res) => {
  // ... create task logic ...

  // Send notification
  await notificationService.send({
    type: "TASK_ASSIGNED",
    recipientId: task.NguoiThucHienID, // User._id
    data: {
      taskId: task._id,
      taskName: task.TenCongViec,
      assignerName: req.user.HoTen,
    },
  });

  // ... response ...
};
```

**Step 3: Ensure template exists in DB**

The `type` must match a `NotificationTemplate.type` in database.

### ⚠️ CRITICAL: User.\_id vs NhanVien.\_id

```javascript
// ✅ CORRECT - Use User._id for recipientId
await notificationService.send({
  type: "TASK_ASSIGNED",
  recipientId: user._id, // This is User model's _id
  data: { ... }
});

// ❌ WRONG - Do NOT use NhanVien._id directly
await notificationService.send({
  type: "TASK_ASSIGNED",
  recipientId: nhanVien._id, // WRONG! This is NhanVien, not User
  data: { ... }
});

// ✅ If you have NhanVien._id, find User first
const user = await User.findOne({ NhanVienID: nhanVienId });
await notificationService.send({
  type: "TASK_ASSIGNED",
  recipientId: user._id,
  data: { ... }
});
```

---

## 📁 FILE STRUCTURE

```
giaobanbv-be/
├── models/
│   ├── Notification.js
│   ├── NotificationTemplate.js          # +6 fields mới (isAutoCreated, category, etc.)
│   └── UserNotificationSettings.js
├── services/
│   ├── notificationService.js           # +auto-create template logic
│   ├── socketService.js
│   └── fcmService.js
├── controllers/
│   ├── notificationController.js
│   └── notificationTemplateController.js # 🆕 Admin CRUD
├── routes/
│   ├── notificationRoutes.js
│   └── notificationTemplateRoutes.js     # 🆕 Admin routes
├── middlewares/
│   └── socketAuth.js
├── seeds/
│   └── notificationTemplates.js
└── bin/
    └── www (Socket.IO attached here)

fe-bcgiaobanbvt/
├── src/
│   ├── features/
│   │   └── Notification/
│   │       ├── notificationSlice.js
│   │       ├── NotificationBell.js
│   │       ├── NotificationDropdown.js
│   │       ├── NotificationDrawer.js
│   │       ├── NotificationItem.js
│   │       ├── NotificationSettings.js
│   │       ├── index.js
│   │       └── Admin/                    # 🆕 Admin UI
│   │           ├── NotificationTemplateTable.js
│   │           ├── NotificationTemplateForm.js
│   │           ├── NotificationTemplateTest.js
│   │           └── notificationTemplateSlice.js
│   ├── hooks/
│   │   ├── useSocket.js
│   │   └── usePushNotification.js
│   ├── contexts/
│   │   └── SocketContext.js
│   ├── pages/
│   │   ├── NotificationPage.js
│   │   └── NotificationAdminPage.js      # 🆕 Admin page
│   └── firebase.js
└── public/
    └── firebase-messaging-sw.js (FCM handlers)
```

---

## ✅ NEXT STEPS

Sau khi hiểu architecture, tiếp tục với:

1. **[02_BACKEND_IMPLEMENTATION.md](./02_BACKEND_IMPLEMENTATION.md)** - Code backend đầy đủ
2. **[03_FRONTEND_IMPLEMENTATION.md](./03_FRONTEND_IMPLEMENTATION.md)** - Code frontend đầy đủ
3. **[04_FCM_PUSH_SETUP.md](./04_FCM_PUSH_SETUP.md)** - Setup Firebase push notifications

---

**Questions?** Review this architecture document first, then proceed to implementation guides.
