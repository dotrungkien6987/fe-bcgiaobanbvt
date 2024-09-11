import { Grid, Stack } from "@mui/material";

import React, { useCallback, useMemo } from "react";
import { useSelector } from "react-redux";

import CommonTable from "pages/tables/MyTable/CommonTable";

import NhanVienView from "features/NhanVien/NhanVienView";
import { formatDate_getDate } from "utils/formatTime";
import QuaTrinhDaoTaoNhanVienButon from "features/NhanVien/QuaTrinhDaoTaoNhanVienButon";
import ScrollX from "components/ScrollX";

function TongHopTinChiTable({ giatricanhbao }) {
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
      // {
      //   Header: "Chức danh",
      //   Footer: "Chức danh",
      //   accessor: "ChucDanh",
      //   dataType: "text",
      //   filter: "fuzzyText",
      //   disableGroupBy: true,
      // },
      // {
      //   Header: "Chức vụ",
      //   Footer: "Chức vụ",
      //   accessor: "ChucVu",
      //   dataType: "text",
      //   filter: "fuzzyText",
      //   disableGroupBy: true,
      // },

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
    },
    {
      header: "Mã NV",
      key: "MaNhanVien",
      alignment: { horizontal: "left" },
      font: { bold: false },
    },
    {
      header: "Họ và Tên",
      key: "Ten",
      alignment: { horizontal: "left" },
      font: { bold: false },
    },

    {
      header: "Ngày sinh",
      key: "NgaySinh",
      alignment: { horizontal: "left" },
      font: { bold: false },
    },

    {
      header: "Dân tộc",
      key: "DanToc",
      alignment: { horizontal: "left" },
      font: { bold: false },
    },
    {
      header: "Phạm vi hành nghề",
      key: "PhamViHanhNghe",
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
    },
  ];
  const { tonghoptinchitichluys } = useSelector((state) => state.nhanvien);

  const data = useMemo(() => tonghoptinchitichluys, [tonghoptinchitichluys]);

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
            titleExcell={"Tổng hợp tín chỉ tích lũy theo nhân viên"}
            columnsExcell={columnsExcell}
            fileNameExcell={"TongHopTinChi"}
          />
        </ScrollX>
      </Grid>
    </Grid>
  );
}

export default TongHopTinChiTable;
