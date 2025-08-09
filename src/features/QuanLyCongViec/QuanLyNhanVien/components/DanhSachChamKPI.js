import React, { useMemo, useEffect, useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Grid,
  Stack,
  Button,
  Typography,
  IconButton,
  Tooltip,
  Box,
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

function DanhSachChamKPI({ onOpenDialog }) {
  const dispatch = useDispatch();
  const { chamKPIs, currentNhanVienQuanLy, hasUnsavedChanges, isLoading } =
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

  // Dialog handlers
  const handleDialogConfirm = useCallback(
    async (data) => {
      try {
        if (confirmDialog.type === "remove") {
          // Handle remove confirmation
          dispatch(
            removeNhanVienFromList({
              relationId: data.relationId,
            })
          );
        } else if (confirmDialog.type === "update") {
          // Handle update confirmation
          const nhanVienIds = chamKPIs
            .filter((ck) => ck.LoaiQuanLy === "KPI")
            .map((ck) => ck?.NhanVienDuocQuanLy?._id)
            .filter(Boolean);

          dispatch(
            syncQuanLyNhanVienList({
              NhanVienQuanLy: currentNhanVienQuanLy?._id,
              NhanVienDuocQuanLyIds: nhanVienIds,
              LoaiQuanLy: "KPI",
            })
          );
        }
      } catch (error) {
        console.error("Dialog action error:", error);
      } finally {
        setConfirmDialog((prev) => ({ ...prev, open: false }));
      }
    },
    [confirmDialog.type, dispatch, currentNhanVienQuanLy, chamKPIs]
  );

  const handleDialogClose = useCallback(() => {
    setConfirmDialog((prev) => ({ ...prev, open: false }));
  }, []);

  useEffect(() => {
    // Load nhân viên data nếu cần thiết
    if (nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [dispatch, nhanviens.length]);

  // Handle remove nhân viên from list
  const handleRemoveNhanVien = useCallback((relationId) => {
    setConfirmDialog({
      open: true,
      type: "remove",
      data: { relationId },
      title: "Xác nhận xóa",
      message: "Bạn có chắc muốn xóa nhân viên này khỏi danh sách chấm KPI?",
      details:
        "Hành động này sẽ loại bỏ nhân viên khỏi danh sách chấm KPI hiện tại.",
    });
  }, []);

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
        accessor: "action",
        Cell: ({ row }) => (
          <Box display="flex" gap={1}>
            <Tooltip title="Xóa">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveNhanVien(row.original._id)}
              >
                <Delete />
              </IconButton>
            </Tooltip>
          </Box>
        ),
        disableSortBy: true,
        disableFilters: true,
        disableGroupBy: true,
      },
    ],
    [handleRemoveNhanVien]
  );

  // Merge real data with temporary data for display
  const data = useMemo(() => {
    return chamKPIs.filter((ck) => ck.LoaiQuanLy === "KPI");
  }, [chamKPIs]);

  // Calculate changes for confirmation (compare with original data from DB)
  const calculateChanges = () => {
    if (!hasUnsavedChanges) return { added: 0, deleted: 0 };

    // For now, just return placeholder - will implement when we add save logic
    return { added: 0, deleted: 0 };
  };

  const handleConfirmUpdate = () => {
    const changes = calculateChanges();

    setConfirmDialog({
      open: true,
      type: "update",
      data: { changes },
      title: "Xác nhận cập nhật",
      message: `Sẽ thêm ${changes.added} nhân viên, xóa ${changes.deleted} quan hệ chấm KPI. Bạn có chắc muốn tiếp tục?`,
      details:
        "Thao tác này sẽ lưu tất cả thay đổi vào cơ sở dữ liệu và không thể hoàn tác.",
    });
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
                Danh sách nhân viên được chấm KPI
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => onOpenDialog("KPI")}
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
                Tổng số nhân viên được chấm KPI: <strong>{data.length}</strong>
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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        message={confirmDialog.message}
        details={confirmDialog.details}
        severity={confirmDialog.type === "remove" ? "warning" : "info"}
        onConfirm={() => handleDialogConfirm(confirmDialog.data)}
        onClose={handleDialogClose}
        confirmText={confirmDialog.type === "remove" ? "Xóa" : "Cập nhật"}
        confirmColor={confirmDialog.type === "remove" ? "error" : "primary"}
        loading={isLoading}
      />
    </Grid>
  );
}

export default DanhSachChamKPI;
