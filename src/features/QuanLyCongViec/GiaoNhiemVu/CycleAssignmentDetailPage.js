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
} from "@mui/material";
import {
  ArrowLeft,
  ContentCopy,
  Save,
  Delete,
  Add,
  CalendarMonth,
} from "@mui/icons-material";
import { toast } from "react-toastify";

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
  } = useSelector((state) => state.cycleAssignment);

  // Local state for cycle selector and copy dialog
  const [cycles, setCycles] = useState([]); // ✅ DEFENSIVE: Initialize as empty array
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [selectedCopyFromCycle, setSelectedCopyFromCycle] = useState("");

  // Local working copy of assigned tasks (for optimistic updates)
  const [workingTasks, setWorkingTasks] = useState([]);

  // ✅ DEFENSIVE: Ensure cycles is always an array
  const safeCycles = Array.isArray(cycles) ? cycles : [];

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
        _task: t.NhiemVuThuongQuyID, // Keep full object for display
      }))
    );
  }, [assignedTasks]);

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

  const handleRemoveTask = (dutyId) => {
    setWorkingTasks(
      workingTasks.filter((t) => t.NhiemVuThuongQuyID !== dutyId)
    );
    dispatch(removeTaskLocally(dutyId));
  };

  const handleDifficultyChange = (dutyId, newValue) => {
    const value = parseFloat(newValue);
    if (value >= 1.0 && value <= 10.0) {
      setWorkingTasks(
        workingTasks.map((t) =>
          t.NhiemVuThuongQuyID === dutyId ? { ...t, MucDoKho: value } : t
        )
      );
      dispatch(updateDifficultyLocally({ dutyId, mucDoKho: value }));
    }
  };

  const handleSave = async () => {
    // Validate no duplicates
    const dutyIds = workingTasks.map((t) => t.NhiemVuThuongQuyID);
    const uniqueIds = new Set(dutyIds);
    if (dutyIds.length !== uniqueIds.size) {
      toast.error("Có nhiệm vụ bị trùng lặp trong danh sách");
      return;
    }

    // Prepare payload
    const tasks = workingTasks.map((t) => ({
      NhiemVuThuongQuyID: t.NhiemVuThuongQuyID,
      MucDoKho: t.MucDoKho,
    }));

    await dispatch(
      batchUpdateCycleAssignments(employeeId, selectedChuKyId, tasks)
    );
  };

  const handleCopyFromCycle = async () => {
    if (!selectedCopyFromCycle) {
      toast.error("Vui lòng chọn chu kỳ nguồn");
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

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Stack direction="row" spacing={2} alignItems="center" mb={3}>
        <IconButton onClick={handleBack} color="primary">
          <ArrowLeft />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h4" fontWeight={600}>
            Giao nhiệm vụ theo chu kỳ
          </Typography>
          {employee && (
            <Typography variant="body2" color="text.secondary" mt={0.5}>
              Nhân viên: <strong>{employee.Ten}</strong> ({employee.MaNhanVien})
              {employee.KhoaID && ` - ${employee.KhoaID.TenKhoa}`}
            </Typography>
          )}
        </Box>
      </Stack>

      {/* Cycle Selector */}
      <Card
        sx={{
          mb: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <CardContent>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <FormControl fullWidth sx={{ maxWidth: 400 }}>
              <InputLabel>Chọn chu kỳ đánh giá</InputLabel>
              <Select
                value={selectedChuKyId || ""}
                onChange={handleCycleChange}
                label="Chọn chu kỳ đánh giá"
                disabled={loadingCycles}
                startAdornment={
                  <CalendarMonth sx={{ mr: 1, color: "action.active" }} />
                }
              >
                {safeCycles.map((cycle) => (
                  <MenuItem key={cycle._id} value={cycle._id}>
                    {cycle.TenChuKy} (
                    {new Date(cycle.TuNgay).toLocaleDateString()} -{" "}
                    {new Date(cycle.DenNgay).toLocaleDateString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedChuKyId && (
              <Stack direction="row" spacing={1}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Copy từ chu kỳ</InputLabel>
                  <Select
                    value={selectedCopyFromCycle}
                    onChange={(e) => setSelectedCopyFromCycle(e.target.value)}
                    label="Copy từ chu kỳ"
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
                  variant="outlined"
                  startIcon={
                    isCopying ? <CircularProgress size={16} /> : <ContentCopy />
                  }
                  onClick={handleCopyFromCycle}
                  disabled={!selectedCopyFromCycle || isCopying}
                >
                  Copy
                </Button>
              </Stack>
            )}
          </Stack>
        </CardContent>
      </Card>

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
          {/* Two-Column Layout */}
          <Grid container spacing={3}>
            {/* Left Column: Available Duties */}
            <Grid item xs={12} md={5}>
              <MainCard
                title={`📚 Danh sách nhiệm vụ (${availableDuties.length})`}
              >
                {availableDuties.length === 0 ? (
                  <Alert severity="success">
                    Tất cả nhiệm vụ đã được gán! 🎉
                  </Alert>
                ) : (
                  <List sx={{ maxHeight: 600, overflow: "auto" }}>
                    {availableDuties.map((duty) => (
                      <ListItem
                        key={duty._id}
                        button
                        onClick={() => handleAddTask(duty)}
                        sx={{
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 1,
                          mb: 1,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                          },
                        }}
                      >
                        <ListItemText
                          primary={duty.TenNhiemVu}
                          secondary={
                            <Stack direction="row" spacing={1} mt={0.5}>
                              <Chip
                                label={`Độ khó: ${
                                  duty.MucDoKhoDefault || 5
                                }/10`}
                                size="small"
                                color="default"
                              />
                            </Stack>
                          }
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            color="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddTask(duty);
                            }}
                          >
                            <Add />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    ))}
                  </List>
                )}
              </MainCard>
            </Grid>

            {/* Right Column: Assigned Tasks */}
            <Grid item xs={12} md={7}>
              <MainCard
                title={`📝 Nhiệm vụ đã gán (${workingTasks.length})`}
                secondary={
                  <Button
                    variant="contained"
                    startIcon={
                      isSaving ? <CircularProgress size={16} /> : <Save />
                    }
                    onClick={handleSave}
                    disabled={isSaving || workingTasks.length === 0}
                  >
                    Lưu thay đổi
                  </Button>
                }
              >
                {workingTasks.length === 0 ? (
                  <Alert severity="info">
                    Chưa có nhiệm vụ nào được gán. Chọn từ danh sách bên trái để
                    thêm.
                  </Alert>
                ) : (
                  <List sx={{ maxHeight: 600, overflow: "auto" }}>
                    {workingTasks.map((task, index) => (
                      <Paper
                        key={task.NhiemVuThuongQuyID}
                        elevation={1}
                        sx={{ p: 2, mb: 2 }}
                      >
                        <Stack spacing={2}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                          >
                            <Box flex={1}>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {index + 1}.{" "}
                                {task._task?.TenNhiemVu || "Nhiệm vụ"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Độ khó mặc định:{" "}
                                {task._task?.MucDoKhoDefault || 5}/10 (tham
                                khảo)
                              </Typography>
                            </Box>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() =>
                                handleRemoveTask(task.NhiemVuThuongQuyID)
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={2}
                            alignItems="center"
                          >
                            <TextField
                              type="number"
                              label="Độ khó thực tế"
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
                              }}
                              size="small"
                              sx={{ width: 150 }}
                              helperText="1.0 - 10.0"
                            />
                            <Chip
                              label={`${task.MucDoKho}/10`}
                              color={
                                task.MucDoKho <= 3
                                  ? "success"
                                  : task.MucDoKho <= 7
                                  ? "warning"
                                  : "error"
                              }
                            />
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </List>
                )}

                <Divider sx={{ my: 2 }} />

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Typography variant="body2" color="text.secondary">
                    Tổng cộng: <strong>{workingTasks.length}</strong> nhiệm vụ
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tổng độ khó:{" "}
                    <strong>
                      {workingTasks
                        .reduce((sum, t) => sum + (t.MucDoKho || 0), 0)
                        .toFixed(1)}
                    </strong>
                  </Typography>
                </Stack>
              </MainCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};

export default CycleAssignmentDetailPage;
