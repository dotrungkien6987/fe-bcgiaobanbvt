import React from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Stack,
} from "@mui/material";
import {
  ExpandMore as ExpandIcon,
  Description as DescIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material";
import WarningConfigBlock from "./WarningConfigBlock";
import MetricsBlock from "./MetricsBlock";
import CommentIcon from "@mui/icons-material/Comment";
import CommentComposer from "./CommentComposer";
import CommentsList from "./CommentsList";

const TaskMainContent = ({
  congViec,
  theme,
  newComment,
  setNewComment,
  pendingFiles,
  setPendingFiles,
  dragCommentActive,
  setDragCommentActive,
  handleAddComment,
  submittingComment,
  user,
  congViecId,
  dispatch,
  recallComment,
  recallCommentText,
  deleteFileThunk,
  markCommentFileDeleted,
  fetchReplies,
  addReply,
  createCommentWithFiles,
  repliesByParent,
  initialReplyCounts,
  handleViewFile,
  handleDownloadFile,
  formatDateTime,
  routineTaskSelectorNode,
}) => {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        mb: 3,
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          p: 2,
          borderBottom: "none",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "1.1rem", sm: "1.2rem" },
          }}
        >
          <DescriptionIcon sx={{ fontSize: 26 }} />
          Thông tin công việc
        </Typography>
      </Box>
      <CardContent sx={{ p: 3 }}>
        <Accordion
          defaultExpanded={false}
          sx={{
            boxShadow: 0,
            border: "none",
            bgcolor: "transparent",
            "&:before": { display: "none" },
            "&.Mui-expanded": {
              margin: 0,
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandIcon />}
            sx={{
              minHeight: 48,
              px: 2,
              mx: 0,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              bgcolor: "background.paper",
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                bgcolor: "action.hover",
                borderColor: "primary.main",
              },
              "&.Mui-expanded": {
                minHeight: 48,
                borderBottomLeftRadius: 0,
                borderBottomRightRadius: 0,
                borderBottom: "none",
              },
              "& .MuiAccordionSummary-content": {
                my: 1.5,
                alignItems: "center",
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ width: "100%", pr: 1 }}
            >
              <DescIcon
                sx={{
                  color: "primary.main",
                  fontSize: 22,
                  flexShrink: 0,
                }}
              />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 500,
                  color: "text.primary",
                  flex: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  lineHeight: 1.5,
                }}
              >
                {congViec.MoTa || "Không có mô tả"}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  display: { xs: "none", sm: "block" },
                }}
              >
                Xem chi tiết
              </Typography>
            </Stack>
          </AccordionSummary>

          <AccordionDetails
            sx={{
              px: 2,
              pt: 2,
              pb: 2,
              border: "1px solid",
              borderColor: "divider",
              borderTop: "none",
              borderBottomLeftRadius: 1,
              borderBottomRightRadius: 1,
              bgcolor: "background.paper",
            }}
          >
            {/* Mô tả đầy đủ */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                bgcolor: "grey.50",
                borderStyle: "dashed",
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  lineHeight: 1.6,
                  color: "text.primary",
                }}
              >
                {congViec.MoTa || "Không có mô tả"}
              </Typography>
            </Paper>

            {/* Cảnh báo & Thống kê */}
            <WarningConfigBlock cv={congViec} />
            <MetricsBlock cv={congViec} />
          </AccordionDetails>
        </Accordion>
      </CardContent>
    </Card>
  );
};

const CommentsSection = ({
  congViec,
  theme,
  newComment,
  setNewComment,
  pendingFiles,
  setPendingFiles,
  dragCommentActive,
  setDragCommentActive,
  handleAddComment,
  submittingComment,
  user,
  congViecId,
  dispatch,
  recallComment,
  recallCommentText,
  deleteFileThunk,
  markCommentFileDeleted,
  fetchReplies,
  addReply,
  createCommentWithFiles,
  repliesByParent,
  initialReplyCounts,
  handleViewFile,
  handleDownloadFile,
  formatDateTime,
}) => (
  <Card
    elevation={0}
    sx={{
      bgcolor: "grey.50",
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 2,
      mb: 3,
    }}
  >
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 2,
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: "text.primary",
          display: "flex",
          alignItems: "center",
          gap: 1,
          fontSize: { xs: "1.05rem", sm: "1.15rem" },
        }}
      >
        <CommentIcon sx={{ fontSize: 24 }} />
        Bình luận & Thảo luận ({congViec.BinhLuans?.length || 0})
      </Typography>
    </Box>
    <CardContent sx={{ p: 3 }}>
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
            dispatch(
              markCommentFileDeleted({
                congViecId,
                fileId: f._id,
              })
            );
          } catch {}
        }}
        repliesByParent={repliesByParent}
        initialReplyCounts={initialReplyCounts}
        onFetchReplies={(parentId) => dispatch(fetchReplies(parentId))}
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
);

export { TaskMainContent as default, CommentsSection };
