# Component Library Preview Page

**Thời gian:** 2 giờ  
**Ưu tiên:** 🟢 NICE-TO-HAVE  
**Trạng thái:** Optional - For QA & Developer Reference

---

## 🎯 Mục Tiêu

Tạo trang demo tất cả shared components (SplashScreen, Skeleton, Gestures) ở một nơi để QA dễ kiểm tra và developers có reference.

### Vision

```
Component Preview Page Structure:
┌────────────────────────────────┐
│ Component Library              │
│ ────────────────────────────── │
│ 📱 Foundation                  │
│   • SplashScreen               │
│   • Skeleton Loaders           │
│ ────────────────────────────── │
│ 👆 Gestures                    │
│   • PullToRefresh              │
│   • SwipeableCard              │
│   • LongPressMenu              │
│ ────────────────────────────── │
│ 📊 Dashboard Components        │
│   • StatusCard                 │
│   • AlertCard                  │
└────────────────────────────────┘
```

---

## 📦 Deliverables

- ✅ `/components-preview` route
- ✅ Interactive component demos with controls
- ✅ Code snippets for each component
- ✅ Mobile + Desktop preview toggle
- ✅ Responsive layout testing tool

---

## 📋 Implementation Plan (2h)

### Step 1: Create ComponentPreviewPage (1h)

**File:** `src/pages/ComponentPreviewPage.js`

```javascript
import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LaptopIcon from "@mui/icons-material/Laptop";

// Import shared components
import SplashScreen from "components/SplashScreen";
import { CardSkeleton, TableSkeleton } from "components/SkeletonLoader";
import PullToRefresh from "components/gestures/PullToRefresh";
import SwipeableCard from "components/gestures/SwipeableCard";
import LongPressMenu from "components/gestures/LongPressMenu";

function ComponentPreviewPage() {
  const [viewMode, setViewMode] = useState("mobile");
  const [splashVisible, setSplashVisible] = useState(false);

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const previewWidth = viewMode === "mobile" ? "375px" : "100%";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4">Component Library</Typography>

        {/* View Mode Toggle */}
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          size="small"
        >
          <ToggleButton value="mobile">
            <PhoneAndroidIcon sx={{ mr: 1 }} />
            Mobile
          </ToggleButton>
          <ToggleButton value="desktop">
            <LaptopIcon sx={{ mr: 1 }} />
            Desktop
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Preview Container */}
      <Box
        sx={{
          width: previewWidth,
          margin: "0 auto",
          border: viewMode === "mobile" ? "1px solid #ddd" : "none",
          borderRadius: viewMode === "mobile" ? 2 : 0,
          overflow: "hidden",
        }}
      >
        {/* Foundation Components */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">📱 Foundation Components</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* SplashScreen Demo */}
              <ComponentDemo
                title="SplashScreen"
                description="Loading screen with logo animation"
                tags={["Phase 3A", "Animation"]}
                code={`<SplashScreen onComplete={() => console.log("Loaded!")} />`}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: 300,
                    border: "1px solid #eee",
                  }}
                >
                  {splashVisible ? (
                    <SplashScreen onComplete={() => setSplashVisible(false)} />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                      }}
                    >
                      <Chip
                        label="Click to replay"
                        onClick={() => setSplashVisible(true)}
                        color="primary"
                      />
                    </Box>
                  )}
                </Box>
              </ComponentDemo>

              {/* CardSkeleton Demo */}
              <ComponentDemo
                title="CardSkeleton"
                description="Loading placeholder for cards"
                tags={["Phase 3A", "Loading"]}
                code={`<CardSkeleton count={3} />`}
              >
                <CardSkeleton count={2} />
              </ComponentDemo>

              {/* TableSkeleton Demo */}
              <ComponentDemo
                title="TableSkeleton"
                description="Loading placeholder for tables"
                tags={["Phase 3A", "Loading"]}
                code={`<TableSkeleton rows={5} columns={4} />`}
              >
                <TableSkeleton rows={3} columns={4} />
              </ComponentDemo>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Gesture Components */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">👆 Gesture Components</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              {/* PullToRefresh Demo */}
              <ComponentDemo
                title="PullToRefresh"
                description="Pull-down gesture to refresh content"
                tags={["Phase 4A", "Gesture", "Existing"]}
                code={`<PullToRefresh onRefresh={handleRefresh}>\n  {/* Content */}\n</PullToRefresh>`}
                existingImplementation="src/features/QuanLyCongViec/Ticket/components/PullToRefreshWrapper.jsx"
              >
                <Box sx={{ p: 2, border: "1px solid #eee", borderRadius: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    ⚠️ Best tested on real mobile device
                  </Typography>
                  <Typography variant="caption">
                    Pull down from top to trigger refresh
                  </Typography>
                </Box>
              </ComponentDemo>

              {/* SwipeableCard Demo */}
              <ComponentDemo
                title="SwipeableCard"
                description="Swipe left/right to reveal actions"
                tags={["Phase 4A", "Gesture", "New"]}
                code={`<SwipeableCard\n  leftActions={[{ icon: <EditIcon />, onClick: edit }]}\n  rightActions={[{ icon: <DeleteIcon />, onClick: delete }]}\n>\n  {/* Card content */}\n</SwipeableCard>`}
              >
                <Typography variant="body2" color="text.secondary">
                  Component to be created in Phase 4
                </Typography>
              </ComponentDemo>

              {/* LongPressMenu Demo */}
              <ComponentDemo
                title="LongPressMenu"
                description="Long-press to show context menu"
                tags={["Phase 4A", "Gesture", "New"]}
                code={`<LongPressMenu\n  items={[\n    { label: "Edit", icon: <EditIcon /> },\n    { label: "Delete", icon: <DeleteIcon /> }\n  ]}\n>\n  {/* Content */}\n</LongPressMenu>`}
              >
                <Typography variant="body2" color="text.secondary">
                  Component to be created in Phase 4
                </Typography>
              </ComponentDemo>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Dashboard Components */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">📊 Dashboard Components</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <ComponentDemo
                title="StatusCard"
                description="Dashboard status card with count"
                tags={["Phase 2", "Existing"]}
                code={`<StatusCard\n  title="Chưa giao"\n  count={12}\n  color="warning"\n  onClick={handleClick}\n/>`}
                existingImplementation="src/features/QuanLyCongViec/Dashboard/CongViecDashboard/"
              >
                <Typography variant="body2" color="text.secondary">
                  See CongViecDashboardPage for live example
                </Typography>
              </ComponentDemo>

              <ComponentDemo
                title="CollapsibleAlertCard"
                description="Expandable alert with deadline warnings"
                tags={["Phase 2", "Existing"]}
                code={`<CollapsibleAlertCard\n  title="Công việc cần chú ý"\n  items={urgentTasks}\n/>`}
                existingImplementation="src/features/QuanLyCongViec/Dashboard/CongViecDashboard/"
              >
                <Typography variant="body2" color="text.secondary">
                  See CongViecDashboardPage for live example
                </Typography>
              </ComponentDemo>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}

// Helper Component for Demo Items
function ComponentDemo({
  title,
  description,
  tags = [],
  code,
  children,
  existingImplementation,
}) {
  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" mb={1}>
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            color={tag === "Existing" ? "success" : "default"}
          />
        ))}
      </Stack>
      <Typography variant="body2" color="text.secondary" mb={1}>
        {description}
      </Typography>
      {existingImplementation && (
        <Typography variant="caption" color="primary" mb={1} display="block">
          📂 Existing: {existingImplementation}
        </Typography>
      )}
      <Box sx={{ bgcolor: "grey.100", p: 1, borderRadius: 1, mb: 2 }}>
        <Typography
          variant="caption"
          component="pre"
          sx={{ fontFamily: "monospace" }}
        >
          {code}
        </Typography>
      </Box>
      <Box>{children}</Box>
    </Box>
  );
}

export default ComponentPreviewPage;
```

---

### Step 2: Add Route & Menu Item (0.5h)

**File:** `src/routes/index.js`

```javascript
import ComponentPreviewPage from "pages/ComponentPreviewPage";

const routes = [
  // ... existing routes
  {
    path: "/components-preview",
    element: <ComponentPreviewPage />,
  },
];
```

**File:** `src/features/Menu/menuItems.js`

```javascript
// Add to QuanLyCongViec section or separate Developer Tools section
{
  id: "components-preview",
  title: "Component Library",
  type: "item",
  url: "/components-preview",
  icon: ViewModuleIcon,
  // Only show in development
  visible: process.env.NODE_ENV === "development",
}
```

---

### Step 3: Testing & Documentation (0.5h)

**Checklist:**

- [ ] All Phase 3 components render correctly
- [ ] Mobile/Desktop toggle works
- [ ] Code snippets are accurate
- [ ] Real device testing for gestures
- [ ] Add link to Component Preview in Phase documentation

**Usage Guidelines:**

1. **For QA:** Open `/components-preview` to test all shared components in one place
2. **For Developers:** Reference code snippets when applying components to new features
3. **For Stakeholders:** Visual demo of PWA components without navigating entire app

---

## 🎯 Benefits

1. **Faster QA:** Test all components without navigating complex workflows
2. **Developer Reference:** Living documentation with code examples
3. **Visual Regression Testing:** Baseline for component appearance
4. **Mobile/Desktop Comparison:** Side-by-side view mode testing
5. **Onboarding:** New developers can see all shared components

---

## 🔮 Future Enhancements

- [ ] Add component prop controls (Storybook-like)
- [ ] Add "Copy code" button for snippets
- [ ] Add component performance metrics
- [ ] Add accessibility testing tools
- [ ] Generate documentation from JSDoc comments

---

## 📚 Related Files

- [PHASE_3_SPLASH_LAYOUTS.md](./PHASE_3_SPLASH_LAYOUTS.md)
- [PHASE_4_GESTURES.md](./PHASE_4_GESTURES.md)
- [00_MASTER_PLAN.md](./00_MASTER_PLAN.md)
