import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useCallback,
} from "react";
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
  Tooltip,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";

import CongViecTabs from "./CongViecTabs";
import CongViecFilterPanel from "./CongViecFilterPanel";
import CongViecTable from "./CongViecTable";
import CongViecDetailDialog from "./CongViecDetailDialog";
import CongViecFormDialog from "./CongViecFormDialog";
import CongViecTreeDialog from "../TreeView/CongViecTreeDialog";
import ConfirmDialog from "components/ConfirmDialog";
import useAuth from "hooks/useAuth";

import {
  getReceivedCongViecs,
  getAssignedCongViecs,
  getCongViecDetail,
  deleteCongViec,
  setActiveTab,
  setCurrentPage,
  setFilters,
  clearState,
  resetFilters,
} from "./congViecSlice";
import { getExtendedDueStatus } from "../../../utils/congViecUtils";
import useDebounce from "hooks/useDebounce";

// Import thêm cho quản lý nhân viên
import {
  getManagementInfo,
  clearState as clearNhanVienState,
} from "../NhanVien/nhanvienManagementSlice";

const CongViecByNhanVienPage = () => {
  const dispatch = useDispatch();
  const { nhanVienId } = useParams();
  const { user } = useAuth();

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
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    congViec: null,
    loading: false,
  });
  const [treeDialog, setTreeDialog] = useState({ open: false, congViec: null });

  // Get current filters based on active tab
  const receivedFilters = allFilters.received;
  const assignedFilters = allFilters.assigned;

  // Track last fetch params để tránh fetch trùng
  const lastParamsRef = useRef(null);
  const buildParamsKey = (tab, page, limit, filters) => {
    // Chỉ lấy các primitive cần thiết để so sánh
    const f = filters || {};
    return JSON.stringify({
      tab,
      page,
      limit,
      search: f.search || "",
      TrangThai: f.TrangThai || "",
      MucDoUuTien: f.MucDoUuTien || "",
      NgayBatDau: f.NgayBatDau || null,
      NgayHetHan: f.NgayHetHan || null,
      MaCongViec: f.MaCongViec || "",
      NguoiChinhID: f.NguoiChinhID || "",
      TinhTrangHan: f.TinhTrangHan || "",
    });
  };

  // Load data based on active tab (server fetch) với guard
  const loadData = useCallback(() => {
    if (!nhanVienId) return;
    const pageParam =
      activeTab === "received"
        ? currentPage?.received || 1
        : currentPage?.assigned || 1;
    const filtersForTab =
      activeTab === "received" ? receivedFilters : assignedFilters;

    const key = buildParamsKey(
      activeTab,
      pageParam,
      rowsPerPage,
      filtersForTab
    );
    if (lastParamsRef.current === key) return; // skip fetch trùng
    lastParamsRef.current = key;

    if (activeTab === "received") {
      dispatch(
        getReceivedCongViecs(nhanVienId, {
          page: pageParam,
          limit: rowsPerPage,
          ...filtersForTab,
        })
      );
    } else {
      dispatch(
        getAssignedCongViecs(nhanVienId, {
          page: pageParam,
          limit: rowsPerPage,
          ...filtersForTab,
        })
      );
    }
  }, [
    nhanVienId,
    activeTab,
    currentPage?.received,
    currentPage?.assigned,
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

  // Memoized current data (reduces repeat computation during render)
  const currentData = useMemo(() => {
    const isReceived = activeTab === "received";
    const rawList = isReceived ? receivedCongViecs : assignedCongViecs;
    const filters = isReceived ? receivedFilters : assignedFilters;
    const serverTotalItems = isReceived ? receivedTotal : assignedTotal;
    const serverTotalPages = isReceived ? receivedPages : assignedPages;
    const currentServerPage = isReceived
      ? currentPage?.received || 1
      : currentPage?.assigned || 1;

    let filtered = rawList;
    let totalItems = serverTotalItems;
    let totalPages = serverTotalPages;
    let effectivePage = currentServerPage;

    // Client-side fallback filter for TinhTrangHan if user selected it
    if (filters?.TinhTrangHan) {
      filtered = (rawList || []).filter(
        (cv) => getExtendedDueStatus(cv) === filters.TinhTrangHan
      );
      totalItems = filtered.length;
      totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
      if (effectivePage > totalPages) effectivePage = totalPages;
      const startIndex = (effectivePage - 1) * rowsPerPage;
      filtered = filtered.slice(startIndex, startIndex + rowsPerPage);
    }

    return {
      congViecs: filtered,
      totalItems,
      totalPages,
      filters,
      currentPageNumber: effectivePage,
    };
  }, [
    activeTab,
    receivedCongViecs,
    assignedCongViecs,
    receivedFilters,
    assignedFilters,
    receivedTotal,
    assignedTotal,
    receivedPages,
    assignedPages,
    currentPage?.received,
    currentPage?.assigned,
    rowsPerPage,
  ]);

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

  // --- Improved filter UX: local state for text inputs + debounce (250ms)
  const [localSearchText, setLocalSearchText] = useState(
    (activeTab === "received"
      ? receivedFilters.search
      : assignedFilters.search) || ""
  );
  const [localMaCongViec, setLocalMaCongViec] = useState(
    (activeTab === "received"
      ? receivedFilters.MaCongViec
      : assignedFilters.MaCongViec) || ""
  );

  // Immediate (non-debounced) controls for selects/date etc
  const [immediateFilters, setImmediateFilters] = useState(() => {
    const f = activeTab === "received" ? receivedFilters : assignedFilters;
    return {
      TrangThai: f.TrangThai || "",
      MucDoUuTien: f.MucDoUuTien || "",
      NgayBatDau: f.NgayBatDau || null,
      NgayHetHan: f.NgayHetHan || null,
      NguoiChinhID: f.NguoiChinhID || "",
      TinhTrangHan: f.TinhTrangHan || "",
    };
  });

  const debouncedSearchText = useDebounce(localSearchText, 250);
  const debouncedMaCongViec = useDebounce(localMaCongViec, 250);

  // Sync local inputs khi đổi tab hoặc filters ở store thực sự đổi
  const prevSyncRef = useRef({ tab: activeTab, search: "", ma: "" });
  useEffect(() => {
    const f = activeTab === "received" ? receivedFilters : assignedFilters;
    const reduxSearch = f.search || "";
    const reduxMa = f.MaCongViec || "";
    const changedTab = prevSyncRef.current.tab !== activeTab;
    const changedSearch = prevSyncRef.current.search !== reduxSearch;
    const changedMa = prevSyncRef.current.ma !== reduxMa;
    if (changedTab || changedSearch) setLocalSearchText(reduxSearch);
    if (changedTab || changedMa) setLocalMaCongViec(reduxMa);
    if (changedTab || changedSearch || changedMa) {
      setImmediateFilters({
        TrangThai: f.TrangThai || "",
        MucDoUuTien: f.MucDoUuTien || "",
        NgayBatDau: f.NgayBatDau || null,
        NgayHetHan: f.NgayHetHan || null,
        NguoiChinhID: f.NguoiChinhID || "",
        TinhTrangHan: f.TinhTrangHan || "",
      });
      prevSyncRef.current = {
        tab: activeTab,
        search: reduxSearch,
        ma: reduxMa,
      };
    }
  }, [activeTab, receivedFilters, assignedFilters]);

  // Apply debounced text filters to Redux
  const firstDebounceSearchRef = useRef(true);
  useEffect(() => {
    const storeSearch =
      activeTab === "received"
        ? receivedFilters?.search || ""
        : assignedFilters?.search || "";
    if (firstDebounceSearchRef.current) {
      firstDebounceSearchRef.current = false; // skip mount
      return;
    }
    if ((debouncedSearchText || "") === storeSearch) return; // no change
    dispatch(
      setFilters({ tab: activeTab, filters: { search: debouncedSearchText } })
    );
    dispatch(setCurrentPage({ tab: activeTab, page: 1 }));
  }, [
    debouncedSearchText,
    activeTab,
    dispatch,
    receivedFilters?.search,
    assignedFilters?.search,
  ]);

  const firstDebounceMaRef = useRef(true);
  useEffect(() => {
    const storeMa =
      activeTab === "received"
        ? receivedFilters?.MaCongViec || ""
        : assignedFilters?.MaCongViec || "";
    if (firstDebounceMaRef.current) {
      firstDebounceMaRef.current = false;
      return;
    }
    if ((debouncedMaCongViec || "") === storeMa) return;
    dispatch(
      setFilters({
        tab: activeTab,
        filters: { MaCongViec: debouncedMaCongViec },
      })
    );
    dispatch(setCurrentPage({ tab: activeTab, page: 1 }));
  }, [
    debouncedMaCongViec,
    activeTab,
    dispatch,
    receivedFilters?.MaCongViec,
    assignedFilters?.MaCongViec,
  ]);

  // Handler accepts a partial filters object from the panel.
  // We treat text fields locally and apply other filters immediately.
  const handleFilterChange = (newFilters) => {
    // newFilters might contain full set or a single field
    if (newFilters.hasOwnProperty("search"))
      setLocalSearchText(newFilters.search || "");
    if (newFilters.hasOwnProperty("MaCongViec"))
      setLocalMaCongViec(newFilters.MaCongViec || "");

    const immediate = { ...newFilters };
    delete immediate.search;
    delete immediate.MaCongViec;
    if (Object.keys(immediate).length > 0) {
      // Only dispatch the fields that actually changed vs current store filters
      const f = activeTab === "received" ? receivedFilters : assignedFilters;
      const changed = {};
      Object.keys(immediate).forEach((k) => {
        const newVal = immediate[k];
        const oldVal = f?.[k] ?? null;
        // normalize undefined/null to empty string for comparison where appropriate
        if ((newVal ?? "") !== (oldVal ?? "")) changed[k] = newVal;
      });
      if (Object.keys(changed).length > 0) {
        setImmediateFilters((p) => ({ ...p, ...changed }));
        dispatch(setFilters({ tab: activeTab, filters: changed })); // reducer đã guard page
      }
    }
  };

  const handleResetFilters = () => {
    setLocalSearchText("");
    setLocalMaCongViec("");
    setImmediateFilters({
      TrangThai: "",
      MucDoUuTien: "",
      NgayBatDau: null,
      NgayHetHan: null,
      NguoiChinhID: "",
      TinhTrangHan: "",
    });
    dispatch(resetFilters(activeTab));
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

  const handleDelete = (congViec) => {
    // Xác định cảnh báo/điều kiện dựa trên trạng thái hiện tại
    const status = congViec?.TrangThai;
    const isLocked = ["DANG_THUC_HIEN", "CHO_DUYET", "HOAN_THANH"].includes(
      status
    );
    const severity = isLocked ? "error" : "warning";
    const details = isLocked
      ? "Công việc đang ở trạng thái quan trọng (Đang thực hiện/Chờ duyệt/Hoàn thành). Vẫn muốn xóa?"
      : "";

    setConfirmDialog({
      open: true,
      congViec,
      loading: false,
      severity,
      details,
    });
  };

  const handleOpenTree = (congViec) => {
    setTreeDialog({ open: true, congViec });
  };
  const handleCloseTree = () => setTreeDialog({ open: false, congViec: null });

  const handleConfirmDelete = async () => {
    const target = confirmDialog.congViec;
    if (!target?._id) {
      setConfirmDialog({ open: false, congViec: null, loading: false });
      return;
    }
    try {
      setConfirmDialog((s) => ({ ...s, loading: true }));
      await dispatch(deleteCongViec(target._id));
      setConfirmDialog({ open: false, congViec: null, loading: false });
      // Refresh current tab data
      setRefreshKey((prev) => prev + 1);
    } catch (e) {
      setConfirmDialog({ open: false, congViec: null, loading: false });
    }
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
            {totalManagedEmployees === 0 ? (
              <Tooltip title="Bạn chưa được phân quyền quản lý nhân viên nên không thể tạo công việc mới.">
                <span>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleCreateNew}
                    disabled
                  >
                    Tạo công việc mới
                  </Button>
                </span>
              </Tooltip>
            ) : (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateNew}
              >
                Tạo công việc mới
              </Button>
            )}
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
            filters={useMemo(
              () => ({
                ...immediateFilters,
                search: localSearchText,
                MaCongViec: localMaCongViec,
              }),
              [immediateFilters, localSearchText, localMaCongViec]
            )}
            searchValue={localSearchText}
            maCongViecValue={localMaCongViec}
            immediateFilters={immediateFilters}
            onFilterChange={(field, value) =>
              handleFilterChange({ [field]: value })
            }
            activeTab={activeTab}
            managedEmployees={managedEmployees || []}
            onResetFilters={handleResetFilters}
          />
        </Box>

        <Divider />

        {/* Table */}
        <Box sx={{ p: 0 }}>
          <CongViecTable
            congViecs={currentData.congViecs}
            totalItems={currentData.totalItems}
            currentPage={currentData.currentPageNumber}
            totalPages={currentData.totalPages}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
            rowsPerPage={rowsPerPage}
            isLoading={isLoading}
            onView={handleViewDetail}
            onEdit={handleEdit}
            onDelete={handleDelete}
            activeTab={activeTab}
            currentUserRole={user?.PhanQuyen}
            currentUserNhanVienId={user?.NhanVienID}
            onTree={handleOpenTree}
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

      {/* Confirm delete */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() =>
          setConfirmDialog({ open: false, congViec: null, loading: false })
        }
        onConfirm={handleConfirmDelete}
        title="Xóa công việc"
        message={`Bạn có chắc muốn xóa công việc: "${
          confirmDialog.congViec?.TieuDe || ""
        }"?`}
        details={confirmDialog.details}
        confirmText="Xóa"
        cancelText="Hủy"
        confirmColor="error"
        severity={confirmDialog.severity || "warning"}
        loading={confirmDialog.loading}
      />

      <CongViecTreeDialog
        open={treeDialog.open}
        onClose={handleCloseTree}
        congViec={treeDialog.congViec}
        keepCache
        enableViewDetail
      />
    </Box>
  );
};

export default CongViecByNhanVienPage;
