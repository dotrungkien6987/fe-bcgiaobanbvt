# 🔔 PWA & FCM Implementation - Ticket System

**Version:** 1.0.0  
**Date:** December 26, 2025  
**Priority:** 🟡 MEDIUM - High Impact  
**Estimated Effort:** 8-10 ngày

---

## 🎯 Mục Tiêu

Biến hệ thống Ticket thành **full-featured Progressive Web App** với:

- ✅ Push notifications (iOS 16.4+ PWA, Android Chrome)
- ✅ Background sync cho offline actions
- ✅ Service Worker tối ưu với caching strategies
- ✅ Badge counts real-time với Server-Sent Events
- ✅ Offline-first architecture

---

## 📋 Kiến Trúc Tổng Quan

```
┌─────────────────────────────────────────────────────────────────┐
│                    PWA + FCM ARCHITECTURE                        │
└─────────────────────────────────────────────────────────────────┘

  [User Device]
       │
       ├─────────────────────────────────────────────────────────┐
       │                                                          │
   [Browser]                                              [Service Worker]
       │                                                          │
       ├─ React App                                  ├─ Cache Management
       ├─ Firebase SDK                               ├─ Background Sync
       ├─ IndexedDB (offline queue)                  ├─ Push Notification
       └─ SSE Connection (badge sync)                └─ Offline Detection
       │                                                          │
       └──────────────────────┬───────────────────────────────────┘
                              │
                              ▼
                        [Backend API]
                              │
       ┏━━━━━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━━━┓
       ┃                                            ┃
   [FCM Service]                            [Notification Service]
       │                                            │
       ├─ Firebase Admin SDK              ├─ Create notification
       ├─ Token management                ├─ SSE broadcast
       ├─ Send push                       └─ Retry queue
       └─ Batch operations                         │
                                                    ▼
                                            [MongoDB]
                                                    │
                                            ├─ Notifications
                                            ├─ FCM Tokens
                                            └─ Offline Actions
```

---

## 📦 Phase 1: Firebase Setup (Day 1)

### 1.1 Create Firebase Project

**Steps:**

```bash
1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name: "bcgiaobanbvt-prod"
4. Disable Google Analytics (optional)
5. Create project
```

### 1.2 Enable Firebase Cloud Messaging

```bash
1. In Firebase Console → Project Settings → Cloud Messaging
2. Click "Generate new key pair" under Web Push certificates
3. Copy VAPID Key (looks like: BLxxx...xxx)
4. Save for later use
```

### 1.3 Download Service Account JSON

```bash
1. Firebase Console → Project Settings → Service Accounts
2. Click "Generate new private key"
3. Download file → rename to "firebase-service-account.json"
4. Store securely (do NOT commit to git)
```

### 1.4 Add Web App to Firebase

```bash
1. Firebase Console → Project Overview → Add app → Web
2. App nickname: "BC Bệnh viện Web"
3. Check "Also set up Firebase Hosting" (optional)
4. Copy firebaseConfig object
```

Your config will look like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bcgiaobanbvt-prod.firebaseapp.com",
  projectId: "bcgiaobanbvt-prod",
  storageBucket: "bcgiaobanbvt-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

---

## 🔧 Phase 2: Backend Implementation (Day 2-4)

### 2.1 Install Dependencies

```bash
cd giaobanbv-be
npm install firebase-admin
```

### 2.2 Create FCM Service

**File:** `giaobanbv-be/services/fcmService.js`

```javascript
const admin = require("firebase-admin");
const path = require("path");
const UserFCMToken = require("../modules/workmanagement/models/UserFCMToken");
const { AppError } = require("../helpers/utils");

class FCMService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  init() {
    if (this.initialized) return;

    try {
      const serviceAccountPath = path.join(
        __dirname,
        "../config/firebase-service-account.json"
      );

      const fs = require("fs");
      if (!fs.existsSync(serviceAccountPath)) {
        console.warn(
          "[FCMService] ⚠️ firebase-service-account.json not found. FCM disabled."
        );
        return;
      }

      const serviceAccount = require(serviceAccountPath);

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      this.initialized = true;
      console.log("[FCMService] ✅ Firebase Admin SDK initialized");
    } catch (error) {
      console.error("[FCMService] ❌ Initialization failed:", error);
    }
  }

  /**
   * Send push notification to single user
   */
  async sendToUser(nhanVienId, notification) {
    if (!this.initialized) {
      console.warn("[FCMService] Not initialized, skipping push");
      return { success: false, reason: "not_initialized" };
    }

    try {
      // Get all active tokens for user
      const tokens = await UserFCMToken.find({
        NhanVienID: nhanVienId,
        IsActive: true,
      }).select("Token");

      if (tokens.length === 0) {
        return { success: false, reason: "no_tokens" };
      }

      const tokenStrings = tokens.map((t) => t.Token);

      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          type: notification.type,
          url: notification.url || "/",
          yeuCauId: notification.yeuCauId || "",
          priority: notification.priority || "normal",
        },
        tokens: tokenStrings,
      };

      const response = await admin.messaging().sendMulticast(message);

      // Handle failed tokens
      if (response.failureCount > 0) {
        await this._handleFailedTokens(response, tokens);
      }

      return {
        success: true,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error("[FCMService] Send failed:", error);
      throw new AppError(500, "Failed to send push notification", "FCM_ERROR");
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(nhanVienIds, notification) {
    const results = await Promise.allSettled(
      nhanVienIds.map((id) => this.sendToUser(id, notification))
    );

    const summary = {
      total: nhanVienIds.length,
      success: results.filter((r) => r.status === "fulfilled").length,
      failed: results.filter((r) => r.status === "rejected").length,
    };

    return summary;
  }

  /**
   * Handle failed tokens (expired/invalid)
   */
  async _handleFailedTokens(response, tokens) {
    const failedTokens = [];

    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === "messaging/invalid-registration-token" ||
          errorCode === "messaging/registration-token-not-registered"
        ) {
          failedTokens.push(tokens[idx].Token);
        }
      }
    });

    if (failedTokens.length > 0) {
      // Deactivate invalid tokens
      await UserFCMToken.updateMany(
        { Token: { $in: failedTokens } },
        { $set: { IsActive: false, DeactivatedAt: new Date() } }
      );

      console.log(
        `[FCMService] Deactivated ${failedTokens.length} invalid tokens`
      );
    }
  }

  /**
   * Register FCM token for user
   */
  async registerToken(nhanVienId, token, deviceInfo = {}) {
    // Check if token already exists
    let fcmToken = await UserFCMToken.findOne({ Token: token });

    if (fcmToken) {
      // Update existing token
      fcmToken.NhanVienID = nhanVienId;
      fcmToken.IsActive = true;
      fcmToken.DeviceType = deviceInfo.deviceType || fcmToken.DeviceType;
      fcmToken.DeviceInfo = deviceInfo.deviceInfo || fcmToken.DeviceInfo;
      fcmToken.LastUsedAt = new Date();
      await fcmToken.save();
    } else {
      // Create new token
      fcmToken = await UserFCMToken.create({
        NhanVienID: nhanVienId,
        Token: token,
        DeviceType: deviceInfo.deviceType || "web",
        DeviceInfo: deviceInfo.deviceInfo || {},
        IsActive: true,
      });
    }

    return fcmToken;
  }

  /**
   * Unregister FCM token
   */
  async unregisterToken(token) {
    await UserFCMToken.updateOne(
      { Token: token },
      { $set: { IsActive: false, DeactivatedAt: new Date() } }
    );
  }
}

// Singleton instance
const fcmService = new FCMService();
fcmService.init();

module.exports = fcmService;
```

### 2.3 Create UserFCMToken Model

**File:** `giaobanbv-be/modules/workmanagement/models/UserFCMToken.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userFCMTokenSchema = new Schema(
  {
    NhanVienID: {
      type: Schema.ObjectId,
      ref: "NhanVien",
      required: true,
      index: true,
    },

    Token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    DeviceType: {
      type: String,
      enum: ["web", "ios", "android"],
      default: "web",
    },

    DeviceInfo: {
      userAgent: String,
      platform: String,
      vendor: String,
    },

    IsActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    LastUsedAt: {
      type: Date,
      default: Date.now,
    },

    DeactivatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Compound index for active tokens lookup
userFCMTokenSchema.index({ NhanVienID: 1, IsActive: 1 });

// Auto-cleanup old inactive tokens (90 days)
userFCMTokenSchema.index(
  { DeactivatedAt: 1 },
  {
    expireAfterSeconds: 90 * 24 * 60 * 60,
    partialFilterExpression: { IsActive: false },
  }
);

module.exports = mongoose.model("UserFCMToken", userFCMTokenSchema);
```

### 2.4 Add FCM Routes

**File:** `giaobanbv-be/routes/notification.api.js`

```javascript
// Add to existing notification routes
const fcmService = require("../services/fcmService");

/**
 * @route POST /api/notifications/fcm/register
 * @desc Register FCM token for current user
 */
router.post("/fcm/register", loginRequired, async (req, res, next) => {
  try {
    const { token, deviceType, deviceInfo } = req.body;
    const { NhanVienID } = req.user;

    if (!token) {
      throw new AppError(400, "FCM token is required", "MISSING_TOKEN");
    }

    const result = await fcmService.registerToken(NhanVienID, token, {
      deviceType,
      deviceInfo,
    });

    sendResponse(
      res,
      200,
      true,
      { token: result },
      null,
      "FCM token registered successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/notifications/fcm/unregister
 * @desc Unregister FCM token
 */
router.post("/fcm/unregister", loginRequired, async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      throw new AppError(400, "FCM token is required", "MISSING_TOKEN");
    }

    await fcmService.unregisterToken(token);

    sendResponse(
      res,
      200,
      true,
      null,
      null,
      "FCM token unregistered successfully"
    );
  } catch (error) {
    next(error);
  }
});

/**
 * @route POST /api/notifications/fcm/test
 * @desc Send test push notification (dev only)
 */
router.post("/fcm/test", loginRequired, async (req, res, next) => {
  if (process.env.NODE_ENV === "production") {
    return next(new AppError(403, "Test endpoint disabled in production"));
  }

  try {
    const { NhanVienID } = req.user;

    const result = await fcmService.sendToUser(NhanVienID, {
      title: "Test Notification",
      body: "This is a test push notification",
      type: "TEST",
      url: "/yeu-cau",
    });

    sendResponse(res, 200, true, result, null, "Test notification sent");
  } catch (error) {
    next(error);
  }
});
```

### 2.5 Update Notification Service

**File:** `giaobanbv-be/modules/workmanagement/services/notificationService.js`

```javascript
// Add FCM integration
const fcmService = require("../../../services/fcmService");

// In the send() method, after creating notification in DB:
async send(recipients, notificationData) {
  // ... existing code to create in-app notification ...

  // Send push notification
  if (fcmService.initialized) {
    try {
      const fcmNotification = {
        title: notificationData.title,
        body: notificationData.message || notificationData.body,
        type: notificationData.type,
        url: notificationData.actionUrl,
        yeuCauId: notificationData.yeuCauId,
        priority: notificationData.priority,
      };

      await fcmService.sendToUsers(recipients, fcmNotification);
    } catch (error) {
      console.error("[NotificationService] FCM send failed:", error);
      // Don't throw - in-app notification still works
    }
  }

  // ... rest of existing code ...
}
```

---

## 🎨 Phase 3: Frontend Implementation (Day 5-7)

### 3.1 Install Dependencies

```bash
cd fe-bcgiaobanbvt
npm install firebase
```

### 3.2 Create Firebase Config

**File:** `fe-bcgiaobanbvt/src/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config from Step 1.4
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Messaging (only in browser that supports it)
let messaging = null;

try {
  if ("serviceWorker" in navigator && "PushManager" in window) {
    messaging = getMessaging(app);
  } else {
    console.warn("[Firebase] Push notifications not supported in this browser");
  }
} catch (error) {
  console.error("[Firebase] Messaging init failed:", error);
}

export { messaging, getToken, onMessage };
export default app;
```

### 3.3 Create Push Notification Hook

**File:** `fe-bcgiaobanbvt/src/hooks/usePushNotification.js`

```javascript
import { useState, useEffect, useCallback } from "react";
import { messaging, getToken, onMessage } from "../firebase";
import apiService from "app/apiService";
import { toast } from "react-toastify";

export default function usePushNotification() {
  const [permission, setPermission] = useState(Notification.permission);
  const [token, setToken] = useState(null);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(!!messaging);
  }, []);

  /**
   * Request notification permission
   */
  const requestPermission = useCallback(async () => {
    if (!isSupported) {
      toast.error("Trình duyệt không hỗ trợ push notification");
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission === "granted") {
        await registerToken();
        return true;
      } else {
        toast.warning("Bạn đã từ chối quyền nhận thông báo");
        return false;
      }
    } catch (error) {
      console.error("[Push] Permission request failed:", error);
      toast.error("Không thể xin quyền thông báo");
      return false;
    }
  }, [isSupported]);

  /**
   * Register FCM token with backend
   */
  const registerToken = useCallback(async () => {
    if (!messaging) return;

    try {
      const currentToken = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });

      if (currentToken) {
        // Send token to backend
        await apiService.post("/notifications/fcm/register", {
          token: currentToken,
          deviceType: "web",
          deviceInfo: {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            vendor: navigator.vendor,
          },
        });

        setToken(currentToken);
        console.log("[Push] Token registered:", currentToken);
      } else {
        console.warn("[Push] No registration token available");
      }
    } catch (error) {
      console.error("[Push] Token registration failed:", error);
    }
  }, []);

  /**
   * Unregister FCM token
   */
  const unregisterToken = useCallback(async () => {
    if (!token) return;

    try {
      await apiService.post("/notifications/fcm/unregister", { token });
      setToken(null);
      console.log("[Push] Token unregistered");
    } catch (error) {
      console.error("[Push] Unregister failed:", error);
    }
  }, [token]);

  /**
   * Listen for foreground messages
   */
  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("[Push] Foreground message:", payload);

      const { notification, data } = payload;

      // Show in-app toast
      toast.info(
        <div>
          <strong>{notification?.title}</strong>
          <p>{notification?.body}</p>
        </div>,
        {
          onClick: () => {
            if (data?.url) {
              window.location.href = data.url;
            }
          },
        }
      );

      // Optionally trigger badge count refresh
      // dispatch(refreshBadgeCounts());
    });

    return unsubscribe;
  }, []);

  /**
   * Auto-register token if permission already granted
   */
  useEffect(() => {
    if (permission === "granted" && !token) {
      registerToken();
    }
  }, [permission, token, registerToken]);

  return {
    permission,
    token,
    isSupported,
    requestPermission,
    registerToken,
    unregisterToken,
  };
}
```

### 3.4 Integrate in App.js

**File:** `fe-bcgiaobanbvt/src/App.js`

```javascript
import usePushNotification from "hooks/usePushNotification";

function App() {
  const { isSupported, requestPermission } = usePushNotification();
  const [showPushPrompt, setShowPushPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after 5 seconds if permission not yet requested
    if (isSupported && Notification.permission === "default") {
      const timer = setTimeout(() => {
        setShowPushPrompt(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [isSupported]);

  const handleEnablePush = async () => {
    const granted = await requestPermission();
    if (granted) {
      setShowPushPrompt(false);
      toast.success("Đã bật thông báo đẩy");
    }
  };

  return (
    <div>
      {/* Push notification prompt */}
      <Snackbar
        open={showPushPrompt}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message="Bật thông báo đẩy để nhận cập nhật ngay lập tức?"
        action={
          <>
            <Button color="primary" size="small" onClick={handleEnablePush}>
              Bật
            </Button>
            <IconButton size="small" onClick={() => setShowPushPrompt(false)}>
              <CloseIcon />
            </IconButton>
          </>
        }
      />

      {/* Rest of app */}
    </div>
  );
}
```

---

## 🔄 Phase 4: Service Worker Enhancement (Day 8)

### 4.1 Create Firebase Messaging SW

**File:** `fe-bcgiaobanbvt/public/firebase-messaging-sw.js`

```javascript
/* eslint-disable no-restricted-globals */

// Firebase Messaging Service Worker
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase (same config as frontend)
firebase.initializeApp({
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with actual values
  authDomain: "bcgiaobanbvt-prod.firebaseapp.com",
  projectId: "bcgiaobanbvt-prod",
  storageBucket: "bcgiaobanbvt-prod.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] Background message:", payload);

  const { title, body } = payload.notification || {};
  const { url, priority, type } = payload.data || {};

  const options = {
    body: body || "Bạn có thông báo mới",
    icon: "/logo192.png",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    tag: `notification-${type}-${Date.now()}`,
    requireInteraction: priority === "urgent",
    data: {
      url: url || "/",
      type,
    },
    actions: [
      { action: "open", title: "Xem ngay" },
      { action: "close", title: "Đóng" },
    ],
  };

  self.registration.showNotification(title || "Thông báo mới", options);
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("[FCM SW] Notification clicked:", event.action);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Open URL when clicked
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        // Open new window if not
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});

console.log("[FCM SW] 🔥 Firebase Messaging Service Worker loaded");
```

### 4.2 Update manifest.json

**File:** `fe-bcgiaobanbvt/public/manifest.json`

```json
{
  "short_name": "BC Bệnh viện",
  "name": "Báo cáo Giaoban - Bệnh viện Đa khoa Tỉnh Phú Thọ",
  // ... existing fields ...
  "gcm_sender_id": "103953800507",
  "scope": "/",
  "start_url": "/",
  "permissions": ["notifications"]
}
```

---

## 💾 Phase 5: Background Sync & Offline Queue (Day 9-10)

### 5.1 Create Offline Action Queue

**File:** `fe-bcgiaobanbvt/src/utils/offlineQueue.js`

```javascript
import { openDB } from "idb";

const DB_NAME = "ticket-offline-queue";
const STORE_NAME = "actions";
const DB_VERSION = 1;

class OfflineQueue {
  constructor() {
    this.db = null;
  }

  async init() {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
          store.createIndex("timestamp", "timestamp");
          store.createIndex("type", "type");
        }
      },
    });
  }

  async addAction(action) {
    if (!this.db) await this.init();

    const item = {
      ...action,
      timestamp: Date.now(),
      status: "pending",
    };

    await this.db.add(STORE_NAME, item);
    console.log("[OfflineQueue] Action queued:", item);

    // Try to sync immediately
    this.sync();
  }

  async getActions() {
    if (!this.db) await this.init();
    return await this.db.getAll(STORE_NAME);
  }

  async removeAction(id) {
    if (!this.db) await this.init();
    await this.db.delete(STORE_NAME, id);
  }

  async sync() {
    if (!navigator.onLine) {
      console.log("[OfflineQueue] Offline, skipping sync");
      return;
    }

    const actions = await this.getActions();

    for (const action of actions) {
      try {
        await this.executeAction(action);
        await this.removeAction(action.id);
        console.log("[OfflineQueue] Action synced:", action.id);
      } catch (error) {
        console.error("[OfflineQueue] Sync failed:", error);
        // Keep in queue for retry
      }
    }
  }

  async executeAction(action) {
    // Import apiService dynamically to avoid circular dependency
    const apiService = (await import("../app/apiService")).default;

    switch (action.type) {
      case "ADD_COMMENT":
        return apiService.post(
          `/workmanagement/yeucau/${action.yeuCauId}/binh-luan`,
          action.data
        );

      case "ADD_RATING":
        return apiService.post(
          `/workmanagement/yeucau/${action.yeuCauId}/actions/danh-gia`,
          action.data
        );

      case "TIEP_NHAN":
        return apiService.post(
          `/workmanagement/yeucau/${action.yeuCauId}/actions/tiep-nhan`,
          action.data
        );

      // Add more action types as needed

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }
}

export default new OfflineQueue();
```

### 5.2 Integrate Offline Queue in Redux

```javascript
// In yeuCauSlice.js
import offlineQueue from "utils/offlineQueue";

// Wrap actions with offline support
export const addComment = (yeuCauId, data) => async (dispatch) => {
  if (!navigator.onLine) {
    // Queue for later
    await offlineQueue.addAction({
      type: "ADD_COMMENT",
      yeuCauId,
      data,
    });

    toast.info("Bình luận sẽ được gửi khi có kết nối");
    return;
  }

  // Normal flow
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(
      `/workmanagement/yeucau/${yeuCauId}/binh-luan`,
      data
    );
    // ...
  } catch (error) {
    // If network error, queue for retry
    if (error.message.includes("Network")) {
      await offlineQueue.addAction({
        type: "ADD_COMMENT",
        yeuCauId,
        data,
      });
      toast.info("Không có kết nối. Bình luận sẽ được gửi sau.");
    }
  }
};
```

### 5.3 Listen for Online Event

```javascript
// In App.js or service worker
window.addEventListener("online", () => {
  console.log("[App] Back online, syncing...");
  offlineQueue.sync();
  toast.success("Đã kết nối lại. Đang đồng bộ dữ liệu...");
});
```

---

## 📊 Success Metrics

**Push Notifications:**

- Delivery rate: >= 95%
- Time to notification: < 5s
- Opt-in rate: >= 70%

**Offline Support:**

- Offline action success rate: >= 90%
- Background sync success: >= 95%

**Performance:**

- Service worker activation: < 500ms
- Cache hit rate: >= 80%
- PWA install rate: >= 60% (mobile users)

---

## ✅ Implementation Checklist

**Day 1: Firebase Setup**

- [ ] Create Firebase project
- [ ] Generate VAPID key
- [ ] Download service account JSON
- [ ] Add web app to Firebase

**Day 2-3: Backend FCM**

- [ ] Install firebase-admin
- [ ] Create fcmService.js
- [ ] Create UserFCMToken model
- [ ] Add FCM routes
- [ ] Update notificationService

**Day 4: Backend Testing**

- [ ] Test token registration
- [ ] Test push sending
- [ ] Test token cleanup
- [ ] Load test (100 concurrent)

**Day 5-6: Frontend FCM**

- [ ] Install firebase
- [ ] Create firebase.js config
- [ ] Create usePushNotification hook
- [ ] Integrate in App.js
- [ ] Add permission prompt

**Day 7: Service Worker**

- [ ] Create firebase-messaging-sw.js
- [ ] Update manifest.json
- [ ] Test background push
- [ ] Test notification click

**Day 8-9: Offline Queue**

- [ ] Create offlineQueue.js
- [ ] Integrate in Redux
- [ ] Add online/offline listeners
- [ ] Test background sync

**Day 10: Testing & Polish**

- [ ] Test on iOS PWA (16.4+)
- [ ] Test on Android Chrome
- [ ] Performance testing
- [ ] Documentation

---

**Next:** [03_REALTIME_RELIABILITY.md](./03_REALTIME_RELIABILITY.md)
