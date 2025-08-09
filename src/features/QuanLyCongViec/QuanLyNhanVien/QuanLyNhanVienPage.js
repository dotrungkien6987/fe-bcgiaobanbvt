import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
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
} from "@mui/material";
import {
  ArrowBack,
  ManageAccounts,
  People,
  Assignment,
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

  const { currentNhanVienQuanLy, giaoViecs, chamKPIs, error } = useSelector(
    (state) => state.quanLyNhanVien
  );

  const { nhanviens } = useSelector((state) => state.nhanvien);

  // Initialize data when component mounts
  useEffect(() => {
    const initializeData = async () => {
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

  if (!currentNhanVienQuanLy) {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Alert severity="warning">
            <AlertTitle>Không tìm thấy nhân viên</AlertTitle>
            Không tìm thấy thông tin nhân viên với ID: {nhanVienId}
          </Alert>
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid container spacing={3}>
      {/* Breadcrumbs */}
      <Grid item xs={12}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link
            color="inherit"
            href="#"
            onClick={(e) => {
              e.preventDefault();
              navigate("/workmanagement");
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
          >
            Nhân viên
          </Link>
          <Typography color="text.primary">Quản lý nhân viên</Typography>
        </Breadcrumbs>
      </Grid>

      {/* Header */}
      <Grid item xs={12}>
        <MainCard>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ArrowBack />}
                onClick={handleBack}
              >
                Quay lại
              </Button>

              <ManageAccounts fontSize="large" color="primary" />

              <Box>
                <Typography variant="h4">
                  Quản lý nhân viên: {currentNhanVienQuanLy.Ten}
                </Typography>
                <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                  <Chip
                    label={`Mã NV: ${currentNhanVienQuanLy.MaNhanVien}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Khoa: ${currentNhanVienQuanLy.TenKhoa || "N/A"}`}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={`Chức danh: ${
                      currentNhanVienQuanLy.ChucDanh || "N/A"
                    }`}
                    size="small"
                    variant="outlined"
                  />
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={2}>
              <Typography variant="body2" color="text.secondary">
                <People fontSize="small" /> Giao việc: {giaoViecs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                <Assignment fontSize="small" /> Chấm KPI: {chamKPIs.length}
              </Typography>
            </Stack>
          </Stack>
        </MainCard>
      </Grid>

      {/* Error Display */}
      {error && (
        <Grid item xs={12}>
          <Alert severity="error">
            <AlertTitle>Lỗi</AlertTitle>
            {error}
          </Alert>
        </Grid>
      )}

      {/* Tabs */}
      <Grid item xs={12}>
        <MainCard>
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab
                  label={`Giao việc (${giaoViecs.length})`}
                  icon={<People />}
                  iconPosition="start"
                />
                <Tab
                  label={`Chấm KPI (${chamKPIs.length})`}
                  icon={<Assignment />}
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            <TabPanel value={activeTab} index={0}>
              <DanhSachGiaoViec onOpenDialog={handleOpenDialog} />
            </TabPanel>

            <TabPanel value={activeTab} index={1}>
              <DanhSachChamKPI onOpenDialog={handleOpenDialog} />
            </TabPanel>
          </Box>
        </MainCard>
      </Grid>

      {/* Dialog */}
      <SelectNhanVienQuanLyDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        loaiQuanLy={currentLoaiQuanLy}
        currentRelations={getCurrentRelations()}
      />
    </Grid>
  );
}

export default QuanLyNhanVienPage;
