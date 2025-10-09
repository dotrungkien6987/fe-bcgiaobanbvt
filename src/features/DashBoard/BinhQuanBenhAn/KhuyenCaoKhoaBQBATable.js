import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Grid,
  Stack,
  Box,
  TextField,
  MenuItem,
  Typography,
  Chip,
} from "@mui/material";
import MainCard from "components/MainCard";
import SimpleTable from "pages/tables/MyTable/SimpleTable";
import { getAllKhuyenCao, setCurrentYear } from "./khuyenCaoKhoaBQBASlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import AddKhuyenCaoButton from "./AddKhuyenCaoButton";
import UpdateKhuyenCaoButton from "./UpdateKhuyenCaoButton";
import DeleteKhuyenCaoButton from "./DeleteKhuyenCaoButton";
import BulkCopyButton from "./BulkCopyButton";

function KhuyenCaoKhoaBQBATable() {
  const dispatch = useDispatch();
  const { khuyenCaoList, isLoading, currentYear } = useSelector(
    (state) => state.khuyenCaoKhoaBQBA
  );
  const { KhoaBinhQuanBenhAn } = useSelector((state) => state.nhanvien);

  const [selectedYear, setSelectedYear] = useState(currentYear);

  useEffect(() => {
    dispatch(getDataFix());
    dispatch(getAllKhuyenCao(selectedYear));
  }, [dispatch, selectedYear]);

  // Generate list of years (current year - 5 to current year + 2)
  const years = useMemo(() => {
    const current = new Date().getFullYear();
    const yearList = [];
    for (let i = current - 5; i <= current + 2; i++) {
      yearList.push(i);
    }
    return yearList;
  }, []);

  const handleYearChange = (event) => {
    const year = parseInt(event.target.value);
    setSelectedYear(year);
    dispatch(setCurrentYear(year));
  };

  const data = useMemo(() => khuyenCaoList || [], [khuyenCaoList]);

  const columns = useMemo(
    () => [
      {
        Header: "Action",
        Footer: "Action",
        accessor: "_id",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => (
          <Stack
            direction="row"
            alignItems="left"
            justifyContent="left"
            spacing={0}
          >
            <UpdateKhuyenCaoButton item={row.original} />
            <DeleteKhuyenCaoButton item={row.original} />
          </Stack>
        ),
      },
      {
        Header: "Tên khoa",
        Footer: "Tên khoa",
        accessor: "TenKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Loại khoa",
        Footer: "Loại khoa",
        accessor: "LoaiKhoa",
        disableGroupBy: true,
        Cell: ({ value }) => (
          <Chip
            label={value === "noitru" ? "Nội trú" : "Ngoại trú"}
            color={value === "noitru" ? "primary" : "success"}
            size="small"
          />
        ),
      },
      {
        Header: "Năm",
        Footer: "Năm",
        accessor: "Nam",
        disableGroupBy: true,
      },
      {
        Header: "Khuyến cáo bình quân HSBA (đồng)",
        Footer: "Khuyến cáo bình quân HSBA",
        accessor: "KhuyenCaoBinhQuanHSBA",
        disableGroupBy: true,
        Cell: ({ value }) => (
          <Box sx={{ textAlign: "right", fontWeight: 600, color: "#1939B7" }}>
            {value?.toLocaleString("vi-VN")}
          </Box>
        ),
      },
      {
        Header: "Khuyến cáo tỷ lệ (Thuốc + VT) (%)",
        Footer: "Khuyến cáo tỷ lệ",
        accessor: "KhuyenCaoTyLeThuocVatTu",
        disableGroupBy: true,
        Cell: ({ value }) => (
          <Box sx={{ textAlign: "right", fontWeight: 600, color: "#bb1515" }}>
            {value?.toFixed(2)}%
          </Box>
        ),
      },
      {
        Header: "Ghi chú",
        Footer: "Ghi chú",
        accessor: "GhiChu",
        disableGroupBy: true,
      },
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard
          title={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">
                Quản lý khuyến cáo bình quân bệnh án
              </Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField
                  select
                  label="Năm"
                  value={selectedYear}
                  onChange={handleYearChange}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
                <BulkCopyButton currentYear={selectedYear} />
              </Stack>
            </Stack>
          }
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={
              <AddKhuyenCaoButton
                currentYear={selectedYear}
                khoaList={KhoaBinhQuanBenhAn}
              />
            }
            isLoading={isLoading}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default KhuyenCaoKhoaBQBATable;
