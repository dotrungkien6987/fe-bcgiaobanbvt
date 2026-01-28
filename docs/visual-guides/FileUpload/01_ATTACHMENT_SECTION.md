# ATTACHMENTSECTION COMPONENT - MODERN GENERIC SYSTEM

## 📋 Mục lục

- [Giới thiệu](#giới-thiệu)
- [Kiến trúc component](#kiến-trúc-component)
- [Props API](#props-api)
- [Features](#features)
- [Usage Examples](#usage-examples)
- [Responsive Design](#responsive-design)
- [Customization](#customization)

---

## 🎯 Giới thiệu

**AttachmentSection** là component generic, full-featured để quản lý file đính kèm cho bất kỳ entity nào trong hệ thống.

### **Đặc điểm nổi bật**

✅ **Universal**: Hoạt động với mọi module (TapSan, LopDaoTao, HopDong, etc.)  
✅ **Field-based**: Hỗ trợ nhiều field attachments cho cùng 1 entity  
✅ **Full CRUD**: Upload, List, Preview, Download, Delete  
✅ **Drag & Drop**: Kéo thả file vào dropzone  
✅ **Type Validation**: Filter theo loại file (PDF, images, Office docs)  
✅ **Size Validation**: Giới hạn kích thước file  
✅ **Responsive**: Mobile-friendly, touch-optimized  
✅ **Backend Ready**: API đã sẵn sàng, không cần code thêm

### **File Location**

```
📁 src/shared/components/AttachmentSection.jsx
📁 src/shared/services/attachments.api.js
```

---

## 🏗️ Kiến trúc component

### **Component Structure**

```
AttachmentSection
├── Header
│   ├── Title + File Count
│   └── Upload Button
│
├── Upload Progress Bar (conditional)
│   └── LinearProgress with percentage
│
├── Error Alert (conditional)
│   └── Alert with close button
│
├── Drag & Drop Zone
│   ├── CloudUpload Icon
│   ├── Drop instructions
│   └── Pick File Button
│
├── File List (Grid)
│   └── For each file:
│       ├── File Icon (emoji based on type)
│       ├── File Info
│       │   ├── Filename
│       │   ├── Size chip
│       │   └── Upload date
│       └── Action Buttons
│           ├── Preview (eye icon)
│           ├── Download (arrow down)
│           └── Delete (trash icon)
│
└── Delete Confirmation Dialog
    ├── Warning alert
    ├── Filename display
    └── Confirm/Cancel buttons
```

### **State Management**

```javascript
const [files, setFiles] = useState([]); // File list
const [total, setTotal] = useState(0); // Total count
const [uploading, setUploading] = useState(false); // Upload in progress
const [progress, setProgress] = useState(0); // Upload %
const [dragOver, setDragOver] = useState(false); // Drag state
const [error, setError] = useState(null); // Error message
const [previewLoading, setPreviewLoading] = useState(null);
const [downloadLoading, setDownloadLoading] = useState(null);
const [deleteDialog, setDeleteDialog] = useState({ open: false, file: null });
const [deleteLoading, setDeleteLoading] = useState(null);
```

### **Data Flow**

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                              │
│    • Drag & drop files                                      │
│    • Click "Chọn tệp" button                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. VALIDATION (Client-side)                                │
│    • Check allowedTypes (MIME type match)                   │
│    • Check maxSizeMB (per file)                            │
│    • Filter out invalid files                               │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. UPLOAD (FormData)                                        │
│    • POST /api/attachments/{ownerType}/{ownerId}/{field}/files │
│    • FormData: files[] + metadata                          │
│    • Progress tracking: onUploadProgress                    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. BACKEND PROCESSING                                       │
│    • Multer saves to: uploads/attachments/.../yyyy/mm/     │
│    • Magic number verification                              │
│    • Creates TepTin records (OwnerType, OwnerID, Field)    │
└─────────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. REFRESH LIST                                            │
│    • GET /api/attachments/{ownerType}/{ownerId}/{field}/files │
│    • GET /api/attachments/{ownerType}/{ownerId}/{field}/files/count │
│    • Update state: files[], total                          │
│    • Call onChange callback                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Props API

### **Required Props**

| Prop        | Type     | Description                                            |
| ----------- | -------- | ------------------------------------------------------ | ------------------------------------------------ |
| `ownerType` | `string` | Tên entity type (VD: "TapSan", "HopDong", "LopDaoTao") |
| `ownerId`   | `string  | number`                                                | ID của entity (MongoDB ObjectId hoặc numeric ID) |

### **Optional Props**

| Prop           | Type      | Default          | Description                                         |
| -------------- | --------- | ---------------- | --------------------------------------------------- | ------------------------------------------------------ |
| `field`        | `string`  | `"file"`         | Tên field attachment (cho phép nhiều fields/entity) |
| `title`        | `string`  | `"Tệp đính kèm"` | Tiêu đề hiển thị                                    |
| `canUpload`    | `boolean` | `true`           | Hiển thị upload zone và buttons                     |
| `canPreview`   | `boolean` | `true`           | Hiển thị nút xem trước                              |
| `canDownload`  | `boolean` | `true`           | Hiển thị nút tải xuống                              |
| `canDelete`    | `boolean` | `true`           | Hiển thị nút xóa                                    |
| `allowedTypes` | `string[] | null`            | `null`                                              | Filter loại file (MIME types hoặc extensions)          |
| `maxSizeMB`    | `number   | null`            | `null`                                              | Giới hạn kích thước file (MB)                          |
| `onChange`     | `function | null`            | `null`                                              | Callback sau upload/delete: `({items, total}) => void` |
| `onError`      | `function | null`            | `null`                                              | Callback khi có lỗi: `(message) => void`               |
| `labels`       | `object`  | `{}`             | Override text labels (i18n support)                 |

### **allowedTypes Format**

Hỗ trợ 3 formats:

```javascript
// 1. MIME type prefix (wildcard)
allowedTypes={["image/*", "video/*"]}

// 2. Exact MIME type
allowedTypes={["application/pdf", "application/json"]}

// 3. File extension
allowedTypes={[".docx", ".xlsx", ".pptx"]}

// Mixed
allowedTypes={["image/*", "application/pdf", ".docx", ".xlsx"]}
```

### **labels Object**

```javascript
labels={{
  pickBtn: "Chọn tệp",                    // Upload button text
  dropTitleIdle: "Kéo thả tệp vào đây hoặc",  // Idle dropzone
  dropTitleActive: "Thả tệp ở đây",       // Active dropzone
  uploadBtn: "Tải tệp lên",
  totalFiles: "{n} tệp đã tải lên",       // {n} replaced with count
  uploading: "Đang tải lên...",
  cannotLoadList: "Không thể tải danh sách tệp",
  cannotUpload: "Không thể tải lên tệp. Vui lòng thử lại.",
  cannotPreview: "Không xem trước được tệp.",
  cannotDownload: "Không tải được tệp.",
  cannotDelete: "Không thể xóa tệp.",
  confirmDeleteTitle: "Xác nhận xóa tệp",
  confirmDeleteNote: "Bạn có chắc chắn muốn xóa tệp này không?",
  fileName: "Tên tệp"
}}
```

---

## ✨ Features

### **1. Upload Features**

#### **Multiple Upload Methods**

```javascript
// Method 1: Drag & Drop
<Paper onDrop={onDrop} onDragOver={onDragOver}>
  {/* Dropzone with visual feedback */}
</Paper>

// Method 2: File Picker Button
<Button component="label">
  Chọn tệp
  <input hidden type="file" multiple onChange={onPick} />
</Button>
```

#### **Progress Tracking**

```javascript
await uploadFiles(ownerType, ownerId, field, files, {
  onUploadProgress: (evt) => {
    setProgress(Math.round((evt.loaded * 100) / evt.total));
  },
});
```

#### **Validation**

```javascript
// Client-side validation BEFORE upload
const isTypeAllowed = (file) => {
  const mime = file.type?.toLowerCase();
  const ext = `.${file.name?.split(".").pop()?.toLowerCase()}`;

  return allowedTypes.some((pattern) => {
    if (pattern.endsWith("/*")) {
      return mime.startsWith(pattern.replace("/*", "/"));
    }
    if (pattern.startsWith(".")) {
      return ext === pattern;
    }
    return mime === pattern;
  });
};

const isSizeAllowed = (file) => {
  if (!maxSizeMB) return true;
  return file.size <= maxSizeMB * 1024 * 1024;
};
```

### **2. Display Features**

#### **File Icons (Emoji-based)**

```javascript
const getFileIcon = (filename, mimeType) => {
  if (mimeType?.includes("pdf")) return "📄";
  if (mimeType?.includes("image")) return "🖼️";
  if (mimeType?.includes("word")) return "📝";
  if (mimeType?.includes("excel")) return "📊";
  if (mimeType?.includes("powerpoint")) return "📋";
  if (mimeType?.includes("video")) return "🎥";
  if (mimeType?.includes("audio")) return "🎵";
  if (mimeType?.includes("zip")) return "🗜️";
  // ... fallback
  return "📎";
};
```

#### **File Size Formatting**

```javascript
const formatFileSize = (bytes) => {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};
```

### **3. Action Features**

#### **Preview (Inline Viewer)**

```javascript
const handlePreview = async (file) => {
  const res = await api.get(`attachments/files/${file._id}/inline`, {
    responseType: "blob",
  });

  const blob = res.data;
  const objectUrl = URL.createObjectURL(blob);

  // Open in new tab
  window.open(objectUrl, "_blank", "noopener,noreferrer");

  // Auto cleanup after 1 minute
  setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
};
```

#### **Download**

```javascript
const handleDownload = async (file) => {
  const res = await api.get(`attachments/files/${file._id}/download`, {
    responseType: "blob",
  });

  const blob = res.data;
  const url = URL.createObjectURL(blob);

  // Trigger browser download
  const a = document.createElement("a");
  a.href = url;
  a.download = file.TenGoc || "download";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 30_000);
};
```

#### **Delete (with Confirmation)**

```javascript
// Step 1: Show dialog
<IconButton onClick={() => setDeleteDialog({ open: true, file })}>
  <DeleteIcon />
</IconButton>;

// Step 2: Confirm
const onDeleteConfirm = async () => {
  await deleteFile(deleteDialog.file._id);
  await refresh(); // Reload list
  setDeleteDialog({ open: false, file: null });
};
```

---

## 💻 Usage Examples

### **Example 1: Basic Usage**

```jsx
import AttachmentSection from "shared/components/AttachmentSection";

function MyComponent({ recordId }) {
  return (
    <AttachmentSection
      ownerType="HopDong"
      ownerId={recordId}
      field="file"
      title="Tài liệu hợp đồng"
    />
  );
}
```

**Result**: Full-featured attachment manager với upload, preview, download, delete.

---

### **Example 2: Multiple Fields**

```jsx
function TapSanDetail({ tapsanId }) {
  return (
    <Box>
      {/* Field 1: Kế hoạch */}
      <AttachmentSection
        ownerType="TapSan"
        ownerId={tapsanId}
        field="kehoach"
        title="Kế hoạch tập san"
        allowedTypes={["application/pdf", ".docx"]}
        maxSizeMB={50}
      />

      {/* Field 2: Tệp tập san */}
      <AttachmentSection
        ownerType="TapSan"
        ownerId={tapsanId}
        field="file"
        title="Tệp tập san phát hành"
        allowedTypes={["application/pdf"]}
        maxSizeMB={100}
      />
    </Box>
  );
}
```

**Result**: 2 attachment sections độc lập cho cùng 1 entity.

---

### **Example 3: Permission-based**

```jsx
function SecureAttachments({ documentId, user }) {
  const canEdit = user?.role === "admin" || user?.isEditor;

  return (
    <AttachmentSection
      ownerType="Document"
      ownerId={documentId}
      field="file"
      canUpload={canEdit}
      canDelete={canEdit}
      canPreview={true}
      canDownload={true}
      onChange={({ total }) => {
        console.log(`Total files: ${total}`);
      }}
    />
  );
}
```

---

### **Example 4: File Type Restrictions**

```jsx
// Only PDF and images
<AttachmentSection
  ownerType="BaoCao"
  ownerId={baoCaoId}
  field="file"
  allowedTypes={["application/pdf", "image/*"]}
  maxSizeMB={20}
/>

// Only Office documents
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
```

---

### **Example 5: Custom Labels (i18n)**

```jsx
<AttachmentSection
  ownerType="Report"
  ownerId={reportId}
  field="file"
  labels={{
    pickBtn: "Choose Files",
    dropTitleIdle: "Drag & drop files here or",
    dropTitleActive: "Drop files now",
    totalFiles: "{n} files uploaded",
    uploading: "Uploading...",
    confirmDeleteTitle: "Delete File?",
  }}
/>
```

---

### **Example 6: With Callbacks**

```jsx
function MonitoredAttachments({ entityId }) {
  const [fileCount, setFileCount] = useState(0);

  return (
    <AttachmentSection
      ownerType="Entity"
      ownerId={entityId}
      field="file"
      onChange={({ items, total }) => {
        setFileCount(total);
        console.log("Files updated:", items);
      }}
      onError={(message) => {
        toast.error(message);
      }}
    />
  );
}
```

---

## 📱 Responsive Design

### **Mobile Optimizations**

#### **Grid Breakpoints**

```jsx
<Grid container spacing={2}>
  {files.map((file) => (
    <Grid item xs={12} key={file._id}>
      {" "}
      {/* Full width on mobile */}
      <Card>...</Card>
    </Grid>
  ))}
</Grid>
```

#### **Touch-friendly Actions**

```javascript
// Icon buttons với kích thước phù hợp
<IconButton size="small">
  {" "}
  {/* 40x40px touch target */}
  <PreviewIcon />
</IconButton>
```

#### **Text Overflow Handling**

```jsx
<Typography
  sx={{
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }}
  title={file.TenGoc} // Full name on hover
>
  {file.TenGoc}
</Typography>
```

#### **Responsive Dialog**

```jsx
<Dialog
  open={deleteDialog.open}
  maxWidth="sm"
  fullWidth // Responsive width
>
  ...
</Dialog>
```

### **Breakpoint Behavior**

| Screen Size        | Layout  | Changes                                                             |
| ------------------ | ------- | ------------------------------------------------------------------- |
| **xs (< 600px)**   | Mobile  | • Files full width<br>• Button stack vertical<br>• Simplified chips |
| **sm (600-960px)** | Tablet  | • Files full width<br>• Normal buttons<br>• Full info display       |
| **md+ (> 960px)**  | Desktop | • Optimal spacing<br>• Side-by-side actions<br>• Rich preview       |

---

## 🎨 Customization

### **Styling with sx prop**

Component không expose `sx` prop trực tiếp, nhưng có thể wrap:

```jsx
<Box sx={{ maxWidth: 800, mx: "auto" }}>
  <AttachmentSection {...props} />
</Box>
```

### **Theme Integration**

Component tự động sử dụng theme colors:

```javascript
sx={{
  bgcolor: "primary.50",      // Theme primary color
  borderColor: "grey.300",    // Theme grey palette
  color: "text.secondary",    // Theme text colors
}}
```

### **Custom Icons**

Để thay đổi icons, cần fork component hoặc wrap:

```jsx
// Custom wrapper
function CustomAttachmentSection(props) {
  return (
    <Box>
      <Typography variant="overline">📁 MY FILES</Typography>
      <AttachmentSection {...props} />
    </Box>
  );
}
```

---

## 🔧 Advanced Usage

### **Conditional Rendering**

```jsx
function ConditionalAttachments({ documentId, status }) {
  if (!documentId) {
    return <Alert severity="info">Lưu document trước khi upload file</Alert>;
  }

  if (status === "archived") {
    return (
      <AttachmentSection
        ownerType="Document"
        ownerId={documentId}
        field="file"
        canUpload={false}
        canDelete={false}
      />
    );
  }

  return (
    <AttachmentSection ownerType="Document" ownerId={documentId} field="file" />
  );
}
```

### **Programmatic Refresh**

Component tự động refresh khi `ownerId` thay đổi. Để force refresh:

```jsx
function MyComponent() {
  const [key, setKey] = useState(0);

  const forceRefresh = () => setKey((k) => k + 1);

  return (
    <>
      <Button onClick={forceRefresh}>Refresh Files</Button>
      <AttachmentSection key={key} {...props} />
    </>
  );
}
```

---

## 📦 Backend Requirements

Component yêu cầu backend endpoints:

```
POST   /api/attachments/:ownerType/:ownerId/:field/files
GET    /api/attachments/:ownerType/:ownerId/:field/files
GET    /api/attachments/:ownerType/:ownerId/:field/files/count
DELETE /api/attachments/files/:id
GET    /api/attachments/files/:id/inline
GET    /api/attachments/files/:id/download
```

✅ **Đã có sẵn** trong `giaobanbv-be/routes/attachments.api.js`

---

## 🔗 Related

- [Backend Architecture](./06_BACKEND_ARCHITECTURE.md)
- [API Reference](./08_API_REFERENCE.md)
- [Integration Guide](./05_INTEGRATION_GUIDE.md)

---

**Last Updated**: January 27, 2026  
**Component Version**: 1.0.0
