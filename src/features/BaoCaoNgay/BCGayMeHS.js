import { Box, Button, Card, Container, Grid, Stack, Typography } from "@mui/material";
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
import BenhNhanInsertForm from "features/BenhNhan/BenhNhanInsertForm";
import ListBenhNhanCard from "features/BenhNhan/ListBenhNhanCard";

const RegisterSchema = Yup.object().shape({
  
  TongMo: Yup.number().typeError("Bạn phải nhập 1 số"),
  TrongGio: Yup.number().typeError("Bạn phải nhập 1 số"),
  NgoaiGio: Yup.number().typeError("Bạn phải nhập 1 số"),

});

function BCGayMeHS() {
  const { user } = useAuth();
  const { bcGiaoBanTheoNgay, khoas, ctChiSos, isLoading,bnTuVongs,bnTheoDois } = useSelector(
    (state) => state.baocaongay
  );
  
  const { bcGiaoBanCurent} = useSelector((state)=>state.bcgiaoban);
  console.log("bcGiaobantheongay", bcGiaoBanTheoNgay);
  const defaultValues = {
    BSTruc: "",
    DDTruc: "",
    CBThemGio: "",
    TongMo: 0,
    TrongGio: 0,
    NgoaiGio: 0,
   
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
      "TongMo",
      ctChiSos.find((obj) => obj.ChiSoCode === "gmhs-TongMo")?.SoLuong || 0
    );
    setValue(
      "TrongGio",
      ctChiSos.find((obj) => obj.ChiSoCode === "gmhs-TrongGio")?.SoLuong || 0
    );
    setValue(
      "NgoaiGio",
      ctChiSos.find((obj) => obj.ChiSoCode === "gmhs-NgoaiGio")?.SoLuong || 0
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
     
      { ChiSoCode: "gmhs-TongMo", SoLuong: data.TongMo },
      { ChiSoCode: "gmhs-TrongGio", SoLuong: data.TrongGio },
      { ChiSoCode: "gmhs-NgoaiGio", SoLuong: data.NgoaiGio },
      { ChiSoCode: "ls-TuVong", SoLuong: bnTuVongs.length },
      { ChiSoCode: "ls-TheoDoi", SoLuong: bnTheoDois.length },
    ];
    // set BaoCaoNgay cap nhat
    const bcNgayKhoa = {
      ...bcGiaoBanTheoNgay,
      UserID: user._id,
      BSTruc:data.BSTruc,
      DDTruc:data.DDTruc,
      CBThemGio:data.CBThemGio,
      ChiTietBenhNhan: [...bnTuVongs,...bnTheoDois],
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
              <FTextField name="TongMo" label="Tổng BN mổ " />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="TrongGio" label="Mổ trong giờ" />
            </Grid>
            <Grid item xs={6} md={4}>
              <FTextField name="NgoaiGio" label="Mổ ngoài giờ" />
            </Grid>
           
          </Grid>
        </FormProvider>
      </Stack>

      <Stack direction="row">
        <Card
          variant="outlined"
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* <CardHeader title="Tử vong" variant="h6" /> */}
          <Typography variant="h6" m={1}>
            Số người bệnh tử vong: {bnTuVongs.length}
          </Typography>

          {coQuyen && (
            <Button
              onClick={() => handleEdit("tử vong", 1)}
              variant="contained"
            >
              Thêm
            </Button>
          )}
        </Card>

        <Card
          variant="outlined"
          sx={{
            p: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* <CardHeader title="Tử vong" variant="h6" /> */}
          <Typography variant="h6" m={1}>
            Số người bệnh theo dõi: {bnTheoDois.length}
          </Typography>

          {coQuyen && (
            <Button
              onClick={() => handleEdit("theo dõi", 8)}
              variant="contained"
            >
              Thêm
            </Button>
          )}
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
        <ListBenhNhanCard
          benhnhans={bnTuVongs}
          title="Người bệnh tử vong"
        />
      )}

      {bnTheoDois.length > 0 && (
        <ListBenhNhanCard
          benhnhans={bnTheoDois}
          title="Người bệnh theo dõi"
        />
      )}

    </Container>
  );
}

export default BCGayMeHS;
