/**
 * GreetingSection - Header với avatar, tên, role badge, ngày, refresh button
 *
 * @param {Object} user - User object từ useAuth
 * @param {Function} onRefresh - Callback khi click refresh
 * @param {Boolean} isLoading - Đang loading hay không
 * @param {Boolean} isManager - User có phải manager không
 */

import React from "react";
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  alpha,
} from "@mui/material";
import { Refresh } from "iconsax-react";
import EmployeeAvatar from "components/EmployeeAvatar";
import dayjs from "dayjs";
import "dayjs/locale/vi";

dayjs.locale("vi");

function GreetingSection({
  user,
  onRefresh,
  isLoading = false,
  isManager = false,
}) {
  const theme = useTheme();

  // Get NhanVien info
  const nhanVien = user?.nhanVienInfo?.nhanVien;
  const tenNhanVien = nhanVien?.Ten || user?.HoTen || "User";

  // Format date in Vietnamese
  const formattedDate = dayjs().format("dddd, DD/MM/YYYY");
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <Box
      sx={{
        mb: 3,
        p: 2,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05,
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={2}
      >
        {/* Left: Avatar + Name */}
        <Stack direction="row" alignItems="center" spacing={2}>
          <EmployeeAvatar
            nhanVienId={user?.NhanVienID}
            name={tenNhanVien}
            size="md"
            sx={{
              width: 48,
              height: 48,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          />

          <Box>
            <Typography variant="h6" fontWeight={600} noWrap>
              Xin chào, {tenNhanVien}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              📅 {capitalizedDate}
            </Typography>
          </Box>
        </Stack>

        {/* Right: Refresh Button */}
        <Tooltip title="Làm mới dữ liệu">
          <IconButton
            onClick={onRefresh}
            disabled={isLoading}
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              "&:hover": {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
              },
            }}
          >
            <Refresh
              size={20}
              color={theme.palette.primary.main}
              style={{
                animation: isLoading ? "spin 1s linear infinite" : "none",
              }}
            />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* CSS for spin animation */}
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

export default GreetingSection;
