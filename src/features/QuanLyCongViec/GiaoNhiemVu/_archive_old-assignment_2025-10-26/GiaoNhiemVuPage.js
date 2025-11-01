import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchManagedEmployees,
  fetchDutiesByEmployee,
  fetchAssignmentsByEmployee,
  fetchManagerInfo,
  fetchAssignmentTotals,
  setSelectedEmployee,
  assignDuty,
  unassignById,
} from "../giaoNhiemVuSlice";
import EmployeeList from "./EmployeeList";
import DutyPicker from "./DutyPicker";
import AssignmentTable from "./AssignmentTable";
import {
  Box,
  CircularProgress,
  Grid,
  Typography,
  alpha,
  useTheme,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Drawer,
  IconButton,
  Divider,
  Stack,
  useMediaQuery,
  Badge,
} from "@mui/material";
import {
  Assignment,
  People,
  Task,
  ChevronLeft,
  TrendingUp,
  PersonPin,
  Close,
  Menu,
} from "@mui/icons-material";

const GiaoNhiemVuPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm")); // Thêm breakpoint cho màn hình nhỏ
  const { NhanVienID } = useParams();

  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(!isMobile);
  const [selectedEmployee, setSelectedEmployeeState] = useState(null);

  const {
    employees,
    selectedEmployeeId,
    duties,
    assignments,
    isLoading,
    managerInfo,
    totalsByEmployeeId,
  } = useSelector((s) => s.giaoNhiemVu);

  // Effects giữ nguyên như cũ
  useEffect(() => {
    if (NhanVienID) {
      dispatch(fetchManagedEmployees(NhanVienID));
      dispatch(fetchManagerInfo(NhanVienID));
    }
  }, [NhanVienID, dispatch]);

  useEffect(() => {
    if (!selectedEmployeeId && employees?.length > 0) {
      const raw = employees[0]?.ThongTinNhanVienDuocQuanLy;
      const info = Array.isArray(raw) ? raw[0] : raw;
      const first = info?._id || employees[0]?.NhanVienDuocQuanLy;
      if (first) {
        dispatch(setSelectedEmployee(first));
        setSelectedEmployeeState(info || employees[0]);
      }
    }
    if (employees?.length > 0) {
      const ids = employees
        .map((e) => {
          const raw = e.ThongTinNhanVienDuocQuanLy;
          const info = Array.isArray(raw) ? raw[0] : raw;
          return info?._id || e?.NhanVienDuocQuanLy;
        })
        .filter(Boolean);
      if (ids.length > 0) dispatch(fetchAssignmentTotals(ids));
    }
  }, [employees, selectedEmployeeId, dispatch]);

  useEffect(() => {
    if (selectedEmployeeId) {
      dispatch(fetchDutiesByEmployee(selectedEmployeeId));
      dispatch(fetchAssignmentsByEmployee(selectedEmployeeId));
      dispatch(fetchAssignmentTotals([selectedEmployeeId]));
    }
  }, [selectedEmployeeId, dispatch]);

  // Handle employee selection
  const handleEmployeeSelect = (employeeId, employeeInfo) => {
    dispatch(setSelectedEmployee(employeeId));
    setSelectedEmployeeState(employeeInfo);
    if (isMobile) {
      setEmployeeDrawerOpen(false);
    }
  };

  // Get current employee totals
  const currentTotals = totalsByEmployeeId[selectedEmployeeId] || {
    totalMucDoKho: 0,
    assignmentCount: 0,
  };

  // Employee Drawer Content
  const EmployeeDrawerContent = () => (
    <Box
      sx={{
        width: 320,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minWidth: 280, // Width tối thiểu
        overflowX: "auto", // Cuộn ngang cho drawer
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          minWidth: 260, // Width tối thiểu cho header
          whiteSpace: "nowrap",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <People color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Nhân viên ({employees.length})
          </Typography>
        </Box>
        {isMobile && (
          <IconButton onClick={() => setEmployeeDrawerOpen(false)}>
            <Close />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflow: "auto", p: 1 }}>
        <EmployeeList
          employees={employees}
          selectedEmployeeId={selectedEmployeeId}
          onSelect={handleEmployeeSelect}
          totalsByEmployeeId={totalsByEmployeeId}
        />
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{
        height: "100vh",
        overflow: "hidden",
        backgroundColor: alpha(theme.palette.grey[50], 0.8),
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Compact Top Bar */}
      <Box
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
          px: 3,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 2,
          minHeight: 64,
        }}
      >
        {/* Manager Info - Compact */}
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Avatar
            sx={{ bgcolor: theme.palette.primary.main, width: 40, height: 40 }}
          >
            <PersonPin />
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {managerInfo?.Ten || "Đang tải..."}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {managerInfo?.MaNhanVien} •{" "}
              {managerInfo?.KhoaID?.TenKhoa || "N/A"}
            </Typography>
          </Box>
        </Box>

        {/* Quick Stats */}
        <Stack direction="row" spacing={1}>
          <Chip
            icon={<People />}
            label={`${employees.length} NV`}
            size="small"
            color="primary"
            variant="outlined"
          />
          <Chip
            icon={<Task />}
            label={`${duties.length} NV khả dụng`}
            size="small"
            color="secondary"
            variant="outlined"
          />
          {isLoading && <CircularProgress size={20} />}
        </Stack>
      </Box>

      {/* Main Content Area */}
      {isSmallScreen ? (
        // Layout mobile: Card chọn nhân viên không giới hạn chiều cao, hai card nhiệm vụ luôn hiển thị khi đã chọn nhân viên
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minHeight: "calc(100vh - 180px)",
          }}
        >
          {/* Employee Selection Card */}
          <Card
            variant="outlined"
            sx={{
              display: "flex",
              flexDirection: "column",
              borderRadius: 3,
            }}
          >
            <CardHeader
              avatar={
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <People />
                </Avatar>
              }
              title="Chọn nhân viên"
              subheader={`${employees.length} nhân viên`}
              action={
                selectedEmployee && (
                  <Chip
                    label={`${selectedEmployee.Ten || "N/A"}`}
                    color="primary"
                    variant="filled"
                    size="small"
                  />
                )
              }
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                borderBottom: `1px solid ${theme.palette.divider}`,
                flexShrink: 0,
              }}
            />
            <CardContent sx={{ overflow: "auto", p: 1 }}>
              <EmployeeList
                employees={employees}
                selectedEmployeeId={selectedEmployeeId}
                onSelect={handleEmployeeSelect}
                totalsByEmployeeId={totalsByEmployeeId}
              />
            </CardContent>
          </Card>

          {/* Selected Employee Info - Mobile */}
          {selectedEmployee && (
            <Card
              variant="outlined"
              sx={{
                borderRadius: 3,
                bgcolor: alpha(theme.palette.success.main, 0.05),
                flexShrink: 0,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={1}>
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <PersonPin />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" fontWeight={600} noWrap>
                      {selectedEmployee.Ten || "N/A"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {selectedEmployee.MaNhanVien} •{" "}
                      {selectedEmployee.KhoaID?.TenKhoa || "N/A"}
                    </Typography>
                  </Box>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip
                    icon={<TrendingUp />}
                    label={`Tổng MĐK: ${Number(
                      currentTotals.totalMucDoKho || 0
                    ).toFixed(1)}`}
                    color="success"
                    variant="filled"
                    size="small"
                  />
                  <Chip
                    icon={<Assignment />}
                    label={`${assignments.length} nhiệm vụ`}
                    color="primary"
                    variant="outlined"
                    size="small"
                  />
                </Stack>
              </CardContent>
            </Card>
          )}

          {/* Duty Assignment Section - Mobile */}
          {selectedEmployeeId && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Available Duties */}
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  height: "300px",
                  display: "flex",
                  flexDirection: "column",
                  flexShrink: 0,
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <Task />
                    </Avatar>
                  }
                  title="Nhiệm vụ khả dụng"
                  subheader="Nhấp để gán"
                  action={
                    <Chip
                      label={`${duties.length} khả dụng`}
                      color="secondary"
                      size="small"
                    />
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.secondary.main, 0.05),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    flexShrink: 0,
                  }}
                />
                <CardContent sx={{ p: 0, flex: 1, overflow: "auto" }}>
                  <DutyPicker
                    duties={duties}
                    onPick={(d) =>
                      dispatch(
                        assignDuty({
                          employeeId: selectedEmployeeId,
                          dutyId: d._id,
                        })
                      )
                    }
                    selectedEmployeeId={selectedEmployeeId}
                  />
                </CardContent>
              </Card>

              {/* Assigned Tasks */}
              <Card
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  height: "300px",
                  display: "flex",
                  flexDirection: "column",
                  flexShrink: 0,
                  mb: 4,
                }}
              >
                <CardHeader
                  avatar={
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      <Assignment />
                    </Avatar>
                  }
                  title="Nhiệm vụ đã gán"
                  subheader="Danh sách thực hiện"
                  action={
                    <Chip
                      label={`${assignments.length} nhiệm vụ`}
                      color="success"
                      size="small"
                    />
                  }
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    flexShrink: 0,
                  }}
                />
                <CardContent sx={{ p: 0, flex: 1, overflow: "auto" }}>
                  <AssignmentTable
                    assignments={assignments}
                    onUnassign={(id) => dispatch(unassignById(id))}
                    selectedEmployeeId={selectedEmployeeId}
                  />
                </CardContent>
              </Card>
            </Box>
          )}
        </Box>
      ) : (
        // Layout bình thường cho màn hình lớn
        <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Employee Drawer */}
          <Drawer
            variant="temporary"
            anchor="left"
            open={employeeDrawerOpen}
            onClose={() => setEmployeeDrawerOpen(false)}
            sx={{
              "& .MuiDrawer-paper": {
                width: 320,
                border: "none",
                borderRight: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <EmployeeDrawerContent />
          </Drawer>

          {/* Main Workspace */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              width: "100%", // Đảm bảo chiếm toàn bộ width
            }}
          >
            {/* Workspace Header */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: "background.paper",
                display: "flex",
                alignItems: "center",
                gap: 2,
              }}
            >
              {/* Toggle Button */}
              <IconButton
                onClick={() => setEmployeeDrawerOpen(!employeeDrawerOpen)}
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  "&:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                {employeeDrawerOpen ? <ChevronLeft /> : <Menu />}
              </IconButton>

              {/* Selected Employee Info */}
              {selectedEmployee && (
                <>
                  <Divider orientation="vertical" flexItem />
                  <Box
                    sx={{
                      flex: 1,
                      minWidth: 0,
                      overflow: "hidden",
                    }}
                  >
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedEmployee.Ten || "Chưa chọn nhân viên"}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {selectedEmployee.MaNhanVien} •{" "}
                      {selectedEmployee.KhoaID?.TenKhoa || "N/A"}
                    </Typography>
                  </Box>

                  {/* Live KPI Chips */}
                  <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                    <Chip
                      icon={<TrendingUp />}
                      label={`Tổng MĐK: ${Number(
                        currentTotals.totalMucDoKho || 0
                      ).toFixed(1)}`}
                      color="success"
                      variant="filled"
                      size="small"
                    />
                    <Badge badgeContent={assignments.length} color="primary">
                      <Chip
                        icon={<Assignment />}
                        label="Nhiệm vụ"
                        variant="outlined"
                        size="small"
                      />
                    </Badge>
                  </Stack>
                </>
              )}
            </Box>

            {/* Split Content */}
            <Box
              sx={{
                flex: 1,
                p: 2,
                overflow: "hidden",
                minWidth: 0,
              }}
            >
              <Grid container spacing={2} sx={{ height: "100%" }}>
                {/* Left: Available Duties */}
                <Grid item xs={12} lg={6} sx={{ height: "100%", minWidth: 0 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      minWidth: 300,
                      "&:hover": {
                        boxShadow: theme.shadows[8],
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                          <Task />
                        </Avatar>
                      }
                      title="Nhiệm vụ thường quy"
                      subheader="Nhấp để gán cho nhân viên"
                      action={
                        <Chip
                          label={`${duties.length} khả dụng`}
                          color="secondary"
                          size="small"
                        />
                      }
                      sx={{
                        bgcolor: alpha(theme.palette.secondary.main, 0.05),
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        flexShrink: 0,
                      }}
                    />
                    <CardContent sx={{ flex: 1, overflow: "hidden", p: 0 }}>
                      <DutyPicker
                        duties={duties}
                        onPick={(d) =>
                          selectedEmployeeId &&
                          dispatch(
                            assignDuty({
                              employeeId: selectedEmployeeId,
                              dutyId: d._id,
                            })
                          )
                        }
                        selectedEmployeeId={selectedEmployeeId}
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Right: Assigned Tasks */}
                <Grid item xs={12} lg={6} sx={{ height: "100%", minWidth: 0 }}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: 3,
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      minWidth: 300,
                      "&:hover": {
                        boxShadow: theme.shadows[8],
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                          <Assignment />
                        </Avatar>
                      }
                      title="Nhiệm vụ đã gán"
                      subheader="Danh sách đang thực hiện"
                      action={
                        <Stack direction="row" spacing={1}>
                          <Chip
                            label={`${assignments.length} nhiệm vụ`}
                            color="success"
                            size="small"
                          />
                        </Stack>
                      }
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        flexShrink: 0,
                      }}
                    />
                    <CardContent sx={{ flex: 1, overflow: "hidden", p: 0 }}>
                      <AssignmentTable
                        assignments={assignments}
                        onUnassign={(id) => dispatch(unassignById(id))}
                        selectedEmployeeId={selectedEmployeeId}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default GiaoNhiemVuPage;
