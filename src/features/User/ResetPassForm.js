import React, {  useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";


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

import {  resetPass } from "./userSlice";

function ResetPassForm({
  open,
    handleClose,
  handleSave,
 
  handleChange,
}) {
  
  const { userCurrent } = useSelector((state) => state.user);
  const dispatch = useDispatch();
 
  const methods = useForm({
   
    defaultValues: {
      UserName:  "",
      PassWord:  "",
      
    },
  });
  const {
    handleSubmit,
    
    setValue,
    formState: { isSubmitting },
  } = methods;

  const onSubmitData = (data) => {
    
    const userUpdate = {
      ...data, 
      UserId:userCurrent._id
    };
    console.log("reset pass userCurrent",userUpdate)

    //dispach reset User
    dispatch(resetPass(userUpdate))
    handleClose();
  };
  
  useEffect(() => {
    if (userCurrent) {
      // Khi prop benhnhan thay đổi, cập nhật lại dữ liệu trong form
      console.log("chay vao day",userCurrent)
      setValue("UserName", userCurrent.UserName || "");
      setValue("PassWord", userCurrent.PassWord || "");
     
    }
   
  }, [userCurrent,open,setValue]);

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
                  <FTextField name="UserName" label="User name"  disabled={true}/>
                <FTextField name="PassWord" label="Password"  type={"password"}/>
                 
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

export default ResetPassForm;
