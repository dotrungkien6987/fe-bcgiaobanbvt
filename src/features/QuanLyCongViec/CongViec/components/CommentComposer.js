import React from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Send as SendIcon } from "@mui/icons-material";

const CommentComposer = ({
  theme,
  newComment,
  setNewComment,
  pendingFiles,
  setPendingFiles,
  dragCommentActive,
  setDragCommentActive,
  onSubmit,
  submittingComment,
}) => {
  const addPendingFiles = (list) => {
    setPendingFiles((arr) => {
      const key = (f) => `${f.name}__${f.size}`;
      const existing = new Set(arr.map(key));
      const toAdd = list.filter((f) => !existing.has(key(f)));
      return [...arr, ...toAdd];
    });
  };

  const removePendingFile = (idxToRemove) => {
    setPendingFiles((arr) => arr.filter((_, idx) => idx !== idxToRemove));
  };

  const extractFilesFromDataTransfer = (dt) => {
    const out = [];
    if (!dt) return out;
    if (dt.items && dt.items.length) {
      for (const item of dt.items) {
        if (item.kind === "file") {
          const f = item.getAsFile();
          if (f) out.push(f);
        }
      }
    } else if (dt.files && dt.files.length) {
      for (const f of dt.files) out.push(f);
    }
    return out;
  };

  return (
    <Box
      sx={{
        mb: 3,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        border: dragCommentActive
          ? `2px dashed ${theme.palette.primary.main}`
          : `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        p: 1.5,
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCommentActive(true);
      }}
      onDragEnter={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCommentActive(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCommentActive(false);
      }}
      onDrop={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragCommentActive(false);
        const files = extractFilesFromDataTransfer(e.dataTransfer);
        if (files.length) addPendingFiles(files);
      }}
    >
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Thêm bình luận..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        onPaste={(e) => {
          try {
            const items = e.clipboardData?.items || [];
            const files = [];
            for (const it of items) {
              if (it.kind === "file") {
                const f = it.getAsFile();
                if (f) files.push(f);
              }
            }
            if (files.length) addPendingFiles(files);
          } catch {}
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Button
                onClick={onSubmit}
                disabled={
                  submittingComment ||
                  (!newComment.trim() && pendingFiles.length === 0)
                }
                color="primary"
                size="small"
                startIcon={<SendIcon />}
              >
                Gửi
              </Button>
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Button variant="outlined" component="label" size="small">
          Đính kèm
          <input
            hidden
            multiple
            type="file"
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              if (files.length) addPendingFiles(files);
              e.target.value = "";
            }}
          />
        </Button>
        {pendingFiles.length > 0 && (
          <Typography variant="caption" color="text.secondary">
            {pendingFiles.length} tệp sẽ gửi cùng bình luận
          </Typography>
        )}
      </Box>
      {pendingFiles.length > 0 && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {pendingFiles.map((f, idx) => (
            <Chip
              key={idx}
              label={f.name}
              onDelete={() => removePendingFile(idx)}
              size="small"
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default CommentComposer;
