# 07. Batch Operations - Duyệt KPI Hàng Loạt

> **Module**: QuanLyCongViec/KPI  
> **Chức năng**: Batch approve, multi-select, performance optimization  
> **Thời gian đọc**: ~15-20 phút

---

## 📋 Table of Contents

1. [Overview - Tổng quan](#1-overview)
2. [Batch Approval System](#2-batch-approval-system)
3. [Multi-Select UI Pattern](#3-multi-select-ui-pattern)
4. [Backend Validation](#4-backend-validation)
5. [Transaction Management](#5-transaction-management)
6. [Performance Optimization](#6-performance-optimization)
7. [Error Handling](#7-error-handling)
8. [Best Practices](#8-best-practices)
9. [Real-World Examples](#9-real-world-examples)
10. [Edge Cases & Solutions](#10-edge-cases)
11. [Testing Guide](#11-testing-guide)

---

## 1. Overview - Tổng quan {#1-overview}

### 1.1. Giới thiệu

**Batch Operations** cho phép manager duyệt **nhiều đánh giá KPI cùng lúc** thay vì xử lý từng đánh giá một. Điều này:

- ⚡ **Tiết kiệm thời gian**: Duyệt 10 KPI trong 1 thao tác thay vì 10 lần click
- 🔒 **Đảm bảo consistency**: Tất cả thành công hoặc tất cả thất bại (atomic transaction)
- 📊 **Hiệu suất tốt**: Giảm HTTP requests và DB queries
- ✅ **UX tốt hơn**: Feedback rõ ràng về số lượng thành công/thất bại

### 1.2. Use Cases

| Tình huống                     | Mô tả                                                                |
| ------------------------------ | -------------------------------------------------------------------- |
| **End of cycle approval**      | Manager duyệt tất cả KPI của team vào cuối chu kỳ                    |
| **Bulk rejection**             | Từ chối hàng loạt đánh giá không đạt yêu cầu                         |
| **Re-approval after fix**      | Sau khi nhân viên sửa lỗi, duyệt lại nhiều KPI                       |
| **Department-wide operations** | Admin duyệt tất cả KPI của khoa (department level)                   |
| **Filter-based operations**    | Duyệt tất cả KPI > 8 điểm, hoặc của tháng 12/2025                    |
| **Undo batch approval**        | Hủy duyệt hàng loạt khi phát hiện sai sót (với lý do và audit trail) |

### 1.3. Architecture Overview

```mermaid
graph TD
    A[User chọn nhiều KPI] --> B[Frontend Validation]
    B --> C[Gửi batch request<br/>với array IDs]
    C --> D[Backend Pre-Validation]
    D --> E{Tất cả hợp lệ?}
    E -->|Không| F[Return errors cho từng ID]
    E -->|Có| G[BEGIN Transaction]
    G --> H[Loop & Approve từng KPI]
    H --> I[COMMIT Transaction]
    I --> J[Broadcast notifications]
    J --> K[Return success/failed lists]
    K --> L[Update Redux state]
    L --> M[Show toast feedback]
```

### 1.4. Key Files

**Frontend:**

- [src/features/QuanLyCongViec/KPI/v2/components/ChamDiemKPITable.js](../../../src/features/QuanLyCongViec/KPI/v2/components/ChamDiemKPITable.js) - Multi-select table with batch actions
- [src/features/QuanLyCongViec/KPI/kpiSlice.js](../../../src/features/QuanLyCongViec/KPI/kpiSlice.js) - Redux thunk for batch approve

**Backend:**

- [giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js](../../../../../../giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js) - Batch approval endpoint
- [giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js](../../../../../../giaobanbv-be/modules/workmanagement/models/DanhGiaKPI.js) - `duyet()` method

---

## 2. Batch Approval System {#2-batch-approval-system}

### 2.1. System Architecture

**Batch approval** là một **atomic operation** - tất cả thành công hoặc tất cả thất bại. Không có trạng thái "một nửa thành công".

```mermaid
sequenceDiagram
    participant User as Manager
    participant UI as Frontend Table
    participant Redux as Redux Store
    participant API as Backend API
    participant DB as MongoDB
    participant Queue as Notification Queue

    User->>UI: Select 5 KPI evaluations
    UI->>UI: Enable "Duyệt hàng loạt" button
    User->>UI: Click "Duyệt hàng loạt"
    UI->>Redux: dispatch(batchApproveKPI([ids]))

    Redux->>Redux: Pre-validate selection
    Redux->>API: POST /kpi/batch-approve {ids: []}

    API->>API: Validate permissions
    API->>API: Check all KPI are CHUA_DUYET
    API->>DB: BEGIN Transaction

    loop For each KPI
        API->>DB: Check criteria completeness
        API->>DB: Calculate TongDiemKPI
        API->>DB: Update TrangThai = DA_DUYET
        API->>DB: Save LichSuDuyet
    end

    alt All successful
        API->>DB: COMMIT Transaction
        API->>Queue: Broadcast notifications
        API->>Redux: {success: [5 items], failed: []}
        Redux->>UI: Update table (green badges)
        UI->>User: Toast: "✅ Duyệt 5 KPI thành công"
    else Any error
        API->>DB: ROLLBACK Transaction
        API->>Redux: {success: [], failed: [5 items]}
        Redux->>UI: Show error details
        UI->>User: Toast: "❌ Lỗi duyệt hàng loạt"
    end
```

### 2.2. API Endpoint

**Route**: `POST /api/workmanagement/kpi/batch-approve`

**Request Body:**

```javascript
{
  danhGiaKPIIds: [
    "67890abc123...",  // KPI ID 1
    "67890abc456...",  // KPI ID 2
    "67890abc789..."   // KPI ID 3
  ],
  nhanXet?: "Duyệt hàng loạt cho tháng 12/2025"  // Optional comment
}
```

**Response (200 OK):**

```javascript
{
  success: true,
  data: {
    approved: [
      {
        _id: "67890abc123...",
        NhanVienID: {
          _id: "...",
          Ten: "Nguyễn Văn A"
        },
        TongDiemKPI: 8.75,
        TrangThai: "DA_DUYET",
        NgayDuyet: "2026-01-05T10:30:00Z"
      },
      {
        _id: "67890abc456...",
        NhanVienID: { Ten: "Trần Thị B" },
        TongDiemKPI: 9.20,
        TrangThai: "DA_DUYET"
      }
    ],
    failed: [
      {
        _id: "67890abc789...",
        NhanVienID: { Ten: "Lê Văn C" },
        error: "Chưa chấm điểm đầy đủ (5/8 nhiệm vụ)",
        errorCode: "INCOMPLETE_EVALUATION"
      }
    ],
    summary: {
      total: 3,
      successCount: 2,
      failedCount: 1
    }
  },
  message: "Duyệt 2/3 KPI thành công"
}
```

**Error Response (400 Bad Request):**

```javascript
{
  success: false,
  errors: {
    message: "Validation errors",
    details: [
      { kpiId: "...", error: "Không có quyền duyệt" },
      { kpiId: "...", error: "Đã duyệt rồi" }
    ]
  }
}
```

### 2.3. Backend Implementation

**File**: `giaobanbv-be/modules/workmanagement/controllers/kpi.controller.js`

```javascript
/**
 * @route POST /api/workmanagement/kpi/batch-approve
 * @desc Duyệt hàng loạt nhiều đánh giá KPI
 * @access Private (Manager/Admin)
 */
kpiController.batchApproveKPI = catchAsync(async (req, res, next) => {
  const { danhGiaKPIIds, nhanXet } = req.body;
  const nguoiDuyetId = req.currentNhanVienID;

  // ========== STEP 1: VALIDATION ==========
  if (!Array.isArray(danhGiaKPIIds) || danhGiaKPIIds.length === 0) {
    throw new AppError(400, "Danh sách KPI không hợp lệ", "Bad Request");
  }

  if (danhGiaKPIIds.length > 50) {
    throw new AppError(
      400,
      "Chỉ được duyệt tối đa 50 KPI cùng lúc",
      "Bad Request"
    );
  }

  // ========== STEP 2: LOAD ALL KPIs ==========
  const danhSachKPI = await DanhGiaKPI.find({
    _id: { $in: danhGiaKPIIds },
    isDeleted: false,
  }).populate("NhanVienID ChuKyDanhGiaID");

  if (danhSachKPI.length === 0) {
    throw new AppError(404, "Không tìm thấy KPI nào", "Not Found");
  }

  // ========== STEP 3: CHECK PERMISSIONS FOR ALL ==========
  const nhanVienIds = danhSachKPI.map((kpi) => kpi.NhanVienID._id);
  const quanLyList = await QuanLyNhanVien.find({
    NhanVienQuanLy: nguoiDuyetId,
    NhanVienDuocQuanLy: { $in: nhanVienIds },
    LoaiQuanLy: "KPI",
    isDeleted: false,
  });

  const allowedNhanVienIds = new Set(
    quanLyList.map((ql) => ql.NhanVienDuocQuanLy.toString())
  );

  // ========== STEP 4: SEPARATE VALID/INVALID KPIs ==========
  const validKPIs = [];
  const failedKPIs = [];

  for (const kpi of danhSachKPI) {
    const nhanVienId = kpi.NhanVienID._id.toString();

    // Check permission
    if (!allowedNhanVienIds.has(nhanVienId)) {
      failedKPIs.push({
        _id: kpi._id,
        NhanVienID: kpi.NhanVienID,
        error: "Không có quyền duyệt KPI cho nhân viên này",
        errorCode: "PERMISSION_DENIED",
      });
      continue;
    }

    // Check already approved
    if (kpi.TrangThai === "DA_DUYET") {
      failedKPIs.push({
        _id: kpi._id,
        NhanVienID: kpi.NhanVienID,
        error: "KPI đã được duyệt trước đó",
        errorCode: "ALREADY_APPROVED",
      });
      continue;
    }

    // Check criteria completeness
    const evaluations = await DanhGiaNhiemVuThuongQuy.find({
      DanhGiaKPIID: kpi._id,
      isDeleted: false,
    });

    const allScored = evaluations.every((ev) =>
      ev.ChiTietDiem.every((cd) => cd.DiemDat !== null && cd.DiemDat >= 0)
    );

    if (!allScored) {
      failedKPIs.push({
        _id: kpi._id,
        NhanVienID: kpi.NhanVienID,
        error: `Chưa chấm điểm đầy đủ (${evaluations.length} nhiệm vụ)`,
        errorCode: "INCOMPLETE_EVALUATION",
      });
      continue;
    }

    validKPIs.push(kpi);
  }

  // ========== STEP 5: BEGIN TRANSACTION FOR VALID KPIs ==========
  const approvedKPIs = [];
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    for (const kpi of validKPIs) {
      // Load evaluations
      const evaluations = await DanhGiaNhiemVuThuongQuy.find({
        DanhGiaKPIID: kpi._id,
        isDeleted: false,
      }).session(session);

      // Calculate TongDiemKPI
      const tongDiemKPI = evaluations.reduce(
        (sum, ev) => sum + (ev.DiemNhiemVu || 0),
        0
      );

      // Update KPI
      kpi.TongDiemKPI = tongDiemKPI;
      kpi.TrangThai = "DA_DUYET";
      kpi.NgayDuyet = new Date();
      kpi.NguoiDuyet = nguoiDuyetId;

      // Add to approval history
      kpi.LichSuDuyet.push({
        NguoiDuyet: nguoiDuyetId,
        NgayDuyet: new Date(),
        NhanXet: nhanXet || `Duyệt hàng loạt (${validKPIs.length} KPI)`,
      });

      await kpi.save({ session });
      approvedKPIs.push(kpi);
    }

    // ========== STEP 6: COMMIT ==========
    await session.commitTransaction();

    // ========== STEP 7: BROADCAST NOTIFICATIONS ==========
    await Promise.all(
      approvedKPIs.map((kpi) =>
        notificationService.notify("kpi-duyet-tieu-chi", {
          danhGiaKPI: kpi,
          nguoiThucHien: nguoiDuyetId,
        })
      )
    );

    return sendResponse(
      res,
      200,
      true,
      {
        approved: approvedKPIs,
        failed: failedKPIs,
        summary: {
          total: danhGiaKPIIds.length,
          successCount: approvedKPIs.length,
          failedCount: failedKPIs.length,
        },
      },
      null,
      `Duyệt ${approvedKPIs.length}/${danhGiaKPIIds.length} KPI thành công`
    );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});
```

### 2.4. Transaction Workflow

**ACID Properties**:

| Property        | Cách Đảm Bảo                                       |
| --------------- | -------------------------------------------------- |
| **Atomicity**   | MongoDB transaction session - all or nothing       |
| **Consistency** | Pre-validation checks trước transaction            |
| **Isolation**   | Transaction isolates changes from other operations |
| **Durability**  | Commit persists data, rollback on error            |

**Step-by-Step Flow**:

1. **Pre-Validation** (Outside Transaction):

   - Check permissions for ALL KPIs
   - Check all are CHUA_DUYET status
   - Check criteria completeness
   - Separate valid/invalid KPIs

2. **Transaction Start**:

   ```javascript
   const session = await mongoose.startSession();
   session.startTransaction();
   ```

3. **Loop & Approve** (Inside Transaction):

   ```javascript
   for (const kpi of validKPIs) {
     // Load evaluations with session
     const evaluations = await Model.find({...}).session(session);

     // Calculate & update
     kpi.TongDiemKPI = calculateTotal(evaluations);
     kpi.TrangThai = "DA_DUYET";

     // Save with session
     await kpi.save({ session });
   }
   ```

4. **Commit**:

   ```javascript
   await session.commitTransaction();
   ```

5. **Post-Transaction** (Outside Transaction):
   - Broadcast notifications
   - Return success/failed lists

### 2.5. Performance Considerations

| Metric                  | Single Approve  | Batch Approve (10 items) | Improvement |
| ----------------------- | --------------- | ------------------------ | ----------- |
| **HTTP Requests**       | 10 requests     | 1 request                | **-90%**    |
| **Time**                | 10 × 1.2s = 12s | 2.5s                     | **-79%**    |
| **User Clicks**         | 10 clicks       | 1 click                  | **-90%**    |
| **DB Transactions**     | 10 transactions | 1 transaction            | **-90%**    |
| **Notification Events** | 10 events       | 1 batch event            | **-90%**    |

**Optimization Strategies**:

1. **Parallel Permission Checks**: Query all at once with `$in`
2. **Batch Notification**: Single event for multiple KPIs
3. **Eager Loading**: Populate relationships in advance
4. **Limit Batch Size**: Max 50 KPIs per request to avoid timeouts

---

## 3. Multi-Select UI Pattern {#3-multi-select-ui-pattern}

### 3.1. UI Components Overview

**Multi-select** cho phép manager chọn nhiều KPI evaluations từ danh sách và thực hiện batch operations (approve/reject/delete).

```mermaid
graph LR
    A[Checkbox Header<br/>"Select All"] --> B[Row Checkboxes]
    B --> C[Selected Count Badge]
    C --> D[Action Buttons]
    D --> E[Batch Approve Button]
    D --> F[Batch Reject Button]

    style E fill:#10b981
    style F fill:#ef4444
```

**Key UI Elements:**

| Element               | Purpose                          | State                              |
| --------------------- | -------------------------------- | ---------------------------------- |
| **Header Checkbox**   | Select/deselect all visible rows | Indeterminate if partial selection |
| **Row Checkboxes**    | Individual row selection         | Checked/unchecked                  |
| **Selection Counter** | Show "3 selected" badge          | Hidden if 0 selected               |
| **Action Toolbar**    | Batch operation buttons          | Disabled if 0 selected             |
| **Clear Selection**   | Reset all checkboxes             | Appears when selected > 0          |

### 3.2. Redux State Management

**State Structure:**

```javascript
// In kpiSlice.js
const initialState = {
  // ... existing state
  selectedKPIIds: [], // Array of selected KPI IDs
  isAllSelected: false, // Track "select all" state
  selectionMode: "none", // 'none' | 'single' | 'multiple'
};

// Reducers
const slice = createSlice({
  name: "kpi",
  initialState,
  reducers: {
    // Toggle single row selection
    toggleKPISelection(state, action) {
      const kpiId = action.payload;
      const index = state.selectedKPIIds.indexOf(kpiId);

      if (index > -1) {
        // Deselect
        state.selectedKPIIds.splice(index, 1);
      } else {
        // Select
        state.selectedKPIIds.push(kpiId);
      }

      // Update isAllSelected flag
      const visibleKPIs = state.danhSachDanhGiaKPI.filter(
        (kpi) => kpi.TrangThai === "CHUA_DUYET"
      );
      state.isAllSelected = state.selectedKPIIds.length === visibleKPIs.length;
    },

    // Select all visible rows
    selectAllKPIs(state, action) {
      const kpiIds = action.payload; // Array of IDs to select
      state.selectedKPIIds = kpiIds;
      state.isAllSelected = true;
    },

    // Clear selection
    clearKPISelection(state) {
      state.selectedKPIIds = [];
      state.isAllSelected = false;
    },

    // Clear selection after batch operation
    batchApproveSuccess(state, action) {
      // ... update KPI list
      state.selectedKPIIds = []; // Clear selection
      state.isAllSelected = false;
    },
  },
});
```

### 3.3. Table Component Implementation

**File**: `src/features/QuanLyCongViec/KPI/v2/pages/DanhGiaKPIDashboard.js`

```javascript
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Toolbar,
  Typography,
  Button,
  Chip,
  Box,
  alpha,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleKPISelection,
  selectAllKPIs,
  clearKPISelection,
  batchApproveKPI,
} from "../../kpiSlice";

function KPITableWithSelection() {
  const dispatch = useDispatch();
  const { danhSachDanhGiaKPI, selectedKPIIds, isAllSelected } = useSelector(
    (state) => state.kpi
  );

  // Filter only CHUA_DUYET items (can be batch approved)
  const selectableKPIs = danhSachDanhGiaKPI.filter(
    (kpi) => kpi.TrangThai === "CHUA_DUYET"
  );

  const numSelected = selectedKPIIds.length;
  const numSelectable = selectableKPIs.length;

  // Handle "Select All" checkbox
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = selectableKPIs.map((kpi) => kpi._id);
      dispatch(selectAllKPIs(allIds));
    } else {
      dispatch(clearKPISelection());
    }
  };

  // Handle individual row checkbox
  const handleSelectOne = (kpiId) => {
    dispatch(toggleKPISelection(kpiId));
  };

  // Check if row is selected
  const isSelected = (kpiId) => selectedKPIIds.includes(kpiId);

  // Handle batch approve
  const handleBatchApprove = () => {
    if (numSelected === 0) return;

    dispatch(
      batchApproveKPI({
        danhGiaKPIIds: selectedKPIIds,
        nhanXet: `Duyệt hàng loạt ${numSelected} KPI`,
      })
    );
  };

  return (
    <Box>
      {/* Selection Toolbar - Only show when items selected */}
      {numSelected > 0 && (
        <Toolbar
          sx={{
            pl: 2,
            pr: 1,
            bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="primary"
            variant="subtitle1"
            fontWeight="bold"
          >
            <Chip
              label={`${numSelected} được chọn`}
              color="primary"
              size="small"
              sx={{ mr: 1 }}
            />
            / {numSelectable} KPI chưa duyệt
          </Typography>

          <Button
            variant="outlined"
            size="small"
            onClick={() => dispatch(clearKPISelection())}
            sx={{ mr: 1 }}
          >
            Bỏ chọn tất cả
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={handleBatchApprove}
            disabled={numSelected === 0}
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              fontWeight: 700,
            }}
          >
            ✓ Duyệt {numSelected} KPI
          </Button>
        </Toolbar>
      )}

      {/* Table */}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              {/* Select All Checkbox */}
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={numSelected > 0 && numSelected < numSelectable}
                  checked={numSelectable > 0 && isAllSelected}
                  onChange={handleSelectAll}
                  disabled={numSelectable === 0}
                  inputProps={{
                    "aria-label": "select all KPI evaluations",
                  }}
                />
              </TableCell>
              <TableCell>Nhân viên</TableCell>
              <TableCell>Khoa</TableCell>
              <TableCell align="center">Tiến độ</TableCell>
              <TableCell align="center">Điểm KPI</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Thao tác</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {danhSachDanhGiaKPI.map((row) => {
              const isItemSelected = isSelected(row._id);
              const isSelectable = row.TrangThai === "CHUA_DUYET";

              return (
                <TableRow
                  key={row._id}
                  hover
                  onClick={() => {
                    if (isSelectable) handleSelectOne(row._id);
                  }}
                  role="checkbox"
                  aria-checked={isItemSelected}
                  selected={isItemSelected}
                  sx={{
                    cursor: isSelectable ? "pointer" : "default",
                    "&.Mui-selected": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                    },
                  }}
                >
                  {/* Row Checkbox */}
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      disabled={!isSelectable}
                      inputProps={{
                        "aria-labelledby": `checkbox-${row._id}`,
                      }}
                    />
                  </TableCell>

                  {/* ... other cells */}
                  <TableCell>{row.NhanVienID?.Ten}</TableCell>
                  <TableCell>{row.NhanVienID?.KhoaID?.TenKhoa}</TableCell>
                  {/* ... rest of cells */}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
```

### 3.4. Keyboard Shortcuts

**Recommended shortcuts for power users:**

| Key Combination    | Action          | Description                               |
| ------------------ | --------------- | ----------------------------------------- |
| `Ctrl/Cmd + A`     | Select all      | Select all selectable rows                |
| `Shift + Click`    | Range select    | Select range from last clicked to current |
| `Ctrl/Cmd + Click` | Toggle select   | Toggle individual row (keep others)       |
| `Escape`           | Clear selection | Deselect all rows                         |
| `Ctrl/Cmd + Enter` | Batch approve   | Approve selected items                    |

**Implementation:**

```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    // Ctrl/Cmd + A: Select all
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
      const allIds = selectableKPIs.map((kpi) => kpi._id);
      dispatch(selectAllKPIs(allIds));
    }

    // Escape: Clear selection
    if (e.key === "Escape" && numSelected > 0) {
      dispatch(clearKPISelection());
    }

    // Ctrl/Cmd + Enter: Batch approve
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && numSelected > 0) {
      handleBatchApprove();
    }
  };

  window.addEventListener("keydown", handleKeyDown);
  return () => window.removeEventListener("keydown", handleKeyDown);
}, [numSelected, selectableKPIs]);
```

### 3.5. Visual Feedback

**Selection States:**

```javascript
// Checkbox states
const CheckboxStates = {
  UNCHECKED: {
    icon: <CheckBoxOutlineBlankIcon />,
    color: 'default',
  },
  CHECKED: {
    icon: <CheckBoxIcon />,
    color: 'primary',
  },
  INDETERMINATE: {
    icon: <IndeterminateCheckBoxIcon />,
    color: 'primary',
  },
};

// Row styling based on selection
<TableRow
  selected={isItemSelected}
  sx={{
    '&.Mui-selected': {
      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
      '&:hover': {
        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
      },
    },
  }}
>
```

**Selection Counter Animation:**

```javascript
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence>
  {numSelected > 0 && (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Toolbar>{/* Selection toolbar content */}</Toolbar>
    </motion.div>
  )}
</AnimatePresence>;
```

### 3.6. Mobile Responsiveness

**Approach for mobile devices:**

1. **Long Press to Select** (instead of checkboxes):

   ```javascript
   const [longPressTimer, setLongPressTimer] = useState(null);

   const handleTouchStart = (kpiId) => {
     const timer = setTimeout(() => {
       dispatch(toggleKPISelection(kpiId));
       // Haptic feedback on supported devices
       if (navigator.vibrate) navigator.vibrate(50);
     }, 500); // 500ms long press
     setLongPressTimer(timer);
   };

   const handleTouchEnd = () => {
     if (longPressTimer) clearTimeout(longPressTimer);
   };
   ```

2. **Floating Action Button (FAB)** for batch actions:

   ```javascript
   <Fab
     color="primary"
     sx={{
       position: "fixed",
       bottom: 16,
       right: 16,
       display: { xs: "flex", md: "none" }, // Only mobile
     }}
     onClick={handleBatchApprove}
   >
     <Badge badgeContent={numSelected} color="error">
       <CheckCircleIcon />
     </Badge>
   </Fab>
   ```

3. **Bottom Sheet** for batch actions menu:

   ```javascript
   import SwipeableDrawer from "@mui/material/SwipeableDrawer";

   <SwipeableDrawer
     anchor="bottom"
     open={numSelected > 0}
     onClose={() => dispatch(clearKPISelection())}
   >
     <Box p={2}>
       <Typography variant="h6" gutterBottom>
         {numSelected} KPI được chọn
       </Typography>
       <Stack spacing={1}>
         <Button
           fullWidth
           variant="contained"
           color="success"
           onClick={handleBatchApprove}
         >
           Duyệt tất cả
         </Button>
         <Button
           fullWidth
           variant="outlined"
           onClick={() => dispatch(clearKPISelection())}
         >
           Bỏ chọn
         </Button>
       </Stack>
     </Box>
   </SwipeableDrawer>;
   ```

### 3.7. Accessibility (a11y)

**ARIA attributes for screen readers:**

```javascript
// Table with selection
<Table aria-label="KPI evaluation table with multi-select">
  <TableHead>
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          indeterminate={indeterminate}
          checked={isAllSelected}
          onChange={handleSelectAll}
          inputProps={{
            "aria-label": "select all KPI evaluations",
          }}
        />
      </TableCell>
      {/* ... */}
    </TableRow>
  </TableHead>

  <TableBody>
    {rows.map((row, index) => (
      <TableRow
        key={row._id}
        role="checkbox"
        aria-checked={isSelected(row._id)}
        tabIndex={-1}
      >
        <TableCell padding="checkbox">
          <Checkbox
            checked={isSelected(row._id)}
            inputProps={{
              "aria-labelledby": `kpi-name-${index}`,
            }}
          />
        </TableCell>
        <TableCell id={`kpi-name-${index}`}>{row.NhanVienID?.Ten}</TableCell>
        {/* ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>;

// Announce selection changes
import { useAnnounce } from "@mui/utils";

const announce = useAnnounce();

useEffect(() => {
  if (numSelected > 0) {
    announce(`${numSelected} KPI evaluations selected`);
  }
}, [numSelected]);
```

### 3.8. Performance Optimization

**For large datasets (>100 rows):**

```javascript
// 1. Virtualization with react-window
import { FixedSizeList } from "react-window";

<FixedSizeList
  height={600}
  itemCount={danhSachDanhGiaKPI.length}
  itemSize={52} // Row height in pixels
  width="100%"
>
  {({ index, style }) => <TableRow style={style}>{/* Row content */}</TableRow>}
</FixedSizeList>;

// 2. Memoize row rendering
const KPITableRow = React.memo(({ row, isSelected, onSelect }) => {
  return (
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox checked={isSelected} onChange={onSelect} />
      </TableCell>
      {/* ... other cells */}
    </TableRow>
  );
});

// 3. Use Set for faster lookup
const selectedKPISet = useMemo(() => new Set(selectedKPIIds), [selectedKPIIds]);

const isSelected = (kpiId) => selectedKPISet.has(kpiId);
```

---

## 4. Backend Validation {#4-backend-validation}

### 4.1. Validation Layers

**Three-tier validation approach** ensures data integrity and security:

```mermaid
graph TD
    A[Request Input] --> B[Layer 1: Input Validation]
    B --> C[Layer 2: Business Rules]
    C --> D[Layer 3: Permission Check]
    D --> E{All Valid?}
    E -->|Yes| F[Process Request]
    E -->|No| G[Return Error Details]

    style B fill:#3b82f6
    style C fill:#10b981
    style D fill:#f59e0b
    style G fill:#ef4444
```

### 4.2. Layer 1: Input Validation

**Validate request structure and data types:**

```javascript
// kpi.controller.js - batchApproveKPI()
kpiController.batchApproveKPI = catchAsync(async (req, res, next) => {
  const { danhGiaKPIIds, nhanXet } = req.body;

  // ========== INPUT VALIDATION ==========

  // 1. Check array exists
  if (!Array.isArray(danhGiaKPIIds)) {
    throw new AppError(400, "danhGiaKPIIds phải là mảng", "INVALID_INPUT");
  }

  // 2. Check array not empty
  if (danhGiaKPIIds.length === 0) {
    throw new AppError(400, "Danh sách KPI không được rỗng", "EMPTY_ARRAY");
  }

  // 3. Check batch size limit
  if (danhGiaKPIIds.length > 50) {
    throw new AppError(
      400,
      "Chỉ được duyệt tối đa 50 KPI cùng lúc",
      "BATCH_SIZE_EXCEEDED"
    );
  }

  // 4. Check all IDs are valid ObjectId
  const invalidIds = danhGiaKPIIds.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidIds.length > 0) {
    throw new AppError(
      400,
      `ID không hợp lệ: ${invalidIds.join(", ")}`,
      "INVALID_OBJECT_ID"
    );
  }

  // 5. Optional comment validation
  if (nhanXet && nhanXet.length > 500) {
    throw new AppError(
      400,
      "Nhận xét không được vượt quá 500 ký tự",
      "COMMENT_TOO_LONG"
    );
  }

  // ... continue with business logic
});
```

**Common Validation Rules:**

| Field           | Rule           | Error Code            |
| --------------- | -------------- | --------------------- |
| `danhGiaKPIIds` | Must be array  | `INVALID_INPUT`       |
| Length          | 1-50 items     | `BATCH_SIZE_EXCEEDED` |
| Each ID         | Valid ObjectId | `INVALID_OBJECT_ID`   |
| `nhanXet`       | Max 500 chars  | `COMMENT_TOO_LONG`    |

### 4.3. Layer 2: Business Rules Validation

**Check business constraints before processing:**

```javascript
// Load all KPIs from database
const danhSachKPI = await DanhGiaKPI.find({
  _id: { $in: danhGiaKPIIds },
  isDeleted: false,
}).populate("NhanVienID ChuKyDanhGiaID");

// ========== BUSINESS RULES VALIDATION ==========

// 1. Check if KPIs exist
if (danhSachKPI.length === 0) {
  throw new AppError(
    404,
    "Không tìm thấy KPI nào trong danh sách",
    "NOT_FOUND"
  );
}

// 2. Check for missing KPIs
if (danhSachKPI.length < danhGiaKPIIds.length) {
  const foundIds = danhSachKPI.map((kpi) => kpi._id.toString());
  const missingIds = danhGiaKPIIds.filter((id) => !foundIds.includes(id));

  throw new AppError(
    404,
    `Không tìm thấy ${missingIds.length} KPI: ${missingIds
      .slice(0, 3)
      .join(", ")}...`,
    "PARTIAL_NOT_FOUND"
  );
}

// 3. Check all belong to same cycle (optional constraint)
const uniqueCycles = [
  ...new Set(danhSachKPI.map((kpi) => kpi.ChuKyDanhGiaID._id.toString())),
];

if (uniqueCycles.length > 1) {
  throw new AppError(
    400,
    "Chỉ được duyệt KPI của cùng một chu kỳ",
    "MIXED_CYCLES"
  );
}

// 4. Check cycle is still open
const chuKy = await ChuKyDanhGia.findById(uniqueCycles[0]);
if (chuKy.TrangThai === "DA_DONG") {
  throw new AppError(
    400,
    "Chu kỳ đã đóng, không thể duyệt KPI",
    "CYCLE_CLOSED"
  );
}

// 5. Separate valid/invalid KPIs
const validKPIs = [];
const failedKPIs = [];

for (const kpi of danhSachKPI) {
  // Check already approved (idempotency)
  if (kpi.TrangThai === "DA_DUYET") {
    failedKPIs.push({
      _id: kpi._id,
      NhanVienID: kpi.NhanVienID,
      error: "KPI đã được duyệt trước đó",
      errorCode: "ALREADY_APPROVED",
    });
    continue;
  }

  // Check criteria completeness
  const evaluations = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: kpi._id,
    isDeleted: false,
  });

  if (evaluations.length === 0) {
    failedKPIs.push({
      _id: kpi._id,
      NhanVienID: kpi.NhanVienID,
      error: "Chưa có nhiệm vụ nào được chấm điểm",
      errorCode: "NO_EVALUATIONS",
    });
    continue;
  }

  const allScored = evaluations.every((ev) =>
    ev.ChiTietDiem.every((cd) => cd.DiemDat !== null && cd.DiemDat >= 0)
  );

  if (!allScored) {
    const scoredCount = evaluations.filter((ev) =>
      ev.ChiTietDiem.some((cd) => cd.DiemDat > 0)
    ).length;

    failedKPIs.push({
      _id: kpi._id,
      NhanVienID: kpi.NhanVienID,
      error: `Chưa chấm đầy đủ (${scoredCount}/${evaluations.length} nhiệm vụ)`,
      errorCode: "INCOMPLETE_EVALUATION",
    });
    continue;
  }

  validKPIs.push(kpi);
}
```

**Business Rule Checklist:**

| Rule                 | Check                       | Fail Action                       |
| -------------------- | --------------------------- | --------------------------------- |
| **Existence**        | KPIs exist in DB            | Return `NOT_FOUND`                |
| **Already approved** | Status is CHUA_DUYET        | Skip with `ALREADY_APPROVED`      |
| **Cycle status**     | Cycle is DANG_MO            | Return `CYCLE_CLOSED`             |
| **Has evaluations**  | Has DanhGiaNhiemVuThuongQuy | Skip with `NO_EVALUATIONS`        |
| **Complete scoring** | All criteria scored         | Skip with `INCOMPLETE_EVALUATION` |

### 4.4. Layer 3: Permission Validation

**Fine-grained authorization checks:**

```javascript
// ========== PERMISSION VALIDATION ==========

const nguoiDuyetId = req.currentNhanVienID;
const { PhanQuyen } = req.user;

// 1. Admin bypass (full permission)
const isAdmin = PhanQuyen === "admin" || PhanQuyen === "superadmin";

if (isAdmin) {
  // Admin can approve all KPIs - skip further checks
  validKPIs = danhSachKPI.filter((kpi) => kpi.TrangThai === "CHUA_DUYET");
} else {
  // 2. Manager: Check QuanLyNhanVien relationship

  // Get all employees being evaluated
  const nhanVienIds = danhSachKPI.map((kpi) => kpi.NhanVienID._id);

  // Query management relationships in one go
  const quanLyList = await QuanLyNhanVien.find({
    NhanVienQuanLy: nguoiDuyetId,
    NhanVienDuocQuanLy: { $in: nhanVienIds },
    LoaiQuanLy: "KPI",
    isDeleted: false,
  });

  // Create Set for fast lookup
  const allowedNhanVienIds = new Set(
    quanLyList.map((ql) => ql.NhanVienDuocQuanLy.toString())
  );

  // 3. Filter KPIs by permission
  for (const kpi of danhSachKPI) {
    const nhanVienId = kpi.NhanVienID._id.toString();

    if (!allowedNhanVienIds.has(nhanVienId)) {
      failedKPIs.push({
        _id: kpi._id,
        NhanVienID: kpi.NhanVienID,
        error: "Không có quyền duyệt KPI cho nhân viên này",
        errorCode: "PERMISSION_DENIED",
      });
      continue;
    }

    // Already checked business rules above
    if (kpi.TrangThai === "CHUA_DUYET") {
      validKPIs.push(kpi);
    }
  }
}

// 4. Check if any KPIs remain after permission filtering
if (validKPIs.length === 0) {
  throw new AppError(
    403,
    "Không có quyền duyệt bất kỳ KPI nào trong danh sách",
    "NO_PERMISSION"
  );
}
```

**Permission Matrix:**

| Role           | Permission             | Check Method                      |
| -------------- | ---------------------- | --------------------------------- |
| **Admin**      | All KPIs               | PhanQuyen = 'admin'               |
| **Superadmin** | All KPIs               | PhanQuyen = 'superadmin'          |
| **Manager**    | Managed employees only | QuanLyNhanVien.LoaiQuanLy = 'KPI' |
| **User**       | None                   | Reject with PERMISSION_DENIED     |

### 4.5. Validation Error Response Format

**Structured error response for frontend handling:**

```javascript
// If all KPIs failed validation
if (validKPIs.length === 0 && failedKPIs.length > 0) {
  return sendResponse(
    res,
    400,
    false,
    null,
    {
      message: "Không có KPI nào hợp lệ để duyệt",
      failed: failedKPIs,
      summary: {
        total: danhGiaKPIIds.length,
        successCount: 0,
        failedCount: failedKPIs.length,
      },
    },
    "Validation failed"
  );
}

// If partial success (some valid, some invalid)
// Continue with transaction for validKPIs
// Return both approved and failed lists in response
```

**Error Response Schema:**

```typescript
interface BatchApproveErrorResponse {
  success: false;
  data: null;
  errors: {
    message: string;
    failed: Array<{
      _id: string;
      NhanVienID: { Ten: string; _id: string };
      error: string; // User-friendly message
      errorCode: string; // Machine-readable code
    }>;
    summary: {
      total: number;
      successCount: number;
      failedCount: number;
    };
  };
}
```

---

## 5. Transaction Management {#5-transaction-management}

### 5.1. ACID Properties in Batch Operations

**MongoDB transactions guarantee ACID compliance:**

| Property        | Implementation                            | Benefit                                   |
| --------------- | ----------------------------------------- | ----------------------------------------- |
| **Atomicity**   | All operations in session commit together | All-or-nothing guarantee                  |
| **Consistency** | Pre-validation before transaction start   | Invalid data never persisted              |
| **Isolation**   | Session isolates changes                  | No dirty reads from concurrent operations |
| **Durability**  | Write concern majority                    | Data survives server crashes              |

### 5.2. Transaction Workflow

**Step-by-step transaction execution:**

```javascript
// ========== TRANSACTION EXECUTION ==========

const session = await mongoose.startSession();
session.startTransaction();

try {
  // ========== STEP 1: BATCH UPDATE EVALUATIONS ==========
  for (const kpi of validKPIs) {
    // Load evaluations with session
    const evaluations = await DanhGiaNhiemVuThuongQuy.find({
      DanhGiaKPIID: kpi._id,
      isDeleted: false,
    }).session(session); // ← Attach session

    // Calculate TongDiemKPI
    const tongDiemKPI = evaluations.reduce(
      (sum, ev) => sum + (ev.DiemNhiemVu || 0),
      0
    );

    // ========== STEP 2: UPDATE KPI ==========
    kpi.TongDiemKPI = tongDiemKPI;
    kpi.TrangThai = "DA_DUYET";
    kpi.NgayDuyet = new Date();
    kpi.NguoiDuyet = nguoiDuyetId;

    // ========== STEP 3: APPEND AUDIT TRAIL ==========
    kpi.LichSuDuyet.push({
      NguoiDuyet: nguoiDuyetId,
      NgayDuyet: new Date(),
      NhanXet: nhanXet || `Duyệt hàng loạt (${validKPIs.length} KPI)`,
    });

    // Save with session
    await kpi.save({ session }); // ← Attach session

    approvedKPIs.push(kpi);
  }

  // ========== STEP 4: COMMIT TRANSACTION ==========
  await session.commitTransaction();
  console.log(`✅ Transaction committed: ${approvedKPIs.length} KPIs approved`);
} catch (error) {
  // ========== ROLLBACK ON ERROR ==========
  await session.abortTransaction();
  console.error("❌ Transaction aborted:", error.message);
  throw error;
} finally {
  // ========== CLEANUP ==========
  session.endSession();
}
```

### 5.3. Session Configuration

**Recommended transaction settings:**

```javascript
// Start session with options
const session = await mongoose.startSession({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
  readPreference: "primary",
});

session.startTransaction({
  readConcern: { level: "snapshot" },
  writeConcern: { w: "majority" },
  maxCommitTimeMS: 30000, // 30 seconds timeout
});
```

**Configuration Options:**

| Option            | Value      | Purpose                          |
| ----------------- | ---------- | -------------------------------- |
| `readConcern`     | "snapshot" | Read consistent data snapshot    |
| `writeConcern`    | "majority" | Wait for majority acknowledgment |
| `readPreference`  | "primary"  | Read from primary node only      |
| `maxCommitTimeMS` | 30000      | Transaction timeout (30s)        |

### 5.4. Retry Logic for Transient Errors

**Handle transient transaction errors:**

```javascript
async function batchApproveWithRetry(validKPIs, maxRetries = 3) {
  let attempt = 0;

  while (attempt < maxRetries) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ... transaction logic
      await session.commitTransaction();
      return { success: true, approved: approvedKPIs };
    } catch (error) {
      await session.abortTransaction();

      // Check if error is transient (retry-able)
      const isTransientError =
        error.hasErrorLabel?.("TransientTransactionError") ||
        error.code === 112 || // WriteConflict
        error.code === 251; // NoSuchTransaction

      if (isTransientError && attempt < maxRetries - 1) {
        attempt++;
        console.warn(`⚠️ Transient error, retry ${attempt}/${maxRetries}`);
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        continue;
      }

      throw error; // Non-transient or max retries exceeded
    } finally {
      session.endSession();
    }
  }
}
```

### 5.5. Transaction Size Limits

**MongoDB transaction constraints:**

| Limit                    | Value      | Mitigation                 |
| ------------------------ | ---------- | -------------------------- |
| **Max transaction size** | 16 MB      | Split into smaller batches |
| **Max transaction time** | 60 seconds | Set appropriate timeout    |
| **Max operations**       | ~1000      | Limit batch size to 50     |

**Batch Size Calculation:**

```javascript
// Estimate transaction size
function estimateTransactionSize(kpiCount) {
  const avgKPISize = 2 * 1024; // 2 KB per KPI update
  const avgEvaluationSize = 1 * 1024; // 1 KB per evaluation
  const avgEvaluationsPerKPI = 8;

  return kpiCount * (avgKPISize + avgEvaluationSize * avgEvaluationsPerKPI);
}

// Auto-adjust batch size
const MAX_TRANSACTION_SIZE = 10 * 1024 * 1024; // 10 MB safe limit
const maxBatchSize = Math.floor(
  MAX_TRANSACTION_SIZE / estimateTransactionSize(1)
);

console.log(`Recommended max batch size: ${maxBatchSize}`); // ~50-60 KPIs
```

---

## 6. Performance Optimization {#6-performance-optimization}

### 6.1. Database Query Optimization

**Batch operations reduce round trips:**

```javascript
// ❌ BAD: N+1 queries (sequential)
for (const kpiId of danhGiaKPIIds) {
  const kpi = await DanhGiaKPI.findById(kpiId);
  const evaluations = await DanhGiaNhiemVuThuongQuy.find({
    DanhGiaKPIID: kpiId,
  });
  // Process...
}
// Total: 2N queries for N KPIs

// ✅ GOOD: Batch queries (parallel)
const danhSachKPI = await DanhGiaKPI.find({
  _id: { $in: danhGiaKPIIds },
}).populate("NhanVienID ChuKyDanhGiaID");

const allEvaluations = await DanhGiaNhiemVuThuongQuy.find({
  DanhGiaKPIID: { $in: danhGiaKPIIds },
});

// Group evaluations by KPI ID
const evaluationsByKPI = allEvaluations.reduce((acc, ev) => {
  const kpiId = ev.DanhGiaKPIID.toString();
  if (!acc[kpiId]) acc[kpiId] = [];
  acc[kpiId].push(ev);
  return acc;
}, {});
// Total: 2 queries regardless of N
```

**Query Performance Comparison:**

| Approach   | KPIs | Queries | Time | Improvement    |
| ---------- | ---- | ------- | ---- | -------------- |
| Sequential | 10   | 20      | 2.4s | -              |
| Batch      | 10   | 2       | 0.3s | **87% faster** |
| Sequential | 50   | 100     | 12s  | -              |
| Batch      | 50   | 2       | 0.5s | **96% faster** |

### 6.2. Parallel Permission Checks

**Check permissions for all KPIs at once:**

```javascript
// ❌ BAD: Sequential permission checks
for (const kpi of danhSachKPI) {
  const hasPermission = await QuanLyNhanVien.findOne({
    NhanVienQuanLy: nguoiDuyetId,
    NhanVienDuocQuanLy: kpi.NhanVienID._id,
    LoaiQuanLy: "KPI",
  });
  if (!hasPermission) {
    failedKPIs.push(kpi);
  }
}
// N queries

// ✅ GOOD: Batch permission check
const nhanVienIds = danhSachKPI.map((kpi) => kpi.NhanVienID._id);

const quanLyList = await QuanLyNhanVien.find({
  NhanVienQuanLy: nguoiDuyetId,
  NhanVienDuocQuanLy: { $in: nhanVienIds },
  LoaiQuanLy: "KPI",
  isDeleted: false,
});

const allowedSet = new Set(
  quanLyList.map((ql) => ql.NhanVienDuocQuanLy.toString())
);

for (const kpi of danhSachKPI) {
  if (!allowedSet.has(kpi.NhanVienID._id.toString())) {
    failedKPIs.push(kpi);
  }
}
// 1 query + O(1) lookup
```

### 6.3. Eager Loading with Populate

**Load related data upfront:**

```javascript
// Populate all relationships in single query
const danhSachKPI = await DanhGiaKPI.find({
  _id: { $in: danhGiaKPIIds },
  isDeleted: false,
})
  .populate({
    path: "NhanVienID",
    select: "Ten MaNhanVien Email KhoaID",
    populate: {
      path: "KhoaID",
      select: "TenKhoa",
    },
  })
  .populate({
    path: "ChuKyDanhGiaID",
    select: "TenChuKy NgayBatDau NgayKetThuc TrangThai",
  })
  .populate({
    path: "NguoiDanhGiaID",
    select: "Ten",
  })
  .lean(); // Convert to plain objects for faster access
```

### 6.4. Notification Batching

**Send notifications efficiently:**

```javascript
// ❌ BAD: Send notifications sequentially
for (const kpi of approvedKPIs) {
  await notificationService.notify("kpi-duyet-tieu-chi", {
    danhGiaKPI: kpi,
    nguoiThucHien: nguoiDuyetId,
  });
}
// N network calls

// ✅ GOOD: Batch notifications
await Promise.all(
  approvedKPIs.map((kpi) =>
    notificationService.notify("kpi-duyet-tieu-chi", {
      danhGiaKPI: kpi,
      nguoiThucHien: nguoiDuyetId,
    })
  )
);
// N parallel calls (much faster)

// ✅ BEST: Single batch notification event
await notificationService.notifyBatch("kpi-batch-approve", {
  danhGiaKPIs: approvedKPIs,
  nguoiThucHien: nguoiDuyetId,
  count: approvedKPIs.length,
});
// 1 network call
```

### 6.5. Caching Strategies

**Cache frequently accessed data:**

```javascript
// Cache chu kỳ đánh giá (rarely changes)
const chuKyCache = new Map();

async function getChuKyWithCache(chuKyId) {
  if (chuKyCache.has(chuKyId)) {
    return chuKyCache.get(chuKyId);
  }

  const chuKy = await ChuKyDanhGia.findById(chuKyId).lean();
  chuKyCache.set(chuKyId, chuKy);

  // Auto-expire after 5 minutes
  setTimeout(() => chuKyCache.delete(chuKyId), 5 * 60 * 1000);

  return chuKy;
}

// Cache management relationships (changes infrequently)
const quanLyCache = new Map();

async function getQuanLyRelationships(nguoiDuyetId) {
  const cacheKey = `quanly_${nguoiDuyetId}`;

  if (quanLyCache.has(cacheKey)) {
    return quanLyCache.get(cacheKey);
  }

  const relations = await QuanLyNhanVien.find({
    NhanVienQuanLy: nguoiDuyetId,
    LoaiQuanLy: "KPI",
    isDeleted: false,
  }).lean();

  quanLyCache.set(cacheKey, relations);
  setTimeout(() => quanLyCache.delete(cacheKey), 10 * 60 * 1000);

  return relations;
}
```

### 6.6. Index Optimization

**Ensure proper indexes exist:**

```javascript
// Recommended indexes for batch operations

// DanhGiaKPI collection
DanhGiaKPI.index({ TrangThai: 1, ChuKyDanhGiaID: 1 });
DanhGiaKPI.index({ NhanVienID: 1, ChuKyDanhGiaID: 1 });
DanhGiaKPI.index({ isDeleted: 1, TrangThai: 1 });

// DanhGiaNhiemVuThuongQuy collection
DanhGiaNhiemVuThuongQuy.index({ DanhGiaKPIID: 1, isDeleted: 1 });

// QuanLyNhanVien collection (critical for permissions)
QuanLyNhanVien.index({
  NhanVienQuanLy: 1,
  LoaiQuanLy: 1,
  isDeleted: 1,
});
QuanLyNhanVien.index({
  NhanVienDuocQuanLy: 1,
  LoaiQuanLy: 1,
  isDeleted: 1,
});

// Compound index for batch permission checks
QuanLyNhanVien.index({
  NhanVienQuanLy: 1,
  NhanVienDuocQuanLy: 1,
  LoaiQuanLy: 1,
  isDeleted: 1,
});
```

---

## 7. Error Handling {#7-error-handling}

### 7.1. Error Categories

**Four main error types in batch operations:**

```mermaid
graph TD
    A[Batch Request] --> B{Error Type?}
    B -->|Input| C[400 Bad Request]
    B -->|Permission| D[403 Forbidden]
    B -->|Business| E[400 Validation]
    B -->|System| F[500 Internal]

    C --> G[Return immediately]
    D --> G
    E --> H[Partial success]
    F --> I[Rollback transaction]

    style C fill:#f59e0b
    style D fill:#ef4444
    style E fill:#f59e0b
    style F fill:#dc2626
```

### 7.2. Partial Success Handling

**Graceful degradation for mixed results:**

```javascript
// Separate KPIs into valid and failed
const validKPIs = [];
const failedKPIs = [];

for (const kpi of danhSachKPI) {
  try {
    // Validate this specific KPI
    validateKPIForApproval(kpi);
    validKPIs.push(kpi);
  } catch (error) {
    failedKPIs.push({
      _id: kpi._id,
      NhanVienID: kpi.NhanVienID,
      error: error.message,
      errorCode: error.code || "VALIDATION_FAILED",
    });
  }
}

// Return structured response
return sendResponse(
  res,
  200, // Still 200 OK for partial success
  true,
  {
    approved: approvedKPIs,
    failed: failedKPIs,
    summary: {
      total: danhGiaKPIIds.length,
      successCount: approvedKPIs.length,
      failedCount: failedKPIs.length,
    },
  },
  null,
  `Duyệt ${approvedKPIs.length}/${danhGiaKPIIds.length} KPI thành công`
);
```

### 7.3. Transaction Rollback Scenarios

**When to rollback vs continue:**

| Scenario                    | Action                   | Reason             |
| --------------------------- | ------------------------ | ------------------ |
| **All KPIs invalid**        | Abort before transaction | No work to do      |
| **Mixed valid/invalid**     | Process valid ones       | Partial success OK |
| **Transaction error**       | Rollback all             | Data integrity     |
| **Network error**           | Retry transaction        | Transient failure  |
| **Permission denied (all)** | Abort immediately        | No authorization   |

### 7.4. Error Recovery Strategies

```javascript
// Comprehensive error handling
kpiController.batchApproveKPI = catchAsync(async (req, res, next) => {
  try {
    // ... validation and permission checks

    if (validKPIs.length === 0) {
      // CASE 1: All failed validation - no transaction needed
      return sendResponse(
        res,
        400,
        false,
        null,
        {
          message: "Không có KPI nào hợp lệ để duyệt",
          failed: failedKPIs,
          summary: {
            total: danhGiaKPIIds.length,
            successCount: 0,
            failedCount: failedKPIs.length,
          },
        },
        "Batch approval failed"
      );
    }

    // CASE 2: Some valid KPIs - proceed with transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ... approve valid KPIs
      await session.commitTransaction();

      // CASE 3: Transaction success
      return sendResponse(
        res,
        200,
        true,
        {
          approved: approvedKPIs,
          failed: failedKPIs,
          summary: {
            total: danhGiaKPIIds.length,
            successCount: approvedKPIs.length,
            failedCount: failedKPIs.length,
          },
        },
        null,
        `Duyệt ${approvedKPIs.length}/${danhGiaKPIIds.length} KPI thành công`
      );
    } catch (txError) {
      // CASE 4: Transaction failed - rollback
      await session.abortTransaction();

      // Check if transient error (can retry)
      if (txError.hasErrorLabel?.("TransientTransactionError")) {
        throw new AppError(
          503,
          "Lỗi tạm thời, vui lòng thử lại sau",
          "TRANSIENT_ERROR",
          { retryable: true }
        );
      }

      // Non-transient error
      throw new AppError(
        500,
        `Lỗi duyệt KPI: ${txError.message}`,
        "TRANSACTION_FAILED",
        { originalError: txError }
      );
    } finally {
      session.endSession();
    }
  } catch (error) {
    // CASE 5: Unexpected error
    console.error("❌ Batch approve error:", error);

    // Log to monitoring service
    monitoringService.logError("batch-approve-kpi", error, {
      userId: req.user._id,
      kpiCount: danhGiaKPIIds.length,
    });

    // Return user-friendly error
    return next(error);
  }
});
```

### 7.5. Frontend Error Handling

**Display errors user-friendly:**

```javascript
// Redux thunk with comprehensive error handling
export const batchApproveKPI = (payload) => async (dispatch) => {
  dispatch(slice.actions.startSaving());

  try {
    const response = await apiService.post(
      "/workmanagement/kpi/batch-approve",
      payload
    );

    const { approved, failed, summary } = response.data.data;

    // Update Redux state
    dispatch(slice.actions.batchApproveSuccess({ approved }));

    // Show appropriate toast based on results
    if (failed.length === 0) {
      // All succeeded
      toast.success(`✅ Duyệt ${summary.successCount} KPI thành công!`);
    } else if (approved.length === 0) {
      // All failed
      toast.error(`❌ Không thể duyệt KPI nào (${summary.failedCount} lỗi)`);
    } else {
      // Partial success
      toast.warning(
        `⚠️ Duyệt ${summary.successCount}/${summary.total} KPI thành công. ` +
          `${summary.failedCount} KPI thất bại.`
      );
    }

    // Show detailed errors if any
    if (failed.length > 0) {
      dispatch(slice.actions.showBatchErrors(failed));
    }
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));

    // Handle different error types
    if (error.response?.status === 403) {
      toast.error("❌ Không có quyền duyệt KPI");
    } else if (error.response?.status === 503) {
      toast.error("⚠️ Lỗi tạm thời, vui lòng thử lại sau");
    } else {
      toast.error(`❌ Lỗi duyệt hàng loạt: ${error.message}`);
    }
  }
};
```

### 7.6. Error UI Components

**Display failed KPIs in a dialog:**

```javascript
function BatchErrorDialog({ open, onClose, failedKPIs }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <WarningIcon color="error" />
          <Typography variant="h6">
            {failedKPIs.length} KPI không thể duyệt
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Nhân viên</TableCell>
              <TableCell>Lý do</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {failedKPIs.map((item) => (
              <TableRow key={item._id}>
                <TableCell>{item.NhanVienID?.Ten}</TableCell>
                <TableCell>
                  <Chip
                    label={item.error}
                    color="error"
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
```

---

## 8. Best Practices {#8-best-practices}

### 8.1. For Managers (Using the Feature)

**Before Batch Approval:**

✅ **DO:**

- Review each KPI evaluation individually before selecting for batch approve
- Verify all criteria are scored and calculations are correct
- Check for outliers (unusually high/low scores) and investigate
- Add meaningful comments explaining batch approval context
- Use filters to group similar evaluations (same department, period, score range)
- Start with small batches (5-10 KPIs) until comfortable with the workflow

❌ **DON'T:**

- Blindly approve all KPIs without review
- Mix KPIs from different evaluation cycles
- Approve KPIs with incomplete scoring
- Use batch approve as a shortcut to avoid proper evaluation
- Approve during system maintenance windows
- Batch approve KPIs you don't have permission for

**During Batch Approval:**

```javascript
// Example: Good batch approval workflow
const approvalWorkflow = {
  step1: "Filter KPIs by status = CHUA_DUYET",
  step2: "Sort by department/score for grouping",
  step3: "Review top 10-15 KPIs visually",
  step4: "Select KPIs meeting criteria (e.g., score > 7.0)",
  step5: "Add comment: 'Batch approve Q4 2025 - All criteria met'",
  step6: "Click batch approve button",
  step7: "Review results (success/failed)",
  step8: "Handle failed items individually",
};
```

**After Batch Approval:**

- Review the success/failed summary carefully
- Investigate any failed approvals
- Notify employees of approval (automatic via system)
- Export reports for record-keeping
- Document any issues encountered for future reference

### 8.2. For Developers (Implementing/Maintaining)

**Code Organization:**

```javascript
// ✅ GOOD: Separate concerns
async function batchApproveKPI(req, res) {
  // 1. Validation layer (separate function)
  const { validKPIs, failedKPIs } = await validateBatchRequest(req);

  // 2. Permission check (separate function)
  await checkBatchPermissions(req.user, validKPIs);

  // 3. Transaction execution (separate function)
  const approved = await executeBatchTransaction(validKPIs);

  // 4. Notification (separate function)
  await sendBatchNotifications(approved);

  // 5. Response formatting (separate function)
  return formatBatchResponse(approved, failedKPIs);
}

// ❌ BAD: Everything in one giant function
async function batchApproveKPI(req, res) {
  // 500 lines of mixed logic...
}
```

**Error Handling Strategy:**

```javascript
// ✅ GOOD: Structured error handling
class BatchApprovalError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.timestamp = new Date();
  }
}

try {
  await batchApprove();
} catch (error) {
  if (error instanceof BatchApprovalError) {
    // Known error - log and return user-friendly message
    logger.warn("Batch approval failed", error.details);
    return sendResponse(res, 400, false, null, error.message);
  } else {
    // Unexpected error - log with full stack trace
    logger.error("Unexpected batch approval error", {
      error,
      stack: error.stack,
    });
    return sendResponse(res, 500, false, null, "Internal server error");
  }
}

// ❌ BAD: Generic error handling
try {
  await batchApprove();
} catch (error) {
  console.log(error); // No context
  res.status(500).send("Error"); // No details
}
```

**Testing Requirements:**

```javascript
// Minimum test coverage for batch operations
describe("Batch Approve KPI", () => {
  // Happy path
  it("should approve all valid KPIs", async () => {});

  // Validation errors
  it("should reject empty array", async () => {});
  it("should reject invalid ObjectIds", async () => {});
  it("should reject batch size > 50", async () => {});

  // Permission errors
  it("should reject if user has no permission", async () => {});
  it("should filter KPIs by permission", async () => {});

  // Business rule errors
  it("should skip already approved KPIs", async () => {});
  it("should skip incomplete evaluations", async () => {});

  // Transaction handling
  it("should rollback on transaction error", async () => {});
  it("should commit all changes together", async () => {});

  // Partial success
  it("should handle mixed valid/invalid KPIs", async () => {});

  // Performance
  it("should complete batch of 50 KPIs in < 3s", async () => {});
});
```

**Monitoring & Logging:**

```javascript
// ✅ GOOD: Comprehensive logging
async function batchApproveKPI(req, res) {
  const startTime = Date.now();
  const requestId = generateRequestId();

  logger.info("Batch approve started", {
    requestId,
    userId: req.user._id,
    kpiCount: req.body.danhGiaKPIIds.length,
  });

  try {
    const result = await processBatchApproval(req);

    logger.info("Batch approve completed", {
      requestId,
      duration: Date.now() - startTime,
      successCount: result.approved.length,
      failedCount: result.failed.length,
    });

    // Metrics for monitoring dashboard
    metrics.recordBatchOperation("approve", {
      count: result.approved.length,
      duration: Date.now() - startTime,
      success: true,
    });

    return result;
  } catch (error) {
    logger.error("Batch approve failed", {
      requestId,
      duration: Date.now() - startTime,
      error: error.message,
      stack: error.stack,
    });

    metrics.recordBatchOperation("approve", {
      count: 0,
      duration: Date.now() - startTime,
      success: false,
      errorCode: error.code,
    });

    throw error;
  }
}
```

### 8.3. Configuration Recommendations

**Environment Variables:**

```bash
# .env file
BATCH_APPROVE_MAX_SIZE=50           # Max KPIs per batch
BATCH_APPROVE_TIMEOUT=30000         # 30 seconds
BATCH_TRANSACTION_RETRY_COUNT=3    # Retry attempts for transient errors
BATCH_NOTIFICATION_ENABLED=true    # Send notifications
BATCH_CACHE_TTL=600                # Cache TTL (10 minutes)
```

**Database Configuration:**

```javascript
// MongoDB connection settings for batch operations
mongoose.connect(MONGODB_URI, {
  maxPoolSize: 20, // Increase pool for concurrent operations
  minPoolSize: 5,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000, // Higher timeout for batch operations
  retryWrites: true, // Auto-retry failed writes
  w: "majority", // Write concern for consistency
  readConcern: { level: "snapshot" }, // For transactions
});
```

**Security Recommendations:**

```javascript
// Rate limiting for batch operations
const batchApproveRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // Max 10 batch operations per minute per user
  message: "Quá nhiều yêu cầu duyệt hàng loạt. Vui lòng thử lại sau.",
  keyGenerator: (req) => req.user._id.toString(),
});

router.post(
  "/batch-approve",
  authentication.loginRequired,
  batchApproveRateLimiter,
  kpiController.batchApproveKPI
);

// Audit logging
async function auditBatchApprove(userId, kpiIds, result) {
  await AuditLog.create({
    action: "BATCH_APPROVE_KPI",
    userId,
    resourceType: "DanhGiaKPI",
    resourceIds: kpiIds,
    metadata: {
      successCount: result.approved.length,
      failedCount: result.failed.length,
      timestamp: new Date(),
    },
  });
}
```

---

## 9. Real-World Examples {#9-real-world-examples}

### 9.1. Example 1: End-of-Quarter Approval (Happy Path)

**Scenario**: Manager needs to approve KPIs for 15 team members at end of Q4 2025.

**Steps:**

1. **Filter evaluations**:

   ```javascript
   // Frontend filter state
   const filters = {
     chuKyId: "Q4-2025",
     trangThai: "CHUA_DUYET",
     khoaId: "ICU", // Manager's department
   };
   ```

2. **Review and select**:

   - Manager reviews list visually
   - All 15 employees have complete evaluations
   - Scores range from 7.5 to 9.2 (all good)
   - Selects all 15 KPIs using "Select All" checkbox

3. **Add context**:

   ```javascript
   const comment =
     "Duyệt KPI Quý 4/2025 - Khoa ICU - Tất cả hoàn thành xuất sắc";
   ```

4. **Submit batch approval**:

   ```javascript
   dispatch(
     batchApproveKPI({
       danhGiaKPIIds: selectedIds, // 15 IDs
       nhanXet: comment,
     })
   );
   ```

5. **Result**:

   ```javascript
   {
     success: true,
     data: {
       approved: [15 KPIs],
       failed: [],
       summary: {
         total: 15,
         successCount: 15,
         failedCount: 0,
       }
     },
     message: "Duyệt 15/15 KPI thành công"
   }
   ```

6. **Post-approval**:
   - System sends 15 notification emails to employees
   - Dashboard updates to show all approved
   - Manager exports PDF report for records

**Time saved**: ~15 minutes (vs individual approvals)

### 9.2. Example 2: Partial Success with Mixed Results

**Scenario**: Manager selects 10 KPIs, but 3 have issues.

**Request:**

```javascript
{
  danhGiaKPIIds: [
    "kpi1",
    "kpi2",
    "kpi3", // Valid
    "kpi4", // Already approved (skip)
    "kpi5",
    "kpi6", // Valid
    "kpi7", // Incomplete scoring (skip)
    "kpi8",
    "kpi9", // Valid
    "kpi10", // No permission (skip)
  ];
}
```

**Response:**

```javascript
{
  success: true,
  data: {
    approved: [
      { _id: "kpi1", NhanVienID: { Ten: "Nguyễn A" }, TongDiemKPI: 8.5 },
      { _id: "kpi2", NhanVienID: { Ten: "Trần B" }, TongDiemKPI: 7.8 },
      { _id: "kpi3", NhanVienID: { Ten: "Lê C" }, TongDiemKPI: 9.1 },
      { _id: "kpi5", NhanVienID: { Ten: "Phạm D" }, TongDiemKPI: 8.2 },
      { _id: "kpi6", NhanVienID: { Ten: "Hoàng E" }, TongDiemKPI: 7.5 },
      { _id: "kpi8", NhanVienID: { Ten: "Võ F" }, TongDiemKPI: 8.9 },
      { _id: "kpi9", NhanVienID: { Ten: "Đỗ G" }, TongDiemKPI: 8.0 },
    ],
    failed: [
      {
        _id: "kpi4",
        NhanVienID: { Ten: "Ngô H" },
        error: "KPI đã được duyệt trước đó",
        errorCode: "ALREADY_APPROVED"
      },
      {
        _id: "kpi7",
        NhanVienID: { Ten: "Bùi I" },
        error: "Chưa chấm đầy đủ (5/8 nhiệm vụ)",
        errorCode: "INCOMPLETE_EVALUATION"
      },
      {
        _id: "kpi10",
        NhanVienID: { Ten: "Phan J" },
        error: "Không có quyền duyệt KPI cho nhân viên này",
        errorCode: "PERMISSION_DENIED"
      }
    ],
    summary: {
      total: 10,
      successCount: 7,
      failedCount: 3
    }
  },
  message: "Duyệt 7/10 KPI thành công"
}
```

**Frontend Handling:**

```javascript
// Show warning toast
toast.warning(`⚠️ Duyệt 7/10 KPI thành công. 3 KPI thất bại.`);

// Open error dialog showing failed items
dispatch(showBatchErrorDialog(failedKPIs));

// Manager actions:
// 1. kpi4: Ignore (already approved)
// 2. kpi7: Go to evaluation, complete scoring, approve individually
// 3. kpi10: Contact admin to fix permissions
```

### 9.3. Example 3: Department-Wide Approval by Admin

**Scenario**: Admin approves all pending KPIs for entire hospital (50+ KPIs).

**Strategy**: Split into batches of 50 to avoid timeout.

```javascript
// Frontend: Auto-batch splitting
async function approveLargeBatch(kpiIds, batchSize = 50) {
  const batches = [];
  for (let i = 0; i < kpiIds.length; i += batchSize) {
    batches.push(kpiIds.slice(i, i + batchSize));
  }

  const results = {
    approved: [],
    failed: [],
  };

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    toast.info(
      `Đang xử lý batch ${i + 1}/${batches.length} (${batch.length} KPIs)...`
    );

    try {
      const response = await apiService.post("/kpi/batch-approve", {
        danhGiaKPIIds: batch,
        nhanXet: `Admin approval - Batch ${i + 1}/${batches.length}`,
      });

      results.approved.push(...response.data.data.approved);
      results.failed.push(...response.data.data.failed);

      // Wait 1 second between batches to avoid overwhelming DB
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      toast.error(`Lỗi batch ${i + 1}: ${error.message}`);
      break; // Stop on error
    }
  }

  // Final summary
  toast.success(
    `✅ Hoàn thành! Duyệt ${results.approved.length} KPI, ` +
      `${results.failed.length} thất bại.`
  );

  return results;
}

// Usage
const allPendingKPIs = danhSachKPI
  .filter((kpi) => kpi.TrangThai === "CHUA_DUYET")
  .map((kpi) => kpi._id);

await approveLargeBatch(allPendingKPIs); // 120 KPIs → 3 batches
```

### 9.4. Example 4: Conditional Batch Approval

**Scenario**: Approve only KPIs with score ≥ 8.0 automatically.

```javascript
// Frontend: Filter before batch approve
const highPerformingKPIs = danhSachKPI.filter((kpi) => {
  // Must be pending approval
  if (kpi.TrangThai !== "CHUA_DUYET") return false;

  // Must have score calculated
  if (!kpi.TongDiemKPI) return false;

  // Must meet threshold
  if (kpi.TongDiemKPI < 8.0) return false;

  return true;
});

// Batch approve high performers
dispatch(
  batchApproveKPI({
    danhGiaKPIIds: highPerformingKPIs.map((kpi) => kpi._id),
    nhanXet: "Auto-approve: High performers (≥ 8.0)",
  })
);

// Low performers require individual review
const needsReview = danhSachKPI.filter(
  (kpi) => kpi.TrangThai === "CHUA_DUYET" && kpi.TongDiemKPI < 8.0
);

toast.info(`${needsReview.length} KPI cần review thêm (điểm < 8.0)`);
```

---

## 10. Edge Cases & Solutions {#10-edge-cases}

### 10.1. Empty Selection

**Problem**: User clicks "Batch Approve" with 0 KPIs selected.

**Solution**:

```javascript
// Frontend validation
const handleBatchApprove = () => {
  if (selectedKPIIds.length === 0) {
    toast.warning("Vui lòng chọn ít nhất 1 KPI để duyệt");
    return;
  }

  dispatch(batchApproveKPI({ danhGiaKPIIds: selectedKPIIds }));
};

// Disable button when nothing selected
<Button disabled={selectedKPIIds.length === 0} onClick={handleBatchApprove}>
  Duyệt {selectedKPIIds.length > 0 ? `${selectedKPIIds.length} ` : ""}KPI
</Button>;
```

### 10.2. All KPIs Already Approved

**Problem**: User selects 10 KPIs but all were already approved by someone else.

**Solution**:

```javascript
// Backend response
if (
  validKPIs.length === 0 &&
  failedKPIs.every((f) => f.errorCode === "ALREADY_APPROVED")
) {
  return sendResponse(
    res,
    200,
    true,
    {
      approved: [],
      failed: failedKPIs,
      summary: {
        total: danhGiaKPIIds.length,
        successCount: 0,
        failedCount: failedKPIs.length,
      },
    },
    null,
    "Tất cả KPI đã được duyệt trước đó"
  );
}

// Frontend handling
if (response.data.summary.successCount === 0) {
  toast.info("ℹ️ Tất cả KPI đã được duyệt trước đó");
  dispatch(clearKPISelection());
  dispatch(refreshKPIList()); // Reload to get updated statuses
}
```

### 10.3. Network Timeout During Batch

**Problem**: Large batch takes >30s, connection times out.

**Solution**:

```javascript
// Backend: Increase timeout for batch operations
app.use("/api/workmanagement/kpi/batch-approve", (req, res, next) => {
  req.setTimeout(60000); // 60 seconds
  res.setTimeout(60000);
  next();
});

// Frontend: Show progress indicator
<Button onClick={handleBatchApprove} disabled={isProcessing}>
  {isProcessing ? (
    <>
      <CircularProgress size={16} sx={{ mr: 1 }} />
      Đang xử lý... ({elapsedTime}s)
    </>
  ) : (
    `Duyệt ${selectedKPIIds.length} KPI`
  )}
</Button>;

// Retry on timeout
try {
  await batchApprove();
} catch (error) {
  if (error.code === "ECONNABORTED" || error.code === "ETIMEDOUT") {
    const retry = await confirm("Timeout - Thử lại?");
    if (retry) {
      await batchApprove(); // Idempotent, safe to retry
    }
  }
}
```

### 10.4. Concurrent Batch Operations

**Problem**: Two managers try to approve same KPI simultaneously.

**Solution**:

```javascript
// Backend: Idempotency check at row level
for (const kpi of validKPIs) {
  // Re-check status inside transaction
  const freshKPI = await DanhGiaKPI.findById(kpi._id).session(session);

  if (freshKPI.TrangThai === "DA_DUYET") {
    // Someone else approved it during our request
    logger.warn(`KPI ${kpi._id} already approved - skipping`);
    failedKPIs.push({
      _id: kpi._id,
      error: "KPI đã được duyệt bởi người khác",
      errorCode: "CONCURRENT_APPROVAL",
    });
    continue;
  }

  // Safe to approve
  freshKPI.TrangThai = "DA_DUYET";
  await freshKPI.save({ session });
}

// MongoDB: Use optimistic locking with version field
const kpiSchema = new Schema({
  // ... other fields
  __v: { type: Number, default: 0 }, // Mongoose version key
});

// Update with version check
await DanhGiaKPI.findOneAndUpdate(
  { _id: kpiId, __v: expectedVersion },
  { $set: { TrangThai: "DA_DUYET" }, $inc: { __v: 1 } },
  { session }
);
```

### 10.5. Permission Changes Mid-Request

**Problem**: Manager's permissions revoked while batch request is processing.

**Solution**:

```javascript
// Backend: Check permissions at transaction start
const permissionsAtStart = await getManagerPermissions(nguoiDuyetId);

// ... process batch

// Re-check permissions before commit (if long-running)
if (Date.now() - startTime > 10000) {
  // 10 seconds
  const currentPermissions = await getManagerPermissions(nguoiDuyetId);

  if (
    JSON.stringify(currentPermissions) !== JSON.stringify(permissionsAtStart)
  ) {
    throw new AppError(
      403,
      "Quyền hạn đã thay đổi trong quá trình xử lý. Vui lòng thử lại.",
      "PERMISSION_CHANGED"
    );
  }
}
```

### 10.6. Database Connection Lost

**Problem**: MongoDB connection drops during transaction.

**Solution**:

```javascript
// Mongoose connection events
mongoose.connection.on("disconnected", () => {
  logger.error("MongoDB disconnected!");
  // Set flag to reject new batch operations
  global.dbConnectionLost = true;
});

mongoose.connection.on("reconnected", () => {
  logger.info("MongoDB reconnected");
  global.dbConnectionLost = false;
});

// Check before starting batch operation
if (global.dbConnectionLost) {
  throw new AppError(
    503,
    "Mất kết nối database. Vui lòng thử lại sau.",
    "DB_CONNECTION_LOST"
  );
}

// Auto-retry logic for transient connection errors
const maxRetries = 3;
for (let attempt = 0; attempt < maxRetries; attempt++) {
  try {
    return await batchApproveWithTransaction();
  } catch (error) {
    if (error.name === "MongoNetworkError" && attempt < maxRetries - 1) {
      await new Promise((r) => setTimeout(r, 2000)); // Wait 2s
      continue;
    }
    throw error;
  }
}
```

### 10.7. Mixed Cycle KPIs

**Problem**: User accidentally selects KPIs from different evaluation cycles.

**Solution**:

```javascript
// Backend validation
const uniqueCycles = [
  ...new Set(danhSachKPI.map((kpi) => kpi.ChuKyDanhGiaID._id.toString())),
];

if (uniqueCycles.length > 1) {
  throw new AppError(
    400,
    `KPIs thuộc ${uniqueCycles.length} chu kỳ khác nhau. ` +
      `Vui lòng chỉ chọn KPIs của cùng một chu kỳ.`,
    "MIXED_CYCLES",
    { cycles: uniqueCycles }
  );
}

// Frontend: Group by cycle in UI
const kpisByCycle = groupBy(danhSachKPI, "ChuKyDanhGiaID._id");

{
  Object.entries(kpisByCycle).map(([cycleId, kpis]) => (
    <Accordion key={cycleId}>
      <AccordionSummary>
        <Typography>Chu kỳ: {kpis[0].ChuKyDanhGiaID.TenChuKy}</Typography>
      </AccordionSummary>
      <AccordionDetails>{/* Table of KPIs for this cycle */}</AccordionDetails>
    </Accordion>
  ));
}
```

### 10.8. Incomplete Evaluations at Scale

**Problem**: 100 KPIs submitted, 80 have incomplete scoring.

**Solution**:

```javascript
// Frontend: Pre-validation before submit
const checkCompleteness = async (kpiIds) => {
  const response = await apiService.post("/kpi/check-completeness", {
    danhGiaKPIIds: kpiIds,
  });

  const incomplete = response.data.data.incomplete;

  if (incomplete.length > 0) {
    const proceed = await confirm(
      `${incomplete.length}/${kpiIds.length} KPIs chưa hoàn thành. ` +
        `Chỉ duyệt KPIs đã hoàn thành?`
    );

    if (proceed) {
      // Filter out incomplete ones
      return kpiIds.filter((id) => !incomplete.includes(id));
    }

    return null; // Cancel
  }

  return kpiIds;
};

// Usage
const validIds = await checkCompleteness(selectedKPIIds);
if (validIds) {
  dispatch(batchApproveKPI({ danhGiaKPIIds: validIds }));
}
```

---

## 11. Testing Guide {#11-testing-guide}

### 11.1. Unit Tests (Backend)

```javascript
// tests/unit/kpi.controller.test.js
const { batchApproveKPI } = require("../controllers/kpi.controller");
const { DanhGiaKPI, QuanLyNhanVien } = require("../models");

describe("Batch Approve KPI - Unit Tests", () => {
  let req, res, mockSession;

  beforeEach(() => {
    req = {
      body: { danhGiaKPIIds: [] },
      user: { _id: "user1", NhanVienID: "nv1", PhanQuyen: "manager" },
      currentNhanVienID: "nv1",
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockSession = {
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    };

    jest.spyOn(mongoose, "startSession").mockResolvedValue(mockSession);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Input Validation", () => {
    test("should reject empty array", async () => {
      req.body.danhGiaKPIIds = [];

      await batchApproveKPI(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errors: expect.objectContaining({
            message: expect.stringContaining("không được rỗng"),
          }),
        })
      );
    });

    test("should reject batch size > 50", async () => {
      req.body.danhGiaKPIIds = Array(51).fill("validObjectId");

      await batchApproveKPI(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          errors: expect.objectContaining({
            message: expect.stringContaining("tối đa 50"),
          }),
        })
      );
    });

    test("should reject invalid ObjectIds", async () => {
      req.body.danhGiaKPIIds = ["invalid-id", "also-invalid"];

      await batchApproveKPI(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Permission Checks", () => {
    test("should allow admin to approve all KPIs", async () => {
      req.user.PhanQuyen = "admin";
      req.body.danhGiaKPIIds = ["kpi1", "kpi2"];

      jest.spyOn(DanhGiaKPI, "find").mockResolvedValue([
        { _id: "kpi1", TrangThai: "CHUA_DUYET" },
        { _id: "kpi2", TrangThai: "CHUA_DUYET" },
      ]);

      await batchApproveKPI(req, res);

      expect(mockSession.commitTransaction).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
    });

    test("should filter KPIs by manager permission", async () => {
      req.body.danhGiaKPIIds = ["kpi1", "kpi2", "kpi3"];

      jest.spyOn(QuanLyNhanVien, "find").mockResolvedValue([
        { NhanVienDuocQuanLy: "nv1" }, // Only kpi1 allowed
      ]);

      await batchApproveKPI(req, res);

      // Should only approve kpi1, reject kpi2/kpi3
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            approved: expect.arrayContaining([
              expect.objectContaining({ _id: "kpi1" }),
            ]),
            failed: expect.arrayContaining([
              expect.objectContaining({
                _id: "kpi2",
                errorCode: "PERMISSION_DENIED",
              }),
            ]),
          }),
        })
      );
    });
  });

  describe("Transaction Handling", () => {
    test("should rollback on error", async () => {
      req.body.danhGiaKPIIds = ["kpi1"];

      jest.spyOn(DanhGiaKPI, "find").mockRejectedValue(new Error("DB Error"));

      await batchApproveKPI(req, res);

      expect(mockSession.abortTransaction).toHaveBeenCalled();
      expect(mockSession.commitTransaction).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
    });

    test("should commit all changes together", async () => {
      // ... test implementation
    });
  });
});
```

### 11.2. Integration Tests

```javascript
// tests/integration/batch-approve.test.js
const request = require("supertest");
const app = require("../app");
const { setupTestDB, teardownTestDB } = require("../test-helpers");

describe("Batch Approve API - Integration Tests", () => {
  let authToken, testKPIs;

  beforeAll(async () => {
    await setupTestDB();

    // Create test data
    const user = await createTestUser({ PhanQuyen: "manager" });
    authToken = generateAuthToken(user);

    testKPIs = await createTestKPIs(10); // 10 test KPIs
  });

  afterAll(async () => {
    await teardownTestDB();
  });

  test("POST /api/workmanagement/kpi/batch-approve - success", async () => {
    const kpiIds = testKPIs.map((kpi) => kpi._id.toString());

    const response = await request(app)
      .post("/api/workmanagement/kpi/batch-approve")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        danhGiaKPIIds: kpiIds,
        nhanXet: "Integration test approval",
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.approved).toHaveLength(10);
    expect(response.body.data.failed).toHaveLength(0);

    // Verify database state
    const kpis = await DanhGiaKPI.find({ _id: { $in: kpiIds } });
    kpis.forEach((kpi) => {
      expect(kpi.TrangThai).toBe("DA_DUYET");
      expect(kpi.NgayDuyet).toBeDefined();
      expect(kpi.LichSuDuyet).toHaveLength(1);
    });
  });

  test("POST /api/workmanagement/kpi/batch-approve - partial success", async () => {
    const validKPIs = await createTestKPIs(3);
    const approvedKPI = await createTestKPI({ TrangThai: "DA_DUYET" });
    const incompleteKPI = await createTestKPI({ hasIncompleteScoring: true });

    const kpiIds = [
      ...validKPIs.map((k) => k._id),
      approvedKPI._id,
      incompleteKPI._id,
    ];

    const response = await request(app)
      .post("/api/workmanagement/kpi/batch-approve")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ danhGiaKPIIds: kpiIds })
      .expect(200);

    expect(response.body.data.approved).toHaveLength(3);
    expect(response.body.data.failed).toHaveLength(2);

    const failedCodes = response.body.data.failed.map((f) => f.errorCode);
    expect(failedCodes).toContain("ALREADY_APPROVED");
    expect(failedCodes).toContain("INCOMPLETE_EVALUATION");
  });
});
```

### 11.3. End-to-End Tests (E2E)

```javascript
// tests/e2e/batch-approve.spec.js (Playwright/Cypress)
describe("Batch Approve KPI - E2E Tests", () => {
  beforeEach(() => {
    cy.login("manager@hospital.com", "password");
    cy.visit("/kpi/evaluation");
  });

  it("should approve multiple KPIs from table", () => {
    // 1. Wait for table to load
    cy.get('[data-testid="kpi-table"]').should("be.visible");

    // 2. Select 3 KPIs using checkboxes
    cy.get('[data-testid="kpi-row"]')
      .first()
      .find('input[type="checkbox"]')
      .check();
    cy.get('[data-testid="kpi-row"]')
      .eq(1)
      .find('input[type="checkbox"]')
      .check();
    cy.get('[data-testid="kpi-row"]')
      .eq(2)
      .find('input[type="checkbox"]')
      .check();

    // 3. Verify selection counter
    cy.get('[data-testid="selection-counter"]').should(
      "contain",
      "3 được chọn"
    );

    // 4. Click batch approve button
    cy.get('[data-testid="batch-approve-btn"]').click();

    // 5. Verify success toast
    cy.get(".Toastify__toast--success")
      .should("be.visible")
      .and("contain", "Duyệt 3/3 KPI thành công");

    // 6. Verify table updates (badges change to "Đã duyệt")
    cy.get('[data-testid="kpi-row"]')
      .first()
      .find('[data-testid="status-badge"]')
      .should("contain", "Đã duyệt");

    // 7. Verify selection cleared
    cy.get('[data-testid="selection-counter"]').should("not.exist");
  });

  it("should handle partial success correctly", () => {
    // Select mix of valid and invalid KPIs
    // ... test implementation
  });

  it("should show error dialog for failed KPIs", () => {
    // ... test implementation
  });
});
```

### 11.4. Performance Tests

```javascript
// tests/performance/batch-approve.perf.js
const { performance } = require("perf_hooks");

describe("Batch Approve Performance Tests", () => {
  test("should complete batch of 50 KPIs in < 3 seconds", async () => {
    const kpiIds = await createTestKPIs(50);

    const startTime = performance.now();

    await request(app)
      .post("/api/workmanagement/kpi/batch-approve")
      .set("Authorization", `Bearer ${authToken}`)
      .send({ danhGiaKPIIds: kpiIds })
      .expect(200);

    const duration = performance.now() - startTime;

    expect(duration).toBeLessThan(3000); // 3 seconds
  });

  test("should handle concurrent batch requests", async () => {
    const kpiIds1 = await createTestKPIs(10);
    const kpiIds2 = await createTestKPIs(10);

    // Send 2 batch requests simultaneously
    const [response1, response2] = await Promise.all([
      request(app)
        .post("/api/workmanagement/kpi/batch-approve")
        .set("Authorization", `Bearer ${authToken1}`)
        .send({ danhGiaKPIIds: kpiIds1 }),
      request(app)
        .post("/api/workmanagement/kpi/batch-approve")
        .set("Authorization", `Bearer ${authToken2}`)
        .send({ danhGiaKPIIds: kpiIds2 }),
    ]);

    // Both should succeed
    expect(response1.body.success).toBe(true);
    expect(response2.body.success).toBe(true);
  });
});
```

### 11.5. Manual Testing Checklist

**Test Scenarios:**

- [ ] **Happy Path**
  - [ ] Select 5 KPIs, all valid → All approved
  - [ ] Select 10 KPIs → All approved
  - [ ] Select 50 KPIs (max) → All approved
- [ ] **Validation Errors**
  - [ ] Try to approve with 0 selected → Button disabled
  - [ ] Try to approve 51 KPIs → Error message
  - [ ] Select already approved KPI → Skipped with message
- [ ] **Permission Errors**
  - [ ] Manager tries to approve KPI of non-managed employee → Permission denied
  - [ ] Admin approves any KPI → Success
- [ ] **Business Rule Violations**
  - [ ] Approve KPI with incomplete scoring → Skipped with error
  - [ ] Approve KPI from closed cycle → Error message
- [ ] **UI/UX**
  - [ ] Select all checkbox works correctly
  - [ ] Individual checkboxes work
  - [ ] Selection counter updates
  - [ ] Loading state shows during processing
  - [ ] Success toast appears
  - [ ] Failed items show in error dialog
  - [ ] Table refreshes after approval
- [ ] **Mobile Responsiveness**
  - [ ] Long press to select works on mobile
  - [ ] FAB appears on mobile
  - [ ] Bottom sheet shows batch actions
- [ ] **Edge Cases**
  - [ ] Network timeout → Retry works
  - [ ] Concurrent approvals → Handled correctly
  - [ ] Database disconnect → Error message
  - [ ] Mixed cycle KPIs → Validation error

---

## 🔗 Related Documents

- [00_OVERVIEW.md](./00_OVERVIEW.md) - System architecture
- [04_APPROVAL_WORKFLOW.md](./04_APPROVAL_WORKFLOW.md) - Single approval workflow
- [03_CALCULATION_FORMULAS.md](./03_CALCULATION_FORMULAS.md) - TongDiemKPI calculation
- [08_REPORTS_EXPORT.md](./08_REPORTS_EXPORT.md) - Export after batch approval

---

**Tác giả**: GitHub Copilot (Claude Sonnet 4.5)  
**Cập nhật**: 5/1/2026  
**Version**: 2.1.1 (Criteria-Based KPI)
