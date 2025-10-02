# Tính năng Copy/Paste Nhiệm vụ - Documentation

## 📋 Tổng quan

Tính năng cho phép sao chép toàn bộ nhiệm vụ từ một nhân viên sang nhân viên khác **cùng khoa**.

## 🎯 Yêu cầu

- ✅ Hai nhân viên phải cùng khoa
- ✅ Nhân viên nguồn phải có ít nhất 1 nhiệm vụ
- ✅ Nhiệm vụ của nhân viên đích sẽ bị thay thế hoàn toàn

## 🏗️ Kiến trúc

### Frontend Components

#### 1. CopyAssignmentsDialog.js

**Mục đích**: Dialog cho phép chọn nhân viên nguồn để copy

**Props**:

- `open`: Boolean - Hiển thị dialog
- `targetEmployee`: Object - Nhân viên đích (nhận nhiệm vụ)
- `allEmployees`: Array - Danh sách tất cả nhân viên
- `totalsByEmployeeId`: Object - Thống kê nhiệm vụ theo nhân viên
- `onClose`: Function - Đóng dialog
- `onConfirm`: Function - Xác nhận copy

**Features**:

- Tìm kiếm nhân viên theo tên/mã
- Lọc tự động: chỉ hiển thị nhân viên cùng khoa, có nhiệm vụ, không phải chính mình
- Hiển thị số nhiệm vụ và tổng điểm của từng nhân viên
- Preview trước khi copy
- Cảnh báo nhiệm vụ hiện tại sẽ bị thay thế

**Logic lọc**:

```javascript
const eligibleEmployees = allEmployees.filter((emp) => {
  const empKhoaId = emp.KhoaID._id || emp.KhoaID;
  const targetKhoaId = targetEmployee.KhoaID._id || targetEmployee.KhoaID;

  return (
    empId !== targetEmployee._id && // Không phải chính mình
    empKhoaId === targetKhoaId && // Cùng khoa
    emp.assignments > 0 // Có nhiệm vụ
  );
});
```

#### 2. EmployeeOverviewTable.js (Updated)

**Thay đổi**:

- Thêm nút "Copy" (ContentCopy icon) vào cột Thao tác
- Thêm state `copyDialogOpen` và `selectedEmployee`
- Thêm handler `handleOpenCopyDialog` và `handleCopyConfirm`
- Truyền callback `onRefresh` với 2 tham số (sourceId, targetId)

**UI**:

```
[👁️ Xem] [✏️ Gán] [📋 Copy] [🗑️ Gỡ tất cả]
```

#### 3. GiaoNhiemVuPageNew.js (Updated)

**Thay đổi**:

- Import `copyAssignments` action
- Cập nhật `handleRefresh` để xử lý copy:
  - Nếu có sourceId và targetId: dispatch `copyAssignments`
  - Sau đó refresh totals

```javascript
const handleRefresh = async (sourceEmployeeId, targetEmployeeId) => {
  if (sourceEmployeeId && targetEmployeeId) {
    await dispatch(copyAssignments({ sourceEmployeeId, targetEmployeeId }));
  }
  // Refresh totals for all employees
  dispatch(fetchAssignmentTotals(allEmployeeIds));
};
```

### Redux Slice

#### Action: copyAssignments

**File**: `giaoNhiemVuSlice.js`

**Input**:

```javascript
{
  sourceEmployeeId: string,
  targetEmployeeId: string
}
```

**Flow**:

1. Fetch assignments của nhân viên nguồn
   - Endpoint: `GET /api/workmanagement/giao-nhiem-vu/assignments?NhanVienID={sourceId}`
2. Extract duty IDs từ assignments
3. Gọi batch update cho nhân viên đích
   - Endpoint: `PUT /api/workmanagement/giao-nhiem-vu/nhan-vien/{targetId}/assignments`
   - Body: `{ dutyIds: [...] }`
4. Backend tự động xử lý:
   - Validate cùng khoa
   - Calculate diff (added, removed, unchanged)
   - Soft delete assignments bị remove
   - Restore/create assignments mới
5. Refresh data: `fetchAssignmentsByEmployee` + `fetchAssignmentTotals`

**Success Toast**:

```
"Sao chép thành công! Thêm mới: X, Gỡ bỏ: Y, Giữ nguyên: Z"
```

**Error Handling**:

- 403: "Bạn không có quyền thực hiện thao tác này"
- 400: "Không thể sao chép - hai nhân viên phải cùng khoa"
- Default: "Không thể sao chép nhiệm vụ"

### Backend API

**Endpoint đã tồn tại**:

```
PUT /api/workmanagement/giao-nhiem-vu/nhan-vien/:employeeId/assignments
```

Endpoint này đã có sẵn từ trước, hỗ trợ:

- Batch update assignments
- Validate KhoaID match
- Calculate diff (added/removed/unchanged)
- Soft delete và restore logic
- Return statistics

**Không cần thêm endpoint mới** - tái sử dụng API có sẵn!

## 🔄 User Flow

1. **Người dùng click nút Copy** trên nhân viên đích
2. **Dialog mở ra** hiển thị:
   - Thông tin nhân viên đích (tên, khoa)
   - Danh sách nhân viên cùng khoa có nhiệm vụ
   - Search box
3. **Người dùng tìm và chọn nhân viên nguồn**
   - Thấy số nhiệm vụ và tổng điểm
   - Alert cảnh báo sẽ thay thế nhiệm vụ hiện tại
4. **Click "Xác nhận sao chép"**
   - Dialog đóng
   - Redux dispatch `copyAssignments`
   - Loading indicator hiển thị
5. **Kết quả**:
   - Toast thông báo thành công với thống kê
   - Bảng refresh tự động
   - Totals cards cập nhật

## 🎨 UI/UX Details

### Copy Button

- **Icon**: ContentCopy
- **Color**: secondary (purple)
- **Position**: Cột "Thao tác", sau nút "Gán nhiệm vụ"
- **Tooltip**: "Sao chép từ nhân viên khác"

### Dialog Layout

```
┌─────────────────────────────────────┐
│ 📋 Sao chép nhiệm vụ           [X] │
├─────────────────────────────────────┤
│ ℹ️ Nhân viên đích: Nguyễn Văn A     │
│    Khoa: Khoa Nội                   │
├─────────────────────────────────────┤
│ 🔍 [Tìm theo tên hoặc mã...]       │
├─────────────────────────────────────┤
│ Chọn nhân viên nguồn:               │
│                                     │
│ ┌───────────────────────────────┐  │
│ │ ● Trần Thị B                  │  │
│ │   NV001 • Khoa Nội            │  │
│ │            [5 NV] [12.5 điểm] │  │
│ └───────────────────────────────┘  │
│ ┌───────────────────────────────┐  │
│ │ ○ Lê Văn C                    │  │
│ │   NV002 • Khoa Nội            │  │
│ │            [3 NV] [8.0 điểm]  │  │
│ └───────────────────────────────┘  │
├─────────────────────────────────────┤
│ ✅ Sẽ sao chép 5 nhiệm vụ (12.5đ)  │
│    từ Trần Thị B sang Nguyễn Văn A │
│ ⚠️ Nhiệm vụ hiện tại sẽ bị thay thế│
├─────────────────────────────────────┤
│              [Hủy] [📋 Xác nhận]   │
└─────────────────────────────────────┘
```

## 🧪 Test Cases

### TC1: Copy thành công

**Steps**:

1. Chọn nhân viên đích
2. Click nút Copy
3. Chọn nhân viên nguồn cùng khoa
4. Click "Xác nhận sao chép"

**Expected**:

- Toast success với thống kê
- Totals cards cập nhật đúng
- Bảng refresh

### TC2: Không có nhân viên cùng khoa

**Steps**:

1. Chọn nhân viên là duy nhất trong khoa
2. Click nút Copy

**Expected**:

- Dialog hiển thị: "Không có nhân viên nào cùng khoa có nhiệm vụ để sao chép"
- Nút "Xác nhận" disabled

### TC3: Nhân viên nguồn không có nhiệm vụ

**Steps**:

1. Backend filter tự động loại bỏ nhân viên có `assignments === 0`

**Expected**:

- Nhân viên không xuất hiện trong danh sách

### TC4: Hai nhân viên khác khoa

**Steps**:

1. Thử copy từ nhân viên khác khoa (qua API trực tiếp)

**Expected**:

- Backend reject với status 400
- Toast error: "Không thể sao chép - hai nhân viên phải cùng khoa"

### TC5: Không có quyền

**Steps**:

1. User không phải manager của nhân viên đích

**Expected**:

- Backend reject với status 403
- Toast error: "Bạn không có quyền thực hiện thao tác này"

## 📊 Performance

- **API Calls**: 2 requests (fetch source + batch update)
- **Data Size**: Tối ưu - chỉ truyền duty IDs, không phải full objects
- **UI Response**: Async with loading state
- **Auto Refresh**: Chỉ refresh totals, không reload toàn bộ page

## 🔐 Security

- ✅ Authentication required (loginRequired middleware)
- ✅ Authorization: Chỉ manager của nhân viên mới được thao tác
- ✅ Validation: Backend validate KhoaID match
- ✅ Soft delete: Assignments bị gỡ không xóa khỏi DB, chỉ đánh dấu deleted

## 🚀 Future Enhancements

1. **Copy partial** - Chọn một số nhiệm vụ để copy thay vì tất cả
2. **Copy to multiple** - Copy sang nhiều nhân viên cùng lúc
3. **Template system** - Lưu template assignments để áp dụng nhanh
4. **History tracking** - Log lịch sử copy để audit
5. **Undo functionality** - Cho phép hoàn tác sau khi copy

## 📝 Code Files

**New Files**:

- `src/features/QuanLyCongViec/GiaoNhiemVu/components/CopyAssignmentsDialog.js`
- `COPY_FEATURE_DOC.md` (file này)

**Modified Files**:

- `src/features/QuanLyCongViec/GiaoNhiemVu/components/EmployeeOverviewTable.js`
- `src/features/QuanLyCongViec/GiaoNhiemVu/GiaoNhiemVuPageNew.js`
- `src/features/QuanLyCongViec/GiaoNhiemVu/giaoNhiemVuSlice.js`

**Backend Files** (no changes needed):

- Reuse existing endpoint: `PUT /nhan-vien/:employeeId/assignments`

## 🎓 Developer Notes

- Tính năng này tái sử dụng 100% backend API đã có
- Frontend xử lý việc fetch assignments từ source, extract duty IDs, và gọi batch update
- Dialog có UX tốt với search, filter tự động, và preview đầy đủ
- Error handling comprehensive với Vietnamese messages
- Follow đúng patterns của project: Redux manual thunks, MUI components, toast notifications

---

**Version**: 1.0  
**Date**: October 2, 2025  
**Status**: ✅ Implemented & Ready for Testing
