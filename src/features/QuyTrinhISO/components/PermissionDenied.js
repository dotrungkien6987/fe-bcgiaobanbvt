import { Box, Button, Stack, Typography } from "@mui/material";
import { Lock, ArrowLeft } from "iconsax-react";
import { useNavigate } from "react-router-dom";

/**
 * Permission Denied Component
 * Displayed when user doesn't have access to a resource
 */
function PermissionDenied({ message, backUrl = "/quytrinh-iso" }) {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        py: 8,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "error.lighter",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Lock size={40} color="#d32f2f" variant="Bold" />
      </Box>

      <Typography variant="h5" fontWeight={600} color="error.main">
        Không có quyền truy cập
      </Typography>

      <Typography variant="body1" color="text.secondary" maxWidth={400}>
        {message ||
          "Bạn không có quyền xem hoặc chỉnh sửa tài nguyên này. Vui lòng liên hệ quản trị viên nếu bạn cho rằng đây là lỗi."}
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
        >
          Quay lại
        </Button>
        <Button variant="contained" onClick={() => navigate(backUrl)}>
          Về danh sách
        </Button>
      </Stack>
    </Box>
  );
}

export default PermissionDenied;
