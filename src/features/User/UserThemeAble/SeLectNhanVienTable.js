import { Grid } from "@mui/material";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";


import MainCard from "components/MainCard";

import { IndeterminateCheckbox } from "components/third-party/ReactTable";
import SelectTable from "pages/tables/MyTable/SelectTable";
import { formatDate_getDate } from "utils/formatTime";

function SeLectNhanVienTable({onSelectedRowsChange}) {
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
        Header: "Ngày sinh",
        Footer: "Ngày sinh",

        accessor: "NgaySinh",

        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Phạm vi hành nghề",
        Footer: "Phạm vi hành nghề",

        accessor: "PhamViHanhNghe",
        disableGroupBy: true,
      },
      {
        Header: 'Tên khoa',
        Footer: 'Tên khoa',
        accessor: 'TenKhoa',
        
        filter: 'fuzzyText',
        disableGroupBy: true
      },
      {
        Header: "Giới tính",
        Footer: "Giới tính",

        accessor: "Sex",
        aggregate: "count",
        // disableGroupBy: true,
      },
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
        Header: "Dân tộc",
        Footer: "Dân tộc",

        accessor: "DanToc",
        disableGroupBy: true,
      },
    ],
    []
  );

  const dispatch = useDispatch();
  const { nhanviens } = useSelector((state) => state.nhanvien);
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    
    if (nhanviens.length === 0) dispatch(getAllNhanVien());
  }, []);

  
  const data = useMemo(() => 
    nhanviens, 
    [nhanviens]
  );
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Danh sách cán bộ">
          <SelectTable data={data} columns={columns} onSelectedRowsChange={onSelectedRowsChange}/>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default SeLectNhanVienTable;
