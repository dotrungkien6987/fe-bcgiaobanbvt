import { Grid, Stack, Tooltip, Chip } from "@mui/material";
import { getAllNhiemVuThuongQuy } from "./nhiemvuThuongQuySlice";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhiemVuThuongQuyButton from "./UpdateNhiemVuThuongQuyButton";
import DeleteNhiemVuThuongQuyButton from "./DeleteNhiemVuThuongQuyButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhiemVuThuongQuyButton from "./AddNhiemVuThuongQuyButton";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
import { Add, Eye } from "iconsax-react";
import NhiemVuThuongQuyView from "./NhiemVuThuongQuyView";
import { formatDate_getDate } from "utils/formatTime";
import ScrollX from "components/ScrollX";

function NhiemVuThuongQuyList() {
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
              <UpdateNhiemVuThuongQuyButton nhiemvuThuongQuy={row.original} />
              <DeleteNhiemVuThuongQuyButton
                nhiemvuThuongQuyID={row.original._id}
              />
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
        Header: "Tên nhiệm vụ",
        Footer: "Tên nhiệm vụ",
        accessor: "TenNhiemVu",
        disableGroupBy: true,
      },
      {
        Header: "Khoa",
        Footer: "Khoa",
        accessor: "KhoaID.TenKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Độ khó mặc định",
        Footer: "Độ khó mặc định",
        accessor: "MucDoKhoDefault",
        disableGroupBy: true,
        Cell: ({ value }) => `${value || "NA"}/10`,
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
        Header: "Người tạo",
        Footer: "Người tạo",
        accessor: "NguoiTaoID.HoTen",
        disableGroupBy: true,
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
    dispatch(getAllNhiemVuThuongQuy());
  }, [dispatch]);

  const { nhiemVuThuongQuys } = useSelector((state) => state.nhiemvuThuongQuy);
  const data = useMemo(() => nhiemVuThuongQuys, [nhiemVuThuongQuys]);

  const renderRowSubComponent = useCallback(
    ({ row }) => <NhiemVuThuongQuyView data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý Nhiệm vụ Thường quy">
          <ScrollX sx={{ height: 670 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <ExcelButton />
                  <AddNhiemVuThuongQuyButton />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhiemVuThuongQuyList;
