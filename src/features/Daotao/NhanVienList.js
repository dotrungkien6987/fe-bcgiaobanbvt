import { Grid, Stack, Tooltip, useTheme } from "@mui/material";

import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UpdateNhanVienButton from "./UpdateNhanVienButton";
import DeleteNhanVienButton from "./DeleteNhanVienButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import AddNhanVienButton from "./AddNhanVienButton";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
import { Add, Eye, Task } from "iconsax-react";
import { ThemeMode } from "configAble";
import NhanVienView from "features/NhanVien/NhanVienView";
import { formatDate_getDate } from "utils/formatTime";
import QuaTrinhDaoTaoNhanVienButon from "features/NhanVien/QuaTrinhDaoTaoNhanVienButon";
import QuanLyNhanVienButton from "features/QuanLyCongViec/QuanLyNhanVien/QuanLyNhanVienButton";
import ScrollX from "components/ScrollX";
function NhanVienList() {
  const theme = useTheme();
  const mode = theme.palette.mode;
  const navigate = useNavigate();
  const columns = useMemo(
    () => [
      {
        Header: "Actions",
        Footer: "Actions",
        accessor: "Actions",
        disableGroupBy: true,
        sticky: "left",
        Cell: ({ row }) => {
          const collapseIcon = row.isExpanded ? (
            <Add
              style={{
                // color: theme.palette.error.main,
                transform: "rotate(45deg)",
              }}
            />
          ) : (
            <Eye />
          );
          return (
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="center"
              spacing={0}
            >
              <UpdateNhanVienButton nhanvien={row.original} />
              <DeleteNhanVienButton nhanvienID={row.original._id} />
              <QuaTrinhDaoTaoNhanVienButon nhanvienID={row.original._id} />
              <QuanLyNhanVienButton nhanvienID={row.original._id} />
              <Tooltip
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
                title="Quản lý công việc"
              >
                <IconButton
                  color="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/quan-ly-cong-viec/nhan-vien/${row.original._id}`
                    );
                  }}
                >
                  <Task />
                </IconButton>
              </Tooltip>
              <Tooltip
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
                title="Giao nhiệm vụ"
              >
                <IconButton
                  color="secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(
                      `/quanlycongviec/giao-nhiem-vu/${row.original._id}`
                    );
                  }}
                >
                  <Eye />
                </IconButton>
              </Tooltip>
              <Tooltip
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
              </Tooltip>
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
        Header: "Giới tính",
        Footer: "Giới tính",

        accessor: "Sex",
        aggregate: "count",
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
        Header: "Số CMND/CCCD",
        Footer: "Số CMND/CCCD",
        accessor: "CMND",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Chức danh",
        Footer: "Chức danh",
        accessor: "ChucDanh",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Chức vụ",
        Footer: "Chức vụ",
        accessor: "ChucVu",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Dân tộc",
        Footer: "Dân tộc",
        accessor: "DanToc",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Số CCHN",
        Footer: "Số CCHN",
        accessor: "SoCCHN",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Ngày cấp CCHN",
        Footer: "Ngày cấp CCHN",

        accessor: "NgayCapCCHN",

        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Phạm vi hành nghề",
        Footer: "Phạm vi hành nghề",
        accessor: "PhamViHanhNghe",
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
      {
        Header: "_id",
        Footer: "_id",

        accessor: "_id",
        disableGroupBy: true,
      },
    ],
    [mode, theme.palette.grey, navigate]
  );

  const dispatch = useDispatch();
  const { nhanviens } = useSelector((state) => state.nhanvien);

  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    if (nhanviens.length === 0) dispatch(getAllNhanVien());
  }, [dispatch, nhanviens.length]);

  const data = useMemo(() => nhanviens, [nhanviens]);

  const renderRowSubComponent = useCallback(
    ({ row }) => <NhanVienView data={data[Number(row.id)]} />,
    [data]
  );
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý cán bộ">
          <ScrollX sx={{ height: 670 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <ExcelButton />
                  <AddNhanVienButton />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhanVienList;
