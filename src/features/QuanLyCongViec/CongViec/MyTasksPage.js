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
  Tooltip,
  Badge,
  Drawer,
  Box,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
} from "@mui/icons-material";

// ✅ NEW Components
import StatusGrid from "./components/StatusGrid";
import UrgentAlertBanner from "./components/UrgentAlertBanner";
import RecentCompletedPreview from "./components/RecentCompletedPreview";
import ActiveFilterChips from "./components/ActiveFilterChips"; // ✨ NEW

// Existing components
import CongViecFilterPanel from "./CongViecFilterPanel";
import CongViecTable from "./CongViecTable";
import CongViecDetailDialog from "./CongViecDetailDialog";
import CongViecFormDialog from "./CongViecFormDialog";
import CongViecTreeDialog from "../TreeView/CongViecTreeDialog";
import ConfirmDialog from "components/ConfirmDialog";

// ✅ NEW Hooks
import useMyTasksUrlParams from "./hooks/useMyTasksUrlParams";
import useTaskCounts from "./hooks/useTaskCounts";
import useAuth from "hooks/useAuth";

// Redux actions
import {
  getReceivedCongViecs,
  getRecentCompleted,
  getCongViecDetail,
  deleteCongViec,
  clearState,
} from "./congViecSlice";

/**
 * MyTasksPage - "Công việc tôi nhận" (Individual view)
 *
 * Features (Task 2.5):
 * - Single page: ONLY tasks I received (no "Việc tôi giao")
 * - Status tabs: Tất cả / Đã giao / Đang làm / Chờ duyệt
 * - URL params integration: ?status=DANG_LAM
 * - Deadline warnings: UrgentAlertBanner + badges
 * - Client-side filtering & pagination (Strategy A1/B1)
 * - Recent completed preview (7/30/90 days)
 */
const MyTasksPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // ✅ NEW: URL params hook
  const { status, updateStatus } = useMyTasksUrlParams();

  // Redux selectors
  const {
    receivedCongViecs,
    recentCompleted,
    recentCompletedError,
    isLoading,
    loadingRecentCompleted,
  } = useSelector((state) => state.congViec);

  // Local state
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  // ✅ Filter state (client-side)
  const [filters, setFilters] = useState({
    search: "",
    MaCongViec: "",
    MucDoUuTien: "",
    TinhTrangHan: "",
    VaiTroCuaToi: "", // NGUOI_CHINH | NGUOI_PHOI_HOP | ""
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

  // ✅ NEW: Calculate counts with deadline badges
  const counts = useTaskCounts(receivedCongViecs);

  // ✅ Workmanagement APIs use NhanVienID (NOT User._id)
  const nhanVienId = user?.NhanVienID;

  // ✅ STRATEGY A1: Fetch all active tasks once (max 500)
  useEffect(() => {
    if (!nhanVienId) return;

    // Fetch all tasks (filter HOAN_THANH client-side)
    dispatch(
      getReceivedCongViecs(nhanVienId, {
        limit: 500,
        page: 1,
        // ❌ NO status filter, NO date filter - filter client-side
      })
    );

    // Fetch recent completed (last 7 days)
    dispatch(
      getRecentCompleted({
        nhanVienId,
        limit: 10,
      })
    );
  }, [nhanVienId, dispatch, refreshKey]);

  // ✅ CLIENT-SIDE FILTERING FLOW
  // 1️⃣ Filter by status (from URL)
  const filteredByStatus = useMemo(() => {
    // Always exclude HOAN_THANH from active task list
    const activeTasks = (receivedCongViecs || []).filter(
      (task) => task.TrangThai !== "HOAN_THANH"
    );

    if (status === "ALL") return activeTasks;
    return activeTasks.filter((task) => task.TrangThai === status);
  }, [receivedCongViecs, status]);

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

  // 2e️⃣ Filter by role (Vai trò của tôi)
  const filteredByRole = useMemo(() => {
    if (!filters.VaiTroCuaToi) return filteredByDate;

    return filteredByDate.filter((task) => {
      if (filters.VaiTroCuaToi === "NGUOI_CHINH") {
        return String(task.NguoiChinhID) === String(nhanVienId);
      }
      if (filters.VaiTroCuaToi === "NGUOI_PHOI_HOP") {
        // NguoiThamGia chứa cả CHINH và PHOI_HOP, phải check VaiTro
        return task.NguoiThamGia?.some(
          (nt) =>
            String(nt.NhanVienID) === String(nhanVienId) &&
            nt.VaiTro === "PHOI_HOP"
        );
      }
      return true;
    });
  }, [filteredByDate, filters.VaiTroCuaToi, nhanVienId]);

  // 3️⃣ Filter by urgent (when UrgentAlertBanner clicked)
  const filteredByUrgent = useMemo(() => {
    if (!showUrgentOnly) return filteredByRole;
    return filteredByRole.filter(
      (task) =>
        task.TinhTrangThoiHan === "QUA_HAN" ||
        task.TinhTrangThoiHan === "SAP_QUA_HAN"
    );
  }, [filteredByRole, showUrgentOnly]);

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
      VaiTroCuaToi: "",
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
    navigate("/quanlycongviec/lich-su");
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
            Công việc tôi nhận
          </Typography>
          {receivedCongViecs && (
            <Chip
              label={receivedCongViecs.length}
              size="small"
              color="primary"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={1}>
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

      {/* 3️⃣ STATUS GRID - OVERVIEW CARDS */}
      <StatusGrid
        status={status}
        onStatusChange={updateStatus}
        counts={counts}
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
            excludeFields={["TrangThai", "NguoiChinhID"]}
            collapsible={false}
            defaultCollapsed={false}
            isLoading={isLoading}
            forceOneColumn={true}
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
        activeTab="received"
        currentUserRole={user?.PhanQuyen}
        currentUserNhanVienId={nhanVienId}
        isLoading={isLoading}
      />

      {/* 6️⃣ RECENT COMPLETED PREVIEW - WITH DATE FILTER */}
      <RecentCompletedPreview
        recentTasks={recentCompleted}
        onViewAll={handleViewAllHistory}
        onViewTask={handleOpenDetail}
        loading={loadingRecentCompleted}
        error={recentCompletedError}
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
    </Container>
  );
};

export default MyTasksPage;
