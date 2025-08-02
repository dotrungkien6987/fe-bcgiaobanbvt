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
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  insertOneNhomViecUser,
  updateOneNhomViecUser,
} from "./nhomViecUserSlice";
import { getAllKhoa } from "../../Daotao/Khoa/khoaSlice";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";

function ThongTinNhomViecUser({ open, handleClose, nhomViecUser }) {
  const dispatch = useDispatch();
  const { Khoa } = useSelector((state) => state.khoa || { Khoa: [] });
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    TenNhom: "",
    MoTa: "",
    KhoaID: "",
    TrangThaiHoatDong: true,
  });

  const [selectedKhoa, setSelectedKhoa] = useState(null);

  const isEdit = nhomViecUser?._id && nhomViecUser._id !== 0;

  // Load danh sách khoa
  useEffect(() => {
    dispatch(getAllKhoa());
  }, [dispatch]);

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          TenNhom: nhomViecUser.TenNhom || "",
          MoTa: nhomViecUser.MoTa || "",
          KhoaID: nhomViecUser.KhoaID?._id || nhomViecUser.KhoaID || "",
          TrangThaiHoatDong: nhomViecUser.TrangThaiHoatDong ?? true,
        });
        // Set khoa được chọn cho edit
        const khoaEdit = Khoa.find(
          (k) => k._id === (nhomViecUser.KhoaID?._id || nhomViecUser.KhoaID)
        );
        setSelectedKhoa(khoaEdit || null);
      } else {
        // Khoa mặc định là khoa của user hiện tại
        const userKhoaId = user?.KhoaID?._id || user?.KhoaID || "";
        const defaultKhoa = Khoa.find((k) => k._id === userKhoaId);

        setFormData({
          TenNhom: "",
          MoTa: "",
          KhoaID: userKhoaId,
          TrangThaiHoatDong: true,
        });
        setSelectedKhoa(defaultKhoa || null);
      }
    }
  }, [open, nhomViecUser, isEdit, user, Khoa]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!user || !user._id) {
      toast.error("Không thể xác định người dùng hiện tại");
      return;
    }

    if (!formData.TenNhom.trim()) {
      toast.error("Vui lòng nhập tên nhóm việc");
      return;
    }

    if (!formData.KhoaID) {
      toast.error("Vui lòng chọn khoa");
      return;
    }

    const submitData = {
      ...formData,
      NguoiTaoID: user._id,
    };

    if (isEdit) {
      dispatch(
        updateOneNhomViecUser({
          ...submitData,
          _id: nhomViecUser._id,
        })
      );
    } else {
      dispatch(insertOneNhomViecUser(submitData));
    }

    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Cập nhật nhóm việc" : "Thêm nhóm việc mới"}
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên nhóm việc"
              value={formData.TenNhom}
              onChange={(e) => handleInputChange("TenNhom", e.target.value)}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Autocomplete
              fullWidth
              options={Khoa || []}
              getOptionLabel={(option) => option.TenKhoa || ""}
              value={selectedKhoa}
              onChange={(event, newValue) => {
                setSelectedKhoa(newValue);
                setFormData({ ...formData, KhoaID: newValue?._id || "" });
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Khoa *"
                  required
                  helperText="Chọn khoa cho nhóm việc"
                />
              )}
              isOptionEqualToValue={(option, value) =>
                option._id === value?._id
              }
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Mô tả"
              value={formData.MoTa}
              onChange={(e) => handleInputChange("MoTa", e.target.value)}
            />
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
              label="Hoạt động"
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

export default ThongTinNhomViecUser;
