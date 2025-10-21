import React, { useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import UndoIcon from "@mui/icons-material/Undo";
import dayjs from "dayjs";

function KPIHistoryDialog({ open, onClose, currentDanhGiaKPI, isApproved }) {
  const events = useMemo(() => {
    const list = [];
    // Approvals
    if (Array.isArray(currentDanhGiaKPI?.LichSuDuyet)) {
      currentDanhGiaKPI.LichSuDuyet.forEach((a) => {
        if (!a) return;
        list.push({
          type: "APPROVE",
          date: a.NgayDuyet ? new Date(a.NgayDuyet) : null,
          by: a.NguoiDuyet,
          score: a.TongDiemLucDuyet,
          note: a.GhiChu,
        });
      });
    }
    // Undos
    if (Array.isArray(currentDanhGiaKPI?.LichSuHuyDuyet)) {
      currentDanhGiaKPI.LichSuHuyDuyet.forEach((u) => {
        if (!u) return;
        list.push({
          type: "UNDO",
          date: u.NgayHuyDuyet ? new Date(u.NgayHuyDuyet) : null,
          by: u.NguoiHuyDuyet,
          score: u.DiemTruocKhiHuy,
          reason: u.LyDoHuyDuyet,
          prevApproveDate: u.NgayDuyetTruocDo
            ? new Date(u.NgayDuyetTruocDo)
            : null,
        });
      });
    }
    // Sort by date ascending
    return list.filter((e) => !!e.date).sort((a, b) => a.date - b.date);
  }, [currentDanhGiaKPI]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          fontWeight: 700,
        }}
      >
        <HistoryIcon /> Lịch Sử Duyệt / Hủy Duyệt KPI
      </DialogTitle>
      <DialogContent sx={{ pt: 1, pb: 3 }}>
        <Box
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            bgcolor: isApproved ? "#f0fdf4" : "grey.50",
            border: "1px solid",
            borderColor: isApproved ? "#86efac" : "grey.300",
          }}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Trạng thái hiện tại: {isApproved ? "Đã duyệt" : "Chưa duyệt"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ngày duyệt:{" "}
            <strong>
              {currentDanhGiaKPI?.NgayDuyet
                ? dayjs(currentDanhGiaKPI.NgayDuyet).format("DD/MM/YYYY HH:mm")
                : "—"}
            </strong>
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tổng điểm hiện tại:{" "}
            <strong>{(currentDanhGiaKPI?.TongDiemKPI ?? 0).toFixed(1)}</strong>
          </Typography>
        </Box>

        {events.length > 0 ? (
          <Box sx={{ display: "flex", gap: 2 }}>
            {/* Simple timeline */}
            <Box sx={{ position: "relative", pr: 2 }}>
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 8,
                  width: 2,
                  bgcolor: "divider",
                }}
              />
              <Box sx={{ display: "grid", gap: 2 }}>
                {events.map((ev, idx) => (
                  <Box
                    key={idx}
                    sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}
                  >
                    <Box
                      sx={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        bgcolor:
                          ev.type === "APPROVE"
                            ? "success.main"
                            : "warning.main",
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: 1,
                        mt: 0.5,
                      }}
                    >
                      {ev.type === "APPROVE" ? (
                        <CheckCircleIcon sx={{ fontSize: 14 }} />
                      ) : (
                        <UndoIcon sx={{ fontSize: 14 }} />
                      )}
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        p: 1.5,
                        borderRadius: 1.5,
                        border: "1px solid",
                        borderColor:
                          ev.type === "APPROVE"
                            ? "success.light"
                            : "warning.light",
                        bgcolor: ev.type === "APPROVE" ? "#f0fdf4" : "#fff7ed",
                      }}
                    >
                      <Typography
                        variant="subtitle2"
                        fontWeight={700}
                        gutterBottom
                      >
                        {ev.type === "APPROVE" ? "Duyệt KPI" : "Hủy duyệt KPI"}{" "}
                        • {dayjs(ev.date).format("DD/MM/YYYY HH:mm")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ev.type === "APPROVE" ? "Người duyệt" : "Người hủy"}:{" "}
                        <strong>{ev.by?.HoTen || ev.by?.Ten || "—"}</strong>
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {ev.type === "APPROVE"
                          ? "Tổng điểm lúc duyệt"
                          : "Điểm trước khi hủy"}
                        : <strong>{(ev.score ?? 0).toFixed(1)}</strong>
                      </Typography>
                      {ev.type === "APPROVE" && ev.note && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Ghi chú: {ev.note}
                        </Typography>
                      )}
                      {ev.type === "UNDO" && ev.prevApproveDate && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          Ngày duyệt trước đó:{" "}
                          {dayjs(ev.prevApproveDate).format("DD/MM/YYYY HH:mm")}
                        </Typography>
                      )}
                      {ev.type === "UNDO" && ev.reason && (
                        <Typography
                          variant="body2"
                          color="warning.main"
                          sx={{ mt: 0.5 }}
                        >
                          Lý do: {ev.reason}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        ) : (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            Chưa có lịch sử duyệt/hủy duyệt.
          </Alert>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button variant="contained" onClick={onClose}>
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KPIHistoryDialog;
