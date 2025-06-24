import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
  Divider,
  Badge,
  Collapse,
  Card,
  CardContent,
} from "@mui/material";

import {
  Close as CloseIcon,
  Search as SearchIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ClearAll as ClearAllIcon,
  SelectAll as SelectAllIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setKhoaLichTrucCurent } from "./userSlice";

function ChonKhoaLichTrucForm({ KhoaLichTruc }) {
  const { khoas } = useSelector((state) => state.baocaongay);
  const [open, setOpen] = useState(false);
  const [selectedKhoas, setSelectedKhoas] = useState({});
  const [searchText, setSearchText] = useState("");
  const [showSelected, setShowSelected] = useState(false);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const dispatch = useDispatch();

  // Initialize selected khoas
  useEffect(() => {
    const initialSelected = {};
    if (khoas && Array.isArray(KhoaLichTruc)) {
      khoas.forEach((khoa) => {
        initialSelected[khoa.MaKhoa] = KhoaLichTruc.includes(khoa.MaKhoa);
      });
      setSelectedKhoas(initialSelected);
    }
  }, [khoas, KhoaLichTruc]);

  // Filter khoas based on search text
  const filteredKhoas = useMemo(() => {
    if (!khoas) return [];

    return khoas.filter(
      (khoa) =>
        khoa.TenKhoa.toLowerCase().includes(searchText.toLowerCase()) ||
        khoa.MaKhoa.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [khoas, searchText]);

  // Get selected khoas for display
  const selectedKhoasList = useMemo(() => {
    if (!khoas) return [];
    return khoas.filter((khoa) => selectedKhoas[khoa.MaKhoa]);
  }, [khoas, selectedKhoas]);

  // Count selected khoas
  const selectedCount = Object.values(selectedKhoas).filter(Boolean).length;

  function getSelectedKhoaIds(selectedKhoas) {
    return Object.entries(selectedKhoas)
      .filter(([id, isSelected]) => isSelected)
      .map(([id, isSelected]) => id);
  }

  const handleOpen = () => {
    setOpen(true);
    setSearchText("");
    setShowSelected(false);
  };

  const handleClose = () => {
    setOpen(false);
    setSearchText("");
    setShowSelected(false);
  };

  const handleChon = () => {
    const chonKhoaLichTruc = getSelectedKhoaIds(selectedKhoas);
    console.log("Khoa lịch trực chọn", chonKhoaLichTruc);
    dispatch(setKhoaLichTrucCurent(chonKhoaLichTruc));
    setOpen(false);
  };

  const handleCheckboxChange = (makhoa) => {
    setSelectedKhoas((prev) => ({ ...prev, [makhoa]: !prev[makhoa] }));
  };

  const handleSelectAll = () => {
    const newSelected = {};
    filteredKhoas.forEach((khoa) => {
      newSelected[khoa.MaKhoa] = true;
    });
    setSelectedKhoas((prev) => ({ ...prev, ...newSelected }));
  };

  const handleClearAll = () => {
    const newSelected = {};
    filteredKhoas.forEach((khoa) => {
      newSelected[khoa.MaKhoa] = false;
    });
    setSelectedKhoas((prev) => ({ ...prev, ...newSelected }));
  };

  const handleRemoveSelected = (makhoa) => {
    setSelectedKhoas((prev) => ({ ...prev, [makhoa]: false }));
  };

  return (
    <Box>
      <Button
        variant="contained"
        onClick={handleOpen}
        startIcon={<ScheduleIcon />}
        sx={{
          bgcolor: "#8E24AA",
          "&:hover": { bgcolor: "#7B1FA2" },
          borderRadius: 2,
          px: 3,
          py: 1.5,
        }}
      >
        <Badge badgeContent={selectedCount} color="error" max={99}>
          Chọn khoa lịch trực ({selectedCount})
        </Badge>
      </Button>

      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            borderRadius: 3,
            minHeight: "70vh",
            maxHeight: "90vh",
          },
        }}
      >
        <DialogTitle
          sx={{
            bgcolor: "#8E24AA",
            color: "white",
            py: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ScheduleIcon />
            <Typography variant="h6" fontWeight={600}>
              Chọn khoa lịch trực
            </Typography>
            <Chip
              label={`${selectedCount} khoa`}
              color="secondary"
              size="small"
            />
          </Box>
          <IconButton onClick={handleClose} sx={{ color: "white" }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ p: 0 }}>
          {/* Search and Controls */}
          <Box sx={{ p: 3, pb: 2, bgcolor: "#f8f9fa" }}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên khoa hoặc mã khoa..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
              sx={{
                mb: 2,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  bgcolor: "white",
                },
              }}
            />

            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button
                variant="outlined"
                size="small"
                onClick={handleSelectAll}
                startIcon={<SelectAllIcon />}
                disabled={filteredKhoas.length === 0}
              >
                Chọn tất cả
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearAll}
                startIcon={<ClearAllIcon />}
                color="error"
                disabled={filteredKhoas.length === 0}
              >
                Bỏ chọn tất cả
              </Button>
              <Button
                variant={showSelected ? "contained" : "outlined"}
                size="small"
                onClick={() => setShowSelected(!showSelected)}
                startIcon={
                  showSelected ? <ExpandLessIcon /> : <ExpandMoreIcon />
                }
                disabled={selectedCount === 0}
              >
                Đã chọn ({selectedCount})
              </Button>
            </Stack>
          </Box>

          {/* Selected Khoas Section */}
          <Collapse in={showSelected && selectedCount > 0}>
            <Box sx={{ px: 3, pb: 2 }}>
              <Card sx={{ bgcolor: "#f3e5f5", border: "1px solid #8E24AA" }}>
                <CardContent sx={{ py: 2 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1, color: "#8E24AA" }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5 }} />
                    Khoa lịch trực đã chọn:
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {selectedKhoasList.map((khoa) => (
                      <Chip
                        key={khoa.MaKhoa}
                        label={khoa.TenKhoa}
                        onDelete={() => handleRemoveSelected(khoa.MaKhoa)}
                        sx={{ bgcolor: "#8E24AA", color: "white" }}
                        variant="filled"
                        size="small"
                        icon={<LocationOnIcon />}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Collapse>

          <Divider />

          {/* Khoas List */}
          <Box sx={{ px: 3, py: 2 }}>
            {filteredKhoas.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 6,
                  color: "text.secondary",
                }}
              >
                <SearchIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" gutterBottom>
                  Không tìm thấy khoa nào
                </Typography>
                <Typography variant="body2">
                  Vui lòng thử lại với từ khóa khác
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={1}>
                {filteredKhoas.map((khoa) => (
                  <Grid item xs={12} sm={6} key={khoa.MaKhoa}>
                    <Paper
                      elevation={selectedKhoas[khoa.MaKhoa] ? 3 : 1}
                      sx={{
                        border: selectedKhoas[khoa.MaKhoa]
                          ? "2px solid #8E24AA"
                          : "1px solid #e0e0e0",
                        borderRadius: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          borderColor: "#8E24AA",
                          boxShadow: 2,
                        },
                      }}
                    >
                      <ListItem disablePadding>
                        <ListItemButton
                          onClick={() => handleCheckboxChange(khoa.MaKhoa)}
                          sx={{ py: 1.5 }}
                        >
                          <ListItemIcon sx={{ minWidth: 40 }}>
                            {selectedKhoas[khoa.MaKhoa] ? (
                              <CheckCircleIcon sx={{ color: "#8E24AA" }} />
                            ) : (
                              <RadioButtonUncheckedIcon color="disabled" />
                            )}
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography
                                variant="subtitle2"
                                fontWeight={
                                  selectedKhoas[khoa.MaKhoa] ? 600 : 400
                                }
                                sx={{
                                  color: selectedKhoas[khoa.MaKhoa]
                                    ? "#8E24AA"
                                    : "text.primary",
                                }}
                              >
                                {khoa.TenKhoa}
                              </Typography>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                Mã: {khoa.MaKhoa}
                              </Typography>
                            }
                          />
                          <Checkbox
                            checked={selectedKhoas[khoa.MaKhoa] || false}
                            onChange={() => handleCheckboxChange(khoa.MaKhoa)}
                            sx={{
                              color: selectedKhoas[khoa.MaKhoa]
                                ? "#8E24AA"
                                : undefined,
                            }}
                          />
                        </ListItemButton>
                      </ListItem>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            bgcolor: "#f8f9fa",
            borderTop: "1px solid #e0e0e0",
            gap: 2,
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mr: "auto" }}
          >
            Đã chọn {selectedCount} khoa
          </Typography>
          <Button
            variant="outlined"
            onClick={handleClose}
            color="inherit"
            startIcon={<CloseIcon />}
          >
            Hủy bỏ
          </Button>
          <Button
            variant="contained"
            onClick={handleChon}
            startIcon={<CheckCircleIcon />}
            sx={{
              bgcolor: "#8E24AA",
              "&:hover": { bgcolor: "#7B1FA2" },
              minWidth: 120,
            }}
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default ChonKhoaLichTrucForm;
