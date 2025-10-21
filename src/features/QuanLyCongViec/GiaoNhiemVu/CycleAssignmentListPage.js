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
} from "@mui/material";
import { CalendarMonth, Assignment, PersonAdd } from "@mui/icons-material";
import { toast } from "react-toastify";

import apiService from "../../../app/apiService";
import MainCard from "components/MainCard";

/**
 * CycleAssignmentListPage - Employee list view with cycle-based assignment stats
 * Flow: Select Cycle → View all managed employees → Click [Gán] to assign tasks
 */
const CycleAssignmentListPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  // State
  const [cycles, setCycles] = useState([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [employees, setEmployees] = useState([]);
  const [loadingCycles, setLoadingCycles] = useState(false);
  const [loadingEmployees, setLoadingEmployees] = useState(false);

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
    setSelectedCycleId(event.target.value);
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
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Stack spacing={1} mb={3}>
        <Typography variant="h4" fontWeight={600}>
          📅 Giao nhiệm vụ theo chu kỳ
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Chọn chu kỳ và xem danh sách nhân viên để phân công nhiệm vụ
        </Typography>
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
          <FormControl fullWidth sx={{ maxWidth: 500 }}>
            <InputLabel>Chọn chu kỳ đánh giá</InputLabel>
            <Select
              value={selectedCycleId}
              onChange={handleCycleChange}
              label="Chọn chu kỳ đánh giá"
              disabled={loadingCycles}
              startAdornment={
                <CalendarMonth sx={{ mr: 1, color: "action.active" }} />
              }
            >
              {safeCycles.map((cycle) => (
                <MenuItem key={cycle._id} value={cycle._id}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography>{cycle.TenChuKy}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({new Date(cycle.TuNgay).toLocaleDateString()} -{" "}
                      {new Date(cycle.DenNgay).toLocaleDateString()})
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </CardContent>
      </Card>

      {/* Employee List */}
      {!selectedCycleId ? (
        <Alert severity="info" icon={<CalendarMonth />}>
          Vui lòng chọn chu kỳ đánh giá để xem danh sách nhân viên
        </Alert>
      ) : loadingEmployees ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      ) : safeEmployees.length === 0 ? (
        <Alert severity="warning" icon={<PersonAdd />}>
          Không có nhân viên nào trong quyền quản lý của bạn
        </Alert>
      ) : (
        <MainCard
          title={
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography variant="h6">
                📊 Danh sách nhân viên ({safeEmployees.length})
              </Typography>
            </Stack>
          }
        >
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08) }}
                >
                  <TableCell sx={{ fontWeight: 600 }}>STT</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Mã NV</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Họ tên</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Khoa</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Loại quản lý</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Nhiệm vụ đã gán
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
                    Tổng độ khó
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>
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
                  return (
                    <TableRow
                      key={employee._id}
                      hover
                      sx={{
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.02),
                        },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {employee.MaNhanVien}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {employee.Ten}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {employee.KhoaID?.TenKhoa || "N/A"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={LoaiQuanLy === "KPI" ? "KPI" : "Giao việc"}
                          size="small"
                          color={LoaiQuanLy === "KPI" ? "primary" : "default"}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${assignedCount} / ${totalDuties}`}
                          color={getProgressColor(assignedCount, totalDuties)}
                          size="small"
                          sx={{ minWidth: 70, fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={
                            totalMucDoKho === 0
                              ? "text.disabled"
                              : totalMucDoKho > 50
                              ? "error.main"
                              : totalMucDoKho > 30
                              ? "warning.main"
                              : "success.main"
                          }
                        >
                          {totalMucDoKho?.toFixed(1) || "0.0"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Gán nhiệm vụ cho nhân viên này">
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<Assignment />}
                            onClick={() => handleAssignTasks(employee._id)}
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
          <Box
            mt={2}
            p={2}
            bgcolor={alpha(theme.palette.info.main, 0.05)}
            borderRadius={1}
          >
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                Tổng số nhân viên: <strong>{safeEmployees.length}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Đã gán đầy đủ:{" "}
                <strong>
                  {
                    safeEmployees.filter(
                      (e) =>
                        e.assignedCount === e.totalDuties && e.totalDuties > 0
                    ).length
                  }
                </strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Chưa gán:{" "}
                <strong>
                  {safeEmployees.filter((e) => e.assignedCount === 0).length}
                </strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng độ khó (toàn bộ):{" "}
                <strong>
                  {safeEmployees
                    .reduce((sum, e) => sum + (e.totalMucDoKho || 0), 0)
                    .toFixed(1)}
                </strong>
              </Typography>
            </Stack>
          </Box>
        </MainCard>
      )}
    </Box>
  );
};

export default CycleAssignmentListPage;
