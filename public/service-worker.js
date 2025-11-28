/* eslint-disable no-restricted-globals */

/**
 * Service Worker for Hospital Management PWA
 * Version: 0.1.0
 *
 * Features:
 * - Cache static assets (Cache First strategy)
 * - Handle API calls (Network First strategy)
 * - Offline fallback
 * - Push notification handlers (ready for Phase 2)
 */

const CACHE_NAME = "hospital-pwa-v0.1.0";
const API_CACHE_NAME = "hospital-api-v0.1.0";

// Static assets to cache on install
// Note: CRA generates hashed filenames, so we cache the root and let
// the browser handle dynamic imports
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  "/logoBVTPT.png",
];

// API endpoints that can be cached for offline (optional)
const API_ROUTES_TO_CACHE = [
  // Uncomment when ready to cache specific API responses
  // "/api/user/me",
  // "/api/khoa",
  // "/api/nhanvien/datafix",
];

// ============================================
// INSTALL EVENT - Cache static assets
// ============================================
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Installing version:", CACHE_NAME);

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching static assets");
        // Use addAll for critical assets, but don't fail if some are missing
        return cache.addAll(STATIC_ASSETS).catch((err) => {
          console.warn("[Service Worker] Some assets failed to cache:", err);
          // Still continue - non-critical
        });
      })
      .then(() => {
        console.log("[Service Worker] ✅ Installed successfully");
        // Force activate immediately (skip waiting)
        return self.skipWaiting();
      })
  );
});

// ============================================
// ACTIVATE EVENT - Clean old caches
// ============================================
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activating...");

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter(
              (cacheName) =>
                cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME
            )
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

// ============================================
// FETCH EVENT - Intercept network requests
// ============================================
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (POST, PUT, DELETE go directly to network)
  if (request.method !== "GET") {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith("http")) {
    return;
  }

  // Skip API requests that shouldn't be cached
  if (url.pathname.startsWith("/api")) {
    // Strategy: Network First for API calls
    event.respondWith(networkFirst(request));
    return;
  }

  // Strategy: Cache First for static assets
  event.respondWith(cacheFirst(request));
});

/**
 * Cache First Strategy
 * - Check cache first
 * - If not found, fetch from network and cache
 * - Good for static assets (JS, CSS, images)
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // console.log("[Service Worker] 📦 Serving from cache:", request.url);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    // Only cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log(
      "[Service Worker] ⚠️ Network failed, no cache available:",
      request.url
    );

    // Return offline fallback for navigation requests
    if (request.mode === "navigate") {
      const offlineResponse = await caches.match("/index.html");
      if (offlineResponse) {
        return offlineResponse;
      }
    }

    // Return error response
    return new Response("Không có kết nối mạng", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

/**
 * Network First Strategy
 * - Try network first
 * - Fall back to cache if network fails
 * - Good for API calls (always get fresh data when possible)
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    // Optionally cache successful GET API responses
    if (networkResponse.ok && shouldCacheApiResponse(request.url)) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log(
      "[Service Worker] ⚠️ Network failed, checking cache:",
      request.url
    );

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log("[Service Worker] 📦 Serving API from cache");
      return cachedResponse;
    }

    // Return JSON error for API calls
    return new Response(
      JSON.stringify({
        success: false,
        message: "Không có kết nối mạng. Vui lòng kiểm tra internet.",
        offline: true,
      }),
      {
        status: 503,
        statusText: "Service Unavailable",
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }
}

/**
 * Check if API response should be cached
 */
function shouldCacheApiResponse(url) {
  return API_ROUTES_TO_CACHE.some((route) => url.includes(route));
}

// ============================================
// MESSAGE EVENT - Handle messages from main thread
// ============================================
self.addEventListener("message", (event) => {
  console.log("[Service Worker] Received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    // Force update immediately when user accepts
    self.skipWaiting();
  }
});

// ============================================
// PUSH EVENT - Handle push notifications
// (Ready for Phase 2 - Notification System)
// ============================================
self.addEventListener("push", (event) => {
  console.log("[Service Worker] Push notification received");

  let notificationData = {
    title: "Thông báo mới",
    body: "Bạn có thông báo mới từ hệ thống",
    icon: "/logo192.png",
    badge: "/logo192.png",
    tag: "hospital-notification",
    data: { url: "/" },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch (error) {
      console.warn("[Service Worker] Failed to parse push data:", error);
      notificationData.body = event.data.text();
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon || "/logo192.png",
    badge: notificationData.badge || "/logo192.png",
    tag: notificationData.tag || "hospital-notification",
    data: notificationData.data || { url: "/" },
    vibrate: [200, 100, 200],
    requireInteraction: notificationData.priority === "urgent",
    actions: [
      { action: "open", title: "Xem chi tiết", icon: "/logo192.png" },
      { action: "close", title: "Đóng" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title || "Thông báo mới",
      options
    )
  );
});

// ============================================
// NOTIFICATION CLICK EVENT - Handle notification interactions
// ============================================
self.addEventListener("notificationclick", (event) => {
  console.log("[Service Worker] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Open app when notification clicked
  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if app not open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================
// NOTIFICATION CLOSE EVENT
// ============================================
self.addEventListener("notificationclose", (event) => {
  console.log("[Service Worker] Notification closed by user");
  // Can track analytics here if needed
});

console.log("[Service Worker] 🚀 Loaded successfully - Version:", CACHE_NAME);
