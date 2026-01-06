import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  useTheme,
  Grid,
} from "@mui/material";
import TaskDialogHeader from "./components/TaskDialogHeader";
import SubtasksSection from "./components/SubtasksSection";
import CongViecTreeDialog from "../TreeView/CongViecTreeDialog";
// import RoutineTaskSelector from "./components/RoutineTaskSelector"; // ✅ Not used directly anymore
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
// Icons now handled inside extracted components
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
  fetchAvailableCycles, // ✅ NEW
  setSelectedCycle, // ✅ NEW
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

// extend dayjs plugins after imports
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

const CongViecDetailDialog = ({ open, onClose, congViecId, onEdit }) => {
  const theme = useTheme();
  const fullScreen = true; // Always full screen
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
  // ✅ NEW: Cycle state
  const { availableCycles, selectedCycleId, loadingCycles } = useSelector(
    (s) => s.congViec
  );
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
  const [progressEditOpen, setProgressEditOpen] = useState(false);
  const [treeDialog, setTreeDialog] = useState({ open: false, congViec: null });

  // Quick edit local state
  // const [quickStatus, setQuickStatus] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // unified action key
  const [confirm, setConfirm] = useState(null); // action key waiting confirm
  // Quick progress editing removed – progress history & updates managed elsewhere
  const [progressDialog, setProgressDialog] = useState({
    open: false,
    target: 0,
  });
  const [progressSaving, setProgressSaving] = useState(false);

  // helpers moved into child components

  const { handleViewFile, handleDownloadFile } = useFilePreview();

  useEffect(() => {
    if (open && congViecId) {
      dispatch(getCongViecDetail(congViecId));
      dispatch(fetchFilesByTask(congViecId));
      dispatch(countFilesByTask(congViecId));
      dispatch(fetchColorConfig());
      dispatch(fetchMyRoutineTasks());
      // ✅ NEW: Fetch available cycles when dialog opens
      dispatch(fetchAvailableCycles());
    }
  }, [open, congViecId, dispatch]);

  // When version conflict occurs, auto-refetch newest detail in background so user can choose refresh.
  useEffect(() => {
    if (versionConflict?.id === congViecId) {
      // silent refresh detail
      dispatch(getCongViecDetail(congViecId));
    }
  }, [versionConflict, congViecId, dispatch]);

  // ✅ SAFEGUARD: Verify task ID matches before rendering
  // Prevents showing wrong task when multiple dialogs/tabs are open simultaneously
  // This handles the case where Redux state gets overwritten by another context
  useEffect(() => {
    if (open && congViecId && congViecDetail) {
      if (congViecDetail._id !== congViecId) {
        console.warn(
          `[Task Conflict Detected] Dialog expects task ${congViecId} but Redux has ${congViecDetail._id}. Auto-refetching correct task...`
        );
        // Force refetch the correct task to fix the conflict
        dispatch(getCongViecDetail(congViecId));
      }
    }
  }, [open, congViecId, congViecDetail, dispatch]);

  // Sync quick-edit progress when detail loads/changes
  useEffect(() => {
    if (!congViecDetail) return;
    // Sync progress với detail đã được bỏ vì không còn quickProgress state
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

  // ✅ Handlers cho ProgressEditDialog
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
    // Open dialog; store target
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
      // Error đã được xử lý trong slice
    } finally {
      setProgressSaving(false);
    }
  };
  const handleCancelProgress = () => {
    setProgressDialog({ open: false, target: 0 });
  };

  // Routine task selection (single-select) with enhanced feedback
  // Distinguish 3 states: linked (id), Khác (FlagNVTQKhac=true), and none selected (both null/false)
  const handleSelectRoutine = async (
    nvId,
    { isKhac = false, isClear = false } = {}
  ) => {
    if (!isMain) return;
    try {
      // ✅ Dùng API riêng assignRoutineTask thay vì updateCongViec
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
        // default fallback (clear)
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

  // ✅ NEW: Handler for cycle change
  const handleCycleChange = (newCycleId) => {
    dispatch(setSelectedCycle(newCycleId));
    // ✅ FIX: Pass chuKyId directly to avoid race condition
    dispatch(fetchMyRoutineTasks({ force: true, chuKyId: newCycleId }));
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
  // Determine roles using multiple possible fields (NhanVienID, NhanVien?._id)
  const nhanVienObjId = user?.NhanVien?._id;
  const currentNhanVienId = user?.NhanVienID || nhanVienObjId;

  // Validation: warn if user doesn't have NhanVienID
  if (!currentNhanVienId) {
    console.error(
      "[CongViecDetailDialog] User chưa liên kết với nhân viên:",
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
      maxWidth={false}
      fullWidth={false}
      fullScreen={fullScreen}
      PaperProps={{
        sx: {
          minHeight: "100vh",
          height: "100vh",
          maxHeight: "100vh",
          width: "100vw",
          maxWidth: "100vw",
          margin: 0,
          borderRadius: 0,
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "#1939B7",
          color: "white",
          py: 3,
          px: 4,
          borderBottom: "none",
        }}
      >
        <TaskDialogHeader
          congViec={congViec}
          user={user}
          statusOverrides={statusOverrides}
          priorityOverrides={priorityOverrides}
          dueChips={dueChips}
          onOpenColorLegend={() => setColorLegendOpen(true)}
          onOpenAdminColors={() => setAdminColorsOpen(true)}
          onEdit={onEdit}
          onClose={onClose}
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
      </DialogTitle>

      <DialogContent
        dividers
        sx={{ p: 3, height: "calc(100vh - 120px)", overflow: "auto" }}
      >
        {showConflict && (
          <VersionConflictNotice onResolve={handleResolveConflict} />
        )}

        {loading ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography color="error">Có lỗi xảy ra: {error}</Typography>
          </Box>
        ) : (
          <Grid container spacing={3} sx={{ minHeight: "calc(100vh - 200px)" }}>
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
                open={open}
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
      <ConfirmActionDialog
        open={!!confirm}
        action={confirm}
        buildConfirmTexts={buildConfirmTexts}
        actionLoading={actionLoading}
        executeAction={executeAction}
        onClose={() => setConfirm(null)}
      />

      {/* ✅ Progress Edit Dialog */}
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

      {/* Tree Dialog */}
      <CongViecTreeDialog
        open={treeDialog.open}
        onClose={handleCloseTree}
        congViec={treeDialog.congViec}
        enableViewDetail={true}
      />
    </Dialog>
  );
};

export default CongViecDetailDialog;
