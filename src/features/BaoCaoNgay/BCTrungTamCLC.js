import { Box, Container, Grid, Stack, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";

import { useDispatch, useSelector } from "react-redux";

import { FTextField, FormProvider } from "../../components/form";

import useAuth from "../../hooks/useAuth";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { LoadingButton } from "@mui/lab";
import { insertOrUpdateBaoCaoNgay } from "./baocaongaySlice";
import dayjs from "dayjs";
import { fDate } from "../../utils/formatTime";
import { CheckDisplayKhoa } from "../../utils/heplFuntion";
import { getDataBCGiaoBanCurent } from "../BCGiaoBan/bcgiaobanSlice";

const RegisterSchema = Yup.object().shape({
  // TongVP: Yup.number().typeError("Must be a number").required("Field is required"),
  TongKham: Yup.number().typeError("Bạn phải nhập 1 số"),
  BaoHiem: Yup.number().typeError("Bạn phải nhập 1 số"),
  VienPhi: Yup.number().typeError("Bạn phải nhập 1 số"),
  YeuCau: Yup.number().typeError("Bạn phải nhập 1 số"),
  NBVaoVien: Yup.number().typeError("Bạn phải nhập 1 số"),
  CVNgoaiTru: Yup.number().typeError("Bạn phải nhập 1 số"),
  CVNoiTru: Yup.number().typeError("Bạn phải nhập 1 số"),
  NgoaiTinhNgoaiTruBH: Yup.number().typeError("Bạn phải nhập 1 số"),
  NgoaiTinhNgoaiTruVP: Yup.number().typeError("Bạn phải nhập 1 số"),
  NgoaiTinhNoiTruBH: Yup.number().typeError("Bạn phải nhập 1 số"),
  NgoaiTinhNoiTruVP: Yup.number().typeError("Bạn phải nhập 1 số"),
});

function BCTrungTamCLC() {
  const { user } = useAuth();
  const { bcGiaoBanTheoNgay, khoas, ctChiSos, isLoading } = useSelector(
    (state) => state.baocaongay
  );
  const { bcGiaoBanCurent} = useSelector((state)=>state.bcgiaoban);
  console.log("bcGiaobantheongay", bcGiaoBanTheoNgay);
  const defaultValues = {
    TongNB: 0,
    VaoThang: 0,
    ChuyenSang: 0,
    GiuongTrong: 0,
   
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

    setValue(
      "TongNB",
      ctChiSos.find((obj) => obj.ChiSoCode === "clc-TongNB")?.SoLuong || 0
    );
    setValue(
      "VaoThang",
      ctChiSos.find((obj) => obj.ChiSoCode === "clc-VaoThang")?.SoLuong || 0
    );
    setValue(
      "ChuyenSang",
      ctChiSos.find((obj) => obj.ChiSoCode === "clc-ChuyenSang")?.SoLuong || 0
    );
    setValue(
      "GiuongTrong",
      ctChiSos.find((obj) => obj.ChiSoCode === "clc-GiuongTrong")?.SoLuong || 0
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

  
  const handleCapNhatDuLieu = (data) => {
    //Set ChitietChiSols-TongNB

    const ctChiSo = [
      { ChiSoCode: "clc-TongNB", SoLuong: data.TongNB },
      { ChiSoCode: "clc-VaoThang", SoLuong: data.VaoThang },
      { ChiSoCode: "clc-ChuyenSang", SoLuong: data.ChuyenSang },
      { ChiSoCode: "clc-GiuongTrong", SoLuong: data.GiuongTrong },
      
    ];
    // set BaoCaoNgay cap nhat
    const bcNgayKhoa = {
      ...bcGiaoBanTheoNgay,
      UserID: user._id,
      ChiTietBenhNhan: [],
      ChiTietChiSo: ctChiSo,
    };

    console.log("BaoCaoNgay", data);
    console.log("user", user);
    console.log("BaoCaoNgay", bcNgayKhoa);
    dispatch(insertOrUpdateBaoCaoNgay(bcNgayKhoa));
  };

  return (
    <Container>
      <Stack>
        <FormProvider
          methods={methods}
          onSubmit={handleSubmit(handleCapNhatDuLieu)}
        >
          <Stack direction="row" spacing={2} mt={3}>
            {/* <Typography variant="h4" sx={{ mb: 3 }}>
              Báo cáo {tenkhoa} ngày {ngay}
            </Typography> */}
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
          <Grid container spacing={3} my={1}>
            <Grid item xs={6} md={6}>
              <FTextField name="TongNB" label="Tổng số NB" />
            </Grid>
            <Grid item xs={6} md={6}>
              <FTextField name="VaoThang" label="NB vào thẳng" />
            </Grid>
            <Grid item xs={6} md={6}>
              <FTextField name="ChuyenSang" label="NB từ các khoa chuyển sang" />
            </Grid>
            <Grid item xs={6} md={6}>
              <FTextField name="GiuongTrong" label="Số giường trống" />
            </Grid>
           
          </Grid>
        </FormProvider>
      </Stack>
    </Container>
  );
}

export default BCTrungTamCLC;
