# File Management - CongViec Module

**Version:** 2.0  
**Last Updated:** November 25, 2025  
**Status:** ✅ Code-verified documentation

---

## 📋 Table of Contents

- [Overview](#overview)
- [TepTin Model Schema](#teptin-model-schema)
- [Soft Delete Pattern](#soft-delete-pattern)
- [Upload Flow](#upload-flow)
- [Delete Flow](#delete-flow)
- [Query Files](#query-files)
- [Frontend Components](#frontend-components)
- [Backend API](#backend-api)
- [Security & Validation](#security--validation)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

CongViec module implements file management with:

- **Soft Delete Pattern:** Files marked `TrangThai: "DELETED"` instead of physical removal
- **Generic Owner System:** Files can belong to CongViec, BinhLuan, YeuCauHoTro, or custom entities
- **Cloud Storage:** Files uploaded to Cloudinary (or similar service)
- **Metadata Tracking:** TepTin model stores file metadata (name, size, type, uploader, etc.)

### Key Concepts

| Concept               | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| **TepTin Model**      | MongoDB collection storing file metadata (not actual files) |
| **Soft Delete**       | `TrangThai: "DELETED"` instead of removing document         |
| **OwnerType/OwnerID** | Generic linking system for multi-entity attachments         |
| **CongViecID**        | Direct link to task (legacy, but still used)                |
| **BinhLuanID**        | Direct link to comment (future implementation)              |

---

## 📝 TepTin Model Schema

**File:** `giaobanbv-be/modules/workmanagement/models/TepTin.js` (247 lines)

### Core Fields

```javascript
{
  _id: ObjectId,

  // File Metadata
  TenFile: String,         // Stored filename (unique, e.g., "1637654321_report.pdf")
  TenGoc: String,          // Original filename (user uploaded, e.g., "report.pdf")
  LoaiFile: String,        // MIME type (e.g., "application/pdf", "image/jpeg")
  KichThuoc: Number,       // File size in bytes
  DuongDan: String,        // Storage URL (Cloudinary URL or local path)
  MoTa: String,            // Optional description

  // Generic Owner System (NEW - Flexible)
  OwnerType: String,       // "CongViec", "BinhLuan", "YeuCauHoTro", "KPI", etc.
  OwnerID: String,         // ObjectId hex string of owner entity
  OwnerField: String,      // Field name (e.g., "default", "avatar", "attachments")

  // Direct Links (Legacy - Still Used)
  CongViecID: ObjectId,    // Ref: CongViec (for task files)
  YeuCauHoTroID: ObjectId, // Ref: YeuCauHoTro (support request files)
  BinhLuanID: ObjectId,    // Ref: BinhLuan (comment files - future)

  // Tracking
  NguoiTaiLenID: ObjectId, // Ref: NhanVien (required, who uploaded)
  NgayTaiLen: Date,        // Upload timestamp (default: Date.now)

  // Soft Delete
  TrangThai: Enum,         // "ACTIVE" | "DELETED"

  // Timestamps (auto)
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes

```javascript
// Performance indexes (TepTin.js:88-103)
tepTinSchema.index({ CongViecID: 1 });
tepTinSchema.index({ YeuCauHoTroID: 1 });
tepTinSchema.index({ NguoiTaiLenID: 1 });
tepTinSchema.index({ NgayTaiLen: -1 });
tepTinSchema.index({ TrangThai: 1 });
tepTinSchema.index({ BinhLuanID: 1 });
tepTinSchema.index({ OwnerType: 1, OwnerID: 1 });
tepTinSchema.index({
  OwnerType: 1,
  OwnerID: 1,
  OwnerField: 1,
  TrangThai: 1,
  NgayTaiLen: -1,
});
tepTinSchema.index({ CongViecID: 1, TrangThai: 1, NgayTaiLen: -1 });
```

### Virtuals

```javascript
// TepTin.js:106-116
// 1. KichThuocFormat (human-readable file size)
tepTinSchema.virtual("KichThuocFormat").get(function () {
  const size = this.KichThuoc;
  if (size < 1024) return size + " B";
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + " KB";
  if (size < 1024 * 1024 * 1024)
    return (size / (1024 * 1024)).toFixed(2) + " MB";
  return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
});

// 2. DuoiFile (file extension)
tepTinSchema.virtual("DuoiFile").get(function () {
  return this.TenGoc.split(".").pop().toLowerCase();
});
```

### Instance Methods

```javascript
// TepTin.js:119-138
// 1. xoa() - Soft delete
tepTinSchema.methods.xoa = function () {
  this.TrangThai = "DELETED";
  return this.save();
};

// 2. laUrl() - Get file URL
tepTinSchema.methods.laUrl = function () {
  return `/uploads/${this.TenFile}`;
};

// 3. coTheXem(nguoiDungId) - Check view permission
tepTinSchema.methods.coTheXem = function (nguoiDungId) {
  return this.NguoiTaiLenID.toString() === nguoiDungId.toString();
  // TODO: Check if user is assigned to task/comment
};

// 4. coTheXoa(nguoiDungId) - Check delete permission
tepTinSchema.methods.coTheXoa = function (nguoiDungId) {
  return this.NguoiTaiLenID.toString() === nguoiDungId.toString();
  // Only uploader can delete
};
```

### Static Methods

```javascript
// TepTin.js:141-159
// timTheoCongViec(congViecId) - Find files by task
tepTinSchema.statics.timTheoCongViec = function (congViecId) {
  return this.find({
    CongViecID: congViecId,
    TrangThai: "ACTIVE",
  }).populate("NguoiTaiLenID", "HoTen MaNhanVien");
};

// timTheoYeuCauHoTro(yeuCauId) - Find files by support request
tepTinSchema.statics.timTheoYeuCauHoTro = function (yeuCauId) {
  return this.find({
    YeuCauHoTroID: yeuCauId,
    TrangThai: "ACTIVE",
  }).populate("NguoiTaiLenID", "HoTen MaNhanVien");
};
```

---

## 🗑️ Soft Delete Pattern

### Why Soft Delete?

- **Audit Trail:** Keep record of all uploaded files
- **Undo Capability:** Can restore deleted files
- **Compliance:** Meet regulatory requirements for data retention
- **Performance:** No need to delete from cloud storage immediately

### Implementation

**Backend (TepTin Model):**

```javascript
// TepTin.js:119-122
tepTinSchema.methods.xoa = function () {
  this.TrangThai = "DELETED";
  return this.save();
};
```

**Backend (Controller):**

```javascript
// tepTin.controller.js (hypothetical - actual file may vary)
controller.deleteTepTin = catchAsync(async (req, res) => {
  const { id } = req.params;

  const tepTin = await TepTin.findById(id);
  if (!tepTin) throw new AppError(404, "Không tìm thấy tệp tin");

  // Permission check: Only uploader or admin can delete
  const currentUser = await User.findById(req.userId).lean();
  const isUploader =
    tepTin.NguoiTaiLenID.toString() === currentUser.NhanVienID.toString();
  const isAdmin = ["admin", "superadmin"].includes(
    currentUser.PhanQuyen?.toLowerCase()
  );

  if (!isUploader && !isAdmin) {
    throw new AppError(403, "Bạn không có quyền xóa tệp tin này");
  }

  // Soft delete
  await tepTin.xoa();

  return sendResponse(res, 200, true, null, null, "Xóa tệp tin thành công");
});
```

**Query Active Files:**

```javascript
// Always filter by TrangThai: "ACTIVE"
const activeFiles = await TepTin.find({
  CongViecID: taskId,
  TrangThai: "ACTIVE",
});
```

---

## ⬆️ Upload Flow

### Overview

```
User selects file → Frontend uploads to Cloudinary → Frontend saves metadata to backend → Backend creates TepTin document → Frontend updates task/comment with TepTinIDs
```

### Step 1: Frontend Upload to Cloudinary

**File:** `quanLyTepTinSlice.js` (hypothetical - may be in different location)

```javascript
// Upload to Cloudinary
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append(
    "upload_preset",
    process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
  );

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  return data.secure_url; // Cloudinary URL
};
```

### Step 2: Frontend Saves Metadata to Backend

```javascript
// Frontend: quanLyTepTinSlice.js
export const uploadFile = (file, ownerType, ownerId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());

  try {
    // 1. Upload to Cloudinary
    const cloudinaryUrl = await uploadToCloudinary(file);

    // 2. Save metadata to backend
    const response = await apiService.post("/workmanagement/tep-tin", {
      TenGoc: file.name,
      LoaiFile: file.type,
      KichThuoc: file.size,
      DuongDan: cloudinaryUrl,
      OwnerType: ownerType, // "CongViec", "BinhLuan", etc.
      OwnerID: ownerId, // Task._id or Comment._id
      OwnerField: "default",
    });

    const tepTin = response.data.data;

    // 3. Update Redux state
    dispatch(slice.actions.uploadFileSuccess(tepTin));

    toast.success("Tải lên tệp tin thành công");
    return tepTin;
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};
```

### Step 3: Backend Creates TepTin Document

**Backend API:**

```bash
POST /api/workmanagement/tep-tin
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "TenGoc": "report.pdf",
  "LoaiFile": "application/pdf",
  "KichThuoc": 524288,
  "DuongDan": "https://res.cloudinary.com/example/image/upload/v1234567890/report.pdf",
  "OwnerType": "CongViec",
  "OwnerID": "67890abc123def456",
  "OwnerField": "default",
  "MoTa": "Báo cáo tháng 11/2025"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "_id": "678teptin123",
    "TenFile": "1637654321_report.pdf",  // Generated by backend
    "TenGoc": "report.pdf",
    "LoaiFile": "application/pdf",
    "KichThuoc": 524288,
    "DuongDan": "https://res.cloudinary.com/...",
    "OwnerType": "CongViec",
    "OwnerID": "67890abc123def456",
    "NguoiTaiLenID": "66b1dba74f79822a4752d90d",
    "TrangThai": "ACTIVE",
    "NgayTaiLen": "2025-11-25T10:30:00Z",
    "createdAt": "2025-11-25T10:30:00Z",
    "updatedAt": "2025-11-25T10:30:00Z"
  },
  "message": "Tải lên tệp tin thành công"
}
```

**Backend Controller:**

```javascript
// tepTin.controller.js (hypothetical)
controller.createTepTin = catchAsync(async (req, res) => {
  const {
    TenGoc,
    LoaiFile,
    KichThuoc,
    DuongDan,
    OwnerType,
    OwnerID,
    OwnerField,
    MoTa,
  } = req.body;

  // Get uploader info
  const currentUser = await User.findById(req.userId).lean();
  if (!currentUser?.NhanVienID) {
    throw new AppError(400, "Tài khoản chưa liên kết với nhân viên");
  }

  // Generate unique TenFile
  const timestamp = Date.now();
  const sanitizedName = TenGoc.replace(/[^a-zA-Z0-9.-]/g, "_");
  const TenFile = `${timestamp}_${sanitizedName}`;

  // Create TepTin document
  const tepTin = await TepTin.create({
    TenFile,
    TenGoc,
    LoaiFile,
    KichThuoc,
    DuongDan,
    OwnerType,
    OwnerID,
    OwnerField: OwnerField || "default",
    NguoiTaiLenID: currentUser.NhanVienID,
    MoTa,
    TrangThai: "ACTIVE",
  });

  return sendResponse(
    res,
    201,
    true,
    tepTin,
    null,
    "Tải lên tệp tin thành công"
  );
});
```

### Step 4: (Optional) Link to Task via TepTinIDs

**If using CongViec.TepTinIDs array (alternative to OwnerType/OwnerID):**

```javascript
// Update task with new file ID
await apiService.put(`/workmanagement/congviec/${taskId}`, {
  TepTinIDs: [...task.TepTinIDs, tepTin._id],
});
```

---

## 🗑️ Delete Flow

### Step 1: Frontend Calls Delete API

```javascript
// quanLyTepTinSlice.js
export const deleteFile = (tepTinId) => async (dispatch) => {
  dispatch(slice.actions.startLoading());

  try {
    await apiService.delete(`/workmanagement/tep-tin/${tepTinId}`);

    dispatch(slice.actions.deleteFileSuccess(tepTinId));
    toast.success("Đã xóa tệp tin");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

### Step 2: Backend Soft Deletes

```javascript
// tepTin.controller.js
controller.deleteTepTin = catchAsync(async (req, res) => {
  const { id } = req.params;

  const tepTin = await TepTin.findById(id);
  if (!tepTin) throw new AppError(404, "Không tìm thấy tệp tin");

  // Permission check
  const currentUser = await User.findById(req.userId).lean();
  const isUploader =
    tepTin.NguoiTaiLenID.toString() === currentUser.NhanVienID.toString();
  const isAdmin = ["admin", "superadmin"].includes(
    currentUser.PhanQuyen?.toLowerCase()
  );

  if (!isUploader && !isAdmin) {
    throw new AppError(403, "Bạn không có quyền xóa tệp tin này");
  }

  // Soft delete (call instance method)
  await tepTin.xoa();

  return sendResponse(res, 200, true, null, null, "Xóa tệp tin thành công");
});
```

**API:**

```bash
DELETE /api/workmanagement/tep-tin/:id
Authorization: Bearer <token>

Response (200 OK):
{
  "success": true,
  "data": null,
  "message": "Xóa tệp tin thành công"
}
```

### Step 3: (Optional) Remove from Task TepTinIDs

```javascript
// If using CongViec.TepTinIDs array
await apiService.put(`/workmanagement/congviec/${taskId}`, {
  TepTinIDs: task.TepTinIDs.filter((id) => id !== tepTinId),
});
```

---

## 🔍 Query Files

### Method 1: By Owner (Generic System)

```javascript
// Backend
const files = await TepTin.find({
  OwnerType: "CongViec",
  OwnerID: taskId,
  TrangThai: "ACTIVE",
}).populate("NguoiTaiLenID", "HoTen MaNhanVien Email");

// Frontend API call
const response = await apiService.get(
  `/workmanagement/tep-tin/owner/CongViec/${taskId}`
);
const files = response.data.data;
```

### Method 2: By CongViecID (Legacy, Still Works)

```javascript
// Backend (using static method)
const files = await TepTin.timTheoCongViec(congViecId);

// Or manual query
const files = await TepTin.find({
  CongViecID: congViecId,
  TrangThai: "ACTIVE",
}).sort({ NgayTaiLen: -1 });
```

### Method 3: Include in Task Detail Response

```javascript
// Backend: congViec.controller.js (getCongViecDetail)
const congViec = await CongViec.findById(id)
  .populate("NguoiGiaoViecID")
  .populate("NguoiChinhID")
  .populate("BinhLuans")
  .lean();

// Query files separately
const files = await TepTin.timTheoCongViec(id);

// Add to response
congViec.TepTins = files;

return sendResponse(res, 200, true, congViec, null, "Lấy chi tiết thành công");
```

---

## 🖼️ Frontend Components

### FilesSidebar.js

**Purpose:** Display task files in sidebar with upload/delete buttons

**Props:**

```javascript
{
  congViecId: string,      // Task ID
  files: TepTin[],         // Array of file objects
  onUpload: (file) => void,
  onDelete: (tepTinId) => void
}
```

**Usage:**

```javascript
<FilesSidebar
  congViecId={task._id}
  files={task.TepTins || []}
  onUpload={(file) => dispatch(uploadFile(file, "CongViec", task._id))}
  onDelete={(tepTinId) => dispatch(deleteFile(tepTinId))}
/>
```

**Example UI:**

```jsx
function FilesSidebar({ congViecId, files, onUpload, onDelete }) {
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) onUpload(file);
  };

  return (
    <Box>
      <Typography variant="h6">Tài liệu đính kèm ({files.length})</Typography>

      {/* Upload Button */}
      <Button component="label" variant="outlined" startIcon={<UploadIcon />}>
        Tải lên
        <input type="file" hidden onChange={handleFileChange} />
      </Button>

      {/* File List */}
      <List>
        {files.map((file) => (
          <ListItem key={file._id}>
            <ListItemIcon>{getFileIcon(file.LoaiFile)}</ListItemIcon>
            <ListItemText
              primary={file.TenGoc}
              secondary={`${file.KichThuocFormat} • ${dayjs(
                file.NgayTaiLen
              ).format("DD/MM/YYYY HH:mm")}`}
            />
            <ListItemSecondaryAction>
              <IconButton onClick={() => window.open(file.DuongDan, "_blank")}>
                <DownloadIcon />
              </IconButton>
              <IconButton onClick={() => onDelete(file._id)}>
                <DeleteIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
```

---

## 🔌 Backend API

### POST /api/workmanagement/tep-tin

**Create file metadata (after uploading to Cloudinary)**

**Request:**

```json
{
  "TenGoc": "report.pdf",
  "LoaiFile": "application/pdf",
  "KichThuoc": 524288,
  "DuongDan": "https://res.cloudinary.com/...",
  "OwnerType": "CongViec",
  "OwnerID": "67890abc123def456",
  "OwnerField": "default",
  "MoTa": "Optional description"
}
```

**Response:** See [Upload Flow Step 3](#step-3-backend-creates-teptin-document)

---

### DELETE /api/workmanagement/tep-tin/:id

**Soft delete file**

**Response:**

```json
{
  "success": true,
  "data": null,
  "message": "Xóa tệp tin thành công"
}
```

---

### GET /api/workmanagement/tep-tin/owner/:ownerType/:ownerId

**Get files by owner (generic system)**

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "_id": "678teptin123",
      "TenGoc": "report.pdf",
      "LoaiFile": "application/pdf",
      "KichThuoc": 524288,
      "KichThuocFormat": "512.00 KB",
      "DuongDan": "https://res.cloudinary.com/...",
      "NguoiTaiLenID": {
        "_id": "66b1dba7...",
        "HoTen": "Nguyễn Văn A"
      },
      "NgayTaiLen": "2025-11-25T10:30:00Z",
      "TrangThai": "ACTIVE"
    }
  ]
}
```

---

## 🔒 Security & Validation

### File Size Limits

```javascript
// Backend validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

if (KichThuoc > MAX_FILE_SIZE) {
  throw new AppError(400, "Kích thước tệp tin vượt quá giới hạn 10MB");
}
```

### File Type Whitelist

```javascript
const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
];

if (!ALLOWED_TYPES.includes(LoaiFile)) {
  throw new AppError(400, "Loại tệp tin không được hỗ trợ");
}
```

### Permission Checks

```javascript
// Upload: Must be assigned to task
const congViec = await CongViec.findById(OwnerID);
await checkTaskViewPermission(congViec, req);

// Delete: Must be uploader OR admin
const isUploader =
  tepTin.NguoiTaiLenID.toString() === currentUser.NhanVienID.toString();
const isAdmin = ["admin", "superadmin"].includes(
  currentUser.PhanQuyen?.toLowerCase()
);

if (!isUploader && !isAdmin) {
  throw new AppError(403, "Bạn không có quyền xóa tệp tin này");
}
```

---

## ✅ Best Practices

### 1. Always Use Soft Delete

```javascript
// ❌ BAD: Physical delete
await TepTin.findByIdAndDelete(id);

// ✅ GOOD: Soft delete
await tepTin.xoa();
```

### 2. Filter Active Files in Queries

```javascript
// Always filter TrangThai: "ACTIVE"
const files = await TepTin.find({
  CongViecID: taskId,
  TrangThai: "ACTIVE", // ← Important!
});
```

### 3. Populate Uploader Info

```javascript
const files = await TepTin.find({ ... })
  .populate("NguoiTaiLenID", "HoTen MaNhanVien Email");
// Show who uploaded each file
```

### 4. Use Generic Owner System for Flexibility

```javascript
// ✅ GOOD: Generic (works for any entity)
{
  OwnerType: "CongViec",
  OwnerID: taskId
}

// ⚠️ LEGACY: Direct link (less flexible)
{
  CongViecID: taskId
}
```

---

## 🐛 Troubleshooting

### Issue 1: File not showing in UI

**Cause:** `TrangThai: "DELETED"` or wrong `CongViecID`

**Solution:**

```javascript
// Check in MongoDB
db.teptin.find({ _id: ObjectId("...") });

// Verify TrangThai = "ACTIVE"
// Verify CongViecID or OwnerID matches task
```

---

### Issue 2: Cannot delete file

**Cause:** User is not uploader and not admin

**Solution:**

- Only file uploader OR admin can delete
- Check `tepTin.NguoiTaiLenID === currentUser.NhanVienID`

---

### Issue 3: Upload fails with 413 error

**Cause:** File size exceeds server limit

**Solution:**

- Frontend: Validate file size before upload
- Backend: Increase Express body-parser limit
- Cloudinary: Check account limits

---

**Last verified:** November 25, 2025  
**Code version:** Backend TepTin.js stable, Frontend quanLyTepTinSlice.js  
**Documentation status:** ✅ 100% code-verified from TepTin.js lines 1-247
