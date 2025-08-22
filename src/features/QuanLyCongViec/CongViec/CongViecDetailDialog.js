import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tooltip,
  Slider,
  TextField,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Flag as FlagIcon,
  Comment as CommentIcon,
  CheckCircle as CheckCircleIcon,
  Palette as PaletteIcon,
  Tune as TuneIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import {
  formatDateTime,
  getStatusColor,
  getPriorityColor,
  getStatusText,
  getPriorityText,
  getDueStatus,
  DUE_COLOR_MAP,
  DUE_LABEL_MAP,
} from "../../../utils/congViecUtils";
import {
  getCongViecDetail,
  recallComment,
  recallCommentText,
  addReply,
  fetchReplies,
  updateCongViec,
  giaoViec,
  tiepNhan,
  hoanThanh,
  duyetHoanThanh,
  markCommentFileDeleted,
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

const CongViecDetailDialog = ({ open, onClose, congViecId, onEdit }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("md"));
  const dispatch = useDispatch();
  const { user } = useAuth();

  const { congViecDetail, loading, error } = useSelector(
    (state) => state.congViec
  );
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

  // helpers moved into child components

  const { handleViewFile, handleDownloadFile } = useFilePreview();

  useEffect(() => {
    if (open && congViecId) {
      dispatch(getCongViecDetail(congViecId));
      dispatch(fetchFilesByTask(congViecId));
      dispatch(countFilesByTask(congViecId));
      dispatch(fetchColorConfig());
    }
  }, [open, congViecId, dispatch]);

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

  if (!congViecDetail && !loading) return null;

  const congViec = congViecDetail || {};
  const due = getDueStatus(congViec);

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
            {due && (
              <Chip
                label={DUE_LABEL_MAP[due]}
                size="small"
                sx={{
                  fontWeight: 700,
                  backgroundColor: DUE_COLOR_MAP[due] || "#D32F2F",
                  color: "#fff",
                }}
              />
            )}
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
        {loading ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography>Đang tải...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Typography color="error">Có lỗi xảy ra: {error}</Typography>
          </Box>
        ) : (
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
                  {/* Header Info */}
                  <Box sx={{ mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 2,
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                      }}
                    >
                      {congViec.TieuDe || "Tiêu đề công việc"}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 4, borderColor: theme.palette.divider }} />

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

                  {/* Progress */}
                  {(congViec.PhanTramTienDoTong !== undefined ||
                    congViec.TienDo !== undefined) && (
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
                    </Box>
                  )}

                  {/* Actions */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      flexWrap: "wrap",
                      p: 3,
                      backgroundColor:
                        theme.palette.grey[25] || theme.palette.grey[50],
                      borderRadius: 2,
                      border: `1px solid ${theme.palette.grey[200]}`,
                    }}
                  >
                    {/* Flow buttons */}
                    {congViec.TrangThai === "TAO_MOI" && (
                      <Button
                        variant="contained"
                        onClick={() => dispatch(giaoViec(congViecId))}
                        size="medium"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          px: 3,
                        }}
                      >
                        Giao việc
                      </Button>
                    )}
                    {congViec.TrangThai === "DA_GIAO" && (
                      <Button
                        variant="outlined"
                        onClick={() => dispatch(tiepNhan(congViecId))}
                        size="medium"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          px: 3,
                        }}
                      >
                        Tiếp nhận
                      </Button>
                    )}
                    {congViec.TrangThai === "DANG_THUC_HIEN" && (
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircleIcon />}
                        onClick={() => dispatch(hoanThanh(congViecId))}
                        size="medium"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          px: 3,
                        }}
                      >
                        Hoàn thành
                      </Button>
                    )}
                    {congViec.TrangThai === "CHO_DUYET" && (
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={() => dispatch(duyetHoanThanh(congViecId))}
                        size="medium"
                        sx={{
                          borderRadius: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          px: 3,
                        }}
                      >
                        Duyệt hoàn thành
                      </Button>
                    )}
                  </Box>

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
                    onReplyWithFiles={(parentId, noiDung, files, onProgress) =>
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

                  {(!congViec.BinhLuans || congViec.BinhLuans.length === 0) && (
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
                    overdue={due === "QUA_HAN"}
                    formatDateTime={formatDateTime}
                    cooperators={cooperators}
                  />
                </CardContent>
              </Card>
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
    </Dialog>
  );
};

export default CongViecDetailDialog;
