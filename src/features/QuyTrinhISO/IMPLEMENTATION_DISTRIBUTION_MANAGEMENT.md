# KẾ HOẠCH TRIỂN KHAI: Quản Lý Phân Phối Quy Trình ISO

**Ngày tạo:** 26/01/2025  
**Ngày hoàn thành:** 28/01/2026  
**Trạng thái:** ✅ Đã hoàn thành  
**Ưu tiên:** Cao

---

## 📋 TÓM TẮT

Triển khai tính năng quản lý phân phối quy trình ISO với:

- Tách biệt luồng phân phối ra khỏi form tạo/sửa quy trình
- Tạo 3 view mới: Quản lý phân phối (QLCL), QT được phân phối (Khoa), QT khoa xây dựng (Khoa)
- Dialog chọn khoa với tìm kiếm nhanh + multi-select (~50 khoa)
- Quick view PDF bằng modal

---

## 🎯 PHASE 1: Backend API (Ngày 1-2)

### 1.1. API Endpoints Mới

| Method | Route                                 | Mô tả                                | Permission |
| ------ | ------------------------------------- | ------------------------------------ | ---------- |
| GET    | `/api/quytrinh-iso/distribution`      | Danh sách QT với thông tin phân phối | QLCL       |
| PUT    | `/api/quytrinh-iso/:id/distribution`  | Cập nhật phân phối cho 1 QT          | QLCL       |
| GET    | `/api/quytrinh-iso/distributed-to-me` | QT được phân phối cho khoa của user  | Khoa       |
| GET    | `/api/quytrinh-iso/built-by-my-dept`  | QT do khoa của user xây dựng         | Khoa       |

### 1.2. Files Backend Cần Tạo/Sửa

```
giaobanbv-be/
├── routes/quytrinh-iso.routes.js          [SỬA] Thêm routes mới
├── controllers/quytrinh-iso.controller.js [SỬA] Thêm controller methods
│
└── Các hàm mới:
    ├── getDistributionList()       - GET /distribution
    ├── updateDistribution()        - PUT /:id/distribution
    ├── getDistributedToMe()        - GET /distributed-to-me
    └── getBuiltByMyDept()          - GET /built-by-my-dept
```

### 1.3. Implementation Backend

#### File: `routes/quytrinh-iso.routes.js`

```javascript
// Thêm routes mới
router.get(
  "/distribution",
  authMiddleware,
  isQLCL,
  controller.getDistributionList,
);
router.put(
  "/:id/distribution",
  authMiddleware,
  isQLCL,
  controller.updateDistribution,
);
router.get("/distributed-to-me", authMiddleware, controller.getDistributedToMe);
router.get("/built-by-my-dept", authMiddleware, controller.getBuiltByMyDept);
```

#### File: `controllers/quytrinh-iso.controller.js`

```javascript
// 1. Get Distribution List (QLCL only)
controller.getDistributionList = catchAsync(async (req, res, next) => {
  const { search, khoaXayDungId, page = 1, limit = 10 } = req.query;

  let query = {};
  if (search) {
    query.$or = [
      { TenQuyTrinh: { $regex: search, $options: "i" } },
      { MaQuyTrinh: { $regex: search, $options: "i" } },
    ];
  }
  if (khoaXayDungId) query.KhoaXayDung = khoaXayDungId;

  const total = await QuyTrinhISO.countDocuments(query);
  const data = await QuyTrinhISO.find(query)
    .populate("KhoaXayDung", "TenKhoa")
    .populate("KhoaPhanPhoi", "TenKhoa")
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    {
      data,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    },
    null,
    "Lấy danh sách phân phối thành công",
  );
});

// 2. Update Distribution
controller.updateDistribution = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { khoaPhanPhoiIds } = req.body; // Array of khoa IDs

  const quyTrinh = await QuyTrinhISO.findById(id);
  if (!quyTrinh)
    throw new AppError(404, "Quy trình không tồn tại", "NOT_FOUND");

  // Validate: không tự phân phối cho khoa xây dựng
  const filteredIds = khoaPhanPhoiIds.filter(
    (khoaId) => khoaId.toString() !== quyTrinh.KhoaXayDung.toString(),
  );

  quyTrinh.KhoaPhanPhoi = filteredIds;
  await quyTrinh.save();

  await quyTrinh.populate("KhoaPhanPhoi", "TenKhoa");

  return sendResponse(
    res,
    200,
    true,
    quyTrinh,
    null,
    "Cập nhật phân phối thành công",
  );
});

// 3. Get Distributed To Me (documents distributed to user's department)
controller.getDistributedToMe = catchAsync(async (req, res, next) => {
  const { search, khoaXayDungId, page = 1, limit = 10 } = req.query;
  const userKhoaId = req.user.KhoaID;

  let query = { KhoaPhanPhoi: userKhoaId };
  if (search) {
    query.$or = [
      { TenQuyTrinh: { $regex: search, $options: "i" } },
      { MaQuyTrinh: { $regex: search, $options: "i" } },
    ];
  }
  if (khoaXayDungId) query.KhoaXayDung = khoaXayDungId;

  const total = await QuyTrinhISO.countDocuments(query);
  const data = await QuyTrinhISO.find(query)
    .populate("KhoaXayDung", "TenKhoa")
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    {
      data,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    },
    null,
    "Lấy danh sách quy trình được phân phối thành công",
  );
});

// 4. Get Built By My Dept (documents created by user's department)
controller.getBuiltByMyDept = catchAsync(async (req, res, next) => {
  const { search, page = 1, limit = 10 } = req.query;
  const userKhoaId = req.user.KhoaID;

  let query = { KhoaXayDung: userKhoaId };
  if (search) {
    query.$or = [
      { TenQuyTrinh: { $regex: search, $options: "i" } },
      { MaQuyTrinh: { $regex: search, $options: "i" } },
    ];
  }

  const total = await QuyTrinhISO.countDocuments(query);
  const data = await QuyTrinhISO.find(query)
    .populate("KhoaPhanPhoi", "TenKhoa")
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    {
      data,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
    },
    null,
    "Lấy danh sách quy trình khoa xây dựng thành công",
  );
});
```

### 1.4. Checklist Phase 1

```
[ ] Tạo route GET /distribution
[ ] Tạo route PUT /:id/distribution
[ ] Tạo route GET /distributed-to-me
[ ] Tạo route GET /built-by-my-dept
[ ] Test các API bằng Postman/Insomnia
[ ] Kiểm tra permission cho QLCL/Khoa
```

---

## 🎯 PHASE 2: Frontend Redux Slice (Ngày 2-3)

### 2.1. Thêm Actions & Reducers

**File:** `quyTrinhISOSlice.js`

```javascript
// Thêm vào initialState
const initialState = {
  // ... existing state
  distributionList: [],
  distributedToMe: [],
  builtByMyDept: [],
  distributionLoading: false,
  distributionPagination: { page: 1, total: 0, totalPages: 1 },
};

// Thêm reducers
getDistributionListSuccess(state, action) {
  state.distributionList = action.payload.data;
  state.distributionPagination = {
    page: action.payload.page,
    total: action.payload.total,
    totalPages: action.payload.totalPages,
  };
  state.distributionLoading = false;
},

getDistributedToMeSuccess(state, action) {
  state.distributedToMe = action.payload.data;
  state.distributionPagination = {
    page: action.payload.page,
    total: action.payload.total,
    totalPages: action.payload.totalPages,
  };
  state.distributionLoading = false;
},

getBuiltByMyDeptSuccess(state, action) {
  state.builtByMyDept = action.payload.data;
  state.distributionPagination = {
    page: action.payload.page,
    total: action.payload.total,
    totalPages: action.payload.totalPages,
  };
  state.distributionLoading = false;
},

updateDistributionSuccess(state, action) {
  const updated = action.payload;
  const idx = state.distributionList.findIndex(qt => qt._id === updated._id);
  if (idx !== -1) state.distributionList[idx] = updated;
  state.distributionLoading = false;
},
```

### 2.2. Thêm Thunks

```javascript
// Thunk: Get Distribution List
export const getDistributionList = (params) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const response = await apiService.get("/quytrinh-iso/distribution", {
      params,
    });
    dispatch(slice.actions.getDistributionListSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Thunk: Update Distribution
export const updateDistribution = (id, khoaPhanPhoiIds) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const response = await apiService.put(`/quytrinh-iso/${id}/distribution`, {
      khoaPhanPhoiIds,
    });
    dispatch(slice.actions.updateDistributionSuccess(response.data.data));
    toast.success("Cập nhật phân phối thành công");
    return { success: true };
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
    return { success: false };
  }
};

// Thunk: Get Distributed To Me
export const getDistributedToMe = (params) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const response = await apiService.get("/quytrinh-iso/distributed-to-me", {
      params,
    });
    dispatch(slice.actions.getDistributedToMeSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

// Thunk: Get Built By My Dept
export const getBuiltByMyDept = (params) => async (dispatch) => {
  dispatch(slice.actions.startDistributionLoading());
  try {
    const response = await apiService.get("/quytrinh-iso/built-by-my-dept", {
      params,
    });
    dispatch(slice.actions.getBuiltByMyDeptSuccess(response.data.data));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

### 2.3. Checklist Phase 2

```
[ ] Thêm state distributionList, distributedToMe, builtByMyDept
[ ] Thêm reducers cho các actions
[ ] Thêm thunks getDistributionList, updateDistribution
[ ] Thêm thunks getDistributedToMe, getBuiltByMyDept
[ ] Export các thunks
```

---

## 🎯 PHASE 3: Frontend Components (Ngày 3-5)

### 3.1. Components Mới

```
src/features/QuyTrinhISO/
├── components/
│   ├── DistributionDialog.js       ⭐ NEW - Dialog chỉnh sửa phân phối
│   ├── PDFQuickViewModal.js        ⭐ NEW - Modal xem PDF nhanh
│   └── DistributionChips.js        ⭐ NEW - Hiển thị chips khoa phân phối
│
├── DistributionManagementPage.js   ⭐ NEW - Trang quản lý phân phối (QLCL)
├── DistributedToMePage.js          ⭐ NEW - Trang QT được phân phối (Khoa)
└── BuiltByMyDeptPage.js            ⭐ NEW - Trang QT khoa xây dựng (Khoa)
```

### 3.2. DistributionDialog.js

```javascript
/**
 * DistributionDialog - Dialog chỉnh sửa phân phối quy trình
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - quyTrinh: object - Quy trình đang chỉnh sửa
 * - onSave: (khoaPhanPhoiIds: string[]) => Promise<void>
 *
 * Features:
 * - Tìm kiếm real-time filter danh sách khoa
 * - Checkbox multi-select
 * - "Chọn tất cả" / "Bỏ chọn tất cả"
 * - Counter: "Đã chọn: X/Y"
 * - Loại bỏ khoa xây dựng khỏi danh sách
 */
```

**Implementation:**

```javascript
import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Stack,
  Divider,
} from "@mui/material";
import { SearchNormal1, CloseCircle, TickCircle } from "iconsax-react";
import { useSelector } from "react-redux";

function DistributionDialog({ open, onClose, quyTrinh, onSave }) {
  const { allKhoa } = useSelector((state) => state.khoa); // Danh sách tất cả khoa
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState(
    quyTrinh?.KhoaPhanPhoi?.map((k) => k._id) || [],
  );
  const [loading, setLoading] = useState(false);

  // Filter khoa (loại bỏ khoa xây dựng)
  const filteredKhoa = useMemo(() => {
    return allKhoa
      .filter((k) => k._id !== quyTrinh?.KhoaXayDung?._id)
      .filter((k) =>
        k.TenKhoa.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [allKhoa, quyTrinh, searchTerm]);

  const handleToggle = (khoaId) => {
    setSelectedIds((prev) =>
      prev.includes(khoaId)
        ? prev.filter((id) => id !== khoaId)
        : [...prev, khoaId],
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredKhoa.map((k) => k._id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    setLoading(true);
    await onSave(selectedIds);
    setLoading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Chỉnh Sửa Phân Phối</Typography>
        <Typography variant="body2" color="text.secondary">
          {quyTrinh?.MaQuyTrinh} - {quyTrinh?.TenQuyTrinh}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm khoa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchNormal1 size={18} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Select All / Deselect All */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<TickCircle size={16} />}
              onClick={handleSelectAll}
            >
              Chọn tất cả
            </Button>
            <Button
              size="small"
              startIcon={<CloseCircle size={16} />}
              onClick={handleDeselectAll}
            >
              Bỏ chọn tất cả
            </Button>
          </Stack>
          <Typography variant="body2" color="primary">
            Đã chọn: {selectedIds.length}/{filteredKhoa.length}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Khoa List */}
        <List sx={{ maxHeight: 400, overflow: "auto" }}>
          {filteredKhoa.map((khoa) => (
            <ListItem key={khoa._id} disablePadding>
              <ListItemButton onClick={() => handleToggle(khoa._id)} dense>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={selectedIds.includes(khoa._id)}
                    tabIndex={-1}
                    disableRipple
                  />
                </ListItemIcon>
                <ListItemText primary={khoa.TenKhoa} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DistributionDialog;
```

### 3.3. PDFQuickViewModal.js

```javascript
/**
 * PDFQuickViewModal - Modal xem PDF nhanh
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - file: { TenFile, DuongDan, KichThuoc }
 */
```

**Implementation:**

```javascript
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import { CloseCircle, DocumentDownload } from "iconsax-react";
import useResponsive from "../../../hooks/useResponsive";

function PDFQuickViewModal({ open, onClose, file }) {
  const isMobile = useResponsive("down", "sm");

  const handleDownload = () => {
    window.open(file?.DuongDan, "_blank");
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      fullScreen={isMobile}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        📄 {file?.TenFile}
        <IconButton onClick={onClose}>
          <CloseCircle />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ height: isMobile ? "calc(100vh - 120px)" : "80vh" }}>
          <iframe
            src={`${file?.DuongDan}#toolbar=0&navpanes=0`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
            title={file?.TenFile}
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button
          startIcon={<DocumentDownload size={18} />}
          onClick={handleDownload}
        >
          Tải xuống
        </Button>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

export default PDFQuickViewModal;
```

### 3.4. DistributionManagementPage.js (QLCL Only)

```javascript
/**
 * DistributionManagementPage - Trang quản lý phân phối (QLCL)
 *
 * Route: /quytrinh-iso/phan-phoi
 *
 * Features:
 * - Danh sách QT với số khoa phân phối
 * - Tìm kiếm, lọc theo khoa xây dựng
 * - Button "Chỉnh sửa phân phối" mở DistributionDialog
 * - Quick view PDF
 */
```

### 3.5. DistributedToMePage.js (Khoa Only)

```javascript
/**
 * DistributedToMePage - Trang QT được phân phối cho khoa
 *
 * Route: /quytrinh-iso/duoc-phan-phoi
 *
 * Features:
 * - Danh sách QT được phân phối cho khoa của user
 * - Read-only (không có nút Edit/Delete)
 * - Badge "Mới" nếu phân phối trong 7 ngày gần đây
 * - Quick view PDF
 */
```

### 3.6. BuiltByMyDeptPage.js (Khoa Only)

```javascript
/**
 * BuiltByMyDeptPage - Trang QT do khoa xây dựng
 *
 * Route: /quytrinh-iso/khoa-xay-dung
 *
 * Features:
 * - Danh sách QT do khoa của user xây dựng
 * - Cột "Phân Phối" hiển thị số khoa được phân phối
 * - Hover để xem danh sách khoa
 * - Quick view PDF
 */
```

### 3.7. Checklist Phase 3

```
[ ] Tạo DistributionDialog.js
[ ] Tạo PDFQuickViewModal.js
[ ] Tạo DistributionChips.js
[ ] Tạo DistributionManagementPage.js
[ ] Tạo DistributedToMePage.js
[ ] Tạo BuiltByMyDeptPage.js
[ ] Test các component riêng lẻ
```

---

## 🎯 PHASE 4: Routes & Menu (Ngày 5-6)

### 4.1. Thêm Routes

**File:** `routes/index.js`

```javascript
// Thêm routes mới cho QuyTrinhISO
{
  path: 'quytrinh-iso',
  children: [
    { index: true, element: <QuyTrinhISOPage /> },
    { path: 'dashboard', element: <QuyTrinhISODashboard /> },
    { path: 'tao-moi', element: <QuyTrinhISOCreatePage /> },
    { path: ':id', element: <QuyTrinhISODetailPage /> },
    { path: ':id/chinh-sua', element: <QuyTrinhISOEditPage /> },

    // NEW Routes
    { path: 'phan-phoi', element: <DistributionManagementPage /> },  // QLCL only
    { path: 'duoc-phan-phoi', element: <DistributedToMePage /> },    // Khoa only
    { path: 'khoa-xay-dung', element: <BuiltByMyDeptPage /> },       // Khoa only
  ]
}
```

### 4.2. Thêm Menu Items

**File:** `layouts/dashboard/NavConfig.js` (hoặc file tương ứng)

```javascript
// Thêm menu items cho QuyTrinhISO
{
  title: 'Quy Trình ISO',
  path: '/quytrinh-iso',
  icon: <DocumentText1 />,
  children: [
    { title: 'Dashboard', path: '/quytrinh-iso/dashboard' },
    { title: 'Danh Sách', path: '/quytrinh-iso' },

    // Chỉ QLCL mới thấy
    {
      title: 'Quản Lý Phân Phối',
      path: '/quytrinh-iso/phan-phoi',
      roles: ['QLCL', 'Admin']
    },

    // Chỉ Khoa mới thấy
    {
      title: 'QT Được Phân Phối',
      path: '/quytrinh-iso/duoc-phan-phoi',
      roles: ['Khoa']
    },
    {
      title: 'QT Khoa Xây Dựng',
      path: '/quytrinh-iso/khoa-xay-dung',
      roles: ['Khoa']
    },
  ]
}
```

### 4.3. Checklist Phase 4

```
[ ] Thêm routes cho 3 trang mới
[ ] Thêm menu items với role-based visibility
[ ] Test navigation
[ ] Test role-based access
```

---

## 🎯 PHASE 5: Form Update & List Enhancement (Ngày 6-7)

### 5.1. Loại Bỏ KhoaPhanPhoi Khỏi Form

**File:** `QuyTrinhISOCreatePage.js`, `QuyTrinhISOEditPage.js`

```javascript
// XÓA FAutocomplete cho KhoaPhanPhoi
// THAY THẾ BẰNG gợi ý:
<Alert severity="info" sx={{ mt: 2 }}>
  💡 Để phân phối quy trình cho các khoa, vui lòng sử dụng tính năng
  <Link to="/quytrinh-iso/phan-phoi">Quản lý phân phối</Link>
</Alert>
```

### 5.2. Thêm Cột Vào Bảng Danh Sách

**File:** `QuyTrinhISOPage.js`

```javascript
// Thêm cột "Phân Phối" và "Quick PDF"
const columns = [
  // ... existing columns

  // Cột Phân Phối
  {
    Header: "📤 PP",
    accessor: "KhoaPhanPhoi",
    Cell: ({ value }) => (
      <Tooltip
        title={value?.map((k) => k.TenKhoa).join(", ") || "Chưa phân phối"}
      >
        <Chip
          size="small"
          label={`${value?.length || 0} khoa`}
          color={value?.length > 0 ? "primary" : "default"}
        />
      </Tooltip>
    ),
    width: 100,
  },

  // Cột Quick PDF
  {
    Header: "📄",
    accessor: "FileDinhKem",
    Cell: ({ value }) => {
      const pdfFile = value?.find((f) =>
        f.TenFile?.toLowerCase().endsWith(".pdf"),
      );
      if (!pdfFile) return null;
      return (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleOpenPDFQuickView(pdfFile);
          }}
        >
          <Eye size={18} />
        </IconButton>
      );
    },
    width: 60,
  },
];
```

### 5.3. Checklist Phase 5

```
[ ] Loại bỏ KhoaPhanPhoi field từ CreatePage
[ ] Loại bỏ KhoaPhanPhoi field từ EditPage
[ ] Thêm Alert gợi ý link đến trang phân phối
[ ] Thêm cột "Phân Phối" vào bảng
[ ] Thêm cột "Quick PDF" vào bảng
[ ] Tích hợp PDFQuickViewModal vào List page
```

---

## 🎯 PHASE 6: Testing & Polish (Ngày 7-8)

### 6.1. Test Cases

```
[ ] QLCL có thể truy cập /phan-phoi
[ ] Khoa KHÔNG thể truy cập /phan-phoi
[ ] Khoa có thể truy cập /duoc-phan-phoi
[ ] Khoa có thể truy cập /khoa-xay-dung
[ ] DistributionDialog search hoạt động với tiếng Việt
[ ] DistributionDialog select all/deselect all
[ ] DistributionDialog save thành công
[ ] PDFQuickViewModal hiển thị PDF đúng
[ ] PDFQuickViewModal fullscreen trên mobile
[ ] Cột "Phân Phối" hiển thị tooltip với danh sách khoa
[ ] Form không còn field KhoaPhanPhoi
[ ] Badge "Mới" hiển thị đúng trên trang duoc-phan-phoi
```

### 6.2. Responsive Testing

```
[ ] DistributionManagementPage mobile
[ ] DistributedToMePage mobile
[ ] BuiltByMyDeptPage mobile
[ ] DistributionDialog mobile (fullScreen)
[ ] PDFQuickViewModal mobile (fullScreen)
```

---

## 📊 TIMELINE TỔNG HỢP

| Phase | Công việc          | Thời gian | Trạng thái      |
| ----- | ------------------ | --------- | --------------- |
| 1     | Backend API        | Ngày 1-2  | ⏳ Chưa bắt đầu |
| 2     | Redux Slice        | Ngày 2-3  | ⏳ Chưa bắt đầu |
| 3     | Components         | Ngày 3-5  | ⏳ Chưa bắt đầu |
| 4     | Routes & Menu      | Ngày 5-6  | ⏳ Chưa bắt đầu |
| 5     | Form & List Update | Ngày 6-7  | ⏳ Chưa bắt đầu |
| 6     | Testing & Polish   | Ngày 7-8  | ⏳ Chưa bắt đầu |

**Tổng thời gian ước tính: 6-8 ngày làm việc**

---

## 🔗 TÀI LIỆU LIÊN QUAN

- [UI_UX_DESIGN.md](./UI_UX_DESIGN.md) - Section 8: Quản Lý Phân Phối
- [IMPLEMENTATION_GAP_ANALYSIS.md](./IMPLEMENTATION_GAP_ANALYSIS.md) - Gap analysis (COMPLETED)
- [quyTrinhISOSlice.js](./quyTrinhISOSlice.js) - Redux slice

---

**END OF DOCUMENT**
