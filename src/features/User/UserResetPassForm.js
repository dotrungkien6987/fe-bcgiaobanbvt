import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
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
  FormControl,
  Typography,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useForm } from "react-hook-form";

import { resetPassMe } from "./userSlice";
import {
  buildStrongPasswordSchema,
  PASSWORD_POLICY_HINT,
} from "../../utils/passwordPolicy";

const yupSchema = Yup.object().shape({
  PassWordOld: Yup.string().required("Bắt buộc nhập mật khẩu cũ"),
  PassWordNew: buildStrongPasswordSchema(Yup, "Bắt buộc nhập mật khẩu mới"),
  PassWordNewConfirm: Yup.string()
    .required("Bắt buộc nhập lại mật khẩu mới")
    .oneOf([Yup.ref("PassWordNew")], "Nhập lại mật khẩu chưa đúng"),
});

function UserResetPassForm({
  open,
  handleClose,
  handleSave,
  user = {},
  handleChange,
  forcedChange = false,
  onSuccess,
  onLogout,
}) {
  const dispatch = useDispatch();

  const methods = useForm({
    defaultValues: {
      UserName: user?.UserName || "",
      PassWordNew: "",
      PassWordOld: "",
      PassWordNewConfirm: "",
    },
    resolver: yupResolver(yupSchema),
  });
  const {
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { isSubmitting },
  } = methods;

  const resetForm = () => {
    reset();
  };

  const handleCloseForm = () => {
    if (forcedChange) {
      return;
    }

    handleClose();
  };

  const onSubmitData = async (data) => {
    if (data.PassWordNewConfirm !== data.PassWordNew) {
      setError("PassWordNewConfirm", {
        type: "manual",
        message: "Nhập lại mật khẩu chưa đúng",
      });
      return;
    }

    const success = await dispatch(resetPassMe({ ...data }));
    if (!success) {
      return;
    }

    if (onSuccess) {
      await onSuccess();
      return;
    }

    handleCloseForm();
  };

  useEffect(() => {
    if (user) {
      // Khi prop benhnhan thay đổi, cập nhật lại dữ liệu trong form
      console.log("chay vao day", user);
      setValue("UserName", user.UserName || "");
      setValue("PassWordOld", "");
      setValue("PassWordNew", "");
      setValue("PassWordNewConfirm", "");
    }
  }, [user, open, setValue]);

  return (
    <div>
      <Dialog
        open={open}
        onClose={forcedChange ? undefined : handleCloseForm}
        aria-labelledby="form-dialog-title"
        disableEscapeKeyDown={forcedChange}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle id="form-dialog-title">
          {forcedChange ? "Đổi mật khẩu bắt buộc" : "Đặt lại mật khẩu"}
        </DialogTitle>
        <DialogContent>
          <Card sx={{ p: 3, mt: 1 }}>
            {/* onSubmit={handleSubmit(onSubmit)} */}
            <FormProvider
              methods={methods}
              onSubmit={handleSubmit(onSubmitData)}
            >
              <Stack spacing={2}>
                {forcedChange && (
                  <Alert severity="warning">
                    Tài khoản này cần đổi mật khẩu trước khi tiếp tục sử dụng hệ
                    thống.
                  </Alert>
                )}
                <Typography variant="body2" color="text.secondary">
                  {PASSWORD_POLICY_HINT}
                </Typography>
                <FormControl fullWidth></FormControl>
                <FTextField
                  name="UserName"
                  label="Tài khoản:"
                  disabled={true}
                />
                <FTextField
                  name="PassWordOld"
                  label="Mật khẩu cũ"
                  type={"password"}
                />
                <FTextField
                  name="PassWordNew"
                  label="Mật khẩu mới"
                  type={"password"}
                />
                <FTextField
                  name="PassWordNewConfirm"
                  label="Nhập lại mật khẩu mới"
                  type={"password"}
                />

                <Divider />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: forcedChange ? "space-between" : "flex-end",
                  }}
                >
                  {forcedChange && onLogout && (
                    <Button onClick={onLogout} color="error" variant="text">
                      Đổi tài khoản khác
                    </Button>
                  )}
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
        {!forcedChange && (
          <DialogActions>
            <Button onClick={handleCloseForm} color="primary">
              Hủy
            </Button>
          </DialogActions>
        )}
      </Dialog>
    </div>
  );
}

export default UserResetPassForm;
