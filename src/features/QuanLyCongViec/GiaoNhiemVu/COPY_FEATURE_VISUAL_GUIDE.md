# Copy Feature - Visual Guide

## 📸 UI Screenshots (Mô tả)

### 1. Bảng Nhân viên với nút Copy

```
┌──────────────────────────────────────────────────────────────────────┐
│ 🔍 [Tìm theo tên, mã NV, khoa...]                                   │
├─────┬──────────┬─────────────────┬─────────────┬──────────┬─────────┤
│ STT │ Mã NV    │ Tên nhân viên   │ Khoa        │ Số NV    │ Thao tác│
├─────┼──────────┼─────────────────┼─────────────┼──────────┼─────────┤
│ 1   │ NV001    │ Nguyễn Văn A    │ [Khoa Nội]  │ [3]      │         │
│     │          │                 │             │          │ 👁️ ✏️ 📋 🗑️│
├─────┼──────────┼─────────────────┼─────────────┼──────────┼─────────┤
│ 2   │ NV002    │ Trần Thị B      │ [Khoa Nội]  │ [5]      │         │
│     │          │                 │             │          │ 👁️ ✏️ 📋 🗑️│
├─────┼──────────┼─────────────────┼─────────────┼──────────┼─────────┤
│ 3   │ NV003    │ Lê Văn C    ⚠️  │ [Khoa Ngoại]│ [0]      │         │
│     │          │                 │             │          │ 👁️ ✏️ 📋 ⊗│
└─────┴──────────┴─────────────────┴─────────────┴──────────┴─────────┘

Chú thích nút:
👁️ = Xem chi tiết (info)
✏️ = Gán nhiệm vụ (primary)
📋 = Sao chép (secondary) ← NÚT MỚI
🗑️ = Gỡ tất cả (error)
⊗ = Disabled (không có nhiệm vụ)
```

### 2. Dialog Copy - Trạng thái ban đầu

```
╔═══════════════════════════════════════════════════════════╗
║  📋 Sao chép nhiệm vụ                                [✕] ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ ℹ️  Nhân viên đích: Nguyễn Văn A                    │ ║
║  │     Khoa: Khoa Nội                                  │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  🔍 [Tìm theo tên hoặc mã nhân viên...]                  ║
║                                                           ║
║  Chọn nhân viên nguồn để sao chép nhiệm vụ sang          ║
║  Nguyễn Văn A:                                            ║
║  ─────────────────────────────────────────────────────── ║
║                                                           ║
║  ┌───────────────────────────────────────────────────┐   ║
║  │ ⚪ Trần Thị B                    [5 NV] [12.5 đ]  │   ║
║  │    NV002 • Khoa Nội                               │   ║
║  └───────────────────────────────────────────────────┘   ║
║                                                           ║
║  ┌───────────────────────────────────────────────────┐   ║
║  │ ⚪ Phạm Văn D                    [3 NV] [8.0 đ]   │   ║
║  │    NV004 • Khoa Nội                               │   ║
║  └───────────────────────────────────────────────────┘   ║
║                                                           ║
║  ┌───────────────────────────────────────────────────┐   ║
║  │ ⚪ Hoàng Thị E                   [7 NV] [15.0 đ]  │   ║
║  │    NV005 • Khoa Nội                               │   ║
║  └───────────────────────────────────────────────────┘   ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                [Hủy]  [Xác nhận] ⊗       ║
╚═══════════════════════════════════════════════════════════╝

Note: Nút "Xác nhận" bị disabled cho đến khi chọn nhân viên
```

### 3. Dialog Copy - Đã chọn nhân viên

```
╔═══════════════════════════════════════════════════════════╗
║  📋 Sao chép nhiệm vụ                                [✕] ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ ℹ️  Nhân viên đích: Nguyễn Văn A                    │ ║
║  │     Khoa: Khoa Nội                                  │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  🔍 [Tìm theo tên hoặc mã nhân viên...]                  ║
║                                                           ║
║  ─────────────────────────────────────────────────────── ║
║                                                           ║
║  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓   ║
║  ┃ 🔵 Trần Thị B                    [5 NV] [12.5 đ]  ┃   ║
║  ┃    NV002 • Khoa Nội                               ┃   ║
║  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛   ║
║                                                           ║
║  ┌───────────────────────────────────────────────────┐   ║
║  │ ⚪ Phạm Văn D                    [3 NV] [8.0 đ]   │   ║
║  │    NV004 • Khoa Nội                               │   ║
║  └───────────────────────────────────────────────────┘   ║
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ ✅ Sẽ sao chép 5 nhiệm vụ (12.5 điểm)              │ ║
║  │    từ Trần Thị B sang Nguyễn Văn A                 │ ║
║  │                                                     │ ║
║  │ ⚠️ Lưu ý: Nhiệm vụ hiện tại của Nguyễn Văn A       │ ║
║  │          sẽ bị thay thế hoàn toàn                  │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                [Hủy]  [📋 Xác nhận]      ║
╚═══════════════════════════════════════════════════════════╝

Note:
- Item được chọn có border màu primary
- Preview hiển thị với background màu success
- Warning hiển thị với màu warning
- Nút "Xác nhận" enabled và có icon
```

### 4. Dialog Copy - Không có nhân viên phù hợp

```
╔═══════════════════════════════════════════════════════════╗
║  📋 Sao chép nhiệm vụ                                [✕] ║
╠═══════════════════════════════════════════════════════════╣
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ ℹ️  Nhân viên đích: Lê Văn C                        │ ║
║  │     Khoa: Khoa Ngoại                                │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
║  ┌─────────────────────────────────────────────────────┐ ║
║  │ ⚠️  Không có nhân viên nào cùng khoa có nhiệm vụ    │ ║
║  │     để sao chép                                     │ ║
║  └─────────────────────────────────────────────────────┘ ║
║                                                           ║
╠═══════════════════════════════════════════════════════════╣
║                                [Hủy]  [Xác nhận] ⊗       ║
╚═══════════════════════════════════════════════════════════╝

Note: Warning alert hiển thị khi không có nhân viên phù hợp
```

### 5. Toast Notifications

```
Success:
┌────────────────────────────────────────────────┐
│ ✅ Sao chép thành công!                        │
│    Thêm mới: 3, Gỡ bỏ: 1, Giữ nguyên: 2       │
└────────────────────────────────────────────────┘

Warning (no assignments):
┌────────────────────────────────────────────────┐
│ ⚠️  Nhân viên nguồn không có nhiệm vụ nào      │
│     để sao chép                                │
└────────────────────────────────────────────────┘

Error (different department):
┌────────────────────────────────────────────────┐
│ ❌ Không thể sao chép - hai nhân viên phải     │
│    cùng khoa                                   │
└────────────────────────────────────────────────┘

Error (no permission):
┌────────────────────────────────────────────────┐
│ ❌ Bạn không có quyền thực hiện thao tác này   │
└────────────────────────────────────────────────┘
```

## 🎯 User Interaction Flow

```
START
  │
  ├─→ User vào trang Giao Nhiệm Vụ
  │
  ├─→ Thấy bảng danh sách nhân viên
  │   ├─ Mỗi row có 4 nút: Xem, Gán, Copy, Gỡ
  │   └─ Nút Copy màu tím (secondary)
  │
  ├─→ User click nút Copy trên nhân viên "Nguyễn Văn A"
  │
  ├─→ Dialog mở ra
  │   ├─ Header: "📋 Sao chép nhiệm vụ"
  │   ├─ Info box: Nhân viên đích = "Nguyễn Văn A", Khoa = "Khoa Nội"
  │   ├─ Search box: Tìm nhanh nhân viên
  │   └─ Danh sách: CHỈ nhân viên cùng "Khoa Nội" + có nhiệm vụ
  │
  ├─→ User nhập "Trần" vào search
  │   └─ List filter real-time → chỉ show "Trần Thị B"
  │
  ├─→ User click chọn "Trần Thị B"
  │   ├─ Item này được highlight với border xanh
  │   ├─ Alert success hiện ra:
  │   │   "✅ Sẽ sao chép 5 nhiệm vụ (12.5 điểm)
  │   │       từ Trần Thị B sang Nguyễn Văn A"
  │   └─ Alert warning:
  │       "⚠️ Nhiệm vụ hiện tại của Nguyễn Văn A sẽ bị thay thế"
  │
  ├─→ User click nút "📋 Xác nhận"
  │
  ├─→ Dialog đóng
  │   └─ Loading indicator hiện (isLoading = true)
  │
  ├─→ Redux dispatch copyAssignments
  │   ├─ Step 1: Fetch assignments của "Trần Thị B"
  │   │   GET /assignments?NhanVienID=tran_thi_b_id
  │   │   Response: [{ NhiemVuThuongQuyID: "duty1" }, { ... }, ...]
  │   │
  │   ├─ Step 2: Extract duty IDs
  │   │   dutyIds = ["duty1", "duty2", "duty3", "duty4", "duty5"]
  │   │
  │   ├─ Step 3: Batch update "Nguyễn Văn A"
  │   │   PUT /nhan-vien/nguyen_van_a_id/assignments
  │   │   Body: { dutyIds: ["duty1", ...] }
  │   │
  │   └─ Step 4: Backend xử lý
  │       ├─ Validate: cùng KhoaID? ✅
  │       ├─ Calculate diff:
  │       │   Current: [duty6, duty7, duty8]
  │       │   New:     [duty1, duty2, duty3, duty4, duty5]
  │       │   → Added:   [duty1, duty2, duty3, duty4, duty5] (5)
  │       │   → Removed: [duty6, duty7, duty8] (3)
  │       │   → Unchanged: [] (0)
  │       ├─ Soft delete: duty6, duty7, duty8
  │       ├─ Create/Restore: duty1-5
  │       └─ Return: { statistics: { added: 5, removed: 3, unchanged: 0 } }
  │
  ├─→ Redux receives response
  │   ├─ Dispatch batchUpdateSuccess
  │   └─ Refresh data:
  │       ├─ fetchAssignmentsByEmployee(nguyen_van_a_id)
  │       └─ fetchAssignmentTotals([nguyen_van_a_id, ...])
  │
  ├─→ Toast notification
  │   "✅ Sao chép thành công! Thêm mới: 5, Gỡ bỏ: 3, Giữ nguyên: 0"
  │
  ├─→ UI Updates
  │   ├─ Bảng nhân viên refresh
  │   │   Nguyễn Văn A: Số NV = 5 (was 3)
  │   │   Tổng điểm = 12.5 (was 8.0)
  │   │
  │   └─ Stats cards update
  │       ├─ Tổng số nhân viên: 10 (unchanged)
  │       ├─ Tổng nhiệm vụ: 45 → 47 (+2)
  │       └─ Tổng điểm: 120.0 → 124.5 (+4.5)
  │
  └─→ END
```

## 🔍 Edge Cases & Validation

### Case 1: Nhân viên cùng khoa không có nhiệm vụ

```
Input:
- Target: A (Khoa Nội, 3 nhiệm vụ)
- Source options:
  - B (Khoa Nội, 0 nhiệm vụ) ← filtered out
  - C (Khoa Nội, 5 nhiệm vụ) ✓

Result: Dialog chỉ hiển thị C
```

### Case 2: Target là nhân viên duy nhất trong khoa có nhiệm vụ

```
Input:
- Target: X (Khoa Nhi, 5 nhiệm vụ)
- Others in Khoa Nhi: Y (0 nhiệm vụ), Z (0 nhiệm vụ)

Result: Dialog hiển thị warning "Không có nhân viên nào..."
```

### Case 3: Copy từ nhân viên khác khoa (hack via API)

```
Request:
PUT /nhan-vien/A_id/assignments
{ dutyIds: [duties from B who is in different department] }

Response: 400 Bad Request
Backend validates: A.KhoaID !== dutyIds[0].KhoaID
Toast: "Không thể sao chép - hai nhân viên phải cùng khoa"
```

### Case 4: Copy khi target đã có nhiệm vụ

```
Before:
- Target A: [duty1, duty2, duty3]
- Source B: [duty4, duty5, duty6, duty7]

After copy:
- Target A: [duty4, duty5, duty6, duty7]
- Removed: duty1, duty2, duty3 (soft delete, NgayXoa = now)
- Added: duty4, duty5, duty6, duty7

Toast: "Thêm mới: 4, Gỡ bỏ: 3, Giữ nguyên: 0"
```

### Case 5: Copy overlap (một số nhiệm vụ giống nhau)

```
Before:
- Target A: [duty1, duty2, duty3]
- Source B: [duty2, duty3, duty4, duty5]

After copy:
- Target A: [duty2, duty3, duty4, duty5]
- Removed: duty1 (soft delete)
- Added: duty4, duty5
- Unchanged: duty2, duty3 (already assigned)

Toast: "Thêm mới: 2, Gỡ bỏ: 1, Giữ nguyên: 2"
```

## 🎨 Color Scheme

```
Copy Button:         secondary (purple/pink)
Dialog Header:       primary
Info Alert:          info (blue)
Success Alert:       success (green)
Warning Alert:       warning (orange)
Selected Item:       primary border (blue)
Unselected Item:     divider border (gray)
Chip (Nhiệm vụ):     success outlined
Chip (Điểm):         primary outlined
```

## 🧩 Component Hierarchy

```
GiaoNhiemVuPageNew
  └─ MainCard
      ├─ Stats Cards (3x)
      └─ EmployeeOverviewTable
          ├─ TextField (search)
          ├─ CommonTable
          │   └─ Row Actions
          │       ├─ ViewAssignmentsDialog
          │       ├─ AssignDutiesDialog
          │       ├─ CopyAssignmentsDialog ← NEW
          │       └─ DeleteAll Confirm
          └─ Dialogs
              ├─ AssignDutiesDialog
              ├─ ViewAssignmentsDialog
              └─ CopyAssignmentsDialog ← NEW
```

---

**Visual Guide Complete** ✅  
**All UI states documented**  
**Edge cases covered**
