# INTEGRATION GUIDE - STEP-BY-STEP

## 📋 Mục lục

- [Quick Start](#quick-start)
- [Scenario-based Integration](#scenario-based-integration)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## 🚀 Quick Start

### **Scenario 1: Add File Attachments to New Module**

**Goal**: Thêm file upload cho module "HopDong" (Contracts)

#### **Step 1: Use AttachmentSection (Recommended)**

```jsx
// src/features/HopDong/HopDongDetail.js

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import AttachmentSection from "shared/components/AttachmentSection";

export default function HopDongDetail({ hopDongId }) {
  return (
    <Box>
      {/* Hop dong info */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">Thông tin hợp đồng</Typography>
        {/* ... form fields ... */}
      </Paper>

      {/* File attachments */}
      <Paper sx={{ p: 3 }}>
        <AttachmentSection
          ownerType="HopDong"
          ownerId={hopDongId}
          field="file"
          title="Tài liệu hợp đồng"
          allowedTypes={["application/pdf", ".docx", ".xlsx"]}
          maxSizeMB={50}
        />
      </Paper>
    </Box>
  );
}
```

**That's it!** Backend API already supports this. Zero backend code needed.

---

### **Scenario 2: Add Comments với File Upload**

**Goal**: Thêm comment system cho module "DuAn" (Projects)

#### **Step 1: Reuse CongViec Components**

```jsx
// src/features/DuAn/components/DuAnCommentsSection.js

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography } from "@mui/material";

// Import CongViec components
import CommentComposer from "features/QuanLyCongViec/CongViec/components/CommentComposer";
import CommentsList from "features/QuanLyCongViec/CongViec/components/CommentsList";

// DuAn-specific actions
import {
  createDuAnComment,
  getDuAnComments,
  updateDuAnComment,
  deleteDuAnComment,
} from "../duAnSlice";

export default function DuAnCommentsSection({ duAnId, user, theme }) {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.duAn.comments || []);

  // State for CommentComposer
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments
  useEffect(() => {
    if (duAnId) {
      dispatch(getDuAnComments(duAnId));
    }
  }, [duAnId, dispatch]);

  // Submit handler
  const handleSubmit = async () => {
    if (!newComment.trim() && pendingFiles.length === 0) return;

    setSubmitting(true);
    try {
      await dispatch(
        createDuAnComment({
          duAnId,
          noiDung: newComment,
          files: pendingFiles,
        }),
      );

      setNewComment("");
      setPendingFiles([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        💬 Bình luận
      </Typography>

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

      <CommentsList
        comments={comments}
        currentUser={user}
        theme={theme}
        onReply={(data) => dispatch(createDuAnComment({ ...data, duAnId }))}
        onEdit={(id, text) =>
          dispatch(updateDuAnComment({ duAnId, id, noiDung: text }))
        }
        onDelete={(id) => dispatch(deleteDuAnComment({ duAnId, id }))}
      />
    </Box>
  );
}
```

#### **Step 2: Redux Slice**

```javascript
// src/features/DuAn/duAnSlice.js

import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const slice = createSlice({
  name: "duAn",
  initialState: {
    comments: [],
    isLoading: false,
    error: null,
  },
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getCommentsSuccess(state, action) {
      state.isLoading = false;
      state.comments = action.payload;
    },
    addCommentSuccess(state, action) {
      state.isLoading = false;
      state.comments.unshift(action.payload);
    },
  },
});

// Actions
export const getDuAnComments = (duAnId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(`/duan/${duAnId}/comments`);
    dispatch(slice.actions.getCommentsSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const createDuAnComment =
  ({ duAnId, noiDung, files = [], parentId = null }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const formData = new FormData();
      formData.append("noiDung", noiDung || "");
      if (parentId) formData.append("parentId", parentId);
      files.forEach((f) => formData.append("files", f));

      const res = await apiService.post(`/duan/${duAnId}/comments`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      dispatch(slice.actions.addCommentSuccess(res.data.data));
      toast.success("Đã thêm bình luận");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// Export reducer
export default slice.reducer;
```

#### **Step 3: Backend Routes**

```javascript
// giaobanbv-be/routes/duan.api.js

const express = require("express");
const router = express.Router();
const { authentication } = require("../middlewares/authentication");
const upload = require("../modules/workmanagement/middlewares/upload.middleware");
const duAnController = require("../controllers/duAn.controller");

// Comment với files (atomic)
router.post(
  "/:duAnId/comments",
  authentication.loginRequired,
  upload.upload.array("files"),
  upload.verifyMagicAndTotalSize,
  duAnController.createCommentWithFiles,
);

// List comments
router.get(
  "/:duAnId/comments",
  authentication.loginRequired,
  duAnController.getComments,
);

module.exports = router;
```

#### **Step 4: Backend Controller**

```javascript
// giaobanbv-be/controllers/duAn.controller.js

const { catchAsync, sendResponse } = require("../helpers/utils");
const duAnService = require("../services/duAn.service");

const controller = {};

controller.createCommentWithFiles = catchAsync(async (req, res, next) => {
  const { duAnId } = req.params;
  const { noiDung, parentId } = req.body;
  const files = req.files || [];

  const result = await duAnService.createCommentWithFiles(
    duAnId,
    noiDung,
    files,
    req,
    parentId,
  );

  return sendResponse(res, 200, true, result, null, "Đã thêm bình luận");
});

controller.getComments = catchAsync(async (req, res, next) => {
  const { duAnId } = req.params;
  const comments = await duAnService.getComments(duAnId);
  return sendResponse(res, 200, true, comments, null, "");
});

module.exports = controller;
```

#### **Step 5: Backend Service**

```javascript
// giaobanbv-be/services/duAn.service.js

const BinhLuan = require("../modules/workmanagement/models/BinhLuan");
const TepTin = require("../modules/workmanagement/models/TepTin");
const fileService = require("../modules/workmanagement/services/file.service");
const { toObjectId } = require("../helpers/utils");

const service = {};

service.createCommentWithFiles = async (
  duAnId,
  noiDung,
  files,
  req,
  parentId = null,
) => {
  const nhanVienId = req.nhanVienId;

  // 1. Create comment
  const comment = await BinhLuan.create({
    NoiDung: noiDung?.trim() || "",
    DuAnID: toObjectId(duAnId), // ← Your entity field
    NguoiBinhLuanID: toObjectId(nhanVienId),
    BinhLuanChaID: parentId ? toObjectId(parentId) : undefined,
  });

  // 2. Upload files (if any)
  let filesDTO = [];
  if (files && files.length > 0) {
    // Reuse file service logic
    filesDTO = await fileService.uploadForEntity(
      "DuAn",
      duAnId,
      files,
      { moTa: "" },
      req,
      comment._id, // Link to comment
    );
  }

  // 3. Populate comment with files
  await comment.populate("Files");

  return { comment, files: filesDTO };
};

service.getComments = async (duAnId) => {
  const comments = await BinhLuan.find({ DuAnID: toObjectId(duAnId) })
    .populate("NguoiBinhLuanID", "HoTen ChucDanh")
    .populate("Files")
    .sort({ createdAt: -1 });

  return comments;
};

module.exports = service;
```

---

## 🎯 Scenario-based Integration

### **Scenario 3: Multiple Attachment Fields**

**Goal**: TapSan có 2 loại files: "kehoach" và "file"

```jsx
function TapSanDetail({ tapsanId }) {
  return (
    <Box>
      {/* Field 1: Kế hoạch (Planning documents) */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <AttachmentSection
          ownerType="TapSan"
          ownerId={tapsanId}
          field="kehoach"
          title="Kế hoạch tập san"
          allowedTypes={["application/pdf", ".docx"]}
          maxSizeMB={50}
        />
      </Paper>

      {/* Field 2: Tập san phát hành (Published files) */}
      <Paper sx={{ p: 3 }}>
        <AttachmentSection
          ownerType="TapSan"
          ownerId={tapsanId}
          field="file"
          title="Tệp tập san đã phát hành"
          allowedTypes={["application/pdf"]}
          maxSizeMB={100}
        />
      </Paper>
    </Box>
  );
}
```

**Backend**: Không cần thay đổi gì! API generic tự động support.

---

### **Scenario 4: Permission-based Upload**

**Goal**: Chỉ admin và người tạo mới được upload/delete

```jsx
function SecureAttachments({ documentId, document, user }) {
  const isOwner = document.NguoiTaoID === user._id;
  const isAdmin = user.PhanQuyen >= 3;
  const canEdit = isOwner || isAdmin;

  return (
    <AttachmentSection
      ownerType="Document"
      ownerId={documentId}
      field="file"
      title="Tài liệu"
      canUpload={canEdit}
      canDelete={canEdit}
      canPreview={true}
      canDownload={true}
      onChange={({ total }) => {
        console.log(`Có ${total} files`);
      }}
      onError={(message) => {
        toast.error(message);
      }}
    />
  );
}
```

---

### **Scenario 5: File Type Restrictions**

```jsx
// Only PDFs
<AttachmentSection
  ownerType="BaoCao"
  ownerId={baoCaoId}
  field="file"
  allowedTypes={["application/pdf"]}
  maxSizeMB={20}
/>

// Only images
<AttachmentSection
  ownerType="Gallery"
  ownerId={galleryId}
  field="photos"
  allowedTypes={["image/*"]}
  maxSizeMB={10}
/>

// Office documents only
<AttachmentSection
  ownerType="VanBan"
  ownerId={vanBanId}
  field="file"
  allowedTypes={[
    ".docx", ".doc",
    ".xlsx", ".xls",
    ".pptx", ".ppt"
  ]}
  maxSizeMB={50}
/>

// Mix
<AttachmentSection
  ownerType="ThuMuc"
  ownerId={thuMucId}
  field="file"
  allowedTypes={[
    "application/pdf",
    "image/*",
    ".docx", ".xlsx"
  ]}
  maxSizeMB={100}
/>
```

---

### **Scenario 6: Conditional Rendering**

```jsx
function ConditionalAttachments({ entityId, status, user }) {
  // Don't show if entity not saved yet
  if (!entityId) {
    return <Alert severity="info">Lưu thông tin trước khi upload file</Alert>;
  }

  // Archived: read-only
  if (status === "ARCHIVED") {
    return (
      <AttachmentSection
        ownerType="Entity"
        ownerId={entityId}
        field="file"
        title="Tài liệu đính kèm (Chỉ xem)"
        canUpload={false}
        canDelete={false}
      />
    );
  }

  // Draft: full access for owner
  if (status === "DRAFT" && user.isOwner) {
    return (
      <AttachmentSection
        ownerType="Entity"
        ownerId={entityId}
        field="file"
        canUpload={true}
        canDelete={true}
      />
    );
  }

  // Default: view + download only
  return (
    <AttachmentSection
      ownerType="Entity"
      ownerId={entityId}
      field="file"
      canUpload={false}
      canDelete={false}
    />
  );
}
```

---

## 🐛 Troubleshooting

### **Problem 1: "Cannot read property '\_id' of undefined"**

**Cause**: `ownerId` is undefined/null

**Solution**:

```jsx
// Wait for data to load
{
  entityId ? (
    <AttachmentSection ownerType="Entity" ownerId={entityId} field="file" />
  ) : (
    <CircularProgress />
  );
}
```

---

### **Problem 2: Files not showing after upload**

**Cause**: Component doesn't auto-refresh

**Solution**: Component auto-refreshes when `ownerId` changes. Force refresh:

```jsx
const [refreshKey, setRefreshKey] = useState(0);

<AttachmentSection
  key={refreshKey}  // ← Force re-mount
  ownerType="Entity"
  ownerId={entityId}
  field="file"
/>

<Button onClick={() => setRefreshKey(k => k + 1)}>
  Làm mới
</Button>
```

---

### **Problem 3: Upload fails with "Loại file không được phép"**

**Cause**: Backend MIME validation stricter than frontend

**Solution**: Check backend uploadConfig.js:

```javascript
// giaobanbv-be/modules/workmanagement/helpers/uploadConfig.js

ALLOWED_MIME: [
  "image/*",
  "application/pdf",
  // Add your MIME types here
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
```

Or set via environment variable:

```bash
# .env
ALLOWED_MIME=image/*,application/pdf,.docx,.xlsx
```

---

### **Problem 4: Vietnamese filename shows garbled**

**Cause**: UTF-8 encoding issue

**Solution**: Already handled by upload.middleware.js! If still occurs, check:

```javascript
// Middleware has UTF-8 decoder
function decodeOriginalNameToUtf8(name) {
  // ... automatic detection and conversion
}
```

---

### **Problem 5: 413 Payload Too Large**

**Cause**: File size exceeds backend limit

**Solution**: Increase backend limits:

```bash
# .env
MAX_FILE_SIZE_MB=100        # Per file
MAX_TOTAL_UPLOAD_MB=500     # Total upload
```

---

## ✅ Best Practices

### **1. Always validate ownerId**

```jsx
// ❌ BAD: No validation
<AttachmentSection
  ownerType="Entity"
  ownerId={entityId} // Could be undefined!
  field="file"
/>;

// ✅ GOOD: Conditional render
{
  entityId && (
    <AttachmentSection ownerType="Entity" ownerId={entityId} field="file" />
  );
}
```

---

### **2. Use specific file types**

```jsx
// ❌ BAD: Accept everything
<AttachmentSection
  ownerType="Contract"
  ownerId={id}
  field="file"
  // No allowedTypes = any file!
/>

// ✅ GOOD: Restrict to business files
<AttachmentSection
  ownerType="Contract"
  ownerId={id}
  field="file"
  allowedTypes={["application/pdf", ".docx", ".xlsx"]}
  maxSizeMB={50}
/>
```

---

### **3. Handle callbacks**

```jsx
<AttachmentSection
  ownerType="Entity"
  ownerId={entityId}
  field="file"
  onChange={({ items, total }) => {
    // Update parent state if needed
    setFileCount(total);

    // Log for analytics
    console.log(`User uploaded ${items.length} files`);
  }}
  onError={(message) => {
    // Show user-friendly error
    toast.error(message);

    // Log to error tracking
    logError("AttachmentUploadError", { message, entityId });
  }}
/>
```

---

### **4. Loading states**

```jsx
function EntityDetail({ entityId }) {
  const [entity, setEntity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEntity(entityId).then((data) => {
      setEntity(data);
      setLoading(false);
    });
  }, [entityId]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box>
      {/* Entity info */}

      {/* Files - only render when entity loaded */}
      <AttachmentSection ownerType="Entity" ownerId={entity._id} field="file" />
    </Box>
  );
}
```

---

### **5. Mobile optimization**

Component is mobile-friendly by default, but add wrapper for better UX:

```jsx
import { useMediaQuery, useTheme } from "@mui/material";

function ResponsiveAttachments({ entityId }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box
      sx={{
        px: isMobile ? 1 : 3, // Less padding on mobile
        py: isMobile ? 2 : 3,
      }}
    >
      <AttachmentSection
        ownerType="Entity"
        ownerId={entityId}
        field="file"
        maxSizeMB={isMobile ? 20 : 50} // Lower limit on mobile
      />
    </Box>
  );
}
```

---

## 📚 Templates

### **Template 1: Basic Document Management**

```jsx
// src/features/MyModule/MyModuleDetail.js

import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import AttachmentSection from "shared/components/AttachmentSection";

export default function MyModuleDetail({ recordId }) {
  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5">Thông tin</Typography>
        {/* Your form fields */}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <AttachmentSection
          ownerType="MyModule"
          ownerId={recordId}
          field="file"
          title="Tài liệu đính kèm"
          allowedTypes={["application/pdf", ".docx", ".xlsx"]}
          maxSizeMB={50}
        />
      </Paper>
    </Box>
  );
}
```

---

### **Template 2: Comment System**

```jsx
// src/features/MyModule/components/MyModuleComments.js

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CommentComposer from "features/QuanLyCongViec/CongViec/components/CommentComposer";
import CommentsList from "features/QuanLyCongViec/CongViec/components/CommentsList";

export default function MyModuleComments({ moduleId, user, theme }) {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.myModule.comments);

  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (moduleId) {
      dispatch(getComments(moduleId));
    }
  }, [moduleId]);

  const handleSubmit = async () => {
    if (!newComment.trim() && pendingFiles.length === 0) return;

    setSubmitting(true);
    try {
      await dispatch(
        createComment({
          moduleId,
          noiDung: newComment,
          files: pendingFiles,
        }),
      );
      setNewComment("");
      setPendingFiles([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
      <CommentsList comments={comments} currentUser={user} theme={theme} />
    </>
  );
}
```

---

## 🔗 Related

- [Overview](./00_OVERVIEW.md)
- [AttachmentSection API](./01_ATTACHMENT_SECTION.md)
- [Backend Architecture](./06_BACKEND_ARCHITECTURE.md)
- [API Reference](./08_API_REFERENCE.md)

---

**Last Updated**: January 27, 2026  
**Version**: 1.0.0
