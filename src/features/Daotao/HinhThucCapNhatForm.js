import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import {

  Autocomplete,
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  
} from "@mui/material";
import { FTextField, FormProvider } from "components/form";
import FAutocomplete from "components/form/FAutocomplete";

import {
  insertOneHinhThucCapNhat,
  updateOneHinhThucCapNhat,
} from "features/NhanVien/hinhthuccapnhatSlice";
import { getDataFix } from "features/NhanVien/nhanvienSlice";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import * as Yup from "yup";

const yupSchema = Yup.object().shape({
  MaNhomHinhThucCapNhat: Yup.object({
    Ma: Yup.string().required("Bắt buộc chọn mã nhóm"),
  }).required("Bắt buộc chọn mã nhóm"),
  // TenNhomHinhThucCapNhat: Yup.object({
  //   Ten: Yup.string().required("Bắt buộc chọn tên nhóm"),
  // }).required("Bắt buộc chọn tên nhóm"),
  Ma: Yup.string().required("Bắt buộc nhập Mã hình thức cập nhật"),
  Ten: Yup.string().required("Bắt buộc nhập Tên hình thức cập nhật"),
  TenBenhVien: Yup.string().required("Bắt buộc nhập Tên hình thức cập nhật"),
});

function HinhThucCapNhatForm({ hinhthuccapnhat, open, handleClose }) {
  const dispatch = useDispatch();
  const { NhomHinhThucCapNhat,VaiTro,DonVi } = useSelector((state) => state.nhanvien);
  useEffect(() => {
    if (NhomHinhThucCapNhat && NhomHinhThucCapNhat.length > 0) return;
    dispatch(getDataFix());
  }, [dispatch]);

  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      MaNhomHinhThucCapNhat: null,
      TenNhomHinhThucCapNhat: null,
      Ma: "",
      Ten: "",
      TenBenhVien:"",
      Loai: null,
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    console.log("hinhthuccapnhat", hinhthuccapnhat);
    // Kiểm tra xem `hinhthuccapnhat` có tồn tại và form đang ở chế độ cập nhật không
    if (hinhthuccapnhat && hinhthuccapnhat._id && hinhthuccapnhat._id !== 0) {
      // Cập nhật giá trị mặc định cho form bằng thông tin của `hinhthuccapnhat`
      const nhomhinhthuc = NhomHinhThucCapNhat.find(
        (item) => item.Ma === hinhthuccapnhat.MaNhomHinhThucCapNhat
      );
      reset({
        ...hinhthuccapnhat,
        MaNhomHinhThucCapNhat: nhomhinhthuc,
        Loai: { Loai: hinhthuccapnhat.Loai },
      });
    } else {
      // Nếu không có `hinhthuccapnhat` được truyền vào, reset form với giá trị mặc định
      reset({
        MaNhomHinhThucCapNhat: null,
        TenNhomHinhThucCapNhat: null,
        Loai: null,
        Ma: "",
        Ten: "",
        TenBenhVien: "",
      });
    }
  }, [hinhthuccapnhat]);

  const onSubmitData = (data) => {
    console.log("data form", data);
    const hinhthuccapnhatUpdate = {
      ...data,
      MaNhomHinhThucCapNhat: data.MaNhomHinhThucCapNhat.Ma,
      Loai: data.Loai.Loai,
      VaiTroQuyDoi: vaiTroQuyDoi,
    };
    console.log("hinhthuccapnhat dispatch", hinhthuccapnhatUpdate);
    if (hinhthuccapnhat && hinhthuccapnhat._id)
      dispatch(updateOneHinhThucCapNhat(hinhthuccapnhatUpdate));
    else dispatch(insertOneHinhThucCapNhat(hinhthuccapnhatUpdate));
    handleClose();
  };

  const [vaiTroQuyDoi, setVaiTroQuyDoi] = useState(hinhthuccapnhat.VaiTroQuyDoi||[]); // Danh sách vai trò quy đổi
  const [editIndex, setEditIndex] = useState(-1); // Index của item đang được chỉnh sửa
  const [vaiTro, setVaiTro] = useState('');
  const [donVi, setDonVi] = useState('');
  const [quyDoi, setQuyDoi] = useState('');

  useEffect(() => {
    if (hinhthuccapnhat && hinhthuccapnhat.VaiTroQuyDoi) {
      setVaiTroQuyDoi(hinhthuccapnhat.VaiTroQuyDoi);
    }
  }, [hinhthuccapnhat]);

  const handleAdd = () => {
    const newItem = { VaiTro: vaiTro, DonVi: donVi, QuyDoi: parseFloat(quyDoi) };
    if (editIndex >= 0) {
      // Chỉnh sửa item
      const updatedItems = [...vaiTroQuyDoi];
      updatedItems[editIndex] = newItem;
      setVaiTroQuyDoi(updatedItems);
      setEditIndex(-1); // Reset chỉ số chỉnh sửa
    } else {
      // Thêm mới item
      setVaiTroQuyDoi([...vaiTroQuyDoi, newItem]);
    }
    // Reset form
    setVaiTro('');
    setDonVi('');
    setQuyDoi('');
  };


 const handleEdit = (index) => {
    setEditIndex(index);
    setVaiTro(vaiTroQuyDoi[index].VaiTro);
    setDonVi(vaiTroQuyDoi[index].DonVi);
    setQuyDoi(vaiTroQuyDoi[index].QuyDoi.toString());
  };

  const handleDelete = (index) => {
    const updatedItems = [...vaiTroQuyDoi];
    updatedItems.splice(index, 1);
    setVaiTroQuyDoi(updatedItems);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      // sx={{
      //   "& .MuiDialog-paper": {
      //     width: "1000px", // Or any other width you want
      //     height: "800px", // Or any other height you want
      //   },
      // }}
      PaperProps={{
        sx: {
          width: "100%", // Sử dụng toàn bộ chiều rộng trên màn hình nhỏ
          maxWidth: "1000px", // Đảm bảo chiều rộng không vượt quá 1000px trên màn hình lớn
          maxHeight: "90vh", // Chiều cao tối đa là 90% chiều cao viewport, giúp không bị tràn màn hình
          overflowY: "auto", // Cho phép cuộn nếu nội dung vượt quá chiều cao
        },
      }}
    >
      <DialogTitle id="form-dialog-title">
        Thông tin hình thức cập nhật kiến thức y khoa liên tục
      </DialogTitle>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={1}>
              <FAutocomplete
                name="Loai"
                options={[{ Loai: "Đào tạo" }, { Loai: "Nghiên cứu khoa học" }]}
                displayField="Loai"
                label="Loại hình thức cập nhật"
              />
              <FAutocomplete
                name="MaNhomHinhThucCapNhat"
                options={NhomHinhThucCapNhat}
                displayField="Ma"
                label="Chọn mã nhóm"
              />

              <FAutocomplete
                name="MaNhomHinhThucCapNhat"
                options={NhomHinhThucCapNhat}
                displayField="Ten"
                label="Chọn tên nhóm"
              />

              <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12}>
                  <FTextField name="Ma" label="Mã hình thức cập nhật" />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <FTextField name="Ten" label="Tên hình thức cập nhật" />
                </Grid>
                <Grid item xs={12} sm={12} md={12}>
                  <FTextField name="TenBenhVien" label="Tên ngắn gọn theo bệnh viện" />
                </Grid>
              </Grid>
            </Stack>
            <Box sx={{ flexGrow: 1 }} />
            <div>
      {/* Autocomplete cho Vai Tro */}
      <Autocomplete
        options={VaiTro.map(item=>item.VaiTro)} // vaiTroOptions là mảng các lựa chọn cho Vai Tro
        value={vaiTro}
        onChange={(event, newValue) => {
          setVaiTro(newValue);
        }}
        renderInput={(params) => <TextField {...params} label="Vai Trò" />}
      />
      {/* Autocomplete cho Don Vi */}
      <Autocomplete
        options={DonVi.map(item=>item.DonVi)} // donViOptions là mảng các lựa chọn cho Don Vi
        value={donVi}
        onChange={(event, newValue) => {
          setDonVi(newValue);
        }}
        renderInput={(params) => <TextField {...params} label="Đơn Vị" />}
      />
      {/* TextField cho Quy Doi */}
      <TextField
        label="Quy Đổi"
        type="number"
        value={quyDoi}
        onChange={(e) => setQuyDoi(e.target.value)}
      />
      <Button onClick={handleAdd}>{editIndex >= 0 ? 'Cập Nhật' : 'Thêm'}</Button>
      {/* Bảng hiển thị dữ liệu */}
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Vai Trò</TableCell>
            <TableCell>Đơn Vị</TableCell>
            <TableCell>Quy Đổi</TableCell>
            <TableCell>Hành Động</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vaiTroQuyDoi.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{item.VaiTro}</TableCell>
              <TableCell>{item.DonVi}</TableCell>
              <TableCell>{item.QuyDoi}</TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(index)}>Sửa</Button>
                <Button onClick={() => handleDelete(index)}>Xóa</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
            <Card>
              <DialogActions>
                <LoadingButton
                  type="submit"
                  variant="contained"
                  size="small"
                  loading={isSubmitting}
                >
                  Lưu
                </LoadingButton>
                <Button variant="contained" onClick={handleClose} color="error"  disabled={isSubmitting}>
                  Hủy
                </Button>
              </DialogActions>
            </Card>
          </FormProvider>
        </Card>
      </DialogContent>
    </Dialog>
  );
}

export default HinhThucCapNhatForm;
