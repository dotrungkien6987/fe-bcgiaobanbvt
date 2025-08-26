import React from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Slider,
  TextField,
} from "@mui/material";
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
  quickProgress,
  canEditProgress,
  handleProgressChange,
  handleProgressInputChange,
  commitProgressUpdate,
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
                <Grid item xs={12} lg={8}>
                  <Slider
                    size="small"
                    value={quickProgress}
                    onChange={handleProgressChange}
                    onChangeCommitted={(e, val) =>
                      commitProgressUpdate(Array.isArray(val) ? val[0] : val)
                    }
                    valueLabelDisplay="auto"
                    step={1}
                    min={0}
                    max={100}
                    aria-label="Tiến độ công việc"
                  />
                </Grid>
                <Grid item xs={12} lg={4}>
                  <TextField
                    label="%"
                    size="small"
                    type="number"
                    value={quickProgress}
                    onChange={handleProgressInputChange}
                    onBlur={(e) => commitProgressUpdate(e.target.value)}
                    inputProps={{ min: 0, max: 100 }}
                    sx={{ width: 120 }}
                  />
                </Grid>
              </Grid>
            )}
          </Box>
        )}

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

        <Card
          elevation={0}
          sx={{
            mt: 3,
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[200]}`,
            backgroundColor: theme.palette.grey[25] || theme.palette.grey[50],
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2 }}>
              Chỉnh sửa nhanh
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} lg={6}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Tiến độ tổng (%)
                    </Typography>
                    <Slider
                      size="small"
                      value={quickProgress}
                      onChange={handleProgressChange}
                      onChangeCommitted={(e, val) =>
                        commitProgressUpdate(Array.isArray(val) ? val[0] : val)
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
                    onBlur={(e) => commitProgressUpdate(e.target.value)}
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
