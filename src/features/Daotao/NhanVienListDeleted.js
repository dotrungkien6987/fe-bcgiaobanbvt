import { Grid, Stack, Tooltip, useTheme } from "@mui/material";

import { getAllNhanVienDeleted } from "features/NhanVien/nhanvienSlice";

import React, { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import RestoreNhanVienButton from "./RestoreNhanVienButton";
import MainCard from "components/MainCard";
import CommonTable from "pages/tables/MyTable/CommonTable";
import ExcelButton from "components/ExcelButton";
import IconButton from "components/@extended/IconButton";
import { Add, Eye } from "iconsax-react";
import { ThemeMode } from "configAble";
import NhanVienView from "features/NhanVien/NhanVienView";
import { formatDate_getDate } from "utils/formatTime";
import ScrollX from "components/ScrollX";

const LOAI_CHUYEN_MON_LABELS = {
  BAC_SI: "Bác sĩ",
  DUOC_SI: "Dược sĩ",
  DIEU_DUONG: "Điều dưỡng",
  KTV: "Kỹ thuật viên",
  KHAC: "Khác",
};

function NhanVienListDeleted() {
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
              <RestoreNhanVienButton nhanvienID={row.original._id} />
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
      {
        Header: "Khoa công tác",
        Footer: "Khoa",
        accessor: "TenKhoa",
        minWidth: 200,
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
        Header: "Loại chuyên môn",
        Footer: "Loại chuyên môn",
        accessor: (row) =>
          row.LoaiChuyenMon || row.LoaiChuyenMonID?.LoaiChuyenMon || "",
        dataType: "text",
        filter: "fuzzyText",
        disableGroupBy: true,
        Cell: ({ value }) => LOAI_CHUYEN_MON_LABELS[value] || value,
      },
      {
        Header: "Trình độ ",
        Footer: "Trình độ ",
        accessor: (row) => row.TrinhDo || row.LoaiChuyenMonID?.TrinhDo || "",
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
        Header: "Ngày xóa",
        Footer: "Ngày xóa",
        accessor: "updatedAt",
        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "_id",
        Footer: "_id",
        accessor: "_id",
        disableGroupBy: true,
      },
    ],
    [mode, theme.palette.grey]
  );

  const dispatch = useDispatch();
  const { nhanviensDeleted } = useSelector((state) => state.nhanvien);

  useEffect(() => {
    // Gọi hàm để lấy danh sách nhân viên đã xóa khi component được tạo
    console.log(
      "NhanVienListDeleted: component mounted, calling getAllNhanVienDeleted"
    );
    dispatch(getAllNhanVienDeleted());
  }, [dispatch]);

  const data = useMemo(() => nhanviensDeleted, [nhanviensDeleted]);

  const renderRowSubComponent = useCallback(
    ({ row }) => <NhanVienView data={data[Number(row.id)]} />,
    [data]
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard title="Danh sách nhân viên đã xóa">
          <ScrollX sx={{ height: 670 }}>
            <CommonTable
              data={data}
              columns={columns}
              renderRowSubComponent={renderRowSubComponent}
              additionalComponent={
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                  <ExcelButton />
                </div>
              }
            />
          </ScrollX>
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default NhanVienListDeleted;
