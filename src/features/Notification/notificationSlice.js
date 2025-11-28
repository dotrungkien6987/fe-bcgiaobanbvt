/**
 * Notification Redux Slice
 * Manages notification state and async operations
 *
 * State shape:
 * - notifications: Array of notification objects
 * - unreadCount: Number of unread notifications
 * - isLoading: Loading state
 * - error: Error message if any
 * - pagination: { page, limit, total, totalPages }
 * - settings: User notification settings
 * - availableTypes: Available notification types for settings
 */

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
    // Get notifications (replace)
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
    resetState() {
      return initialState;
    },
  },
});

// Export actions for use in components
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
 * @param {Object} params - { page, limit, isRead }
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
 * Load more notifications (pagination - append)
 * @param {Object} params - { page, limit }
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
 * Get unread count (lightweight - for badge)
 */
export const getUnreadCount = () => async (dispatch) => {
  try {
    const response = await apiService.get("/notifications/unread-count");
    dispatch(slice.actions.setUnreadCount(response.data.data.count));
  } catch (error) {
    console.error("[Notification] Failed to get unread count:", error);
  }
};

/**
 * Mark notification as read
 * @param {string} notificationId
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
 * @param {string} notificationId
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
 * @param {Object} settings - Settings to update
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
 * Save FCM token (for push notifications)
 * @param {Object} params - { token, deviceName }
 */
export const saveFcmToken =
  ({ token, deviceName }) =>
  async () => {
    try {
      await apiService.post("/notifications/settings/fcm-token", {
        token,
        deviceName,
      });
      console.log("[Notification] FCM token saved");
    } catch (error) {
      console.error("[Notification] Failed to save FCM token:", error);
    }
  };
