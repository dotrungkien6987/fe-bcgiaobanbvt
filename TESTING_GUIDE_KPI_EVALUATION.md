# KPI Evaluation System - Testing Guide

## 🚀 Quick Start

### Prerequisites

1. Backend server running with new KPI APIs
2. Frontend development server running
3. Test user with manager role (VaiTro >= 2)
4. Test data:
   - At least 1 active ChuKyDanhGia (evaluation cycle)
   - At least 1 employee managed by test user
   - At least 1 NhanVienNhiemVu assignment in the cycle

---

## 📋 Test Scenarios

### Scenario 1: Basic Evaluation Flow ✅

**Steps:**

1. Login as manager user
2. Navigate to: `/quanlycongviec/kpi/danh-gia-nhan-vien`
3. Select cycle from dropdown (e.g., "Q1/2025")
4. Verify employee table displays with columns:
   - Họ tên
   - Số nhiệm vụ
   - Tổng độ khó
   - Điểm KPI (initially "Chưa tính")
5. Click [Đánh giá] button for an employee
6. Dialog opens showing task list
7. Verify columns:
   - Nhiệm vụ (task name)
   - Độ khó (difficulty - should show value from assignment, e.g., 7.5)
   - Điểm tự đánh giá (input field)
   - Điểm QL đánh giá (input field)
   - Ghi chú (notes textarea)
8. Enter scores (0-10 range) in both columns
9. Enter notes (optional)
10. Click [Lưu đánh giá]
11. Verify success toast: "Lưu đánh giá thành công"
12. Verify KPI result shows in green alert box
13. Click [Đóng]
14. Back to main page, verify KPI score now displayed

**Expected Results:**

- ✅ All components render without errors
- ✅ Task list shows correct difficulty from assignment (NOT default 5.0)
- ✅ Scores save successfully
- ✅ KPI calculated correctly: Σ(AvgScore × MucDoKho) / Σ(MucDoKho)
- ✅ Classification correct (Xuất sắc/Giỏi/Khá/Trung bình/Yếu)

---

### Scenario 2: Input Validation ✅

**Steps:**

1. Open evaluation dialog
2. Try entering invalid scores:
   - Negative number (e.g., -1)
   - Number > 10 (e.g., 11)
   - Non-numeric text
3. Verify input rejected (not accepted)
4. Enter valid scores (0-10)
5. Leave some rows empty
6. Click [Lưu]

**Expected Results:**

- ✅ Invalid inputs rejected
- ✅ Only rows with at least one score are saved
- ✅ Empty rows ignored (no error)

---

### Scenario 3: View KPI Button ✅

**Steps:**

1. After evaluating an employee
2. Click [Xem KPI] button on main page
3. Verify success toast with score

**Expected Results:**

- ✅ KPI score displayed
- ✅ Classification shown
- ✅ Score matches manual calculation

---

### Scenario 4: Multiple Employees ✅

**Steps:**

1. Select cycle with multiple employees
2. Evaluate employee A
3. Verify KPI score for A
4. Evaluate employee B
5. Verify KPI score for B
6. Verify both scores persist in table

**Expected Results:**

- ✅ Each employee's scores saved independently
- ✅ KPI calculations correct for each
- ✅ Table shows all scores

---

### Scenario 5: Edit Existing Evaluation ✅

**Steps:**

1. Open evaluation dialog for previously evaluated employee
2. Verify existing scores pre-populated
3. Modify scores
4. Save
5. Verify updated KPI

**Expected Results:**

- ✅ Existing scores loaded correctly
- ✅ Updates saved (not duplicated)
- ✅ KPI recalculated

---

### Scenario 6: Empty State Handling ✅

**Test 6A: No Cycles**

- Clear all cycles
- Load page
- Verify: Empty dropdown with message

**Test 6B: No Employees**

- Select cycle with no assignments
- Verify: Warning message "Không có nhân viên nào"

**Test 6C: No Tasks**

- Select employee with no assignments
- Click [Đánh giá]
- Verify: Dialog shows "Nhân viên chưa được giao nhiệm vụ nào"

**Expected Results:**

- ✅ Graceful handling of empty states
- ✅ Clear user messages
- ✅ No crashes/errors

---

## 🔍 Manual Testing Checklist

### UI/UX Tests

- [ ] Page loads without console errors
- [ ] Cycle dropdown populates
- [ ] Employee table renders with all columns
- [ ] Color-coded chips display correctly (difficulty, KPI)
- [ ] Dialog opens smoothly
- [ ] Table scrolls properly in dialog
- [ ] Buttons disabled appropriately (no tasks, loading states)
- [ ] Loading spinners show during API calls
- [ ] Toast notifications appear for success/error

### Data Integrity Tests

- [ ] MucDoKho from assignment (e.g., 7.5) NOT template default (5.0)
- [ ] Self-evaluation scores persist
- [ ] Manager evaluation scores persist
- [ ] Notes persist
- [ ] KPI formula correct: Σ(AvgScore × MucDoKho) / Σ(MucDoKho)
- [ ] Classification thresholds correct:
  - Xuất sắc: ≥ 9.0
  - Giỏi: ≥ 8.0
  - Khá: ≥ 7.0
  - Trung bình: ≥ 5.0
  - Yếu: < 5.0

### Edge Cases

- [ ] Score = 0 (minimum)
- [ ] Score = 10 (maximum)
- [ ] Score with decimals (e.g., 8.5)
- [ ] Very long task names (text wrapping)
- [ ] Very long notes (textarea expansion)
- [ ] Many tasks (10+) - scrolling
- [ ] Network error handling

---

## 🐛 Common Issues & Fixes

### Issue: Tasks not loading

**Symptom:** Dialog shows "Nhân viên chưa được giao nhiệm vụ nào"
**Checks:**

1. Verify cycle ID passed correctly
2. Check browser Network tab: `/kpi/nhan-vien/{id}/nhiem-vu?chuKyId=xxx`
3. Backend logs: Check NhanVienNhiemVu query

**Fix:** Ensure NhanVienNhiemVu records exist with correct ChuKyDanhGiaID

---

### Issue: MucDoKho showing default 5.0

**Symptom:** All tasks show difficulty 5.0 instead of assigned values
**Checks:**

1. Backend: Verify getTasksForEvaluation returns MucDoKho from assignment
2. Frontend: Console log `tasksForEvaluation` array

**Fix:** Backend should query NhanVienNhiemVu.MucDoKho, not NhiemVuThuongQuy.MucDoKho

---

### Issue: KPI calculation incorrect

**Symptom:** Displayed KPI doesn't match manual calculation
**Checks:**

1. Console log `kpiResult.ChiTiet` array
2. Verify formula: Sum(AvgScore × MucDoKho) / Sum(MucDoKho)
3. Check: AvgScore = (DiemTuDanhGia + DiemQuanLyDanhGia) / 2

**Fix:** Backend controller: Ensure using MucDoKho from evaluation (not assignment)

---

### Issue: Scores not saving

**Symptom:** Click [Lưu] but scores don't persist
**Checks:**

1. Network tab: POST request status
2. Backend logs: Check saveEvaluation controller
3. Verify: employeeId and cycleId passed correctly

**Fix:** Check request payload structure matches backend expectation

---

## 📊 Test Data Setup

### SQL/MongoDB Commands

**Create Test Cycle:**

```javascript
db.chukydanhgia.insertOne({
  TenChuKy: "Q1/2025",
  TuNgay: new Date("2025-01-01"),
  DenNgay: new Date("2025-03-31"),
  TrangThai: true,
});
```

**Create Test Assignment:**

```javascript
db.nhanviennhiemvu.insertOne({
  NhanVienID: ObjectId("employee_id"),
  NhiemVuThuongQuyID: ObjectId("task_id"),
  ChuKyDanhGiaID: ObjectId("cycle_id"),
  MucDoKho: 7.5, // ← Custom difficulty
  TrangThai: true,
});
```

**Verify Assignment:**

```javascript
db.nhanviennhiemvu
  .find({
    ChuKyDanhGiaID: ObjectId("cycle_id"),
  })
  .pretty();
```

---

## ✅ Acceptance Criteria

### Functional Requirements

- ✅ Manager can select evaluation cycle
- ✅ Manager can view managed employees
- ✅ Manager can evaluate employee tasks
- ✅ Scores range validated (0-10)
- ✅ KPI calculated using weighted average
- ✅ KPI classification displayed correctly

### Performance Requirements

- ✅ Page loads in < 2 seconds
- ✅ Dialog opens in < 1 second
- ✅ Save operation completes in < 3 seconds
- ✅ No console errors/warnings

### Usability Requirements

- ✅ Clear instructions displayed
- ✅ Loading states during async operations
- ✅ Success/error feedback via toasts
- ✅ Responsive layout (desktop/tablet)
- ✅ Color-coded visual feedback

---

## 📸 Expected Screenshots

### Main Page

```
[Cycle Dropdown: Q1/2025 selected]

┌─────────────────────────────────────────────────────┐
│ STT │ Họ tên      │ Số NV │ Tổng độ khó │ Điểm KPI │
├─────┼─────────────┼───────┼─────────────┼──────────┤
│  1  │ Nguyễn Văn A│  5    │   35.5      │   8.3    │
│     │             │ [🔵 5]│  [🟡 35.5]  │ [Giỏi]   │
│     │             │ [Đánh giá] [Xem KPI]            │
└─────────────────────────────────────────────────────┘
```

### Evaluation Dialog

```
Đánh giá KPI - Nguyễn Văn A          [8.3 - Giỏi]

┌────────────────────────────────────────────────────┐
│ Nhiệm vụ      │ Độ khó │ Tự đánh giá │ QL │ Ghi chú│
├───────────────┼────────┼─────────────┼────┼────────┤
│ Viết báo cáo  │ [7.5]  │  [8.0]      │[9.0]│ Tốt   │
│ Họp tuần      │ [5.0]  │  [7.5]      │[8.0]│       │
└────────────────────────────────────────────────────┘

✓ Kết quả KPI: 8.35 - Giỏi
  • Viết báo cáo: 8.5 × 7.5 = 63.75
  • Họp tuần: 7.75 × 5.0 = 38.75

                     [Đóng]    [Lưu đánh giá]
```

---

## 🎯 Test Result Documentation

### Test Session Template

```
Date: ___________
Tester: ___________
Environment: Dev / Staging / Production

┌──────────────────────────┬────────┬──────────┐
│ Test Case                │ Status │ Notes    │
├──────────────────────────┼────────┼──────────┤
│ Scenario 1: Basic Flow   │ ☐ Pass │          │
│ Scenario 2: Validation   │ ☐ Pass │          │
│ Scenario 3: View KPI     │ ☐ Pass │          │
│ Scenario 4: Multiple     │ ☐ Pass │          │
│ Scenario 5: Edit         │ ☐ Pass │          │
│ Scenario 6: Empty States │ ☐ Pass │          │
└──────────────────────────┴────────┴──────────┘

Overall Result: ☐ PASS  ☐ FAIL

Critical Issues Found: ___________
Recommendations: ___________
```

---

## 🚀 Ready for Production?

**Checklist:**

- [ ] All test scenarios pass
- [ ] No console errors
- [ ] Performance acceptable (<3s save)
- [ ] Data persists correctly
- [ ] KPI calculations verified
- [ ] UI/UX matches requirements
- [ ] Documentation complete
- [ ] User training materials prepared

**Sign-off:**

- Developer: ****\_\_\_****
- QA: ****\_\_\_****
- Manager: ****\_\_\_****

---

## 📞 Support Contacts

**Technical Issues:**

- Frontend: Check Redux DevTools state.kpiEvaluation
- Backend: Check logs for API errors
- Database: Verify NhanVienNhiemVu records

**Feature Questions:**

- Refer to: FRONTEND_KPI_IMPLEMENTATION_COMPLETE.md
- Backend spec: KPI_EVALUATION_REFACTOR.md

---

**Happy Testing! 🎉**
