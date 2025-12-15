import React from "react";
import {
  Box,
  Button,
  Chip,
  InputAdornment,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { Send as SendIcon, Close as CloseIcon } from "@mui/icons-material";

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
  // Tạo và quản lý blob URLs cho preview ảnh
  const [filePreviews, setFilePreviews] = React.useState({});

  React.useEffect(() => {
    // Tạo blob URL cho mỗi file ảnh
    const newPreviews = {};
    pendingFiles.forEach((file, idx) => {
      if (file.type?.startsWith("image/")) {
        newPreviews[idx] = URL.createObjectURL(file);
      }
    });
    setFilePreviews(newPreviews);

    // Cleanup blob URLs khi component unmount hoặc files thay đổi
    return () => {
      Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pendingFiles]);

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
          {pendingFiles.map((f, idx) => {
            const isImage = f.type?.startsWith("image/");
            const previewUrl = filePreviews[idx];

            if (isImage && previewUrl) {
              // Preview ảnh với thumbnail
              return (
                <Box
                  key={idx}
                  sx={{
                    position: "relative",
                    width: 100,
                    height: 100,
                    borderRadius: 1,
                    overflow: "hidden",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <img
                    src={previewUrl}
                    alt={f.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => removePendingFile(idx)}
                    sx={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "rgba(0,0,0,0.8)",
                      },
                      padding: "4px",
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      color: "#fff",
                      px: 0.5,
                      py: 0.25,
                      fontSize: "0.7rem",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.name}
                  </Box>
                </Box>
              );
            }

            // File không phải ảnh - hiển thị Chip
            return (
              <Chip
                key={idx}
                label={f.name}
                onDelete={() => removePendingFile(idx)}
                size="small"
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default CommentComposer;
