# KPI Notification Audit - Batch Analysis

**Date:** December 24, 2024  
**Module:** KPI (7 types, 7 templates)  
**Status:** ⏳ IN PROGRESS → ✅ COMPLETE

---

## 📊 Overview

| Metric                   | Count  |
| ------------------------ | ------ |
| Total Notification Types | 7      |
| Total Templates          | 7      |
| Service Triggers Found   | 7/7 ✅ |
| Issues Found             | 18     |

---

## 🔍 Type-by-Type Mapping

### 1. kpi-tao-danh-gia (Create Evaluation)

**Trigger:** `kpi.controller.js` lines 133-147  
**Context Data:**

```javascript
{
  _id: danhGiaKPI._id.toString(),
  arrNguoiNhanID: [NhanVienID],
  TenChuKy: chuKy?.TenChuKy || "Chu kỳ đánh giá",
  TenNhanVien: danhGiaKPI.NhanVienID?.HoTen || "Nhân viên",
  TenNguoiDanhGia: danhGiaKPI.NguoiDanhGiaID?.HoTen || "Người đánh giá",
}
```

**Template (line 568):**

- Recipients: `NhanVienID` ✅
- Title: `KPI {{TenChuKy}} - Tự đánh giá`
- Body: `Chu kỳ KPI {{TenChuKy}} đã được tạo. Vui lòng tự đánh giá.`
- URL: `/quan-ly-kpi/danh-gia/{{_id}}` ❌
- Variables used: `TenChuKy` ✅

**Issues:**

1. ❌ **URL mismatch**: Template uses `/quan-ly-kpi/danh-gia/` but actual route is `/quanlycongviec/kpi/danh-gia-nhan-vien`
   - Frontend route không có dynamic `:id` parameter
   - Notification click sẽ dẫn đến 404
2. ⚠️ **Unused variable**: Service gửi `TenNguoiDanhGia` nhưng template không dùng (minor issue)

---

### 2. kpi-duyet-danh-gia (Approve Evaluation)

**Trigger:** `kpi.controller.js` lines 677-691  
**Context Data:**

```javascript
{
  _id: updatedDanhGiaKPI._id.toString(),
  arrNguoiNhanID: [updatedDanhGiaKPI.NhanVienID?._id?.toString()],
  TenNhanVien: updatedDanhGiaKPI.NhanVienID?.HoTen || "Nhân viên",
  TenNguoiDuyet: updatedDanhGiaKPI.NguoiDuyet?.HoTen || "Người duyệt",  // ⚠️
  TenChuKy: updatedDanhGiaKPI.ChuKyDanhGiaID?.TenChuKy || "Chu kỳ đánh giá",
  TongDiemKPI: updatedDanhGiaKPI.TongDiemKPI || 0,
}
```

**Template (line 580):**

- Recipients: `NhanVienID` ✅
- Title: `KPI {{TenChuKy}} - Đã duyệt`
- Body: `KPI của bạn đã được {{TenNguoiDanhGia}} duyệt. Tổng điểm: {{TongDiemKPI}}`
- URL: `/quan-ly-kpi/danh-gia/{{_id}}` ❌
- Variables: `TenChuKy` ✅, `TenNguoiDanhGia` ❌, `TongDiemKPI` ✅

**Issues:**

1. ❌ **URL mismatch** (same as #1)
2. ❌ **Variable mismatch**: Template uses `{{TenNguoiDanhGia}}` but service sends `TenNguoiDuyet`
   - Will render as empty/undefined

---

### 3. kpi-duyet-tieu-chi (Approve Criteria)

**Trigger:** `kpi.controller.js` lines 1868-1882  
**Context Data:**

```javascript
{
  _id: danhGiaKPI._id.toString(),
  arrNguoiNhanID: [danhGiaKPI.NhanVienID?._id?.toString()],
  TenNhanVien: danhGiaKPI.NhanVienID?.HoTen || "Nhân viên",
  TenChuKy: danhGiaKPI.ChuKyDanhGiaID?.TenChuKy || "Chu kỳ đánh giá",
  TongDiemKPI: danhGiaKPI.TongDiemKPI || 0,
  // ❌ Missing: TenTieuChi, TenNguoiDanhGia
}
```

**Template (line 593):**

- Recipients: `NhanVienID` ✅
- Title: `KPI - Tiêu chí {{TenTieuChi}} đã duyệt`
- Body: `{{TenNguoiDanhGia}} đã duyệt tiêu chí {{TenTieuChi}}`
- URL: `/quan-ly-kpi/danh-gia/{{_id}}` ❌
- Variables: `TenTieuChi` ❌, `TenNguoiDanhGia` ❌

**Issues:**

1. ❌ **URL mismatch** (same as #1)
2. ❌ **Missing field**: Service doesn't send `TenTieuChi` (template will show "undefined")
3. ❌ **Missing field**: Service doesn't send `TenNguoiDanhGia`

**Root Cause:** This endpoint approves KPI based on ALL criteria (batch approval), not individual criteria. The notification should reflect this.

**Fix Strategy:**

- Option A: Change template to not reference specific criteria
- Option B: Add `TenNguoiDanhGia` to service data (simpler)

---

### 4. kpi-huy-duyet (Cancel Approval)

**Trigger:** `kpi.controller.js` lines 2252-2266  
**Context Data:**

```javascript
{
  _id: danhGiaKPIPopulated._id.toString(),
  arrNguoiNhanID: [danhGiaKPIPopulated.NhanVienID?._id?.toString()],
  TenNhanVien: danhGiaKPIPopulated.NhanVienID?.HoTen || "Nhân viên",
  TenNguoiHuyDuyet: currentUser.HoTen || "Người hủy duyệt",  // ⚠️
  TenChuKy: danhGiaKPIPopulated.ChuKyDanhGiaID?.TenChuKy || "Chu kỳ đánh giá",
  LyDo: lyDo || "Không có lý do",  // ⚠️
}
```

**Template (line 605):**

- Recipients: `NhanVienID` ✅
- Title: `KPI {{TenChuKy}} - Hủy duyệt`
- Body: `KPI bị hủy duyệt. Lý do: {{LyDoHuyDuyet}}`
- URL: `/quan-ly-kpi/danh-gia/{{_id}}` ❌
- Variables: `TenChuKy` ✅, `LyDoHuyDuyet` ❌

**Issues:**

1. ❌ **URL mismatch** (same as #1)
2. ❌ **Variable mismatch**: Template uses `{{LyDoHuyDuyet}}` but service sends `LyDo`
3. ⚠️ **Unused variable**: Service sends `TenNguoiHuyDuyet` but template doesn't use (minor)

---

### 5. kpi-cap-nhat-diem-ql (Update Manager Score)

**Trigger:** `kpi.controller.js` lines 500-518  
**Context Data:**

```javascript
{
  _id: danhGiaKPI._id.toString(),
  arrNguoiNhanID: [danhGiaKPI.NhanVienID?.toString()],
  TenNhanVien: employee?.Ten || "Nhân viên",
  TenNguoiDanhGia: manager?.Ten || "Quản lý",
  TenNhiemVu: nhiemVu?.TenNhiemVu || "Nhiệm vụ",  // ⚠️
  DiemNhiemVu: danhGiaNhiemVu.DiemNhiemVu || 0,
  TongDiemKPI: tongDiemKPI,
}
```

**Template (line 617):**

- Recipients: `NhanVienID` ✅
- Title: `KPI - Cập nhật điểm QL`
- Body: `{{TenNguoiDanhGia}} cập nhật điểm QL cho tiêu chí {{TenTieuChi}}`
- URL: `/quan-ly-kpi/danh-gia/{{_id}}` ❌
- Variables: `TenNguoiDanhGia` ✅, `TenTieuChi` ❌

**Issues:**

1. ❌ **URL mismatch** (same as #1)
2. ❌ **Variable mismatch**: Template uses `{{TenTieuChi}}` but service sends `TenNhiemVu`
   - In KPI v2, "nhiệm vụ" maps to criteria, so this is semantic mismatch

---

### 6. kpi-tu-danh-gia (Self Evaluation Complete)

**Trigger:** `assignment.controller.js` lines 171-187  
**Context Data:**

```javascript
{
  _id: assignment._id.toString(),
  arrNguoiNhanID: quanLy?.NhanVienQuanLy ? [quanLy.NhanVienQuanLy.toString()] : [],
  TenNhanVien: employee?.Ten || "Nhân viên",
  TenNhiemVu: nhiemVu?.TenNhiemVu || "Nhiệm vụ",
  DiemTuDanhGia: DiemTuDanhGia,
  // ❌ Missing: TenChuKy
}
```

**Template (line 630):**

- Recipients: `NguoiDanhGiaID` ❌ (service sends `arrNguoiNhanID` from QuanLy table)
- Title: `KPI {{TenChuKy}} - {{TenNhanVien}} hoàn thành`
- Body: `{{TenNhanVien}} đã hoàn thành tự đánh giá KPI`
- URL: `/quan-ly-kpi/danh-gia/{{_id}}` ❌
- Variables: `TenChuKy` ❌, `TenNhanVien` ✅

**Issues:**

1. ❌ **URL mismatch** (same as #1)
2. ❌ **Wrong \_id**: Service sends `assignment._id` (NhanVienNhiemVu ID) but URL expects DanhGiaKPI ID
3. ❌ **Missing field**: Service doesn't send `TenChuKy`
4. ⚠️ **Recipient config mismatch**: Template expects `NguoiDanhGiaID` but service manually constructs recipient array
   - Not critical since service explicitly sets `arrNguoiNhanID`

**Root Cause:** This trigger is for ASSIGNMENT self-evaluation (nhiệm vụ level), not KPI evaluation level. The notification structure doesn't match.

---

### 7. kpi-phan-hoi (Feedback on Evaluation)

**Trigger:** `kpi.controller.js` lines 806-820  
**Context Data:**

```javascript
{
  _id: danhGiaKPI._id.toString(),
  arrNguoiNhanID: [danhGiaKPI.NguoiDanhGiaID?.toString()],
  TenNhanVien: employee?.Ten || "Nhân viên",
  TenNguoiDanhGia: manager?.Ten || "Quản lý",
  PhanHoi: PhanHoiNhanVien?.substring(0, 100) || "Phản hồi mới",  // ⚠️
  TongDiemKPI: danhGiaKPI.TongDiemKPI || 0,
}
```

**Template (line 642):**

- Recipients: `NguoiDanhGiaID` ✅
- Title: `KPI - Phản hồi từ {{TenNhanVien}}`
- Body: `{{TenNhanVien}}: {{NoiDungPhanHoi}}`
- URL: `/quan-ly-kpi/danh-gia/{{_id}}` ❌
- Variables: `TenNhanVien` ✅, `NoiDungPhanHoi` ❌

**Issues:**

1. ❌ **URL mismatch** (same as #1)
2. ❌ **Variable mismatch**: Template uses `{{NoiDungPhanHoi}}` but service sends `PhanHoi`

---

## 📋 Issues Summary

### Critical Issues (12 fixes needed)

1. **URL Pattern (7 templates)**: All use `/quan-ly-kpi/danh-gia/{{_id}}`

   - Frontend route: `/quanlycongviec/kpi/danh-gia-nhan-vien` (no `:id` parameter)
   - **Impact:** CRITICAL - All notification clicks will 404
   - **Fix:** Change all URLs to `/quanlycongviec/kpi/danh-gia-nhan-vien`
   - Note: KPI page doesn't use URL params - shows list view by default

2. **Variable Mismatches (5 templates):**

   - `kpi-duyet-danh-gia`: `TenNguoiDanhGia` → `TenNguoiDuyet`
   - `kpi-huy-duyet`: `LyDoHuyDuyet` → `LyDo`
   - `kpi-cap-nhat-diem-ql`: `TenTieuChi` → `TenNhiemVu`
   - `kpi-phan-hoi`: `NoiDungPhanHoi` → `PhanHoi`
   - `kpi-tu-danh-gia`: Missing `TenChuKy` field

3. **Missing Service Fields (2 templates):**
   - `kpi-duyet-tieu-chi`: Missing `TenTieuChi`, `TenNguoiDanhGia`
   - `kpi-tu-danh-gia`: Missing `TenChuKy`, wrong `_id` (assignment vs evaluation)

### Medium Issues

4. **Semantic Mismatch (kpi-tu-danh-gia):**
   - Notification triggered at ASSIGNMENT level (nhiệm vụ)
   - But template references KPI EVALUATION level (chu kỳ)
   - URL points to DanhGiaKPI but \_id is NhanVienNhiemVu
   - **Impact:** HIGH - Wrong page navigation
   - **Fix:** Either:
     - A) Add DanhGiaKPIID to service context (recommended)
     - B) Change URL to assignment detail page
     - C) Send separate notification per criteria approval

### Low Issues

5. **Unused Variables (2 instances):**
   - `kpi-tao-danh-gia`: Service sends `TenNguoiDanhGia` (not used)
   - `kpi-huy-duyet`: Service sends `TenNguoiHuyDuyet` (not used)
   - **Impact:** LOW - No functional issue, just unused data

---

## 🔧 Fix Plan

### Strategy: Direct Template Fixes + 2 Service Updates

**Template Fixes (9 changes):**

1. Change all 7 URLs: `/quan-ly-kpi/danh-gia/{{_id}}` → `/quanlycongviec/kpi/danh-gia-nhan-vien`
2. `kpi-duyet-danh-gia`: `{{TenNguoiDanhGia}}` → `{{TenNguoiDuyet}}`
3. `kpi-huy-duyet`: `{{LyDoHuyDuyet}}` → `{{LyDo}}`
4. `kpi-cap-nhat-diem-ql`: `{{TenTieuChi}}` → `{{TenNhiemVu}}`
5. `kpi-phan-hoi`: `{{NoiDungPhanHoi}}` → `{{PhanHoi}}`

**Service Fixes (2 changes):**

1. `kpi.controller.js` line ~1868 (kpi-duyet-tieu-chi):

   - Add `TenNguoiDanhGia` field (from danhGiaKPI.NguoiDanhGiaID)
   - Option: Simplify template to remove specific criteria reference

2. `assignment.controller.js` line ~171 (kpi-tu-danh-gia):
   - Add `DanhGiaKPIID` lookup and send correct `_id`
   - Add `TenChuKy` field
   - Or: Change notification to assignment-level context

**Total Changes:** 11 fixes (9 template + 2 service)

---

## ✅ Execution Plan

### Phase 1: Template Fixes (Quick Win)

Apply all 9 template changes in single batch operation

### Phase 2: Service Enhancements

1. Fix `kpi-duyet-tieu-chi` context data
2. Fix `kpi-tu-danh-gia` context data and ID reference

### Phase 3: Verification

1. Re-seed templates
2. Manual testing of each notification type
3. Update checklist to 7/7 complete

---

**Next Steps:**

1. ✅ Apply template fixes (9 changes)
2. ✅ Apply service fixes (2 changes)
3. ✅ Re-seed database
4. ✅ Update 04_TEMPLATE_CHECKLIST.md
5. ✅ Mark KPI module complete (44/44 types = 100%)
