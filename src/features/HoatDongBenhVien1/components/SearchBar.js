import React from "react";
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import { useHoatDongBenhVien } from "../HoatDongBenhVienProvider";

const SearchBar = () => {
  const { searchTerm, setSearchTerm, departments } = useHoatDongBenhVien();

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Box sx={{ width: "100%", mb: 2 }}>
      <TextField
        fullWidth
        size="small"
        variant="outlined"
        placeholder="Tìm kiếm theo tên khoa, điều dưỡng, bác sĩ... (hỗ trợ không dấu)"
        value={searchTerm}
        onChange={handleSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <Box
                component="span"
                sx={{
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  mr: 1,
                  display: "flex",
                  alignItems: "center",
                }}
              >
                {departments.length} kết quả
              </Box>
              <Tooltip title="Xóa tìm kiếm">
                <IconButton edge="end" onClick={clearSearch} size="small">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          ) : null,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            "&.Mui-focused": {
              boxShadow: "0 0 0 2px rgba(25, 118, 210, 0.2)",
            },
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;
