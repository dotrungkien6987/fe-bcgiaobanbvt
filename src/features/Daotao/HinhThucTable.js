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
import AddHinhThucButton from "./AddHinhThucButton";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import UpdateHinhThucButton from "./UpdateHinhThucButton";
import DeleteHinhThucButton from "./DeleteHinhThucButton";

function HinhThucTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllHinhThucCapNhat());
  }, [dispatch]);
  const { HinhThucCapNhat } = useSelector(
    (state) => state.hinhthuccapnhat
  );

  const data = useMemo(() => HinhThucCapNhat, [HinhThucCapNhat]);

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
              <UpdateHinhThucButton hinhthuccapnhat={row.original} />
              <DeleteHinhThucButton hinhthuccapnhatID={row.original._id} />
          </Stack>
        ),
      },

      {
        Header: "Mã nhóm",
        Footer: "Mã nhóm",

        accessor: "MaNhomHinhThucCapNhat",
        disableGroupBy: true,
      },
      {
        Header: "Loại",
        Footer: "Loại",

        accessor: "Loai",
        disableGroupBy: true,
      },
      {
        Header: "Mã Hình thức cập nhật",
        Footer: "Mã Hình thức cập nhật",

        accessor: "Ma",
        disableGroupBy: true,
      },
      {
        Header: "Tên hình thức cập nhật",
        Footer: "Tên hình thức cập nhật",

        accessor: "Ten",
        disableGroupBy: true,
      },
      {
        Header: "Tên theo bệnh viện",
        Footer: "Tên theo bệnh viện",

        accessor: "TenBenhVien",
        disableGroupBy: true,
      },
      
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard
          title={`Danh mục hình thức cập nhật kiến thức y khoa liên tục`}
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddHinhThucButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default HinhThucTable;
