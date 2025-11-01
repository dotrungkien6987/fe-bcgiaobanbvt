import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  fetchManagedEmployees,
  fetchManagerInfo,
  fetchAssignmentTotals,
  copyAssignments,
} from "./giaoNhiemVuSlice";
import EmployeeOverviewTable from "./components/EmployeeOverviewTable";
import AssignSingleDutyButton from "./components/AssignSingleDutyButton";
import {
  Box,
  CircularProgress,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Stack,
  Chip,
  Divider,
  alpha,
  useTheme,
} from "@mui/material";
import { People, Person, TrendingUp } from "@mui/icons-material";
import MainCard from "components/MainCard";

const GiaoNhiemVuPage = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { NhanVienID } = useParams();

  // Debug log to verify new page is loading
  console.log("🎉 GiaoNhiemVuPageNew V2.0 is loaded!");

  const { employees, isLoading, managerInfo, totalsByEmployeeId } = useSelector(
    (s) => s.giaoNhiemVu
  );

  useEffect(() => {
    if (NhanVienID) {
      dispatch(fetchManagedEmployees(NhanVienID));
      dispatch(fetchManagerInfo(NhanVienID));
    }
  }, [NhanVienID, dispatch]);

  useEffect(() => {
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
  }, [employees, dispatch]);

  const handleRefresh = async (sourceEmployeeId, targetEmployeeId) => {
    // If called with sourceEmployeeId and targetEmployeeId, perform copy
    if (sourceEmployeeId && targetEmployeeId) {
      await dispatch(
        copyAssignments({
          sourceEmployeeId,
          targetEmployeeId,
        })
      );
    }

    // Always refresh totals
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
  };

  const totalStats = Object.values(totalsByEmployeeId).reduce(
    (acc, curr) => ({
      totalAssignments: acc.totalAssignments + (curr.assignments || 0),
      totalScore: acc.totalScore + (curr.totalMucDoKho || 0),
    }),
    { totalAssignments: 0, totalScore: 0 }
  );

  if (isLoading && employees.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      {/* Header Card */}
      <Card
        sx={{
          mb: 3,
          background: `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.1
          )} 0%, ${alpha(theme.palette.primary.dark, 0.05)} 100%)`,
          border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 56,
                height: 56,
              }}
            >
              <People sx={{ fontSize: 32 }} />
            </Avatar>
          }
          title={
            <Typography variant="h4" fontWeight={600}>
              🆕 Quản lý gán nhiệm vụ (Version 2.0)
            </Typography>
          }
          subheader={
            managerInfo ? (
              <Stack direction="row" spacing={2} mt={1} flexWrap="wrap">
                <Chip
                  icon={<Person />}
                  label={`Quản lý: ${managerInfo.Ten}`}
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  icon={<People />}
                  label={`${employees.length} nhân viên`}
                  color="info"
                  variant="outlined"
                />
              </Stack>
            ) : null
          }
        />
      </Card>

      {/* Stats Cards */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {totalStats.totalAssignments}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng nhiệm vụ đã gán
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {totalStats.totalScore.toFixed(1)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tổng điểm mức độ khó
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Avatar sx={{ bgcolor: theme.palette.info.main }}>
                <TrendingUp />
              </Avatar>
              <Box>
                <Typography variant="h4" fontWeight={600}>
                  {employees.length > 0
                    ? (totalStats.totalAssignments / employees.length).toFixed(
                        1
                      )
                    : "0"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Trung bình/người
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      <Divider sx={{ my: 3 }} />

      {/* Main Table */}
      <MainCard
        title="Danh sách nhân viên"
        content={false}
        secondary={
          <AssignSingleDutyButton
            employees={employees
              .map((e) => {
                const raw = e.ThongTinNhanVienDuocQuanLy;
                return Array.isArray(raw) ? raw[0] : raw;
              })
              .filter(Boolean)}
          />
        }
      >
        <Box sx={{ p: 2 }}>
          <EmployeeOverviewTable
            employees={employees}
            totalsByEmployeeId={totalsByEmployeeId}
            onRefresh={handleRefresh}
          />
        </Box>
      </MainCard>
    </Box>
  );
};

export default GiaoNhiemVuPage;
