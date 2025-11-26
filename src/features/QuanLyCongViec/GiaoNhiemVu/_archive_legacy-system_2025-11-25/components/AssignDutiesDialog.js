import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Box,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  InputAdornment,
} from "@mui/material";
import { Search, TrendingUp, CheckCircle } from "@mui/icons-material";
import {
  fetchDutiesByEmployee,
  fetchAssignmentsByEmployee,
  batchUpdateAssignments,
} from "../giaoNhiemVuSlice";

const AssignDutiesDialog = ({ open, employee, onClose }) => {
  const dispatch = useDispatch();
  const { duties, assignments, isLoading } = useSelector((s) => s.giaoNhiemVu);

  const [selectedDutyIds, setSelectedDutyIds] = useState([]);
  const [search, setSearch] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmContent, setConfirmContent] = useState(null);

  useEffect(() => {
    if (open && employee?._id) {
      dispatch(fetchDutiesByEmployee(employee._id));
      dispatch(fetchAssignmentsByEmployee(employee._id));
    }
  }, [open, employee, dispatch]);

  useEffect(() => {
    if (assignments?.length > 0) {
      const currentIds = assignments
        .map((a) => {
          const id =
            typeof a.NhiemVuThuongQuyID === "string"
              ? a.NhiemVuThuongQuyID
              : a.NhiemVuThuongQuyID?._id;
          return id;
        })
        .filter(Boolean);
      setSelectedDutyIds(currentIds);
    } else {
      setSelectedDutyIds([]);
    }
  }, [assignments]);

  const currentAssignmentIds = useMemo(() => {
    return assignments
      .map((a) => {
        const id =
          typeof a.NhiemVuThuongQuyID === "string"
            ? a.NhiemVuThuongQuyID
            : a.NhiemVuThuongQuyID?._id;
        return id;
      })
      .filter(Boolean);
  }, [assignments]);

  const filteredDuties = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return duties;
    return duties.filter(
      (d) =>
        d.TenNhiemVu?.toLowerCase().includes(q) ||
        d.MoTa?.toLowerCase().includes(q)
    );
  }, [duties, search]);

  const diffStats = useMemo(() => {
    const toAdd = selectedDutyIds.filter(
      (id) => !currentAssignmentIds.includes(id)
    );
    const toRemove = currentAssignmentIds.filter(
      (id) => !selectedDutyIds.includes(id)
    );
    const unchanged = selectedDutyIds.filter((id) =>
      currentAssignmentIds.includes(id)
    );

    const addedDuties = duties.filter((d) => toAdd.includes(d._id));
    const removedDuties = duties.filter((d) => toRemove.includes(d._id));

    return {
      toAdd,
      toRemove,
      unchanged,
      addedDuties,
      removedDuties,
      hasChanges: toAdd.length > 0 || toRemove.length > 0,
    };
  }, [selectedDutyIds, currentAssignmentIds, duties]);

  const totalScore = useMemo(() => {
    return duties
      .filter((d) => selectedDutyIds.includes(d._id))
      .reduce((sum, d) => sum + (d.MucDoKho || 0), 0);
  }, [duties, selectedDutyIds]);

  const currentScore = useMemo(() => {
    return duties
      .filter((d) => currentAssignmentIds.includes(d._id))
      .reduce((sum, d) => sum + (d.MucDoKho || 0), 0);
  }, [duties, currentAssignmentIds]);

  const handleToggle = (dutyId) => {
    setSelectedDutyIds((prev) =>
      prev.includes(dutyId)
        ? prev.filter((id) => id !== dutyId)
        : [...prev, dutyId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDutyIds.length === duties.length) {
      setSelectedDutyIds([]);
    } else {
      setSelectedDutyIds(duties.map((d) => d._id));
    }
  };

  const handleSubmit = () => {
    if (!diffStats.hasChanges) {
      onClose();
      return;
    }

    // Build confirm dialog content
    const content = (
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2" gutterBottom>
          <strong>Nhân viên:</strong> {employee.Ten}
        </Typography>
        <Divider sx={{ my: 1.5 }} />

        {diffStats.toAdd.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              ➕ Thêm mới ({diffStats.toAdd.length}):
            </Typography>
            {diffStats.addedDuties.map((d) => (
              <Typography key={d._id} variant="body2" sx={{ ml: 2 }}>
                • {d.TenNhiemVu} (Mức độ: {d.MucDoKho})
              </Typography>
            ))}
          </Box>
        )}

        {diffStats.toRemove.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="error.main" gutterBottom>
              ➖ Gỡ bỏ ({diffStats.toRemove.length}):
            </Typography>
            {diffStats.removedDuties.map((d) => (
              <Typography key={d._id} variant="body2" sx={{ ml: 2 }}>
                • {d.TenNhiemVu} (Mức độ: {d.MucDoKho})
              </Typography>
            ))}
          </Box>
        )}

        {diffStats.unchanged.length > 0 && (
          <Box mb={2}>
            <Typography variant="subtitle2" color="info.main" gutterBottom>
              ✅ Giữ nguyên ({diffStats.unchanged.length})
            </Typography>
          </Box>
        )}

        <Divider sx={{ my: 1.5 }} />
        <Typography variant="body2" fontWeight={600}>
          Tổng điểm: {currentScore.toFixed(1)} → {totalScore.toFixed(1)} (
          {totalScore >= currentScore ? "+" : ""}
          {(totalScore - currentScore).toFixed(1)})
        </Typography>
      </Box>
    );

    setConfirmContent(content);
    setConfirmOpen(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      await dispatch(
        batchUpdateAssignments({
          employeeId: employee._id,
          dutyIds: selectedDutyIds,
        })
      );
      setConfirmOpen(false);
      onClose();
    } catch (error) {
      console.error("Update failed:", error);
      setConfirmOpen(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">
            Gán nhiệm vụ cho: {employee?.Ten}
          </Typography>
          <Chip
            label={employee?.TenKhoa || "N/A"}
            color="primary"
            size="small"
            variant="outlined"
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        {isLoading ? (
          <Box display="flex" justifyContent="center" py={4}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Box mb={2}>
              <TextField
                fullWidth
                size="small"
                placeholder="Tìm nhiệm vụ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <Stack direction="row" justifyContent="space-between" mb={2}>
              <Button size="small" onClick={handleSelectAll}>
                {selectedDutyIds.length === duties.length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
              <Box display="flex" gap={2}>
                <Chip
                  icon={<CheckCircle />}
                  label={`Đã chọn: ${selectedDutyIds.length}`}
                  size="small"
                  color="success"
                />
                <Chip
                  icon={<TrendingUp />}
                  label={`Điểm: ${totalScore.toFixed(1)}`}
                  size="small"
                  color="primary"
                />
              </Box>
            </Stack>

            {diffStats.hasChanges && (
              <Alert severity="info" sx={{ mb: 2 }}>
                Thay đổi: +{diffStats.toAdd.length} | -
                {diffStats.toRemove.length} | ={diffStats.unchanged.length}
              </Alert>
            )}

            <List sx={{ maxHeight: 400, overflow: "auto" }}>
              {filteredDuties.map((duty) => {
                const isSelected = selectedDutyIds.includes(duty._id);
                const wasAssigned = currentAssignmentIds.includes(duty._id);
                const isAdded = isSelected && !wasAssigned;
                const isRemoved = !isSelected && wasAssigned;

                return (
                  <ListItem
                    key={duty._id}
                    button
                    onClick={() => handleToggle(duty._id)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      bgcolor: isAdded
                        ? "success.lighter"
                        : isRemoved
                        ? "error.lighter"
                        : "transparent",
                    }}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={isSelected}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          flexWrap="wrap"
                        >
                          <Typography variant="body2">
                            {duty.TenNhiemVu}
                          </Typography>
                          <Chip
                            label={`Mức độ: ${duty.MucDoKho || 0}`}
                            size="small"
                            color={isSelected ? "primary" : "default"}
                          />
                          {wasAssigned && (
                            <Chip
                              label="Đã gán"
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                      }
                      secondary={duty.MoTa}
                    />
                  </ListItem>
                );
              })}
            </List>

            {filteredDuties.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                align="center"
                py={4}
              >
                Không tìm thấy nhiệm vụ nào
              </Typography>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={isLoading || !diffStats.hasChanges}
        >
          {diffStats.hasChanges ? "Cập nhật" : "Không có thay đổi"}
        </Button>
      </DialogActions>

      {/* Confirm Dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        maxWidth="sm"
      >
        <DialogTitle>⚠️ Xác nhận thay đổi gán nhiệm vụ</DialogTitle>
        <DialogContent>{confirmContent}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Hủy</Button>
          <Button
            onClick={handleConfirmSubmit}
            variant="contained"
            color="primary"
          >
            Xác nhận
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default AssignDutiesDialog;
