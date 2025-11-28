# 🔥 Notification System - FCM Push Setup

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Step 1: Firebase Project Setup](#step-1-firebase-project-setup)
3. [Step 2: Backend FCM Service](#step-2-backend-fcm-service)
4. [Step 3: Frontend FCM Integration](#step-3-frontend-fcm-integration)
5. [Step 4: Update Service Worker](#step-4-update-service-worker)
6. [Step 5: Smart Routing Logic](#step-5-smart-routing-logic)
7. [Step 6: Testing](#step-6-testing)
8. [Troubleshooting](#troubleshooting)

---

## 📌 OVERVIEW

### What is FCM?

Firebase Cloud Messaging (FCM) là dịch vụ push notification của Google:

- **Free** để sử dụng
- **Cross-platform**: Web, Android, iOS
- **Reliable**: Google infrastructure
- **Offline delivery**: Gửi khi user offline, nhận khi online lại

### Flow Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION FLOW                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. Feature triggers notification                               │
│      └─► NotificationService.send()                             │
│                                                                  │
│   2. Check: Is user online?                                      │
│      │                                                           │
│      ├─► YES (Socket connected)                                  │
│      │   └─► Send via Socket.IO (instant)                       │
│      │                                                           │
│      └─► NO (Offline)                                            │
│          └─► Send via FCM                                        │
│              └─► FCM Server (Google)                            │
│                  └─► Push to device                             │
│                      └─► Service Worker receives                │
│                          └─► Show system notification           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Prerequisites

- [ ] Backend đã hoàn thành (02_BACKEND_IMPLEMENTATION.md)
- [ ] Frontend đã hoàn thành (03_FRONTEND_IMPLEMENTATION.md)
- [ ] PWA Service Worker hoạt động (Phase 1)
- [ ] Google account để tạo Firebase project

---

## 📊 QUICK REFERENCE TABLES

### Push Decision Flowchart

```
┌─────────────────────────────────────────────────────────────────────┐
│                  PUSH NOTIFICATION DECISION TREE                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   NotificationService.send({type, recipientId, data})               │
│                        │                                             │
│                        ▼                                             │
│              ┌─────────────────────┐                                │
│              │ Get UserSettings    │                                │
│              └─────────┬───────────┘                                │
│                        │                                             │
│                        ▼                                             │
│         ┌──────────────────────────────┐                            │
│         │ enableNotifications = true?  │                            │
│         └──────────────┬───────────────┘                            │
│                        │                                             │
│              ┌────────┴────────┐                                    │
│              ▼                  ▼                                    │
│           [NO]               [YES]                                   │
│              │                  │                                    │
│              ▼                  ▼                                    │
│         ┌────────┐    ┌─────────────────────┐                       │
│         │ SKIP   │    │ shouldSend('inapp')? │                      │
│         │ ALL    │    └─────────┬───────────┘                       │
│         └────────┘              │                                    │
│                        ┌───────┴───────┐                            │
│                        ▼               ▼                            │
│                     [YES]            [NO]                            │
│                        │               │                            │
│                        ▼               │                            │
│              ┌─────────────────┐       │                            │
│              │ Save to MongoDB │       │                            │
│              └────────┬────────┘       │                            │
│                       │               │                            │
│                       ▼               │                            │
│         ┌─────────────────────────┐   │                            │
│         │   isUserOnline(userId)? │   │                            │
│         └────────────┬────────────┘   │                            │
│                      │                │                            │
│            ┌─────────┴─────────┐      │                            │
│            ▼                   ▼      │                            │
│         [ONLINE]           [OFFLINE]  │                            │
│            │                   │      │                            │
│            ▼                   ▼      │                            │
│   ┌────────────────┐  ┌──────────────────────┐                     │
│   │ Socket.IO emit │  │ shouldSend('push')? │                      │
│   │ (instant)      │  └──────────┬───────────┘                     │
│   └────────────────┘             │                                  │
│                         ┌────────┴────────┐                         │
│                         ▼                 ▼                         │
│                      [YES]              [NO]                        │
│                         │                 │                         │
│                         ▼                 ▼                         │
│              ┌──────────────────┐  ┌────────────┐                   │
│              │ Check quietHours │  │ SKIP Push  │                   │
│              └────────┬─────────┘  │ (saved in  │                   │
│                       │            │  DB only)  │                   │
│              ┌───────┴───────┐    └────────────┘                   │
│              ▼               ▼                                      │
│        [In quiet]     [Not quiet]                                   │
│              │               │                                      │
│              ▼               ▼                                      │
│       ┌────────────┐ ┌───────────────┐                             │
│       │ SKIP Push  │ │ FCM sendToUser│                             │
│       └────────────┘ │ (via Google)  │                             │
│                      └───────────────┘                             │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Socket.IO vs FCM Comparison

| Aspect           | Socket.IO                 | FCM Push                     |
| ---------------- | ------------------------- | ---------------------------- |
| **Khi nào dùng** | User đang online (tab mở) | User offline hoặc tab đóng   |
| **Tốc độ**       | Instant (~50ms)           | 1-3 giây                     |
| **Hiển thị**     | Toast trong app           | System notification          |
| **Yêu cầu**      | Browser tab mở            | Service Worker registered    |
| **Cost**         | Free (self-hosted)        | Free (Google limit)          |
| **Reliability**  | Depends on connection     | High (Google infrastructure) |
| **Quiet Hours**  | ❌ Không áp dụng          | ✅ Áp dụng                   |
| **User offline** | ❌ Không nhận             | ✅ Nhận khi online lại       |

### FCM Token Lifecycle

```
┌─────────────────────────────────────────────────────────────────┐
│                    FCM TOKEN LIFECYCLE                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. User Login                                                   │
│     │                                                            │
│     ▼                                                            │
│  2. Request Notification Permission                              │
│     │                                                            │
│     ├─► [Denied] → Cannot use push notifications                │
│     │                                                            │
│     └─► [Granted]                                                │
│           │                                                      │
│           ▼                                                      │
│  3. getToken(messaging, { vapidKey })                           │
│     │                                                            │
│     ▼                                                            │
│  4. FCM returns unique token for this browser/device             │
│     │                                                            │
│     ▼                                                            │
│  5. POST /api/notifications/settings/fcm-token                  │
│     { token: "...", deviceName: "Windows PC" }                  │
│     │                                                            │
│     ▼                                                            │
│  6. Token saved to UserNotificationSettings.fcmTokens[]         │
│     │                                                            │
│     ├─────────────────────────────────────────────────┐         │
│     │                                                  │         │
│     ▼                                                  ▼         │
│  [Token Valid]                               [Token Invalid]     │
│     │                                             │              │
│     ▼                                             ▼              │
│  FCM sends push successfully              FCMService detects     │
│                                           error code & removes   │
│                                           invalid token from DB  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Firebase Files Reference

|  #  | File                            | Location                     | Purpose                   |
| :-: | ------------------------------- | ---------------------------- | ------------------------- |
|  1  | `firebase-service-account.json` | `giaobanbv-be/config/`       | Backend auth với Firebase |
|  2  | `fcmService.js`                 | `giaobanbv-be/services/`     | Backend service gửi push  |
|  3  | `firebase.js`                   | `fe-bcgiaobanbvt/src/`       | Frontend Firebase config  |
|  4  | `usePushNotification.js`        | `fe-bcgiaobanbvt/src/hooks/` | Hook quản lý push         |
|  5  | `firebase-messaging-sw.js`      | `fe-bcgiaobanbvt/public/`    | Service Worker cho FCM    |

### Environment Variables Reference

**Backend (`giaobanbv-be/.env`):**

```env
# Không cần thêm - dùng service account JSON file
```

**Frontend (`fe-bcgiaobanbvt/.env`):**

```env
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123
REACT_APP_FIREBASE_VAPID_KEY=BLxxxx...
```

---

## 🔥 STEP 1: FIREBASE PROJECT SETUP

### 1.1 Create Firebase Project

1. Vào **[Firebase Console](https://console.firebase.google.com/)**
2. Click **"Add project"** hoặc **"Create a project"**
3. Nhập tên: `hospital-notification` (hoặc tên khác)
4. Disable Google Analytics (không cần cho notifications)
5. Click **"Create project"**
6. Đợi project được tạo xong

### 1.2 Enable Cloud Messaging

1. Trong Firebase Console, chọn project vừa tạo
2. Click **gear icon** → **Project settings**
3. Tab **"Cloud Messaging"**
4. Scroll xuống **"Web Push certificates"**
5. Click **"Generate key pair"**
6. **Copy VAPID Key** (dùng cho frontend)

**Lưu lại:**

```
VAPID Key: BLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 1.3 Get Server Key (Service Account)

1. Trong **Project settings** → Tab **"Service accounts"**
2. Click **"Generate new private key"**
3. Confirm → Download JSON file
4. Rename thành `firebase-service-account.json`
5. **Move to backend**: `giaobanbv-be/config/firebase-service-account.json`

⚠️ **IMPORTANT**: Add to `.gitignore`:

```
# Firebase
config/firebase-service-account.json
```

### 1.4 Get Firebase Config (Frontend)

1. Trong **Project settings** → Tab **"General"**
2. Scroll xuống **"Your apps"**
3. Click **"Web"** icon (</>) để add web app
4. App nickname: `Hospital Web`
5. ❌ Don't check "Firebase Hosting"
6. Click **"Register app"**
7. Copy config object:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "hospital-notification.firebaseapp.com",
  projectId: "hospital-notification",
  storageBucket: "hospital-notification.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
};
```

---

## 🔧 STEP 2: BACKEND FCM SERVICE

### 2.1 Install firebase-admin

```bash
cd giaobanbv-be
npm install firebase-admin
```

### 2.2 Create FCM Service

**File:** `giaobanbv-be/services/fcmService.js`

```javascript
const admin = require("firebase-admin");
const path = require("path");
const UserNotificationSettings = require("../models/UserNotificationSettings");

class FCMService {
  constructor() {
    this.initialized = false;
  }

  /**
   * Initialize Firebase Admin SDK
   */
  init() {
    try {
      // Path to service account JSON
      const serviceAccountPath = path.join(
        __dirname,
        "../config/firebase-service-account.json"
      );

      // Check if file exists
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
      console.log("[FCMService] ✅ Initialized successfully");
    } catch (error) {
      console.error("[FCMService] ❌ Initialization failed:", error.message);
    }
  }

  /**
   * Send push notification to a specific user
   * @param {string} userId - User._id
   * @param {Object} notification - { title, body, icon, actionUrl }
   */
  async sendToUser(userId, notification) {
    if (!this.initialized) {
      console.log("[FCMService] Not initialized, skipping push");
      return { success: false, reason: "not_initialized" };
    }

    try {
      // Get user's FCM tokens
      const settings = await UserNotificationSettings.findOne({ userId });

      if (!settings || !settings.fcmTokens || settings.fcmTokens.length === 0) {
        console.log(`[FCMService] No FCM tokens for user ${userId}`);
        return { success: false, reason: "no_tokens" };
      }

      // Send to all user's devices
      const tokens = settings.fcmTokens.map((t) => t.token);
      const results = await this.sendToTokens(tokens, notification);

      // Clean up invalid tokens
      const invalidTokens = [];
      results.forEach((result, index) => {
        if (result.error) {
          const errorCode = result.error.code;
          if (
            errorCode === "messaging/invalid-registration-token" ||
            errorCode === "messaging/registration-token-not-registered"
          ) {
            invalidTokens.push(tokens[index]);
          }
        }
      });

      // Remove invalid tokens from DB
      if (invalidTokens.length > 0) {
        settings.fcmTokens = settings.fcmTokens.filter(
          (t) => !invalidTokens.includes(t.token)
        );
        await settings.save();
        console.log(
          `[FCMService] Removed ${invalidTokens.length} invalid tokens`
        );
      }

      const successCount = results.filter((r) => r.success).length;
      console.log(
        `[FCMService] Sent to user ${userId}: ${successCount}/${tokens.length} succeeded`
      );

      return { success: successCount > 0, sent: successCount };
    } catch (error) {
      console.error("[FCMService] Error sending to user:", error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Send to multiple FCM tokens
   * @param {string[]} tokens - Array of FCM tokens
   * @param {Object} notification - { title, body, icon, actionUrl }
   */
  async sendToTokens(tokens, notification) {
    if (!this.initialized || tokens.length === 0) {
      return [];
    }

    const { title, body, icon, actionUrl, priority = "normal" } = notification;

    // Build FCM message
    const message = {
      notification: {
        title,
        body,
      },
      webpush: {
        notification: {
          icon: icon || "/logo192.png",
          badge: "/favicon.ico",
          vibrate: [200, 100, 200],
          requireInteraction: priority === "urgent",
          actions: [
            { action: "open", title: "Xem ngay" },
            { action: "close", title: "Đóng" },
          ],
        },
        fcmOptions: {
          link: actionUrl || "/",
        },
      },
      data: {
        url: actionUrl || "/",
        priority,
      },
    };

    // Send to each token
    const results = await Promise.all(
      tokens.map(async (token) => {
        try {
          await admin.messaging().send({
            ...message,
            token,
          });
          return { success: true };
        } catch (error) {
          return { success: false, error };
        }
      })
    );

    return results;
  }

  /**
   * Send to a single token (for testing)
   */
  async sendToToken(token, notification) {
    const results = await this.sendToTokens([token], notification);
    return results[0];
  }

  /**
   * Send to multiple users
   */
  async sendToUsers(userIds, notification) {
    const results = await Promise.all(
      userIds.map((userId) => this.sendToUser(userId, notification))
    );
    return results;
  }
}

// Singleton export
module.exports = new FCMService();
```

### 2.3 Initialize FCM in www

**File:** `giaobanbv-be/bin/www`

**Add after socketService.init():**

```javascript
// ... existing code ...

const socketService = require("../services/socketService");
const notificationService = require("../services/notificationService");
const fcmService = require("../services/fcmService");

// Initialize Socket.IO
socketService.init(server);

// Initialize FCM
fcmService.init();

// Load notification templates
notificationService.loadTemplates();

// ... rest of file ...
```

### 2.4 Update NotificationService to use FCM

**File:** `giaobanbv-be/services/notificationService.js`

**Uncomment and update the FCM section in `send()` method:**

```javascript
const fcmService = require("./fcmService");

// ... in send() method, find the FCM section and update:

// 7. Send via FCM if offline and push enabled
if (!isOnline && settings.shouldSend(type, "push")) {
  const fcmResult = await fcmService.sendToUser(recipientId, {
    title,
    body,
    icon: template.icon,
    actionUrl,
    priority: priority || template.defaultPriority,
  });

  if (fcmResult.success) {
    notification.deliveredVia.push("push");
    await notification.save();
  }
}
```

**Full updated send() method:**

```javascript
async send({ type, recipientId, data, priority }) {
  try {
    // 1. Get template
    const template = await this.getTemplate(type);
    if (!template) {
      console.error(`[NotificationService] Template not found: ${type}`);
      return null;
    }

    // 2. Get user settings
    const settings = await UserNotificationSettings.getOrCreate(recipientId);

    // 3. Check if user wants this notification (in-app)
    const wantsInapp = settings.shouldSend(type, "inapp");
    const wantsPush = settings.shouldSend(type, "push");

    if (!wantsInapp && !wantsPush) {
      console.log(
        `[NotificationService] User ${recipientId} disabled all channels for ${type}`
      );
      return null;
    }

    // 4. Render notification
    const title = this.renderTemplate(template.titleTemplate, data);
    const body = this.renderTemplate(template.bodyTemplate, data);
    const actionUrl = template.actionUrlTemplate
      ? this.renderTemplate(template.actionUrlTemplate, data)
      : null;

    // 5. Save to database (always, for history)
    const deliveredVia = [];
    if (wantsInapp) deliveredVia.push("inapp");

    const notification = await Notification.create({
      recipientId,
      type,
      title,
      body,
      icon: template.icon,
      priority: priority || template.defaultPriority,
      actionUrl,
      metadata: data,
      deliveredVia,
    });

    // 6. Send via Socket.IO if online and wants in-app
    const isOnline = socketService.isUserOnline(recipientId);

    if (wantsInapp && isOnline) {
      socketService.emitToUser(recipientId, "notification:new", {
        notification: notification.toObject(),
      });

      const unreadCount = await this.getUnreadCount(recipientId);
      socketService.emitToUser(recipientId, "notification:count", {
        count: unreadCount,
      });
    }

    // 7. Send via FCM if offline and wants push
    if (!isOnline && wantsPush) {
      const fcmResult = await fcmService.sendToUser(recipientId, {
        title,
        body,
        icon: template.icon,
        actionUrl,
        priority: priority || template.defaultPriority,
      });

      if (fcmResult.success) {
        notification.deliveredVia.push("push");
        await notification.save();
      }
    }

    console.log(
      `[NotificationService] ✅ Sent ${type} to ${recipientId} ` +
        `(online: ${isOnline}, via: ${notification.deliveredVia.join(", ")})`
    );

    return notification;
  } catch (error) {
    console.error("[NotificationService] Error:", error);
    throw error;
  }
}
```

---

## 🔧 STEP 3: FRONTEND FCM INTEGRATION

### 3.1 Install Firebase

```bash
cd fe-bcgiaobanbvt
npm install firebase
```

### 3.2 Create Firebase Config

**File:** `fe-bcgiaobanbvt/src/firebase.js`

```javascript
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your Firebase config (from Step 1.4)
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
if (typeof window !== "undefined" && "Notification" in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error("Firebase messaging not supported:", error);
  }
}

export { messaging, getToken, onMessage };
export default app;
```

### 3.3 Add Environment Variables

**File:** `fe-bcgiaobanbvt/.env`

```env
# Firebase Config
REACT_APP_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX
REACT_APP_FIREBASE_AUTH_DOMAIN=hospital-notification.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=hospital-notification
REACT_APP_FIREBASE_STORAGE_BUCKET=hospital-notification.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456

# VAPID Key (from Firebase Console > Cloud Messaging > Web Push certificates)
REACT_APP_FIREBASE_VAPID_KEY=BLxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3.4 Create usePushNotification Hook

**File:** `fe-bcgiaobanbvt/src/hooks/usePushNotification.js`

```javascript
import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { messaging, getToken, onMessage } from "../firebase";
import {
  saveFcmToken,
  addNotification,
} from "../features/notification/notificationSlice";

const VAPID_KEY = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export function usePushNotification() {
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.user);
  const [permission, setPermission] = useState(Notification.permission);
  const [isSupported, setIsSupported] = useState(false);

  // Check if push is supported
  useEffect(() => {
    const supported =
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      messaging !== null;

    setIsSupported(supported);
  }, []);

  // Request permission and get token
  const requestPermission = useCallback(async () => {
    if (!isSupported || !isAuthenticated) {
      return { success: false, reason: "not_supported" };
    }

    try {
      // Request permission
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result !== "granted") {
        console.log("[Push] Permission denied");
        return { success: false, reason: "permission_denied" };
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (!token) {
        console.error("[Push] Failed to get FCM token");
        return { success: false, reason: "no_token" };
      }

      console.log("[Push] FCM Token:", token.substring(0, 20) + "...");

      // Save token to backend
      const deviceName = getDeviceName();
      dispatch(saveFcmToken({ token, deviceName }));

      return { success: true, token };
    } catch (error) {
      console.error("[Push] Error:", error);
      return { success: false, reason: error.message };
    }
  }, [isSupported, isAuthenticated, dispatch]);

  // Listen for foreground messages
  useEffect(() => {
    if (!messaging || !isAuthenticated) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log("[Push] Foreground message:", payload);

      // Add to Redux store
      if (payload.notification) {
        dispatch(
          addNotification({
            _id: Date.now().toString(), // Temporary ID
            title: payload.notification.title,
            body: payload.notification.body,
            icon: "system",
            priority: payload.data?.priority || "normal",
            isRead: false,
            actionUrl: payload.data?.url,
            createdAt: new Date().toISOString(),
          })
        );
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, dispatch]);

  // Auto-request permission when authenticated
  useEffect(() => {
    if (isAuthenticated && permission === "default") {
      // Delay to not interrupt user
      const timer = setTimeout(() => {
        requestPermission();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, permission, requestPermission]);

  return {
    permission,
    isSupported,
    requestPermission,
  };
}

// Helper: Get device name
function getDeviceName() {
  const ua = navigator.userAgent;

  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows PC";
  if (/Mac/.test(ua)) return "Mac";
  if (/Linux/.test(ua)) return "Linux PC";

  return "Unknown Device";
}

export default usePushNotification;
```

### 3.5 Integrate Hook in App

**File:** `fe-bcgiaobanbvt/src/App.js`

**Add the hook inside the authenticated section:**

```javascript
import { usePushNotification } from "./hooks/usePushNotification";

function AppContent() {
  // Initialize push notifications
  usePushNotification();

  return (
    // ... your app content ...
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <AppContent />
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}
```

---

## 🔧 STEP 4: UPDATE SERVICE WORKER

### 4.1 Create Firebase Messaging Service Worker

**File:** `fe-bcgiaobanbvt/public/firebase-messaging-sw.js`

```javascript
/* eslint-disable no-restricted-globals */

// Firebase Messaging Service Worker
// This file MUST be at the root of public folder

importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

// Initialize Firebase (same config as frontend)
firebase.initializeApp({
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your values
  authDomain: "hospital-notification.firebaseapp.com",
  projectId: "hospital-notification",
  storageBucket: "hospital-notification.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("[FCM SW] Background message:", payload);

  const { title, body } = payload.notification || {};
  const { url, priority } = payload.data || {};

  const options = {
    body: body || "Bạn có thông báo mới",
    icon: "/logo192.png",
    badge: "/favicon.ico",
    vibrate: [200, 100, 200],
    tag: "notification-" + Date.now(),
    requireInteraction: priority === "urgent",
    data: {
      url: url || "/",
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

### 4.2 Update Main Service Worker (Optional Integration)

**File:** `fe-bcgiaobanbvt/public/service-worker.js`

**Add at the end of the file (optional, if you want combined SW):**

```javascript
// ... existing service worker code ...

// FCM Integration (alternative approach)
// Uncomment if you want to handle FCM in main service worker

/*
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { 
        notification: { 
          title: 'Thông báo mới', 
          body: event.data.text() 
        } 
      };
    }
  }
  
  const { title, body } = data.notification || {};
  const options = {
    body: body || 'Bạn có thông báo mới',
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [200, 100, 200],
    data: data.data || {},
  };
  
  event.waitUntil(
    self.registration.showNotification(title || 'Thông báo', options)
  );
});
*/
```

---

## 🔧 STEP 5: SMART ROUTING LOGIC

### 5.1 Final NotificationService Flow

```javascript
// In notificationService.js - send() method

// Simplified routing logic:
const isOnline = socketService.isUserOnline(recipientId);

if (isOnline) {
  // User is online → Socket.IO (instant, no push needed)
  socketService.emitToUser(recipientId, "notification:new", {...});
} else {
  // User is offline → FCM push
  await fcmService.sendToUser(recipientId, {...});
}
```

### 5.2 Handling Both Channels

```
┌─────────────────────────────────────────────────────────────┐
│                    SMART ROUTING                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   User Settings:                                             │
│   ├─ enableNotifications: true/false                        │
│   ├─ enablePush: true/false                                 │
│   └─ typePreferences: { TYPE: { inapp, push } }             │
│                                                              │
│   Routing Decision:                                          │
│                                                              │
│   if (settings.shouldSend(type, 'inapp'))                   │
│       → Save to DB (always)                                  │
│       → if (online) Send Socket.IO                          │
│                                                              │
│   if (settings.shouldSend(type, 'push') && !online)         │
│       → Send FCM push                                        │
│                                                              │
│   Quiet Hours:                                               │
│       → Only affects PUSH channel                            │
│       → In-app always works                                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧪 STEP 6: TESTING

### 6.1 Test FCM Token Registration

1. Start frontend: `npm start`
2. Login to app
3. Browser should ask for notification permission
4. Accept → Check console: `[Push] FCM Token: xxx...`
5. Check backend logs: should receive token

**Verify in MongoDB:**

```javascript
db.usernotificationsettings.findOne({ userId: ObjectId("...") });
// Should have fcmTokens array with your token
```

### 6.2 Test Push When Online (Should use Socket)

1. Keep browser open (online)
2. Send test notification:

```bash
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN"
```

3. **Expected**: Toast appears immediately (Socket.IO)
4. **Expected**: NO system notification (push not needed)

### 6.3 Test Push When Offline (Should use FCM)

1. **Close all app tabs** (simulate offline)
2. Send notification via API
3. **Expected**: System push notification appears
4. Click notification → App opens at correct URL

**Alternative offline test:**

1. Open DevTools → Application → Service Workers
2. Check "Offline" checkbox
3. Send notification
4. System notification should appear

### 6.4 Test on Mobile (PWA)

1. Install PWA on phone (Add to Home Screen)
2. Open app → Login → Accept notification permission
3. Close app completely
4. Send notification from backend
5. **Expected**: Push notification on phone
6. Tap notification → App opens

### 6.5 Test Quiet Hours

1. Set quiet hours in settings (e.g., current time range)
2. Send notification when offline
3. **Expected**: NO push notification (but saved in DB)
4. Open app → Notification visible in list

---

## 🐛 TROUBLESHOOTING

### Issue 1: FCM Token not generated

**Symptoms:** No token in console, saveFcmToken not called

**Solutions:**

```javascript
// 1. Check VAPID key is correct
console.log("VAPID:", process.env.REACT_APP_FIREBASE_VAPID_KEY);

// 2. Check firebase config
console.log("Firebase config:", firebaseConfig);

// 3. Check browser supports push
console.log("Push supported:", "PushManager" in window);

// 4. Check permission
console.log("Permission:", Notification.permission);
```

### Issue 2: Push not received on mobile

**Symptoms:** Works on desktop, not on mobile

**Solutions:**

```
1. iOS Safari:
   - Must be iOS 16.4+
   - Must install as PWA first
   - Must enable notifications in Settings

2. Android Chrome:
   - Check app notifications enabled in system settings
   - Try uninstall/reinstall PWA

3. Check firebase-messaging-sw.js:
   - Must be at PUBLIC root
   - Must have correct Firebase config
   - No syntax errors
```

### Issue 3: Background message handler not working

**Symptoms:** Push received but no notification shown

**Solutions:**

```javascript
// 1. Check firebase-messaging-sw.js loaded
// Console should show: "[FCM SW] 🔥 Firebase Messaging Service Worker loaded"

// 2. Check messaging.onBackgroundMessage is called
// Add console.log inside handler

// 3. Verify service worker registered
navigator.serviceWorker.getRegistrations().then(console.log);
```

### Issue 4: Notification click not opening app

**Symptoms:** Notification shows, click does nothing

**Solutions:**

```javascript
// 1. Check notificationclick handler in SW
self.addEventListener("notificationclick", (event) => {
  console.log("Clicked!", event);
  // ...
});

// 2. Check URL is valid
console.log("URL:", event.notification.data?.url);

// 3. Check clients.openWindow permission
// Must be called within event.waitUntil
```

### Issue 5: Invalid FCM tokens accumulating

**Symptoms:** Many failed push sends

**Solutions:**

```javascript
// FCMService already handles this:
// - Invalid tokens are detected by error code
// - They are automatically removed from DB

// To manually clean:
db.usernotificationsettings.updateMany({}, { $set: { fcmTokens: [] } });
```

---

## ✅ VERIFICATION CHECKLIST

### Firebase Setup

- [ ] Firebase project created
- [ ] VAPID key generated
- [ ] Service account JSON downloaded
- [ ] Firebase config added to frontend

### Backend

- [ ] firebase-admin installed
- [ ] firebase-service-account.json in config/
- [ ] FCMService created and initialized
- [ ] NotificationService updated to use FCM

### Frontend

- [ ] firebase package installed
- [ ] firebase.js config created
- [ ] usePushNotification hook created
- [ ] Hook integrated in App

### Service Worker

- [ ] firebase-messaging-sw.js created
- [ ] Correct Firebase config in SW
- [ ] Background message handler works
- [ ] Notification click opens app

### Testing

- [ ] Token generated on login
- [ ] Online user gets Socket.IO (not push)
- [ ] Offline user gets push notification
- [ ] Notification click navigates correctly
- [ ] Quiet hours respected
- [ ] Mobile PWA receives push

---

## 📚 SUMMARY

**What you built:**

- ✅ Firebase Cloud Messaging integration
- ✅ Smart routing: Socket.IO when online, FCM when offline
- ✅ User preference respect (quiet hours, per-type settings)
- ✅ Automatic token cleanup
- ✅ Cross-platform push (Desktop, Android, iOS 16.4+)

**Complete Notification System:**

| Component           | Status      |
| ------------------- | ----------- |
| Database Schemas    | ✅ Complete |
| Backend Services    | ✅ Complete |
| REST API            | ✅ Complete |
| Socket.IO Realtime  | ✅ Complete |
| FCM Push            | ✅ Complete |
| Frontend Components | ✅ Complete |
| User Settings       | ✅ Complete |

**Next Steps:**

1. **Integration**: Add notification triggers to existing features
2. **Scheduled Jobs**: Implement deadline reminder scheduler
3. **Analytics**: Track notification metrics
4. **Testing**: Comprehensive QA on all devices

---

## 📖 INTEGRATION EXAMPLES

### Example: Notify when task assigned

```javascript
// In CongViecController.js
const notificationService = require("../../services/notificationService");

exports.assignTask = async (req, res) => {
  // ... create/update task logic ...

  // Send notification
  await notificationService.send({
    type: "TASK_ASSIGNED",
    recipientId: task.NguoiThucHienID, // User._id
    data: {
      taskId: task._id,
      taskName: task.TenCongViec,
      assignerName: req.user.HoTen,
    },
  });

  return sendResponse(res, 200, true, { task }, null, "Đã giao việc");
};
```

### Example: Notify on comment

```javascript
// In BinhLuanController.js
exports.addComment = async (req, res) => {
  // ... create comment logic ...

  // Notify task owner and assignee
  const recipientIds = [task.NguoiTaoID, task.NguoiThucHienID].filter(
    (id) => id && id.toString() !== req.userId
  ); // Exclude commenter

  for (const recipientId of recipientIds) {
    await notificationService.send({
      type: "COMMENT_ADDED",
      recipientId,
      data: {
        taskId: task._id,
        commenterName: req.user.HoTen,
        commentPreview: comment.NoiDung.substring(0, 50) + "...",
      },
    });
  }
};
```

---

**🎉 Congratulations! Your Notification System is complete!**
