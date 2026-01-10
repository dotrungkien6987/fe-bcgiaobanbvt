/**
 * @fileoverview Table hiển thị danh sách dịch vụ trùng lặp (SIMPLIFIED - Single Tab)
 * @module features/DashBoard/DichVuTrung/DichVuTrungTable
 */

import React, { useMemo } from "react";
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
  CircularProgress,
} from "@mui/material";
import {
  Search as SearchIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { formatCurrency } from "utils/formatNumber";
import { toast } from "react-toastify";
import apiService from "../../../app/apiService";

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
  searchText,
  onSearchChange,
  isSearching,
  onGetExportParams,
}) {
  // Server-side search - no client-side filtering needed
  // Just sort the data from server
  const sortedData = useMemo(() => {
    // Create a copy to avoid mutating the original array (Redux state is immutable)
    return [...duplicates].sort((a, b) => {
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
  }, [duplicates]);

  // Export CSV function - Export ALL data
  const handleExportCSV = async () => {
    if (loading) {
      toast.warning("Vui lòng đợi tải dữ liệu hiện tại hoàn tất");
      return;
    }

    try {
      // Show loading toast
      const loadingToast = toast.info("Đang tải toàn bộ dữ liệu để xuất...", {
        autoClose: false,
      });

      // Get filter params from parent
      const exportParams = onGetExportParams();

      // Call API to get ALL data (not paginated)
      const response = await apiService.post("/his/dichvutrung/export-all", {
        fromDate: exportParams.fromDate,
        toDate: exportParams.toDate,
        serviceTypes: exportParams.serviceTypes,
        filterByService: selectedService,
        filterByDepartment: selectedDepartment,
        searchText: searchText || null,
      });

      const allData = response.data.data.duplicates;

      // Dismiss loading toast
      toast.dismiss(loadingToast);

      if (!allData || allData.length === 0) {
        toast.warning("Không có dữ liệu để xuất");
        return;
      }

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
      const rows = allData.map((row, index) => [
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
      const filename = `DichVuTrung_Full_${dayjs().format(
        "YYYYMMDD_HHmmss"
      )}.csv`;
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`✅ Đã xuất ${allData.length} bản ghi (TOÀN BỘ)`);
    } catch (error) {
      console.error("Export CSV error:", error);
      toast.error(error.message || "Lỗi khi xuất file CSV");
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

  // Determine if we have data
  const hasData = duplicates && duplicates.length > 0;

  return (
    <Box>
      {/* Color Legend - Only show when has data */}
      {hasData && (
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
      )}

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
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ width: "100%" }}
            alignItems="center"
          >
            {/* Search box - Server-side search */}
            <TextField
              placeholder="Tìm kiếm (Mã BN, Tên BN, Dịch vụ, Khoa, Viện phí ID)..."
              size="small"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    {isSearching ? (
                      <CircularProgress size={20} />
                    ) : (
                      <SearchIcon />
                    )}
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: { xs: "100%", sm: 300 } }}
            />

            {/* Export CSV button */}
            <Button
              variant="contained"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={handleExportCSV}
              disabled={loading}
              size="small"
              sx={{
                fontWeight: 600,
                minWidth: { xs: "100%", sm: "auto" },
                color: "white",
                "&:hover": {
                  bgcolor: "success.dark",
                },
              }}
            >
              Xuất CSV (Toàn bộ)
            </Button>
          </Stack>
        </Toolbar>

        {/* Loading State */}
        {loading && (
          <Box sx={{ p: 2 }}>
            <Stack spacing={1}>
              <Skeleton variant="rectangular" height={50} />
              {[...Array(8)].map((_, idx) => (
                <Skeleton key={idx} variant="rectangular" height={40} />
              ))}
            </Stack>
          </Box>
        )}

        {/* No Data Message */}
        {!loading && !hasData && (
          <Box sx={{ p: 2 }}>
            <Alert severity="success" icon="✅">
              <Typography variant="body1">
                <strong>Không phát hiện dịch vụ trùng lặp</strong>
              </Typography>
              <Typography variant="body2">
                Trong khoảng thời gian đã chọn, không có dịch vụ nào bị chỉ định
                trùng lặp bởi nhiều khoa.
              </Typography>
            </Alert>
          </Box>
        )}

        {/* Table - Only show when has data */}
        {!loading && hasData && (
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
                {sortedData.map((row, index) => {
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
                        {row.birthday
                          ? dayjs(row.birthday).format("YYYY")
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          {row.servicepricename || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {getServiceTypeBadge(row.bhyt_groupcode)}
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          {row.departmentgroupname || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: "0.85rem" }}
                        >
                          {row.departmentname || "-"}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        {row.servicepricedate
                          ? dayjs(row.servicepricedate).format(
                              "DD/MM/YYYY HH:mm"
                            )
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
        )}

        {/* Pagination - Only show when has data */}
        {!loading && hasData && (
          <TablePagination
            component="div"
            count={pagination.total}
            page={pagination.page - 1} // MUI uses 0-indexed
            onPageChange={(e, newPage) => {
              if (!loading) {
                onPageChange(newPage + 1);
              }
            }}
            rowsPerPage={pagination.limit}
            onRowsPerPageChange={(e) => {
              if (!loading) {
                onLimitChange(parseInt(e.target.value, 10));
              }
            }}
            rowsPerPageOptions={[25, 50, 100, 200]}
            labelRowsPerPage="Số bản ghi / trang:"
            labelDisplayedRows={({ from, to, count }) =>
              `${from}–${to} / ${count}`
            }
            disabled={loading}
          />
        )}
      </Paper>
    </Box>
  );
}

export default DichVuTrungTable;
