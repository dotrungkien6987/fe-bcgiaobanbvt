import React, { useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import {
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Search,
} from "@mui/icons-material";
import CommonTable from "pages/tables/MyTable/CommonTable";
import dayjs from "dayjs";
import { openDetailDialog } from "../kpiSlice";

/**
 * DanhGiaKPITable - Bảng danh sách đánh giá KPI
 *
 * Props:
 * - data: Array of DanhGiaKPI objects
 * - isLoading: Boolean
 * - nhanviens: Array of employees
 * - chuKyDanhGias: Array of evaluation cycles
 */
const DanhGiaKPITable = ({
  data = [],
  isLoading,
  nhanviens = [],
  chuKyDanhGias = [],
}) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const getNhanVienName = useMemo(
    () => (nhanVienId) => {
      const nv = nhanviens.find((item) => item._id === nhanVienId);
      return nv ? `${nv.Ten} (${nv.MaNhanVien || ""})` : "N/A";
    },
    [nhanviens]
  );

  const getChuKyName = useMemo(
    () => (chuKyId) => {
      const ck = chuKyDanhGias.find((item) => item._id === chuKyId);
      return ck?.TenChuKy || "N/A";
    },
    [chuKyDanhGias]
  );

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter((row) => {
      const nhanVienName = getNhanVienName(row.NhanVienID).toLowerCase();
      const chuKyName = getChuKyName(row.ChuKyDanhGiaID).toLowerCase();
      return nhanVienName.includes(q) || chuKyName.includes(q);
    });
  }, [data, search, getNhanVienName, getChuKyName]);

  const handleViewDetail = useCallback(
    (row) => {
      dispatch(openDetailDialog(row._id));
    },
    [dispatch]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Nhân viên",
        accessor: "NhanVienID",
        width: 200,
        Cell: ({ row }) => (
          <Typography variant="body2">
            {getNhanVienName(row.original.NhanVienID)}
          </Typography>
        ),
      },
      {
        Header: "Chu kỳ",
        accessor: "ChuKyDanhGiaID",
        width: 180,
        Cell: ({ row }) => (
          <Typography variant="body2">
            {getChuKyName(row.original.ChuKyDanhGiaID)}
          </Typography>
        ),
      },
      {
        Header: "Điểm KPI",
        accessor: "TongDiemKPI",
        width: 150,
        Cell: ({ row }) => {
          const diem = row.original.TongDiemKPI || 0;
          const percent = ((diem / 10) * 100).toFixed(1);
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
                  {percent}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  ({diem.toFixed(2)}/10)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(parseFloat(percent), 100)}
                color={color}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Stack>
          );
        },
      },
      {
        Header: "Trạng thái",
        accessor: "TrangThai",
        width: 130,
        Cell: ({ row }) => (
          <Chip
            label={
              row.original.TrangThai === "DA_DUYET" ? "Đã duyệt" : "Chưa duyệt"
            }
            color={
              row.original.TrangThai === "DA_DUYET" ? "success" : "warning"
            }
            size="small"
            icon={
              row.original.TrangThai === "DA_DUYET" ? (
                <CheckCircle />
              ) : (
                <Cancel />
              )
            }
          />
        ),
      },
      {
        Header: "Ngày duyệt",
        accessor: "NgayDuyet",
        width: 140,
        Cell: ({ row }) =>
          row.original.NgayDuyet ? (
            <Typography variant="body2">
              {dayjs(row.original.NgayDuyet).format("DD/MM/YYYY")}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chưa duyệt
            </Typography>
          ),
      },
      {
        Header: "Ghi chú",
        accessor: "GhiChu",
        width: 220,
        Cell: ({ row }) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {row.original.GhiChu || "—"}
          </Typography>
        ),
      },
      {
        id: "actions",
        Header: "Thao tác",
        width: 120,
        enableSorting: false,
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Xem chi tiết">
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleViewDetail(row.original)}
              >
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <IconButton
                size="small"
                color="info"
                onClick={() => console.log("Edit", row.original)}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Xóa">
              <IconButton
                size="small"
                color="error"
                onClick={() => console.log("Delete", row.original)}
                disabled={row.original.TrangThai === "DA_DUYET"}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [getNhanVienName, getChuKyName, handleViewDetail]
  );

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Tìm kiếm nhân viên, chu kỳ..."
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
      </Stack>

      <CommonTable
        columns={columns}
        data={filteredData}
        enablePagination
        enableSorting
        enableColumnFilters={false}
        state={{ isLoading }}
        initialState={{
          pagination: { pageSize: 10, pageIndex: 0 },
          sorting: [{ id: "NgayDuyet", desc: true }],
        }}
      />
    </Box>
  );
};

export default DanhGiaKPITable;
