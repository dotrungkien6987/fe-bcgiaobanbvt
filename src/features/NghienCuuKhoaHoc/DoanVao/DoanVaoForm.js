import React from "react";
import PropTypes from "prop-types";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm, useFieldArray } from "react-hook-form";
import {
  Dialog,
  Button,
  Grid,
  Stack,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Tooltip,
  Typography,
  Slide,
  AppBar,
  Toolbar,
  Card,
  CardContent,
  CardHeader,
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useDispatch, useSelector } from "react-redux";
import {
  createDoanVao,
  updateDoanVao,
  refreshDoanVaoAttachmentCountOne,
  getDoanVaoById,
} from "./doanvaoSlice";
import { FormProvider, FTextField, FSelect } from "components/form";
import FDatePicker from "components/form/FDatePicker";
import AttachmentSection from "shared/components/AttachmentSection";
import Autocomplete from "@mui/material/Autocomplete";
import { getDataFix } from "features/NhanVien/nhanvienSlice";

const memberSchema = Yup.object().shape({
  Ten: Yup.string().required("Bắt buộc nhập Họ tên"),
  NgaySinh: Yup.date().nullable().required("Bắt buộc chọn Ngày sinh"),
  GioiTinh: Yup.mixed()
    .oneOf(["0", "1"], "Chọn Nam/Nữ")
    .required("Chọn giới tính"),
  ChucVu: Yup.string().nullable(),
  DonViCongTac: Yup.string().nullable(),
  QuocTich: Yup.string().nullable(),
  DonViGioiThieu: Yup.string().nullable(),
  SoHoChieu: Yup.string().nullable(),
});

const schema = Yup.object().shape({
  SoVanBanChoPhep: Yup.string().required("Vui lòng nhập Số văn bản"),
  NgayKyVanBan: Yup.date().nullable().required("Vui lòng chọn Ngày ký"),
  MucDichXuatCanh: Yup.string().required("Vui lòng nhập Mục đích"),
  TuNgay: Yup.date().nullable(),
  DenNgay: Yup.date()
    .nullable()
    .when("TuNgay", (TuNgay, sch) =>
      TuNgay ? sch.min(TuNgay, "Đến ngày phải sau hoặc bằng Từ ngày") : sch
    ),
  GhiChu: Yup.string().nullable(),
  ThanhVien: Yup.array().of(memberSchema),
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DoanVaoForm({ open, onClose, doanVaoId, onSuccess }) {
  const dispatch = useDispatch();
  const { currentDoanVao } = useSelector((s) => s.doanvao || {});
  const { QuocGia } = useSelector((s) => s.nhanvien || {});

  const editing = Boolean(doanVaoId);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      SoVanBanChoPhep: "",
      NgayKyVanBan: null,
      MucDichXuatCanh: "",
      TuNgay: null,
      DenNgay: null,
      GhiChu: "",
      ThanhVien: [],
    },
  });
  const { handleSubmit, reset, control } = methods;
  const { fields, append, remove } = useFieldArray({
    name: "ThanhVien",
    control,
  });

  React.useEffect(() => {
    if (open && editing && doanVaoId) {
      dispatch(getDoanVaoById(doanVaoId));
    } else if (open && !editing) {
      reset({
        SoVanBanChoPhep: "",
        NgayKyVanBan: null,
        MucDichXuatCanh: "",
        TuNgay: null,
        DenNgay: null,
        GhiChu: "",
        ThanhVien: [],
      });
    }
  }, [open, editing, doanVaoId, dispatch, reset]);

  React.useEffect(() => {
    if (open && (!Array.isArray(QuocGia) || QuocGia.length === 0)) {
      dispatch(getDataFix());
    }
  }, [open, QuocGia, dispatch]);

  React.useEffect(() => {
    if (open && editing && currentDoanVao && currentDoanVao._id === doanVaoId) {
      reset({
        SoVanBanChoPhep: currentDoanVao.SoVanBanChoPhep || "",
        NgayKyVanBan: currentDoanVao.NgayKyVanBan || null,
        MucDichXuatCanh: currentDoanVao.MucDichXuatCanh || "",
        TuNgay: currentDoanVao.TuNgay || null,
        DenNgay: currentDoanVao.DenNgay || null,
        GhiChu: currentDoanVao.GhiChu || "",
        ThanhVien: Array.isArray(currentDoanVao.ThanhVien)
          ? currentDoanVao.ThanhVien.map((m) => ({
              ...m,
              GioiTinh:
                m.GioiTinh === 0 || m.GioiTinh === 1
                  ? String(m.GioiTinh)
                  : m.GioiTinh === "Nam"
                  ? "0"
                  : m.GioiTinh === "Nữ"
                  ? "1"
                  : "",
            }))
          : [],
      });
    }
  }, [open, editing, doanVaoId, currentDoanVao, reset]);

  const handleDialogClose = (event, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown") return;
    onClose?.();
  };

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      NgayKyVanBan:
        data.NgayKyVanBan &&
        typeof data.NgayKyVanBan?.toISOString === "function"
          ? data.NgayKyVanBan.toISOString()
          : data.NgayKyVanBan || null,
      TuNgay:
        data.TuNgay && typeof data.TuNgay?.toISOString === "function"
          ? data.TuNgay.toISOString()
          : data.TuNgay || null,
      DenNgay:
        data.DenNgay && typeof data.DenNgay?.toISOString === "function"
          ? data.DenNgay.toISOString()
          : data.DenNgay || null,
      ThanhVien: Array.isArray(data.ThanhVien)
        ? data.ThanhVien.map((m) => {
            const raw = m?.GioiTinh;
            let gioiTinh;
            if (raw === 0 || raw === 1) gioiTinh = raw;
            else if (raw === "0" || raw === "Nam") gioiTinh = 0;
            else if (raw === "1" || raw === "Nữ") gioiTinh = 1;
            const { GioiTinh, ...rest } = m;
            return {
              ...rest,
              ...(gioiTinh === 0 || gioiTinh === 1
                ? { GioiTinh: gioiTinh }
                : {}),
              NgaySinh:
                m.NgaySinh && typeof m.NgaySinh?.toISOString === "function"
                  ? m.NgaySinh.toISOString()
                  : m.NgaySinh || null,
            };
          })
        : [],
    };
    let result;
    if (editing) {
      result = await dispatch(updateDoanVao(doanVaoId, payload));
      onSuccess?.({ type: "saved", id: doanVaoId });
      onClose?.();
    } else {
      result = await dispatch(createDoanVao(payload));
      const createdId = result?.data?._id;
      onSuccess?.({ type: "saved", id: createdId });
      onClose?.();
    }
  };

  const handleAttachmentsChange = (evt) => {
    if (evt?.type === "uploaded" && (evt.id || doanVaoId)) {
      const id = evt.id || doanVaoId;
      dispatch(refreshDoanVaoAttachmentCountOne(id));
      onSuccess?.({ type: "attachmentsChanged", id });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleDialogClose}
      fullScreen
      TransitionComponent={Transition}
      PaperProps={{ sx: { bgcolor: "grey.50" } }}
    >
      <AppBar sx={{ position: "relative", bgcolor: "primary.main" }}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleDialogClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
            {editing ? "Cập nhật Đoàn Vào" : "Thêm mới Đoàn Vào"}
          </Typography>
          <Button
            autoFocus
            color="inherit"
            onClick={handleSubmit(onSubmit)}
            startIcon={<SaveIcon />}
            variant="outlined"
            sx={{
              borderColor: "white",
              color: "white",
              "&:hover": {
                borderColor: "grey.200",
                bgcolor: "rgba(255,255,255,0.1)",
              },
            }}
          >
            Lưu
          </Button>
        </Toolbar>
      </AppBar>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          <Grid
            container
            spacing={3}
            maxWidth="xl"
            sx={{ mx: "auto", width: "100%" }}
          >
            <Grid item xs={12} md={7}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title="Thông tin chung"
                  sx={{
                    bgcolor: "primary.50",
                    "& .MuiCardHeader-title": {
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "primary.main",
                    },
                  }}
                />
                <CardContent sx={{ pt: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <FTextField
                        name="SoVanBanChoPhep"
                        label="Số văn bản cho phép"
                        variant="outlined"
                        size="medium"
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FDatePicker
                        name="NgayKyVanBan"
                        label="Ngày ký văn bản"
                        variant="outlined"
                        size="medium"
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <FTextField
                        name="MucDichXuatCanh"
                        label="Mục đích"
                        variant="outlined"
                        size="medium"
                        fullWidth
                      />
                    </Grid>

                    {/* Khối thời gian làm việc */}
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          border: "1px solid",
                          borderColor: "divider",
                          borderRadius: 2,
                          p: 3,
                          bgcolor: "grey.25",
                          position: "relative",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{
                            position: "absolute",
                            top: -10,
                            left: 16,
                            bgcolor: "background.paper",
                            px: 1,
                            color: "primary.main",
                            fontWeight: 600,
                          }}
                        >
                          Thời gian vào làm việc
                        </Typography>
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                          <Grid item xs={12} md={6}>
                            <FDatePicker
                              name="TuNgay"
                              label="Từ ngày"
                              variant="outlined"
                              size="medium"
                              fullWidth
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <FDatePicker
                              name="DenNgay"
                              label="Đến ngày"
                              variant="outlined"
                              size="medium"
                              fullWidth
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>

                    <Grid item xs={12}>
                      <FTextField
                        name="GhiChu"
                        label="Ghi chú"
                        multiline
                        minRows={3}
                        variant="outlined"
                        size="medium"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={5}>
              <Card elevation={2} sx={{ borderRadius: 2, height: "100%" }}>
                <CardHeader
                  title="Tệp đính kèm"
                  sx={{
                    bgcolor: "primary.50",
                    "& .MuiCardHeader-title": {
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "primary.main",
                    },
                  }}
                />
                <CardContent>
                  {editing ? (
                    <AttachmentSection
                      ownerType="DoanVao"
                      ownerId={doanVaoId}
                      field="file"
                      onChange={handleAttachmentsChange}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Lưu bản ghi để tải tệp đính kèm.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title="Danh sách thành viên"
                  sx={{
                    bgcolor: "primary.50",
                    "& .MuiCardHeader-title": {
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "primary.main",
                    },
                  }}
                />
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 3 }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Thành viên ({fields.length})
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<AddCircleOutlineIcon />}
                      onClick={() =>
                        append({
                          Ten: "",
                          NgaySinh: null,
                          GioiTinh: "",
                          ChucVu: "",
                          DonViCongTac: "",
                          QuocTich: "",
                          DonViGioiThieu: "",
                          SoHoChieu: "",
                        })
                      }
                      sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 500,
                      }}
                    >
                      Thêm thành viên
                    </Button>
                  </Stack>
                  <Box
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2,
                      overflow: "hidden",
                      bgcolor: "background.paper",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    }}
                  >
                    <Table
                      stickyHeader
                      size="small"
                      sx={{
                        minWidth: 1640,
                        width: "100%",
                        "& .MuiTableCell-root": { px: 1, py: 0.75 },
                      }}
                    >
                      <TableHead>
                        <TableRow sx={{ bgcolor: "grey.50" }}>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 48,
                              width: 48,
                              textAlign: "center",
                            }}
                          >
                            #
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 200,
                              width: 200,
                            }}
                          >
                            Họ tên
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 130,
                              width: 130,
                              textAlign: "center",
                            }}
                          >
                            Ngày sinh
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 100,
                              width: 100,
                              textAlign: "center",
                            }}
                          >
                            Giới tính
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 160,
                              width: 160,
                            }}
                          >
                            Chức vụ
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 200,
                              width: 200,
                            }}
                          >
                            Đơn vị công tác
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 140,
                              width: 140,
                            }}
                          >
                            Quốc tịch
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 180,
                              width: 180,
                            }}
                          >
                            Đơn vị giới thiệu
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 160,
                              width: 160,
                            }}
                          >
                            Số hộ chiếu
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 600,
                              whiteSpace: "nowrap",
                              minWidth: 84,
                              width: 84,
                              textAlign: "center",
                            }}
                            align="center"
                          >
                            Thao tác
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fields.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={10}
                              align="center"
                              sx={{ color: "text.secondary" }}
                            >
                              Chưa có thành viên. Bấm “+” để thêm dòng.
                            </TableCell>
                          </TableRow>
                        ) : (
                          fields.map((field, idx) => (
                            <TableRow key={field.id} hover>
                              <TableCell
                                sx={{
                                  whiteSpace: "nowrap",
                                  textAlign: "center",
                                }}
                              >
                                {idx + 1}
                              </TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                <FTextField
                                  name={`ThanhVien.${idx}.Ten`}
                                  placeholder="Họ tên"
                                  variant="standard"
                                />
                              </TableCell>
                              <TableCell
                                sx={{ minWidth: 130, textAlign: "center" }}
                              >
                                <FDatePicker
                                  name={`ThanhVien.${idx}.NgaySinh`}
                                  label=" "
                                />
                              </TableCell>
                              <TableCell
                                sx={{ minWidth: 100, textAlign: "center" }}
                              >
                                <FSelect
                                  name={`ThanhVien.${idx}.GioiTinh`}
                                  label=" "
                                  options={[
                                    { label: "Nam", value: "0" },
                                    { label: "Nữ", value: "1" },
                                  ]}
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 160 }}>
                                <FTextField
                                  name={`ThanhVien.${idx}.ChucVu`}
                                  placeholder="Chức vụ"
                                  variant="standard"
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 200 }}>
                                <FTextField
                                  name={`ThanhVien.${idx}.DonViCongTac`}
                                  placeholder="Đơn vị công tác"
                                  variant="standard"
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 140 }}>
                                <Autocomplete
                                  options={
                                    Array.isArray(QuocGia) ? QuocGia : []
                                  }
                                  getOptionLabel={(opt) =>
                                    (opt && opt.label) || ""
                                  }
                                  isOptionEqualToValue={(o, v) =>
                                    o.label === v.label
                                  }
                                  renderInput={(params) => (
                                    <FTextField
                                      {...params}
                                      name={`ThanhVien.${idx}.QuocTich`}
                                      placeholder="Quốc tịch"
                                      variant="standard"
                                    />
                                  )}
                                  value={
                                    (Array.isArray(QuocGia)
                                      ? QuocGia
                                      : []
                                    ).find(
                                      (c) =>
                                        c.label ===
                                        methods.getValues(
                                          `ThanhVien.${idx}.QuocTich`
                                        )
                                    ) || null
                                  }
                                  onChange={(_, value) => {
                                    methods.setValue(
                                      `ThanhVien.${idx}.QuocTich`,
                                      value ? value.label : ""
                                    );
                                  }}
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 180 }}>
                                <FTextField
                                  name={`ThanhVien.${idx}.DonViGioiThieu`}
                                  placeholder="Đơn vị giới thiệu"
                                  variant="standard"
                                />
                              </TableCell>
                              <TableCell sx={{ minWidth: 160 }}>
                                <FTextField
                                  name={`ThanhVien.${idx}.SoHoChieu`}
                                  placeholder="Số hộ chiếu"
                                  variant="standard"
                                />
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{ whiteSpace: "nowrap" }}
                              >
                                <Tooltip title="Xóa dòng">
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => remove(idx)}
                                  >
                                    <DeleteOutlineIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </FormProvider>
    </Dialog>
  );
}

DoanVaoForm.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  doanVaoId: PropTypes.string,
  onSuccess: PropTypes.func,
};

export default DoanVaoForm;
