import { Grid, IconButton, Stack, Tooltip, useTheme } from "@mui/material";
import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import { getDoanRas } from "./doanraSlice";
import AddDoanRa from "./AddDoanRa";
import DeleteDoanRaButton from "./DeleteDoanRaButton";
import UpdateDoanRaButton from "./UpdateDoanRaButton";
import DoanRaView from "./DoanRaView";
import { Add, Eye } from "iconsax-react";
import ScrollX from "components/ScrollX";

function DoanRaTable() {
  const theme = useTheme();
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
              <DeleteDoanRaButton doanRaID={row.original._id} />
              <UpdateDoanRaButton doanRaID={row.original._id} />
              <Tooltip title="Xem chi tiết">
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
      { Header: "Ngày ký", accessor: "NgayKyVanBan", disableGroupBy: true },
      {
        Header: "Số văn bản",
        accessor: "SoVanBanChoPhep",
        disableGroupBy: true,
      },
      { Header: "Mục đích", accessor: "MucDichXuatCanh", disableGroupBy: true },
      {
        Header: "Thời gian xuất cảnh",
        accessor: "ThoiGianXuatCanh",
        disableGroupBy: true,
      },
      { Header: "Quốc gia đến", accessor: "QuocGiaDen", disableGroupBy: true },
      { Header: "Ghi chú", accessor: "GhiChu", disableGroupBy: true },
      { Header: "_id", accessor: "_id", disableGroupBy: true },
    ],
    []
  );

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDoanRas());
  }, [dispatch]);

  const { doanRas } = useSelector((state) => state.doanra);
  const data = useMemo(() => doanRas, [doanRas]);
  const renderRowSubComponent = useCallback(
    ({ row }) => <DoanRaView data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý Đoàn Ra">
          <ScrollX sx={{ height: 700 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddDoanRa />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default DoanRaTable;
