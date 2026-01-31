# 📋 IMPLEMENTATION PLAN: Menu V2 - Adapter Pattern

**Ngày tạo:** 31/01/2026  
**Trạng thái:** ✅ HOÀN THÀNH  
**Mục tiêu:** Thêm tab "Menu V2" vào bottom nav, sử dụng menu-items/ làm Single Source of Truth  
**Phương pháp:** A/B Testing - giữ nguyên menu cũ để so sánh

---

## 🎯 MỤC TIÊU

### ✅ PHẢI LÀM

- [x] Thêm tab "Menu V2" mới vào bottom nav (tab thứ 6)
- [x] Tạo adapter transform `menu-items/` → format MenuGridPage
- [x] Hỗ trợ render iconsax-react icons trong MenuItem
- [x] Exclude section "Hệ thống" (25 items) cho mobile
- [x] Split "Đào tạo" (38 items) thành 4 sub-sections
- [x] Flatten 3-4 levels → 2 levels
- [x] UI hiện đại, native-like, glassmorphism

### ❌ KHÔNG ĐƯỢC ĐỘNG

- `menu-items/*.js` - Nguồn data cho desktop sidebar (GIỮ NGUYÊN) ✅
- `menuConfig.js` - Menu cũ vẫn dùng (GIỮ NGUYÊN) ✅
- `MenuGridPage.js` - Menu cũ vẫn dùng (GIỮ NGUYÊN) ✅

---

## 📊 DATA FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                      DESKTOP SIDEBAR                            │
│                                                                 │
│   menu-items/index.js ──────────────────► NavSection.js         │
│        │                                  (Nested Collapse)      │
│        │                                                         │
└────────┼─────────────────────────────────────────────────────────┘
         │
         │ (READ ONLY - không sửa)
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE MENU V2 (NEW)                       │
│                                                                 │
│   menu-items/index.js                                           │
│        │                                                         │
│        ▼                                                         │
│   menuConfigAdapter.js ─────► Transform & Flatten               │
│        │                      - Exclude 'hethong'               │
│        │                      - Split 'daotao' → 4 sections     │
│        │                      - Map title→label, url→path       │
│        │                      - Keep iconsax icons              │
│        ▼                                                         │
│   sectionMetadata.js ───────► Apply colors, expanded state      │
│        │                                                         │
│        ▼                                                         │
│   MenuGridPageV3.js ────────► Render (Glassmorphism, Animations)│
│        │                                                         │
│        ▼                                                         │
│   MenuItem.js (updated) ────► Dynamic icon render               │
│                               (MUI + iconsax-react)              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      MOBILE MENU V1 (OLD - GIỮ NGUYÊN)          │
│                                                                 │
│   menuConfig.js ───────────► MenuGridPage.js ──► MenuItem.js    │
│   (hardcoded)                (39 items)                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📁 CẤU TRÚC FILES

### FILES TẠO MỚI (4 files)

```
fe-bcgiaobanbvt/src/
├── features/WorkDashboard/components/
│   ├── MenuGridPageV3.js                    ✨ NEW (~380 lines)
│   │   - Clone từ MenuGridPage.js
│   │   - Import adapter thay vì menuConfig
│   │   - Badge "Beta" ở header
│   │   - onNavigate prop để close dialog
│   │
│   └── MenuGridPage/
│       ├── adapters/                         ✨ NEW FOLDER
│       │   └── menuConfigAdapter.js          ✨ NEW (~300 lines)
│       │       - transformMenuItemsToSections()
│       │       - flattenNestedItems()
│       │       - splitLargeSection()
│       │       - mapFieldNames()
│       │
│       └── config/
│           └── sectionMetadata.js            ✨ NEW (~100 lines)
│               - SECTION_METADATA object
│               - Colors, icons, expanded state
│               - 11 sections (sau split)
```

### FILES SỬA (2 files)

```
fe-bcgiaobanbvt/src/
├── features/WorkDashboard/components/
│   ├── MobileBottomNav.js                   ✏️ EDIT
│   │   - Line ~50: Thêm tab "Menu V2" (icon: AutoAwesome)
│   │   - Line ~70: Thêm state menuV2DialogOpen
│   │   - Line ~250: Thêm Dialog render MenuGridPageV3
│   │
│   └── MenuGridPage/components/
│       └── MenuItem.js                       ✏️ EDIT
│           - Line ~25: Import * from 'iconsax-react'
│           - Line ~35: Thêm renderIcon() helper
│           - Line ~80: Update Avatar to use renderIcon()
```

### FILES KHÔNG ĐỘNG (GIỮ NGUYÊN)

```
❌ menu-items/*.js              - Desktop config (UNTOUCHED)
❌ menuConfig.js                - Menu V1 config (UNTOUCHED)
❌ MenuGridPage.js              - Menu V1 component (UNTOUCHED)
❌ MenuSection.js               - Shared component (UNTOUCHED)
❌ FavoritesSection.js          - Shared component (UNTOUCHED)
❌ hooks/*.js                   - Shared hooks (UNTOUCHED)
```

---

## 📝 CHI TIẾT IMPLEMENTATION

### PHASE 1: Adapter Layer (~45 mins)

#### 1.1 Tạo `MenuGridPage/adapters/menuConfigAdapter.js`

```javascript
/**
 * Menu Config Adapter
 * Transform menu-items/ (desktop) → MENU_SECTIONS format (mobile)
 *
 * RULES:
 * 1. Exclude 'hethong' section (admin-only, 25 items)
 * 2. Split 'daotao' into 4 sub-sections (38 items → 4 × ~10)
 * 3. Split 'nghiencuukhoahoc' if > 20 items
 * 4. Flatten nested collapse (3-4 levels → 2 levels)
 * 5. Keep iconsax icons (no conversion)
 * 6. Map: title→label, url→path, type→(remove)
 */

import menuItems from "menu-items";
import { SECTION_METADATA } from "../config/sectionMetadata";

// Sections to exclude on mobile
const EXCLUDED_SECTIONS = ["group-hethong"];

// Sections that need splitting (too many items)
const SPLIT_CONFIG = {
  "group-daotao": {
    threshold: 10,
    splitBy: "collapse", // Split by first-level collapse children
  },
};

export function transformMenuItemsToSections() {
  const sections = [];

  menuItems.items.forEach((group) => {
    // Skip excluded sections
    if (EXCLUDED_SECTIONS.includes(group.id)) return;

    // Check if needs splitting
    if (SPLIT_CONFIG[group.id]) {
      sections.push(...splitSection(group, SPLIT_CONFIG[group.id]));
    } else {
      sections.push(transformSection(group));
    }
  });

  return sections;
}

function splitSection(group, config) {
  /* ... */
}
function transformSection(group) {
  /* ... */
}
function flattenItems(children, parentLabel = "") {
  /* ... */
}
function mapItem(item, parentLabel) {
  /* ... */
}
```

#### 1.2 Tạo `MenuGridPage/config/sectionMetadata.js`

```javascript
/**
 * Section Metadata for Menu V2
 * Provides colors, icons, and UI config for each section
 */

export const SECTION_METADATA = {
  // Main sections
  "group-pages": {
    displayId: "work-management",
    title: "Quản Lý Công Việc",
    color: "#2e7d32",
    defaultExpanded: true,
  },
  "group-daotao": {
    displayId: "training",
    title: "Đào Tạo",
    color: "#0288d1",
    defaultExpanded: false,
  },

  // Split sections (from daotao)
  "daotao-canbo": {
    displayId: "training-staff",
    title: "Thông Tin Cán Bộ",
    color: "#0288d1",
    defaultExpanded: false,
  },
  "daotao-noivien": {
    displayId: "training-internal",
    title: "Đào Tạo Nội Viện",
    color: "#03a9f4",
    defaultExpanded: false,
  },
  // ... more sections
};

export const DEFAULT_SECTION_COLOR = "#757575";
export const DEFAULT_EXPANDED = false;
```

---

### PHASE 2: Component Updates (~30 mins)

#### 2.1 Update `MenuItem.js` - Icon Support

```javascript
// ADD: Import iconsax-react dynamically
import * as IconsaxIcons from "iconsax-react";
import { Dashboard as DefaultIcon } from "@mui/icons-material";

// ADD: Helper function
const renderIcon = (icon, size = 24) => {
  if (!icon) return <DefaultIcon sx={{ fontSize: size }} />;

  // If icon is a React component (MUI style)
  if (typeof icon === "function" || typeof icon === "object") {
    return React.createElement(icon, { sx: { fontSize: size } });
  }

  // If icon is iconsax component (already a component)
  if (React.isValidElement(icon)) {
    return React.cloneElement(icon, { size });
  }

  // If icon is string (iconsax name) - shouldn't happen but fallback
  if (typeof icon === "string" && IconsaxIcons[icon]) {
    const IconComponent = IconsaxIcons[icon];
    return <IconComponent size={size} />;
  }

  return <DefaultIcon sx={{ fontSize: size }} />;
};

// UPDATE: In render, replace item.icon with renderIcon(item.icon)
```

#### 2.2 Tạo `MenuGridPageV3.js`

```javascript
/**
 * MenuGridPageV3 - Menu V2 with Adapter Pattern
 *
 * Differences from MenuGridPage.js:
 * 1. Uses adapter instead of hardcoded menuConfig
 * 2. Supports iconsax-react icons
 * 3. Has "Beta" badge in header
 * 4. Accepts onNavigate prop to close parent dialog
 */

import { transformMenuItemsToSections } from "./MenuGridPage/adapters/menuConfigAdapter";

// Generate sections from menu-items via adapter
const MENU_SECTIONS = transformMenuItemsToSections();

export default function MenuGridPageV3({ onNavigate }) {
  // ... same as MenuGridPage but with onNavigate callback

  const handleItemClick = (path, item) => {
    trackItem(item);
    navigate(path);
    onNavigate?.(); // Close dialog
  };

  // ... rest of component
}
```

---

### PHASE 3: Bottom Nav Integration (~15 mins)

#### 3.1 Update `MobileBottomNav.js`

```javascript
// ADD: Import
import MenuGridPageV3 from './MenuGridPageV3';
import { AutoAwesome as MenuV2Icon } from '@mui/icons-material';

// ADD: State
const [menuV2DialogOpen, setMenuV2DialogOpen] = useState(false);

// ADD: Tab item (after existing Menu tab)
{
  label: 'Menu V2',
  icon: <MenuV2Icon />,
  badge: 'Beta',
  onClick: () => setMenuV2DialogOpen(true),
}

// ADD: Dialog (after existing Menu Dialog)
<Dialog
  fullScreen
  open={menuV2DialogOpen}
  onClose={() => setMenuV2DialogOpen(false)}
  TransitionComponent={Slide}
  TransitionProps={{ direction: 'up' }}
>
  <AppBar sx={{ position: 'relative' }}>
    <Toolbar>
      <IconButton onClick={() => setMenuV2DialogOpen(false)}>
        <CloseIcon />
      </IconButton>
      <Typography>Menu V2</Typography>
      <Chip label="Beta" color="secondary" size="small" />
    </Toolbar>
  </AppBar>
  <MenuGridPageV3 onNavigate={() => setMenuV2DialogOpen(false)} />
</Dialog>
```

---

## 📊 ESTIMATED SECTIONS (SAU TRANSFORM)

| #   | Section ID        | Title                   | Items | Color   |
| --- | ----------------- | ----------------------- | ----- | ------- |
| 1   | work-management   | Quản Lý Công Việc & KPI | ~14   | #2e7d32 |
| 2   | notification      | Thông Báo               | 2     | #ff9800 |
| 3   | training-staff    | Thông Tin Cán Bộ        | 2     | #0288d1 |
| 4   | training-internal | Đào Tạo Nội Viện        | ~16   | #03a9f4 |
| 5   | training-postgrad | Sau Đại Học             | ~12   | #00bcd4 |
| 6   | training-cert     | Chứng Chỉ & Văn Bằng    | ~8    | #009688 |
| 7   | research          | Nghiên Cứu Khoa Học     | ~21   | #7b1fa2 |
| 8   | reports           | Báo Cáo                 | 5     | #d32f2f |
| 9   | quality           | Quản Lý Chất Lượng      | 7     | #c2185b |
| 10  | schedule          | Lịch Trực               | 1     | #5d4037 |
| 11  | admin             | Quản Trị                | 4     | #616161 |

**TOTAL: ~92 items** (giảm từ 128, sau khi bỏ Hệ thống)

---

## ⏱️ TIMELINE

| Phase | Task                         | Duration | Status |
| ----- | ---------------------------- | -------- | ------ |
| 1.1   | Tạo menuConfigAdapter.js     | 30 mins  | ⬜     |
| 1.2   | Tạo sectionMetadata.js       | 15 mins  | ⬜     |
| 2.1   | Update MenuItem.js (iconsax) | 15 mins  | ⬜     |
| 2.2   | Tạo MenuGridPageV3.js        | 15 mins  | ⬜     |
| 3.1   | Update MobileBottomNav.js    | 15 mins  | ⬜     |
| 4     | Testing & Debug              | 20 mins  | ⬜     |

**TOTAL: ~2 hours**

---

## ✅ ACCEPTANCE CRITERIA

- [ ] Tab "Menu V2" hiển thị trong bottom nav với badge "Beta"
- [ ] Click mở Dialog fullscreen với MenuGridPageV3
- [ ] Sections được render đúng (11 sections, ~92 items)
- [ ] Icons iconsax-react hiển thị đúng
- [ ] Click item → navigate + close dialog
- [ ] Search hoạt động bình thường
- [ ] Favorites hoạt động bình thường
- [ ] Tab "Menu" cũ vẫn hoạt động như trước
- [ ] Desktop sidebar không bị ảnh hưởng
- [ ] Performance mượt (< 150ms initial render)

---

## 🔄 ROLLBACK PLAN

Nếu có vấn đề:

1. Xóa tab "Menu V2" khỏi MobileBottomNav
2. Giữ nguyên các files adapter (không xóa)
3. Menu V1 vẫn hoạt động bình thường

---

## 📝 NOTES

- **Icon handling**: iconsax-react exports components trực tiếp, không phải string names
- **Flatten strategy**: Combine parent label vào description, không vào label
- **Split logic**: Dựa trên collapse children của daotao
- **Role filtering**: Giữ nguyên logic từ MenuGridPage.js

---

**Kế hoạch đã sẵn sàng. Bắt đầu implementation khi user confirm!** 🚀
