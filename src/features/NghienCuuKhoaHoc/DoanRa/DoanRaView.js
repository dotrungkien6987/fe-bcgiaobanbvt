import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  Divider,
  Tooltip,
  Box,
  Avatar,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Alert,
  Link,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  DocumentText,
  Calendar,
  Global,
  Note,
  Profile2User,
} from "iconsax-react";

const Label = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: theme.palette.text.secondary,
  marginBottom: 2,
}));

const Value = styled(Typography)(({ theme }) => ({
  fontSize: 14,
  fontWeight: 500,
  color: theme.palette.text.primary,
  wordBreak: "break-word",
}));

function FieldItem({ icon, label, value, span = 3 }) {
  if (!value) return null;
  return (
    <Grid item xs={12} md={span}>
      <Stack direction="row" spacing={1} alignItems="flex-start">
        <Box sx={{ mt: 0.2 }}>{icon}</Box>
        <Box>
          <Label>{label}</Label>
          <Value>{value}</Value>
        </Box>
      </Stack>
    </Grid>
  );
}

function SectionTitle({ children }) {
  return (
    <Typography
      variant="subtitle2"
      sx={{
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: "primary.main",
        mb: 1,
        mt: 1.5,
      }}
    >
      {children}
    </Typography>
  );
}

function DoanRaView({ data, dense = false }) {
  const rawMembers = useMemo(
    () => (Array.isArray(data?.ThanhVien) ? data.ThanhVien : []),
    [data]
  );
  const members = useMemo(
    () =>
      rawMembers.map((m) => {
        if (!m || typeof m !== "object") return { _id: m, _isIdOnly: true };
        return {
          _id: m._id || m.id,
          HoTen:
            m.HoTen ||
            m.Ten ||
            m.hoTen ||
            m.ten ||
            m.UserName ||
            m.username ||
            "(Không tên)",
          MaNhanVien: m.MaNhanVien || m.MaNV || m.username || "",
          Khoa:
            m.TenKhoa ||
            m.Khoa?.Ten ||
            m.KhoaID?.TenKhoa ||
            m.KhoaID?.Ten ||
            "",
          ChucDanh:
            m.ChucDanh || m.ChucDanhID?.Ten || m.ChucDanhID?.TenChucDanh || "",
          ChucVu: m.ChucVu || m.ChucVuID?.Ten || m.ChucVuID?.TenChucVu || "",
        };
      }),
    [rawMembers]
  );
  const onlyIdMode = members.every((m) => m._isIdOnly);

  const documents = useMemo(
    () => (Array.isArray(data?.TaiLieuKemTheo) ? data.TaiLieuKemTheo : []),
    [data]
  );

  if (!data) return null;

  return (
    <Card
      variant="outlined"
      sx={{
        mt: dense ? 0.5 : 1,
        mb: dense ? 0.5 : 1,
        borderRadius: 2,
        boxShadow: (theme) => theme.customShadows?.z1,
        background: (theme) => theme.palette.background.paper,
        width: "100%",
      }}
    >
      <CardContent sx={{ pt: 2, pb: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
          mb={1.5}
        >
          <Avatar
            variant="rounded"
            sx={{ width: 48, height: 48, bgcolor: "primary.light" }}
          >
            <Global size={28} color="var(--mui-palette-primary-main)" />
          </Avatar>
          <Box flexGrow={1}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Chi tiết Đoàn Ra
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              {data.SoVanBanChoPhep && (
                <Typography variant="caption" color="text.secondary">
                  Số VB: {data.SoVanBanChoPhep}
                </Typography>
              )}
              {data.QuocGiaDen && (
                <Typography variant="caption" color="text.secondary">
                  Quốc gia: {data.QuocGiaDen}
                </Typography>
              )}
            </Stack>
          </Box>
          <Box>
            <Link
              href={`/doandi/${data._id}`}
              underline="none"
              color="primary.main"
              sx={{ fontSize: 13, fontWeight: 600 }}
            >
              Xem trang đầy đủ →
            </Link>
          </Box>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <FieldItem
            icon={<Calendar size={18} />}
            label="Ngày ký"
            value={data.NgayKyVanBanFormatted || data.NgayKyVanBan}
          />
          <FieldItem
            icon={<Calendar size={18} />}
            label="Thời gian xuất cảnh"
            value={data.ThoiGianXuatCanhFormatted || data.ThoiGianXuatCanh}
          />
          <FieldItem
            icon={<Global size={18} />}
            label="Quốc gia đến"
            value={data.QuocGiaDen}
          />
          <FieldItem
            icon={<DocumentText size={18} />}
            label="Mục đích"
            value={data.MucDichXuatCanh}
            span={12}
          />
          {data.GhiChu && (
            <FieldItem
              icon={<Note size={18} />}
              label="Ghi chú"
              value={data.GhiChu}
              span={12}
            />
          )}
        </Grid>

        <Divider sx={{ my: 1.5 }} />

        <SectionTitle>Thành viên</SectionTitle>
        {members.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Không có thành viên.
          </Typography>
        )}

        {onlyIdMode && members.length > 0 && (
          <Alert severity="info" sx={{ mb: 1, py: 0.5 }}>
            Backend chưa populate ThanhVien (đang hiển thị ID). Hãy dùng
            populate('ThanhVien').
          </Alert>
        )}

        {!onlyIdMode && members.length > 0 && (
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              overflow: "hidden",
              mb: 1.5,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: "grey.100",
                    "& th": {
                      fontSize: 12,
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>#</TableCell>
                  <TableCell>Mã NV</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Khoa</TableCell>
                  <TableCell>Chức danh</TableCell>
                  <TableCell>Chức vụ</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m, idx) => (
                  <TableRow key={m._id || idx}>
                    <TableCell sx={{ fontSize: 12 }}>{idx + 1}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.MaNhanVien}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.HoTen}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.Khoa}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.ChucDanh}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.ChucVu}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        )}

        {onlyIdMode && members.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1} mb={1.5}>
            {members.map((m) => (
              <Chip
                key={m._id}
                icon={<Profile2User size={16} />}
                label={m._id}
                variant="outlined"
                size="small"
              />
            ))}
          </Stack>
        )}

        <SectionTitle>Tài liệu kèm theo</SectionTitle>
        {documents.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Không có tài liệu.
          </Typography>
        ) : (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {documents.map((d, idx) => (
              <Tooltip title={d} key={idx}>
                <Chip
                  size="small"
                  color="secondary"
                  variant="filled"
                  label={d.length > 32 ? d.slice(0, 29) + "…" : d}
                  component="a"
                  clickable
                  href={/^https?:\/\//.test(d) ? d : undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              </Tooltip>
            ))}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

export default DoanRaView;
