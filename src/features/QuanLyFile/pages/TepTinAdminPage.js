import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listFiles,
  getStats,
  getTree,
  restoreFile,
  softDeleteFile,
  forceDeleteFile,
  cleanup,
} from "../tepTinAdminSlice";
import {
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  Tooltip,
  Paper,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import apiService from "app/apiService";
import { BASE_URL } from "app/config";

function Size({ value }) {
  if (value == null) return null;
  const kb = value / 1024;
  const mb = kb / 1024;
  return <span>{mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`}</span>;
}

function RowActions({ row }) {
  const dispatch = useDispatch();
  const onRestore = () => dispatch(restoreFile(row._id));
  const onSoftDelete = () => dispatch(softDeleteFile(row._id));
  const onForceDelete = () => {
    if (
      window.confirm("Xóa vĩnh viễn tệp này? Hành động không thể hoàn tác.")
    ) {
      dispatch(forceDeleteFile(row._id));
    }
  };
  return (
    <Stack direction="row" spacing={1}>
      <Tooltip title="Phục hồi (Restore)">
        <span>
          <IconButton
            color="primary"
            size="small"
            onClick={onRestore}
            disabled={row.TrangThai !== "DELETED"}
          >
            <RestoreIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Xóa mềm (Soft delete)">
        <span>
          <IconButton
            color="warning"
            size="small"
            onClick={onSoftDelete}
            disabled={row.TrangThai === "DELETED"}
          >
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Xóa vĩnh viễn (Force delete)">
        <IconButton color="error" size="small" onClick={onForceDelete}>
          <DeleteForeverIcon fontSize="inherit" />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

export default function TepTinAdminPage() {
  const dispatch = useDispatch();
  const { isLoading, items, page, size, total, stats } = useSelector(
    (s) => s.tepTinAdmin || {}
  );
  const [q, setQ] = useState("");
  const [TrangThai, setTrangThai] = useState("");
  const [LoaiFile, setLoaiFile] = useState("");
  const [OwnerType, setOwnerType] = useState("");
  const [OwnerID, setOwnerID] = useState("");
  const [OwnerField, setOwnerField] = useState("");
  const [NguoiTaiLenID, setNguoiTaiLenID] = useState("");

  useEffect(() => {
    dispatch(listFiles({ page: 1, size }));
    dispatch(getStats());
    dispatch(getTree("owner"));
  }, [dispatch, size]);

  const onSearch = () => {
    dispatch(
      listFiles({
        page: 1,
        size,
        q: q || undefined,
        TrangThai: TrangThai || undefined,
        LoaiFile: LoaiFile || undefined,
        OwnerType: OwnerType || undefined,
        OwnerID: OwnerID || undefined,
        OwnerField: OwnerField || undefined,
        NguoiTaiLenID: NguoiTaiLenID || undefined,
      })
    );
  };

  const isPreviewable = (mime = "") => {
    const m = String(mime).toLowerCase();
    if (!m) return false;
    return (
      m.startsWith("image/") ||
      m === "application/pdf" ||
      m.startsWith("audio/") ||
      m.startsWith("video/")
    );
  };

  const openInNewTab = (blob) => {
    const url = window.URL.createObjectURL(blob);
    const win = window.open(url, "_blank");
    if (!win) {
      // Fallback: navigate current tab
      window.location.href = url;
    }
  };

  const triggerDownload = (blob, filename = "download") => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  };

  const handleOpenFile = async (r) => {
    try {
      // Build absolute URL from BASE_URL to avoid double/missing /api issues
      const inlineAbs = (() => {
        const raw = r.adminInlineUrl || r.inlineUrl || "";
        return raw ? new URL(raw, BASE_URL).toString() : null;
      })();
      if (!inlineAbs) throw new Error("Không có URL xem file");
      const res = await apiService.get(inlineAbs, { responseType: "blob" });
      const mime =
        res.headers["content-type"] || r.LoaiFile || "application/octet-stream";
      const blob = new Blob([res.data], { type: mime });
      if (isPreviewable(mime)) {
        openInNewTab(blob);
      } else {
        const name = r.TenGoc || r.TenFile || "download";
        triggerDownload(blob, name);
      }
    } catch (e) {
      // Fallback to download endpoint
      try {
        const downloadAbs = (() => {
          const raw = r.adminDownloadUrl || r.downloadUrl || "";
          return raw ? new URL(raw, BASE_URL).toString() : null;
        })();
        if (!downloadAbs) throw new Error("Không có URL tải file");
        const res = await apiService.get(downloadAbs, { responseType: "blob" });
        const mime =
          res.headers["content-type"] ||
          r.LoaiFile ||
          "application/octet-stream";
        const blob = new Blob([res.data], { type: mime });
        const name = r.TenGoc || r.TenFile || "download";
        triggerDownload(blob, name);
      } catch (err) {
        console.error(err);
      }
    }
  };
  const onPage = (delta) => {
    const next = (page || 1) + delta;
    if (next < 1) return;
    dispatch(
      listFiles({
        page: next,
        size,
        q: q || undefined,
        TrangThai: TrangThai || undefined,
        LoaiFile: LoaiFile || undefined,
        OwnerType: OwnerType || undefined,
        OwnerID: OwnerID || undefined,
        OwnerField: OwnerField || undefined,
        NguoiTaiLenID: NguoiTaiLenID || undefined,
      })
    );
  };
  return (
    <Box p={2}>
      {/* Header actions */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Typography variant="h5" fontWeight={700}>
          Quản lý Tệp tin (Admin)
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Quét sự chênh lệch giữa CSDL và tệp vật lý">
            <Button variant="outlined" onClick={() => dispatch(cleanup(false))}>
              Quét chênh lệch
            </Button>
          </Tooltip>
          <Tooltip title="Đánh dấu DELETED cho tệp mất trên đĩa">
            <Button
              color="warning"
              variant="contained"
              onClick={() => dispatch(cleanup(true))}
            >
              Dọn dẹp (fix)
            </Button>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Stats on top */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #f5f7ff 0%, #ffffff 100%)",
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Tổng số tệp
            </Typography>
            <Typography variant="h4">
              {stats?.sizeStats?.soLuongFile ?? 0}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #f5fff7 0%, #ffffff 100%)",
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Tổng dung lượng
            </Typography>
            <Typography variant="h4">
              {(() => {
                const v = stats?.sizeStats?.tongKichThuoc ?? 0;
                const mb = v / 1024 / 1024;
                return `${mb.toFixed(2)} MB`;
              })()}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #fff7f5 0%, #ffffff 100%)",
            }}
          >
            <Typography variant="overline" color="text.secondary">
              Kích thước trung bình
            </Typography>
            <Typography variant="h4">
              {(() => {
                const v = stats?.sizeStats?.kichThuocTrungBinh ?? 0;
                const kb = v / 1024;
                return `${kb.toFixed(2)} KB`;
              })()}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Tìm kiếm tên/mô tả"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSearch()}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Trạng thái (ACTIVE/DELETED)"
              value={TrangThai}
              onChange={(e) => setTrangThai(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Loại file (mime)"
              placeholder="vd: application/pdf"
              value={LoaiFile}
              onChange={(e) => setLoaiFile(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="OwnerType"
              value={OwnerType}
              onChange={(e) => setOwnerType(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="OwnerID"
              value={OwnerID}
              onChange={(e) => setOwnerID(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="OwnerField"
              value={OwnerField}
              onChange={(e) => setOwnerField(e.target.value)}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              fullWidth
              label="Người tải lên (ID)"
              value={NguoiTaiLenID}
              onChange={(e) => setNguoiTaiLenID(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack direction="row" spacing={1}>
              <Button variant="contained" onClick={onSearch}>
                Lọc
              </Button>
              <Button
                variant="text"
                onClick={() => {
                  setQ("");
                  setTrangThai("");
                  setLoaiFile("");
                  setOwnerType("");
                  setOwnerID("");
                  setOwnerField("");
                  setNguoiTaiLenID("");
                  dispatch(listFiles({ page: 1, size }));
                }}
              >
                Reset
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {isLoading && <LinearProgress sx={{ my: 1 }} />}

      {/* Table */}
      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Danh sách tệp
        </Typography>
        <Box sx={{ overflowX: "auto" }}>
          <table
            className="table"
            style={{ width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>Tên gốc</th>
                <th>Loại</th>
                <th>Kích thước</th>
                <th>Trạng thái</th>
                <th>OwnerType</th>
                <th>OwnerID</th>
                <th>Field</th>
                <th>Đường dẫn</th>
                <th>Người tải lên</th>
                <th>Ngày</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {(items || []).map((r) => (
                <tr key={r._id}>
                  <td>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{ cursor: "pointer", textDecoration: "underline" }}
                        onClick={() => handleOpenFile(r)}
                      >
                        {r.TenGoc}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {r.MoTa}
                      </Typography>
                    </Stack>
                  </td>
                  <td>{r.LoaiFile}</td>
                  <td>
                    <Size value={r.KichThuoc} />
                  </td>
                  <td>
                    <Chip
                      size="small"
                      color={r.TrangThai === "DELETED" ? "warning" : "success"}
                      label={r.TrangThai}
                    />
                  </td>
                  <td>
                    <Typography variant="caption">
                      {r.OwnerType || "-"}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="caption">
                      {r.OwnerID || "-"}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="caption">
                      {r.OwnerField || "-"}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="caption">
                      {(() => {
                        const p = r.DuongDan || "";
                        if (!p) return "-";
                        const parts = String(p).split("/").filter(Boolean);
                        if (parts.length <= 1) return "/";
                        return `/${parts.slice(0, -1).join("/")}`;
                      })()}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="caption">
                      {r?.NguoiTaiLen?.Ten ||
                        r?.NguoiTaiLen?.HoTen ||
                        r.NguoiTaiLenName ||
                        "-"}
                    </Typography>
                  </td>
                  <td>
                    <Typography variant="caption">
                      {r.NgayTaiLen
                        ? new Date(r.NgayTaiLen).toLocaleString()
                        : ""}
                    </Typography>
                  </td>
                  <td>
                    <RowActions row={r} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
          <Button size="small" disabled={page <= 1} onClick={() => onPage(-1)}>
            Trang trước
          </Button>
          <Chip
            label={`${page} / ${Math.max(
              1,
              Math.ceil((total || 0) / (size || 50))
            )}`}
          />
          <Button
            size="small"
            disabled={page >= Math.ceil((total || 0) / (size || 50))}
            onClick={() => onPage(+1)}
          >
            Trang sau
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
