/**
 * ChamDiemKPIMobile - Mobile page for KPI scoring
 *
 * Route: /quanlycongviec/kpi/cham-diem/:nhanVienId?chuky=:chuKyId
 *
 * This is a mobile-optimized page component for KPI scoring.
 * Pattern follows CongViecDetailMobile.js
 *
 * Features:
 * - MobileDetailLayout with sticky header
 * - Tab-based navigation with SwipeableViews
 * - Card-based scoring (instead of table)
 * - Touch-friendly inputs (48px+ height)
 * - Sticky footer with actions
 * - Pull-to-refresh support
 *
 * @component
 */
import React, { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Chip,
  Stack,
  Card,
  CardContent,
  Collapse,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Slider,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  AppBar,
  Toolbar,
  Paper,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SaveIcon from "@mui/icons-material/Save";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HistoryIcon from "@mui/icons-material/History";
import UndoIcon from "@mui/icons-material/Undo";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import TaskIcon from "@mui/icons-material/Task";
import RequestPageIcon from "@mui/icons-material/RequestPage";
import GradingIcon from "@mui/icons-material/Grading";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Badge from "@mui/material/Badge";
import SwipeableViews from "react-swipeable-views";
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
  fetchCongViecDashboard,
} from "../kpiSlice";
import {
  fetchOtherTasksSummary,
  fetchCollabTasksSummary,
  fetchCrossCycleTasksSummary,
  getCongViecDetail,
} from "../../CongViec/congViecSlice";
import {
  fetchOtherYeuCauSummary,
  fetchYeuCauCounts,
} from "../../Ticket/yeuCauSlice";

// Reuse existing components
import KPIHistoryDialog from "../v2/components/KPIHistoryDialog";
import CongViecCompactCard from "../v2/components/CongViecCompactCard";
import CrossCycleTasksCompactCard from "../v2/components/CrossCycleTasksCompactCard";
import YeuCauCompactCard from "../v2/components/YeuCauCompactCard";
import CongViecDetailDialog from "../../CongViec/CongViecDetailDialog";

// ✅ Per-NVTQ Dashboard components
import CongViecDashboard from "../v2/components/dashboard/CongViecDashboard";
import YeuCauDashboard from "../v2/components/dashboard/YeuCauDashboard";

// Calculation utilities
import {
  calculateTotalScore,
  calculateNhiemVuScore,
} from "../../../../utils/kpiCalculation";

// Auth hook
import useAuth from "../../../../hooks/useAuth";

/**
 * KPIScoringCardMobile - Mobile scoring card for each nhiệm vụ
 * @param {Object} nhiemVu - DanhGiaNhiemVuThuongQuy object
 * @param {Function} onScoreChange - Score change handler
 * @param {boolean} isEditable - Whether scoring is enabled
 * @param {number|null} taskCount - Number of tasks for this NVTQ (null = loading)
 * @param {number} yeuCauCount - Number of yeuCau for this NVTQ
 * @param {boolean} yeuCauLoading - Whether yeuCau count is loading
 * @param {Function} onOpenDashboard - Handler to open dashboard BottomSheet
 */
function KPIScoringCardMobile({
  nhiemVu,
  onScoreChange,
  isEditable,
  taskCount = 0,
  yeuCauCount = 0,
  yeuCauLoading = false,
  onOpenDashboard,
}) {
  const [expanded, setExpanded] = useState(false);

  // Calculate progress for this nhiệm vụ
  const scoredCount =
    nhiemVu.ChiTietDiem?.filter((tc) => tc.DiemDat != null && tc.DiemDat !== "")
      .length || 0;
  const totalCriteria = nhiemVu.ChiTietDiem?.length || 0;
  const progressPercent =
    totalCriteria > 0 ? Math.round((scoredCount / totalCriteria) * 100) : 0;

  // Calculate nhiệm vụ score
  const nhiemVuScore = useMemo(() => {
    const { diemNhiemVu } = calculateNhiemVuScore(
      nhiemVu,
      nhiemVu.DiemTuDanhGia || 0,
    );
    return diemNhiemVu;
  }, [nhiemVu]);

  const isComplete = progressPercent === 100;

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: isComplete
          ? "success.main"
          : progressPercent > 0
            ? "warning.main"
            : "grey.300",
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Header: Tên nhiệm vụ + Score indicator */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{ flex: 1, pr: 1 }}
          >
            {nhiemVu.NhiemVuThuongQuyID?.TenNhiemVu || "Nhiệm vụ"}
          </Typography>
          <Chip
            label={nhiemVuScore ? nhiemVuScore.toFixed(1) : "--"}
            color={isComplete ? "success" : "default"}
            size="small"
          />
        </Box>

        {/* Stats row */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}
        >
          <Chip
            size="small"
            variant="outlined"
            label={`Tự ĐG: ${nhiemVu.DiemTuDanhGia != null ? nhiemVu.DiemTuDanhGia + "%" : "--"}`}
          />
          <Chip
            size="small"
            variant="outlined"
            label={`Độ khó: ${nhiemVu.MucDoKho || "--"}`}
          />
          {isComplete && (
            <Chip
              size="small"
              color="success"
              icon={<CheckCircleIcon />}
              label="Hoàn thành"
            />
          )}
        </Stack>

        {/* ✅ Per-NVTQ Dashboard badges - clickable to open BottomSheet */}
        <Stack
          direction="row"
          spacing={1}
          sx={{ mt: 1, flexWrap: "wrap", gap: 0.5 }}
        >
          {/* Task count badge */}
          <Chip
            size="small"
            icon={
              <TaskIcon
                sx={{
                  fontSize: 18,
                  color: taskCount > 0 ? "#fff" : "#1976d2",
                }}
              />
            }
            label={taskCount === null ? "..." : `${taskCount} CV`}
            onClick={() => onOpenDashboard?.(nhiemVu, 0)}
            sx={{
              cursor: onOpenDashboard ? "pointer" : "default",
              bgcolor: taskCount > 0 ? "#1976d2" : "rgba(25, 118, 210, 0.1)",
              color: taskCount > 0 ? "white" : "#1976d2",
              fontWeight: 700,
              fontSize: "0.8125rem",
              border: taskCount > 0 ? "none" : "1.5px solid #1976d2",
              "&:hover": {
                bgcolor: taskCount > 0 ? "#1565c0" : "rgba(25, 118, 210, 0.2)",
              },
            }}
          />
          {/* YeuCau count badge */}
          <Chip
            size="small"
            icon={
              <RequestPageIcon
                sx={{
                  fontSize: 18,
                  color: yeuCauCount > 0 ? "#fff" : "#9c27b0",
                }}
              />
            }
            label={yeuCauLoading ? "..." : `${yeuCauCount} YC`}
            onClick={() => onOpenDashboard?.(nhiemVu, 1)}
            sx={{
              cursor: onOpenDashboard ? "pointer" : "default",
              bgcolor: yeuCauCount > 0 ? "#9c27b0" : "rgba(156, 39, 176, 0.1)",
              color: yeuCauCount > 0 ? "white" : "#9c27b0",
              fontWeight: 700,
              fontSize: "0.8125rem",
              border: yeuCauCount > 0 ? "none" : "1.5px solid #9c27b0",
              "&:hover": {
                bgcolor:
                  yeuCauCount > 0 ? "#7b1fa2" : "rgba(156, 39, 176, 0.2)",
              },
            }}
          />
        </Stack>

        {/* Progress bar */}
        <Box sx={{ mt: 1.5 }}>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" color="text.secondary">
              Tiến độ chấm điểm
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {scoredCount}/{totalCriteria} tiêu chí
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 6, borderRadius: 3 }}
            color={isComplete ? "success" : "primary"}
          />
        </Box>

        {/* Expand button */}
        <Button
          fullWidth
          size="small"
          onClick={() => setExpanded(!expanded)}
          endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          sx={{ mt: 1 }}
        >
          {expanded ? "Thu gọn" : "Chấm điểm chi tiết"}
        </Button>

        {/* Expanded: Criteria scoring */}
        <Collapse in={expanded}>
          <Divider sx={{ my: 1.5 }} />
          {nhiemVu.ChiTietDiem?.map((tieuChi, index) => (
            <Box key={tieuChi.TieuChiID || index} sx={{ mb: 2.5 }}>
              <Typography variant="body2" fontWeight={500} gutterBottom>
                {tieuChi.TenTieuChi || `Tiêu chí ${index + 1}`}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                mb={1}
              >
                Khoảng điểm: {tieuChi.GiaTriMin || 0} -{" "}
                {tieuChi.GiaTriMax || 100}
              </Typography>

              <Stack direction="row" spacing={2} alignItems="center">
                <Slider
                  value={tieuChi.DiemDat != null ? Number(tieuChi.DiemDat) : 0}
                  onChange={(e, val) => onScoreChange(nhiemVu._id, index, val)}
                  min={tieuChi.GiaTriMin || 0}
                  max={tieuChi.GiaTriMax || 100}
                  disabled={!isEditable}
                  sx={{
                    flex: 1,
                    "& .MuiSlider-thumb": {
                      backgroundColor: !isEditable ? "#1976d2" : undefined,
                    },
                    "& .MuiSlider-track": {
                      backgroundColor: !isEditable ? "#1976d2" : undefined,
                      opacity: !isEditable ? 0.8 : undefined,
                    },
                    "& .MuiSlider-rail": {
                      opacity: !isEditable ? 0.5 : undefined,
                    },
                  }}
                  valueLabelDisplay="auto"
                />
                <TextField
                  type="number"
                  value={tieuChi.DiemDat != null ? tieuChi.DiemDat : ""}
                  onChange={(e) => {
                    const val =
                      e.target.value === "" ? null : Number(e.target.value);
                    onScoreChange(nhiemVu._id, index, val);
                  }}
                  disabled={!isEditable}
                  sx={{
                    width: 80,
                    "& .MuiInputBase-input.Mui-disabled": {
                      WebkitTextFillColor: "#1976d2",
                      fontWeight: 600,
                      opacity: 1,
                    },
                  }}
                  inputProps={{
                    min: tieuChi.GiaTriMin || 0,
                    max: tieuChi.GiaTriMax || 100,
                    style: {
                      textAlign: "center",
                      fontSize: 16,
                      padding: "12px 8px",
                    },
                  }}
                  size="small"
                />
              </Stack>
            </Box>
          ))}
        </Collapse>
      </CardContent>
    </Card>
  );
}

/**
 * ChamDiemKPIMobile Component
 */
function ChamDiemKPIMobile() {
  const { nhanVienId } = useParams();
  const [searchParams] = useSearchParams();
  const chuKyId = searchParams.get("chuky");
  const readOnly = searchParams.get("readonly") === "true";
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
    congViecDashboard = {}, // ✅ Per-NVTQ dashboard data
  } = useSelector((state) => state.kpi);

  // Compact card summaries
  const {
    otherTasksSummary = {},
    collabTasksSummary = {},
    crossCycleTasksSummary = {},
    summaryLoading: congViecSummaryLoading = {},
  } = useSelector((state) => state.congViec || {});

  const {
    otherYeuCauSummary = {},
    summaryLoading: yeuCauSummaryLoading = false,
    yeuCauCounts = {}, // ✅ Per-NVTQ yeuCau counts
  } = useSelector((state) => state.yeuCau || {});

  // Local UI state
  const [activeTab, setActiveTab] = useState(0);
  const [openUndoDialog, setOpenUndoDialog] = useState(false);
  const [undoReason, setUndoReason] = useState("");
  const [openHistory, setOpenHistory] = useState(false);

  // Task detail dialog state
  const [openTaskDetail, setOpenTaskDetail] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  // ✅ Per-NVTQ BottomSheet dashboard state
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [selectedNhiemVu, setSelectedNhiemVu] = useState(null);
  const [dashboardTab, setDashboardTab] = useState(0);

  // ========== Data Loading ==========

  useEffect(() => {
    if (nhanVienId && chuKyId) {
      dispatch(getChamDiemDetail(chuKyId, nhanVienId));
    }
    return () => {
      dispatch(clearCurrentChamDiem());
    };
  }, [nhanVienId, chuKyId, dispatch]);

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

  // ✅ Per-NVTQ: Prefetch dashboard data for all duties
  useEffect(() => {
    if (nhanVienId && chuKyId && currentNhiemVuList.length > 0) {
      currentNhiemVuList.forEach((nv) => {
        const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
        if (nvId) {
          const key = `${nvId}_${chuKyId}`;
          // Only fetch if not already loaded/loading
          if (!congViecDashboard[key]) {
            dispatch(
              fetchCongViecDashboard({
                nhiemVuThuongQuyID: nvId,
                nhanVienID: nhanVienId,
                chuKyDanhGiaID: chuKyId,
              }),
            );
          }
        }
      });
    }
  }, [nhanVienId, chuKyId, currentNhiemVuList, dispatch, congViecDashboard]);

  // ✅ Per-NVTQ: Fetch YeuCau counts for badge display
  const yeuCauCountsKey = `${chuKyId}_${nhanVienId}`;
  const yeuCauCountsState = yeuCauCounts[yeuCauCountsKey];

  useEffect(() => {
    if (
      currentNhiemVuList.length > 0 &&
      nhanVienId &&
      chuKyId &&
      !yeuCauCountsState?.data &&
      !yeuCauCountsState?.isLoading
    ) {
      const nhiemVuThuongQuyIDs = currentNhiemVuList.map(
        (nv) => nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID,
      );
      if (nhiemVuThuongQuyIDs.length > 0) {
        dispatch(
          fetchYeuCauCounts({
            nhiemVuThuongQuyIDs,
            nhanVienID: nhanVienId,
            chuKyDanhGiaID: chuKyId,
          }),
        );
      }
    }
  }, [currentNhiemVuList, nhanVienId, chuKyId, dispatch, yeuCauCountsState]);

  // ========== Computed Values ==========

  const nhanVien = useMemo(() => {
    return currentDanhGiaKPI?.NhanVienID || null;
  }, [currentDanhGiaKPI]);

  const isEditable = useMemo(() => {
    if (readOnly) return false;
    if (!currentDanhGiaKPI) return false;
    return currentDanhGiaKPI.TrangThai !== "DA_DUYET";
  }, [readOnly, currentDanhGiaKPI]);

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

  // ✅ Per-NVTQ: Create TaskCount map from dashboard data
  const taskCountMap = useMemo(() => {
    const map = {};
    currentNhiemVuList.forEach((nv) => {
      const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
      if (nvId) {
        const key = `${nvId}_${chuKyId}`;
        const dashboard = congViecDashboard[key];
        if (dashboard?.data) {
          map[nvId] = dashboard.data.summary?.total || 0;
        } else if (dashboard?.isLoading) {
          map[nvId] = null; // null = đang tải
        } else {
          map[nvId] = 0; // default 0 if no data
        }
      }
    });
    return map;
  }, [congViecDashboard, currentNhiemVuList, chuKyId]);

  // ✅ Per-NVTQ: Create YeuCauCount map from fetched counts
  const yeuCauCountMap = useMemo(() => {
    if (yeuCauCountsState?.data && typeof yeuCauCountsState.data === "object") {
      return yeuCauCountsState.data; // Already in { nvtqID: count } format
    }
    return {};
  }, [yeuCauCountsState]);

  // Build DiemTuDanhGia map from nhiemVuList
  const diemTuDanhGiaMap = useMemo(() => {
    const map = {};
    currentNhiemVuList.forEach((nv) => {
      const nvId = nv.NhiemVuThuongQuyID?._id || nv.NhiemVuThuongQuyID;
      map[nvId?.toString()] = nv.DiemTuDanhGia || 0;
    });
    return map;
  }, [currentNhiemVuList]);

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

  const canApprove = useMemo(() => {
    return progress.percentage === 100 && currentDanhGiaKPI && isEditable;
  }, [progress.percentage, currentDanhGiaKPI, isEditable]);

  const canUndoApproval = useMemo(() => {
    // ✅ Security check: Không cho phép hủy duyệt trong chế độ readonly
    if (readOnly) {
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

  // Unscored tasks
  const unscoredTasks = useMemo(() => {
    return currentNhiemVuList.filter((nv) => {
      return !nv.ChiTietDiem?.some((tc) => tc.DiemDat > 0);
    });
  }, [currentNhiemVuList]);

  // ========== Handlers ==========

  const handleBack = () => {
    dispatch(clearCurrentChamDiem());
    navigate(-1);
  };

  // ✅ UPDATED: Support fieldName for IsMucDoHoanThanh
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
      toast.warning("Vui lòng chấm điểm tất cả nhiệm vụ");
      return;
    }
    try {
      await dispatch(approveKPI(currentDanhGiaKPI._id));
      toast.success("Đã duyệt KPI!");
    } catch (error) {
      toast.error("Lỗi: " + error.message);
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

  // ✅ Per-NVTQ: Handler to open BottomSheet dashboard
  const handleOpenDashboard = (nhiemVu, tabIndex = 0) => {
    setSelectedNhiemVu(nhiemVu);
    setDashboardTab(tabIndex);
    setDashboardOpen(true);
  };

  const handleCloseDashboard = () => {
    setDashboardOpen(false);
    setSelectedNhiemVu(null);
    setDashboardTab(0);
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

  const rawYeuCauData = otherYeuCauSummary[key]?.data || {};
  const otherYeuCauData = {
    total: rawYeuCauData.summary?.total || 0,
    completed: rawYeuCauData.summary?.completed || 0,
    avgRating: rawYeuCauData.rating?.avgScore
      ? parseFloat(rawYeuCauData.rating.avgScore)
      : 0,
    yeuCau: rawYeuCauData.yeuCauList || [],
  };

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

  const handleRefresh = async () => {
    if (nhanVienId && chuKyId) {
      await dispatch(getChamDiemDetail(chuKyId, nhanVienId));
    }
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
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          bgcolor: "background.default",
        }}
      >
        <AppBar
          position="sticky"
          sx={{
            bgcolor: "#1939B7",
            boxShadow: 2,
            pt: "env(safe-area-inset-top, 0px)",
          }}
        >
          <Toolbar variant="dense" sx={{ minHeight: 56, px: 1 }}>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBack}
              size="small"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="subtitle2"
              sx={{ flex: 1, ml: 1, fontWeight: 600 }}
            >
              Chấm điểm KPI
            </Typography>
          </Toolbar>
        </AppBar>
        <Box sx={{ p: 2 }}>
          <Alert severity="error">Không tìm thấy dữ liệu KPI</Alert>
        </Box>
      </Box>
    );
  }

  // ========== Footer Actions ==========

  const footerContent = (
    <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
      {currentDanhGiaKPI?.TrangThai === "DA_DUYET" &&
      canUndoApproval.allowed ? (
        <Button
          variant="outlined"
          color="warning"
          startIcon={<UndoIcon />}
          onClick={handleOpenUndoDialog}
          sx={{ flex: 1 }}
        >
          Hủy duyệt
        </Button>
      ) : null}

      {isEditable && (
        <>
          <LoadingButton
            variant="outlined"
            startIcon={<SaveIcon />}
            loading={isSaving}
            onClick={handleSave}
            sx={{ flex: 1 }}
          >
            Lưu nháp
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="success"
            startIcon={<CheckCircleIcon />}
            loading={isSaving}
            disabled={!canApprove}
            onClick={handleApprove}
            sx={{ flex: 1 }}
          >
            Duyệt
          </LoadingButton>
        </>
      )}
    </Stack>
  );

  // ========== Render ==========

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* 📱 Mobile Header - Compact AppBar */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#1939B7",
          boxShadow: 2,
          pt: "env(safe-area-inset-top, 0px)",
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 56, px: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1, mx: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              Chấm điểm KPI{nhanVien ? ` - ${nhanVien.Ten}` : ""}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ opacity: 0.9, display: "block", lineHeight: 1.2 }}
            >
              {currentDanhGiaKPI?.ChuKyDanhGiaID?.TenChuKy || "..."}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={() => setOpenHistory(true)}
            size="small"
          >
            <HistoryIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Progress Summary - Compact */}
      <Paper
        square
        elevation={1}
        sx={{
          px: 1.5,
          py: 1,
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={0.75}
        >
          <Typography variant="caption" color="text.secondary">
            {progress.scored}/{progress.total} nhiệm vụ
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary">
            {totalKPIScore?.toFixed(1) || "--"}đ
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progress.percentage}
          sx={{ height: 6, borderRadius: 3 }}
        />
        {currentDanhGiaKPI?.TrangThai === "DA_DUYET" && (
          <Chip
            size="small"
            color="success"
            icon={<CheckCircleIcon />}
            label="Đã duyệt"
            sx={{ mt: 0.75 }}
          />
        )}

        {/* Warnings - Compact */}
        {unscoredTasks.length > 0 && isEditable && (
          <Alert severity="warning" sx={{ mt: 1, py: 0.5 }} icon={false}>
            <Typography variant="caption">
              Còn {unscoredTasks.length} nhiệm vụ chưa chấm
            </Typography>
          </Alert>
        )}

        {syncWarning && syncWarning.hasChanges && (
          <Alert
            severity="info"
            sx={{ mt: 1, py: 0.5 }}
            action={
              <Stack direction="row" spacing={0.5}>
                <Button
                  size="small"
                  color="inherit"
                  onClick={() => dispatch(clearSyncWarning())}
                  sx={{ fontSize: "0.7rem", py: 0 }}
                >
                  Bỏ qua
                </Button>
                {syncWarning.canReset && (
                  <Button
                    size="small"
                    color="inherit"
                    onClick={handleResetCriteria}
                    sx={{ fontSize: "0.7rem", py: 0 }}
                  >
                    Đồng bộ
                  </Button>
                )}
              </Stack>
            }
          >
            <Typography variant="caption">Thay đổi tiêu chí</Typography>
          </Alert>
        )}
      </Paper>

      {/* 📑 Tab Navigation - Compact */}
      <Paper square elevation={1}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              minHeight: 48,
              minWidth: "auto",
              px: 2,
              fontSize: "0.8125rem",
            },
          }}
        >
          <Tab
            icon={<GradingIcon fontSize="small" />}
            label="Chấm điểm"
            iconPosition="start"
          />
          <Tab
            icon={<TaskIcon fontSize="small" sx={{ color: "#1976d2" }} />}
            label="Công việc khác"
            iconPosition="start"
            sx={{
              "&.Mui-selected": {
                color: "#1976d2",
                fontWeight: 600,
              },
            }}
          />
          <Tab
            icon={
              <RequestPageIcon fontSize="small" sx={{ color: "#9c27b0" }} />
            }
            label="Yêu cầu khác"
            iconPosition="start"
            sx={{
              "&.Mui-selected": {
                color: "#9c27b0",
                fontWeight: 600,
              },
            }}
          />
        </Tabs>
      </Paper>

      {/* 📄 Tab Content with SwipeableViews */}
      <Box
        sx={{
          flex: 1,
          overflow: "hidden",
          pb: footerContent
            ? "calc(72px + env(safe-area-inset-bottom, 0px))"
            : "env(safe-area-inset-bottom, 0px)",
        }}
      >
        <SwipeableViews
          index={activeTab}
          onChangeIndex={setActiveTab}
          resistance
          style={{ height: "100%" }}
          containerStyle={{ height: "100%" }}
        >
          {/* Tab 0: Scoring Cards */}
          <Box
            sx={{
              px: 1,
              py: 1,
              height: "100%",
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {currentNhiemVuList?.length === 0 ? (
              <Alert severity="info">
                Không có nhiệm vụ nào được giao trong chu kỳ này
              </Alert>
            ) : (
              currentNhiemVuList.map((nhiemVu) => {
                const nvId =
                  nhiemVu.NhiemVuThuongQuyID?._id || nhiemVu.NhiemVuThuongQuyID;
                return (
                  <KPIScoringCardMobile
                    key={nhiemVu._id}
                    nhiemVu={nhiemVu}
                    onScoreChange={handleScoreChange}
                    isEditable={isEditable}
                    taskCount={taskCountMap[nvId]}
                    yeuCauCount={yeuCauCountMap[nvId] || 0}
                    yeuCauLoading={yeuCauCountsState?.isLoading}
                    onOpenDashboard={handleOpenDashboard}
                  />
                );
              })
            )}
          </Box>

          {/* Tab 1: CongViec Summary */}
          <Box
            sx={{
              px: 1,
              py: 1,
              height: "100%",
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
            <Stack spacing={1.5}>
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
            </Stack>
          </Box>

          {/* Tab 2: YeuCau Summary */}
          <Box
            sx={{
              px: 1,
              py: 1,
              height: "100%",
              overflow: "auto",
              WebkitOverflowScrolling: "touch",
            }}
          >
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
          </Box>
        </SwipeableViews>
      </Box>

      {/* Sticky Footer Actions */}
      {footerContent && (
        <Paper
          square
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 1.5,
            pb: "calc(env(safe-area-inset-bottom, 0px) + 12px)",
            borderTop: 1,
            borderColor: "divider",
            zIndex: 1200,
          }}
        >
          {footerContent}
        </Paper>
      )}

      {/* Undo Dialog */}
      <Dialog
        open={openUndoDialog}
        onClose={() => setOpenUndoDialog(false)}
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Xác Nhận Hủy Duyệt KPI
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="600" gutterBottom>
              ⚠️ Hành động này sẽ:
            </Typography>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li>Đưa KPI về trạng thái Chưa duyệt</li>
              <li>Cho phép chỉnh sửa lại điểm số</li>
              <li>Lưu lại lịch sử hủy duyệt</li>
            </ul>
          </Alert>

          {/* KPI info */}
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              mb: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
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

          {/* Manager permission info */}
          {canUndoApproval.isManager && (
            <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
              <Typography variant="caption">
                💡 Quản lý KPI chỉ có thể hủy duyệt trong vòng 7 ngày.
                <br />
                Còn lại: <strong>{canUndoApproval.daysRemaining} ngày</strong>
              </Typography>
            </Alert>
          )}

          <TextField
            autoFocus
            fullWidth
            multiline
            rows={3}
            placeholder="Nhập lý do hủy duyệt... (ít nhất 10 ký tự)"
            value={undoReason}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setUndoReason(e.target.value);
              }
            }}
            helperText={`${undoReason.length}/500 ký tự`}
          />
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 2 }}>
          <Button onClick={() => setOpenUndoDialog(false)}>Hủy bỏ</Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isSaving}
            onClick={handleConfirmUndo}
            disabled={undoReason.trim().length < 10 || isSaving}
          >
            Xác nhận hủy duyệt
          </LoadingButton>
        </DialogActions>
      </Dialog>

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

      {/* ✅ Per-NVTQ Dashboard - FULLSCREEN MODE (100vh) */}
      {dashboardOpen && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: "100vh",
            bgcolor: "background.default",
            zIndex: 1300,
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* 📱 Compact AppBar Header */}
          <AppBar
            position="sticky"
            sx={{
              bgcolor: "#6366f1",
              boxShadow: 2,
              pt: "env(safe-area-inset-top, 0px)",
            }}
          >
            <Toolbar variant="dense" sx={{ minHeight: 56, px: 1 }}>
              <IconButton
                edge="start"
                color="inherit"
                onClick={handleCloseDashboard}
                size="small"
              >
                <ArrowBackIcon />
              </IconButton>
              <Box sx={{ flex: 1, mx: 1, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  noWrap
                  sx={{ fontWeight: 600, fontSize: "0.9rem" }}
                >
                  {selectedNhiemVu?.NhiemVuThuongQuyID?.TenNhiemVu ||
                    "Nhiệm vụ"}
                </Typography>
              </Box>
            </Toolbar>
          </AppBar>

          {/* 📑 Icon-Only Tabs with Badge Counts */}
          <Paper square elevation={1}>
            <Tabs
              value={dashboardTab}
              onChange={(e, v) => setDashboardTab(v)}
              variant="fullWidth"
              sx={{
                minWidth: "auto",
                px: 2,
              }}
            >
              <Tab
                icon={
                  <Badge
                    badgeContent={
                      taskCountMap[
                        selectedNhiemVu?.NhiemVuThuongQuyID?._id ||
                          selectedNhiemVu?.NhiemVuThuongQuyID
                      ] || 0
                    }
                    color="primary"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        minWidth: 20,
                        height: 20,
                        backgroundColor: "#1976d2",
                        color: "#fff",
                      },
                    }}
                  >
                    <TaskIcon fontSize="small" sx={{ color: "#1976d2" }} />
                  </Badge>
                }
                sx={{
                  "&.Mui-selected": {
                    "& .MuiSvgIcon-root": {
                      color: "#1976d2",
                    },
                  },
                }}
              />
              <Tab
                icon={
                  <Badge
                    badgeContent={
                      yeuCauCountMap[
                        selectedNhiemVu?.NhiemVuThuongQuyID?._id ||
                          selectedNhiemVu?.NhiemVuThuongQuyID
                      ] || 0
                    }
                    color="secondary"
                    max={99}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        minWidth: 20,
                        height: 20,
                        backgroundColor: "#9c27b0",
                        color: "#fff",
                      },
                    }}
                  >
                    <RequestPageIcon
                      fontSize="small"
                      sx={{ color: "#9c27b0" }}
                    />
                  </Badge>
                }
                sx={{
                  "&.Mui-selected": {
                    "& .MuiSvgIcon-root": {
                      color: "#9c27b0",
                    },
                  },
                }}
              />
            </Tabs>
          </Paper>

          {/* 📄 Dashboard Content with SwipeableViews */}
          <Box
            sx={{
              flex: 1,
              overflow: "hidden",
              pb: "calc(env(safe-area-inset-bottom, 0px) + 8px)",
            }}
          >
            <SwipeableViews
              index={dashboardTab}
              onChangeIndex={setDashboardTab}
              resistance
              style={{ height: "100%" }}
              containerStyle={{ height: "100%" }}
            >
              {/* Tab 0: CongViecDashboard */}
              <Box
                sx={{
                  px: 0.5,
                  py: 0,
                  height: "100%",
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {selectedNhiemVu && (
                  <CongViecDashboard
                    nhiemVuThuongQuyID={
                      selectedNhiemVu.NhiemVuThuongQuyID?._id ||
                      selectedNhiemVu.NhiemVuThuongQuyID
                    }
                    nhanVienID={nhanVienId}
                    chuKyDanhGiaID={chuKyId}
                    open={dashboardOpen && dashboardTab === 0}
                    onViewTask={handleViewTask}
                    isMobile
                  />
                )}
              </Box>

              {/* Tab 1: YeuCauDashboard */}
              <Box
                sx={{
                  px: 0.5,
                  py: 0,
                  height: "100%",
                  overflow: "auto",
                  WebkitOverflowScrolling: "touch",
                }}
              >
                {selectedNhiemVu && (
                  <YeuCauDashboard
                    nhiemVuThuongQuyID={
                      selectedNhiemVu.NhiemVuThuongQuyID?._id ||
                      selectedNhiemVu.NhiemVuThuongQuyID
                    }
                    nhanVienID={nhanVienId}
                    chuKyDanhGiaID={chuKyId}
                    open={dashboardOpen && dashboardTab === 1}
                    onViewYeuCau={handleViewYeuCau}
                    isMobile
                  />
                )}
              </Box>
            </SwipeableViews>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default ChamDiemKPIMobile;
