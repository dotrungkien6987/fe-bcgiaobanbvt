import React, {  useEffect } from "react";
import { useDispatch,  } from "react-redux";
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
 
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

import {   resetPassMe } from "./userSlice";

const yupSchema = Yup.object().shape({
    PassWordNew: Yup.string().required("Bắt buộc nhập Pass mới"),
  });

function UserResetPassForm({
  open,
    handleClose,
  handleSave,
  user ={},
  handleChange,
}) {
  
  
  const dispatch = useDispatch();
 
  const methods = useForm({
   
    defaultValues: {
      UserName: user?.UserName || "",
      PassWordNew: "",
      PassWordOld: "",
      PassWordNewConfirm:"",
    },
    resolver: yupResolver(yupSchema),
  });
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
    if (data.PassWordNewConfirm===data.PassWordNew)
    {
        dispatch(resetPassMe({...data}))
        handleClose();
    }
    else  {
        alert("Nhập lại mật khẩu chưa đúng")
    }
    // console.log("data", data);
   
    //dispach reset User
    
  };
  
  useEffect(() => {
    if (user) {
      // Khi prop benhnhan thay đổi, cập nhật lại dữ liệu trong form
      console.log("chay vao day",user)
      setValue("UserName", user.UserName || "");
      setValue("PassWordOld", "");
      setValue("PassWordNew", "");
      setValue("PassWordNewConfirm", "");
     
    }
   
  }, [user,open,setValue]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
        sx={{
          "& .MuiDialog-paper": {
            width: "1000px", // Or any other width you want
            height: "600px", // Or any other height you want
          },
        }}
      >
        <DialogTitle id="form-dialog-title">Đặt lại mật khẩu</DialogTitle>
        <DialogContent>
          <Card sx={{ p: 3 }}>
            {/* onSubmit={handleSubmit(onSubmit)} */}
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(onSubmitData)}
            >
              <Stack spacing={1}>
              <FormControl fullWidth>
           
          </FormControl>
                  <FTextField name="UserName" label="Tài khoản:"  disabled={true}/>
                <FTextField name="PassWordOld" label="Mật khẩu cũ"  type={"password"}/>
                <FTextField name="PassWordNew" label="Mật khẩu mới "  type={"password"}/>
                <FTextField name="PassWordNewConfirm" label="Nhập lại mật khẩu mới "  type={"password"}/>
                 
                <Divider />
                
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
          <Button onClick={handleClose} color="primary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default UserResetPassForm;
