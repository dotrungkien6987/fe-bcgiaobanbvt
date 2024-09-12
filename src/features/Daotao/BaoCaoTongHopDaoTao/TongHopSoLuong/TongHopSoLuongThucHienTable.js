import { Grid, Stack } from "@mui/material";

import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

import CommonTable from "pages/tables/MyTable/CommonTable";

import NhanVienView from "features/NhanVien/NhanVienView";
import { formatDate_getDate } from "utils/formatTime";
import QuaTrinhDaoTaoNhanVienButon from "features/NhanVien/QuaTrinhDaoTaoNhanVienButon";
import ScrollX from "components/ScrollX";
import TypeTongHopRadioGroup from "../TypeTongHopRadioGroup";


function TongHopSoLuongThucHienTable({ titleExcell ='Tổng hợp số liệu',titleKhuyenCao ='' }) {
  const columns = useMemo(
    () => [
      
      {
        Header: "Mã hình thức",
        Footer: "Mã hình thức",
        accessor: "MaHinhThucCapNhat",
        minWidth: 200,
        // filter: 'fuzzyText',
        disableGroupBy: true,
      },
      {
        Header: "Tên hình thức",
        Footer: "Tên hình thức",
        accessor: "Ten",
        className: "cell-center",
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: "Tổng số nội dung",
        Footer: "Tổng số nội dung",

        accessor: "lopDaoTaoCount",
        disableGroupBy: true,
      },

      {
        Header: "Tổng số thành viên",
        Footer: "Tổng số thành viên",

        accessor: "totalSoThanhVien",

        disableGroupBy: true,
        
      },

    ],
    []
  );

  const columnsExcell = [
    {
      header: "Mã hình thức",
      key: "MaHinhThucCapNhat",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:20,
    },
    {
      header: "Tên hình thức",
      key: "Ten",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:80,
    },
    {
      header: "Tổng số nội dung",
      key: "lopDaoTaoCount",
      alignment: { horizontal: "center" },
      font: { bold: false },
      width:25,
    },

    {
      header: "Tổng số thành viên",
      key: "totalSoThanhVien",
      alignment: { horizontal: "center" },
      font: { bold: false },
      
      width:20,
    },

  ];
  const { tonghopsoluong } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => tonghopsoluong, [tonghopsoluong]);

  const renderRowSubComponent = useCallback(
    ({ row }) => <NhanVienView data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <ScrollX sx={{ height: 670 }}>
          <CommonTable
            data={data}
            columns={columns}
            renderRowSubComponent={renderRowSubComponent}
            
            titleExcell={[titleExcell,titleKhuyenCao]}
            columnsExcell={columnsExcell}
            fileNameExcell={"TongHopSoLuongHinhThucCapNhat"}
            
          />
        </ScrollX>
      </Grid>
    </Grid>
  );
}

export default TongHopSoLuongThucHienTable;
