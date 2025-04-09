import {
  
  Grid,
  Stack,
 
} from "@mui/material";
import MainCard from "components/MainCard";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import DeleteDataFixButton from "../DeleteDataFixButton";
import UpdateHuyenButton from "./UpdateHuyenButton";
import AddHuyenButton from "./AddHuyenButton";

function HuyenTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const { Huyen } = useSelector(
    (state) => state.nhanvien
  );

  const data = useMemo(() => Huyen, [Huyen]);

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
            <UpdateHuyenButton index={row.original.index} />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField="Huyen"
              datafixTitle="Danh mục huyện"
            />
          </Stack>
        ),
      },
      {
        Header: "Mã tỉnh",
        Footer: "Mã tỉnh",

        accessor: "MaTinh",
        disableGroupBy: true,
      },
      {
        Header: "Tên huyện",
        Footer: "Tên huyện",

        accessor: "TenHuyen",
        disableGroupBy: true,
      },
      {
        Header: "Mã huyện",
        Footer: "Mã huyện",

        accessor: "MaHuyen",
        disableGroupBy: true,
      },
      {
        Header: "Diện tích",
        Footer: "Diện tích",

        accessor: "DienTich",
        disableGroupBy: true,
      },
      {
        Header: "Dân số",
        Footer: "Dân số",

        accessor: "DanSo",
        disableGroupBy: true,
      },
      {
        Header: "Khoảng cách",
        Footer: "Khoảng cách",

        accessor: "KhoangCach",
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
          title={`Danh mục huyện`}
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddHuyenButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default HuyenTable;
