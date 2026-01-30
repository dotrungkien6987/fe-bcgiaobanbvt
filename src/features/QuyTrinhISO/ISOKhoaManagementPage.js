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
  Badge,
  Alert,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  alpha,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  SearchNormal1,
  ArrowRight2,
  ArrowLeft2,
  CloseCircle,
  Save2,
  ArrowDown,
  ArrowUp,
} from "iconsax-react";
import MainCard from "../../components/MainCard";
import useAuth from "../../hooks/useAuth";
import { getAllKhoa, bulkUpdateISO } from "../Daotao/Khoa/khoaSlice";

/**
 * ISOKhoaManagementPage - Quản lý khoa liên quan ISO (QLCL only)
 *
 * Features:
 * - Split panel: Non-ISO khoa (left) vs ISO khoa (right)
 * - Bulk transfer with badge count
 * - Search in both panels
 * - Stats bar (total, ISO count, percentage)
 * - Save button to commit changes
 * - Mobile responsive
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

  const [searchNonISO, setSearchNonISO] = useState("");
  const [searchISO, setSearchISO] = useState("");
  const [isoKhoaIds, setIsoKhoaIds] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [saving, setSaving] = useState(false);

  // Permission check - QLCL only
  const isQLCL = ["qlcl", "admin", "superadmin"].includes(
    user?.PhanQuyen?.toLowerCase(),
  );

  useEffect(() => {
    if (!isQLCL) {
      navigate("/quytrinh-iso");
      return;
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

  // Non-ISO khoa (left panel)
  const nonISOKhoa = useMemo(() => {
    return allKhoa
      .filter((k) => !isoKhoaIds.includes(k._id))
      .filter((k) =>
        searchNonISO
          ? k.TenKhoa.toLowerCase().includes(searchNonISO.toLowerCase()) ||
            k.MaKhoa?.toLowerCase().includes(searchNonISO.toLowerCase())
          : true,
      );
  }, [allKhoa, isoKhoaIds, searchNonISO]);

  // ISO khoa (right panel)
  const isoKhoa = useMemo(() => {
    return allKhoa
      .filter((k) => isoKhoaIds.includes(k._id))
      .filter((k) =>
        searchISO
          ? k.TenKhoa.toLowerCase().includes(searchISO.toLowerCase()) ||
            k.MaKhoa?.toLowerCase().includes(searchISO.toLowerCase())
          : true,
      );
  }, [allKhoa, isoKhoaIds, searchISO]);

  // Add single khoa to ISO
  const handleAdd = (khoaId) => {
    setIsoKhoaIds((prev) => [...prev, khoaId]);
    setHasChanges(true);
  };

  // Remove single khoa from ISO
  const handleRemove = (khoaId) => {
    setIsoKhoaIds((prev) => prev.filter((id) => id !== khoaId));
    setHasChanges(true);
  };

  // Add all filtered non-ISO khoa
  const handleAddAll = () => {
    const newIds = nonISOKhoa.map((k) => k._id);
    setIsoKhoaIds((prev) => [...new Set([...prev, ...newIds])]);
    setHasChanges(true);
  };

  // Remove all filtered ISO khoa
  const handleRemoveAll = () => {
    const removeIds = isoKhoa.map((k) => k._id);
    setIsoKhoaIds((prev) => prev.filter((id) => !removeIds.includes(id)));
    setHasChanges(true);
  };

  // Save changes - bulk update
  const handleSave = async () => {
    setSaving(true);
    try {
      // Get original ISO khoa IDs
      const originalIsoIds = allKhoa
        .filter((k) => k.IsISORelevant)
        .map((k) => k._id);

      // Find khoas to mark as ISO (new selections)
      const toMarkISO = isoKhoaIds.filter((id) => !originalIsoIds.includes(id));

      // Find khoas to unmark as ISO (removed selections)
      const toUnmarkISO = originalIsoIds.filter(
        (id) => !isoKhoaIds.includes(id),
      );

      // DEBUG LOGS
      console.log("🔍 DEBUG - Original ISO IDs:", originalIsoIds);
      console.log("🔍 DEBUG - Current ISO IDs:", isoKhoaIds);
      console.log("🔍 DEBUG - To Mark ISO:", toMarkISO);
      console.log("🔍 DEBUG - To Unmark ISO:", toUnmarkISO);

      // Execute bulk updates
      if (toMarkISO.length > 0) {
        console.log("📤 Sending toMarkISO request:", {
          khoaIds: toMarkISO,
          isISORelevant: true,
        });
        await dispatch(bulkUpdateISO(toMarkISO, true));
      }
      if (toUnmarkISO.length > 0) {
        console.log("📤 Sending toUnmarkISO request:", {
          khoaIds: toUnmarkISO,
          isISORelevant: false,
        });
        await dispatch(bulkUpdateISO(toUnmarkISO, false));
      }

      setHasChanges(false);
    } catch (error) {
      console.error("❌ Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  // Cancel changes
  const handleCancel = () => {
    const originalIsoIds = allKhoa
      .filter((k) => k.IsISORelevant)
      .map((k) => k._id);
    setIsoKhoaIds(originalIsoIds);
    setHasChanges(false);
  };

  // Panel renderer
  const renderPanel = (title, khoas, searchValue, setSearchValue, isISO) => (
    <Paper
      variant="outlined"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        minHeight: isMobile ? 300 : "auto",
        borderColor: isISO ? "success.main" : "grey.300",
        borderWidth: isISO ? 2 : 1,
      }}
    >
      {/* Panel Header */}
      <Box
        sx={{
          p: isMobile ? 1 : 2,
          bgcolor: isISO
            ? alpha(theme.palette.success.main, 0.05)
            : alpha(theme.palette.grey[500], 0.03),
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" mb={1}>
          <Typography variant="subtitle1" fontWeight={600}>
            {title}
          </Typography>
          <Chip
            label={khoas.length}
            size="small"
            color={isISO ? "success" : "default"}
            sx={{ fontWeight: "bold", minWidth: 40 }}
          />
        </Stack>

        {/* Search */}
        <TextField
          fullWidth
          size="small"
          placeholder="Tìm kiếm khoa..."
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
          maxHeight: isMobile ? 300 : 450,
        }}
      >
        {khoaLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress size={32} />
          </Box>
        ) : khoas.length === 0 ? (
          <Box
            display="flex"
            alignItems="center"
            justifyContent="center"
            py={4}
          >
            <Typography variant="body2" color="text.secondary">
              {searchValue
                ? "Không tìm thấy khoa phù hợp"
                : isISO
                  ? "Chưa có khoa ISO"
                  : "Tất cả khoa đã được đánh dấu ISO"}
            </Typography>
          </Box>
        ) : (
          <List disablePadding>
            {khoas.map((khoa) => (
              <ListItem key={khoa._id} disablePadding>
                <ListItemButton
                  onClick={() =>
                    isISO ? handleRemove(khoa._id) : handleAdd(khoa._id)
                  }
                  onMouseEnter={() => setHoveredItem(khoa._id)}
                  onMouseLeave={() => setHoveredItem(null)}
                  sx={{
                    borderRadius: 1,
                    mb: 0.5,
                    bgcolor:
                      hoveredItem === khoa._id
                        ? alpha(theme.palette.primary.main, 0.08)
                        : "transparent",
                    border: 1,
                    borderColor:
                      hoveredItem === khoa._id ? "primary.main" : "transparent",
                    transition: "all 0.2s",
                  }}
                >
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={500}>
                        {khoa.TenKhoa}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {khoa.MaKhoa} • STT: {khoa.STT}
                      </Typography>
                    }
                  />
                  {hoveredItem === khoa._id && (
                    <Chip
                      label={isISO ? "Xóa" : "Thêm"}
                      size="small"
                      color={isISO ? "error" : "success"}
                      sx={{ ml: 1 }}
                    />
                  )}
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );

  return (
    <MainCard
      title={
        <Box>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            ⚙️ Quản Lý Khoa Liên Quan ISO
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Cấu hình hàng loạt các khoa liên quan đến quy trình ISO
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

      {/* Action Buttons - Moved to top */}
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        sx={{ mb: 2 }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCancel}
          disabled={!hasChanges || saving}
        >
          Hủy thay đổi
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={!hasChanges || saving}
          startIcon={saving ? <CircularProgress size={20} /> : <Save2 />}
        >
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </Stack>

      {/* Change Alert */}
      {hasChanges && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Bạn có thay đổi chưa lưu. Nhấn <strong>Lưu thay đổi</strong> để áp
          dụng.
        </Alert>
      )}

      {/* Split Panel */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={2}
        sx={{
          height: isMobile ? "auto" : 600,
          minHeight: isMobile ? 400 : 600,
        }}
      >
        {/* Left Panel - Non-ISO Khoa */}
        {renderPanel(
          "Không liên quan ISO",
          nonISOKhoa,
          searchNonISO,
          setSearchNonISO,
          false,
        )}

        {/* Transfer Buttons */}
        <Stack
          direction={isMobile ? "row" : "column"}
          spacing={1}
          justifyContent="center"
          alignItems="center"
        >
          <IconButton
            onClick={handleAddAll}
            disabled={khoaLoading || nonISOKhoa.length === 0}
            color="success"
            sx={{
              border: 1,
              borderColor: "success.main",
              "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.1) },
            }}
          >
            <Badge badgeContent={nonISOKhoa.length} color="success">
              {isMobile ? <ArrowDown size={24} /> : <ArrowRight2 size={24} />}
            </Badge>
          </IconButton>
          <IconButton
            onClick={handleRemoveAll}
            disabled={khoaLoading || isoKhoa.length === 0}
            color="error"
            sx={{
              border: 1,
              borderColor: "error.main",
              "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.1) },
            }}
          >
            <Badge badgeContent={isoKhoa.length} color="error">
              {isMobile ? <ArrowUp size={24} /> : <ArrowLeft2 size={24} />}
            </Badge>
          </IconButton>
        </Stack>

        {/* Right Panel - ISO Khoa */}
        {renderPanel("Liên quan ISO", isoKhoa, searchISO, setSearchISO, true)}
      </Stack>
    </MainCard>
  );
}

export default ISOKhoaManagementPage;
