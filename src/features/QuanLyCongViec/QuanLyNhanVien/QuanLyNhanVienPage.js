import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Stack,
  Button,
  Typography,
  Tabs,
  Tab,
  Box,
  Alert,
  AlertTitle,
  Breadcrumbs,
  Link,
  Chip,
  Card,
  CardContent,
  Avatar,
  Skeleton,
  alpha,
  Badge,
} from "@mui/material";
import {
  ArrowBack,
  ManageAccounts,
  People,
  Assignment,
  Email,
  Phone,
  Business,
  WorkOutline,
  CalendarToday,
} from "@mui/icons-material";

import MainCard from "components/MainCard";
import DanhSachGiaoViec from "./components/DanhSachGiaoViec";
import DanhSachChamKPI from "./components/DanhSachChamKPI";
import SelectNhanVienQuanLyDialog from "./components/SelectNhanVienQuanLyDialog";

import {
  setCurrentNhanVienQuanLy,
  getGiaoViecByNhanVien,
  getChamKPIByNhanVien,
  clearQuanLyNhanVienState,
} from "./quanLyNhanVienSlice";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

function TabPanel({ children, value, index, ...other }) {
  return (
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
}

function QuanLyNhanVienPage() {
  const { nhanVienId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentLoaiQuanLy, setCurrentLoaiQuanLy] = useState("");
  const [isInitializing, setIsInitializing] = useState(true);

  const { currentNhanVienQuanLy, giaoViecs, chamKPIs, error } = useSelector(
    (state) => state.quanLyNhanVien
  );

  const { nhanviens } = useSelector((state) => state.nhanvien);

  // Initialize data when component mounts
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Ensure we have nhanviens list
        if (nhanviens.length === 0) {
          await dispatch(getAllNhanVien());
        }

        // Find and set current nhan vien quan ly
        const foundNhanVien = nhanviens.find((nv) => nv._id === nhanVienId);
        if (foundNhanVien) {
          dispatch(setCurrentNhanVienQuanLy(foundNhanVien));

          // Load relationships
          dispatch(getGiaoViecByNhanVien(nhanVienId));
          dispatch(getChamKPIByNhanVien(nhanVienId));
        }
      } finally {
        // Set initializing to false after first load
        setTimeout(() => setIsInitializing(false), 300);
      }
    };

    if (nhanVienId) {
      initializeData();
    }

    // Cleanup when unmounting
    return () => {
      dispatch(clearQuanLyNhanVienState());
    };
  }, [nhanVienId, nhanviens, dispatch]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBack = () => {
    navigate("/workmanagement/nhanvien");
  };

  const handleOpenDialog = (loaiQuanLy) => {
    setCurrentLoaiQuanLy(loaiQuanLy);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setCurrentLoaiQuanLy("");

    // Không cần refresh data nữa vì temporary items đã được preserve trong Redux
    // Chỉ reload khi user thực sự save/sync data
  };

  const getCurrentRelations = () => {
    return currentLoaiQuanLy === "Giao_Viec" ? giaoViecs : chamKPIs;
  };

  // Get initials from employee name
  const getInitials = (name) => {
    if (!name) return "?";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return words[words.length - 1].charAt(0).toUpperCase();
  };

  if (!currentNhanVienQuanLy) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <Alert severity="warning">
          <AlertTitle>Không tìm thấy nhân viên</AlertTitle>
          Không tìm thấy thông tin nhân viên với ID: {nhanVienId}
        </Alert>
      </Box>
    );
  }

  // Show skeleton on initial load
  if (isInitializing) {
    return (
      <Box sx={{ width: "100%", mt: 2 }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={400} height={40} />
          <Skeleton
            variant="rectangular"
            height={120}
            sx={{ borderRadius: 2 }}
          />
          <Skeleton
            variant="rectangular"
            height={400}
            sx={{ borderRadius: 2 }}
          />
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", mt: 2, mb: 4 }}>
      <Stack spacing={2}>
        {/* Breadcrumbs */}
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/workmanagement");
            }}
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Quản lý công việc
          </Link>
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/workmanagement/nhanvien");
            }}
            sx={{
              textDecoration: "none",
              "&:hover": { textDecoration: "underline" },
            }}
          >
            Nhân viên
          </Link>
          <Typography color="text.primary">Quản lý nhân viên</Typography>
        </Breadcrumbs>

        {/* Employee Info Card with Gradient */}
        <Card
          sx={{
            background: (theme) =>
              `linear-gradient(135deg, ${alpha(
                theme.palette.primary.main,
                0.1
              )} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
            borderRadius: 2,
            boxShadow: 2,
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap"
              gap={2}
            >
              {/* Left Section: Avatar + Info */}
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                sx={{ flex: 1 }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ArrowBack />}
                  onClick={handleBack}
                >
                  Quay lại
                </Button>

                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "primary.main",
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    boxShadow: 2,
                  }}
                >
                  {getInitials(currentNhanVienQuanLy.Ten)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 250 }}>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mb: 0.5 }}
                  >
                    <ManageAccounts color="primary" />
                    <Typography variant="h5" fontWeight="bold">
                      {currentNhanVienQuanLy.Ten}
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={2}
                    flexWrap="wrap"
                    alignItems="center"
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <WorkOutline fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {currentNhanVienQuanLy.MaNhanVien}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {currentNhanVienQuanLy.TenKhoa || "N/A"}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <CalendarToday fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {currentNhanVienQuanLy.ChucDanh || "N/A"}
                      </Typography>
                    </Stack>

                    {currentNhanVienQuanLy.Email && (
                      <Chip
                        icon={<Email />}
                        label={currentNhanVienQuanLy.Email}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                    {currentNhanVienQuanLy.SoDienThoai && (
                      <Chip
                        icon={<Phone />}
                        label={currentNhanVienQuanLy.SoDienThoai}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>

              {/* Right Section: Stats */}
              <Stack direction="row" spacing={2}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: alpha("#2e7d32", 0.1),
                    borderRadius: 1,
                  }}
                >
                  <Assignment color="success" fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Chấm KPI
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="success.main"
                      sx={{ lineHeight: 1 }}
                    >
                      {chamKPIs.length}
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: alpha("#1976d2", 0.1),
                    borderRadius: 1,
                  }}
                >
                  <People color="primary" fontSize="small" />
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Giao việc
                    </Typography>
                    <Typography
                      variant="h6"
                      fontWeight="bold"
                      color="primary"
                      sx={{ lineHeight: 1 }}
                    >
                      {giaoViecs.length}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert severity="error">
            <AlertTitle>Lỗi</AlertTitle>
            {error}
          </Alert>
        )}

        {/* Tabs with Badges */}
        <MainCard>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  "& .MuiTab-root": {
                    minHeight: 64,
                    fontSize: "1rem",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      backgroundColor: alpha("#1976d2", 0.05),
                    },
                  },
                }}
              >
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Danh sách chấm KPI</span>
                      <Badge
                        badgeContent={chamKPIs.length}
                        color="success"
                        max={999}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          },
                        }}
                      >
                        <Assignment />
                      </Badge>
                    </Stack>
                  }
                />
                <Tab
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>Danh sách giao việc</span>
                      <Badge
                        badgeContent={giaoViecs.length}
                        color="primary"
                        max={999}
                        sx={{
                          "& .MuiBadge-badge": {
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                          },
                        }}
                      >
                        <People />
                      </Badge>
                    </Stack>
                  }
                />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <DanhSachChamKPI onOpenDialog={handleOpenDialog} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <DanhSachGiaoViec onOpenDialog={handleOpenDialog} />
            </TabPanel>
          </Box>
        </MainCard>

        {/* Dialog */}
        <SelectNhanVienQuanLyDialog
          open={dialogOpen}
          onClose={handleCloseDialog}
          loaiQuanLy={currentLoaiQuanLy}
          currentRelations={getCurrentRelations()}
        />
      </Stack>
    </Box>
  );
}

export default QuanLyNhanVienPage;
