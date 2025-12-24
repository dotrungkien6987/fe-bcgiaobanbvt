# 🔧 COMMON PATTERNS - REFERENCE

> **Mục đích**: Quick reference cho các patterns dùng chung khi audit/implement
> **Cập nhật**: December 23, 2025

---

## 1. NOTIFICATION SERVICE USAGE

### 1.1. Basic Pattern

```javascript
const notificationService = require("../services/notificationService");

await notificationService.send({
  type: "type-code", // Kebab-case: "yeucau-tao-moi"
  data: {
    // IDs (String, không ObjectId)
    _id: entity._id.toString(),
    RecipientID: recipientId.toString(),

    // Display names (có fallback)
    TenNguoi: nguoi?.HoTen || "Người dùng",

    // Dates (formatted)
    Deadline: dayjs(entity.NgayHetHan).format("DD/MM/YYYY"),

    // Arrays (recipient candidates)
    arrNguoiNhan: recipients.map((id) => id.toString()),
  },
});
```

### 1.2. With Error Handling

```javascript
try {
  await notificationService.send({
    type: 'type-code',
    data: { ... }
  });
} catch (error) {
  // Log but don't fail the main operation
  console.error('Notification failed:', error.message);
}
```

---

## 2. RECIPIENT PATTERNS

### 2.1. Single Recipient

```javascript
// In template seed:
recipientConfig: {
  useVariables: ["NhanVienID"];
}

// In service:
data: {
  NhanVienID: entity.NhanVienID.toString();
}
```

### 2.2. Multiple Recipients (Array)

```javascript
// In template seed:
recipientConfig: {
  useVariables: ["arrNguoiLienQuan"];
}

// In service:
const arrNguoiLienQuan = [
  entity.NguoiGiaoID,
  entity.NguoiChinhID,
  ...(entity.NguoiThamGia || []),
]
  .filter(Boolean)
  .map((id) => id.toString());

data: {
  arrNguoiLienQuan;
}
```

### 2.3. From Config (CauHinhThongBaoKhoa)

```javascript
const cauHinh = await CauHinhThongBaoKhoa.findOne({ KhoaID: khoaId });
const arrNguoiDieuPhoiID =
  cauHinh?.DanhSachNguoiDieuPhoi.map((x) => x.NhanVienID.toString()) || [];

data: {
  arrNguoiDieuPhoiID;
}
```

### 2.4. Exclude Performer

```javascript
// NotificationService tự động exclude performer nếu có trong recipients
// Không cần xử lý thủ công
```

---

## 3. VARIABLE PATTERNS

### 3.1. IDs (Must be String)

```javascript
// ❌ Wrong
_id: entity._id; // ObjectId

// ✅ Correct
_id: entity._id.toString(); // String
```

### 3.2. Names (With Fallback)

```javascript
// ❌ Wrong - có thể null/undefined
TenNguoi: entity.NguoiID.HoTen;

// ✅ Correct - null safe + fallback
TenNguoi: entity.NguoiID?.HoTen || "Người dùng";
```

### 3.3. Nested Objects (After Populate)

```javascript
// ❌ Wrong - trước populate
TenKhoa: entity.KhoaID; // ObjectId

// ✅ Correct - sau populate
const populated = await Entity.findById(id).populate("KhoaID", "TenKhoa");
TenKhoa: populated.KhoaID?.TenKhoa || "Khoa";
```

### 3.4. Dates (Formatted)

```javascript
const dayjs = require("dayjs");

// ❌ Wrong
Deadline: entity.NgayHetHan; // Date object

// ✅ Correct
Deadline: entity.NgayHetHan
  ? dayjs(entity.NgayHetHan).format("DD/MM/YYYY")
  : "Không có hạn";
```

### 3.5. Arrays

```javascript
// ❌ Wrong - array of ObjectIds
NguoiThamGia: entity.NguoiThamGia;

// ✅ Correct - array of Strings
NguoiThamGia: (entity.NguoiThamGia || []).map((id) => id.toString());
```

---

## 4. TEMPLATE SYNTAX

### 4.1. Variable Interpolation

```javascript
// In template:
titleTemplate: "{{TenNguoi}} đã gửi yêu cầu {{MaYeuCau}}";

// Rendered:
("Nguyễn Văn A đã gửi yêu cầu YC-001");
```

### 4.2. Action URL

```javascript
actionUrlTemplate: "/ticket/yeucau/{{_id}}";
// → "/ticket/yeucau/507f1f77bcf86cd799439011"
```

### 4.3. Conditional Content (Not Supported)

```javascript
// ❌ Not supported - no conditionals
bodyTemplate: "{{#if LyDo}}Lý do: {{LyDo}}{{/if}}";

// ✅ Handle in service - use fallback
LyDo: entity.LyDo || "Không có lý do";
```

---

## 5. POPULATE PATTERNS

### 5.1. CongViec

```javascript
const congViec = await CongViec.findById(id)
  .populate("NguoiGiaoID", "HoTen Email")
  .populate("NguoiChinhID", "HoTen Email")
  .populate("NguoiThamGia", "HoTen Email")
  .populate("NhiemVuThuongQuyID", "TenNhiemVu");
```

### 5.2. YeuCau

```javascript
const yeuCau = await YeuCau.findById(id)
  .populate("KhoaYeuCauID", "TenKhoa MaKhoa")
  .populate("KhoaDichID", "TenKhoa MaKhoa")
  .populate("NguoiYeuCauID", "HoTen Email")
  .populate("NguoiXuLyID", "HoTen Email")
  .populate("LoaiYeuCauID", "Ten MoTa");
```

### 5.3. DanhGiaKPI

```javascript
const danhGia = await DanhGiaKPI.findById(id)
  .populate("NhanVienID", "HoTen Email")
  .populate("NguoiDanhGiaID", "HoTen Email")
  .populate("ChuKyDanhGiaID", "TenChuKy TuNgay DenNgay");
```

---

## 6. ERROR PATTERNS

### 6.1. Missing Type

```javascript
// Error: Notification type not found
// Solution: Check seeds/notificationTypes.js has this type code
```

### 6.2. Missing Template

```javascript
// Warning: No templates found for type
// Solution: Check seeds/notificationTemplates.js has matching typeCode
```

### 6.3. Missing Variable

```javascript
// Template: "Hello {{TenNguoi}}"
// Data: { TenNhanVien: "A" }  // Wrong key!
// Result: "Hello "            // Empty string

// Solution: Match variable names exactly
```

### 6.4. Recipients Empty

```javascript
// Warning: No valid recipients
// Causes:
// 1. arrNguoiLienQuan is empty
// 2. All recipients = performer (excluded)
// 3. Config not set up (CauHinhThongBaoKhoa)
```

---

## 7. USER VS NHANVIEN

### 7.1. Key Difference

```javascript
// NhanVien: Employee data (HoTen, PhongBan, etc.)
// User: Authentication (UserName, PassWord, NhanVienID)

// Relationship:
User.NhanVienID → NhanVien._id
```

### 7.2. Notification Recipients

```javascript
// ❌ Wrong: Using User._id
recipientConfig: {
  useVariables: ["userId"];
}

// ✅ Correct: Using NhanVienID (service resolves to User._id)
recipientConfig: {
  useVariables: ["NhanVienID"];
}

// Resolution in notificationService:
// NhanVienID → User.findOne({ NhanVienID }) → User._id
```

### 7.3. Getting NhanVienID from Auth

```javascript
// In controller
const userId = req.userId; // From JWT
const user = await User.findById(userId);
const nhanVienId = user.NhanVienID; // Use this for data
```

---

## 8. TESTING PATTERNS

### 8.1. Quick DB Check

```javascript
// After triggering notification:
db.notifications
  .find({
    type: "type-code",
    createdAt: { $gte: new Date(Date.now() - 60000) },
  })
  .pretty();
```

### 8.2. Check Template Exists

```javascript
db.notificationtemplates.findOne({ typeCode: "type-code" });
```

### 8.3. Check Type Exists

```javascript
db.notificationtypes.findOne({ code: "type-code" });
```

### 8.4. Check User Settings

```javascript
db.usernotificationsettings.findOne({ userId: ObjectId("...") });
```

---

## 9. DEBUGGING CHECKLIST

When notification doesn't work:

1. **Type exists?**

   ```javascript
   db.notificationtypes.findOne({ code: "type-code" });
   ```

2. **Template exists and enabled?**

   ```javascript
   db.notificationtemplates.findOne({ typeCode: "type-code", isEnabled: true });
   ```

3. **Service calls send()?**

   ```bash
   grep -n "type.*type-code" services/*.js
   ```

4. **Variables match?**

   - Extract vars from template: `{{var1}}`, `{{var2}}`
   - Check service data object has these keys

5. **Recipients valid?**

   - Check recipientConfig.useVariables
   - Check service provides these variables
   - Check values are String IDs

6. **User settings allow?**
   ```javascript
   db.usernotificationsettings.findOne({
     userId: recipientUserId,
     "preferences.type-code.inApp": true,
   });
   ```

---

## 9. ACTION URL PATTERNS

### 9.1. Basic URL Template

```javascript
// In template seed:
actionUrlTemplate: "/congviec/{{_id}}";

// In service:
data: {
  _id: congViec._id.toString(), // Must be String
};

// Rendered:
"/congviec/507f1f77bcf86cd799439011";
```

### 9.2. URL with Multiple Variables

```javascript
// ❌ WRONG - multiple entities not recommended
actionUrlTemplate: "/khoa/{{KhoaID}}/yeucau/{{_id}}";

// ✅ CORRECT - single entity URL (entity already knows its Khoa)
actionUrlTemplate: "/yeucau/{{_id}}";
```

### 9.3. URL Variable Validation

```javascript
// Template: "/congviec/{{_id}}"
// Required variables in data:
data: {
  _id: entity._id.toString(); // MUST exist
}

// Common mistakes:
// ❌ Missing variable: actionUrlTemplate: "/congviec/{{TaskID}}" but data has _id
// ❌ Variable not populated: data: { ChuKyID: objectId } → should be ChuKyID: chuKy._id.toString()
```

### 9.4. Frontend Route Matching

```javascript
// Template actionUrl:
actionUrlTemplate: "/congviec/{{_id}}";

// Must match frontend route in routes/index.js:
{
  path: "/congviec/:id",
  element: <CongViecDetail />
}

// Common issues:
// ❌ Template: "/task/{{_id}}" but frontend route: "/congviec/:id"
// ❌ Missing leading slash: "congviec/{{_id}}" → should be "/congviec/{{_id}}"
```

### 9.5. URL Null Safety

```javascript
// ❌ WRONG - entity might be null
actionUrlTemplate: "/yeucau/{{YeuCauID}}";
data: {
  YeuCauID: entity.YeuCauID.toString(), // ← crashes if entity is null
};

// ✅ CORRECT - with null check
const yeuCau = await YeuCau.findById(yeuCauId);
if (!yeuCau) {
  console.error("YeuCau not found");
  return;
}
data: {
  _id: yeuCau._id.toString(),
};
```

### 9.6. Common URL Issues Checklist

- [ ] Leading slash present: `/congviec/{{_id}}`
- [ ] Variables in URL exist in data object
- [ ] IDs are converted to String: `.toString()`
- [ ] Entity populated if needed for nested fields
- [ ] Frontend route exists for this URL pattern
- [ ] No hardcoded IDs in actionUrlTemplate

---

## 10. SEED FILE TEMPLATES

### 10.1. NotificationType

```javascript
{
  code: "module-action",
  name: "Tên tiếng Việt",
  description: "Mô tả chi tiết",
  category: "task" | "ticket" | "kpi",
  variables: [
    { name: "_id", type: "ObjectId", isRecipientCandidate: false, description: "ID entity" },
    { name: "NguoiNhanID", type: "ObjectId", isRecipientCandidate: true, description: "Người nhận" },
    { name: "TenNguoi", type: "String", isRecipientCandidate: false, description: "Tên hiển thị" }
  ]
}
```

### 10.2. NotificationTemplate

```javascript
{
  type: "TEMPLATE_NAME",
  typeCode: "module-action",
  name: "Tên template",
  titleTemplate: "📌 {{TenNguoi}} đã thực hiện hành động",
  bodyTemplate: "Chi tiết: {{MoTa}}. Mã: {{MaEntity}}",
  actionUrlTemplate: "/path/to/{{_id}}",
  recipientConfig: {
    useVariables: ["NguoiNhanID"]
  },
  category: "task" | "ticket" | "kpi",
  priority: "normal" | "high",
  isEnabled: true
}
```

---

_Quick reference patterns. Keep handy during audit sessions._
