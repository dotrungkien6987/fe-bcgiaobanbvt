import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { useSelector } from "react-redux";
import { selectSoThuTuPhongNoiTru } from "../../Slice/soThuTuSlice";
import { selectKhoas } from "../../Slice/lichtrucSlice";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HighlightText from "./HighlightText";

const NoiTruTable = ({
  noiTruDepartments,
  schedules,
  searchTerm,
  loadingSoThuTu,
  refreshing,
  onRefreshDepartment,
}) => {
  const phongNoiTruData = useSelector(selectSoThuTuPhongNoiTru);
  const khoasFromRedux = useSelector(selectKhoas);

  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "rgba(25, 118, 210, 0.05)" }}>
            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
              Khoa/Phòng
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 200 }}>
              Nhân sự trực
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
              Tổng BN
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
              Phân loại BN
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
              Trạng thái điều trị
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {noiTruDepartments.map((department) => {
            const schedule = schedules[department.maKhoa] || {
              dieuDuong: "",
              bacSi: "",
            };

            const currentKhoa = khoasFromRedux.find(
              (k) => k._id === department.id
            );
            const noiTruData =
              currentKhoa && currentKhoa.HisDepartmentID
                ? phongNoiTruData.find(
                    (item) =>
                      item.departmentid &&
                      item.departmentid.toString() ===
                        currentKhoa.HisDepartmentID.toString()
                  )
                : null;

            return (
              <TableRow key={department.id} hover>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      icon={<LocalHospitalIcon fontSize="small" />}
                      label="Nội trú"
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Typography variant="body2" fontWeight="medium">
                      <HighlightText
                        text={department.ten}
                        searchTerm={searchTerm}
                      />
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Điều dưỡng:
                    </Typography>
                    <Typography variant="body2">
                      {schedule.dieuDuong || "Chưa phân công"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Bác sĩ:
                    </Typography>
                    <Typography variant="body2">
                      {schedule.bacSi || "Chưa phân công"}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  {noiTruData ? (
                    <Chip
                      label={noiTruData.total_count || 0}
                      color="primary"
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  {noiTruData ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={`BHYT: ${noiTruData.bhyt_count || 0}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`VP: ${noiTruData.vienphi_count || 0}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                      <Chip
                        label={`DV: ${noiTruData.yeucau_count || 0}`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  {noiTruData ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={`Điều trị: ${noiTruData.dang_dieu_tri || 0}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                      <Chip
                        label={`Ra viện: ${noiTruData.benh_nhan_ra_vien || 0}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      N/A
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Tooltip title="Làm mới dữ liệu">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onRefreshDepartment(department.id)}
                      disabled={refreshing[department.id] || loadingSoThuTu}
                    >
                      {refreshing[department.id] ? (
                        <CircularProgress size={16} />
                      ) : (
                        <RefreshIcon fontSize="small" />
                      )}
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default NoiTruTable;
