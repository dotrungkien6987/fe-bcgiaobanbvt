import { Grid, IconButton, Stack, Tooltip, useTheme } from "@mui/material";

import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";

import { getAllLopDaoTao } from "./daotaoSlice";
import AddLopDaoTao from "./AddLopDaoTao";

import DeleteLopDaoTaoButton from "./DeleteLopDaoTaoButton";
import UpdateLopDaoTaoButton from "./UpdateLopDaoTaoButton";
import DiemDanhLopDaoTaoButton from "./DiemDanhLopDaoTaoButton";
import LopDaoTaoView from "features/NhanVien/LopDaoTaoView";
import { Add, Eye } from "iconsax-react";
import { ThemeMode } from "configAble";
import TrangThaiLopDaoTao from "./TrangThaiLopDaoTao";

import ScrollX from "components/ScrollX";
import ThemHocVienTamButton from "./ThemHocVienTam/ThemHocVienTamButton";
import { useParams } from "react-router-dom";

function LopDaoTaoTableByType() {
  const params = useParams();
  const typeLopDaoTao = params.type;
  const theme = useTheme();
  const mode = theme.palette.mode;
  const columns = useMemo(
    () => [
      {
        Header: "Action",
        Footer: "Action",
        accessor: "id",
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
              <DeleteLopDaoTaoButton lopdaotaoID={row.original._id} />
              {row.original.TrangThai === false && (
                <Stack direction={"row"}>
                  <UpdateLopDaoTaoButton lopdaotaoID={row.original._id} />
                  <ThemHocVienTamButton lopdaotaoID={row.original._id} />
                </Stack>
              )}
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
        Header: "Tên lớp đào tạo",
        Footer: "Tên lớp đào tạo",

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
        Header: "Số thành viên",
        Footer: "Số thành viên",

        accessor: "SoThanhVien",

        disableGroupBy: true,
      },
      {
        Header: "Ngày bắt đầu",
        Footer: "Ngày bắt đầu",
        // Filter:DateColumnFilter,
        accessor: "NgayBatDauFormat",

        disableGroupBy: true,
        // Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Ngày kết thúc",
        Footer: "Ngày kết thúc",

        accessor: "NgayKetThucFormat",

        disableGroupBy: true,
        // Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Số section",
        Footer: "Số section",

        accessor: "SoLuong",
        disableGroupBy: true,
      },
      {
        Header: "Người tạo",
        Footer: "Người tạo",

        accessor: "NguoiTao",
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

  const data = useMemo(
    () => LopDaoTaos.filter((item) => item.MaHinhThucCapNhat === typeLopDaoTao),
    [LopDaoTaos, typeLopDaoTao]
  );
  const renderRowSubComponent = useCallback(
    ({ row }) => <LopDaoTaoView data={data[Number(row.id)]} />,
    [data]
  );
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Quản lý lớp đào tạo">
          <ScrollX sx={{ height: 700 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddLopDaoTao mahinhthuccapnhat = {typeLopDaoTao}/>
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default LopDaoTaoTableByType;
