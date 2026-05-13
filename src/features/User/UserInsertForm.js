import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FTextField, FormProvider } from "../../components/form";

import {
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  Divider,
  FormControl,
  TextField,
  Autocomplete,
  Typography,
  useMediaQuery,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  Grid,
  Paper,
  TableContainer,
  IconButton,
  Chip,
  Checkbox,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

import { getKhoas } from "../BaoCaoNgay/baocaongaySlice";
import {
  CreateUser,
  resetUserFormState,
  updateUserProfile,
  setKhoaTaiChinhCurent,
  setKhoaLichTrucCurent,
  setNhanVienUserCurrent,
} from "./userSlice";
import ChonKhoaForm from "./ChonKhoaForm";
import ChonKhoaLichTrucForm from "./ChonKhoaLichTrucForm";
import { useTheme } from "@emotion/react";
import FAutocomplete from "components/form/FAutocomplete";
import SelectNhanVienForUserForm from "./UserThemeAble/SelectNhanVienForUserForm";

import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

// Icons
import SaveIcon from "@mui/icons-material/Save";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import EditIcon from "@mui/icons-material/Edit";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EmailIcon from "@mui/icons-material/Email";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HistoryIcon from "@mui/icons-material/History";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ComputerIcon from "@mui/icons-material/Computer";
import MedicalInformationIcon from "@mui/icons-material/MedicalInformation";
import ScheduleIcon from "@mui/icons-material/Schedule";

const yupSchema = Yup.object().shape({
  UserName: Yup.string().trim().required("Bắt buộc nhập tên đăng nhập"),
  PassWord: Yup.string().when("_isEditing", {
    is: false,
    then: (schema) =>
      schema
        .trim()
        .required("Bắt buộc nhập mật khẩu")
        .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
    otherwise: (schema) => schema.notRequired(),
  }),
  Email: Yup.string().nullable().email("Email không hợp lệ"),
  KhoaID: Yup.object()
    .nullable()
    .required("Bắt buộc chọn khoa")
    .test("has-id", "Bắt buộc chọn khoa", (value) => Boolean(value?._id)),
});

function UserInsertForm({ open, handleClose, handleSave, handleChange }) {
  const { khoas } = useSelector((state) => state.baocaongay);
  const {
    KhoaTaiChinhCurent,
    KhoaLichTrucCurent,
    userCurrent,
    NhanVienUserCurrent,
  } = useSelector((state) => state.user);
  const { nhanviens } = useSelector(
    (state) => state.nhanvien || { nhanviens: [] },
  );

  const dispatch = useDispatch();
  useEffect(() => {
    if (!khoas || khoas.length === 0) {
      dispatch(getKhoas());
    }
  }, [khoas, dispatch]);

  const [isEditing, setIsEditing] = useState(false);

  // State để lưu quyền Dashboard
  const [dashboardPermissions, setDashboardPermissions] = useState([]);

  // Cấu hình dashboard permissions
  const dashboardOptions = [
    {
      value: "BNNT",
      label: "Bệnh nhân ngoại tỉnh",
      icon: <LocalHospitalIcon />,
    },
    { value: "CSCL", label: "Chỉ số chất lượng", icon: <LocalHospitalIcon /> },
    { value: "ĐH", label: "Điều hành", icon: <BusinessCenterIcon /> },
    { value: "TC", label: "Tài chính", icon: <MonetizationOnIcon /> },
    {
      value: "TCKHOA",
      label: "Theo dõi theo khoa",
      icon: <MedicalInformationIcon />,
    },
    { value: "DVT", label: "Dược vật tư", icon: <MedicalInformationIcon /> },
    {
      value: "ĐT",
      label: "Đào tạo toàn viện",
      icon: <MedicalInformationIcon />,
    },
    {
      value: "ĐTKHOA",
      label: "Đào tạo theo khoa",
      icon: <MedicalInformationIcon />,
    },
    {
      value: "SOTHUTU",
      label: "Số thứ tự bệnh nhân",
      icon: <MedicalInformationIcon />,
    },
    {
      value: "BQBA",
      label: "Bình quân bệnh án",
      icon: <MedicalInformationIcon />,
    },
    {
      value: "DICHVUTRUNG",
      label: "Dịch vụ trùng",
      icon: <MedicalInformationIcon />,
    },
  ];

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const defaultFormValues = useMemo(
    () => ({
      UserName: "",
      PassWord: "",
      KhoaID: null,
      HoTen: "",
      Email: "",
      PhanQuyen: "nomal",
      UserHis: "",
      _isEditing: false,
    }),
    [],
  );

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: defaultFormValues,
  });

  const {
    handleSubmit,
    reset,
    // setValue removed (unused),
    formState: { isSubmitting },
  } = methods;

  const clearAuxiliaryState = () => {
    setDashboardPermissions([]);
    setValueQuyen("nomal");
    dispatch(resetUserFormState());
    reset(defaultFormValues);
  };

  const resetForm = () => {
    if (userCurrent && userCurrent._id && userCurrent._id !== 0) {
      reset({
        ...defaultFormValues,
        ...userCurrent,
        PassWord: "",
        _isEditing: true,
      });
      setValueQuyen(userCurrent.PhanQuyen || "nomal");
      setDashboardPermissions(
        Array.isArray(userCurrent.DashBoard) ? userCurrent.DashBoard : [],
      );
      dispatch(
        setKhoaTaiChinhCurent(
          Array.isArray(userCurrent.KhoaTaiChinh)
            ? userCurrent.KhoaTaiChinh
            : [],
        ),
      );
      dispatch(
        setKhoaLichTrucCurent(
          Array.isArray(userCurrent.KhoaLichTruc)
            ? userCurrent.KhoaLichTruc
            : [],
        ),
      );
      if (
        userCurrent.NhanVienID &&
        typeof userCurrent.NhanVienID === "object"
      ) {
        dispatch(setNhanVienUserCurrent(userCurrent.NhanVienID));
      }
      return;
    }

    clearAuxiliaryState();
  };

  // Hàm xử lý khi checkbox Dashboard thay đổi
  const handleDashboardPermissionChange = (permission) => {
    if (dashboardPermissions.includes(permission)) {
      setDashboardPermissions(
        dashboardPermissions.filter((p) => p !== permission),
      );
    } else {
      setDashboardPermissions([...dashboardPermissions, permission]);
    }
  };
  const handleCloseForm = () => {
    clearAuxiliaryState();
    handleClose();
  };

  const onSubmitData = async (data) => {
    const { _isEditing, ...formValues } = data;

    if (isEditing) {
      const userUpdate = {
        ...formValues,
        KhoaID: formValues.KhoaID._id,
        PhanQuyen: valueQuyen,
        KhoaTaiChinh: KhoaTaiChinhCurent,
        KhoaLichTruc: KhoaLichTrucCurent,
        UserId: userCurrent._id,
        NhanVienID: NhanVienUserCurrent?._id || null,
        DashBoard: dashboardPermissions, // Thêm quyền dashboard
      };
      const success = await dispatch(updateUserProfile(userUpdate));
      if (!success) return;
    } else {
      const userUpdate = {
        ...formValues,
        KhoaID: formValues.KhoaID._id,
        PhanQuyen: valueQuyen,
        KhoaTaiChinh: KhoaTaiChinhCurent,
        KhoaLichTruc: KhoaLichTrucCurent,
        NhanVienID: NhanVienUserCurrent?._id || null,
        DashBoard: dashboardPermissions, // Thêm quyền dashboard
      };
      const success = await dispatch(CreateUser(userUpdate));
      if (!success) return;
    }
    handleCloseForm();
  };
  useEffect(() => {
    if (!open) return;

    if (userCurrent && userCurrent._id && userCurrent._id !== 0) {
      setIsEditing(true);

      reset({
        ...defaultFormValues,
        ...userCurrent,
        PassWord: "",
        _isEditing: true,
      });
      setValueQuyen(userCurrent.PhanQuyen || "nomal");

      // Set quyền Dashboard
      if (userCurrent.DashBoard && Array.isArray(userCurrent.DashBoard)) {
        setDashboardPermissions(userCurrent.DashBoard);
      } else {
        setDashboardPermissions([]);
      }

      // Set KhoaTaiChinh và KhoaLichTruc từ dữ liệu user
      if (userCurrent.KhoaTaiChinh && Array.isArray(userCurrent.KhoaTaiChinh)) {
        dispatch(setKhoaTaiChinhCurent(userCurrent.KhoaTaiChinh));
      } else {
        dispatch(setKhoaTaiChinhCurent([]));
      }

      if (userCurrent.KhoaLichTruc && Array.isArray(userCurrent.KhoaLichTruc)) {
        dispatch(setKhoaLichTrucCurent(userCurrent.KhoaLichTruc));
      } else {
        dispatch(setKhoaLichTrucCurent([]));
      }

      // Nạp lại nhân viên liên kết hiện có (nếu có). userCurrent.NhanVienID phải là object có _id
      // Xử lý nhân viên liên kết:
      // Trường hợp backend trả object populate: { _id, Ten, ... }
      if (
        userCurrent.NhanVienID &&
        typeof userCurrent.NhanVienID === "object" &&
        userCurrent.NhanVienID._id
      ) {
        dispatch(setNhanVienUserCurrent(userCurrent.NhanVienID));
      }
      // Trường hợp chỉ trả về string ID -> cần tìm trong store hoặc load danh sách
      else if (
        userCurrent.NhanVienID &&
        typeof userCurrent.NhanVienID === "string"
      ) {
        // Nếu danh sách nhân viên chưa có -> load
        if (!nhanviens || nhanviens.length === 0) {
          dispatch(getAllNhanVien());
        } else {
          const emp = nhanviens.find((nv) => nv._id === userCurrent.NhanVienID);
          if (emp) {
            dispatch(setNhanVienUserCurrent(emp));
          } else {
            // Không tìm thấy -> giữ nguyên (có thể do paging / quyền), reset để user chọn lại
            dispatch(setNhanVienUserCurrent(null));
          }
        }
      } else {
        // Không có NhanVienID -> reset
        dispatch(setNhanVienUserCurrent(null));
      }
    } else {
      setIsEditing(false);
      setDashboardPermissions([]);
      setValueQuyen("nomal");

      reset(defaultFormValues);

      // Reset về mảng rỗng khi tạo mới
      dispatch(setKhoaTaiChinhCurent([]));
      dispatch(setKhoaLichTrucCurent([]));
      // Reset luôn nhân viên khi bắt đầu tạo mới
      dispatch(setNhanVienUserCurrent(null));
    }
  }, [defaultFormValues, dispatch, nhanviens, open, reset, userCurrent]);

  // Side-effect bổ sung: khi danh sách nhân viên vừa được load mà userCurrent có NhanVienID dạng string nhưng chưa map được trước đó.
  useEffect(() => {
    if (
      open &&
      userCurrent &&
      userCurrent._id &&
      userCurrent.NhanVienID &&
      typeof userCurrent.NhanVienID === "string" &&
      (!NhanVienUserCurrent || !NhanVienUserCurrent._id) &&
      nhanviens &&
      nhanviens.length > 0
    ) {
      const emp = nhanviens.find((nv) => nv._id === userCurrent.NhanVienID);
      if (emp) dispatch(setNhanVienUserCurrent(emp));
    }
  }, [userCurrent, NhanVienUserCurrent, nhanviens, dispatch, open]);

  const [valueQuyen, setValueQuyen] = useState("nomal");

  // Hàm để hiển thị nhãn quyền đẹp hơn
  const renderQuyenLabel = (quyen) => {
    const quyenConfig = {
      admin: {
        label: "Quản trị",
        color: "error",
        icon: <AdminPanelSettingsIcon fontSize="small" />,
      },
      manager: {
        label: "Quản lý",
        color: "warning",
        icon: <AssignmentIndIcon fontSize="small" />,
      },
      nomal: {
        label: "Người dùng thường",
        color: "primary",
        icon: <AccountCircleIcon fontSize="small" />,
      },
      daotao: {
        label: "Đào tạo",
        color: "info",
        icon: <MedicalServicesIcon fontSize="small" />,
      },
      noibo: {
        label: "Nội bộ",
        color: "success",
        icon: <VpnKeyIcon fontSize="small" />,
      },
      qlcl: {
        label: "Quản lý chất lượng",
        color: "secondary",
        icon: <VerifiedUserIcon fontSize="small" />,
      },
      cntt: {
        label: "Công nghệ thông tin",
        color: "default",
        icon: <ComputerIcon fontSize="small" />,
      },
    };

    const config = quyenConfig[quyen] || quyenConfig.nomal;
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseForm}
      aria-labelledby="form-dialog-title"
      sx={{
        "& .MuiDialog-paper": {
          width: "90vw",
          maxHeight: "90vh",
          borderRadius: 2,
          overflow: "auto",
        },
      }}
      maxWidth="lg"
    >
      <DialogTitle
        id="form-dialog-title"
        sx={{
          bgcolor: "#1939B7",
          color: "white",
          py: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isEditing ? <EditIcon /> : <PersonAddIcon />}
          <Typography variant="h6">
            {isEditing ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"}
          </Typography>
        </Box>
        <IconButton onClick={handleCloseForm} sx={{ color: "white" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 2, mt: 2 }}>
        <Card sx={{ p: 3, boxShadow: 2, borderRadius: 2 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={3}>
              {/* Thông tin người dùng */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px dashed #1939B7",
                  }}
                >
                  <AccountCircleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1939B7" }}
                  >
                    Thông tin người dùng
                  </Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <FAutocomplete
                      name="KhoaID"
                      options={khoas}
                      displayField="TenKhoa"
                      label="Chọn khoa"
                      loading={!khoas?.length}
                      loadingText="Đang tải danh sách khoa"
                      noOptionsText="Không có khoa phù hợp"
                      disabled={!khoas?.length}
                      required
                      sx={{ mb: 1 }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FTextField
                      name="UserName"
                      label="Tên đăng nhập"
                      placeholder="Nhập tên dùng để đăng nhập"
                      required
                      InputProps={{
                        startAdornment: (
                          <VpnKeyIcon color="primary" sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  {!isEditing && (
                    <Grid item xs={12} md={6}>
                      <FTextField
                        name="PassWord"
                        label="Mật khẩu"
                        placeholder="Ít nhất 6 ký tự"
                        type="password"
                        required
                        InputProps={{
                          startAdornment: (
                            <VpnKeyIcon color="primary" sx={{ mr: 1 }} />
                          ),
                        }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} md={6}>
                    <FTextField
                      name="HoTen"
                      label="Họ và tên"
                      placeholder="Nhập họ tên hiển thị"
                      InputProps={{
                        startAdornment: (
                          <AccountCircleIcon color="primary" sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FTextField
                      name="Email"
                      label="Email"
                      placeholder="email@benhvien.vn"
                      InputProps={{
                        startAdornment: (
                          <EmailIcon color="primary" sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FTextField
                      name="UserHis"
                      label="User HIS"
                      placeholder="Nhập tài khoản HIS nếu có"
                      InputProps={{
                        startAdornment: (
                          <HistoryIcon color="primary" sx={{ mr: 1 }} />
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <Autocomplete
                        options={[
                          "admin",
                          "nomal",
                          "manager",
                          "daotao",
                          "noibo",
                          "qlcl",
                          "cntt",
                        ]}
                        value={valueQuyen || "nomal"}
                        disableClearable
                        onChange={(event, newValue) => {
                          setValueQuyen(newValue || "nomal");
                        }}
                        renderOption={(props, option) => (
                          <li {...props}>{renderQuyenLabel(option)}</li>
                        )}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Phân quyền"
                            variant="outlined"
                            InputProps={{
                              ...params.InputProps,
                              startAdornment: (
                                <>
                                  <AdminPanelSettingsIcon
                                    color="primary"
                                    sx={{ mr: 1 }}
                                  />
                                  {params.InputProps.startAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                      />
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Quyền xem Dashboard */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px dashed #1939B7",
                  }}
                >
                  <DashboardIcon color="primary" sx={{ mr: 1 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1939B7" }}
                  >
                    Quyền xem Dashboard
                  </Typography>
                </Box>

                <Card
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: "#f8f9fa",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "text.secondary" }}
                  >
                    Chọn các Dashboard người dùng được quyền xem:
                  </Typography>

                  <Grid container spacing={2}>
                    {dashboardOptions.map((option) => (
                      <Grid item xs={6} sm={3} key={option.value}>
                        <Card
                          sx={{
                            p: 1.5,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            borderRadius: 2,
                            cursor: "pointer",
                            transition: "all 0.2s",
                            border: dashboardPermissions.includes(option.value)
                              ? "2px solid #1939B7"
                              : "1px solid #e0e0e0",
                            bgcolor: dashboardPermissions.includes(option.value)
                              ? "rgba(25, 57, 183, 0.05)"
                              : "white",
                            "&:hover": {
                              boxShadow: 2,
                              borderColor: "#1939B7",
                            },
                          }}
                          onClick={() =>
                            handleDashboardPermissionChange(option.value)
                          }
                        >
                          <Box
                            sx={{
                              color: dashboardPermissions.includes(option.value)
                                ? "#1939B7"
                                : "text.secondary",
                              mb: 1,
                            }}
                          >
                            {option.icon}
                          </Box>
                          <Typography
                            variant="body2"
                            align="center"
                            sx={{
                              fontWeight: dashboardPermissions.includes(
                                option.value,
                              )
                                ? 600
                                : 400,
                              color: dashboardPermissions.includes(option.value)
                                ? "#1939B7"
                                : "text.primary",
                            }}
                          >
                            {option.label}
                          </Typography>
                          <Checkbox
                            checked={dashboardPermissions.includes(
                              option.value,
                            )}
                            onChange={() =>
                              handleDashboardPermissionChange(option.value)
                            }
                            sx={{
                              p: 0.5,
                              mt: 0.5,
                              color: dashboardPermissions.includes(option.value)
                                ? "#1939B7"
                                : undefined,
                            }}
                          />
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  <Box
                    sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}
                  >
                    <Typography variant="subtitle2" sx={{ mr: 1 }}>
                      Quyền đã chọn:
                    </Typography>
                    {dashboardPermissions.length > 0 ? (
                      dashboardPermissions.map((permission) => {
                        const option = dashboardOptions.find(
                          (opt) => opt.value === permission,
                        );
                        return (
                          <Chip
                            key={permission}
                            label={option?.label || permission}
                            color="primary"
                            size="small"
                            icon={option?.icon}
                            onDelete={() =>
                              handleDashboardPermissionChange(permission)
                            }
                            sx={{ mb: 1 }}
                          />
                        );
                      })
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Chưa có quyền Dashboard nào được chọn
                      </Typography>
                    )}
                  </Box>
                </Card>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Thông tin nhân viên */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px dashed #1939B7",
                  }}
                >
                  <AssignmentIndIcon color="primary" sx={{ mr: 1 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1939B7" }}
                  >
                    Thông tin nhân viên
                  </Typography>
                </Box>

                <SelectNhanVienForUserForm />
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Phân quyền tài chính */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px dashed #1939B7",
                  }}
                >
                  <MonetizationOnIcon color="primary" sx={{ mr: 1 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#1939B7" }}
                  >
                    Phân quyền xem BC tài chính theo khoa
                  </Typography>
                </Box>

                <ChonKhoaForm KhoaTaiChinh={KhoaTaiChinhCurent} />

                <Box sx={{ mt: 3 }}>
                  <Card
                    sx={{
                      color: "#ffffff",
                      backgroundColor: "#1939B7",
                      p: 1.5,
                      boxShadow: 2,
                      borderRadius: "8px 8px 0 0",
                    }}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        fontSize: isSmallScreen ? "0.85rem" : "1rem",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <MonetizationOnIcon /> Phân quyền xem báo cáo tài chính
                      cho khoa khác
                    </Typography>
                  </Card>
                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: 2,
                      border: "1px solid #e0e0e0",
                      borderTop: "none",
                      borderRadius: "0 0 8px 8px",
                      mb: 3,
                      overflow: "hidden",
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                            Mã khoa
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Tên khoa
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {KhoaTaiChinhCurent && KhoaTaiChinhCurent.length > 0 ? (
                          KhoaTaiChinhCurent.map((row, index) => {
                            const khoa = khoas.find((k) => k.MaKhoa === row);
                            return (
                              <TableRow
                                key={index}
                                sx={{
                                  "&:nth-of-type(odd)": {
                                    backgroundColor: "#fafafa",
                                  },
                                }}
                              >
                                <TableCell sx={{ py: 1.5 }}>
                                  {khoa?.MaKhoa}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  {khoa?.TenKhoa}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              sx={{ textAlign: "center", py: 2 }}
                            >
                              Chưa có khoa nào được chọn
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>{" "}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Phân quyền lịch trực - Section mới */}
              <Box>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    mb: 2,
                    pb: 1,
                    borderBottom: "1px dashed #8E24AA",
                  }}
                >
                  <ScheduleIcon sx={{ color: "#8E24AA", mr: 1 }} />
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, color: "#8E24AA" }}
                  >
                    Phân quyền xem lịch trực theo khoa
                  </Typography>
                </Box>

                <ChonKhoaLichTrucForm KhoaLichTruc={KhoaLichTrucCurent} />

                <Box sx={{ mt: 3 }}>
                  <Card
                    sx={{
                      color: "#ffffff",
                      backgroundColor: "#8E24AA",
                      p: 1.5,
                      boxShadow: 2,
                      borderRadius: "8px 8px 0 0",
                    }}
                  >
                    <Typography
                      sx={{
                        textAlign: "center",
                        fontSize: isSmallScreen ? "0.85rem" : "1rem",
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 1,
                      }}
                    >
                      <ScheduleIcon /> Phân quyền xem lịch trực cho khoa khác
                    </Typography>
                  </Card>

                  <TableContainer
                    component={Paper}
                    sx={{
                      boxShadow: 2,
                      border: "1px solid #e0e0e0",
                      borderTop: "none",
                      borderRadius: "0 0 8px 8px",
                      mb: 3,
                      overflow: "hidden",
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                          <TableCell sx={{ fontWeight: "bold", width: "30%" }}>
                            Mã khoa
                          </TableCell>
                          <TableCell sx={{ fontWeight: "bold" }}>
                            Tên khoa
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {KhoaLichTrucCurent && KhoaLichTrucCurent.length > 0 ? (
                          KhoaLichTrucCurent.map((row, index) => {
                            const khoa = khoas.find((k) => k.MaKhoa === row);
                            return (
                              <TableRow
                                key={index}
                                sx={{
                                  "&:nth-of-type(odd)": {
                                    backgroundColor: "#fafafa",
                                  },
                                }}
                              >
                                <TableCell sx={{ py: 1.5 }}>
                                  {khoa?.MaKhoa}
                                </TableCell>
                                <TableCell sx={{ py: 1.5 }}>
                                  {khoa?.TenKhoa}
                                </TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={2}
                              sx={{ textAlign: "center", py: 2 }}
                            >
                              Chưa có khoa nào được chọn
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </Box>

              {/* Form Actions */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 2,
                  mt: 2,
                  pt: 2,
                  borderTop: "1px solid #e0e0e0",
                }}
              >
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={resetForm}
                  startIcon={<RefreshIcon />}
                >
                  Khôi phục
                </Button>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  loading={isSubmitting}
                  startIcon={<SaveIcon />}
                >
                  {isEditing ? "Lưu thay đổi" : "Tạo tài khoản"}
                </LoadingButton>
              </Box>
            </Stack>
          </FormProvider>
        </Card>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: "#f5f5f5" }}>
        <Button
          variant="outlined"
          onClick={handleCloseForm}
          color="error"
          startIcon={<CancelIcon />}
        >
          Hủy bỏ
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UserInsertForm;
