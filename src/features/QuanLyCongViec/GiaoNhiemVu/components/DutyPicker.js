import React, { useMemo, useState } from "react";
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
  IconButton,
  Tooltip,
} from "@mui/material";
import { Search, Assignment, Add } from "@mui/icons-material";

const DutyPicker = ({ duties = [], onPick, selectedEmployeeId }) => {
  const [search, setSearch] = useState("");
  const theme = useTheme();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return duties;
    return duties.filter((d) =>
      (d.TenNhiemVu || d.Ten || "").toLowerCase().includes(q)
    );
  }, [duties, search]);

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        placeholder="Tìm kiếm nhiệm vụ..."
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
            backgroundColor: alpha(theme.palette.secondary.main, 0.04),
            "&:hover": {
              backgroundColor: alpha(theme.palette.secondary.main, 0.08),
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
          maxHeight: 400,
          overflowY: "auto",
          overflowX: "auto", // Thêm cuộn ngang
          minWidth: 300, // Width tối thiểu
          "& .MuiListItemButton-root": {
            borderRadius: 1.5,
            mb: 0.5,
            minWidth: 280, // Width tối thiểu cho item
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              backgroundColor: alpha(theme.palette.secondary.main, 0.08),
              borderColor: alpha(theme.palette.secondary.main, 0.3),
              transform: "translateY(-1px)",
              boxShadow: theme.shadows[2],
            },
          },
        }}
      >
        {filtered.map((d) => (
          <ListItemButton
            key={d._id}
            onClick={() => onPick?.(d)}
            disabled={!selectedEmployeeId}
            sx={{
              pl: 2,
              pr: 1.5,
              opacity: selectedEmployeeId ? 1 : 0.6,
            }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1.5,
                bgcolor: selectedEmployeeId
                  ? theme.palette.secondary.main
                  : theme.palette.grey[400],
                fontSize: "0.875rem",
              }}
            >
              <Assignment fontSize="small" />
            </Avatar>
            <ListItemText
              primary={
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ minWidth: 0, overflowX: "auto" }} // Cuộn ngang cho primary content
                >
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{
                      flex: 1,
                      minWidth: 150, // Width tối thiểu cho tên nhiệm vụ
                      mr: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {d.TenNhiemVu || d.Ten}
                  </Typography>
                  <Box
                    display="flex"
                    alignItems="center"
                    gap={1}
                    sx={{ flexShrink: 0 }}
                  >
                    {d.MucDoKho && (
                      <Chip
                        size="small"
                        label={`${Number(d.MucDoKho).toFixed(1)}`}
                        color="warning"
                        variant="filled"
                        sx={{
                          fontSize: "0.7rem",
                          height: 18,
                          minWidth: 35,
                          "& .MuiChip-label": { px: 0.5 },
                        }}
                      />
                    )}
                    <Tooltip
                      title={
                        selectedEmployeeId
                          ? "Gán nhiệm vụ này"
                          : "Chọn nhân viên trước"
                      }
                    >
                      <IconButton
                        size="small"
                        color="secondary"
                        disabled={!selectedEmployeeId}
                        sx={{
                          opacity: selectedEmployeeId ? 0.7 : 0.3,
                          "&:hover": { opacity: selectedEmployeeId ? 1 : 0.3 },
                        }}
                      >
                        <Add fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              }
              secondary={
                <Box
                  display="flex"
                  alignItems="center"
                  gap={1}
                  mt={0.5}
                  sx={{ overflowX: "auto", minWidth: 0 }} // Cuộn ngang cho secondary content
                >
                  {d?.KhoaID?.TenKhoa && (
                    <Chip
                      size="small"
                      label={d.KhoaID.TenKhoa}
                      variant="outlined"
                      color="default"
                      sx={{
                        fontSize: "0.7rem",
                        height: 18,
                        minWidth: 50,
                        flexShrink: 0,
                        "& .MuiChip-label": { px: 0.5 },
                      }}
                    />
                  )}
                  {d.MoTa && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {d.MoTa}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
        ))}
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
            <Assignment color="disabled" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {search
                ? "Không tìm thấy nhiệm vụ phù hợp"
                : selectedEmployeeId
                ? "Chưa có nhiệm vụ khả dụng"
                : "Chọn nhân viên để xem nhiệm vụ"}
            </Typography>
            {search && selectedEmployeeId && (
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

export default DutyPicker;
