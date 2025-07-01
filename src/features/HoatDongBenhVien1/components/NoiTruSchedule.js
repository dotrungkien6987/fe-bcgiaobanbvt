import React, { useState } from "react";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Divider,
  Tooltip,
  Chip,
  CircularProgress,
  IconButton,
} from "@mui/material";
import { useHoatDongBenhVien } from "../HoatDongBenhVienProvider";
import { DEPARTMENT_TYPES, DISPLAY_MODES } from "../constants";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSoThuTuPhongNoiTru,
  getSoThuTuPhongNoiTru,
} from "../../Slice/soThuTuSlice";
import { selectKhoas } from "../../Slice/lichtrucSlice";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";
import NoteIcon from "@mui/icons-material/Note";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import HealingIcon from "@mui/icons-material/Healing";
import TransferWithinAStationIcon from "@mui/icons-material/TransferWithinAStation";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import RefreshIcon from "@mui/icons-material/Refresh";
import HighlightText from "./HighlightText";
import NoiTruTable from "./NoiTruTable";

const NoiTruSchedule = ({ isCompactView }) => {
  const dispatch = useDispatch();
  const {
    getDepartmentsByType,
    schedules,
    loadingSoThuTu,
    selectedDate,
    searchTerm,
    displayMode,
  } = useHoatDongBenhVien();
  const phongNoiTruData = useSelector(selectSoThuTuPhongNoiTru);
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

      dispatch(getSoThuTuPhongNoiTru(formattedDate, departmentIds)).finally(
        () => {
          // Đánh dấu đã hoàn thành refresh
          setTimeout(() => {
            setRefreshing((prev) => ({ ...prev, [departmentId]: false }));
          }, 1000); // Hiển thị icon loading ít nhất 1 giây
        }
      );
    } else {
      // Nếu không tìm thấy HisDepartmentID
      setRefreshing((prev) => ({ ...prev, [departmentId]: false }));
    }
  };

  const noiTruDepartments = getDepartmentsByType(DEPARTMENT_TYPES.NOI_TRU);

  if (noiTruDepartments.length === 0) {
    return (
      <Grid item xs={12}>
        <Paper sx={{ p: 2, textAlign: "center" }}>
          <Typography variant="body1">Không có dữ liệu khoa nội trú</Typography>
        </Paper>
      </Grid>
    );
  }

  // Render Table View
  if (displayMode === DISPLAY_MODES.TABLE) {
    return (
      <Grid item xs={12}>
        <NoiTruTable
          noiTruDepartments={noiTruDepartments}
          schedules={schedules}
          searchTerm={searchTerm}
          loadingSoThuTu={loadingSoThuTu}
          refreshing={refreshing}
          onRefreshDepartment={refreshDepartmentData}
        />
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {noiTruDepartments.map((department) => {
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

        // Tìm khoa hiện tại trong danh sách khoa từ redux
        const currentKhoa = khoasFromRedux.find((k) => k._id === department.id);

        // Tìm dữ liệu cho phòng nội trú hiện tại
        const noiTruData =
          currentKhoa && currentKhoa.HisDepartmentID
            ? phongNoiTruData.find(
                (item) =>
                  item.departmentid &&
                  item.departmentid.toString() ===
                    currentKhoa.HisDepartmentID.toString()
              )
            : null;

        if (displayMode === DISPLAY_MODES.TABLE) {
          return (
            <NoiTruTable
              key={department.id}
              department={department}
              schedule={schedule}
              dieuDuongArray={dieuDuongArray}
              bacSiArray={bacSiArray}
              noiTruData={noiTruData}
              refreshing={refreshing}
              loadingSoThuTu={loadingSoThuTu}
              selectedDate={selectedDate}
              searchTerm={searchTerm}
              refreshDepartmentData={refreshDepartmentData}
            />
          );
        }

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
                borderTop: "4px solid #1976d2",
                display: "flex",
                flexDirection: "column",
                position: "relative",
              }}
            >
              {/* Loading indicator */}
              {(loadingSoThuTu || refreshing[department.id]) && (
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

              {/* Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="subtitle1" fontWeight="bold">
                  <HighlightText
                    text={department.ten}
                    searchTerm={searchTerm}
                  />
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <Chip
                    icon={<LocalHospitalIcon fontSize="small" />}
                    label="Nội trú"
                    size="small"
                    sx={{
                      bgcolor: "rgba(25, 118, 210, 0.1)",
                      color: "#1976d2",
                      borderColor: "#1976d2",
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
                      disabled={refreshing[department.id] || loadingSoThuTu}
                    >
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              <Divider sx={{ my: 1 }} />

              {/* Staff Information */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <PersonIcon color="primary" fontSize="small" sx={{ mr: 1 }} />
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight="medium"
                >
                  Điều dưỡng:
                </Typography>
              </Box>

              <Box sx={{ pl: 4, mb: 1.5 }}>
                {dieuDuongArray.length > 0 ? (
                  dieuDuongArray.map((nurse, index) => (
                    <Typography key={index} variant="body2">
                      • <HighlightText text={nurse} searchTerm={searchTerm} />
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa phân công
                  </Typography>
                )}
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                <MedicationIcon
                  color="primary"
                  fontSize="small"
                  sx={{ mr: 1 }}
                />
                <Typography
                  variant="body2"
                  component="span"
                  fontWeight="medium"
                >
                  Bác sĩ:
                </Typography>
              </Box>

              <Box sx={{ pl: 4, mb: 1.5 }}>
                {bacSiArray.length > 0 ? (
                  bacSiArray.map((doctor, index) => (
                    <Typography key={index} variant="body2">
                      • <HighlightText text={doctor} searchTerm={searchTerm} />
                    </Typography>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Chưa phân công
                  </Typography>
                )}
              </Box>

              {/* Thông tin bệnh nhân nội trú */}
              {noiTruData && (
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
                        Thống kê bệnh nhân nội trú
                      </Typography>
                      {noiTruData.lastupdated && (
                        <Tooltip title="Cập nhật lần cuối" placement="top">
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ ml: 1 }}
                          >
                            (
                            {new Date(noiTruData.lastupdated)
                              .getHours()
                              .toString()
                              .padStart(2, "0")}
                            :
                            {new Date(noiTruData.lastupdated)
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}
                            )
                          </Typography>
                        </Tooltip>
                      )}
                    </Box>
                    <Chip
                      label={`Tổng BN: ${noiTruData.total_count || 0}`}
                      color="primary"
                      size="small"
                      variant="outlined"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>

                  {/* Stats Cards - Phân loại bệnh nhân */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Phân loại bệnh nhân:
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
                            bgcolor: "rgba(76, 175, 80, 0.05)",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            BHYT
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="success.main"
                          >
                            {noiTruData.bhyt_count || 0}
                          </Typography>
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
                            bgcolor: "rgba(255, 152, 0, 0.05)",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Viện phí
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="warning.main"
                          >
                            {noiTruData.vienphi_count || 0}
                          </Typography>
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
                          <Typography variant="caption" color="text.secondary">
                            Dịch vụ
                          </Typography>
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            color="info.main"
                          >
                            {noiTruData.yeucau_count || 0}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Stats Cards - Trạng thái điều trị */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Trạng thái điều trị:
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
                            bgcolor: "rgba(25, 118, 210, 0.05)",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Đang điều trị
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <HealingIcon
                              fontSize="small"
                              color="primary"
                              sx={{ mr: 0.5 }}
                            />
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="primary.main"
                            >
                              {noiTruData.dang_dieu_tri || 0}
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
                          <Typography variant="caption" color="text.secondary">
                            Điều trị kết hợp
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <SwapHorizIcon
                              fontSize="small"
                              color="secondary"
                              sx={{ mr: 0.5 }}
                            />
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="secondary.main"
                            >
                              {noiTruData.dieu_tri_ket_hop || 0}
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
                            bgcolor: "rgba(255, 193, 7, 0.05)",
                          }}
                        >
                          <Typography variant="caption" color="text.secondary">
                            Đợi nhập khoa
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <HourglassEmptyIcon
                              fontSize="small"
                              sx={{ mr: 0.5, color: "#ed6c02" }}
                            />
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              sx={{ color: "#ed6c02" }}
                            >
                              {noiTruData.doi_nhap_khoa || 0}
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
                          <Typography variant="caption" color="text.secondary">
                            Đã ra viện
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ExitToAppIcon
                              fontSize="small"
                              color="success"
                              sx={{ mr: 0.5 }}
                            />
                            <Typography
                              variant="h6"
                              fontWeight="bold"
                              color="success.main"
                            >
                              {noiTruData.benh_nhan_ra_vien || 0}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Transfer Information Panel */}
                  <Box sx={{ mb: 1.5 }}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      gutterBottom
                    >
                      Luân chuyển bệnh nhân:
                    </Typography>
                    <Box
                      sx={{
                        p: 1.5,
                        border: "1px solid rgba(25, 118, 210, 0.2)",
                        borderRadius: 1,
                        bgcolor: "rgba(25, 118, 210, 0.05)",
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
                              Chuyển khoa đến:
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <TransferWithinAStationIcon
                                fontSize="small"
                                color="info"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                color="info.main"
                              >
                                {noiTruData.chuyen_khoa_den || 0}
                              </Typography>
                            </Box>
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
                              Chuyển khoa đi:
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <TransferWithinAStationIcon
                                fontSize="small"
                                color="warning"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                color="warning.main"
                              >
                                {noiTruData.benh_nhan_chuyen_khoa || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>

                        <Grid item xs={12}>
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
                              Chuyển điều trị kết hợp đến:
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                              <SwapHorizIcon
                                fontSize="small"
                                color="secondary"
                                sx={{ mr: 0.5 }}
                              />
                              <Typography
                                variant="body1"
                                fontWeight="bold"
                                color="secondary.main"
                              >
                                {noiTruData.chuyen_dieu_tri_ket_hop_den || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>

                  {/* Summary Highlight */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 1,
                    }}
                  >
                    <Chip
                      icon={<PeopleAltIcon />}
                      label={`Tổng số BN: ${
                        noiTruData.total_count || 0
                      } | Đang điều trị: ${noiTruData.dang_dieu_tri || 0}`}
                      color="primary"
                      size="medium"
                      variant="default"
                      sx={{
                        fontWeight: "bold",
                        py: 1,
                        fontSize: "0.9rem",
                      }}
                    />
                  </Box>
                </>
              )}

              {/* Notes */}
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
      })}
    </Grid>
  );
};

export default NoiTruSchedule;
