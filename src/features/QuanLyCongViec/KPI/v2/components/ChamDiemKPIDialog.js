import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  LinearProgress,
  Alert,
  Chip,
  IconButton,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";

import ChamDiemKPITable from "./ChamDiemKPITable";
import {
  updateTieuChiScoreLocal,
  saveAllNhiemVu,
  approveKPI,
  clearCurrentChamDiem,
  resetCriteria,
  clearSyncWarning, // ✅ FIX: Add clearSyncWarning import
} from "../../kpiSlice";

/**
 * ChamDiemKPIDialog - Dialog chấm điểm KPI cho nhân viên
 *
 * Props:
 * - open: Boolean
 * - onClose: Function
 * - nhanVien: Object { _id, Ten, MaNhanVien, KhoaID }
 *
 * Features:
 * - Hiển thị tất cả nhiệm vụ thường quy
 * - Accordion expand/collapse
 * - Real-time score calculation
 * - Progress indicator
 * - Validation before approve
 * - Auto-save individual tasks
 */
function ChamDiemKPIDialog({ open, onClose, nhanVien }) {
  const dispatch = useDispatch();
  const {
    currentDanhGiaKPI,
    currentNhiemVuList,
    isLoading,
    isSaving,
    syncWarning, // ← NEW: Criteria change detection
  } = useSelector((state) => state.kpi);

  // Calculate progress
  const progress = useMemo(() => {
    const total = currentNhiemVuList.length;
    const scored = currentNhiemVuList.filter(
      (nv) => nv.TongDiemTieuChi > 0
    ).length;
    const percentage = total > 0 ? (scored / total) * 100 : 0;
    return { scored, total, percentage };
  }, [currentNhiemVuList]);

  // Calculate total KPI score
  const totalKPIScore = useMemo(() => {
    return currentNhiemVuList.reduce(
      (sum, nv) => sum + (nv.DiemNhiemVu || 0),
      0
    );
  }, [currentNhiemVuList]);

  // Check if can approve
  const canApprove = useMemo(() => {
    return (
      currentDanhGiaKPI &&
      currentDanhGiaKPI.TrangThai !== "DA_DUYET" &&
      progress.scored === progress.total &&
      progress.total > 0
    );
  }, [currentDanhGiaKPI, progress]);

  // Get unscored tasks
  const unscoredTasks = useMemo(() => {
    return currentNhiemVuList.filter((nv) => nv.TongDiemTieuChi === 0);
  }, [currentNhiemVuList]);

  // ✅ FIX: Changed signature from tieuChiId to tieuChiIndex
  const handleScoreChange = (nhiemVuId, tieuChiIndex, newScore) => {
    dispatch(updateTieuChiScoreLocal(nhiemVuId, tieuChiIndex, newScore));
  };

  const handleSaveAll = () => {
    dispatch(saveAllNhiemVu());
  };

  const handleApprove = () => {
    if (!canApprove) {
      return;
    }
    dispatch(approveKPI(currentDanhGiaKPI._id));
  };

  const handleClose = () => {
    dispatch(clearCurrentChamDiem());
    onClose();
  };

  const handleResetCriteria = () => {
    if (currentDanhGiaKPI) {
      dispatch(resetCriteria(currentDanhGiaKPI._id));
    }
  };

  const handleDismissSyncWarning = () => {
    dispatch(clearSyncWarning());
  };

  if (isLoading && !currentDanhGiaKPI) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ textAlign: "center", py: 8 }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            Đang tải dữ liệu...
          </Typography>
        </DialogContent>
      </Dialog>
    );
  }

  if (!currentDanhGiaKPI) {
    return (
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogContent>
          <Alert severity="error">
            Không tìm thấy dữ liệu đánh giá KPI. Vui lòng thử lại.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Đóng</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const isApproved = currentDanhGiaKPI.TrangThai === "DA_DUYET";

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen
      PaperProps={{
        sx: { height: "100vh" },
      }}
    >
      {/* Header - Simple Blue Design */}
      <DialogTitle
        sx={{
          background: "#1939B7",
          color: "white",
          py: 3,
          px: 4,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          position="relative"
          zIndex={1}
        >
          <Box>
            <Typography
              variant="h4"
              fontWeight="700"
              sx={{
                mb: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.2)",
                letterSpacing: "0.5px",
              }}
            >
              📊 Đánh Giá KPI
            </Typography>
            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              <Chip
                label={nhanVien.Ten}
                sx={{
                  bgcolor: "rgba(255,255,255,0.25)",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "1rem",
                  height: 36,
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                }}
              />
              <Chip
                label={nhanVien.MaNhanVien}
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  fontWeight: "500",
                }}
              />
              <Chip
                label={nhanVien.KhoaID?.TenKhoa || "Chưa có khoa"}
                variant="outlined"
                sx={{
                  borderColor: "rgba(255,255,255,0.5)",
                  color: "white",
                  fontWeight: "500",
                }}
              />
              {/* Chu kỳ đánh giá */}
              {currentDanhGiaKPI?.ChuKyID && (
                <Chip
                  icon={
                    <CalendarMonthIcon
                      sx={{ color: "white !important", fontSize: "1rem" }}
                    />
                  }
                  label={`${currentDanhGiaKPI.ChuKyID.TenChuKy || "Chu kỳ"}: ${
                    currentDanhGiaKPI.ChuKyID.NgayBatDau
                      ? dayjs(currentDanhGiaKPI.ChuKyID.NgayBatDau).format(
                          "DD/MM/YYYY"
                        )
                      : "N/A"
                  } - ${
                    currentDanhGiaKPI.ChuKyID.NgayKetThuc
                      ? dayjs(currentDanhGiaKPI.ChuKyID.NgayKetThuc).format(
                          "DD/MM/YYYY"
                        )
                      : "N/A"
                  }`}
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontWeight: "500",
                    border: "1px solid rgba(255,255,255,0.4)",
                    backdropFilter: "blur(5px)",
                  }}
                />
              )}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            {isApproved && (
              <Chip
                label="✓ Đã duyệt"
                sx={{
                  bgcolor: "#10b981",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  height: 40,
                  px: 2,
                  boxShadow: "0 4px 12px rgba(16, 185, 129, 0.4)",
                }}
                icon={<CheckCircleIcon sx={{ color: "white !important" }} />}
              />
            )}
            <IconButton
              onClick={handleClose}
              sx={{
                bgcolor: "rgba(255,255,255,0.2)",
                color: "white",
                "&:hover": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  transform: "rotate(90deg)",
                },
                transition: "all 0.3s ease",
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      {/* Progress Section - Compact Horizontal Layout */}
      <Box
        sx={{
          px: 4,
          py: 2,
          background: "#f8fafc",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={3}
        >
          {/* Left: Progress info + bar */}
          <Box display="flex" alignItems="center" gap={2} flex={1}>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              noWrap
              sx={{ fontSize: "0.95rem" }}
            >
              Tiến độ: {progress.scored}/{progress.total} nhiệm vụ
            </Typography>
            <Box sx={{ position: "relative", flex: 1, maxWidth: 300 }}>
              <LinearProgress
                variant="determinate"
                value={progress.percentage}
                sx={{
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: "rgba(0,0,0,0.1)",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 10,
                    background:
                      progress.percentage === 100
                        ? "#10b981"
                        : progress.percentage > 50
                        ? "#f59e0b"
                        : "#ef4444",
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontWeight: "700",
                  color: progress.percentage > 30 ? "white" : "text.primary",
                  fontSize: "0.75rem",
                  lineHeight: 1,
                }}
              >
                {progress.percentage.toFixed(0)}%
              </Typography>
            </Box>
          </Box>

          {/* Right: Tổng điểm hoàn thành - Compact Inline */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              bgcolor: "white",
              px: 2,
              py: 1,
              borderRadius: 2,
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              border: "2px solid",
              borderColor:
                totalKPIScore >= 80
                  ? "success.main"
                  : totalKPIScore >= 60
                  ? "warning.main"
                  : "error.main",
            }}
          >
            <Typography
              sx={{
                fontSize: "1.2rem",
                color:
                  totalKPIScore >= 80
                    ? "success.main"
                    : totalKPIScore >= 60
                    ? "warning.main"
                    : "error.main",
              }}
            >
              📊
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              color="text.secondary"
              sx={{ fontSize: "0.85rem" }}
            >
              Tổng điểm:
            </Typography>
            <Typography
              variant="h6"
              fontWeight={800}
              color={
                totalKPIScore >= 80
                  ? "success.main"
                  : totalKPIScore >= 60
                  ? "warning.main"
                  : "error.main"
              }
            >
              {totalKPIScore.toFixed(1)}
            </Typography>
          </Box>
        </Box>

        {/* Warning for unscored tasks only */}
        {unscoredTasks.length > 0 && !isApproved && (
          <Alert
            severity="warning"
            icon={<WarningIcon />}
            sx={{
              mt: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: "#fffbeb",
              border: "1px solid #fbbf24",
              "& .MuiAlert-icon": {
                color: "#f59e0b",
              },
            }}
          >
            <Typography variant="body2" fontSize="0.85rem">
              Còn {unscoredTasks.length} nhiệm vụ chưa chấm điểm. Vui lòng hoàn
              thành trước khi duyệt KPI.
            </Typography>
          </Alert>
        )}

        {/* NEW: Criteria Sync Warning */}
        {syncWarning && syncWarning.hasChanges && (
          <Alert
            severity="info"
            icon={<WarningIcon />}
            sx={{
              mt: 1.5,
              py: 1,
              borderRadius: 1,
              bgcolor: "#e0f2fe",
              border: "1px solid #0ea5e9",
              "& .MuiAlert-icon": {
                color: "#0284c7",
              },
            }}
            action={
              <Box display="flex" gap={1}>
                {/* ✅ FIX: Add Dismiss button */}
                <Button
                  size="small"
                  onClick={handleDismissSyncWarning}
                  sx={{ fontSize: "0.8rem" }}
                >
                  Bỏ qua
                </Button>
                {syncWarning.canReset && (
                  <Button
                    size="small"
                    variant="contained"
                    color="primary"
                    onClick={handleResetCriteria}
                    disabled={isSaving}
                    sx={{ fontSize: "0.8rem", fontWeight: 600 }}
                  >
                    {isSaving ? "Đang đồng bộ..." : "Đồng bộ ngay"}
                  </Button>
                )}
              </Box>
            }
          >
            <Typography variant="body2" fontSize="0.85rem" fontWeight={600}>
              ⚠️ Phát hiện thay đổi tiêu chí chấm điểm
            </Typography>
            {/* ✅ FIX: Display string arrays properly with join */}
            <Typography variant="body2" fontSize="0.8rem" sx={{ mt: 0.5 }}>
              {syncWarning.added?.length > 0 && (
                <>
                  <strong>Tiêu chí mới:</strong>{" "}
                  {Array.isArray(syncWarning.added)
                    ? syncWarning.added.join(", ")
                    : syncWarning.added}
                  .{" "}
                </>
              )}
              {syncWarning.removed?.length > 0 && (
                <>
                  <strong>Tiêu chí đã xóa:</strong>{" "}
                  {Array.isArray(syncWarning.removed)
                    ? syncWarning.removed.join(", ")
                    : syncWarning.removed}
                  .{" "}
                </>
              )}
              {syncWarning.modified?.length > 0 && (
                <>
                  <strong>Tiêu chí thay đổi:</strong>{" "}
                  {Array.isArray(syncWarning.modified)
                    ? syncWarning.modified.join(", ")
                    : syncWarning.modified}
                  .{" "}
                </>
              )}
            </Typography>
            {!syncWarning.canReset && (
              <Typography
                variant="caption"
                fontSize="0.75rem"
                sx={{ mt: 0.5, color: "error.main", display: "block" }}
              >
                * Không thể đồng bộ vì KPI đã được duyệt
              </Typography>
            )}
          </Alert>
        )}
      </Box>

      <Divider />

      {/* Content - Table Chấm Điểm */}
      <DialogContent
        sx={{
          px: 4,
          py: 3,
          overflow: "auto",
          bgcolor: "#fafafa",
        }}
      >
        <ChamDiemKPITable
          nhiemVuList={currentNhiemVuList}
          onScoreChange={handleScoreChange}
          readOnly={isApproved}
        />
      </DialogContent>

      {/* Footer Actions - Simple Design */}
      <DialogActions
        sx={{
          px: 4,
          py: 2.5,
          borderTop: "2px solid",
          borderColor: "divider",
          background: "#f9fafb",
          gap: 2,
        }}
      >
        <Button
          onClick={handleClose}
          size="large"
          variant="outlined"
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            borderWidth: 2,
            "&:hover": {
              borderWidth: 2,
              transform: "translateY(-2px)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            },
            transition: "all 0.2s ease",
          }}
        >
          Đóng
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        {!isApproved && (
          <>
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              size="large"
              onClick={handleSaveAll}
              disabled={isSaving || progress.scored === 0}
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 600,
                borderWidth: 2,
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  borderWidth: 2,
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 16px rgba(102, 126, 234, 0.4)",
                  bgcolor: "primary.lighter",
                },
                "&:disabled": {
                  borderWidth: 2,
                },
                transition: "all 0.2s ease",
              }}
            >
              {isSaving ? "Đang lưu..." : "💾 Lưu tất cả"}
            </Button>

            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              size="large"
              onClick={handleApprove}
              disabled={!canApprove || isSaving}
              sx={{
                borderRadius: 2,
                px: 4,
                fontWeight: 700,
                background: "#10b981",
                boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                "&:hover": {
                  background: "#059669",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.5)",
                },
                "&:disabled": {
                  background: "rgba(0,0,0,0.12)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isSaving ? "Đang xử lý..." : "✓ Duyệt KPI"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default ChamDiemKPIDialog;
