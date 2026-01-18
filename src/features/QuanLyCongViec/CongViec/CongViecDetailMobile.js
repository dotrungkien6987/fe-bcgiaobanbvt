import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  useTheme,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
  Tabs,
  Tab,
  Badge,
  Stack,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  List,
  ListItem,
  Chip,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PaletteIcon from "@mui/icons-material/Palette";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  formatDateTime,
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
  assignRoutineTask,
  markCommentFileDeleted,
  transitionCongViec,
  ACTION_META,
  getAvailableActions,
  fetchMyRoutineTasks,
  updateProgress,
  fetchAvailableCycles,
  setSelectedCycle,
} from "./congViecSlice";
import {
  fetchFilesByTask,
  uploadFilesForTask,
  deleteFile as deleteFileThunk,
  countFilesByTask,
  createCommentWithFiles,
} from "./QuanLyTepTin/quanLyTepTinSlice";
import useAuth from "hooks/useAuth";
import ColorLegendDialog from "./components/ColorLegendDialog";
import AdminColorSettingsDialog from "./components/AdminColorSettingsDialog";
import { fetchColorConfig } from "./colorConfigSlice";
import useFilePreview from "./hooks/useFilePreview";
import TaskMainContent, { CommentsSection } from "./components/TaskMainContent";
import TaskSidebarPanel from "./components/TaskSidebarPanel";
import SubtasksSection from "./components/SubtasksSection";
import HistorySection from "./components/HistorySection";
import ConfirmActionDialog from "./components/ConfirmActionDialog";
import ProgressConfirmDialog from "./components/ProgressConfirmDialog";
import ProgressEditDialog from "./components/ProgressEditDialog";
import VersionConflictNotice from "./components/VersionConflictNotice";
import CongViecTreeDialog from "../TreeView/CongViecTreeDialog";
import RoutineTaskCompactButton from "./components/RoutineTaskCompactButton";

dayjs.extend(relativeTime);

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

/**
 * CongViecDetailMobile - Mobile-optimized implementation
 *
 * Features:
 * - Compact header with task code and title
 * - Prominent progress bar
 * - Tab-based navigation (Info, Comments, Files, Subtasks, History)
 * - Sticky bottom actions with safe area padding
 * - Optimized for touch interactions
 */
const CongViecDetailMobile = () => {
  const { id: congViecId } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const dispatch = useDispatch();
  const { user } = useAuth();

  console.log("User:", user);
  const currentUserRole = user?.PhanQuyen;
  const currentUserNhanVienId = user?.NhanVienID;

  const { congViecDetail, loading, error } = useSelector(
    (state) => state.congViec
  );
  const { myRoutineTasks, loadingRoutineTasks, myRoutineTasksError } =
    useSelector((s) => s.congViec);
  const { availableCycles, selectedCycleId, loadingCycles } = useSelector(
    (s) => s.congViec
  );
  const versionConflict = useSelector((s) => s.congViec.versionConflict);
  // eslint-disable-next-line no-unused-vars
  const statusOverrides = useSelector((s) => s.colorConfig?.statusColors);
  // eslint-disable-next-line no-unused-vars
  const priorityOverrides = useSelector((s) => s.colorConfig?.priorityColors);
  const repliesByParent = useSelector(
    (state) => state.congViec?.repliesByParent || {}
  );

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

  // Local UI state
  const [activeTab, setActiveTab] = useState(0);
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragCommentActive, setDragCommentActive] = useState(false);
  const [dragSidebarActive, setDragSidebarActive] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [colorLegendOpen, setColorLegendOpen] = useState(false);
  const [adminColorsOpen, setAdminColorsOpen] = useState(false);
  const [progressEditOpen, setProgressEditOpen] = useState(false);
  const [treeDialog, setTreeDialog] = useState({ open: false, congViec: null });
  const [actionLoading, setActionLoading] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [progressDialog, setProgressDialog] = useState({
    open: false,
    target: 0,
  });
  const [progressSaving, setProgressSaving] = useState(false);

  const { handleViewFile, handleDownloadFile } = useFilePreview();

  const handleClose = () => navigate(-1);

  // Fetch data
  useEffect(() => {
    if (congViecId) {
      dispatch(getCongViecDetail(congViecId));
      dispatch(fetchFilesByTask(congViecId));
      dispatch(countFilesByTask(congViecId));
      dispatch(fetchColorConfig());
      dispatch(fetchMyRoutineTasks());
      dispatch(fetchAvailableCycles());
    }
  }, [congViecId, dispatch]);

  useEffect(() => {
    if (versionConflict?.id === congViecId) {
      dispatch(getCongViecDetail(congViecId));
    }
  }, [versionConflict, congViecId, dispatch]);

  useEffect(() => {
    if (congViecId && congViecDetail) {
      if (congViecDetail._id !== congViecId) {
        console.warn(
          `[Mobile] Task Conflict Detected - refetching ${congViecId}`
        );
        dispatch(getCongViecDetail(congViecId));
      }
    }
  }, [congViecId, congViecDetail, dispatch]);

  const handleAddComment = async () => {
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

  const handleOpenProgressEdit = () => {
    setProgressEditOpen(true);
  };

  const handleCloseProgressEdit = () => {
    setProgressEditOpen(false);
  };

  const handleOpenTree = (congViec) => {
    setTreeDialog({ open: true, congViec });
  };

  const handleCloseTree = () => {
    setTreeDialog({ open: false, congViec: null });
  };

  const handleSaveProgress = async (newValue) => {
    await commitProgressUpdate(newValue);
    setProgressEditOpen(false);
  };

  const commitProgressUpdate = async (value) => {
    const v = Math.max(0, Math.min(100, Math.round(value)));
    setProgressDialog({ open: true, target: v });
  };

  const handleConfirmProgress = async (note) => {
    const v = progressDialog.target;
    setProgressSaving(true);
    try {
      await dispatch(
        updateProgress({
          id: congViecId,
          value: v,
          ghiChu: note,
          expectedVersion: congViecDetail?.updatedAt,
        })
      );
      setProgressDialog({ open: false, target: 0 });
    } catch (err) {
      // Error handled in slice
    } finally {
      setProgressSaving(false);
    }
  };

  const handleCancelProgress = () => {
    setProgressDialog({ open: false, target: 0 });
  };

  const handleSelectRoutine = async (
    nvId,
    { isKhac = false, isClear = false } = {}
  ) => {
    if (!isMain) return;
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
      } else {
        nhiemVuThuongQuyID = null;
        flagKhac = false;
      }

      await dispatch(
        assignRoutineTask({
          congViecId,
          nhiemVuThuongQuyID,
          isKhac: flagKhac,
          expectedVersion: congViecDetail?.updatedAt,
        })
      );
    } catch (e) {
      console.error("Error updating routine task:", e);
    }
  };

  const handleCycleChange = (newCycleId) => {
    dispatch(setSelectedCycle(newCycleId));
    dispatch(fetchMyRoutineTasks({ force: true, chuKyId: newCycleId }));
  };

  const showConflict = versionConflict && versionConflict.id === congViecId;
  const handleResolveConflict = () => {
    dispatch({ type: "congViec/clearVersionConflict" });
  };

  // Drag & Drop handlers
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

  const cooperators = React.useMemo(() => {
    const cv = congViecDetail || {};
    const candidates =
      cv?.NguoiThamGia ||
      cv?.NguoiPhoiHop ||
      cv?.DanhSachNguoiPhoiHop ||
      cv?.PhoiHops ||
      cv?.NguoiThamGiaPhoiHop ||
      [];
    const arr = Array.isArray(candidates) ? candidates : [];
    const norm = arr
      .filter((u) => u?.role === "PHOI_HOP" || u?.VaiTro === "PHOI_HOP")
      .map((u) => {
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

  const nhanVienObjId = user?.NhanVien?._id;
  const currentNhanVienId = user?.NhanVienID || nhanVienObjId;

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

  const { extDue, soGioTre, hoursLeft } = useMemo(
    () => deriveDueInfo(congViec),
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

  const commentCount = congViecDetail?.BinhLuans?.length || 0;

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenMenu = (event) => {
    setAnchorMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorMenu(null);
  };

  if (!congViecDetail && !loading) return null;

  const progress =
    congViecDetail?.PhanTramTienDoTong ?? congViecDetail?.TienDo ?? 0;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* 📱 Mobile Header */}
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "#1939B7",
          boxShadow: 2,
        }}
      >
        <Toolbar variant="dense" sx={{ minHeight: 56, px: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1, mx: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
              {congViec.MaCongViec || "..."}
            </Typography>
            <Typography
              variant="caption"
              noWrap
              sx={{ opacity: 0.9, display: "block", lineHeight: 1.2 }}
            >
              {congViec.TieuDe || "Đang tải..."}
            </Typography>
          </Box>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleOpenMenu}
            size="small"
          >
            <MoreVertIcon />
          </IconButton>
        </Toolbar>

        {/* Progress Bar */}
        <LinearProgress
          variant="determinate"
          value={progress}
          sx={{
            height: 4,
            bgcolor: "rgba(255,255,255,0.2)",
            "& .MuiLinearProgress-bar": {
              bgcolor: progress === 100 ? "#4caf50" : "#ffc107",
            },
          }}
        />
      </AppBar>

      {/* Menu */}
      <Menu
        anchorEl={anchorMenu}
        open={Boolean(anchorMenu)}
        onClose={handleCloseMenu}
      >
        {canEditProgress && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              handleOpenProgressEdit();
            }}
          >
            <ListItemText>Cập nhật tiến độ</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            setColorLegendOpen(true);
          }}
        >
          <ListItemIcon>
            <PaletteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Chú thích màu</ListItemText>
        </MenuItem>
        {user?.PhanQuyen === "admin" && (
          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setAdminColorsOpen(true);
            }}
          >
            <ListItemIcon>
              <AdminPanelSettingsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Cài đặt màu</ListItemText>
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            handleCloseMenu();
            handleOpenTree(congViec);
          }}
        >
          <ListItemIcon>
            <AccountTreeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Xem cây công việc</ListItemText>
        </MenuItem>
      </Menu>

      {/* Version Conflict Notice */}
      {showConflict && (
        <Box sx={{ px: 2, pt: 1 }}>
          <VersionConflictNotice onResolve={handleResolveConflict} />
        </Box>
      )}

      {/* 📑 Tab Navigation */}
      <Paper square elevation={1}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 48,
            "& .MuiTab-root": {
              minHeight: 48,
              minWidth: "auto",
              px: 2,
            },
          }}
        >
          <Tab
            icon={<InfoOutlinedIcon fontSize="small" />}
            iconPosition="start"
            label="Thông tin"
          />
          <Tab
            icon={
              <Badge badgeContent={commentCount} color="error" max={99}>
                <ChatBubbleOutlineIcon fontSize="small" />
              </Badge>
            }
            iconPosition="start"
            label="Bình luận"
          />
          <Tab
            icon={
              <Badge badgeContent={fileCount} color="primary" max={99}>
                <AttachFileIcon fontSize="small" />
              </Badge>
            }
            iconPosition="start"
            label="Tệp tin"
          />
          <Tab
            icon={<AccountTreeIcon fontSize="small" />}
            iconPosition="start"
            label="CV con"
          />
          <Tab
            icon={<HistoryIcon fontSize="small" />}
            iconPosition="start"
            label="Lịch sử"
          />
        </Tabs>
      </Paper>

      {/* 📄 Tab Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pb:
            availableActions.length > 0
              ? "calc(80px + env(safe-area-inset-bottom))"
              : 2,
        }}
      >
        {loading ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center", py: 4, px: 2 }}>
            <Typography color="error">Có lỗi xảy ra: {error}</Typography>
          </Box>
        ) : (
          <>
            {/* Tab 0: Thông tin */}
            {activeTab === 0 && (
              <Box sx={{ px: 2, py: 2 }}>
                <TaskMainContent
                  congViec={congViec}
                  theme={theme}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  pendingFiles={pendingFiles}
                  setPendingFiles={setPendingFiles}
                  dragCommentActive={dragCommentActive}
                  setDragCommentActive={setDragCommentActive}
                  handleAddComment={handleAddComment}
                  submittingComment={submittingComment}
                  user={user}
                  congViecId={congViecId}
                  dispatch={dispatch}
                  recallComment={recallComment}
                  recallCommentText={recallCommentText}
                  deleteFileThunk={deleteFileThunk}
                  markCommentFileDeleted={markCommentFileDeleted}
                  fetchReplies={fetchReplies}
                  addReply={addReply}
                  createCommentWithFiles={createCommentWithFiles}
                  repliesByParent={repliesByParent}
                  initialReplyCounts={initialReplyCounts}
                  handleViewFile={handleViewFile}
                  handleDownloadFile={handleDownloadFile}
                  formatDateTime={formatDateTime}
                />

                {/* Deadline Status Chips */}
                {dueChips.length > 0 && (
                  <Paper sx={{ mt: 2, p: 2 }}>
                    <Typography
                      variant="subtitle2"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      ⏰ Tình trạng deadline
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {dueChips.map((chip) => (
                        <Chip
                          key={chip.key}
                          label={chip.label}
                          size="small"
                          sx={{
                            bgcolor: chip.color,
                            color: "white",
                            fontWeight: 600,
                            mb: 1,
                          }}
                        />
                      ))}
                    </Stack>
                  </Paper>
                )}

                {/* Metadata Section */}
                <Paper sx={{ mt: 2, p: 2 }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    sx={{ fontWeight: 600 }}
                  >
                    Thông tin chung
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Người giao việc"
                        secondary={
                          congViec.NguoiGiaoViecID?.Ten ||
                          congViec.NguoiGiaoViecID?.HoTen ||
                          "N/A"
                        }
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Người thực hiện"
                        secondary={
                          congViec.NguoiChinhID?.Ten ||
                          congViec.NguoiChinhID?.HoTen ||
                          "N/A"
                        }
                      />
                    </ListItem>
                    {congViec.NgayBatDau && (
                      <ListItem>
                        <ListItemText
                          primary="Ngày bắt đầu"
                          secondary={dayjs(congViec.NgayBatDau).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        />
                      </ListItem>
                    )}
                    {congViec.NgayHetHan && (
                      <ListItem>
                        <ListItemText
                          primary="Hạn hoàn thành"
                          secondary={dayjs(congViec.NgayHetHan).format(
                            "DD/MM/YYYY HH:mm"
                          )}
                        />
                      </ListItem>
                    )}
                  </List>
                </Paper>

                {/* Routine Task Selector */}
                {isMain && (
                  <Box sx={{ mt: 2 }}>
                    <RoutineTaskCompactButton
                      congViecDetail={congViecDetail}
                      myRoutineTasks={myRoutineTasks}
                      loadingRoutineTasks={loadingRoutineTasks}
                      myRoutineTasksError={myRoutineTasksError}
                      isMain={isMain}
                      handleSelectRoutine={handleSelectRoutine}
                      dispatch={dispatch}
                      fetchMyRoutineTasks={fetchMyRoutineTasks}
                      availableCycles={availableCycles}
                      selectedCycleId={selectedCycleId}
                      onCycleChange={handleCycleChange}
                      loadingCycles={loadingCycles}
                    />
                  </Box>
                )}
              </Box>
            )}

            {/* Tab 1: Bình luận */}
            {activeTab === 1 && (
              <Box sx={{ px: 2, py: 2 }}>
                <CommentsSection
                  congViec={congViec}
                  theme={theme}
                  newComment={newComment}
                  setNewComment={setNewComment}
                  pendingFiles={pendingFiles}
                  setPendingFiles={setPendingFiles}
                  dragCommentActive={dragCommentActive}
                  setDragCommentActive={setDragCommentActive}
                  handleAddComment={handleAddComment}
                  submittingComment={submittingComment}
                  user={user}
                  congViecId={congViecId}
                  dispatch={dispatch}
                  recallComment={recallComment}
                  recallCommentText={recallCommentText}
                  deleteFileThunk={deleteFileThunk}
                  markCommentFileDeleted={markCommentFileDeleted}
                  fetchReplies={fetchReplies}
                  addReply={addReply}
                  createCommentWithFiles={createCommentWithFiles}
                  repliesByParent={repliesByParent}
                  initialReplyCounts={initialReplyCounts}
                  handleViewFile={handleViewFile}
                  handleDownloadFile={handleDownloadFile}
                  formatDateTime={formatDateTime}
                />
              </Box>
            )}

            {/* Tab 2: Tệp tin */}
            {activeTab === 2 && (
              <Box sx={{ px: 2, py: 2 }}>
                <TaskSidebarPanel
                  theme={theme}
                  dragSidebarActive={dragSidebarActive}
                  setDragSidebarActive={setDragSidebarActive}
                  fileCount={fileCount}
                  filesState={filesState}
                  uploadFilesForTask={uploadFilesForTask}
                  congViecId={congViecId}
                  dispatch={dispatch}
                  handleViewFile={handleViewFile}
                  handleDownloadFile={handleDownloadFile}
                  deleteFileThunk={deleteFileThunk}
                  congViec={congViec}
                  extDue={extDue}
                  cooperators={cooperators}
                  handleSidebarDragOver={handleSidebarDragOver}
                  handleSidebarDragEnter={handleSidebarDragEnter}
                  handleSidebarDragLeave={handleSidebarDragLeave}
                  handleSidebarDrop={handleSidebarDrop}
                  handleSidebarPaste={handleSidebarPaste}
                />
              </Box>
            )}

            {/* Tab 3: Công việc con */}
            {activeTab === 3 && (
              <Box sx={{ px: 2, py: 2 }}>
                <SubtasksSection
                  parent={congViec}
                  isMain={isMain}
                  currentUserRole={currentUserRole}
                  currentUserNhanVienId={currentUserNhanVienId}
                  onOpenTree={handleOpenTree}
                />
              </Box>
            )}

            {/* Tab 4: Lịch sử */}
            {activeTab === 4 && (
              <Box sx={{ px: 2, py: 2 }}>
                <HistorySection
                  congViecDetail={congViecDetail}
                  congViecId={congViecId}
                  theme={theme}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      {/* 🎯 Sticky Bottom Actions */}
      {availableActions.length > 0 && (
        <Paper
          elevation={8}
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            p: 2,
            pb: "calc(env(safe-area-inset-bottom) + 16px)",
            zIndex: 1200,
            borderTop: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ overflowX: "auto" }}>
            {availableActions.map((action) => {
              const meta = ACTION_META[action];
              return (
                <Button
                  key={action}
                  variant="contained"
                  size="small"
                  onClick={() => triggerAction(action)}
                  disabled={actionLoading === action}
                  sx={{
                    minWidth: 100,
                    textTransform: "none",
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                  }}
                >
                  {meta?.label || action}
                </Button>
              );
            })}
          </Stack>
        </Paper>
      )}

      {/* Dialogs */}
      <ColorLegendDialog
        open={colorLegendOpen}
        onClose={() => setColorLegendOpen(false)}
      />
      <AdminColorSettingsDialog
        open={adminColorsOpen}
        onClose={() => setAdminColorsOpen(false)}
        isAdmin={user?.PhanQuyen === "admin"}
      />
      <ConfirmActionDialog
        open={!!confirm}
        action={confirm}
        buildConfirmTexts={buildConfirmTexts}
        actionLoading={actionLoading}
        executeAction={executeAction}
        onClose={() => setConfirm(null)}
      />
      <ProgressEditDialog
        open={progressEditOpen}
        onClose={handleCloseProgressEdit}
        currentProgress={progress}
        onSave={handleSaveProgress}
        loading={progressSaving}
      />
      <ProgressConfirmDialog
        open={progressDialog.open}
        oldValue={progress}
        newValue={progressDialog.target}
        autoComplete={progressDialog.target === 100}
        loading={progressSaving}
        onCancel={handleCancelProgress}
        onConfirm={handleConfirmProgress}
      />
      <CongViecTreeDialog
        open={treeDialog.open}
        onClose={handleCloseTree}
        congViec={treeDialog.congViec}
        enableViewDetail={true}
      />
    </Box>
  );
};

export default CongViecDetailMobile;
