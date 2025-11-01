import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Typography,
  Box,
  Chip,
  Card,
  CardContent,
  Divider,
  LinearProgress,
  Alert,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import {
  ExpandMore,
  CheckCircle,
  Cancel,
  TrendingUp,
  TrendingDown,
} from "@mui/icons-material";
import dayjs from "dayjs";
import useAuth from "hooks/useAuth";
import { duyetDanhGiaKPI, huyDuyetDanhGiaKPI } from "../kpiSlice";

/**
 * DanhGiaKPIDetailDialog - Xem chi tiết đánh giá KPI
 *
 * Hiển thị:
 * - Thông tin tổng quan
 * - Danh sách nhiệm vụ với điểm chi tiết
 * - Chi tiết tiêu chí được/mất điểm
 * - Actions: Duyệt/Hủy duyệt (nếu có quyền)
 *
 * Props:
 * - open: Boolean
 * - handleClose: Function
 * - viewMode: "manager" | "employee" (default: "manager")
 */

const DanhGiaKPIDetailDialog = ({
  open,
  handleClose,
  viewMode = "manager",
}) => {
  const dispatch = useDispatch();

  const { danhGiaKPICurrent, nhiemVuThuongQuys, chuKyDanhGias, isLoading } =
    useSelector((state) => state.kpi);

  const { nhanviens } = useSelector((state) => state.nhanvien);

  // ✅ CORRECT: Use useAuth() hook as per best practice
  const { user: currentUser } = useAuth();

  const nhanVienInfo = useMemo(() => {
    if (!danhGiaKPICurrent?.NhanVienID) return null;
    return nhanviens.find((nv) => nv._id === danhGiaKPICurrent.NhanVienID);
  }, [danhGiaKPICurrent, nhanviens]);

  const chuKyInfo = useMemo(() => {
    if (!danhGiaKPICurrent?.ChuKyDanhGiaID) return null;
    return chuKyDanhGias.find(
      (ck) => ck._id === danhGiaKPICurrent.ChuKyDanhGiaID
    );
  }, [danhGiaKPICurrent, chuKyDanhGias]);

  // No longer needed - criteria names are embedded in ChiTietDiem

  const handleDuyet = async () => {
    if (danhGiaKPICurrent?._id) {
      await dispatch(duyetDanhGiaKPI(danhGiaKPICurrent._id));
    }
  };

  const handleHuyDuyet = async () => {
    if (danhGiaKPICurrent?._id) {
      await dispatch(huyDuyetDanhGiaKPI(danhGiaKPICurrent._id));
    }
  };

  if (!danhGiaKPICurrent) {
    return null;
  }

  const { TongDiemKPI, TrangThai, NgayDuyet, GhiChu } = danhGiaKPICurrent;
  const kpiPercent = ((TongDiemKPI / 10) * 100).toFixed(1);
  const kpiColor =
    TongDiemKPI >= 9
      ? "success"
      : TongDiemKPI >= 7
      ? "primary"
      : TongDiemKPI >= 5
      ? "warning"
      : "error";

  // Check permissions
  const isManagerView = viewMode === "manager";
  const canApprove = isManagerView && currentUser?.PhanQuyen >= 2; // Manager or Admin
  const isDuyet = TrangThai === "DA_DUYET";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h5">Chi tiết đánh giá KPI</Typography>
          <Chip
            label={isDuyet ? "Đã duyệt" : "Chưa duyệt"}
            color={isDuyet ? "success" : "warning"}
            icon={isDuyet ? <CheckCircle /> : <Cancel />}
          />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={3}>
          {/* Thông tin tổng quan */}
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Nhân viên:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {nhanVienInfo?.Ten || "N/A"} (
                      {nhanVienInfo?.MaNhanVien || ""})
                    </Typography>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Chu kỳ:
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {chuKyInfo?.TenChuKy || "N/A"}
                    </Typography>
                  </Stack>
                </Grid>

                {NgayDuyet && (
                  <Grid item xs={12} md={6}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Ngày duyệt:
                      </Typography>
                      <Typography variant="body1">
                        {dayjs(NgayDuyet).format("DD/MM/YYYY HH:mm")}
                      </Typography>
                    </Stack>
                  </Grid>
                )}

                {GhiChu && (
                  <Grid item xs={12}>
                    <Stack spacing={1}>
                      <Typography variant="body2" color="text.secondary">
                        Ghi chú:
                      </Typography>
                      <Typography variant="body1">{GhiChu}</Typography>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Tổng điểm KPI */}
          <Card sx={{ bgcolor: `${kpiColor}.lighter` }}>
            <CardContent>
              <Stack spacing={2}>
                <Typography variant="h6">Tổng điểm KPI</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="h3" color={`${kpiColor}.main`}>
                    {kpiPercent}%
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    ({TongDiemKPI.toFixed(2)}/10 điểm)
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={Math.min(parseFloat(kpiPercent), 100)}
                  color={kpiColor}
                  sx={{ height: 12, borderRadius: 6 }}
                />
              </Stack>
            </CardContent>
          </Card>

          {/* Danh sách nhiệm vụ */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Chi tiết nhiệm vụ ({nhiemVuThuongQuys.length})
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {nhiemVuThuongQuys.length === 0 ? (
              <Alert severity="info">Chưa có nhiệm vụ nào được chấm điểm</Alert>
            ) : (
              <Stack spacing={1}>
                {nhiemVuThuongQuys.map((nhiemVu, index) => (
                  <Accordion key={nhiemVu._id}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        flex={1}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          #{index + 1}
                        </Typography>
                        <Typography variant="body2" flex={1}>
                          {nhiemVu.NhiemVuThuongQuyID?.TenNhiemVu || "N/A"}
                        </Typography>
                        <Chip
                          label={`Mức độ khó: ${nhiemVu.MucDoKho || 0}`}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Typography variant="h6" color="primary">
                          {nhiemVu.DiemNhiemVu?.toFixed(2) || "0.00"} điểm
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={4}>
                          <Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Tổng điểm tiêu chí:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {nhiemVu.TongDiemTieuChi?.toFixed(2) || "0.00"}%
                            </Typography>
                          </Stack>
                          <Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Mức độ khó:
                            </Typography>
                            <Typography variant="body2" fontWeight={500}>
                              {nhiemVu.MucDoKho || 0}/10
                            </Typography>
                          </Stack>
                          <Stack>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Điểm nhiệm vụ:
                            </Typography>
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              color="primary"
                            >
                              {nhiemVu.DiemNhiemVu?.toFixed(2) || "0.00"} điểm
                            </Typography>
                          </Stack>
                        </Stack>

                        <Divider />

                        {/* ✅ ENHANCED: Criteria scoring table with permission-based columns */}
                        <Typography variant="subtitle2" gutterBottom>
                          Chi tiết tiêu chí chấm điểm:
                        </Typography>
                        {nhiemVu.ChiTietDiem &&
                        nhiemVu.ChiTietDiem.length > 0 ? (
                          <TableContainer component={Paper} variant="outlined">
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Tiêu chí</TableCell>
                                  <TableCell align="center">Loại</TableCell>
                                  <TableCell align="right">
                                    Điểm tự đánh giá
                                  </TableCell>
                                  {isDuyet && (
                                    <>
                                      <TableCell align="right">
                                        Điểm quản lý
                                      </TableCell>
                                      <TableCell align="right">
                                        Điểm cuối cùng
                                      </TableCell>
                                    </>
                                  )}
                                  {!isDuyet && (
                                    <TableCell align="left">Ghi chú</TableCell>
                                  )}
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {nhiemVu.ChiTietDiem.map((chiTiet, idx) => {
                                  const isTangDiem =
                                    chiTiet.LoaiTieuChi === "TANG_DIEM";
                                  const isMucDoHoanThanh =
                                    chiTiet.IsMucDoHoanThanh;

                                  // Calculate DiemCuoiCung for IsMucDoHoanThanh criteria
                                  let diemCuoiCung = null;
                                  if (
                                    isDuyet &&
                                    isMucDoHoanThanh &&
                                    chiTiet.DiemDat !== null &&
                                    nhiemVu.DiemTuDanhGia !== null &&
                                    nhiemVu.DiemTuDanhGia !== undefined
                                  ) {
                                    diemCuoiCung =
                                      (chiTiet.DiemDat * 2 +
                                        nhiemVu.DiemTuDanhGia) /
                                      3;
                                  }

                                  return (
                                    <TableRow key={idx}>
                                      <TableCell>
                                        <Stack
                                          direction="row"
                                          spacing={1}
                                          alignItems="center"
                                        >
                                          {isTangDiem ? (
                                            <TrendingUp
                                              fontSize="small"
                                              color="success"
                                            />
                                          ) : (
                                            <TrendingDown
                                              fontSize="small"
                                              color="error"
                                            />
                                          )}
                                          <Typography variant="body2">
                                            {chiTiet.TenTieuChi || "N/A"}
                                          </Typography>
                                        </Stack>
                                      </TableCell>
                                      <TableCell align="center">
                                        <Chip
                                          label={
                                            isTangDiem
                                              ? "Tăng điểm"
                                              : "Giảm điểm"
                                          }
                                          size="small"
                                          color={
                                            isTangDiem ? "success" : "error"
                                          }
                                          variant="outlined"
                                        />
                                      </TableCell>
                                      <TableCell align="right">
                                        {isMucDoHoanThanh ? (
                                          <Typography
                                            variant="body2"
                                            color="primary"
                                            fontWeight={500}
                                          >
                                            {nhiemVu.DiemTuDanhGia?.toFixed(
                                              2
                                            ) || "0.00"}
                                          </Typography>
                                        ) : (
                                          <Typography
                                            variant="body2"
                                            color="text.disabled"
                                          >
                                            -
                                          </Typography>
                                        )}
                                      </TableCell>
                                      {isDuyet && (
                                        <>
                                          <TableCell align="right">
                                            <Typography
                                              variant="body2"
                                              color="warning.main"
                                              fontWeight={500}
                                            >
                                              {chiTiet.DiemDat !== null
                                                ? `${
                                                    isTangDiem ? "+" : ""
                                                  }${chiTiet.DiemDat?.toFixed(
                                                    2
                                                  )}`
                                                : "-"}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">
                                            {diemCuoiCung !== null ? (
                                              <Typography
                                                variant="body2"
                                                color="success.main"
                                                fontWeight={600}
                                              >
                                                {diemCuoiCung.toFixed(2)}
                                              </Typography>
                                            ) : (
                                              <Typography
                                                variant="body2"
                                                color={
                                                  isTangDiem
                                                    ? "success.main"
                                                    : "error.main"
                                                }
                                                fontWeight={500}
                                              >
                                                {chiTiet.DiemDat !== null
                                                  ? `${
                                                      isTangDiem ? "+" : ""
                                                    }${chiTiet.DiemDat?.toFixed(
                                                      2
                                                    )}`
                                                  : "-"}
                                              </Typography>
                                            )}
                                          </TableCell>
                                        </>
                                      )}
                                      {!isDuyet && (
                                        <TableCell>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {chiTiet.GhiChu || "-"}
                                          </Typography>
                                        </TableCell>
                                      )}
                                    </TableRow>
                                  );
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Chưa có chi tiết tiêu chí
                          </Typography>
                        )}
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            )}
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Đóng
        </Button>

        {canApprove && !isDuyet && (
          <Button
            onClick={handleDuyet}
            variant="contained"
            color="success"
            disabled={isLoading}
            startIcon={<CheckCircle />}
          >
            Duyệt đánh giá
          </Button>
        )}

        {canApprove && isDuyet && (
          <Button
            onClick={handleHuyDuyet}
            variant="outlined"
            color="error"
            disabled={isLoading}
            startIcon={<Cancel />}
          >
            Hủy duyệt
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default DanhGiaKPIDetailDialog;
