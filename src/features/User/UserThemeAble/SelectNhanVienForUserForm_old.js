import React, { forwardRef, useState, useEffect, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

// Material-UI
import {
  Box,
  Button,
  Dialog,
  Typography,
  Card,
  CardContent,
  Avatar,
  Chip,
  Alert,
  Slide,
  AppBar,
  Toolbar,
  useTheme,
} from "@mui/material";

// Icons
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonIcon from "@mui/icons-material/Person";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ClearIcon from "@mui/icons-material/Clear";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BusinessIcon from "@mui/icons-material/Business";
import BadgeIcon from "@mui/icons-material/Badge";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import CakeIcon from "@mui/icons-material/Cake";
import WorkIcon from "@mui/icons-material/Work";

// Project imports
import IconButton from "components/@extended/IconButton";
import { setNhanVienUserCurrent } from "../userSlice";
import SeLectNhanVienTable from "./SeLectNhanVienTable";

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

// Component hiển thị thông tin nhân viên đã chọn
const SelectedEmployeeCard = ({ employee, onRemove, onEdit }) => {
  const theme = useTheme();
  
  if (!employee || !employee._id) {
    return (
      <Card
        sx={{
          p: 2,
          border: "2px dashed #e0e0e0",
          bgcolor: "#fafafa",
          textAlign: "center",
        }}
      >
        <PersonIcon sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Chưa chọn nhân viên nào
        </Typography>
      </Card>
    );
  }

  const formatDate = (date) => {
    if (!date) return "Chưa có thông tin";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getGenderText = (gender) => {
    if (gender === 0) return "Nữ";
    if (gender === 1) return "Nam";
    return "Chưa xác định";
  };

  const getLoaiNhanVienText = (loai) => {
    const loaiMap = {
      0: "Bác sĩ",
      1: "Điều dưỡng",
      2: "Nhân viên khác",
    };
    return loaiMap[loai] || "Chưa xác định";
  };

  const getLoaiColor = (loai) => {
    const colorMap = {
      0: "error", // Bác sĩ - đỏ
      1: "primary", // Điều dưỡng - xanh dương
      2: "success", // Nhân viên khác - xanh lá
    };
    return colorMap[loai] || "default";
  };

  return (
    <Card
      sx={{
        border: `2px solid ${theme.palette.primary.main}`,
        bgcolor: "rgba(25, 57, 183, 0.02)",
        position: "relative",
        overflow: "visible",
      }}
    >
      {/* Badge trạng thái đã chọn */}
      <Box
        sx={{
          position: "absolute",
          top: -10,
          right: -10,
          zIndex: 1,
        }}
      >
        <Chip
          icon={<CheckCircleIcon />}
          label="Đã chọn"
          color="primary"
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
          {/* Avatar */}
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: theme.palette.primary.main,
              fontSize: "1.5rem",
              fontWeight: 600,
            }}
          >
            {employee.Ten?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>

          {/* Thông tin chính */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 1,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: theme.palette.primary.main,
                  wordBreak: "break-word",
                }}
              >
                {employee.Ten}
              </Typography>

              {/* Nút hành động */}
              <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                <IconButton
                  size="small"
                  color="primary"
                  onClick={onEdit}
                  title="Chọn nhân viên khác"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={onRemove}
                  title="Bỏ chọn nhân viên"
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Thông tin chi tiết */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <BadgeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Mã NV:</strong> {employee.MaNhanVien}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WorkIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Loại:</strong>
                </Typography>
                <Chip
                  label={getLoaiNhanVienText(employee.Loai)}
                  color={getLoaiColor(employee.Loai)}
                  size="small"
                  variant="outlined"
                />
              </Box>

              {employee.ChucDanh && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <BusinessIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    <strong>Chức danh:</strong> {employee.ChucDanh}
                  </Typography>
                </Box>
              )}

              {employee.ChucVu && (
                <Typography variant="body2">
                  <strong>Chức vụ:</strong> {employee.ChucVu}
                </Typography>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CakeIcon fontSize="small" color="action" />
                <Typography variant="body2">
                  <strong>Ngày sinh:</strong> {formatDate(employee.NgaySinh)} -{" "}
                  {getGenderText(employee.GioiTinh)}
                </Typography>
              </Box>

              {employee.Email && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EmailIcon fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
                    {employee.Email}
                  </Typography>
                </Box>
              )}

              {employee.SoDienThoai && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{employee.SoDienThoai}</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Component chính
export default function SelectNhanVienForUserForm() {
  const dispatch = useDispatch();
  const theme = useTheme();

  // State
  const [open, setOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Refs để tránh dependency issues
  const isFirstMount = useRef(true);
  const selectedEmployeeRef = useRef(null);
  const isLoadingRef = useRef(false);

  // Cập nhật refs khi state thay đổi
  useEffect(() => {
    selectedEmployeeRef.current = selectedEmployee;
  }, [selectedEmployee]);

  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Redux state
  const { NhanVienUserCurrent } = useSelector((state) => state.user);

  // Sync với Redux state
  useEffect(() => {
    if (NhanVienUserCurrent && NhanVienUserCurrent._id) {
      setSelectedEmployee(NhanVienUserCurrent);
    } else {
      setSelectedEmployee(null);
    }
  }, [NhanVienUserCurrent]);

  // Handlers
  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRemoveEmployee = () => {
    setSelectedEmployee(null);
    dispatch(setNhanVienUserCurrent(null));
  };

  const handleSelectedRowsChange = useCallback((rows) => {
    // Bỏ qua lần đầu tiên component mount
    if (isFirstMount.current) {
      isFirstMount.current = false;
      if (!rows || rows.length === 0) {
        return; // Không làm gì nếu lần đầu không có selection
      }
    }
    
    // Tránh xử lý khi đang load
    if (isLoadingRef.current) {
      return;
    }
    
    // Nếu không có rows được chọn, không làm gì
    if (!rows || rows.length === 0) {
      return;
    }
    
    // Chỉ lấy nhân viên đầu tiên vì chỉ cho phép chọn 1
    const firstEmployee = Array.isArray(rows) ? rows[0] : rows;
    
    // Chỉ xử lý nếu là nhân viên khác với nhân viên hiện tại
    if (firstEmployee && firstEmployee._id && 
        (!selectedEmployeeRef.current || selectedEmployeeRef.current._id !== firstEmployee._id)) {
      console.log("Selecting employee:", firstEmployee.Ten);
      
      // Gọi handleSelectEmployee trực tiếp thay vì qua useCallback
      if (!firstEmployee || !firstEmployee._id) {
        return;
      }

      setIsLoading(true);
      
      try {
        setSelectedEmployee(firstEmployee);
        dispatch(setNhanVienUserCurrent(firstEmployee));
        setOpen(false);
      } catch (error) {
        console.error("Error selecting employee:", error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [dispatch]); // Chỉ phụ thuộc vào dispatch

  return (
    <Box>
      {/* Hiển thị nhân viên đã chọn hoặc nút chọn */}
      <Box sx={{ mb: 2 }}>
        <Typography
          variant="subtitle2"
          sx={{ mb: 1, fontWeight: 600, color: "text.secondary" }}
        >
          Nhân viên được liên kết:
        </Typography>

        {selectedEmployee && selectedEmployee._id ? (
          <SelectedEmployeeCard
            employee={selectedEmployee}
            onRemove={handleRemoveEmployee}
            onEdit={handleClickOpen}
          />
        ) : (
          <Card
            sx={{
              p: 3,
              border: "2px dashed #e0e0e0",
              bgcolor: "#fafafa",
              textAlign: "center",
              cursor: "pointer",
              transition: "all 0.2s",
              "&:hover": {
                borderColor: theme.palette.primary.main,
                bgcolor: "rgba(25, 57, 183, 0.02)",
              },
            }}
            onClick={handleClickOpen}
          >
            <PersonAddIcon
              sx={{ fontSize: 48, color: "text.secondary", mb: 1 }}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Chưa chọn nhân viên
            </Typography>
            <Button
              variant="contained"
              startIcon={<PersonAddIcon />}
              onClick={handleClickOpen}
              size="small"
            >
              Chọn nhân viên
            </Button>
          </Card>
        )}
      </Box>

      {/* Dialog chọn nhân viên */}
      <Dialog
        fullScreen
        open={open}
        onClose={handleClose}
        TransitionComponent={Transition}
        sx={{
          "& .MuiDialog-paper": {
            bgcolor: "#f5f5f5",
          },
        }}
      >
        <AppBar sx={{ position: "relative", boxShadow: 3 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Chọn nhân viên liên kết
            </Typography>
            {selectedEmployee && (
              <Chip
                icon={<CheckCircleIcon />}
                label={`Đã chọn: ${selectedEmployee.Ten}`}
                color="secondary"
                sx={{ mr: 1, maxWidth: 200 }}
              />
            )}
            <Button
              color="inherit"
              variant="outlined"
              onClick={handleClose}
              disabled={isLoading}
              sx={{
                bgcolor: "rgba(255,255,255,0.1)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.2)" },
              }}
            >
              Đóng
            </Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ p: 2, height: "100%", overflow: "auto" }}>
          {/* Hướng dẫn */}
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            icon={<PersonIcon />}
          >
            <Typography variant="body2">
              <strong>Hướng dẫn:</strong> Chọn 1 nhân viên từ danh sách bên dưới để liên kết với tài khoản người dùng. 
              Nhân viên đã chọn sẽ được tự động cập nhật.
            </Typography>
          </Alert>

          {/* Bảng chọn nhân viên */}
          <Card sx={{ boxShadow: 2 }}>
            <SeLectNhanVienTable
              onSelectedRowsChange={handleSelectedRowsChange}
            />
          </Card>
        </Box>
      </Dialog>
    </Box>
  );
}
