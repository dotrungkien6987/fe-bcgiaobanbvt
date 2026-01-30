import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Breadcrumbs,
  Link,
  Divider,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  Save2,
  ArrowLeft,
  DocumentText1,
  Copy,
  DocumentDownload,
  Home2,
  Edit,
} from "iconsax-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import dayjs from "dayjs";
import MainCard from "../../components/MainCard";
import FormProvider from "../../components/form/FormProvider";
import FTextField from "../../components/form/FTextField";
import FDatePicker from "../../components/form/FDatePicker";
import FAutocomplete from "../../components/form/FAutocomplete";
import AttachmentSection from "../../shared/components/AttachmentSection";
import {
  getQuyTrinhISODetail,
  updateQuyTrinhISO,
  getQuyTrinhISOVersions,
  copyFilesFromVersion,
} from "./quyTrinhISOSlice";
import { getISOKhoa } from "../Daotao/Khoa/khoaSlice";

const quyTrinhSchema = Yup.object().shape({
  TenQuyTrinh: Yup.string()
    .required("Tên quy trình không được để trống")
    .max(500, "Tối đa 500 ký tự"),
  MaQuyTrinh: Yup.string()
    .required("Mã quy trình không được để trống")
    .max(50, "Tối đa 50 ký tự"),
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

function QuyTrinhISOEditPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentItem, versions, isLoading } = useSelector(
    (state) => state.quyTrinhISO,
  );
  const { ISOKhoa: khoaList } = useSelector((state) => state.khoa);

  const [submitLoading, setSubmitLoading] = useState(false);
  const [copyDialogOpen, setCopyDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [copyLoading, setCopyLoading] = useState(false);

  // Load danh sách khoa ISO
  useEffect(() => {
    if (khoaList.length === 0) {
      dispatch(getISOKhoa());
    }
  }, [dispatch, khoaList.length]);

  const methods = useForm({
    resolver: yupResolver(quyTrinhSchema),
    defaultValues: {
      TenQuyTrinh: "",
      MaQuyTrinh: "",
      PhienBan: "",
      KhoaXayDungID: null,
      NgayHieuLuc: dayjs(),
      GhiChu: "",
    },
  });

  const { handleSubmit, reset } = methods;

  // Fetch data
  useEffect(() => {
    if (id) {
      dispatch(getQuyTrinhISODetail(id));
    }
  }, [dispatch, id]);

  // Populate form when data loads
  useEffect(() => {
    if (currentItem && currentItem._id === id) {
      reset({
        TenQuyTrinh: currentItem.TenQuyTrinh || "",
        MaQuyTrinh: currentItem.MaQuyTrinh || "",
        PhienBan: currentItem.PhienBan || "",
        KhoaXayDungID: currentItem.KhoaXayDungID || null,
        NgayHieuLuc: currentItem.NgayHieuLuc
          ? dayjs(currentItem.NgayHieuLuc)
          : dayjs(),
        GhiChu: currentItem.GhiChu || "",
      });

      // Fetch versions if we have MaQuyTrinh
      if (currentItem.MaQuyTrinh) {
        dispatch(getQuyTrinhISOVersions(currentItem._id));
      }
    }
  }, [currentItem, id, reset, dispatch]);

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

      await dispatch(updateQuyTrinhISO(id, submitData));
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setSubmitLoading(false);
    }
  };

  // Copy files from version
  const handleOpenCopyDialog = () => {
    setCopyDialogOpen(true);
    setSelectedVersion(null);
    setSelectedFiles([]);
  };

  const handleSelectVersion = (version) => {
    setSelectedVersion(version);
    // Select all files by default
    const allFileIds = [
      ...(version.filesPDF || []).map((f) => f._id),
      ...(version.filesWord || []).map((f) => f._id),
    ];
    setSelectedFiles(allFileIds);
  };

  const handleToggleFile = (fileId) => {
    setSelectedFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId],
    );
  };

  const handleCopyFiles = async () => {
    if (!selectedVersion || selectedFiles.length === 0) return;

    try {
      setCopyLoading(true);
      await dispatch(copyFilesFromVersion(id, selectedVersion._id, null));
      setCopyDialogOpen(false);
      // Refresh detail to see new files
      dispatch(getQuyTrinhISODetail(id));
    } catch (error) {
      console.error("Copy files error:", error);
    } finally {
      setCopyLoading(false);
    }
  };

  const hasOtherVersions = versions && versions.length > 0;

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          underline="hover"
          color="inherit"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <Home2 size={16} />
          Trang chủ
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href="/quytrinh-iso"
          onClick={(e) => {
            e.preventDefault();
            navigate("/quytrinh-iso");
          }}
        >
          Quy trình ISO
        </Link>
        <Link
          underline="hover"
          color="inherit"
          href={`/quytrinh-iso/${id}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/quytrinh-iso/${id}`);
          }}
        >
          {currentItem?.MaQuyTrinh || "..."}
        </Link>
        <Typography color="text.primary" fontWeight={500}>
          Chỉnh sửa
        </Typography>
      </Breadcrumbs>

      <MainCard
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Edit size={24} color="#1976d2" />
            <span>Chỉnh Sửa Quy Trình: {currentItem?.MaQuyTrinh || ""}</span>
          </Stack>
        }
        secondary={
          <Button
            startIcon={<ArrowLeft size={18} />}
            onClick={() => navigate("/quytrinh-iso")}
          >
            Quay lại
          </Button>
        }
      >
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Basic Info Card */}
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
                      inputProps={{ style: { textTransform: "uppercase" } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <FTextField name="PhienBan" label="Phiên Bản *" />
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
                      getOptionLabel={(option) =>
                        option?.TenKhoa || option?.MaKhoa || ""
                      }
                      isOptionEqualToValue={(option, value) =>
                        option?._id === value?._id
                      }
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Alert severity="info" sx={{ height: "100%" }}>
                      💡 Để phân phối quy trình cho các khoa, vui lòng sử dụng{" "}
                      <Link
                        href="/quytrinh-iso/phan-phoi"
                        onClick={(e) => {
                          e.preventDefault();
                          navigate("/quytrinh-iso/phan-phoi");
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
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* PDF Attachment - Main Process Document */}
            <Card
              sx={{
                border: "2px solid",
                borderColor: "error.main",
                bgcolor: "#fff5f5",
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      bgcolor: "error.main",
                      color: "white",
                      p: 1.5,
                      borderRadius: 2,
                      display: "flex",
                    }}
                  >
                    <DocumentDownload size={32} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} color="error">
                      File Quy Trình Chính (PDF)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      File PDF chính thức mô tả quy trình ISO - Tài liệu bắt
                      buộc
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Alert severity="info" sx={{ mb: 2 }}>
                  Chỉ được upload 1 file PDF duy nhất. Đây là tài liệu chính
                  thức của quy trình, cần có chữ ký số hoặc được phê duyệt theo
                  đúng quy định.
                </Alert>

                <AttachmentSection
                  ownerType="quytrinhiso"
                  ownerId={id}
                  field="FilePDF"
                  maxFiles={1}
                  accept=".pdf"
                />
              </CardContent>
            </Card>

            {/* Word Attachments - Supporting Templates */}
            <Card
              sx={{
                border: "2px solid",
                borderColor: "primary.main",
                bgcolor: "#f0f7ff",
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  mb={2}
                  flexWrap="wrap"
                >
                  <Box
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      p: 1.5,
                      borderRadius: 2,
                      display: "flex",
                    }}
                  >
                    <DocumentText1 size={32} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight={600} color="primary">
                      Biểu Mẫu Đi Kèm (Word)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Các biểu mẫu, mẫu đơn, checklist hỗ trợ thực hiện quy
                      trình - Không bắt buộc
                    </Typography>
                  </Box>

                  {hasOtherVersions && (
                    <Button
                      variant="outlined"
                      startIcon={<Copy size={18} />}
                      onClick={handleOpenCopyDialog}
                      size="small"
                    >
                      Sao chép từ phiên bản khác
                    </Button>
                  )}
                </Stack>

                <Divider sx={{ mb: 2 }} />

                <Alert severity="warning" sx={{ mb: 2 }}>
                  Đây là các tài liệu bổ trợ giúp thực thi quy trình (ví dụ:
                  biểu mẫu báo cáo, phiếu kiểm tra, mẫu đơn yêu cầu...). Có thể
                  upload nhiều file.
                </Alert>

                <AttachmentSection
                  ownerType="quytrinhiso"
                  ownerId={id}
                  field="FileWord"
                  accept=".doc,.docx"
                />
              </CardContent>
            </Card>

            {/* Save Button */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => navigate("/quytrinh-iso")}
              >
                Hủy
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={submitLoading || isLoading}
                startIcon={<Save2 size={18} />}
              >
                Lưu thay đổi
              </LoadingButton>
            </Stack>
          </Stack>
        </FormProvider>

        {/* Copy Files Dialog */}
        <Dialog
          open={copyDialogOpen}
          onClose={() => setCopyDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Sao chép file từ phiên bản khác</DialogTitle>
          <DialogContent>
            {!selectedVersion ? (
              <>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Chọn phiên bản để sao chép file:
                </Typography>
                <List>
                  {versions?.map((version) => (
                    <ListItem
                      key={version._id}
                      button
                      onClick={() => handleSelectVersion(version)}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={`Phiên bản ${version.PhienBan}`}
                        secondary={`${version.filesPDF?.length || 0} PDF, ${
                          version.filesWord?.length || 0
                        } Word`}
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            ) : (
              <>
                <Alert severity="info" sx={{ mb: 2 }}>
                  Đang chọn từ phiên bản {selectedVersion.PhienBan}
                </Alert>

                {selectedVersion.filesPDF?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      File PDF:
                    </Typography>
                    <List dense>
                      {selectedVersion.filesPDF.map((file) => (
                        <ListItem key={file._id}>
                          <ListItemIcon>
                            <Checkbox
                              checked={selectedFiles.includes(file._id)}
                              onChange={() => handleToggleFile(file._id)}
                            />
                          </ListItemIcon>
                          <ListItemIcon>
                            <DocumentDownload size={20} color="#c62828" />
                          </ListItemIcon>
                          <ListItemText primary={file.TenGoc || file.TenFile} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                {selectedVersion.filesWord?.length > 0 && (
                  <>
                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      File Word:
                    </Typography>
                    <List dense>
                      {selectedVersion.filesWord.map((file) => (
                        <ListItem key={file._id}>
                          <ListItemIcon>
                            <Checkbox
                              checked={selectedFiles.includes(file._id)}
                              onChange={() => handleToggleFile(file._id)}
                            />
                          </ListItemIcon>
                          <ListItemIcon>
                            <DocumentText1 size={20} color="#1976d2" />
                          </ListItemIcon>
                          <ListItemText primary={file.TenGoc || file.TenFile} />
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}

                <Button
                  size="small"
                  onClick={() => setSelectedVersion(null)}
                  sx={{ mt: 1 }}
                >
                  ← Chọn phiên bản khác
                </Button>
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCopyDialogOpen(false)}>Hủy</Button>
            <LoadingButton
              onClick={handleCopyFiles}
              variant="contained"
              loading={copyLoading}
              disabled={!selectedVersion || selectedFiles.length === 0}
            >
              Sao chép ({selectedFiles.length} file)
            </LoadingButton>
          </DialogActions>
        </Dialog>
      </MainCard>
    </>
  );
}

export default QuyTrinhISOEditPage;
