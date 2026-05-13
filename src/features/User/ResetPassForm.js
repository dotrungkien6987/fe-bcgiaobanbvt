import React, { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import { FTextField, FormProvider } from "../../components/form";

import {
  Box,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Button,
  Card,
  Divider,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

import { resetPass, resetUserFormState } from "./userSlice";

const resetPassSchema = Yup.object().shape({
  UserName: Yup.string().required("Thiếu tên đăng nhập"),
  PassWord: Yup.string()
    .trim()
    .required("Bắt buộc nhập mật khẩu mới")
    .min(6, "Mật khẩu phải có ít nhất 6 ký tự"),
});

function ResetPassForm({
  open,
  handleClose,
  handleSave,

  handleChange,
}) {
  const { userCurrent } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const defaultValues = useMemo(
    () => ({
      UserName: "",
      PassWord: "",
    }),
    [],
  );

  const methods = useForm({
    resolver: yupResolver(resetPassSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  const handleCloseForm = () => {
    reset(defaultValues);
    dispatch(resetUserFormState());
    handleClose();
  };

  const onSubmitData = async (data) => {
    if (!userCurrent?._id) return;

    const userUpdate = {
      ...data,
      UserId: userCurrent._id,
    };
    console.log("reset pass userCurrent", userUpdate);

    const success = await dispatch(resetPass(userUpdate));
    if (!success) return;

    handleCloseForm();
  };
  useEffect(() => {
    if (open && userCurrent) {
      console.log("chay vao day", userCurrent);
      reset({
        UserName: userCurrent.UserName || "",
        PassWord: "",
      });
      return;
    }

    reset(defaultValues);
  }, [defaultValues, open, reset, userCurrent]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleCloseForm}
        aria-labelledby="form-dialog-title"
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="form-dialog-title">
          Đặt lại mật khẩu tài khoản
        </DialogTitle>
        <DialogContent>
          <Card sx={{ p: 3, mt: 1 }}>
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(onSubmitData)}
            >
              <Stack spacing={2}>
                <Alert severity="info">
                  Mật khẩu mới áp dụng cho tài khoản{" "}
                  <strong>{userCurrent?.UserName || "đang chọn"}</strong> và
                  phải có ít nhất 6 ký tự.
                </Alert>
                <Typography variant="body2" color="text.secondary">
                  Sau khi lưu, người dùng sẽ đăng nhập bằng mật khẩu mới này.
                </Typography>
                <FTextField
                  name="UserName"
                  label="Tên đăng nhập"
                  disabled={true}
                />
                <FTextField
                  name="PassWord"
                  label="Mật khẩu mới"
                  type={"password"}
                />

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
                    Lưu mật khẩu mới
                  </LoadingButton>
                </Box>
              </Stack>
            </FormProvider>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm} color="primary">
            Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ResetPassForm;
