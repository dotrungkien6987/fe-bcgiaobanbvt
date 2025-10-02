import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Chip,
  Alert,
  Stack,
  Divider,
} from "@mui/material";
import { Search, ContentCopy, Warning } from "@mui/icons-material";

const CopyAssignmentsDialog = ({
  open,
  targetEmployee,
  allEmployees = [],
  totalsByEmployeeId = {},
  onClose,
  onConfirm,
}) => {
  const [search, setSearch] = useState("");
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    if (!open) {
      setSearch("");
      setSelectedSource(null);
    }
  }, [open]);

  // Lọc nhân viên cùng khoa, không phải là chính mình
  const eligibleEmployees = useMemo(() => {
    if (!targetEmployee) return [];

    const targetKhoaId = targetEmployee.KhoaID?._id || targetEmployee.KhoaID;

    return allEmployees
      .filter((emp) => {
        const raw = emp.ThongTinNhanVienDuocQuanLy;
        const nv = Array.isArray(raw) ? raw[0] : raw;
        const empId = nv?._id || emp.NhanVienDuocQuanLy;
        const empKhoaId = nv?.KhoaID?._id || nv?.KhoaID;

        // Loại bỏ chính nhân viên đích và nhân viên khác khoa
        return empId !== targetEmployee._id && empKhoaId === targetKhoaId;
      })
      .map((emp) => {
        const raw = emp.ThongTinNhanVienDuocQuanLy;
        const nv = Array.isArray(raw) ? raw[0] : raw;
        const empId = nv?._id || emp.NhanVienDuocQuanLy;
        const totals = totalsByEmployeeId[empId] || {};

        return {
          _id: empId,
          Ten: nv?.Ten || "N/A",
          MaNhanVien: nv?.MaNhanVien || "",
          KhoaID: nv?.KhoaID,
          TenKhoa: nv?.KhoaID?.TenKhoa || "",
          assignments: totals.assignments || 0,
          totalMucDoKho: totals.totalMucDoKho || 0,
        };
      })
      .filter((emp) => emp.assignments > 0); // Chỉ hiển thị nhân viên có nhiệm vụ
  }, [allEmployees, targetEmployee, totalsByEmployeeId]);

  const filteredEmployees = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return eligibleEmployees;
    return eligibleEmployees.filter(
      (emp) =>
        emp.Ten.toLowerCase().includes(q) ||
        emp.MaNhanVien.toLowerCase().includes(q)
    );
  }, [eligibleEmployees, search]);

  const handleConfirm = () => {
    if (!selectedSource) return;
    onConfirm(selectedSource);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ContentCopy color="primary" />
          <Typography variant="h6">Sao chép nhiệm vụ</Typography>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Thông tin nhân viên đích */}
        <Alert severity="info" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Nhân viên đích:</strong> {targetEmployee?.Ten || "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>Khoa:</strong> {targetEmployee?.TenKhoa || "N/A"}
          </Typography>
        </Alert>

        {eligibleEmployees.length === 0 ? (
          <Alert severity="warning" icon={<Warning />}>
            Không có nhân viên nào cùng khoa có nhiệm vụ để sao chép
          </Alert>
        ) : (
          <>
            {/* Tìm kiếm */}
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm theo tên hoặc mã nhân viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Hướng dẫn */}
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
              Chọn nhân viên nguồn để sao chép nhiệm vụ sang{" "}
              <strong>{targetEmployee?.Ten}</strong>:
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* Danh sách nhân viên */}
            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {filteredEmployees.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={3}
                >
                  Không tìm thấy nhân viên phù hợp
                </Typography>
              ) : (
                <List dense>
                  {filteredEmployees.map((emp) => (
                    <ListItemButton
                      key={emp._id}
                      selected={selectedSource?._id === emp._id}
                      onClick={() => setSelectedSource(emp)}
                      sx={{
                        border: 1,
                        borderColor:
                          selectedSource?._id === emp._id
                            ? "primary.main"
                            : "divider",
                        borderRadius: 1,
                        mb: 1,
                        "&:hover": {
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight={500}>
                              {emp.Ten}
                            </Typography>
                            <Stack direction="row" spacing={0.5}>
                              <Chip
                                label={`${emp.assignments} NV`}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                              <Chip
                                label={`${emp.totalMucDoKho.toFixed(1)} điểm`}
                                size="small"
                                color="primary"
                                variant="outlined"
                              />
                            </Stack>
                          </Stack>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {emp.MaNhanVien} • {emp.TenKhoa}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              )}
            </Box>

            {selectedSource && (
              <Alert severity="success" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Sẽ sao chép{" "}
                  <strong>{selectedSource.assignments} nhiệm vụ</strong> (tổng{" "}
                  {selectedSource.totalMucDoKho.toFixed(1)} điểm) từ{" "}
                  <strong>{selectedSource.Ten}</strong> sang{" "}
                  <strong>{targetEmployee?.Ten}</strong>
                </Typography>
                <Typography
                  variant="caption"
                  color="warning.main"
                  sx={{ mt: 1 }}
                >
                  ⚠️ Lưu ý: Nhiệm vụ hiện tại của {targetEmployee?.Ten} sẽ bị
                  thay thế hoàn toàn
                </Typography>
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={!selectedSource}
          startIcon={<ContentCopy />}
        >
          Xác nhận sao chép
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CopyAssignmentsDialog;
