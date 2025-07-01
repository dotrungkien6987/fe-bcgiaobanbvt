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
import { selectSoThuTuPhongLayMau } from "../../Slice/soThuTuSlice";
import { selectKhoas } from "../../Slice/lichtrucSlice";
import RefreshIcon from "@mui/icons-material/Refresh";
import BiotechIcon from "@mui/icons-material/Biotech";
import HighlightText from "./HighlightText";

const LayMauTable = ({
  layMauDepartments,
  schedules,
  searchTerm,
  loadingSoThuTu,
  refreshing,
  onRefreshDepartment,
}) => {
  const phongLayMauData = useSelector(selectSoThuTuPhongLayMau);
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
              Tổng mẫu cần lấy
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
              Trạng thái mẫu
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {layMauDepartments.map((department) => {
            const schedule = schedules[department.maKhoa] || {
              dieuDuong: "",
              bacSi: "",
            };

            const currentKhoa = khoasFromRedux.find(
              (k) => k._id === department.id
            );
            const layMauData =
              currentKhoa && currentKhoa.HisDepartmentID
                ? phongLayMauData.find(
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
                      icon={<BiotechIcon fontSize="small" />}
                      label="Lấy mẫu"
                      size="small"
                      color="secondary"
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
                  {layMauData ? (
                    <Chip
                      label={layMauData.tong_benh_nhan || 0}
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
                  {layMauData ? (
                    <Chip
                      label={layMauData.tong_mau_benh_pham || 0}
                      color="info"
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
                  {layMauData ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={`Chưa lấy: ${
                          layMauData.so_ca_chua_lay_mau || 0
                        }`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                      <Chip
                        label={`Đã lấy: ${layMauData.so_ca_da_lay_mau || 0}`}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                      <Chip
                        label={`BN chưa lấy: ${
                          layMauData.so_benh_nhan_chua_lay_mau || 0
                        }`}
                        size="small"
                        color="error"
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

export default LayMauTable;
