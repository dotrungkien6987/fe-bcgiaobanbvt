import { Grid, Stack } from "@mui/material";
import MainCard from "components/MainCard";
import SimpleTable from "pages/tables/MyTable/SimpleTable";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllNhomKhoa } from "../../Slice/nhomkhoasothutuSlice";
import AddNhomKhoaButton from "./AddNhomKhoaButton";
import UpdateNhomKhoaButton from "./UpdateNhomKhoaButton";
import DeleteNhomKhoaButton from "./DeleteNhomKhoaButton";

function NhomKhoaSoThuTuTable() {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getAllNhomKhoa());
  }, [dispatch]);
  
  const { nhomKhoaList, isLoading } = useSelector((state) => state.nhomKhoaSoThuTu);
  
  const data = useMemo(() => nhomKhoaList, [nhomKhoaList]);

  // Hàm chuyển đổi danh sách khoa thành chuỗi hiển thị
  const formatKhoaList = (danhSachKhoa) => {
    if (!danhSachKhoa || danhSachKhoa.length === 0) return "Không có khoa nào";
    
    return danhSachKhoa
      .map(item => item.KhoaID?.TenKhoa || "Không xác định")
      .join(", ");
  };

  const columns = useMemo(
    () => [
      {
        Header: "Thao tác",
        Footer: "Thao tác",
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
            <UpdateNhomKhoaButton nhomKhoa={row.original} />
            <DeleteNhomKhoaButton nhomKhoaID={row.original._id} />
          </Stack>
        ),
      },
      {
        Header: "Tên nhóm",
        Footer: "Tên nhóm",
        accessor: "TenNhom",
        disableGroupBy: true,
      },
      {
        Header: "Danh sách khoa",
        Footer: "Danh sách khoa",
        accessor: "DanhSachKhoa",
        disableGroupBy: true,
        Cell: ({ value }) => formatKhoaList(value)
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
      <Grid item xs={12} lg={12}>
        <MainCard title="Danh mục nhóm khoa số thứ tự">
          <SimpleTable
            data={data}
            columns={columns}
            isLoading={isLoading}
            additionalComponent={<AddNhomKhoaButton />}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhomKhoaSoThuTuTable;