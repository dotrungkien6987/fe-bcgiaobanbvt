# 📘 PHẦN 16: HỆ THỐNG THÔNG BÁO & FCM (PUSH NOTIFICATIONS)

> **📌 TRẠNG THÁI HIỆN TẠI:**
>
> ```
> ╔══════════════════════════════════════════════════════════════════════╗
> ║  ✅ PHASE 1 (ĐANG HOẠT ĐỘNG): Socket.IO Real-time Notifications    ║
> ║     → Thông báo in-app khi user đang mở app                        ║
> ║     → NotificationBell component, toast, badge                      ║
> ║     → Admin quản lý template, loại thông báo                        ║
> ║                                                                     ║
> ║  ⏳ PHASE 2 (CHƯA TRIỂN KHAI): Firebase Cloud Messaging (FCM)      ║
> ║     → Push notifications khi app đóng/offline                       ║
> ║     → Cần cài firebase SDK, tạo firebase-messaging-sw.js           ║
> ║     → Feature flag ENABLE_PUSH_NOTIFICATIONS hiện = false           ║
> ╚══════════════════════════════════════════════════════════════════════╝
> ```

---

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu hệ thống thông báo hiện tại (Socket.IO) đang hoạt động thế nào
- ✅ Biết cách verify thông báo real-time sau deploy
- ✅ Hiểu kiến trúc sẵn sàng cho FCM Phase 2
- ✅ Biết các bước cần làm khi muốn triển khai FCM
- ✅ Nắm được các stub/infrastructure đã chuẩn bị sẵn trong codebase

---

## ✅ PHẦN A: HỆ THỐNG THÔNG BÁO HIỆN TẠI (SOCKET.IO)

### **A.1 — Kiến trúc tổng quan:**

```
╔══════════════════════════════════════════════════════════════╗
║  NOTIFICATION FLOW HIỆN TẠI                                  ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [Business Logic]                                            ║
║  VD: Tạo yêu cầu, chuyển trạng thái công việc               ║
║       ↓                                                      ║
║  [notificationService.send()]                                ║
║  • Load template từ DB (NotificationTemplate)                ║
║  • Xác định recipients (NotificationType config)             ║
║  • Render template với {{biến}}                              ║
║  • Lưu Notification document vào MongoDB                     ║
║       ↓                                                      ║
║  [socketService.sendToUser(userId, event, data)]             ║
║  • Emit "new-notification" qua Socket.IO                     ║
║  • Gửi đến tất cả tab/device đang kết nối của user          ║
║       ↓                                                      ║
║  [Frontend: SocketProvider nhận event]                       ║
║  • Redux dispatch: addNotification()                         ║
║  • Cập nhật badge count trên NotificationBell                ║
║  • Toast notification popup                                  ║
║                                                              ║
║  ✅ Hoạt động khi user đang mở app                           ║
║  ❌ KHÔNG nhận được khi app đóng (cần FCM Phase 2)           ║
╚══════════════════════════════════════════════════════════════╝
```

### **A.2 — Thành phần trong codebase:**

#### **Backend:**

| File                                                                | Chức năng                                                   |
| ------------------------------------------------------------------- | ----------------------------------------------------------- |
| `services/socketService.js`                                         | Socket.IO server singleton, JWT auth, user rooms, emit      |
| `modules/workmanagement/services/notificationService.js`            | Template engine, recipient resolution, lưu DB + emit        |
| `modules/workmanagement/models/Notification.js`                     | Schema: recipientId, type, title, body, isRead, TTL 30 ngày |
| `modules/workmanagement/models/NotificationType.js`                 | Loại thông báo (admin quản lý)                              |
| `modules/workmanagement/models/NotificationTemplate.js`             | Template với `{{biến}}`                                     |
| `modules/workmanagement/models/UserNotificationSettings.js`         | Cài đặt cá nhân, quiet hours, type toggles                  |
| `modules/workmanagement/controllers/notificationController.js`      | API: getAll, markAsRead, delete, getUnreadCount             |
| `modules/workmanagement/controllers/notificationAdminController.js` | Admin CRUD: types, templates                                |

#### **Frontend:**

| File                                                                  | Chức năng                                           |
| --------------------------------------------------------------------- | --------------------------------------------------- |
| `src/contexts/SocketProvider.js`                                      | Context wrap app, auto connect/disconnect, JWT auth |
| `src/hooks/useSocket.js`                                              | Hook: socket, connected, emit, on, off              |
| `features/QuanLyCongViec/ThongBao/notificationSlice.js`               | Redux: CRUD, unreadCount, markAsRead, realtime add  |
| `features/QuanLyCongViec/ThongBao/components/NotificationBell.js`     | Bell icon + badge + dropdown/drawer                 |
| `features/QuanLyCongViec/ThongBao/components/NotificationItem.js`     | Render từng thông báo                               |
| `features/QuanLyCongViec/ThongBao/components/NotificationSettings.js` | Cài đặt thông báo user                              |
| Admin: `NotificationTypeTable`, `NotificationTemplateTable`, Forms    | Quản trị loại & template                            |

### **A.3 — Verify thông báo sau deploy:**

#### **Backend — Kiểm tra Socket.IO:**

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Kiểm tra backend đang chạy
pm2 list
# → backend: online ✅

# Kiểm tra logs Socket.IO
pm2 logs backend --lines 50
# Tìm dòng: "Socket.IO server initialized"
# Khi user connect: "User connected: userId"
```

#### **Frontend — Kiểm tra kết nối:**

```
1. Mở Chrome → https://hospital.vn
2. Đăng nhập
3. DevTools (F12) → Console

   Tìm log:
   ✅ "Socket connected"
   ✅ "[Socket] Authenticated: userId"

4. DevTools → Network tab → WS (WebSocket filter)
   ✅ Thấy connection đến /socket.io/
   ✅ Status: 101 Switching Protocols
   ✅ Messages đang ping/pong

5. Kiểm tra NotificationBell:
   ✅ Icon chuông hiện trên header
   ✅ Badge hiện số thông báo chưa đọc (nếu có)
   ✅ Click → Dropdown/Drawer mở danh sách thông báo
```

#### **Test end-to-end:**

```
1. Mở 2 tab Chrome với 2 tài khoản khác nhau

2. Tab A: Tạo yêu cầu mới (hoặc chuyển trạng thái công việc)
   → Action này trigger notificationService.send()

3. Tab B (người nhận):
   ✅ Badge trên chuông tăng lên
   ✅ Toast notification popup
   ✅ Click chuông → Thấy thông báo mới trong list

4. Tab B: Click thông báo → Navigate đến URL liên quan ✅
5. Tab B: Đánh dấu đã đọc → Badge giảm ✅
```

### **A.4 — Socket.IO cho từng phương án deploy:**

#### 🔵 Phase 1 — Cloudflare Tunnel:

```
Cloudflare Tunnel tự động hỗ trợ WebSocket
→ Không cần config thêm
→ Socket.IO sẽ kết nối trực tiếp qua tunnel

Nếu WebSocket bị block (hiếm):
→ Socket.IO tự động fallback sang HTTP long-polling
→ Vẫn hoạt động, chỉ chậm hơn một chút
```

#### 🟢 Phase 2 — Nginx (Máy C: 192.168.1.250):

```nginx
# ⚠️ QUAN TRỌNG: Nginx phải được config cho WebSocket
# File: /etc/nginx/sites-available/api.hospital.vn

# Socket.IO endpoint
location /socket.io/ {
    proxy_pass http://192.168.1.243:8000;

    # WebSocket upgrade headers (BẮT BUỘC)
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;

    # Timeout dài cho WebSocket persistent connection
    proxy_connect_timeout 7d;
    proxy_send_timeout 7d;
    proxy_read_timeout 7d;
}
```

```bash
# Test sau khi config:
sudo nginx -t
sudo systemctl reload nginx

# Verify từ browser:
# DevTools → Network → WS → Phải thấy connection /socket.io/ ✅
```

---

## ⏳ PHẦN B: FCM — PUSH NOTIFICATIONS (PHASE 2 — CHƯA TRIỂN KHAI)

> **⚠️ CẢNH BÁO:**
>
> Phần dưới đây là **hướng dẫn cho tương lai**. Firebase Cloud Messaging
> hiện **CHƯA được cài đặt** trong dự án. Các bước bên dưới chỉ thực hiện
> khi có nhu cầu gửi notification đến user **khi app đã đóng**.

### **B.1 — Tại sao cần FCM?**

```
╔══════════════════════════════════════════════════════════════╗
║  SO SÁNH SOCKET.IO vs FCM                                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  Socket.IO (hiện tại):                                       ║
║  ✅ Real-time khi app đang mở                                ║
║  ✅ Không cần third-party service                            ║
║  ✅ Dễ triển khai, đã hoạt động                              ║
║  ❌ User đóng tab/app → KHÔNG nhận được                      ║
║                                                              ║
║  FCM (Phase 2):                                              ║
║  ✅ Push khi app đóng (OS-level notification)                ║
║  ✅ Hoạt động trên cả mobile và desktop                      ║
║  ❌ Cần Firebase project + config                            ║
║  ❌ Phụ thuộc Google Cloud                                   ║
║  ❌ Cần firebase-messaging-sw.js riêng                       ║
║                                                              ║
║  KẾT LUẬN: FCM bổ sung cho Socket.IO, không thay thế        ║
╚══════════════════════════════════════════════════════════════╝
```

### **B.2 — Infrastructure đã chuẩn bị sẵn trong codebase:**

Dù FCM chưa cài, codebase đã có sẵn "khung sườn" chờ kích hoạt:

| Stub               | Vị trí                                  | Mô tả                                             |
| ------------------ | --------------------------------------- | ------------------------------------------------- |
| Feature flag       | Frontend `.env`                         | `ENABLE_PUSH_NOTIFICATIONS=false` (mặc định)      |
| Push event handler | `public/service-worker.js` dòng 246-296 | `push` + `notificationclick` listeners (sẵn sàng) |
| FCM token field    | `UserNotificationSettings` model        | `fcmTokens` array field trong schema              |
| Save token thunk   | `notificationSlice.js`                  | `saveFcmToken()` Redux thunk (chưa gọi)           |
| `gcm_sender_id`    | `public/manifest.json`                  | `"103953800507"` (giá trị mặc định FCM)           |

### **B.3 — Các bước triển khai FCM (khi sẵn sàng):**

#### **BƯỚC 1: Tạo Firebase Project**

```
1. Truy cập: https://console.firebase.google.com/

2. Click "Add project"

3. Project name: bcgiaobanbvt-prod
   (hoặc tên phù hợp với bệnh viện)

4. Google Analytics: Enable (khuyến nghị)

5. Click "Create project" → Chờ 30 giây

6. Firebase Console → Build → Cloud Messaging → Enable

7. Web Push certificates → Generate key pair
   → GHI LẠI VAPID KEY: BNxXXXX...
```

#### **BƯỚC 2: Tạo Service Account (cho backend)**

```
Firebase Console → Project settings → Service accounts

1. Click "Generate new private key"
2. Download JSON file
3. GIỮ FILE NÀY AN TOÀN! Chứa private key!

# Upload lên server
scp bcgiaobanbvt-firebase-adminsdk-xxxxx.json \
    youruser@192.168.1.243:~/projects/backend/config/

# Set permissions
ssh youruser@192.168.1.243
chmod 600 ~/projects/backend/config/bcgiaobanbvt-firebase-adminsdk-xxxxx.json
```

#### **BƯỚC 3: Frontend — Cài Firebase SDK**

```bash
cd ~/projects/frontend
npm install firebase
```

**Tạo file `src/config/firebase.js`:**

```javascript
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });
      console.log("FCM Token:", token);
      return token;
    }
    return null;
  } catch (error) {
    console.error("Error getting FCM token:", error);
    return null;
  }
};

// Foreground message listener
export const onForegroundMessage = (callback) => {
  onMessage(messaging, callback);
};

export { messaging };
```

#### **BƯỚC 4: Frontend — Tạo `firebase-messaging-sw.js`**

```bash
nano ~/projects/frontend/public/firebase-messaging-sw.js
```

```javascript
// Firebase Messaging Service Worker
// File NÀY phải nằm trong public/ folder

importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "YOUR_API_KEY",
  authDomain: "bcgiaobanbvt-prod.firebaseapp.com",
  projectId: "bcgiaobanbvt-prod",
  storageBucket: "bcgiaobanbvt-prod.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("[firebase-messaging-sw] Background message:", payload);

  self.registration.showNotification(
    payload.notification.title || "Thông báo mới",
    {
      body: payload.notification.body,
      icon: "/logoBVTPT.png",
      badge: "/logo64.png",
      data: payload.data,
    },
  );
});
```

#### **BƯỚC 5: Frontend — Update `.env`**

```bash
nano ~/projects/frontend/.env
```

```bash
# Firebase (thêm vào .env)
REACT_APP_FIREBASE_API_KEY=AIzaSyA...
REACT_APP_FIREBASE_AUTH_DOMAIN=bcgiaobanbvt-prod.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=bcgiaobanbvt-prod
REACT_APP_FIREBASE_STORAGE_BUCKET=bcgiaobanbvt-prod.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_VAPID_KEY=BNxXXXX...

# Bật feature flag
ENABLE_PUSH_NOTIFICATIONS=true
```

#### **BƯỚC 6: Backend — Cài Firebase Admin**

```bash
cd ~/projects/backend
npm install firebase-admin
```

**Tạo file `src/config/firebase-admin.js`:**

```javascript
const admin = require("firebase-admin");
const serviceAccount = require("../../config/bcgiaobanbvt-firebase-adminsdk-xxxxx.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const sendPushNotification = async (fcmToken, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    data,
    token: fcmToken,
  };
  return admin.messaging().send(message);
};

const sendMulticast = async (fcmTokens, title, body, data = {}) => {
  const message = {
    notification: { title, body },
    data,
    tokens: fcmTokens,
  };
  return admin.messaging().sendEachForMulticast(message);
};

module.exports = { sendPushNotification, sendMulticast };
```

#### **BƯỚC 7: Backend — Tích hợp vào notificationService**

```javascript
// Trong notificationService.send(), thêm FCM push bên cạnh Socket.IO:

// Socket.IO (đã có)
socketService.sendToUser(recipientUserId, "new-notification", notification);

// FCM push (thêm mới)
if (process.env.ENABLE_PUSH_NOTIFICATIONS === "true") {
  const userSettings = await UserNotificationSettings.findOne({
    NhanVienID: recipientNhanVienId,
  });
  if (userSettings?.fcmTokens?.length > 0) {
    const activeTokens = userSettings.fcmTokens
      .filter((t) => t.IsActive)
      .map((t) => t.Token);
    if (activeTokens.length > 0) {
      await sendMulticast(activeTokens, notification.title, notification.body, {
        url: notification.actionUrl,
        notificationId: notification._id.toString(),
      });
    }
  }
}
```

#### **BƯỚC 8: Build, Deploy & Test**

```bash
# Frontend
cd ~/projects/frontend
npm run build
pm2 restart frontend

# Backend
cd ~/projects/backend
pm2 restart backend
```

```
TEST:
1. Mở https://hospital.vn → Browser hỏi notification permission → Allow
2. Console log: "FCM Token: eXXXXXXX..."
3. Token được gửi đến backend → Lưu vào UserNotificationSettings

4. Test foreground (app đang mở):
   • Trigger action → Toast notification + bell badge ✅

5. Test background (ĐÓNG tab):
   • Trigger action từ tab khác
   • → OS notification popup trên desktop/mobile ✅
   • Click notification → Mở app tại URL đúng ✅

6. Test từ Firebase Console (tùy chọn):
   Firebase Console → Cloud Messaging → "Send your first message"
   → Title: "Test"
   → Body: "Test notification"
   → Target: FCM token
   → Send → Kiểm tra notification ✅
```

---

## 🛠️ TROUBLESHOOTING

### **Socket.IO không kết nối:**

```bash
# Backend: Kiểm tra Socket.IO initialized
pm2 logs backend --lines 100 | grep -i socket

# Frontend: Kiểm tra WebSocket connection
# DevTools → Network → WS filter
# Nếu không thấy → Kiểm tra:
# 1. REACT_APP_API_URL trong .env frontend đúng chưa
# 2. Backend có port đúng không (8000)
# 3. Nginx WebSocket headers (nếu dùng Nginx)
```

### **Thông báo không hiện (Socket.IO đang hoạt động):**

```bash
# 1. Kiểm tra NotificationBell component render:
# DevTools → Elements → Tìm notification bell trong header

# 2. Kiểm tra Redux state:
# DevTools → Redux → State → notification → items

# 3. Kiểm tra notificationService có được gọi:
pm2 logs backend --lines 100 | grep -i notification

# 4. Kiểm tra user có trong recipients:
# Admin → Quản lý thông báo → Templates → Kiểm tra recipient config
```

### **FCM token không register (Phase 2):**

```bash
# 1. Firebase config đúng chưa?
# Console → Kiểm tra Firebase initialization errors

# 2. VAPID key đúng chưa?
# Firebase Console → Cloud Messaging → Web Push certificates

# 3. Service account JSON đúng chưa?
# Backend logs: pm2 logs backend --err

# 4. firebase-messaging-sw.js tồn tại chưa?
ls -la ~/projects/frontend/build/firebase-messaging-sw.js
```

---

## ✅ CHECKLIST

### **Phase 1 — Socket.IO (verify sau deploy):**

```
□ Backend running (pm2 list → online)
□ Socket.IO initialized (kiểm tra logs)
□ Frontend connects (DevTools → WS → /socket.io/)
□ NotificationBell hiện trên header
□ Thông báo real-time hoạt động (test với 2 tabs)
□ Mark as read hoạt động
□ Notification settings page accessible

🟢 Nginx: WebSocket upgrade headers trong nginx config
🔵 CF Tunnel: WebSocket tự động hỗ trợ
```

### **Phase 2 — FCM (khi triển khai):**

```
□ Firebase project đã tạo
□ VAPID key đã lấy
□ Service account JSON đã upload
□ Frontend: firebase package đã cài
□ Frontend: src/config/firebase.js đã tạo
□ Frontend: .env có Firebase credentials
□ Frontend: firebase-messaging-sw.js đã tạo trong public/
□ Backend: firebase-admin đã cài
□ Backend: firebase-admin.js đã config
□ Backend: notificationService tích hợp FCM push
□ Feature flag ENABLE_PUSH_NOTIFICATIONS=true
□ Test foreground notification ✅
□ Test background notification ✅
□ Test notification click → đúng URL ✅
```

---

**⏭️ TIẾP THEO: [17-PWA-TESTING.md](17-PWA-TESTING.md)**
