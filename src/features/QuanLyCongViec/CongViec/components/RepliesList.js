import React from "react";
import {
  Avatar,
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Undo as UndoIcon,
  FormatClear as FormatClearIcon,
} from "@mui/icons-material";

const RepliesList = React.memo(
  ({
    theme,
    replies,
    user,
    canRecall,
    canRecallText,
    onRecallComment,
    onRecallCommentText,
    onViewFile,
    onDownloadFile,
    onDeleteFile,
    openConfirm,
    formatDateTime,
  }) => {
    return (
      <Box sx={{ pl: 6, pt: 1 }}>
        {replies.map((rep) => (
          <Box key={rep._id} sx={{ mb: 1 }}>
            <Stack spacing={0.5}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Avatar sx={{ width: 28, height: 28 }}>
                  {rep.NguoiBinhLuan?.Ten?.charAt(0) || "U"}
                </Avatar>
                <Typography variant="subtitle2">
                  {rep.NguoiBinhLuan?.Ten || "Người dùng"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(rep.NgayBinhLuan || rep.createdAt)}
                </Typography>
                {canRecall(user, rep) && (
                  <Tooltip title="Thu hồi bình luận">
                    <IconButton
                      size="small"
                      color="warning"
                      onClick={() =>
                        openConfirm("recallAll", { commentId: rep._id })
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
                        backgroundColor: theme.palette.grey[50],
                      }}
                    >
                      <Typography variant="body2">{rep.NoiDung}</Typography>
                      {onRecallCommentText && canRecallText(user, rep) && (
                        <Tooltip title="Thu hồi nội dung (chỉ xóa text, giữ tệp)">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={(e) => {
                              e.stopPropagation();
                              openConfirm("recallText", { commentId: rep._id });
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
                    <Stack direction="row" spacing={1} flexWrap="wrap">
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
                          /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(name);
                        const isPdf =
                          /\.pdf$/i.test(name) || /pdf/i.test(f.LoaiFile || "");
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
                                  ? () => openConfirm("deleteFile", { file: f })
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
                                ? () => openConfirm("deleteFile", { file: f })
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
    );
  }
);

RepliesList.displayName = "RepliesList";

export default RepliesList;
