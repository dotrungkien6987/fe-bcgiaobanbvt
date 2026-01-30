import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Checkbox,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  InputAdornment,
  Stack,
  Divider,
  CircularProgress,
} from "@mui/material";
import { SearchNormal1, CloseCircle, TickCircle } from "iconsax-react";
import { useSelector, useDispatch } from "react-redux";
import { updateDistribution } from "../quyTrinhISOSlice";
import { getISOKhoa } from "../../Daotao/Khoa/khoaSlice";

/**
 * DistributionDialog - Dialog chỉnh sửa phân phối quy trình
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - quyTrinh: object - Quy trình đang chỉnh sửa
 */
function DistributionDialog({ open, onClose, quyTrinh }) {
  const dispatch = useDispatch();
  const { ISOKhoa: allKhoa, isLoading: khoaLoading } = useSelector(
    (state) => state.khoa,
  );
  const { distributionLoading } = useSelector((state) => state.quyTrinhISO);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch ISO khoa on mount
  useEffect(() => {
    if (open && (!allKhoa || allKhoa.length === 0)) {
      dispatch(getISOKhoa());
    }
  }, [dispatch, open, allKhoa]);

  // Initialize selected IDs from quyTrinh
  useEffect(() => {
    if (open && quyTrinh?.KhoaPhanPhoi) {
      setSelectedIds(quyTrinh.KhoaPhanPhoi.map((k) => k._id));
    }
  }, [open, quyTrinh]);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  // Filter khoa (loại bỏ khoa xây dựng)
  const filteredKhoa = useMemo(() => {
    const khoaXayDungId =
      quyTrinh?.KhoaXayDungID?._id || quyTrinh?.KhoaXayDungID;
    return (allKhoa || [])
      .filter((k) => k._id !== khoaXayDungId)
      .filter((k) =>
        k.TenKhoa.toLowerCase().includes(searchTerm.toLowerCase()),
      );
  }, [allKhoa, quyTrinh, searchTerm]);

  const handleToggle = (khoaId) => {
    setSelectedIds((prev) =>
      prev.includes(khoaId)
        ? prev.filter((id) => id !== khoaId)
        : [...prev, khoaId],
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(filteredKhoa.map((k) => k._id));
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  const handleSave = async () => {
    const result = await dispatch(
      updateDistribution(quyTrinh._id, selectedIds),
    );
    if (result.success) {
      onClose();
    }
  };

  const loading = khoaLoading || distributionLoading;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6">✏️ Chỉnh Sửa Phân Phối</Typography>
        <Typography variant="body2" color="text.secondary">
          {quyTrinh?.MaQuyTrinh} v{quyTrinh?.PhienBan} - {quyTrinh?.TenQuyTrinh}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Khoa xây dựng: {quyTrinh?.KhoaXayDungID?.TenKhoa || "N/A"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm khoa..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchNormal1 size={18} />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Select All / Deselect All */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              startIcon={<TickCircle size={16} />}
              onClick={handleSelectAll}
              disabled={loading}
            >
              Chọn tất cả
            </Button>
            <Button
              size="small"
              startIcon={<CloseCircle size={16} />}
              onClick={handleDeselectAll}
              disabled={loading}
            >
              Bỏ chọn tất cả
            </Button>
          </Stack>
          <Typography variant="body2" color="primary" fontWeight="bold">
            Đã chọn: {selectedIds.length}/{filteredKhoa.length}
          </Typography>
        </Stack>

        <Divider sx={{ my: 1 }} />

        {/* Khoa List */}
        {khoaLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <List sx={{ maxHeight: 400, overflow: "auto" }}>
            {filteredKhoa.length === 0 ? (
              <ListItem>
                <ListItemText
                  primary="Không tìm thấy khoa nào"
                  sx={{ textAlign: "center", color: "text.secondary" }}
                />
              </ListItem>
            ) : (
              filteredKhoa.map((khoa) => (
                <ListItem key={khoa._id} disablePadding>
                  <ListItemButton
                    onClick={() => handleToggle(khoa._id)}
                    dense
                    disabled={loading}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedIds.includes(khoa._id)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={khoa.TenKhoa}
                      secondary={khoa.MaKhoa}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            )}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          startIcon={loading && <CircularProgress size={16} color="inherit" />}
        >
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DistributionDialog;
