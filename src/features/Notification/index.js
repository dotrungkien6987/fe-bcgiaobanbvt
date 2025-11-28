/**
 * Notification Feature Exports
 * Barrel file for notification components and slice
 */

// Components
export { default as NotificationBell } from "./NotificationBell";
export { default as NotificationDropdown } from "./NotificationDropdown";
export { default as NotificationDrawer } from "./NotificationDrawer";
export { default as NotificationItem } from "./NotificationItem";
export { default as NotificationSettings } from "./NotificationSettings";

// Redux slice and actions
export { default as notificationReducer } from "./notificationSlice";
export {
  // Actions for socket integration
  addNotification,
  setUnreadCount,
  markAsReadSuccess,
  markAllAsReadSuccess,
  resetState,
  // Thunks
  getNotifications,
  loadMoreNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getNotificationSettings,
  updateNotificationSettings,
  saveFcmToken,
} from "./notificationSlice";
