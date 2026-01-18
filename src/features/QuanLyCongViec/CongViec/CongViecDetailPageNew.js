import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Button,
  Typography,
  Box,
  useTheme,
  Grid,
  Container,
  Paper,
  IconButton,
  AppBar,
  Toolbar,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TaskDialogHeader from "./components/TaskDialogHeader";
import SubtasksSection from "./components/SubtasksSection";
import CongViecTreeDialog from "../TreeView/CongViecTreeDialog";
import RoutineTaskCompactButton from "./components/RoutineTaskCompactButton";
import VersionConflictNotice from "./components/VersionConflictNotice";
import TaskMainContent, { CommentsSection } from "./components/TaskMainContent";
import TaskSidebarPanel from "./components/TaskSidebarPanel";
import HistorySection from "./components/HistorySection";
import ConfirmActionDialog from "./components/ConfirmActionDialog";
import ProgressConfirmDialog from "./components/ProgressConfirmDialog";
import ProgressEditDialog from "./components/ProgressEditDialog";
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

dayjs.extend(relativeTime);

// ---- Helpers ----
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
 * CongViecDetailPageNew - Page-based implementation (Desktop-first)
 *
 * This is the NEW implementation for testing. Once verified:
 * 1. Rename this to CongViecDetailPage.js
 * 2. Replace the old wrapper CongViecDetailPage.js
 * 3. Route /congviec/:id will use this directly
 *
 * Key differences from Dialog version:
 * - Uses useParams() instead of props
 * - Uses Box/Container instead of Dialog wrapper
 * - Uses AppBar instead of DialogTitle
 * - No 'open' prop checks in useEffect
 * - navigate(-1) instead of onClose callback
 */
const CongViecDetailPageNew = () => {
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
  const statusOverrides = useSelector((s) => s.colorConfig?.statusColors);
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

  // ✅ Fetch data when page loads (NO 'open' check needed)
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

  // ✅ SAFEGUARD: Verify task ID matches
  useEffect(() => {
    if (congViecId && congViecDetail) {
      if (congViecDetail._id !== congViecId) {
        console.warn(
          `[Task Conflict Detected] Page expects task ${congViecId} but Redux has ${congViecDetail._id}. Auto-refetching...`
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

      const selectedTask = nvId
        ? myRoutineTasks?.find((t) => t._id === nvId)
        : null;
      let message;
      if (nvId)
        message = `Đã liên kết với nhiệm vụ: ${
          selectedTask?.Ten || "Nhiệm vụ đã chọn"
        }`;
      else if (isKhac) message = 'Đã chọn "Nhiệm vụ khác"';
      else if (isClear) message = "Đã bỏ chọn nhiệm vụ thường quy";
      if (message) console.log(message);
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

  if (!currentNhanVienId) {
    console.error(
      "[CongViecDetailPageNew] User chưa liên kết với nhân viên:",
      user
    );
  }

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

  if (!congViecDetail && !loading) return null;

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

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.default",
      }}
    >
      {/* Header - Replaces DialogTitle */}
      <AppBar
        position="static"
        sx={{
          bgcolor: "#1939B7",
          boxShadow: "none",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 4 }, py: 2 }}>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleClose}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box sx={{ flex: 1 }}>
            <TaskDialogHeader
              congViec={congViec}
              user={user}
              statusOverrides={statusOverrides}
              priorityOverrides={priorityOverrides}
              dueChips={dueChips}
              onOpenColorLegend={() => setColorLegendOpen(true)}
              onOpenAdminColors={() => setAdminColorsOpen(true)}
              onEdit={null}
              onClose={handleClose}
              theme={theme}
              availableActions={availableActions}
              actionLoading={actionLoading}
              onTriggerAction={triggerAction}
              canEditProgress={canEditProgress}
              onOpenProgressEdit={handleOpenProgressEdit}
              currentUserRole={currentUserRole}
              currentUserNhanVienId={currentUserNhanVienId}
              onOpenTree={handleOpenTree}
              routineTaskSelectorNode={
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
              }
            />
          </Box>
        </Toolbar>
      </AppBar>

      {/* Content - Replaces DialogContent */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          bgcolor: "background.default",
        }}
      >
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {showConflict && (
            <VersionConflictNotice onResolve={handleResolveConflict} />
          )}

          {loading ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography>Đang tải...</Typography>
            </Box>
          ) : error ? (
            <Box sx={{ textAlign: "center", py: 4 }}>
              <Typography color="error">Có lỗi xảy ra: {error}</Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} lg={8} xl={9}>
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
                <SubtasksSection
                  parent={congViec}
                  isMain={isMain}
                  currentUserRole={currentUserRole}
                  currentUserNhanVienId={currentUserNhanVienId}
                  onOpenTree={handleOpenTree}
                />
              </Grid>
              <Grid item xs={12} lg={4} xl={3}>
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
              </Grid>
              <Grid item xs={12}>
                <HistorySection
                  congViecDetail={congViecDetail}
                  congViecId={congViecId}
                  theme={theme}
                />
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>

      {/* Footer - Replaces DialogActions */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.grey[25] || theme.palette.grey[50],
        }}
      >
        <Button
          onClick={handleClose}
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
      </Paper>

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
        currentProgress={
          congViecDetail?.PhanTramTienDoTong ?? congViecDetail?.TienDo ?? 0
        }
        onSave={handleSaveProgress}
        loading={progressSaving}
      />
      <ProgressConfirmDialog
        open={progressDialog.open}
        oldValue={
          congViecDetail?.PhanTramTienDoTong ?? congViecDetail?.TienDo ?? 0
        }
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

export default CongViecDetailPageNew;
