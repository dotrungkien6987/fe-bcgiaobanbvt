/**
 * DanhMucYeuCauAdminPage - Trang quản lý danh mục yêu cầu theo khoa
 *
 * CRUD danh mục loại yêu cầu
 */
import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Container,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
  IconButton,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Tooltip,
  Stack,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
  AccessTime as TimeIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FTextField, FSwitch, FSelect } from "components/form";

import {
  getDanhMucByKhoa,
  createDanhMuc,
  updateDanhMuc,
  deleteDanhMuc,
  selectDanhMucList as selectDanhMucListFromSlice,
} from "./danhMucYeuCauSlice";
import { getAllKhoa } from "features/Daotao/Khoa/khoaSlice";
import { getMyPermissions, selectMyPermissions } from "./cauHinhKhoaSlice";
import useAuth from "hooks/useAuth";

// Options cho đơn vị thời gian
const DON_VI_THOI_GIAN_OPTIONS = [
  { value: "PHUT", label: "Phút" },
  { value: "GIO", label: "Giờ" },
  { value: "NGAY", label: "Ngày" },
];

// Hàm format hiển thị thời gian dự kiến
const formatThoiGianDuKien = (soLuong, donVi) => {
  if (!soLuong) return "-";
  const donViLabel =
    DON_VI_THOI_GIAN_OPTIONS.find((d) => d.value === donVi)?.label || donVi;
  return `${soLuong} ${donViLabel.toLowerCase()}`;
};

// Validation schema
const danhMucSchema = Yup.object().shape({
  TenDanhMuc: Yup.string()
    .required("Tên danh mục là bắt buộc")
    .min(2, "Tên danh mục phải có ít nhất 2 ký tự")
    .max(100, "Tên danh mục không quá 100 ký tự"),
  MoTa: Yup.string().max(500, "Mô tả không quá 500 ký tự"),
  ThoiGianDuKien: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .required("Thời gian dự kiến là bắt buộc")
    .min(1, "Thời gian dự kiến phải >= 1"),
  DonViThoiGian: Yup.string()
    .oneOf(["PHUT", "GIO", "NGAY"], "Đơn vị không hợp lệ")
    .default("PHUT"),
  ThuTu: Yup.number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .min(0, "Thứ tự phải >= 0"),
  HoatDong: Yup.boolean(),
});

/**
 * Dialog tạo/sửa danh mục
 */
function DanhMucFormDialog({ open, onClose, onSubmit, item, khoaId }) {
  const isEdit = !!item?._id;

  const methods = useForm({
    resolver: yupResolver(danhMucSchema),
    defaultValues: {
      TenDanhMuc: "",
      MoTa: "",
      ThoiGianDuKien: 30,
      DonViThoiGian: "PHUT",
      ThuTu: 0,
      HoatDong: true,
    },
  });

  const { handleSubmit, reset } = methods;

  // Reset form khi mở dialog
  useEffect(() => {
    if (open) {
      if (isEdit && item) {
        reset({
          TenDanhMuc: item.TenLoaiYeuCau || "", // Map from backend TenLoaiYeuCau
          MoTa: item.MoTa || "",
          ThoiGianDuKien: item.ThoiGianDuKien || 30,
          DonViThoiGian: item.DonViThoiGian || "PHUT",
          ThuTu: item.ThuTu || 0,
          HoatDong: item.TrangThai === "HOAT_DONG", // Map from backend TrangThai
        });
      } else {
        reset({
          TenDanhMuc: "",
          MoTa: "",
          ThoiGianDuKien: 30,
          DonViThoiGian: "PHUT",
          ThuTu: 0,
          HoatDong: true,
        });
      }
    }
  }, [open, item, isEdit, reset]);

  const handleFormSubmit = (data) => {
    // Map frontend field names to backend field names
    const payload = {
      KhoaID: khoaId,
      TenLoaiYeuCau: data.TenDanhMuc, // Backend expects TenLoaiYeuCau
      MoTa: data.MoTa,
      ThoiGianDuKien: data.ThoiGianDuKien,
      DonViThoiGian: data.DonViThoiGian,
      ThuTu: data.ThuTu,
      TrangThai: data.HoatDong ? "HOAT_DONG" : "NGUNG_HOAT_DONG", // Backend uses TrangThai enum
    };
    onSubmit(payload, isEdit ? item._id : null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle>
          {isEdit ? "Sửa Danh mục" : "Thêm Danh mục mới"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <FTextField
              name="TenDanhMuc"
              label="Tên danh mục *"
              placeholder="VD: Yêu cầu xét nghiệm, Hội chẩn..."
            />
            <FTextField
              name="MoTa"
              label="Mô tả"
              multiline
              rows={3}
              placeholder="Mô tả chi tiết về loại yêu cầu này"
            />

            {/* Thời gian dự kiến */}
            <Stack direction="row" spacing={2}>
              <FTextField
                name="ThoiGianDuKien"
                label="Thời gian dự kiến *"
                type="number"
                sx={{ flex: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimeIcon color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                helperText="Thời gian dự kiến để xử lý yêu cầu"
              />
              <FSelect
                name="DonViThoiGian"
                label="Đơn vị"
                sx={{ flex: 1, minWidth: 120 }}
                options={DON_VI_THOI_GIAN_OPTIONS}
                placeholder=""
              />
            </Stack>

            <FTextField
              name="ThuTu"
              label="Thứ tự hiển thị"
              type="number"
              helperText="Số nhỏ hơn sẽ hiển thị trước"
            />
            <FSwitch name="HoatDong" label="Đang hoạt động" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Hủy</Button>
          <Button type="submit" variant="contained">
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

/**
 * Dialog xác nhận xóa
 */
function ConfirmDeleteDialog({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa danh mục "<strong>{itemName}</strong>"?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Lưu ý: Các yêu cầu đã sử dụng danh mục này sẽ không bị ảnh hưởng.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Xóa
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/**
 * Main Component
 */
function DanhMucYeuCauAdminPage() {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Redux state
  const allKhoaList = useSelector((state) => state.khoa?.Khoa) || [];
  const danhMucList = useSelector(selectDanhMucListFromSlice) || [];
  const isLoading = useSelector((state) => state.danhMucYeuCau?.isLoading);
  const myPermissions = useSelector(selectMyPermissions);

  // Kiểm tra quyền Admin
  const isAdmin =
    user?.PhanQuyen === "admin" || user?.PhanQuyen === "superadmin";

  // Filter danh sách khoa theo quyền
  // Admin: xem tất cả | Quản lý Khoa: chỉ xem khoa mình quản lý
  const khoaList = isAdmin
    ? allKhoaList
    : allKhoaList.filter((khoa) =>
        myPermissions?.quanLyKhoaList?.some((qlk) => qlk._id === khoa._id)
      );

  // Local state
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Load khoa list và quyền
  useEffect(() => {
    dispatch(getAllKhoa());
    if (!isAdmin && !myPermissions) {
      dispatch(getMyPermissions());
    }
  }, [dispatch, isAdmin, myPermissions]);

  // Auto-select khoa đầu tiên cho Quản lý Khoa (không phải Admin)
  useEffect(() => {
    if (!isAdmin && khoaList.length > 0 && !selectedKhoa) {
      const firstKhoa = khoaList[0];
      setSelectedKhoa(firstKhoa);
      if (firstKhoa?._id) {
        dispatch(getDanhMucByKhoa(firstKhoa._id, false));
      }
    }
  }, [isAdmin, khoaList, selectedKhoa, dispatch]);

  // Load danh mục khi chọn khoa
  const handleKhoaChange = useCallback(
    (khoa) => {
      setSelectedKhoa(khoa);
      if (khoa?._id) {
        dispatch(getDanhMucByKhoa(khoa._id, false)); // Load cả inactive
      }
    },
    [dispatch]
  );

  // Mở form thêm mới
  const handleOpenAdd = () => {
    setEditItem(null);
    setFormOpen(true);
  };

  // Mở form sửa
  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormOpen(true);
  };

  // Đóng form
  const handleCloseForm = () => {
    setFormOpen(false);
    setEditItem(null);
  };

  // Submit form (create hoặc update)
  const handleFormSubmit = (data, itemId) => {
    if (itemId) {
      // Update
      dispatch(
        updateDanhMuc(itemId, data, () => {
          handleCloseForm();
        })
      );
    } else {
      // Create
      dispatch(
        createDanhMuc(data, () => {
          handleCloseForm();
        })
      );
    }
  };

  // Mở dialog xác nhận xóa
  const handleOpenDelete = (item) => {
    setDeleteItem(item);
    setDeleteDialogOpen(true);
  };

  // Đóng dialog xác nhận xóa
  const handleCloseDelete = () => {
    setDeleteDialogOpen(false);
    setDeleteItem(null);
  };

  // Xác nhận xóa
  const handleConfirmDelete = () => {
    if (deleteItem?._id) {
      dispatch(deleteDanhMuc(deleteItem._id));
    }
    handleCloseDelete();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          <CategoryIcon sx={{ mr: 1, verticalAlign: "middle" }} />
          Quản lý Danh mục Yêu cầu
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Thiết lập các loại yêu cầu mà khoa có thể tiếp nhận
        </Typography>
      </Box>

      {/* Chọn Khoa */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Autocomplete
            options={khoaList}
            value={selectedKhoa}
            onChange={(_, newValue) => handleKhoaChange(newValue)}
            getOptionLabel={(option) => option?.TenKhoa || ""}
            isOptionEqualToValue={(option, value) => option?._id === value?._id}
            renderInput={(params) => (
              <TextField {...params} label="Chọn Khoa để quản lý danh mục" />
            )}
            sx={{ maxWidth: 400 }}
          />
        </CardContent>
      </Card>

      {/* Chưa chọn khoa */}
      {!selectedKhoa && (
        <Alert severity="info">
          Vui lòng chọn một khoa để xem và quản lý danh mục yêu cầu.
        </Alert>
      )}

      {/* Hiển thị danh mục */}
      {selectedKhoa && (
        <Card>
          <CardHeader
            title={`Danh mục yêu cầu - ${selectedKhoa.TenKhoa}`}
            action={
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenAdd}
              >
                Thêm danh mục
              </Button>
            }
          />
          <CardContent sx={{ p: 0 }}>
            {isLoading ? (
              <Box sx={{ p: 2 }}>
                <Skeleton variant="rectangular" height={200} />
              </Box>
            ) : danhMucList.length === 0 ? (
              <Alert severity="warning" sx={{ m: 2 }}>
                Khoa này chưa có danh mục yêu cầu nào. Hãy thêm danh mục mới.
              </Alert>
            ) : (
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width={60}>STT</TableCell>
                      <TableCell>Tên danh mục</TableCell>
                      <TableCell>Mô tả</TableCell>
                      <TableCell width={140} align="center">
                        TG dự kiến
                      </TableCell>
                      <TableCell width={80} align="center">
                        Thứ tự
                      </TableCell>
                      <TableCell width={120} align="center">
                        Trạng thái
                      </TableCell>
                      <TableCell width={120} align="center">
                        Thao tác
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {danhMucList.map((item, index) => (
                      <TableRow key={item._id} hover>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {item.TenLoaiYeuCau}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {item.MoTa || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            icon={<TimeIcon fontSize="small" />}
                            label={formatThoiGianDuKien(
                              item.ThoiGianDuKien,
                              item.DonViThoiGian
                            )}
                            size="small"
                            variant="outlined"
                            color="info"
                          />
                        </TableCell>
                        <TableCell align="center">{item.ThuTu || 0}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={
                              item.TrangThai === "HOAT_DONG"
                                ? "Hoạt động"
                                : "Ngừng"
                            }
                            color={
                              item.TrangThai === "HOAT_DONG"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Stack
                            direction="row"
                            spacing={0.5}
                            justifyContent="center"
                          >
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                color="primary"
                                onClick={() => handleOpenEdit(item)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleOpenDelete(item)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>
      )}

      {/* Form Dialog */}
      <DanhMucFormDialog
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        item={editItem}
        khoaId={selectedKhoa?._id}
      />

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        itemName={deleteItem?.TenDanhMuc}
      />
    </Container>
  );
}

export default DanhMucYeuCauAdminPage;
