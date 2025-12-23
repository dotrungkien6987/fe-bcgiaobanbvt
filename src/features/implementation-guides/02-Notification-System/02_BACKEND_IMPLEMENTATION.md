# 🔧 Notification System - Backend Implementation

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Step 1: Install Dependencies](#step-1-install-dependencies)
3. [Step 2: Create Models](#step-2-create-models)
4. [Step 3: Create Services](#step-3-create-services)
5. [Step 4: Setup Socket.IO](#step-4-setup-socketio)
6. [Step 5: Create Controllers & Routes](#step-5-create-controllers--routes)
7. [Step 6: Seed Templates](#step-6-seed-templates)
8. [Step 7: Testing](#step-7-testing)
9. [Troubleshooting](#troubleshooting)

---

## ✅ PREREQUISITES

Trước khi bắt đầu, đảm bảo:

- [ ] Đã đọc `01_ARCHITECTURE.md`
- [ ] Node.js v16+ installed
- [ ] MongoDB running
- [ ] Backend project (`giaobanbv-be`) đang chạy

**Verify:**

```bash
cd giaobanbv-be
npm start
# Should start without errors
```

---

## 📊 QUICK REFERENCE TABLES

### API Endpoints Overview

|  Method  | Endpoint                                | Trạng thái | Mô tả                                |
| :------: | --------------------------------------- | :--------: | ------------------------------------ |
|  `GET`   | `/api/notifications`                    |     ✅     | Lấy danh sách thông báo (pagination) |
|  `GET`   | `/api/notifications/unread-count`       |     ✅     | Đếm số chưa đọc                      |
|  `PUT`   | `/api/notifications/:id/read`           |     ✅     | Đánh dấu 1 thông báo đã đọc          |
|  `PUT`   | `/api/notifications/read-all`           |     ✅     | Đánh dấu tất cả đã đọc               |
| `DELETE` | `/api/notifications/:id`                |     ✅     | Xóa 1 thông báo                      |
|  `GET`   | `/api/notifications/settings`           |     ✅     | Lấy cài đặt của user                 |
|  `PUT`   | `/api/notifications/settings`           |     ✅     | Cập nhật cài đặt                     |
|  `POST`  | `/api/notifications/settings/fcm-token` |     ✅     | Lưu FCM token                        |
| `DELETE` | `/api/notifications/settings/fcm-token` |     ✅     | Xóa FCM token                        |
|  `POST`  | `/api/notifications/test`               |   🛠️ DEV   | Gửi test notification                |

### API Request/Response Details

#### 1. GET `/api/notifications`

| Param    | Type    | Default | Mô tả                              |
| -------- | ------- | ------- | ---------------------------------- |
| `page`   | number  | 1       | Trang hiện tại                     |
| `limit`  | number  | 20      | Số items mỗi trang                 |
| `isRead` | boolean | -       | Lọc theo trạng thái đọc (optional) |

**Response:**

```javascript
{
  "success": true,
  "data": {
    "notifications": [
      {
        "_id": "6541...",
        "type": "TASK_ASSIGNED",
        "title": "Công việc mới",
        "body": "Nguyễn Văn A đã giao cho bạn: Hoàn thành báo cáo",
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

#### 2. PUT `/api/notifications/settings`

**Request Body:**

```javascript
{
  "enableNotifications": true,    // Optional: Master switch
  "enablePush": true,             // Optional: Push on/off
  "quietHours": {                 // Optional: Giờ yên tĩnh
    "enabled": true,
    "start": "22:00",
    "end": "07:00"
  },
  "typePreferences": {            // Optional: Cài đặt theo loại
    "COMMENT_ADDED": { "inapp": true, "push": false },
    "TASK_ASSIGNED": { "inapp": true, "push": true }
  }
}
```

### Service Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER ARCHITECTURE                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│    ┌──────────────────────────────────────────────────┐  │
│    │              NotificationService                     │  │
│    │  (Main entry point - orchestrates all operations)    │  │
│    ├──────────────────────────────────────────────────┤  │
│    │ Methods:                                              │  │
│    │   • send({type, recipientId, data, priority})        │  │
│    │   • sendToMany({type, recipientIds, data})           │  │
│    │   • sendToKhoa({type, khoaId, data, excludes})       │  │
│    │   • getNotifications(userId, options)                │  │
│    │   • getUnreadCount(userId)                           │  │
│    │   • markAsRead(notificationId, userId)               │  │
│    │   • markAllAsRead(userId)                            │  │
│    └─────────────────────┬────────────────────────────┘  │
│                          │                                   │
│         ┌───────────────┼───────────────┐                  │
│         │               │               │                  │
│         ▼               ▼               ▼                  │
│  ┌────────────┐ ┌─────────────┐ ┌──────────────┐         │
│  │SocketService│ │ FCMService  │ │ Models       │         │
│  ├────────────┤ ├─────────────┤ ├──────────────┤         │
│  │ init()     │ │ init()      │ │ Notification │         │
│  │ emitToUser │ │ sendToUser  │ │ Template     │         │
│  │ isOnline   │ │ sendToToken │ │ UserSettings │         │
│  └─────┬──────┘ └─────┬───────┘ └──────┬───────┘         │
│        │             │              │                  │
│        ▼             ▼              ▼                  │
│  ┌──────────────────────────────────────────────┐         │
│  │ Socket.IO Server   FCM (Google)   MongoDB   │         │
│  └──────────────────────────────────────────────┘         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### Files to Create

|  #  | File                                    | Mô tả                | Dependency               |
| :-: | --------------------------------------- | -------------------- | ------------------------ |
|  1  | `models/Notification.js`                | Schema thông báo     | -                        |
|  2  | `models/NotificationTemplate.js`        | Schema mẫu thông báo | -                        |
|  3  | `models/UserNotificationSettings.js`    | Schema cài đặt user  | -                        |
|  4  | `services/socketService.js`             | Socket.IO service    | Model 1                  |
|  5  | `services/notificationService.js`       | Main service         | Models 1,2,3 + Service 4 |
|  6  | `controllers/notificationController.js` | REST API handlers    | Service 5                |
|  7  | `routes/notificationRoutes.js`          | Route definitions    | Controller 6             |
|  8  | `seeds/notificationTemplates.js`        | Seed templates       | Model 2                  |

---

## 🔧 STEP 1: INSTALL DEPENDENCIES

**Run in `giaobanbv-be` folder:**

```bash
npm install socket.io
```

**Verify in `package.json`:**

```json
{
  "dependencies": {
    "socket.io": "^4.7.x"
  }
}
```

---

## 🔧 STEP 2: CREATE MODELS

### 2.1 Notification Model

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

    // Icon để hiển thị
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

// Compound indexes for performance
notificationSchema.index({ recipientId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ recipientId: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
```

### 2.2 NotificationTemplate Model

**File:** `giaobanbv-be/models/NotificationTemplate.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationTemplateSchema = new Schema(
  {
    // Unique type identifier (e.g., "TASK_ASSIGNED")
    type: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    // Display name for admin UI
    name: {
      type: String,
      required: true,
    },

    // Description for admin
    description: {
      type: String,
    },

    // 🆕 Category for grouping in Admin UI
    category: {
      type: String,
      enum: ["task", "kpi", "ticket", "system", "other"],
      default: "other",
    },

    // 🆕 Auto-created flag (needs Admin config)
    isAutoCreated: {
      type: Boolean,
      default: false,
    },

    // 🆕 Usage statistics
    usageCount: {
      type: Number,
      default: 0,
    },
    lastUsedAt: {
      type: Date,
    },

    // 🆕 Audit fields
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // Templates with {{placeholder}} syntax
    titleTemplate: {
      type: String,
      required: true,
    },
    bodyTemplate: {
      type: String,
      required: true,
    },

    // Icon name for frontend
    icon: {
      type: String,
      default: "notification",
    },

    // Default delivery channels
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

    // URL template with {{placeholder}}
    actionUrlTemplate: {
      type: String,
    },

    // Is template active?
    isActive: {
      type: Boolean,
      default: true,
    },

    // Variables required for this template
    requiredVariables: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// 🆕 Increment usage count when template is used
notificationTemplateSchema.methods.incrementUsage = async function () {
  this.usageCount += 1;
  this.lastUsedAt = new Date();
  await this.save();
};

module.exports = mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);
```

### 2.3 UserNotificationSettings Model

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

const fcmTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    deviceName: { type: String, default: "Unknown Device" },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const userNotificationSettingsSchema = new Schema(
  {
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

    // Quiet hours
    quietHours: {
      enabled: { type: Boolean, default: false },
      start: { type: String, default: "22:00" },
      end: { type: String, default: "07:00" },
    },

    // Per-type preferences
    typePreferences: {
      type: Map,
      of: typePreferenceSchema,
      default: new Map(),
    },

    // FCM tokens for multiple devices
    fcmTokens: [fcmTokenSchema],
  },
  {
    timestamps: true,
  }
);

// Method: Check if should send notification
userNotificationSettingsSchema.methods.shouldSend = function (type, channel) {
  // Global check
  if (!this.enableNotifications) return false;
  if (channel === "push" && !this.enablePush) return false;

  // Quiet hours check (only for push)
  if (channel === "push" && this.quietHours.enabled) {
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes()
    ).padStart(2, "0")}`;

    const { start, end } = this.quietHours;

    // Handle overnight (e.g., 22:00 - 07:00)
    if (start > end) {
      if (currentTime >= start || currentTime < end) return false;
    } else {
      if (currentTime >= start && currentTime < end) return false;
    }
  }

  // Type-specific check
  const typePref = this.typePreferences.get(type);
  if (typePref && typePref[channel] === false) {
    return false;
  }

  return true;
};

// Static: Get or create settings for user
userNotificationSettingsSchema.statics.getOrCreate = async function (userId) {
  let settings = await this.findOne({ userId });
  if (!settings) {
    settings = await this.create({ userId });
  }
  return settings;
};

module.exports = mongoose.model(
  "UserNotificationSettings",
  userNotificationSettingsSchema
);
```

**Verify models created:**

```bash
ls models/Notification.js
ls models/NotificationTemplate.js
ls models/UserNotificationSettings.js
```

---

## 🔧 STEP 3: CREATE SERVICES

### 3.1 SocketService

**File:** `giaobanbv-be/services/socketService.js`

```javascript
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class SocketService {
  constructor() {
    this.io = null;
    this.onlineUsers = new Map(); // userId -> socketId
  }

  /**
   * Initialize Socket.IO with HTTP server
   */
  init(httpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGINS
          ? process.env.CORS_ORIGINS.split(",")
          : ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true,
      },
    });

    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;

        if (!token) {
          return next(new Error("Authentication token required"));
        }

        // Verify JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded._id);

        if (!user) {
          return next(new Error("User not found"));
        }

        // Attach user to socket
        socket.userId = user._id.toString();
        socket.user = user;
        next();
      } catch (error) {
        console.error("[SocketService] Auth error:", error.message);
        next(new Error("Invalid token"));
      }
    });

    // Connection handler
    this.io.on("connection", (socket) => {
      const userId = socket.userId;
      console.log(`[Socket] User connected: ${userId}`);

      // Track online user
      this.onlineUsers.set(userId, socket.id);

      // Handle disconnect
      socket.on("disconnect", () => {
        console.log(`[Socket] User disconnected: ${userId}`);
        this.onlineUsers.delete(userId);
      });

      // Handle notification events from client
      socket.on("notification:read", async (data) => {
        // Will be handled by controller via REST API
        // This is optional for real-time sync across tabs
      });

      socket.on("notification:read-all", async () => {
        // Will be handled by controller via REST API
      });
    });

    console.log("[SocketService] ✅ Initialized");
  }

  /**
   * Emit event to specific user
   */
  emitToUser(userId, event, data) {
    const socketId = this.onlineUsers.get(userId.toString());
    if (socketId) {
      this.io.to(socketId).emit(event, data);
      return true;
    }
    return false;
  }

  /**
   * Emit event to multiple users
   */
  emitToUsers(userIds, event, data) {
    userIds.forEach((userId) => {
      this.emitToUser(userId, event, data);
    });
  }

  /**
   * Emit event to all connected users
   */
  emitToAll(event, data) {
    this.io.emit(event, data);
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId) {
    return this.onlineUsers.has(userId.toString());
  }

  /**
   * Get all online user IDs
   */
  getOnlineUsers() {
    return Array.from(this.onlineUsers.keys());
  }

  /**
   * Get Socket.IO instance
   */
  getIO() {
    return this.io;
  }
}

// Singleton export
module.exports = new SocketService();
```

### 3.2 NotificationService

**File:** `giaobanbv-be/services/notificationService.js`

```javascript
const Notification = require("../models/Notification");
const NotificationTemplate = require("../models/NotificationTemplate");
const UserNotificationSettings = require("../models/UserNotificationSettings");
const socketService = require("./socketService");
// const fcmService = require("./fcmService"); // Uncomment when FCM is ready

class NotificationService {
  constructor() {
    this.templateCache = new Map();
  }

  /**
   * Load templates from DB into cache
   */
  async loadTemplates() {
    const templates = await NotificationTemplate.find({ isActive: true });
    templates.forEach((t) => {
      this.templateCache.set(t.type, t);
    });
    console.log(
      `[NotificationService] Loaded ${templates.length} templates into cache`
    );
  }

  /**
   * 🆕 Get template by type - auto-creates if not found
   * @param {string} type - Template type
   * @param {string[]} [dataKeys] - Keys from data object (for requiredVariables)
   */
  async getTemplate(type, dataKeys = []) {
    // Check cache first
    if (this.templateCache.has(type)) {
      return this.templateCache.get(type);
    }

    // Try DB
    let template = await NotificationTemplate.findOne({
      type: type.toUpperCase(),
      isActive: true,
    });

    // 🆕 Auto-create template if not found
    if (!template) {
      console.warn(
        `[NotificationService] Template "${type}" not found, auto-creating...`
      );

      // Format name from type (e.g., "TASK_ASSIGNED" → "Task Assigned")
      const formattedName = type
        .split("_")
        .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
        .join(" ");

      template = await NotificationTemplate.create({
        type: type.toUpperCase(),
        name: formattedName,
        description: `Auto-created template for ${formattedName}. Please configure!`,
        titleTemplate: "🔔 Thông báo mới",
        bodyTemplate: `Bạn có thông báo: ${formattedName}`,
        icon: "notification",
        defaultChannels: ["inapp", "push"],
        defaultPriority: "normal",
        category: "other",
        isAutoCreated: true, // ⚠️ Flag cần Admin config
        requiredVariables: dataKeys,
      });

      console.warn(
        `[NotificationService] ⚠️ Auto-created template: ${type}. ` +
          `Admin should configure titleTemplate and bodyTemplate!`
      );
    }

    // Update cache
    this.templateCache.set(template.type, template);

    return template;
  }

  /**
   * 🆕 Clear template from cache (call after admin updates template)
   */
  invalidateCache(type) {
    this.templateCache.delete(type);
  }

  /**
   * Render template with data
   */
  renderTemplate(templateString, data) {
    return templateString.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  /**
   * Send notification to single user
   * @param {Object} options
   * @param {string} options.type - Notification type (must match template)
   * @param {string} options.recipientId - User._id
   * @param {Object} options.data - Data for template rendering
   * @param {string} [options.priority] - Override default priority
   * @returns {Promise<Notification|null>}
   */
  async send({ type, recipientId, data, priority }) {
    try {
      // 1. Get template (auto-creates if not found)
      const dataKeys = Object.keys(data || {});
      const template = await this.getTemplate(type, dataKeys);

      // Template will never be null now due to auto-create

      // 🆕 Update usage statistics
      await NotificationTemplate.findByIdAndUpdate(template._id, {
        $inc: { usageCount: 1 },
        $set: { lastUsedAt: new Date() },
      });

      // 2. Get user settings
      const settings = await UserNotificationSettings.getOrCreate(recipientId);

      // 3. Check if user wants this notification
      if (!settings.shouldSend(type, "inapp")) {
        console.log(
          `[NotificationService] User ${recipientId} disabled ${type} notifications`
        );
        return null;
      }

      // 4. Render notification
      const title = this.renderTemplate(template.titleTemplate, data);
      const body = this.renderTemplate(template.bodyTemplate, data);
      const actionUrl = template.actionUrlTemplate
        ? this.renderTemplate(template.actionUrlTemplate, data)
        : null;

      // 5. Save to database
      const notification = await Notification.create({
        recipientId,
        type,
        title,
        body,
        icon: template.icon,
        priority: priority || template.defaultPriority,
        actionUrl,
        metadata: data,
        deliveredVia: ["inapp"],
      });

      // 6. Send via Socket.IO if online
      const isOnline = socketService.isUserOnline(recipientId);
      if (isOnline) {
        socketService.emitToUser(recipientId, "notification:new", {
          notification: notification.toObject(),
        });

        // Also send updated unread count
        const unreadCount = await this.getUnreadCount(recipientId);
        socketService.emitToUser(recipientId, "notification:count", {
          count: unreadCount,
        });
      }

      // 7. Send via FCM if offline and push enabled
      if (!isOnline && settings.shouldSend(type, "push")) {
        // TODO: Implement FCM in Step 04_FCM_PUSH_SETUP.md
        // await fcmService.sendToUser(recipientId, { title, body, actionUrl });
        // notification.deliveredVia.push("push");
        // await notification.save();
      }

      console.log(
        `[NotificationService] ✅ Sent ${type} to ${recipientId} (online: ${isOnline})`
      );
      return notification;
    } catch (error) {
      console.error("[NotificationService] Error sending notification:", error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToMany({ type, recipientIds, data, priority }) {
    const results = await Promise.all(
      recipientIds.map((recipientId) =>
        this.send({ type, recipientId, data, priority })
      )
    );
    return results.filter(Boolean); // Remove nulls
  }

  /**
   * Send notification to all users in a Khoa
   */
  async sendToKhoa({ type, khoaId, data, excludeUserIds = [] }) {
    const User = require("../models/User");
    const users = await User.find({
      KhoaID: khoaId,
      _id: { $nin: excludeUserIds },
    });

    return this.sendToMany({
      type,
      recipientIds: users.map((u) => u._id),
      data,
    });
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId) {
    return Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });
  }

  /**
   * Get notifications for user with pagination
   */
  async getNotifications(userId, { page = 1, limit = 20, isRead } = {}) {
    const query = { recipientId: userId };
    if (isRead !== undefined) {
      query.isRead = isRead;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Notification.countDocuments(query),
    ]);

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (notification) {
      // Send updated count via socket
      const unreadCount = await this.getUnreadCount(userId);
      socketService.emitToUser(userId, "notification:count", {
        count: unreadCount,
      });
    }

    return notification;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    // Send updated count via socket
    socketService.emitToUser(userId, "notification:count", { count: 0 });

    return result;
  }

  /**
   * Delete notification
   */
  async deleteNotification(notificationId, userId) {
    return Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId,
    });
  }
}

module.exports = new NotificationService();
```

**Verify services created:**

```bash
ls services/socketService.js
ls services/notificationService.js
```

---

## 🔧 STEP 4: SETUP SOCKET.IO

### 4.1 Modify bin/www

**File:** `giaobanbv-be/bin/www`

**Find the section after `var server = http.createServer(app);` and ADD:**

```javascript
#!/usr/bin/env node

/**
 * Module dependencies.
 */

var app = require("../app");
var debug = require("debug")("be:server");
var http = require("http");

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || "8080");
app.set("port", port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * ✅ SOCKET.IO SETUP - ADD THIS BLOCK
 */
const socketService = require("../services/socketService");
const notificationService = require("../services/notificationService");

// Initialize Socket.IO with HTTP server
socketService.init(server);

// Load notification templates into cache
notificationService.loadTemplates().catch((err) => {
  console.error("Failed to load notification templates:", err);
});

// Make services accessible from app (optional, for testing)
app.set("socketService", socketService);
app.set("notificationService", notificationService);
/**
 * END SOCKET.IO SETUP
 */

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

// ... rest of file unchanged ...
```

### 4.2 Update .env

**File:** `giaobanbv-be/.env`

**Add if not exists:**

```env
JWT_SECRET=your_jwt_secret_key
CORS_ORIGINS=http://localhost:3000,https://your-production-domain.com
```

---

## 🔧 STEP 5: CREATE CONTROLLERS & ROUTES

### 5.1 NotificationController

**File:** `giaobanbv-be/controllers/notificationController.js`

```javascript
const notificationService = require("../services/notificationService");
const UserNotificationSettings = require("../models/UserNotificationSettings");
const NotificationTemplate = require("../models/NotificationTemplate");
const { sendResponse, catchAsync, AppError } = require("../helpers/utils");

const notificationController = {};

/**
 * GET /api/notifications
 * Get user's notifications with pagination
 */
notificationController.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { page = 1, limit = 20, isRead } = req.query;

  const result = await notificationService.getNotifications(userId, {
    page: parseInt(page),
    limit: parseInt(limit),
    isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
  });

  return sendResponse(
    res,
    200,
    true,
    result,
    null,
    "Lấy danh sách thông báo thành công"
  );
});

/**
 * GET /api/notifications/unread-count
 * Get unread notification count
 */
notificationController.getUnreadCount = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const count = await notificationService.getUnreadCount(userId);

  return sendResponse(res, 200, true, { count }, null, "Thành công");
});

/**
 * PUT /api/notifications/:id/read
 * Mark single notification as read
 */
notificationController.markAsRead = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { id } = req.params;

  const notification = await notificationService.markAsRead(id, userId);

  if (!notification) {
    throw new AppError(404, "Không tìm thấy thông báo", "Not Found");
  }

  return sendResponse(res, 200, true, null, null, "Đã đánh dấu đã đọc");
});

/**
 * PUT /api/notifications/read-all
 * Mark all notifications as read
 */
notificationController.markAllAsRead = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const result = await notificationService.markAllAsRead(userId);

  return sendResponse(
    res,
    200,
    true,
    { modifiedCount: result.modifiedCount },
    null,
    "Đã đánh dấu tất cả đã đọc"
  );
});

/**
 * DELETE /api/notifications/:id
 * Delete a notification
 */
notificationController.deleteNotification = catchAsync(
  async (req, res, next) => {
    const userId = req.userId;
    const { id } = req.params;

    const notification = await notificationService.deleteNotification(
      id,
      userId
    );

    if (!notification) {
      throw new AppError(404, "Không tìm thấy thông báo", "Not Found");
    }

    return sendResponse(res, 200, true, null, null, "Đã xóa thông báo");
  }
);

/**
 * GET /api/notifications/settings
 * Get user's notification settings
 */
notificationController.getSettings = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const settings = await UserNotificationSettings.getOrCreate(userId);

  // Get available templates for settings UI
  const templates = await NotificationTemplate.find({ isActive: true }).select(
    "type name description defaultChannels"
  );

  return sendResponse(
    res,
    200,
    true,
    {
      settings: {
        enableNotifications: settings.enableNotifications,
        enablePush: settings.enablePush,
        quietHours: settings.quietHours,
        typePreferences: Object.fromEntries(settings.typePreferences),
      },
      availableTypes: templates,
    },
    null,
    "Thành công"
  );
});

/**
 * PUT /api/notifications/settings
 * Update user's notification settings
 */
notificationController.updateSettings = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { enableNotifications, enablePush, quietHours, typePreferences } =
    req.body;

  const settings = await UserNotificationSettings.getOrCreate(userId);

  // Update fields
  if (enableNotifications !== undefined) {
    settings.enableNotifications = enableNotifications;
  }
  if (enablePush !== undefined) {
    settings.enablePush = enablePush;
  }
  if (quietHours) {
    settings.quietHours = { ...settings.quietHours, ...quietHours };
  }
  if (typePreferences) {
    Object.entries(typePreferences).forEach(([type, prefs]) => {
      settings.typePreferences.set(type, prefs);
    });
  }

  await settings.save();

  return sendResponse(res, 200, true, null, null, "Đã cập nhật cài đặt");
});

/**
 * POST /api/notifications/settings/fcm-token
 * Save FCM token for push notifications
 */
notificationController.saveFcmToken = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { token, deviceName } = req.body;

  if (!token) {
    throw new AppError(400, "Token is required", "Bad Request");
  }

  const settings = await UserNotificationSettings.getOrCreate(userId);

  // Remove existing token if same
  settings.fcmTokens = settings.fcmTokens.filter((t) => t.token !== token);

  // Add new token
  settings.fcmTokens.push({
    token,
    deviceName: deviceName || "Unknown Device",
    createdAt: new Date(),
  });

  await settings.save();

  return sendResponse(res, 200, true, null, null, "Đã lưu FCM token");
});

/**
 * DELETE /api/notifications/settings/fcm-token
 * Remove FCM token
 */
notificationController.removeFcmToken = catchAsync(async (req, res, next) => {
  const userId = req.userId;
  const { token } = req.body;

  const settings = await UserNotificationSettings.getOrCreate(userId);
  settings.fcmTokens = settings.fcmTokens.filter((t) => t.token !== token);
  await settings.save();

  return sendResponse(res, 200, true, null, null, "Đã xóa FCM token");
});

/**
 * POST /api/notifications/test (DEV ONLY)
 * Send a test notification
 */
notificationController.sendTestNotification = catchAsync(
  async (req, res, next) => {
    if (process.env.NODE_ENV === "production") {
      throw new AppError(403, "Not available in production", "Forbidden");
    }

    const userId = req.userId;
    const { type = "SYSTEM_ANNOUNCEMENT" } = req.body;

    const notification = await notificationService.send({
      type,
      recipientId: userId,
      data: {
        title: "Test Notification",
        message:
          "Đây là thông báo test từ hệ thống. Thời gian: " +
          new Date().toLocaleString("vi-VN"),
      },
    });

    return sendResponse(
      res,
      200,
      true,
      { notification },
      null,
      "Đã gửi test notification"
    );
  }
);

module.exports = notificationController;
```

### 5.2 NotificationRoutes

**File:** `giaobanbv-be/routes/notificationRoutes.js`

```javascript
const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const authentication = require("../middlewares/authentication");

// All routes require authentication
router.use(authentication.loginRequired);

/**
 * @route   GET /api/notifications
 * @desc    Get user's notifications
 * @access  Private
 */
router.get("/", notificationController.getNotifications);

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Get unread count
 * @access  Private
 */
router.get("/unread-count", notificationController.getUnreadCount);

/**
 * @route   PUT /api/notifications/:id/read
 * @desc    Mark notification as read
 * @access  Private
 */
router.put("/:id/read", notificationController.markAsRead);

/**
 * @route   PUT /api/notifications/read-all
 * @desc    Mark all as read
 * @access  Private
 */
router.put("/read-all", notificationController.markAllAsRead);

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete("/:id", notificationController.deleteNotification);

/**
 * @route   GET /api/notifications/settings
 * @desc    Get notification settings
 * @access  Private
 */
router.get("/settings", notificationController.getSettings);

/**
 * @route   PUT /api/notifications/settings
 * @desc    Update notification settings
 * @access  Private
 */
router.put("/settings", notificationController.updateSettings);

/**
 * @route   POST /api/notifications/settings/fcm-token
 * @desc    Save FCM token
 * @access  Private
 */
router.post("/settings/fcm-token", notificationController.saveFcmToken);

/**
 * @route   DELETE /api/notifications/settings/fcm-token
 * @desc    Remove FCM token
 * @access  Private
 */
router.delete("/settings/fcm-token", notificationController.removeFcmToken);

/**
 * @route   POST /api/notifications/test
 * @desc    Send test notification (DEV only)
 * @access  Private
 */
router.post("/test", notificationController.sendTestNotification);

module.exports = router;
```

### 5.3 Register Routes in app.js

**File:** `giaobanbv-be/app.js`

**Find the routes section and ADD:**

```javascript
// ... existing routes ...

const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Admin notification management (unified)
// NOTE: legacy `/api/notification-templates` is deprecated (410 Gone).
const workmanagementNotificationApi = require("./modules/workmanagement/routes/notification.api");
app.use("/api/workmanagement/notifications", workmanagementNotificationApi);

// ... rest of file ...
```

---

### 5.4 🆕 Notification Admin APIs (Unified)

Từ bản refactor, toàn bộ API quản trị (types/templates + tools) được gom về:

- **Route:** `giaobanbv-be/modules/workmanagement/routes/notification.api.js`
- **Controller:** `giaobanbv-be/modules/workmanagement/controllers/notification.controller.js`

**Templates (Admin):**

- `GET /api/workmanagement/notifications/templates`
- `GET /api/workmanagement/notifications/templates/:id`
- `POST /api/workmanagement/notifications/templates`
- `PUT /api/workmanagement/notifications/templates/:id`
- `DELETE /api/workmanagement/notifications/templates/:id` (soft disable)
- `POST /api/workmanagement/notifications/templates/:id/preview`

**Tools (Admin):**

- `POST /api/workmanagement/notifications/test-send` (thực gửi)
- `POST /api/workmanagement/notifications/clear-cache`

> Ghi chú: API legacy `/api/notification-templates/*` đã bị deprecate và trả về **410 Gone** để tránh bị gọi nhầm.

---

## 🔧 STEP 6: SEED TEMPLATES

### 📊 Template Variables Reference

| Type                   | Required Variables                             | Example Values                                 |
| ---------------------- | ---------------------------------------------- | ---------------------------------------------- |
| `TASK_ASSIGNED`        | `assignerName`, `taskName`, `taskId`           | "Nguyễn Văn A", "Hoàn thành báo cáo", "abc123" |
| `TASK_STATUS_CHANGED`  | `taskName`, `newStatus`, `taskId`              | "Báo cáo tháng", "Đang xử lý", "abc123"        |
| `TASK_APPROVED`        | `approverName`, `taskName`, `taskId`           | "Trần B", "Báo cáo", "abc123"                  |
| `TASK_REJECTED`        | `rejecterName`, `taskName`, `taskId`, `reason` | "Trần B", "Báo cáo", "abc123", "Chưa đủ data"  |
| `COMMENT_ADDED`        | `commenterName`, `commentPreview`, `taskId`    | "Lê C", "Cần bổ sung...", "abc123"             |
| `DEADLINE_APPROACHING` | `taskName`, `daysLeft`, `taskId`               | "Báo cáo", "2", "abc123"                       |
| `DEADLINE_OVERDUE`     | `taskName`, `daysOverdue`, `taskId`            | "Báo cáo", "3", "abc123"                       |
| `KPI_CYCLE_STARTED`    | `cycleName`, `deadline`                        | "Tháng 11/2025", "30/11/2025"                  |
| `KPI_EVALUATED`        | `cycleName`, `rating`, `evaluationId`          | "Tháng 10", "A", "eval123"                     |
| `TICKET_CREATED`       | `requesterName`, `ticketTitle`, `ticketId`     | "User A", "Lỗi đăng nhập", "tkt123"            |
| `TICKET_RESOLVED`      | `resolverName`, `ticketTitle`, `ticketId`      | "Admin", "Lỗi đăng nhập", "tkt123"             |
| `SYSTEM_ANNOUNCEMENT`  | `title`, `message`                             | "Bảo trì", "Hệ thống sẽ bảo trì..."            |

### 6.1 Create Seed File

**File:** `giaobanbv-be/seeds/notificationTemplates.js`

```javascript
const mongoose = require("mongoose");
require("dotenv").config();

const NotificationTemplate = require("../models/NotificationTemplate");

const templates = [
  // ===== TASK NOTIFICATIONS =====
  {
    type: "TASK_ASSIGNED",
    name: "Được giao việc mới",
    description: "Khi user được giao một công việc",
    category: "task", // 🆕
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
    category: "task", // 🆕
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
    category: "task", // 🆕
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
    category: "task", // 🆕
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
    category: "task", // 🆕 (Comments belong to tasks)
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
    category: "task", // 🆕
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
    category: "task", // 🆕
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
    category: "kpi", // 🆕
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
    category: "kpi", // 🆕
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
    category: "ticket", // 🆕
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
    category: "ticket", // 🆕
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
    category: "system", // 🆕
    titleTemplate: "{{title}}",
    bodyTemplate: "{{message}}",
    icon: "system",
    defaultChannels: ["inapp", "push"],
    defaultPriority: "normal",
    actionUrlTemplate: "",
    requiredVariables: ["title", "message"],
  },
];

async function seedTemplates() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    // Upsert templates (update if exists, insert if not)
    for (const template of templates) {
      await NotificationTemplate.findOneAndUpdate(
        { type: template.type },
        template,
        { upsert: true, new: true }
      );
      console.log(`✅ Upserted template: ${template.type}`);
    }

    console.log("\n🎉 All templates seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding templates:", error);
    process.exit(1);
  }
}

seedTemplates();
```

### 6.2 Add Script to package.json

**File:** `giaobanbv-be/package.json`

**Add to scripts:**

```json
{
  "scripts": {
    "seed:notifications": "node seeds/notificationTemplates.js"
  }
}
```

### 6.3 Run Seed

```bash
cd giaobanbv-be
npm run seed:notifications
```

**Expected output:**

```
Connected to MongoDB
✅ Upserted template: TASK_ASSIGNED
✅ Upserted template: TASK_STATUS_CHANGED
✅ Upserted template: TASK_APPROVED
...
🎉 All templates seeded successfully!
```

---

## 🧪 STEP 7: TESTING

### 7.1 Start Server

```bash
cd giaobanbv-be
npm start
```

**Expected console output:**

```
[SocketService] ✅ Initialized
[NotificationService] Loaded 12 templates into cache
Server is running on port 8080
```

### 7.2 Test REST APIs with curl/Postman

**Get auth token first (login):**

```bash
curl -X POST http://localhost:8080/api/user/login \
  -H "Content-Type: application/json" \
  -d '{"UserName": "your_username", "PassWord": "your_password"}'
```

**Get notifications:**

```bash
curl -X GET http://localhost:8080/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get unread count:**

```bash
curl -X GET http://localhost:8080/api/notifications/unread-count \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Send test notification:**

```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**Get settings:**

```bash
curl -X GET http://localhost:8080/api/notifications/settings \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 7.3 Test Socket.IO Connection

**Create test file:** `giaobanbv-be/test-socket.js`

```javascript
const { io } = require("socket.io-client");

const TOKEN = "YOUR_JWT_TOKEN_HERE";

const socket = io("http://localhost:8080", {
  auth: { token: TOKEN },
});

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO");
  console.log("Socket ID:", socket.id);
});

socket.on("notification:new", (data) => {
  console.log("📬 New notification:", data);
});

socket.on("notification:count", (data) => {
  console.log("🔢 Unread count:", data.count);
});

socket.on("connect_error", (error) => {
  console.error("❌ Connection error:", error.message);
});

socket.on("disconnect", () => {
  console.log("Disconnected");
});

// Keep script running
setTimeout(() => {
  console.log("Test complete. Press Ctrl+C to exit.");
}, 60000);
```

**Run test:**

```bash
node test-socket.js
```

**In another terminal, send test notification:**

```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Expected output in test-socket.js:**

```
✅ Connected to Socket.IO
Socket ID: abc123...
📬 New notification: { notification: { ... } }
🔢 Unread count: 1
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Socket.IO not connecting

**Symptoms:** Client can't connect, `connect_error` fired

**Solutions:**

```javascript
// 1. Check CORS origins in socketService.js
cors: {
  origin: ["http://localhost:3000"], // Add your frontend URL
  credentials: true
}

// 2. Check JWT_SECRET matches in .env
JWT_SECRET=same_secret_as_auth

// 3. Check token format
auth: { token: TOKEN } // NOT Bearer TOKEN
```

### Issue 2: Templates not loading

**Symptoms:** Notifications not sending, template not found error

**Solutions:**

```bash
# 1. Check templates exist in DB
mongo
use your_database
db.notificationtemplates.find().count() # Should be > 0

# 2. Re-run seed
npm run seed:notifications

# 3. Check template type matches exactly (case-sensitive)
type: "TASK_ASSIGNED" # Must match when calling send()
```

### Issue 3: Notifications not saving

**Symptoms:** send() returns null, no DB record

**Solutions:**

```javascript
// 1. Check recipientId is valid User._id
const user = await User.findById(recipientId); // Should exist

// 2. Check user settings allow this notification
const settings = await UserNotificationSettings.findOne({ userId });
console.log(settings.enableNotifications); // Should be true

// 3. Check console for errors
// Look for "[NotificationService]" logs
```

### Issue 4: Socket events not received

**Symptoms:** Connected but no events received

**Solutions:**

```javascript
// 1. Verify user is in onlineUsers map
socketService.getOnlineUsers(); // Should include userId

// 2. Check userId format matches
socket.userId; // String
recipientId; // Should also be String or converted

// 3. Test emit directly
socketService.emitToUser(userId, "test", { msg: "hello" });
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Dependencies installed (`socket.io`)
- [ ] 3 Models created (Notification, NotificationTemplate, UserNotificationSettings)
- [ ] 2 Services created (socketService, notificationService)
- [ ] bin/www updated with Socket.IO init
- [ ] Controller and Routes created
- [ ] Routes registered in app.js
- [ ] Templates seeded to database
- [ ] Server starts without errors
- [ ] Socket.IO logs "Initialized"
- [ ] Templates loaded into cache
- [ ] REST APIs return correct responses
- [ ] Socket connection works with valid token
- [ ] Test notification sends and receives via Socket

---

## 📚 NEXT STEPS

Backend is complete! Continue with:

1. **[03_FRONTEND_IMPLEMENTATION.md](./03_FRONTEND_IMPLEMENTATION.md)** - React components và Redux
2. **[04_FCM_PUSH_SETUP.md](./04_FCM_PUSH_SETUP.md)** - Firebase push notifications
