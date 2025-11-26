# ⚡ Quick Reference - Giao Nhiệm Vụ V2.0

## 🚀 API Endpoints

### GET - Lấy thông tin

```bash
# Danh sách nhân viên được quản lý
GET /api/workmanagement/giao-nhiem-vu/:NhanVienID/nhan-vien
Query: ?loaiQuanLy=KPI|Giao_Viec

# Nhiệm vụ theo khoa của nhân viên
GET /api/workmanagement/giao-nhiem-vu/nhan-vien/:employeeId/nhiem-vu

# Assignments của 1 nhân viên
GET /api/workmanagement/giao-nhiem-vu/assignments?NhanVienID=xxx

# Tổng hợp stats nhiều nhân viên
GET /api/workmanagement/giao-nhiem-vu/assignments/totals?NhanVienIDs=id1,id2,id3
```

### POST/PUT/DELETE - Thao tác

```bash
# 🆕 Batch update (NEW!)
PUT /api/workmanagement/giao-nhiem-vu/nhan-vien/:employeeId/assignments
Body: { "dutyIds": ["id1", "id2", "id3"] }
Response: { added, removed, restored, unchanged, message }

# Gán 1 nhiệm vụ (old)
POST /api/workmanagement/giao-nhiem-vu/assignments
Body: { "NhanVienID": "xxx", "NhiemVuThuongQuyID": "yyy" }

# Gán hàng loạt (old - multi employees)
POST /api/workmanagement/giao-nhiem-vu/assignments/bulk
Body: { "NhanVienIDs": ["id1"], "NhiemVuThuongQuyIDs": ["id2"] }

# Gỡ gán theo ID
DELETE /api/workmanagement/giao-nhiem-vu/assignments/:assignmentId

# Gỡ gán theo cặp
DELETE /api/workmanagement/giao-nhiem-vu/assignments?NhanVienID=xxx&NhiemVuThuongQuyID=yyy

# 🆕 Gỡ tất cả nhiệm vụ của 1 nhân viên (sử dụng batch update với mảng rỗng)
PUT /api/workmanagement/giao-nhiem-vu/nhan-vien/:employeeId/assignments
Body: { "dutyIds": [] }
Response: { "removed": N, "added": 0, "unchanged": 0, "restored": 0 }
```

---

## 💻 Redux Actions

```javascript
import {
  fetchManagedEmployees,
  fetchManagerInfo,
  fetchDutiesByEmployee,
  fetchAssignmentsByEmployee,
  fetchAssignmentTotals,
  batchUpdateAssignments, // 🆕 NEW!
  copyAssignments, // 🆕 NEW!
  removeAllAssignments, // 🆕 NEW!
  assignDuty,
  unassignById,
} from "./giaoNhiemVuSlice";

// Fetch list nhân viên
dispatch(fetchManagedEmployees(managerId, loaiQuanLy));

// Fetch thông tin manager
dispatch(fetchManagerInfo(managerId));

// Fetch nhiệm vụ theo khoa
dispatch(fetchDutiesByEmployee(employeeId));

// Fetch assignments hiện tại
dispatch(fetchAssignmentsByEmployee(employeeId));

// Fetch stats nhiều nhân viên
dispatch(fetchAssignmentTotals([id1, id2, id3]));

// 🆕 Batch update (CORE FEATURE)
dispatch(
  batchUpdateAssignments({
    employeeId: "xxx",
    dutyIds: ["id1", "id2", "id3"],
  })
);

// 🆕 Copy assignments from source to target (same department)
dispatch(
  copyAssignments({
    sourceEmployeeId: "source_xxx",
    targetEmployeeId: "target_yyy",
  })
);

// 🆕 Remove all assignments (uses batch update with empty array)
dispatch(removeAllAssignments(employeeId));
```

---

## 🎨 Component Usage

### EmployeeOverviewTable

```jsx
import EmployeeOverviewTable from "./components/EmployeeOverviewTable";

<EmployeeOverviewTable
  employees={employees} // Array of QuanLyNhanVien populated
  totalsByEmployeeId={totalsMap} // Map<employeeId, {assignments, totalMucDoKho}>
  onRefresh={() => {}} // Callback after update
/>;
```

### AssignDutiesDialog

```jsx
import AssignDutiesDialog from "./components/AssignDutiesDialog";

<AssignDutiesDialog
  open={true}
  employee={{
    // Employee object
    _id: "xxx",
    Ten: "Nguyễn Văn A",
    TenKhoa: "Khoa Nội",
    KhoaID: { _id: "yyy", TenKhoa: "Khoa Nội" },
  }}
  onClose={() => {}} // Callback when dialog closes
/>;
```

### ViewAssignmentsDialog

```jsx
import ViewAssignmentsDialog from "./components/ViewAssignmentsDialog";

<ViewAssignmentsDialog
  open={true}
  employee={employeeObject}
  onClose={() => {}}
/>;
```

---

## 📦 Redux State Shape

```javascript
state.giaoNhiemVu = {
  isLoading: false,
  error: null,
  managerId: "xxx",
  managerInfo: { _id, Ten, MaNhanVien },

  employees: [                       // Managed employees
    {
      NhanVienQuanLy: "managerId",
      NhanVienDuocQuanLy: "empId",
      ThongTinNhanVienDuocQuanLy: { _id, Ten, KhoaID: {...} }
    }
  ],

  duties: [                          // Duties của khoa hiện tại
    { _id, TenNhiemVu, MoTa, MucDoKho, KhoaID }
  ],

  assignments: [                     // Assignments của employee hiện tại
    {
      _id,
      NhanVienID,
      NhiemVuThuongQuyID: { _id, TenNhiemVu, MucDoKho },
      NgayGan,
      NguoiGanID: { _id, Ten }
    }
  ],

  totalsByEmployeeId: {              // Stats cache
    "empId1": { totalMucDoKho: 15, assignments: 3 },
    "empId2": { totalMucDoKho: 22, assignments: 5 }
  },

  selectedEmployeeId: "xxx",
  creating: false,
  deleting: false
}
```

---

## 🔧 Utility Functions

### Diff Calculation

```javascript
// In AssignDutiesDialog
const currentDutyIds = assignments.map((a) => a.NhiemVuThuongQuyID._id);
const selectedDutyIds = [...state];

const toAdd = selectedDutyIds.filter((id) => !currentDutyIds.includes(id));
const toRemove = currentDutyIds.filter((id) => !selectedDutyIds.includes(id));
const unchanged = selectedDutyIds.filter((id) => currentDutyIds.includes(id));

const hasChanges = toAdd.length > 0 || toRemove.length > 0;
```

### Score Calculation

```javascript
const totalScore = duties
  .filter((d) => selectedDutyIds.includes(d._id))
  .reduce((sum, d) => sum + (d.MucDoKho || 0), 0);
```

### Employee Data Extraction

```javascript
// Handle both object and array ThongTinNhanVienDuocQuanLy
const raw = employee.ThongTinNhanVienDuocQuanLy;
const nv = Array.isArray(raw) ? raw[0] : raw;
const employeeId = nv?._id || employee.NhanVienDuocQuanLy;
const khoaName = nv?.KhoaID?.TenKhoa;
```

---

## 🎯 Common Patterns

### Pattern 1: Load page data

```javascript
useEffect(() => {
  if (NhanVienID) {
    dispatch(fetchManagedEmployees(NhanVienID));
    dispatch(fetchManagerInfo(NhanVienID));
  }
}, [NhanVienID]);

useEffect(() => {
  if (employees?.length > 0) {
    const ids = employees.map((e) => extractEmployeeId(e));
    dispatch(fetchAssignmentTotals(ids));
  }
}, [employees]);
```

### Pattern 2: Open assign dialog

```javascript
const handleOpenAssignDialog = (row) => {
  setSelectedEmployee(row);
  setAssignDialogOpen(true);
  // Dialog will auto-fetch duties + assignments in useEffect
};
```

### Pattern 3: Submit with confirm

```javascript
const handleSubmit = async () => {
  await confirm({
    title: "Xác nhận",
    description: <DiffComponent />,
  });

  await dispatch(batchUpdateAssignments({ employeeId, dutyIds }));
  onClose();
};
```

---

## 🚨 Error Handling

### Backend Errors

```javascript
// In Redux action
catch (error) {
  const msg = error.response?.data?.message || error.message;
  dispatch(slice.actions.hasError(msg));
  toast.error(msg);
}
```

### Validation Errors

```javascript
// BE service layer
if (!emp.KhoaID || emp.KhoaID !== duty.KhoaID) {
  throw new AppError(400, "Nhiệm vụ và nhân viên phải cùng KhoaID");
}
```

### Permission Errors

```javascript
// BE service layer
if (!isAdminUser(user)) {
  await ensureManagerPermission(user, null, employeeId);
}
```

---

## 📱 Responsive Considerations

```javascript
// Table auto-responsive với CommonTable
<CommonTable
  columns={columns}
  data={data}
  pageSize={20}
/>

// Dialog fullWidth maxWidth="md"
<Dialog open={open} maxWidth="md" fullWidth>

// Search box responsive
<TextField fullWidth size="small" />
```

---

## 🔍 Debug Tips

### 1. Check Redux State

```javascript
// In component
console.log(
  "State:",
  useSelector((s) => s.giaoNhiemVu)
);
```

### 2. Check API Response

```javascript
// Network tab > XHR > Response
{
  "success": true,
  "data": { added: 2, removed: 1, ... },
  "message": "..."
}
```

### 3. Check Permission

```javascript
// Backend logs
console.log("User:", user.PhanQuyen, user.NhanVienID);
console.log("QuanLyNhanVien:", relation);
```

### 4. Check Diff Logic

```javascript
// In AssignDutiesDialog
console.log("Current:", currentDutyIds);
console.log("Selected:", selectedDutyIds);
console.log("Diff:", { toAdd, toRemove, unchanged });
```

---

## 🎓 Learning Resources

### Related Files

- `quanLyNhanVienSlice.js` - Similar pattern
- `nhanvienSlice.js` - Redux pattern reference
- `CommonTable.js` - Table component usage
- `material-ui-confirm` - Confirm dialog library

### Key Concepts

- **Soft delete**: `isDeleted=true` instead of removing
- **Restore**: Reactivate deleted records
- **Diff calculation**: Set operations (add, remove, intersect)
- **Lazy loading**: Fetch data only when needed
- **Optimistic updates**: Update UI before API response

---

## 📞 Quick Troubleshooting

| Problem              | Solution                                     |
| -------------------- | -------------------------------------------- |
| Table không hiển thị | Check `employees` array populated            |
| Stats sai            | Call `fetchAssignmentTotals` sau update      |
| Dialog không mở      | Check `open` prop + `selectedEmployee` state |
| Checkbox không sync  | Check `useEffect` dependencies               |
| Submit không làm gì  | Check `diffStats.hasChanges`                 |
| Toast không hiển thị | Import `toast` from `react-toastify`         |
| Permission denied    | Check `QuanLyNhanVien` records               |
| Khoa mismatch        | Validate `KhoaID` match                      |

---

**Last Updated**: 2025-10-02  
**Version**: 2.0.0  
**Quick Help**: Check CHANGELOG_V2.md for full details
