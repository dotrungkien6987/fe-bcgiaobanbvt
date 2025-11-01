import React from "react";
import {
  Grid,
  Typography,
  Chip,
  Box,
  Divider,
  Stack,
  Paper,
} from "@mui/material";
import { ArrowUp, ArrowDown } from "iconsax-react";
import { formatDate_getDate } from "utils/formatTime";

function TieuChiDanhGiaView({ data }) {
  if (!data) return null;

  return (
    <Paper sx={{ p: 3, bgcolor: "background.paper" }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid item xs={12}>
          <Stack direction="row" spacing={2} alignItems="center">
            {data.LoaiTieuChi === "TANG_DIEM" ? (
              <ArrowUp size={32} color="#10B981" />
            ) : (
              <ArrowDown size={32} color="#EF4444" />
            )}
            <Box>
              <Typography variant="h4" gutterBottom>
                {data.TenTieuChi}
              </Typography>
              <Chip
                label={
                  data.LoaiTieuChi === "TANG_DIEM" ? "Tăng điểm" : "Giảm điểm"
                }
                color={data.LoaiTieuChi === "TANG_DIEM" ? "success" : "error"}
                size="small"
              />
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Divider />
        </Grid>

        {/* Mô tả */}
        {data.MoTa && (
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Mô tả:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {data.MoTa}
            </Typography>
          </Grid>
        )}

        {/* Thông tin đánh giá */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Thông tin đánh giá
          </Typography>
          <Stack spacing={1.5}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Giá trị tối thiểu:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {data.GiaTriMin?.toFixed(1) || "0"}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Giá trị tối đa:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {data.GiaTriMax?.toFixed(1) || "10"}
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Trọng số mặc định:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {data.TrongSoMacDinh?.toFixed(2) || "1.00"}
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Thông tin khác */}
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Thông tin khác
          </Typography>
          <Stack spacing={1.5}>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Trạng thái:
              </Typography>
              <Chip
                label={data.TrangThaiHoatDong ? "Hoạt động" : "Tạm dừng"}
                color={data.TrangThaiHoatDong ? "success" : "default"}
                size="small"
              />
            </Box>
            <Box display="flex" justifyContent="space-between">
              <Typography variant="body2" color="text.secondary">
                Ngày tạo:
              </Typography>
              <Typography variant="body2" fontWeight={500}>
                {formatDate_getDate(data.createdAt)}
              </Typography>
            </Box>
            {data.updatedAt && (
              <Box display="flex" justifyContent="space-between">
                <Typography variant="body2" color="text.secondary">
                  Cập nhật lần cuối:
                </Typography>
                <Typography variant="body2" fontWeight={500}>
                  {formatDate_getDate(data.updatedAt)}
                </Typography>
              </Box>
            )}
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default TieuChiDanhGiaView;
