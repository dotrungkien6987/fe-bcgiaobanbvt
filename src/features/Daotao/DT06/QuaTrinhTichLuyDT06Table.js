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
import UpdateQuaTrinhDT06Button from "./UpdateQuaTrinhDT06Button";
import DeleteQuaTrinhDT06Button from "./DeleteQuaTrinhDT06Button";
import useAuth from "hooks/useAuth";

function QuaTrinhTichLuyDT06Table() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { lopdaotaoCurrent } = useSelector((state) => state.daotao);
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
            <UpdateQuaTrinhDT06Button quatrinhDT06={row.original} />
            <DeleteQuaTrinhDT06Button quatrinhdt06ID={row.original._id} />
          </Stack>
        ),
      },

      {
        Header: "Từ ngày",
        Footer: "Từ ngày",

        accessor: "TuNgayFormat",
        disableGroupBy: true,
      },
      {
        Header: "Đến ngày",
        Footer: "Đến ngày",

        accessor: "DenNgayFormat",
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
      {hocviendt06Current._id && (
        <Grid item xs={12} lg={12}>
          <NhanVienViewDT06 data={hocviendt06Current} />
        </Grid>
      )}

      <Grid item xs={12} lg={12}>
        <MainCard title={`Quá trình tích lũy tín chỉ đào tạo trong khóa`}>
          {user?._id === lopdaotaoCurrent.UserIDCreated ? (
            <SimpleTable
              data={data}
              columns={columns}
              additionalComponent={<AddQuaTrinhDT06 />}
            />
          ) : (
            <SimpleTable data={data} columns={columns} />
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default QuaTrinhTichLuyDT06Table;
