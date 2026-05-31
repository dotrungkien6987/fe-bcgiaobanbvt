import React from "react";
import {
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Radio,
  Chip,
  Stack,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import CommonTable from "pages/tables/MyTable/CommonTable";
import useTapSanNhanVienOptions from "../hooks/useTapSanNhanVienOptions";

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
  nhanVienOptions: initialNhanVienOptions = [],
}) {
  const [selectedId, setSelectedId] = React.useState(value || "");
  const [searchText, setSearchText] = React.useState("");
  const { nhanVienOptions, nhanVienById, loading, error, isSearching } =
    useTapSanNhanVienOptions({
      enabled: open,
      limit: 60,
      search: searchText,
      debounceMs: 300,
      initialOptions: initialNhanVienOptions,
    });

  React.useEffect(() => {
    setSelectedId(value || "");
  }, [value]);

  React.useEffect(() => {
    if (!open) {
      setSearchText("");
    }
  }, [open]);

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
    [selectedId],
  );

  const tableData = React.useMemo(() => {
    const byId = new Map(
      (nhanVienOptions || []).map((item) => [item._id, item]),
    );
    const selectedItem = nhanVienById.get(selectedId);
    if (selectedItem?._id) {
      byId.set(selectedItem._id, selectedItem);
    }
    return Array.from(byId.values());
  }, [nhanVienById, nhanVienOptions, selectedId]);

  const getName = (id) => nhanVienById.get(id)?.Ten || id;

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
        <TextField
          fullWidth
          size="small"
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          placeholder="Tìm theo họ tên, mã NV, chức danh..."
          sx={{ mb: 1.5 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment:
              loading || isSearching ? (
                <InputAdornment position="end">
                  <CircularProgress size={18} />
                </InputAdornment>
              ) : null,
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mb: 1.5, display: "block" }}
        >
          {searchText.trim()
            ? `Đang hiển thị ${tableData.length} kết quả phù hợp.`
            : "Nhập từ khóa để tìm nhanh người thẩm định."}
        </Typography>
        {/* Selected preview */}
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          {selectedId && (
            <Chip
              color="info"
              label={`Người thẩm định: ${getName(selectedId)}`}
            />
          )}
        </Stack>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Không thể tải danh sách nhân viên. Vui lòng thử lại.
          </Alert>
        )}
        <CommonTable
          data={tableData}
          columns={columns}
          showColumnVisibility
          loading={loading}
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
