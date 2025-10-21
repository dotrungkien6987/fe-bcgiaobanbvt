import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Alert,
  Chip,
  Stack,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasksForEvaluation,
  saveEvaluation,
  resetEvaluation,
} from "../kpiEvaluationSlice";
import LoadingScreen from "components/LoadingScreen";

/**
 * ✅ NEW: KPI Evaluation Dialog
 *
 * Purpose: Manager evaluates employee tasks for selected cycle
 *
 * Props:
 * - open: Dialog open state
 * - onClose: Close handler
 * - employee: { _id, HoTen, ... }
 * - cycleId: Selected cycle ID
 *
 * Flow:
 * 1. Load tasks (with existing scores if any)
 * 2. Manager enters scores (0-10) + notes
 * 3. Save → Backend upserts evaluations
 * 4. Show KPI result
 */
function KPIEvaluationDialog({ open, onClose, employee, cycleId }) {
  const dispatch = useDispatch();

  const { tasksForEvaluation, isLoading, isSaving, kpiScores, error } =
    useSelector((state) => state.kpiEvaluation);

  // Local state for form inputs
  const [scores, setScores] = useState({});
  const [notes, setNotes] = useState({});

  // Load tasks when dialog opens
  useEffect(() => {
    if (open && employee && cycleId) {
      dispatch(fetchTasksForEvaluation(employee._id, cycleId));
    }

    // Cleanup on close
    return () => {
      if (!open) {
        dispatch(resetEvaluation());
        setScores({});
        setNotes({});
      }
    };
  }, [open, employee, cycleId, dispatch]);

  // Populate scores from loaded tasks
  useEffect(() => {
    if (tasksForEvaluation && tasksForEvaluation.length > 0) {
      const initialScores = {};
      const initialNotes = {};

      tasksForEvaluation.forEach((task) => {
        const key = task._id; // Assignment ID
        initialScores[key] = {
          DiemTuDanhGia: task.DiemTuDanhGia ?? "",
          DiemQuanLyDanhGia: task.DiemQuanLyDanhGia ?? "",
        };
        initialNotes[key] = task.GhiChu || "";
      });

      setScores(initialScores);
      setNotes(initialNotes);
    }
  }, [tasksForEvaluation]);

  // Handle score change
  const handleScoreChange = (assignmentId, field, value) => {
    // Validate 0-10 range
    const numValue = parseFloat(value);
    if (value !== "" && (isNaN(numValue) || numValue < 0 || numValue > 10)) {
      return;
    }

    setScores((prev) => ({
      ...prev,
      [assignmentId]: {
        ...prev[assignmentId],
        [field]: value,
      },
    }));
  };

  // Handle note change
  const handleNoteChange = (assignmentId, value) => {
    setNotes((prev) => ({
      ...prev,
      [assignmentId]: value,
    }));
  };

  // Handle save
  const handleSave = () => {
    // Prepare evaluations array
    const evaluations = tasksForEvaluation.map((task) => {
      const assignmentId = task._id;
      const scoreData = scores[assignmentId] || {};

      return {
        assignmentId,
        DiemTuDanhGia:
          scoreData.DiemTuDanhGia !== ""
            ? parseFloat(scoreData.DiemTuDanhGia)
            : null,
        DiemQuanLyDanhGia:
          scoreData.DiemQuanLyDanhGia !== ""
            ? parseFloat(scoreData.DiemQuanLyDanhGia)
            : null,
        GhiChu: notes[assignmentId] || "",
      };
    });

    // Filter out rows with no scores entered
    const validEvaluations = evaluations.filter(
      (e) => e.DiemTuDanhGia !== null || e.DiemQuanLyDanhGia !== null
    );

    if (validEvaluations.length === 0) {
      return;
    }

    dispatch(saveEvaluation(employee._id, cycleId, validEvaluations));
  };

  // Get KPI result for current employee
  const kpiResult = kpiScores[employee?._id];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6">Đánh giá KPI - {employee?.HoTen}</Typography>
          {kpiResult && (
            <Chip
              label={`${kpiResult.DiemKPI} - ${kpiResult.XepLoai}`}
              color={
                kpiResult.XepLoai === "Xuất sắc"
                  ? "success"
                  : kpiResult.XepLoai === "Giỏi"
                  ? "primary"
                  : kpiResult.XepLoai === "Khá"
                  ? "info"
                  : "default"
              }
              size="small"
            />
          )}
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading && <LoadingScreen />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!isLoading && tasksForEvaluation.length === 0 && (
          <Alert severity="info">
            Nhân viên chưa được giao nhiệm vụ nào trong chu kỳ này
          </Alert>
        )}

        {!isLoading && tasksForEvaluation.length > 0 && (
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Nhập điểm đánh giá từ 0-10 cho từng nhiệm vụ
            </Typography>

            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
                      Nhiệm vụ
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", width: 100 }}
                      align="center"
                    >
                      Độ khó
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", width: 120 }}
                      align="center"
                    >
                      Điểm tự đánh giá
                    </TableCell>
                    <TableCell
                      sx={{ fontWeight: "bold", width: 120 }}
                      align="center"
                    >
                      Điểm QL đánh giá
                    </TableCell>
                    <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
                      Ghi chú
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasksForEvaluation.map((task) => {
                    const assignmentId = task._id;
                    const scoreData = scores[assignmentId] || {};

                    return (
                      <TableRow key={assignmentId}>
                        <TableCell>
                          <Typography variant="body2">
                            {task.NhiemVuThuongQuyID?.TenNhiemVu || "N/A"}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Chip
                            label={task.MucDoKho?.toFixed(1) || "5.0"}
                            size="small"
                            color={
                              task.MucDoKho >= 8
                                ? "error"
                                : task.MucDoKho >= 6
                                ? "warning"
                                : "success"
                            }
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                            value={scoreData.DiemTuDanhGia ?? ""}
                            onChange={(e) =>
                              handleScoreChange(
                                assignmentId,
                                "DiemTuDanhGia",
                                e.target.value
                              )
                            }
                            placeholder="0-10"
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            type="number"
                            size="small"
                            fullWidth
                            inputProps={{ min: 0, max: 10, step: 0.1 }}
                            value={scoreData.DiemQuanLyDanhGia ?? ""}
                            onChange={(e) =>
                              handleScoreChange(
                                assignmentId,
                                "DiemQuanLyDanhGia",
                                e.target.value
                              )
                            }
                            placeholder="0-10"
                          />
                        </TableCell>

                        <TableCell>
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            rows={1}
                            value={notes[assignmentId] || ""}
                            onChange={(e) =>
                              handleNoteChange(assignmentId, e.target.value)
                            }
                            placeholder="Nhận xét..."
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            {kpiResult && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Kết quả KPI: <strong>{kpiResult.DiemKPI}</strong> -{" "}
                  {kpiResult.XepLoai}
                </Typography>

                {kpiResult.ChiTiet && kpiResult.ChiTiet.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", mb: 0.5 }}
                    >
                      Chi tiết:
                    </Typography>
                    {kpiResult.ChiTiet.map((item, index) => (
                      <Typography
                        key={index}
                        variant="caption"
                        sx={{ display: "block" }}
                      >
                        • {item.NhiemVu}: {item.DiemTrungBinh.toFixed(2)} ×{" "}
                        {item.TrongSo.toFixed(2)} ={" "}
                        {item.DiemCoTrongSo.toFixed(2)}
                      </Typography>
                    ))}
                  </Box>
                )}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isSaving}>
          Đóng
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={isSaving || tasksForEvaluation.length === 0}
        >
          {isSaving ? "Đang lưu..." : "Lưu đánh giá"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KPIEvaluationDialog;
