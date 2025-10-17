# KPI User Workflow Guide

**Version:** 3.0  
**Last Updated:** October 14, 2025

---

## Table of Contents

1. [Manager Workflow](#manager-workflow-chấm-điểm-kpi)
2. [Admin Workflow](#admin-workflow-quản-lý-master-data)
3. [Employee Workflow](#employee-workflow-xem-kpi)
4. [Common Scenarios](#common-scenarios)

---

## Manager Workflow: Chấm Điểm KPI

### Step 1: Access Dashboard

1. **Navigate:** Menu → Quản lý công việc → Đánh giá KPI
2. **URL:** `/quanlycongviec/kpi/danh-gia`
3. **Auto-select Chu kỳ:**
   - System automatically selects:
     - ✅ Priority 1: Active chu kỳ (today in range)
     - ✅ Priority 2: Upcoming chu kỳ (within 5 days)
     - ✅ Priority 3: Latest chu kỳ (fallback)

**What you see:**

```
┌─────────────────────────────────────────────┐
│ KPI Dashboard - Tháng 10/2025              │
├─────────────────────────────────────────────┤
│ [Tổng: 10] [Hoàn thành: 3]                 │
│ [Đang chấm: 5] [Chưa bắt đầu: 2]           │
├─────────────────────────────────────────────┤
│ Search: [_________________] 🔍              │
├─────────────────────────────────────────────┤
│ Nhân viên    | Progress         | Điểm     │
│──────────────────────────────────────────── │
│ Nguyễn Văn A | ████████░░ 80%  | 45.5/50  │
│ Trần Thị B   | ████░░░░░░ 40%  | 20.0/50  │
│ Lê Văn C     | ░░░░░░░░░░  0%  | 0.0/50   │
└─────────────────────────────────────────────┘
```

---

### Step 2: Select Employee & Open Dialog

1. **Click** on employee row (anywhere)
2. **Dialog opens** full-screen with:
   - Employee info (Tên, Mã NV)
   - List of nhiệm vụ thường quy
   - Current total score

**Dialog Layout:**

```
┌───────────────────────────────────────────────────┐
│ Chấm Điểm KPI - Nguyễn Văn A          [X]        │
├───────────────────────────────────────────────────┤
│ Progress: 5/10 nhiệm vụ | Tổng điểm: 45.5        │
├───────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐  │
│ │ Nhiệm vụ          │ Tốc độ │ Chất lượng │...│  │
│ │───────────────────────────────────────────│  │
│ │ Khám bệnh (7.5)   │  [80]  │   [90]     │...│  │
│ │ Hội chẩn (8.0)    │  [95]  │   [85]     │...│  │
│ │ ...               │        │            │   │  │
│ └─────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────┤
│              [Lưu tất cả] [Duyệt]                │
└───────────────────────────────────────────────────┘
```

---

### Step 3: Input Scores

**Table Inputs:**

```
Nhiệm vụ: Khám bệnh (Mức độ khó: 7.5)

Tiêu chí       │ Loại      │ Range    │ Input  │ Calculation
───────────────────────────────────────────────────────────
Tốc độ         │ TANG_DIEM │ (0-100%) │  [80]  │ +0.80
Chất lượng     │ TANG_DIEM │ (0-100%) │  [90]  │ +0.90
Vi phạm        │ GIAM_DIEM │ (0-100%) │  [5]   │ -0.05
───────────────────────────────────────────────────────────
                          Tổng điểm tiêu chí: 1.65
                          Điểm nhiệm vụ: 7.5 × 1.65 = 12.375
```

**Input Features:**

- TextField với type="number"
- Step = 1 (chỉ nhập số nguyên)
- Auto-clamp to [GiaTriMin, GiaTriMax]
- Real-time calculation (không chờ API)

**Visual Feedback:**

- ✅ TANG_DIEM cells: Normal background
- ❌ GIAM_DIEM cells: Light red background
- 🔢 Điểm real-time update bên dưới

---

### Step 4: Save Scores

**Option A: Auto-save Individual Task** (Background)

```javascript
// Automatically saves after input (with debounce)
// User doesn't need to click anything
```

**Option B: Batch Save All (Recommended)**

```
1. Click [Lưu tất cả]
2. System saves all tasks sequentially
3. Success toast: "Đã lưu 10 nhiệm vụ thành công"
4. Dialog refreshes with updated scores
```

**Progress Indicator:**

```
┌────────────────────────────────┐
│ Đang lưu... 5/10 nhiệm vụ     │
│ ██████████░░░░░░░░░░ 50%      │
└────────────────────────────────┘
```

---

### Step 5: Approve KPI

**Before Approval:**

- ✅ Check: All tasks scored (no zero scores)
- ✅ Check: All inputs valid

**Click [Duyệt]:**

**Success:**

```
┌──────────────────────────────────┐
│ ✅ Đã duyệt KPI thành công       │
│ Trạng thái: DA_DUYET             │
│ Tổng điểm: 45.5                  │
└──────────────────────────────────┘
```

**Validation Error:**

```
┌──────────────────────────────────────────────┐
│ ❌ Còn 3 nhiệm vụ chưa chấm điểm            │
│ Vui lòng hoàn thành trước khi duyệt.       │
└──────────────────────────────────────────────┘
```

---

### Step 6: Close Dialog

**Click [X] or click outside:**

- Dialog closes
- Dashboard refreshes automatically
- Progress updated

---

## Admin Workflow: Quản Lý Master Data

### 1. Quản Lý Tiêu Chí Đánh Giá

**Navigate:** Menu → Quản lý công việc → Tiêu chí đánh giá

**URL:** `/quanlycongviec/kpi/tieu-chi`

**CRUD Operations:**

#### Create New Criterion

```
[+ Thêm tiêu chí mới]

┌─────────────────────────────────────┐
│ Tên tiêu chí: [Tốc độ phục vụ]     │
│ Loại: [TANG_DIEM ▼]                │
│ Đơn vị: [%] (disabled)              │
│ Giá trị Min: [0]                    │
│ Giá trị Max: [100]                  │
│ Mô tả: [________________]           │
│ Trạng thái: [✓] Hoạt động           │
│                                      │
│     [Hủy]  [Lưu]                    │
└─────────────────────────────────────┘
```

**Field Validation:**

- Tên tiêu chí: Required
- GiaTriMax > GiaTriMin
- Đơn vị: Default "%", cannot change (future: editable)

#### Edit Criterion

```
[✏️] on row → Same form with populated data
```

#### Delete Criterion

```
[🗑️] on row

┌────────────────────────────────────┐
│ ⚠️ Xác nhận xóa?                   │
│ Tiêu chí: "Tốc độ phục vụ"        │
│                                     │
│ [Hủy]  [Xóa]                       │
└────────────────────────────────────┘
```

**Note:** Soft delete (`isDeleted = true`)

---

### 2. Quản Lý Chu Kỳ Đánh Giá

**Navigate:** Menu → Quản lý công việc → Chu kỳ đánh giá

**URL:** `/quanlycongviec/kpi/chu-ky`

**CRUD Operations:**

#### Create New Cycle

```
[+ Thêm chu kỳ mới]

┌─────────────────────────────────────┐
│ Tên chu kỳ: [Tháng 11/2025]        │
│ Từ ngày: [2025-11-01] 📅           │
│ Đến ngày: [2025-11-30] 📅          │
│ Trạng thái: [✓] Mở (cho phép chấm) │
│                                      │
│     [Hủy]  [Lưu]                    │
└─────────────────────────────────────┘
```

#### Close Cycle (Lock)

```
[🔒 Đóng chu kỳ] on row

Effect:
- isDong = true
- Không thể chấm điểm/sửa KPI
- Chỉ xem read-only
```

#### Reopen Cycle

```
[🔓 Mở lại] on row

Effect:
- isDong = false
- Cho phép chấm điểm lại
```

**Business Rule:**

- Không xóa chu kỳ đã có KPI
- Một thời điểm nên có 1 chu kỳ đang mở

---

## Employee Workflow: Xem KPI

### Access Own KPI

**Navigate:** Menu → KPI của tôi (hoặc similar)

**URL:** `/quanlycongviec/kpi/xem`

**View:**

```
┌─────────────────────────────────────────────┐
│ KPI của tôi - Nguyễn Văn A                  │
├─────────────────────────────────────────────┤
│ Chu kỳ: [Tháng 10/2025 ▼]                  │
├─────────────────────────────────────────────┤
│ Tổng điểm: 45.5                             │
│ Trạng thái: ✅ Đã duyệt                     │
│ Ngày duyệt: 14/10/2025                      │
├─────────────────────────────────────────────┤
│ Chi tiết nhiệm vụ:                          │
│                                              │
│ 1. Khám bệnh (7.5)       12.375 điểm        │
│    - Tốc độ: 80%                            │
│    - Chất lượng: 90%                        │
│    - Vi phạm: -5%                           │
│                                              │
│ 2. Hội chẩn (8.0)        14.400 điểm        │
│    - Mức độ tham gia: 95%                   │
│    - Đóng góp: 85%                          │
│                                              │
│ ...                                          │
└─────────────────────────────────────────────┘
```

**Features:**

- ✅ Read-only (không sửa được)
- ✅ Xem lịch sử các chu kỳ
- ✅ Export PDF (future)
- ✅ Chart visualization (future)

---

## Common Scenarios

### Scenario 1: Nhân Viên Mới (Chưa Có Nhiệm Vụ)

**Manager clicks employee:**

```
┌────────────────────────────────────┐
│ ℹ️ Nhân viên chưa có nhiệm vụ      │
│                                     │
│ Vui lòng giao nhiệm vụ thường quy │
│ trước khi chấm điểm KPI.           │
│                                     │
│ [Đóng] [Giao nhiệm vụ →]           │
└────────────────────────────────────┘
```

**Solution:**

1. Go to "Giao nhiệm vụ" module
2. Assign `NhiemVuThuongQuy` to employee
3. Return to KPI dashboard → try again

---

### Scenario 2: Không Có Chu Kỳ Đang Mở

**Dashboard shows:**

```
┌────────────────────────────────────────────┐
│ ⚠️ Không tìm thấy chu kỳ đánh giá          │
│                                             │
│ Suggestion:                                 │
│ - Tạo chu kỳ mới                           │
│ - Hoặc mở lại chu kỳ đã đóng               │
│                                             │
│ [Tạo chu kỳ mới] [Quản lý chu kỳ →]       │
└────────────────────────────────────────────┘
```

**Solution:**

1. Admin tạo chu kỳ mới (`/kpi/chu-ky`)
2. Hoặc mở lại chu kỳ cũ ([🔓 Mở lại])

---

### Scenario 3: Network Error During Save

**Error toast:**

```
❌ Lỗi lưu điểm: Network error
```

**Solution:**

1. Check internet connection
2. Retry [Lưu tất cả]
3. If persists → contact IT support

**Data Safety:**

- ✅ Local state preserved (data not lost)
- ✅ Can retry without re-input

---

### Scenario 4: Sửa Điểm Sau Khi Đã Duyệt

**Current Status:** `TrangThai = "DA_DUYET"`

**Manager tries to edit:**

```
┌────────────────────────────────────┐
│ ⚠️ KPI đã được duyệt               │
│                                     │
│ Không thể chỉnh sửa điểm.          │
│                                     │
│ Giải pháp:                         │
│ - Hủy duyệt (Admin only)           │
│ - Hoặc tạo KPI mới chu kỳ khác     │
│                                     │
│ [Đóng]                             │
└────────────────────────────────────┘
```

**Solution:**

- Admin can "hủy duyệt" (future feature)
- Or create new KPI for next cycle

---

## Quick Reference

### Keyboard Shortcuts (Future)

| Key            | Action           |
| -------------- | ---------------- |
| `Ctrl + S`     | Save all tasks   |
| `Ctrl + Enter` | Approve KPI      |
| `Esc`          | Close dialog     |
| `Tab`          | Next input field |

### Status Colors

| Status     | Color     | Meaning          |
| ---------- | --------- | ---------------- |
| CHUA_DUYET | 🟡 Yellow | Pending approval |
| DA_DUYET   | 🟢 Green  | Approved         |

### Progress Indicators

| Progress | Meaning          |
| -------- | ---------------- |
| 0%       | Not started      |
| 1-99%    | In progress      |
| 100%     | All tasks scored |

---

## Tips & Best Practices

### For Managers

✅ **Do:**

- Chấm điểm đều đặn (không để tích lũy)
- Review từng tiêu chí kỹ lưỡng
- Lưu progress thường xuyên
- Duyệt sau khi kiểm tra kỹ

❌ **Don't:**

- Chấm điểm chủ quan không có căn cứ
- Duyệt khi chưa chấm hết nhiệm vụ
- Quên lưu trước khi đóng dialog

### For Admins

✅ **Do:**

- Tạo chu kỳ trước kỳ đánh giá
- Đóng chu kỳ sau khi hoàn thành
- Review tiêu chí định kỳ (add/remove)
- Backup data before major changes

❌ **Don't:**

- Xóa tiêu chí đang được sử dụng
- Đóng chu kỳ khi chưa duyệt hết
- Thay đổi công thức giữa chu kỳ

---

## Troubleshooting

| Problem              | Solution                                  |
| -------------------- | ----------------------------------------- |
| Không thấy nhân viên | Check QuanLyNhanVien (LoaiQuanLy = "KPI") |
| Không auto-select    | Check có chu kỳ `isDong = false`          |
| Lưu điểm fail        | Check ChiTietDiem structure, network      |
| Không duyệt được     | Check tất cả nhiệm vụ đã chấm             |

---

**Related Docs:**

- [README](./README.md) - Complete guide
- [FORMULA](./FORMULA.md) - Scoring formula

---

**Last Updated:** October 14, 2025  
**Version:** 3.0 (Unified)
