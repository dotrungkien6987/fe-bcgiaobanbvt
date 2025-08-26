import React from "react";
import { Box, Typography, Card, CardContent } from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import { LoadingButton } from "@mui/lab";
import CommentIcon from "@mui/icons-material/Comment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningConfigBlock from "./WarningConfigBlock";
import MetricsBlock from "./MetricsBlock";
import CommentComposer from "./CommentComposer";
import CommentsList from "./CommentsList";
import { ACTION_META } from "../congViecSlice";

const TaskMainContent = ({
  congViec,
  theme,
  availableActions,
  actionLoading,
  triggerAction,
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
  routineTaskSelectorNode, // new: RoutineTaskSelector moved inside description block
}) => {
  return (
    <Card
      elevation={2}
      sx={{ borderRadius: 2, border: (t) => `1px solid ${t.palette.divider}` }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          {routineTaskSelectorNode && (
            <Box sx={{ mb: 3 }}>
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
                <AssignmentTurnedInIcon sx={{ fontSize: 22 }} /> Gán nhiệm vụ
                thường quy cho công việc này
              </Typography>
              {routineTaskSelectorNode}
            </Box>
          )}
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

        {/* Quick progress display removed; progress is now managed via history section */}

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

        <WarningConfigBlock cv={congViec} />
        <MetricsBlock cv={congViec} />

        {/* Quick edit card removed */}
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
    sx={{
      mt: 3,
      borderRadius: 2,
      border: (t) => `1px solid ${t.palette.divider}`,
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
