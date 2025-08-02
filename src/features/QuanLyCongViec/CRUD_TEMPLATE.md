# 🚀 Template CRUD Generator cho Schema MongoDB

## 📋 **Hướng dẫn sử dụng Template**

### **Bước 1: Cung cấp thông tin Schema**

Khi muốn tạo CRUD cho schema mới, hãy cung cấp cho AI các thông tin sau:

```yaml
Schema Information:
  name: "[TenSchema]" # Ví dụ: "NhomViecUser", "CongViec", "BaoCao"
  collection: "[collection]" # Tên collection MongoDB
  module: "[module_path]" # Ví dụ: "workmanagement", "reporting"

Fields:
  - field_name: "[type]" # Ví dụ: "TenNhom: String"
  - field_name: "[type]" # "MoTa: String"
  - reference_field: "ref [Model]" # "KhoaID: ref Khoa"

API_Endpoint: "/api/[endpoint]" # Ví dụ: "/api/nhomviec-user"
Frontend_Route: "/[route]" # Ví dụ: "/nhomviecuser"
```

### **Bước 2: AI sẽ tự động generate theo template**

## 🏗️ **CRUD Template Structure**

### **1. Backend Implementation**

#### **1.1 Model Schema**

```javascript
// Path: modules/[module]/models/[SchemaName].js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const [schemaName]Schema = Schema({
  // === FIELDS PLACEHOLDER ===
  [field1]: { type: [Type], required: [boolean], ... },
  [field2]: { type: [Type], maxlength: [number], ... },
  [referenceField]: { type: Schema.ObjectId, ref: "[RefModel]", ... },

  // === STANDARD FIELDS ===
  TrangThaiHoatDong: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
}, {
  timestamps: true,
  collection: "[collection_name]",
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// === INDEXES ===
[schemaName]Schema.index({ isDeleted: 1 });
[schemaName]Schema.index({ TrangThaiHoatDong: 1 });
// Custom indexes based on schema fields

// === MIDDLEWARE ===
[schemaName]Schema.pre(/^find/, function (next) {
  if (!this.getQuery().hasOwnProperty('isDeleted')) {
    this.find({ isDeleted: { $ne: true } });
  }
  next();
});

module.exports = mongoose.model("[SchemaName]", [schemaName]Schema);
```

#### **1.2 Controller**

```javascript
// Path: modules/[module]/controllers/[schemaName].controller.js
const [SchemaName] = require("../models/[SchemaName]");
const { sendResponse, catchAsync } = require("../../../helpers/utils");

const [schemaName]Controller = {};

// GET /api/[endpoint] - Lấy tất cả
[schemaName]Controller.getAll = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 2000, includeDeleted = false } = req.query;

  const filterConditions = [];
  if (includeDeleted !== 'true') {
    filterConditions.push({ isDeleted: false });
  }

  const filterCriteria = filterConditions.length ? { $and: filterConditions } : {};
  const count = await [SchemaName].countDocuments(filterCriteria);
  const totalPages = Math.ceil(count / limit);
  const offset = limit * (page - 1);

  let [schemaNamePlural] = await [SchemaName].find(filterCriteria)
    // === POPULATE PLACEHOLDER ===
    .populate("[referenceField1]", "[fields]")
    .populate("[referenceField2]", "[fields]")
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit);

  return sendResponse(res, 200, true, { [schemaNamePlural], totalPages, count }, null, "");
});

// POST /api/[endpoint] - Tạo mới
[schemaName]Controller.insertOne = catchAsync(async (req, res, next) => {
  const [schemaNameVar] = { ...req.body, isDeleted: false };
  const created = await [SchemaName].create([schemaNameVar]);
  const populated = await [SchemaName].findById(created._id)
    // === POPULATE PLACEHOLDER ===
    .populate("[referenceField1]", "[fields]")
    .populate("[referenceField2]", "[fields]");

  return sendResponse(res, 200, true, populated, null, "Tạo thành công");
});

// PUT /api/[endpoint] - Cập nhật
[schemaName]Controller.updateOne = catchAsync(async (req, res, next) => {
  const { [schemaNameVar] } = req.body;

  let existing = await [SchemaName].findOne({ _id: [schemaNameVar]._id, isDeleted: false });
  if (!existing) {
    throw new Error("Không tìm thấy bản ghi hoặc bản ghi đã bị xóa");
  }

  const updateData = { ...[schemaNameVar] };
  delete updateData.isDeleted;

  const updated = await [SchemaName].findByIdAndUpdate([schemaNameVar]._id, updateData, { new: true })
    // === POPULATE PLACEHOLDER ===
    .populate("[referenceField1]", "[fields]")
    .populate("[referenceField2]", "[fields]");

  return sendResponse(res, 200, true, updated, null, "Cập nhật thành công");
});

// DELETE /api/[endpoint]/:id - Soft delete
[schemaName]Controller.deleteOne = catchAsync(async (req, res, next) => {
  const [schemaNameVar]ID = req.params.id;

  const existing = await [SchemaName].findOne({ _id: [schemaNameVar]ID, isDeleted: false });
  if (!existing) {
    throw new Error("Không tìm thấy bản ghi hoặc bản ghi đã bị xóa");
  }

  await [SchemaName].findByIdAndUpdate([schemaNameVar]ID, {
    isDeleted: true,
    deletedAt: new Date()
  });

  return sendResponse(res, 200, true, [schemaNameVar]ID, null, "Xóa thành công");
});

module.exports = [schemaName]Controller;
```

#### **1.3 Routes**

```javascript
// Path: routes/[schemaName].js
const express = require("express");
const router = express.Router();
const [schemaName]Controller = require("../modules/[module]/controllers/[schemaName].controller");

router.get("/", [schemaName]Controller.getAll);
router.post("/", [schemaName]Controller.insertOne);
router.put("/", [schemaName]Controller.updateOne);
router.delete("/:id", [schemaName]Controller.deleteOne);

module.exports = router;
```

#### **1.4 Routes Registration**

```javascript
// Path: routes/index.js
// Thêm vào file routes/index.js
const [schemaName]Api = require("./[schemaName]");
router.use("[api_endpoint]", [schemaName]Api);
```

### **2. Frontend Implementation**

#### **2.1 Redux Slice**

```javascript
// Path: src/features/[Module]/[SchemaName]/[schemaName]Slice.js
import { createSlice } from "@reduxjs/toolkit";
import apiService from "../../../app/apiService";
import { toast } from "react-toastify";

const initialState = {
  isLoading: false,
  error: null,
  [schemaNamePlural]: [],
  [schemaName]Current: {},
};

const slice = createSlice({
  name: "[schemaName]",
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
    getAll[SchemaName]Success(state, action) {
      state.isLoading = false;
      state.error = null;
      state.[schemaNamePlural] = action.payload;
    },
    insertOne[SchemaName]Success(state, action) {
      state.isLoading = false;
      state.error = null;
      state.[schemaNamePlural].unshift(action.payload);
    },
    updateOne[SchemaName]Success(state, action) {
      state.isLoading = false;
      state.error = null;
      const index = state.[schemaNamePlural].findIndex(item => item._id === action.payload._id);
      if (index !== -1) {
        state.[schemaNamePlural][index] = action.payload;
      }
    },
    deleteOne[SchemaName]Success(state, action) {
      state.isLoading = false;
      state.error = null;
      state.[schemaNamePlural] = state.[schemaNamePlural].filter(item => item._id !== action.payload);
    },
  },
});

export default slice.reducer;

// Actions
export const getAll[SchemaName] = () => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.get("[api_endpoint]");
    dispatch(slice.actions.getAll[SchemaName]Success(response.data.data.[schemaNamePlural]));
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const insertOne[SchemaName] = ([schemaNameVar]) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.post("[api_endpoint]", [schemaNameVar]);
    dispatch(slice.actions.insertOne[SchemaName]Success(response.data.data));
    toast.success("Thêm mới thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const updateOne[SchemaName] = ([schemaNameVar]) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    const response = await apiService.put("[api_endpoint]", { [schemaNameVar] });
    dispatch(slice.actions.updateOne[SchemaName]Success(response.data.data));
    toast.success("Cập nhật thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};

export const deleteOne[SchemaName] = ([schemaNameVar]ID) => async (dispatch) => {
  dispatch(slice.actions.startLoading());
  try {
    await apiService.delete(`[api_endpoint]/${[schemaNameVar]ID}`);
    dispatch(slice.actions.deleteOne[SchemaName]Success([schemaNameVar]ID));
    toast.success("Xóa thành công");
  } catch (error) {
    dispatch(slice.actions.hasError(error.message));
    toast.error(error.message);
  }
};
```

#### **2.2 Main List Component**

```javascript
// Path: src/features/[Module]/[SchemaName]/[SchemaName]List.js
import { Grid, Stack, Tooltip } from "@mui/material";
import { getAll[SchemaName] } from "./[schemaName]Slice";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import Update[SchemaName]Button from "./Update[SchemaName]Button";
import Delete[SchemaName]Button from "./Delete[SchemaName]Button";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import Add[SchemaName]Button from "./Add[SchemaName]Button";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
import { Add, Eye } from "iconsax-react";
import [SchemaName]View from "./[SchemaName]View";
import { formatDate_getDate } from "utils/formatTime";
import ScrollX from "components/ScrollX";

function [SchemaName]List() {
  const columns = useMemo(() => [
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
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={0}>
            <Update[SchemaName]Button [schemaNameVar]={row.original} />
            <Delete[SchemaName]Button [schemaNameVar]ID={row.original._id} />
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
    // === COLUMNS PLACEHOLDER ===
    {
      Header: "[Field Display Name]",
      Footer: "[Field Display Name]",
      accessor: "[fieldName]",
      disableGroupBy: true,
    },
    {
      Header: "[Reference Field Display Name]",
      Footer: "[Reference Field Display Name]",
      accessor: "[referenceField].[displayField]",
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
  ], []);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAll[SchemaName]());
  }, [dispatch]);

  const { [schemaNamePlural] } = useSelector((state) => state.[schemaName]);
  const data = useMemo(() => [schemaNamePlural], [[schemaNamePlural]]);

  const renderRowSubComponent = useCallback(
    ({ row }) => <[SchemaName]View data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="[Page Title]">
          <ScrollX sx={{ height: 670 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <ExcelButton />
                  <Add[SchemaName]Button />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default [SchemaName]List;
```

#### **2.3 Form Dialog Component**

```javascript
// Path: src/features/[Module]/[SchemaName]/ThongTin[SchemaName].js
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  Autocomplete,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "hooks/useAuth";
import { insertOne[SchemaName], updateOne[SchemaName] } from "./[schemaName]Slice";

function ThongTin[SchemaName]({ open, handleClose, [schemaNameVar] }) {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // === REFERENCE DATA SELECTORS ===
  // const { [referenceDataName] } = useSelector((state) => state.[referenceSlice] || { [referenceDataName]: [] });

  const [formData, setFormData] = useState({
    // === FORM FIELDS PLACEHOLDER ===
    [field1]: "",
    [field2]: "",
    [referenceField]: "",
    TrangThaiHoatDong: true,
  });

  // === AUTOCOMPLETE STATES FOR REFERENCES ===
  // const [selected[ReferenceField], setSelected[ReferenceField]] = useState(null);

  const isEdit = [schemaNameVar]?._id && [schemaNameVar]._id !== 0;

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          // === EDIT MODE FIELD MAPPING ===
          [field1]: [schemaNameVar].[field1] || "",
          [field2]: [schemaNameVar].[field2] || "",
          [referenceField]: [schemaNameVar].[referenceField]?._id || [schemaNameVar].[referenceField] || "",
          TrangThaiHoatDong: [schemaNameVar].TrangThaiHoatDong ?? true,
        });
        // === SET SELECTED REFERENCE FOR EDIT ===
      } else {
        // === CREATE MODE WITH DEFAULTS ===
        setFormData({
          [field1]: "",
          [field2]: "",
          [referenceField]: user?.[userReferenceField] || "",
          TrangThaiHoatDong: true,
        });
        // === SET DEFAULT SELECTED REFERENCE ===
      }
    }
  }, [open, [schemaNameVar], isEdit, user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      NguoiTaoID: user._id, // Auto-set creator
    };

    if (isEdit) {
      dispatch(updateOne[SchemaName]({ ...submitData, _id: [schemaNameVar]._id }));
    } else {
      dispatch(insertOne[SchemaName](submitData));
    }

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Cập nhật [entity_name]" : "Thêm [entity_name] mới"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* === FORM FIELDS PLACEHOLDER === */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="[Field Label] *"
              value={formData.[fieldName]}
              onChange={(e) => handleInputChange("[fieldName]", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={[referenceData] || []}
              getOptionLabel={(option) => option.[displayField] || ''}
              value={selected[ReferenceField]}
              onChange={(event, newValue) => {
                setSelected[ReferenceField](newValue);
                setFormData({ ...formData, [referenceField]: newValue?._id || "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="[Reference Field Label] *"
                  required
                  helperText="[Helper text]"
                />
              )}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="[Textarea Field Label]"
              value={formData.[textareaField]}
              onChange={(e) => handleInputChange("[textareaField]", e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.TrangThaiHoatDong}
                  onChange={(e) => handleInputChange("TrangThaiHoatDong", e.target.checked)}
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

export default ThongTin[SchemaName];
```

#### **2.4 Action Buttons** (Add, Update, Delete)

```javascript
// Path: src/features/[Module]/[SchemaName]/Add[SchemaName]Button.js
import { Button } from "@mui/material";
import React, { useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import ThongTin[SchemaName] from "./ThongTin[SchemaName]";

function Add[SchemaName]Button() {
  const [openDialog, setOpenDialog] = useState(false);

  const [schemaNameVar] = { _id: 0 };

  return (
    <div>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenDialog(true)}>
        Thêm [entity_name]
      </Button>

      <ThongTin[SchemaName]
        open={openDialog}
        handleClose={() => setOpenDialog(false)}
        [schemaNameVar]={[schemaNameVar]}
      />
    </div>
  );
}

export default Add[SchemaName]Button;
```

#### **2.5 View Component**

```javascript
// Path: src/features/[Module]/[SchemaName]/[SchemaName]View.js
import React from "react";
import { Grid, Typography, Chip, Box, Divider } from "@mui/material";
import { formatDate_getDate } from "utils/formatTime";

function [SchemaName]View({ data }) {
  if (!data) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        {/* === VIEW FIELDS PLACEHOLDER === */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            [Field Label]:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {data.[fieldName]}
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
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            [Reference Field Label]:
          </Typography>
          <Typography variant="body1">
            {data.[referenceField]?.[displayField] || "Không xác định"}
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

export default [SchemaName]View;
```

### **3. Integration Steps**

#### **3.1 Store Registration**

```javascript
// Path: src/app/store.js
import [schemaName]Slice from "../features/[Module]/[SchemaName]/[schemaName]Slice";

const rootReducer = {
  // ...other reducers
  [schemaName]: [schemaName]Slice,
};
```

#### **3.2 Route Registration**

```javascript
// Path: src/routes/index.js
import [SchemaName]List from "features/[Module]/[SchemaName]/[SchemaName]List";

// Add route
<Route path="[frontend_route]" element={<[SchemaName]List />} />
```

## 🎯 **Usage Instructions**

### **Để sử dụng template này:**

1. **Cung cấp Schema Info:** Đưa cho AI thông tin schema theo format ở trên
2. **AI Replace Placeholders:** AI sẽ thay thế tất cả `[placeholder]` bằng giá trị thực
3. **Generate Files:** AI tạo ra tất cả files cần thiết
4. **Ready to Use:** CRUD functionality hoàn chỉnh

### **Ví dụ sử dụng:**

```yaml
Schema Information:
  name: "CongViec"
  collection: "congviec"
  module: "workmanagement"

Fields:
  - TenCongViec: String (required)
  - MoTa: String
  - NguoiThucHienID: ref User
  - NhomViecID: ref NhomViecUser
  - NgayBatDau: Date
  - NgayKetThuc: Date

API_Endpoint: "/api/congviec"
Frontend_Route: "/congviec"
```

**➡️ AI sẽ generate ra full CRUD cho CongViec theo pattern đã established!**

## 🎉 **Benefits của Template này:**

- ✅ **Consistent Pattern** - Tất cả CRUD follow cùng structure
- ✅ **Time Saving** - Chỉ cần provide schema info
- ✅ **Error Reduction** - Template đã được test và proven
- ✅ **Scalable** - Dễ dàng maintain và extend
- ✅ **Best Practices** - Soft delete, validation, error handling built-in

Bây giờ bạn chỉ cần cung cấp schema info, AI sẽ generate toàn bộ CRUD theo template này! 🚀
