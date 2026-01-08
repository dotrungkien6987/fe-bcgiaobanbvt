# GIAI ĐOẠN 5: Chiến Lược Offline

**Phiên bản:** 1.0.0  
**Trạng thái:** Sẵn sàng triển khai  
**Thời gian ước tính:** 6 giờ  
**Ảnh hưởng:** 40% scenarios (offline/mạng yếu)  
**Phụ thuộc:** Không (giai đoạn độc lập)

---

## 1. Tổng Quan

### Mục Tiêu

- Cache API responses để hoạt động offline
- Queue mutations (POST/PUT/DELETE) khi offline
- Tự động sync khi có mạng trở lại
- Hiển thị banner "Offline mode" cho user
- Chiến lược cache khác nhau theo endpoint
- Duy trì data consistency

### Tiêu Chí Thành Công

- ✅ App vẫn xem được data khi offline
- ✅ Forms có thể submit offline → queue → sync sau
- ✅ Cache hit rate >80% cho master data
- ✅ User nhận thông báo rõ ràng về offline state
- ✅ Auto-sync khi có mạng không duplicate requests
- ✅ Data conflicts được handle

---

## 2. Kiến Trúc Offline

### Workflow Tổng Thể

```
┌─────────────────────────────────────────────────────┐
│ User Action (vd: submit form, load list)           │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
            ┌──────────┐
            │ Online?  │
            └────┬─────┘
                 │
    ┌────────────┴────────────┐
    │                         │
   CÓ                      KHÔNG
    │                         │
    ▼                         ▼
┌──────────┐           ┌──────────────┐
│ Network  │           │  IndexedDB   │
│ Request  │           │   Storage    │
└────┬─────┘           └──────┬───────┘
     │                        │
     ▼                        │
┌──────────┐                  │
│ Success? │                  │
└────┬─────┘                  │
     │                        │
  YES│                        │
     ▼                        │
┌──────────┐                  │
│  Cache   │◀─────────────────┘
│ Response │
└────┬─────┘
     │
     ▼
┌──────────┐
│ Show UI  │
└──────────┘

Khi có mạng trở lại:
IndexedDB Queue → Process → Network → Clear Queue
```

### Chiến Lược Cache Theo Endpoint

```
┌─────────────────────┬──────────────┬─────────────────┐
│ Endpoint            │ Strategy     │ TTL             │
├─────────────────────┼──────────────┼─────────────────┤
│ /api/khoa           │ Cache First  │ 24h (master)    │
│ /api/datafix        │ Cache First  │ 24h (master)    │
│ /api/nhanvien       │ Network First│ 1h              │
│ /api/benhnhan       │ Network First│ 5m              │
│ /api/congviec       │ Network First│ 5m              │
│ /api/kpi            │ Network First│ 10m             │
│ POST/PUT/DELETE     │ Network Only │ Queue nếu fail │
└─────────────────────┴──────────────┴─────────────────┘

Cache First: Trả cache ngay, update background
Network First: Thử network, fallback cache nếu fail
Network Only: Không cache, queue nếu offline
```

---

## 3. Implementation

### File 1: `public/service-worker.js` (Cập nhật)

```javascript
// Bật lại caching (hiện tại đang comment out)
import { precacheAndRoute } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { CacheFirst, NetworkFirst, NetworkOnly } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";
import { CacheableResponsePlugin } from "workbox-cacheable-response";

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST);

// ===== CACHE FIRST: Master Data =====
registerRoute(
  ({ url }) => {
    const endpoints = ["/api/khoa", "/api/datafix", "/api/phongban"];
    return endpoints.some((ep) => url.pathname.startsWith(ep));
  },
  new CacheFirst({
    cacheName: "master-data-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 24 giờ
      }),
    ],
  })
);

// ===== NETWORK FIRST: Dynamic Data =====
registerRoute(
  ({ url }) => {
    const endpoints = [
      "/api/nhanvien",
      "/api/benhnhan",
      "/api/congviec",
      "/api/kpi",
      "/api/baocao",
    ];
    return endpoints.some((ep) => url.pathname.startsWith(ep));
  },
  new NetworkFirst({
    cacheName: "dynamic-data-cache",
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 5 * 60, // 5 phút
      }),
    ],
  })
);

// ===== NETWORK ONLY: Mutations =====
registerRoute(
  ({ request }) => {
    const method = request.method;
    return ["POST", "PUT", "DELETE", "PATCH"].includes(method);
  },
  new NetworkOnly() // Không cache mutations
);

// ===== Background Sync cho Offline Mutations =====
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-offline-mutations") {
    event.waitUntil(syncOfflineMutations());
  }
});

async function syncOfflineMutations() {
  // Xử lý queue từ IndexedDB (xem File 2)
  const db = await openDB("offline-queue", 1);
  const queue = await db.getAll("mutations");

  for (const mutation of queue) {
    try {
      await fetch(mutation.url, mutation.options);
      await db.delete("mutations", mutation.id);
    } catch (error) {
      console.error("Sync failed:", mutation, error);
      // Giữ lại trong queue để retry sau
    }
  }
}
```

### File 2: `src/utils/offlineQueue.js` (MỚI)

```javascript
import { openDB } from "idb";

const DB_NAME = "offline-queue";
const STORE_NAME = "mutations";

// Mở database
export const getDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
      }
    },
  });
};

// Thêm mutation vào queue
export const queueMutation = async (url, options) => {
  const db = await getDB();
  await db.add(STORE_NAME, {
    url,
    options: {
      method: options.method,
      headers: options.headers,
      body: options.body,
    },
    timestamp: Date.now(),
  });

  // Register background sync nếu hỗ trợ
  if ("serviceWorker" in navigator && "sync" in registration) {
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register("sync-offline-mutations");
  }
};

// Lấy tất cả mutations trong queue
export const getQueuedMutations = async () => {
  const db = await getDB();
  return db.getAll(STORE_NAME);
};

// Xóa mutation khỏi queue
export const removeMutation = async (id) => {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
};

// Xử lý queue thủ công (fallback nếu không có Background Sync)
export const processQueue = async () => {
  const db = await getDB();
  const queue = await db.getAll(STORE_NAME);

  const results = [];
  for (const mutation of queue) {
    try {
      const response = await fetch(mutation.url, mutation.options);
      if (response.ok) {
        await db.delete(STORE_NAME, mutation.id);
        results.push({ success: true, id: mutation.id });
      } else {
        results.push({
          success: false,
          id: mutation.id,
          error: response.statusText,
        });
      }
    } catch (error) {
      results.push({ success: false, id: mutation.id, error: error.message });
    }
  }

  return results;
};
```

### File 3: `src/app/apiService.js` (Cập nhật)

```javascript
import axios from "axios";
import { queueMutation } from "utils/offlineQueue";

const apiService = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_API,
});

// Request interceptor
apiService.interceptors.request.use(
  (config) => {
    // Thêm auth token
    const accessToken = window.localStorage.getItem("accessToken");
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor với offline handling
apiService.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Kiểm tra nếu offline
    if (!navigator.onLine || error.message === "Network Error") {
      const { config } = error;

      // Nếu là mutation, thêm vào queue
      if (["post", "put", "delete", "patch"].includes(config.method)) {
        await queueMutation(config.url, {
          method: config.method.toUpperCase(),
          headers: config.headers,
          body: config.data,
        });

        // Trả về thành công giả (optimistic UI)
        return {
          data: {
            success: true,
            message: "Đã lưu vào hàng đợi. Sẽ đồng bộ khi có mạng.",
            queued: true,
          },
        };
      }

      // Nếu là GET, thử lấy từ cache (Service Worker xử lý)
      // Hoặc trả lỗi offline
      throw new Error("Không có kết nối mạng. Vui lòng thử lại sau.");
    }

    return Promise.reject(error);
  }
);

export default apiService;
```

### File 4: `src/components/OfflineBanner.jsx` (MỚI)

```javascript
import { useState, useEffect } from "react";
import { Alert, Snackbar, Button, Box } from "@mui/material";
import { CloudOff, CloudQueue } from "@mui/icons-material";
import { processQueue, getQueuedMutations } from "utils/offlineQueue";

const OfflineBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueCount, setQueueCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);

    // Cập nhật queue count
    const updateQueueCount = async () => {
      const queue = await getQueuedMutations();
      setQueueCount(queue.length);
    };

    updateQueueCount();
    const interval = setInterval(updateQueueCount, 5000);

    return () => {
      window.removeEventListener("online", updateOnlineStatus);
      window.removeEventListener("offline", updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await processQueue();
      const queue = await getQueuedMutations();
      setQueueCount(queue.length);
    } finally {
      setSyncing(false);
    }
  };

  if (isOnline && queueCount === 0) {
    return null; // Không hiện gì khi online và không có queue
  }

  return (
    <Snackbar
      open={true}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: { xs: 70, sm: 80 } }} // Dưới header
    >
      <Alert
        severity={isOnline ? "info" : "warning"}
        icon={isOnline ? <CloudQueue /> : <CloudOff />}
        action={
          isOnline &&
          queueCount > 0 && (
            <Button
              color="inherit"
              size="small"
              onClick={handleSync}
              disabled={syncing}
            >
              {syncing ? "Đang đồng bộ..." : `Đồng bộ (${queueCount})`}
            </Button>
          )
        }
        sx={{ width: "100%" }}
      >
        {isOnline ? (
          <Box>
            Đã kết nối trở lại.{" "}
            {queueCount > 0 && `Có ${queueCount} thao tác chờ đồng bộ.`}
          </Box>
        ) : (
          "Không có kết nối mạng. Đang hoạt động ở chế độ offline."
        )}
      </Alert>
    </Snackbar>
  );
};

export default OfflineBanner;
```

### File 5: Tích Hợp `OfflineBanner` Vào App

```javascript
// src/App.js
import OfflineBanner from "components/OfflineBanner";

function App() {
  return (
    <ThemeProvider>
      <OfflineBanner /> {/* Thêm vào đây */}
      <Routes />
    </ThemeProvider>
  );
}
```

---

## 4. Optimistic UI Pattern

### Example: Submit Form Offline

```javascript
// src/features/BenhNhan/BenhNhanForm.js
import { toast } from "react-toastify";
import apiService from "app/apiService";

const BenhNhanForm = () => {
  const dispatch = useDispatch();

  const handleSubmit = async (data) => {
    try {
      // Optimistic UI: Thêm ngay vào Redux
      const tempId = `temp-${Date.now()}`;
      dispatch(addBenhNhanOptimistic({ ...data, _id: tempId }));

      // Gửi request (sẽ queue nếu offline)
      const response = await apiService.post("/benhnhan", data);

      if (response.data.queued) {
        // Offline mode
        toast.info("Đã lưu offline. Sẽ đồng bộ khi có mạng.");
      } else {
        // Online mode - cập nhật với ID thật
        dispatch(updateBenhNhanId({ tempId, realId: response.data.data._id }));
        toast.success("Thêm bệnh nhân thành công!");
      }
    } catch (error) {
      // Rollback optimistic update
      dispatch(removeBenhNhan(tempId));
      toast.error(error.message);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
};
```

---

## 5. Testing Offline Mode

### Chrome DevTools

```
1. Mở Chrome DevTools (F12)
2. Network tab → Throttling dropdown
3. Chọn "Offline"
4. Test các scenarios:
   ✓ Load trang → Xem cache data
   ✓ Submit form → Xem queue message
   ✓ Chuyển về "Online" → Xem auto-sync
```

### Service Worker Testing

```bash
# Kiểm tra cache
chrome://serviceworker-internals/

# Xem cache storage
Application tab → Cache Storage → Xem cached requests

# Xem IndexedDB queue
Application tab → IndexedDB → offline-queue
```

---

## 6. Testing Checklist

```
[ ] Cache Strategy:
    [ ] Master data cache 24h ✅
    [ ] Dynamic data cache 5m ✅
    [ ] Mutations không cache ✅

[ ] Offline Mode:
    [ ] Banner xuất hiện khi offline
    [ ] Cached data vẫn hiển thị
    [ ] Forms submit → queue thành công
    [ ] Queue count hiển thị đúng

[ ] Online Recovery:
    [ ] Banner chuyển sang "reconnected"
    [ ] Nút "Đồng bộ" xuất hiện
    [ ] Click "Đồng bộ" → process queue
    [ ] Queue clear sau sync thành công

[ ] Edge Cases:
    [ ] Offline → Submit → Online ngay → Không duplicate
    [ ] Sync fail → Giữ lại trong queue
    [ ] Cache expired → Fetch mới khi online

[ ] Performance:
    [ ] Cache hit rate >80% cho master data
    [ ] Queue process <2s cho 10 items
```

---

## 7. Monitoring & Analytics

```javascript
// src/utils/offlineAnalytics.js
export const trackOfflineEvent = (eventType, data) => {
  if (window.gtag) {
    window.gtag("event", eventType, {
      event_category: "offline",
      ...data,
    });
  }
};

// Usage:
trackOfflineEvent("offline_form_submit", {
  form_type: "benhnhan",
  queued: true,
});

trackOfflineEvent("offline_sync_success", {
  queue_size: 5,
  sync_duration: 1200, // ms
});
```

---

## 8. Rollout Strategy

### Week 1: Enable Caching

```javascript
// Bật cache trong Service Worker
// Test cache hit rate
// Monitor performance
```

### Week 2: Enable Queue

```javascript
// Bật offline queue
// Test với 10% users
// Thu thập feedback
```

### Week 3: Full Rollout

```bash
# Deploy cho 100% users
REACT_APP_ENABLE_OFFLINE=true
```

---

## 9. Troubleshooting

### Vấn Đề 1: Cache Không Update

**Triệu chứng:** Thấy data cũ dù đã có data mới

**Giải pháp:**

```javascript
// Force refresh cache
const refreshCache = async () => {
  const cache = await caches.open("dynamic-data-cache");
  await cache.delete(url);
  // Fetch lại từ network
};
```

### Vấn Đề 2: Queue Bị Duplicate

**Triệu chứng:** Cùng 1 request gửi nhiều lần

**Giải pháp:**

```javascript
// Thêm unique ID cho mỗi mutation
const queueMutation = async (url, options) => {
  const uniqueId = `${options.method}-${url}-${Date.now()}`;
  // Check duplicate trước khi add
  const existing = await db.get(STORE_NAME, uniqueId);
  if (!existing) {
    await db.add(STORE_NAME, { ...mutation, uniqueId });
  }
};
```

---

## 10. Next Steps

```bash
# Sau khi hoàn thành Giai đoạn 5:
✅ Offline mode hoạt động
✅ Cache strategy tối ưu
✅ Queue & sync tự động
➡️ Giai đoạn 6: Component Polish & Touch Optimization
```

---

**Phiên bản:** 1.0.0  
**Ngày cập nhật:** 2026-01-07  
**Files cần tạo/sửa:** 5 files  
**Thời gian triển khai:** 6 giờ

**App hoạt động cả offline! 📴**
