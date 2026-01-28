import React from "react";
import { Alert, AlertTitle, Box, Collapse } from "@mui/material";
import { Warning as WarningIcon } from "@mui/icons-material";
import { useEnvironment } from "../hooks/useEnvironment";

/**
 * Banner cảnh báo khi đang làm việc với Production
 * Chỉ hiển thị khi environment = PROD
 *
 * @param {Object} props
 * @param {string} props.message - Custom message (optional)
 * @param {boolean} props.showAlways - Hiển thị cả khi không phải PROD (for testing)
 * @param {React.ReactNode} props.children - Nội dung bổ sung
 */
function ProductionWarningBanner({ message, showAlways = false, children }) {
  const { isProduction, env, baseUrl } = useEnvironment();

  // Không hiển thị nếu không phải production (trừ khi showAlways)
  if (!isProduction && !showAlways) {
    return null;
  }

  const defaultMessage = `Bạn đang làm việc với ${env} Server. Mọi thao tác xóa/sửa sẽ ảnh hưởng dữ liệu thật!`;

  return (
    <Collapse in={true}>
      <Alert
        severity="error"
        icon={<WarningIcon fontSize="large" />}
        sx={{
          mb: 2,
          "& .MuiAlert-icon": {
            alignItems: "center",
          },
          // Không cho phép đóng
          "& .MuiAlert-action": {
            display: "none",
          },
          // Style nổi bật
          borderLeft: "4px solid",
          borderLeftColor: "error.main",
          backgroundColor: "error.lighter",
        }}
      >
        <AlertTitle sx={{ fontWeight: 700, fontSize: "1rem" }}>
          ⚠️ CẢNH BÁO: PRODUCTION SERVER
        </AlertTitle>

        <Box sx={{ mt: 1 }}>{message || defaultMessage}</Box>

        <Box
          sx={{
            mt: 1,
            fontSize: "0.85rem",
            opacity: 0.85,
            fontFamily: "monospace",
          }}
        >
          Server: {baseUrl}
        </Box>

        {children && <Box sx={{ mt: 1 }}>{children}</Box>}
      </Alert>
    </Collapse>
  );
}

export default ProductionWarningBanner;
