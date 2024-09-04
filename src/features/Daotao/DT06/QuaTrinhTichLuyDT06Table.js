import { Grid, Stack } from "@mui/material";
import MainCard from "components/MainCard";

import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import AddHinhThucButton from "../AddHinhThucButton";
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import UpdateHinhThucButton from "../UpdateHinhThucButton";
import DeleteHinhThucButton from "../DeleteHinhThucButton";
import AddQuaTrinhDT06 from "./AddQuaTrinhDT06";
import NhanVienViewDT06 from "features/NhanVien/NhanVienViewDT06";

function QuaTrinhTichLuyDT06Table() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getAllHinhThucCapNhat());
  }, [dispatch]);
  const { quatrinhdt06, hocviendt06Current } = useSelector(
    (state) => state.daotao
  );

  const data = useMemo(() => quatrinhdt06, [quatrinhdt06]);

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
        Header: "Từ ngày",
        Footer: "Từ ngày",

        accessor: "TuNgay",
        disableGroupBy: true,
      },
      {
        Header: "Đến ngày",
        Footer: "Đến ngày",

        accessor: "DenNgay",
        disableGroupBy: true,
      },
      {
        Header: "Tín chỉ tích lũy",
        Footer: "Tín chỉ tích lũy",

        accessor: "SoTinChiTichLuy",
        disableGroupBy: true,
      },
      {
        Header: "Ghi chú",
        Footer: "Ghi chú",

        accessor: "GhiChu",
        disableGroupBy: true,
      },
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      
      {hocviendt06Current.NhanVienID && (
        <Grid item xs={12} lg={12}>
          <NhanVienViewDT06 data={hocviendt06Current.NhanVienID} />
        </Grid>
      )}
      
      <Grid item xs={12} lg={12}>
        <MainCard title={`Quá trình tích lũy tín chỉ đào tạo trong khóa`}>
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddQuaTrinhDT06 />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default QuaTrinhTichLuyDT06Table;
