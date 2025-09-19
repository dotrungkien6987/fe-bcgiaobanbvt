/**
 * AttachmentListCell - Dùng chung cho các bảng hiển thị danh sách file đính kèm của 1 bản ghi.
 * -----------------------------------------------------------------------------
 * MỤC TIÊU:
 *  - Thay thế các phiên bản riêng lẻ (ví dụ TapSan/AttachmentLinksCell.jsx) bằng 1 component tổng quát hoá.
 *  - Giảm số lần gọi API nhờ cache in-memory + cơ chế stale-while-revalidate.
 *  - Cho phép tuỳ biến chế độ hiển thị: dạng danh sách dọc (list) hoặc gọn dạng chips (compact).
 *  - Cung cấp các hook callback để bên ngoài đồng bộ đếm file hoặc log.
 *
 * API BACKEND KỲ VỌNG:
 *  GET attachments/:ownerType/:ownerId/:field/files?limit=n
 *  Trả về { data: { items: [ { _id, TenGoc, mimeType?, size? } ] } } hoặc trực tiếp mảng.
 *
 * PROPS:
 *  - ownerType (string, required): Loại thực thể ví dụ "DoanRa", "TapSan".
 *  - ownerId (string|number, required): Id bản ghi. Nếu falsy → hiển thị dấu "—".
 *  - field (string, optional, default="file"): Nhóm file.
 *  - variant ("list"|"compact", default="list"): Kiểu hiển thị.
 *  - limit (number, default=10): Giới hạn số file fetch.
 *  - disableAutoRefresh (boolean): Nếu true không tự refresh khi visibilitychange.
 *  - onLoaded (function(files)): Callback sau khi tải (kể cả từ cache) hoàn tất.
 *  - onError (function(error)): Callback khi lỗi (lỗi vẫn bị nuốt để bảng không vỡ UI).
 *  - showDownload (boolean, default=true): Ẩn/hiện nút tải.
 *  - dense (boolean, default=false): Giảm spacing.
 *
 * HÀNH VI CACHING:
 *  - Cache session (Map) theo key `${ownerType}:${ownerId}:${field}:${limit}`.
 *  - SWR: Render cache ngay lập tức (nếu có) rồi gọi API để làm mới.
 *  - Không TTL mặc định; có thể thêm TTL dễ dàng (xem ghi chú TODO).
 *
 * ACCESSIBILITY:
 *  - Dùng Typography dưới dạng button link (role natual) + underline.
 *
 * MỞ RỘNG TƯƠNG LAI (TODO):
 *  - TTL / Manual invalidate.
 *  - Tooltip hiển thị kích thước đã format.
 *  - Icon theo mimeType (pdf, image, doc...).
 *  - Pagination / "+N" collapsed indicator khi vượt quá limit.
 */

import React from "react";
import {
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import {
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
} from "@mui/icons-material";
import { listFiles } from "shared/services/attachments.api";
import api from "app/apiService";

// In-memory cache cho phiên làm việc hiện tại
const cache = new Map(); // key -> { files, at }

// Preview file (inline) ở tab mới
async function previewFile(fileId) {
  const relativePath = `attachments/files/${fileId}/inline`;
  const res = await api.get(relativePath, { responseType: "blob" });
  const blob = res.data;
  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, "_blank", "noopener,noreferrer");
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
}

// Download file trực tiếp
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

export default function AttachmentListCell({
  ownerType,
  ownerId,
  field = "file",
  variant = "list",
  limit = 10,
  disableAutoRefresh = false,
  onLoaded,
  onError,
  showDownload = true,
  dense = false,
}) {
  const [files, setFiles] = React.useState(null); // null = loading, []/array = loaded
  const [busy, setBusy] = React.useState(null); // fileId đang xử lý

  const key = `${ownerType}:${ownerId}:${field}:${limit}`;

  const load = React.useCallback(async () => {
    if (!ownerId) return;
    const cached = cache.get(key);
    if (cached) {
      setFiles(cached.files);
      onLoaded && onLoaded(cached.files, { fromCache: true });
    } else {
      setFiles(null);
    }
    try {
      const data = await listFiles(ownerType, ownerId, field, { limit });
      const list = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data)
        ? data
        : [];
      const prev = cache.get(key)?.files || null;
      cache.set(key, { files: list, at: Date.now() });
      const changed = () => {
        if (!prev) return true;
        if (prev.length !== list.length) return true;
        const prevIds = prev.map((f) => f._id).join(",");
        const newIds = list.map((f) => f._id).join(",");
        return prevIds !== newIds;
      };
      if (!cached || changed()) {
        setFiles(list);
        onLoaded && onLoaded(list, { fromCache: false });
      }
    } catch (e) {
      console.error("AttachmentListCell load error", e);
      if (!cache.get(key)) setFiles([]);
      onError && onError(e);
    }
  }, [key, ownerId, ownerType, field, limit, onLoaded, onError]);

  React.useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  React.useEffect(() => {
    if (disableAutoRefresh) return;
    const onVisible = () => {
      if (document.visibilityState === "visible") {
        cache.delete(key);
        load();
      }
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [key, load, disableAutoRefresh]);

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

  // VARIANT = COMPACT (chips 1 dòng)
  if (variant === "compact") {
    return (
      <Stack
        direction="row"
        spacing={0.5}
        sx={{ flexWrap: "wrap", maxWidth: "100%" }}
      >
        {files.map((f) => (
          <Tooltip title={f.TenGoc} key={f._id}>
            <Chip
              size={dense ? "small" : "medium"}
              icon={<AttachFileIcon sx={{ fontSize: 16 }} />}
              label={truncateFileName(f.TenGoc, 22)}
              onClick={async () => {
                try {
                  setBusy(f._id);
                  await previewFile(f._id);
                } finally {
                  setBusy(null);
                }
              }}
              onDelete={
                showDownload
                  ? async () => {
                      try {
                        setBusy(f._id);
                        await downloadFile(f._id, f.TenGoc);
                      } finally {
                        setBusy(null);
                      }
                    }
                  : undefined
              }
              deleteIcon={
                showDownload ? (
                  busy === f._id ? (
                    <CircularProgress size={14} />
                  ) : (
                    <DownloadIcon sx={{ fontSize: 16 }} />
                  )
                ) : undefined
              }
              sx={{ maxWidth: 180 }}
            />
          </Tooltip>
        ))}
      </Stack>
    );
  }

  // VARIANT = LIST (giống bản gốc, mỗi file 1 dòng)
  return (
    <Stack
      direction="column"
      spacing={dense ? 0.25 : 0.5}
      sx={{ overflowY: "auto", maxHeight: "100%", pr: 0.5 }}
    >
      {files.map((f) => (
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
          {showDownload && (
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
          )}
        </Box>
      ))}
    </Stack>
  );
}

function truncateFileName(name, max = 24) {
  if (!name) return "";
  if (name.length <= max) return name;
  const extMatch = name.match(/\.[^.]+$/);
  const ext = extMatch ? extMatch[0] : "";
  const base = name.slice(0, max - ext.length - 1);
  return base + "…" + ext;
}
