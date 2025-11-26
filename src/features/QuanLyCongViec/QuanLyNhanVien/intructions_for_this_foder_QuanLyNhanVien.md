# Hướng dẫn triển khai chức năng Quản lý Nhân viên

> ⚠️ **LEGACY DOCUMENT - Planning/Implementation Guide**  
> **Status:** Archived  
> **Date:** November 2025  
> **Note:** Đây là tài liệu planning ban đầu khi xây dựng module. Code thực tế có thể khác với kế hoạch ban đầu.  
> **Tài liệu chính:** Xem [docs/README.md](./docs/README.md) để biết trạng thái hiện tại của module.

---

## Mục đích

Triển khai chức năng CRUD cho schema QuanLyNhanVien để cấu hình:

- Nhân viên quản lý có thể giao việc cho ai
- Nhân viên quản lý có thể chấm KPI cho ai

## Business Rules

1. **Loại quản lý**: Hai danh sách riêng biệt (Giao việc & Chấm KPI)
2. **Phân quyền**: Tạm thời không cần kiểm tra phân quyền
3. **Giới hạn**: Không giới hạn số lượng nhân viên có thể quản lý
4. **Xóa quan hệ**: Hiển thị cảnh báo trước khi xóa
5. **Lịch sử**: Không cần lưu lịch sử thay đổi
6. **Navigation**: Không cần breadcrumb navigation
7. **User Flow**: Chọn danh sách nhân viên qua dialog multi-select tương tự SelectHocVienForm

## Existing Context & Resources

### Backend Resources

- **Model**: `QuanLyNhanVien.js` - Schema đã có sẵn với các field cần thiết
- **NhanVien Model**: `NhanVien.js` - Model nhân viên với các field đầy đủ
- **Controller**: `nhanvien.controller.js` - Có sẵn các API cơ bản cho nhân viên
  - `getOneNhanVienByID()` - Hàm phức tạp cho hệ thống cũ (KHÔNG SỬA)
  - Cần bổ sung `getOneByNhanVienID()` - Hàm đơn giản chỉ trả thông tin cơ bản

### Frontend Resources

- **Redux**: `nhanvienSlice.js` - Slice có sẵn với state management cho nhân viên
  - `getAllNhanVien()` - Action lấy tất cả nhân viên
  - State structure đã có: `nhanviens[]`, `nhanvienCurrent`, `isLoading`, `error`
- **Multi-Select Pattern**: Tham khảo `SelectHocVienForm.js` và `SeLectHocVienTable.js`
  - `SelectHocVienForm.js` - Dialog fullscreen với AppBar
  - `SeLectHocVienTable.js` - Table với checkbox selection
  - `SelectTable.js` - Base table component hỗ trợ row selection

### Component Pattern Reference

```javascript
// SelectHocVienForm.js pattern:
- fullScreen Dialog với Transition
- AppBar với close button và select button
- onSelectedRowsChange callback để handle selection
- Validation trước khi mở dialog

// SeLectHocVienTable.js pattern:
- IndeterminateCheckbox cho select all/individual
- Filter để loại bỏ items đã selected
- useMemo để optimize data filtering
- SelectTable component với columns config
```

## Cấu trúc thư mục

```
QuanLyNhanVien/
├── quanLyNhanVienSlice.js              # Redux slice mới
├── QuanLyNhanVienButton.js             # Button trong NhanVienList
├── QuanLyNhanVienPage.js               # Trang chính /quanlynhanvien/:id
├── components/
│   ├── DanhSachGiaoViec.js             # Danh sách nhân viên giao việc
│   ├── DanhSachChamKPI.js              # Danh sách nhân viên chấm KPI
│   ├── SelectNhanVienQuanLyDialog.js   # Dialog chọn nhiều nhân viên (base on SelectHocVienForm)
│   ├── SelectNhanVienQuanLyTable.js    # Table select nhân viên (base on SeLectHocVienTable)
│   └── DeleteQuanLyButton.js           # Button xóa quan hệ với confirm
└── intructions_for_this_foder_QuanLyNhanVien.md
```

## Kế hoạch triển khai từng bước

### Phase 1: Backend API Development

#### 1.1 Backend Controller bổ sung

**File**: `/giaobanbv-be/controllers/nhanvien.controller.js`

**Bổ sung hàm mới (GIỮ NGUYÊN getOneNhanVienByID cũ):**

```javascript
// Hàm đơn giản chỉ trả thông tin cơ bản nhân viên
nhanvienController.getOneByNhanVienID = catchAsync(async (req, res, next) => {
  const nhanvienID = req.params.nhanvienID;

  let nhanvien = await NhanVien.findById(nhanvienID).populate("KhoaID");
  if (!nhanvien) {
    throw new AppError(400, "NhanVien not found");
  }

  return sendResponse(
    res,
    200,
    true,
    nhanvien,
    null,
    "Get NhanVien successful"
  );
});
```

#### 1.2 Controller QuanLyNhanVien

**File**: `/giaobanbv-be/modules/workmanagement/controllers/quanLyNhanVienController.js`

**API Endpoints cần tạo:**

```javascript
// GET /api/quanlynhanvien/giaoviec/:nhanVienId
// Lấy danh sách nhân viên được giao việc bởi nhanVienId
getGiaoViecByNhanVienQuanLy();

// GET /api/quanlynhanvien/chamkpi/:nhanVienId
// Lấy danh sách nhân viên được chấm KPI bởi nhanVienId
getChamKPIByNhanVienQuanLy();

// POST /api/quanlynhanvien/batch
// Tạo nhiều quan hệ quản lý cùng lúc (cho multi-select add)
createBatchQuanLyNhanVien();

// DELETE /api/quanlynhanvien/batch
// Xóa nhiều quan hệ quản lý cùng lúc (cho multi-select delete)
deleteBatchQuanLyNhanVien();

// POST /api/quanlynhanvien/sync
// Sync toàn bộ danh sách quan hệ quản lý (tổng hợp add/delete)
syncQuanLyNhanVienList();

// PUT /api/quanlynhanvien/:id/loai
// Chuyển đổi loại quản lý (Giao_Viec <-> KPI)
updateLoaiQuanLy();
```

**Response format:**

```javascript
// GET giaoviec/chamkpi response:
{
  success: true,
  data: [
    {
      _id: "quanlynhanvienId",
      NhanVienQuanLy: "managerId",
      NhanVienDuocQuanLy: {
        _id: "employeeId",
        MaNhanVien: "NV001",
        Ten: "Nguyen Van A",
        KhoaID: { TenKhoa: "Khoa ABC" },
        ChucDanh: "Bác sĩ",
        // ... other fields
      },
      LoaiQuanLy: "Giao_Viec", // or "KPI"
      createdAt: "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### 1.3 Routes

**File**: `/giaobanbv-be/modules/workmanagement/routes/quanLyNhanVienRoutes.js`

```javascript
const express = require("express");
const router = express.Router();
const quanLyNhanVienController = require("../controllers/quanLyNhanVienController");

router.get(
  "/giaoviec/:nhanVienId",
  quanLyNhanVienController.getGiaoViecByNhanVienQuanLy
);
router.get(
  "/chamkpi/:nhanVienId",
  quanLyNhanVienController.getChamKPIByNhanVienQuanLy
);
router.post("/batch", quanLyNhanVienController.createBatchQuanLyNhanVien);
router.delete("/batch", quanLyNhanVienController.deleteBatchQuanLyNhanVien);
router.post("/sync", quanLyNhanVienController.syncQuanLyNhanVienList);
router.put("/:id/loai", quanLyNhanVienController.updateLoaiQuanLy);

module.exports = router;
```

#### 1.4 Sync API Implementation Details

**Backend Logic cho syncQuanLyNhanVienList:**

```javascript
// POST /api/quanlynhanvien/sync
// Body: {
//   NhanVienQuanLy: "managerId",
//   SelectedNhanVienIds: ["id1", "id2", "id3"],
//   LoaiQuanLy: "Giao_Viec"
// }

syncQuanLyNhanVienList = catchAsync(async (req, res, next) => {
  const { NhanVienQuanLy, SelectedNhanVienIds, LoaiQuanLy } = req.body;

  // 1. Lấy quan hệ hiện tại
  const currentRelations = await QuanLyNhanVien.find({
    NhanVienQuanLy: NhanVienQuanLy,
    LoaiQuanLy: LoaiQuanLy,
    isDeleted: false,
  });

  const currentIds = currentRelations.map((rel) =>
    rel.NhanVienDuocQuanLy.toString()
  );

  // 2. Phân tích changes
  const toAdd = SelectedNhanVienIds.filter((id) => !currentIds.includes(id));
  const toDeleteIds = currentIds.filter(
    (id) => !SelectedNhanVienIds.includes(id)
  );

  // 3. Batch operations
  const operations = [];

  // Xóa quan hệ không còn cần thiết
  if (toDeleteIds.length > 0) {
    operations.push(
      QuanLyNhanVien.updateMany(
        {
          NhanVienQuanLy: NhanVienQuanLy,
          NhanVienDuocQuanLy: { $in: toDeleteIds },
          LoaiQuanLy: LoaiQuanLy,
        },
        { isDeleted: true }
      )
    );
  }

  // Thêm quan hệ mới
  if (toAdd.length > 0) {
    const newRelations = toAdd.map((nhanVienId) => ({
      NhanVienQuanLy: NhanVienQuanLy,
      NhanVienDuocQuanLy: nhanVienId,
      LoaiQuanLy: LoaiQuanLy,
    }));

    operations.push(QuanLyNhanVien.insertMany(newRelations));
  }

  // Thực hiện song song
  await Promise.all(operations);

  // 4. Trả về kết quả updated
  const updatedRelations = await QuanLyNhanVien.find({
    NhanVienQuanLy: NhanVienQuanLy,
    LoaiQuanLy: LoaiQuanLy,
    isDeleted: false,
  }).populate("NhanVienDuocQuanLy");

  sendResponse(
    res,
    200,
    true,
    {
      relations: updatedRelations,
      summary: {
        added: toAdd.length,
        deleted: toDeleteIds.length,
        total: updatedRelations.length,
      },
    },
    null,
    "Sync successful"
  );
});
```

### Phase 2: Frontend Redux State Management

#### 2.1 Redux Slice

**File**: `quanLyNhanVienSlice.js`

**State Structure:**

```javascript
const initialState = {
  // Data states
  giaoViecs: [], // Quan hệ giao việc của nhân viên hiện tại
  chamKPIs: [], // Quan hệ chấm KPI của nhân viên hiện tại
  currentNhanVienQuanLy: null, // Nhân viên đang quản lý (from nhanvienSlice)

  // UI states
  isLoading: false,
  error: null,
  isOpenSelectDialog: false, // Dialog chọn nhân viên
  selectedLoaiQuanLy: null, // "Giao_Viec" hoặc "KPI"

  // Available data for selection
  availableNhanViens: [], // Nhân viên có thể được chọn (filter từ nhanvienSlice)
};
```

**Async Thunks cần tạo:**

```javascript
// Lấy data
export const getGiaoViecByNhanVien = (nhanVienId) => async (dispatch) => {
  // Call API /api/quanlynhanvien/giaoviec/:nhanVienId
};

export const getChamKPIByNhanVien = (nhanVienId) => async (dispatch) => {
  // Call API /api/quanlynhanvien/chamkpi/:nhanVienId
};

// CRUD operations
export const addBatchQuanLyNhanVien =
  (nhanVienQuanLyId, selectedNhanViens, loaiQuanLy) => async (dispatch) => {
    // Call API POST /api/quanlynhanvien/batch
    // Body: { NhanVienQuanLy: nhanVienQuanLyId, NhanVienDuocQuanLys: selectedNhanViens, LoaiQuanLy: loaiQuanLy }
  };

export const deleteBatchQuanLyNhanVien = (quanLyIds) => async (dispatch) => {
  // Call API DELETE /api/quanlynhanvien/batch
  // Body: { quanLyIds: [...] }
};

// Main sync function - sử dụng thay vì add/delete riêng lẻ
export const syncQuanLyNhanVienList =
  (nhanVienQuanLyId, selectedNhanVienIds, loaiQuanLy) => async (dispatch) => {
    // Call API POST /api/quanlynhanvien/sync
    // Body: { NhanVienQuanLy: nhanVienQuanLyId, SelectedNhanVienIds: selectedNhanVienIds, LoaiQuanLy: loaiQuanLy }

    try {
      const response = await apiService.post("/quanlynhanvien/sync", {
        NhanVienQuanLy: nhanVienQuanLyId,
        SelectedNhanVienIds: selectedNhanVienIds,
        LoaiQuanLy: loaiQuanLy,
      });

      // Update state với kết quả từ server
      if (loaiQuanLy === "Giao_Viec") {
        dispatch(
          slice.actions.setGiaoViecsSuccess(response.data.data.relations)
        );
      } else {
        dispatch(
          slice.actions.setChamKPIsSuccess(response.data.data.relations)
        );
      }

      // Thông báo kết quả
      const { added, deleted, total } = response.data.data.summary;
      const messages = [];
      if (added > 0) messages.push(`Thêm ${added} nhân viên`);
      if (deleted > 0) messages.push(`Xóa ${deleted} quan hệ`);
      messages.push(`Tổng cộng: ${total} quan hệ`);

      toast.success(`Cập nhật thành công: ${messages.join(", ")}`);

      return response.data.data;
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật: " + error.message);
      throw error;
    }
  };

export const updateLoaiQuanLy = (quanLyId, newLoai) => async (dispatch) => {
  // Call API PUT /api/quanlynhanvien/:id/loai
};
```

**Selectors và utilities:**

```javascript
// Selectors to get available nhân viên for selection
export const getAvailableNhanViensForGiaoViec = (state) => {
  const { nhanviens } = state.nhanvien;
  const { giaoViecs, currentNhanVienQuanLy } = state.quanLyNhanVien;

  return nhanviens.filter(
    (nv) =>
      nv._id !== currentNhanVienQuanLy?._id && // Không thể tự quản lý
      !giaoViecs.some((gv) => gv.NhanVienDuocQuanLy._id === nv._id) // Chưa được giao việc
  );
};

export const getAvailableNhanViensForChamKPI = (state) => {
  const { nhanviens } = state.nhanvien;
  const { chamKPIs, currentNhanVienQuanLy } = state.quanLyNhanVien;

  return nhanviens.filter(
    (nv) =>
      nv._id !== currentNhanVienQuanLy?._id && // Không thể tự quản lý
      !chamKPIs.some((ck) => ck.NhanVienDuocQuanLy._id === nv._id) // Chưa được chấm KPI
  );
};
```

### Phase 3: UI Components Development

#### 3.1 Button trong NhanVienList

**File**: `QuanLyNhanVienButton.js`

```javascript
import { IconButton, Tooltip } from "@mui/material";
import { ManageAccounts } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export default function QuanLyNhanVienButton({ nhanVienId }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/quanlynhanvien/${nhanVienId}`);
  };

  return (
    <Tooltip title="Quản lý nhân viên">
      <IconButton color="primary" onClick={handleClick}>
        <ManageAccounts />
      </IconButton>
    </Tooltip>
  );
}
```

#### 3.2 Main Page Layout

**File**: `QuanLyNhanVienPage.js`

```javascript
// Layout với 2 tabs: "Giao việc" và "Chấm KPI"
// Header hiển thị thông tin nhân viên quản lý
// Back button để quay về NhanVienList
// Load data khi component mount

const QuanLyNhanVienPage = () => {
  const { id: nhanVienId } = useParams();
  const [tabValue, setTabValue] = useState(0);

  // Load nhân viên quản lý info
  useEffect(() => {
    dispatch(getOneByNhanVienID(nhanVienId)); // Sử dụng hàm mới đơn giản
    dispatch(getGiaoViecByNhanVien(nhanVienId));
    dispatch(getChamKPIByNhanVien(nhanVienId));
  }, [nhanVienId]);

  return (
    <MainCard>
      {/* Header với thông tin nhân viên */}
      {/* Tabs cho Giao việc / Chấm KPI */}
      {/* Tab panels */}
    </MainCard>
  );
};
```

#### 3.3 Select Dialog Pattern (base on SelectHocVienForm)

**File**: `components/SelectNhanVienQuanLyDialog.js`

```javascript
// Copy từ SelectHocVienForm.js và modify:
export default function SelectNhanVienQuanLyDialog({
  open,
  onClose,
  loaiQuanLy, // "Giao_Viec" hoặc "KPI"
  nhanVienQuanLyId,
  onSyncComplete,
}) {
  const dispatch = useDispatch();
  const [selectedRows, setSelectedRows] = useState([]);
  const { giaoViecs, chamKPIs } = useSelector((state) => state.quanLyNhanVien);

  // Lấy quan hệ hiện tại để pre-select
  const currentRelations = loaiQuanLy === "Giao_Viec" ? giaoViecs : chamKPIs;

  // Pre-select existing relationships khi dialog mở
  useEffect(() => {
    if (open && currentRelations.length > 0) {
      // Tìm index của nhân viên đã có quan hệ trong available list
      // Logic này sẽ được implement trong SelectNhanVienQuanLyTable
    }
  }, [open, currentRelations]);

  const handleSync = async () => {
    try {
      // Lấy IDs của nhân viên được chọn
      const selectedNhanVienIds = selectedRows.map((rowIndex) => {
        // Logic convert từ row index sang nhanVien ID
        return availableNhanViens[rowIndex]._id;
      });

      // Gọi sync API
      await dispatch(
        syncQuanLyNhanVienList(
          nhanVienQuanLyId,
          selectedNhanVienIds,
          loaiQuanLy
        )
      ).unwrap();

      onSyncComplete && onSyncComplete();
      onClose();
    } catch (error) {
      // Error đã được handle trong sync function
      console.error("Sync failed:", error);
    }
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <AppBar sx={{ position: "relative", boxShadow: "none" }}>
        <Toolbar>
          <IconButton edge="start" color="inherit" onClick={onClose}>
            <Add style={{ transform: "rotate(45deg)" }} />
          </IconButton>
          <Typography sx={{ ml: 2, flex: 1 }} variant="h6">
            Chọn nhân viên{" "}
            {loaiQuanLy === "Giao_Viec" ? "giao việc" : "chấm KPI"}
          </Typography>
          <Button color="primary" variant="contained" onClick={handleSync}>
            Cập nhật ({selectedRows.length})
          </Button>
        </Toolbar>
      </AppBar>
      <SelectNhanVienQuanLyTable
        loaiQuanLy={loaiQuanLy}
        currentRelations={currentRelations}
        onSelectedRowsChange={setSelectedRows}
      />
    </Dialog>
  );
}
```

#### 3.4 Select Table Pattern (base on SeLectHocVienTable)

**File**: `components/SelectNhanVienQuanLyTable.js`

```javascript
// Copy từ SeLectHocVienTable.js và modify:
function SelectNhanVienQuanLyTable({
  loaiQuanLy,
  currentRelations,
  onSelectedRowsChange,
}) {
  const { nhanviens } = useSelector((state) => state.nhanvien);
  const { currentNhanVienQuanLy } = useSelector(
    (state) => state.quanLyNhanVien
  );

  // Filter ALL nhân viên (bao gồm cả những nhân viên đã có quan hệ hiện tại)
  // Chỉ loại bỏ nhân viên tự quản lý
  const data = useMemo(() => {
    if (!nhanviens || !currentNhanVienQuanLy) return [];

    return nhanviens.filter((nv) => nv._id !== currentNhanVienQuanLy._id);
  }, [nhanviens, currentNhanVienQuanLy]);

  // Pre-select existing relationships
  const existingNhanVienIds = currentRelations.map(
    (rel) => rel.NhanVienDuocQuanLy._id
  );

  // Tìm index của nhân viên đã có quan hệ
  const preSelectedRows = useMemo(() => {
    return data
      .map((nv, index) => ({ ...nv, index }))
      .filter((nv) => existingNhanVienIds.includes(nv._id))
      .map((nv) => nv.index);
  }, [data, existingNhanVienIds]);

  // Set pre-selected rows khi component mount hoặc data thay đổi
  useEffect(() => {
    onSelectedRowsChange(preSelectedRows);
  }, [preSelectedRows, onSelectedRowsChange]);

  // Columns config tương tự SeLectHocVienTable với thêm indicator
  const columns = useMemo(
    () => [
      {
        title: "Row Selection",
        id: "selection",
        Header: ({ getToggleAllPageRowsSelectedProps }) => (
          <IndeterminateCheckbox {...getToggleAllPageRowsSelectedProps()} />
        ),
        Cell: ({ row }) => (
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        ),
        // ... other config
      },
      // Status indicator column
      {
        Header: "Trạng thái",
        Footer: "Trạng thái",
        accessor: "status",
        Cell: ({ row }) => {
          const isExisting = existingNhanVienIds.includes(row.original._id);
          return isExisting ? (
            <Chip label="Đang quản lý" color="primary" size="small" />
          ) : (
            <Chip label="Chưa quản lý" variant="outlined" size="small" />
          );
        },
        disableSortBy: true,
        disableFilters: true,
        disableGroupBy: true,
      },
      // ... other columns từ SeLectHocVienTable
    ],
    [existingNhanVienIds]
  );

  return (
    <MainCard
      title={`Danh sách nhân viên ${
        loaiQuanLy === "Giao_Viec" ? "giao việc" : "chấm KPI"
      }`}
    >
      <SelectTable
        data={data}
        columns={columns}
        onSelectedRowsChange={onSelectedRowsChange}
        initialSelectedRows={preSelectedRows} // Pass pre-selected rows
      />
    </MainCard>
  );
}
```

#### 3.5 Danh sách components

**Files**: `components/DanhSachGiaoViec.js` & `components/DanhSachChamKPI.js`

```javascript
// CommonTable để hiển thị danh sách quan hệ quản lý
// Columns: Mã NV, Tên, Khoa, Chức danh, Ngày tạo, Actions
// Actions: Chuyển đổi loại, Xóa
// Button "Thêm nhân viên" mở SelectNhanVienQuanLyDialog
```

### Phase 4: Integration Flow

#### 4.1 Complete User Flow

```
1. User ở NhanVienList clicks QuanLyNhanVienButton
2. Navigate to /quanlynhanvien/:id
3. QuanLyNhanVienPage loads:
   - Fetch nhân viên info (getOneByNhanVienID)
   - Fetch quan hệ giao việc (getGiaoViecByNhanVien)
   - Fetch quan hệ chấm KPI (getChamKPIByNhanVien)
4. User chọn tab "Giao việc" hoặc "Chấm KPI"
5. User click "Quản lý danh sách":
   - Mở SelectNhanVienQuanLyDialog với loaiQuanLy tương ứng
   - SelectNhanVienQuanLyTable hiển thị TẤT CẢ nhân viên (trừ tự quản lý)
   - Pre-select những nhân viên đã có quan hệ hiện tại
   - User có thể uncheck (để xóa) hoặc check thêm (để thêm mới)
   - Click "Cập nhật" → dispatch syncQuanLyNhanVienList
6. Backend xử lý sync:
   - So sánh current vs selected để tìm ra add/delete list
   - Thực hiện batch operations
   - Trả về updated list và summary
7. UI được update real-time với kết quả từ server
8. Toast hiển thị tóm tắt thay đổi (X thêm, Y xóa, Z tổng cộng)
```

#### 4.2 Multi-Select Dialog Flow & Sync Logic

```javascript
// 1. Khi mở dialog - Pre-filter available nhân viên
const getAvailableNhanViens = (
  nhanviens,
  currentRelations,
  currentNhanVienQuanLy
) => {
  return nhanviens.filter((nv) => {
    // Loại bỏ nhân viên tự quản lý
    if (nv._id === currentNhanVienQuanLy?._id) return false;

    // Loại bỏ nhân viên đã có quan hệ quản lý cùng loại
    const hasExistingRelation = currentRelations.some(
      (rel) => rel.NhanVienDuocQuanLy._id === nv._id
    );

    return !hasExistingRelation;
  });
};

// 2. Khi user chọn nhân viên trong dialog - Pre-select existing relationships
const getPreSelectedRows = (availableNhanViens, currentRelations) => {
  const existingIds = currentRelations.map((rel) => rel.NhanVienDuocQuanLy._id);

  return availableNhanViens
    .map((nv, index) => ({ ...nv, tableIndex: index }))
    .filter((nv) => existingIds.includes(nv._id))
    .map((nv) => nv.tableIndex);
};

// 3. Khi confirm selection - Sync với database
const handleSyncQuanLyList = async (
  currentRelations,
  selectedNhanViens,
  loaiQuanLy,
  nhanVienQuanLyId
) => {
  const selectedIds = selectedNhanViens.map((nv) => nv._id);
  const existingIds = currentRelations.map((rel) => rel.NhanVienDuocQuanLy._id);

  // Nhân viên cần thêm mới (có trong selected nhưng không có trong existing)
  const toAdd = selectedIds.filter((id) => !existingIds.includes(id));

  // Quan hệ cần xóa (có trong existing nhưng không có trong selected)
  const toDelete = currentRelations.filter(
    (rel) => !selectedIds.includes(rel.NhanVienDuocQuanLy._id)
  );

  // Nhân viên giữ nguyên (có trong cả selected và existing)
  const toKeep = currentRelations.filter((rel) =>
    selectedIds.includes(rel.NhanVienDuocQuanLy._id)
  );

  console.log("Sync Analysis:", {
    toAdd: toAdd.length,
    toDelete: toDelete.length,
    toKeep: toKeep.length,
  });

  // Thực hiện batch operations
  const operations = [];

  // 1. Xóa quan hệ không còn được chọn
  if (toDelete.length > 0) {
    operations.push(
      dispatch(deleteBatchQuanLyNhanVien(toDelete.map((rel) => rel._id)))
    );
  }

  // 2. Thêm quan hệ mới
  if (toAdd.length > 0) {
    operations.push(
      dispatch(
        addBatchQuanLyNhanVien({
          NhanVienQuanLy: nhanVienQuanLyId,
          NhanVienDuocQuanLys: toAdd,
          LoaiQuanLy: loaiQuanLy,
        })
      )
    );
  }

  // Thực hiện song song để tối ưu performance
  await Promise.all(operations);

  // Thông báo kết quả
  const messages = [];
  if (toAdd.length > 0) messages.push(`Thêm ${toAdd.length} nhân viên`);
  if (toDelete.length > 0) messages.push(`Xóa ${toDelete.length} quan hệ`);
  if (toKeep.length > 0) messages.push(`Giữ nguyên ${toKeep.length} quan hệ`);

  toast.success(`Cập nhật thành công: ${messages.join(", ")}`);
};
```

## Technical Specifications

### Frontend Requirements

- **Framework**: React với Material-UI
- **State Management**: Redux Toolkit với existing nhanvienSlice integration
- **Routing**: React Router v6 với params `:id`
- **Icons**: @mui/icons-material (ManageAccounts cho button)
- **Table**: Tái sử dụng CommonTable và SelectTable components
- **Dialogs**: Material-UI Dialog fullscreen pattern như SelectHocVienForm
- **Multi-select**: IndeterminateCheckbox pattern từ SeLectHocVienTable

### Backend Requirements

- **Database**: MongoDB với Mongoose, sử dụng existing QuanLyNhanVien schema
- **API Style**: RESTful API với batch operations
- **Error Handling**: Standardized error responses
- **Validation**:
  - Mongoose schema validation (không thể tự quản lý)
  - Business logic validation (duplicate prevention)
- **Population**: Populate đầy đủ thông tin NhanVien khi query
- **Indexing**: Tận dụng existing indexes trong QuanLyNhanVien schema

### Key Integration Points

```javascript
// 1. Existing nhanvienSlice integration
const { nhanviens, nhanvienCurrent } = useSelector((state) => state.nhanvien);
const { giaoViecs, chamKPIs } = useSelector((state) => state.quanLyNhanVien);

// 2. Filtering logic cho multi-select
const availableNhanViens = nhanviens.filter(
  (nv) =>
    nv._id !== currentNhanVienQuanLy?._id && // Không tự quản lý
    !existingQuanLy.some((ql) => ql.NhanVienDuocQuanLy._id === nv._id) // Chưa có quan hệ
);

// 3. Batch API calls
const selectedIds = selectedRows.map((row) => data[row.id]._id);
dispatch(addBatchQuanLyNhanVien(nhanVienQuanLyId, selectedIds, loaiQuanLy));

// 4. Real-time UI updates
useEffect(() => {
  // Refetch data sau khi CRUD operations
  dispatch(getGiaoViecByNhanVien(nhanVienId));
  dispatch(getChamKPIByNhanVien(nhanVienId));
}, [quanLyOperationSuccess]);
```

### Data Flow Architecture

```
NhanVienList → QuanLyNhanVienButton → /quanlynhanvien/:id
                                          ↓
QuanLyNhanVienPage ← Redux Store ← API Calls
    ↓                    ↑              ↑
[Giao việc Tab]      Dispatch      Backend APIs
[Chấm KPI Tab]          ↓              ↓
    ↓              Action Results   Database
SelectDialog → SelectTable → Multi-select → Batch Create
    ↑                                         ↓
Available NhanViens ← Filter Logic ← Current Relations
```

### Component Hierarchy

```
QuanLyNhanVienPage
├── Header (NhanVien info + Back button)
├── Tabs (Giao việc / Chấm KPI)
│   ├── DanhSachGiaoViec
│   │   ├── CommonTable (với delete actions)
│   │   └── Add Button → SelectNhanVienQuanLyDialog
│   │       └── SelectNhanVienQuanLyTable (SelectTable)
│   └── DanhSachChamKPI
│       ├── CommonTable (với delete actions)
│       └── Add Button → SelectNhanVienQuanLyDialog
│           └── SelectNhanVienQuanLyTable (SelectTable)
└── Loading/Error states
```

### Error Handling Strategy

```javascript
// 1. Redux slice error states
const slice = createSlice({
  // ... other code
  extraReducers: (builder) => {
    builder
      .addCase(addBatchQuanLyNhanVien.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addBatchQuanLyNhanVien.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update corresponding array (giaoViecs or chamKPIs)
      })
      .addCase(addBatchQuanLyNhanVien.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

// 2. Component level error handling
const QuanLyNhanVienPage = () => {
  const { error, isLoading } = useSelector((state) => state.quanLyNhanVien);

  if (error) {
    return <ErrorComponent message={error} onRetry={handleRetry} />;
  }

  if (isLoading) {
    return <LoadingComponent />;
  }

  // ... normal render
};

// 3. Toast notifications
import { toast } from "react-toastify";

// Success cases
toast.success(
  `Đã thêm ${selectedRows.length} nhân viên vào danh sách giao việc`
);
toast.success("Đã xóa quan hệ quản lý thành công");

// Error cases
toast.error("Không thể thêm nhân viên: " + error.message);
toast.warning("Một số nhân viên đã có quan hệ quản lý");
```

### Performance Considerations

```javascript
// 1. Memoization cho filtering
const availableForGiaoViec = useMemo(
  () => getAvailableNhanViensForGiaoViec(state),
  [nhanviens, giaoViecs, currentNhanVienQuanLy]
);

// 2. Selective re-fetching
useEffect(() => {
  // Only fetch if data is stale or missing
  if (!giaoViecs.length || isDataStale) {
    dispatch(getGiaoViecByNhanVien(nhanVienId));
  }
}, [nhanVienId]);

// 3. Batch operations to reduce API calls
const handleBatchAdd = async (selectedNhanViens) => {
  try {
    await dispatch(
      addBatchQuanLyNhanVien({
        NhanVienQuanLy: nhanVienId,
        NhanVienDuocQuanLys: selectedNhanViens.map((nv) => nv._id),
        LoaiQuanLy: currentLoaiQuanLy,
      })
    ).unwrap();

    // Single success notification for batch
    toast.success(`Đã thêm ${selectedNhanViens.length} nhân viên`);
  } catch (error) {
    toast.error("Có lỗi xảy ra khi thêm nhân viên");
  }
};

// 4. Optimistic updates cho UX
const handleDelete = async (quanLyId) => {
  // Optimistically remove from UI
  dispatch(removeQuanLyFromUI(quanLyId));

  try {
    await dispatch(removeQuanLyNhanVien(quanLyId)).unwrap();
  } catch (error) {
    // Revert optimistic update
    dispatch(revertRemoveQuanLy(quanLyId));
    toast.error("Không thể xóa quan hệ quản lý");
  }
};
```

## Development Order & Testing Strategy

### Development Sequence

1. ✅ **Backend APIs** - QuanLyNhanVien controller và routes
2. ✅ **Redux Slice** - quanLyNhanVienSlice với async thunks
3. ✅ **Base Components** - QuanLyNhanVienButton và Page layout
4. ✅ **Select Components** - SelectNhanVienQuanLyDialog và Table (based on SelectHocVien pattern)
5. ✅ **List Components** - DanhSachGiaoViec và DanhSachChamKPI
6. ✅ **CRUD Operations** - Add/Delete/Update functionalities
7. ✅ **Route Integration** - Add route và integrate với NhanVienList
8. ✅ **Error Handling** - Comprehensive error states và user feedback
9. ✅ **Testing** - Unit tests, integration tests, E2E workflow
10. ✅ **Performance Optimization** - Memoization, selective updates

### Testing Checklist

#### Unit Tests

- [ ] Redux slice reducers và async thunks
- [ ] Component rendering với different props
- [ ] Filter logic cho available nhân viên
- [ ] Validation functions

#### Integration Tests

- [ ] API endpoints với different scenarios
- [ ] Database operations với QuanLyNhanVien model
- [ ] Redux store integration với components
- [ ] Navigation flow between pages

#### E2E User Workflow Tests

```javascript
// 1. Happy path - Add giao việc relationship
- Navigate từ NhanVienList → QuanLyNhanVienPage
- Click "Thêm nhân viên" ở tab Giao việc
- Select multiple nhân viên trong dialog
- Confirm selection → Verify relationships created
- Verify UI updates với new relationships

// 2. Edge cases
- Try to self-manage → Should show error
- Select already managed nhân viên → Should filter out
- Delete relationship → Should show confirm dialog
- Network error handling → Should show error states

// 3. Cross-tab functionality
- Add nhân viên ở Giao việc tab
- Switch to Chấm KPI tab → Should not see same nhân viên
- Add same nhân viên to KPI → Should work independently

// 4. Data persistence
- Add relationships → Reload page → Data should persist
- Navigate away and back → State should be maintained
- Multiple browser tabs → Changes should sync
```

#### Performance Tests

- [ ] Large dataset rendering (1000+ nhân viên)
- [ ] Multi-select performance với many selections
- [ ] Memory leaks với frequent navigation
- [ ] API response times với complex queries

### Common Issues & Solutions

#### 1. State Management Issues

```javascript
// Problem: State not updating after CRUD operations
// Solution: Ensure proper action dispatching và reducer logic

// ❌ Wrong
const handleAdd = async () => {
  await addBatchQuanLyNhanVien(data);
  // State not updated yet
};

// ✅ Correct
const handleAdd = async () => {
  try {
    await dispatch(addBatchQuanLyNhanVien(data)).unwrap();
    // State is updated, UI re-renders
    toast.success("Thêm thành công");
  } catch (error) {
    toast.error(error.message);
  }
};
```

#### 2. Multi-select Dialog Issues

```javascript
// Problem: Selected state not clearing when dialog reopens
// Solution: Reset selectedRows when dialog opens

const [selectedRows, setSelectedRows] = useState([]);

useEffect(() => {
  if (open) {
    setSelectedRows([]); // Reset when dialog opens
  }
}, [open]);
```

#### 3. Filter Logic Edge Cases

```javascript
// Problem: Available nhân viên not filtering correctly
// Solution: Comprehensive filtering with null checks

const getAvailableNhanViens = useMemo(() => {
  if (!nhanviens || !currentNhanVienQuanLy) return [];

  return nhanviens.filter((nv) => {
    // Self-management check
    if (nv._id === currentNhanVienQuanLy._id) return false;

    // Existing relationship check
    const hasGiaoViec = giaoViecs?.some(
      (gv) => gv.NhanVienDuocQuanLy?._id === nv._id
    );
    const hasChamKPI = chamKPIs?.some(
      (ck) => ck.NhanVienDuocQuanLy?._id === nv._id
    );

    if (loaiQuanLy === "Giao_Viec") return !hasGiaoViec;
    if (loaiQuanLy === "KPI") return !hasChamKPI;

    return true;
  });
}, [nhanviens, currentNhanVienQuanLy, giaoViecs, chamKPIs, loaiQuanLy]);
```

#### 4. API Error Handling

```javascript
// Problem: Generic error messages không helpful
// Solution: Specific error handling với meaningful messages

const handleSyncQuanLyList = async (selectedNhanViens) => {
  try {
    const selectedIds = selectedNhanViens.map((nv) => nv._id);

    const result = await dispatch(
      syncQuanLyNhanVienList(nhanVienId, selectedIds, loaiQuanLy)
    ).unwrap();

    // Success handling với detailed feedback
    const { added, deleted, total } = result.summary;
    const messages = [];
    if (added > 0) messages.push(`Thêm ${added} nhân viên`);
    if (deleted > 0) messages.push(`Xóa ${deleted} quan hệ`);
    messages.push(`Tổng cộng: ${total} quan hệ`);

    toast.success(`Cập nhật thành công: ${messages.join(", ")}`);
  } catch (error) {
    // Specific error handling
    if (error.code === "INVALID_NHANVIEN_ID") {
      toast.error("ID nhân viên không hợp lệ");
    } else if (error.code === "DATABASE_ERROR") {
      toast.error("Lỗi cơ sở dữ liệu, vui lòng thử lại");
    } else if (error.code === "VALIDATION_ERROR") {
      toast.error("Dữ liệu không hợp lệ: " + error.details);
    } else {
      toast.error("Có lỗi xảy ra: " + error.message);
    }
  }
};

// Validation trước khi gọi API
const validateSyncRequest = (selectedNhanViens, currentNhanVienQuanLy) => {
  // 1. Check if any selected nhân viên is the manager themselves
  const selfSelected = selectedNhanViens.some(
    (nv) => nv._id === currentNhanVienQuanLy._id
  );
  if (selfSelected) {
    toast.error("Không thể tự quản lý bản thân");
    return false;
  }

  // 2. Check minimum/maximum limits if needed
  if (selectedNhanViens.length > 100) {
    toast.warning("Không thể quản lý quá 100 nhân viên cùng lúc");
    return false;
  }

  return true;
};
```

### Code Quality Standards

#### File Organization

```
QuanLyNhanVien/
├── index.js                           # Barrel exports
├── quanLyNhanVienSlice.js             # Redux logic
├── QuanLyNhanVienButton.js            # Simple button component
├── QuanLyNhanVienPage.js              # Main page container
├── components/
│   ├── index.js                       # Component exports
│   ├── DanhSachGiaoViec.js           # Table + Add button
│   ├── DanhSachChamKPI.js            # Table + Add button
│   ├── SelectNhanVienQuanLyDialog.js  # Fullscreen dialog
│   ├── SelectNhanVienQuanLyTable.js   # Multi-select table
│   └── DeleteQuanLyButton.js          # Delete với confirm
├── hooks/
│   ├── useQuanLyNhanVien.js          # Custom hook for logic
│   └── useAvailableNhanViens.js       # Filter logic hook
├── utils/
│   ├── validation.js                  # Input validation functions
│   └── constants.js                   # Enums và constants
└── __tests__/
    ├── quanLyNhanVienSlice.test.js
    ├── QuanLyNhanVienPage.test.js
    └── components/
```

#### Naming Conventions

- **Components**: PascalCase (QuanLyNhanVienPage)
- **Files**: camelCase (quanLyNhanVienSlice.js)
- **Functions**: camelCase (getGiaoViecByNhanVien)
- **Constants**: UPPER_SNAKE_CASE (LOAI_QUAN_LY)
- **Props**: camelCase (onSelectedRowsChange)

#### Code Documentation

```javascript
/**
 * Dialog component for selecting multiple nhân viên for management relationships
 * Based on SelectHocVienForm pattern với modifications for QuanLyNhanVien
 *
 * @param {boolean} open - Dialog visibility state
 * @param {function} onClose - Callback when dialog closes
 * @param {string} loaiQuanLy - Type of management: "Giao_Viec" or "KPI"
 * @param {string} nhanVienQuanLyId - ID of managing employee
 * @param {function} onSelected - Callback when selection is confirmed
 */
export default function SelectNhanVienQuanLyDialog({
  open,
  onClose,
  loaiQuanLy,
  nhanVienQuanLyId,
  onSelected,
}) {
  // Component implementation
}
```

## Notes & Best Practices

- ✅ **Consistency**: Sử dụng pattern giống SelectHocVienForm để đảm bảo UX consistency
- ✅ **Performance**: Memoize expensive computations và filter operations
- ✅ **Error Handling**: Comprehensive error states với user-friendly messages
- ✅ **Accessibility**: ARIA labels và keyboard navigation support
- ✅ **Responsive Design**: Mobile-friendly layout và interactions
- ✅ **Code Reuse**: Tận dụng existing components (CommonTable, SelectTable, MainCard)
- ✅ **Type Safety**: PropTypes hoặc TypeScript để catch errors early
- ✅ **Testing**: Unit tests cho critical logic, integration tests cho workflows
- ✅ **Documentation**: Inline comments và README cho complex logic
- ✅ **Version Control**: Meaningful commit messages và PR descriptions
