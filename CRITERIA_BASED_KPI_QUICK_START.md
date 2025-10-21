# Criteria-Based KPI Quick Start Guide

**For:** Hospital Managers using the KPI evaluation system  
**Version:** v2.0 - Criteria-Based Scoring

---

## Overview

The new KPI evaluation system allows you to score employees based on **multiple evaluation criteria** (tiêu chí) per task, not just a single 0-10 score. This provides more detailed and accurate performance assessment.

---

## Key Concepts

### 1. Evaluation Cycle (Chu Kỳ Đánh Giá)

Each cycle (e.g., "Tháng 1/2025") has:

- Start and end dates
- **Criteria configuration** (TieuChiCauHinh) - the evaluation criteria for this cycle

### 2. Evaluation Criteria (Tiêu Chí)

Two types of criteria:

**TANG_DIEM (Positive Points):**

- Adds to the score
- Examples: "Hoàn thành đúng hạn", "Chất lượng công việc"

**GIAM_DIEM (Negative Points):**

- Subtracts from the score
- Examples: "Số lỗi phát sinh", "Chậm deadline"

### 3. Scoring Range

- Each criterion is scored **0-100** (percentage achievement)
- Not the old 0-10 scale per task!

### 4. Calculation

For each task:

```
TongDiemTieuChi = Σ(TANG_DIEM scores) - Σ(GIAM_DIEM scores)
DiemNhiemVu = (MucDoKho × TongDiemTieuChi) / 100
```

Total KPI = Sum of all DiemNhiemVu

---

## User Flow

### Step 1: Select Evaluation Cycle

1. Navigate to **Quản Lý Công Việc → Chấm điểm KPI [MỚI]**
2. Select cycle from dropdown (e.g., "Tháng 1/2025")
3. System loads list of employees you manage

### Step 2: Open Employee Evaluation

1. Find employee in table
2. Click **[Đánh giá]** button
3. Dialog opens with full-screen scoring interface

### Step 3: Score Each Task

For each task assigned to the employee:

1. **Click task row** to expand criteria table
2. For each criterion, enter score 0-100:
   - **0** = Not achieved at all
   - **50** = Partially achieved
   - **100** = Fully achieved
3. Add notes in "Ghi chú" if needed
4. Watch real-time calculation update

**Example:**

| Tiêu chí             | Loại | Điểm (0-100) | Ghi chú        |
| -------------------- | ---- | ------------ | -------------- |
| Hoàn thành đúng hạn  | TĂNG | 85           | Hoàn thành tốt |
| Chất lượng công việc | TĂNG | 90           | Xuất sắc       |
| Số lỗi phát sinh     | GIẢM | 10           | Có 1-2 lỗi nhỏ |

**Calculation:**

```
TongDiemTieuChi = 85 + 90 - 10 = 165
If MucDoKho = 5:
DiemNhiemVu = (5 × 165) / 100 = 8.25
```

### Step 4: Complete All Tasks

- Progress indicator shows: "3/5 nhiệm vụ đã chấm điểm"
- Continue until all tasks are scored
- System prevents approval if any task is incomplete

### Step 5: Approve KPI

1. Click **[Duyệt KPI]** button
2. System validates all tasks scored
3. Calculates final TongDiemKPI
4. Saves and marks as "DA_DUYET"
5. Success notification appears

---

## UI Components

### Header Section

Shows:

- Employee name, code, department
- Cycle name and date range
- Approval status badge (if approved)

### Progress Section

- **Progress bar** - percentage of tasks completed
- **Score summary** - Current total KPI score
- **Task count** - "Đã chấm: 3/5"

### Task Table (Main Section)

**Collapsed view:**

- ▶ Task name
- Difficulty (Độ khó 1-10)
- Status icon (✓ scored / ○ not scored)
- Current score

**Expanded view:**

- Full criteria table with inputs
- Real-time calculation display
- Notes field

### Action Buttons

- **[Lưu tất cả]** - Save all scores (auto-saves on input)
- **[Duyệt KPI]** - Approve and finalize (disabled if incomplete)
- **[Đóng]** - Close dialog

---

## Tips & Best Practices

### Scoring Guidelines

1. **Be consistent:** Use the same standards for all employees
2. **Use full range:** Don't cluster all scores around 50-60
3. **Document:** Add notes to justify extreme scores (0-20 or 80-100)
4. **Review before approve:** Double-check calculations make sense

### Common Mistakes

❌ **Scoring 0-10 instead of 0-100**

- Remember: New system uses percentage scale!

❌ **Ignoring GIAM_DIEM criteria**

- These subtract from score, must be filled too

❌ **Approving too early**

- System will block, but always review totals first

❌ **Not adding notes**

- Future reference needs context, especially for low/high scores

### Keyboard Shortcuts

- **Tab** - Move to next criterion input
- **Enter** - Expand/collapse task row
- **Ctrl+S** - Save all (manual save trigger)

---

## Troubleshooting

### "Chu kỳ này chưa có cấu hình tiêu chí"

**Problem:** Cycle doesn't have criteria configured

**Solution:** Ask admin to configure TieuChiCauHinh for the cycle first

### "Còn X nhiệm vụ chưa chấm điểm"

**Problem:** Attempting to approve with unscored tasks

**Solution:** Scroll through table, find tasks with ○ icon, score them

### "Điểm tiêu chí phải từ 0 đến 100"

**Problem:** Invalid input (negative or >100)

**Solution:** Correct the input to valid range

### Score doesn't update

**Problem:** Calculation seems stuck

**Solution:**

1. Check all criteria have valid scores
2. Refresh page and re-enter
3. Report to IT if persists

---

## Differences from Old System

| Feature        | Old System      | New System                           |
| -------------- | --------------- | ------------------------------------ |
| Scoring scale  | 0-10 per task   | 0-100 per criterion                  |
| Criteria types | N/A             | TANG_DIEM / GIAM_DIEM                |
| Calculation    | Simple average  | Formula-based with difficulty weight |
| Granularity    | Task-level only | Task → Criteria multi-level          |
| Notes          | Per task        | Per criterion                        |

---

## Support

**Issues or Questions:**

- Contact: IT Department
- Email: it@hospital.vn
- Documentation: See `IMPLEMENTATION_CRITERIA_BASED_KPI.md`

---

**Last Updated:** December 15, 2024  
**Version:** 2.0
