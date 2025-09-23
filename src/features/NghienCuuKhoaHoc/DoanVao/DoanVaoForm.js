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
  SoHoChieu: Yup.string().nullable(),
});

const schema = Yup.object().shape({
  SoVanBanChoPhep: Yup.string().required("Vui lòng nhập Số văn bản"),
  NgayKyVanBan: Yup.date().nullable().required("Vui lòng chọn Ngày ký"),
  MucDichXuatCanh: Yup.string().required("Vui lòng nhập Mục đích"),
  DonViGioiThieu: Yup.string().nullable(),
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
  const { QuocGia, DonViGioiThieu } = useSelector((s) => s.nhanvien || {});

  const editing = Boolean(doanVaoId);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      SoVanBanChoPhep: "",
      NgayKyVanBan: null,
      MucDichXuatCanh: "",
      DonViGioiThieu: "",
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
        DonViGioiThieu: "",
        TuNgay: null,
        DenNgay: null,
        GhiChu: "",
        ThanhVien: [],
      });
    }
  }, [open, editing, doanVaoId, dispatch, reset]);

  React.useEffect(() => {
    if (
      open &&
      (!Array.isArray(QuocGia) ||
        QuocGia.length === 0 ||
        !Array.isArray(DonViGioiThieu) ||
        DonViGioiThieu.length === 0)
    ) {
      dispatch(getDataFix());
    }
  }, [open, QuocGia, DonViGioiThieu, dispatch]);

  React.useEffect(() => {
    if (open && editing && currentDoanVao && currentDoanVao._id === doanVaoId) {
      reset({
        SoVanBanChoPhep: currentDoanVao.SoVanBanChoPhep || "",
        NgayKyVanBan: currentDoanVao.NgayKyVanBan || null,
        MucDichXuatCanh: currentDoanVao.MucDichXuatCanh || "",
        DonViGioiThieu: currentDoanVao.DonViGioiThieu || "",
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
                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={
                          Array.isArray(DonViGioiThieu)
                            ? DonViGioiThieu.map(
                                (o) => o?.DonViGioiThieu
                              ).filter(Boolean)
                            : []
                        }
                        renderInput={(params) => (
                          <FTextField
                            {...params}
                            name="DonViGioiThieu"
                            label="Đơn vị giới thiệu"
                            variant="outlined"
                            size="medium"
                            fullWidth
                          />
                        )}
                        value={methods.watch("DonViGioiThieu") || null}
                        onChange={(_, value) => {
                          methods.setValue("DonViGioiThieu", value || "");
                        }}
                        freeSolo
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
                      borderRadius: 3,
                      overflowX: "auto",
                      overflowY: "hidden",
                      bgcolor: "background.paper",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    <Table
                      stickyHeader
                      size="small"
                      sx={{
                        minWidth: 1600,
                        width: "100%",
                        tableLayout: "fixed",
                        "& .MuiTableCell-root": {
                          px: 2,
                          py: 1.5,
                          borderBottom: "1px solid rgba(224, 224, 224, 0.3)",
                          wordWrap: "break-word",
                          overflow: "hidden",
                        },
                        "& .MuiTableBody-root .MuiTableCell-root": {
                          verticalAlign: "top",
                          paddingTop: "12px",
                          paddingBottom: "12px",
                        },
                      }}
                    >
                      <TableHead>
                        <TableRow
                          sx={{
                            background: "none",
                            bgcolor: "primary.main",
                            "& .MuiTableCell-head": {
                              color: "white !important",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              letterSpacing: "0.5px",
                              textTransform: "uppercase",
                              borderBottom: "none",
                              textShadow: "0 1px 2px rgba(0,0,0,0.2)",
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                              backgroundColor: "primary.main",
                            },
                          }}
                        >
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              minWidth: 60,
                              width: 60,
                              textAlign: "center",
                            }}
                          >
                            STT
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              minWidth: 220,
                              width: 220,
                            }}
                          >
                            Họ và tên
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              minWidth: 180,
                              width: 180,
                              textAlign: "center",
                            }}
                          >
                            Ngày sinh
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              minWidth: 110,
                              width: 110,
                              textAlign: "center",
                            }}
                          >
                            Giới tính
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              minWidth: 180,
                              width: 180,
                            }}
                          >
                            Chức vụ
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              minWidth: 220,
                              width: 220,
                            }}
                          >
                            Đơn vị công tác
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              minWidth: 220,
                              width: 220,
                            }}
                          >
                            Quốc tịch
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              minWidth: 180,
                              width: 180,
                            }}
                          >
                            Số hộ chiếu
                          </TableCell>
                          <TableCell
                            sx={{
                              fontWeight: 700,
                              whiteSpace: "nowrap",
                              minWidth: 100,
                              width: 100,
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
                              colSpan={9}
                              align="center"
                              sx={{ color: "text.secondary" }}
                            >
                              Chưa có thành viên. Bấm “+” để thêm dòng.
                            </TableCell>
                          </TableRow>
                        ) : (
                          fields.map((field, idx) => (
                            <TableRow
                              key={field.id}
                              sx={{
                                "&:nth-of-type(even)": {
                                  backgroundColor: "rgba(0, 0, 0, 0.02)",
                                },
                                "&:hover": {
                                  backgroundColor: "rgba(25, 118, 210, 0.08)",
                                  transform: "translateY(-1px)",
                                  boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                                },
                                transition: "all 0.2s ease-in-out",
                                minHeight: "60px",
                                "& .MuiTableCell-root": {
                                  borderBottom:
                                    "1px solid rgba(224, 224, 224, 0.3)",
                                },
                              }}
                            >
                              <TableCell
                                sx={{
                                  whiteSpace: "nowrap",
                                  textAlign: "center",
                                  fontWeight: 600,
                                  color: "primary.main",
                                  fontSize: "0.95rem",
                                }}
                              >
                                {idx + 1}
                              </TableCell>
                              <TableCell
                                sx={{
                                  minWidth: 220,
                                  maxWidth: 250,
                                  verticalAlign: "top",
                                }}
                              >
                                <FTextField
                                  name={`ThanhVien.${idx}.Ten`}
                                  placeholder="Nhập họ và tên"
                                  variant="outlined"
                                  size="small"
                                  multiline
                                  maxRows={3}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                      "&:hover fieldset": {
                                        borderColor: "primary.main",
                                      },
                                      "&.Mui-focused fieldset": {
                                        borderWidth: "2px",
                                      },
                                    },
                                    "& .MuiInputBase-input": {
                                      fontSize: "0.875rem",
                                      lineHeight: 1.4,
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{ minWidth: 200, textAlign: "center" }}
                              >
                                <FDatePicker
                                  name={`ThanhVien.${idx}.NgaySinh`}
                                  label=""
                                  size="small"
                                  fullWidth
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{ minWidth: 110, textAlign: "center" }}
                              >
                                <FSelect
                                  name={`ThanhVien.${idx}.GioiTinh`}
                                  label=""
                                  size="small"
                                  options={[
                                    { label: "Nam", value: "0" },
                                    { label: "Nữ", value: "1" },
                                  ]}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  minWidth: 180,
                                  maxWidth: 200,
                                  verticalAlign: "top",
                                }}
                              >
                                <FTextField
                                  name={`ThanhVien.${idx}.ChucVu`}
                                  placeholder="Chức vụ"
                                  variant="outlined"
                                  size="small"
                                  multiline
                                  maxRows={2}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                      "&:hover fieldset": {
                                        borderColor: "primary.main",
                                      },
                                    },
                                    "& .MuiInputBase-input": {
                                      fontSize: "0.875rem",
                                      lineHeight: 1.4,
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  minWidth: 220,
                                  maxWidth: 280,
                                  verticalAlign: "top",
                                }}
                              >
                                <FTextField
                                  name={`ThanhVien.${idx}.DonViCongTac`}
                                  placeholder="Đơn vị công tác"
                                  variant="outlined"
                                  size="small"
                                  multiline
                                  maxRows={3}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                      "&:hover fieldset": {
                                        borderColor: "primary.main",
                                      },
                                    },
                                    "& .MuiInputBase-input": {
                                      fontSize: "0.875rem",
                                      lineHeight: 1.4,
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                sx={{
                                  minWidth: 220,
                                  maxWidth: 260,
                                  verticalAlign: "top",
                                }}
                              >
                                <Autocomplete
                                  options={
                                    Array.isArray(QuocGia) ? QuocGia : []
                                  }
                                  getOptionLabel={(opt) => opt?.label || ""}
                                  isOptionEqualToValue={(option, value) =>
                                    option?.label === value?.label
                                  }
                                  renderInput={(params) => (
                                    <Tooltip
                                      title={params?.inputProps?.value || ""}
                                      placement="top-start"
                                    >
                                      <FTextField
                                        {...params}
                                        name={`ThanhVien.${idx}.QuocTich`}
                                        placeholder="Chọn quốc tịch"
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        sx={{
                                          "& .MuiOutlinedInput-root": {
                                            borderRadius: 2,
                                            "&:hover fieldset": {
                                              borderColor: "primary.main",
                                            },
                                          },
                                          "& .MuiInputBase-input": {
                                            fontSize: "0.875rem",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                          },
                                        }}
                                      />
                                    </Tooltip>
                                  )}
                                  value={
                                    QuocGia?.find(
                                      (c) =>
                                        c.label ===
                                        methods.watch(
                                          `ThanhVien.${idx}.QuocTich`
                                        )
                                    ) || null
                                  }
                                  onChange={(_, newValue) => {
                                    methods.setValue(
                                      `ThanhVien.${idx}.QuocTich`,
                                      newValue?.label || ""
                                    );
                                  }}
                                  size="small"
                                  renderOption={(props, option) => (
                                    <Box
                                      component="li"
                                      {...props}
                                      sx={{
                                        fontSize: "0.875rem",
                                        whiteSpace: "normal",
                                        wordWrap: "break-word",
                                        maxWidth: "300px",
                                      }}
                                    >
                                      {option.label}
                                    </Box>
                                  )}
                                  sx={{
                                    "& .MuiAutocomplete-inputRoot": {
                                      borderRadius: 2,
                                    },
                                    "& .MuiAutocomplete-popper": {
                                      maxWidth: "300px !important",
                                    },
                                  }}
                                />
                              </TableCell>

                              <TableCell
                                sx={{
                                  minWidth: 180,
                                  maxWidth: 220,
                                  verticalAlign: "top",
                                }}
                              >
                                <FTextField
                                  name={`ThanhVien.${idx}.SoHoChieu`}
                                  placeholder="Số hộ chiếu"
                                  variant="outlined"
                                  size="small"
                                  multiline
                                  maxRows={2}
                                  sx={{
                                    "& .MuiOutlinedInput-root": {
                                      borderRadius: 2,
                                      "&:hover fieldset": {
                                        borderColor: "primary.main",
                                      },
                                    },
                                    "& .MuiInputBase-input": {
                                      fontSize: "0.875rem",
                                      lineHeight: 1.4,
                                    },
                                  }}
                                />
                              </TableCell>
                              <TableCell
                                align="center"
                                sx={{
                                  whiteSpace: "nowrap",
                                  verticalAlign: "top",
                                  paddingTop: "16px",
                                }}
                              >
                                <Tooltip title="Xóa thành viên" arrow>
                                  <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => remove(idx)}
                                    sx={{
                                      borderRadius: 2,
                                      border: "1px solid transparent",
                                      "&:hover": {
                                        backgroundColor: "error.main",
                                        color: "white",
                                        borderColor: "error.main",
                                        transform: "scale(1.1)",
                                      },
                                      transition: "all 0.2s ease-in-out",
                                    }}
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
