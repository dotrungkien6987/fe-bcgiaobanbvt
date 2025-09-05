import React, { useEffect, useMemo } from "react";
import { Grid, Stack, IconButton, Tooltip } from "@mui/material";
import MainCard from "components/MainCard";
import SimpleTable from "pages/tables/MyTable/SimpleTable";
import { useDispatch, useSelector } from "react-redux";
import { getAllLoaiChuyenMon, deleteLoaiChuyenMon } from "./loaiChuyenMonSlice";
import AddLoaiChuyenMonButton from "./AddLoaiChuyenMonButton";
import UpdateLoaiChuyenMonButton from "./UpdateLoaiChuyenMonButton";
import DeleteIcon from "@mui/icons-material/Delete";

export default function LoaiChuyenMonTable() {
  const dispatch = useDispatch();
  const { list } = useSelector((state) => state.loaichuyenmon);

  useEffect(() => {
    dispatch(getAllLoaiChuyenMon());
  }, [dispatch]);

  const data = useMemo(() => list, [list]);

  const columns = useMemo(
    () => [
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
      { Header: "Loại", accessor: "LoaiChuyenMon" },
      { Header: "Trình độ", accessor: "TrinhDo" },
      {
        Header: "Ngày tạo",
        accessor: "createdAt",
        Cell: ({ value }) => new Date(value).toLocaleDateString("vi-VN"),
      },
    ],
    [dispatch]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Loại chuyên môn">
          <SimpleTable
            data={data}
            columns={columns}
            additionalComponent={<AddLoaiChuyenMonButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}
