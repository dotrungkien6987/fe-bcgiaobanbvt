import {
  SwipeableDrawer,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  Stack,
} from "@mui/material";
import { DocumentText1, Document, CloseCircle } from "iconsax-react";
import apiService from "../../../app/apiService";

/**
 * DownloadBottomSheet - Bottom sheet for selecting file to download
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Object} props.filePDF - { _id, TenFile, TenGoc, KichThuoc }
 * @param {Object} props.fileWord - { _id, TenFile, TenGoc, KichThuoc }
 * @param {string} props.quyTrinhName - Name of the procedure
 */
function DownloadBottomSheet({
  open,
  onClose,
  filePDF,
  fileWord,
  quyTrinhName,
}) {
  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / 1024 / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  // Download file handler
  const handleDownload = async (file) => {
    if (!file?._id) return;

    try {
      const res = await apiService.get(
        `/attachments/files/${file._id}/download`,
        { responseType: "blob" },
      );
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = file.TenGoc || file.TenFile || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      onClose();
    } catch (error) {
      console.error("Download error:", error);
    }
  };

  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
      PaperProps={{
        sx: {
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          maxHeight: "60vh",
        },
      }}
    >
      {/* Drag Handle */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          pt: 1.5,
          pb: 1,
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 4,
            bgcolor: "grey.300",
            borderRadius: 2,
          }}
        />
      </Box>

      {/* Title */}
      <Box sx={{ px: 2, pb: 1.5 }}>
        <Typography variant="h6" fontWeight={600}>
          Tải về quy trình
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {quyTrinhName}
        </Typography>
      </Box>

      <Divider />

      {/* File Options */}
      <List sx={{ px: 1, py: 1 }}>
        {/* PDF Option */}
        {filePDF && (
          <ListItemButton
            onClick={() => handleDownload(filePDF)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              py: 1.5,
            }}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "error.lighter",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <DocumentText1 size={24} color="#d32f2f" variant="Bold" />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600}>File PDF</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatSize(filePDF.KichThuoc)}
                  </Typography>
                </Stack>
              }
              secondary="Tài liệu chính thức"
            />
          </ListItemButton>
        )}

        {/* Word Option */}
        {fileWord && (
          <ListItemButton
            onClick={() => handleDownload(fileWord)}
            sx={{
              borderRadius: 2,
              py: 1.5,
            }}
          >
            <ListItemIcon>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "primary.lighter",
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Document size={24} color="#1976d2" variant="Bold" />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography fontWeight={600}>File Word</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatSize(fileWord.KichThuoc)}
                  </Typography>
                </Stack>
              }
              secondary="File nguồn để chỉnh sửa"
            />
          </ListItemButton>
        )}

        {/* No files message */}
        {!filePDF && !fileWord && (
          <Box sx={{ py: 3, textAlign: "center" }}>
            <Typography color="text.secondary">
              Chưa có file đính kèm
            </Typography>
          </Box>
        )}
      </List>

      <Divider />

      {/* Cancel Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          color="inherit"
          onClick={onClose}
          startIcon={<CloseCircle size={18} />}
          sx={{
            height: 48,
            borderRadius: 2,
            fontWeight: 600,
          }}
        >
          Hủy
        </Button>
      </Box>
    </SwipeableDrawer>
  );
}

export default DownloadBottomSheet;
