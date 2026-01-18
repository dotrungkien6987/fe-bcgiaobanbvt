/**
 * ComponentPreviewPage - Component Library Preview & Testing Tool
 *
 * Interactive demo page for all shared components (Phase 3+4)
 * - SplashScreen, Skeleton loaders, Gestures
 * - Mobile/Desktop preview toggle
 * - Code snippets for developers
 * - QA testing tool
 *
 * @component
 * @example
 * // Route: /components-preview
 * // Dev only (process.env.NODE_ENV === 'development')
 */

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
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LaptopIcon from "@mui/icons-material/Laptop";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";

// Import shared components
import SplashScreen from "components/SplashScreen";
import {
  CardSkeleton,
  TableSkeleton,
  FormSkeleton,
  StatusGridSkeleton,
  ListSkeleton,
  PageSkeleton,
} from "components/SkeletonLoader";
import MobileDetailLayout from "components/MobileDetailLayout";

function ComponentPreviewPage() {
  const [viewMode, setViewMode] = useState("mobile");
  const [splashVisible, setSplashVisible] = useState(false);
  const [copiedCode, setCopiedCode] = useState("");

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      setViewMode(newMode);
    }
  };

  const handleCopyCode = (code, componentName) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(componentName);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const previewWidth = viewMode === "mobile" ? "375px" : "100%";
  const previewMaxHeight = viewMode === "mobile" ? "667px" : "none";

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          mb: 4,
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h4" gutterBottom>
            Component Library
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interactive preview & testing tool for shared components
          </Typography>
        </Box>

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

      {/* Development Warning */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Development Only:</strong> This page is only visible in
        development mode
      </Alert>

      {/* Preview Container */}
      <Box
        sx={{
          width: previewWidth,
          maxHeight: previewMaxHeight,
          margin: "0 auto",
          border: viewMode === "mobile" ? "1px solid #ddd" : "none",
          borderRadius: viewMode === "mobile" ? 2 : 0,
          overflow: "auto",
          boxShadow: viewMode === "mobile" ? 3 : 0,
        }}
      >
        {/* Foundation Components */}
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              📱 Foundation Components (Phase 3A)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={4}>
              {/* SplashScreen Demo */}
              <ComponentDemo
                title="SplashScreen"
                description="Loading screen with logo animation and progress bar"
                tags={["Phase 3A", "Animation", "Complete"]}
                code={`import SplashScreen from 'components/SplashScreen';

<SplashScreen 
  onComplete={() => setShowSplash(false)} 
  duration={1200}
/>`}
                existingImplementation="src/components/SplashScreen/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Box
                  sx={{
                    position: "relative",
                    height: 300,
                    border: "1px solid #eee",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  {splashVisible ? (
                    <SplashScreen
                      onComplete={() => setSplashVisible(false)}
                      duration={1200}
                    />
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        height: "100%",
                        bgcolor: "grey.50",
                      }}
                    >
                      <Button
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        onClick={() => setSplashVisible(true)}
                      >
                        Replay Animation
                      </Button>
                    </Box>
                  )}
                </Box>
              </ComponentDemo>

              <Divider />

              {/* CardSkeleton Demo */}
              <ComponentDemo
                title="CardSkeleton"
                description="Loading placeholder for card-based layouts"
                tags={["Phase 3A", "Loading", "Complete"]}
                code={`import { CardSkeleton } from 'components/SkeletonLoader';

<CardSkeleton count={3} spacing={2} />`}
                existingImplementation="src/components/SkeletonLoader/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <CardSkeleton count={2} spacing={2} />
              </ComponentDemo>

              <Divider />

              {/* TableSkeleton Demo */}
              <ComponentDemo
                title="TableSkeleton"
                description="Loading placeholder for table layouts"
                tags={["Phase 3A", "Loading", "Complete"]}
                code={`import { TableSkeleton } from 'components/SkeletonLoader';

<TableSkeleton rows={5} columns={4} />`}
                existingImplementation="src/components/SkeletonLoader/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Paper sx={{ p: 2 }}>
                  <TableSkeleton rows={3} columns={4} />
                </Paper>
              </ComponentDemo>

              <Divider />

              {/* FormSkeleton Demo */}
              <ComponentDemo
                title="FormSkeleton"
                description="Loading placeholder for form layouts"
                tags={["Phase 3A", "Loading", "Complete"]}
                code={`import { FormSkeleton } from 'components/SkeletonLoader';

<FormSkeleton fields={5} />`}
                existingImplementation="src/components/SkeletonLoader/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Paper sx={{ p: 3 }}>
                  <FormSkeleton fields={3} />
                </Paper>
              </ComponentDemo>

              <Divider />

              {/* StatusGridSkeleton Demo */}
              <ComponentDemo
                title="StatusGridSkeleton"
                description="Loading skeleton for dashboard status cards (reused from CongViecDashboard)"
                tags={["Phase 3A", "Dashboard", "Complete"]}
                code={`import { StatusGridSkeleton } from 'components/SkeletonLoader';

<StatusGridSkeleton columns={4} />`}
                existingImplementation="src/components/SkeletonLoader/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <StatusGridSkeleton columns={4} />
              </ComponentDemo>

              <Divider />

              {/* ListSkeleton Demo */}
              <ComponentDemo
                title="ListSkeleton"
                description="Loading skeleton for list items (activities, notifications)"
                tags={["Phase 3A", "Loading", "Complete"]}
                code={`import { ListSkeleton } from 'components/SkeletonLoader';

<ListSkeleton items={5} />`}
                existingImplementation="src/components/SkeletonLoader/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Paper sx={{ p: 2 }}>
                  <ListSkeleton items={3} />
                </Paper>
              </ComponentDemo>

              <Divider />

              {/* PageSkeleton Demo */}
              <ComponentDemo
                title="PageSkeleton"
                description="Full page loading skeleton with stats cards and content area"
                tags={["Phase 3A", "Loading", "Complete"]}
                code={`import { PageSkeleton } from 'components/SkeletonLoader';

<PageSkeleton />`}
                existingImplementation="src/components/SkeletonLoader/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Box sx={{ maxHeight: 500, overflow: "auto" }}>
                  <PageSkeleton />
                </Box>
              </ComponentDemo>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Layout Components (Phase 3B) */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              📐 Layout Components (Phase 3B)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <ComponentDemo
                title="MobileDetailLayout"
                description="Responsive layout wrapper for detail pages with sticky header, scrollable content, and optional footer"
                tags={["Phase 3B", "Layout", "Complete"]}
                code={`import MobileDetailLayout from 'components/MobileDetailLayout';

<MobileDetailLayout
  title="Chi tiết công việc"
  subtitle="Mã: CV-001"
  backPath="/quanlycongviec"
  actions={<ActionsMenu />}
  footer={<ActionButtons />}
  enablePullToRefresh
  onRefresh={handleRefresh}
>
  {content}
</MobileDetailLayout>`}
                existingImplementation="src/components/MobileDetailLayout/index.js"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Box
                  sx={{
                    height: 400,
                    border: "1px solid #eee",
                    borderRadius: 1,
                    overflow: "hidden",
                  }}
                >
                  <MobileDetailLayout
                    title="Demo Page Title"
                    subtitle="Subtitle or ID"
                    actions={
                      <IconButton size="small" color="inherit">
                        <ExpandMoreIcon />
                      </IconButton>
                    }
                    footer={
                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" fullWidth>
                          Save
                        </Button>
                        <Button variant="outlined" fullWidth>
                          Cancel
                        </Button>
                      </Stack>
                    }
                  >
                    <Stack spacing={2}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2">
                          Content section 1 - This demonstrates the scrollable
                          content area
                        </Typography>
                      </Paper>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2">
                          Content section 2
                        </Typography>
                      </Paper>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2">
                          Content section 3 - Footer buttons are sticky at
                          bottom
                        </Typography>
                      </Paper>
                    </Stack>
                  </MobileDetailLayout>
                </Box>
              </ComponentDemo>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Gesture Components (Phase 4 - Not Yet Implemented) */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              👆 Gesture Components (Phase 4)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="warning" sx={{ mb: 2 }}>
              <strong>Coming Soon:</strong> Phase 4 components not yet
              implemented
            </Alert>
            <Stack spacing={3}>
              <ComponentDemo
                title="PullToRefresh"
                description="Pull-down gesture to refresh content"
                tags={["Phase 4", "Gesture", "Complete"]}
                code={`import PullToRefresh from 'components/PullToRefreshWrapper';

<PullToRefresh onRefresh={handleRefresh}>
  {/* Content */}
</PullToRefresh>`}
                existingImplementation="src/components/PullToRefreshWrapper/index.js (moved from Ticket module)"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">
                    ✅ Component now available in shared location
                  </Typography>
                  <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                    Location: src/components/PullToRefreshWrapper/index.js
                  </Typography>
                  <Typography
                    variant="caption"
                    display="block"
                    sx={{ mt: 0.5 }}
                  >
                    Integrated into MobileDetailLayout via enablePullToRefresh
                    prop
                  </Typography>
                </Paper>
              </ComponentDemo>

              <ComponentDemo
                title="SwipeableCard"
                description="Swipe left/right to reveal actions"
                tags={["Phase 4", "Gesture", "Planned"]}
                code={`import SwipeableCard from 'components/gestures/SwipeableCard';

<SwipeableCard
  leftActions={[{ icon: <EditIcon />, onClick: edit }]}
  rightActions={[{ icon: <DeleteIcon />, onClick: del }]}
>
  {/* Card content */}
</SwipeableCard>`}
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">
                    Component not yet implemented - Phase 4
                  </Typography>
                </Paper>
              </ComponentDemo>

              <ComponentDemo
                title="LongPressMenu"
                description="Long-press to show context menu"
                tags={["Phase 4", "Gesture", "Planned"]}
                code={`import LongPressMenu from 'components/gestures/LongPressMenu';

<LongPressMenu
  items={[
    { label: "Edit", icon: <EditIcon /> },
    { label: "Delete", icon: <DeleteIcon /> }
  ]}
>
  {/* Content */}
</LongPressMenu>`}
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Paper sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body2" color="text.secondary">
                    Component not yet implemented - Phase 4
                  </Typography>
                </Paper>
              </ComponentDemo>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Dashboard Components (Phase 2 - Existing) */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              📊 Dashboard Components (Phase 2)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={3}>
              <ComponentDemo
                title="StatusCard"
                description="Dashboard status card with count and icon"
                tags={["Phase 2", "Dashboard", "Existing"]}
                code={`// Used in CongViecDashboardPage
<StatusCard
  title="Chưa giao"
  count={12}
  color="warning"
  onClick={handleClick}
/>`}
                existingImplementation="src/features/QuanLyCongViec/Dashboard/CongViecDashboard/"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Alert severity="info">
                  <Typography variant="body2">
                    Live implementation in CongViecDashboardPage
                  </Typography>
                  <Typography variant="caption" display="block">
                    Navigate to: /quanlycongviec/dashboard/cong-viec
                  </Typography>
                </Alert>
              </ComponentDemo>

              <ComponentDemo
                title="CollapsibleAlertCard"
                description="Expandable alert with deadline warnings"
                tags={["Phase 2", "Dashboard", "Existing"]}
                code={`// Used in CongViecDashboardPage
<CollapsibleAlertCard
  title="Công việc cần chú ý"
  items={urgentTasks}
/>`}
                existingImplementation="src/features/QuanLyCongViec/Dashboard/CongViecDashboard/"
                onCopyCode={handleCopyCode}
                copiedCode={copiedCode}
              >
                <Alert severity="info">
                  <Typography variant="body2">
                    Live implementation in CongViecDashboardPage
                  </Typography>
                  <Typography variant="caption" display="block">
                    Navigate to: /quanlycongviec/dashboard/cong-viec
                  </Typography>
                </Alert>
              </ComponentDemo>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>

      {/* Footer Info */}
      <Box sx={{ mt: 4, p: 3, bgcolor: "grey.50", borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          💡 Usage Guidelines
        </Typography>
        <Stack spacing={1}>
          <Typography variant="body2">
            • <strong>For QA:</strong> Use this page to test all shared
            components without navigating the entire app
          </Typography>
          <Typography variant="body2">
            • <strong>For Developers:</strong> Reference code snippets when
            applying components to new features
          </Typography>
          <Typography variant="body2">
            • <strong>Mobile Testing:</strong> Switch to mobile view to test
            responsive behavior
          </Typography>
          <Typography variant="body2">
            • <strong>Real Device Testing:</strong> Gestures must be tested on
            actual mobile devices (DevTools insufficient)
          </Typography>
        </Stack>
      </Box>
    </Container>
  );
}

/**
 * ComponentDemo - Reusable wrapper for component demonstrations
 */
function ComponentDemo({
  title,
  description,
  tags = [],
  code,
  children,
  existingImplementation,
  onCopyCode,
  copiedCode,
}) {
  return (
    <Box>
      {/* Title & Tags */}
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        mb={1}
        flexWrap="wrap"
      >
        <Typography variant="subtitle1" fontWeight="bold">
          {title}
        </Typography>
        {tags.map((tag) => (
          <Chip
            key={tag}
            label={tag}
            size="small"
            color={
              tag === "Complete" || tag === "Existing"
                ? "success"
                : tag === "Planned"
                ? "warning"
                : "default"
            }
          />
        ))}
      </Stack>

      {/* Description */}
      <Typography variant="body2" color="text.secondary" mb={1}>
        {description}
      </Typography>

      {/* File Location */}
      {existingImplementation && (
        <Typography variant="caption" color="primary" mb={2} display="block">
          📂 {existingImplementation}
        </Typography>
      )}

      {/* Code Snippet */}
      <Paper
        sx={{
          bgcolor: "grey.900",
          color: "grey.100",
          p: 2,
          borderRadius: 1,
          mb: 2,
          position: "relative",
        }}
      >
        <Tooltip title={copiedCode === title ? "Copied!" : "Copy code"}>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "grey.400",
              "&:hover": { color: "grey.100" },
            }}
            onClick={() => onCopyCode(code, title)}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Typography
          component="pre"
          variant="caption"
          sx={{
            fontFamily: "monospace",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            m: 0,
          }}
        >
          {code}
        </Typography>
      </Paper>

      {/* Live Demo */}
      <Box>{children}</Box>
    </Box>
  );
}

export default ComponentPreviewPage;
