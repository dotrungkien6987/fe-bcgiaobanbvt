import { Grid, Stack, Tooltip, Chip } from "@mui/material";
import { getTieuChiDanhGias } from "../KPI/kpiSlice";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateTieuChiDanhGiaButton from "./UpdateTieuChiDanhGiaButton";
import DeleteTieuChiDanhGiaButton from "./DeleteTieuChiDanhGiaButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddTieuChiDanhGiaButton from "./AddTieuChiDanhGiaButton";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
import { Add, Eye, ArrowUp, ArrowDown } from "iconsax-react";
import TieuChiDanhGiaView from "./TieuChiDanhGiaView";
import { formatDate_getDate } from "utils/formatTime";
import ScrollX from "components/ScrollX";

function TieuChiDanhGiaList() {
  const columns = useMemo(
    () => [
      {
        Header: "Actions",
        Footer: "Actions",
        accessor: "Actions",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? (
            <Add style={{ transform: "rotate(45deg)" }} />
          ) : (
            <Eye />
          );

          return (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0}
            >
              <UpdateTieuChiDanhGiaButton tieuChi={row.original} />
              <DeleteTieuChiDanhGiaButton tieuChiId={row.original._id} />
              <Tooltip title="Xem nhanh">
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleRowExpanded();
                  }}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip>
            </Stack>
          );
        },
      },
      {
        Header: "Tên tiêu chí",
        Footer: "Tên tiêu chí",
        accessor: "TenTieuChi",
        disableGroupBy: true,
      },
      {
        Header: "Loại",
        Footer: "Loại",
        accessor: "LoaiTieuChi",
        disableGroupBy: true,
        Cell: ({ value, row }) => (
          <Stack direction="row" spacing={1} alignItems="center">
            {value === "TANG_DIEM" ? (
              <ArrowUp size={16} color="#10B981" />
            ) : (
              <ArrowDown size={16} color="#EF4444" />
            )}
            <Chip
              label={value === "TANG_DIEM" ? "Tăng điểm" : "Giảm điểm"}
              color={value === "TANG_DIEM" ? "success" : "error"}
              size="small"
            />
          </Stack>
        ),
      },
      {
        Header: "Giá trị Min",
        Footer: "Giá trị Min",
        accessor: "GiaTriMin",
        disableGroupBy: true,
        Cell: ({ value }) => value?.toFixed(1) || "0",
      },
      {
        Header: "Giá trị Max",
        Footer: "Giá trị Max",
        accessor: "GiaTriMax",
        disableGroupBy: true,
        Cell: ({ value }) => value?.toFixed(1) || "10",
      },
      {
        Header: "Mô tả",
        Footer: "Mô tả",
        accessor: "MoTa",
        disableGroupBy: true,
        Cell: ({ value }) =>
          value?.length > 50
            ? `${value.substring(0, 50)}...`
            : value || "Không có mô tả",
      },
      {
        Header: "Trạng thái",
        Footer: "Trạng thái",
        accessor: "TrangThaiHoatDong",
        disableGroupBy: true,
        Cell: ({ value }) => (
          <Chip
            label={value ? "Hoạt động" : "Tạm dừng"}
            color={value ? "success" : "default"}
            size="small"
          />
        ),
      },
      {
        Header: "Ngày tạo",
        Footer: "Ngày tạo",
        accessor: "createdAt",
        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
    ],
    []
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getTieuChiDanhGias());
  }, [dispatch]);

  const { tieuChiDanhGias } = useSelector((state) => state.kpi);

  // Chỉ hiển thị tiêu chí chưa bị xóa (isDeleted = false)
  const data = useMemo(
    () => tieuChiDanhGias.filter((item) => !item.isDeleted),
    [tieuChiDanhGias]
  );
  const renderRowSubComponent = useCallback(
    ({ row }) => <TieuChiDanhGiaView data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý Tiêu chí Đánh giá KPI">
          <ScrollX sx={{ height: 670 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddTieuChiDanhGiaButton />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default TieuChiDanhGiaList;
