import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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
  TextField,
  LinearProgress,
  Fab,
  Breadcrumbs,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { useDispatch, useSelector } from "react-redux";
import {
  getCycles,
  setSelectedCycle,
  getEmployeesForEvaluation,
} from "../kpiEvaluationSlice";
// Dùng dialog chấm KPI theo tiêu chí (UI/UX cũ - backup)
import ChamDiemKPIDialog from "../v2/components/ChamDiemKPIDialog";
import { getChamDiemDetail } from "../kpiSlice";
import LoadingScreen from "components/LoadingScreen";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import HomeIcon from "@mui/icons-material/Home";
import FilterListIcon from "@mui/icons-material/FilterList";
import dayjs from "dayjs";

// ✅ Import new mobile components
import KPIStatsGrid from "../components/KPIStatsGrid";
import KPIEmployeeCard from "../components/KPIEmployeeCard";
import KPICycleSelector from "../components/KPICycleSelector";
import KPIFilterDrawer from "../components/KPIFilterDrawer";

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
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { cycles, selectedCycleId, employees, isLoading, error } = useSelector(
    (state) => state.kpiEvaluation,
  );

  const [evaluationDialog, setEvaluationDialog] = useState({
    open: false,
    employee: null,
    readOnly: false,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [filterKhoa, setFilterKhoa] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

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
      (e) => e.danhGiaKPI?.TrangThai === "DA_DUYET",
    ).length;
    const pending = total - evaluated;

    // ✅ V2 LOGIC: Chỉ tính điểm trung bình cho KPI ĐÃ DUYỆT
    const evaluatedEmployees = employees.filter(
      (e) =>
        e.danhGiaKPI?.TrangThai === "DA_DUYET" &&
        e.danhGiaKPI?.TongDiemKPI != null,
    );
    const avgScore =
      evaluatedEmployees.length > 0
        ? evaluatedEmployees.reduce(
            (sum, e) => sum + e.danhGiaKPI.TongDiemKPI,
            0,
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

  // Handle evaluate button click - Navigate to route-based scoring page
  const handleEvaluate = (employee) => {
    if (selectedCycleId && employee?._id) {
      navigate(
        `/quanlycongviec/kpi/cham-diem/${employee._id}?chuky=${selectedCycleId}`,
      );
    }
  };

  // Handle view KPI (Read-only mode) - Navigate with readonly param
  const handleViewKPI = (employee) => {
    if (selectedCycleId && employee?._id) {
      navigate(
        `/quanlycongviec/kpi/cham-diem/${employee._id}?chuky=${selectedCycleId}&readonly=true`,
      );
    }
  };

  // Handle open dialog for evaluate (legacy UI)
  const handleEvaluateDialog = (employee) => {
    if (selectedCycleId && employee?._id) {
      // Load KPI data first
      dispatch(getChamDiemDetail(selectedCycleId, employee._id));
      // Then open dialog
      setEvaluationDialog({
        open: true,
        employee: employee,
        readOnly: false,
      });
    }
  };

  // Handle open dialog for view (legacy UI)
  const handleViewKPIDialog = (employee) => {
    if (selectedCycleId && employee?._id) {
      // Load KPI data first
      dispatch(getChamDiemDetail(selectedCycleId, employee._id));
      // Then open dialog
      setEvaluationDialog({
        open: true,
        employee: employee,
        readOnly: true,
      });
    }
  };

  // Handle dialog close
  const handleCloseDialog = () => {
    setEvaluationDialog({
      open: false,
      employee: null,
      readOnly: false,
    });
  };

  // Handle apply filters from drawer
  const handleApplyFilters = (filters) => {
    setSearchTerm(filters.searchTerm || "");
    setFilterKhoa(filters.filterKhoa || "");
    setFilterStatus(filters.filterStatus || "");
  };

  // Handle reset filters from drawer
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilterKhoa("");
    setFilterStatus("");
  };

  // Handle cycle change from selector
  const handleCycleSelectorChange = (cycleId) => {
    dispatch(setSelectedCycle(cycleId));
  };

  // Handle evaluate from mobile card
  const handleEvaluateFromCard = (item) => {
    const employee = item?.employee || {};
    if (selectedCycleId && employee?._id) {
      navigate(
        `/quanlycongviec/kpi/cham-diem/${employee._id}?chuky=${selectedCycleId}`,
      );
    }
  };

  // Handle view KPI from mobile card
  const handleViewKPIFromCard = (item) => {
    const employee = item?.employee || {};
    if (selectedCycleId && employee?._id) {
      navigate(
        `/quanlycongviec/kpi/cham-diem/${employee._id}?chuky=${selectedCycleId}&readonly=true`,
      );
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "secondary.lighter",
        pb: 10,
      }}
    >
      {/* Header Section - Edge-to-edge on mobile */}
      <Box
        sx={{
          bgcolor: "background.paper",
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
          mb: { xs: 0, md: 2 },
        }}
      >
        <Box
          sx={{
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
            px: { xs: 0, md: 3 },
          }}
        >
          {/* Breadcrumbs */}
          <Breadcrumbs
            sx={{ px: { xs: 2, md: 0 }, pt: { xs: 2, md: 3 }, pb: 1 }}
          >
            <Link
              underline="hover"
              color="inherit"
              href="/"
              sx={{ display: "flex", alignItems: "center" }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Trang chủ
            </Link>
            <Link underline="hover" color="inherit" href="/quanlycongviec">
              Quản lý công việc
            </Link>
            <Typography color="text.primary">Đánh giá KPI</Typography>
          </Breadcrumbs>

          {/* Header */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            sx={{
              px: { xs: 2, md: 0 },
              py: { xs: 2, md: 0 },
              pb: { xs: 2, md: 3 },
            }}
          >
            <Box>
              <Typography variant="h4" fontWeight="bold" gutterBottom>
                📊 Đánh giá KPI nhân viên
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chọn chu kỳ và đánh giá KPI cho nhân viên
              </Typography>
            </Box>
            {/* Desktop filter button */}
            {!isMobile && (
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setFilterOpen(true)}
              >
                Lọc
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Cycle Selector Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: { xs: 0, md: 2 },
          mb: { xs: 0, md: 1 },
          borderTop: { xs: "1px solid", md: "none" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
        }}
      >
        <Box
          sx={{
            px: { xs: 0, md: 3 },
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          <KPICycleSelector
            cycles={cycles}
            selectedCycleId={selectedCycleId}
            onChange={handleCycleSelectorChange}
            isLoading={isLoading}
            isMobile={isMobile}
          />
        </Box>
      </Box>

      {/* Stats Grid Section */}
      {selectedCycleId && employees.length > 0 && (
        <Box
          sx={{
            bgcolor: "background.paper",
            py: 2,
            mb: { xs: 0, md: 1 },
            borderTop: { xs: "1px solid", md: "none" },
            borderBottom: { xs: "1px solid", md: "none" },
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              maxWidth: { xs: "100%", md: "lg" },
              mx: { xs: 0, md: "auto" },
            }}
          >
            <KPIStatsGrid stats={stats} />
          </Box>
        </Box>
      )}

      {/* Desktop: Search and Filter Row */}
      {!isMobile && selectedCycleId && employees.length > 0 && (
        <Box
          sx={{
            bgcolor: "background.paper",
            py: 2,
            mb: 1,
          }}
        >
          <Box
            sx={{
              px: { xs: 2, md: 3 },
              maxWidth: { xs: "100%", md: "lg" },
              mx: { xs: 0, md: "auto" },
            }}
          >
            <Card sx={{ mb: 0 }}>
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
          </Box>
        </Box>
      )}

      {/* Mobile: Filter Chips */}
      {isMobile && (searchTerm || filterKhoa || filterStatus) && (
        <Box
          sx={{
            bgcolor: "background.paper",
            py: 1.5,
            mb: 0,
            borderTop: "1px solid",
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            sx={{ px: 2, gap: 0.5 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ alignSelf: "center" }}
            >
              Bộ lọc:
            </Typography>
            {searchTerm && (
              <Chip
                label={`"${searchTerm}"`}
                size="small"
                onDelete={() => setSearchTerm("")}
              />
            )}
            {filterKhoa && (
              <Chip
                label={filterKhoa}
                size="small"
                onDelete={() => setFilterKhoa("")}
              />
            )}
            {filterStatus && (
              <Chip
                label={filterStatus === "DA_DUYET" ? "Đã duyệt" : "Chưa duyệt"}
                size="small"
                onDelete={() => setFilterStatus("")}
              />
            )}
          </Stack>
        </Box>
      )}

      {/* Content Section */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: { xs: 2, md: 3 },
          mb: { xs: 0, md: 1 },
          borderTop: { xs: "1px solid", md: "none" },
          borderBottom: { xs: "1px solid", md: "none" },
          borderColor: "divider",
          minHeight: "50vh",
        }}
      >
        <Box
          sx={{
            px: { xs: 0, md: 3 },
            maxWidth: { xs: "100%", md: "lg" },
            mx: { xs: 0, md: "auto" },
          }}
        >
          {/* Instructions */}
          {selectedCycleId && !isMobile && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Chọn nhân viên để đánh giá KPI. Nhập điểm từ 0-10 cho từng nhiệm
              vụ.
            </Alert>
          )}

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, mx: { xs: 2, md: 0 } }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {isLoading && <LoadingScreen />}

          {/* Empty State */}
          {!isLoading && selectedCycleId && filteredEmployees.length === 0 && (
            <Alert severity="warning" sx={{ mx: { xs: 2, md: 0 } }}>
              {employees.length === 0
                ? "Không có nhân viên nào trong chu kỳ này"
                : "Không tìm thấy nhân viên phù hợp với bộ lọc"}
            </Alert>
          )}

          {/* ========== MOBILE: Employee Cards ========== */}
          {!isLoading &&
            isMobile &&
            selectedCycleId &&
            filteredEmployees.length > 0 && (
              <Stack spacing={2} sx={{ px: 2 }}>
                {filteredEmployees.map((item, index) => (
                  <KPIEmployeeCard
                    key={item.employee?._id || index}
                    employee={item}
                    onEvaluate={handleEvaluateFromCard}
                    onViewKPI={handleViewKPIFromCard}
                    index={index}
                  />
                ))}
              </Stack>
            )}

          {/* ========== DESKTOP: Employees Table ========== */}
          {!isLoading &&
            !isMobile &&
            selectedCycleId &&
            filteredEmployees.length > 0 && (
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
                      const employee = item.employee || item.nhanVien || {};
                      const danhGiaKPI = item.danhGiaKPI || null;
                      const isApproved = danhGiaKPI?.TrangThai === "DA_DUYET";

                      const progress = item.progress || {};
                      const assignedCount =
                        (progress.assigned ??
                          progress.total ??
                          item.assignedCount ??
                          progress.assignedCount ??
                          0) | 0;
                      const scoredCount =
                        (progress.scored ??
                          item.scoredCount ??
                          progress.managerScored ??
                          0) | 0;
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
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500 }}
                            >
                              {employee.Ten || "N/A"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
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
                                scoredCount === assignedCount &&
                                assignedCount > 0
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
                                    progressPercentage === 100 &&
                                    assignedCount > 0
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
                                    "DD/MM/YYYY",
                                  )}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {dayjs(item.danhGiaKPI.NgayDuyet).format(
                                    "HH:mm",
                                  )}
                                </Typography>
                              </Stack>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
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
                              <Tooltip title="Mở form dialog (UI cũ)">
                                <span>
                                  <Button
                                    size="small"
                                    variant="text"
                                    color="secondary"
                                    onClick={() =>
                                      handleEvaluateDialog(employee)
                                    }
                                    disabled={assignedCount === 0}
                                  >
                                    Dialog
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
      </Box>

      {/* Mobile FAB for Filter */}
      {isMobile && (
        <Fab
          color="default"
          aria-label="Lọc"
          onClick={() => setFilterOpen(true)}
          sx={{
            position: "fixed",
            bottom: { xs: 80, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1200,
            boxShadow: 4,
          }}
        >
          <FilterListIcon />
        </Fab>
      )}

      {/* Filter Drawer */}
      <KPIFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={{ searchTerm, filterKhoa, filterStatus }}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        khoaList={khoaList}
      />

      {/* Dialog chấm KPI theo tiêu chí (v2) */}
      <ChamDiemKPIDialog
        open={evaluationDialog.open}
        onClose={handleCloseDialog}
        nhanVien={evaluationDialog.employee}
        readOnly={evaluationDialog.readOnly}
      />
    </Box>
  );
}

export default KPIEvaluationPage;
