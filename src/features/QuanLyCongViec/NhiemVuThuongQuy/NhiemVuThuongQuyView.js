import React from "react";
import { Grid, Typography, Chip, Box, Divider, Rating } from "@mui/material";
import { formatDate_getDate } from "utils/formatTime";

function NhiemVuThuongQuyView({ data }) {
  if (!data) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Tên nhiệm vụ
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {data.TenNhiemVu}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Khoa
          </Typography>
          <Typography variant="body1">
            {data.KhoaID?.TenKhoa || "Chưa chỉ định"}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Độ khó mặc định (tham khảo)
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Rating
              value={data.MucDoKhoDefault || 5}
              max={10}
              readOnly
              size="small"
            />
            <Typography variant="body2">
              ({data.MucDoKhoDefault || 5}/10)
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Trạng thái
          </Typography>
          <Chip
            label={data.TrangThaiHoatDong ? "Hoạt động" : "Tạm dừng"}
            color={data.TrangThaiHoatDong ? "success" : "default"}
            size="small"
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            Mô tả
          </Typography>
          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {data.MoTa || "Không có mô tả"}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Người tạo
          </Typography>
          <Typography variant="body2">
            {data.NguoiTaoID?.HoTen || "Không xác định"}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Ngày tạo
          </Typography>
          <Typography variant="body2">
            {formatDate_getDate(data.createdAt)}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Ngày cập nhật
          </Typography>
          <Typography variant="body2">
            {formatDate_getDate(data.updatedAt)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NhiemVuThuongQuyView;
