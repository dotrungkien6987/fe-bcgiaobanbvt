import { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  IconButton,
  Chip,
  Alert,
  Checkbox,
  SwipeableDrawer,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { SearchNormal1, CloseCircle, Add, Building } from "iconsax-react";
import { useSelector, useDispatch } from "react-redux";
import { updateDistribution } from "../quyTrinhISOSlice";
import { getISOKhoa } from "../../Daotao/Khoa/khoaSlice";

// ─── Sub-component: AddDepartmentsDialog ─────────────────────────
// Bottom sheet (mobile) / Dialog (desktop) cho phep tich chon nhieu khoa
function AddDepartmentsDialog({
  open,
  onClose,
  availableKhoa,
  loading,
  onAddMultiple,
  isMobile,
}) {
  const theme = useTheme();
  const [pendingIds, setPendingIds] = useState([]);
  const [search, setSearch] = useState("");

  // Reset on open
  useEffect(() => {
    if (open) {
      setPendingIds([]);
      setSearch("");
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!search) return availableKhoa;
    const q = search.toLowerCase();
    return availableKhoa.filter(
      (k) =>
        k.TenKhoa.toLowerCase().includes(q) ||
        k.MaKhoa?.toLowerCase().includes(q),
    );
  }, [availableKhoa, search]);

  const togglePending = (id) => {
    setPendingIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleConfirm = () => {
    onAddMultiple(pendingIds);
    onClose();
  };

  const handleSelectAll = () => {
    setPendingIds(filtered.map((k) => k._id));
  };

  const handleClearAll = () => {
    setPendingIds([]);
  };

  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const content = (
    <Box
      sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}
    >
      {/* Header with search */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.success.main, 0.04),
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            Chọn khoa để thêm
          </Typography>
          <Chip
            label={`${pendingIds.length} đã chọn`}
            size="small"
            color={pendingIds.length > 0 ? "success" : "default"}
          />
        </Stack>
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm khoa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchNormal1 size={16} />
              </InputAdornment>
            ),
            endAdornment: search && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch("")}>
                  <CloseCircle size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Select All / Clear All row */}
      {filtered.length > 0 && (
        <Box
          sx={{
            px: 2,
            py: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={handleSelectAll}
              disabled={loading}
              sx={{ textTransform: "none", fontSize: "0.8rem" }}
            >
              Chọn tất cả ({filtered.length})
            </Button>
            {pendingIds.length > 0 && (
              <Button
                size="small"
                color="error"
                onClick={handleClearAll}
                disabled={loading}
                sx={{ textTransform: "none", fontSize: "0.8rem" }}
              >
                Bỏ chọn
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* Checkbox List */}
      <Box sx={{ flex: 1, overflow: "auto", p: 1, minHeight: 0 }}>
        {filtered.length === 0 ? (
          <Box textAlign="center" py={4}>
            <Building
              size={40}
              color={theme.palette.grey[400]}
              variant="Bulk"
            />
            <Typography variant="body2" color="text.secondary" mt={1}>
              {search
                ? "Không tìm thấy khoa phù hợp"
                : "Không còn khoa nào để thêm"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {filtered.map((khoa) => {
              const checked = pendingIds.includes(khoa._id);
              return (
                <ListItem key={khoa._id} disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => togglePending(khoa._id)}
                    disabled={loading}
                    sx={{
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: checked
                        ? theme.palette.success.main
                        : theme.palette.divider,
                      bgcolor: checked
                        ? alpha(theme.palette.success.main, 0.06)
                        : "background.paper",
                      transition: "all 0.15s ease",
                      py: 0.75,
                    }}
                  >
                    <Checkbox
                      checked={checked}
                      color="success"
                      size="small"
                      tabIndex={-1}
                      disableRipple
                      sx={{ mr: 1, p: 0 }}
                    />
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={500}>
                          {khoa.TenKhoa}
                        </Typography>
                      }
                      secondary={khoa.MaKhoa}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: "background.paper",
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button
            variant="outlined"
            onClick={onClose}
            size={isMobile ? "large" : "medium"}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleConfirm}
            disabled={pendingIds.length === 0}
            startIcon={<Add size={18} />}
            size={isMobile ? "large" : "medium"}
          >
            Thêm{pendingIds.length > 0 ? ` (${pendingIds.length})` : ""}
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  // Mobile: SwipeableDrawer bottom sheet
  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
        sx={{ zIndex: 1500 }}
        PaperProps={{
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            height: "85vh",
            display: "flex",
            flexDirection: "column",
          },
        }}
      >
        {/* Drag handle */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            pt: 1.5,
            pb: 0.5,
          }}
        >
          <Box
            sx={{
              width: 40,
              height: 4,
              bgcolor: "grey.300",
              borderRadius: 2,
            }}
          />
        </Box>
        {content}
      </SwipeableDrawer>
    );
  }

  // Desktop: nested Dialog
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{ zIndex: 1500 }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "60vh" }}>
        {content}
      </Box>
    </Dialog>
  );
}

// ─── Sub-component: KhoaDistributionCard ─────────────────────────
// Premium card cho mỗi khoa đã được phân phối
function KhoaDistributionCard({
  khoa,
  index,
  onRemove,
  disabled,
  theme,
  alpha: alphafn,
}) {
  return (
    <Box
      sx={{
        position: "relative",
        p: 2,
        pt: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alphafn(theme.palette.primary.main, 0.2),
        borderLeftWidth: "4px",
        borderLeftColor: theme.palette.primary.main,
        background: `linear-gradient(135deg, ${alphafn(theme.palette.primary.main, 0.07)} 0%, ${theme.palette.background.paper} 60%)`,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: alphafn(theme.palette.primary.main, 0.4),
          borderLeftColor: theme.palette.primary.main,
          boxShadow: `0 6px 18px ${alphafn(theme.palette.primary.main, 0.18)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Watermark icon */}
      <Box
        sx={{
          position: "absolute",
          right: -8,
          bottom: -8,
          opacity: 0.05,
          pointerEvents: "none",
        }}
      >
        <Building size={64} color={theme.palette.primary.main} variant="Bulk" />
      </Box>

      {/* STT badge — góc trên trái */}
      <Box
        sx={{
          position: "absolute",
          top: 8,
          left: 8,
          width: 22,
          height: 22,
          borderRadius: "50%",
          bgcolor: "primary.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          fontWeight: 700,
          lineHeight: 1,
          boxShadow: `0 2px 6px ${alphafn(theme.palette.primary.main, 0.4)}`,
        }}
      >
        {index + 1}
      </Box>

      {/* Remove button — góc trên phải */}
      <IconButton
        size="small"
        onClick={() => onRemove(khoa._id)}
        disabled={disabled}
        sx={{
          position: "absolute",
          top: 4,
          right: 4,
          color: "error.main",
          opacity: 0.5,
          transition: "opacity 0.15s, background 0.15s",
          "&:hover": {
            opacity: 1,
            bgcolor: alphafn(theme.palette.error.main, 0.08),
          },
        }}
      >
        <CloseCircle size={16} />
      </IconButton>

      {/* Content */}
      <Stack spacing={0.75} sx={{ mt: 0.5 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ pr: 2.5, lineHeight: 1.4 }}
        >
          {khoa.TenKhoa}
        </Typography>
        <Chip
          label={khoa.MaKhoa}
          size="small"
          sx={{
            alignSelf: "flex-start",
            height: 20,
            fontSize: "0.7rem",
            bgcolor: alphafn(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.dark,
            "& .MuiChip-label": { px: 1 },
          }}
        />
      </Stack>
    </Box>
  );
}

// ─── Main Component: DistributionDialogV2 ────────────────────────
/**
 * DistributionDialogV2 - Dialog phan phoi quy trinh
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - quyTrinh: object
 */
function DistributionDialogV2({ open, onClose, quyTrinh }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { ISOKhoa: allKhoa, isLoading: khoaLoading } = useSelector(
    (state) => state.khoa,
  );
  const { distributionLoading } = useSelector((state) => state.quyTrinhISO);

  const [searchSelected, setSearchSelected] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [initialIds, setInitialIds] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch ISO khoa on mount
  useEffect(() => {
    if (open && (!allKhoa || allKhoa.length === 0)) {
      dispatch(getISOKhoa());
    }
  }, [dispatch, open, allKhoa]);

  // Initialize selected IDs from quyTrinh
  useEffect(() => {
    if (open && quyTrinh?.KhoaPhanPhoi) {
      const ids = quyTrinh.KhoaPhanPhoi.map((k) => k._id);
      setSelectedIds(ids);
      setInitialIds(ids);
    }
  }, [open, quyTrinh]);

  // Reset search on close
  useEffect(() => {
    if (!open) {
      setSearchSelected("");
    }
  }, [open]);

  const validKhoa = useMemo(() => {
    return allKhoa || [];
  }, [allKhoa]);

  // Available khoa (chua chon)
  const availableKhoa = useMemo(() => {
    return validKhoa.filter((k) => !selectedIds.includes(k._id));
  }, [validKhoa, selectedIds]);

  // Selected khoa (da chon) + search filter
  const selectedKhoa = useMemo(() => {
    return validKhoa
      .filter((k) => selectedIds.includes(k._id))
      .filter((k) =>
        searchSelected
          ? k.TenKhoa.toLowerCase().includes(searchSelected.toLowerCase()) ||
            k.MaKhoa?.toLowerCase().includes(searchSelected.toLowerCase())
          : true,
      );
  }, [validKhoa, selectedIds, searchSelected]);

  const handleRemove = (khoaId) => {
    setSelectedIds((prev) => prev.filter((id) => id !== khoaId));
  };

  const handleAddMultiple = (ids) => {
    setSelectedIds((prev) => [...new Set([...prev, ...ids])]);
  };

  const handleSave = () => {
    setConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    setConfirmOpen(false);
    await dispatch(updateDistribution(quyTrinh._id, selectedIds));
    onClose();
  };

  // Compute changes for confirmation dialog
  const removedKhoa = useMemo(() => {
    return validKhoa.filter(
      (k) => initialIds.includes(k._id) && !selectedIds.includes(k._id),
    );
  }, [validKhoa, initialIds, selectedIds]);

  const addedKhoa = useMemo(() => {
    return validKhoa.filter(
      (k) => !initialIds.includes(k._id) && selectedIds.includes(k._id),
    );
  }, [validKhoa, initialIds, selectedIds]);

  const loading = khoaLoading || distributionLoading;
  const isNotActive = quyTrinh?.TrangThai !== "ACTIVE";

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen
      PaperProps={{
        sx: {
          // Trên desktop: giới hạn chiều rộng nhưng vẫn full screen chiều cao
          maxWidth: { md: "90vw" },
          margin: { md: "auto" },
          borderRadius: { md: 2 },
          height: { md: "92vh" },
          alignSelf: { md: "center" },
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
          py: isMobile ? 1.5 : 2,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={600} mb={0.5}>
            Phân Phối Quy Trình
          </Typography>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {quyTrinh?.MaQuyTrinh} v{quyTrinh?.PhienBan}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {quyTrinh?.TenQuyTrinh}
          </Typography>
          <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" useFlexGap>
            <Chip
              label={`Khoa xây dựng: ${quyTrinh?.KhoaXayDungID?.TenKhoa || "N/A"}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`Tổng: ${validKhoa.length} khoa`}
              size="small"
              color="info"
            />
          </Stack>
        </Box>
      </DialogTitle>

      <DialogContent
        sx={{
          p: isMobile ? 1.5 : 3,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        {/* Not-ACTIVE Warning */}
        {isNotActive && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              Không thể chỉnh sửa phân phối
            </Typography>
            <Typography variant="caption">
              Quy trình phải ở trạng thái <strong>Đang hiệu lực</strong> mới có
              thể phân phối. Hiện tại:{" "}
              <strong>
                {quyTrinh?.TrangThai === "DRAFT" ? "Nháp" : "Đã thu hồi"}
              </strong>
              .
            </Typography>
          </Alert>
        )}

        {/* Empty State Alert - No ISO Khoa */}
        {!khoaLoading && (!allKhoa || allKhoa.length === 0) && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2" fontWeight={500}>
              Chưa có khoa nào được đánh dấu liên quan ISO
            </Typography>
            <Typography variant="caption">
              Vui lòng vào <strong>Quản lý Khoa</strong> để đánh dấu các khoa
              liên quan đến quy trình ISO
            </Typography>
          </Alert>
        )}

        {/* Stats Bar */}
        <Paper
          variant="outlined"
          sx={{
            p: isMobile ? 1 : 2,
            mb: 2,
            bgcolor: alpha(theme.palette.info.main, 0.03),
            borderColor: theme.palette.info.main,
          }}
        >
          <Stack
            direction="row"
            spacing={isMobile ? 1.5 : 3}
            justifyContent="center"
            alignItems="center"
            flexWrap="wrap"
          >
            <Box textAlign="center">
              <Typography variant="h4" color="primary" fontWeight="bold">
                {selectedIds.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Được phân phối
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box textAlign="center">
              <Typography variant="h4" color="text.secondary">
                {availableKhoa.length}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Còn lại
              </Typography>
            </Box>
            <Divider orientation="vertical" flexItem />
            <Box textAlign="center">
              <Typography variant="h4" color="info.main" fontWeight="bold">
                {validKhoa.length > 0
                  ? Math.round((selectedIds.length / validKhoa.length) * 100)
                  : 0}
                %
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tỷ lệ phân phối
              </Typography>
            </Box>
          </Stack>
        </Paper>

        {/* Action Row: Search + Add Button */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
          <TextField
            fullWidth
            size="small"
            placeholder="Tìm khoa đã phân phối..."
            value={searchSelected}
            onChange={(e) => setSearchSelected(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchNormal1 size={16} />
                </InputAdornment>
              ),
              endAdornment: searchSelected && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchSelected("")}
                  >
                    <CloseCircle size={16} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="success"
            startIcon={<Add size={18} />}
            onClick={() => setAddDialogOpen(true)}
            disabled={loading || availableKhoa.length === 0 || isNotActive}
            sx={{
              whiteSpace: "nowrap",
              minWidth: "auto",
              px: isMobile ? 2 : 3,
              py: 1,
            }}
          >
            Thêm khoa
          </Button>
        </Stack>

        {/* Selected Departments — 2-column grid */}
        <Box sx={{ flex: 1, overflow: "auto", minHeight: 0 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress size={32} />
            </Box>
          ) : selectedKhoa.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6, px: 2 }}>
              <Building
                size={48}
                color={theme.palette.grey[400]}
                variant="Bulk"
              />
              <Typography variant="body1" color="text.secondary" mt={2} mb={1}>
                {searchSelected
                  ? "Không tìm thấy khoa phù hợp"
                  : "Chưa chọn khoa nào"}
              </Typography>
              {!searchSelected && availableKhoa.length > 0 && !isNotActive && (
                <Button
                  variant="outlined"
                  color="success"
                  startIcon={<Add size={18} />}
                  onClick={() => setAddDialogOpen(true)}
                  sx={{ mt: 1 }}
                >
                  Thêm khoa ngay
                </Button>
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
                gap: 1.5,
                p: 0.5,
              }}
            >
              {selectedKhoa.map((khoa, index) => (
                <KhoaDistributionCard
                  key={khoa._id}
                  khoa={khoa}
                  index={index}
                  onRemove={handleRemove}
                  disabled={loading || isNotActive}
                  theme={theme}
                  alpha={alpha}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.grey[500], 0.02),
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          width="100%"
        >
          <Typography variant="body2" color="text.secondary">
            {selectedIds.length > 0
              ? `Đang chọn ${selectedIds.length} khoa`
              : "Chưa chọn khoa nào"}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button onClick={onClose} disabled={loading} variant="outlined">
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={loading || isNotActive}
              startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              Lưu thay đổi
            </Button>
          </Stack>
        </Stack>
      </DialogActions>

      {/* Add Departments Sub-Dialog */}
      <AddDepartmentsDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        availableKhoa={availableKhoa}
        loading={loading}
        onAddMultiple={handleAddMultiple}
        isMobile={isMobile}
      />

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận cập nhật phân phối</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Cập nhật phân phối cho <b>{selectedIds.length}</b> khoa.
          </Typography>
          {addedKhoa.length > 0 && (
            <Alert severity="info" sx={{ mb: 1 }}>
              <b>Thêm {addedKhoa.length} khoa:</b>{" "}
              {addedKhoa.map((k) => k.TenKhoa).join(", ")}
            </Alert>
          )}
          {removedKhoa.length > 0 && (
            <Alert severity="warning" sx={{ mb: 1 }}>
              <b>Gỡ {removedKhoa.length} khoa:</b>{" "}
              {removedKhoa.map((k) => k.TenKhoa).join(", ")}. Các khoa này sẽ
              không còn truy cập quy trình.
            </Alert>
          )}
          {addedKhoa.length === 0 && removedKhoa.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              Không có thay đổi nào.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSave}
            disabled={addedKhoa.length === 0 && removedKhoa.length === 0}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}

export default DistributionDialogV2;
