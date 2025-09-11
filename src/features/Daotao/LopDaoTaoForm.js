import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import { Box, Card, Grid, Stack, Typography } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
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

import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import { useParams } from "react-router-dom";
import HocVienLopTable from "./ChonHocVien/HocVienLopTable";
import DiemDanhLopDaoTaoButton from "./DiemDanhLopDaoTaoButton";
import useAuth from "hooks/useAuth";
import { getKhoas } from "features/BaoCaoNgay/baocaongaySlice";

const yupSchema = Yup.object().shape({
  MaHinhThucCapNhat: Yup.object({
    Ma: Yup.string().required("Bắt buộc chọn mã nhóm"),
  }).required("Bắt buộc chọn mã nhóm"),
  Ten: Yup.string().required("Bắt buộc nhập tên lớp"),
  SoLuong: Yup.number().typeError("Bạn phải nhập 1 số"),

  NgayBatDau: Yup.date().nullable().required("Bắt buộc chọn ngày bắt đầu"),
  NgayKetThuc: Yup.date().nullable().required("Bắt buộc chọn ngày kết thúc"),
});

function LopDaoTaoForm({ mahinhthuccapnhat }) {
  const params = useParams();
  const { khoas } = useSelector((state) => state.baocaongay);
  const { lopdaotaoID, type } = params;
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const { NoiDaoTao, NguonKinhPhi, HinhThucDaoTao } = useSelector(
    (state) => state.nhanvien
  );
  const { user } = useAuth();
  const dispatch = useDispatch();
  useEffect(() => {
    if (lopdaotaoID) dispatch(getOneLopDaoTaoByID({ lopdaotaoID, tam: false }));
    else dispatch(resetLopDaoTaoCurrent());
  }, []);

  useEffect(() => {
    if (khoas && khoas.length > 0) return;
    dispatch(getKhoas());
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
      KhoaID: null,
      TenTapChi: "",
      SoTapChi: "",
      XepLoai: "",
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
    watch, // Dùng watch để theo dõi thay đổi
    formState: { isSubmitting },
  } = methods;

  // Sử dụng watch để theo dõi giá trị của MaHinhThucCapNhat
  const maHinhThucCapNhatValue = watch("MaHinhThucCapNhat");

  // --- mới: điều kiện hiển thị cho trường "Quyết định"
  const _quyetDinhCodes = [
    "NCKH011",
    "NCKH012",
    "NCKH013",
    "NCKH014",
    "NCKH015",
    "NCKH016",
    "NCKH017",
    "NCKH018",
  ];
  // extraCondition placeholder nếu muốn thêm điều kiện khác
  const extraCondition = false;
  const showQuyetDinh =
    !!maHinhThucCapNhatValue &&
    (maHinhThucCapNhatValue.Ma.startsWith("ĐT") ||
      _quyetDinhCodes.includes(maHinhThucCapNhatValue.Ma) ||
      extraCondition);
  // --- kết thúc

  useEffect(() => {
    // Logic khi MaHinhThucCapNhat thay đổi
    if (maHinhThucCapNhatValue) {
      console.log("MaHinhThucCapNhat đã thay đổi:", maHinhThucCapNhatValue);

      // Thêm logic xử lý ở đây khi MaHinhThucCapNhat thay đổi, ví dụ:
      // setValue("Ten", maHinhThucCapNhatValue.Ten); // Cập nhật giá trị trường "Ten" dựa trên MaHinhThucCapNhat
    }
  }, [maHinhThucCapNhatValue]);

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
      console.log("hinhthuccapnhatCurent", hinhthuccapnhatCurent);
      // Cập nhật giá trị mặc định cho form bằng thông tin của `lopdaotaoCurrent`
      reset({
        ...lopdaotaoCurrent,
        MaHinhThucCapNhat: hinhthuccapnhatCurent,
        KhoaID: khoas.find((item) => item._id === lopdaotaoCurrent.KhoaID),
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
        MaHinhThucCapNhat: HinhThucCapNhat.find((item) => item.Ma === type),
        // TenHinhThucCapNhat: null,
        Ten: "",
        QuyetDinh: "",
        NoiDaoTao: null,
        NguonKinhPhi: null,
        HinhThucDaoTao: null,
        KhoaID: null,
        TenTapChi: "",
        SoTapChi: "",
        XepLoai: "",
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
      KhoaID: data.KhoaID?._id || null,
      UserIDCreated: user?._id,
      MaHinhThucCapNhat: data.MaHinhThucCapNhat.Ma,
      NgayBatDau: data.NgayBatDau ? data.NgayBatDau.toISOString() : null,
      NgayKetThuc: data.NgayKetThuc ? data.NgayKetThuc.toISOString() : null,
    };
    const vaitroquydoi =
      HinhThucCapNhat.find(
        (item) => item.Ma === lopdaotaoData.MaHinhThucCapNhat
      ).VaiTroQuyDoi || [];
    console.log("vaitroquydoi", vaitroquydoi);
    console.log("lopdaotaoData", lopdaotaoData);
    if (lopdaotaoData && lopdaotaoData._id) {
      dispatch(updateOneLopDaoTao({ lopdaotaoData, vaitroquydoi }));
    } else {
      dispatch(insertOneLopDaoTao({ lopdaotaoData, vaitroquydoi }));
    }
  };
  return (
    <MainCard
      title={`Thông tin ${
        maHinhThucCapNhatValue ? maHinhThucCapNhatValue.TenBenhVien : ""
      }`}
    >
      {/* <MainCard title={`Thông tin `}> */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ p: 1 }}>
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(onSubmitData)}
            >
              <Stack direction="row" mb={2.2}>
                <Typography fontSize={18} fontWeight={"bold"}>
                  {" "}
                  Thông tin chung
                </Typography>
                <Box sx={{ flexGrow: 1 }}></Box>
                {(user?._id === lopdaotaoCurrent.UserIDCreated ||
                  !lopdaotaoCurrent._id) && (
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    startIcon={<SaveIcon />}
                    size="small"
                    loading={isSubmitting}
                  >
                    Lưu thông tin chung
                  </LoadingButton>
                )}
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

                  <FTextField
                    name="Ten"
                    multiline
                    label={`Tên ${
                      maHinhThucCapNhatValue
                        ? maHinhThucCapNhatValue.TenBenhVien
                        : ""
                    }`}
                    fullWidth
                  />

                  {/* Hiện trường "Quyết định" riêng với điều kiện bổ sung */}
                  {showQuyetDinh && (
                    <FTextField name="QuyetDinh" label="Quyết định" fullWidth />
                  )}

                  {maHinhThucCapNhatValue &&
                  maHinhThucCapNhatValue.Ma.startsWith("ĐT") ? (
                    <div>
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
                    </div>
                  ) : (
                    <div>
                      {maHinhThucCapNhatValue &&
                        ["NCKH02", "NCKH03"].includes(
                          maHinhThucCapNhatValue.Ma
                        ) && (
                          <div>
                            <FTextField
                              name="TenTapChi"
                              label="Tên tạp chí"
                              fullWidth
                            />
                            <FTextField
                              name="SoTapChi"
                              label="Số tạp chí"
                              fullWidth
                            />
                          </div>
                        )}

                      <FAutocomplete
                        name="KhoaID"
                        options={khoas}
                        displayField="TenKhoa"
                        label="Khoa"
                      />

                      {maHinhThucCapNhatValue &&
                        !["NCKH02", "NCKH03"].includes(
                          maHinhThucCapNhatValue.Ma
                        ) && (
                          <FAutocomplete
                            name="XepLoai"
                            options={["Đạt", "Xuất sắc"]}
                            label="Xếp loại"
                          />
                        )}
                    </div>
                  )}

                  {maHinhThucCapNhatValue &&
                    !["NCKH02", "NCKH03"].includes(
                      maHinhThucCapNhatValue.Ma
                    ) && (
                      <FAutocomplete
                        name="HinhThucDaoTao"
                        options={HinhThucDaoTao.map(
                          (item) => item.HinhThucDaoTao
                        )}
                        label="Hình thức tổ chức"
                      />
                    )}

                  <FTextField name="GhiChu" label="Ghi chú" fullWidth />

                  <FTextField name="SoLuong" label="Số section" fullWidth />

                  <FDatePicker
                    name="NgayBatDau"
                    label="Ngày bắt đầu"
                    fullWidth
                  />

                  <FDatePicker
                    name="NgayKetThuc"
                    label="Ngày kết thúc"
                    fullWidth
                  />
                </Stack>
              </Card>
            </FormProvider>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <HocVienLopTable />
        </Grid>
      </Grid>
      <Stack direction="row" mb={2} mt={1}>
        <Box sx={{ flexGrow: 1 }}></Box>
        {lopdaotaoCurrent._id && (
          <DiemDanhLopDaoTaoButton
            lopdaotaoID={lopdaotaoCurrent._id}
            isButton={true}
          />
        )}
      </Stack>
    </MainCard>
  );
}

export default LopDaoTaoForm;
