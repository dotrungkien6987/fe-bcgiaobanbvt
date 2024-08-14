import { Grid, Stack, Tooltip, useTheme } from "@mui/material";

import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import CommonTable from "pages/tables/MyTable/CommonTable";

import IconButton from "components/@extended/IconButton";
import { Add, Eye } from "iconsax-react";
import { ThemeMode } from "configAble";
import NhanVienView from "features/NhanVien/NhanVienView";
import { formatDate_getDate } from "utils/formatTime";
import QuaTrinhDaoTaoNhanVienButon from "features/NhanVien/QuaTrinhDaoTaoNhanVienButon";
import ScrollX from "components/ScrollX";
function TongHopTinChiTable() {
  const theme = useTheme();
  const mode = theme.palette.mode;
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
      // {
      //   Header: "Phân loại",
      //   Footer: "Phân loại",

      //   accessor: "Loai",
      //   disableGroupBy: true,
      // },
      {
        Header: "Khoa công tác",
        Footer: "Khoa",
        accessor: "TenKhoa",
        minWidth: 200,
        // filter: 'fuzzyText',
        disableGroupBy: true
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

  const dispatch = useDispatch();
  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    if (tonghoptinchitichluys.length === 0) dispatch(getAllNhanVien());
  }, [dispatch]);

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
             
            />
          </ScrollX>
       
      </Grid>
    </Grid>
  );
}

export default TongHopTinChiTable;
