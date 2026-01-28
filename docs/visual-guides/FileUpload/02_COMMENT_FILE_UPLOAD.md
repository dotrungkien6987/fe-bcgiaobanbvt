# COMMENT FILE UPLOAD - CONGVIEC LEGACY SYSTEM

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Components](#components)
- [Upload Flow](#upload-flow)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Backend Integration](#backend-integration)

---

## 🎯 Giới thiệu

Hệ thống upload file cho **CongViec (Tasks)** module, được thiết kế đặc biệt cho **inline comment uploads** với các tính năng:

✅ **Atomic Operations**: Comment + files được tạo cùng lúc  
✅ **Inline Upload**: Upload ngay trong comment box  
✅ **Drag & Drop**: Kéo thả file vào comment textarea  
✅ **Paste Support**: Ctrl+V để paste ảnh từ clipboard  
✅ **Preview Before Send**: Xem trước thumbnail ảnh trước khi gửi  
✅ **Multiple Upload Points**: Comment files + Task-level files

### **File Locations**

```
📁 src/features/QuanLyCongViec/CongViec/components/
   ├── CommentComposer.js      # Comment input với file upload
   ├── CommentsList.js         # Hiển thị comments với files
   ├── ReplyInput.js           # Reply input với file attach
   ├── FilesSidebar.js         # Task-level file management
   └── TaskDetail.js           # Main task detail page

📁 src/features/QuanLyCongViec/CongViec/
   └── congViecSlice.js        # Redux actions
```

---

## 🏗️ Components

### **1. CommentComposer** - Main Comment Input

#### **Purpose**

Component chính để nhập bình luận với khả năng đính kèm file.

#### **Visual Structure**

```
┌───────────────────────────────────────────────────────────┐
│  Kéo thả file vào đây hoặc paste (Ctrl+V)                │
│  ┌─────────────────────────────────────────────────────┐ │
│  │ Nhập bình luận của bạn...                           │ │
│  │                                                      │ │
│  │                                                      │ │
│  └─────────────────────────────────────────────────────┘ │
│                                                           │
│  Files đã chọn:                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ 🖼️ image.png │  │ 📄 report.pdf│  │ 📊 data.xlsx │  │
│  │ 2.3 MB    [×]│  │ 1.5 MB   [×]│  │ 856 KB   [×]│  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                           │
│  [📎 Chọn file]                          [🚀 Gửi bình luận] │
└───────────────────────────────────────────────────────────┘
```

#### **Props**

```javascript
<CommentComposer
  theme={theme}
  newComment={newComment}
  setNewComment={setNewComment}
  pendingFiles={pendingFiles}
  setPendingFiles={setPendingFiles}
  dragCommentActive={dragCommentActive}
  setDragCommentActive={setDragCommentActive}
  onSubmit={handleSubmitComment}
  submittingComment={submittingComment}
/>
```

#### **Key Features**

**1. Drag & Drop Zone**

```javascript
<Box
  onDragOver={(e) => {
    e.preventDefault();
    setDragCommentActive(true);
  }}
  onDrop={async (e) => {
    e.preventDefault();
    setDragCommentActive(false);
    const files = extractFilesFromDataTransfer(e.dataTransfer);
    addPendingFiles(files);
  }}
>
  {/* Comment textarea */}
</Box>
```

**2. Paste from Clipboard**

```javascript
<TextField
  onPaste={async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const files = [];
    for (const item of items) {
      if (item.kind === "file") {
        const file = item.getAsFile();
        if (file) files.push(file);
      }
    }

    if (files.length) {
      e.preventDefault();
      addPendingFiles(files);
    }
  }}
/>
```

**3. Image Thumbnails**

```javascript
const [filePreviews, setFilePreviews] = useState({});

useEffect(() => {
  const newPreviews = {};
  pendingFiles.forEach((file, idx) => {
    if (file.type?.startsWith("image/")) {
      newPreviews[idx] = URL.createObjectURL(file);
    }
  });
  setFilePreviews(newPreviews);

  // Cleanup
  return () => {
    Object.values(newPreviews).forEach((url) => URL.revokeObjectURL(url));
  };
}, [pendingFiles]);
```

**4. File Chips/Thumbnails**

```javascript
// Image preview
{
  file.type?.startsWith("image/") ? (
    <Box
      component="img"
      src={filePreviews[idx]}
      sx={{
        width: 80,
        height: 80,
        objectFit: "cover",
        borderRadius: 1,
      }}
    />
  ) : (
    // Non-image chip
    <Chip
      label={`${file.name} (${formatSize(file.size)})`}
      onDelete={() => removePendingFile(idx)}
      icon={<AttachFileIcon />}
    />
  );
}
```

---

### **2. FilesSidebar** - Task File Manager

#### **Purpose**

Quản lý files ở task-level (không liên quan đến comment cụ thể).

#### **Visual Structure**

```
┌──────────────────────────────┐
│  📎 TẬP TIN (5)             │
├──────────────────────────────┤
│  ┌────────────────────────┐ │
│  │  Kéo thả file vào đây  │ │
│  │        hoặc            │ │
│  │  [📤 Upload File]      │ │
│  └────────────────────────┘ │
├──────────────────────────────┤
│  📄 baocao-tiendo.pdf       │
│     Nguyễn Văn A            │
│     2.3 MB • 25/01/2026     │
│     [👁 Xem] [⬇ Tải] [🗑 Xóa] │
├──────────────────────────────┤
│  🖼️ screenshot.png          │
│     Trần Thị B              │
│     1.8 MB • 24/01/2026     │
│     [👁 Xem] [⬇ Tải] [🗑 Xóa] │
├──────────────────────────────┤
│  📊 thongke.xlsx            │
│     Lê Văn C                │
│     856 KB • 23/01/2026     │
│     [👁 Xem] [⬇ Tải] [🗑 Xóa] │
└──────────────────────────────┘
```

#### **Props**

```javascript
<FilesSidebar
  theme={theme}
  dragSidebarActive={dragSidebarActive}
  setDragSidebarActive={setDragSidebarActive}
  fileCount={fileCount}
  filesState={filesState}
  onUploadFiles={handleUploadFiles}
  onViewFile={handleViewFile}
  onDownloadFile={handleDownloadFile}
  onDeleteFile={handleDeleteFile}
/>
```

#### **Key Features**

**1. File Type Icons**

```javascript
const getFileIcon = (fileName) => {
  const ext = fileName?.toLowerCase().split(".").pop();

  switch (ext) {
    case "pdf":
      return <FileIcon sx={{ color: "#d32f2f" }} />;
    case "doc":
    case "docx":
      return <FileIcon sx={{ color: "#1976d2" }} />;
    case "xls":
    case "xlsx":
      return <FileIcon sx={{ color: "#388e3c" }} />;
    case "jpg":
    case "jpeg":
    case "png":
      return <FileIcon sx={{ color: "#e91e63" }} />;
    default:
      return <FileIcon />;
  }
};
```

**2. Uploader Info Display**

```javascript
const getUploaderName = (file) => {
  // Multiple possible data shapes
  if (file.NguoiTaiLenID?.HoTen) {
    return file.NguoiTaiLenID.HoTen;
  }
  if (file.NguoiTaiLenID?.UserName) {
    return file.NguoiTaiLenID.UserName;
  }
  if (file.uploader?.HoTen) {
    return file.uploader.HoTen;
  }
  return "Unknown";
};
```

**3. File Actions**

```javascript
// View inline
const handleViewFile = async (file) => {
  const url = `/workmanagement/files/${file._id}/inline`;
  const res = await api.get(url, { responseType: "blob" });
  const blobUrl = URL.createObjectURL(res.data);
  window.open(blobUrl, "_blank");
};

// Download
const handleDownloadFile = async (file) => {
  const url = `/workmanagement/files/${file._id}/download`;
  const res = await api.get(url, { responseType: "blob" });
  const blobUrl = URL.createObjectURL(res.data);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = file.TenGoc || "download";
  a.click();
};

// Delete with confirmation
const handleDeleteFile = async (fileId) => {
  if (!window.confirm("Xác nhận xóa file?")) return;
  await api.delete(`/workmanagement/files/${fileId}`);
  refreshFiles();
};
```

---

### **3. CommentsList** - Display Comments

#### **Purpose**

Hiển thị danh sách comments với file attachments.

#### **Visual Structure**

```
┌─────────────────────────────────────────────────────────┐
│  👤 Nguyễn Văn A        ⭐ Manager        25/01/2026    │
├─────────────────────────────────────────────────────────┤
│  Đây là báo cáo tiến độ tuần này. Vui lòng xem file    │
│  đính kèm để biết chi tiết.                             │
│                                                          │
│  Files đính kèm:                                        │
│  ┌────────────────┐  ┌────────────────┐               │
│  │ 📄 baocao.pdf  │  │ 🖼️ chart.png   │               │
│  │ 2.3 MB         │  │ 1.2 MB         │               │
│  │ [👁] [⬇]      │  │ [👁] [⬇]      │               │
│  └────────────────┘  └────────────────┘               │
│                                                          │
│  [💬 Trả lời]                                           │
│                                                          │
│  ┌─ Phản hồi (2) ─────────────────────────────────┐   │
│  │  👤 Trần Thị B        25/01/2026               │   │
│  │  Cảm ơn báo cáo!                                │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

#### **File Display in Comment**

```javascript
{
  comment.Files && comment.Files.length > 0 && (
    <Box sx={{ mt: 2 }}>
      <Typography variant="caption" color="text.secondary">
        Files đính kèm ({comment.Files.length}):
      </Typography>
      <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
        {comment.Files.map((file) => (
          <Card key={file._id} sx={{ minWidth: 120 }}>
            <CardContent>
              <Stack spacing={1}>
                <Typography variant="body2" noWrap>
                  {getFileIcon(file.TenGoc)} {file.TenGoc}
                </Typography>
                <Typography variant="caption">
                  {formatFileSize(file.KichThuoc)}
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => handleView(file)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDownload(file)}>
                    <DownloadIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>
    </Box>
  );
}
```

---

### **4. ReplyInput** - Reply with Files

#### **Purpose**

Trả lời comment với khả năng đính kèm file (simplified version của CommentComposer).

#### **Visual Structure**

```
┌───────────────────────────────────────────────────┐
│  Trả lời bình luận này...                         │
│  ┌─────────────────────────────────────────────┐ │
│  │                                              │ │
│  └─────────────────────────────────────────────┘ │
│                                                   │
│  [📎 Đính kèm file (2)]        [Gửi]            │
└───────────────────────────────────────────────────┘
```

#### **Implementation**

```javascript
function ReplyInput({ parentCommentId, onSubmit }) {
  const [replyText, setReplyText] = useState("");
  const [replyFiles, setReplyFiles] = useState([]);
  const fileInputRef = useRef(null);

  const handleSubmit = async () => {
    if (!replyText.trim() && replyFiles.length === 0) return;

    await onSubmit({
      noiDung: replyText,
      files: replyFiles,
      parentId: parentCommentId,
    });

    setReplyText("");
    setReplyFiles([]);
  };

  return (
    <Box>
      <TextField
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Trả lời bình luận này..."
        multiline
        rows={2}
      />

      <Stack direction="row" spacing={1} mt={1}>
        <Button component="label" startIcon={<AttachFileIcon />} size="small">
          Đính kèm file {replyFiles.length > 0 && `(${replyFiles.length})`}
          <input
            ref={fileInputRef}
            hidden
            type="file"
            multiple
            onChange={(e) => setReplyFiles(Array.from(e.target.files))}
          />
        </Button>

        <Button onClick={handleSubmit} variant="contained" size="small">
          Gửi
        </Button>
      </Stack>
    </Box>
  );
}
```

---

## 🔄 Upload Flow

### **Complete Flow Diagram**

```
┌─────────────────────────────────────────────────────────┐
│ 1. USER INPUT                                           │
│    • Types comment text: "Đây là báo cáo"             │
│    • Drag & drop: baocao.pdf, chart.png                │
│    • OR paste from clipboard (Ctrl+V)                  │
│    • OR click "Chọn file" button                       │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 2. CLIENT STATE UPDATE                                  │
│    • newComment = "Đây là báo cáo"                     │
│    • pendingFiles = [File1, File2]                     │
│    • Generate thumbnails for images                     │
│    • Display file chips/thumbnails                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 3. USER CLICKS "GỬI BÌNH LUẬN"                         │
│    • Validate: noiDung || files.length > 0             │
│    • Create FormData                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 4. REDUX ACTION                                         │
│    dispatch(createCommentWithFiles(congViecId, {        │
│      noiDung: "Đây là báo cáo",                        │
│      files: [File1, File2]                             │
│    }))                                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 5. API CALL                                            │
│    FormData creation:                                   │
│    • formData.append("noiDung", "Đây là báo cáo")     │
│    • formData.append("files", File1)                   │
│    • formData.append("files", File2)                   │
│                                                         │
│    POST /api/workmanagement/congviec/{id}/comments     │
│    Content-Type: multipart/form-data                   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 6. BACKEND: MULTER MIDDLEWARE                          │
│    • upload.array("files") processes files             │
│    • Saves to disk:                                     │
│      uploads/congviec/{congViecId}/comments/           │
│      {commentId}/2026/01/file.ext                      │
│    • Validates: MIME type, magic number, size          │
│    • UTF-8 filename handling                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 7. BACKEND: SERVICE LAYER                              │
│    service.createCommentWithFiles():                    │
│                                                         │
│    a) Create BinhLuan record:                          │
│       {                                                 │
│         NoiDung: "Đây là báo cáo",                    │
│         CongViecID: "...",                            │
│         NguoiBinhLuanID: "...",                        │
│         BinhLuanChaID: null                            │
│       }                                                 │
│                                                         │
│    b) Create TepTin records (for each file):           │
│       {                                                 │
│         TenFile: "1738001234-a8c3ef-baocao.pdf",      │
│         TenGoc: "baocao.pdf",                         │
│         LoaiFile: "application/pdf",                   │
│         KichThuoc: 2400000,                            │
│         DuongDan: "congviec/.../comments/.../...",    │
│         CongViecID: "...",                            │
│         BinhLuanID: comment._id,  ← LINK!            │
│         NguoiTaiLenID: "...",                         │
│         TrangThai: "ACTIVE"                            │
│       }                                                 │
│                                                         │
│    c) Return comment DTO with populated Files          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 8. FRONTEND: REDUX UPDATE                              │
│    • Add comment to state.congViec.comments            │
│    • Comment includes Files array                       │
│    • Reset form: newComment = "", pendingFiles = []    │
│    • Show success toast                                 │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│ 9. UI UPDATE                                           │
│    • CommentsList re-renders                           │
│    • New comment appears with file attachments         │
│    • Files have view/download actions                  │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### **1. Atomic Comment + Files**

**Key Advantage**: Comment và files được tạo cùng 1 request → không bao giờ có comment không có file hoặc ngược lại.

```javascript
// Single atomic operation
POST /api/workmanagement/congviec/:id/comments
Body: FormData {
  noiDung: "text",
  files: [File1, File2, ...]
}

// Returns
{
  comment: {
    _id: "...",
    NoiDung: "...",
    Files: [
      { _id: "...", TenGoc: "file1.pdf", ... },
      { _id: "...", TenGoc: "file2.png", ... }
    ]
  }
}
```

### **2. Paste Support**

**Use Case**: User chụp screenshot → Ctrl+V vào comment box → tự động attach.

```javascript
const handlePaste = async (e) => {
  const items = e.clipboardData?.items;
  if (!items) return;

  const files = [];
  for (const item of items) {
    if (item.kind === "file") {
      const file = item.getAsFile();
      if (file) files.push(file);
    }
  }

  if (files.length) {
    e.preventDefault(); // Prevent paste as text
    addPendingFiles(files);
  }
};
```

### **3. Deduplication**

Tránh upload file trùng lặp:

```javascript
const addPendingFiles = (list) => {
  setPendingFiles((arr) => {
    const key = (f) => `${f.name}__${f.size}`; // Unique key
    const existing = new Set(arr.map(key));
    const toAdd = list.filter((f) => !existing.has(key(f)));
    return [...arr, ...toAdd];
  });
};
```

### **4. Visual Feedback**

```javascript
// Drag active state
sx={{
  border: dragCommentActive
    ? `2px dashed ${theme.palette.primary.main}`
    : `1px solid ${theme.palette.divider}`,
  bgcolor: dragCommentActive
    ? theme.palette.primary.lighter
    : "transparent"
}}

// Upload progress
{submittingComment && (
  <CircularProgress size={20} />
)}
```

---

## 💻 Usage Examples

### **Example 1: Basic Integration**

```jsx
import CommentComposer from "features/QuanLyCongViec/CongViec/components/CommentComposer";
import { createCommentWithFiles } from "features/QuanLyCongViec/CongViec/congViecSlice";

function TaskDetail({ taskId }) {
  const dispatch = useDispatch();
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!newComment.trim() && pendingFiles.length === 0) return;

    setSubmitting(true);
    try {
      await dispatch(
        createCommentWithFiles(
          taskId,
          {
            noiDung: newComment,
          },
          pendingFiles,
        ),
      );

      setNewComment("");
      setPendingFiles([]);
      toast.success("Đã thêm bình luận");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CommentComposer
      theme={theme}
      newComment={newComment}
      setNewComment={setNewComment}
      pendingFiles={pendingFiles}
      setPendingFiles={setPendingFiles}
      dragCommentActive={dragActive}
      setDragCommentActive={setDragActive}
      onSubmit={handleSubmit}
      submittingComment={submitting}
    />
  );
}
```

### **Example 2: Reply with Files**

```jsx
function CommentWithReply({ comment, taskId }) {
  const [showReply, setShowReply] = useState(false);

  const handleReply = async ({ noiDung, files, parentId }) => {
    await dispatch(
      createCommentWithFiles(
        taskId,
        {
          noiDung,
          parentId,
        },
        files,
      ),
    );
    setShowReply(false);
  };

  return (
    <Box>
      <CommentCard comment={comment} />

      <Button onClick={() => setShowReply(!showReply)}>💬 Trả lời</Button>

      {showReply && (
        <ReplyInput parentCommentId={comment._id} onSubmit={handleReply} />
      )}
    </Box>
  );
}
```

---

## 🔗 Backend Integration

### **Redux Slice**

```javascript
// src/features/QuanLyCongViec/CongViec/congViecSlice.js

export const createCommentWithFiles =
  (congViecId, data, files) => async (dispatch) => {
    dispatch(slice.actions.startLoading());

    try {
      const form = new FormData();
      form.append("noiDung", data.noiDung || "");
      if (data.parentId) {
        form.append("parentId", data.parentId);
      }

      files.forEach((f) => form.append("files", f));

      const response = await apiService.post(
        `/workmanagement/congviec/${congViecId}/comments`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        },
      );

      dispatch(slice.actions.addCommentSuccess(response.data.data));
      toast.success("Đã thêm bình luận");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
```

### **Backend Route**

```javascript
// giaobanbv-be/modules/workmanagement/routes/files.api.js

router.post(
  "/congviec/:congViecId/comments",
  authentication.loginRequired,
  upload.array("files"),
  fileController.createCommentWithFiles,
);
```

### **Backend Controller**

```javascript
// giaobanbv-be/modules/workmanagement/controllers/file.controller.js

controller.createCommentWithFiles = catchAsync(async (req, res, next) => {
  const { congViecId } = req.params;
  const { noiDung, parentId } = req.body;
  const files = req.files || [];

  const result = await fileService.createCommentWithFiles(
    congViecId,
    noiDung,
    files,
    req,
    parentId,
  );

  return sendResponse(
    res,
    200,
    true,
    result,
    null,
    "Đã thêm bình luận với file đính kèm",
  );
});
```

---

## 🔗 Related

- [YeuCau Reuse Pattern](./03_YEUCAU_REUSE_PATTERN.md)
- [Component Comparison](./04_COMPONENT_COMPARISON.md)
- [Backend Architecture](./06_BACKEND_ARCHITECTURE.md)

---

**Last Updated**: January 27, 2026  
**Component Version**: 1.0.0
