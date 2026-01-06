import React, { useState, useEffect, useMemo } from "react";
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
  ButtonGroup,
  TablePagination,
  Tooltip,
  LinearProgress,
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
  // ✨ NEW: Filter state
  const [filterStatus, setFilterStatus] = useState("all");
  // ✨ NEW: Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Format date with tooltip showing full date
  const formatDateWithTooltip = (date) => {
    if (!date) return "—";
    const shortDate = dayjs(date).format("DD/MM");
    const fullDate = dayjs(date).format("DD/MM/YYYY HH:mm");
    return (
      <Tooltip title={fullDate} arrow>
        <span>{shortDate}</span>
      </Tooltip>
    );
  };

  // ✨ NEW: Filter tasks by status
  const filteredTasks = useMemo(() => {
    if (filterStatus === "all") return tasks;
    if (filterStatus === "late")
      return tasks.filter(
        (t) => t.SoGioTre > 0 && t.TrangThai !== "HOAN_THANH"
      );
    if (filterStatus === "active")
      return tasks.filter((t) => t.TrangThai === "DANG_THUC_HIEN");
    if (filterStatus === "completed")
      return tasks.filter((t) => t.TrangThai === "HOAN_THANH");
    return tasks;
  }, [tasks, filterStatus]);

  // ✨ NEW: Paginated tasks
  const paginatedTasks = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredTasks.slice(start, start + rowsPerPage);
  }, [filteredTasks, page, rowsPerPage]);

  // ✨ NEW: Filter counts
  const filterCounts = useMemo(
    () => ({
      all: tasks.length,
      late: tasks.filter((t) => t.SoGioTre > 0 && t.TrangThai !== "HOAN_THANH")
        .length,
      active: tasks.filter((t) => t.TrangThai === "DANG_THUC_HIEN").length,
      completed: tasks.filter((t) => t.TrangThai === "HOAN_THANH").length,
    }),
    [tasks]
  );

  // Reset page when filter changes
  useEffect(() => {
    setPage(0);
  }, [filterStatus]);

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
                  ? "Bạn không có công việc nào ngoài các nhiệm vụ thường quy đã gán"
                  : title === "Công việc gán NVTQ chu kỳ cũ"
                  ? "Không có công việc nào gán NVTQ từ chu kỳ trước"
                  : "Bạn không phối hợp công việc nào trong chu kỳ này"}
              </Typography>
            </Box>
          )}

          {/* Has Data - NEW MINIMAL TABLE */}
          {!isLoading && !error && total > 0 && (
            <>
              {/* ✨ NEW: Filter ButtonGroup */}
              <Box sx={{ mb: 2 }}>
                <ButtonGroup size="small" fullWidth>
                  <Button
                    variant={filterStatus === "all" ? "contained" : "outlined"}
                    onClick={() => setFilterStatus("all")}
                  >
                    Tất cả ({filterCounts.all})
                  </Button>
                  <Button
                    variant={filterStatus === "late" ? "contained" : "outlined"}
                    onClick={() => setFilterStatus("late")}
                    color={filterStatus === "late" ? "error" : "inherit"}
                  >
                    Trễ ({filterCounts.late})
                  </Button>
                  <Button
                    variant={
                      filterStatus === "active" ? "contained" : "outlined"
                    }
                    onClick={() => setFilterStatus("active")}
                    color={filterStatus === "active" ? "info" : "inherit"}
                  >
                    Đang làm ({filterCounts.active})
                  </Button>
                  <Button
                    variant={
                      filterStatus === "completed" ? "contained" : "outlined"
                    }
                    onClick={() => setFilterStatus("completed")}
                    color={filterStatus === "completed" ? "success" : "inherit"}
                  >
                    Hoàn ({filterCounts.completed})
                  </Button>
                </ButtonGroup>
              </Box>

              {/* Detailed Task Table - 7-8 Columns */}
              <TableContainer sx={{ maxHeight: 350, overflowX: "auto" }}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell width="10%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Mã
                        </Typography>
                      </TableCell>
                      <TableCell width="20%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Tiêu đề
                        </Typography>
                      </TableCell>
                      <TableCell width="20%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Mô tả
                        </Typography>
                      </TableCell>
                      <TableCell width="13%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Trạng thái
                        </Typography>
                      </TableCell>
                      <TableCell width="13%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Tiến độ
                        </Typography>
                      </TableCell>
                      <TableCell width="9%" sx={{ py: 1 }}>
                        <Typography
                          variant="caption"
                          fontWeight={600}
                          color="text.secondary"
                        >
                          Hạn
                        </Typography>
                      </TableCell>
                      {title === "Công việc khác" && (
                        <TableCell width="10%" sx={{ py: 1 }}>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            color="text.secondary"
                          >
                            Phân loại
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell width="5%" align="center" sx={{ py: 1 }}>
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
                    {paginatedTasks.map((task) => {
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
                          {/* Column 1: Mã CV */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
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
                                }}
                              >
                                {statusInfo.icon}
                              </Box>
                              <Typography variant="caption" fontWeight={600}>
                                {task.MaCongViec}
                              </Typography>
                            </Stack>
                          </TableCell>

                          {/* Column 2: Tiêu đề */}
                          <TableCell sx={{ py: 1.5 }}>
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
                            {/* Show metadata */}
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              flexWrap="wrap"
                              mt={0.5}
                            >
                              {task.SoGioTre > 0 && (
                                <Typography
                                  variant="caption"
                                  color="error.main"
                                  fontWeight={600}
                                >
                                  Trễ {task.SoGioTre}h
                                </Typography>
                              )}
                              {showNguoiChinh && task.NguoiChinhProfile && (
                                <>
                                  {task.SoGioTre > 0 && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      •
                                    </Typography>
                                  )}
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
                          </TableCell>

                          {/* Column 3: Mô tả */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Tooltip title={task.MoTa || "Không có mô tả"}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                  lineHeight: 1.4,
                                }}
                              >
                                {task.MoTa || "—"}
                              </Typography>
                            </Tooltip>
                          </TableCell>

                          {/* Column 4: Trạng thái */}
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

                          {/* Column 5: Tiến độ */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Box>
                              <Typography
                                variant="caption"
                                fontWeight={600}
                                color="text.secondary"
                              >
                                {task.PhanTramTienDoTong || 0}%
                              </Typography>
                              <LinearProgress
                                variant="determinate"
                                value={task.PhanTramTienDoTong || 0}
                                sx={{
                                  height: 4,
                                  borderRadius: 2,
                                  bgcolor: "grey.200",
                                  mt: 0.5,
                                  "& .MuiLinearProgress-bar": {
                                    bgcolor:
                                      (task.PhanTramTienDoTong || 0) >= 80
                                        ? "success.main"
                                        : (task.PhanTramTienDoTong || 0) >= 50
                                        ? "warning.main"
                                        : "error.main",
                                  },
                                }}
                              />
                            </Box>
                          </TableCell>

                          {/* Column 6: Hạn chót */}
                          <TableCell sx={{ py: 1.5 }}>
                            <Typography
                              variant="caption"
                              component="div"
                              color={
                                isOverdue ? "error.main" : "text.secondary"
                              }
                              fontWeight={isOverdue ? 600 : 400}
                            >
                              {formatDateWithTooltip(task.NgayHetHan)}
                            </Typography>
                          </TableCell>

                          {/* Column 7: Phân loại (conditional for "Công việc khác") */}
                          {title === "Công việc khác" && (
                            <TableCell align="center" sx={{ py: 1.5 }}>
                              {task.FlagNVTQKhac ? (
                                <Chip
                                  label="Đã xác nhận"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                    bgcolor: "warning.lighter",
                                    color: "warning.dark",
                                    border: "1px solid",
                                    borderColor: "warning.main",
                                    "& .MuiChip-label": { px: 1 },
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Chưa phân loại"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.65rem",
                                    fontWeight: 600,
                                    bgcolor: "grey.100",
                                    color: "text.secondary",
                                    border: "1px solid",
                                    borderColor: "grey.300",
                                    "& .MuiChip-label": { px: 1 },
                                  }}
                                />
                              )}
                            </TableCell>
                          )}

                          {/* Column 8: Actions */}
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

              {/* ✨ NEW: TablePagination */}
              <TablePagination
                component="div"
                count={filteredTasks.length}
                page={page}
                onPageChange={(e, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25]}
                labelRowsPerPage="Hiển thị:"
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} trong ${count !== -1 ? count : `hơn ${to}`}`
                }
                sx={{
                  borderTop: 1,
                  borderColor: "divider",
                  ".MuiTablePagination-displayedRows": {
                    fontSize: "0.85rem",
                  },
                }}
              />

              {/* ✨ NEW: Summary Statistics Footer */}
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  bgcolor: "grey.50",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Stack
                  direction="row"
                  spacing={3}
                  justifyContent="space-around"
                  alignItems="center"
                >
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} color="primary">
                      {total}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tổng công việc
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box textAlign="center">
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="success.main"
                    >
                      {completed}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hoàn thành (
                      {total > 0 ? Math.round((completed / total) * 100) : 0}%)
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box textAlign="center">
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      color="error.main"
                    >
                      {late}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Trễ hạn
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem />
                  <Box textAlign="center">
                    <Typography variant="h6" fontWeight={700} color="info.main">
                      {active}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Đang làm
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default CongViecCompactCard;
