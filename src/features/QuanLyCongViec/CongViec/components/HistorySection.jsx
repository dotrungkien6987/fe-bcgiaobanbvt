import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Collapse,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  IconButton,
  TextField,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CheckIcon from "@mui/icons-material/Check";
import HistoryIcon from "@mui/icons-material/History";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import HistoryAccordion from "./HistoryAccordion";
import useAuth from "hooks/useAuth";
// no redux dispatch needed for now (optimistic local update only)
import { useDispatch } from "react-redux";
import { updateProgressHistoryNote } from "../congViecSlice";
import dayjs from "dayjs";

function formatProgressTime(dt) {
  if (!dt) return "—";
  return dayjs(dt).format("DD/MM/YYYY HH:mm:ss");
}

const PercentBadge = ({ from, to }) => {
  const up = typeof from === "number" && typeof to === "number" && to > from;
  const down = typeof from === "number" && typeof to === "number" && to < from;
  const same = from === to;
  const gradient = up
    ? "linear-gradient(90deg,#4caf50,#81c784)"
    : down
    ? "linear-gradient(90deg,#ff9800,#ffc107)"
    : "linear-gradient(90deg,#90a4ae,#cfd8dc)";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
      }}
    >
      <Chip
        size="small"
        label={`${from ?? 0}%`}
        sx={{
          fontWeight: 600,
          bgcolor: "grey.200",
        }}
      />
      <Box
        sx={{
          flex: 1,
          height: 6,
          bgcolor: "grey.100",
          borderRadius: 3,
          position: "relative",
          minWidth: 80,
        }}
      >
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: gradient,
            borderRadius: 3,
            width: `${Math.max(0, Math.min(100, to))}%`,
            transition: "width .3s",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: -18,
            left: 0,
            fontSize: 10,
            color: "text.secondary",
          }}
        >
          {from}%
        </Box>
        <Box
          sx={{
            position: "absolute",
            top: -18,
            right: 0,
            fontSize: 10,
            color: "text.secondary",
          }}
        >
          {to}%
        </Box>
      </Box>
      <Chip
        size="small"
        label={`${to ?? 0}%`}
        color={up ? "success" : down ? "warning" : "default"}
        variant={same ? "outlined" : "filled"}
        sx={{ fontWeight: 600 }}
      />
    </Box>
  );
};

function ProgressAccordion({ items = [], congViecId }) {
  const [open, setOpen] = useState(true);
  const ordered = items
    .map((h, originalIndex) => ({ ...h, originalIndex }))
    .sort(
      (a, b) =>
        new Date(b.ThoiGian || b.createdAt) -
        new Date(a.ThoiGian || a.createdAt)
    );
  const count = ordered.length;
  const { user } = useAuth();
  const dispatch = useDispatch();
  const currentNhanVienId =
    user?.NhanVienID?._id ||
    user?.NhanVienID ||
    user?.NhanVien?.NhanVienID ||
    user?.NhanVien?._id ||
    null;
  const [editing, setEditing] = useState(null); // originalIndex
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  const saveNote = async (entry) => {
    if (saving) return;
    setSaving(true);
    try {
      await dispatch(
        updateProgressHistoryNote({
          congViecId,
          index: entry.originalIndex,
          note: draft,
        })
      );
      setEditing(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderRadius: 2,
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Lịch sử tiến độ {count ? `(${count})` : ""}
        </Typography>
        <IconButton size="small">
          {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        </IconButton>
      </Paper>
      <Collapse in={open} timeout="auto" unmountOnExit>
        {count === 0 ? (
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center", mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có lịch sử tiến độ
            </Typography>
          </Paper>
        ) : (
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxHeight: 420, mt: 1 }}
          >
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell width={160}>Thời gian</TableCell>
                  <TableCell width={170}>Người thực hiện</TableCell>
                  <TableCell width={260}>Từ % ➜ Đến %</TableCell>
                  <TableCell>Ghi chú</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {ordered.map((h, idx) => {
                  const performerName =
                    h.NguoiThucHien?.Ten ||
                    h.NguoiThucHien?.HoTen ||
                    (typeof h.NguoiThucHienID === "string"
                      ? h.NguoiThucHienID.slice(-6)
                      : "?");
                  const canEdit =
                    currentNhanVienId &&
                    h.NguoiThucHienID &&
                    String(h.NguoiThucHienID) === String(currentNhanVienId);
                  const isEditing = editing === h.originalIndex;
                  return (
                    <TableRow key={idx} hover>
                      <TableCell>{formatProgressTime(h.ThoiGian)}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {performerName}
                      </TableCell>
                      <TableCell>
                        <PercentBadge from={h.Tu} to={h.Den} />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: "pre-wrap" }}>
                        {isEditing ? (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 1,
                            }}
                          >
                            <TextField
                              size="small"
                              fullWidth
                              multiline
                              minRows={1}
                              maxRows={4}
                              value={draft}
                              onChange={(e) => setDraft(e.target.value)}
                              disabled={saving}
                              placeholder="Nhập ghi chú..."
                              helperText="Enter để lưu · Shift+Enter xuống dòng"
                              onKeyDown={async (e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  if (saving) return;
                                  await saveNote(h);
                                }
                              }}
                            />
                            {saving ? (
                              <CircularProgress size={22} sx={{ mt: 0.5 }} />
                            ) : (
                              <IconButton
                                size="small"
                                color="success"
                                onClick={async () => await saveNote(h)}
                              >
                                <CheckIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Box>
                        ) : (
                          <Box
                            sx={{
                              position: "relative",
                              fontStyle: h.GhiChu ? "italic" : "normal",
                              cursor: canEdit ? "pointer" : "default",
                              p: canEdit ? 0.75 : 0.25,
                              pr: canEdit ? 4 : 0.75,
                              borderRadius: 1,
                              transition: "background-color .15s",
                              "&:hover": canEdit
                                ? { bgcolor: "action.hover" }
                                : undefined,
                              "&:hover .note-edit-icon": {
                                opacity: 1,
                                transform: "scale(1)",
                                pointerEvents: "auto",
                              },
                              minHeight: 32,
                            }}
                            onClick={() => {
                              if (!canEdit) return;
                              setEditing(h.originalIndex);
                              setDraft(h.GhiChu || "");
                            }}
                          >
                            {h.GhiChu ||
                              (canEdit ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  (Thêm ghi chú)
                                </Typography>
                              ) : (
                                ""
                              ))}
                            {canEdit && (
                              <Box
                                className="note-edit-icon"
                                sx={{
                                  position: "absolute",
                                  top: 2,
                                  right: 2,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  width: 26,
                                  height: 26,
                                  borderRadius: 1,
                                  color: "text.secondary",
                                  bgcolor: "transparent",
                                  opacity: 0,
                                  transform: "scale(.85)",
                                  transition: "all .15s",
                                  pointerEvents: "none",
                                }}
                              >
                                <EditNoteIcon fontSize="small" />
                              </Box>
                            )}
                          </Box>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Collapse>
    </Box>
  );
}

const HistorySection = ({ congViecDetail, congViecId, theme }) => {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: "grey.50",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
          color: "white",
          p: 2,
          borderBottom: "none",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontSize: { xs: "1.1rem", sm: "1.2rem" },
          }}
        >
          <HistoryIcon sx={{ fontSize: 26 }} />
          Lịch sử cập nhật trạng thái
        </Typography>
      </Box>
      <CardContent sx={{ p: 3 }}>
        {congViecDetail?.LichSuTrangThai?.length ? (
          <HistoryAccordion
            history={congViecDetail.LichSuTrangThai}
            congViecId={congViecId}
          />
        ) : (
          <Box
            sx={{
              p: 3,
              textAlign: "center",
              backgroundColor: theme.palette.grey[50],
              border: `1px dashed ${theme.palette.grey[300]}`,
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Chưa có lịch sử cập nhật trạng thái
            </Typography>
          </Box>
        )}
        <Box
          sx={{
            mt: 3,
            pt: 3,
            borderTop: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontWeight: 600,
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              gap: 1,
              fontSize: { xs: "1.05rem", sm: "1.15rem" },
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 24 }} />
            Lịch sử cập nhật tiến độ
          </Typography>
          <ProgressAccordion
            items={congViecDetail?.LichSuTienDo || []}
            congViecId={congViecId}
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default HistorySection;
