import React from "react";
import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Box,
  Chip,
} from "@mui/material";
import {
  getStatusText,
  getActionLabel,
  getStatusColor,
} from "../../../../utils/congViecUtils";
import TextField from "@mui/material/TextField";
import CheckIcon from "@mui/icons-material/Check";
import EditNoteIcon from "@mui/icons-material/EditNote";
import CircularProgress from "@mui/material/CircularProgress";
import { useDispatch } from "react-redux";
import { updateHistoryNote } from "../congViecSlice";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import useAuth from "hooks/useAuth";

function formatDate(dt) {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleString("vi-VN");
  } catch {
    return "—";
  }
}

// Trạng thái tiếng Việt đã có ở utils -> getStatusText; fallback tự format

const toStatusLabel = (code) => {
  if (!code) return "";
  const txt = getStatusText(code);
  if (txt && txt !== code) return txt; // đã dịch
  // fallback: chuyển underscore thành dấu cách + thường hóa chữ đầu
  return code
    .toString()
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

export default function HistoryAccordion({
  history = [],
  defaultOpen = true,
  congViecId,
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const dispatch = useDispatch();
  // Lấy user từ AuthContext chuẩn (useAuth) thay vì redux state phụ để tránh lệch dữ liệu
  const { user } = useAuth();
  // Chuẩn hóa lấy NhanVienID dù trả về dạng string hay object hoặc lồng trong user.NhanVien
  const currentNhanVienId =
    user?.NhanVienID?._id ||
    user?.NhanVienID ||
    user?.NhanVien?.NhanVienID ||
    user?.NhanVien?._id ||
    null; // không fallback sang user._id để tránh nhầm userId với nhanVienId
  // editing sẽ lưu originalIndex của entry để tránh sai lệch khi sort
  const [editing, setEditing] = React.useState(null); // originalIndex đang sửa
  const [draft, setDraft] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  if (!Array.isArray(history) || !history.length)
    return (
      <Box sx={{ mt: 2 }}>
        <HistoryHeader open={open} onToggle={() => setOpen(!open)} count={0} />
        <Collapse in={open} timeout="auto" unmountOnExit>
          <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Chưa có lịch sử cập nhật trạng thái
            </Typography>
          </Paper>
        </Collapse>
      </Box>
    );
  // Bảo toàn originalIndex trước khi sort để gửi đúng index lên BE (BE dùng index gốc của mảng lưu trong DB)
  const ordered = history
    .map((h, originalIndex) => ({ ...h, originalIndex }))
    .sort((a, b) => new Date(b.ThoiGian) - new Date(a.ThoiGian));
  return (
    <Box sx={{ mt: 2 }}>
      <HistoryHeader
        open={open}
        onToggle={() => setOpen(!open)}
        count={ordered.length}
      />
      <Collapse in={open} timeout="auto" unmountOnExit>
        <TableContainer
          component={Paper}
          variant="outlined"
          sx={{ maxHeight: 420, mt: 1 }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width={150}>Thời gian</TableCell>
                <TableCell width={160}>Người thực hiện</TableCell>
                <TableCell width={130}>Hành động</TableCell>
                <TableCell width={170}>Từ trạng thái</TableCell>
                <TableCell width={170}>Đến trạng thái</TableCell>
                <TableCell>Ghi chú</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {ordered.map((h, idx) => {
                const performerName =
                  h.NguoiThucHien?.Ten ||
                  h.NguoiThucHienTen ||
                  h.NguoiThucHien?.HoTen ||
                  (typeof h.NguoiThucHienID === "string"
                    ? h.NguoiThucHienID.slice(-6)
                    : "?");
                const fromColor = getStatusColor(h.TuTrangThai);
                const toColor = getStatusColor(h.DenTrangThai);
                const canEdit =
                  currentNhanVienId &&
                  h.NguoiThucHienID &&
                  String(h.NguoiThucHienID) === String(currentNhanVienId);
                const isRowEditing = editing === h.originalIndex;
                return (
                  <TableRow key={idx} hover>
                    <TableCell>{formatDate(h.ThoiGian)}</TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>
                      {performerName}
                    </TableCell>
                    <TableCell>
                      {h.HanhDong ? (
                        <Chip
                          label={getActionLabel(h.HanhDong)}
                          size="small"
                          variant="outlined"
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {h.TuTrangThai ? (
                        <Chip
                          size="small"
                          label={toStatusLabel(h.TuTrangThai)}
                          sx={{
                            backgroundColor: fromColor,
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      {h.DenTrangThai ? (
                        <Chip
                          size="small"
                          label={toStatusLabel(h.DenTrangThai)}
                          sx={{
                            backgroundColor: toColor,
                            color: "#fff",
                            fontWeight: 600,
                          }}
                        />
                      ) : null}
                    </TableCell>
                    <TableCell sx={{ whiteSpace: "pre-wrap" }}>
                      {isRowEditing ? (
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
                            helperText="Nhấn Enter để lưu · Shift+Enter để xuống dòng"
                            onKeyDown={async (e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                if (saving) return;
                                setSaving(true);
                                try {
                                  await dispatch(
                                    updateHistoryNote({
                                      congViecId,
                                      index: h.originalIndex,
                                      note: draft,
                                    })
                                  );
                                  setEditing(null);
                                } finally {
                                  setSaving(false);
                                }
                              }
                            }}
                          />
                          {saving ? (
                            <CircularProgress size={22} sx={{ mt: 0.5 }} />
                          ) : (
                            <IconButton
                              size="small"
                              color="success"
                              title="Lưu (Enter)"
                              onClick={async () => {
                                setSaving(true);
                                try {
                                  await dispatch(
                                    updateHistoryNote({
                                      congViecId,
                                      index: h.originalIndex,
                                      note: draft,
                                    })
                                  );
                                  setEditing(null);
                                } finally {
                                  setSaving(false);
                                }
                              }}
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
      </Collapse>
    </Box>
  );
}

function HistoryHeader({ open, onToggle, count }) {
  return (
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
      onClick={onToggle}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Lịch sử trạng thái {count ? `(${count})` : ""}
        </Typography>
      </Box>
      <IconButton
        size="small"
        onClick={onToggle}
        aria-label={open ? "Thu gọn" : "Mở rộng"}
      >
        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
      </IconButton>
    </Paper>
  );
}
