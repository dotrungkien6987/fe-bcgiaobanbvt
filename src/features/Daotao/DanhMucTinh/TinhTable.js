import {
  
  Grid,
  Stack,
 
} from "@mui/material";
import MainCard from "components/MainCard";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import UpdateNhomHinhThucButton from "./UpdateTinhButton";
import DeleteDataFixButton from "../DeleteDataFixButton";
import AddTrinhDoChuyenMonButton from "./AddTinhButton";
import UpdateTrinhDocChuyenMonButton from "./UpdateTinhButton";
import UpdateTinhButton from "./UpdateTinhButton";
import AddTinhButton from "./AddTinhButton";

function TinhTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const { Tinh } = useSelector(
    (state) => state.nhanvien
  );

  const data = useMemo(() => Tinh, [Tinh]);

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
            <UpdateTinhButton index={row.original.index} />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField="Tinh"
              datafixTitle="Danh mục tỉnh"
            />
          </Stack>
        ),
      },

      {
        Header: "Tên tỉnh",
        Footer: "Tên tỉnh",

        accessor: "TenTinh",
        disableGroupBy: true,
      },
      {
        Header: "Mã tỉnh",
        Footer: "Mã tỉnh",

        accessor: "MaTinh",
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
          title={`Danh mục tỉnh`}
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddTinhButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default TinhTable;
