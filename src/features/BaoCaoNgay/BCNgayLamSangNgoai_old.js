import {
  Box,
  Button,
  Card,
  Container,
  Stack,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Divider,
  Chip,
  alpha,
  useTheme,
  CardContent,
  CardHeader,
  Fade,
  Zoom,
} from "@mui/material";
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
  Group,
  MonetizationOn,
  AccountBalance,
  Assignment,
} from "@mui/icons-material";
import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { useDispatch, useSelector } from "react-redux";

import { FTextField, FormProvider } from "../../components/form";
import BenhNhanInsertForm from "../BenhNhan/BenhNhanInsertForm";
import ListBenhNhanCard from "../BenhNhan/ListBenhNhanCard";
import useAuth from "../../hooks/useAuth";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { insertOrUpdateBaoCaoNgay } from "./baocaongaySlice";
import dayjs from "dayjs";
import { fDate } from "../../utils/formatTime";
import { getDataBCGiaoBanCurent } from "../BCGiaoBan/bcgiaobanSlice";
import { CheckDisplayKhoa } from "../../utils/heplFuntion";
import BaoCaoKhoa from "./BaoCaoKhoa";

const RegisterSchema = Yup.object().shape({
  // TongVP: Yup.number().typeError("Must be a number").required("Field is required"),
  TongVP: Yup.number().typeError("Bạn phải nhập 1 số"),
  TongBH: Yup.number().typeError("Bạn phải nhập 1 số"),
  TongNB: Yup.number().typeError("Bạn phải nhập 1 số"),
});

function BCNgayLamSangNgoai() {
  const { user } = useAuth();
  const {
    bnTuVongs,
    bnChuyenViens,
    bnXinVes,
    bnNangs,
    bnPhauThuats,
    bnNgoaiGios,
    bnTheoDois,
    bnMoCCs,
    bcGiaoBanTheoNgay,
    khoas,
    ctChiSos,
  } = useSelector((state) => state.baocaongay);
  const { bcGiaoBanCurent } = useSelector((state) => state.bcgiaoban);
  console.log("bcGiaobantheongay", bcGiaoBanTheoNgay);
  const defaultValues = {
    BSTruc: "",
    DDTruc: "",
    CBThemGio: "",
    TongVP: 0,
    TongBH: 0,
    TongNB: 0,
  };
  console.log("defaultvalue", defaultValues);
  const [tenkhoa, setTenkhoa] = useState("");
  const [ngay, setNgay] = useState();
  const [tabValue, setTabValue] = useState(0);
  const [makhoaCurrent, setMakhoaCurrent] = useState(null);

  const handleChangeTab = (event, newValue) => {
    setTabValue(newValue);
  };

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const [coQuyen, setCoQuyen] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    if (bcGiaoBanTheoNgay.Ngay) {
      dispatch(getDataBCGiaoBanCurent(bcGiaoBanTheoNgay.Ngay));
    }
  }, [bcGiaoBanTheoNgay, dispatch]);
  useEffect(() => {
    if (bcGiaoBanCurent && user && user.KhoaID && bcGiaoBanTheoNgay && khoas) {
      const trangthai = bcGiaoBanCurent.TrangThai;
      const phanquyen = user.PhanQuyen;
      const makhoaUser = user.KhoaID.MaKhoa;
      const foundKhoa = khoas.find(
        (khoa) => khoa._id === bcGiaoBanTheoNgay.KhoaID
      );
      const makhoaCurent = foundKhoa ? foundKhoa.MaKhoa : null;
      console.log(
        "checkdisplay",
        trangthai,
        phanquyen,
        makhoaUser,
        makhoaCurent
      );
      setCoQuyen(
        CheckDisplayKhoa(phanquyen, trangthai, makhoaUser, makhoaCurent)
      );
      setMakhoaCurrent(makhoaCurent);
    }
  }, [bcGiaoBanCurent, user, bcGiaoBanTheoNgay, khoas]);

  useEffect(() => {
    //set value cho cac truong trong form
    setValue("BSTruc", bcGiaoBanTheoNgay.BSTruc || "");
    setValue("DDTruc", bcGiaoBanTheoNgay.DDTruc || "");
    setValue("CBThemGio", bcGiaoBanTheoNgay.CBThemGio || "");
    setValue(
      "TongVP",
      ctChiSos.find((obj) => obj.ChiSoCode === "ls-VienPhi")?.SoLuong || 0
    );
    setValue(
      "TongBH",
      ctChiSos.find((obj) => obj.ChiSoCode === "ls-BaoHiem")?.SoLuong || 0
    );
    setValue(
      "TongNB",
      ctChiSos.find((obj) => obj.ChiSoCode === "ls-TongNB")?.SoLuong || 0
    );

    //Hiển thị khoa và ngày
    if (bcGiaoBanTheoNgay.KhoaID) {
      const TenKhoa = khoas.find(
        (khoa) => khoa._id === bcGiaoBanTheoNgay.KhoaID
      ).TenKhoa;
      const ngayISO = bcGiaoBanTheoNgay.Ngay;
      const ngay = new Date(ngayISO);
      const ngayFns = fDate(ngay);
      const ngayJS = dayjs(ngay);
      console.log("ngay", ngay);
      console.log("ngayISO", ngayISO);
      console.log("ngayFns", ngayFns);
      console.log("ngayJs", ngayJS);
      setNgay(ngayFns);
      if (TenKhoa) setTenkhoa(TenKhoa);
    }
  }, [bcGiaoBanTheoNgay, khoas, ctChiSos, setValue]);
  const [tenLoaiBN, setTenLoaiBN] = useState("");
  const [loaiBN, setLoaiBN] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);

  // Xử lý đóng/mở form
  const handleCloseEditPostForm = () => {
    setOpenEdit(false);
  };
  const handleSaveEditPostForm = () => {
    // Code to save changes goes here
    setOpenEdit(false);
  };

  const handleCapNhatDuLieu = (data) => {
    //Set ChitietChiSols-TongNB

    const ctChiSo = [
      { ChiSoCode: "ls-TongNB", SoLuong: data.TongNB },
      { ChiSoCode: "ls-BaoHiem", SoLuong: data.TongBH },
      { ChiSoCode: "ls-VienPhi", SoLuong: data.TongVP },
      { ChiSoCode: "ls-TuVong", SoLuong: bnTuVongs.length },
      { ChiSoCode: "ls-XinVe", SoLuong: bnXinVes.length },
      { ChiSoCode: "ls-Nang", SoLuong: bnNangs.length },
      { ChiSoCode: "ls-NgoaiGio", SoLuong: bnNgoaiGios.length },
      { ChiSoCode: "ls-PhauThuat", SoLuong: bnPhauThuats.length },
      { ChiSoCode: "ls-ChuyenVien", SoLuong: bnChuyenViens.length },
      { ChiSoCode: "ls-TheoDoi", SoLuong: bnTheoDois.length },
      { ChiSoCode: "ls-MoCC", SoLuong: bnMoCCs.length },
    ];
    // set BaoCaoNgay cap nhat
    const bcNgayKhoa = {
      ...bcGiaoBanTheoNgay,
      UserID: user._id,
      BSTruc: data.BSTruc,
      DDTruc: data.DDTruc,
      CBThemGio: data.CBThemGio,
      IsForKhoa: false,
      ChiTietBenhNhan: [
        ...bnTuVongs,
        ...bnChuyenViens,
        ...bnXinVes,
        ...bnNangs,
        ...bnPhauThuats,
        ...bnNgoaiGios,
        ...bnTheoDois,
        ...bnMoCCs,
      ],
      ChiTietChiSo: ctChiSo,
    };

    console.log("BaoCaoNgay Khoa", bcNgayKhoa);
    dispatch(insertOrUpdateBaoCaoNgay(bcNgayKhoa));
  };
  const handleEdit = (tenloai, loaiBN) => {
    setTenLoaiBN(tenloai);
    setLoaiBN(loaiBN);
    console.log(tenLoaiBN);
    setOpenEdit(true);
    console.log("click");
  };

  // Kiểm tra có hiển thị tab báo cáo riêng theo khoa không
  const showBaoCaoKhoaTab = makhoaCurrent === "NgoaiYC";

  // Component thống kê card với icon và màu sắc
  const StatisticCard = ({ title, count, icon, color, onClick, disabled }) => {
    const theme = useTheme();
    
    return (
      <Zoom in={true} style={{ transitionDelay: '100ms' }}>
        <Card
          sx={{
            p: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 120,
            background: `linear-gradient(135deg, ${alpha(color, 0.1)} 0%, ${alpha(color, 0.05)} 100%)`,
            border: `1px solid ${alpha(color, 0.2)}`,
            transition: 'all 0.3s ease-in-out',
            cursor: disabled ? 'default' : 'pointer',
            '&:hover': {
              transform: disabled ? 'none' : 'translateY(-4px)',
              boxShadow: disabled ? 'none' : `0 8px 25px ${alpha(color, 0.3)}`,
              background: disabled ? undefined : `linear-gradient(135deg, ${alpha(color, 0.15)} 0%, ${alpha(color, 0.08)} 100%)`,
            }
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 1,
            color: color 
          }}>
            {icon}
            <Typography 
              variant="h3" 
              sx={{ 
                ml: 1, 
                fontWeight: 'bold',
                color: color 
              }}
            >
              {count}
            </Typography>
          </Box>
          <Typography 
            variant="body2" 
            sx={{ 
              textAlign: 'center',
              color: 'text.secondary',
              fontWeight: 500 
            }}
          >
            {title}
          </Typography>
          {!disabled && (
            <Button
              onClick={onClick}
              variant="contained"
              size="small"
              sx={{
                mt: 1,
                minWidth: 80,
                backgroundColor: color,
                '&:hover': {
                  backgroundColor: alpha(color, 0.8),
                }
              }}
            >
              Thêm
            </Button>
          )}
        </Card>
      </Zoom>
    );
  };

  return (
    <Container maxWidth="xl">
      <Stack spacing={3}>
        {/* Header với thông tin báo cáo */}
        <Paper 
          elevation={0}
          sx={{ 
            p: 3, 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Stack direction="row" alignItems="center" spacing={2}>
            <Assignment sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Báo cáo {tenkhoa}
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Ngày {ngay}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      <Stack>
        {" "}
        {/* <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
          Báo cáo {tenkhoa} ngày {ngay}
        </Typography>
         */}
        {/* Tabs navigation */}
        {showBaoCaoKhoaTab && (
          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <Tabs
              value={tabValue}
              onChange={handleChangeTab}
              aria-label="báo cáo tabs"
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem',
                  minWidth: 180,
                },
                '& .Mui-selected': {
                  background: alpha('#1976d2', 0.1),
                }
              }}
            >
              <Tab 
                label="Báo cáo toàn viện" 
                icon={<Business />}
                iconPosition="start"
              />
              <Tab 
                label="Báo cáo riêng theo khoa" 
                icon={<LocalHospital />}
                iconPosition="start"
              />
            </Tabs>
          </Paper>
        )}
        {!showBaoCaoKhoaTab || tabValue === 0 ? (
          <Fade in={true}>
            <Stack spacing={3}>
              {/* Form thông tin trực */}
              <FormProvider
                methods={methods}
                onSubmit={handleSubmit(handleCapNhatDuLieu)}
              >
                <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                  <CardHeader 
                    title="Thông tin trực"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    sx={{ pb: 2 }}
                  />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <FTextField 
                        name="BSTruc" 
                        label="Bác sĩ trực"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FTextField 
                        name="DDTruc" 
                        label="Điều dưỡng trực"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FTextField 
                        name="CBThemGio" 
                        label="Cán bộ làm thêm giờ"
                        fullWidth
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 3 }} />

                  <CardHeader 
                    title="Thống kê bệnh nhân"
                    titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                    sx={{ pb: 2 }}
                  />
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Group color="primary" />
                        <FTextField 
                          name="TongNB" 
                          label="Tổng số NB"
                          type="number"
                          fullWidth
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <AccountBalance color="success" />
                        <FTextField 
                          name="TongBH" 
                          label="Số NB bảo hiểm"
                          type="number"
                          fullWidth
                        />
                      </Stack>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <MonetizationOn color="warning" />
                        <FTextField 
                          name="TongVP" 
                          label="Số NB viện phí"
                          type="number"
                          fullWidth
                        />
                      </Stack>
                    </Grid>
                  </Grid>

                  {coQuyen && (
                    <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
                      <LoadingButton
                        type="submit"
                        variant="contained"
                        size="large"
                        startIcon={<Save />}
                        loading={isSubmitting}
                        sx={{
                          minWidth: 120,
                          borderRadius: 2,
                          textTransform: 'none',
                          fontWeight: 600
                        }}
                      >
                        Lưu thông tin
                      </LoadingButton>
                    </Stack>
                  )}
                </Paper>
              </FormProvider>
              {/* Thống kê các loại bệnh nhân */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
                <CardHeader 
                  title="Thống kê tình hình bệnh nhân"
                  titleTypographyProps={{ variant: 'h6', fontWeight: 'bold' }}
                  sx={{ pb: 2 }}
                />
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="Tử vong"
                      count={bnTuVongs.length}
                      icon={<PersonOff sx={{ fontSize: 28 }} />}
                      color="#f44336"
                      onClick={() => handleEdit("tử vong", 1)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="Chuyển viện"
                      count={bnChuyenViens.length}
                      icon={<LocalHospital sx={{ fontSize: 28 }} />}
                      color="#ff9800"
                      onClick={() => handleEdit("chuyển viện", 2)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="Xin về"
                      count={bnXinVes.length}
                      icon={<Home sx={{ fontSize: 28 }} />}
                      color="#2196f3"
                      onClick={() => handleEdit("xin về", 3)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="NB Nặng"
                      count={bnNangs.length}
                      icon={<Warning sx={{ fontSize: 28 }} />}
                      color="#ff5722"
                      onClick={() => handleEdit("nặng", 4)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="Mổ cấp cứu"
                      count={bnMoCCs.length}
                      icon={<MedicalServices sx={{ fontSize: 28 }} />}
                      color="#e91e63"
                      onClick={() => handleEdit("mổ cấp cứu", 9)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="Phẫu thuật"
                      count={bnPhauThuats.length}
                      icon={<MedicalServices sx={{ fontSize: 28 }} />}
                      color="#9c27b0"
                      onClick={() => handleEdit("phẫu thuật", 5)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="Ngoài giờ"
                      count={bnNgoaiGios.length}  
                      icon={<AccessTime sx={{ fontSize: 28 }} />}
                      color="#607d8b"
                      onClick={() => handleEdit("ngoài giờ", 6)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <StatisticCard
                      title="Theo dõi"
                      count={bnTheoDois.length}
                      icon={<Visibility sx={{ fontSize: 28 }} />}
                      color="#4caf50"
                      onClick={() => handleEdit("theo giờ", 8)}
                      disabled={!coQuyen}
                    />
                  </Grid>
                </Grid>
              </Paper>

              <BenhNhanInsertForm
                open={openEdit}
                handleClose={handleCloseEditPostForm}
                handleSave={handleSaveEditPostForm}
                tenLoaiBN={tenLoaiBN}
                loaiBN={loaiBN}
                benhnhan={{}}
              />
              {/* Danh sách chi tiết bệnh nhân */}
              {bnTuVongs.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '200ms' }}>
                  <div>
                    <ListBenhNhanCard
                      benhnhans={bnTuVongs}
                      title="Người bệnh tử vong"
                    />
                  </div>
                </Fade>
              )}
              
              {bnChuyenViens.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '300ms' }}>
                  <div>
                    <ListBenhNhanCard
                      benhnhans={bnChuyenViens}
                      title="Người bệnh chuyển viện"
                    />
                  </div>
                </Fade>
              )}
              
              {bnXinVes.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '400ms' }}>
                  <div>
                    <ListBenhNhanCard
                      benhnhans={bnXinVes}
                      title="Người bệnh nặng xin về"
                    />
                  </div>
                </Fade>
              )}
              
              {bnNangs.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '500ms' }}>
                  <div>
                    <ListBenhNhanCard 
                      benhnhans={bnNangs} 
                      title="Người bệnh nặng" 
                    />
                  </div>
                </Fade>
              )}
              
              {bnMoCCs.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '600ms' }}>
                  <div>
                    <ListBenhNhanCard 
                      benhnhans={bnMoCCs} 
                      title="Người bệnh mổ cấp cứu" 
                    />
                  </div>
                </Fade>
              )}
              
              {bnPhauThuats.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '700ms' }}>
                  <div>
                    <ListBenhNhanCard
                      benhnhans={bnPhauThuats}
                      title="Người bệnh phẫu thuật"
                    />
                  </div>
                </Fade>
              )}
              
              {bnNgoaiGios.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '800ms' }}>
                  <div>
                    <ListBenhNhanCard
                      benhnhans={bnNgoaiGios}
                      title="Người bệnh vào viện ngoài giờ"
                    />
                  </div>
                </Fade>
              )}
              
              {bnTheoDois.length > 0 && (
                <Fade in={true} style={{ transitionDelay: '900ms' }}>
                  <div>
                    <ListBenhNhanCard
                      benhnhans={bnTheoDois}
                      title="Người bệnh theo dõi"
                    />
                  </div>
                </Fade>
              )}
            </Stack>
          </Fade>
        ) : (
          showBaoCaoKhoaTab && <BaoCaoKhoa />
        )}
      </Stack>
    </Container>
  );
}

export default BCNgayLamSangNgoai;
