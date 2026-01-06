import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
  Divider,
  IconButton,
  Skeleton,
  Paper,
  Stack,
  Chip,
  TextField,
  Button,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Typography as MuiTypography,
  useMediaQuery,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  Person as PersonIcon,
  CalendarMonth as CalendarIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { useTheme } from "@mui/material/styles";

import useAuth from "hooks/useAuth";
import EmployeeAvatar from "components/EmployeeAvatar";
import {
  getYeuCauDetail,
  updateYeuCau,
  getBinhLuan,
  selectYeuCauDetail,
  selectAvailableActions,
  selectYeuCauState,
  // Action thunks
  tiepNhanYeuCau,
  tuChoiYeuCau,
  dieuPhoiYeuCau,
  guiVeKhoaYeuCau,
  hoanThanhYeuCau,
  danhGiaYeuCau,
  dongYeuCau,
  moLaiYeuCau,
  yeuCauXuLyTiep,
  huyTiepNhanYeuCau,
  doiThoiGianHenYeuCau,
  nhacLaiYeuCau,
  baoQuanLyYeuCau,
  appealYeuCau,
  deleteYeuCau,
  assignRoutineTaskToYeuCau,
  // Master data
  getLyDoTuChoi,
  selectLyDoTuChoiList,
  // History
  getLichSu,
  selectLichSuList,
  selectLichSuLoading,
} from "./yeuCauSlice";
import RoutineTaskCompactButton from "../CongViec/components/RoutineTaskCompactButton";
import YeuCauCommentsSection from "./components/YeuCauCommentsSection";
import {
  fetchMyRoutineTasks,
  fetchAvailableCycles,
  setSelectedCycle,
} from "../CongViec/congViecSlice";
import {
  kiemTraCauHinhKhoa,
  // selectKiemTraResult, // Reserved for future use
  getNhanVienTheoKhoa,
  selectNhanVienTheoKhoa,
} from "./cauHinhKhoaSlice";
import {
  YeuCauStatusChip,
  YeuCauTimeline,
  YeuCauActionButtons,
  YeuCauFormDialog,
  StarRatingDialog,
  DieuPhoiDialog,
  TuChoiDialog,
  TiepNhanDialog,
  MoLaiDialog,
  AppealDialog,
  GuiVeKhoaDialog,
  YeuCauProgressIndicator,
} from "./components";
import {
  formatDateTime,
  getEnhancedDescription,
  getTenNguoi,
} from "./yeuCau.utils";
import { TRANG_THAI, HANH_DONG } from "./yeuCau.constants";

function YeuCauDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const yeuCau = useSelector(selectYeuCauDetail);
  const availableActions = useSelector(selectAvailableActions);
  const { detailLoading, actionLoading, currentAction } =
    useSelector(selectYeuCauState);
  // const cauHinhKhoa = useSelector(selectKiemTraResult); // Reserved for future use
  const nhanVienList = useSelector(selectNhanVienTheoKhoa);
  const lyDoTuChoiList = useSelector(selectLyDoTuChoiList);
  const lichSuList = useSelector(selectLichSuList);
  const lichSuLoading = useSelector(selectLichSuLoading);

  const [openEditDialog, setOpenEditDialog] = useState(false);
  // Dialog states
  const [openDanhGiaDialog, setOpenDanhGiaDialog] = useState(false);
  const [openDieuPhoiDialog, setOpenDieuPhoiDialog] = useState(false);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [openThoiGianHenDialog, setOpenThoiGianHenDialog] = useState(false);
  const [thoiGianHenMoi, setThoiGianHenMoi] = useState("");

  // New dialog states
  const [openTuChoiDialog, setOpenTuChoiDialog] = useState(false);
  const [openTiepNhanDialog, setOpenTiepNhanDialog] = useState(false);
  const [openMoLaiDialog, setOpenMoLaiDialog] = useState(false);
  const [openAppealDialog, setOpenAppealDialog] = useState(false);
  const [openGuiVeKhoaDialog, setOpenGuiVeKhoaDialog] = useState(false);

  // Load yêu cầu chi tiết
  const loadYeuCau = useCallback(() => {
    if (id) {
      dispatch(getYeuCauDetail(id));
      dispatch(getBinhLuan(id)); // Load comments
    }
  }, [dispatch, id]);

  useEffect(() => {
    loadYeuCau();
  }, [loadYeuCau]);

  // Load lý do từ chối
  useEffect(() => {
    dispatch(getLyDoTuChoi());
  }, [dispatch]);

  // Load lịch sử khi có yêu cầu
  useEffect(() => {
    if (id) {
      dispatch(getLichSu(id));
    }
  }, [dispatch, id]);

  // Load cấu hình khoa khi có yêu cầu
  useEffect(() => {
    if (yeuCau?.KhoaDichID?._id) {
      dispatch(kiemTraCauHinhKhoa(yeuCau.KhoaDichID._id));
    }
  }, [dispatch, yeuCau?.KhoaDichID?._id]);

  // Xác định vai trò của user với yêu cầu này
  const nhanVienId = user?.NhanVienID;

  // Kiểm tra vai trò - so sánh đúng _id từ populated object
  const isNguoiGui = yeuCau?.NguoiYeuCauID?._id === nhanVienId;
  const isNguoiXuLy = yeuCau?.NguoiXuLyID?._id === nhanVienId;

  // Có thể chỉnh sửa nếu là người gửi và trạng thái còn mới
  const canEdit = isNguoiGui && yeuCau?.TrangThai === TRANG_THAI.MOI;

  // ============== ROUTINE TASK STATE ==============
  // State cho routine tasks - reuse từ CongViec slice
  const myRoutineTasks = useSelector(
    (state) => state.congViec.myRoutineTasks || []
  );
  const loadingRoutineTasks = useSelector(
    (state) => state.congViec.loadingRoutineTasks
  );
  const availableCycles = useSelector(
    (state) => state.congViec.availableCycles || []
  );
  const selectedCycleId = useSelector(
    (state) => state.congViec.selectedCycleId
  );
  const loadingCycles = useSelector((state) => state.congViec.loadingCycles);

  // Fetch routine tasks và cycles khi load page
  useEffect(() => {
    dispatch(fetchMyRoutineTasks());
    dispatch(fetchAvailableCycles());
  }, [dispatch]);

  // Permission check cho routine task assignment
  const canAssignRoutineTask =
    isNguoiXuLy && ["DANG_XU_LY", "DA_HOAN_THANH"].includes(yeuCau?.TrangThai);

  const handleCycleChange = (newCycleId) => {
    dispatch(setSelectedCycle(newCycleId));
    // ✅ FIX: Pass chuKyId directly to avoid race condition
    dispatch(fetchMyRoutineTasks({ force: true, chuKyId: newCycleId }));
  };

  // Handler gán nhiệm vụ
  const handleAssignRoutineTask = async (
    nvId,
    { isKhac = false, isClear = false } = {}
  ) => {
    if (!canAssignRoutineTask) return;

    try {
      let nhiemVuThuongQuyID = null;
      let flagKhac = false;

      if (nvId) {
        nhiemVuThuongQuyID = nvId;
        flagKhac = false;
      } else if (isKhac) {
        nhiemVuThuongQuyID = null;
        flagKhac = true;
      } else if (isClear) {
        nhiemVuThuongQuyID = null;
        flagKhac = false;
      }

      await dispatch(
        assignRoutineTaskToYeuCau({
          yeuCauId: yeuCau._id,
          nhiemVuThuongQuyID,
          isKhac: flagKhac,
        })
      );

      // Success toast already shown in thunk
    } catch (error) {
      console.error("Error assigning routine task:", error);
    }
  };

  // Xử lý action
  const handleAction = async (action) => {
    switch (action) {
      case HANH_DONG.TIEP_NHAN:
        // Mở dialog tiếp nhận với thời gian hẹn
        setOpenTiepNhanDialog(true);
        break;

      case HANH_DONG.TU_CHOI:
        // Mở dialog từ chối với lý do
        // Ensure rejection reasons are loaded
        if (!lyDoTuChoiList || lyDoTuChoiList.length === 0) {
          dispatch(getLyDoTuChoi());
        }
        setOpenTuChoiDialog(true);
        break;

      case HANH_DONG.DIEU_PHOI:
        // Load danh sách nhân viên khoa
        if (yeuCau?.KhoaDichID?._id) {
          dispatch(getNhanVienTheoKhoa(yeuCau.KhoaDichID._id));
        }
        setOpenDieuPhoiDialog(true);
        break;

      case HANH_DONG.GUI_VE_KHOA:
        setOpenGuiVeKhoaDialog(true);
        break;

      case HANH_DONG.HOAN_THANH:
        await dispatch(hoanThanhYeuCau(id, {}));
        loadYeuCau();
        break;

      case HANH_DONG.HUY_TIEP_NHAN:
        setConfirmAction({
          action,
          title: "Hủy tiếp nhận",
          message:
            "Bạn có chắc chắn muốn hủy tiếp nhận yêu cầu này? Yêu cầu sẽ quay về trạng thái Mới.",
        });
        setOpenConfirmDialog(true);
        break;

      case HANH_DONG.DOI_THOI_GIAN_HEN:
        setThoiGianHenMoi(
          yeuCau?.ThoiGianHen
            ? dayjs(yeuCau.ThoiGianHen).format("YYYY-MM-DDTHH:mm")
            : ""
        );
        setOpenThoiGianHenDialog(true);
        break;

      case HANH_DONG.DANH_GIA:
        setOpenDanhGiaDialog(true);
        break;

      case HANH_DONG.DONG:
        await dispatch(dongYeuCau(id, {}));
        loadYeuCau();
        break;

      case HANH_DONG.YEU_CAU_XU_LY_TIEP:
        setConfirmAction({
          action,
          title: "Yêu cầu xử lý tiếp",
          message: "Bạn có chắc chắn muốn yêu cầu xử lý tiếp?",
        });
        setOpenConfirmDialog(true);
        break;

      case HANH_DONG.MO_LAI:
        // Mở dialog mở lại với lý do
        setOpenMoLaiDialog(true);
        break;

      case HANH_DONG.NHAC_LAI:
        await dispatch(nhacLaiYeuCau(id, {}));
        loadYeuCau();
        break;

      case HANH_DONG.BAO_QUAN_LY:
        setConfirmAction({
          action,
          title: "Báo quản lý",
          message: "Bạn có chắc chắn muốn báo cáo lên quản lý?",
        });
        setOpenConfirmDialog(true);
        break;

      case HANH_DONG.APPEAL:
        // Mở dialog khiếu nại với lý do
        setOpenAppealDialog(true);
        break;

      case HANH_DONG.XOA:
        setConfirmAction({
          action,
          title: "Xóa yêu cầu",
          message:
            "Bạn có chắc chắn muốn xóa yêu cầu này? Hành động này không thể hoàn tác.",
        });
        setOpenConfirmDialog(true);
        break;

      case HANH_DONG.SUA:
        setOpenEditDialog(true);
        break;

      default:
        console.warn("Unhandled action:", action);
    }
  };

  // Xử lý confirm action (cho các action không cần dialog phức tạp)
  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    switch (confirmAction.action) {
      case HANH_DONG.HUY_TIEP_NHAN:
        await dispatch(huyTiepNhanYeuCau(id, {}));
        break;
      case HANH_DONG.YEU_CAU_XU_LY_TIEP:
        await dispatch(yeuCauXuLyTiep(id, {}));
        break;
      case HANH_DONG.BAO_QUAN_LY:
        await dispatch(baoQuanLyYeuCau(id, {}));
        break;
      case HANH_DONG.XOA:
        await dispatch(deleteYeuCau(id));
        navigate("/yeu-cau");
        return;
      default:
        break;
    }

    setOpenConfirmDialog(false);
    setConfirmAction(null);
    loadYeuCau();
  };

  // Xử lý đánh giá
  const handleDanhGia = async (data) => {
    await dispatch(danhGiaYeuCau(id, data));
    setOpenDanhGiaDialog(false);
    loadYeuCau();
  };

  // Xử lý điều phối
  const handleDieuPhoi = async (data) => {
    await dispatch(dieuPhoiYeuCau(id, data));
    setOpenDieuPhoiDialog(false);
    loadYeuCau();
  };

  // Xử lý gửi về khoa điều phối lại
  const handleGuiVeKhoa = async (data) => {
    await dispatch(guiVeKhoaYeuCau(id, data));
    setOpenGuiVeKhoaDialog(false);
    loadYeuCau();
  };

  // Xử lý từ chối (với lý do)
  const handleTuChoi = async (data) => {
    await dispatch(tuChoiYeuCau(id, data));
    setOpenTuChoiDialog(false);
    loadYeuCau();
  };

  // Xử lý tiếp nhận (với thời gian hẹn)
  const handleTiepNhan = async (data) => {
    await dispatch(tiepNhanYeuCau(id, data));
    setOpenTiepNhanDialog(false);
    loadYeuCau();
  };

  // Xử lý mở lại (với lý do)
  const handleMoLai = async (data) => {
    await dispatch(moLaiYeuCau(id, data));
    setOpenMoLaiDialog(false);
    loadYeuCau();
  };

  // Xử lý khiếu nại (với lý do)
  const handleAppeal = async (data) => {
    await dispatch(appealYeuCau(id, data));
    setOpenAppealDialog(false);
    loadYeuCau();
  };

  // Xử lý đổi thời gian hẹn
  const handleDoiThoiGianHen = async () => {
    if (!thoiGianHenMoi) return;
    await dispatch(doiThoiGianHenYeuCau(id, { ThoiGianHen: thoiGianHenMoi }));
    setOpenThoiGianHenDialog(false);
    loadYeuCau();
  };

  // Xử lý sau khi cập nhật thành công
  const handleUpdateSuccess = async (data) => {
    await dispatch(updateYeuCau({ id, data }));
    setOpenEditDialog(false);
    loadYeuCau();
  };

  if (detailLoading && !yeuCau) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={400} />
      </Container>
    );
  }

  if (!yeuCau) {
    return (
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary">
            Không tìm thấy yêu cầu
          </Typography>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate("/yeu-cau")}
            sx={{ mt: 2 }}
          >
            Quay lại danh sách
          </Button>
        </Paper>
      </Container>
    );
  }

  const getLatestHistoryItems = (items = []) => {
    if (!items || items.length === 0) return [];
    if (items.length <= 2) return items;

    const firstTime = new Date(items[0]?.ThoiGian || 0).getTime();
    const lastTime = new Date(items[items.length - 1]?.ThoiGian || 0).getTime();

    // If ascending (oldest -> newest), take last 2 and reverse to show newest first
    if (firstTime <= lastTime) {
      return items.slice(-2).reverse();
    }

    // Otherwise assume descending (newest -> oldest)
    return items.slice(0, 2);
  };

  const latestHistoryItems = getLatestHistoryItems(lichSuList);

  return (
    <Container
      maxWidth="lg"
      sx={{ py: { xs: 1, md: 3 }, px: { xs: 0, md: 3 } }}
    >
      {/* Sticky blue request toolbar (mobile-first) */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: (t) => t.zIndex.appBar,
          mb: 2,
          borderRadius: { xs: 0, md: 2 },
          bgcolor: "primary.main",
          color: "primary.contrastText",
          px: 1.5,
          py: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={() => navigate("/yeu-cau")}
            size="small"
            sx={{ color: "inherit" }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant={isMobile ? "subtitle1" : "h6"}
              sx={{ color: "inherit" }}
              noWrap
            >
              Yêu cầu #{yeuCau.MaYeuCau}
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "inherit", opacity: 0.9 }}
              noWrap
            >
              {yeuCau.TieuDe}
            </Typography>
          </Box>

          <Stack direction="row" alignItems="center" spacing={0.5}>
            <YeuCauStatusChip trangThai={yeuCau.TrangThai} size="small" />
            {canEdit && (
              <IconButton
                onClick={() => setOpenEditDialog(true)}
                size="small"
                sx={{ color: "inherit" }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Progress Indicator with SLA tracking */}
      <Box sx={{ mb: 2, mx: { xs: 2, md: 0 } }}>
        <YeuCauProgressIndicator yeuCau={yeuCau} />
      </Box>

      {/* Card thao tác - hiển thị ngay sau toolbar (Desktop only) */}
      {availableActions.length > 0 && (
        <Card
          sx={{
            mb: 2,
            mx: { xs: 0, md: 0 },
            borderRadius: { xs: 0, md: 1 },
            display: { xs: "none", md: "block" }, // Hidden on mobile (use sticky bar instead)
          }}
        >
          <CardHeader
            title="Thao tác"
            titleTypographyProps={{ variant: "subtitle1" }}
          />
          <Divider />
          <CardContent
            sx={{ pb: 2, "&:last-child": { pb: 2 }, overflow: "hidden" }}
          >
            <YeuCauActionButtons
              availableActions={availableActions}
              onAction={handleAction}
              loading={actionLoading}
              loadingAction={currentAction}
              variant="scroll"
              size="small"
            />
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Cột chính - Nội dung */}
        <Grid item xs={12} md={8}>
          {/* Thông tin yêu cầu */}
          <Card sx={{ mb: 3 }}>
            <CardHeader
              title={yeuCau.TieuDe}
              titleTypographyProps={{ variant: "h6" }}
            />
            <Divider />
            <CardContent>
              <Typography
                variant="body1"
                sx={{ whiteSpace: "pre-wrap", mb: 2 }}
              >
                {yeuCau.MoTa}
              </Typography>

              {/* Danh mục & Thời hạn */}
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 2 }}>
                {(yeuCau.DanhMucYeuCauID || yeuCau.SnapshotDanhMuc) && (
                  <Chip
                    icon={<CategoryIcon />}
                    label={
                      yeuCau.DanhMucYeuCauID?.TenLoaiYeuCau ||
                      yeuCau.SnapshotDanhMuc?.TenLoaiYeuCau
                    }
                    variant="outlined"
                    size="small"
                  />
                )}
                {yeuCau.ThoiGianHen && (
                  <Chip
                    icon={<CalendarIcon />}
                    label={`Hạn: ${dayjs(yeuCau.ThoiGianHen).format(
                      "DD/MM/YYYY HH:mm"
                    )}`}
                    variant="outlined"
                    size="small"
                    color={
                      dayjs(yeuCau.ThoiGianHen).isBefore(dayjs())
                        ? "error"
                        : "default"
                    }
                  />
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* Bình luận */}
          <Card>
            <CardHeader title={`Bình luận (${yeuCau.BinhLuan?.length || 0})`} />
            <Divider />
            <CardContent>
              <YeuCauCommentsSection
                yeuCauId={yeuCau._id}
                user={user}
                theme={theme}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Cột phụ - Thông tin & Actions */}
        <Grid item xs={12} md={4}>
          {/* Thông tin người liên quan */}
          <Card sx={{ mb: 3 }}>
            <CardHeader title="Thông tin" />
            <Divider />
            <CardContent>
              <Stack spacing={2}>
                {/* Người gửi */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Người gửi
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <EmployeeAvatar
                      size="sm"
                      nhanVienId={
                        yeuCau.NguoiYeuCauID?._id || yeuCau.NguoiYeuCauID
                      }
                      name={
                        yeuCau.NguoiYeuCauID?.HoTen || yeuCau.NguoiYeuCauID?.Ten
                      }
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {yeuCau.NguoiYeuCauID?.Ten}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {yeuCau.KhoaNguonID?.TenKhoa}
                      </Typography>
                    </Box>
                    {isNguoiGui && (
                      <Chip label="Bạn" size="small" color="primary" />
                    )}
                  </Box>
                </Box>

                {/* Người nhận / Người xử lý */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {yeuCau.NguoiXuLyID ? "Người xử lý" : "Khoa tiếp nhận"}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {yeuCau.NguoiXuLyID?._id || yeuCau.NguoiXuLyID ? (
                      <EmployeeAvatar
                        size="sm"
                        nhanVienId={
                          yeuCau.NguoiXuLyID?._id || yeuCau.NguoiXuLyID
                        }
                        name={
                          yeuCau.NguoiXuLyID?.HoTen || yeuCau.NguoiXuLyID?.Ten
                        }
                      />
                    ) : (
                      <Avatar sx={{ width: 32, height: 32 }}>
                        <PersonIcon fontSize="small" />
                      </Avatar>
                    )}
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {yeuCau.NguoiXuLyID?.Ten
                          ? yeuCau.NguoiXuLyID.Ten
                          : yeuCau.KhoaDichID?.TenKhoa}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {yeuCau.KhoaDichID?.TenKhoa}
                      </Typography>
                    </Box>
                    {isNguoiXuLy && (
                      <Chip label="Bạn" size="small" color="secondary" />
                    )}
                  </Box>
                </Box>

                <Divider />

                {/* Thống kê thời gian */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Thời gian
                  </Typography>
                  <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                    <Typography variant="body2">
                      Tạo: {formatDateTime(yeuCau.createdAt)}
                    </Typography>
                    {yeuCau.NgayTiepNhan && (
                      <Typography variant="body2">
                        Tiếp nhận: {formatDateTime(yeuCau.NgayTiepNhan)}
                      </Typography>
                    )}
                    {yeuCau.NgayHoanThanh && (
                      <Typography variant="body2">
                        Hoàn thành: {formatDateTime(yeuCau.NgayHoanThanh)}
                      </Typography>
                    )}
                    {yeuCau.NgayDong && (
                      <Typography variant="body2">
                        Đóng: {formatDateTime(yeuCau.NgayDong)}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          {/* ✅ NEW: Routine Task Assignment Card */}
          {canAssignRoutineTask && (
            <Card sx={{ mb: 3 }}>
              <CardHeader
                title="Nhiệm vụ thường quy"
                titleTypographyProps={{ variant: "h6" }}
              />
              <Divider />
              <CardContent>
                <RoutineTaskCompactButton
                  congViecDetail={{
                    ...yeuCau,
                    _id: yeuCau._id,
                    NhiemVuThuongQuyID: yeuCau.NhiemVuThuongQuyID,
                    FlagNVTQKhac: yeuCau.LaNhiemVuKhac,
                    updatedAt: yeuCau.updatedAt,
                  }}
                  myRoutineTasks={myRoutineTasks}
                  loadingRoutineTasks={loadingRoutineTasks}
                  myRoutineTasksError={null}
                  isMain={true}
                  handleSelectRoutine={handleAssignRoutineTask}
                  dispatch={dispatch}
                  fetchMyRoutineTasks={fetchMyRoutineTasks}
                  embedded={true}
                  availableCycles={availableCycles}
                  selectedCycleId={selectedCycleId}
                  onCycleChange={handleCycleChange}
                  loadingCycles={loadingCycles}
                />
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Lịch sử xử lý - chiếm full width */}
      <Card sx={{ mt: 3 }}>
        <Accordion defaultExpanded={false} disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              px: 2,
              py: 1,
              "& .MuiAccordionSummary-content": { my: 0 },
            }}
          >
            <Stack spacing={0.25} sx={{ width: "100%" }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography variant="subtitle1">Lịch sử xử lý</Typography>
                <MuiTypography variant="caption" color="text.secondary">
                  {lichSuList?.length || 0} mục
                </MuiTypography>
              </Stack>

              {latestHistoryItems.length > 0 ? (
                <Stack spacing={0.25}>
                  {latestHistoryItems.map((it, idx) => (
                    <MuiTypography
                      key={it._id || idx}
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {formatDateTime(it.ThoiGian)} •{" "}
                      {getTenNguoi(it.NguoiThucHienID)}
                      {" • "}
                      {getEnhancedDescription(it)}
                      {it?.GhiChu ? ` — ${it.GhiChu}` : ""}
                    </MuiTypography>
                  ))}
                </Stack>
              ) : (
                <MuiTypography variant="caption" color="text.secondary">
                  Chưa có lịch sử
                </MuiTypography>
              )}
            </Stack>
          </AccordionSummary>
          <AccordionDetails sx={{ px: 2, pb: 2 }}>
            <Divider sx={{ mb: 2 }} />
            <YeuCauTimeline lichSu={lichSuList} loading={lichSuLoading} />
          </AccordionDetails>
        </Accordion>
      </Card>

      {/* Edit Dialog */}
      <YeuCauFormDialog
        open={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        yeuCau={yeuCau}
        onSubmit={handleUpdateSuccess}
        mode="edit"
      />

      {/* Đánh giá Dialog */}
      <StarRatingDialog
        open={openDanhGiaDialog}
        onClose={() => setOpenDanhGiaDialog(false)}
        onSubmit={handleDanhGia}
        loading={actionLoading}
        title="Đánh giá yêu cầu"
      />

      {/* Điều phối Dialog */}
      <DieuPhoiDialog
        open={openDieuPhoiDialog}
        onClose={() => setOpenDieuPhoiDialog(false)}
        onSubmit={handleDieuPhoi}
        nhanVienList={nhanVienList}
        loading={actionLoading}
        yeuCau={yeuCau}
      />

      {/* Từ chối Dialog */}
      <TuChoiDialog
        open={openTuChoiDialog}
        onClose={() => setOpenTuChoiDialog(false)}
        onSubmit={handleTuChoi}
        loading={actionLoading}
        yeuCau={yeuCau}
        lyDoList={lyDoTuChoiList}
      />

      {/* Tiếp nhận Dialog */}
      <TiepNhanDialog
        open={openTiepNhanDialog}
        onClose={() => setOpenTiepNhanDialog(false)}
        onSubmit={handleTiepNhan}
        loading={actionLoading}
        yeuCau={yeuCau}
      />

      {/* Mở lại Dialog */}
      <MoLaiDialog
        open={openMoLaiDialog}
        onClose={() => setOpenMoLaiDialog(false)}
        onSubmit={handleMoLai}
        loading={actionLoading}
        yeuCau={yeuCau}
      />

      {/* Khiếu nại Dialog */}
      <AppealDialog
        open={openAppealDialog}
        onClose={() => setOpenAppealDialog(false)}
        onSubmit={handleAppeal}
        loading={actionLoading}
        yeuCau={yeuCau}
      />

      {/* Confirm Dialog */}
      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>{confirmAction?.title || "Xác nhận"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirmAction?.message ||
              "Bạn có chắc chắn muốn thực hiện hành động này?"}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmAction}
            color={
              confirmAction?.action === HANH_DONG.XOA ? "error" : "primary"
            }
            variant="contained"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>

      {/* Đổi thời gian hẹn Dialog */}
      <Dialog
        open={openThoiGianHenDialog}
        onClose={() => setOpenThoiGianHenDialog(false)}
      >
        <DialogTitle>Đổi thời gian hẹn</DialogTitle>
        <DialogContent>
          <TextField
            type="datetime-local"
            value={thoiGianHenMoi}
            onChange={(e) => setThoiGianHenMoi(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            label="Thời gian hẹn mới"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenThoiGianHenDialog(false)}>Hủy</Button>
          <Button
            onClick={handleDoiThoiGianHen}
            color="primary"
            variant="contained"
            disabled={!thoiGianHenMoi}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Gửi về khoa Dialog */}
      <GuiVeKhoaDialog
        open={openGuiVeKhoaDialog}
        onClose={() => setOpenGuiVeKhoaDialog(false)}
        onSubmit={handleGuiVeKhoa}
        isLoading={actionLoading && currentAction === HANH_DONG.GUI_VE_KHOA}
      />

      {/* Sticky Action Bar - Mobile Only */}
      {availableActions.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
            p: 2,
            zIndex: 1000,
            display: { xs: "block", md: "none" }, // Only on mobile
            boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
          }}
        >
          <YeuCauActionButtons
            availableActions={availableActions}
            onAction={handleAction}
            loading={actionLoading}
            loadingAction={currentAction}
            orientation="vertical"
          />
        </Box>
      )}

      {/* Spacer for sticky action bar on mobile */}
      {availableActions.length > 0 && (
        <Box sx={{ display: { xs: "block", md: "none" }, height: 200 }} />
      )}
    </Container>
  );
}

export default YeuCauDetailPage;
