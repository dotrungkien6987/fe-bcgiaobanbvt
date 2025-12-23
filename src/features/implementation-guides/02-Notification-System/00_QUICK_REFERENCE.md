# 📋 Notification System - Quick Reference

> **Tài liệu tra cứu nhanh** - Tổng hợp tất cả sơ đồ, bảng và thông tin quan trọng

---

## 📊 DATABASE MODELS

### Model 1: Notification

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

---

### Model 2: NotificationTemplate

| Field               | Type          | Required | Default             | Unique | Description                                          |
| ------------------- | ------------- | :------: | ------------------- | :----: | ---------------------------------------------------- |
| `type`              | String        |    ✅    | -                   |   ✅   | Unique identifier, UPPERCASE (e.g., `TASK_ASSIGNED`) |
| `name`              | String        |    ✅    | -                   |   -    | Tên hiển thị cho admin (e.g., "Được giao việc mới")  |
| `description`       | String        |    -     | -                   |   -    | Mô tả chi tiết cho admin                             |
| `titleTemplate`     | String        |    ✅    | -                   |   -    | Template tiêu đề với `{{placeholder}}` syntax        |
| `bodyTemplate`      | String        |    ✅    | -                   |   -    | Template nội dung với `{{placeholder}}` syntax       |
| `icon`              | String        |    -     | `"notification"`    |   -    | Icon name cho frontend                               |
| `defaultChannels`   | [String]      |    -     | `["inapp", "push"]` |   -    | Kênh gửi mặc định                                    |
| `defaultPriority`   | String (enum) |    -     | `"normal"`          |   -    | Độ ưu tiên mặc định                                  |
| `actionUrlTemplate` | String        |    -     | -                   |   -    | Template URL với `{{placeholder}}`                   |
| `isActive`          | Boolean       |    -     | `true`              |   -    | Template có đang active không                        |
| `requiredVariables` | [String]      |    -     | `[]`                |   -    | Danh sách biến bắt buộc khi gọi send()               |
| `category`          | String        |    -     | `"general"`         |   -    | Phân loại: task, kpi, system, etc.                   |
| `isAutoCreated`     | Boolean       |    -     | `false`             |   -    | ⚠️ Template tự động tạo (cần Admin config lại)       |
| `usageCount`        | Number        |    -     | `0`                 |   -    | Số lần đã gửi (thống kê)                             |
| `lastUsedAt`        | Date          |    -     | `null`              |   -    | Lần gửi cuối cùng                                    |
| `createdBy`         | ObjectId      |    -     | `null`              |   -    | Admin tạo template                                   |
| `updatedBy`         | ObjectId      |    -     | `null`              |   -    | Admin sửa cuối cùng                                  |

---

### Model 3: UserNotificationSettings

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

---

## 📊 NOTIFICATION TYPES (18 templates)

| Type                      |    Icon    |  Priority  |  Channels   | Required Variables                                      | Mô tả                        |
| ------------------------- | :--------: | :--------: | :---------: | ------------------------------------------------------- | ---------------------------- |
| `TASK_ASSIGNED`           |  📋 task   |   normal   | inapp, push | `assignerName`, `taskName`, `taskId`                    | Được giao việc mới           |
| `TASK_STATUS_CHANGED`     |  📋 task   |   normal   |    inapp    | `taskName`, `newStatus`, `taskId`                       | (Legacy) Trạng thái thay đổi |
| `TASK_CANCELLED`          | ❌ cancel  |   normal   | inapp, push | `performerName`, `taskName`, `taskId`, `taskCode`       | Hủy giao việc                |
| `TASK_ACCEPTED`           |  ✅ check  |   normal   |    inapp    | `performerName`, `taskName`, `taskId`, `taskCode`       | Tiếp nhận công việc          |
| `TASK_COMPLETED`          |  🎉 check  |   normal   | inapp, push | `performerName`, `taskName`, `taskId`, `taskCode`       | Hoàn thành công việc         |
| `TASK_PENDING_APPROVAL`   | ⏳ pending |   normal   | inapp, push | `performerName`, `taskName`, `taskId`, `taskCode`       | Chờ duyệt hoàn thành         |
| `TASK_REVISION_REQUESTED` | 🔄 refresh | **urgent** | inapp, push | `performerName`, `taskName`, `taskId`, `taskCode`       | Yêu cầu làm lại              |
| `TASK_APPROVED`           |  ✅ check  |   normal   | inapp, push | `approverName`, `taskName`, `taskId`                    | Công việc được duyệt         |
| `TASK_REJECTED`           | ⚠️ warning | **urgent** | inapp, push | `rejecterName`, `taskName`, `taskId`, `reason`          | ⚠️ Từ chối (chưa implement)  |
| `TASK_REOPENED`           | 🔓 unlock  |   normal   | inapp, push | `performerName`, `taskName`, `taskId`, `taskCode`       | Mở lại công việc             |
| `COMMENT_ADDED`           | 💬 comment |   normal   |    inapp    | `commenterName`, `commentPreview`, `taskId`, `taskCode` | Có bình luận mới             |
| `DEADLINE_APPROACHING`    |  ⏰ clock  | **urgent** | inapp, push | `taskName`, `daysLeft`, `taskId`                        | Deadline sắp đến             |
| `DEADLINE_OVERDUE`        | ⚠️ warning | **urgent** | inapp, push | `taskName`, `daysOverdue`, `taskId`                     | Công việc quá hạn            |
| `KPI_CYCLE_STARTED`       |   📊 kpi   |   normal   | inapp, push | `cycleName`, `deadline`                                 | Chu kỳ đánh giá bắt đầu      |
| `KPI_EVALUATED`           |   📊 kpi   |   normal   | inapp, push | `cycleName`, `rating`, `evaluationId`                   | Có kết quả KPI               |
| `KPI_APPROVAL_REVOKED`    | ⚠️ warning | **urgent** | inapp, push | `managerName`, `cycleName`, `reason`, `evaluationId`    | KPI bị hủy duyệt             |
| `TICKET_CREATED`          | 🎫 ticket  |   normal   | inapp, push | `requesterName`, `ticketTitle`, `ticketId`              | Yêu cầu hỗ trợ mới           |
| `TICKET_RESOLVED`         |  ✅ check  |   normal   | inapp, push | `resolverName`, `ticketTitle`, `ticketId`               | Yêu cầu đã xử lý             |
| `SYSTEM_ANNOUNCEMENT`     | 🔔 system  |   normal   | inapp, push | `title`, `message`                                      | Thông báo hệ thống           |

---

## 📊 API ENDPOINTS

### Notification APIs (User)

|  Method  | Endpoint                                | Description                          | Auth |
| :------: | --------------------------------------- | ------------------------------------ | :--: |
|  `GET`   | `/api/notifications`                    | Lấy danh sách thông báo (pagination) |  ✅  |
|  `GET`   | `/api/notifications/unread-count`       | Đếm số chưa đọc                      |  ✅  |
|  `PUT`   | `/api/notifications/:id/read`           | Đánh dấu 1 thông báo đã đọc          |  ✅  |
|  `PUT`   | `/api/notifications/read-all`           | Đánh dấu tất cả đã đọc               |  ✅  |
| `DELETE` | `/api/notifications/:id`                | Xóa 1 thông báo                      |  ✅  |
|  `GET`   | `/api/notifications/settings`           | Lấy cài đặt của user                 |  ✅  |
|  `PUT`   | `/api/notifications/settings`           | Cập nhật cài đặt                     |  ✅  |
|  `POST`  | `/api/notifications/settings/fcm-token` | Lưu FCM token                        |  ✅  |
| `DELETE` | `/api/notifications/settings/fcm-token` | Xóa FCM token                        |  ✅  |
|  `POST`  | `/api/notifications/test`               | Gửi test notification (DEV)          |  ✅  |

### NotificationTemplate APIs (Admin)

|  Method  | Endpoint                                                  | Description                                              | Auth  |
| :------: | --------------------------------------------------------- | -------------------------------------------------------- | :---: |
|  `GET`   | `/api/workmanagement/notifications/templates`             | Lấy danh sách templates (filter `typeCode`, `isEnabled`) | Admin |
|  `GET`   | `/api/workmanagement/notifications/templates/:id`         | Chi tiết 1 template                                      | Admin |
|  `POST`  | `/api/workmanagement/notifications/templates`             | Tạo template mới                                         | Admin |
|  `PUT`   | `/api/workmanagement/notifications/templates/:id`         | Cập nhật template                                        | Admin |
| `DELETE` | `/api/workmanagement/notifications/templates/:id`         | Xóa template (soft delete: `isEnabled=false`)            | Admin |
|  `POST`  | `/api/workmanagement/notifications/templates/:id/preview` | Preview render template                                  | Admin |
|  `POST`  | `/api/workmanagement/notifications/test-send`             | Gửi test notification (thực gửi)                         | Admin |
|  `POST`  | `/api/workmanagement/notifications/clear-cache`           | Xóa cache types/templates                                | Admin |

---

## 📊 SOCKET.IO EVENTS

### Client → Server

| Event                   | Payload              | Description      |
| ----------------------- | -------------------- | ---------------- |
| `notification:read`     | `{ notificationId }` | Mark as read     |
| `notification:read-all` | -                    | Mark all as read |

### Server → Client

| Event                | Payload            | Description              |
| -------------------- | ------------------ | ------------------------ |
| `notification:new`   | `{ notification }` | New notification arrived |
| `notification:count` | `{ count }`        | Unread count updated     |

---

## 📊 ENTITY RELATIONSHIP DIAGRAM

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            NOTIFICATION SYSTEM ERD                           │
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
│  └───────┬───────┘         │ defaultPriority        │         │ type        │
│          │                 │ requiredVariables[]    │         │ matches     │
│          │ 1               └────────────────────────┘         │             │
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

## 📊 NOTIFICATION SEND FLOW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         NOTIFICATION SEND SEQUENCE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Feature              NotificationService      SocketService    FCMService │
│   Controller                                                                 │
│      │                       │                      │               │       │
│      │ 1. send({type,        │                      │               │       │
│      │    recipientId,       │                      │               │       │
│      │    data})             │                      │               │       │
│      │──────────────────────►│                      │               │       │
│      │                       │                      │               │       │
│      │                       │ 2. getTemplate(type) │               │       │
│      │                       │    (from cache/DB)   │               │       │
│      │                       │                      │               │       │
│      │                       │ 3. renderTemplate()  │               │       │
│      │                       │    title, body       │               │       │
│      │                       │                      │               │       │
│      │                       │ 4. getUserSettings() │               │       │
│      │                       │    shouldSend()?     │               │       │
│      │                       │                      │               │       │
│      │                       │ 5. Save to MongoDB   │               │       │
│      │                       │                      │               │       │
│      │                       │ 6. isUserOnline?     │               │       │
│      │                       │───────────────────►  │               │       │
│      │                       │   ◄─────────────────│               │       │
│      │                       │     true/false       │               │       │
│      │                       │                      │               │       │
│      │                       │         ┌───────────┴───────┐       │       │
│      │                       │         │                   │       │       │
│      │                       │    [ONLINE]            [OFFLINE]    │       │
│      │                       │         │                   │       │       │
│      │                       │ 7a. emitToUser()    7b. sendToUser()│       │
│      │                       │─────────►│          ────────────────►│       │
│      │                       │         │                   │       │       │
│      │                       │    Socket.IO           FCM Push      │       │
│      │                       │    (instant)           (via Google)  │       │
│      │                       │         │                   │       │       │
│      │◄──────────────────────│ 8. Return notification              │       │
│      │                       │                                      │       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 PUSH DECISION TREE

```
┌─────────────────────────────────────────────────────────────────┐
│                 SHOULD SEND PUSH NOTIFICATION?                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   START: NotificationService.send()                             │
│                  │                                               │
│                  ▼                                               │
│     ┌────────────────────────────┐                              │
│     │ enableNotifications = true? │                              │
│     └─────────────┬──────────────┘                              │
│                   │                                              │
│         ┌────────┴────────┐                                     │
│         ▼                  ▼                                     │
│       [NO]               [YES]                                   │
│         │                  │                                     │
│         ▼                  ▼                                     │
│    ┌─────────┐    ┌──────────────────┐                          │
│    │ SKIP ALL│    │ User is online?  │                          │
│    └─────────┘    └────────┬─────────┘                          │
│                            │                                     │
│                  ┌─────────┴─────────┐                          │
│                  ▼                   ▼                           │
│             [ONLINE]             [OFFLINE]                       │
│                  │                   │                           │
│                  ▼                   ▼                           │
│          ┌─────────────┐    ┌──────────────────┐                │
│          │ Socket.IO   │    │ enablePush = true? │               │
│          │ (no push)   │    └────────┬─────────┘                │
│          └─────────────┘             │                          │
│                            ┌─────────┴─────────┐                │
│                            ▼                   ▼                 │
│                          [NO]                [YES]               │
│                            │                   │                 │
│                            ▼                   ▼                 │
│                     ┌─────────────┐   ┌──────────────────┐      │
│                     │ SKIP Push   │   │ In quiet hours?  │      │
│                     │ (inapp only)│   └────────┬─────────┘      │
│                     └─────────────┘            │                 │
│                                       ┌────────┴────────┐       │
│                                       ▼                 ▼        │
│                                     [YES]              [NO]      │
│                                       │                 │        │
│                                       ▼                 ▼        │
│                               ┌─────────────┐  ┌─────────────┐  │
│                               │ SKIP Push   │  │ SEND FCM    │  │
│                               └─────────────┘  │ PUSH ✓      │  │
│                                                └─────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 FRONTEND COMPONENT HIERARCHY

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│                          ┌───────┐                               │
│                          │  App  │                               │
│                          └───┬───┘                               │
│                              │                                   │
│                    ┌─────────┼─────────┐                         │
│                    │         │         │                         │
│            ┌───────┴───┐ ┌───┴────┐ ┌──┴────────────┐           │
│            │AuthProvider│ │Socket  │ │Redux Provider │           │
│            └───────┬───┘ │Provider│ └───────────────┘           │
│                    │     └────────┘                              │
│                    ▼                                             │
│            ┌─────────────────┐                                   │
│            │   MainLayout    │                                   │
│            └────────┬────────┘                                   │
│                     │                                            │
│          ┌──────────┼────────────┐                               │
│          │          │            │                               │
│    ┌─────┴─────┐ ┌──┴───┐ ┌─────┴─────┐                         │
│    │  Header   │ │Content│ │  Footer   │                         │
│    └─────┬─────┘ └──┬───┘ └───────────┘                         │
│          │          │                                            │
│    ┌─────┴────────┐ ├───────────────────────┐                   │
│    │NotificationBell│ │                       │                   │
│    └─────┬────────┘ │                       │                   │
│          │          │                       │                   │
│          ▼          ▼                       ▼                   │
│   Desktop:   ┌──────────────────┐  ┌─────────────────────┐      │
│   ┌──────────┤NotificationPage  │  │NotificationSettings │      │
│   │Dropdown  └────────┬─────────┘  └─────────────────────┘      │
│   └────┬─────┐        │                                          │
│        │     │        │                                          │
│   Mobile:    │        │                                          │
│   ┌──────────┤        │                                          │
│   │Drawer    │        │                                          │
│   └────┬─────┘        │                                          │
│        │              │                                          │
│        └──────────────┴──────────────────────┐                  │
│                                              │                  │
│                                              ▼                  │
│                               ┌────────────────────┐            │
│                               │ NotificationItem   │            │
│                               │ (Reusable cho cả 3)│            │
│                               └────────────────────┘            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 REDUX STATE SHAPE

```javascript
// store.getState().notification
{
  isLoading: false,           // Đang tải data?
  error: null,                // Lỗi nếu có
  notifications: [            // Danh sách thông báo
    {
      _id: "6541...",
      type: "TASK_ASSIGNED",
      title: "Công việc mới",
      body: "Nguyễn A đã giao...",
      icon: "task",
      priority: "normal",
      isRead: false,
      actionUrl: "/quan-ly-cong-viec/chi-tiet/123",
      createdAt: "2025-11-26T08:30:00Z"
    }
  ],
  unreadCount: 5,             // Số thông báo chưa đọc
  pagination: {
    page: 1,
    limit: 20,
    total: 45,
    totalPages: 3
  },
  settings: {                 // Cài đặt của user
    enableNotifications: true,
    enablePush: true,
    quietHours: { enabled: false, start: "22:00", end: "07:00" },
    typePreferences: {}
  },
  availableTypes: []          // Danh sách loại notification từ server
}
```

---

## 📊 FILES TO CREATE

### Backend Files (11 files)

|  #  | File                                | Location       | Description                              |
| :-: | ----------------------------------- | -------------- | ---------------------------------------- |
|  1  | `Notification.js`                   | `models/`      | Schema thông báo                         |
|  2  | `NotificationTemplate.js`           | `models/`      | Schema mẫu thông báo (với fields mới)    |
|  3  | `UserNotificationSettings.js`       | `models/`      | Schema cài đặt user                      |
|  4  | `socketService.js`                  | `services/`    | Socket.IO service                        |
|  5  | `notificationService.js`            | `services/`    | Main service + **Auto-create template**  |
|  6  | `fcmService.js`                     | `services/`    | FCM push service (optional)              |
|  7  | `notificationController.js`         | `controllers/` | REST API cho notifications               |
|  8  | `notificationTemplateController.js` | `controllers/` | **[MỚI]** CRUD API cho templates (Admin) |
|  9  | `notificationRoutes.js`             | `routes/`      | Routes cho notifications                 |
| 10  | `notificationTemplateRoutes.js`     | `routes/`      | **[MỚI]** Routes cho templates (Admin)   |
| 11  | `notificationTemplates.js`          | `seeds/`       | Seed data 12 templates mẫu               |

### Backend Files to Modify (2 files)

|  #  | File     | Location | Changes                        |
| :-: | -------- | -------- | ------------------------------ |
|  1  | `www`    | `bin/`   | Thêm Socket.IO vào HTTP server |
|  2  | `app.js` | root     | Thêm routes mới vào Express    |

### Frontend Files (17 files)

|  #  | File                           | Location                           | Description                     |
| :-: | ------------------------------ | ---------------------------------- | ------------------------------- |
|  1  | `SocketContext.js`             | `src/contexts/`                    | Socket.IO provider              |
|  2  | `notificationSlice.js`         | `src/features/Notification/`       | Redux state + thunks            |
|  3  | `NotificationItem.js`          | `src/features/Notification/`       | Single item component           |
|  4  | `NotificationDropdown.js`      | `src/features/Notification/`       | Desktop dropdown                |
|  5  | `NotificationDrawer.js`        | `src/features/Notification/`       | Mobile drawer                   |
|  6  | `NotificationBell.js`          | `src/features/Notification/`       | Bell icon + badge               |
|  7  | `NotificationSettings.js`      | `src/features/Notification/`       | Trang cài đặt user              |
|  8  | `index.js`                     | `src/features/Notification/`       | Export all components           |
|  9  | `NotificationTemplateTable.js` | `src/features/Notification/Admin/` | **[MỚI]** Bảng quản lý Admin    |
| 10  | `NotificationTemplateForm.js`  | `src/features/Notification/Admin/` | **[MỚI]** Form tạo/sửa          |
| 11  | `NotificationTemplateTest.js`  | `src/features/Notification/Admin/` | **[MỚI]** Test gửi notification |
| 12  | `notificationTemplateSlice.js` | `src/features/Notification/Admin/` | **[MỚI]** Redux slice Admin     |
| 13  | `NotificationPage.js`          | `src/pages/`                       | Trang danh sách (User)          |
| 14  | `NotificationAdminPage.js`     | `src/pages/`                       | **[MỚI]** Trang Admin           |
| 15  | `firebase.js`                  | `src/`                             | Firebase config                 |
| 16  | `usePushNotification.js`       | `src/hooks/`                       | Push notification hook          |
| 17  | `firebase-messaging-sw.js`     | `public/`                          | FCM service worker              |

### Frontend Files to Modify (4 files)

|  #  | File            | Location       | Changes                         |
| :-: | --------------- | -------------- | ------------------------------- |
|  1  | `App.js`        | `src/`         | Thêm SocketProvider             |
|  2  | `store.js`      | `src/app/`     | Thêm notification slices        |
|  3  | `MainHeader.js` | `src/layouts/` | Thêm NotificationBell           |
|  4  | `Router.js`     | `src/routes/`  | Thêm routes notifications/admin |

---

## ⚠️ CRITICAL WARNINGS

### 1. User.\_id vs NhanVien.\_id

```javascript
// ✅ CORRECT - Use User._id for recipientId
const user = await User.findOne({ NhanVienID: nhanVienId });
await notificationService.send({
  type: "TASK_ASSIGNED",
  recipientId: user._id,  // ← User._id
  data: { ... }
});

// ❌ WRONG - Do NOT use NhanVien._id
await notificationService.send({
  type: "TASK_ASSIGNED",
  recipientId: nhanVienId,  // ← WRONG! This is NhanVien._id
  data: { ... }
});
```

### 2. Redux Pattern

```javascript
// ✅ CORRECT - Manual thunks pattern (project standard)
export const getNotifications = (params) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/notifications", { params });
    dispatch(slice.actions.getNotificationsSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// ❌ WRONG - Do NOT use createAsyncThunk
// export const getNotifications = createAsyncThunk(...) // NOT USED in this project
```

### 3. Socket Token Format

```javascript
// ✅ CORRECT - Token in auth object
const socket = io(SOCKET_URL, {
  auth: { token: accessToken }, // ← Just token, no Bearer
});

// ❌ WRONG - Bearer prefix
const socket = io(SOCKET_URL, {
  auth: { token: `Bearer ${accessToken}` }, // ← WRONG!
});
```

---

## 🆕 AUTO-CREATE TEMPLATE FEATURE

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    AUTO-CREATE TEMPLATE FLOW                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   Developer gọi:                                                             │
│   notificationService.send({                                                │
│     type: "CUSTOM_NEW_TYPE",   ← Type chưa có trong DB                      │
│     recipientId: user._id,                                                   │
│     data: { field1: "value1" }                                              │
│   })                                                                         │
│              │                                                               │
│              ▼                                                               │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │  NotificationService.send()                                          │   │
│   │                                                                      │   │
│   │  1. let template = await getTemplate("CUSTOM_NEW_TYPE")              │   │
│   │                                                                      │   │
│   │  2. if (!template) {                                                 │   │
│   │       template = await NotificationTemplate.create({                 │   │
│   │         type: "CUSTOM_NEW_TYPE",                                     │   │
│   │         name: "Custom New Type",     ← Format từ type                │   │
│   │         titleTemplate: "🔔 Thông báo mới",                           │   │
│   │         bodyTemplate: "Bạn có thông báo: CUSTOM_NEW_TYPE",          │   │
│   │         isAutoCreated: true,         ← ⚠️ Đánh dấu cần config       │   │
│   │         requiredVariables: ["field1"]                                │   │
│   │       });                                                            │   │
│   │       console.warn("Auto-created template: CUSTOM_NEW_TYPE");       │   │
│   │     }                                                                │   │
│   │                                                                      │   │
│   │  3. Tiếp tục render và gửi notification như bình thường             │   │
│   │                                                                      │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│              │                                                               │
│              ▼                                                               │
│   Notification được gửi (dù nội dung chưa đẹp)                              │
│              │                                                               │
│              ▼                                                               │
│   Admin vào trang quản lý → Thấy template có ⚠️ isAutoCreated              │
│   → Chỉnh sửa titleTemplate, bodyTemplate cho phù hợp                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🔧 ADMIN UI COMPONENTS

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ADMIN UI MOCKUP                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌───────────────────────────────────────────────────────────────────────┐ │
│   │  🔔 Quản lý Notification Templates                      [+ Thêm mới]  │ │
│   ├───────────────────────────────────────────────────────────────────────┤ │
│   │                                                                        │ │
│   │  🔍 Tìm kiếm: [________________]    📂 Category: [All ▼]              │ │
│   │                                                                        │ │
│   │  ┌─────────────────────────────────────────────────────────────────┐  │ │
│   │  │ Type              │ Tên            │ Priority │ Active│ Actions │  │ │
│   │  ├───────────────────┼────────────────┼──────────┼───────┼─────────┤  │ │
│   │  │ TASK_ASSIGNED     │ Giao việc mới  │ normal   │  ✅   │ ✏️ 🧪 🗑️│  │ │
│   │  │ TASK_REJECTED     │ Từ chối CV     │ urgent   │  ✅   │ ✏️ 🧪 🗑️│  │ │
│   │  │ ⚠️ NEW_CUSTOM     │ New Custom     │ normal   │  ✅   │ ✏️ 🧪 🗑️│  │ │
│   │  │   (auto-created)  │                │          │       │         │  │ │
│   │  └─────────────────────────────────────────────────────────────────┘  │ │
│   │                                                                        │ │
│   │  📊 Thống kê: 12 templates | 3 auto-created cần config                │ │
│   │                                                                        │ │
│   └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│   Actions:                                                                   │
│   • ✏️ Edit - Mở form chỉnh sửa template                                    │
│   • 🧪 Test - Gửi notification test đến chính mình                         │
│   • 🗑️ Delete - Soft delete (isActive = false)                              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 DIRECTORY STRUCTURE (COMPLETE)

```
giaobanbv-be/
├── bin/
│   └── www                              [MODIFY] +Socket.IO
├── config/
│   └── firebase-service-account.json    [NEW] FCM credentials (gitignored)
├── models/
│   ├── Notification.js                  [NEW]
│   ├── NotificationTemplate.js          [NEW] +6 fields mới
│   └── UserNotificationSettings.js      [NEW]
├── services/
│   ├── socketService.js                 [NEW]
│   ├── notificationService.js           [NEW] +auto-create
│   └── fcmService.js                    [NEW] optional
├── controllers/
│   ├── notificationController.js        [NEW]
│   └── notificationTemplateController.js[NEW] Admin CRUD
├── routes/
│   ├── notificationRoutes.js            [NEW]
│   └── notificationTemplateRoutes.js    [NEW] Admin routes
├── seeds/
│   └── notificationTemplates.js         [NEW]
└── app.js                               [MODIFY] +routes

fe-bcgiaobanbvt/
├── public/
│   └── firebase-messaging-sw.js         [NEW]
└── src/
    ├── contexts/
    │   └── SocketContext.js             [NEW]
    ├── features/
    │   └── Notification/
    │       ├── notificationSlice.js     [NEW]
    │       ├── NotificationBell.js      [NEW]
    │       ├── NotificationItem.js      [NEW]
    │       ├── NotificationDropdown.js  [NEW]
    │       ├── NotificationDrawer.js    [NEW]
    │       ├── NotificationSettings.js  [NEW]
    │       ├── index.js                 [NEW]
    │       └── Admin/
    │           ├── NotificationTemplateTable.js  [NEW]
    │           ├── NotificationTemplateForm.js   [NEW]
    │           ├── NotificationTemplateTest.js   [NEW]
    │           └── notificationTemplateSlice.js  [NEW]
    ├── hooks/
    │   └── usePushNotification.js       [NEW]
    ├── pages/
    │   ├── NotificationPage.js          [NEW]
    │   └── NotificationAdminPage.js     [NEW]
    ├── firebase.js                      [NEW]
    ├── App.js                           [MODIFY] +SocketProvider
    ├── app/
    │   └── store.js                     [MODIFY] +slices
    ├── layouts/
    │   └── MainHeader.js                [MODIFY] +Bell
    └── routes/
        └── Router.js                    [MODIFY] +routes
```

---

## 📚 RELATED DOCUMENTS

| Document                                                         | Description                            |
| ---------------------------------------------------------------- | -------------------------------------- |
| [01_ARCHITECTURE.md](./01_ARCHITECTURE.md)                       | Kiến trúc hệ thống, schemas, API specs |
| [02_BACKEND_IMPLEMENTATION.md](./02_BACKEND_IMPLEMENTATION.md)   | Hướng dẫn implement backend            |
| [03_FRONTEND_IMPLEMENTATION.md](./03_FRONTEND_IMPLEMENTATION.md) | Hướng dẫn implement frontend           |
| [04_FCM_PUSH_SETUP.md](./04_FCM_PUSH_SETUP.md)                   | Setup Firebase Cloud Messaging         |

---

**Last Updated:** November 2025
