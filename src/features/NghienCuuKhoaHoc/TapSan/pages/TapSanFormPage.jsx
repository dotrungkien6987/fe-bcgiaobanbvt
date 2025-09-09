import React from "react";
import {
  Box,
  Button,
  Stack,
  Typography,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  createTapSan,
  getTapSanById,
  updateTapSan,
} from "../services/tapsan.api";
import { useNavigate, useParams } from "react-router-dom";

export default function TapSanFormPage() {
  const nav = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id) && id !== "new";
  const [form, setForm] = React.useState({
    Loai: "YHTH",
    NamXuatBan: "2025",
    SoXuatBan: 1,
  });

  React.useEffect(() => {
    if (isEdit) {
      getTapSanById(id).then((d) =>
        setForm({
          Loai: d.Loai || "YHTH",
          NamXuatBan: d.NamXuatBan || "2025",
          SoXuatBan: d.SoXuatBan || 1,
        })
      );
    }
  }, [id, isEdit]);

  const onSubmit = async () => {
    if (isEdit) {
      await updateTapSan(id, form);
      nav(`/tapsan/${id}`);
    } else {
      const d = await createTapSan(form);
      nav(`/tapsan/${d._id}`);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" mb={2}>
        {isEdit ? "Sửa Tập san" : "Tạo Tập san"}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ maxWidth: 600 }}>
        <TextField
          select
          fullWidth
          label="Loại"
          value={form.Loai}
          onChange={(e) => setForm((s) => ({ ...s, Loai: e.target.value }))}
        >
          <MenuItem value="YHTH">YHTH</MenuItem>
          <MenuItem value="TTT">TTT</MenuItem>
        </TextField>
        <TextField
          label="Năm xuất bản"
          value={form.NamXuatBan}
          onChange={(e) =>
            setForm((s) => ({ ...s, NamXuatBan: e.target.value }))
          }
        />
        <TextField
          label="Số xuất bản"
          type="number"
          value={form.SoXuatBan}
          onChange={(e) =>
            setForm((s) => ({ ...s, SoXuatBan: Number(e.target.value) }))
          }
        />
      </Stack>
      <Stack direction="row" spacing={2} mt={2}>
        <Button variant="contained" onClick={onSubmit}>
          {isEdit ? "Lưu" : "Tạo mới"}
        </Button>
        <Button variant="text" onClick={() => nav(-1)}>
          Hủy
        </Button>
      </Stack>
    </Box>
  );
}
