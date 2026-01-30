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
  Autocomplete,
  Paper,
  Grid,
  IconButton,
  Fab,
  Badge,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EmployeeAvatar from "components/EmployeeAvatar";
import { LoadingButton } from "@mui/lab";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EmailIcon from "@mui/icons-material/Email";
import BusinessIcon from "@mui/icons-material/Business";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import useAuth from "hooks/useAuth";
import KPIAssignmentCard from "../components/KPIAssignmentCard";
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

  // Số nhiệm vụ chưa lưu
  const unsavedCount = assignmentList.filter((a) => {
    const currentScore = scores[a._id] || 0;
    return (
      currentScore !== a.DiemTuDanhGia &&
      currentScore >= 0 &&
      currentScore <= 100
    );
  }).length;

  // ✅ Mobile detection
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  // Handle refresh
  const handleRefresh = () => {
    if (user?.NhanVienID && selectedChuKy?._id) {
      dispatch(layDanhSachNhiemVu(user.NhanVienID, selectedChuKy._id));
    }
  };

  if (isLoading && assignmentList.length === 0) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <LinearProgress />
      </Box>
    );
  }

  // ✅ Edge-to-edge layout for mobile
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "secondary.lighter",
        pb: isMobile ? 12 : 4,
      }}
    >
      {/* Header - Sticky */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: "100%", md: "xl" },
            mx: { xs: 0, md: "auto" },
            px: { xs: 2, md: 3 },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ py: 2 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                onClick={() => window.history.back()}
                size="small"
                sx={{ mr: 0.5 }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1.125rem", sm: "1.25rem" },
                }}
              >
                ✍️ Tự đánh giá KPI
              </Typography>
            </Stack>
            <IconButton
              onClick={handleRefresh}
              size="small"
              disabled={isLoading}
            >
              <RefreshIcon />
            </IconButton>
          </Stack>
        </Box>
      </Box>

      {/* Employee Info Card */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 2,
          mb: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: 2,
            maxWidth: { xs: "100%", md: "xl" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <Card
            elevation={0}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
              {/* Name Row */}
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
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {currentNhanVien?.Ten || user?.HoTen || "Đang tải..."}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {currentNhanVien?.MaNhanVien || "N/A"}
                  </Typography>
                </Box>

                {/* Progress Badge */}
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: "rgba(255, 255, 255, 0.15)",
                    p: 1.5,
                    borderRadius: 2,
                    textAlign: "center",
                    minWidth: 70,
                  }}
                >
                  <Typography variant="h5" fontWeight={700}>
                    {progressPercent.toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.9 }}>
                    {progress.scored}/{progress.total}
                  </Typography>
                </Paper>
              </Stack>

              {/* Info Row */}
              <Stack
                direction="row"
                spacing={2}
                flexWrap="wrap"
                sx={{ opacity: 0.9 }}
              >
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <EmailIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2">
                    {currentNhanVien?.Email || user?.Email || "N/A"}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <BusinessIcon sx={{ fontSize: 16 }} />
                  <Typography variant="body2">
                    {currentNhanVien?.KhoaID?.TenKhoa ||
                      user?.KhoaID?.TenKhoa ||
                      "N/A"}
                  </Typography>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Cycle Selector - Sticky on mobile */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 1.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          position: isMobile ? "sticky" : "static",
          top: isMobile ? 56 : "auto",
          zIndex: 9,
        }}
      >
        <Box
          sx={{
            px: 2,
            maxWidth: { xs: "100%", md: "xl" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "stretch", md: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flex={1}>
              <TrendingUpIcon
                color="primary"
                sx={{ display: { xs: "none", sm: "block" } }}
              />
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
                sx={{ flex: 1, minWidth: { xs: "100%", md: 250 } }}
              />
            </Stack>

            {/* Nút lưu tất cả - Desktop only */}
            {!isMobile && canEdit && assignmentList.length > 0 && (
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
                Lưu tất cả ({unsavedCount})
              </LoadingButton>
            )}
          </Stack>

          {selectedChuKy && selectedChuKy.isDong && (
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon />}
              sx={{ borderRadius: 2, mt: 1.5 }}
            >
              Chu kỳ đã đóng - Chỉ xem, không thể chỉnh sửa
            </Alert>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Box sx={{ px: 2, mt: 2 }}>
          <Alert severity="error" sx={{ borderRadius: 2 }}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Content Section Title */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 1.5,
          mt: 1,
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: 2,
            maxWidth: { xs: "100%", md: "xl" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" fontWeight={600}>
              Danh sách nhiệm vụ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {assignmentList.length} nhiệm vụ
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Assignment List */}
      <Box
        sx={{
          px: 2,
          py: 2,
          maxWidth: { xs: "100%", md: "xl" },
          mx: { xs: 0, md: "auto" },
        }}
      >
        {!selectedChuKy ? (
          <Alert
            severity="info"
            icon={<InfoOutlinedIcon />}
            sx={{ borderRadius: 2 }}
          >
            Vui lòng chọn chu kỳ đánh giá để xem danh sách nhiệm vụ.
          </Alert>
        ) : assignmentList.length === 0 && !isLoading ? (
          <Box sx={{ textAlign: "center", py: 6 }}>
            <AssignmentIcon
              sx={{ fontSize: 64, color: "text.disabled", mb: 2 }}
            />
            <Typography variant="h6" gutterBottom>
              Không có nhiệm vụ
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Không có nhiệm vụ nào trong chu kỳ này.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={isMobile ? 1.5 : 2}>
            {assignmentList.map((assignment, index) => {
              const currentScore = scores[assignment._id] || 0;
              const isSaved = assignment.DiemTuDanhGia > 0;
              const hasChanged = currentScore !== assignment.DiemTuDanhGia;

              // ✅ Mobile: Use KPIAssignmentCard
              if (isMobile) {
                return (
                  <KPIAssignmentCard
                    key={assignment._id}
                    assignment={assignment}
                    currentScore={currentScore}
                    onScoreChange={(value) =>
                      handleScoreChange(assignment._id, value)
                    }
                    canEdit={canEdit}
                    isSaving={savingAll}
                    index={index}
                  />
                );
              }

              // ✅ Desktop: Original compact card design
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
                      {/* Left: Task Info */}
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

                      {/* Right: Score Input */}
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
                              valueLabelFormat={(value) => `${value}%`}
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
                                Math.min(
                                  100,
                                  Math.max(0, Number(e.target.value)),
                                ),
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
      </Box>

      {/* Mobile FAB - Save All */}
      {isMobile && canEdit && assignmentList.length > 0 && (
        <Fab
          color="primary"
          variant="extended"
          onClick={handleSaveAll}
          disabled={!hasUnsavedChanges || savingAll}
          sx={{
            position: "fixed",
            bottom: 80,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
            px: 3,
          }}
        >
          <Badge
            badgeContent={unsavedCount}
            color="error"
            invisible={unsavedCount === 0}
            sx={{ mr: 1 }}
          >
            <SaveAltIcon />
          </Badge>
          <Typography variant="button" sx={{ ml: 1 }}>
            {savingAll ? "Đang lưu..." : "Lưu tất cả"}
          </Typography>
        </Fab>
      )}
    </Box>
  );
}

export default TuDanhGiaKPIPage;
