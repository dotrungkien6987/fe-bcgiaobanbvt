/*
AttachmentSection — Component quản lý tệp đính kèm dùng chung

Tóm tắt
- Upload nhiều tệp (kéo thả hoặc chọn tệp)
- Hiển thị danh sách, kích thước, ngày cập nhật
- Hành động: Xem trước (blob), Tải xuống (blob), Xóa
- Hoạt động với mọi model BE thông qua cặp { ownerType, ownerId, field }

Phụ thuộc
- Axios instance `api` cấu hình `baseURL` trỏ tới `/api` và tự kèm Authorization
- Shared services: `shared/services/attachments.api.js`

Props
- `ownerType` (string, bắt buộc): Tên model BE, ví dụ: "TapSan", "TapSanBaiBao"
- `ownerId` (string|number, bắt buộc): ID bản ghi trong BE
- `field` (string, mặc định: "file"): Tên trường attachments trong model, ví dụ: "kehoach", "file"
- `title` (string, mặc định: "Tệp đính kèm"): Tiêu đề hộp
- `canUpload` (boolean, mặc định: true): Hiện/ẩn khu vực tải lên
- `canPreview` (boolean, mặc định: true): Hiện/ẩn nút xem trước
- `canDownload` (boolean, mặc định: true): Hiện/ẩn nút tải xuống
- `canDelete` (boolean, mặc định: true): Hiện/ẩn nút xóa
- `allowedTypes` (string[] | null): Ràng lọc loại tệp
   • Hỗ trợ: dạng mime prefix "image/*", mime chính xác "application/pdf", hoặc theo đuôi ".docx"
- `maxSizeMB` (number | null): Giới hạn kích thước tệp theo MB
- `onChange` (({items, total}) => void | null): Gọi sau khi upload/xóa/refresh thành công
- `onError` ((message: string) => void | null): Gọi khi có lỗi
- `labels` (object): Ghi đè văn bản hiển thị
   • Các khóa hỗ trợ: pickBtn, dropTitleIdle, dropTitleActive, uploadBtn,
     totalFiles, uploading, cannotLoadList, cannotUpload, cannotPreview,
     cannotDownload, cannotDelete, confirmDeleteTitle, confirmDeleteNote, fileName

Endpoints backend (REST)
- POST   attachments/{ownerType}/{ownerId}/{field}/files         (FormData: files[])
- GET    attachments/{ownerType}/{ownerId}/{field}/files         (Danh sách)
- GET    attachments/{ownerType}/{ownerId}/{field}/files/count   (Tổng số)
- DELETE attachments/files/{fileId}                              (Xóa 1 tệp)
- GET    attachments/files/{fileId}/inline                       (Xem trước, trả blob)
- GET    attachments/files/{fileId}/download                     (Tải xuống, trả blob)

Ví dụ sử dụng
- TapSan - Kế hoạch
  <AttachmentSection
    ownerType="TapSan"
    ownerId={tapsanId}
    field="kehoach"
    title="Kế hoạch tập san"
    canDelete={user?.isEditor}
    allowedTypes={["application/pdf", "image/*", ".docx"]}
    maxSizeMB={50}
    onChange={({ items, total }) => console.log("Tổng tệp:", total)}
  />

- TapSan - Tệp tập san
  <AttachmentSection ownerType="TapSan" ownerId={tapsanId} field="file" title="Tệp tập san" />

- Bài báo (TapSanBaiBao)
  <AttachmentSection ownerType="TapSanBaiBao" ownerId={baiBaoId} field="file" title="Tệp bài báo" />

Tùy biến nhãn (labels)
  <AttachmentSection
    ownerType="..."
    ownerId={...}
    field="..."
    labels={{
      pickBtn: "Chọn tệp...",
      dropTitleIdle: "Kéo & thả hoặc bấm Chọn tệp",
      uploading: "Đang tải lên",
      cannotUpload: "Lỗi tải lên",
    }}
  />

Quyền
  <AttachmentSection
    ownerType="..."
    ownerId={...}
    field="..."
    canUpload={perm.canUpload}
    canPreview
    canDownload
    canDelete={perm.canDelete}
  />

Ghi chú
- Tệp private: xem trước/tải xuống thực hiện qua axios blob để kèm token.
- Component tự refresh khi `ownerId` thay đổi; hãy đảm bảo `ownerId` có giá trị trước khi hiển thị.
- `allowedTypes` và `maxSizeMB` chỉ lọc ở client; server vẫn nên kiểm soát an toàn.
*/
import React from "react";
import {
  Box,
  Button,
  Typography,
  Stack,
  IconButton,
  LinearProgress,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Paper,
  Grid,
  Fade,
  Zoom,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Avatar,
  Tooltip,
} from "@mui/material";
import {
  UploadFile as UploadFileIcon,
  Download as DownloadIcon,
  Preview as PreviewIcon,
  Delete as DeleteIcon,
  AttachFile as AttachIcon,
  CloudUpload as CloudUploadIcon,
  Folder as FolderIcon,
} from "@mui/icons-material";
import {
  uploadFiles,
  listFiles,
  countFiles,
  deleteFile,
} from "shared/services/attachments.api";
import api from "app/apiService";

export default function AttachmentSection({
  ownerType,
  ownerId,
  field = "file",
  title = "Tệp đính kèm",
  canUpload = true,
  canPreview = true,
  canDownload = true,
  canDelete = true,
  allowedTypes = null,
  maxSizeMB = null,
  onChange = null,
  onError = null,
  labels = {},
}) {
  const [files, setFiles] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const [uploading, setUploading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState(null);
  const [previewLoading, setPreviewLoading] = React.useState(null);
  const [downloadLoading, setDownloadLoading] = React.useState(null);
  const [deleteDialog, setDeleteDialog] = React.useState({
    open: false,
    file: null,
  });
  const [deleteLoading, setDeleteLoading] = React.useState(null);

  const t = React.useMemo(
    () => ({
      pickBtn: labels.pickBtn || "Chọn tệp",
      dropTitleIdle: labels.dropTitleIdle || "Kéo thả tệp vào đây hoặc",
      dropTitleActive: labels.dropTitleActive || "Thả tệp ở đây",
      uploadBtn: labels.uploadBtn || "Tải tệp lên",
      totalFiles: labels.totalFiles || "{n} tệp đã tải lên",
      uploading: labels.uploading || "Đang tải lên...",
      cannotLoadList: labels.cannotLoadList || "Không thể tải danh sách tệp",
      cannotUpload:
        labels.cannotUpload || "Không thể tải lên tệp. Vui lòng thử lại.",
      cannotPreview:
        labels.cannotPreview ||
        "Không xem trước được tệp. Vui lòng thử lại hoặc tải xuống.",
      cannotDownload:
        labels.cannotDownload || "Không tải được tệp. Vui lòng thử lại.",
      cannotDelete:
        labels.cannotDelete || "Không thể xóa tệp. Vui lòng thử lại.",
      confirmDeleteTitle: labels.confirmDeleteTitle || "Xác nhận xóa tệp",
      confirmDeleteNote:
        labels.confirmDeleteNote ||
        "Bạn có chắc chắn muốn xóa tệp này không? Hành động này không thể hoàn tác.",
      fileName: labels.fileName || "Tên tệp",
    }),
    [labels]
  );

  const onChangeRef = React.useRef(onChange);
  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const onErrorRef = React.useRef(onError);
  React.useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cannotLoadMsgRef = React.useRef(t.cannotLoadList);
  React.useEffect(() => {
    cannotLoadMsgRef.current = t.cannotLoadList;
  }, [t]);

  const notifyError = (msg) => {
    setError(msg);
    if (onErrorRef.current) onErrorRef.current(msg);
  };

  const refresh = React.useCallback(async () => {
    try {
      setError(null);
      const data = await listFiles(ownerType, ownerId, field);
      const list = Array.isArray(data?.items) ? data.items : data || [];
      setFiles(list);
      const cnt = await countFiles(ownerType, ownerId, field);
      setTotal(cnt);
      if (onChangeRef.current) onChangeRef.current({ items: list, total: cnt });
    } catch (error) {
      console.error("Error refreshing files:", error);
      notifyError(cannotLoadMsgRef.current || "Không thể tải danh sách tệp");
    }
  }, [ownerType, ownerId, field]);

  React.useEffect(() => {
    if (ownerId) refresh();
  }, [ownerId, refresh]);

  const isTypeAllowed = (file) => {
    if (!allowedTypes || !allowedTypes.length) return true;
    const mime = file.type?.toLowerCase() || "";
    const ext = `.${(file.name?.split(".").pop() || "").toLowerCase()}`;
    return allowedTypes.some((p) => {
      const pat = p.toLowerCase();
      if (pat.endsWith("/*")) {
        const prefix = pat.replace("/*", "");
        return mime.startsWith(prefix + "/");
      }
      if (pat.startsWith(".")) {
        return ext === pat;
      }
      return mime === pat;
    });
  };

  const isSizeAllowed = (file) => {
    if (!maxSizeMB) return true;
    const max = maxSizeMB * 1024 * 1024;
    return file.size <= max;
  };

  const handleFiles = async (fileList) => {
    if (!fileList || !fileList.length) return;
    const filesArr = Array.from(fileList);
    const rejected = [];
    const accepted = [];
    for (const f of filesArr) {
      if (!isTypeAllowed(f) || !isSizeAllowed(f)) rejected.push(f);
      else accepted.push(f);
    }
    if (rejected.length) {
      notifyError(
        `Một số tệp không hợp lệ (loại/kích thước). Đã bỏ qua ${rejected.length} tệp.`
      );
    }
    if (!accepted.length) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    try {
      await uploadFiles(ownerType, ownerId, field, accepted, {
        onUploadProgress: (evt) => {
          if (!evt.total) return;
          setProgress(Math.round((evt.loaded * 100) / evt.total));
        },
      });
      await refresh();
    } catch (error) {
      console.error("Error uploading files:", error);
      notifyError(t.cannotUpload);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const onPick = async (e) => {
    await handleFiles(e.target.files);
    e.target.value = "";
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handlePreview = async (file) => {
    try {
      if (!canPreview) return;
      setPreviewLoading(file._id);
      setError(null);

      const relativePath = `attachments/files/${file._id}/inline`;
      const res = await api.get(relativePath, { responseType: "blob" });

      const blob = res.data;
      const objectUrl = URL.createObjectURL(blob);
      window.open(objectUrl, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
    } catch (e) {
      console.error("Preview failed:", e);
      notifyError(t.cannotPreview);
    } finally {
      setPreviewLoading(null);
    }
  };

  const handleDownload = async (file) => {
    try {
      if (!canDownload) return;
      setDownloadLoading(file._id);
      setError(null);

      const relativePath = `attachments/files/${file._id}/download`;
      const res = await api.get(relativePath, { responseType: "blob" });

      const blob = res.data;
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = file.TenGoc || "download";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 30_000);
    } catch (e) {
      console.error("Download failed:", e);
      notifyError(t.cannotDownload);
    } finally {
      setDownloadLoading(null);
    }
  };

  const onDeleteConfirm = async () => {
    if (!canDelete || !deleteDialog.file) return;
    try {
      setDeleteLoading(deleteDialog.file._id);
      await deleteFile(deleteDialog.file._id);
      await refresh();
      setDeleteDialog({ open: false, file: null });
    } catch (error) {
      console.error("Error deleting file:", error);
      notifyError(t.cannotDelete);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getFileIcon = (filename, mimeType) => {
    const ext = filename?.split(".").pop()?.toLowerCase();
    if (mimeType) {
      if (mimeType.includes("pdf")) return "📄";
      if (mimeType.includes("image")) return "🖼️";
      if (mimeType.includes("video")) return "🎥";
      if (mimeType.includes("audio")) return "🎵";
      if (mimeType.includes("word") || mimeType.includes("msword")) return "📝";
      if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
        return "📊";
      if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
        return "📋";
      if (
        mimeType.includes("zip") ||
        mimeType.includes("rar") ||
        mimeType.includes("archive")
      )
        return "🗜️";
      if (mimeType.includes("text")) return "📄";
    }
    if (ext === "pdf") return "📄";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx", "csv"].includes(ext)) return "📊";
    if (["ppt", "pptx"].includes(ext)) return "📋";
    if (["jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"].includes(ext))
      return "🖼️";
    if (["mp4", "avi", "mkv", "mov", "wmv", "flv", "webm"].includes(ext))
      return "🎥";
    if (["mp3", "wav", "flac", "aac", "ogg", "wma"].includes(ext)) return "🎵";
    if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext)) return "🗜️";
    if (["txt", "md", "rtf", "log"].includes(ext)) return "📄";
    if (["html", "css", "js", "json", "xml", "sql"].includes(ext)) return "💻";
    return "📎";
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={2} mb={3}>
        <Avatar sx={{ bgcolor: "primary.main" }}>
          <AttachIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="600">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {(t.totalFiles || "{n}").replace("{n}", String(total))}
          </Typography>
        </Box>
        <Box sx={{ flex: 1 }} />
        {canUpload && (
          <Button
            component="label"
            variant="contained"
            startIcon={<UploadFileIcon />}
            disabled={uploading}
            sx={{ borderRadius: 2 }}
          >
            {t.pickBtn}
            <input hidden type="file" multiple onChange={onPick} />
          </Button>
        )}
      </Stack>

      {/* Upload Progress */}
      {uploading && (
        <Fade in={uploading}>
          <Card
            elevation={0}
            sx={{ mb: 3, bgcolor: "primary.50", borderRadius: 2 }}
          >
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2} mb={1}>
                <CloudUploadIcon color="primary" />
                <Typography variant="body2" color="primary.dark">
                  Đang tải lên... {progress}%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{ borderRadius: 1 }}
              />
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Drag & Drop Zone */}
      {canUpload && (
        <Paper
          elevation={0}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          sx={{
            border: "2px dashed",
            borderColor: dragOver ? "primary.main" : "grey.300",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            mb: 3,
            bgcolor: dragOver ? "primary.50" : "grey.50",
            transition: "all 0.2s ease",
            cursor: "pointer",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <CloudUploadIcon
              sx={{
                fontSize: 48,
                color: dragOver ? "primary.main" : "grey.400",
              }}
            />
            <Typography
              variant="body1"
              color={dragOver ? "primary.main" : "text.secondary"}
            >
              {dragOver ? t.dropTitleActive : t.dropTitleIdle}
            </Typography>
            <Button
              component="label"
              variant="outlined"
              size="small"
              sx={{ borderRadius: 2 }}
            >
              {t.pickBtn}
              <input hidden type="file" multiple onChange={onPick} />
            </Button>
          </Stack>
        </Paper>
      )}

      {/* File List */}
      {files.length > 0 ? (
        <Grid container spacing={2}>
          {files.map((file, index) => (
            <Grid item xs={12} key={file._id}>
              <Zoom in={true} style={{ transitionDelay: `${index * 50}ms` }}>
                <Card
                  elevation={1}
                  sx={{
                    borderRadius: 2,
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-2px)",
                      transition: "all 0.2s ease",
                    },
                  }}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      {/* File Icon */}
                      <Typography sx={{ fontSize: 24 }}>
                        {getFileIcon(file.TenGoc, file.MimeType)}
                      </Typography>

                      {/* File Info */}
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                          variant="body1"
                          fontWeight="500"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={file.TenGoc}
                        >
                          {file.TenGoc}
                        </Typography>
                        <Stack direction="row" spacing={2} mt={0.5}>
                          <Chip
                            label={formatFileSize(file.KichThuoc)}
                            size="small"
                            variant="outlined"
                          />
                          {file.updatedAt && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(file.updatedAt).toLocaleDateString(
                                "vi-VN"
                              )}
                            </Typography>
                          )}
                        </Stack>
                      </Box>

                      {/* Actions */}
                      <Stack direction="row" spacing={0.5}>
                        {canPreview && (
                          <Tooltip title="Xem trước">
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => handlePreview(file)}
                              disabled={previewLoading === file._id}
                            >
                              {previewLoading === file._id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <PreviewIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDownload && (
                          <Tooltip title="Tải xuống">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleDownload(file)}
                              disabled={downloadLoading === file._id}
                            >
                              {downloadLoading === file._id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DownloadIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                        {canDelete && (
                          <Tooltip title="Xóa">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setDeleteDialog({ open: true, file })
                              }
                              color="error"
                            >
                              {deleteLoading === file._id ? (
                                <CircularProgress size={16} />
                              ) : (
                                <DeleteIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "grey.200",
          }}
        >
          <Stack alignItems="center" spacing={2}>
            <FolderIcon sx={{ fontSize: 64, color: "grey.400" }} />
            <Typography variant="h6" color="text.secondary">
              Chưa có tệp nào
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={2}>
              Hãy tải lên tệp đầu tiên của bạn
            </Typography>
            <Button
              component="label"
              variant="contained"
              startIcon={<UploadFileIcon />}
              sx={{ borderRadius: 2 }}
            >
              Tải tệp lên
              <input hidden type="file" multiple onChange={onPick} />
            </Button>
          </Stack>
        </Paper>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, file: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" color="error.main">
            Xác nhận xóa tệp
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa tệp này không? Hành động này không thể
            hoàn tác.
          </Alert>
          {deleteDialog.file && (
            <Typography>
              <strong>Tên tệp:</strong> {deleteDialog.file.TenGoc}
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, file: null })}>
            Hủy
          </Button>
          <Button onClick={onDeleteConfirm} color="error" variant="contained">
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
