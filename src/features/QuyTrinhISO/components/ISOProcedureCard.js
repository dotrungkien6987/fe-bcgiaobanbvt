import {
  Box,
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
import ISOStatusChip from "./ISOStatusChip";
import { FILE_TYPE } from "../theme/isoTokens";

/**
 * Color schemes for different card states
 */
const CARD_STYLES = {
  new: {
    gradient:
      "linear-gradient(135deg, rgba(46,125,50,0.07) 0%, rgba(255,255,255,1) 100%)",
    border: "#66bb6a",
    accentColor: "#2e7d32",
    hoverBg: "#1b5e20",
  },
  default: {
    gradient:
      "linear-gradient(135deg, rgba(21,101,192,0.05) 0%, rgba(255,255,255,1) 100%)",
    border: "#1976d2",
    accentColor: "#1565c0",
    hoverBg: "#0d47a1",
  },
};

/**
 * ISOProcedureCard - Mobile-optimized card for ISO procedure display
 *
 * @param {Object}   props
 * @param {Object}   props.quyTrinh
 * @param {Function} props.onViewPDF
 * @param {Function} props.onDownload
 * @param {Function} [props.onViewDetail]        - Navigate to detail page
 * @param {boolean}  [props.showDistributionDate]
 * @param {boolean}  [props.showDistributionCount]
 * @param {boolean}  [props.showStatus]           - Show TrangThai chip
 * @param {'standard'|'distribution'|'builtbyme'} [props.variant]
 */
function ISOProcedureCard({
  quyTrinh,
  onViewPDF,
  onDownload,
  onViewDetail,
  showDistributionDate = false,
  showDistributionCount = false,
  showStatus = false,
  variant = "standard",
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
    TrangThai,
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
        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        background: isNew
          ? CARD_STYLES.new.gradient
          : CARD_STYLES.default.gradient,
        borderLeft: "4px solid",
        borderLeftColor: isNew
          ? CARD_STYLES.new.border
          : CARD_STYLES.default.border,
        cursor: onViewDetail ? "pointer" : "default",
        "&:hover": {
          boxShadow: "0 6px 20px rgba(0,0,0,0.13)",
          transform: "translateY(-2px)",
        },
        transition: "all 0.2s ease-in-out",
      }}
      onClick={onViewDetail ? () => onViewDetail(quyTrinh._id) : undefined}
    >
      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
        {/* Header: Mã + Version + Badges + Date/Status */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={1.5}
        >
          <Stack
            direction="row"
            spacing={0.75}
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
              {MaQuyTrinh}
            </Typography>
            <Chip
              label={`v${PhienBan}`}
              size="small"
              color="default"
              sx={{
                height: 20,
                fontSize: "0.72rem",
                fontWeight: 700,
              }}
            />
            {isNew && (
              <Chip
                label="Mới"
                size="small"
                color="success"
                sx={{ height: 20, fontSize: "0.7rem", fontWeight: 700 }}
              />
            )}
            {/* File type badges */}
            {FilePDF && (
              <Chip
                label="PDF"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  bgcolor: FILE_TYPE.pdf.lightBg,
                  color: FILE_TYPE.pdf.color,
                  fontWeight: 600,
                }}
              />
            )}
            {FileWord && (
              <Chip
                label="Word"
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.68rem",
                  bgcolor: FILE_TYPE.word.lightBg,
                  color: FILE_TYPE.word.color,
                  fontWeight: 600,
                }}
              />
            )}
          </Stack>

          {/* Right side: status / date / distribution count */}
          <Box sx={{ flexShrink: 0, ml: 1 }}>
            {showStatus && TrangThai && (
              <ISOStatusChip status={TrangThai} size="small" />
            )}
            {showDistributionDate && NgayPhanPhoi && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <Calendar size={13} color="#888" />
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
                sx={{ height: 20, fontSize: "0.68rem" }}
              />
            )}
          </Box>
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

        {/* Department + file size */}
        <Stack direction="row" spacing={0.5} alignItems="center" mb={2}>
          <Building size={13} color="#888" />
          <Typography variant="body2" color="text.secondary" noWrap>
            {KhoaXayDungID?.TenKhoa || "Không xác định"}
          </Typography>
          {FilePDF && (
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ ml: 0.5, flexShrink: 0 }}
            >
              • {formatSize(FilePDF.KichThuoc)}
            </Typography>
          )}
        </Stack>

        <Divider sx={{ mb: 2 }} />

        {/* Action Buttons */}
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            startIcon={<Eye size={17} />}
            onClick={(e) => {
              e.stopPropagation();
              handleViewPDF();
            }}
            disabled={!FilePDF}
            sx={{
              flex: 1,
              height: 44,
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              bgcolor: isNew
                ? CARD_STYLES.new.accentColor
                : CARD_STYLES.default.accentColor,
              "&:hover": {
                bgcolor: isNew
                  ? CARD_STYLES.new.hoverBg
                  : CARD_STYLES.default.hoverBg,
              },
            }}
          >
            Xem PDF
          </Button>
          <Button
            variant="outlined"
            color="inherit"
            startIcon={<DocumentDownload size={17} />}
            onClick={(e) => {
              e.stopPropagation();
              handleDownload();
            }}
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
