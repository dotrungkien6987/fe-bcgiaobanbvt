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
import UpdateXaButton from "./UpdateXaButton";
import AddXaButton from "./AddXaButton";

function XaTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const { Xa } = useSelector(
    (state) => state.nhanvien
  );

  const data = useMemo(() => Xa, [Xa]);

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
            <UpdateXaButton index={row.original.index} />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField="Xa"
              datafixTitle="Danh mục xã"
            />
          </Stack>
        ),
      },
      
      {
        Header: "Tên xã",
        Footer: "Tên xã",

        accessor: "TenXa",
        disableGroupBy: true,
      },
      {
        Header: "Mã xã",
        Footer: "Mã xã",

        accessor: "MaXa",
        disableGroupBy: true,
      },
      {
        Header: "Mã tỉnh",
        Footer: "Mã tỉnh",

        accessor: "MaTinh",
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
          title={`Danh mục xã`}
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddXaButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default XaTable;
