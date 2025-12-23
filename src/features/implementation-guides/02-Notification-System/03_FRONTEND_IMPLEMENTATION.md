# 🎨 Notification System - Frontend Implementation

## 📋 TABLE OF CONTENTS

1. [Prerequisites](#prerequisites)
2. [Step 1: Install Dependencies](#step-1-install-dependencies)
3. [Step 2: Create Socket Context](#step-2-create-socket-context)
4. [Step 3: Create Redux Slice](#step-3-create-redux-slice)
5. [Step 4: Create Components](#step-4-create-components)
6. [Step 5: Create Settings Page](#step-5-create-settings-page)
7. [Step 6: Integrate into Layout](#step-6-integrate-into-layout)
8. [Step 7: Admin UI (Notification Templates)](#step-7-admin-ui-notification-templates)
9. [Troubleshooting](#troubleshooting)

---

## ✅ PREREQUISITES

Trước khi bắt đầu:

- [ ] Backend đã hoàn thành (02_BACKEND_IMPLEMENTATION.md)
- [ ] Backend đang chạy với Socket.IO
- [ ] Templates đã seed vào database

**Verify backend:**

```bash
cd giaobanbv-be
npm start
# Should show: [SocketService] ✅ Initialized
```

---

## 📊 QUICK REFERENCE TABLES

### Component Hierarchy Diagram

```
┌───────────────────────────────────────────────────────────────────┐
│                    COMPONENT HIERARCHY                            │
├───────────────────────────────────────────────────────────────────┤
│                                                                    │
│                          ┌───────┐                               │
│                          │  App  │                               │
│                          └───┬───┘                               │
│                              │                                    │
│                    ┌─────────┼─────────┐                         │
│                    │         │         │                         │
│            ┌───────┴───┐ ┌───┴─────────┐ ┌────┴────────┐        │
│            │AuthProvider│ │SocketProvider│ │Redux Provider│        │
│            └───────┬────┘ └─────────────┘ └─────────────┘        │
│                    │                                              │
│                    ▼                                              │
│            ┌─────────────────┐                                    │
│            │   MainLayout    │                                    │
│            └────────┬────────┘                                    │
│                    │                                              │
│          ┌─────────┼───────────┐                                  │
│          │         │           │                                  │
│    ┌─────┴─────┐  ┌──┴───┐  ┌───┴─────┐                           │
│    │  Header   │  │Content│  │  Footer  │                           │
│    └─────┬─────┘  └───┬───┘  └─────────┘                           │
│          │            │                                           │
│    ┌─────┴─────────┐ │                                           │
│    │NotificationBell│ ├───────────────────────────┐              │
│    └───────┬────────┘ │                           │              │
│            │         ┌─┴──────────────────┐  ┌─────┴────────┐  │
│            │         │  NotificationPage  │  │NotificationSettings│  │
│            ▼         └────────┬───────────┘  └───────────────────┘  │
│   Desktop: ┌───────────────────┐   │                              │
│           │NotificationDropdown│   │                              │
│           └────────┬──────────┘   │                              │
│                   │             │                              │
│   Mobile:  ┌───────────────────┐   │                              │
│           │NotificationDrawer  │   │                              │
│           └────────┬──────────┘   │                              │
│                   │             │                              │
│                   ├─────────────┘                              │
│                   │                                             │
│                   ▼                                             │
│           ┌──────────────────┐                                   │
│           │ NotificationItem │  (Reusable cho cả 3 chỗ)        │
│           └──────────────────┘                                   │
│                                                                    │
└───────────────────────────────────────────────────────────────────┘
```

### Redux State Shape

```javascript
// store.getState().notification
{
  isLoading: false,           // Đang tải data?
  error: null,                // Lỗi nếu có
  notifications: [            // Danh sách thông báo
    {
      _id: "6541...",
      type: "TASK_ASSIGNED",
      title: "Công việc mới",
      body: "Nguyễn A đã giao...",
      icon: "task",
      priority: "normal",
      isRead: false,
      actionUrl: "/quan-ly-cong-viec/chi-tiet/123",
      createdAt: "2025-11-26T08:30:00Z"
    }
  ],
  unreadCount: 5,             // Số thông báo chưa đọc
  pagination: {
    page: 1,
    limit: 20,
    total: 45,
    totalPages: 3
  },
  settings: {                 // Cài đặt của user
    enableNotifications: true,
    enablePush: true,
    quietHours: { enabled: false, start: "22:00", end: "07:00" },
    typePreferences: {}
  },
  availableTypes: []          // Danh sách loại notification từ server
}
```

### Socket → Redux Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│              SOCKET → REDUX DATA FLOW                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────┐    ┌──────────────┐    ┌──────────────┐    │
│  │  Server  │    │SocketContext │    │ Redux Store  │    │
│  │(Socket.IO)│    │ (useSocket)  │    │              │    │
│  └────┬─────┘    └────┬─────────┘    └─────┬────────┘    │
│       │               │                   │               │
│       │ emit          │ on()              │ dispatch      │
│       │ "notification: │ handler           │               │
│       │ new"           │                   │               │
│       ▼               ▼                   ▼               │
│  ┌─────────────────────────────────────────────────┐    │
│  │  1. Server emits 'notification:new'                  │    │
│  │     { notification: {...} }                          │    │
│  │                                                      │    │
│  │  2. SocketContext on() handler receives event        │    │
│  │                                                      │    │
│  │  3. Handler dispatches Redux action:                 │    │
│  │     dispatch(addNotification(data.notification))     │    │
│  │                                                      │    │
│  │  4. Redux reducer updates state:                     │    │
│  │     state.notifications.unshift(notification)        │    │
│  │     state.unreadCount += 1                           │    │
│  │                                                      │    │
│  │  5. Components re-render with useSelector:           │    │
│  │     - NotificationBell badge updates                 │    │
│  │     - NotificationDropdown shows new item            │    │
│  │     - Toast appears (if urgent)                      │    │
│  └─────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Files to Create

|  #  | File                      | Location                     | Mô tả                          |
| :-: | ------------------------- | ---------------------------- | ------------------------------ |
|  1  | `SocketContext.js`        | `src/contexts/`              | Socket.IO provider             |
|  2  | `notificationSlice.js`    | `src/features/notification/` | Redux state + thunks           |
|  3  | `NotificationItem.js`     | `src/features/notification/` | Component hiển thị 1 item      |
|  4  | `NotificationDropdown.js` | `src/features/notification/` | Popup khi click bell (Desktop) |
|  5  | `NotificationDrawer.js`   | `src/features/notification/` | Full drawer (Mobile)           |
|  6  | `NotificationBell.js`     | `src/features/notification/` | Bell icon + badge              |
|  7  | `NotificationSettings.js` | `src/features/notification/` | Trang cài đặt                  |
|  8  | `NotificationPage.js`     | `src/pages/`                 | Trang danh sách đầy đủ         |
|  9  | `index.js`                | `src/features/notification/` | Export all components          |

### Redux Actions Reference

| Action                       | Type  | Payload                   | Mô tả                       |
| ---------------------------- | ----- | ------------------------- | --------------------------- |
| `getNotifications`           | Thunk | `{ page, limit, isRead }` | Lấy danh sách từ API        |
| `loadMoreNotifications`      | Thunk | `{ page, limit }`         | Load thêm (infinite scroll) |
| `getUnreadCount`             | Thunk | -                         | Lấy số chưa đọc             |
| `markAsRead`                 | Thunk | `notificationId`          | Đánh dấu đã đọc             |
| `markAllAsRead`              | Thunk | -                         | Đánh dấu tất cả             |
| `deleteNotification`         | Thunk | `notificationId`          | Xóa 1 notification          |
| `getNotificationSettings`    | Thunk | -                         | Lấy cài đặt                 |
| `updateNotificationSettings` | Thunk | `settings`                | Cập nhật cài đặt            |
| `saveFcmToken`               | Thunk | `{ token, deviceName }`   | Lưu FCM token               |
| `addNotification`            | Sync  | `notification`            | Thêm từ Socket              |
| `setUnreadCount`             | Sync  | `count`                   | Update count từ Socket      |
| `resetState`                 | Sync  | -                         | Reset khi logout            |

---

## 🔧 STEP 1: INSTALL DEPENDENCIES

**Run in `fe-bcgiaobanbvt` folder:**

```bash
npm install socket.io-client
```

**Verify in `package.json`:**

```json
{
  "dependencies": {
    "socket.io-client": "^4.7.x"
  }
}
```

---

## 🔧 STEP 2: CREATE SOCKET CONTEXT

### 2.1 Socket Context Provider

**File:** `fe-bcgiaobanbvt/src/contexts/SocketContext.js`

```javascript
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useSelector } from "react-redux";

const SocketContext = createContext(null);

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:8080";

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated, accessToken } = useSelector((state) => state.user);

  useEffect(() => {
    // Only connect if authenticated
    if (!isAuthenticated || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("[Socket] ✅ Connected:", newSocket.id);
      setIsConnected(true);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[Socket] ❌ Disconnected:", reason);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("[Socket] Connection error:", error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount or token change
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, accessToken]);

  // Emit event to server
  const emit = useCallback(
    (event, data) => {
      if (socket && isConnected) {
        socket.emit(event, data);
      }
    },
    [socket, isConnected]
  );

  // Subscribe to event
  const on = useCallback(
    (event, callback) => {
      if (socket) {
        socket.on(event, callback);
        return () => socket.off(event, callback);
      }
      return () => {};
    },
    [socket]
  );

  // Unsubscribe from event
  const off = useCallback(
    (event, callback) => {
      if (socket) {
        socket.off(event, callback);
      }
    },
    [socket]
  );

  const value = {
    socket,
    isConnected,
    emit,
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}

export default SocketContext;
```

### 2.2 Add SocketProvider to App

**File:** `fe-bcgiaobanbvt/src/App.js`

**Find the providers section and ADD SocketProvider:**

```javascript
import { SocketProvider } from "./contexts/SocketContext";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>{/* ... rest of app ... */}</Router>
      </SocketProvider>
    </AuthProvider>
  );
}
```

### 2.3 Add Environment Variable

**File:** `fe-bcgiaobanbvt/.env`

```env
REACT_APP_SOCKET_URL=http://localhost:8080
```

**For production `.env.production`:**

```env
REACT_APP_SOCKET_URL=https://your-api-domain.com
```

---

## 🔧 STEP 3: CREATE REDUX SLICE

### 3.1 Notification Slice

**File:** `fe-bcgiaobanbvt/src/features/notification/notificationSlice.js`

```javascript
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService";

const initialState = {
  isLoading: false,
  error: null,
  notifications: [],
  unreadCount: 0,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  settings: null,
  availableTypes: [],
};

const slice = createSlice({
  name: "notification",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    // Get notifications
    getNotificationsSuccess(state, action) {
      state.isLoading = false;
      state.notifications = action.payload.notifications;
      state.pagination = action.payload.pagination;
    },
    // Load more notifications (append)
    loadMoreSuccess(state, action) {
      state.isLoading = false;
      state.notifications = [
        ...state.notifications,
        ...action.payload.notifications,
      ];
      state.pagination = action.payload.pagination;
    },
    // Update unread count
    setUnreadCount(state, action) {
      state.unreadCount = action.payload;
    },
    // Add new notification (from socket)
    addNotification(state, action) {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
      state.pagination.total += 1;
    },
    // Mark as read
    markAsReadSuccess(state, action) {
      const notification = state.notifications.find(
        (n) => n._id === action.payload
      );
      if (notification && !notification.isRead) {
        notification.isRead = true;
        notification.readAt = new Date().toISOString();
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    // Mark all as read
    markAllAsReadSuccess(state) {
      state.notifications.forEach((n) => {
        n.isRead = true;
        n.readAt = new Date().toISOString();
      });
      state.unreadCount = 0;
    },
    // Delete notification
    deleteNotificationSuccess(state, action) {
      const index = state.notifications.findIndex(
        (n) => n._id === action.payload
      );
      if (index !== -1) {
        const notification = state.notifications[index];
        if (!notification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
        state.notifications.splice(index, 1);
        state.pagination.total -= 1;
      }
    },
    // Settings
    getSettingsSuccess(state, action) {
      state.isLoading = false;
      state.settings = action.payload.settings;
      state.availableTypes = action.payload.availableTypes;
    },
    updateSettingsSuccess(state, action) {
      state.isLoading = false;
      state.settings = { ...state.settings, ...action.payload };
    },
    // Reset state (on logout)
    resetState(state) {
      return initialState;
    },
  },
});

export const {
  addNotification,
  setUnreadCount,
  markAsReadSuccess,
  markAllAsReadSuccess,
  resetState,
} = slice.actions;

export default slice.reducer;

// ============ THUNKS ============

/**
 * Get notifications with pagination
 */
export const getNotifications =
  ({ page = 1, limit = 20, isRead } = {}) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = { page, limit };
      if (isRead !== undefined) params.isRead = isRead;

      const response = await apiService.get("/notifications", { params });
      dispatch(slice.actions.getNotificationsSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

/**
 * Load more notifications (pagination)
 */
export const loadMoreNotifications =
  ({ page, limit = 20 }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.get("/notifications", {
        params: { page, limit },
      });
      dispatch(slice.actions.loadMoreSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
    }
  };

/**
 * Get unread count
 */
export const getUnreadCount = () => async (dispatch) => {
  try {
    const response = await apiService.get("/notifications/unread-count");
    dispatch(slice.actions.setUnreadCount(response.data.data.count));
  } catch (error) {
    console.error("Failed to get unread count:", error);
  }
};

/**
 * Mark notification as read
 */
export const markAsRead = (notificationId) => async (dispatch) => {
  try {
    await apiService.put(`/notifications/${notificationId}/read`);
    dispatch(slice.actions.markAsReadSuccess(notificationId));
  } catch (error) {
    toast.error(error.message);
  }
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = () => async (dispatch) => {
  try {
    await apiService.put("/notifications/read-all");
    dispatch(slice.actions.markAllAsReadSuccess());
    toast.success("Đã đánh dấu tất cả đã đọc");
  } catch (error) {
    toast.error(error.message);
  }
};

/**
 * Delete notification
 */
export const deleteNotification = (notificationId) => async (dispatch) => {
  try {
    await apiService.delete(`/notifications/${notificationId}`);
    dispatch(slice.actions.deleteNotificationSuccess(notificationId));
    toast.success("Đã xóa thông báo");
  } catch (error) {
    toast.error(error.message);
  }
};

/**
 * Get notification settings
 */
export const getNotificationSettings = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/notifications/settings");
    dispatch(slice.actions.getSettingsSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Update notification settings
 */
export const updateNotificationSettings = (settings) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.put("/notifications/settings", settings);
    dispatch(slice.actions.updateSettingsSuccess(settings));
    toast.success("Đã cập nhật cài đặt thông báo");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

/**
 * Save FCM token
 */
export const saveFcmToken =
  ({ token, deviceName }) =>
  async (dispatch) => {
    try {
      await apiService.post("/notifications/settings/fcm-token", {
        token,
        deviceName,
      });
      console.log("[Notification] FCM token saved");
    } catch (error) {
      console.error("Failed to save FCM token:", error);
    }
  };
```

### 3.2 Register Slice in Store

**File:** `fe-bcgiaobanbvt/src/app/store.js`

**Add to reducers:**

```javascript
import notificationReducer from "../features/notification/notificationSlice";

const rootReducer = combineReducers({
  // ... existing reducers ...
  notification: notificationReducer,
});
```

---

## 🔧 STEP 4: CREATE COMPONENTS

### 4.1 Create Component Directory

```bash
mkdir -p src/features/notification
```

### 4.2 NotificationItem Component

**File:** `fe-bcgiaobanbvt/src/features/notification/NotificationItem.js`

```javascript
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  Assignment as TaskIcon,
  Comment as CommentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckIcon,
  Schedule as ClockIcon,
  Assessment as KpiIcon,
  Support as TicketIcon,
  Notifications as SystemIcon,
  Delete as DeleteIcon,
  Circle as UnreadIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { markAsRead, deleteNotification } from "./notificationSlice";

// Icon mapping
const iconMap = {
  task: TaskIcon,
  comment: CommentIcon,
  warning: WarningIcon,
  check: CheckIcon,
  clock: ClockIcon,
  kpi: KpiIcon,
  ticket: TicketIcon,
  system: SystemIcon,
  notification: SystemIcon,
};

// Color mapping
const colorMap = {
  task: "primary",
  comment: "info",
  warning: "error",
  check: "success",
  clock: "warning",
  kpi: "secondary",
  ticket: "primary",
  system: "default",
};

function NotificationItem({ notification, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    _id,
    title,
    body,
    icon = "notification",
    priority,
    isRead,
    actionUrl,
    createdAt,
  } = notification;

  const IconComponent = iconMap[icon] || SystemIcon;
  const color = colorMap[icon] || "default";
  const isUrgent = priority === "urgent";

  const handleClick = () => {
    // Mark as read
    if (!isRead) {
      dispatch(markAsRead(_id));
    }

    // Navigate if has action URL
    if (actionUrl) {
      navigate(actionUrl);
      if (onClose) onClose();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteNotification(_id));
  };

  const timeAgo = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <ListItem
      onClick={handleClick}
      sx={{
        cursor: actionUrl ? "pointer" : "default",
        backgroundColor: isRead ? "transparent" : "action.hover",
        borderLeft: isUrgent ? "3px solid" : "none",
        borderColor: "error.main",
        "&:hover": {
          backgroundColor: "action.selected",
        },
        pr: 1,
      }}
      secondaryAction={
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          {!isRead && (
            <UnreadIcon sx={{ fontSize: 10, color: "primary.main" }} />
          )}
          <Tooltip title="Xóa">
            <IconButton size="small" onClick={handleDelete}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      }
    >
      <ListItemAvatar>
        <Avatar
          sx={{
            bgcolor: `${color}.light`,
            color: `${color}.main`,
          }}
        >
          <IconComponent />
        </Avatar>
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: isRead ? "normal" : "bold",
              color: isUrgent ? "error.main" : "text.primary",
            }}
          >
            {title}
          </Typography>
        }
        secondary={
          <Box component="span">
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }}
            >
              {body}
            </Typography>
            <Typography variant="caption" color="text.disabled">
              {timeAgo}
            </Typography>
          </Box>
        }
      />
    </ListItem>
  );
}

export default NotificationItem;
```

### 4.3 NotificationDropdown Component

**File:** `fe-bcgiaobanbvt/src/features/notification/NotificationDropdown.js`

```javascript
import React, { useEffect } from "react";
import {
  Box,
  Popover,
  Typography,
  List,
  Divider,
  Button,
  CircularProgress,
  Skeleton,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import NotificationItem from "./NotificationItem";
import { getNotifications, markAllAsRead } from "./notificationSlice";

function NotificationDropdown({ anchorEl, open, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, isLoading, unreadCount, pagination } = useSelector(
    (state) => state.notification
  );

  useEffect(() => {
    if (open) {
      dispatch(getNotifications({ page: 1, limit: 5 }));
    }
  }, [open, dispatch]);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  const handleViewAll = () => {
    navigate("/thong-bao");
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "right",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      PaperProps={{
        sx: {
          width: 360,
          maxHeight: 480,
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">
          Thông báo
          {unreadCount > 0 && (
            <Typography
              component="span"
              variant="caption"
              sx={{
                ml: 1,
                px: 1,
                py: 0.25,
                bgcolor: "error.main",
                color: "white",
                borderRadius: 10,
              }}
            >
              {unreadCount}
            </Typography>
          )}
        </Typography>
        {unreadCount > 0 && (
          <Button size="small" onClick={handleMarkAllRead}>
            Đánh dấu đã đọc
          </Button>
        )}
      </Box>

      <Divider />

      {/* Notification List */}
      {isLoading ? (
        <Box sx={{ p: 2 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ display: "flex", mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} />
              <Box sx={{ ml: 2, flex: 1 }}>
                <Skeleton width="80%" />
                <Skeleton width="60%" />
              </Box>
            </Box>
          ))}
        </Box>
      ) : notifications.length === 0 ? (
        <Box sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Không có thông báo nào</Typography>
        </Box>
      ) : (
        <List disablePadding sx={{ maxHeight: 320, overflow: "auto" }}>
          {notifications.slice(0, 5).map((notification) => (
            <React.Fragment key={notification._id}>
              <NotificationItem notification={notification} onClose={onClose} />
              <Divider component="li" />
            </React.Fragment>
          ))}
        </List>
      )}

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 1 }}>
        <Button fullWidth onClick={handleViewAll}>
          Xem tất cả thông báo
        </Button>
      </Box>
    </Popover>
  );
}

export default NotificationDropdown;
```

### 4.4 NotificationBell Component

**File:** `fe-bcgiaobanbvt/src/features/notification/NotificationBell.js`

```javascript
import React, { useState, useEffect, useCallback } from "react";
import { IconButton, Badge, Tooltip } from "@mui/material";
import { Notifications as NotificationIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useSocket } from "../../contexts/SocketContext";
import NotificationDropdown from "./NotificationDropdown";
import {
  getUnreadCount,
  addNotification,
  setUnreadCount,
} from "./notificationSlice";

function NotificationBell() {
  const dispatch = useDispatch();
  const { on, isConnected } = useSocket();
  const { unreadCount } = useSelector((state) => state.notification);
  const [anchorEl, setAnchorEl] = useState(null);

  // Fetch initial unread count
  useEffect(() => {
    dispatch(getUnreadCount());
  }, [dispatch]);

  // Listen to socket events
  useEffect(() => {
    if (!isConnected) return;

    // New notification received
    const unsubNew = on("notification:new", (data) => {
      dispatch(addNotification(data.notification));

      // Show toast for urgent notifications
      if (data.notification.priority === "urgent") {
        toast.warning(data.notification.title, {
          onClick: () => {
            if (data.notification.actionUrl) {
              window.location.href = data.notification.actionUrl;
            }
          },
        });
      } else {
        toast.info(data.notification.title);
      }
    });

    // Unread count update
    const unsubCount = on("notification:count", (data) => {
      dispatch(setUnreadCount(data.count));
    });

    return () => {
      unsubNew();
      unsubCount();
    };
  }, [isConnected, on, dispatch]);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Tooltip title="Thông báo">
        <IconButton color="inherit" onClick={handleOpen} sx={{ ml: 1 }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <NotificationDropdown
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      />
    </>
  );
}

export default NotificationBell;
```

### 4.5 NotificationDrawer Component (Full Page Mobile)

**File:** `fe-bcgiaobanbvt/src/features/notification/NotificationDrawer.js`

```javascript
import React, { useEffect, useCallback, useRef } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  Divider,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import NotificationItem from "./NotificationItem";
import {
  getNotifications,
  loadMoreNotifications,
  markAllAsRead,
} from "./notificationSlice";

function NotificationDrawer({ open, onClose }) {
  const dispatch = useDispatch();
  const listRef = useRef(null);

  const { notifications, isLoading, unreadCount, pagination } = useSelector(
    (state) => state.notification
  );

  // Fetch notifications on open
  useEffect(() => {
    if (open) {
      dispatch(getNotifications({ page: 1, limit: 20 }));
    }
  }, [open, dispatch]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && pagination.page < pagination.totalPages) {
      dispatch(loadMoreNotifications({ page: pagination.page + 1 }));
    }
  }, [dispatch, isLoading, pagination]);

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: { width: { xs: "100%", sm: 400 } },
      }}
    >
      {/* Header */}
      <AppBar position="static" color="default" elevation={0}>
        <Toolbar>
          <IconButton edge="start" onClick={onClose}>
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1, ml: 2 }}>
            Thông báo
            {unreadCount > 0 && (
              <Typography
                component="span"
                variant="caption"
                sx={{
                  ml: 1,
                  px: 1,
                  py: 0.25,
                  bgcolor: "error.main",
                  color: "white",
                  borderRadius: 10,
                }}
              >
                {unreadCount}
              </Typography>
            )}
          </Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Đánh dấu đã đọc
            </Button>
          )}
        </Toolbar>
      </AppBar>

      <Divider />

      {/* Notification List */}
      <Box
        ref={listRef}
        onScroll={handleScroll}
        sx={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        {notifications.length === 0 && !isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              Không có thông báo nào
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <NotificationItem
                  notification={notification}
                  onClose={onClose}
                />
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {/* Loading indicator */}
        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {/* End of list message */}
        {!isLoading &&
          notifications.length > 0 &&
          pagination.page >= pagination.totalPages && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", p: 2 }}
            >
              Đã hiển thị tất cả thông báo
            </Typography>
          )}
      </Box>
    </Drawer>
  );
}

export default NotificationDrawer;
```

### 4.6 Export Index

**File:** `fe-bcgiaobanbvt/src/features/notification/index.js`

```javascript
export { default as NotificationBell } from "./NotificationBell";
export { default as NotificationDropdown } from "./NotificationDropdown";
export { default as NotificationDrawer } from "./NotificationDrawer";
export { default as NotificationItem } from "./NotificationItem";
export { default as notificationReducer } from "./notificationSlice";
export * from "./notificationSlice";
```

---

## 🔧 STEP 5: CREATE SETTINGS PAGE

### 5.1 NotificationSettings Component

**File:** `fe-bcgiaobanbvt/src/features/notification/NotificationSettings.js`

```javascript
import React, { useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Grid,
  TextField,
  Button,
  Skeleton,
  Alert,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  getNotificationSettings,
  updateNotificationSettings,
} from "./notificationSlice";

function NotificationSettings() {
  const dispatch = useDispatch();
  const { settings, availableTypes, isLoading, error } = useSelector(
    (state) => state.notification
  );

  useEffect(() => {
    dispatch(getNotificationSettings());
  }, [dispatch]);

  const handleGlobalToggle = (field) => (event) => {
    dispatch(
      updateNotificationSettings({
        [field]: event.target.checked,
      })
    );
  };

  const handleQuietHoursToggle = (event) => {
    dispatch(
      updateNotificationSettings({
        quietHours: {
          ...settings.quietHours,
          enabled: event.target.checked,
        },
      })
    );
  };

  const handleQuietHoursChange = (field) => (event) => {
    dispatch(
      updateNotificationSettings({
        quietHours: {
          ...settings.quietHours,
          [field]: event.target.value,
        },
      })
    );
  };

  const handleTypeToggle = (type, channel) => (event) => {
    const currentPrefs = settings.typePreferences?.[type] || {
      inapp: true,
      push: true,
    };
    dispatch(
      updateNotificationSettings({
        typePreferences: {
          [type]: {
            ...currentPrefs,
            [channel]: event.target.checked,
          },
        },
      })
    );
  };

  if (isLoading && !settings) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={300} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!settings) return null;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Cài đặt thông báo
      </Typography>

      {/* Global Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cài đặt chung
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.enableNotifications}
                onChange={handleGlobalToggle("enableNotifications")}
              />
            }
            label="Bật thông báo"
          />

          <FormControlLabel
            control={
              <Switch
                checked={settings.enablePush}
                onChange={handleGlobalToggle("enablePush")}
                disabled={!settings.enableNotifications}
              />
            }
            label="Bật push notification"
          />
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Giờ yên tĩnh
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Không gửi push notification trong khoảng thời gian này
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.quietHours?.enabled || false}
                onChange={handleQuietHoursToggle}
              />
            }
            label="Bật giờ yên tĩnh"
          />

          {settings.quietHours?.enabled && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Từ"
                  value={settings.quietHours?.start || "22:00"}
                  onChange={handleQuietHoursChange("start")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  type="time"
                  label="Đến"
                  value={settings.quietHours?.end || "07:00"}
                  onChange={handleQuietHoursChange("end")}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Per-Type Settings */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cài đặt theo loại thông báo
          </Typography>

          {availableTypes.map((type, index) => {
            const prefs = settings.typePreferences?.[type.type] || {
              inapp: true,
              push: true,
            };

            return (
              <React.Fragment key={type.type}>
                {index > 0 && <Divider sx={{ my: 2 }} />}
                <Box>
                  <Typography variant="subtitle1">{type.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {type.description}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3, mt: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={prefs.inapp}
                          onChange={handleTypeToggle(type.type, "inapp")}
                        />
                      }
                      label="In-app"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          size="small"
                          checked={prefs.push}
                          onChange={handleTypeToggle(type.type, "push")}
                        />
                      }
                      label="Push"
                    />
                  </Box>
                </Box>
              </React.Fragment>
            );
          })}
        </CardContent>
      </Card>
    </Box>
  );
}

export default NotificationSettings;
```

### 5.2 NotificationPage (Full List)

**File:** `fe-bcgiaobanbvt/src/pages/NotificationPage.js`

```javascript
import React, { useEffect, useCallback, useRef } from "react";
import {
  Container,
  Box,
  Typography,
  List,
  Divider,
  Button,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { NotificationItem } from "../features/notification";
import {
  getNotifications,
  loadMoreNotifications,
  markAllAsRead,
} from "../features/notification/notificationSlice";

function NotificationPage() {
  const dispatch = useDispatch();
  const listRef = useRef(null);
  const [tabValue, setTabValue] = React.useState(0);

  const { notifications, isLoading, unreadCount, pagination } = useSelector(
    (state) => state.notification
  );

  // Filter based on tab
  const filter = tabValue === 0 ? undefined : tabValue === 1 ? false : true;

  useEffect(() => {
    dispatch(
      getNotifications({
        page: 1,
        limit: 20,
        isRead: filter,
      })
    );
  }, [dispatch, filter]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    if (!listRef.current || isLoading) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    if (isNearBottom && pagination.page < pagination.totalPages) {
      dispatch(
        loadMoreNotifications({
          page: pagination.page + 1,
          isRead: filter,
        })
      );
    }
  }, [dispatch, isLoading, pagination, filter]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMarkAllRead = () => {
    dispatch(markAllAsRead());
  };

  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4">Thông báo</Typography>
        {unreadCount > 0 && (
          <Button variant="outlined" onClick={handleMarkAllRead}>
            Đánh dấu tất cả đã đọc ({unreadCount})
          </Button>
        )}
      </Box>

      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Tất cả" />
          <Tab
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Chưa đọc
                {unreadCount > 0 && (
                  <Typography
                    component="span"
                    variant="caption"
                    sx={{
                      px: 0.75,
                      py: 0.25,
                      bgcolor: "error.main",
                      color: "white",
                      borderRadius: 10,
                      minWidth: 20,
                      textAlign: "center",
                    }}
                  >
                    {unreadCount}
                  </Typography>
                )}
              </Box>
            }
          />
          <Tab label="Đã đọc" />
        </Tabs>
      </Paper>

      <Paper
        ref={listRef}
        onScroll={handleScroll}
        sx={{
          maxHeight: "calc(100vh - 250px)",
          overflow: "auto",
        }}
      >
        {notifications.length === 0 && !isLoading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <Typography color="text.secondary">
              {tabValue === 1
                ? "Không có thông báo chưa đọc"
                : "Không có thông báo nào"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <NotificationItem notification={notification} />
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}

        {isLoading && (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress size={24} />
          </Box>
        )}

        {!isLoading &&
          notifications.length > 0 &&
          pagination.page >= pagination.totalPages && (
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", textAlign: "center", p: 2 }}
            >
              Đã hiển thị tất cả thông báo
            </Typography>
          )}
      </Paper>
    </Container>
  );
}

export default NotificationPage;
```

### 5.3 Add Routes

**File:** `fe-bcgiaobanbvt/src/routes/index.js`

**Add notification routes:**

```javascript
import NotificationPage from "../pages/NotificationPage";
import NotificationSettings from "../features/notification/NotificationSettings";

// Add to your routes array:
{
  path: "/thong-bao",
  element: (
    <AuthRequire>
      <NotificationPage />
    </AuthRequire>
  ),
},
{
  path: "/cai-dat/thong-bao",
  element: (
    <AuthRequire>
      <NotificationSettings />
    </AuthRequire>
  ),
},
```

---

## 🔧 STEP 6: INTEGRATE INTO LAYOUT

### 6.1 Add NotificationBell to Header

**Find your header/navbar component and add:**

```javascript
import { NotificationBell } from "../features/notification";

function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        {/* ... other header content ... */}

        {/* Add NotificationBell before user menu */}
        <NotificationBell />

        {/* User menu */}
        <UserMenu />
      </Toolbar>
    </AppBar>
  );
}
```

### 6.2 Reset Notifications on Logout

**In your logout logic (usually in userSlice.js or AuthContext):**

```javascript
import { resetState } from "../features/notification/notificationSlice";

// In logout action:
export const logout = () => (dispatch) => {
  // ... existing logout logic ...

  // Reset notification state
  dispatch(resetState());
};
```

---

## 🧪 STEP 7: TESTING

### 7.1 Start Frontend

```bash
cd fe-bcgiaobanbvt
npm start
```

### 7.2 Test Checklist

#### Socket Connection

- [ ] Login to app
- [ ] Check console: `[Socket] ✅ Connected`
- [ ] Logout → check console: socket disconnected

#### Notification Bell

- [ ] Bell icon visible in header
- [ ] Badge shows unread count
- [ ] Click bell → dropdown opens
- [ ] Shows recent notifications

#### Receive Notification

- [ ] In another terminal, send test notification via API
- [ ] See notification appear in dropdown without refresh
- [ ] Toast notification shows
- [ ] Badge count increases

#### Mark as Read

- [ ] Click notification → marked as read
- [ ] Badge count decreases
- [ ] Click "Đánh dấu đã đọc" → all marked read

#### Full Page

- [ ] Navigate to `/thong-bao`
- [ ] All notifications visible
- [ ] Tabs filter correctly
- [ ] Infinite scroll loads more

#### Settings

- [ ] Navigate to `/cai-dat/thong-bao`
- [ ] Toggle global settings
- [ ] Toggle quiet hours
- [ ] Toggle per-type settings
- [ ] Changes persist after refresh

### 7.3 Send Test Notification

```bash
# Get token first
TOKEN="your_jwt_token"

# Send test
curl -X POST http://localhost:8080/api/notifications/test \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔧 STEP 7: ADMIN UI (Notification Templates)

### 7.1 Create notificationTemplateSlice

**File:** `src/features/Notification/Admin/notificationTemplateSlice.js`

```javascript
import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../../app/apiService";

const initialState = {
  isLoading: false,
  error: null,
  templates: [],
  selectedTemplate: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  stats: {
    total: 0,
    autoCreated: 0,
    inactive: 0,
    byCategory: {},
    mostUsed: [],
  },
  filters: {
    category: "",
    isAutoCreated: "",
    search: "",
  },
};

const slice = createSlice({
  name: "notificationTemplate",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getTemplatesSuccess(state, action) {
      state.isLoading = false;
      state.templates = action.payload.templates;
      state.pagination = action.payload.pagination;
      state.stats = {
        ...state.stats,
        ...action.payload.stats,
      };
    },
    getTemplateSuccess(state, action) {
      state.isLoading = false;
      state.selectedTemplate = action.payload;
    },
    createTemplateSuccess(state, action) {
      state.isLoading = false;
      state.templates.unshift(action.payload);
      state.stats.total += 1;
    },
    updateTemplateSuccess(state, action) {
      state.isLoading = false;
      const index = state.templates.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
      if (state.selectedTemplate?._id === action.payload._id) {
        state.selectedTemplate = action.payload;
      }
    },
    deleteTemplateSuccess(state, action) {
      state.isLoading = false;
      // Soft delete just updates isEnabled
      const index = state.templates.findIndex(
        (t) => t._id === action.payload._id
      );
      if (index !== -1) {
        state.templates[index] = action.payload;
      }
    },
    setFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearSelectedTemplate(state) {
      state.selectedTemplate = null;
    },
  },
});

export default slice.reducer;

// Thunks
export const getTemplates =
  (params = {}) =>
  async (dispatch, getState) => {
    dispatch(slice.actions.startLoading());
    try {
      const { filters, pagination } = getState().notificationTemplate;
      const queryParams = {
        page: params.page || pagination.page,
        limit: params.limit || pagination.limit,
        ...filters,
        ...params,
      };

      // Clean empty params
      Object.keys(queryParams).forEach((key) => {
        if (queryParams[key] === "" || queryParams[key] === undefined) {
          delete queryParams[key];
        }
      });

      const response = await apiService.get(
        "/workmanagement/notifications/templates",
        {
          params: queryParams,
        }
      );
      dispatch(slice.actions.getTemplatesSuccess(response.data.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message || "Lỗi tải danh sách templates");
    }
  };

export const getTemplate = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get(
      `/workmanagement/notifications/templates/${id}`
    );
    dispatch(slice.actions.getTemplateSuccess(response.data.data));
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi tải template");
  }
};

export const createTemplate = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post(
      "/workmanagement/notifications/templates",
      data
    );
    dispatch(slice.actions.createTemplateSuccess(response.data.data));
    toast.success("Tạo template thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi tạo template");
    throw error;
  }
};

export const updateTemplate = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put(
      `/workmanagement/notifications/templates/${id}`,
      data
    );
    dispatch(slice.actions.updateTemplateSuccess(response.data.data));
    toast.success("Cập nhật template thành công");
    return response.data.data;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi cập nhật template");
    throw error;
  }
};

export const deleteTemplate = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(
      `/workmanagement/notifications/templates/${id}`
    );
    dispatch(slice.actions.deleteTemplateSuccess(response.data.data));
    toast.success("Đã vô hiệu hóa template");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message || "Lỗi xóa template");
    throw error;
  }
};

export const testTemplate = (id, testData) => async (dispatch) => {
  try {
    const response = await apiService.post(
      `/workmanagement/notifications/templates/${id}/preview`,
      { data: testData }
    );
    toast.success("Preview template thành công!");
    return response.data.data;
  } catch (error) {
    toast.error(error.message || "Lỗi test template");
    throw error;
  }
};

export const setFilters = (filters) => (dispatch) => {
  dispatch(slice.actions.setFilters(filters));
  dispatch(getTemplates({ page: 1 }));
};

export const clearSelectedTemplate = () => (dispatch) => {
  dispatch(slice.actions.clearSelectedTemplate());
};
```

### 7.2 Register Slice in Store

**File:** `src/app/store.js`

```javascript
// Add import
import notificationTemplateReducer from "../features/Notification/Admin/notificationTemplateSlice";

// Add to reducer object
const rootReducer = combineReducers({
  // ... existing reducers
  notification: notificationReducer,
  notificationTemplate: notificationTemplateReducer, // 🆕 Add this
});
```

### 7.3 Create NotificationTemplateTable

**File:** `src/features/Notification/Admin/NotificationTemplateTable.js`

```javascript
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardHeader,
  Chip,
  IconButton,
  Stack,
  TextField,
  MenuItem,
  Tooltip,
  Typography,
  Alert,
  TablePagination,
} from "@mui/material";
import {
  Edit as EditIcon,
  Science as TestIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTable, usePagination } from "react-table";
import {
  getTemplates,
  setFilters,
  deleteTemplate,
} from "./notificationTemplateSlice";

const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả" },
  { value: "task", label: "Công việc" },
  { value: "kpi", label: "KPI" },
  { value: "ticket", label: "Yêu cầu" },
  { value: "system", label: "Hệ thống" },
  { value: "other", label: "Khác" },
];

const CATEGORY_COLORS = {
  task: "primary",
  kpi: "secondary",
  ticket: "info",
  system: "warning",
  other: "default",
};

function NotificationTemplateTable({ onEdit, onTest }) {
  const dispatch = useDispatch();
  const { templates, pagination, stats, filters, isLoading } = useSelector(
    (state) => state.notificationTemplate
  );

  useEffect(() => {
    dispatch(getTemplates());
  }, [dispatch]);

  const columns = useMemo(
    () => [
      {
        Header: "Type",
        accessor: "type",
        Cell: ({ row }) => (
          <Stack direction="row" alignItems="center" spacing={1}>
            {row.original.isAutoCreated && (
              <Tooltip title="Auto-created - Cần cấu hình">
                <WarningIcon color="warning" fontSize="small" />
              </Tooltip>
            )}
            <Typography variant="body2" fontFamily="monospace">
              {row.original.type}
            </Typography>
          </Stack>
        ),
      },
      {
        Header: "Tên",
        accessor: "name",
      },
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ value }) => (
          <Chip
            label={value || "other"}
            size="small"
            color={CATEGORY_COLORS[value] || "default"}
          />
        ),
      },
      {
        Header: "Priority",
        accessor: "defaultPriority",
        Cell: ({ value }) => (
          <Chip
            label={value}
            size="small"
            color={value === "urgent" ? "error" : "default"}
          />
        ),
      },
      {
        Header: "Sử dụng",
        accessor: "usageCount",
        Cell: ({ value }) => value || 0,
      },
      {
        Header: "Active",
        accessor: "isActive",
        Cell: ({ value }) => (
          <Chip
            label={value ? "Active" : "Inactive"}
            size="small"
            color={value ? "success" : "default"}
          />
        ),
      },
      {
        Header: "Hành động",
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Sửa">
              <IconButton size="small" onClick={() => onEdit(row.original)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Test">
              <IconButton
                size="small"
                color="info"
                onClick={() => onTest(row.original)}
              >
                <TestIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {row.original.isActive && (
              <Tooltip title="Vô hiệu hóa">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => {
                    if (window.confirm("Xác nhận vô hiệu hóa template?")) {
                      dispatch(deleteTemplate(row.original._id));
                    }
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        ),
      },
    ],
    [dispatch, onEdit, onTest]
  );

  const handleFilterChange = (field, value) => {
    dispatch(setFilters({ [field]: value }));
  };

  const handlePageChange = (event, newPage) => {
    dispatch(getTemplates({ page: newPage + 1 }));
  };

  const handleRowsPerPageChange = (event) => {
    dispatch(
      getTemplates({ limit: parseInt(event.target.value, 10), page: 1 })
    );
  };

  return (
    <Card>
      <CardHeader
        title="Quản lý Notification Templates"
        action={
          <Tooltip title="Làm mới">
            <IconButton onClick={() => dispatch(getTemplates())}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        }
      />

      {/* Stats Alert */}
      {stats.autoCreated > 0 && (
        <Box px={2}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              ⚠️ Có <strong>{stats.autoCreated}</strong> template được tự động
              tạo cần được cấu hình nội dung.
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Filters */}
      <Box px={2} pb={2}>
        <Stack direction="row" spacing={2}>
          <TextField
            size="small"
            label="Tìm kiếm"
            placeholder="Type hoặc tên..."
            value={filters.search || ""}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            size="small"
            label="Category"
            value={filters.category || ""}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            sx={{ minWidth: 150 }}
          >
            {CATEGORY_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            size="small"
            label="Auto-created"
            value={filters.isAutoCreated || ""}
            onChange={(e) =>
              handleFilterChange("isAutoCreated", e.target.value)
            }
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="true">⚠️ Cần config</MenuItem>
            <MenuItem value="false">Đã config</MenuItem>
          </TextField>
        </Stack>
      </Box>

      {/* Table */}
      <Box sx={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f5f5f5" }}>
              {columns.map((col) => (
                <th
                  key={col.Header}
                  style={{
                    padding: "12px 16px",
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {col.Header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {templates.map((template) => (
              <tr
                key={template._id}
                style={{
                  backgroundColor: template.isAutoCreated
                    ? "#fff3e0"
                    : "transparent",
                }}
              >
                {columns.map((col) => (
                  <td
                    key={col.Header}
                    style={{
                      padding: "12px 16px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {col.Cell
                      ? col.Cell({
                          value: template[col.accessor],
                          row: { original: template },
                        })
                      : template[col.accessor]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={pagination.total}
        page={pagination.page - 1}
        onPageChange={handlePageChange}
        rowsPerPage={pagination.limit}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPageOptions={[10, 20, 50]}
        labelRowsPerPage="Số hàng:"
      />
    </Card>
  );
}

export default NotificationTemplateTable;
```

### 7.4 Create NotificationTemplateForm

**File:** `src/features/Notification/Admin/NotificationTemplateForm.js`

```javascript
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  MenuItem,
  Chip,
  Stack,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FTextField, FSelect } from "../../../components/form";
import { createTemplate, updateTemplate } from "./notificationTemplateSlice";

const schema = Yup.object().shape({
  type: Yup.string()
    .required("Type là bắt buộc")
    .matches(/^[A-Z_]+$/, "Type phải viết hoa và dùng _ thay khoảng trắng"),
  name: Yup.string().required("Tên là bắt buộc"),
  titleTemplate: Yup.string().required("Title template là bắt buộc"),
  bodyTemplate: Yup.string().required("Body template là bắt buộc"),
  category: Yup.string().oneOf(["task", "kpi", "ticket", "system", "other"]),
  defaultPriority: Yup.string().oneOf(["normal", "urgent"]),
});

const defaultValues = {
  type: "",
  name: "",
  description: "",
  category: "other",
  titleTemplate: "",
  bodyTemplate: "",
  icon: "notification",
  defaultPriority: "normal",
  actionUrlTemplate: "",
  requiredVariables: [],
};

function NotificationTemplateForm({ open, onClose, template = null }) {
  const dispatch = useDispatch();
  const isEdit = Boolean(template?._id);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
  });

  const { handleSubmit, reset, watch, setValue } = methods;
  const bodyTemplate = watch("bodyTemplate");
  const titleTemplate = watch("titleTemplate");

  // Extract variables from templates
  const extractVariables = (text) => {
    const matches = text?.match(/\{\{(\w+)\}\}/g) || [];
    return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
  };

  const detectedVariables = [
    ...extractVariables(titleTemplate),
    ...extractVariables(bodyTemplate),
  ];

  useEffect(() => {
    if (template) {
      reset({
        ...defaultValues,
        ...template,
        requiredVariables: template.requiredVariables || [],
      });
    } else {
      reset(defaultValues);
    }
  }, [template, reset]);

  // Auto-update requiredVariables when templates change
  useEffect(() => {
    setValue("requiredVariables", [...new Set(detectedVariables)]);
  }, [detectedVariables.join(","), setValue]);

  const onSubmit = async (data) => {
    try {
      if (isEdit) {
        // Khi edit template isAutoCreated, set thành false
        if (template?.isAutoCreated) {
          data.isAutoCreated = false;
        }
        await dispatch(updateTemplate(template._id, data));
      } else {
        await dispatch(createTemplate(data));
      }
      onClose();
    } catch (error) {
      // Error handled in slice
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Chỉnh sửa Template" : "Tạo Template mới"}
        {template?.isAutoCreated && (
          <Chip
            label="⚠️ Auto-created"
            color="warning"
            size="small"
            sx={{ ml: 2 }}
          />
        )}
      </DialogTitle>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={2}>
            {/* Basic Info */}
            <Grid item xs={12} md={6}>
              <FTextField
                name="type"
                label="Type *"
                placeholder="VD: TASK_ASSIGNED"
                disabled={isEdit}
                helperText="Viết hoa, dùng _ thay khoảng trắng"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FTextField name="name" label="Tên hiển thị *" />
            </Grid>

            <Grid item xs={12}>
              <FTextField name="description" label="Mô tả" multiline rows={2} />
            </Grid>

            <Grid item xs={12} md={4}>
              <FSelect name="category" label="Category">
                <MenuItem value="task">Công việc (task)</MenuItem>
                <MenuItem value="kpi">KPI</MenuItem>
                <MenuItem value="ticket">Yêu cầu (ticket)</MenuItem>
                <MenuItem value="system">Hệ thống</MenuItem>
                <MenuItem value="other">Khác</MenuItem>
              </FSelect>
            </Grid>
            <Grid item xs={12} md={4}>
              <FTextField name="icon" label="Icon" placeholder="notification" />
            </Grid>
            <Grid item xs={12} md={4}>
              <FSelect name="defaultPriority" label="Priority mặc định">
                <MenuItem value="normal">Normal</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
              </FSelect>
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Templates (Sử dụng {"{{variableName}}"} cho placeholders)
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <FTextField
                name="titleTemplate"
                label="Title Template *"
                placeholder="VD: Công việc mới"
              />
            </Grid>
            <Grid item xs={12}>
              <FTextField
                name="bodyTemplate"
                label="Body Template *"
                multiline
                rows={3}
                placeholder="VD: {{assignerName}} đã giao cho bạn: {{taskName}}"
              />
            </Grid>
            <Grid item xs={12}>
              <FTextField
                name="actionUrlTemplate"
                label="Action URL Template"
                placeholder="VD: /quan-ly-cong-viec/chi-tiet/{{taskId}}"
              />
            </Grid>

            {/* Detected Variables */}
            {detectedVariables.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
                  <Typography variant="caption" color="textSecondary">
                    📋 Biến được phát hiện:
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {detectedVariables.map((v) => (
                      <Chip key={v} label={v} size="small" sx={{ mb: 1 }} />
                    ))}
                  </Stack>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained">
            {isEdit ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

export default NotificationTemplateForm;
```

### 7.5 Create NotificationTemplateTest

**File:** `src/features/Notification/Admin/NotificationTemplateTest.js`

```javascript
import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  Box,
  Divider,
  Alert,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";
import { testTemplate } from "./notificationTemplateSlice";

function NotificationTemplateTest({ open, onClose, template }) {
  const dispatch = useDispatch();
  const [testData, setTestData] = useState({});
  const [preview, setPreview] = useState({ title: "", body: "" });
  const [sending, setSending] = useState(false);

  // Initialize test data from requiredVariables
  useEffect(() => {
    if (template?.requiredVariables) {
      const initial = {};
      template.requiredVariables.forEach((varName) => {
        initial[varName] = `[Test ${varName}]`;
      });
      setTestData(initial);
    }
  }, [template]);

  // Update preview when test data changes
  useEffect(() => {
    if (template) {
      let title = template.titleTemplate || "";
      let body = template.bodyTemplate || "";

      Object.entries(testData).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{${key}\\}\\}`, "g");
        title = title.replace(regex, value);
        body = body.replace(regex, value);
      });

      setPreview({ title, body });
    }
  }, [template, testData]);

  const handleSendTest = async () => {
    setSending(true);
    try {
      await dispatch(testTemplate(template._id, testData));
      onClose();
    } finally {
      setSending(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>🧪 Test: {template.name}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="info">
            Notification test sẽ được gửi đến tài khoản của bạn.
          </Alert>

          {/* Test Variables */}
          <Typography variant="subtitle2">Nhập giá trị test:</Typography>
          {template.requiredVariables?.map((varName) => (
            <TextField
              key={varName}
              label={varName}
              size="small"
              value={testData[varName] || ""}
              onChange={(e) =>
                setTestData((prev) => ({ ...prev, [varName]: e.target.value }))
              }
            />
          ))}

          <Divider />

          {/* Preview */}
          <Typography variant="subtitle2">Xem trước:</Typography>
          <Box sx={{ p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {preview.title}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {preview.body}
            </Typography>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSendTest}
          disabled={sending}
        >
          {sending ? "Đang gửi..." : "Gửi Test"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NotificationTemplateTest;
```

### 7.6 Create NotificationAdminPage

**File:** `src/pages/NotificationAdminPage.js`

```javascript
import React, { useState } from "react";
import { Container, Button, Stack } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import NotificationTemplateTable from "../features/Notification/Admin/NotificationTemplateTable";
import NotificationTemplateForm from "../features/Notification/Admin/NotificationTemplateForm";
import NotificationTemplateTest from "../features/Notification/Admin/NotificationTemplateTest";

function NotificationAdminPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [testOpen, setTestOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    setFormOpen(true);
  };

  const handleTest = (template) => {
    setSelectedTemplate(template);
    setTestOpen(true);
  };

  const handleCreate = () => {
    setSelectedTemplate(null);
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    setSelectedTemplate(null);
  };

  const handleCloseTest = () => {
    setTestOpen(false);
    setSelectedTemplate(null);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          Thêm Template
        </Button>
      </Stack>

      <NotificationTemplateTable onEdit={handleEdit} onTest={handleTest} />

      <NotificationTemplateForm
        open={formOpen}
        onClose={handleCloseForm}
        template={selectedTemplate}
      />

      <NotificationTemplateTest
        open={testOpen}
        onClose={handleCloseTest}
        template={selectedTemplate}
      />
    </Container>
  );
}

export default NotificationAdminPage;
```

### 7.7 Add Route for Admin Page

**File:** `src/routes/Router.js`

```javascript
// Add import
import NotificationAdminPage from "../pages/NotificationAdminPage";

// Add route (inside admin routes, requires PhanQuyen >= 3)
{
  path: "admin/notification-templates",
  element: (
    <AuthRequire>
      <NotificationAdminPage />
    </AuthRequire>
  ),
}
```

### 7.8 Verify Admin UI Installation

```bash
# 1. Check files created
ls src/features/Notification/Admin/
# Should see: notificationTemplateSlice.js, NotificationTemplateTable.js,
#             NotificationTemplateForm.js, NotificationTemplateTest.js

ls src/pages/
# Should see: NotificationAdminPage.js

# 2. Check store.js has new reducer
grep "notificationTemplate" src/app/store.js

# 3. Start frontend and test
npm start
# Navigate to /admin/notification-templates (need admin login)
```

---

## 🐛 TROUBLESHOOTING

### Issue 1: Socket not connecting

**Symptoms:** No `[Socket] ✅ Connected` in console

**Solutions:**

```javascript
// 1. Check REACT_APP_SOCKET_URL in .env
REACT_APP_SOCKET_URL=http://localhost:8080

// 2. Check token is being passed
console.log("Token:", accessToken); // Before socket connect

// 3. Check CORS in backend
cors: {
  origin: ["http://localhost:3000"],
  credentials: true
}
```

### Issue 2: Notifications not appearing

**Symptoms:** API returns data but not showing

**Solutions:**

```javascript
// 1. Check Redux state
console.log(store.getState().notification);

// 2. Check if slice is registered in store
// store.js should have: notification: notificationReducer

// 3. Check component is using correct selector
const { notifications } = useSelector((state) => state.notification);
```

### Issue 3: Toast not showing

**Symptoms:** Notification received but no toast

**Solutions:**

```javascript
// 1. Ensure ToastContainer is in App.js
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

<ToastContainer />;

// 2. Check toast import in NotificationBell
import { toast } from "react-toastify";
```

### Issue 4: Badge count incorrect

**Symptoms:** Count doesn't match actual unread

**Solutions:**

```javascript
// 1. Check if getUnreadCount is called on mount
useEffect(() => {
  dispatch(getUnreadCount());
}, [dispatch]);

// 2. Check socket event handler updates count
on("notification:count", (data) => {
  dispatch(setUnreadCount(data.count));
});
```

---

## ✅ VERIFICATION CHECKLIST

- [ ] Dependencies installed (`socket.io-client`)
- [ ] SocketContext created and added to App
- [ ] notificationSlice created and registered
- [ ] All 5 components created
- [ ] NotificationBell added to header
- [ ] Routes configured
- [ ] Socket connects after login
- [ ] Socket disconnects after logout
- [ ] Real-time notifications work
- [ ] Toast notifications show
- [ ] Mark as read works
- [ ] Settings page works
- [ ] Responsive on mobile

---

## 📚 NEXT STEPS

Frontend is complete! Continue with:

1. **[04_FCM_PUSH_SETUP.md](./04_FCM_PUSH_SETUP.md)** - Firebase push notifications for offline users

After FCM setup, the notification system will be fully functional with:

- ✅ Real-time in-app notifications (Socket.IO)
- ✅ Push notifications when offline (FCM)
- ✅ User settings for preferences
- ✅ Complete UI for viewing and managing notifications
