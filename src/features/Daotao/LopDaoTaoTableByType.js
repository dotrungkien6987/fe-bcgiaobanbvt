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
import { getAllHinhThucCapNhat } from "features/NhanVien/hinhthuccapnhatSlice";
import {
  buildLopDaoTaoColumnsByGroup,
  resolveLopDaoTaoTitleByCode,
} from "./lopDaoTaoTableConfig";

function LopDaoTaoTableByType() {
  const params = useParams();
  let typeLopDaoTao = params.type;
  const { HinhThucCapNhat } = useSelector((state) => state.hinhthuccapnhat);
  const dispatch = useDispatch();
  useEffect(() => {
    if (HinhThucCapNhat.length === 0) {
      dispatch(getAllHinhThucCapNhat());
    }
  }, [HinhThucCapNhat.length, dispatch]);
  // Kiểm tra nếu ký tự đầu tiên là 'D' thì thay bằng 'Đ'
  if (typeLopDaoTao && typeLopDaoTao.charAt(0) === "D") {
    typeLopDaoTao = "Đ" + typeLopDaoTao.slice(1);
  }

  const theme = useTheme();
  const mode = theme.palette.mode;

  const baseColumns = useMemo(
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
        Cell: ({ value }) =>
          value ? (
            <TrangThaiLopDaoTao trangthai={true} title={"Đã hoàn thành"} />
          ) : (
            <TrangThaiLopDaoTao trangthai={false} title={"Chưa hoàn thành"} />
          ),
      },
      {
        Header: "Quyết định",
        Footer: "Quyết định",
        accessor: "QuyetDinh",
        disableGroupBy: true,
      },
      {
        Header: "Cán bộ tham gia",
        Footer: "Cán bộ tham gia",
        accessor: "CanBoThamGia",
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
        accessor: "NgayBatDauFormat",
        disableGroupBy: true,
      },
      {
        Header: "Ngày kết thúc",
        Footer: "Ngày kết thúc",
        accessor: "NgayKetThucFormat",
        disableGroupBy: true,
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
      {
        Header: "_id",
        Footer: "_id",
        accessor: "_id",
        disableGroupBy: true,
      },
    ],
    [mode, theme]
  );

  const columns = useMemo(
    () => buildLopDaoTaoColumnsByGroup({ baseColumns, code: typeLopDaoTao }),
    [baseColumns, typeLopDaoTao]
  );

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
  const quyDoiLoaiDaoTao = (maLoai) => {
    const hinhthuc = HinhThucCapNhat.find((item) => item.Ma === maLoai);
    if (hinhthuc?.TenBenhVien) return hinhthuc.TenBenhVien;
    else return "Lớp đào tạo";
  };

  const title = resolveLopDaoTaoTitleByCode(
    typeLopDaoTao,
    `Quản lý ${quyDoiLoaiDaoTao(typeLopDaoTao)}`
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title={title}>
          <ScrollX sx={{ height: 700 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <AddLopDaoTao mahinhthuccapnhat={typeLopDaoTao} />
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
