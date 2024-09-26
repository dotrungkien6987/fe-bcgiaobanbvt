import { yupResolver } from "@hookform/resolvers/yup";

import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Card,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
} from "@mui/material";
import { FTextField, FormProvider } from "components/form";

import {
  insertOneHoiDong,
  updateOneHoiDong,
} from "features/NhanVien/hinhthuccapnhatSlice";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import * as Yup from "yup";
import ThanhVienHoiDongTable from "./ThanhVienHoiDongTable";
import { setHocVienCurrents } from "../daotaoSlice";

const yupSchema = Yup.object().shape({
  Ten: Yup.string().required("Bắt buộc nhập Tên hội đồng"),
});

function HoiDongForm({ hoidong, open, handleClose }) {
  const dispatch = useDispatch();

  const { hocvienCurrents } = useSelector((state) => state.daotao);
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      Ten: "",
    },
  });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    //set ThanhVien VaiTro trong hoidong
    // Kiểm tra xem `hoidong` có tồn tại và form đang ở chế độ cập nhật không
    let thanhvien = [];
    if (hoidong && hoidong._id && hoidong._id !== 0) {
      console.log("hoidong", hoidong);
      thanhvien = hoidong.ThanhVien.map((hv) => ({
        ...hv.NhanVienID,
       
        TenKhoa: hv.NhanVienID.KhoaID.TenKhoa,
        Sex: hv.NhanVienID.GioiTinh === 0 ? "Nam" : "Nữ",
        ...hv,
        NhanVienID: hv.NhanVienID._id,
      }));
      dispatch(setHocVienCurrents(thanhvien));
      reset({
        ...hoidong,
      });
    } else {
      // Nếu không có `hoidong` được truyền vào, reset form với giá trị mặc định
      dispatch(setHocVienCurrents(thanhvien));
      reset({
        Ten: "",
      });
    }
  }, [hoidong,open]);

  const onSubmitData = (data) => {
    console.log("data form", data);
    const thanhvienHoiDong = hocvienCurrents.map((hv) => ({
      NhanVienID: hv.NhanVienID,
      VaiTro: hv.VaiTro,
    }));
    const hoidongUpdate = {
      ...data,
      ThanhVien: thanhvienHoiDong,
    };
    console.log("hoidong dispatch", hoidongUpdate);
    if (hoidong && hoidong._id) dispatch(updateOneHoiDong(hoidongUpdate));
    else dispatch(insertOneHoiDong(hoidongUpdate));
    handleClose();
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
      <DialogTitle id="form-dialog-title">Thông tin hội đồng</DialogTitle>
      <DialogContent>
        <Card sx={{ p: 3 }}>
          <FormProvider methods={methods} onSubmit={handleSubmit(onSubmitData)}>
            <Stack spacing={1}>
              <FTextField name="Ten" label="Tên hội đồng" />
            </Stack>

            <Stack>
              <ThanhVienHoiDongTable />
            </Stack>

            <Box sx={{ flexGrow: 1 }} />

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
                <Button
                  variant="contained"
                  onClick={handleClose}
                  color="error"
                  disabled={isSubmitting}
                >
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

export default HoiDongForm;
