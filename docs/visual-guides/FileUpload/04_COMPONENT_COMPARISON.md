# COMPONENT COMPARISON - LEGACY VS MODERN

## 📋 Mục lục

- [Overview](#overview)
- [Detailed Comparison](#detailed-comparison)
- [Decision Matrix](#decision-matrix)
- [Migration Considerations](#migration-considerations)
- [Performance Analysis](#performance-analysis)

---

## 🎯 Overview

Hệ thống có 2 approaches khác nhau cho file upload, mỗi approach phù hợp với use cases cụ thể.

### **Quick Comparison Table**

| Feature                   | CommentComposer (Legacy)  | AttachmentSection (Modern) |
| ------------------------- | ------------------------- | -------------------------- |
| **Use Case**              | Inline comment uploads    | Document management        |
| **Upload Location**       | Inside comment box        | Separate section           |
| **File Path**             | `uploads/congviec/`       | `uploads/attachments/`     |
| **Atomic Operations**     | ✅ Comment+files together | ❌ Separate uploads        |
| **Drag & Drop**           | ✅ Into textarea          | ✅ Into dropzone           |
| **Paste (Ctrl+V)**        | ✅ Yes                    | ❌ No                      |
| **Preview Before Upload** | ✅ Thumbnails             | ❌ Upload first            |
| **File Type Icons**       | Material-UI icons         | Emoji icons                |
| **Multiple Fields**       | ❌ Single attachment      | ✅ Multiple fields/entity  |
| **Reusability**           | Medium (need wrapper)     | High (plug & play)         |
| **API Pattern**           | Domain-specific           | Generic REST               |
| **Backend Code**          | Per-module controllers    | Single generic controller  |
| **Mobile UX**             | Excellent                 | Excellent                  |
| **Production Status**     | ✅ Stable                 | ✅ Ready                   |

---

## 🔍 Detailed Comparison

### **1. Upload UX**

#### **CommentComposer (Inline)**

```
┌─────────────────────────────────────────────┐
│ ┌─────────────────────────────────────────┐ │
│ │ Nhập bình luận...                       │ │ ← Type here
│ │                                         │ │
│ │ [Drag file here or Ctrl+V]             │ │ ← Instant action
│ └─────────────────────────────────────────┘ │
│                                             │
│ Files: 🖼️ img.png [×]  📄 doc.pdf [×]    │ ← Preview
│                                             │
│ [📎 Chọn file]              [🚀 Gửi]      │
└─────────────────────────────────────────────┘
```

**Pros:**

- ⚡ **Fast**: Upload ngay tại vị trí nhập
- 👍 **Intuitive**: Natural flow - type → attach → send
- 📋 **Paste support**: Screenshot → Ctrl+V → done
- 👁️ **Preview**: See thumbnails before sending

**Cons:**

- 🔒 **Locked to comments**: Không dùng được cho file general
- 🔁 **No undo**: Send = final (phải delete sau)

---

#### **AttachmentSection (Dedicated)**

```
┌─────────────────────────────────────────────┐
│  📎 TÀI LIỆU ĐÍNH KÈM (3)                   │
│  [📤 Chọn tệp]                              │
├─────────────────────────────────────────────┤
│  ┌───────────────────────────────────────┐ │
│  │  🌩️ Kéo thả file vào đây             │ │ ← Dropzone
│  └───────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│  📄 baocao.pdf        [👁] [⬇] [🗑]        │ ← Actions
│  🖼️ chart.png         [👁] [⬇] [🗑]        │
│  📊 data.xlsx         [👁] [⬇] [🗑]        │
└─────────────────────────────────────────────┘
```

**Pros:**

- 📁 **Organized**: Dedicated file management area
- 🔄 **Flexible**: Upload/delete anytime
- 🔍 **Preview**: Built-in viewer for all file types
- 📥 **Download**: Easy download action

**Cons:**

- ⏱️ **Slower**: Separate step from main action
- ❌ **No paste**: Can't Ctrl+V screenshots
- 🎯 **Context switch**: Leave comment → go to attachment section

---

### **2. Data Model**

#### **Legacy System (CongViec)**

```javascript
// TepTin model - Domain-specific fields
{
  _id: "64abc...",
  TenFile: "1738001234-a8c3ef-baocao.pdf",
  TenGoc: "baocao.pdf",
  LoaiFile: "application/pdf",
  KichThuoc: 2400000,
  DuongDan: "congviec/64x/comments/64y/2026/01/...",

  // Domain-specific references
  CongViecID: "64x...",      // ← Task reference
  BinhLuanID: "64y...",      // ← Comment reference
  YeuCauID: null,            // ← Ticket reference (if applicable)

  NguoiTaiLenID: "64z...",
  MoTa: "",
  TrangThai: "ACTIVE",
  createdAt: "2026-01-27T..."
}
```

**Path Structure:**

```
uploads/
└── congviec/
    └── {congViecId}/
        ├── {yyyy}/{mm}/             ← Task-level files
        │   └── file.ext
        └── comments/
            └── {commentId}/         ← Comment files
                └── {yyyy}/{mm}/
                    └── file.ext
```

---

#### **Modern System (Generic Attachments)**

```javascript
// TepTin model - Generic fields
{
  _id: "64abc...",
  TenFile: "1738001234-a8c3ef-kehoach.pdf",
  TenGoc: "kehoach-tapsan-2026.pdf",
  LoaiFile: "application/pdf",
  KichThuoc: 2400000,
  DuongDan: "attachments/tapsan/64x/kehoach/2026/01/...",

  // Generic owner reference
  OwnerType: "TapSan",       // ← Any entity type
  OwnerID: "64x...",         // ← Entity ID
  OwnerField: "kehoach",     // ← Field name (flexible!)

  // Legacy fields still exist (for backward compat)
  CongViecID: null,
  BinhLuanID: null,
  YeuCauID: null,

  NguoiTaiLenID: "64z...",
  MoTa: "Kế hoạch tập san năm 2026",
  TrangThai: "ACTIVE",
  createdAt: "2026-01-27T..."
}
```

**Path Structure:**

```
uploads/
└── attachments/
    └── {ownerType}/          ← Dynamic entity type
        └── {ownerId}/        ← Entity ID
            └── {field}/      ← Field name (multiple fields!)
                └── {yyyy}/{mm}/
                    └── file.ext

Examples:
attachments/tapsan/64x/kehoach/2026/01/plan.pdf
attachments/tapsan/64x/file/2026/01/publication.pdf
attachments/hopdong/64y/file/2026/01/contract.docx
attachments/lopdaotao/64z/tailieu/2026/01/slides.pptx
```

---

### **3. API Patterns**

#### **Legacy API (Domain-specific)**

```javascript
// CongViec
POST   /api/workmanagement/congviec/:id/comments
POST   /api/workmanagement/congviec/:id/files
GET    /api/workmanagement/congviec/:id/files
DELETE /api/workmanagement/files/:id
GET    /api/workmanagement/files/:id/inline
GET    /api/workmanagement/files/:id/download

// YeuCau (duplicate pattern!)
POST   /api/workmanagement/yeucau/:id/comments
POST   /api/workmanagement/yeucau/:id/files
GET    /api/workmanagement/yeucau/:id/files
DELETE /api/workmanagement/files/:id  // ← Shared endpoint
```

**Characteristics:**

- 🔒 **Tightly coupled** to domain entities
- 🔁 **Pattern duplication** for each module
- 🎯 **Specific logic** per entity type
- ⚠️ **More routes** to maintain

---

#### **Modern API (Generic REST)**

```javascript
// Single API for ALL entities
POST   /api/attachments/:ownerType/:ownerId/:field/files
GET    /api/attachments/:ownerType/:ownerId/:field/files
GET    /api/attachments/:ownerType/:ownerId/:field/files/count
DELETE /api/attachments/files/:id
GET    /api/attachments/files/:id/inline
GET    /api/attachments/files/:id/download
PATCH  /api/attachments/files/:id
POST   /api/attachments/batch-count
POST   /api/attachments/batch-preview

// Works for ANY entity:
POST /api/attachments/TapSan/64x/kehoach/files
POST /api/attachments/HopDong/64y/file/files
POST /api/attachments/LopDaoTao/64z/tailieu/files
```

**Characteristics:**

- 🔓 **Loosely coupled** - no entity-specific logic
- ♻️ **Zero duplication** - one controller for all
- 🎯 **REST-compliant** - predictable URL structure
- ✅ **Less maintenance** - single codebase

---

### **4. Frontend Integration**

#### **Legacy (CommentComposer)**

```javascript
// Need state management for pending files
const [newComment, setNewComment] = useState("");
const [pendingFiles, setPendingFiles] = useState([]);
const [dragActive, setDragActive] = useState(false);

// Complex submission
const handleSubmit = async () => {
  const form = new FormData();
  form.append("noiDung", newComment);
  pendingFiles.forEach((f) => form.append("files", f));

  await apiService.post(`/workmanagement/congviec/${id}/comments`, form);

  // Reset state
  setNewComment("");
  setPendingFiles([]);
};

// Use component
<CommentComposer
  newComment={newComment}
  setNewComment={setNewComment}
  pendingFiles={pendingFiles}
  setPendingFiles={setPendingFiles}
  dragCommentActive={dragActive}
  setDragCommentActive={setDragActive}
  onSubmit={handleSubmit}
/>;
```

**Lines of Code**: ~50-80 lines for integration

---

#### **Modern (AttachmentSection)**

```javascript
// Minimal integration - component handles everything!
<AttachmentSection
  ownerType="HopDong"
  ownerId={hopDongId}
  field="file"
  title="Tài liệu hợp đồng"
  allowedTypes={["application/pdf", ".docx"]}
  maxSizeMB={50}
  canDelete={user?.isAdmin}
/>
```

**Lines of Code**: ~10 lines for integration  
**Reduction**: 75-87% less code!

---

### **5. Backend Implementation**

#### **Legacy Backend**

```javascript
// Separate controller per module
// giaobanbv-be/modules/workmanagement/controllers/file.controller.js
controller.createCommentWithFiles = catchAsync(async (req, res) => {
  const { congViecId } = req.params;
  const { noiDung, parentId } = req.body;
  const files = req.files || [];

  // CongViec-specific logic
  const result = await fileService.createCommentWithFiles(
    congViecId,
    noiDung,
    files,
    req,
    parentId,
  );

  return sendResponse(res, 200, true, result, null, "Success");
});

// Need similar controller for YeuCau, Ticket, etc.
// = Code duplication!
```

---

#### **Modern Backend**

```javascript
// Single generic controller
// giaobanbv-be/controllers/attachments.controller.js
controller.upload = catchAsync(async (req, res) => {
  const { ownerType, ownerId, field = "file" } = req.params;
  const files = req.files || [];
  const { moTa } = req.body;

  // Generic logic - works for ANY entity
  const results = await attachmentsService.upload(
    ownerType,
    ownerId,
    field,
    files,
    req.nhanVienId,
    { moTa },
  );

  return sendResponse(res, 200, true, results, null, "Success");
});

// No need for module-specific controllers!
// Works automatically for new entities
```

---

## 🎯 Decision Matrix

### **When to use CommentComposer (Legacy)**

✅ **Use Legacy if:**

| Requirement              | Why Legacy?                    |
| ------------------------ | ------------------------------ |
| Inline comment uploads   | Built for this exact use case  |
| Atomic comment+files     | Single transaction, no orphans |
| Paste screenshots needed | Ctrl+V support built-in        |
| Preview before send      | Thumbnail preview included     |
| Threading/replies        | Integrated with comment system |
| Existing CongViec/YeuCau | Already implemented            |

**Example Use Cases:**

- Task comments với file attachments
- Ticket discussions với screenshots
- Code review comments với patches
- Bug reports với error screenshots

---

### **When to use AttachmentSection (Modern)**

✅ **Use Modern if:**

| Requirement               | Why Modern?                  |
| ------------------------- | ---------------------------- |
| Document management       | Designed for this            |
| Multiple attachment types | Multiple fields per entity   |
| File library/repository   | Organized file management    |
| Upload/delete flexibility | Independent of other actions |
| New feature development   | Zero backend code needed     |
| Cross-module consistency  | Same UX everywhere           |

**Example Use Cases:**

- Contract documents (HopDong)
- Training materials (LopDaoTao)
- Publication files (TapSan)
- Medical records
- Policy documents
- Report attachments

---

### **Decision Flowchart**

```
New feature needs file upload?
│
├─ Is it for COMMENTS/INLINE upload?
│  │
│  ├─ YES
│  │  │
│  │  └─ Need paste support (Ctrl+V)?
│  │     │
│  │     ├─ YES → Use CommentComposer ✅
│  │     │        (Legacy system)
│  │     │
│  │     └─ NO → Either system works
│  │              → Prefer Modern for new features ⭐
│  │
│  └─ NO (Document management)
│     │
│     └─ Use AttachmentSection ✅
│              (Modern system)
│
└─ Special case: Images only + need CDN?
   │
   └─ Use ImageUploader + Cloudinary
      (BaoCaoNgay pattern)
```

---

## 📊 Performance Analysis

### **Upload Performance**

| Metric                 | Legacy (CommentComposer)        | Modern (AttachmentSection) |
| ---------------------- | ------------------------------- | -------------------------- |
| **Request count**      | 1 (atomic)                      | 1 per file batch           |
| **Payload size**       | Comment + files                 | Files only                 |
| **Server processing**  | Create comment + save files     | Save files only            |
| **Client memory**      | Holds files in state pre-upload | Direct upload              |
| **Preview generation** | Client-side (blob URLs)         | Server-side (on demand)    |
| **Network efficiency** | ✅ Single request               | ✅ Single request          |

**Verdict**: Tương đương performance cho typical use cases.

---

### **Bundle Size Impact**

```javascript
// Legacy components (CongViec)
CommentComposer.js:    ~8 KB (minified)
CommentsList.js:      ~12 KB (minified)
ReplyInput.js:         ~4 KB (minified)
Total:                ~24 KB

// Modern component
AttachmentSection.jsx: ~15 KB (minified)

// If using both systems
Total bundle impact:   ~39 KB (acceptable)
```

**Code splitting**: Both components are lazy-loadable.

---

### **Runtime Performance**

#### **Legacy (CommentComposer)**

```
Upload 3 files (2MB + 1.5MB + 800KB):
1. User selects files:           ~10ms (file picker)
2. Generate thumbnails:           ~50ms (canvas operations)
3. Create FormData:               ~5ms
4. Upload request:                ~2000ms (network)
5. Backend processing:            ~150ms (save + DB)
6. Response parse:                ~10ms
7. State update + re-render:      ~20ms
-------------------------------------------
Total:                            ~2245ms ✅
```

#### **Modern (AttachmentSection)**

```
Upload 3 files (2MB + 1.5MB + 800KB):
1. User selects files:           ~10ms (file picker)
2. Validation:                    ~5ms
3. Create FormData:               ~5ms
4. Upload request:                ~2000ms (network)
5. Backend processing:            ~150ms (save + DB)
6. Refresh file list:             ~50ms (API call)
7. State update + re-render:      ~20ms
-------------------------------------------
Total:                            ~2240ms ✅
```

**Verdict**: Negligible difference (~5ms).

---

## 🔄 Migration Considerations

### **Can We Migrate Legacy to Modern?**

**Theoretical Migration Path:**

```
CongViec comments (Legacy)
          ↓
[Break atomic operation]
          ↓
Separate:
  • Comment creation (no files)
  • File upload via AttachmentSection
```

**Challenges:**

❌ **Loss of atomic operations**

```javascript
// Legacy: Atomic
createCommentWithFiles(...)  // All or nothing

// Modern: Two-step (risk of partial failure)
Step 1: createComment(...)   // ✅ Success
Step 2: uploadFiles(...)     // ❌ Network error
Result: Comment without files (inconsistent!)
```

❌ **UX degradation**

- Lose paste support (Ctrl+V)
- Lose inline preview
- Extra clicks required
- User confusion

❌ **Backend changes**

- Rewrite comment creation logic
- Update file linkage (BinhLuanID → OwnerType/ID)
- Migrate existing data (risky!)

❌ **Breaking changes**

- Mobile apps need updates
- API contracts broken
- User retraining needed

---

### **Migration Cost-Benefit Analysis**

| Factor               | Cost                      | Benefit               |
| -------------------- | ------------------------- | --------------------- |
| **Development time** | 2-3 weeks                 | Unified codebase      |
| **Risk**             | High (breaking changes)   | Low (both work fine)  |
| **User impact**      | Negative (UX degradation) | None                  |
| **Maintenance**      | Lower (one less system)   | Minimal (both stable) |
| **Business value**   | Low                       | Low                   |

**Recommendation**: **DON'T migrate**. Cost >> Benefit.

---

### **Coexistence Strategy**

**Current approach is optimal:**

```
┌─────────────────────────────────────────────────────┐
│  Maintain both systems in parallel                  │
├─────────────────────────────────────────────────────┤
│  • Legacy: Comments (CongViec, YeuCau)              │
│  • Modern: Documents (TapSan, LopDaoTao, new)      │
│  • Documentation: Clear guidelines (this guide!)    │
│  • Training: Developers know when to use which     │
└─────────────────────────────────────────────────────┘
```

**Benefits:**

- ✅ Zero breaking changes
- ✅ Optimal UX for each use case
- ✅ Flexibility for future features
- ✅ Incremental improvements possible

---

## 🎓 Learning Curve

### **For Developers**

#### **Using Legacy (CommentComposer)**

```
Learning Curve: Medium

Steps:
1. Understand props (6 state vars)          ⏱️ 15 min
2. Learn file state management              ⏱️ 20 min
3. Implement submit handler                 ⏱️ 15 min
4. Test drag/drop/paste                     ⏱️ 30 min
---------------------------------------------------
Total:                                      ~80 min
```

#### **Using Modern (AttachmentSection)**

```
Learning Curve: Easy

Steps:
1. Read props documentation                 ⏱️ 10 min
2. Copy-paste example                       ⏱️ 5 min
3. Test upload/download/delete              ⏱️ 15 min
---------------------------------------------------
Total:                                      ~30 min
```

**Time saved**: 50 minutes per developer!

---

## 🔗 Related

- [Overview](./00_OVERVIEW.md)
- [AttachmentSection Details](./01_ATTACHMENT_SECTION.md)
- [Comment File Upload](./02_COMMENT_FILE_UPLOAD.md)
- [Integration Guide](./05_INTEGRATION_GUIDE.md)

---

**Last Updated**: January 27, 2026  
**Version**: 1.0.0
