import { Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, Grid, TextField, Chip, Autocomplete, Checkbox } from "@mui/material";
import { useFormik } from "formik";
import React, { useEffect, useState } from "react";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { insertOneNhomKhoa, updateOneNhomKhoa } from "../../Slice/nhomkhoasothutuSlice";
import { getAllKhoa } from "../Khoa/khoaSlice";
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

function NhomKhoaSoThuTuForm({ open, handleClose, nhomKhoa }) {
  const dispatch = useDispatch();
  const { Khoa } = useSelector((state) => state.khoa);
  const [selectedKhoas, setSelectedKhoas] = useState([]);
  
  useEffect(() => {
    dispatch(getAllKhoa());
  }, [dispatch]);

  // Khởi tạo danh sách khoa đã chọn từ nhomKhoa nếu có
  useEffect(() => {
    if (nhomKhoa?.DanhSachKhoa && Khoa.length > 0) {
      const selectedKhoaObjects = nhomKhoa.DanhSachKhoa
        .map(item => {
          const khoaId = item.KhoaID?._id || item.KhoaID;
          return Khoa.find(k => k._id === khoaId);
        })
        .filter(Boolean);
      setSelectedKhoas(selectedKhoaObjects);
    } else {
      setSelectedKhoas([]);
    }
  }, [nhomKhoa, Khoa]);

  const formik = useFormik({
    initialValues: {
      TenNhom: nhomKhoa?.TenNhom || "",
      GhiChu: nhomKhoa?.GhiChu || "",
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      TenNhom: Yup.string().required("Vui lòng nhập tên nhóm"),
    }),
    onSubmit: (values) => {
      // Xử lý trường hợp không chọn khoa nào
      if (selectedKhoas.length === 0) {
        formik.setErrors({ selectedKhoas: "Vui lòng chọn ít nhất một khoa" });
        return;
      }

      // Chuyển đổi mảng khoa thành mảng đối tượng { KhoaID }
      const danhSachKhoa = selectedKhoas.map(khoa => ({ KhoaID: khoa._id }));
      
      const nhomKhoaData = {
        TenNhom: values.TenNhom,
        GhiChu: values.GhiChu,
        DanhSachKhoa: danhSachKhoa
      };

      if (nhomKhoa && nhomKhoa._id) {
        nhomKhoaData._id = nhomKhoa._id;
        dispatch(updateOneNhomKhoa(nhomKhoaData));
      } else {
        dispatch(insertOneNhomKhoa(nhomKhoaData));
      }
      
      handleClose();
    },
  });

  // Reset form khi dialog đóng
  useEffect(() => {
    if (!open) {
      formik.resetForm();
      setSelectedKhoas([]);
    }
  }, [open]);

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        // Ngăn không cho đóng dialog khi click ra ngoài
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        handleClose();
      }} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>{nhomKhoa?._id ? "Cập nhật nhóm khoa" : "Thêm mới nhóm khoa"}</DialogTitle>
      <DialogContent>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="TenNhom"
                name="TenNhom"
                label="Tên nhóm"
                value={formik.values.TenNhom}
                onChange={formik.handleChange}
                error={formik.touched.TenNhom && Boolean(formik.errors.TenNhom)}
                helperText={formik.touched.TenNhom && formik.errors.TenNhom}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl 
                fullWidth
                error={Boolean(formik.errors.selectedKhoas)}
              >
                <Autocomplete
                  multiple
                  id="khoa-selector"
                  options={Khoa}
                  disableCloseOnSelect
                  value={selectedKhoas}
                  onChange={(event, newValue) => {
                    setSelectedKhoas(newValue);
                  }}
                  getOptionLabel={(option) => `${option.TenKhoa} (${option.MaKhoa})`}
                  renderOption={(props, option, { selected }) => (
                    <li {...props}>
                      <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                      />
                      {option.TenKhoa} ({option.MaKhoa})
                    </li>
                  )}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Danh sách khoa" 
                      placeholder="Tìm kiếm khoa..." 
                      error={Boolean(formik.errors.selectedKhoas)}
                      helperText={formik.errors.selectedKhoas}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        key={option._id}
                        label={option.TenKhoa}
                        {...getTagProps({ index })}
                      />
                    ))
                  }
                />
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="GhiChu"
                name="GhiChu"
                label="Ghi chú"
                multiline
                rows={3}
                value={formik.values.GhiChu}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Hủy
        </Button>
        <Button onClick={formik.handleSubmit} variant="contained" color="primary">
          {nhomKhoa?._id ? "Cập nhật" : "Thêm mới"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default NhomKhoaSoThuTuForm;