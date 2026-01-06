/**
 * @fileoverview Table hiển thị danh sách dịch vụ trùng lặp (SIMPLIFIED - Single Tab)
 * @module features/DashBoard/DichVuTrung/DichVuTrungTable
 */

import React, { useState, useMemo } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Typography,
  Button,
  Alert,
  Skeleton,
  Toolbar,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { formatCurrency } from "utils/formatNumber";
import { toast } from "react-toastify";

/**
 * Component table đơn giản hiển thị TẤT CẢ duplicates
 * (Không group theo tab - user cần xem toàn bộ để verify manually)
 */
function DichVuTrungTable({
  duplicates,
  pagination,
  loading,
  onPageChange,
  onLimitChange,
  selectedService,
  selectedDepartment,
  onClearFilters,
}) {
  const [searchText, setSearchText] = useState("");

  // Client-side search filter (keep only search text filter)
  const filteredData = useMemo(() => {
    let filtered = duplicates;

    // Apply search text filter (client-side for real-time typing)
    if (searchText.trim()) {
      const lowerSearch = searchText.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.patientcode?.toLowerCase().includes(lowerSearch) ||
          row.patientname?.toLowerCase().includes(lowerSearch) ||
          row.servicepricename?.toLowerCase().includes(lowerSearch) ||
          row.departmentgroupname?.toLowerCase().includes(lowerSearch) ||
          row.vienphiid?.toString().toLowerCase().includes(lowerSearch)
      );
    }

    // Sort by vienphiid first, then by servicepricedate within each vienphiid
    // Create a copy to avoid mutating the original array (Redux state is immutable)
    return [...filtered].sort((a, b) => {
      // First compare vienphiid (convert to string for comparison)
      const vienphiA = String(a.vienphiid || "");
      const vienphiB = String(b.vienphiid || "");
      const vienphiCompare = vienphiA.localeCompare(vienphiB);
      if (vienphiCompare !== 0) return vienphiCompare;

      // Then compare servicepricedate within same vienphiid
      const dateA = dayjs(a.servicepricedate);
      const dateB = dayjs(b.servicepricedate);
      return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0;
    });
  }, [duplicates, searchText]);

  // Export CSV function
  const handleExportCSV = () => {
    if (!filteredData || filteredData.length === 0) {
      toast.warning("Không có dữ liệu để xuất");
      return;
    }

    try {
      // CSV headers
      const headers = [
        "STT",
        "Viện phí ID",
        "Mã BN",
        "Tên BN",
        "Năm sinh",
        "Giới tính",
        "Mã DV",
        "Tên Dịch Vụ",
        "Loại DV",
        "Khoa",
        "Phòng",
        "Ngày",
        "Đơn giá",
        "SL",
        "Thành tiền",
      ];

      // CSV rows
      const rows = filteredData.map((row, index) => [
        index + 1,
        row.vienphiid || "",
        row.patientcode || "",
        row.patientname || "",
        row.birthday ? dayjs(row.birthday).format("YYYY") : "",
        row.gioitinhcode === "1" ? "Nam" : row.gioitinhcode === "2" ? "Nữ" : "",
        row.servicepricecode || "",
        row.servicepricename || "",
        row.bhyt_groupcode || "",
        row.departmentgroupname || "",
        row.departmentname || "",
        row.servicepricedate
          ? dayjs(row.servicepricedate).format("DD/MM/YYYY HH:mm")
          : "",
        row.servicepricemoney || 0,
        row.soluong || 0,
        (row.servicepricemoney || 0) * (row.soluong || 0),
      ]);

      // Build CSV content
      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
      ].join("\n");

      // Add BOM for UTF-8
      const blob = new Blob(["\ufeff" + csvContent], {
        type: "text/csv;charset=utf-8;",
      });

      // Download
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      const filename = `DichVuTrung_${dayjs().format("YYYYMMDD_HHmmss")}.csv`;
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Đã xuất ${filteredData.length} bản ghi`);
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error("Lỗi khi xuất file CSV");
    }
  };

  // Service type badge color
  const getServiceTypeBadge = (type) => {
    switch (type) {
      case "04CDHA":
        return <Chip label="CĐHA" size="small" color="primary" />;
      case "03XN":
        return <Chip label="XN" size="small" color="error" />;
      case "05TDCN":
        return <Chip label="TDCN" size="small" color="warning" />;
      default:
        return <Chip label={type} size="small" />;
    }
  };

  // Highlight rows with same vienphiid (alternating colors)
  const getRowBackgroundColor = (vienphiid, index) => {
    // Simple hash to assign color based on vienphiid
    const hash = vienphiid
      ? vienphiid
          .toString()
          .split("")
          .reduce((acc, char) => acc + char.charCodeAt(0), 0)
      : index;
    const colors = ["#fff3e0", "#e3f2fd", "#f3e5f5", "#e0f2f1"];
    return colors[hash % colors.length];
  };

  if (loading) {
    return (
      <Paper sx={{ width: "100%", mb: 2 }}>
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Skeleton variant="text" width={200} height={40} />
        </Toolbar>
        <Box sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Skeleton variant="rectangular" height={50} />
            {[...Array(8)].map((_, idx) => (
              <Skeleton key={idx} variant="rectangular" height={40} />
            ))}
          </Stack>
        </Box>
      </Paper>
    );
  }

  if (!duplicates || duplicates.length === 0) {
    return (
      <Alert severity="success" icon="✅" sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Không phát hiện dịch vụ trùng lặp</strong>
        </Typography>
        <Typography variant="body2">
          Trong khoảng thời gian đã chọn, không có dịch vụ nào bị chỉ định trùng
          lặp bởi nhiều khoa.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Color Legend */}
      <Alert severity="info" icon={false} sx={{ mb: 2 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Ghi chú màu sắc:
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#fff3e0",
                border: "1px solid #ccc",
              }}
            />
            <Typography variant="caption">Nhóm bệnh nhân 1</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#e3f2fd",
                border: "1px solid #ccc",
              }}
            />
            <Typography variant="caption">Nhóm bệnh nhân 2</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#f3e5f5",
                border: "1px solid #ccc",
              }}
            />
            <Typography variant="caption">Nhóm bệnh nhân 3</Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box
              sx={{
                width: 20,
                height: 20,
                bgcolor: "#e0f2f1",
                border: "1px solid #ccc",
              }}
            />
            <Typography variant="caption">Nhóm bệnh nhân 4</Typography>
          </Box>
          <Typography
            variant="caption"
            sx={{ fontStyle: "italic", color: "text.secondary" }}
          >
            (Các dòng cùng màu = cùng lượt khám của 1 bệnh nhân)
          </Typography>
        </Stack>
      </Alert>

      <Paper sx={{ width: "100%", mb: 2 }}>
        {/* Active filters display */}
        {(selectedService || selectedDepartment) && (
          <Alert severity="info" onClose={onClearFilters} sx={{ m: 2, mb: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Typography variant="body2" fontWeight={600}>
                Đang lọc:
              </Typography>
              {selectedService && (
                <Chip
                  label={`Dịch vụ: ${selectedService}`}
                  onDelete={onClearFilters}
                  color="primary"
                  size="small"
                />
              )}
              {selectedDepartment && (
                <Chip
                  label={`Khoa: ${selectedDepartment}`}
                  onDelete={onClearFilters}
                  color="primary"
                  size="small"
                />
              )}
            </Stack>
          </Alert>
        )}

        {/* Toolbar: Search + Export */}
        <Toolbar sx={{ pl: { sm: 2 }, pr: { xs: 1, sm: 1 } }}>
          <Typography variant="h6" component="div" sx={{ flex: "1 1 100%" }}>
            Danh Sách Chi Tiết ({filteredData.length} / {duplicates.length})
          </Typography>

          <TextField
            size="small"
            placeholder="Tìm theo mã BN, tên BN, dịch vụ..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            sx={{ minWidth: 400, mr: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleExportCSV}
            disabled={filteredData.length === 0}
            sx={{
              fontWeight: 600,
              borderColor: "#1976d2",
              color: "#1976d2",
              "&:hover": {
                borderColor: "#1565c0",
                bgcolor: "rgba(25, 118, 210, 0.04)",
              },
            }}
          >
            Xuất CSV
          </Button>
        </Toolbar>

        {/* Table */}
        <TableContainer>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                >
                  STT
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                  Viện phí ID
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                  Mã BN
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                  Tên BN
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                >
                  Năm sinh
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, bgcolor: "grey.100", minWidth: 200 }}
                >
                  Dịch Vụ
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                >
                  Loại
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                  Khoa/Nhóm
                </TableCell>
                <TableCell sx={{ fontWeight: 700, bgcolor: "grey.100" }}>
                  Phòng
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                >
                  Ngày
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                >
                  Đơn giá
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                >
                  SL
                </TableCell>
                <TableCell
                  align="right"
                  sx={{ fontWeight: 700, bgcolor: "grey.100" }}
                >
                  Thành tiền
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, index) => {
                const totalPrice =
                  (row.servicepricemoney || 0) * (row.soluong || 0);
                return (
                  <TableRow
                    key={`${row.servicepriceid}-${index}`}
                    hover
                    sx={{
                      bgcolor: getRowBackgroundColor(row.vienphiid, index),
                      "&:hover": {
                        bgcolor: "action.hover",
                      },
                    }}
                  >
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}
                      >
                        {row.vienphiid || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{ fontFamily: "monospace" }}
                      >
                        {row.patientcode || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {row.patientname || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {row.birthday ? dayjs(row.birthday).format("YYYY") : "-"}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {row.servicepricename || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {getServiceTypeBadge(row.bhyt_groupcode)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {row.departmentgroupname || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                        {row.departmentname || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      {row.servicepricedate
                        ? dayjs(row.servicepricedate).format("DD/MM/YYYY HH:mm")
                        : "-"}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(row.servicepricemoney || 0)}
                    </TableCell>
                    <TableCell align="center">{row.soluong || 0}</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>
                      {formatCurrency(totalPrice)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          component="div"
          count={pagination.total}
          page={pagination.page - 1} // MUI uses 0-indexed
          onPageChange={(e, newPage) => onPageChange(newPage + 1)}
          rowsPerPage={pagination.limit}
          onRowsPerPageChange={(e) =>
            onLimitChange(parseInt(e.target.value, 10))
          }
          rowsPerPageOptions={[25, 50, 100, 200]}
          labelRowsPerPage="Số bản ghi / trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}–${to} / ${count}`
          }
        />
      </Paper>
    </Box>
  );
}

export default DichVuTrungTable;
