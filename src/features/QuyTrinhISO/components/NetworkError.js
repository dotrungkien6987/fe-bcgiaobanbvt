import { Box, Button, Typography } from "@mui/material";
import { Wifi, Refresh2 } from "iconsax-react";

/**
 * Network Error Component
 * Displayed when network request fails, with retry option
 */
function NetworkError({
  message = "Không thể kết nối đến máy chủ",
  onRetry,
  isRetrying = false,
}) {
  return (
    <Box
      sx={{
        py: 6,
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          bgcolor: "warning.lighter",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
        }}
      >
        <Wifi size={36} color="#ed6c02" variant="Bold" />
      </Box>

      <Typography variant="h6" fontWeight={600}>
        Lỗi kết nối
      </Typography>

      <Typography variant="body2" color="text.secondary" maxWidth={350}>
        {message}
      </Typography>

      {onRetry && (
        <Button
          variant="contained"
          color="warning"
          startIcon={
            <Refresh2
              size={18}
              style={{
                animation: isRetrying ? "spin 1s linear infinite" : "none",
              }}
            />
          }
          onClick={onRetry}
          disabled={isRetrying}
          sx={{ mt: 1 }}
        >
          {isRetrying ? "Đang thử lại..." : "Thử lại"}
        </Button>
      )}

      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </Box>
  );
}

export default NetworkError;
