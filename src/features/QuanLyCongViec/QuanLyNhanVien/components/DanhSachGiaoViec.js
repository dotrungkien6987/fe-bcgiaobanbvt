import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  Stack,
  Button,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import { Add, Save, Delete } from "@mui/icons-material";

import MainCard from "components/MainCard";
import ConfirmDialog from "components/ConfirmDialog";
import CommonTable from "pages/tables/MyTable/CommonTable";
import { formatDate_getDate } from "utils/formatTime";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";
import {
  removeNhanVienFromList,
  syncQuanLyNhanVienList,
} from "../quanLyNhanVienSlice";

function DanhSachGiaoViec({ onOpenDialog }) {
  const dispatch = useDispatch();
  const { giaoViecs, currentNhanVienQuanLy, hasUnsavedChanges, isLoading } =
    useSelector((state) => state.quanLyNhanVien);
  const { nhanviens } = useSelector((state) => state.nhanvien);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    type: "", // 'remove', 'update'
    data: null,
    title: "",
    message: "",
    details: "",
  });

  useEffect(() => {
    // Load nhân viên data nếu cần thiết
    if (nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [dispatch, nhanviens.length]);

  // Handle remove nhân viên from list với confirm dialog
  const handleRemoveNhanVien = useCallback(
    (relationId) => {
      const relation = giaoViecs.find((gv) => gv._id === relationId);
      const nhanVienName = relation?.NhanVienDuocQuanLy?.Ten || "nhân viên này";

      setConfirmDialog({
        open: true,
        type: "remove",
        data: { relationId },
        title: "Xác nhận xóa nhân viên",
        message: `Bạn có chắc muốn xóa "${nhanVienName}" khỏi danh sách giao việc?`,
        details:
          'Thao tác này chỉ xóa khỏi danh sách tạm thời. Bạn cần nhấn "Cập nhật" để lưu thay đổi vào cơ sở dữ liệu.',
      });
    },
    [giaoViecs]
  );

  const columns = useMemo(
    () => [
      {
        Header: "STT",
        Footer: "STT",
        accessor: (row, index) => index + 1,
        className: "cell-center",
        disableSortBy: true,
        disableFilters: true,
        disableGroupBy: true,
      },
      {
        Header: "Mã NV",
        Footer: "Mã NV",
        accessor: "NhanVienDuocQuanLy.MaNhanVien",
        className: "cell-center",
        disableGroupBy: true,
      },
      {
        Header: "Họ Tên",
        Footer: "Họ Tên",
        accessor: "NhanVienDuocQuanLy.Ten",
        disableGroupBy: true,
      },
      {
        Header: "Ngày sinh",
        Footer: "Ngày sinh",
        accessor: "NhanVienDuocQuanLy.NgaySinh",
        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },
      {
        Header: "Khoa",
        Footer: "Khoa",
        accessor: "NhanVienDuocQuanLy.TenKhoa",
        disableGroupBy: true,
      },
      {
        Header: "Chức danh",
        Footer: "Chức danh",
        accessor: "NhanVienDuocQuanLy.ChucDanh",
        disableGroupBy: true,
      },
      {
        Header: "Phạm vi hành nghề",
        Footer: "Phạm vi hành nghề",
        accessor: "NhanVienDuocQuanLy.PhamViHanhNghe",
        disableGroupBy: true,
      },
      {
        Header: "Ngày tạo",
        Footer: "Ngày tạo",
        accessor: "createdAt",
        disableGroupBy: true,
        Cell: ({ value }) => formatDate_getDate(value),
      },

      {
        Header: "Thao tác",
        Footer: "Thao tác",
        accessor: "actions",
        Cell: ({ row }) => (
          <IconButton
            color="error"
            size="small"
            onClick={() => handleRemoveNhanVien(row.original._id)}
            title="Xóa khỏi danh sách"
          >
            <Delete />
          </IconButton>
        ),
        disableSortBy: true,
        disableFilters: true,
        disableGroupBy: true,
      },
    ],
    [handleRemoveNhanVien]
  );

  // Simple data - just show current list filtered by LoaiQuanLy
  const data = useMemo(() => {
    return giaoViecs.filter((gv) => gv.LoaiQuanLy === "Giao_Viec");
  }, [giaoViecs]);

  const handleConfirmUpdate = () => {
    const nhanVienCount = giaoViecs.filter(
      (gv) => gv.LoaiQuanLy === "Giao_Viec"
    ).length;

    setConfirmDialog({
      open: true,
      type: "update",
      data: null,
      title: "Cập nhật danh sách giao việc",
      message: `Xác nhận cập nhật danh sách nhân viên được giao việc?`,
      details: `Tổng cộng: ${nhanVienCount} nhân viên sẽ được lưu vào cơ sở dữ liệu. Thao tác này không thể hoàn tác.`,
    });
  };

  // Handle dialog confirm
  const handleDialogConfirm = () => {
    const { type, data } = confirmDialog;

    if (type === "remove" && data?.relationId) {
      dispatch(removeNhanVienFromList({ relationId: data.relationId }));
    } else if (type === "update") {
      const nhanVienIds = giaoViecs
        .filter((gv) => gv.LoaiQuanLy === "Giao_Viec")
        .map((gv) => gv.NhanVienDuocQuanLy._id);

      dispatch(
        syncQuanLyNhanVienList({
          NhanVienQuanLy: currentNhanVienQuanLy._id,
          NhanVienDuocQuanLyIds: nhanVienIds,
          LoaiQuanLy: "Giao_Viec",
        })
      );
    }

    setConfirmDialog({ ...confirmDialog, open: false });
  };

  // Handle dialog close
  const handleDialogClose = () => {
    if (!isLoading) {
      setConfirmDialog({ ...confirmDialog, open: false });
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <MainCard
          title={
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h5">
                Danh sách nhân viên được giao việc
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => onOpenDialog("Giao_Viec")}
                >
                  Chọn nhân viên
                </Button>
                {hasUnsavedChanges && (
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<Save />}
                    onClick={handleConfirmUpdate}
                  >
                    Cập nhật
                  </Button>
                )}
              </Stack>
            </Stack>
          }
        >
          {currentNhanVienQuanLy && (
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Nhân viên quản lý: <strong>{currentNhanVienQuanLy.Ten}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Mã NV: <strong>{currentNhanVienQuanLy.MaNhanVien}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tổng số nhân viên được giao việc: <strong>{data.length}</strong>
              </Typography>
            </Stack>
          )}

          <CommonTable
            data={data}
            columns={columns}
            showGlobalFilter={true}
            showColumnVisibility={true}
          />
        </MainCard>
      </Grid>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={handleDialogClose}
        onConfirm={handleDialogConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        details={confirmDialog.details}
        loading={isLoading}
        severity={confirmDialog.type === "remove" ? "warning" : "info"}
        confirmColor={confirmDialog.type === "remove" ? "error" : "primary"}
        confirmText={confirmDialog.type === "remove" ? "Xóa" : "Cập nhật"}
      />
    </Grid>
  );
}

export default DanhSachGiaoViec;
