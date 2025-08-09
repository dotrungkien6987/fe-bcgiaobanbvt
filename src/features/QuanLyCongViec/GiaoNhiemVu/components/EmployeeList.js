import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  Box,
  List,
  ListItemButton,
  ListItemText,
  TextField,
  Typography,
  Chip,
  InputAdornment,
  Paper,
  Avatar,
  alpha,
  useTheme,
} from "@mui/material";
import { Search, Person } from "@mui/icons-material";

const EmployeeList = ({ employees = [], selectedEmployeeId, onSelect }) => {
  const [search, setSearch] = useState("");
  const theme = useTheme();

  // Lấy danh sách nhân viên đầy đủ từ redux để map ID -> thông tin nhân viên
  const { nhanviens } = useSelector(
    (state) => state.nhanvien || { nhanviens: [] }
  );
  const nvMap = useMemo(() => {
    const map = new Map();
    (nhanviens || []).forEach((nv) => {
      if (nv && nv._id) map.set(nv._id, nv);
    });
    return map;
  }, [nhanviens]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return employees;
    return employees.filter((e) => {
      // Ưu tiên ThongTinNhanVienDuocQuanLy từ BE populate (có thể là object hoặc mảng), nếu không có thì lookup từ redux
      const raw = e.ThongTinNhanVienDuocQuanLy;
      const nv =
        (Array.isArray(raw) ? raw[0] : raw) ||
        nvMap.get(e.NhanVienDuocQuanLy) ||
        {};

      const name = (nv.Ten || "").toLowerCase();
      const code = (nv.MaNhanVien || "").toLowerCase();
      const khoa = (nv?.KhoaID?.TenKhoa || nv?.TenKhoa || "").toLowerCase();

      return name.includes(q) || code.includes(q) || khoa.includes(q);
    });
  }, [employees, search, nvMap]);

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Tìm theo tên, mã NV, khoa..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.primary.main, 0.04),
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            "&.Mui-focused": {
              backgroundColor: "transparent",
            },
          },
        }}
      />

      <List
        dense
        sx={{
          maxHeight: 480,
          overflowY: "auto",
          "& .MuiListItemButton-root": {
            borderRadius: 1.5,
            mb: 0.5,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
            },
            "&.Mui-selected": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
              borderLeft: `3px solid ${theme.palette.primary.main}`,
              "&:hover": {
                backgroundColor: alpha(theme.palette.primary.main, 0.16),
              },
            },
          },
        }}
      >
        {filtered.map((e) => {
          // Ưu tiên ThongTinNhanVienDuocQuanLy từ BE (object/mảng), fallback về redux lookup
          const raw = e.ThongTinNhanVienDuocQuanLy;
          const nv =
            (Array.isArray(raw) ? raw[0] : raw) ||
            nvMap.get(e.NhanVienDuocQuanLy) ||
            {};

          const id = nv._id || e.NhanVienDuocQuanLy;
          const khoaName = nv?.KhoaID?.TenKhoa || nv?.TenKhoa;
          const isSelected = id === selectedEmployeeId;

          // Debug log đã được loại bỏ sau khi xác nhận dữ liệu

          return (
            <ListItemButton
              key={id}
              selected={isSelected}
              onClick={() => onSelect?.(id)}
              sx={{ pl: 2, pr: 2 }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  mr: 1.5,
                  bgcolor: isSelected
                    ? theme.palette.primary.main
                    : theme.palette.grey[400],
                  fontSize: "0.875rem",
                }}
              >
                <Person fontSize="small" />
              </Avatar>
              <ListItemText
                primary={
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    flexWrap="wrap"
                  >
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 600 : 500}
                      color={isSelected ? "primary.main" : "text.primary"}
                      sx={{ minWidth: 0, flex: 1 }}
                    >
                      {nv.Ten || `Nhân viên (${id})`}
                    </Typography>
                    {khoaName && (
                      <Chip
                        size="small"
                        label={khoaName}
                        color={isSelected ? "primary" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        sx={{
                          fontSize: "0.75rem",
                          height: 20,
                          "& .MuiChip-label": { px: 1 },
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color={isSelected ? "primary.dark" : "text.secondary"}
                    sx={{ fontWeight: isSelected ? 500 : 400 }}
                  >
                    {nv.MaNhanVien || "Chưa có mã NV"}
                  </Typography>
                }
              />
            </ListItemButton>
          );
        })}
        {filtered.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: alpha(theme.palette.grey[500], 0.04),
              border: `1px dashed ${alpha(theme.palette.grey[500], 0.3)}`,
            }}
          >
            <Person color="disabled" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {search
                ? "Không tìm thấy nhân viên phù hợp"
                : "Chưa có nhân viên nào"}
            </Typography>
            {search && (
              <Typography variant="caption" color="text.disabled">
                Thử tìm kiếm với từ khóa khác
              </Typography>
            )}
          </Paper>
        )}
      </List>
    </Box>
  );
};

export default EmployeeList;
