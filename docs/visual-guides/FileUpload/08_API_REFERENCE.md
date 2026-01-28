# API REFERENCE - COMPLETE ENDPOINT DOCUMENTATION

## 📋 Mục lục

- [Generic Attachments API](#generic-attachments-api)
- [Legacy CongViec API](#legacy-congviec-api)
- [Legacy YeuCau API](#legacy-yeucau-api)
- [Common Patterns](#common-patterns)
- [Error Responses](#error-responses)

---

## 🌐 Generic Attachments API

**Base URL**: `/api/attachments`

### **Upload Files**

```http
POST /attachments/:ownerType/:ownerId/:field/files
```

**Description**: Upload một hoặc nhiều files cho entity.

**Parameters**:

- `ownerType` (path, required): Tên entity type (VD: "TapSan", "HopDong")
- `ownerId` (path, required): ID của entity
- `field` (path, optional): Tên field (default: "file")

**Request**:

```http
POST /api/attachments/TapSan/64f3cb6035c717ab00d75b8b/kehoach/files
Content-Type: multipart/form-data
Authorization: Bearer <jwt_token>

--boundary
Content-Disposition: form-data; name="files"; filename="kehoach.pdf"
Content-Type: application/pdf

<binary data>
--boundary
Content-Disposition: form-data; name="files"; filename="phuongan.docx"
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document

<binary data>
--boundary
Content-Disposition: form-data; name="moTa"

Kế hoạch tập san năm 2026
--boundary--
```

**Request Body**:

- `files` (array, required): Files to upload (FormData)
- `moTa` (string, optional): Description

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "_id": "64abc12345...",
      "TenGoc": "kehoach.pdf",
      "TenFile": "1738001234-a8c3ef-kehoach.pdf",
      "LoaiFile": "application/pdf",
      "KichThuoc": 2400000,
      "MoTa": "Kế hoạch tập san năm 2026",
      "uploader": {
        "_id": "64def...",
        "HoTen": "Nguyễn Văn A"
      },
      "createdAt": "2026-01-27T10:30:00.000Z",
      "updatedAt": "2026-01-27T10:30:00.000Z",
      "inlineUrl": "/api/attachments/files/64abc12345.../inline",
      "downloadUrl": "/api/attachments/files/64abc12345.../download"
    },
    {
      "_id": "64abc23456...",
      "TenGoc": "phuongan.docx"
      // ... similar structure
    }
  ],
  "message": "Đã tải lên 2 file"
}
```

**Error Responses**:

- `400 Bad Request`: Invalid parameters, file type not allowed
- `401 Unauthorized`: Missing or invalid token
- `413 Payload Too Large`: File size exceeds limit
- `500 Internal Server Error`: Server error

---

### **List Files**

```http
GET /attachments/:ownerType/:ownerId/:field/files
```

**Description**: Lấy danh sách files của entity.

**Parameters**:

- `ownerType` (path, required): Entity type
- `ownerId` (path, required): Entity ID
- `field` (path, optional): Field name (default: "file")

**Request**:

```http
GET /api/attachments/TapSan/64f3cb6035c717ab00d75b8b/kehoach/files
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "_id": "64abc12345...",
        "TenGoc": "kehoach.pdf",
        "TenFile": "1738001234-a8c3ef-kehoach.pdf",
        "LoaiFile": "application/pdf",
        "KichThuoc": 2400000,
        "MoTa": "Kế hoạch tập san",
        "uploader": {
          "_id": "64def...",
          "HoTen": "Nguyễn Văn A",
          "ChucDanh": "Biên tập viên"
        },
        "createdAt": "2026-01-27T10:30:00.000Z",
        "updatedAt": "2026-01-27T10:30:00.000Z",
        "inlineUrl": "/api/attachments/files/64abc12345.../inline",
        "downloadUrl": "/api/attachments/files/64abc12345.../download"
      }
    ]
  },
  "message": ""
}
```

---

### **Count Files**

```http
GET /attachments/:ownerType/:ownerId/:field/files/count
```

**Description**: Đếm số lượng files của entity.

**Request**:

```http
GET /api/attachments/TapSan/64f3cb6035c717ab00d75b8b/kehoach/files/count
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": 5,
  "message": ""
}
```

---

### **Preview File (Inline)**

```http
GET /attachments/files/:fileId/inline
```

**Description**: Xem file trực tiếp (mở trong browser).

**Parameters**:

- `fileId` (path, required): File ID

**Request**:

```http
GET /api/attachments/files/64abc12345.../inline
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```http
Content-Type: application/pdf
Content-Disposition: inline; filename="kehoach.pdf"
Content-Length: 2400000

<binary file data>
```

**Usage**: Frontend tạo blob URL để mở trong new tab.

---

### **Download File**

```http
GET /attachments/files/:fileId/download
```

**Description**: Tải file về máy.

**Parameters**:

- `fileId` (path, required): File ID

**Request**:

```http
GET /api/attachments/files/64abc12345.../download
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="kehoach.pdf"
Content-Length: 2400000

<binary file data>
```

**Usage**: Frontend tạo blob URL và trigger download.

---

### **Delete File**

```http
DELETE /attachments/files/:fileId
```

**Description**: Xóa file (soft delete).

**Parameters**:

- `fileId` (path, required): File ID

**Request**:

```http
DELETE /api/attachments/files/64abc12345...
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Đã xóa file"
  },
  "message": "Đã xóa file"
}
```

---

### **Update File Metadata**

```http
PATCH /attachments/files/:fileId
```

**Description**: Cập nhật mô tả file.

**Parameters**:

- `fileId` (path, required): File ID

**Request**:

```http
PATCH /api/attachments/files/64abc12345...
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "moTa": "Kế hoạch tập san năm 2026 (đã cập nhật)"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "_id": "64abc12345...",
    "TenGoc": "kehoach.pdf",
    "MoTa": "Kế hoạch tập san năm 2026 (đã cập nhật)"
    // ... other fields
  },
  "message": "Đã cập nhật file"
}
```

---

### **Batch Count**

```http
POST /attachments/batch-count
```

**Description**: Đếm files cho nhiều entities cùng lúc.

**Request**:

```http
POST /api/attachments/batch-count
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    { "ownerType": "TapSan", "ownerId": "64abc...", "field": "kehoach" },
    { "ownerType": "TapSan", "ownerId": "64abc...", "field": "file" },
    { "ownerType": "HopDong", "ownerId": "64def...", "field": "file" }
  ]
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "counts": [
      {
        "ownerType": "TapSan",
        "ownerId": "64abc...",
        "field": "kehoach",
        "count": 5
      },
      {
        "ownerType": "TapSan",
        "ownerId": "64abc...",
        "field": "file",
        "count": 2
      },
      {
        "ownerType": "HopDong",
        "ownerId": "64def...",
        "field": "file",
        "count": 8
      }
    ]
  },
  "message": ""
}
```

---

## 🔷 Legacy CongViec API

**Base URL**: `/api/workmanagement`

### **Create Comment với Files (Atomic)**

```http
POST /workmanagement/congviec/:congViecId/comments
```

**Description**: Tạo comment kèm files trong 1 transaction.

**Parameters**:

- `congViecId` (path, required): Task ID

**Request**:

```http
POST /api/workmanagement/congviec/64f3cb6035c717ab00d75b8b/comments
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="noiDung"

Đây là báo cáo tiến độ tuần này
--boundary
Content-Disposition: form-data; name="files"; filename="baocao.pdf"
Content-Type: application/pdf

<binary data>
--boundary
Content-Disposition: form-data; name="files"; filename="chart.png"
Content-Type: image/png

<binary data>
--boundary
Content-Disposition: form-data; name="parentId"

64abc12345...
--boundary--
```

**Request Body**:

- `noiDung` (string, optional): Comment text
- `files` (array, optional): Files to attach
- `parentId` (string, optional): Parent comment ID (for replies)

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "comment": {
      "_id": "64xyz...",
      "NoiDung": "Đây là báo cáo tiến độ tuần này",
      "CongViecID": "64f3cb...",
      "NguoiBinhLuanID": {
        "_id": "64def...",
        "HoTen": "Nguyễn Văn A"
      },
      "BinhLuanChaID": "64abc12345...",
      "Files": [
        {
          "_id": "64file1...",
          "TenGoc": "baocao.pdf",
          "TenFile": "1738001234-a8c3ef-baocao.pdf",
          "LoaiFile": "application/pdf",
          "KichThuoc": 2400000,
          "inlineUrl": "/api/workmanagement/files/64file1.../inline",
          "downloadUrl": "/api/workmanagement/files/64file1.../download"
        },
        {
          "_id": "64file2...",
          "TenGoc": "chart.png"
          // ... similar
        }
      ],
      "createdAt": "2026-01-27T10:30:00.000Z"
    },
    "files": [
      /* file DTOs */
    ]
  },
  "message": "Đã thêm bình luận với file đính kèm"
}
```

---

### **Upload Task Files (No Comment)**

```http
POST /workmanagement/congviec/:congViecId/files
```

**Description**: Upload files ở task-level (không liên quan comment).

**Parameters**:

- `congViecId` (path, required): Task ID

**Request**:

```http
POST /api/workmanagement/congviec/64f3cb6035c717ab00d75b8b/files
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="files"; filename="document.pdf"
Content-Type: application/pdf

<binary data>
--boundary--
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "_id": "64file...",
      "TenGoc": "document.pdf"
      // ... file DTO
    }
  ],
  "message": "Đã tải lên 1 file"
}
```

---

### **List Task Files**

```http
GET /workmanagement/congviec/:congViecId/files
```

**Description**: Lấy danh sách files của task (không bao gồm comment files).

**Request**:

```http
GET /api/workmanagement/congviec/64f3cb6035c717ab00d75b8b/files
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": [
    {
      "_id": "64file...",
      "TenGoc": "document.pdf",
      "TenFile": "1738001234-a8c3ef-document.pdf",
      "LoaiFile": "application/pdf",
      "KichThuoc": 1500000,
      "CongViecID": "64f3cb...",
      "BinhLuanID": null,
      "uploader": {
        "_id": "64def...",
        "HoTen": "Nguyễn Văn A"
      },
      "createdAt": "2026-01-27T09:00:00.000Z",
      "inlineUrl": "/api/workmanagement/files/64file.../inline",
      "downloadUrl": "/api/workmanagement/files/64file.../download"
    }
  ],
  "message": ""
}
```

---

### **Preview File**

```http
GET /workmanagement/files/:fileId/inline
```

**Description**: Xem file inline (mở trong browser).

**Request**:

```http
GET /api/workmanagement/files/64file.../inline
Authorization: Bearer <jwt_token>
```

**Response**: Binary file data với `Content-Disposition: inline`.

---

### **Download File**

```http
GET /workmanagement/files/:fileId/download
```

**Description**: Tải file về.

**Request**:

```http
GET /api/workmanagement/files/64file.../download
Authorization: Bearer <jwt_token>
```

**Response**: Binary file data với `Content-Disposition: attachment`.

---

### **Thumbnail (Public)**

```http
GET /workmanagement/files/:fileId/thumb
```

**Description**: Lấy thumbnail cho images (public, không cần auth).

**Request**:

```http
GET /api/workmanagement/files/64file.../thumb
```

**Response**: Resized image data.

---

### **Delete File**

```http
DELETE /workmanagement/files/:fileId
```

**Description**: Xóa file (soft delete).

**Request**:

```http
DELETE /api/workmanagement/files/64file...
Authorization: Bearer <jwt_token>
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "data": {
    "message": "Đã xóa file"
  },
  "message": "Đã xóa file"
}
```

---

## 🔶 Legacy YeuCau API

**Base URL**: `/api/workmanagement`

### **Create Comment với Files**

```http
POST /workmanagement/yeucau/:yeuCauId/comments
```

**Description**: Tạo comment kèm files cho ticket (tương tự CongViec).

**Parameters**:

- `yeuCauId` (path, required): Ticket ID

**Request/Response**: Tương tự CongViec API.

---

### **Upload Ticket Files**

```http
POST /workmanagement/yeucau/:yeuCauId/files
```

**Description**: Upload files cho ticket.

---

### **List Ticket Files**

```http
GET /workmanagement/yeucau/:yeuCauId/files
GET /workmanagement/yeucau/:yeuCauId/tep-tin  (legacy endpoint)
```

**Description**: Lấy danh sách files của ticket.

---

### **Delete Comment (với Files)**

```http
DELETE /workmanagement/yeucau/:yeuCauId/binh-luan/:commentId
```

**Description**: Xóa comment và files đính kèm.

---

### **File Operations**

Sử dụng chung endpoints với CongViec:

- `GET /workmanagement/files/:fileId/inline`
- `GET /workmanagement/files/:fileId/download`
- `DELETE /workmanagement/files/:fileId`

---

## 🔄 Common Patterns

### **Authentication Header**

Tất cả endpoints (trừ thumbnail) yêu cầu JWT token:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Token được lấy từ login response và store trong localStorage/Redux.

---

### **FormData Upload**

```javascript
const formData = new FormData();
formData.append("files", file1);
formData.append("files", file2);
formData.append("moTa", "Description");

await axios.post(url, formData, {
  headers: {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  },
  onUploadProgress: (evt) => {
    const progress = Math.round((evt.loaded * 100) / evt.total);
    console.log(`Upload ${progress}%`);
  },
});
```

---

### **Blob Download Pattern**

```javascript
const response = await axios.get(`/api/attachments/files/${fileId}/download`, {
  responseType: "blob",
});

const blob = response.data;
const url = URL.createObjectURL(blob);

// Trigger download
const a = document.createElement("a");
a.href = url;
a.download = filename;
a.click();

// Cleanup
setTimeout(() => URL.revokeObjectURL(url), 30000);
```

---

### **Blob Preview Pattern**

```javascript
const response = await axios.get(`/api/attachments/files/${fileId}/inline`, {
  responseType: "blob",
});

const blob = response.data;
const url = URL.createObjectURL(blob);

// Open in new tab
window.open(url, "_blank", "noopener,noreferrer");

// Cleanup after 1 minute
setTimeout(() => URL.revokeObjectURL(url), 60000);
```

---

## ⚠️ Error Responses

### **Standard Error Format**

```json
{
  "success": false,
  "errors": {
    "message": "Error description"
  },
  "message": "User-friendly error message"
}
```

### **Common Error Codes**

#### **400 Bad Request**

```json
{
  "success": false,
  "errors": {
    "message": "Loại file không được phép"
  },
  "message": "Loại file không được phép"
}
```

**Causes**:

- Invalid file type
- Missing required parameters
- Invalid entity ID format

---

#### **401 Unauthorized**

```json
{
  "success": false,
  "errors": {
    "message": "Token không hợp lệ"
  },
  "message": "Vui lòng đăng nhập lại"
}
```

**Causes**:

- Missing Authorization header
- Invalid/expired JWT token
- Token signature verification failed

---

#### **403 Forbidden**

```json
{
  "success": false,
  "errors": {
    "message": "Không có quyền thực hiện hành động này"
  },
  "message": "Không có quyền"
}
```

**Causes**:

- User doesn't own the entity
- Insufficient permissions (PhanQuyen level)
- Entity status doesn't allow action

---

#### **404 Not Found**

```json
{
  "success": false,
  "errors": {
    "message": "File không tồn tại"
  },
  "message": "Không tìm thấy file"
}
```

**Causes**:

- File ID doesn't exist
- File has been deleted (TrangThai = "DELETED")
- Entity not found

---

#### **413 Payload Too Large**

```json
{
  "success": false,
  "errors": {
    "message": "Tổng dung lượng vượt giới hạn"
  },
  "message": "File quá lớn"
}
```

**Causes**:

- Single file exceeds MAX_FILE_SIZE
- Total upload exceeds MAX_TOTAL_UPLOAD
- Request body too large

---

#### **500 Internal Server Error**

```json
{
  "success": false,
  "errors": {
    "message": "Internal server error"
  },
  "message": "Lỗi hệ thống. Vui lòng thử lại sau."
}
```

**Causes**:

- Database connection error
- Disk write failure
- Unexpected server exception

---

## 🔗 Related

- [Overview](./00_OVERVIEW.md)
- [Backend Architecture](./06_BACKEND_ARCHITECTURE.md)
- [Integration Guide](./05_INTEGRATION_GUIDE.md)

---

**Last Updated**: January 27, 2026  
**Version**: 1.0.0
