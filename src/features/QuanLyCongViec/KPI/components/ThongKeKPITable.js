import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Chip,
  InputAdornment,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { EmojiEvents, Search } from "@mui/icons-material";
import dayjs from "dayjs";
import CommonTable from "pages/tables/MyTable/CommonTable";

/**
 * ThongKeKPITable - Bảng xếp hạng thống kê KPI
 *
 * Props:
 * - data: Array of ThongKe objects từ backend
 * - isLoading: Trạng thái loading của bảng
 * - nhanviens: Danh sách nhân viên để hiển thị thông tin
 */
const ThongKeKPITable = ({ data = [], isLoading, nhanviens = [] }) => {
  const [search, setSearch] = useState("");

  const getNhanVienInfo = useMemo(
    () => (nhanVienId) => {
      const nv = nhanviens.find((item) => item._id === nhanVienId);
      return nv || { Ten: "N/A", MaNhanVien: "" };
    },
    [nhanviens]
  );

  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => (b.TongDiemKPI || 0) - (a.TongDiemKPI || 0)
    );
  }, [data]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sortedData;
    return sortedData.filter((row) => {
      const nv = getNhanVienInfo(row.NhanVienID);
      const nhanVienName = (nv.Ten || "").toLowerCase();
      const maNV = (nv.MaNhanVien || "").toLowerCase();
      return nhanVienName.includes(q) || maNV.includes(q);
    });
  }, [sortedData, search, getNhanVienInfo]);

  const getRankIcon = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const getPerformanceLevel = (diem) => {
    if (diem >= 9) return { label: "Xuất sắc", color: "success" };
    if (diem >= 7) return { label: "Tốt", color: "primary" };
    if (diem >= 5) return { label: "Khá", color: "warning" };
    return { label: "Yếu", color: "error" };
  };

  const columns = useMemo(
    () => [
      {
        id: "rank",
        Header: "Hạng",
        width: 80,
        Cell: ({ row }) => {
          const index = filteredData.findIndex(
            (item) => item._id === row.original._id
          );
          const rankIcon = getRankIcon(index);
          return (
            <Stack direction="row" spacing={1} alignItems="center">
              {rankIcon && (
                <Typography variant="h6" sx={{ fontSize: 24 }}>
                  {rankIcon}
                </Typography>
              )}
              <Typography variant="body1" fontWeight={500}>
                #{index + 1}
              </Typography>
            </Stack>
          );
        },
      },
      {
        Header: "Nhân viên",
        accessor: "NhanVienID",
        width: 260,
        Cell: ({ row }) => {
          const nv = getNhanVienInfo(row.original.NhanVienID);
          return (
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main" }}>
                {(nv.Ten || "?").charAt(0).toUpperCase()}
              </Avatar>
              <Stack>
                <Typography variant="body2" fontWeight={500}>
                  {nv.Ten}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {nv.MaNhanVien || "N/A"}
                </Typography>
              </Stack>
            </Stack>
          );
        },
      },
      {
        Header: "Điểm KPI",
        accessor: "TongDiemKPI",
        width: 220,
        Cell: ({ row }) => {
          const diem = row.original.TongDiemKPI || 0;
          const percentValue = Math.min((diem / 10) * 100, 100);
          const color =
            diem >= 9
              ? "success"
              : diem >= 7
              ? "primary"
              : diem >= 5
              ? "warning"
              : "error";

          return (
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="h6" color={`${color}.main`}>
                  {percentValue.toFixed(1)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({diem.toFixed(2)}/10)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={percentValue}
                color={color}
                sx={{ height: 8, borderRadius: 4 }}
              />
            </Stack>
          );
        },
      },
      {
        id: "performance",
        Header: "Xếp loại",
        width: 140,
        Cell: ({ row }) => {
          const diem = row.original.TongDiemKPI || 0;
          const { label, color } = getPerformanceLevel(diem);
          return <Chip label={label} color={color} size="small" />;
        },
      },
      {
        Header: "Ngày duyệt",
        accessor: "NgayDuyet",
        width: 160,
        Cell: ({ row }) =>
          row.original.NgayDuyet ? (
            <Typography variant="body2">
              {dayjs(row.original.NgayDuyet).format("DD/MM/YYYY")}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          ),
      },
      {
        Header: "Trạng thái",
        accessor: "TrangThai",
        width: 150,
        Cell: ({ row }) => {
          const isApproved = row.original.TrangThai === "DA_DUYET";
          return (
            <Chip
              label={isApproved ? "Đã duyệt" : "Chưa duyệt"}
              color={isApproved ? "success" : "warning"}
              variant={isApproved ? "filled" : "outlined"}
              size="small"
            />
          );
        },
      },
    ],
    [filteredData, getNhanVienInfo]
  );

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }} alignItems="center">
        <TextField
          placeholder="Tìm kiếm nhân viên..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ minWidth: 300 }}
        />
        <Box sx={{ flex: 1, textAlign: "right" }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="flex-end"
          >
            <EmojiEvents color="warning" />
            <Typography variant="body2" color="text.secondary">
              Bảng xếp hạng {filteredData.length} nhân viên
            </Typography>
          </Stack>
        </Box>
      </Stack>

      <CommonTable
        columns={columns}
        data={filteredData}
        enablePagination
        enableSorting={false}
        enableColumnFilters={false}
        state={{ isLoading }}
        initialState={{
          pagination: { pageSize: 20, pageIndex: 0 },
        }}
      />
    </Box>
  );
};

export default ThongKeKPITable;
