import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  Stack,
  Divider,
  Typography,
} from "@mui/material";
import { FTextField, FormProvider, FSelect } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";
import FDatePicker from "components/form/FDatePicker";
import FKRadioGroup from "components/form/FKRadioGroup";
import { getKhoas } from "features/BaoCaoNgay/baocaongaySlice";
import {
  getDataFix,
  insertOneNhanVien,
  updateOneNhanVien,
} from "features/NhanVien/nhanvienSlice";
import React, { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { getAllLoaiChuyenMon } from "features/Daotao/LoaiChuyenMon/loaiChuyenMonSlice";
import * as Yup from "yup";
import dayjs from "dayjs";
import MainCard from "components/MainCard";

const yupSchema = Yup.object().shape({
  Ten: Yup.string().required("Bắt buộc nhập UserName"),
  TinChiBanDau: Yup.number().typeError("Bạn phải nhập 1 số"),
  NgaySinh: Yup.date().nullable().required("Bắt buộc chọn ngày sinh"),

  KhoaID: Yup.object({
    TenKhoa: Yup.string().required("Bắt buộc chọn khoa"),
  }).required("Bắt buộc chọn khoa"),
});

function ThongTinNhanVien({ nhanvien, open, handleClose }) {
  const { khoas } = useSelector((state) => state.baocaongay);
  const { list: loaiChuyenMonList } = useSelector(
    (state) => state.loaichuyenmon
  );
  const { TrinhDoChuyenMon, DanToc, PhamViHanhNghe, ChucDanh, ChucVu } =
    useSelector((state) => state.nhanvien);
  const dispatch = useDispatch();
  useEffect(() => {
    if (PhamViHanhNghe.length === 0) {
      dispatch(getDataFix());
    }
  }, [PhamViHanhNghe.length, dispatch]);

  useEffect(() => {
    if (khoas && khoas.length > 0) return;
    dispatch(getKhoas());
  }, [khoas, dispatch]);
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      TinChiBanDau: 0,
      MaNhanVien: "",
      Ten: "",
      Loai: 0,
      NgaySinh: null,
      // Replaced standalone TrinhDoChuyenMon by 2-step selection: LoaiChuyenMon + LoaiChuyenMonID (TrinhDo)
      LoaiChuyenMon: null, // object { value, label }
      LoaiChuyenMonID: null, // object from collection { _id, LoaiChuyenMon, TrinhDo }
      TrinhDoChuyenMon: null, // GIỮ LẠI FIELD CŨ (string hoặc option autocomplete)
      ChucDanh: null,
      ChucVu: null,
      DanToc: null,
      PhamViHanhNghe: null,
      PhamViHanhNgheBoSung: null, // NEW bổ sung
      SoDienThoai: "",
      Email: "",
      CMND: "",
      GioiTinh: 0,
      SoCCHN: "",
      NgayCapCCHN: null,
      KhoaID: null,
      DaNghi: false,
      LyDoNghi: "",
      isDangVien: false,
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = methods;

  const LOAI_CHUYEN_MON_ENUM = [
    { value: "BAC_SI", label: "Bác sĩ" },
    { value: "DUOC_SI", label: "Dược sĩ" },
    { value: "DIEU_DUONG", label: "Điều dưỡng" },
    { value: "KTV", label: "Kỹ thuật viên" },
    { value: "KHAC", label: "Khác" },
  ];

  const selectedLoaiChuyenMon = watch("LoaiChuyenMon");
  const daNghi = watch("DaNghi");
  useEffect(() => {
    // When switching to Đang làm, clear Lý do nghỉ and ensure hidden
    if (daNghi === false) {
      setValue("LyDoNghi", "");
    }
  }, [daNghi, setValue]);

  // Filter TrinhDo list based on selected LoaiChuyenMon
  const trinhDoFiltered = useMemo(() => {
    if (!selectedLoaiChuyenMon) return [];
    return loaiChuyenMonList
      .filter((i) => i.LoaiChuyenMon === selectedLoaiChuyenMon.value)
      .filter((i) => !!i.TrinhDo)
      .map((i) => i);
  }, [selectedLoaiChuyenMon, loaiChuyenMonList]);

  const LY_DO_NGHI_OPTIONS = [
    { value: "Nghỉ hưu", label: "Nghỉ hưu" },
    { value: "Chuyển công tác", label: "Chuyển công tác" },
    { value: "Khác", label: "Khác" },
  ];

  useEffect(() => {
    // load LoaiChuyenMon list if needed
    if (!loaiChuyenMonList || loaiChuyenMonList.length === 0) {
      dispatch(getAllLoaiChuyenMon());
    }
  }, [loaiChuyenMonList, dispatch]);

  useEffect(() => {
    console.log("nhanvien", nhanvien);
    if (nhanvien && nhanvien._id && nhanvien._id !== 0) {
      // Attempt to resolve LoaiChuyenMon & LoaiChuyenMonID objects
      let loaiChuyenMonValue = null;
      let loaiChuyenMonIDObj = null;
      if (loaiChuyenMonList && loaiChuyenMonList.length > 0) {
        // nhanvien.LoaiChuyenMonID may be id string or populated object
        const idVal = nhanvien.LoaiChuyenMonID?._id || nhanvien.LoaiChuyenMonID;
        loaiChuyenMonIDObj =
          loaiChuyenMonList.find((x) => x._id === idVal) || null;
        if (loaiChuyenMonIDObj) {
          loaiChuyenMonValue =
            LOAI_CHUYEN_MON_ENUM.find(
              (opt) => opt.value === loaiChuyenMonIDObj.LoaiChuyenMon
            ) || null;
        }
      }
      reset({
        ...nhanvien,
        NgaySinh: nhanvien.NgaySinh ? dayjs(nhanvien.NgaySinh) : null,
        NgayCapCCHN: nhanvien.NgayCapCCHN ? dayjs(nhanvien.NgayCapCCHN) : null,
        LoaiChuyenMon: loaiChuyenMonValue,
        LoaiChuyenMonID: loaiChuyenMonIDObj,
        TrinhDoChuyenMon: nhanvien.TrinhDoChuyenMon || null,
        DaNghi: nhanvien.DaNghi || false,
        LyDoNghi: nhanvien.DaNghi ? nhanvien.LyDoNghi : "",
        PhamViHanhNgheBoSung: nhanvien.PhamViHanhNgheBoSung || null,
        isDangVien: Boolean(nhanvien.isDangVien),
      });
    } else {
      reset({
        TinChiBanDau: 0,
        MaNhanVien: "",
        Ten: "",
        Loai: 0,
        NgaySinh: null,
        LoaiChuyenMon: null,
        LoaiChuyenMonID: null,
        TrinhDoChuyenMon: null,
        ChucDanh: null,
        ChucVu: null,
        DanToc: null,
        PhamViHanhNghe: null,
        PhamViHanhNgheBoSung: null,
        SoDienThoai: "",
        Email: "",
        CMND: "",
        GioiTinh: 0,
        SoCCHN: "",
        NgayCapCCHN: null,
        KhoaID: null,
        DaNghi: false,
        LyDoNghi: "",
        isDangVien: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nhanvien, loaiChuyenMonList, reset]);

  const onSubmitData = (data, e) => {
    e.preventDefault();
    console.log("data form", data);
    const nhanvienUpdate = {
      ...data,
      // Map backend expected fields
      KhoaID: data.KhoaID?._id,
      NgaySinh: data.NgaySinh ? data.NgaySinh.toISOString() : null,
      NgayCapCCHN: data.NgayCapCCHN ? data.NgayCapCCHN.toISOString() : null,
      LoaiChuyenMonID: data.LoaiChuyenMonID?._id,
      // Giữ lại TrinhDoChuyenMon user chọn, nếu không chọn fallback từ LoaiChuyenMonID
      TrinhDoChuyenMon:
        data.TrinhDoChuyenMon || data.LoaiChuyenMonID?.TrinhDo || "",
      DaNghi: data.DaNghi || false,
      LyDoNghi: data.DaNghi ? data.LyDoNghi : "",
      isDangVien: Boolean(data.isDangVien),
    };
    // Remove helper fields not needed (optional)
    delete nhanvienUpdate.LoaiChuyenMon;
    console.log("nhanvien dispatch", nhanvienUpdate);
    if (nhanvien && nhanvien._id) dispatch(updateOneNhanVien(nhanvienUpdate));
    else dispatch(insertOneNhanVien(nhanvienUpdate));
  };
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      // sx={{
      //   "& .MuiDialog-paper": {
      //     width: "1000px", // Or any other width you want
      //     height: "800px", // Or any other height you want
      //   },
      // }}
      PaperProps={{
        sx: {
          width: "100%", // Sử dụng toàn bộ chiều rộng trên màn hình nhỏ
          maxWidth: "1000px", // Đảm bảo chiều rộng không vượt quá 1000px trên màn hình lớn
          maxHeight: "90vh", // Chiều cao tối đa là 90% chiều cao viewport, giúp không bị tràn màn hình
          overflowY: "auto", // Cho phép cuộn nếu nội dung vượt quá chiều cao
        },
      }}
    >
      {/* <DialogTitle id="form-dialog-title">Thông tin lớp đào tạo</DialogTitle> */}
      <DialogContent>
        <MainCard title={"Thông tin nhân viên"}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={1}>
              <FAutocomplete
                name="KhoaID"
                options={khoas}
                displayField="TenKhoa"
                label="Chọn khoa"
              />

              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={8}>
                  <FTextField name="MaNhanVien" label="Mã học viên" />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <FKRadioGroup
                    row={true}
                    name="Loai"
                    label="Phân loại"
                    options={[
                      { value: 0, label: "Nhân viên" },
                      { value: 1, label: "Sinh viên" },
                      { value: 2, label: "Học viên" },
                    ]}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={4}>
                  <FTextField name="Ten" label="Họ tên" />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <FDatePicker name="NgaySinh" label="Ngày sinh" />
                </Grid>
                <Grid item xs={12} sm={12} md={4}>
                  <FKRadioGroup
                    row={true}
                    name="GioiTinh"
                    label="Giới tính"
                    options={[
                      { value: 0, label: "Nam" },
                      { value: 1, label: "Nữ" },
                    ]}
                  />
                </Grid>
              </Grid>

              {/* Dòng riêng: Loại chuyên môn & Trình độ theo loại */}
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <FAutocomplete
                    name="LoaiChuyenMon"
                    options={LOAI_CHUYEN_MON_ENUM}
                    displayField="label"
                    label="Loại chuyên môn"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FAutocomplete
                    name="LoaiChuyenMonID"
                    options={trinhDoFiltered}
                    displayField="TrinhDo"
                    label="Trình độ (theo loại)"
                    disabled={!selectedLoaiChuyenMon}
                  />
                </Grid>
              </Grid>

              {/* Dòng tiếp theo: Trình độ chuyên môn cũ + Tín chỉ + CMND */}
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={6} lg={6}>
                  <FAutocomplete
                    name="TrinhDoChuyenMon"
                    options={TrinhDoChuyenMon.map(
                      (item) => item.TrinhDoChuyenMon
                    )}
                    label="Trình độ chuyên môn (cũ)"
                  />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3}>
                  <FTextField name="TinChiBanDau" label="Tín chỉ" />
                </Grid>
                <Grid item xs={6} sm={3} md={3} lg={3}>
                  <FTextField name="CMND" label="CMND/CCCD" />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <FAutocomplete
                    name="ChucDanh"
                    options={ChucDanh.map((item) => item.ChucDanh)}
                    label="Chức danh"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FAutocomplete
                    name="ChucVu"
                    options={ChucVu.map((item) => item.ChucVu)}
                    label="Chức vụ"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FAutocomplete
                    name="DanToc"
                    options={DanToc.map((item) => item.DanToc)}
                    label="Dân tộc"
                  />
                </Grid>
              </Grid>

              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mt: 1 }}>
                Hành nghề
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="PhamViHanhNghe"
                    options={PhamViHanhNghe.map((item) => item.PhamViHanhNghe)}
                    label="Phạm vi hành nghề"
                    textWrap
                  />
                </Grid>
              </Grid>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="PhamViHanhNgheBoSung"
                    options={PhamViHanhNghe.map((item) => item.PhamViHanhNghe)}
                    label="Phạm vi hành nghề bổ sung"
                    textWrap
                  />
                </Grid>
              </Grid>

              {/* Dòng: Số CCHN & Ngày cấp */}
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={6}>
                  <FTextField name="SoCCHN" label="Số chứng chỉ hành nghề" />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <FDatePicker name="NgayCapCCHN" label="Ngày cấp CCHN" />
                </Grid>
              </Grid>

              {/* Dòng nhóm Trạng thái + Lý do nghỉ (nếu có) */}
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <FKRadioGroup
                    row={true}
                    name="DaNghi"
                    label="Trạng thái"
                    options={[
                      { value: false, label: "Đang làm" },
                      { value: true, label: "Đã nghỉ" },
                    ]}
                  />
                </Grid>
                {daNghi && (
                  <Grid item xs={12} sm={6} md={4}>
                    <FSelect
                      name="LyDoNghi"
                      label="Lý do nghỉ"
                      options={LY_DO_NGHI_OPTIONS}
                    />
                  </Grid>
                )}
              </Grid>

              {/* Dòng riêng: Đảng viên */}
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={4}>
                  <FKRadioGroup
                    row={true}
                    name="isDangVien"
                    label="Đảng viên"
                    options={[
                      { value: true, label: "Có" },
                      { value: false, label: "Không" },
                    ]}
                  />
                </Grid>
              </Grid>

              {/* Dòng: Liên hệ */}
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6} md={6}>
                  <FTextField name="SoDienThoai" label="Số điện thoại" />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <FTextField name="Email" label="Email" />
                </Grid>
              </Grid>
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            <Card>
              <DialogActions>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={isSubmitting}
                >
                  Lưu
                </LoadingButton>
                <Button variant="contained" onClick={handleClose} color="error">
                  Hủy
                </Button>
              </DialogActions>
            </Card>
          </FormProvider>
        </MainCard>
      </DialogContent>
    </Dialog>
  );
}

export default ThongTinNhanVien;
