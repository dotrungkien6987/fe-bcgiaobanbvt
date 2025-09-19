import React from "react";
import { Grid, Stack, Chip, Box, Typography } from "@mui/material";
import MainCard from "components/MainCard";
import AttachmentSection from "shared/components/AttachmentSection";

function FieldItem({ label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ mb: 1.25 }}>
      <Typography variant="caption" sx={{ color: "text.secondary" }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}

function DoanVaoView({ data = {} }) {
  const id = data?._id;

  return (
    <MainCard content={false} sx={{ p: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <FieldItem label="Số văn bản" value={data.SoVanBanChoPhep} />
          <FieldItem
            label="Ngày ký"
            value={data.NgayKyVanBanFormatted || data.NgayKyVanBan}
          />
          <FieldItem label="Mục đích" value={data.MucDichXuatCanh} />
        </Grid>
        <Grid item xs={12} md={6}>
          <FieldItem
            label="Thời gian vào làm việc"
            value={data.ThoiGianVaoLamViecFormatted || data.ThoiGianVaoLamViec}
          />
          <FieldItem label="Ghi chú" value={data.GhiChu} />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Chip label={`Số lượng thành viên: ${data.ThanhVien?.length || 0}`} />
      </Stack>

      {id && (
        <div style={{ marginTop: 12 }}>
          <AttachmentSection
            ownerType="DoanVao"
            ownerId={id}
            field="file"
            canUpload={false}
            canDelete={false}
          />
        </div>
      )}
    </MainCard>
  );
}

export default DoanVaoView;
