# BACKEND ARCHITECTURE - SERVER-SIDE DETAILS

## 📋 Mục lục

- [Overview](#overview)
- [Multer Configuration](#multer-configuration)
- [File Storage](#file-storage)
- [Database Models](#database-models)
- [Services Layer](#services-layer)
- [Security](#security)

---

## 🎯 Overview

Backend file upload system sử dụng **Multer middleware** với các tính năng bảo mật và validation đầy đủ.

### **Architecture Layers**

```
┌─────────────────────────────────────────────────────────┐
│                     API ROUTES                          │
│  • /api/attachments/* (Generic)                        │
│  • /api/workmanagement/congviec/* (Legacy)             │
│  • /api/workmanagement/yeucau/* (Legacy)               │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  AUTHENTICATION                         │
│  • JWT token validation                                 │
│  • User/NhanVien extraction                            │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  MULTER MIDDLEWARE                      │
│  • File size validation                                 │
│  • MIME type filtering                                  │
│  • Disk storage configuration                           │
│  • UTF-8 filename handling                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│               MAGIC NUMBER VERIFICATION                 │
│  • file-type library                                    │
│  • Actual file content validation                       │
│  • Total upload size check                              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                       │
│  • Request validation                                   │
│  • Business logic orchestration                         │
│  • Response formatting                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                         │
│  • File metadata creation                               │
│  • Database operations                                  │
│  • DTO mapping                                          │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  DATABASE (MongoDB)                     │
│  • TepTin collection                                    │
│  • Indexes for fast queries                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   FILE SYSTEM                           │
│  • uploads/ directory                                   │
│  • Organized folder structure                           │
└─────────────────────────────────────────────────────────┘
```

---

## 🔧 Multer Configuration

### **Main Configuration File**

📁 `giaobanbv-be/modules/workmanagement/helpers/uploadConfig.js`

```javascript
const path = require("path");

const MB = 1024 * 1024;

// Upload root từ environment hoặc default
const uploadRoot =
  process.env.WM_UPLOAD_ROOT ||
  process.env.UPLOAD_DIR ||
  path.join(process.cwd(), "uploads");

const config = {
  // Root directory
  UPLOAD_DIR: uploadRoot,
  UPLOAD_ROOT: uploadRoot,

  // File size limits
  MAX_FILE_SIZE:
    (parseInt(process.env.MAX_FILE_SIZE_MB || "50", 10) || 50) * MB,
  MAX_TOTAL_UPLOAD:
    (parseInt(process.env.MAX_TOTAL_UPLOAD_MB || "200", 10) || 200) * MB,

  // Allowed MIME types
  ALLOWED_MIME: (
    process.env.ALLOWED_MIME ||
    "image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,text/plain"
  )
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),

  // Features
  ENABLE_IMAGE_THUMBNAIL:
    String(process.env.ENABLE_IMAGE_THUMBNAIL || "true").toLowerCase() ===
    "true",
};

// Utility: resolve relative path to absolute
function toAbs(relOrAbs) {
  const root = path.resolve(config.UPLOAD_ROOT);
  if (!relOrAbs) return root;
  if (path.isAbsolute(relOrAbs)) return relOrAbs;

  const abs = path.resolve(root, relOrAbs);

  // Security: prevent path traversal
  if (!abs.startsWith(root)) {
    throw new Error("Invalid file path");
  }

  return abs;
}

module.exports = { ...config, toAbs };
```

### **Environment Variables**

```bash
# .env

# Upload directory (absolute or relative path)
WM_UPLOAD_ROOT=D:/hospital_uploads
# or
UPLOAD_DIR=uploads/

# Size limits (in MB)
MAX_FILE_SIZE_MB=50
MAX_TOTAL_UPLOAD_MB=200

# Allowed file types
ALLOWED_MIME=image/*,application/pdf,.docx,.xlsx

# Image thumbnails
ENABLE_IMAGE_THUMBNAIL=true
```

---

## 📦 Multer Middleware

📁 `giaobanbv-be/modules/workmanagement/middlewares/upload.middleware.js`

### **UTF-8 Filename Decoder**

```javascript
// Handles Vietnamese characters in filenames
function decodeOriginalNameToUtf8(name) {
  try {
    if (!name) return "file";

    // Decode latin1 → utf8
    const candidate = Buffer.from(name, "latin1").toString("utf8");

    // Heuristic: check for mojibake markers
    const hasMojibake = /Ã|Â|Ä|áº|á»|Â|Ê|Ô|Æ/.test(name);
    const looksVietnamese = /[À-ỹĐđ]/.test(candidate);

    if (hasMojibake && looksVietnamese) {
      return candidate;
    }

    // If candidate introduces � (replacement char), keep original
    if (candidate.includes("�")) {
      return name;
    }

    // Prefer more non-ASCII letters
    const countNonAscii = (s) => (s.match(/[^\x00-\x7F]/g) || []).length;
    if (countNonAscii(candidate) > countNonAscii(name)) {
      return candidate;
    }

    return name;
  } catch {
    return name;
  }
}
```

### **Storage Configuration**

```javascript
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const sanitize = require("sanitize-filename");
const fs = require("fs-extra");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      const now = new Date();
      const yyyy = String(now.getFullYear());
      const mm = String(now.getMonth() + 1).padStart(2, "0");

      const { ownerType, ownerId } = req.params || {};
      const field = req.params?.field || req.query?.field || req.body?.field;

      let dest;

      // Generic attachments path
      if (ownerType && ownerId) {
        dest = path.join(
          config.UPLOAD_DIR,
          "attachments",
          String(ownerType).toLowerCase(),
          String(ownerId),
          String(field || "default").toLowerCase(),
          yyyy,
          mm,
        );
      } else {
        // Legacy paths (CongViec/YeuCau)
        const congViecId =
          req.params.congViecId || req.params.id || req.body.CongViecID;
        const binhLuanId = req.params.binhLuanId || req.body.BinhLuanID || null;

        dest = path.join(
          config.UPLOAD_DIR,
          "congviec",
          String(congViecId),
          yyyy,
          mm,
        );

        if (binhLuanId) {
          dest = path.join(
            config.UPLOAD_DIR,
            "congviec",
            String(congViecId),
            "comments",
            String(binhLuanId),
            yyyy,
            mm,
          );
        }
      }

      // Ensure directory exists
      await fs.ensureDir(dest);
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },

  filename: async (req, file, cb) => {
    try {
      // Decode UTF-8
      const originalUtf8 = decodeOriginalNameToUtf8(
        file.originalname || "file",
      );
      file.originalnameUtf8 = originalUtf8;

      // Extract extension
      const ext = path.extname(originalUtf8) || "";
      const base = path.basename(originalUtf8, ext) || "file";

      // Generate unique prefix
      const unique = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;

      // Sanitize filename (remove dangerous chars, keep Unicode)
      const safeBase = (sanitize(base).trim() || "file")
        .slice(0, 160) // Max length
        .replace(/\s+/g, "-"); // Replace spaces with dashes

      const safeExt = sanitize(ext) || "";

      cb(null, `${unique}-${safeBase}${safeExt}`);
    } catch (err) {
      cb(err);
    }
  },
});
```

### **MIME Type Validation**

```javascript
function isMimeAllowed(mime) {
  return (
    config.ALLOWED_MIME.includes(mime) ||
    // Support wildcard: image/*
    (mime.startsWith("image/") && config.ALLOWED_MIME.includes("image/*"))
  );
}

const upload = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter: (req, file, cb) => {
    if (!isMimeAllowed(file.mimetype)) {
      return cb(new Error("Loại file không được phép"));
    }
    cb(null, true);
  },
});
```

### **Magic Number Verification**

```javascript
// Verify actual file content (not just extension)
async function verifyMagicAndTotalSize(req, res, next) {
  try {
    const files = req.files || [];

    // Check total upload size
    const totalSize = files.reduce((s, f) => s + (f.size || 0), 0);
    if (totalSize > config.MAX_TOTAL_UPLOAD) {
      return next(new Error("Tổng dung lượng vượt giới hạn"));
    }

    // Verify each file's magic number
    for (const f of files) {
      const fp = f.path;

      // Dynamic import for ESM-only module
      const { fileTypeFromFile } = await import("file-type");
      const detected = await fileTypeFromFile(fp);

      // If cannot detect, allow common office/pdf by extension
      // If detected, must be in allowed list
      if (detected && !isMimeAllowed(detected.mime)) {
        return next(new Error("File không đúng định dạng nội dung"));
      }
    }

    next();
  } catch (err) {
    next(err);
  }
}
```

### **Export Middleware**

```javascript
module.exports = {
  upload,
  verifyMagicAndTotalSize,
};
```

---

## 🗄️ File Storage

### **Directory Structure**

#### **Modern (Generic Attachments)**

```
uploads/
└── attachments/
    ├── tapsan/
    │   └── 64f3cb6035c717ab00d75b8b/
    │       ├── kehoach/
    │       │   └── 2026/
    │       │       └── 01/
    │       │           ├── 1738001234-a8c3ef-kehoach-tapsan-2026.pdf
    │       │           └── 1738002345-b9d4fa-phuong-an-san-xuat.docx
    │       └── file/
    │           └── 2026/
    │               └── 01/
    │                   └── 1738003456-c1e5fb-tap-san-so-1.pdf
    │
    ├── hopdong/
    │   └── 507f1f77bcf86cd799439011/
    │       └── file/
    │           └── 2026/
    │               └── 01/
    │                   └── 1738004567-d2f6ga-hop-dong-mua-sam.pdf
    │
    └── lopdaotao/
        └── 64a2bc1035c717ab00d12345/
            ├── tailieu/
            │   └── 2026/
            │       └── 01/
            │           └── 1738005678-e3g7hb-giao-trinh.pdf
            └── video/
                └── 2026/
                    └── 01/
                        └── 1738006789-f4h8ic-video-huong-dan.mp4
```

#### **Legacy (CongViec/YeuCau)**

```
uploads/
└── congviec/
    └── 64f3cb6035c717ab00d75b8b/
        ├── 2026/
        │   └── 01/
        │       ├── 1738001234-a8c3ef-bao-cao-tien-do.pdf
        │       └── 1738002345-b9d4fa-du-toan.xlsx
        │
        └── comments/
            ├── 64abc12035c717ab00d11111/
            │   └── 2026/
            │       └── 01/
            │           ├── 1738003456-c1e5fb-screenshot.png
            │           └── 1738004567-d2f6ga-phan-hoi.docx
            │
            └── 64abc34035c717ab00d22222/
                └── 2026/
                    └── 01/
                        └── 1738005678-e3g7hb-bieu-do.png
```

### **Filename Format**

```
{timestamp}-{randomId}-{originalName}.{ext}

Example:
1738001234-a8c3ef-báo-cáo-tiến-độ-dự-án.pdf

Components:
- 1738001234: Unix timestamp (milliseconds)
- a8c3ef: Random 6-char hex ID (collision prevention)
- báo-cáo-tiến-độ-dự-án: Sanitized original name (UTF-8 preserved!)
- .pdf: Original extension
```

### **Path Security**

```javascript
// Always validate paths to prevent traversal attacks
function toAbs(relOrAbs) {
  const root = path.resolve(config.UPLOAD_ROOT);
  if (!relOrAbs) return root;
  if (path.isAbsolute(relOrAbs)) return relOrAbs;

  const abs = path.resolve(root, relOrAbs);

  // CRITICAL: Ensure path is within root
  if (!abs.startsWith(root)) {
    throw new Error("Invalid file path");
  }

  return abs;
}
```

---

## 🗃️ Database Models

### **TepTin (File) Model**

📁 `giaobanbv-be/modules/workmanagement/models/TepTin.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const tepTinSchema = Schema(
  {
    // File metadata
    TenFile: { type: String, required: true }, // Unique filename on disk
    TenGoc: { type: String, required: true }, // Original filename
    LoaiFile: { type: String, required: true }, // MIME type
    KichThuoc: { type: Number, required: true }, // Size in bytes
    DuongDan: { type: String, required: true }, // Relative path

    // Generic owner linking (Modern)
    OwnerType: { type: String, index: true }, // "TapSan", "HopDong", etc.
    OwnerID: { type: String, index: true }, // Owner document ID
    OwnerField: { type: String, default: "file" }, // Field name

    // Legacy specific references
    CongViecID: { type: Schema.Types.ObjectId, ref: "CongViec", index: true },
    YeuCauID: { type: Schema.Types.ObjectId, ref: "YeuCau", index: true },
    BinhLuanID: { type: Schema.Types.ObjectId, ref: "BinhLuan", index: true },

    // Uploader info
    NguoiTaiLenID: {
      type: Schema.Types.ObjectId,
      ref: "NhanVien",
      required: true,
      index: true,
    },

    // Optional metadata
    MoTa: { type: String, default: "" },

    // Soft delete
    TrangThai: {
      type: String,
      enum: ["ACTIVE", "DELETED"],
      default: "ACTIVE",
      index: true,
    },

    NgayTaiLen: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: "teptin",
  },
);

// Compound indexes for fast queries
tepTinSchema.index({ CongViecID: 1, TrangThai: 1 });
tepTinSchema.index({ YeuCauID: 1, TrangThai: 1 });
tepTinSchema.index({ BinhLuanID: 1, TrangThai: 1 });
tepTinSchema.index({ OwnerType: 1, OwnerID: 1, OwnerField: 1, TrangThai: 1 });

// Virtual: Files property for BinhLuan
tepTinSchema.virtual("Files", {
  ref: "TepTin",
  localField: "_id",
  foreignField: "BinhLuanID",
});

module.exports = mongoose.model("TepTin", tepTinSchema);
```

### **Query Patterns**

```javascript
// Generic attachments query
const files = await TepTin.find({
  OwnerType: "TapSan",
  OwnerID: tapsanId,
  OwnerField: "kehoach",
  TrangThai: "ACTIVE",
}).populate("NguoiTaiLenID", "HoTen ChucDanh");

// Legacy CongViec query
const files = await TepTin.find({
  CongViecID: congViecId,
  TrangThai: "ACTIVE",
}).populate("NguoiTaiLenID");

// Comment files query
const files = await TepTin.find({
  BinhLuanID: commentId,
  TrangThai: "ACTIVE",
});
```

---

## 🔧 Services Layer

### **Generic Attachments Service**

📁 `giaobanbv-be/modules/workmanagement/services/attachments.service.js`

```javascript
const TepTin = require("../models/TepTin");
const { toObjectId } = require("../../helpers/utils");
const path = require("path");
const fs = require("fs-extra");

const service = {};

// Upload files
service.upload = async (
  ownerType,
  ownerId,
  field,
  files,
  nhanVienId,
  metadata = {},
) => {
  const { moTa = "" } = metadata;

  const tepTinRecords = files.map((file) => ({
    TenFile: file.filename,
    TenGoc: file.originalnameUtf8 || file.originalname,
    LoaiFile: file.mimetype,
    KichThuoc: file.size,
    DuongDan: path.relative(process.cwd(), file.path),

    // Generic linking
    OwnerType: ownerType,
    OwnerID: String(ownerId),
    OwnerField: field || "file",

    NguoiTaiLenID: toObjectId(nhanVienId),
    MoTa: moTa,
    TrangThai: "ACTIVE",
    NgayTaiLen: new Date(),
  }));

  const inserted = await TepTin.insertMany(tepTinRecords);

  // Return DTOs with URLs
  return inserted.map((file) => toDTO(file));
};

// List files
service.list = async (ownerType, ownerId, field) => {
  const files = await TepTin.find({
    OwnerType: ownerType,
    OwnerID: String(ownerId),
    OwnerField: field || "file",
    TrangThai: "ACTIVE",
  })
    .populate("NguoiTaiLenID", "HoTen ChucDanh")
    .sort({ createdAt: -1 });

  return { items: files.map(toDTO) };
};

// Count files
service.count = async (ownerType, ownerId, field) => {
  return await TepTin.countDocuments({
    OwnerType: ownerType,
    OwnerID: String(ownerId),
    OwnerField: field || "file",
    TrangThai: "ACTIVE",
  });
};

// Delete file (soft delete)
service.delete = async (fileId) => {
  const file = await TepTin.findById(fileId);
  if (!file) {
    throw new Error("File không tồn tại");
  }

  file.TrangThai = "DELETED";
  await file.save();

  return { message: "Đã xóa file" };
};

// Get file path
service.getFilePath = async (fileId) => {
  const file = await TepTin.findById(fileId);
  if (!file || file.TrangThai !== "ACTIVE") {
    throw new Error("File không tồn tại");
  }

  const fullPath = path.resolve(process.cwd(), file.DuongDan);

  // Security check
  const uploadRoot = path.resolve(process.cwd(), "uploads");
  if (!fullPath.startsWith(uploadRoot)) {
    throw new Error("Invalid file path");
  }

  return { file, fullPath };
};

// DTO mapper
function toDTO(file) {
  return {
    _id: file._id,
    TenGoc: file.TenGoc,
    TenFile: file.TenFile,
    LoaiFile: file.LoaiFile || file.MimeType,
    KichThuoc: file.KichThuoc,
    MoTa: file.MoTa,
    uploader: file.NguoiTaiLenID,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,

    // URLs for frontend
    inlineUrl: `/api/attachments/files/${file._id}/inline`,
    downloadUrl: `/api/attachments/files/${file._id}/download`,
  };
}

module.exports = service;
```

---

## 🔒 Security

### **1. Authentication**

```javascript
// All upload endpoints require authentication
router.post(
  "/attachments/:ownerType/:ownerId/:field/files",
  authentication.loginRequired, // ← JWT validation
  upload.array("files"),
  controller.upload,
);
```

### **2. Authorization (Optional)**

```javascript
// Example: Check ownership
const checkOwnership = catchAsync(async (req, res, next) => {
  const { ownerType, ownerId } = req.params;
  const userId = req.userId;

  // Example: Verify user owns the entity
  const entity = await models[ownerType].findById(ownerId);

  if (!entity) {
    throw new AppError(404, "Entity not found", "NOT_FOUND");
  }

  if (entity.NguoiTaoID.toString() !== userId && req.user.PhanQuyen < 3) {
    throw new AppError(403, "Không có quyền", "FORBIDDEN");
  }

  next();
});
```

### **3. File Type Validation (Multi-layer)**

```javascript
// Layer 1: Multer fileFilter (MIME type)
fileFilter: (req, file, cb) => {
  if (!isMimeAllowed(file.mimetype)) {
    return cb(new Error("Loại file không được phép"));
  }
  cb(null, true);
};

// Layer 2: Magic number verification (actual content)
const { fileTypeFromFile } = await import("file-type");
const detected = await fileTypeFromFile(filePath);

if (detected && !isMimeAllowed(detected.mime)) {
  throw new Error("File không đúng định dạng nội dung");
}
```

### **4. Path Traversal Prevention**

```javascript
// Always validate paths
function toAbs(relOrAbs) {
  const root = path.resolve(config.UPLOAD_ROOT);
  const abs = path.resolve(root, relOrAbs);

  if (!abs.startsWith(root)) {
    throw new Error("Invalid file path");
  }

  return abs;
}
```

### **5. Size Limits**

```javascript
// Per-file limit (Multer)
limits: {
  fileSize: 50 * 1024 * 1024; // 50MB
}

// Total upload limit (Custom middleware)
const totalSize = files.reduce((s, f) => s + f.size, 0);
if (totalSize > 200 * 1024 * 1024) {
  // 200MB
  throw new Error("Tổng dung lượng vượt giới hạn");
}
```

### **6. Filename Sanitization**

```javascript
const sanitize = require("sanitize-filename");

// Remove dangerous characters
const safeBase = sanitize(base).trim();

// Replace spaces
.replace(/\s+/g, "-");

// Limit length
.slice(0, 160);
```

### **7. Rate Limiting (Recommended)**

```javascript
const rateLimit = require("express-rate-limit");

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 uploads per window
  message: "Quá nhiều yêu cầu upload. Vui lòng thử lại sau.",
});

router.post(
  "/attachments/:ownerType/:ownerId/:field/files",
  uploadLimiter,
  authentication.loginRequired,
  upload.array("files"),
  controller.upload,
);
```

---

## 🔗 Related

- [Overview](./00_OVERVIEW.md)
- [API Reference](./08_API_REFERENCE.md)
- [Integration Guide](./05_INTEGRATION_GUIDE.md)

---

**Last Updated**: January 27, 2026  
**Version**: 1.0.0
