/**
 * LyDoTuChoiAdminPage - Trang quản lý lý do từ chối yêu cầu (Admin)
 */
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FormProvider, FTextField, FSwitch } from "components/form";

import {
  createLyDoTuChoi,
  deleteLyDoTuChoi,
  getLyDoTuChoiList,
  selectLyDoTuChoiAdminList,
  updateLyDoTuChoi,
} from "./lyDoTuChoiSlice";

const lyDoSchema = Yup.object().shape({
  TenLyDo: Yup.string()
    .required("Tên lý do là bắt buộc")
    .min(2, "Tên lý do phải có ít nhất 2 ký tự")
    .max(255, "Tên lý do không quá 255 ký tự"),
  MoTa: Yup.string().max(500, "Mô tả không quá 500 ký tự"),
  ThuTu: Yup.number()
    .transform((value) => (isNaN(value) ? 0 : value))
    .min(0, "Thứ tự phải >= 0"),
  HoatDong: Yup.boolean(),
});

function LyDoFormDialog({ open, onClose, onSubmit, item }) {
  const isEdit = !!item?._id;

  const methods = useForm({
    resolver: yupResolver(lyDoSchema),
    defaultValues: {
      TenLyDo: "",
      MoTa: "",
      ThuTu: 0,
      HoatDong: true,
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (!open) return;

    if (isEdit && item) {
      reset({
        TenLyDo: item.TenLyDo || "",
        MoTa: item.MoTa || "",
        ThuTu: item.ThuTu || 0,
        HoatDong: item.TrangThai === "HOAT_DONG",
      });
    } else {
      reset({
        TenLyDo: "",
        MoTa: "",
        ThuTu: 0,
        HoatDong: true,
      });
    }
  }, [open, isEdit, item, reset]);

  const handleFormSubmit = (data) => {
    const payload = {
      TenLyDo: data.TenLyDo,
      MoTa: data.MoTa,
      ThuTu: data.ThuTu,
      TrangThai: data.HoatDong ? "HOAT_DONG" : "NGUNG_HOAT_DONG",
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
        <DialogTitle>{isEdit ? "Sửa lý do" : "Thêm lý do mới"}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 2 }}>
            <FTextField
              name="TenLyDo"
              label="Tên lý do *"
              placeholder="VD: Không đủ thông tin"
            />
            <FTextField
              name="MoTa"
              label="Mô tả"
              multiline
              rows={3}
              placeholder="Mô tả chi tiết (nếu cần)"
            />
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

function ConfirmDeleteDialog({ open, onClose, onConfirm, itemName }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Xác nhận xóa</DialogTitle>
      <DialogContent>
        <Typography>
          Bạn có chắc chắn muốn xóa lý do "<strong>{itemName}</strong>"?
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Lưu ý: Nếu lý do đang được sử dụng, hệ thống sẽ chặn xóa và bạn nên
          chuyển sang trạng thái Ngừng hoạt động.
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

function LyDoTuChoiAdminPage() {
  const dispatch = useDispatch();

  const list = useSelector(selectLyDoTuChoiAdminList);
  const isLoading = useSelector((state) => state.lyDoTuChoiAdmin?.isLoading);
  const error = useSelector((state) => state.lyDoTuChoiAdmin?.error);

  const [openForm, setOpenForm] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const [openDelete, setOpenDelete] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  useEffect(() => {
    dispatch(getLyDoTuChoiList({ chiLayHoatDong: false }));
  }, [dispatch]);

  const sortedList = useMemo(() => {
    return [...(list || [])].sort((a, b) => (a.ThuTu || 0) - (b.ThuTu || 0));
  }, [list]);

  const handleCreate = () => {
    setSelectedItem(null);
    setOpenForm(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setOpenForm(true);
  };

  const handleSubmit = (payload, id) => {
    if (id) {
      dispatch(
        updateLyDoTuChoi(id, payload, () => {
          setOpenForm(false);
          setSelectedItem(null);
        })
      );
      return;
    }

    dispatch(
      createLyDoTuChoi(payload, () => {
        setOpenForm(false);
        setSelectedItem(null);
      })
    );
  };

  const handleAskDelete = (item) => {
    setDeleteItem(item);
    setOpenDelete(true);
  };

  const handleConfirmDelete = () => {
    if (!deleteItem?._id) return;

    dispatch(
      deleteLyDoTuChoi(deleteItem._id, () => {
        setOpenDelete(false);
        setDeleteItem(null);
      })
    );
  };

  const renderStatusChip = (status) => {
    if (status === "HOAT_DONG") {
      return (
        <Chip
          size="small"
          icon={<CheckCircleIcon />}
          label="Hoạt động"
          color="success"
          variant="outlined"
        />
      );
    }

    return (
      <Chip
        size="small"
        icon={<BlockIcon />}
        label="Ngừng"
        color="default"
        variant="outlined"
      />
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Card>
        <CardHeader
          title="Lý do từ chối"
          subheader="Quản lý danh mục lý do từ chối yêu cầu (toàn hệ thống)"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreate}
            >
              Thêm mới
            </Button>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box>
              <Skeleton height={40} />
              <Skeleton height={40} />
              <Skeleton height={40} />
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell width={80}>Thứ tự</TableCell>
                    <TableCell>Tên lý do</TableCell>
                    <TableCell>Mô tả</TableCell>
                    <TableCell width={140}>Trạng thái</TableCell>
                    <TableCell width={120} align="right">
                      Thao tác
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {sortedList.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <Typography color="text.secondary">
                          Chưa có lý do từ chối nào.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedList.map((item) => (
                      <TableRow key={item._id} hover>
                        <TableCell>{item.ThuTu ?? 0}</TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {item.TenLyDo}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography color="text.secondary">
                            {item.MoTa || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {renderStatusChip(item.TrangThai)}
                        </TableCell>
                        <TableCell align="right">
                          <Stack
                            direction="row"
                            spacing={1}
                            justifyContent="flex-end"
                          >
                            <Tooltip title="Sửa">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(item)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Xóa">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleAskDelete(item)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <LyDoFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        onSubmit={handleSubmit}
        item={selectedItem}
      />

      <ConfirmDeleteDialog
        open={openDelete}
        onClose={() => {
          setOpenDelete(false);
          setDeleteItem(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={deleteItem?.TenLyDo || ""}
      />
    </Container>
  );
}

export default LyDoTuChoiAdminPage;
