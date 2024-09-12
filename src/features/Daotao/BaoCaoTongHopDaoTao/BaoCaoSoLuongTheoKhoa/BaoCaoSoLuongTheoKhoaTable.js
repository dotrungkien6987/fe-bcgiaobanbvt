import { Grid, Stack } from "@mui/material";

import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

import CommonTable from "pages/tables/MyTable/CommonTable";

import NhanVienView from "features/NhanVien/NhanVienView";
import { formatDate_getDate } from "utils/formatTime";
import QuaTrinhDaoTaoNhanVienButon from "features/NhanVien/QuaTrinhDaoTaoNhanVienButon";
import ScrollX from "components/ScrollX";


function BaoCaoSoLuongTheoKhoaTable({ giatricanhbao,titleExcell ='Tổng hợp số liệu',titleKhuyenCao ='' }) {
  const columns = useMemo(
    () => [
      
      {
        Header: "Khoa ",
        Footer: "Khoa",
        accessor: "TenKhoa",
        minWidth: 200,
        // filter: 'fuzzyText',
        disableGroupBy: true,
      },
      {
        Header: "Tổng số cán bộ",
        Footer: "Tổng số cán bộ",
        accessor: "totalNhanVien",
        className: "cell-center",
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: "Đạt khuyến cáo",
        Footer: "Đạt khuyến cáo",

        accessor: "countDatTrue",
        disableGroupBy: true,
      },

      {
        Header: "Chưa đạt khuyến cáo",
        Footer: "Chưa đạt khuyến cáo",

        accessor: "countDatFalse",

        disableGroupBy: true,
        
      },

    ],
    []
  );

  const columnsExcell = [
    {
      header: "Khoa ",
      key: "TenKhoa",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:50,
    },
    {
      header: "Tổng số cán bộ",
      key: "totalNhanVien",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:25,
    },
    {
      header: "Đạt khuyến cáo",
      key: "countDatTrue",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:25,
    },

    {
      header: "Chưa đạt khuyến cáo",
      key: "countDatFalse",
      alignment: { horizontal: "left" },
      font: { bold: false },
      
      width:25,
    },

  ];
  const { tonghopsoluongtheokhoa } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => tonghopsoluongtheokhoa, [tonghopsoluongtheokhoa]);

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <ScrollX sx={{ height: 670 }}>
          <CommonTable
            data={data}
            columns={columns}
            
            giatricanhbao={giatricanhbao}
            titleExcell={[titleExcell,titleKhuyenCao]}
            columnsExcell={columnsExcell}
            fileNameExcell={"TongHopSoLuongTheoKhoa"}
            
          />
        </ScrollX>
      </Grid>
    </Grid>
  );
}

export default BaoCaoSoLuongTheoKhoaTable;
