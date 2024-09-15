import { Grid, IconButton, Stack, Tooltip, useTheme } from "@mui/material";

import React, { useCallback,  useMemo } from "react";


import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";

import { Add, Eye } from "iconsax-react";

import TrangThaiLopDaoTao from "features/Daotao/TrangThaiLopDaoTao";
import { ThemeMode } from "configAble";

import DiemDanhLopDaoTaoButton from "features/Daotao/DiemDanhLopDaoTaoButton";
import { formatDate_getDate } from "utils/formatTime";
import LopDaoTaoView from "./LopDaoTaoView";
import UploadLopDaoTaoNhanVienButton from "features/Daotao/UploadAnhChoHocVien/UploadLopDaoTaoNhanVienButton";
import ImagesUploadChip from "features/Daotao/UploadAnhChoHocVien/ImagesUploadChip";

import { useDispatch, useSelector } from "react-redux";
import { setOpenUploadLopDaoTaoNhanVien } from "features/Daotao/daotaoSlice";
function DaoTaoTheoNhanVienTable({ LopDaoTaos,title }) {
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
              
              <DiemDanhLopDaoTaoButton lopdaotaoID={row.original._id} />
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
                title="View"
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
        Header: "Mã hình thức",
        Footer: "Mã hình thức",
        accessor: "MaHinhThucCapNhat",
        className: "cell-center",
        disableGroupBy: true,
        // sticky: 'left',
        // Cell: ({ value }) => <Avatar alt="Avatar 1" size="sm" src={avatarIma(`./avatar-${!value ? 1 : value}.png`)} />
      },
      {
        Header: "Tên, nội dung hình thức cập nhật",
        Footer: "Tên, nội dung hình thức cập nhật",

        accessor: "Ten",
        disableGroupBy: true,
      },
      {
        Header: "Trạng thái",
        Footer: "Trạng thái",

        accessor: "TrangThai",
        disableGroupBy: true,
        Cell: ({ value }) => {
          if (value === true)
            return (
              <TrangThaiLopDaoTao trangthai={true} title={"Đã hoàn thành"} />
            );
          else
            return (
              <TrangThaiLopDaoTao trangthai={false} title={"Chưa hoàn thành"} />
            );
        },
      },

      {
        Header: "Ảnh",
        Footer: "Ảnh",
        accessor: "Images",
        disableGroupBy: true,
        Cell: ({ value }) =>
          value && value.length > 0 ? (
            <ImagesUploadChip imageUrls={value} />
          ) : null,
      },

      {
        Header: "Vai trò",
        Footer: "Vai trò",

        accessor: "VaiTro",

        disableGroupBy: true,
      },
      {
        Header: "Tín chỉ",
        Footer: "Tín chỉ",

        accessor: "SoTinChiTichLuy",

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
        Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Ngày kết thúc",
        Footer: "Ngày kết thúc",

        accessor: "NgayKetThuc",

        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Số section",
        Footer: "Số section",

        accessor: "SoLuong",
        disableGroupBy: true,
      },
      {
        Header: "_id",
        Footer: "_id",

        accessor: "_id",
        disableGroupBy: true,
      },
    ],
    []
  );

  const data = useMemo(() => LopDaoTaos, [LopDaoTaos]);
  
  const renderRowSubComponent = useCallback(
    ({ row }) => <LopDaoTaoView data={data[Number(row.id)]} />,
    [data]
  );
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title={title}>
          <CommonTable
            data={data}
            columns={columns}
            renderRowSubComponent={renderRowSubComponent}
           
          />
          
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default DaoTaoTheoNhanVienTable;
