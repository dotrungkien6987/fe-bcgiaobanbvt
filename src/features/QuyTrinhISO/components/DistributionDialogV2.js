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
  Tooltip,
  Chip,
  Badge,
  Alert,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  SearchNormal1,
  ArrowRight2,
  ArrowLeft2,
  ArrowUp,
  ArrowDown,
  CloseCircle,
  Maximize4,
  MinusSquare,
  Add,
  Minus,
} from "iconsax-react";
import { useSelector, useDispatch } from "react-redux";
import { updateDistribution } from "../quyTrinhISOSlice";
import { getISOKhoa } from "../../Daotao/Khoa/khoaSlice";

/**
 * DistributionDialogV2 - Dialog phân phối quy trình với Split Panel UI
 *
 * Features:
 * - Split panel: Available (trái) vs Selected (phải)
 * - Fullscreen mode
 * - Transfer buttons với badge count
 * - Search trong cả 2 panel
 * - Visual feedback rõ ràng
 * - Quick stats bar
 * - Hover effects & animations
 *
 * Props:
 * - open: boolean
 * - onClose: () => void
 * - quyTrinh: object - Quy trình đang chỉnh sửa
 */
function DistributionDialogV2({ open, onClose, quyTrinh }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const { ISOKhoa: allKhoa, isLoading: khoaLoading } = useSelector(
    (state) => state.khoa,
  );
  const { distributionLoading } = useSelector((state) => state.quyTrinhISO);

  const [searchAvailable, setSearchAvailable] = useState("");
  const [searchSelected, setSearchSelected] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [fullscreen, setFullscreen] = useState(true);
  const [hoveredItem, setHoveredItem] = useState(null);

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
      setSearchAvailable("");
      setSearchSelected("");
      setFullscreen(false);
    }
  }, [open]);

  // Loại bỏ khoa xây dựng
  const khoaXayDungId = quyTrinh?.KhoaXayDungID?._id || quyTrinh?.KhoaXayDungID;
  const validKhoa = useMemo(() => {
    return (allKhoa || []).filter((k) => k._id !== khoaXayDungId);
  }, [allKhoa, khoaXayDungId]);

  // Available khoa (chưa chọn)
  const availableKhoa = useMemo(() => {
    return validKhoa
      .filter((k) => !selectedIds.includes(k._id))
      .filter((k) =>
        searchAvailable
          ? k.TenKhoa.toLowerCase().includes(searchAvailable.toLowerCase()) ||
            k.MaKhoa?.toLowerCase().includes(searchAvailable.toLowerCase())
          : true,
      );
  }, [validKhoa, selectedIds, searchAvailable]);

  // Selected khoa (đã chọn)
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

  // Add single khoa
  const handleAdd = (khoaId) => {
    setSelectedIds((prev) => [...prev, khoaId]);
  };

  // Remove single khoa
  const handleRemove = (khoaId) => {
    setSelectedIds((prev) => prev.filter((id) => id !== khoaId));
  };

  // Add all filtered available
  const handleAddAll = () => {
    const newIds = availableKhoa.map((k) => k._id);
    setSelectedIds((prev) => [...new Set([...prev, ...newIds])]);
  };

  // Remove all filtered selected
  const handleRemoveAll = () => {
    const removeIds = selectedKhoa.map((k) => k._id);
    setSelectedIds((prev) => prev.filter((id) => !removeIds.includes(id)));
  };

  const handleSave = async () => {
    await dispatch(updateDistribution(quyTrinh._id, selectedIds));
    onClose();
  };

  const loading = khoaLoading || distributionLoading;

  // Panel renderer
  const renderPanel = (
    title,
    khoas,
    searchValue,
    setSearchValue,
    isSelected,
  ) => (
    <Paper
      elevation={0}
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: isMobile ? "auto" : "auto",
        border: `2px solid ${
          isSelected ? theme.palette.success.main : theme.palette.grey[300]
        }`,
        borderRadius: 2,
        overflow: "hidden",
        bgcolor: isSelected
          ? alpha(theme.palette.success.main, 0.02)
          : "background.paper",
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          p: isMobile ? 1 : 2,
          bgcolor: isSelected
            ? alpha(theme.palette.success.main, 0.1)
            : alpha(theme.palette.grey[500], 0.05),
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={1.5}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Chip
            label={khoas.length}
            size="small"
            color={isSelected ? "success" : "default"}
            sx={{ fontWeight: "bold", minWidth: 40 }}
          />
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchNormal1 size={16} />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchValue("")}>
                  <CloseCircle size={16} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {/* Panel Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: 1,
          minHeight: 0,
        }}
      >
        {loading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={32} />
          </Box>
        ) : khoas.length === 0 ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={4}
            px={2}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              textAlign="center"
            >
              {searchValue
                ? "Không tìm thấy khoa phù hợp"
                : isSelected
                  ? "Chưa chọn khoa nào"
                  : "Không còn khoa nào"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {khoas.map((khoa) => (
              <ListItem key={khoa._id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() =>
                    isSelected ? handleRemove(khoa._id) : handleAdd(khoa._id)
                  }
                  onMouseEnter={() => setHoveredItem(khoa._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  disabled={loading}
                  sx={{
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor:
                      hoveredItem === khoa._id
                        ? alpha(
                            isSelected
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                            0.08,
                          )
                        : "background.paper",
                    transition: "all 0.2s",
                    "&:hover": {
                      transform: "translateX(4px)",
                      boxShadow: 1,
                    },
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {khoa.TenKhoa}
                      </Typography>
                    }
                    secondary={khoa.MaKhoa}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      opacity: hoveredItem === khoa._id ? 1 : 0,
                      transition: "opacity 0.2s",
                      color: isSelected ? "error.main" : "success.main",
                    }}
                  >
                    {isSelected ? <Minus size={16} /> : <Add size={16} />}
                  </IconButton>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={fullscreen ? false : "lg"}
      fullWidth
      fullScreen={fullscreen}
      PaperProps={{
        sx: {
          height: fullscreen ? "100vh" : isMobile ? "90vh" : "80vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          bgcolor: alpha(theme.palette.primary.main, 0.05),
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box flex={1}>
            <Typography variant="h6" fontWeight={600} mb={0.5}>
              🎯 Phân Phối Quy Trình
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {quyTrinh?.MaQuyTrinh} v{quyTrinh?.PhienBan}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {quyTrinh?.TenQuyTrinh}
            </Typography>
            <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
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
          <Tooltip title={fullscreen ? "Thu nhỏ" : "Toàn màn hình"}>
            <IconButton
              size="small"
              onClick={() => setFullscreen(!fullscreen)}
              sx={{ ml: 1 }}
            >
              {fullscreen ? <MinusSquare size={20} /> : <Maximize4 size={20} />}
            </IconButton>
          </Tooltip>
        </Stack>
      </DialogTitle>

      <DialogContent
        sx={{
          p: isMobile ? 1.5 : 3,
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
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
            mb: isMobile ? 1.5 : 3,
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

        {/* Split Panel */}
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={isMobile ? 1 : 2}
          sx={{ flex: 1, overflow: isMobile ? "auto" : "hidden" }}
        >
          {/* On mobile: Selected panel first, on desktop: Available panel first */}
          {isMobile ? (
            <>
              {/* Selected Panel - shown first on mobile */}
              {renderPanel(
                "✅ Khoa Được Phân Phối",
                selectedKhoa,
                searchSelected,
                setSearchSelected,
                true,
              )}

              {/* Transfer Buttons */}
              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                alignItems="center"
              >
                <Tooltip title="Thêm tất cả">
                  <span>
                    <IconButton
                      onClick={handleAddAll}
                      disabled={loading || availableKhoa.length === 0}
                      color="success"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.success.main, 0.2),
                        },
                      }}
                    >
                      <Badge
                        badgeContent={availableKhoa.length}
                        color="success"
                      >
                        <ArrowDown size={24} />
                      </Badge>
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Xóa tất cả">
                  <span>
                    <IconButton
                      onClick={handleRemoveAll}
                      disabled={loading || selectedKhoa.length === 0}
                      color="error"
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.2),
                        },
                      }}
                    >
                      <Badge badgeContent={selectedKhoa.length} color="error">
                        <ArrowUp size={24} />
                      </Badge>
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>

              {/* Available Panel - shown last on mobile */}
              {renderPanel(
                "📋 Khoa Có Sẵn",
                availableKhoa,
                searchAvailable,
                setSearchAvailable,
                false,
              )}
            </>
          ) : (
            <>
              {/* Desktop layout: Available -> Transfer -> Selected */}
              {renderPanel(
                "📋 Khoa Có Sẵn",
                availableKhoa,
                searchAvailable,
                setSearchAvailable,
                false,
              )}

              {/* Transfer Buttons */}
              <Stack
                direction="column"
                spacing={1}
                justifyContent="center"
                alignItems="center"
                sx={{ py: 2 }}
              >
                <Tooltip title="Thêm tất cả">
                  <span>
                    <IconButton
                      onClick={handleAddAll}
                      disabled={loading || availableKhoa.length === 0}
                      color="success"
                      sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.success.main, 0.2),
                        },
                      }}
                    >
                      <Badge
                        badgeContent={availableKhoa.length}
                        color="success"
                      >
                        <ArrowRight2 size={24} />
                      </Badge>
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Xóa tất cả">
                  <span>
                    <IconButton
                      onClick={handleRemoveAll}
                      disabled={loading || selectedKhoa.length === 0}
                      color="error"
                      sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        "&:hover": {
                          bgcolor: alpha(theme.palette.error.main, 0.2),
                        },
                      }}
                    >
                      <Badge badgeContent={selectedKhoa.length} color="error">
                        <ArrowLeft2 size={24} />
                      </Badge>
                    </IconButton>
                  </span>
                </Tooltip>
              </Stack>

              {/* Selected Panel */}
              {renderPanel(
                "✅ Khoa Được Phân Phối",
                selectedKhoa,
                searchSelected,
                setSearchSelected,
                true,
              )}
            </>
          )}
        </Stack>
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
              disabled={loading}
              startIcon={
                loading ? <CircularProgress size={16} color="inherit" /> : null
              }
            >
              Lưu thay đổi
            </Button>
          </Stack>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}

export default DistributionDialogV2;
