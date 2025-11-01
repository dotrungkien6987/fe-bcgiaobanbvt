import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  Stack,
  Button,
  Typography,
  Box,
  Alert,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  Assessment as AssessmentIcon,
} from "@mui/icons-material";

import MainCard from "components/MainCard";
import DanhGiaKPITable from "../components/DanhGiaKPITable";
import DanhGiaKPIFormDialog from "../components/DanhGiaKPIFormDialog";
import DanhGiaKPIDetailDialog from "../components/DanhGiaKPIDetailDialog";
import { SelectNhanVienButton } from "../components/SelectNhanVien";
import useAuth from "hooks/useAuth";

import {
  getDanhGiaKPIs,
  getChuKyDanhGias,
  getTieuChiDanhGias,
  setFilterChuKyID,
  setFilterTrangThai,
  openFormDialog,
  closeFormDialog,
  closeDetailDialog,
} from "../kpiSlice";
import { getAllNhiemVuThuongQuy } from "features/QuanLyCongViec/NhiemVuThuongQuy/nhiemvuThuongQuySlice";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

/**
 * DanhGiaKPIPage - Trang chấm điểm KPI cho Manager
 *
 * Chức năng:
 * - Xem danh sách đánh giá KPI theo chu kỳ
 * - Tạo mới đánh giá KPI cho nhân viên
 * - Chấm điểm nhiệm vụ thường quy
 * - Duyệt/hủy duyệt đánh giá KPI
 * - Lọc theo chu kỳ, trạng thái
 */
function DanhGiaKPIPage() {
  const dispatch = useDispatch();

  const {
    danhGiaKPIs,
    chuKyDanhGias,
    tieuChiDanhGias,
    isLoading,
    error,
    isOpenFormDialog,
    isOpenDetailDialog,
    filterChuKyID,
    filterNhanVienID,
    filterTrangThai,
  } = useSelector((state) => state.kpi);

  const { nhanviens } = useSelector((state) => state.nhanvien);
  const { nhiemVuThuongQuys } = useSelector((state) => state.nhiemvuThuongQuy);

  // ✅ CORRECT: Use useAuth() hook as per best practice
  const { user: currentUser } = useAuth();

  const [selectedChuKy, setSelectedChuKy] = useState("");
  const [selectedTrangThai, setSelectedTrangThai] = useState("");

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      // Load chu kỳ đánh giá (chỉ lấy CHO_BAT_DAU và DANG_DIEN_RA)
      await dispatch(getChuKyDanhGias({ TrangThai: "DANG_DIEN_RA" }));

      // Load tiêu chí đánh giá
      await dispatch(getTieuChiDanhGias());

      // Load nhiệm vụ thường quy
      await dispatch(getAllNhiemVuThuongQuy());

      // Load nhân viên
      if (nhanviens.length === 0) {
        await dispatch(getAllNhanVien());
      }
    };

    loadInitialData();
  }, [dispatch, nhanviens.length]);

  // Load danh sách KPI khi filter thay đổi
  useEffect(() => {
    const filters = {};
    if (filterChuKyID) filters.ChuKyDanhGiaID = filterChuKyID;
    if (filterNhanVienID) filters.NhanVienID = filterNhanVienID;
    if (filterTrangThai) filters.TrangThai = filterTrangThai;

    dispatch(getDanhGiaKPIs(filters));
  }, [dispatch, filterChuKyID, filterNhanVienID, filterTrangThai]);

  const handleChuKyChange = (event) => {
    const chuKyId = event.target.value;
    setSelectedChuKy(chuKyId);
    dispatch(setFilterChuKyID(chuKyId || null));
  };

  const handleTrangThaiChange = (event) => {
    const trangThai = event.target.value;
    setSelectedTrangThai(trangThai);
    dispatch(setFilterTrangThai(trangThai || null));
  };

  const handleRefresh = () => {
    const filters = {};
    if (filterChuKyID) filters.ChuKyDanhGiaID = filterChuKyID;
    if (filterNhanVienID) filters.NhanVienID = filterNhanVienID;
    if (filterTrangThai) filters.TrangThai = filterTrangThai;
    dispatch(getDanhGiaKPIs(filters));
  };

  const handleCreateNew = () => {
    dispatch(openFormDialog("create"));
  };

  const handleCloseFormDialog = () => {
    dispatch(closeFormDialog());
  };

  const handleCloseDetailDialog = () => {
    dispatch(closeDetailDialog());
  };

  // Filter chu kỳ đang diễn ra
  const chuKyDangDienRa = chuKyDanhGias.filter(
    (ck) => ck.TrangThai === "DANG_DIEN_RA" || ck.TrangThai === "CHO_BAT_DAU"
  );

  // Check if current user can create KPI (Manager hoặc Admin)
  // ✅ FIXED: Use PhanQuyen from User model
  const canCreateKPI =
    currentUser?.PhanQuyen === "manager" ||
    currentUser?.PhanQuyen === "admin" ||
    currentUser?.PhanQuyen === "daotao";

  return (
    <MainCard>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <AssessmentIcon sx={{ fontSize: 32, color: "primary.main" }} />
              <Typography variant="h4">Đánh Giá KPI</Typography>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
                disabled={isLoading}
              >
                Làm mới
              </Button>
              {canCreateKPI && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateNew}
                  disabled={isLoading || chuKyDangDienRa.length === 0}
                >
                  Tạo đánh giá KPI
                </Button>
              )}
            </Stack>
          </Stack>
        </Grid>

        {/* Warning if no active cycle */}
        {chuKyDangDienRa.length === 0 && (
          <Grid item xs={12}>
            <Alert severity="warning">
              <strong>Không có chu kỳ đánh giá nào đang diễn ra.</strong>
              <br />
              Vui lòng tạo chu kỳ đánh giá mới hoặc bắt đầu chu kỳ hiện có để có
              thể tạo đánh giá KPI.
            </Alert>
          </Grid>
        )}

        {/* Error Alert */}
        {error && (
          <Grid item xs={12}>
            <Alert
              severity="error"
              onClose={() => dispatch({ type: "kpi/clearError" })}
            >
              <strong>Lỗi:</strong> {error}
            </Alert>
          </Grid>
        )}

        {/* Filters */}
        <Grid item xs={12}>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
          >
            {/* Chu kỳ Filter */}
            <FormControl sx={{ minWidth: 250 }}>
              <InputLabel>Chu kỳ đánh giá</InputLabel>
              <Select
                value={selectedChuKy}
                label="Chu kỳ đánh giá"
                onChange={handleChuKyChange}
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                {chuKyDanhGias.map((chuKy) => (
                  <MenuItem key={chuKy._id} value={chuKy._id}>
                    {chuKy.TenChuKy}{" "}
                    <Chip
                      label={chuKy.TrangThai}
                      size="small"
                      color={
                        chuKy.TrangThai === "DANG_DIEN_RA"
                          ? "success"
                          : chuKy.TrangThai === "CHO_BAT_DAU"
                          ? "warning"
                          : "default"
                      }
                      sx={{ ml: 1 }}
                    />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Nhân viên Filter */}
            <SelectNhanVienButton />

            {/* Trạng thái Filter */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={selectedTrangThai}
                label="Trạng thái"
                onChange={handleTrangThaiChange}
              >
                <MenuItem value="">
                  <em>Tất cả</em>
                </MenuItem>
                <MenuItem value="CHUA_DUYET">Chưa duyệt</MenuItem>
                <MenuItem value="DA_DUYET">Đã duyệt</MenuItem>
              </Select>
            </FormControl>

            {/* Stats */}
            <Box sx={{ flex: 1, textAlign: "right" }}>
              <Typography variant="body2" color="text.secondary">
                Tổng số: <strong>{danhGiaKPIs.length}</strong> đánh giá
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Table */}
        <Grid item xs={12}>
          <DanhGiaKPITable
            data={danhGiaKPIs}
            isLoading={isLoading}
            nhanviens={nhanviens}
            chuKyDanhGias={chuKyDanhGias}
          />
        </Grid>
      </Grid>

      {/* Dialogs */}
      <DanhGiaKPIFormDialog
        open={isOpenFormDialog}
        handleClose={handleCloseFormDialog}
        nhanviens={nhanviens}
        chuKyDanhGias={chuKyDangDienRa}
        nhiemVuThuongQuys={nhiemVuThuongQuys}
      />

      <DanhGiaKPIDetailDialog
        open={isOpenDetailDialog}
        handleClose={handleCloseDetailDialog}
        tieuChiDanhGias={tieuChiDanhGias}
        viewMode="manager"
      />
    </MainCard>
  );
}

export default DanhGiaKPIPage;
