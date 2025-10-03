import React from "react";
import {
  Toolbar,
  Box,
  TextField,
  InputAdornment,
  Button,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import DownloadIcon from "@mui/icons-material/Download";

function TableToolbar({ search, setSearch, onReset, onExport, loaiKhoa }) {
  return (
    <Toolbar sx={{ px: 0, gap: 1, flexWrap: "wrap" }}>
      <TextField
        size="small"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Tìm kiếm khoa..."
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
        sx={{ width: { xs: "100%", sm: 300 } }}
      />

      <Tooltip title="Đặt lại lọc">
        <span>
          <Button
            onClick={onReset}
            startIcon={<RefreshIcon />}
            variant="contained"
            color="inherit"
            size="small"
          >
            Đặt lại
          </Button>
        </span>
      </Tooltip>

      <Box flexGrow={1} />

      <Tooltip
        title={`Xuất CSV - ${loaiKhoa === "noitru" ? "Nội trú" : "Ngoại trú"}`}
      >
        <span>
          <Button
            onClick={onExport}
            startIcon={<DownloadIcon />}
            variant="contained"
            size="small"
          >
            Xuất CSV
          </Button>
        </span>
      </Tooltip>
    </Toolbar>
  );
}

export default TableToolbar;
