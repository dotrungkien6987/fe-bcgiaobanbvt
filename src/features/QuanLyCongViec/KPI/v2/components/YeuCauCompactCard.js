import React, { useState, useEffect } from "react";
import {
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  Divider,
  Stack,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Box,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Button,
  Skeleton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ConfirmationNumber as TicketIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ArrowForward as ArrowForwardIcon,
  OpenInNew as OpenInNewIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";

/**
 * Compact collapsible card for displaying YeuCau (Request) summary
 * @param {String} title - Card title (e.g., "Yêu cầu khác")
 * @param {String} icon - Emoji icon (e.g., "🎫")
 * @param {String} color - Theme color key (e.g., "info.main")
 * @param {Number} total - Total request count
 * @param {Number} completed - Completed request count
 * @param {Number} avgRating - Average rating (0-5)
 * @param {Array} yeuCau - YeuCau list array
 * @param {Function} onViewYeuCau - Callback when clicking view button
 * @param {Boolean} isLoading - Loading state
 * @param {String} error - Error message
 */
const YeuCauCompactCard = ({
  title,
  icon,
  color = "info.main",
  total = 0,
  completed = 0,
  avgRating = 0,
  yeuCau = [],
  onViewYeuCau,
  isLoading = false,
  error = null,
}) => {
  const [expanded, setExpanded] = useState(false);

  // Auto-collapse when no data
  useEffect(() => {
    if (total === 0 && expanded) {
      setExpanded(false);
    }
  }, [total, expanded]);

  // Helper function to get status chip color
  const getStatusChipColor = (trangThai) => {
    switch (trangThai) {
      case "HOAN_THANH":
        return "success";
      case "DANG_XU_LY":
        return "info";
      case "DA_TIEP_NHAN":
        return "warning";
      case "QUA_HAN":
        return "error";
      default:
        return "default";
    }
  };

  // Helper function to get status text
  const getStatusText = (trangThai) => {
    switch (trangThai) {
      case "MOI_TAO":
        return "Mới tạo";
      case "DA_TIEP_NHAN":
        return "Đã tiếp nhận";
      case "DANG_XU_LY":
        return "Đang xử lý";
      case "HOAN_THANH":
        return "Hoàn thành";
      case "TU_CHOI":
        return "Từ chối";
      case "QUA_HAN":
        return "Quá hạn";
      default:
        return trangThai;
    }
  };

  // Helper function to render rating stars
  const renderStars = (rating) => {
    if (!rating || rating === 0) return "—";
    const fullStars = Math.floor(rating);

    return (
      <Stack direction="row" spacing={0.25} alignItems="center">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            sx={{
              fontSize: 14,
              color: i < fullStars ? "warning.main" : "grey.300",
            }}
          />
        ))}
        <Typography variant="caption" color="text.secondary" ml={0.5}>
          ({rating.toFixed(1)})
        </Typography>
      </Stack>
    );
  };

  // Calculate completion percentage
  const completionPercentage =
    total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <Card
      sx={{
        mb: 2,
        border: expanded ? 2 : 1,
        borderColor: expanded ? color : "divider",
        transition: "all 0.3s ease",
      }}
    >
      {/* ========== COLLAPSED HEADER ========== */}
      <CardActionArea
        onClick={() => !isLoading && setExpanded(!expanded)}
        sx={{
          p: 2,
          "&:hover": {
            bgcolor: "action.hover",
          },
        }}
        disabled={isLoading}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {/* Icon Avatar */}
          <Avatar
            sx={{
              bgcolor: color,
              width: 40,
              height: 40,
            }}
          >
            {icon}
          </Avatar>

          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              fontWeight: 600,
            }}
          >
            {title}
          </Typography>

          {/* Summary Badges */}
          {!isLoading && (
            <>
              <Chip
                label={total}
                size="small"
                variant="outlined"
                icon={<TicketIcon fontSize="small" />}
                sx={{ fontWeight: 600 }}
              />
              {completed > 0 && (
                <Chip
                  label={`${completed} ✓ ${completionPercentage}%`}
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon fontSize="small" />}
                />
              )}
              {avgRating > 0 && (
                <Chip
                  label={`⭐ ${avgRating.toFixed(1)}/5`}
                  size="small"
                  color="warning"
                  icon={<StarIcon fontSize="small" />}
                />
              )}
            </>
          )}

          {/* Loading indicator */}
          {isLoading && <CircularProgress size={24} />}

          {/* Expand Icon */}
          <IconButton size="small" sx={{ pointerEvents: "none" }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Stack>
      </CardActionArea>

      {/* ========== EXPANDED CONTENT ========== */}
      <Collapse in={expanded} timeout={300}>
        <Divider />
        <CardContent>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State with Skeleton */}
          {isLoading && (
            <Stack spacing={1}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rectangular" height={50} />
              ))}
            </Stack>
          )}

          {/* Empty State */}
          {!isLoading && !error && total === 0 && (
            <Box textAlign="center" py={4}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  bgcolor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mx: "auto",
                  mb: 2,
                }}
              >
                <CheckCircleOutlineIcon
                  sx={{ fontSize: 32, color: "success.main" }}
                />
              </Box>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Không có yêu cầu khác nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Các yêu cầu không liên kết với nhiệm vụ thường quy sẽ hiển thị ở
                đây
              </Typography>
            </Box>
          )}

          {/* Has Data - Minimal Table */}
          {!isLoading && !error && total > 0 && (
            <>
              {/* Minimal YeuCau Table - 4 Columns */}
              <TableContainer sx={{ maxHeight: 350 }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width="55%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Yêu cầu
                        </Typography>
                      </TableCell>
                      <TableCell width="20%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Trạng thái
                        </Typography>
                      </TableCell>
                      <TableCell width="15%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Đánh giá
                        </Typography>
                      </TableCell>
                      <TableCell width="10%" align="center" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          •••
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {yeuCau.slice(0, 10).map((item) => {
                      const isCompleted = item.TrangThai === "HOAN_THANH";

                      return (
                        <TableRow
                          key={item._id}
                          hover
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                          onClick={() => onViewYeuCau?.(item._id)}
                        >
                          {/* Column 1: Tiêu đề & Info */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Box>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                sx={{
                                  color: isCompleted
                                    ? "text.secondary"
                                    : "text.primary",
                                  textDecoration: isCompleted
                                    ? "line-through"
                                    : "none",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  lineHeight: 1.4,
                                }}
                              >
                                {item.TieuDe}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", mt: 0.5 }}
                              >
                                {item.MaYeuCau}
                              </Typography>
                            </Box>
                          </TableCell>

                          {/* Column 2: Trạng thái - Compact Chip */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              label={getStatusText(item.TrangThai)}
                              size="small"
                              color={getStatusChipColor(item.TrangThai)}
                              sx={{
                                height: 24,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          {/* Column 3: Đánh giá - Star Rating */}
                          <TableCell sx={{ py: 1.5 }}>
                            {renderStars(item.DanhGia)}
                          </TableCell>

                          {/* Column 4: Actions - Icon Button */}
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(`/ticket/${item._id}`, "_blank");
                              }}
                              sx={{
                                width: 28,
                                height: 28,
                              }}
                            >
                              <OpenInNewIcon sx={{ fontSize: 18 }} />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer - View All Button */}
              {yeuCau.length > 10 && (
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Hiển thị 10 trong {yeuCau.length} yêu cầu
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Navigate to full YeuCau list page with filters
                      console.log("View all YeuCau");
                    }}
                    sx={{
                      textTransform: "none",
                      fontWeight: 600,
                    }}
                  >
                    Xem tất cả
                  </Button>
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default YeuCauCompactCard;
