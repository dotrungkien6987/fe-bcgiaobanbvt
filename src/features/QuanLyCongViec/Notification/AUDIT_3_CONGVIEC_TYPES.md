# Audit Report: 3 CongViec Notification Types

**Date**: 2024-12-25  
**Audited Types**: congviec-binh-luan, congviec-cap-nhat-deadline, congviec-cap-nhat-tien-do

---

## 1. congviec-binh-luan (Bình luận công việc)

**Status**: 🔴 **ISSUES FOUND**

**Location**: [congViec.service.js:3317-3330](d:/project/webBV/giaobanbv-be/modules/workmanagement/services/congViec.service.js#L3317-L3330)

**Builder**: ✅ Used (`buildCongViecNotificationData`)

**Context Types**: ❌ **WRONG - Object passed instead of string**

**Templates**: 2 templates, recipientConfig ✅ correct (NguoiChinhID, NguoiThamGia)

**Variables**: ❌ **Missing 1 variable**

### Issues Found:

#### Issue 1: `nguoiBinhLuan` is Object, not String

```javascript
// Current (WRONG):
const nguoiBinhLuan = await NhanVien.findById(currentUser.NhanVienID)
  .select("Ten")
  .lean();
const notificationData = await buildCongViecNotificationData(congviec, {
  nguoiBinhLuan,  // ← Object: { _id, Ten }
  NoiDung: noiDung.trim().substring(0, 200),
  ...
});
```

**Problem**: Builder expects `context.tenNguoiComment` (string) but receives `context.nguoiBinhLuan` (object).

**Builder code**:

```javascript
TenNguoiComment: context.tenNguoiComment || "",  // ← expects string
```

**Impact**: `TenNguoiComment` will be empty string in notification data.

**Fix Required**:

```javascript
// Option 1: Pass tenNguoiComment directly
tenNguoiComment: nguoiBinhLuan?.Ten || "Người dùng",

// Option 2: Builder should handle both
TenNguoiComment: context.tenNguoiComment || context.nguoiBinhLuan?.Ten || "",
```

#### Issue 2: Wrong context field name `NoiDung` → `noiDungComment`

```javascript
// Current:
NoiDung: noiDung.trim().substring(0, 200),  // ← Wrong key name

// Builder expects:
NoiDungComment: context.noiDungComment || "",  // ← expects noiDungComment
```

**Impact**: Comment content will be empty in template.

#### Issue 3: Extra fields not used by builder

```javascript
// Passed but not used:
BinhLuanID: binhLuan._id.toString(),  // ← Not in builder
IsReply: !!parentId,                   // ← Not in builder
arrNguoiLienQuanID: [...],            // ← Not used (builder builds NguoiThamGia from congViec)
```

**Recommendation**: Remove unused fields to avoid confusion.

### Template Validation:

- **Template 1** (NguoiChinhID): `{{MaCongViec}} - Bình luận mới` | `{{TenNguoiComment}}: {{NoiDungComment}}`

  - ✅ MaCongViec: exists
  - ❌ TenNguoiComment: will be empty (wrong context field)
  - ❌ NoiDungComment: will be empty (wrong context field)

- **Template 2** (NguoiThamGia): Same as Template 1
  - ❌ Same issues

---

## 2. congviec-cap-nhat-deadline (Thay đổi deadline)

**Status**: 🔴 **ISSUES FOUND**

**Location**: [congViec.service.js:3061-3076](d:/project/webBV/giaobanbv-be/modules/workmanagement/services/congViec.service.js#L3061-L3076)

**Builder**: ✅ Used (`buildCongViecNotificationData`)

**Context Types**: ❌ **WRONG - Object passed instead of string**

**Templates**: 1 template, recipientConfig ✅ correct (NguoiChinhID)

**Variables**: ✅ All exist (but with issues)

### Issues Found:

#### Issue 1: `nguoiCapNhat` is Object, not String

```javascript
// Current (WRONG):
const performer = await NhanVien.findById(currentUser.NhanVienID)
  .select("Ten")
  .lean();
const notificationData = await buildCongViecNotificationData(congviec, {
  nguoiCapNhat: performer,  // ← Object: { _id, Ten }
  ...
});
```

**Problem**: Builder expects `context.tenNguoiCapNhat` (string) but receives `context.nguoiCapNhat` (object).

**Builder code**:

```javascript
TenNguoiCapNhat: context.tenNguoiCapNhat || "",  // ← expects tenNguoiCapNhat
```

**Impact**: `TenNguoiCapNhat` will be empty (though not used in this template).

**Fix Required**:

```javascript
tenNguoiCapNhat: performer?.Ten || "Người dùng",
```

#### Issue 2: Wrong context field names

```javascript
// Current:
DeadlineCu: oldValues.oldDeadline,    // ← Wrong: expects ngayHetHanCu
DeadlineMoi: oldValues.newDeadline,   // ← Wrong: expects NgayHetHanMoi (auto-calculated)

// Builder expects:
NgayHetHanCu: context.ngayHetHanCu || "",  // ← expects ngayHetHanCu
NgayHetHanMoi: congViec.NgayHetHan ? dayjs(...) : "",  // ← auto from congViec
```

**Impact**:

- `NgayHetHanCu` will be empty
- `NgayHetHanMoi` is calculated correctly from congViec (OK)

#### Issue 3: Unused field

```javascript
arrNguoiLienQuanID: uniqueNguoiLienQuan,  // ← Not used by builder
```

### Template Validation:

- **Template** (NguoiChinhID): `{{MaCongViec}} - Đổi deadline` | `Deadline đổi từ {{NgayHetHanCu}} → {{NgayHetHanMoi}}`
  - ✅ MaCongViec: exists
  - ❌ NgayHetHanCu: will be empty (wrong context field name)
  - ✅ NgayHetHanMoi: exists (auto-calculated from congViec)

---

## 3. congviec-cap-nhat-tien-do (Cập nhật tiến độ)

**Status**: ⚠️ **PARTIAL ISSUES**

**Location**: [congViec.service.js:449-467](d:/project/webBV/giaobanbv-be/modules/workmanagement/services/congViec.service.js#L449-L467)

**Builder**: ✅ Used (`buildCongViecNotificationData`)

**Context Types**: ❌ **WRONG - Object passed instead of string**

**Templates**: 1 template, recipientConfig ✅ correct (NguoiGiaoViecID)

**Variables**: ✅ All exist (but with issues)

### Issues Found:

#### Issue 1: `nguoiCapNhat` is Object, not String

```javascript
// Current (WRONG):
const performer = await NhanVien.findById(performerId).select("Ten").lean();
const notificationData = await buildCongViecNotificationData(cv, {
  nguoiCapNhat: performer,  // ← Object: { _id, Ten }
  ...
});
```

**Problem**: Builder expects `context.tenNguoiCapNhat` (string) but receives `context.nguoiCapNhat` (object).

**Builder code**:

```javascript
TenNguoiCapNhat: context.tenNguoiCapNhat || "",  // ← expects tenNguoiCapNhat
```

**Impact**: Template uses `{{TenNguoiCapNhat}}` - will be empty.

**Fix Required**:

```javascript
tenNguoiCapNhat: performer?.Ten || "Người dùng",
```

#### Issue 2: Extra fields not used

```javascript
// Passed but not used by builder:
TienDoCu: old,                        // ← Not in builder (could be useful)
GhiChu: ghiChu || "",                 // ← Not in builder
arrNguoiLienQuanID: [...],           // ← Not used
```

**Note**: `TienDoMoi` is correctly passed and exists in builder ✅

### Template Validation:

- **Template** (NguoiGiaoViecID): `{{MaCongViec}} - Tiến độ {{TienDoMoi}}%` | `{{TenNguoiCapNhat}} cập nhật tiến độ: {{TienDoMoi}}%`
  - ✅ MaCongViec: exists
  - ✅ TienDoMoi: exists (number, correctly passed)
  - ❌ TenNguoiCapNhat: will be empty (wrong context field name)

---

## Summary

**Total PASS**: 0/3  
**Context Type Issues**: 3/3 (all pass objects instead of strings)  
**Template Variable Issues**: 2/3 (binh-luan, cap-nhat-deadline have empty variables)  
**Field Name Mismatches**: 4 critical issues

### Critical Issues by Type:

1. **congviec-binh-luan**: 🔴 HIGH

   - 2 template variables will be empty
   - Wrong field names: `NoiDung` → `noiDungComment`, `nguoiBinhLuan` → `tenNguoiComment`

2. **congviec-cap-nhat-deadline**: 🔴 HIGH

   - 1 template variable will be empty (NgayHetHanCu)
   - Wrong field names: `DeadlineCu` → `ngayHetHanCu`, `nguoiCapNhat` → `tenNguoiCapNhat`

3. **congviec-cap-nhat-tien-do**: ⚠️ MEDIUM
   - 1 template variable will be empty (TenNguoiCapNhat)
   - Wrong field name: `nguoiCapNhat` → `tenNguoiCapNhat`

### Root Cause:

**Pattern mismatch between service calls and builder expectations:**

```javascript
// SERVICE PATTERN (WRONG):
const performer = await NhanVien.findById(...).select("Ten").lean();
buildCongViecNotificationData(cv, {
  nguoiCapNhat: performer,  // ← Passing OBJECT
  DeadlineCu: date,         // ← Wrong field name
});

// BUILDER EXPECTS:
TenNguoiCapNhat: context.tenNguoiCapNhat || "",  // ← Expects STRING with "ten" prefix
NgayHetHanCu: context.ngayHetHanCu || "",       // ← Expects "ngayHetHan" not "deadline"
```

### Recommendations:

#### 1. Fix Service Calls (Immediate)

Update all 3 notification calls to pass strings, not objects:

```javascript
// ✅ CORRECT PATTERN:
const performer = await NhanVien.findById(...).select("Ten").lean();
buildCongViecNotificationData(cv, {
  tenNguoiCapNhat: performer?.Ten || "Người dùng",  // ← String
  ngayHetHanCu: oldDeadlineFormatted,                // ← Correct field name
  noiDungComment: commentText,                        // ← Correct field name
  tenNguoiComment: commenter?.Ten || "Người dùng",   // ← String
});
```

#### 2. Remove Unused Fields

Clean up noise:

- Remove `arrNguoiLienQuanID` (builder builds this from congViec)
- Remove `BinhLuanID`, `IsReply` from binh-luan
- Remove `TienDoCu`, `GhiChu` from tien-do (or add to builder if needed)

#### 3. Add Builder Backward Compatibility (Optional)

To prevent future issues:

```javascript
// In builder:
TenNguoiCapNhat:
  context.tenNguoiCapNhat ||
  context.nguoiCapNhat?.Ten ||  // ← Handle old pattern
  "",
```

#### 4. Create Service Call Standard

Document the correct pattern in [notificationDataBuilders.js:1-15](d:/project/webBV/giaobanbv-be/modules/workmanagement/helpers/notificationDataBuilders.js#L1-L15):

```javascript
/**
 * IMPORTANT: When calling builders, pass STRINGS not OBJECTS:
 *
 * ✅ Correct:
 * buildCongViecNotificationData(cv, {
 *   tenNguoiCapNhat: performer.Ten,
 *   noiDungComment: "text"
 * });
 *
 * ❌ Wrong:
 * buildCongViecNotificationData(cv, {
 *   nguoiCapNhat: performerObject,  // NO!
 *   NoiDung: "text"                  // Wrong field name
 * });
 */
```

---

## Next Steps:

1. ✅ Fix `congviec-binh-luan` service call (2 field name fixes)
2. ✅ Fix `congviec-cap-nhat-deadline` service call (2 field name fixes)
3. ✅ Fix `congviec-cap-nhat-tien-do` service call (1 field name fix)
4. ✅ Test all 3 types with real notifications
5. ✅ Update builder JSDoc with usage examples
6. Consider: Add runtime validation in builder to detect object vs string mismatches

**Estimated Fix Time**: 15 minutes  
**Priority**: HIGH (users not receiving critical notification data)
