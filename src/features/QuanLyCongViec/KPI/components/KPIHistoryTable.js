import React, { useMemo, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import {
  Box,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  TextField,
  InputAdornment,
  LinearProgress,
} from "@mui/material";
import { Visibility, Search } from "@mui/icons-material";
import CommonTable from "pages/tables/MyTable/CommonTable";
import dayjs from "dayjs";
import { openDetailDialog } from "../kpiSlice";

/**
 * KPIHistoryTable - Bảng lịch sử KPI của nhân viên
 *
 * Props:
 * - data: Array of DanhGiaKPI objects
 * - isLoading: Boolean
 * - chuKyDanhGias: Array of evaluation cycles
 */
const KPIHistoryTable = ({ data = [], isLoading, chuKyDanhGias = [] }) => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

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
      const chuKyName = getChuKyName(row.ChuKyDanhGiaID).toLowerCase();
      return chuKyName.includes(q);
    });
  }, [data, search, getChuKyName]);

  const handleViewDetail = useCallback(
    (row) => {
      dispatch(openDetailDialog(row._id));
    },
    [dispatch]
  );

  const columns = useMemo(
    () => [
      {
        Header: "Chu kỳ đánh giá",
        accessor: "ChuKyDanhGiaID",
        width: 250,
        Cell: ({ row }) => {
          const chuKy = chuKyDanhGias.find(
            (ck) => ck._id === row.original.ChuKyDanhGiaID
          );
          return (
            <Stack spacing={0.5}>
              <Typography variant="body2" fontWeight={500}>
                {getChuKyName(row.original.ChuKyDanhGiaID)}
              </Typography>
              {chuKy && (
                <Typography variant="caption" color="text.secondary">
                  {dayjs(chuKy.NgayBatDau).format("DD/MM/YYYY")} -{" "}
                  {dayjs(chuKy.NgayKetThuc).format("DD/MM/YYYY")}
                </Typography>
              )}
            </Stack>
          );
        },
      },
      {
        Header: "Điểm KPI",
        accessor: "TongDiemKPI",
        width: 200,
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
                  ({diem.toFixed(2)}/10 điểm)
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(parseFloat(percent), 100)}
                color={color}
                sx={{ height: 8, borderRadius: 4 }}
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
              row.original.TrangThai === "DA_DUYET"
                ? "Đã duyệt"
                : "Đang chấm điểm"
            }
            color={
              row.original.TrangThai === "DA_DUYET" ? "success" : "warning"
            }
            size="small"
          />
        ),
      },
      {
        Header: "Ngày duyệt",
        accessor: "NgayDuyet",
        width: 150,
        Cell: ({ row }) =>
          row.original.NgayDuyet ? (
            <Typography variant="body2">
              {dayjs(row.original.NgayDuyet).format("DD/MM/YYYY HH:mm")}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          ),
      },
      {
        id: "actions",
        Header: "Thao tác",
        width: 100,
        disableSortBy: true,
        Cell: ({ row }) => (
          <Tooltip title="Xem chi tiết">
            <IconButton
              size="small"
              color="primary"
              onClick={() => handleViewDetail(row.original)}
            >
              <Visibility fontSize="small" />
            </IconButton>
          </Tooltip>
        ),
      },
    ],
    [chuKyDanhGias, getChuKyName, handleViewDetail]
  );

  return (
    <Box>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <TextField
          placeholder="Tìm kiếm chu kỳ..."
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

export default KPIHistoryTable;
