import React from "react";
import {
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  Snackbar,
  Alert,
} from "@mui/material";
import { getThumbUrl } from "utils/fileUrl";
import {
  MoreVert as MoreVertIcon,
  ContentCopy as ContentCopyIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
} from "@mui/icons-material";

import EmployeeAvatar from "components/EmployeeAvatar";

const CommentsList = ({
  theme,
  comments = [],
  user,
  congViecId,
  onRecallComment,
  onViewFile,
  onDownloadFile,
  onRecallCommentText,
  onDeleteFile,
  // Replies support
  repliesByParent = {},
  initialReplyCounts = {},
  onFetchReplies,
  onReplyText,
  onReplyWithFiles,
  formatDateTime,
}) => {
  // State cho menu dropdown và snackbar
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [activeComment, setActiveComment] = React.useState(null);
  const [snackbar, setSnackbar] = React.useState({
    open: false,
    message: "",
    action: null,
    commentData: null,
  });
  const [, setHoveredFile] = React.useState(null); // eslint-disable-line no-unused-vars

  // So khớp NhanVienID với time limit (5 phút)
  const canRecall = (u, c) => {
    if (c?.TrangThai === "DELETED") return false;

    // Extract author NhanVien ID from both possible shapes
    const authorNhanVienId =
      c?.NguoiBinhLuan?._id || c?.NguoiBinhLuanID?._id || c?.NguoiBinhLuanID;
    const isOwner =
      String(u?.NhanVienID || "") === String(authorNhanVienId || "");

    if (!isOwner) return false;

    // Check time limit (5 phút)
    const createdAt = new Date(c?.NgayBinhLuan || c?.createdAt);
    const now = new Date();
    const diffMinutes = (now - createdAt) / 1000 / 60;

    return diffMinutes <= 5;
  };

  // Handlers cho menu actions
  const handleMenuOpen = (event, comment) => {
    setAnchorEl(event.currentTarget);
    setActiveComment(comment);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setActiveComment(null);
  };

  const handleRecallClick = () => {
    handleMenuClose();
    if (!activeComment) return;

    const commentId = activeComment._id;
    const commentData = { ...activeComment };

    // Show snackbar immediately
    setSnackbar({
      open: true,
      message: "Đã thu hồi tin nhắn",
      action: () => handleUndoRecall(commentData),
      commentData: commentData,
    });

    // Call API after short delay for better UX
    setTimeout(() => {
      onRecallComment && onRecallComment(congViecId, commentId);
    }, 300);
  };

  const handleUndoRecall = (commentData) => {
    // TODO: Implement undo API call if backend supports it
    console.log("Undo recall for:", commentData._id);
    setSnackbar({ ...snackbar, open: false });
  };

  const handleCopyText = () => {
    if (!activeComment?.NoiDung) {
      handleMenuClose();
      return;
    }

    navigator.clipboard
      .writeText(activeComment.NoiDung)
      .then(() => {
        setSnackbar({
          open: true,
          message: "Đã sao chép nội dung",
          action: null,
          commentData: null,
        });
      })
      .catch(() => {
        setSnackbar({
          open: true,
          message: "Không thể sao chép",
          action: null,
          commentData: null,
        });
      });

    handleMenuClose();
  };

  const handleDeleteFileAction = (file) => {
    setSnackbar({
      open: true,
      message: `Đã xóa ${file.TenGoc || "tệp"}`,
      action: null,
      commentData: null,
    });
    onDeleteFile && onDeleteFile(file);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Replies local UI state
  const [openReplyFor, setOpenReplyFor] = React.useState(null); // parentId
  const replyRefs = React.useRef({}); // parentId -> input element
  const [pendingFiles, setPendingFiles] = React.useState({}); // parentId -> File[]
  const [expanded, setExpanded] = React.useState({}); // parentId -> boolean
  const [submitting, setSubmitting] = React.useState({}); // parentId -> boolean

  const getBucket = (parentId) =>
    repliesByParent?.[parentId] || {
      items: [],
      loading: false,
      loaded: false,
      error: null,
    };

  // Lấy số lượng phản hồi để hiển thị tức thì
  const getReplyCount = (comment) => {
    const parentId = comment?._id;
    const bucket = getBucket(parentId);
    if (bucket?.loaded) return bucket.items?.length || 0;
    if (typeof initialReplyCounts?.[parentId] === "number")
      return initialReplyCounts[parentId];
    return (
      comment?.SoLuongPhanHoi ??
      comment?.RepliesCount ??
      comment?.SoLuongTraLoi ??
      0
    );
  };

  const toggleReplies = async (parentId) => {
    const willExpand = !expanded[parentId];
    setExpanded((s) => ({ ...s, [parentId]: willExpand }));
    if (willExpand) {
      const bucket = getBucket(parentId);
      if (!bucket.loaded && !bucket.loading && onFetchReplies) {
        try {
          await onFetchReplies(parentId);
        } catch {}
      }
    }
  };

  const handleChooseFiles = (parentId, filesList) => {
    const files = Array.from(filesList || []);
    setPendingFiles((s) => ({ ...s, [parentId]: files }));
  };

  const handleSubmitReply = async (parentId) => {
    const text = (replyRefs.current[parentId]?.value || "").trim();
    const files = pendingFiles[parentId] || [];
    if (!text && files.length === 0) return;
    setSubmitting((s) => ({ ...s, [parentId]: true }));
    try {
      if (files.length > 0 && onReplyWithFiles) {
        await onReplyWithFiles(parentId, text, files);
      } else if (onReplyText) {
        await onReplyText(parentId, text);
      }
      if (replyRefs.current[parentId]) replyRefs.current[parentId].value = "";
      setPendingFiles((s) => ({ ...s, [parentId]: [] }));
      // ensure replies area is expanded to show the new one
      setExpanded((s) => ({ ...s, [parentId]: true }));
    } catch {
    } finally {
      setSubmitting((s) => ({ ...s, [parentId]: false }));
    }
  };

  return (
    <Box sx={{ mt: 2, maxHeight: 320, overflowY: "auto" }}>
      <List>
        {comments.map((comment, index) => (
          <ListItem
            key={comment._id || index}
            alignItems="flex-start"
            sx={{ px: 0 }}
          >
            <ListItemAvatar>
              <EmployeeAvatar
                size="md"
                nhanVienId={
                  comment.NguoiBinhLuan?._id ||
                  comment.NguoiBinhLuanID?._id ||
                  comment.NguoiBinhLuanID
                }
                name={
                  (comment.NguoiBinhLuan || comment.NguoiBinhLuanID)?.HoTen ||
                  (comment.NguoiBinhLuan || comment.NguoiBinhLuanID)?.Ten
                }
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 0.5,
                    gap: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 0,
                    }}
                  >
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {(comment.NguoiBinhLuan || comment.NguoiBinhLuanID)
                        ?.Ten || "Người dùng"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(
                        comment.NgayBinhLuan || comment.createdAt
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {canRecall(user, comment) && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, comment)}
                        sx={{
                          opacity: 0,
                          transition: "opacity 0.2s",
                          ".MuiListItem-root:hover &": { opacity: 1 },
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              }
              secondary={
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  {comment.TrangThai === "DELETED" ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        p: 2,
                        backgroundColor: theme.palette.grey[100],
                        borderRadius: 2,
                        border: `1px dashed ${theme.palette.grey[300]}`,
                      }}
                    >
                      <Box
                        component="span"
                        sx={{
                          fontSize: "1.2rem",
                          filter: "grayscale(1)",
                          opacity: 0.5,
                        }}
                      >
                        🚫
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontStyle: "italic" }}
                      >
                        Tin nhắn đã được thu hồi
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      {!!comment.NoiDung && (
                        <Paper
                          variant="outlined"
                          sx={{
                            display: "inline-block",
                            position: "relative",
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            maxWidth: "85%",
                            backgroundColor: theme.palette.grey[50],
                          }}
                        >
                          <Typography
                            variant="body1"
                            sx={{ fontSize: "1rem", lineHeight: 1.6 }}
                          >
                            {comment.NoiDung}
                          </Typography>
                        </Paper>
                      )}

                      {!!(comment.Files && comment.Files.length) && (
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {comment.Files.map((f) => {
                            if (f.TrangThai === "DELETED") {
                              return (
                                <Chip
                                  key={f._id}
                                  label="Tệp đã được thu hồi"
                                  variant="outlined"
                                  sx={{
                                    maxWidth: 220,
                                    fontStyle: "italic",
                                    opacity: 0.8,
                                    pointerEvents: "none",
                                  }}
                                />
                              );
                            }
                            const name = f.TenGoc || "";
                            const isImage =
                              /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name);
                            const isPdf =
                              /\.pdf$/i.test(name) ||
                              /pdf/i.test(f.LoaiFile || "");
                            const canDeleteFile = Boolean(onDeleteFile);
                            if (isImage) {
                              // DEBUG: Log thumbnail URL
                              const resolvedThumbUrl = getThumbUrl(f.thumbUrl);
                              console.log(
                                "[FE THUMB] File:",
                                f.TenGoc,
                                "| thumbUrl:",
                                f.thumbUrl,
                                "| resolved:",
                                resolvedThumbUrl
                              );

                              return (
                                <Box
                                  key={f._id}
                                  sx={{
                                    width: 140,
                                    height: 100,
                                    position: "relative",
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    border: `1px solid ${theme.palette.divider}`,
                                    "&:hover .file-actions": { opacity: 1 },
                                  }}
                                  onMouseEnter={() => setHoveredFile(f._id)}
                                  onMouseLeave={() => setHoveredFile(null)}
                                  onClick={() => onViewFile(f)}
                                >
                                  <img
                                    alt={f.TenGoc}
                                    src={resolvedThumbUrl}
                                    onError={(e) => {
                                      console.error(
                                        "[FE THUMB] ❌ Image load FAILED:",
                                        resolvedThumbUrl
                                      );
                                      console.error(
                                        "[FE THUMB] Error event:",
                                        e
                                      );
                                    }}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                  <Box
                                    className="file-actions"
                                    sx={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 0,
                                      backgroundColor: "rgba(0,0,0,0.5)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      gap: 1,
                                      opacity: 0,
                                      transition: "opacity 0.2s",
                                    }}
                                  >
                                    <IconButton
                                      size="small"
                                      sx={{ color: "#fff" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onViewFile(f);
                                      }}
                                    >
                                      <VisibilityIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton
                                      size="small"
                                      sx={{ color: "#fff" }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDownloadFile(f);
                                      }}
                                    >
                                      <GetAppIcon fontSize="small" />
                                    </IconButton>
                                    {canDeleteFile && (
                                      <IconButton
                                        size="small"
                                        sx={{ color: "#fff" }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteFileAction(f);
                                        }}
                                      >
                                        <DeleteIcon fontSize="small" />
                                      </IconButton>
                                    )}
                                  </Box>
                                </Box>
                              );
                            }
                            if (isPdf) {
                              return (
                                <Chip
                                  key={f._id}
                                  label={f.TenGoc}
                                  variant="outlined"
                                  onClick={() => onViewFile(f)}
                                  sx={{ maxWidth: 220 }}
                                  onDelete={
                                    canDeleteFile
                                      ? () => handleDeleteFileAction(f)
                                      : undefined
                                  }
                                />
                              );
                            }
                            return (
                              <Chip
                                key={f._id}
                                label={f.TenGoc}
                                variant="outlined"
                                onClick={() => onDownloadFile(f)}
                                sx={{ maxWidth: 220 }}
                                onDelete={
                                  canDeleteFile
                                    ? () => handleDeleteFileAction(f)
                                    : undefined
                                }
                              />
                            );
                          })}
                        </Stack>
                      )}

                      {/* Reply controls */}
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{ mt: 0.5 }}
                      >
                        <Button
                          size="small"
                          sx={{ fontSize: "0.9rem", fontWeight: 600 }}
                          onClick={() =>
                            setOpenReplyFor((cur) =>
                              cur === comment._id ? null : comment._id
                            )
                          }
                        >
                          Phản hồi
                        </Button>
                        <Button
                          size="small"
                          sx={{ fontSize: "0.9rem", fontWeight: 600 }}
                          onClick={() => toggleReplies(comment._id)}
                        >
                          {expanded[comment._id]
                            ? `Ẩn ${getReplyCount(comment)} phản hồi`
                            : `Xem ${getReplyCount(comment)} phản hồi`}
                        </Button>
                        {getBucket(comment._id).loading && (
                          <CircularProgress size={16} />
                        )}
                      </Stack>

                      {openReplyFor === comment._id && (
                        <Box sx={{ mt: 1 }}>
                          <TextField
                            size="small"
                            fullWidth
                            multiline
                            maxRows={4}
                            placeholder="Viết phản hồi..."
                            inputRef={(el) =>
                              (replyRefs.current[comment._id] = el)
                            }
                          />
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 1 }}
                          >
                            <input
                              id={`reply-file-${comment._id}`}
                              type="file"
                              multiple
                              style={{ display: "none" }}
                              onChange={(e) =>
                                handleChooseFiles(comment._id, e.target.files)
                              }
                            />
                            <label htmlFor={`reply-file-${comment._id}`}>
                              <Button
                                size="small"
                                variant="outlined"
                                component="span"
                              >
                                Đính kèm
                              </Button>
                            </label>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => handleSubmitReply(comment._id)}
                              disabled={submitting[comment._id]}
                            >
                              {submitting[comment._id] ? "Đang gửi..." : "Gửi"}
                            </Button>
                            {(pendingFiles[comment._id] || []).length > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {(pendingFiles[comment._id] || []).length} tệp
                                đã chọn
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      )}

                      {expanded[comment._id] && (
                        <Box sx={{ pl: 6, pt: 1 }}>
                          {getBucket(comment._id).items.map((rep) => (
                            <Box key={rep._id} sx={{ mb: 1 }}>
                              <Stack spacing={0.5}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <EmployeeAvatar
                                    size="xs"
                                    sx={{ width: 28, height: 28 }}
                                    nhanVienId={
                                      rep.NguoiBinhLuan?._id ||
                                      rep.NguoiBinhLuanID?._id ||
                                      rep.NguoiBinhLuanID
                                    }
                                    name={
                                      (rep.NguoiBinhLuan || rep.NguoiBinhLuanID)
                                        ?.HoTen ||
                                      (rep.NguoiBinhLuan || rep.NguoiBinhLuanID)
                                        ?.Ten
                                    }
                                  />
                                  <Typography variant="subtitle2">
                                    {(rep.NguoiBinhLuan || rep.NguoiBinhLuanID)
                                      ?.Ten || "Người dùng"}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {formatDateTime(
                                      rep.NgayBinhLuan || rep.createdAt
                                    )}
                                  </Typography>
                                  {canRecall(user, rep) && (
                                    <IconButton
                                      size="small"
                                      onClick={(e) => handleMenuOpen(e, rep)}
                                      sx={{
                                        opacity: 0,
                                        transition: "opacity 0.2s",
                                        "&:hover": { opacity: 1 },
                                      }}
                                    >
                                      <MoreVertIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                                {rep.TrangThai === "DELETED" ? (
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      p: 1,
                                      backgroundColor: theme.palette.grey[50],
                                      borderRadius: 1,
                                      border: `1px dashed ${theme.palette.grey[300]}`,
                                    }}
                                  >
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      sx={{ fontStyle: "italic" }}
                                    >
                                      🚫 Tin nhắn đã được thu hồi
                                    </Typography>
                                  </Box>
                                ) : (
                                  <>
                                    {!!rep.NoiDung && (
                                      <Paper
                                        variant="outlined"
                                        sx={{
                                          display: "inline-block",
                                          position: "relative",
                                          px: 1.5,
                                          py: 1,
                                          borderRadius: 2,
                                          backgroundColor:
                                            theme.palette.grey[50],
                                        }}
                                      >
                                        <Typography variant="body2">
                                          {rep.NoiDung}
                                        </Typography>
                                      </Paper>
                                    )}
                                    {!!(rep.Files && rep.Files.length) && (
                                      <Stack
                                        direction="row"
                                        spacing={1}
                                        flexWrap="wrap"
                                      >
                                        {rep.Files.map((f) => {
                                          if (f.TrangThai === "DELETED") {
                                            return (
                                              <Chip
                                                key={f._id}
                                                label="Tệp đã được thu hồi"
                                                variant="outlined"
                                                sx={{
                                                  maxWidth: 220,
                                                  fontStyle: "italic",
                                                  opacity: 0.8,
                                                  pointerEvents: "none",
                                                }}
                                              />
                                            );
                                          }
                                          const name = f.TenGoc || "";
                                          const isImage =
                                            /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(
                                              name
                                            );
                                          const isPdf =
                                            /\.pdf$/i.test(name) ||
                                            /pdf/i.test(f.LoaiFile || "");
                                          const canDeleteFile =
                                            Boolean(onDeleteFile);
                                          if (isImage) {
                                            return (
                                              <Box
                                                key={f._id}
                                                sx={{
                                                  width: 140,
                                                  height: 100,
                                                  position: "relative",
                                                  borderRadius: 1,
                                                  overflow: "hidden",
                                                  cursor: "pointer",
                                                  border: `1px solid ${theme.palette.divider}`,
                                                  "&:hover .file-actions": {
                                                    opacity: 1,
                                                  },
                                                }}
                                                onClick={() => onViewFile(f)}
                                              >
                                                <img
                                                  alt={f.TenGoc}
                                                  src={getThumbUrl(f.thumbUrl)}
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                  }}
                                                />
                                                <Box
                                                  className="file-actions"
                                                  sx={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    backgroundColor:
                                                      "rgba(0,0,0,0.5)",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    gap: 1,
                                                    opacity: 0,
                                                    transition: "opacity 0.2s",
                                                  }}
                                                >
                                                  <IconButton
                                                    size="small"
                                                    sx={{ color: "#fff" }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      onViewFile(f);
                                                    }}
                                                  >
                                                    <VisibilityIcon fontSize="small" />
                                                  </IconButton>
                                                  <IconButton
                                                    size="small"
                                                    sx={{ color: "#fff" }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      onDownloadFile(f);
                                                    }}
                                                  >
                                                    <GetAppIcon fontSize="small" />
                                                  </IconButton>
                                                  {canDeleteFile && (
                                                    <IconButton
                                                      size="small"
                                                      sx={{ color: "#fff" }}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteFileAction(
                                                          f
                                                        );
                                                      }}
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  )}
                                                </Box>
                                              </Box>
                                            );
                                          }
                                          if (isPdf) {
                                            return (
                                              <Chip
                                                key={f._id}
                                                label={f.TenGoc}
                                                variant="outlined"
                                                onClick={() => onViewFile(f)}
                                                sx={{ maxWidth: 220 }}
                                                onDelete={
                                                  canDeleteFile
                                                    ? () =>
                                                        handleDeleteFileAction(
                                                          f
                                                        )
                                                    : undefined
                                                }
                                              />
                                            );
                                          }
                                          return (
                                            <Chip
                                              key={f._id}
                                              label={f.TenGoc}
                                              variant="outlined"
                                              onClick={() => onDownloadFile(f)}
                                              sx={{ maxWidth: 220 }}
                                              onDelete={
                                                canDeleteFile
                                                  ? () =>
                                                      handleDeleteFileAction(f)
                                                  : undefined
                                              }
                                            />
                                          );
                                        })}
                                      </Stack>
                                    )}
                                  </>
                                )}
                              </Stack>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </>
                  )}
                </Stack>
              }
            />
          </ListItem>
        ))}
      </List>

      {/* Menu dropdown cho comment actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleRecallClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Thu hồi</ListItemText>
        </MenuItem>
        {activeComment?.NoiDung && (
          <MenuItem onClick={handleCopyText}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sao chép</ListItemText>
          </MenuItem>
        )}
      </Menu>

      {/* Snackbar với Undo action */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={handleSnackbarClose}
          action={
            snackbar.action && (
              <Button color="inherit" size="small" onClick={snackbar.action}>
                Hoàn tác
              </Button>
            )
          }
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
// Tránh re-render danh sách bình luận khi chỉ thay đổi state của ô nhập liệu ở parent
const areEqual = (prev, next) => {
  return (
    prev.congViecId === next.congViecId &&
    prev.theme === next.theme &&
    prev.user?._id === next.user?._id &&
    prev.comments === next.comments &&
    prev.repliesByParent === next.repliesByParent
  );
};

export default React.memo(CommentsList, areEqual);
