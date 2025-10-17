# 🎯 KPI Scoring System - Version 2.1.1

## Critical Update: Corrected Scoring Formula

**Version:** 2.1.1  
**Date:** Current  
**Status:** ✅ PRODUCTION-READY

---

## 📋 Overview

This document describes the **correct KPI scoring formula** after discovering and fixing a critical bug in v2.1.0. The previous version incorrectly used a 0-10 dropdown scale. The actual business logic requires:

1. All scores divide by **100** (not by `GiaTriMax`)
2. **GIAM_DIEM** (penalty criteria) use **negative signs** in summation
3. No weight (`TrongSo`) per criterion (ignored)
4. `MucDoKho` (difficulty) ranges from **1.0 to 10.0** (decimals allowed)

---

## 🔢 Scoring Formula

### Individual Criterion Score

```javascript
// For TANG_DIEM (positive contribution)
DiemTieuChi = +(GiaTriThucTe / 100);

// For GIAM_DIEM (negative contribution)
DiemTieuChi = -(GiaTriThucTe / 100);
```

**Key Rule:** Always divide by 100, regardless of `GiaTriMax` value (which could be 3, 10, 100, etc.)

### Task Score

```javascript
TongDiemTieuChi = Sum(DiemTieuChi) // with +/- signs

DiemNhiemVu = MucDoKho × TongDiemTieuChi
```

### Total KPI Score

```javascript
TongDiemKPI = Sum(DiemNhiemVu); // across all tasks
```

---

## 📊 Scoring Examples

### Example 1: All TANG_DIEM (Positive Criteria)

**Task:** "Khám bệnh nhân" (Difficulty: 7.5)

| Criterion      | Type      | Actual Value | Formula    | Score     |
| -------------- | --------- | ------------ | ---------- | --------- |
| Tốc độ         | TANG_DIEM | 80           | +80/100    | +0.80     |
| Chất lượng     | TANG_DIEM | 90           | +90/100    | +0.90     |
| Thái độ        | TANG_DIEM | 95           | +95/100    | +0.95     |
| Hoàn thành     | TANG_DIEM | 3 (max=3)    | +3/100     | +0.03     |
| **Sum**        |           |              |            | **2.68**  |
| **Task Score** |           |              | 2.68 × 7.5 | **20.10** |

### Example 2: Mixed TANG_DIEM and GIAM_DIEM

**Task:** "Xét nghiệm" (Difficulty: 6.0)

| Criterion      | Type      | Actual Value | Formula           | Score     |
| -------------- | --------- | ------------ | ----------------- | --------- |
| Tốc độ         | TANG_DIEM | 80           | +80/100           | +0.80     |
| Sai sót        | GIAM_DIEM | 2 (max=10)   | -2/100            | **-0.02** |
| Chất lượng     | TANG_DIEM | 90           | +90/100           | +0.90     |
| Thái độ        | TANG_DIEM | 95           | +95/100           | +0.95     |
| **Sum**        |           |              | 0.8-0.02+0.9+0.95 | **2.63**  |
| **Task Score** |           |              | 2.63 × 6.0        | **15.78** |

### Example 3: High Penalty (GIAM_DIEM)

**Task:** "Tiêm chủng" (Difficulty: 8.0)

| Criterion      | Type      | Actual Value | Formula       | Score     |
| -------------- | --------- | ------------ | ------------- | --------- |
| Tốc độ         | TANG_DIEM | 70           | +70/100       | +0.70     |
| Sai sót        | GIAM_DIEM | 5 (max=10)   | -5/100        | **-0.05** |
| Chất lượng     | TANG_DIEM | 85           | +85/100       | +0.85     |
| **Sum**        |           |              | 0.7-0.05+0.85 | **1.50**  |
| **Task Score** |           |              | 1.50 × 8.0    | **12.00** |

---

## 🎨 UI Implementation

### Input Component

```javascript
<TextField
  type="number"
  value={tieuChi.DiemDat || 0}
  onChange={(e) => {
    const val = parseFloat(e.target.value) || 0;
    if (val < giaTriMin || val > giaTriMax) {
      return; // Validation
    }
    handleScoreChange(nhiemVu._id, tcIdx, val);
  }}
  inputProps={{
    min: giaTriMin,
    max: giaTriMax,
    step: 0.5,
  }}
  InputProps={{
    endAdornment: <InputAdornment>{tieuChi.DonVi || "%"}</InputAdornment>,
  }}
/>;
{
  tieuChi.LoaiTieuChi === "GIAM_DIEM" && (
    <Chip label="−" size="small" color="error" />
  );
}
```

### Calculation Functions

```javascript
const calculateTieuChiScore = useMemo(() => {
  return (tieuChi) => {
    const giaTriThucTe = tieuChi.DiemDat || 0;
    const baseScore = giaTriThucTe / 100; // Always divide 100

    if (tieuChi.LoaiTieuChi === "GIAM_DIEM") {
      return -baseScore; // Negative sign
    }
    return baseScore; // Positive
  };
}, []);

const calculateNhiemVuTotal = useMemo(() => {
  return (nhiemVu) => {
    const tongDiemTieuChi = nhiemVu.ChiTietDiem.reduce((sum, tc) => {
      return sum + calculateTieuChiScore(tc); // Sum with +/-
    }, 0);

    const mucDoKho = nhiemVu.MucDoKho || 5;
    return Math.round(mucDoKho * tongDiemTieuChi * 100) / 100;
  };
}, [calculateTieuChiScore]);
```

---

## ⚠️ Common Mistakes (Fixed in v2.1.1)

### ❌ WRONG (v2.1.0 Bug)

```javascript
// Bug 1: Using dropdown 0-10 instead of TextField
<Select value={score}>
  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
    <MenuItem value={val}>{val}</MenuItem>
  ))}
</Select>;

// Bug 2: Dividing by GiaTriMax
DiemTieuChi = GiaTriThucTe / GiaTriMax; // WRONG!

// Bug 3: Inverting formula for GIAM_DIEM
if (LoaiTieuChi === "GIAM_DIEM") {
  DiemTieuChi = (GiaTriMax - GiaTriThucTe) / 100; // WRONG!
}
```

### ✅ CORRECT (v2.1.1)

```javascript
// Fix 1: TextField with custom range
<TextField
  type="number"
  inputProps={{ min: giaTriMin, max: giaTriMax, step: 0.5 }}
  InputProps={{
    endAdornment: <InputAdornment>{donVi}</InputAdornment>,
  }}
/>;

// Fix 2: Always divide by 100
DiemTieuChi = GiaTriThucTe / 100; // CORRECT!

// Fix 3: Use negative sign for GIAM_DIEM
if (LoaiTieuChi === "GIAM_DIEM") {
  DiemTieuChi = -(GiaTriThucTe / 100); // CORRECT!
}
```

---

## 📐 Business Rules

### 1. Score Range Validation

- Each criterion has custom `GiaTriMin` and `GiaTriMax` from database
- Frontend validates input: `min ≤ input ≤ max`
- Step size: **0.5** (allows half-point precision)

### 2. Difficulty Level (`MucDoKho`)

- Range: **1.0 - 10.0**
- Decimals allowed (e.g., 7.5, 8.25)
- Default: **5.0** if not set

### 3. Perfect Score

**NOT FIXED AT 40!** Perfect score depends on `GiaTriMax` values:

```
Example 1:
- 4 criteria, all GiaTriMax=100
- Perfect sum: (100+100+100+100)/100 = 4.0
- Perfect score: 4.0 × 10 (max difficulty) = 40

Example 2:
- 3 criteria: GiaTriMax=[100, 100, 3]
- Perfect sum: (100+100+3)/100 = 2.03
- Perfect score: 2.03 × 10 = 20.3
```

### 4. Unit Display (`DonVi`)

| DonVi | Description | Example Criteria   |
| ----- | ----------- | ------------------ |
| %     | Percentage  | Tốc độ, Chất lượng |
| lỗi   | Error count | Sai sót            |
| phút  | Minutes     | Thời gian phản hồi |
| ca    | Cases       | Số ca hoàn thành   |

---

## 🔍 Testing Checklist

### Functional Tests

- [x] TextField accepts decimal input (step=0.5)
- [x] Validation prevents out-of-range values
- [x] GIAM_DIEM shows "−" chip indicator
- [x] InputAdornment displays correct unit
- [x] Real-time calculation updates
- [x] Expandable row shows formula breakdown
- [x] Grand total sums all task scores

### Edge Cases

- [x] All zero input → Total = 0
- [x] GiaTriMax = 3 (not 100) → Correct calculation
- [x] MucDoKho = 7.5 (decimal) → Correct multiplication
- [x] All GIAM_DIEM → Negative total (valid)
- [x] Input below min → Rejected
- [x] Input above max → Rejected

### Visual Tests

- [x] Tooltip shows range (min-max + unit)
- [x] TANG_DIEM cells: green background
- [x] GIAM_DIEM cells: red background
- [x] Formula breakdown: +/- signs visible
- [x] Responsive on mobile

---

## 🚀 Backend Requirements

### Model: `TieuChiDanhGia`

```javascript
{
  TenTieuChi: String,
  LoaiTieuChi: { type: String, enum: ["TANG_DIEM", "GIAM_DIEM"] },
  GiaTriMin: { type: Number, default: 0 },
  GiaTriMax: { type: Number, default: 10 },
  DonVi: { type: String, default: "%" }, // ✅ Added in v2.1.1
  TrongSoMacDinh: Number, // NOT USED in calculation
}
```

### Controller: `getChamDiemDetail`

```javascript
// ✅ Must populate DonVi field
const tieuChiList = await TieuChiDanhGia.find({
  isDeleted: { $ne: true },
})
  .select("TenTieuChi LoaiTieuChi TrongSo GiaTriMin GiaTriMax DonVi")
  .lean();

// ✅ Include DonVi in ChiTietDiem
ChiTietDiem: tieuChiList.map((tc) => ({
  TieuChiID: tc._id,
  TenTieuChi: tc.TenTieuChi,
  LoaiTieuChi: tc.LoaiTieuChi,
  GiaTriMin: tc.GiaTriMin || 0,
  GiaTriMax: tc.GiaTriMax || 10,
  DonVi: tc.DonVi || "%", // ✅ NEW
  DiemDat: 0,
}));
```

---

## 📝 Version History

### v2.1.1 (Current) - CRITICAL BUGFIX

**Changes:**

- ✅ Fixed scoring formula: All divide by 100
- ✅ Replaced Select dropdown with TextField
- ✅ Added GIAM_DIEM negative sign logic
- ✅ Updated expandable row with formula breakdown
- ✅ Added DonVi field to backend model
- ✅ Updated controller to populate DonVi

**Breaking Changes:**

- Existing scores from v2.1.0 may be incorrect (used 0-10 scale)
- Recommend re-scoring all evaluations

### v2.1.0 - UI REDESIGN (HAD BUG)

- ❌ Compact table layout (correct)
- ❌ Dropdown 0-10 (WRONG - should be TextField)
- ❌ No formula breakdown

### v2.0.x - PREVIOUS VERSIONS

- Feature-based KPI implementation
- Separate form dialogs per criterion

---

## 🎓 Key Learnings

1. **Never assume business logic without explicit confirmation**

   - Initial assumption: "0-10 rating like typical scoring"
   - Reality: "Custom ranges with divide-by-100 formula"

2. **GIAM_DIEM is NOT inverted formula**

   - Wrong: `(Max - Actual) / 100`
   - Correct: `-(Actual / 100)` (negative sign in summation)

3. **Perfect score is dynamic**

   - Depends on `GiaTriMax` values from database
   - NOT hardcoded to 40

4. **Visual indicators are critical**
   - Red background for GIAM_DIEM cells
   - "−" chip for penalty criteria
   - Formula breakdown in expandable row

---

## 📧 Support

For questions about the scoring system:

- Frontend: Check `ChamDiemKPITable.js` component
- Backend: Check `kpi.controller.js::getChamDiemDetail`
- Formula: Reference this document (SCORING_SYSTEM_V2.1.1.md)

**Last Updated:** Current session  
**Maintained By:** Development Team
