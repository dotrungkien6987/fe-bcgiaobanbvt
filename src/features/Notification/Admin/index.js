/**
 * Admin Notification Feature Exports
 * Barrel file for admin notification template components
 */

// Redux slice
export { default as notificationTemplateReducer } from "./notificationTemplateSlice";
export {
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  previewTemplate,
  testSendNotification,
  setFilters,
} from "./notificationTemplateSlice";

export { default as notificationTypeReducer } from "./notificationTypeSlice";
export {
  getTypes,
  createType,
  updateType,
  deleteType,
  setFilters as setTypeFilters,
} from "./notificationTypeSlice";

// Components
export { default as NotificationTemplateTable } from "./NotificationTemplateTable";
export { default as NotificationTemplateForm } from "./NotificationTemplateForm";
export { default as NotificationTemplateTest } from "./NotificationTemplateTest";

export { default as NotificationTypeTable } from "./NotificationTypeTable";
export { default as NotificationTypeForm } from "./NotificationTypeForm";
