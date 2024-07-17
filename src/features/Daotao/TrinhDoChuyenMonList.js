import { Grid, Stack } from "@mui/material";
import { getAllNhanVien, getDataFix } from "features/NhanVien/nhanvienSlice";
import UmbrellaTable from "pages/tables/react-table/umbrella";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhanVienButton from "./UpdateNhanVienButton";
import DeleteNhanVienButton from "./DeleteNhanVienButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhanVienButton from "./AddNhanVienButton";
import ExcelButton from "components/ExcelButton";

function TrinhDoChuyenMonList() {
  const columns = useMemo(
    () => [
      {
        Header: "_id",
        Footer: "Action",
        accessor: "_id",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={0}
          >
            <UpdateNhanVienButton nhanvien={row.original} />
            <DeleteNhanVienButton nhanvienID={row.original._id} />
          </Stack>
        ),
      },
      
      {
        Header: "DonVi",
        Footer: "DonVi",

        accessor: "Đơn vị",
        disableGroupBy: true,
      },
    ],
    []
  );

  const dispatch = useDispatch();
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    dispatch(getDataFix());
  }, [dispatch]);

  const { datafix } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => datafix.TrinhDoChuyenMon, [datafix]);
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Danh mục trình độ chuyên môn">
          <CommonTable
            data={data}
            columns={columns}
            additionalComponent={
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              
              <AddNhanVienButton />
            </div>
          }
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default TrinhDoChuyenMonList;
