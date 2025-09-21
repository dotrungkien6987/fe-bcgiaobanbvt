import { Box, Button, Card, Stack, Typography } from "@mui/material";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import SaveIcon from "@mui/icons-material/Save";
import MyStickyEditTable from "pages/tables/MyTable/MyStickyEditTable";
import {
  setOpenUploadLopDaoTaoNhanVien,
  updateLopDaoTaoNhanVienDiemDanh,
} from "./daotaoSlice";
import { formatDate_getDate } from "utils/formatTime";
import UploadLopDaoTaoNhanVienButton from "./UploadAnhChoHocVien/UploadLopDaoTaoNhanVienButton";
import { original } from "@reduxjs/toolkit";
import UpLoadHocVienLopDaoTaoForm from "./UploadAnhChoHocVien/UpLoadHocVienLopDaoTaoForm";
import ImagesUploadChip from "./UploadAnhChoHocVien/ImagesUploadChip";
import useAuth from "hooks/useAuth";

function DiemDanhLopDaoTaoTable({ numSections = 0 }) {
  const { user } = useAuth();
  
  const columns = useMemo(() => {
    // Các cột cơ bản
    const baseColumns = [
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
        dataType: "text",
        editable: false,
        disableGroupBy: true,
      },
      {
        Header: "Giới tính",
        Footer: "Giới tính",
        accessor: "Sex",
        aggregate: "count",
      },
      {
        Header: "Ngày sinh",
        Footer: "Ngày sinh",
        accessor: "NgaySinh",
        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Tên khoa",
        Footer: "Tên khoa",
        accessor: "TenKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Upload",
        Footer: "Upload",
        accessor: "Upload",
        disableGroupBy: true,
        Cell: ({ row }) => (
          <UploadLopDaoTaoNhanVienButton
            lopdaotaonhanvienID={row.original._id}
          />
        ),
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
        Header: "Tín chỉ tích lũy",
        Footer: "Tín chỉ tích lũy",
        accessor: "SoTinChiTichLuy",
        className: "cell-center",
        dataType: "text",
        editable: true,
        disableGroupBy: true,
      },
      {
        Header: "Tính tự động",
        Footer: "Tính tự động",
        accessor: "TuDong",
        className: "cell-center",
        disableGroupBy: true,
      },
      {
        Header: "Vai trò",
        Footer: "Vai trò",
        accessor: "VaiTro",
        className: "cell-center",
        disableGroupBy: true,
      },
      {
        Header: "Đơn vị",
        Footer: "Đơn vị",
        accessor: "DonVi",
        className: "cell-center",
        disableGroupBy: true,
      },
      {
        Header: "Quy đổi",
        Footer: "Quy đổi",
        accessor: "QuyDoi",
        className: "cell-center",
        disableGroupBy: true,
      },
      {
        Header: "Số lượng",
        Footer: "Số lượng",
        accessor: "SoLuong",
        className: "cell-center",
        disableGroupBy: true,
      },
    ];

    // Các cột động cho từng phần tử trong DiemDanh
    const dynamicColumns = Array.from({ length: numSections }, (_, index) => ({
      Header: `section ${index + 1}`,
      Footer: `section ${index + 1}`,
      accessor: `section ${index + 1}`,
      editable: true,
      dataType: "checkbox",
      disableGroupBy: true,
    }));
    console.log("columns", [...baseColumns, ...dynamicColumns]);
    return [...baseColumns, ...dynamicColumns];
  }, [numSections]);

  const { hocvienCurrents, lopdaotaoCurrent, openUploadLopDaoTaoNhanVien } =
    useSelector((state) => state.daotao);
  const dispatch = useDispatch();

  const handleClickSave = () => {
    if (tableData?.length > 0) {
      const lopdaotaonhanvienDiemDanhData = tableData.map((item) => {
        let lopdaotaonhanvienUpdate = {};
        lopdaotaonhanvienUpdate._id = item._id;
        let updatedDiemDanh = [];
        for (let i = 1; i <= item.DiemDanh.length; i++) {
          updatedDiemDanh.push(item[`section ${i}`]);
        }
        lopdaotaonhanvienUpdate.DiemDanh = updatedDiemDanh;
        lopdaotaonhanvienUpdate.SoTinChiTichLuy = item.SoTinChiTichLuy;
        return lopdaotaonhanvienUpdate;
      });
      console.log("lopdaotaonhanvienDiemDanhData", tableData);
      dispatch(updateLopDaoTaoNhanVienDiemDanh(lopdaotaonhanvienDiemDanhData));
    } else {
      // Hiển thị thông báo cho người dùng
      alert("Vui lòng cập nhật thông tin điểm danh trước.");
    }
  };
  useEffect(() => {
    setTableData([...hocvienCurrents]);
  }, [hocvienCurrents]);

  const [tableData, setTableData] = useState([...hocvienCurrents]);
  const [skipPageReset, setSkipPageReset] = useState(false);
  const updateData = (rowIndex, columnId, value) => {
    setTableData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          const updatedRow = {
            ...old[rowIndex],
            [columnId]: value,
          };

          // Tính toán lại SoLuong
          let soluong = 0;
          for (let i = 1; i <= updatedRow.DiemDanh.length; i++) {
            if (updatedRow[`section ${i}`] === true) {
              soluong++;
            }
          }

          // Cập nhật lại TuDong
          const tuDong = soluong * updatedRow.QuyDoi;

          return {
            ...updatedRow,
            SoLuong: soluong,
            TuDong: tuDong,
          };
        }
        return row;
      })
    );
  };
  const handleAutoCalculate = () => {
    setTableData((old) =>
      old.map((row) => {
        return {
          ...row,
          SoTinChiTichLuy: row.TuDong,
        };
      })
    );
  };
  useEffect(() => {
    setSkipPageReset(false);
  }, [tableData]);

  const handleCloseUpload = () => {
    dispatch(setOpenUploadLopDaoTaoNhanVien(false));
  };
  return (
    <Card variant="outlined" sx={{ p: 1 }}>
      <Stack direction="row" mb={2}>
        <Typography fontSize={18} fontWeight={"bold"}>
          {" "}
          Danh sách học viên trong lớp
        </Typography>
        <Box sx={{ flexGrow: 1 }}></Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          {" "}
          {/* Thêm khoảng cách giữa các nút */}
          {!lopdaotaoCurrent.TrangThai && (
            <Button
              variant="contained"
              startIcon={<CompareArrowsIcon />}
              onClick={handleAutoCalculate}
            >
              Tự động tính tín chỉ tích lũy
            </Button>
          )}
          {!lopdaotaoCurrent.TrangThai && (user?._id === lopdaotaoCurrent.UserIDCreated) && (
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleClickSave}
            >
              Lưu tín chỉ
            </Button>
          )}
        </Box>
        <UpLoadHocVienLopDaoTaoForm
          open={openUploadLopDaoTaoNhanVien}
          handleClose={handleCloseUpload}
          
        />
      </Stack>
      <MyStickyEditTable
        data={tableData}
        columns={columns}
        updateData={updateData}
        skipPageReset={skipPageReset}
        sx={{ height: 700 }}
      />
    </Card>
  );
}

export default DiemDanhLopDaoTaoTable;
