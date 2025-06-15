import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  Typography,
  Stack,
  Button,
  Grid,
  Chip,
  Paper,
  Fade,
  Tooltip,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  PersonOff,
  LocalHospital,
  Home,
  Warning,
  MedicalServices,
  AccessTime,
  Visibility,
  CalendarToday,
  Business,
  Save,
} from "@mui/icons-material";

import { CheckDisplayKhoa } from "utils/heplFuntion";
import useAuth from "hooks/useAuth";
import BenhNhanInsertFormRieng from "features/BenhNhan/RiengTheoKhoa/BenhNhanInsertFormRieng";
import ListBenhNhanCardRieng from "features/BenhNhan/RiengTheoKhoa/ListBenhNhanCardRieng";
import { insertOrUpdateBaoCaoNgay } from "./baocaongay_riengtheokhoaSlice";
import { ExportBaoCaoKhoaButton } from "../../components/ExportPPTKhoaRieng";

function BaoCaoKhoa() {
  const {
    bnTuVongs,
    bnChuyenViens,
    bnXinVes,
    bnNangs,
    bnPhauThuats,
    bnNgoaiGios,
    bnTheoDois,
    bcGiaoBanTheoNgay,
  } = useSelector((state) => state.baocaongay_riengtheokhoa);
  const { khoas } = useSelector((state) => state.baocaongay);
  const [tenLoaiBN, setTenLoaiBN] = useState("");
  const [loaiBN, setLoaiBN] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);
  const [coQuyen, setCoQuyen] = useState(false);
  const { user } = useAuth();
  // Xử lý đóng/mở form
  const handleCloseEditPostForm = () => {
    setOpenEdit(false);
  };
  const handleSaveEditPostForm = () => {
    // Code to save changes goes here
    setOpenEdit(false);
  };
  const handleEdit = (tenloai, loaiBN) => {
    setTenLoaiBN(tenloai);
    setLoaiBN(loaiBN);
    console.log(tenLoaiBN);
    setOpenEdit(true);
    console.log("click");
  };

  useEffect(() => {
    if (user && user.KhoaID && bcGiaoBanTheoNgay && khoas) {
      const phanquyen = user.PhanQuyen;
      const makhoaUser = user.KhoaID.MaKhoa;
      const foundKhoa = khoas.find(
        (khoa) => khoa._id === bcGiaoBanTheoNgay.KhoaID
      );
      const makhoaCurent = foundKhoa ? foundKhoa.MaKhoa : null;

      setCoQuyen(CheckDisplayKhoa(phanquyen, false, makhoaUser, makhoaCurent));
    }
  }, [user, bcGiaoBanTheoNgay, khoas]);

  // Hiển thị thông tin khoa và ngày
  const tenKhoa =
    bcGiaoBanTheoNgay && bcGiaoBanTheoNgay.KhoaID && khoas
      ? khoas.find((khoa) => khoa._id === bcGiaoBanTheoNgay.KhoaID)?.TenKhoa
      : "";

  const ngayBaoCao =
    bcGiaoBanTheoNgay && bcGiaoBanTheoNgay.Ngay
      ? new Date(bcGiaoBanTheoNgay.Ngay).toLocaleDateString("vi-VN")
      : "";
  // Icons mapping for different patient types
  const getPatientTypeIcon = (type) => {
    const iconMap = {
      1: <PersonOff />,
      2: <LocalHospital />,
      3: <Home />,
      4: <Warning />,
      5: <MedicalServices />,
      6: <AccessTime />,
      8: <Visibility />,
    };
    return iconMap[type] || <MedicalServices />;
  };

  // Patient type configurations
  const patientTypes = [
    {
      id: 1,
      name: "tử vong",
      label: "Tử vong",
      data: bnTuVongs,
      color: "error",
    },
    {
      id: 2,
      name: "chuyển viện",
      label: "Chuyển viện",
      data: bnChuyenViens,
      color: "warning",
    },
    { id: 3, name: "xin về", label: "Xin về", data: bnXinVes, color: "info" },
    { id: 4, name: "nặng", label: "NB Nặng", data: bnNangs, color: "error" },
    {
      id: 5,
      name: "phẫu thuật",
      label: "Phẫu thuật",
      data: bnPhauThuats,
      color: "primary",
    },
    {
      id: 6,
      name: "ngoài giờ",
      label: "Ngoài giờ",
      data: bnNgoaiGios,
      color: "secondary",
    },
    {
      id: 8,
      name: "theo dõi",
      label: "Theo dõi",
      data: bnTheoDois,
      color: "success",
    },
  ];

  const dispatch = useDispatch();
  const handleCapNhatDuLieu = () => {
    //Set ChitietChiSols-TongNB

    const ctChiSo = [
      { ChiSoCode: "ls-TuVong", SoLuong: bnTuVongs.length },
      { ChiSoCode: "ls-XinVe", SoLuong: bnXinVes.length },
      { ChiSoCode: "ls-Nang", SoLuong: bnNangs.length },
      { ChiSoCode: "ls-NgoaiGio", SoLuong: bnNgoaiGios.length },
      { ChiSoCode: "ls-PhauThuat", SoLuong: bnPhauThuats.length },
      { ChiSoCode: "ls-ChuyenVien", SoLuong: bnChuyenViens.length },
      { ChiSoCode: "ls-TheoDoi", SoLuong: bnTheoDois.length },
    ];
    // set BaoCaoNgay cap nhat
    const bcNgayKhoa = {
      ...bcGiaoBanTheoNgay,
      UserID: user._id,
      IsForKhoa: true,
      ChiTietBenhNhan: [
        ...bnTuVongs,
        ...bnChuyenViens,
        ...bnXinVes,
        ...bnNangs,
        ...bnPhauThuats,
        ...bnNgoaiGios,
        ...bnTheoDois,
      ],
      ChiTietChiSo: ctChiSo,
    };
    console.log("Cập nhật báo cáo khoa:", bcNgayKhoa);
    dispatch(insertOrUpdateBaoCaoNgay(bcNgayKhoa));
  };
  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 2 }}>
      <Fade in timeout={800}>
        <Stack spacing={2}>
          {/* Header Section */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderRadius: 3,
            }}
          >
            <Stack
              direction="row"
              alignItems="center"
              spacing={1}
              justifyContent="center"
            >
              <Business sx={{ fontSize: 20 }} />
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  textAlign: "center",
                  textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                }}
              >
                Báo cáo riêng theo khoa
              </Typography>
            </Stack>
            {/* Department and Date Info */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
              sx={{ mt: 3 }}
            >
              {" "}
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems="center"
              >
               
                <Chip
                  icon={<CalendarToday />}
                  label={`Ngày: ${ngayBaoCao}`}
                  variant="filled"
                  sx={{
                    bgcolor: "rgba(255,255,255,0.2)",
                    color: "white",
                    fontSize: "1.1rem",
                    py: 1,
                    px: 2,
                  }}
                />
              </Stack>
              {/* Update Button */}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                {coQuyen && (
                  <Tooltip title="Cập nhật tất cả dữ liệu báo cáo">
                    <Button
                      onClick={handleCapNhatDuLieu}
                      variant="contained"
                      startIcon={<Save />}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.15)",
                        color: "white",
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        fontSize: "1rem",
                        textTransform: "none",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        "&:hover": {
                          bgcolor: "rgba(255,255,255,0.25)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        },
                        transition: "all 0.3s ease",
                      }}
                    >
                      Cập nhật dữ liệu
                    </Button>
                  </Tooltip>
                )}

                {/* Export Report Button */}
                {tenKhoa && bcGiaoBanTheoNgay?.Ngay && (
                  <Box
                    sx={{
                      "& .MuiButton-root": {
                        bgcolor: "rgba(76, 175, 80, 0.15)",
                        color: "white",
                        borderRadius: 2,
                        px: 3,
                        py: 1,
                        fontWeight: 600,
                        fontSize: "1rem",
                        textTransform: "none",
                        backdropFilter: "blur(10px)",
                        border: "1px solid rgba(255,255,255,0.3)",
                        "&:hover": {
                          bgcolor: "rgba(76, 175, 80, 0.25)",
                          transform: "translateY(-1px)",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                        },
                        transition: "all 0.3s ease",
                      },
                    }}
                  >
                    <ExportBaoCaoKhoaButton
                      khoaId={bcGiaoBanTheoNgay.KhoaID}
                      date={bcGiaoBanTheoNgay.Ngay}
                      tenKhoa={tenKhoa}
                      variant="contained"
                      size="medium"
                    />
                  </Box>
                )}
              </Stack>
            </Stack>
          </Paper>{" "}
          {/* Statistics Cards */}
          <Card elevation={2} sx={{ p: 2, borderRadius: 2 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                textAlign: "center",
                color: "primary.main",
                fontWeight: 600,
              }}
            >
              Thống kê bệnh nhân
            </Typography>

            <Grid container spacing={2}>
              {patientTypes.map((type) => (
                <Grid item xs={6} sm={4} md={3} lg={2} key={type.id}>
                  <Card
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: 2,
                        borderColor: `${type.color}.main`,
                      },
                      borderRadius: 1.5,
                      minHeight: 120,
                    }}
                  >
                    <Box
                      sx={{
                        mb: 1,
                        color: `${type.color}.main`,
                        fontSize: "1.2rem",
                      }}
                    >
                      {getPatientTypeIcon(type.id)}
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        mb: 1,
                        textAlign: "center",
                        fontWeight: 500,
                        fontSize: "0.85rem",
                      }}
                    >
                      {type.label}
                    </Typography>

                    <Chip
                      label={type.data.length}
                      color={type.color}
                      size="small"
                      sx={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        mb: 1,
                        minWidth: 35,
                        height: 24,
                      }}
                    />

                    {coQuyen && (
                      <Tooltip title={`Thêm ${type.label.toLowerCase()}`}>
                        <Button
                          onClick={() => handleEdit(type.name, type.id)}
                          variant="contained"
                          color={type.color}
                          size="small"
                          sx={{
                            borderRadius: 1,
                            textTransform: "none",
                            fontWeight: 500,
                            minWidth: 60,
                            fontSize: "0.7rem",
                            px: 1,
                            py: 0.5,
                          }}
                        >
                          Thêm
                        </Button>
                      </Tooltip>
                    )}
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Card>
          {/* Form Dialog */}
          <BenhNhanInsertFormRieng
            open={openEdit}
            handleClose={handleCloseEditPostForm}
            handleSave={handleSaveEditPostForm}
            tenLoaiBN={tenLoaiBN}
            loaiBN={loaiBN}
            benhnhan={{}}
          />
          {/* Patient Lists */}
          <Stack spacing={3}>
            {bnTuVongs.length > 0 && (
              <Fade in timeout={1000}>
                <Box>
                  <ListBenhNhanCardRieng
                    benhnhans={bnTuVongs}
                    title="Người bệnh tử vong"
                  />
                </Box>
              </Fade>
            )}

            {bnChuyenViens.length > 0 && (
              <Fade in timeout={1200}>
                <Box>
                  <ListBenhNhanCardRieng
                    benhnhans={bnChuyenViens}
                    title="Người bệnh chuyển viện"
                  />
                </Box>
              </Fade>
            )}

            {bnXinVes.length > 0 && (
              <Fade in timeout={1400}>
                <Box>
                  <ListBenhNhanCardRieng
                    benhnhans={bnXinVes}
                    title="Người bệnh nặng xin về"
                  />
                </Box>
              </Fade>
            )}

            {bnNangs.length > 0 && (
              <Fade in timeout={1600}>
                <Box>
                  <ListBenhNhanCardRieng
                    benhnhans={bnNangs}
                    title="Người bệnh nặng"
                  />
                </Box>
              </Fade>
            )}

            {bnPhauThuats.length > 0 && (
              <Fade in timeout={1800}>
                <Box>
                  <ListBenhNhanCardRieng
                    benhnhans={bnPhauThuats}
                    title="Người bệnh phẫu thuật"
                  />
                </Box>
              </Fade>
            )}

            {bnNgoaiGios.length > 0 && (
              <Fade in timeout={2000}>
                <Box>
                  <ListBenhNhanCardRieng
                    benhnhans={bnNgoaiGios}
                    title="Người bệnh vào viện ngoài giờ"
                  />
                </Box>
              </Fade>
            )}

            {bnTheoDois.length > 0 && (
              <Fade in timeout={2200}>
                <Box>
                  <ListBenhNhanCardRieng
                    benhnhans={bnTheoDois}
                    title="Người bệnh theo dõi"
                  />
                </Box>
              </Fade>
            )}
          </Stack>
        </Stack>
      </Fade>
    </Box>
  );
}

export default BaoCaoKhoa;
