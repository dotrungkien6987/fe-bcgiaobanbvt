import React from "react";
import {
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Box,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { listFiles } from "shared/services/attachments.api";
import api from "app/apiService";

// Simple in-memory cache for this session to reduce repeated fetches per cell
const cache = new Map(); // key: `${ownerType}:${ownerId}:${field}` -> { files, at }

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
}) {
  const [files, setFiles] = React.useState(null); // null=loading, []=loaded
  const [busy, setBusy] = React.useState(null); // fileId being acted on

  const key = `${ownerType}:${ownerId}:${field}`;

  const load = React.useCallback(async () => {
    if (!ownerId) return;
    // Stale-while-revalidate: show cache immediately if exists, then refresh in background
    const cached = cache.get(key);
    if (cached) {
      setFiles(cached.files);
    } else {
      setFiles(null);
    }
    try {
      const data = await listFiles(ownerType, ownerId, field, { limit: 10 });
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      const prev = cache.get(key)?.files || null;
      cache.set(key, { files: list, at: Date.now() });
      // Update UI if no cache before or data changed
      const changed = () => {
        if (!prev) return true;
        if (prev.length !== list.length) return true;
        const prevIds = prev.map((f) => f._id).join(",");
        const newIds = list.map((f) => f._id).join(",");
        return prevIds !== newIds;
      };
      if (!cached || changed()) {
        setFiles(list);
      }
    } catch (e) {
      console.error("AttachmentLinksCell load error", e);
      // Preserve cached view on error; only set empty when nothing cached
      if (!cached) setFiles([]);
    }
  }, [key, ownerId, ownerType, field]);

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  // Proactively refresh when page becomes visible again (e.g., user navigates back)
  React.useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        // Force refresh bypassing stale cache by deleting and reloading
        cache.delete(key);
        load();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [key, load]);

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

  const visible = files;

  return (
    <Stack
      direction="column"
      spacing={0.25}
      sx={{
        overflowY: "auto",
        maxHeight: "100%",
        pr: 0.5,
      }}
    >
      {visible.map((f) => (
        <Box key={f._id} sx={{ display: "flex", alignItems: "flex-start" }}>
          <AttachFileIcon
            sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
          />
          <Tooltip title={f.TenGoc}>
            <Typography
              variant="body2"
              sx={{
                cursor: "pointer",
                textDecoration: "underline",
                textUnderlineOffset: 2,
                color: "primary.main",
                mr: 0.5,
                whiteSpace: "normal",
                wordBreak: "break-word",
                overflowWrap: "anywhere",
                maxWidth: "100%",
              }}
              onClick={async () => {
                try {
                  setBusy(f._id);
                  await previewFile(f._id);
                } finally {
                  setBusy(null);
                }
              }}
            >
              {f.TenGoc}
            </Typography>
          </Tooltip>
          <Tooltip title="Tải xuống">
            <span>
              <IconButton
                size="small"
                onClick={async () => {
                  try {
                    setBusy(f._id);
                    await downloadFile(f._id, f.TenGoc);
                  } finally {
                    setBusy(null);
                  }
                }}
              >
                {busy === f._id ? (
                  <CircularProgress size={14} />
                ) : (
                  <DownloadIcon fontSize="inherit" />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      ))}
    </Stack>
  );
}
