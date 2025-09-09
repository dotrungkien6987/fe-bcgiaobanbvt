import React from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  LinearProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadIcon from "@mui/icons-material/Download";
import PreviewIcon from "@mui/icons-material/Preview";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  uploadFiles,
  listFiles,
  countFiles,
  deleteFile,
  inlineUrl,
  downloadUrl,
} from "../services/attachments.api";

export default function AttachmentSection({
  ownerType,
  ownerId,
  field,
  title,
}) {
  const [files, setFiles] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);

  const refresh = React.useCallback(async () => {
    const data = await listFiles(ownerType, ownerId, field);
    setFiles(Array.isArray(data?.items) ? data.items : data || []);
    const cnt = await countFiles(ownerType, ownerId, field);
    setTotal(cnt);
  }, [ownerType, ownerId, field]);

  React.useEffect(() => {
    if (ownerId) refresh();
  }, [ownerId, refresh]);

  const onPick = async (e) => {
    const fs = e.target.files;
    if (!fs || !fs.length) return;
    setUploading(true);
    setProgress(0);
    try {
      await uploadFiles(ownerType, ownerId, field, fs, {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });
      await refresh();
    } finally {
      setUploading(false);
      setProgress(0);
      e.target.value = "";
    }
  };

  const onDelete = async (id) => {
    await deleteFile(id);
    await refresh();
  };

  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={2} mb={1}>
        <Typography variant="h6">
          {title} ({total})
        </Typography>
        <Button
          component="label"
          variant="contained"
          startIcon={<UploadFileIcon />}
        >
          Tải tệp
          <input hidden type="file" multiple onChange={onPick} />
        </Button>
      </Stack>
      {uploading && (
        <Box sx={{ my: 1 }}>
          <LinearProgress variant="determinate" value={progress} />
        </Box>
      )}
      <Box>
        {files?.map((f) => (
          <Stack
            key={f._id}
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ py: 0.5, borderBottom: "1px solid #eee" }}
          >
            <Typography sx={{ flex: 1 }} title={f.TenGoc}>
              {f.TenGoc}
            </Typography>
            <IconButton
              size="small"
              component="a"
              href={inlineUrl(f)}
              target="_blank"
              rel="noopener"
            >
              <PreviewIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" component="a" href={downloadUrl(f)}>
              <DownloadIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(f._id)}>
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
        {!files?.length && (
          <Typography color="text.secondary">Chưa có tệp</Typography>
        )}
      </Box>
    </Box>
  );
}
