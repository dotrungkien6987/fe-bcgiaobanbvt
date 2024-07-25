import { Grid, Stack } from "@mui/material";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import UmbrellaTable from "pages/tables/react-table/umbrella";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhanVienButton from "./UpdateNhanVienButton";
import DeleteNhanVienButton from "./DeleteNhanVienButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhanVienButton from "./AddNhanVienButton";
import ExcelButton from "components/ExcelButton";
import { getAllLopDaoTao } from "./daotaoSlice";
import AddLopDaoTao from "./AddLopDaoTao";
import { Delete } from "@mui/icons-material";
import DeleteLopDaoTaoButton from "./DeleteLopDaoTaoButton";
import UpdateLopDaoTaoButton from "./UpdateLopDaoTaoButton";

function LopDaoTaoTable() {
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
            <UpdateLopDaoTaoButton lopdaotaoID={row.original._id} />
            <DeleteLopDaoTaoButton lopdaotaoID={row.original._id} />
          </Stack>
        ),
      },
      {
        Header: "Mã hình thức",
        Footer: "Mã hình thức",
        accessor: "MaHinhThucCapNhat",
        className: "cell-center",
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: "Tên",
        Footer: "Tên",

        accessor: "Ten",
        disableGroupBy: true,
      },
      {
        Header: "Quyết định",
        Footer: "Quyết định",

        accessor: "QuyetDinh",
        
        disableGroupBy: true,
      },
      {
        Header: "Hình thức đào tạo",
        Footer: "Hình thức đào tạo",

        accessor: "HinhThucDaoTao",
        
        disableGroupBy: true,
      },
      {
        Header: "Ngày bắt đầu",
        Footer: "Ngày bắt đầu",

        accessor: "NgayBatDau",

        disableGroupBy: true,
        Cell: ({ value }) => new Date(value).toDateString(),
      },
      {
        Header: "Ngày kết thúc",
        Footer: "Ngày kết thúc",

        accessor: "NgayKetThuc",

        disableGroupBy: true,
        Cell: ({ value }) => new Date(value).toDateString(),
      },
      {
        Header: "Số section",
        Footer: "Số section",

        accessor: "SoLuong",
        disableGroupBy: true,
      },
      
    ],
    []
  );

  const dispatch = useDispatch();
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    dispatch(getAllLopDaoTao());
  }, [dispatch]);

  const { LopDaoTaos } = useSelector((state) => state.daotao);

  const data = useMemo(() => LopDaoTaos, [LopDaoTaos]);
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý lớp đào tạo">
          <CommonTable
            data={data}
            columns={columns}
            additionalComponent={
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              
              <AddLopDaoTao />
            </div>
          }
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default LopDaoTaoTable;
