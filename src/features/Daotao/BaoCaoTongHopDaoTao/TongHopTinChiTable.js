import { Grid, Stack } from "@mui/material";

import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

import CommonTable from "pages/tables/MyTable/CommonTable";

import NhanVienView from "features/NhanVien/NhanVienView";
import { formatDate_getDate } from "utils/formatTime";
import QuaTrinhDaoTaoNhanVienButon from "features/NhanVien/QuaTrinhDaoTaoNhanVienButon";
import ScrollX from "components/ScrollX";
import TypeTongHopRadioGroup from "./TypeTongHopRadioGroup";

function TongHopTinChiTable({ giatricanhbao,titleExcell ='Tổng hợp số liệu',titleKhuyenCao ='' }) {
  const columns = useMemo(
    () => [
      {
        Header: "Actions",
        Footer: "Actions",
        accessor: "Actions",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => {
          // const collapseIcon = row.isExpanded ? (
          //   <Add
          //     style={{
          //       // color: theme.palette.error.main,
          //       transform: "rotate(45deg)",
          //     }}
          //   />
          // ) : (
          //   <Eye />
          // );
          return (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0}
            >
              <QuaTrinhDaoTaoNhanVienButon nhanvienID={row.original._id} />
              {/* <Tooltip
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor:
                        mode === ThemeMode.DARK
                          ? theme.palette.grey[50]
                          : theme.palette.grey[700],
                      opacity: 0.9,
                    },
                  },
                }}
                title="Xem nhanh"
              >
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    row.toggleRowExpanded();
                  }}
                >
                  {collapseIcon}
                </IconButton>
              </Tooltip> */}
            </Stack>
          );
        },
      },
      {
        Header: "Khoa công tác",
        Footer: "Khoa",
        accessor: "TenKhoa",
        minWidth: 200,
        // filter: 'fuzzyText',
        disableGroupBy: true,
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
        Header: "Họ và Tên",
        Footer: "Họ và Tên",

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
        Header: "Dân tộc",
        Footer: "Dân tộc",

        accessor: "DanToc",
        disableGroupBy: true,
      },
      {
        Header: "Phạm vi hành nghề",
        Footer: "Phạm vi hành nghề",

        accessor: "PhamViHanhNghe",
        disableGroupBy: true,
      },
      {
        Header: "Số CCHN",
        Footer: "Số CCHN",

        accessor: "SoCCHN",
        disableGroupBy: true,
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
        Header: "Tổng tín chỉ",
        Footer: "Tổng tín chỉ",
        accessor: "totalSoTinChiTichLuy",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Khuyến cáo",
        Footer: "Khuyến cáo",
        accessor: "Dat",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Tham gia ĐT07",
        Footer: "Chức danh",
        accessor: "ĐT07",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Tham gia ĐT08",
        Footer: "Tham gia ĐT08",
        accessor: "ĐT08",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },

      // {
      //   Header: "Phạm vi hành nghề",
      //   Footer: "Phạm vi hành nghề",
      //   accessor: "PhamViHanhNghe",
      //   dataType: "text",
      //   filter: "fuzzyText",
      //   disableGroupBy: true,
      // },
      // {
      //   Header: "Điện thoại",
      //   Footer: "Điện thoại",

      //   accessor: "SoDienThoai",
      //   disableGroupBy: true,
      // },

      // {
      //   Header: "_id",
      //   Footer: "_id",

      //   accessor: "NhanVienID",
      //   disableGroupBy: true,
      // },
    ],
    []
  );

  const columnsExcell = [
    {
      header: "Khoa công tác",
      key: "TenKhoa",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:20,
    },
    {
      header: "Mã NV",
      key: "MaNhanVien",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:10,
    },
    {
      header: "Họ và Tên",
      key: "Ten",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:25,
    },

    {
      header: "Ngày sinh",
      key: "NgaySinh",
      alignment: { horizontal: "left" },
      font: { bold: false },
      format: (value) => new Date(value).toLocaleDateString('vi-VN'),
      width:15,
    },

    {
      header: "Dân tộc",
      key: "DanToc",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:10,
    },
    {
      header: "Phạm vi hành nghề",
      key: "PhamViHanhNghe",
      alignment: { horizontal: "left" },
      font: { bold: false },
    },
    {
      header: "Số CCHN",
      key: "SoCCHN",
      alignment: { horizontal: "left" },
      font: { bold: false },
    },

    {
      header: "Trình độ chuyên môn",
      key: "TrinhDoChuyenMon",
      alignment: { horizontal: "left" },
      font: { bold: false },
    },
    {
      header: "Tổng tín chỉ",
      key: "totalSoTinChiTichLuy",
      alignment: { horizontal: "left" },
      font: { bold: false },
      width:15,
    },
    {
      header: "Đạt KC",
      key: "Dat",
      alignment: { horizontal: "left" },
      font: { bold: false },
      format: (value) => value?'Có':'Không',
      width:10,
    },
  ];
  const { tonghoptinchitichluys,typeTongHop } = useSelector((state) => state.nhanvien);

  // const data = useMemo(() => tonghoptinchitichluys, [tonghoptinchitichluys]);

  const data = useMemo(() => {
    if (typeTongHop === 1) {
      // Trả về những nhân viên có Dat === true
      return tonghoptinchitichluys.filter((item) => item.Dat === true);
    } else if (typeTongHop === 2) {
      // Trả về những nhân viên có Dat === false
      return tonghoptinchitichluys.filter((item) => item.Dat === false);
    } else {
      // Trả về tất cả nhân viên
      return tonghoptinchitichluys;
    }
  }, [tonghoptinchitichluys, typeTongHop]);

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
            giatricanhbao={giatricanhbao}
            titleExcell={[titleExcell,titleKhuyenCao]}
            columnsExcell={columnsExcell}
            fileNameExcell={"TongHopTinChi"}
            additionalComponent={<TypeTongHopRadioGroup/>}
          />
        </ScrollX>
      </Grid>
    </Grid>
  );
}

export default TongHopTinChiTable;
