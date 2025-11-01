import React from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  MenuItem,
  Stack,
  Chip,
  Button,
  Paper,
  Tooltip,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import LockIcon from "@mui/icons-material/Lock";
import PersonIcon from "@mui/icons-material/Person";

/**
 * TieuChiConfigSection - Component cấu hình tiêu chí cho chu kỳ đánh giá
 *
 * Props:
 * - tieuChiList: Array of criteria objects
 * - onChange: (newList) => void
 * - onCopyFromPrevious: () => void (optional)
 * - readOnly: boolean (default: false)
 *
 * ✅ NEW: Automatically displays FIXED criterion (IsMucDoHoanThanh) as read-only
 */
function TieuChiConfigSection({
  tieuChiList = [],
  onChange,
  onCopyFromPrevious,
  readOnly = false,
}) {
  // ✅ Separate FIXED criterion from user-defined ones
  const fixedCriterion = tieuChiList.find((tc) => tc.IsMucDoHoanThanh === true);
  const userCriteria = tieuChiList.filter((tc) => tc.IsMucDoHoanThanh !== true);

  const handleAdd = () => {
    const newTieuChi = {
      TenTieuChi: "",
      LoaiTieuChi: "TANG_DIEM",
      GiaTriMin: 0,
      GiaTriMax: 100,
      DonVi: "%",
      ThuTu: tieuChiList.length,
      GhiChu: "",
      IsMucDoHoanThanh: false, // ✅ Explicitly set to false
    };
    onChange([...tieuChiList, newTieuChi]);
  };

  const handleUpdate = (index, field, value) => {
    // ✅ Find actual index in original list (accounting for FIXED criterion)
    const actualIndex = fixedCriterion ? index + 1 : index;
    const updated = [...tieuChiList];
    updated[actualIndex] = { ...updated[actualIndex], [field]: value };
    onChange(updated);
  };

  const handleDelete = (index) => {
    // ✅ Find actual index in original list
    const actualIndex = fixedCriterion ? index + 1 : index;
    const updated = tieuChiList.filter((_, i) => i !== actualIndex);
    // Re-index ThuTu
    updated.forEach((tc, i) => (tc.ThuTu = i));
    onChange(updated);
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h6" fontWeight={600}>
          ⚙️ Cấu hình tiêu chí đánh giá
        </Typography>
        {onCopyFromPrevious && !readOnly && (
          <Button
            size="small"
            startIcon={<ContentCopyIcon />}
            onClick={onCopyFromPrevious}
            variant="outlined"
          >
            Copy từ chu kỳ trước
          </Button>
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Tiêu chí này sẽ được áp dụng cho tất cả KPI trong chu kỳ. Mỗi chu kỳ có
        bộ tiêu chí riêng, đảm bảo tính độc lập và không ảnh hưởng chu kỳ khác.
      </Typography>

      {/* ✅ NEW: Display FIXED criterion (read-only) */}
      {fixedCriterion && (
        <Alert severity="info" icon={<PersonIcon />} sx={{ mb: 3 }}>
          <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
            <LockIcon
              fontSize="small"
              sx={{ verticalAlign: "middle", mr: 0.5 }}
            />
            Tiêu chí tự đánh giá (Hệ thống)
          </Typography>
          <Paper
            sx={{
              p: 2,
              mt: 1,
              bgcolor: "grey.50",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Stack spacing={1}>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Tên tiêu chí:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {fixedCriterion.TenTieuChi}
                </Typography>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Loại:
                </Typography>
                <Chip label="Tăng điểm" size="small" color="success" />
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Thang điểm:
                </Typography>
                <Typography variant="body2">
                  {fixedCriterion.GiaTriMin} - {fixedCriterion.GiaTriMax}
                  {fixedCriterion.DonVi}
                </Typography>
              </Box>
            </Stack>
          </Paper>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ mt: 1, display: "block" }}
          >
            💡 Tiêu chí này được tạo tự động và không thể chỉnh sửa. Nhân viên
            sẽ tự đánh giá tiêu chí này.
          </Typography>
        </Alert>
      )}

      {/* User-defined criteria header */}
      {fixedCriterion && (
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
          Tiêu chí do quản lý cấu hình:
        </Typography>
      )}

      <Stack spacing={2}>
        {userCriteria.map((tc, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              "&:hover": {
                borderColor: readOnly ? "divider" : "primary.main",
                boxShadow: readOnly ? "none" : 2,
              },
              transition: "all 0.2s",
            }}
          >
            <Box display="flex" gap={2} alignItems="flex-start">
              {/* Drag handle */}
              {!readOnly && (
                <Box sx={{ pt: 1 }}>
                  <DragIndicatorIcon color="action" fontSize="small" />
                </Box>
              )}

              {/* Index */}
              <Box sx={{ pt: 1 }}>
                <Chip
                  label={index + 1}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 700, minWidth: 32 }}
                />
              </Box>

              {/* Fields */}
              <Box flex={1}>
                <Stack spacing={2}>
                  {/* Row 1: Tên + Loại */}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      fullWidth
                      label="Tên tiêu chí"
                      value={tc.TenTieuChi}
                      onChange={(e) =>
                        handleUpdate(index, "TenTieuChi", e.target.value)
                      }
                      placeholder="VD: Hoàn thành đúng hạn"
                      size="small"
                      disabled={readOnly}
                      required
                    />
                    <TextField
                      select
                      label="Loại tiêu chí"
                      value={tc.LoaiTieuChi}
                      onChange={(e) =>
                        handleUpdate(index, "LoaiTieuChi", e.target.value)
                      }
                      size="small"
                      sx={{ minWidth: 180 }}
                      disabled={readOnly}
                      required
                    >
                      <MenuItem value="TANG_DIEM">
                        <Chip
                          label="Tăng điểm"
                          size="small"
                          color="success"
                          sx={{ mr: 1 }}
                        />
                      </MenuItem>
                      <MenuItem value="GIAM_DIEM">
                        <Chip
                          label="Giảm điểm"
                          size="small"
                          color="error"
                          sx={{ mr: 1 }}
                        />
                      </MenuItem>
                    </TextField>
                  </Stack>

                  {/* Row 2: Min/Max/Đơn vị */}
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <TextField
                      type="number"
                      label="Giá trị Min"
                      value={tc.GiaTriMin}
                      onChange={(e) =>
                        handleUpdate(index, "GiaTriMin", Number(e.target.value))
                      }
                      size="small"
                      disabled={readOnly}
                      inputProps={{ min: 0 }}
                    />
                    <TextField
                      type="number"
                      label="Giá trị Max"
                      value={tc.GiaTriMax}
                      onChange={(e) =>
                        handleUpdate(index, "GiaTriMax", Number(e.target.value))
                      }
                      size="small"
                      disabled={readOnly}
                      inputProps={{ min: 0 }}
                      required
                    />
                    <TextField
                      label="Đơn vị"
                      value={tc.DonVi}
                      onChange={(e) =>
                        handleUpdate(index, "DonVi", e.target.value)
                      }
                      size="small"
                      sx={{ maxWidth: 120 }}
                      disabled={readOnly}
                      placeholder="%"
                    />
                  </Stack>

                  {/* Row 3: Ghi chú */}
                  <TextField
                    label="Ghi chú"
                    value={tc.GhiChu}
                    onChange={(e) =>
                      handleUpdate(index, "GhiChu", e.target.value)
                    }
                    size="small"
                    multiline
                    rows={2}
                    disabled={readOnly}
                    placeholder="Ghi chú về tiêu chí này..."
                  />
                </Stack>
              </Box>

              {/* Delete button */}
              {!readOnly && (
                <Tooltip title="Xóa tiêu chí">
                  <IconButton
                    onClick={() => handleDelete(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          </Paper>
        ))}
      </Stack>

      {/* Add button */}
      {!readOnly && (
        <Box mt={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddCircleOutlineIcon />}
            onClick={handleAdd}
            sx={{
              borderStyle: "dashed",
              py: 1.5,
              "&:hover": {
                borderStyle: "solid",
                bgcolor: "primary.lighter",
              },
            }}
          >
            Thêm tiêu chí mới
          </Button>
        </Box>
      )}

      {/* Summary */}
      {tieuChiList.length > 0 && (
        <Box mt={3} p={2} bgcolor="background.neutral" borderRadius={2}>
          <Typography variant="body2" fontWeight={600} gutterBottom>
            📊 Tóm tắt:
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Chip
              label={`${tieuChiList.length} tiêu chí tổng`}
              size="small"
              color="primary"
              variant="outlined"
            />
            {fixedCriterion && (
              <Chip
                label="1 tiêu chí hệ thống"
                size="small"
                color="info"
                variant="outlined"
                icon={<LockIcon fontSize="small" />}
              />
            )}
            <Chip
              label={`${userCriteria.length} tiêu chí tự định nghĩa`}
              size="small"
              color="default"
              variant="outlined"
            />
            <Chip
              label={`${
                tieuChiList.filter((tc) => tc.LoaiTieuChi === "TANG_DIEM")
                  .length
              } tăng điểm`}
              size="small"
              color="success"
              variant="outlined"
            />
            <Chip
              label={`${
                tieuChiList.filter((tc) => tc.LoaiTieuChi === "GIAM_DIEM")
                  .length
              } giảm điểm`}
              size="small"
              color="error"
              variant="outlined"
            />
          </Stack>
        </Box>
      )}

      {userCriteria.length === 0 && !readOnly && (
        <Box
          mt={2}
          p={4}
          textAlign="center"
          border="2px dashed"
          borderColor="divider"
          borderRadius={2}
          bgcolor="background.neutral"
        >
          <Typography variant="body2" color="text.secondary">
            Chưa có tiêu chí nào. Nhấn "Thêm tiêu chí mới" để bắt đầu.
          </Typography>
        </Box>
      )}
    </Box>
  );
}

export default TieuChiConfigSection;
