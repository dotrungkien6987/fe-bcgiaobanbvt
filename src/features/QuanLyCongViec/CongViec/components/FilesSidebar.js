import React from "react";
import {
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  Paper,
  Chip,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  Download as DownloadIcon,
  Delete as DeleteIcon,
  AttachFile as AttachFileIcon,
  CloudUpload as UploadIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";

const FilesSidebar = ({
  theme,
  dragSidebarActive,
  setDragSidebarActive,
  fileCount,
  filesState,
  onUploadFiles,
  onViewFile,
  onDownloadFile,
  onDeleteFile,
}) => {
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

  // Helper function để lấy icon phù hợp với loại file
  const getFileIcon = (fileName) => {
    const ext = fileName?.toLowerCase().split(".").pop();
    const iconStyle = { fontSize: 20, color: theme.palette.primary.main };

    switch (ext) {
      case "pdf":
        return <FileIcon sx={{ ...iconStyle, color: "#d32f2f" }} />;
      case "doc":
      case "docx":
        return <FileIcon sx={{ ...iconStyle, color: "#1976d2" }} />;
      case "xls":
      case "xlsx":
        return <FileIcon sx={{ ...iconStyle, color: "#388e3c" }} />;
      case "ppt":
      case "pptx":
        return <FileIcon sx={{ ...iconStyle, color: "#f57c00" }} />;
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
        return <FileIcon sx={{ ...iconStyle, color: "#e91e63" }} />;
      default:
        return <FileIcon sx={iconStyle} />;
    }
  };

  // Resolve uploader display info from various possible shapes
  const getUploaderInfo = (f) => {
    const u = f?.NguoiTaiLen || f?.Uploader || f?.NguoiTaiLenID || null;
    const nameCandidate =
      f?.NguoiTaiLenName ||
      u?.Ten ||
      u?.HoTen ||
      u?.name ||
      u?.FullName ||
      u?.HoTenNhanVien ||
      null;
    const avatar = u?.AnhDaiDien || u?.avatarUrl || null;
    return {
      name: nameCandidate,
      avatar,
    };
  };

  return (
    <>
      <Box
        sx={{
          mb: 2,
          border: dragSidebarActive
            ? `2px dashed ${theme.palette.primary.main}`
            : undefined,
          borderRadius: dragSidebarActive ? 1 : 0,
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragSidebarActive(true);
        }}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragSidebarActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragSidebarActive(false);
        }}
        onDrop={async (e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragSidebarActive(false);
          const files = extractFilesFromDataTransfer(e.dataTransfer);
          if (files.length) await onUploadFiles(files);
        }}
      >
        <Typography
          variant="subtitle2"
          color="text.secondary"
          sx={{ mb: 1.5, fontWeight: 600 }}
        >
          <AttachFileIcon
            sx={{ mr: 1, verticalAlign: "middle", fontSize: 18 }}
          />
          Tệp đính kèm ({fileCount})
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <Button
            variant="contained"
            component="label"
            size="small"
            startIcon={<UploadIcon />}
            sx={{
              textTransform: "none",
              borderRadius: 2,
              px: 2,
            }}
          >
            Tải tệp lên
            <input
              hidden
              multiple
              type="file"
              onChange={async (e) => {
                const files = Array.from(e.target.files || []);
                if (files.length) await onUploadFiles(files);
                e.target.value = "";
              }}
            />
          </Button>
          {filesState.loading && (
            <Chip
              size="small"
              label="Đang tải..."
              color="primary"
              variant="outlined"
            />
          )}
        </Box>

        <Paper
          variant="outlined"
          sx={{
            maxHeight: 300,
            overflow: "auto",
            borderRadius: 2,
            backgroundColor: theme.palette.grey[50],
          }}
        >
          <List dense disablePadding>
            {(filesState.items || []).map((f, index) => (
              <ListItem
                key={f._id}
                sx={{
                  borderBottom:
                    index < filesState.items.length - 1
                      ? `1px solid ${theme.palette.divider}`
                      : "none",
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.04)",
                  },
                  py: 1.5,
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    sx={{
                      backgroundColor: "transparent",
                      width: 32,
                      height: 32,
                    }}
                  >
                    {getFileIcon(f.TenGoc)}
                  </Avatar>
                </ListItemAvatar>

                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {f.TenGoc}
                    </Typography>
                  }
                  secondary={
                    <Box sx={{ mt: 0.5 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", mb: 0.5 }}
                      >
                        {f.KichThuocFormat || ""}
                      </Typography>

                      {/* Thông tin người tải lên */}
                      {(() => {
                        const info = getUploaderInfo(f);
                        if (!info?.name) return null;
                        return (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              mb: 0.5,
                              p: 0.5,
                              borderRadius: 1,
                              backgroundColor:
                                theme.palette.primary.light + "10",
                              border: `1px solid ${theme.palette.primary.light}30`,
                            }}
                          >
                            <Avatar
                              src={info.avatar || undefined}
                              sx={{
                                width: 16,
                                height: 16,
                                mr: 0.5,
                                fontSize: "0.6rem",
                                backgroundColor: theme.palette.primary.main,
                              }}
                            >
                              {(info.name || "U").charAt(0)}
                            </Avatar>
                            <Typography
                              variant="caption"
                              color="primary"
                              sx={{ fontWeight: 500, fontSize: "0.7rem" }}
                            >
                              {info.name}
                            </Typography>
                          </Box>
                        );
                      })()}

                      {/* Thông tin ngày tải lên (nếu có) */}
                      {(f.NgayTaiLen || f.NgayTao || f.createdAt) && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", fontSize: "0.7rem" }}
                        >
                          {new Date(
                            f.NgayTaiLen || f.NgayTao || f.createdAt
                          ).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Typography>
                      )}
                    </Box>
                  }
                />

                <ListItemSecondaryAction>
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Tooltip title="Xem tệp">
                      <IconButton
                        size="small"
                        onClick={() => onViewFile(f)}
                        sx={{
                          color: theme.palette.primary.main,
                          "&:hover": {
                            backgroundColor: theme.palette.primary.light + "20",
                          },
                        }}
                      >
                        <ViewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Tải xuống">
                      <IconButton
                        size="small"
                        onClick={() => onDownloadFile(f)}
                        sx={{
                          color: theme.palette.success.main,
                          "&:hover": {
                            backgroundColor: theme.palette.success.light + "20",
                          },
                        }}
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>

                    <Tooltip title="Xóa tệp">
                      <IconButton
                        size="small"
                        onClick={() => onDeleteFile(f)}
                        sx={{
                          color: theme.palette.error.main,
                          "&:hover": {
                            backgroundColor: theme.palette.error.light + "20",
                          },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}

            {(!filesState.items || filesState.items.length === 0) && (
              <ListItem sx={{ py: 3, textAlign: "center" }}>
                <ListItemText
                  primary={
                    <Box sx={{ textAlign: "center" }}>
                      <AttachFileIcon
                        sx={{
                          fontSize: 48,
                          color: theme.palette.grey[400],
                          mb: 1,
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Chưa có tệp đính kèm
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Kéo thả hoặc nhấn "Tải tệp lên" để thêm tệp
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            )}
          </List>
        </Paper>
      </Box>
    </>
  );
};

export default FilesSidebar;
