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
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  PlayArrow as PlayArrowIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import dayjs from "dayjs";
import { getStatusText } from "../../../../../utils/congViecUtils";
import OpenTaskInNewTabButton from "../../../../../components/OpenTaskInNewTabButton";

/**
 * Compact collapsible card for displaying task summary
 * @param {String} title - Card title (e.g., "Công việc khác")
 * @param {String} icon - Emoji icon (e.g., "📦")
 * @param {String} color - Theme color key (e.g., "warning.main")
 * @param {Number} total - Total task count
 * @param {Number} completed - Completed task count
 * @param {Number} late - Late task count
 * @param {Number} active - Active task count
 * @param {Array} tasks - Task list array
 * @param {Function} onViewTask - Callback when clicking view button (opens dialog)
 * @param {Function} onOpenNewTab - Callback when clicking new tab button
 * @param {Boolean} isLoading - Loading state
 * @param {String} error - Error message
 * @param {Boolean} showNguoiChinh - Show "Người chính" column (for collab tasks)
 */
const CongViecCompactCard = ({
  title,
  icon,
  color = "primary.main",
  total = 0,
  completed = 0,
  late = 0,
  active = 0,
  tasks = [],
  onViewTask,
  onOpenNewTab,
  isLoading = false,
  error = null,
  showNguoiChinh = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const formatDate = (date) => (date ? dayjs(date).format("DD/MM") : "—");

  // Auto-collapse when no data
  useEffect(() => {
    if (total === 0 && expanded) {
      setExpanded(false);
    }
  }, [total, expanded]);

  // Helper function to get status icon and color
  const getStatusIcon = (task) => {
    if (task.TrangThai === "HOAN_THANH") {
      return { icon: "✓", color: "success.main" };
    }
    if (
      task.HoanThanhTreHan ||
      (task.SoGioTre > 0 && task.TrangThai !== "HOAN_THANH")
    ) {
      return { icon: "!", color: "error.main" };
    }
    if (task.TrangThai === "DANG_THUC_HIEN") {
      return { icon: "▶", color: "info.main" };
    }
    return { icon: "○", color: "grey.400" };
  };

  // Helper function to get status chip color
  const getStatusChipColor = (status) => {
    switch (status) {
      case "HOAN_THANH":
        return "success";
      case "DANG_THUC_HIEN":
        return "info";
      case "DANG_REVIEW":
        return "warning";
      default:
        return "default";
    }
  };

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
                icon={<WorkIcon fontSize="small" />}
                sx={{ fontWeight: 600 }}
              />
              {completed > 0 && (
                <Chip
                  label={completed}
                  size="small"
                  color="success"
                  icon={<CheckCircleIcon fontSize="small" />}
                />
              )}
              {late > 0 && (
                <Chip
                  label={late}
                  size="small"
                  color="error"
                  icon={<WarningIcon fontSize="small" />}
                />
              )}
              {active > 0 && (
                <Chip
                  label={active}
                  size="small"
                  color="info"
                  icon={<PlayArrowIcon fontSize="small" />}
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

          {/* Empty State - Improved */}
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
                Không có công việc nào
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title === "Công việc khác"
                  ? "Bạn không có công việc nào ngoài nhiệm vụ thường quy"
                  : "Bạn không phối hợp công việc nào trong chu kỳ này"}
              </Typography>
            </Box>
          )}

          {/* Has Data - NEW MINIMAL TABLE */}
          {!isLoading && !error && total > 0 && (
            <>
              {/* Minimal Task Table - 4 Columns */}
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
                          Công việc
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
                          Hạn
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
                    {tasks.slice(0, 10).map((task) => {
                      const statusInfo = getStatusIcon(task);
                      const isOverdue =
                        dayjs(task.NgayHetHan).isBefore(dayjs(), "day") &&
                        task.TrangThai !== "HOAN_THANH";

                      return (
                        <TableRow
                          key={task._id}
                          hover
                          sx={{
                            cursor: "pointer",
                            "&:hover": {
                              bgcolor: "action.hover",
                            },
                          }}
                          onClick={() => onViewTask?.(task._id)}
                        >
                          {/* Column 1: Tiêu đề & Info */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="flex-start"
                            >
                              {/* Status Icon */}
                              <Box
                                sx={{
                                  width: 20,
                                  height: 20,
                                  minWidth: 20,
                                  borderRadius: "50%",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  bgcolor: statusInfo.color,
                                  color: "white",
                                  fontSize: 11,
                                  fontWeight: 700,
                                  mt: 0.3,
                                }}
                              >
                                {statusInfo.icon}
                              </Box>

                              {/* Tiêu đề + Meta */}
                              <Box flex={1} minWidth={0}>
                                <Typography
                                  variant="body2"
                                  fontWeight={600}
                                  sx={{
                                    color:
                                      task.TrangThai === "HOAN_THANH"
                                        ? "text.secondary"
                                        : "text.primary",
                                    textDecoration:
                                      task.TrangThai === "HOAN_THANH"
                                        ? "line-through"
                                        : "none",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    lineHeight: 1.4,
                                  }}
                                >
                                  {task.TieuDe}
                                </Typography>
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  alignItems="center"
                                  flexWrap="wrap"
                                  mt={0.5}
                                >
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {task.MaCongViec}
                                  </Typography>
                                  {task.SoGioTre > 0 && (
                                    <>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        •
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        color="error.main"
                                        fontWeight={600}
                                      >
                                        Trễ {task.SoGioTre}h
                                      </Typography>
                                    </>
                                  )}
                                  {showNguoiChinh && task.NguoiChinhProfile && (
                                    <>
                                      <Typography
                                        variant="caption"
                                        color="text.secondary"
                                      >
                                        •
                                      </Typography>
                                      <Chip
                                        label={task.NguoiChinhProfile.Ten}
                                        size="small"
                                        variant="outlined"
                                        sx={{
                                          height: 18,
                                          fontSize: 10,
                                          "& .MuiChip-label": { px: 1 },
                                        }}
                                      />
                                    </>
                                  )}
                                </Stack>
                              </Box>
                            </Stack>
                          </TableCell>

                          {/* Column 2: Trạng thái - Compact Chip */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Chip
                              label={getStatusText(task.TrangThai)}
                              size="small"
                              color={getStatusChipColor(task.TrangThai)}
                              sx={{
                                height: 24,
                                fontSize: 11,
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>

                          {/* Column 3: Hạn chót - Compact Date */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography
                              variant="caption"
                              color={
                                isOverdue ? "error.main" : "text.secondary"
                              }
                              fontWeight={isOverdue ? 600 : 400}
                            >
                              {formatDate(task.NgayHetHan)}
                            </Typography>
                          </TableCell>

                          {/* Column 4: Actions - Icon Buttons */}
                          <TableCell align="center" sx={{ py: 1.5 }}>
                            <OpenTaskInNewTabButton
                              taskId={task._id}
                              size="small"
                              onClick={(taskId) => {
                                onOpenNewTab?.(taskId);
                              }}
                              sx={{
                                width: 28,
                                height: 28,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Footer - View All Button */}
              {tasks.length > 10 && (
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
                    Hiển thị 10 trong {tasks.length} công việc
                  </Typography>
                  <Button
                    size="small"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => {
                      console.log("View all tasks");
                      // TODO: Navigate to full work list page with filters
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

export default CongViecCompactCard;
