import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Link,
  Alert,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { Save2, ArrowLeft, Add, DocumentText1 } from "iconsax-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import dayjs from "dayjs";
import ISOPageShell from "./components/ISOPageShell";
import FormProvider from "../../components/form/FormProvider";
import FTextField from "../../components/form/FTextField";
import FDatePicker from "../../components/form/FDatePicker";
import FAutocomplete from "../../components/form/FAutocomplete";
import { createQuyTrinhISO } from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";

const quyTrinhSchema = Yup.object().shape({
  TenQuyTrinh: Yup.string()
    .required("Tên quy trình không được để trống")
    .max(500, "Tối đa 500 ký tự"),
  MaQuyTrinh: Yup.string()
    .required("Mã quy trình không được để trống")
    .max(50, "Tối đa 50 ký tự")
    .matches(/^[A-Z0-9-]+$/i, "Chỉ chứa chữ, số và dấu gạch ngang"),
  PhienBan: Yup.string()
    .required("Phiên bản không được để trống")
    .max(10, "Tối đa 10 ký tự"),
  KhoaXayDungID: Yup.object()
    .nullable()
    .required("Vui lòng chọn khoa xây dựng"),
  NgayHieuLuc: Yup.date()
    .required("Ngày hiệu lực không được để trống")
    .typeError("Ngày không hợp lệ"),
  GhiChu: Yup.string().max(2000, "Tối đa 2000 ký tự"),
});

const defaultValues = {
  TenQuyTrinh: "",
  MaQuyTrinh: "",
  PhienBan: "1.0",
  KhoaXayDungID: null,
  NgayHieuLuc: dayjs(),
  GhiChu: "",
};

function QuyTrinhISOCreatePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { isLoading } = useSelector((state) => state.quyTrinhISO);
  const { ISOKhoa: khoaList } = useSelector((state) => state.khoa);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Load danh sách khoa ISO
  useEffect(() => {
    if (khoaList.length === 0) {
      dispatch(getISOKhoa());
    }
  }, [dispatch, khoaList.length]);

  const methods = useForm({
    resolver: yupResolver(quyTrinhSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    reset,
    formState: { isDirty },
  } = methods;

  // Warn about unsaved changes on page unload
  useEffect(() => {
    const handler = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const onSubmit = async (data) => {
    try {
      setSubmitLoading(true);
      const submitData = {
        TenQuyTrinh: data.TenQuyTrinh,
        MaQuyTrinh: data.MaQuyTrinh.toUpperCase(),
        PhienBan: data.PhienBan,
        KhoaXayDungID: data.KhoaXayDungID?._id,
        NgayHieuLuc: data.NgayHieuLuc,
        GhiChu: data.GhiChu || "",
      };

      const result = await dispatch(createQuyTrinhISO(submitData));
      if (result?._id) {
        // Redirect to edit page to upload files, mark as fromCreate for banner
        navigate(`/quytrinh-iso/${result._id}/edit`, {
          state: { fromCreate: true },
        });
      }
    } catch (error) {
      console.error("Create error:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <ISOPageShell
      title="Thêm Quy Trình ISO Mới"
      subtitle="Tạo quy trình mới trong hệ thống ISO"
      breadcrumbs={[
        { label: "Trang chủ", to: "/" },
        { label: "Quy trình ISO", to: "/quytrinh-iso" },
        { label: "Thêm mới" },
      ]}
      headerActions={
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate("/quytrinh-iso")}
          sx={{
            color: "white",
            borderColor: "rgba(255,255,255,0.5)",
            "&:hover": {
              borderColor: "white",
              bgcolor: "rgba(255,255,255,0.1)",
            },
          }}
        >
          Quay lại
        </Button>
      }
    >
      <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom fontWeight={600}>
                Thông tin cơ bản
              </Typography>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
                  <FTextField
                    name="MaQuyTrinh"
                    label="Mã Quy Trình *"
                    placeholder="VD: QT-001"
                    inputProps={{
                      style: { textTransform: "uppercase" },
                      onInput: (e) => {
                        e.target.value = e.target.value.toUpperCase();
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FTextField
                    name="PhienBan"
                    label="Phiên Bản *"
                    placeholder="VD: 1.0"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FDatePicker name="NgayHieuLuc" label="Ngày Hiệu Lực *" />
                </Grid>

                <Grid item xs={12}>
                  <FTextField
                    name="TenQuyTrinh"
                    label="Tên Quy Trình *"
                    placeholder="Nhập tên quy trình đầy đủ..."
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <FAutocomplete
                    name="KhoaXayDungID"
                    label="Khoa Xây Dựng *"
                    options={khoaList}
                    displayField="TenKhoa"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Alert severity="info" sx={{ height: "100%" }}>
                    💡 Để phân phối quy trình cho các khoa, vui lòng sử dụng{" "}
                    <Link
                      href="/quytrinh-iso"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate("/quytrinh-iso");
                      }}
                      sx={{ fontWeight: "bold" }}
                    >
                      Quản lý phân phối
                    </Link>
                  </Alert>
                </Grid>

                <Grid item xs={12}>
                  <FTextField
                    name="GhiChu"
                    label="Ghi Chú"
                    multiline
                    rows={3}
                    placeholder="Nhập ghi chú (nếu có)..."
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          <Card sx={{ bgcolor: "#f9fafb", border: "2px dashed #cbd5e1" }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      bgcolor: "warning.main",
                      color: "white",
                      p: 1.5,
                      borderRadius: 2,
                      display: "flex",
                    }}
                  >
                    <DocumentText1 size={28} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Đính Kèm Tài Liệu
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bước tiếp theo sau khi tạo quy trình
                    </Typography>
                  </Box>
                </Stack>

                <Alert severity="info" icon={false}>
                  <Typography variant="body2" gutterBottom>
                    <strong>Sau khi tạo quy trình thành công</strong>, bạn sẽ
                    được chuyển đến trang chỉnh sửa để đính kèm:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mt: 1, mb: 0 }}>
                    <li>
                      <Typography variant="body2">
                        <strong style={{ color: "#c62828" }}>
                          File PDF Quy Trình Chính
                        </strong>{" "}
                        - Tài liệu chính thức mô tả quy trình (bắt buộc)
                      </Typography>
                    </li>
                    <li>
                      <Typography variant="body2">
                        <strong style={{ color: "#1565c0" }}>
                          Biểu Mẫu Word Đi Kèm
                        </strong>{" "}
                        - Các mẫu đơn, checklist hỗ trợ thực hiện (không bắt
                        buộc)
                      </Typography>
                    </li>
                  </Box>
                </Alert>
              </Stack>
            </CardContent>
          </Card>

          <Stack
            direction={isMobile ? "column-reverse" : "row"}
            spacing={2}
            justifyContent={isMobile ? "stretch" : "flex-end"}
          >
            <Button
              variant="outlined"
              onClick={() => reset(defaultValues)}
              fullWidth={isMobile}
            >
              Làm mới
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              loading={submitLoading || isLoading}
              startIcon={<Save2 size={18} />}
              fullWidth={isMobile}
              sx={isMobile ? { py: 1.5 } : {}}
            >
              Lưu & Tiếp tục
            </LoadingButton>
          </Stack>
        </Stack>
      </FormProvider>
    </ISOPageShell>
  );
}

export default QuyTrinhISOCreatePage;
