import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useHoatDongBenhVien } from "../HoatDongBenhVienProvider";
import { DEPARTMENT_TYPES, DISPLAY_MODES } from "../constants";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSoThuTuPhongLayMau,
  getAllSoThuTuStats,
} from "../../Slice/soThuTuSlice";
import { selectKhoas } from "../../Slice/lichtrucSlice";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import NoteIcon from "@mui/icons-material/Note";
import BiotechIcon from "@mui/icons-material/Biotech";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ScienceIcon from "@mui/icons-material/Science";
import RefreshIcon from "@mui/icons-material/Refresh";
import LayMauTable from "./LayMauTable";

const LayMauSchedule = ({ isCompactView }) => {
  const dispatch = useDispatch();
  const {
    getDepartmentsByType,
    schedules,
    visibleTypes,
    loadingSoThuTu,
    selectedDate,
    searchTerm,
    displayMode,
  } = useHoatDongBenhVien();
  const phongLayMauData = useSelector(selectSoThuTuPhongLayMau);
  const khoasFromRedux = useSelector(selectKhoas);
  const [refreshing, setRefreshing] = useState({});

  // Hàm xử lý định dạng ngày để gọi API
  const formatDateForAPI = (date) => {
    if (!date) return null;

    // Chuyển ngày sang múi giờ Việt Nam (UTC+7)
    const vietnamDate = new Date(date);

    // Format thành chuỗi YYYY-MM-DD
    const year = vietnamDate.getFullYear();
    const month = String(vietnamDate.getMonth() + 1).padStart(2, "0");
    const day = String(vietnamDate.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Hàm refresh dữ liệu số thứ tự cho một phòng cụ thể
  const refreshDepartmentData = (departmentId) => {
    // Đánh dấu phòng đang refresh
    setRefreshing((prev) => ({ ...prev, [departmentId]: true }));

    // Xác định danh sách phòng cần refresh
    const currentKhoa = khoasFromRedux.find((k) => k._id === departmentId);
    const departmentIds =
      currentKhoa && currentKhoa.HisDepartmentID
        ? [currentKhoa.HisDepartmentID]
        : [];

    if (departmentIds.length > 0) {
      const formattedDate = formatDateForAPI(selectedDate);

      dispatch(getAllSoThuTuStats(formattedDate, departmentIds)).finally(() => {
        // Đánh dấu đã hoàn thành refresh
        setTimeout(() => {
          setRefreshing((prev) => ({ ...prev, [departmentId]: false }));
        }, 1000); // Hiển thị icon loading ít nhất 1 giây
      });
    } else {
      // Nếu không tìm thấy HisDepartmentID
      setRefreshing((prev) => ({ ...prev, [departmentId]: false }));
    }
  };

  const layMauDepartments = visibleTypes.includes(DEPARTMENT_TYPES.LAY_MAU)
    ? getDepartmentsByType(DEPARTMENT_TYPES.LAY_MAU)
    : [];

  if (layMauDepartments.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body1">
            Không có dữ liệu phòng lấy mẫu
          </Typography>
        </Paper>
      </Grid>
    );
  }

  if (displayMode === DISPLAY_MODES.TABLE) {
    return (
      <Grid item xs={12}>
        <LayMauTable
          layMauDepartments={layMauDepartments}
          schedules={schedules}
          searchTerm={searchTerm}
          loadingSoThuTu={loadingSoThuTu}
          refreshing={refreshing}
          onRefreshDepartment={refreshDepartmentData}
        />
      </Grid>
    );
  }

  return layMauDepartments.map((department) => {
    const schedule = schedules[department.maKhoa] || {
      dieuDuong: "",
      bacSi: "",
      ghiChu: "Không có thông tin",
    };

    // Xử lý chuỗi điều dưỡng và bác sĩ nếu có
    const dieuDuongArray = schedule.dieuDuong
      ? schedule.dieuDuong.split(",").map((item) => item.trim())
      : [];
    const bacSiArray = schedule.bacSi
      ? schedule.bacSi.split(",").map((item) => item.trim())
      : [];

    const color = "#9c27b0"; // Màu tím cho phòng lấy mẫu
    const isDepartmentRefreshing = refreshing[department.id] || false;

    return (
      <Grid
        item
        xs={12}
        md={isCompactView ? 6 : 12}
        lg={isCompactView ? 4 : 12}
        key={department.id}
      >
        <Paper
          elevation={2}
          sx={{
            p: 2,
            height: "100%",
            borderTop: `4px solid ${color}`,
            display: "flex",
            flexDirection: "column",
            position: "relative",
          }}
        >
          {(loadingSoThuTu || isDepartmentRefreshing) && (
            <Box
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                display: "flex",
                alignItems: "center",
              }}
            >
              <CircularProgress size={16} />
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              {department.ten}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Chip
                icon={<BiotechIcon fontSize="small" />}
                label="Lấy mẫu"
                size="small"
                sx={{
                  bgcolor: `${color}20`,
                  color: color,
                  borderColor: color,
                  fontWeight: "medium",
                  mr: 1,
                }}
                variant="outlined"
              />
              <Tooltip title="Làm mới dữ liệu" placement="top">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => refreshDepartmentData(department.id)}
                  disabled={isDepartmentRefreshing || loadingSoThuTu}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ my: 1 }} />

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <PersonIcon sx={{ mr: 1, color: color }} fontSize="small" />
            <Typography variant="body2" component="span" fontWeight="medium">
              Điều dưỡng:
            </Typography>
          </Box>
          <Box sx={{ pl: 4, mb: 1.5 }}>
            {dieuDuongArray.length > 0 ? (
              dieuDuongArray.map((nurse, index) => (
                <Typography key={index} variant="body2">
                  • {nurse}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa phân công
              </Typography>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <MedicationIcon sx={{ mr: 1, color: color }} fontSize="small" />
            <Typography variant="body2" component="span" fontWeight="medium">
              Bác sĩ:
            </Typography>
          </Box>
          <Box sx={{ pl: 4, mb: 1.5 }}>
            {bacSiArray.length > 0 ? (
              bacSiArray.map((doctor, index) => (
                <Typography key={index} variant="body2">
                  • {doctor}
                </Typography>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">
                Chưa phân công
              </Typography>
            )}
          </Box>

          {/* Thông tin thống kê lấy mẫu */}
          {phongLayMauData &&
            phongLayMauData.length > 0 &&
            (() => {
              // Tìm khoa hiện tại trong danh sách khoa từ redux
              const currentKhoa = khoasFromRedux.find(
                (k) => k._id === department.id
              );

              // Tìm dữ liệu số thứ tự cho phòng lấy mẫu hiện tại
              const soThuTuData =
                currentKhoa && currentKhoa.HisDepartmentID
                  ? phongLayMauData.find(
                      (item) =>
                        item.departmentid &&
                        item.departmentid.toString() ===
                          currentKhoa.HisDepartmentID.toString()
                    )
                  : null;

              if (soThuTuData) {
                const lastUpdated = soThuTuData.lastupdated
                  ? new Date(soThuTuData.lastupdated)
                  : null;
                const formattedLastUpdated = lastUpdated
                  ? `${lastUpdated
                      .getHours()
                      .toString()
                      .padStart(2, "0")}:${lastUpdated
                      .getMinutes()
                      .toString()
                      .padStart(2, "0")}`
                  : "N/A";

                return (
                  <>
                    <Divider sx={{ my: 1.5 }} />
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1.5,
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Typography
                          variant="subtitle2"
                          color="primary"
                          fontWeight="medium"
                        >
                          Thống kê lấy mẫu
                        </Typography>
                        <Tooltip title="Cập nhật lần cuối" placement="top">
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            ({formattedLastUpdated})
                          </Typography>
                        </Tooltip>
                      </Box>
                      <Chip
                        label={`STT: ${
                          soThuTuData.latest_sothutunumber_da_lay_mau || "N/A"
                        }`}
                        color="primary"
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: "bold" }}
                      />
                    </Box>

                    {/* Stats Cards - Thông tin tổng quan */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Thống kê tổng quan:
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 1.5 }}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(156, 39, 176, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Tổng mẫu cần lấy
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <ScienceIcon
                                fontSize="small"
                                sx={{ mr: 0.5, color: color }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ color: color }}
                              >
                                {soThuTuData.tong_mau_benh_pham || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(156, 39, 176, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              Tổng bệnh nhân
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <PeopleAltIcon
                                fontSize="small"
                                sx={{ mr: 0.5, color: color }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{ color: color }}
                              >
                                {soThuTuData.tong_benh_nhan || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Stats Cards - Trạng thái lấy mẫu */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Trạng thái lấy mẫu:
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 1.5 }}>
                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(255, 152, 0, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              Chưa lấy mẫu
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <HourglassEmptyIcon
                                fontSize="small"
                                color="warning"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="warning.main"
                              >
                                {soThuTuData.so_ca_chua_lay_mau || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(76, 175, 80, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              Đã lấy mẫu
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CheckCircleIcon
                                fontSize="small"
                                color="success"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="success.main"
                              >
                                {soThuTuData.so_ca_da_lay_mau || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(255, 152, 0, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              BN chưa lấy mẫu
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <PersonIcon
                                fontSize="small"
                                color="warning"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="warning.main"
                              >
                                {soThuTuData.so_benh_nhan_chua_lay_mau || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={6}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(76, 175, 80, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              BN đã lấy mẫu
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <PersonIcon
                                fontSize="small"
                                color="success"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="success.main"
                              >
                                {soThuTuData.so_benh_nhan_da_lay_mau || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* Stats Cards - Trạng thái xử lý */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Trạng thái xử lý:
                      </Typography>
                      <Grid container spacing={1} sx={{ mb: 1.5 }}>
                        <Grid item xs={4}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(255, 152, 0, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              Chưa thực hiện
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <HourglassEmptyIcon
                                fontSize="small"
                                color="warning"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="warning.main"
                              >
                                {soThuTuData.so_ca_chua_thuc_hien || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={4}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(33, 150, 243, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              Chờ kết quả
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <ArrowForwardIcon
                                fontSize="small"
                                color="info"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="info.main"
                              >
                                {soThuTuData.so_ca_da_thuc_hien_cho_ket_qua ||
                                  0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={4}>
                          <Box
                            sx={{
                              p: 1,
                              border: "1px solid rgba(0, 0, 0, 0.12)",
                              borderRadius: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              bgcolor: "rgba(76, 175, 80, 0.05)",
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                            >
                              Đã trả kết quả
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <CheckCircleIcon
                                fontSize="small"
                                color="success"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="h6"
                                fontWeight="bold"
                                color="success.main"
                              >
                                {soThuTuData.so_ca_da_tra_ket_qua || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>

                    {/* STT Information Panel */}
                    <Box sx={{ mb: 1.5 }}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Thông tin số thứ tự:
                      </Typography>
                      <Box
                        sx={{
                          p: 1.5,
                          border: `1px solid ${color}40`,
                          borderRadius: 1,
                          bgcolor: `${color}10`,
                          mb: 1.5,
                        }}
                      >
                        <Grid container spacing={1}>
                          <Grid item xs={6}>
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                STT lớn nhất:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ color }}
                              >
                                {soThuTuData.max_sothutunumber || "N/A"}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={6}>
                            <Box
                              sx={{ display: "flex", flexDirection: "column" }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                STT lớn nhất đã lấy mẫu:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                color="info.main"
                              >
                                {soThuTuData.max_sothutunumber_da_lay_mau ||
                                  "N/A"}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={6}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                STT gần nhất lấy mẫu:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                color="success.main"
                              >
                                {soThuTuData.latest_sothutunumber_da_lay_mau ||
                                  "N/A"}
                              </Typography>
                            </Box>
                          </Grid>

                          <Grid item xs={6}>
                            <Box
                              sx={{
                                display: "flex",
                                flexDirection: "column",
                                mt: 1,
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                STT dự kiến tiếp theo:
                              </Typography>
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                sx={{ color }}
                              >
                                {soThuTuData.sothutunumber_du_kien_tiep_theo ||
                                  "N/A"}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Box>
                    </Box>

                    {/* Next Number Highlight */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mb: 1,
                      }}
                    >
                      <Chip
                        icon={<AccessTimeIcon />}
                        label={`Lấy mẫu tiếp theo: ${
                          soThuTuData.sothutunumber_du_kien_tiep_theo || "N/A"
                        }`}
                        size="medium"
                        variant={
                          soThuTuData.sothutunumber_du_kien_tiep_theo
                            ? "default"
                            : "outlined"
                        }
                        sx={{
                          fontWeight: "bold",
                          py: 1,
                          fontSize: "1rem",
                          color,
                          bgcolor: `${color}10`,
                          borderColor: color,
                        }}
                      />
                    </Box>
                  </>
                );
              }
              return null;
            })()}

          {schedule.ghiChu && (
            <Box
              sx={{
                mt: "auto",
                pt: 1,
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <NoteIcon
                color="action"
                fontSize="small"
                sx={{ mr: 1, mt: 0.3 }}
              />
              <Typography variant="body2" color="text.secondary">
                {schedule.ghiChu}
              </Typography>
            </Box>
          )}
        </Paper>
      </Grid>
    );
  });
};

export default LayMauSchedule;
