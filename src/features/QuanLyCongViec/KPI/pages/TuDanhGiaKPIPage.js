import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Slider,
  LinearProgress,
  Alert,
  Stack,
  Chip,
  Container,
  Autocomplete,
  Paper,
  Grid,
} from "@mui/material";
import EmployeeAvatar from "components/EmployeeAvatar";
import { LoadingButton } from "@mui/lab";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import useAuth from "hooks/useAuth";
import {
  layDanhSachNhiemVu,
  nhanVienTuChamDiemBatch,
  getChuKyDanhGias,
  getCurrentNhanVien,
} from "../kpiSlice";

function TuDanhGiaKPIPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const {
    assignments = [],
    isLoading,
    error,
    chuKyDanhGias = [],
    currentNhanVien,
  } = useSelector((state) => state.kpi);

  const [selectedChuKy, setSelectedChuKy] = useState(null);
  const [scores, setScores] = useState({}); // { assignmentId: DiemTuDanhGia }
  const [savingAll, setSavingAll] = useState(false);

  // Chuẩn hóa assignments về dạng mảng an toàn từ nhiều kiểu response khác nhau
  const assignmentList = React.useMemo(() => {
    if (Array.isArray(assignments)) return assignments;
    const obj = assignments || {};
    return (
      obj.items || obj.nhiemVuList || obj.list || obj.data || obj.results || []
    );
  }, [assignments]);

  // Fetch danh sách chu kỳ khi component mount
  useEffect(() => {
    dispatch(getChuKyDanhGias());
  }, [dispatch]);

  // Fetch thông tin NhanVien khi có user
  useEffect(() => {
    if (user?.NhanVienID) {
      dispatch(getCurrentNhanVien(user.NhanVienID));
    }
  }, [dispatch, user]);

  // Auto-select chu kỳ mở (chỉ lần đầu khi chuKyDanhGias có data)
  useEffect(() => {
    if (chuKyDanhGias.length > 0 && !selectedChuKy) {
      const openCycle = chuKyDanhGias.find((ck) => !ck.isDong);
      if (openCycle) {
        setSelectedChuKy(openCycle);
      } else {
        // Nếu không có chu kỳ mở, chọn chu kỳ gần nhất
        setSelectedChuKy(chuKyDanhGias[0]);
      }
    }
  }, [chuKyDanhGias, selectedChuKy]);

  // Lấy assignments khi có user và chu kỳ
  useEffect(() => {
    if (user?.NhanVienID && selectedChuKy?._id) {
      dispatch(layDanhSachNhiemVu(user.NhanVienID, selectedChuKy._id));
    }
  }, [dispatch, user, selectedChuKy]);

  // Initialize scores từ assignments (chỉ merge, không overwrite user input)
  useEffect(() => {
    if (assignmentList.length > 0) {
      setScores((prevScores) => {
        const newScores = { ...prevScores };
        assignmentList.forEach((assignment) => {
          // Update với giá trị từ DB (sau khi save thành công)
          newScores[assignment._id] = assignment.DiemTuDanhGia || 0;
        });
        return newScores;
      });
    }
  }, [assignmentList]);

  const handleScoreChange = (assignmentId, value) => {
    setScores((prev) => ({ ...prev, [assignmentId]: value }));
  };

  const handleSaveAll = async () => {
    // Lọc ra các nhiệm vụ có thay đổi điểm
    const changedAssignments = assignmentList
      .filter((assignment) => {
        const currentScore = scores[assignment._id] || 0;
        return (
          currentScore !== assignment.DiemTuDanhGia &&
          currentScore >= 0 &&
          currentScore <= 100
        );
      })
      .map((assignment) => ({
        assignmentId: assignment._id,
        DiemTuDanhGia: scores[assignment._id],
      }));

    if (changedAssignments.length === 0) {
      return;
    }

    setSavingAll(true);
    try {
      await dispatch(nhanVienTuChamDiemBatch(changedAssignments));
    } finally {
      setSavingAll(false);
    }
  };

  // Tính tiến độ (dùng giá trị đã lưu trong DB, không dùng local scores)
  const progress = {
    total: assignmentList.length,
    scored: assignmentList.filter((a) => (a?.DiemTuDanhGia || 0) > 0).length,
  };
  const progressPercent =
    progress.total > 0 ? (progress.scored / progress.total) * 100 : 0;

  // Kiểm tra có thể chỉnh sửa không
  const canEdit = selectedChuKy && !selectedChuKy.isDong;

  // Kiểm tra có thay đổi nào chưa lưu
  const hasUnsavedChanges = assignmentList.some((assignment) => {
    const currentScore = scores[assignment._id] || 0;
    return (
      currentScore !== assignment.DiemTuDanhGia &&
      currentScore >= 0 &&
      currentScore <= 100
    );
  });

  if (isLoading) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      {/* Header Section với gradient background - Compact */}
      <Paper
        elevation={0}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          borderRadius: 2,
          p: 2.5,
          mb: 2,
          color: "white",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={9}>
            <Stack direction="row" spacing={2} alignItems="center" mb={1.5}>
              <EmployeeAvatar
                nhanVienId={user?.NhanVienID}
                name={currentNhanVien?.Ten || user?.HoTen}
                size="md"
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontSize: "1.2rem",
                }}
              />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  Tự Đánh Giá KPI
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {currentNhanVien?.Ten || "Đang tải..."} -{" "}
                  {currentNhanVien?.MaNhanVien || "N/A"}
                </Typography>
              </Box>
            </Stack>

            {/* Thông tin nhân viên - Inline */}
            <Stack direction="row" spacing={3} flexWrap="wrap" useFlexGap>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <EmailIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {currentNhanVien?.Email || user?.Email || "N/A"}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={0.5} alignItems="center">
                <BusinessIcon sx={{ fontSize: 18 }} />
                <Typography variant="body2">
                  {currentNhanVien?.KhoaID?.TenKhoa ||
                    user?.KhoaID?.TenKhoa ||
                    "N/A"}
                </Typography>
              </Stack>
            </Stack>
          </Grid>

          {/* Progress - Compact */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.15)",
                backdropFilter: "blur(10px)",
                borderRadius: 2,
                p: 2,
                textAlign: "center",
              }}
            >
              <Typography variant="h3" fontWeight="bold">
                {progressPercent.toFixed(0)}%
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {progress.scored}/{progress.total} nhiệm vụ
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Chọn chu kỳ - Compact */}
      <Card
        elevation={0}
        sx={{
          mb: 2,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 2,
          overflow: "visible",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flex={1}>
              <TrendingUpIcon color="primary" />
              <Autocomplete
                options={chuKyDanhGias}
                value={selectedChuKy}
                onChange={(event, newValue) => setSelectedChuKy(newValue)}
                getOptionLabel={(option) => option.TenChuKy || ""}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chu kỳ đánh giá"
                    size="small"
                    variant="outlined"
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      width="100%"
                    >
                      <Typography variant="body2" flex={1}>
                        {option.TenChuKy}
                      </Typography>
                      <Chip
                        label={option.isDong ? "Đã đóng" : "Đang mở"}
                        color={option.isDong ? "default" : "success"}
                        size="small"
                      />
                    </Stack>
                  </li>
                )}
                isOptionEqualToValue={(option, value) =>
                  option._id === value?._id
                }
                noOptionsText="Không có chu kỳ"
                sx={{ flex: 1, minWidth: 250 }}
              />
            </Stack>

            {/* Nút lưu tất cả */}
            {canEdit && assignmentList.length > 0 && (
              <LoadingButton
                variant="contained"
                color="primary"
                startIcon={<SaveAltIcon />}
                onClick={handleSaveAll}
                disabled={!hasUnsavedChanges}
                loading={savingAll}
                sx={{
                  borderRadius: 2,
                  px: 3,
                  whiteSpace: "nowrap",
                }}
              >
                Lưu tất cả (
                {
                  assignmentList.filter((a) => {
                    const currentScore = scores[a._id] || 0;
                    return (
                      currentScore !== a.DiemTuDanhGia &&
                      currentScore >= 0 &&
                      currentScore <= 100
                    );
                  }).length
                }
                )
              </LoadingButton>
            )}
          </Stack>

          {selectedChuKy && selectedChuKy.isDong && (
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon />}
              sx={{ borderRadius: 2, mt: 2 }}
            >
              Chu kỳ đã đóng - Chỉ xem, không thể chỉnh sửa
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Cảnh báo */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Danh sách nhiệm vụ - Compact Design */}
      {!selectedChuKy ? (
        <Alert
          severity="info"
          icon={<InfoOutlinedIcon />}
          sx={{ borderRadius: 2 }}
        >
          Vui lòng chọn chu kỳ đánh giá để xem danh sách nhiệm vụ.
        </Alert>
      ) : assignmentList.length === 0 && !isLoading ? (
        <Alert
          severity="info"
          icon={<AssignmentIcon />}
          sx={{ borderRadius: 2 }}
        >
          <Typography variant="body1" fontWeight="medium">
            Không có nhiệm vụ nào trong chu kỳ này.
          </Typography>
        </Alert>
      ) : (
        <Stack spacing={1.5}>
          {assignmentList.map((assignment, index) => {
            const currentScore = scores[assignment._id] || 0;
            const isSaved = assignment.DiemTuDanhGia > 0;
            const hasChanged = currentScore !== assignment.DiemTuDanhGia;

            return (
              <Card
                key={assignment._id}
                elevation={0}
                sx={{
                  border: "1px solid",
                  borderColor: hasChanged
                    ? "warning.light"
                    : isSaved
                    ? "success.light"
                    : "divider",
                  borderRadius: 2,
                  transition: "all 0.2s",
                  position: "relative",
                  "&:hover": {
                    boxShadow: 2,
                    borderColor: "primary.main",
                  },
                }}
              >
                <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                  <Grid container spacing={2} alignItems="center">
                    {/* Left: Task Info - Compact */}
                    <Grid item xs={12} md={6}>
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="flex-start"
                      >
                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600, mt: 0.5 }}
                        />
                        <Box flex={1}>
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            gutterBottom
                          >
                            {assignment.NhiemVuThuongQuyID?.TenNhiemVu}
                          </Typography>
                          {assignment.NhiemVuThuongQuyID?.MoTa && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {assignment.NhiemVuThuongQuyID.MoTa}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={1} mt={0.5}>
                            <Chip
                              label={`Độ khó: ${assignment.MucDoKho}`}
                              size="small"
                              variant="outlined"
                              sx={{ height: 22, fontSize: "0.75rem" }}
                            />
                            {hasChanged && (
                              <Chip
                                label="Chưa lưu"
                                size="small"
                                color="warning"
                                sx={{ height: 22, fontSize: "0.75rem" }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                    </Grid>

                    {/* Right: Score Input - Compact */}
                    <Grid item xs={12} md={6}>
                      <Stack direction="row" spacing={2} alignItems="center">
                        {/* Score Display */}
                        <Box
                          sx={{
                            minWidth: 80,
                            textAlign: "center",
                            p: 1,
                            borderRadius: 1,
                            bgcolor: "background.default",
                          }}
                        >
                          <Typography
                            variant="h5"
                            fontWeight="bold"
                            color={
                              currentScore >= 80
                                ? "success.main"
                                : currentScore >= 50
                                ? "warning.main"
                                : "text.secondary"
                            }
                          >
                            {currentScore}
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              %
                            </Typography>
                          </Typography>
                        </Box>

                        {/* Slider */}
                        <Box flex={1} px={1}>
                          <Slider
                            value={currentScore}
                            onChange={(e, value) =>
                              handleScoreChange(assignment._id, value)
                            }
                            disabled={!canEdit || savingAll}
                            min={0}
                            max={100}
                            step={1}
                            valueLabelDisplay="auto"
                            size="small"
                          />
                        </Box>

                        {/* Input */}
                        <TextField
                          type="number"
                          value={currentScore}
                          onChange={(e) =>
                            handleScoreChange(
                              assignment._id,
                              Math.min(100, Math.max(0, Number(e.target.value)))
                            )
                          }
                          disabled={!canEdit || savingAll}
                          size="small"
                          sx={{ width: 80 }}
                          InputProps={{
                            endAdornment: (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                %
                              </Typography>
                            ),
                          }}
                        />
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Container>
  );
}

export default TuDanhGiaKPIPage;
