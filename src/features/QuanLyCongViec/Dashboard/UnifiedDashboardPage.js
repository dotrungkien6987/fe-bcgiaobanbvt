/**
 * UnifiedDashboardPage - Trang chủ Quản lý công việc (Simplified v2)
 *
 * Features:
 * - GreetingSection with user info + refresh
 * - AlertBanner for urgent notifications
 * - QuickActionsGrid (6 buttons)
 * - StatusOverviewCards (2 cards: CongViec + YeuCau)
 * - UrgentItemsList (mixed CongViec + YeuCau)
 * - RecentActivitiesTimeline (mixed CongViec + YeuCau)
 * - Mobile-optimized layout
 * - No KPI section (moved to dedicated page)
 */

import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Grid } from "@mui/material";
import useAuth from "hooks/useAuth";
import useMobileLayout from "hooks/useMobileLayout";
import { fetchAllHomeData } from "features/WorkDashboard/workDashboardSlice";
import { FABMenuButton } from "features/WorkDashboard/components";
import {
  GreetingSection,
  AlertBanner,
  QuickActionsGrid,
  StatusOverviewCards,
  UrgentItemsList,
  RecentActivitiesTimeline,
} from "./components";

/**
 * Main Dashboard Component
 */
function UnifiedDashboardPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isMobile } = useMobileLayout();
  const urgentSectionRef = useRef(null);

  // Redux state
  const { homeSummary, urgentItems, isLoading } = useSelector(
    (state) =>
      state.workDashboard || {
        homeSummary: {
          congViec: { dangLam: 0, toiGiao: 0, gap: 0, quaHan: 0 },
          yeuCau: { toiGui: 0, canXuLy: 0, quaHan: 0 },
          alert: null,
        },
        urgentItems: { items: [], total: 0, isLoading: false },
        isLoading: false,
      },
  );

  // Fetch home data on mount
  useEffect(() => {
    if (user?.NhanVienID) {
      dispatch(fetchAllHomeData(user.NhanVienID));
    }
  }, [dispatch, user?.NhanVienID]);

  // Handle refresh
  const handleRefresh = () => {
    if (user?.NhanVienID) {
      dispatch(fetchAllHomeData(user.NhanVienID));
    }
  };

  // Handle view urgent items
  const handleViewUrgent = () => {
    // Scroll to urgent section
    urgentSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "secondary.lighter",
        pb: { xs: 10, md: 3 },
      }}
    >
      {/* Greeting Section - Full-bleed on mobile */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 2,
          mb: 1,
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <GreetingSection
            user={user}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </Box>
      </Box>

      {/* Alert Banner - With padding */}
      <Box
        sx={{
          px: { xs: 2, md: 3 },
          py: { xs: 1, md: 2 },
          maxWidth: { xs: "100%", md: "lg" },
          mx: { xs: 0, md: "auto" },
        }}
      >
        <AlertBanner
          alert={homeSummary?.alert}
          onViewClick={handleViewUrgent}
        />
      </Box>

      {/* Quick Actions - Full-bleed on mobile */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 2,
          mb: 1,
          borderTop: { xs: "1px solid", md: "none" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 3 },
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <QuickActionsGrid nhanVienId={user?.NhanVienID} />
        </Box>
      </Box>

      {/* Status Overview Cards - Full-bleed on mobile */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 2,
          mb: 1,
          borderTop: { xs: "1px solid", md: "none" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: { xs: 0, md: 3 },
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <StatusOverviewCards
            congViec={homeSummary?.congViec}
            yeuCau={homeSummary?.yeuCau}
            isLoading={isLoading}
            nhanVienId={user?.NhanVienID}
          />
        </Box>
      </Box>

      {/* Urgent Items + Recent Activities - Full-bleed on mobile */}
      <Box
        ref={urgentSectionRef}
        sx={{
          bgcolor: "background.paper",
          py: 2,
          borderTop: { xs: "1px solid", md: "none" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: { xs: 0, md: 3 },
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <Grid container spacing={{ xs: 0, md: 2 }}>
            <Grid item xs={12} md={6}>
              <UrgentItemsList
                items={urgentItems?.items || []}
                total={urgentItems?.total || 0}
                isLoading={urgentItems?.isLoading}
                nhanVienId={user?.NhanVienID}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <RecentActivitiesTimeline />
            </Grid>
          </Grid>
        </Box>
      </Box>

      {!isMobile && <FABMenuButton />}
    </Box>
  );
}

export default UnifiedDashboardPage;
