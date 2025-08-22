import React from "react";
import {
  Box,
  TextField,
  Stack,
  Button,
  Typography,
  CircularProgress,
} from "@mui/material";

const ReplyComposer = React.memo(
  ({
    parentId,
    replyText,
    setReplyText,
    pendingFiles,
    setPendingFiles,
    submitting,
    onSubmitReply,
    onChooseFiles,
  }) => {
    const handleTextChange = React.useCallback(
      (e) => {
        const value = e.target.value;
        setReplyText((s) => ({ ...s, [parentId]: value }));
      },
      [parentId, setReplyText]
    );

    const handleFileChange = React.useCallback(
      (e) => {
        onChooseFiles(parentId, e.target.files);
      },
      [parentId, onChooseFiles]
    );

    const handleSubmit = React.useCallback(() => {
      onSubmitReply(parentId);
    }, [parentId, onSubmitReply]);

    return (
      <Box sx={{ mt: 1 }}>
        <TextField
          size="small"
          fullWidth
          multiline
          maxRows={4}
          placeholder="Viết phản hồi..."
          value={replyText[parentId] || ""}
          onChange={handleTextChange}
        />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
          <input
            id={`reply-file-${parentId}`}
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <label htmlFor={`reply-file-${parentId}`}>
            <Button size="small" variant="outlined" component="span">
              Đính kèm
            </Button>
          </label>
          <Button
            size="small"
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting[parentId]}
          >
            {submitting[parentId] ? (
              <>
                <CircularProgress size={16} sx={{ mr: 1 }} />
                Đang gửi...
              </>
            ) : (
              "Gửi"
            )}
          </Button>
          {(pendingFiles[parentId] || []).length > 0 && (
            <Typography variant="caption" color="text.secondary">
              {(pendingFiles[parentId] || []).length} tệp đã chọn
            </Typography>
          )}
        </Stack>
      </Box>
    );
  }
);

ReplyComposer.displayName = "ReplyComposer";

export default ReplyComposer;
