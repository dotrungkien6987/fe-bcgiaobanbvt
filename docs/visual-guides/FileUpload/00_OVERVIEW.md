# FILE UPLOAD SYSTEM - TỔNG QUAN

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Kiến trúc tổng quan](#kiến-trúc-tổng-quan)
- [Hai hệ thống song song](#hai-hệ-thống-song-song)
- [Lịch sử phát triển](#lịch-sử-phát-triển)
- [Quyết định kiến trúc](#quyết-định-kiến-trúc)

---

## 🎯 Giới thiệu

Hệ thống quản lý bệnh viện sử dụng **2 hệ thống upload file riêng biệt** được phát triển ở các giai đoạn khác nhau, mỗi hệ thống phục vụ các use case cụ thể:

### **1. Legacy System (CongViec/YeuCau)**

- **Mục đích**: Upload file trong comments và task management
- **Đặc điểm**: Atomic operations, inline upload, paste support
- **Path**: `uploads/congviec/`
- **Trạng thái**: Production, stable, được sử dụng rộng rãi

### **2. Modern Generic Attachments System**

- **Mục đích**: Universal file attachments cho mọi module
- **Đặc điểm**: Reusable, field-based, REST-compliant
- **Path**: `uploads/attachments/`
- **Trạng thái**: Production-ready, đang mở rộng

---

## 🏗️ Kiến trúc tổng quan

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND COMPONENTS                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │  LEGACY SYSTEM       │      │  MODERN SYSTEM       │       │
│  ├──────────────────────┤      ├──────────────────────┤       │
│  │ CommentComposer      │      │ AttachmentSection    │       │
│  │ FilesSidebar         │      │   (Generic)          │       │
│  │ CommentsList         │      │                      │       │
│  │ ReplyInput           │      │                      │       │
│  └──────────────────────┘      └──────────────────────┘       │
│           │                              │                      │
│           ↓                              ↓                      │
├───────────────────────────────────────────────────────────────┤
│                     API SERVICES                               │
├───────────────────────────────────────────────────────────────┤
│  Domain-specific APIs          Generic Attachments API        │
│  • congViecSlice               • attachments.api.js           │
│  • yeuCauSlice                                                │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     BACKEND LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │  LEGACY ROUTES       │      │  GENERIC ROUTES      │       │
│  ├──────────────────────┤      ├──────────────────────┤       │
│  │ /congviec/:id/       │      │ /attachments/        │       │
│  │   comments           │      │   :ownerType/        │       │
│  │   files              │      │   :ownerId/          │       │
│  │ /yeucau/:id/         │      │   :field/files       │       │
│  │   comments           │      │                      │       │
│  │   files              │      │                      │       │
│  └──────────────────────┘      └──────────────────────┘       │
│           │                              │                      │
│           ↓                              ↓                      │
├───────────────────────────────────────────────────────────────┤
│                   MULTER MIDDLEWARE                            │
│  • upload.middleware.js (generic config)                      │
│  • UTF-8 filename handling                                    │
│  • Magic number verification                                   │
│  • Size validation                                            │
└───────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  TepTin (File) Model                                           │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ • TenFile, TenGoc, LoaiFile, KichThuoc                   │ │
│  │ • DuongDan (relative path)                                │ │
│  │                                                            │ │
│  │ Legacy fields:                                             │ │
│  │ • CongViecID, YeuCauID, BinhLuanID                        │ │
│  │                                                            │ │
│  │ Generic fields:                                            │ │
│  │ • OwnerType, OwnerID, OwnerField                          │ │
│  │                                                            │ │
│  │ • NguoiTaiLenID, MoTa, TrangThai                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────────┐
│                     FILE STORAGE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  uploads/                                                       │
│  ├── congviec/                      (Legacy Structure)         │
│  │   └── {congViecId}/                                        │
│  │       ├── {yyyy}/{mm}/           (Task-level files)        │
│  │       └── comments/                                         │
│  │           └── {commentId}/                                  │
│  │               └── {yyyy}/{mm}/   (Comment files)           │
│  │                                                              │
│  └── attachments/                   (Modern Structure)         │
│      └── {ownerType}/                                          │
│          └── {ownerId}/                                        │
│              └── {field}/                                      │
│                  └── {yyyy}/{mm}/                              │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Hai hệ thống song song

### **Comparison Matrix**

| Aspect                    | Legacy (CongViec/YeuCau)      | Modern (Generic Attachments)  |
| ------------------------- | ----------------------------- | ----------------------------- |
| **Components**            | CommentComposer, FilesSidebar | AttachmentSection             |
| **Upload UX**             | Inline trong comment box      | Separate dropzone section     |
| **Drag & Drop**           | ✅ Vào comment textarea       | ✅ Vào dedicated zone         |
| **Paste (Ctrl+V)**        | ✅ Yes                        | ❌ No                         |
| **Preview before upload** | ✅ Thumbnails                 | ❌ Upload first               |
| **Atomic operations**     | ✅ Comment+files together     | ❌ Separate operations        |
| **File path**             | `uploads/congviec/`           | `uploads/attachments/`        |
| **API pattern**           | Domain-specific               | Generic REST                  |
| **Backend code**          | Per-module controllers        | Single generic controller     |
| **Reusability**           | Low (CongViec/YeuCau only)    | High (any module)             |
| **Multiple fields**       | ❌ Single field               | ✅ Multiple fields per entity |
| **Production status**     | ✅ Stable, widely used        | ✅ Ready, expanding           |
| **Best for**              | Comments, inline uploads      | Document attachments          |

---

## 📚 Lịch sử phát triển

### **Timeline**

```
2024 Q3-Q4: Phase 1 - CongViec Module
├─ Xây dựng task management system
├─ Implement file upload cho tasks và comments
├─ Path: uploads/congviec/
└─ Features: Drag-drop, paste, atomic comment+files

2025 Q1-Q2: Phase 2 - YeuCau Module
├─ Thêm ticket management system
├─ Smart code reuse: Import CongViec components
├─ Same backend pattern, different entity
└─ YeuCauCommentsSection wraps CongViec UI

2025 Q3-Q4: Phase 3 - Generic Attachments
├─ Nhận thấy pattern lặp lại nhiều modules
├─ Thiết kế generic, reusable system
├─ Path: uploads/attachments/{ownerType}/
├─ Used in: TapSan, LopDaoTao, DoanRa
└─ AttachmentSection component

2026 Q1: Current State
├─ Both systems coexist peacefully
├─ Legacy: Stable, proven, comments
├─ Modern: Expanding, new features
└─ No migration planned (not needed)
```

---

## 🎯 Quyết định kiến trúc

### **Tại sao giữ 2 hệ thống?**

#### ✅ **Lý do hợp lý:**

**1. Different Use Cases**

- **Comments**: Cần inline upload, atomic operations, paste support
- **Attachments**: Document management, multiple fields, structured

**2. Zero Breaking Changes**

- Legacy system đang production với nhiều users
- Migration = risk lớn, ít benefit
- "If it ain't broke, don't fix it"

**3. Best of Both Worlds**

- Comments: UX tối ưu với CommentComposer
- Attachments: Flexibility với AttachmentSection

**4. Smart Code Reuse**

- YeuCau reuses CongViec components (not duplication!)
- Shared TepTin model, shared middleware
- Only different: routes and entity references

#### ⚠️ **Tradeoffs:**

**1. Learning Curve**

- Developers cần hiểu 2 patterns
- Documentation critical (hence this guide!)

**2. Maintenance Overhead**

- Bug fixes might need double work
- Security updates need both systems

**3. Disk Organization**

- Files scattered across 2 folder structures
- Backup strategy needs both paths

---

## 📊 Module Usage Matrix

| Module           | Upload Type | Component                      | Storage                | Notes          |
| ---------------- | ----------- | ------------------------------ | ---------------------- | -------------- |
| **CongViec**     | Legacy      | CommentComposer + FilesSidebar | `uploads/congviec/`    | ✅ Production  |
| **YeuCau**       | Legacy      | Reuses CongViec components     | `uploads/congviec/`    | ✅ Production  |
| **TapSan**       | Modern      | AttachmentSection              | `uploads/attachments/` | ✅ Production  |
| **TapSanBaiBao** | Modern      | AttachmentSection              | `uploads/attachments/` | ✅ Production  |
| **LopDaoTao**    | Modern      | AttachmentSection              | `uploads/attachments/` | ✅ Production  |
| **DoanRa**       | Modern      | AttachmentSection              | `uploads/attachments/` | ✅ Production  |
| **KPI**          | None yet    | (Future)                       | TBD                    | 🔄 Planned     |
| **BaoCaoNgay**   | Cloudinary  | ImageUploader (legacy)         | Cloud CDN              | ⚠️ Images only |
| **DaoTao**       | Cloudinary  | ImageUploader (legacy)         | Cloud CDN              | ⚠️ Images only |

---

## 🚀 Khi nào dùng hệ thống nào?

### **Decision Flowchart**

```
Feature mới cần upload file?
│
├─ Có phải comment/inline upload?
│  │
│  ├─ YES → Dùng CommentComposer pattern
│  │        • Reuse CongViec components
│  │        • Atomic comment+files API
│  │        • Path: uploads/congviec/ (or custom)
│  │
│  └─ NO → Tiếp tục
│
├─ Có phải chỉ hình ảnh + cần CDN?
│  │
│  ├─ YES → Dùng Cloudinary (legacy)
│  │        • ImageUploader + cloudinary.js
│  │        • Cloud storage
│  │
│  └─ NO → Tiếp tục
│
└─ Document/file attachments?
   │
   └─ YES → Dùng AttachmentSection ⭐
            • Generic, reusable
            • Multiple file types
            • Multiple fields support
            • Path: uploads/attachments/
            • Backend ready (zero config)
```

### **Quick Reference**

| Use Case                      | Recommended Component                     |
| ----------------------------- | ----------------------------------------- |
| **Comment với file**          | CommentComposer (legacy)                  |
| **Task/ticket files**         | FilesSidebar (legacy)                     |
| **Document attachments**      | AttachmentSection ⭐                      |
| **Multiple attachment types** | AttachmentSection (with different fields) |
| **Patient images**            | ImageUploader (Cloudinary)                |
| **Inline upload needed**      | CommentComposer                           |
| **Paste support needed**      | CommentComposer                           |
| **New feature (general)**     | AttachmentSection ⭐                      |

---

## 📖 Đọc tiếp

1. [AttachmentSection Component](./01_ATTACHMENT_SECTION.md) - Modern generic system
2. [Comment File Upload](./02_COMMENT_FILE_UPLOAD.md) - Legacy inline upload
3. [YeuCau Reuse Pattern](./03_YEUCAU_REUSE_PATTERN.md) - Smart code reuse
4. [Component Comparison](./04_COMPONENT_COMPARISON.md) - Detailed comparison
5. [Integration Guide](./05_INTEGRATION_GUIDE.md) - Step-by-step integration
6. [Backend Architecture](./06_BACKEND_ARCHITECTURE.md) - Server-side details
7. [API Reference](./08_API_REFERENCE.md) - Complete API docs

---

## 🔗 Related Documentation

- [CongViec File Management](../CongViec/04_FILE_MANAGEMENT.md)
- [Ticket Comments & Files](../TICKET/05_COMMENTS_FILES.md)
- [TapSan Attachments](../TapSan/TAI_LIEU_DINH_KEM_VISUAL_GUIDE.md)

---

**Last Updated**: January 27, 2026
**Version**: 1.0.0
