# Fix Input Focus Issue - ChamDiemKPITable

**Date:** October 15, 2025  
**Issue:** Input values jump to wrong TextField when typing scores  
**Root Cause:** Missing unique keys and TieuChiID references after cleanup

---

## 🐛 Problem Description

### User Report

> "Khi nhập điểm vào tiêu chí này thì giá trị lại tự động nhảy vào tiêu chí khác"

### Technical Analysis

**Symptoms:**

1. User types score in TextField A → value appears in TextField B
2. Focus is lost immediately after typing
3. Cursor jumps between inputs randomly

**Root Causes:**

1. **Missing unique id/name** - React can't track which input is focused
2. **TieuChiID lookup removed** - After cleanup, code still trying to match by ObjectId
3. **No useCallback** - Handler re-created on every render → React re-mounts inputs
4. **Missing key prop** - Array.map() using index as key (not unique)

---

## ✅ Solutions Applied

### 1. Added Unique Input IDs

**File:** `ChamDiemKPITable.js` (Line ~445)

```javascript
// ❌ BEFORE - No unique identifier
<TextField
  type="number"
  value={tieuChi.DiemDat || 0}
  onChange={(e) => handleScoreChange(nhiemVu._id, tcIdx, val)}
/>;

// ✅ AFTER - Unique id and name
{
  nhiemVu.ChiTietDiem.map((tieuChi, tcIdx) => {
    const inputId = `score-${nhiemVu._id}-${tcIdx}`; // Unique per input

    return (
      <TextField
        id={inputId}
        name={inputId}
        key={`${nhiemVu._id}-tc-${tcIdx}`} // Unique key for React
        type="number"
        value={tieuChi.DiemDat || 0}
        onChange={(e) => handleScoreChange(nhiemVu._id, tcIdx, val)}
        onFocus={(e) => e.target.select()} // Auto-select on focus
      />
    );
  });
}
```

**Impact:** React can now track each input separately

---

### 2. Fixed TieuChiID → Index Mapping

**File:** `ChamDiemKPITable.js` (Line ~91)

```javascript
// ❌ BEFORE - Trying to find TieuChiID (doesn't exist after cleanup)
const handleScoreChange = (nhiemVuId, tieuChiIndex, newScore) => {
  const nhiemVu = nhiemVuList.find((nv) => nv._id === nhiemVuId);
  const tieuChiId = nhiemVu.ChiTietDiem[tieuChiIndex].TieuChiID; // ← ERROR!
  onScoreChange(nhiemVuId, tieuChiId, newScore);
};

// ✅ AFTER - Direct index access
const handleScoreChange = useCallback(
  (nhiemVuId, tieuChiIndex, newScore) => {
    if (!readOnly && onScoreChange) {
      onScoreChange(nhiemVuId, tieuChiIndex, newScore); // Pass index directly
    }
  },
  [readOnly, onScoreChange]
);
```

**Impact:** No more ObjectId lookups, simpler logic

---

### 3. Updated Parent Component

**File:** `ChamDiemKPIDialog.js` (Line ~87)

```javascript
// ❌ BEFORE - Parameter named tieuChiId (misleading)
const handleScoreChange = (nhiemVuId, tieuChiId, newScore) => {
  dispatch(updateTieuChiScoreLocal(nhiemVuId, tieuChiId, newScore));
};

// ✅ AFTER - Renamed to tieuChiIndex (accurate)
const handleScoreChange = (nhiemVuId, tieuChiIndex, newScore) => {
  dispatch(updateTieuChiScoreLocal(nhiemVuId, tieuChiIndex, newScore));
};
```

---

### 4. Fixed Redux Action

**File:** `kpiSlice.js` (Line ~1168)

```javascript
// ❌ BEFORE - Parameter named tieuChiId
export const updateTieuChiScoreLocal =
  (nhiemVuId, tieuChiId, diemDat) => (dispatch) => {
    dispatch(
      slice.actions.updateTieuChiScore({ nhiemVuId, tieuChiId, diemDat })
    );
  };

// ✅ AFTER - Renamed to tieuChiIndex
export const updateTieuChiScoreLocal =
  (nhiemVuId, tieuChiIndex, diemDat) => (dispatch) => {
    dispatch(
      slice.actions.updateTieuChiScore({ nhiemVuId, tieuChiIndex, diemDat })
    );
  };
```

---

### 5. Fixed Redux Reducer

**File:** `kpiSlice.js` (Line ~314)

```javascript
// ❌ BEFORE - Looking up by TieuChiID
updateTieuChiScore(state, action) {
  const { nhiemVuId, tieuChiId, diemDat } = action.payload;
  const nhiemVu = state.currentNhiemVuList.find((nv) => nv._id === nhiemVuId);

  if (nhiemVu) {
    const tieuChi = nhiemVu.ChiTietDiem.find(
      (tc) => tc.TieuChiID === tieuChiId // ← ERROR: TieuChiID doesn't exist!
    );
    if (tieuChi) {
      tieuChi.DiemDat = diemDat;
      // ... recalculate
    }
  }
}

// ✅ AFTER - Direct array access by index
updateTieuChiScore(state, action) {
  const { nhiemVuId, tieuChiIndex, diemDat } = action.payload;
  const nhiemVu = state.currentNhiemVuList.find((nv) => nv._id === nhiemVuId);

  if (nhiemVu && nhiemVu.ChiTietDiem[tieuChiIndex]) {
    // Direct access by index
    nhiemVu.ChiTietDiem[tieuChiIndex].DiemDat = diemDat;

    // Recalculate scores...
    nhiemVu.TongDiemTieuChi = nhiemVu.ChiTietDiem.reduce((sum, tc) => {
      const score = (tc.DiemDat || 0) / 100;
      return sum + (tc.LoaiTieuChi === "GIAM_DIEM" ? -score : score);
    }, 0);

    nhiemVu.DiemNhiemVu = nhiemVu.TongDiemTieuChi * (nhiemVu.MucDoKho || 5);
  }

  // Recalculate total KPI...
}
```

**Impact:**

- ✅ No more `.find()` loops
- ✅ O(1) array access instead of O(n) search
- ✅ Works with self-contained ChiTietDiem (no TieuChiID)

---

## 📊 Files Changed

| File                   | Lines Changed | Type        |
| ---------------------- | ------------- | ----------- |
| `ChamDiemKPITable.js`  | ~10           | Component   |
| `ChamDiemKPIDialog.js` | ~3            | Component   |
| `kpiSlice.js`          | ~20           | Redux       |
| **Total**              | **~33 lines** | **3 files** |

---

## 🧪 Testing Checklist

- [x] Import useCallback
- [x] Add unique id/name to TextField
- [x] Add onFocus auto-select
- [x] Fix handleScoreChange signature
- [x] Update Redux action signature
- [x] Update Redux reducer logic
- [x] Add unique key to map
- [ ] **Test: Type in TextField A → value stays in A**
- [ ] **Test: Tab to TextField B → value appears in B**
- [ ] **Test: Click TextField C → auto-select all**
- [ ] **Test: Type multiple times → no focus loss**
- [ ] **Test: Save all → verify correct scores in DB**

---

## 🎯 Expected Behavior After Fix

### User Flow

```
1. User clicks TextField for "Hoàn thành đúng hạn"
   → Input auto-selects (onFocus)

2. User types "85"
   → Value appears in SAME TextField
   → No focus loss
   → Score calculation updates instantly

3. User tabs to next TextField ("Vi phạm quy định")
   → Focus moves to correct TextField
   → Previous value (85) stays in first TextField

4. User types "2"
   → Value appears in second TextField only
   → First TextField still shows "85"

5. User saves
   → MongoDB receives correct ChiTietDiem:
     [
       { TenTieuChi: "Hoàn thành đúng hạn", DiemDat: 85 },
       { TenTieuChi: "Vi phạm quy định", DiemDat: 2 }
     ]
```

---

## 📝 Key Learnings

### Why This Happened

1. **Schema cleanup removed TieuChiID** but code still referenced it
2. **Controlled inputs without unique keys** confuse React reconciliation
3. **Function re-creation** causes React to unmount/remount components

### Prevention

1. **Always add id/name** to form inputs in arrays
2. **Use useCallback** for event handlers in loops
3. **Unique keys** in map: `${parentId}-${childId}-${index}`
4. **Test inputs immediately** after schema changes

---

## 🔗 Related Issues

- ✅ `CODE_CLEANUP_SUMMARY.md` - Initial TieuChiID removal
- ✅ `QUICK_REFERENCE_NEW_SCHEMA.md` - Schema documentation
- 🆕 This fix - Frontend sync with backend changes

---

**Status:** ✅ Fixed - Ready for testing  
**Breaking Changes:** No (internal logic only)  
**Performance:** Improved (O(1) vs O(n) lookups)
