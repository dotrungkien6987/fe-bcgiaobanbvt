import {
  Box,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import MainCard from "components/MainCard";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import AddDataFixButton from "./AddDataFixButton";
import DeleteDataFixButton from "./DeleteDataFixButton";
import UpdateDataFixButton from "./UpdateDataFixButton";
import { useParams } from "react-router-dom";
import AddNhomHinhThucButton from "./AddNhomHinhThucButton";
import UpdateNhomHinhThucButton from "./UpdateNhomHinhThucButton";

function NhomHinhThucTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const { NhomHinhThucCapNhat, datafix } = useSelector(
    (state) => state.nhanvien
  );

  const data = useMemo(() => NhomHinhThucCapNhat, [NhomHinhThucCapNhat]);

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
            <UpdateNhomHinhThucButton index={row.original.index} />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField="NhomHinhThucCapNhat"
              datafixTitle="Nhóm hình thúc cập nhật kiến thức y khoa liên tục"
            />
          </Stack>
        ),
      },

      {
        Header: "Loại",
        Footer: "Loại",

        accessor: "Loai",
        disableGroupBy: true,
      },
      {
        Header: "Mã nhóm",
        Footer: "Mã nhóm",

        accessor: "Ma",
        disableGroupBy: true,
      },
      {
        Header: "Tên nhóm",
        Footer: "Tên nhóm",

        accessor: "Ten",
        disableGroupBy: true,
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
        <MainCard
          title={`Danh mục Nhóm hình thức cập nhật kiến thức y khoa liên tục`}
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddNhomHinhThucButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhomHinhThucTable;
