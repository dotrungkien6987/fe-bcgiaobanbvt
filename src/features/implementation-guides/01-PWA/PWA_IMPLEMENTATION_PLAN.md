# 🚀 PWA Implementation Plan - Complete Guide

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture](#architecture)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Verification & Testing](#verification--testing)
6. [Troubleshooting](#troubleshooting)
7. [Next Steps](#next-steps)

---

## 📌 OVERVIEW

### What is PWA?

Progressive Web App (PWA) là web app có thể:

- **Install**: Thêm icon vào màn hình như native app
- **Offline**: Hoạt động khi mất mạng (có giới hạn)
- **Fast**: Load nhanh nhờ Service Worker cache
- **Push Notifications**: Nhận thông báo khi không mở app (iOS 16.4+)

### Why PWA for Hospital System?

| Feature            | Native App             | PWA                       | Winner  |
| ------------------ | ---------------------- | ------------------------- | ------- |
| Deployment         | App Store (7-14 days)  | QR Code (instant)         | ✅ PWA  |
| Updates            | User must download     | Auto update               | ✅ PWA  |
| Development Cost   | iOS + Android separate | 1 codebase                | ✅ PWA  |
| Push Notifications | ✅ Full support        | ⚠️ iOS 16.4+ only         | ⚖️ Draw |
| Installation       | Easy                   | Need "Add to Home Screen" | ⚖️ Draw |
| **Total Cost**     | 2-3x higher            | Base cost                 | ✅ PWA  |

**Decision:** PWA first, evaluate native app later if needed.

### Timeline & Effort

| Task           | Time         | Complexity |
| -------------- | ------------ | ---------- |
| HTTPS Setup    | 1 hour       | Easy       |
| Manifest.json  | 30 mins      | Easy       |
| Service Worker | 3-4 hours    | Medium     |
| Icons & Assets | 1 hour       | Easy       |
| Testing        | 2 hours      | Easy       |
| **Total**      | **1-2 days** | **Medium** |

---

## ✅ PREREQUISITES

### 1. Development Environment

```bash
# Check Node.js version (16+ required)
node --version  # Must be v16+

# Check if project runs
cd fe-bcgiaobanbvt
npm start       # Should open at http://localhost:3000
```

### 2. HTTPS Requirement

**⚠️ PWA REQUIRES HTTPS** (except localhost)

**Options:**

- **Production:** Use domain with SSL certificate (e.g., Cloudflare, Let's Encrypt)
- **Development:** Use ngrok or localhost (automatically works)

**To test with HTTPS locally:**

```bash
# Option 1: Use ngrok
npm install -g ngrok
npm start  # In one terminal
ngrok http 3000  # In another terminal
# Use the https:// URL provided
```

### 3. Browser Compatibility

| Browser               | Support    | Notes                      |
| --------------------- | ---------- | -------------------------- |
| Chrome/Edge (Android) | ✅ Full    | Best support               |
| Safari (iOS 16.4+)    | ✅ Full    | Needs "Add to Home Screen" |
| Safari (iOS < 16.4)   | ⚠️ Partial | No Push Notifications      |
| Firefox               | ✅ Full    | Good support               |

### 4. Codebase Knowledge

Read: `fe-bcgiaobanbvt/.github/copilot-instructions.md`

**Key files:**

- `public/manifest.json` - PWA config
- `public/index.html` - Meta tags
- `src/index.js` - App entry point

---

## 🏗️ ARCHITECTURE

### PWA Components

```
┌─────────────────────────────────────────┐
│         Browser / Mobile Device         │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │      React App (Main Thread)      │  │
│  │  - UI Rendering                   │  │
│  │  - Redux State                    │  │
│  │  - API Calls                      │  │
│  └───────────────────────────────────┘  │
│                  ↕                       │
│  ┌───────────────────────────────────┐  │
│  │  Service Worker (Background)      │  │
│  │  - Intercept Network Requests     │  │
│  │  - Cache Management               │  │
│  │  - Offline Fallback               │  │
│  │  - Push Notification Handler      │  │
│  └───────────────────────────────────┘  │
│                  ↕                       │
│  ┌───────────────────────────────────┐  │
│  │     Cache Storage (IndexedDB)     │  │
│  │  - Static Assets (JS, CSS, imgs)  │  │
│  │  - API Responses (optional)       │  │
│  │  - Offline Pages                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                  ↕
        ┌─────────────────────┐
        │   Backend Server    │
        │   (giaobanbv-be)    │
        └─────────────────────┘
```

### Service Worker Lifecycle

```
1. REGISTER (index.js)
   └─> Browser downloads service-worker.js

2. INSTALL (First time or new version)
   └─> Cache static assets
   └─> Wait until all cached

3. ACTIVATE
   └─> Clean old caches
   └─> Take control of pages

4. FETCH (Every network request)
   └─> Intercept request
   └─> Return from cache if available
   └─> Fetch from network if not
   └─> Update cache for next time

5. UPDATE (New service-worker.js deployed)
   └─> Wait until all tabs closed
   └─> Install new version
   └─> Activate (go to step 3)
```

### Caching Strategy (We'll use "Cache First, Network Fallback")

```
User Request
    │
    ├─> Check Cache
    │   ├─> Found? → Return from Cache ✅
    │   └─> Not Found?
    │       └─> Fetch from Network
    │           ├─> Success? → Save to Cache & Return ✅
    │           └─> Failed? → Return Offline Page ⚠️
```

---

## 🔧 STEP-BY-STEP IMPLEMENTATION

### STEP 1: Create Manifest.json

**File:** `fe-bcgiaobanbvt/public/manifest.json`

**Replace entire content with:**

```json
{
  "short_name": "BC Bệnh viện",
  "name": "Báo cáo Giaoban - Bệnh viện Đa khoa Tỉnh Phú Thọ",
  "description": "Hệ thống quản lý công việc và KPI cho cán bộ y tế",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "logo192.png",
      "type": "image/png",
      "sizes": "192x192",
      "purpose": "any maskable"
    },
    {
      "src": "logo512.png",
      "type": "image/png",
      "sizes": "512x512",
      "purpose": "any maskable"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#1976d2",
  "background_color": "#ffffff",
  "orientation": "portrait-primary",
  "categories": ["health", "productivity", "business"],
  "lang": "vi-VN",
  "dir": "ltr",
  "scope": "/",
  "prefer_related_applications": false,
  "gcm_sender_id": "103953800507"
}
```

> **📌 Note về `gcm_sender_id`:** Đây là ID mặc định của Firebase Cloud Messaging (FCM). Giá trị `103953800507` là **bắt buộc và cố định** cho tất cả các web app sử dụng FCM - không cần thay đổi. Thêm sẵn trường này để chuẩn bị cho Phase 2 (Notification System).

**Field Explanations:**

| Field                 | Value            | Why?                                           |
| --------------------- | ---------------- | ---------------------------------------------- |
| `short_name`          | "BC Bệnh viện"   | Shows under icon on home screen (max 12 chars) |
| `name`                | Full name        | Shows in install prompt                        |
| `display: standalone` | No browser UI    | Looks like native app                          |
| `theme_color`         | #1976d2          | MUI primary blue (match app theme)             |
| `start_url`           | "."              | Open at root when launched                     |
| `scope`               | "/"              | All routes part of PWA                         |
| `orientation`         | portrait-primary | Lock to vertical (hospital use case)           |
| `gcm_sender_id`       | 103953800507     | **FCM default** - Required for push (Phase 2)  |

**Verification:**

```bash
# 1. Check file exists
ls public/manifest.json

# 2. Validate JSON (should show no errors)
node -e "JSON.parse(require('fs').readFileSync('public/manifest.json', 'utf8'))"
```

---

### STEP 2: Update index.html

**File:** `fe-bcgiaobanbvt/public/index.html`

**Find the `<head>` section and ADD these meta tags:**

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#1976d2" />

    <!-- ✅ ADD THESE PWA META TAGS -->
    <meta
      name="description"
      content="Hệ thống quản lý công việc và KPI - Bệnh viện Đa khoa Tỉnh Phú Thọ"
    />

    <!-- iOS Specific -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta
      name="apple-mobile-web-app-status-bar-style"
      content="black-translucent"
    />
    <meta name="apple-mobile-web-app-title" content="BC Bệnh viện" />
    <link rel="apple-touch-icon" href="%PUBLIC_URL%/logo192.png" />

    <!-- Android/Chrome -->
    <meta name="mobile-web-app-capable" content="yes" />

    <!-- Microsoft -->
    <meta name="msapplication-TileColor" content="#1976d2" />
    <meta name="msapplication-TileImage" content="%PUBLIC_URL%/logo192.png" />
    <!-- END PWA META TAGS -->

    <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
    <title>Báo cáo Giaoban BVT</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
```

**Why these tags?**

- `apple-mobile-web-app-capable`: Makes iOS hide Safari UI
- `apple-mobile-web-app-status-bar-style`: Translucent status bar (modern look)
- `apple-touch-icon`: Icon when added to iOS home screen
- `mobile-web-app-capable`: Same for Android
- `msapplication-*`: Support for Windows devices

**Verification:**

```bash
# Check if manifest linked correctly
grep -n "manifest.json" public/index.html
# Should show: <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
```

---

### STEP 3: Create Service Worker Registration Helper

**File:** `fe-bcgiaobanbvt/src/serviceWorkerRegistration.js`

**Create new file with this content:**

```javascript
// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    // [::1] is the IPv6 localhost address.
    window.location.hostname === "[::1]" ||
    // 127.0.0.0/8 are considered localhost for IPv4.
    window.location.hostname.match(
      /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
    )
);

export function register(config) {
  if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
    // The URL constructor is available in all browsers that support SW.
    const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
    if (publicUrl.origin !== window.location.origin) {
      // Our service worker won't work if PUBLIC_URL is on a different origin
      // from what our page is served on. This might happen if a CDN is used to
      // serve assets; see https://github.com/facebook/create-react-app/issues/2374
      return;
    }

    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      if (isLocalhost) {
        // This is running on localhost. Let's check if a service worker still exists or not.
        checkValidServiceWorker(swUrl, config);

        // Add some additional logging to localhost, pointing developers to the
        // service worker/PWA documentation.
        navigator.serviceWorker.ready.then(() => {
          console.log(
            "This web app is being served cache-first by a service " +
              "worker. To learn more, visit https://cra.link/PWA"
          );
        });
      } else {
        // Is not localhost. Just register service worker
        registerValidSW(swUrl, config);
      }
    });
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker == null) {
          return;
        }
        installingWorker.onstatechange = () => {
          if (installingWorker.state === "installed") {
            if (navigator.serviceWorker.controller) {
              // At this point, the updated precached content has been fetched,
              // but the previous service worker will still serve the older
              // content until all client tabs are closed.
              console.log(
                "New content is available and will be used when all " +
                  "tabs for this page are closed. See https://cra.link/PWA."
              );

              // Execute callback
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // At this point, everything has been precached.
              // It's the perfect time to display a
              // "Content is cached for offline use." message.
              console.log("Content is cached for offline use.");

              // Execute callback
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error("Error during service worker registration:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Check if the service worker can be found. If it can't reload the page.
  fetch(swUrl, {
    headers: { "Service-Worker": "script" },
  })
    .then((response) => {
      // Ensure service worker exists, and that we really are getting a JS file.
      const contentType = response.headers.get("content-type");
      if (
        response.status === 404 ||
        (contentType != null && contentType.indexOf("javascript") === -1)
      ) {
        // No service worker found. Probably a different app. Reload the page.
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // Service worker found. Proceed as normal.
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log(
        "No internet connection found. App is running in offline mode."
      );
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
```

**What this file does:**

- Checks if browser supports Service Worker
- Registers `/service-worker.js` when app loads
- Detects when new version available
- Provides callbacks (`onSuccess`, `onUpdate`)
- Handles localhost vs production differently

**Verification:**

```bash
# Check file created
ls src/serviceWorkerRegistration.js
```

---

### STEP 4: Update index.js to Register Service Worker

**File:** `fe-bcgiaobanbvt/src/index.js`

**Find current content** (should look like this):

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

**REPLACE WITH:**

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// ✅ REGISTER SERVICE WORKER FOR PWA
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log("✅ Service Worker registered successfully!");
    console.log("📦 App is now available offline");
  },
  onUpdate: (registration) => {
    console.log("🔄 New version available!");
    // TODO: Show toast notification to user
    // "Có phiên bản mới! Vui lòng reload trang."

    // Auto-reload after 3 seconds (optional)
    setTimeout(() => {
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    }, 3000);
  },
});

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
```

**What changed:**

1. Import `serviceWorkerRegistration`
2. Call `register()` with callbacks
3. `onSuccess`: Logs when SW installed successfully
4. `onUpdate`: Detects new version, auto-reloads app (can customize later to show toast)

**Verification:**

```bash
# Check import added
grep -n "serviceWorkerRegistration" src/index.js
# Should show import line and register() call
```

---

### STEP 5: Create Service Worker File

**File:** `fe-bcgiaobanbvt/public/service-worker.js`

**Create new file with this complete code:**

```javascript
/* eslint-disable no-restricted-globals */

// Service Worker for Hospital Management PWA
// Version: 1.0.0
// Cache Name Strategy: Include version for easy updates

const CACHE_NAME = "hospital-pwa-v1.0.0";
const API_CACHE_NAME = "hospital-api-v1.0.0";

// Assets to cache immediately on install
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
];

// API endpoints to cache (optional - for offline support)
const API_ROUTES = [
  // Will be populated later when integrating API
];

// Install Event - Cache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing...");

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        // Use addAll for atomic operation (all or nothing)
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log("[Service Worker] ✅ Installed successfully");
        // Force activation immediately (skip waiting)
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("[Service Worker] ❌ Installation failed:", error);
      })
  );
});

// Activate Event - Clean old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        // Delete old caches
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Keep current cache, delete others
              return cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME;
            })
            .map((cacheName) => {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log("[Service Worker] ✅ Activated successfully");
        // Take control of all pages immediately
        return self.clients.claim();
      })
  );
});

// Fetch Event - Intercept network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy 1: Cache First (for static assets)
  if (request.method === "GET" && !url.pathname.startsWith("/api")) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Found in cache - return it
          console.log("[Service Worker] 📦 Serving from cache:", request.url);
          return cachedResponse;
        }

        // Not in cache - fetch from network
        console.log("[Service Worker] 🌐 Fetching from network:", request.url);
        return fetch(request)
          .then((response) => {
            // Clone response (can only read once)
            const responseToCache = response.clone();

            // Cache successful responses
            if (response.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache);
              });
            }

            return response;
          })
          .catch((error) => {
            console.error("[Service Worker] ❌ Fetch failed:", error);

            // Return offline fallback page
            return caches.match("/index.html");
          });
      })
    );
  }

  // Strategy 2: Network First (for API calls)
  else if (url.pathname.startsWith("/api")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache API response for offline access (optional)
          const responseToCache = response.clone();

          if (response.status === 200 && request.method === "GET") {
            caches.open(API_CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }

          return response;
        })
        .catch((error) => {
          console.log(
            "[Service Worker] API offline, checking cache:",
            request.url
          );

          // Fallback to cache if offline
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              console.log(
                "[Service Worker] 📦 Serving API from cache:",
                request.url
              );
              return cachedResponse;
            }

            // Return error response
            return new Response(
              JSON.stringify({
                error: "Không có kết nối mạng",
                message:
                  "Bạn đang offline. Vui lòng kiểm tra kết nối internet.",
              }),
              {
                status: 503,
                statusText: "Service Unavailable",
                headers: new Headers({
                  "Content-Type": "application/json",
                }),
              }
            );
          });
        })
    );
  }

  // Strategy 3: Network Only (for POST/PUT/DELETE)
  else {
    event.respondWith(fetch(request));
  }
});

// Message Event - Handle messages from main thread
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    // Force update immediately
    self.skipWaiting();
  }
});

// Push Event - Handle push notifications (will be implemented in Phase 2)
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received");

  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (error) {
    notificationData = {
      title: "Thông báo mới",
      body: event.data.text() || "Bạn có thông báo mới",
    };
  }

  const options = {
    body: notificationData.body,
    icon: "/logo192.png",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    data: notificationData.data || {},
    actions: [
      { action: "open", title: "Xem ngay", icon: "/logo192.png" },
      { action: "close", title: "Đóng", icon: "/logo192.png" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || "Thông báo",
      options
    )
  );
});

// Notification Click Event - Handle notification interactions
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "open" || !event.action) {
    // Open app when notification clicked
    event.waitUntil(clients.openWindow(event.notification.data.url || "/"));
  }
});

console.log("[Service Worker] 🚀 Loaded successfully");
```

**What this Service Worker does:**

1. **Install Phase:**

   - Caches static assets (HTML, CSS, JS)
   - Forces immediate activation (`skipWaiting()`)

2. **Activate Phase:**

   - Deletes old caches (version management)
   - Takes control of all pages (`claim()`)

3. **Fetch Strategies:**

   - **Static assets**: Cache First (fast loading)
   - **API calls**: Network First (fresh data)
   - **Mutations**: Network Only (no cache)

4. **Offline Handling:**

   - Serves cached content when offline
   - Returns friendly error for API calls

5. **Future-Ready:**
   - Push notification handlers (Phase 2)
   - Message handlers for updates

**Verification:**

```bash
# Check file created
ls public/service-worker.js

# Check syntax (should show no errors)
node -c public/service-worker.js
```

---

### STEP 6: Update Package.json (Optional but Recommended)

**File:** `fe-bcgiaobanbvt/package.json`

**Find `"scripts"` section and ADD:**

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "serve": "npm run build && npx serve -s build -l 3000",
    "https": "HTTPS=true npm start"
  }
}
```

**New scripts:**

- `npm run serve`: Build & serve production version locally (test PWA in production mode)
- `npm run https`: Run dev server with HTTPS (test PWA on development)

---

### STEP 7: Create PWA Icons (If Missing)

**Check if icons exist:**

```bash
ls public/logo192.png
ls public/logo512.png
```

**If missing, create them:**

**Option 1: Use Online Tool**

1. Go to https://realfavicongenerator.net/
2. Upload hospital logo
3. Select "PWA" option
4. Download generated icons
5. Copy to `public/` folder

**Option 2: Use ImageMagick (if installed)**

```bash
# Resize existing logo
convert public/logo.png -resize 192x192 public/logo192.png
convert public/logo.png -resize 512x512 public/logo512.png
```

**Option 3: Use existing CRA defaults**

```bash
# CRA comes with default icons, just verify they exist
ls -lh public/logo*.png
```

---

### STEP 8: Test Service Worker Registration

**Run development server:**

```bash
cd fe-bcgiaobanbvt
npm start
```

**Open DevTools (F12):**

1. **Console Tab:**

   - Should see: `"✅ Service Worker registered successfully!"`
   - Should see: `"📦 App is now available offline"`

2. **Application Tab > Service Workers:**

   - Should show: `service-worker.js` with status "activated and is running"
   - Should show: "Source: ..." with file path

3. **Application Tab > Manifest:**
   - Should show: App name, icons, theme color
   - No errors

**Screenshot what you should see:**

```
Console:
  [Service Worker] 🚀 Loaded successfully
  [Service Worker] Installing...
  [Service Worker] Caching static assets
  [Service Worker] ✅ Installed successfully
  [Service Worker] Activating...
  [Service Worker] ✅ Activated successfully
  ✅ Service Worker registered successfully!
  📦 App is now available offline
```

---

### STEP 9: Test Offline Functionality

**In Chrome DevTools:**

1. Go to **Network Tab**
2. Change **"Online"** dropdown to **"Offline"**
3. Reload page (Ctrl+R)
4. **Expected:** App still loads (from cache)
5. **Console:** Should see `"📦 Serving from cache"` messages

**Test API calls offline:**

1. Go to a page that calls API (e.g., Work Management)
2. Enable offline mode
3. Try to load data
4. **Expected:** Error message "Không có kết nối mạng"

**Re-enable online:**

1. Change dropdown back to "Online"
2. Reload page
3. **Expected:** Fresh data loads

---

### STEP 10: Build for Production

**Build production bundle:**

```bash
npm run build
```

**Expected output:**

```
Creating an optimized production build...
Compiled successfully!

File sizes after gzip:

  123.45 KB  build/static/js/main.abc123.js
  12.34 KB   build/static/css/main.def456.css

The project was built assuming it is hosted at /.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.
```

**Serve production build locally:**

```bash
npx serve -s build -l 3000
```

**Open:** http://localhost:3000

**Test again:**

- Service Worker should register
- Offline mode should work
- Console should show no errors

---

### STEP 11: Test PWA Install Prompt

**On Desktop Chrome:**

1. Open app: http://localhost:3000
2. Wait 3-5 seconds
3. Look for **install icon** in address bar (➕ or ⬇️)
4. Click it → "Install app?"
5. Click **Install**
6. **Expected:** App opens in standalone window (no browser UI)

**On Mobile (Android):**

1. Open Chrome on phone
2. Visit app URL (need HTTPS or ngrok)
3. Tap **menu (⋮)** → "Add to Home Screen"
4. Tap **Add**
5. **Expected:** Icon appears on home screen
6. Tap icon → App opens like native app

**On Mobile (iOS 16.4+):**

1. Open Safari on iPhone
2. Visit app URL (need HTTPS)
3. Tap **Share button** → "Add to Home Screen"
4. Tap **Add**
5. **Expected:** Icon appears on home screen
6. Tap icon → App opens fullscreen

---

## ✅ VERIFICATION & TESTING

### Checklist

#### Development Environment

- [ ] Service Worker registered (check Console)
- [ ] No errors in Console
- [ ] Manifest loaded (check Application > Manifest)
- [ ] Icons display correctly
- [ ] Offline mode works (Network > Offline)

#### Production Build

- [ ] `npm run build` succeeds
- [ ] Production build loads correctly
- [ ] Service Worker active in production
- [ ] Cache working (check Network tab - "from ServiceWorker")

#### PWA Features

- [ ] Install prompt appears (desktop Chrome)
- [ ] App can be installed
- [ ] Installed app opens in standalone mode
- [ ] No browser UI visible when installed
- [ ] App icon shows on home screen/desktop

#### Mobile Testing

- [ ] Responsive on small screens
- [ ] Touch interactions work
- [ ] Add to Home Screen works (Android)
- [ ] Add to Home Screen works (iOS 16.4+)
- [ ] Status bar colored correctly
- [ ] Orientation locked to portrait (optional)

#### Offline Functionality

- [ ] Static pages load offline
- [ ] Cached assets served correctly
- [ ] API calls show friendly error when offline
- [ ] App doesn't crash when offline

### Testing Tools

#### 1. Chrome DevTools Lighthouse

**Run PWA audit:**

```
1. Open DevTools (F12)
2. Click "Lighthouse" tab
3. Select "Progressive Web App"
4. Click "Analyze page load"
```

**Target scores:**

- ✅ PWA: 80+ (Good)
- ✅ Performance: 70+ (Acceptable)
- ✅ Accessibility: 90+ (Good)

**Common issues:**

- ❌ "Does not register a service worker" → Check Step 4
- ❌ "No manifest.json" → Check Step 1
- ❌ "Icons not found" → Check Step 7
- ❌ "Not served over HTTPS" → Use production domain or ngrok

#### 2. PWA Builder

**Online validator:**

```
1. Go to: https://www.pwabuilder.com/
2. Enter your app URL (need HTTPS)
3. Click "Analyze"
4. Review recommendations
```

#### 3. Manual Mobile Testing

**Test on real devices:**

| Device              | Browser | Expected Result     |
| ------------------- | ------- | ------------------- |
| Android 10+         | Chrome  | ✅ Full PWA support |
| iPhone (iOS 16.4+)  | Safari  | ✅ Full PWA + Push  |
| iPhone (iOS < 16.4) | Safari  | ⚠️ PWA but no Push  |
| iPad                | Safari  | ✅ Full support     |

**Test cases:**

1. **Install:** Can add to home screen ✓
2. **Launch:** Opens in standalone mode ✓
3. **Offline:** Basic functionality works ✓
4. **Update:** New version detected & applied ✓

---

## 🐛 TROUBLESHOOTING

### Issue 1: Service Worker Not Registering

**Symptoms:**

- Console error: "Service worker registration failed"
- No service worker in DevTools

**Possible Causes:**

1. **HTTP instead of HTTPS:** Service Workers require HTTPS (except localhost)
2. **File path wrong:** `/service-worker.js` must be at root of public folder
3. **Browser cache:** Old version cached

**Solutions:**

```bash
# Solution 1: Check HTTPS
# Production: Ensure domain has SSL certificate
# Development: Use localhost or ngrok

# Solution 2: Verify file location
ls public/service-worker.js  # Must exist

# Solution 3: Clear browser cache
# Chrome: DevTools > Application > Clear Storage > "Clear site data"
```

**Verify fix:**

```javascript
// In DevTools Console, manually test:
navigator.serviceWorker
  .register("/service-worker.js")
  .then((reg) => console.log("✅ Manual registration:", reg))
  .catch((err) => console.error("❌ Registration failed:", err));
```

---

### Issue 2: Manifest Not Loading

**Symptoms:**

- DevTools > Application > Manifest shows errors
- Icons missing or broken

**Possible Causes:**

1. **JSON syntax error:** Invalid JSON in manifest.json
2. **Icons missing:** Files don't exist
3. **Wrong path:** Manifest not linked in index.html

**Solutions:**

```bash
# Solution 1: Validate JSON
node -e "JSON.parse(require('fs').readFileSync('public/manifest.json', 'utf8'))"
# Should show no errors

# Solution 2: Check icons exist
ls public/logo192.png public/logo512.png public/favicon.ico

# Solution 3: Check link tag
grep "manifest.json" public/index.html
# Should show: <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
```

---

### Issue 3: Offline Mode Not Working

**Symptoms:**

- App shows "No internet" error page when offline
- Console errors when offline

**Possible Causes:**

1. **Service Worker not caching files:** Cache list incomplete
2. **API calls not handled:** No offline fallback
3. **Cache not updating:** Old cache version

**Solutions:**

```javascript
// Solution 1: Add more files to STATIC_ASSETS
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/js/bundle.js", // ← Check actual filename
  "/static/css/main.css", // ← Check actual filename
  // Add more as needed
];

// Solution 2: Update Service Worker version
const CACHE_NAME = "hospital-pwa-v1.0.1"; // ← Increment version

// Solution 3: Force update
// DevTools > Application > Service Workers > "Update"
// Or: Unregister and reload
```

**Test fix:**

```
1. Network > Offline
2. Reload page (Ctrl+R)
3. Console should show: "📦 Serving from cache"
```

---

### Issue 4: Install Prompt Not Appearing

**Symptoms:**

- No install icon in Chrome address bar
- No "Add to Home Screen" option

**Possible Causes:**

1. **Already installed:** App already on device
2. **PWA criteria not met:** Missing requirements
3. **Browser doesn't support:** Old browser version

**Solutions:**

```bash
# Solution 1: Check if already installed
# Chrome: chrome://apps/  (should not see your app)
# Android: Check home screen for icon

# Solution 2: Verify PWA criteria
# Run Lighthouse audit (see Testing section)
# Must pass all PWA checks

# Solution 3: Check browser version
# Chrome: 80+ required
# Safari: iOS 16.4+ for full support
```

**Force install prompt (testing only):**

```javascript
// In DevTools Console:
let deferredPrompt;
window.addEventListener("beforeinstallprompt", (e) => {
  deferredPrompt = e;
  deferredPrompt.prompt();
});
```

---

### Issue 5: Update Not Deploying

**Symptoms:**

- Made changes but users see old version
- Service Worker shows old version

**Possible Causes:**

1. **Cache not cleared:** Old cache still active
2. **Service Worker not updated:** Version not changed
3. **Tabs not closed:** Old SW still controlling

**Solutions:**

```javascript
// Solution 1: Update cache version
const CACHE_NAME = "hospital-pwa-v1.0.2"; // ← Increment

// Solution 2: Force skipWaiting
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(() => {
      return self.skipWaiting(); // ← Force immediate activation
    })
  );
});

// Solution 3: Add update notification
// In serviceWorkerRegistration.js onUpdate callback:
if (registration && registration.waiting) {
  registration.waiting.postMessage({ type: "SKIP_WAITING" });
  window.location.reload(); // ← Force reload
}
```

**Manual fix for users:**

```
1. Close ALL tabs with the app
2. Clear browser cache
3. Reopen app
4. Check Console for version number
```

---

### Issue 6: Console Errors in Production

**Symptoms:**

- Errors in production build
- Service Worker fails to activate

**Common Errors:**

```javascript
// Error 1: "Failed to fetch" during install
// Cause: File in STATIC_ASSETS doesn't exist
// Solution: Remove non-existent files from cache list

// Error 2: "Quota exceeded"
// Cause: Caching too much data
// Solution: Limit API_CACHE_NAME size

// Error 3: "SecurityError: Failed to register"
// Cause: HTTP instead of HTTPS
// Solution: Use HTTPS in production
```

**Debug production:**

```bash
# Build locally
npm run build

# Serve with HTTPS
npx serve -s build --ssl-cert <cert.pem> --ssl-key <key.pem>

# Or use ngrok
npx serve -s build -l 3000
ngrok http 3000  # Use HTTPS URL provided
```

---

## 📚 NEXT STEPS

### Immediate (After PWA Complete)

1. **Update Backend CORS** (required for mobile):

   ```javascript
   // In giaobanbv-be/app.js
   const corsOptionsDelegate = (req, callback) => {
     let corsOptions;

     // Allow requests without Origin (mobile apps)
     if (
       !req.header("Origin") ||
       whitelist.indexOf(req.header("Origin")) !== -1
     ) {
       corsOptions = { origin: true };
     } else {
       corsOptions = { origin: false };
     }

     callback(null, corsOptions);
   };
   ```

2. **Add Update Notification UI:**

   ```javascript
   // Create src/components/UpdateNotification.js
   // Show toast when new version available
   // "Có phiên bản mới! Nhấn để cập nhật."
   ```

3. **Enhance Service Worker Caching:**
   ```javascript
   // Add specific API endpoints to cache
   const API_ROUTES = ["/api/user/me", "/api/khoa", "/api/nhanvien/datafix"];
   ```

### Phase 2: Notification System (Next Document)

**Prerequisites:**

- ✅ PWA Complete (this document)
- ✅ HTTPS in production
- ✅ Service Worker active

**What's next:**

1. **Socket.IO Setup** (realtime notifications)
2. **Firebase Cloud Messaging** (push notifications)
3. **Notification Database Schemas**
4. **User Notification Settings UI**

**Estimated time:** 5-7 days

**Navigate to:** `../02-Notification-System/ARCHITECTURE.md`

---

### Phase 3: Ticket System (Future)

**Prerequisites:**

- ✅ PWA Complete
- ✅ Notification System Complete

**What's included:**

- Internal request system (cross-department)
- Assignment workflow
- KPI integration
- Full notification support

**Estimated time:** 7-10 days

---

## 📖 RESOURCES

### Official Documentation

- [PWA Documentation (Google)](https://web.dev/progressive-web-apps/)
- [Service Worker API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest (MDN)](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### Testing Tools

- [Lighthouse (Chrome)](https://developers.google.com/web/tools/lighthouse)
- [PWA Builder](https://www.pwabuilder.com/)
- [Web.dev Measure Tool](https://web.dev/measure/)

### Examples & Inspiration

- [PWA Examples](https://pwa-directory.appspot.com/)
- [Service Worker Cookbook](https://serviceworke.rs/)

---

## 🎉 SUMMARY

**What you built:**

- ✅ Installable web app (works on mobile & desktop)
- ✅ Service Worker for offline support
- ✅ Manifest for native-like UX
- ✅ Foundation for push notifications (Phase 2)

**Time spent:** ~4-6 hours (with this guide)

**Result:** Your hospital management system is now a Progressive Web App that:

- Loads instantly (cache first)
- Works offline (basic functionality)
- Can be installed (no App Store needed)
- Ready for push notifications (next phase)

---

### 🔗 Phase 2 Readiness Checklist

PWA đã chuẩn bị sẵn cho **Notification System** (Phase 2):

| Component                                | Status           | Notes                                                   |
| ---------------------------------------- | ---------------- | ------------------------------------------------------- |
| Service Worker `push` event              | ✅ Có sẵn        | Handler đã định nghĩa, chỉ cần refine khi integrate FCM |
| Service Worker `notificationclick` event | ✅ Có sẵn        | Xử lý click vào notification                            |
| Caching Strategy API                     | ✅ Network First | API calls không bị cache cũ                             |
| `manifest.json` với `gcm_sender_id`      | ✅ Đã thêm       | FCM default ID, không cần thay đổi                      |
| HTTPS                                    | ⚠️ Cần setup     | Bắt buộc cho cả PWA install và FCM                      |

> **💡 Tip:** Không cần thay đổi gì trong PWA khi bắt đầu Phase 2. Chỉ cần bổ sung Firebase config và update Service Worker để nhận FCM messages.

---

**Next:** Navigate to `../02-Notification-System/` to add realtime & push notifications.

---

**Questions? Issues?**

- Check [Troubleshooting](#troubleshooting) section
- Review [Verification](#verification--testing) checklist
- Test on real devices (Android & iOS)

**Ready for Phase 2?** → `../02-Notification-System/ARCHITECTURE.md`
