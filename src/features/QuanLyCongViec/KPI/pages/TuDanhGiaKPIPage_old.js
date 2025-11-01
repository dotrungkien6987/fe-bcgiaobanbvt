import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Paper,
  Skeleton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Info as InfoIcon,
  CalendarMonth as CalendarIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import useAuth from "../../../../hooks/useAuth";
import {
  getChuKyDanhGias,
  getDanhGiaKPIs,
  nhanVienChamDiem,
} from "../kpiSlice";
import { getOneNhanVienByID } from "features/NhanVien/nhanvienSlice";

/**
 * ✅ Helper function: Tính điểm cuối cùng cho tiêu chí
 * @param {Object} tieuChi - Tiêu chí cần tính điểm
 * @returns {Number} - Điểm cuối cùng
 */
const tinhDiemCuoiCung = (tieuChi) => {
  if (tieuChi.IsMucDoHoanThanh) {
    // Công thức: (DiemDat × 2 + DiemTuDanhGia) / 3
    const diemNV = tieuChi.DiemTuDanhGia ?? 0;
    const diemQL = tieuChi.DiemDat ?? 0;
    return ((diemQL * 2 + diemNV) / 3).toFixed(2);
  }
  // Tiêu chí thường: Lấy DiemDat
  return (tieuChi.DiemDat ?? 0).toFixed(2);
};

/**
 * TuDanhGiaKPIPage - Trang nhân viên tự đánh giá KPI
 *
 * Features:
 * - Dropdown chọn chu kỳ đánh giá (bao gồm cả chu kỳ đã đóng)
 * - Hiển thị ONLY nhiệm vụ của nhân viên đang login
 * - Input điểm cho tiêu chí "Mức độ hoàn thành công việc" (0-100%)
 * - Disable khi chu kỳ đã duyệt
 * - Hiển thị điểm cuối cùng sau khi duyệt
 */
function TuDanhGiaKPIPage() {
  const dispatch = useDispatch();
  const { user } = useAuth(); // ✅ Lấy thông tin user đang login

  const {
    danhGiaKPIs, // Danh sách đánh giá KPI
    chuKyDanhGias, // Danh sách chu kỳ (trong kpiSlice)
    isLoading,
    isSaving,
  } = useSelector((state) => state.kpi);
  const { nhanvienCurrent } = useSelector((state) => state.nhanvien);

  // ✅ State: Chu kỳ được chọn
  const [selectedChuKyId, setSelectedChuKyId] = useState("");

  // ✅ State: Điểm tự đánh giá (local state trước khi lưu)
  const [localScores, setLocalScores] = useState({});

  // ✅ Computed: Lấy DanhGiaKPI của user hiện tại
  const myDanhGiaKPI = useMemo(() => {
    return danhGiaKPIs?.[0]; // Vì đã filter theo NhanVienID
  }, [danhGiaKPIs]);

  // ✅ Computed: Danh sách nhiệm vụ
  const currentNhiemVuList = useMemo(() => {
    return myDanhGiaKPI?.DanhSachDanhGiaNhiemVu || [];
  }, [myDanhGiaKPI]);

  // ✅ Load danh sách chu kỳ (bao gồm cả đã đóng)
  useEffect(() => {
    dispatch(getChuKyDanhGias({})); // Lấy tất cả chu kỳ
  }, [dispatch]);

  // ✅ Load thông tin Nhân viên từ bảng NhanVien theo user.NhanVienID để hiển thị
  useEffect(() => {
    if (user?.NhanVienID) {
      dispatch(getOneNhanVienByID(user.NhanVienID));
    }
  }, [dispatch, user?.NhanVienID]);

  // ✅ Auto-select chu kỳ đang mở đầu tiên
  useEffect(() => {
    if (chuKyDanhGias.length > 0 && !selectedChuKyId) {
      // Ưu tiên chu kỳ đang mở
      const activeChuKy = chuKyDanhGias.find((ck) => !ck.isDong);
      const defaultChuKy = activeChuKy || chuKyDanhGias[0];
      setSelectedChuKyId(defaultChuKy._id);
    }
  }, [chuKyDanhGias, selectedChuKyId]);

  // ✅ Load nhiệm vụ khi chọn chu kỳ hoặc user thay đổi
  useEffect(() => {
    if (selectedChuKyId && user?.NhanVienID) {
      dispatch(
        getDanhGiaKPIs({
          ChuKyDanhGiaID: selectedChuKyId,
          NhanVienID: user.NhanVienID, // ✅ Dùng user.NhanVienID (ID tham chiếu đến Nhân Viên)
        })
      );
    }
  }, [selectedChuKyId, user?.NhanVienID, dispatch]);

  // ✅ Sync local scores từ Redux khi load data mới
  useEffect(() => {
    if (currentNhiemVuList.length > 0) {
      const scores = {};
      currentNhiemVuList.forEach((nv) => {
        const tieuChiMucDoHT = nv.ChiTietDiem?.find(
          (tc) => tc.IsMucDoHoanThanh === true
        );
        if (tieuChiMucDoHT) {
          scores[nv._id] = tieuChiMucDoHT.DiemTuDanhGia || "";
        }
      });
      setLocalScores(scores);
    }
  }, [currentNhiemVuList]);

  // ✅ Computed: Thông tin chu kỳ được chọn
  const selectedChuKy = useMemo(() => {
    return chuKyDanhGias.find((ck) => ck._id === selectedChuKyId);
  }, [chuKyDanhGias, selectedChuKyId]);

  // ✅ Computed: Check xem có thể chấm điểm không
  const canEdit = useMemo(() => {
    if (!myDanhGiaKPI) return true; // Chưa có đánh giá → cho phép
    return myDanhGiaKPI.TrangThai !== "DA_DUYET";
  }, [myDanhGiaKPI]);

  // ✅ Computed: Progress (bao nhiêu nhiệm vụ đã tự chấm điểm)
  const progress = useMemo(() => {
    if (currentNhiemVuList.length === 0) {
      return { scored: 0, total: 0, percentage: 0 };
    }

    const scored = currentNhiemVuList.filter((nv) => {
      const tieuChiMucDoHT = nv.ChiTietDiem?.find(
        (tc) => tc.IsMucDoHoanThanh === true
      );
      return tieuChiMucDoHT?.DiemTuDanhGia != null;
    }).length;

    return {
      scored,
      total: currentNhiemVuList.length,
      percentage: (scored / currentNhiemVuList.length) * 100,
    };
  }, [currentNhiemVuList]);

  // ✅ Handler: Thay đổi điểm local (chưa lưu)
  const handleScoreChange = (nhiemVuId, value) => {
    const numValue = parseFloat(value);

    // Validation
    if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > 100)) {
      toast.warning("Điểm phải từ 0-100");
      return;
    }

    setLocalScores((prev) => ({
      ...prev,
      [nhiemVuId]: value === "" ? "" : numValue,
    }));
  };

  // ✅ Handler: Lưu điểm cho 1 nhiệm vụ
  const handleSaveScore = async (nhiemVu) => {
    const score = localScores[nhiemVu._id];

    if (score === "" || score == null) {
      toast.warning("Vui lòng nhập điểm trước khi lưu");
      return;
    }

    if (score < 0 || score > 100) {
      toast.error("Điểm phải từ 0-100");
      return;
    }

    // ✅ REFACTORED: Dùng assignmentId (NhanVienNhiemVu) thay vì evaluationId (DanhGiaNhiemVuThuongQuy)
    if (!nhiemVu.assignmentId) {
      toast.error(
        "Không tìm thấy thông tin phân công nhiệm vụ. Vui lòng thử lại."
      );
      return;
    }

    try {
      await dispatch(nhanVienChamDiem(nhiemVu.assignmentId, score)).unwrap();

      toast.success(
        `Đã lưu điểm cho nhiệm vụ: ${nhiemVu.NhiemVuID?.TenNhiemVu}`
      );

      // ✅ Reload data để cập nhật progress
      if (selectedChuKyId && user?.NhanVienID) {
        dispatch(
          getDanhGiaKPIs({
            ChuKyDanhGiaID: selectedChuKyId,
            NhanVienID: user.NhanVienID, // ✅ Dùng user.NhanVienID
          })
        );
      }
    } catch (error) {
      toast.error(error.message || "Không thể lưu điểm");
    }
  };

  // ✅ Render: Loading skeleton
  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  // ✅ Render: No chu kỳ available
  if (chuKyDanhGias.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="subtitle1" fontWeight={600}>
            Chưa có chu kỳ đánh giá nào
          </Typography>
          <Typography variant="body2">
            Vui lòng liên hệ quản lý để tạo chu kỳ đánh giá KPI.
          </Typography>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
        {/* ✅ Header Card */}
        <Card
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center" mb={2}>
              <AssignmentIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  Tự đánh giá KPI
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Đánh giá mức độ hoàn thành công việc của bản thân
                </Typography>
              </Box>
            </Stack>

            {/* ✅ Info chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                icon={<AssignmentIcon />}
                label={`Nhân viên: ${nhanvienCurrent?.Ten || "Không có"}`}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
              <Chip
                label={`Mã NV: ${nhanvienCurrent?.MaNhanVien || "Không có"}`}
                sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
              />
              {selectedChuKy && (
                <Chip
                  icon={<CalendarIcon />}
                  label={`${dayjs(selectedChuKy.NgayBatDau).format(
                    "DD/MM/YYYY"
                  )} - ${dayjs(selectedChuKy.NgayKetThuc).format(
                    "DD/MM/YYYY"
                  )}`}
                  sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                />
              )}
              {myDanhGiaKPI?.TrangThai === "DA_DUYET" && (
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Đã duyệt"
                  color="success"
                  sx={{ bgcolor: "#4caf50", color: "white" }}
                />
              )}
            </Stack>
          </CardContent>
        </Card>

        {/* ✅ Selector Chu Kỳ + Progress */}
        <Paper elevation={2} sx={{ p: 3 }}>
          <Grid container spacing={3} alignItems="center">
            {/* Dropdown chọn chu kỳ */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Chọn chu kỳ đánh giá</InputLabel>
                <Select
                  value={selectedChuKyId}
                  onChange={(e) => setSelectedChuKyId(e.target.value)}
                  label="Chọn chu kỳ đánh giá"
                >
                  {chuKyDanhGias.map((ck) => (
                    <MenuItem key={ck._id} value={ck._id}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography>
                          {ck.TenChuKy || `Tháng ${ck.Thang}/${ck.Nam}`}
                        </Typography>
                        {ck.isDong && (
                          <Chip label="Đã đóng" size="small" color="default" />
                        )}
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Progress bar */}
            <Grid item xs={12} md={6}>
              <Box>
                <Stack direction="row" justifyContent="space-between" mb={1}>
                  <Typography variant="body2" fontWeight={600}>
                    Tiến độ tự đánh giá
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight={600}>
                    {progress.scored}/{progress.total} nhiệm vụ
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={progress.percentage}
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* ✅ Alert thông tin */}
        <Alert severity="info" icon={<InfoIcon />}>
          <Typography variant="body2">
            <strong>Lưu ý:</strong> Bạn chỉ cần đánh giá tiêu chí{" "}
            <strong>"Mức độ hoàn thành công việc"</strong> từ 0-100%. Quản lý sẽ
            chấm điểm và điểm cuối cùng được tính theo công thức:{" "}
            <strong>(Điểm Quản lý × 2 + Điểm Tự đánh giá) / 3</strong>
          </Typography>
          {!canEdit && (
            <Typography variant="body2" color="warning.main" mt={1}>
              ⚠️ KPI đã được duyệt. Bạn không thể thay đổi điểm tự đánh giá.
            </Typography>
          )}
        </Alert>

        {/* ✅ Empty state - Không có nhiệm vụ */}
        {currentNhiemVuList.length === 0 && (
          <Alert severity="warning">
            <Typography variant="subtitle1" fontWeight={600}>
              Không có nhiệm vụ nào trong chu kỳ này
            </Typography>
            <Typography variant="body2">
              Vui lòng liên hệ quản lý để được gán nhiệm vụ thường quy.
            </Typography>
          </Alert>
        )}

        {/* ✅ Danh sách nhiệm vụ */}
        {currentNhiemVuList.map((nhiemVu, index) => {
          const tieuChiMucDoHT = nhiemVu.ChiTietDiem?.find(
            (tc) => tc.IsMucDoHoanThanh === true
          );

          const currentScore = localScores[nhiemVu._id] ?? "";
          const hasSaved = tieuChiMucDoHT?.DiemTuDanhGia != null;
          const isApproved = nhiemVu.TrangThai === "DA_DUYET";

          return (
            <Accordion key={nhiemVu._id} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  sx={{ width: "100%" }}
                >
                  <Typography variant="h6" fontWeight={600}>
                    {nhiemVu.NhiemVuID?.TenNhiemVu || "Nhiệm vụ không xác định"}
                  </Typography>
                  {hasSaved && (
                    <Chip
                      icon={<CheckCircleIcon />}
                      label="Đã chấm"
                      color="success"
                      size="small"
                    />
                  )}
                  {isApproved && (
                    <Chip label="Đã duyệt" color="primary" size="small" />
                  )}
                </Stack>
              </AccordionSummary>

              <AccordionDetails>
                <Stack spacing={2.5}>
                  <Divider />

                  {/* Thông tin nhiệm vụ */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Mức độ khó
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {nhiemVu.MucDoKho || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Trạng thái
                      </Typography>
                      <Chip
                        label={
                          nhiemVu.TrangThai === "DA_DUYET"
                            ? "Đã duyệt"
                            : "Chưa duyệt"
                        }
                        color={
                          nhiemVu.TrangThai === "DA_DUYET"
                            ? "success"
                            : "default"
                        }
                        size="small"
                      />
                    </Grid>
                  </Grid>

                  <Divider />

                  {/* Tiêu chí "Mức độ hoàn thành công việc" */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={600}
                      gutterBottom
                    >
                      🎯 Mức độ hoàn thành công việc
                    </Typography>

                    <Stack spacing={2}>
                      {/* Input điểm tự đánh giá */}
                      <TextField
                        label="Điểm tự đánh giá (%)"
                        type="number"
                        value={currentScore}
                        onChange={(e) =>
                          handleScoreChange(nhiemVu._id, e.target.value)
                        }
                        disabled={!canEdit}
                        fullWidth
                        inputProps={{ min: 0, max: 100, step: 0.5 }}
                        helperText="Nhập điểm từ 0-100%"
                      />

                      {/* Nút lưu */}
                      {canEdit && (
                        <Button
                          variant="contained"
                          onClick={() => handleSaveScore(nhiemVu)}
                          disabled={currentScore === "" || isSaving}
                          startIcon={<CheckCircleIcon />}
                        >
                          {isSaving ? "Đang lưu..." : "Lưu điểm"}
                        </Button>
                      )}

                      {/* Hiển thị điểm sau khi duyệt */}
                      {isApproved && tieuChiMucDoHT && (
                        <Paper
                          elevation={0}
                          sx={{
                            p: 2,
                            bgcolor: "success.lighter",
                            border: "1px solid",
                            borderColor: "success.main",
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Điểm tự đánh giá
                              </Typography>
                              <Typography variant="h6" color="success.main">
                                {tieuChiMucDoHT.DiemTuDanhGia?.toFixed(2) || 0}%
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Điểm quản lý
                              </Typography>
                              <Typography variant="h6" color="primary.main">
                                {tieuChiMucDoHT.DiemDat?.toFixed(2) || 0}%
                              </Typography>
                            </Grid>
                            <Grid item xs={4}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Điểm cuối cùng
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {tinhDiemCuoiCung(tieuChiMucDoHT)}%
                              </Typography>
                            </Grid>
                          </Grid>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mt: 1 }}
                          >
                            Công thức: ({tieuChiMucDoHT.DiemDat || 0} × 2 +{" "}
                            {tieuChiMucDoHT.DiemTuDanhGia || 0}) / 3 ={" "}
                            {tinhDiemCuoiCung(tieuChiMucDoHT)}
                          </Typography>
                        </Paper>
                      )}
                    </Stack>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Stack>
    </Container>
  );
}

export default TuDanhGiaKPIPage;
