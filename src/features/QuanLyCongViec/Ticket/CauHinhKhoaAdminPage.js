/**
 * CauHinhKhoaAdminPage - Trang quản lý cấu hình người điều phối & quản lý khoa
 *
 * Admin page để cấu hình:
 * - Quản lý khoa: người có quyền cấu hình danh mục yêu cầu
 * - Người điều phối: nhận thông báo khi có yêu cầu mới
 *
 * UI/UX Improvements v2:
 * - Compact header với dropdown khoa
 * - Avatar màu sắc phân biệt vai trò
 * - Hover effect trên list item
 * - Mobile responsive
 * - Quick help tooltip
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
  Grid,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Skeleton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Autocomplete,
  TextField,
  Paper,
  Stack,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  SupervisorAccount as SupervisorIcon,
  LocalShipping as DieuPhoiIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  HelpOutline as HelpIcon,
  Business as BusinessIcon,
} from "@mui/icons-material";
import { FAutocomplete, FormProvider } from "components/form";
import EmployeeAvatar from "components/EmployeeAvatar";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";

import {
  getCauHinhByKhoa,
  createCauHinhKhoa,
  addQuanLyKhoa,
  removeQuanLyKhoa,
  addNguoiDieuPhoi,
  removeNguoiDieuPhoi,
  selectCauHinhHienTai,
  selectCauHinhLoading,
  getNhanVienTheoKhoa,
  selectNhanVienTheoKhoa,
  getMyPermissions,
  selectMyPermissions,
} from "./cauHinhKhoaSlice";
import { getAllKhoa } from "features/Daotao/Khoa/khoaSlice";
import useAuth from "hooks/useAuth";

// Validation schema for adding person
const addPersonSchema = Yup.object().shape({
  NhanVienID: Yup.object().nullable().required("Vui lòng chọn nhân viên"),
});

/**
 * Dialog để thêm người (quản lý/điều phối) - Improved
 */
function AddPersonDialog({
  open,
  onClose,
  onSubmit,
  title,
  excludeIds = [],
  nhanVienList,
  color = "primary",
}) {
  const methods = useForm({
    resolver: yupResolver(addPersonSchema),
    defaultValues: { NhanVienID: null },
  });

  const { handleSubmit, reset } = methods;

  const availableNhanVien = (nhanVienList || []).filter(
    (nv) => !excludeIds.includes(nv._id)
  );

  const handleFormSubmit = (data) => {
    onSubmit(data.NhanVienID._id);
    reset();
    onClose();
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <FormProvider methods={methods} onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogTitle
          sx={{
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <AddIcon />
          {title}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 3 }}>
            <FAutocomplete
              name="NhanVienID"
              label="Tìm và chọn nhân viên"
              options={availableNhanVien}
              getOptionLabel={(option) =>
                option?.HoTen
                  ? `${option.HoTen} ${
                      option.ChucDanh ? `- ${option.ChucDanh}` : ""
                    }`
                  : ""
              }
              isOptionEqualToValue={(option, value) =>
                option?._id === value?._id
              }
              renderOption={(props, option) => (
                <li {...props} key={option._id}>
                  <Box
                    sx={{
                      py: 0.5,
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                    }}
                  >
                    <EmployeeAvatar
                      nhanVienId={option._id}
                      name={option.HoTen}
                      size="sm"
                      color={color}
                      type="combined"
                      sx={{ width: 36, height: 36 }}
                    />
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {option.HoTen}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.MaNhanVien}
                        {option.ChucDanh && ` • ${option.ChucDanh}`}
                        {option.ChucVu && ` • ${option.ChucVu}`}
                      </Typography>
                    </Box>
                  </Box>
                </li>
              )}
              noOptionsText="Không còn nhân viên nào khả dụng"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} color="inherit">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color={color}
            startIcon={<AddIcon />}
            disabled={availableNhanVien.length === 0}
          >
            Thêm
          </Button>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}

/**
 * Component hiển thị danh sách người (quản lý/điều phối) - Improved
 */
function PersonList({
  title,
  subtitle,
  icon: Icon,
  persons,
  onAdd,
  onRemove,
  emptyMessage,
  color = "primary",
  isLoading = false,
}) {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={{
        height: "100%",
        borderTop: `3px solid ${theme.palette[color].main}`,
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              color: `${color}.contrastText`,
              width: 44,
              height: 44,
            }}
          >
            <Icon />
          </Avatar>
        }
        title={
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="h6" component="span" fontWeight="bold">
              {title}
            </Typography>
            <Chip
              label={persons?.length || 0}
              size="small"
              sx={{
                height: 24,
                minWidth: 32,
                bgcolor: `${color}.main`,
                color: `${color}.contrastText`,
                fontWeight: "bold",
              }}
            />
          </Stack>
        }
        subheader={
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        }
        action={
          <Button
            size="small"
            startIcon={<AddIcon />}
            onClick={onAdd}
            variant="contained"
            color={color}
            sx={{ borderRadius: 2 }}
          >
            Thêm
          </Button>
        }
        sx={{
          pb: 1.5,
          pt: 2,
          bgcolor: alpha(theme.palette[color].main, 0.06),
          borderBottom: `2px solid ${alpha(theme.palette[color].main, 0.15)}`,
        }}
      />
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        {isLoading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={56}
                sx={{ mb: 1, borderRadius: 1 }}
              />
            ))}
          </Box>
        ) : !persons?.length ? (
          <Box sx={{ p: 3, textAlign: "center" }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: "grey.100",
                color: "grey.400",
                mx: "auto",
                mb: 2,
              }}
            >
              <PersonIcon sx={{ fontSize: 32 }} />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{ mt: 2 }}
              color={color}
            >
              Thêm người đầu tiên
            </Button>
          </Box>
        ) : (
          <List disablePadding>
            {persons.map((person, index) => (
              <ListItem
                key={person.NhanVienID?._id || index}
                divider={index < persons.length - 1}
                sx={{
                  py: 1,
                  px: 2,
                  transition: "background-color 0.2s",
                  "&:hover": {
                    bgcolor: "grey.50",
                  },
                }}
              >
                <ListItemAvatar sx={{ minWidth: 42 }}>
                  <EmployeeAvatar
                    size="sm"
                    nhanVienId={person.NhanVienID?._id || person.NhanVienID}
                    name={person.NhanVienID?.HoTen}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight="medium">
                      {person.NhanVienID?.HoTen || "N/A"}
                    </Typography>
                  }
                  secondary={
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      sx={{ mt: 0.25 }}
                    >
                      {person.NhanVienID?.MaNhanVien && (
                        <Chip
                          label={person.NhanVienID.MaNhanVien}
                          size="small"
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                      {person.NhanVienID?.ChucDanh && (
                        <Chip
                          label={person.NhanVienID.ChucDanh}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: "0.7rem",
                            bgcolor: "grey.100",
                          }}
                        />
                      )}
                      {person.NhanVienID?.ChucVu && (
                        <Chip
                          label={person.NhanVienID.ChucVu}
                          size="small"
                          color={color}
                          sx={{ height: 20, fontSize: "0.7rem" }}
                        />
                      )}
                    </Stack>
                  }
                />
                <ListItemSecondaryAction>
                  <Tooltip title="Xóa khỏi danh sách">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => onRemove(person)}
                      sx={{
                        color: "grey.400",
                        "&:hover": {
                          color: "error.main",
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                        },
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main Component - Improved UI/UX
 */
function CauHinhKhoaAdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Redux state
  const allKhoaList = useSelector((state) => state.khoa?.Khoa) || [];
  const nhanVienList = useSelector(selectNhanVienTheoKhoa);
  const cauHinhHienTai = useSelector(selectCauHinhHienTai);
  const isLoading = useSelector(selectCauHinhLoading);
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
  const [addQuanLyOpen, setAddQuanLyOpen] = useState(false);
  const [addDieuPhoiOpen, setAddDieuPhoiOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({
    open: false,
    person: null,
    type: null,
  });

  // Load danh sách khoa và quyền
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
        dispatch(getCauHinhByKhoa(firstKhoa._id));
        dispatch(getNhanVienTheoKhoa(firstKhoa._id));
      }
    }
  }, [isAdmin, khoaList, selectedKhoa, dispatch]);

  // Load cấu hình và nhân viên khi chọn khoa
  const handleKhoaChange = useCallback(
    (khoa) => {
      setSelectedKhoa(khoa);
      if (khoa?._id) {
        dispatch(getCauHinhByKhoa(khoa._id));
        dispatch(getNhanVienTheoKhoa(khoa._id));
      }
    },
    [dispatch]
  );

  // Handlers
  const handleCreateCauHinh = () => {
    if (!selectedKhoa?._id) return;
    dispatch(
      createCauHinhKhoa({
        KhoaID: selectedKhoa._id,
        DanhSachQuanLyKhoa: [],
        DanhSachNguoiDieuPhoi: [],
      })
    );
  };

  const handleAddQuanLy = (nhanVienId) => {
    if (!selectedKhoa?._id) return;
    dispatch(addQuanLyKhoa(selectedKhoa._id, nhanVienId));
  };

  const handleRemoveQuanLy = (nhanVienId) => {
    if (!selectedKhoa?._id) return;
    dispatch(removeQuanLyKhoa(selectedKhoa._id, nhanVienId));
  };

  const handleAddDieuPhoi = (nhanVienId) => {
    if (!selectedKhoa?._id) return;
    dispatch(addNguoiDieuPhoi(selectedKhoa._id, nhanVienId));
  };

  const handleRemoveDieuPhoi = (nhanVienId) => {
    if (!selectedKhoa?._id) return;
    dispatch(removeNguoiDieuPhoi(selectedKhoa._id, nhanVienId));
  };

  const handleOpenDeleteConfirm = (person, type) => {
    setDeleteConfirm({ open: true, person, type });
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirm({ open: false, person: null, type: null });
  };

  const handleConfirmDelete = () => {
    const { person, type } = deleteConfirm;
    if (!person?.NhanVienID?._id) return;

    if (type === "quanly") {
      handleRemoveQuanLy(person.NhanVienID._id);
    } else if (type === "dieuphoi") {
      handleRemoveDieuPhoi(person.NhanVienID._id);
    }
    handleCloseDeleteConfirm();
  };

  // Exclude IDs
  const quanLyIds =
    cauHinhHienTai?.DanhSachQuanLyKhoa?.map(
      (ql) => ql.NhanVienID?._id || ql.NhanVienID
    ) || [];
  const dieuPhoiIds =
    cauHinhHienTai?.DanhSachNguoiDieuPhoi?.map(
      (dp) => dp.NhanVienID?._id || dp.NhanVienID
    ) || [];

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Compact Header */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          borderRadius: 2,
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "stretch", sm: "center" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => navigate(-1)}
              size="small"
              sx={{ color: "inherit" }}
            >
              <ArrowBackIcon />
            </IconButton>
            <SettingsIcon />
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Cấu hình Khoa
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.85 }}>
                Quản lý phân quyền & điều phối
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2}>
            <Autocomplete
              options={khoaList}
              value={selectedKhoa}
              onChange={(_, newValue) => handleKhoaChange(newValue)}
              getOptionLabel={(option) => option?.TenKhoa || ""}
              isOptionEqualToValue={(option, value) =>
                option?._id === value?._id
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder="Chọn Khoa..."
                  size="small"
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <BusinessIcon color="action" sx={{ ml: 1, mr: 0.5 }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{
                minWidth: 280,
                bgcolor: "white",
                borderRadius: 1,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "transparent",
                },
              }}
              noOptionsText="Không tìm thấy khoa"
            />
            <Tooltip title="Quản lý Khoa có quyền cấu hình danh mục. Điều phối viên nhận thông báo yêu cầu mới.">
              <IconButton size="small" sx={{ color: "inherit" }}>
                <HelpIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Paper>

      {/* Chưa chọn khoa */}
      {!selectedKhoa && !isLoading && (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            bgcolor: "grey.50",
            borderRadius: 2,
          }}
        >
          <BusinessIcon sx={{ fontSize: 64, color: "grey.300", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chọn một Khoa để bắt đầu
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Sử dụng dropdown ở trên để chọn khoa cần cấu hình
          </Typography>
        </Paper>
      )}

      {/* Loading */}
      {isLoading && selectedKhoa && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Skeleton
              variant="rectangular"
              height={350}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Skeleton
              variant="rectangular"
              height={350}
              sx={{ borderRadius: 2 }}
            />
          </Grid>
        </Grid>
      )}

      {/* Khoa chưa được cấu hình */}
      {selectedKhoa && !cauHinhHienTai && !isLoading && (
        <Paper sx={{ p: 4, textAlign: "center", borderRadius: 2 }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: "warning.light",
              color: "warning.dark",
              mx: "auto",
              mb: 2,
            }}
          >
            <WarningIcon sx={{ fontSize: 40 }} />
          </Avatar>
          <Typography variant="h6" gutterBottom>
            Khoa "{selectedKhoa.TenKhoa}" chưa được cấu hình
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, maxWidth: 400, mx: "auto" }}
          >
            Tạo cấu hình để thêm Quản lý Khoa và Người Điều phối cho khoa này.
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleCreateCauHinh}
            sx={{ borderRadius: 2, px: 4 }}
          >
            Tạo cấu hình
          </Button>
        </Paper>
      )}

      {/* Hiển thị cấu hình */}
      {selectedKhoa && cauHinhHienTai && !isLoading && (
        <>
          {/* Quick info bar */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 2 }}
          >
            <Chip
              icon={<CheckIcon />}
              label={selectedKhoa.TenKhoa}
              color="success"
              variant="outlined"
            />
            <Typography variant="caption" color="text.secondary">
              👑 Quản lý = cấu hình danh mục&nbsp;&nbsp;•&nbsp;&nbsp;📬 Điều
              phối = nhận thông báo
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {/* Quản lý khoa */}
            <Grid item xs={12} md={6}>
              <PersonList
                title="Quản lý Khoa"
                subtitle="Quyền cấu hình danh mục yêu cầu"
                icon={SupervisorIcon}
                persons={cauHinhHienTai.DanhSachQuanLyKhoa}
                onAdd={() => setAddQuanLyOpen(true)}
                onRemove={(person) => handleOpenDeleteConfirm(person, "quanly")}
                emptyMessage="Thêm người có quyền cấu hình danh mục yêu cầu của khoa."
                color="primary"
                isLoading={isLoading}
              />
            </Grid>

            {/* Người điều phối */}
            <Grid item xs={12} md={6}>
              <PersonList
                title="Người Điều phối"
                subtitle="Nhận thông báo & xử lý yêu cầu"
                icon={DieuPhoiIcon}
                persons={cauHinhHienTai.DanhSachNguoiDieuPhoi}
                onAdd={() => setAddDieuPhoiOpen(true)}
                onRemove={(person) =>
                  handleOpenDeleteConfirm(person, "dieuphoi")
                }
                emptyMessage="Thêm người nhận thông báo khi có yêu cầu mới gửi đến khoa."
                color="secondary"
                isLoading={isLoading}
              />
            </Grid>
          </Grid>
        </>
      )}

      {/* Dialogs */}
      <AddPersonDialog
        open={addQuanLyOpen}
        onClose={() => setAddQuanLyOpen(false)}
        onSubmit={handleAddQuanLy}
        title="Thêm Quản lý Khoa"
        excludeIds={quanLyIds}
        nhanVienList={nhanVienList}
        color="primary"
      />

      <AddPersonDialog
        open={addDieuPhoiOpen}
        onClose={() => setAddDieuPhoiOpen(false)}
        onSubmit={handleAddDieuPhoi}
        title="Thêm Người Điều phối"
        excludeIds={dieuPhoiIds}
        nhanVienList={nhanVienList}
        color="secondary"
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        open={deleteConfirm.open}
        onClose={handleCloseDeleteConfirm}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: "error.light",
              color: "error.dark",
              mx: "auto",
              mb: 1,
            }}
          >
            <DeleteIcon />
          </Avatar>
          <Typography variant="h6">Xác nhận xóa</Typography>
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          <Typography>
            Bạn có chắc chắn muốn xóa{" "}
            <strong>
              {deleteConfirm.person?.NhanVienID?.HoTen || "nhân viên này"}
            </strong>{" "}
            khỏi danh sách{" "}
            <Chip
              label={
                deleteConfirm.type === "quanly"
                  ? "Quản lý Khoa"
                  : "Người Điều phối"
              }
              size="small"
              color={deleteConfirm.type === "quanly" ? "primary" : "secondary"}
              sx={{ verticalAlign: "middle" }}
            />
            ?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 3, gap: 1 }}>
          <Button
            onClick={handleCloseDeleteConfirm}
            variant="outlined"
            sx={{ minWidth: 100 }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            sx={{ minWidth: 100 }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default CauHinhKhoaAdminPage;
