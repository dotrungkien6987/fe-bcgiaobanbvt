import React from "react";
import {
  Alert,
  CircularProgress,
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
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import SearchIcon from "@mui/icons-material/Search";
import CommonTable from "pages/tables/MyTable/CommonTable";
import useTapSanNhanVienOptions from "../hooks/useTapSanNhanVienOptions";

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
  nhanVienOptions: initialNhanVienOptions = [],
}) {
  const [mainId, setMainId] = React.useState(value?.TacGiaChinhID || "");
  const [coIds, setCoIds] = React.useState(value?.DongTacGiaIDs || []);
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
    setMainId(value?.TacGiaChinhID || "");
    setCoIds(value?.DongTacGiaIDs || []);
  }, [value]);

  React.useEffect(() => {
    if (!open) {
      setSearchText("");
    }
  }, [open]);

  const handleToggleCoAuthor = (id) => {
    setCoIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
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
    [mainId, coIds],
  );

  const handleConfirm = () => {
    onChange?.({ TacGiaChinhID: mainId, DongTacGiaIDs: coIds });
    onClose?.();
  };

  const tableData = React.useMemo(() => {
    const byId = new Map(
      (nhanVienOptions || []).map((item) => [item._id, item]),
    );
    [mainId, ...(coIds || [])].forEach((id) => {
      const item = nhanVienById.get(id);
      if (item?._id) {
        byId.set(item._id, item);
      }
    });
    return Array.from(byId.values());
  }, [coIds, mainId, nhanVienById, nhanVienOptions]);

  const getName = (id) => nhanVienById.get(id)?.Ten || id;

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
          <Typography variant="caption" color="text.secondary">
            {searchText.trim()
              ? `Đang hiển thị ${tableData.length} kết quả phù hợp.`
              : "Nhập từ khóa để thu hẹp nhanh danh sách nhân viên."}
          </Typography>
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
        <Button onClick={handleConfirm} variant="contained" disabled={!mainId}>
          Xong
        </Button>
      </DialogActions>
    </Dialog>
  );
}
