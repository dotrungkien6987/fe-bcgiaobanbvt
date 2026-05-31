import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Chip,
  Breadcrumbs,
  Link,
  Alert,
  IconButton,
  Divider,
  Grid,
  Skeleton,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Article as ArticleIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import {
  fetchBaiBaoById,
  deleteBaiBao as deleteBaiBaoThunk,
  selectBaiBaoById,
} from "../slices/baiBaoSlice";
import { fetchTapSanById, selectTapSanById } from "../slices/tapSanSlice";
import AttachmentSection from "../components/AttachmentSection";
import ConfirmDialog from "components/ConfirmDialog";
import useLocalSnackbar from "../hooks/useLocalSnackbar";
import useTapSanNhanVienOptions from "../hooks/useTapSanNhanVienOptions";

export default function BaiBaoDetailPage() {
  const { tapSanId, baiBaoId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const baiBao = useSelector((state) => selectBaiBaoById(state, baiBaoId));
  const tapSan = useSelector((state) => selectTapSanById(state, tapSanId));
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(null);
  // Tabs removed – single page layout
  const { showSuccess, showError, SnackbarElement } = useLocalSnackbar();
  const [confirm, setConfirm] = React.useState({ open: false, loading: false });
  const { nhanVienById } = useTapSanNhanVienOptions();

  const loadTapSan = React.useCallback(async () => {
    try {
      await dispatch(fetchTapSanById(tapSanId)).unwrap();
    } catch (error) {
      console.error("Error loading TapSan:", error);
      setError("Không thể tải thông tin tập san");
    }
  }, [tapSanId, dispatch]);

  const loadBaiBao = React.useCallback(async () => {
    try {
      setLoading(true);
      await dispatch(fetchBaiBaoById(baiBaoId)).unwrap();
    } catch (error) {
      console.error("Error loading BaiBao:", error);
      setError("Không thể tải thông tin bài báo");
    } finally {
      setLoading(false);
    }
  }, [baiBaoId, dispatch]);

  // Fetch TapSan once per id change
  React.useEffect(() => {
    loadTapSan();
  }, [loadTapSan]);

  // Fetch BaiBao once per id change
  React.useEffect(() => {
    loadBaiBao();
  }, [loadBaiBao]);

  const loaiHinhLabel = (v) => {
    switch (v) {
      case "ky-thuat-moi":
        return "Kỹ thuật mới";
      case "nghien-cuu-khoa-hoc":
        return "Nghiên cứu khoa học";
      case "ca-lam-sang":
        return "Ca lâm sàng";
      default:
        return v || "";
    }
  };

  const khoiLabel = (v) => {
    switch (v) {
      case "noi":
        return "Nội";
      case "ngoai":
        return "Ngoại";
      case "dieu-duong":
        return "Điều dưỡng";
      case "phong-ban":
        return "Phòng ban";
      case "can-lam-sang":
        return "Cận lâm sàng";
      default:
        return v || "";
    }
  };

  const isTTT = tapSan?.Loai === "TTT";

  // Helper function to get author's full info including department
  const getAuthorFullInfo = React.useCallback(
    (author) => {
      if (!author) return null;

      const khoaInfo = nhanVienById.get(author._id)?.KhoaID || author.KhoaID;
      let tenKhoa = "";

      if (typeof khoaInfo === "object" && khoaInfo?.TenKhoa) {
        tenKhoa = khoaInfo.TenKhoa;
      } else if (author.TenKhoa) {
        tenKhoa = author.TenKhoa;
      } else if (author.Khoa) {
        tenKhoa = author.Khoa;
      } else if (author.KhoaTen) {
        tenKhoa = author.KhoaTen;
      }

      return {
        ...author,
        TenKhoa: tenKhoa,
        TrinhDoChuyenMon: author.TrinhDoChuyenMon || "",
        ChucDanh: author.ChucDanh || "",
        ChucVu: author.ChucVu || "",
      };
    },
    [nhanVienById],
  );

  const tacGiaChinh = React.useMemo(() => {
    if (!baiBao || !baiBao.TacGiaChinhID) return null;
    const v = baiBao.TacGiaChinhID;
    const id = typeof v === "object" ? v._id : v;
    if (!id) return null;

    // Use enhanced author info
    if (typeof v === "object" && v.Ten) {
      return getAuthorFullInfo(v);
    }

    const author = nhanVienById.get(id);
    return author ? getAuthorFullInfo(author) : null;
  }, [baiBao, nhanVienById, getAuthorFullInfo]);

  const dongTacGia = React.useMemo(() => {
    if (!baiBao || !Array.isArray(baiBao.DongTacGiaIDs)) return [];
    // Normalize to ID strings
    const ids = new Set(
      baiBao.DongTacGiaIDs.map((x) =>
        x && typeof x === "object" ? x._id : x,
      ).filter(Boolean),
    );
    // Ensure main author not duplicated in co-authors
    const mainId =
      typeof baiBao.TacGiaChinhID === "object"
        ? baiBao.TacGiaChinhID?._id
        : baiBao.TacGiaChinhID;
    if (mainId) ids.delete(mainId);

    // Return enhanced author objects
    const providedObjects = (baiBao.DongTacGiaIDs || []).filter(
      (x) => x && typeof x === "object",
    );
    const providedById = new Map(providedObjects.map((o) => [o._id, o]));
    const list = [];
    ids.forEach((id) => {
      const obj = providedById.get(id) || nhanVienById.get(id);
      if (obj) {
        const enhancedAuthor = getAuthorFullInfo(obj);
        if (enhancedAuthor) list.push(enhancedAuthor);
      }
    });
    return list;
  }, [baiBao, nhanVienById, getAuthorFullInfo]);

  const nguoiThamDinh = React.useMemo(() => {
    if (!baiBao || !baiBao.NguoiThamDinhID) return null;
    const v = baiBao.NguoiThamDinhID;
    const id = typeof v === "object" ? v._id : v;
    if (!id) return null;

    if (typeof v === "object" && v.Ten) {
      return getAuthorFullInfo(v);
    }

    const reviewer = nhanVienById.get(id);
    return reviewer ? getAuthorFullInfo(reviewer) : null;
  }, [baiBao, nhanVienById, getAuthorFullInfo]);

  const handleAskDelete = () => {
    setConfirm({ open: true, loading: false });
  };

  const handleConfirmDelete = async () => {
    try {
      setConfirm((s) => ({ ...s, loading: true }));
      await dispatch(deleteBaiBaoThunk(baiBaoId)).unwrap();
      showSuccess("Đã xóa bài báo");
      navigate(`/tapsan/${tapSanId}/baibao`);
    } catch (error) {
      console.error("Error deleting article:", error);
      setError("Không thể xóa bài báo");
      showError("Không thể xóa bài báo");
    } finally {
      setConfirm({ open: false, loading: false });
    }
  };

  const handleEdit = () => {
    navigate(`/tapsan/${tapSanId}/baibao/${baiBaoId}/edit`);
  };

  const handleBack = () => {
    navigate(`/tapsan/${tapSanId}/baibao`);
  };

  // No tab change handler – tabs removed

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={3}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width={300} height={36} />
            <Skeleton variant="text" width={200} />
          </Box>
          <Skeleton variant="rectangular" width={160} height={36} />
          <Skeleton variant="rectangular" width={120} height={36} />
        </Stack>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Skeleton variant="text" width={180} height={28} />
            <Skeleton variant="rectangular" height={180} sx={{ mt: 2 }} />
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (!baiBao) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Không tìm thấy bài báo</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        pb: 4,
      }}
    >
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          px: { xs: 2, sm: 3, md: 4 },
          pt: 3,
        }}
      >
        {/* Breadcrumbs */}
        <Breadcrumbs
          sx={{
            mb: 3,
            "& .MuiBreadcrumbs-separator": {
              color: "primary.main",
            },
          }}
        >
          <Link
            component={RouterLink}
            color="inherit"
            to="/tapsan"
            sx={{
              textDecoration: "none",
              "&:hover": { color: "primary.main" },
            }}
          >
            Tập san
          </Link>
          <Link
            component={RouterLink}
            color="inherit"
            to={`/tapsan/${tapSanId}/baibao`}
            sx={{
              textDecoration: "none",
              "&:hover": { color: "primary.main" },
            }}
          >
            {tapSan
              ? `${tapSan?.Loai} ${tapSan?.NamXuatBan} - Số ${tapSan?.SoXuatBan}`
              : "Chi tiết tập san"}
          </Link>
          <Typography color="text.primary" fontWeight={500}>
            Chi tiết bài báo
          </Typography>
        </Breadcrumbs>

        {/* Header Card */}
        <Card
          elevation={4}
          sx={{
            mb: 4,
            borderRadius: 3,
            background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Stack direction="row" alignItems="flex-start" spacing={3}>
              <IconButton
                onClick={handleBack}
                color="primary"
                sx={{
                  bgcolor: "primary.50",
                  "&:hover": { bgcolor: "primary.100" },
                  borderRadius: 2,
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "primary.50",
                  color: "primary.main",
                }}
              >
                <ArticleIcon sx={{ fontSize: 40 }} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h3"
                  fontWeight="700"
                  sx={{
                    mb: 2,
                    background: "linear-gradient(45deg, #1976d2, #42a5f5)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: 1.2,
                  }}
                >
                  {baiBao.TieuDe}
                </Typography>

                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  flexWrap="wrap"
                  gap={1}
                >
                  {baiBao.MaBaiBao && (
                    <Chip
                      label={`Mã: ${baiBao.MaBaiBao}`}
                      size="medium"
                      variant="outlined"
                      sx={{
                        borderColor: "primary.300",
                        color: "primary.700",
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {typeof baiBao.SoThuTu === "number" && (
                    <Chip
                      label={`STT: ${baiBao.SoThuTu}`}
                      size="medium"
                      variant="outlined"
                      sx={{
                        borderColor: "secondary.300",
                        color: "secondary.700",
                        fontWeight: 600,
                      }}
                    />
                  )}
                  {baiBao.LoaiHinh && (
                    <Chip
                      label={loaiHinhLabel(baiBao.LoaiHinh)}
                      size="medium"
                      color="primary"
                      sx={{
                        fontWeight: 600,
                        boxShadow: 1,
                      }}
                    />
                  )}
                  {baiBao.KhoiChuyenMon && (
                    <Chip
                      label={khoiLabel(baiBao.KhoiChuyenMon)}
                      size="medium"
                      sx={{
                        bgcolor: "success.100",
                        color: "success.800",
                        fontWeight: 600,
                      }}
                    />
                  )}
                </Stack>
              </Box>

              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    boxShadow: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={handleAskDelete}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1.5,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  Xóa
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 4,
              borderRadius: 2,
              boxShadow: 1,
            }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Content */}
        <Grid container spacing={4}>
          {/* Basic Information - 2/3 width */}
          <Grid item xs={12} lg={8}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight="700"
                  sx={{
                    color: "primary.main",
                    mb: 3,
                  }}
                >
                  📋 Thông tin bài báo
                </Typography>
                <Divider sx={{ mb: 3, borderColor: "primary.100" }} />

                <Stack spacing={3}>
                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1 }}
                    >
                      📝 Tiêu đề
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 500,
                        color: "text.primary",
                        lineHeight: 1.4,
                      }}
                    >
                      {baiBao.TieuDe}
                    </Typography>
                  </Box>

                  {/* Metadata row - Mã, STT, Phân loại, Khối chuyên môn */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 2 }}
                    >
                      📊 Thông tin phân loại
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={2}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{
                        p: 3,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: 120,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                          sx={{ mb: 0.5 }}
                        >
                          🔖 Mã bài báo
                        </Typography>
                        <Chip
                          label={baiBao.MaBaiBao || "Chưa có mã"}
                          color={baiBao.MaBaiBao ? "primary" : "default"}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: 100,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                          sx={{ mb: 0.5 }}
                        >
                          🔢 Số thứ tự
                        </Typography>
                        <Chip
                          label={baiBao.SoThuTu ?? "—"}
                          color="secondary"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: 140,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                          sx={{ mb: 0.5 }}
                        >
                          📚 Phân loại
                        </Typography>
                        {isTTT ? (
                          <Chip
                            label={
                              {
                                "su-dung-thuoc-hop-ly": "Sử dụng thuốc hợp lý",
                                "canh-bao-tac-dung-phu":
                                  "Cảnh báo tác dụng phụ",
                                "tuong-tac-thuoc": "Tương tác thuốc",
                                "cap-nhat-khuyen-cao": "Cập nhật khuyến cáo",
                              }[baiBao.NoiDungChuyenDe] ||
                              baiBao.NoiDungChuyenDe ||
                              "—"
                            }
                            color="secondary"
                            sx={{ fontWeight: 600, boxShadow: 1 }}
                          />
                        ) : (
                          <Chip
                            label={loaiHinhLabel(baiBao.LoaiHinh)}
                            color="primary"
                            sx={{ fontWeight: 600, boxShadow: 1 }}
                          />
                        )}
                      </Box>

                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          minWidth: 140,
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight="600"
                          sx={{ mb: 0.5 }}
                        >
                          🏥 Khối chuyên môn
                        </Typography>
                        <Chip
                          label={khoiLabel(baiBao.KhoiChuyenMon)}
                          sx={{
                            bgcolor: "success.100",
                            color: "success.800",
                            fontWeight: 600,
                          }}
                        />
                      </Box>

                      {/* Nguồn tham khảo moved to its own section below */}
                    </Stack>
                  </Box>

                  {/* TapSan info */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1.5 }}
                    >
                      📖 Tập san xuất bản
                    </Typography>
                    <Box
                      sx={{
                        p: 3,
                        bgcolor: "info.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "info.200",
                      }}
                    >
                      <Typography
                        variant="h6"
                        fontWeight="600"
                        sx={{
                          color: "info.800",
                          mb: 1,
                          lineHeight: 1.3,
                        }}
                      >
                        {tapSan
                          ? tapSan.Loai === "YHTH"
                            ? `Tập san y học thực hành số ${tapSan.SoXuatBan?.toString().padStart(
                                2,
                                "0",
                              )} năm ${tapSan.NamXuatBan}`
                            : `Tập san thông tin thuốc số ${tapSan.SoXuatBan?.toString().padStart(
                                2,
                                "0",
                              )} năm ${tapSan.NamXuatBan}`
                          : "Đang tải thông tin tập san..."}
                      </Typography>
                      {tapSan?.TenTapSan && (
                        <Typography variant="body2" color="text.secondary">
                          {tapSan.TenTapSan}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1.5 }}
                    >
                      👤 Tác giả
                    </Typography>
                    {baiBao.TacGiaLoai === "ngoai-vien" ? (
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: "primary.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "primary.200",
                        }}
                      >
                        <Typography variant="h6" fontWeight="600">
                          {baiBao.TacGiaNgoaiVien || "—"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          (Tác giả ngoại viện)
                        </Typography>
                      </Box>
                    ) : tacGiaChinh ? (
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: "primary.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "primary.200",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          sx={{ color: "primary.800", mb: 1 }}
                        >
                          {tacGiaChinh.Ten}
                          {tacGiaChinh.MaNhanVien && (
                            <Chip
                              label={tacGiaChinh.MaNhanVien}
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: "primary.100",
                                color: "primary.700",
                              }}
                            />
                          )}
                        </Typography>

                        {/* Enhanced author info display */}
                        <Stack spacing={1}>
                          {tacGiaChinh.TrinhDoChuyenMon && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "primary.600", fontWeight: 600 }}
                              >
                                🎓 Trình độ:
                              </Typography>
                              <Chip
                                label={tacGiaChinh.TrinhDoChuyenMon}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Box>
                          )}

                          {tacGiaChinh.ChucDanh && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "primary.600", fontWeight: 600 }}
                              >
                                👔 Chức danh:
                              </Typography>
                              <Chip
                                label={tacGiaChinh.ChucDanh}
                                size="small"
                                sx={{ bgcolor: "info.100", color: "info.800" }}
                              />
                            </Box>
                          )}

                          {tacGiaChinh.ChucVu && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "primary.600", fontWeight: 600 }}
                              >
                                💼 Chức vụ:
                              </Typography>
                              <Chip
                                label={tacGiaChinh.ChucVu}
                                size="small"
                                sx={{
                                  bgcolor: "warning.100",
                                  color: "warning.800",
                                }}
                              />
                            </Box>
                          )}

                          {(tacGiaChinh.TenKhoa ||
                            tacGiaChinh.Khoa ||
                            tacGiaChinh.KhoaTen) && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "primary.600", fontWeight: 600 }}
                              >
                                🏥 Khoa:
                              </Typography>
                              <Chip
                                label={
                                  tacGiaChinh.TenKhoa ||
                                  tacGiaChinh.Khoa ||
                                  tacGiaChinh.KhoaTen
                                }
                                size="small"
                                sx={{
                                  bgcolor: "success.100",
                                  color: "success.800",
                                }}
                              />
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body1" color="text.disabled">
                        Chưa có thông tin tác giả chính
                      </Typography>
                    )}
                  </Box>

                  {baiBao.TacGiaLoai === "ngoai-vien" ? null : (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight="600"
                        sx={{ mb: 1.5 }}
                      >
                        👥 Đồng tác giả ({dongTacGia.length} người)
                      </Typography>
                      {dongTacGia && dongTacGia.length > 0 ? (
                        <Stack spacing={2}>
                          {dongTacGia.map((nv, index) => (
                            <Box
                              key={nv._id}
                              sx={{
                                p: 2.5,
                                bgcolor: "grey.50",
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: "grey.200",
                              }}
                            >
                              <Typography
                                variant="subtitle1"
                                fontWeight="600"
                                sx={{ color: "text.primary", mb: 1 }}
                              >
                                {index + 1}. {nv.Ten}
                                {nv.MaNhanVien && (
                                  <Chip
                                    label={nv.MaNhanVien}
                                    size="small"
                                    sx={{
                                      ml: 1,
                                      bgcolor: "grey.100",
                                      color: "text.secondary",
                                    }}
                                  />
                                )}
                              </Typography>
                              {/* Enhanced co-author info display */}
                              <Stack spacing={1}>
                                {nv.TrinhDoChuyenMon && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "grey.600",
                                        fontWeight: 600,
                                      }}
                                    >
                                      🎓 Trình độ:
                                    </Typography>
                                    <Chip
                                      label={nv.TrinhDoChuyenMon}
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                    />
                                  </Box>
                                )}
                                {nv.ChucDanh && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "grey.600",
                                        fontWeight: 600,
                                      }}
                                    >
                                      👔 Chức danh:
                                    </Typography>
                                    <Chip
                                      label={nv.ChucDanh}
                                      size="small"
                                      sx={{
                                        bgcolor: "info.100",
                                        color: "info.800",
                                      }}
                                    />
                                  </Box>
                                )}
                                {nv.ChucVu && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "grey.600",
                                        fontWeight: 600,
                                      }}
                                    >
                                      💼 Chức vụ:
                                    </Typography>
                                    <Chip
                                      label={nv.ChucVu}
                                      size="small"
                                      sx={{
                                        bgcolor: "warning.100",
                                        color: "warning.800",
                                      }}
                                    />
                                  </Box>
                                )}
                                {(nv.TenKhoa || nv.Khoa || nv.KhoaTen) && (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "grey.600",
                                        fontWeight: 600,
                                      }}
                                    >
                                      🏥 Khoa:
                                    </Typography>
                                    <Chip
                                      label={
                                        nv.TenKhoa || nv.Khoa || nv.KhoaTen
                                      }
                                      size="small"
                                      sx={{
                                        bgcolor: "success.100",
                                        color: "success.800",
                                      }}
                                    />
                                  </Box>
                                )}
                              </Stack>
                            </Box>
                          ))}
                        </Stack>
                      ) : (
                        <Typography variant="body2" color="text.disabled">
                          Không có đồng tác giả
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1.5 }}
                    >
                      🕵️‍♂️ Người thẩm định
                    </Typography>
                    {nguoiThamDinh ? (
                      <Box
                        sx={{
                          p: 3,
                          bgcolor: "info.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "info.200",
                        }}
                      >
                        <Typography
                          variant="h6"
                          fontWeight="600"
                          sx={{ color: "info.800", mb: 1 }}
                        >
                          {nguoiThamDinh.Ten}
                          {nguoiThamDinh.MaNhanVien && (
                            <Chip
                              label={nguoiThamDinh.MaNhanVien}
                              size="small"
                              sx={{
                                ml: 1,
                                bgcolor: "info.100",
                                color: "info.800",
                              }}
                            />
                          )}
                        </Typography>

                        <Stack spacing={1}>
                          {(nguoiThamDinh.TenKhoa ||
                            nguoiThamDinh.Khoa ||
                            nguoiThamDinh.KhoaTen) && (
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ color: "info.700", fontWeight: 600 }}
                              >
                                🏥 Khoa:
                              </Typography>
                              <Chip
                                label={
                                  nguoiThamDinh.TenKhoa ||
                                  nguoiThamDinh.Khoa ||
                                  nguoiThamDinh.KhoaTen
                                }
                                size="small"
                                sx={{
                                  bgcolor: "success.100",
                                  color: "success.800",
                                }}
                              />
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.disabled">
                        Chưa có người thẩm định
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1 }}
                    >
                      📄 Tóm tắt
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        whiteSpace: "pre-line",
                        lineHeight: 1.7,
                        p: 2,
                        bgcolor: "grey.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      {baiBao.TomTat || "Chưa có tóm tắt"}
                    </Typography>
                  </Box>

                  {baiBao.GhiChu && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight="600"
                        sx={{ mb: 1 }}
                      >
                        📝 Ghi chú
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          whiteSpace: "pre-line",
                          lineHeight: 1.7,
                          p: 2,
                          bgcolor: "warning.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "warning.200",
                        }}
                      >
                        {baiBao.GhiChu}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Metadata & Attachments - 1/3 width */}
          <Grid item xs={12} lg={4}>
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                background: "linear-gradient(145deg, #ffffff 0%, #f0f4f8 100%)",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant="h5"
                  gutterBottom
                  fontWeight="700"
                  sx={{
                    color: "secondary.main",
                    mb: 3,
                  }}
                >
                  ℹ️ Thông tin khác
                </Typography>
                <Divider sx={{ mb: 3, borderColor: "secondary.100" }} />

                <Stack spacing={3}>
                  {/* Tệp đính kèm section */}
                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1 }}
                    >
                      📎 Tệp đính kèm
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "primary.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "primary.200",
                      }}
                    >
                      <AttachmentSection
                        ownerType="TapSanBaiBao"
                        ownerId={baiBaoId}
                        field="file"
                      />
                    </Box>
                  </Box>

                  {/* Nguồn tài liệu tham khảo: placed before Ngày tạo */}
                  {baiBao.NguonTaiLieuThamKhao && (
                    <Box>
                      <Typography
                        variant="subtitle1"
                        color="text.secondary"
                        fontWeight="600"
                        sx={{ mb: 1 }}
                      >
                        🔗 Nguồn tài liệu tham khảo
                      </Typography>
                      <Box
                        sx={{
                          p: 2,
                          bgcolor: "grey.50",
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: "grey.200",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{ wordBreak: "break-all" }}
                        >
                          <a
                            href={baiBao.NguonTaiLieuThamKhao}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {baiBao.NguonTaiLieuThamKhao}
                          </a>
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1 }}
                    >
                      📖 Xuất bản trong
                    </Typography>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: "info.50",
                        borderRadius: 2,
                        border: "1px solid",
                        borderColor: "info.200",
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight="600"
                        sx={{ color: "info.800" }}
                      >
                        {tapSan
                          ? tapSan.Loai === "YHTH"
                            ? `Tập san y học thực hành số ${tapSan.SoXuatBan?.toString().padStart(
                                2,
                                "0",
                              )} năm ${tapSan.NamXuatBan}`
                            : `Tập san thông tin thuốc số ${tapSan.SoXuatBan?.toString().padStart(
                                2,
                                "0",
                              )} năm ${tapSan.NamXuatBan}`
                          : "Đang tải thông tin tập san..."}
                      </Typography>
                      {tapSan?.TenTapSan && (
                        <Typography variant="body2" color="text.secondary">
                          {tapSan.TenTapSan}
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1 }}
                    >
                      📅 Ngày tạo
                    </Typography>
                    <Chip
                      label={new Date(baiBao.NgayTao).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>

                  <Box>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      fontWeight="600"
                      sx={{ mb: 1 }}
                    >
                      🔄 Ngày cập nhật
                    </Typography>
                    <Chip
                      label={new Date(baiBao.NgayCapNhat).toLocaleDateString(
                        "vi-VN",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                      color="warning"
                      variant="outlined"
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Snackbar */}
        {SnackbarElement}

        {/* Confirm Delete Dialog */}
        <ConfirmDialog
          open={confirm.open}
          onClose={() => setConfirm({ open: false, loading: false })}
          onConfirm={handleConfirmDelete}
          loading={confirm.loading}
          title="Xác nhận xóa bài báo"
          message="Thao tác này sẽ xóa vĩnh viễn bài báo. Bạn có chắc chắn muốn thực hiện?"
          confirmText="Xóa"
          confirmColor="error"
          severity="warning"
        />
      </Box>
    </Box>
  );
}
