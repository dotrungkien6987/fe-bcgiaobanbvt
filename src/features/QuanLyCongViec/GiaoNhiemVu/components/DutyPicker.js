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

const DutyPicker = ({ duties = [], onPick }) => {
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
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: alpha(theme.palette.secondary.main, 0.04),
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.08),
            },
            '&.Mui-focused': {
              backgroundColor: 'transparent',
            }
          }
        }}
      />

      <List 
        dense 
        sx={{ 
          maxHeight: 400, 
          overflowY: "auto",
          '& .MuiListItemButton-root': {
            borderRadius: 1.5,
            mb: 0.5,
            border: `1px solid ${alpha(theme.palette.secondary.main, 0.12)}`,
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              backgroundColor: alpha(theme.palette.secondary.main, 0.08),
              borderColor: alpha(theme.palette.secondary.main, 0.3),
              transform: 'translateY(-1px)',
              boxShadow: theme.shadows[2],
            }
          }
        }}
      >
        {filtered.map((d) => (
          <ListItemButton 
            key={d._id} 
            onClick={() => onPick?.(d)}
            sx={{ pl: 2, pr: 1.5 }}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                mr: 1.5,
                bgcolor: theme.palette.secondary.main,
                fontSize: '0.875rem'
              }}
            >
              <Assignment fontSize="small" />
            </Avatar>
            <ListItemText
              primary={
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {d.TenNhiemVu || d.Ten}
                  </Typography>
                  <Tooltip title="Gán nhiệm vụ này">
                    <IconButton 
                      size="small" 
                      color="secondary"
                      sx={{ 
                        opacity: 0.7,
                        '&:hover': { opacity: 1 }
                      }}
                    >
                      <Add fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
              secondary={
                d?.KhoaID?.TenKhoa ? (
                  <Chip
                    size="small"
                    label={d.KhoaID.TenKhoa}
                    variant="outlined"
                    color="default"
                    sx={{ 
                      mt: 0.5,
                      fontSize: '0.75rem',
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                ) : (
                  <Typography variant="caption" color="text.disabled">
                    Chưa phân khoa
                  </Typography>
                )
              }
            />
          </ListItemButton>
        ))}
        {filtered.length === 0 && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              textAlign: 'center',
              backgroundColor: alpha(theme.palette.grey[500], 0.04),
              border: `1px dashed ${alpha(theme.palette.grey[500], 0.3)}`,
            }}
          >
            <Assignment color="disabled" sx={{ fontSize: 48, mb: 1 }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {search ? "Không tìm thấy nhiệm vụ phù hợp" : "Chưa có nhiệm vụ nào"}
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

export default DutyPicker;
