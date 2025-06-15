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
import { getDataBCGiaoBanCurent } from "../BCGiaoBan/bcgiaobanSlice";
import { CheckDisplayKhoa } from "../../utils/heplFuntion";

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

function BCPhongKhamYeuCau() {
  const { user } = useAuth();
  const { bcGiaoBanTheoNgay, khoas, ctChiSos, isLoading } = useSelector(
    (state) => state.baocaongay
  );
  const { bcGiaoBanCurent} = useSelector((state)=>state.bcgiaoban);
  console.log("bcGiaobantheongay", bcGiaoBanTheoNgay);
  const defaultValues = {
    TongKham: 0,
    BaoHiem: 0,
    VienPhi: 0,
    YeuCau: 0,
    NBVaoVien: 0,
    CVNgoaiTru: 0,
    CVNoiTru: 0,
    NgoaiTinhNgoaiTruBH: 0,
    NgoaiTinhNgoaiTruVP: 0,
    NgoaiTinhNoiTruBH: 0,
    NgoaiTinhNoiTruVP: 0,
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
      "TongKham",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-TongKham")?.SoLuong || 0
    );
    setValue(
      "BaoHiem",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-BaoHiem")?.SoLuong || 0
    );
    setValue(
      "VienPhi",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-VienPhi")?.SoLuong || 0
    );
    setValue(
      "YeuCau",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-YeuCau")?.SoLuong || 0
    );
    setValue(
      "NBVaoVien",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-NBVaoVien")?.SoLuong || 0
    );
    setValue(
      "CVNgoaiTru",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-CVNgoaiTru")?.SoLuong || 0
    );
    setValue(
      "CVNoiTru",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-CVNoiTru")?.SoLuong || 0
    );
    setValue(
      "NgoaiTinhNgoaiTruBH",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-NgoaiTinhNgoaiTruBH")
        ?.SoLuong || 0
    );
    setValue(
      "NgoaiTinhNgoaiTruVP",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-NgoaiTinhNgoaiTruVP")
        ?.SoLuong || 0
    );
    setValue(
      "NgoaiTinhNoiTruBH",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-NgoaiTinhNoiTruBH")
        ?.SoLuong || 0
    );
    setValue(
      "NgoaiTinhNoiTruVP",
      ctChiSos.find((obj) => obj.ChiSoCode === "pkyc-NgoaiTinhNoiTruVP")
        ?.SoLuong || 0
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
      { ChiSoCode: "pkyc-TongKham", SoLuong: data.TongKham },
      { ChiSoCode: "pkyc-BaoHiem", SoLuong: data.BaoHiem },
      { ChiSoCode: "pkyc-VienPhi", SoLuong: data.VienPhi },
      { ChiSoCode: "pkyc-YeuCau", SoLuong: data.YeuCau },
      { ChiSoCode: "pkyc-NBVaoVien", SoLuong: data.NBVaoVien },
      { ChiSoCode: "pkyc-CVNgoaiTru", SoLuong: data.CVNgoaiTru },
      { ChiSoCode: "pkyc-CVNoiTru", SoLuong: data.CVNoiTru },
      {
        ChiSoCode: "pkyc-NgoaiTinhNgoaiTruBH",
        SoLuong: data.NgoaiTinhNgoaiTruBH,
      },
      {
        ChiSoCode: "pkyc-NgoaiTinhNgoaiTruVP",
        SoLuong: data.NgoaiTinhNgoaiTruVP,
      },
      { ChiSoCode: "pkyc-NgoaiTinhNoiTruBH", SoLuong: data.NgoaiTinhNoiTruBH },
      { ChiSoCode: "pkyc-NgoaiTinhNoiTruVP", SoLuong: data.NgoaiTinhNoiTruVP },
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
            <Grid item xs={6} md={4}>
              <FTextField name="TongKham" label="Tổng khám" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="BaoHiem" label="Bảo hiểm" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="VienPhi" label="Viện phí" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="YeuCau" label="Yêu cầu" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="NBVaoVien" label="Vào viện" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="CVNgoaiTru" label="Chuyển viện ngoại trú" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="CVNoiTru" label="Chuyển viện nội trú" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField
                name="NgoaiTinhNgoaiTruBH"
                label="Ngoại tỉnh ngoại trú bảo hiểm"
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField
                name="NgoaiTinhNgoaiTruVP"
                label="Ngoại tỉnh ngoại trú viện phí"
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField
                name="NgoaiTinhNoiTruBH"
                label="Ngoại tỉnh nội trú bảo hiểm"
              />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField
                name="NgoaiTinhNoiTruVP"
                label="Ngoại tỉnh nội trú viện phí"
              />
            </Grid>
          </Grid>
        </FormProvider>
      </Stack>
    </Container>
  );
}

export default BCPhongKhamYeuCau;
