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
  
  HoaSinh: Yup.number().typeError("Bạn phải nhập 1 số"),
 
});

function BCXetNghiemHS() {
  const { user } = useAuth();
  const { bcGiaoBanTheoNgay, khoas, ctChiSos, isLoading } = useSelector(
    (state) => state.baocaongay
  );
  const { bcGiaoBanCurent} = useSelector((state)=>state.bcgiaoban);
  console.log("bcGiaobantheongay", bcGiaoBanTheoNgay);
  const defaultValues = {
    BSTruc: "",
    DDTruc: "",
    CBThemGio: "",
    HoaSinh: 0,
   
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
      "BSTruc",
      bcGiaoBanTheoNgay.BSTruc || ""
    );
    setValue(
      "DDTruc",
      bcGiaoBanTheoNgay.DDTruc || ""
    );
    setValue(
      "CBThemGio",
     bcGiaoBanTheoNgay.CBThemGio || ""
    );
   

    setValue(
      "HoaSinh",
      ctChiSos.find((obj) => obj.ChiSoCode === "xn-HoaSinh")?.SoLuong || 0
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
     
      { ChiSoCode: "xn-HoaSinh", SoLuong: data.HoaSinh },
     
    ];
    // set BaoCaoNgay cap nhat
    const bcNgayKhoa = {
      ...bcGiaoBanTheoNgay,
      UserID: user._id,
      BSTruc:data.BSTruc,
      DDTruc:data.DDTruc,
      CBThemGio:data.CBThemGio,
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
              <FTextField name="BSTruc" label="Bác sĩ trực" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="DDTruc" label="Kỹ thuật viên trực" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="CBThemGio" label="Cán bộ thêm giờ" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="HoaSinh" label="Tổng số XN hóa sinh" />
            </Grid>
           
          </Grid>
        </FormProvider>
      </Stack>
    </Container>
  );
}

export default BCXetNghiemHS;
