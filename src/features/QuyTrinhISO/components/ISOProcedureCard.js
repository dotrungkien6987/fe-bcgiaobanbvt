import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import { Eye, DocumentDownload, Building, Calendar } from "iconsax-react";
import dayjs from "dayjs";

/**
 * Color schemes for different card states
 */
const CARD_STYLES = {
  new: {
    gradient:
      "linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(255, 255, 255, 1) 100%)",
    border: "#66bb6a",
    accentColor: "#2e7d32",
  },
  default: {
    gradient:
      "linear-gradient(135deg, rgba(25, 118, 210, 0.04) 0%, rgba(255, 255, 255, 1) 100%)",
    border: "#42a5f5",
    accentColor: "#1565c0",
  },
};

/**
 * ISOProcedureCard - Mobile-optimized card for ISO procedure display
 *
 * @param {Object} props
 * @param {Object} props.quyTrinh - Procedure data
 * @param {Function} props.onViewPDF - Callback when "Xem PDF" clicked
 * @param {Function} props.onDownload - Callback when "Tải về" clicked
 * @param {boolean} props.showDistributionDate - Show NgayPhanPhoi (for DistributedToMe)
 * @param {boolean} props.showDistributionCount - Show number of distributed departments
 */
function ISOProcedureCard({
  quyTrinh,
  onViewPDF,
  onDownload,
  showDistributionDate = false,
  showDistributionCount = false,
}) {
  const {
    MaQuyTrinh,
    TenQuyTrinh,
    PhienBan,
    KhoaXayDungID,
    NgayPhanPhoi,
    isNew,
    FilePDF,
    FileWord,
    soKhoaPhanPhoi,
  } = quyTrinh;

  const hasFiles = FilePDF || FileWord;

  const handleViewPDF = () => {
    if (FilePDF) {
      onViewPDF(FilePDF);
    }
  };

  const handleDownload = () => {
    onDownload(quyTrinh);
  };

  // Format file size
  const formatSize = (bytes) => {
    if (!bytes) return "";
    const mb = bytes / 1024 / 1024;
    if (mb >= 1) return `${mb.toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        background: isNew
          ? CARD_STYLES.new.gradient
          : CARD_STYLES.default.gradient,
        borderLeft: "4px solid",
        borderLeftColor: isNew
          ? CARD_STYLES.new.border
          : CARD_STYLES.default.border,
        "&:hover": {
          boxShadow: "0 6px 20px rgba(0,0,0,0.15)",
          transform: "translateY(-2px)",
        },
        transition: "all 0.2s ease-in-out",
      }}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header: Mã + Version + Date/Badge */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{
                color: isNew
                  ? CARD_STYLES.new.accentColor
                  : CARD_STYLES.default.accentColor,
              }}
            >
              📄 {MaQuyTrinh}
            </Typography>
            <Chip
              label={`v${PhienBan}`}
              size="small"
              color="default"
              sx={{
                height: 22,
                fontSize: "0.75rem",
                fontWeight: 600,
              }}
            />
            {isNew && (
              <Chip
                label="✨ Mới"
                size="small"
                sx={{
                  height: 22,
                  fontSize: "0.72rem",
                  fontWeight: 700,
                  bgcolor: CARD_STYLES.new.border,
                  color: "white",
                  "& .MuiChip-label": {
                    px: 1.5,
                  },
                }}
              />
            )}
          </Stack>

          {/* Date or Distribution Count */}
          {showDistributionDate && NgayPhanPhoi && (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Calendar size={14} color="#666" />
              <Typography variant="caption" color="text.secondary">
                {dayjs(NgayPhanPhoi).format("DD/MM/YYYY")}
              </Typography>
            </Stack>
          )}

          {showDistributionCount && soKhoaPhanPhoi > 0 && (
            <Chip
              label={`${soKhoaPhanPhoi} khoa`}
              size="small"
              variant="outlined"
              color="info"
              sx={{ height: 22, fontSize: "0.7rem" }}
            />
          )}
        </Stack>

        {/* Title */}
        <Typography
          variant="body1"
          fontWeight={500}
          sx={{
            mb: 1,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            lineHeight: 1.4,
          }}
        >
          {TenQuyTrinh}
        </Typography>

        {/* Department */}
        <Stack direction="row" spacing={0.5} alignItems="center" mb={2}>
          <Building size={14} color="#666" />
          <Typography variant="body2" color="text.secondary">
            {KhoaXayDungID?.TenKhoa || "Không xác định"}
          </Typography>
          {FilePDF && (
            <Typography variant="caption" color="text.disabled" sx={{ ml: 1 }}>
              • {formatSize(FilePDF.KichThuoc)}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<Eye size={18} />}
            onClick={handleViewPDF}
            disabled={!FilePDF}
            sx={{
              flex: 1,
              height: 44,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              bgcolor: isNew
                ? CARD_STYLES.new.border
                : CARD_STYLES.default.border,
              "&:hover": {
                bgcolor: isNew
                  ? CARD_STYLES.new.accentColor
                  : CARD_STYLES.default.accentColor,
              },
            }}
          >
            Xem PDF
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DocumentDownload size={18} />}
            onClick={handleDownload}
            disabled={!hasFiles}
            sx={{
              flex: 1,
              height: 44,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
            }}
          >
            Tải về
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default ISOProcedureCard;
