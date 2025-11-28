# 📱 Hướng dẫn toàn diện về PWA - BC Bệnh Viện Phú Thọ

> **Tài liệu này giúp bạn hiểu sâu về PWA, cách hoạt động và xử lý sự cố**

---

## 📋 Mục lục

1. [PWA là gì?](#1-pwa-là-gì)
2. [Kiến trúc PWA trong dự án](#2-kiến-trúc-pwa-trong-dự-án)
3. [Service Worker - Trái tim của PWA](#3-service-worker---trái-tim-của-pwa)
4. [Chiến lược Cache](#4-chiến-lược-cache)
5. [Quy trình cập nhật ứng dụng](#5-quy-trình-cập-nhật-ứng-dụng)
6. [Push Notifications](#6-push-notifications)
7. [Xử lý sự cố thường gặp](#7-xử-lý-sự-cố-thường-gặp)
8. [FAQ - Câu hỏi thường gặp](#8-faq---câu-hỏi-thường-gặp)
9. [Hướng dẫn cho IT Support](#9-hướng-dẫn-cho-it-support)

---

## 1. PWA là gì?

### 🎯 Định nghĩa đơn giản

```
┌─────────────────────────────────────────────────────────────────┐
│                    PWA = Progressive Web App                     │
│                                                                  │
│   Website + Khả năng hoạt động như ứng dụng native              │
│                                                                  │
│   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐        │
│   │   Website    │ + │   Offline    │ + │    Push      │        │
│   │   thông thường│   │   Support    │   │ Notification │        │
│   └──────────────┘   └──────────────┘   └──────────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

### ✨ Lợi ích của PWA

| Tính năng          | Mô tả                          | Ứng dụng trong BC BV               |
| ------------------ | ------------------------------ | ---------------------------------- |
| 🔌 **Offline**     | Hoạt động không cần internet   | Xem báo cáo đã tải, form nhập liệu |
| ⚡ **Nhanh**       | Tải từ cache, không chờ server | Mở app gần như tức thì             |
| 📲 **Cài đặt**     | Thêm vào màn hình chính        | Mở như app native                  |
| 🔔 **Thông báo**   | Push notification real-time    | Thông báo ca trực, sự cố           |
| 🔄 **Tự cập nhật** | Update ngầm, không cần store   | Deploy = user nhận bản mới         |

---

## 2. Kiến trúc PWA trong dự án

### 📁 Các file quan trọng

```
fe-bcgiaobanbvt/
├── public/
│   ├── manifest.json          ← Cấu hình PWA (tên, icon, màu)
│   ├── service-worker.js      ← SW chính (cache, fetch, push)
│   ├── favicon.ico            ← Icon 32x32
│   ├── logo64.png             ← Icon 64x64
│   ├── logo128.png            ← Icon 128x128
│   ├── logo256.png            ← Icon 256x256
│   └── logoBVTPT.png          ← Icon 192x192 & 512x512
│
├── src/
│   ├── index.js               ← Đăng ký Service Worker
│   └── serviceWorkerRegistration.js  ← Logic đăng ký + Notification API
```

### 🔗 Luồng hoạt động tổng quan

```
┌────────────────────────────────────────────────────────────────────┐
│                     LUỒNG HOẠT ĐỘNG PWA                            │
└────────────────────────────────────────────────────────────────────┘

  [Người dùng mở app]
         │
         ▼
  ┌──────────────┐
  │   Browser    │
  │   (Edge)     │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐     ┌─────────────────┐
  │  index.html  │────▶│ Đăng ký SW      │
  └──────────────┘     │ (lần đầu)       │
         │             └────────┬────────┘
         │                      │
         ▼                      ▼
  ┌──────────────┐     ┌─────────────────┐
  │  React App   │     │ Service Worker  │
  │  (bundle.js) │     │ được cài đặt    │
  └──────┬───────┘     └────────┬────────┘
         │                      │
         ▼                      ▼
  ┌──────────────────────────────────────┐
  │        SERVICE WORKER HOẠT ĐỘNG       │
  │                                       │
  │  ┌─────────┐  ┌─────────┐  ┌───────┐ │
  │  │ Cache   │  │ Fetch   │  │ Push  │ │
  │  │ Storage │  │ Handler │  │ Event │ │
  │  └─────────┘  └─────────┘  └───────┘ │
  └──────────────────────────────────────┘
```

---

## 3. Service Worker - Trái tim của PWA

### 🔄 Vòng đời Service Worker

```
┌────────────────────────────────────────────────────────────────────┐
│                   VÒNG ĐỜI SERVICE WORKER                          │
└────────────────────────────────────────────────────────────────────┘

    ┌───────────┐
    │   START   │
    └─────┬─────┘
          │
          ▼
    ┌───────────┐     Tải file service-worker.js
    │ INSTALLING│     và các file cần cache
    └─────┬─────┘
          │
          │ (skipWaiting = true)
          ▼
    ┌───────────┐     SW sẵn sàng nhưng chưa
    │  WAITING  │     kiểm soát trang
    │ (bỏ qua)  │     ← Dự án đang bỏ qua bước này
    └─────┬─────┘
          │
          │ (clients.claim())
          ▼
    ┌───────────┐     SW đang kiểm soát tất cả
    │  ACTIVE   │     các request của trang
    └─────┬─────┘
          │
          │ (có phiên bản mới)
          ▼
    ┌───────────┐
    │ REDUNDANT │     SW cũ bị thay thế
    └───────────┘


    ⚡ DỰ ÁN SỬ DỤNG: skipWaiting() + clients.claim()
    → Service Worker mới NGAY LẬP TỨC kiểm soát trang
    → Không cần người dùng đóng tất cả tab
```

### 📝 Giải thích code service-worker.js

```javascript
// ═══════════════════════════════════════════════════════════════
// FILE: public/service-worker.js
// ═══════════════════════════════════════════════════════════════

// 1️⃣ ĐỊNH NGHĨA CACHE
const CACHE_NAME = "bc-bv-cache-v1"; // Tên cache, đổi version = xóa cache cũ

const urlsToCache = [
  "/", // Trang chủ
  "/index.html", // HTML chính
  "/static/js/bundle.js", // JavaScript
  "/static/css/main.css", // CSS
  "/logoBVTPT.png", // Logo
  "/manifest.json", // Manifest
];

// 2️⃣ SỰ KIỆN INSTALL - Chạy 1 lần khi SW được cài đặt
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache)) // Tải và cache các file
      .then(() => self.skipWaiting()) // Kích hoạt ngay, không chờ
  );
});

// 3️⃣ SỰ KIỆN ACTIVATE - Chạy khi SW được kích hoạt
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName); // Xóa cache cũ
            }
          })
        );
      })
      .then(() => self.clients.claim()) // Kiểm soát tất cả các tab
  );
});

// 4️⃣ SỰ KIỆN FETCH - Xử lý mọi request
self.addEventListener("fetch", (event) => {
  // Logic xử lý request (xem phần Chiến lược Cache)
});

// 5️⃣ SỰ KIỆN PUSH - Nhận push notification
self.addEventListener("push", (event) => {
  const data = event.data?.json() || {};
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: "/logoBVTPT.png",
  });
});
```

---

## 4. Chiến lược Cache

### 🎯 Hai chiến lược chính trong dự án

```
┌────────────────────────────────────────────────────────────────────┐
│                      CHIẾN LƯỢC CACHE                              │
└────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ CACHE FIRST (Static Assets)                                  │
│                                                                  │
│    Request ──▶ Cache ──▶ Có? ──▶ Trả về từ Cache (⚡ Nhanh)     │
│                  │                                               │
│                  ▼                                               │
│                Không có? ──▶ Fetch từ Network ──▶ Lưu Cache     │
│                                                                  │
│    📦 Áp dụng cho: JS, CSS, Images, Fonts                       │
│    ✅ Ưu điểm: Rất nhanh, hoạt động offline                     │
│    ⚠️  Lưu ý: Cần đổi tên file khi update (cache busting)       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣ NETWORK FIRST (API Calls)                                    │
│                                                                  │
│    Request ──▶ Network ──▶ OK? ──▶ Trả về + Lưu Cache          │
│                  │                                               │
│                  ▼                                               │
│               Lỗi/Timeout? ──▶ Trả về từ Cache (fallback)       │
│                                                                  │
│    📦 Áp dụng cho: API /api/*, dữ liệu động                     │
│    ✅ Ưu điểm: Luôn có data mới nhất khi online                 │
│    ✅ Fallback: Vẫn hoạt động khi offline (data cũ)             │
└─────────────────────────────────────────────────────────────────┘
```

### 💻 Code minh họa

```javascript
// CACHE FIRST - cho static assets
if (request.url.match(/\.(js|css|png|jpg|svg|ico)$/)) {
  event.respondWith(
    caches.match(request).then((cached) => {
      return (
        cached ||
        fetch(request).then((response) => {
          cache.put(request, response.clone());
          return response;
        })
      );
    })
  );
}

// NETWORK FIRST - cho API
if (request.url.includes("/api/")) {
  event.respondWith(
    fetch(request)
      .then((response) => {
        cache.put(request, response.clone());
        return response;
      })
      .catch(() => caches.match(request)) // Fallback khi offline
  );
}
```

---

## 5. Quy trình cập nhật ứng dụng

### 🔄 Khi bạn deploy phiên bản mới

```
┌────────────────────────────────────────────────────────────────────┐
│           QUY TRÌNH CẬP NHẬT ỨNG DỤNG                              │
└────────────────────────────────────────────────────────────────────┘

  [Developer chạy: npm run build]
         │
         ▼
  ┌──────────────────┐
  │ Build tạo file   │
  │ bundle mới với   │
  │ hash mới         │
  │ main.abc123.js   │
  └────────┬─────────┘
         │
         ▼
  [Deploy lên server]
         │
         ▼
  ┌──────────────────┐
  │ Server có file   │
  │ service-worker.js│
  │ mới (byte khác)  │
  └────────┬─────────┘
         │
         │ (Người dùng mở app hoặc refresh)
         ▼
  ┌──────────────────┐
  │ Browser so sánh  │
  │ SW cũ vs SW mới  │
  │ (byte-by-byte)   │
  └────────┬─────────┘
         │
         │ (Có thay đổi)
         ▼
  ┌──────────────────────────────────────────────┐
  │ INSTALL SW MỚI                               │
  │                                              │
  │  1. Tải service-worker.js mới               │
  │  2. Tải các file bundle mới                 │
  │  3. Lưu vào cache mới                       │
  │  4. skipWaiting() → Kích hoạt ngay          │
  │  5. clients.claim() → Kiểm soát tất cả tab  │
  └──────────────────────────────────────────────┘
         │
         ▼
  ┌──────────────────┐
  │ ✅ Người dùng có │
  │ phiên bản mới!   │
  └──────────────────┘
```

### 👤 Người dùng cần làm gì khi có update?

```
┌────────────────────────────────────────────────────────────────────┐
│           CẬP NHẬT TỰ ĐỘNG - NGƯỜI DÙNG KHÔNG CẦN LÀM GÌ          │
└────────────────────────────────────────────────────────────────────┘

  Khi có phiên bản mới:

  1. User mở app hoặc refresh
         │
         ▼
  2. SW phát hiện có version mới
         │
         ▼
  3. Hiển thị banner: "🔄 Đang cập nhật phiên bản mới..."
         │
         ▼
  4. Tự động reload sau 0.8 giây
         │
         ▼
  5. ✅ User sử dụng bản mới nhất!
     (Xem version trên Header: v0.1.1)
```

---

## 5.1. Quản lý Phiên bản (Version Management)

### 📦 Cấu trúc file

```
fe-bcgiaobanbvt/
├── package.json              ← Nguồn version duy nhất ("version": "0.1.0")
├── scripts/
│   └── inject-version.js     ← Script tự động sync version
├── public/
│   ├── service-worker.js     ← CACHE_NAME được tự động cập nhật
│   └── version.json          ← Tự động tạo khi build (version + buildTime)
├── .env.production           ← Config production
└── src/
    ├── index.js              ← onUpdate callback hiển thị banner + reload
    └── layouts/
        └── MainHeader.js     ← Hiển thị version chip (v0.1.0)
```

### 🔄 Quy trình Release mới

```
┌────────────────────────────────────────────────────────────────────┐
│              QUY TRÌNH RELEASE PHIÊN BẢN MỚI                       │
└────────────────────────────────────────────────────────────────────┘

  DEVELOPER:
  ──────────
  1. Sửa version trong package.json: "0.1.0" → "0.1.1"

  2. Chạy build:
     $ npm run build

     Tự động thực hiện:
     ├── prebuild: node scripts/inject-version.js
     │   ├── Cập nhật CACHE_NAME trong service-worker.js
     │   ├── Tạo public/version.json
     │   └── Log: ✅ Version injection completed!
     │
     └── build: react-scripts build

  3. Deploy folder build/ lên server


  USER (tự động):
  ────────────────
  1. Mở app → SW detect version mới
  2. Banner: "🔄 Đang cập nhật phiên bản mới..."
  3. Auto reload
  4. Header hiển thị: [v0.1.1] ✅
```

### 📝 Script inject-version.js

```javascript
// FILE: scripts/inject-version.js
// Chạy tự động qua prebuild hook

// 1. Đọc version từ package.json
const version = packageJson.version;

// 2. Cập nhật service-worker.js
// CACHE_NAME = "hospital-pwa-v0.1.0" → "hospital-pwa-v0.1.1"

// 3. Tạo public/version.json
{
  "version": "0.1.1",
  "buildTime": "2025-11-27T10:30:00.000Z",
  "buildTimeVN": "27/11/2025, 17:30:00"
}
```

### 🖥️ Hiển thị Version trên Header

```javascript
// FILE: src/layouts/MainHeader.js

<Chip
  label={`v${process.env.REACT_APP_VERSION || "0.1.0"}`}
  size="small"
  sx={{
    mr: 1,
    fontSize: "0.7rem",
    height: 20,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    color: "primary.main",
    display: { xs: "none", sm: "flex" }, // Ẩn trên mobile
  }}
/>
```

### ⚡ onUpdate Callback (Auto-reload)

```javascript
// FILE: src/index.js

onUpdate: (registration) => {
  // Hiển thị banner thông báo
  const updateMessage = document.createElement("div");
  updateMessage.innerHTML = "🔄 Đang cập nhật phiên bản mới...";
  updateMessage.style.cssText = "position:fixed;top:0;...";
  document.body.prepend(updateMessage);

  // Kích hoạt SW mới và reload
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: "SKIP_WAITING" });
  }
  setTimeout(() => window.location.reload(), 800);
};
```

---

## 6. Push Notifications

### 🔔 Cách hoạt động

```
┌────────────────────────────────────────────────────────────────────┐
│              PUSH NOTIFICATION FLOW                                │
└────────────────────────────────────────────────────────────────────┘

  ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
  │  Backend    │      │ Push Server │      │  Browser    │
  │  (Node.js)  │      │ (FCM/VAPID) │      │  (Edge)     │
  └──────┬──────┘      └──────┬──────┘      └──────┬──────┘
         │                    │                    │
         │  1. Gửi message    │                    │
         │ ──────────────────▶│                    │
         │                    │                    │
         │                    │  2. Push to device │
         │                    │ ──────────────────▶│
         │                    │                    │
         │                    │                    │ 3. SW nhận
         │                    │                    │    push event
         │                    │                    │
         │                    │                    │ 4. Hiển thị
         │                    │                    │    notification
         │                    │                    ▼
         │                    │              ┌──────────┐
         │                    │              │ 🔔 Thông │
         │                    │              │ báo mới! │
         │                    │              └──────────┘
```

### 📝 Code xin quyền Notification

```javascript
// FILE: src/serviceWorkerRegistration.js

// Xin quyền thông báo
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("Trình duyệt không hỗ trợ Notification");
    return "unsupported";
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("✅ Đã được cấp quyền thông báo");
    showTestNotification(); // Hiện thông báo test
  }

  return permission; // 'granted' | 'denied' | 'default'
}

// Hiển thị notification test
export function showTestNotification() {
  if (Notification.permission === "granted") {
    new Notification("🏥 BC Bệnh Viện Phú Thọ", {
      body: "Thông báo đã được kích hoạt thành công!",
      icon: "/logoBVTPT.png",
      tag: "test-notification",
    });
  }
}
```

### 🧪 Test Push từ DevTools

```
┌────────────────────────────────────────────────────────────────────┐
│            TEST PUSH NOTIFICATION TỪ DEVTOOLS                      │
└────────────────────────────────────────────────────────────────────┘

  1. Mở DevTools (F12)

  2. Vào tab Application → Service Workers

  3. Tìm nút "Push" bên cạnh service worker

  4. Nhập JSON data:
     {
       "title": "Test từ DevTools",
       "body": "Đây là nội dung thông báo test"
     }

  5. Nhấn "Push" → Notification sẽ xuất hiện


  ⚠️ LƯU Ý:
  - Phải đã cấp quyền Notification cho site
  - Service Worker phải đang Active
  - Nếu không thấy, kiểm tra Windows Notification Center
```

---

## 7. Xử lý sự cố thường gặp

### ❌ Sự cố 1: App không cập nhật sau khi deploy

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIỆU CHỨNG:                                                    │
│ - Đã deploy phiên bản mới nhưng người dùng vẫn thấy bản cũ     │
│ - Refresh nhiều lần vẫn không đổi                               │
└─────────────────────────────────────────────────────────────────┘

  NGUYÊN NHÂN                          GIẢI PHÁP
  ─────────────────────────────────────────────────────────────────

  1. SW cũ vẫn đang hoạt động          → Bật "Update on reload"
                                          trong DevTools

  2. Cache browser quá mạnh            → Hard refresh: Ctrl+Shift+R
                                          hoặc Ctrl+F5

  3. CDN cache chưa invalidate         → Chờ CDN cache hết hạn
                                          hoặc purge cache

  4. Nhiều tab đang mở                 → Đóng TẤT CẢ tab app
                                          rồi mở lại


  🔧 CÁCH XÓA HOÀN TOÀN (Nuclear Option):
  ─────────────────────────────────────────
  DevTools → Application → Storage
  → Click "Clear site data"
  → Refresh trang
```

### ❌ Sự cố 2: App không hoạt động offline

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIỆU CHỨNG:                                                    │
│ - Mất mạng → App hiện lỗi hoặc trang trắng                     │
│ - Không load được các trang đã truy cập trước đó               │
└─────────────────────────────────────────────────────────────────┘

  NGUYÊN NHÂN                          GIẢI PHÁP
  ─────────────────────────────────────────────────────────────────

  1. SW chưa được cài đặt              → Truy cập app khi online
                                          ít nhất 1 lần

  2. Trang chưa được cache             → Truy cập trang đó trước
                                          khi offline

  3. API data chưa cache               → Gọi API khi online để
                                          data được lưu cache

  4. SW bị lỗi                         → Kiểm tra Console log
                                          trong DevTools


  🔍 KIỂM TRA SW CÓ HOẠT ĐỘNG:
  ────────────────────────────
  DevTools → Application → Service Workers
  → Phải thấy status: "activated and is running"
```

### ❌ Sự cố 3: Notification không hiển thị

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIỆU CHỨNG:                                                    │
│ - Đã push nhưng không thấy notification                        │
│ - Không có popup xin quyền                                     │
└─────────────────────────────────────────────────────────────────┘

  KIỂM TRA THEO THỨ TỰ:
  ─────────────────────

  1️⃣ Kiểm tra quyền trong browser
     ────────────────────────────
     Edge → Settings → Site permissions → Notifications
     → Đảm bảo site được "Allow"


  2️⃣ Kiểm tra Windows Notification
     ────────────────────────────
     Windows Settings → System → Notifications
     → Đảm bảo Microsoft Edge được bật


  3️⃣ Kiểm tra Focus Assist
     ────────────────────────────
     Windows Settings → System → Focus assist
     → Đảm bảo đang ở "Off" hoặc Edge trong priority list


  4️⃣ Kiểm tra trong code
     ────────────────────────────
     Console: Notification.permission
     → Phải trả về "granted"
```

### ❌ Sự cố 4: Logo/Icon không đúng

```
┌─────────────────────────────────────────────────────────────────┐
│ TRIỆU CHỨNG:                                                    │
│ - Icon trên taskbar/desktop vẫn là logo cũ                     │
│ - Favicon không thay đổi                                        │
└─────────────────────────────────────────────────────────────────┘

  GIẢI PHÁP:
  ──────────

  1. Xóa cache browser hoàn toàn
     → DevTools → Application → Clear site data

  2. Xóa app đã cài đặt (nếu đã install PWA)
     → Edge → Apps → BC Bệnh Viện → Uninstall
     → Cài lại từ đầu

  3. Refresh favicon cache
     → Truy cập trực tiếp: https://yoursite.com/favicon.ico
     → Hard refresh: Ctrl+F5

  4. Kiểm tra manifest.json
     → DevTools → Application → Manifest
     → Xem icons có đúng path không
```

---

## 8. FAQ - Câu hỏi thường gặp

### ❓ Tại sao app vẫn chạy khi tắt mạng?

```
┌─────────────────────────────────────────────────────────────────┐
│ TRẢ LỜI:                                                        │
│                                                                  │
│ Vì Service Worker đã cache sẵn các file:                        │
│ - HTML, CSS, JavaScript                                         │
│ - Hình ảnh, fonts                                               │
│ - Dữ liệu API đã gọi trước đó                                   │
│                                                                  │
│ Khi offline, SW trả về từ cache thay vì gọi network.           │
└─────────────────────────────────────────────────────────────────┘
```

### ❓ Bật "Update on reload" có ảnh hưởng gì?

```
┌─────────────────────────────────────────────────────────────────┐
│ TRẢ LỜI:                                                        │
│                                                                  │
│ ✅ Ưu điểm:                                                     │
│    - Mỗi lần F5 sẽ kiểm tra và cài SW mới nhất                 │
│    - Phù hợp cho developer cần test nhanh                       │
│                                                                  │
│ ⚠️ Nhược điểm:                                                  │
│    - Chậm hơn vì luôn fetch SW từ network                       │
│    - Chỉ ảnh hưởng máy đang bật, không ảnh hưởng user khác     │
│                                                                  │
│ 💡 Khuyến nghị: Chỉ bật khi develop/debug, tắt khi xong        │
└─────────────────────────────────────────────────────────────────┘
```

### ❓ Người dùng đã cài PWA, làm sao update?

```
┌─────────────────────────────────────────────────────────────────┐
│ TRẢ LỜI:                                                        │
│                                                                  │
│ PWA tự động update! Quy trình:                                  │
│                                                                  │
│ 1. Người dùng mở app (đã cài)                                   │
│ 2. Browser tự động check SW mới trong background                │
│ 3. Nếu có SW mới → tải và cài đặt ngầm                         │
│ 4. skipWaiting() → kích hoạt ngay                               │
│ 5. Lần mở tiếp theo → chạy phiên bản mới                       │
│                                                                  │
│ 👤 Người dùng KHÔNG cần:                                        │
│    - Gỡ cài đặt app                                             │
│    - Vào app store                                              │
│    - Làm bất kỳ thao tác nào                                    │
└─────────────────────────────────────────────────────────────────┘
```

### ❓ Làm sao biết user đang dùng phiên bản nào?

```
┌─────────────────────────────────────────────────────────────────┐
│ TRẢ LỜI:                                                        │
│                                                                  │
│ 🔍 Cách 1: Console command                                      │
│    navigator.serviceWorker.controller?.scriptURL               │
│    → Hiện URL của SW đang chạy                                  │
│                                                                  │
│ 🔍 Cách 2: DevTools                                             │
│    Application → Service Workers                                │
│    → Xem Source URL và Received timestamp                       │
│                                                                  │
│ 💡 Best Practice:                                               │
│    Thêm version vào code hoặc SW file name                      │
│    VD: CACHE_NAME = 'bc-bv-cache-v2.1.0'                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 9. Hướng dẫn cho IT Support

### 🔧 Checklist khi user báo lỗi

```
┌────────────────────────────────────────────────────────────────────┐
│              IT SUPPORT CHECKLIST                                  │
└────────────────────────────────────────────────────────────────────┘

□ 1. XÁC ĐỊNH VẤN ĐỀ
  ├── App không mở được?
  ├── App chậm/đơ?
  ├── Data không cập nhật?
  ├── Notification không hoạt động?
  └── Khác: _______________

□ 2. THU THẬP THÔNG TIN
  ├── Trình duyệt: _________ (VD: Edge 120)
  ├── Hệ điều hành: ________ (VD: Windows 11)
  ├── Mạng: Online / Offline / Chập chờn
  ├── PWA đã cài chưa: Có / Chưa
  └── Lỗi xuất hiện từ khi nào: ___________

□ 3. KIỂM TRA CƠ BẢN (Hướng dẫn user)
  ├── Hard refresh: Ctrl+Shift+R
  ├── Đóng tất cả tab app, mở lại
  ├── Kiểm tra kết nối mạng
  └── Thử trình duyệt khác

□ 4. KIỂM TRA NÂNG CAO (Remote hoặc tại chỗ)
  ├── DevTools → Console: Có lỗi đỏ không?
  ├── DevTools → Network: Request nào fail?
  ├── DevTools → Application → SW: Status?
  └── DevTools → Application → Cache: Có data?

□ 5. GIẢI PHÁP CUỐI CÙNG
  ├── Clear site data
  ├── Gỡ PWA, cài lại
  └── Reset browser settings
```

### 📞 Kịch bản hỗ trợ thường gặp

```
┌─────────────────────────────────────────────────────────────────┐
│ TÌNH HUỐNG 1: "Em ơi, app không vào được"                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ IT: Anh/chị thử nhấn Ctrl+Shift+R được không ạ?                │
│                                                                  │
│ [Nếu vẫn lỗi]                                                   │
│                                                                  │
│ IT: Anh/chị nhấn F12, chuyển sang tab Console,                 │
│     có thấy dòng chữ đỏ nào không ạ?                           │
│     → Chụp màn hình gửi em                                      │
│                                                                  │
│ [Nếu network error]                                             │
│                                                                  │
│ IT: Anh/chị kiểm tra mạng nội bộ,                              │
│     thử truy cập các trang web khác xem có vào được không      │
│                                                                  │
│ [Nếu vẫn không được]                                            │
│                                                                  │
│ IT: Anh/chị vào Settings của trình duyệt,                      │
│     xóa cache và cookies, rồi thử lại ạ                         │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TÌNH HUỐNG 2: "Sao em thấy phiên bản cũ, đồng nghiệp có mới"   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ IT: Anh/chị nhấn F12, vào tab Application,                     │
│     chọn Service Workers bên trái                               │
│                                                                  │
│     Tick vào ô "Update on reload"                               │
│                                                                  │
│     Rồi nhấn F5 để refresh                                      │
│                                                                  │
│ [Nếu vẫn cũ]                                                    │
│                                                                  │
│ IT: Anh/chị vẫn ở Application,                                  │
│     chọn Storage bên trái,                                      │
│     nhấn nút "Clear site data"                                  │
│     rồi F5                                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ TÌNH HUỐNG 3: "App không gửi thông báo"                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ IT: Anh/chị nhấn F12, vào Console,                             │
│     gõ: Notification.permission                                 │
│     Enter, nó hiện gì ạ?                                        │
│                                                                  │
│ [Nếu "denied"]                                                  │
│                                                                  │
│ IT: Anh/chị đã chặn thông báo rồi.                             │
│     Nhấn vào icon ổ khóa bên trái thanh địa chỉ               │
│     → Tìm Notifications → chuyển thành Allow                    │
│     → Refresh trang                                              │
│                                                                  │
│ [Nếu "default"]                                                 │
│                                                                  │
│ IT: Trang chưa xin quyền.                                       │
│     Anh/chị refresh trang, sẽ có popup xin quyền,              │
│     nhấn Allow                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📚 Tài liệu tham khảo

- [MDN - Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [web.dev - Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Google Developers - Service Worker Lifecycle](https://developers.google.com/web/fundamentals/primers/service-workers/lifecycle)

---

> 📝 **Cập nhật lần cuối:** November 2024  
> 👤 **Tác giả:** Development Team - BC Bệnh Viện Phú Thọ  
> 📧 **Liên hệ hỗ trợ:** IT Department
