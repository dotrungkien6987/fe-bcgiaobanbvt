import React, { useState, useEffect } from "react";
import {
  Autocomplete,
  TextField,
  Stack,
  Card,
  Box,
  Typography,
  Chip,
  Paper,
  alpha,
  Skeleton,
  CircularProgress,
} from "@mui/material";

import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Link as RouterLink } from "react-router-dom";
import { CalendarTodayOutlined, BusinessOutlined, AssessmentOutlined } from "@mui/icons-material";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
import { getDataBCNgay, getKhoas } from "./baocaongaySlice";
import { getDataBCNgay_Rieng } from "./baocaongay_riengtheokhoaSlice";

import BCKhoaKhamBenh from "./BCKhoaKhamBenh";
import useAuth from "../../hooks/useAuth";

import BCGayMeHS from "./BCGayMeHS";
import BCXetNghiemHH from "./BCXetNghiemHH";
import BCXetNghiemHS from "./BCXetNghiemHS";
import BCXetNghiemVS from "./BCXetNghiemVS";
import BCChanDoanHA from "./BCChanDoanHA";
import BCThamDoCN from "./BCThamDoCN";
import BCHuyetHocTM from "./BCHuyetHocTM";
import BCTrungTamCLC from "./BCTrungTamCLC";
import BCNgayLamSangNoi from "./BCNgayLamSangNoi";
import BCNgayLamSangNgoai from "./BCNgayLamSangNgoai";
import BCKhoaCapCuu from "./BCKhoaCapCuu";
import BCPhongKhamYeuCau from "./BCPhongKhamYeuCau";

function ControllerDisplay() {
  const { user } = useAuth();
  const { khoas } = useSelector((state) => state.baocaongay);
  const [loading, setLoading] = useState(false);
  // const [date, setDate] = useState(new Date());
  //   const [date, setDate] = useState((new Date()));

  // Lấy thời gian hiện tại theo múi giờ của Việt Nam
const now = dayjs().tz("Asia/Ho_Chi_Minh");

// Kiểm tra xem giờ hiện tại có >= 18 hay không
const isAfter18 = now.hour() >= 18;

// Thiết lập giá trị mặc định cho date dựa trên giờ hiện tại
const defaultDate = isAfter18
  ? now.hour(7).minute(0).second(0).millisecond(0)
  : now.subtract(1, "day").hour(7).minute(0).second(0).millisecond(0);

const [date, setDate] = useState(defaultDate);

  const [selectedDepartment, setSelectedDepartment] = useState(user?.KhoaID?._id || "");
  const [loaikhoa, setLoaikhoa] = useState("");
  const [makhoa, setMakhoa] = useState("");

  const dispatch = useDispatch();
    useEffect(() => {
    setLoading(true);
    dispatch(getKhoas()).finally(() => setLoading(false));
  }, [dispatch]);
  useEffect(() => {
    //SetBaoCaoNgayInStore
    if (date && selectedDepartment) {
      const dateISO = date.toISOString();
      dispatch(getDataBCNgay(dateISO, selectedDepartment));
      dispatch(getDataBCNgay_Rieng(dateISO, selectedDepartment));
    }
  }, [date, selectedDepartment, dispatch]);useEffect(() => {
    // Set default department when khoas first loads
    if (khoas && khoas.length > 0 && !selectedDepartment) {
      const defaultDepartmentId = user?.KhoaID?._id;
      if (defaultDepartmentId) {
        setSelectedDepartment(defaultDepartmentId);
      }
    }
  }, [khoas, user?.KhoaID?._id, selectedDepartment]);

  useEffect(() => {
    // Update loaikhoa and makhoa when selectedDepartment changes
    if (khoas && khoas.length > 0 && selectedDepartment) {
      const loai_khoa = khoas.find(
        (khoa) => khoa._id === selectedDepartment
      )?.LoaiKhoa;
      const ma_khoa = khoas.find(
        (khoa) => khoa._id === selectedDepartment
      )?.MaKhoa;
  
      console.log("loaikhoa", loai_khoa);
      setLoaikhoa(loai_khoa);
      setMakhoa(ma_khoa);
    }
  }, [khoas, selectedDepartment]);

  const handleDateChange = (newDate) => {
    // Chuyển đổi về múi giờ VN, kiểm tra đầu vào
    console.log("Chay day khong");
    if (newDate instanceof Date) {
      newDate.setHours(7, 0, 0, 0);
      setDate(new Date(newDate));
    } else if (dayjs.isDayjs(newDate)) {
      console.log("newdate", newDate);
      const updatedDate = newDate.hour(7).minute(0).second(0).millisecond(0);
      console.log("updateDate", updatedDate);
      setDate(updatedDate);
    }
    
  };

  const handleSelectChange = (e) => {
    setSelectedDepartment(e.target.value);
    //setLoaikhoa de hien thi giao dien tuong ung
    const loai_khoa = khoas.find(
      (khoa) => khoa._id === e.target.value
    )?.LoaiKhoa;
    const ma_khoa = khoas.find(
      (khoa) => khoa._id === e.target.value
    )?.MaKhoa;

    console.log("loaikhoa", loai_khoa);
    setLoaikhoa(loai_khoa);
    setMakhoa(ma_khoa)
    
  };
  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 2 }}>
      {/* Header Section */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" component="h1" sx={{ mb: 1, fontWeight: 600 }}>
          <AssessmentOutlined sx={{ mr: 1, verticalAlign: 'middle' }} />
          Báo Cáo Ngày
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.9 }}>
          Theo dõi tình hình bệnh nhân các khoa theo ngày
        </Typography>
      </Paper>

      {/* Filter Controls */}
      <Card 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 500 }}>
          Bộ lọc báo cáo
        </Typography>
        
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={3}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          {/* Date Picker */}
          <Box sx={{ minWidth: { xs: '100%', sm: 250 } }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker 
                label="Ngày báo cáo" 
                value={date} 
                onChange={handleDateChange}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    variant: 'outlined',
                    InputProps: {
                      startAdornment: <CalendarTodayOutlined sx={{ mr: 1, color: 'action.active' }} />
                    }
                  }
                }}
              />
            </LocalizationProvider>
          </Box>          {/* Department Autocomplete */}
          <Box sx={{ minWidth: { xs: '100%', sm: 300 }, flex: 1 }}>
            <Autocomplete
              options={khoas || []}
              loading={loading}
              getOptionLabel={(option) => option.TenKhoa}
              value={khoas?.find(khoa => khoa._id === selectedDepartment) || null}
              onChange={(event, newValue) => {
                if (newValue) {
                  const e = { target: { value: newValue._id } };
                  handleSelectChange(e);
                }
              }}
              isOptionEqualToValue={(option, value) => option._id === value?._id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Chọn khoa"
                  variant="outlined"
                  fullWidth
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <>
                        <BusinessOutlined sx={{ mr: 1, color: 'action.active' }} />
                        {params.InputProps.startAdornment}
                      </>
                    ),
                    endAdornment: (
                      <>
                        {loading ? <CircularProgress color="inherit" size={20} /> : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} sx={{ p: 1.5 }}>
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {option.TenKhoa}
                    </Typography>
                    {option.MaKhoa && (
                      <Typography variant="caption" color="text.secondary">
                        Mã: {option.MaKhoa}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText="Không tìm thấy khoa nào"
              loadingText="Đang tải danh sách khoa..."
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}
            />
          </Box>

          {/* Report Link */}
          <Box sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}>
            <Chip
              label="Báo cáo toàn viện"
              component={RouterLink}
              to="/"
              clickable
              variant="outlined"
              color="primary"
              sx={{ 
                px: 2,
                py: 0.5,
                fontSize: '0.875rem',
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            />
          </Box>
        </Stack>
      </Card>      {/* Report Content */}
      <Card 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid',
          borderColor: 'divider'
        }}
      >
        {/* Report Header */}
        <Box sx={{ 
          p: 3, 
          borderBottom: '1px solid',
          borderColor: 'divider',
          backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.02)
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary' }}>
            Báo cáo chi tiết
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 0.5 }}>
            {khoas?.find(khoa => khoa._id === selectedDepartment)?.TenKhoa || 'Chưa chọn khoa'}
            {date && ` - ${dayjs(date).format('DD/MM/YYYY')}`}
          </Typography>
        </Box>        {/* Report Body */}
        <Box sx={{ p: 3, minHeight: 400 }}>
          {loading ? (
            // Loading skeleton
            <Stack spacing={2}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="rectangular" width="100%" height={120} />
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="rectangular" width="100%" height={80} />
              <Skeleton variant="text" width="80%" height={24} />
            </Stack>
          ) : (
            <>
              {(loaikhoa === "kkb") && <BCKhoaKhamBenh />}
              {(loaikhoa === "pkyc") && <BCPhongKhamYeuCau />}
              {(loaikhoa === "noi" && makhoa !== "KCC" && makhoa !== "CDHA") && <BCNgayLamSangNoi />}
              {(loaikhoa === "noi" && makhoa === "KCC") && <BCKhoaCapCuu />}
              {(loaikhoa === "ngoai" && makhoa !== "GMHS") && <BCNgayLamSangNgoai />}
              {(loaikhoa === "ngoai" && makhoa === "GMHS") && <BCGayMeHS />}
              {loaikhoa === "xnhh" && <BCXetNghiemHH />}
              {loaikhoa === "xnhs" && <BCXetNghiemHS />}
              {loaikhoa === "xnvs" && <BCXetNghiemVS />}
              {(loaikhoa === "noi" && makhoa === "CDHA") && <BCChanDoanHA />}
              {loaikhoa === "tdcn" && <BCThamDoCN />}
              {loaikhoa === "hhtm" && <BCHuyetHocTM />}
              {loaikhoa === "clc" && <BCTrungTamCLC />}
              
              {/* Empty state when no report type matches */}
              {!loaikhoa && (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 8,
                  color: 'text.secondary' 
                }}>
                  <AssessmentOutlined sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Chưa có dữ liệu báo cáo
                  </Typography>
                  <Typography variant="body2">
                    Vui lòng chọn khoa để xem báo cáo tương ứng
                  </Typography>
                </Box>
              )}
            </>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default ControllerDisplay;
