import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  alpha,
  useTheme,
  Tooltip,
  Avatar,
  Badge as MuiBadge,
} from "@mui/material";
import {
  ArrowLeft,
  ContentCopy,
  Save,
  Delete,
  Add,
  CalendarMonth,
  Lock,
  CheckCircle,
  Warning,
  TrendingUp,
  Assignment,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import {
  getAssignmentsByCycle,
  batchUpdateCycleAssignments,
  copyFromPreviousCycle,
  addTaskLocally,
  removeTaskLocally,
  updateDifficultyLocally,
  setSelectedChuKy,
} from "./cycleAssignmentSlice";
import apiService from "../../../app/apiService";
import MainCard from "components/MainCard";
import MobileDetailLayout from "components/MobileDetailLayout";
import useMobileLayout from "hooks/useMobileLayout";

/**
 * CycleAssignmentDetailPage - Two-column layout for cycle-based task assignment
 * Purpose: Assign tasks to ONE specific employee for a selected cycle
 * Left: Available duties (checkboxes)
 * Right: Assigned tasks with inline difficulty editing
 */
const CycleAssignmentDetailPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const { isMobile } = useMobileLayout();
  const { NhanVienID } = useParams();
  const employeeId = NhanVienID; // Alias for consistency with backend calls

  // ✅ NEW: Read chuKyId from URL query params (passed from ListPage)
  const searchParams = new URLSearchParams(window.location.search);
  const chuKyIdFromUrl = searchParams.get("chuKyId");

  const {
    isLoading,
    isSaving,
    isCopying,
    assignedTasks,
    availableDuties,
    employee,
    selectedChuKyId,
    selectedChuKy, // ✅ NEW: Cycle info (with isDong)
    kpiStatus, // ✅ NEW: "CHUA_DUYET" | "DA_DUYET" | null
    managerScoresMap, // ✅ NEW: For pre-validation
  } = useSelector((state) => state.cycleAssignment);

  // 🔍 DEBUG: Log Redux state
  console.log("🔍 Redux cycleAssignment state:", {
    selectedChuKyId,
    kpiStatus,
    managerScoresMap,
    assignedTasksCount: assignedTasks?.length,
  });

  // Local state for cycle selector and copy dialog
  const [cycles, setCycles] = useState([]); // ✅ DEFENSIVE: Initialize as empty array
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [selectedCopyFromCycle, setSelectedCopyFromCycle] = useState("");

  // Local working copy of assigned tasks (for optimistic updates)
  const [workingTasks, setWorkingTasks] = useState([]);

  // ✅ DEFENSIVE: Ensure cycles is always an array
  const safeCycles = Array.isArray(cycles) ? cycles : [];

  // ✅ Get selected cycle info from local cycles state
  const selectedCycleInfo =
    safeCycles.find((c) => c._id === selectedChuKyId) || selectedChuKy;

  // Fetch cycles on mount
  useEffect(() => {
    const fetchCycles = async () => {
      setLoadingCycles(true);
      try {
        // ✅ FIX: Use correct backend endpoint
        const response = await apiService.get(
          "/workmanagement/chu-ky-danh-gia"
        );

        // 🔍 DEBUG: Log response to check format
        console.log("🔍 DEBUG Cycles API Response:", response.data);

        // ✅ DEFENSIVE: Handle backend response format
        const cyclesData = response.data.data;

        // Backend returns: { danhSach: [...], totalPages, currentPage, count }
        if (cyclesData && Array.isArray(cyclesData.danhSach)) {
          setCycles(cyclesData.danhSach);
          console.log("✅ Loaded cycles:", cyclesData.danhSach.length);
        } else if (Array.isArray(cyclesData)) {
          // Fallback: Direct array
          setCycles(cyclesData);
          console.log("✅ Loaded cycles (direct array):", cyclesData.length);
        } else {
          console.warn("⚠️ Cycles data is not in expected format:", cyclesData);
          setCycles([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch cycles:", error);
        toast.error("Không thể tải danh sách chu kỳ");
        setCycles([]); // ✅ Set empty array on error
      } finally {
        setLoadingCycles(false);
      }
    };
    fetchCycles();
  }, []);

  // ✅ NEW: Auto-set cycle from URL on mount
  useEffect(() => {
    if (chuKyIdFromUrl && !selectedChuKyId) {
      dispatch(setSelectedChuKy(chuKyIdFromUrl));
    }
  }, [chuKyIdFromUrl, selectedChuKyId, dispatch]);

  // Fetch assignments when cycle changes
  useEffect(() => {
    if (employeeId && selectedChuKyId) {
      dispatch(getAssignmentsByCycle(employeeId, selectedChuKyId));
    }
  }, [dispatch, employeeId, selectedChuKyId]);

  // Sync working tasks with Redux state
  useEffect(() => {
    setWorkingTasks(
      assignedTasks.map((t) => ({
        NhiemVuThuongQuyID: t.NhiemVuThuongQuyID._id,
        MucDoKho: t.MucDoKho || 5.0,
        DiemTuDanhGia: t.DiemTuDanhGia || 0, // ✅ FIX: Include self-assessment score
        _task: t.NhiemVuThuongQuyID, // Keep full object for display
      }))
    );
  }, [assignedTasks]);

  // ✅ NEW: Pre-validation helpers
  // Helper: chuẩn hóa lấy id nhiệm vụ dạng string
  const getDutyId = (raw) =>
    typeof raw === "string" ? raw : raw?._id || raw?.toString?.() || "";

  // Fallback: gọi BE kiểm tra nhanh nếu map chưa có
  const hasManagerScore = async (dutyId) => {
    const key = (getDutyId(dutyId) || "").toString();
    if (key && managerScoresMap && managerScoresMap[key]) return true;
    try {
      const res = await apiService.get(
        "/workmanagement/kpi/danh-gia-nhiem-vu/has-score",
        {
          params: {
            nhanVienId: employeeId,
            chuKyId: selectedChuKyId,
            nhiemVuId: key,
          },
        }
      );
      return !!res?.data?.data?.has;
    } catch (e) {
      console.warn("has-score fallback failed:", e);
      return false; // Không chặn lầm nếu lỗi mạng; BE sẽ chặn ở nút Lưu
    }
  };
  // Removed old canRemoveTask/canUpdateDifficulty; logic is in handlers with fallback API

  const getTaskName = (task) => {
    if (typeof task.NhiemVuThuongQuyID === "object") {
      return task.NhiemVuThuongQuyID.TenNhiemVu || "Không rõ";
    }
    return task._task?.TenNhiemVu || "Không rõ";
  };

  const handleCycleChange = (event) => {
    const newCycleId = event.target.value;
    dispatch(setSelectedChuKy(newCycleId));
  };

  const handleAddTask = (duty) => {
    const newTask = {
      NhiemVuThuongQuyID: duty._id,
      MucDoKho: duty.MucDoKhoDefault || 5.0,
      _task: duty,
    };
    setWorkingTasks([...workingTasks, newTask]);
    dispatch(addTaskLocally({ duty, mucDoKho: duty.MucDoKhoDefault || 5.0 }));
  };

  const handleRefresh = async () => {
    if (employeeId && selectedChuKyId) {
      await dispatch(getAssignmentsByCycle(employeeId, selectedChuKyId));
    }
  };

  const handleRemoveTask = async (dutyId) => {
    // ✅ PRE-VALIDATION: Check if task can be removed
    const dutyKey = getDutyId(dutyId);
    const task = workingTasks.find(
      (t) => getDutyId(t.NhiemVuThuongQuyID) === dutyKey
    );
    if (!task) return;

    // 🔍 DEBUG: Log validation data
    console.log("🔍 DEBUG handleRemoveTask:", {
      dutyId,
      task,
      managerScoresMap,
      hasManagerScore: managerScoresMap && managerScoresMap[dutyId],
    });

    // Check điểm tự đánh giá trước
    if (task.DiemTuDanhGia && task.DiemTuDanhGia > 0) {
      toast.error(
        `❌ Không thể xóa "${getTaskName(
          task
        )}"\n\nNhiệm vụ đã có điểm tự đánh giá (${
          task.DiemTuDanhGia
        } điểm)\nVui lòng nhân viên đưa điểm về 0 trên trang 'Tự đánh giá KPI' trước khi xóa.`,
        { autoClose: 6000 }
      );
      return;
    }

    // Check điểm quản lý chấm: dùng map trước, fallback gọi BE
    const mgr = await hasManagerScore(dutyKey);
    const validation = mgr
      ? {
          allowed: false,
          reason: "Nhiệm vụ đã có điểm chấm từ quản lý",
          details:
            "Vui lòng xóa điểm trên trang 'Quản lý chấm điểm' trước khi xóa nhiệm vụ.",
        }
      : { allowed: true };

    console.log("🔍 Validation result:", validation);

    if (!validation.allowed) {
      toast.error(
        `❌ Không thể xóa "${getTaskName(task)}"\n\n${validation.reason}\n${
          validation.details
        }`,
        { autoClose: 6000 }
      );
      return; // ❌ BLOCK ACTION
    }

    // ✅ OK to remove
    setWorkingTasks((prev) =>
      prev.filter((t) => getDutyId(t.NhiemVuThuongQuyID) !== dutyKey)
    );
    dispatch(removeTaskLocally(dutyKey));
  };

  const handleDifficultyChange = async (dutyId, newValue) => {
    const value = parseFloat(newValue);

    // Validate range
    if (value < 1.0 || value > 10.0) {
      return;
    }

    // ✅ PRE-VALIDATION: Check if difficulty can be changed
    const dutyKey = getDutyId(dutyId);
    const task = workingTasks.find(
      (t) => getDutyId(t.NhiemVuThuongQuyID) === dutyKey
    );
    if (!task) return;

    // Chỉ check điểm quản lý chấm (IGNORE tự đánh giá)
    const mgr = await hasManagerScore(dutyKey);
    if (mgr) {
      toast.error(
        `❌ Không thể thay đổi mức độ khó cho "${getTaskName(
          task
        )}"\n\nNhiệm vụ đã có điểm chấm từ quản lý.\nVui lòng xóa điểm trên trang 'Quản lý chấm điểm' trước.`,
        { autoClose: 6000 }
      );
      return; // ❌ BLOCK ACTION
    }

    // ✅ OK to change
    setWorkingTasks((prev) =>
      prev.map((t) =>
        getDutyId(t.NhiemVuThuongQuyID) === dutyKey
          ? { ...t, MucDoKho: value }
          : t
      )
    );
    dispatch(updateDifficultyLocally({ dutyId: dutyKey, mucDoKho: value }));
  };

  const handleSave = async () => {
    // Validate no duplicates
    const dutyIds = workingTasks.map((t) => t.NhiemVuThuongQuyID);
    const uniqueIds = new Set(dutyIds);
    if (dutyIds.length !== uniqueIds.size) {
      toast.error("Có nhiệm vụ bị trùng lặp trong danh sách");
      return;
    }

    // ✅ ROLLBACK: Save snapshot for restore on error
    const snapshot = [...workingTasks];

    // Prepare payload
    const tasks = workingTasks.map((t) => ({
      NhiemVuThuongQuyID: t.NhiemVuThuongQuyID,
      MucDoKho: t.MucDoKho,
    }));

    try {
      await dispatch(
        batchUpdateCycleAssignments(employeeId, selectedChuKyId, tasks)
      );
      // Success toast handled in slice
    } catch (error) {
      // ✅ ROLLBACK: Restore UI to previous state
      setWorkingTasks(snapshot);

      // ✅ Handle specific error types from backend
      if (error.errorType === "KPI_APPROVED") {
        toast.error(
          "🔒 KPI đã được duyệt.\nVui lòng hủy duyệt trên trang 'Đánh giá KPI' trước khi thay đổi phân công.",
          { autoClose: 5000 }
        );
      } else if (error.errorType === "CYCLE_CLOSED") {
        toast.error("Chu kỳ đã đóng. Không thể thay đổi phân công.", {
          autoClose: 5000,
        });
      } else if (error.errorType === "HAS_EVALUATION_SCORE") {
        toast.error(error.message, { autoClose: 8000 });
      } else if (error.errorType === "HAS_MANAGER_SCORE") {
        toast.error(error.message, { autoClose: 8000 });
      } else {
        toast.error(error.message || "Có lỗi xảy ra khi lưu");
      }
    }
  };

  const handleCopyFromCycle = async () => {
    if (!selectedCopyFromCycle) {
      toast.error("Vui lòng chọn chu kỳ nguồn");
      return;
    }
    if (isEditingBlocked) {
      toast.error("🔒 Không thể copy khi KPI đã duyệt hoặc chu kỳ đã đóng.", {
        autoClose: 5000,
      });
      return;
    }
    await dispatch(
      copyFromPreviousCycle(employeeId, selectedCopyFromCycle, selectedChuKyId)
    );
    setSelectedCopyFromCycle("");
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ✅ NEW: Check if editing is blocked (KPI approved or cycle closed)
  const isEditingBlocked =
    kpiStatus === "DA_DUYET" || selectedChuKy?.isDong === true;

  // Helper: get block reason message
  const blockReason = isEditingBlocked
    ? kpiStatus === "DA_DUYET"
      ? "KPI đã được duyệt, không thể thay đổi nhiệm vụ"
      : "Chu kỳ đã đóng, không thể thay đổi nhiệm vụ"
    : null;

  if (!employee && isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  const pageContent = (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.02
        )} 0%, ${alpha(theme.palette.secondary.main, 0.02)} 100%)`,
        minHeight: isMobile ? "auto" : "100vh",
      }}
    >
      {/* Header with Back Button */}
      {!isMobile && (
        <Stack direction="row" spacing={2} alignItems="center" mb={3}>
          <Tooltip title="Quay lại danh sách">
            <IconButton
              onClick={handleBack}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                "&:hover": {
                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                  borderColor: alpha(theme.palette.primary.main, 0.4),
                  transform: "scale(1.05)",
                },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <ArrowLeft />
            </IconButton>
          </Tooltip>
          <Box flex={1}>
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              📋 Giao nhiệm vụ theo chu kỳ
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Phân công nhiệm vụ và thiết lập mức độ khó cho từng nhân viên
            </Typography>
          </Box>
        </Stack>
      )}

      {/* Employee Info Card */}
      {employee && (
        <Card
          elevation={0}
          sx={{
            mb: 3,
            background: `linear-gradient(135deg, ${alpha(
              theme.palette.primary.main,
              0.08
            )} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2,
          }}
        >
          <CardContent sx={{ py: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item>
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: theme.palette.primary.main,
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    boxShadow: `0 4px 12px ${alpha(
                      theme.palette.primary.main,
                      0.3
                    )}`,
                  }}
                >
                  {employee.Ten?.charAt(0)?.toUpperCase()}
                </Avatar>
              </Grid>
              <Grid item xs>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  {employee.Ten}
                </Typography>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={{ xs: 1, sm: 2 }}
                  divider={
                    <Divider
                      orientation="vertical"
                      flexItem
                      sx={{ display: { xs: "none", sm: "block" } }}
                    />
                  }
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <MuiBadge
                      sx={{
                        color: theme.palette.primary.main,
                        fontSize: 18,
                      }}
                    />
                    <Typography variant="body2" fontWeight={500}>
                      {employee.MaNhanVien}
                    </Typography>
                  </Stack>
                  {employee.KhoaID && (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Assignment
                        sx={{
                          color: theme.palette.primary.main,
                          fontSize: 18,
                        }}
                      />
                      <Typography variant="body2" fontWeight={500}>
                        {employee.KhoaID.TenKhoa}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Grid>
              <Grid item>
                <Stack spacing={1} alignItems="flex-end">
                  <Chip
                    icon={<TrendingUp />}
                    label={`${workingTasks.length} nhiệm vụ`}
                    color="primary"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.875rem",
                      boxShadow: `0 2px 8px ${alpha(
                        theme.palette.primary.main,
                        0.2
                      )}`,
                    }}
                  />
                  <Chip
                    label={`Độ khó: ${workingTasks
                      .reduce((sum, t) => sum + (t.MucDoKho || 0), 0)
                      .toFixed(1)}`}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      color: "success.main",
                      border: `1px solid ${alpha(
                        theme.palette.success.main,
                        0.3
                      )}`,
                    }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Cycle Selector & Actions */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          background: alpha(theme.palette.background.paper, 0.9),
          backdropFilter: "blur(20px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
          borderRadius: 2,
          boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.05)}`,
        }}
      >
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Chọn chu kỳ đánh giá</InputLabel>
                <Select
                  value={selectedChuKyId || ""}
                  onChange={handleCycleChange}
                  label="Chọn chu kỳ đánh giá"
                  disabled={loadingCycles}
                  startAdornment={
                    <CalendarMonth
                      sx={{ mr: 1, color: "primary.main", fontSize: 24 }}
                    />
                  }
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(theme.palette.primary.main, 0.3),
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: alpha(theme.palette.primary.main, 0.5),
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  }}
                >
                  {safeCycles.map((cycle) => (
                    <MenuItem key={cycle._id} value={cycle._id}>
                      <Stack spacing={0.5} sx={{ py: 0.5 }}>
                        <Typography fontWeight={600}>
                          {cycle.TenChuKy}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          📅{" "}
                          {cycle.NgayBatDau
                            ? dayjs(cycle.NgayBatDau).format("DD/MM/YYYY")
                            : cycle.TuNgay
                            ? dayjs(cycle.TuNgay).format("DD/MM/YYYY")
                            : "N/A"}{" "}
                          →{" "}
                          {cycle.NgayKetThuc
                            ? dayjs(cycle.NgayKetThuc).format("DD/MM/YYYY")
                            : cycle.DenNgay
                            ? dayjs(cycle.DenNgay).format("DD/MM/YYYY")
                            : "N/A"}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedChuKyId && !isEditingBlocked && (
              <Grid item xs={12} md={6}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  justifyContent={{ xs: "flex-start", md: "flex-end" }}
                >
                  <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel>Copy từ chu kỳ khác</InputLabel>
                    <Select
                      value={selectedCopyFromCycle}
                      onChange={(e) => setSelectedCopyFromCycle(e.target.value)}
                      label="Copy từ chu kỳ khác"
                      startAdornment={
                        <ContentCopy
                          sx={{ mr: 1, color: "action.active", fontSize: 20 }}
                        />
                      }
                    >
                      {safeCycles
                        .filter((c) => c._id !== selectedChuKyId)
                        .map((cycle) => (
                          <MenuItem key={cycle._id} value={cycle._id}>
                            {cycle.TenChuKy}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    startIcon={
                      isCopying ? (
                        <CircularProgress size={16} />
                      ) : (
                        <ContentCopy />
                      )
                    }
                    onClick={handleCopyFromCycle}
                    disabled={!selectedCopyFromCycle || isCopying}
                    sx={{
                      borderRadius: 1.5,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 2.5,
                      boxShadow: `0 2px 8px ${alpha(
                        theme.palette.primary.main,
                        0.3
                      )}`,
                      "&:hover": {
                        boxShadow: `0 4px 12px ${alpha(
                          theme.palette.primary.main,
                          0.4
                        )}`,
                      },
                    }}
                  >
                    Copy
                  </Button>
                </Stack>
              </Grid>
            )}
          </Grid>

          {/* Cycle Info Display */}
          {selectedCycleInfo && (
            <Card
              elevation={0}
              sx={{
                mt: 2,
                bgcolor: alpha(theme.palette.info.main, 0.05),
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                borderRadius: 1.5,
              }}
            >
              <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CalendarMonth
                        sx={{ color: "info.main", fontSize: 20 }}
                      />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày bắt đầu
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedCycleInfo.NgayBatDau
                            ? dayjs(selectedCycleInfo.NgayBatDau).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <CheckCircle sx={{ color: "info.main", fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Ngày kết thúc
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedCycleInfo.NgayKetThuc
                            ? dayjs(selectedCycleInfo.NgayKetThuc).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Lock sx={{ color: "info.main", fontSize: 20 }} />
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Trạng thái
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {selectedCycleInfo.isDong ? (
                            <Chip
                              label="Đã đóng"
                              size="small"
                              color="error"
                              sx={{ height: 22, fontSize: "0.75rem" }}
                            />
                          ) : (
                            <Chip
                              label="Đang mở"
                              size="small"
                              color="success"
                              sx={{ height: 22, fontSize: "0.75rem" }}
                            />
                          )}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* ✅ Warning Banner - KPI đã duyệt hoặc Chu kỳ đã đóng */}
      {selectedChuKyId && kpiStatus === "DA_DUYET" && (
        <Alert
          severity="error"
          icon={<Lock />}
          sx={{
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
            bgcolor: alpha(theme.palette.error.main, 0.05),
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            🔒 KPI Đã Được Duyệt
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Không thể thêm/sửa/xóa nhiệm vụ khi KPI đã được duyệt. Vui lòng hủy
            duyệt KPI trên trang "Đánh giá KPI" trước khi thay đổi phân công.
          </Typography>
        </Alert>
      )}

      {selectedChuKyId && selectedChuKy?.isDong && kpiStatus !== "DA_DUYET" && (
        <Alert
          severity="warning"
          icon={<Lock />}
          sx={{
            mb: 3,
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.3)}`,
            bgcolor: alpha(theme.palette.warning.main, 0.05),
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            🔒 Chu Kỳ Đã Đóng
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Không thể thay đổi phân công nhiệm vụ khi chu kỳ đánh giá đã đóng.
          </Typography>
        </Alert>
      )}

      {!selectedChuKyId ? (
        <Alert severity="info" icon={<CalendarMonth />}>
          Vui lòng chọn chu kỳ đánh giá để bắt đầu gán nhiệm vụ
        </Alert>
      ) : isLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Two-Column Layout - Stack on mobile */}
          <Grid container spacing={3}>
            {/* Left Column: Available Duties */}
            <Grid item xs={12} md={isMobile ? 12 : 5}>
              <MainCard
                elevation={0}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
                title={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Assignment sx={{ color: "primary.main" }} />
                    <Typography variant="h6" fontWeight={600}>
                      Danh sách nhiệm vụ
                    </Typography>
                    <Chip
                      label={availableDuties.length}
                      size="small"
                      color="primary"
                      sx={{ fontWeight: 700 }}
                    />
                  </Stack>
                }
              >
                {availableDuties.length === 0 ? (
                  <Alert
                    severity="success"
                    icon={<CheckCircle />}
                    sx={{ borderRadius: 2 }}
                  >
                    <Typography variant="body2" fontWeight={500}>
                      Tất cả nhiệm vụ đã được gán! 🎉
                    </Typography>
                  </Alert>
                ) : (
                  <List
                    sx={{
                      maxHeight: "calc(100vh - 420px)",
                      minHeight: 400,
                      overflow: "auto",
                      pr: 1,
                    }}
                  >
                    {availableDuties.map((duty) => (
                      <ListItem
                        key={duty._id}
                        onClick={() => {
                          if (isEditingBlocked) return;
                          handleAddTask(duty);
                        }}
                        sx={{
                          border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.2
                          )}`,
                          borderRadius: 1.5,
                          mb: 1,
                          cursor: isEditingBlocked ? "not-allowed" : "pointer",
                          opacity: isEditingBlocked ? 0.5 : 1,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            bgcolor: isEditingBlocked
                              ? "transparent"
                              : alpha(theme.palette.primary.main, 0.08),
                            borderColor: isEditingBlocked
                              ? alpha(theme.palette.divider, 0.2)
                              : alpha(theme.palette.primary.main, 0.4),
                            transform: isEditingBlocked
                              ? "none"
                              : "translateX(4px)",
                          },
                          py: 1,
                          px: 1.5,
                        }}
                      >
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              fontWeight={500}
                              sx={{ fontSize: "0.9375rem" }} // 15px
                            >
                              {duty.TenNhiemVu}
                            </Typography>
                          }
                          secondary={
                            <Chip
                              label={`Độ khó: ${duty.MucDoKhoDefault || 5}/10`}
                              size="small"
                              sx={{
                                mt: 0.5,
                                height: 20,
                                fontSize: "0.8125rem", // 13px - tăng từ 12px
                                fontWeight: 600,
                              }}
                            />
                          }
                        />
                        <ListItemSecondaryAction>
                          <Tooltip
                            title={
                              isEditingBlocked ? "Đã khóa" : "Thêm nhiệm vụ"
                            }
                          >
                            <span>
                              <IconButton
                                edge="end"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isEditingBlocked) handleAddTask(duty);
                                }}
                                disabled={isEditingBlocked}
                                sx={{
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.1
                                  ),
                                  "&:hover": {
                                    bgcolor: alpha(
                                      theme.palette.primary.main,
                                      0.2
                                    ),
                                  },
                                }}
                              >
                                <Add fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </MainCard>
            </Grid>

            {/* Right Column: Assigned Tasks */}
            <Grid item xs={12} md={isMobile ? 12 : 7}>
              <MainCard
                elevation={0}
                sx={{
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  borderRadius: 2,
                }}
                title={
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TrendingUp sx={{ color: "success.main" }} />
                      <Typography variant="h6" fontWeight={600}>
                        Nhiệm vụ đã gán
                      </Typography>
                      <MuiBadge
                        badgeContent={workingTasks.length}
                        color="success"
                        max={99}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontWeight: 700,
                            fontSize: "0.8125rem", // 13px - tăng từ 12px
                          },
                        }}
                      >
                        <Box sx={{ width: 24 }} />
                      </MuiBadge>
                    </Stack>
                    {/* Hide Save button on mobile (moved to sticky footer) */}
                    {!isMobile && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={
                          isSaving ? <CircularProgress size={16} /> : <Save />
                        }
                        onClick={handleSave}
                        disabled={
                          isSaving ||
                          workingTasks.length === 0 ||
                          isEditingBlocked
                        }
                        sx={{
                          borderRadius: 1.5,
                          textTransform: "none",
                          fontWeight: 600,
                          px: 2,
                          boxShadow: isEditingBlocked
                            ? "none"
                            : `0 2px 8px ${alpha(
                                theme.palette.primary.main,
                                0.3
                              )}`,
                          ...(isEditingBlocked && {
                            bgcolor: alpha(theme.palette.grey[500], 0.3),
                            color: theme.palette.text.primary,
                            opacity: 0.8,
                            "&:hover": {
                              bgcolor: alpha(theme.palette.grey[500], 0.3),
                            },
                          }),
                        }}
                      >
                        {isEditingBlocked ? "🔒 Đã khóa" : "Lưu thay đổi"}
                      </Button>
                    )}
                  </Stack>
                }
              >
                {workingTasks.length === 0 ? (
                  <Alert
                    severity="info"
                    icon={<Warning />}
                    sx={{ borderRadius: 2 }}
                  >
                    <Typography variant="body2">
                      Chưa có nhiệm vụ nào được gán. Chọn từ danh sách bên trái
                      để thêm.
                    </Typography>
                  </Alert>
                ) : (
                  <>
                    <Box
                      sx={{
                        maxHeight: "calc(100vh - 420px)",
                        minHeight: 400,
                        overflow: "auto",
                        pr: 1,
                      }}
                    >
                      {workingTasks.map((task, index) => (
                        <Paper
                          key={task.NhiemVuThuongQuyID}
                          elevation={0}
                          sx={{
                            p: 1.5,
                            mb: 1.5,
                            border: `1px solid ${alpha(
                              theme.palette.divider,
                              0.2
                            )}`,
                            borderRadius: 1.5,
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.4
                              ),
                              boxShadow: `0 2px 8px ${alpha(
                                theme.palette.primary.main,
                                0.1
                              )}`,
                            },
                            ...(isEditingBlocked && {
                              bgcolor: alpha(theme.palette.grey[100], 0.3),
                            }),
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            {/* STT */}
                            <Chip
                              label={index + 1}
                              size="small"
                              sx={{
                                minWidth: 32,
                                height: 26,
                                fontWeight: 700,
                                fontSize: "0.875rem", // 14px - tăng từ 12.8px
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: "primary.main",
                              }}
                            />

                            {/* Task Name */}
                            <Box flex={1}>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  lineHeight: 1.4,
                                  opacity: isEditingBlocked ? 0.85 : 1,
                                  color: isEditingBlocked
                                    ? theme.palette.text.primary
                                    : "inherit",
                                  fontSize: "0.9375rem", // 15px - tăng từ 14px
                                }}
                              >
                                {task._task?.TenNhiemVu || "Nhiệm vụ"}
                              </Typography>
                              <Typography
                                variant="caption"
                                sx={{
                                  color: theme.palette.text.secondary,
                                  opacity: isEditingBlocked ? 0.75 : 0.7,
                                  fontSize: "0.8125rem", // 13px - tăng từ 12px
                                }}
                              >
                                Mặc định: {task._task?.MucDoKhoDefault || 5}/10
                              </Typography>
                            </Box>

                            {/* Difficulty Input - COMPACT */}
                            <TextField
                              type="number"
                              value={task.MucDoKho}
                              onChange={(e) =>
                                handleDifficultyChange(
                                  task.NhiemVuThuongQuyID,
                                  e.target.value
                                )
                              }
                              inputProps={{
                                min: 1.0,
                                max: 10.0,
                                step: 0.5,
                                style: {
                                  textAlign: "center",
                                  fontWeight: 700,
                                  fontSize: "0.9375rem", // 15px - tăng từ 14px
                                },
                              }}
                              size="small"
                              disabled={isEditingBlocked}
                              sx={{
                                width: 80,
                                "& .MuiInputBase-input": {
                                  py: 0.75,
                                  ...(isEditingBlocked && {
                                    color: theme.palette.text.primary,
                                    WebkitTextFillColor:
                                      theme.palette.text.primary,
                                    opacity: 0.85,
                                  }),
                                },
                                "& .MuiOutlinedInput-root": {
                                  ...(isEditingBlocked && {
                                    bgcolor: alpha(
                                      theme.palette.grey[200],
                                      0.5
                                    ),
                                  }),
                                },
                              }}
                            />

                            {/* Difficulty Chip */}
                            <Chip
                              label={`${task.MucDoKho}/10`}
                              size="small"
                              color={
                                task.MucDoKho <= 3
                                  ? "success"
                                  : task.MucDoKho <= 7
                                  ? "warning"
                                  : "error"
                              }
                              sx={{
                                minWidth: 56,
                                fontWeight: 700,
                                fontSize: "0.8125rem", // 13px - tăng từ 12px
                              }}
                            />

                            {/* Delete Button */}
                            <Tooltip
                              title={
                                isEditingBlocked ? "Đã khóa" : "Xóa nhiệm vụ"
                              }
                            >
                              <span>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleRemoveTask(task.NhiemVuThuongQuyID)
                                  }
                                  disabled={isEditingBlocked}
                                  sx={{
                                    color: "error.main",
                                    opacity: isEditingBlocked ? 0.5 : 1,
                                    "&:hover": {
                                      bgcolor: alpha(
                                        theme.palette.error.main,
                                        0.1
                                      ),
                                    },
                                  }}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          </Stack>
                        </Paper>
                      ))}
                    </Box>

                    {/* Summary Footer */}
                    <Divider sx={{ my: 2 }} />
                    <Stack
                      direction="row"
                      spacing={3}
                      justifyContent="space-between"
                      sx={{
                        px: 1,
                        py: 1,
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        borderRadius: 1.5,
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={500}
                          sx={{ fontSize: "0.8125rem" }} // 13px - tăng từ 12px
                        >
                          Tổng cộng:
                        </Typography>
                        <Chip
                          label={`${workingTasks.length} nhiệm vụ`}
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 700, fontSize: "0.8125rem" }} // 13px
                        />
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={500}
                          sx={{ fontSize: "0.8125rem" }} // 13px - tăng từ 12px
                        >
                          Tổng độ khó:
                        </Typography>
                        <Chip
                          label={workingTasks
                            .reduce((sum, t) => sum + (t.MucDoKho || 0), 0)
                            .toFixed(1)}
                          size="small"
                          color="success"
                          sx={{ fontWeight: 700, fontSize: "0.8125rem" }} // 13px
                        />
                      </Stack>
                    </Stack>
                  </>
                )}
              </MainCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );

  // Mobile: wrap with MobileDetailLayout
  if (isMobile) {
    return (
      <MobileDetailLayout
        title={employee?.Ten || "Giao Nhiệm Vụ"}
        subtitle="Phân công nhiệm vụ theo chu kỳ"
        backPath="/quanlycongviec/giao-nhiemvu"
        enablePullToRefresh
        onRefresh={handleRefresh}
        footer={
          !isLoading &&
          selectedChuKyId && (
            <Stack
              direction="row"
              spacing={2}
              sx={{
                p: 2,
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                bgcolor: "background.paper",
              }}
            >
              {!isEditingBlocked && (
                <>
                  <Button
                    variant="outlined"
                    color="error"
                    size="large"
                    fullWidth
                    onClick={() => navigate(-1)}
                  >
                    Hủy
                  </Button>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleSave}
                    disabled={isSaving || workingTasks.length === 0}
                    startIcon={
                      isSaving ? <CircularProgress size={20} /> : <Save />
                    }
                  >
                    {isSaving ? "Đang lưu..." : "Lưu gán việc"}
                  </Button>
                </>
              )}
              {isEditingBlocked && (
                <Alert severity="warning" sx={{ flex: 1 }}>
                  {blockReason || "Chu kỳ đã đóng hoặc KPI đã duyệt"}
                </Alert>
              )}
            </Stack>
          )
        }
      >
        {pageContent}
      </MobileDetailLayout>
    );
  }

  // Desktop: original layout
  return pageContent;
};

export default CycleAssignmentDetailPage;
