import React from "react";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";
import {
  Undo as UndoIcon,
  FormatClear as FormatClearIcon,
} from "@mui/icons-material";

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
  // So khớp một-điểm: dùng user._id (UserID) và comment.NguoiBinhLuanID (lưu UserID)
  const canRecall = (u, c) => {
    if (c?.TrangThai === "DELETED") return false;
    return String(u?._id || "") === String(c?.NguoiBinhLuanID || "");
  };

  const canRecallText = canRecall; // cùng điều kiện với thu hồi toàn bộ

  // Xác nhận hành động để tránh click nhầm
  const [confirm, setConfirm] = React.useState({
    open: false,
    type: null,
    data: null,
  });
  const openConfirm = (type, data) => setConfirm({ open: true, type, data });
  const closeConfirm = () =>
    setConfirm({ open: false, type: null, data: null });
  const handleConfirm = () => {
    try {
      if (confirm.type === "recallAll") {
        onRecallComment &&
          onRecallComment(congViecId, confirm?.data?.commentId);
      } else if (confirm.type === "recallText") {
        onRecallCommentText &&
          onRecallCommentText(congViecId, confirm?.data?.commentId);
      } else if (confirm.type === "deleteFile") {
        onDeleteFile && onDeleteFile(confirm?.data?.file);
      }
    } finally {
      closeConfirm();
    }
  };
  const confirmTexts = {
    recallAll:
      "Bạn có chắc muốn thu hồi bình luận này? Cả nội dung và tệp đính kèm sẽ bị thu hồi.",
    recallText:
      "Bạn có chắc muốn xóa nội dung của bình luận này? Các tệp đính kèm sẽ được giữ nguyên.",
    deleteFile: (fileName) =>
      `Bạn có chắc muốn thu hồi tệp "${fileName || ""}"?`,
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
              <Avatar sx={{ width: 40, height: 40 }}>
                {comment.NguoiBinhLuan?.Ten?.charAt(0) || "U"}
              </Avatar>
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
                      {comment.NguoiBinhLuan?.Ten || "Người dùng"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateTime(
                        comment.NgayBinhLuan || comment.createdAt
                      )}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {canRecall(user, comment) && (
                      <Tooltip title="Thu hồi bình luận (cả nội dung và tệp)">
                        <span>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() =>
                              openConfirm("recallAll", {
                                commentId: comment._id,
                              })
                            }
                          >
                            <UndoIcon fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                  </Box>
                </Box>
              }
              secondary={
                <Stack spacing={1} sx={{ mt: 0.5 }}>
                  {comment.TrangThai === "DELETED" ? (
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontStyle: "italic", fontSize: "1rem" }}
                    >
                      Tin nhắn đã được thu hồi
                    </Typography>
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
                            pr: 4,
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
                          {onRecallCommentText &&
                            canRecallText(user, comment) && (
                              <Tooltip title="Thu hồi nội dung (chỉ xóa text, giữ tệp)">
                                <IconButton
                                  size="small"
                                  color="warning"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openConfirm("recallText", {
                                      commentId: comment._id,
                                    });
                                  }}
                                  sx={{
                                    position: "absolute",
                                    top: 4,
                                    right: 4,
                                    p: 0.25,
                                  }}
                                >
                                  <FormatClearIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
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
                                  }}
                                  onClick={() => onViewFile(f)}
                                >
                                  <img
                                    alt={f.TenGoc}
                                    src={f.inlineUrl}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                      display: "block",
                                    }}
                                  />
                                  {canDeleteFile && (
                                    <Box
                                      sx={{
                                        position: "absolute",
                                        top: 4,
                                        right: 4,
                                        backgroundColor: "rgba(0,0,0,0.5)",
                                        color: "#fff",
                                        px: 0.5,
                                        py: 0.25,
                                        borderRadius: 1,
                                        fontSize: 11,
                                        cursor: "pointer",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openConfirm("deleteFile", { file: f });
                                      }}
                                    >
                                      Xóa
                                    </Box>
                                  )}
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
                                          openConfirm("deleteFile", { file: f })
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
                                        openConfirm("deleteFile", { file: f })
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
                                  <Avatar sx={{ width: 28, height: 28 }}>
                                    {rep.NguoiBinhLuan?.Ten?.charAt(0) || "U"}
                                  </Avatar>
                                  <Typography variant="subtitle2">
                                    {rep.NguoiBinhLuan?.Ten || "Người dùng"}
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
                                    <Tooltip title="Thu hồi bình luận">
                                      <IconButton
                                        size="small"
                                        color="warning"
                                        onClick={() =>
                                          openConfirm("recallAll", {
                                            commentId: rep._id,
                                          })
                                        }
                                      >
                                        <UndoIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  )}
                                </Box>
                                {rep.TrangThai === "DELETED" ? (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    sx={{ fontStyle: "italic" }}
                                  >
                                    Tin nhắn đã được thu hồi
                                  </Typography>
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
                                          pr: 4,
                                          borderRadius: 2,
                                          backgroundColor:
                                            theme.palette.grey[50],
                                        }}
                                      >
                                        <Typography variant="body2">
                                          {rep.NoiDung}
                                        </Typography>
                                        {onRecallCommentText &&
                                          canRecallText(user, rep) && (
                                            <Tooltip title="Thu hồi nội dung (chỉ xóa text, giữ tệp)">
                                              <IconButton
                                                size="small"
                                                color="warning"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  openConfirm("recallText", {
                                                    commentId: rep._id,
                                                  });
                                                }}
                                                sx={{
                                                  position: "absolute",
                                                  top: 4,
                                                  right: 4,
                                                  p: 0.25,
                                                }}
                                              >
                                                <FormatClearIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          )}
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
                                                }}
                                                onClick={() => onViewFile(f)}
                                              >
                                                <img
                                                  alt={f.TenGoc}
                                                  src={f.inlineUrl}
                                                  style={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    display: "block",
                                                  }}
                                                />
                                                {canDeleteFile && (
                                                  <Box
                                                    sx={{
                                                      position: "absolute",
                                                      top: 4,
                                                      right: 4,
                                                      backgroundColor:
                                                        "rgba(0,0,0,0.5)",
                                                      color: "#fff",
                                                      px: 0.5,
                                                      py: 0.25,
                                                      borderRadius: 1,
                                                      fontSize: 11,
                                                      cursor: "pointer",
                                                    }}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      openConfirm(
                                                        "deleteFile",
                                                        { file: f }
                                                      );
                                                    }}
                                                  >
                                                    Xóa
                                                  </Box>
                                                )}
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
                                                        openConfirm(
                                                          "deleteFile",
                                                          { file: f }
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
                                                      openConfirm(
                                                        "deleteFile",
                                                        { file: f }
                                                      )
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
      {/* Dialog xác nhận */}
      <Dialog
        open={confirm.open}
        onClose={closeConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Xác nhận</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {confirm.type === "deleteFile"
              ? confirmTexts.deleteFile(confirm?.data?.file?.TenGoc)
              : confirm.type === "recallAll"
              ? confirmTexts.recallAll
              : confirm.type === "recallText"
              ? confirmTexts.recallText
              : ""}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirm}>Hủy</Button>
          <Button
            color="warning"
            variant="contained"
            onClick={handleConfirm}
            autoFocus
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
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
