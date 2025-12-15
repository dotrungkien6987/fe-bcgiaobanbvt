/**
 * YeuCauCard - Card hiển thị thông tin tóm tắt 1 yêu cầu
 *
 * Dùng trong danh sách (mobile view) hoặc dashboard
 */
import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Stack,
  Box,
  Rating,
  IconButton,
  Tooltip,
  Avatar,
  Divider,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as KhoaIcon,
  ChevronRight as ChevronRightIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";

import YeuCauStatusChip from "./YeuCauStatusChip";
import {
  formatRelativeTime,
  formatDateTime,
  getTenNguoi,
  getTenKhoa,
  isQuaHan,
  isSapHetHan,
} from "../yeuCau.utils";

function YeuCauCard({
  yeuCau,
  onClick,
  showActions = true,
  showRating = false,
}) {
  if (!yeuCau) return null;

  const quaHan = isQuaHan(yeuCau);
  const sapHetHan = isSapHetHan(yeuCau);
  const ratingValue = yeuCau?.DanhGia?.SoSao;

  return (
    <Card
      sx={{
        cursor: onClick ? "pointer" : "default",
        transition: "box-shadow 0.2s",
        "&:hover": onClick
          ? {
              boxShadow: 4,
            }
          : {},
        borderLeft: quaHan ? "4px solid" : sapHetHan ? "4px solid" : "none",
        borderLeftColor: quaHan
          ? "error.main"
          : sapHetHan
          ? "warning.main"
          : "transparent",
      }}
      onClick={onClick}
    >
      <CardContent sx={{ pb: 1 }}>
        {/* Header: Mã + Trạng thái */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={1}
          mb={1}
        >
          <Box>
            <Typography
              variant="caption"
              color="text.secondary"
              fontWeight="medium"
            >
              {yeuCau.MaYeuCau}
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 0.5 }}>
              {yeuCau.TieuDe}
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.5} alignItems="center">
            {(quaHan || sapHetHan) && (
              <Tooltip title={quaHan ? "Quá hạn" : "Sắp hết hạn"}>
                <WarningIcon
                  fontSize="small"
                  color={quaHan ? "error" : "warning"}
                />
              </Tooltip>
            )}
            <YeuCauStatusChip trangThai={yeuCau.TrangThai} />
          </Stack>
        </Stack>

        {/* Mô tả (truncated) */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            mb: 1.5,
          }}
        >
          {yeuCau.MoTa}
        </Typography>

        {/* Meta info */}
        <Stack spacing={0.75}>
          {/* Loại yêu cầu */}
          {yeuCau.SnapshotDanhMuc?.TenLoaiYeuCau && (
            <Typography variant="caption" color="primary.main">
              {yeuCau.SnapshotDanhMuc.TenLoaiYeuCau}
            </Typography>
          )}

          <Divider />

          {/* Người tạo + Khoa */}
          <Stack direction="row" spacing={2} alignItems="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PersonIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {getTenNguoi(yeuCau.NguoiTaoID)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <KhoaIcon fontSize="small" color="action" />
              <Typography variant="caption" color="text.secondary">
                {getTenKhoa(yeuCau.KhoaTaoID)} → {getTenKhoa(yeuCau.KhoaXuLyID)}
              </Typography>
            </Stack>
          </Stack>

          {/* Thời gian */}
          <Stack direction="row" spacing={0.5} alignItems="center">
            <TimeIcon fontSize="small" color="action" />
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(yeuCau.createdAt)}
              {yeuCau.ThoiGianHen && (
                <> • Hẹn: {formatDateTime(yeuCau.ThoiGianHen)}</>
              )}
            </Typography>
          </Stack>

          {showRating && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              {ratingValue ? (
                <>
                  <Rating value={ratingValue} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {ratingValue}/5
                  </Typography>
                </>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Chưa đánh giá
                </Typography>
              )}
            </Stack>
          )}

          {/* Người xử lý (nếu có) */}
          {yeuCau.NguoiXuLyID && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Avatar
                sx={{ width: 20, height: 20, fontSize: 10 }}
                src={yeuCau.NguoiXuLyID?.Avatar}
              >
                {getTenNguoi(yeuCau.NguoiXuLyID)?.[0]}
              </Avatar>
              <Typography variant="caption" color="text.secondary">
                Xử lý: {getTenNguoi(yeuCau.NguoiXuLyID)}
              </Typography>
            </Stack>
          )}
        </Stack>
      </CardContent>

      {showActions && onClick && (
        <CardActions sx={{ pt: 0, justifyContent: "flex-end" }}>
          <IconButton size="small" color="primary">
            <ChevronRightIcon />
          </IconButton>
        </CardActions>
      )}
    </Card>
  );
}

export default YeuCauCard;
