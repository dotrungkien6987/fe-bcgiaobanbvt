import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

// Material-UI
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  InputAdornment,
  TablePagination,
  Checkbox,
  Alert,
  CircularProgress,
  Stack,
} from "@mui/material";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

// Project imports
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import { formatDate_getDate } from "utils/formatTime";

function SeLectNhanVienTable({ onSelectedRowsChange, selectedEmployeeId }) {
  const dispatch = useDispatch();
  const { nhanviens, isLoading } = useSelector((state) => state.nhanvien);

  // State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Load data
  useEffect(() => {
    if (nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [dispatch, nhanviens.length]);

  // Sync với selectedEmployeeId từ props
  useEffect(() => {
    if (selectedEmployeeId && nhanviens.length > 0) {
      const employee = nhanviens.find((nv) => nv._id === selectedEmployeeId);
      if (employee) {
        setSelectedEmployee(employee);
      }
    } else {
      // Khi selectedEmployeeId là null, reset selectedEmployee
      setSelectedEmployee(null);
    }
  }, [selectedEmployeeId, nhanviens]);

  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!searchTerm) return nhanviens;

    const searchLower = searchTerm.toLowerCase();
    return nhanviens.filter(
      (nv) =>
        nv.Ten?.toLowerCase().includes(searchLower) ||
        nv.MaNhanVien?.toLowerCase().includes(searchLower) ||
        nv.TenKhoa?.toLowerCase().includes(searchLower) ||
        nv.ChucDanh?.toLowerCase().includes(searchLower) ||
        nv.SoDienThoai?.includes(searchTerm) ||
        nv.Email?.toLowerCase().includes(searchLower)
    );
  }, [nhanviens, searchTerm]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = page * rowsPerPage;
    return filteredData.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);

  // Helper functions
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
      0: "error",
      1: "primary",
      2: "success",
    };
    return colorMap[loai] || "default";
  };

  // Handlers
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleSelectEmployee = (employee, event) => {
    // Prevent event bubbling nếu có
    if (event) {
      event.stopPropagation();
    }

    console.log("handleSelectEmployee called with:", employee.Ten);

    // Check nếu đã chọn employee này rồi thì không làm gì
    if (selectedEmployee?._id === employee._id) {
      console.log("Employee already selected, skipping...");
      return;
    }

    // Set employee được chọn
    setSelectedEmployee(employee);
    if (onSelectedRowsChange) {
      console.log("Calling onSelectedRowsChange with employee:", employee.Ten);
      onSelectedRowsChange([employee]);
    }
  };

  const handleConfirmSelection = () => {
    if (selectedEmployee && onSelectedRowsChange) {
      onSelectedRowsChange([selectedEmployee]);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
        }}
      >
        <Stack alignItems="center" spacing={2}>
          <CircularProgress />
          <Typography>Đang tải danh sách nhân viên...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header với search và thông tin đã chọn */}
      <Box sx={{ p: 2, borderBottom: "1px solid #e0e0e0" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Danh sách nhân viên
          </Typography>
          <Chip
            label={`${filteredData.length} nhân viên`}
            color={filteredData.length > 0 ? "primary" : "default"}
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Search box */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm theo tên, mã NV, khoa, chức danh, SĐT, email..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Selected employee info */}
        {selectedEmployee && (
          <Alert
            severity="info"
            icon={<CheckCircleIcon />}
            action={
              <Button
                color="primary"
                size="small"
                variant="contained"
                onClick={handleConfirmSelection}
              >
                Xác nhận chọn
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Đã chọn:</strong> {selectedEmployee.Ten} (Mã:{" "}
              {selectedEmployee.MaNhanVien})
            </Typography>
          </Alert>
        )}
      </Box>

      {/* Table */}
      <TableContainer component={Paper} elevation={0}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" sx={{ bgcolor: "#f5f5f5" }}>
                Chọn
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>
                Avatar
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>
                Thông tin cơ bản
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>
                Loại nhân viên
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>
                Khoa
              </TableCell>
              <TableCell sx={{ bgcolor: "#f5f5f5", fontWeight: 600 }}>
                Liên hệ
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((employee) => {
                const isSelected = selectedEmployee?._id === employee._id;

                return (
                  <TableRow
                    key={employee._id}
                    hover
                    selected={isSelected}
                    onClick={(event) => {
                      // Chỉ trigger khi click vào row, không phải checkbox
                      if (
                        event.target.type !== "checkbox" &&
                        !event.target.closest(".MuiCheckbox-root")
                      ) {
                        handleSelectEmployee(employee, event);
                      }
                    }}
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        bgcolor: "action.hover",
                        transform: "translateY(-1px)",
                        boxShadow: 1,
                      },
                      ...(isSelected && {
                        bgcolor: "primary.lighter",
                        transform: "translateY(-1px)",
                        boxShadow: 2,
                        "&:hover": {
                          bgcolor: "primary.lighter",
                          transform: "translateY(-1px)",
                          boxShadow: 3,
                        },
                      }),
                    }}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isSelected}
                        onChange={(event) => {
                          event.stopPropagation(); // Prevent bubbling to TableRow
                          handleSelectEmployee(employee, event);
                        }}
                        icon={<RadioButtonUncheckedIcon />}
                        checkedIcon={<CheckCircleIcon />}
                        color="primary"
                      />
                    </TableCell>

                    <TableCell>
                      <Avatar
                        sx={{
                          bgcolor: "primary.main",
                          width: 50,
                          height: 50,
                          fontSize: "1.2rem",
                          fontWeight: 600,
                        }}
                      >
                        {employee.Ten?.charAt(0)?.toUpperCase() || "?"}
                      </Avatar>
                    </TableCell>

                    <TableCell>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {employee.Ten}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Mã NV: {employee.MaNhanVien}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sinh: {formatDate_getDate(employee.NgaySinh)} -{" "}
                          {employee.Sex}
                        </Typography>
                        {employee.ChucDanh && (
                          <Typography variant="body2" color="text.secondary">
                            {employee.ChucDanh}
                          </Typography>
                        )}
                      </Box>
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={getLoaiNhanVienText(employee.Loai)}
                        color={getLoaiColor(employee.Loai)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {employee.TenKhoa || "Chưa có"}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Box>
                        {employee.SoDienThoai && (
                          <Typography variant="body2">
                            📞 {employee.SoDienThoai}
                          </Typography>
                        )}
                        {employee.Email && (
                          <Typography
                            variant="body2"
                            sx={{
                              wordBreak: "break-word",
                              fontSize: "0.75rem",
                            }}
                          >
                            ✉️ {employee.Email}
                          </Typography>
                        )}
                        {!employee.SoDienThoai && !employee.Email && (
                          <Typography variant="body2" color="text.secondary">
                            Chưa có thông tin
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Stack alignItems="center" spacing={1}>
                    <PersonIcon
                      sx={{ fontSize: 48, color: "text.secondary" }}
                    />
                    <Typography variant="body1" color="text.secondary">
                      {searchTerm
                        ? "Không tìm thấy nhân viên phù hợp"
                        : "Chưa có dữ liệu nhân viên"}
                    </Typography>
                    {searchTerm && (
                      <Button size="small" onClick={() => setSearchTerm("")}>
                        Xóa bộ lọc
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredData.length > 0 && (
        <TablePagination
          component="div"
          count={filteredData.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25, 50]}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong tổng số ${count}`
          }
          sx={{
            borderTop: "1px solid #e0e0e0",
            "& .MuiTablePagination-toolbar": {
              px: 2,
            },
          }}
        />
      )}
    </Box>
  );
}

export default SeLectNhanVienTable;
