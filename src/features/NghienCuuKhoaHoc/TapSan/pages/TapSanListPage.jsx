import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import { listTapSan, deleteTapSan } from "../services/tapsan.api";
import { useNavigate } from "react-router-dom";

export default function TapSanListPage() {
  const nav = useNavigate();
  const [items, setItems] = React.useState([]);
  const [page, setPage] = React.useState(1);
  const [size, setSize] = React.useState(20);
  const [total, setTotal] = React.useState(0);
  const [filters, setFilters] = React.useState({
    Loai: "",
    NamXuatBan: "",
    SoXuatBan: "",
  });

  const fetchData = React.useCallback(async () => {
    const data = await listTapSan({ page, size, ...filters });
    setItems(data?.items || []);
    setTotal(data?.total || 0);
  }, [page, size, filters]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onDelete = async (id) => {
    await deleteTapSan(id);
    await fetchData();
  };

  return (
    <Box p={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">Quản lý Tập san</Typography>
        <Button variant="contained" onClick={() => nav("/tapsan/new")}>
          Tạo Tập san
        </Button>
      </Stack>
      <Stack direction="row" spacing={2} mb={2}>
        <TextField
          select
          size="small"
          label="Loại"
          value={filters.Loai}
          onChange={(e) => setFilters((s) => ({ ...s, Loai: e.target.value }))}
          sx={{ width: 160 }}
        >
          <MenuItem value="">Tất cả</MenuItem>
          <MenuItem value="YHTH">YHTH</MenuItem>
          <MenuItem value="TTT">TTT</MenuItem>
        </TextField>
        <TextField
          size="small"
          label="Năm"
          value={filters.NamXuatBan}
          onChange={(e) =>
            setFilters((s) => ({ ...s, NamXuatBan: e.target.value }))
          }
          sx={{ width: 120 }}
        />
        <TextField
          size="small"
          label="Số XB"
          value={filters.SoXuatBan}
          onChange={(e) =>
            setFilters((s) => ({ ...s, SoXuatBan: e.target.value }))
          }
          sx={{ width: 120 }}
        />
        <Button onClick={() => setPage(1)} variant="outlined">
          Lọc
        </Button>
      </Stack>
      <Box>
        {items.map((it) => (
          <Stack
            key={it._id}
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ py: 1, borderBottom: "1px solid #eee" }}
          >
            <Typography sx={{ width: 80 }}>{it.Loai}</Typography>
            <Typography sx={{ width: 100 }}>{it.NamXuatBan}</Typography>
            <Typography sx={{ width: 100 }}>{it.SoXuatBan}</Typography>
            <Button size="small" onClick={() => nav(`/tapsan/${it._id}`)}>
              Chi tiết
            </Button>
            <Button size="small" onClick={() => nav(`/tapsan/${it._id}/edit`)}>
              Sửa
            </Button>
            <Button size="small" color="error" onClick={() => onDelete(it._id)}>
              Xóa
            </Button>
          </Stack>
        ))}
        {!items.length && <Typography>Không có dữ liệu</Typography>}
      </Box>
    </Box>
  );
}
