import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Grid,
  MenuItem,
  Alert,
} from "@mui/material";
import { useDispatch } from "react-redux";
import { createTieuChiDanhGia, updateTieuChiDanhGia } from "../KPI/kpiSlice";

function ThongTinTieuChiDanhGia({ open, handleClose, tieuChi }) {
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    TenTieuChi: "",
    MoTa: "",
    LoaiTieuChi: "TANG_DIEM",
    GiaTriMin: 0,
    GiaTriMax: 10,
    TrangThaiHoatDong: true,
  });

  const [errors, setErrors] = useState({});

  const isEdit = tieuChi?._id && tieuChi._id !== 0;

  useEffect(() => {
    if (open) {
      if (isEdit && tieuChi?._id) {
        setFormData({
          TenTieuChi: tieuChi.TenTieuChi || "",
          MoTa: tieuChi.MoTa || "",
          LoaiTieuChi: tieuChi.LoaiTieuChi || "TANG_DIEM",
          GiaTriMin: tieuChi.GiaTriMin || 0,
          GiaTriMax: tieuChi.GiaTriMax || 10,
          TrangThaiHoatDong: tieuChi.TrangThaiHoatDong ?? true,
        });
      } else {
        // Create mode with defaults
        setFormData({
          TenTieuChi: "",
          MoTa: "",
          LoaiTieuChi: "TANG_DIEM",
          GiaTriMin: 0,
          GiaTriMax: 10,
          TrangThaiHoatDong: true,
        });
      }
      setErrors({});
    }
  }, [open, tieuChi, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.TenTieuChi.trim()) {
      newErrors.TenTieuChi = "Tên tiêu chí là bắt buộc";
    }

    if (formData.GiaTriMin >= formData.GiaTriMax) {
      newErrors.GiaTriMax = "Giá trị Max phải lớn hơn Giá trị Min";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const submitData = {
      TenTieuChi: formData.TenTieuChi.trim(),
      MoTa: formData.MoTa.trim(),
      LoaiTieuChi: formData.LoaiTieuChi,
      GiaTriMin: parseFloat(formData.GiaTriMin),
      GiaTriMax: parseFloat(formData.GiaTriMax),
      TrangThaiHoatDong: formData.TrangThaiHoatDong,
    };

    if (isEdit) {
      dispatch(updateTieuChiDanhGia(tieuChi._id, submitData));
    } else {
      dispatch(createTieuChiDanhGia(submitData));
    }

    handleClose();
  };

  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        {isEdit ? "Cập nhật tiêu chí đánh giá" : "Thêm tiêu chí đánh giá mới"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* Tên tiêu chí */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên tiêu chí *"
              value={formData.TenTieuChi}
              onChange={(e) => handleInputChange("TenTieuChi", e.target.value)}
              required
              error={!!errors.TenTieuChi}
              helperText={errors.TenTieuChi}
            />
          </Grid>

          {/* Loại tiêu chí */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              select
              label="Loại tiêu chí *"
              value={formData.LoaiTieuChi}
              onChange={(e) => handleInputChange("LoaiTieuChi", e.target.value)}
              required
            >
              <MenuItem value="TANG_DIEM">Tăng điểm</MenuItem>
              <MenuItem value="GIAM_DIEM">Giảm điểm</MenuItem>
            </TextField>
          </Grid>

          {/* Đơn vị (placeholder cho grid layout) */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Đơn vị"
              value="%"
              disabled
              helperText="Đơn vị tính mặc định là phần trăm (%)"
            />
          </Grid>

          {/* Giá trị Min */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Giá trị Min *"
              type="number"
              value={formData.GiaTriMin}
              onChange={(e) =>
                handleInputChange("GiaTriMin", parseFloat(e.target.value))
              }
              inputProps={{
                min: 0,
                max: 100,
                step: 0.5,
              }}
            />
          </Grid>

          {/* Giá trị Max */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Giá trị Max *"
              type="number"
              value={formData.GiaTriMax}
              onChange={(e) =>
                handleInputChange("GiaTriMax", parseFloat(e.target.value))
              }
              inputProps={{
                min: 0,
                max: 100,
                step: 0.5,
              }}
              error={!!errors.GiaTriMax}
              helperText={errors.GiaTriMax}
            />
          </Grid>

          {/* Khoảng giá trị hiển thị */}
          <Grid item xs={12}>
            <Alert severity="info">
              Khoảng giá trị cho phép:{" "}
              <strong>
                {formData.GiaTriMin} - {formData.GiaTriMax}
              </strong>
            </Alert>
          </Grid>

          {/* Mô tả */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.MoTa}
              onChange={(e) => handleInputChange("MoTa", e.target.value)}
              multiline
              rows={4}
              placeholder="Mô tả chi tiết về tiêu chí đánh giá này..."
            />
          </Grid>

          {/* Trạng thái hoạt động */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.TrangThaiHoatDong}
                  onChange={(e) =>
                    handleInputChange("TrangThaiHoatDong", e.target.checked)
                  }
                />
              }
              label="Trạng thái hoạt động"
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Hủy</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isEdit ? "Cập nhật" : "Thêm mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ThongTinTieuChiDanhGia;
