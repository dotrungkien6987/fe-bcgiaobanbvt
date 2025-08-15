import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Alert,
  Button,
  Stack,
  Divider,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
} from "@mui/icons-material";

import CongViecTabs from "./CongViecTabs";
import CongViecFilterPanel from "./CongViecFilterPanel";
import CongViecTable from "./CongViecTable";
import CongViecDetailDialog from "./CongViecDetailDialog";
import CongViecFormDialog from "./CongViecFormDialog";

import {
  getReceivedCongViecs,
  getAssignedCongViecs,
  getCongViecDetail,
  setActiveTab,
  setCurrentPage,
  setFilters,
  clearState,
} from "./congViecSlice";

// Import thêm cho quản lý nhân viên
import {
  getManagementInfo,
  clearState as clearNhanVienState,
} from "../NhanVien/nhanvienManagementSlice";

const CongViecByNhanVienPage = () => {
  const dispatch = useDispatch();
  const { nhanVienId } = useParams();

  const {
    receivedCongViecs,
    assignedCongViecs,
    receivedTotal,
    assignedTotal,
    receivedPages,
    assignedPages,
    currentPage,
    activeTab,
    filters: allFilters,
    isLoading,
    error,
  } = useSelector((state) => state.congViec);

  // Selector cho quản lý nhân viên
  const {
    currentManager,
    managedEmployees,
    totalManagedEmployees,
    isLoading: isLoadingNhanVien,
    error: errorNhanVien,
  } = useSelector((state) => state.nhanvienManagement);

  const [refreshKey, setRefreshKey] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Step 2: Dialog states
  const [detailDialog, setDetailDialog] = useState({
    open: false,
    congViecId: null,
  });
  const [formDialog, setFormDialog] = useState({
    open: false,
    isEdit: false,
    congViec: null,
  });

  // Get current filters based on active tab
  const receivedFilters = allFilters.received;
  const assignedFilters = allFilters.assigned;

  // Load data based on active tab
  const loadData = React.useCallback(() => {
    if (!nhanVienId) return;

    if (activeTab === "received") {
      dispatch(
        getReceivedCongViecs(nhanVienId, {
          page: currentPage,
          limit: rowsPerPage,
          ...receivedFilters,
        })
      );
    } else {
      dispatch(
        getAssignedCongViecs(nhanVienId, {
          page: currentPage,
          limit: rowsPerPage,
          ...assignedFilters,
        })
      );
    }
  }, [
    nhanVienId,
    activeTab,
    currentPage,
    rowsPerPage,
    receivedFilters,
    assignedFilters,
    dispatch,
  ]);

  // Initialize component
  useEffect(() => {
    if (!nhanVienId) {
      console.error("Missing nhanVienId parameter");
      return;
    }

    // Clear state when component mounts or nhanVienId changes
    dispatch(clearState());
    dispatch(clearNhanVienState());

    // Load thông tin quản lý nhân viên
    dispatch(getManagementInfo(nhanVienId));

    // Load initial data: fetch both received and assigned lists up front
    // so user can see both immediately without switching tabs.
    const receivedPage = currentPage?.received || 1;
    const assignedPage = currentPage?.assigned || 1;

    dispatch(
      getReceivedCongViecs(nhanVienId, {
        page: receivedPage,
        limit: rowsPerPage,
        ...receivedFilters,
      })
    );

    dispatch(
      getAssignedCongViecs(nhanVienId, {
        page: assignedPage,
        limit: rowsPerPage,
        ...assignedFilters,
      })
    );
  }, [
    nhanVienId,
    dispatch,
    currentPage,
    rowsPerPage,
    receivedFilters,
    assignedFilters,
  ]);

  // Reload data when dependencies change
  useEffect(() => {
    loadData();
  }, [loadData, refreshKey]);

  // Get current data based on active tab
  const getCurrentData = () => {
    const isReceived = activeTab === "received";
    return {
      congViecs: isReceived ? receivedCongViecs : assignedCongViecs,
      totalItems: isReceived ? receivedTotal : assignedTotal,
      totalPages: isReceived ? receivedPages : assignedPages,
      filters: isReceived ? receivedFilters : assignedFilters,
      currentPageNumber: isReceived
        ? currentPage.received
        : currentPage.assigned,
    };
  };

  // Event handlers
  const handleTabChange = (newTab) => {
    dispatch(setActiveTab(newTab));
    dispatch(setCurrentPage({ tab: newTab, page: 1 })); // Reset to first page when changing tabs
  };

  const handlePageChange = (newPage) => {
    dispatch(setCurrentPage({ tab: activeTab, page: newPage }));
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    dispatch(setCurrentPage({ tab: activeTab, page: 1 })); // Reset to first page when changing page size
  };

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters({ tab: activeTab, filters: newFilters }));
  };

  // Step 2: Dialog handlers
  const handleViewDetail = (congViecId) => {
    setDetailDialog({
      open: true,
      congViecId,
    });
    dispatch(getCongViecDetail(congViecId));
  };

  const handleCloseDetail = () => {
    setDetailDialog({
      open: false,
      congViecId: null,
    });
  };

  const handleCreateNew = () => {
    setFormDialog({
      open: true,
      isEdit: false,
      congViec: null,
    });
  };

  const handleEdit = (congViec) => {
    setFormDialog({
      open: true,
      isEdit: true,
      congViec,
    });
  };

  const handleCloseForm = () => {
    setFormDialog({
      open: false,
      isEdit: false,
      congViec: null,
    });
    // Reload data after form closes
    setRefreshKey((prev) => prev + 1);
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleDelete = (congViecId) => {
    // TODO: Implement delete functionality with confirmation dialog
    console.log("Delete:", congViecId);
  };

  return (
    <Box>
      {/* Page Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Box>
            <Typography variant="h4" component="h1">
              Quản lý công việc theo nhân viên
            </Typography>
            {currentManager && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Quản lý: <strong>{currentManager.Ten}</strong> -{" "}
                {currentManager.KhoaID?.TenKhoa}
                {totalManagedEmployees > 0 && (
                  <Chip
                    label={`${totalManagedEmployees} nhân viên được quản lý`}
                    size="small"
                    sx={{ ml: 1 }}
                    color="primary"
                  />
                )}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={handleRefresh}
              disabled={isLoading || isLoadingNhanVien}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateNew}
              disabled={totalManagedEmployees === 0}
            >
              Tạo công việc mới
            </Button>
          </Stack>
        </Stack>

        <Typography variant="body2" color="text.secondary">
          Quản lý và theo dõi các công việc được giao và được phân công
          {totalManagedEmployees === 0 && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              Nhân viên này chưa được phân quyền quản lý nhân viên nào. Vui lòng
              liên hệ quản trị viên để thiết lập quyền quản lý.
            </Alert>
          )}
        </Typography>
      </Paper>

      {/* Error Display */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {errorNhanVien && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Lỗi tải thông tin nhân viên: {errorNhanVien}
        </Alert>
      )}

      {/* Main Content */}
      <Paper>
        {/* Tabs */}
        <Box sx={{ p: 3, pb: 0 }}>
          <CongViecTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            receivedCount={receivedTotal}
            assignedCount={assignedTotal}
          />
        </Box>

        <Divider />

        {/* Filters */}
        <Box sx={{ p: 3, pb: 2 }}>
          <CongViecFilterPanel
            filters={getCurrentData().filters}
            onFilterChange={handleFilterChange}
            activeTab={activeTab}
          />
        </Box>

        <Divider />

        {/* Table */}
        <Box sx={{ p: 0 }}>
          <CongViecTable
            congViecs={getCurrentData().congViecs}
            totalItems={getCurrentData().totalItems}
            currentPage={getCurrentData().currentPageNumber}
            totalPages={getCurrentData().totalPages}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            isLoading={isLoading}
            onView={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            activeTab={activeTab}
          />
        </Box>
      </Paper>

      {/* Step 2: Dialogs */}
      <CongViecDetailDialog
        open={detailDialog.open}
        onClose={handleCloseDetail}
        congViecId={detailDialog.congViecId}
        onEdit={handleEdit}
      />

      <CongViecFormDialog
        open={formDialog.open}
        onClose={handleCloseForm}
        congViec={formDialog.congViec}
        isEdit={formDialog.isEdit}
        nhanVienId={nhanVienId}
      />
    </Box>
  );
};

export default CongViecByNhanVienPage;
