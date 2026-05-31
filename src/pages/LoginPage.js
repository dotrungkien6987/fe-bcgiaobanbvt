import React, { useState } from "react";
import { FormProvider, FTextField } from "../components/form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import useAuth from "../hooks/useAuth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Container,
  Stack,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { LoadingButton } from "@mui/lab";

const LoginSchema = Yup.object().shape({
  UserName: Yup.string().required("Bắt buộc nhập tên đăng nhập"),
  PassWord: Yup.string().required("Bắt buộc nhập mật khẩu"),
});
const defaultValues = {
  UserName: "",
  PassWord: "",
};

function getLoginErrorDisplay(error) {
  switch (error?.status) {
    case 401:
      return {
        severity: "error",
        message: "Tên đăng nhập hoặc mật khẩu không đúng.",
      };
    case 423:
      return {
        severity: "warning",
        message:
          error?.message || "Tài khoản tạm thời bị khóa. Vui lòng thử lại sau.",
      };
    case 429:
      return {
        severity: "warning",
        message: "Bạn đã thử quá nhanh. Vui lòng chờ một chút rồi thử lại.",
      };
    default:
      return {
        severity: "error",
        message:
          error?.message || "Đăng nhập không thành công. Vui lòng thử lại.",
      };
  }
}

function LoginPage() {
  const auth = useAuth();
  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    clearErrors,
    setError,
    setFocus,
    resetField,
    formState: { errors, isSubmitting },
  } = methods;
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    // const from = location.state?.from?.pathname || "/";
    const from = "/";
    let { UserName, PassWord } = data;
    clearErrors("responseError");
    try {
      await auth.login({ UserName, PassWord }, () => {
        navigate(from, { replace: true });
      });
    } catch (error) {
      const loginError = getLoginErrorDisplay(error);

      if (error?.status === 401) {
        resetField("PassWord");
        setFocus("PassWord");
      }

      setError("responseError", {
        type: loginError.severity,
        message: loginError.message,
      });
    }
  };
  return (
    <div>
      <Container maxWidth="xs">
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {!!errors.responseError && (
              <Alert severity={errors.responseError.type || "error"}>
                {errors.responseError.message}
              </Alert>
            )}

            <FTextField name="UserName" label="Tên đăng nhập" />
            <FTextField
              name="PassWord"
              label="Mật khẩu"
              type={showPassword ? "text" : "password"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? (
                        <VisibilityIcon />
                      ) : (
                        <VisibilityOffIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Stack>

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ my: 2 }}
          />

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Đăng nhập
          </LoadingButton>
        </FormProvider>
      </Container>
    </div>
  );
}

export default LoginPage;
