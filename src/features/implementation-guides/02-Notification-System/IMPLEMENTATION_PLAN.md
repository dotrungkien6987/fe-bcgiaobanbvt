# 📋 Notification System - Implementation Plan

> **Mục đích:** File này chứa kế hoạch triển khai chi tiết để có thể tiếp tục ở các phiên làm việc khác nhau mà không mất ngữ cảnh.

---

## 📊 TỔNG QUAN

### Tài liệu tham chiếu

- `00_QUICK_REFERENCE.md` - Tra cứu nhanh schemas, APIs
- `01_ARCHITECTURE.md` - Kiến trúc hệ thống chi tiết
- `02_BACKEND_IMPLEMENTATION.md` - Code backend đầy đủ
- `03_FRONTEND_IMPLEMENTATION.md` - Code frontend đầy đủ
- `04_FCM_PUSH_SETUP.md` - Setup Firebase Cloud Messaging

### Thống kê files

| Loại      | Backend | Frontend | Tổng   |
| --------- | ------- | -------- | ------ |
| Files xóa | 4       | 0        | **4**  |
| Files mới | 11      | 17       | **28** |
| Files sửa | 4       | 4        | **8**  |
| **Tổng**  | **19**  | **21**   | **40** |

### ⚠️ Cấu trúc thư mục Backend

Notification system mới sẽ đặt trong `modules/workmanagement/`:

```
giaobanbv-be/
├── modules/
│   └── workmanagement/
│       ├── models/
│       │   ├── Notification.js              [NEW - thay thế file cũ]
│       │   ├── NotificationTemplate.js      [NEW]
│       │   └── UserNotificationSettings.js  [NEW]
│       ├── controllers/
│       │   ├── notificationController.js         [NEW]
│       │   └── notificationTemplateController.js [NEW]
│       ├── routes/
│       │   ├── notificationRoutes.js             [NEW]
│       │   └── notificationTemplateRoutes.js     [NEW]
│       └── services/
│           └── notificationService.js       [NEW]
├── services/
│   └── socketService.js                     [NEW - root level vì dùng chung]
├── seeds/
│   └── notificationTemplates.js             [NEW]
└── bin/
    └── www                                  [MODIFY]
```

---

## ✅ PHASE 0: Dọn dẹp Backend (3 files xóa + 4 files sửa)

### Trạng thái: ✅ HOÀN THÀNH

### Files đã XÓA:

| #   | File                                                              | Mô tả                        | Trạng thái |
| --- | ----------------------------------------------------------------- | ---------------------------- | ---------- |
| 1   | `giaobanbv-be/modules/workmanagement/models/Notification.js`      | Model cũ (164 dòng)          | ✅ Đã xóa  |
| 2   | `giaobanbv-be/modules/workmanagement/models/ThongBao.js`          | Model tiếng Việt (281 dòng)  | ✅ Đã xóa  |
| 3   | `giaobanbv-be/modules/workmanagement/models/QuyTacThongBao.js`    | Quy tắc thông báo (329 dòng) | ✅ Đã xóa  |
| 4   | `giaobanbv-be/modules/workmanagement/tests/test_new_structure.js` | File test cũ                 | ✅ Đã xóa  |

### Files đã SỬA:

| #   | File                                                     | Thay đổi                                                | Trạng thái |
| --- | -------------------------------------------------------- | ------------------------------------------------------- | ---------- |
| 1   | `giaobanbv-be/modules/workmanagement/models/index.js`    | Xóa import và export của 3 models                       | ✅ Đã sửa  |
| 2   | `giaobanbv-be/modules/workmanagement/models/BinhLuan.js` | Comment out post-save middleware ThongBao (TODO marker) | ✅ Đã sửa  |
| 3   | `giaobanbv-be/modules/workmanagement/tests/run_tests.js` | Comment out testNewStructure và QuyTacThongBao log      | ✅ Đã sửa  |

### TODO Markers đã thêm:

- `BinhLuan.js` line ~218: `// TODO: [NOTIFICATION_SYSTEM] - Thay thế bằng notificationService.send() khi implement Phase 2`

---

## ✅ PHASE 1: Backend Models (3 files)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 0 hoàn thành ✅

### Files đã tạo:

| #   | File                                                                     | Mô tả                        | Trạng thái |
| --- | ------------------------------------------------------------------------ | ---------------------------- | ---------- |
| 1   | `giaobanbv-be/modules/workmanagement/models/Notification.js`             | Schema thông báo với indexes | ✅ Đã tạo  |
| 2   | `giaobanbv-be/modules/workmanagement/models/NotificationTemplate.js`     | Schema mẫu với 6 fields mới  | ✅ Đã tạo  |
| 3   | `giaobanbv-be/modules/workmanagement/models/UserNotificationSettings.js` | Schema cài đặt với methods   | ✅ Đã tạo  |

### Files đã sửa:

| #   | File                                                  | Thay đổi                           | Trạng thái |
| --- | ----------------------------------------------------- | ---------------------------------- | ---------- |
| 1   | `giaobanbv-be/modules/workmanagement/models/index.js` | Thêm import và export 3 models mới | ✅ Đã sửa  |

---

## ✅ PHASE 2: Backend Services (2 files + 1 dependency)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 1 hoàn thành ✅

### Files đã tạo:

| #   | File                                                                  | Mô tả                                 | Trạng thái |
| --- | --------------------------------------------------------------------- | ------------------------------------- | ---------- |
| 1   | `giaobanbv-be/services/socketService.js`                              | Socket.IO service (ROOT - dùng chung) | ✅ Đã tạo  |
| 2   | `giaobanbv-be/modules/workmanagement/services/notificationService.js` | Main service với auto-create template | ✅ Đã tạo  |

### Dependencies đã cài:

| Package     | Version | Trạng thái |
| ----------- | ------- | ---------- |
| `socket.io` | ^4.8.x  | ✅ Đã cài  |

---

## ✅ PHASE 3: Backend Socket.IO Setup (1 file modify)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 2 hoàn thành ✅

### Files đã sửa:

| #   | File                   | Thay đổi                                         | Trạng thái |
| --- | ---------------------- | ------------------------------------------------ | ---------- |
| 1   | `giaobanbv-be/bin/www` | Thêm Socket.IO init và notificationService setup | ✅ Đã sửa  |

### Verification:

```
✅ [SocketService] Initialized
```

---

## ✅ PHASE 4: Backend Controllers & Routes (4 files + 1 modify)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 3 hoàn thành ✅

### Files đã tạo:

| #   | File                                                                                | Mô tả                          | Trạng thái |
| --- | ----------------------------------------------------------------------------------- | ------------------------------ | ---------- |
| 1   | `giaobanbv-be/modules/workmanagement/controllers/notificationController.js`         | REST API handlers (10 methods) | ✅ Đã tạo  |
| 2   | `giaobanbv-be/modules/workmanagement/controllers/notificationTemplateController.js` | Admin CRUD (7 methods)         | ✅ Đã tạo  |
| 3   | `giaobanbv-be/modules/workmanagement/routes/notificationRoutes.js`                  | User routes                    | ✅ Đã tạo  |
| 4   | `giaobanbv-be/modules/workmanagement/routes/notificationTemplateRoutes.js`          | Admin routes                   | ✅ Đã tạo  |

### Files đã sửa:

| #   | File                  | Thay đổi                   | Trạng thái |
| --- | --------------------- | -------------------------- | ---------- |
| 1   | `giaobanbv-be/app.js` | Thêm 2 notification routes | ✅ Đã sửa  |

### API Endpoints:

**User Routes (`/api/notifications`):**

- `GET /` - Lấy danh sách thông báo
- `GET /unread-count` - Đếm chưa đọc
- `GET /settings` - Lấy cài đặt
- `PUT /settings` - Cập nhật cài đặt
- `POST /settings/fcm-token` - Lưu FCM token
- `DELETE /settings/fcm-token` - Xóa FCM token
- `PUT /read-all` - Đánh dấu tất cả đã đọc
- `PUT /:id/read` - Đánh dấu đã đọc
- `DELETE /:id` - Xóa thông báo
- `POST /test` - Test notification (DEV)

**Admin Routes (`/api/workmanagement/notifications/templates`):**

- `GET /` - Danh sách templates
- `GET /:id` - Chi tiết template
- `POST /` - Tạo template
- `PUT /:id` - Cập nhật template
- `DELETE /:id` - Vô hiệu hóa template (soft disable)
- `POST /:id/preview` - Preview render template

**Admin Tools (`/api/workmanagement/notifications`):**

- `POST /test-send` - Thực gửi notification
- `POST /clear-cache` - Clear cache types/templates

---

## 🎯 PHASE 5: Backend Seed Data (1 file)

### Trạng thái: ⬜ Chưa bắt đầu

### Phụ thuộc: Phase 1 hoàn thành (có thể làm song song với Phase 2-4)

## ✅ PHASE 5: Backend Seed Data (1 file + 1 modify)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 1 hoàn thành ✅

### Files đã tạo:

| #   | File                                          | Mô tả                     | Trạng thái |
| --- | --------------------------------------------- | ------------------------- | ---------- |
| 1   | `giaobanbv-be/seeds/notificationTemplates.js` | 12 templates với category | ✅ Đã tạo  |

### Files đã sửa:

| #   | File                        | Thay đổi                         | Trạng thái |
| --- | --------------------------- | -------------------------------- | ---------- |
| 1   | `giaobanbv-be/package.json` | Thêm script "seed:notifications" | ✅ Đã sửa  |

### Templates đã seed:

| Category   | Templates                                                                                                               |
| ---------- | ----------------------------------------------------------------------------------------------------------------------- |
| task (7)   | TASK_ASSIGNED, TASK_STATUS_CHANGED, TASK_APPROVED, TASK_REJECTED, COMMENT_ADDED, DEADLINE_APPROACHING, DEADLINE_OVERDUE |
| kpi (2)    | KPI_CYCLE_STARTED, KPI_EVALUATED                                                                                        |
| ticket (2) | TICKET_CREATED, TICKET_RESOLVED                                                                                         |
| system (1) | SYSTEM_ANNOUNCEMENT                                                                                                     |

### Verification:

```
✅ Connected to MongoDB
✅ 12 templates seeded/updated
```

---

## ✅ PHASE 6: Frontend Core - Socket & Redux (3 files + 1 modify)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Backend Phases 1-4 hoàn thành ✅

### Dependencies đã cài:

| Package            | Version | Trạng thái |
| ------------------ | ------- | ---------- |
| `socket.io-client` | ^4.8.x  | ✅ Đã cài  |

### Files đã tạo:

| #   | File                                                             | Mô tả                                | Trạng thái |
| --- | ---------------------------------------------------------------- | ------------------------------------ | ---------- |
| 1   | `fe-bcgiaobanbvt/src/contexts/SocketContext.js`                  | Socket.IO context với auto-reconnect | ✅ Đã tạo  |
| 2   | `fe-bcgiaobanbvt/src/features/Notification/notificationSlice.js` | Redux slice với thunks               | ✅ Đã tạo  |
| 3   | `fe-bcgiaobanbvt/src/features/Notification/index.js`             | Export barrel                        | ✅ Đã tạo  |

### Files đã sửa:

| #   | File                               | Thay đổi                                          | Trạng thái |
| --- | ---------------------------------- | ------------------------------------------------- | ---------- |
| 1   | `fe-bcgiaobanbvt/src/app/store.js` | Import & thêm notificationReducer vào rootReducer | ✅ Đã sửa  |

### Verification:

```javascript
// Trong browser console
store.getState().notification;
// Expect: { isLoading: false, notifications: [], unreadCount: 0, ... }
```

---

## ✅ PHASE 7: Frontend Components (5 files)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 6 hoàn thành ✅

### Files đã tạo:

| #   | File                                                                | Mô tả                    | Trạng thái |
| --- | ------------------------------------------------------------------- | ------------------------ | ---------- |
| 1   | `fe-bcgiaobanbvt/src/features/Notification/NotificationBell.js`     | Icon với badge + socket  | ✅ Đã tạo  |
| 2   | `fe-bcgiaobanbvt/src/features/Notification/NotificationItem.js`     | Single notification item | ✅ Đã tạo  |
| 3   | `fe-bcgiaobanbvt/src/features/Notification/NotificationDropdown.js` | Desktop dropdown         | ✅ Đã tạo  |
| 4   | `fe-bcgiaobanbvt/src/features/Notification/NotificationDrawer.js`   | Mobile drawer            | ✅ Đã tạo  |
| 5   | `fe-bcgiaobanbvt/src/features/Notification/NotificationSettings.js` | Settings component       | ✅ Đã tạo  |

### Files đã sửa:

| #   | File                                                 | Thay đổi                              | Trạng thái |
| --- | ---------------------------------------------------- | ------------------------------------- | ---------- |
| 1   | `fe-bcgiaobanbvt/src/features/Notification/index.js` | Uncomment và export tất cả components | ✅ Đã sửa  |

### Verification:

- Import NotificationBell vào một component
- Kiểm tra hiển thị badge và dropdown/drawer

---

## ✅ PHASE 8: Frontend Pages & Integration (1 file + 3 modify)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 7 hoàn thành ✅

### Files đã tạo:

| #   | File                                            | Mô tả                   | Trạng thái |
| --- | ----------------------------------------------- | ----------------------- | ---------- |
| 1   | `fe-bcgiaobanbvt/src/pages/NotificationPage.js` | Full page notifications | ✅ Đã tạo  |

### Files đã sửa:

| #   | File                                        | Thay đổi                                     | Trạng thái |
| --- | ------------------------------------------- | -------------------------------------------- | ---------- |
| 1   | `fe-bcgiaobanbvt/src/layouts/MainHeader.js` | Import + thêm NotificationBell trước Person  | ✅ Đã sửa  |
| 2   | `fe-bcgiaobanbvt/src/routes/index.js`       | Thêm routes /thong-bao và /cai-dat/thong-bao | ✅ Đã sửa  |
| 3   | `fe-bcgiaobanbvt/src/App.js`                | Wrap với SocketProvider                      | ✅ Đã sửa  |

### Routes đã thêm:

| Route                | Component            | Mô tả           |
| -------------------- | -------------------- | --------------- |
| `/thong-bao`         | NotificationPage     | Trang danh sách |
| `/cai-dat/thong-bao` | NotificationSettings | Trang cài đặt   |

### TODO cho FCM (optional):

- `src/hooks/usePushNotification.js` - FCM permission và token handling (Phase 10+)

### Verification:

- Chạy frontend, đăng nhập
- Kiểm tra NotificationBell hiển thị ở header
- Click bell → dropdown mở
- Navigate đến /thong-bao

---

## ✅ PHASE 9: Frontend Admin UI (6 files + 2 modify)

### Trạng thái: ✅ HOÀN THÀNH

### Phụ thuộc: Phase 6 hoàn thành ✅

### Files đã tạo:

| #   | File                                                                           | Mô tả                     | Trạng thái |
| --- | ------------------------------------------------------------------------------ | ------------------------- | ---------- |
| 1   | `fe-bcgiaobanbvt/src/features/Notification/Admin/notificationTemplateSlice.js` | Admin Redux slice         | ✅ Đã tạo  |
| 2   | `fe-bcgiaobanbvt/src/features/Notification/Admin/NotificationTemplateTable.js` | Template list với filters | ✅ Đã tạo  |
| 3   | `fe-bcgiaobanbvt/src/features/Notification/Admin/NotificationTemplateForm.js`  | Create/Edit form          | ✅ Đã tạo  |
| 4   | `fe-bcgiaobanbvt/src/features/Notification/Admin/NotificationTemplateTest.js`  | Test dialog               | ✅ Đã tạo  |
| 5   | `fe-bcgiaobanbvt/src/features/Notification/Admin/index.js`                     | Export barrel             | ✅ Đã tạo  |
| 6   | `fe-bcgiaobanbvt/src/pages/NotificationAdminPage.js`                           | Admin page container      | ✅ Đã tạo  |

### Files đã sửa:

| #   | File                                  | Thay đổi                                  | Trạng thái |
| --- | ------------------------------------- | ----------------------------------------- | ---------- |
| 1   | `fe-bcgiaobanbvt/src/app/store.js`    | Import + thêm notificationTemplateReducer | ✅ Đã sửa  |
| 2   | `fe-bcgiaobanbvt/src/routes/index.js` | Thêm route /admin/notification-templates  | ✅ Đã sửa  |

### Routes đã thêm:

| Route                           | Component             | Mô tả             |
| ------------------------------- | --------------------- | ----------------- |
| `/admin/notification-templates` | NotificationAdminPage | Quản lý templates |

### Verification:

- Đăng nhập với admin account
- Navigate đến /admin/notification-templates
- Kiểm tra table load data
- Test create/edit/test functions

---

## ✅ PHASE 10: App Integration & SocketProvider (1 modify)

### Trạng thái: ✅ HOÀN THÀNH (Đã làm trong Phase 8)

### Phụ thuộc: Phase 6 hoàn thành ✅

### Files đã sửa:

| #   | File                         | Thay đổi                | Trạng thái |
| --- | ---------------------------- | ----------------------- | ---------- |
| 1   | `fe-bcgiaobanbvt/src/App.js` | Wrap với SocketProvider | ✅ Đã sửa  |

### Verification:

- Chạy frontend, đăng nhập
- Mở browser console
- Expect log: "[Socket] ✅ Connected"

---

## 🎯 PHASE 11: FCM Push Notifications (Optional)

### Trạng thái: ⬜ Chưa bắt đầu

### Phụ thuộc: All other phases hoàn thành

### Files cần tạo:

| #   | File                                                | Mô tả                  | Độ ưu tiên |
| --- | --------------------------------------------------- | ---------------------- | ---------- |
| 1   | `giaobanbv-be/services/fcmService.js`               | Firebase Admin SDK     | LOW        |
| 2   | `giaobanbv-be/config/firebase-service-account.json` | Firebase credentials   | LOW        |
| 3   | `fe-bcgiaobanbvt/src/firebase.js`                   | Firebase client config | LOW        |
| 4   | `fe-bcgiaobanbvt/public/firebase-messaging-sw.js`   | FCM service worker     | LOW        |

### Prompt để tiếp tục:

```
Implement Phase 11: FCM Push Notifications.

Tham chiếu: src/features/implementation-guides/02-Notification-System/04_FCM_PUSH_SETUP.md

Đây là phase optional. Hệ thống notification vẫn hoạt động đầy đủ với Socket.IO mà không cần FCM.

FCM chỉ cần khi muốn gửi push notification đến thiết bị khi user offline.

Tạo:
1. Backend: fcmService.js + firebase config
2. Frontend: firebase.js + service worker

Copy code từ file 04_FCM_PUSH_SETUP.md
```

---

## 📊 DEPENDENCY GRAPH

```
Phase 1 (Models)
    │
    ├──► Phase 2 (Services)
    │        │
    │        └──► Phase 3 (bin/www)
    │                 │
    │                 └──► Phase 4 (Controllers & Routes)
    │                          │
    │                          └──► Phase 6 (Frontend Core)
    │                                   │
    │                                   ├──► Phase 7 (Components)
    │                                   │        │
    │                                   │        └──► Phase 8 (Pages & Integration)
    │                                   │
    │                                   ├──► Phase 9 (Admin UI)
    │                                   │
    │                                   └──► Phase 10 (App SocketProvider)
    │
    └──► Phase 5 (Seed Data) [parallel]

Phase 11 (FCM) ──► Optional, after all phases
```

---

## ✅ PROGRESS TRACKER

Cập nhật trạng thái sau mỗi phase:

| Phase | Mô tả                | Trạng thái | Ngày hoàn thành |
| ----- | -------------------- | ---------- | --------------- |
| 1     | Backend Models       | ⬜         | -               |
| 2     | Backend Services     | ⬜         | -               |
| 3     | bin/www Setup        | ⬜         | -               |
| 4     | Controllers & Routes | ⬜         | -               |
| 5     | Seed Data            | ⬜         | -               |
| 6     | Frontend Core        | ⬜         | -               |
| 7     | Frontend Components  | ⬜         | -               |
| 8     | Pages & Integration  | ⬜         | -               |
| 9     | Admin UI             | ⬜         | -               |
| 10    | App SocketProvider   | ⬜         | -               |
| 11    | FCM (Optional)       | ⬜         | -               |

**Legend:**

- ⬜ Chưa bắt đầu
- 🔄 Đang thực hiện
- ✅ Hoàn thành
- ❌ Có lỗi cần fix

---

## 🔧 TROUBLESHOOTING QUICK REFERENCE

### Backend không start

```bash
# Check models syntax
node -c models/Notification.js
node -c models/NotificationTemplate.js
node -c models/UserNotificationSettings.js
```

### Socket.IO không connect

```javascript
// Check token format
auth: { token: TOKEN } // NOT "Bearer TOKEN"

// Check CORS
CORS_ORIGINS=http://localhost:3000
```

### Templates không load

```bash
# Run seed
npm run seed:notifications

# Check DB
mongo
db.notificationtemplates.find().count()
```

### Frontend không nhận notification

```javascript
// Check socket connected
console.log(socket.connected);

// Check Redux state
store.getState().notification;
```

---

## 📚 FILES REFERENCE

### Backend (giaobanbv-be/)

```
models/
├── Notification.js              [Phase 1]
├── NotificationTemplate.js      [Phase 1]
└── UserNotificationSettings.js  [Phase 1]

services/
├── socketService.js             [Phase 2]
├── notificationService.js       [Phase 2]
└── fcmService.js                [Phase 11 - Optional]

controllers/
├── notificationController.js         [Phase 4]
└── notificationTemplateController.js [Phase 4]

routes/
├── notificationRoutes.js             [Phase 4]
└── notificationTemplateRoutes.js     [Phase 4]

seeds/
└── notificationTemplates.js     [Phase 5]

bin/
└── www                          [Phase 3 - Modify]

config/
└── firebase-service-account.json [Phase 11 - Optional]

app.js                           [Phase 4 - Modify]
package.json                     [Phase 5 - Modify]
```

### Frontend (fe-bcgiaobanbvt/src/)

```
contexts/
└── SocketContext.js             [Phase 6]

features/Notification/
├── index.js                     [Phase 6]
├── notificationSlice.js         [Phase 6]
├── NotificationBell.js          [Phase 7]
├── NotificationItem.js          [Phase 7]
├── NotificationDropdown.js      [Phase 7]
├── NotificationDrawer.js        [Phase 7]
├── NotificationSettings.js      [Phase 7]
└── Admin/
    ├── notificationTemplateSlice.js    [Phase 9]
    ├── NotificationTemplateTable.js    [Phase 9]
    ├── NotificationTemplateForm.js     [Phase 9]
    └── NotificationTemplateTest.js     [Phase 9]

pages/
├── NotificationPage.js          [Phase 8]
└── NotificationAdminPage.js     [Phase 9]

hooks/
└── usePushNotification.js       [Phase 8]

app/
└── store.js                     [Phase 6, 9 - Modify]

layouts/
└── MainHeader.js                [Phase 8 - Modify]

routes/
└── Router.js                    [Phase 8, 9 - Modify]

App.js                           [Phase 10 - Modify]
firebase.js                      [Phase 11 - Optional]

public/
└── firebase-messaging-sw.js     [Phase 11 - Optional]
```

---

**Last Updated:** November 27, 2025
**Version:** 1.0
