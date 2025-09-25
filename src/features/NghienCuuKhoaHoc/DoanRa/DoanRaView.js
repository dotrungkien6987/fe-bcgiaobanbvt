import React, { useMemo, useEffect, useState } from "react";
import dayjs from "dayjs";
import { useDispatch, useSelector } from "react-redux";
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
  IconButton,
  Skeleton,
  Badge,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  DocumentText,
  Calendar,
  Global,
  Note,
  Profile2User,
  Airplane,
  Document,
  People,
  AttachCircle,
} from "iconsax-react";
import DownloadIcon from "@mui/icons-material/Download";
import VisibilityIcon from "@mui/icons-material/Visibility";
import LaunchIcon from "@mui/icons-material/Launch";
import apiService from "app/apiService";
import { getAllNhanVien } from "features/NhanVien/nhanvienSlice";

const InfoCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main}08 0%, ${theme.palette.secondary.main}05 100%)`,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: 16,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "&:hover": {
    boxShadow: theme.shadows[8],
    transform: "translateY(-2px)",
  },
}));

const SectionCard = styled(Card)(({ theme }) => ({
  borderRadius: 12,
  border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
  background: theme.palette.background.paper,
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
}));

const StyledChip = styled(Chip)(({ theme }) => ({
  borderRadius: 8,
  fontWeight: 500,
  transition: "all 0.2s ease",
  "&:hover": {
    transform: "scale(1.02)",
    boxShadow: theme.shadows[2],
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  borderRadius: 8,
  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  transition: "all 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
    borderColor: theme.palette.primary.main,
    transform: "scale(1.05)",
  },
}));

function FieldItem({ icon, label, value, span = 3 }) {
  if (!value) return null;
  return (
    <Grid item xs={12} md={span}>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          background: (theme) => alpha(theme.palette.primary.main, 0.04),
          border: (theme) =>
            `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
          transition: "all 0.2s ease",
          "&:hover": {
            background: (theme) => alpha(theme.palette.primary.main, 0.08),
            transform: "translateY(-1px)",
          },
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              backgroundColor: (theme) =>
                alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </Box>
          <Box flex={1}>
            <Typography
              variant="caption"
              sx={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: "text.secondary",
                mb: 0.5,
                display: "block",
              }}
            >
              {label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                fontSize: 14,
                fontWeight: 500,
                color: "text.primary",
                wordBreak: "break-word",
                lineHeight: 1.4,
              }}
            >
              {value}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Grid>
  );
}

function SectionTitle({ children, icon }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{ mb: 2, mt: 3 }}
    >
      {icon && (
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {icon}
        </Box>
      )}
      <Typography
        variant="h6"
        sx={{
          fontWeight: 700,
          fontSize: 16,
          color: "text.primary",
          letterSpacing: 0.2,
        }}
      >
        {children}
      </Typography>
      <Divider sx={{ flex: 1, ml: 2 }} />
    </Stack>
  );
}

function DoanRaView({ data, dense = false }) {
  const dispatch = useDispatch();
  const { nhanviens } = useSelector((state) => state.nhanvien) || {
    nhanviens: [],
  };
  const [loadingRemote, setLoadingRemote] = useState(false);
  const [remoteFiles, setRemoteFiles] = useState([]); // danh sách file lấy từ API khi không có Attachments embed
  const rawMembers = useMemo(
    () => (Array.isArray(data?.ThanhVien) ? data.ThanhVien : []),
    [data]
  );
  const members = useMemo(
    () =>
      rawMembers.map((m) => {
        // m có thể là id cũ, object NhanVien hoặc subdoc { NhanVienId, SoHoChieu }
        const id =
          (m && m.NhanVienId && (m.NhanVienId._id || m.NhanVienId)) ||
          (typeof m === "object" ? m._id || m.id : m);
        let nv = nhanviens?.find?.((n) => n._id === id);
        if (!nv && typeof m === "object") {
          nv = nhanviens?.find?.(
            (n) =>
              (m.MaNhanVien && n.MaNhanVien === m.MaNhanVien) ||
              (m.MaNV && n.MaNV === m.MaNV) ||
              (m.username && n.username === m.username)
          );
        }

        const src =
          nv || (m && m.NhanVienId) || (typeof m === "object" ? m : {});

        const gioiTinh =
          src.GioiTinh === 0
            ? "Nam"
            : src.GioiTinh === 1
            ? "Nữ"
            : src.Sex || "";
        const ngaySinhRaw =
          src.NgaySinh || src.ngaySinh || src.DOB || src.BirthDate;
        const ngaySinh = ngaySinhRaw
          ? dayjs(ngaySinhRaw).format("DD/MM/YYYY")
          : "";
        const chucDanh =
          src.ChucDanh ||
          src.ChucDanhID?.Ten ||
          src.ChucDanhID?.TenChucDanh ||
          "";
        const chucVu =
          src.ChucVu || src.ChucVuID?.Ten || src.ChucVuID?.TenChucVu || "";
        const trinhDo =
          src.TrinhDoChuyenMon ||
          src.TrinhDo ||
          src.TrinhDoID?.Ten ||
          src.TrinhDoChuyenMonID?.Ten ||
          "";
        const danToc =
          src.DanToc || src.DanTocID?.Ten || src.DanTocID?.TenDanToc || "";

        const khoa =
          src.TenKhoa ||
          src.Khoa?.Ten ||
          src.KhoaID?.TenKhoa ||
          src.KhoaID?.Ten ||
          "";

        return {
          _id: id,
          _isIdOnly: !nv && typeof m !== "object",
          HoTen:
            src.HoTen ||
            src.Ten ||
            src.hoTen ||
            src.ten ||
            src.UserName ||
            src.username ||
            "(Không tên)",
          MaNhanVien:
            src.MaNhanVien || src.MaNV || src.maNhanVien || src.username || "",
          Khoa: khoa,
          ChucDanh: chucDanh,
          ChucVu: chucVu,
          TrinhDo: trinhDo,
          DanToc: danToc,
          GioiTinh: gioiTinh,
          NgaySinh: ngaySinh,
          DangVien: src.isDangVien === true,
          SoHoChieu: m?.SoHoChieu || src.SoHoChieu || "",
        };
      }),
    [rawMembers, nhanviens]
  );
  const onlyIdMode = members.every((m) => m._isIdOnly);

  // Chuẩn hóa danh sách tài liệu đính kèm: ưu tiên field mới Attachments (object array), fallback TaiLieuKemTheo (string array legacy)
  const attachments = useMemo(() => {
    // Field mới Attachments: có thể là array object hoặc (hiếm) array string
    if (Array.isArray(data?.Attachments) && data.Attachments.length) {
      return data.Attachments.map((a) => {
        if (typeof a === "string") {
          return {
            url: a,
            fileName: a.split("/").pop() || "Tài liệu",
            legacy: true,
          };
        }
        return {
          url: a.url || "",
          fileName:
            a.fileName ||
            a.name ||
            (a.url ? a.url.split("/").pop() : "Tài liệu"),
          publicId: a.publicId,
          mimeType: a.mimeType,
          size: a.size,
          legacy: false,
        };
      });
    }
    // Fallback legacy TaiLieuKemTheo: array string
    if (Array.isArray(data?.TaiLieuKemTheo) && data.TaiLieuKemTheo.length) {
      return data.TaiLieuKemTheo.map((s) => ({
        url: s,
        fileName: s.split("/").pop() || "Tài liệu",
        legacy: true,
      }));
    }
    return [];
  }, [data]);

  // Nếu document không embed Attachments/TaiLieuKemTheo, ta lazy-fetch từ API attachments
  useEffect(() => {
    let ignore = false;
    const fetchFiles = async () => {
      if (!data?._id) return;
      setLoadingRemote(true);
      try {
        const res = await apiService.get(
          `/attachments/DoanRa/${data._id}/file/files`,
          { params: { size: 50 } }
        );
        if (ignore) return;
        const list =
          res?.data?.data?.items ||
          res?.data?.data ||
          res?.data?.items ||
          res?.data ||
          [];
        setRemoteFiles(Array.isArray(list) ? list : []);
      } catch (e) {
        if (!ignore) setRemoteFiles([]);
      } finally {
        if (!ignore) setLoadingRemote(false);
      }
    };
    if (attachments.length === 0 && data?._id) {
      fetchFiles();
    } else {
      setRemoteFiles([]);
    }
    return () => {
      ignore = true;
    };
  }, [attachments.length, data?._id]);

  // Lazy load danh sách nhân viên đầy đủ nếu chưa có trong store để điền đủ thông tin thành viên
  useEffect(() => {
    try {
      if (!nhanviens || nhanviens.length === 0) {
        dispatch(getAllNhanVien());
      }
    } catch (e) {
      // silent
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);

  const previewFile = async (fileId) => {
    try {
      const res = await apiService.get(`/attachments/files/${fileId}/inline`, {
        responseType: "blob",
      });
      const url = URL.createObjectURL(res.data);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (e) {
      // silent
    }
  };

  const downloadFile = async (fileId, filename = "download") => {
    try {
      const res = await apiService.get(
        `/attachments/files/${fileId}/download`,
        { responseType: "blob" }
      );
      const blobUrl = URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000);
    } catch (e) {
      // silent
    }
  };

  if (!data) return null;

  return (
    <InfoCard
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
        background: (theme) =>
          `linear-gradient(135deg, ${alpha(
            theme.palette.primary.main,
            0.02
          )} 0%, ${alpha(theme.palette.secondary.main, 0.01)} 100%)`,
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header Section */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
          sx={{
            mb: 3,
            p: 2,
            borderRadius: 2,
            background: (theme) => alpha(theme.palette.primary.main, 0.05),
            border: (theme) =>
              `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          }}
        >
          <Badge
            badgeContent={
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: "success.main",
                  border: "2px solid white",
                }}
              />
            }
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Avatar
              variant="rounded"
              sx={{
                width: 56,
                height: 56,
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                boxShadow: 3,
              }}
            >
              <Airplane size={32} color="white" variant="Bold" />
            </Avatar>
          </Badge>

          <Box flex={1}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                lineHeight: 1.2,
                mb: 1,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Chi tiết Đoàn Ra
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              flexWrap="wrap"
              alignItems="center"
            >
              {data.SoVanBanChoPhep && (
                <StyledChip
                  size="small"
                  label={`Số VB: ${data.SoVanBanChoPhep}`}
                  color="primary"
                  variant="outlined"
                  icon={<Document size={16} />}
                />
              )}
              {data.QuocGiaDen && (
                <StyledChip
                  size="small"
                  label={data.QuocGiaDen}
                  color="secondary"
                  variant="outlined"
                  icon={<Global size={16} />}
                />
              )}
            </Stack>
          </Box>

          <Box>
            <ActionButton
              component={Link}
              href={`/doandi/${data._id}`}
              sx={{
                textDecoration: "none",
                color: "primary.main",
                p: 1.5,
              }}
            >
              <LaunchIcon fontSize="small" />
            </ActionButton>
          </Box>
        </Stack>

        <Grid container spacing={3} sx={{ mb: 2 }}>
          <FieldItem
            icon={<Document size={18} />}
            label="Số văn bản cho phép"
            value={data.SoVanBanChoPhep}
          />
          <FieldItem
            icon={<Calendar size={18} />}
            label="Ngày ký"
            value={data.NgayKyVanBanFormatted || data.NgayKyVanBan}
          />
          <FieldItem
            icon={<Calendar size={18} />}
            label="Thời gian xuất cảnh"
            value={
              data?.TuNgay || data?.DenNgay
                ? `${require("utils/formatTime").formatDate_getDate(
                    data?.TuNgay
                  )} - ${require("utils/formatTime").formatDate_getDate(
                    data?.DenNgay
                  )}`
                : data.ThoiGianXuatCanhFormatted || data.ThoiGianXuatCanh || ""
            }
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
          {data.NguonKinhPhi && (
            <FieldItem
              icon={<DocumentText size={18} />}
              label="Nguồn kinh phí"
              value={data.NguonKinhPhi}
              span={12}
            />
          )}
          {/* Trường BaoCao đã bỏ */}
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

        <SectionTitle icon={<People size={20} />}>Thành viên</SectionTitle>
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
          <SectionCard sx={{ overflow: "hidden" }}>
            <Table size="small">
              <TableHead>
                <TableRow
                  sx={{
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    "& th": {
                      fontSize: 12,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      color: "primary.main",
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                      py: 1.5,
                    },
                  }}
                >
                  <TableCell>#</TableCell>
                  <TableCell>Mã NV</TableCell>
                  <TableCell>Họ tên</TableCell>
                  <TableCell>Khoa</TableCell>
                  <TableCell>Chức danh</TableCell>
                  <TableCell>Chức vụ</TableCell>
                  <TableCell>Đảng viên</TableCell>
                  <TableCell>Trình độ</TableCell>
                  <TableCell>Dân tộc</TableCell>
                  <TableCell>Giới tính</TableCell>
                  <TableCell>Ngày sinh</TableCell>
                  <TableCell>Số hộ chiếu</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {members.map((m, idx) => (
                  <TableRow
                    key={m._id || idx}
                    sx={{
                      "&:hover": {
                        backgroundColor: (theme) =>
                          alpha(theme.palette.primary.main, 0.04),
                      },
                      "& td": {
                        py: 1.5,
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                        verticalAlign: "top",
                        lineHeight: 1.4,
                        borderColor: (theme) =>
                          alpha(theme.palette.divider, 0.5),
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "primary.main",
                      }}
                    >
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 500 }}>
                      {m.MaNhanVien}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>
                      {m.HoTen}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.Khoa}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.ChucDanh}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.ChucVu}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {m.DangVien ? "Đảng viên" : ""}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.TrinhDo}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.DanToc}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.GioiTinh}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.NgaySinh}</TableCell>
                    <TableCell sx={{ fontSize: 12 }}>{m.SoHoChieu}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </SectionCard>
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

        <SectionTitle icon={<AttachCircle size={20} />}>
          Tài liệu kèm theo
        </SectionTitle>
        {attachments.length > 0 ? (
          <Stack direction="row" flexWrap="wrap" gap={1.5}>
            {attachments.map((f, idx) => (
              <Tooltip title={f.fileName} key={f.publicId || f.url || idx}>
                <StyledChip
                  size="medium"
                  color={f.legacy ? "default" : "secondary"}
                  variant="outlined"
                  label={
                    f.fileName && f.fileName.length > 38
                      ? f.fileName.slice(0, 35) + "…"
                      : f.fileName || "Tài liệu"
                  }
                  icon={<Document size={16} />}
                  component={/^https?:\/\//.test(f.url) ? "a" : "div"}
                  clickable={/^https?:\/\//.test(f.url)}
                  href={/^https?:\/\//.test(f.url) ? f.url : undefined}
                  target={/^https?:\/\//.test(f.url) ? "_blank" : undefined}
                  rel={
                    /^https?:\/\//.test(f.url)
                      ? "noopener noreferrer"
                      : undefined
                  }
                />
              </Tooltip>
            ))}
          </Stack>
        ) : loadingRemote ? (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Skeleton
              variant="rectangular"
              width={120}
              height={32}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width={100}
              height={32}
              sx={{ borderRadius: 1 }}
            />
            <Skeleton
              variant="rectangular"
              width={140}
              height={32}
              sx={{ borderRadius: 1 }}
            />
          </Box>
        ) : remoteFiles.length === 0 ? (
          <Box
            sx={{
              textAlign: "center",
              py: 3,
              color: "text.secondary",
              backgroundColor: (theme) => alpha(theme.palette.grey[500], 0.05),
              borderRadius: 2,
              border: (theme) =>
                `1px dashed ${alpha(theme.palette.grey[500], 0.3)}`,
            }}
          >
            <AttachCircle size={32} style={{ opacity: 0.5, marginBottom: 8 }} />
            <Typography variant="body2">Không có tài liệu.</Typography>
          </Box>
        ) : (
          <Stack direction="column" spacing={1.5}>
            {remoteFiles.map((f) => {
              const name =
                f.TenGoc || f.TenFile || f.fileName || f.originalName || "Tệp";
              const short = name.length > 48 ? name.slice(0, 40) + "…" : name;
              return (
                <SectionCard
                  key={f._id}
                  sx={{
                    p: 2,
                    transition: "all 0.2s ease",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        backgroundColor: (theme) =>
                          alpha(theme.palette.secondary.main, 0.12),
                        color: "secondary.main",
                      }}
                    >
                      <Document size={20} />
                    </Box>

                    <Box flex={1}>
                      <Tooltip title={name}>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 600,
                            cursor: "pointer",
                            "&:hover": { color: "primary.main" },
                          }}
                          onClick={() => previewFile(f._id)}
                        >
                          {short}
                        </Typography>
                      </Tooltip>
                      <Typography variant="caption" color="text.secondary">
                        Nhấp để xem trước
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Tooltip title="Xem trước">
                        <ActionButton
                          size="small"
                          onClick={() => previewFile(f._id)}
                          color="primary"
                        >
                          <VisibilityIcon fontSize="small" />
                        </ActionButton>
                      </Tooltip>
                      <Tooltip title="Tải xuống">
                        <ActionButton
                          size="small"
                          onClick={() => downloadFile(f._id, name)}
                          color="secondary"
                        >
                          <DownloadIcon fontSize="small" />
                        </ActionButton>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </SectionCard>
              );
            })}
          </Stack>
        )}
      </CardContent>
    </InfoCard>
  );
}

export default DoanRaView;
