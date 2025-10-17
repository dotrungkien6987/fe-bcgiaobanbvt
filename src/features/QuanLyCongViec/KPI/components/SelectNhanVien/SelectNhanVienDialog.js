import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Typography,
  InputAdornment,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import PersonIcon from "@mui/icons-material/Person";
import { useDispatch, useSelector } from "react-redux";
import { setFilterNhanVienID, getNhanVienDuocQuanLy } from "../../kpiSlice";
import NhanVienCard from "./NhanVienCard";

/**
 * SelectNhanVienDialog - Dialog chọn nhân viên để lọc KPI
 *
 * Features:
 * - Search box tìm kiếm theo tên/mã/email
 * - Grid layout hiển thị cards
 * - Clear search button
 * - Show selected nhân viên với chip
 * - Bỏ chọn nhân viên
 * - Auto load danh sách nhân viên được quản lý (theo QuanLyNhanVien)
 */
function SelectNhanVienDialog({ open, onClose }) {
  const dispatch = useDispatch();
  const { nhanVienDuocQuanLy = [], isLoading } = useSelector(
    (state) => state.kpi
  );
  const { filterNhanVienID } = useSelector((state) => state.kpi);
  const [searchTerm, setSearchTerm] = useState("");

  // Load danh sách nhân viên được quản lý khi mở dialog
  useEffect(() => {
    if (open) {
      dispatch(getNhanVienDuocQuanLy("KPI"));
    }
  }, [open, dispatch]);

  // Handler chọn nhân viên
  const handleSelect = (nhanVienId) => {
    dispatch(setFilterNhanVienID(nhanVienId));
    onClose();
  };

  // Handler bỏ chọn nhân viên
  const handleClearFilter = () => {
    dispatch(setFilterNhanVienID(null));
    onClose();
  };

  // Filter nhân viên theo search term
  const filteredNhanVien = nhanVienDuocQuanLy.filter((nv) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      nv.Ten?.toLowerCase().includes(searchLower) ||
      nv.MaNhanVien?.toLowerCase().includes(searchLower) ||
      nv.Email?.toLowerCase().includes(searchLower) ||
      nv.KhoaID?.TenKhoa?.toLowerCase().includes(searchLower) ||
      nv.ChucDanh?.toLowerCase().includes(searchLower)
    );
  });

  // Nhân viên đang được chọn
  const selectedNhanVien = nhanVienDuocQuanLy.find(
    (nv) => nv._id === filterNhanVienID
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { minHeight: "70vh" },
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5">Chọn Nhân Viên Để Đánh Giá KPI</Typography>
          {selectedNhanVien && (
            <Chip
              label={`Đang chọn: ${selectedNhanVien.Ten}`}
              color="primary"
              onDelete={handleClearFilter}
              sx={{ ml: 2 }}
            />
          )}
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Alert thông báo chỉ hiển thị nhân viên được quản lý */}
        <Alert severity="info" icon={<PersonIcon />} sx={{ mb: 2 }}>
          Chỉ hiển thị nhân viên bạn được phép chấm KPI (
          {nhanVienDuocQuanLy.length} người)
        </Alert>

        {/* Search Box */}
        <TextField
          fullWidth
          placeholder="Tìm theo tên, mã nhân viên, email, khoa, chức danh..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <ClearIcon
                  sx={{
                    cursor: "pointer",
                    "&:hover": { color: "error.main" },
                  }}
                  onClick={() => setSearchTerm("")}
                />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Loading State */}
        {isLoading ? (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
          >
            <CircularProgress size={48} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              Đang tải danh sách nhân viên...
            </Typography>
          </Box>
        ) : filteredNhanVien.length === 0 ? (
          /* Empty State */
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Không tìm thấy nhân viên nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm
                ? `Không có kết quả cho "${searchTerm}"`
                : "Danh sách nhân viên trống"}
            </Typography>
          </Box>
        ) : (
          /* Nhân viên Grid */
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Tìm thấy {filteredNhanVien.length} nhân viên
            </Typography>
            <Grid container spacing={2}>
              {filteredNhanVien.map((nhanVien) => (
                <Grid item xs={12} sm={6} md={4} key={nhanVien._id}>
                  <NhanVienCard
                    nhanVien={nhanVien}
                    isSelected={nhanVien._id === filterNhanVienID}
                    onSelect={handleSelect}
                  />
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
        {filterNhanVienID && (
          <Button
            onClick={handleClearFilter}
            color="warning"
            variant="contained"
          >
            Bỏ chọn
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

export default SelectNhanVienDialog;
