import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  Stack,
  Alert,
  Grid,
  TextField,
  LinearProgress,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import {
  getCycles,
  setSelectedCycle,
  getEmployeesForEvaluation,
} from "../kpiEvaluationSlice";
// Dùng dialog chấm KPI theo tiêu chí (UI/UX cũ)
import ChamDiemKPIDialog from "../v2/components/ChamDiemKPIDialog";
// Dùng action v2 để tải dữ liệu chấm điểm theo tiêu chí
import { getChamDiemDetail as getChamDiemDetailV2 } from "../kpiSlice";
import LoadingScreen from "components/LoadingScreen";
import MainCard from "components/MainCard";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import PeopleIcon from "@mui/icons-material/People";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import dayjs from "dayjs";

/**
 * ✅ NEW: KPI Evaluation Page (Manager View)
 *
 * Purpose: Manager evaluates KPI for their managed employees
 *
 * Flow:
 * 1. Select evaluation cycle
 * 2. View list of managed employees
 * 3. Click [Đánh giá] → Open dialog
 * 4. Enter scores → Save
 * 5. View calculated KPI
 */
function KPIEvaluationPage() {
  const dispatch = useDispatch();

  const { cycles, selectedCycleId, employees, isLoading, error } = useSelector(
    (state) => state.kpiEvaluation
  );

  const [evaluationDialog, setEvaluationDialog] = useState({
    open: false,
    employee: null,
    readOnly: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterKhoa, setFilterKhoa] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Load cycles on mount
  useEffect(() => {
    dispatch(getCycles());
  }, [dispatch]);

  // Load employees when cycle selected
  useEffect(() => {
    if (selectedCycleId) {
      dispatch(getEmployeesForEvaluation(selectedCycleId));
    }
  }, [selectedCycleId, dispatch]);

  // Auto-refresh KPI list after assignments change elsewhere
  const {
    lastBulkAssign,
    lastBatchUpdate,
    assignments: giaoAssignments,
  } = useSelector((s) => s.giaoNhiemVu || {});

  // ✅ FIX: Listen to KPI slice changes (approve/undo)
  const { currentDanhGiaKPI } = useSelector((s) => s.kpi || {});

  useEffect(() => {
    if (selectedCycleId) {
      dispatch(getEmployeesForEvaluation(selectedCycleId));
    }
  }, [
    dispatch,
    selectedCycleId,
    lastBulkAssign,
    lastBatchUpdate,
    giaoAssignments?.length,
    currentDanhGiaKPI?.TrangThai, // ✅ Reload when KPI status changes (approved/undone)
    currentDanhGiaKPI?.TongDiemKPI, // ✅ Reload when KPI score changes
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = employees.length;
    const evaluated = employees.filter(
      (e) => e.danhGiaKPI?.TrangThai === "DA_DUYET"
    ).length;
    const pending = total - evaluated;

    // ✅ V2 LOGIC: Chỉ tính điểm trung bình cho KPI ĐÃ DUYỆT
    const evaluatedEmployees = employees.filter(
      (e) =>
        e.danhGiaKPI?.TrangThai === "DA_DUYET" &&
        e.danhGiaKPI?.TongDiemKPI != null
    );
    const avgScore =
      evaluatedEmployees.length > 0
        ? evaluatedEmployees.reduce(
            (sum, e) => sum + e.danhGiaKPI.TongDiemKPI,
            0
          ) / evaluatedEmployees.length
        : 0;

    return { total, evaluated, pending, avgScore };
  }, [employees]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employees.filter((item) => {
      const employee = item.employee || {};
      const matchSearch =
        !searchTerm ||
        employee.Ten?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.MaNhanVien?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchKhoa = !filterKhoa || employee.KhoaID?.TenKhoa === filterKhoa;
      const matchStatus =
        !filterStatus || item.danhGiaKPI?.TrangThai === filterStatus;

      return matchSearch && matchKhoa && matchStatus;
    });
  }, [employees, searchTerm, filterKhoa, filterStatus]);

  // Get unique Khoa list
  const khoaList = useMemo(() => {
    const khoas = employees
      .map((item) => item.employee?.KhoaID?.TenKhoa)
      .filter(Boolean);
    return [...new Set(khoas)];
  }, [employees]);

  // Handle cycle change
  const handleCycleChange = (event) => {
    dispatch(setSelectedCycle(event.target.value));
  };

  // Handle evaluate button click
  const handleEvaluate = (employee) => {
    // Gọi API tiêu chí (v2) để chuẩn bị dữ liệu cho dialog tiêu chí
    if (selectedCycleId && employee?._id) {
      dispatch(getChamDiemDetailV2(selectedCycleId, employee._id));
    }
    setEvaluationDialog({
      open: true,
      employee,
      readOnly: false, // ✅ Chế độ chấm điểm/sửa
    });
  };

  // Handle view KPI (Read-only mode)
  const handleViewKPI = (employee) => {
    // Gọi API để tải dữ liệu chi tiết KPI
    if (selectedCycleId && employee?._id) {
      dispatch(getChamDiemDetailV2(selectedCycleId, employee._id));
    }
    setEvaluationDialog({
      open: true,
      employee,
      readOnly: true, // ✅ Chế độ xem (read-only)
    });
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setEvaluationDialog({
      open: false,
      employee: null,
      readOnly: false,
    });
  };

  return (
    <MainCard title="Đánh giá KPI nhân viên">
      <Box sx={{ p: 2 }}>
        {/* Cycle Selector */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <FormControl fullWidth>
              <InputLabel>Chu kỳ đánh giá</InputLabel>
              <Select
                value={selectedCycleId || ""}
                onChange={handleCycleChange}
                label="Chu kỳ đánh giá"
              >
                <MenuItem value="">
                  <em>-- Chọn chu kỳ --</em>
                </MenuItem>
                {cycles.map((cycle) => (
                  <MenuItem key={cycle._id} value={cycle._id}>
                    {cycle.TenChuKy} (
                    {cycle.NgayBatDau
                      ? dayjs(cycle.NgayBatDau).format("DD/MM/YYYY")
                      : "N/A"}{" "}
                    -{" "}
                    {cycle.NgayKetThuc
                      ? dayjs(cycle.NgayKetThuc).format("DD/MM/YYYY")
                      : "N/A"}
                    )
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        {selectedCycleId && employees.length > 0 && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "primary.lighter" }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PeopleIcon sx={{ color: "white", fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" color="primary.main">
                        {stats.total}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tổng nhân viên
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "success.lighter" }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: "success.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <AssignmentTurnedInIcon
                        sx={{ color: "white", fontSize: 28 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="h4" color="success.main">
                        {stats.evaluated}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Đã duyệt
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "warning.lighter" }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: "warning.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <PendingActionsIcon
                        sx={{ color: "white", fontSize: 28 }}
                      />
                    </Box>
                    <Box>
                      <Typography variant="h4" color="warning.main">
                        {stats.pending}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Chưa duyệt
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: "info.lighter" }}>
                <CardContent>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        bgcolor: "info.main",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <TrendingUpIcon sx={{ color: "white", fontSize: 28 }} />
                    </Box>
                    <Box>
                      <Typography variant="h4" color="info.main">
                        {stats.avgScore.toFixed(1)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Điểm TB
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Search and Filter */}
        {selectedCycleId && employees.length > 0 && (
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  placeholder="🔍 Tìm tên nhân viên..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  size="small"
                  sx={{ minWidth: 300 }}
                />

                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Khoa</InputLabel>
                  <Select
                    value={filterKhoa}
                    onChange={(e) => setFilterKhoa(e.target.value)}
                    label="Khoa"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {khoaList.map((khoa, idx) => (
                      <MenuItem key={idx} value={khoa}>
                        {khoa}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Trạng thái</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Trạng thái"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    <MenuItem value="CHUA_DUYET">Chưa duyệt</MenuItem>
                    <MenuItem value="DA_DUYET">Đã duyệt</MenuItem>
                  </Select>
                </FormControl>

                {(searchTerm || filterKhoa || filterStatus) && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterKhoa("");
                      setFilterStatus("");
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        {selectedCycleId && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Chọn nhân viên để đánh giá KPI. Nhập điểm từ 0-10 cho từng nhiệm vụ.
          </Alert>
        )}

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {isLoading && <LoadingScreen />}

        {/* Employees Table */}
        {!isLoading && selectedCycleId && filteredEmployees.length === 0 && (
          <Alert severity="warning">
            {employees.length === 0
              ? "Không có nhân viên nào trong chu kỳ này"
              : "Không tìm thấy nhân viên phù hợp với bộ lọc"}
          </Alert>
        )}

        {!isLoading && selectedCycleId && filteredEmployees.length > 0 && (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Khoa
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Số nhiệm vụ
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Tiến độ
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Tổng điểm KPI
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Trạng thái
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Ngày duyệt
                  </TableCell>
                  <TableCell sx={{ fontWeight: "bold" }} align="center">
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEmployees.map((item, index) => {
                  // ✅ FIX: Access nested employee object
                  const employee = item.employee || item.nhanVien || {};
                  const danhGiaKPI = item.danhGiaKPI || null;
                  const isApproved = danhGiaKPI?.TrangThai === "DA_DUYET";

                  // ✅ FIX: Chuẩn hóa dữ liệu tiến độ (đa nguồn BE/FE)
                  const progress = item.progress || {};
                  // Tổng nhiệm vụ được phân công
                  const assignedCount =
                    (progress.assigned ??
                      progress.total ??
                      item.assignedCount ??
                      progress.assignedCount ??
                      0) | 0;
                  // Số nhiệm vụ đã chấm
                  const scoredCount =
                    (progress.scored ??
                      item.scoredCount ??
                      progress.managerScored ??
                      0) | 0;
                  // Phần trăm tiến độ
                  const progressPercentage =
                    progress.percentage !== undefined &&
                    progress.percentage !== null
                      ? progress.percentage
                      : assignedCount > 0
                      ? Math.round((scoredCount / assignedCount) * 100)
                      : 0;

                  return (
                    <TableRow key={employee._id || index}>
                      <TableCell>{index + 1}</TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {employee.Ten || "N/A"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {employee.MaNhanVien || "N/A"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Typography variant="body2">
                          {employee.KhoaID?.TenKhoa || "—"}
                        </Typography>
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={`${scoredCount}/${assignedCount}`}
                          size="small"
                          color={
                            scoredCount === assignedCount && assignedCount > 0
                              ? "success"
                              : scoredCount > 0
                              ? "warning"
                              : "default"
                          }
                        />
                      </TableCell>

                      <TableCell align="center">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            justifyContent: "center",
                          }}
                        >
                          <Box sx={{ minWidth: 50 }}>
                            <Typography variant="body2" fontWeight={600}>
                              {progressPercentage}%
                            </Typography>
                          </Box>
                          <Box sx={{ width: "100%", maxWidth: 100 }}>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(progressPercentage, 100)}
                              color={
                                progressPercentage === 100 && assignedCount > 0
                                  ? "success"
                                  : progressPercentage > 0
                                  ? "warning"
                                  : "error"
                              }
                              sx={{ height: 8, borderRadius: 1 }}
                            />
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell align="center">
                        {/* ✅ V2 LOGIC: Chỉ hiển thị TongDiemKPI khi ĐÃ DUYỆT */}
                        {item.danhGiaKPI?.TrangThai === "DA_DUYET" &&
                        item.danhGiaKPI?.TongDiemKPI != null ? (
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 2,
                              py: 0.5,
                              borderRadius: 2,
                              bgcolor:
                                item.danhGiaKPI.TongDiemKPI >= 90
                                  ? "success.lighter"
                                  : item.danhGiaKPI.TongDiemKPI >= 80
                                  ? "info.lighter"
                                  : item.danhGiaKPI.TongDiemKPI >= 70
                                  ? "warning.lighter"
                                  : "error.lighter",
                              color:
                                item.danhGiaKPI.TongDiemKPI >= 90
                                  ? "success.main"
                                  : item.danhGiaKPI.TongDiemKPI >= 80
                                  ? "info.main"
                                  : item.danhGiaKPI.TongDiemKPI >= 70
                                  ? "warning.main"
                                  : "error.main",
                              fontWeight: "bold",
                            }}
                          >
                            {item.danhGiaKPI.TongDiemKPI.toFixed(1)}
                          </Box>
                        ) : (
                          <Chip
                            label="Chưa duyệt"
                            size="small"
                            color="default"
                            sx={{
                              fontStyle: "italic",
                              bgcolor: "grey.100",
                              color: "text.secondary",
                            }}
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {isApproved ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Đã duyệt"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<HourglassEmptyIcon />}
                            label="Chưa duyệt"
                            color="warning"
                            size="small"
                          />
                        )}
                      </TableCell>

                      <TableCell align="center">
                        {item.danhGiaKPI?.NgayDuyet ? (
                          <Stack spacing={0.5}>
                            <Typography variant="body2">
                              {dayjs(item.danhGiaKPI.NgayDuyet).format(
                                "DD/MM/YYYY"
                              )}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {dayjs(item.danhGiaKPI.NgayDuyet).format("HH:mm")}
                            </Typography>
                          </Stack>
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            —
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell align="center">
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="center"
                        >
                          <Tooltip
                            title={
                              assignedCount === 0
                                ? "Nhân viên chưa được phân công nhiệm vụ nào trong chu kỳ này"
                                : ""
                            }
                          >
                            <span>
                              <Button
                                size="small"
                                variant="contained"
                                onClick={() => handleEvaluate(employee)}
                                disabled={assignedCount === 0}
                              >
                                Đánh giá
                              </Button>
                            </span>
                          </Tooltip>
                          <Tooltip
                            title={
                              assignedCount === 0
                                ? "Nhân viên chưa được phân công nhiệm vụ nào trong chu kỳ này"
                                : ""
                            }
                          >
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleViewKPI(employee)}
                                disabled={assignedCount === 0}
                              >
                                Xem KPI
                              </Button>
                            </span>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Dialog chấm KPI theo tiêu chí (v2) */}
      <ChamDiemKPIDialog
        open={evaluationDialog.open}
        onClose={handleCloseDialog}
        nhanVien={evaluationDialog.employee}
        readOnly={evaluationDialog.readOnly}
      />
    </MainCard>
  );
}

export default KPIEvaluationPage;
