import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  Button,
  Stack,
  Alert,
  useMediaQuery,
  useTheme,
  Chip,
  IconButton,
  Badge,
  Drawer,
  Box,
  Fab,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Add as AddIcon,
} from "@mui/icons-material";

// ✅ Reuse components from Task 2.5
import StatusGrid from "./components/StatusGrid";
import UrgentAlertBanner from "./components/UrgentAlertBanner";
import RecentCompletedPreview from "./components/RecentCompletedPreview";
import ActiveFilterChips from "./components/ActiveFilterChips";

// Existing components
import CongViecFilterPanel from "./CongViecFilterPanel";
import CongViecTable from "./CongViecTable";
import CongViecDetailDialog from "./CongViecDetailDialog";
import CongViecFormDialog from "./CongViecFormDialog";
import CongViecTreeDialog from "../TreeView/CongViecTreeDialog";
import ConfirmDialog from "components/ConfirmDialog";

// ✅ Manager view specific hooks
import useAssignedTasksUrlParams from "./hooks/useAssignedTasksUrlParams";
import useAssignedTaskCounts from "./hooks/useAssignedTaskCounts";
import useAuth from "hooks/useAuth";

// Redux actions
import {
  getAssignedCongViecs,
  getRecentCompletedAssigned,
  getCongViecDetail,
  deleteCongViec,
  clearState,
} from "./congViecSlice";

// ✅ KPI slice for assignee filter data
import { getNhanVienCoTheGiaoViec } from "../KPI/kpiSlice";

/**
 * AssignedTasksPage - "Việc tôi giao" (Manager view)
 *
 * Features (Task 2.6):
 * - Manager view: ONLY tasks I assigned (NguoiGiao = me)
 * - 5 Status tabs: Tất cả / Chưa giao / Đã giao / Đang làm / Chờ tôi duyệt / Hoàn thành
 * - URL params integration: ?status=TAO_MOI
 * - Deadline warnings: UrgentAlertBanner + badges
 * - Client-side filtering & pagination (reuse Strategy A1/B1)
 * - Recent completed preview (30 days)
 * - Progress bar + Participants in cards
 * - Tree view action available
 */
const AssignedTasksPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ Manager view: URL params hook for 5 statuses
  const { status, updateStatus } = useAssignedTasksUrlParams();

  // Redux selectors
  const {
    assignedCongViecs,
    recentCompletedAssigned,
    recentCompletedAssignedError,
    isLoading,
    loadingRecentCompletedAssigned,
  } = useSelector((state) => state.congViec);

  // ✅ Get employee list for "Người xử lý" filter (from kpiSlice)
  const { nhanVienDuocQuanLy } = useSelector((state) => state.kpi);

  // Local state
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // ✅ Manager view specific filters
  const [filters, setFilters] = useState({
    search: "",
    MaCongViec: "",
    MucDoUuTien: "",
    TinhTrangHan: "",
    NguoiChinhID: "", // Filter by assignee (người xử lý)
    NgayBatDau: null,
    NgayHetHan: null,
  });

  // Dialog states
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    congViecId: null,
  });
  const [formDialog, setFormDialog] = useState({
    open: false,
    isEdit: false,
    congViec: null,
  });
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    congViec: null,
    loading: false,
  });
  const [treeDialog, setTreeDialog] = useState({ open: false, congViec: null });

  // ✅ Calculate counts with 5-status logic
  const counts = useAssignedTaskCounts(assignedCongViecs);

  // ✅ Workmanagement APIs use NhanVienID (NOT User._id)
  const nhanVienId = user?.NhanVienID;

  // ✅ Fetch assignee list once (for filter dropdown)
  useEffect(() => {
    if (!nhanVienId) return;
    dispatch(getNhanVienCoTheGiaoViec(nhanVienId));
  }, [nhanVienId, dispatch]);

  // ✅ STRATEGY A1: Fetch all assigned tasks once (max 500)
  useEffect(() => {
    if (!nhanVienId) return;

    // Fetch all tasks assigned by me
    dispatch(
      getAssignedCongViecs(nhanVienId, {
        limit: 500,
        page: 1,
      })
    );

    // Fetch recent completed (last 30 days)
    dispatch(
      getRecentCompletedAssigned({
        nhanVienId,
        limit: 30, // 30 items for client pagination
      })
    );
  }, [nhanVienId, dispatch, refreshKey]);

  // ✅ CLIENT-SIDE FILTERING FLOW
  // 1️⃣ Filter by status (from URL) - 5 tabs vs 4 tabs
  const filteredByStatus = useMemo(() => {
    if (status === "ALL") {
      // ALL = exclude HOAN_THANH (only active tasks)
      return (assignedCongViecs || []).filter(
        (task) => task.TrangThai !== "HOAN_THANH"
      );
    }
    return (assignedCongViecs || []).filter(
      (task) => task.TrangThai === status
    );
  }, [assignedCongViecs, status]);

  // 2️⃣ Filter by search (TieuDe only)
  const filteredBySearch = useMemo(() => {
    if (!filters.search || filters.search.trim() === "") {
      return filteredByStatus;
    }
    const searchLower = filters.search.toLowerCase();
    return filteredByStatus.filter(
      (task) => task.TieuDe && task.TieuDe.toLowerCase().includes(searchLower)
    );
  }, [filteredByStatus, filters.search]);

  // 2a️⃣ Filter by MaCongViec (separate field)
  const filteredByMaCongViec = useMemo(() => {
    if (!filters.MaCongViec || filters.MaCongViec.trim() === "") {
      return filteredBySearch;
    }
    const maLower = filters.MaCongViec.toLowerCase();
    return filteredBySearch.filter(
      (task) =>
        task.MaCongViec && task.MaCongViec.toLowerCase().includes(maLower)
    );
  }, [filteredBySearch, filters.MaCongViec]);

  // 2b️⃣ Filter by priority
  const filteredByPriority = useMemo(() => {
    if (!filters.MucDoUuTien) return filteredByMaCongViec;
    return filteredByMaCongViec.filter(
      (task) => task.MucDoUuTien === filters.MucDoUuTien
    );
  }, [filteredByMaCongViec, filters.MucDoUuTien]);

  // 2c️⃣ Filter by deadline status (TinhTrangHan)
  const filteredByDeadline = useMemo(() => {
    if (!filters.TinhTrangHan) return filteredByPriority;
    return filteredByPriority.filter(
      (task) => task.TinhTrangThoiHan === filters.TinhTrangHan
    );
  }, [filteredByPriority, filters.TinhTrangHan]);

  // 2d️⃣ Filter by date range
  const filteredByDate = useMemo(() => {
    let result = filteredByDeadline;

    if (filters.NgayBatDau) {
      const startDate = new Date(filters.NgayBatDau);
      result = result.filter((task) => {
        const taskDate = task.NgayBatDau ? new Date(task.NgayBatDau) : null;
        return taskDate && taskDate >= startDate;
      });
    }

    if (filters.NgayHetHan) {
      const endDate = new Date(filters.NgayHetHan);
      result = result.filter((task) => {
        const taskDate = task.NgayHetHan ? new Date(task.NgayHetHan) : null;
        return taskDate && taskDate <= endDate;
      });
    }

    return result;
  }, [filteredByDeadline, filters.NgayBatDau, filters.NgayHetHan]);

  // 2e️⃣ Filter by assignee (Người xử lý) - MANAGER VIEW SPECIFIC
  const filteredByAssignee = useMemo(() => {
    if (!filters.NguoiChinhID) return filteredByDate;
    return filteredByDate.filter(
      (task) => String(task.NguoiChinhID) === String(filters.NguoiChinhID)
    );
  }, [filteredByDate, filters.NguoiChinhID]);

  // 3️⃣ Filter by urgent (when UrgentAlertBanner clicked)
  const filteredByUrgent = useMemo(() => {
    if (!showUrgentOnly) return filteredByAssignee;
    return filteredByAssignee.filter(
      (task) =>
        task.TinhTrangThoiHan === "QUA_HAN" ||
        task.TinhTrangThoiHan === "SAP_QUA_HAN"
    );
  }, [filteredByAssignee, showUrgentOnly]);

  // 4️⃣ CLIENT-SIDE PAGINATION (Strategy B1)
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredByUrgent.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredByUrgent, currentPage, rowsPerPage]);

  // Event handlers
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1); // Reset to first page
  };

  // ✅ Filter handlers
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({
      search: "",
      MaCongViec: "",
      MucDoUuTien: "",
      TinhTrangHan: "",
      NguoiChinhID: "",
      NgayBatDau: null,
      NgayHetHan: null,
    });
    setShowUrgentOnly(false);
    setCurrentPage(1);
  };

  const handleViewUrgent = () => {
    setShowUrgentOnly(true);
    setCurrentPage(1);
  };

  const handleOpenDetail = (congViecId) => {
    setDetailDialog({ open: true, congViecId });
    dispatch(getCongViecDetail(congViecId));
  };

  const handleOpenForm = (congViec = null) => {
    setFormDialog({
      open: true,
      isEdit: !!congViec,
      congViec,
    });
  };

  const handleOpenTree = (congViec) => {
    setTreeDialog({ open: true, congViec });
  };

  const handleDeleteClick = (congViec) => {
    setConfirmDialog({ open: true, congViec, loading: false });
  };

  const handleDeleteConfirm = async () => {
    const { congViec } = confirmDialog;
    if (!congViec) return;

    setConfirmDialog((prev) => ({ ...prev, loading: true }));

    try {
      await dispatch(deleteCongViec(congViec._id));
      setConfirmDialog({ open: false, congViec: null, loading: false });
      handleRefresh();
    } catch (error) {
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleFormSuccess = () => {
    setFormDialog({ open: false, isEdit: false, congViec: null });
    handleRefresh();
  };

  const handleViewAllHistory = () => {
    navigate("/quanlycongviec/lich-su-giao-viec");
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(clearState());
    };
  }, [dispatch]);

  // ✅ Placeholder when user has no linked employee (NhanVien)
  if (user && !nhanVienId) {
    return (
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <Stack
          sx={{ minHeight: "60vh" }}
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <Alert severity="warning" sx={{ maxWidth: 640, width: "100%" }}>
            Chưa có nhân viên (NhanVienID) gắn với tài khoản. Vui lòng liên hệ
            quản trị để cấu hình.
          </Alert>
        </Stack>
      </Container>
    );
  }

  return (
    <Container
      maxWidth={false}
      disableGutters
      sx={{ py: 0, px: { xs: 0, sm: 0 } }}
    >
      {/* 1️⃣ URGENT ALERT BANNER - VISIBLE IMMEDIATELY */}
      {counts &&
        (counts.deadlineStatus.overdue > 0 ||
          counts.deadlineStatus.upcoming > 0) && (
          <UrgentAlertBanner
            overdueCount={counts.deadlineStatus.overdue}
            upcomingCount={counts.deadlineStatus.upcoming}
            onViewClick={handleViewUrgent}
            onDismiss={() => {
              // Banner will handle localStorage
            }}
            userId={user?._id}
          />
        )}

      {/* 2️⃣ PAGE HEADER - RESPONSIVE */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={600}>
            Việc tôi giao
          </Typography>
          {assignedCongViecs && (
            <Chip
              label={assignedCongViecs.length}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
          {/* Desktop only: Tạo mới button */}
          {!isMobile && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleOpenForm()}
            >
              + Tạo mới
            </Button>
          )}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setFilterDrawerOpen(true)}
            size={isMobile ? "small" : "medium"}
            startIcon={
              <Badge
                badgeContent={
                  Object.values(filters).filter((v) =>
                    v !== "" && v !== null ? true : false
                  ).length
                }
                color="error"
              >
                <FilterListIcon />
              </Badge>
            }
          >
            Lọc
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleRefresh}
            disabled={isLoading}
            size={isMobile ? "small" : "medium"}
            startIcon={<RefreshIcon />}
          >
            Làm mới
          </Button>
        </Stack>
      </Stack>

      {/* 3️⃣ STATUS GRID - 5 CARDS OVERVIEW */}
      <StatusGrid
        status={status}
        onStatusChange={updateStatus}
        counts={counts}
        variant="manager" // ✅ Trigger 5-card layout
      />

      {/* 3.5️⃣ ACTIVE FILTER CHIPS - ✨ UX ADDITION (Hidden on mobile) */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>
        <ActiveFilterChips
          filters={filters}
          onRemoveFilter={(key) => {
            const newFilters = { ...filters };
            if (key === "NgayBatDau" || key === "NgayHetHan") {
              newFilters[key] = null;
            } else {
              newFilters[key] = "";
            }
            setFilters(newFilters);
            setCurrentPage(1);
          }}
          excludeFields={["TrangThai"]} // Status shown in tabs
        />
      </Box>

      {/* 4️⃣ FILTER DRAWER - HIDDEN BY DEFAULT */}
      <Drawer
        anchor="right"
        open={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "85%", sm: 360 },
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}
        >
          <Typography variant="h6" fontWeight={600}>
            Bộ lọc
          </Typography>
          <IconButton size="small" onClick={() => setFilterDrawerOpen(false)}>
            <Typography variant="h6" color="text.secondary">
              ×
            </Typography>
          </IconButton>
        </Stack>

        {/* Filter Content - Scrollable */}
        <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
          <CongViecFilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            excludeFields={["TrangThai", "VaiTroCuaToi"]} // Manager view doesn't need role filter
            collapsible={false}
            defaultCollapsed={false}
            isLoading={isLoading}
            forceOneColumn={true}
            managedEmployees={nhanVienDuocQuanLy || []} // ✅ Assignee dropdown data
            customTinhTrangHanOptions={[
              { value: "", label: "Tất cả tình trạng hạn" },
              { value: "DUNG_HAN", label: "Đúng hạn" },
              { value: "SAP_QUA_HAN", label: "Sắp quá hạn" },
              { value: "QUA_HAN", label: "Quá hạn" },
            ]}
          />
        </Box>

        {/* Footer - Sticky Apply Button */}
        <Stack
          spacing={1.5}
          sx={{
            p: 2,
            borderTop: 1,
            borderColor: "divider",
            backgroundColor: "background.paper",
          }}
        >
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              setCurrentPage(1);
              setFilterDrawerOpen(false);
            }}
            startIcon={<FilterListIcon />}
          >
            Tìm theo điều kiện
          </Button>
          <Button
            variant="text"
            fullWidth
            size="small"
            onClick={() => {
              handleResetFilters();
              setFilterDrawerOpen(false);
            }}
          >
            Xóa bộ lọc
          </Button>
        </Stack>
      </Drawer>

      {/* 5️⃣ TASK TABLE */}
      <CongViecTable
        congViecs={paginatedData}
        totalItems={filteredByUrgent.length}
        currentPage={currentPage}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onView={handleOpenDetail}
        onEdit={handleOpenForm}
        onDelete={handleDeleteClick}
        onTree={handleOpenTree}
        activeTab="assigned" // ✅ Manager view identifier
        currentUserRole={user?.PhanQuyen}
        currentUserNhanVienId={nhanVienId}
        isLoading={isLoading}
        showProgress={true} // ✅ Enable progress bar in cards
        showParticipants={true} // ✅ Enable participants count in cards
        showAssignee={true} // ✅ Show assignee instead of assignor in cards
      />

      {/* 6️⃣ RECENT COMPLETED PREVIEW - 30 DAYS */}
      <RecentCompletedPreview
        recentTasks={recentCompletedAssigned}
        onViewAll={handleViewAllHistory}
        onViewTask={handleOpenDetail}
        loading={loadingRecentCompletedAssigned}
        error={recentCompletedAssignedError}
        title="Hoàn thành gần đây (30 ngày)" // ✅ Custom title
      />

      {/* 7️⃣ DIALOGS */}
      <CongViecDetailDialog
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, congViecId: null })}
        congViecId={detailDialog.congViecId}
      />

      <CongViecFormDialog
        open={formDialog.open}
        onClose={() =>
          setFormDialog({ open: false, isEdit: false, congViec: null })
        }
        isEdit={formDialog.isEdit}
        congViec={formDialog.congViec}
        onSuccess={handleFormSuccess}
      />

      <CongViecTreeDialog
        open={treeDialog.open}
        onClose={() => setTreeDialog({ open: false, congViec: null })}
        congViec={treeDialog.congViec}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() =>
          !confirmDialog.loading &&
          setConfirmDialog({ open: false, congViec: null, loading: false })
        }
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        message={`Bạn có chắc chắn muốn xóa công việc "${confirmDialog.congViec?.TenCongViec}"?`}
        loading={confirmDialog.loading}
      />

      {/* 🎯 FAB - Mobile only: Native app feel */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenForm()}
          sx={{
            position: "fixed",
            bottom: 80,
            right: 16,
            zIndex: 1000,
          }}
        >
          <AddIcon />
        </Fab>
      )}
    </Container>
  );
};

export default AssignedTasksPage;
