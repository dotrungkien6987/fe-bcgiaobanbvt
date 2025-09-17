import { yupResolver } from "@hookform/resolvers/yup";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { FTextField, FormProvider } from "components/form";
import FDatePicker from "components/form/FDatePicker";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import dayjs from "dayjs";
import { createDoanRa, updateDoanRa, getDoanRaById } from "./doanraSlice";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import SelectNhanVienTable from "./SelectNhanVienTable";
import Autocomplete from "@mui/material/Autocomplete";
import countries from "../../../data/countries";
import CloseIcon from "@mui/icons-material/Close";

const yupSchema = Yup.object().shape({
  NgayKyVanBan: Yup.date().nullable().required("Bắt buộc chọn ngày ký văn bản"),
  SoVanBanChoPhep: Yup.string().required("Bắt buộc nhập số văn bản cho phép"),
  MucDichXuatCanh: Yup.string().required("Bắt buộc nhập mục đích xuất cảnh"),
  QuocGiaDen: Yup.string().required("Bắt buộc nhập quốc gia đến"),
  ThoiGianXuatCanh: Yup.date()
    .nullable()
    .required("Bắt buộc chọn thời gian xuất cảnh"),
});

function DoanRaForm({ open, onClose, doanRaId = null, onSuccess }) {
  const dispatch = useDispatch();
  const { currentDoanRa, isLoading } = useSelector((state) => state.doanra);
  const { nhanviens } = useSelector((state) => state.nhanvien);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSelectNV, setOpenSelectNV] = useState(false);
  const [selectedNhanVienIds, setSelectedNhanVienIds] = useState([]);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      NgayKyVanBan: null,
      SoVanBanChoPhep: "",
      MucDichXuatCanh: "",
      ThoiGianXuatCanh: null,
      NguonKinhPhi: "",
      QuocGiaDen: "",
      BaoCao: "",
      GhiChu: "",
    },
  });

  // Style cho bảng thành viên đã chọn
  const thCell = {
    px: 1,
    py: 0.5,
    fontSize: 12,
    fontWeight: 600,
    borderBottom: "1px solid #e0e0e0",
    textAlign: "left",
    whiteSpace: "nowrap",
  };
  const tdCell = {
    px: 1,
    py: 0.75,
    fontSize: 12,
    borderBottom: "1px solid #f0f0f0",
    verticalAlign: "top",
  };

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  // Load danh sách nhân viên nếu chưa có
  useEffect(() => {
    if (!nhanviens || nhanviens.length === 0) dispatch(getAllNhanVien());
  }, [nhanviens, dispatch]);

  // Load data khi edit
  useEffect(() => {
    if (doanRaId && open) {
      setIsEditMode(true);
      dispatch(getDoanRaById(doanRaId));
    } else {
      setIsEditMode(false);
      reset({
        NgayKyVanBan: null,
        SoVanBanChoPhep: "",
        MucDichXuatCanh: "",
        ThoiGianXuatCanh: null,
        NguonKinhPhi: "",
        QuocGiaDen: "",
        BaoCao: "",
        GhiChu: "",
      });
    }
  }, [doanRaId, open, dispatch, reset]);

  // Update form khi có data từ Redux
  useEffect(() => {
    if (currentDoanRa && currentDoanRa._id && isEditMode) {
      reset({
        ...currentDoanRa,
        NgayKyVanBan: currentDoanRa.NgayKyVanBan
          ? dayjs(currentDoanRa.NgayKyVanBan)
          : null,
        ThoiGianXuatCanh: currentDoanRa.ThoiGianXuatCanh
          ? dayjs(currentDoanRa.ThoiGianXuatCanh)
          : null,
      });
      // Prefill selected members
      setSelectedNhanVienIds(
        Array.isArray(currentDoanRa.ThanhVien)
          ? currentDoanRa.ThanhVien.map((m) =>
              typeof m === "string" ? m : m._id
            )
          : []
      );
    }
  }, [currentDoanRa, reset, isEditMode]);

  const onSubmitData = async (data) => {
    try {
      const doanRaData = {
        ...data,
        NgayKyVanBan: data.NgayKyVanBan
          ? data.NgayKyVanBan.toISOString()
          : null,
        ThoiGianXuatCanh: data.ThoiGianXuatCanh
          ? data.ThoiGianXuatCanh.toISOString()
          : null,
        ThanhVien: selectedNhanVienIds, // gửi mảng ObjectId
        TaiLieuKemTheo: currentDoanRa?.TaiLieuKemTheo || [],
      };

      if (isEditMode && currentDoanRa?._id) {
        await dispatch(updateDoanRa(currentDoanRa._id, doanRaData));
      } else {
        await dispatch(createDoanRa(doanRaData));
      }

      onSuccess && onSuccess();
      handleClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    reset();
    setSelectedNhanVienIds([]);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" },
      }}
    >
      <DialogTitle>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
        >
          <Typography variant="h4">
            {isEditMode ? "Cập nhật thông tin Đoàn Ra" : "Thêm mới Đoàn Ra"}
          </Typography>
          <Button
            onClick={handleClose}
            color="error"
            size="small"
            startIcon={<CloseIcon fontSize="small" />}
          >
            Đóng
          </Button>
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Card variant="outlined" sx={{ p: 2, mt: 1 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={3}>
              <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>
                Thông tin chung
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FDatePicker
                    name="NgayKyVanBan"
                    label="Ngày ký văn bản"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FTextField
                    name="SoVanBanChoPhep"
                    label="Số văn bản cho phép"
                    fullWidth
                  />
                </Grid>
              </Grid>

              <FTextField
                name="MucDichXuatCanh"
                label="Mục đích xuất cảnh"
                multiline
                rows={2}
                fullWidth
              />
              <Stack spacing={1}>
                <Typography
                  variant="h6"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                >
                  Thành viên tham gia
                </Typography>
                <Stack spacing={1}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => setOpenSelectNV(true)}
                    >
                      Chọn thành viên
                    </Button>
                    {selectedNhanVienIds.length > 0 && (
                      <Button
                        size="small"
                        color="error"
                        onClick={() => setSelectedNhanVienIds([])}
                      >
                        Xóa chọn
                      </Button>
                    )}
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      Đã chọn: {selectedNhanVienIds.length}
                    </Typography>
                  </Stack>
                  {selectedNhanVienIds.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      Chưa chọn thành viên
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        border: "1px solid #e0e0e0",
                        borderRadius: 1,
                        overflow: "auto",
                      }}
                    >
                      <Box
                        component="table"
                        sx={{
                          width: "100%",
                          borderCollapse: "collapse",
                          minWidth: 800,
                        }}
                      >
                        <Box component="thead" sx={{ bgcolor: "grey.100" }}>
                          <Box component="tr">
                            <Box component="th" sx={thCell}>
                              #
                            </Box>
                            <Box component="th" sx={thCell}>
                              Mã NV
                            </Box>
                            <Box component="th" sx={thCell}>
                              Họ tên
                            </Box>
                            <Box component="th" sx={thCell}>
                              Khoa
                            </Box>
                            <Box component="th" sx={thCell}>
                              Chức danh
                            </Box>
                            <Box component="th" sx={thCell}>
                              Chức vụ
                            </Box>
                            <Box component="th" sx={thCell}>
                              Trình độ
                            </Box>
                            <Box component="th" sx={thCell}>
                              Dân tộc
                            </Box>
                            <Box component="th" sx={thCell}>
                              Giới tính
                            </Box>
                            <Box component="th" sx={thCell}>
                              Ngày sinh
                            </Box>
                          </Box>
                        </Box>
                        <Box component="tbody">
                          {selectedNhanVienIds.map((id, idx) => {
                            const nv =
                              nhanviens.find((n) => n._id === id) || {};
                            const gioiTinh =
                              nv.GioiTinh === 0
                                ? "Nam"
                                : nv.GioiTinh === 1
                                ? "Nữ"
                                : nv.Sex || "";
                            const ngaySinhRaw =
                              nv.NgaySinh ||
                              nv.ngaySinh ||
                              nv.DOB ||
                              nv.BirthDate;
                            const ngaySinh = ngaySinhRaw
                              ? dayjs(ngaySinhRaw).format("DD/MM/YYYY")
                              : "";
                            const chucDanh =
                              nv.ChucDanh ||
                              nv.ChucDanhID?.Ten ||
                              nv.ChucDanhID?.TenChucDanh ||
                              "";
                            const chucVu =
                              nv.ChucVu ||
                              nv.ChucVuID?.Ten ||
                              nv.ChucVuID?.TenChucVu ||
                              "";
                            const trinhDo =
                              nv.TrinhDoChuyenMon ||
                              nv.TrinhDo ||
                              nv.TrinhDoID?.Ten ||
                              nv.TrinhDoChuyenMonID?.Ten ||
                              "";
                            const danToc =
                              nv.DanToc ||
                              nv.DanTocID?.Ten ||
                              nv.DanTocID?.TenDanToc ||
                              "";
                            return (
                              <Box
                                component="tr"
                                key={id}
                                sx={{
                                  "&:nth-of-type(even)": { bgcolor: "grey.50" },
                                }}
                              >
                                <Box component="td" sx={tdCell}>
                                  {idx + 1}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {nv.MaNhanVien ||
                                    nv.MaNV ||
                                    nv.maNhanVien ||
                                    nv.username ||
                                    ""}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {nv.HoTen ||
                                    nv.Ten ||
                                    nv.hoTen ||
                                    nv.ten ||
                                    nv.UserName}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {nv.TenKhoa ||
                                    nv.KhoaID?.TenKhoa ||
                                    nv.KhoaID?.Ten}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {chucDanh}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {chucVu}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {trinhDo}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {danToc}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {gioiTinh}
                                </Box>
                                <Box component="td" sx={tdCell}>
                                  {ngaySinh}
                                </Box>
                              </Box>
                            );
                          })}
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Stack>
              </Stack>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FDatePicker
                    name="ThoiGianXuatCanh"
                    label="Thời gian xuất cảnh"
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Autocomplete
                    options={countries}
                    getOptionLabel={(option) =>
                      option && option.label
                        ? `${option.label} (${option.code}, ${option.phone})`
                        : ""
                    }
                    isOptionEqualToValue={(option, value) =>
                      option.label === value.label
                    }
                    renderOption={(props, option) => (
                      <li {...props}>
                        {option.label}{" "}
                        <span style={{ color: "#888" }}>
                          ({option.code}, {option.phone})
                        </span>
                      </li>
                    )}
                    renderInput={(params) => (
                      <FTextField
                        {...params}
                        name="QuocGiaDen"
                        label="Quốc gia đến"
                        fullWidth
                      />
                    )}
                    value={
                      countries.find(
                        (c) => c.label === methods.getValues("QuocGiaDen")
                      ) || null
                    }
                    onChange={(_, value) => {
                      methods.setValue("QuocGiaDen", value ? value.label : "");
                    }}
                  />
                </Grid>
              </Grid>

              <FTextField
                name="NguonKinhPhi"
                label="Nguồn kinh phí"
                fullWidth
              />

              <FTextField
                name="BaoCao"
                label="Báo cáo"
                multiline
                rows={3}
                fullWidth
              />

              <FTextField
                name="GhiChu"
                label="Ghi chú"
                multiline
                rows={2}
                fullWidth
              />
            </Stack>
          </FormProvider>
        </Card>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0 }}>
        <Box sx={{ flexGrow: 1 }} />
        <Button
          onClick={handleClose}
          variant="outlined"
          color="inherit"
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <LoadingButton
          onClick={handleSubmit(onSubmitData)}
          variant="contained"
          startIcon={<SaveIcon />}
          loading={isSubmitting || isLoading}
          loadingPosition="start"
        >
          {isEditMode ? "Cập nhật" : "Thêm mới"}
        </LoadingButton>
      </DialogActions>

      <SelectNhanVienTable
        open={openSelectNV}
        onClose={() => setOpenSelectNV(false)}
        value={selectedNhanVienIds}
        onChange={setSelectedNhanVienIds}
      />
    </Dialog>
  );
}

export default DoanRaForm;
