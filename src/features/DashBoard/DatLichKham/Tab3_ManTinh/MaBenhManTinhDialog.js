import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Stack,
  IconButton,
  Tooltip,
  Typography,
  Box,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  Upload as UploadIcon,
  Save as SaveIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  fetchMaBenhManTinh,
  createMaBenhManTinh,
  updateMaBenhManTinh,
  deleteMaBenhManTinh,
  batchCreateMaBenhManTinh,
  selectDanhSachMaBenhManTinh,
  selectLoadingMaBenh,
} from "../datLichKhamSlice";

function MaBenhManTinhDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const danhSach = useSelector(selectDanhSachMaBenhManTinh);
  const loading = useSelector(selectLoadingMaBenh);

  const [search, setSearch] = useState("");
  const [editRow, setEditRow] = useState(null); // null | { _id?, maBenh, tenBenh, nhomBenh, ghiChu }
  const [batchMode, setBatchMode] = useState(false);
  const [batchText, setBatchText] = useState("");

  useEffect(() => {
    if (open) {
      dispatch(fetchMaBenhManTinh());
    }
  }, [open, dispatch]);

  const filtered = (danhSach || []).filter((m) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      (m.maBenh || "").toLowerCase().includes(s) ||
      (m.tenBenh || "").toLowerCase().includes(s) ||
      (m.nhomBenh || "").toLowerCase().includes(s)
    );
  });

  const handleAdd = useCallback(() => {
    setEditRow({ maBenh: "", tenBenh: "", nhomBenh: "", ghiChu: "" });
  }, []);

  const handleEdit = useCallback((row) => {
    setEditRow({ ...row });
  }, []);

  const handleSave = useCallback(async () => {
    if (!editRow) return;
    if (editRow._id) {
      const ok = await dispatch(
        updateMaBenhManTinh(editRow._id, {
          maBenh: editRow.maBenh,
          tenBenh: editRow.tenBenh,
          nhomBenh: editRow.nhomBenh,
          ghiChu: editRow.ghiChu,
        }),
      );
      if (ok) setEditRow(null);
    } else {
      const ok = await dispatch(
        createMaBenhManTinh({
          maBenh: editRow.maBenh,
          tenBenh: editRow.tenBenh,
          nhomBenh: editRow.nhomBenh,
          ghiChu: editRow.ghiChu,
        }),
      );
      if (ok) setEditRow(null);
    }
  }, [editRow, dispatch]);

  const handleDelete = useCallback(
    (id) => {
      if (window.confirm("Xóa mã bệnh này?")) {
        dispatch(deleteMaBenhManTinh(id));
      }
    },
    [dispatch],
  );

  const handleBatchImport = useCallback(async () => {
    // Parse: each line = "MaBenh - TenBenh" or "MaBenh | TenBenh | NhomBenh"
    const lines = batchText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    const items = lines
      .map((line) => {
        const parts = line.split(/[|\-–]/).map((p) => p.trim());
        return {
          maBenh: parts[0] || "",
          tenBenh: parts[1] || parts[0] || "",
          nhomBenh: parts[2] || "",
        };
      })
      .filter((item) => item.maBenh);

    if (items.length === 0) return;
    const ok = await dispatch(batchCreateMaBenhManTinh(items));
    if (ok) {
      setBatchMode(false);
      setBatchText("");
    }
  }, [batchText, dispatch]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            Danh sách mã bệnh mãn tính ({filtered.length})
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<UploadIcon />}
              onClick={() => setBatchMode(!batchMode)}
              variant={batchMode ? "contained" : "outlined"}
            >
              Import
            </Button>
            <Button
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              variant="contained"
              color="primary"
            >
              Thêm
            </Button>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm mã bệnh, tên bệnh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Batch import area */}
        {batchMode && (
          <Box sx={{ mb: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Nhập mỗi dòng: <strong>MãICD - Tên bệnh - Nhóm bệnh</strong> (phân
              cách bằng - hoặc |)
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={5}
              size="small"
              placeholder={
                "I10 - Tăng huyết áp - Tim mạch\nE11 - Đái tháo đường type 2 - Nội tiết\nJ45 - Hen phế quản - Hô hấp"
              }
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
            />
            <Button
              sx={{ mt: 1 }}
              size="small"
              variant="contained"
              onClick={handleBatchImport}
              disabled={!batchText.trim() || loading}
            >
              Import {batchText.split("\n").filter((l) => l.trim()).length} mã
              bệnh
            </Button>
          </Box>
        )}

        {/* Edit row (inline) */}
        {editRow && (
          <Box
            sx={{
              mb: 2,
              p: 2,
              bgcolor: "primary.50",
              borderRadius: 1,
              border: "1px solid",
              borderColor: "primary.200",
            }}
          >
            <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
              {editRow._id ? "Sửa mã bệnh" : "Thêm mã bệnh mới"}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <TextField
                size="small"
                label="Mã ICD"
                value={editRow.maBenh}
                onChange={(e) =>
                  setEditRow({ ...editRow, maBenh: e.target.value })
                }
                sx={{ width: 120 }}
                required
                inputProps={{ style: { textTransform: "uppercase" } }}
              />
              <TextField
                size="small"
                label="Tên bệnh"
                value={editRow.tenBenh}
                onChange={(e) =>
                  setEditRow({ ...editRow, tenBenh: e.target.value })
                }
                sx={{ flex: 1, minWidth: 200 }}
                required
              />
              <TextField
                size="small"
                label="Nhóm bệnh"
                value={editRow.nhomBenh}
                onChange={(e) =>
                  setEditRow({ ...editRow, nhomBenh: e.target.value })
                }
                sx={{ width: 160 }}
              />
              <TextField
                size="small"
                label="Ghi chú"
                value={editRow.ghiChu}
                onChange={(e) =>
                  setEditRow({ ...editRow, ghiChu: e.target.value })
                }
                sx={{ width: 160 }}
              />
              <IconButton
                color="primary"
                onClick={handleSave}
                disabled={!editRow.maBenh || !editRow.tenBenh || loading}
              >
                <SaveIcon />
              </IconButton>
              <IconButton onClick={() => setEditRow(null)}>
                <CloseIcon />
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* Table */}
        <TableContainer sx={{ maxHeight: 400 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold", width: 50 }}>
                  STT
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 100 }}>
                  Mã ICD
                </TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tên bệnh</TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 140 }}>
                  Nhóm bệnh
                </TableCell>
                <TableCell sx={{ fontWeight: "bold", width: 140 }}>
                  Ghi chú
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: "bold", width: 80 }}
                >
                  TT
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Chưa có mã bệnh mãn tính nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((row, idx) => (
                  <TableRow key={row._id} hover>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.maBenh}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{row.tenBenh}</TableCell>
                    <TableCell>{row.nhomBenh || "—"}</TableCell>
                    <TableCell>{row.ghiChu || "—"}</TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={0.5}
                        justifyContent="center"
                      >
                        <Tooltip title="Sửa">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(row)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(row._id)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}

export default MaBenhManTinhDialog;
