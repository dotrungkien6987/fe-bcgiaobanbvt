/**
 * YeuCauDashboardPage - Dashboard tổng quan Yêu cầu
 *
 * Features:
 * - Overview statistics (sent, received, need action)
 * - Quick actions to main request views
 * - Role-based sections (Employee/Manager/Admin)
 * - Status distribution
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Stack,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  alpha,
  useTheme,
  Button,
  LinearProgress,
  Alert,
} from "@mui/material";
import {
  MessageQuestion,
  Send,
  Receive,
  Clock,
  ArrowLeft,
  Add,
  Refresh,
  InfoCircle,
} from "iconsax-react";
import { fetchAllDashboardSummaries } from "features/WorkDashboard/workDashboardSlice";
import useAuth from "hooks/useAuth";

/**
 * Stat Card Component
 */
function StatCard({ label, value, icon: Icon, color = "primary" }) {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Card>
      <CardContent>
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: alpha(colorValue, 0.1),
              }}
            >
              <Icon size={22} color={colorValue} variant="Bold" />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          </Stack>
          <Typography variant="h4" fontWeight={600}>
            {value ?? 0}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}

/**
 * Main Component
 */
export default function YeuCauDashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Get data from Redux
  const { yeuCauSummary, isLoading } = useSelector(
    (state) => state.workDashboard
  );

  // Check user role
  const isManager = ["manager", "admin", "superadmin"].includes(
    user?.PhanQuyen
  );
  const isAdmin = ["admin", "superadmin"].includes(user?.PhanQuyen);

  useEffect(() => {
    if (user?.NhanVienID) {
      dispatch(fetchAllDashboardSummaries());
    }
  }, [dispatch, user?.NhanVienID]);

  const stats = yeuCauSummary?.data?.stats || {};
  const needAction = yeuCauSummary?.data?.needAction || [];

  return (
    <Container maxWidth="xl" sx={{ py: 3, pb: 10 }}>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <IconButton onClick={() => navigate("/quanlycongviec")}>
          <ArrowLeft size={24} />
        </IconButton>
        <Box flex={1}>
          <Typography variant="h5" fontWeight={600}>
            📝 Dashboard Yêu Cầu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng quan yêu cầu của bạn
          </Typography>
        </Box>
        <Tooltip title="Làm mới">
          <IconButton
            onClick={() => dispatch(fetchAllDashboardSummaries())}
            disabled={isLoading}
          >
            <Refresh size={20} />
          </IconButton>
        </Tooltip>
      </Stack>

      {isLoading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Quick Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle2" color="text.secondary" mb={2}>
            Thao tác nhanh:
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
            <Button
              variant="contained"
              startIcon={<Add size={18} />}
              size="small"
              onClick={() => navigate("/quanlycongviec/yeucau/tao-moi")}
            >
              Tạo yêu cầu mới
            </Button>
            <Button
              variant="outlined"
              startIcon={<Send size={18} variant="Bold" />}
              size="small"
              onClick={() => navigate("/quanlycongviec/yeucau/toi-gui")}
            >
              Yêu cầu tôi gửi
            </Button>
            <Button
              variant="outlined"
              startIcon={<Receive size={18} variant="Bold" />}
              size="small"
              onClick={() => navigate("/quanlycongviec/yeucau/toi-nhan")}
            >
              Yêu cầu tôi nhận
            </Button>
            {isManager && (
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate("/quanlycongviec/yeucau")}
              >
                Xem tất cả
              </Button>
            )}
          </Stack>
        </CardContent>
      </Card>

      {/* Statistics Grid */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Tôi gửi"
            value={stats.sent}
            icon={Send}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Cần xử lý"
            value={stats.needAction}
            icon={Clock}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Đang xử lý"
            value={stats.processing}
            icon={Clock}
            color="info"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            label="Hoàn thành"
            value={stats.completed}
            icon={MessageQuestion}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Need Action Alert */}
      {needAction && needAction.length > 0 && (
        <Alert
          severity="warning"
          icon={<InfoCircle variant="Bold" />}
          sx={{ mb: 3 }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            ⚠️ Yêu cầu cần xử lý ({needAction.length})
          </Typography>
          <Stack spacing={0.5}>
            {needAction.slice(0, 3).map((request, idx) => (
              <Typography key={idx} variant="body2">
                • {request.TieuDe || "Yêu cầu"}
              </Typography>
            ))}
            {needAction.length > 3 && (
              <Typography variant="caption" color="text.secondary">
                ... và {needAction.length - 3} yêu cầu khác
              </Typography>
            )}
          </Stack>
        </Alert>
      )}

      {/* Status Distribution */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Phân bố theo trạng thái
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {stats.byStatus && Object.keys(stats.byStatus).length > 0 ? (
              Object.entries(stats.byStatus).map(([status, count]) => (
                <Grid item xs={6} sm={4} md={3} key={status}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="body2" noWrap>
                      {status}:
                    </Typography>
                    <Chip label={count} size="small" />
                  </Stack>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  align="center"
                >
                  Chưa có dữ liệu
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Manager Section */}
      {isManager && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              👥 Quản lý & Điều phối
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography variant="body2">Chờ phân công:</Typography>
                  <Chip
                    label={stats.pendingAssignment || 0}
                    size="small"
                    color="warning"
                  />
                </Stack>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography variant="body2">Đang điều phối:</Typography>
                  <Chip
                    label={stats.coordinating || 0}
                    size="small"
                    color="info"
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Admin Section */}
      {isAdmin && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Quản lý Khoa
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={6} sm={4}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography variant="body2">Tổng yêu cầu:</Typography>
                  <Chip label={stats.total || 0} size="small" />
                </Stack>
              </Grid>
              <Grid item xs={6} sm={4}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Typography variant="body2">Chờ phê duyệt:</Typography>
                  <Chip
                    label={stats.pendingApproval || 0}
                    size="small"
                    color="warning"
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
