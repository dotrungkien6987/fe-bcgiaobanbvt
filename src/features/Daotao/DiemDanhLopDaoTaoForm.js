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
  Typography,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { FTextField, FormProvider } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";
import FDatePicker from "components/form/FDatePicker";

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
import HocVienLopTable from "./ChonHocVien/HocVienLopTable";
import DiemDanhLopDaoTaoTable from "./DiemDanhLopDaoTaoTable";
import LopDaoTaoView1 from "features/NhanVien/LopDaoTaoView1";

const yupSchema = Yup.object().shape({
  MaHinhThucCapNhat: Yup.object({
    Ma: Yup.string().required("Bắt buộc chọn mã nhóm"),
  }).required("Bắt buộc chọn mã nhóm"),
  Ten: Yup.string().required("Bắt buộc nhập tên lớp"),
  SoLuong: Yup.number().typeError("Bạn phải nhập 1 số"),

  NgayBatDau: Yup.date().nullable().required("Bắt buộc chọn ngày bắt đầu"),
  NgayKetThuc: Yup.date().nullable().required("Bắt buộc chọn ngày kết thúc"),
});

function DiemDanhLopDaoTaoForm() {
  const params = useParams();
  const lopdaotaoID = params.lopdaotaoID;
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const { NoiDaoTao, NguonKinhPhi, HinhThucDaoTao } = useSelector(
    (state) => state.nhanvien
  );
  const dispatch = useDispatch();
  useEffect(() => {
    if (lopdaotaoID) dispatch(getOneLopDaoTaoByID(lopdaotaoID));
    //  else dispatch(resetLopDaoTaoCurrent())
  }, []);
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
    // Kiểm tra xem `lopdaotaoCurrent` có tồn tại và form đang ở chế độ cập nhật không
    if (
      lopdaotaoCurrent &&
      lopdaotaoCurrent._id &&
      lopdaotaoCurrent._id !== 0
    ) {
      const hinhthuccapnhatCurent = HinhThucCapNhat.find(
        (item) => item.Ma === lopdaotaoCurrent.MaHinhThucCapNhat
      );

      // Cập nhật giá trị mặc định cho form bằng thông tin của `lopdaotaoCurrent`
      reset({
        ...lopdaotaoCurrent,
        MaHinhThucCapNhat: hinhthuccapnhatCurent,
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
  }, [lopdaotaoCurrent, HinhThucCapNhat]);

  const onSubmitData = (data) => {
    console.log("data form", data);
    const lopdaotaoData = {
      ...lopdaotaoCurrent,
      ...data,
      MaHinhThucCapNhat: data.MaHinhThucCapNhat.Ma,
      NgayBatDau: data.NgayBatDau ? data.NgayBatDau.toISOString() : null,
      NgayKetThuc: data.NgayKetThuc ? data.NgayKetThuc.toISOString() : null,
    };
    const vaitroquydoi =
      HinhThucCapNhat.find(
        (item) => item.Ma === lopdaotaoData.MaHinhThucCapNhat
      ).VaiTroQuyDoi || [];
    console.log("vaitroquydoi", vaitroquydoi);
    if (lopdaotaoData && lopdaotaoData._id) {
      dispatch(updateOneLopDaoTao({ lopdaotaoData, vaitroquydoi }));
    } else {
      dispatch(insertOneLopDaoTao({ lopdaotaoData, vaitroquydoi }));
    }
  };
  return (
    <MainCard title="Quá trình điểm danh">
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <LopDaoTaoView1
            data={lopdaotaoCurrent}
            
          />
        </Grid>
        <Grid item xs={12} md={12}>
          <DiemDanhLopDaoTaoTable numSections={lopdaotaoCurrent.SoLuong} />
        </Grid>
      </Grid>

      <DropzonePage />
      {/* <NhanVienList /> */}
    </MainCard>
  );
}

export default DiemDanhLopDaoTaoForm;
