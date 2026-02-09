# 📘 PHẦN 15: SERVICE WORKER — CẤU HÌNH PWA

> **📌 MỤC ĐÍCH:**
>
> Hướng dẫn verify và tùy chỉnh Service Worker cho ứng dụng PWA.
> **Dự án đã có sẵn** service worker và file đăng ký — phần này giúp bạn hiểu cơ chế hoạt động
> và kiểm tra sau khi deploy.

---

## 🎯 MỤC TIÊU

Sau phần này bạn sẽ:

- ✅ Hiểu Service Worker là gì và vai trò trong PWA
- ✅ Hiểu cơ chế đăng ký SW đã có trong dự án
- ✅ Hiểu caching strategies đang sử dụng
- ✅ Verify SW hoạt động đúng sau deploy
- ✅ Biết cách update version và debug
- ✅ Hiểu push notification handlers (Phase 2 — chưa kích hoạt)

---

## 🔧 SERVICE WORKER LÀ GÌ?

```
Service Worker = JavaScript chạy nền (background)
               = Proxy giữa app và network
               = Enable offline, push notifications, background sync

╔══════════════════════════════════════════════════════════════╗
║  KHÔNG CÓ SERVICE WORKER:                                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [App] ──────────→ [Network] ──────────→ [Server]            ║
║                                                              ║
║  • Offline = không hoạt động ❌                              ║
║  • Không cache                                               ║
║  • Không push notifications                                  ║
╚══════════════════════════════════════════════════════════════╝

╔══════════════════════════════════════════════════════════════╗
║  CÓ SERVICE WORKER (dự án hiện tại ✅):                      ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  [App] → [Service Worker] → [Network] → [Server]            ║
║             ↕                                                ║
║         [Cache Storage]                                      ║
║                                                              ║
║  • Static assets → Cache First (nhanh) ✅                    ║
║  • API calls → Network First (luôn fresh data) ✅            ║
║  • Offline → Trả về cached index.html ✅                     ║
║  • Push notifications → Có handler, chờ Phase 2 ⏳           ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 📂 CẤU TRÚC FILE HIỆN TẠI TRONG DỰ ÁN

```
fe-bcgiaobanbvt/
├── public/
│   ├── service-worker.js          ← SW chính (327 dòng, custom)
│   ├── manifest.json              ← PWA manifest
│   ├── logoBVTPT.png              ← Icon 192x192 & 512x512
│   ├── logo64.png                 ← Icon 64x64
│   ├── logo128.png                ← Icon 128x128
│   ├── logo256.png                ← Icon 256x256
│   └── favicon.ico
│
├── src/
│   ├── serviceWorkerRegistration.js  ← Helper đăng ký SW (228 dòng)
│   └── index.js                      ← Gọi register() tại đây
│
└── ❌ KHÔNG CÓ:
    ├── firebase-messaging-sw.js   (chưa triển khai FCM)
    └── offline.html               (dùng cached index.html thay thế)
```

> **⚠️ LƯU Ý QUAN TRỌNG:**
>
> - Dự án dùng **custom Service Worker** (KHÔNG phải CRA default workbox-based SW)
> - File `firebase-messaging-sw.js` **CHƯA tồn tại** — FCM là Phase 2
> - Offline fallback dùng **cached `/index.html`** (SPA), không dùng `offline.html` riêng

---

## 🔍 BƯỚC 1: HIỂU SERVICE WORKER CỦA DỰ ÁN

### **1.1 — File `public/service-worker.js`**

Đây là file SW chính, đã có sẵn trong source code:

```javascript
// Version hiện tại
const CACHE_NAME = "hospital-pwa-v0.1.0";
const API_CACHE_NAME = "hospital-api-v0.1.0";

// Static assets được cache khi install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/logoBVTPT.png",
];

// API endpoints có thể cache (hiện tại đang comment out)
const API_ROUTES_TO_CACHE = [
  // Uncomment khi muốn cache API responses:
  // "/api/user/me",
  // "/api/khoa",
  // "/api/nhanvien/datafix",
];
```

### **1.2 — Caching Strategies:**

| Strategy          | Áp dụng cho                          | Cách hoạt động                                                     |
| ----------------- | ------------------------------------ | ------------------------------------------------------------------ |
| **Cache First**   | Static assets (JS, CSS, ảnh, HTML)   | Kiểm tra cache trước → nếu không có → fetch từ network → cache lại |
| **Network First** | API calls (`/api/*`)                 | Fetch từ network trước → nếu fail → fallback cache                 |
| **Skip**          | Non-GET requests (POST, PUT, DELETE) | Đi thẳng ra network, không qua SW                                  |

### **1.3 — Offline Behavior:**

```
Khi offline:

1. Navigation (truy cập trang):
   → Trả về cached /index.html
   → React SPA xử lý routing phía client

2. API calls:
   → Trả về JSON error:
   {
     "success": false,
     "message": "Không có kết nối mạng. Vui lòng kiểm tra internet.",
     "offline": true
   }

3. Static assets (JS/CSS/ảnh):
   → Trả về từ cache (nếu đã cache)
   → Nếu chưa cache → Response 503: "Không có kết nối mạng"
```

---

## 🔗 BƯỚC 2: HIỂU CƠ CHẾ ĐĂNG KÝ SERVICE WORKER

### **2.1 — File `src/serviceWorkerRegistration.js` (228 dòng)**

File này là helper đăng ký SW, dựa trên pattern CRA nhưng đã customize:

```javascript
// ❗ CHỈ đăng ký trong PRODUCTION mode
export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // Đăng ký service-worker.js
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;
    registerValidSW(swUrl, config);
  }
}
```

**Điểm quan trọng:**

- **Production only**: SW KHÔNG chạy trong `npm start` (development)
- Cung cấp 2 callback: `onSuccess` và `onUpdate`
- Có helper: `requestNotificationPermission()`, `isNotificationEnabled()`

### **2.2 — Cách gọi trong `src/index.js`:**

```javascript
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// Đăng ký SW với callbacks
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log("✅ Service Worker registered successfully!");
    console.log("📦 App is now available offline");

    // 🔔 Xin quyền notification sau 2 giây (không làm phiền ngay)
    setTimeout(() => {
      serviceWorkerRegistration.requestNotificationPermission();
    }, 2000);
  },

  onUpdate: (registration) => {
    console.log("🔄 New version available!");
    // ➊ Hiển thị banner xanh thông báo đang cập nhật
    const updateMessage = document.createElement("div");
    updateMessage.innerHTML = "🔄 Đang cập nhật phiên bản mới...";
    updateMessage.style.cssText =
      "position:fixed;top:0;left:0;right:0;background:#1976d2;" +
      "color:white;text-align:center;padding:12px;z-index:99999;" +
      "font-size:14px;font-family:sans-serif;";
    document.body.prepend(updateMessage);

    // ➋ Kích hoạt SW mới
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    // ➌ Auto reload sau 800ms
    setTimeout(() => window.location.reload(), 800);
  },
});
```

### **2.3 — Flow update version:**

```
╔══════════════════════════════════════════════════════════════╗
║  FLOW CẬP NHẬT SERVICE WORKER                               ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. Deploy build mới (npm run build → PM2 restart)           ║
║     ↓                                                        ║
║  2. User mở app → Browser check service-worker.js            ║
║     ↓                                                        ║
║  3. Browser so sánh byte-by-byte với SW đang active           ║
║     ↓                                                        ║
║  4. Nếu khác → Install SW mới (chạy song song)              ║
║     ↓                                                        ║
║  5. SW mới gọi self.skipWaiting() → Active ngay              ║
║     ↓                                                        ║
║  6. onUpdate callback kích hoạt:                             ║
║     • Hiện banner xanh "🔄 Đang cập nhật phiên bản mới..."  ║
║     • postMessage({ type: 'SKIP_WAITING' })                 ║
║     • Auto reload sau 800ms                                  ║
║     ↓                                                        ║
║  7. User thấy app mới ✅                                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### **2.4 — Notification Permission Flow:**

```
╔══════════════════════════════════════════════════════════════╗
║  FLOW XIN QUYỀN NOTIFICATION                                ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  1. SW đăng ký thành công (onSuccess)                        ║
║     ↓                                                        ║
║  2. Chờ 2 giây (không làm phiền ngay)                       ║
║     ↓                                                        ║
║  3. Gọi requestNotificationPermission()                      ║
║     ↓                                                        ║
║  4. Browser hiện popup "Cho phép thông báo?"                 ║
║     ↓                                                        ║
║  5a. User chọn "Allow" →                                     ║
║      Hiện test notification:                                 ║
║      "🏥 Thông báo đã được bật!"                             ║
║      "Bạn sẽ nhận được thông báo từ hệ thống BC Bệnh viện"  ║
║      (Icon: logoBVTPT.png, tự đóng sau 5 giây)              ║
║                                                              ║
║  5b. User chọn "Block" → Log cảnh báo, không hỏi lại        ║
║                                                              ║
║  ⚠️ LƯU Ý: Quyền này hiện dùng cho Socket.IO in-app         ║
║     notifications. Push notification (FCM) chưa triển khai.  ║
╚══════════════════════════════════════════════════════════════╝
```

---

## 🧪 BƯỚC 3: VERIFY SAU KHI DEPLOY

### **3.1 — Kiểm tra trên server:**

```bash
# SSH vào server
ssh youruser@192.168.1.243

# Verify service-worker.js có trong build
ls -la ~/projects/frontend/build/service-worker.js

# Verify manifest.json
cat ~/projects/frontend/build/manifest.json | head -5
# Output: { "short_name": "BC Bệnh viện", ...

# Verify icons
ls -la ~/projects/frontend/build/logoBVTPT.png
ls -la ~/projects/frontend/build/logo192.png

# Test serve hoạt động
curl -I http://localhost:3000/service-worker.js
# Output:
# HTTP/1.1 200 OK
# Content-Type: application/javascript
```

### **3.2 — Kiểm tra trong browser:**

> ⚠️ **SW chỉ hoạt động qua HTTPS** (hoặc localhost). Phải test qua domain thật.

#### 🔵 Phase 1 — Qua Cloudflare Tunnel:

```
1. Mở Chrome → https://hospital.vn

2. DevTools (F12) → Application tab → Service Workers

   Kiểm tra:
   ✅ Source:    service-worker.js
   ✅ Status:    activated and is running
   ✅ Clients:   https://hospital.vn/ (1)

3. Application → Cache Storage
   ✅ hospital-pwa-v0.1.0 → Chứa:
      • /
      • /index.html
      • /manifest.json
      • /favicon.ico
      • /logo192.png
      • /logo512.png
      • /logoBVTPT.png

4. Application → Manifest
   ✅ Name:        Báo cáo Giaoban - Bệnh viện Đa khoa Tỉnh Phú Thọ
   ✅ Short name:  BC Bệnh viện
   ✅ Display:     standalone
   ✅ Theme color: #1976d2
   ✅ Icons:       192x192, 512x512 (logoBVTPT.png)
```

#### 🟢 Phase 2 — Qua Nginx (Máy C: 192.168.1.250):

```
1. Mở Chrome → https://hospital.vn (qua Nginx)

   ⚠️ Nginx phải trả đúng Content-Type cho service-worker.js

2. Kiểm tra giống Phase 1 ở trên

3. Nếu SW không đăng ký, kiểm tra Nginx config:
   # File: /etc/nginx/sites-available/hospital.vn

   # Đảm bảo có MIME type cho .js
   location ~* \.(js|css|png|jpg|ico|json)$ {
       proxy_pass http://192.168.1.243:3000;
       expires 1y;
       add_header Cache-Control "public, immutable";
   }

   # ⚠️ QUAN TRỌNG: Service Worker KHÔNG được cache
   location = /service-worker.js {
       proxy_pass http://192.168.1.243:3000;
       expires off;
       add_header Cache-Control "no-store, no-cache, must-revalidate";
   }
```

### **3.3 — Test offline:**

```
1. DevTools → Application → Service Workers → ✅ đang active

2. DevTools → Network tab → ☑️ Offline (tick checkbox)

3. Reload page (Ctrl+R):
   ✅ App vẫn hiển thị (từ cached index.html)
   ✅ Logo, CSS, JS load bình thường (từ cache)

4. Thử click menu/navigate:
   ✅ SPA routing vẫn hoạt động (React Router)
   ❌ API calls sẽ hiện lỗi "Không có kết nối mạng"
      → Đây là behavior đúng!

5. Bỏ tick ☑️ Offline → Reload → App hoạt động bình thường ✅
```

### **3.4 — Test console logs:**

```javascript
// Mở Console (F12) → Console tab
// Khi app load lần đầu (production):

[Service Worker] Installing version: hospital-pwa-v0.1.0
[Service Worker] Caching static assets
[Service Worker] ✅ Installed successfully
[Service Worker] Activating...
[Service Worker] ✅ Activated successfully
✅ Service Worker registered successfully!
📦 App is now available offline
[PWA] Notification permission: granted  // (nếu user cho phép)
```

---

## 🔄 BƯỚC 4: CẬP NHẬT VERSION SERVICE WORKER

Khi deploy bản mới, **cần tăng version** trong `service-worker.js` để browser nhận diện có update:

### **4.1 — Sửa version:**

```bash
# SSH vào server (hoặc sửa trên máy dev rồi push code)
cd ~/projects/frontend

# Sửa version trong service-worker.js
nano public/service-worker.js
```

```javascript
// Thay đổi version:
const CACHE_NAME = "hospital-pwa-v0.2.0"; // ← Tăng version
const API_CACHE_NAME = "hospital-api-v0.2.0"; // ← Tăng version tương ứng
```

### **4.2 — Build và deploy:**

```bash
npm run build
pm2 restart frontend
```

### **4.3 — Kết quả khi user truy cập:**

```
User mở app → Browser phát hiện SW mới →

╔═══════════════════════════════════════════════════════════╗
║  🔄 Đang cập nhật phiên bản mới...                       ║  ← Banner xanh #1976d2
╚═══════════════════════════════════════════════════════════╝

→ Sau 800ms: Auto reload
→ Cache cũ (v0.1.0) bị xóa, cache mới (v0.2.0) được tạo
→ User thấy version mới ✅
```

---

## ⏳ BƯỚC 5: PUSH NOTIFICATION HANDLERS (PHASE 2 — CHƯA KÍCH HOẠT)

> **⚠️ PHẦN NÀY LÀ PLACEHOLDER — CHƯA HOẠT ĐỘNG**
>
> Service worker có sẵn các event listeners cho push notifications,
> nhưng chúng chỉ là "khung sườn" chờ Phase 2 (FCM integration).
> Hiện tại **không có** cơ chế nào push message tới SW.

### **5.1 — Push Handler có sẵn trong SW:**

```javascript
// public/service-worker.js (dòng 246-296)
// ⚠️ Code này có sẵn nhưng CHƯA được trigger bởi bất kỳ service nào

self.addEventListener("push", (event) => {
  // Default notification data (tiếng Việt)
  let notificationData = {
    title: "Thông báo mới",
    body: "Bạn có thông báo mới từ hệ thống",
    icon: "/logo192.png",
    badge: "/logo192.png",
    tag: "hospital-notification",
    data: { url: "/" },
  };
  // ... parse push data, show notification
});

self.addEventListener("notificationclick", (event) => {
  // Đóng notification, mở/focus app tại URL tương ứng
});
```

### **5.2 — Để kích hoạt push notifications (Phase 2):**

Cần thực hiện thêm:

1. Cài `firebase` SDK vào frontend
2. Tạo `public/firebase-messaging-sw.js`
3. Cài `firebase-admin` vào backend
4. Bật feature flag `ENABLE_PUSH_NOTIFICATIONS=true`
5. → Chi tiết xem **File 16-FCM-SETUP.md**

### **5.3 — Hệ thống notification hiện tại (đang hoạt động):**

```
Hiện tại dự án dùng Socket.IO cho real-time notifications:

[Backend notificationService.send()]
        ↓
[Socket.IO emit "new-notification"]
        ↓
[Frontend SocketProvider nhận event]
        ↓
[NotificationBell component cập nhật badge]
        ↓
[Toast notification hiện lên]

✅ Hoạt động khi user đang mở app (online)
❌ KHÔNG hoạt động khi app đóng → Cần FCM Phase 2
```

---

## 🛠️ TROUBLESHOOTING

### **SW không đăng ký:**

```bash
# Nguyên nhân 1: Đang ở development mode
# SW chỉ đăng ký trong production!
# → Phải build: npm run build → serve build folder

# Nguyên nhân 2: Không phải HTTPS
# SW yêu cầu HTTPS (trừ localhost)
# → Kiểm tra đang truy cập qua https://

# Nguyên nhân 3: service-worker.js không tồn tại trong build
ls -la ~/projects/frontend/build/service-worker.js
# Nếu không có → build lại: npm run build
```

### **Cache không update sau deploy:**

```bash
# Nguyên nhân: Chưa tăng version trong service-worker.js
# → Sửa CACHE_NAME thành version mới
# → Build lại: npm run build && pm2 restart frontend

# Force clear cache từ browser:
# DevTools → Application → Storage → Clear site data
```

### **Offline không hoạt động:**

```bash
# Kiểm tra SW đã active chưa:
# DevTools → Application → Service Workers → Status phải là "activated"

# Kiểm tra cache có đủ file:
# DevTools → Application → Cache Storage → hospital-pwa-v0.1.0
# Phải có: /, /index.html, /manifest.json, icons...

# Nếu cache trống:
# → Unregister SW → Reload → SW sẽ install lại và cache
```

### **Notification permission bị block:**

```
Nếu user đã chọn "Block":
→ Không thể hỏi lại bằng code
→ User phải tự sửa trong browser settings:

Chrome: Settings → Privacy and security → Site settings
  → Notifications → Tìm hospital.vn → Allow

Hoặc: Click icon 🔒 bên trái URL → Notifications → Allow
```

### **🟢 Nginx: SW không update (cache quá mạnh):**

```nginx
# ⚠️ Nginx mặc định có thể cache service-worker.js
# Điều này khiến user không nhận được SW mới!

# Fix: Thêm vào nginx config:
location = /service-worker.js {
    proxy_pass http://192.168.1.243:3000;
    expires off;
    add_header Cache-Control "no-store, no-cache, must-revalidate";
    add_header Pragma "no-cache";
}
```

---

## ✅ CHECKLIST HOÀN THÀNH

```
VERIFY FILES:
✅ public/service-worker.js có trong source code
✅ src/serviceWorkerRegistration.js có trong source code
✅ src/index.js gọi serviceWorkerRegistration.register()
✅ public/manifest.json đầy đủ thông tin PWA

SAU KHI DEPLOY:
□ Build thành công (npm run build)
□ service-worker.js có trong build/ folder
□ PM2 restart frontend
□ Truy cập qua HTTPS → SW đăng ký thành công
□ DevTools → Service Workers → activated and running ✅
□ Cache Storage có hospital-pwa-v0.1.0 với đủ files ✅
□ Test offline: App vẫn hiển thị ✅
□ Notification permission popup xuất hiện ✅
□ Update flow: Banner xanh + auto reload hoạt động ✅

TRẠNG THÁI HIỆN TẠI:
✅ Static caching (Cache First)     — Hoạt động
✅ API handling (Network First)     — Hoạt động
✅ Offline fallback (cached HTML)   — Hoạt động
✅ Auto update (banner + reload)    — Hoạt động
✅ Notification permission request  — Hoạt động
⏳ Push notifications (FCM)         — Phase 2 (chưa triển khai)
⏳ Background sync                  — Phase 2 (chưa triển khai)
⏳ API response caching             — Tùy chọn (API_ROUTES_TO_CACHE đang trống)

→ Tiếp tục: File 16-FCM-SETUP.md (Phase 2 — Push Notifications)
```

---

**⏭️ TIẾP THEO: [16-FCM-SETUP.md](16-FCM-SETUP.md)**
