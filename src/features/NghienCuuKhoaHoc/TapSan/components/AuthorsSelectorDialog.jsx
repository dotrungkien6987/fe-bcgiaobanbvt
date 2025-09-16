import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  IconButton,
  Chip,
  Radio,
  Checkbox,
  Box,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import CommonTable from "pages/tables/MyTable/CommonTable";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

/**
 * AuthorsSelectorDialog
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - value: { TacGiaChinhID: string, DongTacGiaIDs: string[] }
 * - onChange: ({ TacGiaChinhID, DongTacGiaIDs }) => void
 */
export default function AuthorsSelectorDialog({
  open,
  onClose,
  value,
  onChange,
}) {
  const dispatch = useDispatch();
  const nhanviens = useSelector((s) => s.nhanvien?.nhanviens || []);
  const isLoading = useSelector((s) => s.nhanvien?.isLoading || false);

  const [mainId, setMainId] = React.useState(value?.TacGiaChinhID || "");
  const [coIds, setCoIds] = React.useState(value?.DongTacGiaIDs || []);

  React.useEffect(() => {
    if (!nhanviens || nhanviens.length === 0) {
      dispatch(getAllNhanVien());
    }
  }, [dispatch, nhanviens]);

  React.useEffect(() => {
    setMainId(value?.TacGiaChinhID || "");
    setCoIds(value?.DongTacGiaIDs || []);
  }, [value]);

  const handleToggleCoAuthor = (id) => {
    setCoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSetMain = (id) => {
    setMainId(id);
    setCoIds((prev) => prev.filter((x) => x !== id));
  };

  const columns = React.useMemo(
    () => [
      {
        Header: "Chính",
        accessor: "main",
        className: "cell-center",
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <Radio
            checked={row.original._id === mainId}
            onChange={() => handleSetMain(row.original._id)}
            inputProps={{ "aria-label": `main-${row.original._id}` }}
          />
        ),
      },
      {
        Header: "Đồng tác giả",
        accessor: "co",
        className: "cell-center",
        disableSortBy: true,
        disableFilters: true,
        Cell: ({ row }) => (
          <Checkbox
            checked={coIds.includes(row.original._id)}
            onChange={() => handleToggleCoAuthor(row.original._id)}
            disabled={row.original._id === mainId}
            inputProps={{ "aria-label": `co-${row.original._id}` }}
          />
        ),
      },
      { Header: "Mã NV", accessor: "MaNhanVien", className: "cell-center" },
      { Header: "Họ tên", accessor: "Ten" },
      { Header: "Khoa", accessor: "TenKhoa" },
      { Header: "Chức danh", accessor: "ChucDanh" },
    ],
    [mainId, coIds]
  );

  const handleConfirm = () => {
    onChange?.({ TacGiaChinhID: mainId, DongTacGiaIDs: coIds });
    onClose?.();
  };

  const getName = (id) => nhanviens.find((x) => x._id === id)?.Ten || id;

  return (
    <Dialog open={open} onClose={onClose} fullScreen>
      <DialogTitle>
        Chọn tác giả
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 2 }}>
        {/* Sticky selected info header */}
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
            {mainId && (
              <Chip
                color="primary"
                label={`Tác giả chính: ${getName(mainId)}`}
                sx={{ mr: 1, mb: 1 }}
              />
            )}
            {coIds.map((id) => (
              <Chip
                key={id}
                label={`Đồng tác giả: ${getName(id)}`}
                onDelete={() => handleToggleCoAuthor(id)}
                variant="outlined"
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Stack>
        </Box>
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
        <Button onClick={handleConfirm} variant="contained" disabled={!mainId}>
          Xong
        </Button>
      </DialogActions>
    </Dialog>
  );
}
