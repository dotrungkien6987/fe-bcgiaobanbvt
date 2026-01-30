import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Button,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Breadcrumbs,
  Link,
} from "@mui/material";
import {
  DocumentText,
  DocumentDownload,
  Chart21,
  Add,
  Eye,
  Clock,
  Building,
  ArrowRight2,
  Home2,
  Send2,
  ReceiveSquare2,
  Setting2,
} from "iconsax-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/vi";
import MainCard from "../../components/MainCard";
import { getQuyTrinhISOStatistics } from "./quyTrinhISOSlice";
import useAuth from "../../hooks/useAuth";
import NetworkError from "./components/NetworkError";

dayjs.extend(relativeTime);
dayjs.locale("vi");

// Stat Card Component with gradient
function StatCard({ title, value, icon, color = "primary", subtitle }) {
  const colorMap = {
    primary: { light: "#e3f2fd", main: "#1976d2", dark: "#1565c0" },
    success: { light: "#e8f5e9", main: "#2e7d32", dark: "#1b5e20" },
    error: { light: "#ffebee", main: "#d32f2f", dark: "#c62828" },
    warning: { light: "#fff3e0", main: "#ed6c02", dark: "#e65100" },
  };
  const colors = colorMap[color] || colorMap.primary;

  return (
    <Card
      sx={{
        height: "100%",
        background: `linear-gradient(135deg, ${colors.light} 0%, ${colors.light} 100%)`,
        border: 1,
        borderColor: colors.main,
        transition: "transform 0.2s",
        "&:hover": { transform: "translateY(-2px)" },
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              gutterBottom
            >
              {title}
            </Typography>
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ color: colors.dark }}
            >
              {value ?? 0}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: colors.main,
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

// Department Bar Chart Component
function DepartmentBarChart({ data, onItemClick }) {
  if (!data || data.length === 0) return null;

  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Stack spacing={2}>
      {data.map((item, index) => (
        <Box
          key={index}
          sx={{
            cursor: "pointer",
            p: 1.5,
            borderRadius: 1,
            "&:hover": { bgcolor: "action.hover" },
          }}
          onClick={() => onItemClick?.(item)}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography
              variant="body2"
              fontWeight={500}
              noWrap
              sx={{ flex: 1 }}
            >
              {item.TenKhoa || "Không xác định"}
            </Typography>
            <Typography variant="body2" fontWeight={700} color="primary.main">
              {item.count}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={(item.count / maxCount) * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "grey.200",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                bgcolor: "primary.main",
              },
            }}
          />
        </Box>
      ))}
    </Stack>
  );
}

// Recent Documents List Component
function RecentDocsList({ documents, onItemClick }) {
  if (!documents || documents.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        Chưa có tài liệu nào
      </Typography>
    );
  }

  return (
    <List disablePadding>
      {documents.map((doc, index) => (
        <Box key={doc._id}>
          <ListItem
            button
            onClick={() => onItemClick?.(doc)}
            sx={{ px: 0, py: 1 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              <DocumentText size={20} color="#1976d2" />
            </ListItemIcon>
            <ListItemText
              primary={
                <Typography variant="body2" fontWeight={500} noWrap>
                  {doc.MaQuyTrinh} v{doc.PhienBan}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {dayjs(doc.updatedAt).fromNow()}
                </Typography>
              }
            />
            <ArrowRight2 size={16} color="#9e9e9e" />
          </ListItem>
          {index < documents.length - 1 && <Divider />}
        </Box>
      ))}
    </List>
  );
}

function QuyTrinhISODashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { statistics, isLoading, error } = useSelector(
    (state) => state.quyTrinhISO,
  );

  const isQLCL =
    user?.PhanQuyen === "qlcl" ||
    user?.PhanQuyen === "admin" ||
    user?.PhanQuyen === "superadmin";

  const fetchData = () => {
    dispatch(getQuyTrinhISOStatistics());
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Map backend response to frontend stats
  const summary = statistics?.summary || {};
  const stats = {
    total: summary.totalDocuments || 0,
    uniqueProcesses: summary.uniqueProcesses || 0,
    recentDocsCount: summary.recentDocsCount || 0,
    totalPDF: summary.totalPDFFiles || 0,
    totalWord: summary.totalWordFiles || 0,
  };
  const byDepartment = statistics?.byDepartment || [];
  const recentDocuments = statistics?.recentDocuments || [];

  const handleDepartmentClick = (item) => {
    navigate(`/quytrinh-iso?KhoaXayDungID=${item._id}`);
  };

  const handleDocumentClick = (doc) => {
    navigate(`/quytrinh-iso/${doc._id}`);
  };

  // Handle error state
  if (error && !isLoading) {
    return (
      <>
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            underline="hover"
            color="inherit"
            href="/"
            onClick={(e) => {
              e.preventDefault();
              navigate("/");
            }}
            sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
          >
            <Home2 size={16} />
            Trang chủ
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Dashboard Quy Trình ISO
          </Typography>
        </Breadcrumbs>
        <MainCard title="Dashboard Quy Trình ISO">
          <NetworkError message={error} onRetry={fetchData} />
        </MainCard>
      </>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Home2 size={16} />
          Trang chủ
        </Link>
        <Typography color="text.secondary">Quản lý chất lượng</Typography>
        <Typography color="text.primary" fontWeight={500}>
          Tổng quan
        </Typography>
      </Breadcrumbs>

      <MainCard
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chart21 size={24} color="#1976d2" />
            <span>Tổng Quan Quản Lý Quy Trình ISO</span>
          </Stack>
        }
        secondary={
          <Stack direction="row" spacing={1}>
            <Button
              startIcon={<Eye size={18} />}
              variant="outlined"
              onClick={() => navigate("/quytrinh-iso")}
            >
              Xem danh sách
            </Button>
            {isQLCL && (
              <Button
                startIcon={<Add size={18} />}
                variant="contained"
                onClick={() => navigate("/quytrinh-iso/create")}
              >
                Thêm quy trình
              </Button>
            )}
          </Stack>
        }
      >
        <Stack spacing={3}>
          {/* Statistics Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Tổng Số Tài Liệu"
                value={stats.total}
                icon={<DocumentText size={28} color="white" />}
                color="primary"
                subtitle="Tất cả phiên bản"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Quy Trình Riêng Biệt"
                value={stats.uniqueProcesses}
                icon={<Chart21 size={28} color="white" />}
                color="success"
                subtitle="Mã quy trình duy nhất"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="File PDF"
                value={stats.totalPDF}
                icon={<DocumentDownload size={28} color="white" />}
                color="error"
                subtitle="Tổng file PDF"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Biểu Mẫu Word"
                value={stats.totalWord}
                icon={<DocumentText size={28} color="white" />}
                color="warning"
                subtitle="Tổng file Word"
              />
            </Grid>
          </Grid>

          {/* Two Column Layout: Bar Chart + Recent Docs */}
          <Grid container spacing={3}>
            {/* Department Bar Chart */}
            <Grid item xs={12} md={7}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Building size={20} color="#1976d2" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Thống Kê Theo Khoa Xây Dựng
                    </Typography>
                  </Stack>

                  {byDepartment.length > 0 ? (
                    <DepartmentBarChart
                      data={byDepartment}
                      onItemClick={handleDepartmentClick}
                    />
                  ) : (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ py: 2 }}
                    >
                      Chưa có dữ liệu thống kê
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Documents */}
            <Grid item xs={12} md={5}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardContent>
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                    sx={{ mb: 2 }}
                  >
                    <Clock size={20} color="#1976d2" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      Tài Liệu Gần Đây
                    </Typography>
                  </Stack>

                  <RecentDocsList
                    documents={recentDocuments}
                    onItemClick={handleDocumentClick}
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Quick Actions */}
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Thao Tác Nhanh
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    startIcon={<Eye size={20} />}
                    onClick={() => navigate("/quytrinh-iso")}
                    sx={{ py: 2 }}
                  >
                    Xem Tất Cả Quy Trình
                  </Button>
                </Grid>
                {isQLCL ? (
                  <>
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        startIcon={<Add size={20} />}
                        onClick={() => navigate("/quytrinh-iso/create")}
                        sx={{ py: 2 }}
                      >
                        Thêm Quy Trình Mới
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        size="large"
                        startIcon={<Setting2 size={20} />}
                        onClick={() => navigate("/quytrinh-iso/phan-phoi")}
                        sx={{ py: 2 }}
                      >
                        Quản Lý Phân Phối
                      </Button>
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        color="success"
                        startIcon={<ReceiveSquare2 size={20} />}
                        onClick={() => navigate("/quytrinh-iso/duoc-phan-phoi")}
                        sx={{ py: 2 }}
                      >
                        QT Được Phân Phối
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        color="warning"
                        startIcon={<Send2 size={20} />}
                        onClick={() => navigate("/quytrinh-iso/khoa-xay-dung")}
                        sx={{ py: 2 }}
                      >
                        QT Khoa Xây Dựng
                      </Button>
                    </Grid>
                  </>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Stack>
      </MainCard>
    </>
  );
}

export default QuyTrinhISODashboard;
