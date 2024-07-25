import { yupResolver } from "@hookform/resolvers/yup";
import { DataArrayRounded } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  AppBar,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Toolbar,
} from "@mui/material";
import { FTextField, FormProvider } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";
import FDatePicker from "components/form/FDatePicker";

import { getKhoas } from "features/BaoCaoNgay/baocaongaySlice";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import dayjs from "dayjs";
import MainCard from "components/MainCard";
import {
  getOneLopDaoTaoByID,
  insertOneLopDaoTao,
  resetLopDaoTaoCurrent,
  updateOneLopDaoTao,
} from "./daotaoSlice";
import MultiFileUpload from "components/third-party/dropzone/MultiFile";
import DropzonePage from "forms/plugins/dropzone";
import NhanVienList from "./NhanVienList";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import { useParams } from "react-router-dom";

const yupSchema = Yup.object().shape({
  MaHinhThucCapNhat: Yup.object({
    Ma: Yup.string().required("Bắt buộc chọn mã nhóm"),
  }).required("Bắt buộc chọn mã nhóm"),
  Ten: Yup.string().required("Bắt buộc nhập tên lớp"),
  SoLuong: Yup.number().typeError("Bạn phải nhập 1 số"),

  NgayBatDau: Yup.date().nullable().required("Bắt buộc chọn ngày bắt đầu"),
  NgayKetThuc: Yup.date().nullable().required("Bắt buộc chọn ngày kết thúc"),
});

function LopDaoTaoForm() {
  const params = useParams();
  const lopdaotaoID = params.lopdaotaoID;
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const { NoiDaoTao, NguonKinhPhi, HinhThucDaoTao } = useSelector(
    (state) => state.nhanvien
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if(lopdaotaoID)
    
    dispatch(getOneLopDaoTaoByID(lopdaotaoID))
  //  else dispatch(resetLopDaoTaoCurrent())
  },[]);
  useEffect(() => {
    if (HinhThucCapNhat.length === 0) {
      dispatch(getAllHinhThucCapNhat());
    }
    if (NoiDaoTao.length === 0) {
      dispatch(getDataFix());
    }
  }, []);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      MaHinhThucCapNhat: null,
      // TenHinhThucCapNhat: null,
      Ten: "",
      QuyetDinh: "",
      NoiDaoTao: null,
      NguonKinhPhi: null,
      HinhThucDaoTao: null,
      GhiChu: "",
      SoLuong: 1,
      NgayBatDau: null,
      NgayKetThuc: null,
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    console.log("lopdaotaoCurrent", lopdaotaoCurrent);
    // Kiểm tra xem `lopdaotaoCurrent` có tồn tại và form đang ở chế độ cập nhật không
    if (
      lopdaotaoCurrent &&
      lopdaotaoCurrent._id &&
      lopdaotaoCurrent._id !== 0
    ) {
      const hinhthuccapnhatCurent = HinhThucCapNhat.find(item=>item.Ma===lopdaotaoCurrent.MaHinhThucCapNhat)
      
      // Cập nhật giá trị mặc định cho form bằng thông tin của `lopdaotaoCurrent`
      reset({
        ...lopdaotaoCurrent,
        MaHinhThucCapNhat:hinhthuccapnhatCurent,
        // Đảm bảo rằng các trường như Ngày sinh được chuyển đổi đúng định dạng nếu cần
        NgayBatDau: lopdaotaoCurrent.NgayBatDau
          ? dayjs(lopdaotaoCurrent.NgayBatDau)
          : null,
        NgayKetThuc: lopdaotaoCurrent.NgayKetThuc
          ? dayjs(lopdaotaoCurrent.NgayKetThuc)
          : null,
        // Tương tự, bạn có thể điều chỉnh các trường khác để phù hợp với định dạng của form
      });
    } else {
      // Nếu không có `lopdaotaoCurrent` được truyền vào, reset form với giá trị mặc định
      reset({
        MaHinhThucCapNhat: null,
        // TenHinhThucCapNhat: null,
        Ten: "",
        QuyetDinh: "",
        NoiDaoTao: null,
        NguonKinhPhi: null,
        HinhThucDaoTao: null,
        GhiChu: "",
        SoLuong: 1,
        NgayBatDau: null,
        NgayKetThuc: null,
      });
    }
  }, [lopdaotaoCurrent,HinhThucCapNhat]);

  const onSubmitData = (data) => {
    console.log("data form", data);
    const lopdaotaoData = {
      ...lopdaotaoCurrent,
      ...data,
      MaHinhThucCapNhat: data.MaHinhThucCapNhat.Ma,
      NgayBatDau: data.NgayBatDau ? data.NgayBatDau.toISOString() : null,
      NgayKetThuc: data.NgayKetThuc ? data.NgayKetThuc.toISOString() : null,
    };
    if (lopdaotaoData && lopdaotaoData._id) {
      dispatch(updateOneLopDaoTao(lopdaotaoData));
    } else {
      dispatch(insertOneLopDaoTao(lopdaotaoData));
    }
  };
  return (
    <MainCard title="Thông tin lớp đào tạo">
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={5}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={isSubmitting}
                >
                  Lưu
                </LoadingButton>
              </Grid>
              <Grid item xs={12}>
                <FAutocomplete
                  name="MaHinhThucCapNhat"
                  options={HinhThucCapNhat}
                  displayField="Ma"
                  label="Mã hình thức cập nhật"
                />
              </Grid>

              <Grid item xs={12}>
                <FAutocomplete
                  name="MaHinhThucCapNhat"
                  options={HinhThucCapNhat}
                  displayField="Ten"
                  label="Hình thức cập nhật"
                />
              </Grid>
              <Grid item xs={12}>
                <FTextField name="Ten" label="Tên lớp" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <FTextField name="QuyetDinh" label="Quyết định" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <FAutocomplete
                  name="NoiDaoTao"
                  options={NoiDaoTao.map((item) => item.NoiDaoTao)}
                  label="Nơi đào tạo"
                />
              </Grid>
              <Grid item xs={12}>
                <FAutocomplete
                  name="NguonKinhPhi"
                  options={NguonKinhPhi.map((item) => item.NguonKinhPhi)}
                  label="Nguồn kinh phí"
                />
              </Grid>
              <Grid item xs={12}>
                <FAutocomplete
                  name="HinhThucDaoTao"
                  options={HinhThucDaoTao.map((item) => item.HinhThucDaoTao)}
                  label="Hình thức đào tạo"
                />
              </Grid>
              <Grid item xs={12}>
                <FTextField name="GhiChu" label="Ghi chú" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <FTextField name="SoLuong" label="Số lượng" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <FDatePicker name="NgayBatDau" label="Ngày bắt đầu" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <FDatePicker
                  name="NgayKetThuc"
                  label="Ngày kết thúc"
                  fullWidth
                />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={7}></Grid>
        </Grid>
      </FormProvider>
      <DropzonePage />
      {/* <NhanVienList /> */}
    </MainCard>
  );
}

export default LopDaoTaoForm;
