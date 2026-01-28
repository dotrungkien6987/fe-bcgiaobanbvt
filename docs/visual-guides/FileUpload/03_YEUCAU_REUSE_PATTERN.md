# YEUCAU REUSE PATTERN - SMART CODE REUSE

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Kiến trúc tái sử dụng](#kiến-trúc-tái-sử-dụng)
- [Implementation](#implementation)
- [Benefits](#benefits)
- [Adaptation Pattern](#adaptation-pattern)

---

## 🎯 Giới thiệu

**YeuCau (Tickets)** module là ví dụ điển hình về **smart code reuse** - thay vì duplicate code, module này **import và wrap** các components từ CongViec.

### **Key Insight**

> "YeuCau và CongViec đều cần comment system với file uploads. Thay vì viết lại, hãy tái sử dụng!"

### **Reuse Strategy**

```
CongViec Components (Original)
        ↓
    [Import]
        ↓
YeuCau Wrapper Component
        ↓
    [Adapt Props]
        ↓
YeuCau-specific API calls
```

---

## 🏗️ Kiến trúc tái sử dụng

### **File Structure**

```
src/features/QuanLyCongViec/
├── CongViec/
│   └── components/
│       ├── CommentComposer.js      ← ORIGINAL
│       ├── CommentsList.js         ← ORIGINAL
│       └── ReplyInput.js           ← ORIGINAL
│
└── YeuCau/
    └── components/
        └── YeuCauCommentsSection.js  ← WRAPPER (imports above)
```

### **Component Relationship Diagram**

```
┌────────────────────────────────────────────────────────────┐
│                    CongViec Module                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Comment      │  │ Comments     │  │ Reply        │   │
│  │ Composer     │  │ List         │  │ Input        │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────┘
         ↑                  ↑                  ↑
         │                  │                  │
         │      [IMPORT & REUSE]                │
         │                  │                  │
┌────────────────────────────────────────────────────────────┐
│                    YeuCau Module                           │
│  ┌──────────────────────────────────────────────────────┐ │
│  │         YeuCauCommentsSection (Wrapper)              │ │
│  │                                                      │ │
│  │  • Maps YeuCau props → CongViec props               │ │
│  │  • Calls YeuCau-specific APIs                       │ │
│  │  • Identical UI/UX to CongViec                      │ │
│  └──────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────┘
```

---

## 💻 Implementation

### **YeuCauCommentsSection Component**

```javascript
// src/features/QuanLyCongViec/YeuCau/components/YeuCauCommentsSection.js

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Divider } from "@mui/material";

// ⭐ IMPORT CONGVIEC COMPONENTS
import CommentComposer from "../../CongViec/components/CommentComposer";
import CommentsList from "../../CongViec/components/CommentsList";

// YeuCau-specific actions
import {
  addYeuCauCommentWithFiles,
  updateYeuCauComment,
  deleteYeuCauComment,
  getYeuCauBinhLuan,
} from "../yeuCauSlice";

export default function YeuCauCommentsSection({ yeuCauId, user, theme }) {
  const dispatch = useDispatch();

  // YeuCau-specific state
  const { binhLuanList, isLoading } = useSelector((state) => ({
    binhLuanList: state.yeuCau.binhLuanList || [],
    isLoading: state.yeuCau.isLoading,
  }));

  // Local state (same as CongViec)
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragCommentActive, setDragCommentActive] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);

  // Load comments on mount
  useEffect(() => {
    if (yeuCauId) {
      dispatch(getYeuCauBinhLuan(yeuCauId));
    }
  }, [yeuCauId, dispatch]);

  // ⭐ ADAPT: YeuCau API call
  const handleAddComment = async () => {
    if (!newComment.trim() && pendingFiles.length === 0) return;

    setSubmittingComment(true);
    try {
      await dispatch(
        addYeuCauCommentWithFiles({
          yeuCauId,
          noiDung: newComment,
          files: pendingFiles,
        }),
      );

      // Reset form
      setNewComment("");
      setPendingFiles([]);
    } finally {
      setSubmittingComment(false);
    }
  };

  // ⭐ ADAPT: YeuCau reply API call
  const handleReply = async ({ noiDung, files, parentId }) => {
    await dispatch(
      addYeuCauCommentWithFiles({
        yeuCauId,
        noiDung,
        files,
        parentId,
      }),
    );
  };

  // ⭐ ADAPT: YeuCau edit API call
  const handleEditComment = async (commentId, newText) => {
    await dispatch(
      updateYeuCauComment({
        yeuCauId,
        commentId,
        noiDung: newText,
      }),
    );
  };

  // ⭐ ADAPT: YeuCau delete API call
  const handleDeleteComment = async (commentId) => {
    await dispatch(
      deleteYeuCauComment({
        yeuCauId,
        commentId,
      }),
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        💬 Bình luận
      </Typography>

      <Divider sx={{ mb: 2 }} />

      {/* ⭐ REUSE: CommentComposer with YeuCau-adapted handler */}
      <CommentComposer
        theme={theme}
        newComment={newComment}
        setNewComment={setNewComment}
        pendingFiles={pendingFiles}
        setPendingFiles={setPendingFiles}
        dragCommentActive={dragCommentActive}
        setDragCommentActive={setDragCommentActive}
        onSubmit={handleAddComment} // ← YeuCau-specific
        submittingComment={submittingComment}
      />

      {/* ⭐ REUSE: CommentsList with YeuCau-adapted handlers */}
      <CommentsList
        comments={binhLuanList}
        currentUser={user}
        theme={theme}
        onReply={handleReply} // ← YeuCau-specific
        onEdit={handleEditComment} // ← YeuCau-specific
        onDelete={handleDeleteComment} // ← YeuCau-specific
        loading={isLoading}
      />
    </Box>
  );
}
```

---

## 🔄 Adaptation Pattern

### **Props Mapping**

```javascript
// CongViec expects:
CommentComposer({
  onSubmit: (noiDung, files) => createCongViecComment(...)
})

// YeuCau adapts:
YeuCauCommentsSection({
  onSubmit: handleAddComment  // Wraps createYeuCauComment
})
```

### **API Call Adaptation**

#### **CongViec API:**

```javascript
// CongViec Redux Action
export const createCommentWithFiles =
  (congViecId, data, files) => async (dispatch) => {
    const form = new FormData();
    form.append("noiDung", data.noiDung);
    files.forEach((f) => form.append("files", f));

    await apiService.post(
      `/workmanagement/congviec/${congViecId}/comments`,
      form,
    );
  };
```

#### **YeuCau API (adapted):**

```javascript
// YeuCau Redux Action
export const addYeuCauCommentWithFiles =
  ({ yeuCauId, noiDung, files = [], parentId = null }) =>
  async (dispatch) => {
    const formData = new FormData();
    formData.append("noiDung", noiDung || "");
    if (parentId) formData.append("parentId", parentId);
    files.forEach((f) => formData.append("files", f));

    await apiService.post(
      `/workmanagement/yeucau/${yeuCauId}/comments`, // ← Different endpoint
      formData,
    );
  };
```

### **State Mapping**

```javascript
// CongViec state
const comments = useSelector((state) => state.congViec.comments);

// YeuCau state (different slice, same structure)
const comments = useSelector((state) => state.yeuCau.binhLuanList);

// ⭐ Pass to same component
<CommentsList comments={comments} />;
```

---

## ✅ Benefits

### **1. Zero UI Duplication**

```
Lines of Code Saved: ~800 lines
- CommentComposer: ~250 lines
- CommentsList: ~400 lines
- ReplyInput: ~150 lines
```

**Instead of duplicating**, YeuCau wrapper = **~150 lines only**!

### **2. Consistent UX**

Users experience **identical UI/UX** between CongViec và YeuCau:

- Same drag & drop behavior
- Same paste support
- Same file preview
- Same visual design

### **3. Single Source of Truth**

Bug fixes và improvements to CongViec components **automatically benefit YeuCau**:

```
Fix: Add keyboard shortcut (Ctrl+Enter) to submit comment
Location: CommentComposer.js
Effect: ✅ CongViec gets it
        ✅ YeuCau gets it (automatically!)
```

### **4. Maintainability**

```
Scenario: Change file upload validation logic

WITHOUT reuse:
  ✏️ Edit CongViec/CommentComposer.js
  ✏️ Edit YeuCau/YeuCauCommentInput.js  (duplicate!)
  ✏️ Edit Ticket/TicketCommentForm.js   (another duplicate!)
  🔍 Risk: Miss one file = inconsistent behavior

WITH reuse:
  ✏️ Edit CongViec/CommentComposer.js
  ✅ All modules updated automatically
```

### **5. Testability**

```
Test suite: CommentComposer.test.js
Coverage: ✅ CongViec
          ✅ YeuCau (via wrapper)
          ✅ Any future modules using same pattern
```

---

## 🎨 Customization Points

### **When YeuCau Needs Different Behavior**

#### **Example: Different Permissions**

```javascript
function YeuCauCommentsSection({ yeuCau, user }) {
  // YeuCau-specific permission logic
  const canComment = user?.PhanQuyen >= 2 || yeuCau.NguoiTaoID === user._id;

  return (
    <>
      {canComment ? (
        <CommentComposer {...props} />
      ) : (
        <Alert severity="info">Chỉ người tạo và quản lý có thể bình luận</Alert>
      )}
      <CommentsList {...props} />
    </>
  );
}
```

#### **Example: Additional Metadata**

```javascript
const handleAddComment = async () => {
  await dispatch(
    addYeuCauCommentWithFiles({
      yeuCauId,
      noiDung: newComment,
      files: pendingFiles,
      // ⭐ YeuCau-specific metadata
      priority: yeuCau.priority,
      category: yeuCau.category,
    }),
  );
};
```

---

## 🔧 Extension Pattern for Other Modules

### **Template for Reusing CongViec Comments**

```javascript
// src/features/MyNewModule/components/MyModuleCommentsSection.js

import CommentComposer from "features/QuanLyCongViec/CongViec/components/CommentComposer";
import CommentsList from "features/QuanLyCongViec/CongViec/components/CommentsList";
import { addMyModuleComment, getMyModuleComments } from "../myModuleSlice";

export default function MyModuleCommentsSection({ entityId, user }) {
  const dispatch = useDispatch();
  const comments = useSelector((state) => state.myModule.comments);

  // Standard state
  const [newComment, setNewComment] = useState("");
  const [pendingFiles, setPendingFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load comments
  useEffect(() => {
    if (entityId) {
      dispatch(getMyModuleComments(entityId));
    }
  }, [entityId]);

  // Adapt API call
  const handleSubmit = async () => {
    if (!newComment.trim() && pendingFiles.length === 0) return;

    setSubmitting(true);
    try {
      await dispatch(
        addMyModuleComment({
          entityId,
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
        onReply={handleReply}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </Box>
  );
}
```

### **Backend Requirements**

Implement similar backend pattern:

```javascript
// routes/mymodule.api.js
router.post(
  "/mymodule/:id/comments",
  authentication.loginRequired,
  upload.array("files"),
  myModuleController.createCommentWithFiles,
);

// controller
controller.createCommentWithFiles = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { noiDung, parentId } = req.body;
  const files = req.files || [];

  const result = await myModuleService.createCommentWithFiles(
    id,
    noiDung,
    files,
    req,
    parentId,
  );

  return sendResponse(res, 200, true, result, null, "Success");
});

// service (similar to CongViec)
service.createCommentWithFiles = async (
  entityId,
  noiDung,
  files,
  req,
  parentId,
) => {
  // 1. Create comment
  const comment = await BinhLuan.create({
    NoiDung: noiDung,
    MyModuleID: entityId, // ← Change to your entity
    NguoiBinhLuanID: req.nhanVienId,
    BinhLuanChaID: parentId,
  });

  // 2. Upload files
  const filesDTO = await uploadFilesForMyModule(
    entityId,
    files,
    { moTa: "" },
    req,
    comment._id,
  );

  return { comment, files: filesDTO };
};
```

---

## 📊 Comparison: Reuse vs Duplicate

### **Code Metrics**

| Metric                 | With Reuse (YeuCau) | Without Reuse (Hypothetical) |
| ---------------------- | ------------------- | ---------------------------- |
| **Component files**    | 1 wrapper           | 3 duplicated components      |
| **Lines of code**      | ~150                | ~800                         |
| **Maintenance burden** | Low                 | High (3x)                    |
| **Bug risk**           | Low (single source) | High (sync issues)           |
| **Test coverage**      | Shared              | Need separate tests          |
| **Consistency**        | Guaranteed          | Manual effort                |

### **Development Time**

```
Scenario: Add comments to new module

WITH reuse pattern:
  1. Create wrapper component: 30 min
  2. Adapt Redux actions: 20 min
  3. Backend routes: 40 min
  Total: ~90 minutes ✅

WITHOUT reuse (duplicate):
  1. Copy & modify UI components: 2 hours
  2. Update styling/theming: 1 hour
  3. Fix edge cases: 1.5 hours
  4. Write tests: 2 hours
  Total: ~6.5 hours ⚠️
```

**Time saved: 5+ hours per module!**

---

## 🎯 Key Takeaways

### **When to Reuse CongViec Comments**

✅ **YES, reuse if:**

- Module needs comment system with file uploads
- Want consistent UX with CongViec/YeuCau
- Backend can implement similar atomic comment+files API
- Entity has similar permission model

❌ **NO, don't reuse if:**

- Need completely different UI (e.g., chat-style vs threaded)
- Files managed separately from comments
- Different file upload strategy (e.g., Cloudinary only)
- Highly specialized workflow

### **Pattern Summary**

```
1. Import CongViec components
2. Create wrapper component
3. Map local state to component props
4. Adapt onSubmit/onReply handlers to call your APIs
5. Map your Redux state to component's expected shape
```

---

## 🔗 Related

- [Comment File Upload](./02_COMMENT_FILE_UPLOAD.md) - CongViec original
- [Component Comparison](./04_COMPONENT_COMPARISON.md) - Detailed comparison
- [Integration Guide](./05_INTEGRATION_GUIDE.md) - Step-by-step for new modules

---

**Last Updated**: January 27, 2026  
**Pattern Version**: 1.0.0
