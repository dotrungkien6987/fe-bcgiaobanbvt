import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  DialogContentText,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Slider,
  TextField,
  useTheme,
  useMediaQuery,
  Autocomplete,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import WarningConfigBlock from "./components/WarningConfigBlock";
import MetricsBlock from "./components/MetricsBlock";
import HistoryAccordion from "./components/HistoryAccordion";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  CheckCircle as CheckCircleIcon,
  Palette as PaletteIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  formatDateTime,
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
  DUE_LABEL_MAP,
  getExtendedDueStatus,
  EXT_DUE_LABEL_MAP,
  computeSoGioTre,
} from "../../../utils/congViecUtils";
import {
  getCongViecDetail,
  recallComment,
  recallCommentText,
  addReply,
  fetchReplies,
  updateCongViec,
  markCommentFileDeleted,
  transitionCongViec,
  ACTION_META,
  getAvailableActions,
  fetchMyRoutineTasks,
} from "./congViecSlice";
import {
  fetchFilesByTask,
  uploadFilesForTask,
  deleteFile as deleteFileThunk,
  countFilesByTask,
  createCommentWithFiles,
} from "./QuanLyTepTin/quanLyTepTinSlice";
import useAuth from "hooks/useAuth";
import CommentComposer from "./components/CommentComposer";
import CommentsList from "./components/CommentsList";
import FilesSidebar from "./components/FilesSidebar";
import TaskMetaSidebar from "./components/TaskMetaSidebar";
import ColorLegendDialog from "./components/ColorLegendDialog";
import AdminColorSettingsDialog from "./components/AdminColorSettingsDialog";
import { fetchColorConfig } from "./colorConfigSlice";
import useFilePreview from "./hooks/useFilePreview";

// extend dayjs plugins after imports
dayjs.extend(relativeTime);

// ---- Helpers ----
const formatRel = (d) =>
  d ? `${dayjs(d).format("DD/MM/YYYY HH:mm")} · ${dayjs(d).fromNow()}` : "—";
const deriveDueInfo = (cv) => {
  if (!cv) return { extDue: null, soGioTre: 0, hoursLeft: null };
  const extDue = getExtendedDueStatus(cv);
  const rawTre =
    typeof cv.SoGioTre === "number" && cv.SoGioTre >= 0
      ? cv.SoGioTre
      : computeSoGioTre(cv);
  const hetHan = cv.NgayHetHan ? dayjs(cv.NgayHetHan) : null;
  const now = dayjs();
  const finished = ["HOAN_THANH", "CHO_DUYET"].includes(cv.TrangThai);
  const hoursLeft = hetHan && !finished ? hetHan.diff(now, "hour", true) : null;
  return { extDue, soGioTre: Number(rawTre.toFixed(2)), hoursLeft };
};

const CongViecDetailDialog = ({ open, onClose, congViecId, onEdit }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const { user } = useAuth();
  console.log("User:", user);
  const { congViecDetail, loading, error } = useSelector(
    (state) => state.congViec
  );
  const { myRoutineTasks } = useSelector((s) => s.congViec);
  const versionConflict = useSelector((s) => s.congViec.versionConflict);
  const statusOverrides = useSelector((s) => s.colorConfig?.statusColors);
  const priorityOverrides = useSelector((s) => s.colorConfig?.priorityColors);
  const repliesByParent = useSelector(
    (state) => state.congViec?.repliesByParent || {}
  );

  // Files state from Redux for this task
  const filesState = useSelector(
    (state) =>
      state.quanLyTepTin?.byTask?.[congViecId] || {
        items: [],
        total: 0,
        loading: false,
      }
  );
  const fileCount = useSelector(
    (state) => state.quanLyTepTin?.counts?.[congViecId] || 0
  );

  // Local UI state for comments and drag/drop
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragCommentActive, setDragCommentActive] = useState(false);
  const [dragSidebarActive, setDragSidebarActive] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [colorLegendOpen, setColorLegendOpen] = useState(false);
  const [adminColorsOpen, setAdminColorsOpen] = useState(false);
  // Quick edit local state
  // const [quickStatus, setQuickStatus] = useState("");
  const [quickProgress, setQuickProgress] = useState(0);
  const [actionLoading, setActionLoading] = useState(null); // unified action key
  const [confirm, setConfirm] = useState(null); // action key waiting confirm

  // helpers moved into child components

  const { handleViewFile, handleDownloadFile } = useFilePreview();

  useEffect(() => {
    if (open && congViecId) {
      dispatch(getCongViecDetail(congViecId));
      dispatch(fetchFilesByTask(congViecId));
      dispatch(countFilesByTask(congViecId));
      dispatch(fetchColorConfig());
      dispatch(fetchMyRoutineTasks());
    }
  }, [open, congViecId, dispatch]);

  // When version conflict occurs, auto-refetch newest detail in background so user can choose refresh.
  useEffect(() => {
    if (versionConflict?.id === congViecId) {
      // silent refresh detail
      dispatch(getCongViecDetail(congViecId));
    }
  }, [versionConflict, congViecId, dispatch]);

  // Sync quick-edit progress when detail loads/changes
  useEffect(() => {
    if (!congViecDetail) return;
    const p =
      typeof congViecDetail.PhanTramTienDoTong === "number"
        ? congViecDetail.PhanTramTienDoTong
        : typeof congViecDetail.TienDo === "number"
        ? congViecDetail.TienDo
        : 0;
    setQuickProgress(Math.max(0, Math.min(100, Math.round(p))));
  }, [congViecDetail]);

  const handleAddComment = async () => {
    // Cho phép gửi bình luận chỉ có tệp đính kèm (không bắt buộc nhập chữ)
    if (!newComment.trim() && pendingFiles.length === 0) return;

    setSubmittingComment(true);
    try {
      await dispatch(
        createCommentWithFiles(
          congViecId,
          { noiDung: newComment },
          pendingFiles
        )
      );
      setNewComment("");
      setPendingFiles([]);
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Deprecated: trực tiếp đổi trạng thái (đã thay bằng flow buttons)
  // const handleStatusChange = async (newStatus) => { ... };

  // Hidden: chỉnh trực tiếp trạng thái qua Select
  // const handleQuickStatusChange = async (e) => { ... };

  const handleProgressChange = (e, val) => {
    setQuickProgress(Array.isArray(val) ? val[0] : val);
  };

  const handleProgressInputChange = (e) => {
    const v = e.target.value === "" ? 0 : Number(e.target.value);
    if (Number.isNaN(v)) return;
    setQuickProgress(Math.max(0, Math.min(100, v)));
  };

  const commitProgressUpdate = async (value) => {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    try {
      await dispatch(
        updateCongViec({ id: congViecId, data: { PhanTramTienDoTong: v } })
      );
    } catch (err) {
      // revert on error
      const current =
        congViecDetail?.PhanTramTienDoTong ?? congViecDetail?.TienDo ?? 0;
      setQuickProgress(Math.max(0, Math.min(100, Math.round(current))));
    }
  };

  // Routine task selection (single-select) UI (minimal placeholder)
  const handleSelectRoutine = async (nvId) => {
    if (!isMain) return;
    try {
      const payload = nvId
        ? { NhiemVuThuongQuyID: nvId, FlagNVTQKhac: false }
        : { NhiemVuThuongQuyID: null, FlagNVTQKhac: true }; // treat null as 'Khác'
      await dispatch(
        updateCongViec({
          id: congViecId,
          data: { ...payload, expectedVersion: congViecDetail?.updatedAt },
        })
      );
    } catch (e) {
      /* ignore */
    }
  };

  // Version conflict dialog UI
  const showConflict = versionConflict && versionConflict.id === congViecId;
  const handleResolveConflict = () => {
    dispatch({ type: "congViec/clearVersionConflict" });
  };

  // Drag & Drop + Paste for FilesSidebar (tệp của công việc)
  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleSidebarDragOver = (e) => {
    preventDefaults(e);
    setDragSidebarActive(true);
  };

  const handleSidebarDragEnter = (e) => {
    preventDefaults(e);
    setDragSidebarActive(true);
  };

  const handleSidebarDragLeave = (e) => {
    preventDefaults(e);
    setDragSidebarActive(false);
  };

  const handleSidebarDrop = async (e) => {
    preventDefaults(e);
    const dt = e.dataTransfer;
    const files = Array.from(dt?.files || []);
    setDragSidebarActive(false);
    if (!files.length) return;
    try {
      await dispatch(uploadFilesForTask(congViecId, files));
    } catch (err) {
      console.error("Upload via drop failed:", err);
    }
  };

  const handleSidebarPaste = async (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const files = items
      .map((it) => (it.kind === "file" ? it.getAsFile() : null))
      .filter(Boolean);
    if (!files.length) return;
    try {
      await dispatch(uploadFilesForTask(congViecId, files));
    } catch (err) {
      console.error("Upload via paste failed:", err);
    }
  };

  // Số lượng phản hồi ban đầu theo từng bình luận (nếu BE trả về)
  const initialReplyCounts = React.useMemo(() => {
    const list = congViecDetail?.BinhLuans || [];
    const map = {};
    list.forEach((c) => {
      const id = c?._id;
      const count =
        c?.SoLuongPhanHoi ?? c?.RepliesCount ?? c?.SoLuongTraLoi ?? 0;
      if (id) map[id] = count;
    });
    return map;
  }, [congViecDetail?.BinhLuans]);

  // Danh sách người phối hợp (cooperators) – tính trước early return để không vi phạm rule of hooks
  const cooperators = React.useMemo(() => {
    const cv = congViecDetail || {};
    const candidates =
      cv?.NguoiThamGia || // BE field: array of { NhanVienID: populated object, VaiTro: string }
      cv?.NguoiPhoiHop ||
      cv?.DanhSachNguoiPhoiHop ||
      cv?.PhoiHops ||
      cv?.NguoiThamGiaPhoiHop ||
      [];
    const arr = Array.isArray(candidates) ? candidates : [];
    const norm = arr
      .filter((u) => u?.role === "PHOI_HOP" || u?.VaiTro === "PHOI_HOP") // Chỉ lấy người có role PHOI_HOP
      .map((u) => {
        // Handle BE structure: u.NhanVienID is populated object
        const nhanvien = u?.NhanVienID || u;
        return {
          id:
            nhanvien?._id ||
            nhanvien?.UserID ||
            nhanvien?.Id ||
            nhanvien?.id ||
            u?._id,
          name:
            nhanvien?.Ten ||
            nhanvien?.HoTen ||
            nhanvien?.name ||
            nhanvien?.FullName ||
            "Người dùng",
          email: nhanvien?.Email || nhanvien?.email || undefined,
          avatarUrl: nhanvien?.AnhDaiDien || nhanvien?.avatarUrl || undefined,
        };
      })
      .filter((u) => u.id);
    const seen = new Set();
    return norm.filter((u) =>
      seen.has(u.id) ? false : (seen.add(u.id), true)
    );
  }, [congViecDetail]);

  const congViec = useMemo(() => congViecDetail || {}, [congViecDetail]);
  // Determine permission (BE field names may differ; adjust if needed)
  const currentUserId = user?._id || user?.id;
  // Determine roles using multiple possible fields (NhanVienID, NhanVien?._id) rồi fallback user id
  const nhanVienObjId = user?.NhanVien?._id;
  const currentNhanVienId = user?.NhanVienID || nhanVienObjId || currentUserId;
  const congViecNguoiChinhId =
    typeof congViec?.NguoiChinhID === "object"
      ? congViec?.NguoiChinhID?._id || congViec?.NguoiChinhID?.id
      : congViec?.NguoiChinhID;
  const isMain = !!(
    currentNhanVienId &&
    congViecNguoiChinhId &&
    String(congViecNguoiChinhId) === String(currentNhanVienId)
  );
  const isAssigner = !!(
    currentNhanVienId &&
    (String(congViec?.NguoiGiaoViecID) === String(currentNhanVienId) ||
      congViec?.NguoiGiaoViecID?._id === currentNhanVienId)
  );
  const canEditProgress = congViec.TrangThai === "DANG_THUC_HIEN" && isMain;
  const availableActions = useMemo(
    () => getAvailableActions(congViec, { isAssigner, isMain }),
    [congViec, isAssigner, isMain]
  );

  // (Removed countdown interval; extended due status now recalculated on detail refetch.)
  // Derived due status + timing metrics
  // Recompute when congViec changes or countdown tick updates
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { extDue, soGioTre, hoursLeft } = useMemo(
    () => deriveDueInfo(congViec),
    // dueTick intentionally triggers re-render via state change; deriveDueInfo only depends on congViec
    [congViec]
  );
  const dueChips = useMemo(() => {
    if (!congViec) return [];
    const arr = [];
    if (extDue) {
      arr.push({
        key: "extDue",
        label: EXT_DUE_LABEL_MAP[extDue] || DUE_LABEL_MAP[extDue] || extDue,
        color:
          theme.palette.mode === "dark"
            ? theme.palette.grey[700]
            : theme.palette.grey[600],
      });
    }
    if (typeof hoursLeft === "number") {
      const h = hoursLeft;
      arr.push({
        key: "countdown",
        label:
          h >= 0 ? `Còn ${h.toFixed(1)}h` : `Quá ${Math.abs(h).toFixed(1)}h`,
        color: h >= 0 ? theme.palette.info.main : theme.palette.error.dark,
      });
    } else if (soGioTre > 0) {
      arr.push({
        key: "lateHours",
        label: `Trễ ${soGioTre}h`,
        color: theme.palette.error.dark,
      });
    }
    if (congViec.CoDuyetHoanThanh) {
      arr.push({
        key: "approval",
        label: congViec.DaDuocDuyetHoanThanh
          ? "Đã duyệt hoàn thành"
          : "Y/c duyệt",
        color: congViec.DaDuocDuyetHoanThanh
          ? theme.palette.success.main
          : theme.palette.warning.main,
      });
    }
    return arr;
  }, [extDue, hoursLeft, soGioTre, congViec, theme.palette]);

  if (!congViecDetail && !loading) return null;

  // Unified transition handlers
  const buildConfirmTexts = (action) => {
    switch (action) {
      case "GIAO_VIEC":
        return {
          title: "Giao việc?",
          desc: "Xác nhận giao công việc cho người thực hiện chính.",
        };
      case "HUY_GIAO":
        return {
          title: "Hủy giao?",
          desc: "Công việc sẽ quay lại trạng thái Tạo mới.",
        };
      case "TIEP_NHAN":
        return {
          title: "Tiếp nhận?",
          desc: "Công việc chuyển sang Đang thực hiện.",
        };
      case "HOAN_THANH_TAM":
        return {
          title: "Hoàn thành (chờ duyệt)?",
          desc: "Công việc chuyển sang Chờ duyệt.",
        };
      case "HUY_HOAN_THANH_TAM":
        return {
          title: "Hủy hoàn thành tạm?",
          desc: "Quay lại Đang thực hiện.",
        };
      case "DUYET_HOAN_THANH":
        return {
          title: "Duyệt hoàn thành?",
          desc: "Công việc sẽ đánh dấu Hoàn thành.",
        };
      case "HOAN_THANH":
        return {
          title: "Hoàn thành?",
          desc: "Công việc sẽ đánh dấu Hoàn thành.",
        };
      case "MO_LAI_HOAN_THANH":
        return {
          title: "Mở lại công việc?",
          desc: "Công việc quay về Đang thực hiện.",
        };
      default:
        return { title: "Xác nhận?", desc: "Thực hiện hành động." };
    }
  };
  const triggerAction = (action) => {
    const meta = ACTION_META[action];
    if (meta?.confirm) setConfirm(action);
    else executeAction(action);
  };
  const executeAction = async (action) => {
    setActionLoading(action);
    try {
      await dispatch(transitionCongViec({ id: congViecId, action }));
      await dispatch(getCongViecDetail(congViecId));
    } finally {
      setActionLoading(null);
      setConfirm(null);
    }
  };

  // --- Warning Config & Metrics blocks ---

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={fullScreen}
      PaperProps={{
        sx: { minHeight: "80vh" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            component="div"
            sx={{ fontWeight: 700, mb: 1 }}
          >
            {congViec?.MaCongViec || "Công việc"}
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Trạng thái:
              </Typography>
              <Chip
                label={getStatusText(congViec.TrangThai) || "Tạo mới"}
                size="small"
                sx={{
                  backgroundColor: getStatusColor(
                    congViec.TrangThai,
                    statusOverrides
                  ),
                  color: "white",
                  fontWeight: 600,
                }}
              />
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500 }}
              >
                Ưu tiên:
              </Typography>
              <Chip
                icon={<FlagIcon />}
                label={getPriorityText(congViec.MucDoUuTien) || "Bình thường"}
                size="small"
                sx={{
                  backgroundColor: getPriorityColor(
                    congViec.MucDoUuTien,
                    priorityOverrides
                  ),
                  color: "white",
                  fontWeight: 600,
                  "& .MuiChip-icon": {
                    color: "white",
                  },
                }}
              />
            </Box>
            {dueChips.map((c) => (
              <Chip
                key={c.key}
                label={c.label}
                size="small"
                sx={{
                  fontWeight: 700,
                  backgroundColor: c.color,
                  color: theme.palette.getContrastText(c.color),
                }}
              />
            ))}
          </Box>
        </Box>
        <Box>
          <Tooltip title="Ghi chú màu sắc">
            <IconButton
              onClick={() => setColorLegendOpen(true)}
              size="small"
              sx={{ mr: 1 }}
            >
              <PaletteIcon />
            </IconButton>
          </Tooltip>
          {user?.PhanQuyen === "admin" && (
            <Tooltip title="Thiết lập màu (Admin)">
              <IconButton
                onClick={() => setAdminColorsOpen(true)}
                size="small"
                sx={{ mr: 1 }}
              >
                <TuneIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Chỉnh sửa">
            <IconButton
              onClick={() => onEdit(congViec)}
              size="small"
              sx={{ mr: 1 }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 0 }}>
        {/* Routine task selector (single-select) */}
        {congViecDetail && (
          <Box
            sx={{ p: 2, borderBottom: `1px dashed ${theme.palette.divider}` }}
          >
            <Typography variant="subtitle2" gutterBottom>
              Nhiệm vụ thường quy
            </Typography>
            {(() => {
              const THRESHOLD = 12;
              const list = myRoutineTasks || [];
              const showAutocomplete = list.length > THRESHOLD && isMain;
              if (showAutocomplete) {
                const khacOption = { _id: "__KHAC__", Ten: "Khác" };
                const options = [...list, khacOption];
                const currentValue = congViecDetail.FlagNVTQKhac
                  ? khacOption
                  : options.find(
                      (o) => o._id === congViecDetail.NhiemVuThuongQuyID
                    ) || null;
                return (
                  <Autocomplete
                    size="small"
                    options={options}
                    value={currentValue}
                    getOptionLabel={(o) => o?.Ten || ""}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Chọn nhiệm vụ"
                        placeholder="Gõ để tìm..."
                      />
                    )}
                    sx={{ maxWidth: 360, mb: 1 }}
                    onChange={(e, val) => {
                      if (!isMain) return;
                      if (!val) return; // (có thể xử lý clear sau)
                      if (val._id === "__KHAC__") handleSelectRoutine(null);
                      else handleSelectRoutine(val._id);
                    }}
                  />
                );
              }
              // Fallback (chips) luôn hiển thị cả khi rỗng để có lựa chọn "Khác"
              return (
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {(list || []).map((rt) => {
                    const active = congViecDetail.NhiemVuThuongQuyID === rt._id;
                    return (
                      <Chip
                        key={rt._id}
                        label={rt.Ten || rt._id}
                        color={active ? "primary" : "default"}
                        size="small"
                        variant={active ? "filled" : "outlined"}
                        onClick={
                          isMain ? () => handleSelectRoutine(rt._id) : undefined
                        }
                      />
                    );
                  })}
                  <Chip
                    label="Khác"
                    color={congViecDetail.FlagNVTQKhac ? "primary" : "default"}
                    size="small"
                    variant={
                      congViecDetail.FlagNVTQKhac ? "filled" : "outlined"
                    }
                    onClick={
                      isMain ? () => handleSelectRoutine(null) : undefined
                    }
                  />
                </Box>
              );
            })()}
            {!isMain && (
              <Typography variant="caption" color="text.secondary">
                Chỉ Người Chính được phép thay đổi.
              </Typography>
            )}
          </Box>
        )}
        {showConflict && (
          <Box
            sx={{
              m: 2,
              mb: 0,
              p: 2,
              border: "1px solid",
              borderColor: "warning.main",
              borderRadius: 1,
              bgcolor: "warning.light",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 600 }}
              gutterBottom
            >
              Xung đột phiên bản / Version conflict
            </Typography>
            <Typography variant="body2" paragraph>
              Dữ liệu công việc đã thay đổi bởi người khác trước thao tác của
              bạn. Bản mới nhất đã được tải lại. Vui lòng kiểm tra trước khi
              thực hiện lại.
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="warning"
              onClick={handleResolveConflict}
            >
              Đã hiểu
            </Button>
          </Box>
        )}
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">Có lỗi xảy ra: {error}</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ p: 3 }}>
              {/* Main Content */}
              <Grid item xs={12} md={8}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Timeline */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        🗓 Timeline
                      </Typography>
                      <Grid container spacing={1}>
                        {[
                          {
                            label: "Bắt đầu (kế hoạch)",
                            v: congViec.NgayBatDau,
                          },
                          {
                            label: "Hết hạn (kế hoạch)",
                            v: congViec.NgayHetHan,
                          },
                          { label: "Giao việc", v: congViec.NgayGiaoViec },
                          {
                            label: "Tiếp nhận thực tế",
                            v: congViec.NgayTiepNhanThucTe,
                          },
                          {
                            label: "Hoàn thành tạm",
                            v: congViec.NgayHoanThanhTam,
                          },
                          { label: "Hoàn thành", v: congViec.NgayHoanThanh },
                        ].map((t) => (
                          <Grid key={t.label} item xs={12} sm={6} md={4}>
                            <Box
                              sx={{
                                p: 1.2,
                                border: `1px solid ${theme.palette.grey[200]}`,
                                borderRadius: 1.2,
                                backgroundColor: theme.palette.grey[50],
                                minHeight: 54,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontWeight: 600,
                                  color: "text.secondary",
                                }}
                              >
                                {t.label}
                              </Typography>
                              <Typography variant="body2" sx={{ mt: 0.5 }}>
                                {formatRel(t.v)}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>

                    {/* Description */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          mb: 3,
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        📝 Mô tả công việc
                      </Typography>
                      <Box
                        sx={{
                          whiteSpace: "pre-wrap",
                          backgroundColor: theme.palette.grey[50],
                          border: `1px solid ${theme.palette.grey[200]}`,
                          borderRadius: 2,
                          p: 3,
                          minHeight: 120,
                          fontSize: "1rem",
                          lineHeight: 1.6,
                          color: theme.palette.text.secondary,
                        }}
                      >
                        {congViec.MoTa || "Không có mô tả"}
                      </Box>
                    </Box>

                    {/* Progress (guarded) */}
                    {(congViec.PhanTramTienDoTong !== undefined ||
                      congViec.TienDo !== undefined) && (
                      <Box sx={{ mb: 4 }}>
                        <Typography
                          variant="h6"
                          sx={{
                            mb: 2,
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                          }}
                        >
                          📊 Tiến độ: {quickProgress}%
                        </Typography>
                        <Box
                          sx={{
                            width: "100%",
                            height: 12,
                            backgroundColor: theme.palette.grey[200],
                            borderRadius: 6,
                            overflow: "hidden",
                            border: `1px solid ${theme.palette.grey[300]}`,
                            mb: canEditProgress ? 2 : 0,
                            opacity: canEditProgress ? 1 : 0.85,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${quickProgress}%`,
                              height: "100%",
                              background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                              transition: "width 0.3s ease",
                              borderRadius: 6,
                            }}
                          />
                        </Box>
                        {canEditProgress && (
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={8}>
                              <Slider
                                size="small"
                                value={quickProgress}
                                onChange={handleProgressChange}
                                onChangeCommitted={(e, val) =>
                                  commitProgressUpdate(
                                    Array.isArray(val) ? val[0] : val
                                  )
                                }
                                valueLabelDisplay="auto"
                                step={1}
                                min={0}
                                max={100}
                                aria-label="Tiến độ công việc"
                              />
                            </Grid>
                            <Grid item xs={12} md={4}>
                              <TextField
                                label="%"
                                size="small"
                                type="number"
                                value={quickProgress}
                                onChange={handleProgressInputChange}
                                onBlur={(e) =>
                                  commitProgressUpdate(e.target.value)
                                }
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ width: 120 }}
                              />
                            </Grid>
                          </Grid>
                        )}
                      </Box>
                    )}

                    {/* Actions (workflow - unified) */}
                    {availableActions.length > 0 && (
                      <Box
                        sx={{
                          display: "flex",
                          gap: 2,
                          flexWrap: "wrap",
                          p: 3,
                          backgroundColor: theme.palette.grey[50],
                          borderRadius: 2,
                          border: `1px solid ${theme.palette.grey[200]}`,
                        }}
                      >
                        {availableActions.map((a) => {
                          const meta = ACTION_META[a] || {};
                          return (
                            <LoadingButton
                              key={a}
                              loading={actionLoading === a}
                              variant={meta.variant || "contained"}
                              color={meta.color || "primary"}
                              size="medium"
                              onClick={() => triggerAction(a)}
                              startIcon={
                                a === "HOAN_THANH" || a === "HOAN_THANH_TAM" ? (
                                  <CheckCircleIcon />
                                ) : null
                              }
                              sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                fontWeight: 600,
                                px: 3,
                              }}
                            >
                              {meta.label || a}
                            </LoadingButton>
                          );
                        })}
                      </Box>
                    )}

                    {/* Warning config & Metrics */}
                    <WarningConfigBlock cv={congViec} />
                    <MetricsBlock cv={congViec} />

                    {/* Quick Edit: Status + Progress */}
                    <Card
                      elevation={0}
                      sx={{
                        mt: 3,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.grey[200]}`,
                        backgroundColor:
                          theme.palette.grey[25] || theme.palette.grey[50],
                      }}
                    >
                      <CardContent sx={{ p: 3 }}>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 700, mb: 2 }}
                        >
                          Chỉnh sửa nhanh
                        </Typography>
                        <Grid container spacing={2} alignItems="center">
                          {/* Ẩn chỉnh trực tiếp trạng thái để tuân thủ flow */}
                          <Grid item xs={12} md={6}>
                            <Box
                              sx={{
                                display: "flex",
                                gap: 2,
                                alignItems: "center",
                              }}
                            >
                              <Box sx={{ flex: 1 }}>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Tiến độ tổng (%)
                                </Typography>
                                <Slider
                                  size="small"
                                  value={quickProgress}
                                  onChange={handleProgressChange}
                                  onChangeCommitted={(e, val) =>
                                    commitProgressUpdate(
                                      Array.isArray(val) ? val[0] : val
                                    )
                                  }
                                  valueLabelDisplay="auto"
                                  step={1}
                                  min={0}
                                  max={100}
                                />
                              </Box>
                              <TextField
                                label="%"
                                size="small"
                                type="number"
                                value={quickProgress}
                                onChange={handleProgressInputChange}
                                onBlur={(e) =>
                                  commitProgressUpdate(e.target.value)
                                }
                                inputProps={{ min: 0, max: 100 }}
                                sx={{ width: 100 }}
                              />
                            </Box>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>

                {/* Comments Section */}
                <Card
                  sx={{
                    mt: 3,
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                    elevation: 2,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <CommentIcon sx={{ fontSize: 22 }} />
                      Bình luận ({congViec.BinhLuans?.length || 0})
                    </Typography>

                    <CommentComposer
                      theme={theme}
                      newComment={newComment}
                      setNewComment={setNewComment}
                      pendingFiles={pendingFiles}
                      setPendingFiles={setPendingFiles}
                      dragCommentActive={dragCommentActive}
                      setDragCommentActive={setDragCommentActive}
                      onSubmit={handleAddComment}
                      submittingComment={submittingComment}
                    />

                    {/* Comments Timeline (scrollable) */}
                    <CommentsList
                      theme={theme}
                      comments={congViec.BinhLuans || []}
                      user={user}
                      congViecId={congViecId}
                      onRecallComment={(taskId, cmtId) =>
                        dispatch(recallComment(taskId, cmtId))
                      }
                      onViewFile={handleViewFile}
                      onDownloadFile={handleDownloadFile}
                      onRecallCommentText={(taskId, cmtId) =>
                        dispatch(recallCommentText(taskId, cmtId))
                      }
                      onDeleteFile={async (f) => {
                        try {
                          await dispatch(deleteFileThunk(congViecId, f._id));
                          // Đồng bộ ngay trong danh sách bình luận
                          dispatch(
                            markCommentFileDeleted({
                              congViecId,
                              fileId: f._id,
                            })
                          );
                        } catch {}
                      }}
                      // Replies
                      repliesByParent={repliesByParent}
                      initialReplyCounts={initialReplyCounts}
                      onFetchReplies={(parentId) =>
                        dispatch(fetchReplies(parentId))
                      }
                      onReplyText={(parentId, noiDung) =>
                        dispatch(addReply({ congViecId, parentId, noiDung }))
                      }
                      onReplyWithFiles={(
                        parentId,
                        noiDung,
                        files,
                        onProgress
                      ) =>
                        dispatch(
                          createCommentWithFiles(
                            congViecId,
                            { noiDung, parentId },
                            files,
                            onProgress
                          )
                        )
                      }
                      formatDateTime={formatDateTime}
                    />

                    {(!congViec.BinhLuans ||
                      congViec.BinhLuans.length === 0) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textAlign: "center", py: 3 }}
                      >
                        Chưa có bình luận nào
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              {/* Sidebar */}
              <Grid item xs={12} md={4}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        mb: 3,
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      ℹ️ Thông tin chi tiết
                    </Typography>

                    <Box
                      onDragOver={handleSidebarDragOver}
                      onDragEnter={handleSidebarDragEnter}
                      onDragLeave={handleSidebarDragLeave}
                      onDrop={handleSidebarDrop}
                      onPaste={handleSidebarPaste}
                      tabIndex={0}
                      sx={{ position: "relative" }}
                    >
                      <FilesSidebar
                        theme={theme}
                        dragSidebarActive={dragSidebarActive}
                        setDragSidebarActive={setDragSidebarActive}
                        fileCount={fileCount}
                        filesState={filesState}
                        onUploadFiles={async (files) =>
                          dispatch(uploadFilesForTask(congViecId, files))
                        }
                        onViewFile={handleViewFile}
                        onDownloadFile={handleDownloadFile}
                        onDeleteFile={(f) =>
                          dispatch(deleteFileThunk(congViecId, f._id))
                        }
                      />
                      {dragSidebarActive && (
                        <Box
                          sx={{
                            position: "absolute",
                            inset: 0,
                            border: "2px dashed",
                            borderColor: theme.palette.primary.main,
                            bgcolor: "rgba(0,0,0,0.04)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: theme.palette.primary.main,
                            fontWeight: 600,
                            pointerEvents: "none",
                            zIndex: 1,
                          }}
                        >
                          Thả tệp vào đây để tải lên
                        </Box>
                      )}
                    </Box>

                    <TaskMetaSidebar
                      theme={theme}
                      congViec={congViec}
                      overdue={
                        extDue === "QUA_HAN" || extDue === "HOAN_THANH_TRE_HAN"
                      }
                      formatDateTime={formatDateTime}
                      cooperators={cooperators}
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            {congViecDetail?.LichSuTrangThai?.length ? (
              <Box sx={{ px: 3, pb: 3 }}>
                <HistoryAccordion history={congViecDetail.LichSuTrangThai} />
              </Box>
            ) : null}
          </>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[25] || theme.palette.grey[50],
        }}
      >
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          Đóng
        </Button>
      </DialogActions>

      {/* Color Legend Dialog */}
      <ColorLegendDialog
        open={colorLegendOpen}
        onClose={() => setColorLegendOpen(false)}
      />
      <AdminColorSettingsDialog
        open={adminColorsOpen}
        onClose={() => setAdminColorsOpen(false)}
        isAdmin={user?.PhanQuyen === "admin"}
      />

      {/* Confirm Dialog (unified) */}
      {confirm && (
        <Dialog open onClose={() => setConfirm(null)} maxWidth="xs" fullWidth>
          {(() => {
            const { title } = buildConfirmTexts(confirm);
            return <DialogTitle>{title}</DialogTitle>;
          })()}
          <DialogContent>
            <DialogContentText>
              {buildConfirmTexts(confirm).desc}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirm(null)}>Hủy</Button>
            <LoadingButton
              loading={actionLoading === confirm}
              variant="contained"
              onClick={() => executeAction(confirm)}
            >
              Xác nhận
            </LoadingButton>
          </DialogActions>
        </Dialog>
      )}
    </Dialog>
  );
};

export default CongViecDetailDialog;
