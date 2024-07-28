import { Grid, Stack } from "@mui/material";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import UmbrellaTable from "pages/tables/react-table/umbrella";
import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import UpdateNhanVienButton from "../UpdateNhanVienButton";
import DeleteNhanVienButton from "../DeleteNhanVienButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhanVienButton from "../AddNhanVienButton";
import ExcelButton from "components/ExcelButton";
import { IndeterminateCheckbox } from "components/third-party/ReactTable";
import SelectTable from "pages/tables/MyTable/SelectTable";

function SeLectHocVienTable({onSelectedRowsChange}) {
  const columns = useMemo(
    () => [
      {
        title: "Row Selection",
        id: "selection",
        Header: ({ getToggleAllPageRowsSelectedProps }) => (
          <IndeterminateCheckbox
            indeterminate
            {...getToggleAllPageRowsSelectedProps()}
          />
        ),
        Footer: "#",
        accessor: "selection",
        groupByBoundary: true,
        Cell: ({ row }) => (
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        ),
        disableSortBy: true,
        disableFilters: true,
        disableGroupBy: true,
        Aggregated: () => null,
      },

      {
        Header: "Mã NV",
        Footer: "Mã NV",
        accessor: "MaNhanVien",
        className: "cell-center",
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: "Họ Tên",
        Footer: "Họ Tên",

        accessor: "Ten",
        disableGroupBy: true,
      },
      {
        Header: "Giới tính",
        Footer: "Giới tính",

        accessor: "GioiTinh",
        aggregate: "count",
        // disableGroupBy: true,
      },
      {
        Header: "Ngày sinh",
        Footer: "Ngày sinh",

        accessor: "NgaySinh",

        disableGroupBy: true,
        Cell: ({ value }) => new Date(value).toDateString(),
      },
      {
        Header: "Phân loại",
        Footer: "Phân loại",

        accessor: "Loai",
        disableGroupBy: true,
      },
      // {
      //   Header: 'Khoa',
      //   Footer: 'Khoa',
      //   accessor: 'KhoaID',
      //   dataType: 'TenKhoa',
      //   filter: 'fuzzyText',
      //   disableGroupBy: true
      // },
      {
        Header: "Trình độ chuyên môn",
        Footer: "Trình độ chuyên môn",
        accessor: "TrinhDoChuyenMon",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Điện thoại",
        Footer: "Điện thoại",

        accessor: "SoDienThoai",
        disableGroupBy: true,
      },
      {
        Header: "Email",
        Footer: "Email",

        accessor: "Email",
        disableGroupBy: true,
      },
    ],
    []
  );

  const dispatch = useDispatch();
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    if (nhanviens.length === 0) dispatch(getAllNhanVien());
  }, [dispatch]);

  const { nhanviens } = useSelector((state) => state.nhanvien);
  const {hocvienCurrents} =useSelector((state)=>state.daotao)

  const data = useMemo(() => 
    nhanviens.filter(nhanvien => 
      !hocvienCurrents.some(hocvien => hocvien._id === nhanvien._id)
    ), 
    [nhanviens, hocvienCurrents]
  );
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý cán bộ">
          <SelectTable data={data} columns={columns} onSelectedRowsChange={onSelectedRowsChange}/>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default SeLectHocVienTable;
