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
  getOrphanedFiles,
  deleteOrphanedFiles,
  getStorageStats,
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
  Tabs,
  Tab,
  Alert,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
} from "@mui/material";
import RestoreIcon from "@mui/icons-material/Restore";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import StorageIcon from "@mui/icons-material/Storage";
import CleaningServicesIcon from "@mui/icons-material/CleaningServices";
import PieChartIcon from "@mui/icons-material/PieChart";
import apiService from "app/apiService";
import { BASE_URL } from "app/config";
import ProductionWarningBanner from "components/ProductionWarningBanner";
import { useProductionConfirm } from "components/ProductionConfirmDialog";

function Size({ value }) {
  if (value == null) return null;
  const kb = value / 1024;
  const mb = kb / 1024;
  return <span>{mb >= 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`}</span>;
}

function RowActions({ row, showProductionConfirm }) {
  const dispatch = useDispatch();
  const onRestore = () => dispatch(restoreFile(row._id));
  const onSoftDelete = () => dispatch(softDeleteFile(row._id));
  const onForceDelete = () => {
    showProductionConfirm({
      title: "Xác nhận xóa vĩnh viễn",
      actionDescription: `Xóa vĩnh viễn tệp: "${row.TenGoc || row.TenFile}"`,
      onConfirm: () => dispatch(forceDeleteFile(row._id)),
    });
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

// =============== CLEANUP PANEL COMPONENTS ===============

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  const kb = bytes / 1024;
  const mb = kb / 1024;
  const gb = mb / 1024;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  if (mb >= 1) return `${mb.toFixed(2)} MB`;
  if (kb >= 1) return `${kb.toFixed(2)} KB`;
  return `${bytes} B`;
}

function OrphanedFilesPanel({ showProductionConfirm }) {
  const dispatch = useDispatch();
  const { isLoading, orphanedFiles, orphanedTotal, orphanedTotalSize } =
    useSelector((s) => s.tepTinAdmin || {});
  const [selectedIds, setSelectedIds] = useState([]);
  const [daysThreshold, setDaysThreshold] = useState(90);

  const handleLoad = () => {
    dispatch(getOrphanedFiles({ daysOld: daysThreshold }));
    setSelectedIds([]);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds((orphanedFiles || []).map((f) => f._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const selectedFiles = orphanedFiles.filter((f) =>
      selectedIds.includes(f._id),
    );
    const totalSize = selectedFiles.reduce(
      (acc, f) => acc + (f.KichThuoc || 0),
      0,
    );

    showProductionConfirm({
      title: "Xóa vĩnh viễn tệp rác",
      actionDescription: `Xóa ${selectedIds.length} tệp (${formatBytes(totalSize)}) đã đánh dấu xóa > ${daysThreshold} ngày`,
      onConfirm: async () => {
        await dispatch(deleteOrphanedFiles({ fileIds: selectedIds }));
        setSelectedIds([]);
        handleLoad();
      },
    });
  };

  const handleDeleteAll = () => {
    if (!orphanedTotal) return;
    showProductionConfirm({
      title: "Xóa TẤT CẢ tệp rác",
      actionDescription: `Xóa ${orphanedTotal} tệp (${formatBytes(orphanedTotalSize)}) đã đánh dấu xóa > ${daysThreshold} ngày`,
      onConfirm: async () => {
        await dispatch(
          deleteOrphanedFiles({ deleteAll: true, daysOld: daysThreshold }),
        );
        setSelectedIds([]);
        handleLoad();
      },
    });
  };

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<CleaningServicesIcon color="warning" />}
        title="Tệp rác (Orphaned Files)"
        subheader="Tệp đã đánh dấu DELETED quá thời gian quy định"
      />
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              type="number"
              size="small"
              label="Số ngày (xóa > N ngày)"
              value={daysThreshold}
              onChange={(e) => setDaysThreshold(Number(e.target.value) || 90)}
              sx={{ width: 180 }}
            />
            <Button
              variant="contained"
              onClick={handleLoad}
              disabled={isLoading}
            >
              Quét tệp rác
            </Button>
            {orphanedTotal > 0 && (
              <>
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleDeleteSelected}
                  disabled={selectedIds.length === 0}
                >
                  Xóa đã chọn ({selectedIds.length})
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  onClick={handleDeleteAll}
                >
                  Xóa tất cả ({orphanedTotal})
                </Button>
              </>
            )}
          </Stack>

          {orphanedTotal > 0 && (
            <Alert severity="warning">
              Tìm thấy <strong>{orphanedTotal}</strong> tệp rác, chiếm{" "}
              <strong>{formatBytes(orphanedTotalSize)}</strong> dung lượng
            </Alert>
          )}

          {orphanedFiles && orphanedFiles.length > 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedIds.length === orphanedFiles.length}
                        indeterminate={
                          selectedIds.length > 0 &&
                          selectedIds.length < orphanedFiles.length
                        }
                        onChange={handleSelectAll}
                      />
                    </TableCell>
                    <TableCell>Tên file</TableCell>
                    <TableCell>Loại</TableCell>
                    <TableCell>Kích thước</TableCell>
                    <TableCell>Ngày xóa</TableCell>
                    <TableCell>Tuổi (ngày)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orphanedFiles.map((f) => (
                    <TableRow key={f._id} hover>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedIds.includes(f._id)}
                          onChange={() => handleToggle(f._id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ maxWidth: 300 }}
                        >
                          {f.TenGoc || f.TenFile}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{f.LoaiFile}</Typography>
                      </TableCell>
                      <TableCell>{formatBytes(f.KichThuoc)}</TableCell>
                      <TableCell>
                        {f.deletedAt
                          ? new Date(f.deletedAt).toLocaleDateString("vi-VN")
                          : "-"}
                      </TableCell>
                      <TableCell>{f.daysOld || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {orphanedFiles &&
            orphanedFiles.length === 0 &&
            orphanedTotal === 0 && (
              <Alert severity="success">Không có tệp rác nào!</Alert>
            )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function StorageStatsPanel() {
  const dispatch = useDispatch();
  const { isLoading, storageStats } = useSelector((s) => s.tepTinAdmin || {});

  const handleLoad = () => {
    dispatch(getStorageStats());
  };

  const byStatus = storageStats?.byStatus || [];
  const byType = storageStats?.byType || [];
  const byMonth = storageStats?.byMonth || [];
  const byOwnerType = storageStats?.byOwnerType || [];
  const diskSpace = storageStats?.diskSpace || {};

  return (
    <Card variant="outlined">
      <CardHeader
        avatar={<PieChartIcon color="primary" />}
        title="Thống kê lưu trữ (Storage Stats)"
        subheader="Phân tích chi tiết dung lượng lưu trữ"
      />
      <CardContent>
        <Stack spacing={3}>
          <Button
            variant="contained"
            onClick={handleLoad}
            disabled={isLoading}
            sx={{ alignSelf: "flex-start" }}
          >
            Tải thống kê
          </Button>

          {/* Disk Space Overview */}
          {diskSpace.totalMB > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                <StorageIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                Dung lượng ổ đĩa
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Tổng
                  </Typography>
                  <Typography variant="h6">
                    {(diskSpace.totalMB / 1024).toFixed(2)} GB
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Đã sử dụng
                  </Typography>
                  <Typography variant="h6" color="warning.main">
                    {(diskSpace.usedMB / 1024).toFixed(2)} GB
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary">
                    Còn trống
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    {(diskSpace.freeMB / 1024).toFixed(2)} GB
                  </Typography>
                </Grid>
              </Grid>
              <LinearProgress
                variant="determinate"
                value={diskSpace.usedPercent || 0}
                sx={{ mt: 1, height: 8, borderRadius: 1 }}
                color={diskSpace.usedPercent > 80 ? "error" : "primary"}
              />
              <Typography variant="caption" align="right" display="block">
                Đã dùng {diskSpace.usedPercent?.toFixed(1)}%
              </Typography>
            </Paper>
          )}

          {/* By Status */}
          {byStatus.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Theo trạng thái
              </Typography>
              <Stack direction="row" spacing={2}>
                {byStatus.map((s) => (
                  <Chip
                    key={s._id}
                    label={`${s._id}: ${s.count} files (${formatBytes(s.totalSize)})`}
                    color={s._id === "DELETED" ? "warning" : "success"}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Paper>
          )}

          {/* By Owner Type */}
          {byOwnerType.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Theo loại Owner
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Owner Type</TableCell>
                      <TableCell align="right">Số file</TableCell>
                      <TableCell align="right">Dung lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byOwnerType.map((o) => (
                      <TableRow key={o._id || "unknown"}>
                        <TableCell>{o._id || "(không xác định)"}</TableCell>
                        <TableCell align="right">{o.count}</TableCell>
                        <TableCell align="right">
                          {formatBytes(o.totalSize)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          {/* By Type (Top 10) */}
          {byType.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Theo loại file (Top 10)
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {byType.slice(0, 10).map((t) => (
                  <Chip
                    key={t._id || "unknown"}
                    size="small"
                    label={`${t._id || "?"}: ${t.count} (${formatBytes(t.totalSize)})`}
                    variant="outlined"
                  />
                ))}
              </Stack>
            </Paper>
          )}

          {/* By Month (Last 6 months) */}
          {byMonth.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Theo tháng (6 tháng gần nhất)
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tháng</TableCell>
                      <TableCell align="right">Số file mới</TableCell>
                      <TableCell align="right">Dung lượng</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {byMonth.slice(0, 6).map((m, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          {typeof m._id === "object" &&
                          m._id.year &&
                          m._id.month
                            ? `Tháng ${m._id.month}/${m._id.year}`
                            : m._id || "-"}
                        </TableCell>
                        <TableCell align="right">{m.count}</TableCell>
                        <TableCell align="right">
                          {formatBytes(m.totalSize)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

// =============== MAIN PAGE ===============

export default function TepTinAdminPage() {
  const dispatch = useDispatch();
  const { showConfirm, ConfirmDialog } = useProductionConfirm();
  const { isLoading, items, page, size, total, stats } = useSelector(
    (s) => s.tepTinAdmin || {},
  );
  const [activeTab, setActiveTab] = useState(0);
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
      }),
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
      }),
    );
  };
  return (
    <Box p={2}>
      {/* Production Warning Banner */}
      <ProductionWarningBanner />

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
              Tổng số tệp (ACTIVE)
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

      {/* Tabs for different sections */}
      <Paper elevation={1} sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            icon={<StorageIcon />}
            iconPosition="start"
            label="Quản lý tệp"
          />
          <Tab
            icon={<CleaningServicesIcon />}
            iconPosition="start"
            label="Dọn dẹp tệp rác"
          />
          <Tab icon={<PieChartIcon />} iconPosition="start" label="Thống kê" />
        </Tabs>
      </Paper>

      {/* Tab 0: File Management */}
      {activeTab === 0 && (
        <>
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
                            sx={{
                              cursor: "pointer",
                              textDecoration: "underline",
                            }}
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
                          color={
                            r.TrangThai === "DELETED" ? "warning" : "success"
                          }
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
                        <RowActions
                          row={r}
                          showProductionConfirm={showConfirm}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
            <Stack direction="row" spacing={1} justifyContent="flex-end" mt={1}>
              <Button
                size="small"
                disabled={page <= 1}
                onClick={() => onPage(-1)}
              >
                Trang trước
              </Button>
              <Chip
                label={`${page} / ${Math.max(
                  1,
                  Math.ceil((total || 0) / (size || 50)),
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
        </>
      )}

      {/* Tab 1: Orphaned Files Cleanup */}
      {activeTab === 1 && (
        <OrphanedFilesPanel showProductionConfirm={showConfirm} />
      )}

      {/* Tab 2: Storage Stats */}
      {activeTab === 2 && <StorageStatsPanel />}

      {/* Production Confirm Dialog */}
      {ConfirmDialog}
    </Box>
  );
}
