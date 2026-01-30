/**
 * TeamOverviewWidget - Widget hiển thị tổng quan đội ngũ cho manager
 *
 * Shows: pending KPIs, team avatar stack, link to dashboard
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Avatar,
  AvatarGroup,
  Skeleton,
  useTheme,
  alpha,
} from "@mui/material";
import { People, ArrowRight2, MedalStar } from "iconsax-react";
import apiService from "app/apiService";

function TeamOverviewWidget({ managedEmployees = [] }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const [teamSummary, setTeamSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(null);

  // Fetch current cycle and team KPI summary
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Get current open cycle
        const cyclesRes = await apiService.get(
          "/workmanagement/chu-ky-danh-gia",
        );
        const cycles = cyclesRes.data?.data || [];
        const openCycle = cycles.find((c) => !c.isDong) || cycles[0];
        setCurrentCycle(openCycle);

        // If we have a cycle, fetch team KPI summary
        if (openCycle?._id) {
          const dashboardRes = await apiService.get(
            `/workmanagement/kpi/dashboard/${openCycle._id}`,
          );
          const { summary, nhanVienList } = dashboardRes.data?.data || {};

          if (summary) {
            setTeamSummary({
              totalEmployees: summary.totalNhanVien || 0,
              completed: summary.completed || 0,
              inProgress: summary.inProgress || 0,
              notStarted: summary.notStarted || 0,
              pendingKPIs:
                (summary.notStarted || 0) + (summary.inProgress || 0),
              employees: (nhanVienList || []).slice(0, 5),
            });
          }
        }
      } catch (error) {
        console.error("Error fetching team summary:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (managedEmployees.length > 0) {
      fetchData();
    }
  }, [managedEmployees]);

  // Handle navigate to KPI dashboard
  const handleViewDashboard = () => {
    navigate("/quanlycongviec/kpi/danh-gia-nhan-vien");
  };

  // Loading state
  if (isLoading) {
    return (
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Skeleton variant="text" width={150} height={32} />
          <Skeleton
            variant="rectangular"
            height={80}
            sx={{ mt: 2, borderRadius: 1 }}
          />
        </CardContent>
      </Card>
    );
  }

  // No managed employees
  if (!managedEmployees || managedEmployees.length === 0) {
    return null;
  }

  return (
    <Card
      sx={{
        mb: 3,
        background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
        color: "white",
      }}
    >
      <CardContent>
        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: alpha("#fff", 0.2),
            }}
          >
            <People size={20} color="#fff" variant="Bold" />
          </Box>
          <Typography variant="h6" fontWeight={600}>
            Đội ngũ của bạn
          </Typography>
        </Stack>

        {/* Stats Grid */}
        <Stack direction="row" spacing={2} mb={2}>
          {/* Total employees */}
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha("#fff", 0.15),
            }}
          >
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Nhân viên
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {managedEmployees.length}
            </Typography>
          </Box>

          {/* Pending KPIs */}
          <Box
            sx={{
              flex: 1,
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: alpha("#fff", 0.15),
            }}
          >
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <MedalStar size={14} color="#fff" />
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Chờ duyệt KPI
              </Typography>
            </Stack>
            <Typography variant="h4" fontWeight={700}>
              {teamSummary?.pendingKPIs || 0}
            </Typography>
          </Box>
        </Stack>

        {/* Avatar Stack */}
        {teamSummary?.employees && teamSummary.employees.length > 0 && (
          <Box mb={2}>
            <Typography
              variant="caption"
              sx={{ opacity: 0.8, mb: 1, display: "block" }}
            >
              Chu kỳ: {currentCycle?.TenChuKy || "N/A"}
            </Typography>
            <AvatarGroup
              max={5}
              sx={{
                justifyContent: "flex-start",
                "& .MuiAvatar-root": {
                  width: 32,
                  height: 32,
                  fontSize: 14,
                  border: `2px solid ${theme.palette.secondary.main}`,
                },
              }}
            >
              {teamSummary.employees.map((emp) => (
                <Avatar
                  key={emp.nhanVien?._id || emp._id}
                  src={emp.nhanVien?.Images?.[0]?.url}
                  alt={emp.nhanVien?.HoTen || ""}
                >
                  {(emp.nhanVien?.HoTen || "?").charAt(0)}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        )}

        {/* View Dashboard Button */}
        <Button
          fullWidth
          variant="contained"
          endIcon={<ArrowRight2 size={16} />}
          onClick={handleViewDashboard}
          sx={{
            bgcolor: alpha("#fff", 0.2),
            color: "#fff",
            "&:hover": {
              bgcolor: alpha("#fff", 0.3),
            },
          }}
        >
          Xem dashboard KPI
        </Button>
      </CardContent>
    </Card>
  );
}

export default TeamOverviewWidget;
