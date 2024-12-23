import {
  Box,
  Button,
  Card,
  CardHeader,
  Container,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { shallowEqual, useDispatch, useSelector } from "react-redux";

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
    bcGiaoBanTheoNgay,
    khoas,
    ctChiSos,
    isLoading,
  } = useSelector((state) => state.baocaongay);
  const { bcGiaoBanCurent} = useSelector((state)=>state.bcgiaoban);
  console.log("bcGiaobantheongay", bcGiaoBanTheoNgay);
  const defaultValues = {
    BSTruc:  "",
    DDTruc:  "",
    CBThemGio:"",
    TongVP: 0,
    TongBH: 0,
    TongNB: 0,
  };
  console.log("defaultvalue", defaultValues);
  const [tenkhoa, setTenkhoa] = useState("");
  const [ngay, setNgay] = useState();
  

  const methods = useForm({
    resolver: yupResolver(RegisterSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const [coQuyen,setCoQuyen] = useState(false )
  const dispatch = useDispatch();
  useEffect(()=>{
    if(bcGiaoBanTheoNgay.Ngay)
    {

      dispatch(getDataBCGiaoBanCurent(bcGiaoBanTheoNgay.Ngay))   
    }
    
  },[bcGiaoBanTheoNgay])

  useEffect(() => {
    if (bcGiaoBanCurent && user && user.KhoaID && bcGiaoBanTheoNgay && khoas) {
      const trangthai = bcGiaoBanCurent.TrangThai;
      const phanquyen = user.PhanQuyen;
      const makhoaUser = user.KhoaID.MaKhoa;
      const foundKhoa = khoas.find((khoa) => khoa._id === bcGiaoBanTheoNgay.KhoaID);
      const makhoaCurent = foundKhoa ? foundKhoa.MaKhoa : null;
      console.log("checkdisplay", trangthai, phanquyen, makhoaUser, makhoaCurent);
      setCoQuyen(CheckDisplayKhoa(phanquyen,trangthai,makhoaUser,makhoaCurent))
    }
  }, [bcGiaoBanCurent, user, bcGiaoBanTheoNgay, khoas]);


  useEffect(() => {
    //set value cho cac truong trong form
    setValue('BSTruc', bcGiaoBanTheoNgay.BSTruc || "");
  setValue('DDTruc', bcGiaoBanTheoNgay.DDTruc || "");
  setValue('CBThemGio', bcGiaoBanTheoNgay.CBThemGio || "");
  setValue('TongVP', ctChiSos.find(obj=>obj.ChiSoCode==="ls-VienPhi")?.SoLuong || 0);
  setValue('TongBH', ctChiSos.find(obj=>obj.ChiSoCode==="ls-BaoHiem")?.SoLuong || 0);
  setValue('TongNB', ctChiSos.find(obj=>obj.ChiSoCode==="ls-TongNB")?.SoLuong || 0);

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
  }, [bcGiaoBanTheoNgay, khoas,ctChiSos,setValue]);

  const [tenLoaiBN, setTenLoaiBN] = useState("");
  const [loaiBN, setLoaiBN] = useState(0);
  const [openEdit, setOpenEdit] = useState(false);
  const handleClickOpenEditPostForm = () => {
    setOpenEdit(true);
  };
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
    ];
    // set BaoCaoNgay cap nhat
    const bcNgayKhoa = {
      ...bcGiaoBanTheoNgay,
      UserID: user._id,
      BSTruc: data.BSTruc,
      DDTruc: data.DDTruc,
      CBThemGio: data.CBThemGio,
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

    console.log("BaoCaoNgay", data);
    console.log("user", user);
    console.log("BaoCaoNgay", bcNgayKhoa);
    dispatch(insertOrUpdateBaoCaoNgay(bcNgayKhoa));
  };
  const handleEdit = (tenloai, loaiBN) => {
    setTenLoaiBN(tenloai);
    setLoaiBN(loaiBN);
    console.log(tenLoaiBN);
    setOpenEdit(true);
    console.log("click");
  };

  

  return (
    <Container>
      <Stack>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(handleCapNhatDuLieu)}
        >
          <Stack direction="row" spacing={2} mt={3}>
            <Typography variant="h4" sx={{ mb: 3,textAlign:'center'}}>
              Báo cáo {tenkhoa} ngày {ngay}
            </Typography>
            <Box sx={{ flexGrow: 1 }} />
            {coQuyen&&(

            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              loading={isSubmitting}
            >
              Lưu
            </LoadingButton>
            )}
          </Stack>

          <Stack direction="row" spacing={5} my={3}>
            <FTextField name="BSTruc" label="Bác sĩ trực" />
            <FTextField name="DDTruc" label="Điều dưỡng trực" />
            <FTextField name="CBThemGio" label="Cán bộ làm thêm giờ" />
          </Stack>
          <Stack direction="row" spacing={5} mb={3}>
            <FTextField name="TongNB" label="Tổng số NB" />
            <FTextField name="TongBH" label="Số NB bảo hiểm" />
            <FTextField name="TongVP" label="Số NB viện phí" />
          </Stack>
        </FormProvider>
        <Stack >
          <Card sx={{display: 'flex', flexDirection: 'row', flexWrap:'wrap',p:2, justifyContent: "space-around" }}>
          <Card variant="outlined" sx={{p:1,display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            {/* <CardHeader title="Tử vong" variant="h6" /> */}
            <Typography variant="h6" m={1}>
              Tử vong : {bnTuVongs.length}
            </Typography>
            
            {coQuyen&&(

            <Button
              onClick={() => handleEdit("tử vong", 1)}
              variant="contained"
            >
              Thêm
            </Button>
            )}
          </Card>
          <Card variant="outlined" sx={{p:1,display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <Typography variant="h6" m={1}>
              Chuyển viện: {bnChuyenViens.length}
            </Typography>
            {coQuyen&&(
              
            <Button
              onClick={() => handleEdit("chuyển viện", 2)}
              variant="contained"
            >
              Thêm
            </Button>
              )}
          </Card>

          <Card variant="outlined" sx={{p:1,display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <Typography variant="h6" m={1}>
              Xin về: {bnXinVes.length}
            </Typography>
            {coQuyen&&(
              
            <Button onClick={() => handleEdit("xin về", 3)} variant="contained">
              Thêm
            </Button>
            )}
          </Card>

          <Card variant="outlined" sx={{p:1,display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <Typography variant="h6" m={1}>
              NB Nặng : {bnNangs.length}
            </Typography>
            {coQuyen&&(
              
            <Button onClick={() => handleEdit("nặng", 4)} variant="contained">
              Thêm
            </Button>
            )}
          </Card>

          <Card variant="outlined" sx={{p:1,display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <Typography variant="h6" m={1}>
              Phẫu thuật : {bnPhauThuats.length}
            </Typography>
            {coQuyen&&(
              
            <Button
              onClick={() => handleEdit("phẫu thuật", 5)}
              variant="contained"
            >
              Thêm
            </Button>
            )}
          </Card>

          <Card variant="outlined" sx={{p:1,display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <Typography variant="h6" m={1}>
              Ngoài giờ: {bnNgoaiGios.length}
            </Typography>
            {coQuyen&&(
              
            <Button
              onClick={() => handleEdit("ngoài giờ", 6)}
              variant="contained"
            >
              Thêm
            </Button>
            )}
          </Card>

          <Card variant="outlined" sx={{p:1,display: 'flex', flexDirection: 'column', alignItems:'center'}}>
            <Typography variant="h6" m={1}>
              Theo dõi: {bnTheoDois.length}
            </Typography>
            {coQuyen&&(
              
            <Button
              onClick={() => handleEdit("theo giờ", 8)}
              variant="contained"
            >
              Thêm
            </Button>
            )}
          </Card>
          </Card>
          <BenhNhanInsertForm
            open={openEdit}
            handleClose={handleCloseEditPostForm}
            handleSave={handleSaveEditPostForm}
            tenLoaiBN={tenLoaiBN}
            loaiBN={loaiBN}
            benhnhan={{}}
          />
        </Stack>

        {bnTuVongs.length > 0 && (
          <ListBenhNhanCard benhnhans={bnTuVongs} title="Người bệnh tử vong" />
        )}
        {bnChuyenViens.length > 0 && (
          <ListBenhNhanCard
            benhnhans={bnChuyenViens}
            title="Người bệnh chuyển viện"
          />
        )}
        {bnXinVes.length > 0 && (
          <ListBenhNhanCard
            benhnhans={bnXinVes}
            title="Người bệnh nặng xin về"
          />
        )}
        {bnNangs.length > 0 && (
          <ListBenhNhanCard benhnhans={bnNangs} title="Người bệnh nặng" />
        )}
        {bnPhauThuats.length > 0 && (
          <ListBenhNhanCard
            benhnhans={bnPhauThuats}
            title="Người bệnh phẫu thuật"
          />
        )}
        {bnNgoaiGios.length > 0 && (
          <ListBenhNhanCard
            benhnhans={bnNgoaiGios}
            title="Người bệnh vào viện ngoài giờ"
          />
        )}
        {bnTheoDois.length > 0 && (
          <ListBenhNhanCard
            benhnhans={bnTheoDois}
            title="Người bệnh theo dõi"
          />
        )}

      </Stack>
    </Container>
  );
}

export default BCNgayLamSangNgoai;
