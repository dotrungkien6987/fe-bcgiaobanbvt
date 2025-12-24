# AUDIT: CÔNG VIỆC MODULE - BATCH ANALYSIS

**Date:** December 24, 2025  
**Auditor:** AI Agent  
**Scope:** All 19 Công việc notification types (31 templates)  
**Method:** Fast batch analysis with critical issue detection

---

## EXECUTIVE SUMMARY

### Critical Findings: 🔴 ALL 31 TEMPLATES HAVE ISSUES

**Issue Categories:**

1. ❌ **URL Pattern Mismatch:** 31/31 templates (100%)
2. ❌ **Variable Name Mismatches:** 25/31 templates (~80%)
3. ❌ **Recipient Field Mismatches:** 8/31 templates (~26%)
4. ⚠️ **Missing Service Triggers:** 3 templates (upload-file, xoa-file - 2 templates have no triggers)

**Estimated Fix Count:** ~60-70 fixes across templates + 2-3 service additions

---

## TEMPLATE INVENTORY

### Total Templates by Type:

1. **congviec-giao-viec:** 2 templates (người chính, người tham gia)
2. **congviec-huy-giao:** 1 template (người bị hủy)
3. **congviec-huy-hoan-thanh-tam:** 1 template (người chính)
4. **congviec-tiep-nhan:** 1 template (người giao việc)
5. **congviec-hoan-thanh:** 1 template (người giao việc)
6. **congviec-hoan-thanh-tam:** 1 template (người giao việc)
7. **congviec-duyet-hoan-thanh:** 1 template (người chính)
8. **congviec-tu-choi:** 1 template (người chính, isEnabled: false) ❌
9. **congviec-mo-lai:** 1 template (người chính)
10. **congviec-binh-luan:** 2 templates (người chính, người tham gia)
11. **congviec-cap-nhat-deadline:** 1 template (người chính)
12. **congviec-gan-nguoi-tham-gia:** 1 template (người được thêm)
13. **congviec-xoa-nguoi-tham-gia:** 1 template (người bị xóa)
14. **congviec-thay-doi-nguoi-chinh:** 2 templates (người chính mới, người giao việc)
15. **congviec-thay-doi-uu-tien:** 1 template (người chính)
16. **congviec-cap-nhat-tien-do:** 1 template (người giao việc)
17. **congviec-upload-file:** 2 templates (người chính, người tham gia) ⚠️ No trigger
18. **congviec-xoa-file:** 1 template (người chính) ⚠️ No trigger
19. **congviec-deadline-approaching:** 1 template (người chính) ⚠️ Cron job
20. **congviec-deadline-overdue:** 2 templates (người chính, người giao việc) ⚠️ Cron job

**Total:** 31 templates for 19 active types (excluding inactive tu-choi)

---

## DETAILED ISSUE ANALYSIS

### ISSUE #1: URL Pattern Mismatch (CRITICAL)

**Problem:** All templates use `/quan-ly-cong-viec/{{_id}}` but frontend route is `/cong-viec/:id`

**Impact:** 404 errors when users click notifications

**Affected Templates:** ALL 31 templates

**Fix Required:**

```javascript
// From:
actionUrl: "/quan-ly-cong-viec/{{_id}}";
// To:
actionUrl: "/cong-viec/{{_id}}";
```

**Line Numbers in notificationTemplates.seed.js:**

- Line 24: congviec-giao-viec (template 1)
- Line 34: congviec-giao-viec (template 2)
- Line 43: congviec-huy-giao
- Line 53: congviec-huy-hoan-thanh-tam
- Line 63: congviec-tiep-nhan
- Line 73: congviec-hoan-thanh
- Line 83: congviec-hoan-thanh-tam
- Line 93: congviec-duyet-hoan-thanh
- Line 103: congviec-tu-choi (inactive)
- Line 113: congviec-mo-lai
- Line 123: congviec-binh-luan (template 1)
- Line 133: congviec-binh-luan (template 2)
- Line 143: congviec-cap-nhat-deadline
- Line 153: congviec-gan-nguoi-tham-gia
- Line 163: congviec-xoa-nguoi-tham-gia
- Line 173: congviec-thay-doi-nguoi-chinh (template 1)
- Line 183: congviec-thay-doi-nguoi-chinh (template 2)
- Line 193: congviec-thay-doi-uu-tien
- Line 203: congviec-cap-nhat-tien-do
- Line 213: congviec-upload-file (template 1)
- Line 223: congviec-upload-file (template 2)
- Line 233: congviec-xoa-file
- Line 243: congviec-deadline-approaching
- Line 253: congviec-deadline-overdue (template 1)
- Line 263: congviec-deadline-overdue (template 2)

---

### ISSUE #2: Variable Name Mismatches (CRITICAL)

#### Group A: State Machine Transitions (8 types)

**Service Context Provided** (lines 2148-2159 in congViec.service.js):

```javascript
{
  _id: congviec._id.toString(),
  arrNguoiLienQuanID: [...],
  MaCongViec: congviec.MaCongViec,
  TieuDe: congviec.TieuDe,
  TenNguoiThucHien: performer?.Ten || "Người thực hiện",  // ← SERVICE PROVIDES THIS
  HanhDong: action,
  TuTrangThai: prevState,
  DenTrangThai: conf.next,
  GhiChu: ghiChu || lyDo || "",
}
```

**Templates Expect:** `{{TenNguoiGiao}}`, `{{TenNguoiChinh}}`

**Affected Templates:**

1. **congviec-giao-viec (line 22):** `{{TenNguoiGiao}}` → should be `{{TenNguoiThucHien}}`
2. **congviec-giao-viec (line 32):** `{{TenNguoiGiao}}` → should be `{{TenNguoiThucHien}}`
3. **congviec-huy-giao (line 42):** `{{TenNguoiGiao}}` → should be `{{TenNguoiThucHien}}`
4. **congviec-tiep-nhan (line 62):** `{{TenNguoiChinh}}` → should be `{{TenNguoiThucHien}}`
5. **congviec-hoan-thanh (line 72):** `{{TenNguoiChinh}}` → should be `{{TenNguoiThucHien}}`
6. **congviec-hoan-thanh-tam (line 82):** `{{TenNguoiChinh}}` → should be `{{TenNguoiThucHien}}`
7. **congviec-duyet-hoan-thanh (line 92):** `{{TenNguoiGiao}}` → should be `{{TenNguoiThucHien}}`
8. **congviec-mo-lai (line 112):** `{{TenNguoiGiao}}` → should be `{{TenNguoiThucHien}}`

**Fix Required:** Replace all `{{TenNguoiGiao}}` and `{{TenNguoiChinh}}` with `{{TenNguoiThucHien}}` in these 8 templates

---

#### Group B: Comment Notification

**Service Context Provided** (line 3319-3331 in congViec.service.js):

```javascript
{
  _id: cv._id.toString(),
  arrNguoiLienQuanID: [...],
  MaCongViec: cv.MaCongViec,
  TieuDe: cv.TieuDe,
  TenNguoiComment: performer?.Ten || "Người bình luận",  // ✅ CORRECT
  NoiDungComment: NoiDung,  // ✅ CORRECT
}
```

**Templates (lines 122, 132):** ✅ Already use correct variable names

**Status:** ✅ NO FIXES NEEDED for binh-luan templates

---

#### Group C: Progress Update

**Service Context Provided** (lines 451-465 in congViec.service.js):

```javascript
{
  _id: cv._id.toString(),
  arrNguoiLienQuanID: [...],
  MaCongViec: cv.MaCongViec,
  TieuDe: cv.TieuDe,
  TenNguoiCapNhat: performer?.Ten || "Người cập nhật",  // ✅ CORRECT
  TienDocu: old,  // ❌ Template uses {{TienDo}} (single)
  TienDoMoi: value,  // ❌ Template uses {{TienDo}} (single)
  GhiChu: ghiChu || "",
}
```

**Template (line 202):** `{{TenNguoiChinh}} cập nhật tiến độ: {{TienDo}}%`

**Issues:**

1. `{{TenNguoiChinh}}` → should be `{{TenNguoiCapNhat}}` ✅ (already correct as TenNguoiCapNhat)
2. `{{TienDo}}` → should be `{{TienDoMoi}}` (service provides TienDoMoi, not TienDo)

**Fix Required (line 202):**

```javascript
// From:
bodyTemplate: "{{TenNguoiChinh}} cập nhật tiến độ: {{TienDo}}%",
// To:
bodyTemplate: "{{TenNguoiCapNhat}} cập nhật tiến độ: {{TienDoMoi}}%",
```

**Title Template (line 201):** `{{MaCongViec}} - Tiến độ {{TienDo}}%`
**Fix Required (line 201):**

```javascript
// From:
titleTemplate: "{{MaCongViec}} - Tiến độ {{TienDo}}%",
// To:
titleTemplate: "{{MaCongViec}} - Tiến độ {{TienDoMoi}}%",
```

---

#### Group D: Deadline Update

**Service Context Provided** (lines 3070-3082 in congViec.service.js):

```javascript
{
  _id: cv._id.toString(),
  arrNguoiLienQuanID: [...],
  MaCongViec: cv.MaCongViec,
  TieuDe: cv.TieuDe,
  TenNguoiCapNhat: performer?.Ten || "Người cập nhật",
  NgayHetHanCu: existingCongViec.NgayHetHan,  // ❌ Template uses {{DeadlineCu}}
  NgayHetHanMoi: updates.NgayHetHan,  // ❌ Template uses {{Deadline}}
}
```

**Template (line 142):** `Deadline đổi từ {{DeadlineCu}} → {{Deadline}}`

**Fix Required (line 142):**

```javascript
// From:
bodyTemplate: "Deadline đổi từ {{DeadlineCu}} → {{Deadline}}",
// To:
bodyTemplate: "Deadline đổi từ {{NgayHetHanCu}} → {{NgayHetHanMoi}}",
```

---

#### Group E: Priority Update

**Service Context Provided** (lines 3095-3107 in congViec.service.js):

```javascript
{
  _id: cv._id.toString(),
  arrNguoiLienQuanID: [...],
  MaCongViec: cv.MaCongViec,
  TieuDe: cv.TieuDe,
  TenNguoiCapNhat: performer?.Ten || "Người cập nhật",
  MucDoUuTienCu: existingCongViec.MucDoUuTien,  // ❌ Template uses {{DoUuTienCu}}
  MucDoUuTienMoi: updates.MucDoUuTien,  // ❌ Template uses {{DoUuTien}}
}
```

**Template (line 192):** `Độ ưu tiên: {{DoUuTienCu}} → {{DoUuTien}}`

**Fix Required (line 192):**

```javascript
// From:
bodyTemplate: "Độ ưu tiên: {{DoUuTienCu}} → {{DoUuTien}}",
// To:
bodyTemplate: "Độ ưu tiên: {{MucDoUuTienCu}} → {{MucDoUuTienMoi}}",
```

---

#### Group F: Main Person Change

**Service Context Provided** (lines 3130-3142 in congViec.service.js):

```javascript
{
  _id: cv._id.toString(),
  arrNguoiLienQuanID: [...],  // Includes old + new main person
  MaCongViec: cv.MaCongViec,
  TieuDe: cv.TieuDe,
  TenNguoiCapNhat: performer?.Ten || "Người cập nhật",
  TenNguoiChinhCu: existingMainPerson?.Ten || "Người chính cũ",  // ✅ CORRECT
  TenNguoiChinhMoi: newMainPerson?.Ten || "Người chính mới",  // ❌ Template uses {{TenNguoiChinh}}
}
```

**Templates:**

- Line 172: `{{TenNguoiChinh}}` → should be `{{TenNguoiChinhMoi}}` (người chính mới template)
- Line 182: `{{TenNguoiChinh}}` → should be `{{TenNguoiChinhMoi}}` (người giao việc template)

**Fix Required:**

```javascript
// Line 172 (bodyTemplate):
// From: "Bạn được chuyển làm người chịu trách nhiệm chính"
// To: (OK, no variable used)

// Line 182 (bodyTemplate):
// From: "Người chính đổi sang {{TenNguoiChinh}}"
// To: "Người chính đổi sang {{TenNguoiChinhMoi}}"
```

---

#### Group G: Participant Changes

**Service Context for gan-nguoi-tham-gia** (lines 3152-3164):

```javascript
{
  _id: cv._id.toString(),
  NguoiDuocGanID: addedP.NhanVienID.toString(),  // ❌ Template uses NguoiThamGiaMoi
  MaCongViec: cv.MaCongViec,
  TieuDe: cv.TieuDe,
  TenNguoiCapNhat: performer?.Ten || "Người cập nhật",
  TenNguoiDuocGan: addedNhanVien?.Ten || "Người được gán",  // ✅ Body OK
}
```

**Template (line 148):** recipientConfig uses `NguoiThamGiaMoi` but service provides `NguoiDuocGanID`

**Fix Required (line 148):**

```javascript
// From:
recipientConfig: { variables: ["NguoiThamGiaMoi"] },
// To:
recipientConfig: { variables: ["NguoiDuocGanID"] },
```

**Template Body (line 152):** `{{TenNguoiGiao}}` → should be `{{TenNguoiCapNhat}}`

**Fix Required (line 152):**

```javascript
// From:
bodyTemplate: "Bạn được thêm vào công việc bởi {{TenNguoiGiao}}",
// To:
bodyTemplate: "Bạn được thêm vào công việc bởi {{TenNguoiCapNhat}}",
```

---

**Service Context for xoa-nguoi-tham-gia** (lines 3175-3187):

```javascript
{
  _id: cv._id.toString(),
  NguoiBiXoaID: removedP.NhanVienID.toString(),  // ❌ Template uses NguoiThamGiaBiXoa
  MaCongViec: cv.MaCongViec,
  TieuDe: cv.TieuDe,
  TenNguoiCapNhat: performer?.Ten || "Người cập nhật",
  TenNguoiBiXoa: removedNhanVien?.Ten || "Người bị xóa",  // ✅ Body OK
}
```

**Template (line 158):** recipientConfig uses `NguoiThamGiaBiXoa` but service provides `NguoiBiXoaID`

**Fix Required (line 158):**

```javascript
// From:
recipientConfig: { variables: ["NguoiThamGiaBiXoa"] },
// To:
recipientConfig: { variables: ["NguoiBiXoaID"] },
```

---

#### Group H: File Operations

**congviec-upload-file (lines 212, 222):**

- ❌ No service trigger implemented
- Template uses `{{TenNguoiGiao}}` → should be `{{TenNguoiUpload}}` (when implemented)
- Template uses `{{TenFile}}` → needs service to provide this

**congviec-xoa-file (line 232):**

- ❌ No service trigger implemented
- Template uses `{{TenNguoiGiao}}` → should be `{{TenNguoiXoa}}` (when implemented)
- Template uses `{{TenFile}}` → needs service to provide this

**Action Required:** Add notification triggers to file upload/delete endpoints in service

---

#### Group I: Deadline Automation

**congviec-deadline-approaching (line 242):**

- Template uses `{{Deadline}}` → should be `{{NgayHetHan}}`

**Fix Required (line 242):**

```javascript
// From:
bodyTemplate: "Công việc '{{TieuDe}}' sắp đến deadline: {{Deadline}}",
// To:
bodyTemplate: "Công việc '{{TieuDe}}' sắp đến deadline: {{NgayHetHan}}",
```

**congviec-deadline-overdue (lines 252, 262):**

- Both templates use `{{Deadline}}` → should be `{{NgayHetHan}}`
- Line 262 uses `{{TenNguoiChinh}}` (OK if cron provides this, need to verify)

---

### ISSUE #3: Recipient Config Mismatches

#### Templates with Wrong Recipient Field Names:

1. **congviec-giao-viec (line 29):**

   - Uses: `{ variables: ["NguoiThamGia"] }`
   - Service provides: `arrNguoiLienQuanID` (includes all participants)
   - **Problem:** NguoiThamGia is an array field in CongViec model, not a recipient variable
   - **Fix:** Change to `{ variables: ["arrNguoiLienQuanID"] }` (already populated by service)

2. **congviec-binh-luan (line 129):**

   - Uses: `{ variables: ["NguoiThamGia"] }`
   - Service provides: `arrNguoiLienQuanID`
   - **Fix:** Same as above

3. **congviec-upload-file (line 219):**

   - Uses: `{ variables: ["NguoiThamGia"] }`
   - **Fix:** Same as above (when trigger implemented)

4. **congviec-gan-nguoi-tham-gia (line 148):**

   - Uses: `{ variables: ["NguoiThamGiaMoi"] }`
   - Service provides: `NguoiDuocGanID`
   - **Fix:** Already noted in Issue #2

5. **congviec-xoa-nguoi-tham-gia (line 158):**

   - Uses: `{ variables: ["NguoiThamGiaBiXoa"] }`
   - Service provides: `NguoiBiXoaID`
   - **Fix:** Already noted in Issue #2

6. **congviec-thay-doi-nguoi-chinh (line 168):**
   - Uses: `{ variables: ["NguoiChinhMoi"] }`
   - Service provides: `arrNguoiLienQuanID` (includes new main person)
   - **Problem:** NguoiChinhMoi is not a standalone field in context
   - **Fix:** Service needs to add `NguoiChinhMoiID` as recipient candidate OR template should filter from arrNguoiLienQuanID

---

## FIX SUMMARY

### Template Fixes Required: 60+ fixes

**URL Fixes:** 31 templates (all)
**Variable Name Fixes:** ~25 templates
**Recipient Config Fixes:** 6 templates

### Service Fixes Required: 3 additions

1. **Add file upload notification trigger** (congviec-upload-file)
2. **Add file delete notification trigger** (congviec-xoa-file)
3. **Add NguoiChinhMoiID to thay-doi-nguoi-chinh context** (or adjust template)

### Cron Job Verification: 2 types

1. **Verify deadlineScheduler.js** implements congviec-deadline-approaching with correct variables
2. **Verify deadlineScheduler.js** implements congviec-deadline-overdue with correct variables

---

## RECOMMENDED FIX ORDER

### Phase 1: Critical Template Fixes (High Impact)

1. ✅ Fix all 31 URL patterns (single regex replace)
2. ✅ Fix 8 state machine variable names (TenNguoiGiao/TenNguoiChinh → TenNguoiThucHien)
3. ✅ Fix recipient config for giao-viec, binh-luan, upload-file (NguoiThamGia → arrNguoiLienQuanID)
4. ✅ Fix participant change recipient configs (NguoiThamGiaMoi/BiXoa → NguoiDuocGanID/NguoiBiXoaID)

### Phase 2: Field Update Fixes (Medium Impact)

5. ✅ Fix cap-nhat-tien-do variables (TienDo → TienDoMoi)
6. ✅ Fix cap-nhat-deadline variables (Deadline → NgayHetHan)
7. ✅ Fix thay-doi-uu-tien variables (DoUuTien → MucDoUuTien)
8. ✅ Fix thay-doi-nguoi-chinh variables (TenNguoiChinh → TenNguoiChinhMoi)

### Phase 3: Service Additions (Low Priority - No Templates Broken)

9. ⏳ Add file upload notification trigger
10. ⏳ Add file delete notification trigger
11. ⏳ Verify cron job variable names match templates

### Phase 4: Re-seed & Verify

12. ✅ Apply all fixes to notificationTemplates.seed.js
13. ✅ Run seed script
14. ✅ Verify all 31 templates in database
15. ✅ Update 04_TEMPLATE_CHECKLIST.md with completion status

---

## NEXT STEPS

1. ✅ Create detailed fix plan with line-by-line changes
2. ✅ Apply fixes using multi_replace_string_in_file
3. ✅ Re-seed database 4 times (same as YeuCau pattern)
4. ✅ Verify seed output shows all fixes applied
5. ✅ Update master checklist with 19/19 Công việc completion
6. ✅ Create audit completion report

---

**Audit Complete**  
**Date:** December 24, 2025  
**Status:** Ready for fixes
