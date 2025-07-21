import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

function DoanRaView({ data }) {
  if (!data) return null;
  return (
    <Card variant="outlined" sx={{ mt: 1, mb: 1 }}>
      <CardContent>
        <Typography variant="h6">Chi tiết Đoàn Ra</Typography>
        <Typography>Ngày ký: {data.NgayKyVanBan}</Typography>
        <Typography>Số văn bản: {data.SoVanBanChoPhep}</Typography>
        <Typography>Mục đích: {data.MucDichXuatCanh}</Typography>
        <Typography>Thời gian xuất cảnh: {data.ThoiGianXuatCanh}</Typography>
        <Typography>Quốc gia đến: {data.QuocGiaDen}</Typography>
        <Typography>Ghi chú: {data.GhiChu}</Typography>
        <Typography>
          Thành viên:{" "}
          {Array.isArray(data.ThanhVien) ? data.ThanhVien.join(", ") : ""}
        </Typography>
        <Typography>
          Tài liệu kèm theo:{" "}
          {Array.isArray(data.TaiLieuKemTheo)
            ? data.TaiLieuKemTheo.join(", ")
            : ""}
        </Typography>
      </CardContent>
    </Card>
  );
}

export default DoanRaView;
