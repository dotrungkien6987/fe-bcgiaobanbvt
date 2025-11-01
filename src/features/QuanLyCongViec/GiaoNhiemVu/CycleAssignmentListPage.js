import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Alert,
  CircularProgress,
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
  Chip,
  alpha,
  useTheme,
  Tooltip,
  Avatar,
  Grid,
  Divider,
} from "@mui/material";
import {
  CalendarMonth,
  Assignment,
  PersonAdd,
  Person,
  Badge,
  Email,
  Business,
  TrendingUp,
  CheckCircle,
  Schedule,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import dayjs from "dayjs";

import apiService from "../../../app/apiService";
import MainCard from "components/MainCard";
import useAuth from "hooks/useAuth";

/**
 * CycleAssignmentListPage - Employee list view with cycle-based assignment stats
 * Flow: Select Cycle → View all managed employees → Click [Gán] to assign tasks
 */
const CycleAssignmentListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const { user } = useAuth();

  // State
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [managerInfo, setManagerInfo] = useState(null);

  // Fetch manager info on mount
  useEffect(() => {
    const fetchManagerInfo = async () => {
      if (!user?.NhanVienID) return;
      try {
        const response = await apiService.get(
          `/workmanagement/nhan-vien/${user.NhanVienID}`
        );
        setManagerInfo(response.data.data);
      } catch (error) {
        console.error("❌ Failed to fetch manager info:", error);
      }
    };
    fetchManagerInfo();
  }, [user]);

  // Fetch cycles on mount
  useEffect(() => {
    const fetchCycles = async () => {
      setLoadingCycles(true);
      try {
        const response = await apiService.get(
          "/workmanagement/chu-ky-danh-gia"
        );
        const cyclesData = response.data.data;

        if (cyclesData && Array.isArray(cyclesData.danhSach)) {
          setCycles(cyclesData.danhSach);
        } else if (Array.isArray(cyclesData)) {
          setCycles(cyclesData);
        } else {
          setCycles([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch cycles:", error);
        toast.error("Không thể tải danh sách chu kỳ");
        setCycles([]);
      } finally {
        setLoadingCycles(false);
      }
    };
    fetchCycles();
  }, []);

  // Fetch employees when cycle selected
  useEffect(() => {
    if (!selectedCycleId) {
      setEmployees([]);
      return;
    }

    const fetchEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const response = await apiService.get(
          `/workmanagement/giao-nhiem-vu/employees-with-cycle-stats?chuKyId=${selectedCycleId}`
        );

        const employeesData = response.data.data;
        if (Array.isArray(employeesData)) {
          setEmployees(employeesData);
        } else {
          console.warn("⚠️ Employees data is not an array:", employeesData);
          setEmployees([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch employees:", error);
        toast.error("Không thể tải danh sách nhân viên");
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, [selectedCycleId]);

  const handleCycleChange = (event) => {
    const cycleId = event.target.value;
    setSelectedCycleId(cycleId);

    // Find and store the full cycle object
    const cycle = safeCycles.find((c) => c._id === cycleId);
    setSelectedCycle(cycle || null);
  };

  const handleAssignTasks = (employeeId) => {
    // Navigate to detail page with cycle context
    navigate(
      `/quanlycongviec/giao-nhiem-vu-chu-ky/${employeeId}?chuKyId=${selectedCycleId}`
    );
  };

  const getProgressColor = (assigned, total) => {
    if (total === 0) return "default";
    const percentage = (assigned / total) * 100;
    if (percentage === 0) return "error";
    if (percentage < 50) return "warning";
    if (percentage < 100) return "info";
    return "success";
  };

  const safeCycles = Array.isArray(cycles) ? cycles : [];
  const safeEmployees = Array.isArray(employees) ? employees : [];

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.03
        )} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
        minHeight: "100vh",
      }}
    >
      {/* Header with Manager Info */}
      <Stack spacing={3} mb={4}>
        <Box>
          <Typography
            variant="h3"
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              mb: 1,
            }}
          >
            📅 Giao nhiệm vụ theo chu kỳ
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Phân công nhiệm vụ cho nhân viên theo chu kỳ đánh giá
          </Typography>
        </Box>

        {/* Manager Info Card */}
        {managerInfo && (
          <Card
            elevation={0}
            sx={{
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.08
              )} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: theme.palette.primary.main,
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    {managerInfo.Ten?.charAt(0)?.toUpperCase() || "Q"}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Quản lý: {managerInfo.Ten || user?.HoTen}
                  </Typography>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    divider={
                      <Divider
                        orientation="vertical"
                        flexItem
                        sx={{ display: { xs: "none", sm: "block" } }}
                      />
                    }
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Badge
                        sx={{ color: theme.palette.primary.main, fontSize: 18 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {managerInfo.MaNhanVien || "N/A"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email
                        sx={{ color: theme.palette.primary.main, fontSize: 18 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {user?.Email || "N/A"}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Business
                        sx={{ color: theme.palette.primary.main, fontSize: 18 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {managerInfo.KhoaID?.TenKhoa || "N/A"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Cycle Selector */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          background: alpha(theme.palette.background.paper, 0.8),
          backdropFilter: "blur(10px)",
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Chọn chu kỳ đánh giá</InputLabel>
              <Select
                value={selectedCycleId}
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
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                {safeCycles.map((cycle) => (
                  <MenuItem key={cycle._id} value={cycle._id}>
                    <Stack spacing={0.5} sx={{ py: 0.5 }}>
                      <Typography fontWeight={600}>{cycle.TenChuKy}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {cycle.NgayBatDau
                          ? dayjs(cycle.NgayBatDau).format("DD/MM/YYYY")
                          : "N/A"}{" "}
                        -{" "}
                        {cycle.NgayKetThuc
                          ? dayjs(cycle.NgayKetThuc).format("DD/MM/YYYY")
                          : "N/A"}
                      </Typography>
                    </Stack>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Selected Cycle Info */}
            {selectedCycle && (
              <Card
                elevation={0}
                sx={{
                  bgcolor: alpha(theme.palette.info.main, 0.05),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <CardContent sx={{ py: 1.5 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Schedule sx={{ color: "info.main", fontSize: 20 }} />
                        <Typography variant="body2" fontWeight={500}>
                          Bắt đầu:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedCycle.NgayBatDau
                            ? dayjs(selectedCycle.NgayBatDau).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <CheckCircle
                          sx={{ color: "info.main", fontSize: 20 }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          Kết thúc:
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {selectedCycle.NgayKetThuc
                            ? dayjs(selectedCycle.NgayKetThuc).format(
                                "DD/MM/YYYY"
                              )
                            : "N/A"}
                        </Typography>
                      </Stack>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Employee List */}
      {!selectedCycleId ? (
        <Alert
          severity="info"
          icon={<CalendarMonth />}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
          }}
        >
          Vui lòng chọn chu kỳ đánh giá để xem danh sách nhân viên
        </Alert>
      ) : loadingEmployees ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <Stack spacing={2} alignItems="center">
            <CircularProgress size={48} />
            <Typography variant="body2" color="text.secondary">
              Đang tải danh sách nhân viên...
            </Typography>
          </Stack>
        </Box>
      ) : safeEmployees.length === 0 ? (
        <Alert
          severity="warning"
          icon={<PersonAdd />}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
          }}
        >
          Không có nhân viên nào trong quyền quản lý của bạn
        </Alert>
      ) : (
        <MainCard
          elevation={0}
          sx={{
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            borderRadius: 2,
          }}
          title={
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", sm: "center" }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: theme.palette.primary.main,
                    width: 40,
                    height: 40,
                  }}
                >
                  <Person />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    Danh sách nhân viên
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {safeEmployees.length} nhân viên được quản lý
                  </Typography>
                </Box>
              </Stack>
              <Chip
                icon={<TrendingUp />}
                label={`Tổng độ khó: ${safeEmployees
                  .reduce((sum, e) => sum + (e.totalMucDoKho || 0), 0)
                  .toFixed(1)}`}
                color="primary"
                sx={{ fontWeight: 600 }}
              />
            </Stack>
          }
        >
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
            }}
          >
            <Table>
              <TableHead>
                <TableRow
                  sx={{
                    background: `linear-gradient(135deg, ${alpha(
                      theme.palette.primary.main,
                      0.1
                    )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Mã NV</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Khoa</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Loại quản lý</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Nhiệm vụ đã gán
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Tổng độ khó
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>
                    Thao tác
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {safeEmployees.map((item, index) => {
                  const {
                    employee,
                    assignedCount,
                    totalDuties,
                    totalMucDoKho,
                    LoaiQuanLy,
                  } = item;
                  const isFullyAssigned =
                    assignedCount === totalDuties && totalDuties > 0;
                  return (
                    <TableRow
                      key={employee._id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          transform: "scale(1.001)",
                          transition: "all 0.2s ease-in-out",
                        },
                        bgcolor: isFullyAssigned
                          ? alpha(theme.palette.success.main, 0.02)
                          : "transparent",
                      }}
                    >
                      <TableCell>
                        <Chip
                          label={index + 1}
                          size="small"
                          sx={{
                            minWidth: 32,
                            height: 28,
                            fontWeight: 600,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {employee.MaNhanVien}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: alpha(theme.palette.primary.main, 0.1),
                              color: "primary.main",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            {employee.Ten?.charAt(0)?.toUpperCase() || "?"}
                          </Avatar>
                          <Typography variant="body2" fontWeight={500}>
                            {employee.Ten}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={employee.KhoaID?.TenKhoa || "N/A"}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={LoaiQuanLy === "KPI" ? "KPI" : "Giao việc"}
                          size="small"
                          color={LoaiQuanLy === "KPI" ? "primary" : "default"}
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip
                          title={`${assignedCount} nhiệm vụ đã gán / ${totalDuties} tổng nhiệm vụ`}
                        >
                          <Chip
                            label={`${assignedCount} / ${totalDuties}`}
                            color={getProgressColor(assignedCount, totalDuties)}
                            size="small"
                            sx={{
                              minWidth: 80,
                              fontWeight: 700,
                              boxShadow: isFullyAssigned
                                ? `0 0 8px ${alpha(
                                    theme.palette.success.main,
                                    0.3
                                  )}`
                                : "none",
                            }}
                          />
                        </Tooltip>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={totalMucDoKho?.toFixed(1) || "0.0"}
                          size="small"
                          sx={{
                            minWidth: 60,
                            fontWeight: 700,
                            bgcolor:
                              totalMucDoKho === 0
                                ? alpha(theme.palette.grey[500], 0.1)
                                : totalMucDoKho > 50
                                ? alpha(theme.palette.error.main, 0.1)
                                : totalMucDoKho > 30
                                ? alpha(theme.palette.warning.main, 0.1)
                                : alpha(theme.palette.success.main, 0.1),
                            color:
                              totalMucDoKho === 0
                                ? "text.disabled"
                                : totalMucDoKho > 50
                                ? "error.main"
                                : totalMucDoKho > 30
                                ? "warning.main"
                                : "success.main",
                            border: `1px solid ${
                              totalMucDoKho === 0
                                ? alpha(theme.palette.grey[500], 0.2)
                                : totalMucDoKho > 50
                                ? alpha(theme.palette.error.main, 0.3)
                                : totalMucDoKho > 30
                                ? alpha(theme.palette.warning.main, 0.3)
                                : alpha(theme.palette.success.main, 0.3)
                            }`,
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Gán nhiệm vụ cho nhân viên này">
                          <Button
                            variant="contained"
                            size="small"
                            startIcon={<Assignment />}
                            onClick={() => handleAssignTasks(employee._id)}
                            sx={{
                              borderRadius: 1.5,
                              textTransform: "none",
                              fontWeight: 600,
                              boxShadow: `0 2px 8px ${alpha(
                                theme.palette.primary.main,
                                0.2
                              )}`,
                              "&:hover": {
                                boxShadow: `0 4px 12px ${alpha(
                                  theme.palette.primary.main,
                                  0.3
                                )}`,
                              },
                            }}
                          >
                            Gán
                          </Button>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Summary */}
          <Card
            elevation={0}
            sx={{
              mt: 3,
              background: `linear-gradient(135deg, ${alpha(
                theme.palette.info.main,
                0.08
              )} 0%, ${alpha(theme.palette.info.main, 0.03)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Tổng số nhân viên
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {safeEmployees.length}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Đã gán đầy đủ
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="success.main"
                    >
                      {
                        safeEmployees.filter(
                          (e) =>
                            e.assignedCount === e.totalDuties &&
                            e.totalDuties > 0
                        ).length
                      }
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Chưa gán
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="warning.main"
                    >
                      {
                        safeEmployees.filter((e) => e.assignedCount === 0)
                          .length
                      }
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Stack spacing={0.5}>
                    <Typography variant="caption" color="text.secondary">
                      Tổng độ khó
                    </Typography>
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="primary.main"
                    >
                      {safeEmployees
                        .reduce((sum, e) => sum + (e.totalMucDoKho || 0), 0)
                        .toFixed(1)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </MainCard>
      )}
    </Box>
  );
};

export default CycleAssignmentListPage;
