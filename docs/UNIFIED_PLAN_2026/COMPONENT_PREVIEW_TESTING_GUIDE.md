# Component Preview Page - Testing Guide

**Created:** 15/01/2026  
**Status:** ✅ Complete  
**Route:** `/components-preview`  
**Purpose:** Interactive demo & testing tool for shared components

---

## 🎯 Quick Access

```
URL: http://localhost:3000/components-preview
Route: /components-preview
Component: src/pages/ComponentPreviewPage.js
```

---

## 🧪 Testing Checklist

### Initial Load

- [ ] Page loads without errors
- [ ] Title "Component Library" visible
- [ ] Mobile/Desktop toggle buttons work
- [ ] "Development Only" warning banner shows
- [ ] 3 accordion sections visible:
  - 📱 Foundation Components (Phase 3A)
  - 👆 Gesture Components (Phase 4)
  - 📊 Dashboard Components (Phase 2)

---

### Foundation Components Section (Phase 3A)

#### ✅ SplashScreen Demo

- [ ] Demo container visible (300px height)
- [ ] "Replay Animation" button visible initially
- [ ] Click "Replay Animation" → SplashScreen appears
- [ ] Logo fades in
- [ ] Progress bar animates 0→100%
- [ ] Screen fades out after 1.2s
- [ ] Returns to "Replay Animation" button
- [ ] Code snippet displays correctly
- [ ] Copy button works (shows "Copied!" tooltip)

**Expected Code:**

```javascript
import SplashScreen from "components/SplashScreen";

<SplashScreen onComplete={() => setShowSplash(false)} duration={1200} />;
```

---

#### ✅ CardSkeleton Demo

- [ ] 2 skeleton cards visible
- [ ] Each card has:
  - [ ] Title line skeleton
  - [ ] Subtitle line skeleton
  - [ ] Content area skeleton
  - [ ] Two action button skeletons
- [ ] Spacing between cards (16px)
- [ ] Code snippet displays
- [ ] Copy button works

**Expected Code:**

```javascript
import { CardSkeleton } from "components/SkeletonLoader";

<CardSkeleton count={3} spacing={2} />;
```

---

#### ✅ TableSkeleton Demo

- [ ] Table with 3 rows × 4 columns visible
- [ ] Header row has skeleton cells
- [ ] Body rows have skeleton cells
- [ ] Wrapped in Paper component (padding visible)
- [ ] Code snippet displays
- [ ] Copy button works

---

#### ✅ FormSkeleton Demo

- [ ] 3 form fields visible
- [ ] Each field has:
  - [ ] Label skeleton (30% width)
  - [ ] Input skeleton (full width, 56px height)
- [ ] Action buttons at bottom (2 buttons)
- [ ] Wrapped in Paper component
- [ ] Code snippet displays

---

#### ✅ StatusGridSkeleton Demo

- [ ] 4-column grid visible
- [ ] Each cell shows:
  - [ ] Circular skeleton (40×40px)
  - [ ] Text skeleton (count)
  - [ ] Text skeleton (label)
- [ ] Responsive (2 columns on mobile)
- [ ] Code snippet displays

---

#### ✅ ListSkeleton Demo

- [ ] 3 list items visible
- [ ] Each item has:
  - [ ] Circular avatar skeleton (40×40px)
  - [ ] Two text lines (60% and 40% width)
- [ ] Wrapped in Paper
- [ ] Code snippet displays

---

#### ✅ PageSkeleton Demo

- [ ] Scrollable container (max 500px height)
- [ ] Page title skeleton
- [ ] 4 stat cards (grid 4 columns)
- [ ] Content area skeleton (400px height)
- [ ] Code snippet displays

---

### Gesture Components Section (Phase 4)

#### ⚠️ PullToRefresh (Planned)

- [ ] Warning banner: "Coming Soon: Phase 4 components not yet implemented"
- [ ] Component card visible
- [ ] Tags show "Phase 4", "Gesture", "Planned"
- [ ] Note about existing implementation location
- [ ] Code snippet shows future API
- [ ] Link to existing file: `src/features/QuanLyCongViec/Ticket/components/PullToRefreshWrapper.jsx`

#### ⚠️ SwipeableCard (Planned)

- [ ] Tags show "Planned"
- [ ] "Component not yet implemented" message
- [ ] Code snippet shows planned API

#### ⚠️ LongPressMenu (Planned)

- [ ] Tags show "Planned"
- [ ] "Component not yet implemented" message
- [ ] Code snippet shows planned API

---

### Dashboard Components Section (Phase 2)

#### 📊 StatusCard (Existing)

- [ ] Info alert visible
- [ ] Text: "Live implementation in CongViecDashboardPage"
- [ ] Link text: "Navigate to: /quanlycongviec/dashboard/cong-viec"
- [ ] Code snippet shows usage example
- [ ] File location shown

#### 📊 CollapsibleAlertCard (Existing)

- [ ] Info alert visible
- [ ] Text: "Live implementation in CongViecDashboardPage"
- [ ] Similar format to StatusCard
- [ ] Code snippet displays

---

### View Mode Toggle

#### Mobile View (375px width)

- [ ] Click "Mobile" button → Container shrinks to 375px width
- [ ] Border and shadow appear around container
- [ ] Max height 667px with scroll
- [ ] StatusGridSkeleton shows 2 columns (responsive)
- [ ] All components still visible and functional

#### Desktop View (100% width)

- [ ] Click "Desktop" button → Container expands
- [ ] No border/shadow
- [ ] StatusGridSkeleton shows 4 columns
- [ ] Layout feels more spacious

---

### Copy Code Functionality

Test for each component:

- [ ] Click copy icon (📋)
- [ ] Tooltip changes to "Copied!"
- [ ] Code is in clipboard (test paste)
- [ ] Tooltip resets after 2 seconds
- [ ] Multiple copies work (different components)

---

### Footer Section

- [ ] "💡 Usage Guidelines" heading visible
- [ ] 4 bullet points visible:
  - For QA
  - For Developers
  - Mobile Testing
  - Real Device Testing
- [ ] Grey background (grey.50)
- [ ] Proper padding and border radius

---

### Responsive Behavior

#### Desktop (> 1024px)

- [ ] Container maxWidth 1200px (lg)
- [ ] Accordions expand fully
- [ ] Code snippets readable
- [ ] Toggle buttons horizontal

#### Tablet (768px - 1024px)

- [ ] Layout adjusts smoothly
- [ ] Accordions still functional
- [ ] Copy buttons accessible

#### Mobile (< 768px)

- [ ] Header stacks vertically
- [ ] Toggle buttons stack
- [ ] Code snippets wrap properly
- [ ] Accordions collapse nicely
- [ ] All touch targets >= 44px

---

### Performance

- [ ] Page loads < 1 second
- [ ] No console errors
- [ ] No console warnings
- [ ] Smooth accordion animations
- [ ] No layout shifts (CLS)
- [ ] Copy functionality instant

---

### Browser Compatibility

- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS)

---

## 🐛 Known Issues / Limitations

1. **Gestures not testable:** Requires real device testing (DevTools insufficient)
2. **Dashboard components:** Links to live pages, not standalone demos
3. **Development only:** Will not be visible in production build

---

## 📸 Visual Checklist

### SplashScreen Animation Sequence

```
Frame 1 (0ms):    [Replay Button]
Frame 2 (100ms):  [Logo fade-in starts]
Frame 3 (300ms):  [Logo visible, text fades in]
Frame 4 (500ms):  [Progress bar appears]
Frame 5 (1200ms): [Progress at 100%]
Frame 6 (1500ms): [Fade out complete] → Back to button
```

### Mobile vs Desktop Comparison

```
Mobile (375px):               Desktop (100%):
┌─────────────┐              ┌────────────────────────┐
│  📱 Mobile  │              │  💻 Desktop            │
│ ┌─────────┐ │              │  Components across     │
│ │Component│ │              │  full width            │
│ └─────────┘ │              │  More breathing room   │
│ ┌─────────┐ │              └────────────────────────┘
│ │Component│ │
│ └─────────┘ │
└─────────────┘
```

---

## 🎯 Success Criteria

✅ **PASS** if:

- All Foundation components render correctly
- SplashScreen animation plays smoothly
- Code copy functionality works
- Mobile/Desktop toggle works
- No console errors
- All skeletons display properly

❌ **FAIL** if:

- Any component throws error
- SplashScreen animation glitches
- Code copy doesn't work
- Toggle buttons broken
- Performance issues (<60fps)

---

## 📝 Next Actions

After verifying this page:

1. **Proceed to Phase 3B** - MobileDetailLayout implementation
2. **Apply skeleton loaders** - Replace existing loading states
3. **Update documentation** - Link to this preview page from other docs
4. **QA handoff** - Use this page for component testing

---

## 🔗 Related Files

- Component: [src/pages/ComponentPreviewPage.js](../../../src/pages/ComponentPreviewPage.js)
- Route: [src/routes/index.js](../../../src/routes/index.js) (line 473)
- SplashScreen: [src/components/SplashScreen/index.js](../../../src/components/SplashScreen/index.js)
- SkeletonLoader: [src/components/SkeletonLoader/index.js](../../../src/components/SkeletonLoader/index.js)
- Phase 3 Plan: [PHASE_3_SPLASH_LAYOUTS.md](./PHASE_3_SPLASH_LAYOUTS.md)
- Phase 3 Preview Doc: [PHASE_3_COMPONENT_PREVIEW.md](./PHASE_3_COMPONENT_PREVIEW.md)
