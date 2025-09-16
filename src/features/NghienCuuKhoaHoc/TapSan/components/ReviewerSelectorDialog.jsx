import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Radio,
  Chip,
  Stack,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import CommonTable from "pages/tables/MyTable/CommonTable";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

/**
 * ReviewerSelectorDialog
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - value: string | null (NhanVien _id)
 * - onChange: (id: string) => void
 */
export default function ReviewerSelectorDialog({
  open,
  onClose,
  value,
  onChange,
}) {
  const dispatch = useDispatch();
  const nhanviens = useSelector((s) => s.nhanvien?.nhanviens || []);
  const isLoading = useSelector((s) => s.nhanvien?.isLoading || false);

  const [selectedId, setSelectedId] = React.useState(value || "");

  React.useEffect(() => {
    if (!nhanviens || nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [dispatch, nhanviens]);

  React.useEffect(() => {
    setSelectedId(value || "");
  }, [value]);

  const columns = React.useMemo(
    () => [
      {
        Header: "Chọn",
        accessor: "select",
        className: "cell-center",
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <Radio
            checked={row.original._id === selectedId}
            onChange={() => setSelectedId(row.original._id)}
            inputProps={{ "aria-label": `select-${row.original._id}` }}
          />
        ),
      },
      { Header: "Mã NV", accessor: "MaNhanVien", className: "cell-center" },
      { Header: "Họ tên", accessor: "Ten" },
      { Header: "Khoa", accessor: "TenKhoa" },
      { Header: "Chức danh", accessor: "ChucDanh" },
    ],
    [selectedId]
  );

  const getName = (id) => nhanviens.find((x) => x._id === id)?.Ten || id;

  const handleConfirm = () => {
    if (selectedId) onChange?.(selectedId);
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>
        Chọn người thẩm định
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {/* Selected preview */}
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {selectedId && (
            <Chip
              color="info"
              label={`Người thẩm định: ${getName(selectedId)}`}
            />
          )}
        </Stack>
        <CommonTable
          data={nhanviens || []}
          columns={columns}
          showGlobalFilter
          showColumnVisibility
          loading={isLoading}
        />
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedId}
        >
          Xong
        </Button>
      </DialogActions>
    </Dialog>
  );
}
