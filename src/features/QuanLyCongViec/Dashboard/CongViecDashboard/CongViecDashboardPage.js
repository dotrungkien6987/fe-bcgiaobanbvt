/**
 * CongViecDashboardPage V2.1 - Dashboard tổng quan Công việc (Mobile Optimized)
 *
 * Features:
 * - Mobile-friendly filter drawer (date presets + deadline status)
 * - Overall metrics (4 cards)
 * - 4 collapsible alert cards (received/assigned × overdue/upcoming)
 * - Received tasks section (4 status cards)
 * - Assigned tasks section (5 status cards + metrics)
 * - Client-side aggregation with useTaskCounts hook
 * - Reuses existing APIs: /me + /assigned
 *
 * @version 2.1
 * @see IMPLEMENTATION_PLAN_CONGVIEC_DASHBOARD.md
 * @see MOBILE_UX_IMPROVEMENTS.md
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Tooltip,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Badge,
} from "@mui/material";
import { ArrowLeft, Refresh, Filter } from "iconsax-react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import useAuth from "hooks/useAuth";

// Import Redux actions
import {
  getReceivedCongViecs,
  getAssignedCongViecs,
} from "../../CongViec/congViecSlice";

// Import reusable components
import DateRangePresets from "../../CongViec/components/DateRangePresets";

// Import dashboard sections
import OverallMetrics from "./components/OverallMetrics";
import ReceivedDashboardSection from "./components/ReceivedDashboardSection";
import AssignedDashboardSection from "./components/AssignedDashboardSection";

// Import new mobile components
import CollapsibleAlertCard from "./components/CollapsibleAlertCard";
import MobileFilterDrawer from "./components/MobileFilterDrawer";

// Import hooks
import useTaskCounts from "../../CongViec/hooks/useTaskCounts";

// Extend dayjs with isoWeek plugin
dayjs.extend(isoWeek);

/**
 * Format date range context for header display
 * @param {Object} dateRange - { from: "YYYY-MM-DD", to: "YYYY-MM-DD" }
 * @returns {string} - Formatted string like "Tuần này: 08 - 15/01/2026"
 */
function formatDateRangeContext(dateRange) {
  const { from, to } = dateRange;
  const fromDay = dayjs(from);
  const toDay = dayjs(to);

  // Same day
  if (fromDay.isSame(toDay, "day")) {
    return `Hôm nay: ${fromDay.format("DD/MM/YYYY")}`;
  }

  // Same week as current week
  if (
    fromDay.isSame(dayjs().startOf("isoWeek"), "day") &&
    toDay.isSame(dayjs().endOf("isoWeek"), "day")
  ) {
    return `Tuần này: ${fromDay.format("DD")} - ${toDay.format("DD/MM/YYYY")}`;
  }

  // Same month
  if (fromDay.month() === toDay.month() && fromDay.year() === toDay.year()) {
    return `Tháng ${fromDay.format("MM/YYYY")}: ${fromDay.format(
      "DD"
    )} - ${toDay.format("DD")}`;
  }

  // Generic range
  return `${fromDay.format("DD/MM")} - ${toDay.format("DD/MM/YYYY")}`;
}

/**
 * Main Component
 */
export default function CongViecDashboardPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Date range state (default: this week)
  const [dateRange, setDateRange] = useState({
    from: dayjs().startOf("isoWeek").format("YYYY-MM-DD"),
    to: dayjs().endOf("isoWeek").format("YYYY-MM-DD"),
  });
  const [selectedPreset, setSelectedPreset] = useState("week");

  // Filter drawer state (mobile only)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [deadlineFilter, setDeadlineFilter] = useState("ALL"); // ALL | QUA_HAN | SAP_QUA_HAN | DUNG_HAN

  // Get data from Redux
  const { receivedCongViecs, assignedCongViecs, isLoading } = useSelector(
    (state) => state.congViec
  );

  // Fetch data on mount
  useEffect(() => {
    if (user?.NhanVienID) {
      const params = {
        page: 1,
        limit: 500,
      };

      // Parallel fetch
      dispatch(getReceivedCongViecs(user.NhanVienID, params));
      dispatch(getAssignedCongViecs(user.NhanVienID, params));
    }
  }, [dispatch, user?.NhanVienID]);

  // Count using hook (client-side aggregation)
  const receivedCounts = useTaskCounts(receivedCongViecs || []);
  const assignedCounts = useTaskCounts(assignedCongViecs || []);

  // Handle date preset change
  const handleDatePresetChange = (from, to, key) => {
    setDateRange({ from, to });
    setSelectedPreset(key);
  };

  // Handle deadline filter change
  const handleDeadlineFilterChange = (value) => {
    setDeadlineFilter(value);
  };

  // Handle refresh
  const handleRefresh = () => {
    if (user?.NhanVienID) {
      const params = {
        page: 1,
        limit: 500,
      };

      dispatch(getReceivedCongViecs(user.NhanVienID, params));
      dispatch(getAssignedCongViecs(user.NhanVienID, params));
    }
  };

  // Calculate active filter count for badge
  const activeFilterCount = deadlineFilter !== "ALL" ? 1 : 0;

  return (
    <Container
      maxWidth="xl"
      sx={{ py: 3, pb: 10, px: { xs: 1, sm: 2, md: 3 } }}
    >
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/quanlycongviec")}>
          <ArrowLeft size={24} />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={600} noWrap>
            📋 Dashboard Công Việc
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatDateRangeContext(dateRange)}
          </Typography>
        </Box>

        {/* Filter button (Mobile only) */}
        {isMobile && (
          <Tooltip title="Bộ lọc">
            <IconButton onClick={() => setFilterDrawerOpen(true)}>
              <Badge badgeContent={activeFilterCount} color="primary">
                <Filter size={20} />
              </Badge>
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title="Làm mới">
          <IconButton onClick={handleRefresh} disabled={isLoading}>
            <Refresh size={20} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Date Range Filter - Desktop only */}
      {!isMobile && (
        <DateRangePresets
          onSelectPreset={handleDatePresetChange}
          selectedPreset={selectedPreset}
          disabled={isLoading}
        />
      )}

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Dashboard Sections */}
      <Stack spacing={3}>
        {/* Overall Metrics */}
        <OverallMetrics
          receivedCounts={receivedCounts}
          assignedCounts={assignedCounts}
          receivedTasks={receivedCongViecs || []}
          assignedTasks={assignedCongViecs || []}
          dateRange={dateRange}
        />

        {/* Alert Cards - Received Tasks */}
        <CollapsibleAlertCard
          tasks={receivedCongViecs || []}
          type="overdue"
          taskSource="received"
          userId={user?._id}
          dismissible={true}
        />

        <CollapsibleAlertCard
          tasks={receivedCongViecs || []}
          type="upcoming"
          taskSource="received"
          userId={user?._id}
          dismissible={true}
        />

        {/* Alert Cards - Assigned Tasks */}
        <CollapsibleAlertCard
          tasks={assignedCongViecs || []}
          type="overdue"
          taskSource="assigned"
          userId={user?._id}
          dismissible={true}
        />

        <CollapsibleAlertCard
          tasks={assignedCongViecs || []}
          type="upcoming"
          taskSource="assigned"
          userId={user?._id}
          dismissible={true}
        />

        {/* Received Tasks Section */}
        <ReceivedDashboardSection
          counts={receivedCounts}
          tasks={receivedCongViecs || []}
          isLoading={isLoading}
        />

        {/* Assigned Tasks Section */}
        <AssignedDashboardSection
          counts={assignedCounts}
          tasks={assignedCongViecs || []}
          dateRange={dateRange}
          isLoading={isLoading}
        />
      </Stack>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        dateRange={dateRange}
        selectedPreset={selectedPreset}
        onDatePresetChange={handleDatePresetChange}
        deadlineFilter={deadlineFilter}
        onDeadlineFilterChange={handleDeadlineFilterChange}
        onApply={() => {
          // Filter is applied on parent state change
          // This is just a callback for future enhancements
        }}
        onReset={() => {
          // Reset callback placeholder
        }}
      />
    </Container>
  );
}
