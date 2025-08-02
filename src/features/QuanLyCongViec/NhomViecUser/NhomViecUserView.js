import React from "react";
import { Grid, Typography, Chip, Box, Divider } from "@mui/material";
import { formatDate_getDate } from "utils/formatTime";

function NhomViecUserView({ data }) {
  if (!data) return null;

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Tên nhóm việc:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {data.TenNhom}
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="subtitle2" color="textSecondary">
            Trạng thái:
          </Typography>
          <Chip
            label={data.TrangThaiHoatDong ? "Hoạt động" : "Tạm dừng"}
            color={data.TrangThaiHoatDong ? "success" : "default"}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="subtitle2" color="textSecondary">
            Mô tả:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            {data.MoTa || "Không có mô tả"}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 1 }} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Khoa:
          </Typography>
          <Typography variant="body1">
            {data.KhoaID?.TenKhoa || "Không xác định"}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Người tạo:
          </Typography>
          <Typography variant="body1">
            {data.NguoiTaoID?.HoTen || "Không xác định"}
          </Typography>
        </Grid>

        <Grid item xs={12} md={4}>
          <Typography variant="subtitle2" color="textSecondary">
            Ngày tạo:
          </Typography>
          <Typography variant="body1">
            {formatDate_getDate(data.createdAt)}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}

export default NhomViecUserView;
