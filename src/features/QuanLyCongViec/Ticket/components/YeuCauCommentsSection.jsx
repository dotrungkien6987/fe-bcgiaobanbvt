/**
 * YeuCauCommentsSection - Wrapper adapter cho CommentsList
 *
 * Map props từ YeuCau sang CommentsList component (tái sử dụng từ CongViec)
 */
import React, { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box } from "@mui/material";
import CommentsList from "../../CongViec/components/CommentsList";
import CommentComposer from "../../CongViec/components/CommentComposer";
import useFilePreview from "../../CongViec/hooks/useFilePreview";
import {
  addYeuCauCommentWithFiles,
  recallYeuCauComment,
  recallYeuCauCommentText,
  deleteYeuCauFile,
  getBinhLuan,
} from "../yeuCauSlice";
import dayjs from "dayjs";

export default function YeuCauCommentsSection({ yeuCauId, user, theme }) {
  const dispatch = useDispatch();
  const { binhLuanList } = useSelector((state) => state.yeuCau);

  const { handleViewFile, handleDownloadFile } = useFilePreview();

  // State for new comment form
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragCommentActive, setDragCommentActive] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Cache replies in the same shape as CongViec CommentsList expects
  // repliesByParent[parentId] = Array<replyComment>
  const [repliesByParent, setRepliesByParent] = useState({});

  // Format datetime helper
  const formatDateTime = (date) => {
    return dayjs(date).format("DD/MM/YYYY HH:mm");
  };

  // Handler: Add root comment with files
  const handleAddComment = async () => {
    if (!newComment.trim() && pendingFiles.length === 0) return;

    setSubmittingComment(true);
    try {
      await dispatch(
        addYeuCauCommentWithFiles({
          yeuCauId,
          noiDung: newComment.trim(),
          files: pendingFiles,
          parentId: null,
        })
      );
      // Clear form after success
      setNewComment("");
      setPendingFiles([]);
      setRepliesByParent({});
      // Refresh comments list
      dispatch(getBinhLuan(yeuCauId));
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  // Handler: Add comment with files (root or reply)
  const handleReplyWithFiles = async (parentId, text, files) => {
    await dispatch(
      addYeuCauCommentWithFiles({
        yeuCauId,
        noiDung: text,
        files,
        parentId,
      })
    );
    setRepliesByParent((prev) => {
      const next = { ...prev };
      delete next[parentId];
      return next;
    });
    // Refresh comments to show new reply
    dispatch(getBinhLuan(yeuCauId));
  };

  // Handler: Add comment text only (reply)
  const handleReplyText = async (parentId, text) => {
    await dispatch(
      addYeuCauCommentWithFiles({
        yeuCauId,
        noiDung: text,
        files: [],
        parentId,
      })
    );
    setRepliesByParent((prev) => {
      const next = { ...prev };
      delete next[parentId];
      return next;
    });
    dispatch(getBinhLuan(yeuCauId));
  };

  // Handler: Recall comment (delete all)
  const handleRecallComment = async (yeuCauId, commentId) => {
    await dispatch(recallYeuCauComment(yeuCauId, commentId));
    setRepliesByParent({});
    dispatch(getBinhLuan(yeuCauId));
  };

  // Handler: Recall comment text only (keep files)
  const handleRecallCommentText = async (yeuCauId, commentId) => {
    await dispatch(recallYeuCauCommentText(yeuCauId, commentId));
    setRepliesByParent({});
    dispatch(getBinhLuan(yeuCauId));
  };

  // Handler: Delete file
  const handleDeleteFile = async (file) => {
    await dispatch(deleteYeuCauFile(file._id));
    setRepliesByParent({});
    // Refresh comments to update file list
    dispatch(getBinhLuan(yeuCauId));
  };

  // Handler: Fetch replies (lazy load)
  const handleFetchReplies = async (parentId) => {
    // YeuCau đã có replies trong payload (TraLoi). Adapter lại theo format repliesByParent
    const parent = (binhLuanList || []).find((c) => c?._id === parentId);
    const replies = parent?.TraLoi || [];
    setRepliesByParent((prev) => ({
      ...prev,
      [parentId]: Array.isArray(replies) ? replies : [],
    }));
  };

  const initialReplyCounts = useMemo(() => {
    const result = {};
    (binhLuanList || []).forEach((c) => {
      const count = Array.isArray(c?.TraLoi)
        ? c.TraLoi.length
        : Number(c?.RepliesCount || 0);
      result[c._id] = count;
    });
    return result;
  }, [binhLuanList]);

  return (
    <Box>
      {/* Form nhập bình luận mới */}
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

      {/* Danh sách bình luận */}
      <CommentsList
        theme={theme}
        comments={binhLuanList || []}
        user={user}
        congViecId={yeuCauId} // Adapter: CommentsList expects this prop name
        onRecallComment={handleRecallComment}
        onViewFile={handleViewFile}
        onDownloadFile={handleDownloadFile}
        onRecallCommentText={handleRecallCommentText}
        onDeleteFile={handleDeleteFile}
        repliesByParent={repliesByParent}
        initialReplyCounts={initialReplyCounts}
        onFetchReplies={handleFetchReplies}
        onReplyText={handleReplyText}
        onReplyWithFiles={handleReplyWithFiles}
        formatDateTime={formatDateTime}
      />
    </Box>
  );
}
