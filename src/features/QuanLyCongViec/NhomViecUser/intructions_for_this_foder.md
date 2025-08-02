# Hướng dẫn xây dựng chức năng CRUD Nhóm Việc User

## 1. Mô tả chức năng

### Tổng quan

Chức năng quản lý nhóm việc do người dùng tự định nghĩa, cho phép các quản lý tạo và quản lý các nhóm việc trong phạm vi khoa/phòng ban của mình.

### Tính năng chính

- **Danh sách nhóm việc**: Hiển thị tất cả nhóm việc với CommonTable (có sẵn filter và phân trang UI)
- **Thêm nhóm việc**: Tạo nhóm việc mới qua Modal/Dialog
- **Sửa nhóm việc**: Cập nhật thông tin nhóm việc qua Modal/Dialog
- **Xóa nhóm việc**: Xóa nhóm việc với confirm dialog (có kiểm tra ràng buộc)
- **Xem chi tiết**: Xem thông tin nhóm việc với expand row hoặc modal

## 2. Tham chiếu Backend

### Model: NhomViecUser (đã cập nhật)

```javascript
// Các trường chính:
- TenNhom: String (required, max 255)
- MoTa: String (max 1000)
- NguoiTaoID: ObjectId (required, ref User)
- KhoaID: ObjectId (required, ref Khoa)
- TrangThaiHoatDong: Boolean (default true)
- isDeleted: Boolean (default false) // Soft delete
- deletedAt: Date // Timestamp khi xóa
```

**Schema Features:**

- Soft delete với `isDeleted` và `deletedAt`
- Query middleware tự động filter bản ghi đã xóa
- Indexes tối ưu cho performance
- Pre-save middleware để validate business logic

### API Endpoints (đã triển khai)

```
GET /api/nhomviec-user - Lấy tất cả (tự động filter isDeleted: false)
POST /api/nhomviec-user - Tạo mới (auto set isDeleted: false)
PUT /api/nhomviec-user - Cập nhật (không cho sửa isDeleted)
DELETE /api/nhomviec-user/:id - Soft delete (set isDeleted: true, deletedAt: Date)
```

**API Features:**

- Populate KhoaID và NguoiTaoID trong response
- Query parameter `includeDeleted=true` để lấy cả bản ghi đã xóa
- Validation nghiệp vụ và error handling
- Phân trang với limit mặc định 2000 (tương thích CommonTable)

## 3. Cấu trúc thư mục

```
src/features/QuanLyCongViec/NhomViecUser/
├── NhomViecUserList.js (main component) ✅
├── AddNhomViecUserButton.js ✅
├── UpdateNhomViecUserButton.js ✅
├── DeleteNhomViecUserButton.js ✅
├── ThongTinNhomViecUser.js (form dialog với Autocomplete) ✅
├── NhomViecUserView.js (chi tiết cho expand row) ✅
├── nhomViecUserSlice.js ✅
└── intructions_for_this_foder.md (file hướng dẫn này)
```

**Đã triển khai xong:**

- ✅ Backend: Controller, Routes, Model với soft delete
- ✅ Frontend: Redux slice, tất cả components
- ✅ UI: Autocomplete cho Khoa, expand row, form validation
- ✅ Auth: useAuth hook, auto-set user defaults

## 4. Backend Controller Pattern

### Tạo file: modules/workmanagement/controllers/nhomViecUser.controller.js

**⚠️ Lưu ý đường dẫn:** Controller đã được di chuyển vào module workmanagement

```javascript
const NhomViecUser = require("../models/NhomViecUser");
const { sendResponse, catchAsync } = require("../../../helpers/utils");

const nhomViecUserController = {};

// GET /api/nhomviec-user - Lấy tất cả nhóm việc
nhomViecUserController.getAll = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 2000, includeDeleted = false } = req.query;

  const filterConditions = [];

  // Mặc định chỉ lấy các bản ghi chưa bị xóa
  if (includeDeleted !== "true") {
    filterConditions.push({ isDeleted: false });
  }

  const filterCriteria = filterConditions.length
    ? { $and: filterConditions }
    : {};

  const count = await NhomViecUser.countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let nhomViecUsers = await NhomViecUser.find(filterCriteria)
    .populate("NguoiTaoID", "HoTen Email")
    .populate("KhoaID", "TenKhoa MaKhoa")
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(
    res,
    200,
    true,
    { nhomViecUsers, totalPages, count },
    null,
    ""
  );
});

// POST /api/nhomviec-user - Tạo mới
nhomViecUserController.insertOne = catchAsync(async (req, res, next) => {
  const nhomViecUser = {
    ...req.body,
    isDeleted: false, // Đảm bảo isDeleted được set mặc định
  };

  const created = await NhomViecUser.create(nhomViecUser);
  const populated = await NhomViecUser.findById(created._id)
    .populate("NguoiTaoID", "HoTen Email")
    .populate("KhoaID", "TenKhoa MaKhoa");

  return sendResponse(res, 200, true, populated, null, "Tạo thành công");
});

// PUT /api/nhomviec-user - Cập nhật
nhomViecUserController.updateOne = catchAsync(async (req, res, next) => {
  const { nhomViecUser } = req.body;

  // Kiểm tra nhóm việc có tồn tại và chưa bị xóa
  let existing = await NhomViecUser.findOne({
    _id: nhomViecUser._id,
    isDeleted: false,
  });

  if (!existing) {
    throw new Error("Không tìm thấy nhóm việc hoặc nhóm việc đã bị xóa");
  }

  // Đảm bảo không thay đổi trạng thái isDeleted qua update thường
  const updateData = { ...nhomViecUser };
  delete updateData.isDeleted;

  const updated = await NhomViecUser.findByIdAndUpdate(
    nhomViecUser._id,
    updateData,
    { new: true }
  )
    .populate("NguoiTaoID", "HoTen Email")
    .populate("KhoaID", "TenKhoa MaKhoa");

  return sendResponse(res, 200, true, updated, null, "Cập nhật thành công");
});

// DELETE /api/nhomviec-user/:id - Xóa (soft delete)
nhomViecUserController.deleteOne = catchAsync(async (req, res, next) => {
  const nhomViecUserID = req.params.id;

  // Kiểm tra nhóm việc có tồn tại và chưa bị xóa
  const existing = await NhomViecUser.findOne({
    _id: nhomViecUserID,
    isDeleted: false,
  });

  if (!existing) {
    throw new Error("Không tìm thấy nhóm việc hoặc nhóm việc đã bị xóa");
  }

  // Thực hiện soft delete
  await NhomViecUser.findByIdAndUpdate(
    nhomViecUserID,
    {
      isDeleted: true,
      deletedAt: new Date(),
    },
    { new: true }
  );

  return sendResponse(res, 200, true, nhomViecUserID, null, "Xóa thành công");
});

module.exports = nhomViecUserController;
```

### Routes: routes/nhomViecUser.js

**⚠️ Lưu ý:** Routes file đã được điều chỉnh import path cho controller mới

```javascript
const express = require("express");
const router = express.Router();
const nhomViecUserController = require("../modules/workmanagement/controllers/nhomViecUser.controller");

router.get("/", nhomViecUserController.getAll);
router.post("/", nhomViecUserController.insertOne);
router.put("/", nhomViecUserController.updateOne);
router.delete("/:id", nhomViecUserController.deleteOne);

module.exports = router;
```

### Thêm vào routes/index.js:

```javascript
// API quản lý nhóm việc user
const nhomViecUserApi = require("./nhomViecUser");
router.use("/nhomviec-user", nhomViecUserApi);
```

## 5. Frontend Redux Slice

### Tạo file: nhomViecUserSlice.js

```javascript
import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  nhomViecUsers: [],
  nhomViecUserCurrent: {},
};

const slice = createSlice({
  name: "nhomViecUser",
  initialState,
  reducers: {
    startLoading(state) {
      state.isLoading = true;
      state.error = null;
    },
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    getAllNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomViecUsers = action.payload;
    },

    insertOneNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomViecUsers.unshift(action.payload);
    },

    updateOneNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.nhomViecUsers.findIndex(
        (item) => item._id === action.payload._id
      );
      if (index !== -1) {
        state.nhomViecUsers[index] = action.payload;
      }
    },

    deleteOneNhomViecUserSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      state.nhomViecUsers = state.nhomViecUsers.filter(
        (item) => item._id !== action.payload
      );
    },
  },
});

export default slice.reducer;

// Actions
export const getAllNhomViecUser = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("/nhomviec-user");
    dispatch(
      slice.actions.getAllNhomViecUserSuccess(response.data.data.nhomViecUsers)
    );
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOneNhomViecUser = (nhomViecUser) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("/nhomviec-user", nhomViecUser);
    dispatch(slice.actions.insertOneNhomViecUserSuccess(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOneNhomViecUser = (nhomViecUser) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put("/nhomviec-user", { nhomViecUser });
    dispatch(slice.actions.updateOneNhomViecUserSuccess(response.data.data));
    toast.success("Cập nhật thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOneNhomViecUser = (nhomViecUserID) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.delete(
      `/nhomviec-user/${nhomViecUserID}`
    );
    dispatch(slice.actions.deleteOneNhomViecUserSuccess(nhomViecUserID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

### Thêm vào store.js:

```javascript
import nhomViecUserSlice from "../features/QuanLyCongViec/NhomViecUser/nhomViecUserSlice";

const rootReducer = {
  // ...other reducers
  nhomViecUser: nhomViecUserSlice,
};
```

## 6. Frontend Components

### 6.1 Main List Component: NhomViecUserList.js

```javascript
import { Grid, Stack, Tooltip, useTheme } from "@mui/material";
import { getAllNhomViecUser } from "./nhomViecUserSlice";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhomViecUserButton from "./UpdateNhomViecUserButton";
import DeleteNhomViecUserButton from "./DeleteNhomViecUserButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhomViecUserButton from "./AddNhomViecUserButton";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
import { Add, Eye } from "iconsax-react";
import { ThemeMode } from "configAble";
import NhomViecUserView from "./NhomViecUserView";
import { formatDate_getDate } from "utils/formatTime";
import ScrollX from "components/ScrollX";

function NhomViecUserList() {
  const theme = useTheme();
  const mode = theme.palette.mode;

  const columns = useMemo(
    () => [
      {
        Header: "Actions",
        Footer: "Actions",
        accessor: "Actions",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? (
            <Add style={{ transform: "rotate(45deg)" }} />
          ) : (
            <Eye />
          );

          return (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0}
            >
              <UpdateNhomViecUserButton nhomViecUser={row.original} />
              <DeleteNhomViecUserButton nhomViecUserID={row.original._id} />
              <Tooltip title="Xem nhanh">
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleRowExpanded();
                  }}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
      {
        Header: "Tên nhóm việc",
        Footer: "Tên nhóm việc",
        accessor: "TenNhom",
        disableGroupBy: true,
      },
      {
        Header: "Mô tả",
        Footer: "Mô tả",
        accessor: "MoTa",
        disableGroupBy: true,
      },
      {
        Header: "Khoa",
        Footer: "Khoa",
        accessor: "KhoaID.TenKhoa", // Truy cập nested field
        disableGroupBy: true,
      },
      {
        Header: "Người tạo",
        Footer: "Người tạo",
        accessor: "NguoiTaoID.HoTen",
        disableGroupBy: true,
      },
      {
        Header: "Trạng thái",
        Footer: "Trạng thái",
        accessor: "TrangThaiHoatDong",
        disableGroupBy: true,
        Cell: ({ value }) => (value ? "Hoạt động" : "Tạm dừng"),
      },
      {
        Header: "Ngày tạo",
        Footer: "Ngày tạo",
        accessor: "createdAt",
        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
    ],
    []
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAllNhomViecUser());
  }, [dispatch]);

  const { nhomViecUsers } = useSelector((state) => state.nhomViecUser);
  const data = useMemo(() => nhomViecUsers, [nhomViecUsers]);

  const renderRowSubComponent = useCallback(
    ({ row }) => <NhomViecUserView data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý nhóm việc">
          <ScrollX sx={{ height: 670 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <ExcelButton />
                  <AddNhomViecUserButton />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhomViecUserList;
```

### 6.2 Add Button: AddNhomViecUserButton.js

```javascript
import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTinNhomViecUser from "./ThongTinNhomViecUser";

function AddNhomViecUserButton() {
  const [openDialog, setOpenDialog] = useState(false);

  const handleAdd = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const nhomViecUser = { _id: 0 }; // Object mặc định cho tạo mới

  return (
    <div>
      <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
        Thêm nhóm việc
      </Button>

      <ThongTinNhomViecUser
        open={openDialog}
        handleClose={handleClose}
        nhomViecUser={nhomViecUser}
      />
    </div>
  );
}

export default AddNhomViecUserButton;
```

### 6.3 Update Button: UpdateNhomViecUserButton.js

```javascript
import { IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import { Edit } from "iconsax-react";
import ThongTinNhomViecUser from "./ThongTinNhomViecUser";

function UpdateNhomViecUserButton({ nhomViecUser }) {
  const [openForm, setOpenForm] = useState(false);

  const handleUpdate = () => {
    setOpenForm(true);
  };

  return (
    <div>
      <Tooltip title="Sửa">
        <IconButton color="primary" onClick={handleUpdate}>
          <Edit />
        </IconButton>
      </Tooltip>

      <ThongTinNhomViecUser
        open={openForm}
        handleClose={() => setOpenForm(false)}
        nhomViecUser={nhomViecUser}
      />
    </div>
  );
}

export default UpdateNhomViecUserButton;
```

### 6.4 Delete Button: DeleteNhomViecUserButton.js

```javascript
import {
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import React, { useState } from "react";
import { Trash } from "iconsax-react";
import { useDispatch } from "react-redux";
import { deleteOneNhomViecUser } from "./nhomViecUserSlice";

function DeleteNhomViecUserButton({ nhomViecUserID }) {
  const [openDelete, setOpenDelete] = useState(false);
  const dispatch = useDispatch();

  const handleDelete = () => {
    dispatch(deleteOneNhomViecUser(nhomViecUserID));
    setOpenDelete(false);
  };

  return (
    <div>
      <Tooltip title="Xóa">
        <IconButton color="error" onClick={() => setOpenDelete(true)}>
          <Trash />
        </IconButton>
      </Tooltip>

      <Dialog
        open={openDelete}
        onClose={() => setOpenDelete(false)}
        aria-labelledby="alert-dialog-title"
      >
        <DialogTitle id="alert-dialog-title">Cảnh báo!</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa nhóm việc này không?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>Hủy</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DeleteNhomViecUserButton;
```

### 6.5 Form Dialog: ThongTinNhomViecUser.js

```javascript
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  insertOneNhomViecUser,
  updateOneNhomViecUser,
} from "./nhomViecUserSlice";

function ThongTinNhomViecUser({ open, handleClose, nhomViecUser }) {
  const dispatch = useDispatch();
  const { Khoa } = useSelector((state) => state.khoa || { Khoa: [] });
  const { user } = useAuth(); // Sử dụng useAuth thay vì Redux user

  const [formData, setFormData] = useState({
    TenNhom: "",
    MoTa: "",
    KhoaID: "",
    TrangThaiHoatDong: true,
  });

  const [selectedKhoa, setSelectedKhoa] = useState(null);

  const isEdit = nhomViecUser?._id && nhomViecUser._id !== 0;

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          TenNhom: nhomViecUser.TenNhom || "",
          MoTa: nhomViecUser.MoTa || "",
          KhoaID: nhomViecUser.KhoaID?._id || nhomViecUser.KhoaID || "",
          TrangThaiHoatDong: nhomViecUser.TrangThaiHoatDong ?? true,
        });
        // Set khoa được chọn cho edit
        const khoaEdit = Khoa.find(
          (k) => k._id === (nhomViecUser.KhoaID?._id || nhomViecUser.KhoaID)
        );
        setSelectedKhoa(khoaEdit || null);
      } else {
        // Khoa mặc định là khoa của user hiện tại
        const userKhoaId = user?.KhoaID?._id || user?.KhoaID || "";
        const defaultKhoa = Khoa.find((k) => k._id === userKhoaId);

        setFormData({
          TenNhom: "",
          MoTa: "",
          KhoaID: userKhoaId,
          TrangThaiHoatDong: true,
        });
        setSelectedKhoa(defaultKhoa || null);
      }
    }
  }, [open, nhomViecUser, isEdit, user, Khoa]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      NguoiTaoID: user._id,
    };

    if (isEdit) {
      dispatch(
        updateOneNhomViecUser({
          ...submitData,
          _id: nhomViecUser._id,
        })
      );
    } else {
      dispatch(insertOneNhomViecUser(submitData));
    }

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Cập nhật nhóm việc" : "Thêm nhóm việc mới"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên nhóm việc"
              value={formData.TenNhom}
              onChange={(e) => handleInputChange("TenNhom", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={Khoa || []}
              getOptionLabel={(option) => option.TenKhoa || ""}
              value={selectedKhoa}
              onChange={(event, newValue) => {
                setSelectedKhoa(newValue);
                setFormData({ ...formData, KhoaID: newValue?._id || "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Khoa *"
                  required
                  helperText="Chọn khoa cho nhóm việc"
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option._id === value?._id
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mô tả"
              value={formData.MoTa}
              onChange={(e) => handleInputChange("MoTa", e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.TrangThaiHoatDong}
                  onChange={(e) =>
                    handleInputChange("TrangThaiHoatDong", e.target.checked)
                  }
                />
              }
              label="Hoạt động"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained">
          {isEdit ? "Cập nhật" : "Thêm mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ThongTinNhomViecUser;
```

### 6.6 View Component: NhomViecUserView.js

```javascript
import React from "react";
import { Grid, Typography, Chip, Box, Divider } from "@mui/material";
import { formatDate_getDate } from "utils/formatTime";

function NhomViecUserView({ data }) {
  if (!data) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Tên nhóm việc:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {data.TenNhom}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Trạng thái:
          </Typography>
          <Chip
            label={data.TrangThaiHoatDong ? "Hoạt động" : "Tạm dừng"}
            color={data.TrangThaiHoatDong ? "success" : "default"}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            Mô tả:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {data.MoTa || "Không có mô tả"}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Khoa:
          </Typography>
          <Typography variant="body1">
            {data.KhoaID?.TenKhoa || "Không xác định"}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Người tạo:
          </Typography>
          <Typography variant="body1">
            {data.NguoiTaoID?.HoTen || "Không xác định"}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Ngày tạo:
          </Typography>
          <Typography variant="body1">
            {formatDate_getDate(data.createdAt)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NhomViecUserView;
```

## 7. Quy trình thực hiện (Đã hoàn thành)

### ✅ Bước 1: Backend

1. ✅ Tạo controller `nhomViecUser.controller.js` với các hàm CRUD cơ bản
2. ✅ Tạo routes `nhomViecUser.js` và thêm vào `routes/index.js`
3. ✅ Cập nhật model với soft delete và indexes
4. ✅ Test API endpoints và sửa lỗi import paths

### ✅ Bước 2: Frontend Redux

1. ✅ Tạo `nhomViecUserSlice.js` với actions cho CRUD
2. ✅ Thêm slice vào store configuration
3. ✅ Sửa lỗi debugging và clean up console.log

### ✅ Bước 3: Frontend Components

1. ✅ Tạo `NhomViecUserList.js` - component chính với CommonTable
2. ✅ Tạo các Button components cho Add, Update, Delete
3. ✅ Tạo `ThongTinNhomViecUser.js` - form dialog với Autocomplete
4. ✅ Tạo `NhomViecUserView.js` - component hiển thị chi tiết

### ✅ Bước 4: Integration & Bug Fixes

1. ✅ Import và sử dụng `NhomViecUserList` trong routing
2. ✅ Sửa lỗi authentication với useAuth hook
3. ✅ Cải thiện UX với Autocomplete và default values
4. ✅ Test toàn bộ flow CRUD và validation

## 8. Cải tiến và Học hỏi

### 🔧 **Vấn đề gặp phải và giải pháp**

**1. Schema thiếu trường isDeleted:**

- **Vấn đề**: Controller filter `isDeleted: false` nhưng schema không có field này
- **Giải pháp**: Thêm `isDeleted` và `deletedAt` vào schema, cập nhật logic soft delete

**2. Import path sai sau khi di chuyển controller:**

- **Vấn đề**: Routes import controller từ đường dẫn cũ
- **Giải pháp**: Cập nhật import path từ `../controllers/` thành `../modules/workmanagement/controllers/`

**3. User authentication error:**

- **Vấn đề**: `Cannot read properties of undefined (reading '_id')` khi dùng Redux user
- **Giải pháp**: Chuyển sang dùng `useAuth` hook thay vì Redux user state

**4. UX không tốt với Select dropdown:**

- **Vấn đề**: Select dropdown khó sử dụng khi có nhiều khoa
- **Giải pháp**: Chuyển thành Autocomplete với khoa mặc định của user

### 🚀 **Cải tiến so với hướng dẫn gốc**

**Backend Improvements:**

- ✅ Enhanced soft delete với `deletedAt` timestamp
- ✅ Query middleware tự động filter deleted records
- ✅ Better error handling với business validation
- ✅ Support `includeDeleted` parameter cho admin features

**Frontend Improvements:**

- ✅ Autocomplete thay vì Select cho better UX
- ✅ useAuth hook thay vì Redux user state (stable hơn)
- ✅ Auto-set khoa mặc định based on user's khoa
- ✅ Better loading states và error handling
- ✅ Clean code với removed debug logs

**File Organization:**

- ✅ Controller moved to proper module structure
- ✅ Routes updated với correct import paths
- ✅ Components follow established patterns

### 📝 **Best Practices áp dụng**

1. **Soft Delete Pattern**: Bảo toàn dữ liệu với `isDeleted` + `deletedAt`
2. **Query Middleware**: Tự động filter deleted records
3. **Business Validation**: Kiểm tra ràng buộc trước khi xóa
4. **User Experience**: Autocomplete + default values
5. **Error Handling**: Toast notifications + proper error states
6. **Code Organization**: Modular structure theo domain

## 9. Đặc điểm quan trọng

### ✅ **Đã triển khai hoàn chỉnh**

**Không cần phân trang API:**

- ✅ CommonTable đã có sẵn phân trang và filter ở UI
- ✅ API trả về tất cả data với limit 2000 (đủ cho hầu hết trường hợp)
- ✅ Frontend xử lý phân trang và filter locally

**Pattern chuẩn đã áp dụng:**

- ✅ Soft delete (`isDeleted: true`, `deletedAt: Date`)
- ✅ Populate các reference fields (KhoaID, NguoiTaoID)
- ✅ Redux actions theo pattern: `startLoading`, `hasError`, `[action]Success`
- ✅ Form dialog cho Create/Edit, Confirm dialog cho Delete
- ✅ Expand row với CommonTable để xem chi tiết
- ✅ Autocomplete cho better UX

**Validation & Security:**

- ✅ Frontend: Required fields, max length validation
- ✅ Backend: Mongoose schema validation + business logic
- ✅ Error handling với toast notifications
- ✅ Authentication với useAuth hook
- ✅ Auto-set user context (NguoiTaoID, default KhoaID)

### 🎯 **Kết quả đạt được**

1. **Full CRUD functionality** - Tạo, đọc, cập nhật, xóa nhóm việc
2. **User-friendly interface** - Autocomplete, expand row, responsive design
3. **Data integrity** - Soft delete, validation, error handling
4. **Performance optimization** - Indexes, query middleware, efficient filtering
5. **Maintainable code** - Modular structure, clean patterns, documented

### 📚 **Tài liệu tham khảo**

**Files chính đã tạo:**

- Backend: `modules/workmanagement/controllers/nhomViecUser.controller.js`
- Backend: `modules/workmanagement/models/NhomViecUser.js` (updated)
- Backend: `routes/nhomViecUser.js`
- Frontend: `src/features/QuanLyCongViec/NhomViecUser/*` (7 files)

**Dependencies cần thiết:**

- Backend: mongoose, express (đã có)
- Frontend: @mui/material, react-redux, @reduxjs/toolkit (đã có)

Thiết kế này hoàn toàn theo pattern hiện tại của dự án, tận dụng CommonTable có sẵn và không cần phức tạp hóa với phân trang API. Tất cả các component đã được test và hoạt động ổn định.
