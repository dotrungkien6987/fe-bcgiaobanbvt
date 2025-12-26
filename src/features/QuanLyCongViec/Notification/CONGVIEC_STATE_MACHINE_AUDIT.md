# CongViec State Machine Audit - Quick Reference

**Date:** December 25, 2025  
**Status:** ✅ COMPLETE

---

## 🎯 Quick Summary

**CongViec DOES use state machine pattern** for workflow transitions.

- **Total state machine types:** 8
- **Builder usage:** ✅ 100% (all use `buildCongViecNotificationData`)
- **Template coverage:** ✅ 100% (all have templates)
- **Combined with direct calls:** 18 total CongViec notification types

---

## 📊 State Machine Transitions (8 types)

| Action Code          | From → To                   | Type Code                     | Status |
| -------------------- | --------------------------- | ----------------------------- | ------ |
| `GIAO_VIEC`          | TAO_MOI → DA_GIAO           | `congviec-giao-viec`          | ✅     |
| `HUY_GIAO`           | DA_GIAO → TAO_MOI           | `congviec-huy-giao`           | ✅     |
| `TIEP_NHAN`          | DA_GIAO → DANG_THUC_HIEN    | `congviec-tiep-nhan`          | ✅     |
| `HOAN_THANH_TAM`     | DANG_THUC_HIEN → CHO_DUYET  | `congviec-hoan-thanh-tam`     | ✅     |
| `HUY_HOAN_THANH_TAM` | CHO_DUYET → DANG_THUC_HIEN  | `congviec-huy-hoan-thanh-tam` | ✅     |
| `DUYET_HOAN_THANH`   | CHO_DUYET → HOAN_THANH      | `congviec-duyet-hoan-thanh`   | ✅     |
| `HOAN_THANH`         | DANG_THUC_HIEN → HOAN_THANH | `congviec-hoan-thanh`         | ✅     |
| `MO_LAI_HOAN_THANH`  | HOAN_THANH → DANG_THUC_HIEN | `congviec-mo-lai-hoan-thanh`  | ✅     |

---

## 🔧 Implementation Details

### Location

- **File:** `giaobanbv-be/modules/workmanagement/services/congViec.service.js`
- **Function:** `service.transition(id, payload, req)` (Lines 2004-2175)
- **Action Map:** `buildActionMap(cv)` (Lines 1914-2002)

### Notification Trigger

```javascript
// Automatic type code conversion: TIEP_NHAN → congviec-tiep-nhan
const actionTypeCode = action.toLowerCase().replace(/_/g, "-");

// Use centralized builder
const notificationData = await buildCongViecNotificationData(congviec, context);

// Send notification
await notificationService.send({
  type: `congviec-${actionTypeCode}`,
  data: notificationData,
});
```

### Builder Usage

✅ **All 8 transitions use:** `buildCongViecNotificationData()`

**Context provided:**

- `arrNguoiLienQuanID`: All related people (NguoiGiaoViec, NguoiChinh, NguoiThamGia)
- `nguoiThucHien`: Person who performed action
- `HanhDong`: Action name (TIEP_NHAN, etc.)
- `TuTrangThai`: Previous status
- `DenTrangThai`: New status
- `GhiChu`: Optional note/reason

---

## 📋 Direct Service Calls (Non-State Machine)

These are NOT part of state machine but also trigger CongViec notifications:

| Type Code                       | Location            | Already Audited |
| ------------------------------- | ------------------- | --------------- |
| `congviec-binh-luan`            | binhLuan.service.js | ✅ Tier 1       |
| `congviec-cap-nhat-deadline`    | congViec.service.js | ✅ Tier 1       |
| `congviec-gan-nguoi-tham-gia`   | congViec.service.js | ✅ Tier 1       |
| `congviec-xoa-nguoi-tham-gia`   | congViec.service.js | ✅ Tier 1       |
| `congviec-thay-doi-nguoi-chinh` | congViec.service.js | ✅ Tier 1       |
| `congviec-thay-doi-uu-tien`     | congViec.service.js | ✅ Tier 1       |
| `congviec-cap-nhat-tien-do`     | congViec.service.js | ✅ Tier 1       |
| `congviec-upload-file`          | tepTin.service.js   | ✅ Tier 1       |
| `congviec-sap-het-han`          | deadlineScheduler   | ✅ Tier 1       |
| `congviec-qua-han`              | deadlineScheduler   | ✅ Tier 1       |

---

## ✅ Complete CongViec Coverage

| Category            | Count  | Builder   | Templates | Status      |
| ------------------- | ------ | --------- | --------- | ----------- |
| State Machine       | 8      | ✅ 8/8    | ✅ 8/8    | ✅ Complete |
| Direct Service Call | 10     | ✅ 10/10  | ✅ 10/10  | ✅ Complete |
| **TOTAL**           | **18** | **18/18** | **18/18** | **✅ 100%** |

---

## 🎯 Conclusion

✅ **All CongViec notifications validated:**

- State machine: 8 types ✅
- Direct calls: 10 types ✅
- Builder coverage: 100% ✅
- Template coverage: 100% ✅

**No issues found. Architecture is solid.**

---

**Full Report:** [BUILDER_VALIDATION_REPORT.md](./BUILDER_VALIDATION_REPORT.md) (see CongViec State Machine Audit section)
