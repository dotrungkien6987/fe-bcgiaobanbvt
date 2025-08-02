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
  Autocomplete,
  Slider,
  Typography,
  Box,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import useAuth from "hooks/useAuth";
import {
  insertOneNhiemVuThuongQuy,
  updateOneNhiemVuThuongQuy,
} from "./nhiemvuThuongQuySlice";
import { getAllKhoa } from "../../Daotao/Khoa/khoaSlice";
import { getNhomViecUserByKhoaId } from "../NhomViecUser/nhomViecUserSlice";

function ThongTinNhiemVuThuongQuy({ open, handleClose, nhiemvuThuongQuy }) {
  const dispatch = useDispatch();
  const { user } = useAuth();

  // Reference data selectors
  const { Khoa: khoas } = useSelector((state) => state.khoa || { Khoa: [] });
  const { nhomViecUsers } = useSelector(
    (state) => state.nhomViecUser || { nhomViecUsers: [] }
  );

  const [formData, setFormData] = useState({
    TenNhiemVu: "",
    MoTa: "",
    KhoaID: "",
    NhomViecUserID: "",
    MucDoKho: 5.0,
    TrangThaiHoatDong: true,
  });

  // Autocomplete states for references
  const [selectedKhoa, setSelectedKhoa] = useState(null);
  const [selectedNhomViecUser, setSelectedNhomViecUser] = useState(null);

  const isEdit = nhiemvuThuongQuy?._id && nhiemvuThuongQuy._id !== 0;

  useEffect(() => {
    dispatch(getAllKhoa());
  }, [dispatch]);

  useEffect(() => {
    if (open && khoas.length > 0) {
      if (isEdit && nhiemvuThuongQuy?._id) {
        setFormData({
          TenNhiemVu: nhiemvuThuongQuy.TenNhiemVu || "",
          MoTa: nhiemvuThuongQuy.MoTa || "",
          KhoaID: nhiemvuThuongQuy.KhoaID?._id || nhiemvuThuongQuy.KhoaID || "",
          NhomViecUserID:
            nhiemvuThuongQuy.NhomViecUserID?._id ||
            nhiemvuThuongQuy.NhomViecUserID ||
            "",
          MucDoKho: nhiemvuThuongQuy.MucDoKho || 5.0,
          TrangThaiHoatDong: nhiemvuThuongQuy.TrangThaiHoatDong ?? true,
        });
        // Set selected khoa for edit
        const khoa = khoas.find(
          (k) =>
            k._id === (nhiemvuThuongQuy.KhoaID?._id || nhiemvuThuongQuy.KhoaID)
        );
        setSelectedKhoa(khoa || null);

        // Load nhomviecuser for this khoa if editing
        if (khoa?._id) {
          dispatch(getNhomViecUserByKhoaId(khoa._id));
        }
      } else {
        // Create mode with defaults
        setFormData({
          TenNhiemVu: "",
          MoTa: "",
          KhoaID: user?.KhoaID || "",
          NhomViecUserID: "",
          MucDoKho: 5.0,
          TrangThaiHoatDong: true,
        });
        // Set default selected khoa
        const defaultKhoa = khoas.find((k) => k._id === user?.KhoaID);
        setSelectedKhoa(defaultKhoa || null);
        setSelectedNhomViecUser(null);

        // Load nhomviecuser for default khoa
        if (defaultKhoa?._id) {
          dispatch(getNhomViecUserByKhoaId(defaultKhoa._id));
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, nhiemvuThuongQuy, isEdit, user?.KhoaID, khoas, dispatch]);

  // Separate useEffect for setting NhomViecUser when data is loaded
  useEffect(() => {
    if (isEdit && nhomViecUsers.length > 0 && nhiemvuThuongQuy?.NhomViecUserID) {
      const nhomViecUser = nhomViecUsers.find(
        (n) =>
          n._id ===
          (nhiemvuThuongQuy.NhomViecUserID?._id ||
            nhiemvuThuongQuy.NhomViecUserID)
      );
      setSelectedNhomViecUser(nhomViecUser || null);
    }
  }, [nhomViecUsers, nhiemvuThuongQuy?.NhomViecUserID, isEdit]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleKhoaChange = (event, newValue) => {
    setSelectedKhoa(newValue);
    handleInputChange("KhoaID", newValue?._id || "");

    // Reset nhomviecuser when khoa changes
    setSelectedNhomViecUser(null);
    handleInputChange("NhomViecUserID", "");

    // Load nhomviecuser for new khoa
    if (newValue?._id) {
      dispatch(getNhomViecUserByKhoaId(newValue._id));
    }
  };

  const handleNhomViecUserChange = (event, newValue) => {
    setSelectedNhomViecUser(newValue);
    handleInputChange("NhomViecUserID", newValue?._id || "");
  };

  const handleSubmit = () => {
    const submitData = {
      ...formData,
      NguoiTaoID: user._id, // Auto-set creator
    };

    if (isEdit) {
      dispatch(
        updateOneNhiemVuThuongQuy({ ...submitData, _id: nhiemvuThuongQuy._id })
      );
    } else {
      dispatch(insertOneNhiemVuThuongQuy(submitData));
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
        {isEdit
          ? "Cập nhật nhiệm vụ thường quy"
          : "Thêm nhiệm vụ thường quy mới"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên nhiệm vụ *"
              value={formData.TenNhiemVu}
              onChange={(e) => handleInputChange("TenNhiemVu", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={khoas}
              getOptionLabel={(option) => option.TenKhoa || ""}
              value={selectedKhoa}
              onChange={handleKhoaChange}
              isOptionEqualToValue={(option, value) =>
                option._id === value?._id
              }
              renderInput={(params) => (
                <TextField {...params} label="Khoa *" required />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={nhomViecUsers}
              getOptionLabel={(option) => option.TenNhom || ""}
              value={selectedNhomViecUser}
              onChange={handleNhomViecUserChange}
              isOptionEqualToValue={(option, value) =>
                option._id === value?._id
              }
              disabled={!formData.KhoaID}
              renderInput={(params) => (
                <TextField {...params} label="Nhóm việc" />
              )}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              value={formData.MoTa}
              onChange={(e) => handleInputChange("MoTa", e.target.value)}
              multiline
              rows={4}
            />
          </Grid>

          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Box sx={{ px: 2 }}>
                  <Typography gutterBottom>
                    Mức độ khó: {formData.MucDoKho}/10
                  </Typography>
                  <Slider
                    value={formData.MucDoKho}
                    onChange={(e, value) =>
                      handleInputChange("MucDoKho", value)
                    }
                    aria-labelledby="muc-do-kho-slider"
                    valueLabelDisplay="auto"
                    step={0.1}
                    min={1.0}
                    max={10.0}
                  />
                </Box>
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  label="Mức độ khó"
                  type="number"
                  value={formData.MucDoKho}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 1.0 && value <= 10.0) {
                      handleInputChange(
                        "MucDoKho",
                        Math.round(value * 10) / 10
                      );
                    }
                  }}
                  inputProps={{
                    min: 1.0,
                    max: 10.0,
                    step: 0.1,
                  }}
                />
              </Grid>
            </Grid>
          </Grid>

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
        <Button onClick={handleSubmit} variant="contained">
          {isEdit ? "Cập nhật" : "Thêm mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ThongTinNhiemVuThuongQuy;
