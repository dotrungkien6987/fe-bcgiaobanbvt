import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchManagedEmployees,
  fetchDutiesByEmployee,
  fetchAssignmentsByEmployee,
  setSelectedEmployee,
  assignDuty,
  unassignById,
} from "./giaoNhiemVuSlice";
import EmployeeList from "./components/EmployeeList";
import DutyPicker from "./components/DutyPicker";
import AssignmentTable from "./components/AssignmentTable";
import MainCard from "components/MainCard";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  Typography,
  alpha,
  useTheme,
  Breadcrumbs,
  Link,
  Chip,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import { Assignment, Home, People, Task } from "@mui/icons-material";

const GiaoNhiemVuPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { NhanVienID } = useParams();
  const { employees, selectedEmployeeId, duties, assignments, isLoading } =
    useSelector((s) => s.giaoNhiemVu);

  useEffect(() => {
    if (NhanVienID) dispatch(fetchManagedEmployees(NhanVienID));
  }, [NhanVienID, dispatch]);

  useEffect(() => {
    if (!selectedEmployeeId && employees?.length > 0) {
      const raw = employees[0]?.ThongTinNhanVienDuocQuanLy;
      const info = Array.isArray(raw) ? raw[0] : raw;
      const first = info?._id || employees[0]?.NhanVienDuocQuanLy;
      if (first) dispatch(setSelectedEmployee(first));
    }
  }, [employees, selectedEmployeeId, dispatch]);

  useEffect(() => {
    if (selectedEmployeeId) {
      dispatch(fetchDutiesByEmployee(selectedEmployeeId));
      dispatch(fetchAssignmentsByEmployee(selectedEmployeeId));
    }
  }, [selectedEmployeeId, dispatch]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: alpha(theme.palette.grey[100], 0.4),
        py: 3,
      }}
    >
      <Container maxWidth="xl">
        {/* Header */}
        <Box mb={3}>
          <Breadcrumbs separator="›" sx={{ mb: 2 }}>
            <Link
              color="inherit"
              href="#"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Home fontSize="small" />
              Trang chủ
            </Link>
            <Typography
              color="text.primary"
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Assignment fontSize="small" />
              Giao nhiệm vụ
            </Typography>
          </Breadcrumbs>

          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
                color="text.primary"
                gutterBottom
              >
                Giao nhiệm vụ thường quy
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý và phân công nhiệm vụ cho nhân viên trong đơn vị
              </Typography>
            </Box>

            {isLoading && (
              <Box
                display="flex"
                alignItems="center"
                gap={1}
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.1),
                  py: 1,
                  px: 2,
                  borderRadius: 2,
                }}
              >
                <CircularProgress size={20} />
                <Typography
                  variant="body2"
                  color="primary.main"
                  fontWeight={500}
                >
                  Đang tải dữ liệu...
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Main Workspace Card */}
        <MainCard
          title={
            <Box display="flex" alignItems="center" gap={1.5}>
              <Assignment />
              Workspace giao nhiệm vụ
            </Box>
          }
          subheader={`Quản lý ${employees.length} nhân viên • ${duties.length} nhiệm vụ khả dụng • ${assignments.length} đang thực hiện`}
          secondary={
            isLoading ? (
              <CircularProgress size={24} />
            ) : (
              <Chip
                size="small"
                label="Đang hoạt động"
                color="success"
                variant="filled"
                sx={{ color: "white" }}
              />
            )
          }
        >
          <Grid container spacing={3}>
            {/* Employee List Section */}
            <Grid item xs={12} lg={4}>
              <Card
                variant="outlined"
                sx={{
                  height: "fit-content",
                  borderRadius: 2,
                  "&:hover": { boxShadow: theme.shadows[4] },
                }}
              >
                <CardHeader
                  title={
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <People color="primary" />
                      <Typography variant="h6" fontWeight={600}>
                        Nhân viên được quản lý
                      </Typography>
                    </Box>
                  }
                  action={
                    <Chip
                      size="small"
                      label={employees.length}
                      color="primary"
                      variant="outlined"
                    />
                  }
                  sx={{ pb: 1 }}
                />
                <CardContent sx={{ pt: 0 }}>
                  <EmployeeList
                    employees={employees}
                    selectedEmployeeId={selectedEmployeeId}
                    onSelect={(id) => dispatch(setSelectedEmployee(id))}
                  />
                </CardContent>
              </Card>
            </Grid>

            {/* Tasks and Assignments Section */}
            <Grid item xs={12} lg={8}>
              <Grid container spacing={3}>
                {/* Task Picker */}
                <Grid item xs={12}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      "&:hover": { boxShadow: theme.shadows[4] },
                    }}
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Task color="secondary" />
                          <Typography variant="h6" fontWeight={600}>
                            Nhiệm vụ thường quy
                          </Typography>
                        </Box>
                      }
                      action={
                        <Chip
                          size="small"
                          label={`${duties.length} nhiệm vụ`}
                          color="secondary"
                          variant="outlined"
                        />
                      }
                      sx={{ pb: 1 }}
                    />
                    <CardContent sx={{ pt: 0 }}>
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
                      />
                    </CardContent>
                  </Card>
                </Grid>

                {/* Assignment Table */}
                <Grid item xs={12}>
                  <Card
                    variant="outlined"
                    sx={{
                      borderRadius: 2,
                      "&:hover": { boxShadow: theme.shadows[4] },
                    }}
                  >
                    <CardHeader
                      title={
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Assignment color="success" />
                          <Typography variant="h6" fontWeight={600}>
                            Nhiệm vụ đã gán
                          </Typography>
                        </Box>
                      }
                      subheader="Danh sách nhiệm vụ đang được thực hiện"
                      action={
                        <Chip
                          size="small"
                          label={`${assignments.length} nhiệm vụ`}
                          color="success"
                          variant="outlined"
                        />
                      }
                      sx={{ pb: 1 }}
                    />
                    <CardContent sx={{ pt: 0 }}>
                      <AssignmentTable
                        assignments={assignments}
                        onUnassign={(id) => dispatch(unassignById(id))}
                      />
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </MainCard>
      </Container>
    </Box>
  );
};

export default GiaoNhiemVuPage;
