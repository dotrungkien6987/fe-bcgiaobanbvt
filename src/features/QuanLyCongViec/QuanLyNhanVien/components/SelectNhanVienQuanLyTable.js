import { Grid } from "@mui/material";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import MainCard from "components/MainCard";

import { IndeterminateCheckbox } from "components/third-party/ReactTable";
import SelectTable from "pages/tables/MyTable/SelectTable";
import { formatDate_getDate } from "utils/formatTime";

function SelectNhanVienQuanLyTable({
  loaiQuanLy,
  currentRelations,
  onSelectedRowsChange,
}) {
  const dispatch = useDispatch();
  const { nhanviens } = useSelector((state) => state.nhanvien);
  const { currentNhanVienQuanLy, giaoViecs, chamKPIs } = useSelector(
    (state) => state.quanLyNhanVien
  );

  useEffect(() => {
    // Gọi hàm để lấy danh sách cán bộ khi component được tạo
    if (nhanviens.length === 0) dispatch(getAllNhanVien());
  }, [dispatch, nhanviens.length]);

  // Filter nhân viên: loại bỏ nhân viên tự quản lý và những người đã có trong danh sách
  const data = useMemo(() => {
    if (!nhanviens || !currentNhanVienQuanLy) return [];

    // Get current list based on loaiQuanLy
    const currentList = loaiQuanLy === "Giao_Viec" ? giaoViecs : chamKPIs;
    const existingNhanVienIds = currentList
      .filter((item) => item.LoaiQuanLy === loaiQuanLy)
      .map((item) => item.NhanVienDuocQuanLy._id);

    return nhanviens.filter(
      (nv) =>
        nv._id !== currentNhanVienQuanLy._id && // Không phải chính mình
        !existingNhanVienIds.includes(nv._id) // Chưa có trong danh sách
    );
  }, [nhanviens, currentNhanVienQuanLy, giaoViecs, chamKPIs, loaiQuanLy]);

  // No initial selection needed since we filter out existing ones
  const initialSelectedRowIds = useMemo(() => {
    return {}; // Empty selection
  }, []);

  const columns = useMemo(
    () => [
      {
        title: "Row Selection",
        id: "selection",
        Header: ({ getToggleAllPageRowsSelectedProps }) => (
          <IndeterminateCheckbox
            indeterminate
            {...getToggleAllPageRowsSelectedProps()}
          />
        ),
        Footer: "#",
        accessor: "selection",
        groupByBoundary: true,
        Cell: ({ row }) => (
          <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />
        ),
        disableSortBy: true,
        disableFilters: true,
        disableGroupBy: true,
        Aggregated: () => null,
      },

      {
        Header: "Mã NV",
        Footer: "Mã NV",
        accessor: "MaNhanVien",
        className: "cell-center",
        disableGroupBy: true,
      },
      {
        Header: "Họ Tên",
        Footer: "Họ Tên",
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
        Header: "Phạm vi hành nghề",
        Footer: "Phạm vi hành nghề",
        accessor: "PhamViHanhNghe",
        disableGroupBy: true,
      },
      {
        Header: "Tên khoa",
        Footer: "Tên khoa",
        accessor: "TenKhoa",
        filter: "fuzzyText",
        disableGroupBy: true,
      },
      {
        Header: "Giới tính",
        Footer: "Giới tính",
        accessor: "Sex",
        aggregate: "count",
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
        Header: "Điện thoại",
        Footer: "Điện thoại",
        accessor: "SoDienThoai",
        disableGroupBy: true,
      },
      {
        Header: "Dân tộc",
        Footer: "Dân tộc",
        accessor: "DanToc",
        disableGroupBy: true,
      },
      {
        Header: "Chức danh",
        Footer: "Chức danh",
        accessor: "ChucDanh",
        disableGroupBy: true,
      },
    ],
    []
  );

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} lg={12}>
        <MainCard
          title={`Danh sách nhân viên ${
            loaiQuanLy === "Giao_Viec" ? "giao việc" : "chấm KPI"
          }`}
        >
          <SelectTable
            data={data}
            columns={columns}
            onSelectedRowsChange={onSelectedRowsChange}
            initialSelectedRowIds={initialSelectedRowIds}
          />
        </MainCard>
      </Grid>
    </Grid>
  );
}

export default SelectNhanVienQuanLyTable;
