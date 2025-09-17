import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Chip,
  Stack,
  Checkbox,
  Typography,
} from "@mui/material";
import CommonTable from "pages/tables/MyTable/CommonTable";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

/**
 * Dialog chọn nhiều nhân viên (multi-select) tái sử dụng pattern CommonTable.
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - value: string[] (mảng id nhân viên đã chọn)
 * - onChange: (ids: string[]) => void
 */
export default function SelectNhanVienTable({
  open,
  onClose,
  value = [],
  onChange,
}) {
  const dispatch = useDispatch();
  const nhanviens = useSelector((s) => s.nhanvien?.nhanviens || []);
  const isLoading = useSelector((s) => s.nhanvien?.isLoading || false);
  const [selected, setSelected] = React.useState(value);

  useEffect(() => {
    if (!nhanviens || nhanviens.length === 0) dispatch(getAllNhanVien());
  }, [dispatch, nhanviens]);

  useEffect(() => {
    setSelected(value || []);
  }, [value]);

  const toggleOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const allIds = useMemo(() => nhanviens.map((n) => n._id), [nhanviens]);

  // Chuẩn hóa dữ liệu hiển thị để tránh sai field (HoTen vs Ten, MaNhanVien vs MaNV)
  const normalizedData = useMemo(
    () =>
      nhanviens.map((n) => ({
        ...n,
        _displayName:
          n.HoTen || n.Ten || n.hoTen || n.ten || n.UserName || "(Không tên)",
        _maNV: n.MaNhanVien || n.MaNV || n.maNhanVien || n.username || "",
        _chucDanh:
          n.ChucDanh || n.ChucDanhID?.Ten || n.ChucDanhID?.TenChucDanh || "",
        _tenKhoa: n.TenKhoa || n.KhoaID?.TenKhoa || n.KhoaID?.Ten || "",
        _trinhDo:
          n.TrinhDoChuyenMon ||
          n.TrinhDo ||
          n.TrinhDoID?.Ten ||
          n.TrinhDoChuyenMonID?.Ten ||
          "",
        _ngaySinh: n.NgaySinh || n.ngaySinh || n.BirthDate || n.DOB || "",
        _chucVu: n.ChucVu || n.ChucVuID?.Ten || n.ChucVuID?.TenChucVu || "",
        _danToc: n.DanToc || n.DanTocID?.Ten || n.DanTocID?.TenDanToc || "",
        _gioiTinh:
          n.GioiTinh === 0
            ? "Nam"
            : n.GioiTinh === 1
            ? "Nữ"
            : n.Sex || n.sex || (n.GioiTinh ? n.GioiTinh : "") || "",
      })),
    [nhanviens]
  );
  const allChecked =
    allIds.length > 0 && allIds.every((id) => selected.includes(id));
  const someChecked = allIds.some((id) => selected.includes(id));
  const toggleAll = React.useCallback(() => {
    if (allChecked) setSelected([]);
    else setSelected(allIds);
  }, [allChecked, allIds]);

  const columns = React.useMemo(
    () => [
      {
        Header: (
          <Checkbox
            indeterminate={someChecked && !allChecked}
            checked={allChecked}
            onChange={toggleAll}
            size="small"
          />
        ),
        accessor: "select",
        disableSortBy: true,
        disableFilters: true,
        className: "cell-center",
        Cell: ({ row }) => (
          <Checkbox
            size="small"
            checked={selected.includes(row.original._id)}
            onChange={() => toggleOne(row.original._id)}
          />
        ),
      },
      { Header: "Mã NV", accessor: "_maNV", className: "cell-center" },
      { Header: "Họ tên", accessor: "_displayName" },
      { Header: "Khoa", accessor: "_tenKhoa" },
      { Header: "Chức danh", accessor: "_chucDanh" },
      { Header: "Chức vụ", accessor: "_chucVu" },
      { Header: "Trình độ chuyên môn", accessor: "_trinhDo" },
      { Header: "Dân tộc", accessor: "_danToc" },
      { Header: "Giới tính", accessor: "_gioiTinh", className: "cell-center" },
      { Header: "Ngày sinh", accessor: "_ngaySinh", className: "cell-center" },
    ],
    [selected, allChecked, someChecked, toggleAll]
  );

  const getName = (id) =>
    normalizedData.find((x) => x._id === id)?._displayName || id;

  const handleConfirm = () => {
    onChange?.(selected);
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>Chọn thành viên</DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: "background.paper",
            pb: 1,
            mb: 1,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {selected.map((id) => (
              <Chip
                key={id}
                label={getName(id)}
                onDelete={() => toggleOne(id)}
                size="small"
                sx={{ mr: 0.5, mb: 0.5 }}
              />
            ))}
            {selected.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                Chưa chọn thành viên
              </Typography>
            )}
          </Stack>
        </Box>
        <CommonTable
          data={normalizedData || []}
          columns={columns}
          showGlobalFilter
          showColumnVisibility
          loading={isLoading}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Xong ({selected.length})
        </Button>
      </DialogActions>
    </Dialog>
  );
}
