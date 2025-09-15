import React from "react";
import {
  Stack,
  Chip,
  IconButton,
  Tooltip,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress,
  Typography,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Preview as PreviewIcon,
  Download as DownloadIcon,
  MoreHoriz as MoreIcon,
} from "@mui/icons-material";
import { listFiles } from "shared/services/attachments.api";
import api from "app/apiService";

// Simple in-memory cache for this session to reduce repeated fetches per cell
const cache = new Map(); // key: `${ownerType}:${ownerId}:${field}` -> { files, at }

function shortName(name = "") {
  if (!name) return "tệp";
  if (name.length <= 18) return name;
  const idx = name.lastIndexOf(".");
  const ext = idx > 0 ? name.slice(idx) : "";
  const base = idx > 0 ? name.slice(0, idx) : name;
  const head = base.slice(0, 10);
  const tail = base.slice(-4);
  return `${head}…${tail}${ext}`;
}

async function previewFile(fileId) {
  const relativePath = `attachments/files/${fileId}/inline`;
  const res = await api.get(relativePath, { responseType: "blob" });
  const blob = res.data;
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

async function downloadFile(fileId, filename = "download") {
  const relativePath = `attachments/files/${fileId}/download`;
  const res = await api.get(relativePath, { responseType: "blob" });
  const blob = res.data;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 30_000);
}

export default function AttachmentLinksCell({
  ownerType,
  ownerId,
  field = "file",
  limit = 3,
}) {
  const [files, setFiles] = React.useState(null); // null=loading, []=loaded
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [busy, setBusy] = React.useState(null); // fileId being acted on

  const key = `${ownerType}:${ownerId}:${field}`;

  const load = React.useCallback(async () => {
    if (!ownerId) return;
    // Serve from cache if available
    const cached = cache.get(key);
    if (cached) {
      setFiles(cached.files);
      return;
    }
    setFiles(null);
    try {
      const data = await listFiles(ownerType, ownerId, field, { limit: 10 });
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      cache.set(key, { files: list, at: Date.now() });
      setFiles(list);
    } catch (e) {
      console.error("AttachmentLinksCell load error", e);
      setFiles([]);
    }
  }, [key, ownerId, ownerType, field]);

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  if (!ownerId) return <Typography variant="body2">—</Typography>;

  if (files === null) {
    return (
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ overflow: "hidden" }}
      >
        <CircularProgress size={16} />
        <Typography variant="caption" color="text.secondary">
          Đang tải...
        </Typography>
      </Stack>
    );
  }

  if (!files.length) return <Typography variant="body2">—</Typography>;

  const visible = files.slice(0, limit);
  const more = files.length - visible.length;

  const onOpenAll = (e) => setAnchorEl(e.currentTarget);
  const onCloseAll = () => setAnchorEl(null);
  const open = Boolean(anchorEl);

  return (
    <Stack
      direction="row"
      spacing={0.5}
      alignItems="center"
      sx={{ overflow: "hidden", maxWidth: "100%" }}
    >
      {visible.map((f) => (
        <Tooltip key={f._id} title={f.TenGoc || "Xem tệp"}>
          <Chip
            size="small"
            variant="outlined"
            icon={<AttachFileIcon sx={{ fontSize: 14 }} />}
            label={shortName(f.TenGoc)}
            onClick={async () => {
              try {
                setBusy(f._id);
                await previewFile(f._id);
              } finally {
                setBusy(null);
              }
            }}
            onDelete={async (e) => {
              // Use delete icon slot as download action
              e.stopPropagation();
              try {
                setBusy(f._id);
                await downloadFile(f._id, f.TenGoc);
              } finally {
                setBusy(null);
              }
            }}
            deleteIcon={
              busy === f._id ? (
                <CircularProgress size={14} />
              ) : (
                <DownloadIcon sx={{ fontSize: 16 }} />
              )
            }
            sx={{ maxWidth: 180 }}
          />
        </Tooltip>
      ))}
      {more > 0 && (
        <Tooltip title={`Xem ${more} tệp khác`}>
          <IconButton size="small" onClick={onOpenAll}>
            <MoreIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      )}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={onCloseAll}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <List dense sx={{ minWidth: 260, maxWidth: 360 }}>
          {files.map((f) => (
            <ListItem
              key={f._id}
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <Tooltip title="Xem trước">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={async () => {
                        await previewFile(f._id);
                      }}
                    >
                      <PreviewIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Tải xuống">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={async () => {
                        await downloadFile(f._id, f.TenGoc);
                      }}
                    >
                      <DownloadIcon fontSize="inherit" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            >
              <ListItemIcon>
                <AttachFileIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ noWrap: true }}
                primary={f.TenGoc}
              />
            </ListItem>
          ))}
        </List>
      </Popover>
    </Stack>
  );
}
