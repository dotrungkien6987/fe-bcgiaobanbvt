import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Tabs,
  Tab,
  Paper,
  Stack,
  Breadcrumbs,
  Link,
  CircularProgress,
  Drawer,
  Button,
  Alert,
  AlertTitle,
} from "@mui/material";
import {
  Home as HomeIcon,
  Work as WorkIcon,
  History as HistoryIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  getCompletedArchive,
  getCompletedArchiveStats,
  setArchiveTab,
  setArchiveFilters,
  setArchivePage,
  setArchiveRowsPerPage,
} from "./congViecSlice";
import CongViecTable from "./CongViecTable";
import CongViecDetailDialog from "./CongViecDetailDialog";
import { getCongViecDetail } from "./congViecSlice";
import useAuth from "hooks/useAuth";
import CompletedStatsCards from "./components/CompletedStatsCards";
import CongViecFilterPanel from "./CongViecFilterPanel";
import DateRangePresets from "./components/DateRangePresets";
import useCompletedArchiveUrlParams from "./hooks/useCompletedArchiveUrlParams";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/vi";

/**
 * CompletedTasksArchivePage - Full archive view for completed tasks
 *
 * Features:
 * - 2 tabs: My completed / Team completed
 * - Stats cards (Phase 2)
 * - Advanced filters (Phase 3)
 * - Pagination
 * - Export (Phase 4)
 * - Mobile responsive (Phase 5)
 *
 * Routes:
 * - /quanlycongviec/lich-su-hoan-thanh (default: my-completed)
 * - /quanlycongviec/lich-su-hoan-thanh?tab=my-completed
 * - /quanlycongviec/lich-su-hoan-thanh?tab=team-completed
 */
const CompletedTasksArchivePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // URL params sync hook
  const { updateTab, updatePage, updateRowsPerPage } =
    useCompletedArchiveUrlParams();

  // Auth context
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;

  // Redux state
  const { completedArchive } = useSelector((state) => state.congViec);
  const { nhanVienDuocQuanLy } = useSelector((state) => state.kpi);
  const { activeTab, myCompleted, teamCompleted, stats } = completedArchive;

  // Current tab data (memoized)
  const currentTab = useMemo(
    () => (activeTab === "my-completed" ? myCompleted : teamCompleted),
    [activeTab, myCompleted, teamCompleted]
  );
  const { tasks, total, isLoading, error, currentPage, rowsPerPage, filters } =
    currentTab;

  // Local state for dialogs
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    congViecId: null,
  });

  // Filter drawer state
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [selectedDatePreset, setSelectedDatePreset] = useState(null);

  // Load data on mount and when tab/page/filters change
  useEffect(() => {
    if (!nhanVienId) return;

    dispatch(
      getCompletedArchive({
        nhanVienId,
        tab: activeTab,
        page: currentPage,
        limit: rowsPerPage,
        filters,
      })
    );

    // Load stats
    dispatch(getCompletedArchiveStats({ nhanVienId, tab: activeTab }));
  }, [dispatch, nhanVienId, activeTab, currentPage, rowsPerPage, filters]);

  // Handlers (memoized with useCallback)
  const handleTabChange = useCallback(
    (event, newTab) => {
      updateTab(newTab);
    },
    [updateTab]
  );

  const handlePageChange = useCallback(
    (newPage) => {
      updatePage(newPage);
    },
    [updatePage]
  );

  const handleRowsPerPageChange = useCallback(
    (newRowsPerPage) => {
      updateRowsPerPage(newRowsPerPage);
    },
    [updateRowsPerPage]
  );

  const handleFilterChange = useCallback(
    (field, value) => {
      const newFilters = { ...filters, [field]: value };
      dispatch(setArchiveFilters({ tab: activeTab, filters: newFilters }));
      // Clear preset if user manually changes date filters
      if (field === "NgayHoanThanhFrom" || field === "NgayHoanThanhTo") {
        setSelectedDatePreset(null);
      }
    },
    [filters, activeTab, dispatch]
  );

  const handleResetFilters = useCallback(() => {
    dispatch(setArchiveFilters({ tab: activeTab, filters: {} }));
    setSelectedDatePreset(null);
  }, [activeTab, dispatch]);

  const handleDatePresetSelect = useCallback(
    (from, to, presetKey) => {
      const newFilters = {
        ...filters,
        NgayHoanThanhFrom: from,
        NgayHoanThanhTo: to,
      };
      dispatch(setArchiveFilters({ tab: activeTab, filters: newFilters }));
      setSelectedDatePreset(presetKey);
    },
    [filters, activeTab, dispatch]
  );

  const handleOpenDetail = useCallback(
    (congViecId) => {
      setDetailDialog({ open: true, congViecId });
      dispatch(getCongViecDetail(congViecId));
    },
    [dispatch]
  );

  const handleCloseDetail = useCallback(() => {
    setDetailDialog({ open: false, congViecId: null });
  }, []);

  // Check permissions for team tab
  const canViewTeamTab =
    user?.PhanQuyen?.toLowerCase() === "admin" ||
    user?.PhanQuyen?.toLowerCase() === "superadmin" ||
    user?.PhanQuyen?.toLowerCase() === "manager";

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/quanlycongviec"
          onClick={(e) => {
            e.preventDefault();
            navigate("/quanlycongviec");
          }}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Quản lý công việc
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <HistoryIcon fontSize="small" />
          Lịch sử hoàn thành
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <HistoryIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h4" fontWeight={700}>
            Lịch sử công việc hoàn thành
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Xem lại công việc đã hoàn thành với thống kê và phân tích chi tiết
          </Typography>
        </Box>
      </Stack>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Tab
            value="my-completed"
            label="Việc tôi làm xong"
            icon={<PersonIcon />}
            iconPosition="start"
            sx={{ textTransform: "none", fontWeight: 600 }}
          />
          {canViewTeamTab && (
            <Tab
              value="team-completed"
              label="Việc nhóm tôi giao"
              icon={<GroupIcon />}
              iconPosition="start"
              sx={{ textTransform: "none", fontWeight: 600 }}
            />
          )}
        </Tabs>
      </Paper>

      {/* Stats Cards Section */}
      <CompletedStatsCards
        stats={
          activeTab === "my-completed"
            ? stats?.my || {
                total: 0,
                thisWeek: 0,
                thisMonth: 0,
                onTimeRate: 0,
              }
            : stats?.team || {
                total: 0,
                thisWeek: 0,
                thisMonth: 0,
                onTimeRate: 0,
              }
        }
        isLoading={isLoading}
      />

      {/* Filters Section - Drawer Button */}
      <Box sx={{ mb: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterDrawerOpen(true)}
        >
          Bộ lọc nâng cao
        </Button>
      </Box>

      {/* Filter Drawer */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        sx={{
          "& .MuiDrawer-paper": {
            width: "100%",
            maxWidth: 400,
            p: 2,
          },
        }}
      >
        <Typography variant="h6" gutterBottom>
          Bộ lọc nâng cao
        </Typography>

        {/* Date Range Presets */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Khoảng thời gian nhanh:
          </Typography>
          <DateRangePresets
            onSelectPreset={handleDatePresetSelect}
            selectedPreset={selectedDatePreset}
            disabled={isLoading}
          />
        </Box>

        {/* Custom Date Range Pickers */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Khoảng thời gian tùy chọn:
          </Typography>
          <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="vi">
            <Stack spacing={2}>
              <DatePicker
                label="Ngày hoàn thành từ"
                value={
                  filters.NgayHoanThanhFrom
                    ? dayjs(filters.NgayHoanThanhFrom)
                    : null
                }
                onChange={(date) =>
                  handleFilterChange(
                    "NgayHoanThanhFrom",
                    date ? date.format("YYYY-MM-DD") : null
                  )
                }
                disabled={isLoading}
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
              <DatePicker
                label="Ngày hoàn thành đến"
                value={
                  filters.NgayHoanThanhTo
                    ? dayjs(filters.NgayHoanThanhTo)
                    : null
                }
                onChange={(date) =>
                  handleFilterChange(
                    "NgayHoanThanhTo",
                    date ? date.format("YYYY-MM-DD") : null
                  )
                }
                disabled={isLoading}
                minDate={
                  filters.NgayHoanThanhFrom
                    ? dayjs(filters.NgayHoanThanhFrom)
                    : undefined
                }
                slotProps={{
                  textField: {
                    size: "small",
                    fullWidth: true,
                  },
                }}
              />
            </Stack>
          </LocalizationProvider>
        </Box>

        {/* Filter Panel with conditional excludeFields */}
        <CongViecFilterPanel
          filters={filters}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
          isLoading={isLoading}
          excludeFields={
            activeTab === "my-completed"
              ? ["TrangThai", "NguoiChinhID"]
              : ["TrangThai", "VaiTroCuaToi"]
          }
          managedEmployees={
            activeTab === "team-completed" ? nhanVienDuocQuanLy : undefined
          }
          collapsible={false}
          forceOneColumn={true}
          customTinhTrangHanOptions={[
            { value: "", label: "Tất cả" },
            { value: "ON_TIME", label: "Hoàn thành đúng hạn" },
            { value: "LATE", label: "Hoàn thành trễ hạn" },
            { value: "EARLY", label: "Hoàn thành sớm" },
          ]}
        />

        {/* Drawer Actions */}
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            onClick={() => setFilterDrawerOpen(false)}
          >
            Đóng
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setFilterDrawerOpen(false)}
          >
            Áp dụng
          </Button>
        </Stack>
      </Drawer>

      {/* Export Actions - Phase 4 */}
      {/* TODO: Add ExportMenu component */}
      {/* <Stack direction="row" justifyContent="flex-end" sx={{ mb: 2 }}>
        <ExportMenu tasks={tasks} stats={stats} filters={filters} />
      </Stack> */}

      {/* Error state */}
      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                dispatch(
                  getCompletedArchive({
                    nhanVienId,
                    tab: activeTab,
                    page: currentPage,
                    limit: rowsPerPage,
                    filters,
                  })
                );
              }}
            >
              Thử lại
            </Button>
          }
        >
          <AlertTitle>Có lỗi xảy ra</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!isLoading && total === 0 && (
        <Paper sx={{ p: 6, textAlign: "center" }}>
          <WorkIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có công việc hoàn thành
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {activeTab === "my-completed"
              ? "Bạn chưa hoàn thành công việc nào"
              : "Chưa có công việc nào được hoàn thành bởi team"}
          </Typography>
        </Paper>
      )}

      {/* Error state */}
      {error && !isLoading && (
        <Paper sx={{ p: 4, textAlign: "center", bgcolor: "error.lighter" }}>
          <Typography color="error" gutterBottom>
            Có lỗi xảy ra khi tải dữ liệu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {error}
          </Typography>
        </Paper>
      )}

      {/* Loading state */}
      {isLoading && total === 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Data table */}
      {(total > 0 || isLoading) && (
        <>
          {/* Summary info */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Hiển thị {tasks.length} trong tổng số {total} công việc hoàn thành
          </Typography>

          <CongViecTable
            congViecs={tasks}
            totalItems={total}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            onView={handleOpenDetail}
            onEdit={() => {}} // Read-only in archive
            onDelete={() => {}} // Read-only in archive
            onTree={() => {}} // Tree view disabled in archive
            activeTab={activeTab === "my-completed" ? "received" : "assigned"}
            currentUserRole={user?.PhanQuyen}
            currentUserNhanVienId={nhanVienId}
            isLoading={isLoading}
            showProgress={false} // Don't show progress for completed tasks
            showParticipants={false}
            showAssignee={activeTab === "team-completed"} // Show assignee in team view
          />
        </>
      )}

      {/* Detail Dialog */}
      <CongViecDetailDialog
        open={detailDialog.open}
        onClose={handleCloseDetail}
        congViecId={detailDialog.congViecId}
      />
    </Container>
  );
};

export default CompletedTasksArchivePage;
