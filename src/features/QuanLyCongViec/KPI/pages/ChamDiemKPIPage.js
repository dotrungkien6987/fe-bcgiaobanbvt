/**
 * ChamDiemKPIPage - Desktop page for KPI scoring
 *
 * Route: /quanlycongviec/kpi/cham-diem/:nhanVienId?chuky=:chuKyId
 *
 * This is a route-based page component that replaces the dialog-based approach.
 * Pattern follows CongViecDetailPageNew.js
 *
 * Features:
 * - AppBar with back navigation
 * - Progress indicator
 * - Reuse ChamDiemKPITable for scoring
 * - Compact cards for related data (CongViec, YeuCau)
 * - Sticky footer with actions (Save, Approve, Undo)
 *
 * @component
 */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import HistoryIcon from "@mui/icons-material/History";
import UndoIcon from "@mui/icons-material/Undo";
import SyncIcon from "@mui/icons-material/Sync";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import { toast } from "react-toastify";

// Redux actions
import {
  getChamDiemDetail,
  updateTieuChiScoreLocal,
  saveAllNhiemVu,
  approveKPI,
  undoApproveKPI,
  clearCurrentChamDiem,
  resetCriteria,
  clearSyncWarning,
  quickScoreAllNhiemVu,
} from "../kpiSlice";
import {
  fetchOtherTasksSummary,
  fetchCollabTasksSummary,
  fetchCrossCycleTasksSummary,
  getCongViecDetail,
} from "../../CongViec/congViecSlice";
import { fetchOtherYeuCauSummary } from "../../Ticket/yeuCauSlice";

// Reuse existing components
import ChamDiemKPITable from "../v2/components/ChamDiemKPITable";
import CongViecDetailDialog from "../../CongViec/CongViecDetailDialog";
import KPIHistoryDialog from "../v2/components/KPIHistoryDialog";
import CongViecCompactCard from "../v2/components/CongViecCompactCard";
import CrossCycleTasksCompactCard from "../v2/components/CrossCycleTasksCompactCard";
import YeuCauCompactCard from "../v2/components/YeuCauCompactCard";

// Calculation utilities
import { calculateTotalScore } from "../../../../utils/kpiCalculation";

// Auth hook
import useAuth from "../../../../hooks/useAuth";

/**
 * ChamDiemKPIPage Component
 */
function ChamDiemKPIPage() {
  const { nhanVienId } = useParams();
  const [searchParams] = useSearchParams();
  const chuKyId = searchParams.get("chuky");
  const readOnly = searchParams.get("readonly") === "true";
  console.log("🔍 DEBUG readOnly:", {
    readOnly,
    rawParam: searchParams.get("readonly"),
    url: window.location.href,
    searchParams: searchParams.toString(),
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Redux state
  const {
    currentDanhGiaKPI,
    currentNhiemVuList,
    isLoading,
    isSaving,
    syncWarning,
  } = useSelector((state) => state.kpi);

  // Compact card summaries from other slices
  const {
    otherTasksSummary = {},
    collabTasksSummary = {},
    crossCycleTasksSummary = {},
    summaryLoading: congViecSummaryLoading = {},
  } = useSelector((state) => state.congViec || {});

  const {
    otherYeuCauSummary = {},
    summaryLoading: yeuCauSummaryLoading = false,
  } = useSelector((state) => state.yeuCau || {});

  // Local UI state
  const [openUndoDialog, setOpenUndoDialog] = useState(false);
  const [undoReason, setUndoReason] = useState("");
  const [openHistory, setOpenHistory] = useState(false);

  // Task detail dialog state
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ========== Data Loading ==========

  // Load KPI scoring data
  useEffect(() => {
    if (nhanVienId && chuKyId) {
      dispatch(getChamDiemDetail(chuKyId, nhanVienId));
    }
    return () => {
      dispatch(clearCurrentChamDiem());
    };
  }, [nhanVienId, chuKyId, dispatch]);

  // Load compact card summaries
  useEffect(() => {
    if (nhanVienId && chuKyId && currentDanhGiaKPI) {
      dispatch(fetchOtherTasksSummary({ nhanVienId, chuKyId }));
      dispatch(fetchCrossCycleTasksSummary({ nhanVienId, chuKyId }));
      dispatch(fetchCollabTasksSummary({ nhanVienId, chuKyId }));
      dispatch(
        fetchOtherYeuCauSummary({
          nhanVienID: nhanVienId,
          chuKyDanhGiaID: chuKyId,
        }),
      );
    }
  }, [nhanVienId, chuKyId, currentDanhGiaKPI, dispatch]);

  // ========== Computed Values ==========

  // Get employee info from currentDanhGiaKPI (populated)
  const nhanVien = useMemo(() => {
    return currentDanhGiaKPI?.NhanVienID || null;
  }, [currentDanhGiaKPI]);

  // Can edit?
  const isEditable = useMemo(() => {
    if (readOnly) return false;
    if (!currentDanhGiaKPI) return false;
    return currentDanhGiaKPI.TrangThai !== "DA_DUYET";
  }, [readOnly, currentDanhGiaKPI]);

  // Progress calculation
  const progress = useMemo(() => {
    if (!currentNhiemVuList?.length)
      return { scored: 0, total: 0, percentage: 0 };
    const total = currentNhiemVuList.length;
    const scored = currentNhiemVuList.filter((nv) => {
      // ✅ V2: Check if any criteria has DiemDat > 0
      return nv.ChiTietDiem?.some((tc) => tc.DiemDat > 0);
    }).length;
    return {
      scored,
      total,
      percentage: total > 0 ? Math.round((scored / total) * 100) : 0,
    };
  }, [currentNhiemVuList]);

  // Build DiemTuDanhGia map from nhiemVuList
  const diemTuDanhGiaMap = useMemo(() => {
    const map = {};
    currentNhiemVuList.forEach((nv) => {
      const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
      map[nvId?.toString()] = nv.DiemTuDanhGia || 0;
    });
    return map;
  }, [currentNhiemVuList]);

  // Total KPI score (real-time calculation or snapshot if approved)
  const totalKPIScore = useMemo(() => {
    // If approved, use snapshot value
    if (currentDanhGiaKPI?.TrangThai === "DA_DUYET") {
      return currentDanhGiaKPI.TongDiemKPI || 0;
    }
    // Otherwise, calculate preview in real-time
    const { tongDiem } = calculateTotalScore(
      currentNhiemVuList,
      diemTuDanhGiaMap,
    );
    return tongDiem;
  }, [currentNhiemVuList, diemTuDanhGiaMap, currentDanhGiaKPI]);

  // Can approve?
  const canApprove = useMemo(() => {
    return progress.percentage === 100 && currentDanhGiaKPI && isEditable;
  }, [progress.percentage, currentDanhGiaKPI, isEditable]);

  // Unscored tasks
  const unscoredTasks = useMemo(() => {
    return currentNhiemVuList.filter((nv) => {
      // ✅ V2: Check if no criteria has DiemDat > 0
      return !nv.ChiTietDiem?.some((tc) => tc.DiemDat > 0);
    });
  }, [currentNhiemVuList]);

  // Check undo permission
  const canUndoApproval = useMemo(() => {
    console.log("🔍 DEBUG canUndoApproval:", {
      readOnly,
      TrangThai: currentDanhGiaKPI?.TrangThai,
      user: user?.PhanQuyen,
    });

    // ✅ FIX: Không cho phép hủy duyệt trong chế độ readonly
    if (readOnly) {
      console.log("✅ BLOCKED by readOnly");
      return { allowed: false, reason: "Chế độ xem - không thể hủy duyệt" };
    }

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
  }, [currentDanhGiaKPI, user, readOnly]);

  // ========== Handlers ==========

  const handleBack = () => {
    dispatch(clearCurrentChamDiem());
    navigate(-1);
  };

  // ✅ UPDATED: Support fieldName for IsMucDoHoanThanh (DiemQuanLy vs DiemDat)
  const handleScoreChange = (
    nhiemVuId,
    tieuChiIndex,
    newScore,
    fieldName = "DiemDat",
  ) => {
    dispatch(
      updateTieuChiScoreLocal(nhiemVuId, tieuChiIndex, newScore, fieldName),
    );
  };

  const handleQuickScoreAll = (percentage) => {
    dispatch(quickScoreAllNhiemVu(percentage));
  };

  const handleSave = async () => {
    if (progress.scored === 0) {
      toast.warning("Vui lòng chấm điểm ít nhất 1 nhiệm vụ trước khi lưu nháp");
      return;
    }
    try {
      await dispatch(saveAllNhiemVu());
      toast.success("Đã lưu nháp thành công!");
    } catch (error) {
      toast.error("Lỗi khi lưu: " + error.message);
    }
  };

  const handleApprove = async () => {
    if (!canApprove) {
      toast.warning("Vui lòng chấm điểm tất cả nhiệm vụ trước khi duyệt");
      return;
    }
    try {
      await dispatch(approveKPI(currentDanhGiaKPI._id));
      toast.success("Đã duyệt KPI thành công!");
      // Optionally navigate back or stay
      // navigate(-1);
    } catch (error) {
      toast.error("Lỗi khi duyệt: " + error.message);
    }
  };

  const handleOpenUndoDialog = () => {
    if (!canUndoApproval.allowed) {
      toast.error(canUndoApproval.reason || "Không có quyền hủy duyệt");
      return;
    }
    setOpenUndoDialog(true);
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
      }),
    );
    setOpenUndoDialog(false);
    setUndoReason("");
  };

  const handleResetCriteria = () => {
    if (currentDanhGiaKPI?._id) {
      dispatch(resetCriteria(currentDanhGiaKPI._id));
    }
    dispatch(clearSyncWarning());
    toast.info("Đã đồng bộ lại tiêu chí từ cấu hình chu kỳ");
  };

  // ========== Compact Card Data Transformation ==========
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

  const crossCycleData = crossCycleTasksSummary[key]?.data || {
    total: 0,
    completed: 0,
    late: 0,
    active: 0,
    tasks: [],
  };

  // Transform YeuCau data structure
  const rawYeuCauData = otherYeuCauSummary[key]?.data || {};
  const otherYeuCauData = {
    total: rawYeuCauData.summary?.total || 0,
    completed: rawYeuCauData.summary?.completed || 0,
    avgRating: rawYeuCauData.rating?.avgScore
      ? parseFloat(rawYeuCauData.rating.avgScore)
      : 0,
    yeuCau: rawYeuCauData.yeuCauList || [],
  };

  // Combine loading states
  const summaryLoading =
    congViecSummaryLoading?.other ||
    congViecSummaryLoading?.collab ||
    yeuCauSummaryLoading;

  // ========== Card Event Handlers ==========
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

  const handleViewYeuCau = (yeuCauId) => {
    if (!yeuCauId) return;
    window.open(`/ticket/${yeuCauId}`, "_blank", "noopener,noreferrer");
  };

  // ========== Loading State ==========

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!currentDanhGiaKPI && !isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <Alert severity="error">
          Không tìm thấy dữ liệu KPI. Vui lòng kiểm tra lại thông tin nhân viên
          và chu kỳ.
        </Alert>
      </Box>
    );
  }

  // ========== Render ==========

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* AppBar */}
      <AppBar position="sticky" color="default" elevation={1}>
        <Toolbar variant="dense" sx={{ minHeight: 48 }}>
          <IconButton
            edge="start"
            onClick={handleBack}
            size="small"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              Chấm điểm KPI {nhanVien ? `- ${nhanVien.Ten}` : ""}
            </Typography>
            {currentDanhGiaKPI?.ChuKyDanhGiaID && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <CalendarMonthIcon fontSize="small" color="action" />
                <Typography variant="caption" color="text.secondary">
                  {currentDanhGiaKPI.ChuKyDanhGiaID.TenChuKy}
                </Typography>
                {currentDanhGiaKPI.TrangThai === "DA_DUYET" && (
                  <Chip
                    size="small"
                    label="Đã duyệt"
                    color="success"
                    icon={<CheckCircleIcon />}
                  />
                )}
              </Stack>
            )}
          </Box>
          <IconButton onClick={() => setOpenHistory(true)}>
            <HistoryIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box sx={{ px: 2, py: 1.5 }}>
        {/* Progress Section */}
        <Paper sx={{ p: 1.5, mb: 1.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={0.5}
          >
            <Typography variant="body2" fontWeight={600}>
              Tiến độ chấm điểm
            </Typography>
            <Typography variant="subtitle1" color="primary">
              {progress.percentage}% ({progress.scored}/{progress.total} nhiệm
              vụ)
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={progress.percentage}
            sx={{ height: 8, borderRadius: 4 }}
          />
          {/* Total score preview */}
          <Box
            mt={1}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="caption" color="text.secondary">
              Tổng điểm KPI dự kiến:
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {totalKPIScore?.toFixed(1) || "--"}
            </Typography>
          </Box>
        </Paper>

        {/* Alerts */}
        {unscoredTasks.length > 0 && isEditable && (
          <Alert severity="warning" sx={{ mb: 1.5 }} icon={<WarningIcon />}>
            Còn {unscoredTasks.length} nhiệm vụ chưa chấm điểm:{" "}
            {unscoredTasks
              .slice(0, 3)
              .map((nv) => nv.NhiemVuThuongQuyID?.TenNhiemVu)
              .join(", ")}
            {unscoredTasks.length > 3 &&
              ` và ${unscoredTasks.length - 3} nhiệm vụ khác`}
          </Alert>
        )}

        {syncWarning && (
          <Alert
            severity="info"
            sx={{ mb: 1.5 }}
            action={
              <Stack direction="row" spacing={1}>
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => dispatch(clearSyncWarning())}
                >
                  Bỏ qua
                </Button>
                <Button
                  color="inherit"
                  size="small"
                  startIcon={<SyncIcon />}
                  onClick={handleResetCriteria}
                >
                  Đồng bộ
                </Button>
              </Stack>
            }
          >
            {typeof syncWarning === "string"
              ? syncWarning
              : "Phát hiện thay đổi tiêu chí chấm điểm. Nhấn \u0110ồng bộ để cập nhật."}
          </Alert>
        )}

        {/* Scoring Table */}
        <Paper sx={{ mb: 1.5, overflow: "hidden" }}>
          <ChamDiemKPITable
            nhiemVuList={currentNhiemVuList}
            onScoreChange={handleScoreChange}
            onQuickScoreAll={handleQuickScoreAll}
            readOnly={!isEditable}
            diemTuDanhGiaMap={diemTuDanhGiaMap}
            nhanVienID={nhanVienId}
            chuKyDanhGiaID={chuKyId}
          />
        </Paper>

        {/* Compact Cards Section */}
        <Typography variant="subtitle1" fontWeight={600} gutterBottom>
          Thông tin liên quan
        </Typography>
        <Stack spacing={1.5} sx={{ mb: 1.5 }}>
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
            error={null}
            showNguoiChinh={false}
          />

          {/* Card 2: Công việc gán NVTQ chu kỳ cũ */}
          <CrossCycleTasksCompactCard
            total={crossCycleData.total}
            completed={crossCycleData.completed}
            late={crossCycleData.late}
            active={crossCycleData.active}
            tasks={crossCycleData.tasks}
            onViewTask={handleViewTask}
            onOpenNewTab={handleOpenNewTab}
            isLoading={summaryLoading}
            error={null}
          />

          {/* Card 3: Công việc phối hợp */}
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
            error={null}
            showNguoiChinh={true}
          />

          {/* Card 4: Yêu cầu khác */}
          <YeuCauCompactCard
            title="Yêu cầu khác"
            icon="🎫"
            color="info.main"
            total={otherYeuCauData.total}
            completed={otherYeuCauData.completed}
            avgRating={otherYeuCauData.avgRating}
            yeuCau={otherYeuCauData.yeuCau}
            onViewYeuCau={handleViewYeuCau}
            isLoading={summaryLoading}
            error={null}
          />
        </Stack>
      </Box>

      {/* Sticky Footer */}
      <Paper
        elevation={3}
        sx={{
          position: "sticky",
          bottom: 0,
          left: 0,
          right: 0,
          px: 2,
          py: 1,
          bgcolor: "background.paper",
          borderTop: 1,
          borderColor: "divider",
          zIndex: 1000,
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          alignItems="center"
        >
          {/* Undo button (if approved) */}
          {(() => {
            console.log("🔍 DEBUG render Undo button:", {
              TrangThai: currentDanhGiaKPI?.TrangThai,
              canUndoAllowed: canUndoApproval.allowed,
              canUndoReason: canUndoApproval.reason,
              shouldShow:
                currentDanhGiaKPI?.TrangThai === "DA_DUYET" &&
                canUndoApproval.allowed,
            });
            return null;
          })()}
          {currentDanhGiaKPI?.TrangThai === "DA_DUYET" &&
            canUndoApproval.allowed && (
              <Button
                variant="outlined"
                color="warning"
                startIcon={<UndoIcon />}
                onClick={handleOpenUndoDialog}
              >
                Hủy duyệt
              </Button>
            )}

          {/* Save draft button */}
          {isEditable && (
            <LoadingButton
              variant="outlined"
              startIcon={<SaveIcon />}
              loading={isSaving}
              onClick={handleSave}
            >
              Lưu nháp
            </LoadingButton>
          )}

          {/* Approve button */}
          {isEditable && (
            <LoadingButton
              variant="contained"
              color="success"
              startIcon={<CheckCircleIcon />}
              loading={isSaving}
              disabled={!canApprove}
              onClick={handleApprove}
            >
              Duyệt KPI
            </LoadingButton>
          )}

          {/* Read-only indicator */}
          {!isEditable && currentDanhGiaKPI?.TrangThai !== "DA_DUYET" && (
            <Chip label="Chế độ xem" color="default" />
          )}
        </Stack>
      </Paper>

      {/* Dialogs */}
      {/* ========== UNDO CONFIRMATION DIALOG ========== */}
      <Dialog
        open={openUndoDialog}
        onClose={() => setOpenUndoDialog(false)}
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
              {nhanVien?.Ten}
            </Typography>
            {currentDanhGiaKPI?.ChuKyDanhGiaID && (
              <Typography variant="body2" color="text.secondary">
                {currentDanhGiaKPI.ChuKyDanhGiaID.TenChuKy}
              </Typography>
            )}
            <Typography variant="body2" color="success.main" fontWeight="600">
              Điểm hiện tại: {totalKPIScore?.toFixed(1)}
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
            onClick={() => setOpenUndoDialog(false)}
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

      {/* History Dialog */}
      <KPIHistoryDialog
        open={openHistory}
        onClose={() => setOpenHistory(false)}
        currentDanhGiaKPI={currentDanhGiaKPI}
        isApproved={currentDanhGiaKPI?.TrangThai === "DA_DUYET"}
      />

      {/* Task Detail Dialog */}
      <CongViecDetailDialog
        open={openTaskDetail}
        onClose={() => {
          setOpenTaskDetail(false);
          setSelectedTaskId(null);
        }}
        congViecId={selectedTaskId}
      />
    </Box>
  );
}

export default ChamDiemKPIPage;
