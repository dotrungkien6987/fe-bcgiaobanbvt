# CÔNG VIỆC - NOTIFICATION TRIGGER MAPPING

**Date:** December 24, 2025  
**Purpose:** Map all 19 Công việc notification types to their triggers before full audit  
**Status:** Mapping Complete ✅

---

## OVERVIEW

Công việc module has **19 notification types** across 2 trigger patterns:

### Pattern 1: State Machine Transitions (8 types)

Dynamic notification type generation: `congviec-${action.toLowerCase().replace(/_/g, '-')}`  
**Trigger Location:** `congViec.service.js` lines 2148-2159 (inside `transition()` function)

### Pattern 2: Direct Service Triggers (11 types)

Hardcoded notification type codes called from specific service methods  
**Trigger Locations:** Multiple functions throughout `congViec.service.js`

---

## DETAILED MAPPING

### GROUP A: State Machine Transitions (8 types)

**Notification Trigger Logic** (Lines 2148-2159):

```javascript
const actionTypeCode = action.toLowerCase().replace(/_/g, "-");
await notificationService.send({
  type: `congviec-${actionTypeCode}`,
  data: {
    _id: congviec._id.toString(),
    arrNguoiLienQuanID: [...new Set(arrNguoiLienQuanID)],
    MaCongViec: congviec.MaCongViec,
    TieuDe: congviec.TieuDe,
    TenNguoiThucHien: performer?.Ten || "Người thực hiện",
    HanhDong: action,
    TuTrangThai: prevState,
    DenTrangThai: conf.next,
    GhiChu: ghiChu || lyDo || "",
  },
});
```

**Shared Variables Provided:**

- `_id`: CongViec ID
- `arrNguoiLienQuanID`: [NguoiGiaoViecID, NguoiChinhID, ...NguoiThamGia] excluding performer
- `MaCongViec`: Task code (e.g., CV00001)
- `TieuDe`: Task title
- `TenNguoiThucHien`: Performer name
- `HanhDong`: Action constant (e.g., "GIAO_VIEC")
- `TuTrangThai`: Previous status
- `DenTrangThai`: New status
- `GhiChu`: Note/reason

#### 1. congviec-giao-viec

- **Action Constant:** `GIAO_VIEC`
- **Permission:** Assigner only
- **State Transition:** TAO_MOI → DA_GIAO
- **Trigger:** `transition()` function with action="GIAO_VIEC"
- **Line:** 2148-2159 (generic transition notification)
- **Status:** ✅ Active

#### 2. congviec-huy-giao

- **Action Constant:** `HUY_GIAO`
- **Permission:** Assigner only
- **State Transition:** DA_GIAO → TAO_MOI (REVERT)
- **Trigger:** `transition()` with action="HUY_GIAO"
- **Line:** 2148-2159
- **Status:** ✅ Active

#### 3. congviec-tiep-nhan

- **Action Constant:** `TIEP_NHAN`
- **Permission:** Main person only
- **State Transition:** DA_GIAO → DANG_THUC_HIEN
- **Trigger:** `transition()` with action="TIEP_NHAN"
- **Line:** 2148-2159
- **Status:** ✅ Active

#### 4. congviec-hoan-thanh-tam

- **Action Constant:** `HOAN_THANH_TAM`
- **Permission:** Main person only
- **State Transition:** DANG_THUC_HIEN → CHO_DUYET (when CoDuyetHoanThanh=true)
- **Trigger:** `transition()` with action="HOAN_THANH_TAM"
- **Line:** 2148-2159
- **Status:** ✅ Active

#### 5. congviec-huy-hoan-thanh-tam

- **Action Constant:** `HUY_HOAN_THANH_TAM`
- **Permission:** Assigner only
- **State Transition:** CHO_DUYET → DANG_THUC_HIEN (REVERT)
- **Trigger:** `transition()` with action="HUY_HOAN_THANH_TAM"
- **Line:** 2148-2159
- **Status:** ✅ Active

#### 6. congviec-duyet-hoan-thanh

- **Action Constant:** `DUYET_HOAN_THANH`
- **Permission:** Assigner only
- **State Transition:** CHO_DUYET → HOAN_THANH
- **Trigger:** `transition()` with action="DUYET_HOAN_THANH"
- **Line:** 2148-2159
- **Status:** ✅ Active

#### 7. congviec-hoan-thanh

- **Action Constant:** `HOAN_THANH`
- **Permission:** Main person only
- **State Transition:** DANG_THUC_HIEN → HOAN_THANH (when CoDuyetHoanThanh=false)
- **Trigger:** `transition()` with action="HOAN_THANH"
- **Line:** 2148-2159
- **Status:** ✅ Active

#### 8. congviec-mo-lai

- **Action Constant:** `MO_LAI_HOAN_THANH`
- **Permission:** Assigner only
- **State Transition:** HOAN_THANH → DANG_THUC_HIEN (REVERT)
- **Trigger:** `transition()` with action="MO_LAI_HOAN_THANH"
- **Line:** 2148-2159
- **Status:** ✅ Active
- **Note:** Type code in seed is "congviec-mo-lai", action is "MO_LAI_HOAN_THANH"

---

### GROUP B: Direct Service Triggers (11 types)

#### 9. congviec-binh-luan

- **Trigger Function:** `addComment()`
- **Line:** 3319
- **Variables Provided:**
  - `_id`: CongViec ID
  - `arrNguoiLienQuanID`: [NguoiGiaoViecID, NguoiChinhID, ...NguoiThamGia] excluding commenter
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiComment`: Commenter name
  - `NoiDungComment`: Comment content
- **Permission:** Anyone related to task
- **Status:** ✅ Active

#### 10. congviec-cap-nhat-tien-do

- **Trigger Function:** `updateProgress()`
- **Line:** 451
- **Variables Provided:**
  - `_id`: CongViec ID
  - `arrNguoiLienQuanID`: [NguoiGiaoViecID, NguoiChinhID, ...NguoiThamGia] excluding updater
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiCapNhat`: Updater name
  - `TienDocu`: Old progress (number)
  - `TienDoMoi`: New progress (number)
  - `GhiChu`: Note
- **Permission:** Main person only
- **Status:** ✅ Active

#### 11. congviec-cap-nhat-deadline

- **Trigger Function:** `updateCongViec()` (when NgayHetHan changes)
- **Line:** 3070
- **Variables Provided:**
  - `_id`: CongViec ID
  - `arrNguoiLienQuanID`: [NguoiGiaoViecID, NguoiChinhID, ...NguoiThamGia] excluding updater
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiCapNhat`: Updater name
  - `NgayHetHanCu`: Old deadline
  - `NgayHetHanMoi`: New deadline
- **Permission:** Owner or Admin
- **Status:** ✅ Active

#### 12. congviec-thay-doi-uu-tien

- **Trigger Function:** `updateCongViec()` (when MucDoUuTien changes)
- **Line:** 3095
- **Variables Provided:**
  - `_id`: CongViec ID
  - `arrNguoiLienQuanID`: [NguoiGiaoViecID, NguoiChinhID, ...NguoiThamGia] excluding updater
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiCapNhat`: Updater name
  - `MucDoUuTienCu`: Old priority
  - `MucDoUuTienMoi`: New priority
- **Permission:** Owner or Admin
- **Status:** ✅ Active

#### 13. congviec-thay-doi-nguoi-chinh

- **Trigger Function:** `updateCongViec()` (when NguoiChinhID changes)
- **Line:** 3130
- **Variables Provided:**
  - `_id`: CongViec ID
  - `arrNguoiLienQuanID`: [NguoiGiaoViecID, NguoiChinhID (old), NguoiChinhID (new), ...NguoiThamGia] excluding updater
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiCapNhat`: Updater name
  - `TenNguoiChinhCu`: Old main person name
  - `TenNguoiChinhMoi`: New main person name
- **Permission:** Owner or Admin
- **Status:** ✅ Active

#### 14. congviec-gan-nguoi-tham-gia

- **Trigger Function:** `updateCongViec()` (when adding participants to NguoiThamGia array)
- **Line:** 3152
- **Variables Provided:**
  - `_id`: CongViec ID
  - `NguoiDuocGanID`: Newly added participant ID (**recipient candidate**)
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiCapNhat`: Updater name
  - `TenNguoiDuocGan`: Newly added participant name
- **Permission:** Owner or Admin
- **Status:** ✅ Active
- **Note:** Sent per new participant (loop)

#### 15. congviec-xoa-nguoi-tham-gia

- **Trigger Function:** `updateCongViec()` (when removing participants from NguoiThamGia array)
- **Line:** 3175
- **Variables Provided:**
  - `_id`: CongViec ID
  - `NguoiBiXoaID`: Removed participant ID (**recipient candidate**)
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiCapNhat`: Updater name
  - `TenNguoiBiXoa`: Removed participant name
- **Permission:** Owner or Admin
- **Status:** ✅ Active
- **Note:** Sent per removed participant (loop)

#### 16. congviec-upload-file

- **Status:** ⚠️ NOT IMPLEMENTED IN SERVICE
- **Expected Trigger:** File upload endpoint
- **Variables Expected:**
  - `_id`: CongViec ID
  - `arrNguoiLienQuanID`: Related people
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiUpload`: Uploader name
  - `TenFile`: File name
- **Current State:** File upload exists but no notification trigger

#### 17. congviec-xoa-file

- **Status:** ⚠️ NOT IMPLEMENTED IN SERVICE
- **Expected Trigger:** File delete endpoint
- **Variables Expected:**
  - `_id`: CongViec ID
  - `arrNguoiLienQuanID`: Related people
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `TenNguoiXoa`: Deleter name
  - `TenFile`: File name
- **Current State:** File delete exists but no notification trigger

#### 18. congviec-deadline-approaching

- **Status:** ⚠️ AUTOMATED - NO SERVICE TRIGGER
- **Expected Trigger:** Agenda.js cron job in `deadlineScheduler.js`
- **Variables Expected:**
  - `_id`: CongViec ID
  - `NguoiChinhID`: Main person (recipient)
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `NgayHetHan`: Deadline
  - `NgayCanhBao`: Warning date
- **Current State:** Cron job handles this (similar to Deadline module pattern)

#### 19. congviec-deadline-overdue

- **Status:** ⚠️ AUTOMATED - NO SERVICE TRIGGER
- **Expected Trigger:** Agenda.js cron job in `deadlineScheduler.js`
- **Variables Expected:**
  - `_id`: CongViec ID
  - `NguoiChinhID`: Main person (recipient)
  - `MaCongViec`: Task code
  - `TieuDe`: Task title
  - `NgayHetHan`: Deadline (overdue)
- **Current State:** Cron job handles this (in notificationTypes.seed line 483, not grouped sequentially)

#### 20. congviec-tu-choi

- **Status:** ⚠️ INACTIVE (isActive: false in seed)
- **Expected Trigger:** Never implemented (feature removed)
- **Current State:** Type exists in seed but marked inactive, no service trigger

---

## SUMMARY

### Trigger Statistics:

- **State Machine Transitions:** 8 types ✅ (all via unified `transition()`)
- **Direct Service Calls:** 5 types ✅ implemented (binh-luan, cap-nhat-tien-do, cap-nhat-deadline, thay-doi-uu-tien, thay-doi-nguoi-chinh)
- **Direct Service Calls:** 2 types ✅ implemented (gan-nguoi-tham-gia, xoa-nguoi-tham-gia)
- **Missing Implementations:** 2 types ⚠️ (upload-file, xoa-file)
- **Automated (Cron):** 2 types ⚠️ (deadline-approaching, deadline-overdue)
- **Inactive:** 1 type ❌ (tu-choi)

### Audit Approach:

**Group 1: State Machine (8 types) - Batch Audit**

- All share same notification context/variables
- Only differ in action name and state transitions
- Template URL pattern likely `/cong-viec/{{_id}}`
- Recipient pattern: `arrNguoiLienQuanID` (all types)

**Group 2: Direct Triggers - Individual Audits**

- `binh-luan` (unique pattern - comments)
- `cap-nhat-tien-do` (unique pattern - progress tracking)
- `cap-nhat-deadline`, `thay-doi-uu-tien`, `thay-doi-nguoi-chinh` (similar field update pattern)
- `gan-nguoi-tham-gia`, `xoa-nguoi-tham-gia` (similar participant change pattern)

**Group 3: Special Cases**

- `upload-file`, `xoa-file`: Need implementation check (may need to add triggers)
- `deadline-approaching`, `deadline-overdue`: Verify cron job implementation in deadlineScheduler.js
- `tu-choi`: Skip (inactive)

---

## NEXT STEPS

1. ✅ **COMPLETE:** Mapping all 19 notification types to triggers
2. ⏳ **TODO:** Read all Công việc templates in notificationTemplates.seed.js
3. ⏳ **TODO:** Perform batch audit of 8 state machine types (Group 1)
4. ⏳ **TODO:** Perform detailed audits of unique patterns (Group 2: binh-luan, cap-nhat-tien-do, participant changes)
5. ⏳ **TODO:** Verify cron job patterns (deadline-approaching, deadline-overdue)
6. ⏳ **TODO:** Check file upload/delete endpoints for missing notification triggers
7. ⏳ **TODO:** Fix identified issues and re-seed
8. ⏳ **TODO:** Update 04_TEMPLATE_CHECKLIST.md with audit results

---

## COMPARISON WITH YEUCAU MODULE

### Similarities:

- Both have state machine transitions
- Both use `arrNguoiLienQuanID` pattern for recipients
- Both have comment notifications
- Both have field update notifications

### Differences:

- **YeuCau:** 17 types with more unique patterns (dieu-phoi, danh-gia, nhac-lai)
- **CongViec:** 19 types but simpler patterns (8 uniform state transitions + 5 field updates + 2 participant changes)
- **CongViec:** Has file notifications (not implemented) and deadline automations
- **CongViec:** Uses unified `transition()` function (cleaner architecture than YeuCau's state machine)

### Expected Issues (based on YeuCau experience):

1. ❗ **URL mismatch:** Templates likely use `/quan-ly-cong-viec/{{_id}}` instead of `/cong-viec/{{_id}}`
2. ❗ **Variable name mismatches:** Vietnamese vs English field names in templates vs context
3. ❗ **Recipient field issues:** May need to verify `arrNguoiLienQuanID` is properly populated
4. ❗ **Missing implementations:** upload-file, xoa-file triggers not found in service

---

**Report End**
