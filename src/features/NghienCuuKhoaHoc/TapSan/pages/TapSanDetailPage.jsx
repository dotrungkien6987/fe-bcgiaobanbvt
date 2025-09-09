import React from "react";
import { Box, Tabs, Tab, Typography, Stack, Button } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { getTapSanById } from "../services/tapsan.api";
import AttachmentSection from "../components/AttachmentSection";

export default function TapSanDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [value, setValue] = React.useState(0);
  const [doc, setDoc] = React.useState(null);

  React.useEffect(() => {
    getTapSanById(id).then(setDoc);
  }, [id]);

  return (
    <Box p={2}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Typography variant="h5">
          Tập san:{" "}
          {doc
            ? `${doc.Loai} - ${doc.NamXuatBan} - Số ${doc.SoXuatBan}`
            : "..."}
        </Typography>
        <Button variant="outlined" onClick={() => nav(`/tapsan/${id}/edit`)}>
          Sửa
        </Button>
      </Stack>
      <Tabs value={value} onChange={(_, v) => setValue(v)} sx={{ mb: 2 }}>
        <Tab label="Tổng quan" />
        <Tab label="Kế hoạch" />
        <Tab label="Tệp tập san" />
      </Tabs>
      {value === 0 && (
        <Box>
          <Typography>Loại: {doc?.Loai}</Typography>
          <Typography>Năm: {doc?.NamXuatBan}</Typography>
          <Typography>Số xuất bản: {doc?.SoXuatBan}</Typography>
        </Box>
      )}
      {value === 1 && (
        <AttachmentSection
          ownerType="TapSan"
          ownerId={id}
          field="kehoach"
          title="Tệp kế hoạch"
        />
      )}
      {value === 2 && (
        <AttachmentSection
          ownerType="TapSan"
          ownerId={id}
          field="file"
          title="Tệp tập san"
        />
      )}
    </Box>
  );
}
