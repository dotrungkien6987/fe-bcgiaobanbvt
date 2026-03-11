import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  IconButton,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  SwipeableDrawer,
  alpha,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import {
  SearchNormal1,
  CloseCircle,
  Save2,
  Add,
  Building,
} from "iconsax-react";
import MainCard from "../../components/MainCard";
import useAuth from "../../hooks/useAuth";
import {
  getAllKhoa,
  bulkUpdateISO,
  checkISODistributions,
} from "../Daotao/Khoa/khoaSlice";

// ─── Sub-component: AddKhoaDialog ────────────────────────────────
// Checkbox multi-select để thêm nhiều khoa vào ISO cùng lúc
function AddKhoaDialog({ open, onClose, availableKhoa, onAddMultiple, isMobile }) {
  const theme = useTheme();
  const [pendingIds, setPendingIds] = useState([]);
  const [search, setSearch] = useState("");

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

  const iOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const content = (
    <Box sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.success.main, 0.04),
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            Chọn khoa để thêm vào ISO
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

      {/* Select All / Clear All */}
      {filtered.length > 0 && (
        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              onClick={() => setPendingIds(filtered.map((k) => k._id))}
              sx={{ textTransform: "none", fontSize: "0.8rem" }}
            >
              Chọn tất cả ({filtered.length})
            </Button>
            {pendingIds.length > 0 && (
              <Button
                size="small"
                color="error"
                onClick={() => setPendingIds([])}
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
            <Building size={40} color={theme.palette.grey[400]} variant="Bulk" />
            <Typography variant="body2" color="text.secondary" mt={1}>
              {search ? "Không tìm thấy khoa phù hợp" : "Tất cả khoa đã được đánh dấu ISO"}
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
                      secondary={`${khoa.MaKhoa} • STT: ${khoa.STT}`}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        )}
      </Box>

      {/* Footer */}
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

  if (isMobile) {
    return (
      <SwipeableDrawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        onOpen={() => {}}
        disableBackdropTransition={!iOS}
        disableDiscovery={iOS}
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
        <Box sx={{ display: "flex", justifyContent: "center", pt: 1.5, pb: 0.5 }}>
          <Box sx={{ width: 40, height: 4, bgcolor: "grey.300", borderRadius: 2 }} />
        </Box>
        {content}
      </SwipeableDrawer>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Box sx={{ display: "flex", flexDirection: "column", height: "60vh" }}>
        {content}
      </Box>
    </Dialog>
  );
}

// ─── Sub-component: ISOKhoaCard ───────────────────────────────────
// Premium card cho mỗi khoa ISO
function ISOKhoaCard({ khoa, index, onRemove, theme, alpha: alphafn }) {
  return (
    <Box
      sx={{
        position: "relative",
        p: 2,
        pt: 3,
        borderRadius: 3,
        border: "1px solid",
        borderColor: alphafn(theme.palette.success.main, 0.2),
        borderLeftWidth: "4px",
        borderLeftColor: theme.palette.success.main,
        background: `linear-gradient(135deg, ${alphafn(theme.palette.success.main, 0.07)} 0%, ${theme.palette.background.paper} 60%)`,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        transition: "all 0.2s ease",
        "&:hover": {
          borderColor: alphafn(theme.palette.success.main, 0.4),
          borderLeftColor: theme.palette.success.main,
          boxShadow: `0 6px 18px ${alphafn(theme.palette.success.main, 0.18)}`,
          transform: "translateY(-2px)",
        },
      }}
    >
      {/* Watermark icon */}
      <Box sx={{
        position: "absolute", right: -8, bottom: -8,
        opacity: 0.05, pointerEvents: "none",
      }}>
        <Building size={64} color={theme.palette.success.main} variant="Bulk" />
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
          bgcolor: "success.main",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "0.7rem",
          fontWeight: 700,
          lineHeight: 1,
          boxShadow: `0 2px 6px ${alphafn(theme.palette.success.main, 0.4)}`,
        }}
      >
        {index + 1}
      </Box>

      {/* Remove button — góc trên phải */}
      <IconButton
        size="small"
        onClick={() => onRemove(khoa._id)}
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
        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          <Chip
            label={khoa.MaKhoa}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.7rem",
              bgcolor: alphafn(theme.palette.success.main, 0.1),
              color: theme.palette.success.dark,
              "& .MuiChip-label": { px: 1 },
            }}
          />
          {khoa.STT !== undefined && (
            <Chip
              label={`STT ${khoa.STT}`}
              size="small"
              sx={{
                height: 20,
                fontSize: "0.7rem",
                bgcolor: alpha(theme.palette.grey[500], 0.1),
                color: "text.secondary",
                "& .MuiChip-label": { px: 1 },
              }}
            />
          )}
        </Stack>
      </Stack>
    </Box>
  );
}

// ─── Main: ISOKhoaManagementPage ─────────────────────────────────
/**
 * ISOKhoaManagementPage - Quản lý khoa liên quan ISO (QLCL only)
 *
 * Features:
 * - Single panel: danh sách ISO khoa dạng grid card (premium UI)
 * - "Thêm khoa" button mở AddKhoaDialog (checkbox multi-select)
 * - X trên mỗi card để xóa khoa khỏi ISO
 * - Stats bar + Save/Cancel
 * - Cascade warning khi bỏ khoa có phân phối
 */
function ISOKhoaManagementPage() {
  const theme = useTheme();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const { user } = useAuth();

  const { Khoa: allKhoa, isLoading: khoaLoading } = useSelector(
    (state) => state.khoa,
  );

  const [search, setSearch] = useState("");
  const [isoKhoaIds, setIsoKhoaIds] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  // Cascade warning state
  const [cascadeWarning, setCascadeWarning] = useState(null);
  const [cascadeConfirming, setCascadeConfirming] = useState(false);

  const isQLCL = ["qlcl", "admin", "superadmin"].includes(
    user?.PhanQuyen?.toLowerCase(),
  );

  useEffect(() => {
    if (!isQLCL) {
      navigate("/quytrinh-iso");
    }
  }, [isQLCL, navigate]);

  // Fetch all khoa on mount
  useEffect(() => {
    if (allKhoa.length === 0) {
      dispatch(getAllKhoa());
    }
  }, [dispatch, allKhoa.length]);

  // Initialize ISO khoa IDs from existing data
  useEffect(() => {
    if (allKhoa.length > 0 && isoKhoaIds.length === 0 && !hasChanges) {
      const initialIsoIds = allKhoa
        .filter((k) => k.IsISORelevant)
        .map((k) => k._id);
      setIsoKhoaIds(initialIsoIds);
    }
  }, [allKhoa, isoKhoaIds.length, hasChanges]);

  // Non-ISO khoa (dành cho AddKhoaDialog)
  const nonISOKhoa = useMemo(() => {
    return allKhoa.filter((k) => !isoKhoaIds.includes(k._id));
  }, [allKhoa, isoKhoaIds]);

  // ISO khoa — filtered by search
  const filteredISOKhoa = useMemo(() => {
    const isoList = allKhoa.filter((k) => isoKhoaIds.includes(k._id));
    if (!search) return isoList;
    const q = search.toLowerCase();
    return isoList.filter(
      (k) =>
        k.TenKhoa.toLowerCase().includes(q) ||
        k.MaKhoa?.toLowerCase().includes(q),
    );
  }, [allKhoa, isoKhoaIds, search]);

  const handleRemove = (khoaId) => {
    setIsoKhoaIds((prev) => prev.filter((id) => id !== khoaId));
    setHasChanges(true);
  };

  const handleAddMultiple = (ids) => {
    setIsoKhoaIds((prev) => [...new Set([...prev, ...ids])]);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const originalIsoIds = allKhoa
        .filter((k) => k.IsISORelevant)
        .map((k) => k._id);

      const toMarkISO = isoKhoaIds.filter((id) => !originalIsoIds.includes(id));
      const toUnmarkISO = originalIsoIds.filter(
        (id) => !isoKhoaIds.includes(id),
      );

      // Check distributions before unconfiguring
      if (toUnmarkISO.length > 0) {
        const { affected, total } = await dispatch(
          checkISODistributions(toUnmarkISO),
        );
        if (affected.length > 0) {
          setCascadeWarning({ toUnmarkISO, toMarkISO, affected, total });
          setSaving(false);
          return;
        }
      }

      await executeSave(toMarkISO, toUnmarkISO, false);
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const executeSave = async (toMarkISO, toUnmarkISO, cascade) => {
    if (toMarkISO.length > 0) {
      await dispatch(bulkUpdateISO(toMarkISO, true));
    }
    if (toUnmarkISO.length > 0) {
      await dispatch(bulkUpdateISO(toUnmarkISO, false, cascade));
    }
    setHasChanges(false);
  };

  const handleCascadeConfirm = async () => {
    if (!cascadeWarning) return;
    setCascadeConfirming(true);
    try {
      await executeSave(
        cascadeWarning.toMarkISO,
        cascadeWarning.toUnmarkISO,
        true,
      );
      setCascadeWarning(null);
    } finally {
      setCascadeConfirming(false);
    }
  };

  const handleCancel = () => {
    const originalIsoIds = allKhoa
      .filter((k) => k.IsISORelevant)
      .map((k) => k._id);
    setIsoKhoaIds(originalIsoIds);
    setHasChanges(false);
  };

  return (
    <MainCard
      title={
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            ⚙️ Quản Lý Khoa Liên Quan ISO
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cấu hình các khoa liên quan đến quy trình ISO
          </Typography>
        </Box>
      }
    >
      {/* Stats Bar */}
      <Paper
        variant="outlined"
        sx={{
          p: isMobile ? 1.5 : 2,
          mb: 3,
          bgcolor: alpha(theme.palette.info.main, 0.03),
          borderColor: theme.palette.info.main,
        }}
      >
        <Stack
          direction="row"
          spacing={isMobile ? 2 : 4}
          justifyContent="center"
          alignItems="center"
          flexWrap="wrap"
        >
          <Box textAlign="center">
            <Typography variant="h4" color="primary" fontWeight="bold">
              {allKhoa.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tổng số khoa
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {isoKhoaIds.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Khoa ISO
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="h4" color="text.secondary">
              {allKhoa.length - isoKhoaIds.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Không ISO
            </Typography>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box textAlign="center">
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {allKhoa.length > 0
                ? Math.round((isoKhoaIds.length / allKhoa.length) * 100)
                : 0}
              %
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tỷ lệ ISO
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Action Row */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
        sx={{ mb: 2 }}
      >
        <TextField
          size="small"
          placeholder="Tìm khoa ISO..."
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
          sx={{ flex: 1 }}
        />
        <Stack direction="row" spacing={1} justifyContent={{ xs: "flex-end", sm: "flex-end" }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleCancel}
            disabled={!hasChanges || saving}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="success"
            startIcon={<Add size={18} />}
            onClick={() => setAddDialogOpen(true)}
            disabled={khoaLoading || nonISOKhoa.length === 0}
          >
            Thêm khoa
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={!hasChanges || saving}
            startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <Save2 size={18} />}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </Button>
        </Stack>
      </Stack>

      {/* Unsaved changes alert */}
      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Bạn có thay đổi chưa lưu. Nhấn <strong>Lưu</strong> để áp dụng.
        </Alert>
      )}

      {/* ISO Khoa Grid */}
      {khoaLoading ? (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress size={36} />
        </Box>
      ) : filteredISOKhoa.length === 0 ? (
        <Box sx={{ textAlign: "center", py: 8, px: 2 }}>
          <Building size={56} color={theme.palette.grey[400]} variant="Bulk" />
          <Typography variant="h6" color="text.secondary" mt={2} mb={1}>
            {search ? "Không tìm thấy khoa phù hợp" : "Chưa có khoa ISO nào"}
          </Typography>
          {!search && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Add size={18} />}
              onClick={() => setAddDialogOpen(true)}
              disabled={nonISOKhoa.length === 0}
              sx={{ mt: 1 }}
            >
              Thêm khoa ISO đầu tiên
            </Button>
          )}
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
            gap: 1.5,
          }}
        >
          {filteredISOKhoa.map((khoa, index) => (
            <ISOKhoaCard
              key={khoa._id}
              khoa={khoa}
              index={index}
              onRemove={handleRemove}
              theme={theme}
              alpha={alpha}
            />
          ))}
        </Box>
      )}

      {/* AddKhoaDialog */}
      <AddKhoaDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        availableKhoa={nonISOKhoa}
        onAddMultiple={handleAddMultiple}
        isMobile={isMobile}
      />

      {/* Cascade Warning Dialog */}
      <Dialog
        open={!!cascadeWarning}
        onClose={() => !cascadeConfirming && setCascadeWarning(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ color: "warning.dark" }}>
          Chú ý: Bỏ cấu hình sẽ xóa bản ghi phân phối
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Các khoa sau đang được phân phối tài liệu ISO. Bỏ cấu hình sẽ{" "}
            <strong>
              xóa vĩnh viễn {cascadeWarning?.total} bản ghi phân phối
            </strong>
            .
          </DialogContentText>
          <List dense disablePadding>
            {cascadeWarning?.affected.map((item) => (
              <ListItem key={item.khoaId} sx={{ px: 0 }}>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={500}>
                      {item.TenKhoa}{" "}
                      <Chip
                        label={`${item.soTaiLieu} tài liệu`}
                        size="small"
                        color="warning"
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  }
                  secondary={item.MaKhoa}
                />
              </ListItem>
            ))}
          </List>
          <Alert severity="error" sx={{ mt: 2 }}>
            Hành động này không thể hoàn tác. Người dùng tại các khoa trên sẽ
            không còn thấy các tài liệu đã phân phối.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCascadeWarning(null)}
            disabled={cascadeConfirming}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCascadeConfirm}
            disabled={cascadeConfirming}
            startIcon={
              cascadeConfirming ? (
                <CircularProgress size={16} color="inherit" />
              ) : null
            }
          >
            Xác nhận xóa
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
}

export default ISOKhoaManagementPage;
