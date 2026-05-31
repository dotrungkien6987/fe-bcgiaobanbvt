import React, { useEffect, useMemo } from "react";
import { Grid, Stack, IconButton, Tooltip } from "@mui/material";
import MainCard from "components/MainCard";
import SimpleTable from "pages/tables/MyTable/SimpleTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllLoaiChuyenMon, deleteLoaiChuyenMon } from "./loaiChuyenMonSlice";
import AddLoaiChuyenMonButton from "./AddLoaiChuyenMonButton";
import UpdateLoaiChuyenMonButton from "./UpdateLoaiChuyenMonButton";
import DeleteIcon from "@mui/icons-material/Delete";
import useAuth from "hooks/useAuth";

export default function LoaiChuyenMonTable() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.loaichuyenmon);
  const { user } = useAuth();
  const canManage = ["admin", "superadmin", "daotao"].includes(
    (user?.PhanQuyen || "").toLowerCase(),
  );

  useEffect(() => {
    dispatch(getAllLoaiChuyenMon());
  }, [dispatch]);

  const data = useMemo(() => list, [list]);

  const columns = useMemo(() => {
    const baseColumns = [
      { Header: "Loại", accessor: "LoaiChuyenMon" },
      { Header: "Trình độ", accessor: "TrinhDo" },
      {
        Header: "Ngày tạo",
        accessor: "createdAt",
        Cell: ({ value }) => new Date(value).toLocaleDateString("vi-VN"),
      },
    ];

    if (!canManage) {
      return baseColumns;
    }

    return [
      {
        Header: "Action",
        accessor: "_id",
        Cell: ({ row }) => (
          <Stack direction="row" spacing={0}>
            <UpdateLoaiChuyenMonButton row={row.original} />
            <Tooltip title="Xóa">
              <IconButton
                color="error"
                onClick={() => dispatch(deleteLoaiChuyenMon(row.original._id))}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
      ...baseColumns,
    ];
  }, [canManage, dispatch]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Loại chuyên môn">
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={canManage ? <AddLoaiChuyenMonButton /> : null}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
