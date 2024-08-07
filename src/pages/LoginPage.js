import React, { useState } from "react";
import { FCheckbox, FormProvider, FTextField } from "../components/form";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

import useAuth from "../hooks/useAuth";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate, useLocation, Link as RouterLink } from "react-router-dom";
import {
  Alert,
  Container,
  Stack,
  Link,
  InputAdornment,
  IconButton,
} from "@mui/material";

import { LoadingButton } from "@mui/lab";

const LoginSchema = Yup.object().shape({
  UserName: Yup.string().required("UserName is required"),
  PassWord: Yup.string().required("Password is required"),
});
const defaultValues = {
  UserName: "",
  PassWord: "",
  remember: true,
};

function LoginPage() {
  const auth = useAuth();
  console.log("auth",auth);
  const methods = useForm({
    resolver: yupResolver(LoginSchema),
    defaultValues,
  });
  const {
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = methods;
  const navigate = useNavigate();
  
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    // const from = location.state?.from?.pathname || "/";
    const from = "/";
    console.log(from);
    let { UserName, PassWord } = data;
    console.log(UserName, PassWord);
    try {
      
      await auth.login({ UserName, PassWord }, () => {
        console.log(`isAuth after submit login:`, auth);
        navigate(from, { replace: true });
      });
      // console.log(`isAuth after submit login ${auth.isAuthenticated}`);
    } catch (error) {
      // reset();
      
      setError("responseError", error);
    }
  };
  return (
    <div>
      <Container maxWidth="xs">
        <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {!!errors.responseError && (
              <Alert severity="error">{errors.responseError.message}</Alert>
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
                    onClick={()=>setShowPassword(!showPassword)}
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
          >
            <FCheckbox name="remember" label="Remember me" />
          </Stack>

          <LoadingButton
            fullWidth
            size="large"
            type="submit"
            
            variant="contained"
            loading={isSubmitting}
          >
            Login
          </LoadingButton>
        </FormProvider>
      </Container>
    </div>
  );
}

export default LoginPage;
