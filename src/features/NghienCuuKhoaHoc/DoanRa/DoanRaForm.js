import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Dialog,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  Tooltip,
  CardHeader,
  CardContent,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Slide,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import { FTextField, FCheckbox, FormProvider } from "components/form";
import FDatePicker from "components/form/FDatePicker";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import * as Yup from "yup";
import dayjs from "dayjs";
import { createDoanRa, updateDoanRa, getDoanRaById } from "./doanraSlice";
import { getAllNhanVien, getDataFix } from "features/NhanVien/nhanvienSlice";
import SelectNhanVienTable from "./SelectNhanVienTable";
import Autocomplete from "@mui/material/Autocomplete";
import CloseIcon from "@mui/icons-material/Close";
// AttachmentSection dùng chung cho quản lý tệp
import AttachmentSection from "shared/components/AttachmentSection";

const yupSchema = Yup.object().shape({
  NgayKyVanBan: Yup.date().nullable().required("Bắt buộc chọn ngày ký văn bản"),
  SoVanBanChoPhep: Yup.string().required("Bắt buộc nhập số văn bản cho phép"),
  MucDichXuatCanh: Yup.string().required("Bắt buộc nhập mục đích xuất cảnh"),
  QuocGiaDen: Yup.string().required("Bắt buộc nhập quốc gia đến"),
  TuNgay: Yup.date().nullable(),
  DenNgay: Yup.date()
    .nullable()
    .when("TuNgay", (TuNgay, sch) =>
      TuNgay ? sch.min(TuNgay, "Đến ngày phải sau hoặc bằng Từ ngày") : sch
    ),
});

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

function DoanRaForm({ open, onClose, doanRaId = null, onSuccess }) {
  const dispatch = useDispatch();
  const { currentDoanRa } = useSelector((state) => state.doanra);
  const { nhanviens, QuocGia, NguonKinhPhi, MucDichXuatCanh, DonViGioiThieu } =
    useSelector((state) => state.nhanvien);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openSelectNV, setOpenSelectNV] = useState(false);
  const [selectedNhanVienIds, setSelectedNhanVienIds] = useState([]);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      NgayKyVanBan: null,
      SoVanBanChoPhep: "",
      MucDichXuatCanh: "",
      TuNgay: null,
      DenNgay: null,
      NguonKinhPhi: "",
      DonViGioiThieu: "",
      QuocGiaDen: "",
      GhiChu: "",
      // Field mới chuẩn hoá attachments (object array)
      Attachments: [],
      // Map id -> SoHoChieu cho từng thành viên
      SoHoChieuById: {},
      // Map id -> CoBaoCao (boolean) cho từng thành viên
      CoBaoCaoById: {},
    },
  });

  // Style cho bảng thành viên đã chọn (MUI Table)
  const headSx = {
    bgcolor: (theme) => theme.palette.grey[50],
    "& th": {
      fontSize: 12,
      fontWeight: 700,
      whiteSpace: "nowrap",
      textTransform: "uppercase",
      letterSpacing: 0.5,
      py: 1.25,
    },
  };
  const cellSx = {
    py: 1.0,
    px: 1,
    fontSize: 12,
    verticalAlign: "top",
    whiteSpace: "normal",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    lineHeight: 1.4,
    borderColor: (theme) => theme.palette.divider,
  };

  const { handleSubmit, reset } = methods;

  // Load danh sách nhân viên nếu chưa có
  useEffect(() => {
    if (!nhanviens || nhanviens.length === 0) dispatch(getAllNhanVien());
  }, [nhanviens, dispatch]);

  // Load danh mục DataFix (QuocGia, NguonKinhPhi, MucDichXuatCanh, DonViGioiThieu, ...) nếu chưa có
  useEffect(() => {
    if (
      !Array.isArray(QuocGia) ||
      QuocGia.length === 0 ||
      !Array.isArray(NguonKinhPhi) ||
      NguonKinhPhi.length === 0 ||
      !Array.isArray(MucDichXuatCanh) ||
      MucDichXuatCanh.length === 0 ||
      !Array.isArray(DonViGioiThieu) ||
      DonViGioiThieu.length === 0
    ) {
      dispatch(getDataFix());
    }
  }, [QuocGia, NguonKinhPhi, MucDichXuatCanh, DonViGioiThieu, dispatch]);

  // Debug log để kiểm tra props
  useEffect(() => {
    console.log("[DoanRaForm] Props changed:", { open, doanRaId, isEditMode });
  }, [open, doanRaId, isEditMode]);

  // Load data khi edit
  useEffect(() => {
    if (doanRaId && open) {
      console.log(
        "[DoanRaForm] Setting edit mode and fetching data for ID:",
        doanRaId
      );
      setIsEditMode(true);
      dispatch(getDoanRaById(doanRaId));
    } else if (open && !doanRaId) {
      console.log("[DoanRaForm] Setting create mode");
      setIsEditMode(false);
      reset({
        NgayKyVanBan: null,
        SoVanBanChoPhep: "",
        MucDichXuatCanh: "",
        TuNgay: null,
        DenNgay: null,
        NguonKinhPhi: "",
        DonViGioiThieu: "",
        QuocGiaDen: "",
        GhiChu: "",
        Attachments: [],
        SoHoChieuById: {},
      });
    }
  }, [doanRaId, open, dispatch, reset]);

  // Update form khi có data từ Redux
  useEffect(() => {
    if (currentDoanRa && currentDoanRa._id && isEditMode) {
      // Chuẩn hoá attachments: ưu tiên field mới Attachments, fallback TaiLieuKemTheo (string array)
      const normalizedAttachments = Array.isArray(currentDoanRa.Attachments)
        ? currentDoanRa.Attachments
        : Array.isArray(currentDoanRa.TaiLieuKemTheo)
        ? currentDoanRa.TaiLieuKemTheo.map((s) => ({
            url: s,
            fileName: s.split("/").pop() || "Tài liệu",
            legacy: true,
          }))
        : [];

      const sohcMap = {};
      const baoCaoMap = {};
      if (Array.isArray(currentDoanRa.ThanhVien)) {
        currentDoanRa.ThanhVien.forEach((m) => {
          // m có thể là id cũ hoặc subdoc { NhanVienId, SoHoChieu }
          const nvId =
            (m && m.NhanVienId && (m.NhanVienId._id || m.NhanVienId)) ||
            (typeof m === "string" ? m : m?._id);
          if (nvId) {
            sohcMap[String(nvId)] =
              m?.SoHoChieu || m?.NhanVienId?.SoHoChieu || "";
            baoCaoMap[String(nvId)] = Boolean(m?.CoBaoCao);
          }
        });
      }
      reset({
        ...currentDoanRa,
        NgayKyVanBan: currentDoanRa.NgayKyVanBan
          ? dayjs(currentDoanRa.NgayKyVanBan)
          : null,
        TuNgay: currentDoanRa.TuNgay ? dayjs(currentDoanRa.TuNgay) : null,
        DenNgay: currentDoanRa.DenNgay ? dayjs(currentDoanRa.DenNgay) : null,
        Attachments: normalizedAttachments,
        SoHoChieuById: sohcMap,
        CoBaoCaoById: baoCaoMap,
      });
      // Prefill selected members
      setSelectedNhanVienIds(
        Array.isArray(currentDoanRa.ThanhVien)
          ? currentDoanRa.ThanhVien.map((m) => {
              if (!m) return null;
              if (typeof m === "string") return m;
              if (m.NhanVienId) return m.NhanVienId._id || m.NhanVienId;
              return m._id || null;
            }).filter(Boolean)
          : []
      );
    }
  }, [currentDoanRa, reset, isEditMode]);

  // Auto-fill SoHoChieu for selected members from NhanVien data
  // - If a member is selected and their SoHoChieu is empty/undefined in form state,
  //   try to populate it from the employee master data (NhanVien.SoHoChieu or aliases)
  // - Preserve any values the user has already typed
  // - Prune keys for members that have been unselected
  useEffect(() => {
    try {
      const ids = Array.isArray(selectedNhanVienIds)
        ? selectedNhanVienIds.map((x) => String(x))
        : [];
      const currentMap = methods.getValues("SoHoChieuById") || {};
      const currentBaoCao = methods.getValues("CoBaoCaoById") || {};
      const nextMap = {};
      const nextBaoCao = {};
      let changed = false;
      let changedBaoCao = false;

      const getPassport = (nv) =>
        nv?.SoHoChieu ||
        nv?.Passport ||
        nv?.PassportNo ||
        nv?.PassportNumber ||
        nv?.SoHoChieuHienTai ||
        nv?.SoHoChieuMoi ||
        "";

      ids.forEach((id) => {
        const existing = currentMap[id];
        let value = existing;
        if (existing === undefined || existing === "") {
          const nv = (nhanviens || []).find(
            (n) => String(n?._id || n?.id) === id
          );
          const auto = getPassport(nv);
          if (auto) {
            value = auto;
          } else if (existing === undefined) {
            value = ""; // ensure key exists
          }
        }
        nextMap[id] = value;
        const bc = currentBaoCao[id];
        nextBaoCao[id] = typeof bc === "boolean" ? bc : false;
        if (currentMap[id] !== value) changed = true;
        if (currentBaoCao[id] !== nextBaoCao[id]) changedBaoCao = true;
      });

      const currentKeys = Object.keys(currentMap);
      const needPrune =
        currentKeys.length !== ids.length ||
        currentKeys.some((k) => !ids.includes(k));

      if (changed || needPrune) {
        methods.setValue("SoHoChieuById", nextMap, { shouldDirty: true });
      }
      const currentKeysBC = Object.keys(currentBaoCao);
      const needPruneBC =
        currentKeysBC.length !== ids.length ||
        currentKeysBC.some((k) => !ids.includes(k));
      if (changedBaoCao || needPruneBC) {
        methods.setValue("CoBaoCaoById", nextBaoCao, { shouldDirty: true });
      }
    } catch (e) {
      // silent guard
    }
  }, [selectedNhanVienIds, nhanviens, methods]);

  const onSubmitData = async (data) => {
    try {
      const doanRaData = {
        ...data,
        NgayKyVanBan: data.NgayKyVanBan
          ? data.NgayKyVanBan.toISOString()
          : null,
        TuNgay: data.TuNgay ? data.TuNgay.toISOString() : null,
        DenNgay: data.DenNgay ? data.DenNgay.toISOString() : null,
        // Gửi mảng subdoc { NhanVienId, SoHoChieu, CoBaoCao }
        ThanhVien: (selectedNhanVienIds || []).map((id) => ({
          NhanVienId: id,
          SoHoChieu: data?.SoHoChieuById?.[id] || "",
          CoBaoCao: Boolean(data?.CoBaoCaoById?.[id]),
        })),
        Attachments: Array.isArray(data.Attachments) ? data.Attachments : [],
        // Không còn gửi TaiLieuKemTheo, BE có thể map fallback nếu cần
      };

      if (isEditMode && currentDoanRa?._id) {
        await dispatch(updateDoanRa(currentDoanRa._id, doanRaData));
        onSuccess && onSuccess();
        // Cập nhật xong vẫn ở chế độ edit
      } else {
        const created = await dispatch(createDoanRa(doanRaData));
        // Sau khi tạo, chuyển form sang chế độ edit để upload file ngay
        if (created && created.data?._id) {
          setIsEditMode(true);
          // Lấy lại chi tiết (phòng trường hợp BE thêm trường mặc định)
          dispatch(getDoanRaById(created.data._id));
        }
        onSuccess && onSuccess();
        // Không đóng dialog để user tiếp tục upload Attachment
      }
      // Không gọi handleClose nếu vừa tạo mới -> giữ mở để thao tác tệp
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleClose = () => {
    console.log("[DoanRaForm] handleClose called");
    reset();
    setSelectedNhanVienIds([]);
    onClose();
  };

  // Guard dialog close to prevent instant close from backdrop or ESC
  const handleDialogClose = (event, reason) => {
    console.log("[DoanRaForm] Dialog close triggered:", reason);
    if (reason === "backdropClick" || reason === "escapeKeyDown") {
      console.log("[DoanRaForm] Prevented auto close due to:", reason);
      return; // ignore accidental closes (e.g., click ripple timing)
    }
    console.log("[DoanRaForm] Allowing close");
    handleClose();
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
            {isEditMode ? "Cập nhật Đoàn Ra" : "Thêm mới Đoàn Ra"}
          </Typography>
          <Button
            autoFocus
            color="inherit"
            onClick={handleSubmit(onSubmitData)}
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
            {isEditMode ? "Cập nhật" : "Lưu"}
          </Button>
        </Toolbar>
      </AppBar>

      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>
          <Grid
            container
            spacing={3}
            maxWidth="xl"
            sx={{ mx: "auto", width: "100%" }}
          >
            {/* Left: Thông tin chung */}
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
                      <Autocomplete
                        options={
                          Array.isArray(MucDichXuatCanh)
                            ? MucDichXuatCanh.map(
                                (o) => o?.MucDichXuatCanh
                              ).filter(Boolean)
                            : []
                        }
                        renderInput={(params) => (
                          <FTextField
                            {...params}
                            name="MucDichXuatCanh"
                            label="Mục đích xuất cảnh"
                            variant="outlined"
                            size="medium"
                            fullWidth
                          />
                        )}
                        value={methods.watch("MucDichXuatCanh") || null}
                        onChange={(_, value) => {
                          methods.setValue("MucDichXuatCanh", value || "");
                        }}
                        freeSolo
                      />
                    </Grid>

                    {/* Khối thời gian xuất cảnh */}
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
                          Thời gian xuất cảnh
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

                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={Array.isArray(QuocGia) ? QuocGia : []}
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
                            variant="outlined"
                            size="medium"
                            fullWidth
                          />
                        )}
                        value={
                          (Array.isArray(QuocGia) ? QuocGia : []).find(
                            (c) => c.label === methods.getValues("QuocGiaDen")
                          ) || null
                        }
                        onChange={(_, value) => {
                          methods.setValue(
                            "QuocGiaDen",
                            value ? value.label : ""
                          );
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Autocomplete
                        options={
                          Array.isArray(NguonKinhPhi)
                            ? NguonKinhPhi.map((o) => o?.NguonKinhPhi).filter(
                                Boolean
                              )
                            : []
                        }
                        renderInput={(params) => (
                          <FTextField
                            {...params}
                            name="NguonKinhPhi"
                            label="Nguồn kinh phí"
                            variant="outlined"
                            size="medium"
                            fullWidth
                          />
                        )}
                        value={methods.watch("NguonKinhPhi") || null}
                        onChange={(_, value) => {
                          methods.setValue("NguonKinhPhi", value || "");
                        }}
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

                    {/* Trường BaoCao đã bỏ */}

                    <Grid item xs={12}>
                      <FTextField
                        name="GhiChu"
                        label="Ghi chú"
                        multiline
                        minRows={2}
                        variant="outlined"
                        size="medium"
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Right: Tệp đính kèm */}
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
                  {isEditMode && currentDoanRa?._id ? (
                    <AttachmentSection
                      ownerType="DoanRa"
                      ownerId={currentDoanRa._id}
                      field="file"
                      title="Tệp Đoàn Ra"
                      allowedTypes={[
                        "application/pdf",
                        "image/*",
                        ".doc",
                        ".docx",
                        ".xls",
                        ".xlsx",
                        ".ppt",
                        ".pptx",
                      ]}
                      maxSizeMB={50}
                      onChange={() => {
                        try {
                          if (currentDoanRa?._id) {
                            dispatch(
                              require("./doanraSlice").refreshDoanRaAttachmentCountOne(
                                currentDoanRa._id
                              )
                            );
                            onSuccess &&
                              onSuccess({
                                type: "attachmentsChanged",
                                id: currentDoanRa._id,
                              });
                          }
                        } catch (e) {
                          // silent
                        }
                      }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      Lưu bản ghi để tải tệp đính kèm.
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Thành viên tham gia */}
            <Grid item xs={12}>
              <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardHeader
                  title="Thành viên tham gia"
                  sx={{
                    bgcolor: "primary.50",
                    "& .MuiCardHeader-title": {
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "primary.main",
                    },
                  }}
                />
                <CardContent sx={{ p: 2 }}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      Đã chọn: {selectedNhanVienIds.length}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Tooltip title="Chọn thành viên">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setOpenSelectNV(true)}
                        >
                          Chọn thành viên
                        </Button>
                      </Tooltip>
                      {selectedNhanVienIds.length > 0 && (
                        <Tooltip title="Xóa chọn">
                          <Button
                            size="small"
                            color="error"
                            onClick={() => setSelectedNhanVienIds([])}
                          >
                            Xóa chọn
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      border: "1px solid #e0e0e0",
                      borderRadius: 1,
                      overflowX: "auto",
                      width: "100%",
                    }}
                  >
                    {selectedNhanVienIds.length === 0 ? (
                      <Box sx={{ p: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Chưa chọn thành viên
                        </Typography>
                      </Box>
                    ) : (
                      <Table
                        stickyHeader
                        size="small"
                        sx={{
                          minWidth: 900,
                          width: "100%",
                          "& .MuiTableCell-root": { px: 1 },
                        }}
                      >
                        <TableHead>
                          <TableRow sx={headSx}>
                            <TableCell>#</TableCell>
                            <TableCell>Mã NV</TableCell>
                            <TableCell>Họ tên</TableCell>
                            <TableCell>Khoa</TableCell>
                            <TableCell>Chức danh</TableCell>
                            <TableCell>Chức vụ</TableCell>
                            <TableCell>Đảng viên</TableCell>
                            <TableCell>Trình độ</TableCell>
                            <TableCell>Dân tộc</TableCell>
                            <TableCell>Giới tính</TableCell>
                            <TableCell>Ngày sinh</TableCell>
                            <TableCell>Số hộ chiếu</TableCell>
                            <TableCell>Có báo cáo?</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
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
                              <TableRow
                                key={id}
                                sx={{ "&:hover": { bgcolor: "grey.50" } }}
                              >
                                <TableCell sx={cellSx}>{idx + 1}</TableCell>
                                <TableCell sx={cellSx}>
                                  {nv.MaNhanVien ||
                                    nv.MaNV ||
                                    nv.maNhanVien ||
                                    nv.username ||
                                    ""}
                                </TableCell>
                                <TableCell sx={{ ...cellSx, fontWeight: 600 }}>
                                  {nv.HoTen ||
                                    nv.Ten ||
                                    nv.hoTen ||
                                    nv.ten ||
                                    nv.UserName}
                                </TableCell>
                                <TableCell sx={cellSx}>
                                  {nv.TenKhoa ||
                                    nv.KhoaID?.TenKhoa ||
                                    nv.KhoaID?.Ten}
                                </TableCell>
                                <TableCell sx={cellSx}>{chucDanh}</TableCell>
                                <TableCell sx={cellSx}>{chucVu}</TableCell>
                                <TableCell sx={cellSx}>
                                  {nv.isDangVien ? "Đảng viên" : ""}
                                </TableCell>
                                <TableCell sx={cellSx}>{trinhDo}</TableCell>
                                <TableCell sx={cellSx}>{danToc}</TableCell>
                                <TableCell sx={cellSx}>{gioiTinh}</TableCell>
                                <TableCell sx={cellSx}>{ngaySinh}</TableCell>
                                <TableCell sx={cellSx}>
                                  <FTextField
                                    name={`SoHoChieuById.${id}`}
                                    placeholder="Nhập số hộ chiếu"
                                    size="small"
                                  />
                                </TableCell>
                                <TableCell sx={cellSx}>
                                  <FCheckbox
                                    name={`CoBaoCaoById.${id}`}
                                    label=""
                                  />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </FormProvider>

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
