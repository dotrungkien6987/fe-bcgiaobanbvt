import {
  
  Grid,
  Stack,
 
} from "@mui/material";
import MainCard from "components/MainCard";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import UpdateNhomHinhThucButton from "./UpdateTrinhDocChuyenMonButton";
import DeleteDataFixButton from "../DeleteDataFixButton";
import AddTrinhDoChuyenMonButton from "./AddTrinhDoChuyenMonButton";
import UpdateTrinhDocChuyenMonButton from "./UpdateTrinhDocChuyenMonButton";

function TrinhDoChuyenMonTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const { TrinhDoChuyenMon } = useSelector(
    (state) => state.nhanvien
  );

  const data = useMemo(() => TrinhDoChuyenMon, [TrinhDoChuyenMon]);

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
            <UpdateTrinhDocChuyenMonButton index={row.original.index} />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField="TrinhDoChuyenMon"
              datafixTitle="Danh mục trình độ chuyên môn"
            />
          </Stack>
        ),
      },

      {
        Header: "Trình độ chuyên môn",
        Footer: "Trình độ chuyên môn",

        accessor: "TrinhDoChuyenMon",
        disableGroupBy: true,
      },
      {
        Header: "Quy đổi 1",
        Footer: "Quy đổi 1",

        accessor: "QuyDoi1",
        disableGroupBy: true,
      },
      {
        Header: "Quy đổi 2",
        Footer: "Quy đổi 2",

        accessor: "QuyDoi2",
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
          title={`Danh mục trình độ chuyên môn`}
        >
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddTrinhDoChuyenMonButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default TrinhDoChuyenMonTable;
