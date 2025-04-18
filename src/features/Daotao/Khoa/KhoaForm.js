import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import { useFormik } from "formik";
import React from "react";
import * as Yup from "yup";
import { useDispatch } from "react-redux";
import { insertOneKhoa, updateOneKhoa } from "./khoaSlice";

function KhoaForm({ open, handleClose, khoa }) {
  const dispatch = useDispatch();

  const formik = useFormik({
    initialValues: {
      TenKhoa: khoa?.TenKhoa || "",
      STT: khoa?.STT || 0,
      LoaiKhoa: khoa?.LoaiKhoa || "kcc",
      MaKhoa: khoa?.MaKhoa || "",
    },
    validationSchema: Yup.object({
      TenKhoa: Yup.string().required("Vui lòng nhập tên khoa"),
      STT: Yup.number().required("Vui lòng nhập số thứ tự"),
      MaKhoa: Yup.string().required("Vui lòng nhập mã khoa"),
      LoaiKhoa: Yup.string().required("Vui lòng chọn loại khoa"),
    }),
    onSubmit: (values) => {
      const khoaData = {
        ...values,
      };

      if (khoa && khoa._id !== 0) {
        khoaData._id = khoa._id;
        dispatch(updateOneKhoa(khoaData));
      } else {
        dispatch(insertOneKhoa(khoaData));
      }
      
      handleClose();
    },
  });

  const loaiKhoaOptions = [
    { value: "kcc", label: "Khám chữa bệnh" },
    { value: "kkb", label: "Khoa khám bệnh" },
    { value: "noi", label: "Nội" },
    { value: "ngoai", label: "Ngoại" },
    { value: "cskh", label: "Chăm sóc khách hàng" },
    { value: "gmhs", label: "Gây mê hồi sức" },
    { value: "cdha", label: "Chẩn đoán hình ảnh" },
    { value: "tdcn", label: "Thăm dò chức năng" },
    { value: "clc", label: "Chất lượng cao" },
    { value: "xn", label: "Xét nghiệm" },
    { value: "hhtm", label: "Huyết học truyền máu" },
  ];

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{khoa?._id === 0 ? "Thêm mới khoa" : "Cập nhật thông tin khoa"}</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="TenKhoa"
                name="TenKhoa"
                label="Tên khoa"
                value={formik.values.TenKhoa}
                onChange={formik.handleChange}
                error={formik.touched.TenKhoa && Boolean(formik.errors.TenKhoa)}
                helperText={formik.touched.TenKhoa && formik.errors.TenKhoa}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="MaKhoa"
                name="MaKhoa"
                label="Mã khoa"
                value={formik.values.MaKhoa}
                onChange={formik.handleChange}
                error={formik.touched.MaKhoa && Boolean(formik.errors.MaKhoa)}
                helperText={formik.touched.MaKhoa && formik.errors.MaKhoa}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="STT"
                name="STT"
                label="Số thứ tự"
                type="number"
                value={formik.values.STT}
                onChange={formik.handleChange}
                error={formik.touched.STT && Boolean(formik.errors.STT)}
                helperText={formik.touched.STT && formik.errors.STT}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={formik.touched.LoaiKhoa && Boolean(formik.errors.LoaiKhoa)}>
                <InputLabel id="loai-khoa-label">Loại khoa</InputLabel>
                <Select
                  labelId="loai-khoa-label"
                  id="LoaiKhoa"
                  name="LoaiKhoa"
                  value={formik.values.LoaiKhoa}
                  label="Loại khoa"
                  onChange={formik.handleChange}
                >
                  {loaiKhoaOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
                {formik.touched.LoaiKhoa && formik.errors.LoaiKhoa && (
                  <FormHelperText>{formik.errors.LoaiKhoa}</FormHelperText>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Hủy
        </Button>
        <Button onClick={formik.handleSubmit} variant="contained" color="primary">
          {khoa?._id === 0 ? "Thêm mới" : "Cập nhật"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default KhoaForm;