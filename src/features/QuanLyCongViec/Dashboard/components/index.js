/**
 * Dashboard Components - Barrel exports
 */

// Existing components
export { default as GreetingSection } from "./GreetingSection";
export { default as UrgentTaskCard } from "./UrgentTaskCard";
export { default as RecentActivitiesTimeline } from "./RecentActivitiesTimeline";

// New components for Trang chủ v2
export { default as AlertBanner } from "./AlertBanner";
export { default as QuickActionsGrid } from "./QuickActionsGrid";
export { default as StatusOverviewCards } from "./StatusOverviewCards";
export { default as UrgentItemsList } from "./UrgentItemsList";

// Legacy components (deprecated - kept for backward compatibility)
export { default as PriorityTasksWidget } from "./PriorityTasksWidget";
export { default as TeamOverviewWidget } from "./TeamOverviewWidget";
