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
import { selectSoThuTuPhongKham } from "../../Slice/soThuTuSlice";
import { selectKhoas } from "../../Slice/lichtrucSlice";
import RefreshIcon from "@mui/icons-material/Refresh";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import HighlightText from "./HighlightText";

const NgoaiTruTable = ({
  ngoaiTruDepartments,
  schedules,
  searchTerm,
  loadingSoThuTu,
  refreshing,
  onRefreshDepartment,
}) => {
  const phongKhamData = useSelector(selectSoThuTuPhongKham);
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
              STT đã khám
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
              STT chưa khám
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
              Tình trạng
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ngoaiTruDepartments.map((department) => {
            const schedule = schedules[department.maKhoa] || {
              dieuDuong: "",
              bacSi: "",
            };

            const currentKhoa = khoasFromRedux.find(
              (k) => k._id === department.id
            );
            const ngoaiTruData =
              currentKhoa && currentKhoa.HisDepartmentID
                ? phongKhamData.find(
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
                      label="Ngoại trú"
                      size="small"
                      color="success"
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
                  {ngoaiTruData ? (
                    <Chip
                      label={ngoaiTruData.latest_benh_nhan_da_kham || 0}
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
                  {ngoaiTruData ? (
                    <Chip
                      label={ngoaiTruData.so_benh_nhan_chua_kham || 0}
                      color="warning"
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
                  {ngoaiTruData ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={`Chưa khám: ${
                          ngoaiTruData.so_benh_nhan_chua_kham || 0
                        }`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                      <Chip
                        label={`Đã khám: ${
                          ngoaiTruData.so_benh_nhan_da_kham || 0
                        }`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`Tổng: ${ngoaiTruData.tong_benh_nhan || 0}`}
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

export default NgoaiTruTable;
