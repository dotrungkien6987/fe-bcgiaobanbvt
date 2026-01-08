# 📱 PHASE 2: Mobile-First Redesign

**Timeline:** Ngày 4-6 (28 giờ)  
**Priority:** 🟡 MEDIUM  
**Dependencies:** Phase 1 phải hoàn thành (cần routes mới)  
**Status:** 📋 Planning

> **📍 RESUME POINT:** Nếu bắt đầu hội thoại mới, đọc [PROGRESS_TRACKER.md](./PROGRESS_TRACKER.md) để xem checkpoint hiện tại

---

## 🎯 Objectives

1. ✅ Tạo `MobileDetailLayout` component reusable
2. ✅ Refactor `CongViecDetailPage` responsive
3. ✅ Refactor `CycleAssignmentDetailPage` responsive
4. ✅ Test trên 3 breakpoints (mobile, tablet, desktop)

---

## 📊 Current Problems

### CongViecDetailPage

```
Desktop (>960px):
┌──────────────────────────────────────┐
│ Breadcrumb                           │
├───────────────┬──────────────────────┤
│ Info Section  │  Files Section       │
│ (Left 60%)    │  (Right 40%)         │
│               │                      │
│               │  Comments Section    │
└───────────────┴──────────────────────┘

Mobile (320px-959px):
❌ PROBLEM: Two columns squeezed
- Text overflow
- Buttons too small (< 44px touch target)
- Horizontal scroll appears
```

### CycleAssignmentDetailPage (WORSE - 1,299 lines!)

```
Desktop:
┌──────────────────────────────────────┐
│ Cycle Info (Top)                     │
├───────────────┬──────────────────────┤
│ Employee      │  Assignment List     │
│ Info (30%)    │  + Filters (70%)     │
│               │                      │
│               │  (Huge table)        │
└───────────────┴──────────────────────┘

Mobile:
❌ WORSE PROBLEMS:
- Table không scroll được
- Filter panel che mất content
- Employee info quá nhỏ
```

---

## 🎨 Target Design

### Mobile (<960px)

```
┌──────────────────────────┐
│ Breadcrumb               │
├──────────────────────────┤
│ Section 1 (Full width)   │
│                          │
├──────────────────────────┤
│ Section 2 (Full width)   │
│                          │
├──────────────────────────┤
│ Section 3 (Full width)   │
│ - Collapsible sections   │
│ - Touch-friendly buttons │
└──────────────────────────┘
  Fixed Bottom Action Bar
  [Lưu] [Hủy] [Menu...]
```

### Desktop (≥960px)

```
┌────────────────────────────────────┐
│ Breadcrumb                         │
├───────────────┬────────────────────┤
│ Section 1     │  Section 2         │
│ (40%)         │  (60%)             │
│               │                    │
│               │                    │
├───────────────┴────────────────────┤
│ Section 3 (Full width)             │
└────────────────────────────────────┘
```

---

## 🔧 Implementation

### 1. MobileDetailLayout Component (4h)

**File:** `src/features/QuanLyCongViec/components/MobileDetailLayout.js` (NEW)

```javascript
import React, { useState } from "react";
import {
  Box,
  Container,
  Paper,
  Tabs,
  Tab,
  Fab,
  SpeedDial,
  SpeedDialAction,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Save as SaveIcon,
  Close as CloseIcon,
  MoreVert as MoreIcon,
} from "@mui/icons-material";

/**
 * Responsive layout wrapper for detail pages
 * - Mobile: Stacked sections with tabs
 * - Desktop: Two-column layout
 *
 * @param {Array} sections - Section configs
 *   Example: [
 *     {
 *       id: 'info',
 *       label: 'Thông tin',
 *       component: <InfoSection />,
 *       col: 'left', // 'left' | 'right' | 'full' (desktop only)
 *     }
 *   ]
 * @param {Array} actions - Bottom action buttons (mobile only)
 * @param {ReactNode} breadcrumb - Breadcrumb component
 */
const MobileDetailLayout = ({
  sections = [],
  actions = [],
  breadcrumb,
  loading = false,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [activeTab, setActiveTab] = useState(0);

  if (loading) {
    return <Box>Loading skeleton...</Box>;
  }

  // Mobile: Tabbed sections
  if (isMobile) {
    return (
      <Container maxWidth="lg" sx={{ py: 2, pb: 10 }}>
        {breadcrumb}

        {/* Tab navigation */}
        <Paper sx={{ mb: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, v) => setActiveTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            {sections.map((section) => (
              <Tab key={section.id} label={section.label} />
            ))}
          </Tabs>
        </Paper>

        {/* Active tab content */}
        <Paper sx={{ p: 2 }}>{sections[activeTab]?.component}</Paper>

        {/* Fixed bottom action bar */}
        {actions.length > 0 && (
          <Paper
            sx={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              p: 2,
              display: "flex",
              gap: 1,
              justifyContent: "center",
              zIndex: 1100,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {actions.map((action) => (
              <Fab
                key={action.label}
                color={action.color || "primary"}
                variant={action.variant || "extended"}
                size="medium"
                onClick={action.onClick}
                disabled={action.disabled}
              >
                {action.icon}
                {action.label}
              </Fab>
            ))}
          </Paper>
        )}
      </Container>
    );
  }

  // Desktop: Two-column layout
  const leftSections = sections.filter((s) => s.col === "left");
  const rightSections = sections.filter((s) => s.col === "right");
  const fullSections = sections.filter((s) => s.col === "full");

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {breadcrumb}

      <Box sx={{ display: "flex", gap: 3 }}>
        {/* Left column */}
        {leftSections.length > 0 && (
          <Box sx={{ flex: "0 0 40%" }}>
            {leftSections.map((section) => (
              <Paper key={section.id} sx={{ p: 3, mb: 2 }}>
                {section.component}
              </Paper>
            ))}
          </Box>
        )}

        {/* Right column */}
        {rightSections.length > 0 && (
          <Box sx={{ flex: 1 }}>
            {rightSections.map((section) => (
              <Paper key={section.id} sx={{ p: 3, mb: 2 }}>
                {section.component}
              </Paper>
            ))}
          </Box>
        )}
      </Box>

      {/* Full-width sections */}
      {fullSections.map((section) => (
        <Paper key={section.id} sx={{ p: 3, mt: 2 }}>
          {section.component}
        </Paper>
      ))}

      {/* Desktop action buttons (top-right corner) */}
      {actions.length > 0 && (
        <SpeedDial
          ariaLabel="Actions"
          sx={{ position: "fixed", bottom: 32, right: 32 }}
          icon={<MoreIcon />}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.label}
              icon={action.icon}
              tooltipTitle={action.label}
              onClick={action.onClick}
            />
          ))}
        </SpeedDial>
      )}
    </Container>
  );
};

export default MobileDetailLayout;
```

---

### 2. Refactor CongViecDetailPage (8h)

#### Step 1: Extract sections into sub-components (4h)

**Files to create:**

```
src/features/QuanLyCongViec/CongViec/components/
├── detail/
│   ├── CongViecInfoSection.js        (2h)
│   ├── CongViecProgressSection.js    (1h)
│   ├── CongViecFilesSection.js       (0.5h)
│   └── CongViecCommentsSection.js    (0.5h)
```

**Example: CongViecInfoSection.js**

```javascript
import React from "react";
import { Box, Typography, Chip, Stack, Divider } from "@mui/material";
import dayjs from "dayjs";

const CongViecInfoSection = ({ congViec, onEdit }) => {
  if (!congViec) return null;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {congViec.TenCongViec}
      </Typography>

      <Stack direction="row" spacing={1} mb={2}>
        <Chip label={congViec.TrangThai} color="primary" size="small" />
        <Chip label={congViec.MucDoUuTien} color="warning" size="small" />
      </Stack>

      <Divider sx={{ my: 2 }} />

      {/* Responsive grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr", // Mobile: 1 column
            sm: "repeat(2, 1fr)", // Desktop: 2 columns
          },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary">
            Người giao
          </Typography>
          <Typography>{congViec.NguoiGiaoViec?.HoTen}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Người thực hiện
          </Typography>
          <Typography>{congViec.NguoiChinh?.HoTen}</Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Ngày bắt đầu
          </Typography>
          <Typography>
            {dayjs(congViec.NgayBatDau).format("DD/MM/YYYY")}
          </Typography>
        </Box>

        <Box>
          <Typography variant="caption" color="text.secondary">
            Hạn hoàn thành
          </Typography>
          <Typography color={congViec.isOverdue ? "error" : "inherit"}>
            {dayjs(congViec.NgayHetHan).format("DD/MM/YYYY HH:mm")}
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Box>
        <Typography variant="caption" color="text.secondary">
          Mô tả
        </Typography>
        <Typography
          sx={{
            mt: 1,
            whiteSpace: "pre-wrap", // Preserve line breaks
            wordBreak: "break-word", // Prevent overflow
          }}
        >
          {congViec.MoTa || "Không có mô tả"}
        </Typography>
      </Box>
    </Box>
  );
};

export default CongViecInfoSection;
```

#### Step 2: Integrate MobileDetailLayout (2h)

**File: CongViecDetailPage.js**

```javascript
import React from "react";
import { useParams } from "react-router-dom";
import MobileDetailLayout from "../components/MobileDetailLayout";
import WorkManagementBreadcrumb from "../components/WorkManagementBreadcrumb";
import CongViecInfoSection from "./components/detail/CongViecInfoSection";
import CongViecProgressSection from "./components/detail/CongViecProgressSection";
import CongViecFilesSection from "./components/detail/CongViecFilesSection";
import CongViecCommentsSection from "./components/detail/CongViecCommentsSection";
import { WorkRoutes } from "utils/navigationHelper";

function CongViecDetailPage() {
  const { id } = useParams();
  const { congViec, loading } = useCongViecDetail(id); // Custom hook

  const sections = [
    {
      id: "info",
      label: "Thông tin",
      component: <CongViecInfoSection congViec={congViec} />,
      col: "left",
    },
    {
      id: "progress",
      label: "Tiến độ",
      component: <CongViecProgressSection congViec={congViec} />,
      col: "left",
    },
    {
      id: "files",
      label: "Tệp đính kèm",
      component: <CongViecFilesSection congViec={congViec} />,
      col: "right",
    },
    {
      id: "comments",
      label: "Bình luận",
      component: <CongViecCommentsSection congViec={congViec} />,
      col: "full",
    },
  ];

  const actions = [
    {
      label: "Lưu",
      icon: <SaveIcon />,
      onClick: handleSave,
      color: "primary",
    },
    {
      label: "Hủy",
      icon: <CloseIcon />,
      onClick: handleCancel,
      color: "default",
    },
  ];

  const breadcrumbItems = [
    { label: "Trang chủ", path: "/" },
    { label: "Công việc", path: WorkRoutes.congViecDashboard() },
    { label: `#${id}`, path: null },
  ];

  return (
    <MobileDetailLayout
      sections={sections}
      actions={actions}
      breadcrumb={<WorkManagementBreadcrumb items={breadcrumbItems} />}
      loading={loading}
    />
  );
}
```

#### Step 3: Responsive testing (2h)

- Test trên Chrome DevTools (5 devices)
- Test trên real iPhone
- Test trên real Android
- Fix any bugs

---

### 3. Refactor CycleAssignmentDetailPage (8h)

**Similar approach:**

1. Extract sections (4h)
2. Integrate MobileDetailLayout (2h)
3. Test responsive (2h)

**Key sections:**

- Cycle info
- Employee info sidebar
- Assignment table (make scrollable on mobile)
- Filters (collapsible on mobile)

---

## ✅ Testing Checklist

### Responsive Breakpoints

- [ ] Mobile (320px-599px): Stack, tabs, bottom actions
- [ ] Tablet (600px-959px): Stack or 2-col depending on content
- [ ] Desktop (960px+): Two-column layout

### Touch Targets

- [ ] All buttons ≥44px × 44px (Apple HIG guideline)
- [ ] Tab bar easy to reach with thumb
- [ ] Swipe gestures work (optional)

### Performance

- [ ] Lighthouse mobile score > 80
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast tap response (< 100ms)

---

## 📊 Impact

| Metric                 | Before   | After (Target) |
| ---------------------- | -------- | -------------- |
| Mobile usability score | 55/100   | >85/100        |
| Touch target size      | <30px    | ≥44px          |
| Mobile navigation taps | 5-7 taps | 2-3 taps       |
| Layout shifts (CLS)    | 0.25     | <0.1           |

---

**Next Phase:** [03_PHASE_3_UNIFIED_DASHBOARD.md](./03_PHASE_3_UNIFIED_DASHBOARD.md)
