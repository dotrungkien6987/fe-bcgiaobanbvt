import React from "react";
import {
  Box,
  Tabs,
  Tab,
  Typography,
  Stack,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Divider,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  Badge,
  Avatar,
} from "@mui/material";
import {
  Edit as EditIcon,
  MenuBook as BookIcon,
  CalendarToday as CalendarIcon,
  Numbers as NumberIcon,
  AttachFile as AttachIcon,
  Schedule as ScheduleIcon,
  Person as PersonIcon,
  Home as HomeIcon,
  Article as ArticleIcon,
  NavigateNext as NavigateNextIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useParams, useNavigate } from "react-router-dom";
import { getTapSanById } from "../services/tapsan.api";
import AttachmentSection from "../components/AttachmentSection";

export default function TapSanDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [value, setValue] = React.useState(0);
  const [doc, setDoc] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getTapSanById(id)
      .then(setDoc)
      .catch((error) => {
        console.error("Error loading data:", error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const TabPanel = ({ children, value, index, ...other }) => (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3, bgcolor: "grey.50", minHeight: "100vh" }}>
        <Card elevation={0} sx={{ borderRadius: 2 }}>
          <CardContent>
            <Stack spacing={2}>
              <Skeleton variant="text" width="60%" height={40} />
              <Skeleton variant="text" width="40%" height={24} />
              <Divider />
              <Stack direction="row" spacing={2}>
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} variant="rounded" width={120} height={40} />
                ))}
              </Stack>
              <Skeleton variant="rectangular" height={300} />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "grey.50", minHeight: "100vh" }}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        sx={{ mb: 3 }}
      >
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={() => nav("/")}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Trang chủ
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="#"
          onClick={() => nav("/tapsan")}
          sx={{ display: "flex", alignItems: "center" }}
        >
          <BookIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Tập san
        </Link>
        <Typography
          color="text.primary"
          sx={{ display: "flex", alignItems: "center" }}
        >
          <ArticleIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Chi tiết
        </Typography>
      </Breadcrumbs>

      <Grid container spacing={3}>
        {/* Main Content */}
        <Grid item xs={12} lg={8}>
          <Card elevation={0} sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 4 }}>
              {/* Header */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                mb={4}
              >
                <Box>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar
                      sx={{ bgcolor: "primary.main", width: 56, height: 56 }}
                    >
                      <BookIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box>
                      <Typography
                        variant="h4"
                        fontWeight="bold"
                        color="primary.main"
                      >
                        {doc ? `Tập san ${doc.Loai}` : "..."}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        {doc
                          ? `Năm ${doc.NamXuatBan} - Số ${doc.SoXuatBan}`
                          : "..."}
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="Quản lý bài đăng">
                    <Button
                      variant="outlined"
                      startIcon={<ArticleIcon />}
                      onClick={() => nav(`/tapsan/${id}/baibao`)}
                      sx={{ borderRadius: 2 }}
                    >
                      Bài đăng
                    </Button>
                  </Tooltip>
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      variant="contained"
                      startIcon={<EditIcon />}
                      onClick={() => nav(`/tapsan/${id}/edit`)}
                      sx={{ borderRadius: 2 }}
                    >
                      Chỉnh sửa
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>

              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                  value={value}
                  onChange={(_, v) => setValue(v)}
                  variant="fullWidth"
                  sx={{
                    "& .MuiTab-root": {
                      textTransform: "none",
                      fontWeight: 600,
                      fontSize: "1rem",
                    },
                  }}
                >
                  <Tab
                    icon={<BookIcon />}
                    iconPosition="start"
                    label="Tổng quan"
                  />
                  <Tab
                    icon={<ScheduleIcon />}
                    iconPosition="start"
                    label="Kế hoạch"
                  />
                  <Tab
                    icon={<ArticleIcon />}
                    iconPosition="start"
                    label="Bài báo"
                  />
                  <Tab
                    icon={<AttachIcon />}
                    iconPosition="start"
                    label="Tệp tập san"
                  />
                </Tabs>
              </Box>

              {/* Tab Content */}
              <TabPanel value={value} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <BookIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Loại tập san
                        </Typography>
                      </Stack>
                      <Chip
                        label={
                          doc?.Loai === "YHTH"
                            ? "Y học thực hành"
                            : "Thông tin thuốc"
                        }
                        color={doc?.Loai === "YHTH" ? "primary" : "secondary"}
                        variant="filled"
                        size="large"
                        icon={<BookIcon />}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <CalendarIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Năm xuất bản
                        </Typography>
                      </Stack>
                      <Typography variant="h5" fontWeight="bold">
                        {doc?.NamXuatBan}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <NumberIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Số xuất bản
                        </Typography>
                      </Stack>
                      <Typography variant="h5" fontWeight="bold">
                        Số {doc?.SoXuatBan}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <ScheduleIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Cập nhật lần cuối
                        </Typography>
                      </Stack>
                      <Typography variant="body1">
                        {doc?.updatedAt
                          ? new Date(doc.updatedAt).toLocaleDateString(
                              "vi-VN",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              }
                            )
                          : "—"}
                      </Typography>
                    </Paper>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        bgcolor: "background.default",
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                        mb={2}
                      >
                        <CheckIcon color="primary" />
                        <Typography variant="h6" fontWeight="600">
                          Trạng thái
                        </Typography>
                      </Stack>
                      <Chip
                        label={
                          doc?.TrangThai === "da-hoan-thanh"
                            ? "Đã hoàn thành"
                            : "Chưa hoàn thành"
                        }
                        color={
                          doc?.TrangThai === "da-hoan-thanh"
                            ? "success"
                            : "warning"
                        }
                        variant="filled"
                        size="large"
                      />
                    </Paper>
                  </Grid>

                  {doc?.GhiChu && (
                    <Grid item xs={12}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          bgcolor: "background.default",
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={2}
                          mb={2}
                        >
                          <Typography variant="h6" fontWeight="600">
                            📝 Ghi chú
                          </Typography>
                        </Stack>
                        <Typography
                          variant="body1"
                          sx={{ whiteSpace: "pre-wrap" }}
                        >
                          {doc.GhiChu}
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>

              <TabPanel value={value} index={1}>
                <AttachmentSection
                  ownerType="TapSan"
                  ownerId={id}
                  field="kehoach"
                  title="Tệp kế hoạch"
                />
              </TabPanel>

              <TabPanel value={value} index={2}>
                <Box>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    mb={3}
                  >
                    <Typography variant="h6">Quản lý bài báo</Typography>
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="outlined"
                        startIcon={<ArticleIcon />}
                        onClick={() => nav(`/tapsan/${id}/baibao`)}
                      >
                        Xem tất cả bài báo
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<ArticleIcon />}
                        onClick={() => nav(`/tapsan/${id}/baibao/add`)}
                      >
                        Thêm bài báo
                      </Button>
                    </Stack>
                  </Stack>
                  <Typography variant="body1" color="text.secondary">
                    Bấm vào nút "Xem tất cả bài báo" để quản lý các bài báo
                    trong tập san này.
                  </Typography>
                </Box>
              </TabPanel>

              <TabPanel value={value} index={3}>
                <AttachmentSection
                  ownerType="TapSan"
                  ownerId={id}
                  field="file"
                  title="Tệp tập san"
                />
              </TabPanel>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            {/* Quick Actions */}
            <Card elevation={0} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" mb={2}>
                  Thao tác nhanh
                </Typography>
                <Stack spacing={2}>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<ArticleIcon />}
                    onClick={() => nav(`/tapsan/${id}/baibao`)}
                    sx={{ borderRadius: 2, justifyContent: "flex-start" }}
                  >
                    Quản lý bài đăng
                  </Button>
                  <Button
                    variant="contained"
                    fullWidth
                    startIcon={<ArticleIcon />}
                    onClick={() => nav(`/tapsan/${id}/baibao/add`)}
                    sx={{ borderRadius: 2, justifyContent: "flex-start" }}
                  >
                    Thêm bài báo
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<EditIcon />}
                    onClick={() => nav(`/tapsan/${id}/edit`)}
                    sx={{ borderRadius: 2, justifyContent: "flex-start" }}
                  >
                    Chỉnh sửa thông tin
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    startIcon={<AttachIcon />}
                    onClick={() => setValue(1)}
                    sx={{ borderRadius: 2, justifyContent: "flex-start" }}
                  >
                    Xem tệp kế hoạch
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card elevation={0} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="600" mb={2}>
                  Thống kê
                </Typography>
                <Stack spacing={2}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "primary.50",
                      border: "1px solid",
                      borderColor: "primary.200",
                      borderRadius: 1.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="primary.dark">
                        Tổng bài đăng
                      </Typography>
                      <Badge badgeContent="0" color="primary">
                        <ArticleIcon color="primary" />
                      </Badge>
                    </Stack>
                  </Paper>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: "success.50",
                      border: "1px solid",
                      borderColor: "success.200",
                      borderRadius: 1.5,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Typography variant="body2" color="success.dark">
                        Tệp đính kèm
                      </Typography>
                      <Badge badgeContent="0" color="success">
                        <AttachIcon color="success" />
                      </Badge>
                    </Stack>
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
