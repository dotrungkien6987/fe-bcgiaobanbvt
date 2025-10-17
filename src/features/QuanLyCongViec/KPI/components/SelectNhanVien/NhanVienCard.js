import React from "react";
import {
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Avatar,
  Chip,
  Stack,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PersonIcon from "@mui/icons-material/Person";

/**
 * NhanVienCard - Card hiển thị thông tin nhân viên
 *
 * Props:
 * - nhanVien: Object thông tin nhân viên
 * - isSelected: Boolean trạng thái đã chọn
 * - onSelect: Function callback khi chọn nhân viên
 *
 * Features:
 * - Avatar với chữ cái đầu tiên của tên
 * - Hiển thị mã nhân viên, chức danh, email
 * - Visual feedback khi selected (border + icon)
 * - Hover effect
 */
function NhanVienCard({ nhanVien, isSelected, onSelect }) {
  return (
    <Card
      sx={{
        position: "relative",
        border: isSelected ? 2 : 1,
        borderColor: isSelected ? "primary.main" : "divider",
        boxShadow: isSelected ? 4 : 1,
        transition: "all 0.3s",
        "&:hover": {
          boxShadow: 6,
          borderColor: "primary.light",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardActionArea onClick={() => onSelect(nhanVien._id)}>
        <CardContent>
          {/* Selected Indicator */}
          {isSelected && (
            <CheckCircleIcon
              color="primary"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                fontSize: 28,
              }}
            />
          )}

          {/* Avatar */}
          <Box display="flex" justifyContent="center" mb={2}>
            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: isSelected ? "primary.main" : "grey.400",
                fontSize: 28,
                fontWeight: 600,
              }}
            >
              {nhanVien.Ten ? (
                nhanVien.Ten.charAt(0).toUpperCase()
              ) : (
                <PersonIcon />
              )}
            </Avatar>
          </Box>

          {/* Thông tin nhân viên */}
          <Typography
            variant="h6"
            align="center"
            gutterBottom
            noWrap
            sx={{ fontWeight: 600 }}
          >
            {nhanVien.Ten || "Chưa có tên"}
          </Typography>

          <Stack spacing={1} alignItems="center">
            {nhanVien.MaNhanVien && (
              <Chip
                label={`Mã: ${nhanVien.MaNhanVien}`}
                size="small"
                color="default"
                variant="outlined"
              />
            )}

            {nhanVien.ChucDanh && (
              <Chip label={nhanVien.ChucDanh} size="small" color="info" />
            )}

            {nhanVien.Email && (
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
                sx={{ maxWidth: "100%", px: 1 }}
              >
                {nhanVien.Email}
              </Typography>
            )}

            {nhanVien.KhoaID?.TenKhoa && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  fontStyle: "italic",
                  textAlign: "center",
                  px: 1,
                }}
              >
                {nhanVien.KhoaID.TenKhoa}
              </Typography>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default NhanVienCard;
