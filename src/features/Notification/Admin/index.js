/**
 * Admin Notification Feature Exports
 * Barrel file for admin notification template components
 */

// Redux slice
export { default as notificationTemplateReducer } from "./notificationTemplateSlice";
export {
  getTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  testTemplate,
  getStats,
  setFilters,
  clearSelectedTemplate,
} from "./notificationTemplateSlice";

// Components
export { default as NotificationTemplateTable } from "./NotificationTemplateTable";
export { default as NotificationTemplateForm } from "./NotificationTemplateForm";
export { default as NotificationTemplateTest } from "./NotificationTemplateTest";
