# ✅ Testing Checklist - Chênh lệch Fix

## 🎯 Objective

Verify logic chênh lệch hoạt động đúng sau khi fix bug "khoa mới hiển thị diff sai"

---

## 📋 Pre-Testing

- [x] Code đã sửa trong `helpers.js`
- [x] No lint errors
- [x] Files documentation đã tạo:
  - [x] `BUGFIX_CHENHLECH_BinhQuanBenhAn.md` (updated)
  - [x] `HOTFIX_CHENHLECH_09102025.md`
  - [x] `VISUAL_CHENHLECH_FIX.md`
  - [x] `TESTING_CHECKLIST_CHENHLECH.md` (this file)

---

## 🧪 Test Scenarios

### **Test 1: Ngày 1 của tháng**

**Setup:**

1. Chọn ngày: `1/10/2025`
2. Chọn ngày so sánh: `30/9/2025` (hoặc bất kỳ)

**Expected Results:**

- [ ] Tất cả khoa KHÔNG hiển thị mũi tên ▲/▼
- [ ] Tất cả diff values = 0 (kiểm tra qua console.log)
- [ ] Totals row KHÔNG hiển thị mũi tên
- [ ] UI chỉ hiển thị giá trị hiện tại

**Pass Criteria:**

```
✅ Nội A:     100 BN  (không có mũi tên)
✅ Ngoại B:    50 BN  (không có mũi tên)
✅ Tổng cộng: 150 BN  (không có mũi tên)
```

---

### **Test 2: Ngày thường - tất cả khoa có previous**

**Setup:**

1. Chọn ngày: `5/10/2025`
2. Chọn ngày so sánh: `4/10/2025`
3. Đảm bảo tất cả khoa có dữ liệu ở cả 2 ngày

**Expected Results:**

- [ ] Tất cả khoa HIỂN THỊ mũi tên ▲ (nếu tăng) hoặc ▼ (nếu giảm)
- [ ] Diff values = current - previous
- [ ] Totals row hiển thị tổng chênh lệch đúng
- [ ] Màu sắc đúng: Xanh (#00C49F) cho tăng, Đỏ (#bb1515) cho giảm

**Pass Criteria:**

```
✅ Nội A:     100 BN  ▲ +20 BN  (100 - 80 = 20)
✅ Ngoại B:    45 BN  ▼ -5 BN   (45 - 50 = -5)
✅ Tổng cộng: 145 BN  ▲ +15 BN  (20 - 5 = 15)
```

---

### **Test 3: Ngày thường - có khoa mới (CRITICAL)**

**Setup:**

1. Chọn ngày: `5/10/2025`
2. Chọn ngày so sánh: `4/10/2025`
3. Tạo tình huống: Khoa X có ở ngày 5/10 nhưng KHÔNG có ở ngày 4/10

**Expected Results:**

- [ ] Khoa mới KHÔNG hiển thị mũi tên ▲/▼
- [ ] Khoa mới diff value = 0 (kiểm tra console.log)
- [ ] Các khoa cũ vẫn hiển thị mũi tên bình thường
- [ ] Totals row KHÔNG tính diff của khoa mới

**Pass Criteria:**

```
✅ Nội A (cũ):    100 BN  ▲ +20 BN   (có previous)
✅ Ngoại B (mới):  50 BN               (KHÔNG có mũi tên - khoa mới)
✅ Tổng cộng:     150 BN  ▲ +20 BN   (chỉ tính diff của Nội A)
```

**🔴 Nếu FAIL:**

```
❌ Ngoại B (mới):  50 BN  ▲ +50 BN   (SAI - không nên có mũi tên!)
❌ Tổng cộng:     150 BN  ▲ +70 BN   (SAI - đang tính cả diff của khoa mới)
```

---

### **Test 4: Edge Cases**

#### **4.1: Không có dữ liệu ngày so sánh**

**Setup:**

1. Chọn ngày: `5/10/2025`
2. Chọn ngày so sánh: `1/1/2020` (ngày không có dữ liệu)

**Expected:**

- [ ] Tất cả khoa KHÔNG hiển thị mũi tên (như ngày 1)
- [ ] Tất cả diff = 0

---

#### **4.2: Giá trị không đổi**

**Setup:**

1. Khoa X: Ngày hiện tại = 100, Ngày trước = 100

**Expected:**

- [ ] diff = 0
- [ ] KHÔNG hiển thị mũi tên
- [ ] Chỉ hiển thị "100 BN"

---

#### **4.3: Khoa có giá trị = 0**

**Setup:**

1. Khoa X: Ngày hiện tại = 0, Ngày trước = 10

**Expected:**

- [ ] diff = -10
- [ ] Hiển thị "0 BN"
- [ ] Hiển thị "▼ -10 BN" (màu đỏ)

---

## 🔍 Console Debug

### **Thêm code debug:**

```javascript
// Trong BinhQuanBenhAn.js
const baseRows = useMemo(() => {
  const rows = Array.isArray(rowsFromStore) ? rowsFromStore : [];
  const prevRows = Array.isArray(rowsChenhLech) ? rowsChenhLech : [];
  const validRows = rows.filter((r) => r && r.TenKhoa && r.KhoaID);

  const result = calculateDifference(validRows, prevRows, ngay);

  // 🔍 DEBUG
  console.group("📊 Chênh lệch Debug");
  console.log("Ngày:", ngay);
  console.table(
    result.map((r) => ({
      KhoaID: r.KhoaID,
      TenKhoa: r.TenKhoa,
      Current: r.vienphi_count,
      Diff: r.vienphi_count_diff,
      Previous: r.vienphi_count - r.vienphi_count_diff,
    }))
  );
  console.groupEnd();

  return result;
}, [rowsFromStore, rowsChenhLech, ngay]);
```

### **Expected console output (Test 3 - có khoa mới):**

```
📊 Chênh lệch Debug
Ngày: 5

┌─────────┬─────────┬─────────────┬─────────┬──────┬──────────┐
│ (index) │ KhoaID  │   TenKhoa   │ Current │ Diff │ Previous │
├─────────┼─────────┼─────────────┼─────────┼──────┼──────────┤
│    0    │    1    │  'Nội A'    │   100   │  20  │    80    │ ✅
│    1    │    2    │ 'Ngoại B'   │    50   │  0   │    50    │ ✅ FIX!
└─────────┴─────────┴─────────────┴─────────┴──────┴──────────┘
```

---

## 📊 Visual Verification

### **Screenshot checklist:**

- [ ] Tab Nội trú - Ngày 1 (không có mũi tên)
- [ ] Tab Ngoại trú - Ngày 1 (không có mũi tên)
- [ ] Tab Nội trú - Ngày thường với khoa mới
- [ ] Tab Ngoại trú - Ngày thường với khoa mới
- [ ] Totals row - Tổng chênh lệch đúng

---

## 🎯 Acceptance Criteria

### **Must Pass:**

- [x] Code sửa đúng trong `helpers.js`
- [ ] Test 1 (Ngày 1): PASS ✅
- [ ] Test 2 (Tất cả khoa có previous): PASS ✅
- [ ] **Test 3 (Có khoa mới): PASS ✅** ← CRITICAL
- [ ] Test 4.1-4.3 (Edge cases): PASS ✅
- [ ] Console debug hiển thị đúng
- [ ] No errors trong console
- [ ] UI responsive (mobile + desktop)

### **Nice to Have:**

- [ ] Performance không giảm
- [ ] Animation mượt mà
- [ ] Color contrast đủ (accessibility)

---

## 🚀 Deployment Checklist

- [ ] Tất cả tests PASS
- [ ] Code review approved
- [ ] Documentation updated
- [ ] User manual updated (nếu cần)
- [ ] Backup cơ sở dữ liệu
- [ ] Deploy to staging
- [ ] UAT (User Acceptance Testing)
- [ ] Deploy to production
- [ ] Monitor logs for errors

---

## 📝 Test Results

**Tester:** ********\_\_\_********  
**Date:** ********\_\_\_********  
**Version:** ********\_\_\_********

**Overall Status:**

- [ ] ✅ PASS - Ready for production
- [ ] ⚠️ PARTIAL - Needs minor fixes
- [ ] ❌ FAIL - Needs major rework

**Notes:**

```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

---

## 🐛 Known Issues (if any)

```
_______________________________________________________
_______________________________________________________
_______________________________________________________
```

---

**Testing completed:** [ ] YES [ ] NO  
**Approved for release:** [ ] YES [ ] NO  
**Signature:** ********\_\_\_********
