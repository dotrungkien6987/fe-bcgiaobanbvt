/**
 * Menu Config Adapter
 *
 * Transform menu-items/ (desktop sidebar) → MENU_SECTIONS format (mobile MenuGridPage)
 *
 * This adapter provides Single Source of Truth by reading from menu-items/
 * and transforming to the flat 2-level structure required by MenuGridPageV3.
 *
 * RULES:
 * 1. Exclude 'group-hethong' section (admin-only config, 25+ items)
 * 2. Split 'group-daotao' into 4 sub-sections (38 items → 4 × ~10)
 * 3. Flatten nested collapse (3-4 levels → 2 levels)
 * 4. Keep iconsax icons (no conversion to MUI)
 * 5. Map: title→label, url→path, type→(remove)
 *
 * @author AI Assistant
 * @version 1.0.0
 */

import menuItems from "menu-items";
import {
  SECTION_METADATA,
  DEFAULT_SECTION_COLOR,
} from "../config/sectionMetadata";

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Sections to exclude from mobile menu
 * These are typically admin-only or have too many config items
 */
const EXCLUDED_SECTIONS = [
  "group-hethong", // Hệ thống - 25+ items, admin config only
];

/**
 * Sections that need to be split into smaller sub-sections
 * When a section has too many items, it becomes hard to browse on mobile
 */
const SPLIT_SECTIONS = [
  "group-daotao", // Đào tạo - 38 items, split by collapse children
  "group-pages", // Quản lý công việc và KPI - 25 items, split into: quanlycongviec, quanlyyeucau, kpi
];

/**
 * All PhanQuyen values from User model
 * Used as default when item has no specific roles
 * Matches: User.PhanQuyen enum in backend
 */
const ALL_ROLES = [
  "admin",
  "daotao",
  "nomal",
  "manager",
  "default",
  "noibo",
  "qlcl",
];

// ============================================================================
// MAIN TRANSFORM FUNCTION
// ============================================================================

/**
 * Transform menu-items to MENU_SECTIONS format
 *
 * @returns {Array} Array of section objects ready for MenuGridPageV3
 */
export function transformMenuItemsToSections() {
  const sections = [];

  menuItems.items.forEach((group) => {
    // Skip excluded sections
    if (EXCLUDED_SECTIONS.includes(group.id)) {
      return;
    }

    // Check if section needs splitting
    if (SPLIT_SECTIONS.includes(group.id)) {
      const splitSections = splitLargeSection(group);
      sections.push(...splitSections);
    } else {
      // Normal transform
      const section = transformSection(group);
      if (section && section.items.length > 0) {
        sections.push(section);
      }
    }
  });

  return sections;
}

// ============================================================================
// SECTION TRANSFORM FUNCTIONS
// ============================================================================

/**
 * Transform a single menu group to section format
 *
 * @param {Object} group - Menu group from menu-items
 * @returns {Object} Section object for MenuGridPage
 */
function transformSection(group) {
  const metadata = SECTION_METADATA[group.id] || {};
  const groupRoles = group.roles || ["default"];

  // Flatten all nested items
  const items = flattenItems(group.children, "", group.icon, groupRoles);

  return {
    id: metadata.displayId || group.id,
    title: metadata.title || group.title,
    icon: group.icon,
    color: metadata.color || DEFAULT_SECTION_COLOR,
    defaultExpanded: metadata.defaultExpanded || false,
    items: items,
  };
}

/**
 * Split a large section into multiple smaller sections
 * Used for sections like 'Đào tạo' with 38+ items
 *
 * @param {Object} group - Menu group to split
 * @returns {Array} Array of smaller section objects
 */
function splitLargeSection(group) {
  const sections = [];
  const groupRoles = group.roles || ["default"];

  if (!group.children || group.children.length === 0) {
    return sections;
  }

  // Each collapse child becomes its own section
  group.children.forEach((child) => {
    if (child.type === "collapse" && child.children) {
      const sectionId = `${group.id}-${child.id}`;
      const metadata = SECTION_METADATA[sectionId] || {};

      // Flatten items within this collapse
      const items = flattenItems(child.children, "", child.icon, groupRoles);

      if (items.length > 0) {
        sections.push({
          id: metadata.displayId || sectionId,
          title: metadata.title || child.title,
          icon: child.icon || group.icon,
          color:
            metadata.color ||
            SECTION_METADATA[group.id]?.color ||
            DEFAULT_SECTION_COLOR,
          defaultExpanded: metadata.defaultExpanded || false,
          items: items,
        });
      }
    } else if (child.type === "item") {
      // Direct item under group - add to a "general" section
      const generalSectionId = `${group.id}-general`;
      let generalSection = sections.find((s) => s.id === generalSectionId);

      if (!generalSection) {
        const metadata =
          SECTION_METADATA[generalSectionId] ||
          SECTION_METADATA[group.id] ||
          {};
        generalSection = {
          id: metadata.displayId || generalSectionId,
          title: metadata.title || group.title,
          icon: group.icon,
          color: metadata.color || DEFAULT_SECTION_COLOR,
          defaultExpanded: metadata.defaultExpanded || false,
          items: [],
        };
        sections.unshift(generalSection); // Add at beginning
      }

      generalSection.items.push(mapItem(child, "", group.icon, groupRoles));
    }
  });

  return sections;
}

// ============================================================================
// ITEM TRANSFORM FUNCTIONS
// ============================================================================

/**
 * Recursively flatten nested items to a flat array
 * Handles 3-4 level nesting by combining parent labels
 *
 * @param {Array} children - Array of child items
 * @param {string} parentLabel - Label from parent for context
 * @param {Component} parentIcon - Icon from parent as fallback
 * @param {Array} groupRoles - Roles from the group level
 * @returns {Array} Flat array of item objects
 */
function flattenItems(
  children,
  parentLabel = "",
  parentIcon = null,
  groupRoles = ["default"],
) {
  const items = [];

  if (!children || !Array.isArray(children)) {
    return items;
  }

  children.forEach((child) => {
    if (child.type === "item") {
      items.push(mapItem(child, parentLabel, parentIcon, groupRoles));
    } else if (child.type === "collapse" && child.children) {
      // Get the label for nested context
      const childLabel = extractLabel(child.title);
      const newParentLabel = parentLabel
        ? `${parentLabel} › ${childLabel}`
        : childLabel;

      // Recursively flatten children
      const nestedItems = flattenItems(
        child.children,
        newParentLabel,
        child.icon || parentIcon,
        groupRoles,
      );
      items.push(...nestedItems);
    }
  });

  return items;
}

/**
 * Map a single menu item to MenuGridPage format
 *
 * @param {Object} item - Menu item from menu-items
 * @param {string} parentLabel - Parent context for description
 * @param {Component} fallbackIcon - Fallback icon if item has none
 * @param {Array} groupRoles - Roles from the group level
 * @returns {Object} Item object for MenuGridPage
 */
function mapItem(item, parentLabel, fallbackIcon, groupRoles) {
  const label = extractLabel(item.title);

  // Build description from parent context
  let description = "";
  if (parentLabel) {
    description = parentLabel;
  }

  // Determine roles for this item
  // Copy directly from item → requiredRole → groupRoles → default to ALL_ROLES
  // Desktop menu uses exact match: item.roles?.includes(user.PhanQuyen)
  let roles = ALL_ROLES; // Default: all roles can see

  // Check item-level roles first
  if (item.roles && Array.isArray(item.roles)) {
    roles = getRoles(item.roles);
  } else if (item.requiredRole && Array.isArray(item.requiredRole)) {
    roles = getRoles(item.requiredRole);
  } else if (groupRoles) {
    roles = getRoles(groupRoles);
  }

  return {
    id: item.id,
    label: cleanLabel(label),
    description: description,
    icon: item.icon || fallbackIcon,
    path: item.url,
    roles: roles,
    chip: item.chip, // Preserve chip if exists (e.g., "MỚI")
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract text label from title (handles React elements like <></>)
 *
 * @param {string|ReactElement} title - Title which may be string or JSX
 * @returns {string} Plain text label
 */
function extractLabel(title) {
  if (!title) return "";

  // If it's a string, return as-is
  if (typeof title === "string") {
    return title;
  }

  // If it's a React element (like <>Text</>), extract children
  if (title.props && title.props.children) {
    return String(title.props.children);
  }

  // Fallback: convert to string
  return String(title);
}

/**
 * Clean label by removing emoji prefixes
 *
 * @param {string} label - Label that may contain emoji prefix
 * @returns {string} Cleaned label
 */
function cleanLabel(label) {
  if (!label) return "";

  // Remove common emoji prefixes (📊, 📅, ➕, etc.)
  return label.replace(/^[\u{1F300}-\u{1F9FF}]\s*/u, "").trim();
}

/**
 * Get roles for an item - copy directly from source, no mapping needed
 * Desktop menu uses exact match: item.roles?.includes(user.PhanQuyen)
 * We do the same - just copy roles as-is from menu-items
 *
 * @param {Array} roles - Roles from menu-items (e.g., ["admin", "nomal", "default"])
 * @returns {Array} Same roles array, or ALL_ROLES if not specified
 */
function getRoles(roles) {
  if (!roles || !Array.isArray(roles) || roles.length === 0) {
    return ALL_ROLES;
  }
  return roles;
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Get all sections (cached)
 */
let cachedSections = null;

export function getMenuSections() {
  if (!cachedSections) {
    cachedSections = transformMenuItemsToSections();
  }
  return cachedSections;
}

/**
 * Clear cache (for hot reload during development)
 */
export function clearCache() {
  cachedSections = null;
}

/**
 * Get section by ID
 */
export function getSectionById(sectionId) {
  const sections = getMenuSections();
  return sections.find((section) => section.id === sectionId);
}

/**
 * Get menu item by ID
 */
export function getMenuItemById(itemId) {
  const sections = getMenuSections();
  for (const section of sections) {
    const item = section.items.find((item) => item.id === itemId);
    if (item) return item;
  }
  return undefined;
}

/**
 * Filter menu sections by user role
 * Uses exact match like desktop menu: item.roles.includes(user.PhanQuyen)
 */
export function filterMenuByRole(userRole = "default") {
  const sections = getMenuSections();
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.roles.includes(userRole)),
    }))
    .filter((section) => section.items.length > 0);
}

/**
 * Search menu items
 * Uses exact match for role: item.roles.includes(user.PhanQuyen)
 */
export function searchMenuItems(query = "", userRole = "default") {
  const lowerQuery = query.toLowerCase().trim();
  if (!lowerQuery) return filterMenuByRole(userRole);

  const sections = getMenuSections();
  return sections
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        // Role check - exact match like desktop menu
        if (!item.roles.includes(userRole)) return false;

        // Search check
        return (
          item.label.toLowerCase().includes(lowerQuery) ||
          (item.description &&
            item.description.toLowerCase().includes(lowerQuery)) ||
          section.title.toLowerCase().includes(lowerQuery)
        );
      });

      return { ...section, items: filteredItems };
    })
    .filter((section) => section.items.length > 0);
}

// Default export
const menuConfigAdapter = {
  transformMenuItemsToSections,
  getMenuSections,
  getSectionById,
  getMenuItemById,
  filterMenuByRole,
  searchMenuItems,
  clearCache,
};

export default menuConfigAdapter;
