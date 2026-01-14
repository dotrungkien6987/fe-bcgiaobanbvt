# Plan: Premium MenuGridPage Refactor

**Ngày tạo:** 2026-01-12  
**Trạng thái:** Planning  
**Mục tiêu:** Nâng cấp MenuGridPage thành premium native-like experience với animations, glassmorphism, và smart features

---

## 📊 Tổng Quan

### Current State

- **File:** `src/features/WorkDashboard/components/MenuGridPage.js`
- **Lines of Code:** 646 lines
- **Components:** 3 (MenuGridPage, MenuSection, MenuItem)
- **Menu Items:** 52 items across 8 sections
- **Features:** Basic search, expand/collapse, role-based filtering
- **Styling:** MUI sx props, flat design
- **Performance:** Good, but no optimization

### Target State

- **Lines of Code:** ~1200 lines (distributed across multiple files)
- **Components:** 7+ (modular structure)
- **New Features:**
  - ⭐ Favorites system with localStorage
  - 🕒 Recent items tracking
  - ✨ Stagger animations with framer-motion
  - 🎨 Glassmorphism design
  - 🔍 Smart search with debounce & highlight
  - ⌨️ Keyboard shortcuts
  - 📱 Mobile gestures (optional)
  - ♿ Full accessibility support

### Dependencies

- ✅ framer-motion (already installed v11.2.13)
- ✅ lodash (already installed)
- ✅ @mui/material (already installed)
- ✅ react-router-dom (already installed)
- ❌ No new packages needed

---

## 🗂️ File Structure Refactor

```
src/features/WorkDashboard/components/
├── MenuGridPage.js (REFACTOR: 646 → 400 lines)
│   └── Main container with favorites section & search
│
└── MenuGridPage/
    ├── config/
    │   └── menuConfig.js (NEW: 350 lines)
    │       └── MENU_SECTIONS data structure
    │
    ├── components/
    │   ├── MenuItem.js (NEW: 120 lines)
    │   │   └── Animated card with glassmorphism
    │   ├── MenuSection.js (NEW: 150 lines)
    │   │   └── Collapsible section with spring animation
    │   ├── FavoritesSection.js (NEW: 180 lines)
    │   │   └── Recent + starred items display
    │   └── SearchBar.js (NEW: 100 lines)
    │       └── Enhanced search with keyboard shortcuts
    │
    └── hooks/
        ├── useFavorites.js (NEW: 80 lines)
        │   └── Star/unstar, localStorage persistence
        ├── useMenuSearch.js (NEW: 60 lines)
        │   └── Debounced search, fuzzy matching
        └── useRecentItems.js (NEW: 50 lines)
            └── Track navigation, localStorage cleanup
```

**Total New Files:** 8 files  
**Total Lines Added:** ~1090 lines  
**Lines Refactored:** 646 lines

---

## 🎯 Implementation Options

### Option A: Full Premium (Recommended)

**Time:** 6-8 hours  
**Effort:** High  
**Impact:** Maximum "wow" factor

**Includes:**

- ✨ All animations (stagger, spring, hover)
- 🎨 Full glassmorphism design
- ⭐ Complete favorites system
- 🕒 Recent items tracking
- 🔍 Smart search with highlighting
- ⌨️ Keyboard shortcuts (Cmd+K, arrow keys)
- 📱 Mobile gestures (swipe, long-press)
- ♿ Full accessibility (ARIA, focus management)
- 🚀 Performance optimization (memoization, debounce)

**Best for:** Production-ready, long-term investment

---

### Option B: Essential Polish

**Time:** 3-4 hours  
**Effort:** Medium  
**Impact:** Strong visual upgrade

**Includes:**

- ✨ Stagger animations + spring collapse
- 🎨 Glassmorphism on cards
- ⭐ Basic favorites (star only, no recent)
- 🔍 Debounced search with highlights
- ⌨️ Basic keyboard shortcuts (Cmd+K, Esc)
- 🚀 Basic memoization

**Excludes:**

- Mobile gestures
- Recent items tracking
- Full accessibility
- Advanced keyboard navigation

**Best for:** Quick visual improvement, MVP

---

### Option C: Quick Win

**Time:** 1-2 hours  
**Effort:** Low  
**Impact:** Noticeable improvement

**Includes:**

- ✨ Stagger animations only
- 🎨 Gradient section headers
- 🔍 Debounced search
- Basic performance tweaks

**Excludes:**

- Glassmorphism
- Favorites system
- Keyboard shortcuts
- Mobile gestures

**Best for:** Fast iteration, testing waters

---

## 📋 Detailed Implementation Steps

### Phase 1: Foundation & Refactor (2 hours)

#### Step 1.1: Extract Menu Data (30 min)

**Task:** Move MENU_SECTIONS to separate config file

**Files:**

- Create: `MenuGridPage/config/menuConfig.js`
- Modify: `MenuGridPage.js`

**Changes:**

```javascript
// menuConfig.js
export const MENU_SECTIONS = [
  /* 340 lines of data */
];
export const SECTION_COLORS = {
  /* color mapping */
};
export const DEFAULT_EXPANDED = ["quick-access", "work-management"];

// MenuGridPage.js (before)
const MENU_SECTIONS = [
  /* 340 lines inline */
];

// MenuGridPage.js (after)
import {
  MENU_SECTIONS,
  SECTION_COLORS,
} from "./MenuGridPage/config/menuConfig";
```

**Validation:** App runs without errors, no visual changes

---

#### Step 1.2: Extract MenuItem Component (45 min)

**Task:** Separate MenuItem into standalone component

**Files:**

- Create: `MenuGridPage/components/MenuItem.js`
- Modify: `MenuGridPage.js`

**New Component Structure:**

```javascript
// MenuItem.js
import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import { motion } from "framer-motion";

const MotionCard = motion(Card);

function MenuItem({ item, onClick, isFavorite, onToggleFavorite }) {
  return (
    <MotionCard
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      sx={{
        cursor: "pointer",
        position: "relative",
        // glassmorphism styles
      }}
    >
      {/* Star button for favorites */}
      {/* Icon + Label */}
      {/* Description */}
    </MotionCard>
  );
}

export default React.memo(MenuItem);
```

**Validation:** Cards render correctly, click navigation works

---

#### Step 1.3: Extract MenuSection Component (45 min)

**Task:** Separate MenuSection into standalone component

**Files:**

- Create: `MenuGridPage/components/MenuSection.js`
- Modify: `MenuGridPage.js`

**New Component Structure:**

```javascript
// MenuSection.js
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import MenuItem from "./MenuItem";

function MenuSection({
  section,
  expanded,
  onToggle,
  items,
  favorites,
  onToggleFavorite,
  onItemClick,
}) {
  return (
    <Box sx={{ mb: 3 }}>
      {/* Gradient header with animated icon */}
      <Box
        onClick={onToggle}
        sx={
          {
            /* gradient styles */
          }
        }
      >
        {/* Section icon + title + count chip */}
        {/* Expand/collapse icon */}
      </Box>

      {/* Animated collapse */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <Grid container spacing={2}>
              {items.map((item, index) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={item.id}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <MenuItem
                      item={item}
                      onClick={() => onItemClick(item.path)}
                      isFavorite={favorites.includes(item.id)}
                      onToggleFavorite={() => onToggleFavorite(item.id)}
                    />
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        )}
      </AnimatePresence>
    </Box>
  );
}

export default React.memo(MenuSection);
```

**Validation:** Sections collapse/expand smoothly with animation

---

### Phase 2: Visual Enhancements (2 hours)

#### Step 2.1: Glassmorphism Design (45 min)

**Task:** Apply glass effect to MenuItem cards

**Styling Changes:**

```javascript
sx={{
  background: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  borderRadius: 2,
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderColor: theme.palette.primary.main,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.25)',
  }
}}
```

**Dark Mode Support:**

```javascript
background: theme.palette.mode === 'dark'
  ? 'rgba(0, 0, 0, 0.3)'
  : 'rgba(255, 255, 255, 0.1)',
```

---

#### Step 2.2: Gradient Section Headers (30 min)

**Task:** Add colorful gradients to section headers

```javascript
sx={{
  background: `linear-gradient(135deg, ${section.color}DD, ${section.color}55)`,
  backdropFilter: 'blur(10px)',
  borderRadius: 2,
  p: 1.5,
  mb: 2,
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: `linear-gradient(135deg, ${section.color}FF, ${section.color}77)`,
    transform: 'translateX(4px)',
  }
}}
```

---

#### Step 2.3: Stagger Animations (45 min)

**Task:** Implement stagger effect for menu items

```javascript
// In MenuSection.js
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms delay between items
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="show"
>
  {items.map((item) => (
    <motion.div variants={itemVariants} key={item.id}>
      <MenuItem {...} />
    </motion.div>
  ))}
</motion.div>
```

---

### Phase 3: Smart Features (2-3 hours)

#### Step 3.1: Favorites System (1 hour)

**Task:** Create favorites hook with localStorage

**Files:**

- Create: `MenuGridPage/hooks/useFavorites.js`
- Modify: `MenuGridPage.js`, `MenuItem.js`

```javascript
// useFavorites.js
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "menu_favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }
  }, []);

  const toggleFavorite = useCallback((itemId) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  }, []);

  const isFavorite = useCallback(
    (itemId) => {
      return favorites.includes(itemId);
    },
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
```

**UI Integration:**

```javascript
// MenuItem.js - Add star button
<IconButton
  size="small"
  onClick={(e) => {
    e.stopPropagation();
    onToggleFavorite();
  }}
  sx={{ position: "absolute", top: 8, right: 8 }}
>
  {isFavorite ? <StarIcon color="warning" /> : <StarBorderIcon />}
</IconButton>
```

---

#### Step 3.2: Recent Items Tracking (45 min)

**Task:** Track last 5 clicked items

**Files:**

- Create: `MenuGridPage/hooks/useRecentItems.js`

```javascript
// useRecentItems.js
import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "menu_recent_items";
const MAX_RECENT = 5;
const EXPIRY_DAYS = 7;

export function useRecentItems() {
  const [recentItems, setRecentItems] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const now = Date.now();
        const validItems = parsed.filter(
          (item) => now - item.timestamp < EXPIRY_DAYS * 24 * 60 * 60 * 1000
        );
        setRecentItems(validItems);
      } catch (e) {
        console.error("Failed to parse recent items", e);
      }
    }
  }, []);

  const trackItem = useCallback((item) => {
    setRecentItems((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const newRecent = [{ ...item, timestamp: Date.now() }, ...filtered].slice(
        0,
        MAX_RECENT
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecent));
      return newRecent;
    });
  }, []);

  return { recentItems, trackItem };
}
```

**FavoritesSection Component:**

```javascript
// FavoritesSection.js
function FavoritesSection({ favorites, recentItems, allItems, onItemClick }) {
  const favoriteItems = allItems.filter((item) => favorites.includes(item.id));
  const recent = recentItems
    .map((r) => allItems.find((item) => item.id === r.id))
    .filter(Boolean);

  if (favoriteItems.length === 0 && recent.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        ⭐ Yêu Thích & Gần Đây
      </Typography>
      <Grid container spacing={2}>
        {/* Render favorites with star badge */}
        {/* Render recent items with clock badge */}
      </Grid>
    </Box>
  );
}
```

---

#### Step 3.3: Enhanced Search (45 min)

**Task:** Add debounce and highlight

**Files:**

- Create: `MenuGridPage/hooks/useMenuSearch.js`

```javascript
// useMenuSearch.js
import { useState, useMemo } from "react";
import { debounce } from "lodash";

export function useMenuSearch(items, delay = 300) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const debouncedSetQuery = useMemo(
    () => debounce((value) => setDebouncedQuery(value), delay),
    [delay]
  );

  const handleQueryChange = (value) => {
    setQuery(value);
    debouncedSetQuery(value);
  };

  const filteredItems = useMemo(() => {
    if (!debouncedQuery) return items;

    const lowerQuery = debouncedQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
    );
  }, [items, debouncedQuery]);

  return {
    query,
    setQuery: handleQueryChange,
    filteredItems,
    isSearching: query !== debouncedQuery,
  };
}
```

**Highlight Component:**

```javascript
// HighlightText.js
function HighlightText({ text, highlight }) {
  if (!highlight) return text;

  const parts = text.split(new RegExp(`(${highlight})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <Box
            component="span"
            key={i}
            sx={{
              bgcolor: "primary.main",
              color: "primary.contrastText",
              px: 0.5,
              borderRadius: 0.5,
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </>
  );
}
```

---

### Phase 4: Polish & Optimization (1-2 hours)

#### Step 4.1: Keyboard Shortcuts (30 min)

**Task:** Add Cmd+K for search, arrow keys navigation

```javascript
// In MenuGridPage.js
useEffect(() => {
  const handleKeyDown = (e) => {
    // Cmd/Ctrl + K: Focus search
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      searchInputRef.current?.focus();
    }

    // Escape: Clear search
    if (e.key === "Escape") {
      setQuery("");
      searchInputRef.current?.blur();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

---

#### Step 4.2: Performance Optimization (30 min)

**Task:** Add memoization and virtualization

```javascript
// MenuItem.js
export default React.memo(MenuItem, (prev, next) => {
  return prev.item.id === next.item.id &&
         prev.isFavorite === next.isFavorite;
});

// MenuSection.js
export default React.memo(MenuSection, (prev, next) => {
  return prev.section.id === next.section.id &&
         prev.expanded === next.expanded &&
         prev.items.length === next.items.length;
});
```

---

#### Step 4.3: Accessibility (30 min)

**Task:** Add ARIA labels and focus management

```javascript
// MenuItem.js
<Card
  role="button"
  tabIndex={0}
  aria-label={`${item.label}: ${item.description}`}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  }}
>

// MenuSection.js
<Box
  role="button"
  aria-expanded={expanded}
  aria-controls={`section-${section.id}`}
  aria-label={`${section.title}, ${items.length} items`}
>
```

---

## 🎨 Visual Design Specifications

### Color Palette

```javascript
const SECTION_COLORS = {
  "quick-access": {
    primary: "#1976d2",
    gradient: "linear-gradient(135deg, #1976d2DD, #1976d255)",
    hover: "linear-gradient(135deg, #1976d2FF, #1976d277)",
  },
  "work-management": {
    primary: "#2e7d32",
    gradient: "linear-gradient(135deg, #2e7d32DD, #2e7d3255)",
    hover: "linear-gradient(135deg, #2e7d32FF, #2e7d3277)",
  },
  // ... more sections
};
```

### Glassmorphism Recipe

```css
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.2);
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
```

### Animation Timings

```javascript
const ANIMATION_CONFIG = {
  stagger: {
    delay: 0.05, // 50ms between items
  },
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  },
  hover: {
    scale: 1.05,
    y: -4,
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.95,
  },
};
```

---

## ⚡ Performance Benchmarks

### Target Metrics

- **Initial Render:** < 100ms
- **Search Response:** < 50ms (after debounce)
- **Animation FPS:** 60fps solid
- **Re-render on Type:** Debounced (300ms)
- **Bundle Size Impact:** < 20KB gzipped

### Optimization Checklist

- ✅ React.memo() on MenuItem and MenuSection
- ✅ useMemo() for filtered items
- ✅ useCallback() for event handlers
- ✅ Debounce search input (300ms)
- ✅ Lazy load framer-motion animations
- ⚠️ Virtual scrolling (only if >100 items)

---

## ✅ Testing Checklist

### Functional Testing

- [ ] All 52 menu items render correctly
- [ ] Role-based filtering works (user/manager/admin)
- [ ] Search filters items correctly
- [ ] Search clears properly
- [ ] Favorite items persist after refresh
- [ ] Recent items track correctly
- [ ] Navigation works on all items
- [ ] Expand/collapse all sections
- [ ] Star/unstar items
- [ ] Keyboard shortcuts work (Cmd+K, Esc)

### Visual Testing

- [ ] Glassmorphism effect visible
- [ ] Gradient headers render correctly
- [ ] Animations smooth (60fps)
- [ ] Hover effects work
- [ ] Dark mode support
- [ ] Mobile responsive (xs, sm, md, lg, xl)
- [ ] Section colors distinct
- [ ] Icons display correctly

### Performance Testing

- [ ] Initial load < 100ms
- [ ] Search debounce works
- [ ] No unnecessary re-renders
- [ ] Smooth scrolling
- [ ] Memory usage acceptable
- [ ] Bundle size within budget

### Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA
- [ ] Tab order logical

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] Code reviewed
- [ ] No console errors/warnings
- [ ] Performance metrics met
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile tested (iOS, Android)
- [ ] Documentation updated

### Rollout Strategy

1. **Phase 1:** Deploy to development environment
2. **Phase 2:** Internal testing (2-3 days)
3. **Phase 3:** Beta release to 10% users
4. **Phase 4:** Monitor analytics and feedback
5. **Phase 5:** Full rollout if no issues

### Rollback Plan

- Keep old MenuGridPage.js as `MenuGridPage.legacy.js`
- Feature flag: `ENABLE_PREMIUM_MENU`
- Quick rollback via environment variable

---

## 📊 Success Metrics

### Quantitative

- **User Engagement:** +30% click-through on menu items
- **Search Usage:** +50% search interactions
- **Favorites Adoption:** 40% of users star at least 1 item
- **Performance:** < 100ms initial render, 60fps animations
- **Error Rate:** < 0.1% JavaScript errors

### Qualitative

- **User Feedback:** "Wow, this menu looks amazing!"
- **NPS Score:** +10 points improvement
- **Support Tickets:** -20% navigation-related issues

---

## 🔄 Future Enhancements (v2.0)

### Potential Features

- 🔊 Voice search integration
- 🌐 Multi-language support
- 📱 Haptic feedback on mobile
- 🎨 Customizable themes
- 📊 Usage analytics dashboard
- 🔗 Share favorite menus with team
- 🗂️ Custom menu categories
- 🎯 Smart recommendations based on role
- 🔔 Notification badges on menu items
- 🎮 Gamification (badges, achievements)

---

## 📝 Notes & Considerations

### Browser Compatibility

- **Chrome/Edge:** Full support ✅
- **Firefox:** Full support ✅
- **Safari:** Glassmorphism limited (fallback needed) ⚠️
- **IE11:** Not supported ❌

### Safari Fallback

```javascript
// Detect Safari
const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// Adjust glassmorphism
sx={{
  backdropFilter: isSafari ? 'none' : 'blur(10px)',
  background: isSafari
    ? 'rgba(255, 255, 255, 0.9)'
    : 'rgba(255, 255, 255, 0.1)',
}}
```

### Mobile Considerations

- Touch targets: Minimum 44x44px
- Reduce animations on slow devices
- Optimize for portrait orientation
- Safe area insets for notch devices

---

## 📞 Questions & Decisions Needed

1. **Option Selection:** Which option to implement? (A/B/C)
2. **Timeline:** When should this be completed?
3. **Beta Testing:** Who will be the beta testers?
4. **Feature Priorities:** Must-have vs nice-to-have?
5. **Mobile Gestures:** Essential or optional?
6. **Analytics:** What metrics to track?
7. **Backwards Compatibility:** Support old MenuGridPage?

---

## 🎯 Next Steps

1. **Review this plan** with team/stakeholders
2. **Select implementation option** (A, B, or C)
3. **Create feature branch:** `feature/premium-menu-grid-page`
4. **Begin Phase 1:** Foundation & Refactor
5. **Daily standup:** Progress updates
6. **Code review:** After each phase
7. **Deploy to staging:** After Phase 4
8. **User testing:** Before production

---

**Plan Created By:** AI Agent  
**Last Updated:** 2026-01-12  
**Status:** Awaiting Approval  
**Estimated Start:** TBD  
**Estimated Completion:** TBD (6-8 hours for Option A)
