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
import { selectSoThuTuPhongThucHien } from "../../Slice/soThuTuSlice";
import { selectKhoas } from "../../Slice/lichtrucSlice";
import RefreshIcon from "@mui/icons-material/Refresh";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import HighlightText from "./HighlightText";

const ThuThuatTable = ({
  thuThuatDepartments,
  schedules,
  searchTerm,
  loadingSoThuTu,
  refreshing,
  onRefreshDepartment,
}) => {
  const phongThucHienData = useSelector(selectSoThuTuPhongThucHien);
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
              Tổng CLS
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
              STT đã thực hiện
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 120 }}>
              Ca chưa thực hiện
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 150 }}>
              Tình trạng ca
            </TableCell>
            <TableCell sx={{ fontWeight: "bold", minWidth: 100 }}>
              Thao tác
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {thuThuatDepartments.map((department) => {
            const schedule = schedules[department.maKhoa] || {
              dieuDuong: "",
              bacSi: "",
            };

            const currentKhoa = khoasFromRedux.find(
              (k) => k._id === department.id
            );
            const thuThuatData =
              currentKhoa && currentKhoa.HisDepartmentID
                ? phongThucHienData.find(
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
                      icon={<MedicalServicesIcon fontSize="small" />}
                      label="Phòng thực hiện"
                      size="small"
                      color="warning"
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
                  {thuThuatData ? (
                    <Chip
                      label={thuThuatData.tong_mau_benh_pham || 0}
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
                  {thuThuatData ? (
                    <Chip
                      label={
                        thuThuatData.latest_sothutunumber_da_thuc_hien || 0
                      }
                      color="success"
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
                  {thuThuatData ? (
                    <Chip
                      label={thuThuatData.so_ca_chua_thuc_hien || 0}
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
                  {thuThuatData ? (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                      <Chip
                        label={`Chờ: ${thuThuatData.so_ca_chua_thuc_hien || 0}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                      <Chip
                        label={`Đợi KQ: ${
                          thuThuatData.so_ca_da_thuc_hien_cho_ket_qua || 0
                        }`}
                        size="small"
                        color="info"
                        variant="outlined"
                      />
                      <Chip
                        label={`Có KQ: ${
                          thuThuatData.so_ca_da_co_ket_qua || 0
                        }`}
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

export default ThuThuatTable;
