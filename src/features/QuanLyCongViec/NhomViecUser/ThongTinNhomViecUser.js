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
} from "@mui/material";
import { useDispatch } from "react-redux";
import {
  insertOneNhomViecUser,
  updateOneNhomViecUser,
} from "./nhomViecUserSlice";
import { toast } from "react-toastify";
import useAuth from "../../../hooks/useAuth";

function ThongTinNhomViecUser({ open, handleClose, nhomViecUser }) {
  const dispatch = useDispatch();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    TenNhom: "",
    MoTa: "",
    TrangThaiHoatDong: true,
  });

  const isEdit = nhomViecUser?._id && nhomViecUser._id !== 0;

  useEffect(() => {
    if (open) {
      if (isEdit) {
        setFormData({
          TenNhom: nhomViecUser.TenNhom || "",
          MoTa: nhomViecUser.MoTa || "",
          TrangThaiHoatDong: nhomViecUser.TrangThaiHoatDong ?? true,
        });
      } else {
        setFormData({
          TenNhom: "",
          MoTa: "",
          TrangThaiHoatDong: true,
        });
      }
    }
  }, [open, nhomViecUser, isEdit, user]);

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
