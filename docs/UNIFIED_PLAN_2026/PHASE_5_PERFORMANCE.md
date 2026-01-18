# Phase 5: Performance Optimization

**Thời gian:** 4 giờ (revised from 10h - saved 6h)  
**Ưu tiên:** 🟡 MEDIUM  
**Trạng thái:** ⏸️ Blocked by Phase 0-4

**⚠️ Revision Notes (15/01/2026):**

- Task 5B (Service Worker): **ALREADY COMPLETE** ✅ - Skip entirely (6h → 0h)
- **Existing Implementation:**
  - `public/service-worker.js` - Full cache strategy implementation
  - `src/serviceWorker.js` - Registration helper
  - Features: Cache-first for static assets, Network-first for API, Offline fallback
- **Only Remaining:** Task 5A (Code Splitting) - 4h

---

## 🎯 Mục Tiêu

Optimize app performance cho mobile devices: Code splitting, lazy loading, offline caching.

### Metrics Goals

```
Before:                    Target:
─────────────────────────────────────────
Initial Load: 3.5s   →   < 2s
FCP: 2.1s            →   < 1.5s
LCP: 3.8s            →   < 2.5s
TTI: 4.2s            →   < 3s
Bundle Size: 850KB   →   < 500KB (initial)
```

---

## 📦 Deliverables

### 5A. Code Splitting + Lazy Loading (4h)

- ✅ Route-level code splitting
- ✅ Component lazy loading
- ✅ Suspense fallbacks

### 5B. Service Worker + Offline Strategy (0h) - ✅ ALREADY COMPLETE

- ✅ Service Worker setup - **DONE** (`public/service-worker.js`)
- ✅ Cache static assets - **DONE** (Cache-first strategy)
- ✅ Offline fallback page - **DONE** (`offline.html`)
- ✅ Registration helper - **DONE** (`src/serviceWorker.js`)

---

## 📋 Task Breakdown (4h - revised from 10h)

## PHASE 5A: Code Splitting + Lazy Loading (4h)

### Task 5A.1: Route-Level Code Splitting (2h)

**File:** `src/routes/index.js`

**Before:**

```javascript
import CongViecListPage from "features/QuanLyCongViec/CongViec/CongViecListPage";
import CongViecDetailPage from "features/QuanLyCongViec/CongViec/CongViecDetailPage";
// ... 50+ imports
```

**After:**

```javascript
import React, { lazy, Suspense } from "react";
import LoadingScreen from "components/LoadingScreen";

// Lazy load all route components
const CongViecListPage = lazy(() =>
  import("features/QuanLyCongViec/CongViec/CongViecListPage")
);
const CongViecDetailPage = lazy(() =>
  import("features/QuanLyCongViec/CongViec/CongViecDetailPage")
);
const DanhGiaKPIPage = lazy(() =>
  import("features/QuanLyCongViec/KPI/DanhGiaKPIPage")
);
// ... all other pages

// Wrapper component with Suspense
function LazyRoute({ component: Component, ...props }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Component {...props} />
    </Suspense>
  );
}

// Routes config
const routes = [
  {
    path: "/quanlycongviec/congviec/nhanvien/:nhanVienId",
    element: <LazyRoute component={CongViecListPage} />,
  },
  {
    path: "/quanlycongviec/congviec/:id",
    element: <LazyRoute component={CongViecDetailPage} />,
  },
  // ... all other routes
];
```

**Expected Result:**

- Initial bundle: ~850KB → ~400KB
- Each route: ~50-100KB lazy chunk
- Lighthouse score: +15-20 points

---

### Task 5A.2: Component-Level Lazy Loading (1h)

**Heavy Components to Lazy Load:**

1. **RichTextEditor** (QuillJS - 200KB)
2. **ChartComponents** (Recharts - 150KB)
3. **ImageCropper** (react-image-crop - 80KB)
4. **PdfViewer** (react-pdf - 120KB)

**Pattern:**

```javascript
// src/components/RichTextEditor/index.js
import React, { lazy, Suspense } from "react";
import { Skeleton } from "@mui/material";

const QuillEditor = lazy(() => import("./QuillEditor"));

function RichTextEditor(props) {
  return (
    <Suspense fallback={<Skeleton variant="rectangular" height={200} />}>
      <QuillEditor {...props} />
    </Suspense>
  );
}

export default RichTextEditor;
```

**Apply to:**

- `features/QuanLyCongViec/CongViec/components/CommentEditor.js`
- `features/BaoCaoNgay/components/ChartSection.js`
- `features/BaoCaoSuCo/components/ImageUpload.js`

---

### Task 5A.3: Optimize Redux Store (1h)

**Current Issue:** All slices loaded upfront

**Solution: Code-split Redux slices**

```javascript
// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";

// Core slices (always loaded)
import authReducer from "features/auth/authSlice";
import appReducer from "features/app/appSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    app: appReducer,
    // Lazy-loaded slices added dynamically
  },
});

// Dynamic slice injection
export function injectReducer(key, reducer) {
  if (store.asyncReducers?.[key]) {
    return; // Already injected
  }

  store.asyncReducers = store.asyncReducers || {};
  store.asyncReducers[key] = reducer;
  store.replaceReducer({
    ...store.asyncReducers,
    auth: authReducer,
    app: appReducer,
  });
}

export default store;
```

**Usage in feature:**

```javascript
// src/features/QuanLyCongViec/CongViec/CongViecListPage.js
import { useEffect } from "react";
import { injectReducer } from "app/store";

function CongViecListPage() {
  useEffect(() => {
    // Lazy load slice on mount
    import("./congViecSlice").then((module) => {
      injectReducer("congviec", module.default);
    });
  }, []);

  // ... component logic
}
```

**Note:** This is OPTIONAL - only if bundle size > 1MB

---

## PHASE 5B: Service Worker + Offline Strategy (6h) - OPTIONAL

### Task 5B.1: Service Worker Setup (2h)

**File:** `public/service-worker.js`

**Strategy:**

- **Cache First:** Static assets (JS, CSS, images)
- **Network First:** API calls (with fallback)
- **Cache Only:** Offline fallback page

**Implementation:**

```javascript
const CACHE_NAME = "hospital-mgmt-v1";
const STATIC_CACHE = "static-v1";
const API_CACHE = "api-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/static/css/main.css",
  "/static/js/main.js",
  "/logo192.png",
  "/offline.html", // Fallback page
];

// Install: Cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== API_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API requests: Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone response to cache
          const responseClone = response.clone();
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback to cache
          return caches.match(request).then((cached) => {
            return cached || new Response("Offline", { status: 503 });
          });
        })
    );
    return;
  }

  // Static assets: Cache First
  event.respondWith(
    caches
      .match(request)
      .then((cached) => {
        if (cached) {
          return cached;
        }

        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
      .catch(() => {
        // Fallback for navigation requests
        if (request.mode === "navigate") {
          return caches.match("/offline.html");
        }
      })
  );
});
```

---

### Task 5B.2: Register Service Worker (1h)

**File:** `src/index.js`

```javascript
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Register service worker
serviceWorkerRegistration.register({
  onSuccess: () => console.log("Service Worker registered"),
  onUpdate: (registration) => {
    // Notify user of update
    if (window.confirm("Có phiên bản mới. Tải lại trang?")) {
      registration.waiting?.postMessage({ type: "SKIP_WAITING" });
      window.location.reload();
    }
  },
});
```

**File:** `src/serviceWorkerRegistration.js`

```javascript
export function register(config) {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;

            newWorker?.addEventListener("statechange", () => {
              if (newWorker.state === "installed") {
                if (navigator.serviceWorker.controller) {
                  // New version available
                  config?.onUpdate?.(registration);
                } else {
                  // First install
                  config?.onSuccess?.(registration);
                }
              }
            });
          });
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    });
  }
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}
```

---

### Task 5B.3: Offline Fallback Page (1h)

**File:** `public/offline.html`

```html
<!DOCTYPE html>
<html lang="vi">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Offline - Hospital Management</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .container {
        text-align: center;
        padding: 2rem;
      }
      h1 {
        font-size: 3rem;
        margin: 0;
      }
      p {
        font-size: 1.2rem;
        margin: 1rem 0;
      }
      button {
        background: white;
        color: #667eea;
        border: none;
        padding: 1rem 2rem;
        font-size: 1rem;
        border-radius: 8px;
        cursor: pointer;
        margin-top: 1rem;
      }
      button:hover {
        opacity: 0.9;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>📡</h1>
      <h1>Không có kết nối</h1>
      <p>Vui lòng kiểm tra kết nối mạng và thử lại.</p>
      <button onclick="location.reload()">Thử lại</button>
    </div>
  </body>
</html>
```

---

### Task 5B.4: Offline Indicator Component (1h)

**File:** `src/components/OfflineIndicator.js`

```javascript
import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";

function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <Snackbar
      open={!isOnline}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert severity="warning" variant="filled">
        Không có kết nối mạng. Một số tính năng có thể không khả dụng.
      </Alert>
    </Snackbar>
  );
}

export default OfflineIndicator;
```

**Add to App.js:**

```javascript
import OfflineIndicator from "components/OfflineIndicator";

function App() {
  return (
    <>
      {/* ... existing app content */}
      <OfflineIndicator />
    </>
  );
}
```

---

### Task 5B.5: Cache Management UI (1h)

**File:** `src/features/Settings/CacheManagementPage.js`

```javascript
import React, { useState } from "react";
import {
  Container,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";

function CacheManagementPage() {
  const [cacheSize, setCacheSize] = useState(0);

  const calculateCacheSize = async () => {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const sizeInMB = (estimate.usage / 1024 / 1024).toFixed(2);
      setCacheSize(sizeInMB);
    }
  };

  const clearCache = async () => {
    if (!window.confirm("Xóa toàn bộ cache? Bạn sẽ cần tải lại dữ liệu.")) {
      return;
    }

    try {
      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Unregister service worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((reg) => reg.unregister()));

      toast.success("Đã xóa cache thành công");
      setCacheSize(0);

      // Reload page
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Lỗi khi xóa cache");
    }
  };

  React.useEffect(() => {
    calculateCacheSize();
  }, []);

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" gutterBottom>
        Quản lý Cache
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="body1" gutterBottom>
            Dung lượng cache hiện tại
          </Typography>
          <Typography variant="h3" color="primary">
            {cacheSize} MB
          </Typography>

          <Box mt={3}>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={clearCache}
              fullWidth
            >
              Xóa toàn bộ cache
            </Button>
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            mt={2}
            display="block"
          >
            Xóa cache sẽ tải lại dữ liệu từ server. Điều này hữu ích nếu bạn gặp
            lỗi hiển thị.
          </Typography>
        </CardContent>
      </Card>
    </Container>
  );
}

export default CacheManagementPage;
```

---

## ✅ Success Criteria

### Phase 5A: Code Splitting

- [ ] Initial bundle < 500KB
- [ ] Each route lazy-loaded
- [ ] Suspense fallbacks show
- [ ] No white screen on route change
- [ ] Heavy components lazy-loaded
- [ ] Lighthouse score improved (+15-20)

### Phase 5B: Offline Strategy (OPTIONAL)

- [ ] Service Worker registered
- [ ] Static assets cached
- [ ] API cache works
- [ ] Offline fallback page shows
- [ ] Online/offline indicator works
- [ ] Cache management UI works

---

## 🧪 Testing Checklist

### Performance Tests

- [ ] Lighthouse Performance score > 85
- [ ] FCP < 1.5s
- [ ] LCP < 2.5s
- [ ] TTI < 3s
- [ ] Bundle size < 500KB (initial)

### Code Splitting Tests

- [ ] Routes load independently
- [ ] Suspense fallbacks show
- [ ] No errors on lazy load
- [ ] Network tab shows chunks

### Offline Tests (if Phase 5B)

- [ ] App loads when offline (after first visit)
- [ ] Static assets served from cache
- [ ] API fallback to cache
- [ ] Offline page shows
- [ ] Online indicator works

---

## 🚧 Dependencies

**Required:**

- ⚠️ **Phase 0-4** - All routes and components must exist

**Optional:**

- None

---

## 🚨 Risks & Mitigation

| Risk                   | Mitigation                                                  |
| ---------------------- | ----------------------------------------------------------- |
| Bundle analysis errors | - Use webpack-bundle-analyzer<br>- Test after each split    |
| Lazy load failures     | - Error boundaries<br>- Suspense fallbacks<br>- Retry logic |
| Service Worker bugs    | - Thorough testing<br>- Feature flag<br>- Easy unregister   |
| Cache corruption       | - Cache versioning<br>- Clear cache UI                      |

---

## 📝 Notes

- **Phase 5B is OPTIONAL** - Only implement if:
  - Client requests offline support
  - Users work in low-connectivity areas
  - Time/budget allows
- **Service Worker risks:** Can cause hard-to-debug issues
- **Feature flag:** Add `enableServiceWorker` flag for gradual rollout

---

## 🛠️ Tools

**Bundle Analysis:**

```bash
npm install --save-dev webpack-bundle-analyzer
```

**Lighthouse CI:**

```bash
npm install --save-dev @lhci/cli
npx lhci autorun
```

**Cache Inspector:**

- Chrome DevTools → Application → Cache Storage

---

**Next Phase:** Phase 6 - Testing & QA
