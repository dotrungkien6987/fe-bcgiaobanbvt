/**
 * MobileDetailLayout - Responsive layout cho detail pages
 *
 * Cung cấp layout nhất quán cho tất cả detail pages:
 * - Mobile: Sticky header + scrollable content + optional sticky footer
 * - Desktop: Có thể override bằng custom layout
 *
 * Features:
 * - AppBar header (56px) với back button
 * - Pull-to-refresh integration (optional)
 * - Sticky footer cho action buttons
 * - iOS momentum scrolling
 * - Responsive padding
 *
 * Usage:
 * ```jsx
 * <MobileDetailLayout
 *   title="Chi tiết công việc"
 *   subtitle="Mã: CV-001"
 *   backPath="/quanlycongviec"
 *   actions={<ActionsMenu />}
 *   footer={<ActionButtons />}
 *   enablePullToRefresh
 *   onRefresh={handleRefresh}
 * >
 *   {content}
 * </MobileDetailLayout>
 * ```
 */

import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Container,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMobileLayout from "hooks/useMobileLayout";

// Import shared PullToRefreshWrapper component
import PullToRefreshWrapper from "components/PullToRefreshWrapper";

const HEADER_HEIGHT = 56; // AppBar height
const FOOTER_HEIGHT = 80; // Estimated footer height for spacing
const BOTTOM_NAV_HEIGHT = 56; // Mobile bottom navigation height

function MobileDetailLayout({
  title,
  subtitle,
  backPath,
  onBack,
  actions,
  children,
  footer,
  enablePullToRefresh = false,
  onRefresh,
  maxWidth = "lg",
  disablePadding = false,
}) {
  const theme = useTheme();
  const navigate = useNavigate();
  const { isMobile } = useMobileLayout();

  // Handle back navigation
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

  // Desktop: Return simple container (không cần special layout)
  if (!isMobile) {
    return (
      <Container maxWidth={maxWidth} disableGutters={disablePadding}>
        {children}
      </Container>
    );
  }

  // Mobile: Full responsive layout với sticky header + footer
  const headerSection = (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        top: 0,
        zIndex: theme.zIndex.appBar,
        bgcolor: "primary.main",
        color: "primary.contrastText",
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <Toolbar
        sx={{
          minHeight: HEADER_HEIGHT,
          px: 1,
          gap: 1,
        }}
      >
        {/* Back button */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={handleBack}
          aria-label="back"
          sx={{ mr: 0.5 }}
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Title + Subtitle */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 600,
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography
              variant="caption"
              noWrap
              sx={{
                opacity: 0.9,
                fontSize: "0.75rem",
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {/* Actions (optional) */}
        {actions && <Box sx={{ ml: "auto" }}>{actions}</Box>}
      </Toolbar>
    </AppBar>
  );

  // Content area - scrollable với iOS momentum
  const contentSection = (
    <Box
      sx={{
        flex: 1,
        overflow: "auto",
        WebkitOverflowScrolling: "touch", // iOS momentum scrolling
        px: disablePadding ? 0 : 2,
        py: disablePadding ? 0 : 2,
        // Reserve space for footer + bottom nav if exists
        pb: footer
          ? `${FOOTER_HEIGHT + BOTTOM_NAV_HEIGHT + 16}px`
          : disablePadding
          ? 0
          : 2,
      }}
    >
      {children}
    </Box>
  );

  // Footer section - sticky at bottom (above bottom nav)
  const footerSection = footer ? (
    <Box
      sx={{
        position: "fixed",
        bottom: BOTTOM_NAV_HEIGHT, // Position above bottom navigation
        left: 0,
        right: 0,
        bgcolor: "background.paper",
        borderTop: `1px solid ${theme.palette.divider}`,
        p: 2,
        zIndex: theme.zIndex.appBar,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        // Safe area for notched devices
        paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)",
      }}
    >
      {footer}
    </Box>
  ) : null;

  // Wrap with pull-to-refresh if enabled
  const contentWithRefresh = enablePullToRefresh ? (
    <PullToRefreshWrapper onRefresh={onRefresh} disabled={!onRefresh}>
      {contentSection}
    </PullToRefreshWrapper>
  ) : (
    contentSection
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        bgcolor: "background.default",
      }}
    >
      {headerSection}
      {contentWithRefresh}
      {footerSection}
    </Box>
  );
}

MobileDetailLayout.propTypes = {
  /** Page title (required) */
  title: PropTypes.string.isRequired,

  /** Subtitle - typically displays ID or code */
  subtitle: PropTypes.string,

  /** Navigation path for back button */
  backPath: PropTypes.string,

  /** Custom back handler (overrides backPath) */
  onBack: PropTypes.func,

  /** Action buttons/menu in header (e.g., more menu) */
  actions: PropTypes.node,

  /** Page content */
  children: PropTypes.node.isRequired,

  /** Sticky footer content (e.g., action buttons) */
  footer: PropTypes.node,

  /** Enable pull-to-refresh gesture */
  enablePullToRefresh: PropTypes.bool,

  /** Refresh callback */
  onRefresh: PropTypes.func,

  /** Container maxWidth (desktop only) */
  maxWidth: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl", false]),

  /** Disable content padding */
  disablePadding: PropTypes.bool,
};

export default MobileDetailLayout;
