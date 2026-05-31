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
import { useAuth } from "contexts/AuthContext";
import { getDataFix } from "features/NhanVien/nhanvienSlice";
import SimpleTable from "pages/tables/MyTable/SimpleTable";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import DeleteDataFixButton from "./DeleteDataFixButton";
import AddNhomHinhThucButton from "./AddNhomHinhThucButton";
import UpdateNhomHinhThucButton from "./UpdateNhomHinhThucButton";

function NhomHinhThucTable() {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const canManageDataFix = ["admin", "superadmin"].includes(
    (user?.PhanQuyen || "").toLowerCase(),
  );

  useEffect(() => {
    dispatch(getDataFix());
  }, [dispatch]);
  const { NhomHinhThucCapNhat } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => NhomHinhThucCapNhat, [NhomHinhThucCapNhat]);

  const columns = useMemo(
    () => [
      ...(canManageDataFix
        ? [
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
          ]
        : []),

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
    [canManageDataFix],
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
            additionalComponent={
              canManageDataFix ? <AddNhomHinhThucButton /> : null
            }
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhomHinhThucTable;
