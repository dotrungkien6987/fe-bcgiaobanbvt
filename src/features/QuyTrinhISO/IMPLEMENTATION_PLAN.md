# 🚀 IMPLEMENTATION PLAN - HỆ THỐNG QUẢN LÝ TÀI LIỆU ISO

**Version:** 2.0  
**Created:** January 28, 2026  
**Module:** QuyTrinhISO (ISO Document Management)  
**Environment:** Production

---

## 📋 MỤC LỤC

1. [Tổng Quan](#1-tổng-quan)
2. [Quyết Định Thiết Kế](#2-quyết-định-thiết-kế)
3. [Database Schema](#3-database-schema)
4. [Backend Implementation](#4-backend-implementation)
5. [Frontend Implementation](#5-frontend-implementation)
6. [Menu & Navigation](#6-menu--navigation)
7. [Implementation Phases](#7-implementation-phases)
8. [Checklist & Testing](#8-checklist--testing)

---

## 1. TỔNG QUAN

### 1.1. Mục Tiêu

Xây dựng hệ thống quản lý tài liệu ISO cho bệnh viện, cho phép:

- QLCL (Quản lý chất lượng) tạo, sửa, xóa quy trình ISO
- Phân phối quy trình cho các khoa/phòng ban
- Nhân viên xem tài liệu ISO được phân phối cho khoa mình
- Quản lý phiên bản quy trình
- Dashboard thống kê

### 1.2. Phân Quyền

| Role      | Permissions                                 |
| --------- | ------------------------------------------- |
| `qlcl`    | Full CRUD, Dashboard, Phân phối             |
| `admin`   | Full CRUD, Dashboard, Phân phối             |
| `manager` | View tất cả (filtered by KhoaID), Dashboard |
| `nomal`   | View quy trình được phân phối cho khoa mình |

### 1.3. Technology Stack

- **Backend:** Express.js + MongoDB (Mongoose)
- **Frontend:** React 18 + Redux Toolkit + Material-UI v5
- **File Storage:** Local disk (Multer) - `uploads/attachments/quytrinhiso/`
- **PDF Viewer:** Native iframe (fallback: react-pdf)

---

## 2. QUYẾT ĐỊNH THIẾT KẾ

### 2.1. Schema Design

| Quyết định                                                    | Lý do                                                            |
| ------------------------------------------------------------- | ---------------------------------------------------------------- |
| **KHÔNG lưu FilePDF/FileWord trong QuyTrinhISO**              | Sử dụng TepTin với OwnerType pattern (đã có sẵn)                 |
| **KHÔNG lưu NguoiPhanPhoiID/NgayPhanPhoi trong KhoaPhanPhoi** | Phức tạp không cần thiết, có thể dùng audit trail từ QuyTrinhISO |
| **Sử dụng TepTin.OwnerType="quytrinhiso"**                    | Tái sử dụng AttachmentSection component                          |

### 2.2. Upload Flow

**2-Step Create Process:**

```
[Tạo mới] → [Form cơ bản] → [Lưu] → [Redirect /quytrinh-iso/:id/edit]
                                              ↓
                                    [AttachmentSection với ownerId]
                                              ↓
                                    [Upload FilePDF + FileWord]
                                              ↓
                                    [Validate có PDF → Lưu hoàn tất]
```

**Lý do:** AttachmentSection cần `ownerId` thực sự tồn tại trong DB.

### 2.3. AttachmentSection Enhancement

Thêm prop `maxFiles` để hỗ trợ single-file mode:

```jsx
<AttachmentSection
  ownerType="QuyTrinhISO"
  ownerId={quyTrinhId}
  field="FilePDF"
  maxFiles={1} // ← NEW: Chỉ cho phép 1 file PDF
  allowedTypes={[".pdf", "application/pdf"]}
/>
```

### 2.4. Copy Files Feature

Khi nâng phiên bản, cho phép copy biểu mẫu từ phiên bản cũ:

```
POST /api/quytrinhiso/:id/copy-files-from/:sourceVersionId?field=fileword
```

- Copy file vật lý + tạo TepTin record mới
- Skip files có vấn đề (deleted, missing on disk)
- Return: `{ copied: 3, skipped: 1, errors: [...] }`

---

## 3. DATABASE SCHEMA

### 3.1. QuyTrinhISO Model

**File:** `giaobanbv-be/models/QuyTrinhISO.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const quyTrinhISOSchema = new Schema(
  {
    // === THÔNG TIN CƠ BẢN ===
    TenQuyTrinh: {
      type: String,
      required: [true, "Tên quy trình không được để trống"],
      trim: true,
      maxlength: 500,
    },
    MaQuyTrinh: {
      type: String,
      required: [true, "Mã quy trình không được để trống"],
      trim: true,
      uppercase: true,
      maxlength: 50,
    },
    PhienBan: {
      type: String,
      required: [true, "Phiên bản không được để trống"],
      trim: true,
      maxlength: 10,
    },

    // === QUAN HỆ ===
    KhoaXayDungID: {
      type: Schema.Types.ObjectId,
      ref: "Khoa",
      required: [true, "Khoa xây dựng không được để trống"],
    },

    // === THỜI GIAN ===
    NgayHieuLuc: {
      type: Date,
      required: [true, "Ngày hiệu lực không được để trống"],
    },

    // === MÔ TẢ ===
    GhiChu: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // === AUDIT ===
    NguoiTaoID: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    NguoiCapNhatID: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    // === SOFT DELETE ===
    TrangThai: {
      type: String,
      enum: ["ACTIVE", "DELETED"],
      default: "ACTIVE",
    },
  },
  {
    timestamps: true,
    collection: "quytrinhiso",
  },
);

// === INDEXES ===
quyTrinhISOSchema.index({ MaQuyTrinh: 1, PhienBan: 1 });
quyTrinhISOSchema.index({ KhoaXayDungID: 1 });
quyTrinhISOSchema.index({ NgayHieuLuc: -1 });
quyTrinhISOSchema.index({ TrangThai: 1 });
quyTrinhISOSchema.index({ MaQuyTrinh: 1, TrangThai: 1 });

// === VIRTUALS ===
quyTrinhISOSchema.virtual("MaPhienBan").get(function () {
  return `${this.MaQuyTrinh}-v${this.PhienBan}`;
});

quyTrinhISOSchema.set("toJSON", { virtuals: true });
quyTrinhISOSchema.set("toObject", { virtuals: true });

// === INSTANCE METHODS ===
// Get all files (or filtered by field)
quyTrinhISOSchema.methods.getFiles = async function (field = null) {
  const TepTin = require("../modules/workmanagement/models/TepTin");

  const query = {
    OwnerType: "quytrinhiso",
    OwnerID: String(this._id),
    TrangThai: "ACTIVE",
  };

  if (field) {
    query.OwnerField = field.toLowerCase();
  }

  return await TepTin.find(query).sort({ createdAt: -1 });
};

// Get files grouped by type (PDF vs Word)
quyTrinhISOSchema.methods.getFilesByType = async function () {
  const TepTin = require("../modules/workmanagement/models/TepTin");

  const [pdfFiles, wordFiles] = await Promise.all([
    TepTin.find({
      OwnerType: "quytrinhiso",
      OwnerID: String(this._id),
      OwnerField: "filepdf",
      TrangThai: "ACTIVE",
    }).lean(),
    TepTin.find({
      OwnerType: "quytrinhiso",
      OwnerID: String(this._id),
      OwnerField: "fileword",
      TrangThai: "ACTIVE",
    }).lean(),
  ]);

  return { pdf: pdfFiles, word: wordFiles };
};

// Get file counts for list display
quyTrinhISOSchema.methods.getFileCounts = async function () {
  const TepTin = require("../modules/workmanagement/models/TepTin");

  const [pdfCount, wordCount] = await Promise.all([
    TepTin.countDocuments({
      OwnerType: "quytrinhiso",
      OwnerID: String(this._id),
      OwnerField: "filepdf",
      TrangThai: "ACTIVE",
    }),
    TepTin.countDocuments({
      OwnerType: "quytrinhiso",
      OwnerID: String(this._id),
      OwnerField: "fileword",
      TrangThai: "ACTIVE",
    }),
  ]);

  return { pdf: pdfCount, word: wordCount };
};

module.exports = mongoose.model("QuyTrinhISO", quyTrinhISOSchema);
```

### 3.2. QuyTrinhISO_KhoaPhanPhoi Model

**File:** `giaobanbv-be/models/QuyTrinhISO_KhoaPhanPhoi.js`

```javascript
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const phanPhoiSchema = new Schema(
  {
    QuyTrinhISOID: {
      type: Schema.Types.ObjectId,
      ref: "QuyTrinhISO",
      required: true,
    },
    KhoaID: {
      type: Schema.Types.ObjectId,
      ref: "Khoa",
      required: true,
    },
    // timestamps: true sẽ tự động thêm createdAt, updatedAt
  },
  {
    timestamps: true,
    collection: "quytrinhiso_khoaphanphoi",
  },
);

// === COMPOSITE UNIQUE INDEX ===
phanPhoiSchema.index({ QuyTrinhISOID: 1, KhoaID: 1 }, { unique: true });
phanPhoiSchema.index({ KhoaID: 1 });

// === STATICS ===
phanPhoiSchema.statics.findByQuyTrinh = function (quyTrinhId) {
  return this.find({ QuyTrinhISOID: quyTrinhId }).populate(
    "KhoaID",
    "TenKhoa MaKhoa",
  );
};

phanPhoiSchema.statics.findByKhoa = function (khoaId) {
  return this.find({ KhoaID: khoaId }).populate({
    path: "QuyTrinhISOID",
    match: { TrangThai: "ACTIVE" },
    populate: { path: "KhoaXayDungID", select: "TenKhoa MaKhoa" },
  });
};

// === STATIC: Sync phân phối (delete old + insert new) ===
phanPhoiSchema.statics.syncPhanPhoi = async function (
  quyTrinhId,
  khoaIds = [],
) {
  // Delete all existing
  await this.deleteMany({ QuyTrinhISOID: quyTrinhId });

  // Insert new
  if (khoaIds.length > 0) {
    const docs = khoaIds.map((khoaId) => ({
      QuyTrinhISOID: quyTrinhId,
      KhoaID: khoaId,
    }));
    await this.insertMany(docs, { ordered: false });
  }
};

module.exports = mongoose.model("QuyTrinhISO_KhoaPhanPhoi", phanPhoiSchema);
```

### 3.3. TepTin Usage Pattern

**Không tạo model mới.** Sử dụng TepTin có sẵn với:

```javascript
// FilePDF
{
  OwnerType: "quytrinhiso",
  OwnerID: "67abc123...",  // QuyTrinhISO._id
  OwnerField: "filepdf",
  TenGoc: "Quy_trinh_tiep_nhan_benh_nhan.pdf",
  // ... other fields
}

// FileWord (biểu mẫu)
{
  OwnerType: "quytrinhiso",
  OwnerID: "67abc123...",
  OwnerField: "fileword",
  TenGoc: "Mau_01_Tiep_nhan.docx",
  // ... other fields
}
```

---

## 4. BACKEND IMPLEMENTATION

### 4.1. Controller

**File:** `giaobanbv-be/controllers/quyTrinhISO.controller.js`

```javascript
const { catchAsync, sendResponse, AppError } = require("../helpers/utils");
const QuyTrinhISO = require("../models/QuyTrinhISO");
const QuyTrinhISO_KhoaPhanPhoi = require("../models/QuyTrinhISO_KhoaPhanPhoi");
const TepTin = require("../modules/workmanagement/models/TepTin");
const path = require("path");
const fs = require("fs-extra");
const shortid = require("shortid");
const config = require("../modules/workmanagement/helpers/uploadConfig");

const controller = {};

// ==================== LIST ====================
controller.list = catchAsync(async (req, res) => {
  const { page = 1, size = 20, search, MaQuyTrinh, KhoaXayDungID } = req.query;
  const currentUser = req.user;
  const isQLCL = ["qlcl", "admin", "superadmin"].includes(
    currentUser.PhanQuyen,
  );

  // Base query
  let query = { TrangThai: "ACTIVE" };

  // Search
  if (search) {
    query.$or = [
      { TenQuyTrinh: { $regex: search, $options: "i" } },
      { MaQuyTrinh: { $regex: search, $options: "i" } },
    ];
  }

  // Filter by MaQuyTrinh (for version listing)
  if (MaQuyTrinh) {
    query.MaQuyTrinh = MaQuyTrinh;
  }

  // Filter by KhoaXayDungID
  if (KhoaXayDungID) {
    query.KhoaXayDungID = KhoaXayDungID;
  }

  // Permission: Non-QLCL only sees distributed documents
  if (!isQLCL) {
    if (!currentUser.KhoaID) {
      // User không có khoa → không thấy gì
      return sendResponse(
        res,
        200,
        true,
        { items: [], total: 0, page, size },
        null,
        "OK",
      );
    }

    const phanPhoi = await QuyTrinhISO_KhoaPhanPhoi.find({
      KhoaID: currentUser.KhoaID,
    }).select("QuyTrinhISOID");

    const allowedIds = phanPhoi.map((p) => p.QuyTrinhISOID);
    query._id = { $in: allowedIds };
  }

  // Pagination
  const skip = (Math.max(1, +page) - 1) * Math.max(1, +size);

  const [items, total] = await Promise.all([
    QuyTrinhISO.find(query)
      .populate("KhoaXayDungID", "TenKhoa MaKhoa")
      .populate("NguoiTaoID", "HoTen Email")
      .sort({ NgayHieuLuc: -1, PhienBan: -1 })
      .skip(skip)
      .limit(+size),
    QuyTrinhISO.countDocuments(query),
  ]);

  // Attach file counts using instance method
  const itemsWithCounts = await Promise.all(
    items.map(async (item) => ({
      ...item.toJSON(),
      _fileCounts: await item.getFileCounts(),
    })),
  );

  return sendResponse(
    res,
    200,
    true,
    { items: itemsWithCounts, total, page: +page, size: +size },
    null,
    "OK",
  );
});

// ==================== DETAIL ====================
controller.detail = catchAsync(async (req, res) => {
  const { id } = req.params;
  const currentUser = req.user;
  const isQLCL = ["qlcl", "admin", "superadmin"].includes(
    currentUser.PhanQuyen,
  );

  const quyTrinh = await QuyTrinhISO.findById(id)
    .populate("KhoaXayDungID", "TenKhoa MaKhoa")
    .populate("NguoiTaoID", "HoTen Email")
    .populate("NguoiCapNhatID", "HoTen Email");

  if (!quyTrinh || quyTrinh.TrangThai === "DELETED") {
    throw new AppError(404, "Không tìm thấy quy trình", "NOT_FOUND");
  }

  // Permission check for non-QLCL
  if (!isQLCL) {
    const hasAccess = await QuyTrinhISO_KhoaPhanPhoi.exists({
      QuyTrinhISOID: id,
      KhoaID: currentUser.KhoaID,
    });
    if (!hasAccess) {
      throw new AppError(403, "Không có quyền xem quy trình này", "FORBIDDEN");
    }
  }

  // Get distribution list
  const phanPhoi = await QuyTrinhISO_KhoaPhanPhoi.find({ QuyTrinhISOID: id })
    .populate("KhoaID", "TenKhoa MaKhoa")
    .lean();

  // Get files using instance method
  const files = await quyTrinh.getFilesByType();

  return sendResponse(
    res,
    200,
    true,
    {
      quyTrinh: quyTrinh.toJSON(),
      danhSachKhoaPhanPhoi: phanPhoi.map((p) => p.KhoaID),
      files,
    },
    null,
    "OK",
  );
});

// ==================== CREATE ====================
controller.create = catchAsync(async (req, res) => {
  const {
    TenQuyTrinh,
    MaQuyTrinh,
    PhienBan,
    KhoaXayDungID,
    NgayHieuLuc,
    GhiChu,
    KhoaPhanPhoi = [],
  } = req.body;
  const currentUser = req.user;

  // Check duplicate MaQuyTrinh + PhienBan
  const exists = await QuyTrinhISO.exists({
    MaQuyTrinh: MaQuyTrinh.toUpperCase(),
    PhienBan,
    TrangThai: "ACTIVE",
  });

  if (exists) {
    throw new AppError(
      400,
      `Mã quy trình ${MaQuyTrinh} phiên bản ${PhienBan} đã tồn tại`,
      "DUPLICATE",
    );
  }

  // Create
  const quyTrinh = await QuyTrinhISO.create({
    TenQuyTrinh,
    MaQuyTrinh: MaQuyTrinh.toUpperCase(),
    PhienBan,
    KhoaXayDungID,
    NgayHieuLuc,
    GhiChu,
    NguoiTaoID: currentUser._id,
  });

  // Sync distribution
  if (KhoaPhanPhoi.length > 0) {
    await QuyTrinhISO_KhoaPhanPhoi.syncPhanPhoi(quyTrinh._id, KhoaPhanPhoi);
  }

  return sendResponse(
    res,
    201,
    true,
    { quyTrinh },
    null,
    "Tạo quy trình thành công. Vui lòng upload file PDF.",
  );
});

// ==================== UPDATE ====================
controller.update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    TenQuyTrinh,
    MaQuyTrinh,
    PhienBan,
    KhoaXayDungID,
    NgayHieuLuc,
    GhiChu,
    KhoaPhanPhoi,
  } = req.body;
  const currentUser = req.user;

  const quyTrinh = await QuyTrinhISO.findById(id);
  if (!quyTrinh || quyTrinh.TrangThai === "DELETED") {
    throw new AppError(404, "Không tìm thấy quy trình", "NOT_FOUND");
  }

  // Check duplicate if changing MaQuyTrinh or PhienBan
  if (
    (MaQuyTrinh && MaQuyTrinh.toUpperCase() !== quyTrinh.MaQuyTrinh) ||
    (PhienBan && PhienBan !== quyTrinh.PhienBan)
  ) {
    const exists = await QuyTrinhISO.exists({
      _id: { $ne: id },
      MaQuyTrinh: (MaQuyTrinh || quyTrinh.MaQuyTrinh).toUpperCase(),
      PhienBan: PhienBan || quyTrinh.PhienBan,
      TrangThai: "ACTIVE",
    });

    if (exists) {
      throw new AppError(400, "Mã + phiên bản đã tồn tại", "DUPLICATE");
    }
  }

  // Update fields
  if (TenQuyTrinh) quyTrinh.TenQuyTrinh = TenQuyTrinh;
  if (MaQuyTrinh) quyTrinh.MaQuyTrinh = MaQuyTrinh.toUpperCase();
  if (PhienBan) quyTrinh.PhienBan = PhienBan;
  if (KhoaXayDungID) quyTrinh.KhoaXayDungID = KhoaXayDungID;
  if (NgayHieuLuc) quyTrinh.NgayHieuLuc = NgayHieuLuc;
  if (GhiChu !== undefined) quyTrinh.GhiChu = GhiChu;

  quyTrinh.NguoiCapNhatID = currentUser._id;
  await quyTrinh.save();

  // Sync distribution if provided
  if (Array.isArray(KhoaPhanPhoi)) {
    await QuyTrinhISO_KhoaPhanPhoi.syncPhanPhoi(quyTrinh._id, KhoaPhanPhoi);
  }

  return sendResponse(
    res,
    200,
    true,
    { quyTrinh },
    null,
    "Cập nhật thành công",
  );
});

// ==================== DELETE (SOFT) ====================
controller.delete = catchAsync(async (req, res) => {
  const { id } = req.params;

  const quyTrinh = await QuyTrinhISO.findById(id);
  if (!quyTrinh) {
    throw new AppError(404, "Không tìm thấy quy trình", "NOT_FOUND");
  }

  quyTrinh.TrangThai = "DELETED";
  quyTrinh.NguoiCapNhatID = req.user._id;
  await quyTrinh.save();

  // Soft delete files
  await TepTin.updateMany(
    { OwnerType: "quytrinhiso", OwnerID: String(id) },
    { TrangThai: "DELETED" },
  );

  return sendResponse(res, 200, true, null, null, "Xóa quy trình thành công");
});

// ==================== GET VERSIONS ====================
controller.getVersions = catchAsync(async (req, res) => {
  const { id } = req.params;

  const current = await QuyTrinhISO.findById(id).lean();
  if (!current) {
    throw new AppError(404, "Không tìm thấy quy trình", "NOT_FOUND");
  }

  const versions = await QuyTrinhISO.find({
    MaQuyTrinh: current.MaQuyTrinh,
    TrangThai: "ACTIVE",
  })
    .populate("KhoaXayDungID", "TenKhoa")
    .sort({ PhienBan: -1 })
    .lean();

  return sendResponse(res, 200, true, { versions }, null, "OK");
});

// ==================== COPY FILES FROM VERSION ====================
controller.copyFilesFromVersion = catchAsync(async (req, res) => {
  const { id: targetId, sourceVersionId } = req.params;
  const { field } = req.query; // "fileword" hoặc không truyền = tất cả
  const currentUser = req.user;

  // Validate
  const [target, source] = await Promise.all([
    QuyTrinhISO.findById(targetId),
    QuyTrinhISO.findById(sourceVersionId),
  ]);

  if (!target || !source) {
    throw new AppError(404, "Không tìm thấy quy trình", "NOT_FOUND");
  }

  if (target.MaQuyTrinh !== source.MaQuyTrinh) {
    throw new AppError(
      400,
      "Chỉ copy giữa các phiên bản cùng mã quy trình",
      "INVALID_VERSION",
    );
  }

  // Get source files
  const query = {
    OwnerType: "quytrinhiso",
    OwnerID: String(sourceVersionId),
    TrangThai: "ACTIVE",
  };
  if (field) {
    query.OwnerField = String(field).toLowerCase();
  }

  const sourceFiles = await TepTin.find(query).lean();

  if (sourceFiles.length === 0) {
    return sendResponse(
      res,
      200,
      true,
      { copied: 0, skipped: 0, errors: [] },
      null,
      "Không có file để copy",
    );
  }

  // Copy files
  const results = { copied: 0, skipped: 0, errors: [] };

  for (const sourceFile of sourceFiles) {
    try {
      const sourcePath = path.join(config.UPLOAD_DIR, sourceFile.DuongDan);

      // Check source exists
      const exists = await fs.pathExists(sourcePath);
      if (!exists) {
        results.skipped++;
        results.errors.push({
          fileId: sourceFile._id,
          error: "File không tồn tại trên disk",
        });
        continue;
      }

      // Create destination path
      const now = new Date();
      const yyyy = now.getFullYear();
      const mm = String(now.getMonth() + 1).padStart(2, "0");
      const destFolder = path.join(
        config.UPLOAD_DIR,
        "attachments",
        "quytrinhiso",
        String(targetId),
        sourceFile.OwnerField,
        String(yyyy),
        mm,
      );
      await fs.ensureDir(destFolder);

      // New filename
      const ext = path.extname(sourceFile.TenFile);
      const newFileName = `${Date.now()}_${shortid.generate()}${ext}`;
      const destPath = path.join(destFolder, newFileName);

      // Copy physical file
      await fs.copyFile(sourcePath, destPath);

      // Create TepTin record
      const relativePath = path.relative(config.UPLOAD_DIR, destPath);
      await TepTin.create({
        TenFile: newFileName,
        TenGoc: sourceFile.TenGoc,
        LoaiFile: sourceFile.LoaiFile,
        KichThuoc: sourceFile.KichThuoc,
        DuongDan: relativePath,
        OwnerType: "quytrinhiso",
        OwnerID: String(targetId),
        OwnerField: sourceFile.OwnerField,
        NguoiTaiLenID: currentUser.NhanVienID,
        MoTa: `Copy từ phiên bản ${source.PhienBan}`,
        TrangThai: "ACTIVE",
      });

      results.copied++;
    } catch (error) {
      results.skipped++;
      results.errors.push({ fileId: sourceFile._id, error: error.message });
    }
  }

  return sendResponse(
    res,
    200,
    true,
    results,
    null,
    `Đã copy ${results.copied} file${results.skipped > 0 ? `, bỏ qua ${results.skipped} file` : ""}`,
  );
});

// ==================== STATISTICS (Dashboard) ====================
controller.getStatistics = catchAsync(async (req, res) => {
  const currentUser = req.user;
  const isQLCL = ["qlcl", "admin", "superadmin"].includes(
    currentUser.PhanQuyen,
  );

  let baseQuery = { TrangThai: "ACTIVE" };

  // Permission filter
  if (!isQLCL && currentUser.KhoaID) {
    const phanPhoi = await QuyTrinhISO_KhoaPhanPhoi.find({
      KhoaID: currentUser.KhoaID,
    }).select("QuyTrinhISOID");
    const allowedIds = phanPhoi.map((p) => p.QuyTrinhISOID);
    baseQuery._id = { $in: allowedIds };
  }

  // Statistics
  const [totalDocuments, uniqueProcesses, byDepartment, recentDocs] =
    await Promise.all([
      QuyTrinhISO.countDocuments(baseQuery),
      QuyTrinhISO.distinct("MaQuyTrinh", baseQuery).then((arr) => arr.length),
      QuyTrinhISO.aggregate([
        { $match: baseQuery },
        { $group: { _id: "$KhoaXayDungID", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "khoas",
            localField: "_id",
            foreignField: "_id",
            as: "khoa",
          },
        },
        { $unwind: "$khoa" },
        { $project: { TenKhoa: "$khoa.TenKhoa", count: 1 } },
        { $sort: { count: -1 } },
      ]),
      QuyTrinhISO.countDocuments({
        ...baseQuery,
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
    ]);

  return sendResponse(
    res,
    200,
    true,
    {
      summary: { totalDocuments, uniqueProcesses, recentDocs },
      byDepartment,
    },
    null,
    "OK",
  );
});

module.exports = controller;
```

### 4.2. Routes

**File:** `giaobanbv-be/routes/quyTrinhISO.api.js`

```javascript
const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/authentication");
const controller = require("../controllers/quyTrinhISO.controller");

// All routes require login
router.use(authentication.loginRequired);

// Statistics (before parameterized routes)
router.get("/statistics", controller.getStatistics);

// Public routes (filtered by permission in controller)
router.get("/", controller.list);
router.get("/:id", controller.detail);
router.get("/:id/versions", controller.getVersions);

// QLCL-only routes
router.post("/", authentication.qlclRequired, controller.create);
router.put("/:id", authentication.qlclRequired, controller.update);
router.delete("/:id", authentication.qlclRequired, controller.delete);
router.post(
  "/:id/copy-files-from/:sourceVersionId",
  authentication.qlclRequired,
  controller.copyFilesFromVersion,
);

module.exports = router;
```

### 4.3. Register Routes

**File:** `giaobanbv-be/app.js` - Thêm:

```javascript
const quyTrinhISORouter = require("./routes/quyTrinhISO.api");
app.use("/api/quytrinhiso", quyTrinhISORouter);
```

### 4.4. Middleware qlclRequired

**File:** `giaobanbv-be/middlewares/authentication.js` - Thêm:

```javascript
authentication.qlclRequired = catchAsync(async (req, res, next) => {
  const role = (req.user?.PhanQuyen || "").toLowerCase();

  if (["qlcl", "admin", "superadmin"].includes(role)) {
    return next();
  }

  throw new AppError(
    403,
    "Chỉ người dùng QLCL mới có quyền thực hiện",
    "AUTHORIZATION_ERROR",
  );
});
```

---

## 5. FRONTEND IMPLEMENTATION

### 5.1. Redux Slice

**File:** `src/features/QuyTrinhISO/quyTrinhISOSlice.js`

```javascript
import { createSlice } from "@reduxjs/toolkit";
import apiService from "app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  items: [],
  total: 0,
  page: 1,
  size: 20,
  currentItem: null,
  versions: [],
  statistics: null,
};

const slice = createSlice({
  name: "quyTrinhISO",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    getListSuccess(state, action) {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.size = action.payload.size;
    },
    getDetailSuccess(state, action) {
      state.isLoading = false;
      state.currentItem = action.payload;
    },
    getVersionsSuccess(state, action) {
      state.isLoading = false;
      state.versions = action.payload.versions;
    },
    getStatisticsSuccess(state, action) {
      state.isLoading = false;
      state.statistics = action.payload;
    },
    createSuccess(state, action) {
      state.isLoading = false;
    },
    updateSuccess(state, action) {
      state.isLoading = false;
    },
    deleteSuccess(state, action) {
      state.isLoading = false;
      state.items = state.items.filter((item) => item._id !== action.payload);
    },
    clearCurrentItem(state) {
      state.currentItem = null;
    },
  },
});

export default slice.reducer;

// ==================== THUNKS ====================

export const getQuyTrinhISOList = (params) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/quytrinhiso", { params });
    dispatch(slice.actions.getListSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getQuyTrinhISODetail = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(`/quytrinhiso/${id}`);
    dispatch(slice.actions.getDetailSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const getQuyTrinhISOVersions = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get(`/quytrinhiso/${id}/versions`);
    dispatch(slice.actions.getVersionsSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};

export const getQuyTrinhISOStatistics = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.get("/quytrinhiso/statistics");
    dispatch(slice.actions.getStatisticsSuccess(res.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
  }
};

export const createQuyTrinhISO = (data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.post("/quytrinhiso", data);
    dispatch(slice.actions.createSuccess(res.data.data));
    toast.success(res.data.message);
    return res.data.data.quyTrinh; // Return để redirect
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const updateQuyTrinhISO = (id, data) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const res = await apiService.put(`/quytrinhiso/${id}`, data);
    dispatch(slice.actions.updateSuccess(res.data.data));
    toast.success(res.data.message);
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const deleteQuyTrinhISO = (id) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`/quytrinhiso/${id}`);
    dispatch(slice.actions.deleteSuccess(id));
    toast.success("Đã xóa quy trình");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    throw error;
  }
};

export const copyFilesFromVersion =
  (targetId, sourceId, field) => async (dispatch) => {
    try {
      const url = `/quytrinhiso/${targetId}/copy-files-from/${sourceId}${field ? `?field=${field}` : ""}`;
      const res = await apiService.post(url);
      toast.success(res.data.message);
      return res.data.data;
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  };

export const { clearCurrentItem } = slice.actions;
```

### 5.2. Component Structure

```
src/features/QuyTrinhISO/
├── quyTrinhISOSlice.js
├── QuyTrinhISOPage.js              # List page (main entry)
├── QuyTrinhISOCreatePage.js        # Step 1: Create basic info
├── QuyTrinhISOEditPage.js          # Step 2: Edit + Upload files
├── QuyTrinhISODetailPage.js        # View detail + PDF viewer
├── QuyTrinhISODashboard.js         # Statistics dashboard
├── components/
│   ├── QuyTrinhISOTable.js         # Data table
│   ├── QuyTrinhISOForm.js          # Form for create/edit
│   ├── QuyTrinhISOFilesSection.js  # AttachmentSection wrapper
│   ├── PDFViewer.js                # PDF viewer dialog
│   ├── VersionHistory.js           # Version timeline
│   └── CopyFilesDialog.js          # Copy files from version
└── hooks/
    └── useQuyTrinhISOPermission.js # Permission check hook
```

### 5.3. AttachmentSection Enhancement

**File:** `src/shared/components/AttachmentSection.jsx`

**Thêm prop `maxFiles`:**

```jsx
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
  maxFiles = null,  // ← NEW: null = unlimited, 1 = single file
  onChange = null,
  onError = null,
  labels = {},
}) {
  // ... existing state ...

  // Validate before upload
  const validateFiles = (selectedFiles) => {
    // Existing validations...

    // NEW: Check maxFiles
    if (maxFiles !== null) {
      if (maxFiles === 1 && selectedFiles.length > 1) {
        setError("Chỉ được chọn 1 tệp");
        return false;
      }
      if (files.length + selectedFiles.length > maxFiles) {
        setError(`Chỉ được tải tối đa ${maxFiles} tệp`);
        return false;
      }
    }

    return true;
  };

  // Update input element
  return (
    // ...
    <input
      hidden
      type="file"
      multiple={maxFiles !== 1}  // ← Disable multiple for single mode
      onChange={onPick}
    />
    // ...

    // Disable upload button when maxFiles reached
    {canUpload && (maxFiles === null || files.length < maxFiles) && (
      <Button ...>
        {t.pickBtn}
      </Button>
    )}
  );
}
```

### 5.4. Routes Configuration

**File:** `src/routes/index.js` - Thêm:

```javascript
import QuyTrinhISOPage from "features/QuyTrinhISO/QuyTrinhISOPage";
import QuyTrinhISOCreatePage from "features/QuyTrinhISO/QuyTrinhISOCreatePage";
import QuyTrinhISOEditPage from "features/QuyTrinhISO/QuyTrinhISOEditPage";
import QuyTrinhISODetailPage from "features/QuyTrinhISO/QuyTrinhISODetailPage";
import QuyTrinhISODashboard from "features/QuyTrinhISO/QuyTrinhISODashboard";

// Routes
{
  path: "/quytrinh-iso",
  element: <QuyTrinhISOPage />,
},
{
  path: "/quytrinh-iso/dashboard",
  element: <QuyTrinhISODashboard />,
},
{
  path: "/quytrinh-iso/them-moi",
  element: <QLCLRequire><QuyTrinhISOCreatePage /></QLCLRequire>,
},
{
  path: "/quytrinh-iso/:id",
  element: <QuyTrinhISODetailPage />,
},
{
  path: "/quytrinh-iso/:id/edit",
  element: <QLCLRequire><QuyTrinhISOEditPage /></QLCLRequire>,
},
```

---

## 6. MENU & NAVIGATION

### 6.1. Menu Item Configuration

**File:** `src/menu-items/quanlychatluong.js` (NEW)

```javascript
import { ClipboardText, DocumentText, Chart, AddCircle } from "iconsax-react";

const icons = {
  main: ClipboardText,
  document: DocumentText,
  dashboard: Chart,
  add: AddCircle,
};

const quanlychatluong = {
  id: "group-quality-management",
  title: "Quản Lý Chất Lượng",
  type: "group",
  icon: icons.main,
  children: [
    {
      id: "quy-trinh-iso",
      title: "Tài Liệu ISO",
      type: "collapse",
      icon: icons.document,
      children: [
        {
          id: "quy-trinh-iso-dashboard",
          title: "Dashboard",
          type: "item",
          url: "/quytrinh-iso/dashboard",
          icon: icons.dashboard,
          breadcrumbs: true,
        },
        {
          id: "quy-trinh-iso-list",
          title: "Danh Sách Quy Trình",
          type: "item",
          url: "/quytrinh-iso",
          icon: icons.document,
          breadcrumbs: true,
        },
        {
          id: "quy-trinh-iso-add",
          title: "Thêm Quy Trình",
          type: "item",
          url: "/quytrinh-iso/them-moi",
          icon: icons.add,
          breadcrumbs: true,
          requiredRole: ["qlcl", "admin", "superadmin"],
        },
      ],
    },
  ],
};

export default quanlychatluong;
```

### 6.2. Register Menu

**File:** `src/menu-items/index.js`

```javascript
import quanlychatluong from "./quanlychatluong";

// Add roles
quanlychatluong.roles = ["qlcl", "admin", "superadmin", "manager", "nomal"];

// Add to items array (before hethong)
const menuItems = {
  items: [
    // ... existing
    quanlychatluong, // ← NEW
    hethong,
    admin,
  ],
};
```

### 6.3. Navigation Index Update

**File:** `src/layout/MainLayout/Drawer/DrawerContent/Navigation/index.js`

Update `hasAccess` function để support `requiredRole`:

```javascript
const hasAccess = (item) => {
  if (!user || !user.PhanQuyen) return false;
  const role = user.PhanQuyen || "default";

  // Check requiredRole (child-level)
  if (item.requiredRole && Array.isArray(item.requiredRole)) {
    return item.requiredRole.includes(role);
  }

  // Fallback to parent roles
  return item.roles?.includes(role);
};
```

### 6.4. Menu Hierarchy Diagram

```
📊 Quản Lý Chất Lượng              ← Group (visible to all roles)
│
└─ 📄 Tài Liệu ISO                 ← Collapse menu
   ├─ 📈 Dashboard                 → /quytrinh-iso/dashboard
   ├─ 📁 Danh Sách Quy Trình       → /quytrinh-iso
   └─ ➕ Thêm Quy Trình            → /quytrinh-iso/them-moi  (QLCL only)
```

### 6.5. Routes & Menu Mapping

| Menu Item          | Route                     | Component             | Access    |
| ------------------ | ------------------------- | --------------------- | --------- |
| Dashboard          | `/quytrinh-iso/dashboard` | QuyTrinhISODashboard  | All roles |
| Danh Sách          | `/quytrinh-iso`           | QuyTrinhISOPage       | All roles |
| Thêm Quy Trình     | `/quytrinh-iso/them-moi`  | QuyTrinhISOCreatePage | QLCL only |
| Chi Tiết (hidden)  | `/quytrinh-iso/:id`       | QuyTrinhISODetailPage | All roles |
| Chỉnh Sửa (hidden) | `/quytrinh-iso/:id/edit`  | QuyTrinhISOEditPage   | QLCL only |

---

## 7. IMPLEMENTATION PHASES

### Phase 0: Prerequisites (0.5 ngày)

| Task | File                | Action                                        |
| ---- | ------------------- | --------------------------------------------- |
| 0.1  | `User.js`           | Thêm "qlcl" vào enum PhanQuyen                |
| 0.2  | `authentication.js` | Thêm middleware `qlclRequired`                |
| 0.3  | Terminal            | Tạo folder `uploads/attachments/quytrinhiso/` |
| 0.4  | MongoDB             | Backup database                               |
| 0.5  | MongoDB             | Tạo test user với role "qlcl"                 |

### Phase 1: Backend Core (1.5 ngày)

| Task | File                                    | Action                      |
| ---- | --------------------------------------- | --------------------------- |
| 1.1  | `models/QuyTrinhISO.js`                 | Tạo model                   |
| 1.2  | `models/QuyTrinhISO_KhoaPhanPhoi.js`    | Tạo model                   |
| 1.3  | `controllers/quyTrinhISO.controller.js` | Implement CRUD + Statistics |
| 1.4  | `routes/quyTrinhISO.api.js`             | Tạo routes                  |
| 1.5  | `app.js`                                | Register routes             |
| 1.6  | Postman                                 | Test tất cả endpoints       |

### Phase 2: Frontend Core (1.5 ngày)

| Task | File                  | Action               |
| ---- | --------------------- | -------------------- |
| 2.1  | `quyTrinhISOSlice.js` | Tạo Redux slice      |
| 2.2  | `store.js`            | Register reducer     |
| 2.3  | `QuyTrinhISOPage.js`  | List page            |
| 2.4  | `QuyTrinhISOTable.js` | Data table component |
| 2.5  | `routes/index.js`     | Add routes           |

### Phase 3: Create/Edit Flow (1.5 ngày)

| Task | File                         | Action                    |
| ---- | ---------------------------- | ------------------------- |
| 3.1  | `QuyTrinhISOCreatePage.js`   | Form tạo mới (basic info) |
| 3.2  | `QuyTrinhISOEditPage.js`     | Form edit + upload files  |
| 3.3  | `QuyTrinhISOForm.js`         | Reusable form component   |
| 3.4  | `QuyTrinhISOFilesSection.js` | File upload section       |
| 3.5  | `AttachmentSection.jsx`      | Thêm prop `maxFiles`      |

### Phase 4: View & Features (1 ngày)

| Task | File                       | Action             |
| ---- | -------------------------- | ------------------ |
| 4.1  | `QuyTrinhISODetailPage.js` | Detail view        |
| 4.2  | `PDFViewer.js`             | PDF viewer dialog  |
| 4.3  | `VersionHistory.js`        | Version timeline   |
| 4.4  | `CopyFilesDialog.js`       | Copy files feature |

### Phase 5: Dashboard & Menu (1 ngày)

| Task | File                      | Action             |
| ---- | ------------------------- | ------------------ |
| 5.1  | `QuyTrinhISODashboard.js` | Statistics page    |
| 5.2  | `quanlychatluong.js`      | Menu configuration |
| 5.3  | `index.js` (menu-items)   | Register menu      |
| 5.4  | `Navigation/index.js`     | Update hasAccess   |

### Phase 6: Polish & Testing (1 ngày)

| Task | Action                            |
| ---- | --------------------------------- |
| 6.1  | Mobile responsive testing         |
| 6.2  | Permission testing (QLCL vs User) |
| 6.3  | File upload/download testing      |
| 6.4  | PDF viewer testing                |
| 6.5  | Copy files testing                |
| 6.6  | Error handling                    |

---

## 8. CHECKLIST & TESTING

### 8.1. Backend Checklist

```
Prerequisites:
[ ] "qlcl" added to User.PhanQuyen enum
[ ] qlclRequired middleware created
[ ] uploads/attachments/quytrinhiso/ directory exists

Models:
[ ] QuyTrinhISO model created with indexes
[ ] QuyTrinhISO_KhoaPhanPhoi model created with unique index

Controller:
[ ] list - với permission filter
[ ] detail - với permission check
[ ] create - QLCL only
[ ] update - QLCL only
[ ] delete - soft delete
[ ] getVersions
[ ] copyFilesFromVersion
[ ] getStatistics

Routes:
[ ] All routes registered
[ ] Authentication middleware applied
[ ] QLCL middleware on write operations
```

### 8.2. Frontend Checklist

```
Redux:
[ ] Slice created with all thunks
[ ] Registered in store

Pages:
[ ] List page with search
[ ] Create page (basic info only)
[ ] Edit page (info + files)
[ ] Detail page with PDF viewer
[ ] Dashboard with charts

Components:
[ ] QuyTrinhISOTable
[ ] QuyTrinhISOForm
[ ] PDFViewer
[ ] VersionHistory
[ ] CopyFilesDialog

Menu:
[ ] quanlychatluong.js created
[ ] Registered in menu-items/index.js
[ ] requiredRole filter working

AttachmentSection:
[ ] maxFiles prop added
[ ] Single file mode working
[ ] Multiple file mode unchanged
```

### 8.3. Testing Scenarios

```
Permission Tests:
[ ] QLCL can create/edit/delete
[ ] QLCL can see all documents
[ ] Manager can view (filtered)
[ ] Normal user sees only distributed docs
[ ] User without KhoaID sees empty list
[ ] Unauthorized access returns 403

CRUD Tests:
[ ] Create with valid data
[ ] Create duplicate MaQuyTrinh+PhienBan → Error
[ ] Update basic info
[ ] Update distribution list
[ ] Soft delete
[ ] Deleted docs not visible

File Tests:
[ ] Upload PDF (single file only)
[ ] Upload multiple Word files
[ ] View PDF inline
[ ] Download files
[ ] Delete files
[ ] Copy files from previous version

UI Tests:
[ ] Table pagination
[ ] Search functionality
[ ] Form validation
[ ] Loading states
[ ] Error messages
[ ] Mobile responsive
```

---

## 📊 Timeline Summary

| Phase                     | Duration | Cumulative |
| ------------------------- | -------- | ---------- |
| Phase 0: Prerequisites    | 0.5 ngày | 0.5 ngày   |
| Phase 1: Backend Core     | 1.5 ngày | 2 ngày     |
| Phase 2: Frontend Core    | 1.5 ngày | 3.5 ngày   |
| Phase 3: Create/Edit Flow | 1.5 ngày | 5 ngày     |
| Phase 4: View & Features  | 1 ngày   | 6 ngày     |
| Phase 5: Dashboard & Menu | 1 ngày   | 7 ngày     |
| Phase 6: Polish & Testing | 1 ngày   | **8 ngày** |

**Total: 8 ngày làm việc**

---

**END OF DOCUMENT**
