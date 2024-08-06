import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import {

  Box,

  Card,

  Grid,
  Stack,

  Typography,
} from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { FTextField, FormProvider } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";
import FDatePicker from "components/form/FDatePicker";

import React, { useEffect } from "react";
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

import DropzonePage from "forms/plugins/dropzone";

import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import { useParams } from "react-router-dom";
import HocVienLopTable from "./ChonHocVien/HocVienLopTable";

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
    if (lopdaotaoID) dispatch(getOneLopDaoTaoByID(lopdaotaoID));
     else dispatch(resetLopDaoTaoCurrent())
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
    console.log("lopdaotaoCurrent", lopdaotaoCurrent);
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
    <MainCard title="Thông tin lớp đào tạo">
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 1 }}>
         
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(onSubmitData)}
            >
                <Stack direction="row" mb={2.2}>
                <Typography fontSize={18} fontWeight={'bold'}> Thông tin lớp đào tạo</Typography>
                <Box  sx={{ flexGrow: 1 }}></Box>
                <LoadingButton
                type="submit"
                variant="contained"
                startIcon={<SaveIcon />}
                size="small"
                loading={isSubmitting}
              >
                Lưu thông tin lớp
              </LoadingButton>
                </Stack>
              <Card variant="outlined" sx={{ p: 1 }}>
               <Stack spacing={2}>
            

              <FAutocomplete
                name="MaHinhThucCapNhat"
                options={HinhThucCapNhat}
                displayField="Ma"
                label="Mã hình thức cập nhật"
              />

              <FAutocomplete
                name="MaHinhThucCapNhat"
                options={HinhThucCapNhat}
                displayField="Ten"
                label="Hình thức cập nhật"
              />

              <FTextField name="Ten" multiline label="Tên lớp" fullWidth />

              <FTextField name="QuyetDinh" label="Quyết định" fullWidth />

              <FAutocomplete
                name="NoiDaoTao"
                options={NoiDaoTao.map((item) => item.NoiDaoTao)}
                label="Nơi đào tạo"
              />

              <FAutocomplete
                name="NguonKinhPhi"
                options={NguonKinhPhi.map((item) => item.NguonKinhPhi)}
                label="Nguồn kinh phí"
              />

              <FAutocomplete
                name="HinhThucDaoTao"
                options={HinhThucDaoTao.map((item) => item.HinhThucDaoTao)}
                label="Hình thức đào tạo"
              />

              <FTextField name="GhiChu" label="Ghi chú" fullWidth />

              <FTextField name="SoLuong" label="Số lượng" fullWidth />

              <FDatePicker name="NgayBatDau" label="Ngày bắt đầu" fullWidth />

              <FDatePicker name="NgayKetThuc" label="Ngày kết thúc" fullWidth />
            
              </Stack>
              </Card>
            </FormProvider>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <HocVienLopTable />
        </Grid>
      </Grid>

      <DropzonePage />
      {/* <NhanVienList /> */}
    </MainCard>
  );
}

export default LopDaoTaoForm;
