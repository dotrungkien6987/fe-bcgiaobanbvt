import React, { useMemo, useState, useEffect } from "react";
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
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SaveIcon from "@mui/icons-material/Save";
import WarningIcon from "@mui/icons-material/Warning";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import UndoIcon from "@mui/icons-material/Undo";
import HistoryIcon from "@mui/icons-material/History";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import useAuth from "../../../../../hooks/useAuth";

import ChamDiemKPITable from "./ChamDiemKPITable";
import KPIHistoryDialog from "./KPIHistoryDialog";
import CongViecCompactCard from "./CongViecCompactCard";
import CongViecDetailDialog from "../../../CongViec/CongViecDetailDialog";
import {
  updateTieuChiScoreLocal,
  saveAllNhiemVu,
  approveKPI,
  undoApproveKPI,
  clearCurrentChamDiem,
  resetCriteria,
  clearSyncWarning, // ✅ FIX: Add clearSyncWarning import
} from "../../kpiSlice";
import {
  fetchOtherTasksSummary,
  fetchCollabTasksSummary,
  getCongViecDetail,
} from "../../../CongViec/congViecSlice";

// ✅ V2: Import calculation utilities
import { calculateTotalScore } from "../../../../../utils/kpiCalculation";

/**
 * ChamDiemKPIDialog - Dialog chấm điểm KPI cho nhân viên
 *
 * Props:
 * - open: Boolean
 * - onClose: Function
 * - nhanVien: Object { _id, Ten, MaNhanVien, KhoaID }
 * - readOnly: Boolean (optional) - Chế độ xem, không cho sửa
 *
 * Features:
 * - Hiển thị tất cả nhiệm vụ thường quy
 * - Accordion expand/collapse
 * - Real-time score calculation
 * - Progress indicator
 * - Validation before approve
 * - Auto-save individual tasks
 * - Read-only mode for viewing approved KPI
 */
function ChamDiemKPIDialog({ open, onClose, nhanVien, readOnly = false }) {
  const dispatch = useDispatch();
  const {
    currentDanhGiaKPI,
    currentNhiemVuList,
    isLoading,
    isSaving,
    syncWarning, // ← NEW: Criteria change detection
  } = useSelector((state) => state.kpi);

  // ✅ NEW: Get compact card summaries from congViec slice
  const {
    otherTasksSummary,
    collabTasksSummary,
    summaryLoading,
    summaryError,
  } = useSelector((state) => state.congViec);

  // Check if editable (not approved AND not in readOnly mode)
  const isEditable = useMemo(() => {
    if (readOnly) return false;
    if (!currentDanhGiaKPI) return true;
    return currentDanhGiaKPI.TrangThai !== "DA_DUYET";
  }, [currentDanhGiaKPI, readOnly]);

  // Calculate progress
  const progress = useMemo(() => {
    const total = currentNhiemVuList.length;
    const scored = currentNhiemVuList.filter(
      (nv) => nv.ChiTietDiem && nv.ChiTietDiem.some((tc) => tc.DiemDat > 0)
    ).length;
    const percentage = total > 0 ? (scored / total) * 100 : 0;
    return { scored, total, percentage };
  }, [currentNhiemVuList]);

  // ✅ V2: Build DiemTuDanhGia map
  const diemTuDanhGiaMap = useMemo(() => {
    const map = {};
    currentNhiemVuList.forEach((nv) => {
      const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
      map[nvId?.toString()] = nv.DiemTuDanhGia || 0;
    });
    return map;
  }, [currentNhiemVuList]);

  // ✅ V2: Calculate total KPI score with REAL-TIME PREVIEW
  const totalKPIScore = useMemo(() => {
    // If approved, use snapshot value
    if (currentDanhGiaKPI?.TrangThai === "DA_DUYET") {
      return currentDanhGiaKPI.TongDiemKPI || 0;
    }

    // Otherwise, calculate preview in real-time
    const { tongDiem } = calculateTotalScore(
      currentNhiemVuList,
      diemTuDanhGiaMap
    );
    return tongDiem;
  }, [currentNhiemVuList, diemTuDanhGiaMap, currentDanhGiaKPI]);

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
    return currentNhiemVuList.filter(
      (nv) => !nv.ChiTietDiem || !nv.ChiTietDiem.some((tc) => tc.DiemDat > 0)
    );
  }, [currentNhiemVuList]);

  // ========== UNDO APPROVAL STATE ==========
  const [openUndoDialog, setOpenUndoDialog] = useState(false);
  const [undoReason, setUndoReason] = useState("");
  const { user } = useAuth();

  // ========== HISTORY STATE ==========
  const [openHistory, setOpenHistory] = useState(false);

  // ========== TASK DETAIL DIALOG STATE ==========
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ========== AUTO-CLOSE STATE ==========
  // ✅ NEW: Track if approval just happened in this dialog session
  const [justApproved, setJustApproved] = useState(false);

  // Check permission to undo approval
  const canUndoApproval = useMemo(() => {
    if (!currentDanhGiaKPI || currentDanhGiaKPI.TrangThai !== "DA_DUYET") {
      return { allowed: false, reason: "KPI chưa được duyệt" };
    }

    // Admin có quyền hủy duyệt không giới hạn
    const isAdmin = user?.PhanQuyen === "admin";
    if (isAdmin) {
      return { allowed: true, reason: null, isAdmin: true };
    }

    // Quản lý KPI: Kiểm tra trong vòng 7 ngày
    if (currentDanhGiaKPI.NgayDuyet) {
      const approvalDate = dayjs(currentDanhGiaKPI.NgayDuyet);
      const now = dayjs();
      const daysSinceApproval = now.diff(approvalDate, "day");

      // TODO: Backend cần populate QuanLyNhanVien để kiểm tra chính xác
      // Tạm thời cho phép nếu trong vòng 7 ngày
      if (daysSinceApproval <= 7) {
        return {
          allowed: true,
          reason: null,
          isManager: true,
          daysRemaining: 7 - daysSinceApproval,
        };
      } else {
        return {
          allowed: false,
          reason: `Chỉ có thể hủy duyệt trong vòng 7 ngày. Đã qua ${daysSinceApproval} ngày.`,
        };
      }
    }

    return { allowed: false, reason: "Không có quyền hủy duyệt KPI này" };
  }, [currentDanhGiaKPI, user]);

  // ✅ UPDATED: Support fieldName for IsMucDoHoanThanh (DiemQuanLy vs DiemDat)
  const handleScoreChange = (
    nhiemVuId,
    tieuChiIndex,
    newScore,
    fieldName = "DiemDat"
  ) => {
    dispatch(
      updateTieuChiScoreLocal(nhiemVuId, tieuChiIndex, newScore, fieldName)
    );
  };

  const handleSaveAll = () => {
    if (progress.scored === 0) {
      toast.warning("Vui lòng chấm điểm ít nhất 1 nhiệm vụ trước khi lưu nháp");
      return;
    }
    dispatch(saveAllNhiemVu());
  };

  const handleApprove = () => {
    if (!canApprove) {
      toast.error("Vui lòng chấm đủ điểm tất cả nhiệm vụ trước khi duyệt KPI");
      return;
    }
    setJustApproved(true); // ✅ Set flag before dispatching approve action
    dispatch(approveKPI(currentDanhGiaKPI._id));
  };

  // ========== UNDO APPROVAL HANDLERS ==========
  const handleOpenUndoDialog = () => {
    if (!canUndoApproval.allowed) {
      toast.error(canUndoApproval.reason || "Không có quyền hủy duyệt");
      return;
    }
    setOpenUndoDialog(true);
  };

  const handleCloseUndoDialog = () => {
    setOpenUndoDialog(false);
    setUndoReason("");
  };

  const handleConfirmUndo = () => {
    if (!undoReason.trim()) {
      toast.warning("Vui lòng nhập lý do hủy duyệt");
      return;
    }

    if (undoReason.trim().length < 10) {
      toast.warning("Lý do hủy duyệt phải có ít nhất 10 ký tự");
      return;
    }

    dispatch(
      undoApproveKPI({
        danhGiaKPIId: currentDanhGiaKPI._id,
        lyDo: undoReason.trim(),
      })
    );
    handleCloseUndoDialog();
  };

  const handleClose = () => {
    dispatch(clearCurrentChamDiem());
    onClose();
  };

  // History handlers
  const handleOpenHistory = () => setOpenHistory(true);
  const handleCloseHistory = () => setOpenHistory(false);

  const handleResetCriteria = () => {
    if (currentDanhGiaKPI) {
      dispatch(resetCriteria(currentDanhGiaKPI._id));
    }
  };

  const handleDismissSyncWarning = () => {
    dispatch(clearSyncWarning());
  };

  // ✅ Reset justApproved flag when dialog opens
  useEffect(() => {
    if (open) {
      setJustApproved(false);
    }
  }, [open]);

  // ✅ FIX: Auto-close dialog ONLY when approval just happened in this session
  useEffect(() => {
    if (
      justApproved &&
      currentDanhGiaKPI?.TrangThai === "DA_DUYET" &&
      !readOnly &&
      open &&
      !isLoading &&
      !isSaving
    ) {
      const timer = setTimeout(() => {
        dispatch(clearCurrentChamDiem());
        onClose();
        setJustApproved(false); // Reset flag after closing
      }, 1500); // Delay 1.5s để user thấy toast success

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    justApproved,
    currentDanhGiaKPI?.TrangThai,
    readOnly,
    open,
    isLoading,
    isSaving,
  ]);

  // ✅ NEW: Fetch compact card summaries when dialog opens
  useEffect(() => {
    const nhanVienId = nhanVien?._id;
    const chuKyId =
      currentDanhGiaKPI?.ChuKyDanhGiaID?._id ||
      currentDanhGiaKPI?.ChuKyDanhGiaID;

    if (open && nhanVienId && chuKyId) {
      // Fetch both summaries in parallel
      dispatch(fetchOtherTasksSummary({ nhanVienId, chuKyId }));
      dispatch(fetchCollabTasksSummary({ nhanVienId, chuKyId }));
    }
  }, [open, nhanVien?._id, currentDanhGiaKPI, dispatch]);

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
              {readOnly ? "👁️ Xem Chi Tiết KPI" : "📊 Đánh Giá KPI"}
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
              {currentDanhGiaKPI?.ChuKyDanhGiaID && (
                <Chip
                  icon={
                    <CalendarMonthIcon
                      sx={{ color: "white !important", fontSize: "1rem" }}
                    />
                  }
                  label={`${
                    currentDanhGiaKPI.ChuKyDanhGiaID.TenChuKy || "Chu kỳ"
                  }: ${
                    currentDanhGiaKPI.ChuKyDanhGiaID.NgayBatDau
                      ? dayjs(
                          currentDanhGiaKPI.ChuKyDanhGiaID.NgayBatDau
                        ).format("DD/MM/YYYY")
                      : "N/A"
                  } - ${
                    currentDanhGiaKPI.ChuKyDanhGiaID.NgayKetThuc
                      ? dayjs(
                          currentDanhGiaKPI.ChuKyDanhGiaID.NgayKetThuc
                        ).format("DD/MM/YYYY")
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
          readOnly={!isEditable}
          diemTuDanhGiaMap={diemTuDanhGiaMap} // ✅ V2: Pass map for preview calculation
          nhanVienID={nhanVien?._id} // ✅ NEW: For dashboard
          chuKyDanhGiaID={
            currentDanhGiaKPI?.ChuKyDanhGiaID?._id ||
            currentDanhGiaKPI?.ChuKyDanhGiaID
          } // ✅ NEW: For dashboard
        />

        {/* ✅ NEW: Compact Cards for "Other" and "Collaboration" Tasks */}
        {(() => {
          const nhanVienId = nhanVien?._id;
          const chuKyId =
            currentDanhGiaKPI?.ChuKyDanhGiaID?._id ||
            currentDanhGiaKPI?.ChuKyDanhGiaID;
          const key = `${nhanVienId}_${chuKyId}`;

          const otherTasksData = otherTasksSummary[key]?.data || {
            total: 0,
            completed: 0,
            late: 0,
            active: 0,
            tasks: [],
          };

          const collabTasksData = collabTasksSummary[key]?.data || {
            total: 0,
            completed: 0,
            late: 0,
            active: 0,
            tasks: [],
          };

          const handleViewTask = (taskId) => {
            if (!taskId) return;
            setSelectedTaskId(taskId);
            dispatch(getCongViecDetail(taskId));
            setOpenTaskDetail(true);
          };

          const handleOpenNewTab = (taskId) => {
            if (!taskId) return;
            window.open(`/congviec/${taskId}`, "_blank", "noopener,noreferrer");
          };

          return (
            <>
              {/* Card 1: Công việc khác */}
              <CongViecCompactCard
                title="Công việc khác"
                icon="📦"
                color="warning.main"
                total={otherTasksData.total}
                completed={otherTasksData.completed}
                late={otherTasksData.late}
                active={otherTasksData.active}
                tasks={otherTasksData.tasks}
                onViewTask={handleViewTask}
                onOpenNewTab={handleOpenNewTab}
                isLoading={summaryLoading}
                error={summaryError}
                showNguoiChinh={false}
              />

              {/* Card 2: Công việc phối hợp */}
              <CongViecCompactCard
                title="Công việc phối hợp"
                icon="🤝"
                color="info.main"
                total={collabTasksData.total}
                completed={collabTasksData.completed}
                late={collabTasksData.late}
                active={collabTasksData.active}
                tasks={collabTasksData.tasks}
                onViewTask={handleViewTask}
                onOpenNewTab={handleOpenNewTab}
                isLoading={summaryLoading}
                error={summaryError}
                showNguoiChinh={true}
              />
            </>
          );
        })()}
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

        {/* History button */}
        <Button
          onClick={handleOpenHistory}
          size="large"
          startIcon={<HistoryIcon />}
          sx={{ fontWeight: 600 }}
        >
          Lịch sử
        </Button>

        <Box sx={{ flexGrow: 1 }} />

        {/* ========== APPROVED STATUS: Show info + undo button ========== */}
        {isApproved && (
          <>
            {/* Info box: Approval date */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 3,
                py: 1.5,
                borderRadius: 2,
                background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
                border: "2px solid #86efac",
              }}
            >
              <CheckCircleIcon sx={{ color: "#16a34a", fontSize: 24 }} />
              <Box>
                <Typography variant="body2" fontWeight="600" color="#15803d">
                  Đã duyệt KPI
                </Typography>
                <Typography variant="caption" color="#166534">
                  {dayjs(currentDanhGiaKPI.NgayDuyet).format(
                    "DD/MM/YYYY HH:mm"
                  )}
                </Typography>
              </Box>
            </Box>

            {/* Undo button - ONLY show if NOT readOnly */}
            {!readOnly && (
              <Button
                variant="outlined"
                startIcon={<UndoIcon />}
                size="large"
                onClick={handleOpenUndoDialog}
                disabled={isSaving || !canUndoApproval.allowed}
                sx={{
                  borderRadius: 2,
                  px: 4,
                  fontWeight: 600,
                  borderWidth: 2,
                  borderColor: canUndoApproval.allowed
                    ? "warning.main"
                    : "error.main",
                  color: canUndoApproval.allowed
                    ? "warning.main"
                    : "error.main",
                  "&:hover": {
                    borderWidth: 2,
                    borderColor: canUndoApproval.allowed
                      ? "warning.dark"
                      : "error.dark",
                    bgcolor: canUndoApproval.allowed
                      ? "warning.lighter"
                      : "error.lighter",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                  },
                  "&:disabled": {
                    borderWidth: 2,
                    borderColor: "grey.300",
                    color: "grey.400",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                🔄 Hủy duyệt KPI
              </Button>
            )}
          </>
        )}

        {/* ========== NOT APPROVED: Show draft + approve buttons ========== */}
        {!isApproved && !readOnly && (
          <>
            {/* ✅ ENHANCED: Lưu nháp - Secondary action với progress */}
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
                borderColor: "grey.400",
                color: "text.secondary",
                "&:hover": {
                  borderWidth: 2,
                  borderColor: "grey.600",
                  bgcolor: "grey.50",
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                },
                "&:disabled": {
                  borderWidth: 2,
                  borderColor: "grey.300",
                  color: "grey.400",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isSaving
                ? "Đang lưu nháp..."
                : `💾 Lưu nháp (${progress.scored}/${progress.total})`}
            </Button>

            {/* ✅ ENHANCED: Duyệt KPI - Primary action với gradient */}
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              size="large"
              onClick={handleApprove}
              disabled={!canApprove || isSaving}
              sx={{
                borderRadius: 2,
                px: 5,
                fontWeight: 700,
                fontSize: "1.05rem",
                minWidth: 200,
                height: 48,
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                boxShadow: "0 4px 16px rgba(16, 185, 129, 0.4)",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 20px rgba(16, 185, 129, 0.5)",
                },
                "&:disabled": {
                  background: "rgba(0,0,0,0.12)",
                  color: "rgba(0,0,0,0.26)",
                },
                transition: "all 0.2s ease",
              }}
            >
              {isSaving ? "Đang xử lý..." : "✓ Duyệt KPI"}
            </Button>
          </>
        )}
      </DialogActions>

      {/* ========== UNDO CONFIRMATION DIALOG ========== */}
      <Dialog
        open={openUndoDialog}
        onClose={handleCloseUndoDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
            color: "#92400e",
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            py: 2.5,
          }}
        >
          <UndoIcon sx={{ fontSize: 28 }} />
          Xác Nhận Hủy Duyệt KPI
        </DialogTitle>

        <DialogContent sx={{ mt: 3 }}>
          {/* Warning alert */}
          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              ⚠️ Hành động này sẽ:
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Đưa KPI về trạng thái Chưa duyệt</li>
              <li>Cho phép chỉnh sửa lại điểm số</li>
              <li>Lưu lại lịch sử hủy duyệt</li>
            </ul>
          </Alert>

          {/* KPI info box */}
          <Box
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              mb: 3,
            }}
          >
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Thông tin KPI:
            </Typography>
            <Typography variant="body1" fontWeight="600">
              {nhanVien?.HoTen}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tháng {dayjs(currentDanhGiaKPI?.ThangDanhGia).format("MM/YYYY")}
            </Typography>
            <Typography variant="body2" color="success.main" fontWeight="600">
              Điểm hiện tại: {totalKPIScore.toFixed(2)}
            </Typography>
          </Box>

          {/* Permission info */}
          {canUndoApproval.isManager && (
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              <Typography variant="caption">
                💡 Quản lý KPI chỉ có thể hủy duyệt trong vòng 7 ngày.
                <br />
                Còn lại: <strong>{canUndoApproval.daysRemaining} ngày</strong>
              </Typography>
            </Alert>
          )}

          {/* Reason input */}
          <TextField
            multiline
            rows={4}
            fullWidth
            placeholder="Nhập lý do hủy duyệt... (ít nhất 10 ký tự)"
            value={undoReason}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setUndoReason(e.target.value);
              }
            }}
            helperText={`${undoReason.length}/500 ký tự`}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2.5, gap: 2 }}>
          <Button
            onClick={handleCloseUndoDialog}
            variant="outlined"
            size="large"
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 600,
            }}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            color="warning"
            size="large"
            onClick={handleConfirmUndo}
            disabled={undoReason.trim().length < 10 || isSaving}
            sx={{
              borderRadius: 2,
              px: 4,
              fontWeight: 700,
              minWidth: 180,
            }}
          >
            {isSaving ? "Đang xử lý..." : "Xác nhận hủy duyệt"}
          </Button>
        </DialogActions>
      </Dialog>

      <KPIHistoryDialog
        open={openHistory}
        onClose={handleCloseHistory}
        currentDanhGiaKPI={currentDanhGiaKPI}
        isApproved={isApproved}
      />

      {/* ========== TASK DETAIL DIALOG ========== */}
      <CongViecDetailDialog
        open={openTaskDetail}
        onClose={() => {
          setOpenTaskDetail(false);
          setSelectedTaskId(null);
        }}
        congViecId={selectedTaskId}
      />
    </Dialog>
  );
}

export default ChamDiemKPIDialog;
