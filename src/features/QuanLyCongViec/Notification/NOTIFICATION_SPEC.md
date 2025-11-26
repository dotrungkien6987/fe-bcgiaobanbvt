# 🔔 Notification System - Hệ Thống Thông Báo

**Version:** 1.0 (In Development 🚧)  
**Last Updated:** November 2025  
**Status:** Planning Phase

---

## 📋 Overview

Module **Notification** cung cấp hệ thống thông báo real-time cho người dùng về các sự kiện quan trọng trong module Quản lý công việc (QuanLyCongViec).

### Planned Features

- 🚧 **Real-time Notifications** - WebSocket-based instant delivery
- 🚧 **Notification Center** - Centralized inbox with filters
- 🚧 **Read/Unread Tracking** - Mark as read/unread
- 🚧 **Notification Preferences** - User-configurable settings
- 🚧 **Push Notifications** - Browser push API integration
- 🚧 **Notification History** - Searchable archive

---

## 🏗️ Architecture Overview

### Event-Driven Design

Notification module listens to events from other modules via `workEventEmitter`:

```javascript
// Event registration pattern
workEventEmitter.on("TASK_ASSIGNED", async (eventData) => {
  await notificationService.create({
    type: "TASK_ASSIGNED",
    recipient: eventData.nguoiNhan,
    data: eventData.congViecId,
    message: `Bạn được giao công việc: ${eventData.tenCongViec}`,
  });
});
```

**See:** [../ARCHITECTURE.md](../ARCHITECTURE.md#5-event-system-for-notification) for complete event specifications.

### Tech Stack

- **Backend:** Socket.IO for WebSocket connections
- **Frontend:** Socket.IO Client + Redux for state management
- **Persistence:** MongoDB (ThongBao model)
- **Real-time:** Event emitter pattern for module integration

---

## 🔌 Event Integration (Planned)

### Priority 1 Events (Must Implement)

| Event Type                  | Source Module | Trigger                         | Recipients               |
| --------------------------- | ------------- | ------------------------------- | ------------------------ |
| `TASK_ASSIGNED`             | CongViec      | New task assigned               | Assignee (NguoiThucHien) |
| `TASK_COMPLETED`            | CongViec      | Status → HOAN_THANH             | Creator, Manager         |
| `KPI_APPROVED`              | KPI           | Status → DA_DUYET               | Employee being evaluated |
| `KPI_REJECTED`              | KPI           | Manager rejects self-assessment | Employee                 |
| `ASSIGNMENT_BATCH_COMPLETE` | GiaoNhiemVu   | Batch assign finishes           | Admin who initiated      |
| `COMMENT_MENTION`           | CongViec      | @mention in comment             | Mentioned users          |
| `DEADLINE_WARNING`          | CongViec      | NgayCanhBao reached             | NguoiThucHien            |
| `FILE_UPLOADED`             | CongViec      | New file attached               | All participants         |

### Priority 2 Events (Future)

| Event Type            | Source Module | Trigger                | Recipients             |
| --------------------- | ------------- | ---------------------- | ---------------------- |
| `ASSIGNMENT_CHANGED`  | GiaoNhiemVu   | Task reassigned        | Old + New assignee     |
| `CYCLE_CLOSING_SOON`  | ChuKyDanhGia  | 3 days before end      | All managers           |
| `KPI_SELF_EVAL_DUE`   | KPI           | 5 days before deadline | Employees with pending |
| `TASK_STATUS_CHANGED` | CongViec      | Status transition      | All watchers           |
| `REPLY_TO_COMMENT`    | CongViec      | Reply added            | Original commenter     |

---

## 📊 Data Model (Planned)

```typescript
// ThongBao schema
{
  _id: ObjectId,

  // Core fields
  type: string,                  // Event type (TASK_ASSIGNED, etc.)
  recipientId: ObjectId,         // User._id or NhanVien._id
  message: string,               // Display message (Vietnamese)

  // Related data
  relatedEntity: {
    type: string,                // "CongViec", "DanhGiaKPI", etc.
    id: ObjectId,
    metadata: Object             // Additional context
  },

  // State
  isRead: boolean,               // Default: false
  isArchived: boolean,           // User can archive
  readAt: Date,                  // When marked as read

  // Navigation
  actionUrl: string,             // Frontend route (/congviec/123)
  actionLabel: string,           // "Xem công việc", "Xem đánh giá"

  // System
  createdAt: Date,
  expiresAt: Date               // TTL index (auto-delete after 90 days)
}
```

---

## 🚀 Planned User Workflows

### Workflow 1: Receive Real-time Notification

```
User opens app → WebSocket connects
↓
Task assigned (backend emits event)
↓
Server sends notification via Socket.IO
↓
Frontend: Toast + Badge counter update + Redux state
↓
User clicks bell icon → Notification center opens
↓
Click notification → Navigate to task detail
↓
Mark as read (auto or manual)
```

### Workflow 2: Configure Preferences

```
User → Settings → Notifications
↓
Toggle event types:
  ✅ Task assignments
  ✅ KPI approvals
  ❌ Comments (muted)
↓
Choose channels:
  ✅ In-app
  ✅ Browser push
  ❌ Email (future)
↓
Save preferences → Backend validates → Success
```

---

## 🎨 Planned UI Components

### NotificationBell (App Header)

**Location:** `src/features/QuanLyCongViec/Notification/NotificationBell.js`

**Features:**

- ✅ Badge with unread count (red dot)
- ✅ Dropdown preview (5 recent notifications)
- ✅ "Xem tất cả" link → Notification Center
- ✅ Real-time updates via Socket.IO

### NotificationCenter (Full Page)

**Location:** `src/features/QuanLyCongViec/Notification/NotificationCenter.js`

**Features:**

- ✅ List view with infinite scroll
- ✅ Filters: All / Unread / Archived
- ✅ Search by message/type
- ✅ Bulk actions: Mark all as read, Clear all
- ✅ Date grouping (Hôm nay, Hôm qua, Tuần trước)

### NotificationItem

**Features:**

- ✅ Icon by type (🔔 task, ⭐ KPI, 💬 comment)
- ✅ Bold for unread
- ✅ Relative timestamp ("2 giờ trước")
- ✅ Click → Navigate + Mark as read
- ✅ Context menu: Mark read/Archive/Delete

### NotificationSettings (Dialog)

**Features:**

- ✅ Event type toggles (grouped by module)
- ✅ Sound on/off
- ✅ Browser permission request
- ✅ Do Not Disturb hours (future)

---

## 🔄 Redux State (Planned)

### notificationSlice

**Location:** `src/features/QuanLyCongViec/Notification/notificationSlice.js`

**State Shape:**

```javascript
{
  notifications: [],            // Array of notification objects
  unreadCount: 0,               // Badge counter
  hasMore: true,                // Infinite scroll flag
  filters: {
    type: "all",                // all | unread | archived
    search: ""
  },
  settings: {
    enabledEvents: {
      TASK_ASSIGNED: true,
      KPI_APPROVED: true,
      COMMENT_MENTION: true,
      // ... other events
    },
    enableSound: true,
    enableBrowserPush: false
  },
  isLoading: false,
  error: null
}
```

**Key Actions:**

- `getNotifications(page, filters)` - Load with pagination
- `markAsRead(id)` - Single notification
- `markAllAsRead()` - Bulk operation
- `archiveNotification(id)` - Hide from list
- `updateSettings(settings)` - Save preferences
- `receiveRealtimeNotification(data)` - Socket.IO listener

---

## 🔌 API Reference (Planned)

### 1. Get Notifications

```http
GET /api/workmanagement/notifications

Query Params:
  ?page=1&limit=20
  &type=unread            # all | unread | archived
  &eventType=TASK_ASSIGNED

Response:
{
  "success": true,
  "data": {
    "notifications": [ ... ],
    "pagination": {
      "page": 1,
      "totalPages": 5,
      "totalItems": 87
    }
  }
}
```

### 2. Mark as Read

```http
PUT /api/workmanagement/notifications/:id/read

Response:
{
  "success": true,
  "data": { ...updated notification... },
  "message": "Đã đánh dấu đã đọc"
}
```

### 3. Mark All as Read

```http
PUT /api/workmanagement/notifications/mark-all-read

Response:
{
  "success": true,
  "data": { updatedCount: 15 },
  "message": "Đã đánh dấu tất cả đã đọc"
}
```

### 4. Update Settings

```http
PUT /api/workmanagement/notifications/settings

Request Body:
{
  "enabledEvents": {
    "TASK_ASSIGNED": true,
    "COMMENT_MENTION": false
  },
  "enableSound": true
}

Response:
{
  "success": true,
  "data": { ...settings... },
  "message": "Cập nhật cài đặt thành công"
}
```

### 5. Socket.IO Events

```javascript
// Client → Server (on connect)
socket.emit("authenticate", { token: jwtToken });

// Server → Client (new notification)
socket.on("notification", (data) => {
  dispatch(receiveRealtimeNotification(data));
  toast.info(data.message);
  playNotificationSound();
});

// Server → Client (broadcast update)
socket.on("notification:read", ({ notificationId, userId }) => {
  // Update local state if needed
});
```

---

## 🧪 Testing Plan

### Unit Tests

- [ ] Event listener registration
- [ ] Notification creation logic
- [ ] Mark as read/unread
- [ ] Settings validation

### Integration Tests

- [ ] End-to-end flow: Task assign → Notification received
- [ ] WebSocket connection/reconnection
- [ ] Badge counter accuracy
- [ ] Notification persistence

### Manual Testing Scenarios

1. **Real-time Delivery**

   - User A assigns task to User B
   - User B sees toast + badge update instantly
   - User B clicks bell → Notification appears

2. **Offline Handling**

   - User B offline when task assigned
   - User B reconnects → Notification syncs
   - Badge shows correct count

3. **Preference Enforcement**
   - User B disables COMMENT_MENTION
   - User A @mentions User B
   - User B does NOT receive notification

---

## 🔮 Implementation Roadmap

### Phase 1: Core Infrastructure (2 weeks)

- [ ] Setup Socket.IO server + client
- [ ] Create ThongBao model + CRUD APIs
- [ ] Implement event emitter pattern
- [ ] Basic NotificationBell component
- [ ] Redux slice with real-time updates

### Phase 2: Event Integration (1 week)

- [ ] Integrate 8 Priority 1 events
- [ ] Test each event end-to-end
- [ ] Error handling + retry logic
- [ ] Performance optimization

### Phase 3: UI/UX (1 week)

- [ ] NotificationCenter page
- [ ] Filters + search functionality
- [ ] NotificationSettings dialog
- [ ] Sound effects + animations
- [ ] Mobile responsive design

### Phase 4: Advanced Features (Future)

- [ ] Browser push notifications
- [ ] Email digests
- [ ] Priority 2 events
- [ ] Analytics dashboard
- [ ] Do Not Disturb mode

---

## ⚠️ Technical Considerations

### Scalability

- **Connection Pooling:** Limit concurrent Socket.IO connections per server
- **Redis Pub/Sub:** For multi-server deployments (future)
- **MongoDB TTL Index:** Auto-delete notifications after 90 days

### Security

- **Authentication:** JWT token validation for Socket.IO connections
- **Authorization:** Only send notifications to authorized users
- **Rate Limiting:** Prevent notification spam

### Performance

- **Debouncing:** Batch notifications for bulk operations
- **Caching:** Redis cache for unread counts
- **Lazy Loading:** Infinite scroll for notification list

---

## 📚 Related Documentation

- **Architecture:** [../ARCHITECTURE.md](../ARCHITECTURE.md#6-notification-event-driven-design)
- **Event Specifications:** [../ARCHITECTURE.md](../ARCHITECTURE.md#event-types-and-structure)
- **CongViec Integration:** [../CongViec/docs/architecture-overview.md](../CongViec/docs/architecture-overview.md)

---

## 🐛 Known Risks & Mitigations

| Risk                       | Impact                   | Mitigation                           |
| -------------------------- | ------------------------ | ------------------------------------ |
| Socket.IO connection drops | Users miss notifications | Auto-reconnect + sync on reconnect   |
| Event emitter memory leak  | Server crash             | Proper listener cleanup + monitoring |
| Notification spam          | User annoyance           | Debouncing + user preferences        |
| MongoDB write pressure     | Performance degradation  | Batch inserts + TTL indexes          |

---

## 📝 Developer Notes

### Before Starting Implementation

1. ✅ Review [ARCHITECTURE.md](../ARCHITECTURE.md) for event system design
2. ✅ Study Socket.IO documentation (authentication patterns)
3. ✅ Check existing event emitter in CongViec module
4. ✅ Review user preferences from QuanLyNhanVien module

### Code Guidelines

- Use consistent event naming: `MODULE_ACTION` (e.g., `TASK_ASSIGNED`)
- Always include `metadata` field for debugging
- Log all emitted events in development
- Handle Socket.IO connection errors gracefully
- Write integration tests for each event type

---

**Maintained by:** Development Team  
**Next Review:** After Phase 1 completion  
**Questions:** Contact team lead before starting implementation

---

> **Note:** This is a planning document. Implementation details may change based on technical discoveries and user feedback during development.
