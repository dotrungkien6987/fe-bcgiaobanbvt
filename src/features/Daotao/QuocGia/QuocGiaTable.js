import { Grid, Stack } from "@mui/material";
import MainCard from "components/MainCard";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import DeleteDataFixButton from "../DeleteDataFixButton";
import UpdateQuocGiaButton from "./UpdateQuocGiaButton";
import AddQuocGiaButton from "./AddQuocGiaButton";

function QuocGiaTable() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const { QuocGia } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => QuocGia, [QuocGia]);

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
            <UpdateQuocGiaButton index={row.original.index} />
            <DeleteDataFixButton
              index={row.original.index}
              datafixField="QuocGia"
              datafixTitle="Danh mục quốc gia"
            />
          </Stack>
        ),
      },

      {
        Header: "Mã quốc gia",
        Footer: "Mã quốc gia",

        accessor: "code",
        disableGroupBy: true,
      },
      {
        Header: "Tên quốc gia",
        Footer: "Tên quốc gia",

        accessor: "label",
        disableGroupBy: true,
      },
      {
        Header: "Mã điện thoại",
        Footer: "Mã điện thoại",

        accessor: "phone",
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
        <MainCard title={`Danh mục quốc gia`}>
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddQuocGiaButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default QuocGiaTable;
