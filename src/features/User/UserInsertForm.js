import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import {
  
  FTextField,
  
  FormProvider,
} from "../../components/form";

import {
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Autocomplete,
  Typography,
  useMediaQuery,
  Table,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

import { getKhoas } from "../BaoCaoNgay/baocaongaySlice";
import { CreateUser,  updateUserProfile } from "./userSlice";
import ChonKhoaForm from "./ChonKhoaForm";
import { useTheme } from "@emotion/react";
import FAutocomplete from "components/form/FAutocomplete";
import SelectNhanVienForUserForm from "./UserThemeAble/SelectNhanVienForUserForm";
import NhanVienViewDT06 from "features/NhanVien/NhanVienViewDT06";

const yupSchema = Yup.object().shape({
  UserName: Yup.string().required("Bắt buộc nhập UserName"),
  KhoaID: Yup.object({
    TenKhoa: Yup.string().required("Bắt buộc chọn khoa"),
  }).required("Bắt buộc chọn khoa"),
});

function UserInsertForm({ open, handleClose, handleSave,  handleChange }) {
  // const [selectedDepartment, setSelectedDepartment] = useState(null);
  const { khoas } = useSelector((state) => state.baocaongay);
  const { KhoaTaiChinhCurent,userCurrent,NhanVienUserCurrent } = useSelector((state) => state.user);
  
  const dispatch = useDispatch();
  useEffect(() => {
    // Update selectedDepartment when khoas changes
   
    if (khoas && khoas.length > 0) return;
      dispatch(getKhoas());
    
  }, []);
  const [isEditing, setIsEditing] = useState(false); // Biến để xác định form đang ở chế độ thêm mới hay chỉnh sửa

  useEffect(() => {
    
    if (userCurrent && userCurrent._id) {
      setIsEditing(true); // Nếu có userCurrent._id, chúng ta đang chỉnh sửa
    } else {
      setIsEditing(false); // Ngược lại, chúng ta đang thêm mới
    }
  }, [userCurrent]);
  // const handleSelectChange = (e) => {
  //   setSelectedDepartment(e.target.value);
  // };
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues: {
      UserName: "",
      PassWord: "",
      KhoaID: null,
      HoTen:  "",

      Email:  "",
      PhanQuyen: "nomal",
      UserHis:"",
    },
  });
  // const methods = useForm({
  //   resolver: yupResolver(yupSchema),
  //   defaultValues: {
  //     UserName: userCurrent.UserName || "",
  //     PassWord: userCurrent.PassWord || "",
  //     KhoaID: userCurrent.KhoaID || null,
  //     HoTen: userCurrent.HoTen || "",

  //     Email: userCurrent.Email || "",
  //     PhanQuyen: userCurrent.PhanQuyen || "nomal",
  //   },
  // });

  const {
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = methods;

  const resetForm = () => {
    reset();
  };

  const onSubmitData = (data) => {

    console.log("data", data);

    if (isEditing) {
      const userUpdate = {
        ...data,
        // KhoaID: selectedDepartment,
        KhoaID: data.KhoaID._id,
        PhanQuyen: valueQuyen,
        KhoaTaiChinh:KhoaTaiChinhCurent,
        UserId: userCurrent._id,
        NhanVienID: NhanVienUserCurrent._id || null,
      };
      dispatch(updateUserProfile(userUpdate));
    } else {
      // Thêm mới người dùng
      const userUpdate = {
        ...data,
        // KhoaID: selectedDepartment,
        KhoaID: data.KhoaID._id,
        PhanQuyen: valueQuyen,
        KhoaTaiChinh:KhoaTaiChinhCurent,
        NhanVienID: NhanVienUserCurrent._id || null,
      };
      console.log("usser ínert", userUpdate);
      // if (!selectedDepartment) {
      //   alert("Bạn chưa chọn khoa");
      //   return;
      // }
      dispatch(CreateUser(userUpdate));
    }

    handleClose();
  };

  // useEffect(() => {
  //   if (userCurrent) {
  //     // Khi prop benhnhan thay đổi, cập nhật lại dữ liệu trong form
  //     console.log("chay vao day", userCurrent);
  //     setValue("UserName", userCurrent.UserName || "");
  //     setValue("PassWord", userCurrent.PassWord || "");

  //     setValue("HoTen", userCurrent.HoTen || "");

  //     setValue("Email", userCurrent.Email || "");
  //     // setValue("PhanQuyen", userCurrent.PhanQuyen || "");
  //     setValueQuyen(userCurrent.PhanQuyen);
  //   setValue("KhoaID", userCurrent.KhoaID || null);
      
  //   }
  // }, [userCurrent, open, setValue]);

useEffect(()=>{
  console.log("userCurrent",userCurrent)
if (userCurrent && userCurrent._id && userCurrent._id !== 0) {
reset ({
  ...userCurrent,
})
setValueQuyen(userCurrent.PhanQuyen);
} else {
  reset({
    UserName: "",
    PassWord: "",
    KhoaID: null,
    HoTen:  "",

    Email:  "",
    PhanQuyen: "nomal",
    UserHis:"",
  });
}
},[userCurrent])

  const [valueQuyen, setValueQuyen] = useState("nomal");

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        sx={{
          "& .MuiDialog-paper": {
            width: "90vw", // Or any other width you want
            height: "90vh", // Or any other height you want
          },
        }}
      >
        <DialogTitle id="form-dialog-title">Người dùng</DialogTitle>
        <DialogContent>
          <Card sx={{ p: 3 }}>
            {/* onSubmit={handleSubmit(onSubmit)} */}
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(onSubmitData)}
            >
              <Stack spacing={1}>
                <FormControl fullWidth>
                  {/* <InputLabel>Khoa</InputLabel>
                  <Select
                    value={selectedDepartment || ""}
                    onChange={handleSelectChange}
                  >
                    {khoas &&
                      khoas.length > 0 &&
                      khoas.map((department) => (
                        <MenuItem key={department._id} value={department._id}>
                          {department.TenKhoa}
                        </MenuItem>
                      ))}
                  </Select> */}
                    <FAutocomplete
                name="KhoaID"
                options={khoas}
                displayField="TenKhoa"
                label="Chọn khoa"
              />

                </FormControl>
                <FTextField name="UserName" label="User name" />
                {!isEditing && (
                  <FTextField
                    name="PassWord"
                    label="Password"
                    type={"password"}
                  />
                )}

                <FTextField multiline name="HoTen" label="Tên" />
                <FTextField multiline name="Email" label="Email" />
                <FTextField multiline name="UserHis" label="UserHis" />

                <Autocomplete
                  options={["admin", "nomal", "manager","daotao"]}
                  value={valueQuyen || "nomal"}
                  onChange={(event, newValue) => {
                    setValueQuyen(newValue || "nomal");
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Phân quyền"
                      variant="outlined"
                    />
                  )}
                />

                <Divider />
                <SelectNhanVienForUserForm />
                {(NhanVienUserCurrent && NhanVienUserCurrent._id) && (

                <NhanVienViewDT06 data={NhanVienUserCurrent} /> 
                )}
                <ChonKhoaForm KhoaTaiChinh={KhoaTaiChinhCurent} />
                <Card
                  sx={{
                    fontWeight: "bold",
                    color: "#f2f2f2",
                    backgroundColor: "#1939B7",
                    p: 1,
                    boxShadow: 3,
                    borderRadius: 3,
                  }}
                >
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: isSmallScreen ? "0.7rem" : "1rem",
                    }}
                  >
                    Phân quyền xem báo cáo tài chính cho khoa khác:
                  </Typography>
                </Card>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Mã</TableCell>

                      <TableCell>Tên khoa</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {KhoaTaiChinhCurent && KhoaTaiChinhCurent.length > 0 &&
                      KhoaTaiChinhCurent.map((row, index) => (
                        <TableRow key= {index}>
                          <TableCell>
                            {khoas.find((khoa) => khoa.MaKhoa === row).MaKhoa}
                          </TableCell>
                          <TableCell>
                            {khoas.find((khoa) => khoa.MaKhoa === row).TenKhoa}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <LoadingButton
                    type="submit"
                    variant="contained"
                    size="small"
                    loading={isSubmitting}
                  >
                    Lưu
                  </LoadingButton>
                </Box>
              </Stack>
            </FormProvider>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleClose} color="error">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserInsertForm;
