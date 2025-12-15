import { useEffect, useMemo, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import * as Yup from "yup";
import dayjs from "dayjs";

import { FormProvider, FSelect, FTextField } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";
import FDatePicker from "components/form/FDatePicker";
import FKRadioGroup from "components/form/FKRadioGroup";
import EmployeeAvatar, {
  invalidateEmployeeAvatar,
} from "components/EmployeeAvatar";
import LoadingScreen from "components/LoadingScreen";
import MainCard from "components/MainCard";

import apiService from "app/apiService";
import { getAllLoaiChuyenMon } from "features/Daotao/LoaiChuyenMon/loaiChuyenMonSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import useAuth from "hooks/useAuth";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const yupSchema = Yup.object().shape({
  Ten: Yup.string().required("Bắt buộc nhập họ tên"),
  NgaySinh: Yup.date().nullable().required("Bắt buộc chọn ngày sinh"),
});

const LOAI_CHUYEN_MON_ENUM = [
  { value: "BAC_SI", label: "Bác sĩ" },
  { value: "DUOC_SI", label: "Dược sĩ" },
  { value: "DIEU_DUONG", label: "Điều dưỡng" },
  { value: "KTV", label: "Kỹ thuật viên" },
  { value: "KHAC", label: "Khác" },
];

const LY_DO_NGHI_OPTIONS = [
  { value: "Nghỉ hưu", label: "Nghỉ hưu" },
  { value: "Chuyển công tác", label: "Chuyển công tác" },
  { value: "Khác", label: "Khác" },
];

export default function NhanVienMePage() {
  const { user } = useAuth();
  const nhanVienId = user?.NhanVienID;

  const dispatch = useDispatch();
  const { TrinhDoChuyenMon, DanToc, PhamViHanhNghe, ChucDanh, ChucVu } =
    useSelector((state) => state.nhanvien);
  const { list: loaiChuyenMonList } = useSelector(
    (state) => state.loaichuyenmon
  );

  const [loadingMe, setLoadingMe] = useState(true);
  const [nhanVienMe, setNhanVienMe] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarCacheKey, setAvatarCacheKey] = useState(0);

  useEffect(() => {
    if (!PhamViHanhNghe || PhamViHanhNghe.length === 0) {
      dispatch(getDataFix());
    }
  }, [PhamViHanhNghe, dispatch]);

  useEffect(() => {
    if (!loaiChuyenMonList || loaiChuyenMonList.length === 0) {
      dispatch(getAllLoaiChuyenMon());
    }
  }, [loaiChuyenMonList, dispatch]);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      TinChiBanDau: 0,
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
      SoHoChieu: "",
      GioiTinh: 0,
      SoCCHN: "",
      NgayCapCCHN: null,
      DaNghi: false,
      LyDoNghi: "",
      isDangVien: false,
    },
  });

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const selectedLoaiChuyenMon = watch("LoaiChuyenMon");
  const daNghi = watch("DaNghi");

  useEffect(() => {
    if (daNghi === false) setValue("LyDoNghi", "");
  }, [daNghi, setValue]);

  const trinhDoFiltered = useMemo(() => {
    if (!selectedLoaiChuyenMon) return [];
    return (loaiChuyenMonList || [])
      .filter((i) => i.LoaiChuyenMon === selectedLoaiChuyenMon.value)
      .filter((i) => !!i.TrinhDo);
  }, [selectedLoaiChuyenMon, loaiChuyenMonList]);

  useEffect(() => {
    (async () => {
      if (!nhanVienId) {
        setNhanVienMe(null);
        setLoadingMe(false);
        return;
      }

      setLoadingMe(true);
      try {
        const res = await apiService.get("/nhanvien/me");
        const nv = res.data.data;
        setNhanVienMe(nv);

        let loaiChuyenMonValue = null;
        let loaiChuyenMonIDObj = null;
        const idVal = nv?.LoaiChuyenMonID?._id || nv?.LoaiChuyenMonID;
        if (loaiChuyenMonList && loaiChuyenMonList.length > 0 && idVal) {
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
          ...nv,
          NgaySinh: nv?.NgaySinh ? dayjs(nv.NgaySinh) : null,
          NgayCapCCHN: nv?.NgayCapCCHN ? dayjs(nv.NgayCapCCHN) : null,
          LoaiChuyenMon: loaiChuyenMonValue,
          LoaiChuyenMonID: loaiChuyenMonIDObj,
          TrinhDoChuyenMon: nv?.TrinhDoChuyenMon || null,
          DaNghi: Boolean(nv?.DaNghi),
          LyDoNghi: nv?.DaNghi ? nv?.LyDoNghi : "",
          PhamViHanhNgheBoSung: nv?.PhamViHanhNgheBoSung || null,
          isDangVien: Boolean(nv?.isDangVien),
          SoHoChieu: nv?.SoHoChieu || "",
        });
      } catch (err) {
        toast.error(err.message || "Không lấy được thông tin nhân viên");
        setNhanVienMe(null);
      } finally {
        setLoadingMe(false);
      }
    })();
  }, [nhanVienId, loaiChuyenMonList, reset]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        NgaySinh: data.NgaySinh ? data.NgaySinh.toISOString() : null,
        NgayCapCCHN: data.NgayCapCCHN ? data.NgayCapCCHN.toISOString() : null,
        LoaiChuyenMonID: data.LoaiChuyenMonID?._id,
        TrinhDoChuyenMon:
          data.TrinhDoChuyenMon || data.LoaiChuyenMonID?.TrinhDo || "",
        DaNghi: Boolean(data.DaNghi),
        LyDoNghi: data.DaNghi ? data.LyDoNghi : "",
        isDangVien: Boolean(data.isDangVien),
      };
      delete payload.LoaiChuyenMon;

      const res = await apiService.patch("/nhanvien/me", payload);
      setNhanVienMe(res.data.data);
      toast.success("Cập nhật thông tin thành công");
    } catch (err) {
      toast.error(err.message || "Cập nhật thất bại");
    }
  };

  const handlePickAvatar = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    try {
      setAvatarUploading(true);
      const formData = new FormData();
      formData.append("avatar", file);
      await apiService.post("/nhanvien/me/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      invalidateEmployeeAvatar(nhanVienId);
      setAvatarCacheKey(Date.now());
      toast.success("Cập nhật avatar thành công");
    } catch (err) {
      toast.error(err.message || "Upload avatar thất bại");
    } finally {
      setAvatarUploading(false);
    }
  };

  if (loadingMe) return <LoadingScreen />;

  if (!nhanVienId) {
    return (
      <Container maxWidth="sm" sx={{ py: 2 }}>
        <MainCard title="Hồ sơ nhân viên">
          <Typography>
            Không tìm thấy nhân viên gán cho tài khoản hiện tại.
          </Typography>
        </MainCard>
      </Container>
    );
  }

  const displayName =
    nhanVienMe?.HoTen || nhanVienMe?.Ten || user?.HoTen || user?.UserName;
  const khoaName = nhanVienMe?.KhoaID?.TenKhoa || "";

  return (
    <Container maxWidth="sm" sx={{ py: 2 }}>
      <MainCard title="Hồ sơ nhân viên">
        <Stack spacing={2}>
          <Stack spacing={1} alignItems="center">
            <EmployeeAvatar
              nhanVienId={nhanVienId}
              name={displayName}
              size="xl"
              cacheKey={avatarCacheKey}
            />
            <Typography variant="h6" align="center">
              {displayName}
            </Typography>
            {!!khoaName && (
              <Typography variant="body2" color="text.secondary" align="center">
                {khoaName}
              </Typography>
            )}
          <Button
              component="label"
              variant="contained"
              color="primary"
              fullWidth
              disabled={avatarUploading}
            >
              {avatarUploading ? "Đang upload..." : "Đổi ảnh đại diện"}
              <input
                hidden
                type="file"
                accept="image/*"
                onChange={handlePickAvatar}
              />
            </Button>
          </Stack>

          <Divider />

          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={1.25}>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
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
                <Grid item xs={12}>
                  <FTextField name="Ten" label="Họ tên" />
                </Grid>
                <Grid item xs={12}>
                  <FDatePicker name="NgaySinh" label="Ngày sinh" />
                </Grid>
                <Grid item xs={12}>
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

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="LoaiChuyenMon"
                    options={LOAI_CHUYEN_MON_ENUM}
                    displayField="label"
                    label="Loại chuyên môn"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="LoaiChuyenMonID"
                    options={trinhDoFiltered}
                    displayField="TrinhDo"
                    label="Trình độ (theo loại)"
                    disabled={!selectedLoaiChuyenMon}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="TrinhDoChuyenMon"
                    options={(TrinhDoChuyenMon || []).map(
                      (item) => item.TrinhDoChuyenMon
                    )}
                    label="Trình độ chuyên môn (cũ)"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FTextField name="TinChiBanDau" label="Tín chỉ" />
                </Grid>
                <Grid item xs={12}>
                  <FTextField name="CMND" label="CMND/CCCD" />
                </Grid>
                <Grid item xs={12}>
                  <FTextField name="SoHoChieu" label="Số hộ chiếu" />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="ChucDanh"
                    options={(ChucDanh || []).map((item) => item.ChucDanh)}
                    label="Chức danh"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="ChucVu"
                    options={(ChucVu || []).map((item) => item.ChucVu)}
                    label="Chức vụ"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="DanToc"
                    options={(DanToc || []).map((item) => item.DanToc)}
                    label="Dân tộc"
                  />
                </Grid>
              </Grid>

              <Divider />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Hành nghề
              </Typography>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="PhamViHanhNghe"
                    options={(PhamViHanhNghe || []).map(
                      (item) => item.PhamViHanhNghe
                    )}
                    label="Phạm vi hành nghề"
                    textWrap
                  />
                </Grid>
                <Grid item xs={12}>
                  <FAutocomplete
                    name="PhamViHanhNgheBoSung"
                    options={(PhamViHanhNghe || []).map(
                      (item) => item.PhamViHanhNghe
                    )}
                    label="Phạm vi hành nghề bổ sung"
                    textWrap
                  />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FTextField name="SoCCHN" label="Số chứng chỉ hành nghề" />
                </Grid>
                <Grid item xs={12}>
                  <FDatePicker name="NgayCapCCHN" label="Ngày cấp CCHN" />
                </Grid>
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12}>
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
                  <Grid item xs={12}>
                    <FSelect
                      name="LyDoNghi"
                      label="Lý do nghỉ"
                      options={LY_DO_NGHI_OPTIONS}
                    />
                  </Grid>
                )}
              </Grid>

              <Grid container spacing={1}>
                <Grid item xs={12}>
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

              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <FTextField name="SoDienThoai" label="Số điện thoại" />
                </Grid>
                <Grid item xs={12}>
                  <FTextField name="Email" label="Email" />
                </Grid>
              </Grid>

              <Box
                sx={{
                  position: "sticky",
                  bottom: 0,
                  bgcolor: "background.paper",
                  pt: 1,
                }}
              >
                <LoadingButton
                  type="submit"
                  variant="contained"
                  fullWidth
                  loading={isSubmitting}
                >
                  Lưu thay đổi
                </LoadingButton>
              </Box>
            </Stack>
          </FormProvider>
        </Stack>
      </MainCard>
    </Container>
  );
}
