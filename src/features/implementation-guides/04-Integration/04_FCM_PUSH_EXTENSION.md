# 📱 FCM Push Notifications - Kế hoạch mở rộng

> **Status**: 🔜 PHASE 2 (Sau khi hoàn thành In-App notifications)  
> **Yêu cầu**: Firebase project đã setup, Service account key

---

## 🎯 Tổng quan

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         FCM INTEGRATION ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐   │
│   │                          TriggerService.fire()                           │   │
│   │                                    │                                     │   │
│   │                    ┌───────────────┴───────────────┐                    │   │
│   │                    ▼                               ▼                    │   │
│   │        ┌───────────────────┐           ┌───────────────────┐           │   │
│   │        │ notificationService│           │    fcmService     │           │   │
│   │        │     .send()       │           │     .send()       │           │   │
│   │        │  ✅ In-App        │           │  🔜 Push          │           │   │
│   │        │  (Socket.IO)      │           │  (Firebase)       │           │   │
│   │        └───────────────────┘           └───────────────────┘           │   │
│   │                    │                               │                    │   │
│   │                    ▼                               ▼                    │   │
│   │        ┌───────────────────┐           ┌───────────────────┐           │   │
│   │        │ User Online       │           │ User Offline      │           │   │
│   │        │ → Real-time       │           │ → Push to Device  │           │   │
│   │        └───────────────────┘           └───────────────────┘           │   │
│   └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Files cần tạo

```
giaobanbv-be/
├── config/
│   └── firebase.js              ← 🆕 Firebase Admin SDK config
│
├── services/
│   └── fcmService.js            ← 🆕 FCM send logic
│
├── modules/workmanagement/
│   └── models/
│       └── UserFCMToken.js      ← 🆕 Store device tokens
│
└── .env
    └── FIREBASE_SERVICE_ACCOUNT  ← 🆕 Path to service account JSON
```

---

## 📋 Implementation Steps

### Step 1: Firebase Project Setup

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│   📱 Firebase Console Setup                                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   1. Truy cập: https://console.firebase.google.com                              │
│                                                                                  │
│   2. Tạo project mới (hoặc dùng existing)                                       │
│      └─ Project name: "giaobanbv-push"                                          │
│                                                                                  │
│   3. Project Settings → Service accounts                                        │
│      └─ Generate new private key                                                │
│      └─ Download JSON file → firebase-service-account.json                      │
│                                                                                  │
│   4. Copy file vào: giaobanbv-be/config/firebase-service-account.json          │
│      ⚠️ Add to .gitignore!                                                      │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Step 2: Backend - UserFCMToken Model

```javascript
// modules/workmanagement/models/UserFCMToken.js

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userFCMTokenSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ["web", "android", "ios"],
      default: "web",
    },
    deviceInfo: {
      type: String, // Browser/Device info
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index để query nhanh
userFCMTokenSchema.index({ userId: 1, token: 1 }, { unique: true });

// Auto-cleanup inactive tokens (30 days)
userFCMTokenSchema.index(
  { lastUsedAt: 1 },
  { expireAfterSeconds: 30 * 24 * 60 * 60 }
);

module.exports = mongoose.model("UserFCMToken", userFCMTokenSchema);
```

### Step 3: Backend - FCM Service

```javascript
// services/fcmService.js

const admin = require("firebase-admin");
const UserFCMToken = require("../modules/workmanagement/models/UserFCMToken");

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = require("../config/firebase-service-account.json");
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

class FCMService {
  /**
   * Send push notification to a user
   * @param {string} userId - User._id
   * @param {Object} notification - { title, body }
   * @param {Object} data - Additional data payload
   */
  async sendToUser(userId, notification, data = {}) {
    try {
      // Get all active tokens for user
      const tokens = await UserFCMToken.find({
        userId,
        isActive: true,
      }).lean();

      if (tokens.length === 0) {
        console.log(`[FCMService] No active tokens for user: ${userId}`);
        return;
      }

      const tokenStrings = tokens.map((t) => t.token);

      // Send multicast message
      const message = {
        notification: {
          title: notification.title,
          body: notification.body,
        },
        data: {
          ...data,
          click_action: data.actionUrl || "/",
        },
        tokens: tokenStrings,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokenStrings[idx]);
          }
        });

        // Deactivate failed tokens
        if (failedTokens.length > 0) {
          await UserFCMToken.updateMany(
            { token: { $in: failedTokens } },
            { isActive: false }
          );
          console.log(
            `[FCMService] Deactivated ${failedTokens.length} invalid tokens`
          );
        }
      }

      console.log(
        `[FCMService] ✅ Sent to ${response.successCount}/${tokens.length} devices`
      );
    } catch (error) {
      console.error("[FCMService] Error sending push:", error.message);
    }
  }

  /**
   * Register FCM token for user
   * @param {string} userId
   * @param {string} token
   * @param {string} deviceType
   * @param {string} deviceInfo
   */
  async registerToken(userId, token, deviceType = "web", deviceInfo = "") {
    try {
      await UserFCMToken.findOneAndUpdate(
        { userId, token },
        {
          userId,
          token,
          deviceType,
          deviceInfo,
          isActive: true,
          lastUsedAt: new Date(),
        },
        { upsert: true, new: true }
      );
      console.log(`[FCMService] ✅ Token registered for user: ${userId}`);
    } catch (error) {
      console.error("[FCMService] Error registering token:", error.message);
    }
  }

  /**
   * Unregister FCM token
   * @param {string} userId
   * @param {string} token
   */
  async unregisterToken(userId, token) {
    try {
      await UserFCMToken.findOneAndDelete({ userId, token });
      console.log(`[FCMService] Token unregistered for user: ${userId}`);
    } catch (error) {
      console.error("[FCMService] Error unregistering token:", error.message);
    }
  }
}

module.exports = new FCMService();
```

### Step 4: Update notificationService.js

```javascript
// Thêm vào notificationService.js - method send()

const fcmService = require("../../../services/fcmService");

// ... trong method send(), sau khi gửi socket ...

// 8. Send via FCM if offline and push enabled
if (!isOnline && settings.shouldSend(type, "push")) {
  await fcmService.sendToUser(
    recipientId,
    { title, body },
    {
      actionUrl,
      type: template.type,
      notificationId: String(notification._id),
    }
  );

  notification.deliveredVia.push("push");
  await notification.save();
}
```

### Step 5: Frontend - Register FCM Token

```javascript
// src/contexts/FCMContext.js (React)

import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      const token = await getToken(messaging, {
        vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY,
      });

      // Send token to backend
      await apiService.post("/notifications/fcm/register", {
        token,
        deviceType: "web",
        deviceInfo: navigator.userAgent,
      });

      return token;
    }
  } catch (error) {
    console.error("Error getting FCM token:", error);
  }
};

// Listen for foreground messages
onMessage(messaging, (payload) => {
  console.log("Foreground message:", payload);
  // Show in-app notification or update UI
});
```

---

## 🔗 API Endpoints (FCM)

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│   FCM Token Management APIs                                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   POST /api/notifications/fcm/register                                          │
│   ─────────────────────────────────────                                         │
│   Body: { token, deviceType, deviceInfo }                                       │
│   → Register FCM token cho user hiện tại                                        │
│                                                                                  │
│   DELETE /api/notifications/fcm/unregister                                      │
│   ───────────────────────────────────────                                       │
│   Body: { token }                                                               │
│   → Unregister FCM token (logout)                                               │
│                                                                                  │
│   GET /api/notifications/fcm/tokens                                             │
│   ─────────────────────────────────                                             │
│   → Get all active tokens của user (Admin debug)                                │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚙️ Environment Variables

```bash
# .env (Backend)
FIREBASE_SERVICE_ACCOUNT=./config/firebase-service-account.json

# .env (Frontend)
REACT_APP_FIREBASE_API_KEY=xxx
REACT_APP_FIREBASE_AUTH_DOMAIN=xxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=xxx
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:xxx
REACT_APP_FIREBASE_VAPID_KEY=xxx  # From Firebase Console → Cloud Messaging
```

---

## 📝 Service Worker (PWA)

```javascript
// public/firebase-messaging-sw.js

importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js"
);

firebase.initializeApp({
  apiKey: "xxx",
  projectId: "xxx",
  messagingSenderId: "123456789",
  appId: "xxx",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification;

  self.registration.showNotification(title, {
    body,
    icon: "/logo192.png",
    badge: "/badge.png",
    data: payload.data,
  });
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const actionUrl = event.notification.data?.actionUrl || "/";
  event.waitUntil(clients.openWindow(actionUrl));
});
```

---

## ✅ Checklist triển khai FCM

```
□ Firebase project setup
□ Download service account JSON
□ Create UserFCMToken model
□ Create fcmService.js
□ Add FCM routes
□ Update notificationService.send()
□ Frontend: Initialize Firebase
□ Frontend: Request permission & register token
□ Frontend: Service worker for background messages
□ Test push on multiple devices
□ Handle token refresh
```
