/**
 * YeuCauList - Danh sách yêu cầu (responsive: table on desktop, cards on mobile)
 */
import React, { useEffect, useCallback, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Rating,
  useMediaQuery,
  useTheme,
  Skeleton,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Warning as WarningIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";

import useAuth from "hooks/useAuth";

import EmployeeAvatar from "components/EmployeeAvatar";

import { YeuCauStatusChip, YeuCauCard, YeuCauFilterPanel } from "./index";
import SwipeableYeuCauCard from "./SwipeableYeuCauCard";
import {
  getYeuCauList,
  setFilters,
  resetFilters,
  setPage,
  selectYeuCauList,
  selectFilters,
  selectActiveTab,
  deleteYeuCau,
} from "../yeuCauSlice";
import {
  formatRelativeTime,
  formatDateTime,
  getTenNguoi,
  getTenKhoa,
  isQuaHan,
  isSapHetHan,
} from "../yeuCau.utils";
import { DEFAULT_PAGE_SIZE, TRANG_THAI } from "../yeuCau.constants";

const EMPTY_FILTERS = {};

function YeuCauList({
  onViewDetail,
  khoaOptions = [],
  danhMucOptions = [],
  showRatingColumn = false,
  disableAutoFetch = false,
  swipeActions = null, // { onSwipeAction, leftAction, rightAction }
}) {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const yeuCauList = useSelector(selectYeuCauList) || [];
  const filters = useSelector(selectFilters) || EMPTY_FILTERS;
  const activeTab = useSelector(selectActiveTab);
  const yeuCauState = useSelector((state) => state.yeuCau) || {};
  const {
    isLoading = false,
    totalItems = 0,
    currentPage = 1,
    totalPages = 0,
  } = yeuCauState;

  // Delete dialog state
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    yeuCau: null,
  });

  // Helper to check if current user can delete (only NguoiYeuCau can delete)
  const canDelete = (yeuCau) => {
    if (yeuCau.TrangThai !== TRANG_THAI.MOI) return false;
    const nguoiYeuCauId = yeuCau.NguoiYeuCauID?._id || yeuCau.NguoiYeuCauID;
    return nguoiYeuCauId === user?.NhanVienID;
  };

  const handleOpenDeleteDialog = (yeuCau) => {
    setDeleteDialog({ open: true, yeuCau });
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialog({ open: false, yeuCau: null });
  };

  const handleConfirmDelete = () => {
    if (deleteDialog.yeuCau) {
      dispatch(deleteYeuCau(deleteDialog.yeuCau._id));
    }
    handleCloseDeleteDialog();
  };

  // Load data
  const loadData = useCallback(() => {
    dispatch(
      getYeuCauList({
        page: currentPage,
        limit: DEFAULT_PAGE_SIZE,
        tab: activeTab, // Truyền tab vào API
        ...filters,
      })
    );
  }, [dispatch, currentPage, filters, activeTab]);

  useEffect(() => {
    if (disableAutoFetch) return;
    loadData();
  }, [loadData, disableAutoFetch]);

  const handleFilterChange = (newFilters) => {
    dispatch(setFilters(newFilters));
  };

  const handleResetFilters = () => {
    dispatch(resetFilters());
  };

  const handlePageChange = (event, newPage) => {
    dispatch(setPage(newPage + 1)); // MUI TablePagination is 0-indexed
  };

  // Loading skeleton
  if (isLoading && yeuCauList.length === 0) {
    return (
      <Stack spacing={2}>
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rectangular" height={120} />
        ))}
      </Stack>
    );
  }

  const displayRatingColumn = Boolean(showRatingColumn);

  return (
    <Box>
      {/* Filters */}
      <YeuCauFilterPanel
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        khoaOptions={khoaOptions}
        danhMucOptions={danhMucOptions}
      />

      {/* Empty state */}
      {yeuCauList.length === 0 && !isLoading && (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Không có yêu cầu nào</Typography>
        </Paper>
      )}

      {/* Mobile: Card view */}
      {isMobile ? (
        <Stack spacing={2}>
          {yeuCauList.map((yeuCau) => {
            const cardElement = (
              <YeuCauCard
                key={yeuCau._id}
                yeuCau={yeuCau}
                showRating={displayRatingColumn}
                onClick={() => onViewDetail?.(yeuCau)}
              />
            );

            // Wrap with swipeable if swipeActions provided
            if (swipeActions) {
              return (
                <SwipeableYeuCauCard
                  key={yeuCau._id}
                  onSwipeAction={(action) =>
                    swipeActions.onSwipeAction(yeuCau, action)
                  }
                  leftAction={swipeActions.leftAction}
                  rightAction={swipeActions.rightAction}
                  disabled={false}
                >
                  {cardElement}
                </SwipeableYeuCauCard>
              );
            }

            return cardElement;
          })}
        </Stack>
      ) : (
        /* Desktop: Table view */
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã</TableCell>
                <TableCell>Tiêu đề</TableCell>
                <TableCell>Loại</TableCell>
                <TableCell>Trạng thái</TableCell>
                <TableCell>Người tạo / Khoa gửi</TableCell>
                <TableCell>Khoa xử lý</TableCell>
                <TableCell>Người điều phối</TableCell>
                <TableCell>Người xử lý</TableCell>
                {displayRatingColumn && (
                  <TableCell align="center">Đánh giá</TableCell>
                )}
                <TableCell>Thời gian hẹn</TableCell>
                <TableCell align="center">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {yeuCauList.map((yeuCau) => {
                const quaHan = isQuaHan(yeuCau);
                const sapHetHan = isSapHetHan(yeuCau);

                return (
                  <TableRow
                    key={yeuCau._id}
                    hover
                    sx={{
                      cursor: "pointer",
                      bgcolor: quaHan
                        ? "error.lighter"
                        : sapHetHan
                        ? "warning.lighter"
                        : "inherit",
                    }}
                    onClick={() => onViewDetail?.(yeuCau)}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        {(quaHan || sapHetHan) && (
                          <Tooltip title={quaHan ? "Quá hạn" : "Sắp hết hạn"}>
                            <WarningIcon
                              fontSize="small"
                              color={quaHan ? "error" : "warning"}
                            />
                          </Tooltip>
                        )}
                        <Typography variant="body2" fontWeight="medium">
                          {yeuCau.MaYeuCau}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 250,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {yeuCau.TieuDe}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="primary.main">
                        {yeuCau.SnapshotDanhMuc?.TenLoaiYeuCau || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <YeuCauStatusChip trangThai={yeuCau.TrangThai} />
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <EmployeeAvatar
                            size="xs"
                            nhanVienId={
                              yeuCau.NguoiYeuCauID?._id || yeuCau.NguoiYeuCauID
                            }
                            name={getTenNguoi(yeuCau.NguoiYeuCauID)}
                          />
                          <Typography variant="body2">
                            {getTenNguoi(yeuCau.NguoiYeuCauID)}
                          </Typography>
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {getTenKhoa(yeuCau.KhoaNguonID)}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {getTenKhoa(yeuCau.KhoaDichID)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {yeuCau.NguoiDieuPhoiID ? (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <EmployeeAvatar
                            size="xs"
                            nhanVienId={
                              yeuCau.NguoiDieuPhoiID?._id ||
                              yeuCau.NguoiDieuPhoiID
                            }
                            name={getTenNguoi(yeuCau.NguoiDieuPhoiID)}
                          />
                          <Typography variant="body2">
                            {getTenNguoi(yeuCau.NguoiDieuPhoiID)}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      {yeuCau.NguoiXuLyID || yeuCau.NguoiDuocDieuPhoiID ? (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                        >
                          <EmployeeAvatar
                            size="xs"
                            nhanVienId={
                              (yeuCau.NguoiXuLyID || yeuCau.NguoiDuocDieuPhoiID)
                                ?._id ||
                              yeuCau.NguoiXuLyID ||
                              yeuCau.NguoiDuocDieuPhoiID
                            }
                            name={getTenNguoi(
                              yeuCau.NguoiXuLyID || yeuCau.NguoiDuocDieuPhoiID
                            )}
                          />
                          <Typography variant="body2">
                            {getTenNguoi(
                              yeuCau.NguoiXuLyID || yeuCau.NguoiDuocDieuPhoiID
                            )}
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    {displayRatingColumn && (
                      <TableCell align="center">
                        {yeuCau?.DanhGia?.SoSao ? (
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                            alignItems="center"
                          >
                            <Rating
                              value={yeuCau.DanhGia.SoSao}
                              readOnly
                              size="small"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {yeuCau.DanhGia.SoSao}/5
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                    )}
                    <TableCell>
                      {yeuCau.ThoiGianHen ? (
                        <Tooltip title={formatDateTime(yeuCau.ThoiGianHen)}>
                          <Typography
                            variant="body2"
                            color={
                              quaHan
                                ? "error.main"
                                : sapHetHan
                                ? "warning.main"
                                : "text.secondary"
                            }
                          >
                            {formatRelativeTime(yeuCau.ThoiGianHen)}
                          </Typography>
                        </Tooltip>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        <Tooltip title="Xem chi tiết">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetail?.(yeuCau);
                            }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {/* Nút Xóa - chỉ NguoiYeuCau mới được xóa khi trạng thái MOI */}
                        {yeuCau.TrangThai === TRANG_THAI.MOI && (
                          <Tooltip
                            title={
                              canDelete(yeuCau)
                                ? "Xóa yêu cầu"
                                : "Chỉ người tạo mới được xóa"
                            }
                          >
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                disabled={!canDelete(yeuCau)}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteDialog(yeuCau);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalItems}
            page={currentPage - 1}
            onPageChange={handlePageChange}
            rowsPerPage={DEFAULT_PAGE_SIZE}
            rowsPerPageOptions={[DEFAULT_PAGE_SIZE]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count}`
            }
          />
        </TableContainer>
      )}

      {/* Mobile pagination */}
      {isMobile && totalPages > 1 && (
        <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
          <TablePagination
            component="div"
            count={totalItems}
            page={currentPage - 1}
            onPageChange={handlePageChange}
            rowsPerPage={DEFAULT_PAGE_SIZE}
            rowsPerPageOptions={[]}
            labelDisplayedRows={({ from, to, count }) =>
              `${from}-${to} / ${count}`
            }
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Xác nhận xóa yêu cầu</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa yêu cầu "{deleteDialog.yeuCau?.MaYeuCau}"?
            <br />
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Hủy</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default YeuCauList;
