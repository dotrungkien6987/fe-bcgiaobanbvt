import { Grid, Stack, Tooltip } from "@mui/material";
import { getAllNhomViecUser } from "./nhomViecUserSlice";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhomViecUserButton from "./UpdateNhomViecUserButton";
import DeleteNhomViecUserButton from "./DeleteNhomViecUserButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhomViecUserButton from "./AddNhomViecUserButton";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
import { Add, Eye } from "iconsax-react";
import NhomViecUserView from "./NhomViecUserView";
import { formatDate_getDate } from "utils/formatTime";
import ScrollX from "components/ScrollX";

function NhomViecUserList() {
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
              <UpdateNhomViecUserButton nhomViecUser={row.original} />
              <DeleteNhomViecUserButton nhomViecUserID={row.original._id} />
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
        Header: "Tên nhóm việc",
        Footer: "Tên nhóm việc",
        accessor: "TenNhom",
        disableGroupBy: true,
      },
      {
        Header: "Mô tả",
        Footer: "Mô tả",
        accessor: "MoTa",
        disableGroupBy: true,
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
        Cell: ({ value }) => (value ? "Hoạt động" : "Tạm dừng"),
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
    dispatch(getAllNhomViecUser());
  }, [dispatch]);

  const { nhomViecUsers } = useSelector((state) => state.nhomViecUser);
  const data = useMemo(() => nhomViecUsers, [nhomViecUsers]);

  const renderRowSubComponent = useCallback(
    ({ row }) => <NhomViecUserView data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý nhóm việc">
          <ScrollX sx={{ height: 670 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <ExcelButton />
                  <AddNhomViecUserButton />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhomViecUserList;
