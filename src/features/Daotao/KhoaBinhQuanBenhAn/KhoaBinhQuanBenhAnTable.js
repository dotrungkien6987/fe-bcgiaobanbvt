import { Grid, Stack, Chip } from "@mui/material";
import MainCard from "components/MainCard";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import DeleteDataFixButton from "../DeleteDataFixButton";
import UpdateKhoaBinhQuanBenhAnButton from "./UpdateKhoaBinhQuanBenhAnButton";
import AddKhoaBinhQuanBenhAnButton from "./AddKhoaBinhQuanBenhAnButton";

function KhoaBinhQuanBenhAnTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);

  const { KhoaBinhQuanBenhAn } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => KhoaBinhQuanBenhAn, [KhoaBinhQuanBenhAn]);

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
            <UpdateKhoaBinhQuanBenhAnButton index={row.original.index} />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField="KhoaBinhQuanBenhAn"
              datafixTitle="Danh mục khoa bình quân bệnh án"
            />
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
        Header: "Mã khoa (KhoaID)",
        Footer: "Mã khoa (KhoaID)",
        accessor: "KhoaID",
        disableGroupBy: true,
      },
      {
        Header: "Loại khoa",
        Footer: "Loại khoa",
        accessor: "LoaiKhoa",
        disableGroupBy: true,
        Cell: ({ value }) => (
          <Chip
            label={
              value === "noitru"
                ? "Nội trú"
                : value === "ngoaitru"
                ? "Ngoại trú"
                : value || "Chưa xác định"
            }
            color={
              value === "noitru"
                ? "primary"
                : value === "ngoaitru"
                ? "success"
                : "default"
            }
            size="small"
          />
        ),
      },
      {
        Header: "Index",
        Footer: "Index",
        accessor: "index",
        disableGroupBy: true,
      },
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title={`Danh mục khoa bình quân bệnh án`}>
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddKhoaBinhQuanBenhAnButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default KhoaBinhQuanBenhAnTable;
